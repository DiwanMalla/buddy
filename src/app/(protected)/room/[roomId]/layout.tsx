"use client";

import RoomSidebar from "@/components/room/RoomSidebar";
import RoomAccessGuard from "@/components/room/RoomAccessGuard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft } from "lucide-react";

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <RoomAccessGuard>
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {sidebarOpen && <RoomSidebar />}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center border-b border-border/40 px-2 py-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
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
