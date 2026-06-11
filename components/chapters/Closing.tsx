import { RevealText } from "@/components/scroll/RevealText";

/**
 * CLOSING — まとめ（テキスト主体ミニマル出現）
 * 静で締める。
 */
const rules = [
  "色を引く。余白が、余裕と色気になる。",
  "明度は暗7：明3。重心は下に。",
  "同じ色は“素材”で差をつける。艶は揃え、一点だけズラす。",
  "ラインは I・A・Y、どれか一つに寄せる。",
  "抜くのは三首。全身で一〜二ヶ所まで。",
  "土台はいつも清潔感。色気はその上にだけ乗る。",
];

export function Closing() {
  return (
    <section id="closing" className="bg-ink py-40 md:py-56">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-16 px-6 text-center">
        <RevealText
          as="h2"
          className="font-display text-4xl font-light tracking-wide text-paper md:text-6xl"
        >
          明日からこう組む
        </RevealText>

        <ul className="flex flex-col gap-6">
          {rules.map((rule, i) => (
            <RevealText key={rule} as="li" delay={i * 0.08}>
              <span className="font-heading text-lg text-gray-3 md:text-2xl">
                {rule}
              </span>
            </RevealText>
          ))}
        </ul>

        <RevealText
          as="p"
          delay={0.3}
          className="font-body text-sm leading-loose text-gray-2"
        >
          モノトーンは、センスではなくロジック。<br />
          再現できるなら、それはもう“あなたの様式”だ。
        </RevealText>
      </div>
    </section>
  );
}
