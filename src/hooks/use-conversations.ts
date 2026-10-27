import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as conversationsService from "@/services/conversations.services";
import { mergeConversationPreviews } from "@/lib/chat-cache";
import type { ConversationSummary } from "@/types";

export const conversationsKey = ["conversations"] as const;

export function useConversations() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: conversationsKey,
    queryFn: async () => {
      const conversations = await conversationsService.getConversations();
      // Don't overwrite a newer live preview with an older REST snapshot.
      const cached = queryClient.getQueryData<ConversationSummary[]>(conversationsKey) ?? [];
      return mergeConversationPreviews(conversations, cached);
    },
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: conversationsService.getOrCreateConversation,
    // Refresh a previously visited inbox too, so the new conversation is available on arrival.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: conversationsKey, refetchType: "all" }),
  });
}
