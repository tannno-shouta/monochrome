/**
 * 3D を出せない環境（reduced-motion / モバイル / WebGL無効 / 省データ / 低メモリ）向けの
 * 静的フォールバック。SSR と初回ペイントもこれ（hydration mismatch 回避）。
 * TODO(Phase 6): 静止画のみ → 短尺プリレンダ動画にリッチ化する選択肢あり（plans §7-4）。
 */
export function IntroFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <h1 className="text-center font-display font-black leading-[0.95] tracking-tight text-[#101012]">
        <span className="block text-[18vw] md:text-[12vw]">MONO</span>
        <span className="block text-[18vw] md:text-[12vw]">CHROME</span>
      </h1>
    </div>
  );
}
