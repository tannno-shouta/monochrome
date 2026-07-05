import { ChapterMarker } from "@/components/scroll/ChapterMarker";
import { DiagonalReveal } from "@/components/scroll/DiagonalReveal";
import { BackgroundVideo } from "@/components/scroll/BackgroundVideo";

/**
 * CHAPTER 03 — 質感でコントラスト（斜めスライドリビール）
 * 背景に LIDNM 風アイテムラック映像（暗）。素材ラベルを斜めに差し込む。
 */
const swatches = [
  { label: "MATTE", ja: "ウール・コットン・スエード。艶を消して方向を揃える土台。薄手の起毛は“安物の黒”のサイン。", from: "bottom-left" as const },
  { label: "GLOSS", ja: "レザー・サテン・エナメル。マット基調に光沢を一点。これだけで「考えて選んだ人」に化ける。", from: "bottom-right" as const },
  { label: "WEAVE", ja: "リブ・ワッフル・畝。無地モノトーンに織り柄で表情を足す、被り回避の定石。", from: "bottom-left" as const },
  { label: "SHEER", ja: "リネン・楊柳・シアー。空気を通す抜け素材で、色気と季節感を入れる。", from: "bottom-right" as const },
];

export function ChapterTexture() {
  return (
    <section id="texture" className="relative overflow-hidden bg-ink py-32 md:py-48">
      {/* 背景: LIDNM 風アイテムラック映像 */}
      <BackgroundVideo
        src="/videos/texture.mp4"
        poster="/images/texture-poster.jpg"
        overlay={0.62}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <ChapterMarker
          no="04"
          titleEn="Contrast by Texture"
          titleJa="質感でコントラスト"
          inverted
        />
        <p className="mt-8 max-w-xl font-body text-base leading-loose text-gray-3 md:text-lg">
          モノトーンは誰でもできるぶん“被る”。洗練とのっぺりを分けるのは、色では
          なく素材・質感・ディテールだ。まず艶の方向を揃え、そこに一点だけ
          ズラしを効かせる——それだけで「考えて選んだ人」に化ける。
        </p>

        <div className="mt-20 grid gap-8 md:grid-cols-2">
          {swatches.map((s) => (
            <DiagonalReveal key={s.label} from={s.from} distance={100}>
              <div className="border border-paper/25 bg-ink/30 p-6 backdrop-blur-sm">
                <span className="font-display text-xl tracking-[0.25em] text-paper">
                  {s.label}
                </span>
                <p className="mt-3 max-w-sm font-body text-sm leading-relaxed text-gray-3">
                  {s.ja}
                </p>
              </div>
            </DiagonalReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
