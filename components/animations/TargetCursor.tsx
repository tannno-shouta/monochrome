"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * reactbits "TargetCursor" を MONOCHROME 用に gsap 依存なしで再実装。
 * - container 内 hover 時のみ表示、外れたら通常カーソルに戻る
 * - 中心ドット + 四隅コーナーブラケット、CSS animation でゆっくり回転
 * - rAF lerp で追従、PC（pointer:fine）かつ reduced-motion:no のみ有効
 *
 * シルエットパートで「観察視点」 を強調するためのカーソル演出。
 */

type TargetCursorProps = {
  containerRef: RefObject<HTMLElement | null>;
  color?: string;
  /** spin animation duration (s) */
  spinDuration?: number;
  /** lerp 係数 (0-1)、大きいほど追従が速い */
  smoothness?: number;
};

export function TargetCursor({
  containerRef,
  color = "rgba(255,255,255,0.85)",
  spinDuration = 6,
  smoothness = 0.25,
}: TargetCursorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let visible = false;

    const setVisible = (v: boolean) => {
      if (v === visible) return;
      visible = v;
      wrapper.style.opacity = v ? "1" : "0";
      container.style.cursor = v ? "none" : "";
    };

    const tick = () => {
      raf = 0;
      curX += (targetX - curX) * smoothness;
      curY += (targetY - curY) * smoothness;
      wrapper.style.transform = `translate(${curX}px, ${curY}px)`;
      if (Math.abs(targetX - curX) > 0.3 || Math.abs(targetY - curY) > 0.3) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: MouseEvent) => {
      const b = container.getBoundingClientRect();
      const inside =
        e.clientX >= b.left &&
        e.clientX <= b.right &&
        e.clientY >= b.top &&
        e.clientY <= b.bottom;
      setVisible(inside);
      if (!inside) return;
      targetX = e.clientX;
      targetY = e.clientY;
      if (curX === 0 && curY === 0) {
        curX = targetX;
        curY = targetY;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      container.style.cursor = "";
    };
  }, [containerRef, smoothness]);

  // 四隅コーナーブラケットの位置（外側 20px、線長 12px、太さ 2px）
  const cornerSize = 12;
  const borderW = 2;
  const offset = 18;

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0 transition-opacity duration-200"
      style={{ willChange: "transform, opacity" }}
      aria-hidden
    >
      <div
        className="relative"
        style={{
          width: 0,
          height: 0,
          animation: `target-cursor-spin ${spinDuration}s linear infinite`,
        }}
      >
        {/* 中央ドット */}
        <div
          style={{
            position: "absolute",
            top: -2,
            left: -2,
            width: 4,
            height: 4,
            background: color,
            borderRadius: "50%",
          }}
        />
        {/* 四隅コーナーブラケット */}
        <div
          style={{
            position: "absolute",
            top: -offset,
            left: -offset,
            width: cornerSize,
            height: cornerSize,
            borderTop: `${borderW}px solid ${color}`,
            borderLeft: `${borderW}px solid ${color}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -offset,
            left: offset - cornerSize,
            width: cornerSize,
            height: cornerSize,
            borderTop: `${borderW}px solid ${color}`,
            borderRight: `${borderW}px solid ${color}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: offset - cornerSize,
            left: -offset,
            width: cornerSize,
            height: cornerSize,
            borderBottom: `${borderW}px solid ${color}`,
            borderLeft: `${borderW}px solid ${color}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: offset - cornerSize,
            left: offset - cornerSize,
            width: cornerSize,
            height: cornerSize,
            borderBottom: `${borderW}px solid ${color}`,
            borderRight: `${borderW}px solid ${color}`,
          }}
        />
      </div>
    </div>
  );
}
