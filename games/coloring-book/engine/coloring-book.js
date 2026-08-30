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
    hexInput: document.getElementById("hexInput"),
    currentColorChip: document.getElementById("currentColorChip"),
    currentColorText: document.getElementById("currentColorText"),
    toolButtons: Array.from(document.querySelectorAll("[data-tool]")),
    brushOptions: document.getElementById("brushOptions"),
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
    workspaceTitle: document.getElementById("workspaceTitle")
  };

  let svgRoot = null;
  let colorGroup = null;
  let inkGroup = null;
  let paintLayer = null;
  let textLayer = null;
  let fillables = [];

  let currentTool = CFG.defaultTool || "bucket";
  let currentColor = normalizeHex(CFG.defaultColor || "#D7263D") || "#D7263D";
  let brushSize = 12;
  let selectedText = null;

  let drawing = false;
  let currentBrushPath = null;
  let currentBrushPoints = [];

  let draggingText = false;
  let textDragStart = null;
  let textOriginalPos = null;
  let textDidMove = false;

  let initialState = null;
  let history = [];
  let historyIndex = -1;

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
    if (!["bucket", "brush", "text"].includes(tool)) return;
    currentTool = tool;
    els.artboard?.setAttribute("data-tool", tool);

    els.toolButtons.forEach((button) => {
      const active = button.dataset.tool === tool;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (els.brushOptions) els.brushOptions.hidden = tool !== "brush";
    if (els.textOptions) els.textOptions.hidden = tool !== "text";

    if (tool !== "text") clearTextSelection();

    if (tool === "bucket") setStatus("Paint Bucket: choose a color, then click any white area.");
    if (tool === "brush") setStatus("Brush: drag across the picture to paint freely.");
    if (tool === "text") setStatus("Text: type your words, then click the picture to place them.");
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

    paintLayer = document.createElementNS(SVG_NS, "g");
    paintLayer.id = "paint-layer";
    paintLayer.dataset.coloringGenerated = "true";

    textLayer = document.createElementNS(SVG_NS, "g");
    textLayer.id = "text-layer";
    textLayer.dataset.coloringGenerated = "true";

    inkGroup.parentNode.insertBefore(paintLayer, inkGroup);
    inkGroup.parentNode.insertBefore(textLayer, inkGroup);

    svgRoot.setAttribute("role", "img");
    svgRoot.setAttribute("aria-label", `${CFG.title || "Coloring page"} interactive coloring page`);
    svgRoot.setAttribute("focusable", "false");

    const viewBox = svgRoot.viewBox && svgRoot.viewBox.baseVal;
    if (viewBox && viewBox.width > 0 && viewBox.height > 0 && els.artboard) {
      els.artboard.style.aspectRatio = `${viewBox.width} / ${viewBox.height}`;
    }

    bindSvgEvents();

    initialState = captureState();
    history = [initialState];
    historyIndex = 0;
    updateHistoryButtons();
  }

  function captureState() {
    let textMarkup = "";
    if (textLayer) {
      const clone = textLayer.cloneNode(true);
      clone.querySelectorAll(".is-selected").forEach((el) => el.classList.remove("is-selected"));
      textMarkup = clone.innerHTML;
    }

    return {
      fills: fillables.map((shape) => shape.getAttribute("fill") || "#FFFFFF"),
      paint: paintLayer ? paintLayer.innerHTML : "",
      text: textMarkup
    };
  }

  function applyState(state) {
    if (!state) return;
    state.fills.forEach((fill, index) => {
      if (fillables[index]) fillables[index].setAttribute("fill", fill || "#FFFFFF");
    });
    if (paintLayer) paintLayer.innerHTML = state.paint || "";
    if (textLayer) {
      textLayer.innerHTML = state.text || "";
      textLayer.querySelectorAll(".is-selected").forEach((el) => el.classList.remove("is-selected"));
    }
    clearTextSelection();
  }

  function statesEqual(a, b) {
    if (!a || !b) return false;
    return a.paint === b.paint && a.text === b.text && a.fills.join("|") === b.fills.join("|");
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
    paintLayer.appendChild(currentBrushPath);

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
    textLayer.appendChild(text);

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

    if (els.deleteTextBtn) els.deleteTextBtn.disabled = false;
  }

  function clearTextSelection() {
    if (selectedText) selectedText.classList.remove("is-selected");
    selectedText = null;
    if (els.deleteTextBtn) els.deleteTextBtn.disabled = true;
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

      if (currentTool === "text") {
        const text = event.target.closest?.(".user-text");
        if (text && textLayer.contains(text)) {
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
    });

    svgRoot.addEventListener("pointerup", (event) => {
      if (currentTool === "brush") endBrush(event);
      if (currentTool === "text") endTextDrag(event);
    });

    svgRoot.addEventListener("pointercancel", (event) => {
      if (currentTool === "brush") endBrush(event);
      if (currentTool === "text") endTextDrag(event);
    });

    svgRoot.addEventListener("click", (event) => {
      if (currentTool === "bucket") paintBucket(event.target);
    });
  }

  function bindControls() {
    els.toolButtons.forEach((button) => {
      button.addEventListener("click", () => setTool(button.dataset.tool));
    });

    els.paletteSelect?.addEventListener("change", () => renderPalette(els.paletteSelect.value));

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
    bindControls();
    setBrushSize(12);
    setCurrentColor(currentColor, { applyToSelectedText: false });
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
