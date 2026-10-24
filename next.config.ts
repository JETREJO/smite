import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native SQLite driver: load it from node_modules instead of bundling it.
  serverExternalPackages: ["better-sqlite3"],
  // Claude's test server ("npm run dev:claude") builds into its own folder so it can run
  // next to the user's "npm run dev".
  distDir: process.env.DATA_AUTHOR === "claude" ? ".next-claude" : ".next",
};

export default nextConfig;
