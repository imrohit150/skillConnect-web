import { useQuery } from "@tanstack/react-query";
import * as conversationsService from "@/services/conversations.services";

export const messagesKey = ["messages"] as const;

export function useMessages(conversationId: string) {
  return useQuery({
    // Each conversation needs its own cache entry so switching chats never mixes messages.
    queryKey: [...messagesKey, conversationId],
    queryFn: () => conversationsService.getMessages(conversationId),
  });
}
