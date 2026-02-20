(function(){
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
          <div class="controlPill" title="Zoom changes the scale of the timeline">
            <label for="zoomSelect">Zoom</label>
            <select id="zoomSelect" aria-label="Zoom level"></select>
          </div>

          <div class="controlPill" title="Interval boxes shown at the top">
            <label for="intervalSelect">Interval</label>
            <select id="intervalSelect" aria-label="Interval"></select>
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
    const intervalLevels = ["day","month","year","decade","century"];
    const defaultInterval = cfg.defaultInterval || "decade";
    const defaultZoom = cfg.defaultZoom || defaultInterval;

    // px per day by zoom
    const pxPerDayMap = Object.assign({
      day: 18,
      month: 3.0,
      year: 0.55,
      decade: 0.12,
      century: 0.03
    }, cfg.pxPerDay || {});

    // Range
    const rangeBegin = parseFlexibleDate(cfg.range?.begin ?? "0001-01-01", "start");
    const rangeEnd = parseFlexibleDate(cfg.range?.end ?? "0100-12-31", "end");
    if (!rangeBegin || !rangeEnd){
      mount.innerHTML = `<div style="padding:.5rem; font-weight:900;">Bad range in TIMELINE_CONFIG</div>`;
      return;
    }

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

    zoomSelect.addEventListener("change", render);
    intervalSelect.addEventListener("change", render);
    centerSelect.addEventListener("change", () => centerOn(centerSelect.value));

    // Horizontal wheel scrolling (same feel as your existing timeline)
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
      syncMiniWindow();
      requestAnimationFrame(() => {
        positionLanesSymmetrically();
        adjustConnectors();
      });
    });

    // Initial render
    render();
    // Initial center
    centerOn(centerSelect.value || "__begin__");

    /* ----------------- RENDER ----------------- */

    function render(){
      canvas.innerHTML = "";

      const zoomLevel = zoomSelect.value;
      const interval = intervalSelect.value;

      const pxPerDay = (zoomLevel === "fit") ? computeFitPxPerDay() : (pxPerDayMap[zoomLevel] ?? 0.12);
      const totalDays = daysBetween(rangeBegin, rangeEnd) + 1;
      const width = Math.max(900, Math.floor(totalDays * pxPerDay));
      canvas.style.width = width + "px";

      // Interval boxes row (alternating)
      renderIntervalBoxes(interval, pxPerDay);

      // Ticks
      renderTicks(interval, pxPerDay);

// Bars container (for event span bars)
const bars = document.createElement("div");
bars.className = "bars";
canvas.appendChild(bars);

// Span boxes (event time periods)
// Disabled: reign bars already show duration, so span boxes would duplicate visuals.
// renderSpanBoxes(pxPerDay);


      // Context events (tags + dotted lines)
      renderContext(pxPerDay);

      // Event bars (optional) + event cards
      renderEventBars(bars, pxPerDay);
      renderEvents(pxPerDay);

      // Lane positions + connectors
      requestAnimationFrame(() => {
        positionLanesSymmetrically();
        adjustConnectors();
        syncMiniWindow();
        updateReadout();
      });
    }

    function renderIntervalBoxes(interval, pxPerDay){
      const row = document.createElement("div");
      row.className = "intervalRow";
      canvas.appendChild(row);

      const spans = buildIntervalSpans(rangeBegin, rangeEnd, interval);
      const colors = cfg.intervalColors || ["var(--intervalA)", "var(--intervalB)"];

      spans.forEach((sp, idx) => {
        const left = dateToX(sp.start, pxPerDay);
        const right = dateToX(sp.end, pxPerDay) + pxPerDay; // inclusive-ish
        const box = document.createElement("div");
        box.className = "intervalBox";
        box.style.left = left + "px";
        box.style.width = Math.max(24, right - left) + "px";
        box.style.background = colors[idx % colors.length];
        box.textContent = sp.label;
        row.appendChild(box);
      });
    }

    function renderTicks(interval, pxPerDay){
      const ticks = document.createElement("div");
      ticks.className = "ticks";
      canvas.appendChild(ticks);

      const marks = buildTickMarks(rangeBegin, rangeEnd, interval);
      for (const m of marks){
        const x = dateToX(m.date, pxPerDay);

        const t = document.createElement("div");
        t.className = "tick " + (m.big ? "big" : "small");
        t.style.left = x + "px";
        ticks.appendChild(t);

        if (m.big){
          const lbl = document.createElement("div");
          lbl.className = "tickLabel";
          lbl.style.left = x + "px";
          lbl.textContent = m.label;
          ticks.appendChild(lbl);
        }
      }
    }

    function renderSpanBoxes(pxPerDay){
      const events = Array.isArray(cfg.events) ? cfg.events : [];
      for (const ev of events){
        const s = parseFlexibleDate(ev.start, "start", ev);
        const e = parseFlexibleDate(ev.end ?? ev.start, "end", ev);
       if (!s || !e) continue;

        const left = dateToX(s, pxPerDay);
        const right = dateToX(e, pxPerDay) + pxPerDay;
        const box = document.createElement("div");
        box.className = "spanBox";
        box.style.left = left + "px";
        box.style.width = Math.max(6, right - left) + "px";
        canvas.appendChild(box);
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

    function renderEventBars(barsEl, pxPerDay){
      const events = Array.isArray(cfg.events) ? cfg.events : [];
      const palette = cfg.barColors || ["var(--gold)", "var(--red)", "var(--gold2)", "var(--red2)"];

      events.forEach((ev, idx) => {
        if (ev.showBar === false) return;

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
        bar.style.background = palette[idx % palette.length];
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
      events.forEach((ev, idx) => {
        const anchor = parseFlexibleDate(ev.anchor ?? ev.start, "anchor", ev);
        if (!anchor) return;

        const x = dateToX(anchor, pxPerDay);

        const laneClass = (ev.side === "below") ? "laneBelow" : "laneAbove";

        const card = document.createElement("a");
        card.className = `eventCard ${laneClass}` + (ev.isContextCard ? " contextCard" : "");
        card.href = resolveAsset(ev.href || "#");
        card.style.left = x + "px";
        card.title = ev.label || "";
        card.setAttribute("aria-label", ev.label ? `Open page for ${ev.label}` : "Open event");

        const stack = document.createElement("div");
        stack.className = "stack";

        // Text + date label (position relative to image depends on above/below rule)
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

// Your rule:
// - Above timeline: text ABOVE picture
// - Below timeline: text BELOW picture
if (laneClass === "laneAbove"){
  // Text first, then portrait
  stack.appendChild(meta);
  stack.appendChild(avatarWrap);
} else {
  // Portrait first, then text
  stack.appendChild(avatarWrap);
  stack.appendChild(meta);
}

        const connector = document.createElement("div");
        connector.className = "connector";

        card.appendChild(stack);
        card.appendChild(connector);
        canvas.appendChild(card);

        // Active highlight
        if (ev.id && String(ev.id) === String(window.TIMELINE_ACTIVE_ID || "")){
          nm.style.textDecoration = "underline";
          avatarWrap.style.boxShadow = "0 0 0 4px rgba(255,216,74,.14), 0 16px 34px rgba(0,0,0,.45)";
        }
      });
    }

    /* ----------------- LAYOUT HELPERS ----------------- */

    function positionLanesSymmetrically(){
      // Mirrors your existing “gapToPortraitEdge” approach
      const root = document.querySelector(".timeline-embed");
      const cs = getComputedStyle(root);

      const gap = parseFloat(cs.getPropertyValue("--gapToPortraitEdge")) || 120;
      const avatarH = parseFloat(cs.getPropertyValue("--avatar")) || 110;
      const barCenterY = getBarCenterY();

      const sampleAbove = canvas.querySelector(".eventCard.laneAbove .avatarWrap");
      const sampleBelow = canvas.querySelector(".eventCard.laneBelow .avatarWrap");

      let aboveAvatarOffsetTop = sampleAbove ? sampleAbove.offsetTop : 0;
      let belowAvatarOffsetTop = sampleBelow ? sampleBelow.offsetTop : 0;

      const aboveLaneTop = (barCenterY - gap) - (aboveAvatarOffsetTop + avatarH);
      const belowLaneTop = (barCenterY + gap) - (belowAvatarOffsetTop);

      canvas.querySelectorAll(".eventCard.laneAbove").forEach(el => el.style.top = aboveLaneTop + "px");
      canvas.querySelectorAll(".eventCard.laneBelow").forEach(el => el.style.top = belowLaneTop + "px");
    }

function adjustConnectors(){
  // Connector should pin to the CENTER of the reign bar row:
  const barMidY = getBarCenterY();

  const cards = canvas.querySelectorAll(".eventCard");

  cards.forEach(card => {
    const avatar = card.querySelector(".avatarWrap");
    const connector = card.querySelector(".connector");
    if (!avatar || !connector) return;

    const cardTop = card.offsetTop;
    const avatarTop = cardTop + avatar.offsetTop;
    const avatarBottom = avatarTop + avatar.offsetHeight;

    const isAbove = card.classList.contains("laneAbove");
    const portraitEdgeY = isAbove ? avatarBottom : avatarTop;

    const minY = Math.min(portraitEdgeY, barMidY);
    const maxY = Math.max(portraitEdgeY, barMidY);
    const height = Math.max(0, maxY - minY);

    connector.style.left = "50%";
    connector.style.top = (minY - cardTop) + "px";
    connector.style.height = height + "px";

 // If the card is above, the dot should be at the bottom end (so NOT dotTop).
// If the card is below, the dot should be at the top end (dotTop).
connector.classList.toggle("dotTop", !isAbove);


  });

  // No timelineLine element (removed earlier), so nothing to sync here.
}


    function getBarCenterY(){
      const root = document.querySelector(".timeline-embed");
      const cs = getComputedStyle(root);
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
        viewport.scrollLeft = 0;
        syncMiniWindow();
        updateReadout();
        return;
      }

      const events = Array.isArray(cfg.events) ? cfg.events : [];
      const ev = events.find(e => String(e.id || "") === String(id));
      if (!ev) return;

      const zoomLevel = zoomSelect.value;
      const pxPerDay = (zoomLevel === "fit") ? computeFitPxPerDay() : (pxPerDayMap[zoomLevel] ?? 0.12);

      const anchor = parseFlexibleDate(ev.anchor ?? ev.start, "anchor");
      if (!anchor) return;

      const centerX = dateToX(anchor, pxPerDay);
      viewport.scrollLeft = clamp(centerX - (viewport.clientWidth / 2), 0, viewport.scrollWidth);

      syncMiniWindow();
      updateReadout();
    }

    function computeFitPxPerDay(){
      const totalDays = daysBetween(rangeBegin, rangeEnd) + 1;
      return Math.max(0.008, (viewport.clientWidth - 40) / totalDays);
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
      const pxPerDay = (zoomLevel === "fit") ? computeFitPxPerDay() : (pxPerDayMap[zoomLevel] ?? 0.12);

      const centerCanvasX = viewport.scrollLeft + (viewport.clientWidth/2);
      const dayIndex = Math.round(centerCanvasX / pxPerDay);
      const d = addDays(rangeBegin, dayIndex);

      readout.textContent = `Center date: ${formatISO(d)}`;
      syncMiniWindow();
    }

    /* ----------------- UTILITIES ----------------- */

    function applyTheme(theme){
      // set CSS vars on .timeline-embed for easy global styling overrides
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
      if (/^(https?:)?\/\//.test(path)) return path; // absolute URL
      if (path.startsWith("/")) return path;          // site absolute
      // relative to topic folder
      const base = window.TIMELINE_CONFIG_BASE || "/";
      return base + path.replace(/^\.\//, "");
    }

    function cap(s){ return s ? s[0].toUpperCase() + s.slice(1) : s; }
    function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }

    // Year handling notes:
    // - Config can use ISO-like strings with negative years, e.g. "-0044-03-15"
    // - OR plain years like -44 or "476"
    // - We convert “historical year” to “astronomical year” for JS Date:
    //   1 BCE = year 0, 2 BCE = -1, etc.
    function histYearToAstro(y){
      return (y <= -1) ? (y + 1) : y;
    }

// JS Date quirk: years 0–99 get treated as 1900–1999.
// This helper forces the intended astronomical year.
function makeUTCDate(fullYear, monthIndex, day){
  const d = new Date(Date.UTC(0, monthIndex, day));
  d.setUTCFullYear(fullYear);
  return d;
}


    /**
     * parseFlexibleDate(v, kind)
     *
     * kind:
     *   - "start": numeric years become Jan 1 of that year
     *   - "end":   numeric years become either Jan 1 (default) OR Dec 31 (if cfg.numericYearEndMode === "endOfYear")
     *   - "anchor"/"point": numeric years become Jan 1 of that year
     *
     * Config option:
     *   cfg.numericYearEndMode:
     *     - "startOfYear": end: 476 -> 476-01-01
     *     - "endOfYear" (default): end: 476 -> 476-12-31
     */

 

    function parseFlexibleDate(v, kind = "anchor", ev = null){
      if (v === null || v === undefined) return null;

      // If v is just a year (number or "YYYY"/"-44"), we need to decide:
      // - for START-like uses: interpret as Jan 1
      // - for END-like uses: interpret as Dec 31 (by default), unless overridden
      const endMode =
        (ev && ev.numericYearEndMode) ||
        cfg.numericYearEndMode ||
        "endOfYear"; // default matches your expectation: numeric end year => 12/31

      const wantEndOfYear = (kind === "end") && (endMode === "endOfYear");

      // number year
if (typeof v === "number" && Number.isFinite(v)){
  const ay = histYearToAstro(v);
  return wantEndOfYear
    ? makeUTCDate(ay, 11, 31)
    : makeUTCDate(ay, 0, 1);
}

      const s = String(v).trim();

      // "YYYY" or "-44" (year-only string)
if (/^-?\d{1,6}$/.test(s)){
  const y = parseInt(s, 10);
  const ay = histYearToAstro(y);
  return wantEndOfYear
    ? makeUTCDate(ay, 11, 31)
    : makeUTCDate(ay, 0, 1);
}

      // "YYYY-MM-DD" with optional negative year: "-0044-03-15"
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
      const y = d.getUTCFullYear(); // astronomical year
      const m = String(d.getUTCMonth()+1).padStart(2,"0");
      const day = String(d.getUTCDate()).padStart(2,"0");

      // Convert back to historical year for display (no year 0)
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
      const spans = [];
      let cur = new Date(begin.getTime());

      while(cur <= end){
        const start = new Date(cur.getTime());
        let last;

        if (interval === "day"){
          last = new Date(start.getTime());
        } else if (interval === "month"){
          last = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth()+1, 0));
        } else if (interval === "year"){
          last = new Date(Date.UTC(start.getUTCFullYear(), 11, 31));
        } else if (interval === "decade"){
          const y = start.getUTCFullYear();
          const y0 = Math.floor(y/10)*10;
          last = new Date(Date.UTC(y0+9, 11, 31));
        } else { // century
          const y = start.getUTCFullYear();
          const y0 = Math.floor(y/100)*100;
          last = new Date(Date.UTC(y0+99, 11, 31));
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

    function intervalLabel(d, interval){
      const y = d.getUTCFullYear();
      const histY = (y <= 0) ? (y - 1) : y;

      const mo = d.getUTCMonth()+1;
      const da = d.getUTCDate();


if (interval === "day"){
  return (histY < 0)
    ? `${Math.abs(histY)}-${String(mo).padStart(2,"0")}-${String(da).padStart(2,"0")} BCE`
    : `${histY}-${String(mo).padStart(2,"0")}-${String(da).padStart(2,"0")}`;
}

if (interval === "month"){
  return (histY < 0)
    ? `${Math.abs(histY)}-${String(mo).padStart(2,"0")} BCE`
    : `${histY}-${String(mo).padStart(2,"0")}`;
}

if (interval === "year"){
  return (histY < 0)
    ? `${Math.abs(histY)} BCE`
    : `${histY}`;
}

if (interval === "decade"){
  const d0 = Math.floor(histY/10)*10;
  return (d0 < 0)
    ? `${Math.abs(d0)}s BCE`
    : `${d0}s`;
}

    }


// Century label (100s, 200s, -300s, etc.)
const c0 = Math.floor(histY/100) * 100;
return `${c0}s`;

    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
