"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { FileIcon, Download, Image, FileText, File } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  roomId: Id<"rooms">;
  channelId?: Id<"channels">;
}

function FileIcon2({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    return <Image className="h-5 w-5 text-blue-500" />;
  }
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) {
    return <FileText className="h-5 w-5 text-orange-500" />;
  }
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function FileRow({
  fileId,
  fileName,
  senderName,
  createdAt,
}: {
  fileId: Id<"_storage">;
  fileName: string;
  senderName: string;
  createdAt: number;
}) {
  const url = useQuery(api.files.getFileUrl, { fileId });

  return (
    <a
      href={url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-border/40 p-3 transition-colors hover:bg-muted/50"
    >
      <FileIcon2 name={fileName} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{fileName}</p>
        <p className="text-xs text-muted-foreground">
          Shared by {senderName} &middot;{" "}
          {formatDistanceToNow(createdAt, { addSuffix: true })}
        </p>
      </div>
      <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  );
}

export default function FileList({ roomId, channelId }: Props) {
  const files = channelId
    ? useQuery(api.files.getChannelFiles, { roomId, channelId })
    : useQuery(api.files.getRoomFiles, { roomId });

  if (!files) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <FileIcon className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No files shared yet. Use the attach button in chat to share files.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {files.map((f) => (
        <FileRow
          key={f._id}
          fileId={f.fileId!}
          fileName={f.fileName ?? "File"}
          senderName={f.senderName}
          createdAt={f._creationTime}
        />
      ))}
    </div>
  );
}
