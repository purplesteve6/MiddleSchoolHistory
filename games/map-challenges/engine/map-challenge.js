/* ============================================================
   Map Challenge Engine (Template)
   - Reads per-map settings from window.MAP_CHALLENGE_CONFIG
   - Injects SVG, runs the click challenge, shows overlay + results
   - Designed to be reused across map-challenge games (engine)
   ============================================================ */

(function () {
  "use strict";

  const CFG = window.MAP_CHALLENGE_CONFIG || {};

  const SVG_PATH = CFG.svgPath;
  const TARGETS = Array.isArray(CFG.targets)
    ? CFG.targets.map((s) => String(s).toLowerCase())
    : [];

  if (!SVG_PATH || !TARGETS.length) {
    console.error("[map-challenge] Missing required config: svgPath and/or targets[]");
  }

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
      GROUPS[String(k).toLowerCase()] = Array.isArray(arr)
        ? arr.map((s) => String(s).toLowerCase())
        : [];
    }
  }

  const EXTRA_IDS = Array.isArray(CFG.extraIds)
    ? CFG.extraIds.map((s) => String(s).toLowerCase())
    : [];

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

  let svgRoot = null;
  let remaining = [];
  let currentTarget = null;
  let tries = 0;
  let totalPoints = 0;
  let locked = new Set();
  let timerStart = 0;
  let timerInt = null;

  function setHudVisible(isVisible) {
    if (hudEl) {
      hudEl.style.visibility = isVisible ? "visible" : "hidden";
      hudEl.style.pointerEvents = isVisible ? "auto" : "none";
    }
  }

  /* ============================================================
     🔁 ORIGINAL WORKING RESIZE LOGIC RESTORED
     (Stage scaling with margin compensation)
     ============================================================ */

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
      stageEl.style.marginBottom = `${Math.round(
        (1 - scaleFallback) * naturalH
      )}px`;
      return;
    }

    const scale = Math.max(
      0.55,
      Math.min(1, availableW / naturalW, availableH / naturalH)
    );

    stageEl.style.transformOrigin = "top center";
    stageEl.style.transform = `scale(${scale})`;
    stageEl.style.marginBottom = `${Math.round(
      (1 - scale) * naturalH
    )}px`;
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

  /* ============================================================
     Everything else remains unchanged
     ============================================================ */

  function fmtTime(ms) {
    const total = Math.max(0, ms);
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    const millis = Math.floor(total % 1000);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}.${String(millis).padStart(3, "0")}`;
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

  function resetGame(startImmediately) {
    stopTimer();
    currentTarget = null;
    tries = 0;
    totalPoints = 0;
    locked = new Set();
    remaining = TARGETS.slice().sort(() => Math.random() - 0.5);

    if (startImmediately) {
      document.body.classList.add("is-playing");
      setHudVisible(true);
      startTimer();
    } else {
      document.body.classList.remove("is-playing");
      setHudVisible(false);
    }

    requestFit();
  }

  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      resetGame(true);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => resetGame(false));
  }

  setHudVisible(false);
  requestFit();
})();
