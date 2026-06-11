import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 親階層の lockfile を誤検出しないよう、このプロジェクトを root に固定
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
