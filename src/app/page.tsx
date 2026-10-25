"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useCurrentUser } from "@/hooks/use-auth";

export default function Home() {
  const router = useRouter();
  const { data: user, error } = useCurrentUser();

  useEffect(() => {
    if (user) router.replace("/feed");
    else if (error instanceof ApiError && error.status === 401) {
      router.replace("/login");
    }
  }, [user, error, router]);

  return (
    <div className="flex flex-1 items-center justify-center text-muted-foreground">
      {error && !(error instanceof ApiError && error.status === 401)
        ? "Could not reach the server. Try again shortly."
        : "Loading..."}
    </div>
  );
}
