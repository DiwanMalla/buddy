"use client";

import { useParams } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { MessageSquare } from "lucide-react";

export default function RoomGroupChat() {
  const params = useParams();
  const roomId = params.roomId as Id<"rooms">;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Group Chat</h2>
      </div>
      <MessageList roomId={roomId} />
      <MessageInput roomId={roomId} />
    </div>
  );
}
