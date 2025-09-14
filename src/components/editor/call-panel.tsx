
"use client";

import { useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Button } from '../ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';

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

    useEffect(() => {
        // Simulate call connection
        const timer = setTimeout(() => {
            setCallStatus('Connected');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);
    
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
            {callState.type === 'video' && !isVideoOff && (
                <div className="aspect-video bg-black flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Video Placeholder</p>
                </div>
            )}
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
