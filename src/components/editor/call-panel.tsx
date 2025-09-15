
"use client";

import { motion, useDragControls } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, PhoneOff, GripVertical } from "lucide-react";
import React, { useRef, useEffect } from "react";
import { Button } from "../ui/button";

interface CallPanelProps {
    localStream: MediaStream | null;
    remoteStreams: { stream: MediaStream; connectionId: number }[];
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onEndCall: () => void;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
}

const VideoBox = ({ stream }: { stream: MediaStream }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return <video ref={videoRef} autoPlay muted className="w-full h-full object-cover rounded-md bg-black" />;
};


export default function CallPanel({
    localStream,
    remoteStreams,
    onToggleAudio,
    onToggleVideo,
    onEndCall,
    isAudioEnabled,
    isVideoEnabled,
}: CallPanelProps) {
    const dragControls = useDragControls();

    function startDrag(event: React.PointerEvent) {
        dragControls.start(event, { snapToCursor: false });
    }

    return (
        <motion.div
            drag="x"
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            className="absolute top-24 right-4 z-50 w-80 rounded-xl border bg-black/50 backdrop-blur-lg shadow-2xl text-white overflow-hidden"
        >
            <div 
                onPointerDown={startDrag}
                className="flex items-center justify-center p-2 cursor-grab bg-white/10"
            >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="p-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    {localStream && (
                         <div className="aspect-video rounded-md overflow-hidden">
                             <VideoBox stream={localStream} />
                         </div>
                    )}
                    {remoteStreams.map(({ stream, connectionId }) => (
                         <div key={connectionId} className="aspect-video rounded-md overflow-hidden">
                             <VideoBox stream={stream} />
                         </div>
                    ))}
                </div>

                <div className="flex justify-center items-center gap-2 bg-black/30 p-2 rounded-md">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleAudio}
                        className="rounded-full h-12 w-12 hover:bg-white/20"
                    >
                        {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6 text-red-500" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleVideo}
                        className="rounded-full h-12 w-12 hover:bg-white/20"
                    >
                        {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6 text-red-500" />}
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={onEndCall}
                        className="rounded-full h-12 w-12 bg-red-600 hover:bg-red-700"
                    >
                        <PhoneOff className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
