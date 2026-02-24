"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import FileList from "@/components/chat/FileList";
import { Hash, MessageSquare, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentRoomMember } from "@/hooks/useCurrentRoomMember";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ChannelPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as Id<"rooms">;
  const channelId = params.channelId as Id<"channels">;
  const [tab, setTab] = useState<"chat" | "files">("chat");

  const channel = useQuery(api.channels.getChannel, { channelId });
  const room = useQuery(api.rooms.getRoomById, { roomId });
  const deleteChannel = useMutation(api.channels.deleteChannel);
  const member = useCurrentRoomMember();
  const isAdmin = member && room && room.createdBy === member.memberId;

  const handleDelete = async () => {
    if (channel?.name === "general") return;
    if (!confirm("Delete this channel? All messages will be lost.")) return;
    await deleteChannel({ channelId });
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">
          {channel?.name ?? "Loading..."}
        </h2>
        {channel?.description && (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            &mdash; {channel.description}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setTab("chat")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
              tab === "chat"
                ? "bg-muted font-medium"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <MessageSquare className="h-3 w-3" />
            Chat
          </button>
          <button
            onClick={() => setTab("files")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
              tab === "files"
                ? "bg-muted font-medium"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Paperclip className="h-3 w-3" />
            Files
          </button>

          {isAdmin && channel?.name !== "general" && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 h-7 w-7 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {tab === "chat" ? (
        <>
          <MessageList roomId={roomId} channelId={channelId} />
          <MessageInput roomId={roomId} channelId={channelId} />
        </>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <FileList roomId={roomId} channelId={channelId} />
        </div>
      )}
    </div>
  );
}
