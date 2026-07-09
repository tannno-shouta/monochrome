"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * TEXTURE INDEX — 素材の座標（Chapter 04 の本体）。
 * 6素材をドレス値の高い順に並べたスペックシート。各行に Chapter 02 の
 * 寸法線と同じ図面言語のミニゲージを置き、スクロール進入で針が
 * 中立（5）からその素材の座標へ滑る。左=CASUAL / 右=DRESS の向きも Ch02 と共通。
 */

type Material = {
  label: string;
  ja: string;
  dress: number; // ドレス値 0〜10（ゲージ座標 = dress * 10%）
  copy: string;
};

const MATERIALS: Material[] = [
  {
    label: "LEATHER",
    ja: "レザー",
    dress: 9,
    copy: "最強のドレス加算。革靴を一足履くだけで、装い全体の比率が締まる。艶が強すぎるエナメルは、狙いがないなら重い。ただし同じ革でも、ライダースやレザーブルゾンはデザインが勝ってカジュアルへ。",
  },
  {
    label: "WOOL",
    ja: "ウール",
    dress: 8,
    copy: "スラックスとロングコートの土台。マットな面が黒を上質に見せる。薄手の起毛は“安物の黒”のサイン。",
  },
  {
    label: "SATIN / SILK",
    ja: "サテン・シルク",
    dress: 7,
    copy: "マット基調に、艶を一点だけ。シャツの光沢が“考えて選んだ人”に化けさせる。全身に増やすと途端に嘘っぽくなる。",
  },
  {
    label: "DENIM",
    ja: "デニム",
    dress: 4,
    copy: "カジュアルの代表。ただし黒の細身なら中間まで寄る——7:3 の“3”を担わせるのが、一番おいしい使い方。",
  },
  {
    label: "NYLON",
    ja: "ナイロン",
    dress: 3,
    copy: "スポーツ由来のカジュアル素材。ただし黒のマットなら、無機質な艶が都会的に振れる。テカりと全身使いは、一気に“部活帰り”へ。",
  },
  {
    label: "COTTON",
    ja: "コットン",
    dress: 3,
    copy: "白Tは“余白”の素材。首元と足元に、最大の清潔感で効く。ヨレと薄さは、そのまま幼さになる。",
  },
  {
    label: "SWEAT",
    ja: "スウェット",
    dress: 0,
    copy: "楽さの代償に、比率を一気にカジュアルへ振る素材。パーカーを着るなら、残りすべてをドレスで締める覚悟で。",
  },
];

function GaugeRow({ m, index }: { m: Material; index: number }) {
  const reduceMotion = useReducedMotion();
  const target = `${m.dress * 10}%`;

  return (
    <motion.li
      className="border-t border-paper/15 py-7 md:grid md:grid-cols-[13rem_1fr] md:gap-10"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* 素材名 */}
      <div className="flex items-baseline gap-3 md:block">
        <span className="font-display text-xl tracking-[0.2em] text-paper md:text-2xl">
          {m.label}
        </span>
        <span className="font-body text-xs tracking-[0.2em] text-gray-3 md:mt-1 md:block">
          {m.ja}
        </span>
      </div>

      <div className="mt-4 md:mt-0">
        {/* ミニ寸法線（左=CASUAL / 右=DRESS、Ch02 と同じ向き） */}
        <div aria-hidden className="relative h-9">
          <span className="absolute -top-0.5 left-0 font-display text-[8px] tracking-[0.25em] text-paper/35">
            CASUAL
          </span>
          <span className="absolute -top-0.5 right-0 font-display text-[8px] tracking-[0.25em] text-paper/35">
            DRESS
          </span>
          <span className="absolute bottom-2 left-0 right-0 h-px bg-paper/25" />
          {Array.from({ length: 11 }, (_, i) => (
            <span
              key={i}
              className={`absolute bottom-2 w-px ${
                i % 5 === 0 ? "h-1.5 bg-paper/40" : "h-1 bg-paper/20"
              }`}
              style={{ left: `${i * 10}%` }}
            />
          ))}
          {/* 針: 中立(5)から素材の座標へ滑る。数字はドレス値 */}
          <motion.div
            className="absolute bottom-1 flex flex-col items-center"
            style={{ x: "-50%" }}
            initial={reduceMotion ? { left: target } : { left: "50%", opacity: 0 }}
            whileInView={{ left: target, opacity: 1 }}
            viewport={{ once: true, amount: 0.9 }}
            transition={{ delay: 0.2 + index * 0.08, type: "spring", stiffness: 80, damping: 15 }}
          >
            <span className="font-display text-[9px] leading-none text-paper/70">{m.dress}</span>
            <span className="mt-0.5 h-2.5 w-[2px] bg-paper" />
          </motion.div>
        </div>
        <p className="mt-2 sr-only">ドレス値 {m.dress}（10 が最もドレス寄り）</p>

        {/* コピー */}
        <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-gray-3 md:text-base">
          {m.copy}
        </p>
      </div>
    </motion.li>
  );
}

export function TextureIndex() {
  return (
    <div className="mt-20">
      <p className="mb-6 font-display text-[10px] tracking-[0.4em] text-paper/50">
        TEXTURE INDEX — 素材の座標
      </p>
      <ul className="border-b border-paper/15">
        {MATERIALS.map((m, i) => (
          <GaugeRow key={m.label} m={m} index={i} />
        ))}
      </ul>
    </div>
  );
}
