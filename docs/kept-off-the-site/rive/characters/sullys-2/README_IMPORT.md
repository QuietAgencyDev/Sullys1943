# Sully's Coach Tony — reference-pose artwork v2

## Import

1. Unzip this folder and open it in Cursor.
2. Use an artboard of **599 × 801**, matching SampleScaleBoxerPose.png.
3. Import all 16 PNGs from **03_Aligned_599x801**. Keep each image at 599 × 801. Place each at the same canvas origin (top-left 0,0; centre 299.5,400.5).
4. Use 04_Rig_Guide/parts_manifest.json for back-to-front order, suggested joints and anatomical side names.
5. Compare with 01_Artwork/Coach_Tony_Aligned.png. Use Reference_Overlay.png to check the reference pose.
6. Attach images to bones while preserving world transforms. Test joints and repair seams before animating punches.

Do not auto-fit each aligned image to its visible content. Do not mirror the complete character: that reverses the Sully's logo.

## Included

- 16 separate transparent cropped PNG parts: head, neck, torso, pelvis, two upper arms, two forearms, two gloves, two thighs, two shins, two shoes.
- 16 transparent PNG layers prepositioned on the reference's exact 599 × 801 canvas.
- Assembled preview and a layered SVG containing raster artwork.
- Reference overlay and JSON with explicit transforms and joint positions.
- Original Sully's logo, Tony style reference, supplied stance image and generated source atlas.

Original Sully's style restored: dark-skinned bald Tony, black short-sleeve shirt, white heritage shield, red pants with black/white side stripes, red/white gloves and black/white footwear.

## Readiness

Importable artwork; **not a finished or tested .riv rig**. Joint coordinates were estimated manually from the supplied pose image. No existing Rive skeleton was supplied or read, so this does not guarantee identical pivots or drop-in compatibility. The canvas size is exact; anatomical locations are visual estimates.

The detached parts were rebuilt and placed to the reference; the assembled image is not a pixel-identical replacement. Overlapping seams at sleeves, hips, knees and ankles need Rive mesh/clipping or placement refinement during motion QA. Test the idle guard before any jab.

These are raster assets, not vectors. Source atlas is 1254 × 1254; native cropped pieces retain its detail. Aligned PNGs are rendered at the reference canvas size. The generated style study is a style reference, not the alignment master.

Rive import support and bone parenting references:
https://rive.app/features
https://github.com/rive-app/help-center/blob/master/editor/manipulating-shapes/bones/README.md

