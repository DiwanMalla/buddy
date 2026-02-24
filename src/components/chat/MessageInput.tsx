"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, X, Loader2 } from "lucide-react";
import { useCurrentRoomMember } from "@/hooks/useCurrentRoomMember";

interface Props {
  roomId: Id<"rooms">;
  channelId?: Id<"channels">;
}

export default function MessageInput({ roomId, channelId }: Props) {
  const member = useCurrentRoomMember();
  const sendMessage = useMutation(api.messages.sendMessage);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);

  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!content.trim() && !file) return;
    if (!member) return;

    setSending(true);
    try {
      let fileId: Id<"_storage"> | undefined;
      let fileName: string | undefined;

      if (file) {
        const uploadUrl = await generateUploadUrl(
          member.type === "guest"
            ? { roomId, memberId: member.memberId }
            : {}
        );
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        fileId = storageId;
        fileName = file.name;
      }

      await sendMessage({
        roomId,
        channelId,
        content: content.trim() || (fileName ?? "Shared a file"),
        type: file ? "file" : "text",
        fileId,
        fileName,
        senderId: member.memberId,
        senderName: member.memberName,
        senderImage: member.type === "clerk" ? member.memberImage : undefined,
      });

      setContent("");
      setFile(null);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border/40 p-4">
      {file && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-sm">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{file.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-5 w-5"
            onClick={() => setFile(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Textarea
          placeholder={member ? "Type a message..." : "Sign in or join to chat"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="min-h-[40px] max-h-[120px] resize-none"
        />
        <Button
          size="icon"
          className="shrink-0"
          onClick={handleSend}
          disabled={sending || !member || (!content.trim() && !file)}
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
