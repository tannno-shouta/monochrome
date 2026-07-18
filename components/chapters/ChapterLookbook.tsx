import { ChapterMarker } from "@/components/scroll/ChapterMarker";
import { ParallaxDepth } from "@/components/scroll/ParallaxDepth";
import { RevealText } from "@/components/scroll/RevealText";

/**
 * CHAPTER 07 — ルックブック（縦グリッド + スティッキー）
 * 左に解説を sticky 固定、右に作例を縦に流す。特大インデックス＋EN/JP＋パララックス。
 */
const looks = [
  {
    no: "01",
    src: "/images/look-01.jpg",
    en: "All Black, One White",
    ja: "マットな黒ハーフジップで艶を揃え、裾から白を一線だけ。黒カーゴで重心を落とす。",
  },
  {
    no: "02",
    src: "/images/look-02.jpg",
    en: "Tonal Charcoal",
    ja: "チャコールのロングコートにウォッシュドシャツの濃淡を重ねる。素材の階調が、単色を豊かにする。",
  },
  {
    no: "03",
    src: "/images/look-03.jpg",
    en: "Dress, Bent Urban",
    ja: "第一ボタンまで閉じた黒シャツに、曲線パネルのナイロンパンツ。ドレスな要素を都会的にズラし、サングラスは2割のスパイス。",
  },
  {
    no: "04",
    src: "/images/look-04.jpg",
    en: "Greige, at Ease",
    ja: "グレージュの開襟シャツをゆるく羽織り、ワイドスラックスで品を保つ。首元と袖の抜けが、余裕をつくる。",
  },
];

export function ChapterLookbook() {
  return (
    <section id="lookbook" className="bg-bg py-32 md:py-48">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1fr_1.5fr]">
        {/* 左: sticky 解説 */}
        <div className="flex flex-col gap-8 md:sticky md:top-28 md:h-fit">
          <ChapterMarker no="07" titleEn="Lookbook" titleJa="ルックブック" />
          <p className="font-body text-base leading-loose text-gray-1 md:text-lg">
            理論を実例に。7:3の黄金比、モノトーン、素材の座標、抜け感、8:2のちょうどよさ——ここまでの章の知識を、一着に落とす。“洗練された洒落た大人へ”
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
                    <div className="aspect-[3/4] w-full overflow-hidden bg-gray-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={look.src}
                        alt={`${look.en} の作例コーデ`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
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
