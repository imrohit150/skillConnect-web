/* eslint-disable @typescript-eslint/no-require-imports -- This fixture loads the backend's CommonJS modules. */
// Isolated in-memory API: exercises the real backend history controller and Socket.IO handler.
// Never loads .env, connects to MongoDB, or contacts email/payment providers.
const http = require("node:http");
const path = require("node:path");
const { createRequire } = require("node:module");
const backend = createRequire(path.resolve(__dirname, "../../../skillConnect-backend/package.json"));
const jwt = backend("jsonwebtoken");
process.env.ACCESS_TOKEN_SECRET = "chat-fixture-secret-used-only-by-automated-tests";
process.env.CLIENT_URL = "http://localhost:3100";

const ids = { a: "111111111111111111111111", b: "222222222222222222222222", c: "333333333333333333333333", ab: "aaaaaaaaaaaaaaaaaaaaaaaa", ac: "bbbbbbbbbbbbbbbbbbbbbbbb" };
const avatar = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="20" fill="#0891b2"/><text x="40" y="52" text-anchor="middle" fill="white" font-size="36">S</text></svg>');
const users = [
  { _id: ids.a, name: "Alex Developer", email: "alex@example.test", premiumStatus: true },
  { _id: ids.b, name: "Blair Developer", email: "blair@example.test", premiumStatus: false },
  { _id: ids.c, name: "Casey Developer", email: "casey@example.test", premiumStatus: false },
].map((user) => ({ ...user, isEmailVerified: true, emailVerifiedAt: "2026-10-27T00:00:00.000Z", profileImageUrl: avatar, skills: ["React"] }));
let messages, conversations, connections, sequence, failOlder, failSend, silentSend;
function reset() {
  for (const user of users) user.isEmailVerified = true;
  sequence = 1000; failOlder = 0; failSend = false; silentSend = false;
  const createdAt = new Date(Date.now() - 86400000);
  conversations = [
    { _id: ids.ab, participantOne: ids.a, participantTwo: ids.b, createdAt, updatedAt: createdAt },
    { _id: ids.ac, participantOne: ids.a, participantTwo: ids.c, createdAt, updatedAt: createdAt },
  ];
  connections = [
    { _id: "ab", senderId: ids.a, recipientId: ids.b, status: "accepted" },
    { _id: "ac", senderId: ids.a, recipientId: ids.c, status: "accepted" },
  ];
  messages = Array.from({ length: 55 }, (_, index) => {
    const time = new Date(createdAt.getTime() + Math.floor(index / 3) * 1000);
    return { _id: (index + 1).toString(16).padStart(24, "0"), conversationId: ids.ab, senderId: index % 2 ? ids.a : ids.b, content: `Saved message ${String(index + 1).padStart(3, "0")}`, createdAt: time, updatedAt: time };
  });
}
reset();

function matches(document, filter) {
  return Object.entries(filter).every(([key, expected]) => {
    if (key === "$or") return expected.some((condition) => matches(document, condition));
    const actual = document[key];
    if (expected && typeof expected === "object" && !(expected instanceof Date)) {
      if ("$lt" in expected) return actual < expected.$lt;
    }
    return actual instanceof Date && expected instanceof Date ? actual.getTime() === expected.getTime() : String(actual) === String(expected);
  });
}
function query(getter, single = false) {
  let order, limit;
  const result = {
    select() { return result; },
    populate() { return result; },
    sort(value) { order = value; return result; },
    limit(value) { limit = value; return result; },
    then(resolve, reject) {
      let rows = getter().slice();
      if (order) rows.sort((a, b) => {
        for (const [key, direction] of Object.entries(order)) {
          if (a[key] < b[key]) return -direction;
          if (a[key] > b[key]) return direction;
        }
        return 0;
      });
      if (limit) rows = rows.slice(0, limit);
      return Promise.resolve(single ? rows[0] ?? null : rows).then(resolve, reject);
    },
  };
  return result;
}
function mockModule(modulePath, exports) {
  const filename = backend.resolve(modulePath);
  require.cache[filename] = { id: filename, filename, loaded: true, exports };
}
mockModule("./src/models/conversation.model", {
  findOne: (filter) => query(() => conversations.filter((row) => matches(row, filter)), true),
  find: (filter) => query(() => conversations.filter((row) => matches(row, filter)).map((row) => ({ ...row, participantOne: users.find((user) => user._id === row.participantOne), participantTwo: users.find((user) => user._id === row.participantTwo) }))),
  findOneAndUpdate: async (filter, update) => {
    let row = conversations.find((conversation) => matches(conversation, filter));
    if (!row) { row = { _id: (++sequence).toString(16).padStart(24, "0"), ...update.$setOnInsert, createdAt: new Date(), updatedAt: new Date() }; conversations.push(row); }
    return row;
  },
});
mockModule("./src/models/connection-request.model", {
  findOne: (filter) => query(() => connections.filter((row) => matches(row, filter)), true),
  find: (filter) => query(() => connections.filter((row) => matches(row, filter))),
  findOneAndDelete: async (filter) => { const row = connections.find((item) => matches(item, filter)); connections = connections.filter((item) => item !== row); return row; },
});
mockModule("./src/models/message.model", {
  find: (filter) => query(() => messages.filter((row) => matches(row, filter))),
  findOne: (filter) => query(() => messages.filter((row) => matches(row, filter)), true),
  create: async (values) => {
    if (failSend) { failSend = false; throw new Error("Fixture save failure"); }
    const row = { ...values, _id: (++sequence).toString(16).padStart(24, "0"), createdAt: new Date(), updatedAt: new Date() };
    messages.push(row);
    if (silentSend) { silentSend = false; return new Promise(() => {}); }
    return row;
  },
});
mockModule("./src/models/user.model", { findById: (id) => {
  const result = Promise.resolve(users.find((user) => user._id === id));
  result.select = () => result;
  return result;
} });
mockModule("./src/services/email.service", { sendEmail: async () => {} });
const { getMessages } = backend("./src/controllers/messages.controller");
const { getConversations, getOrCreateConversation } = backend("./src/controllers/conversations.controller");
const { removeConnection } = backend("./src/controllers/connections.controller");
const initSocket = backend("./src/socket");

function cookie(request, name) { return (request.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith(name + "="))?.slice(name.length + 1); }
async function body(request) { let data = ""; for await (const chunk of request) data += chunk; return data ? JSON.parse(data) : {}; }
function authenticate(request) { try { return jwt.verify(cookie(request, "accessToken"), process.env.ACCESS_TOKEN_SECRET).sub; } catch { return null; } }
function setSession(response, userId, expired = false) {
  const token = jwt.sign({ sub: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expired ? -1 : "15m" });
  response.setHeader("Set-Cookie", [`accessToken=${token}; Path=/; HttpOnly; SameSite=Lax`, `fixtureRefresh=${userId}; Path=/; HttpOnly; SameSite=Lax`]);
}
const server = http.createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL);
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH,OPTIONS");
  response.setHeader("Cache-Control", "no-store");
  response.status = (code) => { response.statusCode = code; return response; };
  response.json = (value) => { response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify(value)); };
  if (request.method === "OPTIONS") { response.statusCode = 204; return response.end(); }
  const url = new URL(request.url, "http://localhost:5101");
  try {
    if (url.pathname === "/__test/health") return response.json({ ok: true });
    if (url.pathname === "/__test/reset") { io.disconnectSockets(true); reset(); return response.json({ ok: true }); }
    if (url.pathname === "/__test/login") { const values = await body(request); setSession(response, ids[values.user], values.expired); return response.json({ ok: true }); }
    if (url.pathname === "/__test/control") {
      const values = await body(request);
      if (values.unverify) users.find((user) => user._id === ids[values.unverify]).isEmailVerified = false;
      if (values.failOlder) failOlder = values.failOlder;
      if (values.failSend) failSend = true;
      if (values.silentSend) silentSend = true;
      if (values.disconnect) io.in(`user:${ids[values.disconnect]}`).disconnectSockets(true);
      return response.json({ ok: true });
    }
    if (url.pathname === "/__test/messages") return response.json({ messages });
    if (url.pathname === "/api/v1/auth/refresh") {
      const userId = cookie(request, "fixtureRefresh");
      if (!users.some((user) => user._id === userId)) return response.status(401).json({ message: "Session expired" });
      setSession(response, userId); return response.json({ success: true });
    }
    request.user = authenticate(request);
    if (!request.user) return response.status(401).json({ message: "Authentication required" });
    request.params = {}; request.query = Object.fromEntries(url.searchParams); request.app = { get: () => io };
    if (["/api/v1/auth/me", "/api/v1/profile/me"].includes(url.pathname)) return response.json({ user: users.find((user) => user._id === request.user) });
    if (url.pathname === "/api/v1/conversations") return await getConversations(request, response);
    const history = url.pathname.match(/^\/api\/v1\/conversations\/([^/]+)\/messages$/);
    if (history) {
      request.params.conversationId = history[1];
      if (request.query.before && failOlder > 0) { failOlder--; return response.status(500).json({ message: "Fixture history failure" }); }
      return await getMessages(request, response);
    }
    const conversation = url.pathname.match(/^\/api\/v1\/conversations\/([^/]+)$/);
    if (conversation && request.method === "POST") { request.params.userId = conversation[1]; return await getOrCreateConversation(request, response); }
    const connection = url.pathname.match(/^\/api\/v1\/connections\/([^/]+)$/);
    if (connection && request.method === "DELETE") { request.params.userId = connection[1]; return await removeConnection(request, response); }
    if (url.pathname === "/api/v1/connections") return response.json({ connections: connections.filter((row) => row.senderId === request.user || row.recipientId === request.user).map((row) => ({ connectionId: row._id, connectedAt: new Date(), user: users.find((user) => user._id === (row.senderId === request.user ? row.recipientId : row.senderId)) })) });
    response.status(404).json({ message: "Not found" });
  } catch (error) { console.error(error); response.status(500).json({ message: "Fixture error" }); }
});
const io = initSocket(server);
server.listen(5101, "localhost", () => console.log("Isolated chat fixture listening on 5101"));
