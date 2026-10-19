# Sully's Coach 2 — reference-pose artwork

Matches the artwork layout of Sullys Coach Tony (Coach 1).

## Import

1. Use the 16 files in **03_Aligned_599x801**. Every image is exactly 599 × 801 and uses the same shared canvas origin as Tony.
2. Place each image at top-left (0,0). Do not fit individual layers to their visible content.
3. Duplicate the Tony artboard, then replace each matching PNG by filename while preserving transforms, parenting, and animation.

L/R are anatomical: L is viewer-right/front, R is viewer-left/back. Do not mirror the complete character: that reverses the Sully's logo.

## What matches Tony

- 599 × 801 canvas and each of the 16 texture dimensions
- Part names, draw order, placement matrices and suggested pivots
- Joint coordinates in parts_manifest.json
- Guard stance, scale, and rig offsets used on Sullys Coach Tony

Gloves and shoes are the same assets as Tony. Shirt is cream with the heritage shield; trousers are black with red stripes.

This folder is the Coach 2 art pack. The live rig is the **Sullys Coach 2** artboard, exported separately from Tony.
