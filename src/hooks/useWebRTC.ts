"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface UseWebRTCOptions {
  callId: Id<"calls"> | null;
  memberId: string;
  isInitiator: boolean;
  callType: "audio" | "video";
}

export function useWebRTC({
  callId,
  memberId,
  isInitiator,
  callType,
}: UseWebRTCOptions) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const processedCandidatesRef = useRef(new Set<string>());

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const addIceCandidate = useMutation(api.calls.addIceCandidate);
  const answerCall = useMutation(api.calls.answerCall);
  const endCallMut = useMutation(api.calls.endCall);

  const call = useQuery(api.calls.getCall, callId ? { callId } : "skip");
  const remoteCandidates = useQuery(
    api.calls.getIceCandidates,
    callId ? { callId, excludeFromId: memberId } : "skip"
  );

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    processedCandidatesRef.current.clear();
    setIsConnected(false);
  }, []);

  const startLocalStream = useCallback(async () => {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: callType === "video",
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, [callType]);

  const createPeerConnection = useCallback(
    (stream: MediaStream) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && callId) {
          addIceCandidate({
            callId,
            fromId: memberId,
            candidate: JSON.stringify(event.candidate),
          });
        }
      };

      pc.onconnectionstatechange = () => {
        setIsConnected(
          pc.connectionState === "connected"
        );
      };

      return pc;
    },
    [callId, memberId, addIceCandidate]
  );

  // Handle answer from receiver (initiator watches for call.answer)
  useEffect(() => {
    if (!isInitiator || !call?.answer || !pcRef.current) return;
    const pc = pcRef.current;
    if (pc.signalingState === "have-local-offer") {
      const answer = JSON.parse(call.answer);
      pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }, [isInitiator, call?.answer]);

  // Process remote ICE candidates
  useEffect(() => {
    if (!remoteCandidates || !pcRef.current) return;
    const pc = pcRef.current;
    if (!pc.remoteDescription) return;

    for (const rc of remoteCandidates) {
      if (processedCandidatesRef.current.has(rc._id)) continue;
      processedCandidatesRef.current.add(rc._id);
      const candidate = new RTCIceCandidate(JSON.parse(rc.candidate));
      pc.addIceCandidate(candidate);
    }
  }, [remoteCandidates]);

  // Receiver: setup when call arrives with offer
  const acceptIncoming = useCallback(async () => {
    if (!call?.offer || !callId) return;

    const stream = await startLocalStream();
    const pc = createPeerConnection(stream);

    await pc.setRemoteDescription(
      new RTCSessionDescription(JSON.parse(call.offer))
    );
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await answerCall({
      callId,
      answer: JSON.stringify(answer),
    });
  }, [call?.offer, callId, startLocalStream, createPeerConnection, answerCall]);

  // Initiator: create offer
  const startCall = useCallback(async () => {
    const stream = await startLocalStream();
    const pc = createPeerConnection(stream);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    return JSON.stringify(offer);
  }, [startLocalStream, createPeerConnection]);

  const endCall = useCallback(async () => {
    if (callId) {
      await endCallMut({ callId });
    }
    cleanup();
  }, [callId, endCallMut, cleanup]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((prev) => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsVideoOff((prev) => !prev);
  }, []);

  // Cleanup on call end
  useEffect(() => {
    if (call?.status === "ended" || call?.status === "rejected") {
      cleanup();
    }
  }, [call?.status, cleanup]);

  return {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isMuted,
    isVideoOff,
    startCall,
    acceptIncoming,
    endCall,
    toggleMute,
    toggleVideo,
    callStatus: call?.status,
  };
}
