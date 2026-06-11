import { ProgressRail } from "@/components/layout/ProgressRail";
import { Footer } from "@/components/layout/Footer";
import { ChapterHero } from "@/components/chapters/ChapterHero";
import { ChapterWhy } from "@/components/chapters/ChapterWhy";
import { ChapterTone } from "@/components/chapters/ChapterTone";
import { PortalInterlude } from "@/components/scroll/PortalInterlude";
import { ChapterTexture } from "@/components/chapters/ChapterTexture";
import { ChapterVariations } from "@/components/chapters/ChapterVariations";
import { ChapterSilhouette } from "@/components/chapters/ChapterSilhouette";
import { ChapterLookbook } from "@/components/chapters/ChapterLookbook";
import { Closing } from "@/components/chapters/Closing";

export default function Home() {
  return (
    <>
      <ProgressRail />
      <main>
        <ChapterHero />
        <ChapterWhy />
        <ChapterTone />
        <PortalInterlude
          id="interlude"
          src="/videos/interlude.mp4"
          poster="/images/interlude-poster.jpg"
          label="モノトーンの世界に没入するインタールード映像"
          eyebrow="Step Inside"
          caption="色を消した世界に、残るのは構造だけ。"
        />
        <ChapterTexture />
        <ChapterVariations />
        <ChapterSilhouette />
        <ChapterLookbook />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
