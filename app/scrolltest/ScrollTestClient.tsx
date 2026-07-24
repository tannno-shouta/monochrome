"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ★一時検証用スパイク（本体サイトとは独立した /scrolltest ページ）
 * 「body 固定 + 内側 div スクロール」構成で Chrome iOS の
 * 下部ツールバー連動（= innerHeight 変化）とスクロールジャンプが
 * 止まるかを実機計測する。結論が出たらページごと削除する。
 */

export function ScrollTestClient() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [disp, setDisp] = useState<{
    top: number;
    winH: number;
    hChanges: number;
    jumps: string[];
  }>({ top: 0, winH: 0, hChanges: 0, jumps: [] });

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let lastTop = box.scrollTop;
    let lastH = window.innerHeight;
    let lastT = performance.now();
    let hChanges = 0;
    const jumps: string[] = [];
    let lastPaint = 0;
    let raf = 0;
    const loop = () => {
      const top = box.scrollTop;
      const h = window.innerHeight;
      const now = performance.now();
      // 本体 HUD と同じ基準: 1フレーム（<40ms）で 120px 超の移動 = ジャンプ
      if (Math.abs(top - lastTop) > 120 && now - lastT < 40) {
        jumps.unshift(
          `${Math.round(lastTop)}→${Math.round(top)} (${Math.round(top - lastTop)}px) winH:${
            lastH === h ? "不変" : `${lastH}→${h}`
          }`,
        );
        if (jumps.length > 3) jumps.pop();
      }
      if (h !== lastH) hChanges += 1;
      lastTop = top;
      lastH = h;
      lastT = now;
      if (now - lastPaint > 150) {
        lastPaint = now;
        setDisp({ top: Math.round(top), winH: h, hChanges, jumps: [...jumps] });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stripes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div
      ref={boxRef}
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
        background: "#0a0a0a",
        color: "#fff",
        zIndex: 50,
      }}
    >
      {stripes.map((i) => (
        <div
          key={i}
          style={{
            height: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            fontFamily: "monospace",
            background: i % 2 ? "#161616" : "#0a0a0a",
            borderBottom: "1px solid #333",
          }}
        >
          {i}
        </div>
      ))}
      <div
        style={{
          position: "fixed",
          left: 8,
          bottom: 8,
          background: "rgba(0,0,0,0.85)",
          fontFamily: "monospace",
          fontSize: 11,
          lineHeight: 1.6,
          padding: "6px 10px",
          borderRadius: 4,
          pointerEvents: "none",
          maxWidth: "88vw",
        }}
      >
        <div>
          scrollTop: {disp.top} / winH: {disp.winH}
        </div>
        <div>バー出入り（winH変化）: {disp.hChanges}回</div>
        {disp.jumps.length === 0 ? (
          <div>ジャンプ記録: なし</div>
        ) : (
          disp.jumps.map((j, i) => <div key={i}>J: {j}</div>)
        )}
      </div>
    </div>
  );
}
