// 章メタの単一情報源（ProgressRail・ChapterMarker・page.tsx が参照）

export type ScrollMotion =
  | "depth-scrub" // 奥行き + スクラブ動画
  | "vertical-parallax" // 縦・奥行きパララックス
  | "pinned-horizontal" // 横スクロール・ピン留め
  | "diagonal-reveal" // 斜めスライドリビール
  | "vertical-sticky" // 縦グリッド + スティッキー
  | "annotated" // 注釈ダイアグラム（三首）
  | "pinned-diagonal" // 斜めピン留めスクロール + 奥行き
  | "portal-depth" // 枠→動画フルスクリーンの奥行き portal（章間インタールード）
  | "minimal-reveal"; // テキスト主体ミニマル出現

export interface Chapter {
  id: string; // アンカー用 id
  no: string; // 表示用ナンバー（Hero/Closing は記号）
  titleEn: string;
  titleJa: string;
  motion: ScrollMotion;
}

export const chapters: Chapter[] = [
  {
    id: "opening",
    no: "00",
    titleEn: "MONOCHROME",
    titleJa: "モノトーンはロジックだ",
    motion: "depth-scrub",
  },
  {
    id: "why",
    no: "01",
    titleEn: "The Three Beauties",
    titleJa: "無彩色の三つの美",
    motion: "vertical-parallax",
  },
  {
    id: "ratio",
    no: "02",
    titleEn: "Seven to Three",
    titleJa: "7:3、ファッションの黄金比",
    motion: "vertical-parallax",
  },
  {
    id: "tone",
    no: "03",
    titleEn: "Designing Tone",
    titleJa: "トーンの設計",
    motion: "pinned-horizontal",
  },
  {
    id: "interlude",
    no: "✦",
    titleEn: "Step Inside",
    titleJa: "枠の中へ",
    motion: "portal-depth",
  },
  {
    id: "texture",
    no: "04",
    titleEn: "Contrast by Texture",
    titleJa: "質感でコントラスト",
    motion: "diagonal-reveal",
  },
  {
    id: "variations",
    no: "◇",
    titleEn: "Variations",
    titleJa: "斜めに流す",
    motion: "pinned-diagonal",
  },
  {
    id: "iroke",
    no: "05",
    titleEn: "The Art of Negative Space",
    titleJa: "抜け感という色気",
    motion: "annotated",
  },
  {
    id: "lookbook",
    no: "06",
    titleEn: "Lookbook",
    titleJa: "ルックブック",
    motion: "vertical-sticky",
  },
  {
    id: "closing",
    no: "—",
    titleEn: "Closing",
    titleJa: "明日からこう組む",
    motion: "minimal-reveal",
  },
];
