
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelf, useOthers, useBroadcastEvent, useRoom } from '@/liveblocks.config';
import { useToast } from './use-toast';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export function useCall() {
    const self = useSelf();
    const others = useOthers();
    const broadcast = useBroadcastEvent();
    const { toast } = useToast();
    const room = useRoom();

    const [isCallActive, setIsCallActive] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<{ stream: MediaStream; connectionId: number }[]>([]);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const peerConnections = useRef<Map<number, RTCPeerConnection>>(new Map());

    const startCall = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            setIsCallActive(true);
            setIsAudioEnabled(true);
            setIsVideoEnabled(true);
            broadcast({ type: 'user-joined-call', connectionId: self.connectionId });
        } catch (error) {
            console.error("Error accessing media devices.", error);
            toast({
                variant: 'destructive',
                title: 'Media Access Denied',
                description: 'Please enable camera and microphone permissions.',
            });
        }
    }, [broadcast, self.connectionId, toast]);

    const endCall = useCallback(() => {
        localStream?.getTracks().forEach(track => track.stop());
        setLocalStream(null);
        setIsCallActive(false);
        
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();
        setRemoteStreams([]);
        broadcast({ type: 'user-left-call', connectionId: self.connectionId });
    }, [localStream, broadcast, self.connectionId]);

    const toggleAudio = useCallback(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsAudioEnabled(prev => !prev);
        }
    }, [localStream]);

    const toggleVideo = useCallback(() => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoEnabled(prev => !prev);
        }
    }, [localStream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isCallActive) {
                endCall();
            }
        };
    }, [isCallActive, endCall]);
    
    // Main WebRTC Logic
    useEffect(() => {
        if (!isCallActive || !localStream || !self) return;

        const handleNewUser = (connectionId: number) => {
            if (peerConnections.current.has(connectionId)) return;

            const pc = new RTCPeerConnection(ICE_SERVERS);
            peerConnections.current.set(connectionId, pc);

            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

            pc.onicecandidate = event => {
                if (event.candidate) {
                    broadcast({ type: 'ice-candidate', candidate: event.candidate, targetId: connectionId, fromId: self.connectionId });
                }
            };
            
            pc.ontrack = event => {
                setRemoteStreams(prev => {
                    if (prev.some(s => s.connectionId === connectionId)) return prev;
                    return [...prev, { stream: event.streams[0], connectionId }];
                });
            };

            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    broadcast({ type: 'offer', offer: pc.localDescription, targetId: connectionId, fromId: self.connectionId });
                });
        };
        
        const handleUserLeft = (connectionId: number) => {
            const pc = peerConnections.current.get(connectionId);
            if (pc) {
                pc.close();
                peerConnections.current.delete(connectionId);
            }
            setRemoteStreams(prev => prev.filter(s => s.connectionId !== connectionId));
        };
        
        // Handle existing users in the call when we join
        others.forEach(other => handleNewUser(other.connectionId));
        
        // Handle signaling messages from other users
        const unsubscribe = room.events.subscribe(({ event, connectionId }) => {
            switch(event.type) {
                 case 'user-joined-call':
                    if (event.connectionId !== self.connectionId) {
                       handleNewUser(event.connectionId);
                    }
                    break;
                case 'user-left-call':
                     if (event.connectionId !== self.connectionId) {
                        handleUserLeft(event.connectionId);
                    }
                    break;
                case 'offer':
                    if (event.targetId === self.connectionId) {
                        const pc = new RTCPeerConnection(ICE_SERVERS);
                        peerConnections.current.set(event.fromId, pc);
                        
                        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
                        
                        pc.onicecandidate = e => {
                           if (e.candidate) {
                               broadcast({ type: 'ice-candidate', candidate: e.candidate, targetId: event.fromId, fromId: self.connectionId });
                           }
                        };
                        
                        pc.ontrack = e => {
                             setRemoteStreams(prev => {
                                if (prev.some(s => s.connectionId === event.fromId)) return prev;
                                return [...prev, { stream: e.streams[0], connectionId: event.fromId }];
                            });
                        };
                        
                        pc.setRemoteDescription(new RTCSessionDescription(event.offer))
                            .then(() => pc.createAnswer())
                            .then(answer => pc.setLocalDescription(answer))
                            .then(() => {
                                broadcast({ type: 'answer', answer: pc.localDescription, targetId: event.fromId, fromId: self.connectionId });
                            });
                    }
                    break;
                case 'answer':
                    if (event.targetId === self.connectionId) {
                       const pc = peerConnections.current.get(event.fromId);
                       pc?.setRemoteDescription(new RTCSessionDescription(event.answer));
                    }
                    break;
                case 'ice-candidate':
                     if (event.targetId === self.connectionId) {
                        const pc = peerConnections.current.get(event.fromId);
                        pc?.addIceCandidate(new RTCIceCandidate(event.candidate));
                     }
                    break;
            }
        });
        
        return () => unsubscribe();

    }, [isCallActive, localStream, self, others, broadcast, room.events]);


    return {
        isCallActive,
        localStream,
        remoteStreams,
        startCall,
        endCall,
        toggleAudio,
        toggleVideo,
        isAudioEnabled,
        isVideoEnabled
    };
}
