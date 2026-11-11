# PrometheusCAD

**You draw. It solves.**

**Current version: V0.1.49 Alpha Dev Build**

PrometheusCAD is a portable 2D drawing, emerging 3D modeling, and shop-math utility for machinists, inspectors, hobbyists, and anyone who needs quick geometry without CAM bloat.

It is meant to be simple, useful, and portable.

No toolpath generation.  
No G-code.  
No machine setup.  
No subscriptions.  
No bullshit.

Draw simple 2D geometry, solve the annoying math, and eventually export DXF.

---

## V0.0.0 Alpha Dev Build

Bare Bones

The first visible build exists.

### Current status

- HTML/CSS/JavaScript project structure is in place
- Runs through Live Server in VS Code
- 16:9 SVG drawing canvas is visible
- Drawing surface uses **Surface Plate Gray**: `#a3a0a0`
- X and Y axes render through origin
- Half-inch and full-inch tick marks render along the axes
- Tick and axis lines are intentionally thick for early development visibility

### Current scope

GravyCAD is currently only a layout shell and drawing surface.

It does not draw entities yet.  
It does not save files yet.  
It does not export DXF yet.  
It does not solve shop math yet.

The surface plate exists.

---

## Planned tools

### Drawing

- Line
- Circle
- Arc
- Point
- Basic selection/editing
- Snap points
- Save/load native project files
- Export DXF

### Shop math

- Tangent Finder
- Bolt Circle Solver
- Drill Point Calculator
- True Position Checker
- Angle/length endpoint solver
- Triangle helper

---

## To-do list

1. **Inch/metric switch**

   Completed in V0.1.33. PrometheusCAD now treats this as `document units = inch / mm`; the stored geometry remains stable while inputs, readouts, dimensions, and exports are converted for the user.

2. **Layers**

   The layer foundation now supports creation, renaming, a current layer, locking, masking, and layer-aware geometry. Add layer deletion and any later layer-management refinements without changing the unit-neutral geometry model.

3. **Text**

   Native single-line text entities now support position, content, height, layers, whole-block selection, deletion, copy/paste, and undo/redo. Add text rotation and later editing refinements before converting text into geometry.

4. **Text → Geometry**

   Implement this only after Text itself is stable. This should be a conversion operation into lines, arcs, or another chosen geometry representation, consuming a known-good text entity rather than introducing a parallel text system.

5. **Select Region**

   Build window and crossing selection on the existing cumulative selection architecture rather than creating a second selection mechanism.

6. **Regular Polygon**

   Add a self-contained polygon tool with number of sides, size definition, and corner radius controls.

---

## What PrometheusCAD is

PrometheusCAD is:

- Easy 2D drawing
- Useful geometry
- Shop-floor trig
- Coordinate solving
- DXF export, eventually
- Portable by design

## What PrometheusCAD is not

PrometheusCAD is not CAM.

It will not generate toolpaths.  
It will not output G-code.  
It will not post-process for machines.  
It will not pretend to run your mill.

---

## Portability goal

Here. Have it.

No install. No cloud account. No subscription. No nonsense.

Run it from a folder, a jump drive, or wherever it does you good.

May it do ya fine.

## V0.0.2 Alpha Dev Build

Surface Plate and Menu Bones

Changes made since V0.0.1:

- Added a top menu bar with dropdowns for:
  - File
  - Edit
  - Draw
  - Dimension

- Commented out the older sidebar command buttons now represented in the menu bar.
  - Sidebar space is being reserved for future tool settings, entity info, and solver/results panels.

- Confirmed GravyCAD’s coordinate law:
  - X0 Y0 is where the axes cross.
  - X+ moves right.
  - Y+ moves up.
  - X+ Y+ is the upper-right quadrant.
  - Browser/SVG coordinate weirdness must be handled internally.

- Began accounting for SVG’s native downward-positive Y behavior.
  - GravyCAD’s user-facing coordinate system will follow machinist/CAD convention instead.

- Set the working UI font to Arial/Helvetica/sans-serif for maximum portability.
  - No external font download required.

- Confirmed the current drawing surface direction:
  - 16:9 canvas
  - Surface Plate Gray: `#a3a0a0`
  - X/Y axes through origin
  - Half-inch and full-inch tick marks
  - Thick temporary axis/tick lines for dev visibility

- Clarified early code cleanup habits:
  - `TEMP` for temporary build/test code
  - `SCRAP` for possibly reusable offcuts
  - `NFG` for obsolete code headed to the scrap barrel

Notes:

GravyCAD is still not drawing user-created geometry yet. This build is about application structure, visual layout, coordinate rules, and keeping the project’s machinist-first direction nailed down.

## V0.0.3 Alpha Dev Build

First Geometry: Point by Coordinates

Changes made since V0.0.2:

- Added the first real geometry entity: Point.
- Added a Point - Coordinates tool panel with separate X and Y inputs.
- The coordinate fields start at X0 Y0 so a new drawing can begin at origin.
- Pressing Enter or selecting Create Point adds the point to the drawing model.
- Added an in-memory document model as the foundation for future entities.
- Added point rendering on the SVG entity layer.
- Added live cursor coordinates in GravyCAD's X-right, Y-up coordinate system.
- Added a live entity count and active-command display to the status bar.
- Added Point - Sketch to the Draw menu as a disabled placeholder for later work.

Current limitation:

- Points exist only in memory and are lost when the page reloads.
- Selection, editing, undo/redo, snapping, and file saving are not implemented yet.

## V0.0.4 Alpha Dev Build

Point Coordinate Dialog

Changes made since V0.0.3:

- Replaced the permanent Point tool sidebar with a modal coordinate dialog.
- The dialog opens only from Draw > Point - Coordinates.
- Create adds one point and closes the dialog.
- Continue adds one point and keeps the dialog open for additional points.
- Cancel closes the dialog without creating a point.
- X0 Y0 remains the default coordinate pair on first use.

## V0.0.5 Alpha Dev Build

Floating Point Coordinate Window

Changes made since V0.0.4:

- Changed Point Coordinates from a modal dialog to a non-modal floating tool window.
- The drawing remains visible and interactive while the coordinate window is open.
- Added a draggable Windows-style title bar.
- Added Minimize, Maximize/Restore, and Close controls.
- Double-clicking the title bar also maximizes or restores the window.
- The window remembers its last normal position while it remains open.

## V0.0.6 Alpha Dev Build

Full Workspace Drawing Surface

Changes made since V0.0.5:

- Expanded the gray CAD drawing surface to fill 100% of the workspace below the menu bar and above the status bar.
- Removed the black padding and border around the drawing surface.
- Added automatic view-box fitting when the browser is resized.
- The visible coordinate range expands to fit the available aspect ratio without stretching or distorting geometry.

## V0.0.7 Alpha Dev Build

Point Marker Refinement

Changes made since V0.0.6:

- Replaced the yellow circle-and-crosshair point marker with a simple diagonal X.
- Set the point color to `#010b13`.
- Set each X diagonal to 0.15 drawing units, matching the diameter of the previous 0.075-radius yellow circle.

## V0.0.8 Alpha Dev Build

View Controls

Changes made since V0.0.7:

- Added a View dropdown menu.
- Added Zoom In and Zoom Out commands in 20% increments.
- Added Home to restore the current full-workspace view at 100%.
- Added the current zoom percentage to the status bar.
- Zooming remains centered on X0 Y0 and preserves equal X/Y drawing scale.

## V0.0.9 Alpha Dev Build

Constant-Size Point Markers

Changes made since V0.0.8:

- Point locations respond normally to changes in view scale.
- Point X markers compensate for the current zoom level so they retain the same visible size while zooming in or out.
- Point stroke thickness remains constant through SVG non-scaling strokes.

## V0.0.10 Alpha Dev Build

Single-Entity Selection

Changes made since V0.0.9:

- Added a Select dropdown menu with a Single command.
- Single selection mode allows one entity to be selected at a time.
- Hovering over a selectable entity changes it to `#000075`.
- Clicking an entity selects it and changes it to `#0000FF`.
- Clicking empty drawing space clears the current selection.
- Added a larger invisible hit target around points to make selection practical without changing the visible marker size.

## V0.0.11 Alpha Dev Build

Theme Menu Foundation

Changes made since V0.0.10:

- Named the existing GravyCAD appearance Granite.
- Added a Theme dropdown menu with Granite marked as the current theme.
- Added disabled placeholders for the planned Light, Dark, and Matrix themes.
- Theme switching and the additional color systems will be implemented in a later pass.

## V0.0.12 Alpha Dev Build

Matrix Theme

Changes made since V0.0.11:

- Enabled Matrix in the Theme dropdown while keeping Granite available as the default.
- Set the Matrix drawing background to `#050B06`.
- Set normal Matrix entities to `#00FF41`.
- Set hovered Matrix entities to `#85FF9E`.
- Set selected Matrix entities to `#00E5FF`.
- Set Matrix axes, tick marks, and future grid lines to `#0C1A0E`.
- Theme changes apply immediately to existing geometry and selection states.
- Light and Dark remain disabled placeholders for later passes.

## V0.0.13 Alpha Dev Build

Matrix Axis Contrast

Changes made since V0.0.12:

- Changed Matrix axes and tick marks from `#0C1A0E` to white (`#FFFFFF`).
- Added a faint layered `#00FF41` glow to Matrix axes and tick marks.
- Gave the Matrix axes a `0.75px` visible white core while preserving Granite's original line weight.
- Kept future Matrix grid lines at the original subtle `#0C1A0E`.
- Granite axes remain unchanged.

## V0.0.14 Alpha Dev Build

Theme Menu Dismissal

Changes made since V0.0.13:

- The Theme dropdown now closes immediately after choosing Granite or Matrix.
- The Theme button can reopen the dropdown normally after a selection.
- Moving away from the Theme menu resets its temporary dismissed state.

## V0.0.15 Alpha Dev Build

Light and Dark Themes

Changes made since V0.0.14:

- Enabled Light and Dark in the Theme dropdown with the same selection checkmark and auto-close behavior as Granite and Matrix.
- Light uses a `#FFFFFF` background, `#6B7280` axes, `#111827` entities, `#DC2626` hover, and `#2563EB` selection.
- Dark uses a `#1E2022` background, `#9CA3AF` axes, `#F9FAFB` entities, `#F87171` hover, and `#60A5FA` selection.
- Light and Dark axes use the visible `0.75px` line weight without a glow.
- Until dedicated grid colors are chosen, Light and Dark grid lines inherit their respective axis colors.

## V0.0.16 Alpha Dev Build

Line - Join

Changes made since V0.0.15:

- Added Draw > Line - Join for creating an exact line between two existing points.
- Added line entities to the geometry document model using references to their two endpoint point IDs.
- Lines are rendered independently from their stored geometry data and inherit the active theme's entity color.
- The Join command prompts for a first point and then a different second point.
- After the first point is chosen, a dashed live preview follows the cursor and snaps exactly onto a hovered point.
- The first endpoint is highlighted with the active theme's selection color while the command is in progress.
- Join prevents duplicate lines between the same two points.
- Escape cancels an active Join command.
- Join exits after creating one line and reports the new line in the status bar.
- Joined lines participate in Select > Single, including the active theme's hover and selection colors.

## V0.0.17 Alpha Dev Build

Delete, Undo, and Redo

Changes made since V0.0.16:

- Enabled Edit > Delete for the entity selected by Select > Single.
- Deleting a point also removes any lines joined to that point so the document never contains broken endpoint references.
- A single Undo restores a deleted point together with all of its joined lines.
- Enabled Edit > Undo and Edit > Redo with a 100-change in-memory history.
- Point creation, joined-line creation, and deletion are recorded as undoable document changes.
- Starting a new document change after Undo clears the redo history.
- Added Delete, Ctrl+Z, Ctrl+Y, and Ctrl+Shift+Z keyboard controls without intercepting normal editing inside coordinate fields.
- Edit commands enable and disable automatically based on selection and history availability.

## V0.0.18 Alpha Dev Build

Circle - Point Center & Radius

Changes made since V0.0.17:

- Added Draw > Circle - Point Center & Radius.
- The command uses an existing point entity as the exact circle center and a typed positive radius.
- Added a movable, minimizable, maximizable, and closable Circle tool window matching the Point Coordinates window behavior.
- The selected center point is highlighted and identified by point ID and exact coordinates in the tool window.
- Added a dashed, theme-aware live circle preview that updates as the radius is typed.
- Added circle entities to the geometry document model using a center point ID and numeric radius.
- Created circles inherit the active theme's entity, hover, and selection colors.
- Circles participate in Select > Single, Delete, Undo, and Redo.
- Deleting a center point also removes its dependent circles; one Undo restores the point and circles together.
- Escape, Cancel, and the window close button cancel the active Circle command.

## V0.0.19 Alpha Dev Build

Point - Intersecting

Changes made since V0.0.18:

- Added Draw > Point - Intersecting.
- The command selects two line or circle entities in sequence and creates one exact point at their intersection.
- Supports line-line, line-circle, and circle-circle intersections using finite line segments.
- The first entity remains highlighted while the command waits for the second entity.
- When two intersections are possible, the intersection nearest the second selection click is created.
- Parallel, separated, degenerate, overlapping, and coincident geometry is handled without creating an invalid point.
- An existing point at the chosen intersection is reused instead of creating a duplicate.
- Intersecting points are ordinary point entities and participate in selection, deletion, Undo, Redo, Join, and Circle commands.
- Escape cancels the active Intersecting Point command.

## V0.0.20 Alpha Dev Build

Continuous Geometry Commands

Changes made since V0.0.19:

- Line - Join remains active after a line is created and resets to selecting the first point for the next line.
- Point - Intersecting remains active after a point is created and resets to selecting the first line or circle for the next point.
- Circle - Point Center & Radius keeps its tool window open after creation and resets to selecting the next center point.
- The Circle command preserves the last entered radius to make repeated same-size circles fast.
- Duplicate Line and existing Intersecting Point results reset their commands for the next entity without ending the active method.
- Choosing another drawing or selection command cleanly ends the previous command and removes its temporary highlights or previews.
- Escape and the Circle window's Cancel or close controls still provide an explicit way to end the active command.

## V0.0.21 Alpha Dev Build

Modify Menu

Changes made since V0.0.20:

- Added a Modify dropdown to the main menu bar.
- Added Trim/Extend and Offset entries as the first Modify commands.
- These entries establish the menu structure for their geometry behavior in upcoming builds.

## V0.0.22 Alpha Dev Build

Offset

Changes made since V0.0.21:

- Implemented Modify > Offset for finite lines and circles; point entities cannot be selected as offset sources.
- Added a movable, minimizable, maximizable, and closable Offset tool window with a default amount of 0.25.
- Offset uses a two-click workflow: select the source entity, then click the desired side.
- Line offsets create a parallel line of equal length plus two visible endpoint points.
- A line and its generated endpoint points are recorded as one undoable document change.
- Circle offsets reuse the source circle's center point; clicking outside enlarges the radius and clicking inside reduces it.
- Inward circle offsets that would produce a zero or negative radius are rejected.
- Offset remains active after each successful creation and preserves the last entered amount for repeated work.
- Source entities use the active theme's selected color while waiting for the side click.
- Choosing another drawing, selection, or Modify command ends Offset; Escape, Cancel, and Close also end it explicitly.

## V0.0.23 Alpha Dev Build

Stable Status Bar and Entity Hover Information

Changes made since V0.0.22:

- Fixed the status bar to a single-line height so long command messages no longer move the drawing surface up and down.
- Long command messages are clipped with an ellipsis instead of wrapping.
- The bottom-right information slot temporarily shows a hovered entity's description and restores the current command message when the pointer leaves.
- Point descriptions show the point ID and exact X/Y coordinates.
- Line descriptions show the line ID and calculated length.
- Circle descriptions show the circle ID, center X/Y coordinates, and radius.
- Line and circle hit targets now support information hover even when Select or another geometry command is not active.

## V0.0.24 Alpha Dev Build

Trim/Extend

Changes made since V0.0.23:

- Implemented Modify > Trim/Extend for line source entities.
- The first click selects the source line; the end of the line nearest that click is the endpoint that will move.
- The second click selects the point, line, or circle to trim or extend to.
- Existing collinear point targets are reused as the line endpoint.
- A point target that is not on the source line reports: `Target point is not on the selected line.`
- Line targets use the apparent intersection of the two lines, and circle targets use the nearest valid intersection in the chosen endpoint direction.
- Computed intersections reuse an existing point at that location or create one visible endpoint point when needed.
- Each successful Trim/Extend operation is one undoable document change.
- Trim/Extend remains active after a successful operation so another source line can be selected immediately.
- Invalid targets leave the source line highlighted so a different target can be chosen.
- Escape or choosing another drawing, selection, or Modify command ends Trim/Extend.

Current limitation:

- At this build, a full circle could not yet be the source entity because the Arc entity model had not been added. This limitation is removed in V0.0.26.

## V0.0.25 Alpha Dev Build

Trim/Extend Direction and Source Selection Fix

Changes made since V0.0.24:

- Selecting a source line near one endpoint now keeps that endpoint fixed and moves the opposite endpoint to the target.
- For example, selecting an X0 Y0 to X2 Y2 line near X0 Y0 and trimming to X1 Y1 now produces the intended X0 Y0 to X1 Y1 line.
- Point hit targets are disabled while Trim/Extend is waiting for its first selection, so endpoint points no longer block selection of the line beneath them.
- Point hit targets are automatically restored after the source line is selected, allowing a point to be chosen as the second, target entity.
- Trim/Extend prompts now describe the first click as selecting the endpoint to keep.

## V0.0.26 Alpha Dev Build

Arc Entity and Circle Trimming

Changes made since V0.0.25:

- Added the first native Arc entity to the geometry document model.
- Modify > Trim/Extend can now use a full circle as its first, source entity.
- The location of the first click on the circle identifies the portion of the circle to keep.
- Selecting an intersecting line or circle as the second entity converts the source circle into an arc between the two intersections.
- Arc endpoints are ordinary point entities and reuse existing points when exact intersection points already exist.
- The circle-to-arc conversion and any generated endpoint points are recorded as one undoable document change.
- Arcs render with the active theme colors and participate in hover information, Select > Single, and Delete.
- Deleting an arc endpoint or center point also removes the dependent arc, preventing broken geometry references.
- A point or tangent target is rejected because trimming a full circle into a finite arc requires two distinct cut points.
- The Draw > Arc entry is disabled for now; additional standalone arc construction methods will be added later.

## V0.0.27 Alpha Dev Build

Point on Entity

Changes made since V0.0.26:

- Added Draw > Point - On Entity for creating exact points on lines, circles, and arcs.
- Added a movable, minimizable, maximizable, and closable Point on Entity tool window.
- Lines use a typed percentage from 0% to 100%.
- The line endpoint nearest the first click becomes the 0% endpoint; the opposite endpoint is 100%.
- A directionally ambiguous line click reports: `Point on Entity: Direction ambiguous; select the 0% endpoint.`
- During an ambiguous line choice, both existing endpoint points are highlighted as selected until the 0% endpoint is chosen.
- The direction-choice model also supports temporary endpoint markers that disappear after selection when persistent endpoint points are unavailable.
- Circles and arcs use typed degrees with 0° at 3 o'clock, 90° at 12 o'clock, 180° at 9 o'clock, and 270° at 6 o'clock.
- Arc degree placement uses the arc's underlying full circle, so a point can be created at an angle outside the visible arc without extending or modifying the arc.
- Existing points at the calculated location are reused instead of duplicated.
- Point on Entity remains active after creation and resets to selecting the next entity.

## V0.0.28 Alpha Dev Build

DXF Export

Changes made since V0.0.27:

- Implemented File > Export DXF as a direct browser download named `GravyCAD.dxf`.
- Exports the geometry document model rather than SVG screen coordinates, so zoom and display orientation do not affect the result.
- Uses the broadly compatible ASCII DXF R12 format (`AC1009`).
- Exports GravyCAD points as DXF `POINT` entities on a `POINTS` layer.
- Exports lines, circles, and arcs on a `GEOMETRY` layer.
- Arc start and end angles retain GravyCAD's counterclockwise CAD orientation.
- Includes drawing extents and marks the drawing as English measurement; coordinate values are intended as inches.
- Reports the number of exported entities in the status bar.
- An empty drawing reports that there are no entities to export instead of downloading an empty file.

## V0.0.29 Alpha Dev Build

Arithmetic in Dialog Fields

Changes made since V0.0.28:

- Numeric dialog fields now accept arithmetic expressions using `+`, `-`, `*`, `/`, parentheses, decimals, and unary positive or negative signs.
- Moving to another field with Tab or clicking elsewhere evaluates the expression and replaces it with the numeric result; for example, `3/2` becomes `1.5`.
- Arithmetic works in Point - Coordinates X/Y, circle radius, offset amount, and Point on Entity percentage/degrees.
- Pressing Create also evaluates an expression if the field has not yet lost focus.
- Radius and offset expressions must resolve to values greater than zero, and line percentages must still resolve between 0 and 100.
- Invalid expressions and division by zero are rejected with a dialog message.
- Expressions are parsed by GravyCAD's arithmetic parser without executing JavaScript code.

## V0.0.30 Alpha Dev Build

Fillet Radius

Changes made since V0.0.29:

- Added Modify > Fillet Radius for lines, circles, and arcs.
- Added a movable, minimizable, maximizable, and closable Fillet Radius tool window.
- The radius field supports the same arithmetic expressions as the other numeric dialogs and defaults to `0.25`.
- Added an Automatic Trim/Extend checkbox that is checked by default whenever the command is opened.
- The first and second click locations identify the intended portions of the two entities and guide selection among possible tangent fillet solutions.
- The tangent solver supports line-line, line-circle, line-arc, circle-circle, circle-arc, and arc-arc combinations using the entities' exact CAD geometry.
- Fillets are created as native Arc entities with ordinary center and tangent endpoint points.
- With Automatic Trim/Extend checked, the nearby endpoint of each selected line or arc moves to its tangent point.
- Full circles remain intact because a single tangent point does not by itself define which portion of a closed circle should be removed.
- With Automatic Trim/Extend unchecked, both source entities remain unchanged and the fillet must fit on their existing finite spans.
- Each completed fillet, including generated points and endpoint changes, is recorded as one undoable document change.
- Fillet Radius remains active after creation so another pair of entities can be selected immediately.

## V0.0.31 Alpha Dev Build

Rotate

Changes made since V0.0.30:

- Added Modify > Rotate for the entity currently chosen with Select > Single.
- Added a movable, minimizable, maximizable, and closable Rotate tool window.
- The angle is entered in counterclockwise degrees and accepts the same arithmetic expressions as the other numeric dialogs.
- Rotation defaults to the CAD origin at X0 Y0.
- A Specified point option lets the user choose any existing point entity as the rotation pivot.
- Rotating a point moves that point directly, so geometry that depends on it follows naturally.
- Rotating a line, circle, or arc gives only that selected entity rotated reference points, avoiding unintended movement of other geometry that shared its original points.
- Circle and arc radii remain unchanged; arc center and endpoint references rotate together.
- Exact quarter-turn rotations suppress floating-point noise near zero.
- Each completed rotation is recorded as one undoable document change.
- The selected entity remains highlighted, and the Rotate window stays open for repeated rotations of that entity.

## V0.0.32 Alpha Dev Build

Hexagon

Changes made since V0.0.31:

- Added Draw > Hexagon for creating regular six-sided geometry around an existing center point.
- Hexagons are oriented with their left and right flats parallel to the Y axis, producing points at the top and bottom.
- Hexagon size is entered as the exact distance across the vertical flats.
- Added an optional corner-radius field that defaults to `0` for sharp corners.
- A positive corner radius produces six tangent line segments and six native arc entities.
- Corner radii must be zero or greater and less than half the across-flats size.
- Both dimension fields accept GravyCAD arithmetic expressions and show a live dashed preview after the center point is selected.
- Added a movable, minimizable, maximizable, and closable Hexagon tool window.
- The generated points, lines, and optional arcs are recorded as one undoable document change.
- Hexagon remains active after creation and preserves the entered dimensions for repeated placement.
- Generated lines and arcs are ordinary GravyCAD geometry and are included automatically in DXF export.

## V0.0.33 Alpha Dev Build

Independent Hexagon Arc Selection

Changes made since V0.0.32:

- Hexagon vertices, tangent locations, and arc centers are now internal construction references rather than visible Point entities.
- Internal construction references are not selectable, included in the visible entity count, or exported as DXF `POINT` records.
- Each rounded hexagon corner remains an individual native Arc entity and each flat remains an individual Line entity.
- Select > Single now resolves clicks by distance to the actual CAD geometry instead of accepting whichever invisible SVG hit target is visually on top.
- Clicking the body of a short rounded corner selects the arc even when its old endpoint hit areas would have covered the entire curve.
- Hover highlighting and the bottom entity description use the same nearest-geometry result as selection.
- When multiple entities occupy the same exact location, repeated clicks at that location cycle through the available entities.
- Rotating a selected hexagon arc creates new internal center and endpoint references for that arc only; its neighboring flats and corner arcs remain unchanged.
- Unused internal construction points are removed automatically after rotation or deletion.

## V0.0.34 Alpha Dev Build

Points Flyout Menu

Changes made since V0.0.33:

- Reorganized the Draw dropdown so all point-construction methods are grouped under a single Points entry.
- Points opens a right-side flyout menu containing Coordinates, Intersecting, On Entity, and Sketch.
- The flyout opens when Points is hovered and closes when the pointer leaves both the Points entry and its flyout.
- Keyboard focus also keeps the flyout available for accessibility.
- Coordinates, Intersecting, and On Entity retain their existing commands and behavior.
- Sketch remains disabled as a placeholder for the next implementation pass.

## V0.0.35 Alpha Dev Build

Point - Sketch

Changes made since V0.0.34:

- Enabled Draw > Points > Sketch.
- Activating Sketch changes the drawing pointer to a plain crosshair.
- Clicking the drawing creates an exact Point entity at the CAD/world coordinate beneath the center of the crosshair.
- Sketch remains active after every point so multiple points can be placed continuously.
- Each sketched point is recorded as its own undoable document change.
- Undo and Redo preserve the active Sketch mode and its crosshair cursor.
- Clicking the exact location of an existing explicit point does not create a duplicate.
- Choosing another drawing, selection, or Modify command ends Sketch mode automatically.
- Escape explicitly cancels Sketch mode.

## V0.0.36 Alpha Dev Build

Line Flyout Menu

Changes made since V0.0.35:

- Reorganized the Draw dropdown so line-construction methods are grouped under a single Line entry.
- Line opens a right-side flyout containing Coordinates, Join, and Sketch.
- Join retains the existing continuous Line - Join command and behavior.
- Coordinates and Sketch are disabled placeholders for their upcoming implementation passes.
- The Line flyout uses the same hover, pointer-leave, and keyboard-focus behavior as the Points flyout.

## V0.0.37 Alpha Dev Build

Line - Coordinates

Changes made since V0.0.36:

- Enabled Draw > Line > Coordinates.
- Added a movable, minimizable, maximizable, and closable Line Coordinates tool window.
- The dialog provides Start X/Y and End X/Y coordinate fields.
- All four coordinate fields support GravyCAD arithmetic expressions and evaluate when focus leaves the field or a creation button is used.
- Create makes one exact line and closes the dialog.
- Continue makes one exact line and leaves the dialog open for additional coordinate lines.
- Cancel, Close, and Escape close the window without creating another line.
- Existing explicit points at the typed endpoints are reused; missing endpoints are created as ordinary visible Point entities.
- A coordinate line and any newly created endpoint points are recorded as one undoable document change.
- Zero-length lines and duplicate lines at the same coordinates are rejected.
- Choosing another drawing, selection, or Modify command closes the Line Coordinates window.

## V0.0.38 Alpha Dev Build

Independent Line Geometry

Changes made since V0.0.37:

- Lines now own hidden internal endpoint geometry instead of depending on visible Point entities.
- Deleting a visible point at a line endpoint leaves the line in place and unchanged.
- Line - Join and Line - Coordinates still use or create visible endpoint points for the normal CAD workflow, but those points can be edited or deleted independently afterward.
- Offset lines use the same independent endpoint model.
- Trim/Extend and automatic Fillet trimming preserve line independence when they replace an endpoint.
- Point on Entity treats a line's hidden endpoints as temporary direction choices, so its ambiguous-direction workflow remains usable.
- Existing in-memory lines that still reference a visible point are detached automatically if that point is deleted.
- Undo and Redo preserve both the line and its independent internal endpoints as one document state.

## V0.0.39 Alpha Dev Build

Line - Sketch

Changes made since V0.0.38:

- Enabled Draw > Line > Sketch.
- Line Sketch uses the same plain crosshair cursor as Point Sketch.
- The first drawing click creates or reuses a visible start point.
- Pointer movement after the first click shows a live dashed line preview.
- The second click creates or reuses the visible end point and completes the line.
- Sketched lines use private internal endpoint geometry, so either visible endpoint point can be deleted or rotated without changing the line.
- Zero-length and duplicate lines are rejected.
- After each completed line, Line Sketch stays active and waits for the first point of the next line.
- Escape or choosing another drawing, selection, or Modify command exits Line Sketch.
- Undo and Redo leave Line Sketch active and ready for a new first point.

## V0.0.40 Alpha Dev Build

Arc Flyout Organization

Changes made since V0.0.39:

- Replaced the disabled top-level Arc placeholder with a Draw > Arc flyout.
- Moved the existing Circle - Point Center and Radius command into the Arc flyout and labeled it Point Center.
- Moved Fillet from Modify into the Arc flyout and shortened its menu label from Fillet Radius to Fillet.
- Fillet now dismisses the Draw menu when activated from its new location.
- Added disabled Sketch Center and 3 Entities placeholders for upcoming arc-construction passes.
- Modify now contains Trim/Extend, Offset, and Rotate.

## V0.0.41 Alpha Dev Build

Circle - Sketch Center

Changes made since V0.0.40:

- Enabled Draw > Arc > Sketch Center.
- Sketch Center reuses the existing movable Circle radius window and arithmetic-capable Radius field.
- The drawing cursor becomes the same plain crosshair used by the other Sketch tools.
- Clicking the drawing creates or reuses a visible Point entity at the circle center.
- The selected center point is highlighted and a live circle preview reflects the entered radius.
- Create adds a circle of the defined radius centered on the sketched point.
- After creation, Sketch Center remains active and waits for the next center click.
- Cancel, Close, Escape, or choosing another tool exits the command.
- Point Center remains unchanged and continues to require an existing point.

## V0.0.42 Alpha Dev Build

Circle - 3 Entities / Apollonius Solver

Changes made since V0.0.41:

- Enabled Draw > Arc > 3 Entities for three distinct Point, Line, or Circle selections.
- Added a unified signed algebraic solver for the Problem of Apollonius instead of separate implementations for the ten classical input combinations.
- Points are represented as zero-radius circle constraints.
- Circle constraints enumerate internal and external tangency orientations.
- Line constraints use normalized signed distance equations, avoiding the incompatible quadratic terms produced by squaring a line-distance equation.
- Mixed point/circle/line problems reduce to two linear planes in `(x, y, r)`; their intersection is parameterized and substituted into one remaining quadratic equation.
- Three-line problems are solved directly as a signed 3-by-3 linear system.
- Candidate roots are checked against the original tangency equations, non-positive radii are discarded, and duplicate solutions are removed.
- Lines are treated as their infinite supporting lines, matching the stated Apollonius distance equation.
- Each selected entity is highlighted, and its exact mouse-click coordinate is retained.
- Candidate filtering calculates the exact tangency point for each source entity and minimizes the sum of the three squared click distances.
- Scores within `1e-6` of the minimum use the smaller candidate radius as the tie-breaker.
- The chosen result creates a visible center point and Circle entity as one undoable document change.
- 3 Entities remains active after creation and resets for another three selections; Escape or another tool exits it.

## V0.0.43 Alpha Dev Build

Overlay Drawing Scrollbars

Changes made since V0.0.42:

- Added always-visible horizontal and vertical scrollbars over the bottom and right edges of the drawing surface.
- The SVG drawing area retains its full width and height; the scrollbars overlay it instead of shrinking the canvas.
- A scrollbar remains gray and disabled until document geometry extends beyond the centered visible view on that axis.
- Points, independent Lines, Circles, and the actual swept bounds of Arcs contribute to the scrollable document bounds.
- Enabled bars support arrow-button steps, track page steps, draggable thumbs, and keyboard navigation.
- The scrollbar thumb size reflects the visible drawing span relative to the total required geometry span.
- Vertical scrolling preserves GravyCAD's coordinate law: Up moves toward Y+ and Down moves toward Y-.
- Zooming recalculates the visible and scrollable spans while preserving the current view center whenever possible.
- Home now restores both 100% zoom and the original X0 Y0-centered view.
- Deleting or undoing outlying geometry disables the unnecessary bar and safely returns that axis to the centered view.

## V0.0.44 Alpha Dev Build

View - Window

Changes made since V0.0.43:

- Added Window to the View dropdown between Zoom Out and Home.
- View is now ordered Zoom In, Zoom Out, Window, and Home.
- Window changes the drawing cursor to a plain crosshair and accepts a drag in any direction.
- A dashed selection rectangle previews the exact area that will become the new view.
- The dragged area is expanded around its center as needed to preserve the drawing canvas's aspect ratio without cutting off any enclosed area.
- Releasing the pointer centers and zooms the drawing to the aspect-matched window.
- Window is a one-shot view operation; the drawing command that was active beforehand remains available afterward.
- A click or undersized drag cancels safely without changing the view, and Escape cancels Window immediately.
- Selecting another menu command while Window is waiting cancels the Window operation.
- Window-created off-center views participate in the overlay scrollbar navigation until Home is chosen.
- Home clears the Window navigation anchor and restores the original X0 Y0-centered 100% view.

## V0.1.0 Alpha Dev Build

PrometheusCAD Rechristening

Changes made since V0.0.44:

- Renamed the application from GravyCAD to **PrometheusCAD** to reflect the project’s expanded scope.
- Advanced the project version from the V0.0.x development series to **V0.1.0**.
- Updated the browser title, application header, application metadata, source identity comments, and current README branding.
- Added the visible V0.1.0 version marker beside the PrometheusCAD name in the application header.
- Renamed exported drawings from `GravyCAD.dxf` to `PrometheusCAD.dxf`.
- Updated the DXF identification comment to record PrometheusCAD V0.1.0 as the producing application.
- Retained historical GravyCAD references inside earlier version notes so the development record remains accurate.
- Changed View > Window from a one-shot command into a persistent view action.
- After each successful Window zoom, the crosshair remains active and another zoom area can be dragged immediately.
- An undersized or interrupted drag leaves Window active; choosing another menu action or pressing Escape exits it.

## V0.1.1 Alpha Dev Build

Layer and Help Menu Foundations

Changes made since V0.1.0:

- Added a Layer dropdown immediately after Dimension.
- Layer shows the current `Layer: 0` entry and a disabled New placeholder for future layer creation.
- Added a Help dropdown immediately after Layer.
- Added Help > About.
- About opens a compact movable window containing `PrometheusCAD V0.1.1` and `2026 eriselizabeth.com` on separate lines.
- `eriselizabeth.com` links to `https://eriselizabeth.com` in a new browser tab.
- About can be closed with its X button or Escape and remains inside the visible application area when the window is resized.
- Centralized the runtime application name and version so the browser title, header version marker, About text, DXF producer identity, and DXF filename use the same application identity.
- Updated the visible application version and metadata to V0.1.1.
- Added a right-aligned quick-tool strip to the menu bar using the PNGs in "Assets": Undo, Redo, Zoom In, Zoom Out, Zoom Window, and Calculator PNG artwork in that order.
- Each quick tool sits on a 28-pixel square `#D9DDDC` button with rounded corners, with Calculator occupying the far-right position.
- Wired the toolbar Undo and Redo buttons to the existing document-history commands; their enabled states mirror the Edit menu items.
- Wired toolbar Zoom In and Zoom Out to the existing 20% view commands.
- Wired toolbar Zoom Window to the persistent aspect-ratio-preserving Window command and added a pressed visual state while that command is active.
- Embedded the Calculator component directly from the `Calculator` folder without duplicating its implementation.
- Wired the toolbar Calculator button to open the existing scientific calculator in a movable window above the drawing canvas.
- The calculator opens centered over the drawing on first use, preserves its dragged position on subsequent openings, and restores from its minimized state when the toolbar button is used again.
- The Calculator toolbar button remains visually pressed while the calculator window is open and clears when its Close button is used.
- Removed the unused `Select All` item from the Edit menu.
- Reorganized the Select menu as All, Single, Chain, Layer, Points, Lines, and Arcs. Single retains its existing selection behavior; the other selection modes are disabled placeholders for future implementation.

## V0.1.2 Alpha Dev Build

Future Command Menu Foundations

Changes made since V0.1.1:

- Renamed the active File > Export DXF command to File > Export without changing its existing DXF export behavior.
- Added a disabled File > Import placeholder immediately above Export.
- Added disabled Modify > Mirror and Modify > Translate placeholders.
- Added disabled Draw > Rectangle and Draw > Bolt Hole Circle placeholders.
- Updated the application metadata, browser title, header, About window, and runtime identity to V0.1.2.

## V0.1.3 Alpha Dev Build

Bolt Hole Circle

Changes made since V0.1.2:

- Activated Draw > Bolt Hole Circle as a one-shot drawing command.
- Added a movable, minimizable, maximizable, and closable Bolt Hole Circle dialog.
- Added arithmetic-capable Bolt Hole Diameter, Number of Holes, and Hole Diameter fields.
- Defaulted the bolt hole diameter to `3.000`, the number of holes to `6`, and the hole diameter to `0`.
- Bolt hole circles are centered at X0 Y0, begin at CAD 0° on the positive X axis, and place the remaining positions counterclockwise at equal angular spacing.
- A zero hole diameter creates a point at each bolt-hole position; a positive hole diameter creates an independent circular entity at each position using half the entered diameter as its radius.
- Limited the hole count to a positive whole number no greater than 1,000 to prevent an accidental expression from creating an impractically large pattern.
- Records the complete pattern as one document-history action so one Undo removes the entire bolt hole circle.
- Closes the Bolt Hole Circle dialog after a successful creation; Cancel, Close, Escape, or choosing another menu command exits without creating geometry.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.3.

## V0.1.4 Alpha Dev Build

Rectangle

Changes made since V0.1.3:

- Activated Draw > Rectangle as a one-shot drawing command.
- Added a movable, minimizable, maximizable, and closable Rectangle dialog.
- Added arithmetic-capable X, Y, and Radius fields with defaults of `2.000`, `1.000`, and `0.250`.
- Treats X and Y as the rectangle's overall dimensions, anchors the lower-left corner at X0 Y0, and extends the geometry into positive X and positive Y.
- A zero radius creates four sharp, independent line entities.
- A positive radius creates four independent quarter-circle corner arcs and the nonzero independent side-line entities required between them.
- Allows a corner radius up to half of the smaller rectangle dimension; zero-length sides are omitted cleanly at the maximum radius.
- Uses hidden construction references so the lines and arcs remain individually selectable, deletable, rotatable, and otherwise modifiable.
- Records the entire rectangle as one document-history action so one Undo removes all of its geometry.
- Closes the Rectangle dialog after successful creation; Cancel, Close, Escape, or choosing another menu command exits without creating geometry.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.4.

## V0.1.5 Alpha Dev Build

Rectangle Center Location

Changes made since V0.1.4:

- Changed Rectangle placement from a lower-left X0 Y0 anchor to an explicit center location.
- Added arithmetic-capable Center X and Center Y fields, both defaulting to `0`.
- Retained X and Y as the overall rectangle dimensions and Radius as the common corner radius.
- Generates sharp and rounded rectangle geometry symmetrically around the entered center coordinate.
- Updated rectangle history descriptions and completion messages to include the chosen center.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.5.

## V0.1.6 Alpha Dev Build

Mirror

Changes made since V0.1.5:

- Activated Modify > Mirror as a hover flyout containing X Axis, Y Axis, and X and Y Axis commands.
- Added a Copy checkbox to the Mirror flyout, defaulting to unchecked.
- Mirror acts on the entity previously selected with the current Single selection mode.
- With Copy unchecked, the selected point, line, circle, or arc is reflected in place across the chosen axis or axes.
- With Copy checked, the source remains unchanged and a separately selectable mirrored entity is created and selected.
- Mirrored line, circle, and arc copies use independent hidden construction references so later modifications do not alter the source entity.
- Reverses reflected arc endpoints for single-axis reflections, preserving the original arc sweep instead of producing the complementary arc.
- Treats X and Y axis mirroring as a 180° reflection about X0 Y0 and retains the original arc orientation.
- Each Mirror or Mirror and Copy operation is recorded as one Undo/Redo history action.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.6.

## V0.1.7 Alpha Dev Build

Dimensioning Foundations

Changes made since V0.1.6:

- Activated Dimension > Linear, Diameter, Radius, and Angle as persistent drawing commands.
- Linear accepts either one line or two visible points and creates an aligned length dimension offset from the measured geometry.
- Diameter and Radius accept a circle or arc; the click position determines the leader direction.
- Angle accepts two lines. Clicking each line near the intended ray selects the smaller included angle at their infinite-line intersection.
- Parallel, collinear, degenerate, and zero-length geometry is rejected without changing the drawing.
- Added proper dimension graphics with extension lines, dimension or leader lines, arrowheads, upright measurement text, and theme-aware colors.
- Dimensions are document entities with stable IDs and participate in hover descriptions, Select > Single, Delete, Undo, and Redo.
- Dimension commands remain active for repeated placement until another command is selected or Escape is pressed.
- Dimension values and placement geometry are static snapshots in this first pass; later edits to the measured source geometry do not yet update an existing dimension automatically.
- R12 DXF export remains geometry-only and does not yet emit dimension annotations.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.7.

## V0.1.8 Alpha Dev Build

Dimension Selection Placeholder

Changes made since V0.1.7:

- Added Dimensions to the Select dropdown after Arcs.
- Kept Dimensions disabled, matching the current placeholder state of the entity-type selection commands while Select > Single remains the active selection method for dimension entities.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.8.

## V0.1.9 Alpha Dev Build

Cumulative Point Selection

Changes made since V0.1.8:

- Activated Select > Points.
- Select > Points selects every visible point while excluding hidden construction references.
- Added a cumulative selection set so category-based selections can be combined without clearing entities selected by an earlier category command.
- Selected points use the same theme-aware selected color as entities chosen with Select > Single.
- Select > Single retains its one-at-a-time behavior: its next drawing click replaces the cumulative selection with the single chosen entity, while an empty click clears the complete selection.
- Existing commands that begin a drawing or modification operation still clear the complete selection wherever they previously cleared the single selected entity.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.9.

## V0.1.10 Alpha Dev Build

Deselect All

Changes made since V0.1.9:

- Added Select > Deselect All as the final command in the Select dropdown.
- Deselect All clears every entity in the cumulative selection and immediately removes all selected highlighting.
- The active selection mode is preserved, allowing Select > Single to remain ready for another click after clearing the selection.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.10.

## V0.1.11 Alpha Dev Build

Cumulative Line Selection

Changes made since V0.1.10:

- Activated Select > Lines.
- Select > Lines selects every line entity in the document.
- Line selection is cumulative, preserving points and any other entities selected by earlier category-selection commands.
- Selected lines use the same theme-aware selected color as entities chosen with Select > Single.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.11.

## V0.1.12 Alpha Dev Build

Cumulative Arc and Circle Selection

Changes made since V0.1.11:

- Activated Select > Arcs.
- Select > Arcs selects every current arc and circle entity in the document.
- Arc and circle selection is cumulative, preserving points, lines, dimensions, and any other entities selected by earlier category-selection commands.
- Selected arcs and circles use the same theme-aware selected color as entities chosen with Select > Single.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.12.

## V0.1.13 Alpha Dev Build

Atkinson Hyperlegible Typography

Changes made since V0.1.12:

- Added the locally bundled `assets/AtkinsonHyperlegible-Regular.ttf` font through `@font-face` with no network dependency.
- Changed the application shell, menus, dialogs, inputs, buttons, status displays, scroll controls, and SVG dimension labels to Atkinson Hyperlegible.
- Updated the embedded calculator and its standalone demonstration page to use the same bundled typeface.
- Retained a generic sans-serif fallback for environments where the local font cannot be loaded.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.13.

## V0.1.14 Alpha Dev Build

Cumulative Dimension Selection

Changes made since V0.1.13:

- Activated Select > Dimensions.
- Select > Dimensions selects every linear, radius, diameter, and angle dimension currently in the document.
- Dimension selection is cumulative, preserving points, lines, arcs, circles, and any other entities selected by earlier category-selection commands.
- Selected dimension graphics and text continue to use the active theme's selected color.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.14.

## V0.1.15 Alpha Dev Build

Select All

Changes made since V0.1.14:

- Activated Select > All.
- Select > All selects every user-visible entity in the document regardless of type, including points, lines, circles, arcs, and all dimension types.
- Hidden construction-point references remain excluded because they are implementation details rather than visible CAD entities.
- The command uses the cumulative selection model, ensuring every visible entity is selected without disrupting selection-state consistency.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.15.

## V0.1.16 Alpha Dev Build

Circle by Coordinate Center

Changes made since V0.1.15:

- Added Draw > Arc > Coordinate Center immediately after Point Center.
- Coordinate Center opens the existing movable, minimizable, maximizable, and closable Circle tool window in coordinate-entry mode.
- Added arithmetic-capable Center X, Center Y, and Radius fields with defaults of X0, Y0, and radius 1.
- Create makes one circle and closes the dialog; Continue creates the circle and keeps the dialog open for additional coordinate-center circles.
- A visible center point is created at the entered coordinates when one does not already exist; an exact existing visible point is reused.
- The center point and circle are recorded together as one Undo/Redo history action.
- The command does not require a pre-existing center point or a drawing-canvas click.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.16.

## V0.1.17 Alpha Dev Build

Fit View

Changes made since V0.1.16:

- Added `View > Fit` as the final command in the View menu.
- Fit centers the viewport on all visible drawing geometry and dimensions, then scales the view so everything is visible.
- The fitted view preserves the drawing canvas aspect ratio and adds clearance around the drawing.
- Point-only drawings and geometry with zero width or height receive a useful minimum viewing area.
- Very large drawings can fit below the ordinary Zoom Out limit without altering the limits of the manual zoom commands.
- An empty drawing returns to the Home view.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.17.

## V0.1.18 Alpha Dev Build

Home and Fit Toolbar Buttons

Changes made since V0.1.17:

- Added Home and Fit buttons to the quick-tool toolbar between Zoom Window and Calculator.
- Used the supplied `assets/home.png` and `assets/fit.png` artwork with the existing square toolbar-button styling.
- Wired Home to restore the default drawing view.
- Wired Fit to center and scale all visible geometry and dimensions onto the canvas while preserving the canvas aspect ratio.
- Added accessible labels and tooltips for both controls.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.18.

## V0.1.19 Alpha Dev Build

Copy, Paste, and Cut

Changes made since V0.1.18:

- Reordered the Edit menu as Undo, Redo, Copy, Paste, Cut, and Delete.
- Copy stores all currently selected visible entities in PrometheusCAD's internal geometry clipboard.
- Paste creates independent duplicates at the original coordinates, preserves shared point relationships, and selects the newly pasted entities.
- Supporting points required by copied lines, circles, and arcs are duplicated as hidden construction references unless the point itself was selected.
- Cut copies and removes all selected entities as one Undo/Redo action while keeping unselected connected geometry unchanged.
- Added Ctrl+C, Ctrl+V, and Ctrl+X keyboard shortcuts outside text-entry fields and the calculator.
- Copy and Cut are disabled without a selection, and Paste is disabled until geometry has been copied or cut.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.19.

## V0.1.20 Alpha Dev Build

Additive Single Selection and Multi-Delete

Changes made since V0.1.19:

- Restored Select > Single as an additive one-entity-at-a-time selection mode.
- Each entity click adds that entity to the current selection instead of replacing earlier selections.
- Repeated clicks at overlapping geometry continue cycling through candidates and add each candidate as it is reached.
- Clicking empty drawing space still clears the complete selection.
- Edit > Delete and the Delete key now remove every currently selected entity as one Undo/Redo action.
- Deleting selected points keeps unselected connected lines unchanged by replacing their endpoint references with hidden construction points.
- Existing circle and arc dependency behavior is preserved when their defining visible point is deleted.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.20.

## V0.1.21 Alpha Dev Build

Directional Chain Selection

Changes made since V0.1.20:

- Activated Select > Chain as a persistent, cumulative selection tool for lines and arcs.
- Hovering a line or arc displays a constant-screen-size arrow showing the prospective chain direction.
- Moving across the opposite half of the entity reverses the arrow before selection is confirmed.
- Clicking follows endpoint-connected line and arc geometry in the confirmed direction.
- Closed continuous shapes are followed back to the starting entity and selected completely.
- Open chains stop at their free endpoint; chains stop before an ambiguous branch instead of choosing an arbitrary path.
- Endpoint connectivity is geometric, allowing independently stored lines and arcs with matching coordinates to chain together.
- Chain selections are added to any entities that were already selected, while clicking empty drawing space clears the selection.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.21.

## V0.1.22 Alpha Dev Build

Multi-Entity Mirror and Axis Correction

Changes made since V0.1.21:

- Mirror now operates on every currently selected entity as one Undo/Redo action.
- Made the axis transformations explicit: X Axis preserves X and negates Y; Y Axis negates X and preserves Y; X and Y Axes negate both coordinates.
- Mirror with Copy duplicates the complete selection and selects the mirrored copies.
- Shared point relationships within a mirrored selection remain shared instead of creating disconnected duplicates.
- Unselected geometry that shares a visible point with the mirrored selection is detached through a hidden construction reference so it remains unchanged.
- Added mirror support for linear, radius, diameter, and angle dimensions.
- Reflected arcs reverse their endpoint order when required so their visible sweep remains correct.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.22.

## V0.1.23 Alpha Dev Build

Multi-Entity Translate

Changes made since V0.1.22:

- Activated Modify > Translate for all currently selected entities.
- Added a movable, minimizable, maximizable, and closable Translate window with X and Y distance fields defaulting to zero.
- Added arithmetic expression support to both translation distance fields.
- Added an unchecked Copy option for producing translated duplicates while retaining the source geometry.
- X-only, Y-only, and combined X/Y translations are supported.
- Multiple selected points, lines, circles, arcs, and dimensions translate together as one Undo/Redo action.
- Shared point relationships inside the translated selection remain shared.
- Unselected geometry that shares a selected visible point is detached through a hidden construction reference so it remains stationary.
- Translate with Copy selects the newly created copies after the operation.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.23.

## V0.1.24 Alpha Dev Build

Future Line Commands

Changes made since V0.1.23:

- Added inactive Angle and Tangent placeholders to the Draw > Line flyout.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.24.

## V0.1.25 Alpha Dev Build

Line by Angle and Length

Changes made since V0.1.24:

- Activated Draw > Line > Angle as a persistent line construction tool.
- Added a movable, minimizable, maximizable, and closable Line - Angle window with arithmetic-capable Angle and Length fields.
- Point sources start the line at the selected point using the established axis orientation: 0° right, 90° up, 180° left, and 270° down.
- Circle and arc sources start the line at the entity center and use the axis orientation.
- Line sources start at the endpoint nearest the click location.
- Selecting a line enables Relative to options for using either the selected line's stored orientation or the global axis orientation.
- Added a live dashed preview of the resulting angled line.
- Created angle lines remain geometrically independent of their source entity and include visible endpoint points consistent with coordinate-created lines.
- Line - Angle remains active after creation so additional angled lines can be created until another command is chosen or the tool is canceled.
- Each created angled line is recorded as one Undo/Redo history action.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.25.

## V0.1.26 Alpha Dev Build

Tangent Lines by Angle

Changes made since V0.1.25:

- Activated Draw > Line > Tangent as a persistent line construction tool.
- Added a movable, minimizable, maximizable, and closable Line - Tangent window with arithmetic-capable Angle and Length fields.
- The entered angle locates the tangent point using the established orientation: 0° right, 90° up, 180° left, and 270° down.
- The specified line is perpendicular to the radius at that location and centered on the exact tangent point.
- Circles and arcs can be selected as tangent sources.
- Arcs are treated as complete hypothetical circles, allowing tangent angles outside the visible arc sweep without modifying the arc.
- Points are treated as zero-radius circles; the tangent line is centered on the point and oriented perpendicular to the entered radial angle.
- Added a live dashed preview of the resulting tangent line.
- Created tangent lines are geometrically independent from their source entity and include visible endpoint points.
- Line - Tangent remains active after creation so additional tangent lines can be created until another command is chosen or the tool is canceled.
- Each created tangent line is recorded as one Undo/Redo history action.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.26.

## V0.1.27 Alpha Dev Build

Future Point and Translate Commands

Changes made since V0.1.26:

- Added inactive End and Incremental placeholders to the Draw > Points flyout.
- Converted Modify > Translate into a hover flyout.
- Renamed the existing active Translate command to By Coordinates without changing its dialog or multi-entity behavior.
- Added an inactive By Points placeholder to the Translate flyout.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.27.

## V0.1.28 Alpha Dev Build

Layer Foundation

Changes made since V0.1.27:

- Replaced the placeholder Layer menu with a dynamic list of document layers and a ten-layer maximum.
- Added New to create and immediately select a new layer.
- Added a three-dot management flyout to every layer with Rename, Lock/Unlock, and Mask/Unmask commands.
- Existing geometry belongs to Layer 0, while newly created geometry belongs to the current layer.
- Only the current, unlocked, unmasked layer can be selected or edited; other visible layers remain as subdued drawing references.
- Masked layers are hidden from the drawing, the visible entity count, and Fit bounds.
- Copy can capture entities from the current layer, and Paste places independent copies on whichever layer is current at paste time.
- Identical Cartesian geometry can coexist on different layers without being merged by point or line reuse checks.
- Layer creation, renaming, locking, masking, and current-layer state participate in Undo/Redo snapshots.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.28.

## V0.1.29 Alpha Dev Build

Point at Entity End

Changes made since V0.1.28:

- Activated Draw > Points > End as a persistent point-construction command.
- Clicking a line places a point at whichever endpoint is closest to the click.
- Clicking an arc places a point at whichever arc endpoint is closest to the click.
- Clicking a circle places a point at its established 0° position at 3 o'clock.
- Existing visible points at the resolved location are reused instead of duplicated.
- Lines and arcs with hidden construction endpoints receive an independent visible point without changing their stored geometry.
- Point - End only works with geometry on the current unlocked and unmasked layer.
- Choosing another command or pressing Escape exits Point - End.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.29.

## V0.1.30 Alpha Dev Build

Incremental Point Translation

Changes made since V0.1.29:

- Activated Draw > Points > Incremental for translating one selected point by entered X and Y amounts.
- Added a movable, minimizable, maximizable, and closable Point - Incremental window.
- X and Y increments default to zero and support the existing arithmetic-expression behavior.
- Added an unchecked Copy option for creating an independent translated point while retaining the source point.
- Moving a point detaches unselected dependent geometry to hidden construction references so that the geometry remains unchanged.
- Incremental copies are created on the current layer and become the selected point after creation.
- The command requires exactly one visible point selected on the current unlocked and unmasked layer.
- Incremental moves and copies are each recorded as one Undo/Redo action.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.30.

## V0.1.31 Alpha Dev Build

Translate by Points

Changes made since V0.1.30:

- Activated Modify > Translate > By Points for one or more previously selected entities.
- Added a movable, minimizable, maximizable, and closable Translate - By Points window.
- The command captures the selected entities independently from its two reference points.
- Clicking a first and second visible point defines the translation vector as `second point - first point`.
- The dialog reports both reference points and the resulting X and Y translation distances.
- Entity proximity to either reference point has no effect; the complete X/Y vector is applied to every selected entity.
- Added an unchecked Copy option using the same independent-copy behavior as Translate > By Coordinates.
- Additional point clicks restart reference-point selection, allowing the vector to be corrected before applying it.
- Move and Copy operations use the shared translation engine, including multi-entity relationships, layer behavior, dimensions, and dependency detachment.
- Translate by Points operations are recorded as one Undo/Redo action.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.31.

## V0.1.32 Alpha Dev Build

Isometric Preview

Changes made since V0.1.31:

- Added a centered 3D button between the Help menu and the right-side quick-tool buttons.
- The button uses the existing square toolbar styling with black `3D` text and reverses to white text on a black background while active.
- Added a view-only isometric projection using a 45° Y-axis yaw and a 35.264° X-axis pitch.
- Entering Isometric fits all visible geometry to the canvas; an empty drawing uses an isometric Home view.
- Circles and arcs are projected with the rest of the SVG geometry, and visible geometry bounds are sampled before fitting.
- The axes and tick marks follow the isometric projection and are regenerated for the projected viewport.
- Isometric mode disables drawing-surface interaction and CAD mutation commands until the user returns to 2D.
- Clicking 3D again, or pressing Escape, restores the exact saved 2D center, zoom, viewport, and navigation anchor.
- The button exposes its active state with `aria-pressed` and updates its accessible label between Isometric and Return to 2D.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.32.

## V0.1.33 Alpha Dev Build

Inch and Metric Document Units

Changes made since V0.1.32:

- Added a Units dropdown between Layer and Help with Inch and Metric choices.
- Inch is the default document unit; the selected unit is marked in the dropdown and shown in the status bar.
- Geometry remains stored in a stable internal canonical scale rather than being repeatedly multiplied or divided when the unit changes.
- Metric coordinate, distance, diameter, and radius entries are interpreted as millimetres and converted to the canonical geometry scale at the input boundary.
- Switching units converts every populated length-entry field so existing dialog values retain the same physical meaning.
- Coordinate readouts, hover descriptions, command results, lengths, radii, diameters, and linear/radial dimensions display in the selected document unit.
- Angle, percentage, and count fields remain unitless and are not converted.
- Axis ticks change from half/full-inch intervals to 5/10 mm intervals in Metric mode.
- DXF export now writes coordinate and radius values in the selected document unit and sets `$MEASUREMENT` appropriately for Inch or Metric.
- Unit switching leaves entity geometry and the current viewport physically unchanged.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.33.

## V0.1.34 Alpha Dev Build

Two-Entity Linear Dimensions

Changes made since V0.1.33:

- Changed Dimension > Linear from the former one-line-length shortcut into a first-entity, second-entity workflow.
- Linear dimensions now measure the shortest distance between two distinct points, finite lines, circles, or arcs on the current editable layer.
- The first picked entity remains highlighted until the second entity is chosen.
- Pick locations resolve equivalent measurement positions while the numeric dimension remains the exact geometric distance.
- Touching or intersecting entities report a zero-distance condition instead of creating an unreadable zero-length dimension.
- Linear Dimension remains active after creation and returns to the first-entity step for another measurement.
- Each completed dimension remains an independent selectable entity with existing delete, copy/paste, layer, unit, and Undo/Redo behavior.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.34.

## V0.1.35 Alpha Dev Build

Forgiving Menu Hover Timing

Changes made since V0.1.34:

- Dropdown menus and nested flyouts now remain open briefly when the pointer drifts outside them.
- The default close delay is 500 milliseconds, and returning before the delay expires cancels the pending close.
- The same behavior applies to the dynamically generated layer-management flyouts.
- The delay can be tuned in one place near the top of `main.js` by changing `MENU_HOVER_CLOSE_DELAY_MS`.
- Choosing a command still dismisses its menu immediately.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.35.

## V0.1.36 Alpha Dev Build

Context-Aware Menu Hover Timing

Changes made since V0.1.35:

- Retained the 500-millisecond grace period when the pointer leaves a dropdown or flyout for the rest of the interface.
- Added a shorter 100-millisecond close delay when moving between dropdowns or between flyouts in the same dropdown.
- Kept both timing values together near the top of `main.js` as `MENU_HOVER_CLOSE_DELAY_MS` and `MENU_SWITCH_CLOSE_DELAY_MS` for easy adjustment.
- Returning to a menu before either delay expires still cancels its pending close.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.36.

## V0.1.37 Alpha Dev Build

Select Entities by Layer

Changes made since V0.1.36:

- Converted Select > Layer into a flyout populated from the document's current layer list.
- Every layer appears in the flyout, including Layer 0 when it is the only layer.
- Layer entries use the live layer name and therefore update immediately after a rename.
- Locked and masked layers remain visible for context but are disabled and cannot be selected.
- Choosing an available layer cumulatively selects all of its visible geometry and dimensions while excluding hidden construction-reference points.
- Selecting entities by layer does not change the current drawing layer or clear entities that were already selected.
- Empty layers report that no selectable entities were found and preserve the current selection.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.37.

## V0.1.38 Alpha Dev Build

Native Text Placement

Changes made since V0.1.37:

- Added an active Draw > Text command and a movable, minimizable, maximizable Text dialog.
- The dialog accepts a unit-aware Text Height arithmetic expression and single-line text content, defaulting to `0.250` and `Type text here...`.
- Valid text follows the pointer as a live preview with a temporary outer-bounds box and bottom-center insertion point.
- One drawing click places the text at the insertion point and removes the temporary placement aids.
- Text is stored as a native document entity rather than line/arc geometry and is therefore not included in DXF geometry export yet.
- Each text block participates in the current layer, drawing bounds, Fit view, scroll extents, hover descriptions, cumulative selection, deletion, copy/paste, and Undo/Redo as one entity.
- Locked or masked layer behavior applies to text in the same way as the existing drawing entities.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.38.

## V0.1.39 Alpha Dev Build

Defined or Point-Centered Shapes

Changes made since V0.1.38:

- Converted Draw > Hexagon, Rectangle, and Bolt Hole Circle into flyouts with Point Center and Define Center commands.
- Point Center selects and highlights an existing point on the current editable layer before enabling shape creation.
- Define Center exposes unit-aware, arithmetic-capable X and Y coordinate fields in each tool's existing dialog.
- Added the missing coordinate-center workflow to Hexagon and the missing point-center workflow to Rectangle.
- Generalized Bolt Hole Circle from its former fixed X0 Y0 center so either an existing point or entered X/Y coordinates can locate the pattern.
- Bolt Hole Circle still starts its first hole at the established 0° direction from the chosen center.
- Geometry created from a Point Center uses the point's coordinates at creation time and remains independent if that source point is later deleted.
- Preserved each tool's existing size, radius, hole-count, layer, unit, arithmetic, history, and dialog-window behavior.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.39.

## V0.1.40 Alpha Dev Build

3D Mouse Navigation

Changes made since V0.1.39:

- Added interactive camera navigation to the existing 3D Isometric view without changing any entity coordinates or orientations.
- Left click cumulatively selects an entity; clicking empty drawing space clears the selection. The selection path is also prepared for future face and solid entity classes.
- Left drag performs directional region selection: left-to-right is a Window selection requiring full enclosure, while right-to-left is a Crossing selection that includes touched entities.
- Right drag orbits the camera after crossing a configurable five-pixel movement threshold. A stationary right click is reserved for a future context menu, and the browser's native context menu is suppressed in 3D mode.
- Orbit uses the center of the selected visible entities as its pivot, falling back to the center of all visible geometry and then X0 Y0 for an empty document.
- Middle-button drag pans in both the normal 2D view and the 3D view.
- The mouse wheel zooms toward the cursor position in both 2D and 3D instead of always zooming toward the canvas center.
- Escape cancels an in-progress orbit, pan, or region selection and restores the camera position from the start of that gesture. With no gesture in progress, Escape still returns from 3D to the saved 2D view.
- Kept the drag threshold, orbit sensitivity, pitch limits, and wheel zoom factor together near the viewport constants in `main.js` for easy adjustment.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.40.

## V0.1.41 Alpha Dev Build

Two Dimensional and Three Dimensional Workspace Architecture

Changes made since V0.1.40:

- Replaced the former view-only Isometric state with an explicit 2D or 3D workspace mode while preserving the saved 2D camera exactly when switching workspaces.
- The complete existing Draw menu remains unchanged in 2D and is replaced in 3D by a Model menu containing the planned Primitives, profile operation, and Boolean hierarchy.
- Box, Cylinder, Sphere, Cone, Extrude Profile, Sweep Profile, Revolve Profile, Union, Subtract, and Intersect are deliberately disabled roadmap commands rather than controls that appear active but do nothing.
- Kept Modify as a shared menu. Trim/Extend is hidden in 3D, face or surface Offset is explicitly disabled as planned work, and Translate by Points is disabled until native 3D reference points exist.
- Added a separate `model3d.solids` document collection with its own identifiers. The first rendering adapter accepts genuine XYZ boundary vertices, indexed faces, layers, and transforms rather than treating solids as projected 2D entities; the geometry payload remains open to a later analytic/B-rep or CSG kernel.
- Established profile independence as a document invariant: future Extrude, Sweep, and Revolve commands must copy evaluated profile geometry into a new solid, leaving the source 2D entities unchanged and recording any source reference as provenance only.
- Extended the camera projection from the original Z0 drawing plane to true XYZ points, while retaining the exact established projection for every existing 2D entity.
- Added a depth-sorted SVG face renderer and independent solid and face selection namespace. Click, Window/Crossing selection, hover feedback, selection coloring, and orbit pivots can now recognize future solid records.
- 3D Translate uses arithmetic-capable X, Y, and Z fields, retains Copy, supports multiple selected solids, and records one Undo/Redo action.
- 3D Rotate uses the same dialog with X, Y, and Z origin-axis choices and operates on every selected solid without changing the camera.
- 3D Mirror renames the choices to XY, XZ, and YZ planes, applies the conventional coordinate reflection, retains Copy, and preserves face winding after reflection.
- Copy, Paste, Cut, Delete, Undo, and Redo now use the active workspace and keep 2D entities separate from 3D solids.
- View Zoom In, Zoom Out, Home, and Fit now operate in both workspaces. View Window is disabled in 3D because left drag is reserved for Window/Crossing selection.
- Select keeps All, Single, and Deselect All in 3D while hiding 2D-only Chain, Layer, Points, Lines, Arcs, and Dimensions choices. The Dimension menu similarly shows a clear planned 3D placeholder instead of active 2D commands.
- No primitive creation command was activated in this architectural pass; the Model hierarchy now provides a stable place to add them one at a time.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.41.

## V0.1.42 Alpha Dev Build

Box Primitive

Changes made since V0.1.41:

- Activated Model -> Primitives -> Box as the first native 3D primitive and kept every other primitive and modeling operation outside this release.
- Added a movable, minimizable, maximizable Box dialog with arithmetic-capable Position X/Y/Z, Length, Width, Height, and Draft Angle fields. Defaults are X0 Y0 Z0, Length 2.000, Width 1.000, Height 1.000, and 0° draft in the current document units.
- Defined position as the center of the bottom face: Length follows X, Width follows Y, the bottom is at Z, and Height extends along positive Z.
- Implemented signed draft with a fixed bottom face. Positive draft slopes inward and negative draft slopes outward; the top dimensions are calculated as `bottom - 2 * height * tan(draft)`.
- Invalid, non-finite, zero-size, collapsed, and inverted results are rejected with an explanation. Geometry is never silently clamped.
- Each Box owns an analytic definition, a closed topological boundary with eight identified vertices, twelve connected edges, and six identified planar faces, and an independent affine transform matrix. The SVG display is derived from that solid topology rather than serving as the geometry source of truth.
- Stored stable bottom, top, front, right, back, and left face identities, stable edge identities, explicit face-edge connectivity, outward local-space normals and planes, closure validation, Euler characteristic, and signed volume for later face/edge operations.
- Creating a Box records exactly one Undo/Redo action, selects the complete new solid, fits it into the 3D view, and uses the current editable layer. Existing selection, hover, Copy, Paste, Cut, Delete, layer visibility/locking, and theme colors apply without a second 3D interaction system.
- Replaced the provisional translation/rotation/scale adapter with a 4x4 affine matrix. Existing 3D Translate, Rotate, and Mirror now transform the solid without rewriting its canonical topology; mirrored display winding is corrected at render time.
- Inch/Metric changes convert Box dialog values and all displayed dimensions while preserving the stored physical geometry.
- Existing 2D entities, drawing tools, selection, history, and saved 2D camera behavior remain independent and unchanged.
- Current limitations are deliberate: only Box creation is supported; face and edge identities can be selected/rendered but cannot yet be edited; there is no Cylinder, Sphere, Cone, Extrude, Boolean, 3D Fillet, or Chamfer; and the SVG renderer is a faceted reference renderer rather than a production modeling kernel.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.42.

## V0.1.43 Alpha Dev Build

Viewport-Aware Floating Dialogs

Changes made since V0.1.42:

- Reworked the Box dialog into a wider two-column layout with Position on the left and Dimensions on the right, without reducing text or input sizes.
- Added a responsive Box layout that stacks Position and Dimensions vertically whenever the dialog is manually narrowed or the available workspace becomes too narrow for two readable columns.
- Established one shared floating-window policy for every PrometheusCAD tool dialog: the adjustable `TOOL_WINDOW_MAX_WORKSPACE_HEIGHT_RATIO` constant defaults to `0.88`, limiting dialogs to 88% of the drawing workspace height.
- Tool title bars remain outside the scrolling region and dialog action rows remain sticky at the bottom, so Create, Continue, Apply, and Cancel controls stay available while oversized form contents scroll internally.
- Dialogs are fitted against the actual drawing workspace rather than only the browser viewport. Opening a dialog, resizing the browser, resizing a dialog, or completing a drag automatically brings the complete window back within accessible workspace bounds.
- Enabled native horizontal and vertical resizing for tool windows while preserving minimum readable dimensions, input widths, and text sizes. Maximized and minimized windows disable manual resizing until restored.
- Each dialog retains its most recent inline size and position for the current PrometheusCAD session; restored bounds are re-clamped whenever the current workspace is smaller.
- Applied the same height, interior scrolling, resizing, and workspace-clamping principles to the floating Calculator window.
- Preserved all existing minimize, maximize, close, Escape, arithmetic, geometry, history, and selection behavior.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.43.

## V0.1.44 Alpha Dev Build

Orbit Pitch Direction

Changes made since V0.1.43:

- Reversed only the vertical mouse delta used by right-drag 3D orbiting: dragging down now pulls the model down, and dragging up pulls it up.
- Kept horizontal yaw direction, middle-drag panning, wheel zooming, orbit pivot selection, pitch limits, camera-only behavior, and all model coordinates unchanged.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.44.

## V0.1.45 Alpha Dev Build

World-Axis Trihedron

Changes made since V0.1.44:

- Added a 3D-only world-axis trihedron anchored at the drawing origin X0 Y0 Z0, with a red X arrow, green Y arrow, and blue Z arrow.
- Built each arrow as a twelve-sided projected cylinder shaft and cone arrowhead rather than selectable CAD geometry.
- Kept the trihedron in a dedicated visual-reference layer outside `documentModel.entities` and `model3d.solids`; it cannot be selected, deleted, copied, exported to DXF, or included in drawing bounds and Fit calculations.
- Rebuilds the trihedron projection immediately during orbiting so it follows camera yaw and pitch while remaining fixed to the world origin.
- Converts its pixel dimensions back into view-space dimensions on every render, keeping its visual size consistent through wheel zoom, Zoom In/Out, Home, Fit, and canvas resizing.
- Added View -> Show Trihedron with a checkmark reflecting the current visibility preference. The command is disabled in 2D and becomes available automatically in the 3D workspace.
- Trihedron visibility is a view preference rather than document history and does not create an Undo/Redo entry.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.45.

## V0.1.46 Alpha Dev Build

Trihedron Visibility Repair

Changes made since V0.1.45:

- Fixed the world-axis trihedron remaining invisible even though its cylinder and cone faces were generated correctly.
- The cause was SVG-specific: assigning `.hidden = false` to an SVG `<g>` does not remove its HTML `hidden` attribute, so the trihedron layer remained `display: none` after entering 3D or toggling it on.
- Replaced property assignment with explicit `toggleAttribute("hidden", ...)` handling for the trihedron and solid-rendering SVG layers.
- Visually verified the red X, green Y, and blue Z arrows on the rendered 3D canvas, then rechecked View -> Show Trihedron off/on behavior and automatic hiding when returning to 2D.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.46.

## V0.1.47 Alpha Dev Build

Z-Axis Horizontal Orbit

Changes made since V0.1.46:

- Changed horizontal right-drag orbiting from rotation around the world Y axis in the XZ plane to rotation around the world Z axis in the XY plane.
- Adopted the conventional Z-up isometric camera basis: at Home, Z projects vertically upward while X and Y project diagonally across the screen.
- Updated the shared XYZ projection, Z0 inverse projection used for grid coverage, and the SVG transform used by existing 2D profiles so points, profiles, solids, and the trihedron remain registered under the same camera.
- Preserved the established horizontal drag direction, the repaired vertical pitch direction, pitch limits, orbit pivot behavior, middle-drag panning, pointer-centered zooming, and unchanged model coordinates.
- Home continues to restore 45° yaw and 35.264° pitch, now interpreted as yaw about world Z followed by pitch about the camera-horizontal axis.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.47.

## V0.1.48 Alpha Dev Build

Right-Handed Camera and Yaw Direction

Changes made since V0.1.47:

- Reversed horizontal right-drag yaw so dragging right pulls the model to the right and dragging left pulls it to the left.
- Corrected the Z-up camera basis to the machinist's right-hand convention. Looking from positive Z toward negative Z now places positive X to the right, positive Y upward, and positive Z toward the viewer.
- Removed the mirrored XY screen orientation introduced in V0.1.47 while retaining yaw about world Z and pitch about the camera-horizontal axis.
- Updated the 2D profile SVG transform and Z0 inverse projection to remain exactly aligned with the corrected full XYZ projection.
- The world-axis trihedron continues to build each arrow from X0 Y0 Z0 toward its positive endpoint; under the corrected camera, its red +X, green +Y, and blue +Z arrows now follow the same right-handed convention as the model.
- Preserved the repaired vertical pitch direction, camera-only orbit behavior, orbit pivot, panning, zooming, model coordinates, and all document geometry.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.48.

## V0.1.49 Alpha Dev Build

Orbit Mouse Direction Correction

Changes made since V0.1.48:

- Reversed both mouse input deltas used by right-drag orbiting: horizontal movement now drives yaw in the opposite direction, and vertical movement drives pitch in the opposite direction.
- Kept the right-handed Z-up coordinate convention established in V0.1.48 unchanged: top view remains +X right, +Y up, and +Z toward the viewer.
- Kept the trihedron's positive-axis endpoints, model coordinates, projection basis, orbit pivot, pitch limits, panning, and zooming unchanged.
- Updated the application metadata, browser title, header, About window, runtime identity, and DXF producer version to V0.1.49.
