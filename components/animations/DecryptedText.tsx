"use client";

import { useEffect, useRef, useState } from "react";

/**
 * reactbits "DecryptedText" を MONOCHROME 用に再構成したもの。
 * 変更点:
 * - スクランブル文字を図面ノイズ風のモノクロプール（─ ・ ▪ ▫ ╱ │ ┆）に差替
 * - トリガはマウント時一度だけ（hover/click/view モード削除）。key 差替で再発火させる
 * - 全文スクランブルではなく「復号ウェーブ」方式: 復号位置の先 12 文字だけノイズ、
 *   その先は不可視。和文でうるさくならず、editorial の静けさを保つ
 * - 文字ごとに実文字を透明で敷き、ノイズは absolute 重ね＝レイアウトシフト完全ゼロ
 * - 全長に関わらず約 0.9s で復号が終わるよう 1tick の復号文字数を自動調整
 * - prefers-reduced-motion では即時表示 / SR には最終テキストのみ読ませる
 */

const NOISE = "─・▪▫╱│┆";
// 句読点・引用符・空白はスクランブルせずそのまま出す（読みのアンカーを残す）
const KEEP = /[\s、。！？・“”…—―「」]/;

const TICK_MS = 30;
const TARGET_MS = 900;
const WINDOW = 12;

export function DecryptedText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(0);
  const [tick, setTick] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(text.length);
      return;
    }
    const step = Math.max(2, Math.ceil(text.length / (TARGET_MS / TICK_MS)));
    timer.current = setInterval(() => {
      setTick((n) => n + 1);
      setRevealed((r) => {
        const next = r + step;
        if (next >= text.length && timer.current) {
          clearInterval(timer.current);
          timer.current = null;
        }
        return Math.min(next, text.length);
      });
    }, TICK_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [text]);

  const chars = Array.from(text);

  return (
    <span className={className} role="text" aria-label={text}>
      {chars.map((ch, i) => {
        if (i < revealed || KEEP.test(ch)) {
          return (
            <span key={i} aria-hidden>
              {ch}
            </span>
          );
        }
        const inWindow = i < revealed + WINDOW;
        return (
          <span key={i} className="relative inline-block" aria-hidden>
            {/* 実文字を透明で敷いてレイアウトを確定させる */}
            <span className="opacity-0">{ch}</span>
            {inWindow && (
              <span className="absolute inset-0 text-paper/35">
                {NOISE[(i * 7 + tick * 3) % NOISE.length]}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
