"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";

/**
 * RATIO SCRUB — 寸法線プレート（Chapter 02 の見せ場）。
 * シルエット章が“時間”をスクラブするのに対し、このプレートは“比率”をスクラブする。
 * 写真そのものを横ドラッグ＝ドレス値 0〜10 の連続値。キー4状態（0:10 / 5:5 / 7:3 / 10:0）を
 * クロスフェード＋微パララックスで繋ぎ、指を離すと最寄りの目盛りへスナップ
 * （7 だけ磁力の吸引範囲が広く、放っておくと 7:3 に帰る）。
 * 初回ビューポート進入時のみ 0→5→7 のオートパスを一度だけ再生
 * （順路: 幼い→無難→正解。兼・ドラッグ可能のヒント）。掴んだ瞬間に中断して手動探索へ。
 * 将来 TapNow のモーフ動画が用意できたら、画像スタック部分だけ動画スクラブ
 * （ドレス値→currentTime マップ、iOS プレイブック流用）に差し替える。ゲージ/判定 UI は共通。
 */

type Frame = {
  src: string;
  dress: number;
  casual: number;
  verdict: string;
};

// TODO: 仮画像。TapNow で同一モデル・同一ポーズの4状態を生成したら /images/ratio-*.jpg に差し替え
const FRAMES: Frame[] = [
  { src: "/images/interlude-poster.jpg", dress: 0, casual: 10, verdict: "幼く見える" },
  { src: "/images/gallery-poster.jpg", dress: 5, casual: 5, verdict: "無難" },
  { src: "/images/gallery-portal.jpg", dress: 7, casual: 3, verdict: "洗練＋抜け感 ✓" },
  { src: "/images/why.jpg", dress: 10, casual: 0, verdict: "スーツに見える" },
];

// ゾーン境界（ドレス値）。判定キャプションのパタつき防止にヒステリシスを併用
const BOUNDS = [2.5, 6, 8.5] as const;
const HYSTERESIS = 0.2;

// クロスフェード帯（境界 ±0.4）。opacity/scale の useTransform キーに使う
const FADE0 = [0, 2.1, 2.9] as const;
const FADE1 = [2.1, 2.9, 5.6, 6.4] as const;
const FADE2 = [5.6, 6.4, 8.1, 8.9] as const;
const FADE3 = [8.1, 8.9, 10] as const;

function zoneFor(v: number, current: number): number {
  let z = current;
  while (z < BOUNDS.length && v > BOUNDS[z] + HYSTERESIS) z++;
  while (z > 0 && v < BOUNDS[z - 1] - HYSTERESIS) z--;
  return z;
}

// 指を離したときのスナップ先。7 の吸引範囲だけ広く取る（放っておくと 7:3 に帰る）
function snapTarget(v: number): number {
  if (v >= 5.8 && v <= 8.8) return 7;
  if (v < 2.9) return 0;
  if (v < 5.8) return 5;
  return 10;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const SNAP_SPRING = { type: "spring", stiffness: 180, damping: 26 } as const;
const NUDGE_SPRING = { type: "spring", stiffness: 320, damping: 30 } as const;

export function RatioScrubPlate() {
  const figRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationPlaybackControls | null>(null);
  const glowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startT = useRef(0);
  const interacted = useRef(false);
  const zoneRef = useRef(0);
  // ドラッグ制御（mouse は Pointer Events、touch はネイティブリスナーで別処理）
  const mouseDrag = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const axisLock = useRef<null | "x" | "y">(null);
  const touchId = useRef<number | null>(null);
  const wheelIdle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [zone, setZone] = useState(0);
  const [glowing, setGlowing] = useState(false);
  const [hintGone, setHintGone] = useState(false);

  const reduceMotion = useReducedMotion();
  const inView = useInView(figRef, { once: true, amount: 0.45 });

  // ドレス値 0〜10 の連続値（スクラブの実体）
  const t = useMotionValue(0);

  const needleLeft = useTransform(t, [0, 10], ["0%", "100%"]);
  const driftX = useTransform(t, [0, 10], ["1.5%", "-1.5%"]);
  const dressInt = useTransform(t, (v) => Math.round(clamp(v, 0, 10)));
  const casualInt = useTransform(t, (v) => 10 - Math.round(clamp(v, 0, 10)));

  const op0 = useTransform(t, [...FADE0], [1, 1, 0]);
  const op1 = useTransform(t, [...FADE1], [0, 1, 1, 0]);
  const op2 = useTransform(t, [...FADE2], [0, 1, 1, 0]);
  const op3 = useTransform(t, [...FADE3], [0, 1, 1]);
  // 入れ替わる写真がわずかに寄って収まる＝“1本のフィルムを撫でてる”微パララックス
  const sc0 = useTransform(t, [...FADE0], [1, 1, 1.04]);
  const sc1 = useTransform(t, [...FADE1], [1.04, 1, 1, 1.04]);
  const sc2 = useTransform(t, [...FADE2], [1.04, 1, 1, 1.04]);
  const sc3 = useTransform(t, [...FADE3], [1.04, 1, 1]);
  const opacities = [op0, op1, op2, op3];
  const scales = [sc0, sc1, sc2, sc3];

  useMotionValueEvent(t, "change", (v) => {
    // aria は毎フレーム変わるので setState でなく属性を直接更新（再レンダー回避）
    const el = boxRef.current;
    if (el) {
      const d = Math.round(clamp(v, 0, 10));
      el.setAttribute("aria-valuenow", String(d));
      el.setAttribute("aria-valuetext", `ドレス${d} : カジュアル${10 - d}`);
    }
    const z = zoneFor(v, zoneRef.current);
    if (z !== zoneRef.current) {
      zoneRef.current = z;
      setZone(z);
      if (z === 2) {
        // 7:3 到達の合図。内枠が一瞬灯る
        setGlowing(true);
        if (glowTimer.current) clearTimeout(glowTimer.current);
        glowTimer.current = setTimeout(() => setGlowing(false), 700);
      }
    }
  });

  // 初回ビューポート進入時のオートパス（0→5 で一拍→7）。reduced-motion 時は 7:3 静止から
  useEffect(() => {
    if (!inView || interacted.current) return;
    if (reduceMotion) {
      t.set(7);
      return;
    }
    animRef.current = animate(t, [0, 5, 5, 7], {
      duration: 3.4,
      times: [0, 0.42, 0.6, 1],
      ease: "easeInOut",
    });
  }, [inView, reduceMotion, t]);

  useEffect(
    () => () => {
      animRef.current?.stop();
      if (glowTimer.current) clearTimeout(glowTimer.current);
    },
    [],
  );

  // touch はネイティブリスナーで自前処理する。
  // iOS Safari は framer-motion の pan（Pointer Events ベース）をスクロール判定で
  // 横取り（pointercancel）するため、横スワイプが届かない。最初の 6px で軸を判定し、
  // 横ロック成立時のみ preventDefault（passive:false 必須）でスクロールを止めてスクラブする。
  // 縦ロック時は何もしない＝ページスクロールにそのまま抜ける（touch-action: pan-y と併用）。
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        touchId.current = null;
        return;
      }
      const c = e.touches[0];
      touchId.current = c.identifier;
      startX.current = c.clientX;
      startY.current = c.clientY;
      startT.current = t.get();
      axisLock.current = null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchId.current === null) return;
      const c = Array.from(e.touches).find((p) => p.identifier === touchId.current);
      if (!c) return;
      const dx = c.clientX - startX.current;
      const dy = c.clientY - startY.current;
      if (axisLock.current === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axisLock.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axisLock.current === "x") {
          // 横スクラブ成立＝掴んだ扱い（縦スクロール通過では発動させない）
          interacted.current = true;
          animRef.current?.stop();
          setHintGone(true);
        }
      }
      if (axisLock.current !== "x") return;
      e.preventDefault();
      const w = el.offsetWidth || 1;
      t.set(clamp(startT.current + (dx / w) * 10, 0, 10));
    };
    const onTouchEnd = () => {
      if (touchId.current === null) return;
      const wasX = axisLock.current === "x";
      touchId.current = null;
      axisLock.current = null;
      if (wasX) animRef.current = animate(t, snapTarget(t.get()), SNAP_SPRING);
    };
    // Mac トラックパッドの2本指横スワイプ（wheel）でもスクラブできるようにする。
    // 横成分が主のときだけ奪い（preventDefault）、縦は通常のページスクロールに渡す。
    // 指の動きに写真がついてくる向き（natural scrolling 前提）で deltaX を減算する。
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      interacted.current = true;
      animRef.current?.stop();
      setHintGone(true);
      const w = el.offsetWidth || 1;
      t.set(clamp(t.get() - (e.deltaX / w) * 10, 0, 10));
      if (wheelIdle.current) clearTimeout(wheelIdle.current);
      wheelIdle.current = setTimeout(() => {
        animRef.current = animate(t, snapTarget(t.get()), SNAP_SPRING);
      }, 160);
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
      if (wheelIdle.current) clearTimeout(wheelIdle.current);
    };
  }, [t]);

  function markInteract() {
    interacted.current = true;
    animRef.current?.stop();
    if (!hintGone) setHintGone(true);
  }

  function nudge(target: number) {
    markInteract();
    animRef.current = animate(t, clamp(target, 0, 10), NUDGE_SPRING);
  }

  return (
    <figure ref={figRef} className="relative select-none">
      {/* プレート本体（枠内完結）。ChapterRatio の額装スタイルを踏襲 */}
      <div className="relative">
        <div
          ref={boxRef}
          role="slider"
          tabIndex={0}
          aria-label="ドレスとカジュアルの比率スクラブ"
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={0}
          aria-valuetext="ドレス0 : カジュアル10"
          className="relative aspect-[3/4] w-full cursor-ew-resize overflow-hidden bg-[#3a3a3a] [-webkit-touch-callout:none] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-paper/60"
          style={{ touchAction: "pan-y" }}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse" || e.button !== 0) return;
            markInteract();
            mouseDrag.current = true;
            startT.current = t.get();
            startX.current = e.clientX;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!mouseDrag.current || e.pointerType !== "mouse") return;
            const w = boxRef.current?.offsetWidth ?? 1;
            t.set(clamp(startT.current + ((e.clientX - startX.current) / w) * 10, 0, 10));
          }}
          onPointerUp={(e) => {
            if (!mouseDrag.current || e.pointerType !== "mouse") return;
            mouseDrag.current = false;
            animRef.current = animate(t, snapTarget(t.get()), SNAP_SPRING);
          }}
          onPointerCancel={(e) => {
            if (!mouseDrag.current || e.pointerType !== "mouse") return;
            mouseDrag.current = false;
            animRef.current = animate(t, snapTarget(t.get()), SNAP_SPRING);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              nudge(Math.round(t.get()) + 1);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              nudge(Math.round(t.get()) - 1);
            } else if (e.key === "Home") {
              e.preventDefault();
              nudge(0);
            } else if (e.key === "End") {
              e.preventDefault();
              nudge(10);
            }
          }}
        >
          {/* 全体ドリフト＋各フレームのクロスフェード（スタックは常時 DOM、opacity 制御のみ） */}
          <motion.div className="absolute inset-0" style={{ x: driftX, scale: 1.05 }}>
            {FRAMES.map((f, i) => (
              <motion.img
                key={f.src}
                src={f.src}
                alt={`ドレス${f.dress} : カジュアル${f.casual} の装い（仮画像）`}
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                style={{ opacity: opacities[i], scale: scales[i] }}
              />
            ))}
          </motion.div>

          {/* 比率リードアウト（DRESS→CASUAL の言及順を守る） */}
          <div className="pointer-events-none absolute right-5 top-4 flex items-baseline gap-1.5 font-display text-paper [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
            <span className="text-[9px] tracking-[0.3em] text-paper/75">DRESS</span>
            <motion.span className="inline-block w-[1.2em] text-right text-lg leading-none">
              {dressInt}
            </motion.span>
            <span className="text-lg leading-none">:</span>
            <motion.span className="inline-block w-[1.2em] text-lg leading-none">
              {casualInt}
            </motion.span>
            <span className="text-[9px] tracking-[0.3em] text-paper/75">CASUAL</span>
          </div>

          {/* ドラッグ可能のヒント（初回操作で消える） */}
          <motion.span
            className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-display text-[9px] tracking-[0.45em] text-paper [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]"
            animate={
              hintGone
                ? { opacity: 0 }
                : reduceMotion
                  ? { opacity: 0.6 }
                  : { opacity: [0.35, 0.75, 0.35] }
            }
            transition={
              hintGone
                ? { duration: 0.3 }
                : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            }
          >
            ← DRAG →
          </motion.span>
        </div>

        {/* 内枠線。7:3 到達時だけ一瞬灯る */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-3 border transition-colors duration-500 ${
            glowing ? "border-paper/80" : "border-paper/25"
          }`}
        />
        <figcaption className="absolute -bottom-3 left-4 bg-[#525252] px-3 font-display text-[10px] tracking-[0.35em] text-paper/70">
          PLATE 02 — 黄金比
        </figcaption>
      </div>

      {/* 建築図面風・寸法線ゲージ（ドレス値 0〜10、7 だけ二重目盛り＋▽） */}
      <div aria-hidden className="relative mt-7 h-9">
        <span className="absolute left-0 right-0 top-3 h-px bg-paper/30" />
        {Array.from({ length: 11 }, (_, i) => (
          <span
            key={i}
            className={`absolute top-3 w-px ${
              i === 0 || i === 5 || i === 10 ? "h-2.5 bg-paper/60" : "h-1.5 bg-paper/30"
            }`}
            style={{ left: `${i * 10}%` }}
          />
        ))}
        <span className="absolute top-3 h-2.5 w-px bg-paper/80" style={{ left: "calc(70% - 2px)" }} />
        <span className="absolute top-3 h-2.5 w-px bg-paper/80" style={{ left: "calc(70% + 2px)" }} />
        <span
          className="absolute -top-1.5 -translate-x-1/2 text-[8px] leading-none text-paper/80"
          style={{ left: "70%" }}
        >
          ▽
        </span>
        {[0, 5, 7, 10].map((n) => (
          <span
            key={n}
            className={`absolute top-6 font-display text-[10px] tracking-[0.15em] ${
              n === 7 ? "text-paper/90" : "text-paper/50"
            } ${n === 0 ? "" : n === 10 ? "-translate-x-full" : "-translate-x-1/2"}`}
            style={{ left: `${n * 10}%` }}
          >
            {n}
          </span>
        ))}
        {/* 針（現在のドレス値） */}
        <motion.span
          className="absolute top-1 h-[22px] w-px bg-paper"
          style={{ left: needleLeft, x: "-50%" }}
        />
      </div>

      {/* 判定キャプション（状態が変わると静かに差し替え） */}
      <motion.p
        key={zone}
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`mt-3 text-right font-display text-[10px] tracking-[0.3em] ${
          zone === 2 ? "text-paper" : "text-paper/60"
        }`}
      >
        “{FRAMES[zone].dress}:{FRAMES[zone].casual} — {FRAMES[zone].verdict}”
      </motion.p>
    </figure>
  );
}
