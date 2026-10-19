# Cursor handoff

Use the connected Rive tools and inspect the current file before making changes. Create a new Coach_Tony_Reference_Pose_v2 artboard or duplicate the current boxer artboard; do not overwrite the existing character.

Read README_IMPORT.md and 04_Rig_Guide/parts_manifest.json. The reference canvas is exactly 599 × 801. Import the 16 aligned PNGs at that shared canvas origin without fitting them individually. Arrange ascending draw_order from back to front.

If reusing an existing skeleton, inspect its real bind-pose transforms, scale and bone pivots first. Compare them with the JSON's manually estimated joint_positions. Treat the real skeleton as authoritative; adjust artwork placement and offsets to it. Do not claim that matching a pose image automatically matches the rig. Preserve world-space image transforms while parenting.

L/R are anatomical: L = viewer-right/front leg; R = viewer-left/back leg. Use reference overlay and assembled PNG for placement. The SVG is a raster placement reference, not guaranteed to import with the same hierarchy.

Verify transparent edges, glove thumbs, full logo orientation, shoulder and elbow overlaps, hip and knee continuity, and ankle-to-shoe overlap. Add gentle meshes or clipping only where required to hide cutout seams. Keep feet planted. Test small idle movement, then shoulders/elbows/knees through intended motion ranges. A full jab can require replacement foreshortened art.

Keep source assets editable. Save the Rive file and export .riv after verification. Report the real file path and tests performed. Never fabricate tool capabilities or a successful Rive import.

