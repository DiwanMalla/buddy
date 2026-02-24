import { Users } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Buddy</span>
          </div>

          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/create-room" className="hover:text-foreground transition-colors">
              Create Room
            </Link>
            <Link href="/join-room" className="hover:text-foreground transition-colors">
              Join Room
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
