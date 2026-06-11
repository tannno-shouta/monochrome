"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ScrubVideo } from "@/components/scroll/ScrubVideo";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * OPENING — 奥行き + スクラブ動画。
 * 読み込み時にタイトルがマスクからせり上がる初期演出 + スクロールで奥へ抜ける。
 * TapNow 動画を /videos/hero.mp4・ポスターを /images/hero-poster.jpg に配置すると有効化。
 */
export function ChapterHero() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // タイトルが手前にせり出して消える（奥行き）
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  // タグラインは別速度で動く（モーション階層）
  const tagY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);

  // 初期マスクリビール（reduced-motion では即時表示）
  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  };
  const maskUp: Variants = prefersReducedMotion
    ? { hidden: { y: "0%" }, visible: { y: "0%" } }
    : {
        hidden: { y: "115%" },
        visible: { y: "0%", transition: { duration: 1.1, ease: EASE } },
      };
  const fadeIn: Variants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
      };
  const line: Variants = prefersReducedMotion
    ? { hidden: { scaleX: 1 }, visible: { scaleX: 1 } }
    : {
        hidden: { scaleX: 0 },
        visible: { scaleX: 1, transition: { duration: 1.2, ease: EASE } },
      };

  return (
    <section id="opening" ref={ref} className="relative h-[180vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        {/* スクラブ動画（フルスクリーン背景） */}
        <ScrubVideo
          src="/videos/hero.mp4"
          poster="/images/hero-poster.jpg"
          label="モノトーンコーデのオープニング映像"
          priority
          className="absolute inset-0 h-full w-full opacity-70"
        />

        {/* トップバー */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 text-paper md:px-10"
        >
          <motion.span
            variants={fadeIn}
            className="font-display text-sm tracking-[0.3em]"
          >
            MONOCHROME
          </motion.span>
          <motion.span
            variants={fadeIn}
            className="font-display text-[10px] tracking-[0.35em] text-gray-3"
          >
            THE LOGIC OF DRESS
          </motion.span>
        </motion.div>

        {/* タイトルオーバーレイ */}
        <motion.div
          style={
            prefersReducedMotion
              ? undefined
              : { scale: titleScale, opacity: titleOpacity }
          }
          variants={container}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center"
        >
          <div className="overflow-hidden">
            <motion.span
              variants={fadeIn}
              className="block font-display text-xs uppercase tracking-[0.5em] text-gray-3"
            >
              Men’s Monochrome Coordinate
            </motion.span>
          </div>

          <div className="overflow-hidden pb-[0.1em]">
            <motion.h1
              variants={maskUp}
              className="block font-display text-6xl font-light leading-none tracking-wide text-paper md:text-[10rem]"
            >
              MONOCHROME
            </motion.h1>
          </div>

          {/* タイトル下のヘアライン（描画） */}
          <motion.span
            variants={line}
            style={{ originX: 0.5 }}
            className="block h-px w-24 bg-paper/60 md:w-40"
          />

          <div className="overflow-hidden">
            <motion.p
              variants={fadeIn}
              className="block max-w-md font-heading text-base text-gray-3 md:text-xl"
            >
              モノトーンの静寂さで、大人の洗練さを纏う。
            </motion.p>
          </div>
        </motion.div>

        {/* スクロール誘導（縦線 + ラベル） */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="font-display text-[10px] tracking-[0.4em] text-gray-2">
            SCROLL
          </span>
          <span className="relative block h-12 w-px overflow-hidden bg-paper/20">
            {!prefersReducedMotion && (
              <motion.span
                className="absolute inset-x-0 top-0 h-1/2 bg-paper"
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
              />
            )}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
