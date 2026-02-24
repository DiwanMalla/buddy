"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2, Copy, Check } from "lucide-react";
import bcrypt from "bcryptjs";
import { useRoomMember } from "@/contexts/RoomMemberContext";

export default function CreateRoomPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  const createRoom = useMutation(api.rooms.createRoom);
  const saveUserProfile = useMutation(api.users.saveUserProfile);
  const { setClerkMember } = useRoomMember();

  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    inviteCode: string;
    roomId: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const creatorName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "User"
    : "";
  const creatorEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await saveUserProfile({
        name: creatorName,
        email: creatorEmail,
      });

      const passwordHash = await bcrypt.hash(password, 10);

      const res = await createRoom({
        name: roomName,
        description: description || undefined,
        passwordHash,
        createdBy: userId!,
        creatorName,
        creatorEmail,
      });

      setClerkMember(userId!, creatorName, user?.imageUrl);

      setResult({
        inviteCode: res.inviteCode,
        roomId: res.roomId,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (result) {
      navigator.clipboard.writeText(result.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (result) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Room Created!</CardTitle>
            <CardDescription>
              Share this invite code and password with others to join.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Invite Code</Label>
              <div className="flex gap-2">
                <Input
                  value={result.inviteCode}
                  readOnly
                  className="font-mono text-lg tracking-widest"
                />
                <Button variant="outline" size="icon" onClick={copyInviteCode}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => router.push(`/room/${result.roomId}`)}
            >
              Go to Room
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Plus className="h-6 w-6" />
            Create a Room
          </CardTitle>
          <CardDescription>
            You&apos;re creating as <strong>{creatorName}</strong> ({creatorEmail})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                placeholder="e.g. Team Alpha"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this room about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Room Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Set a password for joining"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Room
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
