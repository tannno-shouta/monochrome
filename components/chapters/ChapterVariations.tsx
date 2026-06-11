import { ChapterMarker } from "@/components/scroll/ChapterMarker";
import { PinnedDiagonal } from "@/components/scroll/PinnedDiagonal";

/**
 * VARIATIONS — 斜めスクロールの新パート（横ピン留めの斜め版・奥行きなし）。
 * モノトーン作例カードを右上がりに傾いたリボンで斜めに流す（右上に流れる）。
 */
const cards = [
  { label: "ALL BLACK", ja: "黒で統一し、白を一点だけ。素材違いで“喪服”を回避。" },
  { label: "GRAY GRADATION", ja: "濃淡グレーの重ねでIラインを強調。" },
  { label: "WHITE × BLACK", ja: "王道2トーン。差は色でなく素材でつける。" },
  { label: "CHARCOAL SET", ja: "セットアップで社会性8を担保。自我は足元に。" },
  { label: "MONO DENIM", ja: "色落ちデニムで抜けを一点。崩しすぎない。" },
  { label: "TONAL KNIT", ja: "同系ニットの陰影で、静かな立体感。" },
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
          同じ無彩色でも、配分と質感で表情は変わる。系統を一つに絞り、自我は2割まで。
          そして全身で一〜二ヶ所だけ“抜く”——三首を見せ、袖をまくる。締めた中の
          一点の隙が、色気になる。
        </p>
      </div>

      <PinnedDiagonal className="mt-16" tilt={-8}>
        {cards.map((c) => (
          <article key={c.label} className="flex shrink-0 flex-col gap-4">
            {/* 高さを vh で固定し、画像＋テキストが画面内に収まるようにする */}
            {/* TODO: /images/var-*.jpg を配置 */}
            <div className="aspect-[4/5] h-[42vh] bg-gray-3 md:h-[48vh]" />
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
