import type { InfiniteData } from "@tanstack/react-query";
import type { ConversationSummary, Message, MessageCursor, MessageHistoryPage } from "@/types";

export const messagesKey = ["messages"] as const;
export const messageHistoryKey = (conversationId: string) => [...messagesKey, conversationId, "history"] as const;
export type CachedMessagePage = MessageHistoryPage & { loaded: boolean };
export type MessagesCache = InfiniteData<CachedMessagePage, MessageCursor | null>;

export function compareMessages(a: Message, b: Message) {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a._id.localeCompare(b._id);
}

// Both the broadcast and send acknowledgement contain the same saved MongoDB ID.
export function mergeMessages(...batches: Message[][]): Message[] {
  const unique = new Map<string, Message>();
  for (const batch of batches) {
    for (const message of batch) unique.set(message._id, message);
  }
  return [...unique.values()].sort(compareMessages);
}

export function appendLiveMessage(current: MessagesCache | undefined, message: Message): MessagesCache {
  const first = current?.pages[0] ?? { messages: [], hasMore: false, nextCursor: null, loaded: false };
  return {
    pages: [{ ...first, messages: mergeMessages(first.messages, [message]) }, ...(current?.pages.slice(1) ?? [])],
    pageParams: current?.pageParams ?? [null],
  };
}

export function mergeLatestPage(fetched: MessageHistoryPage, cached?: CachedMessagePage): CachedMessagePage {
  const latest = fetched.messages.at(-1);
  // Only preserve messages newer than this REST snapshot. Older history is loaded with its cursor.
  const arrivingDuringFetch = cached?.messages.filter((message) => !latest || compareMessages(message, latest) >= 0) ?? [];
  return { ...fetched, loaded: true, messages: mergeMessages(fetched.messages, arrivingDuringFetch) };
}

export function updateConversationPreview(conversations: ConversationSummary[], message: Message): ConversationSummary[] {
  return conversations.map((conversation) => {
    if (conversation.conversationId !== message.conversationId) return conversation;
    if (conversation.lastMessage && new Date(conversation.lastMessage.createdAt) > new Date(message.createdAt)) return conversation;
    return { ...conversation, lastMessage: message, lastActivityAt: message.createdAt };
  }).sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
}

export function mergeConversationPreviews(fetched: ConversationSummary[], cached: ConversationSummary[]): ConversationSummary[] {
  const previous = new Map(cached.map((conversation) => [conversation.conversationId, conversation]));
  return fetched.map((conversation) => {
    const cachedConversation = previous.get(conversation.conversationId);
    if (!cachedConversation?.lastMessage || new Date(cachedConversation.lastActivityAt) <= new Date(conversation.lastActivityAt)) return conversation;
    return { ...conversation, lastMessage: cachedConversation.lastMessage, lastActivityAt: cachedConversation.lastActivityAt };
  }).sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
}
