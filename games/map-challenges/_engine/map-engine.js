/* ============================================================
   Map Challenge Engine (shared)
   - Reads window.MAP_CHALLENGE_CONFIG
   - Loads SVG, auto-detects aspect ratio from viewBox
   - Handles scoring, timing, overlays, tooltip, autoscaling
   - NEVER hard-codes SVG dimensions
   ============================================================ */

(function () {
  const cfg = window.MAP_CHALLENGE_CONFIG;
  if (!cfg) {
    console.error("MAP_CHALLENGE_CONFIG not found.");
    return;
  }

  // Required config fields
  const SVG_PATH = cfg.svgPath;
  const ITEMS = Array.isArray(cfg.items) ? cfg.items.slice() : [];

  // Defaults that should always be safe
  const DEFAULT_IGNORE = new Set(["context_land", "borders", "water"]);
  const IGNORE = new Set([...(cfg.ignore ?? []), ...DEFAULT_IGNORE]);

  const ALIASES = cfg.aliases ?? {};      // { clickedId: normalizedId }
  const GROUPS  = cfg.groups  ?? {};      // { normalizedId: [id1,id2...] }
  const DISPLAY_NAMES = cfg.displayNames ?? {};

  const FLAGS_BASE = cfg.flagsBase ?? null;
  const SHOW_FLAGS = !!(cfg.showFlags && FLAGS_BASE);

  const GAME_KICKER = cfg.kicker ?? "MAP CHALLENGE";
  const GAME_TITLE  = cfg.title  ?? "MAP";

  const LOGO_SRC = cfg.logoSrc ?? "/assets/images/logo/MSHistory_Logo_Small.png";

  // DOM (expects these IDs/classes in the page)
  const stageEl = document.querySelector(".map-stage");
  const mapBox = document.getElementById("mapBox");
  const overlay = document.getElementById("startOverlay");
  const beginBtn = document.getElementById("beginBtn");
  const resetBtn = document.getElementById("resetBtn");
  const targetNameEl = document.getElementById("targetName");
  const targetFlagEl = document.getElementById("targetFlag"); // optional
  const timerEl = document.getElementById("timer");
  const cursorTipEl = document.getElementById("cursorTip");

  if (!mapBox || !stageEl || !overlay || !beginBtn || !resetBtn || !targetNameEl || !timerEl || !cursorTipEl) {
    console.error("Missing required map challenge DOM elements.");
    return;
  }

  let svgRoot = null;

  // Game state
  let remaining = [];
  let currentTarget = null;
  let tries = 0; // 0 = first attempt, 1 = second attempt
  let totalPoints = 0;
  let locked = new Set(); // completed targets do not register clicks

  let timerStart = 0;
  let timerInt = null;

  let tempWrongEl = null;
  let lastMouseX = 0;
  let lastMouseY = 0;

  /* ---------------------------
     Utilities
     --------------------------- */
  function shuffle(arr){
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function fmtTime(ms){
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis  = ms % 1000;
    return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}.${String(millis).padStart(3,"0")}`;
  }

  function startTimer(){
    stopTimer();
    timerStart = Date.now();
    timerEl.textContent = "00:00.000";
    timerInt = setInterval(() => {
      timerEl.textContent = fmtTime(Date.now() - timerStart);
    }, 31);
  }

  function stopTimer(){
    if (timerInt) clearInterval(timerInt);
    timerInt = null;
  }

  function toTitleCase(str){
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }

  function displayNameFor(id){
    const base = DISPLAY_NAMES[id] ?? id.replaceAll("_"," ");
    return toTitleCase(base);
  }

  function flagSrcFor(id){
    return `${FLAGS_BASE}${id}.jpg`;
  }

  function setFlagForCurrent(){
    if (!targetFlagEl) return;

    if (!SHOW_FLAGS || !currentTarget){
      targetFlagEl.style.display = "none";
      targetFlagEl.src = "";
      targetFlagEl.alt = "";
      return;
    }

    const src = flagSrcFor(currentTarget);
    targetFlagEl.src = src;
    targetFlagEl.alt = `${displayNameFor(currentTarget)} flag`;
    targetFlagEl.style.display = "inline-block";

    targetFlagEl.onerror = () => {
      targetFlagEl.style.display = "none";
    };
  }

  function setPrompt(){
    if (!currentTarget){
      targetNameEl.textContent = "Done!";
      setFlagForCurrent();
      return;
    }
    targetNameEl.textContent = displayNameFor(currentTarget);
    setFlagForCurrent();
  }

  function getElById(id){
    if (!svgRoot) return null;
    return svgRoot.querySelector(`#${CSS.escape(id)}`);
  }

  function forEachGroupEl(normalizedId, fn){
    const group = GROUPS[normalizedId];
    if (group && Array.isArray(group) && group.length){
      group.forEach(id => {
        const el = getElById(id);
        if (el) fn(el);
      });
      return;
    }
    const el = getElById(normalizedId);
    if (el) fn(el);
  }

  function markClickable(){
    // Mark only configured items as clickable
    ITEMS.forEach(id => {
      const el = getElById(id);
      if (el) el.dataset.clickable = "true";
    });

    // Also mark grouped elements clickable (so they default white and get pointer cursor)
    Object.values(GROUPS).forEach(arr => {
      if (!Array.isArray(arr)) return;
      arr.forEach(id => {
        const el = getElById(id);
        if (el) el.dataset.clickable = "true";
      });
    });
  }

  function clearAllClasses(){
    if (!svgRoot) return;
    // Clear on any clickable element we’ve marked
    const els = svgRoot.querySelectorAll(`[data-clickable="true"]`);
    els.forEach(el => el.classList.remove("correct1","correct2","wrongFinal","blink","tempWrong"));
  }

  /* ---------------------------
     Tooltip control
     --------------------------- */
  function canShowCursorTip(){
    if (!document.body.classList.contains("is-playing")) return false;
    if (!currentTarget) return false;
    if (overlay && !overlay.classList.contains("is-hidden")) return false;
    if (document.getElementById("endOverlay")) return false;
    return true;
  }

  function showCursorTip(clientX, clientY){
    if (!cursorTipEl) return;
    if (!canShowCursorTip()) return;

    cursorTipEl.textContent = displayNameFor(currentTarget);
    cursorTipEl.classList.add("is-on");

    const offsetX = 14;
    const offsetY = 18;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    cursorTipEl.style.left = "0px";
    cursorTipEl.style.top = "0px";

    const rect = cursorTipEl.getBoundingClientRect();

    let x = clientX + offsetX;
    let y = clientY + offsetY;

    if (x + rect.width + 10 > vw) x = clientX - rect.width - 10;
    if (y + rect.height + 10 > vh) y = clientY - rect.height - 10;

    cursorTipEl.style.left = `${x}px`;
    cursorTipEl.style.top = `${y}px`;
  }

  function hideCursorTip(){
    if (!cursorTipEl) return;
    cursorTipEl.classList.remove("is-on");
    cursorTipEl.style.left = "0px";
    cursorTipEl.style.top = "0px";
  }

  /* ---------------------------
     Auto-fit scaling (Chromebook-safe)
     --------------------------- */
  function fitStageToViewport(){
    if (!stageEl) return;

    const vv = window.visualViewport;

    const viewportW = vv ? vv.width : document.documentElement.clientWidth;
    const viewportH = vv ? vv.height : document.documentElement.clientHeight;
    if (!viewportW || !viewportH) return;

    // Measure natural size
    const prevTransform = stageEl.style.transform;
    const prevOrigin = stageEl.style.transformOrigin;
    const prevMB = stageEl.style.marginBottom;

    stageEl.style.transform = "none";
    stageEl.style.transformOrigin = "top center";
    stageEl.style.marginBottom = "0px";

    const rect = stageEl.getBoundingClientRect();
    const naturalW = rect.width;
    const naturalH = rect.height;

    if (!naturalW || !naturalH){
      stageEl.style.transform = prevTransform;
      stageEl.style.transformOrigin = prevOrigin;
      stageEl.style.marginBottom = prevMB;
      return;
    }

    const padX = 16;
    const padY = 16;

    const offsetTop = vv ? (vv.offsetTop || 0) : 0;
    const topInVisibleViewport = rect.top - offsetTop;

    const availableW = viewportW - padX * 2;
    const availableH = viewportH - topInVisibleViewport - padY;

    const scale = Math.max(
      0.55,
      Math.min(1, availableW / naturalW, availableH / naturalH)
    );

    stageEl.style.transformOrigin = "top center";
    stageEl.style.transform = `scale(${scale})`;
    stageEl.style.marginBottom = `${Math.round((1 - scale) * naturalH)}px`;
  }

  let fitRAF = 0;
  function requestFit(){
    if (fitRAF) cancelAnimationFrame(fitRAF);
    fitRAF = requestAnimationFrame(() => {
      fitRAF = 0;
      fitStageToViewport();
    });
  }

  /* ---------------------------
     Game flow
     --------------------------- */
  function pickNext(){
    currentTarget = remaining.shift() || null;
    tries = 0;
    setPrompt();

    if (!currentTarget){
      endGame();
      return;
    }

    if (canShowCursorTip()){
      showCursorTip(lastMouseX, lastMouseY);
    }
  }

  function flashCorrectThenRed(){
    forEachGroupEl(currentTarget, (el) => el.classList.remove("correct1","correct2"));
    forEachGroupEl(currentTarget, (el) => el.classList.add("blink"));

    setTimeout(() => {
      forEachGroupEl(currentTarget, (el) => el.classList.remove("blink"));
      forEachGroupEl(currentTarget, (el) => el.classList.add("wrongFinal"));
      locked.add(currentTarget);
      pickNext();
    }, 520);
  }

  function showEndOverlay({ time, scorePercent, stamp }){
    const old = document.getElementById("endOverlay");
    if (old) old.remove();

    const wrap = document.createElement("div");
    wrap.id = "endOverlay";
    wrap.className = "start-overlay";
    wrap.innerHTML = `
      <div class="start-overlay__card" role="dialog" aria-modal="true" aria-label="Results">
        <div class="overlay__kicker">${GAME_KICKER}</div>
        <div class="overlay__title">${GAME_TITLE}</div>

        <div class="results-metrics">
          <div class="results-metric">
            <div class="results-label">SCORE</div>
            <div class="results-value">${scorePercent}</div>
          </div>

          <div class="results-metric">
            <div class="results-label">TIME</div>
            <div class="results-value">${time}</div>
          </div>
        </div>

        <div class="results-completed">
          Completed: ${stamp}
        </div>

        <div class="overlay__actions">
          <button class="begin-btn" id="playAgainBtn" type="button">Play Again</button>
        </div>

        <img class="overlay__logo" src="${LOGO_SRC}" alt="Middle School History logo" />
      </div>
    `;

    stageEl.appendChild(wrap);

    wrap.querySelector("#playAgainBtn").addEventListener("click", () => {
      wrap.remove();
      resetGame(true);
    });

    requestFit();
  }

  function endGame(){
    stopTimer();
    const elapsed = Date.now() - timerStart;

    const avg = totalPoints / ITEMS.length;
    const avgPercent = `${avg.toFixed(1)}%`;

    showEndOverlay({
      time: fmtTime(elapsed),
      scorePercent: avgPercent,
      stamp: new Date().toLocaleString()
    });

    hideCursorTip();
    document.body.classList.add("mc-overlay-up");
  }

  function resetGame(startImmediately=false){
    stopTimer();
    document.body.classList.remove("is-playing");
    document.body.classList.remove("mc-overlay-up");

    remaining = [];
    currentTarget = null;
    tries = 0;
    totalPoints = 0;
    locked = new Set();

    clearAllClasses();

    targetNameEl.textContent = "—";
    timerEl.textContent = "00:00.000";
    setFlagForCurrent();
    hideCursorTip();

    if (!startImmediately) overlay.classList.remove("is-hidden");

    if (startImmediately){
      overlay.classList.add("is-hidden");
      document.body.classList.add("is-playing");
      remaining = shuffle(ITEMS);
      pickNext();
      startTimer();
    }

    requestFit();
  }

  /* ---------------------------
     Click handling
     --------------------------- */
  function normalizeHit(e){
    const targetEl = (e.target && e.target.closest)
      ? e.target.closest("[id]")
      : null;

    if (!targetEl) return null;

    const raw = String(targetEl.id || "").toLowerCase();
    if (!raw) return null;

    // Always ignore default engine layers
    if (IGNORE.has(raw)) return null;

    // Alias if configured
    const normalized = (ALIASES[raw] ?? raw);

    // IMPORTANT ENGINE RULE:
    // Only IDs in ITEMS are eligible for scoring (wrong/correct).
    if (!ITEMS.includes(normalized)) return null;

    return { raw, normalized, el: targetEl };
  }

  function getVisualElForHit(hit){
    // Default: color the clicked element.
    // (If a future map wants border layers that alias but should not color,
    // it can list them in cfg.noColorOnHit: ["some_border_layer"])
    const noColor = new Set(cfg.noColorOnHit ?? []);
    if (noColor.has(hit.raw)) {
      // Return the main normalized element if possible; otherwise null
      return getElById(hit.normalized);
    }
    return hit.el;
  }

  mapBox.addEventListener("pointerdown", (e) => {
    const hit = normalizeHit(e);
    if (!hit) return;

    // Completed targets do nothing (no penalty)
    if (locked.has(hit.normalized)) return;

    // Only during play
    if (!document.body.classList.contains("is-playing")) return;

    // Correct
    if (hit.normalized === currentTarget){
      if (tries === 0){
        totalPoints += 100;
        forEachGroupEl(currentTarget, (el) => el.classList.add("correct1"));
      } else {
        totalPoints += 50;
        forEachGroupEl(currentTarget, (el) => el.classList.add("correct2"));
      }

      locked.add(currentTarget);
      pickNext();
      return;
    }

    // Wrong
    if (tries === 0){
      tempWrongEl = getVisualElForHit(hit);
      if (tempWrongEl){
        tempWrongEl.classList.add("tempWrong");
        tries = 1;
        try { tempWrongEl.setPointerCapture(e.pointerId); } catch(_) {}
      }
    } else {
      flashCorrectThenRed();
      tries = 0;
    }
  });

  mapBox.addEventListener("pointerup", () => {
    if (tempWrongEl){
      tempWrongEl.classList.remove("tempWrong");
      tempWrongEl = null;
    }
  });

  mapBox.addEventListener("pointercancel", () => {
    if (tempWrongEl){
      tempWrongEl.classList.remove("tempWrong");
      tempWrongEl = null;
    }
  });

  /* ---------------------------
     Mouse tracking for tooltip
     --------------------------- */
  mapBox.addEventListener("pointermove", (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    if (!canShowCursorTip()){
      hideCursorTip();
      return;
    }
    showCursorTip(lastMouseX, lastMouseY);
  });

  mapBox.addEventListener("pointerleave", () => hideCursorTip());

  window.addEventListener("scroll", () => {
    if (!canShowCursorTip()) hideCursorTip();
  }, { passive: true });

  /* ---------------------------
     Buttons + Spacebar
     --------------------------- */
  beginBtn.addEventListener("click", () => {
    const endOverlay = document.getElementById("endOverlay");
    if (endOverlay) endOverlay.remove();

    overlay.classList.add("is-hidden");
    document.body.classList.add("is-playing");
    document.body.classList.remove("mc-overlay-up");

    clearAllClasses();
    totalPoints = 0;

    locked = new Set();
    remaining = shuffle(ITEMS);
    pickNext();
    startTimer();

    requestFit();
  });

  resetBtn.addEventListener("click", () => resetGame(false));

  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space" && e.key !== " ") return;

    // Start overlay -> Begin
    if (!overlay.classList.contains("is-hidden")){
      e.preventDefault();
      beginBtn.click();
      return;
    }

    // End overlay -> Play Again
    const endOverlay = document.getElementById("endOverlay");
    if (endOverlay){
      const playAgainBtn = endOverlay.querySelector("#playAgainBtn");
      if (playAgainBtn){
        e.preventDefault();
        playAgainBtn.click();
      }
    }
  });

  /* ---------------------------
     SVG loader (NO dimension hardcoding)
     --------------------------- */
  async function loadSvg(){
    const res = await fetch(SVG_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error(`SVG fetch failed: ${res.status}`);
    const svgText = await res.text();

    mapBox.innerHTML = svgText;
    svgRoot = mapBox.querySelector("svg");
    if (!svgRoot) throw new Error("SVG root not found after injection.");

    // Force responsive sizing (still no hard-coded dimensions)
    svgRoot.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svgRoot.removeAttribute("width");
    svgRoot.removeAttribute("height");
    svgRoot.style.width = "100%";
    svgRoot.style.height = "100%";
    svgRoot.style.display = "block";

    // Auto aspect ratio from viewBox (this is the key "no cheating" part)
    const vb = svgRoot.getAttribute("viewBox");
    if (vb) {
      const parts = vb.trim().split(/\s+/).map(Number);
      if (parts.length === 4 && parts.every(n => Number.isFinite(n))) {
        const w = parts[2], h = parts[3];
        if (w > 0 && h > 0) {
          mapBox.style.setProperty("--map-ar", `${w} / ${h}`);
        }
      }
    }

    // Mark clickables
    markClickable();

    requestFit();
  }

  // Viewport listeners for scaling
  window.addEventListener("resize", requestFit, { passive: true });
  window.addEventListener("orientationchange", requestFit);

  if (window.visualViewport){
    window.visualViewport.addEventListener("resize", requestFit, { passive: true });
    window.visualViewport.addEventListener("scroll", requestFit, { passive: true });
  }

  // Boot
  document.body.classList.add("mc-overlay-up");
  loadSvg().catch(err => {
    console.error(err);
    mapBox.innerHTML = "<div style='padding:16px;color:#fff'>Could not load map SVG.</div>";
  });

  // Extra fits after header/footer includes shift layout
  requestFit();
  setTimeout(requestFit, 0);
  setTimeout(requestFit, 250);
})();
