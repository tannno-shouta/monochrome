"use client";

import { useEffect } from "react";

/**
 * Chrome iOS（CriOS）専用のスクロールテレポート打ち消しガード v3。
 *
 * /scrolltest スパイクの実測により、CriOS は「ツールバー出入りと無関係に」
 * 切り返し時スクロール位置をテレポートさせることが確定した（winH 変化 0 回・
 * 最小構成の内側スクロールでも数字が飛ぶ）。よって v2 までの
 * 「innerHeight 変化の前後だけ補正する」ゲートは全廃し、物理不変量で判定する:
 *
 * - 慣性スクロールは加速も逆走も物理的にありえない。減速中の「逆走」や
 *   「マージン超の加速」はブラウザのテレポートと断定して書き戻す
 * - ドラッグ中はスクロールが指の移動と 1:1 のはず。指から説明できない
 *   100px 超の乖離を書き戻す
 * - 誤爆防止: 直近 1.5 秒にタッチがある時だけ発動（検索ジャンプ等を除外）、
 *   ページ上下端 150px はラバーバンドがあるので判定しない、
 *   書き戻しがブラウザと喧嘩し続けたら 2 秒バックオフ
 * - Safari / PC では userAgent 判定により一切動作しない
 */

const DRAG_JUMP_PX = 100; // ドラッグ中: 指の移動から説明できない乖離
const MOMENTUM_SIGN_PX = 60; // 慣性中: 逆走とみなす移動量
const MOMENTUM_ACCEL_RATIO = 1.6; // 慣性中に許す加速マージン（EMA遅れ分の余裕込み）
const MOMENTUM_ACCEL_PAD = 50;
const STATIC_JUMP_PX = 120; // ほぼ停止中に起きたテレポート
const TOUCH_GRACE_MS = 80; // タッチ直後は慣性キャッチ扱い（物理判定側で見る）
const TOUCH_RECENT_MS = 1500; // 直近タッチがある時だけガード発動
const EDGE_PX = 150; // 上下端はラバーバンド域なので判定しない
const BACKOFF_MS = 2000;

export function ChromeIOSScrollGuard() {
  useEffect(() => {
    if (!/CriOS/i.test(navigator.userAgent)) return;
    (window as unknown as { __scrollGuardVersion?: number }).__scrollGuardVersion = 3;

    let lastY = window.scrollY;
    let lastT = performance.now();
    let vel = 0; // スクロール速度 px/ms（指数移動平均）
    let backoffUntil = 0;
    let fixCount = 0;
    let recentFixes: number[] = [];
    let raf = 0;

    // 指の状態
    let fingerDown = false;
    let multiTouch = false;
    let touchStartT = 0;
    let lastTouchT = 0;
    let fingerY = 0; // 最新の指位置
    let fingerFrameY = 0; // 前フレーム時点の指位置
    let fingerVel = 0; // 指の速度 px/ms（慣性初速の種）
    let lastMoveY = 0;
    let lastMoveT = 0;

    const onTouchStart = (e: TouchEvent) => {
      lastTouchT = performance.now();
      if (e.touches.length > 1) {
        multiTouch = true;
        fingerDown = false;
        return;
      }
      multiTouch = false;
      fingerDown = true;
      touchStartT = lastTouchT;
      fingerY = e.touches[0].clientY;
      fingerFrameY = fingerY;
      lastMoveY = fingerY;
      lastMoveT = lastTouchT;
      fingerVel = 0;
      // vel はゼロにしない: キャッチ直後の grace 期間は既存の慣性速度を使って
      // 物理判定する（減速は正常、逆走・加速はテレポート）
    };
    const onTouchMove = (e: TouchEvent) => {
      lastTouchT = performance.now();
      if (e.touches.length > 1) {
        multiTouch = true;
        fingerDown = false;
        return;
      }
      const yPos = e.touches[0].clientY;
      const dtm = lastTouchT - lastMoveT;
      if (dtm > 0) fingerVel = fingerVel * 0.7 + ((yPos - lastMoveY) / dtm) * 0.3;
      lastMoveY = yPos;
      lastMoveT = lastTouchT;
      fingerY = yPos;
    };
    const onTouchEnd = (e: TouchEvent) => {
      lastTouchT = performance.now();
      if (e.touches.length > 0) return;
      if (fingerDown) vel = -fingerVel; // 慣性初速 = 指を離した瞬間の速度
      fingerDown = false;
      multiTouch = false;
    };

    const fix = (top: number, t: number) => {
      window.scrollTo(0, top);
      fixCount += 1;
      // 診断 HUD（?debug=scroll）が補正回数を表示できるように公開
      (window as unknown as { __scrollGuardFixes?: number }).__scrollGuardFixes = fixCount;
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
      const maxY = document.documentElement.scrollHeight - h;
      const guardable =
        t > backoffUntil &&
        t - lastTouchT < TOUCH_RECENT_MS &&
        y > EDGE_PX &&
        y < maxY - EDGE_PX;

      if (fingerDown && !multiTouch && t - touchStartT > TOUCH_GRACE_MS) {
        // --- ドラッグ中: スクロールは指の移動と 1:1 で逆向きのはず ---
        const expected = -(fingerY - fingerFrameY);
        const err = dy - expected;
        if (guardable && Math.abs(dy) > DRAG_JUMP_PX && Math.abs(err) > DRAG_JUMP_PX) {
          const target = lastY + expected;
          fix(target, t);
          lastY = target;
        } else {
          lastY = y;
        }
      } else {
        // --- 慣性中（+ キャッチ直後の grace）: 加速も逆走もありえない ---
        const expected = vel * dt;
        let violation: boolean;
        if (Math.abs(expected) < 5) {
          violation = Math.abs(dy) > STATIC_JUMP_PX;
        } else if (Math.sign(dy) !== Math.sign(expected) && dy !== 0) {
          violation = Math.abs(dy) > MOMENTUM_SIGN_PX;
        } else {
          violation = Math.abs(dy) > Math.abs(expected) * MOMENTUM_ACCEL_RATIO + MOMENTUM_ACCEL_PAD;
        }
        if (violation && guardable) {
          const target = lastY + expected;
          fix(target, t);
          lastY = target;
        } else {
          // 正常フレームだけ速度を学習（テレポートで速度を汚さない）
          if (!violation && dt > 0) vel = vel * 0.8 + (dy / dt) * 0.2;
          lastY = y;
        }
      }

      fingerFrameY = fingerY;
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
