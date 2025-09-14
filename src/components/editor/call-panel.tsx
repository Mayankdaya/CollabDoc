
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface CallPanelProps {
    callState: {
        active: boolean;
        type: 'voice' | 'video' | null;
        user: { displayName?: string } | null;
    };
    onEndCall: () => void;
}

export function CallPanel({ callState, onEndCall }: CallPanelProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callStatus, setCallStatus] = useState('Calling...');
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!callState.active) return;
        
        // Simulate call connection
        const timer = setTimeout(() => {
            setCallStatus('Connected');
        }, 3000);

        const getCameraPermission = async () => {
          if (callState.type === 'voice') {
            setHasCameraPermission(true); // Don't need camera for voice
            return;
          }
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setHasCameraPermission(true);

            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings to use video calls.',
            });
          }
        };

        getCameraPermission();

        return () => {
          clearTimeout(timer);
          // Stop media tracks when call ends
          if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
          }
        };
    }, [callState.active, callState.type, toast]);
    
    // Reset video state if it's a voice call
    useEffect(() => {
        if (callState.type === 'voice') {
            setIsVideoOff(true);
        } else {
            setIsVideoOff(false);
        }
    }, [callState.type])

    if (!callState.active) return null;

    return (
        <motion.div
            drag
            dragMomentum={false}
            className="fixed top-24 right-8 z-50 w-80 rounded-lg border bg-background/80 backdrop-blur-md shadow-2xl cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-center justify-between p-3 border-b">
                <div className='flex items-center gap-2'>
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{callState.user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                         <p className="text-sm font-semibold">{callState.user?.displayName || 'Unknown User'}</p>
                         <p className="text-xs text-muted-foreground">{callStatus}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEndCall}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            
            <div className="relative">
                <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted={true} playsInline />
                {(isVideoOff || hasCameraPermission === false) && callState.type === 'video' && (
                     <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-4 gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-3xl">{callState.user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                         {hasCameraPermission === false && (
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access to use this feature.
                                </AlertDescription>
                            </Alert>
                         )}
                    </div>
                )}
            </div>
            
             <div className="flex justify-center items-center gap-2 p-3">
                <Button variant={isMuted ? "destructive" : "outline"} size="icon" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                {callState.type === 'video' && (
                     <Button variant={isVideoOff ? "destructive" : "outline"} size="icon" onClick={() => setIsVideoOff(!isVideoOff)}>
                        {isVideoOff ? <VideoOff /> : <Video />}
                    </Button>
                )}
                <Button variant="destructive" size="icon" onClick={onEndCall}>
                    <PhoneOff />
                </Button>
            </div>
        </motion.div>
    );
}
