"use client";

import { useEffect, useState } from "react";

/**
 * 動画を fetch で全量取得して blob URL として返す（apple.com のスクロールスクラブと同方式）。
 *
 * なぜ必要か: iOS Safari は video の preload をほぼ無視し、再生していない動画のデータを
 * 十分にバッファしない。そのため currentTime 書き換えによるスクラブは、シーク先の
 * データ待ちで「いつまでも動かない」ように見える。メモリに載せてからスクラブすれば
 * ネットワーク起因のシーク失敗が構造的に消える。
 *
 * - url が null の間は何もしない（null を返す）
 * - 取得失敗時は元 URL にフォールバック（video 要素の通常ロードに任せる）
 * - blob URL は url 変更/アンマウント時に revoke
 */
export function useBlobVideoSrc(url: string | null): string | null {
  // url と src をペアで持ち、現在の url と一致する時だけ返す。
  // これにより url 変更/リセット直後に revoke 済みの古い blob URL を返さない
  // （setState を伴わずに「無効化」できるので set-state-in-effect にも抵触しない）。
  const [entry, setEntry] = useState<{ url: string; src: string } | null>(null);

  useEffect(() => {
    if (!url) return;
    let alive = true;
    let objectUrl: string | null = null;
    const ctrl = new AbortController();

    fetch(url, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        if (!alive) return;
        objectUrl = URL.createObjectURL(blob);
        setEntry({ url, src: objectUrl });
      })
      .catch(() => {
        // 中断(abort)含む。生きていれば直接 URL にフォールバック
        if (alive) setEntry({ url, src: url });
      });

    return () => {
      alive = false;
      ctrl.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return entry !== null && entry.url === url ? entry.src : null;
}
