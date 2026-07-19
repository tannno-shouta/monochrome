import type { Metadata, Viewport } from "next";

export const SITE_URL = "https://monochrome-one-xi.vercel.app"; // 独自ドメイン取得時はここを差し替え
const SITE_NAME = "MONOCHROME";
const TITLE = "MONOCHROME ｜ モノトーンコーデはセンスではなくロジック";
const DESCRIPTION =
  "黒・白・グレー。無彩色だけで“洗練”をつくる方法を、トーン設計・質感・シルエットのロジックで解説する読み物メディア。スクロールで体験するモノトーンコーデの教科書。";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "モノトーンコーデ",
    "モノトーン メンズ",
    "無彩色 コーデ",
    "黒 白 グレー 着こなし",
    "シルエット I A Y",
    "ファッション ロジック",
    "大人 モノトーン",
  ],
  authors: [{ name: "Shota Tanno" }],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ja_JP",
    type: "article",
    images: [
      { url: "/images/gallery-poster.jpg", width: 1280, height: 720, alt: TITLE },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/gallery-poster.jpg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

// Next.js 16: viewport / themeColor は metadata から分離して export する
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
  colorScheme: "light",
};

// @graph 形式で WebSite / Article / Person を @id 相互リンク（実態にないノードは入れない）
const WEBSITE_ID = `${SITE_URL}/#website`;
const PERSON_ID = `${SITE_URL}/#creator`;

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "ja",
      author: { "@id": PERSON_ID },
    },
    {
      "@type": "Article",
      "@id": `${SITE_URL}/#article`,
      headline: TITLE,
      description: DESCRIPTION,
      image: `${SITE_URL}/images/gallery-poster.jpg`,
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
      inLanguage: "ja-JP",
      mainEntityOfPage: { "@id": WEBSITE_ID },
      about: [
        "モノトーンコーデ",
        "メンズファッション理論",
        "ドレス7:カジュアル3の黄金比",
        "トーンの配役",
        "素材の座標",
        "抜け感",
        "社会性8:自我2",
      ],
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Shota Tanno",
      url: SITE_URL,
      jobTitle: "Direction / Copy / Design / Development / AI Imagery",
      sameAs: [
        "https://www.instagram.com/fuk_yuuki69783/",
        "https://clad-studio.vercel.app/",
      ],
      email: "mailto:pannya6978@gmail.com",
    },
  ],
};
