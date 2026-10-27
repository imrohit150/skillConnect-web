import type { ConversationSummary, Message } from "@/types";

// Both the broadcast and send acknowledgement contain the same saved MongoDB ID.
export function mergeMessages(...batches: Message[][]): Message[] {
  const unique = new Map<string, Message>();
  for (const batch of batches) {
    for (const message of batch) unique.set(message._id, message);
  }
  return [...unique.values()].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a._id.localeCompare(b._id),
  );
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
