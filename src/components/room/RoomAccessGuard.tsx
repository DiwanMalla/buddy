"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useCurrentRoomMember } from "@/hooks/useCurrentRoomMember";

export default function RoomAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const member = useCurrentRoomMember();

  const room = useQuery(
    api.rooms.getRoomById,
    roomId ? { roomId: roomId as Id<"rooms"> } : "skip"
  );
  const verified = useQuery(
    api.rooms.verifyRoomMember,
    roomId && member
      ? { roomId: roomId as Id<"rooms">, memberId: member.memberId }
      : "skip"
  );

  useEffect(() => {
    if (!roomId) return;
    if (room === undefined) return;
    if (!room) {
      router.replace("/join-room");
      return;
    }
    if (!member) {
      router.replace("/join-room");
      return;
    }
    if (verified === undefined) return;
    if (!verified) {
      router.replace("/join-room");
    }
  }, [roomId, room, member, verified, router]);

  if (room === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!room || !member) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  if (verified === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!verified) return null;

  return <>{children}</>;
}
