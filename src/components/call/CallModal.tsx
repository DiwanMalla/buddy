"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface CallModalProps {
  callId: Id<"calls">;
  memberId: string;
  isInitiator: boolean;
  callType: "audio" | "video";
  partnerName: string;
  onClose: () => void;
}

export default function CallModal({
  callId,
  memberId,
  callType,
  partnerName,
  onClose,
}: CallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processedCandidatesRef = useRef(new Set<string>());

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const answerCallMut = useMutation(api.calls.answerCall);
  const addIceCandidateMut = useMutation(api.calls.addIceCandidate);
  const endCallMut = useMutation(api.calls.endCall);

  const call = useQuery(api.calls.getCall, { callId });
  const remoteCandidates = useQuery(api.calls.getIceCandidates, {
    callId,
    excludeFromId: memberId,
  });

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
  }, []);

  // Accept: get media, create PC, set remote offer, create answer, send to Convex
  useEffect(() => {
    if (!call?.offer) return;
    const offerSdp = call.offer;
    let cancelled = false;

    async function accept() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addIceCandidateMut({
            callId,
            fromId: memberId,
            candidate: JSON.stringify(event.candidate),
          });
        }
      };

      pc.onconnectionstatechange = () => {
        setIsConnected(pc.connectionState === "connected");
      };

      await pc.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(offerSdp))
      );
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await answerCallMut({ callId, answer: JSON.stringify(answer) });
    }

    accept();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.offer]);

  // Process remote ICE candidates
  useEffect(() => {
    if (!remoteCandidates || !pcRef.current?.remoteDescription) return;
    for (const rc of remoteCandidates) {
      if (processedCandidatesRef.current.has(rc._id)) continue;
      processedCandidatesRef.current.add(rc._id);
      pcRef.current.addIceCandidate(new RTCIceCandidate(JSON.parse(rc.candidate)));
    }
  }, [remoteCandidates]);

  // Handle call ended
  useEffect(() => {
    if (call?.status === "ended") {
      cleanup();
      onClose();
    }
  }, [call?.status, cleanup, onClose]);

  const handleEnd = async () => {
    await endCallMut({ callId });
    cleanup();
    onClose();
  };

  const toggleMute = () => {
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((p) => !p);
  };

  const toggleVideo = () => {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsVideoOff((p) => !p);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black">
      <div className="flex h-full w-full flex-col items-center justify-between bg-background sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl sm:shadow-2xl">
        <h3 className="py-3 text-center text-lg font-semibold sm:py-4">
          {isConnected
            ? `In call with ${partnerName}`
            : `Connecting to ${partnerName}...`}
        </h3>

        <div className="relative flex flex-1 w-full min-h-0">
          {callType === "video" ? (
            <>
              <div className="relative flex-1 overflow-hidden bg-muted sm:mx-4 sm:rounded-xl">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
                {!isConnected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                      {partnerName[0]}
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute bottom-3 right-3 aspect-video w-24 overflow-hidden rounded-lg border-2 border-background shadow-lg sm:w-40">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              </div>
            </>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-4 py-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-4xl font-bold text-primary">
                {partnerName[0]}
              </div>
              <p className="text-sm text-muted-foreground">
                {isConnected ? "Audio call connected" : "Connecting..."}
              </p>
              <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
              <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 py-4 sm:py-6">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className="h-14 w-14 rounded-full sm:h-12 sm:w-12"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          {callType === "video" && (
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              className="h-14 w-14 rounded-full sm:h-12 sm:w-12"
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
          )}
          <Button
            variant="destructive"
            size="icon"
            className="h-14 w-14 rounded-full sm:h-12 sm:w-12"
            onClick={handleEnd}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
