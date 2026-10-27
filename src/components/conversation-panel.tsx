import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ConversationSession } from "@/components/conversation-session";
import { PremiumBadge } from "@/components/premium-badge";
import type { ChatControls } from "@/hooks/use-chat-socket";
import type { ConversationSummary } from "@/types";

type ConversationPanelProps = {
  conversationId: string | null;
  conversation?: ConversationSummary;
  chat: ChatControls;
  currentUserId?: string;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
};

export function ConversationPanel({ conversationId, conversation, chat, currentUserId, isLoading, error, onRetry }: ConversationPanelProps) {
  return (
    <>
      {conversationId && (
        <div className="flex shrink-0 items-center gap-2 border-b bg-white/50 p-3 sm:gap-3 sm:p-5">
          <Link href="/messages" scroll={false} aria-label="Back to conversations" className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-white text-muted-foreground transition hover:text-primary md:hidden">
            <ArrowLeft className="size-4" />
          </Link>
          {conversation ? (
            <>
              {conversation.user.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={conversation.user.profileImageUrl} alt="" referrerPolicy="no-referrer" className="size-9 shrink-0 rounded-xl border-2 border-white object-cover shadow-sm sm:size-11 sm:rounded-2xl" />
              ) : (
                <span className="bg-brand flex size-9 shrink-0 items-center justify-center rounded-xl font-semibold text-white sm:size-11 sm:rounded-2xl">{conversation.user.name.charAt(0).toUpperCase()}</span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5"><h2 className="truncate text-sm font-semibold sm:text-base">{conversation.user.name}</h2>{conversation.user.premiumStatus && <PremiumBadge />}</div>
                <p className="text-xs text-muted-foreground">Private conversation</p>
              </div>
            </>
          ) : <h2 className="font-semibold">Conversation</h2>}
        </div>
      )}

      <div className=" flex min-h-0 flex-1 flex-col">
        {!conversationId ? (
          <EmptyState icon={MessageCircle} title="Select a conversation" description="Choose a developer from your inbox to open your conversation." className="rounded-none border-0 bg-transparent shadow-none" />
        ) : isLoading ? (
          <div role="status" className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin" />Opening conversation…</div>
        ) : !conversation ? (
          <EmptyState
            icon={AlertCircle}
            title={error ? "Couldn’t open this conversation" : "Conversation not found"}
            description={error ? error.message : "This conversation isn’t in your inbox. Choose another chat or start one from Connections."}
            className="rounded-none border-0 bg-transparent shadow-none"
            action={error ? <Button onClick={onRetry} variant="outline" className="h-10 cursor-pointer rounded-xl px-5">Try again</Button> : <Link href="/connections" className="text-sm font-semibold text-primary hover:underline">View connections</Link>}
          />
        ) : (
          <ConversationSession key={conversationId} conversationId={conversationId} currentUserId={currentUserId} otherUserName={conversation.user.name} canMessage={conversation.canMessage !== false} chat={chat} />
        )}
      </div>
    </>
  );
}
