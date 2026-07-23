"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ★一時診断用 HUD v2（URL に ?debug=scroll が付いた時だけ表示）
 * ジャンプ瞬間のスナップショットを記録:
 * - scrollY 前後 / winH（ツールバー出入り）前後 / pageH（文書全体の高さ）前後
 * → どれが同時に変わったかで原因を確定する。原因特定後に削除。
 */

type JumpLog = {
  y: string;
  winH: string;
  pageH: string;
};

export function ScrollDebugHUD() {
  const [on, setOn] = useState(false);
  const [disp, setDisp] = useState<{
    y: number;
    winH: number;
    hChange: number;
    fixes: number;
    logs: JumpLog[];
  }>({
    y: 0,
    winH: 0,
    hChange: 0,
    fixes: 0,
    logs: [],
  });
  const raf = useRef(0);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("debug")) return;
    const showTimer = setTimeout(() => setOn(true), 0);
    let lastY = window.scrollY;
    let lastH = window.innerHeight;
    let lastPageH = document.documentElement.scrollHeight;
    let lastT = performance.now();
    let hChanges = 0;
    const logs: JumpLog[] = [];
    let lastPaint = 0;
    const loop = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      const pageH = document.documentElement.scrollHeight;
      const now = performance.now();
      // 1フレーム（<40ms）で 120px 超のスクロール移動 = ジャンプとして前後値を記録
      if (Math.abs(y - lastY) > 120 && now - lastT < 40) {
        logs.unshift({
          y: `${Math.round(lastY)}→${Math.round(y)} (${Math.round(y - lastY)}px)`,
          winH: h !== lastH ? `${lastH}→${h}` : `${h}（不変）`,
          pageH: pageH !== lastPageH ? `${lastPageH}→${pageH}` : `不変`,
        });
        if (logs.length > 3) logs.pop();
      }
      if (h !== lastH) hChanges += 1;
      lastY = y;
      lastH = h;
      lastPageH = pageH;
      lastT = now;
      if (now - lastPaint > 150) {
        lastPaint = now;
        setDisp({
          y: Math.round(y),
          winH: h,
          hChange: hChanges,
          fixes: (window as unknown as { __scrollGuardFixes?: number }).__scrollGuardFixes ?? 0,
          logs: [...logs],
        });
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      clearTimeout(showTimer);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  if (!on) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: 8,
        bottom: 8,
        zIndex: 9999,
        background: "rgba(0,0,0,0.82)",
        color: "#fff",
        fontFamily: "monospace",
        fontSize: 10,
        lineHeight: 1.5,
        padding: "6px 10px",
        borderRadius: 4,
        pointerEvents: "none",
        maxWidth: "88vw",
      }}
    >
      <div>
        scrollY: {disp.y} / winH: {disp.winH}（変化{disp.hChange}回）/ 補正: {disp.fixes}回
      </div>
      {disp.logs.length === 0 ? (
        <div>ジャンプ記録: なし</div>
      ) : (
        disp.logs.map((l, i) => (
          <div key={i} style={{ borderTop: "1px solid #444", marginTop: 3, paddingTop: 3 }}>
            <div>Y: {l.y}</div>
            <div>winH: {l.winH} / pageH: {l.pageH}</div>
          </div>
        ))
      )}
    </div>
  );
}
