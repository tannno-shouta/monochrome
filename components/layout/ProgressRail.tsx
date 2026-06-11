"use client";

import { useEffect, useState } from "react";
import { chapters } from "@/lib/chapters";

/**
 * 右端の章インジケータ（現在地ハイライト + ジャンプ）。
 * a11y: nav 要素 / aria-current / 可視フォーカス / reduced-motion 尊重。
 */
export function ProgressRail() {
  const [active, setActive] = useState(chapters[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    for (const c of chapters) {
      const el = document.getElementById(c.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="章ナビゲーション"
      className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-4 md:flex"
    >
      {chapters.map((c) => {
        const isActive = c.id === active;
        return (
          <a
            key={c.id}
            href={`#${c.id}`}
            aria-current={isActive ? "true" : undefined}
            aria-label={`${c.titleEn}（${c.titleJa}）へ移動`}
            className="group flex items-center justify-end gap-3 outline-none"
          >
            <span
              className={`font-display text-[10px] tracking-[0.2em] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${
                isActive ? "text-ink opacity-100" : "text-gray-2"
              }`}
            >
              {c.no}
            </span>
            <span
              className={`h-px transition-all ${
                isActive
                  ? "w-8 bg-ink"
                  : "w-4 bg-gray-2 group-hover:w-6 group-focus-visible:w-6"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
