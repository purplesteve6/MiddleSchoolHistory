/* ============================================================
   Map Challenge Engine (Template)
   - Reads per-map settings from window.MAP_CHALLENGE_CONFIG
   - Injects SVG, runs the click challenge, shows overlay + results
   - Designed to be copied to new folders with ONLY config.js changed
   ============================================================ */

(function () {
  "use strict";

  const CFG = window.MAP_CHALLENGE_CONFIG || {};

  // ----------------------------
  // Required config
  // ----------------------------
  const SVG_PATH = CFG.svgPath;
  const TARGETS = Array.isArray(CFG.targets) ? CFG.targets.map(s => String(s).toLowerCase()) : [];

  if (!SVG_PATH || !TARGETS.length) {
    console.error("[map-challenge] Missing required config: svgPath and/or targets[]");
  }

  // ----------------------------
  // Optional config
  // ----------------------------
  const SHOW_FLAGS = !!CFG.showFlags;
  const FLAGS_BASE = CFG.flagsBase || "";
  const IGNORE_IDS = new Set((CFG.ignoreIds || []).map(s => String(s).toLowerCase()));

  // Aliases: clicking one ID counts as another (e.g., gaza -> israel)
  const ALIAS = {};
  if (CFG.alias && typeof CFG.alias === "object") {
    for (const [k, v] of Object.entries(CFG.alias)) {
      ALIAS[String(k).toLowerCase()] = String(v).toLowerCase();
    }
  }

  // Groups: when a target is correct/wrong, apply styles to multiple SVG IDs
  const GROUPS = {};
  if (CFG.groups && typeof CFG.groups === "object") {
    for (const [k, arr] of Object.entries(CFG.groups)) {
      GROUPS[String(k).toLowerCase()] = Array.isArray(arr) ? arr.map(s => String(s).toLowerCase()) : [];
    }
  }

  const EXTRA_IDS = Array.isArray(CFG.extraIds) ? CFG.extraIds.map(s => String(s).toLowerCase()) : [];

  const DISPLAY_NAMES = {};
  if (CFG.displayNames && typeof CFG.displayNames === "object") {
    for (const [k, v] of Object.entries(CFG.displayNames)) {
      DISPLAY_NAMES[String(k).toLowerCase()] = String(v);
    }
  }

  const UI = CFG.ui || {};
  const LOGO_SRC = UI.logoSrc || "/assets/images/logo/MSHistory_Logo_Small.png";

  // Banner + overlay text (easy edits)
  const BANNER_TITLE = UI.bannerTitle || "MAP CHALLENGE";
  const BANNER_ARIA = UI.bannerAria || "Map Challenge banner";
  const MAIN_ARIA = UI.mainAria || "Map challenge";
  const MAP_ARIA = UI.mapAria || "Map";

  const OVERLAY_KICKER = UI.overlayKicker || "MAP CHALLENGE";
  const OVERLAY_TITLE = UI.overlayTitle || "MAP CHALLENGE";
  const BEGIN_MESSAGE = UI.beginMessage || "Click the regions as fast as you can!";

  // ----------------------------
  // DOM
  // ----------------------------
  const stageEl = document.querySelector(".map-stage");
  const mapBox = document.getElementById("mapBox");
  const overlay = document.getElementById("startOverlay");
  const beginBtn = document.getElementById("beginBtn");
  const resetBtn = document.getElementById("resetBtn");
  const targetNameEl = document.getElementById("targetName");
  const targetFlagEl = document.getElementById("targetFlag");
  const timerEl = document.getElementById("timer");
  const cursorTipEl = document.getElementById("cursorTip");

  // Text-bind targets in HTML (template-friendly)
  const bannerTitleEl = document.getElementById("bannerTitle");
  const bannerBandEl = document.getElementById("challengeBand");
  const mainEl = document.getElementById("challengeMain");
  const overlayKickerEl = document.getElementById("overlayKicker");
  const overlayTitleEl = document.getElementById("overlayTitle");
  const overlayBodyEl = document.getElementById("overlayBody");
  const overlayLogoEl = document.getElementById("overlayLogo");

  // ----------------------------
  // Internal state
  // ----------------------------
  let svgRoot = null;

  let remaining = [];
  let currentTarget = null;
  let tries = 0;        // 0 = first attempt, 1 = second attempt
  let totalPoints = 0;  // 100 points first try, 50 points second try, 0 if missed twice

  // completed targets should ignore clicks
  let locked = new Set();

  let timerStart = 0;
  let timerInt = null;

  // pointer-down temporary red
  

  let lastMouseX = 0;
  let lastMouseY = 0;

  // ----------------------------
  // Template text injection
  // ----------------------------
  function applyUiText() {
    if (bannerTitleEl) bannerTitleEl.textContent = BANNER_TITLE;
    if (bannerBandEl) bannerBandEl.setAttribute("aria-label", BANNER_ARIA);
    if (mainEl) mainEl.setAttribute("aria-label", MAIN_ARIA);
    if (mapBox) mapBox.setAttribute("aria-label", MAP_ARIA);

    if (overlayKickerEl) overlayKickerEl.textContent = OVERLAY_KICKER;
    if (overlayTitleEl) overlayTitleEl.textContent = OVERLAY_TITLE;
    if (overlayBodyEl) overlayBodyEl.textContent = BEGIN_MESSAGE;

    if (overlayLogoEl) {
      overlayLogoEl.src = LOGO_SRC;
      overlayLogoEl.alt = "Middle School History logo";
    }

    // Flags (hide by default unless enabled)
    if (targetFlagEl) {
      if (!SHOW_FLAGS) {
        targetFlagEl.style.display = "none";
      }
    }
  }

  // ----------------------------
  // Auto-fit scaling (Chromebook-safe)
  // ----------------------------
  function fitStageToViewport() {
    if (!stageEl) return;

    const vv = window.visualViewport;

    const viewportW = vv ? vv.width : document.documentElement.clientWidth;
    const viewportH = vv ? vv.height : document.documentElement.clientHeight;

    if (!viewportW || !viewportH) return;

    // temporarily remove scaling so we can measure natural size
    const prevTransform = stageEl.style.transform;
    const prevOrigin = stageEl.style.transformOrigin;
    const prevMB = stageEl.style.marginBottom;

    stageEl.style.transform = "none";
    stageEl.style.transformOrigin = "top center";
    stageEl.style.marginBottom = "0px";

    const rect = stageEl.getBoundingClientRect();
    const naturalW = rect.width;
    const naturalH = rect.height;

    if (!naturalW || !naturalH) {
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

    if (availableW <= 0 || availableH <= 0) {
      const scaleFallback = 0.85;
      stageEl.style.transformOrigin = "top center";
      stageEl.style.transform = `scale(${scaleFallback})`;
      stageEl.style.marginBottom = `${Math.round((1 - scaleFallback) * naturalH)}px`;
      return;
    }

    const scale = Math.max(0.55, Math.min(1, availableW / naturalW, availableH / naturalH));

    stageEl.style.transformOrigin = "top center";
    stageEl.style.transform = `scale(${scale})`;
    stageEl.style.marginBottom = `${Math.round((1 - scale) * naturalH)}px`;
  }

  let fitRAF = 0;
  function requestFit() {
    if (fitRAF) cancelAnimationFrame(fitRAF);
    fitRAF = requestAnimationFrame(() => {
      fitRAF = 0;
      fitStageToViewport();
    });
  }

  // ----------------------------
  // Helpers
  // ----------------------------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function fmtTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
  }

  function startTimer() {
    stopTimer();
    timerStart = Date.now();
    if (timerEl) timerEl.textContent = "00:00.000";
    timerInt = setInterval(() => {
      if (timerEl) timerEl.textContent = fmtTime(Date.now() - timerStart);
    }, 31);
  }

  function stopTimer() {
    if (timerInt) clearInterval(timerInt);
    timerInt = null;
  }

  function displayNameFor(id) {
    const key = String(id).toLowerCase();
    const base = (DISPLAY_NAMES[key] ?? key.replaceAll("_", " ")).trim();
    // Title case-ish
    return base.replace(/\b\w/g, ch => ch.toUpperCase());
  }

    const FLAG_EXT = CFG.flagExt || ".jpg";

  function flagSrcFor(id) {
    return `${FLAGS_BASE}${id}${FLAG_EXT}`;
  }



  function setFlagForCurrent() {
    if (!targetFlagEl) return;
    if (!SHOW_FLAGS) {
      targetFlagEl.style.display = "none";
      return;
    }

    if (!currentTarget) {
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

  function setPrompt() {
    if (!targetNameEl) return;

    if (!currentTarget) {
      targetNameEl.textContent = "Done!";
      setFlagForCurrent();
      return;
    }

    targetNameEl.textContent = displayNameFor(currentTarget);
    setFlagForCurrent();
  }

  function getElById(id) {
    if (!svgRoot) return null;
    return svgRoot.querySelector(`#${CSS.escape(id)}`);
  }

  function forEachGroupEl(targetId, fn) {
    const key = String(targetId).toLowerCase();
    const group = GROUPS[key];
    if (group && group.length) {
      group.forEach(id => {
        const el = getElById(id);
        if (el) fn(el, id);
      });
      return;
    }
    const el = getElById(key);
    if (el) fn(el, key);
  }

 // Wrong-click feedback: quick red flash (Middle East style)
function flashWrong(hit) {
  const visualEl = getVisualElForHit(hit);
  if (!visualEl) return;

  // Clear any previous flash state
  visualEl.classList.remove("tempWrong");
 

  visualEl.classList.add("tempWrong");
  setTimeout(() => {
    visualEl.classList.remove("tempWrong");
  }, 120);
}

  // If you ever need “raw click counts as X but don’t color raw layer” logic
  // you can implement it by customizing groups/alias/extraIds in config.
  function getVisualElForHit(hit) {
    if (!hit) return null;
    return hit.el;
  }

  function clearAllTargetClasses() {
    if (!svgRoot) return;
    const allIds = TARGETS.concat(EXTRA_IDS);
    for (const id of allIds) {
      const el = getElById(id);
      if (el) el.classList.remove("correct1", "correct2", "wrongFinal", "blink", "tempWrong");
    }
  }

  function canShowCursorTip() {
    if (!document.body.classList.contains("is-playing")) return false;
    if (!cursorTipEl) return false;
    if (!svgRoot) return false;
    return true;
  }

  function showCursorTip(text) {
    if (!canShowCursorTip()) return;
    cursorTipEl.textContent = text;
    cursorTipEl.classList.add("is-on");
    cursorTipEl.style.left = `${lastMouseX + 12}px`;
    cursorTipEl.style.top = `${lastMouseY + 12}px`;
  }

  function hideCursorTip() {
    if (!cursorTipEl) return;
    cursorTipEl.classList.remove("is-on");
  }

  // ----------------------------
  // Game flow
  // ----------------------------
  function pickNext() {
    tries = 0;
    currentTarget = remaining.shift() || null;
    setPrompt();

    if (!currentTarget) {
      stopTimer();
      showEndOverlay();
    }
  }

  function scoreMax() {
  // 100 points each (perfect game = TARGETS.length * 100)
  return TARGETS.length * 100;
}


  function showEndOverlay() {
    const elapsed = Date.now() - timerStart;
    const percent = scoreMax() ? ((totalPoints / scoreMax()) * 100) : 0;


    // Remove existing end overlay if present
    const existing = document.getElementById("endOverlay");
    if (existing) existing.remove();

    const end = document.createElement("div");
    end.className = "start-overlay";
    end.id = "endOverlay";
    end.setAttribute("aria-label", "Results overlay");

    end.innerHTML = `
      <div class="start-overlay__card">
        <div class="overlay__kicker">${escapeHtml(OVERLAY_KICKER)}</div>
        <div class="overlay__title">${escapeHtml(OVERLAY_TITLE)}</div>

        <div class="results-metrics" aria-label="Results metrics">

  <div class="results-metric">
    <div class="results-label">SCORE</div>
    <div class="results-value">${percent.toFixed(1)}%</div>
  </div>
  <div class="results-metric">
    <div class="results-label">TIME</div>
    <div class="results-value">${fmtTime(elapsed)}</div>
  </div>
</div>

<div class="results-completed">Completed: ${new Date().toLocaleString()}</div>



        <div class="overlay__actions">
          <button class="begin-btn" id="playAgainBtn" type="button">Play Again</button>
        </div>

        <img class="overlay__logo"
             src="${escapeAttr(LOGO_SRC)}"
             alt="Middle School History logo" />
      </div>
    `;

    (stageEl || document.body).appendChild(end);


    const playAgainBtn = end.querySelector("#playAgainBtn");
    playAgainBtn?.addEventListener("click", () => {
      end.remove();
      resetGame(true);
    });
  }

function resetGame(startImmediately) {
  // ✅ Stop any running clock interval immediately
  stopTimer();

  locked = new Set();
  remaining = [];
  currentTarget = null;
  tries = 0;
  totalPoints = 0;

  clearAllTargetClasses();

  if (timerEl) timerEl.textContent = "00:00.000";


  if (targetFlagEl) {
    targetFlagEl.style.display = "none";
    targetFlagEl.src = "";
    targetFlagEl.alt = "";
    if (SHOW_FLAGS) targetFlagEl.style.display = "inline-block";
    if (!SHOW_FLAGS) targetFlagEl.style.display = "none";
  }

  hideCursorTip();

  // ✅ IMPORTANT: Always exit playing state on reset
  document.body.classList.remove("is-playing");

  if (overlay && !startImmediately) overlay.classList.remove("is-hidden");

  if (startImmediately) {
    if (overlay) overlay.classList.add("is-hidden");
    document.body.classList.add("is-playing");
    remaining = shuffle(TARGETS);
    pickNext();
    startTimer();
  }

  requestFit();
}


  // ----------------------------
  // SVG loading + hit testing
  // ----------------------------
  async function loadSvg() {
    if (!mapBox) return;
    const res = await fetch(SVG_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error(`[map-challenge] Failed to fetch SVG: ${SVG_PATH} (HTTP ${res.status})`);

    const svgText = await res.text();
mapBox.innerHTML = svgText;

svgRoot = mapBox.querySelector("svg");
if (!svgRoot) throw new Error("[map-challenge] SVG root not found after injection");

// ✅ Remove all <title> elements so hovering does NOT reveal town names
svgRoot.querySelectorAll("title").forEach(t => t.remove());

// ensure injected svg doesn't steal focus outlines weirdly
svgRoot.setAttribute("focusable", "false");


    // start clean
    resetGame(false);

    // Bind pointer events
    bindSvgEvents();

    requestFit();
  }

  function buildClickableSelector() {
    const all = new Set();

    for (const id of TARGETS) all.add(`#${cssEsc(id)}`);
    for (const id of EXTRA_IDS) all.add(`#${cssEsc(id)}`);
    for (const id of IGNORE_IDS) all.add(`#${cssEsc(id)}`);

    // Also include alias keys so clicks on those can be normalized
    for (const k of Object.keys(ALIAS)) {
      all.add(`#${cssEsc(k)}`);
    }

    return Array.from(all).join(",");
  }

  function normalizeClickedId(e) {
    if (!svgRoot) return null;

    const selector = buildClickableSelector();
    const targetEl = (e.target && e.target.closest) ? e.target.closest(selector) : null;
    if (!targetEl) return null;

    const raw = String(targetEl.id).toLowerCase();
    if (!raw) return null;

    if (IGNORE_IDS.has(raw)) return null;

    const normalized = (ALIAS[raw] ?? raw).toLowerCase();
    if (!TARGETS.includes(normalized)) return null;

    return { raw, normalized, el: targetEl };
  }

  function markCorrect(targetId, attemptNumber) {
    // attemptNumber: 1 -> first try (green), 2 -> second try (yellow)
    const cls = attemptNumber === 1 ? "correct1" : "correct2";
    forEachGroupEl(targetId, el => {
      el.classList.remove("tempWrong", "wrongFinal");
      el.classList.add(cls, "blink");
      setTimeout(() => el.classList.remove("blink"), 400);
    });
  }

  function markFinalWrong(targetId) {
    forEachGroupEl(targetId, el => {
      el.classList.remove("tempWrong");
      el.classList.add("wrongFinal", "blink");
      setTimeout(() => el.classList.remove("blink"), 400);
    });
  }

  function bindSvgEvents() {
    if (!svgRoot) return;

    // Tooltip follows cursor
    svgRoot.addEventListener("mousemove", (e) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      if (cursorTipEl && cursorTipEl.classList.contains("is-on")) {
        cursorTipEl.style.left = `${lastMouseX + 12}px`;
        cursorTipEl.style.top = `${lastMouseY + 12}px`;
      }
    }, { passive: true });

    // Hover tooltip: do NOT reveal hovered name (prevents giving answers)
// If you want a tooltip, show the current target instead.
svgRoot.addEventListener("pointerover", (e) => {
  const hit = normalizeClickedId(e);
  if (!hit) return;
  if (!document.body.classList.contains("is-playing")) return;
  if (locked.has(hit.normalized)) return;

  // Show the prompt target, not the hovered region
  if (currentTarget) showCursorTip(displayNameFor(currentTarget));
});

    svgRoot.addEventListener("pointerout", () => {
      hideCursorTip();
    });

   


    // click: main game logic
    svgRoot.addEventListener("click", (e) => {
      const hit = normalizeClickedId(e);
      if (!hit) return;

      const clicked = hit.normalized;

      if (!document.body.classList.contains("is-playing")) return;
      if (!currentTarget) return;
      if (locked.has(clicked)) return;

      if (clicked === currentTarget) {
  // correct
  if (tries === 0) {
    totalPoints += 100;
    markCorrect(currentTarget, 1);
  } else {
    totalPoints += 50;
    markCorrect(currentTarget, 2);
  }

  locked.add(currentTarget);
  pickNext();
  return;
}


      // wrong
if (tries === 0) {
  flashWrong(hit);     // ✅ quick red flash
  tries = 1;           // second chance
  return;
}


      // second wrong => finalize
      locked.add(currentTarget);
      markFinalWrong(currentTarget);
      pickNext();
    });
  }

  // ----------------------------
  // Start / Reset / Keyboard
  // ----------------------------
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      const endOverlay = document.getElementById("endOverlay");
      if (endOverlay) endOverlay.remove();

      if (overlay) overlay.classList.add("is-hidden");
      document.body.classList.add("is-playing");

      clearAllTargetClasses();
      totalPoints = 0;

      locked = new Set();
      remaining = shuffle(TARGETS);
      pickNext();
      startTimer();

      requestFit();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => resetGame(false));
  }

  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space" && e.key !== " ") return;

    if (overlay && !overlay.classList.contains("is-hidden")) {
      e.preventDefault();
      beginBtn?.click();
      return;
    }

    const endOverlay = document.getElementById("endOverlay");
    if (endOverlay) {
      const playAgainBtn = endOverlay.querySelector("#playAgainBtn");
      if (playAgainBtn) {
        e.preventDefault();
        playAgainBtn.click();
      }
    }
  });

  window.addEventListener("resize", requestFit, { passive: true });
  window.addEventListener("orientationchange", requestFit);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", requestFit, { passive: true });
    window.visualViewport.addEventListener("scroll", requestFit, { passive: true });
  }

  // ----------------------------
  // Boot
  // ----------------------------
  applyUiText();

  loadSvg().catch(err => {
    console.error(err);
    if (mapBox) mapBox.innerHTML = "<div style='padding:16px;color:#fff'>Could not load map SVG.</div>";
  });

  requestFit();
  setTimeout(requestFit, 0);
  setTimeout(requestFit, 250);

  // ----------------------------
  // Small utilities
  // ----------------------------
  function cssEsc(s) {
    try { return CSS.escape(String(s)); }
    catch { return String(s).replace(/[^a-z0-9_-]/gi, "\\$&"); }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function escapeAttr(str) {
    // good enough for URLs in our own config
    return String(str).replace(/"/g, "&quot;");
  }
})();
