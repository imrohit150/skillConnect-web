import { api } from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";
import type { Conversation, ConversationSummary, MessageHistoryPage, MessageHistoryQuery } from "@/types";

export async function getConversations() {
  return (await api<{ conversations: ConversationSummary[] }>(API_ROUTES.conversations.list)).conversations;
}

export async function getOrCreateConversation(userId: string) {
  return (await api<{ conversation: Conversation }>(API_ROUTES.conversations.create(userId), {
    method: "POST",
  })).conversation;
}

export function getMessages(conversationId: string, { before, limit }: MessageHistoryQuery = {}) {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  if (limit !== undefined) params.set("limit", String(limit));

  const path = API_ROUTES.conversations.messages(conversationId);
  const query = params.toString();
  // Each batch is already oldest-to-newest; `before` requests an older batch.
  return api<MessageHistoryPage>(query ? `${path}?${query}` : path);
}
