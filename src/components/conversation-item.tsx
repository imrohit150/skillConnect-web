import { format, isThisYear, isToday, isYesterday } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "@/components/premium-badge";
import type { ConversationSummary } from "@/types";

function formatActivityTime(value: string) {
  const date = new Date(value);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, isThisYear(date) ? "dd MMM" : "dd MMM yyyy");
}

type ConversationItemProps = {
  conversation: ConversationSummary;
  currentUserId?: string;
  selected?: boolean;
};

export function ConversationItem({ conversation, currentUserId, selected = false }: ConversationItemProps) {
  const { user, lastMessage, lastActivityAt } = conversation;
  const preview = lastMessage
    ? `${lastMessage.senderId === currentUserId ? "You: " : ""}${lastMessage.content}`
    : "No messages yet.";

  return (
    <li>
      <Link
        href={`/messages?conversation=${conversation.conversationId}`}
        scroll={false}
        aria-current={selected ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 border-l-[3px] border-transparent p-4 transition hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:gap-4 sm:p-5",
          selected && "border-primary bg-accent/80",
        )}
      >
      {user.profileImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.profileImageUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="size-12 shrink-0 rounded-2xl border-2 border-white object-cover shadow-sm ring-1 ring-primary/15 sm:size-14"
        />
      ) : (
        <span className="bg-brand flex size-12 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-sm sm:size-14">
          {user.name.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="flex min-w-0 items-center gap-1"><h3 className="truncate font-semibold">{user.name}</h3>{user.premiumStatus && <PremiumBadge />}</span>
          <time
            dateTime={lastActivityAt}
            title={new Date(lastActivityAt).toLocaleString("en-IN")}
            className="shrink-0 text-[11px] text-muted-foreground sm:text-xs"
          >
            {formatActivityTime(lastActivityAt)}
          </time>
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">{preview}</p>
      </div>
      </Link>
    </li>
  );
}

export function ConversationItemSkeleton() {
  return (
    <li aria-hidden="true" className="flex animate-pulse items-center gap-3 p-4 sm:gap-4 sm:p-5">
      <div className="size-12 shrink-0 rounded-2xl bg-muted sm:size-14" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-3 w-12 rounded bg-muted" />
        </div>
        <div className="h-3.5 w-3/4 rounded bg-muted" />
      </div>
    </li>
  );
}
