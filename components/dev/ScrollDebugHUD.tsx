"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ★一時診断用 HUD（URL に ?debug=scroll が付いた時だけ表示）
 * SP のスクロール切り返しジャンプの原因切り分け:
 * - scrollY が連続 + winH が変化 → ツールバー起因の viewport 変化（絵の側のジャンプ）
 * - scrollY 自体が1フレームで大きく飛ぶ → 実スクロール位置のジャンプ
 * 原因特定後に削除する。
 */
export function ScrollDebugHUD() {
  const [on, setOn] = useState(false);
  const [disp, setDisp] = useState({ y: 0, winH: 0, jump: 0, hChange: 0 });
  const raf = useRef(0);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("debug")) return;
    setOn(true);
    let lastY = window.scrollY;
    let lastH = window.innerHeight;
    let lastT = performance.now();
    let maxJump = 0;
    let hChanges = 0;
    let lastPaint = 0;
    const loop = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      const now = performance.now();
      // 1フレーム（<40ms）で 120px 超の移動 = 実スクロールのジャンプとして記録
      if (Math.abs(y - lastY) > 120 && now - lastT < 40) {
        maxJump = Math.max(maxJump, Math.round(Math.abs(y - lastY)));
      }
      if (h !== lastH) hChanges += 1; // ツールバー出入り等で viewport 高さが変わった回数
      lastY = y;
      lastH = h;
      lastT = now;
      if (now - lastPaint > 120) {
        lastPaint = now;
        setDisp({ y: Math.round(y), winH: h, jump: maxJump, hChange: hChanges });
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  if (!on) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: 8,
        bottom: 8,
        zIndex: 9999,
        background: "rgba(0,0,0,0.8)",
        color: "#fff",
        fontFamily: "monospace",
        fontSize: 11,
        lineHeight: 1.5,
        padding: "6px 10px",
        borderRadius: 4,
        pointerEvents: "none",
      }}
    >
      <div>scrollY: {disp.y}</div>
      <div>winH: {disp.winH}（変化 {disp.hChange} 回）</div>
      <div>最大ジャンプ: {disp.jump}px</div>
    </div>
  );
}
