
"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Move } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Card } from '../ui/card';

interface VideoCallPanelProps {
  peerStreams: MediaStream[];
  localStream?: MediaStream;
  onCallEnd: () => void;
  toggleMedia: (type: 'audio' | 'video') => void;
}

const PeerVideo = ({ stream }: { stream: MediaStream }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
        ref.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={ref} autoPlay className="w-full h-full object-cover rounded-md" />;
};

export default function VideoCallPanel({ peerStreams, localStream, onCallEnd, toggleMedia }: VideoCallPanelProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        setVideoOff(!videoTrack.enabled);
      }
      const audioTrack = localStream.getAudioTracks()[0];
       if (audioTrack) {
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  const handleToggleMute = () => {
    toggleMedia('audio');
    setIsMuted(prev => !prev);
  }

  const handleToggleVideo = () => {
    toggleMedia('video');
    setVideoOff(prev => !prev);
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-4 right-4 z-50 flex cursor-grab flex-col gap-2 rounded-lg border border-white/20 bg-black/50 p-3 shadow-2xl backdrop-blur-xl"
    >
        <Card className="w-64 h-48 relative overflow-hidden bg-black">
            <video ref={localVideoRef} autoPlay muted className={cn("w-full h-full object-cover", videoOff && "hidden")} />
            {videoOff && <div className="w-full h-full flex items-center justify-center text-muted-foreground">Camera is off</div>}
            <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-1 rounded">You</div>
        </Card>

        {peerStreams.map((stream) => (
             <Card key={stream.id} className="w-64 h-48 relative overflow-hidden bg-black">
                <PeerVideo stream={stream} />
             </Card>
        ))}

      <div className="flex justify-center gap-2 rounded-full border border-white/10 bg-black/30 p-2">
        <Button variant="outline" size="icon" className="rounded-full" onClick={handleToggleMute}>
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button variant="outline" size="icon" className="rounded-full" onClick={handleToggleVideo}>
            {videoOff ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
        </Button>
        <Button variant="destructive" size="icon" className="rounded-full" onClick={onCallEnd}>
          <PhoneOff className="h-5 w-5" />
        </Button>
        <div className="cursor-move p-2 text-muted-foreground">
            <Move className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
