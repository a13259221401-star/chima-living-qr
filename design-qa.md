# Design QA — Living Koi Pond QR

## Evidence and normalization

- Source visual truth: `C:\Users\Administrator\.codex\generated_images\01a03bbf-bb4d-75c2-8acd-6ac2b42f20b2\exec-46362672-457a-4a1e-a8d2-c3262da126c0.png`
- Ecology-pixel QR reference supplied in iteration 4: `E:\Temp\codex-clipboard-4569bb09-ccb3-43ab-a551-aeda4b29c6c5.png`
- Palette-control reference supplied in iteration 5: `E:\Temp\codex-clipboard-5eef4a80-559f-4828-a010-329d48dd6dae.png`
- High-contrast QR reference supplied in iteration 6: `E:\Temp\codex-clipboard-7c4321b7-5750-4d6e-a324-a009cdd73dd5.png`
- Browser-rendered desktop implementation: `E:\创作\icqr-tree-clone\qa\koi-pond-desktop-final-v2.png`
- Browser-rendered mobile implementation: `E:\创作\icqr-tree-clone\qa\koi-pond-mobile.png`
- QR implementation state: `E:\创作\icqr-tree-clone\qa\koi-pond-qr.png`
- Pond-to-QR interaction sequence: `E:\创作\icqr-tree-clone\qa\comparison-pond-qr-interaction.png`
- Ecology-theme comparison: `E:\创作\icqr-tree-clone\qa\comparison-theme-linkage.png`
- Jade pond / forming / QR states: `E:\创作\icqr-tree-clone\qa\theme-jade-dawn-pond.png`, `E:\创作\icqr-tree-clone\qa\theme-jade-forming.png`, `E:\创作\icqr-tree-clone\qa\theme-jade-qr.png`
- Live URL Night pond / QR states: `E:\创作\icqr-tree-clone\qa\theme-live-url-night-fixed.png`, `E:\创作\icqr-tree-clone\qa\theme-live-url-night-qr.png`
- Ecology QR weather states: `E:\创作\icqr-tree-clone\qa\ecology-qr-dawn-koi-v2.png`, `E:\创作\icqr-tree-clone\qa\ecology-qr-day-koi-v2.png`, `E:\创作\icqr-tree-clone\qa\ecology-qr-night-koi-v2.png`
- Ecology QR focused comparison: `E:\创作\icqr-tree-clone\qa\comparison-ecology-pixel-qr-v2.png`
- Chinese homepage: `E:\创作\icqr-tree-clone\qa\chinese-home-koi.png`
- Lake-blue pond / QR: `E:\创作\icqr-tree-clone\qa\chinese-home-lake-pond-v2.png`, `E:\创作\icqr-tree-clone\qa\chinese-home-lake-qr-v2.png`
- Six palette comparison: `E:\创作\icqr-tree-clone\qa\comparison-six-chinese-palettes.png`
- Palette-control comparison: `E:\创作\icqr-tree-clone\qa\comparison-chinese-palette-control.png`
- Chinese mobile pond / QR: `E:\创作\icqr-tree-clone\qa\chinese-home-mobile-v2.png`, `E:\创作\icqr-tree-clone\qa\chinese-home-mobile-qr-v2.png`
- High-contrast lake QR desktop/compact/mobile: `E:\创作\icqr-tree-clone\qa\contrast-optimized\04-qr-final-lake-1280x720.png`, `E:\创作\icqr-tree-clone\qa\contrast-optimized\05-qr-final-934x529.png`, `E:\创作\icqr-tree-clone\qa\contrast-optimized\06-qr-mobile-390x844.png`
- High-contrast reference/implementation comparison: `E:\创作\icqr-tree-clone\qa\contrast-optimized\07-side-by-side.png`
- Six high-contrast palette states: `E:\创作\icqr-tree-clone\qa\contrast-optimized\palette-1.png` through `palette-6.png`
- Dawn/Day/Night high-contrast states: `E:\创作\icqr-tree-clone\qa\contrast-optimized\mode-1.png` through `mode-3.png`
- Mobile forming state: `E:\创作\icqr-tree-clone\qa\interaction-forming-mobile.png`
- Mobile linked QR state: `E:\创作\icqr-tree-clone\qa\interaction-linked-qr-mobile.png`
- Full-view comparison: `E:\创作\icqr-tree-clone\qa\comparison-koi-pond-final-v2.png`
- Source pixels: 1536 × 1024. Center-cropped without scaling distortion to 1440 × 1024 for comparison.
- Implementation pixels/CSS viewport: 1440 × 1024 at device scale factor 1.
- Mobile viewport: 390 × 844 at device scale factor 1.
- Comparison state: Dawn, coral palette, `https://icqr.com/living-koi-pond`, pond view.

## Required fidelity surfaces

- Fonts and typography: system UI/Inter-like stack, input text, short mode labels, weights and compact hierarchy align with the generated source. No wrapping or truncation at the desktop target. The mobile input intentionally truncates a very long URL inside the field while preserving editing.
- Spacing and layout rhythm: logo and info positions, centered isometric hero, reveal pill, input/share row, three equal mode controls and palette row follow the source hierarchy. The hero and controls remain fully visible at 1440 × 1024 and 390 × 844.
- Colors and visual tokens: warm cream canvas, jade water, moss greens, blush lotus, amber share action and pale selected state match the source direction. Six named ecology presets drive the pond raster treatment, koi, lotus, reeds, formation particles and final QR. The QR now uses a related high-contrast ink palette: water, selected-color koi, lotus and reeds remain semantically recognizable but have stronger hue separation, and every foreground is automatically darkened to at least 4.6:1 against the independent warm-white quiet zone.
- Image quality and asset fidelity: the pond, koi, lotus and reeds are independent generated raster assets grounded in the selected concept. No placeholders, CSS drawings, handcrafted SVG artwork or stretched screenshot are used. The checkerboard halo found in the first pass was removed by regenerating the pond base on the exact warm-cream canvas.
- Copy and content: `Dawn`, `Day`, `Night`, the living-pond reveal copy, URL input and share affordance match the chosen concept and remain accessible.

## Findings

No actionable P0, P1 or P2 findings remain.

- P3: the source concept has more continuous reeds and small plants around all four pond edges, plus a few firefly lights. The implementation keeps the same large corner cattails and organic border growth but leaves more open water so moving koi and the ripple response remain legible.
- P3: generated koi markings vary through hue and scale rather than using several individually illustrated fish breeds. This does not affect the URL-driven behavior or visual hierarchy.

## Focused region findings

- Hero asset: pond crop, perspective, stone edge, water texture and warm-cream integration were inspected at full resolution. No remaining transparency halo or checkerboard pattern is visible.
- Controls: 62 px desktop input/mode controls, selected state, share button, palette alignment, focus states and mobile 50 px controls were inspected separately.
- QR: `qa/koi-pond-qr.png` was decoded by OpenCV as `https://a-very-long-living-koi-pond.example.com/garden/night?lotus=full`.
- Linked QR: `qa/interaction-linked-qr.png` and the 390 × 844 mobile QR both decoded as `https://icqr.com/l111111111111iving-koi-pond` after the staged pond transformation.
- Theme-linked QR: `qa/theme-jade-qr.png` decoded as `https://https:vin111111111-koi-pond`; `qa/theme-live-url-night-qr.png` decoded as `https://example.com/living-water-garden/long-seed-2026` after switching to Night + Blossom and editing the URL live.
- High-contrast QR: all six palette screenshots, all three light-mode screenshots, the 934 × 529 compact desktop screenshot and the 390 × 844 mobile screenshot decoded as `https://icqr.com/living-koi-pond`.
- Browser console: no warnings or errors in Dawn, Night, URL-editing, QR or mobile states.

## Comparison history

### Iteration 1

- P2: the first pond-base asset contained visible gray-and-white checkerboard pixels at the isometric tips.
- P2: randomly centered lotus clusters left the pond edges emptier than the selected concept.
- Fixes: regenerated the pond base with a uniform `#f7f2e8` canvas and replaced the project asset; changed lotus placement to deterministic perimeter anchors with URL-seeded variation; increased the default koi population and fish scale.
- Post-fix evidence: `qa/koi-pond-desktop-final-v2.png` and `qa/comparison-koi-pond-final-v2.png`.

### Iteration 2 — pond/QR continuity feedback

- P1: the original interaction crossfaded directly from the pond to a complete upright QR in roughly 260 ms. The koi, lotus and water did not participate, so the QR felt visually unrelated to the home scene.
- Fixes: introduced an explicit `pond → forming → qr` state machine and reverse `qr → dissolving → pond` path; koi scatter and return; lotus clusters sink and rise; reeds accelerate; URL-derived QR particles gather from across the water into an isometric pond-surface matrix before the upright scannable QR fades in; final QR retains low-opacity lotus ornaments outside the quiet zone; transition copy reports the active state.
- Post-fix evidence: `qa/comparison-pond-qr-interaction.png`, `qa/interaction-dissolving-320.png`, `qa/interaction-forming-mobile.png`, and `qa/interaction-linked-qr-mobile.png`.
- Result: the home scene and QR are now one continuous transformation. Both desktop and mobile final QR states remain decodable. No remaining P0, P1 or P2 interaction finding.

### Iteration 3 — shared pond/QR ecology color feedback

- P1: palette selection changed the QR modules, but the pond scene retained nearly fixed raster colors. The final QR therefore did not visibly inherit the ecology shown on the home scene.
- Fixes: added a deterministic `derivePondTheme` color system driven by URL hash, Dawn/Day/Night and the selected ecology preset; applied shared hue, saturation and brightness tokens to the water, koi, lotus and reeds; passed the same safe primary/finder colors into the isometric formation and final QR; added contrast enforcement against the QR quiet-zone background; removed the Night raster-background darkening artifact by separating base-image brightness from living-element brightness.
- Post-fix evidence: `qa/theme-jade-dawn-pond.png`, `qa/theme-jade-forming.png`, `qa/theme-jade-qr.png`, `qa/theme-live-url-night-fixed.png`, `qa/theme-live-url-night-qr.png`, and the combined visual comparison `qa/comparison-theme-linkage.png`.
- Result: palette, URL and time-of-day changes remain visually continuous from pond through formation to QR, and representative Dawn/Jade and Night/Blossom QR states decode successfully. No remaining P0, P1 or P2 color-linkage finding.

### Iteration 4 — ecological structure mapping feedback

- P1: although the pond and QR shared a broad theme, the QR was still rendered as a mostly uniform primary color plus one finder color. Dawn, Day and Night differences were too subtle, and the QR did not visibly encode the pond's individual water, koi, lotus and reed layers.
- Fixes: replaced uniform module coloring with a deterministic ecology map. URL-seeded koi and lotus positions bias nearby QR modules; perimeter modules inherit reeds; remaining modules use a stable water/koi/lotus/reed distribution. The same per-module map is used by the isometric formation animation and final QR. Dawn, Day and Night now use visibly different warm-gold, green/coral and navy/plum ecosystems. Mode and palette controls update the QR in place instead of forcing a return to the pond.
- Post-fix evidence: `qa/comparison-ecology-pixel-qr-v2.png`, `qa/ecology-formation-dawn-koi.png`, `qa/ecology-qr-dawn-koi-v2.png`, `qa/ecology-qr-day-koi-v2.png`, and `qa/ecology-qr-night-koi-v2.png`.
- Result: the final QR visibly carries the same four biological layers as the pond, matching the supplied multicolor-module direction. All three weather/time states decode to the identical URL. No remaining P0, P1 or P2 ecology-mapping finding.

### Iteration 5 — selected-color fidelity and Chinese homepage

- P1: the selected swatch was only an input to a weather-specific ecology mix, so the resulting pond and QR could drift to a different hue. The English ICQR brand and control copy also conflicted with the requested Chinese product direction.
- Fixes: made the selected swatch the dominant QR anchor color; contrast adjustment now darkens toward neutral black instead of green, preserving hue; rebuilt all four ecology tones from that anchor; corrected pond hue rotations so purple, teal and lake-blue selections visibly recolor koi, lotus and water; added the Chinese brand `池码`, Chinese hero copy, control labels, mode labels, named palette caption and ecology legend; moved the legend outside the QR modules; retained in-place palette switching.
- Post-fix evidence: `qa/comparison-chinese-palette-control.png`, `qa/comparison-six-chinese-palettes.png`, `qa/chinese-home-lake-pond-v2.png`, `qa/chinese-home-lake-qr-v2.png`, `qa/chinese-home-mobile-v2.png`, and `qa/chinese-home-mobile-qr-v2.png`.
- Result: every selected swatch now produces a clearly corresponding same-hue QR family and matching pond treatment. All six desktop palette QR states and the mobile lake-blue state decode to `https://icqr.com/living-koi-pond`. No remaining P0, P1 or P2 finding.

### Iteration 6 — QR contrast and compact layout

- P1: the four QR module colors met a basic background contrast but remained clustered in similar blue-gray tones. The pond-to-QR transition therefore lacked the high-energy visual separation seen in the supplied orange/gold/olive reference.
- P2: at 934 × 529, the ecology legend overlapped the top finder region and the large pond could collide with the control stack.
- Fixes: separated the soft pond palette from six explicit high-contrast QR ink presets; raised the foreground/background target to 4.6:1; retained semantic water/koi/lotus/reed colors while increasing hue separation; made the selected palette color the dominant koi ink; increased dominant-color module share; added a warm-white QR surface, subtle border and elevation; moved the compact-desktop legend beside the QR; reserved layout space for the controls; reduced and repositioned the compact pond.
- Post-fix evidence: `qa/contrast-optimized/04-qr-final-lake-1280x720.png`, `qa/contrast-optimized/05-qr-final-934x529.png`, `qa/contrast-optimized/06-qr-mobile-390x844.png`, and `qa/contrast-optimized/07-side-by-side.png`.
- Result: the QR has a clear visual jump from the soft pond while preserving the ecology relationship. No finder or control overlap remains at 934 × 529 or 390 × 844. Six palettes, three light modes, compact desktop and mobile all decode to the expected URL. No remaining P0, P1 or P2 finding.

## Primary interactions tested

- Character-by-character URL editing and debounced query-state persistence.
- Short URL: 6 koi / 4 lotus clusters. Long URL: 8 koi / 8 lotus clusters.
- Independent koi swim paths, lotus floating, reeds swaying, pointer parallax and canvas ripples.
- Dawn, Day and Night switching.
- Six QR color palettes.
- Six ecology palettes linked across the pond, formation and QR; character-by-character URL edits visibly update the living scene.
- In-place Dawn, Day and Night switching while the QR remains visible.
- URL-seeded water/koi/lotus/reed module mapping in both the pond-surface formation and final QR.
- Chinese homepage hierarchy, brand, instructions, controls and accessibility labels.
- Six selected-color fidelity states, plus desktop and 390 × 844 mobile lake-blue QR decoding.
- Six high-contrast QR palettes and Dawn/Day/Night decoding at 934 × 529.
- Independent compact-desktop QR layout with a side ecology legend and protected finder regions.
- Pond-to-QR and QR-to-pond transitions.
- Three-stage pond-to-QR formation and reverse dissolution, including the 300 ms and 800 ms intermediate frames.
- Desktop 1440 × 1024 and mobile 390 × 844 responsive layouts.
- QR decoding for a long URL.
- Share was not submitted during automated QA to avoid an external side effect.

## Verification

- `npm run build`: passed.
- `npm run test:sites`: 4/4 passed.
- Browser console: no warnings or errors.

final result: passed
