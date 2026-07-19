import { RevealText } from "@/components/scroll/RevealText";

/**
 * CLOSING — まとめ（テキスト主体ミニマル出現）
 * 静で締める。
 */
// 章の順番どおりの7箇条（❖ シルエット → 01 三つの美 → 02 7:3 → 03 配役 → 04 素材 → 05 抜け感 → 06 8:2）
const rules = [
  { no: "❖", text: "ラインは I・A・Y、どれか一つに寄せる。" },
  { no: "01", text: "色を引く。余白が、余裕と色気になる。" },
  { no: "02", text: "比率はドレス7：カジュアル3。足りない分は、ドレスを足す。" },
  { no: "03", text: "黒・チャコール・グレー・白——トーンは“配役”で選ぶ。" },
  { no: "04", text: "同じ黒でも、素材が比率を動かす。艶は揃え、一点だけズラす。" },
  { no: "05", text: "抜くのは、髪・首元・腕。清潔感とキレイめの土台の上で。" },
  { no: "06", text: "社会性8：自我2。——2割だけ、自分。" },
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
            <RevealText key={rule.no} as="li" delay={i * 0.08}>
              <span className="flex items-baseline justify-center gap-4">
                <span className="w-8 shrink-0 text-right font-display text-xs tracking-[0.25em] text-gray-2">
                  {rule.no}
                </span>
                <span className="font-heading text-lg text-gray-3 md:text-2xl">
                  {rule.text}
                </span>
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
