"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";

interface PortalInterludeProps {
  id?: string;
  /** 動画ソース（autoplay loop muted・push-in 撮影の TapNow 素材推奨） */
  src: string;
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
  poster,
  label,
  eyebrow,
  caption,
}: PortalInterludeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const fgVideoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

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

  // 章間の黒フラッシュ（吸い込み）
  const flash = useTransform(scrollYProgress, [0, 0.12, 0.9, 1], [1, 0, 0, 1]);

  useEffect(() => {
    const decide = () =>
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    decide();
    window.addEventListener("resize", decide);
    return () => window.removeEventListener("resize", decide);
  }, []);

  // 画面外では動画を停止（デコード負荷を抑制）
  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = ref.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const videos = [bgVideoRef.current, fgVideoRef.current];
        for (const v of videos) {
          if (!v) continue;
          if (entry.isIntersecting) void v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

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
          {isMobile ? (
            // モバイル: 背景は静止画でデコードを1枚に削減
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
              src={src}
              poster={poster}
              muted
              loop
              autoPlay
              playsInline
              aria-hidden
              className="kenburns h-full w-full object-cover"
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
            {/* 枠内に動画（タグ形にクリップ → 長方形へ展開） */}
            <motion.video
              ref={fgVideoRef}
              src={src}
              poster={poster}
              muted
              loop
              autoPlay
              playsInline
              aria-label={label}
              style={{ clipPath: tagClip }}
              className="kenburns absolute inset-0 h-full w-full object-cover"
            />

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
