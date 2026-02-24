"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, LogIn } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-primary to-primary/90 px-6 py-14 sm:px-12 sm:py-16">
          <div className="absolute inset-0 -z-0">
            <div className="absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-primary-foreground/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-primary-foreground/10 blur-2xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Start Your First Room in Seconds
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Create a secure workspace, invite your team, and keep every
              conversation in one place.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href="/create-room">
                  <Plus className="mr-2 h-5 w-5" />
                  Create a Room
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border border-primary bg-white text-primary hover:bg-primary/10 hover:text-primary sm:w-auto focus-visible:ring-2 focus-visible:ring-primary"
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
      </div>
    </section>
  );
}
