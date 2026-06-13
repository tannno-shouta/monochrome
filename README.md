# MONOCHROME

モノトーンコーデの「読み物」型ファッションメディア。
[details.co.jp](https://www.details.co.jp/) の無彩色ミニマル世界観 ×
[collabcapitolium.fr](https://www.collabcapitolium.fr/) の章立てスクロール体験を融合した UX 体験型サイト。

テーマ：**モノトーンはセンスではなくロジック**

## スタック

- Next.js 16（App Router）+ React 19 + TypeScript
- Tailwind CSS v4（`@theme inline`）
- framer-motion 12（スクロール演出）

## コマンド

```bash
npm run dev        # 開発サーバ（Turbopack）
npm run build      # 本番ビルド
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## 構成

```
app/
  layout.tsx   # フォント・メタデータ（Server Component）
  page.tsx     # 章を縦に組み立てる司令塔（Server Component）
  globals.css  # モノトーン @theme + ノイズ/スクロールバー制御
components/
  scroll/      # 再利用スクロールプリミティブ（"use client"）
    ScrubVideo / PinnedHorizontal / DiagonalReveal / ParallaxDepth / RevealText / ChapterMarker
  chapters/    # 各章（Hero / Why / Tone / Texture / Silhouette / Lookbook / Closing）
  layout/      # ProgressRail（章ナビ）/ Footer
lib/
  metadata.ts  # SEO・OGP・JSON-LD・viewport
  chapters.ts  # 章メタの単一情報源
public/
  videos/      # TapNow 動画（下記参照）
  images/      # ポスター・作例画像
```

## 章ごとのスクロール演出

| 章 | 演出 | コンポーネント |
|---|---|---|
| Hero | 奥行き + スクラブ動画 | `ChapterHero` + `ScrubVideo` |
| 01 なぜ効くのか | 縦パララックス | `ParallaxDepth` |
| 02 トーンの設計 | 横スクロール・ピン留め | `PinnedHorizontal` |
| ✦ インタールード | 枠→動画フルスクリーンの3D portal（章間・シネマティック） | `PortalInterlude` |
| 03 質感 | 斜めスライドリビール | `DiagonalReveal` |
| 04 シルエット | スクラブ動画 | `ScrubVideo` |
| 05 ルックブック | 縦グリッド + スティッキー | sticky |
| Closing | テキスト出現 | `RevealText` |

## 素材（TapNow 動画・画像）の置き場

未配置でもレイアウトは崩れない（プレースホルダ表示）。以下を配置すると有効化：

| パス | 用途 |
|---|---|
| `public/videos/hero.mp4` | Hero フルスクリーン スクラブ動画 |
| `public/images/hero-poster.jpg` | Hero ポスター（reduced-motion 時/読込前） |
| `public/videos/silhouette.mp4` | Chapter 04 シルエット切替 スクラブ動画 |
| `public/images/silhouette-poster.jpg` | 同ポスター |
| `public/videos/interlude.mp4` | 章間 portal インタールード動画（autoplay loop・push-in撮影推奨） |
| `public/images/interlude-poster.jpg` | 同ポスター（reduced-motion時） |
| `public/videos/texture.mp4` | Chapter 03 背景動画（LIDNM風アイテムラック・autoplay loop） |
| `public/images/texture-poster.jpg` | 同ポスター（reduced-motion時） |
| `public/images/why.jpg` `texture-*.jpg` `look-*.jpg` | 各章スチル |

### スクラブ動画のエンコード要件（重要）

`ScrubVideo` は `video.currentTime` をスクロールで動かす。seek 耐性のため：

- 短尺（数秒）・低ビットレート・**頻繁なキーフレーム / all-intra 書き出し**
- H.264 MP4、`muted` / `playsInline`（コンポーネント側で設定済）
- モバイル用に低解像度バリアントを別途用意

### ⚠ プロトタイプ spike（本格運用前の意思決定ゲート）

`video.currentTime` 直スクラブは **iOS Safari / Android Chrome でデコード由来のカクつき**が出ることがある。
TapNow 動画を配置したら、**デスクトップ Chrome と iOS 実機**でスクラブの滑らかさを計測し、

- 滑らか → そのまま `ScrubVideo`（video 方式）
- カクつく → **フレーム連番画像方式**へ切替（`ffmpeg` で連番 WebP 抽出 → canvas/img 差し替え）

を決定する。`ScrubVideo` は同じ props で差し替えられる設計。

## ビルド時の注意

和文フォント（Noto Sans/Serif JP）のサブセットを Google Fonts から取得するため、
初回ビルドはネットワークが安定した環境で実行すること（`.next/cache` に蓄積され 2 回目以降は高速）。
