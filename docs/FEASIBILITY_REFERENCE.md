# PrometheusCAD OpenCascade.js feasibility results

**Outcome: feasibility demonstrated for the isolated box-with-through-hole fixture. Production adoption remains a separate decision.**

Completed 11/11/2026, 4:50:53 PM America/New_York. The final integration run has **23 passing checks and 0 unexpected failures**. Each browser/Electron kernel suite reports **12 passing checks and one explicitly unsupported binding diagnostic**. Strict-CSP initialization is a reproduced failure, not a successful deployment configuration.

## Isolation and delivered artifacts

The prototype is outside the production project, at this report's containing directory. No production files, dependencies, manifests, or configuration were added or changed. SHA-256 comparison verified **20 existing files**, with zero changes, additions, or removals. See [production-integrity.json](evidence/production-integrity.json) and the original `production-before.json` manifest.

- Standalone browser page: `index.html`, served over HTTP/HTTPS.
- Shared kernel adapter: `engine.mjs`; worker initialization and RPC: `worker.mjs`.
- Runnable Windows x64 portable folder: `portable/PrometheusCAD-Kernel-Prototype/`.
- Executable: `PrometheusCAD-Kernel-Prototype.exe` inside that folder.
- Sample JSON/B-rep project: [kernel-fixture.json](evidence/kernel-fixture.json).
- Screenshots: [browser](evidence/browser.png), [transformed browser](evidence/browser-transformed.png), [offline browser](evidence/browser-offline.png), [Electron](evidence/electron.png).
- Instructions and dependency boundaries: [README.md](README.md).

## Dependency and environment

| Item | Selected/measured value |
|---|---|
| OpenCascade.js | `2.0.0-beta.b5ff984` |
| npm publication date | 2023-03-23T11:48:50.674Z |
| Package source gitHead | `15445938357138fd30f07a126a9bd874054af7d8` |
| OCCT source recipe revision | `bb368e271e24f63078129283148ce83db6b9670a` |
| OCCT source version header | 7.6.2 |
| Emscripten recipe version | 3.1.14 |
| Browser | Chrome 157.0.8103.39 |
| Electron | 45.3.0 |
| Node | v24.19.0 |
| OS | Windows_NT 10.0.26200, x64 |
| CPU | Intel(R) Core(TM) i5-10310U CPU @ 1.70GHz; 8 logical processors |

The OCCT/Emscripten values come from the exact package source commit's build recipe and OCCT header, not from an available runtime version function. Current OCCT 8.x C++ documentation must not be treated as the selected binding's API contract. The shipped declaration file and actual WASM calls were used instead.

| Runtime artifact | Uncompressed bytes | gzip level 9 bytes | Brotli quality 5 bytes |
|---|---:|---:|---:|
| JS loader | 404584 | 65149 | 60826 |
| WASM | 50305130 | 13859568 | 11695472 |

The runtime JS+WASM is **50.71 MB uncompressed**, or **11.76 MB** with the measured Brotli setting. This differs from the older documentation's 9.1 MB estimate. Compression was measured offline; the prototype server sends uncompressed assets. Declaration files are not runtime assets. The complete portable directory, including Electron and all runtime files, measures approximately **424.38 MB**. See [artifact-measurements.json](evidence/artifact-measurements.json) for sizes, hashes, integrity, and machine details.

## Geometry, transforms, topology, and display

The fixture constructs a 2 x 1 x 1 inch box at X0 Y0 Z0 using PrometheusCAD's bottom-center placement convention. A radius-0.25 cylinder starts below the box and extends above it, avoiding coincident end caps. A real B-rep Boolean cut produces one valid solid with **7 faces, 15 edges, and 10 vertices**.

- Expected volume: `2 - pi * 0.25^2 = 1.803650459150638` cubic inches.
- Kernel volume: `1.8036504591506377` cubic inches.
- Absolute error for this analytic fixture: `2.220446049250313e-16` cubic inches. This single result is not a general accuracy guarantee.
- Original box: six faces, twelve edges, eight vertices; volume agrees with 2 cubic inches.
- Bounds remain [-1,-0.5,0] to [1,0.5,1].

Translation, origin-axis rotation, reflection, and their composition pass kernel-versus-display comparisons. Kernel-transformed vertex sets match applying the existing row-major affine convention once to display vertices. Mirrored solids remain valid with positive volume. The independently stored matrix survives project round trips.

The prototype's projection and affine helpers were compared against the actual pure functions extracted read-only from production `main.js`. Projection was checked at twelve point/camera combinations, including positive/negative/near-edge-on pitch. Maximum measured numerical discrepancy was zero. No production script was imported into the harness DOM.

The default display mesh contains 268 triangles. Independent coarse/fine remeshing changes the result from **268 to 908 triangles**. All triangles retain their source B-rep face IDs; the mesh leaves the bore center open on both top and bottom. Signed mesh volume agrees with exact volume within the test's separate, approximate display tolerance.

SVG renders visible triangles as a single compound path per source face. This removes internal antialias cracks and preserves whole-face picking. Source topological edges are sampled and stroked separately; no triangle edges are stroked. An independent Z0 reference is rendered alongside the solid and never enters the kernel.

Depth ordering, hidden edges, and periodic seam display remain reference-renderer limitations. The prototype does not establish production-quality occlusion, silhouettes, or suitability for large triangle counts.

## Face/edge identity and serialization findings

The current application's front face is Y-min. The actual OCCT `MakeBox.FrontFace()` returns X-max. The fixture explicitly maps roles in local model coordinates instead of copying kernel getter names.

Boolean history was exercised: the four side faces remain unchanged; the top and bottom report modified descendants, with generated topology also present. The test checks those descendants against the expected roles.

Persistent fixture IDs are stored in a naming sidecar keyed by surface/curve type, area/length, centroid, and exact bounds rounded to a fixed comparison precision. Duplicate or unresolved matches are rejected. All seven face IDs and fifteen edge IDs survive remeshing and a B-rep reload in a fresh worker, including browser/Electron exchange.

**This signature strategy is proven only for this fixture and selected build.** It is not a general persistent-topological-naming solution. Arbitrary symmetric shapes, parameter edits, face splits/merges, destructive transform naming, cross-version migration, and OCAF document persistence are not validated.

The JSON fixture format stores a B-rep text payload, plain metadata, local identities, and the external affine matrix; it stores no live wrappers or mesh cache. Display units are set to metric while canonical geometry remains inch-based. `BRepTools.Write_4` excludes triangulation, and `Read_2` restores the exact geometry from Emscripten MEMFS.

The B-rep payload is 3456 bytes. Compact JSON is 8179 bytes; the readable download is larger because of indentation. A fresh worker reconstructs the shape and regenerates its mesh. Unsupported versions, corrupt B-rep payloads, and ambiguous identities are rejected. The UI negative-open test verifies the previously loaded project remains unchanged.

Browser download and file-input loading were exercised. Browser-created projects loaded in Electron and Electron-created projects loaded in the offline browser. These are codec/worker exchange tests; native desktop file dialogs, overwrite behavior, crash-safe filesystem writes, and production Undo integration are outside this prototype.

## Offline and desktop execution

The browser test first caches all required local assets, closes the HTTP server, enables browser network-offline emulation, reloads, and reruns the geometry suite. It succeeds with the same JS/WASM files. This demonstrates static-site-compatible offline execution under localhost's secure-context allowance; no public HTTPS hosting service was deployed or tested.

The Electron test runs the actual copied portable folder, with `app.isPackaged === true`, no HTTP server, and a bundled `app://` origin. HTTP(S) requests are denied by its session. Renderer Node integration is off, context isolation and sandboxing are on, and no renderer filesystem bridge is needed for kernel operation. Automated native capture uses a hidden/offscreen window; normal launch opens the ordinary prototype window.

The module-based browser harness fails when directly opened using `file://`. Chrome blocks module loading from the null origin. This does not affect the tested cached HTTP browser path or Electron application protocol. It also says nothing adverse about the existing classic-script production app, which was not changed.

## Initialization and performance

| Measurement | Browser | Offline browser | Electron |
|---|---:|---:|---:|
| Fetch + kernel initialization | 3344.6 ms | 3318.6 ms | 4266.7 ms |
| Fixture Boolean cut (warm path) | 35.0 ms | 36.5 ms | 37.3 ms |
| Coarse mesh + display extraction | 24.0 ms | 31.0 ms | 25.4 ms |
| Fine mesh + display extraction | 53.1 ms | 56.4 ms | 54.9 ms |
| Repeat fixture cycles | 50 | 3 | 50 |
| Repeat-cycle total | 2249.9 ms | 168.6 ms | 2472.7 ms |
| Main-thread maximum heartbeat gap during suite | 17.2 ms | 17.1 ms | 17.1 ms |

Node initialization measured 5551.1 ms. These are single-machine observations, not latency guarantees or internet-download benchmarks. The Boolean timing excludes initialization and is taken after an earlier fixture has warmed the runtime. Mesh timing includes per-face metadata and edge extraction, so it is not a pure OCCT mesher benchmark.

WASM linear-memory capacity was 104,857,600 bytes (100 MiB) and did not grow during the repeat tests. Each 50-cycle browser/Electron suite tracked 70469 owned wrappers created and disposed, with zero cleanup errors. This does not measure all native live allocations or prove leak freedom; a longer allocator/process-memory profile remains necessary before adoption.

The worker isolates heavy modeling from main-thread interaction. Caching avoids repeated downloads but does not eliminate the several-second initialization cost. A smaller, reproducible custom build and lazy 3D initialization are justified follow-up investigations, not changes made to the production app.

## Failed tests, unsupported bindings, and corrections

| Observation | Result / disposition |
|---|---|
| Strict CSP without JavaScript unsafe-eval | **Fails initialization**, even with wasm-unsafe-eval allowed. Retained as an adoption gate. The normal isolated harness permits unsafe-eval; the vendor loader is unmodified. |
| `Bnd_Box.Get(double&, ...)` numeric outputs | **Unsupported as usable JS outputs**: passed values remain zero. `CornerMin()/CornerMax()` return usable point objects and are used instead. Similar reference-output signatures require individual review. |
| `Standard_Version` | **No exported binding** in this artifact. Provenance uses pinned metadata/recipe/header instead. |
| Direct file:// browser launch | **Fails** module/CORS loading in tested Chrome. HTTP/HTTPS plus cache, or Electron app://, are required for this harness. |
| One SVG element per triangle | Initial visual inspection showed antialias seams despite no strokes. Corrected by painting a compound path once per B-rep face. |
| First copied Electron executable | Stock `electron.exe` reported isPackaged=false despite loading resources/app. Corrected by naming the packaged executable; final isPackaged=true. |
| First hidden Electron screenshot | Playwright capture timed out. Corrected by hidden/offscreen rendering and Electron native capture; final capture succeeds. |
| Initial coarse/fine test | Both resolutions produced 268 triangles because the angular criterion dominated. Strengthened the fine linear tolerance and assertion; final result is 268 versus 908. |
| Initial API probe | Unsuffixed map.Clear was not present. The binding exposes Clear_1/Clear_2; the adapter creates scoped maps instead. This is an overload-name mismatch, not absence of topology mapping. |
| Test-runner edit | A duplicate local variable caused a syntax-check failure during test development; corrected before the final complete run. |
| Sandboxed local browser launch | Initial environment denied localhost networking; the authorized isolated test run completed outside that restriction. This was an execution-environment issue, not a kernel defect. |

The first integration failures are retained in [integration-first-run.json](evidence/integration-first-run.json). Strict-CSP and file-origin failures are retained separately in [strict-csp.json](evidence/strict-csp.json) and [file-url.json](evidence/file-url.json). No vendor patch or production workaround was introduced to hide these limitations.

## Final integration checks

| Check | Result |
|---|---|
| projection-contract-matches-production-source | pass |
| affine-contract-matches-production-source | pass |
| strict-csp-gap-reproduced | pass |
| browser-kernel-suite | pass |
| browser-owned-wrapper-cleanup | pass |
| browser-ui-responsive-during-worker-suite | pass |
| svg-face-picking | pass |
| svg-face-grouping-and-separate-edges | pass |
| browser-download-project | pass |
| ui-invalid-open-preserves-existing-project | pass |
| ui-file-open | pass |
| fresh-worker-brep-reload | pass |
| browser-offline-assets-cached | pass |
| browser-offline-with-http-server-stopped | pass |
| electron-packaged-local-offline-suite | pass |
| electron-sandbox-and-isolation | pass |
| electron-no-renderer-node-api | pass |
| browser-project-opens-in-electron | pass |
| electron-project-opens-in-offline-browser | pass |
| electron-native-capture | pass |
| no-unexpected-browser-runtime-errors | pass |
| no-unexpected-electron-runtime-errors | pass |
| production-files-unchanged | pass |

The strict-CSP check above passes because it successfully reproduces the documented failure. It does not mean strict-CSP initialization works.

## Kernel-suite detail (browser run)

| Check | Result | Elapsed ms |
|---|---|---:|
| required-bindings | pass | 0.1 |
| box-validity-volume-bounds-and-identities | pass | 128.4 |
| boolean-through-hole-and-history | pass | 98.5 |
| coarse-fine-mesh-and-face-ownership | pass | 108.0 |
| display-mesh-open-bore-and-outward-winding | pass | 0.9 |
| transform-translation-kernel-versus-display | pass | 112.4 |
| transform-rotation-kernel-versus-display | pass | 97.5 |
| transform-reflection-kernel-versus-display | pass | 90.4 |
| transform-composition-kernel-versus-display | pass | 86.8 |
| brep-json-roundtrip-no-mesh-or-live-handles | pass | 84.6 |
| invalid-project-and-ambiguous-identities-rejected | pass | 12.1 |
| primitive-reference-output-binding-limit | unsupported | 0.7 |
| owned-object-cleanup-and-repeatability | pass | 2250.0 |

Corresponding raw runs: [browser](evidence/browser-results.json), [offline browser](evidence/offline-browser-results.json), [Electron](evidence/electron-results.json), [Node](evidence/node-results.json), and [complete integration report](evidence/test-report.json).

## Recommendation and remaining gates

The experiment establishes that an exact B-rep kernel can live behind plain solid records and feed the current SVG projection model, with the same core implementation offline in browser and Electron. This supports continuing investigation without reorganizing the 2D application.

Before any production integration, review separate, small proposals for:

1. A reduced/reproducible build that resolves the unsafe-eval requirement, fixes all source revisions, and completes the distribution license/source plan.
2. Positive/negative signed-draft construction matching existing Box semantics, including collapse rejection.
3. Persistent naming beyond the fixture, including splits/merges and deliberate ambiguity handling.
4. Longer memory/performance testing and tolerances on representative shop geometry.
5. A reviewed native project schema and history/cache ownership strategy; arbitrary B-rep handles must stay out of JSON snapshots.

General OCAF persistence, arbitrary affine scaling/shear, STEP interchange, other browsers/operating systems, production 2D regressions, large assemblies, and production renderer occlusion were not tested. No claim of those capabilities is made by the passing fixture.

Licensing provenance and unresolved transitive-source questions are recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
