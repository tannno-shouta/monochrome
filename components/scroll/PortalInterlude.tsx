"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";
import { useHydrated } from "@/lib/useHydrated";
import { useBlobVideoSrc } from "@/lib/useBlobVideoSrc";
import { mirrorVideoToCanvas, primeVideoDecode } from "@/lib/videoCanvasMirror";

interface PortalInterludeProps {
  id?: string;
  /** 動画ソース（スクロール連動スクラブ・末尾フラッシュアウト前提の素材） */
  src: string;
  /** モバイル用の軽量動画ソース（中央クロップ版。省略時は src を使う） */
  srcMobile?: string;
  /** ポスター画像（reduced-motion 時／読込前／モバイル背景） */
  poster: string;
  /** スクリーンリーダー・代替テキスト */
  label: string;
  eyebrow?: string;
  caption?: string;
}

/**
 * 章間 portal インタールード（枠＝アパレルの「下げ札 / タグ」形状）。
 *
 * 構成（手前→奥）:
 *  1. 手前に「下げ札」型の枠（上角カット＋紐穴＋吊り紐＋ラベルの意匠）＋ 枠内に動画
 *     - 動画は clip-path でタグ形にクリップ → スクロールで長方形にモーフ＝全画面に展開
 *  2. 奥にも動画（背景・最初はぼかし＆暗め → スクロールでクリア）
 * 枠を通り抜けて動画だけに。両動画とも Ken Burns で奥行き。
 *
 * パフォーマンス（codex review 反映）:
 *  - .kenburns(CSS transform) と framer の scale を別要素に分離（transform 競合回避）
 *  - IntersectionObserver で画面外は再生停止（デコード負荷を抑制）
 *  - モバイルは背景動画をポスター画像に置換（動画デコードを1枚に削減）
 *  - reduced-motion はポスター静止にフォールバック
 */
export function PortalInterlude({
  id,
  src,
  srcMobile,
  poster,
  label,
  eyebrow,
  caption,
}: PortalInterludeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const fgVideoRef = useRef<HTMLVideoElement>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // SSR の HTML に src を書くとプリローダーがモバイルでも PC 用動画を先読みするため、
  // hydration 後（= isMobile 確定後）に URL を確定し、blob 化してからスクラブに使う
  // （iOS Safari は preload を無視するため、メモリに載せないとシークが応答しない）。
  // null の間は poster のみ。
  const hydrated = useHydrated();
  const resolvedUrl = hydrated ? (isMobile && srcMobile ? srcMobile : src) : null;
  const resolvedSrc = useBlobVideoSrc(resolvedUrl);

  const { scrollYProgress } = useScroll({
    // reduced-motion 分岐では ref を描画しないため、その時は target を渡さない
    target: prefersReducedMotion ? undefined : ref,
    offset: ["start start", "end end"],
  });

  // 奥の動画（背景）: わずかに縮みながら、ぼかし→クリア・暗→明
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.3, 1.02]);
  const bgBlur = useTransform(scrollYProgress, [0, 0.72], [10, 0]);
  const bgBright = useTransform(scrollYProgress, [0, 0.72], [0.32, 1]);
  const bgFilter = useMotionTemplate`blur(${bgBlur}px) brightness(${bgBright})`;

  // 手前の下げ札: せり上がり（push-in）＋わずかな立体回転
  const frameScale = useTransform(scrollYProgress, [0, 1], [0.82, 4]);
  const frameRotateX = useTransform(scrollYProgress, [0, 0.6], [6, 0]);

  // タグ形 clip-path（上角カット）→ 長方形へモーフ＝全画面に展開
  const cornerX = useTransform(scrollYProgress, [0, 0.7], [16, 0]);
  const cornerXR = useTransform(cornerX, (v) => 100 - v);
  const notch = useTransform(scrollYProgress, [0, 0.7], [13, 0]);
  const tagClip = useMotionTemplate`polygon(${cornerX}% 0%, ${cornerXR}% 0%, 100% ${notch}%, 100% 100%, 0% 100%, 0% ${notch}%)`;

  // 枠の意匠（タグの輪郭・紐・ラベル）は終盤でフェード＝枠を通り抜ける
  const chromeOpacity = useTransform(scrollYProgress, [0.5, 0.82], [1, 0]);
  // 手前レイヤ全体は最後にフェード＝奥の動画（フルスクリーン）に一本化
  const frontOpacity = useTransform(scrollYProgress, [0.86, 0.96], [1, 0]);

  // 入口の黒フラッシュ（吸い込み）。出口は動画末尾の白フラッシュアウトに任せる
  const flash = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // モバイル（iOS 対策）: fg の表示は canvas ミラーに任せ、video はシーク専用にする。
  // iOS はデコーダを落として video 要素が黒落ち/静止画のままになるため、
  // seeked のたびに canvas へ描画 ＋ priming（muted play→pause）で起こす。
  useEffect(() => {
    if (!isMobile || prefersReducedMotion) return;
    const video = fgVideoRef.current;
    const canvas = fgCanvasRef.current;
    if (!video || !canvas || !resolvedSrc) return;

    const cleanupMirror = mirrorVideoToCanvas(video, canvas);
    const prime = () => primeVideoDecode(video);
    if (video.readyState >= 1) prime();
    else video.addEventListener("loadedmetadata", prime, { once: true });

    return () => {
      cleanupMirror();
      video.removeEventListener("loadedmetadata", prime);
    };
  }, [isMobile, prefersReducedMotion, resolvedSrc]);

  // スクロール連動スクラブ: scrollYProgress を video.currentTime に写像。
  // 末尾の白フラッシュアウトが「Interlude を抜ける瞬間」に1回だけ出る（ループ点滅しない）。
  useEffect(() => {
    if (prefersReducedMotion) return;
    const vids = [bgVideoRef.current, fgVideoRef.current].filter(
      (v): v is HTMLVideoElement => v != null,
    );
    if (!vids.length) return;

    let raf = 0;
    let target = 0;
    let duration = 0;

    const tick = () => {
      raf = 0;
      if (duration <= 0) return;
      let again = false;
      for (const v of vids) {
        const cur = v.currentTime;
        const next = cur + (target - cur) * 0.2;
        if (Math.abs(next - cur) > 0.01) {
          try {
            v.currentTime = next;
          } catch {}
          again = true;
        }
      }
      if (again) raf = requestAnimationFrame(tick);
    };

    // onMeta は readyState>=1 なら同期実行されるため、tick より後に定義しない（TDZ 回避）
    const onMeta = () => {
      duration = Math.max(...vids.map((v) => v.duration || 0));
      // src 注入/差替（hydration 後・breakpoint またぎ）直後も、次の scroll イベントを
      // 待たずに現在のスクロール位置のフレームへ即同期させる
      if (duration > 0) {
        target = Math.min(Math.max(scrollYProgress.get(), 0), 1) * duration;
        if (!raf) raf = requestAnimationFrame(tick);
      }
    };
    vids.forEach((v) => {
      if (v.readyState >= 1) onMeta();
      v.addEventListener("loadedmetadata", onMeta);
    });

    const unsubscribe = scrollYProgress.on("change", (p) => {
      if (duration <= 0) return;
      target = Math.min(Math.max(p, 0), 1) * duration;
      if (!raf) raf = requestAnimationFrame(tick);
    });

    return () => {
      unsubscribe();
      if (raf) cancelAnimationFrame(raf);
      vids.forEach((v) => v.removeEventListener("loadedmetadata", onMeta));
    };
    // resolvedSrc 確定後に bg <video> が出現するため、確定時に再実行して両動画を捕捉し直す
  }, [prefersReducedMotion, isMobile, scrollYProgress, resolvedSrc]);

  if (prefersReducedMotion) {
    return (
      <section id={id} className="relative h-screen bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt={label}
          className="h-full w-full object-cover opacity-80"
        />
        {caption && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="max-w-2xl font-heading text-2xl text-paper md:text-4xl">
              {caption}
            </p>
          </div>
        )}
      </section>
    );
  }

  return (
    <section id={id} ref={ref} className="relative h-[300vh] bg-ink">
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ perspective: 1200 }}
      >
        {/* 奥の動画（背景）— scale/filter はラッパー、Ken Burns は内側 video に分離 */}
        <motion.div
          style={{ scale: bgScale, filter: bgFilter, willChange: "transform" }}
          className="absolute inset-0"
        >
          {isMobile || !resolvedSrc ? (
            // モバイル: 背景は静止画でデコードを1枚に削減（src 確定前も poster で統一）
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              aria-hidden
              className="h-full w-full object-cover"
            />
          ) : (
            <video
              ref={bgVideoRef}
              src={resolvedSrc}
              poster={poster}
              muted
              playsInline
              preload="auto"
              aria-hidden
              className="h-full w-full object-cover"
            />
          )}
        </motion.div>

        {/* 手前: 下げ札（タグ）＋ 枠内に動画 */}
        <motion.div
          style={{ opacity: frontOpacity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            style={{
              scale: frameScale,
              rotateX: frameRotateX,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
            className="relative aspect-[13/16] w-[44vw] md:w-[26vw]"
          >
            {/* 枠内に動画（タグ形にクリップ → 長方形へ展開）。
                clipPath はラッパーに掛け、モバイルは canvas ミラーを video の上に重ねる */}
            <motion.div
              style={{ clipPath: tagClip }}
              className="absolute inset-0 overflow-hidden"
            >
              <video
                ref={fgVideoRef}
                src={resolvedSrc ?? undefined}
                poster={poster}
                muted
                playsInline
                preload="auto"
                aria-label={label}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <canvas
                ref={fgCanvasRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full md:hidden"
              />
            </motion.div>

            {/* 下げ札の意匠（輪郭・紐穴・吊り紐・ラベル）— 終盤でフェード */}
            <motion.div
              style={{ opacity: chromeOpacity }}
              className="pointer-events-none absolute inset-0"
            >
              {/* タグ輪郭＋紐穴（SVG・ストロークは拡大しても一定） */}
              <svg
                viewBox="0 0 130 160"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <path
                  d="M21 1 L109 1 L129 22 L129 159 L1 159 L1 22 Z"
                  fill="none"
                  stroke="#f5f4f2"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={65}
                  cy={16}
                  r={5}
                  fill="none"
                  stroke="#f5f4f2"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* 吊り紐（タグの上にぶら下がる） */}
              <svg
                viewBox="0 0 40 60"
                preserveAspectRatio="xMidYMax meet"
                className="absolute bottom-full left-1/2 h-[14%] w-[30%] -translate-x-1/2"
              >
                <path
                  d="M20 60 C6 44 4 18 20 6 C36 18 34 44 20 60"
                  fill="none"
                  stroke="#f5f4f2"
                  strokeWidth={1.2}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* ブランド名・ナンバー */}
              <span className="absolute inset-x-0 top-[16%] text-center font-display text-[11px] tracking-[0.4em] text-paper">
                {eyebrow ?? "MONOCHROME"}
              </span>
              <span className="absolute inset-x-0 top-[22%] text-center font-display text-[9px] tracking-[0.3em] text-gray-3">
                No. 01
              </span>

              {/* 下部キャプション */}
              {caption && (
                <p className="absolute inset-x-5 bottom-6 text-center font-heading text-sm leading-snug text-paper md:text-base">
                  {caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 章間の黒フラッシュ（吸い込み） */}
        <motion.div
          style={{ opacity: flash }}
          className="pointer-events-none absolute inset-0 bg-ink"
        />
      </div>
    </section>
  );
}
