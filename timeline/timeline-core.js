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
          <div class="controlPill" title="Zoom changes the field of view of the timeline">
            <label for="zoomSelect">Zoom</label>
            <select id="zoomSelect" aria-label="Zoom level"></select>
          </div>

          <div class="controlPill" title="Ticks are automatically derived from zoom">
            <label for="intervalSelect">Ticks</label>
            <select id="intervalSelect" aria-label="Tick interval"></select>
          </div>

          <div class="controlPill" title="Jump the timeline to an event">
            <label for="centerSelect">Center on:</label>
            <select id="centerSelect" aria-label="Center timeline on an event"></select>
          </div>
        </div>
      </div>

      <div class="timelineViewport" id="viewport" tabindex="0" aria-label="Timeline viewport (scroll horizontally)">
        <div class="timelineCanvas" id="canvas"></div>
      </div>

      <div class="scrubber" aria-label="Timeline mini map scrubber">
        <div class="tiny"><b>Mini-map:</b> drag the gold window to jump through time</div>
        <div class="miniTrack" id="miniTrack">
          <div class="miniWindow" id="miniWindow" title="Drag to jump"></div>
        </div>
        <div class="tiny" id="readout">Center date: —</div>
      </div>
    `;

    applyTheme(cfg.theme || {});

    const viewport = document.getElementById("viewport");
    const canvas = document.getElementById("canvas");
    const zoomSelect = document.getElementById("zoomSelect");
    const intervalSelect = document.getElementById("intervalSelect");
    const centerSelect = document.getElementById("centerSelect");
    const readout = document.getElementById("readout");
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

    function getEffectivePxPerDay(zoom, anchorDate){
      return Math.min(getPxPerDayForView(zoom, anchorDate), MAX_PX_PER_DAY);
    }



    const zoomLevelsRaw = cfg.zoomLevels || ["day","month","year","decade","century","fit"];

    const zoomLevels = zoomLevelsRaw.filter(z => {
      if (z === "day") return allowDayZoom;
      if (z === "month") return allowMonthZoom;
      return true;
    });

    const intervalLevels = ["day","month","year","decade","century"]; // UI list only
    const defaultInterval = cfg.defaultInterval || "decade";
    const defaultZoom = cfg.defaultZoom || defaultInterval;


    let currentCenterDate = rangeBegin;

    zoomSelect.innerHTML = "";
    for (const z of zoomLevels){
      const o = document.createElement("option");
      o.value = z;
      o.textContent = (z === "fit") ? "Fit (full timeline)" : cap(z);
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

    zoomSelect.value = safeDefaultZoom;

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
      render();
      scrollToCenterDate(currentCenterDate);
    });



    centerSelect.addEventListener("change", () => centerOn(centerSelect.value));

    viewport.addEventListener("wheel", (e) => {
      if (viewport.scrollWidth > viewport.clientWidth){
        e.preventDefault();
        viewport.scrollLeft += (e.deltaY + e.deltaX);
        syncMiniWindow();
        updateReadout();
      }
    }, { passive:false });

    // Keep ticks/overlays correct even when scrolling via scrollbar drag, touch, or inertia.
    let scrollRAF = 0;
    viewport.addEventListener("scroll", () => {
      if (scrollRAF) cancelAnimationFrame(scrollRAF);
      scrollRAF = requestAnimationFrame(() => {
        syncMiniWindow();
        updateReadout();
      });
    }, { passive:true });


    makeMiniMapDraggable();

    window.addEventListener("resize", () => {
      render();
      scrollToCenterDate(currentCenterDate);
      requestAnimationFrame(() => {
        positionLanesSymmetrically();
        adjustConnectors();
      });
    });

    render();
    centerOn(centerSelect.value || "__begin__");

    /* ----------------- ZOOM/TICKS RULES ----------------- */

    function tickForZoom(z){
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
        const lastDay = new Date(Date.UTC(ay, m + 1, 0)).getUTCDate();
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
      return Math.max(0.008, (viewport.clientWidth - 40) / Math.max(1, totalDays));
    }

    function computeZoomPxPerDay(zoom, anchorDate){
      const span = zoomSpanAligned(anchorDate, zoom);
      const days = daysBetween(span.start, span.end) + 1;
      return Math.max(0.008, (viewport.clientWidth - 40) / Math.max(1, days));
    }

    function getPxPerDayForView(zoom, anchorDate){
      return (zoom === "fit") ? computeFitPxPerDay() : computeZoomPxPerDay(zoom, anchorDate);
    }

    function scrollToCenterDate(d){

      const zoomLevel = zoomSelect.value;
      const pxPerDay = getEffectivePxPerDay(zoomLevel, d);
      const centerX = dateToX(d, pxPerDay);


      viewport.scrollLeft = clamp(
        centerX - (viewport.clientWidth / 2),
        0,
        Math.max(0, viewport.scrollWidth - viewport.clientWidth)
      );
      syncMiniWindow();
      updateReadout();
    }

    /* ----------------- RENDER ----------------- */

    function render(){
      canvas.innerHTML = "";

      const zoomLevel = zoomSelect.value;
      const tickInterval = tickForZoom(zoomLevel);
      intervalSelect.value = tickInterval;



      const pxPerDay = getEffectivePxPerDay(zoomLevel, currentCenterDate);

      const width = Math.max(900, Math.floor(TOTAL_DAYS * pxPerDay));
      canvas.style.width = width + "px";



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
        syncMiniWindow();
        updateReadout();
      });
    }

    function renderTicksVisible(containerEl, interval, pxPerDay){
      containerEl.innerHTML = "";

      // IMPORTANT: boundary overlays (dotted lines + top/bottom pills) are appended to `canvas`,
      // not to the ticks container. When ticks redraw during scrolling, we must remove old overlays
      // or they "stack up" and appear in random places.
      canvas.querySelectorAll(".boundaryOverlay").forEach(el => el.remove());
      const zoomLevel = zoomSelect.value;

      // IMPORTANT:
      // Month zoom: we render ONLY the aligned month span (prevents “day 1 of neighbor month” drifting into mid-month).
      // Year zoom: we still render within visible range, but spans are aligned to true month boundaries.
      let visBegin, visEnd;

      if (zoomLevel === "month" && interval === "day"){
        const span = zoomSpanAligned(currentCenterDate, "month");
        visBegin = span.start;
        visEnd = span.end;
      } else {
        // Visible day index range (with padding)
        const totalDays = daysBetween(rangeBegin, rangeEnd) + 1;
        const padDays = Math.max(2, Math.ceil(30 / Math.max(0.01, pxPerDay)));
        const leftIndex = clamp(Math.floor(viewport.scrollLeft / pxPerDay) - padDays, 0, totalDays - 1);
        const rightIndex = clamp(Math.ceil((viewport.scrollLeft + viewport.clientWidth) / pxPerDay) + padDays, 0, totalDays - 1);
        visBegin = addDays(rangeBegin, leftIndex);
        visEnd = addDays(rangeBegin, rightIndex);
      }

      // Build marks
      let marks;
      if (interval === "day"){
        if (zoomLevel === "month"){
          marks = buildDayMarksMonthView(visBegin, visEnd); // even days labeled, day 1 unlabeled tick
        } else if (zoomLevel === "day"){
          marks = buildDayMarksDayView(visBegin, visEnd);   // full date on each tick
        } else {
          marks = buildDayMarksMonthView(visBegin, visEnd);
        }
      } else {
        // Use ALIGNED interval spans so month ticks always start on the 1st
        marks = buildTickMarksAligned(visBegin, visEnd, interval);
      }

      // Draw ticks + boundary lines/labels
      // We also de-dupe boundary lines by using a set of day indices.
      const boundaryKey = new Set();

      for (const m of marks){
        const x = dateToX(m.date, pxPerDay);

        const isMonthBoundary = (zoomLevel === "month" && interval === "day" && m.date.getUTCDate() === 1);

        const isYearBoundary =
          (zoomLevel === "year" && interval === "month" && m.date.getUTCMonth() === 0 && m.date.getUTCDate() === 1);

        if (isMonthBoundary || isYearBoundary){
          const key = daysBetween(rangeBegin, m.date); // stable unique key
          if (!boundaryKey.has(key)){
            boundaryKey.add(key);

            // dotted full-height line

            const line = document.createElement("div");
            line.className = "boundaryOverlay";

            line.style.position = "absolute";
            line.style.left = x + "px";
            line.style.top = "0";
            line.style.bottom = "0";
            line.style.width = "0";
            line.style.borderLeft = "2px dotted rgba(255,216,74,0.85)";
            line.style.zIndex = "8";
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
      el.style.zIndex = "9";
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
          // day 1 tick exists, label handled by boundary pills
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

    function buildTickMarksAligned(begin, end, interval){
      const spans = buildIntervalSpansAligned(begin, end, interval);
      const marks = [];
      for (const sp of spans){
        marks.push({ date: sp.start, big:true, label: sp.label });
        if (interval !== "day"){
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

      while (cur <= end){
        const start = new Date(cur.getTime());
        const last = intervalEnd(start, interval);
        const endSpan = (last > end) ? end : last;
        spans.push({ start, end: endSpan, label: intervalLabel(start, interval) });
        cur = addDays(endSpan, 1);
      }

      return spans;
    }



    function snapToBoundary(d, interval){
      const ay = d.getUTCFullYear();     // astronomical year
      const m = d.getUTCMonth();
      const day = d.getUTCDate();

      if (interval === "month"){
        return makeUTCDate(ay, m, 1);
      }

      if (interval === "year"){
        return makeUTCDate(ay, 0, 1);
      }

      // For decade/century boundaries, use HISTORICAL years so BCE alignment is correct.
      const histY = toHistoricalYear(d);

      if (interval === "decade"){
        const h0 = Math.floor(histY / 10) * 10;
        const y0 = histYearToAstro(h0);
        return makeUTCDate(y0, 0, 1);
      }

      if (interval === "century"){
        const h0 = Math.floor(histY / 100) * 100;
        const y0 = histYearToAstro(h0);
        return makeUTCDate(y0, 0, 1);
      }

      // day
      return makeUTCDate(ay, m, day);
    }

    function intervalEnd(start, interval){
      const y = start.getUTCFullYear();
      const m = start.getUTCMonth();

      if (interval === "month"){
        const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
        return makeUTCDate(y, m, lastDay);
      }
      if (interval === "year"){
        return makeUTCDate(y, 11, 31);
      }
      if (interval === "decade"){
        const y0 = Math.floor(y / 10) * 10;
        return makeUTCDate(y0 + 9, 11, 31);
      }
      // century
      const y0 = Math.floor(y / 100) * 100;
      return makeUTCDate(y0 + 99, 11, 31);
    }

    /* ----------------- CONTEXT + EVENTS ----------------- */

    function renderContext(pxPerDay){
      const ctx = Array.isArray(cfg.contextEvents) ? cfg.contextEvents : [];
      for (const c of ctx){
        const d = parseFlexibleDate(c.date, "anchor");
        if (!d) continue;

        const x = dateToX(d, pxPerDay);

        const tag = document.createElement("div");
        tag.className = "contextTag";
        tag.style.left = x + "px";
        tag.textContent = c.label || "";
        canvas.appendChild(tag);

        const line = document.createElement("div");
        line.className = "contextLine";
        line.style.left = x + "px";
        line.style.height = (getBarCenterY() - 26) + "px";
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

    function positionLanesSymmetrically(){
      const root = document.querySelector(".timeline-embed");
      const cs = getComputedStyle(root);

      const gap = parseFloat(cs.getPropertyValue("--gapToPortraitEdge")) || 120;
      const avatarH = parseFloat(cs.getPropertyValue("--avatar")) || 110;
      const safeTop = parseFloat(cs.getPropertyValue("--safeTop")) || 12;

      const barCenterY = getBarCenterY();

      const sampleAbove = canvas.querySelector(".eventCard.laneAbove .avatarWrap");
      const sampleBelow = canvas.querySelector(".eventCard.laneBelow .avatarWrap");

      const aboveAvatarOffsetTop = sampleAbove ? sampleAbove.offsetTop : 0;
      const belowAvatarOffsetTop = sampleBelow ? sampleBelow.offsetTop : 0;

      let aboveLaneTop = (barCenterY - gap) - (aboveAvatarOffsetTop + avatarH);
      const belowLaneTop = (barCenterY + gap) - (belowAvatarOffsetTop);

      if (aboveLaneTop < safeTop) aboveLaneTop = safeTop;

      canvas.querySelectorAll(".eventCard.laneAbove").forEach(el => el.style.top = aboveLaneTop + "px");
      canvas.querySelectorAll(".eventCard.laneBelow").forEach(el => el.style.top = belowLaneTop + "px");
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
      for (const ev of events){
        add(ev.id || ev.label || String(Math.random()), `${ev.label || "Event"} ${ev.dateLabel ? `(${ev.dateLabel})` : ""}`.trim());
      }

      const active = (window.TIMELINE_ACTIVE_ID || "").toString();
      const hasActive = events.some(e => (e.id || "") === active);
      centerSelect.value = hasActive ? active : "__begin__";
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
      scrollToCenterDate(currentCenterDate);
    }

    function syncMiniWindow(){
      const total = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
      const pLeft = (total === 0) ? 0 : (viewport.scrollLeft / total);
      const pW = viewport.clientWidth / Math.max(1, viewport.scrollWidth);

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
        const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        viewport.scrollLeft = p * maxScroll;

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
        const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        viewport.scrollLeft = p * maxScroll;

        syncMiniWindow();
        updateReadout();
      });
    }


    function updateReadout(){
      const zoomLevel = zoomSelect.value;

      // 1) Estimate center date using the current scale (may be stale if we crossed into a new month)
      const pxPerDayEstimate = getEffectivePxPerDay(zoomLevel, currentCenterDate);

      const centerCanvasX = viewport.scrollLeft + (viewport.clientWidth / 2);
      const dayIndex = Math.round(centerCanvasX / pxPerDayEstimate);
      const d = clampDateToRange(addDays(rangeBegin, dayIndex));

      // 2) Update the true center date
      currentCenterDate = d;

      // 3) Recompute the correct scale for the NEW center date
      const pxPerDay = getEffectivePxPerDay(zoomLevel, currentCenterDate);

      readout.textContent = `Center date: ${formatISO(currentCenterDate)}`;
      syncMiniWindow();

      // 4) In month/day zoom, the scale is "one unit in view", so when center changes
      // (especially crossing month boundaries), we should re-render the canvas to avoid dropouts.
      if (zoomLevel === "month" || zoomLevel === "day"){
        render();
        // Keep the current center date in the middle after re-render so the view doesn't jump.
        scrollToCenterDate(currentCenterDate);
        return;
      }

      // Otherwise, just redraw visible ticks/overlays with the correct scale.
      const ticksEl = canvas.querySelector(".ticks");
      const tickInterval = intervalSelect.value;
      if (ticksEl) renderTicksVisible(ticksEl, tickInterval, pxPerDay);
    }

    /* ----------------- UTILITIES ----------------- */

    function applyTheme(theme){
      const root = document.querySelector(".timeline-embed");
      if (!root) return;

      const map = {
        bg: "--bg",
        bg2: "--bg2",
        text: "--text",
        muted: "--muted",
        gold: "--gold",
        gold2: "--gold2",
        red: "--red",
        red2: "--red2",
        intervalA: "--intervalA",
        intervalB: "--intervalB",
        markerText: "--markerText"
      };

      for (const [k, v] of Object.entries(theme)){
        if (!map[k]) continue;
        root.style.setProperty(map[k], String(v));
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
      const d = new Date(Date.UTC(0, monthIndex, day));
      d.setUTCFullYear(fullYear);
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
        const d0 = Math.floor(histY/10)*10;
        return (d0 < 0) ? `${Math.abs(d0)} BCE` : `${d0}`;
      }

      const c0 = Math.floor(histY/100) * 100;
      return (c0 < 0) ? `${Math.abs(c0)} BCE` : `${c0}`;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeInit);
  } else {
    safeInit();
  }
})();