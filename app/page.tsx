import { ProgressRail } from "@/components/layout/ProgressRail";
import { Footer } from "@/components/layout/Footer";
import { IntroPortal3D } from "@/components/intro/IntroPortal3D";
import { SilhouetteGallery } from "@/components/chapters/SilhouetteGallery";
import { ChapterWhy } from "@/components/chapters/ChapterWhy";
import { ChapterRatio } from "@/components/chapters/ChapterRatio";
import { ChapterTone } from "@/components/chapters/ChapterTone";
import { PortalInterlude } from "@/components/scroll/PortalInterlude";
import { ChapterTexture } from "@/components/chapters/ChapterTexture";
import { ChapterVariations } from "@/components/chapters/ChapterVariations";
import { ChapterIroke } from "@/components/chapters/ChapterIroke";
import { ChapterEightTwo } from "@/components/chapters/ChapterEightTwo";
import { ChapterLookbook } from "@/components/chapters/ChapterLookbook";
import { Closing } from "@/components/chapters/Closing";

export default function Home() {
  return (
    <>
      <ProgressRail />
      <main>
        <IntroPortal3D />
        <SilhouetteGallery />
        <ChapterWhy />
        <ChapterRatio />
        <ChapterTone />
        <PortalInterlude
          id="interlude"
          src="/videos/interlude.mp4"
          srcMobile="/videos/interlude-mobile.mp4"
          poster="/images/interlude-poster.jpg"
          label="モノトーンの世界に没入するインタールード映像"
          eyebrow="Step Inside"
          caption="色を消した世界に、残るのは構造だけ。"
        />
        <ChapterTexture />
        <ChapterIroke />
        <ChapterEightTwo />
        <ChapterVariations />
        <ChapterLookbook />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
