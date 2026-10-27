import { io, type Socket } from "socket.io-client";
import type { Message } from "@/types";

type JoinConversationReply = { success: true } | { success: false; message: string };
type SendMessageReply = { success: true; message: Message } | { success: false; message: string };

type ServerEvents = {
  "message:new": (message: Message) => void;
  "connection:removed": (payload: { userId: string }) => void;
};

type ClientEvents = {
  "conversation:join": (payload: { conversationId: string }, acknowledge: (reply: JoinConversationReply) => void) => void;
  "conversation:leave": (payload: { conversationId: string }) => void;
  "message:send": (payload: { conversationId: string; content: string }, acknowledge: (reply: SendMessageReply) => void) => void;
};

export type ChatSocket = Socket<ServerEvents, ClientEvents>;
export type ChatConnectionState = {
  conversationId: string | null;
  status: "connecting" | "joining" | "ready" | "disconnected" | "error";
  error: string | null;
};

export function createChatSocket(): ChatSocket {
  return io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000", {
    autoConnect: false,
    withCredentials: true,
    forceNew: true,
    reconnectionAttempts: 5,
    timeout: 10_000,
  });
}

// One connection serves the Messages screen; the server delivers all of this user's inbox events.
export function connectChat(
  socket: ChatSocket,
  onStateChange: (state: ChatConnectionState) => void,
  restoreSession: () => Promise<unknown>,
  onMessage: (message: Message) => void = () => {},
  onConnectionRemoved: (userId: string) => void = () => {},
) {
  let conversationId: string | null = null;
  let stopped = false;
  let attempt = 0;
  let triedSessionRefresh = false;
  let ready = false;
  let sending = false;

  function update(status: ChatConnectionState["status"], error: string | null = null) {
    ready = status === "ready";
    if (!stopped) onStateChange({ status, error, conversationId });
  }

  async function onConnect() {
    const joinAttempt = ++attempt;
    triedSessionRefresh = false;
    update("joining");
    if (!conversationId) {
      update("ready");
      return;
    }
    try {
      // Rejoin on every connection, including a transport reconnection.
      const reply = await socket.timeout(10_000).emitWithAck("conversation:join", { conversationId });
      if (stopped || joinAttempt !== attempt || !socket.connected) return;
      if (!reply?.success) {
        update("error", reply?.message || "Couldn’t join this conversation.");
        return;
      }
      update("ready");
    } catch {
      if (!stopped && joinAttempt === attempt && socket.connected) {
        update("error", "The conversation didn’t respond in time. Please try again.");
      }
    }
  }

  function onDisconnect() {
    attempt++;
    update(socket.active ? "connecting" : "disconnected");
  }

  async function onConnectError(error: Error) {
    const authAttempt = ++attempt;
    if (error.message === "Authentication error") {
      if (triedSessionRefresh) {
        update("error", "Chat authentication failed. Please sign in again.");
        return;
      }
      triedSessionRefresh = true;
      update("connecting");
      try {
        // Reuse the REST client's shared refresh handling; HttpOnly cookies stay in the browser.
        await restoreSession();
        if (!stopped && authAttempt === attempt) socket.connect();
      } catch {
        if (!stopped && authAttempt === attempt) {
          update("error", "Couldn’t restore your session. Try again or sign in again.");
        }
      }
      return;
    }
    update(socket.active ? "connecting" : "error", socket.active ? null : "Couldn’t connect to chat. Please try again.");
  }

  function onReconnectFailed() {
    update("error", "Couldn’t reconnect to chat. Check your connection and try again.");
  }

  function receiveMessage(message: Message) {
    if (!stopped) onMessage(message);
  }

  function connectionRemoved(payload: { userId: string }) {
    if (!stopped) onConnectionRemoved(payload.userId);
  }

  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  socket.on("connect_error", onConnectError);
  socket.on("message:new", receiveMessage);
  socket.on("connection:removed", connectionRemoved);
  socket.io.on("reconnect_failed", onReconnectFailed);
  socket.connect();

  return {
    openConversation(nextId: string | null) {
      if (stopped || nextId === conversationId) return;
      if (conversationId && socket.connected) socket.emit("conversation:leave", { conversationId });
      conversationId = nextId;
      attempt++;
      if (socket.connected) void onConnect();
      else update("connecting");
    },
    async sendMessage(expectedId: string, value: string): Promise<Message> {
      const content = value.trim();
      if (!content || content.length > 2000) throw new Error("Messages must contain 1–2000 characters.");
      if (stopped || !ready || !socket.connected || conversationId !== expectedId) throw new Error("Wait for chat to connect before sending.");
      if (sending) throw new Error("A message is already being sent.");
      sending = true;
      try {
        let reply: SendMessageReply;
        try {
          reply = await socket.timeout(10_000).emitWithAck("message:send", { conversationId: expectedId, content });
        } catch {
          // A lost acknowledgement doesn't prove the message wasn't saved. Never resend automatically.
          throw new Error("Delivery wasn’t confirmed. Check the chat before retrying; your message may already have been sent.");
        }
        if (!reply?.success) throw new Error(reply?.message || "Couldn’t send your message. Please try again.");
        if (reply.message.conversationId !== expectedId) throw new Error("The message response didn’t match this conversation.");
        receiveMessage(reply.message);
        return reply.message;
      } finally {
        sending = false;
      }
    },
    retry() {
      if (stopped) return;
      attempt++;
      triedSessionRefresh = false;
      socket.disconnect();
      update("connecting");
      socket.connect();
    },
    disconnect() {
      stopped = true;
      attempt++;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("message:new", receiveMessage);
      socket.off("connection:removed", connectionRemoved);
      socket.io.off("reconnect_failed", onReconnectFailed);
      socket.disconnect();
    },
  };
}
