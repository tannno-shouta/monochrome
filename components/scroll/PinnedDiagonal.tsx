"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

interface PinnedDiagonalProps {
  children: React.ReactNode;
  /** リボンの傾き角(deg)。負で右上がり（右上に流れる）／正で右下がり */
  tilt?: number;
  className?: string;
}

/**
 * Chapter02 の横ピン留めスクロールの「斜め」版（奥行きなし）。
 *
 * - トラックを tilt 分だけ傾けた“リボン”にし、スクロールで斜めに流す（x + 縦ドリフト）
 * - 縦ドリフトの向きは傾きに追従（右上がり→上へ、右下がり→下へ）＝斜めの流れが一貫
 * - 奥行き（perspective / translateZ）は使わない＝フラットな斜めスクロール
 * - モバイル / reduced-motion はネイティブ横スクロールに簡略化
 *
 * 計測設計（codex review 反映）:
 *  - mode は「メディアクエリ + reduced-motion」で決定（trackの実測に依存させない）
 *  - scrollDistance は pin 時に “実際に表示されるトラック” を ResizeObserver で計測
 */
export function PinnedDiagonal({
  children,
  tilt = -8,
  className,
}: PinnedDiagonalProps) {
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
      // 傾き分の余白を見込んで少し多めに流す
      const distance =
        track.scrollWidth - window.innerWidth + window.innerWidth * 0.2;
      setScrollDistance(Math.max(distance, 0));
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
  // 回転で生じる縦ズレを打ち消し、可視カードを常に縦中央に収める補正。
  // （リボン全体を回転すると中心から離れたカードほど縦に大きくずれて見切れるため）
  const y = useTransform(scrollYProgress, (p) => {
    if (typeof window === "undefined" || scrollDistance <= 0) return 0;
    const vw = window.innerWidth;
    const trackW = scrollDistance + vw * 0.8; // recalc 内の式と整合
    const localX = vw / 2 + scrollDistance * p - trackW / 2; // 画面中央のトラック内位置
    return -Math.sin((tilt * Math.PI) / 180) * localX;
  });

  // 簡略化モード: ネイティブ横スクロール（傾けない）
  if (mode === "native") {
    return (
      <section className={className}>
        <div
          ref={trackRef}
          className="scrollbar-hide flex h-[80vh] items-center gap-12 overflow-x-auto px-[12vw]"
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
        <motion.div
          ref={trackRef}
          style={{ x, y, rotate: tilt, willChange: "transform" }}
          className="flex items-center gap-12 pl-[12vw] pr-[12vw]"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
