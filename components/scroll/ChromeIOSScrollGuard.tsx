"use client";

import { useEffect } from "react";

/**
 * Chrome iOS（CriOS）専用のスクロールテレポート打ち消しガード。
 *
 * CriOS は下部ツールバーの出入り（= innerHeight 変化）の瞬間に
 * スクロール位置を数百 px 単位で誤補正することがある（Safari では起きない）。
 * ここでは毎フレーム速度を追跡し、「ツールバー出入りの前後 ±150〜250ms に
 * 慣性から説明できない大ジャンプ」が起きたときだけ、期待位置へ書き戻す。
 *
 * - Safari / PC では userAgent 判定により一切動作しない
 * - ブラウザ側の補正と書き戻しが喧嘩し続けた場合（500ms に 4 回以上）は
 *   2 秒間バックオフする安全弁付き
 */

const JUMP_PX = 100; // 期待軌道からの乖離がこれを超えたら異常とみなす
const GUARD_MS = 250; // innerHeight 変化の後、即時補正を張る時間
const RETRO_MS = 150; // innerHeight 変化の前に遡って打ち消す時間
const BACKOFF_MS = 2000;

export function ChromeIOSScrollGuard() {
  useEffect(() => {
    if (!/CriOS/i.test(navigator.userAgent)) return;

    let lastY = window.scrollY;
    let lastH = window.innerHeight;
    let lastT = performance.now();
    let vel = 0; // px/ms（指数移動平均）
    let guardUntil = 0;
    let backoffUntil = 0;
    let fixCount = 0;
    let recentFixes: number[] = [];
    // innerHeight 変化がまだ観測できていないフレームで起きた異常の記録
    let pending: { t: number; err: number }[] = [];
    let raf = 0;

    const fix = (top: number) => {
      window.scrollTo(0, top);
      fixCount += 1;
      // 診断 HUD（?debug=scroll）が補正回数を表示できるように公開
      (window as unknown as { __scrollGuardFixes?: number }).__scrollGuardFixes = fixCount;
    };

    const loop = () => {
      const t = performance.now();
      const y = window.scrollY;
      const h = window.innerHeight;
      const dt = Math.min(t - lastT, 64);
      const dy = y - lastY;
      const expectedDy = vel * dt;
      const err = dy - expectedDy;
      const resized = h !== lastH;
      if (resized) guardUntil = t + GUARD_MS;
      const active = t > backoffUntil;
      const anomalous = dt < 50 && Math.abs(err) > JUMP_PX;

      if (anomalous && active && t < guardUntil) {
        // ツールバー出入り直後の異常 → その場で期待位置へ書き戻す
        const target = lastY + expectedDy;
        fix(target);
        lastY = target;
        recentFixes = recentFixes.filter((c) => t - c < 500);
        recentFixes.push(t);
        if (recentFixes.length > 3) backoffUntil = t + BACKOFF_MS;
      } else if (anomalous) {
        // resize 未観測の異常は記録だけ（通常の高速フリックなら resize が来ず破棄される）
        pending.push({ t, err });
        lastY = y;
      } else {
        if (dt > 0) vel = vel * 0.8 + (dy / dt) * 0.2;
        lastY = y;
      }

      if (resized && active) {
        // 補正がツールバー変化より先に始まっていたケースを遡って打ち消す
        pending = pending.filter((p) => t - p.t <= RETRO_MS);
        const total = pending.reduce((s, p) => s + p.err, 0);
        if (Math.abs(total) > JUMP_PX) {
          fix(window.scrollY - total);
          lastY = window.scrollY;
          pending = [];
        }
      }
      while (pending.length && t - pending[0].t > RETRO_MS * 2) pending.shift();

      lastH = h;
      lastT = t;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
