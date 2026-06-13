import { ChapterMarker } from "@/components/scroll/ChapterMarker";
import { ParallaxDepth } from "@/components/scroll/ParallaxDepth";
import { RevealText } from "@/components/scroll/RevealText";

/**
 * CHAPTER 05 — ルックブック（縦グリッド + スティッキー）
 * 左に解説を sticky 固定、右に作例を縦に流す。特大インデックス＋EN/JP＋パララックス。
 */
const looks = [
  {
    no: "01",
    en: "All Black, One White",
    ja: "黒で艶を揃え、白スニーカーで一点だけ抜く。素材は3種類で差を。",
  },
  {
    no: "02",
    en: "Tonal Charcoal",
    ja: "近い黒〜グレーで濃淡を揃える。リブやワッフルで表情を足す。",
  },
  {
    no: "03",
    en: "The Classic Two-Tone",
    ja: "白シャツ × 黒スラックス。差は素材と仕立て、襟を少し抜いて色気を。",
  },
  {
    no: "04",
    en: "Gray, In the Lead",
    ja: "グレーコートを主役に。Iラインで縦を強調し、足首を見せて抜く。",
  },
];

export function ChapterLookbook() {
  return (
    <section id="lookbook" className="bg-bg py-32 md:py-48">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1fr_1.5fr]">
        {/* 左: sticky 解説 */}
        <div className="flex flex-col gap-8 md:sticky md:top-28 md:h-fit">
          <ChapterMarker no="06" titleEn="Lookbook" titleJa="ルックブック" />
          <p className="font-body text-base leading-loose text-gray-1 md:text-lg">
            理論を実例に。系統を一つに統一すれば、モノトーンは“制服”ではなく
            “様式”になる。
          </p>
          <div className="flex items-center gap-4">
            <span className="h-px w-12 bg-gray-2" />
            <span className="font-display text-[11px] tracking-[0.35em] text-gray-2">
              4 LOOKS
            </span>
          </div>
        </div>

        {/* 右: 縦に流れる作例 */}
        <div className="flex flex-col gap-20 md:gap-28">
          {looks.map((look, i) => (
            <RevealText key={look.no}>
              <figure
                className={`flex flex-col gap-5 ${
                  i % 2 === 1 ? "md:translate-x-10" : ""
                }`}
              >
                <div className="overflow-hidden">
                  <ParallaxDepth speed={40}>
                    {/* TODO: /images/look-XX.jpg を配置 */}
                    <div className="aspect-[4/5] w-full bg-gray-3" />
                  </ParallaxDepth>
                </div>
                <figcaption className="flex items-start gap-5 border-t border-gray-3 pt-4">
                  <span className="font-display text-3xl font-light leading-none text-ink md:text-4xl">
                    {look.no}
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-sm tracking-[0.25em] text-ink">
                      {look.en}
                    </span>
                    <p className="font-body text-sm leading-relaxed text-gray-1">
                      {look.ja}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
}
