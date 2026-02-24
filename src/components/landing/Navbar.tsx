"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Users, Plus, LogIn, Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Buddy</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <SignedOut>
            <Button variant="ghost" asChild>
              <Link href="/join-room">
                <LogIn className="mr-2 h-4 w-4" />
                Join Room
              </Link>
            </Button>
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/join-room">
                <LogIn className="mr-2 h-4 w-4" />
                Join Room
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/create-room">
                <Plus className="mr-2 h-4 w-4" />
                Create Room
              </Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/40 bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <SignedOut>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/join-room" onClick={() => setMobileOpen(false)}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Room
                </Link>
              </Button>
              <Button className="mt-2" asChild>
                <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/join-room" onClick={() => setMobileOpen(false)}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Room
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/create-room" onClick={() => setMobileOpen(false)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Room
                </Link>
              </Button>
              <div className="mt-2 flex items-center gap-2">
                <UserButton afterSignOutUrl="/" />
                <span className="text-sm text-muted-foreground">Account</span>
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
}
