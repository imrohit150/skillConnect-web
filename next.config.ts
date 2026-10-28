import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
if (isProduction && !process.env.BACKEND_ORIGIN) {
  throw new Error("Set BACKEND_ORIGIN to the HTTPS backend origin before building for production.");
}
const backend = new URL(process.env.BACKEND_ORIGIN ?? "http://localhost:5000");
if (
  !["http:", "https:"].includes(backend.protocol) ||
  (isProduction && backend.protocol !== "https:") ||
  backend.username || backend.password || backend.pathname !== "/" ||
  backend.search || backend.hash
) {
  throw new Error("BACKEND_ORIGIN must be an HTTP(S) origin without a path, credentials, query or fragment; production requires HTTPS.");
}

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_TEST_DIST_DIR || ".next",
  typescript: {
    tsconfigPath: process.env.NEXT_TEST_DIST_DIR ? "tsconfig.chat-tests.json" : "tsconfig.json",
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend.origin}/api/v1/:path*`,
      },
      {
        // The browser uses no trailing slash; Engine.IO expects one upstream.
        source: "/socket.io",
        destination: `${backend.origin}/socket.io/`,
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
