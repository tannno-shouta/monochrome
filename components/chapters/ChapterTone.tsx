import { ChapterMarker } from "@/components/scroll/ChapterMarker";
import { PinnedHorizontal } from "@/components/scroll/PinnedHorizontal";

/**
 * CHAPTER 02 — トーンの設計（横スクロール・ピン留め）
 * 黒 → チャコール → グレー → 白 のトーンが横に流れる。
 */
const panels = [
  {
    bg: "#0a0a0a",
    fg: "#f5f4f2",
    label: "BLACK",
    ja: "全体を締める軸。漆黒・墨黒、近い黒で揃えると上質に。思考停止の“全身黒”は制服化の入口。",
  },
  {
    bg: "#525252",
    fg: "#f5f4f2",
    label: "CHARCOAL",
    ja: "黒と白の緩衝材。明度に階段をつくり、のっぺりを防ぐ。",
  },
  {
    bg: "#a3a3a3",
    fg: "#0a0a0a",
    label: "GRAY",
    ja: "最大の“抜け”。面積を持たせるほど、重さが都会的な軽さに変わる。",
  },
  {
    bg: "#f5f4f2",
    fg: "#0a0a0a",
    label: "WHITE",
    ja: "余白。首元か足元に一点差すだけで、顔色も装いも明るく起きる。",
  },
];

export function ChapterTone() {
  return (
    <section id="tone" className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 pt-32 md:pt-48">
        <ChapterMarker no="03" titleEn="Designing Tone" titleJa="トーンの設計" />
        <p className="mt-8 max-w-xl font-body text-base leading-loose text-gray-1 md:text-lg">
          モノトーンは「黒・白・グレーの配分」がすべて。ドレス7：カジュアル3を
          “明度”に翻訳すると、暗い面を約7割・明るい面を約3割。重心を下（暗）に
          置くと上半身が軽く見え、バランスが決まる。
        </p>
      </div>

      <PinnedHorizontal className="mt-16">
        {panels.map((p) => (
          <div
            key={p.label}
            style={{ backgroundColor: p.bg, color: p.fg }}
            className="flex h-[54vh] w-[80vw] shrink-0 flex-col justify-between p-8 md:h-[70vh] md:w-[55vw] md:p-16"
          >
            <span className="font-display text-2xl tracking-[0.3em]">
              {p.label}
            </span>
            <p className="max-w-sm font-heading text-lg md:text-2xl">{p.ja}</p>
          </div>
        ))}
      </PinnedHorizontal>
    </section>
  );
}
