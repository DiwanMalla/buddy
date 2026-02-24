import {
  MessageSquare,
  Shield,
  Users,
  Hash,
  FileUp,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Password-Protected Rooms",
    description:
      "Create secure rooms with invite codes and passwords. Only authorized members can join.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Chat",
    description:
      "Instant group messaging powered by Convex. Messages appear in real-time, no refresh needed.",
  },
  {
    icon: Users,
    title: "Private Messaging",
    description:
      "Send direct messages to any team member within your room for private conversations.",
  },
  {
    icon: Hash,
    title: "Channels",
    description:
      "Organize discussions into channels. Keep topics separated and focused.",
  },
  {
    icon: FileUp,
    title: "File Sharing",
    description:
      "Share documents, images, and assignments directly in channels and chats.",
  },
  {
    icon: Zap,
    title: "Admin Controls",
    description:
      "Room creators are admins. Promote members, manage roles, and control access.",
  },
];

export default function Features() {
  return (
    <section className="border-y border-border/40 bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium text-primary">Why Teams Choose Buddy</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            All the Essentials for Productive Collaboration
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Keep conversations organized, secure, and easy to navigate.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="border-border/50 bg-background/80 transition-colors hover:bg-background"
            >
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon aria-hidden="true" className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
