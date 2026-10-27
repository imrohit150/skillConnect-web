"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, MessageCircle, RefreshCw, Users } from "lucide-react";
import { ConversationItem, ConversationItemSkeleton } from "@/components/conversation-item";
import { ConversationPanel } from "@/components/conversation-panel";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-auth";
import { useConversations } from "@/hooks/use-conversations";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { cn } from "@/lib/utils";

function MessagesContent() {
  const conversationId = useSearchParams().get("conversation") || null;
  const { data: user } = useCurrentUser();
  const { data: conversations, isPending, error, isFetching, refetch } = useConversations();
  const currentUserId = user?._id ?? user?.id;
  const selected = conversations?.find((conversation) => conversation.conversationId === conversationId);
  const chat = useChatSocket(selected?.conversationId ?? null);

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="mt-1.5 text-muted-foreground">Your conversations, all in one place.</p>
        </div>
        <Button
          variant="outline"
          disabled={isFetching}
          onClick={() => refetch()}
          className="h-10 cursor-pointer gap-2 rounded-xl bg-white/80 px-4 font-semibold shadow-sm"
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          {isFetching ? "Refreshing…" : "Refresh inbox"}
        </Button>
      </div>

      {error && conversations && (
        <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          We couldn’t refresh your inbox. Showing your last loaded conversations. Use Refresh inbox to try again.
        </p>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 md:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]">
      <section aria-label="Conversation inbox" className={cn("glass flex min-h-0 flex-col overflow-hidden rounded-3xl border bg-white/75", conversationId && "hidden md:flex")}>
        <div className="flex shrink-0 items-center gap-3 border-b bg-white/50 px-5 py-4 sm:px-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary"><MessageCircle className="size-5" /></span>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <h2 className="font-semibold">Your conversations</h2>
            {conversations && (
              <span className="rounded-full border bg-white px-2 py-0.5 text-xs font-semibold text-muted-foreground">{conversations.length}</span>
            )}
          </div>
        </div>

        <div className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto">
          {isPending ? (
            <div role="status" aria-label="Loading conversations">
              <span className="sr-only">Loading conversations…</span>
              <ul className="divide-y">
                {Array.from({ length: 5 }, (_, index) => <ConversationItemSkeleton key={index} />)}
              </ul>
            </div>
          ) : error && !conversations ? (
            <EmptyState
              icon={AlertCircle}
              title="Couldn’t load your conversations"
              description={error.message}
              className="rounded-none border-0 bg-transparent shadow-none"
              action={
                <Button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="bg-brand h-11 cursor-pointer gap-2 rounded-xl px-6 font-semibold text-white"
                >
                  <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
                  {isFetching ? "Trying again…" : "Try again"}
                </Button>
              }
            />
          ) : !conversations?.length ? (
            <EmptyState
              icon={MessageCircle}
              title="No conversations yet"
              description="When you start a chat with a connection, it will appear here."
              className="rounded-none border-0 bg-transparent shadow-none"
              action={
                <Link href="/connections" className="bg-brand inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5">
                  <Users className="size-4" />View connections
                </Link>
              }
            />
          ) : (
            <ul className="divide-y">
              {conversations.map((conversation) => (
                <ConversationItem key={conversation.conversationId} conversation={conversation} currentUserId={currentUserId} selected={conversation.conversationId === conversationId} />
              ))}
            </ul>
          )}
        </div>
      </section>
      <section aria-label="Selected conversation" className={cn("glass flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border bg-white/75", !conversationId && "hidden md:flex")}>
        <ConversationPanel
          conversationId={conversationId}
          conversation={selected}
          chat={chat}
          currentUserId={currentUserId}
          isLoading={isPending || (!selected && isFetching)}
          error={error}
          onRetry={() => refetch()}
        />
      </section>
      </div>
    </div>
  );
}

export default function MessagesView() {
  return (
    <Suspense fallback={<div role="status" className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading messages…</div>}>
      <MessagesContent />
    </Suspense>
  );
}
