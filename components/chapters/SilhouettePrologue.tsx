"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { BlurText } from "@/components/animations/BlurText";
import { RevealText } from "@/components/scroll/RevealText";

/**
 * PROLOGUE — SILHOUETTE（Hero とシルエット動画スクラブの橋渡し）
 * 他章と同じスクロール文法（eyebrow → タイトル → リード）に、
 * I・A・Y の3本線を一筆書きで描画する図解（Ch05 注釈と同じ pathLength 言語）。
 * これから始まる動画章の「目次」として機能するダークセクション。
 */

const EASE = [0.16, 1, 0.3, 1] as const;

const LINES = [
  { key: "I", caption: "細く、縦に", paths: ["M 30 8 L 30 92"] },
  { key: "A", caption: "下へ、広がる", paths: ["M 30 8 L 13 92", "M 30 8 L 47 92"] },
  { key: "Y", caption: "上に、ゆとり", paths: ["M 13 8 L 30 46 L 30 92", "M 47 8 L 30 46"] },
];

export function SilhouettePrologue() {
  const reduced = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.25, delayChildren: 0.1 } },
  };
  const col: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };
  const glyph: Variants = reduced
    ? { hidden: { pathLength: 1 }, visible: { pathLength: 1 } }
    : {
        hidden: { pathLength: 0 },
        visible: { pathLength: 1, transition: { duration: 0.9, ease: EASE } },
      };
  const labelV: Variants = reduced
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      };

  return (
    <section id="silhouette" className="bg-ink py-32 md:py-44">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 px-6 text-center">
        <RevealText
          as="span"
          className="font-display text-xs tracking-[0.45em] text-paper/60"
        >
          PROLOGUE — SILHOUETTE
        </RevealText>

        <BlurText
          text="おしゃれは、服より先に、“ライン”で決まる。"
          className="font-heading text-2xl leading-relaxed text-paper md:text-4xl md:leading-relaxed"
        />

        <RevealText
          as="p"
          delay={0.15}
          className="max-w-xl font-body text-base leading-loose text-paper/80 md:text-lg"
        >
          全身のシルエットは I・A・Y——たった3本のラインに集約される。まずはこのラインを、動きで覚える。
        </RevealText>

        {/* I / A / Y の一筆書き図解 */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15% 0px" }}
          className="mt-4 grid w-full max-w-md grid-cols-3 gap-8"
        >
          {LINES.map((l) => (
            <motion.div key={l.key} variants={col} className="flex flex-col items-center gap-4">
              <svg viewBox="0 0 60 100" fill="none" aria-hidden className="h-28 w-auto md:h-36">
                {l.paths.map((d, i) => (
                  <motion.path
                    key={i}
                    variants={glyph}
                    d={d}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    className="stroke-paper"
                  />
                ))}
              </svg>
              <motion.span variants={labelV} className="flex flex-col gap-1">
                <span className="font-display text-lg tracking-[0.3em] text-paper">
                  {l.key}
                </span>
                <span className="font-body text-xs text-paper/60">{l.caption}</span>
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
