# Sully's Coach 3 — reference-pose artwork

Separate from Coach 1 and Coach 2. Do not overwrite those folders or the live Floor TV fighter.

Numbered name only: **Sullys Coach 3**. Folder: `characters/coach-3/`.

## Import

1. Use the 16 files in **03_Aligned_599x801**. Every image is exactly 599 × 801 and uses the same shared canvas origin as Coach 2 / Tony v2.
2. Place each image at top-left (0,0). Do not fit individual layers to their visible content.
3. Duplicate the Coach 2 artboard into a new artboard named **Sullys Coach 3**, then replace each matching PNG by filename while preserving transforms, parenting, and animation.

L/R are anatomical: L is viewer-right/front, R is viewer-left/back. Do not mirror the complete character: that reverses the Sully's logo.

## What matches Coach 2

- 599 × 801 canvas and each of the 16 texture dimensions
- Part names, draw order, placement matrices and suggested pivots
- Joint coordinates in parts_manifest.json
- Guard stance, scale, and rig offsets used on Sullys Coach 2

Gloves are the same assets as Coach 2. Costume is a black Sully's tank, red shorts with white side panels, bare arms and lower legs, black/white boots. Hair/bun are baked into `head.png`.

This folder is the Coach 3 art pack. Existing turnaround stills stay in `cuts/` and `parts/`. The live Floor TV fighter remains Coach 2.
