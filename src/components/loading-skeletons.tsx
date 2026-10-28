import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ConversationItemSkeleton } from "@/components/conversation-item";
import { RequestCardSkeletonGrid } from "@/components/request-card-skeleton";
import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-muted motion-reduce:animate-none", className)} />;
}

function LoadingStatus({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="contents">{children}</div>
    </div>
  );
}

function HeadingSkeleton() {
  return <div className="space-y-2"><Skeleton className="h-7 w-44 sm:h-9" /><Skeleton className="h-4 w-80 max-w-full sm:h-5" /></div>;
}

export function DeveloperPageSkeleton({ variant = "feed" }: { variant?: "feed" | "requests" | "connections" }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 sm:gap-6">
      <HeadingSkeleton />
      {variant === "feed" && (
        <div className="space-y-3">
          <Skeleton className="h-11 w-full rounded-xl" />
          <div className="flex flex-wrap gap-2">{[20, 28, 24].map((width) => <Skeleton key={width} className={cn("h-8 rounded-full", width === 20 ? "w-20" : width === 28 ? "w-28" : "w-24")} />)}</div>
        </div>
      )}
      {variant === "requests" && <Skeleton className="h-11 w-64 max-w-full rounded-full" />}
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto pb-2">
        <RequestCardSkeletonGrid label="Loading developers..." />
      </div>
    </div>
  );
}

export function ProfileSkeleton({ fullPage = false }: { fullPage?: boolean }) {
  return (
    <LoadingStatus label="Loading your profile..." className="mx-auto w-full max-w-[63.5rem] space-y-3 sm:space-y-6">
      {fullPage && <HeadingSkeleton />}
      <div className="grid gap-3 sm:gap-6 lg:h-[calc(100dvh-14rem)] lg:min-h-[480px] lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="flex justify-center lg:items-start">
          <div className="glass grid w-full max-w-sm grid-cols-[4.5rem_minmax(0,1fr)] gap-3 rounded-2xl border bg-white/80 p-3 sm:block sm:rounded-[2rem]">
            <Skeleton className="aspect-square w-full rounded-xl sm:rounded-3xl" />
            <div className="min-w-0 space-y-3 sm:px-3 sm:py-4">
              <Skeleton className="h-5 w-2/3" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-3/4" />
              <div className="flex gap-2"><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-6 w-20 rounded-full" /></div>
            </div>
          </div>
        </div>
        <div className="flex min-h-0 flex-col gap-4">
          <div className="glass min-h-0 flex-1 space-y-5 overflow-hidden rounded-2xl border bg-card p-4 sm:rounded-3xl sm:p-8">
            <div className="flex items-center gap-3"><Skeleton className="h-11 w-36 rounded-xl" /><Skeleton className="h-8 w-32" /></div>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className={cn("w-full rounded-xl", index === 1 ? "h-20" : "h-11")} /></div>
            ))}
          </div>
          <Skeleton className="h-12 w-full shrink-0 rounded-xl" />
        </div>
      </div>
    </LoadingStatus>
  );
}

export function AuthFormSkeleton({ variant = "verify" }: { variant?: "verify" | "reset" }) {
  return (
    <LoadingStatus label={variant === "verify" ? "Loading your signup..." : "Opening reset link..."} className="space-y-5">
      <Skeleton className="size-16 rounded-2xl" />
      <div className="space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
      {variant === "verify" ? (
        <><Skeleton className="h-16 w-full rounded-2xl" /><div className="space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-16 w-full rounded-xl" /><Skeleton className="h-3 w-40" /></div></>
      ) : Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-12 w-full rounded-xl" /></div>
      ))}
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="flex flex-col items-center gap-3 border-t pt-4"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-3 w-32" /></div>
    </LoadingStatus>
  );
}

function ChatBubbles() {
  return (
    <div className="flex flex-1 flex-col justify-end gap-4 overflow-hidden p-4 sm:p-5">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className={cn("flex shrink-0 flex-col gap-1.5", index % 2 ? "items-end" : "items-start")}>
          <Skeleton className={cn("max-w-[80%] rounded-2xl", index % 3 === 0 ? "h-16 w-60" : "h-11 w-44")} />
          <Skeleton className="h-2 w-12" />
        </div>
      ))}
    </div>
  );
}

function ChatHeader() {
  return <div className="flex shrink-0 items-center gap-3 border-b bg-white/50 p-3 sm:p-5"><Skeleton className="size-9 shrink-0 rounded-xl sm:size-11 sm:rounded-2xl" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></div>;
}

export function ConversationHeaderSkeleton() {
  return <LoadingStatus label="Loading conversation details..."><div className="flex items-center gap-3"><Skeleton className="size-9 shrink-0 rounded-xl sm:size-11 sm:rounded-2xl" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></div></LoadingStatus>;
}

export function ChatHistorySkeleton({ withComposer = false }: { withComposer?: boolean }) {
  return (
    <LoadingStatus label={withComposer ? "Opening conversation..." : "Loading messages..."} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ChatBubbles />
      {withComposer && <div className="shrink-0 border-t bg-white/65 p-3 sm:p-4"><Skeleton className="h-12 w-full rounded-xl" /></div>}
    </LoadingStatus>
  );
}

export function MessagesSkeleton() {
  return (
    <LoadingStatus label="Loading messages..." className="flex h-full min-h-0 flex-col gap-3 sm:gap-6">
      <div className="flex items-start justify-between gap-4"><HeadingSkeleton /><Skeleton className="h-9 w-28 shrink-0 rounded-xl" /></div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 md:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]">
        <div className="glass flex min-h-0 flex-col overflow-hidden rounded-3xl border bg-white/75">
          <div className="border-b bg-white/50 p-4"><Skeleton className="h-6 w-40" /></div>
          <ul className="flex-1 divide-y overflow-hidden">{Array.from({ length: 5 }, (_, index) => <ConversationItemSkeleton key={index} />)}</ul>
        </div>
        <div className="glass hidden min-h-0 flex-col overflow-hidden rounded-3xl border bg-white/75 md:flex"><ChatHeader /><ChatBubbles /><div className="shrink-0 border-t p-4"><Skeleton className="h-12 w-full rounded-xl" /></div></div>
      </div>
    </LoadingStatus>
  );
}

export function MembershipStatusSkeleton() {
  return <LoadingStatus label="Checking your membership..." className="flex flex-wrap items-center gap-x-3 gap-y-2"><Skeleton className="h-5 w-28" /><Skeleton className="h-4 w-72 max-w-full" /></LoadingStatus>;
}

function MembershipSkeleton() {
  return (
    <LoadingStatus label="Loading your membership..." className="space-y-4 sm:space-y-6">
      <HeadingSkeleton /><Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2 sm:gap-6">{[0, 1].map((index) => (
        <div key={index} className="glass space-y-5 rounded-[2rem] border bg-white/75 p-4 sm:p-8">
          <div className="flex items-center justify-between"><Skeleton className="size-12 rounded-2xl" /><Skeleton className="h-6 w-28 rounded-full" /></div>
          <Skeleton className="h-7 w-20" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-12 w-36" /><Skeleton className="h-20 w-full rounded-2xl" />
          <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-3/4" /></div><Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}</div>
    </LoadingStatus>
  );
}

export function AppShellSkeleton({ pathname = "/feed" }: { pathname?: string }) {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden">
      <header className="glass shrink-0 border-b bg-background/60"><div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-10"><Logo href="/" className="max-sm:[&>span:first-child]:size-8 max-sm:[&>span:last-child]:text-lg" /><Skeleton className="h-10 w-10 rounded-full sm:w-24" /></div></header>
      <div className="flex min-h-0 flex-1">
        <aside aria-hidden="true" className="hidden w-64 shrink-0 flex-col justify-between border-r bg-white/30 p-4 md:flex"><div className="space-y-3">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-11 w-full rounded-2xl" />)}</div><div className="space-y-3"><Skeleton className="h-20 w-full rounded-2xl" /><Skeleton className="h-16 w-full rounded-2xl" /></div></aside>
        <main className="scroll-thin min-w-0 flex-1 overflow-y-auto p-3 sm:p-6 lg:px-10">
          {pathname === "/profile" ? <ProfileSkeleton fullPage /> : pathname === "/messages" ? <MessagesSkeleton /> : pathname === "/membership" ? <MembershipSkeleton /> : <DeveloperPageSkeleton variant={pathname === "/requests" ? "requests" : pathname === "/connections" ? "connections" : "feed"} />}
        </main>
      </div>
      <div aria-hidden="true" className="flex h-16 shrink-0 items-center justify-around border-t bg-white/50 px-3 md:hidden">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-9 w-10 rounded-xl" />)}</div>
    </div>
  );
}
