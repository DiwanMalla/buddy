"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { FileIcon, Download } from "lucide-react";
import { useCurrentRoomMember } from "@/hooks/useCurrentRoomMember";
import { cn } from "@/lib/utils";

interface Props {
  roomId: Id<"rooms">;
  channelId?: Id<"channels">;
}

function FileAttachment({ fileId, fileName }: { fileId: Id<"_storage">; fileName?: string }) {
  const url = useQuery(api.messages.getFileUrl, { fileId });

  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-sm transition-colors hover:bg-muted"
    >
      <FileIcon className="h-4 w-4 text-muted-foreground" />
      <span className="truncate">{fileName || "File"}</span>
      <Download className="ml-auto h-3 w-3 text-muted-foreground" />
    </a>
  );
}

export default function MessageList({ roomId, channelId }: Props) {
  const messages = useQuery(api.messages.getMessages, {
    roomId,
    channelId,
  });
  const member = useCurrentRoomMember();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  if (!messages) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.senderId === member?.memberId;
          return (
            <div
              key={msg._id}
              className={cn("flex gap-3", isOwn && "flex-row-reverse")}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={msg.senderImage} />
                <AvatarFallback className="text-xs">
                  {msg.senderName[0]}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn("max-w-[70%]", isOwn && "items-end text-right")}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium">{msg.senderName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(msg._creationTime, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div
                  className={cn(
                    "inline-block rounded-2xl px-4 py-2 text-sm",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {msg.content}
                </div>
                {msg.type === "file" && msg.fileId && (
                  <FileAttachment fileId={msg.fileId} fileName={msg.fileName} />
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
