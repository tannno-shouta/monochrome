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
 * CHAPTER 05 — 抜け感という色気（髪・首元・腕の注釈ダイアグラム）
 * 色気＝意図してつくった“隙”。髪のほつれ・シャツの首元・腕まくりを図解する。
 */
// dot = 実写上の部位座標（viewBox 60x100 = 3:5 プレートに一致）、label = 右外ラベルの縦位置(%)
const points = [
  {
    no: "髪",
    en: "HAIR",
    dot: [35, 15],
    label: 12,
    ja: "ベースはセンターパート。前髪を目尻あたりにほつれさせ、ちょうどいい抜け感で色気を構築。",
  },
  {
    no: "首元",
    en: "NECK",
    dot: [33, 25],
    label: 26,
    ja: "ボタンは“1つ開け”。上まで閉めると堅苦しく、2つはだらしない。1つ開けが最も知的で、色気を構築。",
  },
  {
    no: "腕",
    en: "ARM",
    dot: [40, 43],
    label: 48,
    ja: "肘より上には上げず、きっちり折りたたみすぎない無造作な腕まくり。大人の余裕で、色気を構築。",
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
    ? { hidden: { pathLength: 1 }, visible: { pathLength: 1 } }
    : {
        hidden: { pathLength: 0 },
        visible: { pathLength: 1, transition: { duration: 0.8, ease: EASE } },
      };
  const labelV: Variants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, x: -8 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
      };

  return (
    <section id="iroke" className="bg-[#525252] py-32 md:py-48">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center">
        {/* 左: 三首の注釈ダイアグラム */}
        <motion.figure
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
          className="relative mx-auto w-full max-w-sm"
        >
          {/* 抜け感の実例（TapNow 生成: 首元1つ開け・腕まくり・前髪ほつれ） */}
          <div className="aspect-[3/5] w-full overflow-hidden bg-[#3a3a3a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/iroke.jpg"
              alt="白シャツの首元を1つ開け、袖を肘下まで無造作にまくった抜け感の実例"
              className="h-full w-full object-cover"
            />
          </div>

          {/* 注釈（点＝実写の部位に直打ち → 細線が右外のラベルへ伸びる）— md+ のみ */}
          <svg
            aria-hidden
            viewBox="0 0 60 100"
            className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible md:block"
          >
            {points.map((p) => (
              <g key={p.en}>
                <motion.circle
                  variants={dot}
                  cx={p.dot[0]}
                  cy={p.dot[1]}
                  r={0.65}
                  className="fill-paper"
                />
                {/* 点から斜めに立ち上がり、途中で折れて水平にラベルへ届く折れ線 */}
                <motion.polyline
                  variants={lineV}
                  points={`${p.dot[0]},${p.dot[1]} 52,${p.label} 66,${p.label}`}
                  fill="none"
                  strokeWidth={0.18}
                  className="stroke-paper/70"
                />
              </g>
            ))}
          </svg>
          {points.map((p) => (
            <motion.span
              key={p.en}
              variants={labelV}
              className="absolute hidden whitespace-nowrap md:block"
              style={{ left: "110%", top: `calc(${p.label}% - 0.8em)` }}
            >
              <span className="font-heading text-base text-paper">{p.no}</span>
              <span className="ml-2 font-display text-[10px] tracking-[0.3em] text-paper/60">
                {p.en}
              </span>
            </motion.span>
          ))}
        </motion.figure>

        {/* 右: コピー */}
        <div className="flex flex-col gap-8">
          <ChapterMarker
            no="05"
            titleEn="The Art of Negative Space"
            titleJa="抜け感という色気"
            inverted
          />

          <RevealText
            as="p"
            delay={0.1}
            className="font-heading text-xl leading-relaxed text-paper md:text-3xl md:leading-relaxed"
          >
            色気とは、意図してつくった“隙”だ。
          </RevealText>

          <span className="h-px w-16 bg-paper/40" />

          <RevealText
            as="p"
            delay={0.2}
            className="font-body text-base leading-loose text-paper/85 md:text-lg"
          >
            きっちり締めた装いに、一点の余白を落とす。抜け感とは——髪のほつれ、シャツの首元、腕まくり。きっちりした装いの中に、程よい“頑張りすぎない余裕”を演出することです。
          </RevealText>

          {/* 三首の内訳 */}
          <ul className="flex flex-col divide-y divide-paper/20 border-y border-paper/20">
            {points.map((p, i) => (
              <RevealText key={p.en} as="li" delay={0.25 + i * 0.08}>
                <div className="flex items-baseline gap-4 py-4">
                  <span className="w-16 shrink-0 font-heading text-base text-paper">
                    {p.no}
                  </span>
                  <p className="font-body text-sm leading-relaxed text-paper/80">
                    {p.ja}
                  </p>
                </div>
              </RevealText>
            ))}
          </ul>

          {/* 章の締め（テーゼ）。スクロール検知の取りこぼしを避けるため出現アニメなしの常時表示 */}
          <p className="font-body text-sm leading-loose text-paper/75 md:text-base">
            抜け感は、“清潔感”と“キレイめ”の土台の上にしか成り立たない。髪、首元、腕での抜け感の一工夫で、“大人の色気”を昇華できます。
          </p>
        </div>
      </div>
    </section>
  );
}
