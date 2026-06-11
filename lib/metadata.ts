import type { Metadata, Viewport } from "next";

const SITE_URL = "https://monochrome.example.com"; // TODO: 本番ドメイン確定時に差し替え
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
  authors: [{ name: SITE_NAME }],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ja_JP",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  author: { "@type": "Organization", name: SITE_NAME },
  publisher: { "@type": "Organization", name: SITE_NAME },
  inLanguage: "ja-JP",
  mainEntityOfPage: SITE_URL,
};
