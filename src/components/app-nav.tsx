"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageCircle, UserPlus, Users, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-auth";

const items = [
  { href: "/feed", label: "Discover", icon: Compass },
  { href: "/requests", label: "Requests", icon: UserPlus },
  { href: "/connections", label: "Connections", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const isActive = useIsActive();
  const { data: user } = useCurrentUser();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col justify-between border-r bg-white/40 p-4 lg:flex">
      <nav className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-white/70 hover:text-foreground",
              isActive(href) && "bg-brand text-white shadow-md shadow-cyan-500/25 hover:bg-transparent hover:text-white",
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
      <Link
        href="/profile"
        className={cn(
          "flex items-center gap-3 rounded-2xl border bg-white/70 p-3 shadow-sm transition hover:border-primary/50",
          isActive("/profile") && "border-primary/60 bg-accent",
        )}
      >
        {user?.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profileImageUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="size-10 shrink-0 rounded-full border object-cover"
          />
        ) : (
          <span className="bg-brand flex size-10 shrink-0 items-center justify-center rounded-full font-semibold text-white">
            {user?.name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{user?.name}</span>
          <span className="block text-xs text-muted-foreground">View profile</span>
        </span>
      </Link>
    </aside>
  );
}

export function BottomNav() {
  const isActive = useIsActive();
  const tabs = [...items, { href: "/profile", label: "Profile", icon: UserRound }];

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 flex border-t bg-background/80 lg:hidden">
      {tabs.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-muted-foreground transition",
            isActive(href) && "text-primary",
          )}
        >
          <Icon className="size-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
