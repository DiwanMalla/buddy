"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
} from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { Id } from "../../../convex/_generated/dataModel";

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
  isInitiator,
  callType,
  partnerName,
  onClose,
}: CallModalProps) {
  const {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isMuted,
    isVideoOff,
    acceptIncoming,
    endCall,
    toggleMute,
    toggleVideo,
    callStatus,
  } = useWebRTC({ callId, memberId, isInitiator, callType });

  const hasAccepted = useRef(false);

  useEffect(() => {
    if (!isInitiator && !hasAccepted.current) {
      hasAccepted.current = true;
      acceptIncoming();
    }
  }, [isInitiator, acceptIncoming]);

  useEffect(() => {
    if (callStatus === "ended" || callStatus === "rejected") {
      onClose();
    }
  }, [callStatus, onClose]);

  const handleEnd = async () => {
    await endCall();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl bg-background p-4 shadow-2xl sm:p-6">
        <h3 className="text-lg font-semibold">
          {isConnected
            ? `In call with ${partnerName}`
            : `Connecting to ${partnerName}...`}
        </h3>

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
                    <div className="h-16 w-16 animate-pulse rounded-full bg-muted-foreground/20" />
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
                {isConnected ? "Audio call connected" : "Connecting..."}
              </p>
              {/* Hidden elements to keep refs alive for audio */}
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
              {isVideoOff ? (
                <VideoOff className="h-5 w-5" />
              ) : (
                <Video className="h-5 w-5" />
              )}
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
