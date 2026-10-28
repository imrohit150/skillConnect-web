"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useCurrentUser } from "@/hooks/use-auth";
import { AppShellSkeleton } from "@/components/loading-skeletons";

export default function Home() {
  const router = useRouter();
  const { data: user, error } = useCurrentUser();

  useEffect(() => {
    if (user) router.replace("/feed");
    else if (error instanceof ApiError && error.status === 401) {
      router.replace("/login");
    }
  }, [user, error, router]);

  if (error && !(error instanceof ApiError && error.status === 401)) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Could not reach the server. Try again shortly.</div>;
  }

  return <AppShellSkeleton />;
}
