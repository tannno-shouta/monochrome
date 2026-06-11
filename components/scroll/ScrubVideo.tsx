"use client";

import { useEffect, useRef } from "react";
import { useScroll, useReducedMotion, type MotionValue } from "framer-motion";

interface ScrubVideoProps {
  /** 動画ソース（H.264 MP4 推奨・短尺・低ビットレート・頻繁なキーフレーム） */
  src: string;
  /** スクラブ無効時／reduced-motion 時に表示するポスター画像 */
  poster: string;
  /** スクリーンリーダー・動画非対応時の代替テキスト */
  label: string;
  /** hero のみ true（preload=auto / 先読み）。それ以外は metadata 止め */
  priority?: boolean;
  className?: string;
}

/**
 * スクロール量に応じて video.currentTime を進める「スクラブ動画」。
 *
 * 設計メモ（codex review 反映）:
 * - React state を使わず MotionValue 購読 + rAF で currentTime を書く（再レンダ回避）
 * - loadedmetadata を待ってから scrub を有効化
 * - prefers-reduced-motion ではポスター静止画にフォールバック
 * - モバイルで seek/decode がカクつく場合は frame-sequence 方式へ差し替える前提（同 props で置換可能に設計）
 */
export function ScrubVideo({
  src,
  poster,
  label,
  priority = false,
  className,
}: ScrubVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // この要素がビューポートを通過する進捗 0→1
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  useScrub(videoRef, scrollYProgress, !prefersReducedMotion);

  return (
    <div ref={containerRef} className={className}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        playsInline
        preload={priority ? "auto" : "metadata"}
        aria-label={label}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/** scrollYProgress を rAF で video.currentTime に写像する（state を介さない） */
function useScrub(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  progress: MotionValue<number>,
  enabled: boolean,
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    let duration = 0;
    let rafId = 0;
    let targetTime = 0;

    const onMeta = () => {
      duration = video.duration || 0;
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);

    const tick = () => {
      rafId = 0;
      if (duration > 0) {
        // 直近のスクロール位置へ滑らかに寄せる（急な seek の連打を緩和）
        const current = video.currentTime;
        const next = current + (targetTime - current) * 0.2;
        if (Math.abs(next - current) > 0.01) {
          video.currentTime = next;
          rafId = requestAnimationFrame(tick);
        }
      }
    };

    const unsubscribe = progress.on("change", (v) => {
      if (duration <= 0) return;
      targetTime = Math.min(Math.max(v, 0), 1) * duration;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });

    return () => {
      unsubscribe();
      if (rafId) cancelAnimationFrame(rafId);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, [videoRef, progress, enabled]);
}
