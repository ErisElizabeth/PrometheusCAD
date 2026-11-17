# PrometheusCAD drafted Box: isolated OpenCascade follow-up

**Result: ordinary drafted Box construction is feasible with the pinned kernel. Full input-range compatibility is not established. No production integration was performed.**

Run completed 2026-11-17T15:00:18.625Z. Production source: PrometheusCAD 0.1.49, main.js SHA-256 67dddedd513ae79fa45dc6fbffbefda22a3782544adb617578c05149bc97a89f.

All 20 production files remain byte-identical, with no additions or removals. The prototype package manifest, lockfile, JS loader, and WASM are unchanged. No dependencies were installed. The original 23 integration checks and original bore fixture remain; 13 follow-up checks bring the total to **36 passing integration checks**. An expected kernel deviation is reported separately below.

## Current Box semantics, read from production

The oracle extracts buildBoxSolid and its pure geometry helpers from the current production main.js (constructor at line 1944), executes them in a Node VM, and saves their records as comparison data. It never starts or imports the application UI. Values below are canonical inches; the UI converts selected display units at its boundary.

| Property | Existing meaning |
|---|---|
| X, Y, Z | Center of the fixed bottom rectangle; Z is bottom elevation, not solid center. |
| Length, width, height | Bottom X size L, bottom Y size W, positive Z height H. UI defaults are 2 × 1 × 1 in the selected display units, with position 0 and draft 0°. |
| Draft | k = tan(angle in degrees); top length = L − 2Hk, top width = W − 2Hk. Positive draft shrinks the top; negative draft expands it. Top center remains X,Y at Z+H. |
| Placement under draft | Bottom vertices v0–v3 remain exactly fixed. Top vertices v4–v7 move in X/Y only. |
| Transform | Definition and local topology are independent of the stored row-major 4 × 4 affine matrix. New solids start with identity; later application transforms premultiply. |

| Face ID | Role / vertex cycle |
|---|---|
| bottom | Z-min; v0, v3, v2, v1 |
| top | Z+H; v4, v5, v6, v7 |
| front | Y-min wall; v0, v1, v5, v4 |
| right | X-max wall; v1, v2, v6, v5 |
| back | Y-max wall; v2, v3, v7, v6 |
| left | X-min wall; v3, v0, v4, v7 |

Edges e0–e3 are the bottom ring, e4–e7 the corresponding top ring, and e8–e11 connect corresponding bottom/top corners. Every edge belongs to two faces. These are application roles, independent of OCCT enumeration or MakeBox getter names.

Existing guards require finite values; L,W,H > 1e-9; −90° < angle < 90°; and both top dimensions > 1e-9. The same epsilon also tests face cross-product magnitude and signed volume. A dimensionally positive box can therefore still be rejected by a face-normal or volume guard.

## Construction and test scope

The isolated adapter constructs eight shared B-rep vertices, twelve straight shared edges, six explicitly oriented planar faces, one closed shell, and one solid. Exercised bindings include BRepBuilderAPI_MakeVertex, MakeEdge_2, MakeWire_1, MakeFace_16, MakeSolid_3, BRep_Builder, and gp_Pln_3. No sewing, healing, clamping, or tolerance inflation is used. BRepCheck_Analyzer validates the result. This evaluates initial drafted Box construction, not editing an arbitrary solid with BRepOffsetAPI_DraftAngle.

The 20 nominal cases combine sizes 2 × 1 × 1 and 4 × 2 × 0.75; positions (0,0,0) and (3.25,−2.5,−1.5); and angles 0°, +5°, −5°, +15°, −15°. Four groups confirm bit-identical bottom coordinates across all five drafts.

Another 43 cases cover rectangular/square near-collapse tops, zero/inverted tops, invalid dimensions and angles, nonfinite values, small boxes, ±1e-8° draft, −89° outward draft, and a large coordinate offset. All 28 source rejections match, including rejection messages.

| Runtime | Cases matching / total | Nominal pass | Matching rejections | Deviations | Required failures |
|---|---:|---:|---:|---:|---:|
| Node | 62/63 | 20/20 | 28 | 1 | 0 |
| Browser | 62/63 | 20/20 | 28 | 1 | 0 |
| Offline browser | 62/63 | 20/20 | 28 | 1 | 0 |
| Portable Electron | 62/63 | 20/20 | 28 | 1 | 0 |

For the 34 compatible accepted cases, checks include analytic and production volume, bounds, 6 faces / 12 edges / 8 vertices / 1 solid, planar surfaces, outward normals, edge endpoints, face-edge incidence, application IDs, B-rep/JSON round trips, regenerated meshes, and transformed bounds. Four nominal projects (0°, +5°, −5°, offset +5°) also reopen in fresh Electron and offline-browser workers.

Independent analytic volume: V = HLW − H²k(L+W) + (4/3)H³k². For the 2 × 1 × 1 fixture, V is 2 at 0°, 1.747739697749631 at +5°, and 2.272671678905175 at −5°, in cubic inches.

## Tolerances, deviations, and failed tests

| Quantity | Comparison tolerance | Maximum observed error across compatible accepted cases |
|---|---|---:|
| Vertex position | 1e-8 inch | 5.551e-17 inch |
| Local bounds | 1e-8 inch | 4.441e-16 inch |
| Transformed bounds | 1e-8 inch | 2.416e-13 inch |
| Outward normal vector | Euclidean error 1e-8 | 2.289e-16 |
| Volume vs production | max(1e-12 in³, 1e-9 × absolute reference volume) | 9.095e-13 in³ |
| Volume after B-rep reload | Same case-specific volume tolerance | 1.000e-11 in³ |

OCCT reports Precision.Confusion() = 1e-7 model units and Precision.Angular() = 1e-12 radians. With this prototype’s inch coordinates, Confusion is 1e-7 inch; it exceeds the production length epsilon by 100×. These quantities serve different purposes; the comparison tolerances do not change kernel tolerances.

- **Real compatibility deviation — rect-top-2e-9:** production accepts a top approximately 1.000000002 × 2.000000054e-9 inch. MakeEdge for e5 fails with error 3, BRepBuilderAPI_DifferentPointsOnClosedCurve. No valid solid or round trip is produced. This is an observed tiny-feature limitation, not a claim that every feature below Confusion fails.
- **Existing source rejection — large-offset-positive:** at (1e6,−1e6,1e6), the source signed-volume guard rejects a +5° box whose independent analytic volume is positive (1.747739697749631 in³). Its absolute-coordinate triple-product sum is cancellation-sensitive. The adapter matches that rejection before calling the kernel; this is not evidence of a kernel failure at large coordinates.
- **Existing source thresholds:** square top sides 2e-5 and 1e-6 inch are rejected by the face-normal guard despite positive top dimensions. The 0.001-inch cube is accepted at a floating-point volume of 1.0000000000000003e-9 in³. These boundary behaviors are preserved, not revised.
- **Corrected test failure:** an initial exact comparison of derived top dimensions across Node/Chromium marked rect-top-0.001 as a save/reload deviation. Math.tan rounding differs by 1.110e-16 inch in the derived dimensions. The final regression checks exact input fields and exact JSON preservation of the saved definition, with the stated tolerance for recalculated geometry. The initial evidence is retained in initial-failures.json.

The original unsupported Bnd_Box.Get numeric reference outputs remain unsupported; CornerMin/CornerMax are used. Standard_Version remains unexported. Strict CSP startup without JavaScript unsafe-eval and direct browser file:// module loading still fail as documented in the original report. These are reproduced limitations, not successful configurations.

## Identities, rendering, and persistence

Construction assigns the six production face roles and e0–e11 IDs using shared shape handles (IsSame), rather than coordinate sorting or enumeration. The sidecar stores IDs, endpoint/incidence metadata, vertex coordinates, and collision-checked geometric signatures. On B-rep reload, signatures rounded to eight decimal places restore face/edge IDs; ambiguous or unresolved matches are rejected.

Definition, IDs/layer, canonical units, and the independent affine matrix are serialized as plain JSON with a text B-rep payload. No live kernel objects or triangulation are saved. Reload validates the B-rep and regenerates SVG display data. Face triangles retain role IDs; only topological edges are stroked. The existing independent 2D reference and original bore/picking/transform tests still pass.

This establishes identity preservation for these fixtures and this pinned kernel only. Persistent naming through arbitrary parameter edits, face splits/merges, Booleans on drafted boxes, cross-kernel upgrades, and OCAF document persistence are untested. SVG visibility and hidden-edge handling remain approximate. This fixture format is not a production project-format decision; native save dialogs and crash-safe filesystem writes are not implemented.

## Offline execution and cost

The same engine module runs unchanged in the browser worker and sandboxed Electron renderer worker. The browser reruns after its HTTP server is stopped and network access is disabled. Electron runs the actual portable package with bundled app:// assets, no server, sandbox/context isolation enabled, renderer Node disabled, and HTTP(S) requests blocked. A public HTTPS host was not deployed; the browser evidence uses localhost secure-context rules and the service-worker cache.

| Runtime | Fetch + initialization | Full nominal case evaluation |
|---|---:|---:|
| Node | 5997.1 ms | 86.1–110.4 ms |
| Browser | 3299.3 ms | 84.5–118.0 ms |
| Offline browser | 3350.6 ms | 79.1–131.9 ms |
| Portable Electron | 3420.1 ms | 79.1–102.0 ms |

Each nominal timing includes construction, validation, identity/topology queries, serialization/reload, meshing, transform, and cleanup; it is not a bare constructor benchmark. These are single-machine measurements. The worker preserves UI responsiveness. Owned wrappers balance with no cleanup errors, but this does not prove absence of native leaks.

No new dependency cost: the unchanged OpenCascade.js 2.0.0-beta.b5ff984 payload remains 50,305,130 WASM bytes plus 404,584 loader bytes (50.71 MB; prior measured Brotli total 11.76 MB). WASM capacity is 100 MiB in these runs. Electron remains 45.3.0. The previously recorded LGPL texts, OCCT exception, provenance, and remaining release-license questions still apply; this follow-up does not complete a distribution-license audit.

## Recommendation and delivery

Retain this as evidence that planar B-rep construction can preserve the ordinary drafted Box semantics, external transform, semantic roles, SVG path, and offline browser/Electron codec. **Do not treat it as a drop-in replacement across the current accepted input range.** Before production work, the product owner should decide the allowable tiny-feature/tolerance policy and the treatment of the existing area/volume/large-coordinate guards. A subsequent isolated step can test that approved policy at its boundaries. No tolerance or functionality decision has been made for production here.

Run instructions: [README.md](README.md). Start the portable executable in portable/PrometheusCAD-Kernel-Prototype and select Run feasibility tests, then choose a drafted fixture. Keep its containing folder together.

- Final checks and all per-case results: [test-report.json](evidence/drafted-box/test-report.json).
- Node results: [node-results.json](evidence/drafted-box/node-results.json).
- Initial corrected-test evidence: [initial-failures.json](evidence/drafted-box/initial-failures.json).
- Read-only source oracle: [box-reference.mjs](tests/box-reference.mjs); generated comparison records: [drafted-box-reference.json](fixtures/drafted-box-reference.json).
- Delivery hashes: [delivery-integrity.json](evidence/drafted-box/delivery-integrity.json); production additions/removals check: [production-integrity.json](evidence/drafted-box/production-integrity.json).
- Visual evidence: [positive draft](evidence/drafted-box/drafted-default-origin-5.png), [negative draft](evidence/drafted-box/drafted-default-origin--5.png), [offset placement](evidence/drafted-box/drafted-default-offset-5.png).
- Original report and evidence remain unchanged: [REPORT.md](REPORT.md). Original authored files/tests were copied into baseline/feasibility-2026-11-11 before extension.
