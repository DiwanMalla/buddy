"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import DMMessageList from "@/components/chat/DMMessageList";
import DMInput from "@/components/chat/DMInput";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, StickyNote, Phone, Video } from "lucide-react";
import { useCurrentRoomMember } from "@/hooks/useCurrentRoomMember";
import CallModal from "@/components/call/CallModal";

export default function DMPage() {
  const params = useParams();
  const roomId = params.roomId as Id<"rooms">;
  const partnerId = params.userId as string;
  const member = useCurrentRoomMember();

  const roomMembers = useQuery(
    api.rooms.getRoomMembers,
    roomId ? { roomId } : "skip"
  );
  const partner = roomMembers?.find((m) => m.memberId === partnerId);
  const isSelf = member && member.memberId === partnerId;

  const initiateCall = useMutation(api.calls.initiateCall);
  const [activeCallId, setActiveCallId] = useState<Id<"calls"> | null>(null);
  const [activeCallType, setActiveCallType] = useState<"audio" | "video">("audio");

  const handleStartCall = async (type: "audio" | "video") => {
    if (!member) return;

    setActiveCallType(type);

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    pc.close();
    stream.getTracks().forEach((t) => t.stop());

    const callId = await initiateCall({
      roomId,
      callerId: member.memberId,
      callerName: member.memberName,
      receiverId: partnerId,
      type,
      offer: JSON.stringify(offer),
    });

    setActiveCallId(callId);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2">
        {isSelf ? (
          <>
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Notes to Self</h2>
          </>
        ) : partner ? (
          <>
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {partner.name[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-sm font-semibold">{partner.name}</h2>
          </>
        ) : (
          <>
            <User className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Direct Message</h2>
          </>
        )}
        {!isSelf && member && (
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleStartCall("audio")}
              title="Audio call"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleStartCall("video")}
              title="Video call"
            >
              <Video className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {activeCallId && member && (
        <CallModal
          callId={activeCallId}
          memberId={member.memberId}
          isInitiator={true}
          callType={activeCallType}
          partnerName={partner?.name ?? "User"}
          onClose={() => setActiveCallId(null)}
        />
      )}

      <DMMessageList roomId={roomId} otherUserId={partnerId} />
      <DMInput roomId={roomId} receiverId={partnerId} />
    </div>
  );
}
