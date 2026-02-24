"use client";

import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useRoomMember } from "@/contexts/RoomMemberContext";
import type { RoomMember } from "@/contexts/RoomMemberContext";

export function useCurrentRoomMember(): RoomMember | null {
  const params = useParams();
  const roomId = params.roomId as string;
  const { getMemberForRoom } = useRoomMember();
  const { user } = useUser();

  const guestMember = roomId ? getMemberForRoom(roomId) : null;

  if (guestMember) return guestMember;

  if (user) {
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
    return {
      type: "clerk",
      memberId: user.id,
      memberName: name,
      memberImage: user.imageUrl,
    };
  }

  return null;
}
