import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/lib/ConvexClientProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoomMemberProvider } from "@/contexts/RoomMemberContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Buddy - Collaborative Rooms",
  description:
    "Create or join rooms to collaborate with your team. Real-time chat, channels, file sharing, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          <RoomMemberProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </RoomMemberProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
