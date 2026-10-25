"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ApiError } from "@/lib/api";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, error, isPending } = useCurrentUser();
  const logout = useLogout();

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      router.replace("/login");
    }
  }, [error, router]);

  if (isPending) {
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
    <div className="flex flex-1 flex-col">
      <header className="glass sticky top-0 z-40 border-b bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Logo href="/feed" />
          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2.5">
              <span className="bg-brand flex size-9 items-center justify-center rounded-full text-sm font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-sm font-medium sm:block">{user.name}</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              disabled={logout.isPending}
              onClick={() =>
                logout.mutate(undefined, { onSettled: () => router.replace("/login") })
              }
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</main>
    </div>
  );
}
