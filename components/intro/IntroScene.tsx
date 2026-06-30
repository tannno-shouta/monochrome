"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Text3D } from "@react-three/drei";
import type { MotionValue } from "framer-motion";

// 背景色: 序盤の明るめ → 回廊終盤も明るいグレーのまま（暗く沈ませない）。
// 次章のギャラリーが明るい無人ギャラリーで始まるので、暗いくぼみを作らず明→明で繋ぐ。
const BG_START = new THREE.Color("#9b9b9b");
const BG_END = new THREE.Color("#828284"); // ほぼ同じ明るさのグレー（軽く締まる程度）

// Archivo Black（幅広ジオメトリック極太・OFL）。TTF→typeface.json に変換して同梱。
const FONT = "/fonts/archivo-black.typeface.json";

const WALL_HEIGHT = 0.8; // 押し出し量。ds-k 風の浅い厚み（読みやすさ優先）
const CORRIDOR = 0.6; // 2枚の壁の間隔＝行間＝回廊幅。詰めると行間も回廊も狭くなる

function WallLine({ text, y }: { text: string; y: number }) {
  return (
    // X と Y をセンタリング（Y を中央揃えにして2行を z=0 対称に＝カメラが回廊中央を通る）。
    // Z(押し出し)は床から上へ伸ばすため非センタリング。
    <Center disableZ position={[0, y, 0]}>
      <Text3D
        font={FONT}
        size={1}
        height={WALL_HEIGHT}
        letterSpacing={0.15}
        curveSegments={10}
        bevelEnabled
        bevelThickness={0.01}
        bevelSize={0.004}
        bevelSegments={3}
      >
        {text}
        {/* このジオメトリでは material-1 が前後の面（読める文字の顔）、material-0 が側面（厚み・壁） */}
        <meshStandardMaterial attach="material-0" color="#6e6e73" roughness={0.9} metalness={0.02} />
        <meshStandardMaterial attach="material-1" color="#0c0c0d" roughness={0.8} metalness={0.05} />
      </Text3D>
    </Center>
  );
}

/** MONO / CHROME を床に寝かせ上に押し出し → 左右2枚の壁（回廊）。X方向に読む。
 *  scale で全体を一括拡大（文字・回廊幅・押し出し量の比率は維持）。 */
function Corridor() {
  return (
    <group scale={1.18} rotation={[-Math.PI / 2, 0, 0]}>
      <WallLine text="MONO" y={CORRIDOR} />
      <WallLine text="CHROME" y={-CORRIDOR} />
    </group>
  );
}

type Key = { at: number; pos: [number, number, number]; look: [number, number, number] };
// カメラ: ①上から読む → ②左端(M/C)から回廊へ侵入(床近く) → ③前進
const KEYS: Key[] = [
  { at: 0.0, pos: [0, 9, 0.8], look: [0, 0, 0] }, // ほぼ真上＝押し出し側面を隠してフラットに読ませる
  { at: 0.45, pos: [-5.5, 0.45, 0], look: [3, 0.5, 0] }, // 床近くまで下降→左端(M/C)から回廊中央へ侵入
  { at: 1.0, pos: [5, 0.5, 0], look: [14, 0.5, 0] }, // 回廊を前進（出口で暗転＝シェル側のブラックアウト）
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function sample(p: number): { pos: [number, number, number]; look: [number, number, number] } {
  if (p <= KEYS[0].at) return { pos: KEYS[0].pos, look: KEYS[0].look };
  if (p >= KEYS[KEYS.length - 1].at) {
    const k = KEYS[KEYS.length - 1];
    return { pos: k.pos, look: k.look };
  }
  let i = 0;
  while (i < KEYS.length - 1 && p > KEYS[i + 1].at) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = (p - a.at) / (b.at - a.at);
  const e = t * t * (3 - 2 * t); // smoothstep
  return {
    pos: [lerp(a.pos[0], b.pos[0], e), lerp(a.pos[1], b.pos[1], e), lerp(a.pos[2], b.pos[2], e)],
    look: [lerp(a.look[0], b.look[0], e), lerp(a.look[1], b.look[1], e), lerp(a.look[2], b.look[2], e)],
  };
}

/** scrollYProgress(1本) を読んで毎フレーム カメラを駆動 */
function CameraRig({ progress }: { progress: MotionValue<number> }) {
  useFrame((state) => {
    const { pos, look } = sample(progress.get());
    state.camera.position.set(pos[0], pos[1], pos[2]);
    state.camera.lookAt(look[0], look[1], look[2]);
  });
  return null;
}

/** 背景色を進捗に応じて明るめ→コンクリ暗色へ補間（p=0.35〜0.9 で遷移） */
function BgColor({ progress }: { progress: MotionValue<number> }) {
  const color = useRef(new THREE.Color()).current;
  useFrame((state) => {
    const t = THREE.MathUtils.clamp((progress.get() - 0.35) / 0.55, 0, 1);
    color.copy(BG_START).lerp(BG_END, t);
    state.scene.background = color;
  });
  return null;
}

/**
 * R3F 本体（Canvas）。IntroPortal3D から dynamic import（ssr:false）で遅延読込される。
 * スクロール進捗は親(framer useScroll)から MotionValue で1本もらい、useFrame でカメラ駆動。
 * TODO(Phase 5): 回廊最奥に「動画先頭フレーム静止画」の Plane(meshBasicMaterial) → ポータル突入。
 */
export function IntroScene({ progress }: { progress: MotionValue<number> }) {
  return (
    <Canvas camera={{ position: [0, 9, 0.8], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <directionalLight position={[-5, 2, -3]} intensity={0.4} />
      {/* 床に寝かせ上に押し出し → 壁は y=0 から上へ（X方向だけセンタリング） */}
      <Center disableY disableZ>
        <Corridor />
      </Center>
      <CameraRig progress={progress} />
      <BgColor progress={progress} />
    </Canvas>
  );
}
