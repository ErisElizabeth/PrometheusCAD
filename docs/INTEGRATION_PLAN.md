# OpenCascade integration plan and decisions

Authorized root: C:/Users/S. Jones/Desktop/PrometheusCAD-Integration.
Branch: feature/opencascade-integration. Initial commit: 3f02942.
Root, branch, clean tree verified before changes. The original PrometheusCAD directory and original feasibility prototype are read-only references.

## Baseline
The application is classic HTML/CSS/JavaScript with no bundler or runtime package manager. main.js owns document records, tools, SVG rendering, camera, and snapshot history (100 entries). Only Box creation is implemented in 3D. Native Open/Save buttons are placeholders; no native format exists in this checkout. DXF export is implemented; import is disabled. No application tests were supplied.

References reviewed: original REPORT.md, DRAFTED_BOX_REPORT.md, engine.mjs, worker.mjs, SVG app.js, persistence and Electron wrapper in the isolated feasibility prototype. The 63-case reference records and original bore project will be copied as test fixtures. Original files will not be modified.

## Milestones
1. Characterize legacy geometry, camera, document/editing workflows, and 2D smoke tests.
2. Add pinned local OCCT assets, plain-data adapter, dedicated worker, immutable geometry registry, kernel regression tests and notices.
3. Connect the real Box command and SVG renderer. Add native JSON save/load and history/clipboard-safe geometry references. Test failure atomicity, transformations, selection, legacy compatibility, and undo/redo.
4. Verify offline browser and portable Electron, package local assets, document evidence and remaining release gates.

## Conservative choices
- Keep legacy topology solids as legacy solids, without automatic conversion or reinterpretation.
- Validate new Box inputs with the existing constructor, then build exact planar B-rep geometry. No silent clamps, healing, scaling, or fallback to legacy geometry after kernel failure.
- B-rep assets are immutable, content-addressed and shared across transformations/history/clipboard. Solids store a reference; meshes are derived cache entries. Collect assets only when no live document/history/clipboard references remain.
- Save schema 1 stores the document and referenced assets once; supports legacy plain document snapshots explicitly. Opening validates and reconstructs all candidate kernel assets before replacing the current document.
- Keep the existing external matrix and projection. Transform display coordinates once; never bake transforms into both B-rep and matrix.
- Reject unsupported tiny features with measured edge length and operation error. Proposal for review: a documented minimum edge length of 10 * Precision.Confusion() (1e-6 inch in the current coordinate system), plus kernel validity checks. This proposal is not an enforced dimensional clamp or a promise that all larger features succeed. Initial integration preserves legacy input guards and reports actual kernel rejection.
- Keep 2D startup independent of WASM. Initialize only on 3D demand. Startup/RPC errors leave ordinary tools usable.
- Separate JS/WASM alone does not establish LGPL compliance. Public redistribution remains gated on source/build/relinking and transitive-license review.
