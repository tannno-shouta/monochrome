export function Footer() {
  return (
    <footer className="bg-ink px-6 py-16 text-center">
      <p className="font-display text-2xl tracking-[0.3em] text-paper">MONOCHROME</p>
      <p className="mt-4 font-body text-xs leading-relaxed text-gray-2">
        モノトーンコーデはセンスではなくロジック。
      </p>
      <p className="mt-8 font-body text-[10px] tracking-[0.2em] text-gray-1">
        © {new Date().getFullYear()} MONOCHROME
      </p>
    </footer>
  );
}
