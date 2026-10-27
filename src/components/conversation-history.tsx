"use client";

import { Fragment, useEffect, useRef } from "react";
import { format, isSameDay, isThisYear, isToday, isYesterday } from "date-fns";
import { AlertCircle, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { MessageBubble } from "@/components/message-bubble";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/hooks/use-messages";
import { cn } from "@/lib/utils";

function formatMessageDay(value: string) {
  const date = new Date(value);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, isThisYear(date) ? "d MMMM" : "d MMMM yyyy");
}

type ConversationHistoryProps = {
  conversationId: string;
  currentUserId?: string;
  otherUserName: string;
};

export function ConversationHistory({ conversationId, currentUserId, otherUserName }: ConversationHistoryProps) {
  const { data, isPending, error, isFetching, refetch } = useMessages(conversationId);
  const viewportRef = useRef<HTMLDivElement>(null);
  const hasScrolledInitially = useRef(false);
  const nearBottomRef = useRef(true);
  const lastMessageIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!data || !viewportRef.current) return;
    const lastMessage = data.messages.at(-1);
    const sentNewMessage = lastMessage?._id !== lastMessageIdRef.current && lastMessage?.senderId === currentUserId;
    if (!hasScrolledInitially.current || nearBottomRef.current || sentNewMessage) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
    lastMessageIdRef.current = lastMessage?._id;
    hasScrolledInitially.current = true;
  }, [data, currentUserId]);

  return (
    <div
      ref={viewportRef}
      onScroll={(event) => {
        const viewport = event.currentTarget;
        nearBottomRef.current = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 80;
      }}
      className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto"
    >
      {isPending ? (
        <div role="status" className="flex flex-1 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />Loading messages…
        </div>
      ) : error && !data ? (
        <EmptyState
          icon={AlertCircle}
          title="Couldn’t load messages"
          description={error.message}
          className="rounded-none border-0 bg-transparent shadow-none"
          action={
            <Button onClick={() => refetch()} disabled={isFetching} variant="outline" className="h-10 cursor-pointer gap-2 rounded-xl px-5">
              <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
              {isFetching ? "Trying again…" : "Try again"}
            </Button>
          }
        />
      ) : (
        <>
          {error && (
            <div role="alert" className="m-4 flex flex-wrap items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              <p className="flex-1">Couldn’t refresh messages. Showing the saved messages already loaded.</p>
              <Button onClick={() => refetch()} disabled={isFetching} variant="outline" className="cursor-pointer">Retry</Button>
            </div>
          )}
          {!data?.messages.length ? (
            <EmptyState icon={MessageCircle} title="No messages yet" description={`This is the beginning of your conversation with ${otherUserName}.`} className="rounded-none border-0 bg-transparent shadow-none" />
          ) : (
            <div className="flex flex-1 flex-col justify-end gap-4 p-4 sm:p-6">
              {data.hasMore && <p className="text-center text-xs text-muted-foreground">Showing the latest {data.messages.length} messages</p>}
              <ol aria-label={`Messages with ${otherUserName}`} className="space-y-3">
                {data.messages.map((message, index) => {
                  const previous = data.messages[index - 1];
                  const startsNewDay = !previous || !isSameDay(new Date(previous.createdAt), new Date(message.createdAt));
                  return (
                    <Fragment key={message._id}>
                      {startsNewDay && (
                        <li className="flex justify-center py-2">
                          <time dateTime={format(new Date(message.createdAt), "yyyy-MM-dd")} className="rounded-full border bg-white/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                            {formatMessageDay(message.createdAt)}
                          </time>
                        </li>
                      )}
                      <MessageBubble message={message} isOwn={message.senderId === currentUserId} senderName={otherUserName} />
                    </Fragment>
                  );
                })}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}
