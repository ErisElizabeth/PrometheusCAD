# Native project format, schema 1

This checkout had no working native project codec before integration; File Open/Save were inert placeholders. No preexisting native file format was found. The new .pcad file is UTF-8 JSON:

- format: PrometheusCAD; schemaVersion: 1; canonicalUnits: inch.
- displayUnits: inch or metric (the application's existing document-unit names).
- document: ordinary entities, identifiers/counters, layers, current layer, and model3d solids.
- geometryAssets: immutable assets keyed by SHA-256 of canonical JSON with sorted object keys.

A kernel solid retains id, type, kind, layerId, definition, and external transform.matrix. Its geometry is {type: "opencascade-brep", assetId: "..."}.
The referenced asset stores schemaVersion, backend, pinned kernelVersion, canonicalUnits, construction definition when available, B-rep text and a naming sidecar. B-rep is authoritative; triangulation and kernel handles are never serialized. Geometry asset version and kernel version are checked on reload. This is not a promise of cross-kernel-version compatibility.

The sidecar preserves Box roles bottom/top/front/right/back/left, e0–e11, and vertex/incidence metadata. Shared kernel handles establish construction correspondence. The tested geometric signatures restore IDs after exact B-rep reload and remeshing. Ambiguous identities are rejected. Identity through arbitrary parameter edits, splits/merges, or Booleans is not established.

## Compatibility and transactions

Legacy in-memory snapshot JSON (entities plus optional model3d/layers) is accepted as a compatibility import. Missing optional collections/counters get existing sensible defaults; legacy topology/geometry solids remain legacy solids. Their stored geometry is not converted to OCCT. The old provisional translation/rotation/scale representation still uses the existing transform migration.

The isolated prototype format PrometheusCAD-kernel-feasibility is intentionally not silently treated as a native project. Tests explicitly translate its fixture to the new asset envelope. Unknown native schema/kernel versions, missing assets, checksum mismatches, unresolved topology identities, malformed records and broken point references are rejected.

Open stages validation and kernel reconstruction before changing the document, geometry registry, units or history. Concurrent document edits cancel an outstanding open. A successful open replaces the document, clears undo/redo, keeps the existing canonical clipboard, and regenerates display data. Selection and active tool reset use the established snapshot restore. View/camera preferences remain session state; they are not saved in schema 1.

## History and memory

All history snapshots and clipboard records contain small asset references. Exact payloads are held once in the adapter registry. Copies and transformed solids share an asset; transforms remain separate. The registry retains assets reachable from the current document, both bounded 100-entry history stacks, and clipboard. Unreachable assets are collected during rendering; derived meshes are retained only for current-document solids. No live OCCT wrappers leave the worker; each operation disposes its scoped wrappers.

This avoids repeating B-rep payloads in each snapshot. It does not make 100 distinct geometry versions free. Large Boolean models, native allocator behavior and long-session process memory still require profiling. Current tests verify reference sharing, history bounds, clipboard behavior, cache regeneration and balanced owned wrappers, not comprehensive leak freedom.

## File I/O

Browser Save/Save As downloads JSON; Open uses the existing menu with a file input. Neither requires a server-side service. Desktop uses a narrow sandboxed preload/IPC bridge and native dialogs. A candidate file becomes the active save destination only after application validation succeeds. Saving writes a uniquely named sibling temporary file, syncs/closes it, and renames it over the target; failure leaves the current document intact. This is not a guarantee of power-loss durability on every filesystem.

Desktop regression tests bypass the OS file chooser with an integration-local path, while exercising actual bridge/file I/O and close/relaunch. Interactive dialog usability and power-loss testing remain manual release checks.
