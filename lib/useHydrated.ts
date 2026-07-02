"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * SSR とクライアントの hydration render では false、直後の再レンダーから true。
 * 「SSR の HTML に書きたくない属性（重い video src 等）をマウント後に導出する」用途向け。
 * setState-in-effect を使わずに済む（react-hooks/set-state-in-effect 対応）。
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
