import { BlurText } from "@/components/animations/BlurText";
import { TiltedCard } from "@/components/animations/TiltedCard";

/**
 * CHAPTER 02 — 7:3、ファッションの黄金比（チャコール地・左テキスト右画像）
 * Chapter 01「The Three Beauties」の型を反転させたミラーレイアウト。
 * 「ドレス/カジュアルの定義 → なぜ 7:3 → 30代の"顔面カジュアル値"補正 → ドレス加算」の
 * 5パート構成で、大人が"痛く"見える構造を分解する。
 */

const DEFINITION = [
  {
    label: "DRESS",
    items:
      "スラックス / Yシャツ / 革靴 / ウール・レザー / シルバーアクセ / 黒・チャコール・濃紺",
  },
  {
    label: "CASUAL",
    items:
      "デニム / パーカー / スニーカー / コットン・スウェット / 白・明色・差し色",
  },
] as const;

export function ChapterRatio() {
  return (
    <section
      id="ratio"
      className="relative overflow-hidden bg-[#525252] py-32 text-paper md:py-48"
    >
      {/* 背景の特大ゴーストナンバー（Chapter 01 の反転で左寄せ・タイトル背面に重ねる） */}
      <span className="pointer-events-none absolute -left-6 top-10 select-none font-display text-[40vw] font-light leading-none text-paper/[0.07] md:left-0 md:text-[24vw]">
        02
      </span>

      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center">
        {/* テキスト（左・Chapter 01 のミラー） */}
        <div className="order-1 flex flex-col gap-7">
          <p className="font-display text-xs tracking-[0.4em] text-paper/70">CHAPTER 02</p>
          <BlurText
            text="Seven to Three"
            animateBy="words"
            delay={120}
            className="font-display text-4xl font-light leading-none text-paper md:text-6xl"
          />
          <p className="font-heading text-sm tracking-[0.2em] text-paper/75">
            7:3、ファッションの黄金比
          </p>

          <BlurText
            text={"なぜ、7:3 が“整って見える”境界線なのか？"}
            className="font-heading text-xl leading-relaxed text-paper md:text-3xl md:leading-relaxed"
          />

          <span className="h-px w-16 bg-paper/40" />

          {/* ① 定義パート */}
          <BlurText
            text="すべての服は、「ドレス」か「カジュアル」に分けられる。"
            className="font-body text-base leading-loose text-paper/90 md:text-lg"
          />

          <div className="flex flex-col gap-4 md:gap-5">
            {DEFINITION.map((d) => (
              <div
                key={d.label}
                className="grid grid-cols-[4.5rem_1fr] gap-4 md:grid-cols-[5.5rem_1fr] md:gap-6"
              >
                <span className="pt-1 font-display text-xs tracking-[0.35em] text-paper md:text-sm">
                  {d.label}
                </span>
                <p className="font-body text-sm leading-relaxed text-paper/80 md:text-base">
                  {d.items}
                </p>
              </div>
            ))}
          </div>

          <p className="font-body text-sm leading-loose text-paper/70 md:text-base">
            デザイン、シルエット、素材・色——3 つの軸でどちらに寄っているかを判定し、全身の比率を計算する。
          </p>

          {/* ② 黄金比パート */}
          <p className="font-body text-base leading-loose text-paper/85 md:text-lg">
            日本人は骨格も顔立ちも子供っぽく映りやすい。カジュアル 10 では幼稚に、5:5 は無難に、ドレス 10 は堅すぎに転ぶ。ドレス 7・カジュアル 3 だけが、&ldquo;洗練されたファッション + 抜け感&rdquo;のゾーンに入る。
          </p>

          {/* ③ 補正パート（"顔面カジュアル値"の独自視点） */}
          <p className="font-body text-base leading-loose text-paper/85 md:text-lg">
            そして 30 代からは、肌のハリと目の輝きが少しずつ落ちる。これは&ldquo;顔面カジュアル値&rdquo;の上昇——何もしなくても、装いのカジュアル比が勝手に上がる。20 代のコーデをそのまま持ち越すと&ldquo;痛く&rdquo;見えるのは、服のせいではなく、この加算のせいだ。
          </p>

          {/* ④ 実践パート */}
          <p className="font-body text-base leading-loose text-paper/85 md:text-lg">
            だから、服の方でドレスを足す。シルバーアクセを一つ差す。革靴に替える。素材をウールに寄せる。黒・チャコール・濃紺の面積を増やす。スラックスで分かりやすくドレス寄りに。すべて&ldquo;ドレス側の加算&rdquo;として計算できる。足りない分だけ、意識して積み上げればいい。
          </p>

          {/* 締め */}
          <BlurText
            text={
              "ドレス 7・カジュアル 3 の設計を意識して着るだけで、街ですれ違いざまに“あの人、おしゃれだな”と一瞬思われるゾーンへ、確実に踏み込める。"
            }
            className="font-body text-base leading-loose text-paper md:text-lg"
          />
        </div>

        {/* 画像（右・Chapter 01 のミラー） */}
        <div className="order-2">
          <figure className="relative">
            <div className="aspect-[3/4] w-full overflow-hidden bg-[#3a3a3a]">
              {/* TODO: 専用画像 /images/ratio.jpg を用意したら差し替え */}
              <TiltedCard imageSrc="/images/gallery-portal.jpg" altText="7:3 の黄金比を体現する装い" />
            </div>
            <span className="pointer-events-none absolute inset-3 border border-paper/25" />
            <figcaption className="absolute -bottom-3 left-4 bg-[#525252] px-3 font-display text-[10px] tracking-[0.35em] text-paper/70">
              PLATE 02 — 黄金比
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
