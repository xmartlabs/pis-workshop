import type { NextConfig } from "next";

export const JSON_SERVER = process.env.JSON_SERVER || "http://localhost:4000";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
