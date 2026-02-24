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

interface Props {
  roomId: Id<"rooms">;
  callerId: string;
  callerName: string;
  receiverId: string;
  partnerName: string;
  callType: "audio" | "video";
  onClose: () => void;
}

export default function OutgoingCallModal({
  roomId,
  callerId,
  callerName,
  receiverId,
  partnerName,
  callType,
  onClose,
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processedCandidatesRef = useRef(new Set<string>());

  const [callId, setCallId] = useState<Id<"calls"> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const initiateCall = useMutation(api.calls.initiateCall);
  const addIceCandidateMut = useMutation(api.calls.addIceCandidate);
  const endCallMut = useMutation(api.calls.endCall);

  const call = useQuery(api.calls.getCall, callId ? { callId } : "skip");
  const remoteCandidates = useQuery(
    api.calls.getIceCandidates,
    callId ? { callId, excludeFromId: callerId } : "skip"
  );

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
  }, []);

  // Initialize: get media, create PC, create offer, send to Convex
  useEffect(() => {
    let cancelled = false;

    async function init() {
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

      pc.onconnectionstatechange = () => {
        setIsConnected(pc.connectionState === "connected");
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const id = await initiateCall({
        roomId,
        callerId,
        callerName,
        receiverId,
        type: callType,
        offer: JSON.stringify(offer),
      });
      if (cancelled) return;
      setCallId(id);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addIceCandidateMut({
            callId: id,
            fromId: callerId,
            candidate: JSON.stringify(event.candidate),
          });
        }
      };
    }

    init();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle answer from receiver
  useEffect(() => {
    if (!call?.answer || !pcRef.current) return;
    const pc = pcRef.current;
    if (pc.signalingState === "have-local-offer") {
      pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(call.answer)));
    }
  }, [call?.answer]);

  // Process remote ICE candidates
  useEffect(() => {
    if (!remoteCandidates || !pcRef.current?.remoteDescription) return;
    for (const rc of remoteCandidates) {
      if (processedCandidatesRef.current.has(rc._id)) continue;
      processedCandidatesRef.current.add(rc._id);
      pcRef.current.addIceCandidate(new RTCIceCandidate(JSON.parse(rc.candidate)));
    }
  }, [remoteCandidates]);

  // Handle call ended/rejected
  useEffect(() => {
    if (call?.status === "ended" || call?.status === "rejected") {
      cleanup();
      onClose();
    }
  }, [call?.status, cleanup, onClose]);

  const handleEnd = async () => {
    if (callId) await endCallMut({ callId });
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

  const statusText = isConnected
    ? `In call with ${partnerName}`
    : call?.status === "ringing"
      ? `Calling ${partnerName}...`
      : `Connecting to ${partnerName}...`;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl bg-background p-4 shadow-2xl sm:p-6">
        <h3 className="text-lg font-semibold">{statusText}</h3>

        <div className="relative flex w-full gap-3">
          {callType === "video" ? (
            <>
              <div className="relative aspect-video flex-1 overflow-hidden rounded-xl bg-muted">
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
              <div className="absolute bottom-3 right-3 aspect-video w-32 overflow-hidden rounded-lg border-2 border-background shadow-lg sm:w-40">
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
            <div className="flex w-full flex-col items-center gap-4 py-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-4xl font-bold text-primary">
                {partnerName[0]}
              </div>
              <p className="text-sm text-muted-foreground">
                {isConnected ? "Audio call connected" : "Ringing..."}
              </p>
              <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
              <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          {callType === "video" && (
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
          )}
          <Button
            variant="destructive"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={handleEnd}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
