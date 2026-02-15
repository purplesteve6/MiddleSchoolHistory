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
  const FLAG_EXT = CFG.flagExt || ".png";
  const IGNORE_IDS = new Set((CFG.ignoreIds || []).map((s) => String(s).toLowerCase()));

  const ALIAS = {};
  if (CFG.alias && typeof CFG.alias === "object") {
    for (const [k, v] of Object.entries(CFG.alias)) {
      ALIAS[String(k).toLowerCase()] = String(v).toLowerCase();
    }
  }

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

  // Optional text targets (safe if missing)
  const overlayKickerEl = document.getElementById("overlayKicker");
  const overlayTitleEl = document.getElementById("overlayTitle");
  const overlayBodyEl = document.getElementById("overlayBody");
  const overlayLogoEl = document.getElementById("overlayLogo");

  // ----------------------------
  // State
  // ----------------------------
  let svgRoot = null;

  let remaining = [];
  let currentTarget = null;
  let tries = 0; // 0 = first try, 1 = second try
  let totalPoints = 0;
  let locked = new Set();

  let timerStart = 0;
  let timerInt = null;

  // tooltip tracking
  let lastMouseX = 0;
  let lastMouseY = 0;

  // ----------------------------
  // HUD visibility (hide when overlay is up)
  // ----------------------------
  function setHudVisible(isVisible) {
    if (!hudEl) return;
    hudEl.style.visibility = isVisible ? "visible" : "hidden";
    hudEl.style.pointerEvents = isVisible ? "auto" : "none";
  }

  function showStartOverlay() {
    if (overlay) overlay.classList.remove("is-hidden");
    document.body.classList.remove("is-playing");
    setHudVisible(false);
    requestFit();
  }

  function hideStartOverlay() {
    if (overlay) overlay.classList.add("is-hidden");
    document.body.classList.add("is-playing");
    setHudVisible(true);
    requestFit();
  }

  // ----------------------------
  // Text injection for start overlay (optional)
  // ----------------------------
  function applyUiText() {
    if (overlayKickerEl) overlayKickerEl.textContent = OVERLAY_KICKER;
    if (overlayTitleEl) overlayTitleEl.textContent = OVERLAY_TITLE;
    if (overlayBodyEl) overlayBodyEl.textContent = BEGIN_MESSAGE;
    if (overlayLogoEl) {
      overlayLogoEl.src = LOGO_SRC;
      overlayLogoEl.alt = "Middle School History logo";
    }

    // ensure flag starts hidden (no broken placeholder)
    if (targetFlagEl) {
      targetFlagEl.removeAttribute("src");
      targetFlagEl.src = "";
      targetFlagEl.alt = "";
      targetFlagEl.style.display = "none";
    }
  }

  // ----------------------------
  // Resize / fit (your original “perfect” stage scaling)
  // ----------------------------
  function fitStageToViewport() {
    if (!stageEl) return;

    const vv = window.visualViewport;
    const viewportW = vv ? vv.width : document.documentElement.clientWidth;
    const viewportH = vv ? vv.height : document.documentElement.clientHeight;
    if (!viewportW || !viewportH) return;

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

  let fitRaf = 0;
  function requestFit() {
    if (fitRaf) cancelAnimationFrame(fitRaf);
    fitRaf = requestAnimationFrame(() => {
      fitRaf = 0;
      fitStageToViewport();
    });
  }

  window.addEventListener("resize", requestFit, { passive: true });
  window.addEventListener("orientationchange", requestFit);
  window.addEventListener("scroll", requestFit, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", requestFit, { passive: true });
    window.visualViewport.addEventListener("scroll", requestFit, { passive: true });
  }

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

  function prettifyId(id) {
    return String(id)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function displayNameFor(id) {
    const k = String(id).toLowerCase();
    return DISPLAY_NAMES[k] || prettifyId(k);
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
  // Tooltip (optional)
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

    targetFlagEl.style.display = "none";
    targetFlagEl.alt = `${displayNameFor(currentTarget)} flag`;

    targetFlagEl.onload = () => {
      targetFlagEl.style.display = "inline-block";
    };

    targetFlagEl.onerror = () => {
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
    const label = currentTarget ? displayNameFor(currentTarget) : "";

    if (targetNameEl) targetNameEl.textContent = label;
    setFlagForCurrent();

    // NEW: if the cursor tooltip is already showing, refresh it immediately
    if (cursorTipEl && cursorTipEl.classList.contains("is-on")) {
      if (label) showCursorTip(label);
      else hideCursorTip();
    }
  }


  // ----------------------------
  // SVG helpers (groups)
  // ----------------------------
  function forEachGroupEl(targetId, fn) {
    if (!svgRoot) return;
    const baseId = String(targetId).toLowerCase();

    const ids = new Set([baseId]);
    if (GROUPS[baseId]) GROUPS[baseId].forEach((x) => ids.add(String(x).toLowerCase()));

    for (const id of ids) {
      const el = svgRoot.getElementById
        ? svgRoot.getElementById(id)
        : svgRoot.querySelector(`#${cssEsc(id)}`);
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
    for (const k of Object.keys(ALIAS)) all.add(`#${cssEsc(k)}`);
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
  // Marking / feedback classes
  // ----------------------------
  function flashWrong(hit) {
    if (!hit || !hit.el) return;
    hit.el.classList.add("tempWrong", "blink");
    setTimeout(() => hit.el.classList.remove("blink"), 250);
    setTimeout(() => hit.el.classList.remove("tempWrong"), 450);
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
      timerEl.textContent = fmtTime(performance.now() - timerStart);
    }, 33);
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
    hideCursorTip();

    const existing = document.getElementById("endOverlay");
    if (existing) existing.remove();

    const elapsed = timerStart ? performance.now() - timerStart : 0;
    const timeText = fmtTime(elapsed);

    const scorePctNum = TARGETS.length ? totalPoints / TARGETS.length : 0;
    const scoreText = `${scorePctNum.toFixed(1)}%`;

    const completedText = new Date().toLocaleString();

    const end = document.createElement("div");
    end.id = "endOverlay";
    end.className = "start-overlay";
    end.setAttribute("aria-label", "End overlay");

    end.innerHTML = `
      <div class="start-overlay__card" role="dialog" aria-modal="true">
        <div class="overlay__kicker">${escapeHtml(OVERLAY_KICKER)}</div>
        <div class="overlay__title">${escapeHtml(OVERLAY_TITLE)}</div>

        <div class="overlay__body">
          <div class="results-metrics">
            <div class="results-metric">
              <div class="results-label">SCORE</div>
              <div class="results-value">${escapeHtml(scoreText)}</div>
            </div>

            <div class="results-metric">
              <div class="results-label">TIME</div>
              <div class="results-value">${escapeHtml(timeText)}</div>
            </div>
          </div>

          <div class="results-completed">
            Completed: ${escapeHtml(completedText)}
          </div>
        </div>

        <div class="overlay__actions">
          <button class="begin-btn" id="playAgainBtn" type="button">Play Again</button>
        </div>

        <img class="overlay__logo" src="${escapeHtml(LOGO_SRC)}" alt="Middle School History logo" />
      </div>
    `;

    // IMPORTANT: append to the same host as the start overlay so it overlays only the game area
    const overlayHost = (overlay && overlay.parentElement) || stageEl || document.body;
    overlayHost.appendChild(end);

    const playAgainBtn = end.querySelector("#playAgainBtn");
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

    currentTarget = null;
    tries = 0;
    totalPoints = 0;
    locked = new Set();

    remaining = shuffle(TARGETS);

    clearAllTargetClasses();
    clearFlag();

    if (targetNameEl) targetNameEl.textContent = "";

    const endOverlay = document.getElementById("endOverlay");
    if (endOverlay) endOverlay.remove();

    if (startImmediately) {
      hideStartOverlay();
      pickNext();
      startTimer();
    } else {
      showStartOverlay();
      clearFlag();
    }

    requestFit();
    setTimeout(requestFit, 0);
    setTimeout(requestFit, 250);
  }

  // ----------------------------
  // SVG injection + events
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

    // remove titles to avoid revealing answers on hover
    svgRoot.querySelectorAll("title").forEach((t) => t.remove());
    svgRoot.setAttribute("focusable", "false");

    bindSvgEvents();

    // start clean with overlay visible
    resetGame(false);

    requestFit();
    setTimeout(requestFit, 0);
    setTimeout(requestFit, 250);
  }

  function bindSvgEvents() {
    if (!svgRoot) return;

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

    svgRoot.addEventListener("pointerover", (e) => {
      const hit = normalizeClickedId(e);
      if (!hit) return;
      if (!document.body.classList.contains("is-playing")) return;
      if (locked.has(hit.normalized)) return;
      if (currentTarget) showCursorTip(displayNameFor(currentTarget));
    });

    svgRoot.addEventListener("pointerout", () => hideCursorTip());

    svgRoot.addEventListener("click", (e) => {
      const hit = normalizeClickedId(e);
      if (!hit) return;

      if (!document.body.classList.contains("is-playing")) return;
      if (!currentTarget) return;

      const clicked = hit.normalized;

      if (locked.has(clicked)) return;

      if (clicked === currentTarget) {
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

      if (tries === 0) {
        flashWrong(hit);
        tries = 1;
        return;
      }

      flashWrong(hit);
      locked.add(currentTarget);
      markFinalWrong(currentTarget);
      pickNext();
    });
  }

  // ----------------------------
  // Controls
  // ----------------------------
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
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

  // ----------------------------
  // Boot
  // ----------------------------
  applyUiText();
  setHudVisible(false);
  loadSvg().catch((err) => console.error("[map-challenge] SVG load error:", err));
})();
