import { RevealText } from "./RevealText";

interface ChapterMarkerProps {
  no: string;
  titleEn: string;
  titleJa: string;
  /** 反転セクション（黒地）で使う場合は true */
  inverted?: boolean;
}

/**
 * 各章の定型ヘッダ（章番号 + EN/JP タイトル）。
 * 黒⇔白の反転で章間にリズムを作る。
 */
export function ChapterMarker({
  no,
  titleEn,
  titleJa,
  inverted = false,
}: ChapterMarkerProps) {
  const sub = inverted ? "text-gray-2" : "text-gray-2";
  const main = inverted ? "text-paper" : "text-ink";
  const ja = inverted ? "text-gray-3" : "text-gray-1";

  return (
    <header className="flex flex-col items-start gap-3">
      <RevealText as="span" className={`font-display text-sm tracking-[0.4em] ${sub}`}>
        CHAPTER {no}
      </RevealText>
      <RevealText
        as="h2"
        delay={0.05}
        className={`font-display text-4xl font-light tracking-wide md:text-6xl ${main}`}
      >
        {titleEn}
      </RevealText>
      <RevealText as="p" delay={0.1} className={`font-heading text-base md:text-lg ${ja}`}>
        {titleJa}
      </RevealText>
    </header>
  );
}
