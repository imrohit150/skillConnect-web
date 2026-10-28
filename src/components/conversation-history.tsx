"use client";

import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { format, isSameDay, isThisYear, isToday, isYesterday } from "date-fns";
import { AlertCircle, ArrowDown, History, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { MessageBubble } from "@/components/message-bubble";
import { Button } from "@/components/ui/button";
import { ChatHistorySkeleton } from "@/components/loading-skeletons";
import { useMessages } from "@/hooks/use-messages";
import { compareMessages } from "@/lib/chat-cache";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

function formatMessageDay(value: string) {
  const date = new Date(value);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, isThisYear(date) ? "d MMMM" : "d MMMM yyyy");
}

type ScrollAnchor = { id?: string; offset: number; height: number; scrollTop: number };
function captureAnchor(viewport: HTMLDivElement): ScrollAnchor {
  const top = viewport.getBoundingClientRect().top;
  const visible = [...viewport.querySelectorAll<HTMLElement>("[data-message-id]")]
    .find((element) => element.getBoundingClientRect().bottom > top);
  return { id: visible?.dataset.messageId, offset: visible ? visible.getBoundingClientRect().top - top : 0, height: viewport.scrollHeight, scrollTop: viewport.scrollTop };
}

type ConversationHistoryProps = { conversationId: string; currentUserId?: string; otherUserName: string };

export function ConversationHistory({ conversationId, currentUserId, otherUserName }: ConversationHistoryProps) {
  const { messages, hasLoaded, hasNextPage, isFetchingNextPage, isFetchNextPageError, isFetching, error, refetch, fetchNextPage } = useMessages(conversationId);
  const viewportRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<ScrollAnchor | null>(null);
  const initializedRef = useRef(false);
  const nearBottomRef = useRef(true);
  const lastMessageRef = useRef<string | undefined>(undefined);
  const [reading, setReading] = useState<{ nearBottom: boolean; lastRead: Message | null }>({ nearBottom: true, lastRead: null });
  const newest = messages.at(-1);
  const newCount = !reading.nearBottom && reading.lastRead
    ? messages.filter((message) => message.senderId !== currentUserId && compareMessages(message, reading.lastRead!) > 0).length
    : 0;

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !hasLoaded) return;
    const last = messages.at(-1);
    const anchor = anchorRef.current;
    if (anchor) {
      if (!isFetchingNextPage) {
        const element = [...viewport.querySelectorAll<HTMLElement>("[data-message-id]")].find((item) => item.dataset.messageId === anchor.id);
        if (element) viewport.scrollTop += element.getBoundingClientRect().top - viewport.getBoundingClientRect().top - anchor.offset;
        else viewport.scrollTop = anchor.scrollTop + viewport.scrollHeight - anchor.height;
        anchorRef.current = null;
      }
    } else if (!initializedRef.current || nearBottomRef.current || (last?._id !== lastMessageRef.current && last?.senderId === currentUserId)) {
      viewport.scrollTop = viewport.scrollHeight;
      nearBottomRef.current = true;
    }
    lastMessageRef.current = last?._id;
    initializedRef.current = true;
  }, [messages, hasLoaded, isFetchingNextPage, currentUserId]);

  function loadOlder() {
    const viewport = viewportRef.current;
    if (!viewport || isFetching || !hasNextPage) return;
    anchorRef.current = captureAnchor(viewport);
    void fetchNextPage({ cancelRefetch: false });
  }

  function jumpToLatest() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    nearBottomRef.current = true;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    setReading({ nearBottom: true, lastRead: newest ?? null });
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={viewportRef}
        aria-label="Message history"
        onScroll={(event) => {
          const viewport = event.currentTarget;
          const nearBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 80;
          nearBottomRef.current = nearBottom;
          setReading((previous) => {
            const lastRead = nearBottom || previous.nearBottom ? newest ?? previous.lastRead : previous.lastRead;
            return previous.nearBottom === nearBottom && previous.lastRead?._id === lastRead?._id ? previous : { nearBottom, lastRead };
          });
        }}
        style={{ overflowAnchor: "none" }}
        className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        {!hasLoaded && !error ? (
          <ChatHistorySkeleton />
        ) : error && !hasLoaded ? (
          <EmptyState icon={AlertCircle} title="Couldn’t load messages" description={error.message} className="rounded-none border-0 bg-transparent shadow-none"
            action={<Button onClick={() => refetch()} disabled={isFetching} variant="outline" className="h-10 cursor-pointer gap-2 rounded-xl px-5"><RefreshCw className={cn("size-4", isFetching && "animate-spin")} />{isFetching ? "Trying again…" : "Try again"}</Button>}
          />
        ) : (
          <>
            {error && !isFetchNextPageError && <div role="alert" className="m-4 flex flex-wrap items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"><p className="flex-1">Couldn’t refresh messages. Your loaded history is still available.</p><Button onClick={() => refetch()} disabled={isFetching} variant="outline" className="cursor-pointer">Retry</Button></div>}
            {!messages.length ? (
              <EmptyState icon={MessageCircle} title="No messages yet" description={`This is the beginning of your conversation with ${otherUserName}.`} className="rounded-none border-0 bg-transparent shadow-none" />
            ) : (
              <div className="flex shrink-0 grow flex-col justify-end gap-4 p-4 sm:p-6">
                <div className="flex flex-col items-center gap-2">
                  {isFetchNextPageError && <p role="alert" className="text-center text-xs text-destructive">Couldn’t load older messages. Your current messages are still here.</p>}
                  {hasNextPage ? (
                    <Button onClick={loadOlder} disabled={isFetching} variant="outline" className="h-9 cursor-pointer gap-2 rounded-full bg-white px-4 text-xs shadow-sm">
                      {isFetchingNextPage ? <Loader2 className="size-3.5 animate-spin" /> : <History className="size-3.5" />}
                      {isFetchingNextPage ? "Loading older messages…" : isFetchNextPageError ? "Retry older messages" : "Load older messages"}
                    </Button>
                  ) : <p className="py-2 text-center text-xs text-muted-foreground">Beginning of conversation</p>}
                </div>
                <ol aria-label={`Messages with ${otherUserName}`} className="space-y-3">
                  {messages.map((message, index) => {
                    const previous = messages[index - 1];
                    const startsNewDay = !previous || !isSameDay(new Date(previous.createdAt), new Date(message.createdAt));
                    return <Fragment key={message._id}>
                      {startsNewDay && <li className="flex justify-center py-2"><time dateTime={format(new Date(message.createdAt), "yyyy-MM-dd")} className="rounded-full border bg-white/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">{formatMessageDay(message.createdAt)}</time></li>}
                      <MessageBubble message={message} isOwn={message.senderId === currentUserId} senderName={otherUserName} />
                    </Fragment>;
                  })}
                </ol>
              </div>
            )}
          </>
        )}
      </div>
      {!reading.nearBottom && hasLoaded && messages.length > 0 && (
        <Button onClick={jumpToLatest} className="absolute bottom-3 left-1/2 h-9 -translate-x-1/2 cursor-pointer gap-2 rounded-full border border-white bg-primary px-4 text-xs font-semibold text-white shadow-lg hover:bg-primary/90">
          <ArrowDown className="size-3.5" />{newCount ? `${newCount} new ${newCount === 1 ? "message" : "messages"}` : "Latest messages"}
        </Button>
      )}
    </div>
  );
}
