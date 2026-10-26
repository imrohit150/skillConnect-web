import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as conversationsService from "@/services/conversations.services";

export const conversationsKey = ["conversations"] as const;

export function useConversations() {
  return useQuery({
    queryKey: conversationsKey,
    queryFn: conversationsService.getConversations,
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
