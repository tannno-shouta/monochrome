import { ChapterMarker } from "@/components/scroll/ChapterMarker";
import { DiagonalReveal } from "@/components/scroll/DiagonalReveal";

/**
 * CHAPTER 03 — 質感でコントラスト（斜めスライドリビール）
 * 素材スウォッチが斜めに差し込まれる。
 */
const swatches = [
  { label: "MATTE", ja: "ウール・コットン・スエード。艶を消して方向を揃える土台。薄手の起毛は“安物の黒”のサイン。", from: "bottom-left" as const },
  { label: "GLOSS", ja: "レザー・サテン・エナメル。マット基調に光沢を一点。これだけで「考えて選んだ人」に化ける。", from: "bottom-right" as const },
  { label: "WEAVE", ja: "リブ・ワッフル・畝。無地モノトーンに織り柄で表情を足す、被り回避の定石。", from: "bottom-left" as const },
  { label: "SHEER", ja: "リネン・楊柳・シアー。空気を通す抜け素材で、色気と季節感を入れる。", from: "bottom-right" as const },
];

export function ChapterTexture() {
  return (
    <section id="texture" className="overflow-hidden bg-bg py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-6">
        <ChapterMarker
          no="03"
          titleEn="Contrast by Texture"
          titleJa="質感でコントラスト"
        />
        <p className="mt-8 max-w-xl font-body text-base leading-loose text-gray-1 md:text-lg">
          モノトーンは誰でもできるぶん“被る”。洗練とのっぺりを分けるのは、色では
          なく素材・質感・ディテールだ。まず艶の方向を揃え、そこに一点だけ
          ズラしを効かせる——それだけで「考えて選んだ人」に化ける。
        </p>

        <div className="mt-20 grid gap-10 md:grid-cols-2">
          {swatches.map((s) => (
            <DiagonalReveal key={s.label} from={s.from} distance={100}>
              <div className="flex items-end gap-6">
                {/* TODO: /images/texture-*.jpg を配置 */}
                <div className="aspect-square w-32 shrink-0 bg-gray-3 md:w-40" />
                <div className="flex flex-col gap-2 pb-2">
                  <span className="font-display text-xl tracking-[0.25em] text-ink">
                    {s.label}
                  </span>
                  <p className="max-w-xs font-body text-sm leading-relaxed text-gray-1">
                    {s.ja}
                  </p>
                </div>
              </div>
            </DiagonalReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
