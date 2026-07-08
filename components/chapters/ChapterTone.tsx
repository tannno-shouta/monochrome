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
    ja: "王道のドレス色。無難ゆえに素材による立体感で抜け感を演出。思考停止の“全身黒”は量産型の入口へ。",
  },
  {
    bg: "#525252",
    fg: "#f5f4f2",
    label: "CHARCOAL",
    ja: "上品で洗練された印象へ。黒ほど重たくならず、キレイながら程よい抜け感と大人の落ち着きを演出。同系色でまとめすぎると抜け感の喪失へ。",
  },
  {
    bg: "#a3a3a3",
    fg: "#0a0a0a",
    label: "GRAY",
    ja: "少し抜け感を出したい時に最適。万能カラーでありながら、清潔感や上品さを演出。面積を多く持たせてしまうと不鮮明へ。",
  },
  {
    bg: "#f5f4f2",
    fg: "#0a0a0a",
    label: "WHITE",
    ja: "着回し万能カラーでありながら、最大の清潔感と余白という抜け感を演出。膨張色のため、まとめすぎるとシルエットの崩壊へ。",
  },
];

export function ChapterTone() {
  return (
    <section id="tone" className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 pt-32 md:pt-48">
        <ChapterMarker no="03" titleEn="Designing Tone" titleJa="トーンの設計" />
        <p className="mt-8 max-w-xl font-body text-base leading-loose text-gray-1 md:text-lg">
          モノトーンは「黒・チャコール・グレー・白の役割」を理解し、ドレス 7・カジュアル 3
          を意識した生地との相関を考えることが洗練されたファッションの正解だ。
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
