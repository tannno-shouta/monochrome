"use client";

import { useSyncExternalStore } from "react";

// Tailwind の md ブレークポイント（768px）未満をモバイル扱いにする。
const QUERY = "(max-width: 767px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * md 未満（〜767px）かどうかをリアクティブに返す。
 * SSR は false（PC レイアウトで描画し、クライアントで確定）なので、
 * 分岐結果が hydration 後に変わりうる前提で使うこと（初回ペイント差し替え許容の演出向け）。
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
