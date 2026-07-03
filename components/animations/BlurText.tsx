"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * reactbits "BlurText"（framer-motion ベース）を MONOCHROME 用に調整したもの。
 * - motion/react → framer-motion / 縦移動なし(その場で出現) / expo easing / reduced-motion 対応
 * - 複数要素（英語の単語）= stagger 付きで滲み出る
 * - 1要素（日本語=空白なし）= 段落まるごと blur→clear（通常フローで自然に折り返す）
 * IntersectionObserver でビューポート進入時に1度だけ発火＝スクロールで"その場に"出現。
 */

type Keyframe = Record<string, string | number>;

type BlurTextProps = {
  text?: string;
  className?: string;
  animateBy?: "words" | "letters";
  threshold?: number;
  rootMargin?: string;
  delay?: number; // 要素間 stagger(ms)（複数要素時）
  stepDuration?: number; // 1ステップ(s)
  easing?: Transition["ease"];
};

// y なし＝下から上がらず「その場でピントが合う」。blur→clear + fade のみ。
const FROM: Keyframe = { filter: "blur(12px)", opacity: 0 };
const TO: Keyframe[] = [
  { filter: "blur(6px)", opacity: 0.5 },
  { filter: "blur(0px)", opacity: 1 },
];

function buildKeyframes(from: Keyframe, steps: Keyframe[]) {
  const keys = new Set<string>([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);
  const kf: Record<string, Array<string | number>> = {};
  keys.forEach((k) => {
    kf[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return kf;
}

function useInView(threshold: number, rootMargin: string) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.unobserve(el);
        }
      },
      { threshold, rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);
  return { ref, inView };
}

export function BlurText({
  text = "",
  className = "",
  animateBy = "words",
  threshold = 0.2,
  rootMargin = "0px",
  delay = 90,
  stepDuration = 0.5,
  easing = [0.16, 1, 0.3, 1],
}: BlurTextProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView(threshold, rootMargin);

  const elements = useMemo(
    () => (animateBy === "words" ? text.split(" ") : text.split("")),
    [text, animateBy],
  );

  const stepCount = TO.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => i / (stepCount - 1));
  const kf = buildKeyframes(FROM, TO);

  if (reduced) {
    return <p className={className}>{text}</p>;
  }

  // 1要素（日本語など空白なし）= 段落まるごと blur（通常フローで折り返す）
  // delay は「inView になってから発火するまでの猶予(ms)」として扱う（複数要素の stagger と対を成す）。
  if (elements.length <= 1) {
    return (
      <motion.p
        ref={ref}
        className={className}
        initial={FROM}
        animate={inView ? kf : FROM}
        transition={{ duration: totalDuration, times, delay: delay / 1000, ease: easing }}
        style={{ willChange: "filter, opacity" }}
      >
        {text}
      </motion.p>
    );
  }

  // 複数要素（英語の単語など）= stagger 付き
  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {elements.map((seg, i) => (
        <motion.span
          key={i}
          initial={FROM}
          animate={inView ? kf : FROM}
          transition={{ duration: totalDuration, times, delay: (i * delay) / 1000, ease: easing }}
          style={{ display: "inline-block", willChange: "filter, opacity" }}
        >
          {seg}
          {i < elements.length - 1 && " "}
        </motion.span>
      ))}
    </p>
  );
}
