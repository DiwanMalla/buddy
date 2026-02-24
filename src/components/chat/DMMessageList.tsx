"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Download, X as XIcon } from "lucide-react";
import { useCurrentRoomMember } from "@/hooks/useCurrentRoomMember";
import { cn } from "@/lib/utils";

interface Props {
  roomId: Id<"rooms">;
  otherUserId: string;
}

const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|svg|bmp)$/i;

function isImageFile(name?: string) {
  return name ? IMAGE_EXTS.test(name) : false;
}

function InlineMedia({ fileId, fileName }: { fileId: Id<"_storage">; fileName?: string }) {
  const url = useQuery(api.messages.getFileUrl, { fileId });
  const [lightbox, setLightbox] = useState(false);

  if (!url) return null;

  if (isImageFile(fileName)) {
    return (
      <>
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="mt-1 block overflow-hidden rounded-lg"
        >
          <img
            src={url}
            alt={fileName || "Image"}
            className="max-h-60 max-w-full rounded-lg object-cover"
            loading="lazy"
          />
        </button>
        {lightbox && (
          <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute right-4 top-4 rounded-full bg-background/80 p-2"
              onClick={() => setLightbox(false)}
            >
              <XIcon className="h-5 w-5" />
            </button>
            <img
              src={url}
              alt={fileName || "Image"}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>
        )}
      </>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-sm transition-colors hover:bg-muted"
    >
      <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{fileName || "File"}</span>
    </a>
  );
}

export default function DMMessageList({ roomId, otherUserId }: Props) {
  const member = useCurrentRoomMember();
  const messages = useQuery(
    api.directMessages.getDirectMessages,
    member
      ? { roomId, otherUserId, myId: member.memberId }
      : "skip"
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
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
            No messages yet. Say hi!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mt-auto" />
      <div className="space-y-4 p-4">
        {messages.map((msg) => {
          const isOwn = msg.senderId === member?.memberId;
          const isFile = msg.type === "file" && msg.fileId;
          const hasTextContent = isFile
            ? msg.content !== msg.fileName && msg.content !== "Shared a file"
            : true;

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
                className={cn(
                  "flex max-w-[70%] flex-col",
                  isOwn && "items-end"
                )}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium">{msg.senderName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(msg._creationTime, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {hasTextContent && (
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
                )}
                {isFile && (
                  <InlineMedia fileId={msg.fileId!} fileName={msg.fileName} />
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
