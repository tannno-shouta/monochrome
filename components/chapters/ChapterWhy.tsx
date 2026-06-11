import { ChapterMarker } from "@/components/scroll/ChapterMarker";
import { ParallaxDepth } from "@/components/scroll/ParallaxDepth";
import { RevealText } from "@/components/scroll/RevealText";

/**
 * CHAPTER 01 — なぜ“効く”のか（縦・奥行きパララックス）
 * 背景に特大ゴーストナンバー、画像は奥へ、テキストは手前へ。
 */
export function ChapterWhy() {
  return (
    <section id="why" className="relative overflow-hidden bg-bg py-32 md:py-48">
      {/* 背景の特大ゴーストナンバー（エディトリアル） */}
      <ParallaxDepth
        speed={120}
        className="pointer-events-none absolute -right-6 top-10 select-none md:right-0"
      >
        <span className="font-display text-[40vw] font-light leading-none text-gray-3/60 md:text-[24vw]">
          01
        </span>
      </ParallaxDepth>

      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center">
        {/* 奥のレイヤ（画像 + フレーム + プレートラベル） */}
        <ParallaxDepth speed={60} zoom className="order-2 md:order-1">
          <figure className="relative">
            <div className="aspect-[3/4] w-full bg-gray-3">
              {/* TODO: /images/why.jpg を配置 */}
            </div>
            {/* 細フレーム */}
            <span className="pointer-events-none absolute inset-3 border border-paper/50" />
            {/* プレートラベル */}
            <figcaption className="absolute -bottom-3 left-4 bg-bg px-3 font-display text-[10px] tracking-[0.35em] text-gray-1">
              PLATE 01 — 無彩色
            </figcaption>
          </figure>
        </ParallaxDepth>

        {/* 手前のテキスト */}
        <div className="order-1 flex flex-col gap-8 md:order-2">
          <ChapterMarker no="01" titleEn="Why It Works" titleJa="なぜ“効く”のか" />

          {/* リード文（大きく強調） */}
          <RevealText
            as="p"
            delay={0.1}
            className="font-heading text-xl leading-relaxed text-ink md:text-3xl md:leading-relaxed"
          >
            無彩色は、色という“情報”を引き算する装いだ。
          </RevealText>

          <span className="h-px w-16 bg-gray-2" />

          <RevealText
            as="p"
            delay={0.2}
            className="font-body text-base leading-loose text-gray-1 md:text-lg"
          >
            色相が消えると、視線は逃げ場を失って素材・シルエット・サイズ感に集まる。
            日本人は骨格も顔立ちも欧米人より子供っぽく映りやすい——だからこそ、
            色で遊ぶより色を削るほうが、大人は一気に整う。
          </RevealText>
          <RevealText
            as="p"
            delay={0.3}
            className="font-body text-base leading-loose text-gray-1 md:text-lg"
          >
            黒・白・グレーのうち2色以上で全身を組むだけで、装いは“ドレス側”へ振れる。
            そして引き算した分だけ“余白”が生まれる。考えて削った人にだけ宿る余裕——
            それが、大人の色気の正体だ。
          </RevealText>
          <RevealText
            as="p"
            delay={0.4}
            className="font-body text-sm leading-loose text-gray-2"
          >
            ——ただし土台は、いつも清潔感。ヨレやシワがあれば、引き算はただの
            手抜きに見える。色を足すより、アイロンと靴磨きが先だ。
          </RevealText>
        </div>
      </div>
    </section>
  );
}
