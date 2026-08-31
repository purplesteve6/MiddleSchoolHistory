/* ============================================================
   Middle School History Coloring Book Engine
   Required SVG contract:
     <g id="color"> ... fillable closed shapes ... </g>
     <g id="ink">   ... protected line art ...   </g>
   ============================================================ */

(function () {
  "use strict";

  const CFG = window.COLORING_BOOK_CONFIG || {};
  const PALETTES = window.COLORING_BOOK_PALETTES || {};

  const SVG_NS = "http://www.w3.org/2000/svg";
  const COLOR_GROUP_ID = CFG.colorGroupId || "color";
  const INK_GROUP_ID = CFG.inkGroupId || "ink";
  const FILLABLE_SELECTOR = "path, polygon, rect, circle, ellipse";
  const MAX_HISTORY = 100;

  const els = {
    artboard: document.getElementById("artboard"),
    paletteSelect: document.getElementById("paletteSelect"),
    swatches: document.getElementById("swatches"),
    customColor: document.getElementById("customColor"),
    colorPickerField: document.getElementById("colorPickerField"),
    colorPickerMarker: document.getElementById("colorPickerMarker"),
    hueSlider: document.getElementById("hueSlider"),
    hexInput: document.getElementById("hexInput"),
    currentColorChip: document.getElementById("currentColorChip"),
    currentColorText: document.getElementById("currentColorText"),
    toolButtons: Array.from(document.querySelectorAll("[data-tool]")),
    brushOptions: document.getElementById("brushOptions"),
    brushOptionsLabel: document.getElementById("brushOptionsLabel"),
    textOptions: document.getElementById("textOptions"),
    brushSizes: Array.from(document.querySelectorAll("[data-brush-size]")),
    textValue: document.getElementById("textValue"),
    textFont: document.getElementById("textFont"),
    textSize: document.getElementById("textSize"),
    deleteTextBtn: document.getElementById("deleteTextBtn"),
    undoBtn: document.getElementById("undoBtn"),
    redoBtn: document.getElementById("redoBtn"),
    resetBtn: document.getElementById("resetBtn"),
    printBtn: document.getElementById("printBtn"),
    status: document.getElementById("coloringStatus"),
    pageTitle: document.getElementById("pageTitle"),
    workspaceTitle: document.getElementById("workspaceTitle"),
    layerPositionButtons: Array.from(document.querySelectorAll("[data-layer-position]")),
    layerPositionHint: document.getElementById("layerPositionHint"),
    artboardWrap: document.getElementById("artboardWrap"),
    zoomSlider: document.getElementById("zoomSlider"),
    zoomValue: document.getElementById("zoomValue"),
    zoomResetBtn: document.getElementById("zoomResetBtn")
  };

  let svgRoot = null;
  let colorGroup = null;
  let inkGroup = null;
  let belowWorkLayer = null;
  let aboveWorkLayer = null;
  let belowPaintLayer = null;
  let belowTextLayer = null;
  let abovePaintLayer = null;
  let aboveTextLayer = null;
  let belowEraseLayer = null;
  let aboveEraseLayer = null;
  let fillables = [];

  let currentTool = CFG.defaultTool || "bucket";
  let layerPosition = CFG.defaultLayerPosition === "above" ? "above" : "below";
  let currentColor = normalizeHex(CFG.defaultColor || "#D7263D") || "#D7263D";
  let brushSize = 12;
  let selectedText = null;

  let drawing = false;
  let currentBrushPath = null;
  let currentBrushPoints = [];
  let currentErasePath = null;
  let currentErasePoints = [];

  let panning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panStartScrollLeft = 0;
  let panStartScrollTop = 0;

  let draggingText = false;
  let textDragStart = null;
  let textOriginalPos = null;
  let textDidMove = false;

  let initialState = null;
  let history = [];
  let historyIndex = -1;

  let zoomScale = 1;
  let baseArtboardWidth = 0;
  let baseArtboardHeight = 0;
  let artAspect = 4 / 3;
  let pickerHue = 350;
  let pickerSaturation = 0.82;
  let pickerValue = 0.84;
  let pickingColor = false;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = Math.max(1, Number(CFG.maxZoom || 4));

  function setStatus(message) {
    if (els.status) els.status.textContent = message;
  }

  function normalizeHex(value) {
    let v = String(value || "").trim().toUpperCase();
    if (/^#[0-9A-F]{6}$/.test(v)) return v;
    if (/^[0-9A-F]{6}$/.test(v)) return `#${v}`;
    if (/^#[0-9A-F]{3}$/.test(v)) {
      return "#" + v.slice(1).split("").map((c) => c + c).join("");
    }
    return null;
  }

  function hexToRgb(hex) {
    const value = normalizeHex(hex);
    if (!value) return null;
    return {
      r: parseInt(value.slice(1, 3), 16),
      g: parseInt(value.slice(3, 5), 16),
      b: parseInt(value.slice(5, 7), 16)
    };
  }

  function rgbToHex(r, g, b) {
    const byte = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${byte(r)}${byte(g)}${byte(b)}`.toUpperCase();
  }

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = pickerHue;
    if (d !== 0) {
      if (max === r) h = 60 * (((g - b) / d) % 6);
      else if (max === g) h = 60 * (((b - r) / d) + 2);
      else h = 60 * (((r - g) / d) + 4);
      if (h < 0) h += 360;
    }
    return { h, s: max === 0 ? 0 : d / max, v: max };
  }

  function hsvToRgb(h, s, v) {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let rp = 0, gp = 0, bp = 0;
    if (h < 60) { rp = c; gp = x; }
    else if (h < 120) { rp = x; gp = c; }
    else if (h < 180) { gp = c; bp = x; }
    else if (h < 240) { gp = x; bp = c; }
    else if (h < 300) { rp = x; bp = c; }
    else { rp = c; bp = x; }
    return { r: (rp + m) * 255, g: (gp + m) * 255, b: (bp + m) * 255 };
  }

  function pickerHex() {
    const rgb = hsvToRgb(pickerHue, pickerSaturation, pickerValue);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  function updateColorPickerUi() {
    if (els.colorPickerField) {
      els.colorPickerField.style.background = `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${pickerHue} 100% 50%)`;
      els.colorPickerField.setAttribute("aria-valuetext", `Saturation ${Math.round(pickerSaturation * 100)}%, brightness ${Math.round(pickerValue * 100)}%`);
    }
    if (els.colorPickerMarker) {
      els.colorPickerMarker.style.left = `${pickerSaturation * 100}%`;
      els.colorPickerMarker.style.top = `${(1 - pickerValue) * 100}%`;
    }
    if (els.hueSlider) els.hueSlider.value = String(Math.round(pickerHue));
  }

  function syncPickerFromHex(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    if (hsv.s > 0.005) pickerHue = hsv.h;
    pickerSaturation = hsv.s;
    pickerValue = hsv.v;
    updateColorPickerUi();
  }

  function setCurrentColor(value, options = {}) {
    const color = normalizeHex(value);
    if (!color) return false;

    currentColor = color;
    if (els.customColor) els.customColor.value = color;
    if (els.hexInput) els.hexInput.value = color;
    if (els.currentColorChip) els.currentColorChip.style.background = color;
    if (els.currentColorText) els.currentColorText.textContent = color;

    els.swatches?.querySelectorAll(".swatch").forEach((swatch) => {
      swatch.classList.toggle("is-active", normalizeHex(swatch.dataset.color) === color);
    });

    if (options.syncPicker !== false) syncPickerFromHex(color);

    if (selectedText && options.applyToSelectedText !== false) {
      selectedText.setAttribute("fill", color);
      commitState();
      setStatus("Text color updated.");
    }

    return true;
  }

  function isLightColor(hex) {
    const c = normalizeHex(hex);
    if (!c) return false;
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 210;
  }

  function enabledPaletteKeys() {
    const requested = Array.isArray(CFG.palettes) && CFG.palettes.length
      ? CFG.palettes
      : Object.keys(PALETTES);
    return requested.filter((key) => PALETTES[key]);
  }

  function buildPaletteMenu() {
    if (!els.paletteSelect) return;
    els.paletteSelect.innerHTML = "";

    for (const key of enabledPaletteKeys()) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = PALETTES[key].name || key;
      els.paletteSelect.appendChild(option);
    }

    const wanted = CFG.defaultPalette || enabledPaletteKeys()[0];
    if (wanted && PALETTES[wanted]) els.paletteSelect.value = wanted;
    renderPalette(els.paletteSelect.value);
  }

  function renderPalette(key) {
    if (!els.swatches) return;
    els.swatches.innerHTML = "";

    const palette = PALETTES[key];
    if (!palette) return;

    palette.colors.forEach((color) => {
      const hex = normalizeHex(color);
      if (!hex) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "swatch";
      button.dataset.color = hex;
      button.dataset.light = String(isLightColor(hex));
      button.style.background = hex;
      button.title = hex;
      button.setAttribute("aria-label", `Choose color ${hex}`);
      button.addEventListener("click", () => setCurrentColor(hex));
      els.swatches.appendChild(button);
    });

    setCurrentColor(currentColor, { applyToSelectedText: false });
  }

  function setTool(tool) {
    if (!["bucket", "brush", "eraser", "text", "grab"].includes(tool)) return;
    currentTool = tool;
    els.artboard?.setAttribute("data-tool", tool);

    els.toolButtons.forEach((button) => {
      const active = button.dataset.tool === tool;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const showStrokeOptions = tool === "brush" || tool === "eraser";
    if (els.brushOptions) els.brushOptions.hidden = !showStrokeOptions;
    if (els.brushOptionsLabel) {
      els.brushOptionsLabel.textContent = tool === "eraser" ? "Eraser Size" : "Brush Size";
    }
    if (els.textOptions) els.textOptions.hidden = tool !== "text";

    if (tool !== "text") clearTextSelection();

    if (tool === "bucket") setStatus("Paint Bucket: choose a color, then click any white area.");
    if (tool === "brush") setStatus("Brush: drag across the picture to paint freely.");
    if (tool === "eraser") setStatus("Eraser: drag to erase brush strokes and text on the active drawing position.");
    if (tool === "text") setStatus("Text: type your words, then click the picture to place them.");
    if (tool === "grab") setStatus("Grab: drag the artwork to pan around when zoomed in.");
  }

  function setBrushSize(size) {
    const n = Number(size);
    if (!Number.isFinite(n) || n <= 0) return;
    brushSize = n;
    els.brushSizes.forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.brushSize) === brushSize);
    });
  }

  function getSvgPoint(event) {
    if (!svgRoot) return { x: 0, y: 0 };
    const pt = svgRoot.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const matrix = svgRoot.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const local = pt.matrixTransform(matrix.inverse());
    return { x: local.x, y: local.y };
  }

  function getFillableFromTarget(target) {
    if (!target || !colorGroup) return null;
    const shape = target.closest?.(FILLABLE_SELECTOR);
    if (!shape || !colorGroup.contains(shape)) return null;
    return shape;
  }

  function paintLayerFor(position = layerPosition) {
    return position === "above" ? abovePaintLayer : belowPaintLayer;
  }

  function textLayerFor(position = layerPosition) {
    return position === "above" ? aboveTextLayer : belowTextLayer;
  }

  function eraseLayerFor(position = layerPosition) {
    return position === "above" ? aboveEraseLayer : belowEraseLayer;
  }

  function allTextLayers() {
    return [belowTextLayer, aboveTextLayer].filter(Boolean);
  }

  function textPosition(text) {
    if (!text) return null;
    if (aboveTextLayer?.contains(text)) return "above";
    if (belowTextLayer?.contains(text)) return "below";
    return null;
  }

  function updateLayerButtons() {
    els.layerPositionButtons.forEach((button) => {
      const active = button.dataset.layerPosition === layerPosition;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (els.layerPositionHint) {
      if (selectedText) {
        const position = textPosition(selectedText);
        els.layerPositionHint.textContent = position === "above"
          ? "Selected text is on top. Choose Behind Lines to move just this text."
          : "Selected text is behind the lines. Choose On Top to move just this text.";
      } else {
        els.layerPositionHint.textContent = layerPosition === "above"
          ? "New brush strokes and text will be placed on top of the black lines."
          : "New brush strokes and text will be placed behind the black lines.";
      }
    }
  }

  function setLayerPosition(position, options = {}) {
    const normalized = position === "above" ? "above" : "below";
    layerPosition = normalized;

    if (selectedText && options.moveSelected !== false) {
      const destination = textLayerFor(normalized);
      if (destination && !destination.contains(selectedText)) {
        destination.appendChild(selectedText);
        commitState();
        setStatus(normalized === "above"
          ? "Selected text moved on top of the ink lines."
          : "Selected text moved behind the ink lines.");
      } else if (options.announce !== false) {
        setStatus(normalized === "above"
          ? "Selected text is already on top of the ink lines."
          : "Selected text is already behind the ink lines.");
      }
    } else if (options.announce !== false) {
      setStatus(normalized === "above"
        ? "New brush strokes and text will appear on top of the ink lines."
        : "New brush strokes and text will appear behind the ink lines.");
    }

    updateLayerButtons();
  }

  function updateZoomUi() {
    if (els.zoomSlider) els.zoomSlider.value = String(Math.round(zoomScale * 100));
    if (els.zoomValue) els.zoomValue.textContent = `${Math.round(zoomScale * 100)}%`;
    if (els.zoomResetBtn) els.zoomResetBtn.disabled = zoomScale <= MIN_ZOOM + 0.001;
    els.artboardWrap?.classList.toggle("is-zoomed", zoomScale > MIN_ZOOM + 0.001);
  }

  function artboardAvailableSize() {
    if (!els.artboardWrap) return { width: 0, height: 0 };
    const style = getComputedStyle(els.artboardWrap);
    const padX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    const padY = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
    return {
      width: Math.max(1, els.artboardWrap.clientWidth - padX - 2),
      height: Math.max(1, els.artboardWrap.clientHeight - padY - 2)
    };
  }

  function measureBaseArtboard() {
    if (!els.artboard || !els.artboardWrap) return;
    const available = artboardAvailableSize();
    if (!available.width || !available.height) return;

    const maxWidth = Math.min(1100, available.width);
    baseArtboardWidth = Math.min(maxWidth, available.height * artAspect);
    baseArtboardHeight = baseArtboardWidth / artAspect;

    if (baseArtboardHeight > available.height) {
      baseArtboardHeight = available.height;
      baseArtboardWidth = baseArtboardHeight * artAspect;
    }
  }

  function setArtboardSizeForZoom() {
    if (!els.artboard || !baseArtboardWidth || !baseArtboardHeight) return;
    const width = baseArtboardWidth * zoomScale;
    const height = baseArtboardHeight * zoomScale;
    els.artboard.style.width = `${width}px`;
    els.artboard.style.height = `${height}px`;

    const available = artboardAvailableSize();
    const verticalSpace = Math.max(0, (available.height - height) / 2);
    els.artboard.style.marginTop = `${verticalSpace}px`;
    els.artboard.style.marginBottom = `${verticalSpace}px`;
    els.artboard.style.marginLeft = "auto";
    els.artboard.style.marginRight = "auto";
  }

  function applyZoom(nextScale, options = {}) {
    if (!els.artboard || !els.artboardWrap || !baseArtboardWidth || !baseArtboardHeight) return;

    let scale = Number(nextScale);
    if (!Number.isFinite(scale)) scale = MIN_ZOOM;
    scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));

    const wrap = els.artboardWrap;
    const before = els.artboard.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const anchorClientX = options.anchorClientX ?? (wrapRect.left + wrap.clientWidth / 2);
    const anchorClientY = options.anchorClientY ?? (wrapRect.top + wrap.clientHeight / 2);

    const u = before.width > 0 ? Math.max(0, Math.min(1, (anchorClientX - before.left) / before.width)) : 0.5;
    const v = before.height > 0 ? Math.max(0, Math.min(1, (anchorClientY - before.top) / before.height)) : 0.5;

    zoomScale = scale;
    setArtboardSizeForZoom();

    if (zoomScale <= MIN_ZOOM + 0.001) {
      wrap.scrollLeft = 0;
      wrap.scrollTop = 0;
    } else {
      const after = els.artboard.getBoundingClientRect();
      const pointX = after.left + (u * after.width);
      const pointY = after.top + (v * after.height);
      wrap.scrollLeft += pointX - anchorClientX;
      wrap.scrollTop += pointY - anchorClientY;
    }

    updateZoomUi();
  }

  function zoomByWheel(event) {
    if (!els.artboardWrap || !baseArtboardWidth || !baseArtboardHeight) return;
    const artRect = els.artboard.getBoundingClientRect();
    const overArt = event.clientX >= artRect.left && event.clientX <= artRect.right
      && event.clientY >= artRect.top && event.clientY <= artRect.bottom;
    if (!overArt) return;

    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.12 : (1 / 1.12);
    const nextScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomScale * factor));
    applyZoom(nextScale, { anchorClientX: event.clientX, anchorClientY: event.clientY });
  }

  function setupSvg() {
    colorGroup = svgRoot.querySelector(`#${CSS.escape(COLOR_GROUP_ID)}`);
    inkGroup = svgRoot.querySelector(`#${CSS.escape(INK_GROUP_ID)}`);

    if (!colorGroup || !inkGroup) {
      throw new Error(`SVG must contain #${COLOR_GROUP_ID} and #${INK_GROUP_ID} groups.`);
    }

    inkGroup.dataset.coloringInk = "true";
    inkGroup.style.pointerEvents = "none";

    fillables = Array.from(colorGroup.querySelectorAll(FILLABLE_SELECTOR));
    fillables.forEach((shape, index) => {
      shape.dataset.coloringFillable = "true";
      shape.dataset.coloringIndex = String(index);
      if (!shape.hasAttribute("fill")) shape.setAttribute("fill", "#FFFFFF");
    });

    belowWorkLayer = document.createElementNS(SVG_NS, "g");
    belowWorkLayer.id = "below-ink-work";
    belowWorkLayer.dataset.coloringGenerated = "true";

    belowPaintLayer = document.createElementNS(SVG_NS, "g");
    belowPaintLayer.id = "below-ink-paint";
    belowPaintLayer.dataset.coloringGenerated = "true";

    belowTextLayer = document.createElementNS(SVG_NS, "g");
    belowTextLayer.id = "below-ink-text";
    belowTextLayer.dataset.coloringGenerated = "true";

    belowWorkLayer.appendChild(belowPaintLayer);
    belowWorkLayer.appendChild(belowTextLayer);

    aboveWorkLayer = document.createElementNS(SVG_NS, "g");
    aboveWorkLayer.id = "above-ink-work";
    aboveWorkLayer.dataset.coloringGenerated = "true";

    abovePaintLayer = document.createElementNS(SVG_NS, "g");
    abovePaintLayer.id = "above-ink-paint";
    abovePaintLayer.dataset.coloringGenerated = "true";

    aboveTextLayer = document.createElementNS(SVG_NS, "g");
    aboveTextLayer.id = "above-ink-text";
    aboveTextLayer.dataset.coloringGenerated = "true";

    aboveWorkLayer.appendChild(abovePaintLayer);
    aboveWorkLayer.appendChild(aboveTextLayer);

    const viewBox = svgRoot.viewBox && svgRoot.viewBox.baseVal;
    if (viewBox && viewBox.width > 0 && viewBox.height > 0 && els.artboard) {
      artAspect = viewBox.width / viewBox.height;
      els.artboard.style.aspectRatio = `${viewBox.width} / ${viewBox.height}`;
    }

    const maskX = viewBox ? viewBox.x : 0;
    const maskY = viewBox ? viewBox.y : 0;
    const maskW = viewBox ? viewBox.width : 2000;
    const maskH = viewBox ? viewBox.height : 2000;

    let defs = svgRoot.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(SVG_NS, "defs");
      svgRoot.insertBefore(defs, svgRoot.firstChild);
    }

    const maskSuffix = Math.random().toString(36).slice(2, 8);

    function createEraserMask(idBase) {
      const mask = document.createElementNS(SVG_NS, "mask");
      mask.id = `${idBase}-${maskSuffix}`;
      mask.setAttribute("maskUnits", "userSpaceOnUse");
      mask.setAttribute("maskContentUnits", "userSpaceOnUse");
      mask.setAttribute("x", String(maskX));
      mask.setAttribute("y", String(maskY));
      mask.setAttribute("width", String(maskW));
      mask.setAttribute("height", String(maskH));

      const bg = document.createElementNS(SVG_NS, "rect");
      bg.setAttribute("x", String(maskX));
      bg.setAttribute("y", String(maskY));
      bg.setAttribute("width", String(maskW));
      bg.setAttribute("height", String(maskH));
      bg.setAttribute("fill", "#FFFFFF");
      mask.appendChild(bg);

      const eraseLayer = document.createElementNS(SVG_NS, "g");
      eraseLayer.id = `${idBase}-erase`;
      eraseLayer.dataset.coloringGenerated = "true";
      mask.appendChild(eraseLayer);

      defs.appendChild(mask);
      return { maskId: mask.id, eraseLayer };
    }

    const belowMask = createEraserMask("below-work-mask");
    belowEraseLayer = belowMask.eraseLayer;
    belowWorkLayer.setAttribute("mask", `url(#${belowMask.maskId})`);

    const aboveMask = createEraserMask("above-work-mask");
    aboveEraseLayer = aboveMask.eraseLayer;
    aboveWorkLayer.setAttribute("mask", `url(#${aboveMask.maskId})`);

    const parent = inkGroup.parentNode;
    parent.insertBefore(belowWorkLayer, inkGroup);
    parent.insertBefore(aboveWorkLayer, inkGroup.nextSibling);
    updateLayerButtons();

    svgRoot.setAttribute("role", "img");
    svgRoot.setAttribute("aria-label", `${CFG.title || "Coloring page"} interactive coloring page`);
    svgRoot.setAttribute("focusable", "false");

    bindSvgEvents();

    initialState = captureState();
    history = [initialState];
    historyIndex = 0;
    updateHistoryButtons();

    requestAnimationFrame(() => {
      measureBaseArtboard();
      applyZoom(MIN_ZOOM);
      updateZoomUi();
    });
  }

  function cleanTextMarkup(layer) {
    if (!layer) return "";
    const clone = layer.cloneNode(true);
    clone.querySelectorAll(".is-selected").forEach((el) => el.classList.remove("is-selected"));
    return clone.innerHTML;
  }

  function captureState() {
    return {
      fills: fillables.map((shape) => shape.getAttribute("fill") || "#FFFFFF"),
      belowPaint: belowPaintLayer ? belowPaintLayer.innerHTML : "",
      belowText: cleanTextMarkup(belowTextLayer),
      belowErase: belowEraseLayer ? belowEraseLayer.innerHTML : "",
      abovePaint: abovePaintLayer ? abovePaintLayer.innerHTML : "",
      aboveText: cleanTextMarkup(aboveTextLayer),
      aboveErase: aboveEraseLayer ? aboveEraseLayer.innerHTML : ""
    };
  }

  function applyState(state) {
    if (!state) return;
    state.fills.forEach((fill, index) => {
      if (fillables[index]) fillables[index].setAttribute("fill", fill || "#FFFFFF");
    });

    if (belowPaintLayer) belowPaintLayer.innerHTML = state.belowPaint || "";
    if (belowTextLayer) belowTextLayer.innerHTML = state.belowText || "";
    if (belowEraseLayer) belowEraseLayer.innerHTML = state.belowErase || "";
    if (abovePaintLayer) abovePaintLayer.innerHTML = state.abovePaint || "";
    if (aboveTextLayer) aboveTextLayer.innerHTML = state.aboveText || "";
    if (aboveEraseLayer) aboveEraseLayer.innerHTML = state.aboveErase || "";

    allTextLayers().forEach((layer) => {
      layer.querySelectorAll(".is-selected").forEach((el) => el.classList.remove("is-selected"));
    });
    clearTextSelection();
    updateLayerButtons();
  }

  function statesEqual(a, b) {
    if (!a || !b) return false;
    return a.belowPaint === b.belowPaint
      && a.belowText === b.belowText
      && a.belowErase === b.belowErase
      && a.abovePaint === b.abovePaint
      && a.aboveText === b.aboveText
      && a.aboveErase === b.aboveErase
      && a.fills.join("|") === b.fills.join("|");
  }

  function commitState() {
    const state = captureState();
    const current = history[historyIndex];
    if (statesEqual(state, current)) return;

    history = history.slice(0, historyIndex + 1);
    history.push(state);
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
    updateHistoryButtons();
  }

  function updateHistoryButtons() {
    if (els.undoBtn) els.undoBtn.disabled = historyIndex <= 0;
    if (els.redoBtn) els.redoBtn.disabled = historyIndex < 0 || historyIndex >= history.length - 1;
  }

  function undo() {
    if (historyIndex <= 0) return;
    historyIndex -= 1;
    applyState(history[historyIndex]);
    updateHistoryButtons();
    setStatus("Undid the last change.");
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex += 1;
    applyState(history[historyIndex]);
    updateHistoryButtons();
    setStatus("Redid the change.");
  }

  function resetArtwork() {
    if (!initialState) return;
    const hasChanges = !statesEqual(captureState(), initialState);
    if (!hasChanges) {
      setStatus("The page is already clear.");
      return;
    }

    if (!window.confirm("Clear all coloring, brush strokes, and text from this page?")) return;
    applyState(initialState);
    commitState();
    setStatus("Coloring page reset.");
  }

  function paintBucket(target) {
    const shape = getFillableFromTarget(target);
    if (!shape) return;
    const oldFill = normalizeHex(shape.getAttribute("fill")) || shape.getAttribute("fill");
    if (String(oldFill).toUpperCase() === currentColor) return;
    shape.setAttribute("fill", currentColor);
    commitState();
  }

  function startBrush(event) {
    if (event.button !== undefined && event.button !== 0) return;
    drawing = true;
    currentBrushPoints = [getSvgPoint(event)];

    currentBrushPath = document.createElementNS(SVG_NS, "path");
    currentBrushPath.classList.add("user-brush-stroke");
    currentBrushPath.setAttribute("stroke", currentColor);
    currentBrushPath.setAttribute("stroke-width", String(brushSize));
    currentBrushPath.setAttribute("d", `M ${currentBrushPoints[0].x.toFixed(2)} ${currentBrushPoints[0].y.toFixed(2)}`);
    paintLayerFor().appendChild(currentBrushPath);

    svgRoot.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function continueBrush(event) {
    if (!drawing || !currentBrushPath) return;
    const point = getSvgPoint(event);
    const previous = currentBrushPoints[currentBrushPoints.length - 1];
    const dx = point.x - previous.x;
    const dy = point.y - previous.y;
    if (dx * dx + dy * dy < 2.5) return;

    currentBrushPoints.push(point);
    currentBrushPath.setAttribute("d", buildSmoothPath(currentBrushPoints));
    event.preventDefault();
  }

  function buildSmoothPath(points) {
    if (points.length < 2) {
      const p = points[0];
      return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    }
    if (points.length === 2) {
      return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
    }

    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      d += ` Q ${current.x.toFixed(2)} ${current.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
    return d;
  }

  function endBrush(event) {
    if (!drawing) return;
    drawing = false;
    try { svgRoot.releasePointerCapture?.(event.pointerId); } catch (_) {}

    if (currentBrushPath) {
      if (currentBrushPoints.length === 1) {
        const p = currentBrushPoints[0];
        currentBrushPath.setAttribute("d", `M ${p.x.toFixed(2)} ${p.y.toFixed(2)} l 0.01 0`);
      }
      commitState();
    }

    currentBrushPath = null;
    currentBrushPoints = [];
    event.preventDefault();
  }

  function startEraser(event) {
    if (event.button !== undefined && event.button !== 0) return;
    drawing = true;
    currentErasePoints = [getSvgPoint(event)];

    currentErasePath = document.createElementNS(SVG_NS, "path");
    currentErasePath.classList.add("user-eraser-stroke");
    currentErasePath.setAttribute("stroke", "#000000");
    currentErasePath.setAttribute("stroke-width", String(brushSize));
    currentErasePath.setAttribute("fill", "none");
    currentErasePath.setAttribute("stroke-linecap", "round");
    currentErasePath.setAttribute("stroke-linejoin", "round");
    currentErasePath.setAttribute("d", `M ${currentErasePoints[0].x.toFixed(2)} ${currentErasePoints[0].y.toFixed(2)}`);
    eraseLayerFor().appendChild(currentErasePath);

    svgRoot.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function continueEraser(event) {
    if (!drawing || !currentErasePath) return;
    const point = getSvgPoint(event);
    const previous = currentErasePoints[currentErasePoints.length - 1];
    const dx = point.x - previous.x;
    const dy = point.y - previous.y;
    if (dx * dx + dy * dy < 2.5) return;

    currentErasePoints.push(point);
    currentErasePath.setAttribute("d", buildSmoothPath(currentErasePoints));
    event.preventDefault();
  }

  function endEraser(event) {
    if (!drawing) return;
    drawing = false;
    try { svgRoot.releasePointerCapture?.(event.pointerId); } catch (_) {}

    if (currentErasePath) {
      if (currentErasePoints.length === 1) {
        const p = currentErasePoints[0];
        currentErasePath.setAttribute("d", `M ${p.x.toFixed(2)} ${p.y.toFixed(2)} l 0.01 0`);
      }
      commitState();
    }

    currentErasePath = null;
    currentErasePoints = [];
    event.preventDefault();
  }

  function startPan(event) {
    if (event.button !== undefined && event.button !== 0) return;
    if (!els.artboardWrap) return;
    panning = true;
    panStartX = event.clientX;
    panStartY = event.clientY;
    panStartScrollLeft = els.artboardWrap.scrollLeft;
    panStartScrollTop = els.artboardWrap.scrollTop;
    els.artboardWrap.classList.add("is-grabbing");
    els.artboardWrap.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function continuePan(event) {
    if (!panning || !els.artboardWrap) return;
    const dx = event.clientX - panStartX;
    const dy = event.clientY - panStartY;
    els.artboardWrap.scrollLeft = panStartScrollLeft - dx;
    els.artboardWrap.scrollTop = panStartScrollTop - dy;
    event.preventDefault();
  }

  function endPan(event) {
    if (!panning || !els.artboardWrap) return;
    panning = false;
    els.artboardWrap.classList.remove("is-grabbing");
    try { els.artboardWrap.releasePointerCapture?.(event.pointerId); } catch (_) {}
    event.preventDefault();
  }

  function currentTextSettings() {
    return {
      value: String(els.textValue?.value || "").trim(),
      font: els.textFont?.value || "Arial, sans-serif",
      size: Math.max(10, Math.min(160, Number(els.textSize?.value) || 44))
    };
  }

  function addTextAt(point) {
    const settings = currentTextSettings();
    if (!settings.value) {
      els.textValue?.focus();
      setStatus("Type some text in the Text box first, then click the picture.");
      return;
    }

    const text = document.createElementNS(SVG_NS, "text");
    text.classList.add("user-text");
    text.setAttribute("x", point.x.toFixed(2));
    text.setAttribute("y", point.y.toFixed(2));
    text.setAttribute("fill", currentColor);
    text.setAttribute("font-size", String(settings.size));
    text.setAttribute("font-family", settings.font);
    text.setAttribute("font-weight", settings.font.toLowerCase().includes("impact") ? "700" : "600");
    text.textContent = settings.value;
    textLayerFor().appendChild(text);

    selectText(text);
    commitState();
    setStatus("Text added. Drag it to reposition, or change the controls to edit it.");
  }

  function selectText(text) {
    clearTextSelection();
    selectedText = text;
    selectedText.classList.add("is-selected");

    if (els.textValue) els.textValue.value = selectedText.textContent || "";
    if (els.textFont) els.textFont.value = selectedText.getAttribute("font-family") || els.textFont.value;
    if (els.textSize) els.textSize.value = selectedText.getAttribute("font-size") || els.textSize.value;

    const fill = normalizeHex(selectedText.getAttribute("fill"));
    if (fill) setCurrentColor(fill, { applyToSelectedText: false });

    const position = textPosition(selectedText);
    if (position) layerPosition = position;
    updateLayerButtons();

    if (els.deleteTextBtn) els.deleteTextBtn.disabled = false;
  }

  function clearTextSelection() {
    if (selectedText) selectedText.classList.remove("is-selected");
    selectedText = null;
    if (els.deleteTextBtn) els.deleteTextBtn.disabled = true;
    updateLayerButtons();
  }

  function startTextDrag(event, text) {
    selectText(text);
    draggingText = true;
    textDidMove = false;
    textDragStart = getSvgPoint(event);
    textOriginalPos = {
      x: Number(text.getAttribute("x")) || 0,
      y: Number(text.getAttribute("y")) || 0
    };
    svgRoot.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  }

  function continueTextDrag(event) {
    if (!draggingText || !selectedText || !textDragStart || !textOriginalPos) return;
    const point = getSvgPoint(event);
    const dx = point.x - textDragStart.x;
    const dy = point.y - textDragStart.y;
    if (Math.abs(dx) + Math.abs(dy) > 1) textDidMove = true;
    selectedText.setAttribute("x", (textOriginalPos.x + dx).toFixed(2));
    selectedText.setAttribute("y", (textOriginalPos.y + dy).toFixed(2));
    event.preventDefault();
  }

  function endTextDrag(event) {
    if (!draggingText) return;
    draggingText = false;
    try { svgRoot.releasePointerCapture?.(event.pointerId); } catch (_) {}
    if (textDidMove) {
      commitState();
      setStatus("Text moved.");
    }
    textDragStart = null;
    textOriginalPos = null;
    textDidMove = false;
    event.preventDefault();
  }

  function updateSelectedText() {
    if (!selectedText) return;
    const settings = currentTextSettings();
    selectedText.textContent = settings.value || "Text";
    selectedText.setAttribute("font-family", settings.font);
    selectedText.setAttribute("font-size", String(settings.size));
    selectedText.setAttribute("fill", currentColor);
    commitState();
    setStatus("Text updated.");
  }

  function deleteSelectedText() {
    if (!selectedText) return;
    selectedText.remove();
    selectedText = null;
    if (els.deleteTextBtn) els.deleteTextBtn.disabled = true;
    commitState();
    setStatus("Text deleted.");
  }

  function bindSvgEvents() {
    svgRoot.addEventListener("pointerdown", (event) => {
      if (currentTool === "brush") {
        startBrush(event);
        return;
      }

      if (currentTool === "eraser") {
        startEraser(event);
        return;
      }

      if (currentTool === "text") {
        const text = event.target.closest?.(".user-text");
        if (text && allTextLayers().some((layer) => layer.contains(text))) {
          startTextDrag(event, text);
          return;
        }

        clearTextSelection();
        addTextAt(getSvgPoint(event));
        event.preventDefault();
      }
    });

    svgRoot.addEventListener("pointermove", (event) => {
      if (currentTool === "brush") continueBrush(event);
      if (currentTool === "eraser") continueEraser(event);
      if (currentTool === "text") continueTextDrag(event);
    });

    svgRoot.addEventListener("pointerup", (event) => {
      if (currentTool === "brush") endBrush(event);
      if (currentTool === "eraser") endEraser(event);
      if (currentTool === "text") endTextDrag(event);
    });

    svgRoot.addEventListener("pointercancel", (event) => {
      if (currentTool === "brush") endBrush(event);
      if (currentTool === "eraser") endEraser(event);
      if (currentTool === "text") endTextDrag(event);
    });

    svgRoot.addEventListener("click", (event) => {
      if (currentTool === "bucket") paintBucket(event.target);
    });

    els.artboardWrap?.addEventListener("pointerdown", (event) => {
      if (currentTool !== "grab") return;
      if (!els.artboard?.contains(event.target)) return;
      startPan(event);
    });

    els.artboardWrap?.addEventListener("pointermove", (event) => {
      if (currentTool === "grab") continuePan(event);
    });

    els.artboardWrap?.addEventListener("pointerup", (event) => {
      if (currentTool === "grab") endPan(event);
    });

    els.artboardWrap?.addEventListener("pointercancel", (event) => {
      if (currentTool === "grab") endPan(event);
    });
  }

  function updatePickerFromPointer(event, applyToText = false) {
    if (!els.colorPickerField) return;
    const rect = els.colorPickerField.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    pickerSaturation = rect.width ? x / rect.width : 0;
    pickerValue = rect.height ? 1 - (y / rect.height) : 0;
    updateColorPickerUi();
    setCurrentColor(pickerHex(), { applyToSelectedText: applyToText, syncPicker: false });
  }

  function bindColorPicker() {
    if (els.colorPickerField) {
      els.colorPickerField.addEventListener("pointerdown", (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        pickingColor = true;
        els.colorPickerField.setPointerCapture?.(event.pointerId);
        updatePickerFromPointer(event, false);
        event.preventDefault();
      });

      els.colorPickerField.addEventListener("pointermove", (event) => {
        if (!pickingColor) return;
        updatePickerFromPointer(event, false);
        event.preventDefault();
      });

      const finishPick = (event) => {
        if (!pickingColor) return;
        pickingColor = false;
        try { els.colorPickerField.releasePointerCapture?.(event.pointerId); } catch (_) {}
        updatePickerFromPointer(event, true);
        event.preventDefault();
      };

      els.colorPickerField.addEventListener("pointerup", finishPick);
      els.colorPickerField.addEventListener("pointercancel", finishPick);

      els.colorPickerField.addEventListener("keydown", (event) => {
        const step = event.shiftKey ? 0.05 : 0.01;
        if (event.key === "ArrowLeft") pickerSaturation = Math.max(0, pickerSaturation - step);
        else if (event.key === "ArrowRight") pickerSaturation = Math.min(1, pickerSaturation + step);
        else if (event.key === "ArrowUp") pickerValue = Math.min(1, pickerValue + step);
        else if (event.key === "ArrowDown") pickerValue = Math.max(0, pickerValue - step);
        else return;
        event.preventDefault();
        updateColorPickerUi();
        setCurrentColor(pickerHex(), { syncPicker: false });
      });
    }

    els.hueSlider?.addEventListener("input", () => {
      pickerHue = Number(els.hueSlider.value) || 0;
      updateColorPickerUi();
      setCurrentColor(pickerHex(), { applyToSelectedText: false, syncPicker: false });
    });

    els.hueSlider?.addEventListener("change", () => {
      setCurrentColor(pickerHex(), { syncPicker: false });
    });
  }

  function ensureToolButtons() {
    const host = document.querySelector(".tool-buttons");
    if (!host) return;

    const specs = [
      { tool: "eraser", icon: "⌫", label: "Eraser" },
      { tool: "grab", icon: "✋", label: "Grab" }
    ];

    for (const spec of specs) {
      if (host.querySelector(`[data-tool="${spec.tool}"]`)) continue;
      const button = document.createElement("button");
      button.className = "tool-button";
      button.type = "button";
      button.dataset.tool = spec.tool;
      button.setAttribute("aria-pressed", "false");
      button.innerHTML = `<span class="tool-button__icon" aria-hidden="true">${spec.icon}</span><span>${spec.label}</span>`;
      host.appendChild(button);
    }

    els.toolButtons = Array.from(document.querySelectorAll("[data-tool]"));
  }

  function bindControls() {
    els.toolButtons.forEach((button) => {
      button.addEventListener("click", () => setTool(button.dataset.tool));
    });

    els.layerPositionButtons.forEach((button) => {
      button.addEventListener("click", () => setLayerPosition(button.dataset.layerPosition));
    });

    els.paletteSelect?.addEventListener("change", () => renderPalette(els.paletteSelect.value));
    bindColorPicker();

    els.customColor?.addEventListener("input", () => {
      setCurrentColor(els.customColor.value, { applyToSelectedText: false });
    });

    els.customColor?.addEventListener("change", () => {
      setCurrentColor(els.customColor.value);
    });

    els.hexInput?.addEventListener("change", () => {
      if (!setCurrentColor(els.hexInput.value)) {
        els.hexInput.value = currentColor;
        setStatus("Enter a 6-digit hex color such as #2F6DA1.");
      }
    });

    els.hexInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        els.hexInput.blur();
      }
    });

    els.brushSizes.forEach((button) => {
      button.addEventListener("click", () => setBrushSize(button.dataset.brushSize));
    });

    [els.textValue, els.textFont, els.textSize].forEach((control) => {
      control?.addEventListener("change", updateSelectedText);
    });

    els.deleteTextBtn?.addEventListener("click", deleteSelectedText);
    els.undoBtn?.addEventListener("click", undo);
    els.redoBtn?.addEventListener("click", redo);
    els.resetBtn?.addEventListener("click", resetArtwork);

    els.printBtn?.addEventListener("click", () => {
      clearTextSelection();
      setStatus("Opening the print dialog. Choose “Save as PDF” to save a PDF copy.");
      setTimeout(() => window.print(), 50);
    });

    els.zoomSlider?.addEventListener("input", () => {
      applyZoom(Number(els.zoomSlider.value) / 100);
    });

    els.zoomResetBtn?.addEventListener("click", () => {
      applyZoom(MIN_ZOOM);
      setStatus("Zoom reset to the default view.");
    });

    els.artboardWrap?.addEventListener("wheel", zoomByWheel, { passive: false });

    window.addEventListener("resize", () => {
      const previousScale = zoomScale;
      measureBaseArtboard();
      applyZoom(previousScale);
    }, { passive: true });

    document.addEventListener("keydown", (event) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select";

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        if (typing) return;
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y" && !typing) {
        event.preventDefault();
        redo();
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedText && !typing) {
        event.preventDefault();
        deleteSelectedText();
      }
    });
  }

  async function loadSvg() {
    if (!CFG.svgPath) throw new Error("Missing COLORING_BOOK_CONFIG.svgPath");
    if (!els.artboard) throw new Error("Missing #artboard element");

    const response = await fetch(CFG.svgPath, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load SVG (${response.status}).`);
    const svgText = await response.text();
    els.artboard.innerHTML = svgText;
    els.artboard.classList.remove("is-loading");

    svgRoot = els.artboard.querySelector("svg");
    if (!svgRoot) throw new Error("Loaded file did not contain an SVG element.");

    setupSvg();
    setStatus(`Ready — ${fillables.length} areas can be filled.`);
  }

  function boot() {
    if (els.pageTitle && CFG.title) els.pageTitle.textContent = CFG.title;
    if (els.workspaceTitle && CFG.title) els.workspaceTitle.textContent = CFG.title;
    document.title = `${CFG.title || "Coloring Book"} | Middle School History`;

    buildPaletteMenu();
    ensureToolButtons();
    bindControls();
    setBrushSize(12);
    setCurrentColor(currentColor, { applyToSelectedText: false });
    updateLayerButtons();
    updateZoomUi();
    setTool(currentTool);

    loadSvg().catch((error) => {
      console.error("[coloring-book]", error);
      els.artboard?.classList.remove("is-loading");
      if (els.artboard) {
        els.artboard.innerHTML = `<div style="padding:28px;color:#6c2330;text-align:center;font-weight:800;">The coloring page could not be loaded.</div>`;
      }
      setStatus(error.message || "The coloring page could not be loaded.");
    });
  }

  boot();
})();
