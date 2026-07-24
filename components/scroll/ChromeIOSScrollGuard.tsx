"use client";

import { useEffect } from "react";

/**
 * Chrome iOS（CriOS）専用のスクロールテレポート打ち消しガード v2。
 *
 * CriOS は下部ツールバーの出入りの瞬間にスクロール位置を数百 px 単位で
 * 誤補正することがある（Safari では起きない）。
 *
 * v1 は速度EMAからの乖離だけで検知していたが、切り返し直前の慣性速度が
 * 大きいとテレポートが「慣性の範囲内」に紛れて素通しした（実測 補正0回）。
 * v2 は指の位置を直接追跡する:
 * - ドラッグ中: スクロールは指の移動と 1:1 で逆向きのはず。指の移動から
 *   説明できない 100px 超の乖離をフレーム単位で検知して書き戻す
 * - 慣性中: 指を離した瞬間の速度を初速として予測し、ツールバー出入り
 *   （innerHeight 変化）の前後でだけ乖離を補正する
 *
 * - Safari / PC では userAgent 判定により一切動作しない
 * - ブラウザ側と書き戻しが喧嘩し続けた場合は 2 秒バックオフする安全弁付き
 */

const DRAG_JUMP_PX = 100; // ドラッグ中: 指の移動から説明できない乖離のしきい値
const MOMENTUM_ERR_PX = 100; // 慣性中: 速度予測からの乖離のしきい値
const TOUCH_GRACE_MS = 80; // タッチ直後は慣性キャッチの残りが混ざるため判定しない
const GUARD_MS = 400; // innerHeight 変化の後、慣性補正を張る時間
const RETRO_MS = 300; // innerHeight 変化の前に遡って打ち消す時間
const BACKOFF_MS = 2000;

export function ChromeIOSScrollGuard() {
  useEffect(() => {
    if (!/CriOS/i.test(navigator.userAgent)) return;
    (window as unknown as { __scrollGuardVersion?: number }).__scrollGuardVersion = 2;

    let lastY = window.scrollY;
    let lastH = window.innerHeight;
    let lastT = performance.now();
    let vel = 0; // スクロール速度 px/ms（指数移動平均）
    let guardUntil = 0;
    let backoffUntil = 0;
    let fixCount = 0;
    let recentFixes: number[] = [];
    let pending: { t: number; err: number }[] = [];
    let raf = 0;

    // 指の状態
    let fingerDown = false;
    let multiTouch = false;
    let touchStartT = 0;
    let fingerY = 0; // 最新の指位置
    let fingerFrameY = 0; // 前フレーム時点の指位置
    let fingerVel = 0; // 指の速度 px/ms（慣性初速の種）
    let lastMoveY = 0;
    let lastMoveT = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        multiTouch = true;
        fingerDown = false;
        return;
      }
      multiTouch = false;
      fingerDown = true;
      touchStartT = performance.now();
      fingerY = e.touches[0].clientY;
      fingerFrameY = fingerY;
      lastMoveY = fingerY;
      lastMoveT = touchStartT;
      fingerVel = 0;
      vel = 0; // タッチで慣性は止まる（キャッチ）
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        multiTouch = true;
        fingerDown = false;
        return;
      }
      const t = performance.now();
      const yPos = e.touches[0].clientY;
      const dtm = t - lastMoveT;
      if (dtm > 0) fingerVel = fingerVel * 0.7 + ((yPos - lastMoveY) / dtm) * 0.3;
      lastMoveY = yPos;
      lastMoveT = t;
      fingerY = yPos;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length > 0) return;
      if (fingerDown) vel = -fingerVel; // 慣性初速 = 指を離した瞬間の速度
      fingerDown = false;
      multiTouch = false;
    };

    const fix = (top: number) => {
      window.scrollTo(0, top);
      fixCount += 1;
      // 診断 HUD（?debug=scroll）が補正回数を表示できるように公開
      (window as unknown as { __scrollGuardFixes?: number }).__scrollGuardFixes = fixCount;
    };

    const markFix = (t: number) => {
      recentFixes = recentFixes.filter((c) => t - c < 500);
      recentFixes.push(t);
      if (recentFixes.length > 4) backoffUntil = t + BACKOFF_MS;
    };

    const loop = () => {
      const t = performance.now();
      const y = window.scrollY;
      const h = window.innerHeight;
      const dt = Math.min(t - lastT, 64);
      const dy = y - lastY;
      const resized = h !== lastH;
      if (resized) guardUntil = t + GUARD_MS;
      const active = t > backoffUntil;

      if (fingerDown && !multiTouch) {
        // --- ドラッグ中: スクロールは指の移動と 1:1 で逆向きのはず ---
        const expected = -(fingerY - fingerFrameY);
        const err = dy - expected;
        if (
          active &&
          t - touchStartT > TOUCH_GRACE_MS &&
          Math.abs(dy) > DRAG_JUMP_PX &&
          Math.abs(err) > DRAG_JUMP_PX
        ) {
          const target = lastY + expected;
          fix(target);
          lastY = target;
          markFix(t);
        } else {
          lastY = y;
        }
      } else {
        // --- 慣性中: 指を離した初速からの速度予測で判定 ---
        const expectedDy = vel * dt;
        const err = dy - expectedDy;
        const anomalous = Math.abs(err) > MOMENTUM_ERR_PX;
        if (anomalous && active && t < guardUntil) {
          const target = lastY + expectedDy;
          fix(target);
          lastY = target;
          markFix(t);
        } else if (anomalous) {
          // resize 未観測の異常は記録だけ（本物の高速フリックなら resize が来ず破棄）
          pending.push({ t, err });
          lastY = y;
        } else {
          if (dt > 0) vel = vel * 0.8 + (dy / dt) * 0.2;
          lastY = y;
        }
        if (resized && active) {
          // 誤補正がツールバー変化より先に始まっていたケースを遡って打ち消す
          pending = pending.filter((p) => t - p.t <= RETRO_MS);
          const total = pending.reduce((s, p) => s + p.err, 0);
          if (Math.abs(total) > MOMENTUM_ERR_PX) {
            fix(window.scrollY - total);
            lastY = window.scrollY;
            pending = [];
          }
        }
        while (pending.length && t - pending[0].t > RETRO_MS * 2) pending.shift();
      }

      fingerFrameY = fingerY;
      lastH = h;
      lastT = t;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
