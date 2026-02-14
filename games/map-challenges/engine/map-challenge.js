/* ============================================================
   Map Challenge Engine (Template)
   - Reads per-map settings from window.MAP_CHALLENGE_CONFIG
   - Injects SVG, runs the click challenge, shows overlay + results
   - Designed to be reused across map-challenge games (engine)
   ============================================================ */

(function () {
  "use strict";

  const CFG = window.MAP_CHALLENGE_CONFIG || {};

  // ----------------------------
  // Required config
  // ----------------------------
  const SVG_PATH = CFG.svgPath;
  const TARGETS = Array.isArray(CFG.targets) ? CFG.targets.map((s) => String(s).toLowerCase()) : [];

  if (!SVG_PATH || !TARGETS.length) {
    console.error("[map-challenge] Missing required config: svgPath and/or targets[]");
  }

  // ----------------------------
  // Optional config
  // ----------------------------
  const SHOW_FLAGS = !!CFG.showFlags;
  const FLAGS_BASE = CFG.flagsBase || "";
  const FLAG_EXT = CFG.flagExt || ".png"; // supports per-game override; defaults to .png
  const IGNORE_IDS = new Set((CFG.ignoreIds || []).map((s) => String(s).toLowerCase()));

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
      GROUPS[String(k).toLowerCase()] = Array.isArray(arr) ? arr.map((s) => String(s).toLowerCase()) : [];
    }
  }

  const EXTRA_IDS = Array.isArray(CFG.extraIds) ? CFG.extraIds.map((s) => String(s).toLowerCase()) : [];

  const DISPLAY_NAMES = {};
  if (CFG.displayNames && typeof CFG.displayNames === "object") {
    for (const [k, v] of Object.entries(CFG.displayNames)) {
      DISPLAY_NAMES[String(k).toLowerCase()] = String(v);
    }
  }

  const UI = CFG.ui || {};
  const LOGO_SRC = UI.logoSrc || "/assets/images/logo/MSHistory_Logo_Small.png";

  // Banner + overlay text
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
  const hudEl = document.querySelector(".hud");
  const mapBox = document.getElementById("mapBox");
  const overlay = document.getElementById("startOverlay");
  const beginBtn = document.getElementById("beginBtn");
  const resetBtn = document.getElementById("resetBtn");
  const targetNameEl = document.getElementById("targetName");
  const targetFlagEl = document.getElementById("targetFlag");
  const timerEl = document.getElementById("timer");
  const cursorTipEl = document.getElementById("cursorTip");

  // Text-bind targets in HTML
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
  let tries = 0; // 0 first attempt, 1 second attempt
  let totalPoints = 0;

  // completed targets should ignore clicks
  let locked = new Set();

  let timerStart = 0;
  let timerInt = null;

  // Auto-timeout (defaults to 60 minutes)
  let gameStartMs = 0;
  let timeoutInt = null;
  const AUTO_TIMEOUT_MINUTES = Number.isFinite(CFG.autoTimeoutMinutes) ? Number(CFG.autoTimeoutMinutes) : 60;

  // tooltip tracking
  let lastMouseX = 0;
  let lastMouseY = 0;

  // ----------------------------
  // HUD visibility helpers
  // ----------------------------
  function setHudVisible(isVisible) {
    // Better UX: hide Click/Timer/Reset any time an overlay is showing
    if (hudEl) {
      hudEl.style.visibility = isVisible ? "visible" : "hidden";
      hudEl.style.pointerEvents = isVisible ? "auto" : "none";
    }
  }

  function showStartOverlay() {
    if (overlay) overlay.classList.remove("is-hidden");
    document.body.classList.remove("is-playing");
    setHudVisible(false);
    requestFit(); // important: layout changed
  }

  function hideStartOverlay() {
    if (overlay) overlay.classList.add("is-hidden");
    document.body.classList.add("is-playing");
    setHudVisible(true);
    requestFit(); // important: layout changed
  }

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

    // Flags: ensure NO broken image on load
    if (targetFlagEl) {
      targetFlagEl.removeAttribute("src");
      targetFlagEl.src = "";
      targetFlagEl.alt = "";
      targetFlagEl.style.display = "none";
    }
  }

  // ----------------------------
  // Auto-fit scaling (standalone-style; Chromebook-safe)
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

    // Padding so it doesn't feel jammed to edges
    const padX = 16;
    const padY = 16;

    // rect.top is in layout viewport coords; if visualViewport is shifted, account for offsetTop
    const offsetTop = vv ? (vv.offsetTop || 0) : 0;
    const topInVisibleViewport = rect.top - offsetTop;

    const availableW = viewportW - padX * 2;
    const availableH = viewportH - topInVisibleViewport - padY;

    if (availableW <= 0 || availableH <= 0) {
      // fallback scale-down rather than breaking layout
      const scaleFallback = 0.85;
      stageEl.style.transformOrigin = "top center";
      stageEl.style.transform = `scale(${scaleFallback})`;
      stageEl.style.marginBottom = `${Math.round((1 - scaleFallback) * naturalH)}px`;
      return;
    }

    // Compute scale. Clamp minimum to keep it usable.
    const scale = Math.max(0.55, Math.min(1, availableW / naturalW, availableH / naturalH));

    stageEl.style.transformOrigin = "top center";
    stageEl.style.transform = `scale(${scale})`;

    // Reserve space so scaled stage doesn't overlap content below
    stageEl.style.marginBottom = `${Math.round((1 - scale) * naturalH)}px`;
  }

  // Debounced fit (prevents thrash while resizing)
  let fitRaf = 0;
  function requestFit() {
    if (fitRaf) cancelAnimationFrame(fitRaf);
    fitRaf = requestAnimationFrame(() => {
      fitRaf = 0;
      fitStageToViewport();
    });
  }

  // Same listeners as the standalone version (+ window scroll)
  window.addEventListener("resize", requestFit, { passive: true });
  window.addEventListener("orientationchange", requestFit);
  window.addEventListener("scroll", requestFit, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", requestFit, { passive: true });
    window.visualViewport.addEventListener("scroll", requestFit, { passive: true });
  }

  // One extra: after the whole page (fonts/images) is ready
  window.addEventListener(
    "load",
    () => {
      requestFit();
      setTimeout(requestFit, 0);
      setTimeout(requestFit, 250);
    },
    { passive: true }
  );

  // ----------------------------
  // Utilities
  // ----------------------------
  function cssEsc(id) {
    // CSS.escape may not exist on older Chromebooks
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(id);
    return String(id).replace(/[^\w-]/g, "\\$&");
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function displayNameFor(id) {
    const k = String(id).toLowerCase();
    return DISPLAY_NAMES[k] || prettifyId(k);
  }

  function prettifyId(id) {
    return String(id)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // ----------------------------
  // Cursor tooltip (optional)
  // ----------------------------
  function showCursorTip(text) {
    if (!cursorTipEl) return;
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
  // Flags
  // ----------------------------
  function clearFlag() {
    if (!targetFlagEl) return;
    targetFlagEl.onload = null;
    targetFlagEl.onerror = null;
    targetFlagEl.src = "";
    targetFlagEl.alt = "";
    targetFlagEl.style.display = "none";
  }

  function setFlagForCurrent() {
    if (!targetFlagEl) return;

    if (!SHOW_FLAGS || !currentTarget) {
      clearFlag();
      return;
    }

    const src = `${FLAGS_BASE}${currentTarget}${FLAG_EXT}`;

    // Hide by default so we never show a broken placeholder
    targetFlagEl.style.display = "none";
    targetFlagEl.alt = `${displayNameFor(currentTarget)} flag`;

    // Set handlers BEFORE src to catch fast cache outcomes
    targetFlagEl.onload = () => {
      targetFlagEl.style.display = "inline-block";
    };

    targetFlagEl.onerror = () => {
      // Hide cleanly if missing/mismatched
      targetFlagEl.style.display = "none";
      targetFlagEl.src = "";
      targetFlagEl.alt = "";
    };

    targetFlagEl.src = src;
  }

  // ----------------------------
  // Prompt
  // ----------------------------
  function updatePrompt() {
    if (targetNameEl) {
      targetNameEl.textContent = currentTarget ? displayNameFor(currentTarget) : "";
    }
    setFlagForCurrent();
  }

  // ----------------------------
  // SVG helpers
  // ----------------------------
  function forEachGroupEl(targetId, fn) {
    if (!svgRoot) return;
    const baseId = String(targetId).toLowerCase();

    const ids = new Set([baseId]);
    if (GROUPS[baseId]) GROUPS[baseId].forEach((x) => ids.add(String(x).toLowerCase()));

    for (const id of ids) {
      const el = svgRoot.getElementById ? svgRoot.getElementById(id) : svgRoot.querySelector(`#${cssEsc(id)}`);
      if (el) fn(el);
    }
  }

  function clearAllTargetClasses() {
    if (!svgRoot) return;

    const allIds = new Set([...TARGETS, ...EXTRA_IDS]);
    for (const id of allIds) {
      forEachGroupEl(id, (el) => {
        el.classList.remove("correct1", "correct2", "tempWrong", "wrongFinal", "blink");
      });
    }
  }

  function buildClickableSelector() {
    const all = new Set();

    for (const id of TARGETS) all.add(`#${cssEsc(id)}`);
    for (const id of EXTRA_IDS) all.add(`#${cssEsc(id)}`);
    for (const id of IGNORE_IDS) all.add(`#${cssEsc(id)}`);

    // include alias keys so clicks on those can be normalized
    for (const k of Object.keys(ALIAS)) {
      all.add(`#${cssEsc(k)}`);
    }

    return Array.from(all).join(",");
  }

  function normalizeClickedId(e) {
    if (!svgRoot) return null;

    const selector = buildClickableSelector();
    const targetEl = e.target && e.target.closest ? e.target.closest(selector) : null;
    if (!targetEl) return null;

    const raw = String(targetEl.id).toLowerCase();
    if (!raw) return null;

    if (IGNORE_IDS.has(raw)) return null;

    const normalized = (ALIAS[raw] ?? raw).toLowerCase();
    if (!TARGETS.includes(normalized)) return null;

    return { raw, normalized, el: targetEl };
  }

  // ----------------------------
  // Marking / feedback
  // ----------------------------
  function flashWrong(hit) {
    if (!hit || !hit.el) return;
    const el = hit.el;
    el.classList.add("tempWrong", "blink");
    setTimeout(() => el.classList.remove("blink"), 250);
    setTimeout(() => el.classList.remove("tempWrong"), 450);
  }

  function markCorrect(targetId, attemptNumber) {
    const cls = attemptNumber === 1 ? "correct1" : "correct2";
    forEachGroupEl(targetId, (el) => {
      el.classList.remove("tempWrong", "wrongFinal", "blink");
      el.classList.add(cls);
    });
  }

  function markFinalWrong(targetId) {
    forEachGroupEl(targetId, (el) => {
      el.classList.remove("tempWrong");
      el.classList.add("wrongFinal", "blink");
      setTimeout(() => el.classList.remove("blink"), 400);
    });
  }

  // ----------------------------
  // Timer
  // ----------------------------
  function fmtTime(ms) {
    const total = Math.max(0, ms);
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    const millis = Math.floor(total % 1000);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
  }

  function stopTimer() {
    if (timerInt) clearInterval(timerInt);
    timerInt = null;
  }

  function startTimer() {
    stopTimer();
    timerStart = performance.now();
    if (timerEl) timerEl.textContent = "00:00.000";
    timerInt = setInterval(() => {
      if (!timerEl) return;
      const now = performance.now();
      timerEl.textContent = fmtTime(now - timerStart);
    }, 33);
  }

  // ----------------------------
  // Auto-timeout
  // ----------------------------
  function stopTimeout() {
    if (timeoutInt) clearInterval(timeoutInt);
    timeoutInt = null;
  }

  function startTimeout() {
    stopTimeout();
    gameStartMs = Date.now();
    timeoutInt = setInterval(() => {
      const elapsedMin = (Date.now() - gameStartMs) / 60000;
      if (elapsedMin >= AUTO_TIMEOUT_MINUTES) {
        stopTimeout();
        endGame(true);
      }
    }, 1000);
  }

  // ----------------------------
  // Game flow
  // ----------------------------
  function pickNext() {
    tries = 0;

    if (!remaining.length) {
      endGame(false);
      return;
    }

    currentTarget = remaining.pop();
    updatePrompt();
  }

  function endGame(isTimeout) {
    document.body.classList.remove("is-playing");
    setHudVisible(false);

    stopTimer();
    stopTimeout();

    // remove existing end overlay first
    const existing = document.getElementById("endOverlay");
    if (existing) existing.remove();

    const end = document.createElement("div");
    end.id = "endOverlay";
    end.className = "end-overlay";
    end.setAttribute("aria-label", "End overlay");

    const elapsed = timerStart ? performance.now() - timerStart : 0;
    const timeText = fmtTime(elapsed);

    end.innerHTML = `
      <div class="end-overlay__card">
        <div class="end-overlay__title">${isTimeout ? "Time's Up!" : "Finished!"}</div>
        <div class="end-overlay__stats">
          <div class="stat"><b>Time:</b> ${escapeHtml(timeText)}</div>
          <div class="stat"><b>Points:</b> ${escapeHtml(String(totalPoints))}</div>
        </div>
        <div class="end-overlay__actions">
          <button class="begin-btn" id="playAgainBtn" type="button">Play Again</button>
        </div>
      </div>
    `;

    document.body.appendChild(end);

    const playAgainBtn = document.getElementById("playAgainBtn");
    playAgainBtn?.addEventListener("click", () => {
      end.remove();
      resetGame(true);
    });

    requestFit();
    setTimeout(requestFit, 0);
    setTimeout(requestFit, 250);
  }

  function resetGame(startImmediately) {
    stopTimer();
    stopTimeout();

    currentTarget = null;
    tries = 0;
    totalPoints = 0;
    locked = new Set();

    remaining = shuffle(TARGETS);

    clearAllTargetClasses();
    clearFlag();

    // Clear prompt text
    if (targetNameEl) targetNameEl.textContent = "";

    const endOverlay = document.getElementById("endOverlay");
    if (endOverlay) endOverlay.remove();

    if (startImmediately) {
      hideStartOverlay();
      pickNext();
      startTimer();
      startTimeout();
    } else {
      showStartOverlay();
      clearFlag();
    }

    requestFit();
    setTimeout(requestFit, 0);
    setTimeout(requestFit, 250);
  }

  // ----------------------------
  // SVG injection
  // ----------------------------
  async function loadSvg() {
    if (!mapBox) return;

    const res = await fetch(SVG_PATH, { cache: "no-store" });
    const svgText = await res.text();

    mapBox.innerHTML = svgText;

    svgRoot = mapBox.querySelector("svg");
    if (!svgRoot) {
      console.error("[map-challenge] SVG did not load correctly.");
      return;
    }

    // Remove all <title> elements so hovering does NOT reveal names
    svgRoot.querySelectorAll("title").forEach((t) => t.remove());

    // ensure injected svg doesn't steal focus outlines weirdly
    svgRoot.setAttribute("focusable", "false");

    // start clean (overlay visible)
    resetGame(false);

    // Bind pointer events
    bindSvgEvents();

    requestFit();
    setTimeout(requestFit, 0);
    setTimeout(requestFit, 250);
  }

  function bindSvgEvents() {
    if (!svgRoot) return;

    // Tooltip follows cursor
    svgRoot.addEventListener(
      "mousemove",
      (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        if (cursorTipEl && cursorTipEl.classList.contains("is-on")) {
          cursorTipEl.style.left = `${lastMouseX + 12}px`;
          cursorTipEl.style.top = `${lastMouseY + 12}px`;
        }
      },
      { passive: true }
    );

    // Hover tooltip: do NOT reveal hovered name (prevents giving answers)
    // If you want a tooltip, show the current target instead.
    svgRoot.addEventListener("pointerover", (e) => {
      const hit = normalizeClickedId(e);
      if (!hit) return;
      if (!document.body.classList.contains("is-playing")) return;
      if (locked.has(hit.normalized)) return;

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
        flashWrong(hit); // quick red flash
        tries = 1; // second chance
        return;
      }

      // second wrong => finalize
      flashWrong(hit); // flash what they clicked
      locked.add(currentTarget);
      markFinalWrong(currentTarget); // mark correct target red
      pickNext();
    });
  }

  // ----------------------------
  // Start / Reset / Keyboard
  // ----------------------------
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      // if an end overlay exists, remove it
      const endOverlay = document.getElementById("endOverlay");
      if (endOverlay) endOverlay.remove();

      resetGame(true);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => resetGame(false));
  }

  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space" && e.key !== " ") return;

    // space starts game if start overlay is visible
    if (overlay && !overlay.classList.contains("is-hidden")) {
      e.preventDefault();
      beginBtn?.click();
      return;
    }

    // space plays again if end overlay exists
    const endOverlay = document.getElementById("endOverlay");
    if (endOverlay) {
      const playAgainBtn = document.getElementById("playAgainBtn");
      if (playAgainBtn) {
        e.preventDefault();
        playAgainBtn.click();
      }
    }
  });

  // ----------------------------
  // Boot
  // ----------------------------
  applyUiText();
  // On initial page load, overlay is visible -> hide HUD
  setHudVisible(false);
  loadSvg().catch((err) => console.error("[map-challenge] SVG load error:", err));
})();
