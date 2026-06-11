"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

interface DiagonalRevealProps {
  children: React.ReactNode;
  /** 斜め移動の振れ幅(px)。x と y に同符号で効かせて斜めに動かす */
  distance?: number;
  /** 斜めの向き（右下から / 左下から など） */
  from?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

const DIRS: Record<NonNullable<DiagonalRevealProps["from"]>, [number, number]> = {
  "bottom-right": [1, 1],
  "bottom-left": [-1, 1],
  "top-right": [1, -1],
  "top-left": [-1, -1],
};

/**
 * スクロール進捗を x と y に同時写像する「斜めスライドリビール」。
 * 素材スウォッチなどを斜めに差し込む演出に使う。reduced-motion では静止。
 */
export function DiagonalReveal({
  children,
  distance = 120,
  from = "bottom-right",
  className,
}: DiagonalRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [sx, sy] = DIRS[from];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [sx * distance, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [sy * distance, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y, opacity, willChange: "transform, opacity" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
