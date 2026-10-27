import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import * as conversationsService from "@/services/conversations.services";
import { mergeMessages, mergeLatestPage, messageHistoryKey, type MessagesCache } from "@/lib/chat-cache";
import type { MessageCursor } from "@/types";

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const queryKey = messageHistoryKey(conversationId);
  const query = useInfiniteQuery({
    // Each conversation needs its own cache entry so switching chats never mixes messages.
    queryKey,
    initialPageParam: null as MessageCursor | null,
    queryFn: async ({ pageParam, signal }) => {
      const page = await conversationsService.getMessages(conversationId, pageParam ?? {}, signal);
      if (pageParam) return { ...page, loaded: true };
      const cached = queryClient.getQueryData<MessagesCache>(queryKey);
      return mergeLatestPage(page, cached?.pages[0]);
    },
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    refetchOnWindowFocus: true,
  });
  const messages = useMemo(() => mergeMessages(...(query.data?.pages.map((page) => page.messages) ?? [])), [query.data]);
  return { ...query, messages, hasLoaded: Boolean(query.data?.pages[0]?.loaded) };
}
