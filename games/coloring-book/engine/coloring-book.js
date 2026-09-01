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
  const STAMPS = Array.isArray(window.COLORING_BOOK_STAMPS) ? window.COLORING_BOOK_STAMPS : [];

  function buildStampPickerFromManifest() {
    const host = document.getElementById("stampPicker");
    if (!host) return;

    host.replaceChildren();
    const validStamps = STAMPS.filter((stamp) =>
      stamp && String(stamp.file || "").trim() && String(stamp.label || "").trim()
    );

    validStamps.forEach((stamp, index) => {
      const button = document.createElement("button");
      button.className = `stamp-choice${index === 0 ? " is-active" : ""}`;
      button.type = "button";
      button.dataset.stampId = String(stamp.id || `stamp-${index + 1}`);
      button.dataset.stampSrc = String(stamp.file);
      button.dataset.stampName = String(stamp.label);
      button.setAttribute("aria-pressed", String(index === 0));
      button.title = String(stamp.label);

      const image = document.createElement("img");
      image.src = String(stamp.file);
      image.alt = String(stamp.label);
      button.appendChild(image);
      host.appendChild(button);
    });

    if (!validStamps.length) {
      const empty = document.createElement("p");
      empty.className = "tool-help";
      empty.textContent = "No stamps are configured in stamps-manifest.js.";
      host.appendChild(empty);
    }
  }

  buildStampPickerFromManifest();

  const SVG_NS = "http://www.w3.org/2000/svg";
  const COLOR_GROUP_ID = CFG.colorGroupId || "color";
  const INK_GROUP_ID = CFG.inkGroupId || "ink";
  const FILLABLE_SELECTOR = "path, polygon, rect, circle, ellipse";
  const MAX_HISTORY = 100;

  const els = {
    artboard: document.getElementById("artboard"),
    paletteSelect: document.getElementById("paletteSelect"),
    swatches: document.getElementById("swatches"),
    paletteTabButtons: Array.from(document.querySelectorAll("[data-palette-tab]")),
    palettePanels: Array.from(document.querySelectorAll("[data-palette-panel]")),
    currentSwatches: document.getElementById("currentSwatches"),
    currentColorsEmpty: document.getElementById("currentColorsEmpty"),
    customColor: document.getElementById("customColor"),
    colorPickerField: document.getElementById("colorPickerField"),
    colorPickerMarker: document.getElementById("colorPickerMarker"),
    hueSlider: document.getElementById("hueSlider"),
    hexInput: document.getElementById("hexInput"),
    currentColorChip: document.getElementById("currentColorChip"),
    currentColorText: document.getElementById("currentColorText"),
    currentColorRoleText: document.getElementById("currentColorRoleText"),
    globalColorButtons: Array.from(document.querySelectorAll("[data-global-color-target]")),
    foregroundColorChip: document.getElementById("foregroundColorChip"),
    backgroundColorChip: document.getElementById("backgroundColorChip"),
    foregroundColorText: document.getElementById("foregroundColorText"),
    backgroundColorText: document.getElementById("backgroundColorText"),
    swapColorsBtn: document.getElementById("swapColorsBtn"),
    toolButtons: Array.from(document.querySelectorAll("[data-tool]")),
    brushOptions: document.getElementById("brushOptions"),
    brushOptionsLabel: document.getElementById("brushOptionsLabel"),
    textOptions: document.getElementById("textOptions"),
    brushSizes: Array.from(document.querySelectorAll("[data-brush-size]")),
    textValue: document.getElementById("textValue"),
    textFont: document.getElementById("textFont"),
    textSize: document.getElementById("textSize"),
    textRotation: document.getElementById("textRotation"),
    textRotationValue: document.getElementById("textRotationValue"),
    textStrokeWidth: document.getElementById("textStrokeWidth"),
    textAlignButtons: Array.from(document.querySelectorAll("[data-text-align]")),
    textBoldBtn: document.getElementById("textBoldBtn"),
    textItalicBtn: document.getElementById("textItalicBtn"),
    deleteTextBtn: document.getElementById("deleteTextBtn"),
    stampOptions: document.getElementById("stampOptions"),
    stampChoices: Array.from(document.querySelectorAll("[data-stamp-src]")),
    stampSize: document.getElementById("stampSize"),
    stampScaleX: document.getElementById("stampScaleX"),
    stampScaleXValue: document.getElementById("stampScaleXValue"),
    stampScaleY: document.getElementById("stampScaleY"),
    stampScaleYValue: document.getElementById("stampScaleYValue"),
    stampRotation: document.getElementById("stampRotation"),
    stampRotationValue: document.getElementById("stampRotationValue"),
    stampColorButtons: Array.from(document.querySelectorAll("[data-stamp-color-target]")),
    stampMainColorChip: document.getElementById("stampMainColorChip"),
    stampAccentColorChip: document.getElementById("stampAccentColorChip"),
    deleteStampBtn: document.getElementById("deleteStampBtn"),
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
  let userDefs = null;
  let fillables = [];

  let currentTool = CFG.defaultTool || "bucket";
  let layerPosition = CFG.defaultLayerPosition === "above" ? "above" : "below";
  let foregroundColor = normalizeHex(CFG.defaultColor || "#D7263D") || "#D7263D";
  let backgroundColor = normalizeHex(CFG.defaultBackgroundColor || "#000000") || "#000000";
  let activeColorTarget = "foreground";
  let currentColor = foregroundColor;
  let colorRecency = [];
  let brushSize = 12;
  let selectedText = null;
  let selectedStamp = null;
  let currentStampSrc = els.stampChoices[0]?.dataset.stampSrc || "";
  let currentStampName = els.stampChoices[0]?.dataset.stampName || "Stamp";
  let stampSize = Math.max(80, Number(els.stampSize?.value) || 360);
  let stampScaleX = clampStampScale(Number(els.stampScaleX?.value) || 100);
  let stampScaleY = clampStampScale(Number(els.stampScaleY?.value) || 100);
  let stampRotation = clampRotation(Number(els.stampRotation?.value) || 0);
  let stampColorTarget = "main";
  let stampMainColor = foregroundColor;
  let stampAccentColor = backgroundColor;
  const stampTemplateCache = new Map();

  let draggingStamp = false;
  let stampDragStart = null;
  let stampOriginalPos = null;
  let stampDidMove = false;

  let drawing = false;
  let currentBrushPath = null;
  let currentBrushPoints = [];
  let currentErasePath = null;
  let currentErasePoints = [];
  let currentEraseTargets = [];

  let panning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panStartScrollLeft = 0;
  let panStartScrollTop = 0;

  let draggingText = false;
  let textDragStart = null;
  let textOriginalPos = null;
  let textOriginalMaskTranslate = null;
  let textMaskMarks = null;
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
  let pickingColorTarget = "foreground";
  let userMaskCounter = 0;
  let userMaskBounds = { x: 0, y: 0, width: 2000, height: 2000 };
  let cursorPreview = null;
  let cursorPreviewX = null;
  let cursorPreviewY = null;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = Math.max(1, Number(CFG.maxZoom || 4));

  function ensureCursorPreview() {
    if (cursorPreview || !document.body) return;
    const preview = document.createElement("div");
    preview.className = "tool-cursor-preview";
    preview.setAttribute("aria-hidden", "true");
    preview.innerHTML = `
      <span class="tool-cursor-preview__x"></span>
      <svg class="tool-cursor-preview__eyedrop" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
        <g transform="rotate(-45 14 14)">
          <path d="M12 3h4v5h2.4c1.1 0 1.6 1.3.8 2.1l-2.1 2.1V23a2 2 0 0 1-2 2h-2.2a2 2 0 0 1-2-2V12.2l-2.1-2.1C8 9.3 8.5 8 9.6 8H12V3Z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/>
          <path class="tool-cursor-preview__eyedrop-color" d="M11 18h6v5a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-5Z"/>
          <path d="M11 18h6" fill="none" stroke="#000" stroke-width="1.4"/>
        </g>
      </svg>`;
    document.body.appendChild(preview);
    cursorPreview = preview;
  }

  function previewStrokeDiameter() {
    if (!svgRoot) return Math.max(8, brushSize);
    const scale = Math.abs(svgRoot.getScreenCTM()?.a || 1);
    return Math.max(8, brushSize * scale);
  }

  function showCursorPreview(event) {
    ensureCursorPreview();
    if (!cursorPreview) return;

    cursorPreview.style.left = `${event.clientX}px`;
    cursorPreview.style.top = `${event.clientY}px`;
    cursorPreview.dataset.mode = currentTool;

    if (currentTool === "eyedrop") {
      cursorPreview.style.width = "32px";
      cursorPreview.style.height = "32px";
      const hoverColor = colorFromArtworkTarget(event.target) || "#FFFFFF";
      cursorPreview.style.setProperty("--eyedrop-hover-color", hoverColor);
      cursorPreview.hidden = false;
    } else if (currentTool === "brush" || currentTool === "eraser") {
      const diameter = previewStrokeDiameter();
      cursorPreview.style.width = `${diameter}px`;
      cursorPreview.style.height = `${diameter}px`;
      cursorPreview.hidden = false;
    } else {
      cursorPreview.hidden = true;
    }

    cursorPreviewX = event.clientX;
    cursorPreviewY = event.clientY;
  }

  function hideCursorPreview() {
    if (!cursorPreview) return;
    cursorPreview.hidden = true;
    cursorPreviewX = null;
    cursorPreviewY = null;
  }

  function refreshCursorPreview() {
    if (!["brush", "eraser", "eyedrop"].includes(currentTool) || cursorPreviewX == null || cursorPreviewY == null) {
      hideCursorPreview();
      return;
    }
    ensureCursorPreview();
    if (!cursorPreview) return;

    if (currentTool === "eyedrop") {
      cursorPreview.style.width = "32px";
      cursorPreview.style.height = "32px";
    } else {
      const diameter = previewStrokeDiameter();
      cursorPreview.style.width = `${diameter}px`;
      cursorPreview.style.height = `${diameter}px`;
    }

    cursorPreview.style.left = `${cursorPreviewX}px`;
    cursorPreview.style.top = `${cursorPreviewY}px`;
    cursorPreview.dataset.mode = currentTool;
    cursorPreview.hidden = false;
  }

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

  function normalizeSvgColor(value) {
    const hex = normalizeHex(value);
    if (hex) return hex;
    const match = /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/i.exec(String(value || "").trim());
    if (match) return rgbToHex(Number(match[1]), Number(match[2]), Number(match[3]));
    return null;
  }

  function markColorUsed(value) {
    const color = normalizeHex(value);
    if (!color) return;
    colorRecency = [color, ...colorRecency.filter((item) => item !== color)];
    refreshCurrentColors();
  }

  function artworkColorsPresent() {
    const present = new Set();

    fillables.forEach((shape) => {
      const color = normalizeSvgColor(shape.getAttribute("fill"));
      if (color) present.add(color);
    });

    [belowPaintLayer, abovePaintLayer].filter(Boolean).forEach((layer) => {
      layer.querySelectorAll(".user-brush-stroke").forEach((stroke) => {
        const color = normalizeSvgColor(stroke.getAttribute("stroke"));
        if (color) present.add(color);
      });
    });

    allTextLayers().forEach((layer) => {
      layer.querySelectorAll(".user-text").forEach((textNode) => {
        const fill = normalizeSvgColor(textNode.getAttribute("fill"));
        const stroke = normalizeSvgColor(textNode.getAttribute("stroke"));
        if (fill) present.add(fill);
        if (stroke) present.add(stroke);
      });
      layer.querySelectorAll(".user-stamp [data-stamp-main='true'], .user-stamp [data-stamp-accent='true']").forEach((node) => {
        const color = normalizeSvgColor(node.getAttribute("fill"));
        if (color) present.add(color);
      });
    });

    return present;
  }

  function renderCurrentColorSwatch(color) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    if (color === currentColor) button.classList.add("is-active");
    button.dataset.color = color;
    button.dataset.light = String(isLightColor(color));
    button.style.background = color;
    button.title = color;
    button.setAttribute("aria-label", `Choose current artwork color ${color}. Left click sets Foreground; right click sets Background.`);
    button.addEventListener("click", () => {
      setActiveColorTarget("foreground", { syncPicker: false });
      setCurrentColor(color, { target: "foreground" });
    });
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      setActiveColorTarget("background", { syncPicker: false });
      setCurrentColor(color, { target: "background" });
    });
    return button;
  }

  function refreshCurrentColors() {
    if (!els.currentSwatches) return;
    const present = artworkColorsPresent();
    const colors = colorRecency.filter((color) => present.has(color));
    els.currentSwatches.innerHTML = "";
    colors.forEach((color) => els.currentSwatches.appendChild(renderCurrentColorSwatch(color)));
  }

  function setPaletteTab(tab) {
    const target = tab === "current" ? "current" : "presets";
    els.paletteTabButtons.forEach((button) => {
      const active = button.dataset.paletteTab === target;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    els.palettePanels.forEach((panel) => {
      panel.hidden = panel.dataset.palettePanel !== target;
    });
    if (target === "current") refreshCurrentColors();
  }

  function syncGlobalColorControls() {
    if (els.foregroundColorChip) els.foregroundColorChip.style.background = foregroundColor;
    if (els.backgroundColorChip) els.backgroundColorChip.style.background = backgroundColor;
    if (els.foregroundColorText) els.foregroundColorText.textContent = foregroundColor;
    if (els.backgroundColorText) els.backgroundColorText.textContent = backgroundColor;
    if (els.currentColorChip) els.currentColorChip.style.background = currentColor;
    if (els.currentColorText) els.currentColorText.textContent = currentColor;
    if (els.currentColorRoleText) els.currentColorRoleText.textContent = activeColorTarget === "background" ? "Background" : "Foreground";
    els.globalColorButtons.forEach((button) => {
      const active = button.dataset.globalColorTarget === activeColorTarget;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setActiveColorTarget(target, options = {}) {
    activeColorTarget = target === "background" ? "background" : "foreground";
    stampColorTarget = activeColorTarget === "background" ? "accent" : "main";
    const color = activeColorTarget === "background" ? backgroundColor : foregroundColor;
    setCurrentColor(color, {
      applyToSelectedText: false,
      applyToSelectedStamp: false,
      syncPicker: options.syncPicker,
      announce: false,
      persistTarget: false
    });
    syncGlobalColorControls();
    if (options.announce) {
      setStatus(`${activeColorTarget === "background" ? "Background" : "Foreground"} color selected.`);
    }
  }

  function swapGlobalColors() {
    const oldForeground = foregroundColor;
    foregroundColor = backgroundColor;
    backgroundColor = oldForeground;
    stampMainColor = foregroundColor;
    stampAccentColor = backgroundColor;
    const active = activeColorTarget === "background" ? backgroundColor : foregroundColor;
    setCurrentColor(active, {
      applyToSelectedText: false,
      applyToSelectedStamp: false,
      announce: false,
      persistTarget: false
    });
    syncGlobalColorControls();
    setStatus("Foreground and Background colors swapped.");
  }

  function textOutlineColor(node) {
    if (!node) return null;
    return normalizeSvgColor(node.getAttribute("stroke")) || renderedSvgColor(node);
  }

  function setCurrentColor(value, options = {}) {
    const color = normalizeHex(value);
    if (!color) return false;

    const target = options.target || activeColorTarget;
    if (options.persistTarget !== false) {
      activeColorTarget = target === "background" ? "background" : "foreground";
      stampColorTarget = activeColorTarget === "background" ? "accent" : "main";
    }

    currentColor = color;
    if (activeColorTarget === "background") {
      backgroundColor = color;
      stampAccentColor = color;
    } else {
      foregroundColor = color;
      stampMainColor = color;
    }

    if (els.customColor) els.customColor.value = color;
    if (els.hexInput) els.hexInput.value = color;
    syncGlobalColorControls();

    [els.swatches, els.currentSwatches].filter(Boolean).forEach((host) => {
      host.querySelectorAll(".swatch").forEach((swatch) => {
        swatch.classList.toggle("is-active", normalizeHex(swatch.dataset.color) === color);
      });
    });

    if (options.syncPicker !== false) syncPickerFromHex(color);

    if (selectedText && options.applyToSelectedText !== false) {
      if (activeColorTarget === "background") {
        applyTextStroke(selectedText, backgroundColor, textStrokeWidthFromControl());
        markColorUsed(backgroundColor);
        commitState();
        setStatus("Text outline color updated.");
      } else {
        selectedText.setAttribute("fill", foregroundColor);
        markColorUsed(foregroundColor);
        commitState();
        setStatus("Text fill color updated.");
      }
    } else if (selectedStamp && options.applyToSelectedStamp !== false) {
      applyStampColorChannel(selectedStamp, stampColorTarget, color);
      markColorUsed(color);
      commitState();
      setStatus(`${activeColorTarget === "background" ? "Accent" : "Main"} stamp color updated.`);
    } else if (currentTool === "stamp" && options.applyToSelectedStamp !== false) {
      setStatus(`${activeColorTarget === "background" ? "Accent" : "Main"} color set for the next stamp.`);
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
      button.title = `${hex} — left: Foreground, right: Background`;
      button.setAttribute("aria-label", `Choose color ${hex}. Left click sets Foreground; right click sets Background.`);
      button.addEventListener("click", () => {
        setActiveColorTarget("foreground", { syncPicker: false });
        setCurrentColor(hex, { target: "foreground" });
      });
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        setActiveColorTarget("background", { syncPicker: false });
        setCurrentColor(hex, { target: "background" });
      });
      els.swatches.appendChild(button);
    });

    setCurrentColor(currentColor, { applyToSelectedText: false, applyToSelectedStamp: false, announce: false, persistTarget: false });
  }

  function setTool(tool) {
    if (!["bucket", "brush", "eraser", "eyedrop", "text", "stamp", "grab"].includes(tool)) return;
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
    if (els.stampOptions) els.stampOptions.hidden = tool !== "stamp";

    if (tool !== "text") clearTextSelection();
    if (tool !== "stamp") clearStampSelection();

    if (tool === "bucket") setStatus("Paint Bucket: left click fills with Foreground; right click fills with Background.");
    if (tool === "brush") setStatus("Brush: drag to paint freely. Left click uses Foreground; right click uses Background.");
    if (tool === "eraser") setStatus("Eraser: drag to permanently erase existing brush strokes and text on the active drawing layer.");
    if (tool === "eyedrop") setStatus("Eyedropper: left click samples to Foreground; right click samples to Background.");
    if (tool === "text") setStatus("Text: type your words, then click the picture to place them. Foreground fills the text and Background outlines it.");
    if (tool === "stamp") setStatus(currentStampSrc ? "Stamp: choose a stamp, size, and rotation, then click the picture to place it. Foreground colors the main area and Background colors the accent." : "Stamp: no stamps are configured in stamps-manifest.js.");
    if (tool === "grab") setStatus("Grab: drag the artwork to pan around when zoomed in.");
    refreshCursorPreview();
  }

  function setBrushSize(size) {
    const n = Number(size);
    if (!Number.isFinite(n) || n <= 0) return;
    brushSize = n;
    els.brushSizes.forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.brushSize) === brushSize);
    });
    refreshCursorPreview();
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

  function allTextLayers() {
    return [belowTextLayer, aboveTextLayer].filter(Boolean);
  }

  function workObjectsFor(position = layerPosition) {
    const objects = [];
    const paintLayer = paintLayerFor(position);
    const textLayer = textLayerFor(position);
    if (paintLayer) objects.push(...Array.from(paintLayer.children));
    if (textLayer) objects.push(...Array.from(textLayer.children));
    return objects.filter((el) => el.classList?.contains("user-brush-stroke") || el.classList?.contains("user-text"));
  }

  function parseTranslate(transformValue) {
    const match = /translate\(\s*([-+]?\d*\.?\d+)(?:[ ,]\s*([-+]?\d*\.?\d+))?\s*\)/.exec(transformValue || "");
    return {
      x: match ? Number(match[1]) || 0 : 0,
      y: match && match[2] != null ? Number(match[2]) || 0 : 0
    };
  }

  function maskMarksFor(target) {
    const maskId = target?.dataset?.eraseMaskId;
    if (!maskId || !userDefs) return null;
    const mask = userDefs.querySelector(`#${CSS.escape(maskId)}`);
    return mask?.querySelector(".eraser-marks") || null;
  }

  function createUserMask() {
    if (!userDefs) return null;
    userMaskCounter += 1;
    const maskId = `coloring-user-mask-${userMaskCounter}`;

    const mask = document.createElementNS(SVG_NS, "mask");
    mask.id = maskId;
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.setAttribute("maskContentUnits", "userSpaceOnUse");
    mask.setAttribute("x", String(userMaskBounds.x));
    mask.setAttribute("y", String(userMaskBounds.y));
    mask.setAttribute("width", String(userMaskBounds.width));
    mask.setAttribute("height", String(userMaskBounds.height));

    const bg = document.createElementNS(SVG_NS, "rect");
    bg.setAttribute("x", String(userMaskBounds.x));
    bg.setAttribute("y", String(userMaskBounds.y));
    bg.setAttribute("width", String(userMaskBounds.width));
    bg.setAttribute("height", String(userMaskBounds.height));
    bg.setAttribute("fill", "#FFFFFF");
    mask.appendChild(bg);

    const marks = document.createElementNS(SVG_NS, "g");
    marks.classList.add("eraser-marks");
    mask.appendChild(marks);

    userDefs.appendChild(mask);
    return { maskId, marks };
  }

  function ensureObjectMask(target) {
    if (!target) return null;
    let marks = maskMarksFor(target);
    if (marks) return marks;

    const created = createUserMask();
    if (!created) return null;
    target.dataset.eraseMaskId = created.maskId;
    target.setAttribute("mask", `url(#${created.maskId})`);
    return created.marks;
  }

  function createEraseMark(points, width, offset = { x: 0, y: 0 }) {
    if (!points?.length) return null;
    const path = document.createElementNS(SVG_NS, "path");
    path.classList.add("user-eraser-stroke");
    path.setAttribute("stroke", "#000000");
    path.setAttribute("stroke-width", String(width));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("d", pathDataForPoints(points, offset));
    return path;
  }

  function beginEraserTargets(point, width) {
    const objects = workObjectsFor(layerPosition);
    currentEraseTargets = objects.map((target) => {
      const marks = ensureObjectMask(target);
      if (!marks) return null;
      const offset = parseTranslate(marks.getAttribute("transform"));
      const dab = createEraseMark([point], width, offset);
      if (!dab) return null;
      marks.appendChild(dab);
      return { target, marks, offset };
    }).filter(Boolean);
    return currentEraseTargets.length;
  }

  function addEraserSegment(fromPoint, toPoint, width) {
    if (!fromPoint || !toPoint) return;
    currentEraseTargets.forEach((entry) => {
      const segment = createEraseMark([fromPoint, toPoint], width, entry.offset);
      if (segment) entry.marks.appendChild(segment);
    });
  }

  function textPosition(text) {
    if (!text) return null;
    if (aboveTextLayer?.contains(text)) return "above";
    if (belowTextLayer?.contains(text)) return "below";
    return null;
  }

  function stampPosition(stamp) {
    if (!stamp) return null;
    if (aboveTextLayer?.contains(stamp)) return "above";
    if (belowTextLayer?.contains(stamp)) return "below";
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
          ? "Selected text is above the lines. Choose Behind Lines to move just this text."
          : "Selected text is behind the lines. Choose Above Lines to move just this text.";
      } else if (selectedStamp) {
        const position = stampPosition(selectedStamp);
        els.layerPositionHint.textContent = position === "above"
          ? "Selected stamp is above the lines. Choose Behind Lines to move just this stamp."
          : "Selected stamp is behind the lines. Choose Above Lines to move just this stamp.";
      } else {
        els.layerPositionHint.textContent = layerPosition === "above"
          ? "New brush strokes, text, and stamps will be placed above the black lines."
          : "New brush strokes, text, and stamps will be placed behind the black lines.";
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
          ? "Selected text moved above the ink lines."
          : "Selected text moved behind the ink lines.");
      } else if (options.announce !== false) {
        setStatus(normalized === "above"
          ? "Selected text is already above the ink lines."
          : "Selected text is already behind the ink lines.");
      }
    } else if (selectedStamp && options.moveSelected !== false) {
      const destination = textLayerFor(normalized);
      if (destination && !destination.contains(selectedStamp)) {
        destination.appendChild(selectedStamp);
        commitState();
        setStatus(normalized === "above"
          ? "Selected stamp moved above the ink lines."
          : "Selected stamp moved behind the ink lines.");
      } else if (options.announce !== false) {
        setStatus(normalized === "above"
          ? "Selected stamp is already above the ink lines."
          : "Selected stamp is already behind the ink lines.");
      }
    } else if (options.announce !== false) {
      setStatus(normalized === "above"
        ? "New brush strokes, text, and stamps will appear above the ink lines."
        : "New brush strokes, text, and stamps will appear behind the ink lines.");
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
    refreshCursorPreview();
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
      userMaskBounds = { x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height };
    }

    userDefs = document.createElementNS(SVG_NS, "defs");
    userDefs.id = "coloring-generated-defs";
    userDefs.dataset.coloringGenerated = "true";
    svgRoot.insertBefore(userDefs, svgRoot.firstChild);

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
      abovePaint: abovePaintLayer ? abovePaintLayer.innerHTML : "",
      aboveText: cleanTextMarkup(aboveTextLayer),
      defs: userDefs ? userDefs.innerHTML : ""
    };
  }

  function applyState(state) {
    if (!state) return;
    state.fills.forEach((fill, index) => {
      if (fillables[index]) fillables[index].setAttribute("fill", fill || "#FFFFFF");
    });

    if (belowPaintLayer) belowPaintLayer.innerHTML = state.belowPaint || "";
    if (belowTextLayer) belowTextLayer.innerHTML = state.belowText || "";
    if (abovePaintLayer) abovePaintLayer.innerHTML = state.abovePaint || "";
    if (aboveTextLayer) aboveTextLayer.innerHTML = state.aboveText || "";
    if (userDefs) userDefs.innerHTML = state.defs || "";

    allTextLayers().forEach((layer) => {
      layer.querySelectorAll(".is-selected").forEach((el) => el.classList.remove("is-selected"));
    });
    clearTextSelection();
    clearStampSelection();
    updateLayerButtons();
    refreshCurrentColors();
  }

  function statesEqual(a, b) {
    if (!a || !b) return false;
    return a.belowPaint === b.belowPaint
      && a.belowText === b.belowText
      && a.abovePaint === b.abovePaint
      && a.aboveText === b.aboveText
      && a.defs === b.defs
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
    refreshCurrentColors();
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

    if (!window.confirm("Clear all coloring, brush strokes, text, and stamps from this page?")) return;
    applyState(initialState);
    commitState();
    setStatus("Coloring page reset.");
  }

  function paintBucket(target, color = currentColor) {
    const shape = getFillableFromTarget(target);
    if (!shape) return;
    const hex = normalizeHex(color) || currentColor;
    const oldFill = normalizeHex(shape.getAttribute("fill")) || shape.getAttribute("fill");
    if (String(oldFill).toUpperCase() === hex) return;
    shape.setAttribute("fill", hex);
    markColorUsed(hex);
    commitState();
  }

  function renderedSvgColor(node) {
    if (!node || !svgRoot?.contains(node) || typeof window.getComputedStyle !== "function") return null;
    const style = window.getComputedStyle(node);

    const fillText = String(style.fill || node.getAttribute?.("fill") || "").trim().toLowerCase();
    const fillOpacity = Number(style.fillOpacity || 1);
    if (fillText && fillText !== "none" && fillOpacity > 0) {
      const fill = normalizeSvgColor(style.fill) || normalizeSvgColor(node.getAttribute?.("fill"));
      if (fill) return fill;
    }

    const strokeText = String(style.stroke || node.getAttribute?.("stroke") || "").trim().toLowerCase();
    const strokeOpacity = Number(style.strokeOpacity || 1);
    if (strokeText && strokeText !== "none" && strokeOpacity > 0) {
      const stroke = normalizeSvgColor(style.stroke) || normalizeSvgColor(node.getAttribute?.("stroke"));
      if (stroke) return stroke;
    }

    return null;
  }

  function colorFromArtworkTarget(target, preferredTarget = activeColorTarget) {
    if (!target) return null;
    const stamp = target.closest?.(".user-stamp");
    if (stamp && svgRoot?.contains(stamp)) {
      const region = target.closest?.("[data-stamp-main='true'], [data-stamp-accent='true']");
      if (region?.dataset?.stampAccent === "true") return stampChannelColor(stamp, "accent");
      if (region?.dataset?.stampMain === "true") return stampChannelColor(stamp, "main");
      if (preferredTarget === "background") return stampChannelColor(stamp, "accent") || stampChannelColor(stamp, "main") || renderedSvgColor(target);
      return stampChannelColor(stamp, "main") || stampChannelColor(stamp, "accent") || renderedSvgColor(target);
    }
    const node = target.closest?.(".user-text, .user-brush-stroke, [data-coloring-fillable='true']");
    if (!node || !svgRoot?.contains(node)) return null;
    if (node.classList?.contains("user-brush-stroke")) return normalizeSvgColor(node.getAttribute("stroke"));
    if (node.classList?.contains("user-text")) {
      if (preferredTarget === "background") return normalizeSvgColor(node.getAttribute("stroke")) || normalizeSvgColor(node.getAttribute("fill")) || renderedSvgColor(node);
      return normalizeSvgColor(node.getAttribute("fill")) || normalizeSvgColor(node.getAttribute("stroke")) || renderedSvgColor(node);
    }
    return normalizeSvgColor(node.getAttribute("fill")) || renderedSvgColor(node);
  }

  function eyedropColor(target, colorTarget = activeColorTarget) {
    const preferred = colorTarget === "background" ? "background" : "foreground";
    const color = colorFromArtworkTarget(target, preferred);
    if (!color) {
      setStatus("Eyedropper: click a colored shape, brush stroke, text, or stamp.");
      return;
    }
    setActiveColorTarget(preferred, { syncPicker: false });
    setCurrentColor(color, { applyToSelectedText: false, applyToSelectedStamp: false, target: preferred });
    setStatus(`Picked ${color} for ${preferred === "background" ? "Background" : "Foreground"}.`);
  }

  function startBrush(event, color = currentColor) {
    if (event.button !== undefined && event.button !== 0 && event.button !== 2) return;
    const hex = normalizeHex(color) || currentColor;
    drawing = true;
    currentBrushPoints = [getSvgPoint(event)];

    currentBrushPath = document.createElementNS(SVG_NS, "path");
    currentBrushPath.classList.add("user-brush-stroke");
    currentBrushPath.setAttribute("stroke", hex);
    currentBrushPath.setAttribute("stroke-width", String(brushSize));
    currentBrushPath.setAttribute("d", `M ${currentBrushPoints[0].x.toFixed(2)} ${currentBrushPoints[0].y.toFixed(2)}`);
    paintLayerFor().appendChild(currentBrushPath);
    markColorUsed(hex);
    showCursorPreview(event);

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
    showCursorPreview(event);
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

  function pathDataForPoints(points, offset = { x: 0, y: 0 }) {
    const shifted = points.map((point) => ({ x: point.x - (offset.x || 0), y: point.y - (offset.y || 0) }));
    if (shifted.length === 1) {
      const p = shifted[0];
      return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)} l 0.01 0`;
    }
    return buildSmoothPath(shifted);
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
    if (event.button !== 0) return;
    drawing = true;
    currentErasePoints = [getSvgPoint(event)];
    beginEraserTargets(currentErasePoints[0], brushSize);
    showCursorPreview(event);
    event.preventDefault();
  }

  function continueEraser(event) {
    if (!drawing || currentTool !== "eraser") return;

    // If the browser reports that the left mouse button is no longer held,
    // finish the stroke. This is a backup for a missed mouseup event.
    if (typeof event.buttons === "number" && (event.buttons & 1) === 0) {
      endEraser(event);
      return;
    }

    const point = getSvgPoint(event);
    const previous = currentErasePoints[currentErasePoints.length - 1];
    if (!previous) {
      currentErasePoints.push(point);
      return;
    }

    const dx = point.x - previous.x;
    const dy = point.y - previous.y;
    if (dx * dx + dy * dy < 0.25) return;

    addEraserSegment(previous, point, brushSize);
    currentErasePoints.push(point);
    showCursorPreview(event);
    event.preventDefault();
  }

  function endEraser(event) {
    if (!drawing || currentTool !== "eraser") return;
    drawing = false;

    const applied = currentEraseTargets.length;
    if (applied > 0) {
      commitState();
      setStatus(`Erased from ${applied} item${applied === 1 ? "" : "s"} on the ${layerPosition === "above" ? "Above Lines" : "Behind Lines"} layer.`);
    } else {
      setStatus(`There is nothing to erase on the ${layerPosition === "above" ? "Above Lines" : "Behind Lines"} layer.`);
    }

    currentErasePoints = [];
    currentEraseTargets = [];
    if (event?.preventDefault) event.preventDefault();
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

  function clampRotation(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(-180, Math.min(180, n));
  }

  function textRotationValue(textNode) {
    if (!textNode) return 0;
    const dataValue = Number(textNode.dataset.rotation);
    if (Number.isFinite(dataValue)) return clampRotation(dataValue);
    const match = /rotate\(\s*([-+]?\d*\.?\d+)/.exec(textNode.getAttribute("transform") || "");
    return match ? clampRotation(match[1]) : 0;
  }

  function applyTextRotation(textNode, value) {
    if (!textNode) return;
    const rotation = clampRotation(value);
    const x = Number(textNode.getAttribute("x")) || 0;
    const y = Number(textNode.getAttribute("y")) || 0;
    textNode.dataset.rotation = String(rotation);
    if (Math.abs(rotation) < 0.001) textNode.removeAttribute("transform");
    else textNode.setAttribute("transform", `rotate(${rotation} ${x.toFixed(2)} ${y.toFixed(2)})`);
  }

  function syncTextRotationControls(value) {
    const rotation = clampRotation(value);
    if (els.textRotation) els.textRotation.value = String(rotation);
    if (els.textRotationValue) els.textRotationValue.textContent = `${Math.round(rotation)}°`;
  }

  function previewTextRotation(value) {
    const rotation = clampRotation(value);
    syncTextRotationControls(rotation);
    if (selectedText) applyTextRotation(selectedText, rotation);
  }

  function commitTextRotation() {
    if (!selectedText) return;
    applyTextRotation(selectedText, els.textRotation?.value ?? 0);
    commitState();
    setStatus("Text rotation updated.");
  }

  function normalizeTextAlign(value) {
    const align = String(value || "left").toLowerCase();
    return align === "center" || align === "right" ? align : "left";
  }

  function textAnchorForAlign(align) {
    if (align === "center") return "middle";
    if (align === "right") return "end";
    return "start";
  }

  function textAlignFromNode(textNode) {
    if (!textNode) return "left";
    if (textNode.dataset?.textAlign) return normalizeTextAlign(textNode.dataset.textAlign);
    const anchor = String(textNode.getAttribute("text-anchor") || "start").toLowerCase();
    if (anchor === "middle") return "center";
    if (anchor === "end") return "right";
    return "left";
  }

  function textIsBold(textNode) {
    const weight = String(textNode?.getAttribute("font-weight") || "").toLowerCase();
    if (weight === "bold" || weight === "bolder") return true;
    const numeric = Number(weight);
    return Number.isFinite(numeric) && numeric >= 600;
  }

  function textIsItalic(textNode) {
    const style = String(textNode?.getAttribute("font-style") || "").toLowerCase();
    return style === "italic" || style === "oblique";
  }

  function setTextAlignControls(value) {
    const align = normalizeTextAlign(value);
    els.textAlignButtons.forEach((button) => {
      const active = button.dataset.textAlign === align;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function setTextToggleControl(button, active) {
    if (!button) return;
    const on = Boolean(active);
    button.classList.toggle("is-active", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function currentTextAlign() {
    return normalizeTextAlign(els.textAlignButtons.find((button) => button.classList.contains("is-active"))?.dataset.textAlign || "left");
  }

  function textValueFromNode(textNode) {
    if (!textNode) return "";
    if (typeof textNode.dataset?.textValue === "string") return textNode.dataset.textValue;
    const spans = Array.from(textNode.querySelectorAll(":scope > tspan"));
    if (spans.length) return spans.map((span) => span.textContent?.replace(/\u200B/g, "") || "").join("\n");
    return textNode.textContent || "";
  }

  function syncTextLinePositions(textNode) {
    if (!textNode) return;
    const x = textNode.getAttribute("x") || "0";
    textNode.querySelectorAll(":scope > tspan").forEach((span) => span.setAttribute("x", x));
  }

  function normalizeTextStrokeWidth(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(18, n));
  }

  function textStrokeWidthFromNode(textNode) {
    if (!textNode) return 0;
    const stroke = String(textNode.getAttribute("stroke") || "").toLowerCase();
    if (!stroke || stroke === "none") return 0;
    return normalizeTextStrokeWidth(textNode.getAttribute("stroke-width"));
  }

  function textStrokeWidthFromControl() {
    return normalizeTextStrokeWidth(els.textStrokeWidth?.value ?? 0);
  }

  function syncTextStrokeControls(value) {
    if (els.textStrokeWidth) els.textStrokeWidth.value = String(normalizeTextStrokeWidth(value));
  }

  function applyTextStroke(textNode, color, width) {
    if (!textNode) return;
    const strokeWidth = normalizeTextStrokeWidth(width);
    if (strokeWidth <= 0) {
      textNode.setAttribute("stroke", "none");
      textNode.setAttribute("stroke-width", "0");
      textNode.removeAttribute("paint-order");
      textNode.removeAttribute("stroke-linejoin");
      return;
    }
    const hex = normalizeHex(color) || backgroundColor || "#000000";
    textNode.setAttribute("stroke", hex);
    textNode.setAttribute("stroke-width", String(strokeWidth));
    textNode.setAttribute("paint-order", "stroke fill");
    textNode.setAttribute("stroke-linejoin", "round");
  }

  function renderTextLines(textNode, value) {
    if (!textNode) return;
    const normalized = String(value ?? "").replace(/\r\n?/g, "\n");
    textNode.dataset.textValue = normalized;
    while (textNode.firstChild) textNode.removeChild(textNode.firstChild);

    const lines = normalized.split("\n");
    lines.forEach((line, index) => {
      const tspan = document.createElementNS(SVG_NS, "tspan");
      tspan.setAttribute("x", textNode.getAttribute("x") || "0");
      tspan.setAttribute("dy", index === 0 ? "0" : "1.2em");
      tspan.textContent = line || "\u200B";
      textNode.appendChild(tspan);
    });
  }

  function applyTextFormatting(textNode, settings, options = {}) {
    if (!textNode) return;
    textNode.setAttribute("font-family", settings.font);
    textNode.setAttribute("font-size", String(settings.size));
    textNode.setAttribute("font-weight", settings.bold ? "700" : "400");
    textNode.setAttribute("font-style", settings.italic ? "italic" : "normal");
    textNode.dataset.textAlign = normalizeTextAlign(settings.align);
    textNode.setAttribute("text-anchor", textAnchorForAlign(textNode.dataset.textAlign));
    applyTextStroke(textNode, backgroundColor, settings.strokeWidth);
    if (options.renderValue !== false) renderTextLines(textNode, settings.value);
    else syncTextLinePositions(textNode);
  }

  function currentTextSettings() {
    const value = String(els.textValue?.value || "").replace(/\r\n?/g, "\n").trim();
    return {
      value,
      font: els.textFont?.value || "Arial, sans-serif",
      size: Math.max(10, Math.min(160, Number(els.textSize?.value) || 44)),
      rotation: clampRotation(els.textRotation?.value ?? 0),
      strokeWidth: textStrokeWidthFromControl(),
      align: currentTextAlign(),
      bold: els.textBoldBtn?.getAttribute("aria-pressed") === "true",
      italic: els.textItalicBtn?.getAttribute("aria-pressed") === "true"
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
    text.setAttribute("fill", foregroundColor);
    applyTextFormatting(text, settings);
    applyTextRotation(text, settings.rotation);
    textLayerFor().appendChild(text);
    markColorUsed(foregroundColor);
    if (settings.strokeWidth > 0) markColorUsed(backgroundColor);

    selectText(text);
    commitState();
    setStatus("Text added. Drag it to reposition, or change the controls to edit it.");
  }

  function selectText(text) {
    clearStampSelection();
    clearTextSelection();
    selectedText = text;
    selectedText.classList.add("is-selected");

    if (els.textValue) els.textValue.value = textValueFromNode(selectedText);
    if (els.textFont) els.textFont.value = selectedText.getAttribute("font-family") || els.textFont.value;
    if (els.textSize) els.textSize.value = selectedText.getAttribute("font-size") || els.textSize.value;
    syncTextStrokeControls(textStrokeWidthFromNode(selectedText));
    syncTextRotationControls(textRotationValue(selectedText));
    setTextAlignControls(textAlignFromNode(selectedText));
    setTextToggleControl(els.textBoldBtn, textIsBold(selectedText));
    setTextToggleControl(els.textItalicBtn, textIsItalic(selectedText));

    const fill = normalizeHex(selectedText.getAttribute("fill"));
    const stroke = normalizeHex(selectedText.getAttribute("stroke"));
    if (fill) foregroundColor = fill;
    if (stroke) backgroundColor = stroke;
    stampMainColor = foregroundColor;
    stampAccentColor = backgroundColor;
    setActiveColorTarget(activeColorTarget, { syncPicker: false });

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
    textMaskMarks = maskMarksFor(text);
    textOriginalMaskTranslate = textMaskMarks ? parseTranslate(textMaskMarks.getAttribute("transform")) : null;
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
    syncTextLinePositions(selectedText);
    applyTextRotation(selectedText, textRotationValue(selectedText));
    if (textMaskMarks && textOriginalMaskTranslate) {
      textMaskMarks.setAttribute("transform", `translate(${(textOriginalMaskTranslate.x + dx).toFixed(2)} ${(textOriginalMaskTranslate.y + dy).toFixed(2)})`);
    }
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
    textOriginalMaskTranslate = null;
    textMaskMarks = null;
    textDidMove = false;
    event.preventDefault();
  }

  function updateSelectedText() {
    if (!selectedText) return;
    const settings = currentTextSettings();
    applyTextFormatting(selectedText, { ...settings, value: settings.value || "Text" });
    selectedText.setAttribute("fill", foregroundColor);
    applyTextStroke(selectedText, backgroundColor, settings.strokeWidth);
    applyTextRotation(selectedText, settings.rotation);
    markColorUsed(foregroundColor);
    if (settings.strokeWidth > 0) markColorUsed(backgroundColor);
    commitState();
    setStatus("Text updated.");
  }

  function updateSelectedTextFormatting(statusMessage = "Text formatting updated.") {
    if (!selectedText) return;
    const settings = currentTextSettings();
    applyTextFormatting(selectedText, { ...settings, value: textValueFromNode(selectedText) }, { renderValue: false });
    selectedText.setAttribute("fill", foregroundColor);
    applyTextStroke(selectedText, backgroundColor, settings.strokeWidth);
    applyTextRotation(selectedText, settings.rotation);
    commitState();
    setStatus(statusMessage);
  }

  function deleteSelectedText() {
    if (!selectedText) return;
    selectedText.remove();
    selectedText = null;
    if (els.deleteTextBtn) els.deleteTextBtn.disabled = true;
    commitState();
    setStatus("Text deleted.");
  }

  function clampStampScale(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 100;
    return Math.max(25, Math.min(200, n));
  }

  function clampStampSize(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 360;
    return Math.max(80, Math.min(1400, n));
  }

  function updateStampControls() {
    if (els.stampSize) els.stampSize.value = String(Math.round(stampSize));
    if (els.stampScaleX) els.stampScaleX.value = String(Math.round(stampScaleX));
    if (els.stampScaleXValue) els.stampScaleXValue.textContent = `${Math.round(stampScaleX)}%`;
    if (els.stampScaleY) els.stampScaleY.value = String(Math.round(stampScaleY));
    if (els.stampScaleYValue) els.stampScaleYValue.textContent = `${Math.round(stampScaleY)}%`;
    if (els.stampRotation) els.stampRotation.value = String(Math.round(stampRotation));
    if (els.stampRotationValue) els.stampRotationValue.textContent = `${Math.round(stampRotation)}°`;
  }

  function setStampChoice(button) {
    if (!button?.dataset?.stampSrc) return;
    currentStampSrc = button.dataset.stampSrc;
    currentStampName = button.dataset.stampName || "Stamp";
    els.stampChoices.forEach((choice) => {
      const active = choice === button;
      choice.classList.toggle("is-active", active);
      choice.setAttribute("aria-pressed", String(active));
    });
    setStatus(`${currentStampName} selected. Click the artwork to place it.`);
  }

  async function loadStampTemplate(src) {
    if (!src) throw new Error("No stamp selected.");
    if (stampTemplateCache.has(src)) return stampTemplateCache.get(src);

    const promise = fetch(src, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error(`Could not load stamp (${response.status}).`);
      const text = await response.text();
      const doc = new DOMParser().parseFromString(text, "image/svg+xml");
      if (doc.querySelector("parsererror")) throw new Error("Stamp SVG could not be parsed.");
      const sourceSvg = doc.documentElement;
      if (!sourceSvg || sourceSvg.localName !== "svg") throw new Error("Stamp file did not contain an SVG.");

      const viewBox = (sourceSvg.getAttribute("viewBox") || "0 0 100 100").trim().split(/[ ,]+/).map(Number);
      if (viewBox.length !== 4 || viewBox.some((v) => !Number.isFinite(v)) || viewBox[2] <= 0 || viewBox[3] <= 0) {
        throw new Error("Stamp SVG needs a valid viewBox.");
      }

      const clone = sourceSvg.cloneNode(true);

      // Illustrator can preserve a layer name as either id="main_color" or
      // data-name="main_color" (and may vary punctuation/case depending on
      // export settings). Accept those equivalent forms without modifying the
      // source SVG file itself.
      const normalizeStampLayerName = (value) => String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
      const findStampLayer = (wanted) => {
        const normalizedWanted = normalizeStampLayerName(wanted);
        return Array.from(clone.querySelectorAll("[id], [data-name]")).find((node) => {
          return normalizeStampLayerName(node.getAttribute("id")) === normalizedWanted
            || normalizeStampLayerName(node.getAttribute("data-name")) === normalizedWanted;
        }) || null;
      };

      const main = findStampLayer("main_color");
      const accent = findStampLayer("accent_color");
      if (main) {
        main.removeAttribute("id");
        main.dataset.stampMain = "true";
      }
      if (accent) {
        accent.removeAttribute("id");
        accent.dataset.stampAccent = "true";
      }
      clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));

      return { clone, viewBox };
    });

    stampTemplateCache.set(src, promise);
    try {
      return await promise;
    } catch (error) {
      stampTemplateCache.delete(src);
      throw error;
    }
  }

  function paintStampRegion(stamp, target, color) {
    const hex = normalizeHex(color);
    if (!stamp || !hex) return;
    const selector = target === "accent" ? "[data-stamp-accent='true']" : "[data-stamp-main='true']";
    stamp.querySelectorAll(selector).forEach((node) => {
      // Illustrator commonly exports fills through .cls-* rules in an embedded
      // <style>. A normal SVG fill attribute loses to those class rules. An
      // inline important fill overrides that exported CSS while leaving the
      // original stamp SVG untouched on disk.
      node.setAttribute("fill", hex);
      node.style?.setProperty("fill", hex, "important");
      node.querySelectorAll?.("path, polygon, rect, circle, ellipse").forEach((shape) => {
        shape.setAttribute("fill", hex);
        shape.style?.setProperty("fill", hex, "important");
      });
    });
  }

  function applyStampColorChannel(stamp, target, color) {
    const hex = normalizeHex(color);
    if (!stamp || !hex) return;
    const channel = target === "accent" ? "accent" : "main";
    paintStampRegion(stamp, channel, hex);
    if (channel === "accent") stamp.dataset.accentColor = hex;
    else stamp.dataset.mainColor = hex;
  }

  function applyStampColors(stamp, mainColor, accentColor) {
    const main = normalizeHex(mainColor) || "#FFFFFF";
    const accent = normalizeHex(accentColor) || "#000000";
    applyStampColorChannel(stamp, "main", main);
    applyStampColorChannel(stamp, "accent", accent);
  }

  function stampChannelColor(stamp, target) {
    if (!stamp) return null;
    const channel = target === "accent" ? "accent" : "main";
    const dataColor = normalizeHex(channel === "accent" ? stamp.dataset.accentColor : stamp.dataset.mainColor);
    if (dataColor) return dataColor;
    const marker = stamp.querySelector(channel === "accent" ? "[data-stamp-accent='true']" : "[data-stamp-main='true']");
    if (!marker) return null;
    return normalizeSvgColor(marker.getAttribute("fill"))
      || normalizeSvgColor(marker.querySelector?.("path, polygon, rect, circle, ellipse")?.getAttribute("fill"));
  }

  function syncStampColorControls() {
    stampMainColor = foregroundColor;
    stampAccentColor = backgroundColor;
    syncGlobalColorControls();
  }

  function setStampColorTarget(target, options = {}) {
    setActiveColorTarget(target === "accent" ? "background" : "foreground", { announce: options.announce !== false });
  }

  function updateStampTransform(stamp) {
    if (!stamp) return;
    const x = Number(stamp.dataset.x) || 0;
    const y = Number(stamp.dataset.y) || 0;
    const size = clampStampSize(stamp.dataset.size);
    const scaleXPercent = clampStampScale(stamp.dataset.scaleX ?? 100);
    const scaleYPercent = clampStampScale(stamp.dataset.scaleY ?? 100);
    const rotation = clampRotation(stamp.dataset.rotation);
    const vbX = Number(stamp.dataset.vbX) || 0;
    const vbY = Number(stamp.dataset.vbY) || 0;
    const vbW = Math.max(1, Number(stamp.dataset.vbW) || 100);
    const vbH = Math.max(1, Number(stamp.dataset.vbH) || 100);
    const baseScale = size / vbW;
    const scaleX = baseScale * (scaleXPercent / 100);
    const scaleY = baseScale * (scaleYPercent / 100);
    const cx = vbX + vbW / 2;
    const cy = vbY + vbH / 2;

    // Build one explicit matrix so the stamp's center always stays at (x, y).
    // This keeps dragging completely independent from non-uniform scaling.
    const radians = rotation * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const a = cos * scaleX;
    const b = sin * scaleX;
    const c = -sin * scaleY;
    const d = cos * scaleY;
    const e = x - (a * cx) - (c * cy);
    const f = y - (b * cx) - (d * cy);

    stamp.setAttribute(
      "transform",
      `matrix(${a.toFixed(8)} ${b.toFixed(8)} ${c.toFixed(8)} ${d.toFixed(8)} ${e.toFixed(4)} ${f.toFixed(4)})`
    );
  }

  async function addStampAt(point) {
    if (!currentStampSrc) {
      setStatus("Choose a stamp first.");
      return;
    }

    try {
      const template = await loadStampTemplate(currentStampSrc);
      const [vbX, vbY, vbW, vbH] = template.viewBox;
      const stamp = document.createElementNS(SVG_NS, "g");
      stamp.classList.add("user-stamp");
      stamp.dataset.stampSrc = currentStampSrc;
      stamp.dataset.stampName = currentStampName;
      stamp.dataset.x = String(point.x);
      stamp.dataset.y = String(point.y);
      stamp.dataset.size = String(stampSize);
      stamp.dataset.scaleX = String(stampScaleX);
      stamp.dataset.scaleY = String(stampScaleY);
      stamp.dataset.rotation = String(stampRotation);
      stamp.dataset.vbX = String(vbX);
      stamp.dataset.vbY = String(vbY);
      stamp.dataset.vbW = String(vbW);
      stamp.dataset.vbH = String(vbH);

      Array.from(template.clone.childNodes).forEach((node) => {
        stamp.appendChild(document.importNode(node, true));
      });

      applyStampColors(stamp, stampMainColor, stampAccentColor);
      updateStampTransform(stamp);
      textLayerFor().appendChild(stamp);
      markColorUsed(stampMainColor);
      markColorUsed(stampAccentColor);
      selectStamp(stamp);
      commitState();
      setStatus(`${currentStampName} placed. Drag it to move it.`);
    } catch (error) {
      console.error("[coloring-book stamp]", error);
      setStatus(error.message || "The stamp could not be loaded.");
    }
  }

  function selectStamp(stamp) {
    clearTextSelection();
    clearStampSelection();
    selectedStamp = stamp;
    selectedStamp.classList.add("is-selected");

    stampSize = clampStampSize(selectedStamp.dataset.size);
    stampScaleX = clampStampScale(selectedStamp.dataset.scaleX ?? 100);
    stampScaleY = clampStampScale(selectedStamp.dataset.scaleY ?? 100);
    stampRotation = clampRotation(selectedStamp.dataset.rotation);
    updateStampControls();

    stampMainColor = stampChannelColor(selectedStamp, "main") || stampMainColor || foregroundColor;
    stampAccentColor = stampChannelColor(selectedStamp, "accent") || stampAccentColor || backgroundColor;
    foregroundColor = stampMainColor;
    backgroundColor = stampAccentColor;
    setActiveColorTarget(activeColorTarget, { syncPicker: false });

    const position = stampPosition(selectedStamp);
    if (position) layerPosition = position;
    updateLayerButtons();
    if (els.deleteStampBtn) els.deleteStampBtn.disabled = false;
  }

  function clearStampSelection() {
    if (selectedStamp) selectedStamp.classList.remove("is-selected");
    selectedStamp = null;
    if (els.deleteStampBtn) els.deleteStampBtn.disabled = true;
    updateLayerButtons();
  }

  function startStampDrag(event, stamp) {
    selectStamp(stamp);
    draggingStamp = true;
    stampDidMove = false;
    stampDragStart = getSvgPoint(event);
    stampOriginalPos = {
      x: Number(stamp.dataset.x) || 0,
      y: Number(stamp.dataset.y) || 0
    };
    svgRoot.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  }

  function continueStampDrag(event) {
    if (!draggingStamp || !selectedStamp || !stampDragStart || !stampOriginalPos) return;
    const point = getSvgPoint(event);
    const dx = point.x - stampDragStart.x;
    const dy = point.y - stampDragStart.y;
    if (Math.abs(dx) + Math.abs(dy) > 1) stampDidMove = true;
    selectedStamp.dataset.x = String(stampOriginalPos.x + dx);
    selectedStamp.dataset.y = String(stampOriginalPos.y + dy);
    updateStampTransform(selectedStamp);
    event.preventDefault();
  }

  function endStampDrag(event) {
    if (!draggingStamp) return;
    draggingStamp = false;
    try { svgRoot.releasePointerCapture?.(event.pointerId); } catch (_) {}
    if (stampDidMove) {
      commitState();
      setStatus("Stamp moved.");
    }
    stampDragStart = null;
    stampOriginalPos = null;
    stampDidMove = false;
    event?.preventDefault?.();
  }

  function previewStampSize(value) {
    stampSize = clampStampSize(value);
    if (selectedStamp) {
      selectedStamp.dataset.size = String(stampSize);
      updateStampTransform(selectedStamp);
    }
  }

  function commitStampSize() {
    if (!selectedStamp) return;
    selectedStamp.dataset.size = String(stampSize);
    updateStampTransform(selectedStamp);
    commitState();
    setStatus("Stamp size updated.");
  }

  function previewStampScaleX(value) {
    stampScaleX = clampStampScale(value);
    if (els.stampScaleXValue) els.stampScaleXValue.textContent = `${Math.round(stampScaleX)}%`;
    if (selectedStamp) {
      selectedStamp.dataset.scaleX = String(stampScaleX);
      updateStampTransform(selectedStamp);
    }
  }

  function commitStampScaleX() {
    if (!selectedStamp) return;
    selectedStamp.dataset.scaleX = String(stampScaleX);
    updateStampTransform(selectedStamp);
    commitState();
    setStatus("Stamp horizontal scale updated.");
  }

  function previewStampScaleY(value) {
    stampScaleY = clampStampScale(value);
    if (els.stampScaleYValue) els.stampScaleYValue.textContent = `${Math.round(stampScaleY)}%`;
    if (selectedStamp) {
      selectedStamp.dataset.scaleY = String(stampScaleY);
      updateStampTransform(selectedStamp);
    }
  }

  function commitStampScaleY() {
    if (!selectedStamp) return;
    selectedStamp.dataset.scaleY = String(stampScaleY);
    updateStampTransform(selectedStamp);
    commitState();
    setStatus("Stamp vertical scale updated.");
  }

  function previewStampRotation(value) {
    stampRotation = clampRotation(value);
    if (els.stampRotationValue) els.stampRotationValue.textContent = `${Math.round(stampRotation)}°`;
    if (selectedStamp) {
      selectedStamp.dataset.rotation = String(stampRotation);
      updateStampTransform(selectedStamp);
    }
  }

  function commitStampRotation() {
    if (!selectedStamp) return;
    selectedStamp.dataset.rotation = String(stampRotation);
    updateStampTransform(selectedStamp);
    commitState();
    setStatus("Stamp rotation updated.");
  }

  function deleteSelectedStamp() {
    if (!selectedStamp) return;
    selectedStamp.remove();
    selectedStamp = null;
    if (els.deleteStampBtn) els.deleteStampBtn.disabled = true;
    commitState();
    setStatus("Stamp deleted.");
  }

  function bindSvgEvents() {
    els.artboard?.addEventListener("pointerenter", (event) => {
      if (currentTool === "brush" || currentTool === "eraser" || currentTool === "eyedrop") showCursorPreview(event);
    });

    els.artboard?.addEventListener("pointermove", (event) => {
      if (currentTool === "brush" || currentTool === "eraser" || currentTool === "eyedrop") showCursorPreview(event);
    });

    els.artboard?.addEventListener("pointerleave", () => {
      hideCursorPreview();
    });

    svgRoot.addEventListener("pointerdown", (event) => {
      if (currentTool === "brush") {
        const targetRole = event.button === 2 ? "background" : "foreground";
        setActiveColorTarget(targetRole, { syncPicker: false });
        startBrush(event, targetRole === "background" ? backgroundColor : foregroundColor);
        return;
      }

      if (currentTool === "bucket") {
        if (event.button !== 0 && event.button !== 2) return;
        const targetRole = event.button === 2 ? "background" : "foreground";
        setActiveColorTarget(targetRole, { syncPicker: false });
        paintBucket(event.target, targetRole === "background" ? backgroundColor : foregroundColor);
        event.preventDefault();
        return;
      }

      if (currentTool === "eyedrop") {
        if (event.button !== 0 && event.button !== 2) return;
        const targetRole = event.button === 2 ? "background" : "foreground";
        eyedropColor(event.target, targetRole);
        event.preventDefault();
        return;
      }

      if (currentTool === "stamp") {
        const stamp = event.target.closest?.(".user-stamp");
        if (stamp && allTextLayers().some((layer) => layer.contains(stamp))) {
          startStampDrag(event, stamp);
          return;
        }
        clearStampSelection();
        addStampAt(getSvgPoint(event));
        event.preventDefault();
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
      if (currentTool === "text") continueTextDrag(event);
      if (currentTool === "stamp") continueStampDrag(event);
    });

    svgRoot.addEventListener("pointerup", (event) => {
      if (currentTool === "brush") endBrush(event);
      if (currentTool === "text") endTextDrag(event);
      if (currentTool === "stamp") endStampDrag(event);
    });

    svgRoot.addEventListener("pointercancel", (event) => {
      if (currentTool === "brush") endBrush(event);
      if (currentTool === "text") endTextDrag(event);
      if (currentTool === "stamp") endStampDrag(event);
    });

    svgRoot.addEventListener("click", (event) => {
      if (currentTool === "bucket" || currentTool === "eyedrop") {
        event.preventDefault();
      }
    });

    // Mouse eraser tracking is intentionally separate from SVG Pointer Events.
    // Once the left mouse button goes down, document-level mousemove/mouseup
    // owns the drag until release, even while masks change under the pointer.
    svgRoot.addEventListener("mousedown", (event) => {
      if (currentTool === "eraser") startEraser(event);
    });

    document.addEventListener("mousemove", (event) => {
      if (currentTool === "eraser" && drawing) continueEraser(event);
    }, { capture: true, passive: false });

    document.addEventListener("mouseup", (event) => {
      if (currentTool === "eraser" && drawing) endEraser(event);
    }, { capture: true, passive: false });

    window.addEventListener("blur", () => {
      if (currentTool === "eraser" && drawing) endEraser(null);
    });

    els.artboardWrap?.addEventListener("contextmenu", (event) => {
      if (!els.artboard?.contains(event.target)) return;
      if (["brush", "bucket", "eyedrop"].includes(currentTool)) {
        event.preventDefault();
      }
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

  function updatePickerFromPointer(event, target = pickingColorTarget, applyToSelection = false) {
    if (!els.colorPickerField) return;
    const rect = els.colorPickerField.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    pickerSaturation = rect.width ? x / rect.width : 0;
    pickerValue = rect.height ? 1 - (y / rect.height) : 0;
    updateColorPickerUi();
    setActiveColorTarget(target, { syncPicker: false });
    setCurrentColor(pickerHex(), {
      target,
      applyToSelectedText: applyToSelection,
      applyToSelectedStamp: applyToSelection,
      syncPicker: false
    });
  }

  function bindColorPicker() {
    if (els.colorPickerField) {
      els.colorPickerField.addEventListener("contextmenu", (event) => event.preventDefault());

      els.colorPickerField.addEventListener("pointerdown", (event) => {
        if (event.button !== undefined && event.button !== 0 && event.button !== 2) return;
        pickingColor = true;
        pickingColorTarget = event.button === 2 ? "background" : "foreground";
        els.colorPickerField.setPointerCapture?.(event.pointerId);
        updatePickerFromPointer(event, pickingColorTarget, false);
        event.preventDefault();
      });

      els.colorPickerField.addEventListener("pointermove", (event) => {
        if (!pickingColor) return;
        updatePickerFromPointer(event, pickingColorTarget, false);
        event.preventDefault();
      });

      const finishPick = (event) => {
        if (!pickingColor) return;
        pickingColor = false;
        try { els.colorPickerField.releasePointerCapture?.(event.pointerId); } catch (_) {}
        updatePickerFromPointer(event, pickingColorTarget, true);
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

    els.hueSlider?.addEventListener("contextmenu", (event) => event.preventDefault());
    els.hueSlider?.addEventListener("pointerdown", (event) => {
      if (event.button === 2) setActiveColorTarget("background", { syncPicker: false });
      else if (event.button === 0) setActiveColorTarget("foreground", { syncPicker: false });
    });

    els.hueSlider?.addEventListener("input", () => {
      pickerHue = Number(els.hueSlider.value) || 0;
      updateColorPickerUi();
      setCurrentColor(pickerHex(), { applyToSelectedText: false, applyToSelectedStamp: false, syncPicker: false });
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
      { tool: "eyedrop", icon: "💧", label: "Eyedropper" },
      { tool: "stamp", icon: "💬", label: "Stamp" },
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

    els.paletteTabButtons.forEach((button) => {
      button.addEventListener("click", () => setPaletteTab(button.dataset.paletteTab));
    });

    els.paletteSelect?.addEventListener("change", () => renderPalette(els.paletteSelect.value));
    bindColorPicker();

    els.globalColorButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setActiveColorTarget(button.dataset.globalColorTarget, { announce: true });
      });
    });

    els.swapColorsBtn?.addEventListener("click", swapGlobalColors);

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

    els.stampChoices.forEach((button) => {
      button.addEventListener("click", () => setStampChoice(button));
    });

    els.stampColorButtons.forEach((button) => {
      button.addEventListener("click", () => setStampColorTarget(button.dataset.stampColorTarget));
    });

    els.stampSize?.addEventListener("input", () => previewStampSize(els.stampSize.value));
    els.stampSize?.addEventListener("change", commitStampSize);

    els.stampScaleX?.addEventListener("input", () => previewStampScaleX(els.stampScaleX.value));
    els.stampScaleX?.addEventListener("change", commitStampScaleX);
    els.stampScaleY?.addEventListener("input", () => previewStampScaleY(els.stampScaleY.value));
    els.stampScaleY?.addEventListener("change", commitStampScaleY);

    els.stampRotation?.addEventListener("input", () => previewStampRotation(els.stampRotation.value));
    els.stampRotation?.addEventListener("change", commitStampRotation);
    els.deleteStampBtn?.addEventListener("click", deleteSelectedStamp);

    [els.textValue, els.textFont].forEach((control) => {
      control?.addEventListener("change", updateSelectedText);
    });

    els.textAlignButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setTextAlignControls(button.dataset.textAlign);
        if (selectedText) updateSelectedTextFormatting("Text alignment updated.");
      });
    });

    els.textBoldBtn?.addEventListener("click", () => {
      const next = els.textBoldBtn.getAttribute("aria-pressed") !== "true";
      setTextToggleControl(els.textBoldBtn, next);
      if (selectedText) updateSelectedTextFormatting(next ? "Bold turned on." : "Bold turned off.");
    });

    els.textItalicBtn?.addEventListener("click", () => {
      const next = els.textItalicBtn.getAttribute("aria-pressed") !== "true";
      setTextToggleControl(els.textItalicBtn, next);
      if (selectedText) updateSelectedTextFormatting(next ? "Italics turned on." : "Italics turned off.");
    });

    els.textSize?.addEventListener("input", () => {
      if (!selectedText) return;
      const size = Math.max(10, Math.min(160, Number(els.textSize.value) || 44));
      selectedText.setAttribute("font-size", String(size));
    });
    els.textSize?.addEventListener("change", () => {
      if (!selectedText) return;
      commitState();
      setStatus("Text size updated.");
    });

    els.textRotation?.addEventListener("input", () => {
      previewTextRotation(els.textRotation.value);
    });
    els.textRotation?.addEventListener("change", commitTextRotation);

    els.textStrokeWidth?.addEventListener("input", () => {
      if (!selectedText) return;
      updateSelectedTextFormatting("Text outline width updated.");
    });
    els.textStrokeWidth?.addEventListener("change", () => {
      if (!selectedText) return;
      commitState();
      setStatus("Text outline width updated.");
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

      if ((event.key === "Delete" || event.key === "Backspace") && !typing) {
        if (selectedText) {
          event.preventDefault();
          deleteSelectedText();
        } else if (selectedStamp) {
          event.preventDefault();
          deleteSelectedStamp();
        }
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
    if (els.stampChoices[0]) setStampChoice(els.stampChoices[0]);
    updateStampControls();
    syncGlobalColorControls();
    setCurrentColor(currentColor, { applyToSelectedText: false, applyToSelectedStamp: false, announce: false, persistTarget: false });
    updateLayerButtons();
    updateZoomUi();
    setPaletteTab("presets");
    refreshCurrentColors();
    ensureCursorPreview();
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
