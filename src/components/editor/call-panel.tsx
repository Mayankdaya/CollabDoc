
"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { FoundUser } from './share-dialog';

interface CallPanelProps {
    callState: {
        status: 'idle' | 'outgoing' | 'incoming' | 'connected';
        type: 'voice' | 'video' | null;
        peer: FoundUser | null;
    };
    onEndCall: () => void;
    onAcceptCall: () => void;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
}

export function CallPanel({ callState, onEndCall, onAcceptCall, localStream, remoteStream }: CallPanelProps) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);
    
    const getCallStatusText = () => {
        switch (callState.status) {
            case 'outgoing': return `Calling ${callState.peer?.displayName}...`;
            case 'incoming': return `Incoming ${callState.type} call...`;
            case 'connected': return `Connected`;
            default: return '...';
        }
    };

    if (callState.status === 'idle') return null;

    return (
        <motion.div
            drag
            dragMomentum={false}
            className="fixed top-24 right-8 z-50 w-80 rounded-lg border bg-background/80 backdrop-blur-md shadow-2xl cursor-grab active:cursor-grabbing"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center justify-between p-3 border-b">
                <div className='flex items-center gap-2'>
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{callState.peer?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                         <p className="text-sm font-semibold">{callState.peer?.displayName || 'Unknown User'}</p>
                         <p className="text-xs text-muted-foreground">{getCallStatusText()}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEndCall}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            
            <div className="relative aspect-video bg-black">
                {/* Remote Video */}
                <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
                
                {/* Local Video */}
                {localStream && callState.type === 'video' && (
                    <video ref={localVideoRef} className="absolute bottom-2 right-2 w-24 h-32 object-cover border-2 border-white rounded-md" autoPlay muted playsInline />
                )}

                {/* Placeholder when not connected or no video */}
                {(!remoteStream || callState.type === 'voice') && (
                     <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-4 gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-3xl">{callState.peer?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    </div>
                )}
            </div>
            
            {callState.status === 'incoming' ? (
                <div className="flex justify-around items-center gap-2 p-3">
                     <Button variant="destructive" size="icon" onClick={onEndCall} className='rounded-full h-12 w-12'>
                        <PhoneOff />
                    </Button>
                    <Button variant="default" size="icon" onClick={onAcceptCall} className='rounded-full h-12 w-12 bg-green-600 hover:bg-green-700'>
                        <Phone />
                    </Button>
                </div>
            ) : (
                <div className="flex justify-center items-center gap-2 p-3">
                    <Button variant={"outline"} size="icon">
                        <Mic />
                    </Button>
                    {callState.type === 'video' && (
                        <Button variant={"outline"} size="icon">
                            <Video />
                        </Button>
                    )}
                    <Button variant="destructive" size="icon" onClick={onEndCall}>
                        <PhoneOff />
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
