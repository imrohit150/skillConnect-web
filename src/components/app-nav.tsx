"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Crown, MessageCircle, UserPlus, Users, UserRound } from "lucide-react";
import { PremiumBadge } from "@/components/premium-badge";
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
      <nav className="space-y-4">
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
      <div className="space-y-3">
      <Link
        href="/membership"
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-primary/20 bg-white/70 p-4 transition hover:border-primary/50 hover:bg-white",
          isActive("/membership") && "border-primary/60 bg-accent",
        )}
      >
        <span className="bg-brand flex size-9 shrink-0 items-center justify-center rounded-xl text-white"><Crown className="size-4" /></span>
        <span><span className="block text-sm font-semibold">Membership</span><span className="block text-xs text-muted-foreground">Plus badge · ₹99/month demo</span></span>
      </Link>
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
          <span className="flex items-center gap-1"><span className="truncate text-sm font-semibold">{user?.name}</span>{user?.premiumStatus && <PremiumBadge />}</span>
          <span className="block text-xs text-muted-foreground">View profile</span>
        </span>
      </Link>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const isActive = useIsActive();
  const tabs = [...items, { href: "/profile", label: "Profile", icon: UserRound }];

  return (
    <nav aria-label="Main navigation" className="glass z-40 flex shrink-0 border-t bg-background/80 pb-[env(safe-area-inset-bottom)] lg:hidden">
      {tabs.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-semibold text-muted-foreground transition sm:gap-1 sm:py-2.5 sm:text-[11px]",
            isActive(href) && "text-primary",
          )}
        >
          <Icon className="size-[18px] sm:size-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
