"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

interface PinnedHorizontalProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 縦スクロールを横移動に変換する sticky 横スクロール。
 *
 * 設計メモ（codex review 反映）:
 * - mode は「メディアクエリ + reduced-motion」で決定（trackの実測に依存させない）
 * - scrollDistance は pin 時に “実際に表示されるトラック” を ResizeObserver で計測
 * - 祖先に overflow/transform を置かない（sticky を壊すため）
 * - モバイル / reduced-motion はネイティブ横スクロール（タップ送り）に簡略化
 */
export function PinnedHorizontal({ children, className }: PinnedHorizontalProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [mode, setMode] = useState<"native" | "pin">("native");
  const [scrollDistance, setScrollDistance] = useState(0);

  // mode 判定（SSR は native → クライアントで pin に昇格）
  useEffect(() => {
    const decide = () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      setMode(isMobile || prefersReducedMotion ? "native" : "pin");
    };
    decide();
    window.addEventListener("resize", decide);
    return () => window.removeEventListener("resize", decide);
  }, [prefersReducedMotion]);

  // pin 時、実表示トラックを計測（native 時は scrollDistance 不使用のためリセット不要）
  useEffect(() => {
    if (mode !== "pin") return;
    const track = trackRef.current;
    if (!track) return;
    const recalc = () => {
      setScrollDistance(Math.max(track.scrollWidth - window.innerWidth, 0));
    };
    recalc();
    const ro = new ResizeObserver(() => requestAnimationFrame(recalc));
    ro.observe(track);
    window.addEventListener("resize", recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [mode]);

  const { scrollYProgress } = useScroll({
    // native 分岐では sectionRef を描画しないため、pin 時のみ target に渡す
    target: mode === "pin" ? sectionRef : undefined,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance]);

  // 簡略化モード: ネイティブ横スクロール
  if (mode === "native") {
    return (
      <section className={className}>
        <div
          ref={trackRef}
          className="scrollbar-hide flex h-screen items-center overflow-x-auto"
        >
          {children}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={className}
      style={{ height: `calc(100vh + ${scrollDistance}px)` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex">
          {children}
        </motion.div>
      </div>
    </section>
  );
}
