// PrometheusCAD coordinate law:
//
// This program is built by a machinist, for machinists.
//
// X0 Y0 is the point where the axes cross.
// X+ moves right.
// Y+ moves up.
// Therefore X+ Y+ is the upper-right quadrant.
//
// SVG/browser coordinates normally put positive Y downward.
// That is NOT PrometheusCAD's user-facing coordinate system.
// Any SVG weirdness must be handled internally.

const APP_NAME = "PrometheusCAD";
const APP_VERSION = "0.1.49";
const MILLIMETERS_PER_INCH = 25.4;

// Menu timing controls, in milliseconds. The longer delay applies when the
// pointer leaves the menu system; the shorter delay applies while switching
// between dropdowns or flyouts.
const MENU_HOVER_CLOSE_DELAY_MS = 400;
const MENU_SWITCH_CLOSE_DELAY_MS = 50;
const delayedMenuCloseTimers = new WeakMap();

function clearDelayedMenuClose(menuContainer) {
  const timer = delayedMenuCloseTimers.get(menuContainer);
  if (timer !== undefined) clearTimeout(timer);
  delayedMenuCloseTimers.delete(menuContainer);
}

function enableDelayedMenuClose(menuContainer) {
  if (!menuContainer || menuContainer.dataset.delayedMenuClose === "true") {
    return;
  }
  menuContainer.dataset.delayedMenuClose = "true";

  menuContainer.addEventListener("pointerenter", () => {
    clearDelayedMenuClose(menuContainer);
    menuContainer.classList.remove("is-hover-retained", "is-dismissed");
    menuContainer
      .querySelectorAll(".is-hover-retained")
      .forEach((descendant) => {
        clearDelayedMenuClose(descendant);
        descendant.classList.remove("is-hover-retained");
      });
  });

  menuContainer.addEventListener("pointerleave", (event) => {
    clearDelayedMenuClose(menuContainer);
    menuContainer.classList.add("is-hover-retained");
    const isMovingWithinMenuSystem = Boolean(
      event.relatedTarget?.closest?.(
        ".menu-item, .submenu-item, .dropdown-menu, .submenu-menu",
      ),
    );
    const closeDelay = isMovingWithinMenuSystem
      ? MENU_SWITCH_CLOSE_DELAY_MS
      : MENU_HOVER_CLOSE_DELAY_MS;
    const timer = setTimeout(() => {
      delayedMenuCloseTimers.delete(menuContainer);
      menuContainer.classList.remove("is-hover-retained", "is-dismissed");
    }, closeDelay);
    delayedMenuCloseTimers.set(menuContainer, timer);
  });
}

const cadCanvas = document.querySelector("#cadCanvas");
const drawingArea = cadCanvas.closest(".drawing-area");
const cadSelectionMarquee = document.querySelector("#cadSelectionMarquee");
const menuBar = document.querySelector(".menu-bar");
const gridLayer = document.querySelector("#gridLayer");
const axisLayer = document.querySelector("#axisLayer");
const entityLayer = document.querySelector("#entityLayer");
const previewLayer = document.querySelector("#previewLayer");
const worldLayer = document.querySelector("#worldLayer");
const modelLayer = document.querySelector("#modelLayer");
const trihedronLayer = document.querySelector("#trihedronLayer");
const cadHorizontalScrollbar = document.querySelector(
  "#cadHorizontalScrollbar",
);
const cadHorizontalTrack = document.querySelector("#cadHorizontalTrack");
const cadHorizontalThumb = document.querySelector("#cadHorizontalThumb");
const cadScrollLeft = document.querySelector("#cadScrollLeft");
const cadScrollRight = document.querySelector("#cadScrollRight");
const cadVerticalScrollbar = document.querySelector("#cadVerticalScrollbar");
const cadVerticalTrack = document.querySelector("#cadVerticalTrack");
const cadVerticalThumb = document.querySelector("#cadVerticalThumb");
const cadScrollUp = document.querySelector("#cadScrollUp");
const cadScrollDown = document.querySelector("#cadScrollDown");
const pointCoordinatesWindow = document.querySelector(
  "#pointCoordinatesWindow",
);
const pointWindowTitleBar = document.querySelector("#pointWindowTitleBar");
const pointCoordinatesForm = document.querySelector("#pointCoordinatesForm");
const pointCoordinatesMenu = document.querySelector("#pointCoordinatesMenu");
const pointIntersectMenu = document.querySelector("#pointIntersectMenu");
const pointOnEntityMenu = document.querySelector("#pointOnEntityMenu");
const pointEndMenu = document.querySelector("#pointEndMenu");
const pointIncrementalMenu = document.querySelector("#pointIncrementalMenu");
const pointSketchMenu = document.querySelector("#pointSketchMenu");
const lineCoordinatesMenu = document.querySelector("#lineCoordinatesMenu");
const lineSketchMenu = document.querySelector("#lineSketchMenu");
const lineAngleMenu = document.querySelector("#lineAngleMenu");
const lineTangentMenu = document.querySelector("#lineTangentMenu");
const exportDxfMenu = document.querySelector("#exportDxfMenu");
const fileMenuItem = exportDxfMenu.closest(".menu-item");
const fileMenuButton = fileMenuItem.querySelector(".menu-button");
const lineJoinMenu = document.querySelector("#lineJoinMenu");
const circleCenterRadiusMenu = document.querySelector(
  "#circleCenterRadiusMenu",
);
const circleCoordinateCenterMenu = document.querySelector(
  "#circleCoordinateCenterMenu",
);
const circleSketchCenterMenu = document.querySelector(
  "#circleSketchCenterMenu",
);
const circleThreeEntitiesMenu = document.querySelector(
  "#circleThreeEntitiesMenu",
);
const hexagonPointCenterMenu = document.querySelector(
  "#hexagonPointCenterMenu",
);
const hexagonDefineCenterMenu = document.querySelector(
  "#hexagonDefineCenterMenu",
);
const rectanglePointCenterMenu = document.querySelector(
  "#rectanglePointCenterMenu",
);
const rectangleDefineCenterMenu = document.querySelector(
  "#rectangleDefineCenterMenu",
);
const boltHoleCirclePointCenterMenu = document.querySelector(
  "#boltHoleCirclePointCenterMenu",
);
const boltHoleCircleDefineCenterMenu = document.querySelector(
  "#boltHoleCircleDefineCenterMenu",
);
const drawMenuItem = lineJoinMenu.closest(".menu-item");
const drawMenuButton = drawMenuItem.querySelector(".menu-button");
const modelMenuItem = document.querySelector("#modelMenuItem");
const modelMenuButton = document.querySelector("#modelMenuButton");
const modelBoxMenu = document.querySelector("#modelBoxMenu");
const undoMenu = document.querySelector("#undoMenu");
const redoMenu = document.querySelector("#redoMenu");
const copyMenu = document.querySelector("#copyMenu");
const pasteMenu = document.querySelector("#pasteMenu");
const cutMenu = document.querySelector("#cutMenu");
const deleteMenu = document.querySelector("#deleteMenu");
const editMenuItem = undoMenu.closest(".menu-item");
const editMenuButton = editMenuItem.querySelector(".menu-button");
const pointMinimizeButton = document.querySelector("#pointMinimizeButton");
const pointMaximizeButton = document.querySelector("#pointMaximizeButton");
const pointMaximizeIcon = document.querySelector("#pointMaximizeIcon");
const pointCloseButton = document.querySelector("#pointCloseButton");
const pointContinueButton = document.querySelector("#pointContinueButton");
const pointCancelButton = document.querySelector("#pointCancelButton");
const pointXInput = document.querySelector("#pointX");
const pointYInput = document.querySelector("#pointY");
const toolMessage = document.querySelector("#toolMessage");
const lineCoordinatesWindow = document.querySelector("#lineCoordinatesWindow");
const lineCoordinatesWindowTitleBar = document.querySelector(
  "#lineCoordinatesWindowTitleBar",
);
const lineCoordinatesForm = document.querySelector("#lineCoordinatesForm");
const lineStartXInput = document.querySelector("#lineStartX");
const lineStartYInput = document.querySelector("#lineStartY");
const lineEndXInput = document.querySelector("#lineEndX");
const lineEndYInput = document.querySelector("#lineEndY");
const lineCoordinatesToolMessage = document.querySelector(
  "#lineCoordinatesToolMessage",
);
const lineCoordinatesMinimizeButton = document.querySelector(
  "#lineCoordinatesMinimizeButton",
);
const lineCoordinatesMaximizeButton = document.querySelector(
  "#lineCoordinatesMaximizeButton",
);
const lineCoordinatesMaximizeIcon = document.querySelector(
  "#lineCoordinatesMaximizeIcon",
);
const lineCoordinatesCloseButton = document.querySelector(
  "#lineCoordinatesCloseButton",
);
const lineCoordinatesContinueButton = document.querySelector(
  "#lineCoordinatesContinueButton",
);
const lineCoordinatesCancelButton = document.querySelector(
  "#lineCoordinatesCancelButton",
);
const lineAngleWindow = document.querySelector("#lineAngleWindow");
const lineAngleWindowTitleBar = document.querySelector(
  "#lineAngleWindowTitleBar",
);
const lineAngleForm = document.querySelector("#lineAngleForm");
const lineAngleSourceReadout = document.querySelector(
  "#lineAngleSourceReadout",
);
const lineAngleDegreesInput = document.querySelector("#lineAngleDegrees");
const lineAngleLengthInput = document.querySelector("#lineAngleLength");
const lineAngleRelativeOptions = document.querySelector(
  "#lineAngleRelativeOptions",
);
const lineAngleRelativeLineInput = document.querySelector(
  "#lineAngleRelativeLine",
);
const lineAngleRelativeAxisInput = document.querySelector(
  "#lineAngleRelativeAxis",
);
const lineAngleToolMessage = document.querySelector("#lineAngleToolMessage");
const lineAngleCreateButton = document.querySelector("#lineAngleCreateButton");
const lineAngleMinimizeButton = document.querySelector(
  "#lineAngleMinimizeButton",
);
const lineAngleMaximizeButton = document.querySelector(
  "#lineAngleMaximizeButton",
);
const lineAngleMaximizeIcon = document.querySelector("#lineAngleMaximizeIcon");
const lineAngleCloseButton = document.querySelector("#lineAngleCloseButton");
const lineAngleCancelButton = document.querySelector("#lineAngleCancelButton");
const lineTangentWindow = document.querySelector("#lineTangentWindow");
const lineTangentWindowTitleBar = document.querySelector(
  "#lineTangentWindowTitleBar",
);
const lineTangentForm = document.querySelector("#lineTangentForm");
const lineTangentSourceReadout = document.querySelector(
  "#lineTangentSourceReadout",
);
const lineTangentAngleInput = document.querySelector("#lineTangentAngle");
const lineTangentLengthInput = document.querySelector("#lineTangentLength");
const lineTangentToolMessage = document.querySelector(
  "#lineTangentToolMessage",
);
const lineTangentCreateButton = document.querySelector(
  "#lineTangentCreateButton",
);
const lineTangentMinimizeButton = document.querySelector(
  "#lineTangentMinimizeButton",
);
const lineTangentMaximizeButton = document.querySelector(
  "#lineTangentMaximizeButton",
);
const lineTangentMaximizeIcon = document.querySelector(
  "#lineTangentMaximizeIcon",
);
const lineTangentCloseButton = document.querySelector(
  "#lineTangentCloseButton",
);
const lineTangentCancelButton = document.querySelector(
  "#lineTangentCancelButton",
);
const circleRadiusWindow = document.querySelector("#circleRadiusWindow");
const circleWindowTitleBar = document.querySelector("#circleWindowTitleBar");
const circleRadiusTitle = document.querySelector("#circleRadiusTitle");
const circleRadiusForm = document.querySelector("#circleRadiusForm");
const circleRadiusInput = document.querySelector("#circleRadius");
const circleCenterReadoutGroup = document.querySelector(
  "#circleCenterReadoutGroup",
);
const circleCenterReadout = document.querySelector("#circleCenterReadout");
const circleCoordinateCenterFields = document.querySelector(
  "#circleCoordinateCenterFields",
);
const circleCenterXInput = document.querySelector("#circleCenterX");
const circleCenterYInput = document.querySelector("#circleCenterY");
const circleToolMessage = document.querySelector("#circleToolMessage");
const circleCreateButton = document.querySelector("#circleCreateButton");
const circleContinueButton = document.querySelector("#circleContinueButton");
const circleDialogActions = document.querySelector("#circleDialogActions");
const circleMinimizeButton = document.querySelector("#circleMinimizeButton");
const circleMaximizeButton = document.querySelector("#circleMaximizeButton");
const circleMaximizeIcon = document.querySelector("#circleMaximizeIcon");
const circleCloseButton = document.querySelector("#circleCloseButton");
const circleCancelButton = document.querySelector("#circleCancelButton");
const hexagonWindow = document.querySelector("#hexagonWindow");
const hexagonWindowTitleBar = document.querySelector("#hexagonWindowTitleBar");
const hexagonTitle = document.querySelector("#hexagonTitle");
const hexagonForm = document.querySelector("#hexagonForm");
const hexagonCenterReadoutGroup = document.querySelector(
  "#hexagonCenterReadoutGroup",
);
const hexagonAcrossFlatsInput = document.querySelector("#hexagonAcrossFlats");
const hexagonCornerRadiusInput = document.querySelector("#hexagonCornerRadius");
const hexagonCenterReadout = document.querySelector("#hexagonCenterReadout");
const hexagonCoordinateCenterFields = document.querySelector(
  "#hexagonCoordinateCenterFields",
);
const hexagonCenterXInput = document.querySelector("#hexagonCenterX");
const hexagonCenterYInput = document.querySelector("#hexagonCenterY");
const hexagonToolMessage = document.querySelector("#hexagonToolMessage");
const hexagonCreateButton = document.querySelector("#hexagonCreateButton");
const hexagonMinimizeButton = document.querySelector("#hexagonMinimizeButton");
const hexagonMaximizeButton = document.querySelector("#hexagonMaximizeButton");
const hexagonMaximizeIcon = document.querySelector("#hexagonMaximizeIcon");
const hexagonCloseButton = document.querySelector("#hexagonCloseButton");
const hexagonCancelButton = document.querySelector("#hexagonCancelButton");
const rectangleWindow = document.querySelector("#rectangleWindow");
const rectangleWindowTitleBar = document.querySelector(
  "#rectangleWindowTitleBar",
);
const rectangleTitle = document.querySelector("#rectangleTitle");
const rectangleForm = document.querySelector("#rectangleForm");
const rectangleCenterReadoutGroup = document.querySelector(
  "#rectangleCenterReadoutGroup",
);
const rectangleCenterReadout = document.querySelector(
  "#rectangleCenterReadout",
);
const rectangleCoordinateCenterFields = document.querySelector(
  "#rectangleCoordinateCenterFields",
);
const rectangleCenterXInput = document.querySelector("#rectangleCenterX");
const rectangleCenterYInput = document.querySelector("#rectangleCenterY");
const rectangleXInput = document.querySelector("#rectangleX");
const rectangleYInput = document.querySelector("#rectangleY");
const rectangleRadiusInput = document.querySelector("#rectangleRadius");
const rectangleToolMessage = document.querySelector("#rectangleToolMessage");
const rectangleCreateButton = document.querySelector("#rectangleCreateButton");
const rectangleMinimizeButton = document.querySelector(
  "#rectangleMinimizeButton",
);
const rectangleMaximizeButton = document.querySelector(
  "#rectangleMaximizeButton",
);
const rectangleMaximizeIcon = document.querySelector("#rectangleMaximizeIcon");
const rectangleCloseButton = document.querySelector("#rectangleCloseButton");
const rectangleCancelButton = document.querySelector("#rectangleCancelButton");
const boltHoleCircleWindow = document.querySelector("#boltHoleCircleWindow");
const boltHoleCircleWindowTitleBar = document.querySelector(
  "#boltHoleCircleWindowTitleBar",
);
const boltHoleCircleTitle = document.querySelector("#boltHoleCircleTitle");
const boltHoleCircleForm = document.querySelector("#boltHoleCircleForm");
const boltHoleCircleCenterReadoutGroup = document.querySelector(
  "#boltHoleCircleCenterReadoutGroup",
);
const boltHoleCircleCenterReadout = document.querySelector(
  "#boltHoleCircleCenterReadout",
);
const boltHoleCircleCoordinateCenterFields = document.querySelector(
  "#boltHoleCircleCoordinateCenterFields",
);
const boltHoleCircleCenterXInput = document.querySelector(
  "#boltHoleCircleCenterX",
);
const boltHoleCircleCenterYInput = document.querySelector(
  "#boltHoleCircleCenterY",
);
const boltHoleDiameterInput = document.querySelector("#boltHoleDiameter");
const boltHoleCountInput = document.querySelector("#boltHoleCount");
const boltHoleFeatureDiameterInput = document.querySelector(
  "#boltHoleFeatureDiameter",
);
const boltHoleCircleToolMessage = document.querySelector(
  "#boltHoleCircleToolMessage",
);
const boltHoleCircleCreateButton = document.querySelector(
  "#boltHoleCircleCreateButton",
);
const boltHoleCircleMinimizeButton = document.querySelector(
  "#boltHoleCircleMinimizeButton",
);
const boltHoleCircleMaximizeButton = document.querySelector(
  "#boltHoleCircleMaximizeButton",
);
const boltHoleCircleMaximizeIcon = document.querySelector(
  "#boltHoleCircleMaximizeIcon",
);
const boltHoleCircleCloseButton = document.querySelector(
  "#boltHoleCircleCloseButton",
);
const boltHoleCircleCancelButton = document.querySelector(
  "#boltHoleCircleCancelButton",
);
const textMenu = document.querySelector("#textMenu");
const textWindow = document.querySelector("#textWindow");
const textWindowTitleBar = document.querySelector("#textWindowTitleBar");
const textForm = document.querySelector("#textForm");
const textHeightInput = document.querySelector("#textHeight");
const textContentInput = document.querySelector("#textContent");
const textToolMessage = document.querySelector("#textToolMessage");
const textMinimizeButton = document.querySelector("#textMinimizeButton");
const textMaximizeButton = document.querySelector("#textMaximizeButton");
const textMaximizeIcon = document.querySelector("#textMaximizeIcon");
const textCloseButton = document.querySelector("#textCloseButton");
const textCancelButton = document.querySelector("#textCancelButton");
const trimExtendMenu = document.querySelector("#trimExtendMenu");
const filletRadiusMenu = document.querySelector("#filletRadiusMenu");
const offsetMenu = document.querySelector("#offsetMenu");
const rotateMenu = document.querySelector("#rotateMenu");
const translateCoordinatesMenu = document.querySelector(
  "#translateCoordinatesMenu",
);
const translateByPointsMenu = document.querySelector("#translateByPointsMenu");
const mirrorXAxisMenu = document.querySelector("#mirrorXAxisMenu");
const mirrorYAxisMenu = document.querySelector("#mirrorYAxisMenu");
const mirrorBothAxesMenu = document.querySelector("#mirrorBothAxesMenu");
const mirrorXAxisLabel = document.querySelector("#mirrorXAxisLabel");
const mirrorYAxisLabel = document.querySelector("#mirrorYAxisLabel");
const mirrorBothAxesLabel = document.querySelector("#mirrorBothAxesLabel");
const mirrorCopyInput = document.querySelector("#mirrorCopyInput");
const modifyMenuItem = offsetMenu.closest(".menu-item");
const modifyMenuButton = modifyMenuItem.querySelector(".menu-button");
const linearDimensionMenu = document.querySelector("#linearDimensionMenu");
const diameterDimensionMenu = document.querySelector("#diameterDimensionMenu");
const radiusDimensionMenu = document.querySelector("#radiusDimensionMenu");
const angleDimensionMenu = document.querySelector("#angleDimensionMenu");
const modelDimensionPlaceholder = document.querySelector(
  "#modelDimensionPlaceholder",
);
const dimensionMenuItem = linearDimensionMenu.closest(".menu-item");
const dimensionMenuButton = dimensionMenuItem.querySelector(".menu-button");
const offsetWindow = document.querySelector("#offsetWindow");
const offsetWindowTitleBar = document.querySelector("#offsetWindowTitleBar");
const offsetForm = document.querySelector("#offsetForm");
const offsetAmountInput = document.querySelector("#offsetAmount");
const offsetSourceReadout = document.querySelector("#offsetSourceReadout");
const offsetToolMessage = document.querySelector("#offsetToolMessage");
const offsetMinimizeButton = document.querySelector("#offsetMinimizeButton");
const offsetMaximizeButton = document.querySelector("#offsetMaximizeButton");
const offsetMaximizeIcon = document.querySelector("#offsetMaximizeIcon");
const offsetCloseButton = document.querySelector("#offsetCloseButton");
const offsetCancelButton = document.querySelector("#offsetCancelButton");
const filletWindow = document.querySelector("#filletWindow");
const filletWindowTitleBar = document.querySelector("#filletWindowTitleBar");
const filletForm = document.querySelector("#filletForm");
const filletRadiusInput = document.querySelector("#filletRadius");
const filletTrimExtendInput = document.querySelector("#filletTrimExtend");
const filletSourceReadout = document.querySelector("#filletSourceReadout");
const filletToolMessage = document.querySelector("#filletToolMessage");
const filletMinimizeButton = document.querySelector("#filletMinimizeButton");
const filletMaximizeButton = document.querySelector("#filletMaximizeButton");
const filletMaximizeIcon = document.querySelector("#filletMaximizeIcon");
const filletCloseButton = document.querySelector("#filletCloseButton");
const filletCancelButton = document.querySelector("#filletCancelButton");
const rotateWindow = document.querySelector("#rotateWindow");
const rotateWindowTitleBar = document.querySelector("#rotateWindowTitleBar");
const rotateForm = document.querySelector("#rotateForm");
const rotateAngleInput = document.querySelector("#rotateAngle");
const rotatePivotOriginInput = document.querySelector("#rotatePivotOrigin");
const rotatePivotPointInput = document.querySelector("#rotatePivotPoint");
const rotatePivotOptions = document.querySelector(".rotate-pivot-options");
const rotateAxisOptions = document.querySelector("#rotateAxisOptions");
const rotateAxisXInput = document.querySelector("#rotateAxisX");
const rotateAxisYInput = document.querySelector("#rotateAxisY");
const rotateAxisZInput = document.querySelector("#rotateAxisZ");
const rotateSelectionReadout = document.querySelector(
  "#rotateSelectionReadout",
);
const rotatePivotReadout = document.querySelector("#rotatePivotReadout");
const rotateChoosePointButton = document.querySelector(
  "#rotateChoosePointButton",
);
const rotateToolMessage = document.querySelector("#rotateToolMessage");
const rotateMinimizeButton = document.querySelector("#rotateMinimizeButton");
const rotateMaximizeButton = document.querySelector("#rotateMaximizeButton");
const rotateMaximizeIcon = document.querySelector("#rotateMaximizeIcon");
const rotateCloseButton = document.querySelector("#rotateCloseButton");
const rotateCancelButton = document.querySelector("#rotateCancelButton");
const pointIncrementalWindow = document.querySelector(
  "#pointIncrementalWindow",
);
const pointIncrementalWindowTitleBar = document.querySelector(
  "#pointIncrementalWindowTitleBar",
);
const pointIncrementalForm = document.querySelector("#pointIncrementalForm");
const pointIncrementalXInput = document.querySelector("#pointIncrementalX");
const pointIncrementalYInput = document.querySelector("#pointIncrementalY");
const pointIncrementalCopyInput = document.querySelector(
  "#pointIncrementalCopyInput",
);
const pointIncrementalSelectionReadout = document.querySelector(
  "#pointIncrementalSelectionReadout",
);
const pointIncrementalToolMessage = document.querySelector(
  "#pointIncrementalToolMessage",
);
const pointIncrementalMinimizeButton = document.querySelector(
  "#pointIncrementalMinimizeButton",
);
const pointIncrementalMaximizeButton = document.querySelector(
  "#pointIncrementalMaximizeButton",
);
const pointIncrementalMaximizeIcon = document.querySelector(
  "#pointIncrementalMaximizeIcon",
);
const pointIncrementalCloseButton = document.querySelector(
  "#pointIncrementalCloseButton",
);
const pointIncrementalCancelButton = document.querySelector(
  "#pointIncrementalCancelButton",
);
const translateWindow = document.querySelector("#translateWindow");
const translateWindowTitleBar = document.querySelector(
  "#translateWindowTitleBar",
);
const translateForm = document.querySelector("#translateForm");
const translateXInput = document.querySelector("#translateX");
const translateYInput = document.querySelector("#translateY");
const translateZField = document.querySelector("#translateZField");
const translateZInput = document.querySelector("#translateZ");
const translateCopyInput = document.querySelector("#translateCopyInput");
const translateSelectionReadout = document.querySelector(
  "#translateSelectionReadout",
);
const translateToolMessage = document.querySelector("#translateToolMessage");
const translateMinimizeButton = document.querySelector(
  "#translateMinimizeButton",
);
const translateMaximizeButton = document.querySelector(
  "#translateMaximizeButton",
);
const translateMaximizeIcon = document.querySelector("#translateMaximizeIcon");
const translateCloseButton = document.querySelector("#translateCloseButton");
const translateCancelButton = document.querySelector("#translateCancelButton");
const translateByPointsWindow = document.querySelector(
  "#translateByPointsWindow",
);
const translateByPointsWindowTitleBar = document.querySelector(
  "#translateByPointsWindowTitleBar",
);
const translateByPointsForm = document.querySelector("#translateByPointsForm");
const translateByPointsSelectionReadout = document.querySelector(
  "#translateByPointsSelectionReadout",
);
const translateByPointsFirstReadout = document.querySelector(
  "#translateByPointsFirstReadout",
);
const translateByPointsSecondReadout = document.querySelector(
  "#translateByPointsSecondReadout",
);
const translateByPointsVectorReadout = document.querySelector(
  "#translateByPointsVectorReadout",
);
const translateByPointsCopyInput = document.querySelector(
  "#translateByPointsCopyInput",
);
const translateByPointsToolMessage = document.querySelector(
  "#translateByPointsToolMessage",
);
const translateByPointsApplyButton = document.querySelector(
  "#translateByPointsApplyButton",
);
const translateByPointsMinimizeButton = document.querySelector(
  "#translateByPointsMinimizeButton",
);
const translateByPointsMaximizeButton = document.querySelector(
  "#translateByPointsMaximizeButton",
);
const translateByPointsMaximizeIcon = document.querySelector(
  "#translateByPointsMaximizeIcon",
);
const translateByPointsCloseButton = document.querySelector(
  "#translateByPointsCloseButton",
);
const translateByPointsCancelButton = document.querySelector(
  "#translateByPointsCancelButton",
);
const pointOnEntityWindow = document.querySelector("#pointOnEntityWindow");
const pointOnEntityWindowTitleBar = document.querySelector(
  "#pointOnEntityWindowTitleBar",
);
const pointOnEntityForm = document.querySelector("#pointOnEntityForm");
const pointOnEntitySourceReadout = document.querySelector(
  "#pointOnEntitySourceReadout",
);
const pointOnEntityValueLabel = document.querySelector(
  "#pointOnEntityValueLabel",
);
const pointOnEntityUnit = document.querySelector("#pointOnEntityUnit");
const pointOnEntityValueInput = document.querySelector("#pointOnEntityValue");
const pointOnEntityToolMessage = document.querySelector(
  "#pointOnEntityToolMessage",
);
const pointOnEntityCreateButton = document.querySelector(
  "#pointOnEntityCreateButton",
);
const pointOnEntityMinimizeButton = document.querySelector(
  "#pointOnEntityMinimizeButton",
);
const pointOnEntityMaximizeButton = document.querySelector(
  "#pointOnEntityMaximizeButton",
);
const pointOnEntityMaximizeIcon = document.querySelector(
  "#pointOnEntityMaximizeIcon",
);
const pointOnEntityCloseButton = document.querySelector(
  "#pointOnEntityCloseButton",
);
const pointOnEntityCancelButton = document.querySelector(
  "#pointOnEntityCancelButton",
);
const zoomInMenu = document.querySelector("#zoomInMenu");
const zoomOutMenu = document.querySelector("#zoomOutMenu");
const windowZoomMenu = document.querySelector("#windowZoomMenu");
const homeViewMenu = document.querySelector("#homeViewMenu");
const fitViewMenu = document.querySelector("#fitViewMenu");
const showTrihedronMenu = document.querySelector("#showTrihedronMenu");
const viewMenuItem = windowZoomMenu.closest(".menu-item");
const viewMenuButton = viewMenuItem.querySelector(".menu-button");
const layerDropdownMenu = document.querySelector("#layerDropdownMenu");
const layerList = document.querySelector("#layerList");
const newLayerMenu = document.querySelector("#newLayerMenu");
const layerMenuItem = newLayerMenu.closest(".menu-item");
const layerMenuButton = layerMenuItem.querySelector(".menu-button");
const inchUnitsMenu = document.querySelector("#inchUnitsMenu");
const metricUnitsMenu = document.querySelector("#metricUnitsMenu");
const unitsMenuItem = inchUnitsMenu.closest(".menu-item");
const unitsMenuButton = unitsMenuItem.querySelector(".menu-button");
const aboutMenu = document.querySelector("#aboutMenu");
const helpMenuItem = aboutMenu.closest(".menu-item");
const helpMenuButton = helpMenuItem.querySelector(".menu-button");
const aboutWindow = document.querySelector("#aboutWindow");
const aboutWindowTitleBar = document.querySelector("#aboutWindowTitleBar");
const aboutCloseButton = document.querySelector("#aboutCloseButton");
const aboutVersion = document.querySelector("#aboutVersion");
const boxWindow = document.querySelector("#boxWindow");
const boxWindowTitleBar = document.querySelector("#boxWindowTitleBar");
const boxForm = document.querySelector("#boxForm");
const boxXInput = document.querySelector("#boxX");
const boxYInput = document.querySelector("#boxY");
const boxZInput = document.querySelector("#boxZ");
const boxLengthInput = document.querySelector("#boxLength");
const boxWidthInput = document.querySelector("#boxWidth");
const boxHeightInput = document.querySelector("#boxHeight");
const boxDraftAngleInput = document.querySelector("#boxDraftAngle");
const boxToolMessage = document.querySelector("#boxToolMessage");
const boxCreateButton = document.querySelector("#boxCreateButton");
const boxMinimizeButton = document.querySelector("#boxMinimizeButton");
const boxMaximizeButton = document.querySelector("#boxMaximizeButton");
const boxMaximizeIcon = document.querySelector("#boxMaximizeIcon");
const boxCloseButton = document.querySelector("#boxCloseButton");
const boxCancelButton = document.querySelector("#boxCancelButton");
const quickIsometricButton = document.querySelector("#quickIsometricButton");
const quickUndoButton = document.querySelector("#quickUndoButton");
const quickRedoButton = document.querySelector("#quickRedoButton");
const quickZoomInButton = document.querySelector("#quickZoomInButton");
const quickZoomOutButton = document.querySelector("#quickZoomOutButton");
const quickZoomWindowButton = document.querySelector("#quickZoomWindowButton");
const quickHomeButton = document.querySelector("#quickHomeButton");
const quickFitButton = document.querySelector("#quickFitButton");
const quickCalculatorButton = document.querySelector("#quickCalculatorButton");
const graniteThemeMenu = document.querySelector("#graniteThemeMenu");
const lightThemeMenu = document.querySelector("#lightThemeMenu");
const darkThemeMenu = document.querySelector("#darkThemeMenu");
const matrixThemeMenu = document.querySelector("#matrixThemeMenu");
const themeMenuItem = graniteThemeMenu.closest(".menu-item");
const themeMenuButton = themeMenuItem.querySelector(".menu-button");
const selectAllMenu = document.querySelector("#selectAllMenu");
const singleSelectMenu = document.querySelector("#singleSelectMenu");
const selectChainMenu = document.querySelector("#selectChainMenu");
const selectLayerMenu = document.querySelector("#selectLayerMenu");
const selectLayerSubmenu = document.querySelector("#selectLayerSubmenu");
const selectLayerList = document.querySelector("#selectLayerList");
const selectPointsMenu = document.querySelector("#selectPointsMenu");
const selectLinesMenu = document.querySelector("#selectLinesMenu");
const selectArcsMenu = document.querySelector("#selectArcsMenu");
const selectDimensionsMenu = document.querySelector("#selectDimensionsMenu");
const deselectAllMenu = document.querySelector("#deselectAllMenu");
const selectMenuItem = singleSelectMenu.closest(".menu-item");
const selectMenuButton = selectMenuItem.querySelector(".menu-button");
const cursorX = document.querySelector("#cursorX");
const cursorY = document.querySelector("#cursorY");
const unitsStatus = document.querySelector("#unitsStatus");
const zoomStatus = document.querySelector("#zoomStatus");
const entityCount = document.querySelector("#entityCount");
const commandStatus = document.querySelector("#commandStatus");
const entityHoverInfo = document.querySelector("#entityHoverInfo");

const documentModel = {
  entities: [],
  nextEntityId: 1,
  // 3D solids live in a separate object space. The first renderer consumes
  // true XYZ boundary vertices/faces plus a transform, while the geometry
  // payload remains open to a later analytic/B-rep or CSG kernel. Any profile
  // reference is provenance only: future modeling commands must copy evaluated
  // profile geometry rather than mutating or live-linking the 2D entities.
  model3d: {
    solids: [],
    nextSolidId: 1,
  },
  units: "inch",
  layers: [
    {
      id: 0,
      name: "Layer 0",
      locked: false,
      masked: false,
    },
  ],
  currentLayerId: 0,
  nextLayerId: 1,
};

const MAX_LAYER_COUNT = 10;

const UNIT_LENGTH_INPUTS = new Set([
  pointXInput,
  pointYInput,
  lineStartXInput,
  lineStartYInput,
  lineEndXInput,
  lineEndYInput,
  lineAngleLengthInput,
  lineTangentLengthInput,
  circleRadiusInput,
  circleCenterXInput,
  circleCenterYInput,
  hexagonCenterXInput,
  hexagonCenterYInput,
  hexagonAcrossFlatsInput,
  hexagonCornerRadiusInput,
  rectangleCenterXInput,
  rectangleCenterYInput,
  rectangleXInput,
  rectangleYInput,
  rectangleRadiusInput,
  boltHoleCircleCenterXInput,
  boltHoleCircleCenterYInput,
  boltHoleDiameterInput,
  boltHoleFeatureDiameterInput,
  textHeightInput,
  offsetAmountInput,
  filletRadiusInput,
  pointIncrementalXInput,
  pointIncrementalYInput,
  translateXInput,
  translateYInput,
  translateZInput,
  boxXInput,
  boxYInput,
  boxZInput,
  boxLengthInput,
  boxWidthInput,
  boxHeightInput,
]);

const UNIT_MENUS = {
  inch: inchUnitsMenu,
  metric: metricUnitsMenu,
};

const UNIT_DISPLAY_NAMES = {
  inch: "Inch",
  metric: "Metric",
};

const HISTORY_LIMIT = 100;
const historyState = {
  undoStack: [],
  redoStack: [],
};

const clipboardState = {
  entities: [],
  rootEntityIds: [],
  solids: [],
};

const BASE_VIEW = {
  width: 14.222,
  height: 8,
};

const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;
const CANVAS_DRAG_THRESHOLD_PX = 5;
const ORBIT_RADIANS_PER_PIXEL = (0.45 * Math.PI) / 180;
const MIN_ORBIT_PITCH_RADIANS = (-80 * Math.PI) / 180;
const MAX_ORBIT_PITCH_RADIANS = (80 * Math.PI) / 180;
const WHEEL_ZOOM_FACTOR = 1.2;
const TRIHEDRON_AXIS_LENGTH_PX = 78;
const TRIHEDRON_SHAFT_LENGTH_PX = 56;
const TRIHEDRON_SHAFT_RADIUS_PX = 3.5;
const TRIHEDRON_CONE_RADIUS_PX = 8;
const TRIHEDRON_RADIAL_SEGMENTS = 12;

const THEME_MENUS = {
  granite: graniteThemeMenu,
  light: lightThemeMenu,
  dark: darkThemeMenu,
  matrix: matrixThemeMenu,
};

const THEME_DISPLAY_NAMES = {
  granite: "Granite",
  light: "Light",
  dark: "Dark",
  matrix: "Matrix",
};

const viewState = {
  zoom: 1,
  centerX: 0,
  centerY: 0,
  viewWidth: BASE_VIEW.width,
  viewHeight: BASE_VIEW.height,
  navigationAnchor: null,
};

const workspaceState = {
  mode: "2d",
};

const ISOMETRIC_YAW_RADIANS = (45 * Math.PI) / 180;
const ISOMETRIC_PITCH_RADIANS = (35.264 * Math.PI) / 180;
const isometricViewState = {
  active: false,
  previousView: null,
  displayView: null,
  hasGeometry: false,
  yaw: ISOMETRIC_YAW_RADIANS,
  pitch: ISOMETRIC_PITCH_RADIANS,
  pivotWorld: { x: 0, y: 0, z: 0 },
};

const trihedronState = {
  visible: true,
};

const viewportScrollState = {
  horizontal: {
    enabled: false,
    minCenter: 0,
    maxCenter: 0,
  },
  vertical: {
    enabled: false,
    minCenter: 0,
    maxCenter: 0,
  },
  drag: null,
};

const windowZoomState = {
  active: false,
  drag: null,
  canceledPointerId: null,
  suppressClickUntil: 0,
};

const canvasNavigationState = {
  drag: null,
  suppressClickUntil: 0,
  suppressContextMenuUntil: 0,
};

const selectionState = {
  mode: null,
  _selectedEntityId: null,
  selectedEntityIds: new Set(),
  get selectedEntityId() {
    return this._selectedEntityId;
  },
  set selectedEntityId(entityId) {
    this._selectedEntityId = entityId;
    this.selectedEntityIds.clear();
    if (entityId !== null) this.selectedEntityIds.add(entityId);
  },
  hoveredEntityId: null,
  pickCycle: null,
};

const modelSelectionState = {
  selectedSolidIds: new Set(),
  selectedFace: null,
  hoveredSolidId: null,
  hoveredFaceIndex: null,
};

const chainSelectionState = {
  candidateEntityId: null,
  exitEndpointIndex: null,
  lastChainEntityIds: [],
};

function isEntitySelected(entityId) {
  return selectionState.selectedEntityIds.has(entityId);
}

function addEntityIdsToSelection(entityIds) {
  entityIds.forEach((entityId) =>
    selectionState.selectedEntityIds.add(entityId),
  );
  selectionState._selectedEntityId =
    selectionState.selectedEntityIds.size === 1
      ? selectionState.selectedEntityIds.values().next().value
      : null;
}

function is3dWorkspace() {
  return workspaceState.mode === "3d";
}

function clonePlainModelValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSolidById(solidId) {
  return documentModel.model3d.solids.find((solid) => solid.id === solidId);
}

function getSelectedModelSolids() {
  return documentModel.model3d.solids.filter((solid) =>
    modelSelectionState.selectedSolidIds.has(solid.id),
  );
}

function clearModelSelection() {
  modelSelectionState.selectedSolidIds.clear();
  modelSelectionState.selectedFace = null;
  modelSelectionState.hoveredSolidId = null;
  modelSelectionState.hoveredFaceIndex = null;
}

function getIdentityMatrix4() {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

function multiplyMatrix4(first, second) {
  const result = new Array(16).fill(0);
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      for (let index = 0; index < 4; index += 1) {
        result[row * 4 + column] +=
          first[row * 4 + index] * second[index * 4 + column];
      }
    }
  }
  return result;
}

function getTranslationMatrix4(x = 0, y = 0, z = 0) {
  return [
    1, 0, 0, x,
    0, 1, 0, y,
    0, 0, 1, z,
    0, 0, 0, 1,
  ];
}

function getScaleMatrix4(x = 1, y = 1, z = 1) {
  return [
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1,
  ];
}

function getAxisRotationMatrix4(axis, radians) {
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  if (axis === "x") {
    return [
      1, 0, 0, 0,
      0, cosine, -sine, 0,
      0, sine, cosine, 0,
      0, 0, 0, 1,
    ];
  }
  if (axis === "y") {
    return [
      cosine, 0, sine, 0,
      0, 1, 0, 0,
      -sine, 0, cosine, 0,
      0, 0, 0, 1,
    ];
  }
  return [
    cosine, -sine, 0, 0,
    sine, cosine, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

function getReflectionMatrix4(coordinate) {
  return getScaleMatrix4(
    coordinate === "x" ? -1 : 1,
    coordinate === "y" ? -1 : 1,
    coordinate === "z" ? -1 : 1,
  );
}

function transformPointByMatrix4(matrix, point) {
  return {
    x: matrix[0] * point.x + matrix[1] * point.y + matrix[2] * point.z + matrix[3],
    y: matrix[4] * point.x + matrix[5] * point.y + matrix[6] * point.z + matrix[7],
    z: matrix[8] * point.x + matrix[9] * point.y + matrix[10] * point.z + matrix[11],
  };
}

function getMatrix3Determinant(matrix) {
  return (
    matrix[0] * (matrix[5] * matrix[10] - matrix[6] * matrix[9]) -
    matrix[1] * (matrix[4] * matrix[10] - matrix[6] * matrix[8]) +
    matrix[2] * (matrix[4] * matrix[9] - matrix[5] * matrix[8])
  );
}

function getDefaultSolidTransform() {
  return { matrix: getIdentityMatrix4() };
}

function normalizeSolidTransform(solid) {
  const transform = solid.transform ?? getDefaultSolidTransform();
  if (
    Array.isArray(transform.matrix) &&
    transform.matrix.length === 16 &&
    transform.matrix.every(Number.isFinite)
  ) {
    solid.transform = transform;
    return transform;
  }

  // Migrate the provisional V0.1.41 translation/rotation/scale adapter into
  // one affine transform without changing the represented world geometry.
  const translation = { x: 0, y: 0, z: 0, ...(transform.translation ?? {}) };
  const rotation = { x: 0, y: 0, z: 0, ...(transform.rotation ?? {}) };
  const scale = { x: 1, y: 1, z: 1, ...(transform.scale ?? {}) };
  let matrix = getScaleMatrix4(scale.x, scale.y, scale.z);
  matrix = multiplyMatrix4(getAxisRotationMatrix4("x", rotation.x), matrix);
  matrix = multiplyMatrix4(getAxisRotationMatrix4("y", rotation.y), matrix);
  matrix = multiplyMatrix4(getAxisRotationMatrix4("z", rotation.z), matrix);
  matrix = multiplyMatrix4(
    getTranslationMatrix4(translation.x, translation.y, translation.z),
    matrix,
  );
  solid.transform = { matrix };
  return solid.transform;
}

function prependSolidTransform(solid, matrix) {
  const transform = normalizeSolidTransform(solid);
  transform.matrix = multiplyMatrix4(matrix, transform.matrix);
}

const joinState = {
  active: false,
  firstPointId: null,
  previewWorld: null,
};

const pointSketchState = {
  active: false,
};

const lineSketchState = {
  active: false,
  startPointId: null,
  previewWorld: null,
};

const lineAngleState = {
  active: false,
  sourceEntityId: null,
  startPointId: null,
  lineBaseAngle: 0,
};

const lineTangentState = {
  active: false,
  sourceEntityId: null,
  centerPointId: null,
};

const circleState = {
  active: false,
  centerPointId: null,
  centerMode: null,
};

const hexagonState = {
  active: false,
  centerPointId: null,
  centerMode: null,
};

const rectangleState = {
  active: false,
  centerPointId: null,
  centerMode: null,
};

const boltHoleCircleState = {
  active: false,
  centerPointId: null,
  centerMode: null,
};

const intersectionState = {
  active: false,
  firstEntityId: null,
};

const threeEntityCircleState = {
  active: false,
  entityIds: [],
  clickPoints: [],
};

const offsetState = {
  active: false,
  sourceEntityId: null,
};

const trimExtendState = {
  active: false,
  sourceEntityId: null,
  endpointProperty: null,
  sourcePickWorld: null,
};

const filletState = {
  active: false,
  firstEntityId: null,
  firstPickWorld: null,
};

const rotateState = {
  active: false,
  entityId: null,
  solidIds: [],
  pivotPointId: null,
  awaitingPivot: false,
};

const dimensionState = {
  activeType: null,
  firstEntityId: null,
  firstLineId: null,
  firstPickWorld: null,
};

const pointOnEntityState = {
  active: false,
  sourceEntityId: null,
  zeroPointId: null,
  zeroChoiceIndex: null,
  awaitingDirection: false,
  directionChoices: [],
  linePercentage: 50,
  angleDegrees: 0,
};

const pointEndState = {
  active: false,
};

const textPlacementState = {
  active: false,
  previewWorld: null,
};

const GEOMETRY_EPSILON = 1e-9;
const CHAIN_CONNECTION_TOLERANCE = 1e-6;
const MAX_BOLT_HOLE_COUNT = 1000;

const pointWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const lineCoordinatesWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const lineAngleWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const lineTangentWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const circleWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const hexagonWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const rectangleWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const boltHoleCircleWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const textWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const offsetWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const pointOnEntityWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const filletWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const rotateWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const translateWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const boxWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const pointIncrementalWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const translateByPointsWindowState = {
  hasPosition: false,
  restoreBounds: null,
  drag: null,
};

const translateByPointsState = {
  active: false,
  entityIds: [],
  firstPointId: null,
  secondPointId: null,
};

const aboutWindowState = {
  hasPosition: false,
  drag: null,
};

let calculatorWindow = null;
let calculatorHasBeenPositioned = false;

const VIEW = {
  xMin: -7.111,
  xMax: 7.111,
  yMin: -4,
  yMax: 4,
};
const ORIGIN = {
  x: 0,
  y: 0,
};
function createSvgElement(type, attributes) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", type);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

function drawLine(parent, x1, y1, x2, y2, className) {
  const line = createSvgElement("line", {
    x1,
    y1,
    x2,
    y2,
    class: className,
  });

  parent.appendChild(line);
}

function drawAxesAndTicks(bounds = VIEW) {
  gridLayer.innerHTML = "";
  axisLayer.innerHTML = "";

  const fullTick =
    documentModel.units === "metric" ? 10 / MILLIMETERS_PER_INCH : 1;
  const halfTick = fullTick / 2;
  const tickSizeHalfInch = 0.06;
  const tickSizeFullInch = 0.12;

  // X axis
  drawLine(axisLayer, bounds.xMin, 0, bounds.xMax, 0, "axis-line");

  // Y axis
  drawLine(axisLayer, 0, bounds.yMin, 0, bounds.yMax, "axis-line");

  // Ticks along X axis
  const firstXTick = Math.ceil(bounds.xMin / halfTick - 1e-10);
  const lastXTick = Math.floor(bounds.xMax / halfTick + 1e-10);
  for (let tickIndex = firstXTick; tickIndex <= lastXTick; tickIndex += 1) {
    const x = tickIndex * halfTick;
    if (Math.abs(x) < 0.0001) continue;

    const isFullUnit = tickIndex % 2 === 0;
    const tickSize = isFullUnit ? tickSizeFullInch : tickSizeHalfInch;
    const className = isFullUnit ? "tick-full" : "tick-half";

    drawLine(axisLayer, x, -tickSize, x, tickSize, className);
  }

  // Ticks along Y axis
  const firstYTick = Math.ceil(bounds.yMin / halfTick - 1e-10);
  const lastYTick = Math.floor(bounds.yMax / halfTick + 1e-10);
  for (let tickIndex = firstYTick; tickIndex <= lastYTick; tickIndex += 1) {
    const y = tickIndex * halfTick;
    if (Math.abs(y) < 0.0001) continue;

    const isFullUnit = tickIndex % 2 === 0;
    const tickSize = isFullUnit ? tickSizeFullInch : tickSizeHalfInch;
    const className = isFullUnit ? "tick-full" : "tick-half";

    drawLine(axisLayer, -tickSize, y, tickSize, y, className);
  }
}

function applyApplicationIdentity() {
  const displayVersion = `V${APP_VERSION}`;
  document.title = `${APP_NAME} ${displayVersion}`;
  const versionMetadata = document.querySelector('meta[name="version"]');
  const headerVersion = document.querySelector(".app-version");
  if (versionMetadata) versionMetadata.content = APP_VERSION;
  if (headerVersion) headerVersion.textContent = displayVersion;
  aboutVersion.textContent = `${APP_NAME} ${displayVersion}`;
}

let textMeasurementContext = null;

function getCadTextWidth(content, height) {
  const normalizedContent = String(content ?? "");
  if (!normalizedContent || !Number.isFinite(height) || height <= 0) return 0;
  if (!textMeasurementContext) {
    textMeasurementContext = document.createElement("canvas").getContext("2d");
  }
  if (!textMeasurementContext) {
    return Math.max(height * 0.35, normalizedContent.length * height * 0.55);
  }
  const measurementSize = 1000;
  textMeasurementContext.font =
    `${measurementSize}px "Atkinson Hyperlegible", sans-serif`;
  return Math.max(
    height * 0.35,
    (textMeasurementContext.measureText(normalizedContent).width /
      measurementSize) *
      height,
  );
}

function getTextEntityBounds(entity) {
  if (
    !entity ||
    !Number.isFinite(entity.x) ||
    !Number.isFinite(entity.y) ||
    !Number.isFinite(entity.height) ||
    entity.height <= 0
  ) {
    return null;
  }
  const width = getCadTextWidth(entity.content, entity.height);
  return {
    minX: entity.x - width / 2,
    minY: entity.y,
    maxX: entity.x + width / 2,
    maxY: entity.y + entity.height,
    width,
    height: entity.height,
  };
}

function createCadTextElement(entity, className) {
  const text = createSvgElement("text", {
    x: entity.x,
    y: -entity.y,
    transform: "scale(1 -1)",
    class: className,
    "font-size": entity.height,
    "text-anchor": "middle",
    "dominant-baseline": "text-after-edge",
  });
  text.textContent = entity.content;
  return text;
}

function clampViewportValue(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getDocumentGeometryBounds() {
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  function includePoint(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    bounds.minX = Math.min(bounds.minX, x);
    bounds.minY = Math.min(bounds.minY, y);
    bounds.maxX = Math.max(bounds.maxX, x);
    bounds.maxY = Math.max(bounds.maxY, y);
  }

  documentModel.entities.forEach((entity) => {
    if (!isEntityLayerVisible(entity)) return;
    if (entity.type === "point") {
      if (!entity.isConstruction) includePoint(entity.x, entity.y);
      return;
    }

    if (entity.type === "line") {
      const endpoints = getLineEndpointPair(entity);
      if (!endpoints) return;
      includePoint(endpoints.startPoint.x, endpoints.startPoint.y);
      includePoint(endpoints.endPoint.x, endpoints.endPoint.y);
      return;
    }

    if (entity.type === "circle") {
      const centerPoint = getPointById(entity.centerPointId);
      if (!centerPoint || !Number.isFinite(entity.radius)) return;
      includePoint(
        centerPoint.x - entity.radius,
        centerPoint.y - entity.radius,
      );
      includePoint(
        centerPoint.x + entity.radius,
        centerPoint.y + entity.radius,
      );
      return;
    }

    if (entity.type === "text") {
      const textBounds = getTextEntityBounds(entity);
      if (!textBounds) return;
      includePoint(textBounds.minX, textBounds.minY);
      includePoint(textBounds.maxX, textBounds.maxY);
      return;
    }

    if (entity.type === "dimension") {
      if (entity.dimensionType === "linear") {
        includePoint(entity.startX, entity.startY);
        includePoint(entity.endX, entity.endY);
        includePoint(entity.dimensionStartX, entity.dimensionStartY);
        includePoint(entity.dimensionEndX, entity.dimensionEndY);
      } else if (
        entity.dimensionType === "radius" ||
        entity.dimensionType === "diameter" ||
        entity.dimensionType === "angle"
      ) {
        const displayRadius = entity.radius + 0.3 / viewState.zoom;
        includePoint(
          entity.centerX - displayRadius,
          entity.centerY - displayRadius,
        );
        includePoint(
          entity.centerX + displayRadius,
          entity.centerY + displayRadius,
        );
      }
      return;
    }

    if (entity.type !== "arc") return;
    const centerPoint = getPointById(entity.centerPointId);
    const startPoint = getPointById(entity.startPointId);
    const endPoint = getPointById(entity.endPointId);
    if (
      !centerPoint ||
      !startPoint ||
      !endPoint ||
      !Number.isFinite(entity.radius)
    ) {
      return;
    }

    const startAngle = Math.atan2(
      startPoint.y - centerPoint.y,
      startPoint.x - centerPoint.x,
    );
    const endAngle = Math.atan2(
      endPoint.y - centerPoint.y,
      endPoint.x - centerPoint.x,
    );
    includePoint(startPoint.x, startPoint.y);
    includePoint(endPoint.x, endPoint.y);
    [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].forEach((angle) => {
      if (!isAngleOnCounterClockwiseArc(angle, startAngle, endAngle)) return;
      includePoint(
        centerPoint.x + Math.cos(angle) * entity.radius,
        centerPoint.y + Math.sin(angle) * entity.radius,
      );
    });
  });

  return Number.isFinite(bounds.minX) ? bounds : null;
}

function getViewportScrollMetrics() {
  const viewWidth = viewState.viewWidth;
  const viewHeight = viewState.viewHeight;
  const homeBounds = {
    minX: ORIGIN.x - viewWidth / 2,
    maxX: ORIGIN.x + viewWidth / 2,
    minY: ORIGIN.y - viewHeight / 2,
    maxY: ORIGIN.y + viewHeight / 2,
  };
  const geometryBounds = getDocumentGeometryBounds();
  const paddingX = Math.max(viewWidth * 0.025, 0.05);
  const paddingY = Math.max(viewHeight * 0.025, 0.05);
  const contentBounds = { ...homeBounds };

  if (viewState.navigationAnchor) {
    contentBounds.minX = Math.min(
      contentBounds.minX,
      viewState.navigationAnchor.x - viewWidth / 2,
    );
    contentBounds.maxX = Math.max(
      contentBounds.maxX,
      viewState.navigationAnchor.x + viewWidth / 2,
    );
    contentBounds.minY = Math.min(
      contentBounds.minY,
      viewState.navigationAnchor.y - viewHeight / 2,
    );
    contentBounds.maxY = Math.max(
      contentBounds.maxY,
      viewState.navigationAnchor.y + viewHeight / 2,
    );
  }

  if (geometryBounds) {
    if (geometryBounds.minX < homeBounds.minX - GEOMETRY_EPSILON) {
      contentBounds.minX = geometryBounds.minX - paddingX;
    }
    if (geometryBounds.maxX > homeBounds.maxX + GEOMETRY_EPSILON) {
      contentBounds.maxX = geometryBounds.maxX + paddingX;
    }
    if (geometryBounds.minY < homeBounds.minY - GEOMETRY_EPSILON) {
      contentBounds.minY = geometryBounds.minY - paddingY;
    }
    if (geometryBounds.maxY > homeBounds.maxY + GEOMETRY_EPSILON) {
      contentBounds.maxY = geometryBounds.maxY + paddingY;
    }
  }

  const horizontal = {
    minCenter: contentBounds.minX + viewWidth / 2,
    maxCenter: contentBounds.maxX - viewWidth / 2,
    contentSize: contentBounds.maxX - contentBounds.minX,
    viewSize: viewWidth,
  };
  const vertical = {
    minCenter: contentBounds.minY + viewHeight / 2,
    maxCenter: contentBounds.maxY - viewHeight / 2,
    contentSize: contentBounds.maxY - contentBounds.minY,
    viewSize: viewHeight,
  };
  horizontal.enabled =
    horizontal.maxCenter - horizontal.minCenter > GEOMETRY_EPSILON;
  vertical.enabled = vertical.maxCenter - vertical.minCenter > GEOMETRY_EPSILON;

  if (!horizontal.enabled) {
    horizontal.minCenter = ORIGIN.x;
    horizontal.maxCenter = ORIGIN.x;
  }
  if (!vertical.enabled) {
    vertical.minCenter = ORIGIN.y;
    vertical.maxCenter = ORIGIN.y;
  }

  return { horizontal, vertical };
}

function updateCadScrollbarUi(metrics) {
  const scrollbarDefinitions = [
    {
      axis: "horizontal",
      container: cadHorizontalScrollbar,
      track: cadHorizontalTrack,
      thumb: cadHorizontalThumb,
      buttons: [cadScrollLeft, cadScrollRight],
      center: viewState.centerX,
      trackSize: cadHorizontalTrack.clientWidth,
      sizeProperty: "width",
      positionProperty: "left",
    },
    {
      axis: "vertical",
      container: cadVerticalScrollbar,
      track: cadVerticalTrack,
      thumb: cadVerticalThumb,
      buttons: [cadScrollUp, cadScrollDown],
      center: viewState.centerY,
      trackSize: cadVerticalTrack.clientHeight,
      sizeProperty: "height",
      positionProperty: "top",
    },
  ];

  scrollbarDefinitions.forEach((definition) => {
    const axisMetrics = metrics[definition.axis];
    const enabled = axisMetrics.enabled && definition.trackSize > 0;
    definition.container.classList.toggle("is-disabled", !enabled);
    definition.buttons.forEach((button) => {
      button.disabled = !enabled;
    });
    definition.track.setAttribute("aria-disabled", String(!enabled));
    definition.track.tabIndex = enabled ? 0 : -1;

    if (!enabled) {
      definition.thumb.style[definition.positionProperty] = "0px";
      definition.thumb.style[definition.sizeProperty] = "100%";
      definition.track.setAttribute("aria-valuenow", "0");
      return;
    }

    const centerRange = axisMetrics.maxCenter - axisMetrics.minCenter;
    let ratio = (definition.center - axisMetrics.minCenter) / centerRange;
    if (definition.axis === "vertical") ratio = 1 - ratio;
    ratio = clampViewportValue(ratio, 0, 1);
    const thumbSize = Math.min(
      definition.trackSize,
      Math.max(
        20,
        definition.trackSize * (axisMetrics.viewSize / axisMetrics.contentSize),
      ),
    );
    const thumbPosition = ratio * (definition.trackSize - thumbSize);
    definition.thumb.style[definition.sizeProperty] = `${thumbSize}px`;
    definition.thumb.style[definition.positionProperty] = `${thumbPosition}px`;
    definition.track.setAttribute(
      "aria-valuenow",
      String(Math.round(ratio * 100)),
    );
  });
}

function syncIsometricViewport() {
  const displayView = isometricViewState.displayView;
  if (!displayView) return;
  const { cosYaw, sinYaw, cosPitch, sinPitch } =
    getIsometricProjectionComponents();
  worldLayer.setAttribute(
    "transform",
    `matrix(${cosYaw} ${-sinYaw * sinPitch} ${-sinYaw} ${-cosYaw * sinPitch} 0 0)`,
  );

  const xMin = displayView.centerX - displayView.viewWidth / 2;
  const xMax = displayView.centerX + displayView.viewWidth / 2;
  const yMin = displayView.centerY - displayView.viewHeight / 2;
  const yMax = displayView.centerY + displayView.viewHeight / 2;
  VIEW.xMin = xMin;
  VIEW.xMax = xMax;
  VIEW.yMin = yMin;
  VIEW.yMax = yMax;
  cadCanvas.setAttribute(
    "viewBox",
    `${xMin} ${-yMax} ${displayView.viewWidth} ${displayView.viewHeight}`,
  );
  const sourceBounds = getIsometricSourceViewportBounds(displayView);
  if (sourceBounds) drawAxesAndTicks(sourceBounds);
  setIsometricScrollbarsDisabled(displayView);
}

function syncViewportToDocument() {
  if (isometricViewState.active && isometricViewState.displayView) {
    syncIsometricViewport();
    return;
  }
  if (
    !Number.isFinite(viewState.viewWidth) ||
    !Number.isFinite(viewState.viewHeight) ||
    viewState.viewWidth <= 0 ||
    viewState.viewHeight <= 0
  ) {
    return;
  }

  const metrics = getViewportScrollMetrics();
  viewportScrollState.horizontal = metrics.horizontal;
  viewportScrollState.vertical = metrics.vertical;
  viewState.centerX = clampViewportValue(
    viewState.centerX,
    metrics.horizontal.minCenter,
    metrics.horizontal.maxCenter,
  );
  viewState.centerY = clampViewportValue(
    viewState.centerY,
    metrics.vertical.minCenter,
    metrics.vertical.maxCenter,
  );

  VIEW.xMin = viewState.centerX - viewState.viewWidth / 2;
  VIEW.xMax = viewState.centerX + viewState.viewWidth / 2;
  VIEW.yMin = viewState.centerY - viewState.viewHeight / 2;
  VIEW.yMax = viewState.centerY + viewState.viewHeight / 2;

  cadCanvas.setAttribute(
    "viewBox",
    `${VIEW.xMin} ${-VIEW.yMax} ${viewState.viewWidth} ${viewState.viewHeight}`,
  );
  drawAxesAndTicks();
  updateCadScrollbarUi(metrics);
}

function getCanvasBaseViewSize(pixelWidth, pixelHeight) {
  if (pixelWidth <= 0 || pixelHeight <= 0) return null;
  const canvasAspect = pixelWidth / pixelHeight;
  const baseAspect = BASE_VIEW.width / BASE_VIEW.height;
  let viewWidth = BASE_VIEW.width;
  let viewHeight = BASE_VIEW.height;

  if (canvasAspect > baseAspect) {
    viewWidth = viewHeight * canvasAspect;
  } else {
    viewHeight = viewWidth / canvasAspect;
  }

  return { width: viewWidth, height: viewHeight };
}

function getFitViewParameters(bounds, pixelWidth, pixelHeight) {
  const baseView = getCanvasBaseViewSize(pixelWidth, pixelHeight);
  if (!bounds || !baseView) return null;

  const geometryWidth = Math.max(0, bounds.maxX - bounds.minX);
  const geometryHeight = Math.max(0, bounds.maxY - bounds.minY);
  const largestSpan = Math.max(geometryWidth, geometryHeight, 1);
  const minimumSpan = Math.max(largestSpan * 0.05, 0.5);
  const paddedWidth = Math.max(geometryWidth * 1.15, minimumSpan);
  const paddedHeight = Math.max(geometryHeight * 1.15, minimumSpan);
  const zoom = Math.max(
    1e-6,
    Math.min(
      MAX_ZOOM,
      baseView.width / paddedWidth,
      baseView.height / paddedHeight,
    ),
  );

  return {
    centerX: (bounds.minX + bounds.maxX) / 2,
    centerY: (bounds.minY + bounds.maxY) / 2,
    zoom,
  };
}

function getIsometricProjectionComponents() {
  return {
    cosYaw: Math.cos(isometricViewState.yaw),
    sinYaw: Math.sin(isometricViewState.yaw),
    cosPitch: Math.cos(isometricViewState.pitch),
    sinPitch: Math.sin(isometricViewState.pitch),
  };
}

function projectWorldPointToIsometric(point) {
  const { cosYaw, sinYaw, cosPitch, sinPitch } =
    getIsometricProjectionComponents();
  const z = Number.isFinite(point.z) ? point.z : 0;
  const horizontalDepth = point.x * sinYaw + point.y * cosYaw;
  return {
    x: point.x * cosYaw - point.y * sinYaw,
    y: z * cosPitch + horizontalDepth * sinPitch,
    depth: -horizontalDepth * cosPitch + z * sinPitch,
  };
}

function unprojectIsometricPoint(point) {
  const { cosYaw, sinYaw, sinPitch } =
    getIsometricProjectionComponents();
  const minimumPitchScale = 0.035;
  const safeSinPitch =
    Math.abs(sinPitch) < minimumPitchScale
      ? Math.sign(sinPitch || 1) * minimumPitchScale
      : sinPitch;
  const horizontalDepth = point.y / safeSinPitch;
  return {
    x: point.x * cosYaw + horizontalDepth * sinYaw,
    y: -point.x * sinYaw + horizontalDepth * cosYaw,
    z: 0,
  };
}

function createEmptyBounds() {
  return {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };
}

function includePointInBounds(bounds, point) {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
  bounds.minX = Math.min(bounds.minX, point.x);
  bounds.minY = Math.min(bounds.minY, point.y);
  bounds.maxX = Math.max(bounds.maxX, point.x);
  bounds.maxY = Math.max(bounds.maxY, point.y);
}

function finalizeBounds(bounds) {
  return Number.isFinite(bounds.minX) ? bounds : null;
}

function rotateModelPointAroundAxes(point, rotation) {
  let { x, y, z } = point;
  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);
  [y, z] = [y * cosX - z * sinX, y * sinX + z * cosX];
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  [x, z] = [x * cosY + z * sinY, -x * sinY + z * cosY];
  const cosZ = Math.cos(rotation.z);
  const sinZ = Math.sin(rotation.z);
  [x, y] = [x * cosZ - y * sinZ, x * sinZ + y * cosZ];
  return { x, y, z };
}

function transformSolidVertex(solid, vertex) {
  return transformPointByMatrix4(normalizeSolidTransform(solid).matrix, vertex);
}

function getSolidLocalVertices(solid) {
  const vertices = solid.topology?.vertices ?? solid.geometry?.vertices;
  return Array.isArray(vertices) ? vertices : [];
}

function getSolidWorldVertices(solid) {
  return getSolidLocalVertices(solid)
    .filter(
      (vertex) =>
        Number.isFinite(vertex?.x) &&
        Number.isFinite(vertex?.y) &&
        Number.isFinite(vertex?.z),
    )
    .map((vertex) => transformSolidVertex(solid, vertex));
}

function subtractVector3(first, second) {
  return {
    x: first.x - second.x,
    y: first.y - second.y,
    z: first.z - second.z,
  };
}

function crossVector3(first, second) {
  return {
    x: first.y * second.z - first.z * second.y,
    y: first.z * second.x - first.x * second.z,
    z: first.x * second.y - first.y * second.x,
  };
}

function dotVector3(first, second) {
  return first.x * second.x + first.y * second.y + first.z * second.z;
}

function getVector3Length(vector) {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function getNormalizedVector3(vector) {
  const length = getVector3Length(vector);
  if (!Number.isFinite(length) || length <= GEOMETRY_EPSILON) return null;
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };
}

function getPolygonNormal(vertices) {
  if (vertices.length < 3) return null;
  return getNormalizedVector3(
    crossVector3(
      subtractVector3(vertices[1], vertices[0]),
      subtractVector3(vertices[2], vertices[0]),
    ),
  );
}

function getPolyhedronSignedVolume(vertices, faces) {
  const vertexById = new Map(vertices.map((vertex) => [vertex.id, vertex]));
  let sixTimesVolume = 0;
  faces.forEach((face) => {
    const polygon = face.vertexIds.map((vertexId) => vertexById.get(vertexId));
    for (let index = 1; index < polygon.length - 1; index += 1) {
      sixTimesVolume += dotVector3(
        polygon[0],
        crossVector3(polygon[index], polygon[index + 1]),
      );
    }
  });
  return sixTimesVolume / 6;
}

function buildBoxSolid({
  id,
  layerId,
  x,
  y,
  z,
  length,
  width,
  height,
  draftAngleDegrees,
}) {
  const inputValues = [x, y, z, length, width, height, draftAngleDegrees];
  if (!inputValues.every(Number.isFinite)) {
    throw new Error("Box values must all be finite numbers.");
  }
  if (length <= GEOMETRY_EPSILON) {
    throw new Error("Box length must be greater than zero.");
  }
  if (width <= GEOMETRY_EPSILON) {
    throw new Error("Box width must be greater than zero.");
  }
  if (height <= GEOMETRY_EPSILON) {
    throw new Error("Box height must be greater than zero.");
  }
  if (Math.abs(draftAngleDegrees) >= 90) {
    throw new Error("Draft angle must be greater than -90° and less than 90°.");
  }

  const draftRadians = (draftAngleDegrees * Math.PI) / 180;
  const draftInset = height * Math.tan(draftRadians);
  const topLength = length - 2 * draftInset;
  const topWidth = width - 2 * draftInset;
  if (!Number.isFinite(topLength) || !Number.isFinite(topWidth)) {
    throw new Error("Draft angle produces non-finite top dimensions.");
  }
  if (topLength <= GEOMETRY_EPSILON || topWidth <= GEOMETRY_EPSILON) {
    throw new Error(
      "Draft angle collapses or inverts the top face; reduce the positive draft angle.",
    );
  }

  const halfBottomLength = length / 2;
  const halfBottomWidth = width / 2;
  const halfTopLength = topLength / 2;
  const halfTopWidth = topWidth / 2;
  const topZ = z + height;
  const vertices = [
    { id: "v0", x: x - halfBottomLength, y: y - halfBottomWidth, z },
    { id: "v1", x: x + halfBottomLength, y: y - halfBottomWidth, z },
    { id: "v2", x: x + halfBottomLength, y: y + halfBottomWidth, z },
    { id: "v3", x: x - halfBottomLength, y: y + halfBottomWidth, z },
    { id: "v4", x: x - halfTopLength, y: y - halfTopWidth, z: topZ },
    { id: "v5", x: x + halfTopLength, y: y - halfTopWidth, z: topZ },
    { id: "v6", x: x + halfTopLength, y: y + halfTopWidth, z: topZ },
    { id: "v7", x: x - halfTopLength, y: y + halfTopWidth, z: topZ },
  ];
  const faceSpecifications = [
    { id: "bottom", name: "Bottom", vertexIds: ["v0", "v3", "v2", "v1"], edgeIds: ["e3", "e2", "e1", "e0"] },
    { id: "top", name: "Top", vertexIds: ["v4", "v5", "v6", "v7"], edgeIds: ["e4", "e5", "e6", "e7"] },
    { id: "front", name: "Front", vertexIds: ["v0", "v1", "v5", "v4"], edgeIds: ["e0", "e9", "e4", "e8"] },
    { id: "right", name: "Right", vertexIds: ["v1", "v2", "v6", "v5"], edgeIds: ["e1", "e10", "e5", "e9"] },
    { id: "back", name: "Back", vertexIds: ["v2", "v3", "v7", "v6"], edgeIds: ["e2", "e11", "e6", "e10"] },
    { id: "left", name: "Left", vertexIds: ["v3", "v0", "v4", "v7"], edgeIds: ["e3", "e8", "e7", "e11"] },
  ];
  const vertexById = new Map(vertices.map((vertex) => [vertex.id, vertex]));
  const faces = faceSpecifications.map((face) => {
    const polygon = face.vertexIds.map((vertexId) => vertexById.get(vertexId));
    const normal = getPolygonNormal(polygon);
    if (!normal) throw new Error(`Box ${face.name.toLowerCase()} face is degenerate.`);
    return {
      ...face,
      normal,
      plane: {
        point: { ...polygon[0] },
        normal: { ...normal },
      },
    };
  });
  const edgeSpecifications = [
    ["v0", "v1"], ["v1", "v2"], ["v2", "v3"], ["v3", "v0"],
    ["v4", "v5"], ["v5", "v6"], ["v6", "v7"], ["v7", "v4"],
    ["v0", "v4"], ["v1", "v5"], ["v2", "v6"], ["v3", "v7"],
  ];
  const edges = edgeSpecifications.map((vertexIds, index) => {
    const edgeId = `e${index}`;
    return {
      id: edgeId,
      vertexIds,
      faceIds: faces
        .filter((face) => face.edgeIds.includes(edgeId))
        .map((face) => face.id),
    };
  });
  if (edges.some((edge) => edge.faceIds.length !== 2)) {
    throw new Error("Box topology is not closed.");
  }
  const signedVolume = getPolyhedronSignedVolume(vertices, faces);
  if (!Number.isFinite(signedVolume) || signedVolume <= GEOMETRY_EPSILON) {
    throw new Error("Box topology has zero or inverted volume.");
  }

  return {
    id,
    type: "solid",
    kind: "Box",
    layerId,
    definition: {
      type: "box",
      position: { x, y, z },
      dimensions: { length, width, height },
      draftAngleDegrees,
      topDimensions: { length: topLength, width: topWidth },
    },
    topology: {
      vertices,
      edges,
      faces,
      closed: true,
      eulerCharacteristic: vertices.length - edges.length + faces.length,
      signedVolume,
    },
    transform: getDefaultSolidTransform(),
  };
}

function getSolidFaceRecords(solid) {
  const localVertices = getSolidLocalVertices(solid);
  const vertexIndexById = new Map(
    localVertices.map((vertex, index) => [vertex.id ?? index, index]),
  );
  if (Array.isArray(solid.topology?.faces)) {
    return solid.topology.faces.map((face, faceIndex) => ({
      id: face.id ?? `face-${faceIndex}`,
      name: face.name ?? `Face ${faceIndex + 1}`,
      faceIndex,
      vertexIndices: face.vertexIds.map((vertexId) => vertexIndexById.get(vertexId)),
    }));
  }
  return Array.isArray(solid.geometry?.faces)
    ? solid.geometry.faces.map((face, faceIndex) => ({
        id: `face-${faceIndex}`,
        name: `Face ${faceIndex + 1}`,
        faceIndex,
        vertexIndices: face,
      }))
    : [];
}

function getModelBounds(solids = documentModel.model3d.solids) {
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    minZ: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    maxZ: -Infinity,
  };
  solids.forEach((solid) => {
    if (!isEntityLayerVisible(solid)) return;
    getSolidWorldVertices(solid).forEach((vertex) => {
      bounds.minX = Math.min(bounds.minX, vertex.x);
      bounds.minY = Math.min(bounds.minY, vertex.y);
      bounds.minZ = Math.min(bounds.minZ, vertex.z);
      bounds.maxX = Math.max(bounds.maxX, vertex.x);
      bounds.maxY = Math.max(bounds.maxY, vertex.y);
      bounds.maxZ = Math.max(bounds.maxZ, vertex.z);
    });
  });
  return Number.isFinite(bounds.minX) ? bounds : null;
}

function getModelBoundsCenter(bounds) {
  return bounds
    ? {
        x: (bounds.minX + bounds.maxX) / 2,
        y: (bounds.minY + bounds.maxY) / 2,
        z: (bounds.minZ + bounds.maxZ) / 2,
      }
    : null;
}

function getIsometricGeometryBounds() {
  const bounds = createEmptyBounds();
  const includeWorldPoint = (point) => {
    if (!point) return;
    includePointInBounds(bounds, projectWorldPointToIsometric(point));
  };
  const includeCircleSamples = (centerPoint, radius, startAngle, sweep) => {
    if (!centerPoint || !Number.isFinite(radius)) return;
    const sampleCount = Math.max(32, Math.ceil((sweep / (Math.PI * 2)) * 96));
    for (let index = 0; index <= sampleCount; index += 1) {
      const angle = startAngle + (sweep * index) / sampleCount;
      includeWorldPoint({
        x: centerPoint.x + Math.cos(angle) * radius,
        y: centerPoint.y + Math.sin(angle) * radius,
      });
    }
  };

  documentModel.entities.forEach((entity) => {
    if (!isEntityLayerVisible(entity)) return;
    if (entity.type === "point") {
      if (!entity.isConstruction) includeWorldPoint(entity);
      return;
    }
    if (entity.type === "line") {
      const endpoints = getLineEndpointPair(entity);
      if (!endpoints) return;
      includeWorldPoint(endpoints.startPoint);
      includeWorldPoint(endpoints.endPoint);
      return;
    }
    if (entity.type === "circle") {
      includeCircleSamples(
        getPointById(entity.centerPointId),
        entity.radius,
        0,
        Math.PI * 2,
      );
      return;
    }
    if (entity.type === "arc") {
      const centerPoint = getPointById(entity.centerPointId);
      const startPoint = getPointById(entity.startPointId);
      const endPoint = getPointById(entity.endPointId);
      if (!centerPoint || !startPoint || !endPoint) return;
      const startAngle = Math.atan2(
        startPoint.y - centerPoint.y,
        startPoint.x - centerPoint.x,
      );
      const endAngle = Math.atan2(
        endPoint.y - centerPoint.y,
        endPoint.x - centerPoint.x,
      );
      includeCircleSamples(
        centerPoint,
        entity.radius,
        startAngle,
        getCounterClockwiseSweep(startAngle, endAngle),
      );
      return;
    }
    if (entity.type === "text") {
      const textBounds = getTextEntityBounds(entity);
      if (!textBounds) return;
      [
        { x: textBounds.minX, y: textBounds.minY },
        { x: textBounds.maxX, y: textBounds.minY },
        { x: textBounds.maxX, y: textBounds.maxY },
        { x: textBounds.minX, y: textBounds.maxY },
      ].forEach(includeWorldPoint);
      return;
    }
    if (entity.type !== "dimension") return;
    if (entity.dimensionType === "linear") {
      [
        { x: entity.startX, y: entity.startY },
        { x: entity.endX, y: entity.endY },
        { x: entity.dimensionStartX, y: entity.dimensionStartY },
        { x: entity.dimensionEndX, y: entity.dimensionEndY },
      ].forEach(includeWorldPoint);
      return;
    }
    if (
      entity.dimensionType === "radius" ||
      entity.dimensionType === "diameter" ||
      entity.dimensionType === "angle"
    ) {
      includeCircleSamples(
        { x: entity.centerX, y: entity.centerY },
        entity.radius + 0.3 / Math.max(viewState.zoom, 1e-6),
        0,
        Math.PI * 2,
      );
    }
  });

  documentModel.model3d.solids.forEach((solid) => {
    if (!isEntityLayerVisible(solid)) return;
    getSolidWorldVertices(solid).forEach(includeWorldPoint);
  });

  return finalizeBounds(bounds);
}

function getIsometricHomeBounds() {
  const baseView =
    getCanvasBaseViewSize(cadCanvas.clientWidth, cadCanvas.clientHeight) ??
    BASE_VIEW;
  const bounds = createEmptyBounds();
  [
    { x: -baseView.width / 2, y: -baseView.height / 2 },
    { x: -baseView.width / 2, y: baseView.height / 2 },
    { x: baseView.width / 2, y: -baseView.height / 2 },
    { x: baseView.width / 2, y: baseView.height / 2 },
  ].forEach((point) =>
    includePointInBounds(bounds, projectWorldPointToIsometric(point)),
  );
  return finalizeBounds(bounds);
}

function getIsometricDisplayView() {
  const geometryBounds = getIsometricGeometryBounds();
  const bounds = geometryBounds ?? getIsometricHomeBounds();
  const baseView = getCanvasBaseViewSize(
    cadCanvas.clientWidth,
    cadCanvas.clientHeight,
  );
  const fittedView = getFitViewParameters(
    bounds,
    cadCanvas.clientWidth,
    cadCanvas.clientHeight,
  );
  if (!baseView || !fittedView) return null;
  return {
    centerX: fittedView.centerX,
    centerY: fittedView.centerY,
    zoom: fittedView.zoom,
    viewWidth: baseView.width / fittedView.zoom,
    viewHeight: baseView.height / fittedView.zoom,
    hasGeometry: geometryBounds !== null,
  };
}

function getIsometricSourceViewportBounds(displayView) {
  const bounds = createEmptyBounds();
  const xMin = displayView.centerX - displayView.viewWidth / 2;
  const xMax = displayView.centerX + displayView.viewWidth / 2;
  const yMin = displayView.centerY - displayView.viewHeight / 2;
  const yMax = displayView.centerY + displayView.viewHeight / 2;
  [
    { x: xMin, y: yMin },
    { x: xMin, y: yMax },
    { x: xMax, y: yMin },
    { x: xMax, y: yMax },
  ].forEach((point) =>
    includePointInBounds(bounds, unprojectIsometricPoint(point)),
  );
  return finalizeBounds(bounds);
}

function setIsometricScrollbarsDisabled(displayView) {
  const horizontal = {
    enabled: false,
    minCenter: displayView.centerX,
    maxCenter: displayView.centerX,
    contentSize: displayView.viewWidth,
    viewSize: displayView.viewWidth,
  };
  const vertical = {
    enabled: false,
    minCenter: displayView.centerY,
    maxCenter: displayView.centerY,
    contentSize: displayView.viewHeight,
    viewSize: displayView.viewHeight,
  };
  viewportScrollState.horizontal = horizontal;
  viewportScrollState.vertical = vertical;
  updateCadScrollbarUi({ horizontal, vertical });
}

function refreshIsometricView({ refit = false } = {}) {
  if (!isometricViewState.active) return false;
  const baseView = getCanvasBaseViewSize(
    cadCanvas.clientWidth,
    cadCanvas.clientHeight,
  );
  if (!baseView) return false;

  let displayView = isometricViewState.displayView;
  if (refit || !displayView) {
    for (let pass = 0; pass < 3; pass += 1) {
      displayView = getIsometricDisplayView();
      if (!displayView) return false;
      viewState.zoom = displayView.zoom;
    }
  } else {
    const geometryBounds = getIsometricGeometryBounds();
    displayView = {
      ...displayView,
      viewWidth: baseView.width / displayView.zoom,
      viewHeight: baseView.height / displayView.zoom,
      hasGeometry: geometryBounds !== null,
    };
  }

  isometricViewState.displayView = displayView;
  isometricViewState.hasGeometry = displayView.hasGeometry;
  viewState.zoom = displayView.zoom;
  viewState.viewWidth = displayView.viewWidth;
  viewState.viewHeight = displayView.viewHeight;
  renderEntities();
  zoomStatus.textContent = `3D: ${Math.round(displayView.zoom * 100)}%`;
  return true;
}

function setWorkspaceMode(mode) {
  const nextMode = mode === "3d" ? "3d" : "2d";
  const modelMode = nextMode === "3d";
  workspaceState.mode = nextMode;
  document.body.dataset.workspace = nextMode;

  drawMenuItem.hidden = modelMode;
  modelMenuItem.hidden = !modelMode;
  drawMenuItem.classList.remove("is-hover-retained", "is-dismissed");
  modelMenuItem.classList.remove("is-hover-retained", "is-dismissed");
  mirrorCopyInput.checked = false;
  if (modelMode) {
    selectionState.mode = null;
    selectionState.hoveredEntityId = null;
    selectionState.pickCycle = null;
    resetChainSelectionPreview();
    cadCanvas.classList.remove("select-single");
  }

  trimExtendMenu.hidden = modelMode;
  offsetMenu.disabled = modelMode;
  offsetMenu.title = modelMode
    ? "Face and surface Offset is planned for the 3D workspace."
    : "";
  translateByPointsMenu.disabled = modelMode;
  translateByPointsMenu.title = modelMode
    ? "Translate by 3D reference points is planned."
    : "";

  mirrorXAxisLabel.textContent = modelMode ? "XY Plane" : "X Axis";
  mirrorYAxisLabel.textContent = modelMode ? "XZ Plane" : "Y Axis";
  mirrorBothAxesLabel.textContent = modelMode ? "YZ Plane" : "X and Y Axis";
  mirrorXAxisMenu.title = modelMode
    ? "Reflect across the XY plane; reverse Z."
    : "";
  mirrorYAxisMenu.title = modelMode
    ? "Reflect across the XZ plane; reverse Y."
    : "";
  mirrorBothAxesMenu.title = modelMode
    ? "Reflect across the YZ plane; reverse X."
    : "";

  [
    selectChainMenu,
    selectLayerSubmenu,
    selectPointsMenu,
    selectLinesMenu,
    selectArcsMenu,
    selectDimensionsMenu,
  ].forEach((element) => {
    element.hidden = modelMode;
  });

  [
    linearDimensionMenu,
    diameterDimensionMenu,
    radiusDimensionMenu,
    angleDimensionMenu,
  ].forEach((button) => {
    button.hidden = modelMode;
  });
  modelDimensionPlaceholder.hidden = !modelMode;
  updateTrihedronMenuState();
  trihedronLayer.toggleAttribute(
    "hidden",
    !modelMode || !trihedronState.visible,
  );

  windowZoomMenu.disabled = modelMode;
  windowZoomMenu.title = modelMode
    ? "Left drag performs 3D Window or Crossing selection."
    : "";
  quickZoomWindowButton.disabled = modelMode;
  quickZoomWindowButton.title = modelMode
    ? "3D left drag is reserved for Window or Crossing selection"
    : "Zoom Window";

  translateZField.hidden = !modelMode;
  rotatePivotOptions.hidden = modelMode;
  rotatePivotReadout.closest(".rotate-pivot-readout").hidden = modelMode;
  rotateAxisOptions.hidden = !modelMode;

  modelMenuItem.querySelectorAll("button:disabled").forEach((button) => {
    button.title = "Planned 3D modeling command";
  });
  updateEditMenuState();
}

function enterIsometricView() {
  cancelGeometryToolsForLayerChange();
  if (!aboutWindow.hidden) closeAboutWindow(null);
  isometricViewState.previousView = {
    zoom: viewState.zoom,
    centerX: viewState.centerX,
    centerY: viewState.centerY,
    viewWidth: viewState.viewWidth,
    viewHeight: viewState.viewHeight,
    navigationAnchor: viewState.navigationAnchor
      ? { ...viewState.navigationAnchor }
      : null,
    zoomStatus: zoomStatus.textContent,
  };
  isometricViewState.active = true;
  isometricViewState.yaw = ISOMETRIC_YAW_RADIANS;
  isometricViewState.pitch = ISOMETRIC_PITCH_RADIANS;
  isometricViewState.displayView = null;
  isometricViewState.pivotWorld = getIsometricOrbitPivotWorld();
  setWorkspaceMode("3d");
  cadCanvas.classList.add("isometric-view");
  quickIsometricButton.classList.add("is-active");
  quickIsometricButton.setAttribute("aria-pressed", "true");
  quickIsometricButton.setAttribute("aria-label", "Return to 2D view");
  quickIsometricButton.title = "Return to 2D";

  if (!refreshIsometricView({ refit: true })) {
    exitIsometricView(
      "Isometric view is unavailable until the drawing canvas has a size.",
    );
    return;
  }
  commandStatus.textContent = isometricViewState.hasGeometry
    ? "3D: Left click selects, left drag window/crossing selects, right drag orbits, middle drag pans, and the wheel zooms."
    : "3D: Home view. Right drag orbits, middle drag pans, and the wheel zooms.";
}

function exitIsometricView(
  statusMessage = "Returned to the previous 2D view.",
) {
  cancelGeometryToolsForLayerChange();
  const previousView = isometricViewState.previousView;
  cancelCanvasNavigation(null, { restore: false });
  isometricViewState.active = false;
  setWorkspaceMode("2d");
  isometricViewState.previousView = null;
  isometricViewState.displayView = null;
  isometricViewState.hasGeometry = false;
  isometricViewState.yaw = ISOMETRIC_YAW_RADIANS;
  isometricViewState.pitch = ISOMETRIC_PITCH_RADIANS;
  isometricViewState.pivotWorld = { x: 0, y: 0, z: 0 };
  cadCanvas.classList.remove(
    "isometric-view",
    "is-orbiting",
    "is-panning",
    "is-window-selecting",
  );
  quickIsometricButton.classList.remove("is-active");
  quickIsometricButton.setAttribute("aria-pressed", "false");
  quickIsometricButton.setAttribute("aria-label", "Enter 3D workspace");
  quickIsometricButton.title = "3D Workspace";
  worldLayer.setAttribute("transform", "scale(1 -1)");

  if (previousView) {
    viewState.zoom = previousView.zoom;
    viewState.centerX = previousView.centerX;
    viewState.centerY = previousView.centerY;
    viewState.viewWidth = previousView.viewWidth;
    viewState.viewHeight = previousView.viewHeight;
    viewState.navigationAnchor = previousView.navigationAnchor;
    zoomStatus.textContent = previousView.zoomStatus;
  }
  renderEntities();
  commandStatus.textContent = statusMessage;
}

function toggleIsometricView() {
  if (isometricViewState.active) {
    exitIsometricView();
    return;
  }
  enterIsometricView();
}

function includeEntityInNavigationBounds(bounds, entity) {
  const include = (point) => includePointInBounds(bounds, point);
  if (entity.type === "point") {
    if (!entity.isConstruction) include(entity);
    return;
  }
  if (entity.type === "line") {
    const endpoints = getLineEndpointPair(entity);
    if (!endpoints) return;
    include(endpoints.startPoint);
    include(endpoints.endPoint);
    return;
  }
  if (entity.type === "circle" || entity.type === "arc") {
    const center = getPointById(entity.centerPointId);
    if (!center || !Number.isFinite(entity.radius)) return;
    include({ x: center.x - entity.radius, y: center.y - entity.radius });
    include({ x: center.x + entity.radius, y: center.y + entity.radius });
    return;
  }
  if (entity.type === "text") {
    const textBounds = getTextEntityBounds(entity);
    if (!textBounds) return;
    include({ x: textBounds.minX, y: textBounds.minY });
    include({ x: textBounds.maxX, y: textBounds.maxY });
    return;
  }
  if (entity.type !== "dimension") return;
  if (entity.dimensionType === "linear") {
    include({ x: entity.startX, y: entity.startY });
    include({ x: entity.endX, y: entity.endY });
    include({ x: entity.dimensionStartX, y: entity.dimensionStartY });
    include({ x: entity.dimensionEndX, y: entity.dimensionEndY });
    return;
  }
  if (
    entity.dimensionType === "radius" ||
    entity.dimensionType === "diameter" ||
    entity.dimensionType === "angle"
  ) {
    include({
      x: entity.centerX - entity.radius,
      y: entity.centerY - entity.radius,
    });
    include({
      x: entity.centerX + entity.radius,
      y: entity.centerY + entity.radius,
    });
  }
}

function getIsometricOrbitPivotWorld() {
  const selectedSolids = getSelectedModelSolids();
  const selectedModelCenter = getModelBoundsCenter(
    getModelBounds(selectedSolids),
  );
  if (selectedModelCenter) return selectedModelCenter;

  const selectedBounds = createEmptyBounds();
  documentModel.entities.forEach((entity) => {
    if (
      selectionState.selectedEntityIds.has(entity.id) &&
      isEntityLayerVisible(entity)
    ) {
      includeEntityInNavigationBounds(selectedBounds, entity);
    }
  });
  const selected = finalizeBounds(selectedBounds);
  if (selected) {
    return {
      x: (selected.minX + selected.maxX) / 2,
      y: (selected.minY + selected.maxY) / 2,
      z: 0,
    };
  }

  const modelCenter = getModelBoundsCenter(getModelBounds());
  const drawingBounds = getDocumentGeometryBounds();
  if (modelCenter && !drawingBounds) return modelCenter;
  if (!modelCenter && drawingBounds) {
    return {
      x: (drawingBounds.minX + drawingBounds.maxX) / 2,
      y: (drawingBounds.minY + drawingBounds.maxY) / 2,
      z: 0,
    };
  }
  if (modelCenter && drawingBounds) {
    const modelBounds = getModelBounds();
    return {
      x:
        (Math.min(modelBounds.minX, drawingBounds.minX) +
          Math.max(modelBounds.maxX, drawingBounds.maxX)) /
        2,
      y:
        (Math.min(modelBounds.minY, drawingBounds.minY) +
          Math.max(modelBounds.maxY, drawingBounds.maxY)) /
        2,
      z: (modelBounds.minZ + modelBounds.maxZ) / 2,
    };
  }
  return { x: 0, y: 0, z: 0 };
}

function getCanvasSelectionEntityId(target) {
  const entityElement = target?.closest?.(
    ".point-entity, .line-entity, .circle-entity, .arc-entity, .text-entity, .dimension-entity, .face-entity, .solid-entity",
  );
  if (!entityElement) return null;
  const entityId = Number(entityElement.dataset.entityId);
  const entity = getEntityById(entityId);
  return entity &&
    isCurrentLayerEditable() &&
    isEntityOnCurrentLayer(entity) &&
    isEntityLayerVisible(entity) &&
    (entity.type !== "point" || !entity.isConstruction)
    ? entityId
    : null;
}

function getCanvasModelSelectionTarget(target) {
  const faceElement = target?.closest?.(".solid-face[data-solid-id]");
  if (faceElement) {
    const solidId = Number(faceElement.dataset.solidId);
    const faceIndex = Number(faceElement.dataset.faceIndex);
    const faceId = faceElement.dataset.faceId ?? `face-${faceIndex}`;
    const solid = getSolidById(solidId);
    if (
      solid &&
      isCurrentLayerEditable() &&
      isEntityOnCurrentLayer(solid) &&
      isEntityLayerVisible(solid)
    ) {
      return { solidId, faceIndex, faceId };
    }
  }
  const entityId = getCanvasSelectionEntityId(target);
  return entityId === null ? null : { entityId };
}

function setSelectionMarquee(startX, startY, currentX, currentY) {
  const areaBounds = drawingArea.getBoundingClientRect();
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  const crossing = currentX < startX;
  cadSelectionMarquee.hidden = false;
  cadSelectionMarquee.style.left = `${left - areaBounds.left}px`;
  cadSelectionMarquee.style.top = `${top - areaBounds.top}px`;
  cadSelectionMarquee.style.width = `${width}px`;
  cadSelectionMarquee.style.height = `${height}px`;
  cadSelectionMarquee.classList.toggle("is-crossing", crossing);
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    crossing,
  };
}

function hideSelectionMarquee() {
  cadSelectionMarquee.hidden = true;
  cadSelectionMarquee.classList.remove("is-crossing");
}

function selectIsometricTarget(targetSelection) {
  if (targetSelection === null) {
    const previousCount =
      selectionState.selectedEntityIds.size +
      modelSelectionState.selectedSolidIds.size;
    selectionState.selectedEntityId = null;
    selectionState.hoveredEntityId = null;
    selectionState.pickCycle = null;
    clearModelSelection();
    renderEntities();
    commandStatus.textContent = previousCount
      ? "3D selection cleared."
      : "3D: Click an entity to select it.";
    return;
  }
  if (Number.isInteger(targetSelection.solidId)) {
    const previousCount = modelSelectionState.selectedSolidIds.size;
    modelSelectionState.selectedSolidIds.add(targetSelection.solidId);
    modelSelectionState.selectedFace = {
      solidId: targetSelection.solidId,
      faceIndex: targetSelection.faceIndex,
      faceId: targetSelection.faceId,
    };
    const solid = getSolidById(targetSelection.solidId);
    const faceName =
      getSolidFaceRecords(solid).find(
        (face) => face.id === targetSelection.faceId,
      )?.name ?? `Face ${targetSelection.faceIndex + 1}`;
    renderEntities();
    commandStatus.textContent =
      `${modelSelectionState.selectedSolidIds.size > previousCount ? "Selected" : "Kept selected"} ` +
      `${getSolidDescription(solid)}, ${faceName.toLowerCase()} face; ` +
      `${modelSelectionState.selectedSolidIds.size} solid ` +
      `${modelSelectionState.selectedSolidIds.size === 1 ? "selection" : "selections"}.`;
    return;
  }
  const entityId = targetSelection.entityId;
  const previousCount = selectionState.selectedEntityIds.size;
  addEntityIdsToSelection([entityId]);
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  renderEntities();
  const entity = getEntityById(entityId);
  commandStatus.textContent =
    `${selectionState.selectedEntityIds.size > previousCount ? "Selected" : "Kept selected"} ` +
    `${entity?.type ?? "entity"} ${entityId}; ${selectionState.selectedEntityIds.size} total.`;
}

function selectEntitiesInScreenRectangle(screenBounds) {
  const selectedIds = [];
  const seenIds = new Set();
  entityLayer.querySelectorAll("[data-entity-id]").forEach((element) => {
    const entityId = Number(element.dataset.entityId);
    if (seenIds.has(entityId)) return;
    seenIds.add(entityId);
    const entity = getEntityById(entityId);
    if (
      !entity ||
      !isCurrentLayerEditable() ||
      !isEntityOnCurrentLayer(entity) ||
      !isEntityLayerVisible(entity) ||
      (entity.type === "point" && entity.isConstruction)
    ) {
      return;
    }
    const bounds = element.getBoundingClientRect();
    const intersects =
      bounds.right >= screenBounds.left &&
      bounds.left <= screenBounds.right &&
      bounds.bottom >= screenBounds.top &&
      bounds.top <= screenBounds.bottom;
    const enclosed =
      bounds.left >= screenBounds.left &&
      bounds.right <= screenBounds.right &&
      bounds.top >= screenBounds.top &&
      bounds.bottom <= screenBounds.bottom;
    if (screenBounds.crossing ? intersects : enclosed) selectedIds.push(entityId);
  });

  const solidBoundsById = new Map();
  modelLayer.querySelectorAll(".solid-face[data-solid-id]").forEach((element) => {
    const solidId = Number(element.dataset.solidId);
    const solid = getSolidById(solidId);
    if (
      !solid ||
      !isCurrentLayerEditable() ||
      !isEntityOnCurrentLayer(solid) ||
      !isEntityLayerVisible(solid)
    ) {
      return;
    }
    const bounds = element.getBoundingClientRect();
    const accumulated = solidBoundsById.get(solidId) ?? {
      left: Infinity,
      top: Infinity,
      right: -Infinity,
      bottom: -Infinity,
    };
    accumulated.left = Math.min(accumulated.left, bounds.left);
    accumulated.top = Math.min(accumulated.top, bounds.top);
    accumulated.right = Math.max(accumulated.right, bounds.right);
    accumulated.bottom = Math.max(accumulated.bottom, bounds.bottom);
    solidBoundsById.set(solidId, accumulated);
  });
  const selectedSolidIds = [];
  solidBoundsById.forEach((bounds, solidId) => {
    const intersects =
      bounds.right >= screenBounds.left &&
      bounds.left <= screenBounds.right &&
      bounds.bottom >= screenBounds.top &&
      bounds.top <= screenBounds.bottom;
    const enclosed =
      bounds.left >= screenBounds.left &&
      bounds.right <= screenBounds.right &&
      bounds.top >= screenBounds.top &&
      bounds.bottom <= screenBounds.bottom;
    if (screenBounds.crossing ? intersects : enclosed) {
      selectedSolidIds.push(solidId);
    }
  });

  if (selectedIds.length) {
    addEntityIdsToSelection(selectedIds);
    selectionState.hoveredEntityId = null;
    selectionState.pickCycle = null;
  }
  selectedSolidIds.forEach((solidId) =>
    modelSelectionState.selectedSolidIds.add(solidId),
  );
  if (selectedIds.length || selectedSolidIds.length) renderEntities();
  const selectionKind = screenBounds.crossing ? "Crossing" : "Window";
  const selectedCount = selectedIds.length + selectedSolidIds.length;
  const totalCount =
    selectionState.selectedEntityIds.size +
    modelSelectionState.selectedSolidIds.size;
  commandStatus.textContent = selectedCount
    ? `${selectionKind} selected ${selectedCount} ${selectedCount === 1 ? "item" : "items"}; ${totalCount} total.`
    : `${selectionKind} selection found no entities.`;
}

function beginCanvasNavigation(event) {
  if (canvasNavigationState.drag) return false;
  const isMiddleButton = event.button === 1;
  const isIsometricSelection = isometricViewState.active && event.button === 0;
  const isIsometricOrbit = isometricViewState.active && event.button === 2;
  if (!isMiddleButton && !isIsometricSelection && !isIsometricOrbit) {
    return false;
  }

  event.preventDefault();
  const displayView = isometricViewState.displayView;
  if (isMiddleButton) {
    canvasNavigationState.drag = {
      kind: "pan",
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startCenterX: isometricViewState.active
        ? displayView.centerX
        : viewState.centerX,
      startCenterY: isometricViewState.active
        ? displayView.centerY
        : viewState.centerY,
      startNavigationAnchor: viewState.navigationAnchor
        ? { ...viewState.navigationAnchor }
        : null,
      is3d: isometricViewState.active,
    };
    cadCanvas.classList.add("is-panning");
  } else if (isIsometricOrbit) {
    const pivotWorld = getIsometricOrbitPivotWorld();
    const projectedPivot = projectWorldPointToIsometric(pivotWorld);
    isometricViewState.pivotWorld = pivotWorld;
    canvasNavigationState.drag = {
      kind: "orbit-pending",
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startYaw: isometricViewState.yaw,
      startPitch: isometricViewState.pitch,
      startCenterX: displayView.centerX,
      startCenterY: displayView.centerY,
      pivotWorld,
      pivotOffsetX: projectedPivot.x - displayView.centerX,
      pivotOffsetY: projectedPivot.y - displayView.centerY,
    };
  } else {
    canvasNavigationState.drag = {
      kind: "selection-pending",
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      targetSelection: getCanvasModelSelectionTarget(event.target),
      screenBounds: null,
    };
  }
  cadCanvas.setPointerCapture(event.pointerId);
  return true;
}

function continueCanvasNavigation(event) {
  const drag = canvasNavigationState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return false;
  event.preventDefault();
  const deltaX = event.clientX - drag.startClientX;
  const deltaY = event.clientY - drag.startClientY;
  const distance = Math.hypot(deltaX, deltaY);

  if (drag.kind === "pan") {
    const canvasBounds = cadCanvas.getBoundingClientRect();
    if (drag.is3d) {
      const displayView = isometricViewState.displayView;
      displayView.centerX =
        drag.startCenterX - (deltaX / canvasBounds.width) * displayView.viewWidth;
      displayView.centerY =
        drag.startCenterY + (deltaY / canvasBounds.height) * displayView.viewHeight;
      renderEntities();
      commandStatus.textContent = "3D Pan: Release the middle button to finish.";
    } else {
      viewState.centerX =
        drag.startCenterX - (deltaX / canvasBounds.width) * viewState.viewWidth;
      viewState.centerY =
        drag.startCenterY + (deltaY / canvasBounds.height) * viewState.viewHeight;
      viewState.navigationAnchor = {
        x: viewState.centerX,
        y: viewState.centerY,
      };
      renderEntities();
      commandStatus.textContent = "Pan: Release the middle button to finish.";
    }
    return true;
  }

  if (drag.kind === "orbit-pending" && distance >= CANVAS_DRAG_THRESHOLD_PX) {
    drag.kind = "orbit";
    cadCanvas.classList.add("is-orbiting");
  }
  if (drag.kind === "orbit") {
    isometricViewState.yaw =
      drag.startYaw + deltaX * ORBIT_RADIANS_PER_PIXEL;
    isometricViewState.pitch = clampViewportValue(
      drag.startPitch + deltaY * ORBIT_RADIANS_PER_PIXEL,
      MIN_ORBIT_PITCH_RADIANS,
      MAX_ORBIT_PITCH_RADIANS,
    );
    const projectedPivot = projectWorldPointToIsometric(drag.pivotWorld);
    const displayView = isometricViewState.displayView;
    displayView.centerX = projectedPivot.x - drag.pivotOffsetX;
    displayView.centerY = projectedPivot.y - drag.pivotOffsetY;
    renderEntities();
    const yawDegrees = Math.round(
      ((isometricViewState.yaw * 180) / Math.PI) * 10,
    ) / 10;
    const pitchDegrees = Math.round(
      ((isometricViewState.pitch * 180) / Math.PI) * 10,
    ) / 10;
    commandStatus.textContent =
      `3D Orbit: Yaw ${yawDegrees}°, pitch ${pitchDegrees}°. ` +
      "Release the right button to finish.";
    return true;
  }

  if (
    drag.kind === "selection-pending" &&
    distance >= CANVAS_DRAG_THRESHOLD_PX
  ) {
    drag.kind = "selection";
    cadCanvas.classList.add("is-window-selecting");
  }
  if (drag.kind === "selection") {
    drag.screenBounds = setSelectionMarquee(
      drag.startClientX,
      drag.startClientY,
      event.clientX,
      event.clientY,
    );
    commandStatus.textContent = drag.screenBounds.crossing
      ? "3D Crossing Select: All touched entities will be added."
      : "3D Window Select: Fully enclosed entities will be added.";
    return true;
  }
  return true;
}

function finishCanvasNavigation(event) {
  const drag = canvasNavigationState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return false;
  event.preventDefault();
  if (cadCanvas.hasPointerCapture?.(event.pointerId)) {
    cadCanvas.releasePointerCapture(event.pointerId);
  }
  canvasNavigationState.drag = null;
  canvasNavigationState.suppressClickUntil = performance.now() + 200;
  cadCanvas.classList.remove(
    "is-orbiting",
    "is-panning",
    "is-window-selecting",
  );

  if (drag.kind === "selection-pending") {
    selectIsometricTarget(drag.targetSelection);
  } else if (drag.kind === "selection") {
    if (drag.screenBounds) selectEntitiesInScreenRectangle(drag.screenBounds);
  } else if (drag.kind === "orbit-pending") {
    commandStatus.textContent =
      "3D context menu is reserved for a future command set.";
  } else if (drag.kind === "orbit") {
    canvasNavigationState.suppressContextMenuUntil = performance.now() + 300;
    commandStatus.textContent =
      "3D Orbit complete. Right drag again to continue orbiting.";
  } else if (drag.kind === "pan") {
    commandStatus.textContent = drag.is3d
      ? "3D Pan complete."
      : "Pan complete.";
  }
  hideSelectionMarquee();
  return true;
}

function cancelCanvasNavigation(
  statusMessage = "Navigation canceled.",
  { restore = true } = {},
) {
  const drag = canvasNavigationState.drag;
  if (!drag) return false;
  if (restore) {
    if (drag.kind === "orbit" || drag.kind === "orbit-pending") {
      isometricViewState.yaw = drag.startYaw;
      isometricViewState.pitch = drag.startPitch;
      if (isometricViewState.displayView) {
        isometricViewState.displayView.centerX = drag.startCenterX;
        isometricViewState.displayView.centerY = drag.startCenterY;
      }
      renderEntities();
    } else if (drag.kind === "pan") {
      if (drag.is3d && isometricViewState.displayView) {
        isometricViewState.displayView.centerX = drag.startCenterX;
        isometricViewState.displayView.centerY = drag.startCenterY;
      } else {
        viewState.centerX = drag.startCenterX;
        viewState.centerY = drag.startCenterY;
        viewState.navigationAnchor = drag.startNavigationAnchor;
      }
      renderEntities();
    }
  }
  if (cadCanvas.hasPointerCapture?.(drag.pointerId)) {
    cadCanvas.releasePointerCapture(drag.pointerId);
  }
  canvasNavigationState.drag = null;
  canvasNavigationState.suppressClickUntil = performance.now() + 200;
  cadCanvas.classList.remove(
    "is-orbiting",
    "is-panning",
    "is-window-selecting",
  );
  hideSelectionMarquee();
  if (statusMessage) commandStatus.textContent = statusMessage;
  return true;
}

function zoomCanvasAtPointer(event) {
  const canvasBounds = cadCanvas.getBoundingClientRect();
  if (canvasBounds.width <= 0 || canvasBounds.height <= 0) return;
  event.preventDefault();
  const wheelSteps = clampViewportValue(event.deltaY / 100, -4, 4);
  const zoomFactor = Math.pow(WHEEL_ZOOM_FACTOR, -wheelSteps);
  const normalizedX =
    (event.clientX - canvasBounds.left) / canvasBounds.width - 0.5;
  const normalizedY =
    (event.clientY - canvasBounds.top) / canvasBounds.height - 0.5;

  if (isometricViewState.active) {
    const displayView = isometricViewState.displayView;
    if (!displayView) return;
    const nextZoom = clampViewportValue(
      displayView.zoom * zoomFactor,
      MIN_ZOOM,
      MAX_ZOOM,
    );
    if (Math.abs(nextZoom - displayView.zoom) <= 1e-12) return;
    const projectedX = displayView.centerX + normalizedX * displayView.viewWidth;
    const projectedY = displayView.centerY - normalizedY * displayView.viewHeight;
    const baseView = getCanvasBaseViewSize(
      canvasBounds.width,
      canvasBounds.height,
    );
    displayView.zoom = nextZoom;
    displayView.viewWidth = baseView.width / nextZoom;
    displayView.viewHeight = baseView.height / nextZoom;
    displayView.centerX = projectedX - normalizedX * displayView.viewWidth;
    displayView.centerY = projectedY + normalizedY * displayView.viewHeight;
    viewState.zoom = nextZoom;
    renderEntities();
    zoomStatus.textContent = `3D: ${Math.round(nextZoom * 100)}%`;
    commandStatus.textContent =
      `3D Zoom: ${Math.round(nextZoom * 100)}% toward the pointer.`;
    return;
  }

  const nextZoom = clampViewportValue(
    viewState.zoom * zoomFactor,
    MIN_ZOOM,
    MAX_ZOOM,
  );
  if (Math.abs(nextZoom - viewState.zoom) <= 1e-12) return;
  const worldX = viewState.centerX + normalizedX * viewState.viewWidth;
  const worldY = viewState.centerY - normalizedY * viewState.viewHeight;
  const baseView = getCanvasBaseViewSize(
    canvasBounds.width,
    canvasBounds.height,
  );
  viewState.zoom = nextZoom;
  viewState.viewWidth = baseView.width / nextZoom;
  viewState.viewHeight = baseView.height / nextZoom;
  viewState.centerX = worldX - normalizedX * viewState.viewWidth;
  viewState.centerY = worldY + normalizedY * viewState.viewHeight;
  viewState.navigationAnchor = {
    x: viewState.centerX,
    y: viewState.centerY,
  };
  renderEntities();
  const zoomPercent = Math.round(nextZoom * 100);
  zoomStatus.textContent = `Zoom: ${zoomPercent}%`;
  commandStatus.textContent = `Zoom: ${zoomPercent}% toward the pointer.`;
}

function fitViewToCanvas() {
  const baseView = getCanvasBaseViewSize(
    cadCanvas.clientWidth,
    cadCanvas.clientHeight,
  );
  if (!baseView) return;

  viewState.viewWidth = baseView.width / viewState.zoom;
  viewState.viewHeight = baseView.height / viewState.zoom;
  renderEntities();
}

function setZoom(nextZoom, actionName) {
  viewState.zoom = Math.min(
    MAX_ZOOM,
    Math.max(MIN_ZOOM, Math.round(nextZoom * 10) / 10),
  );
  fitViewToCanvas();

  const zoomPercent = Math.round(viewState.zoom * 100);
  zoomStatus.textContent = `Zoom: ${zoomPercent}%`;
  commandStatus.textContent = `${actionName}: ${zoomPercent}%`;
}

function setIsometricZoom(nextZoom, actionName) {
  const displayView = isometricViewState.displayView;
  if (!displayView) return;
  const baseView = getCanvasBaseViewSize(
    cadCanvas.clientWidth,
    cadCanvas.clientHeight,
  );
  if (!baseView) return;
  displayView.zoom = clampViewportValue(nextZoom, MIN_ZOOM, MAX_ZOOM);
  displayView.viewWidth = baseView.width / displayView.zoom;
  displayView.viewHeight = baseView.height / displayView.zoom;
  viewState.zoom = displayView.zoom;
  renderEntities();
  const zoomPercent = Math.round(displayView.zoom * 100);
  zoomStatus.textContent = `3D: ${zoomPercent}%`;
  commandStatus.textContent = `${actionName}: ${zoomPercent}%`;
}

function zoomIn() {
  deactivateWindowZoom();
  if (isometricViewState.active) {
    setIsometricZoom(
      isometricViewState.displayView.zoom + ZOOM_STEP,
      "3D Zoom In",
    );
    return;
  }
  setZoom(viewState.zoom + ZOOM_STEP, "Zoom In");
}

function zoomOut() {
  deactivateWindowZoom();
  if (isometricViewState.active) {
    setIsometricZoom(
      isometricViewState.displayView.zoom - ZOOM_STEP,
      "3D Zoom Out",
    );
    return;
  }
  setZoom(viewState.zoom - ZOOM_STEP, "Zoom Out");
}

function homeView() {
  deactivateWindowZoom();
  if (isometricViewState.active) {
    isometricViewState.yaw = ISOMETRIC_YAW_RADIANS;
    isometricViewState.pitch = ISOMETRIC_PITCH_RADIANS;
    isometricViewState.displayView = null;
    refreshIsometricView({ refit: true });
    commandStatus.textContent =
      "3D Home: Restored the default isometric camera and fitted the workspace.";
    return;
  }
  viewState.centerX = ORIGIN.x;
  viewState.centerY = ORIGIN.y;
  viewState.navigationAnchor = null;
  setZoom(1, "Home");
}

function fitAllGeometry() {
  deactivateWindowZoom();
  if (isometricViewState.active) {
    isometricViewState.displayView = null;
    refreshIsometricView({ refit: true });
    commandStatus.textContent = isometricViewState.hasGeometry
      ? "3D Fit: All visible profiles and solids fitted."
      : "3D Fit: Workspace is empty; returned to the 3D Home view.";
    return;
  }
  let bounds = getDocumentGeometryBounds();

  if (!bounds) {
    homeView();
    commandStatus.textContent =
      "View - Fit: Drawing is empty; returned to Home.";
    return;
  }

  let fittedView = null;
  for (let pass = 0; pass < 3; pass += 1) {
    fittedView = getFitViewParameters(
      bounds,
      cadCanvas.clientWidth,
      cadCanvas.clientHeight,
    );
    if (!fittedView) {
      commandStatus.textContent =
        "View - Fit is unavailable until the drawing canvas has a size.";
      return;
    }

    viewState.zoom = fittedView.zoom;
    viewState.centerX = fittedView.centerX;
    viewState.centerY = fittedView.centerY;
    viewState.navigationAnchor = {
      x: fittedView.centerX,
      y: fittedView.centerY,
    };
    bounds = getDocumentGeometryBounds();
  }

  fitViewToCanvas();
  const zoomPercent = Math.round(viewState.zoom * 100);
  zoomStatus.textContent = `Zoom: ${zoomPercent}%`;
  commandStatus.textContent = `View - Fit: All geometry fitted (${zoomPercent}%).`;
}

function dismissViewMenu() {
  viewMenuItem.classList.add("is-dismissed");
  document.activeElement?.blur();
}

function deactivateWindowZoom(statusMessage = null) {
  const drag = windowZoomState.drag;
  if (drag) {
    windowZoomState.canceledPointerId = drag.pointerId;
    windowZoomState.suppressClickUntil = Infinity;
  }
  if (drag && cadCanvas.hasPointerCapture?.(drag.pointerId)) {
    cadCanvas.releasePointerCapture(drag.pointerId);
  }
  windowZoomState.active = false;
  windowZoomState.drag = null;
  cadCanvas.classList.remove("window-zoom");
  quickZoomWindowButton.classList.remove("is-active");
  quickZoomWindowButton.setAttribute("aria-pressed", "false");
  renderToolPreview();
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function activateWindowZoom() {
  dismissViewMenu();
  if (isometricViewState.active) {
    commandStatus.textContent =
      "View - Window is replaced by Window/Crossing selection in the 3D workspace.";
    return;
  }
  deactivateWindowZoom();
  windowZoomState.active = true;
  windowZoomState.canceledPointerId = null;
  windowZoomState.suppressClickUntil = 0;
  cadCanvas.classList.add("window-zoom");
  quickZoomWindowButton.classList.add("is-active");
  quickZoomWindowButton.setAttribute("aria-pressed", "true");
  setSelectionProximityHover(null);
  clearEntityHoverInfo();
  renderToolPreview();
  commandStatus.textContent =
    "View - Window: Drag an area to enlarge. Window remains active until another action or Escape.";
}

function getAspectMatchedWindowRect(
  startClientX,
  startClientY,
  clientX,
  clientY,
) {
  const canvasBounds = cadCanvas.getBoundingClientRect();
  const clampedX = clampViewportValue(
    clientX,
    canvasBounds.left,
    canvasBounds.right,
  );
  const clampedY = clampViewportValue(
    clientY,
    canvasBounds.top,
    canvasBounds.bottom,
  );
  const rawLeft = Math.min(startClientX, clampedX);
  const rawRight = Math.max(startClientX, clampedX);
  const rawTop = Math.min(startClientY, clampedY);
  const rawBottom = Math.max(startClientY, clampedY);
  const rawWidth = rawRight - rawLeft;
  const rawHeight = rawBottom - rawTop;
  const canvasAspect = canvasBounds.width / canvasBounds.height;

  if (
    rawWidth <= GEOMETRY_EPSILON ||
    rawHeight <= GEOMETRY_EPSILON ||
    !Number.isFinite(canvasAspect) ||
    canvasAspect <= 0
  ) {
    return {
      left: rawLeft,
      right: rawRight,
      top: rawTop,
      bottom: rawBottom,
      width: rawWidth,
      height: rawHeight,
      rawWidth,
      rawHeight,
    };
  }

  let width = rawWidth;
  let height = rawHeight;
  if (rawWidth / rawHeight > canvasAspect) {
    height = rawWidth / canvasAspect;
  } else {
    width = rawHeight * canvasAspect;
  }

  const centerX = (rawLeft + rawRight) / 2;
  const centerY = (rawTop + rawBottom) / 2;
  let left = centerX - width / 2;
  let top = centerY - height / 2;
  left = clampViewportValue(
    left,
    canvasBounds.left,
    canvasBounds.right - width,
  );
  top = clampViewportValue(top, canvasBounds.top, canvasBounds.bottom - height);

  return {
    left,
    right: left + width,
    top,
    bottom: top + height,
    width,
    height,
    rawWidth,
    rawHeight,
  };
}

function updateWindowZoomDrag(event) {
  const drag = windowZoomState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const screenBounds = getAspectMatchedWindowRect(
    drag.startClientX,
    drag.startClientY,
    event.clientX,
    event.clientY,
  );
  const topLeft = screenPointToWorld(screenBounds.left, screenBounds.top);
  const bottomRight = screenPointToWorld(
    screenBounds.right,
    screenBounds.bottom,
  );
  drag.screenBounds = screenBounds;
  drag.worldBounds = {
    minX: Math.min(topLeft.x, bottomRight.x),
    maxX: Math.max(topLeft.x, bottomRight.x),
    minY: Math.min(topLeft.y, bottomRight.y),
    maxY: Math.max(topLeft.y, bottomRight.y),
  };
  renderToolPreview();
}

function completeWindowZoom(event) {
  const drag = windowZoomState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  updateWindowZoomDrag(event);
  const { screenBounds, worldBounds } = drag;
  if (cadCanvas.hasPointerCapture?.(event.pointerId)) {
    cadCanvas.releasePointerCapture(event.pointerId);
  }
  windowZoomState.drag = null;
  windowZoomState.suppressClickUntil = performance.now() + 200;

  if (
    !screenBounds ||
    !worldBounds ||
    screenBounds.rawWidth < 5 ||
    screenBounds.rawHeight < 5
  ) {
    renderToolPreview();
    commandStatus.textContent =
      "View - Window: Drag a larger rectangular area. Window remains active.";
    return;
  }

  const selectedWidth = worldBounds.maxX - worldBounds.minX;
  const baseViewWidth = viewState.viewWidth * viewState.zoom;
  const targetZoom = clampViewportValue(
    baseViewWidth / selectedWidth,
    Math.max(MIN_ZOOM, viewState.zoom),
    MAX_ZOOM,
  );
  const centerX = (worldBounds.minX + worldBounds.maxX) / 2;
  const centerY = (worldBounds.minY + worldBounds.maxY) / 2;

  viewState.zoom = targetZoom;
  viewState.centerX = centerX;
  viewState.centerY = centerY;
  viewState.navigationAnchor = { x: centerX, y: centerY };
  fitViewToCanvas();

  const zoomPercent = Math.round(viewState.zoom * 100);
  zoomStatus.textContent = `Zoom: ${zoomPercent}%`;
  commandStatus.textContent =
    `View - Window: X${formatCoordinate(VIEW.xMin)} to ` +
    `X${formatCoordinate(VIEW.xMax)}, Y${formatCoordinate(VIEW.yMin)} to ` +
    `Y${formatCoordinate(VIEW.yMax)} (${zoomPercent}%). ` +
    "Window remains active; drag the next area or choose another action.";
}

function cancelWindowZoomDrag(event) {
  const drag = windowZoomState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  windowZoomState.drag = null;
  windowZoomState.canceledPointerId = null;
  windowZoomState.suppressClickUntil = 0;
  renderToolPreview();
  commandStatus.textContent =
    "View - Window: Drag interrupted. Window remains active.";
}

function panViewportTo(axis, nextCenter) {
  const axisState = viewportScrollState[axis];
  if (!axisState.enabled) return;
  const stateProperty = axis === "horizontal" ? "centerX" : "centerY";
  viewState[stateProperty] = clampViewportValue(
    nextCenter,
    axisState.minCenter,
    axisState.maxCenter,
  );
  syncViewportToDocument();
}

function panViewportBy(axis, distance) {
  const stateProperty = axis === "horizontal" ? "centerX" : "centerY";
  panViewportTo(axis, viewState[stateProperty] + distance);
}

function pageViewportTowardPointer(axis, event) {
  const axisState = viewportScrollState[axis];
  if (!axisState.enabled) return;
  const thumb = axis === "horizontal" ? cadHorizontalThumb : cadVerticalThumb;
  const thumbBounds = thumb.getBoundingClientRect();
  const pointerPosition = axis === "horizontal" ? event.clientX : event.clientY;
  const thumbStart = axis === "horizontal" ? thumbBounds.left : thumbBounds.top;
  const thumbEnd =
    axis === "horizontal" ? thumbBounds.right : thumbBounds.bottom;
  if (pointerPosition >= thumbStart && pointerPosition <= thumbEnd) return;

  const viewSize =
    axis === "horizontal" ? viewState.viewWidth : viewState.viewHeight;
  const visualDirection = pointerPosition < thumbStart ? -1 : 1;
  const worldDirection =
    axis === "vertical" ? -visualDirection : visualDirection;
  panViewportBy(axis, worldDirection * viewSize * 0.8);
}

function beginViewportScrollbarDrag(axis, event) {
  const axisState = viewportScrollState[axis];
  if (!axisState.enabled || event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  const thumb = axis === "horizontal" ? cadHorizontalThumb : cadVerticalThumb;
  viewportScrollState.drag = {
    axis,
    pointerId: event.pointerId,
    startPointer: axis === "horizontal" ? event.clientX : event.clientY,
    startCenter: axis === "horizontal" ? viewState.centerX : viewState.centerY,
  };
  thumb.setPointerCapture(event.pointerId);
}

function continueViewportScrollbarDrag(event) {
  const drag = viewportScrollState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const axisState = viewportScrollState[drag.axis];
  const track =
    drag.axis === "horizontal" ? cadHorizontalTrack : cadVerticalTrack;
  const thumb =
    drag.axis === "horizontal" ? cadHorizontalThumb : cadVerticalThumb;
  const trackSize =
    drag.axis === "horizontal" ? track.clientWidth : track.clientHeight;
  const thumbSize =
    drag.axis === "horizontal" ? thumb.offsetWidth : thumb.offsetHeight;
  const travel = trackSize - thumbSize;
  if (travel <= 0) return;

  const pointer = drag.axis === "horizontal" ? event.clientX : event.clientY;
  const visualDelta = pointer - drag.startPointer;
  const centerRange = axisState.maxCenter - axisState.minCenter;
  const direction = drag.axis === "vertical" ? -1 : 1;
  panViewportTo(
    drag.axis,
    drag.startCenter + (visualDelta / travel) * centerRange * direction,
  );
}

function endViewportScrollbarDrag(event) {
  const drag = viewportScrollState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const thumb =
    drag.axis === "horizontal" ? cadHorizontalThumb : cadVerticalThumb;
  if (thumb.hasPointerCapture(event.pointerId)) {
    thumb.releasePointerCapture(event.pointerId);
  }
  viewportScrollState.drag = null;
}

function handleViewportScrollbarKey(axis, event) {
  const axisState = viewportScrollState[axis];
  if (!axisState.enabled) return;
  const viewSize =
    axis === "horizontal" ? viewState.viewWidth : viewState.viewHeight;
  const smallStep = viewSize * 0.1;
  const pageStep = viewSize * 0.8;
  let nextCenter =
    axis === "horizontal" ? viewState.centerX : viewState.centerY;

  if (axis === "horizontal" && event.key === "ArrowLeft") {
    nextCenter -= smallStep;
  } else if (axis === "horizontal" && event.key === "ArrowRight") {
    nextCenter += smallStep;
  } else if (axis === "vertical" && event.key === "ArrowUp") {
    nextCenter += smallStep;
  } else if (axis === "vertical" && event.key === "ArrowDown") {
    nextCenter -= smallStep;
  } else if (event.key === "PageUp") {
    nextCenter += axis === "vertical" ? pageStep : -pageStep;
  } else if (event.key === "PageDown") {
    nextCenter += axis === "vertical" ? -pageStep : pageStep;
  } else if (event.key === "Home") {
    nextCenter =
      axis === "vertical" ? axisState.maxCenter : axisState.minCenter;
  } else if (event.key === "End") {
    nextCenter =
      axis === "vertical" ? axisState.minCenter : axisState.maxCenter;
  } else {
    return;
  }

  event.preventDefault();
  panViewportTo(axis, nextCenter);
}

cadScrollLeft.addEventListener("click", () => {
  panViewportBy("horizontal", -viewState.viewWidth * 0.1);
});
cadScrollRight.addEventListener("click", () => {
  panViewportBy("horizontal", viewState.viewWidth * 0.1);
});
cadScrollUp.addEventListener("click", () => {
  panViewportBy("vertical", viewState.viewHeight * 0.1);
});
cadScrollDown.addEventListener("click", () => {
  panViewportBy("vertical", -viewState.viewHeight * 0.1);
});
cadHorizontalTrack.addEventListener("pointerdown", (event) => {
  if (event.target === cadHorizontalTrack) {
    pageViewportTowardPointer("horizontal", event);
  }
});
cadVerticalTrack.addEventListener("pointerdown", (event) => {
  if (event.target === cadVerticalTrack) {
    pageViewportTowardPointer("vertical", event);
  }
});
cadHorizontalThumb.addEventListener("pointerdown", (event) => {
  beginViewportScrollbarDrag("horizontal", event);
});
cadVerticalThumb.addEventListener("pointerdown", (event) => {
  beginViewportScrollbarDrag("vertical", event);
});
[cadHorizontalThumb, cadVerticalThumb].forEach((thumb) => {
  thumb.addEventListener("pointermove", continueViewportScrollbarDrag);
  thumb.addEventListener("pointerup", endViewportScrollbarDrag);
  thumb.addEventListener("pointercancel", endViewportScrollbarDrag);
});
cadHorizontalTrack.addEventListener("keydown", (event) => {
  handleViewportScrollbarKey("horizontal", event);
});
cadVerticalTrack.addEventListener("keydown", (event) => {
  handleViewportScrollbarKey("vertical", event);
});

function convertDisplayLengthToInternal(value, units = documentModel.units) {
  return units === "metric" ? value / MILLIMETERS_PER_INCH : value;
}

function convertInternalLengthToDisplay(value, units = documentModel.units) {
  return units === "metric" ? value * MILLIMETERS_PER_INCH : value;
}

function formatLengthResult(value, units = documentModel.units) {
  return formatArithmeticResult(convertInternalLengthToDisplay(value, units));
}

function convertLengthInputValues(previousUnits, nextUnits) {
  UNIT_LENGTH_INPUTS.forEach((input) => {
    const previousDisplayValue = evaluateArithmeticExpression(input.value);
    if (!Number.isFinite(previousDisplayValue)) return;
    const internalValue = convertDisplayLengthToInternal(
      previousDisplayValue,
      previousUnits,
    );
    input.value = formatArithmeticResult(
      convertInternalLengthToDisplay(internalValue, nextUnits),
    );
    input.setCustomValidity("");
  });
}

function updateUnitsUi() {
  Object.entries(UNIT_MENUS).forEach(([units, menuButton]) => {
    const isCurrent = units === documentModel.units;
    menuButton.classList.toggle("current-menu-option", isCurrent);
    menuButton.setAttribute("aria-pressed", String(isCurrent));
  });
  unitsStatus.textContent = `Units: ${UNIT_DISPLAY_NAMES[documentModel.units]}`;
}

function closeUnitsMenu() {
  unitsMenuItem.classList.add("is-dismissed");
  document.activeElement?.blur();
}

function setDocumentUnits(nextUnits) {
  if (!Object.hasOwn(UNIT_MENUS, nextUnits)) return;
  const previousUnits = documentModel.units;
  if (previousUnits === nextUnits) {
    updateUnitsUi();
    closeUnitsMenu();
    commandStatus.textContent = `Units: ${UNIT_DISPLAY_NAMES[nextUnits]}`;
    return;
  }

  cancelGeometryToolsForLayerChange();
  convertLengthInputValues(previousUnits, nextUnits);
  documentModel.units = nextUnits;
  updateUnitsUi();
  closeUnitsMenu();
  clearEntityHoverInfo();
  cursorX.textContent = "X: ----";
  cursorY.textContent = "Y: ----";
  renderEntities();
  commandStatus.textContent =
    nextUnits === "metric"
      ? "Units: Metric. Existing geometry is now displayed in millimetres."
      : "Units: Inch. Existing geometry is now displayed in inches.";
}

function applyTheme(themeName) {
  document.body.dataset.theme = themeName;

  Object.entries(THEME_MENUS).forEach(([menuTheme, menuButton]) => {
    const isCurrentTheme = menuTheme === themeName;
    menuButton.classList.toggle("current-menu-option", isCurrentTheme);
    menuButton.setAttribute("aria-pressed", String(isCurrentTheme));
  });

  commandStatus.textContent = `Theme: ${THEME_DISPLAY_NAMES[themeName]}`;
}

function closeThemeMenu() {
  themeMenuItem.classList.add("is-dismissed");
  document.activeElement?.blur();
}

function selectTheme(themeName) {
  applyTheme(themeName);
  closeThemeMenu();
}

function dismissLayerMenu() {
  layerMenuItem.classList.add("is-dismissed");
  document.activeElement?.blur();
}

function getLayerById(layerId) {
  return documentModel.layers.find((layer) => layer.id === layerId) ?? null;
}

function getCurrentLayer() {
  return getLayerById(documentModel.currentLayerId);
}

function getEntityLayerId(entity) {
  return Number.isInteger(entity.layerId) ? entity.layerId : 0;
}

function isEntityOnCurrentLayer(entity) {
  return getEntityLayerId(entity) === documentModel.currentLayerId;
}

function isEntityLayerVisible(entity) {
  const layer = getLayerById(getEntityLayerId(entity));
  return layer ? !layer.masked : false;
}

function isCurrentLayerEditable() {
  const layer = getCurrentLayer();
  return Boolean(layer && !layer.locked && !layer.masked);
}

function getCurrentLayerRestrictionMessage(actionName) {
  const layer = getCurrentLayer();
  if (!layer) return `${actionName}: Select a valid layer first.`;
  if (layer.masked) {
    return `${actionName}: ${layer.name} is masked. Unmask it before editing.`;
  }
  if (layer.locked) {
    return `${actionName}: ${layer.name} is locked. Unlock it before editing.`;
  }
  return null;
}

function clearSelectionForLayerChange() {
  selectionState.selectedEntityId = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  selectionState.mode = null;
  resetChainSelectionPreview();
  clearModelSelection();
  cadCanvas.classList.remove("select-single");
}

function cancelGeometryToolsForLayerChange() {
  deactivateDimension();
  deactivatePointSketch();
  deactivateLineSketch();
  deactivateLineAngle();
  deactivateLineTangent();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateThreeEntityCircle();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivatePointEnd();
  deactivateFillet();
  deactivateRotate();
  deactivateWindowZoom();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!rectangleWindow.hidden) closeRectangleWindow(null);
  if (!boltHoleCircleWindow.hidden) closeBoltHoleCircleWindow(null);
  if (!textWindow.hidden) closeTextWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);
  if (!pointIncrementalWindow.hidden) closePointIncrementalWindow(null);
  if (!translateWindow.hidden) closeTranslateWindow(null);
  if (!translateByPointsWindow.hidden) closeTranslateByPointsWindow(null);
  if (!boxWindow.hidden) closeBoxWindow(null);
}

function renderLayerMenu() {
  layerList.innerHTML = "";
  documentModel.layers.forEach((layer) => {
    const row = document.createElement("div");
    row.className = "layer-menu-row";
    row.dataset.layerId = String(layer.id);

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "layer-select-button";
    selectButton.dataset.layerAction = "select";
    selectButton.dataset.layerId = String(layer.id);
    const stateParts = [];
    if (layer.locked) stateParts.push("Locked");
    if (layer.masked) stateParts.push("Masked");
    selectButton.textContent = `${layer.name}${stateParts.length ? ` (${stateParts.join(", ")})` : ""}`;
    const isCurrent = layer.id === documentModel.currentLayerId;
    selectButton.classList.toggle("current-menu-option", isCurrent);
    selectButton.setAttribute("aria-current", isCurrent ? "true" : "false");
    row.appendChild(selectButton);

    const actions = document.createElement("div");
    actions.className = "submenu-item layer-actions";
    const moreButton = document.createElement("button");
    moreButton.type = "button";
    moreButton.className = "submenu-trigger layer-more-button";
    moreButton.setAttribute("aria-haspopup", "true");
    moreButton.setAttribute("aria-label", `Manage ${layer.name}`);
    moreButton.title = `Manage ${layer.name}`;
    moreButton.textContent = "⋯";
    actions.appendChild(moreButton);

    const actionMenu = document.createElement("div");
    actionMenu.className = "submenu-menu layer-action-menu";
    actionMenu.setAttribute("aria-label", `${layer.name} commands`);
    [
      ["rename", "Rename"],
      ["lock", layer.locked ? "Unlock" : "Lock"],
      ["mask", layer.masked ? "Unmask" : "Mask"],
    ].forEach(([action, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.layerAction = action;
      button.dataset.layerId = String(layer.id);
      button.textContent = label;
      actionMenu.appendChild(button);
    });
    actions.appendChild(actionMenu);
    enableDelayedMenuClose(actions);
    row.appendChild(actions);
    layerList.appendChild(row);
  });

  const currentLayer = getCurrentLayer();
  layerMenuButton.textContent = currentLayer
    ? `Layer: ${currentLayer.name.replace(/^Layer\s+/i, "")}`
    : "Layer";
  newLayerMenu.disabled = documentModel.layers.length >= MAX_LAYER_COUNT;
  newLayerMenu.title = newLayerMenu.disabled
    ? `A maximum of ${MAX_LAYER_COUNT} layers is allowed.`
    : "Create a new layer";
  renderSelectLayerMenu();
}

function renderSelectLayerMenu() {
  selectLayerList.innerHTML = "";
  documentModel.layers.forEach((layer) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.selectLayerId = String(layer.id);
    const stateParts = [];
    if (layer.locked) stateParts.push("Locked");
    if (layer.masked) stateParts.push("Masked");
    button.textContent =
      `${layer.name}${stateParts.length ? ` (${stateParts.join(", ")})` : ""}`;
    button.disabled = layer.locked || layer.masked;
    button.title = button.disabled
      ? `${layer.name} cannot be selected while ${layer.masked ? "masked" : "locked"}.`
      : `Select all entities in ${layer.name}`;
    button.setAttribute(
      "aria-current",
      layer.id === documentModel.currentLayerId ? "true" : "false",
    );
    selectLayerList.appendChild(button);
  });
}

function selectLayer(layerId) {
  const layer = getLayerById(layerId);
  if (!layer) return;
  cancelGeometryToolsForLayerChange();
  clearSelectionForLayerChange();
  documentModel.currentLayerId = layer.id;
  dismissLayerMenu();
  renderEntities();
  commandStatus.textContent =
    `Current layer: ${layer.name}` +
    (layer.locked ? " (locked)." : layer.masked ? " (masked)." : ".");
}

function createNewLayer() {
  if (documentModel.layers.length >= MAX_LAYER_COUNT) {
    commandStatus.textContent = `New Layer: The ${MAX_LAYER_COUNT}-layer limit has been reached.`;
    return;
  }
  const layerId = documentModel.nextLayerId;
  const existingNames = new Set(
    documentModel.layers.map((layer) => layer.name.toLocaleLowerCase()),
  );
  const baseName = `Layer ${layerId}`;
  let layerName = baseName;
  let suffix = 2;
  while (existingNames.has(layerName.toLocaleLowerCase())) {
    layerName = `${baseName} (${suffix})`;
    suffix += 1;
  }
  const layer = {
    id: layerId,
    name: layerName,
    locked: false,
    masked: false,
  };
  recordDocumentChange(`Create ${layer.name}`);
  documentModel.nextLayerId += 1;
  documentModel.layers.push(layer);
  cancelGeometryToolsForLayerChange();
  clearSelectionForLayerChange();
  documentModel.currentLayerId = layer.id;
  dismissLayerMenu();
  renderEntities();
  commandStatus.textContent = `Created and selected ${layer.name}.`;
}

function renameLayer(layerId) {
  const layer = getLayerById(layerId);
  if (!layer) return;
  const requestedName = window.prompt("Layer name:", layer.name);
  if (requestedName === null) return;
  const name = requestedName.trim();
  if (!name) {
    commandStatus.textContent = "Rename Layer: Enter a nonempty name.";
    return;
  }
  if (
    documentModel.layers.some(
      (candidate) =>
        candidate.id !== layer.id &&
        candidate.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    )
  ) {
    commandStatus.textContent = `Rename Layer: A layer named “${name}” already exists.`;
    return;
  }
  if (name === layer.name) return;
  recordDocumentChange(`Rename ${layer.name} to ${name}`);
  const oldName = layer.name;
  layer.name = name.slice(0, 40);
  dismissLayerMenu();
  renderLayerMenu();
  commandStatus.textContent = `Renamed ${oldName} to ${layer.name}.`;
}

function toggleLayerLock(layerId) {
  const layer = getLayerById(layerId);
  if (!layer) return;
  recordDocumentChange(`${layer.locked ? "Unlock" : "Lock"} ${layer.name}`);
  layer.locked = !layer.locked;
  if (layer.id === documentModel.currentLayerId) {
    cancelGeometryToolsForLayerChange();
    clearSelectionForLayerChange();
  }
  dismissLayerMenu();
  renderEntities();
  commandStatus.textContent = `${layer.name} ${layer.locked ? "locked" : "unlocked"}.`;
}

function toggleLayerMask(layerId) {
  const layer = getLayerById(layerId);
  if (!layer) return;
  recordDocumentChange(`${layer.masked ? "Unmask" : "Mask"} ${layer.name}`);
  layer.masked = !layer.masked;
  if (layer.id === documentModel.currentLayerId) {
    cancelGeometryToolsForLayerChange();
    clearSelectionForLayerChange();
  }
  dismissLayerMenu();
  renderEntities();
  commandStatus.textContent = `${layer.name} ${layer.masked ? "masked" : "unmasked"}.`;
}

function handleLayerMenuClick(event) {
  const button = event.target.closest("button[data-layer-action]");
  if (!button) return;
  const layerId = Number(button.dataset.layerId);
  if (!Number.isInteger(layerId)) return;
  if (button.dataset.layerAction === "select") selectLayer(layerId);
  if (button.dataset.layerAction === "rename") renameLayer(layerId);
  if (button.dataset.layerAction === "lock") toggleLayerLock(layerId);
  if (button.dataset.layerAction === "mask") toggleLayerMask(layerId);
}

function dismissHelpMenu() {
  helpMenuItem.classList.add("is-dismissed");
  document.activeElement?.blur();
}

function positionAboutWindow() {
  if (aboutWindowState.hasPosition) return;
  const bounds = aboutWindow.getBoundingClientRect();
  const left = Math.max(8, (window.innerWidth - bounds.width) / 2);
  const top = Math.max(8, (window.innerHeight - bounds.height) / 2);
  aboutWindow.style.left = `${left}px`;
  aboutWindow.style.top = `${top}px`;
  aboutWindowState.hasPosition = true;
}

function openAboutWindow() {
  dismissHelpMenu();
  aboutWindow.hidden = false;
  positionAboutWindow();
  aboutCloseButton.focus();
  commandStatus.textContent = `About ${APP_NAME} V${APP_VERSION}`;
}

function closeAboutWindow(statusMessage = "Ready") {
  aboutWindow.hidden = true;
  aboutWindowState.drag = null;
  aboutWindowTitleBar.classList.remove("is-dragging");
  if (statusMessage !== null) commandStatus.textContent = statusMessage;
}

function positionBoxWindowInitially() {
  if (boxWindowState.hasPosition) return;
  const bounds = boxWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - bounds.width - 24);
  const top = Math.max(8, Math.min(76, window.innerHeight - bounds.height));
  boxWindow.style.left = `${left}px`;
  boxWindow.style.top = `${top}px`;
  boxWindowState.hasPosition = true;
}

function resetBoxInputs() {
  boxXInput.value = "0";
  boxYInput.value = "0";
  boxZInput.value = "0";
  boxLengthInput.value = "2.000";
  boxWidthInput.value = "1.000";
  boxHeightInput.value = "1.000";
  boxDraftAngleInput.value = "0";
  [
    boxXInput,
    boxYInput,
    boxZInput,
    boxLengthInput,
    boxWidthInput,
    boxHeightInput,
    boxDraftAngleInput,
  ].forEach((input) => input.setCustomValidity(""));
}

function activateBox() {
  modelMenuItem.classList.add("is-dismissed");
  if (!is3dWorkspace()) {
    commandStatus.textContent = "Box is available in the 3D workspace.";
    return;
  }
  const restrictionMessage = getCurrentLayerRestrictionMessage("Box");
  if (restrictionMessage) {
    commandStatus.textContent = restrictionMessage;
    return;
  }
  cancelGeometryToolsForLayerChange();
  resetBoxInputs();
  boxToolMessage.textContent =
    "Position is the center and elevation of the bottom face.";
  delete boxToolMessage.dataset.arithmeticError;
  boxWindow.hidden = false;
  boxWindow.classList.remove("is-minimized", "is-maximized");
  positionBoxWindowInitially();
  boxXInput.focus();
  boxXInput.select();
  commandStatus.textContent = "Box: Enter position, dimensions, and draft angle.";
}

function closeBoxWindow(statusMessage = "Box canceled.") {
  if (boxWindow.classList.contains("is-maximized")) {
    toggleBoxWindowMaximized();
  }
  boxWindow.hidden = true;
  boxWindowState.drag = null;
  boxWindowTitleBar.classList.remove("is-dragging");
  if (statusMessage !== null) commandStatus.textContent = statusMessage;
}

function toggleBoxWindowMinimized() {
  if (boxWindow.classList.contains("is-maximized")) {
    boxWindow.classList.remove("is-maximized");
  }
  boxWindow.classList.toggle("is-minimized");
  boxMaximizeIcon.innerHTML = "&#9633;";
}

function toggleBoxWindowMaximized() {
  boxWindow.classList.remove("is-minimized");
  const willMaximize = !boxWindow.classList.contains("is-maximized");
  if (willMaximize) {
    const bounds = boxWindow.getBoundingClientRect();
    boxWindowState.restoreBounds = {
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    };
    boxWindow.classList.add("is-maximized");
    boxMaximizeIcon.innerHTML = "&#10064;";
    return;
  }
  boxWindow.classList.remove("is-maximized");
  if (boxWindowState.restoreBounds) {
    const { left, top, width, height } = boxWindowState.restoreBounds;
    boxWindow.style.left = `${left}px`;
    boxWindow.style.top = `${top}px`;
    boxWindow.style.width = `${width}px`;
    boxWindow.style.height = `${height}px`;
  }
  boxMaximizeIcon.innerHTML = "&#9633;";
}

function beginBoxWindowDrag(event) {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    boxWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = boxWindow.getBoundingClientRect();
  boxWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  boxWindowTitleBar.classList.add("is-dragging");
  boxWindowTitleBar.setPointerCapture(event.pointerId);
}

function continueBoxWindowDrag(event) {
  const drag = boxWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = boxWindow.getBoundingClientRect();
  const left = Math.min(
    Math.max(0, window.innerWidth - bounds.width),
    Math.max(0, event.clientX - drag.offsetX),
  );
  const top = Math.min(
    Math.max(0, window.innerHeight - boxWindowTitleBar.offsetHeight),
    Math.max(0, event.clientY - drag.offsetY),
  );
  boxWindow.style.left = `${left}px`;
  boxWindow.style.top = `${top}px`;
  boxWindowState.hasPosition = true;
}

function endBoxWindowDrag(event) {
  if (boxWindowState.drag?.pointerId !== event.pointerId) return;
  boxWindowState.drag = null;
  boxWindowTitleBar.classList.remove("is-dragging");
  if (boxWindowTitleBar.hasPointerCapture(event.pointerId)) {
    boxWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

function resolveBoxInput(input, label, { positive = false } = {}) {
  return resolveArithmeticInput(input, {
    messageElement: boxToolMessage,
    invalidMessage: `Enter a valid arithmetic expression for ${label}.`,
    validationMessage: (value) =>
      positive && value <= GEOMETRY_EPSILON
        ? `${label} must be greater than zero.`
        : null,
    successMessage: "Enter position, dimensions, and draft angle.",
  });
}

function createBoxFromInputs() {
  const inputSpecifications = [
    ["x", boxXInput, "X", false],
    ["y", boxYInput, "Y", false],
    ["z", boxZInput, "Z", false],
    ["length", boxLengthInput, "length", true],
    ["width", boxWidthInput, "width", true],
    ["height", boxHeightInput, "height", true],
    ["draftAngleDegrees", boxDraftAngleInput, "draft angle", false],
  ];
  const values = {};
  for (const [key, input, label, positive] of inputSpecifications) {
    const value = resolveBoxInput(input, label, { positive });
    if (value === null) {
      input.focus();
      input.select();
      commandStatus.textContent = `Box: ${boxToolMessage.textContent}`;
      return;
    }
    values[key] = value;
  }

  let solid;
  try {
    solid = buildBoxSolid({
      id: documentModel.model3d.nextSolidId,
      layerId: documentModel.currentLayerId,
      ...values,
    });
  } catch (error) {
    boxToolMessage.textContent = error.message;
    boxToolMessage.dataset.arithmeticError = "true";
    commandStatus.textContent = `Box: ${error.message}`;
    return;
  }

  recordDocumentChange(`Create Box ${solid.id}`);
  documentModel.model3d.nextSolidId += 1;
  documentModel.model3d.solids.push(solid);
  selectionState.selectedEntityId = null;
  clearModelSelection();
  modelSelectionState.selectedSolidIds.add(solid.id);
  closeBoxWindow(null);
  refreshIsometricView({ refit: true });
  commandStatus.textContent =
    `Created Box ${solid.id}: ` +
    `${formatLengthResult(values.length)} × ${formatLengthResult(values.width)} × ` +
    `${formatLengthResult(values.height)}, draft ` +
    `${formatArithmeticResult(values.draftAngleDegrees)}°.`;
}

function setCalculatorButtonActive(active) {
  quickCalculatorButton.classList.toggle("is-active", active);
  quickCalculatorButton.setAttribute("aria-pressed", String(active));
}

function centerCalculatorOverDrawing() {
  const drawingBounds = cadCanvas.getBoundingClientRect();
  const calculatorBounds = calculatorWindow.element.getBoundingClientRect();
  calculatorWindow.moveTo(
    drawingBounds.left + (drawingBounds.width - calculatorBounds.width) / 2,
    drawingBounds.top + (drawingBounds.height - calculatorBounds.height) / 2,
  );
  calculatorHasBeenPositioned = true;
}

function openCalculatorWindow() {
  deactivateWindowZoom();
  if (!calculatorWindow) {
    calculatorWindow = Calculator.create({
      visible: false,
      title: "Calculator",
      angleMode: "deg",
      onClose: () => {
        setCalculatorButtonActive(false);
        commandStatus.textContent = "Calculator closed.";
      },
    });
  }

  calculatorWindow.show();
  if (calculatorWindow.element.classList.contains("is-minimized")) {
    calculatorWindow.element.classList.remove("is-minimized");
    calculatorWindow.element.style.width = "";
  }
  if (!calculatorHasBeenPositioned) centerCalculatorOverDrawing();
  calculatorWindow.focus();
  setCalculatorButtonActive(true);
  commandStatus.textContent = "Calculator opened.";
}

function dismissSelectMenu() {
  selectMenuItem.classList.add("is-dismissed");
  document.activeElement?.blur();
}

function prepareSelectionCommand() {
  dismissSelectMenu();
  resetChainSelectionPreview();
  deactivateDimension();
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);
}

function activateSingleSelect() {
  prepareSelectionCommand();
  const restrictionMessage = getCurrentLayerRestrictionMessage("Select");
  if (restrictionMessage) {
    selectionState.mode = null;
    cadCanvas.classList.remove("select-single");
    commandStatus.textContent = restrictionMessage;
    renderEntities();
    return false;
  }
  if (is3dWorkspace()) {
    selectionState.mode = null;
    selectionState.hoveredEntityId = null;
    selectionState.pickCycle = null;
    cadCanvas.classList.remove("select-single");
    commandStatus.textContent =
      "Select - Single: Click an entity, face, or solid to add it; click empty space to clear the selection.";
    return true;
  }
  selectionState.mode = "single";
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.add("select-single");
  commandStatus.textContent =
    "Select - Single: Click entities one at a time to add them; click empty space to clear the selection.";
  return true;
}

function resetChainSelectionPreview() {
  chainSelectionState.candidateEntityId = null;
  chainSelectionState.exitEndpointIndex = null;
  chainSelectionState.lastChainEntityIds = [];
}

function getChainEntityEndpoints(entity) {
  if (entity?.type === "line") {
    const endpoints = getLineEndpointPair(entity);
    if (!endpoints) return null;
    return [
      { x: endpoints.startPoint.x, y: endpoints.startPoint.y },
      { x: endpoints.endPoint.x, y: endpoints.endPoint.y },
    ];
  }

  if (entity?.type === "arc") {
    const startPoint = getPointById(entity.startPointId);
    const endPoint = getPointById(entity.endPointId);
    if (!startPoint || !endPoint) return null;
    return [
      { x: startPoint.x, y: startPoint.y },
      { x: endPoint.x, y: endPoint.y },
    ];
  }

  return null;
}

function getChainExitEndpointIndex(entity, worldPoint) {
  const endpoints = getChainEntityEndpoints(entity);
  if (!endpoints) return null;

  if (entity.type === "arc") {
    const centerPoint = getPointById(entity.centerPointId);
    if (centerPoint) {
      const startAngle = Math.atan2(
        endpoints[0].y - centerPoint.y,
        endpoints[0].x - centerPoint.x,
      );
      const endAngle = Math.atan2(
        endpoints[1].y - centerPoint.y,
        endpoints[1].x - centerPoint.x,
      );
      const pointerAngle = Math.atan2(
        worldPoint.y - centerPoint.y,
        worldPoint.x - centerPoint.x,
      );
      const sweep = getCounterClockwiseSweep(startAngle, endAngle);
      const pointerSweep = getCounterClockwiseSweep(startAngle, pointerAngle);
      if (
        sweep > GEOMETRY_EPSILON &&
        pointerSweep <= sweep + CHAIN_CONNECTION_TOLERANCE
      ) {
        return pointerSweep < sweep / 2 ? 0 : 1;
      }
    }
  }

  return squaredDistance(worldPoint, endpoints[0]) <=
    squaredDistance(worldPoint, endpoints[1])
    ? 0
    : 1;
}

function areChainPointsConnected(firstPoint, secondPoint) {
  return (
    squaredDistance(firstPoint, secondPoint) <= CHAIN_CONNECTION_TOLERANCE ** 2
  );
}

function collectDirectionalChain(startEntity, exitEndpointIndex) {
  const startEndpoints = getChainEntityEndpoints(startEntity);
  if (!startEndpoints || ![0, 1].includes(exitEndpointIndex)) {
    return { entityIds: [], closed: false, stoppedAtBranch: false };
  }

  const chainEntities = documentModel.entities
    .filter(
      (entity) =>
        isEntityOnCurrentLayer(entity) &&
        (entity.type === "line" || entity.type === "arc"),
    )
    .map((entity) => ({ entity, endpoints: getChainEntityEndpoints(entity) }))
    .filter(({ endpoints }) => endpoints !== null);
  const visitedEntityIds = new Set([startEntity.id]);
  const entityIds = [startEntity.id];
  const chainStartPoint = startEndpoints[1 - exitEndpointIndex];
  let connectionPoint = startEndpoints[exitEndpointIndex];
  let stoppedAtBranch = false;

  while (!areChainPointsConnected(connectionPoint, chainStartPoint)) {
    const connectedCandidates = chainEntities
      .filter(({ entity }) => !visitedEntityIds.has(entity.id))
      .map(({ entity, endpoints }) => {
        const connectsAtStart = areChainPointsConnected(
          connectionPoint,
          endpoints[0],
        );
        const connectsAtEnd = areChainPointsConnected(
          connectionPoint,
          endpoints[1],
        );
        if (!connectsAtStart && !connectsAtEnd) return null;
        return {
          entity,
          endpoints,
          entryEndpointIndex: connectsAtStart ? 0 : 1,
        };
      })
      .filter(Boolean);

    if (connectedCandidates.length !== 1) {
      stoppedAtBranch = connectedCandidates.length > 1;
      break;
    }

    const next = connectedCandidates[0];
    visitedEntityIds.add(next.entity.id);
    entityIds.push(next.entity.id);
    connectionPoint = next.endpoints[1 - next.entryEndpointIndex];
  }

  return {
    entityIds,
    closed: areChainPointsConnected(connectionPoint, chainStartPoint),
    stoppedAtBranch,
  };
}

function getChainDirectionArrowData(entity, exitEndpointIndex) {
  const endpoints = getChainEntityEndpoints(entity);
  if (!endpoints || ![0, 1].includes(exitEndpointIndex)) return null;

  if (entity.type === "line") {
    const direction =
      exitEndpointIndex === 1
        ? {
            x: endpoints[1].x - endpoints[0].x,
            y: endpoints[1].y - endpoints[0].y,
          }
        : {
            x: endpoints[0].x - endpoints[1].x,
            y: endpoints[0].y - endpoints[1].y,
          };
    const length = Math.hypot(direction.x, direction.y);
    if (length <= GEOMETRY_EPSILON) return null;
    return {
      position: {
        x: (endpoints[0].x + endpoints[1].x) / 2,
        y: (endpoints[0].y + endpoints[1].y) / 2,
      },
      direction: { x: direction.x / length, y: direction.y / length },
    };
  }

  const centerPoint = getPointById(entity.centerPointId);
  if (!centerPoint) return null;
  const startAngle = Math.atan2(
    endpoints[0].y - centerPoint.y,
    endpoints[0].x - centerPoint.x,
  );
  const endAngle = Math.atan2(
    endpoints[1].y - centerPoint.y,
    endpoints[1].x - centerPoint.x,
  );
  const sweep = getCounterClockwiseSweep(startAngle, endAngle);
  if (sweep <= GEOMETRY_EPSILON) return null;
  const midpointAngle = startAngle + sweep / 2;
  const counterClockwiseTangent = {
    x: -Math.sin(midpointAngle),
    y: Math.cos(midpointAngle),
  };
  return {
    position: {
      x: centerPoint.x + Math.cos(midpointAngle) * entity.radius,
      y: centerPoint.y + Math.sin(midpointAngle) * entity.radius,
    },
    direction:
      exitEndpointIndex === 1
        ? counterClockwiseTangent
        : {
            x: -counterClockwiseTangent.x,
            y: -counterClockwiseTangent.y,
          },
  };
}

function getChainSelectionCandidate(worldPoint, target) {
  const candidate = getSelectionHitCandidates(worldPoint, target).find(
    ({ entity }) => entity.type === "line" || entity.type === "arc",
  )?.entity;
  if (!candidate) return null;
  const exitEndpointIndex = getChainExitEndpointIndex(candidate, worldPoint);
  return exitEndpointIndex === null
    ? null
    : { entity: candidate, exitEndpointIndex };
}

function updateChainSelectionPreview(worldPoint, target) {
  const candidate = getChainSelectionCandidate(worldPoint, target);
  const candidateEntityId = candidate?.entity.id ?? null;
  const exitEndpointIndex = candidate?.exitEndpointIndex ?? null;
  const previewChanged =
    chainSelectionState.candidateEntityId !== candidateEntityId ||
    chainSelectionState.exitEndpointIndex !== exitEndpointIndex;
  chainSelectionState.candidateEntityId = candidateEntityId;
  chainSelectionState.exitEndpointIndex = exitEndpointIndex;
  setSelectionProximityHover(candidateEntityId);
  if (candidateEntityId === null) updateEntityHoverInfo(target);
  else updateEntityHoverInfoById(candidateEntityId);
  if (previewChanged) renderToolPreview();
}

function handleChainSelectClick(event) {
  const worldPoint = screenToWorld(event);
  const candidate = getChainSelectionCandidate(worldPoint, event.target);
  if (!candidate) {
    const clickedEntity = getSelectionHitCandidates(worldPoint, event.target)[0]
      ?.entity;
    if (clickedEntity) {
      commandStatus.textContent = "Select - Chain: Choose a line or arc.";
      return;
    }
    const selectionCount = selectionState.selectedEntityIds.size;
    selectionState.selectedEntityId = null;
    resetChainSelectionPreview();
    renderEntities();
    commandStatus.textContent = selectionCount
      ? "Chain selection cleared."
      : "Select - Chain: Choose a line or arc.";
    return;
  }

  const chain = collectDirectionalChain(
    candidate.entity,
    candidate.exitEndpointIndex,
  );
  const previousSelectionCount = selectionState.selectedEntityIds.size;
  addEntityIdsToSelection(chain.entityIds);
  const addedCount =
    selectionState.selectedEntityIds.size - previousSelectionCount;
  chainSelectionState.candidateEntityId = candidate.entity.id;
  chainSelectionState.exitEndpointIndex = candidate.exitEndpointIndex;
  chainSelectionState.lastChainEntityIds = [...chain.entityIds];
  selectionState.pickCycle = null;
  renderEntities();
  commandStatus.textContent =
    `Select - Chain: ${chain.entityIds.length} ` +
    `${chain.entityIds.length === 1 ? "entity" : "entities"} in the ` +
    `${chain.closed ? "closed shape" : "directional chain"} selected` +
    ` (${addedCount} newly added; ${selectionState.selectedEntityIds.size} total)` +
    (chain.stoppedAtBranch ? "; stopped at a branch." : ".");
}

function activateChainSelect() {
  if (!activateSingleSelect()) return;
  selectionState.mode = "chain";
  resetChainSelectionPreview();
  renderEntities();
  commandStatus.textContent =
    "Select - Chain: Move across a line or arc to set the arrow direction, then click to confirm.";
}

function selectAllPoints() {
  dismissSelectMenu();
  if (!activateSingleSelect()) return;
  selectionState.mode = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  const pointIds = documentModel.entities
    .filter(
      (entity) =>
        isCurrentLayerEditable() &&
        isEntityOnCurrentLayer(entity) &&
        entity.type === "point" &&
        !entity.isConstruction,
    )
    .map((entity) => entity.id);
  if (!pointIds.length) {
    commandStatus.textContent =
      "Select - Points: No visible points found; the current selection was kept.";
    return;
  }
  const previousSelectionCount = selectionState.selectedEntityIds.size;
  addEntityIdsToSelection(pointIds);
  const addedCount =
    selectionState.selectedEntityIds.size - previousSelectionCount;
  renderEntities();
  commandStatus.textContent =
    `Select - Points: ${pointIds.length} ${pointIds.length === 1 ? "point" : "points"} selected` +
    ` (${addedCount} newly added; ${selectionState.selectedEntityIds.size} total).`;
}

function selectAllLines() {
  dismissSelectMenu();
  if (!activateSingleSelect()) return;
  selectionState.mode = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  const lineIds = documentModel.entities
    .filter(
      (entity) =>
        isCurrentLayerEditable() &&
        isEntityOnCurrentLayer(entity) &&
        entity.type === "line",
    )
    .map((entity) => entity.id);
  if (!lineIds.length) {
    commandStatus.textContent =
      "Select - Lines: No lines found; the current selection was kept.";
    return;
  }
  const previousSelectionCount = selectionState.selectedEntityIds.size;
  addEntityIdsToSelection(lineIds);
  const addedCount =
    selectionState.selectedEntityIds.size - previousSelectionCount;
  renderEntities();
  commandStatus.textContent =
    `Select - Lines: ${lineIds.length} ${lineIds.length === 1 ? "line" : "lines"} selected` +
    ` (${addedCount} newly added; ${selectionState.selectedEntityIds.size} total).`;
}

function selectAllArcsAndCircles() {
  dismissSelectMenu();
  if (!activateSingleSelect()) return;
  selectionState.mode = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  const curvedEntities = documentModel.entities.filter(
    (entity) =>
      isCurrentLayerEditable() &&
      isEntityOnCurrentLayer(entity) &&
      (entity.type === "arc" || entity.type === "circle"),
  );
  if (!curvedEntities.length) {
    commandStatus.textContent =
      "Select - Arcs: No arcs or circles found; the current selection was kept.";
    return;
  }
  const arcCount = curvedEntities.filter(
    (entity) => entity.type === "arc",
  ).length;
  const circleCount = curvedEntities.length - arcCount;
  const previousSelectionCount = selectionState.selectedEntityIds.size;
  addEntityIdsToSelection(curvedEntities.map((entity) => entity.id));
  const addedCount =
    selectionState.selectedEntityIds.size - previousSelectionCount;
  renderEntities();
  commandStatus.textContent =
    `Select - Arcs: Selected ${arcCount} ${arcCount === 1 ? "arc" : "arcs"} and ` +
    `${circleCount} ${circleCount === 1 ? "circle" : "circles"}` +
    ` (${addedCount} newly added; ${selectionState.selectedEntityIds.size} total).`;
}

function selectAllDimensions() {
  dismissSelectMenu();
  if (!activateSingleSelect()) return;
  selectionState.mode = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  const dimensionIds = documentModel.entities
    .filter(
      (entity) =>
        isCurrentLayerEditable() &&
        isEntityOnCurrentLayer(entity) &&
        entity.type === "dimension",
    )
    .map((entity) => entity.id);
  if (!dimensionIds.length) {
    commandStatus.textContent =
      "Select - Dimensions: No dimensions found; the current selection was kept.";
    return;
  }
  const previousSelectionCount = selectionState.selectedEntityIds.size;
  addEntityIdsToSelection(dimensionIds);
  const addedCount =
    selectionState.selectedEntityIds.size - previousSelectionCount;
  renderEntities();
  commandStatus.textContent =
    `Select - Dimensions: ${dimensionIds.length} ` +
    `${dimensionIds.length === 1 ? "dimension" : "dimensions"} selected` +
    ` (${addedCount} newly added; ${selectionState.selectedEntityIds.size} total).`;
}

function selectAllEntitiesOnLayer(layerId) {
  const layer = getLayerById(layerId);
  if (!layer) {
    commandStatus.textContent = "Select - Layer: That layer is no longer available.";
    return;
  }
  if (layer.locked || layer.masked) {
    commandStatus.textContent =
      `Select - Layer: ${layer.name} is ${layer.masked ? "masked" : "locked"} and cannot be selected.`;
    return;
  }

  prepareSelectionCommand();
  selectionState.mode = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  const layerEntityIds = documentModel.entities
    .filter(
      (entity) =>
        getEntityLayerId(entity) === layer.id &&
        (entity.type !== "point" || !entity.isConstruction),
    )
    .map((entity) => entity.id);
  if (!layerEntityIds.length) {
    commandStatus.textContent =
      `Select - Layer: ${layer.name} has no selectable entities; the current selection was kept.`;
    return;
  }

  const previousSelectionCount = selectionState.selectedEntityIds.size;
  addEntityIdsToSelection(layerEntityIds);
  const addedCount =
    selectionState.selectedEntityIds.size - previousSelectionCount;
  renderEntities();
  commandStatus.textContent =
    `Select - Layer: ${layerEntityIds.length} ` +
    `${layerEntityIds.length === 1 ? "entity" : "entities"} in ${layer.name} selected` +
    ` (${addedCount} newly added; ${selectionState.selectedEntityIds.size} total).`;
}

function handleSelectLayerMenuClick(event) {
  const button = event.target.closest("button[data-select-layer-id]");
  if (!button || button.disabled) return;
  const layerId = Number(button.dataset.selectLayerId);
  if (!Number.isInteger(layerId)) return;
  selectAllEntitiesOnLayer(layerId);
}

function selectAllEntities() {
  dismissSelectMenu();
  if (!activateSingleSelect()) return;
  if (is3dWorkspace()) {
    const visibleProfileIds = documentModel.entities
      .filter(
        (entity) =>
          isCurrentLayerEditable() &&
          isEntityOnCurrentLayer(entity) &&
          isEntityLayerVisible(entity) &&
          (entity.type !== "point" || !entity.isConstruction),
      )
      .map((entity) => entity.id);
    const visibleSolidIds = documentModel.model3d.solids
      .filter(
        (solid) =>
          isCurrentLayerEditable() &&
          isEntityOnCurrentLayer(solid) &&
          isEntityLayerVisible(solid),
      )
      .map((solid) => solid.id);
    visibleProfileIds.forEach((entityId) =>
      selectionState.selectedEntityIds.add(entityId),
    );
    visibleSolidIds.forEach((solidId) =>
      modelSelectionState.selectedSolidIds.add(solidId),
    );
    const total = visibleProfileIds.length + visibleSolidIds.length;
    renderEntities();
    commandStatus.textContent = total
      ? `Select - All: Selected ${total} visible 3D workspace ${total === 1 ? "item" : "items"}.`
      : "Select - All: No visible profiles or solids found.";
    return;
  }
  selectionState.mode = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  const visibleEntityIds = documentModel.entities
    .filter(
      (entity) =>
        isCurrentLayerEditable() &&
        isEntityOnCurrentLayer(entity) &&
        (entity.type !== "point" || !entity.isConstruction),
    )
    .map((entity) => entity.id);
  if (!visibleEntityIds.length) {
    commandStatus.textContent = "Select - All: No visible entities found.";
    return;
  }
  const previousSelectionCount = selectionState.selectedEntityIds.size;
  addEntityIdsToSelection(visibleEntityIds);
  const addedCount =
    selectionState.selectedEntityIds.size - previousSelectionCount;
  renderEntities();
  commandStatus.textContent =
    `Select - All: ${visibleEntityIds.length} ` +
    `${visibleEntityIds.length === 1 ? "entity" : "entities"} selected` +
    ` (${addedCount} newly added).`;
}

function deselectAllEntities() {
  dismissSelectMenu();
  const selectionCount =
    selectionState.selectedEntityIds.size +
    modelSelectionState.selectedSolidIds.size;
  selectionState.selectedEntityId = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  resetChainSelectionPreview();
  clearModelSelection();
  renderEntities();
  commandStatus.textContent = selectionCount
    ? `Deselected ${selectionCount} ${selectionCount === 1 ? "item" : "items"}.`
    : "Deselect All: Nothing was selected.";
}

function formatDecimal(value, decimalPlaces = 4) {
  const threshold = 0.5 * 10 ** -decimalPlaces;
  const normalizedValue = Math.abs(value) < threshold ? 0 : value;
  return normalizedValue.toFixed(decimalPlaces);
}

function formatCoordinate(value) {
  const displayValue = convertInternalLengthToDisplay(value);
  return formatDecimal(displayValue, documentModel.units === "metric" ? 3 : 4);
}

function evaluateArithmeticExpression(expression) {
  const source = String(expression).replaceAll("×", "*");
  let index = 0;

  function skipWhitespace() {
    while (/\s/.test(source[index] ?? "")) index += 1;
  }

  function parseNumber() {
    skipWhitespace();
    const match = source
      .slice(index)
      .match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if (!match) throw new Error("Expected a number");
    index += match[0].length;
    return Number(match[0]);
  }

  function parsePrimary() {
    skipWhitespace();
    if (source[index] !== "(") return parseNumber();

    index += 1;
    const value = parseExpression();
    skipWhitespace();
    if (source[index] !== ")")
      throw new Error("Expected a closing parenthesis");
    index += 1;
    return value;
  }

  function parseUnary() {
    skipWhitespace();
    if (source[index] === "+" || source[index] === "-") {
      const operator = source[index];
      index += 1;
      const value = parseUnary();
      return operator === "-" ? -value : value;
    }
    return parsePrimary();
  }

  function parseTerm() {
    let value = parseUnary();
    while (true) {
      skipWhitespace();
      const operator = source[index];
      if (operator !== "*" && operator !== "/") break;
      index += 1;
      const rightValue = parseUnary();
      if (operator === "/" && rightValue === 0) {
        throw new Error("Division by zero");
      }
      value = operator === "*" ? value * rightValue : value / rightValue;
    }
    return value;
  }

  function parseExpression() {
    let value = parseTerm();
    while (true) {
      skipWhitespace();
      const operator = source[index];
      if (operator !== "+" && operator !== "-") break;
      index += 1;
      const rightValue = parseTerm();
      value = operator === "+" ? value + rightValue : value - rightValue;
    }
    return value;
  }

  try {
    if (!source.trim()) return null;
    const value = parseExpression();
    skipWhitespace();
    if (index !== source.length || !Number.isFinite(value)) return null;
    return Object.is(value, -0) ? 0 : value;
  } catch {
    return null;
  }
}

function formatArithmeticResult(value) {
  const normalizedValue = Object.is(value, -0) ? 0 : value;
  return Number(normalizedValue.toPrecision(15)).toString();
}

function getArithmeticDisplayValue(input) {
  return evaluateArithmeticExpression(input.value);
}

function getArithmeticInputValue(input) {
  const value = getArithmeticDisplayValue(input);
  if (value === null || !UNIT_LENGTH_INPUTS.has(input)) return value;
  return convertDisplayLengthToInternal(value);
}

function resolveArithmeticInput(
  input,
  {
    messageElement,
    invalidMessage = "Enter a valid arithmetic expression.",
    validationMessage = null,
    successMessage = null,
  },
) {
  const displayValue = getArithmeticDisplayValue(input);
  const value =
    displayValue === null
      ? null
      : UNIT_LENGTH_INPUTS.has(input)
        ? convertDisplayLengthToInternal(displayValue)
        : displayValue;
  let message = value === null ? invalidMessage : "";
  if (!message && validationMessage) {
    message = validationMessage(value) ?? "";
  }

  input.setCustomValidity(message);
  if (message) {
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.dataset.arithmeticError = "true";
    }
    return null;
  }

  input.value = formatArithmeticResult(displayValue);
  if (messageElement?.dataset.arithmeticError === "true") {
    const resolvedSuccessMessage =
      typeof successMessage === "function" ? successMessage() : successMessage;
    if (resolvedSuccessMessage) {
      messageElement.textContent = resolvedSuccessMessage;
    }
    delete messageElement.dataset.arithmeticError;
  }
  return value;
}

function getEntityDescription(entity) {
  if (entity.type === "point") {
    return `Point ${entity.id}: X${formatCoordinate(entity.x)} Y${formatCoordinate(entity.y)}`;
  }

  if (entity.type === "line") {
    const startPoint = getPointById(entity.startPointId);
    const endPoint = getPointById(entity.endPointId);
    if (!startPoint || !endPoint) return `Line ${entity.id}`;
    const length = Math.hypot(
      endPoint.x - startPoint.x,
      endPoint.y - startPoint.y,
    );
    return `Line ${entity.id}: Length ${formatCoordinate(length)}`;
  }

  if (entity.type === "circle") {
    const centerPoint = getPointById(entity.centerPointId);
    if (!centerPoint) return `Circle ${entity.id}`;
    return (
      `Circle ${entity.id}: X${formatCoordinate(centerPoint.x)} ` +
      `Y${formatCoordinate(centerPoint.y)} R${formatCoordinate(entity.radius)}`
    );
  }

  if (entity.type === "arc") {
    const centerPoint = getPointById(entity.centerPointId);
    const startPoint = getPointById(entity.startPointId);
    const endPoint = getPointById(entity.endPointId);
    if (!centerPoint || !startPoint || !endPoint) return `Arc ${entity.id}`;
    const startAngle = Math.atan2(
      startPoint.y - centerPoint.y,
      startPoint.x - centerPoint.x,
    );
    const endAngle = Math.atan2(
      endPoint.y - centerPoint.y,
      endPoint.x - centerPoint.x,
    );
    const sweepDegrees =
      (getCounterClockwiseSweep(startAngle, endAngle) * 180) / Math.PI;
    return (
      `Arc ${entity.id}: X${formatCoordinate(centerPoint.x)} ` +
      `Y${formatCoordinate(centerPoint.y)} R${formatCoordinate(entity.radius)} ` +
      `Sweep ${formatDecimal(sweepDegrees)}°`
    );
  }

  if (entity.type === "text") {
    return (
      `Text ${entity.id}: “${entity.content}” ` +
      `Height ${formatCoordinate(entity.height)}`
    );
  }

  if (entity.type === "dimension") {
    if (entity.dimensionType === "linear") {
      return `Linear Dimension ${entity.id}: ${formatCoordinate(entity.value)}`;
    }
    if (entity.dimensionType === "radius") {
      return `Radius Dimension ${entity.id}: R${formatCoordinate(entity.radius)}`;
    }
    if (entity.dimensionType === "diameter") {
      return `Diameter Dimension ${entity.id}: ⌀${formatCoordinate(entity.radius * 2)}`;
    }
    if (entity.dimensionType === "angle") {
      return `Angle Dimension ${entity.id}: ${formatDecimal(entity.valueDegrees)}°`;
    }
  }

  return `Entity ${entity.id}`;
}

function formatDxfNumber(value) {
  const normalizedValue = Math.abs(value) <= 1e-12 ? 0 : value;
  return normalizedValue.toFixed(12).replace(/\.?0+$/, "");
}

function formatDxfLength(value) {
  return formatDxfNumber(convertInternalLengthToDisplay(value));
}

function appendDxfPair(lines, code, value) {
  lines.push(String(code), String(value));
}

function appendDxfEntity(lines, type, layer, values) {
  appendDxfPair(lines, 0, type);
  appendDxfPair(lines, 8, layer);
  values.forEach(([code, value]) => appendDxfPair(lines, code, value));
}

function getDxfExportData() {
  const records = [];
  const extents = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  function includePoint(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    extents.minX = Math.min(extents.minX, x);
    extents.minY = Math.min(extents.minY, y);
    extents.maxX = Math.max(extents.maxX, x);
    extents.maxY = Math.max(extents.maxY, y);
  }

  documentModel.entities.forEach((entity) => {
    if (entity.type === "point") {
      if (entity.isConstruction) return;
      if (!Number.isFinite(entity.x) || !Number.isFinite(entity.y)) return;
      includePoint(entity.x, entity.y);
      records.push({
        type: "POINT",
        layer: "POINTS",
        values: [
          [10, formatDxfLength(entity.x)],
          [20, formatDxfLength(entity.y)],
          [30, "0"],
        ],
      });
      return;
    }

    if (entity.type === "line") {
      const endpoints = getLineEndpointPair(entity);
      if (!endpoints) return;
      const { startPoint, endPoint } = endpoints;
      includePoint(startPoint.x, startPoint.y);
      includePoint(endPoint.x, endPoint.y);
      records.push({
        type: "LINE",
        layer: "GEOMETRY",
        values: [
          [10, formatDxfLength(startPoint.x)],
          [20, formatDxfLength(startPoint.y)],
          [30, "0"],
          [11, formatDxfLength(endPoint.x)],
          [21, formatDxfLength(endPoint.y)],
          [31, "0"],
        ],
      });
      return;
    }

    if (entity.type === "circle") {
      const centerPoint = getPointById(entity.centerPointId);
      if (
        !centerPoint ||
        !Number.isFinite(entity.radius) ||
        entity.radius <= 0
      ) {
        return;
      }
      includePoint(
        centerPoint.x - entity.radius,
        centerPoint.y - entity.radius,
      );
      includePoint(
        centerPoint.x + entity.radius,
        centerPoint.y + entity.radius,
      );
      records.push({
        type: "CIRCLE",
        layer: "GEOMETRY",
        values: [
          [10, formatDxfLength(centerPoint.x)],
          [20, formatDxfLength(centerPoint.y)],
          [30, "0"],
          [40, formatDxfLength(entity.radius)],
        ],
      });
      return;
    }

    if (entity.type === "arc") {
      const centerPoint = getPointById(entity.centerPointId);
      const startPoint = getPointById(entity.startPointId);
      const endPoint = getPointById(entity.endPointId);
      if (
        !centerPoint ||
        !startPoint ||
        !endPoint ||
        !Number.isFinite(entity.radius) ||
        entity.radius <= 0
      ) {
        return;
      }

      const startAngle =
        (normalizeAngle(
          Math.atan2(
            startPoint.y - centerPoint.y,
            startPoint.x - centerPoint.x,
          ),
        ) *
          180) /
        Math.PI;
      const endAngle =
        (normalizeAngle(
          Math.atan2(endPoint.y - centerPoint.y, endPoint.x - centerPoint.x),
        ) *
          180) /
        Math.PI;
      includePoint(
        centerPoint.x - entity.radius,
        centerPoint.y - entity.radius,
      );
      includePoint(
        centerPoint.x + entity.radius,
        centerPoint.y + entity.radius,
      );
      records.push({
        type: "ARC",
        layer: "GEOMETRY",
        values: [
          [10, formatDxfLength(centerPoint.x)],
          [20, formatDxfLength(centerPoint.y)],
          [30, "0"],
          [40, formatDxfLength(entity.radius)],
          [50, formatDxfNumber(startAngle)],
          [51, formatDxfNumber(endAngle)],
        ],
      });
    }
  });

  if (!records.length) return { records, extents: null };
  return { records, extents };
}

function createDxfDocument() {
  const { records, extents } = getDxfExportData();
  if (!extents) return { content: null, entityCount: 0 };

  const lines = [];
  appendDxfPair(
    lines,
    999,
    `${APP_NAME} V${APP_VERSION} R12 ASCII DXF - drawing units are ` +
      `${documentModel.units === "metric" ? "millimetres" : "inches"}`,
  );
  appendDxfPair(lines, 0, "SECTION");
  appendDxfPair(lines, 2, "HEADER");
  appendDxfPair(lines, 9, "$ACADVER");
  appendDxfPair(lines, 1, "AC1009");
  appendDxfPair(lines, 9, "$MEASUREMENT");
  appendDxfPair(lines, 70, documentModel.units === "metric" ? 1 : 0);
  appendDxfPair(lines, 9, "$EXTMIN");
  appendDxfPair(lines, 10, formatDxfLength(extents.minX));
  appendDxfPair(lines, 20, formatDxfLength(extents.minY));
  appendDxfPair(lines, 30, 0);
  appendDxfPair(lines, 9, "$EXTMAX");
  appendDxfPair(lines, 10, formatDxfLength(extents.maxX));
  appendDxfPair(lines, 20, formatDxfLength(extents.maxY));
  appendDxfPair(lines, 30, 0);
  appendDxfPair(lines, 0, "ENDSEC");

  appendDxfPair(lines, 0, "SECTION");
  appendDxfPair(lines, 2, "TABLES");
  appendDxfPair(lines, 0, "TABLE");
  appendDxfPair(lines, 2, "LTYPE");
  appendDxfPair(lines, 70, 1);
  appendDxfPair(lines, 0, "LTYPE");
  appendDxfPair(lines, 2, "CONTINUOUS");
  appendDxfPair(lines, 70, 0);
  appendDxfPair(lines, 3, "Solid line");
  appendDxfPair(lines, 72, 65);
  appendDxfPair(lines, 73, 0);
  appendDxfPair(lines, 40, 0);
  appendDxfPair(lines, 0, "ENDTAB");
  appendDxfPair(lines, 0, "TABLE");
  appendDxfPair(lines, 2, "LAYER");
  appendDxfPair(lines, 70, 2);
  ["POINTS", "GEOMETRY"].forEach((layerName) => {
    appendDxfPair(lines, 0, "LAYER");
    appendDxfPair(lines, 2, layerName);
    appendDxfPair(lines, 70, 0);
    appendDxfPair(lines, 62, 7);
    appendDxfPair(lines, 6, "CONTINUOUS");
  });
  appendDxfPair(lines, 0, "ENDTAB");
  appendDxfPair(lines, 0, "ENDSEC");

  appendDxfPair(lines, 0, "SECTION");
  appendDxfPair(lines, 2, "ENTITIES");
  records.forEach((record) => {
    appendDxfEntity(lines, record.type, record.layer, record.values);
  });
  appendDxfPair(lines, 0, "ENDSEC");
  appendDxfPair(lines, 0, "EOF");

  return {
    content: `${lines.join("\r\n")}\r\n`,
    entityCount: records.length,
  };
}

function dismissFileMenu() {
  fileMenuItem.classList.add("is-dismissed");
  document.activeElement?.blur();
}

function exportDxf() {
  dismissFileMenu();
  clearEntityHoverInfo();
  const { content, entityCount: exportedEntityCount } = createDxfDocument();
  if (!content) {
    commandStatus.textContent = "Export DXF: There are no entities to export.";
    return;
  }

  const blob = new Blob([content], { type: "application/dxf;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = `${APP_NAME}.dxf`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  commandStatus.textContent =
    `Exported ${exportedEntityCount} ${exportedEntityCount === 1 ? "entity" : "entities"} ` +
    `to ${APP_NAME}.dxf.`;
}

function clearEntityHoverInfo() {
  entityHoverInfo.hidden = true;
  entityHoverInfo.textContent = "";
  entityHoverInfo.removeAttribute("data-entity-id");
  commandStatus.hidden = false;
}

function updateEntityHoverInfo(target) {
  const entityElement = target.closest(
    ".point-entity, .line-entity, .circle-entity, .arc-entity, .text-entity, .dimension-entity",
  );
  if (!entityElement) {
    clearEntityHoverInfo();
    return;
  }

  updateEntityHoverInfoById(Number(entityElement.dataset.entityId));
}

function updateEntityHoverInfoById(entityId) {
  if (entityId === null) {
    clearEntityHoverInfo();
    return;
  }
  if (entityHoverInfo.dataset.entityId === String(entityId)) return;
  const entity = getEntityById(entityId);
  if (!entity) {
    clearEntityHoverInfo();
    return;
  }

  entityHoverInfo.dataset.entityId = String(entityId);
  entityHoverInfo.textContent = getEntityDescription(entity);
  commandStatus.hidden = true;
  entityHoverInfo.hidden = false;
}

function updateModelHoverInfo(target) {
  const faceElement = target?.closest?.(".solid-face[data-solid-id]");
  modelLayer
    .querySelectorAll(".solid-face.is-hovered")
    .forEach((element) => element.classList.remove("is-hovered"));
  if (!faceElement) {
    modelSelectionState.hoveredSolidId = null;
    modelSelectionState.hoveredFaceIndex = null;
    clearEntityHoverInfo();
    return false;
  }
  const solidId = Number(faceElement.dataset.solidId);
  const faceIndex = Number(faceElement.dataset.faceIndex);
  const solid = getSolidById(solidId);
  if (!solid) return false;
  faceElement.classList.add("is-hovered");
  modelSelectionState.hoveredSolidId = solidId;
  modelSelectionState.hoveredFaceIndex = faceIndex;
  const faceId = faceElement.dataset.faceId ?? `face-${faceIndex}`;
  const faceName =
    getSolidFaceRecords(solid).find((face) => face.id === faceId)?.name ??
    `Face ${faceIndex + 1}`;
  entityHoverInfo.removeAttribute("data-entity-id");
  entityHoverInfo.textContent = `${getSolidDescription(solid)}: ${faceName} face`;
  commandStatus.hidden = true;
  entityHoverInfo.hidden = false;
  return true;
}

function setSelectionProximityHover(entityId) {
  if (selectionState.hoveredEntityId === entityId) return;
  selectionState.hoveredEntityId = entityId;
  entityLayer
    .querySelectorAll(".is-proximity-hovered")
    .forEach((element) => element.classList.remove("is-proximity-hovered"));
  if (entityId === null) return;
  [...entityLayer.querySelectorAll("[data-entity-id]")]
    .find((element) => Number(element.dataset.entityId) === entityId)
    ?.classList.add("is-proximity-hovered");
}

function renderPoint(point) {
  const isDirectionChoice = pointOnEntityState.directionChoices.some(
    (choice) => choice.pointId === point.id,
  );
  const pointGroup = createSvgElement("g", {
    class: [
      "point-entity",
      isEntityOnCurrentLayer(point) && isCurrentLayerEditable()
        ? ""
        : "is-inactive-layer",
      isEntitySelected(point.id) ? "is-selected" : "",
      threeEntityCircleState.entityIds.includes(point.id)
        ? "is-apollonius-source"
        : "",
      joinState.firstPointId === point.id ? "is-join-start" : "",
      lineSketchState.startPointId === point.id ? "is-line-sketch-start" : "",
      lineAngleState.sourceEntityId === point.id ? "is-line-angle-source" : "",
      lineTangentState.sourceEntityId === point.id
        ? "is-line-tangent-source"
        : "",
      circleState.centerPointId === point.id ? "is-circle-center" : "",
      hexagonState.centerPointId === point.id ? "is-hexagon-center" : "",
      rectangleState.centerPointId === point.id ? "is-rectangle-center" : "",
      boltHoleCircleState.centerPointId === point.id
        ? "is-bolt-hole-circle-center"
        : "",
      dimensionState.firstEntityId === point.id ? "is-dimension-first" : "",
      pointOnEntityState.awaitingDirection && isDirectionChoice
        ? "is-point-on-entity-direction"
        : "",
      pointOnEntityState.zeroPointId === point.id
        ? "is-point-on-entity-zero"
        : "",
      translateByPointsState.firstPointId === point.id
        ? "is-translate-first-point"
        : "",
      translateByPointsState.secondPointId === point.id
        ? "is-translate-second-point"
        : "",
    ]
      .filter(Boolean)
      .join(" "),
    "data-entity-id": point.id,
    "data-entity-type": point.type,
    "data-layer-id": getEntityLayerId(point),
  });

  // Counter the view zoom so point markers keep the same on-screen size.
  const pointDiagonal = 0.15 / viewState.zoom;
  const diagonalOffset = pointDiagonal / (2 * Math.SQRT2);
  pointGroup.appendChild(
    createSvgElement("circle", {
      cx: point.x,
      cy: point.y,
      r: 0.14 / viewState.zoom,
      class: "entity-hit-target",
    }),
  );

  drawLine(
    pointGroup,
    point.x - diagonalOffset,
    point.y - diagonalOffset,
    point.x + diagonalOffset,
    point.y + diagonalOffset,
    "point-x",
  );
  drawLine(
    pointGroup,
    point.x - diagonalOffset,
    point.y + diagonalOffset,
    point.x + diagonalOffset,
    point.y - diagonalOffset,
    "point-x",
  );

  const title = createSvgElement("title", {});
  title.textContent = `Point ${point.id}: X${formatCoordinate(point.x)} Y${formatCoordinate(point.y)}`;
  pointGroup.appendChild(title);
  entityLayer.appendChild(pointGroup);
}

function getPointById(pointId) {
  return documentModel.entities.find(
    (entity) => entity.type === "point" && entity.id === pointId,
  );
}

function renderLineEntity(lineEntity) {
  const startPoint = getPointById(lineEntity.startPointId);
  const endPoint = getPointById(lineEntity.endPointId);
  if (!startPoint || !endPoint) return;

  const lineGroup = createSvgElement("g", {
    class: [
      "line-entity",
      isEntityOnCurrentLayer(lineEntity) && isCurrentLayerEditable()
        ? ""
        : "is-inactive-layer",
      isEntitySelected(lineEntity.id) ? "is-selected" : "",
      threeEntityCircleState.entityIds.includes(lineEntity.id)
        ? "is-apollonius-source"
        : "",
      intersectionState.firstEntityId === lineEntity.id
        ? "is-intersection-first"
        : "",
      offsetState.sourceEntityId === lineEntity.id ? "is-offset-source" : "",
      trimExtendState.sourceEntityId === lineEntity.id
        ? "is-trim-extend-source"
        : "",
      pointOnEntityState.sourceEntityId === lineEntity.id
        ? "is-point-on-entity-source"
        : "",
      filletState.firstEntityId === lineEntity.id ? "is-fillet-first" : "",
      dimensionState.firstEntityId === lineEntity.id ||
      dimensionState.firstLineId === lineEntity.id
        ? "is-dimension-first"
        : "",
      lineAngleState.sourceEntityId === lineEntity.id
        ? "is-line-angle-source"
        : "",
    ]
      .filter(Boolean)
      .join(" "),
    "data-entity-id": lineEntity.id,
    "data-entity-type": lineEntity.type,
    "data-layer-id": getEntityLayerId(lineEntity),
  });

  drawLine(
    lineGroup,
    startPoint.x,
    startPoint.y,
    endPoint.x,
    endPoint.y,
    "line-hit-target",
  );
  drawLine(
    lineGroup,
    startPoint.x,
    startPoint.y,
    endPoint.x,
    endPoint.y,
    "line-geometry",
  );

  const title = createSvgElement("title", {});
  title.textContent = `Line ${lineEntity.id}: Point ${startPoint.id} to Point ${endPoint.id}`;
  lineGroup.appendChild(title);
  entityLayer.appendChild(lineGroup);
}

function renderCircleEntity(circleEntity) {
  const centerPoint = getPointById(circleEntity.centerPointId);
  if (!centerPoint) return;

  const circleGroup = createSvgElement("g", {
    class: [
      "circle-entity",
      isEntityOnCurrentLayer(circleEntity) && isCurrentLayerEditable()
        ? ""
        : "is-inactive-layer",
      isEntitySelected(circleEntity.id) ? "is-selected" : "",
      threeEntityCircleState.entityIds.includes(circleEntity.id)
        ? "is-apollonius-source"
        : "",
      intersectionState.firstEntityId === circleEntity.id
        ? "is-intersection-first"
        : "",
      offsetState.sourceEntityId === circleEntity.id ? "is-offset-source" : "",
      trimExtendState.sourceEntityId === circleEntity.id
        ? "is-trim-extend-source"
        : "",
      pointOnEntityState.sourceEntityId === circleEntity.id
        ? "is-point-on-entity-source"
        : "",
      filletState.firstEntityId === circleEntity.id ? "is-fillet-first" : "",
      dimensionState.firstEntityId === circleEntity.id
        ? "is-dimension-first"
        : "",
      lineAngleState.sourceEntityId === circleEntity.id
        ? "is-line-angle-source"
        : "",
      lineTangentState.sourceEntityId === circleEntity.id
        ? "is-line-tangent-source"
        : "",
    ]
      .filter(Boolean)
      .join(" "),
    "data-entity-id": circleEntity.id,
    "data-entity-type": circleEntity.type,
    "data-layer-id": getEntityLayerId(circleEntity),
  });

  circleGroup.appendChild(
    createSvgElement("circle", {
      cx: centerPoint.x,
      cy: centerPoint.y,
      r: circleEntity.radius,
      class: "circle-hit-target",
    }),
  );
  circleGroup.appendChild(
    createSvgElement("circle", {
      cx: centerPoint.x,
      cy: centerPoint.y,
      r: circleEntity.radius,
      class: "circle-geometry",
    }),
  );

  const title = createSvgElement("title", {});
  title.textContent = `Circle ${circleEntity.id}: Center point ${centerPoint.id}, radius ${formatCoordinate(circleEntity.radius)}`;
  circleGroup.appendChild(title);
  entityLayer.appendChild(circleGroup);
}

function renderArcEntity(arcEntity) {
  const centerPoint = getPointById(arcEntity.centerPointId);
  const startPoint = getPointById(arcEntity.startPointId);
  const endPoint = getPointById(arcEntity.endPointId);
  if (!centerPoint || !startPoint || !endPoint) return;

  const startAngle = Math.atan2(
    startPoint.y - centerPoint.y,
    startPoint.x - centerPoint.x,
  );
  const endAngle = Math.atan2(
    endPoint.y - centerPoint.y,
    endPoint.x - centerPoint.x,
  );
  const sweep = getCounterClockwiseSweep(startAngle, endAngle);
  if (sweep <= GEOMETRY_EPSILON) return;

  const arcPath = [
    `M ${startPoint.x} ${startPoint.y}`,
    `A ${arcEntity.radius} ${arcEntity.radius} 0 ${sweep > Math.PI ? 1 : 0} 1 ${endPoint.x} ${endPoint.y}`,
  ].join(" ");
  const arcGroup = createSvgElement("g", {
    class: [
      "arc-entity",
      isEntityOnCurrentLayer(arcEntity) && isCurrentLayerEditable()
        ? ""
        : "is-inactive-layer",
      isEntitySelected(arcEntity.id) ? "is-selected" : "",
      pointOnEntityState.sourceEntityId === arcEntity.id
        ? "is-point-on-entity-source"
        : "",
      filletState.firstEntityId === arcEntity.id ? "is-fillet-first" : "",
      dimensionState.firstEntityId === arcEntity.id ? "is-dimension-first" : "",
      lineAngleState.sourceEntityId === arcEntity.id
        ? "is-line-angle-source"
        : "",
      lineTangentState.sourceEntityId === arcEntity.id
        ? "is-line-tangent-source"
        : "",
    ]
      .filter(Boolean)
      .join(" "),
    "data-entity-id": arcEntity.id,
    "data-entity-type": arcEntity.type,
    "data-layer-id": getEntityLayerId(arcEntity),
  });

  arcGroup.appendChild(
    createSvgElement("path", {
      d: arcPath,
      class: "arc-hit-target",
    }),
  );
  arcGroup.appendChild(
    createSvgElement("path", {
      d: arcPath,
      class: "arc-geometry",
    }),
  );

  const title = createSvgElement("title", {});
  title.textContent =
    `Arc ${arcEntity.id}: Center point ${centerPoint.id}, ` +
    `endpoint points ${startPoint.id} and ${endPoint.id}`;
  arcGroup.appendChild(title);
  entityLayer.appendChild(arcGroup);
}

function renderTextEntity(textEntity) {
  const bounds = getTextEntityBounds(textEntity);
  if (!bounds) return;
  const group = createSvgElement("g", {
    class: [
      "text-entity",
      isEntityOnCurrentLayer(textEntity) && isCurrentLayerEditable()
        ? ""
        : "is-inactive-layer",
      isEntitySelected(textEntity.id) ? "is-selected" : "",
    ]
      .filter(Boolean)
      .join(" "),
    "data-entity-id": textEntity.id,
    "data-entity-type": textEntity.type,
    "data-layer-id": getEntityLayerId(textEntity),
  });
  group.appendChild(
    createSvgElement("rect", {
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.width,
      height: bounds.height,
      class: "text-hit-target",
    }),
  );
  group.appendChild(createCadTextElement(textEntity, "text-geometry"));
  const title = createSvgElement("title", {});
  title.textContent =
    `Text ${textEntity.id}: ${textEntity.content}; ` +
    `height ${formatCoordinate(textEntity.height)}`;
  group.appendChild(title);
  entityLayer.appendChild(group);
}

function appendDimensionArrow(parent, tip, inwardDirection) {
  const directionLength = Math.hypot(inwardDirection.x, inwardDirection.y);
  if (directionLength <= GEOMETRY_EPSILON) return;
  const direction = {
    x: inwardDirection.x / directionLength,
    y: inwardDirection.y / directionLength,
  };
  const normal = { x: -direction.y, y: direction.x };
  const arrowLength = 0.11 / viewState.zoom;
  const halfWidth = 0.045 / viewState.zoom;
  const base = {
    x: tip.x + direction.x * arrowLength,
    y: tip.y + direction.y * arrowLength,
  };
  const firstWing = {
    x: base.x + normal.x * halfWidth,
    y: base.y + normal.y * halfWidth,
  };
  const secondWing = {
    x: base.x - normal.x * halfWidth,
    y: base.y - normal.y * halfWidth,
  };
  parent.appendChild(
    createSvgElement("path", {
      d: `M ${firstWing.x} ${firstWing.y} L ${tip.x} ${tip.y} L ${secondWing.x} ${secondWing.y}`,
      class: "dimension-geometry",
    }),
  );
}

function appendDimensionText(parent, x, y, value) {
  const text = createSvgElement("text", {
    x,
    y: -y,
    transform: "scale(1 -1)",
    class: "dimension-text",
    "font-size": 0.17 / viewState.zoom,
    "text-anchor": "middle",
    "dominant-baseline": "middle",
  });
  text.textContent = value;
  parent.appendChild(text);
}

function renderDimensionEntity(dimension) {
  const group = createSvgElement("g", {
    class: [
      "dimension-entity",
      isEntityOnCurrentLayer(dimension) && isCurrentLayerEditable()
        ? ""
        : "is-inactive-layer",
      isEntitySelected(dimension.id) ? "is-selected" : "",
    ]
      .filter(Boolean)
      .join(" "),
    "data-entity-id": dimension.id,
    "data-entity-type": dimension.type,
    "data-layer-id": getEntityLayerId(dimension),
  });
  let hitPath = "";
  let titleText = `Dimension ${dimension.id}`;

  if (dimension.dimensionType === "linear") {
    drawLine(
      group,
      dimension.startX,
      dimension.startY,
      dimension.dimensionStartX,
      dimension.dimensionStartY,
      "dimension-geometry",
    );
    drawLine(
      group,
      dimension.endX,
      dimension.endY,
      dimension.dimensionEndX,
      dimension.dimensionEndY,
      "dimension-geometry",
    );
    drawLine(
      group,
      dimension.dimensionStartX,
      dimension.dimensionStartY,
      dimension.dimensionEndX,
      dimension.dimensionEndY,
      "dimension-geometry",
    );
    const direction = {
      x: dimension.dimensionEndX - dimension.dimensionStartX,
      y: dimension.dimensionEndY - dimension.dimensionStartY,
    };
    appendDimensionArrow(
      group,
      { x: dimension.dimensionStartX, y: dimension.dimensionStartY },
      direction,
    );
    appendDimensionArrow(
      group,
      { x: dimension.dimensionEndX, y: dimension.dimensionEndY },
      { x: -direction.x, y: -direction.y },
    );
    const labelX = (dimension.dimensionStartX + dimension.dimensionEndX) / 2;
    const labelY = (dimension.dimensionStartY + dimension.dimensionEndY) / 2;
    appendDimensionText(
      group,
      labelX,
      labelY,
      formatCoordinate(dimension.value),
    );
    hitPath =
      `M ${dimension.dimensionStartX} ${dimension.dimensionStartY} ` +
      `L ${dimension.dimensionEndX} ${dimension.dimensionEndY}`;
    titleText = `Linear dimension ${dimension.id}: ${formatCoordinate(dimension.value)}`;
  } else if (
    dimension.dimensionType === "radius" ||
    dimension.dimensionType === "diameter"
  ) {
    const direction = {
      x: Math.cos(dimension.angle),
      y: Math.sin(dimension.angle),
    };
    const positiveEnd = {
      x: dimension.centerX + direction.x * dimension.radius,
      y: dimension.centerY + direction.y * dimension.radius,
    };
    const negativeEnd =
      dimension.dimensionType === "diameter"
        ? {
            x: dimension.centerX - direction.x * dimension.radius,
            y: dimension.centerY - direction.y * dimension.radius,
          }
        : { x: dimension.centerX, y: dimension.centerY };
    drawLine(
      group,
      negativeEnd.x,
      negativeEnd.y,
      positiveEnd.x,
      positiveEnd.y,
      "dimension-geometry",
    );
    appendDimensionArrow(group, positiveEnd, {
      x: -direction.x,
      y: -direction.y,
    });
    if (dimension.dimensionType === "diameter") {
      appendDimensionArrow(group, negativeEnd, direction);
    }
    const labelDistance = dimension.radius + 0.22 / viewState.zoom;
    appendDimensionText(
      group,
      dimension.centerX + direction.x * labelDistance,
      dimension.centerY + direction.y * labelDistance,
      dimension.dimensionType === "diameter"
        ? `⌀${formatCoordinate(dimension.radius * 2)}`
        : `R${formatCoordinate(dimension.radius)}`,
    );
    hitPath =
      `M ${negativeEnd.x} ${negativeEnd.y} ` +
      `L ${positiveEnd.x} ${positiveEnd.y}`;
    titleText =
      `${dimension.dimensionType === "diameter" ? "Diameter" : "Radius"} ` +
      `dimension ${dimension.id}: ${formatCoordinate(
        dimension.dimensionType === "diameter"
          ? dimension.radius * 2
          : dimension.radius,
      )}`;
  } else if (dimension.dimensionType === "angle") {
    const startPoint = {
      x: dimension.centerX + Math.cos(dimension.startAngle) * dimension.radius,
      y: dimension.centerY + Math.sin(dimension.startAngle) * dimension.radius,
    };
    const endPoint = {
      x: dimension.centerX + Math.cos(dimension.endAngle) * dimension.radius,
      y: dimension.centerY + Math.sin(dimension.endAngle) * dimension.radius,
    };
    hitPath =
      `M ${startPoint.x} ${startPoint.y} ` +
      `A ${dimension.radius} ${dimension.radius} 0 0 1 ${endPoint.x} ${endPoint.y}`;
    group.appendChild(
      createSvgElement("path", {
        d: hitPath,
        class: "dimension-geometry",
      }),
    );
    drawLine(
      group,
      dimension.centerX,
      dimension.centerY,
      startPoint.x,
      startPoint.y,
      "dimension-geometry",
    );
    drawLine(
      group,
      dimension.centerX,
      dimension.centerY,
      endPoint.x,
      endPoint.y,
      "dimension-geometry",
    );
    appendDimensionArrow(group, startPoint, {
      x: -Math.sin(dimension.startAngle),
      y: Math.cos(dimension.startAngle),
    });
    appendDimensionArrow(group, endPoint, {
      x: Math.sin(dimension.endAngle),
      y: -Math.cos(dimension.endAngle),
    });
    const middleAngle =
      dimension.startAngle +
      getCounterClockwiseSweep(dimension.startAngle, dimension.endAngle) / 2;
    const labelRadius = dimension.radius + 0.18 / viewState.zoom;
    appendDimensionText(
      group,
      dimension.centerX + Math.cos(middleAngle) * labelRadius,
      dimension.centerY + Math.sin(middleAngle) * labelRadius,
      `${formatDecimal(dimension.valueDegrees)}°`,
    );
    titleText = `Angle dimension ${dimension.id}: ${formatDecimal(
      dimension.valueDegrees,
    )}°`;
  }

  if (!hitPath) return;
  group.insertBefore(
    createSvgElement("path", {
      d: hitPath,
      class: "dimension-hit-target",
    }),
    group.firstChild,
  );
  const title = createSvgElement("title", {});
  title.textContent = titleText;
  group.appendChild(title);
  entityLayer.appendChild(group);
}

function getCircleRadiusInputValue() {
  const radius = getArithmeticInputValue(circleRadiusInput);
  return Number.isFinite(radius) && radius > 0 ? radius : null;
}

function getHexagonCenterXInputValue() {
  const centerX = getArithmeticInputValue(hexagonCenterXInput);
  return Number.isFinite(centerX) ? centerX : null;
}

function getHexagonCenterYInputValue() {
  const centerY = getArithmeticInputValue(hexagonCenterYInput);
  return Number.isFinite(centerY) ? centerY : null;
}

function getHexagonAcrossFlatsInputValue() {
  const acrossFlats = getArithmeticInputValue(hexagonAcrossFlatsInput);
  return Number.isFinite(acrossFlats) && acrossFlats > 0 ? acrossFlats : null;
}

function getHexagonCornerRadiusInputValue(acrossFlats) {
  const cornerRadius = getArithmeticInputValue(hexagonCornerRadiusInput);
  return Number.isFinite(cornerRadius) &&
    cornerRadius >= 0 &&
    Number.isFinite(acrossFlats) &&
    cornerRadius < acrossFlats / 2
    ? cornerRadius
    : null;
}

function getRectangleCenterXInputValue() {
  const centerX = getArithmeticInputValue(rectangleCenterXInput);
  return Number.isFinite(centerX) ? centerX : null;
}

function getRectangleCenterYInputValue() {
  const centerY = getArithmeticInputValue(rectangleCenterYInput);
  return Number.isFinite(centerY) ? centerY : null;
}

function getRectangleXInputValue() {
  const xSize = getArithmeticInputValue(rectangleXInput);
  return Number.isFinite(xSize) && xSize > 0 ? xSize : null;
}

function getRectangleYInputValue() {
  const ySize = getArithmeticInputValue(rectangleYInput);
  return Number.isFinite(ySize) && ySize > 0 ? ySize : null;
}

function getRectangleRadiusInputValue(xSize, ySize) {
  const radius = getArithmeticInputValue(rectangleRadiusInput);
  if (!Number.isFinite(xSize) || !Number.isFinite(ySize)) return null;
  const maximumRadius = Math.min(xSize, ySize) / 2;
  return Number.isFinite(radius) &&
    radius >= 0 &&
    Number.isFinite(maximumRadius) &&
    radius <= maximumRadius
    ? radius
    : null;
}

function getBoltHoleDiameterInputValue() {
  const diameter = getArithmeticInputValue(boltHoleDiameterInput);
  return Number.isFinite(diameter) && diameter > 0 ? diameter : null;
}

function getBoltHoleCircleCenterXInputValue() {
  const centerX = getArithmeticInputValue(boltHoleCircleCenterXInput);
  return Number.isFinite(centerX) ? centerX : null;
}

function getBoltHoleCircleCenterYInputValue() {
  const centerY = getArithmeticInputValue(boltHoleCircleCenterYInput);
  return Number.isFinite(centerY) ? centerY : null;
}

function getBoltHoleCountInputValue() {
  const holeCount = getArithmeticInputValue(boltHoleCountInput);
  return Number.isSafeInteger(holeCount) &&
    holeCount > 0 &&
    holeCount <= MAX_BOLT_HOLE_COUNT
    ? holeCount
    : null;
}

function getBoltHoleFeatureDiameterInputValue() {
  const diameter = getArithmeticInputValue(boltHoleFeatureDiameterInput);
  return Number.isFinite(diameter) && diameter >= 0 ? diameter : null;
}

function getCenterFromToolState(state, getCenterX, getCenterY) {
  if (state.centerMode === "point") {
    return getPointById(state.centerPointId) ?? null;
  }
  if (state.centerMode !== "defined") return null;
  const x = getCenterX();
  const y = getCenterY();
  return x === null || y === null ? null : { x, y };
}

function hasSelectableCenterPoint() {
  return documentModel.entities.some(
    (entity) =>
      entity.type === "point" &&
      !entity.isConstruction &&
      isEntityOnCurrentLayer(entity) &&
      isEntityLayerVisible(entity),
  );
}

function getRectangleGeometry(center, xSize, ySize, radius) {
  const left = center.x - xSize / 2;
  const right = center.x + xSize / 2;
  const bottom = center.y - ySize / 2;
  const top = center.y + ySize / 2;

  if (radius <= GEOMETRY_EPSILON) {
    const bottomLeft = { x: left, y: bottom };
    const bottomRight = { x: right, y: bottom };
    const topRight = { x: right, y: top };
    const topLeft = { x: left, y: top };
    return {
      lines: [
        { start: bottomLeft, end: bottomRight },
        { start: bottomRight, end: topRight },
        { start: topRight, end: topLeft },
        { start: topLeft, end: bottomLeft },
      ],
      arcs: [],
    };
  }

  const lines = [
    {
      start: { x: left + radius, y: bottom },
      end: { x: right - radius, y: bottom },
    },
    {
      start: { x: right, y: bottom + radius },
      end: { x: right, y: top - radius },
    },
    {
      start: { x: right - radius, y: top },
      end: { x: left + radius, y: top },
    },
    {
      start: { x: left, y: top - radius },
      end: { x: left, y: bottom + radius },
    },
  ].filter(
    ({ start, end }) =>
      Math.hypot(end.x - start.x, end.y - start.y) > GEOMETRY_EPSILON,
  );

  const arcs = [
    {
      center: { x: right - radius, y: bottom + radius },
      start: { x: right - radius, y: bottom },
      end: { x: right, y: bottom + radius },
    },
    {
      center: { x: right - radius, y: top - radius },
      start: { x: right, y: top - radius },
      end: { x: right - radius, y: top },
    },
    {
      center: { x: left + radius, y: top - radius },
      start: { x: left + radius, y: top },
      end: { x: left, y: top - radius },
    },
    {
      center: { x: left + radius, y: bottom + radius },
      start: { x: left, y: bottom + radius },
      end: { x: left + radius, y: bottom },
    },
  ];

  return { lines, arcs };
}

function getHexagonGeometry(centerPoint, acrossFlats, cornerRadius) {
  const circumradius = acrossFlats / Math.sqrt(3);
  const vertices = Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 6 + (index * Math.PI) / 3;
    return {
      x: centerPoint.x + circumradius * Math.cos(angle),
      y: centerPoint.y + circumradius * Math.sin(angle),
    };
  });

  if (cornerRadius <= GEOMETRY_EPSILON) {
    return { vertices, corners: null };
  }

  const tangentDistance = cornerRadius / Math.sqrt(3);
  const centerDistance = (2 * cornerRadius) / Math.sqrt(3);
  const corners = vertices.map((vertex, index) => {
    const previous = vertices[(index + 5) % 6];
    const next = vertices[(index + 1) % 6];
    const previousDirection = {
      x: (previous.x - vertex.x) / circumradius,
      y: (previous.y - vertex.y) / circumradius,
    };
    const nextDirection = {
      x: (next.x - vertex.x) / circumradius,
      y: (next.y - vertex.y) / circumradius,
    };
    const inwardDirection = {
      x: (centerPoint.x - vertex.x) / circumradius,
      y: (centerPoint.y - vertex.y) / circumradius,
    };
    return {
      previousTangent: {
        x: vertex.x + previousDirection.x * tangentDistance,
        y: vertex.y + previousDirection.y * tangentDistance,
      },
      nextTangent: {
        x: vertex.x + nextDirection.x * tangentDistance,
        y: vertex.y + nextDirection.y * tangentDistance,
      },
      arcCenter: {
        x: vertex.x + inwardDirection.x * centerDistance,
        y: vertex.y + inwardDirection.y * centerDistance,
      },
    };
  });
  return { vertices, corners };
}

function getHexagonPreviewPath(centerPoint, acrossFlats, cornerRadius) {
  const geometry = getHexagonGeometry(centerPoint, acrossFlats, cornerRadius);
  if (!geometry.corners) {
    return [
      `M ${geometry.vertices[0].x} ${geometry.vertices[0].y}`,
      ...geometry.vertices
        .slice(1)
        .map((vertex) => `L ${vertex.x} ${vertex.y}`),
      "Z",
    ].join(" ");
  }

  const commands = [
    `M ${geometry.corners[0].previousTangent.x} ${geometry.corners[0].previousTangent.y}`,
  ];
  geometry.corners.forEach((corner, index) => {
    const nextCorner = geometry.corners[(index + 1) % 6];
    commands.push(
      `A ${cornerRadius} ${cornerRadius} 0 0 1 ${corner.nextTangent.x} ${corner.nextTangent.y}`,
      `L ${nextCorner.previousTangent.x} ${nextCorner.previousTangent.y}`,
    );
  });
  commands.push("Z");
  return commands.join(" ");
}

function getTextHeightInputValue() {
  const height = getArithmeticInputValue(textHeightInput);
  return Number.isFinite(height) && height > GEOMETRY_EPSILON ? height : null;
}

function getTextContentInputValue() {
  return textContentInput.value.trim() ? textContentInput.value : null;
}

function renderTextPlacementPreview() {
  const position = textPlacementState.previewWorld;
  const height = getTextHeightInputValue();
  const content = getTextContentInputValue();
  if (!position || height === null || content === null) return;
  const previewEntity = {
    x: position.x,
    y: position.y,
    height,
    content,
  };
  const bounds = getTextEntityBounds(previewEntity);
  if (!bounds) return;
  previewLayer.appendChild(
    createSvgElement("rect", {
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.width,
      height: bounds.height,
      class: "text-placement-bounds-preview",
    }),
  );
  previewLayer.appendChild(
    createCadTextElement(previewEntity, "text-placement-preview"),
  );
  const diagonal = 0.15 / viewState.zoom;
  const offset = diagonal / (2 * Math.SQRT2);
  drawLine(
    previewLayer,
    position.x - offset,
    position.y - offset,
    position.x + offset,
    position.y + offset,
    "text-placement-anchor-preview",
  );
  drawLine(
    previewLayer,
    position.x - offset,
    position.y + offset,
    position.x + offset,
    position.y - offset,
    "text-placement-anchor-preview",
  );
}

function renderToolPreview() {
  previewLayer.innerHTML = "";

  if (windowZoomState.active) {
    if (windowZoomState.drag?.worldBounds) {
      const bounds = windowZoomState.drag.worldBounds;
      previewLayer.appendChild(
        createSvgElement("rect", {
          x: bounds.minX,
          y: bounds.minY,
          width: bounds.maxX - bounds.minX,
          height: bounds.maxY - bounds.minY,
          class: "window-zoom-preview",
        }),
      );
    }
    return;
  }

  if (textPlacementState.active) {
    renderTextPlacementPreview();
    return;
  }

  if (
    selectionState.mode === "chain" &&
    chainSelectionState.candidateEntityId !== null &&
    chainSelectionState.exitEndpointIndex !== null
  ) {
    const candidate = getEntityById(chainSelectionState.candidateEntityId);
    const arrow = getChainDirectionArrowData(
      candidate,
      chainSelectionState.exitEndpointIndex,
    );
    if (!arrow) return;
    const arrowGroup = createSvgElement("g", {
      class: "chain-direction-preview",
    });
    const halfShaftLength = 0.24 / viewState.zoom;
    const headLength = 0.13 / viewState.zoom;
    const halfHeadWidth = 0.075 / viewState.zoom;
    const normal = {
      x: -arrow.direction.y,
      y: arrow.direction.x,
    };
    const tail = {
      x: arrow.position.x - arrow.direction.x * halfShaftLength,
      y: arrow.position.y - arrow.direction.y * halfShaftLength,
    };
    const tip = {
      x: arrow.position.x + arrow.direction.x * halfShaftLength,
      y: arrow.position.y + arrow.direction.y * halfShaftLength,
    };
    const headBase = {
      x: tip.x - arrow.direction.x * headLength,
      y: tip.y - arrow.direction.y * headLength,
    };
    drawLine(arrowGroup, tail.x, tail.y, tip.x, tip.y, "chain-direction-arrow");
    drawLine(
      arrowGroup,
      tip.x,
      tip.y,
      headBase.x + normal.x * halfHeadWidth,
      headBase.y + normal.y * halfHeadWidth,
      "chain-direction-arrow",
    );
    drawLine(
      arrowGroup,
      tip.x,
      tip.y,
      headBase.x - normal.x * halfHeadWidth,
      headBase.y - normal.y * halfHeadWidth,
      "chain-direction-arrow",
    );
    previewLayer.appendChild(arrowGroup);
    return;
  }

  if (pointOnEntityState.active && pointOnEntityState.awaitingDirection) {
    pointOnEntityState.directionChoices.forEach((choice, index) => {
      if (choice.pointId !== null) return;
      const group = createSvgElement("g", {
        class: "temporary-direction-point",
        "data-choice-index": index,
      });
      const pointDiagonal = 0.15 / viewState.zoom;
      const diagonalOffset = pointDiagonal / (2 * Math.SQRT2);
      group.appendChild(
        createSvgElement("circle", {
          cx: choice.x,
          cy: choice.y,
          r: 0.14 / viewState.zoom,
          class: "entity-hit-target",
        }),
      );
      drawLine(
        group,
        choice.x - diagonalOffset,
        choice.y - diagonalOffset,
        choice.x + diagonalOffset,
        choice.y + diagonalOffset,
        "point-x",
      );
      drawLine(
        group,
        choice.x - diagonalOffset,
        choice.y + diagonalOffset,
        choice.x + diagonalOffset,
        choice.y - diagonalOffset,
        "point-x",
      );
      previewLayer.appendChild(group);
    });
    return;
  }

  if (lineAngleState.active && lineAngleState.sourceEntityId !== null) {
    const geometry = getLineAngleGeometry();
    if (!geometry) return;
    drawLine(
      previewLayer,
      geometry.start.x,
      geometry.start.y,
      geometry.end.x,
      geometry.end.y,
      "line-angle-preview",
    );
    return;
  }

  if (lineTangentState.active && lineTangentState.sourceEntityId !== null) {
    const geometry = getLineTangentGeometry();
    if (!geometry) return;
    drawLine(
      previewLayer,
      geometry.start.x,
      geometry.start.y,
      geometry.end.x,
      geometry.end.y,
      "line-tangent-preview",
    );
    return;
  }

  if (
    lineSketchState.active &&
    lineSketchState.startPointId !== null &&
    lineSketchState.previewWorld
  ) {
    const startPoint = getPointById(lineSketchState.startPointId);
    if (!startPoint) return;

    drawLine(
      previewLayer,
      startPoint.x,
      startPoint.y,
      lineSketchState.previewWorld.x,
      lineSketchState.previewWorld.y,
      "line-sketch-preview",
    );
    return;
  }

  if (
    joinState.active &&
    joinState.firstPointId !== null &&
    joinState.previewWorld
  ) {
    const startPoint = getPointById(joinState.firstPointId);
    if (!startPoint) return;

    drawLine(
      previewLayer,
      startPoint.x,
      startPoint.y,
      joinState.previewWorld.x,
      joinState.previewWorld.y,
      "join-preview",
    );
    return;
  }

  if (hexagonState.active) {
    const centerPoint = getCenterFromToolState(
      hexagonState,
      getHexagonCenterXInputValue,
      getHexagonCenterYInputValue,
    );
    const acrossFlats = getHexagonAcrossFlatsInputValue();
    const cornerRadius = getHexagonCornerRadiusInputValue(acrossFlats);
    if (!centerPoint || acrossFlats === null || cornerRadius === null) return;
    previewLayer.appendChild(
      createSvgElement("path", {
        d: getHexagonPreviewPath(centerPoint, acrossFlats, cornerRadius),
        class: "hexagon-preview",
      }),
    );
    return;
  }

  if (!circleState.active || circleState.centerPointId === null) return;

  const centerPoint = getPointById(circleState.centerPointId);
  const radius = getCircleRadiusInputValue();
  if (!centerPoint || radius === null) return;

  previewLayer.appendChild(
    createSvgElement("circle", {
      cx: centerPoint.x,
      cy: centerPoint.y,
      r: radius,
      class: "circle-preview",
    }),
  );
}

function shadeHexColor(hexColor, factor) {
  const channels = [1, 3, 5].map((index) =>
    Number.parseInt(hexColor.slice(index, index + 2), 16),
  );
  return `#${channels
    .map((channel) =>
      Math.round(clampViewportValue(channel * factor, 0, 255))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function getTrihedronWorldUnitsPerPixel() {
  const displayView = isometricViewState.displayView;
  const canvasWidth = cadCanvas.clientWidth;
  const canvasHeight = cadCanvas.clientHeight;
  if (!displayView || canvasWidth <= 0 || canvasHeight <= 0) return null;
  const horizontalScale = displayView.viewWidth / canvasWidth;
  const verticalScale = displayView.viewHeight / canvasHeight;
  return Math.sqrt(horizontalScale * verticalScale);
}

function addScaledWorldVectors(...vectors) {
  return vectors.reduce(
    (sum, vector) => ({
      x: sum.x + vector.x,
      y: sum.y + vector.y,
      z: sum.z + vector.z,
    }),
    { x: 0, y: 0, z: 0 },
  );
}

function scaleWorldVector(vector, scale) {
  return {
    x: vector.x * scale,
    y: vector.y * scale,
    z: vector.z * scale,
  };
}

function getTrihedronAxisFaces(axisDefinition, worldUnitsPerPixel) {
  const shaftLength = TRIHEDRON_SHAFT_LENGTH_PX * worldUnitsPerPixel;
  const axisLength = TRIHEDRON_AXIS_LENGTH_PX * worldUnitsPerPixel;
  const shaftRadius = TRIHEDRON_SHAFT_RADIUS_PX * worldUnitsPerPixel;
  const coneRadius = TRIHEDRON_CONE_RADIUS_PX * worldUnitsPerPixel;
  const baseCenter = { x: 0, y: 0, z: 0 };
  const shaftEnd = scaleWorldVector(axisDefinition.direction, shaftLength);
  const tip = scaleWorldVector(axisDefinition.direction, axisLength);
  const shaftBaseRing = [];
  const shaftEndRing = [];
  const coneBaseRing = [];

  for (let index = 0; index < TRIHEDRON_RADIAL_SEGMENTS; index += 1) {
    const angle = (index / TRIHEDRON_RADIAL_SEGMENTS) * Math.PI * 2;
    const radialDirection = addScaledWorldVectors(
      scaleWorldVector(axisDefinition.radialU, Math.cos(angle)),
      scaleWorldVector(axisDefinition.radialV, Math.sin(angle)),
    );
    shaftBaseRing.push(
      addScaledWorldVectors(
        baseCenter,
        scaleWorldVector(radialDirection, shaftRadius),
      ),
    );
    shaftEndRing.push(
      addScaledWorldVectors(
        shaftEnd,
        scaleWorldVector(radialDirection, shaftRadius),
      ),
    );
    coneBaseRing.push(
      addScaledWorldVectors(
        shaftEnd,
        scaleWorldVector(radialDirection, coneRadius),
      ),
    );
  }

  const faces = [
    {
      part: "shaft-cap",
      vertices: [...shaftBaseRing].reverse(),
      shade: 0.72,
    },
    {
      part: "cone-base",
      vertices: [...coneBaseRing].reverse(),
      shade: 0.7,
    },
  ];
  for (let index = 0; index < TRIHEDRON_RADIAL_SEGMENTS; index += 1) {
    const nextIndex = (index + 1) % TRIHEDRON_RADIAL_SEGMENTS;
    const faceShade = 0.68 + 0.32 * ((Math.cos(
      ((index + 0.5) / TRIHEDRON_RADIAL_SEGMENTS) * Math.PI * 2,
    ) + 1) / 2);
    faces.push({
      part: "shaft",
      vertices: [
        shaftBaseRing[index],
        shaftBaseRing[nextIndex],
        shaftEndRing[nextIndex],
        shaftEndRing[index],
      ],
      shade: faceShade,
    });
    faces.push({
      part: "cone",
      vertices: [coneBaseRing[index], coneBaseRing[nextIndex], tip],
      shade: Math.min(1.08, faceShade + 0.08),
    });
  }
  return faces.map((face) => ({
    ...face,
    axis: axisDefinition.axis,
    baseColor: axisDefinition.color,
  }));
}

function renderTrihedron() {
  trihedronLayer.innerHTML = "";
  const shouldRender =
    isometricViewState.active &&
    trihedronState.visible &&
    isometricViewState.displayView;
  trihedronLayer.toggleAttribute("hidden", !shouldRender);
  if (!shouldRender) return;
  const worldUnitsPerPixel = getTrihedronWorldUnitsPerPixel();
  if (!Number.isFinite(worldUnitsPerPixel) || worldUnitsPerPixel <= 0) return;

  const axisDefinitions = [
    {
      axis: "x",
      color: "#e53935",
      direction: { x: 1, y: 0, z: 0 },
      radialU: { x: 0, y: 1, z: 0 },
      radialV: { x: 0, y: 0, z: 1 },
    },
    {
      axis: "y",
      color: "#16a34a",
      direction: { x: 0, y: 1, z: 0 },
      radialU: { x: 1, y: 0, z: 0 },
      radialV: { x: 0, y: 0, z: 1 },
    },
    {
      axis: "z",
      color: "#2563eb",
      direction: { x: 0, y: 0, z: 1 },
      radialU: { x: 1, y: 0, z: 0 },
      radialV: { x: 0, y: 1, z: 0 },
    },
  ];
  const projectedFaces = axisDefinitions
    .flatMap((axisDefinition) =>
      getTrihedronAxisFaces(axisDefinition, worldUnitsPerPixel),
    )
    .map((face) => {
      const projected = face.vertices.map(projectWorldPointToIsometric);
      return {
        ...face,
        projected,
        depth:
          projected.reduce((sum, point) => sum + point.depth, 0) /
          projected.length,
      };
    })
    .sort((first, second) => first.depth - second.depth);

  projectedFaces.forEach((face) => {
    const polygon = createSvgElement("polygon", {
      points: face.projected.map((point) => `${point.x},${point.y}`).join(" "),
      class: `trihedron-face trihedron-${face.axis}`,
      fill: shadeHexColor(face.baseColor, face.shade),
      stroke: shadeHexColor(face.baseColor, 0.55),
      "data-axis": face.axis,
      "data-part": face.part,
      "aria-hidden": "true",
    });
    trihedronLayer.appendChild(polygon);
  });
}

function updateTrihedronMenuState() {
  const available = is3dWorkspace();
  showTrihedronMenu.disabled = !available;
  showTrihedronMenu.classList.toggle(
    "current-menu-option",
    trihedronState.visible,
  );
  showTrihedronMenu.setAttribute("aria-pressed", String(trihedronState.visible));
  showTrihedronMenu.title = available
    ? trihedronState.visible
      ? "Hide the world-axis trihedron"
      : "Show the world-axis trihedron"
    : "Available in the 3D workspace";
}

function toggleTrihedronVisibility() {
  dismissViewMenu();
  if (!is3dWorkspace()) {
    commandStatus.textContent = "Show Trihedron is available in the 3D workspace.";
    return;
  }
  trihedronState.visible = !trihedronState.visible;
  updateTrihedronMenuState();
  renderTrihedron();
  commandStatus.textContent = trihedronState.visible
    ? "View: World-axis trihedron shown at X0 Y0 Z0."
    : "View: World-axis trihedron hidden.";
}

function getSolidDescription(solid) {
  const solidKind = solid.kind ?? solid.primitive ?? "Solid";
  if (solid.definition?.type === "box") {
    const { length, width, height } = solid.definition.dimensions;
    return (
      `${solidKind} ${solid.id}: ` +
      `${formatLengthResult(length)} × ${formatLengthResult(width)} × ` +
      formatLengthResult(height)
    );
  }
  return `${solidKind} ${solid.id}`;
}

function renderModelSolids() {
  modelLayer.innerHTML = "";
  modelLayer.toggleAttribute("hidden", !isometricViewState.active);
  if (!isometricViewState.active) return;

  const faceRecords = [];
  documentModel.model3d.solids.forEach((solid) => {
    if (!isEntityLayerVisible(solid)) return;
    const vertices = getSolidWorldVertices(solid);
    const faces = getSolidFaceRecords(solid);
    if (!vertices.length || !Array.isArray(faces)) return;
    const reversesWinding =
      getMatrix3Determinant(normalizeSolidTransform(solid).matrix) < 0;
    faces.forEach((face) => {
      const faceIndices = reversesWinding
        ? [...face.vertexIndices].reverse()
        : face.vertexIndices;
      if (
        !Array.isArray(faceIndices) ||
        faceIndices.length < 3 ||
        faceIndices.some(
          (vertexIndex) =>
            !Number.isInteger(vertexIndex) || !vertices[vertexIndex],
        )
      ) {
        return;
      }
      const projected = faceIndices.map((vertexIndex) =>
        projectWorldPointToIsometric(vertices[vertexIndex]),
      );
      faceRecords.push({
        solid,
        faceId: face.id,
        faceName: face.name,
        faceIndex: face.faceIndex,
        projected,
        depth:
          projected.reduce((sum, point) => sum + point.depth, 0) /
          projected.length,
      });
    });
  });

  faceRecords
    .sort((first, second) => first.depth - second.depth)
    .forEach(({ solid, faceId, faceName, faceIndex, projected }) => {
      const isSelected = modelSelectionState.selectedSolidIds.has(solid.id);
      const isSelectedFace =
        modelSelectionState.selectedFace?.solidId === solid.id &&
        (modelSelectionState.selectedFace?.faceId === faceId ||
          modelSelectionState.selectedFace?.faceIndex === faceIndex);
      const polygon = createSvgElement("polygon", {
        points: projected.map((point) => `${point.x},${point.y}`).join(" "),
        class: [
          "solid-face",
          isSelected ? "is-selected" : "",
          isSelectedFace ? "is-selected-face" : "",
        ]
          .filter(Boolean)
          .join(" "),
        "data-solid-id": solid.id,
        "data-face-index": faceIndex,
        "data-face-id": faceId,
        "data-layer-id": getEntityLayerId(solid),
      });
      const title = createSvgElement("title", {});
      title.textContent = `${getSolidDescription(solid)}, ${faceName.toLowerCase()} face`;
      polygon.appendChild(title);
      modelLayer.appendChild(polygon);
    });
}

function renderEntities() {
  documentModel.entities.forEach((entity) => {
    if (!Number.isInteger(entity.layerId)) entity.layerId = 0;
  });
  renderLayerMenu();
  syncViewportToDocument();
  clearEntityHoverInfo();
  selectionState.hoveredEntityId = null;
  entityLayer.innerHTML = "";

  documentModel.entities.filter(isEntityLayerVisible).forEach((entity) => {
    if (entity.type === "line") renderLineEntity(entity);
    if (entity.type === "circle") renderCircleEntity(entity);
    if (entity.type === "arc") renderArcEntity(entity);
    if (entity.type === "text") renderTextEntity(entity);
  });

  documentModel.entities.filter(isEntityLayerVisible).forEach((entity) => {
    if (entity.type === "point" && !entity.isConstruction) renderPoint(entity);
  });

  documentModel.entities.filter(isEntityLayerVisible).forEach((entity) => {
    if (entity.type === "dimension") renderDimensionEntity(entity);
  });

  renderModelSolids();
  renderTrihedron();

  renderToolPreview();
  const visibleEntityCount = documentModel.entities.filter(
    (entity) =>
      isEntityLayerVisible(entity) &&
      (entity.type !== "point" || !entity.isConstruction),
  ).length;
  const visibleSolidCount = documentModel.model3d.solids.filter(
    isEntityLayerVisible,
  ).length;
  entityCount.textContent = is3dWorkspace()
    ? `Profiles: ${visibleEntityCount}  Solids: ${visibleSolidCount}`
    : `Entities: ${visibleEntityCount}`;
  updateEditMenuState();
}

function addPoint(x, y) {
  recordDocumentChange(`Create point ${documentModel.nextEntityId}`);
  const point = {
    id: documentModel.nextEntityId,
    type: "point",
    layerId: documentModel.currentLayerId,
    x,
    y,
  };

  documentModel.nextEntityId += 1;
  documentModel.entities.push(point);
  renderEntities();
  return point;
}

function addJoinLine(startPointId, endPointId) {
  const startPoint = getPointById(startPointId);
  const endPoint = getPointById(endPointId);
  if (!startPoint || !endPoint) return null;

  const lineId = documentModel.nextEntityId + 2;
  recordDocumentChange(`Create line ${lineId}`);
  const { line } = createIndependentLineWithoutHistory(startPoint, endPoint);
  renderEntities();
  return line;
}

function findLineAtCoordinates(start, end) {
  return documentModel.entities.find((entity) => {
    if (entity.type !== "line" || !isEntityOnCurrentLayer(entity)) return false;
    const endpoints = getLineEndpointPair(entity);
    if (!endpoints) return false;
    const matchesForward =
      squaredDistance(endpoints.startPoint, start) <= 1e-14 &&
      squaredDistance(endpoints.endPoint, end) <= 1e-14;
    const matchesReverse =
      squaredDistance(endpoints.startPoint, end) <= 1e-14 &&
      squaredDistance(endpoints.endPoint, start) <= 1e-14;
    return matchesForward || matchesReverse;
  });
}

function addCoordinateLine(start, end) {
  const newPointCount =
    (findExistingPointAt(start) ? 0 : 1) + (findExistingPointAt(end) ? 0 : 1);
  const lineId = documentModel.nextEntityId + newPointCount + 2;
  recordDocumentChange(`Create coordinate line ${lineId}`);
  const startPoint = getOrCreatePointWithoutHistory(start);
  const endPoint = getOrCreatePointWithoutHistory(end);
  const { line } = createIndependentLineWithoutHistory(start, end);
  renderEntities();
  return { line, startPoint, endPoint };
}

function addAngleLine(start, end) {
  const newPointCount =
    (findExistingPointAt(start) ? 0 : 1) + (findExistingPointAt(end) ? 0 : 1);
  const lineId = documentModel.nextEntityId + newPointCount + 2;
  recordDocumentChange(`Create angled line ${lineId}`);
  const startPoint = getOrCreatePointWithoutHistory(start);
  const endPoint = getOrCreatePointWithoutHistory(end);
  const { line } = createIndependentLineWithoutHistory(start, end);
  renderEntities();
  return { line, startPoint, endPoint };
}

function addTangentLine(start, end) {
  const newPointCount =
    (findExistingPointAt(start) ? 0 : 1) + (findExistingPointAt(end) ? 0 : 1);
  const lineId = documentModel.nextEntityId + newPointCount + 2;
  recordDocumentChange(`Create tangent line ${lineId}`);
  const startPoint = getOrCreatePointWithoutHistory(start);
  const endPoint = getOrCreatePointWithoutHistory(end);
  const { line } = createIndependentLineWithoutHistory(start, end);
  renderEntities();
  return { line, startPoint, endPoint };
}

function addCircle(centerPointId, radius) {
  recordDocumentChange(`Create circle ${documentModel.nextEntityId}`);
  const circle = {
    id: documentModel.nextEntityId,
    type: "circle",
    layerId: documentModel.currentLayerId,
    centerPointId,
    radius,
  };

  documentModel.nextEntityId += 1;
  documentModel.entities.push(circle);
  renderEntities();
  return circle;
}

function addCoordinateCircle(center, radius) {
  const existingCenterPoint = findExistingPointAt(center);
  const circleId = documentModel.nextEntityId + (existingCenterPoint ? 0 : 1);
  recordDocumentChange(`Create coordinate-center circle ${circleId}`);
  const centerPoint =
    existingCenterPoint ?? getOrCreatePointWithoutHistory(center);
  const circle = {
    id: documentModel.nextEntityId,
    type: "circle",
    layerId: documentModel.currentLayerId,
    centerPointId: centerPoint.id,
    radius,
  };
  documentModel.nextEntityId += 1;
  documentModel.entities.push(circle);
  renderEntities();
  return { circle, centerPoint };
}

function addApolloniusCircle(center, radius) {
  const existingCenterPoint = findExistingPointAt(center);
  const circleId = documentModel.nextEntityId + (existingCenterPoint ? 0 : 1);
  recordDocumentChange(`Create 3-entity circle ${circleId}`);
  const centerPoint =
    existingCenterPoint ?? getOrCreatePointWithoutHistory(center);
  const circle = {
    id: documentModel.nextEntityId,
    type: "circle",
    layerId: documentModel.currentLayerId,
    centerPointId: centerPoint.id,
    radius,
  };
  documentModel.nextEntityId += 1;
  documentModel.entities.push(circle);
  renderEntities();
  return { circle, centerPoint };
}

function addHexagon(center, acrossFlats, cornerRadius) {
  const centerLabel = Number.isInteger(center.id)
    ? `point ${center.id}`
    : `X${formatLengthResult(center.x)} Y${formatLengthResult(center.y)}`;
  recordDocumentChange(`Create hexagon at ${centerLabel}`);
  const geometry = getHexagonGeometry(center, acrossFlats, cornerRadius);
  const createdLines = [];
  const createdArcs = [];

  function createLineWithoutHistory(startPointId, endPointId) {
    const line = {
      id: documentModel.nextEntityId,
      type: "line",
      layerId: documentModel.currentLayerId,
      startPointId,
      endPointId,
    };
    documentModel.nextEntityId += 1;
    documentModel.entities.push(line);
    createdLines.push(line);
  }

  function createArcWithoutHistory(centerPointId, startPointId, endPointId) {
    const arc = {
      id: documentModel.nextEntityId,
      type: "arc",
      layerId: documentModel.currentLayerId,
      centerPointId,
      startPointId,
      endPointId,
      radius: cornerRadius,
    };
    documentModel.nextEntityId += 1;
    documentModel.entities.push(arc);
    createdArcs.push(arc);
  }

  if (!geometry.corners) {
    const vertexPoints = geometry.vertices.map((vertex) =>
      createConstructionPointWithoutHistory(vertex),
    );
    vertexPoints.forEach((point, index) => {
      createLineWithoutHistory(point.id, vertexPoints[(index + 1) % 6].id);
    });
  } else {
    const cornerPoints = geometry.corners.map((corner) => ({
      previousTangent: createConstructionPointWithoutHistory(
        corner.previousTangent,
      ),
      nextTangent: createConstructionPointWithoutHistory(corner.nextTangent),
      arcCenter: createConstructionPointWithoutHistory(corner.arcCenter),
    }));
    cornerPoints.forEach((corner, index) => {
      const nextCorner = cornerPoints[(index + 1) % 6];
      createArcWithoutHistory(
        corner.arcCenter.id,
        corner.previousTangent.id,
        corner.nextTangent.id,
      );
      createLineWithoutHistory(
        corner.nextTangent.id,
        nextCorner.previousTangent.id,
      );
    });
  }

  renderEntities();
  return { lines: createdLines, arcs: createdArcs };
}

function addRectangle(center, xSize, ySize, radius) {
  recordDocumentChange(
    `Create ${formatLengthResult(xSize)} x ${formatLengthResult(ySize)} rectangle at X${formatLengthResult(center.x)} Y${formatLengthResult(center.y)}`,
  );
  const geometry = getRectangleGeometry(center, xSize, ySize, radius);
  const createdLines = geometry.lines.map(
    ({ start, end }) => createIndependentLineWithoutHistory(start, end).line,
  );
  const createdArcs = geometry.arcs.map(({ center, start, end }) => {
    const centerReference = createConstructionPointWithoutHistory(center);
    const startReference = createConstructionPointWithoutHistory(start);
    const endReference = createConstructionPointWithoutHistory(end);
    const arc = {
      id: documentModel.nextEntityId,
      type: "arc",
      layerId: documentModel.currentLayerId,
      centerPointId: centerReference.id,
      startPointId: startReference.id,
      endPointId: endReference.id,
      radius,
    };
    documentModel.nextEntityId += 1;
    documentModel.entities.push(arc);
    return arc;
  });

  renderEntities();
  return { lines: createdLines, arcs: createdArcs };
}

function getBoltHoleCenters(center, boltHoleDiameter, holeCount) {
  const boltHoleRadius = boltHoleDiameter / 2;
  return Array.from({ length: holeCount }, (_, index) => {
    const angle = (index * Math.PI * 2) / holeCount;
    const rawX = boltHoleRadius * Math.cos(angle);
    const rawY = boltHoleRadius * Math.sin(angle);
    return {
      x: center.x + (Math.abs(rawX) <= 1e-12 ? 0 : rawX),
      y: center.y + (Math.abs(rawY) <= 1e-12 ? 0 : rawY),
    };
  });
}

function addBoltHoleCircle(center, boltHoleDiameter, holeCount, holeDiameter) {
  recordDocumentChange(
    `Create ${holeCount}-position bolt hole circle at X${formatLengthResult(center.x)} Y${formatLengthResult(center.y)}`,
  );
  const centers = getBoltHoleCenters(center, boltHoleDiameter, holeCount);
  const createdPoints = [];
  const createdCircles = [];

  centers.forEach((center) => {
    if (holeDiameter === 0) {
      const point = {
        id: documentModel.nextEntityId,
        type: "point",
        layerId: documentModel.currentLayerId,
        x: center.x,
        y: center.y,
      };
      documentModel.nextEntityId += 1;
      documentModel.entities.push(point);
      createdPoints.push(point);
      return;
    }

    const centerReference = createConstructionPointWithoutHistory(center);
    const circle = {
      id: documentModel.nextEntityId,
      type: "circle",
      layerId: documentModel.currentLayerId,
      centerPointId: centerReference.id,
      radius: holeDiameter / 2,
    };
    documentModel.nextEntityId += 1;
    documentModel.entities.push(circle);
    createdCircles.push(circle);
  });

  renderEntities();
  return { points: createdPoints, circles: createdCircles };
}

function getLinearDimensionEntityData(entity) {
  if (!entity) return null;
  if (entity.type === "point") {
    return Number.isFinite(entity.x) && Number.isFinite(entity.y)
      ? { kind: "point", point: entity }
      : null;
  }
  if (entity.type === "line") {
    const endpoints = getLineEndpointPair(entity);
    return endpoints ? { kind: "line", ...endpoints } : null;
  }
  if (entity.type === "circle") {
    const centerPoint = getPointById(entity.centerPointId);
    return centerPoint && Number.isFinite(entity.radius)
      ? { kind: "circle", centerPoint, radius: entity.radius }
      : null;
  }
  if (entity.type === "arc") {
    const centerPoint = getPointById(entity.centerPointId);
    const startPoint = getPointById(entity.startPointId);
    const endPoint = getPointById(entity.endPointId);
    if (
      !centerPoint ||
      !startPoint ||
      !endPoint ||
      !Number.isFinite(entity.radius)
    ) {
      return null;
    }
    return {
      kind: "arc",
      centerPoint,
      startPoint,
      endPoint,
      radius: entity.radius,
      startAngle: Math.atan2(
        startPoint.y - centerPoint.y,
        startPoint.x - centerPoint.x,
      ),
      endAngle: Math.atan2(
        endPoint.y - centerPoint.y,
        endPoint.x - centerPoint.x,
      ),
    };
  }
  return null;
}

function getClosestPointOnLinearDimensionEntity(
  entity,
  targetPoint,
  fallbackPoint = targetPoint,
) {
  const data = getLinearDimensionEntityData(entity);
  if (!data || !targetPoint) return null;
  if (data.kind === "point") {
    return { x: data.point.x, y: data.point.y };
  }
  if (data.kind === "line") {
    const direction = {
      x: data.endPoint.x - data.startPoint.x,
      y: data.endPoint.y - data.startPoint.y,
    };
    const lengthSquared = dotProduct(direction, direction);
    if (lengthSquared <= GEOMETRY_EPSILON ** 2) {
      return { x: data.startPoint.x, y: data.startPoint.y };
    }
    const parameter = Math.max(
      0,
      Math.min(
        1,
        dotProduct(
          {
            x: targetPoint.x - data.startPoint.x,
            y: targetPoint.y - data.startPoint.y,
          },
          direction,
        ) / lengthSquared,
      ),
    );
    return {
      x: data.startPoint.x + direction.x * parameter,
      y: data.startPoint.y + direction.y * parameter,
    };
  }

  let radialDirection = {
    x: targetPoint.x - data.centerPoint.x,
    y: targetPoint.y - data.centerPoint.y,
  };
  let radialLength = Math.hypot(radialDirection.x, radialDirection.y);
  if (radialLength <= GEOMETRY_EPSILON && fallbackPoint) {
    radialDirection = {
      x: fallbackPoint.x - data.centerPoint.x,
      y: fallbackPoint.y - data.centerPoint.y,
    };
    radialLength = Math.hypot(radialDirection.x, radialDirection.y);
  }
  const angle =
    radialLength <= GEOMETRY_EPSILON
      ? 0
      : Math.atan2(radialDirection.y, radialDirection.x);
  if (
    data.kind === "circle" ||
    isAngleOnCounterClockwiseArc(angle, data.startAngle, data.endAngle)
  ) {
    return {
      x: data.centerPoint.x + Math.cos(angle) * data.radius,
      y: data.centerPoint.y + Math.sin(angle) * data.radius,
    };
  }
  const startDistance = squaredDistance(targetPoint, data.startPoint);
  const endDistance = squaredDistance(targetPoint, data.endPoint);
  const endpoint =
    Math.abs(startDistance - endDistance) <= GEOMETRY_EPSILON && fallbackPoint
      ? squaredDistance(fallbackPoint, data.startPoint) <=
        squaredDistance(fallbackPoint, data.endPoint)
        ? data.startPoint
        : data.endPoint
      : startDistance <= endDistance
        ? data.startPoint
        : data.endPoint;
  return { x: endpoint.x, y: endpoint.y };
}

function getLinearDimensionEntityEndpoints(entity) {
  const data = getLinearDimensionEntityData(entity);
  if (!data) return [];
  if (data.kind === "point") return [data.point];
  if (data.kind === "line" || data.kind === "arc") {
    return [data.startPoint, data.endPoint];
  }
  return [];
}

function isPointOnLinearDimensionEntity(entity, point) {
  const closestPoint = getClosestPointOnLinearDimensionEntity(entity, point);
  return closestPoint !== null && squaredDistance(closestPoint, point) <= 1e-14;
}

function getLinearDimensionEntityIntersections(firstEntity, secondEntity) {
  if (firstEntity.type === "point") {
    return isPointOnLinearDimensionEntity(secondEntity, firstEntity)
      ? [{ x: firstEntity.x, y: firstEntity.y }]
      : [];
  }
  if (secondEntity.type === "point") {
    return isPointOnLinearDimensionEntity(firstEntity, secondEntity)
      ? [{ x: secondEntity.x, y: secondEntity.y }]
      : [];
  }
  const result = getEntityIntersections(firstEntity, secondEntity);
  return result.points.filter(
    (point) =>
      isPointOnLinearDimensionEntity(firstEntity, point) &&
      isPointOnLinearDimensionEntity(secondEntity, point),
  );
}

function getLinearDimensionBetweenEntities(
  firstEntity,
  secondEntity,
  firstPick,
  secondPick,
) {
  const firstData = getLinearDimensionEntityData(firstEntity);
  const secondData = getLinearDimensionEntityData(secondEntity);
  if (!firstData || !secondData) return null;

  const candidates = [];
  const addCandidate = (firstPoint, secondPoint) => {
    if (
      !firstPoint ||
      !secondPoint ||
      !Number.isFinite(firstPoint.x) ||
      !Number.isFinite(firstPoint.y) ||
      !Number.isFinite(secondPoint.x) ||
      !Number.isFinite(secondPoint.y)
    ) {
      return;
    }
    candidates.push({
      firstPoint: { x: firstPoint.x, y: firstPoint.y },
      secondPoint: { x: secondPoint.x, y: secondPoint.y },
      distanceSquared: squaredDistance(firstPoint, secondPoint),
      pickScore:
        squaredDistance(firstPoint, firstPick) +
        squaredDistance(secondPoint, secondPick),
    });
  };

  getLinearDimensionEntityIntersections(firstEntity, secondEntity).forEach(
    (point) => addCandidate(point, point),
  );

  getLinearDimensionEntityEndpoints(firstEntity).forEach((firstPoint) => {
    addCandidate(
      firstPoint,
      getClosestPointOnLinearDimensionEntity(
        secondEntity,
        firstPoint,
        secondPick,
      ),
    );
  });
  getLinearDimensionEntityEndpoints(secondEntity).forEach((secondPoint) => {
    addCandidate(
      getClosestPointOnLinearDimensionEntity(
        firstEntity,
        secondPoint,
        firstPick,
      ),
      secondPoint,
    );
  });

  const firstPickedPoint = getClosestPointOnLinearDimensionEntity(
    firstEntity,
    firstPick,
    secondPick,
  );
  const secondFromFirst = getClosestPointOnLinearDimensionEntity(
    secondEntity,
    firstPickedPoint,
    secondPick,
  );
  addCandidate(
    getClosestPointOnLinearDimensionEntity(
      firstEntity,
      secondFromFirst,
      firstPick,
    ),
    secondFromFirst,
  );

  const secondPickedPoint = getClosestPointOnLinearDimensionEntity(
    secondEntity,
    secondPick,
    firstPick,
  );
  const firstFromSecond = getClosestPointOnLinearDimensionEntity(
    firstEntity,
    secondPickedPoint,
    firstPick,
  );
  addCandidate(
    firstFromSecond,
    getClosestPointOnLinearDimensionEntity(
      secondEntity,
      firstFromSecond,
      secondPick,
    ),
  );

  const firstIsRadial = firstData.kind === "circle" || firstData.kind === "arc";
  const secondIsRadial =
    secondData.kind === "circle" || secondData.kind === "arc";
  if (firstData.kind === "line" && secondIsRadial) {
    const linePoint = getClosestPointOnLinearDimensionEntity(
      firstEntity,
      secondData.centerPoint,
      firstPick,
    );
    addCandidate(
      linePoint,
      getClosestPointOnLinearDimensionEntity(
        secondEntity,
        linePoint,
        secondPick,
      ),
    );
  }
  if (secondData.kind === "line" && firstIsRadial) {
    const linePoint = getClosestPointOnLinearDimensionEntity(
      secondEntity,
      firstData.centerPoint,
      secondPick,
    );
    addCandidate(
      getClosestPointOnLinearDimensionEntity(firstEntity, linePoint, firstPick),
      linePoint,
    );
  }
  if (firstIsRadial && secondIsRadial) {
    const firstPoint = getClosestPointOnLinearDimensionEntity(
      firstEntity,
      secondData.centerPoint,
      firstPick,
    );
    const secondPoint = getClosestPointOnLinearDimensionEntity(
      secondEntity,
      firstPoint,
      secondPick,
    );
    addCandidate(
      getClosestPointOnLinearDimensionEntity(
        firstEntity,
        secondPoint,
        firstPick,
      ),
      secondPoint,
    );

    const reverseSecondPoint = getClosestPointOnLinearDimensionEntity(
      secondEntity,
      firstData.centerPoint,
      secondPick,
    );
    const reverseFirstPoint = getClosestPointOnLinearDimensionEntity(
      firstEntity,
      reverseSecondPoint,
      firstPick,
    );
    addCandidate(
      reverseFirstPoint,
      getClosestPointOnLinearDimensionEntity(
        secondEntity,
        reverseFirstPoint,
        secondPick,
      ),
    );
  }

  if (!candidates.length) return null;
  candidates.sort((first, second) => {
    const distanceDifference = first.distanceSquared - second.distanceSquared;
    if (Math.abs(distanceDifference) > GEOMETRY_EPSILON ** 2) {
      return distanceDifference;
    }
    return first.pickScore - second.pickScore;
  });
  return candidates[0];
}

function addLinearDimension(startPoint, endPoint) {
  const deltaX = endPoint.x - startPoint.x;
  const deltaY = endPoint.y - startPoint.y;
  const length = Math.hypot(deltaX, deltaY);
  if (length <= GEOMETRY_EPSILON) return null;

  const normal = { x: -deltaY / length, y: deltaX / length };
  const midpoint = {
    x: (startPoint.x + endPoint.x) / 2,
    y: (startPoint.y + endPoint.y) / 2,
  };
  const outwardSign = dotProduct(midpoint, normal) < 0 ? -1 : 1;
  const offset = Math.max(0.25, Math.min(0.75, length * 0.15));
  const offsetX = normal.x * offset * outwardSign;
  const offsetY = normal.y * offset * outwardSign;
  const dimension = {
    id: documentModel.nextEntityId,
    type: "dimension",
    layerId: documentModel.currentLayerId,
    dimensionType: "linear",
    startX: startPoint.x,
    startY: startPoint.y,
    endX: endPoint.x,
    endY: endPoint.y,
    dimensionStartX: startPoint.x + offsetX,
    dimensionStartY: startPoint.y + offsetY,
    dimensionEndX: endPoint.x + offsetX,
    dimensionEndY: endPoint.y + offsetY,
    value: length,
  };
  recordDocumentChange(`Create linear dimension ${dimension.id}`);
  documentModel.nextEntityId += 1;
  documentModel.entities.push(dimension);
  renderEntities();
  return dimension;
}

function addRadialDimension(sourceEntity, dimensionType, angle) {
  const centerPoint = getPointById(sourceEntity.centerPointId);
  if (!centerPoint || !Number.isFinite(sourceEntity.radius)) return null;
  const dimension = {
    id: documentModel.nextEntityId,
    type: "dimension",
    layerId: documentModel.currentLayerId,
    dimensionType,
    centerX: centerPoint.x,
    centerY: centerPoint.y,
    radius: sourceEntity.radius,
    angle: normalizeAngle(angle),
  };
  recordDocumentChange(`Create ${dimensionType} dimension ${dimension.id}`);
  documentModel.nextEntityId += 1;
  documentModel.entities.push(dimension);
  renderEntities();
  return dimension;
}

function getDimensionRayDirection(line, center, pickPoint) {
  const endpoints = getLineEndpointPair(line);
  if (!endpoints) return null;
  const lineDirection = {
    x: endpoints.endPoint.x - endpoints.startPoint.x,
    y: endpoints.endPoint.y - endpoints.startPoint.y,
  };
  const lineLength = Math.hypot(lineDirection.x, lineDirection.y);
  if (lineLength <= GEOMETRY_EPSILON) return null;
  const unit = {
    x: lineDirection.x / lineLength,
    y: lineDirection.y / lineLength,
  };
  const pickDirection = {
    x: pickPoint.x - center.x,
    y: pickPoint.y - center.y,
  };
  let sign = dotProduct(unit, pickDirection) < 0 ? -1 : 1;
  if (Math.hypot(pickDirection.x, pickDirection.y) <= GEOMETRY_EPSILON) {
    sign =
      squaredDistance(pickPoint, endpoints.startPoint) <=
      squaredDistance(pickPoint, endpoints.endPoint)
        ? -1
        : 1;
  }
  return { x: unit.x * sign, y: unit.y * sign };
}

function addAngleDimension(firstLine, secondLine, firstPick, secondPick) {
  const firstEndpoints = getLineEndpointPair(firstLine);
  const secondEndpoints = getLineEndpointPair(secondLine);
  if (!firstEndpoints || !secondEndpoints) {
    return { dimension: null, reason: "degenerate" };
  }
  const firstDirection = {
    x: firstEndpoints.endPoint.x - firstEndpoints.startPoint.x,
    y: firstEndpoints.endPoint.y - firstEndpoints.startPoint.y,
  };
  const intersection = intersectInfiniteLines(
    firstEndpoints.startPoint,
    firstDirection,
    secondEndpoints.startPoint,
    secondEndpoints.endPoint,
  );
  if (!intersection.point) {
    return { dimension: null, reason: intersection.kind };
  }

  const firstRay = getDimensionRayDirection(
    firstLine,
    intersection.point,
    firstPick,
  );
  const secondRay = getDimensionRayDirection(
    secondLine,
    intersection.point,
    secondPick,
  );
  if (!firstRay || !secondRay) {
    return { dimension: null, reason: "degenerate" };
  }

  let startAngle = Math.atan2(firstRay.y, firstRay.x);
  let endAngle = Math.atan2(secondRay.y, secondRay.x);
  let sweep = getCounterClockwiseSweep(startAngle, endAngle);
  if (sweep > Math.PI) {
    [startAngle, endAngle] = [endAngle, startAngle];
    sweep = getCounterClockwiseSweep(startAngle, endAngle);
  }
  if (sweep <= GEOMETRY_EPSILON) {
    return { dimension: null, reason: "collinear" };
  }

  const firstPickRadius = Math.sqrt(
    squaredDistance(firstPick, intersection.point),
  );
  const secondPickRadius = Math.sqrt(
    squaredDistance(secondPick, intersection.point),
  );
  const radius = Math.max(
    0.3,
    Math.min(1.25, Math.min(firstPickRadius, secondPickRadius) * 0.55),
  );
  const dimension = {
    id: documentModel.nextEntityId,
    type: "dimension",
    layerId: documentModel.currentLayerId,
    dimensionType: "angle",
    centerX: intersection.point.x,
    centerY: intersection.point.y,
    radius,
    startAngle: normalizeAngle(startAngle),
    endAngle: normalizeAngle(endAngle),
    valueDegrees: (sweep * 180) / Math.PI,
  };
  recordDocumentChange(`Create angle dimension ${dimension.id}`);
  documentModel.nextEntityId += 1;
  documentModel.entities.push(dimension);
  renderEntities();
  return { dimension, reason: null };
}

function addOffsetLine(start, end) {
  const startPointId = documentModel.nextEntityId;
  const endPointId = startPointId + 1;
  const lineId = startPointId + 4;
  recordDocumentChange(`Offset line ${lineId}`);

  const startPoint = {
    id: startPointId,
    type: "point",
    layerId: documentModel.currentLayerId,
    x: start.x,
    y: start.y,
  };
  const endPoint = {
    id: endPointId,
    type: "point",
    layerId: documentModel.currentLayerId,
    x: end.x,
    y: end.y,
  };
  documentModel.nextEntityId += 2;
  documentModel.entities.push(startPoint, endPoint);
  const { line } = createIndependentLineWithoutHistory(start, end);
  renderEntities();
  return { line, startPoint, endPoint };
}

function addOffsetCircle(centerPointId, radius) {
  recordDocumentChange(`Offset circle ${documentModel.nextEntityId}`);
  const circle = {
    id: documentModel.nextEntityId,
    type: "circle",
    layerId: documentModel.currentLayerId,
    centerPointId,
    radius,
  };

  documentModel.nextEntityId += 1;
  documentModel.entities.push(circle);
  renderEntities();
  return circle;
}

function getEntityById(entityId) {
  return documentModel.entities.find((entity) => entity.id === entityId);
}

function crossProduct(a, b) {
  return a.x * b.y - a.y * b.x;
}

function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y;
}

function squaredDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

const APOLLONIUS_TOLERANCE = 1e-7;

function dotProduct3(first, second) {
  return first[0] * second[0] + first[1] * second[1] + first[2] * second[2];
}

function crossProduct3(first, second) {
  return [
    first[1] * second[2] - first[2] * second[1],
    first[2] * second[0] - first[0] * second[2],
    first[0] * second[1] - first[1] * second[0],
  ];
}

function getApolloniusConstraint(entity) {
  if (entity.type === "point") {
    return {
      kind: "circle",
      isPoint: true,
      x: entity.x,
      y: entity.y,
      radius: 0,
    };
  }

  if (entity.type === "circle") {
    const centerPoint = getPointById(entity.centerPointId);
    if (!centerPoint || !Number.isFinite(entity.radius) || entity.radius <= 0) {
      return null;
    }
    return {
      kind: "circle",
      isPoint: false,
      x: centerPoint.x,
      y: centerPoint.y,
      radius: entity.radius,
    };
  }

  if (entity.type === "line") {
    const endpoints = getLineEndpointPair(entity);
    if (!endpoints) return null;
    const dx = endpoints.endPoint.x - endpoints.startPoint.x;
    const dy = endpoints.endPoint.y - endpoints.startPoint.y;
    const length = Math.hypot(dx, dy);
    if (length <= GEOMETRY_EPSILON) return null;
    return {
      kind: "line",
      a: -dy / length,
      b: dx / length,
      c: (dy * endpoints.startPoint.x - dx * endpoints.startPoint.y) / length,
    };
  }

  return null;
}

function getApolloniusSignBranches(constraints) {
  return constraints.reduce(
    (branches, constraint) => {
      const signs =
        constraint.kind === "circle" && constraint.isPoint ? [1] : [-1, 1];
      return branches.flatMap((branch) =>
        signs.map((sign) => [...branch, sign]),
      );
    },
    [[]],
  );
}

function solveLinearSystem3(matrix, values) {
  const augmented = matrix.map((row, index) => [...row, values[index]]);
  const matrixScale = Math.max(
    1,
    ...matrix.flat().map((value) => Math.abs(value)),
  );

  for (let column = 0; column < 3; column += 1) {
    let pivotRow = column;
    for (let row = column + 1; row < 3; row += 1) {
      if (
        Math.abs(augmented[row][column]) > Math.abs(augmented[pivotRow][column])
      ) {
        pivotRow = row;
      }
    }
    if (Math.abs(augmented[pivotRow][column]) <= 1e-12 * matrixScale) {
      return null;
    }
    [augmented[column], augmented[pivotRow]] = [
      augmented[pivotRow],
      augmented[column],
    ];

    const pivot = augmented[column][column];
    for (let index = column; index < 4; index += 1) {
      augmented[column][index] /= pivot;
    }
    for (let row = 0; row < 3; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let index = column; index < 4; index += 1) {
        augmented[row][index] -= factor * augmented[column][index];
      }
    }
  }

  return augmented.map((row) => row[3]);
}

function intersectApolloniusPlanes(firstEquation, secondEquation) {
  const direction = crossProduct3(firstEquation.row, secondEquation.row);
  const directionLengthSquared = dotProduct3(direction, direction);
  const normalScale = Math.max(
    1,
    dotProduct3(firstEquation.row, firstEquation.row) *
      dotProduct3(secondEquation.row, secondEquation.row),
  );
  if (directionLengthSquared <= 1e-20 * normalScale) return null;

  const secondCrossDirection = crossProduct3(secondEquation.row, direction);
  const directionCrossFirst = crossProduct3(direction, firstEquation.row);
  const origin = [0, 1, 2].map(
    (index) =>
      (firstEquation.value * secondCrossDirection[index] +
        secondEquation.value * directionCrossFirst[index]) /
      directionLengthSquared,
  );
  return { origin, direction };
}

function solveQuadraticReal(coefficientA, coefficientB, coefficientC) {
  const coefficientScale = Math.max(
    1,
    Math.abs(coefficientA),
    Math.abs(coefficientB),
    Math.abs(coefficientC),
  );
  if (Math.abs(coefficientA) <= 1e-12 * coefficientScale) {
    if (Math.abs(coefficientB) <= 1e-12 * coefficientScale) return [];
    return [-coefficientC / coefficientB];
  }

  let discriminant =
    coefficientB * coefficientB - 4 * coefficientA * coefficientC;
  const discriminantTolerance =
    1e-12 *
    Math.max(
      1,
      coefficientB * coefficientB,
      Math.abs(4 * coefficientA * coefficientC),
    );
  if (discriminant < -discriminantTolerance) return [];
  if (discriminant < 0) discriminant = 0;
  const squareRoot = Math.sqrt(discriminant);
  if (squareRoot <= 1e-12 * coefficientScale) {
    return [-coefficientB / (2 * coefficientA)];
  }

  const stableTerm =
    -0.5 * (coefficientB + Math.sign(coefficientB || 1) * squareRoot);
  return [stableTerm / coefficientA, coefficientC / stableTerm];
}

function getApolloniusLinearEquation(constraint, sign) {
  return {
    row: [constraint.a, constraint.b, -sign],
    value: -constraint.c,
  };
}

function subtractApolloniusCircleEquations(
  constraint,
  sign,
  baseConstraint,
  baseSign,
) {
  const constraintConstant =
    constraint.x * constraint.x +
    constraint.y * constraint.y -
    constraint.radius * constraint.radius;
  const baseConstant =
    baseConstraint.x * baseConstraint.x +
    baseConstraint.y * baseConstraint.y -
    baseConstraint.radius * baseConstraint.radius;
  return {
    row: [
      2 * (baseConstraint.x - constraint.x),
      2 * (baseConstraint.y - constraint.y),
      2 * (baseSign * baseConstraint.radius - sign * constraint.radius),
    ],
    value: baseConstant - constraintConstant,
  };
}

function isApolloniusBranchSolutionValid(solution, constraints, signs) {
  const [x, y, radius] = solution;
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(radius) ||
    radius <= GEOMETRY_EPSILON
  ) {
    return false;
  }

  return constraints.every((constraint, index) => {
    const scale = Math.max(
      1,
      Math.abs(x),
      Math.abs(y),
      radius,
      constraint.radius ?? 0,
    );
    const tolerance = APOLLONIUS_TOLERANCE * scale;
    if (constraint.kind === "line") {
      const signedDistance = constraint.a * x + constraint.b * y + constraint.c;
      return Math.abs(signedDistance - signs[index] * radius) <= tolerance;
    }

    const centerDistance = Math.hypot(x - constraint.x, y - constraint.y);
    const expectedDistance = Math.abs(
      radius + signs[index] * constraint.radius,
    );
    if (
      !constraint.isPoint &&
      centerDistance <= tolerance &&
      Math.abs(radius - constraint.radius) <= tolerance
    ) {
      return false;
    }
    return Math.abs(centerDistance - expectedDistance) <= tolerance;
  });
}

function addUniqueApolloniusCandidate(candidates, solution) {
  const candidate = {
    center: [solution[0], solution[1]],
    radius: solution[2],
  };
  const scale = Math.max(
    1,
    Math.abs(candidate.center[0]),
    Math.abs(candidate.center[1]),
    candidate.radius,
  );
  const duplicate = candidates.some(
    (existing) =>
      Math.hypot(
        candidate.center[0] - existing.center[0],
        candidate.center[1] - existing.center[1],
      ) <=
        APOLLONIUS_TOLERANCE * scale &&
      Math.abs(candidate.radius - existing.radius) <=
        APOLLONIUS_TOLERANCE * scale,
  );
  if (!duplicate) candidates.push(candidate);
}

function solveApolloniusThreeEntities(entities) {
  if (!Array.isArray(entities) || entities.length !== 3) return [];
  const constraints = entities.map(getApolloniusConstraint);
  if (constraints.some((constraint) => constraint === null)) return [];

  const candidates = [];
  getApolloniusSignBranches(constraints).forEach((signs) => {
    const baseIndex = constraints.findIndex(
      (constraint) => constraint.kind === "circle",
    );

    if (baseIndex === -1) {
      const equations = constraints.map((constraint, index) =>
        getApolloniusLinearEquation(constraint, signs[index]),
      );
      const solution = solveLinearSystem3(
        equations.map((equation) => equation.row),
        equations.map((equation) => equation.value),
      );
      if (
        solution &&
        isApolloniusBranchSolutionValid(solution, constraints, signs)
      ) {
        addUniqueApolloniusCandidate(candidates, solution);
      }
      return;
    }

    const baseConstraint = constraints[baseIndex];
    const baseSign = signs[baseIndex];
    const linearEquations = constraints
      .map((constraint, index) => {
        if (index === baseIndex) return null;
        return constraint.kind === "line"
          ? getApolloniusLinearEquation(constraint, signs[index])
          : subtractApolloniusCircleEquations(
              constraint,
              signs[index],
              baseConstraint,
              baseSign,
            );
      })
      .filter(Boolean);
    const parameterLine = intersectApolloniusPlanes(
      linearEquations[0],
      linearEquations[1],
    );
    if (!parameterLine) return;

    const [originX, originY, originRadius] = parameterLine.origin;
    const [directionX, directionY, directionRadius] = parameterLine.direction;
    const offsetX = originX - baseConstraint.x;
    const offsetY = originY - baseConstraint.y;
    const signedBaseRadius = originRadius + baseSign * baseConstraint.radius;
    const coefficientA =
      directionX * directionX +
      directionY * directionY -
      directionRadius * directionRadius;
    const coefficientB =
      2 *
      (offsetX * directionX +
        offsetY * directionY -
        signedBaseRadius * directionRadius);
    const coefficientC =
      offsetX * offsetX +
      offsetY * offsetY -
      signedBaseRadius * signedBaseRadius;

    solveQuadraticReal(coefficientA, coefficientB, coefficientC).forEach(
      (parameter) => {
        const solution = [
          originX + directionX * parameter,
          originY + directionY * parameter,
          originRadius + directionRadius * parameter,
        ];
        if (isApolloniusBranchSolutionValid(solution, constraints, signs)) {
          addUniqueApolloniusCandidate(candidates, solution);
        }
      },
    );
  });

  return candidates;
}

function getApolloniusTangencyPoint(candidate, entity) {
  if (
    !candidate ||
    !Array.isArray(candidate.center) ||
    candidate.center.length !== 2
  ) {
    return null;
  }
  const center = { x: candidate.center[0], y: candidate.center[1] };
  const constraint = getApolloniusConstraint(entity);
  if (!constraint) return null;

  if (entity.type === "point") return { x: entity.x, y: entity.y };
  if (entity.type === "line") {
    const signedDistance =
      constraint.a * center.x + constraint.b * center.y + constraint.c;
    return {
      x: center.x - constraint.a * signedDistance,
      y: center.y - constraint.b * signedDistance,
    };
  }

  const deltaX = constraint.x - center.x;
  const deltaY = constraint.y - center.y;
  const centerDistanceSquared = deltaX * deltaX + deltaY * deltaY;
  if (centerDistanceSquared <= GEOMETRY_EPSILON ** 2) return null;
  const interpolation =
    (candidate.radius * candidate.radius -
      constraint.radius * constraint.radius +
      centerDistanceSquared) /
    (2 * centerDistanceSquared);
  return {
    x: center.x + deltaX * interpolation,
    y: center.y + deltaY * interpolation,
  };
}

function selectApolloniusCandidate(candidates, entities, mouseClicks) {
  if (
    !Array.isArray(candidates) ||
    !Array.isArray(entities) ||
    !Array.isArray(mouseClicks) ||
    entities.length !== 3 ||
    mouseClicks.length !== 3
  ) {
    return null;
  }

  const scoredCandidates = candidates
    .map((candidate) => {
      let score = 0;
      for (let index = 0; index < 3; index += 1) {
        const tangentPoint = getApolloniusTangencyPoint(
          candidate,
          entities[index],
        );
        if (!tangentPoint) return null;
        score += squaredDistance(tangentPoint, mouseClicks[index]);
      }
      return { candidate, score };
    })
    .filter(Boolean);
  if (!scoredCandidates.length) return null;

  const lowestScore = Math.min(...scoredCandidates.map(({ score }) => score));
  return scoredCandidates
    .filter(({ score }) => score <= lowestScore + 1e-6)
    .sort(
      (first, second) => first.candidate.radius - second.candidate.radius,
    )[0].candidate;
}

function distanceToLineSegment(worldPoint, startPoint, endPoint) {
  const direction = {
    x: endPoint.x - startPoint.x,
    y: endPoint.y - startPoint.y,
  };
  const lengthSquared = dotProduct(direction, direction);
  if (lengthSquared <= GEOMETRY_EPSILON ** 2) {
    return Math.sqrt(squaredDistance(worldPoint, startPoint));
  }
  const offset = {
    x: worldPoint.x - startPoint.x,
    y: worldPoint.y - startPoint.y,
  };
  const parameter = Math.max(
    0,
    Math.min(1, dotProduct(offset, direction) / lengthSquared),
  );
  const closestPoint = {
    x: startPoint.x + direction.x * parameter,
    y: startPoint.y + direction.y * parameter,
  };
  return Math.sqrt(squaredDistance(worldPoint, closestPoint));
}

function distanceToEntityGeometry(entity, worldPoint) {
  if (entity.type === "point") {
    return Math.sqrt(squaredDistance(entity, worldPoint));
  }

  if (entity.type === "line") {
    const startPoint = getPointById(entity.startPointId);
    const endPoint = getPointById(entity.endPointId);
    return startPoint && endPoint
      ? distanceToLineSegment(worldPoint, startPoint, endPoint)
      : Number.POSITIVE_INFINITY;
  }

  if (entity.type === "circle") {
    const centerPoint = getPointById(entity.centerPointId);
    return centerPoint
      ? Math.abs(
          Math.sqrt(squaredDistance(worldPoint, centerPoint)) - entity.radius,
        )
      : Number.POSITIVE_INFINITY;
  }

  if (entity.type === "arc") {
    const centerPoint = getPointById(entity.centerPointId);
    const startPoint = getPointById(entity.startPointId);
    const endPoint = getPointById(entity.endPointId);
    if (!centerPoint || !startPoint || !endPoint) {
      return Number.POSITIVE_INFINITY;
    }
    const startAngle = Math.atan2(
      startPoint.y - centerPoint.y,
      startPoint.x - centerPoint.x,
    );
    const endAngle = Math.atan2(
      endPoint.y - centerPoint.y,
      endPoint.x - centerPoint.x,
    );
    const pointAngle = Math.atan2(
      worldPoint.y - centerPoint.y,
      worldPoint.x - centerPoint.x,
    );
    if (isAngleOnCounterClockwiseArc(pointAngle, startAngle, endAngle)) {
      return Math.abs(
        Math.sqrt(squaredDistance(worldPoint, centerPoint)) - entity.radius,
      );
    }
    return Math.min(
      Math.sqrt(squaredDistance(worldPoint, startPoint)),
      Math.sqrt(squaredDistance(worldPoint, endPoint)),
    );
  }

  if (entity.type === "text") {
    const bounds = getTextEntityBounds(entity);
    if (!bounds) return Number.POSITIVE_INFINITY;
    const deltaX = Math.max(
      bounds.minX - worldPoint.x,
      0,
      worldPoint.x - bounds.maxX,
    );
    const deltaY = Math.max(
      bounds.minY - worldPoint.y,
      0,
      worldPoint.y - bounds.maxY,
    );
    return Math.hypot(deltaX, deltaY);
  }

  if (entity.type === "dimension") {
    if (entity.dimensionType === "linear") {
      return distanceToLineSegment(
        worldPoint,
        { x: entity.dimensionStartX, y: entity.dimensionStartY },
        { x: entity.dimensionEndX, y: entity.dimensionEndY },
      );
    }
    if (
      entity.dimensionType === "radius" ||
      entity.dimensionType === "diameter"
    ) {
      const direction = {
        x: Math.cos(entity.angle),
        y: Math.sin(entity.angle),
      };
      const positiveEnd = {
        x: entity.centerX + direction.x * entity.radius,
        y: entity.centerY + direction.y * entity.radius,
      };
      const negativeEnd =
        entity.dimensionType === "diameter"
          ? {
              x: entity.centerX - direction.x * entity.radius,
              y: entity.centerY - direction.y * entity.radius,
            }
          : { x: entity.centerX, y: entity.centerY };
      return distanceToLineSegment(worldPoint, negativeEnd, positiveEnd);
    }
    if (entity.dimensionType === "angle") {
      const pointAngle = Math.atan2(
        worldPoint.y - entity.centerY,
        worldPoint.x - entity.centerX,
      );
      const startPoint = {
        x: entity.centerX + Math.cos(entity.startAngle) * entity.radius,
        y: entity.centerY + Math.sin(entity.startAngle) * entity.radius,
      };
      const endPoint = {
        x: entity.centerX + Math.cos(entity.endAngle) * entity.radius,
        y: entity.centerY + Math.sin(entity.endAngle) * entity.radius,
      };
      if (
        isAngleOnCounterClockwiseArc(
          pointAngle,
          entity.startAngle,
          entity.endAngle,
        )
      ) {
        return Math.abs(
          Math.hypot(
            worldPoint.x - entity.centerX,
            worldPoint.y - entity.centerY,
          ) - entity.radius,
        );
      }
      return Math.min(
        Math.sqrt(squaredDistance(worldPoint, startPoint)),
        Math.sqrt(squaredDistance(worldPoint, endPoint)),
      );
    }
  }

  return Number.POSITIVE_INFINITY;
}

function getWorldUnitsPerScreenPixel() {
  const screenMatrix = worldLayer.getScreenCTM();
  if (screenMatrix) {
    const xScale = Math.hypot(screenMatrix.a, screenMatrix.b);
    const yScale = Math.hypot(screenMatrix.c, screenMatrix.d);
    const pixelsPerWorldUnit = Math.max(xScale, yScale);
    if (pixelsPerWorldUnit > GEOMETRY_EPSILON) {
      return 1 / pixelsPerWorldUnit;
    }
  }
  return cadCanvas.clientWidth > 0
    ? (VIEW.xMax - VIEW.xMin) / cadCanvas.clientWidth
    : 0.01;
}

function getSelectionHitCandidates(worldPoint, target) {
  const tolerance = 10 * getWorldUnitsPerScreenPixel();
  const directEntityElement = target?.closest?.(
    ".point-entity, .line-entity, .circle-entity, .arc-entity, .text-entity, .dimension-entity",
  );
  const directEntityId = directEntityElement
    ? Number(directEntityElement.dataset.entityId)
    : null;
  const typePriority = {
    point: 0,
    arc: 1,
    line: 2,
    circle: 3,
    text: 4,
    dimension: 5,
  };

  return documentModel.entities
    .filter(
      (entity) =>
        isCurrentLayerEditable() &&
        isEntityOnCurrentLayer(entity) &&
        isEntityLayerVisible(entity) &&
        (entity.type !== "point" || !entity.isConstruction),
    )
    .map((entity) => ({
      entity,
      distance: distanceToEntityGeometry(entity, worldPoint),
    }))
    .filter(({ distance }) => distance <= tolerance)
    .sort((first, second) => {
      const distanceDifference = first.distance - second.distance;
      if (Math.abs(distanceDifference) > GEOMETRY_EPSILON) {
        return distanceDifference;
      }
      if (first.entity.id === directEntityId) return -1;
      if (second.entity.id === directEntityId) return 1;
      const priorityDifference =
        typePriority[first.entity.type] - typePriority[second.entity.type];
      return priorityDifference || first.entity.id - second.entity.id;
    });
}

function normalizeAngle(angle) {
  const fullTurn = Math.PI * 2;
  return ((angle % fullTurn) + fullTurn) % fullTurn;
}

function getCounterClockwiseSweep(startAngle, endAngle) {
  return normalizeAngle(endAngle - startAngle);
}

function isAngleOnCounterClockwiseArc(angle, startAngle, endAngle) {
  return (
    getCounterClockwiseSweep(startAngle, angle) <=
    getCounterClockwiseSweep(startAngle, endAngle) + 1e-7
  );
}

function findExistingPointAt(worldPoint) {
  return documentModel.entities.find(
    (entity) =>
      entity.type === "point" &&
      !entity.isConstruction &&
      isEntityOnCurrentLayer(entity) &&
      squaredDistance(entity, worldPoint) <= 1e-14,
  );
}

function getOrCreatePointWithoutHistory(worldPoint) {
  const existingPoint = findExistingPointAt(worldPoint);
  if (existingPoint) return existingPoint;

  const point = {
    id: documentModel.nextEntityId,
    type: "point",
    layerId: documentModel.currentLayerId,
    x: worldPoint.x,
    y: worldPoint.y,
  };
  documentModel.nextEntityId += 1;
  documentModel.entities.push(point);
  return point;
}

function createConstructionPointWithoutHistory(worldPoint) {
  const point = {
    id: documentModel.nextEntityId,
    type: "point",
    layerId: documentModel.currentLayerId,
    x: worldPoint.x,
    y: worldPoint.y,
    isConstruction: true,
  };
  documentModel.nextEntityId += 1;
  documentModel.entities.push(point);
  return point;
}

function createIndependentLineWithoutHistory(start, end) {
  const startReference = createConstructionPointWithoutHistory(start);
  const endReference = createConstructionPointWithoutHistory(end);
  const line = {
    id: documentModel.nextEntityId,
    type: "line",
    layerId: documentModel.currentLayerId,
    startPointId: startReference.id,
    endPointId: endReference.id,
  };
  documentModel.nextEntityId += 1;
  documentModel.entities.push(line);
  return { line, startReference, endReference };
}

function pruneUnusedConstructionPoints() {
  const referencedPointIds = new Set();
  documentModel.entities.forEach((entity) => {
    if (entity.type === "line") {
      referencedPointIds.add(entity.startPointId);
      referencedPointIds.add(entity.endPointId);
    }
    if (entity.type === "circle") {
      referencedPointIds.add(entity.centerPointId);
    }
    if (entity.type === "arc") {
      referencedPointIds.add(entity.centerPointId);
      referencedPointIds.add(entity.startPointId);
      referencedPointIds.add(entity.endPointId);
    }
  });
  documentModel.entities = documentModel.entities.filter(
    (entity) =>
      entity.type !== "point" ||
      !entity.isConstruction ||
      !isEntityOnCurrentLayer(entity) ||
      referencedPointIds.has(entity.id),
  );
}

function getLineEndpointPair(line) {
  const startPoint = getPointById(line.startPointId);
  const endPoint = getPointById(line.endPointId);
  return startPoint && endPoint ? { startPoint, endPoint } : null;
}

function getPointOnRayParameter(origin, direction, point) {
  const lengthSquared = dotProduct(direction, direction);
  if (lengthSquared <= GEOMETRY_EPSILON ** 2) return null;
  return (
    dotProduct({ x: point.x - origin.x, y: point.y - origin.y }, direction) /
    lengthSquared
  );
}

function intersectInfiniteLines(origin, direction, targetStart, targetEnd) {
  const targetDirection = {
    x: targetEnd.x - targetStart.x,
    y: targetEnd.y - targetStart.y,
  };
  if (dotProduct(targetDirection, targetDirection) <= GEOMETRY_EPSILON ** 2) {
    return { point: null, parameter: null, kind: "degenerate" };
  }

  const denominator = crossProduct(direction, targetDirection);
  if (Math.abs(denominator) <= GEOMETRY_EPSILON) {
    return { point: null, parameter: null, kind: "parallel" };
  }

  const offset = {
    x: targetStart.x - origin.x,
    y: targetStart.y - origin.y,
  };
  const parameter = crossProduct(offset, targetDirection) / denominator;
  return {
    point: {
      x: origin.x + parameter * direction.x,
      y: origin.y + parameter * direction.y,
    },
    parameter,
    kind: "point",
  };
}

function intersectRayCircle(origin, direction, center, radius) {
  const fromCenter = {
    x: origin.x - center.x,
    y: origin.y - center.y,
  };
  const coefficientA = dotProduct(direction, direction);
  if (coefficientA <= GEOMETRY_EPSILON ** 2) return [];

  const coefficientB = 2 * dotProduct(fromCenter, direction);
  const coefficientC = dotProduct(fromCenter, fromCenter) - radius * radius;
  const discriminant = coefficientB ** 2 - 4 * coefficientA * coefficientC;
  if (discriminant < -GEOMETRY_EPSILON) return [];

  const root = Math.sqrt(Math.max(0, discriminant));
  const parameters = [
    (-coefficientB - root) / (2 * coefficientA),
    (-coefficientB + root) / (2 * coefficientA),
  ];
  return parameters
    .filter(
      (parameter, index) =>
        parameter > GEOMETRY_EPSILON &&
        parameters.findIndex(
          (candidate) => Math.abs(candidate - parameter) <= GEOMETRY_EPSILON,
        ) === index,
    )
    .map((parameter) => ({
      point: {
        x: origin.x + parameter * direction.x,
        y: origin.y + parameter * direction.y,
      },
      parameter,
    }));
}

function intersectInfiniteLineCircle(lineStart, lineEnd, center, radius) {
  const direction = {
    x: lineEnd.x - lineStart.x,
    y: lineEnd.y - lineStart.y,
  };
  const fromCenter = {
    x: lineStart.x - center.x,
    y: lineStart.y - center.y,
  };
  const coefficientA = dotProduct(direction, direction);
  if (coefficientA <= GEOMETRY_EPSILON ** 2) {
    return { points: [], kind: "degenerate" };
  }

  const coefficientB = 2 * dotProduct(fromCenter, direction);
  const coefficientC = dotProduct(fromCenter, fromCenter) - radius * radius;
  const discriminant = coefficientB ** 2 - 4 * coefficientA * coefficientC;
  if (discriminant < -GEOMETRY_EPSILON) {
    return { points: [], kind: "none" };
  }

  const root = Math.sqrt(Math.max(0, discriminant));
  const parameters = [
    (-coefficientB - root) / (2 * coefficientA),
    (-coefficientB + root) / (2 * coefficientA),
  ];
  const points = uniqueIntersectionPoints(
    parameters.map((parameter) => ({
      x: lineStart.x + parameter * direction.x,
      y: lineStart.y + parameter * direction.y,
    })),
  );
  return {
    points,
    kind: points.length ? "point" : "none",
  };
}

function uniqueIntersectionPoints(points) {
  return points.filter(
    (point, index) =>
      points.findIndex(
        (candidate) =>
          squaredDistance(point, candidate) <= GEOMETRY_EPSILON ** 2,
      ) === index,
  );
}

function intersectLineSegments(startA, endA, startB, endB) {
  const directionA = {
    x: endA.x - startA.x,
    y: endA.y - startA.y,
  };
  const directionB = {
    x: endB.x - startB.x,
    y: endB.y - startB.y,
  };
  const offset = {
    x: startB.x - startA.x,
    y: startB.y - startA.y,
  };
  const lengthSquaredA = dotProduct(directionA, directionA);
  const lengthSquaredB = dotProduct(directionB, directionB);
  if (
    lengthSquaredA <= GEOMETRY_EPSILON ** 2 ||
    lengthSquaredB <= GEOMETRY_EPSILON ** 2
  ) {
    return { points: [], kind: "degenerate" };
  }

  const denominator = crossProduct(directionA, directionB);
  const offsetCrossA = crossProduct(offset, directionA);
  if (Math.abs(denominator) <= GEOMETRY_EPSILON) {
    if (Math.abs(offsetCrossA) > GEOMETRY_EPSILON) {
      return { points: [], kind: "none" };
    }

    const parameterStart = dotProduct(offset, directionA) / lengthSquaredA;
    const parameterEnd =
      parameterStart + dotProduct(directionB, directionA) / lengthSquaredA;
    const overlapStart = Math.max(0, Math.min(parameterStart, parameterEnd));
    const overlapEnd = Math.min(1, Math.max(parameterStart, parameterEnd));
    if (overlapEnd < overlapStart - GEOMETRY_EPSILON) {
      return { points: [], kind: "none" };
    }
    if (Math.abs(overlapEnd - overlapStart) <= GEOMETRY_EPSILON) {
      return {
        points: [
          {
            x: startA.x + overlapStart * directionA.x,
            y: startA.y + overlapStart * directionA.y,
          },
        ],
        kind: "point",
      };
    }
    return { points: [], kind: "overlap" };
  }

  const parameterA = crossProduct(offset, directionB) / denominator;
  const parameterB = offsetCrossA / denominator;
  if (
    parameterA < -GEOMETRY_EPSILON ||
    parameterA > 1 + GEOMETRY_EPSILON ||
    parameterB < -GEOMETRY_EPSILON ||
    parameterB > 1 + GEOMETRY_EPSILON
  ) {
    return { points: [], kind: "none" };
  }

  return {
    points: [
      {
        x: startA.x + parameterA * directionA.x,
        y: startA.y + parameterA * directionA.y,
      },
    ],
    kind: "point",
  };
}

function intersectLineCircle(lineStart, lineEnd, center, radius) {
  const direction = {
    x: lineEnd.x - lineStart.x,
    y: lineEnd.y - lineStart.y,
  };
  const fromCenter = {
    x: lineStart.x - center.x,
    y: lineStart.y - center.y,
  };
  const coefficientA = dotProduct(direction, direction);
  if (coefficientA <= GEOMETRY_EPSILON ** 2) {
    return { points: [], kind: "degenerate" };
  }

  const coefficientB = 2 * dotProduct(fromCenter, direction);
  const coefficientC = dotProduct(fromCenter, fromCenter) - radius * radius;
  const discriminant = coefficientB ** 2 - 4 * coefficientA * coefficientC;
  if (discriminant < -GEOMETRY_EPSILON) {
    return { points: [], kind: "none" };
  }

  const root = Math.sqrt(Math.max(0, discriminant));
  const parameters = [
    (-coefficientB - root) / (2 * coefficientA),
    (-coefficientB + root) / (2 * coefficientA),
  ];
  const points = parameters
    .filter(
      (parameter) =>
        parameter >= -GEOMETRY_EPSILON && parameter <= 1 + GEOMETRY_EPSILON,
    )
    .map((parameter) => ({
      x: lineStart.x + parameter * direction.x,
      y: lineStart.y + parameter * direction.y,
    }));

  const uniquePoints = uniqueIntersectionPoints(points);
  return {
    points: uniquePoints,
    kind: uniquePoints.length ? "point" : "none",
  };
}

function intersectCircles(centerA, radiusA, centerB, radiusB) {
  const delta = {
    x: centerB.x - centerA.x,
    y: centerB.y - centerA.y,
  };
  const centerDistance = Math.hypot(delta.x, delta.y);
  if (centerDistance <= GEOMETRY_EPSILON) {
    return {
      points: [],
      kind:
        Math.abs(radiusA - radiusB) <= GEOMETRY_EPSILON ? "overlap" : "none",
    };
  }
  if (
    centerDistance > radiusA + radiusB + GEOMETRY_EPSILON ||
    centerDistance < Math.abs(radiusA - radiusB) - GEOMETRY_EPSILON
  ) {
    return { points: [], kind: "none" };
  }

  const along =
    (radiusA ** 2 - radiusB ** 2 + centerDistance ** 2) / (2 * centerDistance);
  const heightSquared = radiusA ** 2 - along ** 2;
  if (heightSquared < -GEOMETRY_EPSILON) {
    return { points: [], kind: "none" };
  }

  const base = {
    x: centerA.x + (along * delta.x) / centerDistance,
    y: centerA.y + (along * delta.y) / centerDistance,
  };
  const height = Math.sqrt(Math.max(0, heightSquared));
  if (height <= GEOMETRY_EPSILON) {
    return { points: [base], kind: "point" };
  }

  const perpendicular = {
    x: (-delta.y * height) / centerDistance,
    y: (delta.x * height) / centerDistance,
  };
  return {
    points: [
      { x: base.x + perpendicular.x, y: base.y + perpendicular.y },
      { x: base.x - perpendicular.x, y: base.y - perpendicular.y },
    ],
    kind: "point",
  };
}

function getFilletRadiusInputValue() {
  const radius = getArithmeticInputValue(filletRadiusInput);
  return Number.isFinite(radius) && radius > 0 ? radius : null;
}

function getFilletCenterLoci(entity, filletRadius) {
  if (entity.type === "line") {
    const endpoints = getLineEndpointPair(entity);
    if (!endpoints) return [];
    const direction = {
      x: endpoints.endPoint.x - endpoints.startPoint.x,
      y: endpoints.endPoint.y - endpoints.startPoint.y,
    };
    const length = Math.hypot(direction.x, direction.y);
    if (length <= GEOMETRY_EPSILON) return [];
    const normal = {
      x: -direction.y / length,
      y: direction.x / length,
    };
    return [-1, 1].map((normalSign) => ({
      kind: "line",
      origin: {
        x: endpoints.startPoint.x + normal.x * filletRadius * normalSign,
        y: endpoints.startPoint.y + normal.y * filletRadius * normalSign,
      },
      direction,
      normal,
      normalSign,
      sourceEntity: entity,
    }));
  }

  if (entity.type === "circle" || entity.type === "arc") {
    const center = getPointById(entity.centerPointId);
    if (!center || !Number.isFinite(entity.radius) || entity.radius <= 0) {
      return [];
    }
    return [1, -1]
      .map((radiusSign) => entity.radius + radiusSign * filletRadius)
      .filter((signedRadius) => Math.abs(signedRadius) > GEOMETRY_EPSILON)
      .map((signedRadius) => ({
        kind: "circle",
        center,
        radius: Math.abs(signedRadius),
        signedRadius,
        sourceEntity: entity,
      }));
  }

  return [];
}

function intersectFilletLoci(firstLocus, secondLocus) {
  if (firstLocus.kind === "line" && secondLocus.kind === "line") {
    const result = intersectInfiniteLines(
      firstLocus.origin,
      firstLocus.direction,
      secondLocus.origin,
      {
        x: secondLocus.origin.x + secondLocus.direction.x,
        y: secondLocus.origin.y + secondLocus.direction.y,
      },
    );
    return result.point ? [result.point] : [];
  }

  if (firstLocus.kind === "line" || secondLocus.kind === "line") {
    const lineLocus = firstLocus.kind === "line" ? firstLocus : secondLocus;
    const circleLocus = firstLocus.kind === "circle" ? firstLocus : secondLocus;
    return intersectInfiniteLineCircle(
      lineLocus.origin,
      {
        x: lineLocus.origin.x + lineLocus.direction.x,
        y: lineLocus.origin.y + lineLocus.direction.y,
      },
      circleLocus.center,
      circleLocus.radius,
    ).points;
  }

  return intersectCircles(
    firstLocus.center,
    firstLocus.radius,
    secondLocus.center,
    secondLocus.radius,
  ).points;
}

function getFilletTangentPoint(locus, filletCenter, filletRadius) {
  if (locus.kind === "line") {
    return {
      x: filletCenter.x - locus.normal.x * filletRadius * locus.normalSign,
      y: filletCenter.y - locus.normal.y * filletRadius * locus.normalSign,
    };
  }

  const delta = {
    x: filletCenter.x - locus.center.x,
    y: filletCenter.y - locus.center.y,
  };
  const distance = Math.hypot(delta.x, delta.y);
  if (distance <= GEOMETRY_EPSILON) return null;
  const radialSign = Math.sign(locus.signedRadius);
  return {
    x:
      locus.center.x +
      (delta.x / distance) * locus.sourceEntity.radius * radialSign,
    y:
      locus.center.y +
      (delta.y / distance) * locus.sourceEntity.radius * radialSign,
  };
}

function getFilletExtensionDistanceSquared(entity, point) {
  if (entity.type === "circle") return 0;

  if (entity.type === "line") {
    const endpoints = getLineEndpointPair(entity);
    if (!endpoints) return Infinity;
    const direction = {
      x: endpoints.endPoint.x - endpoints.startPoint.x,
      y: endpoints.endPoint.y - endpoints.startPoint.y,
    };
    const lengthSquared = dotProduct(direction, direction);
    if (lengthSquared <= GEOMETRY_EPSILON ** 2) return Infinity;
    const parameter =
      dotProduct(
        {
          x: point.x - endpoints.startPoint.x,
          y: point.y - endpoints.startPoint.y,
        },
        direction,
      ) / lengthSquared;
    if (parameter >= -1e-7 && parameter <= 1 + 1e-7) return 0;
    const nearestEndpoint =
      parameter < 0 ? endpoints.startPoint : endpoints.endPoint;
    return squaredDistance(point, nearestEndpoint);
  }

  if (entity.type === "arc") {
    const center = getPointById(entity.centerPointId);
    const startPoint = getPointById(entity.startPointId);
    const endPoint = getPointById(entity.endPointId);
    if (!center || !startPoint || !endPoint) return Infinity;
    const angle = Math.atan2(point.y - center.y, point.x - center.x);
    const startAngle = Math.atan2(
      startPoint.y - center.y,
      startPoint.x - center.x,
    );
    const endAngle = Math.atan2(endPoint.y - center.y, endPoint.x - center.x);
    if (isAngleOnCounterClockwiseArc(angle, startAngle, endAngle)) return 0;
    return Math.min(
      squaredDistance(point, startPoint),
      squaredDistance(point, endPoint),
    );
  }

  return Infinity;
}

function getFilletCandidate(
  firstEntity,
  secondEntity,
  firstPick,
  secondPick,
  filletRadius,
  allowTrimExtend,
) {
  const firstLoci = getFilletCenterLoci(firstEntity, filletRadius);
  const secondLoci = getFilletCenterLoci(secondEntity, filletRadius);
  const candidates = [];

  firstLoci.forEach((firstLocus) => {
    secondLoci.forEach((secondLocus) => {
      intersectFilletLoci(firstLocus, secondLocus).forEach((center) => {
        const firstTangent = getFilletTangentPoint(
          firstLocus,
          center,
          filletRadius,
        );
        const secondTangent = getFilletTangentPoint(
          secondLocus,
          center,
          filletRadius,
        );
        if (!firstTangent || !secondTangent) return;
        if (squaredDistance(firstTangent, secondTangent) <= 1e-14) return;

        const firstExtension = getFilletExtensionDistanceSquared(
          firstEntity,
          firstTangent,
        );
        const secondExtension = getFilletExtensionDistanceSquared(
          secondEntity,
          secondTangent,
        );
        if (
          !allowTrimExtend &&
          (firstExtension > 1e-12 || secondExtension > 1e-12)
        ) {
          return;
        }

        const firstAngle = Math.atan2(
          firstTangent.y - center.y,
          firstTangent.x - center.x,
        );
        const secondAngle = Math.atan2(
          secondTangent.y - center.y,
          secondTangent.x - center.x,
        );
        const firstToSecondSweep = getCounterClockwiseSweep(
          firstAngle,
          secondAngle,
        );
        const useFirstAsStart = firstToSecondSweep <= Math.PI;
        const sweep = useFirstAsStart
          ? firstToSecondSweep
          : Math.PI * 2 - firstToSecondSweep;
        if (sweep <= 1e-7 || sweep > Math.PI + 1e-7) return;

        candidates.push({
          center,
          firstTangent,
          secondTangent,
          startSource: useFirstAsStart ? "first" : "second",
          score:
            squaredDistance(firstTangent, firstPick) +
            squaredDistance(secondTangent, secondPick) +
            (firstExtension + secondExtension) * 100,
        });
      });
    });
  });

  const uniqueCandidates = candidates.filter(
    (candidate, index) =>
      candidates.findIndex(
        (other) =>
          squaredDistance(candidate.center, other.center) <= 1e-14 &&
          squaredDistance(candidate.firstTangent, other.firstTangent) <=
            1e-14 &&
          squaredDistance(candidate.secondTangent, other.secondTangent) <=
            1e-14,
      ) === index,
  );
  return (
    [...uniqueCandidates].sort(
      (first, second) => first.score - second.score,
    )[0] ?? null
  );
}

function applyFilletTrimExtend(entity, pickWorld, tangentPoint) {
  if (entity.type === "line") {
    const endpoints = getLineEndpointPair(entity);
    if (!endpoints) return false;
    const replaceStart =
      squaredDistance(pickWorld, endpoints.startPoint) <=
      squaredDistance(pickWorld, endpoints.endPoint);
    const replacementPoint =
      createConstructionPointWithoutHistory(tangentPoint);
    entity[replaceStart ? "startPointId" : "endPointId"] = replacementPoint.id;
    return true;
  }

  if (entity.type === "arc") {
    const startPoint = getPointById(entity.startPointId);
    const endPoint = getPointById(entity.endPointId);
    if (!startPoint || !endPoint) return false;
    const replaceStart =
      squaredDistance(pickWorld, startPoint) <=
      squaredDistance(pickWorld, endPoint);
    entity[replaceStart ? "startPointId" : "endPointId"] = tangentPoint.id;
    return true;
  }

  return false;
}

function createFilletEntity(
  firstEntity,
  secondEntity,
  firstPick,
  secondPick,
  candidate,
  filletRadius,
  applyTrimExtend,
) {
  recordDocumentChange(
    `Fillet ${firstEntity.type} ${firstEntity.id} to ${secondEntity.type} ${secondEntity.id}`,
  );
  const centerPoint = getOrCreatePointWithoutHistory(candidate.center);
  const firstTangentPoint = getOrCreatePointWithoutHistory(
    candidate.firstTangent,
  );
  const secondTangentPoint = getOrCreatePointWithoutHistory(
    candidate.secondTangent,
  );

  if (applyTrimExtend) {
    applyFilletTrimExtend(firstEntity, firstPick, firstTangentPoint);
    applyFilletTrimExtend(secondEntity, secondPick, secondTangentPoint);
    pruneUnusedConstructionPoints();
  }

  const startPoint =
    candidate.startSource === "first" ? firstTangentPoint : secondTangentPoint;
  const endPoint =
    candidate.startSource === "first" ? secondTangentPoint : firstTangentPoint;
  const filletArc = {
    id: documentModel.nextEntityId,
    type: "arc",
    layerId: documentModel.currentLayerId,
    centerPointId: centerPoint.id,
    radius: filletRadius,
    startPointId: startPoint.id,
    endPointId: endPoint.id,
  };
  documentModel.nextEntityId += 1;
  documentModel.entities.push(filletArc);
  return filletArc;
}

function getEntityIntersections(firstEntity, secondEntity) {
  const firstIsLine = firstEntity.type === "line";
  const secondIsLine = secondEntity.type === "line";

  if (firstIsLine && secondIsLine) {
    const firstStart = getPointById(firstEntity.startPointId);
    const firstEnd = getPointById(firstEntity.endPointId);
    const secondStart = getPointById(secondEntity.startPointId);
    const secondEnd = getPointById(secondEntity.endPointId);
    if (!firstStart || !firstEnd || !secondStart || !secondEnd) {
      return { points: [], kind: "degenerate" };
    }
    return intersectLineSegments(firstStart, firstEnd, secondStart, secondEnd);
  }

  if (firstIsLine || secondIsLine) {
    const line = firstIsLine ? firstEntity : secondEntity;
    const circle = firstIsLine ? secondEntity : firstEntity;
    const lineStart = getPointById(line.startPointId);
    const lineEnd = getPointById(line.endPointId);
    const center = getPointById(circle.centerPointId);
    if (!lineStart || !lineEnd || !center) {
      return { points: [], kind: "degenerate" };
    }
    return intersectLineCircle(lineStart, lineEnd, center, circle.radius);
  }

  const firstCenter = getPointById(firstEntity.centerPointId);
  const secondCenter = getPointById(secondEntity.centerPointId);
  if (!firstCenter || !secondCenter) {
    return { points: [], kind: "degenerate" };
  }
  return intersectCircles(
    firstCenter,
    firstEntity.radius,
    secondCenter,
    secondEntity.radius,
  );
}

function captureDocumentSnapshot() {
  return {
    entities: documentModel.entities.map((entity) => ({ ...entity })),
    nextEntityId: documentModel.nextEntityId,
    model3d: clonePlainModelValue(documentModel.model3d),
    layers: documentModel.layers.map((layer) => ({ ...layer })),
    currentLayerId: documentModel.currentLayerId,
    nextLayerId: documentModel.nextLayerId,
  };
}

function recordDocumentChange(label) {
  historyState.undoStack.push({
    label,
    snapshot: captureDocumentSnapshot(),
  });

  if (historyState.undoStack.length > HISTORY_LIMIT) {
    historyState.undoStack.shift();
  }

  historyState.redoStack = [];
  updateEditMenuState();
}

function restoreDocumentSnapshot(snapshot) {
  documentModel.entities = snapshot.entities.map((entity) => ({
    ...entity,
    layerId: Number.isInteger(entity.layerId) ? entity.layerId : 0,
  }));
  documentModel.nextEntityId = snapshot.nextEntityId;
  documentModel.model3d = clonePlainModelValue(
    snapshot.model3d ?? { solids: [], nextSolidId: 1 },
  );
  documentModel.model3d.solids ??= [];
  documentModel.model3d.nextSolidId = Number.isInteger(
    documentModel.model3d.nextSolidId,
  )
    ? documentModel.model3d.nextSolidId
    : Math.max(0, ...documentModel.model3d.solids.map((solid) => solid.id)) + 1;
  documentModel.layers = (
    snapshot.layers ?? [
      { id: 0, name: "Layer 0", locked: false, masked: false },
    ]
  ).map((layer) => ({ ...layer }));
  documentModel.currentLayerId = getLayerById(snapshot.currentLayerId)
    ? snapshot.currentLayerId
    : documentModel.layers[0].id;
  documentModel.nextLayerId = Number.isInteger(snapshot.nextLayerId)
    ? snapshot.nextLayerId
    : Math.max(...documentModel.layers.map((layer) => layer.id)) + 1;
  selectionState.selectedEntityId = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  clearModelSelection();
  resetChainSelectionPreview();
  pointSketchState.active = false;
  lineSketchState.active = false;
  lineSketchState.startPointId = null;
  lineSketchState.previewWorld = null;
  lineAngleState.active = false;
  lineAngleState.sourceEntityId = null;
  lineAngleState.startPointId = null;
  lineAngleState.lineBaseAngle = 0;
  lineTangentState.active = false;
  lineTangentState.sourceEntityId = null;
  lineTangentState.centerPointId = null;
  joinState.active = false;
  joinState.firstPointId = null;
  joinState.previewWorld = null;
  circleState.active = false;
  circleState.centerPointId = null;
  circleState.centerMode = null;
  hexagonState.active = false;
  hexagonState.centerPointId = null;
  hexagonState.centerMode = null;
  rectangleState.active = false;
  rectangleState.centerPointId = null;
  rectangleState.centerMode = null;
  boltHoleCircleState.active = false;
  boltHoleCircleState.centerPointId = null;
  boltHoleCircleState.centerMode = null;
  intersectionState.active = false;
  intersectionState.firstEntityId = null;
  threeEntityCircleState.active = false;
  threeEntityCircleState.entityIds = [];
  threeEntityCircleState.clickPoints = [];
  offsetState.active = false;
  offsetState.sourceEntityId = null;
  trimExtendState.active = false;
  trimExtendState.sourceEntityId = null;
  trimExtendState.endpointProperty = null;
  trimExtendState.sourcePickWorld = null;
  filletState.active = false;
  filletState.firstEntityId = null;
  filletState.firstPickWorld = null;
  rotateState.active = false;
  rotateState.entityId = null;
  rotateState.solidIds = [];
  rotateState.pivotPointId = null;
  rotateState.awaitingPivot = false;
  dimensionState.activeType = null;
  dimensionState.firstEntityId = null;
  dimensionState.firstLineId = null;
  dimensionState.firstPickWorld = null;
  pointOnEntityState.active = false;
  pointOnEntityState.sourceEntityId = null;
  pointOnEntityState.zeroPointId = null;
  pointOnEntityState.zeroChoiceIndex = null;
  pointOnEntityState.awaitingDirection = false;
  pointOnEntityState.directionChoices = [];
  pointEndState.active = false;
  translateByPointsState.active = false;
  translateByPointsState.entityIds = [];
  translateByPointsState.firstPointId = null;
  translateByPointsState.secondPointId = null;
  textPlacementState.active = false;
  textPlacementState.previewWorld = null;
  cadCanvas.classList.remove("join-points");
  cadCanvas.classList.remove("point-sketch");
  cadCanvas.classList.remove("line-sketch");
  cadCanvas.classList.remove("line-angle");
  cadCanvas.classList.remove("line-tangent");
  cadCanvas.classList.remove("circle-center-radius");
  cadCanvas.classList.remove("circle-sketch-center");
  cadCanvas.classList.remove("hexagon-center");
  cadCanvas.classList.remove("rectangle-center");
  cadCanvas.classList.remove("bolt-hole-circle-center");
  cadCanvas.classList.remove("intersect-entities");
  cadCanvas.classList.remove("apollonius-entities");
  cadCanvas.classList.remove("offset-entity");
  cadCanvas.classList.remove("trim-extend");
  cadCanvas.classList.remove("trim-extend-source-pick");
  cadCanvas.classList.remove("fillet-entity");
  cadCanvas.classList.remove("rotate-active");
  cadCanvas.classList.remove("rotate-pivot-pick");
  cadCanvas.classList.remove("dimension-linear");
  cadCanvas.classList.remove("dimension-diameter");
  cadCanvas.classList.remove("dimension-radius");
  cadCanvas.classList.remove("dimension-angle");
  cadCanvas.classList.remove("point-on-entity");
  cadCanvas.classList.remove("point-on-entity-source-pick");
  cadCanvas.classList.remove("point-end");
  cadCanvas.classList.remove("point-end-source-pick");
  cadCanvas.classList.remove("translate-by-points");
  cadCanvas.classList.remove("text-placement");
  previewLayer.innerHTML = "";
  if (circleRadiusWindow.classList.contains("is-maximized")) {
    restoreCircleWindow();
  }
  setCircleWindowMinimized(false);
  circleRadiusWindow.hidden = true;
  if (hexagonWindow.classList.contains("is-maximized")) {
    restoreHexagonWindow();
  }
  setHexagonWindowMinimized(false);
  hexagonWindow.hidden = true;
  if (rectangleWindow.classList.contains("is-maximized")) {
    restoreRectangleWindow();
  }
  setRectangleWindowMinimized(false);
  rectangleWindow.hidden = true;
  if (boltHoleCircleWindow.classList.contains("is-maximized")) {
    restoreBoltHoleCircleWindow();
  }
  setBoltHoleCircleWindowMinimized(false);
  boltHoleCircleWindow.hidden = true;
  if (textWindow.classList.contains("is-maximized")) {
    restoreTextWindow();
  }
  setTextWindowMinimized(false);
  textWindow.hidden = true;
  if (lineAngleWindow.classList.contains("is-maximized")) {
    restoreLineAngleWindow();
  }
  setLineAngleWindowMinimized(false);
  lineAngleWindow.hidden = true;
  if (lineTangentWindow.classList.contains("is-maximized")) {
    restoreLineTangentWindow();
  }
  setLineTangentWindowMinimized(false);
  lineTangentWindow.hidden = true;
  if (offsetWindow.classList.contains("is-maximized")) {
    restoreOffsetWindow();
  }
  setOffsetWindowMinimized(false);
  offsetWindow.hidden = true;
  if (filletWindow.classList.contains("is-maximized")) {
    restoreFilletWindow();
  }
  setFilletWindowMinimized(false);
  filletWindow.hidden = true;
  if (rotateWindow.classList.contains("is-maximized")) {
    restoreRotateWindow();
  }
  setRotateWindowMinimized(false);
  rotateWindow.hidden = true;
  if (translateWindow.classList.contains("is-maximized")) {
    restoreTranslateWindow();
  }
  setTranslateWindowMinimized(false);
  translateWindow.hidden = true;
  if (translateByPointsWindow.classList.contains("is-maximized")) {
    restoreTranslateByPointsWindow();
  }
  setTranslateByPointsWindowMinimized(false);
  translateByPointsWindow.hidden = true;
  if (pointIncrementalWindow.classList.contains("is-maximized")) {
    restorePointIncrementalWindow();
  }
  setPointIncrementalWindowMinimized(false);
  pointIncrementalWindow.hidden = true;
  if (pointOnEntityWindow.classList.contains("is-maximized")) {
    restorePointOnEntityWindow();
  }
  setPointOnEntityWindowMinimized(false);
  pointOnEntityWindow.hidden = true;
  boxWindow.classList.remove("is-minimized", "is-maximized");
  boxWindow.hidden = true;
  renderEntities();
}

function updateEditMenuState() {
  const selectedEntityCount = documentModel.entities.filter(
    (entity) =>
      selectionState.selectedEntityIds.has(entity.id) &&
      isEntityOnCurrentLayer(entity) &&
      (entity.type !== "point" || !entity.isConstruction),
  ).length;
  const canEditLayer = isCurrentLayerEditable();
  const selectedSolidCount = getSelectedModelSolids().filter((solid) =>
    isEntityOnCurrentLayer(solid),
  ).length;
  const activeSelectionCount = is3dWorkspace()
    ? selectedSolidCount
    : selectedEntityCount;
  const hasWorkspaceClipboard = is3dWorkspace()
    ? clipboardState.solids.length > 0
    : clipboardState.rootEntityIds.length > 0;
  undoMenu.disabled = historyState.undoStack.length === 0;
  redoMenu.disabled = historyState.redoStack.length === 0;
  quickUndoButton.disabled = historyState.undoStack.length === 0;
  quickRedoButton.disabled = historyState.redoStack.length === 0;
  copyMenu.disabled = activeSelectionCount === 0;
  pasteMenu.disabled = !hasWorkspaceClipboard || !canEditLayer;
  cutMenu.disabled = activeSelectionCount === 0 || !canEditLayer;
  deleteMenu.disabled = activeSelectionCount === 0 || !canEditLayer;
}

function dismissEditMenu() {
  editMenuItem.classList.add("is-dismissed");
  document.activeElement?.blur();
}

function undoDocumentChange() {
  dismissEditMenu();
  const keepPointSketchActive = pointSketchState.active;
  const keepLineSketchActive = lineSketchState.active;
  const historyEntry = historyState.undoStack.pop();
  if (!historyEntry) {
    commandStatus.textContent = "Nothing to undo.";
    updateEditMenuState();
    return;
  }

  historyState.redoStack.push({
    label: historyEntry.label,
    snapshot: captureDocumentSnapshot(),
  });
  restoreDocumentSnapshot(historyEntry.snapshot);
  if (keepPointSketchActive) {
    pointSketchState.active = true;
    cadCanvas.classList.add("point-sketch");
  }
  if (keepLineSketchActive) {
    lineSketchState.active = true;
    lineSketchState.startPointId = null;
    lineSketchState.previewWorld = null;
    cadCanvas.classList.add("line-sketch");
  }
  commandStatus.textContent =
    `Undo: ${historyEntry.label}` +
    (keepPointSketchActive
      ? ". Point - Sketch remains active."
      : keepLineSketchActive
        ? ". Line - Sketch remains active; click the first point."
        : "");
}

function redoDocumentChange() {
  dismissEditMenu();
  const keepPointSketchActive = pointSketchState.active;
  const keepLineSketchActive = lineSketchState.active;
  const historyEntry = historyState.redoStack.pop();
  if (!historyEntry) {
    commandStatus.textContent = "Nothing to redo.";
    updateEditMenuState();
    return;
  }

  historyState.undoStack.push({
    label: historyEntry.label,
    snapshot: captureDocumentSnapshot(),
  });
  restoreDocumentSnapshot(historyEntry.snapshot);
  if (keepPointSketchActive) {
    pointSketchState.active = true;
    cadCanvas.classList.add("point-sketch");
  }
  if (keepLineSketchActive) {
    lineSketchState.active = true;
    lineSketchState.startPointId = null;
    lineSketchState.previewWorld = null;
    cadCanvas.classList.add("line-sketch");
  }
  commandStatus.textContent =
    `Redo: ${historyEntry.label}` +
    (keepPointSketchActive
      ? ". Point - Sketch remains active."
      : keepLineSketchActive
        ? ". Line - Sketch remains active; click the first point."
        : "");
}

const CLIPBOARD_POINT_REFERENCE_PROPERTIES = [
  "startPointId",
  "endPointId",
  "centerPointId",
];

function getSelectedClipboardRoots() {
  return documentModel.entities.filter(
    (entity) =>
      selectionState.selectedEntityIds.has(entity.id) &&
      isEntityOnCurrentLayer(entity) &&
      (entity.type !== "point" || !entity.isConstruction),
  );
}

function captureSelectionToClipboard() {
  if (is3dWorkspace()) {
    const solids = getSelectedModelSolids().filter(
      (solid) =>
        isEntityOnCurrentLayer(solid) && isEntityLayerVisible(solid),
    );
    if (!solids.length) return 0;
    clipboardState.solids = clonePlainModelValue(solids);
    clipboardState.entities = [];
    clipboardState.rootEntityIds = [];
    updateEditMenuState();
    return solids.length;
  }
  const rootEntities = getSelectedClipboardRoots();
  if (!rootEntities.length) return 0;

  const copiedEntityIds = new Set(rootEntities.map((entity) => entity.id));
  rootEntities.forEach((entity) => {
    CLIPBOARD_POINT_REFERENCE_PROPERTIES.forEach((property) => {
      if (Number.isInteger(entity[property])) {
        copiedEntityIds.add(entity[property]);
      }
    });
  });

  clipboardState.entities = documentModel.entities
    .filter((entity) => copiedEntityIds.has(entity.id))
    .map((entity) => ({ ...entity }));
  clipboardState.rootEntityIds = rootEntities.map((entity) => entity.id);
  clipboardState.solids = [];
  updateEditMenuState();
  return rootEntities.length;
}

function copySelectedEntities() {
  dismissEditMenu();
  const copiedCount = captureSelectionToClipboard();
  if (!copiedCount) {
    commandStatus.textContent = "Copy: Select one or more entities first.";
    return;
  }

  const noun = is3dWorkspace() ? "solid" : "entity";
  commandStatus.textContent = `Copied ${copiedCount} ${copiedCount === 1 ? noun : `${noun}s`}.`;
}

function pasteCopiedEntities() {
  dismissEditMenu();
  const restrictionMessage = getCurrentLayerRestrictionMessage("Paste");
  if (restrictionMessage) {
    commandStatus.textContent = restrictionMessage;
    return;
  }
  if (is3dWorkspace()) {
    if (!clipboardState.solids.length) {
      commandStatus.textContent =
        "Paste: The 3D PrometheusCAD clipboard is empty.";
      updateEditMenuState();
      return;
    }
    const copiedSolids = clonePlainModelValue(clipboardState.solids);
    recordDocumentChange(
      `Paste ${copiedSolids.length} ${copiedSolids.length === 1 ? "solid" : "solids"}`,
    );
    clearModelSelection();
    copiedSolids.forEach((solid) => {
      solid.id = documentModel.model3d.nextSolidId;
      solid.layerId = documentModel.currentLayerId;
      documentModel.model3d.nextSolidId += 1;
      documentModel.model3d.solids.push(solid);
      modelSelectionState.selectedSolidIds.add(solid.id);
    });
    renderEntities();
    commandStatus.textContent =
      `Pasted ${copiedSolids.length} ` +
      `${copiedSolids.length === 1 ? "solid" : "solids"} at the copied coordinates.`;
    return;
  }
  if (!clipboardState.rootEntityIds.length || !clipboardState.entities.length) {
    commandStatus.textContent = "Paste: The PrometheusCAD clipboard is empty.";
    updateEditMenuState();
    return;
  }

  const rootCount = clipboardState.rootEntityIds.length;
  recordDocumentChange(
    `Paste ${rootCount} ${rootCount === 1 ? "entity" : "entities"}`,
  );
  const rootEntityIdSet = new Set(clipboardState.rootEntityIds);
  const pastedIdBySourceId = new Map();
  clipboardState.entities.forEach((entity) => {
    pastedIdBySourceId.set(entity.id, documentModel.nextEntityId);
    documentModel.nextEntityId += 1;
  });

  const pastedEntities = clipboardState.entities.map((sourceEntity) => {
    const pastedEntity = {
      ...sourceEntity,
      id: pastedIdBySourceId.get(sourceEntity.id),
      layerId: documentModel.currentLayerId,
    };
    CLIPBOARD_POINT_REFERENCE_PROPERTIES.forEach((property) => {
      if (pastedIdBySourceId.has(sourceEntity[property])) {
        pastedEntity[property] = pastedIdBySourceId.get(sourceEntity[property]);
      }
    });
    if (
      pastedEntity.type === "point" &&
      !rootEntityIdSet.has(sourceEntity.id)
    ) {
      pastedEntity.isConstruction = true;
    }
    return pastedEntity;
  });
  const pastedRootIds = clipboardState.rootEntityIds
    .map((sourceId) => pastedIdBySourceId.get(sourceId))
    .filter((entityId) => Number.isInteger(entityId));

  documentModel.entities.push(...pastedEntities);
  selectionState.selectedEntityIds.clear();
  pastedRootIds.forEach((entityId) =>
    selectionState.selectedEntityIds.add(entityId),
  );
  selectionState._selectedEntityId =
    pastedRootIds.length === 1 ? pastedRootIds[0] : null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  renderEntities();
  commandStatus.textContent =
    `Pasted ${pastedRootIds.length} ` +
    `${pastedRootIds.length === 1 ? "entity" : "entities"} at the copied coordinates.`;
}

function detachEntityReferencesFromPoints(entityIdsToRemove, pointIdsToDetach) {
  const replacementPointBySourceId = new Map();
  documentModel.entities.forEach((entity) => {
    if (!isEntityOnCurrentLayer(entity) || entityIdsToRemove.has(entity.id)) {
      return;
    }
    CLIPBOARD_POINT_REFERENCE_PROPERTIES.forEach((property) => {
      const sourcePointId = entity[property];
      if (!pointIdsToDetach.has(sourcePointId)) return;
      let replacementPoint = replacementPointBySourceId.get(sourcePointId);
      if (!replacementPoint) {
        const sourcePoint = getPointById(sourcePointId);
        if (!sourcePoint) return;
        replacementPoint = createConstructionPointWithoutHistory(sourcePoint);
        replacementPointBySourceId.set(sourcePointId, replacementPoint);
      }
      entity[property] = replacementPoint.id;
    });
  });
}

function cutSelectedEntities() {
  dismissEditMenu();
  const restrictionMessage = getCurrentLayerRestrictionMessage("Cut");
  if (restrictionMessage) {
    commandStatus.textContent = restrictionMessage;
    return;
  }
  if (is3dWorkspace()) {
    const solids = getSelectedModelSolids().filter((solid) =>
      isEntityOnCurrentLayer(solid),
    );
    if (!solids.length) {
      commandStatus.textContent = "Cut: Select one or more solids first.";
      updateEditMenuState();
      return;
    }
    const cutCount = captureSelectionToClipboard();
    const solidIds = new Set(solids.map((solid) => solid.id));
    recordDocumentChange(
      `Cut ${cutCount} ${cutCount === 1 ? "solid" : "solids"}`,
    );
    documentModel.model3d.solids = documentModel.model3d.solids.filter(
      (solid) => !solidIds.has(solid.id),
    );
    clearModelSelection();
    renderEntities();
    commandStatus.textContent =
      `Cut ${cutCount} ${cutCount === 1 ? "solid" : "solids"}.`;
    return;
  }
  const rootEntities = getSelectedClipboardRoots();
  if (!rootEntities.length) {
    commandStatus.textContent = "Cut: Select one or more entities first.";
    updateEditMenuState();
    return;
  }

  const cutCount = captureSelectionToClipboard();
  const cutEntityIds = new Set(rootEntities.map((entity) => entity.id));
  const cutPointIds = new Set(
    rootEntities
      .filter((entity) => entity.type === "point")
      .map((entity) => entity.id),
  );
  recordDocumentChange(
    `Cut ${cutCount} ${cutCount === 1 ? "entity" : "entities"}`,
  );
  detachEntityReferencesFromPoints(cutEntityIds, cutPointIds);

  documentModel.entities = documentModel.entities.filter(
    (entity) => !cutEntityIds.has(entity.id),
  );
  pruneUnusedConstructionPoints();
  selectionState.selectedEntityId = null;
  renderEntities();
  commandStatus.textContent = `Cut ${cutCount} ${cutCount === 1 ? "entity" : "entities"}.`;
}

function deleteSelectedEntity() {
  dismissEditMenu();
  const restrictionMessage = getCurrentLayerRestrictionMessage("Delete");
  if (restrictionMessage) {
    commandStatus.textContent = restrictionMessage;
    return;
  }
  if (is3dWorkspace()) {
    const selectedSolids = getSelectedModelSolids().filter((solid) =>
      isEntityOnCurrentLayer(solid),
    );
    if (!selectedSolids.length) {
      commandStatus.textContent = "Select one or more solids to delete.";
      updateEditMenuState();
      return;
    }
    const selectedSolidIds = new Set(
      selectedSolids.map((solid) => solid.id),
    );
    recordDocumentChange(
      `Delete ${selectedSolids.length} selected ` +
        `${selectedSolids.length === 1 ? "solid" : "solids"}`,
    );
    documentModel.model3d.solids = documentModel.model3d.solids.filter(
      (solid) => !selectedSolidIds.has(solid.id),
    );
    clearModelSelection();
    renderEntities();
    commandStatus.textContent =
      `Deleted ${selectedSolids.length} selected ` +
      `${selectedSolids.length === 1 ? "solid" : "solids"}.`;
    return;
  }
  const selectedEntities = documentModel.entities.filter(
    (entity) =>
      selectionState.selectedEntityIds.has(entity.id) &&
      isEntityOnCurrentLayer(entity) &&
      (entity.type !== "point" || !entity.isConstruction),
  );
  if (!selectedEntities.length) {
    commandStatus.textContent = "Select one or more entities to delete.";
    updateEditMenuState();
    return;
  }

  const selectedEntityIds = new Set(
    selectedEntities.map((entity) => entity.id),
  );
  const selectedPointIds = new Set(
    selectedEntities
      .filter((entity) => entity.type === "point")
      .map((entity) => entity.id),
  );
  const entityIdsToDelete = new Set(selectedEntityIds);
  documentModel.entities.forEach((entity) => {
    if (!isEntityOnCurrentLayer(entity) || selectedEntityIds.has(entity.id)) {
      return;
    }
    const dependsOnSelectedPoint =
      (entity.type === "circle" &&
        selectedPointIds.has(entity.centerPointId)) ||
      (entity.type === "arc" &&
        (selectedPointIds.has(entity.centerPointId) ||
          selectedPointIds.has(entity.startPointId) ||
          selectedPointIds.has(entity.endPointId)));
    if (dependsOnSelectedPoint) entityIdsToDelete.add(entity.id);
  });
  const dependentDeleteCount = entityIdsToDelete.size - selectedEntityIds.size;
  recordDocumentChange(
    `Delete ${selectedEntities.length} selected ` +
      `${selectedEntities.length === 1 ? "entity" : "entities"}`,
  );
  detachEntityReferencesFromPoints(entityIdsToDelete, selectedPointIds);
  documentModel.entities = documentModel.entities.filter(
    (entity) => !entityIdsToDelete.has(entity.id),
  );
  pruneUnusedConstructionPoints();
  selectionState.selectedEntityId = null;
  renderEntities();
  commandStatus.textContent =
    `Deleted ${selectedEntities.length} selected ` +
    `${selectedEntities.length === 1 ? "entity" : "entities"}` +
    (dependentDeleteCount
      ? ` and ${dependentDeleteCount} dependent ${dependentDeleteCount === 1 ? "entity" : "entities"}.`
      : ".");
}

function dismissDrawMenu() {
  drawMenuItem.classList.add("is-dismissed");
  document.activeElement?.blur();
}

function deactivatePointSketch(statusMessage) {
  pointSketchState.active = false;
  cadCanvas.classList.remove("point-sketch");
  if (lineSketchState.active) deactivateLineSketch();
  if (threeEntityCircleState.active) deactivateThreeEntityCircle();
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function activatePointSketch() {
  dismissDrawMenu();
  deactivateLineSketch();
  deactivateThreeEntityCircle();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  pointSketchState.active = true;
  cadCanvas.classList.add("point-sketch");
  renderEntities();
  commandStatus.textContent =
    "Point - Sketch: Click the drawing to create points; choose another task or press Escape to finish.";
}

function handlePointSketchClick(event) {
  const worldPoint = screenToWorld(event);
  const existingPoint = findExistingPointAt(worldPoint);
  if (existingPoint) {
    commandStatus.textContent =
      `Point ${existingPoint.id} already exists at X${formatCoordinate(existingPoint.x)} ` +
      `Y${formatCoordinate(existingPoint.y)}. Point - Sketch remains active.`;
    return;
  }

  const point = addPoint(worldPoint.x, worldPoint.y);
  commandStatus.textContent =
    `Created point ${point.id} at X${formatCoordinate(point.x)} ` +
    `Y${formatCoordinate(point.y)}. Point - Sketch remains active.`;
}

function deactivateLineSketch(statusMessage) {
  lineSketchState.active = false;
  lineSketchState.startPointId = null;
  lineSketchState.previewWorld = null;
  cadCanvas.classList.remove("line-sketch");
  previewLayer.innerHTML = "";
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function activateLineSketch() {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  lineSketchState.active = true;
  lineSketchState.startPointId = null;
  lineSketchState.previewWorld = null;
  cadCanvas.classList.add("line-sketch");
  renderEntities();
  commandStatus.textContent =
    "Line - Sketch: Click the first point; choose another task or press Escape to finish.";
}

function handleLineSketchClick(event) {
  const worldPoint = screenToWorld(event);

  if (lineSketchState.startPointId === null) {
    const existingPoint = findExistingPointAt(worldPoint);
    const startPoint = existingPoint ?? addPoint(worldPoint.x, worldPoint.y);
    lineSketchState.startPointId = startPoint.id;
    lineSketchState.previewWorld = { x: startPoint.x, y: startPoint.y };
    renderEntities();
    commandStatus.textContent =
      `Line - Sketch: Start point ${startPoint.id} at ` +
      `X${formatCoordinate(startPoint.x)} Y${formatCoordinate(startPoint.y)}; ` +
      "click the end point.";
    return;
  }

  const startPoint = getPointById(lineSketchState.startPointId);
  if (!startPoint) {
    lineSketchState.startPointId = null;
    lineSketchState.previewWorld = null;
    renderEntities();
    commandStatus.textContent =
      "Line - Sketch: The start point is no longer available; click a new first point.";
    return;
  }

  if (squaredDistance(startPoint, worldPoint) <= GEOMETRY_EPSILON ** 2) {
    commandStatus.textContent =
      "Line - Sketch: The end must differ from the start point.";
    return;
  }

  const duplicateLine = findLineAtCoordinates(startPoint, worldPoint);
  if (duplicateLine) {
    lineSketchState.startPointId = null;
    lineSketchState.previewWorld = null;
    renderEntities();
    commandStatus.textContent =
      `Line - Sketch: Line ${duplicateLine.id} already exists there; ` +
      "click the first point for the next line.";
    return;
  }

  lineSketchState.startPointId = null;
  lineSketchState.previewWorld = null;
  const {
    line,
    startPoint: visibleStart,
    endPoint,
  } = addCoordinateLine(startPoint, worldPoint);
  commandStatus.textContent =
    `Created line ${line.id} from point ${visibleStart.id} to point ${endPoint.id}. ` +
    "Line - Sketch remains active; click the first point for the next line.";
}

function deactivateJoin(statusMessage) {
  joinState.active = false;
  joinState.firstPointId = null;
  joinState.previewWorld = null;
  cadCanvas.classList.remove("join-points");
  previewLayer.innerHTML = "";
  renderEntities();

  if (statusMessage) {
    commandStatus.textContent = statusMessage;
  }
}

function activateJoin() {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  const pointCount = documentModel.entities.filter(
    (entity) => entity.type === "point" && !entity.isConstruction,
  ).length;
  if (pointCount < 2) {
    commandStatus.textContent = "Line - Join needs at least two points.";
    return;
  }

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  cadCanvas.classList.remove("select-single");
  joinState.active = true;
  joinState.firstPointId = null;
  joinState.previewWorld = null;
  cadCanvas.classList.add("join-points");
  renderEntities();
  commandStatus.textContent = "Line - Join: Select the first point.";
}

function handleJoinClick(event) {
  const pointElement = event.target.closest(".point-entity");
  if (!pointElement) {
    commandStatus.textContent =
      joinState.firstPointId === null
        ? "Line - Join: Select the first point."
        : "Line - Join: Select the second point.";
    return;
  }

  const pointId = Number(pointElement.dataset.entityId);
  if (joinState.firstPointId === null) {
    joinState.firstPointId = pointId;
    joinState.previewWorld = getPointById(pointId);
    renderEntities();
    commandStatus.textContent = "Line - Join: Select the second point.";
    return;
  }

  if (pointId === joinState.firstPointId) {
    commandStatus.textContent = "Line - Join: Choose a different second point.";
    return;
  }

  const startPointId = joinState.firstPointId;
  const startPoint = getPointById(startPointId);
  const endPoint = getPointById(pointId);
  const duplicateLine =
    startPoint && endPoint ? findLineAtCoordinates(startPoint, endPoint) : null;

  if (duplicateLine) {
    joinState.firstPointId = null;
    joinState.previewWorld = null;
    renderEntities();
    commandStatus.textContent =
      `Line already joins point ${startPointId} and point ${pointId}. ` +
      "Select the first point for the next line.";
    return;
  }

  const line = addJoinLine(startPointId, pointId);
  if (!line) {
    joinState.firstPointId = null;
    joinState.previewWorld = null;
    renderEntities();
    commandStatus.textContent =
      "Line - Join: One of the selected points is no longer available.";
    return;
  }
  joinState.firstPointId = null;
  joinState.previewWorld = null;
  renderEntities();
  commandStatus.textContent =
    `Created line ${line.id} joining point ${startPointId} to point ${pointId}. ` +
    "Select the first point for the next line.";
}

function deactivateIntersectingPoint(statusMessage) {
  intersectionState.active = false;
  intersectionState.firstEntityId = null;
  cadCanvas.classList.remove("intersect-entities");
  renderEntities();

  if (statusMessage) {
    commandStatus.textContent = statusMessage;
  }
}

function activateIntersectingPoint() {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateJoin();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow();
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  const intersectableCount = documentModel.entities.filter(
    (entity) => entity.type === "line" || entity.type === "circle",
  ).length;
  if (intersectableCount < 2) {
    commandStatus.textContent =
      "Point - Intersecting needs at least two line or circle entities.";
    return;
  }

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  cadCanvas.classList.remove("select-single");
  intersectionState.active = true;
  intersectionState.firstEntityId = null;
  cadCanvas.classList.add("intersect-entities");
  renderEntities();
  commandStatus.textContent =
    "Point - Intersecting: Select the first line or circle.";
}

function handleIntersectingPointClick(event) {
  const entityElement = event.target.closest(".line-entity, .circle-entity");
  if (!entityElement) {
    commandStatus.textContent =
      intersectionState.firstEntityId === null
        ? "Point - Intersecting: Select the first line or circle."
        : "Point - Intersecting: Select the second line or circle.";
    return;
  }

  const entityId = Number(entityElement.dataset.entityId);
  if (intersectionState.firstEntityId === null) {
    intersectionState.firstEntityId = entityId;
    renderEntities();
    commandStatus.textContent =
      "Point - Intersecting: Select the second line or circle.";
    return;
  }

  if (entityId === intersectionState.firstEntityId) {
    commandStatus.textContent =
      "Point - Intersecting: Choose a different second entity.";
    return;
  }

  const firstEntity = getEntityById(intersectionState.firstEntityId);
  const secondEntity = getEntityById(entityId);
  if (!firstEntity || !secondEntity) {
    deactivateIntersectingPoint(
      "Point - Intersecting canceled: entity missing.",
    );
    return;
  }

  const result = getEntityIntersections(firstEntity, secondEntity);
  if (!result.points.length) {
    commandStatus.textContent =
      result.kind === "overlap"
        ? "These entities overlap or coincide, so they do not have one unique intersection. Select a different second entity."
        : "These entities do not have a finite intersection. Select a different second entity.";
    return;
  }

  const clickWorld = screenToWorld(event);
  const chosenIntersection = [...result.points].sort(
    (first, second) =>
      squaredDistance(first, clickWorld) - squaredDistance(second, clickWorld),
  )[0];
  const existingPoint = documentModel.entities.find(
    (entity) =>
      entity.type === "point" &&
      !entity.isConstruction &&
      squaredDistance(entity, chosenIntersection) <= 1e-14,
  );
  if (existingPoint) {
    intersectionState.firstEntityId = null;
    renderEntities();
    commandStatus.textContent =
      `Intersection already exists as point ${existingPoint.id} at X${formatCoordinate(existingPoint.x)} Y${formatCoordinate(existingPoint.y)}. ` +
      "Select the first line or circle for the next point.";
    return;
  }

  const point = addPoint(chosenIntersection.x, chosenIntersection.y);
  const choiceDescription =
    result.points.length > 1 ? " (nearest of two intersections)" : "";
  intersectionState.firstEntityId = null;
  renderEntities();
  commandStatus.textContent =
    `Created intersecting point ${point.id} at X${formatCoordinate(point.x)} Y${formatCoordinate(point.y)}${choiceDescription}. ` +
    "Select the first line or circle for the next point.";
}

function positionCircleWindowInitially() {
  const windowBounds = circleRadiusWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );

  circleRadiusWindow.style.left = `${left}px`;
  circleRadiusWindow.style.top = `${top}px`;
  circleWindowState.hasPosition = true;
}

function setCircleWindowMinimized(minimized) {
  circleRadiusWindow.classList.toggle("is-minimized", minimized);
  circleMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Circle" : "Minimize Circle",
  );
  circleMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreCircleWindow() {
  circleRadiusWindow.classList.remove("is-maximized");

  if (circleWindowState.restoreBounds) {
    const { left, top, width } = circleWindowState.restoreBounds;
    circleRadiusWindow.style.left = `${left}px`;
    circleRadiusWindow.style.top = `${top}px`;
    circleRadiusWindow.style.width = `${width}px`;
  }

  circleMaximizeButton.setAttribute("aria-label", "Maximize Circle");
  circleMaximizeButton.title = "Maximize";
  circleMaximizeIcon.textContent = "□";
}

function toggleCircleWindowMaximized() {
  setCircleWindowMinimized(false);

  if (circleRadiusWindow.classList.contains("is-maximized")) {
    restoreCircleWindow();
    return;
  }

  const bounds = circleRadiusWindow.getBoundingClientRect();
  circleWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  circleRadiusWindow.classList.add("is-maximized");
  circleMaximizeButton.setAttribute("aria-label", "Restore Circle");
  circleMaximizeButton.title = "Restore";
  circleMaximizeIcon.textContent = "❐";
}

function updateCircleCreateState() {
  if (circleState.centerMode === "coordinate") {
    const centerX = getArithmeticInputValue(circleCenterXInput);
    const centerY = getArithmeticInputValue(circleCenterYInput);
    circleCreateButton.disabled =
      !Number.isFinite(centerX) ||
      !Number.isFinite(centerY) ||
      getCircleRadiusInputValue() === null;
    circleContinueButton.disabled = circleCreateButton.disabled;
    return;
  }
  circleCreateButton.disabled =
    circleState.centerPointId === null || getCircleRadiusInputValue() === null;
}

function closeCircleRadiusWindow(statusMessage = "Ready") {
  if (circleRadiusWindow.classList.contains("is-maximized")) {
    restoreCircleWindow();
  }

  setCircleWindowMinimized(false);
  circleRadiusWindow.hidden = true;
  circleState.active = false;
  circleState.centerPointId = null;
  circleState.centerMode = null;
  cadCanvas.classList.remove("circle-center-radius");
  cadCanvas.classList.remove("circle-sketch-center");
  previewLayer.innerHTML = "";
  renderEntities();

  if (statusMessage !== null) {
    commandStatus.textContent = statusMessage;
  }
}

function activateCircleCenterMode(centerMode) {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow();
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  if (centerMode === "point") {
    const pointCount = documentModel.entities.filter(
      (entity) => entity.type === "point" && !entity.isConstruction,
    ).length;
    if (pointCount < 1) {
      commandStatus.textContent =
        "Circle - Point Center & Radius needs an existing center point.";
      return;
    }
  }

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  cadCanvas.classList.remove("select-single");
  circleState.active = centerMode !== "coordinate";
  circleState.centerPointId = null;
  circleState.centerMode = centerMode;
  cadCanvas.classList.toggle("circle-center-radius", centerMode === "point");
  cadCanvas.classList.toggle("circle-sketch-center", centerMode === "sketch");
  circleRadiusTitle.textContent =
    centerMode === "coordinate"
      ? "Circle - Coordinate Center & Radius"
      : centerMode === "sketch"
        ? "Circle - Sketch Center & Radius"
        : "Circle - Point Center & Radius";
  const usesCoordinateCenter = centerMode === "coordinate";
  circleCenterReadoutGroup.hidden = usesCoordinateCenter;
  circleCoordinateCenterFields.hidden = !usesCoordinateCenter;
  circleCoordinateCenterFields.disabled = !usesCoordinateCenter;
  circleContinueButton.hidden = !usesCoordinateCenter;
  circleDialogActions.classList.toggle("two-actions", !usesCoordinateCenter);
  circleCenterReadout.textContent = "None selected";
  circleToolMessage.textContent = usesCoordinateCenter
    ? "Enter the center coordinates and a positive radius."
    : centerMode === "sketch"
      ? "Set the radius if needed, then click the drawing to sketch the center."
      : "Select an existing point for the center.";
  if (getCircleRadiusInputValue() === null) circleRadiusInput.value = "1";
  if (!Number.isFinite(getArithmeticInputValue(circleCenterXInput))) {
    circleCenterXInput.value = "0";
  }
  if (!Number.isFinite(getArithmeticInputValue(circleCenterYInput))) {
    circleCenterYInput.value = "0";
  }
  circleCenterXInput.setCustomValidity("");
  circleCenterYInput.setCustomValidity("");
  circleRadiusInput.setCustomValidity("");
  updateCircleCreateState();
  circleRadiusWindow.hidden = false;
  setCircleWindowMinimized(false);

  if (!circleWindowState.hasPosition) {
    positionCircleWindowInitially();
  }

  renderEntities();
  if (usesCoordinateCenter) {
    circleCenterXInput.focus();
    circleCenterXInput.select();
    commandStatus.textContent = "Circle - Coordinate Center";
  } else {
    commandStatus.textContent =
      centerMode === "sketch"
        ? "Circle - Sketch Center: Click the drawing to create the center point."
        : "Circle: Select the center point.";
  }
}

function activateCircleCenterRadius() {
  activateCircleCenterMode("point");
}

function activateCircleCoordinateCenter() {
  activateCircleCenterMode("coordinate");
}

function activateCircleSketchCenter() {
  activateCircleCenterMode("sketch");
}

function handleCircleCenterClick(event) {
  let centerPoint;
  if (circleState.centerMode === "sketch") {
    const worldPoint = screenToWorld(event);
    centerPoint =
      findExistingPointAt(worldPoint) ?? addPoint(worldPoint.x, worldPoint.y);
  } else {
    const pointElement = event.target.closest(".point-entity");
    if (!pointElement) {
      commandStatus.textContent =
        "Circle: Select an existing point for the center.";
      return;
    }
    centerPoint = getPointById(Number(pointElement.dataset.entityId));
  }

  if (!centerPoint) return;

  circleState.centerPointId = centerPoint.id;
  circleCenterReadout.textContent = `Point ${centerPoint.id} — X${formatCoordinate(centerPoint.x)} Y${formatCoordinate(centerPoint.y)}`;
  circleToolMessage.textContent =
    "Enter a positive radius, then choose Create.";
  circleCreateButton.disabled = getCircleRadiusInputValue() === null;
  renderEntities();
  circleRadiusInput.focus();
  circleRadiusInput.select();
  commandStatus.textContent = `Circle: Center point ${centerPoint.id}; enter the radius.`;
}

function createCoordinateCircleFromInputs(keepDialogOpen) {
  const centerX = resolveArithmeticInput(circleCenterXInput, {
    messageElement: circleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for center X.",
    successMessage: "Enter the center coordinates and a positive radius.",
  });
  const centerY = resolveArithmeticInput(circleCenterYInput, {
    messageElement: circleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for center Y.",
    successMessage: "Enter the center coordinates and a positive radius.",
  });
  const radius = resolveArithmeticInput(circleRadiusInput, {
    messageElement: circleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the radius.",
    validationMessage: (value) =>
      value > 0 ? null : "Enter a radius greater than zero.",
    successMessage: "Enter the center coordinates and a positive radius.",
  });
  if (!circleRadiusForm.reportValidity()) return;
  if (centerX === null || centerY === null || radius === null) return;

  const { circle, centerPoint } = addCoordinateCircle(
    { x: centerX, y: centerY },
    radius,
  );
  const resultMessage =
    `Created circle ${circle.id} centered at X${formatCoordinate(centerPoint.x)} ` +
    `Y${formatCoordinate(centerPoint.y)} with radius ${formatCoordinate(radius)}.`;
  if (keepDialogOpen) {
    circleToolMessage.textContent = resultMessage;
    commandStatus.textContent = `${resultMessage} Circle - Coordinate Center remains open.`;
    circleCenterXInput.focus();
    circleCenterXInput.select();
    return;
  }
  closeCircleRadiusWindow(resultMessage);
}

function createCircleFromInput() {
  const centerPoint = getPointById(circleState.centerPointId);
  const radius = resolveArithmeticInput(circleRadiusInput, {
    messageElement: circleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the radius.",
    validationMessage: (value) =>
      value > 0 ? null : "Enter a radius greater than zero.",
    successMessage: () =>
      circleState.centerPointId === null
        ? circleState.centerMode === "coordinate"
          ? "Enter the center coordinates and a positive radius."
          : circleState.centerMode === "sketch"
            ? "Click the drawing to sketch the center point."
            : "Select an existing point for the center."
        : "Enter a positive radius, then choose Create.",
  });
  if (!circleRadiusForm.reportValidity()) return;
  if (!centerPoint) {
    circleToolMessage.textContent =
      circleState.centerMode === "sketch"
        ? "Click the drawing to sketch the center point."
        : "Select an existing point for the center.";
    return;
  }
  if (radius === null) {
    circleToolMessage.textContent = "Enter a radius greater than zero.";
    return;
  }

  const circle = addCircle(centerPoint.id, radius);
  circleState.centerPointId = null;
  circleCenterReadout.textContent = "None selected";
  circleToolMessage.textContent =
    circleState.centerMode === "sketch"
      ? `Created circle ${circle.id}. Click to sketch the next center point.`
      : `Created circle ${circle.id}. Select the next center point.`;
  circleCreateButton.disabled = true;
  renderEntities();
  commandStatus.textContent =
    `Created circle ${circle.id} at point ${centerPoint.id} with radius ${formatCoordinate(radius)}. ` +
    (circleState.centerMode === "sketch"
      ? "Click to sketch the center point for the next circle."
      : "Select the center point for the next circle.");
}

function deactivateThreeEntityCircle(statusMessage) {
  threeEntityCircleState.active = false;
  threeEntityCircleState.entityIds = [];
  threeEntityCircleState.clickPoints = [];
  cadCanvas.classList.remove("apollonius-entities");
  renderEntities();
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function resetThreeEntityCircleSelection(statusMessage) {
  threeEntityCircleState.entityIds = [];
  threeEntityCircleState.clickPoints = [];
  renderEntities();
  commandStatus.textContent = statusMessage;
}

function activateThreeEntityCircle() {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  const eligibleCount = documentModel.entities.filter(
    (entity) =>
      (entity.type === "point" && !entity.isConstruction) ||
      entity.type === "line" ||
      entity.type === "circle",
  ).length;
  if (eligibleCount < 3) {
    commandStatus.textContent =
      "Circle - 3 Entities needs three point, line, or circle entities.";
    return;
  }

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  threeEntityCircleState.active = true;
  threeEntityCircleState.entityIds = [];
  threeEntityCircleState.clickPoints = [];
  cadCanvas.classList.add("apollonius-entities");
  renderEntities();
  commandStatus.textContent =
    "Circle - 3 Entities: Select the first point, line, or circle near the desired tangency.";
}

function handleThreeEntityCircleClick(event) {
  const entityElement = event.target.closest(
    ".point-entity, .line-entity, .circle-entity",
  );
  if (!entityElement) {
    commandStatus.textContent = `Circle - 3 Entities: Select entity ${threeEntityCircleState.entityIds.length + 1} of 3.`;
    return;
  }

  const entityId = Number(entityElement.dataset.entityId);
  if (threeEntityCircleState.entityIds.includes(entityId)) {
    commandStatus.textContent =
      "Circle - 3 Entities: Each selected entity must be different.";
    return;
  }
  const entity = getEntityById(entityId);
  if (!entity || !["point", "line", "circle"].includes(entity.type)) {
    commandStatus.textContent =
      "Circle - 3 Entities supports points, lines, and circles.";
    return;
  }

  threeEntityCircleState.entityIds.push(entityId);
  threeEntityCircleState.clickPoints.push(screenToWorld(event));
  renderEntities();
  if (threeEntityCircleState.entityIds.length < 3) {
    commandStatus.textContent =
      `Circle - 3 Entities: Selected ${entity.type} ${entity.id}; ` +
      `select entity ${threeEntityCircleState.entityIds.length + 1} of 3.`;
    return;
  }

  const selectedEntities = threeEntityCircleState.entityIds.map(getEntityById);
  const candidates = solveApolloniusThreeEntities(selectedEntities);
  const chosenCandidate = selectApolloniusCandidate(
    candidates,
    selectedEntities,
    threeEntityCircleState.clickPoints,
  );
  if (!chosenCandidate) {
    resetThreeEntityCircleSelection(
      "Circle - 3 Entities: No finite tangent circle was found. Select a new first entity.",
    );
    return;
  }

  threeEntityCircleState.entityIds = [];
  threeEntityCircleState.clickPoints = [];
  const { circle, centerPoint } = addApolloniusCircle(
    { x: chosenCandidate.center[0], y: chosenCandidate.center[1] },
    chosenCandidate.radius,
  );
  commandStatus.textContent =
    `Created circle ${circle.id} at point ${centerPoint.id} with radius ` +
    `${formatCoordinate(circle.radius)} from ${candidates.length} valid ` +
    `${candidates.length === 1 ? "solution" : "solutions"}. ` +
    "Circle - 3 Entities remains active; select the first entity for the next circle.";
}

function positionHexagonWindowInitially() {
  const windowBounds = hexagonWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );
  hexagonWindow.style.left = `${left}px`;
  hexagonWindow.style.top = `${top}px`;
  hexagonWindowState.hasPosition = true;
}

function setHexagonWindowMinimized(minimized) {
  hexagonWindow.classList.toggle("is-minimized", minimized);
  hexagonMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Hexagon" : "Minimize Hexagon",
  );
  hexagonMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreHexagonWindow() {
  hexagonWindow.classList.remove("is-maximized");
  if (hexagonWindowState.restoreBounds) {
    const { left, top, width } = hexagonWindowState.restoreBounds;
    hexagonWindow.style.left = `${left}px`;
    hexagonWindow.style.top = `${top}px`;
    hexagonWindow.style.width = `${width}px`;
  }
  hexagonMaximizeButton.setAttribute("aria-label", "Maximize Hexagon");
  hexagonMaximizeButton.title = "Maximize";
  hexagonMaximizeIcon.textContent = "□";
}

function toggleHexagonWindowMaximized() {
  setHexagonWindowMinimized(false);
  if (hexagonWindow.classList.contains("is-maximized")) {
    restoreHexagonWindow();
    return;
  }
  const bounds = hexagonWindow.getBoundingClientRect();
  hexagonWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  hexagonWindow.classList.add("is-maximized");
  hexagonMaximizeButton.setAttribute("aria-label", "Restore Hexagon");
  hexagonMaximizeButton.title = "Restore";
  hexagonMaximizeIcon.textContent = "❐";
}

function closeHexagonWindow(statusMessage = "Ready") {
  if (hexagonWindow.classList.contains("is-maximized")) {
    restoreHexagonWindow();
  }
  setHexagonWindowMinimized(false);
  hexagonWindow.hidden = true;
  hexagonState.active = false;
  hexagonState.centerPointId = null;
  hexagonState.centerMode = null;
  cadCanvas.classList.remove("hexagon-center");
  previewLayer.innerHTML = "";
  renderEntities();
  if (statusMessage !== null) commandStatus.textContent = statusMessage;
}

function updateHexagonCreateState() {
  const center = getCenterFromToolState(
    hexagonState,
    getHexagonCenterXInputValue,
    getHexagonCenterYInputValue,
  );
  const acrossFlats = getHexagonAcrossFlatsInputValue();
  const cornerRadius = getHexagonCornerRadiusInputValue(acrossFlats);
  hexagonCreateButton.disabled =
    center === null || acrossFlats === null || cornerRadius === null;
}

function activateHexagon(centerMode) {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!rectangleWindow.hidden) closeRectangleWindow(null);
  if (!boltHoleCircleWindow.hidden) closeBoltHoleCircleWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  if (centerMode === "point" && !hasSelectableCenterPoint()) {
    commandStatus.textContent =
      "Hexagon - Point Center needs an existing point on the current layer.";
    return;
  }

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  cadCanvas.classList.remove("select-single");
  hexagonState.active = true;
  hexagonState.centerPointId = null;
  hexagonState.centerMode = centerMode;
  cadCanvas.classList.toggle("hexagon-center", centerMode === "point");
  hexagonTitle.textContent =
    centerMode === "point" ? "Hexagon - Point Center" : "Hexagon - Define Center";
  hexagonCenterReadoutGroup.hidden = centerMode !== "point";
  hexagonCoordinateCenterFields.hidden = centerMode !== "defined";
  hexagonCoordinateCenterFields.disabled = centerMode !== "defined";
  hexagonCenterReadout.textContent = "None selected";
  if (getHexagonCenterXInputValue() === null) hexagonCenterXInput.value = "0";
  if (getHexagonCenterYInputValue() === null) hexagonCenterYInput.value = "0";
  hexagonToolMessage.textContent =
    centerMode === "point"
      ? "Select an existing point for the center."
      : "Enter the center coordinates, size across flats, and corner radius.";
  if (getHexagonAcrossFlatsInputValue() === null) {
    hexagonAcrossFlatsInput.value = "1";
  }
  const acrossFlats = getHexagonAcrossFlatsInputValue();
  if (getHexagonCornerRadiusInputValue(acrossFlats) === null) {
    hexagonCornerRadiusInput.value = "0";
  }
  hexagonAcrossFlatsInput.setCustomValidity("");
  hexagonCornerRadiusInput.setCustomValidity("");
  hexagonCenterXInput.setCustomValidity("");
  hexagonCenterYInput.setCustomValidity("");
  updateHexagonCreateState();
  hexagonWindow.hidden = false;
  setHexagonWindowMinimized(false);
  if (!hexagonWindowState.hasPosition) positionHexagonWindowInitially();
  renderEntities();
  if (centerMode === "defined") {
    hexagonCenterXInput.focus();
    hexagonCenterXInput.select();
  }
  commandStatus.textContent =
    centerMode === "point"
      ? "Hexagon - Point Center: Select the center point."
      : "Hexagon - Define Center: Enter the center and dimensions.";
}

function handleHexagonCenterClick(event) {
  const pointElement = event.target.closest(".point-entity");
  if (!pointElement) {
    commandStatus.textContent =
      "Hexagon: Select an existing point for the center.";
    return;
  }
  const centerPoint = getPointById(Number(pointElement.dataset.entityId));
  if (!centerPoint) return;
  hexagonState.centerPointId = centerPoint.id;
  hexagonCenterReadout.textContent =
    `Point ${centerPoint.id} — X${formatCoordinate(centerPoint.x)} ` +
    `Y${formatCoordinate(centerPoint.y)}`;
  hexagonToolMessage.textContent =
    "Enter the size across flats and an optional corner radius.";
  updateHexagonCreateState();
  renderEntities();
  hexagonAcrossFlatsInput.focus();
  hexagonAcrossFlatsInput.select();
  commandStatus.textContent = `Hexagon: Center point ${centerPoint.id}; enter the dimensions.`;
}

function createHexagonFromInputs() {
  let center =
    hexagonState.centerMode === "point"
      ? getPointById(hexagonState.centerPointId)
      : null;
  if (hexagonState.centerMode === "defined") {
    const centerX = resolveArithmeticInput(hexagonCenterXInput, {
      messageElement: hexagonToolMessage,
      invalidMessage: "Enter a valid arithmetic expression for center X.",
      successMessage:
        "Enter the center coordinates, size across flats, and corner radius.",
    });
    const centerY = resolveArithmeticInput(hexagonCenterYInput, {
      messageElement: hexagonToolMessage,
      invalidMessage: "Enter a valid arithmetic expression for center Y.",
      successMessage:
        "Enter the center coordinates, size across flats, and corner radius.",
    });
    if (centerX !== null && centerY !== null) center = { x: centerX, y: centerY };
  }
  const acrossFlats = resolveArithmeticInput(hexagonAcrossFlatsInput, {
    messageElement: hexagonToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the size across flats.",
    validationMessage: (value) =>
      value > 0 ? null : "Enter a size across flats greater than zero.",
    successMessage:
      "Enter the size across flats and an optional corner radius.",
  });
  const cornerRadius = resolveArithmeticInput(hexagonCornerRadiusInput, {
    messageElement: hexagonToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the corner radius.",
    validationMessage: (value) => {
      if (value < 0) return "Enter a corner radius of zero or greater.";
      if (acrossFlats !== null && value >= acrossFlats / 2) {
        return "Corner radius must be less than half the size across flats.";
      }
      return null;
    },
    successMessage:
      "Enter the size across flats and an optional corner radius.",
  });
  if (!hexagonForm.reportValidity()) return;
  if (!center) {
    hexagonToolMessage.textContent =
      hexagonState.centerMode === "point"
        ? "Select an existing point for the center."
        : "Enter valid X and Y center coordinates.";
    return;
  }
  if (acrossFlats === null) {
    hexagonToolMessage.textContent =
      "Enter a size across flats greater than zero.";
    return;
  }
  if (cornerRadius === null || cornerRadius >= acrossFlats / 2) {
    hexagonToolMessage.textContent =
      "Corner radius must be zero or greater and less than half the size across flats.";
    return;
  }

  const result = addHexagon(center, acrossFlats, cornerRadius);
  const shapeDescription =
    cornerRadius <= GEOMETRY_EPSILON
      ? "sharp-corner hexagon"
      : `rounded hexagon with ${result.arcs.length} corner arcs`;
  const resultMessage =
    `Created ${shapeDescription} ${
      Number.isInteger(center.id)
        ? `at point ${center.id}`
        : `centered at X${formatCoordinate(center.x)} Y${formatCoordinate(center.y)}`
    }, ` +
    `${formatCoordinate(acrossFlats)} across flats` +
    (cornerRadius <= GEOMETRY_EPSILON
      ? "."
      : ` and radius ${formatCoordinate(cornerRadius)}.`);
  if (hexagonState.centerMode === "point") {
    hexagonState.centerPointId = null;
    hexagonCenterReadout.textContent = "None selected";
    hexagonCreateButton.disabled = true;
    hexagonToolMessage.textContent = `${resultMessage} Select the next center point.`;
    renderEntities();
    commandStatus.textContent = `${resultMessage} Hexagon - Point Center remains active; select the next center point.`;
  } else {
    closeHexagonWindow(resultMessage);
  }
}

function positionRectangleWindowInitially() {
  const windowBounds = rectangleWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );
  rectangleWindow.style.left = `${left}px`;
  rectangleWindow.style.top = `${top}px`;
  rectangleWindowState.hasPosition = true;
}

function setRectangleWindowMinimized(minimized) {
  rectangleWindow.classList.toggle("is-minimized", minimized);
  rectangleMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Rectangle" : "Minimize Rectangle",
  );
  rectangleMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreRectangleWindow() {
  rectangleWindow.classList.remove("is-maximized");
  if (rectangleWindowState.restoreBounds) {
    const { left, top, width } = rectangleWindowState.restoreBounds;
    rectangleWindow.style.left = `${left}px`;
    rectangleWindow.style.top = `${top}px`;
    rectangleWindow.style.width = `${width}px`;
  }
  rectangleMaximizeButton.setAttribute("aria-label", "Maximize Rectangle");
  rectangleMaximizeButton.title = "Maximize";
  rectangleMaximizeIcon.textContent = "□";
}

function toggleRectangleWindowMaximized() {
  setRectangleWindowMinimized(false);
  if (rectangleWindow.classList.contains("is-maximized")) {
    restoreRectangleWindow();
    return;
  }
  const bounds = rectangleWindow.getBoundingClientRect();
  rectangleWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  rectangleWindow.classList.add("is-maximized");
  rectangleMaximizeButton.setAttribute("aria-label", "Restore Rectangle");
  rectangleMaximizeButton.title = "Restore";
  rectangleMaximizeIcon.textContent = "❐";
}

function closeRectangleWindow(statusMessage = "Ready") {
  if (rectangleWindow.classList.contains("is-maximized")) {
    restoreRectangleWindow();
  }
  setRectangleWindowMinimized(false);
  rectangleWindow.hidden = true;
  rectangleState.active = false;
  rectangleState.centerPointId = null;
  rectangleState.centerMode = null;
  cadCanvas.classList.remove("rectangle-center");
  renderEntities();
  if (statusMessage !== null) commandStatus.textContent = statusMessage;
}

function updateRectangleCreateState() {
  const center = getCenterFromToolState(
    rectangleState,
    getRectangleCenterXInputValue,
    getRectangleCenterYInputValue,
  );
  const xSize = getRectangleXInputValue();
  const ySize = getRectangleYInputValue();
  rectangleCreateButton.disabled =
    center === null ||
    xSize === null ||
    ySize === null ||
    getRectangleRadiusInputValue(xSize, ySize) === null;
}

function activateRectangle(centerMode) {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!boltHoleCircleWindow.hidden) closeBoltHoleCircleWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  if (centerMode === "point" && !hasSelectableCenterPoint()) {
    commandStatus.textContent =
      "Rectangle - Point Center needs an existing point on the current layer.";
    return;
  }

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  rectangleState.active = true;
  rectangleState.centerPointId = null;
  rectangleState.centerMode = centerMode;
  cadCanvas.classList.toggle("rectangle-center", centerMode === "point");
  rectangleTitle.textContent =
    centerMode === "point"
      ? "Rectangle - Point Center"
      : "Rectangle - Define Center";
  rectangleCenterReadoutGroup.hidden = centerMode !== "point";
  rectangleCoordinateCenterFields.hidden = centerMode !== "defined";
  rectangleCoordinateCenterFields.disabled = centerMode !== "defined";
  rectangleCenterReadout.textContent = "None selected";
  if (getRectangleCenterXInputValue() === null) {
    rectangleCenterXInput.value = "0";
  }
  if (getRectangleCenterYInputValue() === null) {
    rectangleCenterYInput.value = "0";
  }
  if (getRectangleXInputValue() === null) rectangleXInput.value = "2.000";
  if (getRectangleYInputValue() === null) rectangleYInput.value = "1.000";
  const xSize = getRectangleXInputValue();
  const ySize = getRectangleYInputValue();
  if (getRectangleRadiusInputValue(xSize, ySize) === null) {
    rectangleRadiusInput.value = formatLengthResult(
      Math.min(0.25, Math.min(xSize, ySize) / 2),
    );
  }
  [
    rectangleCenterXInput,
    rectangleCenterYInput,
    rectangleXInput,
    rectangleYInput,
    rectangleRadiusInput,
  ].forEach((input) => input.setCustomValidity(""));
  rectangleToolMessage.textContent =
    centerMode === "point"
      ? "Select an existing point for the center."
      : "Enter the center location, overall dimensions, and corner radius.";
  updateRectangleCreateState();
  rectangleWindow.hidden = false;
  setRectangleWindowMinimized(false);
  if (!rectangleWindowState.hasPosition) positionRectangleWindowInitially();
  if (centerMode === "defined") {
    rectangleCenterXInput.focus();
    rectangleCenterXInput.select();
  }
  renderEntities();
  commandStatus.textContent =
    centerMode === "point"
      ? "Rectangle - Point Center: Select the center point."
      : "Rectangle - Define Center: Enter the center and dimensions.";
}

function handleRectangleCenterClick(event) {
  const pointElement = event.target.closest(".point-entity");
  if (!pointElement) {
    commandStatus.textContent =
      "Rectangle - Point Center: Select an existing point for the center.";
    return;
  }
  const centerPoint = getPointById(Number(pointElement.dataset.entityId));
  if (!centerPoint) return;
  rectangleState.centerPointId = centerPoint.id;
  rectangleCenterReadout.textContent =
    `Point ${centerPoint.id} — X${formatCoordinate(centerPoint.x)} ` +
    `Y${formatCoordinate(centerPoint.y)}`;
  rectangleToolMessage.textContent =
    "Enter the overall X and Y dimensions and corner radius.";
  updateRectangleCreateState();
  renderEntities();
  rectangleXInput.focus();
  rectangleXInput.select();
  commandStatus.textContent =
    `Rectangle: Center point ${centerPoint.id}; enter the dimensions.`;
}

function createRectangleFromInputs() {
  let center =
    rectangleState.centerMode === "point"
      ? getPointById(rectangleState.centerPointId)
      : null;
  if (rectangleState.centerMode === "defined") {
    const centerX = resolveArithmeticInput(rectangleCenterXInput, {
      messageElement: rectangleToolMessage,
      invalidMessage: "Enter a valid arithmetic expression for center X.",
      successMessage:
        "Enter the center location, overall dimensions, and corner radius.",
    });
    const centerY = resolveArithmeticInput(rectangleCenterYInput, {
      messageElement: rectangleToolMessage,
      invalidMessage: "Enter a valid arithmetic expression for center Y.",
      successMessage:
        "Enter the center location, overall dimensions, and corner radius.",
    });
    if (centerX !== null && centerY !== null) center = { x: centerX, y: centerY };
  }
  const xSize = resolveArithmeticInput(rectangleXInput, {
    messageElement: rectangleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for X.",
    validationMessage: (value) =>
      value > 0 ? null : "X must be greater than zero.",
    successMessage:
      "Enter the center location, overall dimensions, and corner radius.",
  });
  const ySize = resolveArithmeticInput(rectangleYInput, {
    messageElement: rectangleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for Y.",
    validationMessage: (value) =>
      value > 0 ? null : "Y must be greater than zero.",
    successMessage:
      "Enter the center location, overall dimensions, and corner radius.",
  });
  const radius = resolveArithmeticInput(rectangleRadiusInput, {
    messageElement: rectangleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the radius.",
    validationMessage: (value) => {
      if (value < 0) return "Radius must be zero or greater.";
      if (
        Number.isFinite(xSize) &&
        Number.isFinite(ySize) &&
        value > Math.min(xSize, ySize) / 2
      ) {
        return "Radius cannot exceed half of the smaller dimension.";
      }
      return null;
    },
    successMessage:
      "Enter the center location, overall dimensions, and corner radius.",
  });
  if (!rectangleForm.reportValidity()) return;
  if (
    center === null ||
    xSize === null ||
    ySize === null ||
    radius === null
  ) {
    return;
  }

  const result = addRectangle(center, xSize, ySize, radius);
  const centerDescription = Number.isInteger(center.id)
    ? `centered at point ${center.id} (X${formatCoordinate(center.x)} Y${formatCoordinate(center.y)})`
    : `centered at X${formatCoordinate(center.x)} Y${formatCoordinate(center.y)}`;
  const resultMessage =
    radius <= GEOMETRY_EPSILON
      ? `Created sharp rectangle X${formatCoordinate(xSize)} by Y${formatCoordinate(ySize)}, ${centerDescription}.`
      : `Created rectangle X${formatCoordinate(xSize)} by Y${formatCoordinate(ySize)} with R${formatCoordinate(radius)} corners (${result.lines.length} lines and ${result.arcs.length} arcs), ${centerDescription}.`;
  closeRectangleWindow(resultMessage);
}

function positionBoltHoleCircleWindowInitially() {
  const windowBounds = boltHoleCircleWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );
  boltHoleCircleWindow.style.left = `${left}px`;
  boltHoleCircleWindow.style.top = `${top}px`;
  boltHoleCircleWindowState.hasPosition = true;
}

function setBoltHoleCircleWindowMinimized(minimized) {
  boltHoleCircleWindow.classList.toggle("is-minimized", minimized);
  boltHoleCircleMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Bolt Hole Circle" : "Minimize Bolt Hole Circle",
  );
  boltHoleCircleMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreBoltHoleCircleWindow() {
  boltHoleCircleWindow.classList.remove("is-maximized");
  if (boltHoleCircleWindowState.restoreBounds) {
    const { left, top, width } = boltHoleCircleWindowState.restoreBounds;
    boltHoleCircleWindow.style.left = `${left}px`;
    boltHoleCircleWindow.style.top = `${top}px`;
    boltHoleCircleWindow.style.width = `${width}px`;
  }
  boltHoleCircleMaximizeButton.setAttribute(
    "aria-label",
    "Maximize Bolt Hole Circle",
  );
  boltHoleCircleMaximizeButton.title = "Maximize";
  boltHoleCircleMaximizeIcon.textContent = "□";
}

function toggleBoltHoleCircleWindowMaximized() {
  setBoltHoleCircleWindowMinimized(false);
  if (boltHoleCircleWindow.classList.contains("is-maximized")) {
    restoreBoltHoleCircleWindow();
    return;
  }
  const bounds = boltHoleCircleWindow.getBoundingClientRect();
  boltHoleCircleWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  boltHoleCircleWindow.classList.add("is-maximized");
  boltHoleCircleMaximizeButton.setAttribute(
    "aria-label",
    "Restore Bolt Hole Circle",
  );
  boltHoleCircleMaximizeButton.title = "Restore";
  boltHoleCircleMaximizeIcon.textContent = "❐";
}

function closeBoltHoleCircleWindow(statusMessage = "Ready") {
  if (boltHoleCircleWindow.classList.contains("is-maximized")) {
    restoreBoltHoleCircleWindow();
  }
  setBoltHoleCircleWindowMinimized(false);
  boltHoleCircleWindow.hidden = true;
  boltHoleCircleState.active = false;
  boltHoleCircleState.centerPointId = null;
  boltHoleCircleState.centerMode = null;
  cadCanvas.classList.remove("bolt-hole-circle-center");
  renderEntities();
  if (statusMessage !== null) commandStatus.textContent = statusMessage;
}

function updateBoltHoleCircleCreateState() {
  const center = getCenterFromToolState(
    boltHoleCircleState,
    getBoltHoleCircleCenterXInputValue,
    getBoltHoleCircleCenterYInputValue,
  );
  boltHoleCircleCreateButton.disabled =
    center === null ||
    getBoltHoleDiameterInputValue() === null ||
    getBoltHoleCountInputValue() === null ||
    getBoltHoleFeatureDiameterInputValue() === null;
}

function activateBoltHoleCircle(centerMode) {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!rectangleWindow.hidden) closeRectangleWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  if (centerMode === "point" && !hasSelectableCenterPoint()) {
    commandStatus.textContent =
      "Bolt Hole Circle - Point Center needs an existing point on the current layer.";
    return;
  }

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  boltHoleCircleState.active = true;
  boltHoleCircleState.centerPointId = null;
  boltHoleCircleState.centerMode = centerMode;
  cadCanvas.classList.toggle(
    "bolt-hole-circle-center",
    centerMode === "point",
  );
  boltHoleCircleTitle.textContent =
    centerMode === "point"
      ? "Bolt Hole Circle - Point Center"
      : "Bolt Hole Circle - Define Center";
  boltHoleCircleCenterReadoutGroup.hidden = centerMode !== "point";
  boltHoleCircleCoordinateCenterFields.hidden = centerMode !== "defined";
  boltHoleCircleCoordinateCenterFields.disabled = centerMode !== "defined";
  boltHoleCircleCenterReadout.textContent = "None selected";
  if (getBoltHoleCircleCenterXInputValue() === null) {
    boltHoleCircleCenterXInput.value = "0";
  }
  if (getBoltHoleCircleCenterYInputValue() === null) {
    boltHoleCircleCenterYInput.value = "0";
  }
  if (getBoltHoleDiameterInputValue() === null) {
    boltHoleDiameterInput.value = "3.000";
  }
  if (getBoltHoleCountInputValue() === null) {
    boltHoleCountInput.value = "6";
  }
  if (getBoltHoleFeatureDiameterInputValue() === null) {
    boltHoleFeatureDiameterInput.value = "0";
  }
  [
    boltHoleCircleCenterXInput,
    boltHoleCircleCenterYInput,
    boltHoleDiameterInput,
    boltHoleCountInput,
    boltHoleFeatureDiameterInput,
  ].forEach((input) => input.setCustomValidity(""));
  boltHoleCircleToolMessage.textContent =
    centerMode === "point"
      ? "Select an existing point for the center."
      : "Enter the center and pattern dimensions; the first hole is at 0°.";
  updateBoltHoleCircleCreateState();
  boltHoleCircleWindow.hidden = false;
  setBoltHoleCircleWindowMinimized(false);
  if (!boltHoleCircleWindowState.hasPosition) {
    positionBoltHoleCircleWindowInitially();
  }
  if (centerMode === "defined") {
    boltHoleCircleCenterXInput.focus();
    boltHoleCircleCenterXInput.select();
  }
  renderEntities();
  commandStatus.textContent =
    centerMode === "point"
      ? "Bolt Hole Circle - Point Center: Select the center point."
      : "Bolt Hole Circle - Define Center: Enter the center and pattern dimensions.";
}

function handleBoltHoleCircleCenterClick(event) {
  const pointElement = event.target.closest(".point-entity");
  if (!pointElement) {
    commandStatus.textContent =
      "Bolt Hole Circle - Point Center: Select an existing point for the center.";
    return;
  }
  const centerPoint = getPointById(Number(pointElement.dataset.entityId));
  if (!centerPoint) return;
  boltHoleCircleState.centerPointId = centerPoint.id;
  boltHoleCircleCenterReadout.textContent =
    `Point ${centerPoint.id} — X${formatCoordinate(centerPoint.x)} ` +
    `Y${formatCoordinate(centerPoint.y)}`;
  boltHoleCircleToolMessage.textContent =
    "Enter the pattern dimensions; the first hole is at 0°.";
  updateBoltHoleCircleCreateState();
  renderEntities();
  boltHoleDiameterInput.focus();
  boltHoleDiameterInput.select();
  commandStatus.textContent =
    `Bolt Hole Circle: Center point ${centerPoint.id}; enter the pattern dimensions.`;
}

function createBoltHoleCircleFromInputs() {
  let center =
    boltHoleCircleState.centerMode === "point"
      ? getPointById(boltHoleCircleState.centerPointId)
      : null;
  if (boltHoleCircleState.centerMode === "defined") {
    const centerX = resolveArithmeticInput(boltHoleCircleCenterXInput, {
      messageElement: boltHoleCircleToolMessage,
      invalidMessage: "Enter a valid arithmetic expression for center X.",
      successMessage:
        "Enter the center and pattern dimensions; the first hole is at 0°.",
    });
    const centerY = resolveArithmeticInput(boltHoleCircleCenterYInput, {
      messageElement: boltHoleCircleToolMessage,
      invalidMessage: "Enter a valid arithmetic expression for center Y.",
      successMessage:
        "Enter the center and pattern dimensions; the first hole is at 0°.",
    });
    if (centerX !== null && centerY !== null) center = { x: centerX, y: centerY };
  }
  const boltHoleDiameter = resolveArithmeticInput(boltHoleDiameterInput, {
    messageElement: boltHoleCircleToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the bolt hole diameter.",
    validationMessage: (value) =>
      value > 0 ? null : "Bolt hole diameter must be greater than zero.",
    successMessage: "Enter the pattern dimensions; the first hole is at 0°.",
  });
  const holeCount = resolveArithmeticInput(boltHoleCountInput, {
    messageElement: boltHoleCircleToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the number of holes.",
    validationMessage: (value) =>
      Number.isSafeInteger(value) && value > 0 && value <= MAX_BOLT_HOLE_COUNT
        ? null
        : `Number of holes must be a whole number from 1 to ${MAX_BOLT_HOLE_COUNT}.`,
    successMessage: "Enter the pattern dimensions; the first hole is at 0°.",
  });
  const holeDiameter = resolveArithmeticInput(boltHoleFeatureDiameterInput, {
    messageElement: boltHoleCircleToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the hole diameter.",
    validationMessage: (value) =>
      value >= 0 ? null : "Hole diameter must be zero or greater.",
    successMessage: "Enter the pattern dimensions; the first hole is at 0°.",
  });
  if (!boltHoleCircleForm.reportValidity()) return;
  if (
    center === null ||
    boltHoleDiameter === null ||
    holeCount === null ||
    holeDiameter === null
  ) {
    return;
  }

  addBoltHoleCircle(center, boltHoleDiameter, holeCount, holeDiameter);
  const featureDescription =
    holeDiameter === 0
      ? `${holeCount} ${holeCount === 1 ? "point" : "points"}`
      : `${holeCount} ${holeCount === 1 ? "hole" : "holes"} at Ø${formatCoordinate(holeDiameter)}`;
  const resultMessage =
    `Created bolt hole circle with ${featureDescription} on ` +
    `Ø${formatCoordinate(boltHoleDiameter)}, centered ${
      Number.isInteger(center.id)
        ? `at point ${center.id} (X${formatCoordinate(center.x)} Y${formatCoordinate(center.y)})`
        : `at X${formatCoordinate(center.x)} Y${formatCoordinate(center.y)}`
    }; ` +
    "the first position is at 0°.";
  closeBoltHoleCircleWindow(resultMessage);
}

function positionTextWindowInitially() {
  const windowBounds = textWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );
  textWindow.style.left = `${left}px`;
  textWindow.style.top = `${top}px`;
  textWindowState.hasPosition = true;
}

function setTextWindowMinimized(minimized) {
  textWindow.classList.toggle("is-minimized", minimized);
  textMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Text" : "Minimize Text",
  );
  textMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreTextWindow() {
  textWindow.classList.remove("is-maximized");
  if (textWindowState.restoreBounds) {
    const { left, top, width } = textWindowState.restoreBounds;
    textWindow.style.left = `${left}px`;
    textWindow.style.top = `${top}px`;
    textWindow.style.width = `${width}px`;
  }
  textMaximizeButton.setAttribute("aria-label", "Maximize Text");
  textMaximizeButton.title = "Maximize";
  textMaximizeIcon.textContent = "□";
}

function toggleTextWindowMaximized() {
  setTextWindowMinimized(false);
  if (textWindow.classList.contains("is-maximized")) {
    restoreTextWindow();
    return;
  }
  const bounds = textWindow.getBoundingClientRect();
  textWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  textWindow.classList.add("is-maximized");
  textMaximizeButton.setAttribute("aria-label", "Restore Text");
  textMaximizeButton.title = "Restore";
  textMaximizeIcon.textContent = "❐";
}

function closeTextWindow(statusMessage = "Ready") {
  if (textWindow.classList.contains("is-maximized")) restoreTextWindow();
  setTextWindowMinimized(false);
  textWindow.hidden = true;
  textPlacementState.active = false;
  textPlacementState.previewWorld = null;
  cadCanvas.classList.remove("text-placement");
  renderEntities();
  if (statusMessage !== null) commandStatus.textContent = statusMessage;
}

function updateTextPlacementState() {
  const height = getTextHeightInputValue();
  const content = getTextContentInputValue();
  textHeightInput.setCustomValidity(
    height === null ? "Text height must be greater than zero." : "",
  );
  textContentInput.setCustomValidity(
    content === null ? "Enter text to place." : "",
  );
  if (textPlacementState.active) {
    textToolMessage.textContent =
      height !== null && content !== null
        ? "Move the text with the pointer, then click to place it."
        : height === null
          ? "Enter a text height greater than zero."
          : "Enter text to place.";
  }
  renderToolPreview();
}

function activateText() {
  dismissDrawMenu();
  cancelGeometryToolsForLayerChange();
  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");

  if (getTextHeightInputValue() === null) {
    textHeightInput.value = formatLengthResult(0.25);
  }
  if (!textContentInput.value.trim()) {
    textContentInput.value = "Type text here...";
  }
  textPlacementState.active = true;
  textPlacementState.previewWorld = null;
  cadCanvas.classList.add("text-placement");
  textWindow.hidden = false;
  setTextWindowMinimized(false);
  if (!textWindowState.hasPosition) positionTextWindowInitially();
  updateTextPlacementState();
  textContentInput.focus();
  textContentInput.select();
  renderEntities();
  commandStatus.textContent =
    "Text: Enter the text and height, then move the pointer onto the drawing.";
}

function addTextEntity(position, height, content) {
  recordDocumentChange("Create text");
  const textEntity = {
    id: documentModel.nextEntityId,
    type: "text",
    layerId: documentModel.currentLayerId,
    x: position.x,
    y: position.y,
    height,
    content,
  };
  documentModel.nextEntityId += 1;
  documentModel.entities.push(textEntity);
  renderEntities();
  return textEntity;
}

function handleTextPlacementClick(event) {
  const height = resolveArithmeticInput(textHeightInput, {
    messageElement: textToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the text height.",
    validationMessage: (value) =>
      value > 0 ? null : "Text height must be greater than zero.",
    successMessage: "Move the text with the pointer, then click to place it.",
  });
  const content = getTextContentInputValue();
  textContentInput.setCustomValidity(content ? "" : "Enter text to place.");
  if (!textForm.reportValidity() || height === null || content === null) return;

  const position = screenToWorld(event);
  const textEntity = addTextEntity(position, height, content);
  closeTextWindow(
    `Created text ${textEntity.id} at X${formatCoordinate(position.x)} Y${formatCoordinate(position.y)}.`,
  );
}

function getOffsetAmount() {
  const amount = getArithmeticInputValue(offsetAmountInput);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function dismissModifyMenu() {
  modifyMenuItem.classList.add("is-dismissed");
  document.activeElement?.blur();
}

function positionOffsetWindowInitially() {
  const windowBounds = offsetWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );

  offsetWindow.style.left = `${left}px`;
  offsetWindow.style.top = `${top}px`;
  offsetWindowState.hasPosition = true;
}

function setOffsetWindowMinimized(minimized) {
  offsetWindow.classList.toggle("is-minimized", minimized);
  offsetMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Offset" : "Minimize Offset",
  );
  offsetMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreOffsetWindow() {
  offsetWindow.classList.remove("is-maximized");

  if (offsetWindowState.restoreBounds) {
    const { left, top, width } = offsetWindowState.restoreBounds;
    offsetWindow.style.left = `${left}px`;
    offsetWindow.style.top = `${top}px`;
    offsetWindow.style.width = `${width}px`;
  }

  offsetMaximizeButton.setAttribute("aria-label", "Maximize Offset");
  offsetMaximizeButton.title = "Maximize";
  offsetMaximizeIcon.textContent = "□";
}

function toggleOffsetWindowMaximized() {
  setOffsetWindowMinimized(false);

  if (offsetWindow.classList.contains("is-maximized")) {
    restoreOffsetWindow();
    return;
  }

  const bounds = offsetWindow.getBoundingClientRect();
  offsetWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  offsetWindow.classList.add("is-maximized");
  offsetMaximizeButton.setAttribute("aria-label", "Restore Offset");
  offsetMaximizeButton.title = "Restore";
  offsetMaximizeIcon.textContent = "❐";
}

function closeOffsetWindow(statusMessage = "Ready") {
  if (offsetWindow.classList.contains("is-maximized")) {
    restoreOffsetWindow();
  }

  setOffsetWindowMinimized(false);
  offsetWindow.hidden = true;
  offsetState.active = false;
  offsetState.sourceEntityId = null;
  cadCanvas.classList.remove("offset-entity");
  renderEntities();

  if (statusMessage !== null) {
    commandStatus.textContent = statusMessage;
  }
}

function activateOffset() {
  dismissModifyMenu();
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  const offsettableCount = documentModel.entities.filter(
    (entity) => entity.type === "line" || entity.type === "circle",
  ).length;
  if (offsettableCount < 1) {
    commandStatus.textContent = "Offset needs an existing line or circle.";
    return;
  }

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  cadCanvas.classList.remove("select-single");
  offsetState.active = true;
  offsetState.sourceEntityId = null;
  cadCanvas.classList.add("offset-entity");
  offsetSourceReadout.textContent = "None selected";
  offsetToolMessage.textContent =
    "Enter an amount, then select a line or circle.";
  if (getOffsetAmount() === null) offsetAmountInput.value = "0.25";
  offsetAmountInput.setCustomValidity("");
  offsetWindow.hidden = false;
  setOffsetWindowMinimized(false);

  if (!offsetWindowState.hasPosition) {
    positionOffsetWindowInitially();
  }

  renderEntities();
  offsetAmountInput.focus();
  offsetAmountInput.select();
  commandStatus.textContent = "Offset: Select a line or circle.";
}

function deactivateTrimExtend(statusMessage) {
  trimExtendState.active = false;
  trimExtendState.sourceEntityId = null;
  trimExtendState.endpointProperty = null;
  trimExtendState.sourcePickWorld = null;
  cadCanvas.classList.remove("trim-extend");
  cadCanvas.classList.remove("trim-extend-source-pick");
  renderEntities();

  if (statusMessage) {
    commandStatus.textContent = statusMessage;
  }
}

function resetTrimExtendSource(statusMessage) {
  trimExtendState.sourceEntityId = null;
  trimExtendState.endpointProperty = null;
  trimExtendState.sourcePickWorld = null;
  cadCanvas.classList.add("trim-extend-source-pick");
  renderEntities();
  commandStatus.textContent = statusMessage;
}

function activateTrimExtend() {
  dismissModifyMenu();
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  const sourceEntityCount = documentModel.entities.filter(
    (entity) => entity.type === "line" || entity.type === "circle",
  ).length;
  if (sourceEntityCount < 1) {
    commandStatus.textContent = "Trim/Extend needs an existing line or circle.";
    return;
  }

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  cadCanvas.classList.remove("select-single");
  trimExtendState.active = true;
  trimExtendState.sourceEntityId = null;
  trimExtendState.endpointProperty = null;
  trimExtendState.sourcePickWorld = null;
  cadCanvas.classList.add("trim-extend");
  cadCanvas.classList.add("trim-extend-source-pick");
  renderEntities();
  commandStatus.textContent =
    "Trim/Extend: Select a line near the endpoint to keep, or select the circle portion to keep.";
}

function trimCircleToArc(sourceCircle, targetEntity) {
  const centerPoint = getPointById(sourceCircle.centerPointId);
  const keepPoint = trimExtendState.sourcePickWorld;
  if (!centerPoint || !keepPoint) {
    deactivateTrimExtend("Trim/Extend canceled: source circle is not usable.");
    return;
  }

  let intersections = [];
  if (targetEntity.type === "point") {
    commandStatus.textContent =
      "A circle needs two cut points to create an arc; choose an intersecting line or circle.";
    return;
  }

  if (targetEntity.type === "line") {
    const targetEndpoints = getLineEndpointPair(targetEntity);
    if (!targetEndpoints) {
      commandStatus.textContent = "Trim/Extend: The target line is not usable.";
      return;
    }
    intersections = intersectInfiniteLineCircle(
      targetEndpoints.startPoint,
      targetEndpoints.endPoint,
      centerPoint,
      sourceCircle.radius,
    ).points;
  } else if (targetEntity.type === "circle") {
    const targetCenter = getPointById(targetEntity.centerPointId);
    if (!targetCenter) {
      commandStatus.textContent =
        "Trim/Extend: The target circle is not usable.";
      return;
    }
    intersections = intersectCircles(
      centerPoint,
      sourceCircle.radius,
      targetCenter,
      targetEntity.radius,
    ).points;
  }

  if (intersections.length !== 2) {
    commandStatus.textContent =
      "A circle needs two distinct intersections with the target to create an arc.";
    return;
  }

  let startWorld = intersections[0];
  let endWorld = intersections[1];
  const startAngle = Math.atan2(
    startWorld.y - centerPoint.y,
    startWorld.x - centerPoint.x,
  );
  const endAngle = Math.atan2(
    endWorld.y - centerPoint.y,
    endWorld.x - centerPoint.x,
  );
  const keepAngle = Math.atan2(
    keepPoint.y - centerPoint.y,
    keepPoint.x - centerPoint.x,
  );
  if (!isAngleOnCounterClockwiseArc(keepAngle, startAngle, endAngle)) {
    [startWorld, endWorld] = [endWorld, startWorld];
  }

  recordDocumentChange(`Trim circle ${sourceCircle.id} to arc`);
  const startPoint = getOrCreatePointWithoutHistory(startWorld);
  const endPoint = getOrCreatePointWithoutHistory(endWorld);
  sourceCircle.type = "arc";
  sourceCircle.startPointId = startPoint.id;
  sourceCircle.endPointId = endPoint.id;

  resetTrimExtendSource(
    `Trimmed circle ${sourceCircle.id} into arc ${sourceCircle.id} with endpoint points ` +
      `${startPoint.id} and ${endPoint.id}. Trim/Extend remains active; select the next line or circle.`,
  );
}

function handleTrimExtendClick(event) {
  if (trimExtendState.sourceEntityId === null) {
    const sourceElement = event.target.closest(".line-entity, .circle-entity");
    if (!sourceElement) {
      commandStatus.textContent =
        "Trim/Extend: The first entity must be a line or circle.";
      return;
    }

    const sourceEntity = getEntityById(Number(sourceElement.dataset.entityId));
    const clickWorld = screenToWorld(event);
    if (!sourceEntity) return;

    trimExtendState.sourceEntityId = sourceEntity.id;
    if (sourceEntity.type === "line") {
      const endpoints = getLineEndpointPair(sourceEntity);
      if (!endpoints) {
        trimExtendState.sourceEntityId = null;
        commandStatus.textContent =
          "Trim/Extend: The selected line is not usable.";
        return;
      }
      const keepStart =
        squaredDistance(clickWorld, endpoints.startPoint) <=
        squaredDistance(clickWorld, endpoints.endPoint);
      trimExtendState.endpointProperty = keepStart
        ? "endPointId"
        : "startPointId";
      trimExtendState.sourcePickWorld = null;
      const retainedPoint = keepStart
        ? endpoints.startPoint
        : endpoints.endPoint;
      commandStatus.textContent =
        `Trim/Extend: Line ${sourceEntity.id}, point ${retainedPoint.id} will be kept; ` +
        "choose a target point, line, or circle for the opposite endpoint.";
    } else {
      const centerPoint = getPointById(sourceEntity.centerPointId);
      if (!centerPoint) {
        trimExtendState.sourceEntityId = null;
        commandStatus.textContent =
          "Trim/Extend: The selected circle is not usable.";
        return;
      }
      trimExtendState.endpointProperty = null;
      trimExtendState.sourcePickWorld = {
        x: clickWorld.x,
        y: clickWorld.y,
      };
      commandStatus.textContent =
        `Trim/Extend: Circle ${sourceEntity.id} selected; choose an intersecting line or circle. ` +
        "The portion nearest the first click will be kept.";
    }

    cadCanvas.classList.remove("trim-extend-source-pick");
    renderEntities();
    return;
  }

  const targetElement = event.target.closest(
    ".point-entity, .line-entity, .circle-entity",
  );
  if (!targetElement) {
    commandStatus.textContent =
      "Trim/Extend: Choose a target point, line, or circle.";
    return;
  }

  const sourceEntity = getEntityById(trimExtendState.sourceEntityId);
  if (!sourceEntity) {
    deactivateTrimExtend("Trim/Extend canceled: source entity is missing.");
    return;
  }

  const targetEntity = getEntityById(Number(targetElement.dataset.entityId));
  if (!targetEntity) {
    commandStatus.textContent = "Trim/Extend: The target entity is missing.";
    return;
  }
  if (targetEntity.id === sourceEntity.id) {
    commandStatus.textContent =
      "Trim/Extend: Choose a different entity as the target.";
    return;
  }

  if (sourceEntity.type === "circle") {
    trimCircleToArc(sourceEntity, targetEntity);
    return;
  }

  const sourceLine = sourceEntity;
  const endpointProperty = trimExtendState.endpointProperty;
  const endpoints = getLineEndpointPair(sourceLine);
  if (sourceLine.type !== "line" || !endpointProperty || !endpoints) {
    deactivateTrimExtend("Trim/Extend canceled: source line is not usable.");
    return;
  }

  const movingStart = endpointProperty === "startPointId";
  const activePoint = movingStart ? endpoints.startPoint : endpoints.endPoint;
  const retainedPoint = movingStart ? endpoints.endPoint : endpoints.startPoint;
  const direction = {
    x: activePoint.x - retainedPoint.x,
    y: activePoint.y - retainedPoint.y,
  };
  const lineLength = Math.hypot(direction.x, direction.y);
  if (lineLength <= GEOMETRY_EPSILON) {
    commandStatus.textContent =
      "Trim/Extend: The selected line has no usable length.";
    return;
  }

  let targetPoint = null;
  let targetPointId = null;
  let targetParameter = null;

  if (targetEntity.type === "point") {
    const targetOffset = {
      x: targetEntity.x - retainedPoint.x,
      y: targetEntity.y - retainedPoint.y,
    };
    const distanceFromLine =
      Math.abs(crossProduct(direction, targetOffset)) / lineLength;
    if (distanceFromLine > 1e-7) {
      commandStatus.textContent = "Target point is not on the selected line.";
      return;
    }

    targetPoint = targetEntity;
    targetPointId = targetEntity.id;
    targetParameter = getPointOnRayParameter(
      retainedPoint,
      direction,
      targetEntity,
    );
  } else if (targetEntity.type === "line") {
    const targetEndpoints = getLineEndpointPair(targetEntity);
    if (!targetEndpoints) {
      commandStatus.textContent = "Trim/Extend: The target line is not usable.";
      return;
    }

    const result = intersectInfiniteLines(
      retainedPoint,
      direction,
      targetEndpoints.startPoint,
      targetEndpoints.endPoint,
    );
    if (!result.point) {
      commandStatus.textContent =
        result.kind === "parallel"
          ? "Trim/Extend: The selected lines are parallel or collinear."
          : "Trim/Extend: The target line is not usable.";
      return;
    }
    targetPoint = result.point;
    targetParameter = result.parameter;
  } else if (targetEntity.type === "circle") {
    const centerPoint = getPointById(targetEntity.centerPointId);
    if (!centerPoint) {
      commandStatus.textContent =
        "Trim/Extend: The target circle has no center point.";
      return;
    }

    const candidates = intersectRayCircle(
      retainedPoint,
      direction,
      centerPoint,
      targetEntity.radius,
    );
    if (!candidates.length) {
      commandStatus.textContent =
        "Trim/Extend: The selected line does not reach the target circle in that direction.";
      return;
    }
    const chosenCandidate = [...candidates].sort(
      (first, second) =>
        Math.abs(first.parameter - 1) - Math.abs(second.parameter - 1),
    )[0];
    targetPoint = chosenCandidate.point;
    targetParameter = chosenCandidate.parameter;
  }

  if (
    !targetPoint ||
    targetParameter === null ||
    targetParameter <= GEOMETRY_EPSILON
  ) {
    commandStatus.textContent =
      "Trim/Extend: The target is beyond the line's opposite endpoint.";
    return;
  }

  if (Math.abs(targetParameter - 1) <= 1e-7) {
    resetTrimExtendSource(
      `Line ${sourceLine.id} already ends at the target. Select the next line to trim or extend.`,
    );
    return;
  }

  const action = targetParameter < 1 ? "Trim" : "Extend";
  const resultWord = action === "Trim" ? "Trimmed" : "Extended";
  recordDocumentChange(`${action} line ${sourceLine.id}`);

  let endpointPoint =
    targetPointId === null ? findExistingPointAt(targetPoint) : targetEntity;
  if (!endpointPoint) {
    endpointPoint = {
      id: documentModel.nextEntityId,
      type: "point",
      layerId: documentModel.currentLayerId,
      x: targetPoint.x,
      y: targetPoint.y,
    };
    documentModel.nextEntityId += 1;
    documentModel.entities.push(endpointPoint);
  }
  const lineEndpoint = createConstructionPointWithoutHistory(targetPoint);
  sourceLine[endpointProperty] = lineEndpoint.id;
  pruneUnusedConstructionPoints();

  resetTrimExtendSource(
    `${resultWord} line ${sourceLine.id} to point ${endpointPoint.id}. ` +
      "Trim/Extend remains active; select the next line.",
  );
}

function handleOffsetClick(event) {
  const amount = getOffsetAmount();
  if (amount === null) {
    offsetToolMessage.textContent = "Enter an offset amount greater than zero.";
    commandStatus.textContent = "Offset: Enter a positive offset amount.";
    offsetAmountInput.focus();
    offsetAmountInput.select();
    return;
  }

  if (offsetState.sourceEntityId === null) {
    const entityElement = event.target.closest(".line-entity, .circle-entity");
    if (!entityElement) {
      commandStatus.textContent =
        "Offset: Select a line or circle; points are not supported.";
      return;
    }

    const entityId = Number(entityElement.dataset.entityId);
    const sourceEntity = getEntityById(entityId);
    if (!sourceEntity) return;

    offsetState.sourceEntityId = entityId;
    const entityName = sourceEntity.type === "line" ? "Line" : "Circle";
    offsetSourceReadout.textContent = `${entityName} ${entityId}`;
    offsetToolMessage.textContent =
      sourceEntity.type === "line"
        ? "Click the side where the parallel line should be created."
        : "Click inside to shrink or outside to enlarge the circle.";
    renderEntities();
    commandStatus.textContent = `Offset: ${entityName} ${entityId} selected; click the desired side.`;
    return;
  }

  const sourceEntity = getEntityById(offsetState.sourceEntityId);
  if (!sourceEntity) {
    closeOffsetWindow("Offset canceled: source entity missing.");
    return;
  }

  const sidePoint = screenToWorld(event);
  let resultMessage;
  if (sourceEntity.type === "line") {
    const startPoint = getPointById(sourceEntity.startPointId);
    const endPoint = getPointById(sourceEntity.endPointId);
    if (!startPoint || !endPoint) {
      closeOffsetWindow("Offset canceled: line endpoints are missing.");
      return;
    }

    const direction = {
      x: endPoint.x - startPoint.x,
      y: endPoint.y - startPoint.y,
    };
    const lineLength = Math.hypot(direction.x, direction.y);
    if (lineLength <= GEOMETRY_EPSILON) {
      offsetToolMessage.textContent = "This line has no usable length.";
      commandStatus.textContent = "Offset: Degenerate line cannot be offset.";
      return;
    }

    const clickVector = {
      x: sidePoint.x - startPoint.x,
      y: sidePoint.y - startPoint.y,
    };
    const signedSide = crossProduct(direction, clickVector) / lineLength;
    if (Math.abs(signedSide) <= 1e-6) {
      offsetToolMessage.textContent =
        "Click clearly on one side of the selected line.";
      commandStatus.textContent = "Offset: Choose one side of the line.";
      return;
    }

    const sideSign = Math.sign(signedSide);
    const offsetVector = {
      x: (-direction.y / lineLength) * amount * sideSign,
      y: (direction.x / lineLength) * amount * sideSign,
    };
    const result = addOffsetLine(
      { x: startPoint.x + offsetVector.x, y: startPoint.y + offsetVector.y },
      { x: endPoint.x + offsetVector.x, y: endPoint.y + offsetVector.y },
    );
    resultMessage =
      `Created offset line ${result.line.id} with endpoint points ` +
      `${result.startPoint.id} and ${result.endPoint.id}.`;
  } else {
    const centerPoint = getPointById(sourceEntity.centerPointId);
    if (!centerPoint) {
      closeOffsetWindow("Offset canceled: circle center is missing.");
      return;
    }

    const clickRadius = Math.hypot(
      sidePoint.x - centerPoint.x,
      sidePoint.y - centerPoint.y,
    );
    const sideTolerance = 0.02 / viewState.zoom;
    if (Math.abs(clickRadius - sourceEntity.radius) <= sideTolerance) {
      offsetToolMessage.textContent =
        "Click clearly inside or outside the selected circle.";
      commandStatus.textContent =
        "Offset: Choose inside or outside the circle.";
      return;
    }

    const isOutside = clickRadius > sourceEntity.radius;
    const nextRadius = isOutside
      ? sourceEntity.radius + amount
      : sourceEntity.radius - amount;
    if (nextRadius <= GEOMETRY_EPSILON) {
      offsetToolMessage.textContent =
        "That inward offset would make the circle radius zero or negative.";
      commandStatus.textContent =
        "Offset: Inward amount is too large for this circle.";
      return;
    }

    const circle = addOffsetCircle(sourceEntity.centerPointId, nextRadius);
    resultMessage =
      `Created ${isOutside ? "outside" : "inside"} offset circle ${circle.id} ` +
      `with radius ${formatCoordinate(nextRadius)}.`;
  }

  offsetState.sourceEntityId = null;
  offsetSourceReadout.textContent = "None selected";
  offsetToolMessage.textContent = `${resultMessage} Select the next line or circle.`;
  renderEntities();
  commandStatus.textContent = `${resultMessage} Offset remains active; select the next line or circle.`;
}

function positionFilletWindowInitially() {
  const windowBounds = filletWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );
  filletWindow.style.left = `${left}px`;
  filletWindow.style.top = `${top}px`;
  filletWindowState.hasPosition = true;
}

function setFilletWindowMinimized(minimized) {
  filletWindow.classList.toggle("is-minimized", minimized);
  filletMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Fillet Radius" : "Minimize Fillet Radius",
  );
  filletMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreFilletWindow() {
  filletWindow.classList.remove("is-maximized");
  if (filletWindowState.restoreBounds) {
    const { left, top, width } = filletWindowState.restoreBounds;
    filletWindow.style.left = `${left}px`;
    filletWindow.style.top = `${top}px`;
    filletWindow.style.width = `${width}px`;
  }
  filletMaximizeButton.setAttribute("aria-label", "Maximize Fillet Radius");
  filletMaximizeButton.title = "Maximize";
  filletMaximizeIcon.textContent = "□";
}

function toggleFilletWindowMaximized() {
  setFilletWindowMinimized(false);
  if (filletWindow.classList.contains("is-maximized")) {
    restoreFilletWindow();
    return;
  }
  const bounds = filletWindow.getBoundingClientRect();
  filletWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  filletWindow.classList.add("is-maximized");
  filletMaximizeButton.setAttribute("aria-label", "Restore Fillet Radius");
  filletMaximizeButton.title = "Restore";
  filletMaximizeIcon.textContent = "❐";
}

function deactivateFillet(statusMessage) {
  filletState.active = false;
  filletState.firstEntityId = null;
  filletState.firstPickWorld = null;
  cadCanvas.classList.remove("fillet-entity");
  if (filletWindow.classList.contains("is-maximized")) {
    restoreFilletWindow();
  }
  setFilletWindowMinimized(false);
  filletWindow.hidden = true;
  renderEntities();
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function resetFilletFirst(statusMessage) {
  filletState.firstEntityId = null;
  filletState.firstPickWorld = null;
  filletSourceReadout.textContent = "None selected";
  filletToolMessage.textContent =
    "Select the first line, circle, or arc near the intended fillet.";
  renderEntities();
  commandStatus.textContent = statusMessage;
}

function activateFillet() {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  const eligibleCount = documentModel.entities.filter((entity) =>
    ["line", "circle", "arc"].includes(entity.type),
  ).length;
  if (eligibleCount < 2) {
    commandStatus.textContent =
      "Fillet Radius needs at least two line, circle, or arc entities.";
    return;
  }

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  cadCanvas.classList.remove("select-single");
  filletState.active = true;
  filletState.firstEntityId = null;
  filletState.firstPickWorld = null;
  cadCanvas.classList.add("fillet-entity");
  filletSourceReadout.textContent = "None selected";
  filletToolMessage.textContent =
    "Enter a radius, then select the first entity near the intended fillet.";
  if (getFilletRadiusInputValue() === null) filletRadiusInput.value = "0.25";
  filletRadiusInput.setCustomValidity("");
  filletTrimExtendInput.checked = true;
  filletWindow.hidden = false;
  setFilletWindowMinimized(false);
  if (!filletWindowState.hasPosition) positionFilletWindowInitially();
  renderEntities();
  filletRadiusInput.focus();
  filletRadiusInput.select();
  commandStatus.textContent = "Fillet Radius: Select the first entity.";
}

function handleFilletClick(event) {
  const radius = resolveArithmeticInput(filletRadiusInput, {
    messageElement: filletToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the fillet radius.",
    validationMessage: (value) =>
      value > 0 ? null : "Enter a fillet radius greater than zero.",
    successMessage: () =>
      filletState.firstEntityId === null
        ? "Select the first line, circle, or arc near the intended fillet."
        : "Select the second line, circle, or arc near the intended fillet.",
  });
  if (radius === null) {
    commandStatus.textContent = "Fillet Radius: Enter a positive radius.";
    filletRadiusInput.focus();
    filletRadiusInput.select();
    return;
  }

  const entityElement = event.target.closest(
    ".line-entity, .circle-entity, .arc-entity",
  );
  if (!entityElement) {
    commandStatus.textContent =
      filletState.firstEntityId === null
        ? "Fillet Radius: Select the first line, circle, or arc."
        : "Fillet Radius: Select the second line, circle, or arc.";
    return;
  }

  const entity = getEntityById(Number(entityElement.dataset.entityId));
  if (!entity) return;
  const pickWorld = screenToWorld(event);
  if (filletState.firstEntityId === null) {
    filletState.firstEntityId = entity.id;
    filletState.firstPickWorld = { x: pickWorld.x, y: pickWorld.y };
    filletSourceReadout.textContent = `${entity.type[0].toUpperCase()}${entity.type.slice(1)} ${entity.id}`;
    filletToolMessage.textContent =
      "Select the second entity near the intended fillet.";
    renderEntities();
    commandStatus.textContent = `Fillet Radius: ${entity.type} ${entity.id} selected; choose the second entity.`;
    return;
  }

  const firstEntity = getEntityById(filletState.firstEntityId);
  if (!firstEntity) {
    resetFilletFirst(
      "Fillet Radius: The first entity is missing; select again.",
    );
    return;
  }
  if (entity.id === firstEntity.id) {
    commandStatus.textContent =
      "Fillet Radius: Choose a different second entity.";
    return;
  }

  const candidate = getFilletCandidate(
    firstEntity,
    entity,
    filletState.firstPickWorld,
    pickWorld,
    radius,
    filletTrimExtendInput.checked,
  );
  if (!candidate) {
    filletToolMessage.textContent = filletTrimExtendInput.checked
      ? "No tangent fillet was found for that radius and those selections."
      : "No tangent fillet fits on both existing entity spans. Enable Trim/Extend or choose another radius.";
    commandStatus.textContent =
      "Fillet Radius: No valid tangent solution; choose another second entity or radius.";
    return;
  }

  const filletArc = createFilletEntity(
    firstEntity,
    entity,
    filletState.firstPickWorld,
    pickWorld,
    candidate,
    radius,
    filletTrimExtendInput.checked,
  );
  const trimDescription = filletTrimExtendInput.checked
    ? " Automatic Trim/Extend was applied to eligible line and arc endpoints."
    : " The source entities were left unchanged.";
  resetFilletFirst(
    `Created fillet arc ${filletArc.id} with radius ${formatCoordinate(radius)}.` +
      trimDescription +
      " Fillet Radius remains active.",
  );
}

function positionRotateWindowInitially() {
  const windowBounds = rotateWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );
  rotateWindow.style.left = `${left}px`;
  rotateWindow.style.top = `${top}px`;
  rotateWindowState.hasPosition = true;
}

function setRotateWindowMinimized(minimized) {
  rotateWindow.classList.toggle("is-minimized", minimized);
  rotateMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Rotate" : "Minimize Rotate",
  );
  rotateMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreRotateWindow() {
  rotateWindow.classList.remove("is-maximized");
  if (rotateWindowState.restoreBounds) {
    const { left, top, width } = rotateWindowState.restoreBounds;
    rotateWindow.style.left = `${left}px`;
    rotateWindow.style.top = `${top}px`;
    rotateWindow.style.width = `${width}px`;
  }
  rotateMaximizeButton.setAttribute("aria-label", "Maximize Rotate");
  rotateMaximizeButton.title = "Maximize";
  rotateMaximizeIcon.textContent = "□";
}

function toggleRotateWindowMaximized() {
  setRotateWindowMinimized(false);
  if (rotateWindow.classList.contains("is-maximized")) {
    restoreRotateWindow();
    return;
  }
  const bounds = rotateWindow.getBoundingClientRect();
  rotateWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  rotateWindow.classList.add("is-maximized");
  rotateMaximizeButton.setAttribute("aria-label", "Restore Rotate");
  rotateMaximizeButton.title = "Restore";
  rotateMaximizeIcon.textContent = "❐";
}

function deactivateRotate(statusMessage) {
  const wasActive = rotateState.active;
  rotateState.active = false;
  rotateState.entityId = null;
  rotateState.solidIds = [];
  rotateState.pivotPointId = null;
  rotateState.awaitingPivot = false;
  cadCanvas.classList.remove("rotate-active");
  cadCanvas.classList.remove("rotate-pivot-pick");
  if (rotateWindow.classList.contains("is-maximized")) {
    restoreRotateWindow();
  }
  setRotateWindowMinimized(false);
  rotateWindow.hidden = true;
  if (
    wasActive &&
    !is3dWorkspace() &&
    getEntityById(selectionState.selectedEntityId)
  ) {
    selectionState.mode = "single";
    cadCanvas.classList.add("select-single");
  }
  renderEntities();
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function describeRotateEntity(entity) {
  return `${entity.type[0].toUpperCase()}${entity.type.slice(1)} ${entity.id}`;
}

function beginRotatePivotSelection() {
  if (!rotateState.active) return;
  rotatePivotPointInput.checked = true;
  rotateChoosePointButton.disabled = false;
  rotateState.pivotPointId = null;
  rotateState.awaitingPivot = true;
  rotatePivotReadout.textContent = "Click an existing point";
  rotateToolMessage.textContent =
    "Click an existing point on the drawing to set the rotation pivot.";
  cadCanvas.classList.add("rotate-pivot-pick");
  commandStatus.textContent = "Rotate: Select an existing pivot point.";
}

function useRotateOrigin() {
  rotateState.pivotPointId = null;
  rotateState.awaitingPivot = false;
  rotateChoosePointButton.disabled = true;
  rotatePivotReadout.textContent = "X0 Y0";
  rotateToolMessage.textContent =
    "Enter a counterclockwise angle, then choose Rotate.";
  cadCanvas.classList.remove("rotate-pivot-pick");
  commandStatus.textContent = "Rotate: Using X0 Y0 as the pivot.";
}

function activateRotate() {
  dismissModifyMenu();
  deactivatePointSketch();
  if (is3dWorkspace()) {
    const selectedSolids = getSelectedModelSolids().filter((solid) =>
      isEntityOnCurrentLayer(solid),
    );
    if (!selectedSolids.length) {
      commandStatus.textContent =
        "Rotate needs one or more selected 3D solids.";
      return;
    }
    if (!translateWindow.hidden) closeTranslateWindow(null);
    rotateState.active = true;
    rotateState.entityId = null;
    rotateState.solidIds = selectedSolids.map((solid) => solid.id);
    rotateState.pivotPointId = null;
    rotateState.awaitingPivot = false;
    rotateAxisXInput.checked = true;
    rotateSelectionReadout.textContent =
      `${selectedSolids.length} selected ` +
      `${selectedSolids.length === 1 ? "solid" : "solids"}`;
    rotateToolMessage.textContent =
      "Choose an origin axis and enter a counterclockwise angle.";
    rotateAngleInput.setCustomValidity("");
    rotateWindow.hidden = false;
    setRotateWindowMinimized(false);
    if (!rotateWindowState.hasPosition) positionRotateWindowInitially();
    rotateAngleInput.focus();
    rotateAngleInput.select();
    commandStatus.textContent =
      `Rotate: ${selectedSolids.length} ` +
      `${selectedSolids.length === 1 ? "solid" : "solids"} selected.`;
    return;
  }
  const selectedEntity = getEntityById(selectionState.selectedEntityId);
  if (!selectedEntity) {
    commandStatus.textContent =
      "Rotate needs an entity selected with Select - Single.";
    return;
  }

  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  selectionState.mode = null;
  cadCanvas.classList.remove("select-single");
  rotateState.active = true;
  rotateState.entityId = selectedEntity.id;
  rotateState.pivotPointId = null;
  rotateState.awaitingPivot = false;
  cadCanvas.classList.add("rotate-active");
  cadCanvas.classList.remove("rotate-pivot-pick");
  rotateSelectionReadout.textContent = describeRotateEntity(selectedEntity);
  rotatePivotOriginInput.checked = true;
  rotateChoosePointButton.disabled = true;
  rotatePivotReadout.textContent = "X0 Y0";
  rotateToolMessage.textContent =
    "Enter a counterclockwise angle, then choose Rotate.";
  rotateAngleInput.setCustomValidity("");
  rotateWindow.hidden = false;
  setRotateWindowMinimized(false);
  if (!rotateWindowState.hasPosition) positionRotateWindowInitially();
  renderEntities();
  rotateAngleInput.focus();
  rotateAngleInput.select();
  commandStatus.textContent = `Rotate: ${describeRotateEntity(selectedEntity)} around X0 Y0.`;
}

function handleRotatePivotClick(event) {
  const pointElement = event.target.closest(".point-entity");
  if (!pointElement) {
    commandStatus.textContent = "Rotate: Select an existing pivot point.";
    return;
  }
  const point = getPointById(Number(pointElement.dataset.entityId));
  if (!point) return;
  rotateState.pivotPointId = point.id;
  rotateState.awaitingPivot = false;
  cadCanvas.classList.remove("rotate-pivot-pick");
  rotatePivotReadout.textContent = `Point ${point.id}: X${formatCoordinate(point.x)} Y${formatCoordinate(point.y)}`;
  rotateToolMessage.textContent =
    "Enter a counterclockwise angle, then choose Rotate.";
  commandStatus.textContent = `Rotate: Point ${point.id} selected as the pivot.`;
  rotateAngleInput.focus();
  rotateAngleInput.select();
}

function rotateWorldPoint(worldPoint, pivot, radians) {
  const rawCosine = Math.cos(radians);
  const rawSine = Math.sin(radians);
  const cosine = Math.abs(rawCosine) <= 1e-12 ? 0 : rawCosine;
  const sine = Math.abs(rawSine) <= 1e-12 ? 0 : rawSine;
  const relativeX = worldPoint.x - pivot.x;
  const relativeY = worldPoint.y - pivot.y;
  const x = pivot.x + relativeX * cosine - relativeY * sine;
  const y = pivot.y + relativeX * sine + relativeY * cosine;
  return {
    x: Math.abs(x) <= 1e-12 ? 0 : x,
    y: Math.abs(y) <= 1e-12 ? 0 : y,
  };
}

function rotateSelectedEntity() {
  const angleDegrees = resolveArithmeticInput(rotateAngleInput, {
    messageElement: rotateToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the angle.",
    successMessage: "Enter a counterclockwise angle, then choose Rotate.",
  });
  if (angleDegrees === null) {
    commandStatus.textContent = "Rotate: Enter a valid angle.";
    rotateAngleInput.focus();
    rotateAngleInput.select();
    return;
  }

  if (is3dWorkspace()) {
    const selectedSolids = rotateState.solidIds
      .map((solidId) => getSolidById(solidId))
      .filter(
        (solid) => solid && isEntityOnCurrentLayer(solid),
      );
    if (!selectedSolids.length) {
      deactivateRotate(
        "Rotate canceled: the selected solids no longer exist.",
      );
      return;
    }
    if (Math.abs(angleDegrees) <= GEOMETRY_EPSILON) {
      rotateToolMessage.textContent = "Enter a nonzero rotation angle.";
      commandStatus.textContent = "Rotate: No solid changed.";
      return;
    }
    const axis = rotateAxisYInput.checked
      ? "y"
      : rotateAxisZInput.checked
        ? "z"
        : "x";
    const radians = (angleDegrees * Math.PI) / 180;
    recordDocumentChange(
      `Rotate ${selectedSolids.length} ` +
        `${selectedSolids.length === 1 ? "solid" : "solids"} ` +
        `${formatArithmeticResult(angleDegrees)}° around ${axis.toUpperCase()} axis`,
    );
    selectedSolids.forEach((solid) => {
      prependSolidTransform(solid, getAxisRotationMatrix4(axis, radians));
    });
    renderEntities();
    const resultMessage =
      `Rotated ${selectedSolids.length} selected ` +
      `${selectedSolids.length === 1 ? "solid" : "solids"} ` +
      `${formatArithmeticResult(angleDegrees)}° around the ${axis.toUpperCase()} axis.`;
    rotateToolMessage.textContent = resultMessage;
    commandStatus.textContent = resultMessage;
    return;
  }

  const entity = getEntityById(rotateState.entityId);
  if (!entity) {
    deactivateRotate("Rotate canceled: the selected entity no longer exists.");
    return;
  }

  let pivot = ORIGIN;
  let pivotDescription = "X0 Y0";
  if (rotatePivotPointInput.checked) {
    const pivotPoint = getPointById(rotateState.pivotPointId);
    if (!pivotPoint) {
      beginRotatePivotSelection();
      rotateToolMessage.textContent =
        "Choose an existing point before rotating around a specified point.";
      return;
    }
    pivot = pivotPoint;
    pivotDescription = `point ${pivotPoint.id}`;
  }

  const radians = (angleDegrees * Math.PI) / 180;
  const pointProperties = [];
  if (entity.type === "point") {
    pointProperties.push({ property: null, point: entity });
  } else if (entity.type === "line") {
    pointProperties.push(
      { property: "startPointId", point: getPointById(entity.startPointId) },
      { property: "endPointId", point: getPointById(entity.endPointId) },
    );
  } else if (entity.type === "circle") {
    pointProperties.push({
      property: "centerPointId",
      point: getPointById(entity.centerPointId),
    });
  } else if (entity.type === "arc") {
    pointProperties.push(
      { property: "centerPointId", point: getPointById(entity.centerPointId) },
      { property: "startPointId", point: getPointById(entity.startPointId) },
      { property: "endPointId", point: getPointById(entity.endPointId) },
    );
  }

  if (!pointProperties.length || pointProperties.some(({ point }) => !point)) {
    rotateToolMessage.textContent =
      "The selected entity has unusable geometry.";
    commandStatus.textContent =
      "Rotate: The selected entity could not be rotated.";
    return;
  }

  const transformations = pointProperties.map(({ property, point }) => ({
    property,
    point,
    rotated: rotateWorldPoint(point, pivot, radians),
  }));
  const changed = transformations.some(
    ({ point, rotated }) =>
      Math.hypot(point.x - rotated.x, point.y - rotated.y) > GEOMETRY_EPSILON,
  );
  if (!changed) {
    rotateToolMessage.textContent = `That rotation leaves ${describeRotateEntity(entity)} unchanged.`;
    commandStatus.textContent = "Rotate: No geometry changed.";
    return;
  }

  recordDocumentChange(`Rotate ${entity.type} ${entity.id}`);
  if (entity.type === "point") {
    entity.x = transformations[0].rotated.x;
    entity.y = transformations[0].rotated.y;
  } else {
    transformations.forEach(({ property, point, rotated }) => {
      entity[property] = point.isConstruction
        ? createConstructionPointWithoutHistory(rotated).id
        : getOrCreatePointWithoutHistory(rotated).id;
    });
  }

  pruneUnusedConstructionPoints();
  renderEntities();
  const angleText = formatArithmeticResult(angleDegrees);
  const resultMessage =
    `Rotated ${entity.type} ${entity.id} ${angleText}° counterclockwise ` +
    `around ${pivotDescription}.`;
  rotateToolMessage.textContent = resultMessage;
  commandStatus.textContent = resultMessage;
}

function mirrorWorldPoint(worldPoint, axisMode) {
  let x = worldPoint.x;
  let y = worldPoint.y;
  if (axisMode === "x") y = -y;
  else if (axisMode === "y") x = -x;
  else if (axisMode === "both") {
    x = -x;
    y = -y;
  }
  return {
    x: Math.abs(x) <= 1e-12 ? 0 : x,
    y: Math.abs(y) <= 1e-12 ? 0 : y,
  };
}

function getEntityPointProperties(entity) {
  if (entity.type === "point") {
    return [{ property: null, point: entity }];
  }
  if (entity.type === "line") {
    return [
      { property: "startPointId", point: getPointById(entity.startPointId) },
      { property: "endPointId", point: getPointById(entity.endPointId) },
    ];
  }
  if (entity.type === "circle") {
    return [
      { property: "centerPointId", point: getPointById(entity.centerPointId) },
    ];
  }
  if (entity.type === "arc") {
    return [
      { property: "centerPointId", point: getPointById(entity.centerPointId) },
      { property: "startPointId", point: getPointById(entity.startPointId) },
      { property: "endPointId", point: getPointById(entity.endPointId) },
    ];
  }
  return [];
}

function mirrorAngleRadians(angle, axisMode) {
  const mirroredDirection = mirrorWorldPoint(
    { x: Math.cos(angle), y: Math.sin(angle) },
    axisMode,
  );
  return normalizeAngle(Math.atan2(mirroredDirection.y, mirroredDirection.x));
}

function getMirroredDimensionEntity(entity, axisMode) {
  const mirrored = { ...entity };
  if (entity.dimensionType === "linear") {
    const start = mirrorWorldPoint(
      { x: entity.startX, y: entity.startY },
      axisMode,
    );
    const end = mirrorWorldPoint({ x: entity.endX, y: entity.endY }, axisMode);
    const dimensionStart = mirrorWorldPoint(
      { x: entity.dimensionStartX, y: entity.dimensionStartY },
      axisMode,
    );
    const dimensionEnd = mirrorWorldPoint(
      { x: entity.dimensionEndX, y: entity.dimensionEndY },
      axisMode,
    );
    Object.assign(mirrored, {
      startX: start.x,
      startY: start.y,
      endX: end.x,
      endY: end.y,
      dimensionStartX: dimensionStart.x,
      dimensionStartY: dimensionStart.y,
      dimensionEndX: dimensionEnd.x,
      dimensionEndY: dimensionEnd.y,
    });
    return mirrored;
  }

  if (
    entity.dimensionType === "radius" ||
    entity.dimensionType === "diameter"
  ) {
    const center = mirrorWorldPoint(
      { x: entity.centerX, y: entity.centerY },
      axisMode,
    );
    mirrored.centerX = center.x;
    mirrored.centerY = center.y;
    mirrored.angle = mirrorAngleRadians(entity.angle, axisMode);
    return mirrored;
  }

  if (entity.dimensionType === "angle") {
    const center = mirrorWorldPoint(
      { x: entity.centerX, y: entity.centerY },
      axisMode,
    );
    let startAngle = mirrorAngleRadians(entity.startAngle, axisMode);
    let endAngle = mirrorAngleRadians(entity.endAngle, axisMode);
    if (axisMode !== "both") {
      [startAngle, endAngle] = [endAngle, startAngle];
    }
    mirrored.centerX = center.x;
    mirrored.centerY = center.y;
    mirrored.startAngle = startAngle;
    mirrored.endAngle = endAngle;
    return mirrored;
  }

  return null;
}

function isEntityMirrorable(entity) {
  if (entity.type === "dimension") {
    return getMirroredDimensionEntity(entity, "both") !== null;
  }
  const pointProperties = getEntityPointProperties(entity);
  return (
    pointProperties.length > 0 &&
    pointProperties.every(
      ({ point }) =>
        point && Number.isFinite(point.x) && Number.isFinite(point.y),
    )
  );
}

function getSelectedMirrorEntities() {
  return documentModel.entities.filter(
    (entity) =>
      selectionState.selectedEntityIds.has(entity.id) &&
      isEntityOnCurrentLayer(entity) &&
      (entity.type !== "point" || !entity.isConstruction),
  );
}

function selectionChangesUnderMirror(selectedEntities, axisMode) {
  return selectedEntities.some((entity) => {
    if (entity.type === "dimension") {
      const mirrored = getMirroredDimensionEntity(entity, axisMode);
      return mirrored && JSON.stringify(mirrored) !== JSON.stringify(entity);
    }
    return getEntityPointProperties(entity).some(({ point }) => {
      const mirrored = mirrorWorldPoint(point, axisMode);
      return (
        Math.hypot(point.x - mirrored.x, point.y - mirrored.y) >
        GEOMETRY_EPSILON
      );
    });
  });
}

function addMirroredSelectionCopies(selectedEntities, axisMode) {
  const selectedEntityIdSet = new Set(
    selectedEntities.map((entity) => entity.id),
  );
  const copiedPointIdBySourceId = new Map();
  const copiedRootIds = [];

  function getOrCreateMirroredPointCopy(sourcePointId) {
    if (copiedPointIdBySourceId.has(sourcePointId)) {
      return copiedPointIdBySourceId.get(sourcePointId);
    }
    const sourcePoint = getPointById(sourcePointId);
    if (!sourcePoint) return null;
    const mirrored = mirrorWorldPoint(sourcePoint, axisMode);
    const pointCopy = {
      id: documentModel.nextEntityId,
      type: "point",
      layerId: documentModel.currentLayerId,
      x: mirrored.x,
      y: mirrored.y,
    };
    if (!selectedEntityIdSet.has(sourcePointId)) {
      pointCopy.isConstruction = true;
    }
    documentModel.nextEntityId += 1;
    documentModel.entities.push(pointCopy);
    copiedPointIdBySourceId.set(sourcePointId, pointCopy.id);
    return pointCopy.id;
  }

  selectedEntities.forEach((entity) => {
    if (entity.type === "point") {
      const copiedPointId = getOrCreateMirroredPointCopy(entity.id);
      if (copiedPointId !== null) copiedRootIds.push(copiedPointId);
      return;
    }

    if (entity.type === "dimension") {
      const dimensionCopy = getMirroredDimensionEntity(entity, axisMode);
      if (!dimensionCopy) return;
      dimensionCopy.id = documentModel.nextEntityId;
      dimensionCopy.layerId = documentModel.currentLayerId;
      documentModel.nextEntityId += 1;
      documentModel.entities.push(dimensionCopy);
      copiedRootIds.push(dimensionCopy.id);
      return;
    }

    const entityCopy = {
      ...entity,
      id: documentModel.nextEntityId,
      layerId: documentModel.currentLayerId,
    };
    documentModel.nextEntityId += 1;
    getEntityPointProperties(entity).forEach(({ property, point }) => {
      entityCopy[property] = getOrCreateMirroredPointCopy(point.id);
    });
    if (entity.type === "arc" && axisMode !== "both") {
      [entityCopy.startPointId, entityCopy.endPointId] = [
        entityCopy.endPointId,
        entityCopy.startPointId,
      ];
    }
    documentModel.entities.push(entityCopy);
    copiedRootIds.push(entityCopy.id);
  });

  return copiedRootIds;
}

function mirrorSelectedEntities(axisMode) {
  dismissModifyMenu();
  const axisDescription =
    is3dWorkspace()
      ? axisMode === "x"
        ? "XY plane"
        : axisMode === "y"
          ? "XZ plane"
          : "YZ plane"
      : axisMode === "x"
        ? "X axis"
        : axisMode === "y"
          ? "Y axis"
          : "X and Y axes";
  if (is3dWorkspace()) {
    const selectedSolids = getSelectedModelSolids().filter((solid) =>
      isEntityOnCurrentLayer(solid),
    );
    if (!selectedSolids.length) {
      commandStatus.textContent =
        `Mirror - ${axisDescription}: Select one or more solids first.`;
      return;
    }
    const reflectedCoordinate =
      axisMode === "x" ? "z" : axisMode === "y" ? "y" : "x";
    const changesSelection = selectedSolids.some((solid) =>
      getSolidWorldVertices(solid).some(
        (vertex) =>
          Math.abs(vertex[reflectedCoordinate]) > GEOMETRY_EPSILON,
      ),
    );
    if (!changesSelection && !mirrorCopyInput.checked) {
      commandStatus.textContent =
        `Mirror - ${axisDescription}: The selected solids already lie on that plane.`;
      return;
    }
    const copySelection = mirrorCopyInput.checked;
    recordDocumentChange(
      `${copySelection ? "Mirror and copy" : "Mirror"} ` +
        `${selectedSolids.length} ${selectedSolids.length === 1 ? "solid" : "solids"} ` +
        `across ${axisDescription}`,
    );
    if (copySelection) clearModelSelection();
    selectedSolids.forEach((sourceSolid) => {
      const solid = copySelection
        ? clonePlainModelValue(sourceSolid)
        : sourceSolid;
      prependSolidTransform(solid, getReflectionMatrix4(reflectedCoordinate));
      if (copySelection) {
        solid.id = documentModel.model3d.nextSolidId;
        solid.layerId = documentModel.currentLayerId;
        documentModel.model3d.nextSolidId += 1;
        documentModel.model3d.solids.push(solid);
        modelSelectionState.selectedSolidIds.add(solid.id);
      }
    });
    renderEntities();
    commandStatus.textContent =
      `${copySelection ? "Mirrored and copied" : "Mirrored"} ` +
      `${selectedSolids.length} selected ` +
      `${selectedSolids.length === 1 ? "solid" : "solids"} ` +
      `across the ${axisDescription}.`;
    return;
  }

  const selectedEntities = getSelectedMirrorEntities();
  if (!selectedEntities.length) {
    commandStatus.textContent = `Mirror - ${axisDescription}: Select one or more entities first.`;
    return;
  }
  if (selectedEntities.some((entity) => !isEntityMirrorable(entity))) {
    commandStatus.textContent = `Mirror - ${axisDescription}: The selection contains unusable geometry.`;
    return;
  }

  const entityWord = selectedEntities.length === 1 ? "entity" : "entities";
  if (mirrorCopyInput.checked) {
    recordDocumentChange(
      `Mirror and copy ${selectedEntities.length} ${entityWord} across ${axisDescription}`,
    );
    const copiedRootIds = addMirroredSelectionCopies(
      selectedEntities,
      axisMode,
    );
    selectionState.selectedEntityIds.clear();
    copiedRootIds.forEach((entityId) =>
      selectionState.selectedEntityIds.add(entityId),
    );
    selectionState._selectedEntityId =
      copiedRootIds.length === 1 ? copiedRootIds[0] : null;
    selectionState.hoveredEntityId = null;
    selectionState.pickCycle = null;
    renderEntities();
    commandStatus.textContent =
      `Mirrored and copied ${selectedEntities.length} selected ${entityWord} ` +
      `across the ${axisDescription}.`;
    return;
  }

  if (!selectionChangesUnderMirror(selectedEntities, axisMode)) {
    commandStatus.textContent = `Mirror - ${axisDescription}: The selected geometry already lies on that axis.`;
    return;
  }

  const selectedEntityIds = new Set(
    selectedEntities.map((entity) => entity.id),
  );
  const selectedPointIds = new Set(
    selectedEntities
      .filter((entity) => entity.type === "point")
      .map((entity) => entity.id),
  );
  const movingSelectedPointIds = new Set(
    [...selectedPointIds].filter((pointId) => {
      const point = getPointById(pointId);
      const mirrored = mirrorWorldPoint(point, axisMode);
      return (
        Math.hypot(point.x - mirrored.x, point.y - mirrored.y) >
        GEOMETRY_EPSILON
      );
    }),
  );
  const sourcePointById = new Map();
  selectedEntities.forEach((entity) => {
    getEntityPointProperties(entity).forEach(({ point }) => {
      sourcePointById.set(point.id, { x: point.x, y: point.y });
    });
  });

  recordDocumentChange(
    `Mirror ${selectedEntities.length} ${entityWord} across ${axisDescription}`,
  );
  detachEntityReferencesFromPoints(selectedEntityIds, movingSelectedPointIds);
  movingSelectedPointIds.forEach((pointId) => {
    const point = getPointById(pointId);
    const mirrored = mirrorWorldPoint(point, axisMode);
    point.x = mirrored.x;
    point.y = mirrored.y;
  });

  const mirroredReferenceIdBySourceId = new Map();
  function getMirroredReferenceId(sourcePointId) {
    if (selectedPointIds.has(sourcePointId)) return sourcePointId;
    if (mirroredReferenceIdBySourceId.has(sourcePointId)) {
      return mirroredReferenceIdBySourceId.get(sourcePointId);
    }
    const sourcePoint = sourcePointById.get(sourcePointId);
    const mirroredReference = createConstructionPointWithoutHistory(
      mirrorWorldPoint(sourcePoint, axisMode),
    );
    mirroredReferenceIdBySourceId.set(sourcePointId, mirroredReference.id);
    return mirroredReference.id;
  }

  selectedEntities.forEach((entity) => {
    if (entity.type === "point") return;
    if (entity.type === "dimension") {
      Object.assign(entity, getMirroredDimensionEntity(entity, axisMode));
      return;
    }
    getEntityPointProperties(entity).forEach(({ property, point }) => {
      entity[property] = getMirroredReferenceId(point.id);
    });
    if (entity.type === "arc" && axisMode !== "both") {
      [entity.startPointId, entity.endPointId] = [
        entity.endPointId,
        entity.startPointId,
      ];
    }
  });

  pruneUnusedConstructionPoints();
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  renderEntities();
  commandStatus.textContent =
    `Mirrored ${selectedEntities.length} selected ${entityWord} ` +
    `across the ${axisDescription}.`;
}

function positionTranslateWindowInitially() {
  const windowBounds = translateWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );
  translateWindow.style.left = `${left}px`;
  translateWindow.style.top = `${top}px`;
  translateWindowState.hasPosition = true;
}

function setTranslateWindowMinimized(minimized) {
  translateWindow.classList.toggle("is-minimized", minimized);
  translateMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Translate" : "Minimize Translate",
  );
  translateMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreTranslateWindow() {
  translateWindow.classList.remove("is-maximized");
  if (translateWindowState.restoreBounds) {
    const { left, top, width } = translateWindowState.restoreBounds;
    translateWindow.style.left = `${left}px`;
    translateWindow.style.top = `${top}px`;
    translateWindow.style.width = `${width}px`;
  }
  translateMaximizeButton.setAttribute("aria-label", "Maximize Translate");
  translateMaximizeButton.title = "Maximize";
  translateMaximizeIcon.textContent = "□";
}

function toggleTranslateWindowMaximized() {
  setTranslateWindowMinimized(false);
  if (translateWindow.classList.contains("is-maximized")) {
    restoreTranslateWindow();
    return;
  }
  const bounds = translateWindow.getBoundingClientRect();
  translateWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  translateWindow.classList.add("is-maximized");
  translateMaximizeButton.setAttribute("aria-label", "Restore Translate");
  translateMaximizeButton.title = "Restore";
  translateMaximizeIcon.textContent = "❐";
}

function closeTranslateWindow(statusMessage) {
  if (translateWindow.classList.contains("is-maximized")) {
    restoreTranslateWindow();
  }
  setTranslateWindowMinimized(false);
  translateWindow.hidden = true;
  if (!is3dWorkspace() && selectionState.selectedEntityIds.size > 0) {
    selectionState.mode = "single";
    cadCanvas.classList.add("select-single");
  }
  renderEntities();
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function getSelectedTranslateEntities() {
  return documentModel.entities.filter(
    (entity) =>
      selectionState.selectedEntityIds.has(entity.id) &&
      isEntityOnCurrentLayer(entity) &&
      (entity.type !== "point" || !entity.isConstruction),
  );
}

function activateTranslate() {
  dismissModifyMenu();
  if (is3dWorkspace()) {
    const selectedSolids = getSelectedModelSolids().filter((solid) =>
      isEntityOnCurrentLayer(solid),
    );
    if (!selectedSolids.length) {
      commandStatus.textContent =
        "Translate: Select one or more 3D solids first.";
      return;
    }
    if (rotateState.active) deactivateRotate();
    translateSelectionReadout.textContent =
      `${selectedSolids.length} selected ` +
      `${selectedSolids.length === 1 ? "solid" : "solids"}`;
    [translateXInput, translateYInput, translateZInput].forEach((input) => {
      input.value = "0";
      input.setCustomValidity("");
    });
    translateCopyInput.checked = false;
    translateToolMessage.textContent =
      "Enter the X, Y, and Z translation distances.";
    translateWindow.hidden = false;
    setTranslateWindowMinimized(false);
    if (!translateWindowState.hasPosition) positionTranslateWindowInitially();
    translateXInput.focus();
    translateXInput.select();
    commandStatus.textContent =
      `Translate: ${selectedSolids.length} ` +
      `${selectedSolids.length === 1 ? "solid" : "solids"} selected.`;
    return;
  }
  const selectedEntities = getSelectedTranslateEntities();
  if (!selectedEntities.length) {
    commandStatus.textContent = "Translate: Select one or more entities first.";
    return;
  }
  if (selectedEntities.some((entity) => !isEntityTranslatable(entity))) {
    commandStatus.textContent =
      "Translate: The selection contains unusable geometry.";
    return;
  }

  deactivatePointSketch();
  deactivateLineSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateThreeEntityCircle();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  deactivateDimension();
  deactivateWindowZoom();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!rectangleWindow.hidden) closeRectangleWindow(null);
  if (!boltHoleCircleWindow.hidden) closeBoltHoleCircleWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  selectionState.mode = null;
  cadCanvas.classList.remove("select-single");
  translateSelectionReadout.textContent =
    `${selectedEntities.length} selected ` +
    `${selectedEntities.length === 1 ? "entity" : "entities"}`;
  translateXInput.value = "0";
  translateYInput.value = "0";
  translateXInput.setCustomValidity("");
  translateYInput.setCustomValidity("");
  translateCopyInput.checked = false;
  translateToolMessage.textContent = "Enter the X and Y translation distances.";
  translateWindow.hidden = false;
  setTranslateWindowMinimized(false);
  if (!translateWindowState.hasPosition) positionTranslateWindowInitially();
  renderEntities();
  translateXInput.focus();
  translateXInput.select();
  commandStatus.textContent =
    `Translate: ${selectedEntities.length} ` +
    `${selectedEntities.length === 1 ? "entity" : "entities"} selected.`;
}

function translateWorldPoint(worldPoint, deltaX, deltaY) {
  const x = worldPoint.x + deltaX;
  const y = worldPoint.y + deltaY;
  return {
    x: Math.abs(x) <= 1e-12 ? 0 : x,
    y: Math.abs(y) <= 1e-12 ? 0 : y,
  };
}

function getTranslatedDimensionEntity(entity, deltaX, deltaY) {
  const translated = { ...entity };
  if (entity.dimensionType === "linear") {
    translated.startX += deltaX;
    translated.startY += deltaY;
    translated.endX += deltaX;
    translated.endY += deltaY;
    translated.dimensionStartX += deltaX;
    translated.dimensionStartY += deltaY;
    translated.dimensionEndX += deltaX;
    translated.dimensionEndY += deltaY;
    return translated;
  }
  if (
    entity.dimensionType === "radius" ||
    entity.dimensionType === "diameter" ||
    entity.dimensionType === "angle"
  ) {
    translated.centerX += deltaX;
    translated.centerY += deltaY;
    return translated;
  }
  return null;
}

function isEntityTranslatable(entity) {
  if (entity.type === "dimension") {
    return getTranslatedDimensionEntity(entity, 0, 0) !== null;
  }
  const pointProperties = getEntityPointProperties(entity);
  return (
    pointProperties.length > 0 &&
    pointProperties.every(
      ({ point }) =>
        point && Number.isFinite(point.x) && Number.isFinite(point.y),
    )
  );
}

function addTranslatedSelectionCopies(selectedEntities, deltaX, deltaY) {
  const selectedEntityIdSet = new Set(
    selectedEntities.map((entity) => entity.id),
  );
  const copiedPointIdBySourceId = new Map();
  const copiedRootIds = [];

  function getOrCreateTranslatedPointCopy(sourcePointId) {
    if (copiedPointIdBySourceId.has(sourcePointId)) {
      return copiedPointIdBySourceId.get(sourcePointId);
    }
    const sourcePoint = getPointById(sourcePointId);
    if (!sourcePoint) return null;
    const translatedPoint = translateWorldPoint(sourcePoint, deltaX, deltaY);
    const pointCopy = {
      id: documentModel.nextEntityId,
      type: "point",
      layerId: documentModel.currentLayerId,
      x: translatedPoint.x,
      y: translatedPoint.y,
    };
    if (!selectedEntityIdSet.has(sourcePointId)) {
      pointCopy.isConstruction = true;
    }
    documentModel.nextEntityId += 1;
    documentModel.entities.push(pointCopy);
    copiedPointIdBySourceId.set(sourcePointId, pointCopy.id);
    return pointCopy.id;
  }

  selectedEntities.forEach((entity) => {
    if (entity.type === "point") {
      const copiedPointId = getOrCreateTranslatedPointCopy(entity.id);
      if (copiedPointId !== null) copiedRootIds.push(copiedPointId);
      return;
    }
    if (entity.type === "dimension") {
      const dimensionCopy = getTranslatedDimensionEntity(
        entity,
        deltaX,
        deltaY,
      );
      if (!dimensionCopy) return;
      dimensionCopy.id = documentModel.nextEntityId;
      dimensionCopy.layerId = documentModel.currentLayerId;
      documentModel.nextEntityId += 1;
      documentModel.entities.push(dimensionCopy);
      copiedRootIds.push(dimensionCopy.id);
      return;
    }

    const entityCopy = {
      ...entity,
      id: documentModel.nextEntityId,
      layerId: documentModel.currentLayerId,
    };
    documentModel.nextEntityId += 1;
    getEntityPointProperties(entity).forEach(({ property, point }) => {
      entityCopy[property] = getOrCreateTranslatedPointCopy(point.id);
    });
    documentModel.entities.push(entityCopy);
    copiedRootIds.push(entityCopy.id);
  });

  return copiedRootIds;
}

function applyTranslationToSelection(
  selectedEntities,
  deltaX,
  deltaY,
  copySelection,
  historyLabel,
) {
  recordDocumentChange(historyLabel);
  if (copySelection) {
    const copiedRootIds = addTranslatedSelectionCopies(
      selectedEntities,
      deltaX,
      deltaY,
    );
    selectionState.selectedEntityIds.clear();
    copiedRootIds.forEach((entityId) =>
      selectionState.selectedEntityIds.add(entityId),
    );
    selectionState._selectedEntityId =
      copiedRootIds.length === 1 ? copiedRootIds[0] : null;
    selectionState.hoveredEntityId = null;
    selectionState.pickCycle = null;
    return { copiedRootIds };
  }

  const selectedEntityIds = new Set(
    selectedEntities.map((entity) => entity.id),
  );
  const selectedPointIds = new Set(
    selectedEntities
      .filter((entity) => entity.type === "point")
      .map((entity) => entity.id),
  );
  const sourcePointById = new Map();
  selectedEntities.forEach((entity) => {
    getEntityPointProperties(entity).forEach(({ point }) => {
      sourcePointById.set(point.id, { x: point.x, y: point.y });
    });
  });

  detachEntityReferencesFromPoints(selectedEntityIds, selectedPointIds);
  selectedPointIds.forEach((pointId) => {
    const point = getPointById(pointId);
    const translatedPoint = translateWorldPoint(point, deltaX, deltaY);
    point.x = translatedPoint.x;
    point.y = translatedPoint.y;
  });

  const translatedReferenceIdBySourceId = new Map();
  function getTranslatedReferenceId(sourcePointId) {
    if (selectedPointIds.has(sourcePointId)) return sourcePointId;
    if (translatedReferenceIdBySourceId.has(sourcePointId)) {
      return translatedReferenceIdBySourceId.get(sourcePointId);
    }
    const sourcePoint = sourcePointById.get(sourcePointId);
    const translatedReference = createConstructionPointWithoutHistory(
      translateWorldPoint(sourcePoint, deltaX, deltaY),
    );
    translatedReferenceIdBySourceId.set(sourcePointId, translatedReference.id);
    return translatedReference.id;
  }

  selectedEntities.forEach((entity) => {
    if (entity.type === "point") return;
    if (entity.type === "dimension") {
      Object.assign(
        entity,
        getTranslatedDimensionEntity(entity, deltaX, deltaY),
      );
      return;
    }
    getEntityPointProperties(entity).forEach(({ property, point }) => {
      entity[property] = getTranslatedReferenceId(point.id);
    });
  });

  pruneUnusedConstructionPoints();
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  return { copiedRootIds: [] };
}

function translateSelectedEntities() {
  const deltaX = resolveArithmeticInput(translateXInput, {
    messageElement: translateToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for X.",
    successMessage: "Enter the X and Y translation distances.",
  });
  if (deltaX === null) {
    commandStatus.textContent = "Translate: Enter a valid X distance.";
    translateXInput.focus();
    translateXInput.select();
    return;
  }
  const deltaY = resolveArithmeticInput(translateYInput, {
    messageElement: translateToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for Y.",
    successMessage: "Enter the X and Y translation distances.",
  });
  if (deltaY === null) {
    commandStatus.textContent = "Translate: Enter a valid Y distance.";
    translateYInput.focus();
    translateYInput.select();
    return;
  }

  if (is3dWorkspace()) {
    const deltaZ = resolveArithmeticInput(translateZInput, {
      messageElement: translateToolMessage,
      invalidMessage: "Enter a valid arithmetic expression for Z.",
      successMessage: "Enter the X, Y, and Z translation distances.",
    });
    if (deltaZ === null) {
      commandStatus.textContent = "Translate: Enter a valid Z distance.";
      translateZInput.focus();
      translateZInput.select();
      return;
    }
    const selectedSolids = getSelectedModelSolids().filter((solid) =>
      isEntityOnCurrentLayer(solid),
    );
    if (!selectedSolids.length) {
      closeTranslateWindow(
        "Translate canceled: the selected solids no longer exist.",
      );
      return;
    }
    const isZeroTranslation =
      Math.abs(deltaX) <= GEOMETRY_EPSILON &&
      Math.abs(deltaY) <= GEOMETRY_EPSILON &&
      Math.abs(deltaZ) <= GEOMETRY_EPSILON;
    if (isZeroTranslation && !translateCopyInput.checked) {
      translateToolMessage.textContent =
        "Enter a nonzero X, Y, or Z distance to move the selection.";
      commandStatus.textContent = "Translate: No solid changed.";
      return;
    }
    const copySelection = translateCopyInput.checked;
    const distanceDescription =
      `X${formatLengthResult(deltaX)} Y${formatLengthResult(deltaY)} ` +
      `Z${formatLengthResult(deltaZ)}`;
    recordDocumentChange(
      `${copySelection ? "Translate and copy" : "Translate"} ` +
        `${selectedSolids.length} ${selectedSolids.length === 1 ? "solid" : "solids"} ` +
        distanceDescription,
    );
    if (copySelection) clearModelSelection();
    selectedSolids.forEach((sourceSolid) => {
      const solid = copySelection
        ? clonePlainModelValue(sourceSolid)
        : sourceSolid;
      prependSolidTransform(
        solid,
        getTranslationMatrix4(deltaX, deltaY, deltaZ),
      );
      if (copySelection) {
        solid.id = documentModel.model3d.nextSolidId;
        solid.layerId = documentModel.currentLayerId;
        documentModel.model3d.nextSolidId += 1;
        documentModel.model3d.solids.push(solid);
        modelSelectionState.selectedSolidIds.add(solid.id);
      }
    });
    closeTranslateWindow(
      `${copySelection ? "Translated and copied" : "Translated"} ` +
        `${selectedSolids.length} selected ` +
        `${selectedSolids.length === 1 ? "solid" : "solids"} by ${distanceDescription}.`,
    );
    return;
  }

  const selectedEntities = getSelectedTranslateEntities();
  if (!selectedEntities.length) {
    closeTranslateWindow("Translate canceled: the selection no longer exists.");
    return;
  }
  if (selectedEntities.some((entity) => !isEntityTranslatable(entity))) {
    translateToolMessage.textContent =
      "The selection contains unusable geometry.";
    commandStatus.textContent =
      "Translate: The selected geometry could not be translated.";
    return;
  }

  const isZeroTranslation =
    Math.abs(deltaX) <= GEOMETRY_EPSILON &&
    Math.abs(deltaY) <= GEOMETRY_EPSILON;
  if (isZeroTranslation && !translateCopyInput.checked) {
    translateToolMessage.textContent =
      "Enter a nonzero X or Y distance to move the selection.";
    commandStatus.textContent = "Translate: No geometry changed.";
    return;
  }

  const entityWord = selectedEntities.length === 1 ? "entity" : "entities";
  const distanceDescription = `X${formatLengthResult(deltaX)} Y${formatLengthResult(deltaY)}`;
  if (translateCopyInput.checked) {
    applyTranslationToSelection(
      selectedEntities,
      deltaX,
      deltaY,
      true,
      `Translate and copy ${selectedEntities.length} ${entityWord} ${distanceDescription}`,
    );
    closeTranslateWindow(
      `Translated and copied ${selectedEntities.length} selected ${entityWord} by ${distanceDescription}.`,
    );
    return;
  }

  applyTranslationToSelection(
    selectedEntities,
    deltaX,
    deltaY,
    false,
    `Translate ${selectedEntities.length} ${entityWord} ${distanceDescription}`,
  );
  closeTranslateWindow(
    `Translated ${selectedEntities.length} selected ${entityWord} by ${distanceDescription}.`,
  );
}

function positionTranslateByPointsWindowInitially() {
  const windowBounds = translateByPointsWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );
  translateByPointsWindow.style.left = `${left}px`;
  translateByPointsWindow.style.top = `${top}px`;
  translateByPointsWindowState.hasPosition = true;
}

function setTranslateByPointsWindowMinimized(minimized) {
  translateByPointsWindow.classList.toggle("is-minimized", minimized);
  translateByPointsMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Translate By Points" : "Minimize Translate By Points",
  );
  translateByPointsMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreTranslateByPointsWindow() {
  translateByPointsWindow.classList.remove("is-maximized");
  if (translateByPointsWindowState.restoreBounds) {
    const { left, top, width } = translateByPointsWindowState.restoreBounds;
    translateByPointsWindow.style.left = `${left}px`;
    translateByPointsWindow.style.top = `${top}px`;
    translateByPointsWindow.style.width = `${width}px`;
  }
  translateByPointsMaximizeButton.setAttribute(
    "aria-label",
    "Maximize Translate By Points",
  );
  translateByPointsMaximizeButton.title = "Maximize";
  translateByPointsMaximizeIcon.textContent = "□";
}

function toggleTranslateByPointsWindowMaximized() {
  setTranslateByPointsWindowMinimized(false);
  if (translateByPointsWindow.classList.contains("is-maximized")) {
    restoreTranslateByPointsWindow();
    return;
  }
  const bounds = translateByPointsWindow.getBoundingClientRect();
  translateByPointsWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  translateByPointsWindow.classList.add("is-maximized");
  translateByPointsMaximizeButton.setAttribute(
    "aria-label",
    "Restore Translate By Points",
  );
  translateByPointsMaximizeButton.title = "Restore";
  translateByPointsMaximizeIcon.textContent = "❐";
}

function closeTranslateByPointsWindow(statusMessage) {
  if (translateByPointsWindow.classList.contains("is-maximized")) {
    restoreTranslateByPointsWindow();
  }
  setTranslateByPointsWindowMinimized(false);
  translateByPointsWindow.hidden = true;
  translateByPointsState.active = false;
  translateByPointsState.entityIds = [];
  translateByPointsState.firstPointId = null;
  translateByPointsState.secondPointId = null;
  cadCanvas.classList.remove("translate-by-points");
  if (selectionState.selectedEntityIds.size > 0 && isCurrentLayerEditable()) {
    selectionState.mode = "single";
    cadCanvas.classList.add("select-single");
  }
  renderEntities();
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function getTranslateByPointsEntities() {
  return translateByPointsState.entityIds
    .map((entityId) => getEntityById(entityId))
    .filter(
      (entity) =>
        entity &&
        isEntityOnCurrentLayer(entity) &&
        (entity.type !== "point" || !entity.isConstruction),
    );
}

function describeTranslateReferencePoint(point) {
  return point
    ? `Point ${point.id}: X${formatCoordinate(point.x)} Y${formatCoordinate(point.y)}`
    : "Not selected";
}

function getTranslateByPointsVector() {
  const firstPoint = getPointById(translateByPointsState.firstPointId);
  const secondPoint = getPointById(translateByPointsState.secondPointId);
  if (!firstPoint || !secondPoint) return null;
  return {
    firstPoint,
    secondPoint,
    deltaX: secondPoint.x - firstPoint.x,
    deltaY: secondPoint.y - firstPoint.y,
  };
}

function updateTranslateByPointsReadout() {
  const firstPoint = getPointById(translateByPointsState.firstPointId);
  const secondPoint = getPointById(translateByPointsState.secondPointId);
  translateByPointsFirstReadout.textContent = firstPoint
    ? describeTranslateReferencePoint(firstPoint)
    : "Click a point";
  translateByPointsSecondReadout.textContent = secondPoint
    ? describeTranslateReferencePoint(secondPoint)
    : "Not selected";
  const vector = getTranslateByPointsVector();
  translateByPointsVectorReadout.textContent = vector
    ? `X${formatLengthResult(vector.deltaX)} Y${formatLengthResult(vector.deltaY)}`
    : "X— Y—";
  translateByPointsApplyButton.disabled = vector === null;
}

function activateTranslateByPoints() {
  dismissModifyMenu();
  const restrictionMessage = getCurrentLayerRestrictionMessage(
    "Translate - By Points",
  );
  if (restrictionMessage) {
    commandStatus.textContent = restrictionMessage;
    return;
  }

  const selectedEntities = getSelectedTranslateEntities();
  if (!selectedEntities.length) {
    commandStatus.textContent =
      "Translate - By Points: Select one or more entities first.";
    return;
  }
  if (selectedEntities.some((entity) => !isEntityTranslatable(entity))) {
    commandStatus.textContent =
      "Translate - By Points: The selection contains unusable geometry.";
    return;
  }

  deactivatePointSketch();
  deactivateLineSketch();
  deactivateLineAngle();
  deactivateLineTangent();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateThreeEntityCircle();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivatePointEnd();
  deactivateFillet();
  deactivateRotate();
  deactivateDimension();
  deactivateWindowZoom();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!rectangleWindow.hidden) closeRectangleWindow(null);
  if (!boltHoleCircleWindow.hidden) closeBoltHoleCircleWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);
  if (!pointIncrementalWindow.hidden) closePointIncrementalWindow(null);
  if (!translateWindow.hidden) closeTranslateWindow(null);

  translateByPointsState.active = true;
  translateByPointsState.entityIds = selectedEntities.map(
    (entity) => entity.id,
  );
  translateByPointsState.firstPointId = null;
  translateByPointsState.secondPointId = null;
  selectionState.mode = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  cadCanvas.classList.add("translate-by-points");
  translateByPointsSelectionReadout.textContent =
    `${selectedEntities.length} selected ` +
    `${selectedEntities.length === 1 ? "entity" : "entities"}`;
  translateByPointsCopyInput.checked = false;
  translateByPointsToolMessage.textContent =
    "Click the first reference point on the drawing.";
  updateTranslateByPointsReadout();
  translateByPointsWindow.hidden = false;
  setTranslateByPointsWindowMinimized(false);
  if (!translateByPointsWindowState.hasPosition) {
    positionTranslateByPointsWindowInitially();
  }
  renderEntities();
  commandStatus.textContent =
    "Translate - By Points: Click the first reference point.";
}

function handleTranslateByPointsClick(event) {
  const pointElement = event.target.closest(".point-entity");
  if (!pointElement) {
    commandStatus.textContent =
      translateByPointsState.firstPointId === null
        ? "Translate - By Points: Click the first reference point."
        : translateByPointsState.secondPointId === null
          ? "Translate - By Points: Click the second reference point."
          : "Translate - By Points: Choose Translate, or click a point to restart the vector.";
    return;
  }
  const point = getPointById(Number(pointElement.dataset.entityId));
  if (
    !point ||
    point.isConstruction ||
    !isEntityOnCurrentLayer(point) ||
    !isEntityLayerVisible(point)
  ) {
    commandStatus.textContent =
      "Translate - By Points: Select a visible point on the current layer.";
    return;
  }

  if (
    translateByPointsState.firstPointId === null ||
    translateByPointsState.secondPointId !== null
  ) {
    translateByPointsState.firstPointId = point.id;
    translateByPointsState.secondPointId = null;
    translateByPointsToolMessage.textContent =
      "Click the second reference point on the drawing.";
    commandStatus.textContent = `Translate - By Points: Point ${point.id} is the first reference; click the second point.`;
  } else {
    translateByPointsState.secondPointId = point.id;
    const vector = getTranslateByPointsVector();
    const vectorDescription =
      `X${formatLengthResult(vector.deltaX)} ` +
      `Y${formatLengthResult(vector.deltaY)}`;
    translateByPointsToolMessage.textContent = `Vector ${vectorDescription}. Choose Translate, or click another point to restart.`;
    commandStatus.textContent = `Translate - By Points: Vector ${vectorDescription} is ready.`;
  }
  updateTranslateByPointsReadout();
  renderEntities();
}

function applyTranslateByPoints() {
  const restrictionMessage = getCurrentLayerRestrictionMessage(
    "Translate - By Points",
  );
  if (restrictionMessage) {
    closeTranslateByPointsWindow(restrictionMessage);
    return null;
  }
  const selectedEntities = getTranslateByPointsEntities();
  if (
    selectedEntities.length !== translateByPointsState.entityIds.length ||
    selectedEntities.some((entity) => !isEntityTranslatable(entity))
  ) {
    closeTranslateByPointsWindow(
      "Translate - By Points canceled: the selected geometry is no longer available.",
    );
    return null;
  }
  const vector = getTranslateByPointsVector();
  if (!vector) {
    translateByPointsToolMessage.textContent =
      "Select both reference points before translating.";
    commandStatus.textContent =
      "Translate - By Points: Select the first and second reference points.";
    return null;
  }
  const isZeroTranslation =
    Math.abs(vector.deltaX) <= GEOMETRY_EPSILON &&
    Math.abs(vector.deltaY) <= GEOMETRY_EPSILON;
  if (isZeroTranslation && !translateByPointsCopyInput.checked) {
    translateByPointsToolMessage.textContent =
      "Choose two different point locations, or enable Copy.";
    commandStatus.textContent =
      "Translate - By Points: The selected points define no movement.";
    return null;
  }

  const entityWord = selectedEntities.length === 1 ? "entity" : "entities";
  const vectorDescription =
    `X${formatLengthResult(vector.deltaX)} ` +
    `Y${formatLengthResult(vector.deltaY)}`;
  const copySelection = translateByPointsCopyInput.checked;
  const translationResult = applyTranslationToSelection(
    selectedEntities,
    vector.deltaX,
    vector.deltaY,
    copySelection,
    `${copySelection ? "Translate and copy" : "Translate"} ` +
      `${selectedEntities.length} ${entityWord} by points ${vectorDescription}`,
  );
  closeTranslateByPointsWindow(
    `${copySelection ? "Translated and copied" : "Translated"} ` +
      `${selectedEntities.length} selected ${entityWord} by ${vectorDescription}.`,
  );
  return {
    ...translationResult,
    deltaX: vector.deltaX,
    deltaY: vector.deltaY,
  };
}

function positionPointIncrementalWindowInitially() {
  const windowBounds = pointIncrementalWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );
  pointIncrementalWindow.style.left = `${left}px`;
  pointIncrementalWindow.style.top = `${top}px`;
  pointIncrementalWindowState.hasPosition = true;
}

function setPointIncrementalWindowMinimized(minimized) {
  pointIncrementalWindow.classList.toggle("is-minimized", minimized);
  pointIncrementalMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Point Incremental" : "Minimize Point Incremental",
  );
  pointIncrementalMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restorePointIncrementalWindow() {
  pointIncrementalWindow.classList.remove("is-maximized");
  if (pointIncrementalWindowState.restoreBounds) {
    const { left, top, width } = pointIncrementalWindowState.restoreBounds;
    pointIncrementalWindow.style.left = `${left}px`;
    pointIncrementalWindow.style.top = `${top}px`;
    pointIncrementalWindow.style.width = `${width}px`;
  }
  pointIncrementalMaximizeButton.setAttribute(
    "aria-label",
    "Maximize Point Incremental",
  );
  pointIncrementalMaximizeButton.title = "Maximize";
  pointIncrementalMaximizeIcon.textContent = "□";
}

function togglePointIncrementalWindowMaximized() {
  setPointIncrementalWindowMinimized(false);
  if (pointIncrementalWindow.classList.contains("is-maximized")) {
    restorePointIncrementalWindow();
    return;
  }
  const bounds = pointIncrementalWindow.getBoundingClientRect();
  pointIncrementalWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  pointIncrementalWindow.classList.add("is-maximized");
  pointIncrementalMaximizeButton.setAttribute(
    "aria-label",
    "Restore Point Incremental",
  );
  pointIncrementalMaximizeButton.title = "Restore";
  pointIncrementalMaximizeIcon.textContent = "❐";
}

function closePointIncrementalWindow(statusMessage) {
  if (pointIncrementalWindow.classList.contains("is-maximized")) {
    restorePointIncrementalWindow();
  }
  setPointIncrementalWindowMinimized(false);
  pointIncrementalWindow.hidden = true;
  if (selectionState.selectedEntityIds.size > 0 && isCurrentLayerEditable()) {
    selectionState.mode = "single";
    cadCanvas.classList.add("select-single");
  }
  renderEntities();
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function getSelectedIncrementalPoint() {
  const selectedEntities = documentModel.entities.filter(
    (entity) =>
      selectionState.selectedEntityIds.has(entity.id) &&
      isEntityOnCurrentLayer(entity) &&
      (entity.type !== "point" || !entity.isConstruction),
  );
  return selectedEntities.length === 1 && selectedEntities[0].type === "point"
    ? selectedEntities[0]
    : null;
}

function activatePointIncremental() {
  dismissDrawMenu();
  const restrictionMessage = getCurrentLayerRestrictionMessage(
    "Point - Incremental",
  );
  if (restrictionMessage) {
    commandStatus.textContent = restrictionMessage;
    return;
  }

  const selectedPoint = getSelectedIncrementalPoint();
  if (!selectedPoint) {
    commandStatus.textContent =
      "Point - Incremental: Select exactly one point first.";
    return;
  }

  deactivatePointSketch();
  deactivateLineSketch();
  deactivateLineAngle();
  deactivateLineTangent();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateThreeEntityCircle();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivatePointEnd();
  deactivateFillet();
  deactivateRotate();
  deactivateDimension();
  deactivateWindowZoom();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!rectangleWindow.hidden) closeRectangleWindow(null);
  if (!boltHoleCircleWindow.hidden) closeBoltHoleCircleWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);
  if (!translateWindow.hidden) closeTranslateWindow(null);

  selectionState.mode = null;
  cadCanvas.classList.remove("select-single");
  pointIncrementalSelectionReadout.textContent =
    `Point ${selectedPoint.id}: X${formatCoordinate(selectedPoint.x)} ` +
    `Y${formatCoordinate(selectedPoint.y)}`;
  pointIncrementalXInput.value = "0";
  pointIncrementalYInput.value = "0";
  pointIncrementalXInput.setCustomValidity("");
  pointIncrementalYInput.setCustomValidity("");
  pointIncrementalCopyInput.checked = false;
  pointIncrementalToolMessage.textContent = "Enter the X and Y increments.";
  pointIncrementalWindow.hidden = false;
  setPointIncrementalWindowMinimized(false);
  if (!pointIncrementalWindowState.hasPosition) {
    positionPointIncrementalWindowInitially();
  }
  renderEntities();
  pointIncrementalXInput.focus();
  pointIncrementalXInput.select();
  commandStatus.textContent = `Point - Incremental: Point ${selectedPoint.id} selected.`;
}

function applyPointIncremental() {
  const deltaX = resolveArithmeticInput(pointIncrementalXInput, {
    messageElement: pointIncrementalToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for X.",
    successMessage: "Enter the X and Y increments.",
  });
  if (deltaX === null) {
    commandStatus.textContent =
      "Point - Incremental: Enter a valid X increment.";
    pointIncrementalXInput.focus();
    pointIncrementalXInput.select();
    return null;
  }
  const deltaY = resolveArithmeticInput(pointIncrementalYInput, {
    messageElement: pointIncrementalToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for Y.",
    successMessage: "Enter the X and Y increments.",
  });
  if (deltaY === null) {
    commandStatus.textContent =
      "Point - Incremental: Enter a valid Y increment.";
    pointIncrementalYInput.focus();
    pointIncrementalYInput.select();
    return null;
  }
  if (!pointIncrementalForm.reportValidity()) return null;

  const restrictionMessage = getCurrentLayerRestrictionMessage(
    "Point - Incremental",
  );
  if (restrictionMessage) {
    closePointIncrementalWindow(restrictionMessage);
    return null;
  }
  const selectedPoint = getSelectedIncrementalPoint();
  if (!selectedPoint) {
    closePointIncrementalWindow(
      "Point - Incremental canceled: the selected point is no longer available.",
    );
    return null;
  }

  const isZeroTranslation =
    Math.abs(deltaX) <= GEOMETRY_EPSILON &&
    Math.abs(deltaY) <= GEOMETRY_EPSILON;
  if (isZeroTranslation && !pointIncrementalCopyInput.checked) {
    pointIncrementalToolMessage.textContent =
      "Enter a nonzero X or Y increment to move the point.";
    commandStatus.textContent = "Point - Incremental: No point changed.";
    return null;
  }

  const distanceDescription = `X${formatLengthResult(deltaX)} Y${formatLengthResult(deltaY)}`;
  const sourcePointId = selectedPoint.id;
  if (pointIncrementalCopyInput.checked) {
    recordDocumentChange(
      `Incremental copy point ${sourcePointId} ${distanceDescription}`,
    );
    const [copiedPointId] = addTranslatedSelectionCopies(
      [selectedPoint],
      deltaX,
      deltaY,
    );
    const copiedPoint = getPointById(copiedPointId);
    selectionState.selectedEntityId = copiedPointId;
    selectionState.hoveredEntityId = null;
    selectionState.pickCycle = null;
    closePointIncrementalWindow(
      `Created point ${copiedPointId} from point ${sourcePointId} by ${distanceDescription}.`,
    );
    return copiedPoint;
  }

  recordDocumentChange(
    `Incremental move point ${sourcePointId} ${distanceDescription}`,
  );
  detachEntityReferencesFromPoints(
    new Set([sourcePointId]),
    new Set([sourcePointId]),
  );
  const translatedPoint = translateWorldPoint(selectedPoint, deltaX, deltaY);
  selectedPoint.x = translatedPoint.x;
  selectedPoint.y = translatedPoint.y;
  pruneUnusedConstructionPoints();
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  closePointIncrementalWindow(
    `Translated point ${sourcePointId} by ${distanceDescription}.`,
  );
  return selectedPoint;
}

function dismissDimensionMenu() {
  dimensionMenuItem.classList.add("is-dismissed");
  document.activeElement?.blur();
}

function resetDimensionPickState() {
  dimensionState.firstEntityId = null;
  dimensionState.firstLineId = null;
  dimensionState.firstPickWorld = null;
}

function deactivateDimension(statusMessage) {
  const wasActive = dimensionState.activeType !== null;
  dimensionState.activeType = null;
  resetDimensionPickState();
  cadCanvas.classList.remove(
    "dimension-linear",
    "dimension-diameter",
    "dimension-radius",
    "dimension-angle",
  );
  if (wasActive) renderEntities();
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function activateDimension(type) {
  dismissDimensionMenu();
  deactivateDimension();
  deactivatePointSketch();
  deactivateLineSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateThreeEntityCircle();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!rectangleWindow.hidden) closeRectangleWindow(null);
  if (!boltHoleCircleWindow.hidden) closeBoltHoleCircleWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  const measurableEntityCount = documentModel.entities.filter(
    (entity) =>
      ["point", "line", "circle", "arc"].includes(entity.type) &&
      (entity.type !== "point" || !entity.isConstruction) &&
      isEntityOnCurrentLayer(entity) &&
      isEntityLayerVisible(entity),
  ).length;
  const lineCount = documentModel.entities.filter(
    (entity) => entity.type === "line",
  ).length;
  const radialEntityCount = documentModel.entities.filter(
    (entity) => entity.type === "circle" || entity.type === "arc",
  ).length;
  if (type === "linear" && measurableEntityCount < 2) {
    commandStatus.textContent =
      "Dimension - Linear needs at least two entities on the current layer.";
    return;
  }
  if ((type === "diameter" || type === "radius") && radialEntityCount === 0) {
    commandStatus.textContent = `Dimension - ${type === "diameter" ? "Diameter" : "Radius"} needs a circle or arc.`;
    return;
  }
  if (type === "angle" && lineCount < 2) {
    commandStatus.textContent = "Dimension - Angle needs at least two lines.";
    return;
  }

  dimensionState.activeType = type;
  resetDimensionPickState();
  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove(
    "select-single",
    "dimension-linear",
    "dimension-diameter",
    "dimension-radius",
    "dimension-angle",
  );
  cadCanvas.classList.add(`dimension-${type}`);
  renderEntities();

  if (type === "linear") {
    commandStatus.textContent = "Dimension - Linear: Select the first entity.";
  } else if (type === "angle") {
    commandStatus.textContent =
      "Dimension - Angle: Select the first line near the desired ray.";
  } else {
    const name = type === "diameter" ? "Diameter" : "Radius";
    commandStatus.textContent = `Dimension - ${name}: Select a circle or arc where the leader should appear.`;
  }
}

function getDimensionCandidate(event, allowedTypes) {
  const worldPoint = screenToWorld(event);
  return (
    getSelectionHitCandidates(worldPoint, event.target).find(({ entity }) =>
      allowedTypes.includes(entity.type),
    )?.entity ?? null
  );
}

function handleLinearDimensionClick(event) {
  const candidate = getDimensionCandidate(event, [
    "point",
    "line",
    "circle",
    "arc",
  ]);
  if (!candidate) {
    commandStatus.textContent =
      dimensionState.firstEntityId === null
        ? "Dimension - Linear: Select the first entity."
        : "Dimension - Linear: Select the second entity.";
    return;
  }
  const pickPoint = screenToWorld(event);
  if (dimensionState.firstEntityId === null) {
    dimensionState.firstEntityId = candidate.id;
    dimensionState.firstPickWorld = pickPoint;
    renderEntities();
    commandStatus.textContent = `Dimension - Linear: ${candidate.type[0].toUpperCase()}${candidate.type.slice(1)} ${candidate.id} selected; select the second entity.`;
    return;
  }
  if (candidate.id === dimensionState.firstEntityId) {
    commandStatus.textContent =
      "Dimension - Linear: Select a different second entity.";
    return;
  }

  const firstEntity = getEntityById(dimensionState.firstEntityId);
  const firstPick = dimensionState.firstPickWorld;
  resetDimensionPickState();
  if (!firstEntity || !firstPick) {
    renderEntities();
    commandStatus.textContent =
      "Dimension - Linear: The first entity is no longer available; select it again.";
    return;
  }
  const measurement = getLinearDimensionBetweenEntities(
    firstEntity,
    candidate,
    firstPick,
    pickPoint,
  );
  if (!measurement) {
    renderEntities();
    commandStatus.textContent =
      "Dimension - Linear: Those entities do not have usable geometry; select the first entity again.";
    return;
  }
  if (measurement.distanceSquared <= GEOMETRY_EPSILON ** 2) {
    renderEntities();
    commandStatus.textContent =
      "Dimension - Linear: The selected entities touch or intersect, so their distance is zero; select the first entity again.";
    return;
  }
  const dimension = addLinearDimension(
    measurement.firstPoint,
    measurement.secondPoint,
  );
  commandStatus.textContent = dimension
    ? `Created linear dimension ${dimension.id}: ${formatCoordinate(dimension.value)}. Linear dimension remains active; select the first entity.`
    : "Dimension - Linear: The selected entities could not be measured; select the first entity again.";
}

function handleRadialDimensionClick(event, dimensionType) {
  const candidate = getDimensionCandidate(event, ["circle", "arc"]);
  if (!candidate) {
    commandStatus.textContent = `Dimension - ${dimensionType === "diameter" ? "Diameter" : "Radius"}: Select a circle or arc.`;
    return;
  }
  const centerPoint = getPointById(candidate.centerPointId);
  if (!centerPoint) {
    commandStatus.textContent =
      "Dimension: The selected entity has no usable center.";
    return;
  }
  const clickPoint = screenToWorld(event);
  const clickDistance = Math.hypot(
    clickPoint.x - centerPoint.x,
    clickPoint.y - centerPoint.y,
  );
  const angle =
    clickDistance <= GEOMETRY_EPSILON
      ? 0
      : Math.atan2(clickPoint.y - centerPoint.y, clickPoint.x - centerPoint.x);
  const dimension = addRadialDimension(candidate, dimensionType, angle);
  const name = dimensionType === "diameter" ? "diameter" : "radius";
  const value =
    dimensionType === "diameter" ? candidate.radius * 2 : candidate.radius;
  commandStatus.textContent = dimension
    ? `Created ${name} dimension ${dimension.id}: ${formatCoordinate(value)}. ${name[0].toUpperCase()}${name.slice(1)} dimension remains active.`
    : `Dimension - ${name}: The selected entity could not be measured.`;
}

function handleAngleDimensionClick(event) {
  const candidate = getDimensionCandidate(event, ["line"]);
  if (!candidate) {
    commandStatus.textContent =
      dimensionState.firstLineId === null
        ? "Dimension - Angle: Select the first line."
        : "Dimension - Angle: Select the second line.";
    return;
  }
  const pickPoint = screenToWorld(event);
  if (dimensionState.firstLineId === null) {
    dimensionState.firstLineId = candidate.id;
    dimensionState.firstPickWorld = pickPoint;
    renderEntities();
    commandStatus.textContent = `Dimension - Angle: Line ${candidate.id} selected; select the second line near the desired ray.`;
    return;
  }
  if (candidate.id === dimensionState.firstLineId) {
    commandStatus.textContent =
      "Dimension - Angle: Select a different second line.";
    return;
  }

  const firstLine = getEntityById(dimensionState.firstLineId);
  const firstPick = dimensionState.firstPickWorld;
  resetDimensionPickState();
  if (!firstLine || !firstPick) {
    renderEntities();
    commandStatus.textContent =
      "Dimension - Angle: The first line is no longer available.";
    return;
  }
  const result = addAngleDimension(firstLine, candidate, firstPick, pickPoint);
  if (!result.dimension) {
    renderEntities();
    commandStatus.textContent =
      result.reason === "parallel" || result.reason === "collinear"
        ? "Dimension - Angle: Parallel or collinear lines do not define an angle. Select the first line again."
        : "Dimension - Angle: Those lines have unusable geometry. Select the first line again.";
    return;
  }
  commandStatus.textContent =
    `Created angle dimension ${result.dimension.id}: ${formatDecimal(result.dimension.valueDegrees)}°. ` +
    "Angle dimension remains active; select the first line.";
}

function handleDimensionClick(event) {
  if (dimensionState.activeType === "linear") {
    handleLinearDimensionClick(event);
  } else if (
    dimensionState.activeType === "diameter" ||
    dimensionState.activeType === "radius"
  ) {
    handleRadialDimensionClick(event, dimensionState.activeType);
  } else if (dimensionState.activeType === "angle") {
    handleAngleDimensionClick(event);
  }
}

function deactivatePointEnd(statusMessage = null) {
  const wasActive =
    pointEndState.active ||
    cadCanvas.classList.contains("point-end") ||
    cadCanvas.classList.contains("point-end-source-pick");
  pointEndState.active = false;
  cadCanvas.classList.remove("point-end");
  cadCanvas.classList.remove("point-end-source-pick");
  if (wasActive) renderEntities();
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function activatePointEnd() {
  dismissDrawMenu();
  const restrictionMessage = getCurrentLayerRestrictionMessage("Point - End");
  if (restrictionMessage) {
    commandStatus.textContent = restrictionMessage;
    return;
  }

  deactivateDimension();
  deactivatePointSketch();
  deactivateLineSketch();
  deactivateLineAngle();
  deactivateLineTangent();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateThreeEntityCircle();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  deactivateWindowZoom();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!rectangleWindow.hidden) closeRectangleWindow(null);
  if (!boltHoleCircleWindow.hidden) closeBoltHoleCircleWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);
  if (!translateWindow.hidden) closeTranslateWindow(null);

  const eligibleEntityCount = documentModel.entities.filter(
    (entity) =>
      isEntityOnCurrentLayer(entity) &&
      isEntityLayerVisible(entity) &&
      (entity.type === "line" ||
        entity.type === "circle" ||
        entity.type === "arc"),
  ).length;
  if (!eligibleEntityCount) {
    commandStatus.textContent =
      "Point - End needs a line, circle, or arc on the current layer.";
    return;
  }

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  pointEndState.active = true;
  cadCanvas.classList.add("point-end");
  cadCanvas.classList.add("point-end-source-pick");
  renderEntities();
  commandStatus.textContent = "Point - End: Select a line, arc, or circle.";
}

function resolvePointEndPlacement(sourceEntity, clickWorld) {
  if (sourceEntity?.type === "line" || sourceEntity?.type === "arc") {
    const startPoint = getPointById(sourceEntity.startPointId);
    const endPoint = getPointById(sourceEntity.endPointId);
    if (
      !startPoint ||
      !endPoint ||
      !Number.isFinite(startPoint.x) ||
      !Number.isFinite(startPoint.y) ||
      !Number.isFinite(endPoint.x) ||
      !Number.isFinite(endPoint.y) ||
      !Number.isFinite(clickWorld?.x) ||
      !Number.isFinite(clickWorld?.y)
    ) {
      return null;
    }
    const useStart =
      squaredDistance(clickWorld, startPoint) <=
      squaredDistance(clickWorld, endPoint);
    const endpoint = useStart ? startPoint : endPoint;
    return {
      worldPoint: { x: endpoint.x, y: endpoint.y },
      description:
        `${useStart ? "start" : "end"} endpoint of ` +
        `${sourceEntity.type} ${sourceEntity.id}`,
    };
  }

  if (sourceEntity?.type === "circle") {
    const centerPoint = getPointById(sourceEntity.centerPointId);
    if (
      !centerPoint ||
      !Number.isFinite(centerPoint.x) ||
      !Number.isFinite(centerPoint.y) ||
      !Number.isFinite(sourceEntity.radius)
    ) {
      return null;
    }
    return {
      worldPoint: {
        x: centerPoint.x + sourceEntity.radius,
        y: centerPoint.y,
      },
      description: `0° position of circle ${sourceEntity.id}`,
    };
  }

  return null;
}

function placePointAtEntityEnd(sourceEntity, clickWorld) {
  const placement = resolvePointEndPlacement(sourceEntity, clickWorld);
  if (!placement) {
    commandStatus.textContent =
      "Point - End: The selected entity does not have usable geometry.";
    return { point: null, created: false, placement: null };
  }

  const existingPoint = findExistingPointAt(placement.worldPoint);
  if (existingPoint) {
    commandStatus.textContent =
      `Point ${existingPoint.id} already exists at the ${placement.description}. ` +
      "Point - End remains active; select the next line, arc, or circle.";
    return { point: existingPoint, created: false, placement };
  }

  const point = addPoint(placement.worldPoint.x, placement.worldPoint.y);
  commandStatus.textContent =
    `Created point ${point.id} at the ${placement.description}. ` +
    "Point - End remains active; select the next line, arc, or circle.";
  return { point, created: true, placement };
}

function handlePointEndClick(event) {
  const sourceElement = event.target.closest(
    ".line-entity, .circle-entity, .arc-entity",
  );
  if (!sourceElement) {
    commandStatus.textContent = "Point - End: Select a line, arc, or circle.";
    return;
  }

  const sourceEntity = getEntityById(Number(sourceElement.dataset.entityId));
  if (
    !sourceEntity ||
    !isEntityOnCurrentLayer(sourceEntity) ||
    !isEntityLayerVisible(sourceEntity)
  ) {
    commandStatus.textContent =
      "Point - End: Select geometry on the current layer.";
    return;
  }

  placePointAtEntityEnd(sourceEntity, screenToWorld(event));
}

function positionPointOnEntityWindowInitially() {
  const windowBounds = pointOnEntityWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );

  pointOnEntityWindow.style.left = `${left}px`;
  pointOnEntityWindow.style.top = `${top}px`;
  pointOnEntityWindowState.hasPosition = true;
}

function setPointOnEntityWindowMinimized(minimized) {
  pointOnEntityWindow.classList.toggle("is-minimized", minimized);
  pointOnEntityMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Point on Entity" : "Minimize Point on Entity",
  );
  pointOnEntityMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restorePointOnEntityWindow() {
  pointOnEntityWindow.classList.remove("is-maximized");

  if (pointOnEntityWindowState.restoreBounds) {
    const { left, top, width } = pointOnEntityWindowState.restoreBounds;
    pointOnEntityWindow.style.left = `${left}px`;
    pointOnEntityWindow.style.top = `${top}px`;
    pointOnEntityWindow.style.width = `${width}px`;
  }

  pointOnEntityMaximizeButton.setAttribute(
    "aria-label",
    "Maximize Point on Entity",
  );
  pointOnEntityMaximizeButton.title = "Maximize";
  pointOnEntityMaximizeIcon.textContent = "□";
}

function togglePointOnEntityWindowMaximized() {
  setPointOnEntityWindowMinimized(false);

  if (pointOnEntityWindow.classList.contains("is-maximized")) {
    restorePointOnEntityWindow();
    return;
  }

  const bounds = pointOnEntityWindow.getBoundingClientRect();
  pointOnEntityWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  pointOnEntityWindow.classList.add("is-maximized");
  pointOnEntityMaximizeButton.setAttribute(
    "aria-label",
    "Restore Point on Entity",
  );
  pointOnEntityMaximizeButton.title = "Restore";
  pointOnEntityMaximizeIcon.textContent = "❐";
}

function hidePointOnEntityWindow() {
  if (pointOnEntityWindow.classList.contains("is-maximized")) {
    restorePointOnEntityWindow();
  }
  setPointOnEntityWindowMinimized(false);
  pointOnEntityWindow.hidden = true;
}

function clearPointOnEntitySource() {
  pointOnEntityState.sourceEntityId = null;
  pointOnEntityState.zeroPointId = null;
  pointOnEntityState.zeroChoiceIndex = null;
  pointOnEntityState.awaitingDirection = false;
  pointOnEntityState.directionChoices = [];
  pointOnEntitySourceReadout.textContent = "None selected";
  pointOnEntityCreateButton.disabled = true;
}

function deactivatePointOnEntity(statusMessage) {
  pointOnEntityState.active = false;
  clearPointOnEntitySource();
  cadCanvas.classList.remove("point-on-entity");
  cadCanvas.classList.remove("point-on-entity-source-pick");
  hidePointOnEntityWindow();
  renderEntities();

  if (statusMessage) {
    commandStatus.textContent = statusMessage;
  }
}

function resetPointOnEntityForNextSource(statusMessage) {
  clearPointOnEntitySource();
  hidePointOnEntityWindow();
  cadCanvas.classList.add("point-on-entity-source-pick");
  renderEntities();
  commandStatus.textContent = statusMessage;
}

function activatePointOnEntity() {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);

  const eligibleEntityCount = documentModel.entities.filter(
    (entity) =>
      entity.type === "line" ||
      entity.type === "circle" ||
      entity.type === "arc",
  ).length;
  if (!eligibleEntityCount) {
    commandStatus.textContent =
      "Point on Entity needs an existing line, circle, or arc.";
    return;
  }

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  cadCanvas.classList.remove("select-single");
  pointOnEntityState.active = true;
  clearPointOnEntitySource();
  hidePointOnEntityWindow();
  cadCanvas.classList.add("point-on-entity");
  cadCanvas.classList.add("point-on-entity-source-pick");
  renderEntities();
  commandStatus.textContent = "Point on Entity: Select a line, circle, or arc.";
}

function getLineDirectionChoices(line, lineElement) {
  const startPoint = getPointById(line.startPointId);
  const endPoint = getPointById(line.endPointId);
  const lineGeometry = lineElement?.querySelector(".line-geometry");
  const fallbackStart = lineGeometry
    ? {
        x: Number(lineGeometry.getAttribute("x1")),
        y: Number(lineGeometry.getAttribute("y1")),
      }
    : null;
  const fallbackEnd = lineGeometry
    ? {
        x: Number(lineGeometry.getAttribute("x2")),
        y: Number(lineGeometry.getAttribute("y2")),
      }
    : null;
  const start = startPoint ?? fallbackStart;
  const end = endPoint ?? fallbackEnd;
  if (
    !start ||
    !end ||
    !Number.isFinite(start.x) ||
    !Number.isFinite(start.y) ||
    !Number.isFinite(end.x) ||
    !Number.isFinite(end.y)
  ) {
    return [];
  }

  return [
    {
      pointId: startPoint && !startPoint.isConstruction ? startPoint.id : null,
      x: start.x,
      y: start.y,
    },
    {
      pointId: endPoint && !endPoint.isConstruction ? endPoint.id : null,
      x: end.x,
      y: end.y,
    },
  ];
}

function showPointOnEntityWindow(sourceEntity) {
  const isLine = sourceEntity.type === "line";
  pointOnEntityValueLabel.textContent = isLine ? "Percentage" : "Degrees";
  pointOnEntityUnit.textContent = isLine ? "%" : "°";
  pointOnEntityValueInput.value = String(
    isLine
      ? pointOnEntityState.linePercentage
      : pointOnEntityState.angleDegrees,
  );

  if (isLine) {
    pointOnEntityValueInput.min = "0";
    pointOnEntityValueInput.max = "100";
    const zeroChoice =
      pointOnEntityState.directionChoices[pointOnEntityState.zeroChoiceIndex];
    pointOnEntitySourceReadout.textContent = zeroChoice?.pointId
      ? `Line ${sourceEntity.id} — Point ${zeroChoice.pointId} is 0%`
      : `Line ${sourceEntity.id} — selected endpoint is 0%`;
    pointOnEntityToolMessage.textContent =
      "Enter a percentage from 0 to 100 along the line.";
  } else {
    pointOnEntityValueInput.removeAttribute("min");
    pointOnEntityValueInput.removeAttribute("max");
    const entityName = sourceEntity.type === "circle" ? "Circle" : "Arc";
    pointOnEntitySourceReadout.textContent = `${entityName} ${sourceEntity.id}`;
    pointOnEntityToolMessage.textContent =
      "0° = right, 90° = up, 180° = left, 270° = down.";
  }

  pointOnEntityCreateButton.disabled = false;
  pointOnEntityValueInput.setCustomValidity("");
  pointOnEntityWindow.hidden = false;
  setPointOnEntityWindowMinimized(false);
  if (!pointOnEntityWindowState.hasPosition) {
    positionPointOnEntityWindowInitially();
  }
  pointOnEntityValueInput.focus();
  pointOnEntityValueInput.select();
}

function selectPointOnEntityLineDirection(choiceIndex) {
  const sourceEntity = getEntityById(pointOnEntityState.sourceEntityId);
  const choice = pointOnEntityState.directionChoices[choiceIndex];
  if (!sourceEntity || sourceEntity.type !== "line" || !choice) return;

  pointOnEntityState.awaitingDirection = false;
  pointOnEntityState.zeroChoiceIndex = choiceIndex;
  pointOnEntityState.zeroPointId = choice.pointId;
  renderEntities();
  showPointOnEntityWindow(sourceEntity);
  commandStatus.textContent = choice.pointId
    ? `Point on Entity: Point ${choice.pointId} is the 0% endpoint; enter a percentage.`
    : "Point on Entity: The chosen temporary endpoint is 0%; enter a percentage.";
}

function handlePointOnEntityClick(event) {
  if (pointOnEntityState.awaitingDirection) {
    const pointElement = event.target.closest(".point-entity");
    const temporaryElement = event.target.closest(".temporary-direction-point");
    let choiceIndex = -1;
    if (pointElement) {
      const pointId = Number(pointElement.dataset.entityId);
      choiceIndex = pointOnEntityState.directionChoices.findIndex(
        (choice) => choice.pointId === pointId,
      );
    } else if (temporaryElement) {
      choiceIndex = Number(temporaryElement.dataset.choiceIndex);
    }

    if (choiceIndex < 0) {
      commandStatus.textContent =
        "Point on Entity: Direction ambiguous; select the 0% endpoint.";
      return;
    }
    selectPointOnEntityLineDirection(choiceIndex);
    return;
  }

  if (pointOnEntityState.sourceEntityId !== null) {
    commandStatus.textContent =
      "Point on Entity: Enter the value in the tool window, then choose Create.";
    return;
  }

  const sourceElement = event.target.closest(
    ".line-entity, .circle-entity, .arc-entity",
  );
  if (!sourceElement) {
    commandStatus.textContent =
      "Point on Entity: Select a line, circle, or arc.";
    return;
  }

  const sourceEntity = getEntityById(Number(sourceElement.dataset.entityId));
  if (!sourceEntity) return;
  pointOnEntityState.sourceEntityId = sourceEntity.id;
  cadCanvas.classList.remove("point-on-entity-source-pick");

  if (sourceEntity.type === "line") {
    const choices = getLineDirectionChoices(sourceEntity, sourceElement);
    if (choices.length !== 2) {
      pointOnEntityState.sourceEntityId = null;
      cadCanvas.classList.add("point-on-entity-source-pick");
      commandStatus.textContent =
        "Point on Entity: The selected line endpoints are not usable.";
      return;
    }

    pointOnEntityState.directionChoices = choices;
    const clickWorld = screenToWorld(event);
    const distanceToStart = Math.hypot(
      clickWorld.x - choices[0].x,
      clickWorld.y - choices[0].y,
    );
    const distanceToEnd = Math.hypot(
      clickWorld.x - choices[1].x,
      clickWorld.y - choices[1].y,
    );
    const lineLength = Math.hypot(
      choices[1].x - choices[0].x,
      choices[1].y - choices[0].y,
    );
    if (
      lineLength <= GEOMETRY_EPSILON ||
      !Number.isFinite(distanceToStart) ||
      !Number.isFinite(distanceToEnd)
    ) {
      pointOnEntityState.sourceEntityId = null;
      pointOnEntityState.directionChoices = [];
      cadCanvas.classList.add("point-on-entity-source-pick");
      commandStatus.textContent =
        "Point on Entity: The selected line has no usable length.";
      return;
    }

    if (Math.abs(distanceToStart - distanceToEnd) <= lineLength * 0.02) {
      pointOnEntityState.awaitingDirection = true;
      pointOnEntityState.zeroPointId = null;
      pointOnEntityState.zeroChoiceIndex = null;
      hidePointOnEntityWindow();
      renderEntities();
      commandStatus.textContent =
        "Point on Entity: Direction ambiguous; select the 0% endpoint.";
      return;
    }

    selectPointOnEntityLineDirection(distanceToStart < distanceToEnd ? 0 : 1);
    return;
  }

  pointOnEntityState.directionChoices = [];
  pointOnEntityState.zeroPointId = null;
  pointOnEntityState.zeroChoiceIndex = null;
  renderEntities();
  showPointOnEntityWindow(sourceEntity);
  const entityName = sourceEntity.type === "circle" ? "Circle" : "Arc";
  commandStatus.textContent = `Point on Entity: ${entityName} ${sourceEntity.id} selected; enter degrees.`;
}

function createPointOnEntity() {
  const sourceEntity = getEntityById(pointOnEntityState.sourceEntityId);
  const value = resolveArithmeticInput(pointOnEntityValueInput, {
    messageElement: pointOnEntityToolMessage,
    invalidMessage: "Enter a valid arithmetic expression.",
    validationMessage: (resolvedValue) =>
      sourceEntity?.type === "line" &&
      (resolvedValue < 0 || resolvedValue > 100)
        ? "Enter a percentage from 0 to 100."
        : null,
    successMessage: () =>
      sourceEntity?.type === "line"
        ? "Enter a percentage from 0 to 100 along the line."
        : "0° = right, 90° = up, 180° = left, 270° = down.",
  });
  if (!pointOnEntityForm.reportValidity()) return;
  if (!sourceEntity || !Number.isFinite(value)) {
    pointOnEntityToolMessage.textContent = "Enter a valid numeric value.";
    return;
  }

  let worldPoint;
  let placementDescription;
  if (sourceEntity.type === "line") {
    if (value < 0 || value > 100) {
      pointOnEntityToolMessage.textContent =
        "Enter a percentage from 0 to 100.";
      return;
    }
    const zeroChoice =
      pointOnEntityState.directionChoices[pointOnEntityState.zeroChoiceIndex];
    const oppositeChoice =
      pointOnEntityState.directionChoices[
        pointOnEntityState.zeroChoiceIndex === 0 ? 1 : 0
      ];
    if (!zeroChoice || !oppositeChoice) {
      pointOnEntityToolMessage.textContent =
        "Choose the line's 0% endpoint again.";
      return;
    }
    const fraction = value / 100;
    worldPoint = {
      x: zeroChoice.x + (oppositeChoice.x - zeroChoice.x) * fraction,
      y: zeroChoice.y + (oppositeChoice.y - zeroChoice.y) * fraction,
    };
    pointOnEntityState.linePercentage = value;
    placementDescription = `line ${sourceEntity.id} at ${formatDecimal(value)}%`;
  } else if (sourceEntity.type === "circle" || sourceEntity.type === "arc") {
    const centerPoint = getPointById(sourceEntity.centerPointId);
    if (!centerPoint) {
      pointOnEntityToolMessage.textContent =
        "The selected entity has no usable center point.";
      return;
    }
    const normalizedDegrees =
      normalizeAngle((value * Math.PI) / 180) * (180 / Math.PI);
    const radians = (normalizedDegrees * Math.PI) / 180;
    const rawCosine = Math.cos(radians);
    const rawSine = Math.sin(radians);
    const cosine = Math.abs(rawCosine) <= 1e-12 ? 0 : rawCosine;
    const sine = Math.abs(rawSine) <= 1e-12 ? 0 : rawSine;
    worldPoint = {
      x: centerPoint.x + sourceEntity.radius * cosine,
      y: centerPoint.y + sourceEntity.radius * sine,
    };
    pointOnEntityState.angleDegrees = value;
    placementDescription = `${sourceEntity.type} ${sourceEntity.id} at ${formatDecimal(normalizedDegrees)}°`;
  } else {
    pointOnEntityToolMessage.textContent =
      "The selected entity is not supported.";
    return;
  }

  const existingPoint = findExistingPointAt(worldPoint);
  if (existingPoint) {
    resetPointOnEntityForNextSource(
      `Point ${existingPoint.id} already exists on ${placementDescription}. ` +
        "Point on Entity remains active; select the next entity.",
    );
    return;
  }

  const point = addPoint(worldPoint.x, worldPoint.y);
  resetPointOnEntityForNextSource(
    `Created point ${point.id} on ${placementDescription}. ` +
      "Point on Entity remains active; select the next entity.",
  );
}

function positionLineCoordinatesWindowInitially() {
  const windowBounds = lineCoordinatesWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );
  lineCoordinatesWindow.style.left = `${left}px`;
  lineCoordinatesWindow.style.top = `${top}px`;
  lineCoordinatesWindowState.hasPosition = true;
}

function setLineCoordinatesWindowMinimized(minimized) {
  lineCoordinatesWindow.classList.toggle("is-minimized", minimized);
  lineCoordinatesMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Line Coordinates" : "Minimize Line Coordinates",
  );
  lineCoordinatesMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreLineCoordinatesWindow() {
  lineCoordinatesWindow.classList.remove("is-maximized");
  if (lineCoordinatesWindowState.restoreBounds) {
    const { left, top, width } = lineCoordinatesWindowState.restoreBounds;
    lineCoordinatesWindow.style.left = `${left}px`;
    lineCoordinatesWindow.style.top = `${top}px`;
    lineCoordinatesWindow.style.width = `${width}px`;
  }
  lineCoordinatesMaximizeButton.setAttribute(
    "aria-label",
    "Maximize Line Coordinates",
  );
  lineCoordinatesMaximizeButton.title = "Maximize";
  lineCoordinatesMaximizeIcon.textContent = "□";
}

function toggleLineCoordinatesWindowMaximized() {
  setLineCoordinatesWindowMinimized(false);
  if (lineCoordinatesWindow.classList.contains("is-maximized")) {
    restoreLineCoordinatesWindow();
    return;
  }
  const bounds = lineCoordinatesWindow.getBoundingClientRect();
  lineCoordinatesWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  lineCoordinatesWindow.classList.add("is-maximized");
  lineCoordinatesMaximizeButton.setAttribute(
    "aria-label",
    "Restore Line Coordinates",
  );
  lineCoordinatesMaximizeButton.title = "Restore";
  lineCoordinatesMaximizeIcon.textContent = "❐";
}

function closeLineCoordinatesWindow(statusMessage = "Ready") {
  if (lineCoordinatesWindow.classList.contains("is-maximized")) {
    restoreLineCoordinatesWindow();
  }
  setLineCoordinatesWindowMinimized(false);
  lineCoordinatesWindow.hidden = true;
  if (statusMessage !== null) commandStatus.textContent = statusMessage;
}

function activateLineCoordinates() {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  lineCoordinatesToolMessage.textContent =
    "Enter the start and end coordinates.";
  [lineStartXInput, lineStartYInput, lineEndXInput, lineEndYInput].forEach(
    (input) => input.setCustomValidity(""),
  );
  lineCoordinatesWindow.hidden = false;
  setLineCoordinatesWindowMinimized(false);
  if (!lineCoordinatesWindowState.hasPosition) {
    positionLineCoordinatesWindowInitially();
  }
  lineStartXInput.focus();
  lineStartXInput.select();
  commandStatus.textContent = "Line - Coordinates";
}

function createLineFromCoordinateInputs(keepDialogOpen) {
  const configurations = [
    {
      input: lineStartXInput,
      label: "start X",
    },
    {
      input: lineStartYInput,
      label: "start Y",
    },
    {
      input: lineEndXInput,
      label: "end X",
    },
    {
      input: lineEndYInput,
      label: "end Y",
    },
  ];
  const values = configurations.map(({ input, label }) =>
    resolveArithmeticInput(input, {
      messageElement: lineCoordinatesToolMessage,
      invalidMessage: `Enter a valid arithmetic expression for ${label}.`,
      successMessage: "Enter the start and end coordinates.",
    }),
  );
  if (!lineCoordinatesForm.reportValidity()) return;
  if (values.some((value) => value === null)) return;

  const [startX, startY, endX, endY] = values;
  const start = { x: startX, y: startY };
  const end = { x: endX, y: endY };
  if (squaredDistance(start, end) <= GEOMETRY_EPSILON ** 2) {
    lineCoordinatesToolMessage.textContent =
      "Start and end coordinates must define a line with a nonzero length.";
    commandStatus.textContent =
      "Line - Coordinates: Start and end are identical.";
    return;
  }

  const duplicateLine = findLineAtCoordinates(start, end);
  if (duplicateLine) {
    lineCoordinatesToolMessage.textContent = `Line ${duplicateLine.id} already exists at those coordinates.`;
    commandStatus.textContent = `Line - Coordinates: Line ${duplicateLine.id} already exists.`;
    return;
  }

  const { line, startPoint, endPoint } = addCoordinateLine(start, end);
  const resultMessage =
    `Created line ${line.id} from X${formatCoordinate(startPoint.x)} ` +
    `Y${formatCoordinate(startPoint.y)} to X${formatCoordinate(endPoint.x)} ` +
    `Y${formatCoordinate(endPoint.y)}.`;
  if (keepDialogOpen) {
    lineCoordinatesToolMessage.textContent = resultMessage;
    commandStatus.textContent = `${resultMessage} Line - Coordinates remains open.`;
    lineStartXInput.focus();
    lineStartXInput.select();
    return;
  }
  closeLineCoordinatesWindow(resultMessage);
}

function positionLineAngleWindowInitially() {
  const windowBounds = lineAngleWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );
  lineAngleWindow.style.left = `${left}px`;
  lineAngleWindow.style.top = `${top}px`;
  lineAngleWindowState.hasPosition = true;
}

function setLineAngleWindowMinimized(minimized) {
  lineAngleWindow.classList.toggle("is-minimized", minimized);
  lineAngleMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Line Angle" : "Minimize Line Angle",
  );
  lineAngleMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreLineAngleWindow() {
  lineAngleWindow.classList.remove("is-maximized");
  if (lineAngleWindowState.restoreBounds) {
    const { left, top, width } = lineAngleWindowState.restoreBounds;
    lineAngleWindow.style.left = `${left}px`;
    lineAngleWindow.style.top = `${top}px`;
    lineAngleWindow.style.width = `${width}px`;
  }
  lineAngleMaximizeButton.setAttribute("aria-label", "Maximize Line Angle");
  lineAngleMaximizeButton.title = "Maximize";
  lineAngleMaximizeIcon.textContent = "□";
}

function toggleLineAngleWindowMaximized() {
  setLineAngleWindowMinimized(false);
  if (lineAngleWindow.classList.contains("is-maximized")) {
    restoreLineAngleWindow();
    return;
  }
  const bounds = lineAngleWindow.getBoundingClientRect();
  lineAngleWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  lineAngleWindow.classList.add("is-maximized");
  lineAngleMaximizeButton.setAttribute("aria-label", "Restore Line Angle");
  lineAngleMaximizeButton.title = "Restore";
  lineAngleMaximizeIcon.textContent = "❐";
}

function resetLineAngleSource() {
  lineAngleState.sourceEntityId = null;
  lineAngleState.startPointId = null;
  lineAngleState.lineBaseAngle = 0;
  lineAngleSourceReadout.textContent = "Select an entity";
  lineAngleRelativeOptions.disabled = true;
  lineAngleRelativeAxisInput.checked = true;
  lineAngleCreateButton.disabled = true;
}

function deactivateLineAngle(statusMessage) {
  const wasActive = lineAngleState.active;
  lineAngleState.active = false;
  resetLineAngleSource();
  cadCanvas.classList.remove("line-angle");
  if (lineAngleWindow.classList.contains("is-maximized")) {
    restoreLineAngleWindow();
  }
  setLineAngleWindowMinimized(false);
  lineAngleWindow.hidden = true;
  previewLayer.innerHTML = "";
  if (wasActive) renderEntities();
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function activateLineAngle() {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateLineSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateThreeEntityCircle();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  deactivateDimension();
  deactivateWindowZoom();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!rectangleWindow.hidden) closeRectangleWindow(null);
  if (!boltHoleCircleWindow.hidden) closeBoltHoleCircleWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);
  if (!translateWindow.hidden) closeTranslateWindow(null);

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  lineAngleState.active = true;
  resetLineAngleSource();
  lineAngleDegreesInput.value = "0";
  lineAngleLengthInput.value = "1.000";
  lineAngleDegreesInput.setCustomValidity("");
  lineAngleLengthInput.setCustomValidity("");
  lineAngleToolMessage.textContent =
    "Select a point, line, circle, or arc for the line start.";
  cadCanvas.classList.add("line-angle");
  lineAngleWindow.hidden = false;
  setLineAngleWindowMinimized(false);
  if (!lineAngleWindowState.hasPosition) positionLineAngleWindowInitially();
  renderEntities();
  lineAngleDegreesInput.focus();
  lineAngleDegreesInput.select();
  commandStatus.textContent =
    "Line - Angle: Select a point, line, circle, or arc.";
}

function getLineAngleGeometry() {
  const sourceEntity = getEntityById(lineAngleState.sourceEntityId);
  const startPoint = getPointById(lineAngleState.startPointId);
  const angleDegrees = getArithmeticInputValue(lineAngleDegreesInput);
  const length = getArithmeticInputValue(lineAngleLengthInput);
  if (
    !sourceEntity ||
    !startPoint ||
    !Number.isFinite(angleDegrees) ||
    !Number.isFinite(length) ||
    length <= 0
  ) {
    return null;
  }
  const baseAngle =
    sourceEntity.type === "line" && lineAngleRelativeLineInput.checked
      ? lineAngleState.lineBaseAngle
      : 0;
  const finalAngle = baseAngle + (angleDegrees * Math.PI) / 180;
  return {
    start: { x: startPoint.x, y: startPoint.y },
    end: {
      x: startPoint.x + Math.cos(finalAngle) * length,
      y: startPoint.y + Math.sin(finalAngle) * length,
    },
    angleDegrees,
    length,
  };
}

function updateLineAngleCreateState() {
  lineAngleCreateButton.disabled = getLineAngleGeometry() === null;
  renderToolPreview();
}

function describeLineAngleSource(entity, startPoint) {
  const coordinates = `X${formatCoordinate(startPoint.x)} Y${formatCoordinate(startPoint.y)}`;
  if (entity.type === "point") return `Point ${entity.id}: ${coordinates}`;
  if (entity.type === "line") {
    return `Line ${entity.id} endpoint: ${coordinates}`;
  }
  return `${entity.type === "circle" ? "Circle" : "Arc"} ${entity.id} center: ${coordinates}`;
}

function handleLineAngleClick(event) {
  const clickWorld = screenToWorld(event);
  const candidate = getSelectionHitCandidates(clickWorld, event.target).find(
    ({ entity }) =>
      entity.type === "point" ||
      entity.type === "line" ||
      entity.type === "circle" ||
      entity.type === "arc",
  );
  if (!candidate) {
    commandStatus.textContent =
      "Line - Angle: Select a point, line, circle, or arc.";
    return;
  }

  const entity = candidate.entity;
  let startPoint = null;
  if (entity.type === "point") {
    startPoint = entity;
  } else if (entity.type === "line") {
    const endpoints = getLineEndpointPair(entity);
    if (endpoints) {
      startPoint =
        squaredDistance(clickWorld, endpoints.startPoint) <=
        squaredDistance(clickWorld, endpoints.endPoint)
          ? endpoints.startPoint
          : endpoints.endPoint;
      lineAngleState.lineBaseAngle = Math.atan2(
        endpoints.endPoint.y - endpoints.startPoint.y,
        endpoints.endPoint.x - endpoints.startPoint.x,
      );
    }
  } else {
    startPoint = getPointById(entity.centerPointId);
  }
  if (!startPoint) {
    commandStatus.textContent =
      "Line - Angle: The selected entity has unusable geometry.";
    return;
  }

  lineAngleState.sourceEntityId = entity.id;
  lineAngleState.startPointId = startPoint.id;
  lineAngleSourceReadout.textContent = describeLineAngleSource(
    entity,
    startPoint,
  );
  const usesLineReference = entity.type === "line";
  lineAngleRelativeOptions.disabled = !usesLineReference;
  if (usesLineReference) lineAngleRelativeLineInput.checked = true;
  else lineAngleRelativeAxisInput.checked = true;
  lineAngleToolMessage.textContent = usesLineReference
    ? "Choose Line or Axis orientation, then enter the angle and length."
    : "Enter the angle from the positive X axis and the line length.";
  updateLineAngleCreateState();
  renderEntities();
  commandStatus.textContent = `Line - Angle: ${describeLineAngleSource(entity, startPoint)} selected.`;
}

function createLineFromAngleInputs() {
  if (lineAngleState.sourceEntityId === null) {
    lineAngleToolMessage.textContent =
      "Select a point, line, circle, or arc for the line start.";
    commandStatus.textContent = "Line - Angle: Select a start source first.";
    return;
  }
  const angleDegrees = resolveArithmeticInput(lineAngleDegreesInput, {
    messageElement: lineAngleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the angle.",
    successMessage: "Enter the angle and length.",
  });
  const length = resolveArithmeticInput(lineAngleLengthInput, {
    messageElement: lineAngleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the length.",
    validationMessage: (value) =>
      value > 0 ? null : "Length must be greater than zero.",
    successMessage: "Enter the angle and length.",
  });
  if (!lineAngleForm.reportValidity()) return;
  if (angleDegrees === null || length === null) return;

  const geometry = getLineAngleGeometry();
  if (!geometry) {
    lineAngleToolMessage.textContent =
      "The selected start source is no longer available.";
    commandStatus.textContent = "Line - Angle: Select the start source again.";
    resetLineAngleSource();
    renderEntities();
    return;
  }
  const duplicateLine = findLineAtCoordinates(geometry.start, geometry.end);
  if (duplicateLine) {
    lineAngleToolMessage.textContent = `Line ${duplicateLine.id} already exists at those coordinates.`;
    commandStatus.textContent = `Line - Angle: Line ${duplicateLine.id} already exists.`;
    return;
  }

  const sourceEntity = getEntityById(lineAngleState.sourceEntityId);
  const referenceDescription =
    sourceEntity?.type === "line" && lineAngleRelativeLineInput.checked
      ? ` relative to line ${sourceEntity.id}`
      : " relative to the axis";
  const { line, startPoint, endPoint } = addAngleLine(
    geometry.start,
    geometry.end,
  );
  const resultMessage =
    `Created line ${line.id} from X${formatCoordinate(startPoint.x)} ` +
    `Y${formatCoordinate(startPoint.y)} to X${formatCoordinate(endPoint.x)} ` +
    `Y${formatCoordinate(endPoint.y)} at ${formatArithmeticResult(angleDegrees)}°` +
    `${referenceDescription}, length ${formatLengthResult(length)}.`;
  resetLineAngleSource();
  lineAngleToolMessage.textContent = `${resultMessage} Select the next start source.`;
  renderEntities();
  commandStatus.textContent = `${resultMessage} Line - Angle remains active.`;
}

function positionLineTangentWindowInitially() {
  const windowBounds = lineTangentWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );
  lineTangentWindow.style.left = `${left}px`;
  lineTangentWindow.style.top = `${top}px`;
  lineTangentWindowState.hasPosition = true;
}

function setLineTangentWindowMinimized(minimized) {
  lineTangentWindow.classList.toggle("is-minimized", minimized);
  lineTangentMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Line Tangent" : "Minimize Line Tangent",
  );
  lineTangentMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restoreLineTangentWindow() {
  lineTangentWindow.classList.remove("is-maximized");
  if (lineTangentWindowState.restoreBounds) {
    const { left, top, width } = lineTangentWindowState.restoreBounds;
    lineTangentWindow.style.left = `${left}px`;
    lineTangentWindow.style.top = `${top}px`;
    lineTangentWindow.style.width = `${width}px`;
  }
  lineTangentMaximizeButton.setAttribute("aria-label", "Maximize Line Tangent");
  lineTangentMaximizeButton.title = "Maximize";
  lineTangentMaximizeIcon.textContent = "□";
}

function toggleLineTangentWindowMaximized() {
  setLineTangentWindowMinimized(false);
  if (lineTangentWindow.classList.contains("is-maximized")) {
    restoreLineTangentWindow();
    return;
  }
  const bounds = lineTangentWindow.getBoundingClientRect();
  lineTangentWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  lineTangentWindow.classList.add("is-maximized");
  lineTangentMaximizeButton.setAttribute("aria-label", "Restore Line Tangent");
  lineTangentMaximizeButton.title = "Restore";
  lineTangentMaximizeIcon.textContent = "❐";
}

function resetLineTangentSource() {
  lineTangentState.sourceEntityId = null;
  lineTangentState.centerPointId = null;
  lineTangentSourceReadout.textContent = "Select an entity";
  lineTangentCreateButton.disabled = true;
}

function deactivateLineTangent(statusMessage) {
  const wasActive = lineTangentState.active;
  lineTangentState.active = false;
  resetLineTangentSource();
  cadCanvas.classList.remove("line-tangent");
  if (lineTangentWindow.classList.contains("is-maximized")) {
    restoreLineTangentWindow();
  }
  setLineTangentWindowMinimized(false);
  lineTangentWindow.hidden = true;
  previewLayer.innerHTML = "";
  if (wasActive) renderEntities();
  if (statusMessage) commandStatus.textContent = statusMessage;
}

function activateLineTangent() {
  dismissDrawMenu();
  deactivatePointSketch();
  deactivateLineSketch();
  deactivateLineAngle();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateThreeEntityCircle();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  deactivateDimension();
  deactivateWindowZoom();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!rectangleWindow.hidden) closeRectangleWindow(null);
  if (!boltHoleCircleWindow.hidden) closeBoltHoleCircleWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!pointCoordinatesWindow.hidden) closePointCoordinatesWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);
  if (!translateWindow.hidden) closeTranslateWindow(null);

  selectionState.mode = null;
  selectionState.selectedEntityId = null;
  selectionState.pickCycle = null;
  cadCanvas.classList.remove("select-single");
  lineTangentState.active = true;
  resetLineTangentSource();
  lineTangentAngleInput.value = "0";
  lineTangentLengthInput.value = "1.000";
  lineTangentAngleInput.setCustomValidity("");
  lineTangentLengthInput.setCustomValidity("");
  lineTangentToolMessage.textContent =
    "Select a point, circle, or arc as the tangent source.";
  cadCanvas.classList.add("line-tangent");
  lineTangentWindow.hidden = false;
  setLineTangentWindowMinimized(false);
  if (!lineTangentWindowState.hasPosition) {
    positionLineTangentWindowInitially();
  }
  renderEntities();
  lineTangentAngleInput.focus();
  lineTangentAngleInput.select();
  commandStatus.textContent = "Line - Tangent: Select a point, circle, or arc.";
}

function getLineTangentGeometry() {
  const sourceEntity = getEntityById(lineTangentState.sourceEntityId);
  const centerPoint = getPointById(lineTangentState.centerPointId);
  const angleDegrees = getArithmeticInputValue(lineTangentAngleInput);
  const length = getArithmeticInputValue(lineTangentLengthInput);
  if (
    !sourceEntity ||
    !centerPoint ||
    !Number.isFinite(angleDegrees) ||
    !Number.isFinite(length) ||
    length <= 0
  ) {
    return null;
  }
  const radius = sourceEntity.type === "point" ? 0 : sourceEntity.radius;
  if (!Number.isFinite(radius) || radius < 0) return null;
  const radialAngle = (angleDegrees * Math.PI) / 180;
  const tangentPoint = {
    x: centerPoint.x + Math.cos(radialAngle) * radius,
    y: centerPoint.y + Math.sin(radialAngle) * radius,
  };
  const tangentDirection = {
    x: -Math.sin(radialAngle),
    y: Math.cos(radialAngle),
  };
  const halfLength = length / 2;
  return {
    tangentPoint,
    start: {
      x: tangentPoint.x - tangentDirection.x * halfLength,
      y: tangentPoint.y - tangentDirection.y * halfLength,
    },
    end: {
      x: tangentPoint.x + tangentDirection.x * halfLength,
      y: tangentPoint.y + tangentDirection.y * halfLength,
    },
    angleDegrees,
    length,
  };
}

function updateLineTangentCreateState() {
  lineTangentCreateButton.disabled = getLineTangentGeometry() === null;
  renderToolPreview();
}

function describeLineTangentSource(entity, centerPoint) {
  const coordinates = `X${formatCoordinate(centerPoint.x)} Y${formatCoordinate(centerPoint.y)}`;
  if (entity.type === "point") return `Point ${entity.id}: ${coordinates}`;
  const label = entity.type === "circle" ? "Circle" : "Arc";
  return `${label} ${entity.id}: center ${coordinates}, R${formatCoordinate(entity.radius)}`;
}

function handleLineTangentClick(event) {
  const clickWorld = screenToWorld(event);
  const candidate = getSelectionHitCandidates(clickWorld, event.target).find(
    ({ entity }) =>
      entity.type === "point" ||
      entity.type === "circle" ||
      entity.type === "arc",
  );
  if (!candidate) {
    commandStatus.textContent =
      "Line - Tangent: Select a point, circle, or arc.";
    return;
  }

  const entity = candidate.entity;
  const centerPoint =
    entity.type === "point" ? entity : getPointById(entity.centerPointId);
  if (!centerPoint) {
    commandStatus.textContent =
      "Line - Tangent: The selected entity has unusable geometry.";
    return;
  }
  lineTangentState.sourceEntityId = entity.id;
  lineTangentState.centerPointId = centerPoint.id;
  lineTangentSourceReadout.textContent = describeLineTangentSource(
    entity,
    centerPoint,
  );
  lineTangentToolMessage.textContent =
    entity.type === "arc"
      ? "The arc is treated as its full hypothetical circle. Enter the angle and length."
      : "Enter the tangent angle and line length.";
  updateLineTangentCreateState();
  renderEntities();
  commandStatus.textContent = `Line - Tangent: ${describeLineTangentSource(entity, centerPoint)} selected.`;
}

function createLineFromTangentInputs() {
  if (lineTangentState.sourceEntityId === null) {
    lineTangentToolMessage.textContent =
      "Select a point, circle, or arc as the tangent source.";
    commandStatus.textContent =
      "Line - Tangent: Select a tangent source first.";
    return;
  }
  const angleDegrees = resolveArithmeticInput(lineTangentAngleInput, {
    messageElement: lineTangentToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the angle.",
    successMessage: "Enter the tangent angle and line length.",
  });
  const length = resolveArithmeticInput(lineTangentLengthInput, {
    messageElement: lineTangentToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the length.",
    validationMessage: (value) =>
      value > 0 ? null : "Length must be greater than zero.",
    successMessage: "Enter the tangent angle and line length.",
  });
  if (!lineTangentForm.reportValidity()) return;
  if (angleDegrees === null || length === null) return;

  const geometry = getLineTangentGeometry();
  if (!geometry) {
    lineTangentToolMessage.textContent =
      "The selected tangent source is no longer available.";
    commandStatus.textContent =
      "Line - Tangent: Select the tangent source again.";
    resetLineTangentSource();
    renderEntities();
    return;
  }
  const duplicateLine = findLineAtCoordinates(geometry.start, geometry.end);
  if (duplicateLine) {
    lineTangentToolMessage.textContent = `Line ${duplicateLine.id} already exists at those coordinates.`;
    commandStatus.textContent = `Line - Tangent: Line ${duplicateLine.id} already exists.`;
    return;
  }

  const { line, startPoint, endPoint } = addTangentLine(
    geometry.start,
    geometry.end,
  );
  const resultMessage =
    `Created tangent line ${line.id}, length ${formatLengthResult(length)}, ` +
    `centered at X${formatCoordinate(geometry.tangentPoint.x)} ` +
    `Y${formatCoordinate(geometry.tangentPoint.y)} for ` +
    `${formatArithmeticResult(angleDegrees)}°. Endpoints: ` +
    `X${formatCoordinate(startPoint.x)} Y${formatCoordinate(startPoint.y)} and ` +
    `X${formatCoordinate(endPoint.x)} Y${formatCoordinate(endPoint.y)}.`;
  resetLineTangentSource();
  lineTangentToolMessage.textContent = `${resultMessage} Select the next tangent source.`;
  renderEntities();
  commandStatus.textContent = `${resultMessage} Line - Tangent remains active.`;
}

function activatePointCoordinates() {
  deactivatePointSketch();
  deactivateJoin();
  deactivateIntersectingPoint();
  deactivateTrimExtend();
  deactivatePointOnEntity();
  deactivateFillet();
  deactivateRotate();
  if (!circleRadiusWindow.hidden) closeCircleRadiusWindow(null);
  if (!hexagonWindow.hidden) closeHexagonWindow(null);
  if (!offsetWindow.hidden) closeOffsetWindow(null);
  if (!lineCoordinatesWindow.hidden) closeLineCoordinatesWindow(null);
  commandStatus.textContent = "Point: Coordinates";
  toolMessage.textContent = "Enter the point coordinates.";
  pointXInput.setCustomValidity("");
  pointYInput.setCustomValidity("");
  pointCoordinatesWindow.hidden = false;
  setPointWindowMinimized(false);

  if (!pointWindowState.hasPosition) {
    positionPointWindowInitially();
  }

  pointXInput.focus();
  pointXInput.select();
}

function positionPointWindowInitially() {
  const windowBounds = pointCoordinatesWindow.getBoundingClientRect();
  const left = Math.max(8, window.innerWidth - windowBounds.width - 24);
  const top = Math.min(
    112,
    Math.max(8, window.innerHeight - windowBounds.height - 36),
  );

  pointCoordinatesWindow.style.left = `${left}px`;
  pointCoordinatesWindow.style.top = `${top}px`;
  pointWindowState.hasPosition = true;
}

function setPointWindowMinimized(minimized) {
  pointCoordinatesWindow.classList.toggle("is-minimized", minimized);
  pointMinimizeButton.setAttribute(
    "aria-label",
    minimized ? "Restore Point Coordinates" : "Minimize Point Coordinates",
  );
  pointMinimizeButton.title = minimized ? "Restore" : "Minimize";
}

function restorePointWindow() {
  pointCoordinatesWindow.classList.remove("is-maximized");

  if (pointWindowState.restoreBounds) {
    const { left, top, width } = pointWindowState.restoreBounds;
    pointCoordinatesWindow.style.left = `${left}px`;
    pointCoordinatesWindow.style.top = `${top}px`;
    pointCoordinatesWindow.style.width = `${width}px`;
  }

  pointMaximizeButton.setAttribute("aria-label", "Maximize Point Coordinates");
  pointMaximizeButton.title = "Maximize";
  pointMaximizeIcon.textContent = "□";
}

function togglePointWindowMaximized() {
  setPointWindowMinimized(false);

  if (pointCoordinatesWindow.classList.contains("is-maximized")) {
    restorePointWindow();
    return;
  }

  const bounds = pointCoordinatesWindow.getBoundingClientRect();
  pointWindowState.restoreBounds = {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
  pointCoordinatesWindow.classList.add("is-maximized");
  pointMaximizeButton.setAttribute("aria-label", "Restore Point Coordinates");
  pointMaximizeButton.title = "Restore";
  pointMaximizeIcon.textContent = "❐";
}

function closePointCoordinatesWindow(statusMessage = "Ready") {
  if (pointCoordinatesWindow.classList.contains("is-maximized")) {
    restorePointWindow();
  }

  setPointWindowMinimized(false);
  pointCoordinatesWindow.hidden = true;
  if (statusMessage !== null) {
    commandStatus.textContent = statusMessage;
  }
}

function createPointFromInputs(keepDialogOpen) {
  const x = resolveArithmeticInput(pointXInput, {
    messageElement: toolMessage,
    invalidMessage: "Enter a valid arithmetic expression for X.",
    successMessage: "Enter the point coordinates.",
  });
  const y = resolveArithmeticInput(pointYInput, {
    messageElement: toolMessage,
    invalidMessage: "Enter a valid arithmetic expression for Y.",
    successMessage: "Enter the point coordinates.",
  });
  if (!pointCoordinatesForm.reportValidity()) return;

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    toolMessage.textContent = "Enter a valid number for both X and Y.";
    return;
  }

  const point = addPoint(x, y);
  const resultMessage = `Created point ${point.id} at X${formatCoordinate(x)} Y${formatCoordinate(y)}.`;

  if (keepDialogOpen) {
    toolMessage.textContent = resultMessage;
    pointXInput.focus();
    pointXInput.select();
    return;
  }

  closePointCoordinatesWindow(resultMessage);
}

function screenPointToWorld(clientX, clientY) {
  const screenPoint = cadCanvas.createSVGPoint();
  screenPoint.x = clientX;
  screenPoint.y = clientY;
  return screenPoint.matrixTransform(worldLayer.getScreenCTM().inverse());
}

function screenToWorld(event) {
  return screenPointToWorld(event.clientX, event.clientY);
}

pointCoordinatesForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createPointFromInputs(false);
});

lineCoordinatesForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createLineFromCoordinateInputs(false);
});

lineAngleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createLineFromAngleInputs();
});

lineTangentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createLineFromTangentInputs();
});

pointOnEntityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createPointOnEntity();
});

circleRadiusForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (circleState.centerMode === "coordinate") {
    createCoordinateCircleFromInputs(false);
  } else {
    createCircleFromInput();
  }
});

hexagonForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createHexagonFromInputs();
});

rectangleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createRectangleFromInputs();
});

boltHoleCircleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createBoltHoleCircleFromInputs();
});

textForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updateTextPlacementState();
  if (textForm.reportValidity()) {
    commandStatus.textContent =
      "Text: Move the pointer onto the drawing and click to place the text.";
  }
});

offsetForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

filletForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

rotateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  rotateSelectedEntity();
});

translateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  translateSelectedEntities();
});

translateByPointsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applyTranslateByPoints();
});

pointIncrementalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applyPointIncremental();
});

boxForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createBoxFromInputs();
});

const arithmeticInputConfigurations = [
  ...[
    [boxXInput, "X"],
    [boxYInput, "Y"],
    [boxZInput, "Z"],
    [boxLengthInput, "length", true],
    [boxWidthInput, "width", true],
    [boxHeightInput, "height", true],
  ].map(([input, label, positive = false]) => ({
    input,
    messageElement: boxToolMessage,
    invalidMessage: `Enter a valid arithmetic expression for ${label}.`,
    validationMessage: positive
      ? (value) =>
          value > GEOMETRY_EPSILON
            ? null
            : `${label[0].toUpperCase()}${label.slice(1)} must be greater than zero.`
      : null,
    successMessage: "Enter position, dimensions, and draft angle.",
  })),
  {
    input: boxDraftAngleInput,
    messageElement: boxToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the draft angle.",
    validationMessage: (value) =>
      Math.abs(value) < 90
        ? null
        : "Draft angle must be greater than -90° and less than 90°.",
    successMessage: "Enter position, dimensions, and draft angle.",
  },
  {
    input: pointXInput,
    messageElement: toolMessage,
    invalidMessage: "Enter a valid arithmetic expression for X.",
    successMessage: "Enter the point coordinates.",
  },
  {
    input: pointYInput,
    messageElement: toolMessage,
    invalidMessage: "Enter a valid arithmetic expression for Y.",
    successMessage: "Enter the point coordinates.",
  },
  {
    input: lineStartXInput,
    messageElement: lineCoordinatesToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for start X.",
    successMessage: "Enter the start and end coordinates.",
  },
  {
    input: lineStartYInput,
    messageElement: lineCoordinatesToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for start Y.",
    successMessage: "Enter the start and end coordinates.",
  },
  {
    input: lineEndXInput,
    messageElement: lineCoordinatesToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for end X.",
    successMessage: "Enter the start and end coordinates.",
  },
  {
    input: lineEndYInput,
    messageElement: lineCoordinatesToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for end Y.",
    successMessage: "Enter the start and end coordinates.",
  },
  {
    input: lineAngleDegreesInput,
    messageElement: lineAngleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the angle.",
    successMessage: "Enter the angle and length.",
  },
  {
    input: lineAngleLengthInput,
    messageElement: lineAngleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the length.",
    validationMessage: (value) =>
      value > 0 ? null : "Length must be greater than zero.",
    successMessage: "Enter the angle and length.",
  },
  {
    input: lineTangentAngleInput,
    messageElement: lineTangentToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the angle.",
    successMessage: "Enter the tangent angle and line length.",
  },
  {
    input: lineTangentLengthInput,
    messageElement: lineTangentToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the length.",
    validationMessage: (value) =>
      value > 0 ? null : "Length must be greater than zero.",
    successMessage: "Enter the tangent angle and line length.",
  },
  {
    input: circleCenterXInput,
    messageElement: circleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for center X.",
    successMessage: "Enter the center coordinates and a positive radius.",
  },
  {
    input: circleCenterYInput,
    messageElement: circleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for center Y.",
    successMessage: "Enter the center coordinates and a positive radius.",
  },
  {
    input: circleRadiusInput,
    messageElement: circleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the radius.",
    validationMessage: (value) =>
      value > 0 ? null : "Enter a radius greater than zero.",
    successMessage: () =>
      circleState.centerPointId === null
        ? circleState.centerMode === "coordinate"
          ? "Enter the center coordinates and a positive radius."
          : circleState.centerMode === "sketch"
            ? "Click the drawing to sketch the center point."
            : "Select an existing point for the center."
        : "Enter a positive radius, then choose Create.",
  },
  {
    input: hexagonCenterXInput,
    messageElement: hexagonToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for center X.",
    successMessage:
      "Enter the center coordinates, size across flats, and corner radius.",
  },
  {
    input: hexagonCenterYInput,
    messageElement: hexagonToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for center Y.",
    successMessage:
      "Enter the center coordinates, size across flats, and corner radius.",
  },
  {
    input: hexagonAcrossFlatsInput,
    messageElement: hexagonToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the size across flats.",
    validationMessage: (value) =>
      value > 0 ? null : "Enter a size across flats greater than zero.",
    successMessage: () =>
      hexagonState.centerMode === "point" &&
      hexagonState.centerPointId === null
        ? "Select an existing point for the center."
        : "Enter the size across flats and an optional corner radius.",
  },
  {
    input: hexagonCornerRadiusInput,
    messageElement: hexagonToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the corner radius.",
    validationMessage: (value) => {
      if (value < 0) return "Enter a corner radius of zero or greater.";
      const acrossFlats = getHexagonAcrossFlatsInputValue();
      return acrossFlats !== null && value >= acrossFlats / 2
        ? "Corner radius must be less than half the size across flats."
        : null;
    },
    successMessage: () =>
      hexagonState.centerMode === "point" &&
      hexagonState.centerPointId === null
        ? "Select an existing point for the center."
        : "Enter the size across flats and an optional corner radius.",
  },
  {
    input: rectangleCenterXInput,
    messageElement: rectangleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for center X.",
    successMessage:
      "Enter the center location, overall dimensions, and corner radius.",
  },
  {
    input: rectangleCenterYInput,
    messageElement: rectangleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for center Y.",
    successMessage:
      "Enter the center location, overall dimensions, and corner radius.",
  },
  {
    input: rectangleXInput,
    messageElement: rectangleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for X.",
    validationMessage: (value) =>
      value > 0 ? null : "X must be greater than zero.",
    successMessage:
      "Enter the center location, overall dimensions, and corner radius.",
  },
  {
    input: rectangleYInput,
    messageElement: rectangleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for Y.",
    validationMessage: (value) =>
      value > 0 ? null : "Y must be greater than zero.",
    successMessage:
      "Enter the center location, overall dimensions, and corner radius.",
  },
  {
    input: rectangleRadiusInput,
    messageElement: rectangleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the radius.",
    validationMessage: (value) => {
      if (value < 0) return "Radius must be zero or greater.";
      const xSize = getRectangleXInputValue();
      const ySize = getRectangleYInputValue();
      return Number.isFinite(xSize) &&
        Number.isFinite(ySize) &&
        value > Math.min(xSize, ySize) / 2
        ? "Radius cannot exceed half of the smaller dimension."
        : null;
    },
    successMessage:
      "Enter the center location, overall dimensions, and corner radius.",
  },
  {
    input: boltHoleCircleCenterXInput,
    messageElement: boltHoleCircleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for center X.",
    successMessage:
      "Enter the center and pattern dimensions; the first hole is at 0°.",
  },
  {
    input: boltHoleCircleCenterYInput,
    messageElement: boltHoleCircleToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for center Y.",
    successMessage:
      "Enter the center and pattern dimensions; the first hole is at 0°.",
  },
  {
    input: boltHoleDiameterInput,
    messageElement: boltHoleCircleToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the bolt hole diameter.",
    validationMessage: (value) =>
      value > 0 ? null : "Bolt hole diameter must be greater than zero.",
    successMessage: "Enter the pattern dimensions; the first hole is at 0°.",
  },
  {
    input: boltHoleCountInput,
    messageElement: boltHoleCircleToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the number of holes.",
    validationMessage: (value) =>
      Number.isSafeInteger(value) && value > 0 && value <= MAX_BOLT_HOLE_COUNT
        ? null
        : `Number of holes must be a whole number from 1 to ${MAX_BOLT_HOLE_COUNT}.`,
    successMessage: "Enter the pattern dimensions; the first hole is at 0°.",
  },
  {
    input: boltHoleFeatureDiameterInput,
    messageElement: boltHoleCircleToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the hole diameter.",
    validationMessage: (value) =>
      value >= 0 ? null : "Hole diameter must be zero or greater.",
    successMessage: "Enter the pattern dimensions; the first hole is at 0°.",
  },
  {
    input: textHeightInput,
    messageElement: textToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the text height.",
    validationMessage: (value) =>
      value > 0 ? null : "Text height must be greater than zero.",
    successMessage: "Move the text with the pointer, then click to place it.",
  },
  {
    input: offsetAmountInput,
    messageElement: offsetToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the offset amount.",
    validationMessage: (value) =>
      value > 0 ? null : "Enter an offset amount greater than zero.",
    successMessage: () => {
      const sourceEntity = getEntityById(offsetState.sourceEntityId);
      if (sourceEntity?.type === "line") {
        return "Click the side where the parallel line should be created.";
      }
      if (sourceEntity?.type === "circle") {
        return "Click inside to shrink or outside to enlarge the circle.";
      }
      return "Enter an amount, then select a line or circle.";
    },
  },
  {
    input: filletRadiusInput,
    messageElement: filletToolMessage,
    invalidMessage:
      "Enter a valid arithmetic expression for the fillet radius.",
    validationMessage: (value) =>
      value > 0 ? null : "Enter a fillet radius greater than zero.",
    successMessage: () =>
      filletState.firstEntityId === null
        ? "Select the first line, circle, or arc near the intended fillet."
        : "Select the second line, circle, or arc near the intended fillet.",
  },
  {
    input: rotateAngleInput,
    messageElement: rotateToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for the angle.",
    successMessage: "Enter a counterclockwise angle, then choose Rotate.",
  },
  {
    input: translateXInput,
    messageElement: translateToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for X.",
    successMessage: "Enter the X and Y translation distances.",
  },
  {
    input: translateYInput,
    messageElement: translateToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for Y.",
    successMessage: "Enter the X and Y translation distances.",
  },
  {
    input: translateZInput,
    messageElement: translateToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for Z.",
    successMessage: "Enter the X, Y, and Z translation distances.",
  },
  {
    input: pointIncrementalXInput,
    messageElement: pointIncrementalToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for X.",
    successMessage: "Enter the X and Y increments.",
  },
  {
    input: pointIncrementalYInput,
    messageElement: pointIncrementalToolMessage,
    invalidMessage: "Enter a valid arithmetic expression for Y.",
    successMessage: "Enter the X and Y increments.",
  },
  {
    input: pointOnEntityValueInput,
    messageElement: pointOnEntityToolMessage,
    invalidMessage: "Enter a valid arithmetic expression.",
    validationMessage: (value) => {
      const sourceEntity = getEntityById(pointOnEntityState.sourceEntityId);
      return sourceEntity?.type === "line" && (value < 0 || value > 100)
        ? "Enter a percentage from 0 to 100."
        : null;
    },
    successMessage: () => {
      const sourceEntity = getEntityById(pointOnEntityState.sourceEntityId);
      return sourceEntity?.type === "line"
        ? "Enter a percentage from 0 to 100 along the line."
        : "0° = right, 90° = up, 180° = left, 270° = down.";
    },
  },
];

arithmeticInputConfigurations.forEach((configuration) => {
  configuration.input.addEventListener("input", () => {
    configuration.input.setCustomValidity("");
  });
  configuration.input.addEventListener("blur", () => {
    if (!configuration.input.value.trim()) return;
    resolveArithmeticInput(configuration.input, configuration);
    if (
      configuration.input === circleCenterXInput ||
      configuration.input === circleCenterYInput ||
      configuration.input === circleRadiusInput
    ) {
      updateCircleCreateState();
      renderToolPreview();
    }
    if (
      configuration.input === hexagonCenterXInput ||
      configuration.input === hexagonCenterYInput ||
      configuration.input === hexagonAcrossFlatsInput ||
      configuration.input === hexagonCornerRadiusInput
    ) {
      updateHexagonCreateState();
      renderToolPreview();
    }
    if (
      configuration.input === rectangleCenterXInput ||
      configuration.input === rectangleCenterYInput ||
      configuration.input === rectangleXInput ||
      configuration.input === rectangleYInput ||
      configuration.input === rectangleRadiusInput
    ) {
      updateRectangleCreateState();
    }
    if (
      configuration.input === boltHoleCircleCenterXInput ||
      configuration.input === boltHoleCircleCenterYInput ||
      configuration.input === boltHoleDiameterInput ||
      configuration.input === boltHoleCountInput ||
      configuration.input === boltHoleFeatureDiameterInput
    ) {
      updateBoltHoleCircleCreateState();
    }
    if (configuration.input === textHeightInput) {
      updateTextPlacementState();
    }
    if (
      configuration.input === lineAngleDegreesInput ||
      configuration.input === lineAngleLengthInput
    ) {
      updateLineAngleCreateState();
    }
    if (
      configuration.input === lineTangentAngleInput ||
      configuration.input === lineTangentLengthInput
    ) {
      updateLineTangentCreateState();
    }
  });
});

[circleCenterXInput, circleCenterYInput, circleRadiusInput].forEach((input) => {
  input.addEventListener("input", () => {
    updateCircleCreateState();
    renderToolPreview();
  });
});

[
  hexagonCenterXInput,
  hexagonCenterYInput,
  hexagonAcrossFlatsInput,
  hexagonCornerRadiusInput,
].forEach((input) => {
  input.addEventListener("input", () => {
    updateHexagonCreateState();
    renderToolPreview();
  });
});

[
  rectangleCenterXInput,
  rectangleCenterYInput,
  rectangleXInput,
  rectangleYInput,
  rectangleRadiusInput,
].forEach((input) => {
  input.addEventListener("input", updateRectangleCreateState);
});

[
  boltHoleCircleCenterXInput,
  boltHoleCircleCenterYInput,
  boltHoleDiameterInput,
  boltHoleCountInput,
  boltHoleFeatureDiameterInput,
].forEach((input) => {
  input.addEventListener("input", updateBoltHoleCircleCreateState);
});

[textHeightInput, textContentInput].forEach((input) => {
  input.addEventListener("input", updateTextPlacementState);
});

[lineAngleDegreesInput, lineAngleLengthInput].forEach((input) => {
  input.addEventListener("input", updateLineAngleCreateState);
});

[lineAngleRelativeLineInput, lineAngleRelativeAxisInput].forEach((input) => {
  input.addEventListener("change", updateLineAngleCreateState);
});

[lineTangentAngleInput, lineTangentLengthInput].forEach((input) => {
  input.addEventListener("input", updateLineTangentCreateState);
});

pointCoordinatesMenu.addEventListener("click", activatePointCoordinates);
pointIntersectMenu.addEventListener("click", activateIntersectingPoint);
pointOnEntityMenu.addEventListener("click", activatePointOnEntity);
pointEndMenu.addEventListener("click", activatePointEnd);
pointIncrementalMenu.addEventListener("click", activatePointIncremental);
pointSketchMenu.addEventListener("click", activatePointSketch);
lineCoordinatesMenu.addEventListener("click", activateLineCoordinates);
lineSketchMenu.addEventListener("click", activateLineSketch);
lineAngleMenu.addEventListener("click", activateLineAngle);
lineTangentMenu.addEventListener("click", activateLineTangent);
exportDxfMenu.addEventListener("click", exportDxf);
lineJoinMenu.addEventListener("click", activateJoin);
circleCenterRadiusMenu.addEventListener("click", activateCircleCenterRadius);
circleCoordinateCenterMenu.addEventListener(
  "click",
  activateCircleCoordinateCenter,
);
circleSketchCenterMenu.addEventListener("click", activateCircleSketchCenter);
circleThreeEntitiesMenu.addEventListener("click", activateThreeEntityCircle);
hexagonPointCenterMenu.addEventListener("click", () =>
  activateHexagon("point"),
);
hexagonDefineCenterMenu.addEventListener("click", () =>
  activateHexagon("defined"),
);
rectanglePointCenterMenu.addEventListener("click", () =>
  activateRectangle("point"),
);
rectangleDefineCenterMenu.addEventListener("click", () =>
  activateRectangle("defined"),
);
boltHoleCirclePointCenterMenu.addEventListener("click", () =>
  activateBoltHoleCircle("point"),
);
boltHoleCircleDefineCenterMenu.addEventListener("click", () =>
  activateBoltHoleCircle("defined"),
);
textMenu.addEventListener("click", activateText);
modelBoxMenu.addEventListener("click", activateBox);
offsetMenu.addEventListener("click", activateOffset);
trimExtendMenu.addEventListener("click", activateTrimExtend);
filletRadiusMenu.addEventListener("click", activateFillet);
rotateMenu.addEventListener("click", activateRotate);
translateCoordinatesMenu.addEventListener("click", activateTranslate);
translateByPointsMenu.addEventListener("click", activateTranslateByPoints);
linearDimensionMenu.addEventListener("click", () =>
  activateDimension("linear"),
);
diameterDimensionMenu.addEventListener("click", () =>
  activateDimension("diameter"),
);
radiusDimensionMenu.addEventListener("click", () =>
  activateDimension("radius"),
);
angleDimensionMenu.addEventListener("click", () => activateDimension("angle"));
mirrorXAxisMenu.addEventListener("click", () => mirrorSelectedEntities("x"));
mirrorYAxisMenu.addEventListener("click", () => mirrorSelectedEntities("y"));
mirrorBothAxesMenu.addEventListener("click", () =>
  mirrorSelectedEntities("both"),
);
fileMenuButton.addEventListener("click", () => {
  fileMenuItem.classList.remove("is-dismissed");
});
drawMenuButton.addEventListener("click", () => {
  drawMenuItem.classList.remove("is-dismissed");
});
modelMenuButton.addEventListener("click", () => {
  modelMenuItem.classList.remove("is-dismissed");
});
modifyMenuButton.addEventListener("click", () => {
  modifyMenuItem.classList.remove("is-dismissed");
});
dimensionMenuButton.addEventListener("click", () => {
  dimensionMenuItem.classList.remove("is-dismissed");
});
editMenuButton.addEventListener("click", () => {
  editMenuItem.classList.remove("is-dismissed");
});
undoMenu.addEventListener("click", undoDocumentChange);
redoMenu.addEventListener("click", redoDocumentChange);
copyMenu.addEventListener("click", copySelectedEntities);
pasteMenu.addEventListener("click", pasteCopiedEntities);
cutMenu.addEventListener("click", cutSelectedEntities);
deleteMenu.addEventListener("click", deleteSelectedEntity);
quickIsometricButton.addEventListener("click", () => {
  if (textPlacementState.active) closeTextWindow(null);
  toggleIsometricView();
});
quickUndoButton.addEventListener("click", () => {
  if (textPlacementState.active) closeTextWindow(null);
  deactivatePointEnd();
  deactivateWindowZoom();
  undoDocumentChange();
});
quickRedoButton.addEventListener("click", () => {
  if (textPlacementState.active) closeTextWindow(null);
  deactivatePointEnd();
  deactivateWindowZoom();
  redoDocumentChange();
});
quickZoomInButton.addEventListener("click", () => {
  if (textPlacementState.active) closeTextWindow(null);
  deactivatePointEnd();
  zoomIn();
});
quickZoomOutButton.addEventListener("click", () => {
  if (textPlacementState.active) closeTextWindow(null);
  deactivatePointEnd();
  zoomOut();
});
quickZoomWindowButton.addEventListener("click", () => {
  if (textPlacementState.active) closeTextWindow(null);
  deactivatePointEnd();
  deactivateDimension();
  activateWindowZoom();
});
quickHomeButton.addEventListener("click", () => {
  if (textPlacementState.active) closeTextWindow(null);
  deactivatePointEnd();
  homeView();
});
quickFitButton.addEventListener("click", () => {
  if (textPlacementState.active) closeTextWindow(null);
  deactivatePointEnd();
  fitAllGeometry();
});
quickCalculatorButton.addEventListener("click", () => {
  if (textPlacementState.active) closeTextWindow(null);
  deactivatePointEnd();
  openCalculatorWindow();
});

boxMinimizeButton.addEventListener("click", toggleBoxWindowMinimized);
boxMaximizeButton.addEventListener("click", toggleBoxWindowMaximized);
boxCloseButton.addEventListener("click", () => closeBoxWindow());
boxCancelButton.addEventListener("click", () => closeBoxWindow());
boxWindowTitleBar.addEventListener("pointerdown", beginBoxWindowDrag);
boxWindowTitleBar.addEventListener("pointermove", continueBoxWindowDrag);
boxWindowTitleBar.addEventListener("pointerup", endBoxWindowDrag);
boxWindowTitleBar.addEventListener("pointercancel", endBoxWindowDrag);
boxWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) toggleBoxWindowMaximized();
});

menuBar.addEventListener(
  "click",
  (event) => {
    const commandButton = event.target.closest(".dropdown-menu button");
    const isGeometryMutationCommand =
      commandButton &&
      !commandButton.disabled &&
      (drawMenuItem.contains(commandButton) ||
        modifyMenuItem.contains(commandButton) ||
        dimensionMenuItem.contains(commandButton) ||
        [pasteMenu, cutMenu, deleteMenu].includes(commandButton));
    const layerRestrictionMessage = isGeometryMutationCommand
      ? getCurrentLayerRestrictionMessage("Layer")
      : null;
    if (layerRestrictionMessage) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      commandStatus.textContent = layerRestrictionMessage;
      return;
    }
    if (
      pointEndState.active &&
      commandButton &&
      commandButton !== pointEndMenu &&
      !commandButton.disabled
    ) {
      deactivatePointEnd();
    }
    const dimensionButtons = [
      linearDimensionMenu,
      diameterDimensionMenu,
      radiusDimensionMenu,
      angleDimensionMenu,
    ];
    if (
      dimensionState.activeType !== null &&
      commandButton &&
      !dimensionButtons.includes(commandButton) &&
      !commandButton.disabled
    ) {
      deactivateDimension();
    }
    if (
      !hexagonWindow.hidden &&
      commandButton &&
      ![hexagonPointCenterMenu, hexagonDefineCenterMenu].includes(
        commandButton,
      ) &&
      !commandButton.disabled
    ) {
      closeHexagonWindow(null);
    }
    if (
      !rectangleWindow.hidden &&
      commandButton &&
      ![rectanglePointCenterMenu, rectangleDefineCenterMenu].includes(
        commandButton,
      ) &&
      !commandButton.disabled
    ) {
      closeRectangleWindow(null);
    }
    if (
      !boltHoleCircleWindow.hidden &&
      commandButton &&
      ![
        boltHoleCirclePointCenterMenu,
        boltHoleCircleDefineCenterMenu,
      ].includes(commandButton) &&
      !commandButton.disabled
    ) {
      closeBoltHoleCircleWindow(null);
    }
    if (
      textPlacementState.active &&
      commandButton &&
      commandButton !== textMenu &&
      !commandButton.disabled
    ) {
      closeTextWindow(null);
    }
    if (
      !boxWindow.hidden &&
      commandButton &&
      commandButton !== modelBoxMenu &&
      !commandButton.disabled
    ) {
      closeBoxWindow(null);
    }
    if (
      !translateWindow.hidden &&
      commandButton &&
      commandButton !== translateCoordinatesMenu &&
      !commandButton.disabled
    ) {
      closeTranslateWindow(null);
    }
    if (
      !pointIncrementalWindow.hidden &&
      commandButton &&
      commandButton !== pointIncrementalMenu &&
      !commandButton.disabled
    ) {
      closePointIncrementalWindow(null);
    }
    if (
      !translateByPointsWindow.hidden &&
      commandButton &&
      commandButton !== translateByPointsMenu &&
      !commandButton.disabled
    ) {
      closeTranslateByPointsWindow(null);
    }
    if (
      lineAngleState.active &&
      commandButton &&
      commandButton !== lineAngleMenu &&
      !commandButton.disabled
    ) {
      deactivateLineAngle();
    }
    if (
      lineTangentState.active &&
      commandButton &&
      commandButton !== lineTangentMenu &&
      !commandButton.disabled
    ) {
      deactivateLineTangent();
    }
    if (
      windowZoomState.active &&
      commandButton &&
      commandButton !== windowZoomMenu
    ) {
      deactivateWindowZoom();
    }
  },
  { capture: true },
);
viewMenuButton.addEventListener("click", () => {
  viewMenuItem.classList.remove("is-dismissed");
});
zoomInMenu.addEventListener("click", () => {
  dismissViewMenu();
  zoomIn();
});
zoomOutMenu.addEventListener("click", () => {
  dismissViewMenu();
  zoomOut();
});
windowZoomMenu.addEventListener("click", activateWindowZoom);
homeViewMenu.addEventListener("click", () => {
  dismissViewMenu();
  homeView();
});
fitViewMenu.addEventListener("click", () => {
  dismissViewMenu();
  fitAllGeometry();
});
showTrihedronMenu.addEventListener("click", toggleTrihedronVisibility);
layerMenuButton.addEventListener("click", () => {
  layerMenuItem.classList.remove("is-dismissed");
});
layerList.addEventListener("click", handleLayerMenuClick);
newLayerMenu.addEventListener("click", createNewLayer);
helpMenuButton.addEventListener("click", () => {
  helpMenuItem.classList.remove("is-dismissed");
});
aboutMenu.addEventListener("click", openAboutWindow);
aboutCloseButton.addEventListener("click", () => {
  closeAboutWindow();
});
aboutWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || event.target.closest(".window-control")) return;
  const bounds = aboutWindow.getBoundingClientRect();
  aboutWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  aboutWindowTitleBar.classList.add("is-dragging");
  aboutWindowTitleBar.setPointerCapture(event.pointerId);
});
aboutWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = aboutWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = aboutWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - aboutWindowTitleBar.offsetHeight,
  );
  aboutWindow.style.left = `${Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX))}px`;
  aboutWindow.style.top = `${Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY))}px`;
  aboutWindowState.hasPosition = true;
});

function stopAboutWindowDrag(event) {
  if (aboutWindowState.drag?.pointerId !== event.pointerId) return;
  aboutWindowState.drag = null;
  aboutWindowTitleBar.classList.remove("is-dragging");
  if (aboutWindowTitleBar.hasPointerCapture(event.pointerId)) {
    aboutWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

aboutWindowTitleBar.addEventListener("pointerup", stopAboutWindowDrag);
aboutWindowTitleBar.addEventListener("pointercancel", stopAboutWindowDrag);
themeMenuButton.addEventListener("click", () => {
  themeMenuItem.classList.remove("is-dismissed");
});
Object.entries(THEME_MENUS).forEach(([themeName, menuButton]) => {
  menuButton.addEventListener("click", () => selectTheme(themeName));
});
unitsMenuButton.addEventListener("click", () => {
  unitsMenuItem.classList.remove("is-dismissed");
});
Object.entries(UNIT_MENUS).forEach(([units, menuButton]) => {
  menuButton.addEventListener("click", () => setDocumentUnits(units));
});
selectAllMenu.addEventListener("click", selectAllEntities);
singleSelectMenu.addEventListener("click", activateSingleSelect);
selectChainMenu.addEventListener("click", activateChainSelect);
selectLayerList.addEventListener("click", handleSelectLayerMenuClick);
selectPointsMenu.addEventListener("click", selectAllPoints);
selectLinesMenu.addEventListener("click", selectAllLines);
selectArcsMenu.addEventListener("click", selectAllArcsAndCircles);
selectDimensionsMenu.addEventListener("click", selectAllDimensions);
deselectAllMenu.addEventListener("click", deselectAllEntities);
selectMenuButton.addEventListener("click", () => {
  selectMenuItem.classList.remove("is-dismissed");
});

cadCanvas.addEventListener("pointerdown", (event) => {
  if (beginCanvasNavigation(event)) return;
  if (!windowZoomState.active || event.button !== 0) return;
  event.preventDefault();
  windowZoomState.drag = {
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    screenBounds: null,
    worldBounds: null,
  };
  cadCanvas.setPointerCapture(event.pointerId);
  updateWindowZoomDrag(event);
});

cadCanvas.addEventListener("pointermove", (event) => {
  if (continueCanvasNavigation(event)) return;
  if (windowZoomState.active) updateWindowZoomDrag(event);
});

cadCanvas.addEventListener("pointerup", (event) => {
  if (finishCanvasNavigation(event)) return;
  if (windowZoomState.active) {
    completeWindowZoom(event);
  } else if (windowZoomState.canceledPointerId === event.pointerId) {
    windowZoomState.canceledPointerId = null;
    windowZoomState.suppressClickUntil = performance.now() + 200;
  }
});

cadCanvas.addEventListener("pointercancel", (event) => {
  if (canvasNavigationState.drag?.pointerId === event.pointerId) {
    cancelCanvasNavigation("Navigation interrupted.");
    return;
  }
  if (windowZoomState.active) {
    cancelWindowZoomDrag(event);
  } else if (windowZoomState.canceledPointerId === event.pointerId) {
    windowZoomState.canceledPointerId = null;
    windowZoomState.suppressClickUntil = 0;
  }
});

cadCanvas.addEventListener("wheel", zoomCanvasAtPointer, { passive: false });

cadCanvas.addEventListener("auxclick", (event) => {
  if (event.button === 1) event.preventDefault();
});

cadCanvas.addEventListener("contextmenu", (event) => {
  if (!isometricViewState.active) return;
  event.preventDefault();
  if (performance.now() <= canvasNavigationState.suppressContextMenuUntil) {
    return;
  }
  commandStatus.textContent =
    "3D context menu is reserved for a future command set.";
});

cadCanvas.addEventListener("click", (event) => {
  if (performance.now() <= canvasNavigationState.suppressClickUntil) {
    canvasNavigationState.suppressClickUntil = 0;
    return;
  }
  canvasNavigationState.suppressClickUntil = 0;
  if (isometricViewState.active) return;
  if (performance.now() <= windowZoomState.suppressClickUntil) {
    windowZoomState.suppressClickUntil = 0;
    return;
  }
  windowZoomState.suppressClickUntil = 0;
  if (windowZoomState.active) return;

  if (textPlacementState.active) {
    handleTextPlacementClick(event);
    return;
  }

  if (rotateState.active && rotateState.awaitingPivot) {
    handleRotatePivotClick(event);
    return;
  }

  if (translateByPointsState.active) {
    handleTranslateByPointsClick(event);
    return;
  }

  if (dimensionState.activeType !== null) {
    handleDimensionClick(event);
    return;
  }

  if (lineAngleState.active) {
    handleLineAngleClick(event);
    return;
  }

  if (lineTangentState.active) {
    handleLineTangentClick(event);
    return;
  }

  if (pointSketchState.active) {
    handlePointSketchClick(event);
    return;
  }

  if (lineSketchState.active) {
    handleLineSketchClick(event);
    return;
  }

  if (threeEntityCircleState.active) {
    handleThreeEntityCircleClick(event);
    return;
  }

  if (circleState.active) {
    handleCircleCenterClick(event);
    return;
  }

  if (hexagonState.active && hexagonState.centerMode === "point") {
    handleHexagonCenterClick(event);
    return;
  }

  if (rectangleState.active && rectangleState.centerMode === "point") {
    handleRectangleCenterClick(event);
    return;
  }

  if (
    boltHoleCircleState.active &&
    boltHoleCircleState.centerMode === "point"
  ) {
    handleBoltHoleCircleCenterClick(event);
    return;
  }

  if (offsetState.active) {
    handleOffsetClick(event);
    return;
  }

  if (trimExtendState.active) {
    handleTrimExtendClick(event);
    return;
  }

  if (filletState.active) {
    handleFilletClick(event);
    return;
  }

  if (pointEndState.active) {
    handlePointEndClick(event);
    return;
  }

  if (pointOnEntityState.active) {
    handlePointOnEntityClick(event);
    return;
  }

  if (intersectionState.active) {
    handleIntersectingPointClick(event);
    return;
  }

  if (joinState.active) {
    handleJoinClick(event);
    return;
  }

  if (selectionState.mode === "chain") {
    handleChainSelectClick(event);
    return;
  }

  if (selectionState.mode !== "single") return;

  const worldPoint = screenToWorld(event);
  const candidates = getSelectionHitCandidates(worldPoint, event.target);
  if (candidates.length) {
    const candidateIds = candidates.map(({ entity }) => entity.id);
    const previousCycle = selectionState.pickCycle;
    const repeatsPreviousPick =
      previousCycle !== null &&
      Math.hypot(
        event.clientX - previousCycle.clientX,
        event.clientY - previousCycle.clientY,
      ) <= 4 &&
      candidateIds.length === previousCycle.candidateIds.length &&
      candidateIds.every(
        (id, index) => id === previousCycle.candidateIds[index],
      );
    const candidateIndex = repeatsPreviousPick
      ? (previousCycle.index + 1) % candidates.length
      : 0;
    const selectedEntity = candidates[candidateIndex].entity;
    selectionState.pickCycle = {
      clientX: event.clientX,
      clientY: event.clientY,
      candidateIds,
      index: candidateIndex,
    };
    const previousSelectionCount = selectionState.selectedEntityIds.size;
    addEntityIdsToSelection([selectedEntity.id]);
    const wasAdded =
      selectionState.selectedEntityIds.size > previousSelectionCount;
    selectionState.hoveredEntityId = null;
    renderEntities();
    commandStatus.textContent =
      `${wasAdded ? "Selected" : "Kept selected"} ` +
      `${selectedEntity.type} ${selectedEntity.id}; ` +
      `${selectionState.selectedEntityIds.size} total` +
      (candidates.length > 1
        ? ` (${candidates.length} entities here; click again to cycle).`
        : ".");
    return;
  }

  selectionState.selectedEntityId = null;
  selectionState.hoveredEntityId = null;
  selectionState.pickCycle = null;
  renderEntities();
  commandStatus.textContent = "Selection cleared";
});

pointMinimizeButton.addEventListener("click", () => {
  if (pointCoordinatesWindow.classList.contains("is-maximized")) {
    restorePointWindow();
  }

  const minimized = !pointCoordinatesWindow.classList.contains("is-minimized");
  setPointWindowMinimized(minimized);
});

pointMaximizeButton.addEventListener("click", togglePointWindowMaximized);

pointCloseButton.addEventListener("click", () => {
  closePointCoordinatesWindow();
});

pointContinueButton.addEventListener("click", () => {
  createPointFromInputs(true);
});

pointCancelButton.addEventListener("click", () => {
  closePointCoordinatesWindow();
});

lineCoordinatesMinimizeButton.addEventListener("click", () => {
  if (lineCoordinatesWindow.classList.contains("is-maximized")) {
    restoreLineCoordinatesWindow();
  }
  const minimized = !lineCoordinatesWindow.classList.contains("is-minimized");
  setLineCoordinatesWindowMinimized(minimized);
});

lineCoordinatesMaximizeButton.addEventListener(
  "click",
  toggleLineCoordinatesWindowMaximized,
);

lineCoordinatesCloseButton.addEventListener("click", () => {
  closeLineCoordinatesWindow("Line - Coordinates canceled.");
});

lineCoordinatesContinueButton.addEventListener("click", () => {
  createLineFromCoordinateInputs(true);
});

lineCoordinatesCancelButton.addEventListener("click", () => {
  closeLineCoordinatesWindow("Line - Coordinates canceled.");
});

lineCoordinatesWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    lineCoordinatesWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = lineCoordinatesWindow.getBoundingClientRect();
  lineCoordinatesWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  lineCoordinatesWindowTitleBar.classList.add("is-dragging");
  lineCoordinatesWindowTitleBar.setPointerCapture(event.pointerId);
});

lineCoordinatesWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = lineCoordinatesWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = lineCoordinatesWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - lineCoordinatesWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));
  lineCoordinatesWindow.style.left = `${left}px`;
  lineCoordinatesWindow.style.top = `${top}px`;
  lineCoordinatesWindowState.hasPosition = true;
});

function stopLineCoordinatesWindowDrag(event) {
  if (lineCoordinatesWindowState.drag?.pointerId !== event.pointerId) return;
  lineCoordinatesWindowState.drag = null;
  lineCoordinatesWindowTitleBar.classList.remove("is-dragging");
  if (lineCoordinatesWindowTitleBar.hasPointerCapture(event.pointerId)) {
    lineCoordinatesWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

lineCoordinatesWindowTitleBar.addEventListener(
  "pointerup",
  stopLineCoordinatesWindowDrag,
);
lineCoordinatesWindowTitleBar.addEventListener(
  "pointercancel",
  stopLineCoordinatesWindowDrag,
);

lineCoordinatesWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    toggleLineCoordinatesWindowMaximized();
  }
});

lineAngleMinimizeButton.addEventListener("click", () => {
  if (lineAngleWindow.classList.contains("is-maximized")) {
    restoreLineAngleWindow();
  }
  const minimized = !lineAngleWindow.classList.contains("is-minimized");
  setLineAngleWindowMinimized(minimized);
});

lineAngleMaximizeButton.addEventListener(
  "click",
  toggleLineAngleWindowMaximized,
);

lineAngleCloseButton.addEventListener("click", () => {
  deactivateLineAngle("Line - Angle canceled.");
});

lineAngleCancelButton.addEventListener("click", () => {
  deactivateLineAngle("Line - Angle canceled.");
});

lineAngleWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    lineAngleWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = lineAngleWindow.getBoundingClientRect();
  lineAngleWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  lineAngleWindowTitleBar.classList.add("is-dragging");
  lineAngleWindowTitleBar.setPointerCapture(event.pointerId);
});

lineAngleWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = lineAngleWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = lineAngleWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - lineAngleWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));
  lineAngleWindow.style.left = `${left}px`;
  lineAngleWindow.style.top = `${top}px`;
  lineAngleWindowState.hasPosition = true;
});

function stopLineAngleWindowDrag(event) {
  if (lineAngleWindowState.drag?.pointerId !== event.pointerId) return;
  lineAngleWindowState.drag = null;
  lineAngleWindowTitleBar.classList.remove("is-dragging");
  if (lineAngleWindowTitleBar.hasPointerCapture(event.pointerId)) {
    lineAngleWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

lineAngleWindowTitleBar.addEventListener("pointerup", stopLineAngleWindowDrag);
lineAngleWindowTitleBar.addEventListener(
  "pointercancel",
  stopLineAngleWindowDrag,
);

lineAngleWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    toggleLineAngleWindowMaximized();
  }
});

lineTangentMinimizeButton.addEventListener("click", () => {
  if (lineTangentWindow.classList.contains("is-maximized")) {
    restoreLineTangentWindow();
  }
  const minimized = !lineTangentWindow.classList.contains("is-minimized");
  setLineTangentWindowMinimized(minimized);
});

lineTangentMaximizeButton.addEventListener(
  "click",
  toggleLineTangentWindowMaximized,
);

lineTangentCloseButton.addEventListener("click", () => {
  deactivateLineTangent("Line - Tangent canceled.");
});

lineTangentCancelButton.addEventListener("click", () => {
  deactivateLineTangent("Line - Tangent canceled.");
});

lineTangentWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    lineTangentWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = lineTangentWindow.getBoundingClientRect();
  lineTangentWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  lineTangentWindowTitleBar.classList.add("is-dragging");
  lineTangentWindowTitleBar.setPointerCapture(event.pointerId);
});

lineTangentWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = lineTangentWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = lineTangentWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - lineTangentWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));
  lineTangentWindow.style.left = `${left}px`;
  lineTangentWindow.style.top = `${top}px`;
  lineTangentWindowState.hasPosition = true;
});

function stopLineTangentWindowDrag(event) {
  if (lineTangentWindowState.drag?.pointerId !== event.pointerId) return;
  lineTangentWindowState.drag = null;
  lineTangentWindowTitleBar.classList.remove("is-dragging");
  if (lineTangentWindowTitleBar.hasPointerCapture(event.pointerId)) {
    lineTangentWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

lineTangentWindowTitleBar.addEventListener(
  "pointerup",
  stopLineTangentWindowDrag,
);
lineTangentWindowTitleBar.addEventListener(
  "pointercancel",
  stopLineTangentWindowDrag,
);

lineTangentWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    toggleLineTangentWindowMaximized();
  }
});

pointOnEntityMinimizeButton.addEventListener("click", () => {
  if (pointOnEntityWindow.classList.contains("is-maximized")) {
    restorePointOnEntityWindow();
  }

  const minimized = !pointOnEntityWindow.classList.contains("is-minimized");
  setPointOnEntityWindowMinimized(minimized);
});

pointOnEntityMaximizeButton.addEventListener(
  "click",
  togglePointOnEntityWindowMaximized,
);

pointOnEntityCloseButton.addEventListener("click", () => {
  deactivatePointOnEntity("Point on Entity canceled.");
});

pointOnEntityCancelButton.addEventListener("click", () => {
  deactivatePointOnEntity("Point on Entity canceled.");
});

pointOnEntityWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    pointOnEntityWindow.classList.contains("is-maximized")
  ) {
    return;
  }

  const bounds = pointOnEntityWindow.getBoundingClientRect();
  pointOnEntityWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  pointOnEntityWindowTitleBar.classList.add("is-dragging");
  pointOnEntityWindowTitleBar.setPointerCapture(event.pointerId);
});

pointOnEntityWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = pointOnEntityWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;

  const bounds = pointOnEntityWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - pointOnEntityWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));

  pointOnEntityWindow.style.left = `${left}px`;
  pointOnEntityWindow.style.top = `${top}px`;
  pointOnEntityWindowState.hasPosition = true;
});

function stopPointOnEntityWindowDrag(event) {
  if (pointOnEntityWindowState.drag?.pointerId !== event.pointerId) return;

  pointOnEntityWindowState.drag = null;
  pointOnEntityWindowTitleBar.classList.remove("is-dragging");
  if (pointOnEntityWindowTitleBar.hasPointerCapture(event.pointerId)) {
    pointOnEntityWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

pointOnEntityWindowTitleBar.addEventListener(
  "pointerup",
  stopPointOnEntityWindowDrag,
);
pointOnEntityWindowTitleBar.addEventListener(
  "pointercancel",
  stopPointOnEntityWindowDrag,
);

pointOnEntityWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    togglePointOnEntityWindowMaximized();
  }
});

circleMinimizeButton.addEventListener("click", () => {
  if (circleRadiusWindow.classList.contains("is-maximized")) {
    restoreCircleWindow();
  }

  const minimized = !circleRadiusWindow.classList.contains("is-minimized");
  setCircleWindowMinimized(minimized);
});

circleMaximizeButton.addEventListener("click", toggleCircleWindowMaximized);

circleCloseButton.addEventListener("click", () => {
  closeCircleRadiusWindow("Circle canceled.");
});

circleCancelButton.addEventListener("click", () => {
  closeCircleRadiusWindow("Circle canceled.");
});

circleContinueButton.addEventListener("click", () => {
  createCoordinateCircleFromInputs(true);
});

circleWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    circleRadiusWindow.classList.contains("is-maximized")
  ) {
    return;
  }

  const bounds = circleRadiusWindow.getBoundingClientRect();
  circleWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  circleWindowTitleBar.classList.add("is-dragging");
  circleWindowTitleBar.setPointerCapture(event.pointerId);
});

circleWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = circleWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;

  const bounds = circleRadiusWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - circleWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));

  circleRadiusWindow.style.left = `${left}px`;
  circleRadiusWindow.style.top = `${top}px`;
  circleWindowState.hasPosition = true;
});

function stopCircleWindowDrag(event) {
  if (circleWindowState.drag?.pointerId !== event.pointerId) return;

  circleWindowState.drag = null;
  circleWindowTitleBar.classList.remove("is-dragging");
  if (circleWindowTitleBar.hasPointerCapture(event.pointerId)) {
    circleWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

circleWindowTitleBar.addEventListener("pointerup", stopCircleWindowDrag);
circleWindowTitleBar.addEventListener("pointercancel", stopCircleWindowDrag);

circleWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    toggleCircleWindowMaximized();
  }
});

hexagonMinimizeButton.addEventListener("click", () => {
  if (hexagonWindow.classList.contains("is-maximized")) {
    restoreHexagonWindow();
  }
  const minimized = !hexagonWindow.classList.contains("is-minimized");
  setHexagonWindowMinimized(minimized);
});

hexagonMaximizeButton.addEventListener("click", toggleHexagonWindowMaximized);

hexagonCloseButton.addEventListener("click", () => {
  closeHexagonWindow("Hexagon canceled.");
});

hexagonCancelButton.addEventListener("click", () => {
  closeHexagonWindow("Hexagon canceled.");
});

hexagonWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    hexagonWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = hexagonWindow.getBoundingClientRect();
  hexagonWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  hexagonWindowTitleBar.classList.add("is-dragging");
  hexagonWindowTitleBar.setPointerCapture(event.pointerId);
});

hexagonWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = hexagonWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = hexagonWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - hexagonWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));
  hexagonWindow.style.left = `${left}px`;
  hexagonWindow.style.top = `${top}px`;
  hexagonWindowState.hasPosition = true;
});

function stopHexagonWindowDrag(event) {
  if (hexagonWindowState.drag?.pointerId !== event.pointerId) return;
  hexagonWindowState.drag = null;
  hexagonWindowTitleBar.classList.remove("is-dragging");
  if (hexagonWindowTitleBar.hasPointerCapture(event.pointerId)) {
    hexagonWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

hexagonWindowTitleBar.addEventListener("pointerup", stopHexagonWindowDrag);
hexagonWindowTitleBar.addEventListener("pointercancel", stopHexagonWindowDrag);

hexagonWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    toggleHexagonWindowMaximized();
  }
});

rectangleMinimizeButton.addEventListener("click", () => {
  if (rectangleWindow.classList.contains("is-maximized")) {
    restoreRectangleWindow();
  }
  const minimized = !rectangleWindow.classList.contains("is-minimized");
  setRectangleWindowMinimized(minimized);
});

rectangleMaximizeButton.addEventListener(
  "click",
  toggleRectangleWindowMaximized,
);

rectangleCloseButton.addEventListener("click", () => {
  closeRectangleWindow("Rectangle canceled.");
});

rectangleCancelButton.addEventListener("click", () => {
  closeRectangleWindow("Rectangle canceled.");
});

rectangleWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    rectangleWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = rectangleWindow.getBoundingClientRect();
  rectangleWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  rectangleWindowTitleBar.classList.add("is-dragging");
  rectangleWindowTitleBar.setPointerCapture(event.pointerId);
});

rectangleWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = rectangleWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = rectangleWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - rectangleWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));
  rectangleWindow.style.left = `${left}px`;
  rectangleWindow.style.top = `${top}px`;
  rectangleWindowState.hasPosition = true;
});

function stopRectangleWindowDrag(event) {
  if (rectangleWindowState.drag?.pointerId !== event.pointerId) return;
  rectangleWindowState.drag = null;
  rectangleWindowTitleBar.classList.remove("is-dragging");
  if (rectangleWindowTitleBar.hasPointerCapture(event.pointerId)) {
    rectangleWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

rectangleWindowTitleBar.addEventListener("pointerup", stopRectangleWindowDrag);
rectangleWindowTitleBar.addEventListener(
  "pointercancel",
  stopRectangleWindowDrag,
);

rectangleWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    toggleRectangleWindowMaximized();
  }
});

boltHoleCircleMinimizeButton.addEventListener("click", () => {
  if (boltHoleCircleWindow.classList.contains("is-maximized")) {
    restoreBoltHoleCircleWindow();
  }
  const minimized = !boltHoleCircleWindow.classList.contains("is-minimized");
  setBoltHoleCircleWindowMinimized(minimized);
});

boltHoleCircleMaximizeButton.addEventListener(
  "click",
  toggleBoltHoleCircleWindowMaximized,
);

boltHoleCircleCloseButton.addEventListener("click", () => {
  closeBoltHoleCircleWindow("Bolt Hole Circle canceled.");
});

boltHoleCircleCancelButton.addEventListener("click", () => {
  closeBoltHoleCircleWindow("Bolt Hole Circle canceled.");
});

boltHoleCircleWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    boltHoleCircleWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = boltHoleCircleWindow.getBoundingClientRect();
  boltHoleCircleWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  boltHoleCircleWindowTitleBar.classList.add("is-dragging");
  boltHoleCircleWindowTitleBar.setPointerCapture(event.pointerId);
});

boltHoleCircleWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = boltHoleCircleWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = boltHoleCircleWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - boltHoleCircleWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));
  boltHoleCircleWindow.style.left = `${left}px`;
  boltHoleCircleWindow.style.top = `${top}px`;
  boltHoleCircleWindowState.hasPosition = true;
});

function stopBoltHoleCircleWindowDrag(event) {
  if (boltHoleCircleWindowState.drag?.pointerId !== event.pointerId) return;
  boltHoleCircleWindowState.drag = null;
  boltHoleCircleWindowTitleBar.classList.remove("is-dragging");
  if (boltHoleCircleWindowTitleBar.hasPointerCapture(event.pointerId)) {
    boltHoleCircleWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

boltHoleCircleWindowTitleBar.addEventListener(
  "pointerup",
  stopBoltHoleCircleWindowDrag,
);
boltHoleCircleWindowTitleBar.addEventListener(
  "pointercancel",
  stopBoltHoleCircleWindowDrag,
);

boltHoleCircleWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    toggleBoltHoleCircleWindowMaximized();
  }
});

textMinimizeButton.addEventListener("click", () => {
  if (textWindow.classList.contains("is-maximized")) restoreTextWindow();
  const minimized = !textWindow.classList.contains("is-minimized");
  setTextWindowMinimized(minimized);
});

textMaximizeButton.addEventListener("click", toggleTextWindowMaximized);

textCloseButton.addEventListener("click", () => {
  closeTextWindow("Text canceled.");
});

textCancelButton.addEventListener("click", () => {
  closeTextWindow("Text canceled.");
});

textWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    textWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = textWindow.getBoundingClientRect();
  textWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  textWindowTitleBar.classList.add("is-dragging");
  textWindowTitleBar.setPointerCapture(event.pointerId);
});

textWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = textWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = textWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - textWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));
  textWindow.style.left = `${left}px`;
  textWindow.style.top = `${top}px`;
  textWindowState.hasPosition = true;
});

function stopTextWindowDrag(event) {
  if (textWindowState.drag?.pointerId !== event.pointerId) return;
  textWindowState.drag = null;
  textWindowTitleBar.classList.remove("is-dragging");
  if (textWindowTitleBar.hasPointerCapture(event.pointerId)) {
    textWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

textWindowTitleBar.addEventListener("pointerup", stopTextWindowDrag);
textWindowTitleBar.addEventListener("pointercancel", stopTextWindowDrag);
textWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) toggleTextWindowMaximized();
});

offsetMinimizeButton.addEventListener("click", () => {
  if (offsetWindow.classList.contains("is-maximized")) {
    restoreOffsetWindow();
  }

  const minimized = !offsetWindow.classList.contains("is-minimized");
  setOffsetWindowMinimized(minimized);
});

offsetMaximizeButton.addEventListener("click", toggleOffsetWindowMaximized);

offsetCloseButton.addEventListener("click", () => {
  closeOffsetWindow("Offset canceled.");
});

offsetCancelButton.addEventListener("click", () => {
  closeOffsetWindow("Offset canceled.");
});

offsetWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    offsetWindow.classList.contains("is-maximized")
  ) {
    return;
  }

  const bounds = offsetWindow.getBoundingClientRect();
  offsetWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  offsetWindowTitleBar.classList.add("is-dragging");
  offsetWindowTitleBar.setPointerCapture(event.pointerId);
});

offsetWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = offsetWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;

  const bounds = offsetWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - offsetWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));

  offsetWindow.style.left = `${left}px`;
  offsetWindow.style.top = `${top}px`;
  offsetWindowState.hasPosition = true;
});

function stopOffsetWindowDrag(event) {
  if (offsetWindowState.drag?.pointerId !== event.pointerId) return;

  offsetWindowState.drag = null;
  offsetWindowTitleBar.classList.remove("is-dragging");
  if (offsetWindowTitleBar.hasPointerCapture(event.pointerId)) {
    offsetWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

offsetWindowTitleBar.addEventListener("pointerup", stopOffsetWindowDrag);
offsetWindowTitleBar.addEventListener("pointercancel", stopOffsetWindowDrag);

offsetWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    toggleOffsetWindowMaximized();
  }
});

filletMinimizeButton.addEventListener("click", () => {
  if (filletWindow.classList.contains("is-maximized")) {
    restoreFilletWindow();
  }
  const minimized = !filletWindow.classList.contains("is-minimized");
  setFilletWindowMinimized(minimized);
});

filletMaximizeButton.addEventListener("click", toggleFilletWindowMaximized);

filletCloseButton.addEventListener("click", () => {
  deactivateFillet("Fillet Radius canceled.");
});

filletCancelButton.addEventListener("click", () => {
  deactivateFillet("Fillet Radius canceled.");
});

filletWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    filletWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = filletWindow.getBoundingClientRect();
  filletWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  filletWindowTitleBar.classList.add("is-dragging");
  filletWindowTitleBar.setPointerCapture(event.pointerId);
});

filletWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = filletWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = filletWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - filletWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));
  filletWindow.style.left = `${left}px`;
  filletWindow.style.top = `${top}px`;
  filletWindowState.hasPosition = true;
});

function stopFilletWindowDrag(event) {
  if (filletWindowState.drag?.pointerId !== event.pointerId) return;
  filletWindowState.drag = null;
  filletWindowTitleBar.classList.remove("is-dragging");
  if (filletWindowTitleBar.hasPointerCapture(event.pointerId)) {
    filletWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

filletWindowTitleBar.addEventListener("pointerup", stopFilletWindowDrag);
filletWindowTitleBar.addEventListener("pointercancel", stopFilletWindowDrag);

filletWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    toggleFilletWindowMaximized();
  }
});

rotatePivotOriginInput.addEventListener("change", () => {
  if (rotatePivotOriginInput.checked) useRotateOrigin();
});

rotatePivotPointInput.addEventListener("change", () => {
  if (rotatePivotPointInput.checked) beginRotatePivotSelection();
});

rotateChoosePointButton.addEventListener("click", beginRotatePivotSelection);

rotateMinimizeButton.addEventListener("click", () => {
  if (rotateWindow.classList.contains("is-maximized")) {
    restoreRotateWindow();
  }
  const minimized = !rotateWindow.classList.contains("is-minimized");
  setRotateWindowMinimized(minimized);
});

rotateMaximizeButton.addEventListener("click", toggleRotateWindowMaximized);

rotateCloseButton.addEventListener("click", () => {
  deactivateRotate("Rotate canceled.");
});

rotateCancelButton.addEventListener("click", () => {
  deactivateRotate("Rotate canceled.");
});

rotateWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    rotateWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = rotateWindow.getBoundingClientRect();
  rotateWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  rotateWindowTitleBar.classList.add("is-dragging");
  rotateWindowTitleBar.setPointerCapture(event.pointerId);
});

rotateWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = rotateWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = rotateWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - rotateWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));
  rotateWindow.style.left = `${left}px`;
  rotateWindow.style.top = `${top}px`;
  rotateWindowState.hasPosition = true;
});

function stopRotateWindowDrag(event) {
  if (rotateWindowState.drag?.pointerId !== event.pointerId) return;
  rotateWindowState.drag = null;
  rotateWindowTitleBar.classList.remove("is-dragging");
  if (rotateWindowTitleBar.hasPointerCapture(event.pointerId)) {
    rotateWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

rotateWindowTitleBar.addEventListener("pointerup", stopRotateWindowDrag);
rotateWindowTitleBar.addEventListener("pointercancel", stopRotateWindowDrag);

rotateWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    toggleRotateWindowMaximized();
  }
});

pointIncrementalMinimizeButton.addEventListener("click", () => {
  if (pointIncrementalWindow.classList.contains("is-maximized")) {
    restorePointIncrementalWindow();
  }
  const minimized = !pointIncrementalWindow.classList.contains("is-minimized");
  setPointIncrementalWindowMinimized(minimized);
});

pointIncrementalMaximizeButton.addEventListener(
  "click",
  togglePointIncrementalWindowMaximized,
);

pointIncrementalCloseButton.addEventListener("click", () => {
  closePointIncrementalWindow("Point - Incremental canceled.");
});

pointIncrementalCancelButton.addEventListener("click", () => {
  closePointIncrementalWindow("Point - Incremental canceled.");
});

pointIncrementalWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    pointIncrementalWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = pointIncrementalWindow.getBoundingClientRect();
  pointIncrementalWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  pointIncrementalWindowTitleBar.classList.add("is-dragging");
  pointIncrementalWindowTitleBar.setPointerCapture(event.pointerId);
});

pointIncrementalWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = pointIncrementalWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = pointIncrementalWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - pointIncrementalWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));
  pointIncrementalWindow.style.left = `${left}px`;
  pointIncrementalWindow.style.top = `${top}px`;
  pointIncrementalWindowState.hasPosition = true;
});

function stopPointIncrementalWindowDrag(event) {
  if (pointIncrementalWindowState.drag?.pointerId !== event.pointerId) return;
  pointIncrementalWindowState.drag = null;
  pointIncrementalWindowTitleBar.classList.remove("is-dragging");
  if (pointIncrementalWindowTitleBar.hasPointerCapture(event.pointerId)) {
    pointIncrementalWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

pointIncrementalWindowTitleBar.addEventListener(
  "pointerup",
  stopPointIncrementalWindowDrag,
);
pointIncrementalWindowTitleBar.addEventListener(
  "pointercancel",
  stopPointIncrementalWindowDrag,
);

pointIncrementalWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    togglePointIncrementalWindowMaximized();
  }
});

translateByPointsMinimizeButton.addEventListener("click", () => {
  if (translateByPointsWindow.classList.contains("is-maximized")) {
    restoreTranslateByPointsWindow();
  }
  const minimized = !translateByPointsWindow.classList.contains("is-minimized");
  setTranslateByPointsWindowMinimized(minimized);
});

translateByPointsMaximizeButton.addEventListener(
  "click",
  toggleTranslateByPointsWindowMaximized,
);

translateByPointsCloseButton.addEventListener("click", () => {
  closeTranslateByPointsWindow("Translate - By Points canceled.");
});

translateByPointsCancelButton.addEventListener("click", () => {
  closeTranslateByPointsWindow("Translate - By Points canceled.");
});

translateByPointsWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    translateByPointsWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = translateByPointsWindow.getBoundingClientRect();
  translateByPointsWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  translateByPointsWindowTitleBar.classList.add("is-dragging");
  translateByPointsWindowTitleBar.setPointerCapture(event.pointerId);
});

translateByPointsWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = translateByPointsWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = translateByPointsWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - translateByPointsWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));
  translateByPointsWindow.style.left = `${left}px`;
  translateByPointsWindow.style.top = `${top}px`;
  translateByPointsWindowState.hasPosition = true;
});

function stopTranslateByPointsWindowDrag(event) {
  if (translateByPointsWindowState.drag?.pointerId !== event.pointerId) return;
  translateByPointsWindowState.drag = null;
  translateByPointsWindowTitleBar.classList.remove("is-dragging");
  if (translateByPointsWindowTitleBar.hasPointerCapture(event.pointerId)) {
    translateByPointsWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

translateByPointsWindowTitleBar.addEventListener(
  "pointerup",
  stopTranslateByPointsWindowDrag,
);
translateByPointsWindowTitleBar.addEventListener(
  "pointercancel",
  stopTranslateByPointsWindowDrag,
);

translateByPointsWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    toggleTranslateByPointsWindowMaximized();
  }
});

translateMinimizeButton.addEventListener("click", () => {
  if (translateWindow.classList.contains("is-maximized")) {
    restoreTranslateWindow();
  }
  const minimized = !translateWindow.classList.contains("is-minimized");
  setTranslateWindowMinimized(minimized);
});

translateMaximizeButton.addEventListener(
  "click",
  toggleTranslateWindowMaximized,
);

translateCloseButton.addEventListener("click", () => {
  closeTranslateWindow("Translate canceled.");
});

translateCancelButton.addEventListener("click", () => {
  closeTranslateWindow("Translate canceled.");
});

translateWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    translateWindow.classList.contains("is-maximized")
  ) {
    return;
  }
  const bounds = translateWindow.getBoundingClientRect();
  translateWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  translateWindowTitleBar.classList.add("is-dragging");
  translateWindowTitleBar.setPointerCapture(event.pointerId);
});

translateWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = translateWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const bounds = translateWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - translateWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));
  translateWindow.style.left = `${left}px`;
  translateWindow.style.top = `${top}px`;
  translateWindowState.hasPosition = true;
});

function stopTranslateWindowDrag(event) {
  if (translateWindowState.drag?.pointerId !== event.pointerId) return;
  translateWindowState.drag = null;
  translateWindowTitleBar.classList.remove("is-dragging");
  if (translateWindowTitleBar.hasPointerCapture(event.pointerId)) {
    translateWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

translateWindowTitleBar.addEventListener("pointerup", stopTranslateWindowDrag);
translateWindowTitleBar.addEventListener(
  "pointercancel",
  stopTranslateWindowDrag,
);

translateWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    toggleTranslateWindowMaximized();
  }
});

pointWindowTitleBar.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(".window-control") ||
    pointCoordinatesWindow.classList.contains("is-maximized")
  ) {
    return;
  }

  const bounds = pointCoordinatesWindow.getBoundingClientRect();
  pointWindowState.drag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - bounds.left,
    offsetY: event.clientY - bounds.top,
  };
  pointWindowTitleBar.classList.add("is-dragging");
  pointWindowTitleBar.setPointerCapture(event.pointerId);
});

pointWindowTitleBar.addEventListener("pointermove", (event) => {
  const drag = pointWindowState.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;

  const bounds = pointCoordinatesWindow.getBoundingClientRect();
  const maxLeft = Math.max(0, window.innerWidth - bounds.width);
  const maxTop = Math.max(
    0,
    window.innerHeight - pointWindowTitleBar.offsetHeight,
  );
  const left = Math.min(maxLeft, Math.max(0, event.clientX - drag.offsetX));
  const top = Math.min(maxTop, Math.max(0, event.clientY - drag.offsetY));

  pointCoordinatesWindow.style.left = `${left}px`;
  pointCoordinatesWindow.style.top = `${top}px`;
  pointWindowState.hasPosition = true;
});

function stopPointWindowDrag(event) {
  if (pointWindowState.drag?.pointerId !== event.pointerId) return;

  pointWindowState.drag = null;
  pointWindowTitleBar.classList.remove("is-dragging");
  if (pointWindowTitleBar.hasPointerCapture(event.pointerId)) {
    pointWindowTitleBar.releasePointerCapture(event.pointerId);
  }
}

pointWindowTitleBar.addEventListener("pointerup", stopPointWindowDrag);
pointWindowTitleBar.addEventListener("pointercancel", stopPointWindowDrag);

pointWindowTitleBar.addEventListener("dblclick", (event) => {
  if (!event.target.closest(".window-control")) {
    togglePointWindowMaximized();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.target.closest(".calc-window")) return;

  if (event.key === "Escape" && canvasNavigationState.drag) {
    event.preventDefault();
    cancelCanvasNavigation("Navigation canceled.");
    return;
  }

  if (event.key === "Escape" && !boxWindow.hidden) {
    event.preventDefault();
    closeBoxWindow();
    return;
  }

  if (isometricViewState.active) {
    if (event.key === "Escape") {
      event.preventDefault();
      exitIsometricView();
      return;
    }
  }

  const isEditingText = event.target.closest(
    "input, textarea, select, [contenteditable='true']",
  );
  const commandKey = event.ctrlKey || event.metaKey;

  if (!isEditingText && commandKey && !event.altKey) {
    const key = event.key.toLowerCase();
    if (key === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        redoDocumentChange();
      } else {
        undoDocumentChange();
      }
      return;
    }

    if (key === "y") {
      event.preventDefault();
      redoDocumentChange();
      return;
    }

    if (!event.shiftKey && key === "c") {
      event.preventDefault();
      copySelectedEntities();
      return;
    }

    if (!event.shiftKey && key === "v") {
      event.preventDefault();
      pasteCopiedEntities();
      return;
    }

    if (!event.shiftKey && key === "x") {
      event.preventDefault();
      cutSelectedEntities();
      return;
    }
  }

  if (!isEditingText && event.key === "Delete") {
    event.preventDefault();
    deleteSelectedEntity();
    return;
  }

  if (event.key === "Escape" && textPlacementState.active) {
    event.preventDefault();
    closeTextWindow("Text canceled.");
    return;
  }

  if (event.key === "Escape" && !translateWindow.hidden) {
    event.preventDefault();
    closeTranslateWindow("Translate canceled.");
    return;
  }

  if (event.key === "Escape" && !translateByPointsWindow.hidden) {
    event.preventDefault();
    closeTranslateByPointsWindow("Translate - By Points canceled.");
    return;
  }

  if (event.key === "Escape" && !pointIncrementalWindow.hidden) {
    event.preventDefault();
    closePointIncrementalWindow("Point - Incremental canceled.");
    return;
  }

  if (event.key === "Escape" && !aboutWindow.hidden) {
    event.preventDefault();
    closeAboutWindow();
    return;
  }

  if (event.key === "Escape" && windowZoomState.active) {
    event.preventDefault();
    deactivateWindowZoom("View - Window canceled.");
    return;
  }

  if (event.key === "Escape" && dimensionState.activeType !== null) {
    event.preventDefault();
    deactivateDimension("Dimension canceled.");
    return;
  }

  if (event.key === "Escape" && pointSketchState.active) {
    deactivatePointSketch("Point - Sketch canceled.");
    return;
  }

  if (event.key === "Escape" && lineSketchState.active) {
    deactivateLineSketch("Line - Sketch canceled.");
    return;
  }

  if (event.key === "Escape" && lineAngleState.active) {
    deactivateLineAngle("Line - Angle canceled.");
    return;
  }

  if (event.key === "Escape" && lineTangentState.active) {
    deactivateLineTangent("Line - Tangent canceled.");
    return;
  }

  if (event.key === "Escape" && threeEntityCircleState.active) {
    deactivateThreeEntityCircle("Circle - 3 Entities canceled.");
    return;
  }

  if (event.key === "Escape" && !pointCoordinatesWindow.hidden) {
    closePointCoordinatesWindow();
    return;
  }

  if (event.key === "Escape" && !lineCoordinatesWindow.hidden) {
    closeLineCoordinatesWindow("Line - Coordinates canceled.");
    return;
  }

  if (event.key === "Escape" && pointOnEntityState.active) {
    deactivatePointOnEntity("Point on Entity canceled.");
    return;
  }

  if (event.key === "Escape" && pointEndState.active) {
    deactivatePointEnd("Point - End canceled.");
    return;
  }

  if (event.key === "Escape" && !circleRadiusWindow.hidden) {
    closeCircleRadiusWindow("Circle canceled.");
    return;
  }

  if (event.key === "Escape" && !hexagonWindow.hidden) {
    closeHexagonWindow("Hexagon canceled.");
    return;
  }

  if (event.key === "Escape" && !rectangleWindow.hidden) {
    closeRectangleWindow("Rectangle canceled.");
    return;
  }

  if (event.key === "Escape" && !boltHoleCircleWindow.hidden) {
    closeBoltHoleCircleWindow("Bolt Hole Circle canceled.");
    return;
  }

  if (event.key === "Escape" && !offsetWindow.hidden) {
    closeOffsetWindow("Offset canceled.");
    return;
  }

  if (event.key === "Escape" && filletState.active) {
    deactivateFillet("Fillet Radius canceled.");
    return;
  }

  if (event.key === "Escape" && rotateState.active) {
    deactivateRotate("Rotate canceled.");
    return;
  }

  if (event.key === "Escape" && intersectionState.active) {
    deactivateIntersectingPoint("Point - Intersecting canceled.");
    return;
  }

  if (event.key === "Escape" && trimExtendState.active) {
    deactivateTrimExtend("Trim/Extend canceled.");
    return;
  }

  if (event.key === "Escape" && joinState.active) {
    deactivateJoin("Line - Join canceled.");
  }
});

// Floating-window workspace policy. Adjust this one value if later shop-floor
// testing suggests a little more or less vertical coverage.
const TOOL_WINDOW_MAX_WORKSPACE_HEIGHT_RATIO = 0.88;
const TOOL_WINDOW_WORKSPACE_MARGIN_PX = 8;

const managedToolWindows = [
  [pointCoordinatesWindow, pointWindowTitleBar],
  [lineCoordinatesWindow, lineCoordinatesWindowTitleBar],
  [lineAngleWindow, lineAngleWindowTitleBar],
  [lineTangentWindow, lineTangentWindowTitleBar],
  [circleRadiusWindow, circleWindowTitleBar],
  [hexagonWindow, hexagonWindowTitleBar],
  [rectangleWindow, rectangleWindowTitleBar],
  [boltHoleCircleWindow, boltHoleCircleWindowTitleBar],
  [textWindow, textWindowTitleBar],
  [offsetWindow, offsetWindowTitleBar],
  [filletWindow, filletWindowTitleBar],
  [rotateWindow, rotateWindowTitleBar],
  [translateWindow, translateWindowTitleBar],
  [translateByPointsWindow, translateByPointsWindowTitleBar],
  [pointIncrementalWindow, pointIncrementalWindowTitleBar],
  [pointOnEntityWindow, pointOnEntityWindowTitleBar],
  [boxWindow, boxWindowTitleBar],
  [aboutWindow, aboutWindowTitleBar],
];

function getFloatingWindowWorkspaceBounds() {
  const drawingBounds = drawingArea.getBoundingClientRect();
  const hasDrawingWorkspace =
    drawingBounds.width > 0 && drawingBounds.height > 0;
  const source = hasDrawingWorkspace
    ? drawingBounds
    : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
  const margin = TOOL_WINDOW_WORKSPACE_MARGIN_PX;
  const left = Math.min(source.right, source.left + margin);
  const top = Math.min(source.bottom, source.top + margin);
  const right = Math.max(left, source.right - margin);
  const bottom = Math.max(top, source.bottom - margin);
  const width = Math.max(1, right - left);
  const height = Math.max(1, bottom - top);
  const maxHeight = Math.max(
    1,
    Math.floor(height * TOOL_WINDOW_MAX_WORKSPACE_HEIGHT_RATIO),
  );
  return {
    left,
    top,
    right,
    bottom,
    width,
    height,
    maxHeight,
    maximizedTop: top + Math.max(0, (height - maxHeight) / 2),
  };
}

function setFloatingWindowWorkspaceVariables(toolWindow, workspaceBounds) {
  toolWindow.style.setProperty(
    "--tool-window-workspace-left",
    `${workspaceBounds.left}px`,
  );
  toolWindow.style.setProperty(
    "--tool-window-workspace-top",
    `${workspaceBounds.maximizedTop}px`,
  );
  toolWindow.style.setProperty(
    "--tool-window-max-width",
    `${workspaceBounds.width}px`,
  );
  toolWindow.style.setProperty(
    "--tool-window-max-height",
    `${workspaceBounds.maxHeight}px`,
  );
}

function keepFloatingWindowInWorkspace(floatingWindow, titleBar = null) {
  if (!floatingWindow || floatingWindow.hidden) return;
  const workspaceBounds = getFloatingWindowWorkspaceBounds();
  const isToolWindow = floatingWindow.classList.contains("tool-window");
  if (isToolWindow) {
    setFloatingWindowWorkspaceVariables(floatingWindow, workspaceBounds);
  } else {
    floatingWindow.style.maxWidth = `${workspaceBounds.width}px`;
    floatingWindow.style.maxHeight = `${workspaceBounds.maxHeight}px`;
  }

  if (floatingWindow.classList.contains("is-maximized")) return;
  let bounds = floatingWindow.getBoundingClientRect();
  if (bounds.width > workspaceBounds.width) {
    floatingWindow.style.width = `${workspaceBounds.width}px`;
  }
  if (bounds.height > workspaceBounds.maxHeight) {
    floatingWindow.style.height = `${workspaceBounds.maxHeight}px`;
  }
  bounds = floatingWindow.getBoundingClientRect();
  const visibleHeight = floatingWindow.classList.contains("is-minimized")
    ? Math.max(titleBar?.offsetHeight ?? bounds.height, 1)
    : bounds.height;
  const maximumLeft = Math.max(
    workspaceBounds.left,
    workspaceBounds.right - bounds.width,
  );
  const maximumTop = Math.max(
    workspaceBounds.top,
    workspaceBounds.bottom - visibleHeight,
  );
  const left = Math.min(
    maximumLeft,
    Math.max(workspaceBounds.left, bounds.left),
  );
  const top = Math.min(
    maximumTop,
    Math.max(workspaceBounds.top, bounds.top),
  );
  floatingWindow.style.left = `${left}px`;
  floatingWindow.style.top = `${top}px`;
}

function fitAllFloatingWindowsToWorkspace() {
  managedToolWindows.forEach(([toolWindow, titleBar]) =>
    keepFloatingWindowInWorkspace(toolWindow, titleBar),
  );
  document.querySelectorAll(".calc-window").forEach((calculator) =>
    keepFloatingWindowInWorkspace(
      calculator,
      calculator.querySelector(".calc-titlebar"),
    ),
  );
}

const floatingWindowResizeObserver = new ResizeObserver((entries) => {
  entries.forEach(({ target }) => {
    const managedEntry = managedToolWindows.find(
      ([toolWindow]) => toolWindow === target,
    );
    keepFloatingWindowInWorkspace(
      target,
      managedEntry?.[1] ?? target.querySelector(".calc-titlebar"),
    );
  });
});

function observeFloatingWindow(floatingWindow) {
  if (!floatingWindow || floatingWindow.dataset.viewportManaged === "true") {
    return;
  }
  floatingWindow.dataset.viewportManaged = "true";
  floatingWindowResizeObserver.observe(floatingWindow);
}

managedToolWindows.forEach(([toolWindow]) => observeFloatingWindow(toolWindow));

function refitDraggedFloatingWindow(event) {
  const titleBar = event.target.closest?.(".window-title-bar, .calc-titlebar");
  if (!titleBar) return;
  const floatingWindow = titleBar.closest(".tool-window, .calc-window");
  if (!floatingWindow) return;
  requestAnimationFrame(() =>
    keepFloatingWindowInWorkspace(floatingWindow, titleBar),
  );
}

document.addEventListener("pointerup", refitDraggedFloatingWindow);
document.addEventListener("pointercancel", refitDraggedFloatingWindow);

const floatingWindowOpenObserver = new MutationObserver((records) => {
  records.forEach((record) => {
    if (record.type === "attributes" && record.attributeName === "hidden") {
      const floatingWindow = record.target;
      if (!floatingWindow.hidden) {
        requestAnimationFrame(() => {
          const managedEntry = managedToolWindows.find(
            ([toolWindow]) => toolWindow === floatingWindow,
          );
          keepFloatingWindowInWorkspace(floatingWindow, managedEntry?.[1]);
        });
      }
      return;
    }
    record.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      const calculators = node.matches(".calc-window")
        ? [node]
        : [...node.querySelectorAll(".calc-window")];
      calculators.forEach((calculator) => {
        observeFloatingWindow(calculator);
        requestAnimationFrame(() =>
          keepFloatingWindowInWorkspace(
            calculator,
            calculator.querySelector(".calc-titlebar"),
          ),
        );
      });
    });
  });
});

managedToolWindows.forEach(([toolWindow]) => {
  floatingWindowOpenObserver.observe(toolWindow, {
    attributes: true,
    attributeFilter: ["hidden"],
  });
});
floatingWindowOpenObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

window.addEventListener("resize", () => {
  if (isometricViewState.active) {
    refreshIsometricView();
  } else {
    fitViewToCanvas();
  }
  fitAllFloatingWindowsToWorkspace();
});

cadCanvas.addEventListener("mousemove", (event) => {
  const worldPoint = screenToWorld(event);
  cursorX.textContent = `X: ${formatCoordinate(worldPoint.x)}`;
  cursorY.textContent = `Y: ${formatCoordinate(worldPoint.y)}`;
  if (windowZoomState.active || textPlacementState.active) {
    setSelectionProximityHover(null);
    clearEntityHoverInfo();
  } else if (isometricViewState.active && updateModelHoverInfo(event.target)) {
    setSelectionProximityHover(null);
  } else if (selectionState.mode === "chain") {
    updateChainSelectionPreview(worldPoint, event.target);
  } else if (selectionState.mode === "single" || isometricViewState.active) {
    const hoveredEntity = getSelectionHitCandidates(worldPoint, event.target)[0]
      ?.entity;
    const hoveredEntityId = hoveredEntity?.id ?? null;
    setSelectionProximityHover(hoveredEntityId);
    updateEntityHoverInfoById(hoveredEntityId);
  } else {
    setSelectionProximityHover(null);
    updateEntityHoverInfo(event.target);
  }

  if (joinState.active && joinState.firstPointId !== null) {
    const hoveredPointElement = event.target.closest(".point-entity");
    const hoveredPoint = hoveredPointElement
      ? getPointById(Number(hoveredPointElement.dataset.entityId))
      : null;
    joinState.previewWorld = hoveredPoint ?? worldPoint;
    renderToolPreview();
  }

  if (lineSketchState.active && lineSketchState.startPointId !== null) {
    lineSketchState.previewWorld = worldPoint;
    renderToolPreview();
  }

  if (textPlacementState.active) {
    textPlacementState.previewWorld = worldPoint;
    renderToolPreview();
  }
});

cadCanvas.addEventListener("mouseleave", () => {
  cursorX.textContent = "X: ----";
  cursorY.textContent = "Y: ----";
  clearEntityHoverInfo();
  setSelectionProximityHover(null);
  modelSelectionState.hoveredSolidId = null;
  modelSelectionState.hoveredFaceIndex = null;

  if (selectionState.mode === "chain") {
    chainSelectionState.candidateEntityId = null;
    chainSelectionState.exitEndpointIndex = null;
    renderToolPreview();
  }

  if (joinState.active && joinState.firstPointId !== null) {
    joinState.previewWorld = null;
    renderToolPreview();
  }

  if (lineSketchState.active && lineSketchState.startPointId !== null) {
    lineSketchState.previewWorld = null;
    renderToolPreview();
  }

  if (textPlacementState.active) {
    textPlacementState.previewWorld = null;
    renderToolPreview();
  }
});

applyApplicationIdentity();
updateUnitsUi();
setWorkspaceMode("2d");
renderLayerMenu();
document
  .querySelectorAll(".menu-item, .submenu-item")
  .forEach(enableDelayedMenuClose);
fitViewToCanvas();
