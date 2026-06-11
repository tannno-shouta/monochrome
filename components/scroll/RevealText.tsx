"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

interface RevealTextProps {
  children: React.ReactNode;
  /** 出現の遅延（秒） */
  delay?: number;
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div" | "li";
  className?: string;
}

/**
 * ビューポート進入時にふわっと出現するテキスト/ブロック。
 * reduced-motion では即時表示（動きなし）。
 */
export function RevealText({
  children,
  delay = 0,
  as = "div",
  className,
}: RevealTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as];

  const variants: Variants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
        },
      };

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15% 0px" }}
    >
      {children}
    </MotionTag>
  );
}
