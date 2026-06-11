"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

interface ParallaxDepthProps {
  children: React.ReactNode;
  /** 移動量(px)。負で逆方向。レイヤごとに変えて奥行きを出す */
  speed?: number;
  /** 軽いズームを加えるか（奥行き強調） */
  zoom?: boolean;
  className?: string;
}

/**
 * 縦パララックス + 任意ズームで奥行きを表現するレイヤ。
 * transform のみでアニメート（リフロー回避）。reduced-motion では静止。
 */
export function ParallaxDepth({
  children,
  speed = 80,
  zoom = false,
  className,
}: ParallaxDepthProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.08]);

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
      style={{ y, scale: zoom ? scale : undefined, willChange: "transform" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
