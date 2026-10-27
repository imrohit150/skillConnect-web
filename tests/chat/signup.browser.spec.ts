import { test, expect, type Page } from "@playwright/test";

type Options = { pending?: boolean; status?: "sent" | "expired" | "locked"; failSignup?: boolean; failResend?: boolean; failSignIn?: boolean };
async function mockSignupApi(page: Page, options: Options = {}) {
  const calls: string[] = [];
  const user = { _id: "444444444444444444444444", name: "New Developer", email: "new@example.test", isEmailVerified: true, emailVerifiedAt: new Date().toISOString(), skills: [], profileImageUrl: "" };
  let authenticated = false;
  let signup = options.pending ? createPending() : null;
  let resendFails = options.failResend;
  function createPending() {
    return { email: user.email, expiresAt: new Date(Date.now() + 1800000).toISOString(), emailVerification: {
      status: options.status ?? "sent", expiresAt: new Date(Date.now() + (options.status === "expired" ? -1000 : 600000)).toISOString(),
      resendAvailableAt: new Date(Date.now() + (options.pending ? -1000 : 60000)).toISOString(), attemptsRemaining: options.status === "locked" ? 0 : 5,
    } };
  }
  await page.route("http://localhost:5101/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace("/api/v1", "");
    calls.push(path);
    const json = (status: number, body: unknown) => route.fulfill({ status, json: body });
    if (path === "/auth/me") return authenticated ? json(200, { user }) : json(401, { message: "Not signed in" });
    if (path === "/auth/refresh") return json(401, { message: "No session" });
    if (path === "/auth/signup") {
      if (options.failSignup) return json(503, { code: "VERIFICATION_EMAIL_FAILED", message: "Could not send your signup code. Please try again. Your account has not been created." });
      user.email = request.postDataJSON().email; signup = createPending();
      return json(202, { success: true, signup });
    }
    if (path === "/auth/signup/pending") return signup ? json(200, { signup }) : json(410, { code: "SIGNUP_EXPIRED", message: "Signup expired" });
    if (path === "/auth/email-verification/resend") {
      if (resendFails) { resendFails = false; return json(503, { code: "VERIFICATION_EMAIL_FAILED", message: "Could not send a new code. Please try again." }); }
      signup = createPending(); signup.emailVerification.status = "sent"; signup.emailVerification.attemptsRemaining = 5; signup.emailVerification.expiresAt = new Date(Date.now() + 600000).toISOString();
      return json(200, { signup });
    }
    if (path === "/auth/email-verification/verify") {
      expect(Object.keys(request.postDataJSON())).toEqual(["otp"]);
      if (request.postDataJSON().otp !== "001234") {
        if (signup) signup.emailVerification.attemptsRemaining--;
        return json(400, { code: "OTP_INCORRECT", message: "Incorrect verification code", attemptsRemaining: signup?.emailVerification.attemptsRemaining });
      }
      signup = null;
      if (options.failSignIn) return json(503, { code: "SIGNUP_LOGIN_FAILED", message: "Your email is verified and your account was created. Please log in to continue." });
      authenticated = true;
      return json(201, { user });
    }
    if (path === "/profile/me") return json(200, { user });
    if (path === "/auth/login") { authenticated = true; return json(200, { user }); }
    return json(200, { users: [], connections: [], conversations: [], pagination: { page: 1, totalPages: 0, hasNextPage: false } });
  });
  return { calls, isAuthenticated: () => authenticated };
}

async function fillSignup(page: Page) {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("New Developer");
  await page.getByLabel("Email address", { exact: true }).fill("new@example.test");
  await page.getByText("Select your birthday", { exact: true }).click();
  await page.getByRole("gridcell").filter({ hasText: /^1$/ }).first().getByRole("button").click();
  await page.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue with email", exact: true }).click();
}

test("signup verifies before account creation, survives reload and opens profile after OTP", async ({ page }) => {
  const api = await mockSignupApi(page);
  await fillSignup(page);
  await expect(page).toHaveURL(/\/verify-email$/);
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
  expect(api.isAuthenticated()).toBe(false);
  expect(api.calls.some((path) => path.startsWith("/profile") || path.startsWith("/users"))).toBe(false);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Resend code in/ })).toBeDisabled();
  await page.getByLabel("6-digit verification code").fill("999999");
  await page.getByRole("button", { name: "Verify & create account", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Incorrect verification code" })).toBeVisible();
  await expect(page.getByText("4 attempts left", { exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/signup-verification-desktop.png", fullPage: true });
  await page.getByLabel("6-digit verification code").fill("001234");
  await page.getByRole("button", { name: "Verify & create account", exact: true }).click();
  await expect(page).toHaveURL(/\/profile\?welcome=1$/);
  expect(api.isAuthenticated()).toBe(true);
});

test("email delivery failure stays on signup without creating an account", async ({ page }) => {
  const api = await mockSignupApi(page, { failSignup: true });
  await fillSignup(page);
  await expect(page.getByText(/Your account has not been created\./)).toBeVisible();
  await expect(page).toHaveURL(/\/signup$/);
  expect(api.isAuthenticated()).toBe(false);
});

test("expired OTP can be resent on mobile, with no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSignupApi(page, { pending: true, status: "expired" });
  await page.goto("/verify-email");
  await expect(page.getByLabel("6-digit verification code")).toBeDisabled();
  await expect(page.getByText(/This code has expired/)).toBeVisible();
  await page.getByRole("button", { name: "Resend code", exact: true }).click();
  await expect(page.getByLabel("6-digit verification code")).toBeEnabled();
  await expect(page.getByText("5 attempts left", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/signup-verification-mobile.png", fullPage: true });
});

test("locked OTP and a failed resend recover through a successful new code", async ({ page }) => {
  await mockSignupApi(page, { pending: true, status: "locked", failResend: true });
  await page.goto("/verify-email");
  await expect(page.getByLabel("6-digit verification code")).toBeDisabled();
  await page.getByRole("button", { name: "Resend code", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Could not send a new code. Please try again." })).toBeVisible();
  await page.getByRole("button", { name: "Resend code", exact: true }).click();
  await expect(page.getByLabel("6-digit verification code")).toBeEnabled();
});

test("a missing pending signup offers signup and login without displaying an OTP form", async ({ page }) => {
  await mockSignupApi(page);
  await page.goto("/verify-email");
  await expect(page.getByRole("heading", { name: "Start a new signup" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to signup" })).toHaveAttribute("href", "/signup");
  await expect(page.getByLabel("6-digit verification code")).toHaveCount(0);
});

test("a verified account with failed automatic sign-in is directed to login", async ({ page }) => {
  await mockSignupApi(page, { pending: true, failSignIn: true });
  await page.goto("/verify-email");
  await page.getByLabel("6-digit verification code").fill("001234");
  await page.getByRole("button", { name: "Verify & create account", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("region", { name: "Notifications alt+T" }).getByText(/Your email is verified and your account was created/)).toBeVisible();
});
