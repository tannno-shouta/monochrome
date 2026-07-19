import { ChapterMarker } from "@/components/scroll/ChapterMarker";
import { PinnedDiagonal } from "@/components/scroll/PinnedDiagonal";

/**
 * VARIATIONS — 斜めスクロールの新パート（横ピン留めの斜め版・奥行きなし）。
 * モノトーン作例カードを右上がりに傾いたリボンで斜めに流す（右上に流れる）。
 */
const cards = [
  {
    src: "/images/var-1.jpg",
    label: "ALL BLACK",
    ja: "黒で統一し、レザー・ニット・ウールの素材の質感差で奥行きを出し“抜け感”を演出。メガネは2割のスパイス。",
  },
  {
    src: "/images/var-2.jpg",
    label: "GRAY GRADATION",
    ja: "濃淡グレーの重ねでIラインを強調。“少しだけ抜きたい”日の正解。",
  },
  {
    src: "/images/var-3.jpg",
    label: "WHITE × DENIM",
    ja: "WHITEを使った王道コーデ。シンプルなアクセサリーで差別化を。",
  },
  {
    src: "/images/var-4.jpg",
    label: "CHARCOAL LAYERED",
    ja: "ウォッシュドスエードのトレンチにフーディを重ねる。チャコールの質感グラデーション、チェーンは2割の自我。",
  },
  {
    src: "/images/var-5.jpg",
    label: "LEATHER × DENIM",
    ja: "デザインが勝てば、革はカジュアルへ振れる。裾の白一線で抜けを一点。",
  },
  {
    src: "/images/var-6.jpg",
    label: "RELAXY KNIT",
    ja: "グレーニットの都会的な印象を、黒のパンツで締める。大人の余裕を感じさせるモノトーンコーデ。",
  },
];

export function ChapterVariations() {
  return (
    <section id="variations" className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 pt-32 md:pt-48">
        <ChapterMarker
          no="◇"
          titleEn="Variations"
          titleJa="斜めに流す、組み合わせの幅"
        />
        <p className="mt-8 max-w-xl font-body text-base leading-loose text-gray-1 md:text-lg">
          同じ無彩色でも、配分と質感で表情は変わる。ドレス7:カジュアル3を軸に、トーンの役割と素材の座標を組み替える——仕上げは髪・首元・腕の一工夫。洗練された装いの中の一点の隙が、色気になる。
        </p>
      </div>

      <PinnedDiagonal className="mt-16" tilt={-8}>
        {cards.map((c) => (
          <article
            key={c.label}
            className="flex w-[calc(42vh*3/4)] shrink-0 flex-col gap-4 md:w-[calc(48vh*3/4)]"
          >
            {/* 記事幅＝画像幅（3:4）に固定。キャプション長で枠が伸びて画像が切れるのを防ぐ */}
            <div className="h-[42vh] w-full overflow-hidden bg-gray-3 md:h-[48vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.src}
                alt={`${c.label} の作例コーデ`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-display text-lg tracking-[0.25em] text-ink">
                {c.label}
              </span>
              <p className="font-body text-sm leading-relaxed text-gray-1">
                {c.ja}
              </p>
            </div>
          </article>
        ))}
      </PinnedDiagonal>

      <div className="h-32 md:h-48" />
    </section>
  );
}
