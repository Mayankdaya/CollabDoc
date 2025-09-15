
'use client';

import { toast } from "@/hooks/use-toast";

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export type SignalingData = {
  type: 'offer' | 'answer' | 'candidate';
  data: any;
  from: string;
  to: string;
};

export class WebRTCManager {
  public peerConnection: RTCPeerConnection;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onRemoteStream: (stream: MediaStream) => void;
  private sendSignalingMessage: (data: SignalingData) => void;
  private userId: string;

  constructor(
    userId: string,
    onRemoteStream: (stream: MediaStream) => void,
    sendSignalingMessage: (data: SignalingData) => void
  ) {
    this.userId = userId;
    this.peerConnection = new RTCPeerConnection(STUN_SERVERS);
    this.onRemoteStream = onRemoteStream;
    this.sendSignalingMessage = sendSignalingMessage;

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
            type: 'candidate',
            data: event.candidate,
            from: this.userId,
            to: '', // Will be set by the caller
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      const [stream] = event.streams;
      this.remoteStream = stream;
      this.onRemoteStream(stream);
    };
  }

  public async getMediaStream(video: boolean): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio: true,
      });
      this.localStream = stream;
      stream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, stream);
      });
      return stream;
    } catch (error) {
      console.error('Error accessing media devices.', error);
      toast({
          variant: 'destructive',
          title: 'Media Access Error',
          description: 'Could not access your camera or microphone. Please check permissions.'
      })
      throw error;
    }
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  public async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    const remoteDesc = new RTCSessionDescription(answer);
    await this.peerConnection.setRemoteDescription(remoteDesc);
  }

  public async handleCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
        console.error('Error adding received ice candidate', e);
    }
  }

  public close(): void {
    this.peerConnection.close();
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }
     if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
    }
    this.localStream = null;
    this.remoteStream = null;
  }
}
