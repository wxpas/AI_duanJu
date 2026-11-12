# 沈清辞 · 生成提示词

`face.jpg` 和 `source/` 里 5 张原图各自用的提示词，按生成顺序排列。提示词是英文的，生成时照原样使用。
同一段提示词每次出图都不一样，下面的结果不保证能复现。

出图和提示词有出入的地方：

- 提示词写的是月白色上襦，出图是白色上襦配月白色长裙。设定表按出图标注。
- 发髻要求在后脑，出图在头顶。后面几段提示词改成按出图描述（topknot）。
- 鞋是光脚穿的，没有袜子，所以单品里没有袜子。
- 单品图要求纯白背景，出图是浅灰底的九宫格。白色单品在浅灰底上更清楚，所以保留了。
- 12 个 Q 版表情里有 4 个（大笑、难过、得意、疲惫）漏画了小痣，由 `cut_parts.py` 补上。

## 0. 定妆照 `face.jpg`

无参考图。

```text
Photorealistic head-and-shoulders casting portrait of a fictional Chinese actress, the leading lady of a historical ancient-China costume drama (a make-up and costume test photo). Vertical 3:4.

Her face: 25 years old, beautiful in a refined, intelligent way; soft oval face, clear almond-shaped dark brown eyes, soft straight natural brows, delicate nose, fair skin with real natural skin texture, light natural make-up, soft rose lips. One single tiny dark beauty mole just below the outer corner of her LEFT eye — in the picture it sits on the RIGHT-hand side of her face as the viewer sees it. This mole is her identifying mark and must be clearly visible. No other moles.

Hair: very long, perfectly straight, jet-black hair with a clean centre parting and no fringe. The top section is drawn back into one small neat bun at the back of the crown, held by a single slender white jade hairpin; the rest of the hair falls straight down behind her shoulders. Simple and refined, no flowers, no crown, no dangling ornaments in the hair.

Costume: a moon-white (very pale cool off-white with a faint green-blue tint) silk hanfu top with a crossed collar that closes toward her right side, so the neckline forms a lowercase "y" shape for the viewer, with a narrow plain white inner collar underneath. Small white pearl drop earrings.

Pose and expression: facing the camera straight on, head upright and centered, shoulders level, framed from mid-chest up with a little white space above the head. Calm, composed, quietly confident expression, lips gently closed, looking straight into the lens.

Photography: pure white seamless studio background, soft even frontal beauty lighting, 85mm portrait lens look, sharp focus on the eyes, realistic silk texture. A real photograph of a real person — not an illustration, not anime, not a 3D render, not a painting.

One person only. No text, no letters, no watermark, no logo, no props, no hands in frame.
```

## 1. 三视图 `source/turnaround.png`

参考图：`face.jpg`

```text
Photorealistic character turnaround reference photo of the SAME woman shown in the reference image — keep her face, the tiny beauty mole on her left cheek below her left eye, her long straight jet-black hair with the centre parting, the small topknot bun with the slender white jade hairpin pushed horizontally through it, and her small pearl drop earrings exactly the same.

Format: square 1:1 image. Pure white seamless studio background, bright soft even lighting, no visible floor line, only a very faint contact shadow under the hem of the skirt.

Content: three full-length standing photographs of this one woman placed side by side in a single row with clear white space between them, all three at exactly the same scale — the tops of the three heads on one horizontal line and the three skirt hems on one horizontal line. Every figure is complete from the top of the hair bun to the hem of the skirt and the tips of the shoes, with white margin above the heads and below the feet. Nothing is cropped.
1. LEFT figure — FRONT view: facing the camera straight on.
2. MIDDLE figure — SIDE view: a true 90-degree profile, her whole body and face turned to look toward the left edge of the image.
3. RIGHT figure — BACK view: seen from directly behind, showing the back of her head with the topknot and jade hairpin, her long straight black hair hanging down her back to the waist, and the back of the costume.

Pose (same in all three): standing upright and graceful, feet together, arms relaxed at her sides with the elbows slightly bent, hands empty with the fingers visible below the sleeve cuffs, calm composed expression. Slender build, about 166 cm tall, realistic adult proportions.

Costume (identical in all three views) — a traditional Chinese hanfu ruqun set for a historical drama:
- Top: a moon-white silk cross-collar wrap top (moon-white = a very pale cool white with a faint mint green-blue tint). The collar closes toward her right side, so in the front view the neckline forms a lowercase "y" for the viewer. Narrow plain white inner collar. Long straight sleeves, moderately wide, reaching the wrists.
- Skirt: a floor-length high-waisted pleated skirt in the same moon-white silk, hem just above the floor.
- Sash: a celadon-green satin sash (soft jade blue-green) tied at the natural waist and knotted at the front, its two ribbon ends hanging down the centre front to mid-thigh.
- Pendant: a round white jade ring pendant with a celadon-green silk tassel hanging from the sash at her left hip.
- Shawl: a long sheer celadon-green silk gauze shawl draped across her upper back and looped over the crooks of both elbows, its two ends hanging down at her sides to about knee level.
- Shoes: celadon-green satin embroidered cloth shoes with slightly upturned toes, the toes visible below the hem.

Style: real studio photography of a real actress in costume (costume fitting photos for a historical drama), natural skin texture, realistic silk folds, sharp focus, 85mm lens at waist height, neutral colour. The pale costume stays clearly distinguishable from the white background through its natural soft shadows and folds. NOT an illustration, NOT anime, NOT a 3D render.

No text, no letters, no labels, no numbers, no lines, no arrows, no watermark, no logo, no frames, no props, no fan, no umbrella, no extra people.
```

## 2. Q 版表情 `source/emoji-sheet.png`

参考图：`face.jpg`

```text
Chibi (Q-version, super-deformed) emoji sticker sheet of ONE character: a cute cartoon version of the woman in the reference photo. Character design, identical in every sticker: long straight jet-black hair with a centre parting and no fringe, a small topknot bun with a white jade hairpin pushed horizontally through it, one tiny dark beauty mole on her left cheek below her left eye (on the right-hand side of her face as the viewer sees it), small pearl drop earrings, a moon-white (very pale mint-white) cross-collar hanfu top with a white inner collar, and a sheer celadon-green shawl around her arms.

Format: landscape 4:3 image, pure white background (#FFFFFF). Twelve separate chibi bust stickers — big head, small upper body and tiny hands, cut off at the waist — arranged in a neat grid of 4 columns and 3 rows, all the same size, each centered in its own cell, with wide empty white gaps between them. Stickers never touch or overlap each other and nothing is cropped by the image edges.

The twelve emotions in reading order (left to right, top to bottom), each clearly different and instantly readable:
Row 1: (1) HAPPY — eyes closed in happy arcs, bright open smile, little sparkles. (2) LAUGHING — head tilted back, huge open-mouth laugh, eyes squeezed shut with a tear of laughter. (3) CALM — cool composed face, steady half-lidded eyes, lips pressed together in a straight line, hands folded in front. (4) ANGRY — deeply furrowed brows, gritted teeth, red anger mark and small steam puffs.
Row 2: (5) SAD — big watery eyes, tears streaming down, trembling downturned mouth. (6) SHOCKED — eyes wide open and round, small open mouth, an exclamation mark. (7) SCARED — blue-shaded forehead, shaking, both hands on her cheeks, cold sweat drops. (8) SMITTEN — bright blushing cheeks, head lowered, eyes looking down shyly, two small pink hearts floating beside her.
Row 3: (9) THINKING — one finger on her chin, eyes looking up to the side, a question mark. (10) SMUG — chin raised, eyes closed in a proud grin, hands on her hips, a small star sparkle. (11) SPEECHLESS — flat half-lidded eyes, tiny straight mouth, one big sweat drop on her temple and three small dots floating beside her head. (12) TIRED — droopy half-closed eyes, dark under-eyes, slumped shoulders, a long sigh puff.

Style: polished cute anime chibi illustration, clean thin dark line art, soft cel shading, large expressive eyes, consistent head size and proportions across all twelve; no white sticker outline, no drop shadows.

No words, no captions, no labels, no numbers, no letters (only the small "!", "?" and three-dot emotive symbols are allowed), no grid lines, no frames, no watermark.
```

## 3. 面料 `source/fabrics.png`

无参考图。

```text
A triptych of three macro fabric texture photographs. Landscape 3:2 image divided into three equal vertical panels that fill the whole frame edge to edge, separated only by two thin white vertical lines.
LEFT panel: moon-white silk (a very pale cool off-white with a faint green-blue tint) with a subtle tone-on-tone woven jacquard pattern of small clouds, soft sheen, lying almost flat with one or two very gentle folds.
MIDDLE panel: sheer celadon-green silk gauze (a soft jade blue-green), light, airy and semi-transparent, with soft flowing folds.
RIGHT panel: celadon-green silk satin (the same soft jade blue-green, a little deeper) with fine white floral embroidery of small plum blossoms and thin vines, smooth with a gentle sheen.
Each panel is filled completely with its fabric, photographed straight from above in soft even studio light, sharp realistic detail, photorealistic textile catalogue photo. No text, no labels, no tags, no objects, no watermark.
```

## 4. 细节特写 `source/details.png`

参考图：`source/turnaround.png`、`face.jpg`

```text
Using the same woman and exactly the same costume as in the reference images (long straight black hair with a small topknot bun and a slender white jade hairpin pushed horizontally through it; ivory-white silk cross-collar wrap top with a narrow white inner collar and long straight sleeves; pale mint-white floor-length pleated skirt; wide celadon-green satin sash tied in a bow at the front with two long ribbon tails; round white jade ring pendant with a celadon-green tassel at her left hip; sheer celadon-green gauze shawl over her elbows; celadon-green satin embroidered cloth shoes): a 2x2 grid of four photorealistic close-up detail photographs.

Format: square 1:1 image divided into four equal square panels separated by thin white lines. Each panel is a tight close-up with its subject centered and filling the panel, bright soft studio lighting, plain white studio background wherever background is visible.

Top-left panel — HAIRPIN: close-up of the back of her head seen from behind: the small neat topknot bun at the crown, the slender white jade hairpin pushed horizontally through the bun, smooth straight jet-black hair falling down from it. Her face is not visible.
Top-right panel — COLLAR: close-up of her neck and upper chest from the front: the ivory-white crossed collar closing toward her right side so that it forms a lowercase "y" shape for the viewer, and the narrow white inner collar underneath. Framed from the chin down to mid-chest, eyes not visible.
Bottom-left panel — SASH AND JADE PENDANT: close-up of her waist from the front: the wide celadon-green satin sash with its bow in the centre and the tops of the two ribbon tails, the round white jade ring pendant on a knotted celadon cord with a celadon-green silk tassel hanging beside the bow, the pleats of the pale mint-white skirt below and the hem of the ivory-white top above.
Bottom-right panel — SHOES: close-up of both feet from a front three-quarter angle: celadon-green satin slip-on cloth shoes with slightly upturned pointed toes, fine white floral embroidery on the toes and thin white soles, with the hem of the pale mint-white skirt just above them, standing on a white floor.

Real photographs with sharp focus and natural textures of hair, jade, silk and satin. No text, no letters, no labels, no numbers, no arrows, no watermark.
```

设定表里的「小痣」特写不是这张图里的，是从 `face.jpg` 上裁的。

## 5. 全套单品 `source/items.png`

参考图：`source/turnaround.png`

```text
Photorealistic e-commerce product photos of every piece of the costume worn by the woman in the reference image, shown WITHOUT any person.

Format: square 1:1 image, pure white background (#FFFFFF). Nine separate items in a tidy grid of 3 columns and 3 rows, each item centered in its own cell with wide empty white gaps around it. Items never touch or overlap and nothing is cropped by the image edges. Soft even studio light. The white and pale items keep their natural soft folds and gentle shadows, so the outline of every item is clearly visible against the white background.

Row 1: (1) the ivory-white silk cross-collar hanfu wrap top with long straight sleeves and narrow cuffs, laid flat, front view, sleeves spread out to both sides. (2) the plain white cotton inner under-top with a narrow crossed collar, neatly folded into a tidy rectangle with the collar on top. (3) the pale mint-white floor-length pleated hanfu skirt with its waistband, laid flat, full length, front view.
Row 2: (4) the wide celadon-green satin sash, tied in a flat bow with its two long ribbon tails hanging straight down. (5) the long sheer celadon-green silk gauze shawl, loosely folded in a few soft flowing curves. (6) the round white jade ring pendant on a knotted celadon-green cord with a long celadon-green silk tassel, hanging vertically.
Row 3: (7) the slender white jade hairpin, a single smooth slightly curved stick, placed diagonally. (8) a pair of small white pearl drop earrings on fine silver hooks, side by side. (9) the pair of celadon-green satin slip-on cloth shoes with slightly upturned pointed toes, white floral embroidery and thin white soles, three-quarter side view.

No people, no mannequin, no hangers, no hands, no text, no letters, no labels, no numbers, no brand logos, no price tags, no watermark, no frames, no grid lines.
```

## 中文版（给豆包、即梦等）

下面两段是按英文版意思写的中文提示词，**没有在豆包或即梦里实测过**，出图后请自己核对三个视图的朝向、衣领方向和服装是否一致。上传 `face.jpg` 作为参考图。

三视图：

```text
参考图中的同一位女性，保持脸、左眼下方的小痣、中分黑长直发、头顶的小发髻和横插的白玉发簪、珍珠耳坠完全一致。真人写实摄影，纯白背景，1:1 方图。
同一个人的三张全身站立照并排：左边正面，中间朝左的 90 度正侧面，右边背面。三个人物大小一致，头顶对齐、裙摆对齐，从发髻到鞋尖完整入镜，人物之间留白。
站姿端正，双臂自然下垂，手从袖口露出，表情平静。身高 166cm，身形纤细，真实成年人比例。
服装三个视图完全相同：白色交领上襦（右衽，露出白色中衣领，直袖到手腕），月白色齐腰百褶长裙，青色缎面宽腰带在身前系蝴蝶结、两条飘带垂到大腿，左侧腰间挂白玉环佩配青色流苏，青色薄纱披帛绕过后背搭在两臂臂弯，青色缎面绣花鞋。
古装剧定妆照质感，柔和均匀的光线，真实皮肤和丝绸纹理。浅色服装靠自然的褶皱和阴影与白背景区分开。不要文字、标注、线条、水印、道具和其他人物。
```

Q 版表情包：

```text
把参考图中的女性画成 Q 版表情包：中分黑长直发、头顶小发髻横插白玉发簪、左眼下方一颗小痣、珍珠耳坠、月白色交领襦裙、青色披帛，12 个表情里的造型完全一致，每个表情都要画出小痣。
4:3 横图，纯白背景。12 个大头半身贴纸排成 4 列 3 行，大小一致，互不接触，四周留白，不被画面边缘裁切。
依次是：开心、大笑、冷静（抿唇、双手交叠）、愤怒（皱眉、怒气符号）、难过（流泪）、震惊（睁大眼、感叹号）、害怕（脸色发青、冷汗）、心动（脸红低头、爱心）、思考（托下巴、问号）、得意（抬下巴、叉腰）、无语（半睁眼、汗滴、省略号）、疲惫（黑眼圈、叹气）。
精致可爱的日系 Q 版插画，细线条，柔和上色。除了小的「！」「？」「…」符号外不要任何文字、编号、边框和水印。
```
