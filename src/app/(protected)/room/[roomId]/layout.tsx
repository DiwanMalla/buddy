"use client";

import RoomSidebar from "@/components/room/RoomSidebar";
import RoomAccessGuard from "@/components/room/RoomAccessGuard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import IncomingCallBanner from "@/components/call/IncomingCallBanner";

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <RoomAccessGuard>
      <IncomingCallBanner />
      <div className="flex h-[calc(100dvh-4rem)] overflow-hidden">
        {isMobile ? (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
              <SheetTitle className="sr-only">Room sidebar</SheetTitle>
              <RoomSidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        ) : (
          sidebarOpen && <RoomSidebar />
        )}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center border-b border-border/40 px-2 py-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen && !isMobile ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          {children}
        </div>
      </div>
    </RoomAccessGuard>
  );
}
