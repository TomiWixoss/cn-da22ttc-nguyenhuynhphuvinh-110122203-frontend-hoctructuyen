import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Cấu hình workspace root để tránh cảnh báo
  outputFileTracingRoot: process.cwd(),

  // Vô hiệu hóa TypeScript checking trong build
  typescript: {
    ignoreBuildErrors: true,
  },
} as any;

export default nextConfig;
