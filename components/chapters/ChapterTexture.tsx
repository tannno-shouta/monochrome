import { ChapterMarker } from "@/components/scroll/ChapterMarker";
import { TextureIndex } from "@/components/chapters/TextureIndex";

/**
 * CHAPTER 04 — 質感でコントラスト（素材の寸法線図鑑）
 * 6素材をドレス値順に並べたスペックシート。各行のミニ寸法線（Ch02 と同じ
 * 図面言語・同じ向き）に針が滑り、素材ごとのドレス/カジュアル座標を教える。
 */
export function ChapterTexture() {
  return (
    <section id="texture" className="relative overflow-hidden bg-ink py-32 md:py-48">
      {/* 背景の特大ゴーストナンバー */}
      <span className="pointer-events-none absolute -right-6 top-10 select-none font-display text-[40vw] font-light leading-none text-paper/[0.05] md:right-0 md:text-[24vw]">
        04
      </span>

      <div className="relative mx-auto max-w-6xl px-6">
        <ChapterMarker
          no="04"
          titleEn="Contrast by Texture"
          titleJa="質感でコントラスト"
          inverted
        />
        <p className="mt-8 max-w-xl font-body text-base leading-loose text-gray-3 md:text-lg">
          色だけでは、7:3 は完成しない。素材にも、ドレスとカジュアルの座標がある。革とウールは締め、コットンとスウェットは緩める——同じ黒でも、生地が比率を動かす。まず艶の方向を揃え、ズラすのは一点だけ。
        </p>

        <TextureIndex />
      </div>
    </section>
  );
}
