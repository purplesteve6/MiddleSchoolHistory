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

    // Apply theme overrides (CSS variables) from config.theme
    applyTheme(cfg.theme || {});

    const viewport = document.getElementById("viewport");
    const canvas = document.getElementById("canvas");
    const zoomSelect = document.getElementById("zoomSelect");
    const intervalSelect = document.getElementById("intervalSelect");
    const centerSelect = document.getElementById("centerSelect");
    const readout = document.getElementById("readout");
    const miniTrack = document.getElementById("miniTrack");
    const miniWindow = document.getElementById("miniWindow");

    // Normalize config
    const zoomLevels = cfg.zoomLevels || ["day","month","year","decade","century","fit"];
    const intervalLevels = ["day","month","year","decade","century"]; // UI list only; now derived
    const defaultInterval = cfg.defaultInterval || "decade";
    const defaultZoom = cfg.defaultZoom || defaultInterval;

    // Range
    const rangeBegin = parseFlexibleDate(cfg.range?.begin ?? "0001-01-01", "start");
    const rangeEnd = parseFlexibleDate(cfg.range?.end ?? "0100-12-31", "end");
    if (!rangeBegin || !rangeEnd){
      mount.innerHTML = `<div style="padding:.5rem; font-weight:900;">Bad range in TIMELINE_CONFIG</div>`;
      return;
    }

    // Track the date currently centered in the viewport.
    // This makes zoom behave like "field of view around what you're looking at".
    let currentCenterDate = rangeBegin;

    // Fill selects
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

    zoomSelect.value = defaultZoom;
    intervalSelect.value = defaultInterval;

    // Center dropdown
    populateCenterDropdown();

    function syncIntervalToZoom(){
      const z = zoomSelect.value;
      const derived = tickForZoom(z);
      intervalSelect.value = derived;
    }

    // Ticks are always one level below zoom (so we disable manual tick selection for now).
    intervalSelect.disabled = true;
    syncIntervalToZoom();

    zoomSelect.addEventListener("change", () => {
      syncIntervalToZoom();
      // Re-render using currentCenterDate as the anchor for the zoom span
      render();
      // Keep the same center in view after re-scaling
      scrollToCenterDate(currentCenterDate);
    });

    centerSelect.addEventListener("change", () => centerOn(centerSelect.value));

    // Horizontal wheel scrolling
    viewport.addEventListener("wheel", (e) => {
      if (viewport.scrollWidth > viewport.clientWidth){
        e.preventDefault();
        viewport.scrollLeft += (e.deltaY + e.deltaX);
        syncMiniWindow();
        updateReadout();
      }
    }, { passive:false });

    // Mini-map dragging
    makeMiniMapDraggable();

    // Resize
    window.addEventListener("resize", () => {
      // Re-render to maintain the “one unit in view” promise
      render();
      scrollToCenterDate(currentCenterDate);
      requestAnimationFrame(() => {
        positionLanesSymmetrically();
        adjustConnectors();
      });
    });

    // Initial render + initial center
    render();
    centerOn(centerSelect.value || "__begin__");

    /* ----------------- ZOOM/TICKS RULES ----------------- */

    function tickForZoom(z){
      // Ticks are always one level smaller than zoom (except day).
      // (We'll add week + half-decade later; this matches your current UI set.)
      switch(z){
        case "century": return "decade";
        case "decade":  return "year";
        case "year":    return "month";
        case "month":   return "day";
        case "day":     return "day";
        case "fit":     return "century"; // sensible default for full timeline
        default:        return "day";
      }
    }

    function clampDateToRange(d){
      if (d < rangeBegin) return rangeBegin;
      if (d > rangeEnd) return rangeEnd;
      return d;
    }

    // Compute a clean calendar-aligned span for the zoom level that CONTAINS anchorDate.
    // This fixes “partial centuries/decades” caused by spans starting at rangeBegin.
    function zoomSpanAligned(anchorDate, zoom){
      const a = clampDateToRange(anchorDate);

      if (zoom === "fit"){
        return { start: rangeBegin, end: rangeEnd };
      }

      // Work in historical years for boundaries (no year 0 in display logic),
      // but create Dates using astronomical years (JS Date uses year 0).
      const ay = a.getUTCFullYear();              // astronomical
      const histY = (ay <= 0) ? (ay - 1) : ay;    // historical
      const m = a.getUTCMonth();                  // 0–11

      if (zoom === "day"){
        return { start: makeUTCDate(ay, m, a.getUTCDate()), end: makeUTCDate(ay, m, a.getUTCDate()) };
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
        const startHist = y0;
        const endHist = y0 + 9;
        const startAstro = histYearToAstro(startHist);
        const endAstro = histYearToAstro(endHist);
        const start = makeUTCDate(startAstro, 0, 1);
        const end = makeUTCDate(endAstro, 11, 31);
        return { start: clampDateToRange(start), end: clampDateToRange(end) };
      }

      // century
      const c0 = Math.floor(histY / 100) * 100;
      const startHist = c0;
      const endHist = c0 + 99;
      const startAstro = histYearToAstro(startHist);
      const endAstro = histYearToAstro(endHist);
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
      const pxPerDay = getPxPerDayForView(zoomLevel, d);
      const centerX = dateToX(d, pxPerDay);
      viewport.scrollLeft = clamp(centerX - (viewport.clientWidth / 2), 0, Math.max(0, viewport.scrollWidth - viewport.clientWidth));
      syncMiniWindow();
      updateReadout();
    }

    /* ----------------- RENDER ----------------- */

    function render(){
      canvas.innerHTML = "";

      const zoomLevel = zoomSelect.value;
      const tickInterval = tickForZoom(zoomLevel);
      intervalSelect.value = tickInterval;

      const pxPerDay = getPxPerDayForView(zoomLevel, currentCenterDate);

      const totalDays = daysBetween(rangeBegin, rangeEnd) + 1;
      const width = Math.max(900, Math.floor(totalDays * pxPerDay));
      canvas.style.width = width + "px";

      // Bars container (TOP)
      const barsTop = document.createElement("div");
      barsTop.className = "bars barsTop";
      canvas.appendChild(barsTop);

      // Horizontal center line (timeline spine)
      const spine = document.createElement("div");
      spine.className = "timelineLine";
      canvas.appendChild(spine);

      // Ticks (MIDDLE)
      const ticksEl = document.createElement("div");
      ticksEl.className = "ticks";
      canvas.appendChild(ticksEl);

      // IMPORTANT: render ticks only for the VISIBLE region to prevent freezing at small intervals
      renderTicksVisible(ticksEl, tickInterval, pxPerDay);

      // Bars container (BOTTOM)
      const barsBottom = document.createElement("div");
      barsBottom.className = "bars barsBottom";
      canvas.appendChild(barsBottom);

      // Context events (tags + dotted lines)
      renderContext(pxPerDay);

      // Event bars + event cards
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

      const totalDays = daysBetween(rangeBegin, rangeEnd) + 1;

      // Visible day index range (with padding so labels don't pop in/out at edges)
      const padDays = Math.max(2, Math.ceil(30 / Math.max(0.01, pxPerDay))); // ~30px worth of padding
      const leftIndex = clamp(Math.floor(viewport.scrollLeft / pxPerDay) - padDays, 0, totalDays - 1);
      const rightIndex = clamp(Math.ceil((viewport.scrollLeft + viewport.clientWidth) / pxPerDay) + padDays, 0, totalDays - 1);

      const visBegin = addDays(rangeBegin, leftIndex);
      const visEnd = addDays(rangeBegin, rightIndex);

      const zoomLevel = zoomSelect.value;

      const marks = (zoomLevel === "month" && interval === "day")
        ? buildDayTickMarks(visBegin, visEnd, 5)
        : buildTickMarks(visBegin, visEnd, interval);

      for (const m of marks){
        const x = dateToX(m.date, pxPerDay);

        const t = document.createElement("div");
        t.className = "tick " + (m.big ? "big" : "small");
        t.style.left = x + "px";
        containerEl.appendChild(t);

        if (m.big){
          const lbl = document.createElement("div");
          lbl.className = "tickLabel";
          lbl.style.left = x + "px";
          lbl.textContent = m.label;
          containerEl.appendChild(lbl);
        }
      }
    }

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

        if (ev.id && String(ev.id) === String(window.TIMELINE_ACTIVE_ID || "")){
          nm.style.textDecoration = "underline";
          avatarWrap.style.boxShadow = "0 0 0 4px rgba(255,216,74,.14), 0 16px 34px rgba(0,0,0,.45)";
        }
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
      const pxPerDay = getPxPerDayForView(zoomLevel, currentCenterDate);

      const centerCanvasX = viewport.scrollLeft + (viewport.clientWidth/2);
      const dayIndex = Math.round(centerCanvasX / pxPerDay);
      const d = addDays(rangeBegin, dayIndex);

      currentCenterDate = clampDateToRange(d);

      readout.textContent = `Center date: ${formatISO(currentCenterDate)}`;
      syncMiniWindow();

      // Re-render ticks for the new visible range (cheap now that ticks are viewport-only)
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

    // Historical year <-> astronomical year conversion
    // 1 BCE = year 0, 2 BCE = -1, etc.
    function histYearToAstro(y){
      return (y <= -1) ? (y + 1) : y;
    }

    function makeUTCDate(fullYear, monthIndex, day){
      const d = new Date(Date.UTC(0, monthIndex, day));
      d.setUTCFullYear(fullYear);
      return d;
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
      const y = d.getUTCFullYear(); // astronomical
      const m = String(d.getUTCMonth()+1).padStart(2,"0");
      const day = String(d.getUTCDate()).padStart(2,"0");

      const histY = (y <= 0) ? (y - 1) : y;
      const yy = String(histY).padStart(4, "0");
      return `${yy}-${m}-${day}`;
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

    function buildIntervalSpans(begin, end, interval){
      // NOTE: This is now primarily used for tick generation within the *visible* range,
      // so performance is fine even for small intervals.
      const spans = [];
      let cur = new Date(begin.getTime());

      while (cur <= end) {
        const start = new Date(cur.getTime());
        let last;

        if (interval === "day") {
          last = new Date(start.getTime());

        } else if (interval === "month") {
          const y = start.getUTCFullYear();
          const m = start.getUTCMonth();
          const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
          last = makeUTCDate(y, m, lastDay);

        } else if (interval === "year") {
          const y = start.getUTCFullYear();
          last = makeUTCDate(y, 11, 31);

        } else if (interval === "decade") {
          const y = start.getUTCFullYear();
          const y0 = Math.floor(y / 10) * 10;
          last = makeUTCDate(y0 + 9, 11, 31);

        } else { // century
          const y = start.getUTCFullYear();
          const y0 = Math.floor(y / 100) * 100;
          last = makeUTCDate(y0 + 99, 11, 31);
        }

        const endSpan = (last > end) ? end : last;
        spans.push({ start, end: endSpan, label: intervalLabel(start, interval) });
        cur = addDays(endSpan, 1);
      }

      return spans;
    }

    function buildTickMarks(begin, end, interval){
      const spans = buildIntervalSpans(begin, end, interval);
      const marks = [];
      // Special-case day ticks: for month view we want fewer labels (e.g., 1, 6, 11, 16, 21, 26, 31)

      for (const sp of spans){
        marks.push({ date: sp.start, big:true, label: sp.label });

        // half-tick (unlabeled) between big ticks
        if (interval !== "day"){
          const mid = addDays(sp.start, Math.floor(daysBetween(sp.start, sp.end) / 2));
          marks.push({ date: mid, big:false, label:"" });
        }
      }

      marks.sort((a,b) => a.date - b.date);
      return marks;
    }

    function buildDayTickMarks(begin, end, labelStep = 1){
      const marks = [];
      let cur = new Date(begin.getTime());

      while (cur <= end){
        const dayNum = cur.getUTCDate();
        const shouldLabel = (labelStep <= 1) ? true : ((dayNum - 1) % labelStep === 0);

        marks.push({
          date: new Date(cur.getTime()),
          big: shouldLabel,
          label: shouldLabel ? String(dayNum) : ""
        });

        cur = addDays(cur, 1);
      }

      return marks;
    }

    function intervalLabel(d, interval){
      const y = d.getUTCFullYear();
      const histY = (y <= 0) ? (y - 1) : y;

      const mo = d.getUTCMonth()+1;
      const da = d.getUTCDate();

      if (interval === "day"){
        return String(da);
      }

      // ✅ Month abbreviations
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