import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const api = "http://localhost:5101";
const ab = "aaaaaaaaaaaaaaaaaaaaaaaa";
const ac = "bbbbbbbbbbbbbbbbbbbbbbbb";
const userA = "111111111111111111111111";
async function login(context: BrowserContext, user: string, expired = false) { await context.request.post(`${api}/__test/login`, { data: { user, expired } }); }
async function openChat(page: Page, id = ab) {
  await page.goto(`/messages?conversation=${id}`);
  await expect(page.getByText("Chat connected", { exact: true })).toBeVisible();
}
function history(page: Page) { return page.locator('[aria-label="Message history"]'); }
async function send(page: Page, content: string) {
  await page.getByRole("textbox", { name: /Message to/ }).fill(content);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("textbox", { name: /Message to/ })).toHaveValue("");
}
test.beforeEach(async ({ request }) => { await request.post(`${api}/__test/reset`); });

test("loads all older messages with stable scroll position and no duplicates", async ({ page, context }) => {
  await login(context, "a"); await openChat(page);
  await expect(history(page).locator("[data-message-id]")).toHaveCount(20);
  await page.getByRole("button", { name: "Load older messages", exact: true }).scrollIntoViewIfNeeded();
  const anchor = history(page).locator("[data-message-id]").first();
  const anchorId = await anchor.getAttribute("data-message-id");
  const before = (await anchor.boundingBox())!.y;
  await page.getByRole("button", { name: "Load older messages", exact: true }).click();
  await expect(history(page).locator("[data-message-id]")).toHaveCount(40);
  const after = (await history(page).locator(`[data-message-id="${anchorId}"]`).boundingBox())!.y;
  expect(Math.abs(after - before)).toBeLessThan(4);
  await page.getByRole("button", { name: "Load older messages", exact: true }).click();
  await expect(history(page).locator("[data-message-id]")).toHaveCount(55);
  await expect(page.getByText("Beginning of conversation", { exact: true })).toBeVisible();
  expect(new Set(await history(page).locator("[data-message-id]").evaluateAll((elements) => elements.map((element) => element.getAttribute("data-message-id")))).size).toBe(55);
  await page.getByRole("button", { name: /Latest messages/ }).click();
  await expect(history(page).getByText("Saved message 055", { exact: true })).toBeInViewport();
  await page.screenshot({ path: "test-results/chat-desktop.png", fullPage: true });
});

test("older history failures preserve messages and can be retried", async ({ page, context, request }) => {
  await login(context, "a"); await openChat(page);
  await expect(history(page).locator("[data-message-id]")).toHaveCount(20);
  await request.post(`${api}/__test/control`, { data: { failOlder: 2 } });
  await page.getByRole("button", { name: "Load older messages", exact: true }).click();
  await expect(page.getByText(/Couldn’t load older messages/)).toBeVisible();
  await expect(history(page).locator("[data-message-id]")).toHaveCount(20);
  await page.getByRole("button", { name: "Retry older messages", exact: true }).click();
  await expect(history(page).locator("[data-message-id]")).toHaveCount(40);
});

test("starts a chat from Connections and keeps the inbox live with no chat selected", async ({ page, context, browser }) => {
  const second = await browser.newContext(); await login(context, "a"); await login(second, "b");
  await page.goto("/connections");
  await page.getByRole("button", { name: "Message", exact: true }).first().click();
  await expect(page).toHaveURL(new RegExp(`conversation=${ab}`));
  await expect(page.getByText("Chat connected", { exact: true })).toBeVisible();
  await page.goto("/messages");
  await expect(page.getByText("Select a conversation", { exact: true })).toBeVisible();
  const blair = await second.newPage(); await openChat(blair); await send(blair, "Inbox delivery");
  await expect(page.getByRole("link").filter({ hasText: "Blair Developer" })).toContainText("Inbox delivery");
  await second.close();
});

test("two users exchange saved messages once and retain them after reload", async ({ page, context, browser }) => {
  const second = await browser.newContext(); await login(context, "a"); await login(second, "b");
  const blair = await second.newPage(); await openChat(page); await openChat(blair);
  await send(page, "Hello from Alex");
  await expect(history(page).getByText("Hello from Alex", { exact: true })).toHaveCount(1);
  await expect(history(blair).getByText("Hello from Alex", { exact: true })).toHaveCount(1);
  await send(blair, "Hello from Blair");
  await expect(history(page).getByText("Hello from Blair", { exact: true })).toBeVisible();
  await page.reload(); await expect(history(page).getByText("Hello from Alex", { exact: true })).toBeVisible();
  await expect(history(page).getByText("Hello from Blair", { exact: true })).toBeVisible();
  await second.close();
});

test("background chats update the inbox without leaking messages to a third user", async ({ page, context, browser }) => {
  const second = await browser.newContext(); const third = await browser.newContext();
  await login(context, "a"); await login(second, "b"); await login(third, "c");
  const blair = await second.newPage(); const casey = await third.newPage();
  await openChat(page, ac); await openChat(blair); await openChat(casey, ac);
  await send(blair, "Private message for Alex");
  await expect(page.getByRole("link").filter({ hasText: "Blair Developer" })).toContainText("Private message for Alex");
  await expect(history(page).getByText("Private message for Alex", { exact: true })).toHaveCount(0);
  await expect(casey.getByText("Private message for Alex", { exact: true })).toHaveCount(0);
  expect((await third.request.get(`${api}/api/v1/conversations/${ab}/messages`)).status()).toBe(404);
  await page.getByRole("link").filter({ hasText: "Blair Developer" }).click();
  await expect(history(page).getByText("Private message for Alex", { exact: true })).toBeVisible();
  await second.close(); await third.close();
});

test("new messages do not move a reader until they jump to the latest", async ({ page, context, browser }) => {
  const second = await browser.newContext(); await login(context, "a"); await login(second, "b");
  const blair = await second.newPage(); await openChat(page); await openChat(blair);
  await expect(history(page).locator("[data-message-id]")).toHaveCount(20);
  await history(page).evaluate((element) => { element.scrollTop = 0; });
  await expect(page.getByRole("button", { name: /Latest messages/ })).toBeVisible();
  await send(blair, "New while you read");
  await expect(page.getByRole("button", { name: "1 new message", exact: true })).toBeVisible();
  expect(await history(page).evaluate((element) => element.scrollTop)).toBeLessThan(5);
  await page.getByRole("button", { name: "1 new message", exact: true }).click();
  await expect(history(page).getByText("New while you read", { exact: true })).toBeInViewport();
  await second.close();
});

test("reconnect restores an expired cookie session and missed history", async ({ page, context, browser, request }) => {
  const second = await browser.newContext(); await login(context, "a"); await login(second, "b");
  const blair = await second.newPage(); await openChat(page); await openChat(blair);
  await request.post(`${api}/__test/control`, { data: { disconnect: "a" } });
  await expect(page.getByText("Chat disconnected", { exact: true })).toBeVisible();
  await send(blair, "Sent while disconnected");
  await login(context, "a", true);
  await page.getByRole("button", { name: "Reconnect", exact: true }).click();
  await expect(page.getByText("Chat connected", { exact: true })).toBeVisible();
  await expect(history(page).getByText("Sent while disconnected", { exact: true })).toBeVisible();
  await send(page, "Back online");
  await expect(history(blair).getByText("Back online", { exact: true })).toBeVisible();
  await second.close();
});

test("failed sends retain the draft and allow a successful retry", async ({ page, context, request }) => {
  await login(context, "a"); await openChat(page);
  await request.post(`${api}/__test/control`, { data: { failSend: true } });
  await page.getByRole("textbox", { name: /Message to/ }).fill("Keep this draft");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByText("Unable to send message", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /Message to/ })).toHaveValue("Keep this draft");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("textbox", { name: /Message to/ })).toHaveValue("");
  await expect(history(page).getByText("Keep this draft", { exact: true })).toHaveCount(1);
});

test("a lost acknowledgement refreshes history and does not send twice", async ({ page, context, request }) => {
  await login(context, "a"); await openChat(page);
  await request.post(`${api}/__test/control`, { data: { silentSend: true } });
  await page.getByRole("textbox", { name: /Message to/ }).fill("Unconfirmed delivery");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByText(/Delivery.*confirmed/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: /Message to/ })).toHaveValue("Unconfirmed delivery");
  await expect(history(page).getByText("Unconfirmed delivery", { exact: true })).toHaveCount(1);
  const data = await (await request.get(`${api}/__test/messages`)).json();
  expect(data.messages.filter((item: { content: string }) => item.content === "Unconfirmed delivery")).toHaveLength(1);
});

test("removing a connection disables sending for both participants", async ({ page, context, browser }) => {
  const second = await browser.newContext(); await login(context, "a"); await login(second, "b");
  const blair = await second.newPage(); await openChat(page); await openChat(blair);
  expect((await second.request.delete(`${api}/api/v1/connections/${userA}`)).ok()).toBeTruthy();
  await expect(page.getByText(/You’re no longer connected/)).toBeVisible();
  await expect(blair.getByText(/You’re no longer connected/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: /Message to/ })).toHaveCount(0);
  await expect(history(page).locator("[data-message-id]")).toHaveCount(20);
  await second.close();
});

test("mobile chat supports navigation, multiline input and sending without overflow", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 760 }); await login(context, "a"); await openChat(page);
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeDisabled();
  const input = page.getByRole("textbox", { name: /Message to/ });
  await input.fill("First line"); await input.press("Shift+Enter"); await input.pressSequentially("Second line");
  await expect(input).toHaveValue("First line\nSecond line");
  await input.press("Enter"); await expect(input).toHaveValue("");
  await expect(history(page).locator("[data-message-id]").last()).toContainText("First line");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: "test-results/chat-mobile.png", fullPage: true });
  await page.getByRole("link", { name: "Back to conversations", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your conversations", exact: true })).toBeVisible();
  await page.getByRole("link").filter({ hasText: "Blair Developer" }).click();
  await expect(history(page).locator("[data-message-id]").last()).toContainText("First line");
});
