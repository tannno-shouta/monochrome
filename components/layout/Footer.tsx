export function Footer() {
  return (
    <footer className="bg-ink px-6 py-16 text-center">
      <p className="font-display text-2xl tracking-[0.3em] text-paper">MONOCHROME</p>
      <p className="mt-4 font-body text-xs leading-relaxed text-gray-2">
        モノトーンコーデはセンスではなくロジック。
      </p>

      {/* 制作者クレジット（ポートフォリオ用） */}
      <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 border-t border-paper/15 pt-8">
        <p className="font-display text-[10px] tracking-[0.45em] text-gray-2">CREATED BY</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          <a
            href="https://www.instagram.com/fuk_yuuki69783/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs tracking-[0.15em] text-gray-3 underline-offset-4 hover:underline"
          >
            Instagram — @fuk_yuuki69783
          </a>
          <a
            href="mailto:pannya6978@gmail.com"
            className="font-body text-xs tracking-[0.15em] text-gray-3 underline-offset-4 hover:underline"
          >
            Mail — pannya6978@gmail.com
          </a>
        </div>
      </div>

      <p className="mt-8 font-body text-[10px] tracking-[0.2em] text-gray-1">
        © {new Date().getFullYear()} MONOCHROME
      </p>
    </footer>
  );
}
