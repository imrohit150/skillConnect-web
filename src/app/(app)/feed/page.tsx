"use client";

import { Compass, MessageCircle, UserPlus, Users } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-auth";

const quickLinks = [
  { icon: Compass, title: "Discover", text: "Find developers to connect with" },
  { icon: UserPlus, title: "Requests", text: "Review incoming connection requests" },
  { icon: Users, title: "Connections", text: "See your growing network" },
  { icon: MessageCircle, title: "Messages", text: "Pick up your conversations" },
];

export default function FeedPage() {
  const { data: user } = useCurrentUser();

  return (
    <div className="space-y-8">
      <section className="glass relative overflow-hidden rounded-3xl border bg-card p-8 sm:p-10">
        <div className="bg-brand absolute -top-24 -right-24 size-72 rounded-full opacity-20 blur-3xl" />
        <p className="font-[family-name:var(--font-mono-code)] text-sm text-primary">
          {"// welcome back"}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Hey, <span className="text-gradient">{user?.name}</span> 👋
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Your network is waiting. Explore developers, accept requests and start talking.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="glass group rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/50"
          >
            <span className="bg-brand mb-4 flex size-10 items-center justify-center rounded-xl text-white">
              <Icon className="size-5" />
            </span>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
