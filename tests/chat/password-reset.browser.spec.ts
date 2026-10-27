import { test, expect, type Page } from "@playwright/test";

const token = "a".repeat(64);
async function mockApi(page: Page, options: { failRequest?: boolean; failReset?: boolean; expired?: boolean; signedIn?: boolean } = {}) {
  const resets: unknown[] = []; const requests: unknown[] = [];
  let failRequest = options.failRequest, failReset = options.failReset, signedIn = options.signedIn;
  await page.route("http://localhost:5101/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace("/api/v1", "");
    const json = (status: number, body: unknown) => route.fulfill({ status, json: body });
    if (path === "/auth/me") return signedIn ? json(200, { user: { _id: "111111111111111111111111", name: "Developer", email: "developer@example.test", isEmailVerified: true } }) : json(401, { message: "No session" });
    if (path === "/auth/refresh") return json(401, { message: "No session" });
    if (path === "/auth/forgot-password") {
      requests.push(route.request().postDataJSON());
      if (failRequest) { failRequest = false; return json(503, { message: "Could not process your request. Please try again." }); }
      return json(200, { success: true, message: "If an account exists, a reset link will be sent." });
    }
    if (path === "/auth/reset-password") {
      resets.push(route.request().postDataJSON());
      if (options.expired) return json(400, { code: "INVALID_RESET_TOKEN", message: "This reset link is invalid or has expired." });
      if (failReset) { failReset = false; return json(500, { message: "Could not update your password. Please try again." }); }
      signedIn = false;
      return json(200, { success: true, message: "Password updated" });
    }
    return json(200, { user: { name: "Developer", skills: [] } });
  });
  return { resets, requests };
}
async function fillPasswords(page: Page) {
  await page.getByLabel("New password", { exact: true }).fill("Updated-password-456");
  await page.getByLabel("Confirm new password", { exact: true }).fill("Updated-password-456");
}

test("login links to recovery and request confirmation doesn't disclose account existence", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await page.getByRole("textbox", { name: "Email address", exact: true }).fill("unknown@example.test");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
  await expect(page.getByText(/If an account exists for this email/)).toBeVisible();
  expect(api.requests).toEqual([{ email: "unknown@example.test" }]);
  await page.getByRole("button", { name: "Try again or use another email" }).click();
  await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
});

test("failed requests retain the email and can be retried", async ({ page }) => {
  await mockApi(page, { failRequest: true });
  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill("developer@example.test");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Could not process" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toHaveValue("developer@example.test");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
});

test("reset link survives reload, validates confirmation, submits once and returns to login", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto(`/reset-password#token=${token}`);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
  expect(api.resets).toHaveLength(0);
  await page.getByLabel("New password", { exact: true }).fill("Updated-password-456");
  await page.getByLabel("Confirm new password", { exact: true }).fill("Different-password");
  await expect(page.getByText("Passwords do not match", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save new password" })).toBeDisabled();
  await page.getByLabel("Confirm new password", { exact: true }).fill("Updated-password-456");
  await page.screenshot({ path: "test-results/password-reset-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByRole("heading", { name: "Password updated" })).toBeVisible();
  expect(api.resets).toEqual([{ token, newPassword: "Updated-password-456" }]);
  await expect(page).toHaveURL(/\/reset-password$/);
  await page.getByRole("link", { name: "Back to login", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("expired or used links offer a new reset request", async ({ page }) => {
  await mockApi(page, { expired: true });
  await page.goto(`/reset-password#token=${token}`);
  await fillPasswords(page);
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByRole("heading", { name: "Request a new link" })).toBeVisible();
  await page.getByRole("link", { name: "Get a new reset link" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
});

test("missing and malformed links don't submit password resets", async ({ page }) => {
  const api = await mockApi(page);
  for (const path of ["/reset-password", "/reset-password#token=invalid"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Request a new link" })).toBeVisible();
    await expect(page.getByLabel("New password", { exact: true })).toHaveCount(0);
  }
  expect(api.resets).toHaveLength(0);
});

test("server failure preserves password entry and allows retry", async ({ page }) => {
  await mockApi(page, { failReset: true });
  await page.goto(`/reset-password#token=${token}`);
  await fillPasswords(page);
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Could not update" })).toBeVisible();
  await expect(page.getByLabel("New password", { exact: true })).toHaveValue("Updated-password-456");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByRole("heading", { name: "Password updated" })).toBeVisible();
});

test("reset remains accessible while signed in and fits a mobile screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApi(page, { signedIn: true });
  await page.goto(`/reset-password#token=${token}`);
  await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/password-reset-mobile.png", fullPage: true });
  await fillPasswords(page);
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByRole("heading", { name: "Password updated" })).toBeVisible();
});

test("opening a replacement link in the same tab clears the previous expired-link state", async ({ page }) => {
  const options = { expired: true };
  const api = await mockApi(page, options);
  await page.goto(`/reset-password#token=${token}`);
  await fillPasswords(page);
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByRole("heading", { name: "Request a new link" })).toBeVisible();
  options.expired = false;
  const replacement = "b".repeat(64);
  await page.goto(`/reset-password#token=${replacement}`);
  await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
  await fillPasswords(page);
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByRole("heading", { name: "Password updated" })).toBeVisible();
  expect(api.resets.at(-1)).toEqual({ token: replacement, newPassword: "Updated-password-456" });
});
