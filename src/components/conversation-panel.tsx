import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ConversationSession } from "@/components/conversation-session";
import type { ConversationSummary } from "@/types";

type ConversationPanelProps = {
  conversationId: string | null;
  conversation?: ConversationSummary;
  currentUserId?: string;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
};

export function ConversationPanel({ conversationId, conversation, currentUserId, isLoading, error, onRetry }: ConversationPanelProps) {
  return (
    <>
      {conversationId && (
        <div className="flex shrink-0 items-center gap-3 border-b bg-white/50 p-4 sm:p-5">
          <Link href="/messages" scroll={false} aria-label="Back to conversations" className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-white text-muted-foreground transition hover:text-primary md:hidden">
            <ArrowLeft className="size-4" />
          </Link>
          {conversation ? (
            <>
              {conversation.user.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={conversation.user.profileImageUrl} alt="" referrerPolicy="no-referrer" className="size-11 shrink-0 rounded-2xl border-2 border-white object-cover shadow-sm" />
              ) : (
                <span className="bg-brand flex size-11 shrink-0 items-center justify-center rounded-2xl font-semibold text-white">{conversation.user.name.charAt(0).toUpperCase()}</span>
              )}
              <div className="min-w-0">
                <h2 className="truncate font-semibold">{conversation.user.name}</h2>
                <p className="text-xs text-muted-foreground">Private conversation</p>
              </div>
            </>
          ) : <h2 className="font-semibold">Conversation</h2>}
        </div>
      )}

      <div className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto">
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
          <ConversationSession key={conversationId} conversationId={conversationId} currentUserId={currentUserId} otherUserName={conversation.user.name} />
        )}
      </div>
    </>
  );
}
