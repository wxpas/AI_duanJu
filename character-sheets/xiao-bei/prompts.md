# 小北 · 生成提示词

`face.jpg` 和 `source/` 里 5 张原图各自用的提示词。提示词是英文的，生成时照原样使用，每张图只生成了一次。
同一段提示词每次出图都不一样，下面的结果不保证能复现。

教程 4.4 的提示词里有「暗黑悬疑风，冷色调」，这里没有用：设定表要看得清每件东西的颜色，所以用的是白底、中性光。暗黑冷色调留到生成剧情画面时再加。

出图和提示词有出入的地方：

- 定妆照要求两颊各有一个明显的酒窝，出图的酒窝比较浅，是嘴角两侧的两个小凹点。脸颊上另外多了几颗没有要求的小痣。
- Q 版表情的发色比照片里浅，是偏红的棕色。
- 三视图的侧面看不到胸包的背带（被帽子挡住了），正面和背面都有。
- 单品图里的胸包是竖长的单肩包款式，和三视图里身上那只横着的小包不是同一个样子。
- 胸包左下角的小布标在三视图里是灰色的（花纹看不清），细节图里是黑色空白的，单品图里没有。

## 0. 定妆照 `face.jpg`

无参考图。

```text
Photorealistic head-and-shoulders casting portrait of a fictional Chinese actress, the young female lead of a modern suspense web drama in which she plays a cheerful ghost-hunting livestreamer (a make-up and costume test photo). Vertical 3:4.

Her face: 22 years old, a cute, sunny girl-next-door look; a soft round face with full cheeks and a small rounded chin, big bright round dark-brown eyes, soft natural straight brows, a small nose, fair skin with real natural skin texture, very light natural make-up, soft coral-pink lips. She is smiling warmly with her lips closed, and the smile presses one clear dimple into each cheek beside the corners of her mouth — the two dimples are her identifying mark and must be clearly visible.

Hair: dark chestnut-brown hair (a very dark warm brown, not black) gathered up into ONE round, slightly loose bun on the very top of her head, tied at its base with a dark wine-red fabric scrunchie. Light wispy see-through bangs over her forehead and one thin loose strand in front of each ear. The whole bun is inside the picture.

Costume: an oversized plain black cotton pullover hoodie with the hood down behind her neck and two flat black drawstrings; the round collar of a white T-shirt is just visible inside the hoodie neckline. A pair of matte black over-ear headphones rests around her neck, the two ear cups lying on her collarbones; each ear cup has a thin dark-red ring around it. No logos anywhere.

Pose and expression: facing the camera straight on, head upright and centered, shoulders level, framed from mid-chest up with clear white space above the bun. Friendly, lively eyes looking straight into the lens.

Photography: pure white seamless studio background, soft even frontal beauty lighting, 85mm portrait lens look, sharp focus on the eyes, realistic fabric texture, the black hoodie lit so that its folds stay readable. A real photograph of a real person — not an illustration, not anime, not a 3D render, not a painting.

One person only. No text, no letters, no watermark, no logo, no brand marks, no props, no hands in frame.
```

## 1. 三视图 `source/turnaround.png`

参考图：`face.jpg`

```text
Photorealistic character turnaround reference photo of the SAME young woman shown in the reference image — keep her round face, her dimples, her dark chestnut-brown hair in one round bun on the very top of her head tied with a dark wine-red scrunchie, her light wispy bangs and the thin loose strands in front of her ears, and the matte black over-ear headphones with thin dark-red rings resting around her neck exactly the same.

Format: square 1:1 image. Pure white seamless studio background (#FFFFFF everywhere), bright soft even lighting, no visible floor line, only a very faint contact shadow under the shoes.

Content: three full-length standing photographs of this one woman placed side by side in a single row, evenly spaced with clear white space between them, all three at exactly the same scale — the tops of the three hair buns on one horizontal line and the soles of the shoes on one horizontal line. Every figure is complete from the top of the hair bun to the soles of the shoes, with white margin above the buns and below the feet. Nothing is cropped.
1. LEFT figure — FRONT view: facing the camera straight on.
2. MIDDLE figure — SIDE view: a true 90-degree profile, her whole body and face turned to look toward the left edge of the image.
3. RIGHT figure — BACK view: seen from directly behind, showing the back of her head with the bun and the scrunchie, the hood lying flat on her upper back, the headband of the headphones behind her neck, and her heels.

Pose (same in all three): standing upright and relaxed, feet close together, both arms hanging naturally at her sides, hands empty and relaxed with the fingers visible below the sleeve cuffs, a gentle friendly closed-lip smile. Petite slim build, about 160 cm tall, realistic adult proportions.

Outfit (identical in all three views):
- Hoodie: an oversized plain black cotton pullover hoodie, hood down, two black drawstrings, a kangaroo pocket on the front, ribbed cuffs and ribbed hem; it reaches down to her hips. No print, no logo.
- T-shirt: a white crew-neck T-shirt underneath; its round collar shows inside the hoodie neckline and its white hem shows as a narrow white band below the hoodie hem.
- Trousers: charcoal-grey cotton jogger sweatpants (track pants) with two thin parallel white stripes running down the outer side of each leg from hip to ankle, and ribbed elastic cuffs at the ankles.
- Headphones: the matte black over-ear headphones with thin dark-red rings on the ear cups, worn around her neck (never on her ears) in all three views.
- Bag: a compact black nylon sling bag worn across her chest. Its strap goes over her LEFT shoulder and passes under her right arm, so in the back view the strap runs diagonally across her back. A small round brass bell on a short red cord hangs from the zip of the bag.
- Socks and shoes: white ribbed crew socks showing between the ankle cuffs and the shoes; black canvas low-top sneakers with white rubber soles, white toe caps and white laces.

Style: real studio fashion photography of a real actress (model comp card / costume fitting photos), natural skin texture, realistic fabric folds, the black clothing lit so that its folds and details stay readable, sharp focus, 85mm lens at waist height, neutral colour. NOT an illustration, NOT anime, NOT a 3D render.

No text, no letters, no labels, no numbers, no lines, no arrows, no watermark, no logo, no brand marks, no frames, no props, no phone, no extra people.
```

## 2. Q 版表情 `source/emoji-sheet.png`

参考图：`face.jpg`

```text
Chibi (Q-version, super-deformed) emoji sticker sheet of ONE character: a cute cartoon version of the young woman in the reference photo. Character design, identical in every sticker: dark chestnut-brown hair in one round bun on the very top of her head tied with a dark wine-red scrunchie, light wispy bangs and a thin loose strand in front of each ear, a round face, an oversized black hoodie with two black drawstrings and a white T-shirt collar inside the neckline, and matte black over-ear headphones with thin dark-red rings resting around her neck (never on her ears).

Format: landscape 4:3 image, pure white background (#FFFFFF). Twelve separate chibi bust stickers — big head, small upper body and tiny hands, cut off at the waist — arranged in a neat grid of 4 columns and 3 rows, all the same size, each centered in its own cell, with wide empty white gaps between them. Stickers never touch or overlap each other and nothing is cropped by the image edges.

The twelve emotions in reading order (left to right, top to bottom), each clearly different and instantly readable:
Row 1: (1) SUNNY SMILE — eyes closed in happy arcs, big bright smile with a small dimple in each cheek, one hand waving hello, little sparkles. (2) LAUGHING — head tilted back, huge open-mouth laugh, eyes squeezed shut with a tear of laughter. (3) PUZZLED — head tilted to one side, one eyebrow raised, one finger on her chin, a question mark. (4) ANGRY — puffed cheeks, deeply furrowed brows, red anger mark and small steam puffs.
Row 2: (5) SAD — big watery eyes, tears streaming down, trembling downturned mouth. (6) SHOCKED — eyes wide open and round, small open mouth, an exclamation mark. (7) TERRIFIED — blue-shaded forehead, tiny shrunken pupils, mouth wide open in a scream, both hands on her cheeks, cold sweat drops. (8) BREAKDOWN — wailing with waterfall tears, mouth wide open, both hands clutching her head, a few strands of hair coming loose.
Row 3: (9) FROZEN SMILE — a stiff forced smile that has stopped halfway, eyes wide open and blank, one big sweat drop on her temple, small tremble lines. (10) SHH — index finger held upright in front of her closed lips, eyes glancing nervously to the side. (11) DETERMINED — firm lowered brows, steady bright eyes, mouth set in a confident line, one clenched fist raised. (12) TIRED — droopy half-closed eyes, dark under-eyes, slumped shoulders, a long sigh puff.

Style: polished cute anime chibi illustration, clean thin dark line art, soft cel shading, large expressive eyes, consistent head size and proportions across all twelve; no white sticker outline, no drop shadows.

No words, no captions, no labels, no numbers, no letters (only the small "!" and "?" emotive symbols are allowed), no grid lines, no frames, no watermark.
```

## 3. 面料 `source/fabrics.png`

无参考图。

```text
A triptych of three macro fabric texture photographs. Landscape 3:2 image divided into three equal vertical panels that fill the whole frame edge to edge, separated only by two thin white vertical lines.
LEFT panel: black heavyweight cotton sweatshirt fleece (hoodie fabric), its fine knit texture clearly visible, matte, lying almost flat with one or two very gentle folds; lit so that it reads as a soft dark charcoal-black with visible texture, not as a flat pure black.
MIDDLE panel: charcoal-grey heather French terry (sweatpants fabric), soft melange knit texture with tiny lighter flecks, matte, with one or two soft folds.
RIGHT panel: black ripstop nylon (bag fabric), its fine square grid weave clearly visible, smooth and flat with a slight technical sheen.
Each panel is filled completely with its fabric, photographed straight from above in soft even studio light, sharp realistic detail, photorealistic textile catalogue photo. No text, no labels, no tags, no stitching, no objects, no watermark.
```

## 4. 细节特写 `source/details.png`

参考图：`source/turnaround.png`、`face.jpg`

```text
Using the same young woman and exactly the same outfit as in the reference images (dark chestnut-brown hair in one round bun on the very top of her head tied with a dark wine-red fabric scrunchie; oversized plain black cotton pullover hoodie with the hood down and two black drawstrings; white T-shirt underneath; matte black over-ear headphones with thin dark-red rings resting around her neck; compact black nylon sling bag across her chest on a black webbing strap, with a small round brass bell hanging from its zip on a short red cord; charcoal-grey heather jogger sweatpants with two thin white stripes down the outer side of each leg and gathered elastic ankle cuffs; white ribbed crew socks; black canvas low-top sneakers with white rubber toe caps, white soles and white laces): a 2x2 grid of four photorealistic close-up detail photographs.

Format: square 1:1 image divided into four equal square panels separated by thin white lines. Each panel is a tight close-up with its subject centered and filling the panel, bright soft studio lighting, plain white studio background wherever background is visible.

Top-left panel — HAIR BUN: close-up of her head seen from behind and slightly from the side: the round bun on the very top of her head, the dark wine-red scrunchie wrapped around its base, the smooth dark chestnut-brown hair pulled up toward it and a few fine loose hairs at the nape. Her face is not visible.
Top-right panel — HEADPHONES: close-up of her neck and upper chest from the front: the matte black over-ear headphones resting around her neck with both ear cups lying on her collarbones, the thin dark-red ring on each ear cup, the black hoodie neckline with its two black drawstrings and the white T-shirt collar. Framed from the chin down to mid-chest, eyes not visible.
Bottom-left panel — SLING BAG AND BELL: close-up of the compact black nylon sling bag on the front of her black hoodie: its rounded top, its front zip pocket, the black webbing strap running diagonally up toward her shoulder, and the small round brass bell hanging from the zip pull on a short red cord. The bell and the red cord are in the middle of the panel and sharply in focus.
Bottom-right panel — SHOES: close-up of both feet from a front three-quarter angle: black canvas low-top sneakers with white rubber toe caps, white soles and white laces, white ribbed crew socks, and the gathered ankle cuffs of the charcoal-grey sweatpants with the ends of the two white side stripes, standing on a white floor.

Real photographs with sharp focus and natural textures of hair, plastic, nylon, brass, cotton and canvas; the black items are lit so that their details stay readable. No text, no letters, no labels, no numbers, no arrows, no watermark, no logo, no brand marks.
```

酒窝特写不在这张图里，是从 `face.jpg` 上裁的。

## 5. 全套单品 `source/items.png`

参考图：`source/turnaround.png`

```text
Photorealistic e-commerce product photos of every piece of the outfit worn by the young woman in the reference image, shown WITHOUT any person.

Format: square 1:1 image, pure white background (#FFFFFF). Nine separate items in a tidy grid of 3 columns and 3 rows, each item centered in its own cell with wide empty white gaps around it. Items never touch or overlap and nothing is cropped by the image edges. Soft even studio light, only very faint soft shadows. The black items are lit so that their seams and details stay readable.

Row 1: (1) the oversized plain black cotton pullover hoodie with a hood, two black drawstrings, a kangaroo pocket, ribbed cuffs and a ribbed hem, front view, laid flat with the sleeves slightly spread. (2) the plain white cotton crew-neck short-sleeved T-shirt, front view, laid flat; its soft natural folds and a faint shadow along its edges keep its outline clearly visible against the white background. (3) the charcoal-grey heather cotton jogger sweatpants with two thin parallel white stripes down the outer side of each leg, an elastic waistband and gathered elastic ankle cuffs, full length, front view.
Row 2: (4) the matte black over-ear headphones with a padded headband and a thin dark-red ring around each ear cup, front three-quarter view. (5) the compact black nylon sling bag with a rounded top, a front zip pocket and a black webbing strap with a black buckle, front view, without any charm on it. (6) the small round brass bell on a short red cord with a small metal clip, hanging vertically.
Row 3: (7) a dark wine-red fabric hair scrunchie, seen from above. (8) a pair of white ribbed crew socks, laid flat side by side; faint shadows along their edges keep their outline clearly visible against the white background. (9) the pair of black canvas low-top sneakers with white rubber toe caps, white soles and white laces, three-quarter side view.

No people, no mannequin, no hangers, no hands, no text, no letters, no labels, no numbers, no brand logos, no price tags, no watermark, no frames, no grid lines.
```

## 中文版（给豆包、即梦等）

下面两段是按英文版意思写的中文提示词，**没有在豆包或即梦里实测过**，出图后请自己核对三个视图的朝向和服装是否一致。上传 `face.jpg` 作为参考图。

三视图：

```text
参考图中的同一位年轻女性，保持圆脸、酒窝、头顶的丸子头和酒红色发圈、空气刘海、挂在脖子上的黑色头戴式耳机完全一致。真人写实摄影，纯白背景，1:1 方图。
同一个人的三张全身站立照并排：左边正面，中间朝左的 90 度正侧面，右边背面。三个人物大小一致，丸子头顶端对齐、鞋底对齐，从丸子头到鞋底完整入镜，人物之间留白。
站姿放松，双脚并拢，双臂自然下垂，手里不拿东西，抿嘴微笑。身高 160cm，身形娇小，真实成年人比例。
服装三个视图完全相同：宽松的黑色连帽卫衣（帽子放下，两根黑色抽绳，前面有袋鼠兜），里面是白色圆领 T 恤，领口和下摆各露出一圈白边；深灰色束脚运动裤，两侧各有两条白色细条纹；黑色头戴式耳机挂在脖子上，耳罩上有一圈暗红色细线；黑色尼龙胸包斜挎在身前，背带过左肩，拉链上用红绳挂一个小铜铃；白色中筒袜，黑色低帮帆布鞋，白色鞋头、鞋底和鞋带。
剧组定妆照质感，柔和均匀的光线，黑色衣服要看得清褶皱和细节。不要文字、标注、线条、水印、品牌标志、手机等道具和其他人物。
```

Q 版表情包：

```text
把参考图中的年轻女性画成 Q 版表情包：深棕色头发、头顶丸子头配酒红色发圈、空气刘海、圆脸、黑色连帽卫衣露出白色 T 恤领口、黑色头戴式耳机挂在脖子上，12 个表情里的造型完全一致。
4:3 横图，纯白背景。12 个大头半身贴纸排成 4 列 3 行，大小一致，互不接触，四周留白，不被画面边缘裁切。
依次是：阳光笑（眯眼大笑、酒窝、挥手）、大笑（笑出眼泪）、疑惑（歪头、手托下巴、问号）、生气（鼓腮、怒气符号）、难过（流泪）、震惊（睁圆眼、感叹号）、惊恐（额头发青、尖叫、双手捂脸、冷汗）、崩溃（大哭、双手抱头、头发散乱）、僵笑（笑容僵住、眼神空白、冷汗）、别出声（食指竖在嘴前、眼睛瞟向一边）、坚定（皱眉握拳）、疲惫（黑眼圈、叹气）。
精致可爱的日系 Q 版插画，细线条，柔和上色。除了小的「！」「？」符号外不要任何文字、编号、边框和水印。
```
