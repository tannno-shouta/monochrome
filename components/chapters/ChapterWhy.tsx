import { BlurText } from "@/components/animations/BlurText";
import { TiltedCard } from "@/components/animations/TiltedCard";

/**
 * CHAPTER 01 — なぜ“効く”のか（無彩色パート／黒地反転）
 * 直前のシルエットギャラリーが黒柱で終わるため、黒地で地続きに繋ぐ。
 * テキストは BlurText（その場で blur→clear 出現）、画像は TiltedCard（hover 3D 傾き）。
 */
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
            text="Why It Works"
            animateBy="words"
            delay={120}
            className="font-display text-4xl font-light leading-none text-paper md:text-6xl"
          />
          <p className="font-heading text-sm tracking-[0.2em] text-gray-3">
            なぜ“効く”のか
          </p>

          <BlurText
            text="無彩色は、色という“情報”を引き算する装いだ。"
            className="font-heading text-xl leading-relaxed text-paper md:text-3xl md:leading-relaxed"
          />

          <span className="h-px w-16 bg-gray-1" />

          <BlurText
            text="色相が消えると、視線は逃げ場を失って素材・シルエット・サイズ感に集まる。日本人は骨格も顔立ちも欧米人より子供っぽく映りやすい——だからこそ、色で遊ぶより色を削るほうが、大人は一気に整う。"
            className="font-body text-base leading-loose text-gray-3 md:text-lg"
          />
          <BlurText
            text="黒・白・グレーのうち2色以上で全身を組むだけで、装いは“ドレス側”へ振れる。そして引き算した分だけ“余白”が生まれる。考えて削った人にだけ宿る余裕——それが、大人の色気の正体だ。"
            className="font-body text-base leading-loose text-gray-3 md:text-lg"
          />
          <BlurText
            text="——ただし土台は、いつも清潔感。ヨレやシワがあれば、引き算はただの手抜きに見える。色を足すより、アイロンと靴磨きが先だ。"
            className="font-body text-sm leading-loose text-gray-2"
          />
        </div>
      </div>
    </section>
  );
}
