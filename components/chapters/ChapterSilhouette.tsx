"use client";

import { ScrubVideo } from "@/components/scroll/ScrubVideo";
import { ChapterMarker } from "@/components/scroll/ChapterMarker";
import { RevealText } from "@/components/scroll/RevealText";

/**
 * CHAPTER 04 — シルエットの方程式（スクラブ動画・奥行き）
 * スクロールで I → A → Y のシルエットが切り替わる TapNow 動画。
 * /videos/silhouette.mp4・/images/silhouette-poster.jpg を配置すると有効化。
 */
export function ChapterSilhouette() {
  return (
    <section id="silhouette" className="bg-ink py-32 md:py-48">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-8">
          <ChapterMarker
            no="04"
            titleEn="The Silhouette Equation"
            titleJa="シルエットの方程式"
            inverted
          />
          <RevealText
            as="p"
            delay={0.1}
            className="font-body text-base leading-loose text-gray-3 md:text-lg"
          >
            モノトーンは色の情報がないぶん、輪郭（ライン）がそのまま印象になる。
            だらしなく見えるか、意図して見えるか——分けるのはサイズ感だ。
            Iライン＝細く縦に通して上品に。Aライン＝上を絞り下を広げて軽快に。
            Yライン＝肩にボリューム、足元を細くして力強く。どれか一つに寄せるだけで、
            同じ服が“狙って着ている”顔になる。仕上げに首元か足首を少し抜けば、
            ラインに色気が乗る。
          </RevealText>
        </div>

        {/* スクラブ動画（縦長） */}
        <div className="aspect-[3/4] w-full overflow-hidden bg-gray-1">
          <ScrubVideo
            src="/videos/silhouette.mp4"
            poster="/images/silhouette-poster.jpg"
            label="I・A・Y シルエットが切り替わる映像"
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
