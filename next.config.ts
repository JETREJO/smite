import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native SQLite driver: load it from node_modules instead of bundling it.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
