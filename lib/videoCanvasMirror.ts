"use client";

/**
 * video のフレームを canvas に object-cover 相当で描画し続けるミラーを張る。
 *
 * なぜ必要か: iOS Safari はメモリ/GPU 圧で video 要素のデコーダを落とし、
 * 要素が「最初のコマ→真っ黒」になることがある（スクロールスクラブのように
 * 再生せず currentTime だけ動かす使い方で顕著）。表示を canvas に分離すれば、
 * シークが完了したフレーム（seeked）だけを描き足していくので、video 要素が
 * 黒落ちしても最後に描けたフレームが画面に残る。
 *
 * 返り値は解除関数。canvas は CSS サイズに合わせて内部解像度を DPR（上限2）で確保する。
 */
export function mirrorVideoToCanvas(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const draw = () => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (!cw || !ch) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pw = Math.round(cw * dpr);
    const ph = Math.round(ch * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }

    // object-cover 相当: canvas のアスペクトに合わせて video の中央を切り出す
    const ca = pw / ph;
    const va = vw / vh;
    let sx = 0;
    let sy = 0;
    let sw = vw;
    let sh = vh;
    if (va > ca) {
      sw = vh * ca;
      sx = (vw - sw) / 2;
    } else {
      sh = vw / ca;
      sy = (vh - sh) / 2;
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, pw, ph);
  };

  video.addEventListener("seeked", draw);
  video.addEventListener("loadeddata", draw);
  window.addEventListener("resize", draw);
  if (video.readyState >= 2) draw();

  return () => {
    video.removeEventListener("seeked", draw);
    video.removeEventListener("loadeddata", draw);
    window.removeEventListener("resize", draw);
  };
}

/**
 * iOS のデコーダを起こす priming。muted + playsInline の video は
 * ユーザー操作なしで play() が許可されるので、一瞬だけ再生を試みてすぐ止める。
 * （呼び出し側に forcePause がある場合は play イベントで即 pause されるが、
 * それでもデコーダ起動の効果はある）
 */
export function primeVideoDecode(video: HTMLVideoElement): void {
  const p = video.play();
  if (p) {
    p.then(() => video.pause()).catch(() => {
      /* NotAllowed/Abort は無視（priming は best-effort） */
    });
  }
}
