import { Users } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Users
                aria-hidden="true"
                className="h-4 w-4 text-primary-foreground"
              />
            </div>
            <div>
              <p className="text-base font-semibold">Buddy</p>
              <p className="text-xs text-muted-foreground">
                Real-time team collaboration
              </p>
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="flex gap-6 text-sm text-muted-foreground"
          >
            <Link
              href="/create-room"
              className="transition-colors hover:text-foreground"
            >
              Create Room
            </Link>
            <Link
              href="/join-room"
              className="transition-colors hover:text-foreground"
            >
              Join Room
            </Link>
            <Link
              href="/sign-in"
              className="transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Buddy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
