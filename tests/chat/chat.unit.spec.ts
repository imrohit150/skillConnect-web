import { test, expect, type APIResponse } from "@playwright/test";
import { EventEmitter } from "node:events";
import { io } from "socket.io-client";
import { connectChat, type ChatSocket, type ChatConnectionState } from "../../src/lib/socket";
import { appendLiveMessage, mergeLatestPage, mergeMessages, updateConversationPreview, type CachedMessagePage } from "../../src/lib/chat-cache";
import type { Message, MessageHistoryPage } from "../../src/types";

const api = "http://localhost:5101";
const chatId = "aaaaaaaaaaaaaaaaaaaaaaaa";
const flush = () => new Promise<void>((resolve) => setImmediate(resolve));
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (reason: Error) => void; const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
const message = (id: string, time = "2026-10-27T10:00:00.000Z"): Message => ({ _id: id, conversationId: chatId, senderId: "user", content: "Hello", createdAt: time, updatedAt: time });

test("chat rejects an authenticated account whose email is not verified", async ({ request }) => {
  await request.post(`${api}/__test/reset`);
  await request.post(`${api}/__test/login`, { data: { user: "a" } });
  await request.post(`${api}/__test/control`, { data: { unverify: "a" } });
  const token = (await request.storageState()).cookies.find((cookie) => cookie.name === "accessToken")!.value;
  const socket = io(api, { autoConnect: false, reconnection: false, transports: ["websocket"], extraHeaders: { Cookie: `accessToken=${token}` } });
  try {
    const failure = new Promise<Error & { data?: { code?: string } }>((resolve, reject) => {
      socket.once("connect_error", resolve);
      socket.once("connect", () => reject(new Error("Unverified user was admitted")));
    });
    socket.connect();
    expect((await failure).data?.code).toBe("EMAIL_NOT_VERIFIED");
  } finally { socket.disconnect(); await request.post(`${api}/__test/reset`); }
});

test("chat rejects a socket cookie issued before a password reset", async ({ request }) => {
  await request.post(`${api}/__test/reset`);
  await request.post(`${api}/__test/login`, { data: { user: "a" } });
  const token = (await request.storageState()).cookies.find((cookie) => cookie.name === "accessToken")!.value;
  await request.post(`${api}/__test/control`, { data: { revokeSessions: "a" } });
  const socket = io(api, { autoConnect: false, reconnection: false, transports: ["websocket"], extraHeaders: { Cookie: `accessToken=${token}` } });
  try {
    const failure = new Promise<Error>((resolve, reject) => {
      socket.once("connect_error", resolve);
      socket.once("connect", () => reject(new Error("Revoked session was admitted")));
    });
    socket.connect();
    expect((await failure).message).toBe("Authentication error");
  } finally { socket.disconnect(); await request.post(`${api}/__test/reset`); }
});

test("stable history cursor visits all messages, including equal timestamps", async ({ request }) => {
  await request.post(`${api}/__test/reset`);
  await request.post(`${api}/__test/login`, { data: { user: "a" } });
  const seen: string[] = [];
  let cursor: { before: string; beforeId: string } | null = null;
  do {
    const response: APIResponse = await request.get(`${api}/api/v1/conversations/${chatId}/messages`, { params: { limit: 7, ...(cursor ?? {}) } });
    expect(response.ok()).toBeTruthy();
    const page: MessageHistoryPage = await response.json();
    seen.push(...page.messages.map((item: Message) => item._id));
    expect(page.hasMore).toBe(Boolean(page.nextCursor));
    cursor = page.nextCursor;
  } while (cursor);
  expect(seen).toHaveLength(55);
  expect(new Set(seen).size).toBe(55);
});

test("history rejects unauthorized users and invalid cursor inputs", async ({ request }) => {
  await request.post(`${api}/__test/reset`);
  await request.post(`${api}/__test/login`, { data: { user: "c" } });
  expect((await request.get(`${api}/api/v1/conversations/${chatId}/messages`)).status()).toBe(404);
  await request.post(`${api}/__test/login`, { data: { user: "a" } });
  const invalidQueries: Record<string, string>[] = [{ beforeId: "000000000000000000000001" }, { before: "bad-date" }, { limit: "0" }, { limit: "51" }];
  for (const params of invalidQueries) {
    expect((await request.get(`${api}/api/v1/conversations/${chatId}/messages`, { params })).status()).toBe(400);
  }
});

test("live updates retain pagination cursors and deduplicate acknowledgements", () => {
  const cursor = { before: "2026-10-27T09:00:00.000Z", beforeId: "01" };
  const first: CachedMessagePage = { messages: [message("02")], hasMore: true, nextCursor: cursor, loaded: true };
  const older: CachedMessagePage = { messages: [message("01", "2026-10-27T09:00:00.000Z")], hasMore: false, nextCursor: null, loaded: true };
  let cache = { pages: [first, older], pageParams: [null, cursor] };
  cache = appendLiveMessage(cache, message("03"));
  cache = appendLiveMessage(cache, message("03"));
  expect(cache.pages[0].nextCursor).toEqual(cursor);
  expect(cache.pages[1]).toBe(older);
  expect(mergeMessages(...cache.pages.map((page) => page.messages)).map((item) => item._id)).toEqual(["01", "02", "03"]);
  const initial = appendLiveMessage(undefined, message("03"));
  expect(initial.pages[0].loaded).toBe(false);
});

test("REST snapshots keep newly arrived messages without retaining a gap in old history", () => {
  const cached: CachedMessagePage = { messages: [message("old", "2026-10-27T08:00:00.000Z"), message("live", "2026-10-27T12:00:00.000Z")], hasMore: true, nextCursor: null, loaded: true };
  const result = mergeLatestPage({ messages: [message("snapshot", "2026-10-27T11:00:00.000Z")], hasMore: true, nextCursor: { before: "2026-10-27T11:00:00.000Z", beforeId: "snapshot" } }, cached);
  expect(result.messages.map((item) => item._id)).toEqual(["snapshot", "live"]);
  expect(result.loaded).toBe(true);
  const inbox = [{ conversationId: chatId, user: { _id: "other", name: "Other" }, lastMessage: message("latest"), lastActivityAt: "2026-10-27T10:00:00.000Z", canMessage: true }];
  expect(updateConversationPreview(inbox, message("old", "2026-10-27T09:00:00.000Z"))[0].lastMessage?._id).toBe("latest");
});

class FakeSocket extends EventEmitter {
  io = new EventEmitter(); connected = false; active = false; calls: { event: string; payload: unknown }[] = []; replies: Promise<unknown>[] = [];
  connect() { this.active = true; return this; }
  disconnect() { const connected = this.connected; this.connected = false; this.active = false; if (connected) super.emit("disconnect"); return this; }
  timeout() { return this; }
  emitWithAck(event: string, payload: unknown) { this.calls.push({ event, payload }); return this.replies.shift() ?? Promise.resolve({ success: true }); }
  open() { this.connected = true; super.emit("connect"); }
}

test("chat joins only the current room, ignores stale joins and cleans up", async () => {
  const socket = new FakeSocket(); const states: ChatConnectionState[] = []; const received: Message[] = [];
  const session = connectChat(socket as unknown as ChatSocket, (state) => states.push(state), async () => {}, (item) => received.push(item));
  socket.open(); await flush();
  const oldJoin = deferred<{ success: boolean }>(); socket.replies.push(oldJoin.promise);
  session.openConversation(chatId);
  session.openConversation("bbbbbbbbbbbbbbbbbbbbbbbb"); await flush();
  oldJoin.resolve({ success: false }); await flush();
  expect(states.at(-1)?.status).toBe("ready");
  expect(states.at(-1)?.conversationId).toBe("bbbbbbbbbbbbbbbbbbbbbbbb");
  await expect(session.sendMessage(chatId, "wrong chat")).rejects.toThrow(/connect/);
  socket.emit("message:new", message("background")); expect(received).toHaveLength(1);
  session.disconnect(); expect(socket.listenerCount("message:new")).toBe(0); expect(socket.io.listenerCount("reconnect_failed")).toBe(0);
  socket.emit("message:new", message("after")); expect(received).toHaveLength(1);
});

test("send validates, blocks concurrency, and never auto-resends an unconfirmed message", async () => {
  const socket = new FakeSocket(); const received: Message[] = [];
  const session = connectChat(socket as unknown as ChatSocket, () => {}, async () => {}, (item) => received.push(item));
  session.openConversation(chatId);
  await expect(session.sendMessage(chatId, "offline")).rejects.toThrow(/connect/);
  socket.open(); await flush();
  await expect(session.sendMessage(chatId, " ")).rejects.toThrow(/2000/);
  await expect(session.sendMessage(chatId, "x".repeat(2001))).rejects.toThrow(/2000/);
  const ack = deferred<{ success: true; message: Message }>(); socket.replies.push(ack.promise);
  const sending = session.sendMessage(chatId, "  Hello\nworld  ");
  await expect(session.sendMessage(chatId, "duplicate")).rejects.toThrow(/already/);
  const saved = message("saved"); socket.emit("message:new", saved); ack.resolve({ success: true, message: saved }); await sending;
  expect(mergeMessages(received)).toHaveLength(1);
  expect(socket.calls.at(-1)?.payload).toEqual({ conversationId: chatId, content: "Hello\nworld" });
  const timeout = deferred<never>(); socket.replies.push(timeout.promise);
  const unconfirmed = session.sendMessage(chatId, "uncertain"); timeout.reject(new Error("timeout"));
  await expect(unconfirmed).rejects.toThrow(/Delivery.*confirmed/);
  expect(socket.calls.filter((call) => call.event === "message:send")).toHaveLength(2);
  session.disconnect();
});
