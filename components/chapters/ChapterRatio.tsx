import { BlurText } from "@/components/animations/BlurText";
import { RatioScrubPlate } from "@/components/chapters/RatioScrubPlate";

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
            text={"なぜ、ドレス 7 : カジュアル 3 が“整って見える”黄金比なのか？"}
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
            日本人は骨格も顔立ちも子供っぽく映りやすい。カジュアル 10 では幼稚に、5:5 は無難に、ドレス 10 はスーツのように、私服としては堅すぎる。ドレス 7・カジュアル 3 だけが、&ldquo;ドレスで洗練されたファッション + カジュアルで抜け感&rdquo;のゾーンに入る。
          </p>

          {/* ②-b 顔面ドレス値パート（イケメン/外国人がなぜ様になるか） */}
          <p className="font-body text-base leading-loose text-paper/85 md:text-lg">
            &ldquo;イケメンや外国人は何を着ても様になるな&rdquo;——そう感じたことはありませんか？これは、彼らの顔立ちや骨格そのものが&ldquo;ドレス側&rdquo;に加算されているから。素の状態で比率が 7 に寄っているため、何を着ても自然に洗練された印象になる。
          </p>

          {/* ③ 補正パート（"顔面カジュアル値"の独自視点。②-b と対称構造） */}
          <p className="font-body text-base leading-loose text-paper/85 md:text-lg">
            そして 30 代からは、肌のハリと目の輝きが少しずつ落ちる。これは&ldquo;顔面カジュアル値&rdquo;の上昇——何もしなくても、装いのカジュアル比が勝手に上がる。20 代のコーデをそのまま持ち越すと&ldquo;痛く&rdquo;見えるのは、服のせいではなく、&ldquo;顔面カジュアル値&rdquo;のせいなんです。
          </p>

          {/* ④ 実践パート */}
          <p className="font-body text-base leading-loose text-paper/85 md:text-lg">
            だから、服の方でドレスを足す。シルバーアクセを一つ差す。革靴に替える。素材をウールに寄せる。黒・チャコール・濃紺の面積を増やす。スラックスで分かりやすくドレス寄りに。すべて&ldquo;ドレス側の加算&rdquo;として計算できる。足りない分だけ、意識して積み上げればいい。
          </p>

        </div>

        {/* 画像（右・Chapter 01 のミラー）— RATIO SCRUB 寸法線プレート。PC ではやや下げて配置 */}
        <div className="order-2 flex flex-col gap-8 md:translate-y-32">
          <RatioScrubPlate />
          {/* 締め（プレートで 7:3 を体感した直後に読ませる） */}
          <BlurText
            text={
              "ドレス 7・カジュアル 3 の設計を意識して着るだけで、街ですれ違いざまに“あの人、おしゃれだな”と一瞬思われるゾーンへ、確実に踏み込める。"
            }
            className="font-body text-base leading-loose text-paper md:text-lg"
          />
        </div>
      </div>
    </section>
  );
}
