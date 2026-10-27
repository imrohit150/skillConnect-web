"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Loader2, Search, SearchX, Users, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { UserCard, UserCardSkeleton } from "@/components/user-card";
import { UserDrawer } from "@/components/user-drawer";
import { useUsers } from "@/hooks/use-users";
import { cn } from "@/lib/utils";
import type { ExperienceLevel } from "@/types";

const levels: ExperienceLevel[] = ["Beginner", "Intermediate", "Advanced"];

function isLevel(value: string | null): value is ExperienceLevel {
  return levels.includes(value as ExperienceLevel);
}

function FeedContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const levelParam = searchParams.get("level");
  const level = isLevel(levelParam) ? levelParam : undefined;

  const [text, setText] = useState(search);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function updateParams(next: { search?: string; level?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed === search) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (trimmed) params.set("search", trimmed);
      else params.delete("search");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 400);
    return () => clearTimeout(timer);
  }, [text, search, pathname, router]);

  const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useUsers({
    search: search || undefined,
    experienceLevel: level,
  });

  const users = data?.pages.flatMap((page) => page.users) ?? [];
  const total = data?.pages.at(-1)?.pagination.total ?? 0;
  const selected = users.find((user) => user._id === selectedId) ?? null;
  const hasFilters = !!search || !!level;

  function clearFilters() {
    setText("");
    router.replace(pathname);
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3 sm:gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">Discover developers</h1>
        <p className="mt-1 text-xs leading-5 text-muted-foreground sm:mt-1.5 sm:text-base sm:leading-6">
          Find people to build with. Open a card to see their full profile.
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search by name or skill..."
            aria-label="Search developers"
            className="h-10 w-full rounded-xl border bg-white/80 pr-10 pl-10 text-base shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15 sm:h-11 sm:text-sm"
          />
          {text && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setText("")}
              className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {levels.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => updateParams({ level: level === item ? "" : item })}
              className={cn(
                "min-h-9 cursor-pointer rounded-full border bg-white/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground sm:px-4 sm:py-2 sm:text-sm",
                level === item && "bg-brand border-transparent text-white shadow-md shadow-cyan-500/25 hover:text-white",
              )}
            >
              {item}
            </button>
          ))}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex cursor-pointer items-center gap-1 px-2 text-sm font-medium text-muted-foreground transition hover:text-destructive"
            >
              <X className="size-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="scroll-thin -mx-2 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 pb-2 sm:gap-6">
      {isPending ? (
        <div className="grid gap-5 sm:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <p className="text-destructive">{error.message}</p>
      ) : users.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="No developers match your search"
            description="Try a different name or skill, or clear the filters to see everyone."
            action={
              <button
                type="button"
                onClick={clearFilters}
                className="bg-brand h-10 cursor-pointer rounded-xl px-4 text-xs font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 sm:h-11 sm:px-6 sm:text-sm"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <EmptyState
            icon={Users}
            title="You're all caught up"
            description="There are no more developers to show right now. Check back later as new people join."
          />
        )
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-3 2xl:grid-cols-4">
            {users.map((user) => (
              <UserCard key={user._id} user={user} onOpen={() => setSelectedId(user._id)} />
            ))}
          </div>
          {hasNextPage && (
            <div className="flex flex-col items-center gap-2 pt-2 pb-4">
              <p className="text-xs text-muted-foreground">
                Showing {users.length} of {total} developers
              </p>
              <button
                type="button"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                className="bg-brand group flex h-10 cursor-pointer items-center gap-2 rounded-full px-5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:px-8 sm:text-sm"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ChevronDown className="size-4 transition group-hover:translate-y-0.5" />
                )}
                {isFetchingNextPage ? "Loading..." : "Load more developers"}
              </button>
            </div>
          )}
        </>
      )}

      </div>

      <UserDrawer user={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense>
      <FeedContent />
    </Suspense>
  );
}
