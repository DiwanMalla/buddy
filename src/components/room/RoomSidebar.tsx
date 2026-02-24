"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Hash,
  MessageSquare,
  Plus,
  Settings,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CreateChannelDialog from "./CreateChannelDialog";
import AdminPanel from "./AdminPanel";
import { useCurrentRoomMember } from "@/hooks/useCurrentRoomMember";

export default function RoomSidebar() {
  const params = useParams();
  const pathname = usePathname();
  const roomId = params.roomId as string;
  const member = useCurrentRoomMember();

  const room = useQuery(api.rooms.getRoomById, {
    roomId: roomId as Id<"rooms">,
  });
  const channels = useQuery(api.channels.getChannels, {
    roomId: roomId as Id<"rooms">,
  });
  const roomMembers = useQuery(api.rooms.getRoomMembers, {
    roomId: roomId as Id<"rooms">,
  });
  const dmPartners = useQuery(
    api.directMessages.getRecentDMPartners,
    member
      ? { roomId: roomId as Id<"rooms">, memberId: member.memberId }
      : "skip"
  );

  const [showChannels, setShowChannels] = useState(true);
  const [showMembers, setShowMembers] = useState(true);
  const [showDMs, setShowDMs] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const isAdmin = member && room && room.createdBy === member.memberId;

  const copyInviteCode = () => {
    if (room?.inviteCode) {
      navigator.clipboard.writeText(room.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="flex h-full w-64 flex-col border-r border-border/40 bg-muted/20">
        <div className="flex items-center justify-between border-b border-border/40 p-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold">
              {room?.name ?? "Loading..."}
            </h2>
            {room?.description && (
              <p className="truncate text-xs text-muted-foreground">
                {room.description}
              </p>
            )}
          </div>
          {isAdmin && room?.createdBy === member?.memberId && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setShowAdmin(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        {room?.inviteCode && (
          <div className="border-b border-border/40 px-4 py-2">
            <button
              onClick={copyInviteCode}
              className="flex w-full items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-xs transition-colors hover:bg-muted"
            >
              <span className="font-mono tracking-wider text-muted-foreground">
                {room.inviteCode}
              </span>
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Group Chat */}
            <Link href={`/room/${roomId}`}>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                  pathname === `/room/${roomId}` && "bg-muted font-medium"
                )}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Group Chat
              </div>
            </Link>

            <Separator className="my-2" />

            {/* Channels */}
            <button
              onClick={() => setShowChannels(!showChannels)}
              className="flex w-full items-center gap-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {showChannels ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              Channels
              {isAdmin && (
                <span className="ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateChannel(true);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </span>
              )}
            </button>

            {showChannels &&
              channels?.map((channel) => (
                <Link
                  key={channel._id}
                  href={`/room/${roomId}/channel/${channel._id}`}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                      pathname.includes(channel._id) && "bg-muted font-medium"
                    )}
                  >
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{channel.name}</span>
                  </div>
                </Link>
              ))}

            <Separator className="my-2" />

            {/* Direct Messages - only for guests with DMs; for now simplified */}
            <button
              onClick={() => setShowDMs(!showDMs)}
              className="flex w-full items-center gap-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {showDMs ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              Direct Messages
            </button>

            {showDMs &&
              dmPartners?.map((partnerId) => {
                const partner = roomMembers?.find((m) => m.memberId === partnerId);
                if (!partner) return null;
                return (
                  <Link
                    key={partnerId}
                    href={`/room/${roomId}/dm/${partnerId}`}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                        pathname.includes(partnerId) && "bg-muted font-medium"
                      )}
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {partner.name[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{partner.name}</span>
                    </div>
                  </Link>
                );
              })}

            <Separator className="my-2" />

            {/* Members */}
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="flex w-full items-center gap-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {showMembers ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              Members
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {roomMembers?.length ?? 0}
              </Badge>
            </button>

            {showMembers &&
              roomMembers?.map((m) => {
                const isMe = member && m.memberId === member.memberId;
                return (
                  <Link key={m.memberId} href={`/room/${roomId}/dm/${m.memberId}`}>
                    <div className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {m.name[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm">
                        {m.name}
                        {isMe && (
                          <span className="ml-1 text-xs text-muted-foreground">(You)</span>
                        )}
                      </span>
                      {room?.createdBy === m.memberId && (
                        <Badge
                          variant="outline"
                          className="ml-auto shrink-0 text-[10px] px-1 py-0"
                        >
                          Admin
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
          </div>
        </ScrollArea>
      </div>

      <CreateChannelDialog
        roomId={roomId as Id<"rooms">}
        open={showCreateChannel}
        onOpenChange={setShowCreateChannel}
      />

      <AdminPanel
        open={showAdmin}
        onOpenChange={setShowAdmin}
      />
    </>
  );
}
