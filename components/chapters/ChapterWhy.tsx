import { BlurText } from "@/components/animations/BlurText";
import { TiltedCard } from "@/components/animations/TiltedCard";

/**
 * CHAPTER 01 — 無彩色の三つの美（黒地反転）
 * 直前のシルエットギャラリーが黒柱で終わるため、黒地で地続きに繋ぐ。
 * 「シルエット / 普遍性 / 素材」の3つの美しさを 01/02/03 のリストで提示し、
 * 大人の色気=引き算の帰結という論理を組み立てる。
 */

const THREE_BEAUTIES = [
  {
    title: "シルエットの美しさ",
    body: "色数が少なく情報過多にならないため、シルエットそのままの情報が印象になる。",
  },
  {
    title: "普遍性の美しさ",
    body: "流行の色に左右されないため、いつの時代でも古びないタイムレスなかっこよさを演出する。",
  },
  {
    title: "素材の美しさ",
    body: "素材そのものの美しさや、デザインの良さを際立たせる。",
  },
] as const;

export function ChapterWhy() {
  return (
    <section
      id="why"
      className="relative overflow-hidden bg-[#0a0a0a] py-32 text-paper md:py-48"
    >
      {/* 背景の特大ゴーストナンバー（静止・微光） */}
      <span className="pointer-events-none absolute -right-6 top-10 select-none font-display text-[40vw] font-light leading-none text-paper/[0.04] md:right-0 md:text-[24vw]">
        01
      </span>

      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center">
        {/* 画像（TiltedCard・hover で 3D 傾き） */}
        <div className="order-2 md:order-1">
          <figure className="relative">
            <div className="aspect-[3/4] w-full overflow-hidden bg-[#161616]">
              {/* TODO: 専用画像 /images/why.jpg を用意したら差し替え */}
              <TiltedCard imageSrc="/images/gallery-portal.jpg" altText="無彩色の空間" />
            </div>
            <span className="pointer-events-none absolute inset-3 border border-paper/20" />
            <figcaption className="absolute -bottom-3 left-4 bg-[#0a0a0a] px-3 font-display text-[10px] tracking-[0.35em] text-gray-2">
              PLATE 01 — 無彩色
            </figcaption>
          </figure>
        </div>

        {/* テキスト（BlurText・その場で出現） */}
        <div className="order-1 flex flex-col gap-7 md:order-2">
          <p className="font-display text-xs tracking-[0.4em] text-gray-2">CHAPTER 01</p>
          <BlurText
            text="The Three Beauties"
            animateBy="words"
            delay={120}
            className="font-display text-4xl font-light leading-none text-paper md:text-6xl"
          />
          <p className="font-heading text-sm tracking-[0.2em] text-gray-3">
            無彩色の三つの美
          </p>

          <BlurText
            text="なぜ、色を捨てた無彩色を大人は纏うべきなのか？"
            className="font-heading text-xl leading-relaxed text-paper md:text-3xl md:leading-relaxed"
          />

          <span className="h-px w-16 bg-gray-1" />

          <BlurText
            text="無彩色（白・黒・グレー）は、"
            className="font-body text-base leading-loose text-gray-3 md:text-lg"
          />

          <ol className="flex flex-col gap-6 md:gap-7">
            {THREE_BEAUTIES.map((b, i) => (
              <li
                key={b.title}
                className="grid grid-cols-[2.5rem_1fr] gap-4 md:grid-cols-[3rem_1fr] md:gap-6"
              >
                <span className="pt-1 font-display text-xs tracking-[0.35em] text-gray-2 md:text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-2">
                  <p className="font-heading text-base text-paper md:text-xl">{b.title}</p>
                  <p className="font-body text-sm leading-loose text-gray-3 md:text-base">
                    {b.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <BlurText
            text="という3つの本質的な特徴から、取り入れるだけで大人っぽく洗練されたセンスへ——大人の色気に繋がる。"
            className="font-body text-base leading-loose text-gray-3 md:text-lg"
          />
        </div>
      </div>
    </section>
  );
}
