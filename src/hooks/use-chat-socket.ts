import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectChat, createChatSocket, type ChatConnectionState } from "@/lib/socket";
import { getMe } from "@/services/auth.services";
import { appendLiveMessage, messageHistoryKey, updateConversationPreview, type MessagesCache } from "@/lib/chat-cache";
import { conversationsKey } from "@/hooks/use-conversations";
import type { ConversationSummary, Message } from "@/types";

export function useChatSocket(conversationId: string | null) {
  const queryClient = useQueryClient();
  const [connection, setConnection] = useState<ChatConnectionState>({ conversationId: null, status: "connecting", error: null });
  const connectionRef = useRef<ReturnType<typeof connectChat> | null>(null);

  useEffect(() => {
    function receiveMessage(message: Message) {
      const key = messageHistoryKey(message.conversationId);
      // Don't create incomplete history for unopened chats. Their first REST request loads it.
      if (queryClient.getQueryState(key)) {
        queryClient.setQueryData<MessagesCache>(key, (current) => appendLiveMessage(current, message));
      }
      const inbox = queryClient.getQueryData<ConversationSummary[]>(conversationsKey);
      if (inbox?.some((conversation) => conversation.conversationId === message.conversationId)) {
        queryClient.setQueryData<ConversationSummary[]>(conversationsKey, (current) => current ? updateConversationPreview(current, message) : current);
      } else {
        void queryClient.invalidateQueries({ queryKey: conversationsKey });
      }
    }

    function connectionRemoved(userId: string) {
      queryClient.setQueryData<ConversationSummary[]>(conversationsKey, (current) =>
        current?.map((conversation) => conversation.user._id === userId ? { ...conversation, canMessage: false } : conversation),
      );
      void queryClient.invalidateQueries({ queryKey: ["connections"] });
      void queryClient.invalidateQueries({ queryKey: conversationsKey });
    }

    const session = connectChat(createChatSocket(), (state) => {
      setConnection(state);
      if (state.status === "ready") {
        if (state.conversationId) void queryClient.invalidateQueries({ queryKey: messageHistoryKey(state.conversationId), exact: true });
        void queryClient.invalidateQueries({ queryKey: conversationsKey });
      }
    }, getMe, receiveMessage, connectionRemoved);
    connectionRef.current = session;
    return () => { connectionRef.current = null; session.disconnect(); };
  }, [queryClient]);

  useEffect(() => { connectionRef.current?.openConversation(conversationId); }, [conversationId]);

  const retry = useCallback(() => connectionRef.current?.retry(), []);
  const sendMessage = useCallback(async (content: string) => {
    const session = connectionRef.current;
    if (!session || !conversationId) throw new Error("Wait for chat to connect before sending.");
    try {
      return await session.sendMessage(conversationId, content);
    } catch (error) {
      void queryClient.invalidateQueries({ queryKey: messageHistoryKey(conversationId), exact: true });
      void queryClient.invalidateQueries({ queryKey: conversationsKey });
      throw error;
    }
  }, [conversationId, queryClient]);

  const current = connection.conversationId === conversationId ? connection : { conversationId, status: "joining" as const, error: null };
  return { ...current, retry, sendMessage };
}

export type ChatControls = ReturnType<typeof useChatSocket>;
