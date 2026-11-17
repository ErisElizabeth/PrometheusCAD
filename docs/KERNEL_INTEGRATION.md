# Kernel integration architecture and operating limits

The existing classic-script application, menus, 2D tools, units, layers, camera and transform helpers remain. New Box creation validates the existing dimensional/placement/draft contract before calling the modeling adapter. Legacy Boxes keep the old topology representation. Other modeling commands remain disabled.

## Components

- modeling/adapter.js: lazy worker RPC; immutable, content-addressed exact asset registry; display cache; staged project imports; failure handling.
- modeling/worker.mjs: asynchronous singleton WASM initialization, plain-data Box/load requests; no DOM or document access.
- modeling/kernel.mjs: scoped OCCT wrappers; shared-vertex/edge planar Box construction, validity/volume/topology checks, naming, B-rep codec and tessellation.
- modeling/svg.js: display-only triangle-to-face grouping, geometric edges, established projection and external transform supplied by main.js.
- project.js: portable native JSON envelope and structural validation.
- offline.js / sw.js / assets-manifest.json: versioned local static asset cache.
- electron/: sandboxed local protocol and narrowly scoped native project I/O. No renderer Node API.

Initialization is lazy: ordinary 2D startup never allocates a kernel. A first Box or kernel-project load initializes asynchronously. Missing WASM, worker failure, timeout or strict CSP failure reject the modeling operation without adding a solid or history entry. 2D remains available. No silent polygon fallback or dimension changes occur. A pending Box result is discarded if canceled, the active layer changes, or a document edit occurs.

The B-rep stays in local model coordinates. Existing row-major transform matrices and the current camera helpers apply exactly once to derived SVG data. Transform/copy/history operations do not bake the transform into B-rep. Geometry changes create a different asset/cache key; explicit remeshing clears derived caches only. Face triangles paint as one compound SVG path per visible source face, with separate strokes for actual topological edges. Legacy polygon rendering remains. The display chord-deflection target is 0.0005 inch; this changes derived display resolution, not exact dimensions. SVG depth ordering and hidden-edge visibility remain approximate, especially across intersecting or occluding solids.

## Box semantics and numerical policy

Position is the center/elevation of the fixed bottom face. Length follows X; width follows Y; height extends along positive Z. Let k = tan(draft in degrees):
topL = L − 2Hk; topW = W − 2Hk.
Positive draft shrinks the top, negative expands it. The original source guards and failure messages remain; the constructor is kept as the legacy validation/reference path.

OCCT uses inch-valued model coordinates in this build. Precision.Confusion is 1e-7 inch and Precision.Angular is 1e-12 radians. The legacy length epsilon is 1e-9; the same source epsilon also guards face-normal magnitude and signed volume. Its absolute-coordinate volume sum can reject a valid far-offset shape through cancellation; those existing rejection semantics remain.

Current conservative policy:
1. Preserve the requested dimensions and source validation.
2. Require successful exact construction, BRepCheck validity, one positive-volume solid, six faces/twelve edges/eight vertices and unambiguous correspondence.
3. Check positions/normals against 1e-8 comparison tolerances, volume against max(1e-12 in³, 1e-9 × reference magnitude).
4. If kernel construction/correspondence fails, reject visibly. Never clamp, enlarge features, scale coordinates, heal silently or substitute a legacy solid.

The known 2e-9-inch top edge fails MakeEdge e5 with error 3, BRepBuilderAPI_DifferentPointsOnClosedCurve. It remains a documented compatibility difference. It does not establish a universal minimum that every shorter edge fails.

Measurable future policy options, requiring a product decision:
- Explicit minimum requested edge length 1e-6 inch (10× current Confusion), with rejection and boundary tests at 0.5×, 1× and 2× that threshold. This would newly reject some legacy inputs, so it is proposed rather than enforced.
- A custom lower-tolerance kernel or controlled model-unit scaling. Neither is validated here; both require additional numerical, topology, serialization and performance evidence.
The current integration chooses actual construction/validation rejection and retains readable legacy projects, keeping the choice reversible.

## Runtime, reproducibility and release gates

Runtime kernel assets are local, pinned to OpenCascade.js 2.0.0-beta.b5ff984 with verified SHA-256 values and original npm SHA-512 integrity. JS + WASM are 50.71 MB uncompressed; observed WASM capacity is 100 MiB. First initialization takes several seconds on the test machine. Development tools are exact-version locked; runtime requires no Node/npm or external account/service/CDN.

The historical loader needs JavaScript unsafe-eval. A strict-CSP negative test is retained and 2D survives it. Bnd_Box.Get numeric reference outputs remain unusable; point-returning CornerMin/CornerMax are used. Standard_Version is unexported. Arbitrary draft modification, generic parametric naming, OCAF persistence and cross-version B-rep migration remain unvalidated.

Read THIRD_PARTY_NOTICES.md before redistribution. Separate WASM files are not a completed LGPL compliance strategy. Corresponding source, rebuild materials, unfixed recipe dependencies, practical replacement/relinking rights, complete transitive licensing, signing and distribution review remain release gates. This unsigned internal build is not represented as legally ready for public release.
