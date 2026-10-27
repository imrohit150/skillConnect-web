"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { BottomNav, Sidebar } from "@/components/app-nav";
import { ApiError } from "@/lib/api";
import { isProfileComplete } from "@/lib/profile";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { useMyProfile } from "@/hooks/use-profile";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, error, isPending } = useCurrentUser();
  const { data: profile, isPending: profilePending } = useMyProfile(user?.isEmailVerified === true);
  const logout = useLogout();
  const locked = Boolean(profile) && !isProfileComplete(profile!);

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      router.replace("/login");
    }
  }, [error, router]);

  useEffect(() => {
    if (user && !user.isEmailVerified) router.replace("/signup");
    else if (user?.isEmailVerified && locked && pathname !== "/profile") router.replace("/profile");
  }, [user, locked, pathname, router]);

  if (isPending || (user && !user.isEmailVerified) || (user?.isEmailVerified && profilePending)) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        {error instanceof ApiError && error.status === 401
          ? null
          : "Could not reach the server. Try again shortly."}
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="glass sticky top-0 z-40 shrink-0 border-b bg-background/60">
        <div className="flex h-14 w-full items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-10">
          <Logo href={locked ? "/profile" : "/feed"} className="max-sm:[&>span:first-child]:size-8 max-sm:[&>span:first-child]:rounded-lg max-sm:[&>span:first-child]:text-base max-sm:[&>span:last-child]:text-lg" />
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={logout.isPending ? "Logging out" : "Log out"}
              disabled={logout.isPending}
              onClick={() =>
                logout.mutate(undefined, { onSettled: () => router.replace("/login") })
              }
              className="flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-full border bg-white/70 text-sm font-semibold text-muted-foreground shadow-sm transition hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-4"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">{logout.isPending ? "Logging out..." : "Log out"}</span>
            </button>
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        {!locked && <Sidebar />}
        <main className="scroll-thin min-w-0 flex-1 overflow-y-auto p-3 sm:p-6 lg:px-10">{children}</main>
      </div>
      {!locked && <BottomNav />}
    </div>
  );
}
