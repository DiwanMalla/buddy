"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Plus,
  LogIn,
  ShieldCheck,
  MessagesSquare,
  Lock,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-14 lg:py-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[580px] w-[580px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-20 top-1/3 h-[280px] w-[280px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 top-1/4 h-[280px] w-[280px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-sm text-muted-foreground">
            <ShieldCheck
              aria-hidden="true"
              className="mr-2 h-4 w-4 text-primary"
            />
            Secure, Real-Time Collaboration
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Run Team Conversations in One Shared Workspace
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Create private rooms, organize topics with channels, and chat with
            your team instantly. Buddy keeps everything simple, fast, and
            focused.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/create-room">
                <Plus className="mr-2 h-5 w-5" />
                Create a Room
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/join-room">
                <LogIn className="mr-2 h-5 w-5" />
                Join a Room
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-background/70 p-4">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <MessagesSquare
                  aria-hidden="true"
                  className="h-4 w-4 text-primary"
                />
              </div>
              <p className="text-sm font-medium">Real-Time Messaging</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Instant updates across rooms and channels.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/70 p-4">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Lock aria-hidden="true" className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium">Private by Default</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Invite codes and room passwords protect access.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/70 p-4">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <ShieldCheck
                  aria-hidden="true"
                  className="h-4 w-4 text-primary"
                />
              </div>
              <p className="text-sm font-medium">Built for Teams</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Admins, channels, and files in one flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
