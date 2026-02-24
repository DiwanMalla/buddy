"use client";

import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LogIn, MessageSquare, Users, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { userId } = useAuth();
  const { user } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const createdRooms = useQuery(
    api.rooms.getRoomsForUser,
    userId ? { userId } : "skip"
  );

  const joinedRoomsByEmail = useQuery(
    api.rooms.getRoomsByEmail,
    email ? { email } : "skip"
  );

  const allRooms = new Map<string, {
    name: string;
    description?: string;
    inviteCode: string;
    _id: string;
    isCreator: boolean;
    memberName?: string;
  }>();

  createdRooms?.forEach((r) => {
    allRooms.set(r._id, { ...r, isCreator: true });
  });

  joinedRoomsByEmail?.forEach((r) => {
    if (!allRooms.has(r._id)) {
      allRooms.set(r._id, {
        name: r.name,
        description: r.description,
        inviteCode: r.inviteCode,
        _id: r._id,
        isCreator: false,
        memberName: r.memberName,
      });
    }
  });

  const rooms = Array.from(allRooms.values());

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Welcome back, {user?.firstName ?? "User"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="sm:size-default">
            <Link href="/join-room">
              <LogIn className="mr-2 h-4 w-4" />
              Join Room
            </Link>
          </Button>
          <Button size="sm" asChild className="sm:size-default">
            <Link href="/create-room">
              <Plus className="mr-2 h-4 w-4" />
              Create Room
            </Link>
          </Button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h2 className="mb-2 text-lg font-semibold">No rooms yet</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Create a new room or join one with an invite code.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/join-room">
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Room
                </Link>
              </Button>
              <Button asChild>
                <Link href="/create-room">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Room
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rooms.map((room) => (
            <Link key={room._id} href={`/room/${room._id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <Badge variant={room.isCreator ? "default" : "secondary"}>
                      {room.isCreator ? "Admin" : "Member"}
                    </Badge>
                  </div>
                  {room.description && (
                    <CardDescription className="line-clamp-2">
                      {room.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-mono tracking-wider">
                        {room.inviteCode}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
