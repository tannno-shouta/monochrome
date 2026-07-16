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
    ja: "それだけで様になる、王道のドレス色。だからこそウールやレザーの質感差で立体を作り、抜け感を仕込む。思考停止の“全身黒”は、量産型の入口へ。",
  },
  {
    bg: "#525252",
    fg: "#f5f4f2",
    label: "CHARCOAL",
    ja: "黒の品格はそのままに、一段だけ軽く。きちんと見えるのに重くならない、大人の落ち着きをつくる色。同系色で塗り固めると、抜け感の喪失へ。",
  },
  {
    bg: "#a3a3a3",
    fg: "#0a0a0a",
    label: "GRAY",
    ja: "“少しだけ抜きたい”とき、まず頼る色。黒とも白とも馴染む万能さで、清潔感と上品さを静かに足す。ただし面積を広げすぎると、輪郭を失い不鮮明へ。",
  },
  {
    bg: "#f5f4f2",
    fg: "#0a0a0a",
    label: "WHITE",
    ja: "どのコーデにも馴染む着回しの要。首元や足元の一枚が、最大の清潔感と“余白”という抜け感をつくる。ただし膨張色——面積を許すほど、シルエットの崩壊へ。",
  },
];

export function ChapterTone() {
  return (
    <section id="tone" className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 pt-32 md:pt-48">
        <ChapterMarker no="03" titleEn="The Four Tones" titleJa="4つのトーン、4つの配役" />
        <p className="mt-8 max-w-xl font-body text-base leading-loose text-gray-1 md:text-lg">
          黒は主役、チャコールは品、グレーは抜け、白は余白——同じ無彩色でも、配役はまるで違う。生地の質感まで含めてキャスティングできたとき、7:3 は“洗練”として完成する。
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
