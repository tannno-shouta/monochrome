"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ChapterMarker } from "@/components/scroll/ChapterMarker";
import { RevealText } from "@/components/scroll/RevealText";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * CHAPTER 05 — 抜け感という色気（三首の注釈ダイアグラム）
 * 色気＝意図してつくった“隙”。首・手首・足首の「三首」を抜くテクを図解する。
 */
const points = [
  {
    no: "首",
    en: "NECK",
    top: "13%",
    ja: "開襟・Vネック・タートルの抜き。視線が集まる場所をゆるめる。",
  },
  {
    no: "手首",
    en: "WRIST",
    top: "49%",
    ja: "袖をひとまくり。時計と素肌で“余裕”を覗かせる。",
  },
  {
    no: "足首",
    en: "ANKLE",
    top: "85%",
    ja: "裾を上げて素足を見せる。重心が軽くなり、抜けが出る。",
  },
];

export function ChapterIroke() {
  const prefersReducedMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
  };
  const dot: Variants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: EASE } },
      };
  const lineV: Variants = prefersReducedMotion
    ? { hidden: { scaleX: 1 }, visible: { scaleX: 1 } }
    : {
        hidden: { scaleX: 0 },
        visible: { scaleX: 1, transition: { duration: 0.8, ease: EASE } },
      };
  const labelV: Variants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, x: -8 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
      };

  return (
    <section id="iroke" className="bg-bg py-32 md:py-48">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center">
        {/* 左: 三首の注釈ダイアグラム */}
        <motion.figure
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
          className="relative mx-auto w-full max-w-sm"
        >
          {/* 人物プレースホルダ（縦長） */}
          <div className="aspect-[3/5] w-full bg-gray-3">
            {/* TODO: /images/iroke.jpg を配置 */}
          </div>

          {/* 注釈マーカー（首・手首・足首）— md+ のみオーバーレイ */}
          {points.map((p) => (
            <div
              key={p.en}
              className="absolute right-0 hidden translate-x-[calc(100%-1px)] items-center md:flex"
              style={{ top: p.top }}
            >
              <motion.span
                variants={dot}
                className="h-2 w-2 shrink-0 rounded-full bg-ink"
              />
              <motion.span
                variants={lineV}
                style={{ originX: 0 }}
                className="h-px w-10 bg-ink"
              />
              <motion.span variants={labelV} className="ml-3 whitespace-nowrap">
                <span className="font-heading text-base text-ink">{p.no}</span>
                <span className="ml-2 font-display text-[10px] tracking-[0.3em] text-gray-2">
                  {p.en}
                </span>
              </motion.span>
            </div>
          ))}
        </motion.figure>

        {/* 右: コピー */}
        <div className="flex flex-col gap-8">
          <ChapterMarker
            no="05"
            titleEn="The Art of Negative Space"
            titleJa="抜け感という色気"
          />

          <RevealText
            as="p"
            delay={0.1}
            className="font-heading text-xl leading-relaxed text-ink md:text-3xl md:leading-relaxed"
          >
            色気とは、意図してつくった“隙”だ。
          </RevealText>

          <span className="h-px w-16 bg-gray-2" />

          <RevealText
            as="p"
            delay={0.2}
            className="font-body text-base leading-loose text-gray-1 md:text-lg"
          >
            きっちり締めた装いに、一点の余白を落とす。抜け感の王道は“三首”——
            首・手首・足首。最も視線が集まる細い場所をゆるめると、
            張り詰めた無彩色に呼吸が生まれる。
          </RevealText>

          {/* 三首の内訳 */}
          <ul className="flex flex-col divide-y divide-gray-3 border-y border-gray-3">
            {points.map((p, i) => (
              <RevealText key={p.en} as="li" delay={0.25 + i * 0.08}>
                <div className="flex items-baseline gap-4 py-4">
                  <span className="w-16 shrink-0 font-heading text-base text-ink">
                    {p.no}
                  </span>
                  <p className="font-body text-sm leading-relaxed text-gray-1">
                    {p.ja}
                  </p>
                </div>
              </RevealText>
            ))}
          </ul>

          <RevealText
            as="p"
            delay={0.5}
            className="font-body text-sm leading-loose text-gray-2"
          >
            ——抜くのは全身で一〜二ヶ所まで。やり過ぎは色気ではなく“チャラさ”に転ぶ。
            そして抜け感は、清潔感の上にしか乗らない。
          </RevealText>
        </div>
      </div>
    </section>
  );
}
