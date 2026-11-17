# PrometheusCAD OpenCascade production integration: internal development results

**Kernel-backed Box modeling now works inside the real application, with browser/offline and portable Electron persistence. This is an internal integration build; public-release requirements remain open.**

Authorized repository: C:/Users/S. Jones/Desktop/PrometheusCAD-Integration. Branch: feature/opencascade-integration. Root, branch and clean tree were verified before edits. No branches were switched, merged or pushed. SHA-256 checks confirm all 20 protected-original files and 183 reference-prototype files remain unchanged. The original-project check also verifies additions/removals.

## Architecture and working behavior

- The real Box command retains its original finite/dimensional/placement/draft validation, then asynchronously builds an exact planar OCCT B-rep. It commits one ordinary solid/history action only after validation succeeds. Cancellation, active-layer/document changes, and worker failure cannot insert a late result.
- New solids reference immutable, content-addressed exact assets. B-rep is authoritative; meshes are regenerable caches. No kernel handles enter application records, project JSON, history or clipboard. The worker disposes scoped wrappers after each operation.
- Existing row-major transforms and camera/projection helpers apply once to display data. Translation, rotation, reflection, copying, selection, layers and undo/redo operate on the established records. Legacy topology solids remain supported without automatic conversion.
- SVG paints each visible source face as one compound path and strokes actual geometric edges separately. Curved trimmed geometry, an open bore, and real whole-face pointer selection pass. The display chord target is 0.0005 inch; visibility/depth sorting remain approximate.
- File Open/Save/Save As now use the portable schema-1 .pcad JSON/B-rep envelope. This checkout previously had inert native-file placeholders, not an implemented native format. Legacy in-memory snapshot JSON is accepted; the isolated prototype format is not silently reinterpreted.
- Kernel startup is lazy and asynchronous. 2D works before initialization and after missing-WASM or strict-CSP failures. Browser execution uses local assets and a versioned offline cache; Electron uses the same code with a sandboxed local protocol and narrow native-file bridge.

The source contract confirms 543 legacy function bodies remain unchanged after line-ending normalization. Only nine existing functions changed at the documented integration points; no legacy functions were removed. This supports the regression evidence, not a claim of exhaustive verification of every 2D tool.

## Files and workflow

Complete added/modified list: [CHANGED_FILES.txt](CHANGED_FILES.txt). Main groups:

| Files | Purpose |
|---|---|
| main.js, index.html, style.css | Real Box transaction, shared rendering, registry retention and existing File controls; no interface redesign |
| modeling/adapter.js, worker.mjs, kernel.mjs, svg.js | Worker boundary, B-rep registry, exact construction/codec and derived face-owned SVG |
| project.js | Native envelope and structural validation |
| offline.js, sw.js, assets-manifest.json | Offline static assets; development cache bypass; updates wait for existing tabs |
| electron/, tools/ | Sandboxed desktop/native file I/O, static server, manifest generation, packaging and reporting |
| vendor/, third-party/, THIRD_PARTY_NOTICES.md | Pinned unmodified kernel payload, provenance, licenses and unresolved release obligations |
| tests/, package files, Git attributes, docs and README | Regression fixtures/evidence, reproducible tools, byte-stable assets and instructions |

Edit HTML/CSS/JavaScript directly and reload a Live Server or supplied static-server URL with ?dev=1. No bundler or application build is required. Rebuild the static manifest after runtime edits for cached deployment; portable packaging does that automatically. [README](../README.md) contains commands. The runnable Windows x64 folder is build/PrometheusCAD-Portable; launch PrometheusCAD.exe and keep its folder together. Build outputs, profiles and test scratch files stay in the integration repository and are Git-ignored.

## Test results

**146 automated checks pass; zero unexpected failures in the reviewed final results.**

| Suite | Passing checks | Scope |
|---|---:|---|
| Source preservation | 1 | 543 unchanged bodies; nine permitted integration edits |
| Legacy characterization | 7 | 2D drawing/text/dimensions/DXF, units, layers, shop math, history/clipboard and camera/legacy solids |
| Kernel adapter | 67 | 63 source cases, original reference suite, exact round trips, curved trim, invalid assets and wrapper disposal |
| Real browser application | 38 | 20 ordinary Boxes, metric input, rejection atomicity, SVG/selection, transforms/history, fresh-worker load, native file input, failure isolation and cache regeneration |
| Offline/portable | 33 | Cached browser with server stopped, camera gestures, fresh offline worker, file:// 2D, strict-CSP negative case, 20 Electron Boxes, native save/close/relaunch/edit, bidirectional exchange, packaging and protected-file checks |

The original reference kernel suite is retained separately: 14 pass, one unsupported binding diagnostic and one expected draft-boundary deviation. The outer passing checks explicitly verify these outcomes; they do not convert unsupported geometry into a success.

Final evidence: [source](../tests/evidence/unchanged.json), [legacy](../tests/evidence/characterization.json), [kernel](../tests/evidence/kernel.json), [application](../tests/evidence/application.json), [offline/Electron](../tests/evidence/portability.json). Visual evidence: [curved trim](../tests/evidence/curved.png), [offline](../tests/evidence/offline.png), [Electron](../tests/evidence/electron.png). Repeat with npm test.

During development, six persistence checks first failed because the static allowlist omitted project.js; corrected. Pointer-test setup also used local points for a transformed fixture, then a detached SVG node for screen conversion; corrected while retaining the hole/body and actual selection assertions. Initial failure snapshots remain in tests/evidence/initial-integration-failures.json and initial-pointer-test-failure.json. Early characterization API-name/DXF-scope assumptions were corrected against source before its baseline commit.

## Persistence and memory

The saved project survives download/native save, closing, a fresh page or Electron process, B-rep reconstruction, mesh regeneration, and subsequent transformation with undo/redo. Failed imports validate in staging and leave the document/history/exact registry intact. Desktop selects a save destination only after a candidate open succeeds. Native saves use a synced sibling temporary file and rename; power-loss durability and interactive dialog usability still require manual release testing.

History/clipboard store references, avoiding B-rep repetition in every snapshot. A 110-change stress sequence keeps the established 100-entry bound; two copied/transformed solids share one exact asset (1973 B-rep text bytes in that case), and neither history nor clipboard contains a B-rep payload. Assets are retained by current document, history and clipboard reachability; meshes are retained only for current solids. Distinct geometry revisions still consume memory. Balanced wrapper counts are not a native leak proof. [Format and lifecycle details](PROJECT_FORMAT.md).

## Numerical and unsupported cases

- All 20 ordinary signed-draft cases pass in the application and Electron. The source corpus contains 28 matching rejections. The 63-case comparison retains 62 matches and one compatibility deviation.
- The approximately 2e-9-inch top edge accepted by legacy Box fails MakeEdge e5 (error 3, BRepBuilderAPI_DifferentPointsOnClosedCurve). The application reports failure without changing requested dimensions or using a polygon fallback.
- Current policy preserves source guards and requires actual kernel validity, positive volume, expected topology and unambiguous identity. Coordinate/normal comparisons use 1e-8 tolerances; volume uses max(1e-12 in³, 1e-9 × reference magnitude). OCCT Confusion is 1e-7 inch, Angular 1e-12 radians.
- A proposed explicit future minimum edge of 1e-6 inch (10× Confusion), tested at 0.5×/1×/2×, would newly reject some legacy inputs and is not imposed here. Custom tolerance builds or coordinate scaling are unvalidated alternatives. [Policy and alternatives](KERNEL_INTEGRATION.md).
- Existing tiny-face/volume guards and cancellation-sensitive large-coordinate rejection are preserved. Bnd_Box.Get numeric output references remain unusable; CornerMin/CornerMax work. Standard_Version is unexported.
- Only Box creation is newly enabled. Parameter editing, production Booleans, generic topological naming after edits/splits/merges, OCAF and cross-kernel migration remain future work. SVG occlusion/hidden edges are approximate. Direct file:// browser kernel startup is unsupported; 2D remains available. Use cached HTTP(S)/localhost or portable Electron for kernel modeling.

## Dependencies and release requirements

OpenCascade.js is pinned to 2.0.0-beta.b5ff984, with original npm integrity and asset SHA-256 provenance. The unchanged loader/WASM total 50.71 MB; Node initialization in this run was 5455.3 ms. These small-fixture tests do not establish large-assembly performance or long-session allocator behavior. Electron 45.3.0 and Playwright Core 1.65.0 are locked development tools; no CDN, account, geometry service or runtime package manager is required.

The pinned recipe identifies OCCT 7.6.2 and Emscripten 3.1.14. LGPL notices, the OCCT exception and Electron/Chromium notices are retained. Separate WASM files do not by themselves establish LGPL compliance. Corresponding source/build delivery, unfixed historical transitive source revisions, full license inventory, practical replacement/relinking rights, signing and public-distribution review remain unresolved. The selected loader requires JavaScript unsafe-eval; the strict-CSP failure is explicitly tested. This build is not represented as legally ready for public distribution. [Notices](../THIRD_PARTY_NOTICES.md).

## Commits and next milestone

- 106ea34 test: characterize legacy CAD behavior before kernel integration
- 2b0bdb0 feat: add isolated OpenCascade worker and immutable B-rep adapter
- 02cc9a9 feat: integrate kernel Box modeling, SVG, native projects and offline desktop

The final report/evidence commit follows the implementation commits above; inspect git log on the authorized branch for its identifier.

**Recommended next milestone:** agree on a measurable tiny-feature policy, then add transactional Box parameter editing with B-rep regeneration, preserved role correspondence and undo/redo tests. Keep additional modeling commands as separately reviewed milestones.
