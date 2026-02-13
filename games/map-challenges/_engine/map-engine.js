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
  const START_MESSAGE =
    cfg.startMessage ??
    "How fast can you identify the places on this map?";

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

  // Configurable start overlay message (single, safe)
  const startMessageEl = overlay.querySelector(".overlay__body");
  if (startMessageEl) startMessageEl.textContent = START_MESSAGE;

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
