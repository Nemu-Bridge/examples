import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: import.meta.dirname },
  serverExternalPackages: ["@nemu-ai/sdk"],
};

export default config;
