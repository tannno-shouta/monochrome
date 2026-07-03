"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ShinyText } from "@/components/animations/ShinyText";
import { TargetCursor } from "@/components/animations/TargetCursor";
import { useIsMobile } from "@/lib/useIsMobile";
import { useHydrated } from "@/lib/useHydrated";
import { useBlobVideoSrc } from "@/lib/useBlobVideoSrc";
import { mirrorVideoToCanvas, primeVideoDecode } from "@/lib/videoCanvasMirror";

/**
 * シルエット見せ場（A/I/Y）。
 * 連結ギャラリー動画（A-before→A-after→I-before→…→Y-before, 黒柱ワイプで連結, ≈30.3s 地点まで使用）を、
 * スクロール量に応じてスクラブする。等速ではなく「各ポーズで停留・暗い黒柱区間は速く通過」
 * させることで、明るいポーズに視点が留まり、各シルエットの説明テキストを重ねる。
 */

// スクロール進捗 → 動画時間(秒) のキーポイント。
// 連続2点が同じ時間＝その区間はポーズで「停留」、異なる＝スクラブ（黒柱区間は短スクロールで速く通過）。
const POSE_A = 6.1;
const POSE_I = 18.2;
// Yポーズ完成位置（Y-before 末尾≒30.32s）で一旦停留 → Y-after（モデル左移動・カメラ右パン）まで再生。
// 動画末尾(～36.25s)に素材としての暗転が含まれており、それも演出として最後まで再生する。
const POSE_Y = 30.3;
const VIDEO_END = 36.25;
const STOPS: [number, number][] = [
  [0.0, 0.0],
  [0.1, POSE_A],
  [0.24, POSE_A],
  [0.34, POSE_I],
  [0.48, POSE_I],
  [0.58, POSE_Y],
  [0.82, POSE_Y], // ── Y ポーズで停留（caption 表示中）
  [1.0, VIDEO_END], // ── Y-after を再生（モデル左移動 + カメラ右パン）
];

function mapScrollToTime(p: number): number {
  if (p <= STOPS[0][0]) return STOPS[0][1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [p0, t0] = STOPS[i];
    const [p1, t1] = STOPS[i + 1];
    if (p <= p1) return t0 + (t1 - t0) * ((p - p0) / (p1 - p0));
  }
  return STOPS[STOPS.length - 1][1];
}

type AnnotationLabel = {
  text: string;
  // テキスト位置（絶対配置スタイル）。right/top など vw/vh で指定。
  textStyle: React.CSSProperties;
};

type Annotation = {
  // 1 本の連続折れ線（viewBox 0 0 100 100, preserveAspectRatio="none"）。
  // テキストトップス下 → モデルトップス → 縦線 → モデルパンツ → テキストパンツ下
  // を一筆書きで繋いで、描画アニメも一筆で進むようにする。
  path: string;
  // path 上に重ねるラベル群（位置は別配置）。
  labels: AnnotationLabel[];
};

// 座標系メモ（annotations / annotationsMobile 共通）:
// SVG は viewBox 100x100 + preserveAspectRatio="none" ＝ viewport 全面に引き伸ばし。
// 動画(1280x720)は object-cover なので、PC(横長)は動画座標≒viewport座標だが、
// モバイル縦画面では「動画の中央約26%幅」だけが見える＝モデルが画面幅いっぱいに拡大される。
// そのため PC とモバイルで指し先座標を別データで持つ（モデル位置: 縦は等倍、横は中央拡大）。

// 動画ソース。モバイル版は中央 512px(40%) クロップ＝縦画面で見える範囲（最大でも中央32%）を
// 全て含むので、object-cover の見え方・annotationsMobile の座標は PC 素材と完全一致のまま
// 26MB → 13MB に軽量化（all-intra 維持でスクラブ互換、bitrate 3Mbps で iPhone Retina 画質）。
// SSR の HTML に src を書くとブラウザのプリローダーがモバイルでも 26MB を先読みし始めるため、
// src はマウント後に isMobile 確定してから注入する。
// -v2 サフィックス: 旧 1.5Mbps エンコードのブラウザキャッシュを確実にバストするための命名。
const VIDEO_SRC_DESKTOP = "/videos/gallery-graded.mp4";
const VIDEO_SRC_MOBILE = "/videos/gallery-mobile-v2.mp4";

const LINES = [
  {
    key: "A",
    label: "A-LINE",
    title: "スタイルカバー\nと\nおしゃれなリラックス感を演出",
    feature: "「A」のように、ジャストサイズのトップスにワイドパンツをあわせたスタイル。",
    body: "下にボリュームを持たせ、大人な余裕と親しみやすさを演出。胴長寸胴の人でもスタイルカバーができ、オシャレに見えやすいシルエット。",
    trend: false,
    range: [0.12, 0.16, 0.21, 0.24] as const,
    annotations: [
      {
        path: "M 72 36 L 66 36 L 54 39",
        labels: [
          {
            text: "ジャストサイズ\nのトップス",
            textStyle: { top: "34vh", right: "20vw", textAlign: "left" as const },
          },
        ],
      },
      {
        path: "M 72 76 L 66 76 L 54 75",
        labels: [
          {
            text: "ワイドサイズ\nのパンツ",
            textStyle: { top: "74vh", right: "21vw", textAlign: "left" as const },
          },
        ],
      },
    ] satisfies Annotation[],
    annotationsMobile: [
      {
        // トップス: text top 24vh(モデル肩の上寄り)、線は text 下(32)から model 胸元(41)へ
        path: "M 8 32 L 18 32 L 30 41",
        labels: [
          {
            text: "ジャストサイズ\nのトップス",
            textStyle: { top: "24vh", left: "5vw", textAlign: "left" as const },
          },
        ],
      },
      {
        path: "M 92 56 L 80 56 L 68 66",
        labels: [
          {
            text: "ワイドサイズ\nのパンツ",
            textStyle: { top: "48vh", right: "5vw", textAlign: "right" as const },
          },
        ],
      },
    ] satisfies Annotation[],
  },
  {
    key: "I",
    label: "I-LINE",
    title: "大人っぽくラグジュアリーに、\n清潔感を演出",
    feature: "「I」のように、上下ともに太さをまとめたスタイル。",
    body: "上下を細くするより、セミワイドでまとめるのが今の主流。カジュアルからビジネスまで対応でき、縦に長くスタイリッシュなシルエット。",
    trend: true,
    range: [0.36, 0.4, 0.45, 0.48] as const,
    annotations: [
      {
        path: "M 72 36 L 66 36 L 54 39",
        labels: [
          {
            text: "セミワイド\nのトップス",
            textStyle: { top: "34vh", right: "21vw", textAlign: "left" as const },
          },
        ],
      },
      {
        path: "M 72 76 L 66 76 L 54 75",
        labels: [
          {
            text: "セミワイド\nのパンツ",
            textStyle: { top: "74vh", right: "21vw", textAlign: "left" as const },
          },
        ],
      },
    ] satisfies Annotation[],
    annotationsMobile: [
      {
        // トップス: I-LINE はロングコートで面積が大きいので、線を右下方向に伸ばして
        // コート本体(ベルト付近)まで確実に届かせる
        path: "M 8 32 L 18 32 L 42 60",
        labels: [
          {
            text: "セミワイド\nのトップス",
            textStyle: { top: "24vh", left: "5vw", textAlign: "left" as const },
          },
        ],
      },
      {
        path: "M 92 56 L 80 56 L 64 78",
        labels: [
          {
            text: "セミワイド\nのパンツ",
            textStyle: { top: "48vh", right: "5vw", textAlign: "right" as const },
          },
        ],
      },
    ] satisfies Annotation[],
  },
  {
    key: "Y",
    label: "Y-LINE",
    title: "秋冬に映える、\nスマートな男らしさ",
    feature: "「Y」のように、ゆったりとしたトップスにすっきりとしたパンツをあわせたスタイル。",
    body: "着こなし難易度は少し高め。上半身を盛りすぎたり下半身をピチピチにすると“時代遅れ”に見えてしまう。「ゆったり×すっきり」の適度なメリハリで、トイレの標識のように男らしいシルエットに。",
    trend: false,
    range: [0.6, 0.64, 0.78, 0.82] as const, // 停留区間内に収め、Y-after 再生中は消える
    annotations: [
      {
        path: "M 72 36 L 66 36 L 54 39",
        labels: [
          {
            text: "ゆったり\nのトップス",
            textStyle: { top: "34vh", right: "22vw", textAlign: "left" as const },
          },
        ],
      },
      {
        path: "M 72 76 L 66 76 L 54 75",
        labels: [
          {
            text: "すっきり\nのパンツ",
            textStyle: { top: "74vh", right: "23vw", textAlign: "left" as const },
          },
        ],
      },
    ] satisfies Annotation[],
    annotationsMobile: [
      {
        // トップス: A-LINE / I-LINE と同じ配置(モデル肩の上寄りから胸元へ)
        path: "M 8 32 L 18 32 L 34 39",
        labels: [
          {
            text: "ゆったり\nのトップス",
            textStyle: { top: "24vh", left: "5vw", textAlign: "left" as const },
          },
        ],
      },
      {
        path: "M 92 56 L 80 56 L 60 66",
        labels: [
          {
            text: "すっきり\nのパンツ",
            textStyle: { top: "48vh", right: "5vw", textAlign: "right" as const },
          },
        ],
      },
    ] satisfies Annotation[],
  },
];

export function SilhouetteGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introOverlayRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // hydration 後（= isMobile 確定後）に URL を確定し、blob 化してからスクラブに使う
  // （iOS Safari は preload を無視するため、メモリに載せないとシークが応答しない）。
  // SSR/初回ペイント〜blob 取得完了までは poster のみ。
  const hydrated = useHydrated();
  const videoUrl = hydrated ? (isMobile ? VIDEO_SRC_MOBILE : VIDEO_SRC_DESKTOP) : null;
  const videoSrc = useBlobVideoSrc(videoUrl);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // モバイル（iOS 対策）: 表示は canvas ミラーに任せ、video はシーク専用にする。
  // iOS はデコーダを落として video 要素が「最初のコマ→真っ黒」になるため、
  // seeked のたびに canvas へ描画（黒落ちしても最後のフレームが残る）＋ priming で起こす。
  useEffect(() => {
    if (!isMobile || prefersReducedMotion) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !videoSrc) return;

    const cleanupMirror = mirrorVideoToCanvas(video, canvas);
    const prime = () => primeVideoDecode(video);
    if (video.readyState >= 1) prime();
    else video.addEventListener("loadedmetadata", prime, { once: true });

    return () => {
      cleanupMirror();
      video.removeEventListener("loadedmetadata", prime);
    };
  }, [isMobile, prefersReducedMotion, videoSrc]);

  // Hero→シルエット に入るたび（下/上スクロール問わず）黒からフェードイン演出を再発火。
  // 同名 class を付け直しても animation は再開しないため、一旦外す→強制 reflow→再付与する。
  useEffect(() => {
    const section = ref.current;
    const overlay = introOverlayRef.current;
    if (!section || !overlay) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            overlay.classList.remove("silhouette-intro-fade");
            // 強制 reflow で animation を完全リセット
            void overlay.offsetWidth;
            overlay.classList.add("silhouette-intro-fade");
          }
        }
      },
      { threshold: 0 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // scrollYProgress → video.currentTime（停留マッピング ＋ rAF lerp）。
  // muted+playsInline でブラウザが勝手に再生し暗転フレームへ進むのを防ぐため強制 pause も入れる。
  useEffect(() => {
    if (prefersReducedMotion) return;
    const video = videoRef.current;
    if (!video) return;

    video.autoplay = false;
    const forcePause = () => {
      if (!video.paused) video.pause();
    };
    video.addEventListener("play", forcePause);
    video.addEventListener("playing", forcePause);

    let raf = 0;
    let target = 0;
    let ready = false;

    const tick = () => {
      raf = 0;
      if (!ready) return;
      forcePause();
      const cur = video.currentTime;
      const next = cur + (target - cur) * 0.2;
      if (Math.abs(next - cur) > 0.01) {
        try {
          video.currentTime = next;
        } catch {}
        raf = requestAnimationFrame(tick);
      }
    };

    // onMeta は readyState>=1 なら同期実行されるため、tick より後に定義しない（TDZ 回避）
    const onMeta = () => {
      ready = (video.duration || 0) > 0;
      forcePause();
      // src 注入/差替（hydration 後・breakpoint またぎ）直後も、次の scroll イベントを
      // 待たずに現在のスクロール位置のフレームへ即同期させる
      target = mapScrollToTime(Math.min(Math.max(scrollYProgress.get(), 0), 1));
      if (ready && !raf) raf = requestAnimationFrame(tick);
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);

    const unsubscribe = scrollYProgress.on("change", (p) => {
      if (!ready) return;
      target = mapScrollToTime(Math.min(Math.max(p, 0), 1));
      forcePause();
      if (!raf) raf = requestAnimationFrame(tick);
    });

    return () => {
      unsubscribe();
      if (raf) cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("play", forcePause);
      video.removeEventListener("playing", forcePause);
    };
  }, [prefersReducedMotion, scrollYProgress]);

  return (
    <section ref={ref} className="relative h-[600vh] w-full bg-black">
      {/* シルエットパート限定の TargetCursor（PC のみ・section内 hover時のみ表示） */}
      <TargetCursor containerRef={ref} />
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoSrc ?? undefined}
          poster="/images/gallery-poster-graded.jpg"
          muted
          playsInline
          preload="auto"
          aria-label="A/I/Y シルエットのモデルを見渡すギャラリー映像"
          className="h-full w-full object-cover"
        />

        {/* モバイル: video の黒落ち対策の表示用 canvas（video の上・テキスト類の下） */}
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full md:hidden"
        />

        {LINES.map(({ key, annotations, annotationsMobile, ...rest }) => (
          <SilhouetteCaption key={key} progress={scrollYProgress} {...rest} />
        ))}

        {LINES.map(({ key, annotations, annotationsMobile, range }) => (
          <SilhouetteAnnotations
            key={`ann-${key}`}
            lineKey={key}
            progress={scrollYProgress}
            annotations={isMobile ? annotationsMobile : annotations}
            range={range}
          />
        ))}

        {/* Hero 末尾の暗転からシームレスに繋ぐ：初期は黒、section が viewport に入るたび
            silhouette-intro-fade class が付与されて animation 発火 */}
        <div
          ref={introOverlayRef}
          className="pointer-events-none absolute inset-0 bg-black"
        />
      </div>
    </section>
  );
}

function SilhouetteAnnotations({
  progress,
  annotations,
  range,
  lineKey,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  annotations: readonly Annotation[];
  range: readonly [number, number, number, number];
  lineKey: string;
}) {
  const [inA, inB, outA, outB] = range;
  const opacity = useTransform(progress, [inA, inB, outA, outB], [0, 1, 1, 0]);
  // 描画アニメ: framer-motion の pathLength を使うと内部で stroke-dasharray/dashoffset を
  // 正しく計算してくれる（vectorEffect + viewBox スケールでも線が途切れない）。
  const drawEnd = inA + (inB - inA) * 0.6;
  const pathLengthProgress = useTransform(progress, [inA, drawEnd], [0, 1]);
  const gradId = `silhouette-shine-${lineKey}`;

  return (
    <motion.div style={{ opacity }} className="pointer-events-none absolute inset-0">
      {/* viewBox 100x100 + preserveAspectRatio="none" + vector-effect で線の太さを画面比率不変に保つ */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          {/* 光が走るグラデーション：stop offset を SMIL animation で左→右へ流す */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(245,245,245,0.55)">
              <animate
                attributeName="offset"
                values="-0.3;1.0"
                dur="2.8s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="0%" stopColor="rgba(255,255,255,1)">
              <animate
                attributeName="offset"
                values="-0.15;1.15"
                dur="2.8s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="0%" stopColor="rgba(245,245,245,0.55)">
              <animate
                attributeName="offset"
                values="0;1.3"
                dur="2.8s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
        {annotations.map((a, i) => (
          <motion.path
            key={i}
            d={a.path}
            stroke={`url(#${gradId})`}
            strokeWidth="0.35"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
            style={{ pathLength: pathLengthProgress }}
          />
        ))}
      </svg>
      {annotations.flatMap((a, ai) =>
        a.labels.map((lab, li) => (
          <span
            key={`${ai}-${li}`}
            style={lab.textStyle}
            className="absolute whitespace-pre-line font-heading text-xs font-medium leading-snug text-paper md:text-sm"
          >
            {lab.text}
          </span>
        )),
      )}
    </motion.div>
  );
}

function SilhouetteCaption({
  progress,
  label,
  title,
  titleAlign,
  feature,
  body,
  trend,
  range,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  label: string;
  title: string;
  titleAlign?: "left" | "center";
  feature: string;
  body: string;
  trend: boolean;
  range: readonly [number, number, number, number];
}) {
  const [inA, inB, outA, outB] = range;
  // 親コンテナ全体の表示制御（フェードアウトもこれで一括）
  const containerOpacity = useTransform(progress, [inA, outA, outB], [1, 1, 0]);
  // 4要素を停留区間 inA→inB の中で順次フェードイン（label → title → feature → body）
  const step = (inB - inA) / 4;
  const labelOpacity = useTransform(progress, [inA, inA + step], [0, 1]);
  const labelY = useTransform(progress, [inA, inA + step], [16, 0]);
  // TREND タグは fade in → 停留 → fade out まで含めて制御（caption と独立した motion.div のため）
  const trendOpacity = useTransform(progress, [inA, inA + step, outA, outB], [0, 1, 1, 0]);
  // 入場バウンス: scale 0.9 → 1 で軽くポップ
  const trendScale = useTransform(progress, [inA, inA + step], [0.9, 1]);
  const titleOpacity = useTransform(progress, [inA + step, inA + step * 2], [0, 1]);
  const titleY = useTransform(progress, [inA + step, inA + step * 2], [16, 0]);
  const featureOpacity = useTransform(progress, [inA + step * 2, inA + step * 3], [0, 1]);
  const featureY = useTransform(progress, [inA + step * 2, inA + step * 3], [16, 0]);
  const bodyOpacity = useTransform(progress, [inA + step * 3, inB], [0, 1]);
  const bodyY = useTransform(progress, [inA + step * 3, inB], [16, 0]);
  // モバイルは caption がモデルの足元に重なるため、可読性確保の黒グラデスクリムを
  // caption と同じタイミングで出す（PC は動画の左余白に置けるので不要）。
  const scrimOpacity = useTransform(progress, [inA, inA + step, outA, outB], [0, 1, 1, 0]);

  return (
    <>
      <motion.div
        style={{ opacity: scrimOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[36vh] bg-gradient-to-t from-black/80 via-black/40 to-transparent md:hidden"
        aria-hidden
      />
      <motion.div
        style={{ opacity: containerOpacity }}
        className="pointer-events-none absolute bottom-[6vh] left-[6vw] right-[6vw] text-paper md:bottom-[10vh] md:right-auto md:max-w-md"
      >
        <motion.p
          style={{ opacity: labelOpacity, y: labelY }}
          className="font-display text-[10px] tracking-[0.4em] text-gray-3"
        >
          {label}
        </motion.p>
        <motion.h3
          style={{ opacity: titleOpacity, y: titleY }}
          className={`mt-2 whitespace-pre-line font-heading text-base leading-snug md:text-2xl ${
            titleAlign === "center" ? "text-center" : ""
          }`}
        >
          {/* title は ShinyText で控えめな光沢を流す（黒地 + Noto Serif と相性◯） */}
          <ShinyText
            text={title}
            speed={3.5}
            spread={120}
            color="#e8e8e8"
            shineColor="#ffffff"
            className="whitespace-pre-line"
          />
        </motion.h3>
        <motion.p
          style={{ opacity: featureOpacity, y: featureY }}
          className="mt-3 text-xs leading-relaxed text-gray-3 md:text-sm"
        >
          {feature}
        </motion.p>
        <motion.p
          style={{ opacity: bodyOpacity, y: bodyY }}
          className="mt-2 text-[10px] leading-relaxed text-gray-2 md:text-xs"
        >
          {body}
        </motion.p>
      </motion.div>

      {trend && (
        <motion.div
          style={{ opacity: trendOpacity, scale: trendScale }}
          className="trend-glow-pulse pointer-events-none absolute right-[6vw] top-[10vh] flex items-center gap-2 rounded-full border border-paper/60 bg-black/30 px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-paper" />
          <span className="font-display text-xs tracking-[0.35em] text-paper">TREND</span>
        </motion.div>
      )}
    </>
  );
}
