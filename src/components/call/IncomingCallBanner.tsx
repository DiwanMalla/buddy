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
    <div className="fixed inset-x-3 top-20 z-90 mx-auto max-w-md rounded-xl border border-border bg-background p-4 shadow-2xl animate-in slide-in-from-top sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          {incoming.type === "video" ? (
            <Video className="h-5 w-5 shrink-0 text-primary" />
          ) : (
            <Phone className="h-5 w-5 shrink-0 text-primary" />
          )}
          <span className="text-sm font-medium">
            {incoming.callerName} is calling ({incoming.type})
          </span>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 sm:flex-none"
            onClick={() => setAccepted(incoming._id)}
          >
            <Phone className="mr-1 h-4 w-4" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1 sm:flex-none"
            onClick={() => rejectCall({ callId: incoming._id })}
          >
            <PhoneOff className="mr-1 h-4 w-4" />
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}
