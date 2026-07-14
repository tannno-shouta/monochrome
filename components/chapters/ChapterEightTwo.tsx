"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ChapterMarker } from "@/components/scroll/ChapterMarker";

/**
 * CHAPTER 06 — 8:2、大人の黄金比（反転スプリット）
 * 進入時は「自我」の面が 8 割（=20代の状態、アイテム語が雑多に浮かぶ）。
 * 一拍おいて境界線がスライドし、社会性 8 : 自我 2 に反転（=30代の比率）。
 * 広くなった社会性の面に本文が現れ、自我は右端 2 割の帯として残る——
 * レイアウトそのものが比率の証明になる構成。
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const FLIP_DELAY_MS = 1600;

// 20代の喧騒（自我 8 割の面に雑多に浮かぶアイテム語）
const YOUTH_NOISE = [
  { text: "ロゴT", top: "14%", left: "10%", rotate: -6 },
  { text: "ダメージデニム", top: "30%", left: "52%", rotate: 4 },
  { text: "厚底スニーカー", top: "50%", left: "16%", rotate: -3 },
  { text: "アクセ全部盛り", top: "64%", left: "56%", rotate: 7 },
  { text: "キャップ", top: "24%", left: "78%", rotate: -8 },
  { text: "派手カラー", top: "78%", left: "32%", rotate: 3 },
];

const BREAKDOWN = [
  {
    label: "社会性 8",
    items: "ジャケット / シャツ / スラックス / 綺麗なデニム——清潔感のある“外さない”土台",
  },
  {
    label: "自我 2",
    items: "スニーカー / アクセサリー / メガネ / 帽子 / 髪の毛先の動き——“自分らしさ”の置き場",
  },
] as const;

function BodyBlocks() {
  return (
    <>
      <p className="font-body text-base leading-loose text-ink md:text-lg">
        周りとの調和を 8 割、自分らしさを 2 割。——調和を大切にしながら、自分のこだわりを諦めない、大人の在り方。
      </p>
      <p className="font-body text-base leading-loose text-gray-1 md:text-lg">
        30代からは、見られ方がそのまま信頼になる。土台は“シーンに馴染むこと”——信頼があって初めて、個性は正しく伝わる。ただし、すべてを社会に合わせると生き苦しい。だから
        2 割の自我を、“スパイス”として馴染ませる。
      </p>
      <div className="flex flex-col gap-4">
        {BREAKDOWN.map((b) => (
          <div
            key={b.label}
            className="grid grid-cols-[5.5rem_1fr] gap-4 border-t border-ink/15 pt-4"
          >
            <span className="pt-1 font-display text-xs tracking-[0.3em] text-ink">
              {b.label}
            </span>
            <p className="font-body text-sm leading-relaxed text-gray-1 md:text-base">
              {b.items}
            </p>
          </div>
        ))}
      </div>
      <p className="font-body text-base leading-loose text-gray-1 md:text-lg">
        “目立つこと”や“若さ”を全面に出すと、30代では“痛い”。2
        割に留めること——それ自体が、大人の余裕。
      </p>
      <p className="font-heading text-lg leading-relaxed text-ink md:text-xl">
        “ちゃんとしてるのに、洒落てる”——8:2 は、そう思われるための設計図。
      </p>
    </>
  );
}

export function ChapterEightTwo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  // reduced-motion では進入と同時に反転済み状態へ（大きなレイアウト移動を見せない）
  const adult = reduceMotion ? inView : flipped;

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const timer = setTimeout(() => setFlipped(true), FLIP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [inView, reduceMotion]);

  const panelT = reduceMotion ? { duration: 0 } : { duration: 1.4, ease: EASE };
  const fadeIn = { duration: 0.8, delay: adult ? 0.7 : 0 };

  return (
    <section id="eight-two" className="bg-bg py-32 md:py-48">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <ChapterMarker no="06" titleEn="Eight to Two" titleJa="8:2、大人の黄金比" />
        <p className="mt-8 max-w-xl font-heading text-xl leading-relaxed text-ink md:text-3xl md:leading-relaxed">
          なぜ、社会性 8：自我 2 が“大人の黄金比”なのか？
        </p>

        {/* ===== PC: 反転スプリット ===== */}
        <div className="mt-16 hidden overflow-hidden border border-ink/15 md:flex">
          {/* 社会性の面（2割 → 8割へ拡大） */}
          <motion.div
            className="relative overflow-hidden bg-paper"
            initial={false}
            animate={{ width: adult ? "80%" : "20%" }}
            transition={panelT}
          >
            {/* youth: 縦の控えめラベル */}
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <motion.span
                animate={{ opacity: adult ? 0 : 1 }}
                transition={{ duration: 0.4 }}
                className="font-display text-xs tracking-[0.5em] text-ink/45 [writing-mode:vertical-rl]"
              >
                社会性 — 2
              </motion.span>
            </span>
            {/* adult: 本文（幅を固定して高さを安定させる） */}
            <motion.div
              animate={{ opacity: adult ? 1 : 0 }}
              transition={fadeIn}
              className="flex w-[30rem] flex-col gap-7 p-10 lg:w-[42rem] lg:p-14"
            >
              <p className="font-display text-xs tracking-[0.4em] text-gray-2">
                SOCIALITY 8 — シーンに馴染む
              </p>
              <BodyBlocks />
            </motion.div>
          </motion.div>

          {/* 自我の面（8割 → 2割の帯へ縮小） */}
          <motion.div
            className="relative overflow-hidden bg-ink"
            initial={false}
            animate={{ width: adult ? "20%" : "80%" }}
            transition={panelT}
          >
            {/* youth: 20代の喧騒 */}
            <motion.div
              animate={{ opacity: adult ? 0 : 1 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none absolute inset-0"
            >
              <span className="absolute right-6 top-5 font-display text-6xl font-light text-paper/10">
                EGO 8
              </span>
              {YOUTH_NOISE.map((n) => (
                <span
                  key={n.text}
                  className="absolute font-heading text-sm text-paper/70 lg:text-base"
                  style={{ top: n.top, left: n.left, transform: `rotate(${n.rotate}deg)` }}
                >
                  {n.text}
                </span>
              ))}
              <p className="absolute bottom-6 left-6 font-heading text-base text-paper lg:text-lg">
                20代は、自我が主役でよかった。
              </p>
            </motion.div>
            {/* adult: 2割の帯 */}
            <motion.div
              animate={{ opacity: adult ? 1 : 0 }}
              transition={fadeIn}
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6"
            >
              <span className="font-display text-sm tracking-[0.5em] text-paper [writing-mode:vertical-rl]">
                EGO 2
              </span>
              <span className="font-body text-xs leading-relaxed text-paper/70 [writing-mode:vertical-rl]">
                2割だけ、自分。
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* ===== SP: 比率バー + 通常フロー ===== */}
        <div className="mt-12 md:hidden">
          <div className="flex h-9 overflow-hidden border border-ink/15">
            <motion.div
              initial={false}
              animate={{ width: adult ? "80%" : "20%" }}
              transition={panelT}
              className="flex items-center overflow-hidden bg-paper pl-3"
            >
              <span className="whitespace-nowrap font-display text-[10px] tracking-[0.3em] text-ink/70">
                社会性 {adult ? "8" : "2"}
              </span>
            </motion.div>
            <motion.div
              initial={false}
              animate={{ width: adult ? "20%" : "80%" }}
              transition={panelT}
              className="flex items-center justify-end overflow-hidden bg-ink pr-3"
            >
              <span className="whitespace-nowrap font-display text-[10px] tracking-[0.3em] text-paper/80">
                自我 {adult ? "2" : "8"}
              </span>
            </motion.div>
          </div>
          <motion.p
            key={adult ? "adult" : "youth"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-3 font-body text-sm text-gray-1"
          >
            {adult ? "30代、比率が入れ替わる。" : "20代は、自我が主役でよかった。"}
          </motion.p>

          <div className="mt-10 flex flex-col gap-7">
            <BodyBlocks />
          </div>
          <div className="mt-10 flex items-center justify-between bg-ink px-5 py-4">
            <span className="font-display text-xs tracking-[0.4em] text-paper">EGO 2</span>
            <span className="font-body text-xs text-paper/70">2割だけ、自分。</span>
          </div>
        </div>
      </div>
    </section>
  );
}
