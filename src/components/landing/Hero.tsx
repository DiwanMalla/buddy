"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, LogIn } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
            Real-time collaboration, simplified
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your team&apos;s
            <span className="relative mx-2 inline-block">
              <span className="relative z-10">collaboration</span>
              <span className="absolute bottom-2 left-0 -z-0 h-3 w-full bg-primary/20 sm:bottom-3 sm:h-4" />
            </span>
            hub
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Create password-protected rooms, chat in real-time, organize with
            channels, and share files with your team. Everything you need for
            seamless collaboration.
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
        </div>
      </div>
    </section>
  );
}
