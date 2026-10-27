import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as conversationsService from "@/services/conversations.services";
import { mergeMessages } from "@/lib/chat-cache";
import type { MessageHistoryPage } from "@/types";

export const messagesKey = ["messages"] as const;

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const queryKey = [...messagesKey, conversationId];
  return useQuery({
    // Each conversation needs its own cache entry so switching chats never mixes messages.
    queryKey,
    queryFn: async () => {
      const page = await conversationsService.getMessages(conversationId);
      // Preserve live messages that arrived while this history request was in flight.
      const cached = queryClient.getQueryData<MessageHistoryPage>(queryKey);
      return { ...page, messages: mergeMessages(page.messages, cached?.messages ?? []) };
    },
  });
}
