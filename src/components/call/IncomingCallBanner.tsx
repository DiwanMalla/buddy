"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentRoomMember } from "@/hooks/useCurrentRoomMember";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useState } from "react";
import CallModal from "./CallModal";

export default function IncomingCallBanner() {
  const member = useCurrentRoomMember();
  const incoming = useQuery(
    api.calls.getIncomingCall,
    member ? { receiverId: member.memberId } : "skip"
  );
  const rejectCall = useMutation(api.calls.rejectCall);
  const [accepted, setAccepted] = useState<string | null>(null);

  if (accepted && incoming) {
    return (
      <CallModal
        callId={incoming._id}
        memberId={member!.memberId}
        isInitiator={false}
        callType={incoming.type}
        partnerName={incoming.callerName}
        onClose={() => setAccepted(null)}
      />
    );
  }

  if (!incoming || !member) return null;

  return (
    <div className="fixed left-1/2 top-20 z-90 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-2xl animate-in slide-in-from-top">
      <div className="flex items-center gap-2">
        {incoming.type === "video" ? (
          <Video className="h-5 w-5 text-primary" />
        ) : (
          <Phone className="h-5 w-5 text-primary" />
        )}
        <span className="text-sm font-medium">
          {incoming.callerName} is calling ({incoming.type})
        </span>
      </div>
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => setAccepted(incoming._id)}
      >
        <Phone className="mr-1 h-4 w-4" />
        Accept
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => rejectCall({ callId: incoming._id })}
      >
        <PhoneOff className="mr-1 h-4 w-4" />
        Decline
      </Button>
    </div>
  );
}
