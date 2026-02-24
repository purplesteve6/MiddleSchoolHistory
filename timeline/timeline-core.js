(function(){
  function safeInit(){
    try {
      init();
    } catch (err) {
      const mount = document.getElementById("timelineMount");
      if (mount){
        mount.innerHTML = `
          <div style="padding:.75rem; font-weight:900; color:#ffd84a; background:rgba(0,0,0,.65); border:2px solid rgba(255,216,74,.35); border-radius:12px;">
            Timeline error: <span style="color:#fff;">${String(err && err.message ? err.message : err)}</span>
          </div>
        `;
      }
      console.error("Timeline error:", err);
    }
  }

  function init(){
    const mount = document.getElementById("timelineMount");
    if (!mount) return;

    const cfg = window.TIMELINE_CONFIG;
    if (!cfg){
      mount.innerHTML = `<div style="padding:.5rem; font-weight:900;">Missing window.TIMELINE_CONFIG</div>`;
      return;
    }

    mount.innerHTML = `
      <div class="timeline-head">
        <div class="timeline-controls">
          <div class="controlsLeft">
            <div class="controlPill" title="Zoom changes the field of view of the timeline">
              <label for="zoomSelect">Timeline View:</label>
              <select id="zoomSelect" aria-label="Zoom level"></select>
            </div>
            <select id="intervalSelect" aria-hidden="true" tabindex="-1" style="display:none"></select>
          </div>

          <div class="controlsRight">
            <div class="controlPill" title="Jump the timeline to an event">
              <label for="centerSelect">Jump to:</label>
              <select id="centerSelect" aria-label="Center timeline on an event"></select>
            </div>
          </div>
        </div>
      </div>

      <div class="timelineViewport" id="viewport" tabindex="0" aria-label="Timeline viewport (scroll horizontally)">
        <div class="contextBand" id="contextBand" aria-label="Context markers">
          <div class="contextInner" id="contextInner"></div>
        </div>
        <div class="canvasScroll" id="canvasScroll" aria-label="Timeline scroll area">
          <div class="timelineCanvas" id="canvas"></div>
        </div>
      </div>

      <div class="scrubber" aria-label="Timeline mini map scrubber">
        <div class="miniTrack" id="miniTrack">
          <div class="miniWindow" id="miniWindow" title="Drag to jump"></div>
        </div>
      </div>
    `;

    applyTheme(cfg.theme || {});

    const viewport = document.getElementById("viewport");
    const canvasScroll = document.getElementById("canvasScroll");
    const canvas = document.getElementById("canvas");
    const contextBand = document.getElementById("contextBand");
    const contextInner = document.getElementById("contextInner");

    const zoomSelect = document.getElementById("zoomSelect");
    const intervalSelect = document.getElementById("intervalSelect");
    const centerSelect = document.getElementById("centerSelect");
    const readout = null;
    const miniTrack = document.getElementById("miniTrack");
    const miniWindow = document.getElementById("miniWindow");

    const rangeBegin = parseFlexibleDate(cfg.range?.begin ?? "0001-01-01", "start");
    const rangeEnd = parseFlexibleDate(cfg.range?.end ?? "0100-12-31", "end");
    if (!rangeBegin || !rangeEnd){
      mount.innerHTML = `<div style="padding:.5rem; font-weight:900;">Bad range in TIMELINE_CONFIG</div>`;
      return;
    }

    // If the timeline span is very large, "day" zoom becomes unusable (massive px-per-day / huge scroll surface).
    // Threshold is in YEARS; adjust later or move into timeline-config.js if you want.
    const spanYears = Math.abs(toHistoricalYear(rangeEnd) - toHistoricalYear(rangeBegin)) + 1;

    const MAX_YEARS_FOR_DAY_ZOOM = 200;
    const MAX_YEARS_FOR_MONTH_ZOOM = 200;

    const allowDayZoom = spanYears <= MAX_YEARS_FOR_DAY_ZOOM;
    const allowMonthZoom = spanYears <= MAX_YEARS_FOR_MONTH_ZOOM;

    // Use one consistent px-per-day everywhere (rendering + scrolling + tick redraw).
    const TOTAL_DAYS = daysBetween(rangeBegin, rangeEnd) + 1;
    const MAX_CANVAS_WIDTH = 8_000_000;
    const MAX_PX_PER_DAY = MAX_CANVAS_WIDTH / Math.max(1, TOTAL_DAYS);

    // ---------------- DEFAULT VIEW CONFIG ----------------
    const DEFAULT_VIEW_KEY = "default";

    const hasDefault = cfg.hasDefault === true;
    const defaultInterval = (cfg.defaultInterval || "decade").toString();

    const defaultIntervalAmountRaw = (cfg.defaultIntervalAmount ?? 1);
    const defaultIntervalAmount =
      (typeof defaultIntervalAmountRaw === "number" && Number.isFinite(defaultIntervalAmountRaw) && defaultIntervalAmountRaw > 0)
        ? defaultIntervalAmountRaw
        : 1;

    function getEffectivePxPerDay(zoom, anchorDate){
      return Math.min(getPxPerDayForView(zoom, anchorDate), MAX_PX_PER_DAY);
    }

    const zoomLevelsRaw = cfg.zoomLevels || ["day","month","year","decade","century","fit"];

    const zoomLevelsFiltered = zoomLevelsRaw.filter(z => {
      if (z === "day") return allowDayZoom;
      if (z === "month") return allowMonthZoom;
      return true;
    });

    const zoomLevels = hasDefault
      ? [DEFAULT_VIEW_KEY, ...zoomLevelsFiltered.filter(z => z !== DEFAULT_VIEW_KEY)]
      : zoomLevelsFiltered;

    const intervalLevels = ["day","month","year","decade","century"]; // UI list only

    const defaultZoom = cfg.defaultZoom || (hasDefault ? DEFAULT_VIEW_KEY : defaultInterval);

    let currentCenterDate = rangeBegin;
    // Track the scale/span used by the most recent full render().
    // This prevents tick redraws from using a different pxPerDay than the bars/canvas.
    let lastRender = {
      zoom: null,
      spanKey: null,
      pxPerDay: null
    };

    function spanKeyFor(zoom, centerDate){
      if (zoom === "fit") return "fit";

      if (zoom === DEFAULT_VIEW_KEY){
        const sp = zoomSpanAligned(centerDate, defaultInterval);
        return `default:${defaultInterval}:${defaultIntervalAmount}:${sp.start.getTime()}-${sp.end.getTime()}`;
      }

      const sp = zoomSpanAligned(centerDate, zoom);
      return `${sp.start.getTime()}-${sp.end.getTime()}`;
    }

    // Tick render caching (prevents heavy DOM churn on small scroll deltas)
    let lastTickKey = "";
    let lastTickBeginIndex = -1;
    let lastTickEndIndex = -1;

    zoomSelect.innerHTML = "";
    for (const z of zoomLevels){
      const o = document.createElement("option");
      o.value = z;

      if (z === DEFAULT_VIEW_KEY){
        o.textContent = "(default)";
      } else if (z === "fit"){
        o.textContent = "Full Timeline";
      } else {
        o.textContent = cap(z);
      }

      zoomSelect.appendChild(o);
    }

    intervalSelect.innerHTML = "";
    for (const i of intervalLevels){
      const o = document.createElement("option");
      o.value = i;
      o.textContent = cap(i);
      intervalSelect.appendChild(o);
    }

    const safeDefaultZoom =
      (!allowDayZoom && defaultZoom === "day") ? (allowMonthZoom ? "month" : "year") :
      (!allowMonthZoom && defaultZoom === "month") ? "year" :
      defaultZoom;

    zoomSelect.value = zoomLevels.includes(safeDefaultZoom) ? safeDefaultZoom : zoomLevels[0];
    intervalSelect.value = defaultInterval;

    populateCenterDropdown();

    function syncIntervalToZoom(){
      const z = zoomSelect.value;
      intervalSelect.value = tickForZoom(z);
    }

    intervalSelect.disabled = true;
    syncIntervalToZoom();

    zoomSelect.addEventListener("change", () => {
      if (!allowDayZoom && zoomSelect.value === "day"){
        zoomSelect.value = allowMonthZoom ? "month" : "year";
      }
      if (!allowMonthZoom && zoomSelect.value === "month"){
        zoomSelect.value = "year";
      }

      syncIntervalToZoom();
      // Reset tick cache because scale/span changes
      lastTickKey = "";
      render();
      scrollToCenterDate(currentCenterDate);
    });

    centerSelect.addEventListener("change", () => centerOn(centerSelect.value));

    // Wheel scrolling applies to the scroll area
    canvasScroll.addEventListener("wheel", (e) => {
      if (canvasScroll.scrollWidth > canvasScroll.clientWidth){
        e.preventDefault();
        canvasScroll.scrollLeft += (e.deltaY + e.deltaX);
        // Keep context band aligned
        contextBand.scrollLeft = canvasScroll.scrollLeft;
        syncMiniWindow();
        updateReadout();
      }
    }, { passive:false });

    // Keep ticks/overlays correct even when scrolling via scrollbar drag, touch, or inertia.
    let scrollRAF = 0;
    let internalScroll = false;
    let isUpdatingReadout = false;

    canvasScroll.addEventListener("scroll", () => {
      if (internalScroll) return;
      if (scrollRAF) cancelAnimationFrame(scrollRAF);
      scrollRAF = requestAnimationFrame(() => {
        // Keep context band aligned
        if (contextBand.scrollLeft !== canvasScroll.scrollLeft){
          contextBand.scrollLeft = canvasScroll.scrollLeft;
        }
        syncMiniWindow();
        updateReadout();
      });
    }, { passive:true });

    makeMiniMapDraggable();

    window.addEventListener("resize", () => {
      // Reset tick cache because viewport width affects pxPerDay
      lastTickKey = "";
      render();
      scrollToCenterDate(currentCenterDate);
      requestAnimationFrame(() => {
        positionLanesSymmetrically();
        adjustConnectors();
      });
    });

    centerOn(centerSelect.value || "__begin__");

    /* ----------------- ZOOM/TICKS RULES ----------------- */

    function tickForZoom(z){
      // Default view: ticks are one step smaller than defaultInterval
      if (z === DEFAULT_VIEW_KEY){
        z = defaultInterval;
      }

      switch(z){
        case "century": return "decade";
        case "decade":  return "year";
        case "year":    return "month";
        case "month":   return "day";
        case "day":     return "day";
        case "fit":     return "century";
        default:        return "day";
      }
    }

    function clampDateToRange(d){
      if (d < rangeBegin) return rangeBegin;
      if (d > rangeEnd) return rangeEnd;
      return d;
    }

    function zoomSpanAligned(anchorDate, zoom){
      const a = clampDateToRange(anchorDate);

      if (zoom === "fit"){
        return { start: rangeBegin, end: rangeEnd };
      }

      const ay = a.getUTCFullYear();              // astronomical
      const histY = (ay <= 0) ? (ay - 1) : ay;    // historical
      const m = a.getUTCMonth();

      if (zoom === "day"){
        const dd = a.getUTCDate();
        return { start: makeUTCDate(ay, m, dd), end: makeUTCDate(ay, m, dd) };
      }

      if (zoom === "month"){
        const start = makeUTCDate(ay, m, 1);
        const lastDay = makeUTCDate(ay, m + 1, 0).getUTCDate();
        const end = makeUTCDate(ay, m, lastDay);
        return { start: clampDateToRange(start), end: clampDateToRange(end) };
      }

      if (zoom === "year"){
        const start = makeUTCDate(ay, 0, 1);
        const end = makeUTCDate(ay, 11, 31);
        return { start: clampDateToRange(start), end: clampDateToRange(end) };
      }

      if (zoom === "decade"){
        const y0 = Math.floor(histY / 10) * 10;
        const startAstro = histYearToAstro(y0);
        const endAstro = histYearToAstro(y0 + 9);
        const start = makeUTCDate(startAstro, 0, 1);
        const end = makeUTCDate(endAstro, 11, 31);
        return { start: clampDateToRange(start), end: clampDateToRange(end) };
      }

      const c0 = Math.floor(histY / 100) * 100;
      const startAstro = histYearToAstro(c0);
      const endAstro = histYearToAstro(c0 + 99);
      const start = makeUTCDate(startAstro, 0, 1);
      const end = makeUTCDate(endAstro, 11, 31);

      return { start: clampDateToRange(start), end: clampDateToRange(end) };
    }

    function computeFitPxPerDay(){
      const totalDays = daysBetween(rangeBegin, rangeEnd) + 1;
      return Math.max(0.008, (canvasScroll.clientWidth - 40) / Math.max(1, totalDays));
    }

    function computeZoomPxPerDay(zoom, anchorDate){
      const span = zoomSpanAligned(anchorDate, zoom);

      // Use actual day count for year zoom so BCE year 0 (1 BCE)
      // correctly handles leap-year behavior and prevents month gaps
      const days =
        (zoom === "year")
          ? (daysBetween(span.start, span.end) + 1)
          : (zoom === "century")
            ? 36525
            : (daysBetween(span.start, span.end) + 1);

      return Math.max(0.008, (canvasScroll.clientWidth - 40) / Math.max(1, days));
    }

    function getPxPerDayForView(zoom, anchorDate){
      if (zoom === "fit") return computeFitPxPerDay();

      if (zoom === DEFAULT_VIEW_KEY){
        // Use aligned interval containing anchorDate as the “unit”
        const unitSpan = zoomSpanAligned(anchorDate, defaultInterval);
        const unitDays = (daysBetween(unitSpan.start, unitSpan.end) + 1);

        const desiredDays = Math.max(1, unitDays * defaultIntervalAmount);
        return Math.max(0.008, (canvasScroll.clientWidth - 40) / desiredDays);
      }

      return computeZoomPxPerDay(zoom, anchorDate);
    }

    function scrollToCenterDate(d){
      const zoomLevel = zoomSelect.value;
      const pxPerDay = getEffectivePxPerDay(zoomLevel, d);
      const centerX = dateToX(d, pxPerDay);

      internalScroll = true;
      canvasScroll.scrollLeft = clamp(
        centerX - (canvasScroll.clientWidth / 2),
        0,
        Math.max(0, canvasScroll.scrollWidth - canvasScroll.clientWidth)
      );
      contextBand.scrollLeft = canvasScroll.scrollLeft;
      internalScroll = false;

      syncMiniWindow();
      // Avoid direct recursion loops (updateReadout -> render -> scrollToCenterDate -> updateReadout).
      requestAnimationFrame(() => updateReadout());
    }

    function scrollToCenterCardById(eid){
      const card = canvas.querySelector(`.eventCard[data-eid="${CSS.escape(String(eid))}"]`);
      if (!card) return false;

      const rect = card.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();

      const cardCenterX = (rect.left - canvasRect.left) + (rect.width / 2);

      internalScroll = true;
      canvasScroll.scrollLeft = clamp(
        cardCenterX - (canvasScroll.clientWidth / 2),
        0,
        Math.max(0, canvasScroll.scrollWidth - canvasScroll.clientWidth)
      );
      contextBand.scrollLeft = canvasScroll.scrollLeft;
      internalScroll = false;

      syncMiniWindow();
      requestAnimationFrame(() => updateReadout());
      return true;
    }

    /* ----------------- RENDER ----------------- */

    function render(){
      canvas.innerHTML = "";
      contextInner.innerHTML = "";

      const zoomLevel = zoomSelect.value;
      const tickInterval = tickForZoom(zoomLevel);
      intervalSelect.value = tickInterval;

      const pxPerDay = getEffectivePxPerDay(zoomLevel, currentCenterDate);

      // Record the scale/span used for this render so scroll tick redraws stay aligned.
      lastRender.zoom = zoomLevel;
      lastRender.spanKey = spanKeyFor(zoomLevel, currentCenterDate);
      lastRender.pxPerDay = pxPerDay;

      // Reset tick cache because we rebuilt the whole canvas
      lastTickKey = "";
      lastTickBeginIndex = -1;
      lastTickEndIndex = -1;

      const width = Math.max(900, Math.floor(TOTAL_DAYS * pxPerDay));
      canvas.style.width = width + "px";
      contextInner.style.width = width + "px";

      const barsTop = document.createElement("div");
      barsTop.className = "bars barsTop";
      canvas.appendChild(barsTop);

      const spine = document.createElement("div");
      spine.className = "timelineLine";
      canvas.appendChild(spine);

      const ticksEl = document.createElement("div");
      ticksEl.className = "ticks";
      canvas.appendChild(ticksEl);

      renderTicksVisible(ticksEl, tickInterval, pxPerDay);

      const barsBottom = document.createElement("div");
      barsBottom.className = "bars barsBottom";
      canvas.appendChild(barsBottom);

      renderContext(pxPerDay);

      renderEventBars(barsTop, pxPerDay, "above");
      renderEventBars(barsBottom, pxPerDay, "below");
      renderEvents(pxPerDay);

requestAnimationFrame(() => {
  positionLanesSymmetrically();
  adjustConnectors();
  autoFitViewportHeight();
  // adjustContextLinesToSpine();   // ← ADD THIS
  syncMiniWindow();
  updateReadout();
}); 


    }

    function renderTicksVisible(containerEl, interval, pxPerDay){
      const zoomLevel = zoomSelect.value;

      // IMPORTANT:
      // Month zoom: render ONLY aligned month span.
      // Year zoom: render ONLY aligned year span for month ticks.
      let visBegin, visEnd;

      // For caching, track a stable begin/end key.
      let cacheBeginKey = "";
      let cacheEndKey = "";

      if (zoomLevel === "month" && interval === "day"){
        const span = zoomSpanAligned(currentCenterDate, "month");
        visBegin = span.start;
        visEnd = span.end;
        cacheBeginKey = String(visBegin.getTime());
        cacheEndKey = String(visEnd.getTime());

      } else if (zoomLevel === "year" && interval === "month"){
        // Year view: virtualize month ticks (visible range + padding).
        const totalDays = daysBetween(rangeBegin, rangeEnd) + 1;
        const padDays = Math.max(2, Math.ceil(30 / Math.max(0.01, pxPerDay)));
        const leftIndex = clamp(Math.floor(canvasScroll.scrollLeft / pxPerDay) - padDays, 0, totalDays - 1);
        const rightIndex = clamp(Math.ceil((canvasScroll.scrollLeft + canvasScroll.clientWidth) / pxPerDay) + padDays, 0, totalDays - 1);

        visBegin = addDays(rangeBegin, leftIndex);
        visEnd = addDays(rangeBegin, rightIndex);

        cacheBeginKey = String(leftIndex);
        cacheEndKey = String(rightIndex);

        // If we haven't moved the window meaningfully, skip redraw.
        if (leftIndex === lastTickBeginIndex && rightIndex === lastTickEndIndex){
          return;
        }
        lastTickBeginIndex = leftIndex;
        lastTickEndIndex = rightIndex;

      } else {
        // Visible day index range (with padding)
        const totalDays = daysBetween(rangeBegin, rangeEnd) + 1;
        const padDays = Math.max(2, Math.ceil(30 / Math.max(0.01, pxPerDay)));
        const leftIndex = clamp(Math.floor(canvasScroll.scrollLeft / pxPerDay) - padDays, 0, totalDays - 1);
        const rightIndex = clamp(Math.ceil((canvasScroll.scrollLeft + canvasScroll.clientWidth) / pxPerDay) + padDays, 0, totalDays - 1);

        visBegin = addDays(rangeBegin, leftIndex);
        visEnd = addDays(rangeBegin, rightIndex);

        cacheBeginKey = String(leftIndex);
        cacheEndKey = String(rightIndex);

        // If we haven't moved the window meaningfully, skip redraw.
        if (leftIndex === lastTickBeginIndex && rightIndex === lastTickEndIndex){
          return;
        }
        lastTickBeginIndex = leftIndex;
        lastTickEndIndex = rightIndex;
      }

      // pxPerDay is rounded so tiny float differences don't blow the cache.
      const pxKey = String(Math.round(pxPerDay * 1000));
      const spanKey = (lastRender && lastRender.spanKey) ? lastRender.spanKey : "";
      const tickKey = `${zoomLevel}|${interval}|${pxKey}|${spanKey}|${cacheBeginKey}|${cacheEndKey}`;

      if (tickKey === lastTickKey){
        return;
      }
      lastTickKey = tickKey;

      // Now we actually redraw:
      containerEl.innerHTML = "";

      // Boundary overlays (dotted lines + top/bottom pills) are appended to `canvas`.
      // Boundary vertical lines are ALSO appended to `contextInner` so they reach the top of the viewport.
      // When ticks redraw during scrolling, remove old overlays or they stack.
      canvas.querySelectorAll(".boundaryOverlay").forEach(el => el.remove());
      contextInner.querySelectorAll(".boundaryOverlay").forEach(el => el.remove());


      // Build marks
      let marks;
      if (interval === "day"){
        if (zoomLevel === "month"){
          marks = buildDayMarksMonthView(visBegin, visEnd);
        } else if (zoomLevel === "day"){
          marks = buildDayMarksDayView(visBegin, visEnd);
        } else {
          marks = buildDayMarksMonthView(visBegin, visEnd);
        }
      } else {
        // Use ALIGNED interval spans so month ticks always start on the 1st
        marks = buildTickMarksAligned(visBegin, visEnd, interval);
      }

      // Draw ticks + boundary lines/labels
      const boundaryKey = new Set();

      for (const m of marks){
        const x = dateToX(m.date, pxPerDay);

        const isMonthBoundary = (zoomLevel === "month" && interval === "day" && m.date.getUTCDate() === 1);

        const isYearBoundary =
          (zoomLevel === "year" && interval === "month" && m.date.getUTCMonth() === 0 && m.date.getUTCDate() === 1);

        if (isMonthBoundary || isYearBoundary){
          const key = daysBetween(rangeBegin, m.date);
          if (!boundaryKey.has(key)){
            boundaryKey.add(key);


            // dotted full-height line (split across context band + canvas so it reaches top of viewport)

            // 1) Context-band segment
            const lineTop = document.createElement("div");
            lineTop.className = "boundaryOverlay";
            lineTop.style.position = "absolute";
            lineTop.style.left = x + "px";
            lineTop.style.top = "0";
            lineTop.style.bottom = "0";
            lineTop.style.width = "0";
            lineTop.style.borderLeft = "2px dotted rgba(255,216,74,0.85)";
            lineTop.style.zIndex = "1";
            lineTop.style.pointerEvents = "none";
            contextInner.appendChild(lineTop);

            // 2) Canvas segment
            const line = document.createElement("div");
            line.className = "boundaryOverlay";
            line.style.position = "absolute";
            line.style.left = x + "px";
            line.style.top = "0";
            line.style.bottom = "0";
            line.style.width = "0";
            line.style.borderLeft = "2px dotted rgba(255,216,74,0.85)";
            line.style.zIndex = "1";
            line.style.pointerEvents = "none";
            canvas.appendChild(line);

            // label text
            const labelText = isMonthBoundary ? formatMonthYear(m.date) : formatYearOnly(m.date);

            // top label
            const topLbl = boundaryPill(labelText, x);
            topLbl.classList.add("boundaryOverlay");
            topLbl.style.top = "6px";
            canvas.appendChild(topLbl);

            // bottom label
            const bottomLbl = boundaryPill(labelText, x);
            bottomLbl.classList.add("boundaryOverlay");
            bottomLbl.style.bottom = "6px";
            canvas.appendChild(bottomLbl);
          }
        }

        const t = document.createElement("div");
        t.className = "tick " + (m.big ? "big" : "small");
        t.style.left = x + "px";
        containerEl.appendChild(t);

        if (m.big && m.label){
          const lbl = document.createElement("div");
          lbl.className = "tickLabel";
          lbl.style.left = x + "px";
          lbl.textContent = m.label;
          containerEl.appendChild(lbl);
        }
      }
    }

    function boundaryPill(text, x){
      const el = document.createElement("div");
      el.textContent = text;
      el.style.position = "absolute";
      el.style.left = x + "px";
      el.style.transform = "translateX(-50%)";
      el.style.padding = "2px 8px";
      el.style.borderRadius = "999px";
      el.style.background = "rgba(0,0,0,0.55)";
      el.style.border = "1px solid rgba(255,216,74,0.45)";
      el.style.color = "rgba(255,216,74,0.98)";
      el.style.fontWeight = "900";
      el.style.fontSize = "12px";
      el.style.whiteSpace = "nowrap";
      el.style.textShadow = "0 1px 0 rgba(0,0,0,0.8)";
      el.style.zIndex = "6"; // keep the text pills above cards/images
      el.style.pointerEvents = "none";
      return el;

    }

    function buildDayMarksMonthView(begin, end){
      const marks = [];
      let cur = new Date(begin.getTime());

      while (cur <= end){
        const dayNum = cur.getUTCDate();
        const isFirst = (dayNum === 1);

        if (isFirst){
          marks.push({ date: new Date(cur.getTime()), big:false, label:"" });
        } else {
          const even = (dayNum % 2 === 0);
          marks.push({ date: new Date(cur.getTime()), big: even, label: even ? String(dayNum) : "" });
        }

        cur = addDays(cur, 1);
      }

      return marks;
    }

    function buildDayMarksDayView(begin, end){
      const marks = [];
      let cur = new Date(begin.getTime());

      while (cur <= end){
        marks.push({ date: new Date(cur.getTime()), big:true, label: formatFullDate(cur) });
        cur = addDays(cur, 1);
      }

      return marks;
    }

    /* ----------------- TICK SPANS (ALIGNED) ----------------- */

    // Year conversion helpers:
    // JS Date uses astronomical years (..., -2, -1, 0, 1, 2, ...)
    // Historical BCE/CE has NO year 0 (..., 2 BCE, 1 BCE, 1 CE, 2 CE, ...)
    function astroYearToHist(ay){
      return (ay <= 0) ? (ay - 1) : ay;
    }

    function buildTickMarksAligned(begin, end, interval){
      const spans = buildIntervalSpansAligned(begin, end, interval);
      const marks = [];

      for (const sp of spans){
        marks.push({ date: sp.start, big:true, label: sp.label });

        // Keep mid ticks for year/decade/century, but NOT for month.
        if (interval !== "day" && interval !== "month"){
          const mid = addDays(sp.start, Math.floor(daysBetween(sp.start, sp.end) / 2));
          marks.push({ date: mid, big:false, label:"" });
        }
      }

      marks.sort((a,b) => a.date - b.date);
      return marks;
    }

    function buildIntervalSpansAligned(begin, end, interval){
      // Snap "cur" to the natural boundary that CONTAINS begin.
      let cur = snapToBoundary(begin, interval);
      const spans = [];

      // Safety guard
      let safety = 0;

      while (cur <= end){
        if (++safety > 5000){
          console.warn("Timeline: interval span loop safety-break", { interval, begin, end, cur });
          break;
        }

        const start = new Date(cur.getTime());
        const last = intervalEnd(start, interval);

        // If the natural interval end is beyond the requested window,
        // emit ONE truncated span and stop.
        if (last > end){
          spans.push({ start, end, label: intervalLabel(start, interval) });
          break;
        }

        // Normal full span
        spans.push({ start, end: last, label: intervalLabel(start, interval) });

        const next = addDays(last, 1);

        if (next.getTime() === cur.getTime()){
          console.warn("Timeline: interval span did not advance", { interval, cur, endSpan: last });
          break;
        }

        cur = next;
      }

      return spans;
    }

    function snapToBoundary(d, interval){
      const ay = d.getUTCFullYear();
      const histY = astroYearToHist(ay);
      const m = d.getUTCMonth();
      const day = d.getUTCDate();

      if (interval === "month"){
        return makeUTCDate(ay, m, 1);
      }
      if (interval === "year"){
        return makeUTCDate(ay, 0, 1);
      }
      if (interval === "decade"){
        const startHist = Math.floor(histY / 10) * 10;
        const startAstro = histYearToAstro(startHist);
        return makeUTCDate(startAstro, 0, 1);
      }
      if (interval === "century"){
        const startHist = Math.floor(histY / 100) * 100;
        const startAstro = histYearToAstro(startHist);
        return makeUTCDate(startAstro, 0, 1);
      }

      return makeUTCDate(ay, m, day);
    }

    function intervalEnd(start, interval){
      const ay = start.getUTCFullYear();
      const histY = astroYearToHist(ay);
      const m = start.getUTCMonth();

      if (interval === "month"){
        const lastDay = makeUTCDate(ay, m + 1, 0).getUTCDate();
        return makeUTCDate(ay, m, lastDay);
      }

      if (interval === "year"){
        return makeUTCDate(ay, 11, 31);
      }
      if (interval === "decade"){
        const startHist = Math.floor(histY / 10) * 10;
        const endHist = startHist + 9;
        const endAstro = histYearToAstro(endHist);
        return makeUTCDate(endAstro, 11, 31);
      }

      const startHist = Math.floor(histY / 100) * 100;
      const endHist = startHist + 99;
      const endAstro = histYearToAstro(endHist);
      return makeUTCDate(endAstro, 11, 31);
    }

    /* ----------------- CONTEXT + EVENTS ----------------- */

    function renderContext(pxPerDay){
      const ctx = Array.isArray(cfg.contextEvents) ? cfg.contextEvents : [];

      for (const c of ctx){
        const d = parseFlexibleDate(c.date, "anchor");
        if (!d) continue;

        const x = dateToX(d, pxPerDay);

        // Tag in context band
        const tag = document.createElement("div");
        tag.className = "contextTag";
        tag.style.left = x + "px";
        tag.textContent = c.label || "";
        contextInner.appendChild(tag);

        // Place tag so its bottom sits near the bottom of the band
        // (so the dotted line begins directly below the pill visually)
        const padBottom = 6;
        const top = Math.max(6, contextBand.clientHeight - tag.offsetHeight - padBottom);
        tag.style.top = top + "px";

        // We want the dotted line to reach the spine.
        // Do this the same way month/year boundary lines do it:
        //   1) a segment inside the context band
        //   2) a full-height segment inside the scroll canvas
        const tagBottom = top + tag.offsetHeight;

        // 1) Context-band segment (from under the tag down to bottom of the context band)
        const lineTop = document.createElement("div");
        lineTop.className = "contextLine";
        lineTop.style.left = x + "px";
        lineTop.style.top = tagBottom + "px";
        lineTop.style.height = Math.max(0, (contextBand.clientHeight - tagBottom)) + "px";
        lineTop.style.zIndex = "1";
        lineTop.style.pointerEvents = "none";
        contextInner.appendChild(lineTop);

        // 2) Canvas segment (from top of scroll area down to the spine)
const spineY = getBarCenterY();
const line = document.createElement("div");
line.className = "contextLine";
line.dataset.seg = "canvas";
line.style.left = x + "px";
line.style.top = "0";
line.style.height = Math.max(0, spineY) + "px";
        line.style.zIndex = "1";
        line.style.pointerEvents = "none";
        canvas.appendChild(line);
      }
    }


    function renderEventBars(barsEl, pxPerDay, laneSide){
      const events = Array.isArray(cfg.events) ? cfg.events : [];
      const palette = cfg.barColors || ["var(--gold)", "var(--red)", "var(--gold2)", "var(--red2)"];

      events.forEach((ev, idx) => {
        const showInterval = (ev.showInterval !== undefined)
          ? !!ev.showInterval
          : (ev.showBar !== undefined ? !!ev.showBar : true);

        if (!showInterval) return;

        const evSide = (ev.side === "below") ? "below" : "above";
        if (evSide !== laneSide) return;

        const s = parseFlexibleDate(ev.start, "start", ev);
        const e = parseFlexibleDate(ev.end ?? ev.start, "end", ev);
        if (!s || !e) return;

        const left = dateToX(s, pxPerDay);
        const right = dateToX(e, pxPerDay) + pxPerDay;
        const w = Math.max(6, right - left);

        const bar = document.createElement("a");
        bar.className = "bar";
        bar.href = resolveAsset(ev.href || "#");
        bar.style.left = left + "px";
        bar.style.width = w + "px";

        const c = (ev.intervalColor || "").toString().trim().toLowerCase();
        const useDefault = (!c || c === "default");
        bar.style.background = useDefault ? palette[idx % palette.length] : ev.intervalColor;

        bar.title = ev.label ? `${ev.label} (${ev.dateLabel || ""})` : (ev.dateLabel || "");
        bar.setAttribute("aria-label", ev.label ? `Open page for ${ev.label}` : "Open event");
        barsEl.appendChild(bar);

        if (ev.id && String(ev.id) === String(window.TIMELINE_ACTIVE_ID || "")){
          bar.style.boxShadow = "0 0 0 4px rgba(255,216,74,.20), 0 14px 30px rgba(0,0,0,.45)";
          bar.style.borderColor = "rgba(255,216,74,.55)";
        }
      });
    }

    function renderEvents(pxPerDay){
      const events = Array.isArray(cfg.events) ? cfg.events : [];
      events.forEach((ev) => {
        let anchor = null;

        const hasOverrideAnchor =
          (ev.anchor != null) &&
          (String(ev.anchor).trim() !== String(ev.start).trim());

        if (hasOverrideAnchor) {
          anchor = parseFlexibleDate(ev.anchor, "anchor", ev);
        } else {
          const s = parseFlexibleDate(ev.start, "start", ev);
          const e = parseFlexibleDate(ev.end ?? ev.start, "end", ev);
          if (s && e) {
            const midDays = Math.floor(daysBetween(s, e) / 2);
            anchor = addDays(s, midDays);
          }
        }

        if (!anchor) return;

        const x = dateToX(anchor, pxPerDay) + (pxPerDay / 2);
        const laneClass = (ev.side === "below") ? "laneBelow" : "laneAbove";

        const card = document.createElement("a");
        card.className = `eventCard ${laneClass}` + (ev.isContextCard ? " contextCard" : "");
        card.href = resolveAsset(ev.href || "#");
        card.style.left = x + "px";
        card.dataset.eid = String(ev.id || "");
        card.title = ev.label || "";
        card.setAttribute("aria-label", ev.label ? `Open page for ${ev.label}` : "Open event");

        const stack = document.createElement("div");
        stack.className = "stack";

        const meta = document.createElement("div");
        meta.className = "meta";

        const nm = document.createElement("div");
        nm.className = "empName";
        nm.textContent = ev.label || "";

        const yrs = document.createElement("div");
        yrs.className = "empYears";
        yrs.textContent = ev.dateLabel ? `(${ev.dateLabel})` : "";

        meta.appendChild(nm);
        meta.appendChild(yrs);

        const avatarWrap = document.createElement("div");
        avatarWrap.className = "avatarWrap";

        if (ev.image){
          const img = document.createElement("img");
          img.alt = ev.label ? `Portrait of ${ev.label}` : "Timeline image";
          img.src = resolveAsset(ev.image);
          img.onerror = () => { avatarWrap.innerHTML = `<div class="ph">Image<br/>Missing</div>`; };
          avatarWrap.appendChild(img);
        } else {
          avatarWrap.innerHTML = `<div class="ph">No<br/>Image</div>`;
        }

        if (laneClass === "laneAbove"){
          stack.appendChild(meta);
          stack.appendChild(avatarWrap);
        } else {
          stack.appendChild(avatarWrap);
          stack.appendChild(meta);
        }

        const connector = document.createElement("div");
        connector.className = "connector";

        card.appendChild(stack);
        canvas.appendChild(card);

        connector.dataset.eid = String(ev.id || "");
        connector.classList.add(laneClass);
        canvas.appendChild(connector);
      });
    }

    /* ----------------- LAYOUT HELPERS ----------------- */

    let __baseTicksTop = null;
    let __baseCanvasH = null;

    function positionLanesSymmetrically(){
      const root = document.querySelector(".timeline-embed");
      const cs = getComputedStyle(root);

      const gap = parseFloat(cs.getPropertyValue("--gapToPortraitEdge")) || 120;
      const avatarH = parseFloat(cs.getPropertyValue("--avatar")) || 110;
      const safeTop = parseFloat(cs.getPropertyValue("--safeTop")) || 12;

      const spineY = getBarCenterY();

      const sampleAbove = canvas.querySelector(".eventCard.laneAbove .avatarWrap");
      const sampleBelow = canvas.querySelector(".eventCard.laneBelow .avatarWrap");

      const aboveAvatarOffsetTop = sampleAbove ? sampleAbove.offsetTop : 0;
      const belowAvatarOffsetTop = sampleBelow ? sampleBelow.offsetTop : 0;

      let aboveLaneTop = (spineY - gap) - (aboveAvatarOffsetTop + avatarH);
      const belowLaneTop = (spineY + gap) - (belowAvatarOffsetTop);

      if (aboveLaneTop < safeTop) aboveLaneTop = safeTop;

      // Base lane placement (current look)
      canvas.querySelectorAll(".eventCard.laneAbove").forEach(el => el.style.top = aboveLaneTop + "px");
      canvas.querySelectorAll(".eventCard.laneBelow").forEach(el => el.style.top = belowLaneTop + "px");

      // Per-event override:
      // lineLength = exact distance (px) from portrait edge to the SPINE (always),
      // so the same value means the same spacing above and below.
      // If lineLength is null/undefined/non-numeric => keep base placement.
      const events = Array.isArray(cfg.events) ? cfg.events : [];
      const cards = canvas.querySelectorAll(".eventCard");

      cards.forEach(card => {
        const eid = (card.dataset.eid || "").toString();
        const ev = events.find(e => String(e.id || "") === eid);
        if (!ev) return;

        const L = Number(ev.lineLength);
        if (!Number.isFinite(L)) return;

        const isAbove = card.classList.contains("laneAbove");

        const avatar = card.querySelector(".avatarWrap");
        if (!avatar) return;

        // CURRENT portrait edge position (after base layout applied)
        const cardTop = card.offsetTop;
        const avatarTop = cardTop + avatar.offsetTop;
        const avatarBottom = avatarTop + avatar.offsetHeight;
        const currentPortraitEdgeY = isAbove ? avatarBottom : avatarTop;

        // Desired portrait edge position measured ONLY from the spine:
        const desiredPortraitEdgeY = isAbove
          ? (spineY - L)
          : (spineY + L);

        const delta = desiredPortraitEdgeY - currentPortraitEdgeY;
        card.style.top = (cardTop + delta) + "px";
      });
    }


    function adjustConnectors(){
      const root = document.querySelector(".timeline-embed");
      const cs = getComputedStyle(root);

      const spineY = getBarCenterY();

      const barsTopEl = canvas.querySelector(".barsTop");
      const barsBottomEl = canvas.querySelector(".barsBottom");

      const barTopInBars = parseFloat(cs.getPropertyValue("--barTopInBars")) || 0;
      const barH = parseFloat(cs.getPropertyValue("--barH")) || 0;

      const barsTopY = barsTopEl ? barsTopEl.offsetTop : 0;
      const barsBottomY = barsBottomEl ? barsBottomEl.offsetTop : 0;

      const intervalYTop = barsTopY + barTopInBars + (barH / 2);
      const intervalYBottom = barsBottomY + barTopInBars + (barH / 2);

      const events = Array.isArray(cfg.events) ? cfg.events : [];
      const cards = canvas.querySelectorAll(".eventCard");

      cards.forEach(card => {
        const eid = (card.dataset.eid || "").toString();
        const ev = events.find(e => String(e.id || "") === eid);

        const isAbove = card.classList.contains("laneAbove");

        const showInterval = ev
          ? (ev.showInterval !== undefined
              ? !!ev.showInterval
              : (ev.showBar !== undefined ? !!ev.showBar : true))
          : true;

        // Connectors should attach to interval bars when an interval exists.
        // (Card spacing can still be controlled by lineLength from the spine.)
        const targetY = showInterval
          ? (isAbove ? intervalYTop : intervalYBottom)
          : spineY;


        const connector = canvas.querySelector(`.connector[data-eid="${CSS.escape(eid)}"]`);
        const avatar = card.querySelector(".avatarWrap");
        if (!connector || !avatar) return;

        const cardTop = card.offsetTop;
        const avatarTop = cardTop + avatar.offsetTop;
        const avatarBottom = avatarTop + avatar.offsetHeight;
        const portraitEdgeY = isAbove ? avatarBottom : avatarTop;

        const minY = Math.min(portraitEdgeY, targetY);
        const maxY = Math.max(portraitEdgeY, targetY);

        connector.style.left = card.style.left;
        connector.style.top = minY + "px";
        connector.style.height = Math.max(0, maxY - minY) + "px";

        connector.classList.toggle("dotTop", !isAbove);
      });
    }


    function resizeHostIframeToFit(){
      // If this timeline is embedded in an iframe (same-origin),
      // resize the iframe so the bottom never clips.
      try{
        const fe = window.frameElement; // <iframe> element in the parent document
        if (!fe) return;

        const wrap = document.querySelector(".wrap");
        const main = document.querySelector("main.timeline-embed");
        const targetEl = wrap || main || document.body;

        const h = Math.ceil(
          Math.max(
            targetEl.scrollHeight || 0,
            targetEl.getBoundingClientRect ? targetEl.getBoundingClientRect().height : 0
          )
        );

        if (h > 0){
          fe.style.height = h + "px";
          fe.style.minHeight = h + "px";
        }
      } catch(e){
        // ignore cross-origin / access errors
      }
    }


    function autoFitViewportHeight(){
      // Expands the timeline viewport so cards/text never clip.

      // IMPORTANT: We shift the SPINE (via --ticksTop), not the cards,
      // so spine-based lineLength remains accurate.

      const root = document.querySelector(".timeline-embed");
      if (!root) return;

      const cs = getComputedStyle(root);

      if (__baseTicksTop === null){
        __baseTicksTop = parseFloat(cs.getPropertyValue("--ticksTop")) || 260;
      }
      if (__baseCanvasH === null){
        __baseCanvasH = parseFloat(cs.getPropertyValue("--canvasH")) || 620;
      }

      const pad = 16;

      // Reset to baseline each run (prevents "ratcheting" bigger forever)
      root.style.setProperty("--ticksTop", __baseTicksTop + "px");
      root.style.setProperty("--canvasH", __baseCanvasH + "px");
      if (viewport) viewport.style.height = "";

      // Re-apply layout at baseline so measurements are honest
      positionLanesSymmetrically();
      adjustConnectors();

      const cards = Array.from(canvas.querySelectorAll(".eventCard"));
      if (cards.length === 0) return;

      let topMost = Infinity;
      let bottomMost = -Infinity;

      for (const c of cards){
        topMost = Math.min(topMost, c.offsetTop);
        bottomMost = Math.max(bottomMost, c.offsetTop + c.offsetHeight);
      }

      // If any content is above the top, push the SPINE down by increasing --ticksTop.
      // Then we re-layout so lineLength stays correct relative to the spine.
      let ticksShift = 0;
      if (topMost < pad){
        ticksShift = (pad - topMost);
      }

      const newTicksTop = __baseTicksTop + ticksShift;
      root.style.setProperty("--ticksTop", newTicksTop + "px");

      // Re-layout after spine shift
      positionLanesSymmetrically();
      adjustConnectors();

      // Recompute bounds after shift
      topMost = Infinity;
      bottomMost = -Infinity;
      for (const c of cards){
        topMost = Math.min(topMost, c.offsetTop);
        bottomMost = Math.max(bottomMost, c.offsetTop + c.offsetHeight);
      }

      // Ensure canvas height fits bottom-most card
      const neededCanvasH = Math.max(__baseCanvasH + ticksShift, Math.ceil(bottomMost + pad));
      root.style.setProperty("--canvasH", neededCanvasH + "px");

      // Match viewport height to (context band + canvas height)
      const contextH = contextBand ? contextBand.offsetHeight : 54;
      if (viewport){
        viewport.style.height = (contextH + neededCanvasH) + "px";
      }

      // After shifting spine and resizing canvas, re-stretch context lines to the new spine
      const spineY = getBarCenterY();
      canvas.querySelectorAll(".contextLine").forEach(line => {
        line.style.height = Math.max(0, spineY) + "px";
      });

      // ✅ Critical: also resize the HOST iframe so the bottom never clips
      requestAnimationFrame(resizeHostIframeToFit);
    }


function getBarCenterY(){
  const root = document.querySelector(".timeline-embed");
  const cs = getComputedStyle(root);

  const mid = parseFloat(cs.getPropertyValue("--timelineMidY"));
  if (Number.isFinite(mid)) return mid;

  const ticksTop = parseFloat(cs.getPropertyValue("--ticksTop"));
  if (Number.isFinite(ticksTop)) return ticksTop + (55 / 2);

  const barsTop = parseFloat(cs.getPropertyValue("--barsTop")) || 310;
  const barTopInBars = parseFloat(cs.getPropertyValue("--barTopInBars")) || 11;
  const barH = parseFloat(cs.getPropertyValue("--barH")) || 18;
  return barsTop + barTopInBars + (barH/2);
}




    /* ----------------- CENTER + MINIMAP ----------------- */

    function populateCenterDropdown(){
      const events = Array.isArray(cfg.events) ? cfg.events : [];
      centerSelect.innerHTML = "";

      const add = (value, label) => {
        const o = document.createElement("option");
        o.value = value;
        o.textContent = label;
        centerSelect.appendChild(o);
      };

      add("__begin__", "Start of timeline");

      // Track the first real event so we can default to it on load
      let firstEventValue = null;

      for (const ev of events){
        const v = ev.id || ev.label || String(Math.random());
        if (firstEventValue === null) firstEventValue = v;
        add(v, `${ev.label || "Event"} ${ev.dateLabel ? `(${ev.dateLabel})` : ""}`.trim());
      }

      const active = (window.TIMELINE_ACTIVE_ID || "").toString();
      const hasActive = events.some(e => (e.id || "") === active);

      // Default behavior:
      // 1) If an active ID is provided, use it
      // 2) Otherwise, center on the first event (not the start of range)
      // 3) If there are no events, fall back to start of timeline
      centerSelect.value = hasActive ? active : (firstEventValue ?? "__begin__");
    }


    function centerOn(id){
      if (id === "__begin__"){
        currentCenterDate = rangeBegin;
        render();
        scrollToCenterDate(currentCenterDate);
        return;
      }

      const events = Array.isArray(cfg.events) ? cfg.events : [];
      const ev = events.find(e => String(e.id || "") === String(id));
      if (!ev) return;

      const anchor = parseFlexibleDate(ev.anchor ?? ev.start, "anchor", ev);
      if (!anchor) return;

      currentCenterDate = anchor;
      render();

      requestAnimationFrame(() => {
        const ok = scrollToCenterCardById(ev.id || id);
        if (!ok){
          scrollToCenterDate(currentCenterDate);
        }
      });
    }

    function syncMiniWindow(){
      const total = Math.max(1, canvasScroll.scrollWidth - canvasScroll.clientWidth);
      const pLeft = (total === 0) ? 0 : (canvasScroll.scrollLeft / total);
      const pW = canvasScroll.clientWidth / Math.max(1, canvasScroll.scrollWidth);

      const trackW = miniTrack.clientWidth;
      miniWindow.style.left = (pLeft * trackW) + "px";
      miniWindow.style.width = Math.max(28, pW * trackW) + "px";
    }

    function makeMiniMapDraggable(){
      let dragging = false;
      let startX = 0;
      let startLeft = 0;

      miniWindow.addEventListener("pointerdown", (e) => {
        dragging = true;
        startX = e.clientX;
        startLeft = parseFloat(miniWindow.style.left || "0");
        miniWindow.setPointerCapture(e.pointerId);
        e.preventDefault();
      });

      miniWindow.addEventListener("pointermove", (e) => {
        if(!dragging) return;

        const dx = e.clientX - startX;
        const trackW = miniTrack.clientWidth;
        const w = miniWindow.clientWidth;

        const left = clamp(startLeft + dx, 0, Math.max(0, trackW - w));
        miniWindow.style.left = left + "px";

        const p = (trackW - w) <= 0 ? 0 : (left / (trackW - w));
        const maxScroll = Math.max(0, canvasScroll.scrollWidth - canvasScroll.clientWidth);

        internalScroll = true;
        canvasScroll.scrollLeft = p * maxScroll;
        contextBand.scrollLeft = canvasScroll.scrollLeft;
        internalScroll = false;

        updateReadout();
      });

      miniWindow.addEventListener("pointerup", () => { dragging = false; });

      miniTrack.addEventListener("pointerdown", (e) => {
        if (e.target === miniWindow) return;
        const trackRect = miniTrack.getBoundingClientRect();
        const clickX = e.clientX - trackRect.left;

        const w = miniWindow.clientWidth;
        const left = clamp(clickX - (w/2), 0, Math.max(0, miniTrack.clientWidth - w));
        miniWindow.style.left = left + "px";

        const p = (miniTrack.clientWidth - w) <= 0 ? 0 : (left / (miniTrack.clientWidth - w));
        const maxScroll = Math.max(0, canvasScroll.scrollWidth - canvasScroll.clientWidth);

        internalScroll = true;
        canvasScroll.scrollLeft = p * maxScroll;
        contextBand.scrollLeft = canvasScroll.scrollLeft;
        internalScroll = false;

        syncMiniWindow();
        updateReadout();
      });
    }

    function updateReadout(){
      if (isUpdatingReadout) return;
      isUpdatingReadout = true;
      try {
        const zoomLevel = zoomSelect.value;

        const pxPerDayEstimate =
          (lastRender && lastRender.pxPerDay)
            ? lastRender.pxPerDay
            : getEffectivePxPerDay(zoomLevel, currentCenterDate);

        const centerCanvasX = canvasScroll.scrollLeft + (canvasScroll.clientWidth / 2);

        const dayIndex = Math.floor(centerCanvasX / Math.max(0.000001, pxPerDayEstimate));
        const d = clampDateToRange(addDays(rangeBegin, dayIndex));

        currentCenterDate = d;

        syncMiniWindow();

        const newSpanKey = spanKeyFor(zoomLevel, currentCenterDate);
        const needsSpanRerender = false;

        if (zoomLevel === "month" || zoomLevel === "day"){
          lastTickKey = "";
          render();
          return;
        }

        const ticksEl = canvas.querySelector(".ticks");
        const tickInterval = intervalSelect.value;
        const pxPerDay = lastRender.pxPerDay ?? getEffectivePxPerDay(zoomLevel, currentCenterDate);
        if (ticksEl) renderTicksVisible(ticksEl, tickInterval, pxPerDay);

      } finally {
        isUpdatingReadout = false;
      }
    }

    /* ----------------- UTILITIES ----------------- */

 
function applyTheme(theme){
  // IMPORTANT:
  // The “oval glow” backgrounds are painted on <body> in timeline.css,
  // so the variables MUST exist on :root/html (or body). If we only set them
  // on .timeline-embed, <body> cannot “see” them and the ovals won’t render.
  const embed = document.querySelector(".timeline-embed");

  // Apply vars at the document root so they affect <body> + everything inside.
  // Also apply to .timeline-embed (harmless, and keeps scoping flexible later).
  const targets = [document.documentElement, embed].filter(Boolean);
  if (targets.length === 0) return;

  const map = {
    bg: "--bg",
    bg2: "--bg2",
    text: "--text",
    muted: "--muted",
    gold: "--gold",
    gold2: "--gold2",
    red: "--red",
    red2: "--red2",

    // Background “oval glow” colors:
    // - bgOvalA/bgOvalB affect the PAGE background (body)
    // - vpOvalA/vpOvalB affect the VIEWPORT background (inside the timeline viewport)
    bgOvalA: "--bgOvalA",
    bgOvalB: "--bgOvalB",
    vpOvalA: "--vpOvalA",
    vpOvalB: "--vpOvalB",

    intervalA: "--intervalA",
    intervalB: "--intervalB",
    markerText: "--markerText"
  };

  for (const [k, v] of Object.entries(theme)){
    if (!map[k]) continue;
    for (const t of targets){
      t.style.setProperty(map[k], String(v));
    }
  }
}

    function resolveAsset(path){
      if (!path) return path;
      if (/^(https?:)?\/\//.test(path)) return path;
      if (path.startsWith("/")) return path;
      const base = window.TIMELINE_CONFIG_BASE || "/";
      return base + path.replace(/^\.\//, "");
    }

    function cap(s){ return s ? s[0].toUpperCase() + s.slice(1) : s; }
    function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }

    // 1 BCE = year 0, 2 BCE = -1, etc.
    function histYearToAstro(y){
      return (y <= -1) ? (y + 1) : y;
    }

    function makeUTCDate(fullYear, monthIndex, day){
      // Build from a stable base, then set year/month/day explicitly.
      // This avoids JS Date's 0..99 => 1900..1999 behavior and fixes day=0 month-end math
      // (critical around astronomical year 0 = 1 BCE).
      const d = new Date(Date.UTC(0, 0, 1)); // Jan 1, 1900
      d.setUTCFullYear(fullYear);
      d.setUTCMonth(monthIndex); // handles overflow (e.g., monthIndex = 12)
      d.setUTCDate(day);         // day=0 correctly becomes last day of previous month
      return d;
    }

    function toHistoricalYear(d){
      const y = d.getUTCFullYear(); // astronomical
      return (y <= 0) ? (y - 1) : y;
    }

    function formatYearOnly(d){
      const histY = toHistoricalYear(d);
      return (histY < 0) ? `${Math.abs(histY)} BCE` : `${histY}`;
    }

    function parseFlexibleDate(v, kind = "anchor", ev = null){
      if (v === null || v === undefined) return null;

      const endMode =
        (ev && ev.numericYearEndMode) ||
        cfg.numericYearEndMode ||
        "endOfYear";

      const wantEndOfYear = (kind === "end") && (endMode === "endOfYear");

      if (typeof v === "number" && Number.isFinite(v)){
        const ay = histYearToAstro(v);
        return wantEndOfYear ? makeUTCDate(ay, 11, 31) : makeUTCDate(ay, 0, 1);
      }

      const s = String(v).trim();

      if (/^-?\d{1,6}$/.test(s)){
        const y = parseInt(s, 10);
        const ay = histYearToAstro(y);
        return wantEndOfYear ? makeUTCDate(ay, 11, 31) : makeUTCDate(ay, 0, 1);
      }

      const m = s.match(/^(-?\d{1,6})-(\d{2})-(\d{2})$/);
      if (m){
        const y = parseInt(m[1], 10);
        const mo = parseInt(m[2], 10);
        const d = parseInt(m[3], 10);
        const ay = histYearToAstro(y);
        return makeUTCDate(ay, mo - 1, d);
      }

      return null;
    }

    function formatISO(d){
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth()+1).padStart(2,"0");
      const day = String(d.getUTCDate()).padStart(2,"0");

      const histY = (y <= 0) ? (y - 1) : y;
      const yy = String(histY).padStart(4, "0");
      return `${yy}-${m}-${day}`;
    }

    function formatMonthYear(d){
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const histY = toHistoricalYear(d);
      const suffix = (histY < 0) ? " BCE" : "";
      const shownYear = (histY < 0) ? Math.abs(histY) : histY;
      return `${months[d.getUTCMonth()]} ${shownYear}${suffix}`;
    }

    function formatFullDate(d){
      const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const histY = toHistoricalYear(d);
      const suffix = (histY < 0) ? " BCE" : "";
      const shownYear = (histY < 0) ? Math.abs(histY) : histY;
      const dd = String(d.getUTCDate()).padStart(2, "0");
      return `${months[d.getUTCMonth()]} ${dd}, ${shownYear}${suffix}`;
    }

    function addDays(d, n){
      const x = new Date(d.getTime());
      x.setUTCDate(x.getUTCDate() + n);
      return x;
    }

    function daysBetween(a,b){
      const ms = 24*60*60*1000;
      return Math.floor((b.getTime() - a.getTime()) / ms);
    }

    function dateToX(date, pxPerDay){
      return daysBetween(rangeBegin, date) * pxPerDay;
    }

    function intervalLabel(d, interval){
      const histY = toHistoricalYear(d);

      if (interval === "month"){
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        return months[d.getUTCMonth()];
      }

      if (interval === "year"){
        return (histY < 0) ? `${Math.abs(histY)} BCE` : `${histY}`;
      }

      if (interval === "decade"){
        const d0 = Math.floor(histY / 10) * 10;
        if (d0 === 0) return ""; // hide "0"
        return (d0 < 0) ? `${Math.abs(d0)} BCE` : `${d0}`;
      }

      const c0 = Math.floor(histY / 100) * 100;
      if (c0 === 0) return ""; // hide "0"
      return (c0 < 0) ? `${Math.abs(c0)} BCE` : `${c0}`;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeInit);
  } else {
    safeInit();
  }
})();