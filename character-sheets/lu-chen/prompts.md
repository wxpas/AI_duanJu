# 陆沉 · 生成提示词

`source/` 里 5 张原图各自用的提示词，按生成顺序排列。提示词是英文的，生成时照原样使用。
同一段提示词每次出图都不一样，下面的结果不保证能复现。

## 0. 定妆照 `face.jpg`

原提示词没有逐字保存，要点如下：

> Photorealistic head-and-shoulders casting portrait of a Chinese man, 28, lean athletic build; short side-parted black hair, straight thick eyebrows, sharp jawline, clean-shaven; thin gold-rimmed rectangular glasses; black suit, white shirt, black tie. Framed from mid-chest up, facing the camera straight on, pure white seamless background, soft frontal light, 85mm look, vertical 3:4, one person, no text.

## 1. 三视图 `source/turnaround.png`

参考图：`face.jpg`

```text
Photorealistic character turnaround reference photo of the SAME man shown in the reference image — keep his face, his short neat side-parted black hair and his thin gold-rimmed rectangular glasses exactly the same.

Format: square 1:1 image. Pure white seamless studio background (#FFFFFF everywhere), bright soft even lighting, no visible floor line, only a very faint contact shadow under the shoes.

Content: three full-length standing photographs of this one man placed side by side in a single row with clear white space between them, all three at exactly the same scale — the tops of the three heads on one horizontal line and the soles of the shoes on one horizontal line. Every figure is complete from the top of the hair to the soles of the shoes, with white margin above the heads and below the feet. Nothing is cropped.
1. LEFT figure — FRONT view: facing the camera straight on.
2. MIDDLE figure — SIDE view: a true 90-degree profile, his whole body and face turned to look toward the left edge of the image.
3. RIGHT figure — BACK view: seen from directly behind, showing the back of his head, the back of the jacket and his heels.

Pose (same in all three): standing upright and relaxed, feet close together, both arms hanging naturally at his sides, hands empty and relaxed, calm composed neutral expression. Tall lean athletic build, 185 cm, broad shoulders, long legs, realistic adult proportions.

Outfit (identical in all three views): tailored slim-fit black single-breasted two-button suit jacket with notch lapels and flap pockets, worn open and unbuttoned; crisp white dress shirt with point collar, tucked in; slim solid black satin tie; black leather belt with a small rectangular silver buckle; matching slim black suit trousers with a pressed crease; black dress socks; polished black leather cap-toe oxford lace-up shoes; a round silver stainless-steel wristwatch with a black dial on his LEFT wrist.

Style: real studio fashion photography of a real actor (model comp card / costume fitting photos), natural skin texture, realistic fabric folds, sharp focus, 85mm lens at waist height, neutral colour. NOT an illustration, NOT anime, NOT a 3D render.

No text, no letters, no labels, no numbers, no lines, no arrows, no watermark, no logo, no frames, no props, no extra people.
```

## 2. Q 版表情 `source/emoji-sheet.png`

参考图：`face.jpg`

```text
Chibi (Q-version, super-deformed) emoji sticker sheet of ONE character: a cute cartoon version of the man in the reference photo. Character design, identical in every sticker: short neat side-parted black hair, sharp straight eyebrows, thin gold-rimmed rectangular glasses, black suit jacket, white shirt collar, slim black tie.

Format: landscape 4:3 image, pure white background (#FFFFFF). Twelve separate chibi bust stickers — big head, small upper body and tiny hands, cut off at the waist — arranged in a neat grid of 4 columns and 3 rows, all the same size, each centered in its own cell, with wide empty white gaps between them. Stickers never touch or overlap each other and nothing is cropped by the image edges.

The twelve emotions in reading order (left to right, top to bottom), each clearly different and instantly readable:
Row 1: (1) HAPPY — eyes closed in happy arcs, bright open smile, little sparkles. (2) LAUGHING — head thrown back, huge open-mouth laugh, eyes squeezed shut with a tear of laughter. (3) COLD SMIRK — one corner of the mouth raised, half-lidded cool eyes, arms crossed. (4) ANGRY — deeply furrowed brows, gritted teeth, red anger mark and small steam puffs.
Row 2: (5) SAD — big watery eyes, tears streaming down, trembling downturned mouth. (6) SHOCKED — eyes wide and white, mouth dropped open, exclamation mark, glasses slipping askew. (7) SCARED — blue-shaded forehead, shaking, both hands on cheeks, cold sweat drops. (8) SHY — bright blushing cheeks, looking away, scratching his cheek with one finger.
Row 3: (9) THINKING — hand on chin, eyes looking up to the side, a question mark. (10) ENDURING — head lowered, eyes hidden in shadow under his fringe, lips pressed tight, one clenched fist. (11) DOMINEERING — chin raised, confident cold stare, pushing up his glasses with one finger, a sharp glint on the lens. (12) TIRED — droopy half-closed eyes, dark under-eyes, long sigh puff, loosened tie.

Style: polished cute anime chibi illustration, clean thin dark line art, soft cel shading, large expressive eyes, consistent head size and proportions across all twelve; no white sticker outline, no drop shadows.

No words, no captions, no labels, no numbers, no letters (only tiny "!" and "?" emotive symbols are allowed), no grid lines, no frames, no watermark.
```

第一次出图时「震惊」那格多画了一副掉落的眼镜，又用下面这段改了一次图（参考图：第一次的出图）。建议直接把提示词里的 `glasses slipping askew` 删掉。

```text
Edit the reference image, a sheet of twelve chibi stickers of the same man in a 4-column by 3-row grid. Make exactly one change: in the sticker at row 2, column 2 (the shocked chibi with round white eyes, open mouth and a red exclamation mark), remove the second pair of glasses that is falling beside his chin and shoulder. He keeps only the gold-rimmed glasses that are on his face. Redraw the small part of the jaw line, neck, white collar and black jacket shoulder that was hidden behind the falling glasses, and leave plain white background where the falling glasses were.

Do not change anything else: all twelve stickers keep exactly the same positions, sizes, line art, colours, expressions and symbols; same landscape format; pure white background; no text, no captions, no numbers, no frames.
```

## 3. 面料 `source/fabrics.png`

无参考图。

```text
A triptych of three macro fabric texture photographs. Landscape 3:2 image divided into three equal vertical panels that fill the whole frame edge to edge, separated only by two thin white vertical lines.
LEFT panel: black fine worsted wool suiting, subtle diagonal twill weave clearly visible, matte, flat.
MIDDLE panel: white cotton poplin shirt fabric, fine plain weave, a few very soft natural folds with pale grey shading.
RIGHT panel: black silk satin, smooth with soft glossy highlights and gentle flowing ripples.
Each panel is filled completely with its fabric, photographed straight from above in soft even studio light, sharp realistic detail, photorealistic textile catalogue photo. No text, no labels, no tags, no stitching, no objects, no watermark.
```

## 4. 细节特写 `source/details.png`

参考图：`source/turnaround.png`、`face.jpg`

```text
Using the same man and exactly the same outfit as in the reference images (black two-button suit, white shirt, slim black satin tie, silver steel watch with dark dial on the left wrist, black leather belt with a silver buckle, black cap-toe oxford shoes): a 2x2 grid of four photorealistic close-up detail photographs.

Format: square 1:1 image divided into four equal square panels separated by thin white lines. Each panel is a tight close-up with its subject centered and filling the panel, bright soft studio lighting, plain white studio background wherever background is visible.

Top-left panel — COLLAR AND TIE: close-up of his neck and upper chest from the front: crisp white point collar, neat four-in-hand knot of the slim black satin tie, black notch lapels of the jacket. Framed from the chin down to mid-chest, eyes not visible.
Top-right panel — WATCH: close-up of his left wrist with the hand hanging relaxed at his side: round silver stainless-steel wristwatch with a black dial and steel link bracelet, a strip of white shirt cuff, black jacket sleeve with four small buttons.
Bottom-left panel — BELT: close-up of his waist from the front: black smooth leather belt with a small rectangular silver buckle, white shirt tucked in, the tip of the black tie, black suit trousers, the open front edges of the black jacket at both sides.
Bottom-right panel — SHOES: close-up of both feet from a front three-quarter angle: polished black leather cap-toe oxford lace-up shoes, black socks, the hems of the black trousers, standing on a white floor.

Real photographs with sharp focus and natural textures of skin, metal, leather and fabric. No text, no letters, no labels, no numbers, no arrows, no watermark, no logo on the watch dial.
```

设定表里的「眼镜」特写不是这张图里的，是从 `face.jpg` 上裁的。

## 5. 全套单品 `source/items.png`

参考图：`source/turnaround.png`

```text
Photorealistic e-commerce product photos of every piece of the outfit worn by the man in the reference image, shown WITHOUT any person.

Format: square 1:1 image, pure white background (#FFFFFF). Nine separate items in a tidy grid of 3 columns and 3 rows, each item centered in its own cell with wide empty white gaps around it. Items never touch or overlap and nothing is cropped by the image edges. Soft even studio light, only very faint soft shadows.

Row 1: (1) the black single-breasted two-button suit jacket with notch lapels and flap pockets, front view, invisible ghost-mannequin style. (2) the white cotton dress shirt with point collar, buttoned, front view, ghost-mannequin style, with pale grey shading so its outline is clearly visible against the white background. (3) the black slim suit trousers with pressed front creases, full length, front view.
Row 2: (4) the slim solid black satin necktie, laid flat at full length, vertical. (5) the black smooth leather belt with a small rectangular silver buckle, neatly coiled. (6) a pair of black ribbed dress socks, laid flat side by side.
Row 3: (7) thin gold-rimmed rectangular eyeglasses with clear lenses, front three-quarter view, temples open. (8) a round silver stainless-steel wristwatch with a black dial and steel link bracelet. (9) a pair of polished black leather cap-toe oxford lace-up shoes, three-quarter side view.

No people, no mannequin, no hangers, no hands, no text, no letters, no labels, no numbers, no brand logos, no price tags, no watermark, no frames, no grid lines.
```

第一次出图时衬衫袖子被画成一整块灰色，眼镜带黑色镜框，又用下面这段改了一次图（参考图：第一次的出图、`face.jpg`）。

```text
Edit the first reference image, a 3x3 grid of outfit product photos on a pure white background. Change only these two items and keep every other item, the layout, the positions, the sizes and the pure white background exactly the same:

1. Row 1, middle — the white dress shirt: its sleeves are wrongly flat grey. Make the sleeves the same crisp white cotton as the body of the shirt, with natural soft fabric folds and only gentle pale-grey shading along the edges so the outline of the shirt is still visible against the white background.

2. Row 3, left — the eyeglasses: replace them with the exact glasses worn by the man in the second reference image: a very thin all-gold metal wire frame with softly squared rectangular lenses, thin gold bridge, thin gold temples, clear nose pads and clear lenses. No black parts anywhere on the frame. Front three-quarter view with the temples open, same position and size as before.

Photorealistic e-commerce product photography, soft even studio light. No people, no text, no letters, no labels, no brand logos, no watermark.
```

## 中文版（给豆包、即梦等）

下面两段是按英文版意思写的中文提示词，**没有在豆包或即梦里实测过**，出图后请自己核对三个视图的朝向和服装是否一致。上传 `face.jpg` 作为参考图。

三视图：

```text
参考图中的同一位男性，保持脸、侧分黑色短发和金丝细框眼镜完全一致。真人写实摄影，纯白背景，1:1 方图。
同一个人的三张全身站立照并排：左边正面，中间朝左的 90 度正侧面，右边背面。三个人物大小一致，头顶对齐、鞋底对齐，从头发到鞋底完整入镜，人物之间留白。
站姿自然挺拔，双臂自然下垂，表情平静。身高 185cm，宽肩长腿，真实成年人比例。
服装三个视图完全相同：黑色修身单排两粒扣西装，白色尖领衬衫，黑色缎面窄领带，黑色皮带配银色方扣，黑色西裤，黑色正装袜，黑色三接头牛津鞋，左手腕银色钢带黑盘腕表。
棚拍服装定妆照质感，柔和均匀的光线，真实皮肤和面料纹理。不要文字、标注、线条、水印和其他人物。
```

Q 版表情包：

```text
把参考图中的男性画成 Q 版表情包：侧分黑色短发、剑眉、金丝细框眼镜、黑西装、白衬衫、黑领带，12 个表情里的造型完全一致。
4:3 横图，纯白背景。12 个大头半身贴纸排成 4 列 3 行，大小一致，互不接触，四周留白，不被画面边缘裁切。
依次是：开心、大笑、冷笑（抱臂）、生气（怒气符号）、难过（流泪）、震惊（感叹号）、害怕（脸色发青、冷汗）、害羞（脸红、挠脸）、思考（托下巴、问号）、隐忍（低头、握拳、眼睛藏在阴影里）、霸气（抬下巴、扶眼镜、镜片反光）、疲惫（黑眼圈、叹气）。
精致可爱的日系 Q 版插画，细线条，柔和上色。除了小的「！」「？」符号外不要任何文字、编号、边框和水印。
```
