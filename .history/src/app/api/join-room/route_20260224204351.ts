import { NextRequest, NextResponse } from "next/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { inviteCode, password, name } = await req.json();

    if (!inviteCode || !password || !name?.trim()) {
      return NextResponse.json(
        { error: "Missing inviteCode, password, or name" },
        { status: 400 },
      );
    }

    const room = await fetchQuery(api.rooms.getRoomByInviteCode, {
      inviteCode: String(inviteCode).toUpperCase(),
    });

    if (!room) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 },
      );
    }

    const isValid = await bcrypt.compare(password, room.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 400 },
      );
    }

    const result = await fetchMutation(api.rooms.addGuestToRoomFromApi, {
      roomId: room._id,
      name: name.trim(),
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to join room";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
