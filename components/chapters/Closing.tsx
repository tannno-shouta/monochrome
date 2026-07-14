import { RevealText } from "@/components/scroll/RevealText";

/**
 * CLOSING — まとめ（テキスト主体ミニマル出現）
 * 静で締める。
 */
// 章の順番どおりの7箇条（01 三つの美 → 02 7:3 → 03 トーン → 04 素材 → シルエット → 05 抜け感 → 06 8:2）
const rules = [
  "色を引く。余白が、余裕と色気になる。",
  "比率はドレス7：カジュアル3。足りない分は、ドレスを足す。",
  "黒・チャコール・グレー・白——トーンは“役割”で選ぶ。",
  "同じ黒でも、素材が比率を動かす。艶は揃え、一点だけズラす。",
  "ラインは I・A・Y、どれか一つに寄せる。",
  "抜くのは、髪・首元・腕。清潔感とキレイめの土台の上で。",
  "社会性8：自我2。——2割だけ、自分。",
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
