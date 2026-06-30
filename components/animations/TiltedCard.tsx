"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, type SpringOptions } from "framer-motion";

/**
 * reactbits "TiltedCard"（framer-motion ベース）を MONOCHROME 用に調整したもの。
 * 変更点: motion/react → framer-motion / モバイル警告・ツールチップ既定オフ /
 * 傾き控えめ(rotateAmplitude/scale) / 画像は枠いっぱい / rounded 控えめ。
 * マウスを乗せると 3D で傾く hover 演出（写真を魅せる）。
 */

const spring: SpringOptions = { damping: 30, stiffness: 100, mass: 2 };

export function TiltedCard({
  imageSrc,
  altText = "",
  rotateAmplitude = 9,
  scaleOnHover = 1.04,
  className = "",
}: {
  imageSrc: string;
  altText?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), spring);
  const rotateY = useSpring(useMotionValue(0), spring);
  const scale = useSpring(1, spring);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
  }

  function reset() {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }

  return (
    <div
      ref={ref}
      className={`relative h-full w-full [perspective:900px] ${className}`}
      onMouseMove={handleMouse}
      onMouseEnter={() => scale.set(scaleOnHover)}
      onMouseLeave={reset}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        style={{ rotateX, rotateY, scale }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={altText}
          className="h-full w-full object-cover [transform:translateZ(0)] will-change-transform"
        />
      </motion.div>
    </div>
  );
}
