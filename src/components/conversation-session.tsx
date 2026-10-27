"use client";

import { Loader2, Wifi, WifiOff } from "lucide-react";
import { ConversationHistory } from "@/components/conversation-history";
import { MessageComposer } from "@/components/message-composer";
import { Button } from "@/components/ui/button";
import type { ChatControls } from "@/hooks/use-chat-socket";
import { cn } from "@/lib/utils";

type ConversationSessionProps = {
  conversationId: string;
  currentUserId?: string;
  otherUserName: string;
  canMessage: boolean;
  chat: ChatControls;
};

const connectionLabels = {
  connecting: "Connecting to chat…",
  joining: "Joining conversation…",
  ready: "Chat connected",
  disconnected: "Chat disconnected",
  error: "Chat connection unavailable",
};

export function ConversationSession({ conversationId, currentUserId, otherUserName, canMessage, chat }: ConversationSessionProps) {
  const { status, error, retry, sendMessage } = chat;
  const pending = status === "connecting" || status === "joining";
  const canRetry = status === "error" || status === "disconnected";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b bg-white/40 px-4 py-2.5 text-xs sm:px-5">
        <p role="status" className={cn("flex items-center gap-1.5 text-muted-foreground", status === "ready" && "text-emerald-700")}>
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : status === "ready" ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
          {connectionLabels[status]}
        </p>
        {canRetry && <Button onClick={retry} variant="outline" size="xs" className="ml-auto cursor-pointer rounded-lg bg-white">Reconnect</Button>}
        {error && <p role="alert" className="w-full leading-relaxed text-destructive">{error}</p>}
      </div>
      <ConversationHistory conversationId={conversationId} currentUserId={currentUserId} otherUserName={otherUserName} />
      {canMessage ? <MessageComposer canSend={status === "ready"} otherUserName={otherUserName} onSend={sendMessage} /> : (
        <p role="status" className="shrink-0 border-t bg-white/65 p-4 text-center text-sm text-muted-foreground">You’re no longer connected. Reconnect with this developer to send messages.</p>
      )}
    </div>
  );
}
