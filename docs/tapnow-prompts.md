# MONOCHROME — TapNow 素材プロンプト集（v2 / ロケ・モデル反映）

サイトに必要な動画/画像を TapNow で生成するためのプロンプト集。
英語プロンプト＝生成AIにそのまま投入 / 日本語＝意図メモ。

## ディレクション（v2）

- **世界観**: 無彩色ミニマル × 海辺／直島・地中美術館の静けさ。げんじ(@genji)的なクリーンで穏やかな空気感、フィルムライクで彩度を抑えた加工。details.co.jp × collabcapitolium.fr のシネマティックな間。
- **テーマ**: 洗練モノトーン × 抜け感 × 色気
- **被写体（モデル）**: 加藤コウキ(@koki_kato)タイプの日本人男性モデル。**確定記述（全プロンプトの人物描写はこの `MODEL` を使う）**:
  ```
  MODEL = a 33-year-old Japanese male model, 181cm tall with a slim model physique,
  sharp defined jawline, olive skin, dark brown-black medium-length centre-parted hair
  swept back with textured strands over the forehead and tapered short sides (wet-look,
  sometimes loosely waved), light neat moustache and soul-patch stubble, calm confident
  mature expression. Accessories (ALL SILVER): a silver hoop ring earring, a thin silver
  chain necklace, a thin silver bracelet, and a silver ring on his left index finger
  ```
  - 任意のシグネチャ: `Guepard GP-05 sunglasses, dark grey acetate frame, whisky-green tinted lenses`（街/海辺の引き〜寄りで。顔をしっかり見せたいカットでは外す）
  - ⚠️ TapNow は**実在人物の顔を厳密に再現しない**（参考画像は構図参考のみ）。本人の肖像が必須なら本人を撮影/許諾。AI生成は“加藤コウキ系のモデル像”になる。
- **着用ブランド/服**: ssstein / LIDNM / RETOUCH のモノトーンのみ。
  - 具体: ドレープの効いたワイドスラックス、オーバーサイズの仕立て（ボックスシャツ／ミニマルなロングコート）、ハイゲージニット。色は黒・チャコール・グレー・白のみ。`relaxed Japanese mode tailoring, drapey wide-leg trousers, oversized minimal coat / boxy shirt, fine-gauge knit, all monochrome`
- **ロケーション**:
  - 海辺（**曇天・グレーの海**でモノトーンに寄せる。晴天の青空は避ける）
  - 直島・地中美術館（安藤忠雄の**打ちっぱなしコンクリート**、光井戸／スリットから差す自然光、幾何学的な回廊）
- **グレード/加工**（確定）: `desaturated low-saturation near-monochrome, fine film grain, soft natural light, calm, editorial`。**げんじ寄りのフィルム調・低彩度・粒状感**。
- **明るさ方針**（確定）: **暗めグレードで黒基調キープ**。海辺は必ず曇天グレー＋暗めに寄せ、現状の hero/portal/silhouette の黒背景に馴染ませる（サイト実装は変更しない）。地中美術館は元々モノトーンで好相性。各プロンプトに `dark moody monochrome grade, deep shadows, low-key` を効かせる。

## 必要素材と配置先

| 種別 | ファイル | 比率 | 用途 | ロケ |
|---|---|---|---|---|
| 動画 | `public/videos/hero.mp4` | 16:9 | Hero 全画面・スクラブ | 海辺を歩く |
| 動画 | `public/videos/interlude.mp4` | 16:9 | Portal・autoplayループ | 地中美術館の回廊を奥へ |
| 動画 | `public/videos/silhouette.mp4` | 9:16 | Ch04 I/A/Y・スクラブ | 海辺の逆光シルエット |
| 画像 | `*-poster.jpg` ×3 | 各動画比率 | ポスター | 各動画の先頭フレーム |
| 画像 | `public/images/why.jpg` | 3:4 | Ch01 | 地中美術館 or 海辺 |
| 画像 | `public/images/texture-{matte,gloss,weave,sheer}.jpg` | 1:1 | Ch03 素材マクロ | スタジオ |
| 画像 | `public/images/var-1〜6.jpg` | 4:5 | Variations 全身 | 海辺/コンクリ |
| 画像 | `public/images/look-01〜04.jpg` | 4:5 | Lookbook 作例 | 海辺/コンクリ |
| 画像 | `public/images/iroke.jpg` | 3:5 | Ch05 三首 | 海辺の自然光 |

---

## スクラブ動画の鉄則（Hero / Silhouette）

- **一方向の連続運動のみ**（slow tracking / push-in）。往復・急加速・カット・明滅は避ける
- **短尺 5〜8 秒** / slow〜normal（hyper speed 不可）/ ライティング一定
- 生成後に**スクラブ用再エンコード**:

```bash
ffmpeg -i raw.mp4 -an -c:v libx264 -crf 20 -g 5 -keyint_min 5 \
  -pix_fmt yuv420p -movflags +faststart public/videos/hero.mp4
ffmpeg -i raw.mp4 -an -vf scale=-2:720 -c:v libx264 -crf 24 -g 5 \
  -pix_fmt yuv420p -movflags +faststart public/videos/hero-mobile.mp4
ffmpeg -i public/videos/hero.mp4 -ss 0 -vframes 1 public/images/hero-poster.jpg
```

Interlude は autoplay ループ＝始端と終端が繋がる push-in が理想。

---

## ⓪ モデルアンカー作成【最初にやる・採用】

全カットで人物を揃えるため、まず**基準となる1枚（モデルアンカー）**を固める。以降のシーンは全部これを `@ModelAnchor` として参照して生成する。

> 加藤コウキ本人の実写を**参照画像**として TapNow に入れて生成 → 一番本人に近い1枚を選んで確定 → それを唯一の基準にする（以後オリジナル写真ではなくアンカーを使い回すと一貫性が出る）。※AI生成のため本人と微差は出る（一貫性を優先する判断）。
>
> **参照は複数入れるのが正解**：①顔の接写（顔・髪・髭・シルバーアクセの同一性ロック用）＋②全身〜3/4写真（体型・着丈・ドレープ・足元の比率用）。この2枚を参照に**全身アンカー(3:4)**を生成する。顔接写だけだと体型がブレやすい。

### ⓪-1 アンカー立ち絵（全身・Recraft V4 / MJ V7・本人写真を参照入力）
参照2枚を入れる：①顔の接写（同一性）＋②全身写真（体型・比率）。
```
Full-length photorealistic editorial fashion photograph of a 33-year-old Japanese male model,
181cm slim model physique, standing relaxed, head-to-toe fully in frame.
[Reference image 1 = the face close-up for identity; Reference image 2 = the full-body photo for build/proportions.]
Face: sharp defined jawline, olive skin, calm confident mature expression, light neat moustache and soul-patch stubble.
Hair: dark brown-black medium-length centre-parted, swept back with textured strands over the forehead,
tapered short sides, wet-look styling.
Outfit: all-monochrome mode tailoring — a black drape tailored jacket worn open over a black tee,
black wide-leg trousers, minimal black leather shoes.
Accessories (ALL SILVER): a silver hoop earring, a thin silver chain necklace, a silver bracelet,
and silver rings on the fingers.
No sunglasses (eyes visible to lock identity).
Color palette: pure monochrome (black, charcoal, white).
Background: clean seamless light-grey studio.
Shot on 50mm lens, full-length framing, soft diffused studio light, shallow depth of field, fine 35mm film grain.
natural realistic skin texture with pores, candid editorial photography, real fabric detail,
not 3D render, not illustration, not anime, no plastic skin.
Aspect ratio: 3:4.
```
→ 数枚生成し、**最も本人に近い1枚を選んで「ModelAnchor」として保存**（キャンバスにノード化）。

### ⓪-2 キャラシート化（任意・再利用性UP）
```
@ModelAnchor
A clean minimalist character reference sheet of the same male model, pure white background.
Include: a 3-direction full-body turnaround (front, side, back), 4 head shots (neutral, slight smile,
looking down, three-quarter), and detail callouts (hair, the all-silver accessories, the black outfit fabric, shoes).
Maintain the exact same face, hairstyle, outfit and silver accessories as @ModelAnchor.
Photorealistic, consistent soft lighting, English labels. Aspect ratio 16:9, 2K.
```

### ⓪-3 各シーンの開始フレーム生成（アンカー＋ロケ）
動画化の前に、アンカーをロケへ“配置”した静止画を作る。例（海辺 Hero）:
```
@ModelAnchor
Place this exact model (same face, hair, outfit, all-silver accessories) on a quiet overcast grey beach,
three-quarter walking pose, flat sea horizon behind, lots of sky.
Dark moody monochrome grade, soft overcast light, fine film grain, deep shadows. Aspect ratio 16:9.
```
コンクリ(Interlude)・海辺逆光(Silhouette) も同様に `@ModelAnchor + ロケ記述` で開始フレームを作る。
→ できた開始フレームを下の **image-to-video** で動かす。

---

## 画像→動画（image-to-video）運用【アンカー由来の開始フレームを動かす】

モデルは**加藤コウキ本人の実写**を image-to-video の元にする（顔の一貫性が最も確実。要・本人の使用許諾）。

### 原則
- i2v は元画像の **服・顔・背景を保持**し、そこに **カメラと被写体の“動き”** を足す。
  → **元写真のロケ＝動画のロケ**。文章でロケを変えても背景は元写真に引っ張られる。
- だからプロンプトは **MOTION 中心**（外見・服・背景は画像から来る）。
- 強い背景変更（スタジオ→海辺等）は i2v では不安定 → ロケを変えたいなら**そのロケで本人を撮る**のが確実。

### 手持ち写真の使い分け
| 写真 | 使える動画 |
|---|---|
| グレーのコンクリ壁にもたれる黒コーデ | **Interlude（地中美術館 push-in）にドンピシャ** |
| 白ドア/スタジオ・街(順光) | Hero の“都会版”代替 / 静止画 var・look の素材 |
| 海辺・直島 | （未所持）Hero/Silhouette の本命ロケ。撮影 or 別途用意が要る |

### i2v プロンプトの書き方（MOTION中心テンプレ）
```
[Animate the attached photo of the man.]
Subject action: [被写体の小さな動き。例: he slowly turns his head, hair and fabric shift, he takes one step]
Camera: [カメラの動き。例: slow continuous dolly-in push toward him]
Speed: [slow motion / normal], single one-way motion (scrub-friendly)
Grade: keep the dark moody monochrome look, deep shadows, fine film grain, low saturation
Duration: 6–8s
Aspect ratio: 16:9 (Silhouetteは9:16)
Keep the man's face, hairstyle, outfit and all-silver accessories exactly as in the photo.
```

### パイロット用 i2v プロンプト（コンクリ壁写真 → Interlude）
```
Animate the attached photo: a man in a black monochrome outfit leaning against a bare grey concrete wall.
Subject action: he slowly pushes off the wall and the scene opens into depth.
Camera: slow continuous dolly-in / push-in toward him, then gliding past into the dark concrete depth,
single forward motion (seamless, loop-friendly).
Lighting: keep the cool grey concrete and low-key shadows, add subtle volumetric light.
Grade: dark moody monochrome, deep shadows, fine film grain, low saturation.
Duration: 8 seconds, normal-slow speed.
Aspect ratio: 16:9.
Keep his face, centre-parted hair, black outfit and all-silver accessories exactly as in the photo.
```

### スクラブ動画（Hero/Silhouette）を i2v でやる時の注意
- 動きは **一方向のみ**（往復・激しい歩行は scrub で破綻）。push-in か slow pan に限定
- 生成後は必ず上記 `ffmpeg -g 5` でスクラブ用に再エンコード

---

# 動画プロンプト（text-to-video 版・参考／AIアーキタイプ生成時に使用）

各プロンプト冒頭の被写体記述は、上の「暫定アーキタイプ」を確定後に置換すること。

## ① Hero — 海辺を歩く（16:9 / 6–8s / scrub）

共通: 曇天のグレーの海辺。中央はタイトルが乗るため余白多め。モノトーン mode の服。

### Var.1（安全）— 横移動トラッキング
**推奨モデル**: Seedance 2.0 / Kling 3.0 Omni（節約）
**意図(JP)**: 静かな横移動。タイトルの邪魔をしない穏やかな歩き。
```
MODEL (a Japanese male model, late 20s–early 30s, slim lean tall build, sharp jawline, olive skin,
dark brown-black medium-length centre-parted hair swept back with strands over the forehead and
tapered short sides, light moustache and soul-patch stubble, gold hoop earring, thin silver chain),
wearing a monochrome relaxed-mode outfit (drapey black wide-leg trousers, oversized charcoal coat,
fine-gauge knit), walking slowly along a quiet overcast grey beach, sea and flat horizon behind him.
Camera: slow lateral tracking shot keeping him in frame, wide shot, eye level, lots of sky negative space.
Lighting: soft overcast diffused daylight, no harsh sun, muted grey tones.
Mood: calm, clean, editorial stillness (in the spirit of @genji's quiet aesthetic).
Duration: 7 seconds, slow motion, single smooth lateral move.
Style: photorealistic, dark moody desaturated near-monochrome film grade, fine 35mm grain, shallow depth of field, deep shadows.
Aspect ratio: 16:9.
```

### Var.2（中庸）— 奥行きトラッキング push-in
**推奨モデル**: Seedance 2.0
**意図(JP)**: 海へ向かって歩く後ろ姿に寄る。collabcapitolium 寄りの静かなドラマ。
```
MODEL (a 33-year-old Japanese male model, 181cm slim model physique, dark brown-black centre-parted
hair swept back, light moustache and soul-patch stubble, all-silver accessories: a silver hoop
earring, a thin silver chain necklace, a silver bracelet and a silver ring on the left index finger),
in monochrome mode tailoring (wide-leg black trousers, long minimal grey coat moving in the wind),
walks away from the camera toward a grey overcast sea, slow even pace, coat and hair drifting in the breeze.
Camera: slow dolly-in following from behind, wide to medium-wide, low horizon line, centered.
Lighting: soft silver overcast light, gentle backlight haze off the sea, dark moody monochrome.
Mood: cinematic, contemplative, refined.
Duration: 7 seconds, slow motion, single forward push (scrub-friendly).
Style: photorealistic, dark high-contrast black and white, anamorphic, fine film grain, deep shadows, sea mist particles.
Aspect ratio: 16:9.
```

### Var.3（攻め）— 引きの一枚絵 + 微速push
**推奨モデル**: Seedance 2.0
**意図(JP)**: 人物を小さく、グレーの海と空の余白で“静けさ”を最大化。
```
Extreme wide shot of a lone figure in all-black monochrome mode clothing standing small against a
vast flat overcast grey sea and sky, faint reflection on wet sand, minimal composition.
Camera: very slow dolly-in from extreme wide to wide, eye level, rule-of-thirds figure.
Lighting: flat silver overcast light, monochrome, soft gradient sky.
Mood: surreal minimalism, meditative, sculptural emptiness.
Duration: 8 seconds, hyper slow motion, one continuous push (scrub-friendly).
Style: hyperrealistic, black and white, fine grain, subtle vignette, atmospheric haze.
Aspect ratio: 16:9.
```

---

## ② Interlude — コンクリ回廊→服のラックへ抜ける（16:9 / 6–10s / autoplayループ・push-in）

**確定方針（ストーリー接続）**: Interlude の奥を**無数のモノトーンの服のラック**にして、次章 **Texture（LIDNM風ラック背景）へ地続きで繋ぐ**。Tone→「枠をくぐる」→服の世界→Texture。両方ダーク基調で白フラッシュ等の断絶は使わない。
- 採用パイプライン: `@ModelAnchor` →【開始フレーム生成：コンクリ回廊が奥で服のラックへ続く構図】→ image-to-video（push-in）。
- 開始フレーム例:
  ```
  @ModelAnchor
  The same model walking forward through a dark minimalist concrete space that opens into long rows of
  hanging monochrome garments (black coats, charcoal knits, white shirts) receding into the depth,
  faint cold light at the far end, strong one-point perspective. Full body, centered, space ahead to push into.
  Dark moody monochrome, low-key, deep shadows, fine film grain. real photo, not 3D, not anime. 16:9.
  ```
- i2v 動き:
  ```
  Animate the attached image. The man walks slowly forward, deeper between the rows of hanging garments.
  Camera: continuous push-in following him into the corridor of clothes toward the far light, seamless loop.
  Dark moody monochrome, low-key, volumetric haze, fine film grain. 8s slow. 16:9.
  Keep his face, hair, black outfit and all-silver accessories exactly as in the image.
  ```

> 旧案（安藤コンクリ回廊のみ／パリコレ会場＋白フラッシュ）は不採用。理由: 白フラッシュはループで毎回光る＆次のTexture(暗)と断絶／パリコレは静寂の世界観とズレる。

### 旧・参考バリエーション（純コンクリ回廊）
共通: 安藤忠雄の打ちっぱなしコンクリ回廊／光のスリット。枠の中へ吸い込まれる強いドリー。

### Var.1（安全）— 回廊をまっすぐ前進
**推奨モデル**: Seedance 2.0 / Vidu Q2（節約）
**意図(JP)**: コンクリ回廊を歩いて奥へ。展開しても破綻しない無難案。
```
A Japanese male model in a monochrome mode outfit walks slowly straight down a narrow bare concrete
corridor inspired by Tadao Ando architecture, a blade of natural daylight falling from a ceiling slit ahead.
Camera: steady slow dolly-in following his approach into the corridor, eye level, centered one-point perspective.
Lighting: soft natural daylight from an overhead slit, cool grey concrete, low-key gradient into shadow.
Mood: calm, architectural, sacred stillness.
Duration: 8 seconds, normal-slow speed, loopable forward motion.
Style: photorealistic, desaturated monochrome, shallow depth of field, fine grain.
Aspect ratio: 16:9.
```

### Var.2（中庸）— 光井戸へ吸い込まれる
**推奨モデル**: Seedance 2.0
**意図(JP)**: portal の「枠の中へ入る」感に最適。奥の光へ push-in。
```
Continuous forward dolly gliding deep into a minimalist Tadao Ando concrete space toward a glowing
light-well at the vanishing point; MODEL (a 33-year-old Japanese male model, 181cm slim physique,
dark brown-black centre-parted hair swept back, light moustache stubble, in an oversized black
monochrome outfit) stands silhouetted in the distant light, getting closer as the camera approaches.
Camera: strong continuous push-in toward the light-well, slight wide-angle, converging perspective lines.
Lighting: dramatic natural light shaft from above into bare concrete, volumetric grey haze, chiaroscuro, low-key.
Mood: immersive, hypnotic, architectural depth.
Duration: 8 seconds, smooth constant push (seamless loop), normal speed.
Style: photorealistic, dark high-contrast black and white, anamorphic, deep shadows, dust motes in the light beam.
Aspect ratio: 16:9.
```

### Var.3（攻め）— 幾何コンクリの無限 push
**推奨モデル**: Seedance 2.0
**意図(JP)**: 安藤建築の幾何学を抽象化した surreal な奥行き。全画面展開のインパクト最大。
```
An endless forward flight through abstract geometric concrete chambers (Tadao Ando inspired) — slits of
daylight slicing across bare grey walls, accelerating gently toward a bright vanishing point.
Camera: smooth FPV dolly push-in, wide-angle, strong one-point perspective.
Lighting: hard daylight blades vs deep concrete shadow, volumetric beams, monochrome.
Mood: surreal, meditative, sculptural void.
Duration: 8 seconds, normal speed with subtle acceleration, seamless loop.
Style: hyperrealistic, black and white, anamorphic, floating dust, motion blur on edges.
Aspect ratio: 16:9.
```

---

## ③ Silhouette — 海辺の逆光シルエット I/A/Y（9:16 / 6–8s / scrub）

共通: 曇天/夕暮れの海を背に逆光でほぼシルエット。輪郭が I→A→Y に変化。

### Var.1（安全）— ポーズで輪郭変化
**推奨モデル**: Seedance 2.0
**意図(JP)**: 海辺の逆光で一人の男性がゆっくり姿勢を変え I→A→Y を見せる。
```
Backlit silhouette of a Japanese male model in a monochrome mode outfit standing on a grey overcast
beach, the bright sea-sky behind him. His outline slowly shifts: slim straight vertical (I-line),
then coat opening wide at the hem (A-line), then shoulders emphasized with a tapered base (Y-line).
Camera: locked-off full body shot, slight low angle, centered, headroom above.
Lighting: strong soft backlight from the overcast sky, near-pure silhouette, faint rim on the outline.
Mood: graphic, minimal, editorial diagram feel.
Duration: 8 seconds, slow continuous transition (scrub-friendly).
Style: photorealistic, high-contrast black and white, soft grain, atmospheric sea haze.
Aspect ratio: 9:16.
```

### Var.2（中庸）— 風になびく逆光
**推奨モデル**: Seedance 2.0
**意図(JP)**: コートが風になびき、ラインの変化がドラマチックに出る。
```
A man in a long monochrome coat on a windy overcast beach, seen as a near-silhouette against the bright
grey sea; the coat and wide trousers billow as his stance morphs from I-line to A-line to Y-line.
Camera: static full body, eye level, centered, low horizon.
Lighting: silver backlight, rim light catching coat edges, monochrome.
Mood: cinematic, poetic, restrained.
Duration: 7 seconds, slow motion morph (scrub-friendly).
Style: photorealistic, black and white, anamorphic, sea mist, fine grain.
Aspect ratio: 9:16.
```

### Var.3（攻め）— 三体ディゾルブ
**推奨モデル**: Seedance 2.0
**意図(JP)**: I/A/Y の3シルエットが海霧の中で滑らかに溶け替わる抽象寄り。
```
Three monochrome male silhouettes (slim I-line, flared A-line, shoulder-heavy Y-line) seamlessly
dissolving into one another on a misty grey beach, sea-fog transitions, bright overcast backlight.
Camera: static full body, eye level, centered.
Lighting: strong backlit fog, near-pure silhouettes, drifting sea mist.
Mood: surreal, sculptural, hypnotic.
Duration: 8 seconds, slow continuous morph (scrub-friendly).
Style: hyperrealistic, black and white, volumetric mist, fine particles, film grain.
Aspect ratio: 9:16.
```

---

## ④ Items — アイテム主役のラック映像（LIDNM風 / 16:9 / 6–8s）

**用途（確定）**: **Texture 章(03) の背景動画**。配置先 `public/videos/texture.mp4` ＋ ポスター `public/images/texture-poster.jpg`。
- 章はダーク背景化済み。動画の上に黒オーバーレイ(0.62)＋明色テキスト＋素材ラベル(MATTE/GLOSS/WEAVE/SHEER)を重ねる実装。
- ループ前提（autoplay/muted）。スクラブ不要なので往復OK・繋ぎ目が自然だと尚良し。
- 旧 `texture-{matte,gloss,weave,sheer}.jpg`（スウォッチ画像）は背景動画化により**任意**（使わなくてもラベルで成立）。

共通: 暗いミニマル空間に、モノトーンの服（黒のテーラードコート、チャコールニット、白シャツ、ワイドパンツ）がハンガーで並ぶ。被写体は**服そのもの**。LIDNM のような低照度・ダークモードの空気感。**text-to-video でOK**（人物の一貫性問題が無いぶん当たりやすく安価）。ロケ写真があれば i2v も可。

### Var.1（安全）— ラックを横移動
**推奨モデル**: Seedance 2.0 / Vidu Q2（節約）
**意図(JP)**: ラックに沿って静かに流す。服の生地が微かに揺れる。
```
A clothing rack of monochrome garments (black tailored coats, charcoal fine-gauge knits, white shirts,
black wide trousers) hanging in a dark minimalist concrete room. Fabric sways almost imperceptibly.
Camera: slow lateral tracking shot gliding along the rack, eye level, shallow depth of field.
Lighting: low-key single soft spotlight grazing the fabric, deep shadows, cool grey tones.
Mood: dark, refined, mode (LIDNM-like product film).
Duration: 7 seconds, slow motion, single one-way glide.
Style: photorealistic, dark moody monochrome, fine film grain, low saturation.
Aspect ratio: 16:9.
```

### Var.2（中庸）— 一着へ寄る
**推奨モデル**: Seedance 2.0
**意図(JP)**: 黒コート一着に dolly-in。素材の質感と陰影で魅せる。
```
Slow dolly-in toward a single black tailored wool coat on a hanger in a dark room, the fabric texture
and drape revealed as the camera approaches; faint dust drifting in a shaft of light.
Camera: slow continuous dolly-in, medium to close-up on fabric, slight low angle.
Lighting: single hard spotlight, chiaroscuro, deep black background, volumetric beam.
Mood: cinematic, sculptural, sensual minimalism.
Duration: 7 seconds, slow motion, single forward push.
Style: hyperrealistic, high-contrast black and white, anamorphic, film grain, dust particles.
Aspect ratio: 16:9.
```

### Var.3（攻め）— ラックを潜り抜ける
**推奨モデル**: Seedance 2.0
**意図(JP)**: 服の間を縫って push。アイテムが手前を流れる没入感。
```
A smooth forward push-in threading between rows of hanging monochrome garments, black coats and white
shirts parting and brushing past the lens in the foreground, leading into dark depth.
Camera: FPV-style slow dolly push between the racks, wide-angle, parallax of garments passing close.
Lighting: low-key with rim light edges on the fabric, volumetric haze, deep shadows.
Mood: surreal, immersive, mode editorial.
Duration: 8 seconds, normal speed, single forward motion.
Style: hyperrealistic, black and white, anamorphic, motion blur on foreground fabric, fine grain.
Aspect ratio: 16:9.
```

---

# 画像プロンプト

推奨モデル: **Recraft V4** / **MJ V7**（フォトリアル・編集的）。共通: `desaturated near-monochrome editorial, soft film grain, calm`。被写体は確定後のモデル記述に置換。

## why.jpg（3:4 / Ch01 — 無彩色の概念）
```
Editorial black-and-white photograph: a Japanese male model in an all-charcoal monochrome mode outfit,
seen three-quarter from behind, standing in a bare Tadao Ando concrete space with a shaft of daylight,
large negative space. Calm, contemplative. Fine 35mm grain, soft light, shallow depth of field.
High-contrast monochrome. Aspect ratio 3:4.
```

## texture-{matte,gloss,weave,sheer}.jpg（1:1 / 黒素材の極マクロ）
```
MATTE : Extreme macro of matte black brushed wool, soft fibers absorbing light, raking soft light. Monochrome, 1:1.
GLOSS : Extreme macro of glossy black leather, smooth specular highlight from a single light, deep blacks. Monochrome, 1:1.
WEAVE : Extreme macro of black ribbed / waffle knit, raised texture and shadow valleys, side light. Monochrome, 1:1.
SHEER : Extreme macro of sheer black linen / open-weave fabric, backlit, light passing through fibers. Monochrome, 1:1.
```

## var-1〜6.jpg（4:5 / モノトーン全身コーデ）
共通: `Full-body editorial fashion photo, Japanese male model, monochrome mode tailoring (ssstein/LIDNM/RETOUCH style), on an overcast grey beach or in bare concrete, soft daylight, photorealistic high-contrast black and white, 4:5.`
```
var-1 ALL BLACK     : head-to-toe black, white sneakers single accent, three fabric types (wool/leather/cotton).
var-2 GRAY GRADATION: layered charcoal-to-light-grey, slim I-line.
var-3 WHITE × BLACK : white shirt + black wide trousers, collar slightly open, material contrast.
var-4 CHARCOAL SET  : charcoal setup, minimal, watch at the wrist as the only ego accent.
var-5 MONO DENIM    : faded monochrome washed denim with black knit, relaxed.
var-6 TONAL KNIT    : tonal grey-on-grey knit layering, soft texture.
```

## look-01〜04.jpg（4:5 / Lookbook 作例）
共通: `Full-body monochrome menswear lookbook, Japanese male model, overcast beach or Ando concrete, editorial black and white, 4:5.`
```
look-01 : all black + white sneakers (the "one white" accent), three fabric textures.
look-02 : charcoal-to-grey tonal layering, ribbed/waffle knit, stepped brightness.
look-03 : white shirt × black wide trousers, collar open (抜け), tailored.
look-04 : grey long coat as hero piece, strong I-line, ankle shown (足首見せ).
```

## iroke.jpg（3:5 / Ch05 — 三首が映える縦長）
```
Vertical editorial black-and-white photo of a Japanese male model in a monochrome mode outfit on an
overcast beach in soft natural light, composed so the "three openings" read clearly: open collar (neck),
one sleeve rolled at the wrist (watch visible), cropped hem exposing the ankle. Calm, sensual, refined.
Fine grain, shallow depth of field, high-contrast monochrome. Aspect ratio 3:5.
```

---

## 注意点（TapNow の落とし穴）

- **実在モデルの顔は厳密再現されない** → アーキタイプ指定。本人の肖像が必須なら本人を撮影/許諾
- **15 秒以上は 1 回で不可**（Seedance 2.0）。本素材は 6〜8s でOK
- **アスペクト比は厳密指定**（16:9 / 9:16）。ズレると object-cover で見切れ
- **クレジット**: Seedance 2.0 は 1 回 360。3本×3Var×1〜2ガチャ ≒ 2,000〜4,000
- 生成動画の音声は使わない（サイトは muted 再生）

## 次のアクション

1. モデルの**確定記述**（髪/体型/年齢/雰囲気）を埋める → 全プロンプト冒頭を置換
2. **Hero Var.2（海辺・後ろ姿push-in）** と **Interlude Var.2（地中美術館・光井戸へpush-in）** から生成 → スクラブ感を実機確認
3. 当たりを `public/videos/` に置き、`ffmpeg` でスクラブ再エンコード＋ポスター抽出
4. 海辺の明るさが黒基調サイトと合わなければ、グレードを暗めに or セクション背景を淡グレー化（実装側で調整）
