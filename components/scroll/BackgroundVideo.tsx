"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface BackgroundVideoProps {
  src: string;
  poster: string;
  /** 黒オーバーレイの濃さ(0–1)。テキストの可読性確保 */
  overlay?: number;
  className?: string;
}

/**
 * セクション背景に敷く autoplay ループ動画。
 * - 画面外では IntersectionObserver で停止（デコード負荷を抑制）
 * - reduced-motion はポスター静止画にフォールバック
 * - 上に黒オーバーレイを重ねて前景テキストの可読性を担保
 */
export function BackgroundVideo({
  src,
  poster,
  overlay = 0.6,
  className,
}: BackgroundVideoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current;
        if (!v) return;
        if (entry.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {prefersReducedMotion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="h-full w-full object-cover" />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-ink" style={{ opacity: overlay }} />
    </div>
  );
}
