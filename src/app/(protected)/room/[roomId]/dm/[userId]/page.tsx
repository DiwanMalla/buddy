"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import DMMessageList from "@/components/chat/DMMessageList";
import DMInput from "@/components/chat/DMInput";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

export default function DMPage() {
  const params = useParams();
  const roomId = params.roomId as Id<"rooms">;
  const partnerId = params.userId as string;

  const roomMembers = useQuery(
    api.rooms.getRoomMembers,
    roomId ? { roomId } : "skip"
  );
  const partner = roomMembers?.find((m) => m.memberId === partnerId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2">
        {partner ? (
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
      </div>
      <DMMessageList roomId={roomId} otherUserId={partnerId} />
      <DMInput roomId={roomId} receiverId={partnerId} />
    </div>
  );
}
