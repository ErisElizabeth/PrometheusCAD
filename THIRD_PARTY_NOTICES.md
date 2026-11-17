# Third-party components: internal integration build

This branch is a development integration. It is not approved for public distribution or represented as legally ready for release.

## OpenCascade.js and OCCT

OpenCascade.js is pinned to 2.0.0-beta.b5ff984, source commit 15445938357138fd30f07a126a9bd874054af7d8. Its package declares LGPL-2.1-only. License: third-party/OpenCascade.js-LGPL-2.1.txt and vendor/opencascade/LICENSE.
Exact artifact URL, SHA-512 npm integrity, asset SHA-256 values and sizes: vendor/opencascade/manifest.json. Vendor JS/WASM files are copied unmodified from the verified feasibility archive.

The exact build recipe points to OCCT commit bb368e271e24f63078129283148ce83db6b9670a; its Standard_Version.hxx reports 7.6.2. Runtime Standard_Version is unexported. OCCT uses LGPL 2.1 with an additional exception; the exception and pinned version header are retained in third-party/. The recipe identifies Emscripten 3.1.14.

Sources:
- https://github.com/donalffons/opencascade.js/tree/15445938357138fd30f07a126a9bd874054af7d8
- https://github.com/Open-Cascade-SAS/OCCT/tree/bb368e271e24f63078129283148ce83db6b9670a

The OCCT exception does not establish that all wrapper, library, or redistribution obligations are satisfied. Separate WASM files alone are not a completed LGPL compliance plan. Before public distribution, resolve corresponding-source delivery, build materials, modifications, practical library replacement/relinking rights, and all applicable notices. The historical recipe clones RapidJSON and FreeType without fixed revisions. The binary package is reproducibly identified; a reproducible source rebuild and complete transitive-source/license inventory remain open.

## Desktop and test tools

Electron 45.3.0 and Playwright Core 1.65.0 are pinned in package-lock.json. Tooling was copied locally from the prototype without modifying that prototype. npm ci uses the lockfile to reproduce the development tools; no runtime package manager or network is required by the application.
Electron's MIT license and Chromium multi-component notices must accompany the portable runtime and are retained by packaging. Playwright Core is test-only and excluded from runtime packaging.

## Existing assets

The application retains its bundled Atkinson Hyperlegible fonts and assets/OFL.txt. No existing asset license is replaced by the geometry-kernel notices.

## Deployment gates

The selected unmodified loader requires JavaScript unsafe-eval, in addition to wasm-unsafe-eval. Strict-CSP initialization without unsafe-eval is known to fail. Keep that explicit in deployment policy; do not silently claim a strict-CSP-compatible build. A reviewed custom kernel build can be a separate future milestone.
