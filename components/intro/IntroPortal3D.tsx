"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useMotionValue,
} from "framer-motion";
import { IntroFallback } from "./IntroFallback";
import { BlurText } from "@/components/animations/BlurText";
import { useIsMobile } from "@/lib/useIsMobile";

// R3F 本体は ssr:false で遅延読込。3D を出すと判定した時だけ実際に import される。
const IntroScene = dynamic(
  () => import("./IntroScene").then((m) => m.IntroScene),
  { ssr: false },
);

/** 3D を走らせてよい環境か（重い R3F を読み込む"前"に判定する。plans §2-4） */
function canRun3D(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // モバイルも 3D を出す（画面幅では弾かない）。低スペック・省データ・WebGL 不可のみ除外。

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory > 0 && nav.deviceMemory < 4) {
    return false;
  }

  // WebGL 可否
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return false;
  } catch {
    return false;
  }
  return true;
}

// 描画モード。SSR/初回ペイントは "pending"（背景のみ＝旧HTMLタイトルをチラ見せしない）。
// マウント後に能力判定で "3d" / "fallback" へ確定。
type Mode = "pending" | "3d" | "fallback";

// 能力判定は1度だけ（getSnapshot は安定値を返す必要があるためキャッシュ）。
let cached: Mode | undefined;
function getClientSnapshot(): Mode {
  if (cached === undefined) cached = canRun3D() ? "3d" : "fallback";
  return cached;
}
const getServerSnapshot = (): Mode => "pending";
const subscribe = () => () => {};

/**
 * 冒頭 3D イントロの入口（軽い client シェル）。
 * useSyncExternalStore で「サーバー=false / クライアント=能力判定」を hydration 安全に切替。
 * 初期描画は必ず IntroFallback（SSR と一致）。能力を満たせば R3F 本体(IntroScene)を
 * dynamic import で差し替える。h-screen をシェル側で確保しレイアウトシフトを防ぐ。
 */
export function IntroPortal3D() {
  const mode = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);

  // 3D シーン(Text3D フォント読込＋初回描画)の完了通知。
  // これが入場アニメの単一起点＝overlay フェードと BlurText の mount を厳密に揃える(P1-A)。
  const [sceneReady3D, setSceneReady3D] = useState(false);
  const handleSceneReady = useCallback(() => setSceneReady3D(true), []);

  // fallback は 3D 依存がないので即 ready 扱い、pending は非表示のまま。
  // 3D は onReady 通知待ちだがフォント 404 やネット激遅で永久グレーにならないよう 3s セーフティタイムアウト。
  useEffect(() => {
    if (mode !== "3d") return;
    const timer = setTimeout(() => setSceneReady3D(true), 3000);
    return () => clearTimeout(timer);
  }, [mode]);
  const isReady = mode === "fallback" || (mode === "3d" && sceneReady3D);

  // 縦長セクションの通過進捗 0→1（カメラ駆動の単一ソース）
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // 末尾ギリギリ(95%〜)だけ素早く黒へ＝次のギャラリーへ短い暗転で繋ぐ
  const blackout = useTransform(scrollYProgress, [0.95, 1], [0, 1]);

  // ds-k.site 風のテキストオーバーレイ：
  // ・p=0 付近: 表示
  // ・スクロール開始で消える（p=0.03 → 0.1）
  // ・一度消えたら、カメラワーク移動中（p=0.1〜任意）に上スクロールで戻ってきても出ない
  // ・ページ最上部まで完全に戻った時（p<0.01）だけ再出現する
  // MotionValue で持つことで、ロック状態の変化が opacity の transform にリアクティブに伝わる
  // （useRef だと callback が再発火するまで反映されず、p=0 で止まると表示が古い値に固着する）。
  const overlayLockedMV = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p > 0.1) overlayLockedMV.set(1);
    else if (p < 0.01) overlayLockedMV.set(0);
  });
  const overlayOpacityRaw = useTransform(scrollYProgress, [0, 0.03, 0.1], [1, 1, 0]);
  const overlayOpacity = useTransform(
    [overlayOpacityRaw, overlayLockedMV],
    ([raw, locked]) => (locked === 1 ? 0 : (raw as number)),
  );

  // 3D Canvas の演出：冒頭は ds-k 風に「左寄せ + 傾き」 で配置し、テキストと共存。
  // スクロール開始でゆっくり真っ直ぐ画面いっぱいに戻り、既存の回廊カメラワークへ繋ぐ。
  // モバイルはテキストが下部配置で「左に避ける」必要がないため、x シフトなし＋控えめな傾きに。
  const canvasRotate = useTransform(scrollYProgress, [0, 0.12], isMobile ? [-3, 0] : [-5, 0]);
  const canvasTranslateX = useTransform(
    scrollYProgress,
    [0, 0.12],
    isMobile ? ["0%", "0%"] : ["-15%", "0%"],
  );
  const canvasScale = useTransform(scrollYProgress, [0, 0.12], isMobile ? [0.92, 1] : [0.85, 1]);

  return (
    <section ref={ref} className="relative h-[400vh] w-full bg-[#9b9b9b]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D Canvas は画面全体。冒頭のみ CSS transform で左寄せ＋傾けて配置し、
            スクロール開始でゆっくり真っ直ぐ画面中央へ復帰する。R3F 内部のカメラは変更しない。
            transform は 3D モード限定（静的フォールバックまで傾けない）。 */}
        <motion.div
          style={
            mode === "3d"
              ? {
                  rotate: canvasRotate,
                  x: canvasTranslateX,
                  scale: canvasScale,
                  transformOrigin: "center center",
                }
              : undefined
          }
          className="absolute inset-0"
        >
          {mode === "3d" && (
            <IntroScene
              progress={scrollYProgress}
              mobile={isMobile}
              onReady={handleSceneReady}
            />
          )}
          {mode === "fallback" && <IntroFallback />}
        </motion.div>

        {/* Canvas 入場 fade: Canvas に直接 CSS filter/opacity が効きづらいため、
            親 section と同色(#9b9b9b)の overlay を被せて 1.0s で透明化＝
            「背景色から Canvas が滲み出る」 演出。
            isReady(＝3D 描画準備完了 or fallback 確定)で初めてフェード開始することで、
            "overlay が消えた後に 3D が遅れて出る" 現象を排除する(P1-A)。 */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isReady ? 0 : 1 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-0 z-[5] bg-[#9b9b9b]"
          aria-hidden
        />

        {/* ds-k.site 風テキストオーバーレイ：冒頭のみ表示、スクロール開始ですぐ消える（双方向）。
            isReady で初めて mount することで BlurText の IntersectionObserver が
            "3D が描画された瞬間" にトリガされ、3D 出現と blur→clear が同期する。 */}
        {isReady && (
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="pointer-events-none absolute inset-0 z-10"
        >
          {/* 左上：小ラベル */}
          <div
            className="absolute left-6 top-6 font-display text-[10px] tracking-[0.4em] text-paper/70 md:left-8 md:top-8 md:text-xs"
            aria-hidden
          >
            ○ Monochrome
          </div>

          {/* 大型タイトル + リード文：画面右寄り集約（縦中央）。md未満は画面下部寄りに重ねる
              （bottom-48 で左下ブランドラベルと十分な間隔を確保）。
              PC は md:max-w-[42vw] まで広げてリード文が 1 行に収まるようにする。 */}
          <div className="absolute bottom-48 right-6 max-w-[88vw] md:bottom-auto md:right-[6vw] md:top-1/2 md:max-w-[42vw] md:-translate-y-1/2">
            <BlurText
              text="色を捨てた。"
              delay={120}
              stepDuration={1.0}
              className="block font-heading text-3xl leading-tight text-paper md:text-5xl lg:text-6xl"
            />
            <BlurText
              text="洗練された統一感"
              delay={420}
              stepDuration={1.0}
              className="mt-2 block font-heading text-3xl leading-tight text-paper md:text-5xl lg:text-6xl"
            />
            {/* リード文: SP は max-w-md で自然折返し、PC は親幅(42vw)を使い切って 1 行 */}
            <BlurText
              text="ファッションセンスとは、シルエットと素材感のロジックを纏うこと。"
              delay={700}
              stepDuration={1.0}
              className="mt-8 block max-w-md font-heading text-sm leading-loose text-paper/85 md:max-w-none md:text-base"
            />
          </div>

          {/* ブランドロゴ：左下 */}
          <div
            className="absolute bottom-8 left-6 font-display text-[10px] tracking-[0.35em] text-paper/60 md:bottom-10 md:left-12 md:text-xs"
            aria-hidden
          >
            MONOCHROME / Chapter 0.01
          </div>
        </motion.div>
        )}

        <motion.div
          style={{ opacity: blackout }}
          className="pointer-events-none absolute inset-0 bg-black"
        />
      </div>
    </section>
  );
}
