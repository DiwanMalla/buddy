"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCurrentRoomMember } from "@/hooks/useCurrentRoomMember";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminPanel({ open, onOpenChange }: Props) {
  const params = useParams();
  const roomId = params.roomId as string;
  const member = useCurrentRoomMember();

  const room = useQuery(
    api.rooms.getRoomById,
    roomId ? { roomId: roomId as Id<"rooms"> } : "skip"
  );
  const roomMembers = useQuery(
    api.rooms.getRoomMembers,
    roomId ? { roomId: roomId as Id<"rooms"> } : "skip"
  );

  const isAdmin = member && room && room.createdBy === member.memberId;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Room Settings</SheetTitle>
          <SheetDescription>
            View room members and invite code.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold">
            Members ({roomMembers?.length ?? 0})
          </h3>

          <div className="space-y-2">
            {roomMembers?.map((m) => (
              <div
                key={m.memberId}
                className="flex items-center gap-3 rounded-lg border border-border/40 p-3"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{m.name[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.name}
                    {m.memberId === member?.memberId && (
                      <span className="text-muted-foreground"> (you)</span>
                    )}
                  </p>
                  <Badge
                    variant={
                      room?.createdBy === m.memberId ? "default" : "secondary"
                    }
                    className="mt-0.5 text-[10px]"
                  >
                    {room?.createdBy === m.memberId ? "Admin" : "Member"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {room?.inviteCode && (
            <div className="rounded-lg border border-border/40 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Invite Code
              </p>
              <p className="mt-1 font-mono text-lg tracking-wider">
                {room.inviteCode}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Share this code and password for others to join.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
