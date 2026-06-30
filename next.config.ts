import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // R3F(WebGL) の Canvas は StrictMode の二重マウントでコンテキストを破棄して真っ白になるため無効化。
  // 本番では二重マウントは起きないが、dev 体験のために切る（R3F プロジェクトの定番対応）。
  reactStrictMode: false,
  // 親階層の lockfile を誤検出しないよう、このプロジェクトを root に固定
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
