import type { Metadata } from "next";
import { ScrollTestClient } from "./ScrollTestClient";

export const metadata: Metadata = {
  title: "Scroll Container Test",
  robots: { index: false, follow: false },
};

export default function ScrollTestPage() {
  return <ScrollTestClient />;
}
