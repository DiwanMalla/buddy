import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/lib/ConvexClientProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoomMemberProvider } from "@/contexts/RoomMemberContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PWARegister } from "@/components/PWARegister";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Buddy",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <RoomMemberProvider>
              <TooltipProvider>
              {children}
              <PWARegister />
            </TooltipProvider>
            </RoomMemberProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
