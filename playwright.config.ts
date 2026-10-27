import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/chat",
  timeout: 45_000,
  expect: { timeout: 15_000 },
  workers: 1,
  fullyParallel: false,
  reporter: "list",
  use: { baseURL: "http://localhost:3100", channel: "chrome", trace: "retain-on-failure" },
  projects: [
    { name: "unit", testMatch: "*.unit.spec.ts" },
    { name: "browser", testMatch: "*.browser.spec.ts" },
  ],
  webServer: [
    { command: "node tests/chat/fixture-server.cjs", url: "http://localhost:5101/__test/health", timeout: 30_000 },
    {
      command: "node node_modules/next/dist/bin/next dev --port 3100",
      url: "http://localhost:3100/login",
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_API_URL: "http://localhost:5101/api/v1",
        NEXT_PUBLIC_SOCKET_URL: "http://localhost:5101",
        NEXT_TEST_DIST_DIR: ".next-chat-tests",
      },
    },
  ],
});
