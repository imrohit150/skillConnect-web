import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectConversation, createChatSocket, type ChatConnectionState } from "@/lib/socket";
import { getMe } from "@/services/auth.services";
import { mergeMessages, updateConversationPreview } from "@/lib/chat-cache";
import { conversationsKey } from "@/hooks/use-conversations";
import { messagesKey } from "@/hooks/use-messages";
import type { ConversationSummary, Message, MessageHistoryPage } from "@/types";

export function useConversationSocket(conversationId: string) {
  const queryClient = useQueryClient();
  const [connection, setConnection] = useState<ChatConnectionState>({ status: "connecting", error: null });
  const connectionRef = useRef<ReturnType<typeof connectConversation> | null>(null);

  useEffect(() => {
    const socket = createChatSocket();
    const historyKey = [...messagesKey, conversationId];
    function receiveMessage(message: Message) {
      queryClient.setQueryData<MessageHistoryPage>(historyKey, (current) => ({
        messages: mergeMessages(current?.messages ?? [], [message]),
        hasMore: current?.hasMore ?? false,
      }));
      queryClient.setQueryData<ConversationSummary[]>(conversationsKey, (current) =>
        current ? updateConversationPreview(current, message) : current,
      );
    }
    const session = connectConversation(socket, conversationId, (state) => {
      setConnection(state);
      if (state.status === "ready") {
        // Reconcile messages sent before joining or while the connection was interrupted.
        void queryClient.invalidateQueries({ queryKey: historyKey, exact: true });
        void queryClient.invalidateQueries({ queryKey: conversationsKey });
      }
    }, getMe, receiveMessage);
    connectionRef.current = session;

    return () => {
      connectionRef.current = null;
      session.disconnect();
    };
  }, [conversationId, queryClient]);

  const retry = useCallback(() => connectionRef.current?.retry(), []);
  const sendMessage = useCallback(async (content: string) => {
    const session = connectionRef.current;
    if (!session) throw new Error("Wait for chat to connect before sending.");
    try {
      return await session.sendMessage(content);
    } catch (error) {
      // A timeout can hide a successful save. Refresh history instead of resending.
      void queryClient.invalidateQueries({ queryKey: [...messagesKey, conversationId], exact: true });
      void queryClient.invalidateQueries({ queryKey: conversationsKey });
      throw error;
    }
  }, [conversationId, queryClient]);
  return { ...connection, retry, sendMessage };
}
