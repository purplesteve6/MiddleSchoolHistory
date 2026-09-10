(() => {
  "use strict";

  const HANDOFF_KEY = "msh-flashcard-handoff-v1";
  const HANDOFF_MAX_AGE = 30 * 60 * 1000;

  const DEFAULT_THEME = Object.freeze({
    pageBackground: "#2a1746",
    cardFront: "#fbfaf6",
    cardBack: "#fffdf8",
    termText: "#201d24",
    definitionText: "#2d2931",
    menuBackground: "#34204f",
    menuText: "#ffffff",
    accent: "#c9a8ff",
    flipButton: "#3f2a58",
    flipButtonText: "#ffffff",
    learnedButton: "#6a4b82",
    learnedButtonText: "#ffffff",
    nextButton: "#c9a8ff",
    nextButtonText: "#20162c",
    pattern: "none",
    patternColor: "#ffffff"
  });

  const THEME_PRESETS = Object.freeze({
    classic: {
      name: "Classic Paper",
      theme: { ...DEFAULT_THEME }
    },
    purple: {
      name: "Purple Classroom",
      theme: {
        pageBackground: "#28183f",
        cardFront: "#fbf7ff",
        cardBack: "#f4ebff",
        termText: "#2a1746",
        definitionText: "#2a1746",
        menuBackground: "#3a2258",
        menuText: "#ffffff",
        accent: "#d4b7ff",
        flipButton: "#4a3266",
        flipButtonText: "#ffffff",
        learnedButton: "#6d4f89",
        learnedButtonText: "#ffffff",
        nextButton: "#d4b7ff",
        nextButtonText: "#28183f",
        pattern: "dots",
        patternColor: "#ffffff"
      }
    },
    blue: {
      name: "Blue Classroom",
      theme: {
        pageBackground: "#17324b",
        cardFront: "#f7fbff",
        cardBack: "#edf6ff",
        termText: "#17324b",
        definitionText: "#17324b",
        menuBackground: "#1d405f",
        menuText: "#ffffff",
        accent: "#9ed2ff",
        flipButton: "#234b6b",
        flipButtonText: "#ffffff",
        learnedButton: "#356b90",
        learnedButtonText: "#ffffff",
        nextButton: "#9ed2ff",
        nextButtonText: "#17324b",
        pattern: "grid",
        patternColor: "#ffffff"
      }
    },
    green: {
      name: "Green Classroom",
      theme: {
        pageBackground: "#193b32",
        cardFront: "#fbfff9",
        cardBack: "#eef8eb",
        termText: "#173a31",
        definitionText: "#173a31",
        menuBackground: "#214c40",
        menuText: "#ffffff",
        accent: "#a9d8b7",
        flipButton: "#285448",
        flipButtonText: "#ffffff",
        learnedButton: "#3f735f",
        learnedButtonText: "#ffffff",
        nextButton: "#a9d8b7",
        nextButtonText: "#193b32",
        pattern: "diagonal",
        patternColor: "#ffffff"
      }
    },
    gold: {
      name: "Gold Classroom",
      theme: {
        pageBackground: "#4a3518",
        cardFront: "#fffdf4",
        cardBack: "#fff5d9",
        termText: "#3a2b16",
        definitionText: "#3a2b16",
        menuBackground: "#5a411f",
        menuText: "#fffdf7",
        accent: "#f0cf77",
        flipButton: "#6b4c23",
        flipButtonText: "#fffdf7",
        learnedButton: "#8a682f",
        learnedButtonText: "#fffdf7",
        nextButton: "#f0cf77",
        nextButtonText: "#3a2b16",
        pattern: "paper",
        patternColor: "#fff4ce"
      }
    },
    chalkboard: {
      name: "Chalkboard",
      theme: {
        pageBackground: "#16342f",
        cardFront: "#244941",
        cardBack: "#1f4039",
        termText: "#fffdf2",
        definitionText: "#f5f1df",
        menuBackground: "#102925",
        menuText: "#fffdf2",
        accent: "#f3d98a",
        flipButton: "#315c53",
        flipButtonText: "#fffdf2",
        learnedButton: "#4f7568",
        learnedButtonText: "#fffdf2",
        nextButton: "#f3d98a",
        nextButtonText: "#16342f",
        pattern: "chalk",
        patternColor: "#ffffff"
      }
    }
  });

  function normalizeLineEndings(text) {
    return String(text || "").replace(/\r\n?/g, "\n").replace(/^\uFEFF/, "");
  }

  function detectDelimiter(text) {
    const firstUsefulLine = normalizeLineEndings(text)
      .split("\n")
      .find(line => line.trim().length > 0) || "";

    const tabs = (firstUsefulLine.match(/\t/g) || []).length;
    const commas = (firstUsefulLine.match(/,/g) || []).length;
    return tabs > commas ? "\t" : ",";
  }

  function parseDelimited(text, delimiter) {
    const input = normalizeLineEndings(text);
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < input.length; i += 1) {
      const ch = input[i];

      if (inQuotes) {
        if (ch === '"') {
          if (input[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field += ch;
        }
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }

    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }

    return rows;
  }

  function looksLikeHeader(row) {
    if (!row || row.length < 2) return false;
    const a = String(row[0] || "").trim().toLowerCase();
    const b = String(row[1] || "").trim().toLowerCase();
    const termWords = ["term", "word", "vocabulary", "vocab", "question", "front"];
    const defWords = ["definition", "meaning", "description", "answer", "back"];
    return termWords.includes(a) && defWords.includes(b);
  }

  function rowsToCards(rows) {
    const cleaned = rows
      .map(row => [
        String(row[0] || "").trim(),
        String(row[1] || "").trim(),
        String(row[2] || "").trim()
      ])
      .filter(row => row[0] || row[1] || row[2]);

    if (looksLikeHeader(cleaned[0])) cleaned.shift();

    return cleaned
      .filter(row => row[0] && row[1])
      .map(row => ({
        term: row[0],
        definition: row[1],
        subcategory: row[2] || "",
        enabled: true
      }));
  }

  function parseCards(text) {
    if (!String(text || "").trim()) return [];
    return rowsToCards(parseDelimited(text, detectDelimiter(text)));
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }

  function cardsToCsv(cards) {
    const rows = ["term,definition,subcategory"];
    (cards || []).forEach(card => {
      rows.push([
        csvEscape(card.term),
        csvEscape(card.definition),
        csvEscape(card.subcategory || "")
      ].join(","));
    });
    return rows.join("\n");
  }

  function normalizeHex(value, fallback) {
    const text = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(text)) return text.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(text)) {
      return `#${text.slice(1).split("").map(ch => ch + ch).join("")}`.toLowerCase();
    }
    return fallback;
  }

  function normalizeTheme(theme) {
    const src = theme || {};
    return {
      pageBackground: normalizeHex(src.pageBackground, DEFAULT_THEME.pageBackground),
      cardFront: normalizeHex(src.cardFront, DEFAULT_THEME.cardFront),
      cardBack: normalizeHex(src.cardBack, DEFAULT_THEME.cardBack),
      termText: normalizeHex(src.termText, DEFAULT_THEME.termText),
      definitionText: normalizeHex(src.definitionText, DEFAULT_THEME.definitionText),
      menuBackground: normalizeHex(src.menuBackground, DEFAULT_THEME.menuBackground),
      menuText: normalizeHex(src.menuText, DEFAULT_THEME.menuText),
      accent: normalizeHex(src.accent, DEFAULT_THEME.accent),
      flipButton: normalizeHex(src.flipButton, DEFAULT_THEME.flipButton),
      flipButtonText: normalizeHex(src.flipButtonText, DEFAULT_THEME.flipButtonText),
      learnedButton: normalizeHex(src.learnedButton, DEFAULT_THEME.learnedButton),
      learnedButtonText: normalizeHex(src.learnedButtonText, DEFAULT_THEME.learnedButtonText),
      nextButton: normalizeHex(src.nextButton, DEFAULT_THEME.nextButton),
      nextButtonText: normalizeHex(src.nextButtonText, DEFAULT_THEME.nextButtonText),
      pattern: ["none", "dots", "grid", "diagonal", "paper", "chalk"].includes(src.pattern) ? src.pattern : DEFAULT_THEME.pattern,
      patternColor: normalizeHex(src.patternColor, DEFAULT_THEME.patternColor)
    };
  }

  function normalizeDeck(deck) {
    const src = deck || {};
    const cards = Array.isArray(src.cards) ? src.cards : [];
    return {
      version: 1,
      title: String(src.title || "Flashcard Deck").trim().slice(0, 120) || "Flashcard Deck",
      unit: String(src.unit || "").trim().slice(0, 120),
      showSubcategory: src.showSubcategory !== false,
      termFont: ["helvetica", "times", "courier", "marker"].includes(src.termFont) ? src.termFont : "helvetica",
      theme: normalizeTheme(src.theme),
      cards: cards
        .map(card => ({
          term: String(card && card.term || "").trim(),
          definition: String(card && card.definition || "").trim(),
          subcategory: String(card && card.subcategory || "").trim(),
          enabled: card && card.enabled !== false
        }))
        .filter(card => card.term && card.definition)
        .slice(0, 500)
    };
  }

  function getPresetTheme(id) {
    const preset = THEME_PRESETS[id] || THEME_PRESETS.classic;
    return normalizeTheme(preset.theme);
  }

  function hexToRgba(hex, alpha) {
    const normalized = normalizeHex(hex, "#ffffff");
    const n = Number.parseInt(normalized.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function patternCss(theme) {
    const t = normalizeTheme(theme);
    const c = t.patternColor;
    switch (t.pattern) {
      case "dots":
        return `radial-gradient(circle at 1px 1px, ${hexToRgba(c, .20)} 1.25px, transparent 1.4px)`;
      case "grid":
        return `linear-gradient(${hexToRgba(c, .12)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(c, .12)} 1px, transparent 1px)`;
      case "diagonal":
        return `repeating-linear-gradient(135deg, ${hexToRgba(c, .08)} 0 2px, transparent 2px 14px)`;
      case "paper":
        return `repeating-linear-gradient(0deg, transparent 0 27px, ${hexToRgba(c, .12)} 27px 28px), linear-gradient(90deg, transparent 0 42px, ${hexToRgba(c, .18)} 42px 44px, transparent 44px)`;
      case "chalk":
        return `radial-gradient(circle at 20% 30%, ${hexToRgba(c, .055)} 0 1px, transparent 1.5px), radial-gradient(circle at 70% 65%, ${hexToRgba(c, .04)} 0 1px, transparent 1.5px)`;
      default:
        return "none";
    }
  }

  function patternSize(theme) {
    switch ((theme && theme.pattern) || "none") {
      case "dots": return "18px 18px";
      case "grid": return "28px 28px, 28px 28px";
      case "paper": return "100% 28px, 100% 100%";
      case "chalk": return "32px 32px, 48px 48px";
      default: return "auto";
    }
  }

  function applyTheme(element, theme) {
    if (!element) return;
    const t = normalizeTheme(theme);
    element.style.setProperty("--fc-page-bg", t.pageBackground);
    element.style.setProperty("--fc-card-front", t.cardFront);
    element.style.setProperty("--fc-card-back", t.cardBack);
    element.style.setProperty("--fc-term-text", t.termText);
    element.style.setProperty("--fc-definition-text", t.definitionText);
    element.style.setProperty("--fc-menu-bg", t.menuBackground);
    element.style.setProperty("--fc-menu-text", t.menuText);
    element.style.setProperty("--fc-accent", t.accent);
    element.style.setProperty("--fc-flip-button", t.flipButton);
    element.style.setProperty("--fc-flip-button-text", t.flipButtonText);
    element.style.setProperty("--fc-learned-button", t.learnedButton);
    element.style.setProperty("--fc-learned-button-text", t.learnedButtonText);
    element.style.setProperty("--fc-next-button", t.nextButton);
    element.style.setProperty("--fc-next-button-text", t.nextButtonText);
    element.style.setProperty("--fc-pattern", patternCss(t));
    element.style.setProperty("--fc-pattern-size", patternSize(t));
  }

  function setHandoff(deck, target) {
    try {
      localStorage.setItem(HANDOFF_KEY, JSON.stringify({
        createdAt: Date.now(),
        target: String(target || ""),
        deck: normalizeDeck(deck)
      }));
      return true;
    } catch (error) {
      return false;
    }
  }

  function consumeHandoff(target) {
    try {
      const raw = localStorage.getItem(HANDOFF_KEY);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      const fresh = payload && Number.isFinite(payload.createdAt) && Date.now() - payload.createdAt <= HANDOFF_MAX_AGE;
      const matches = payload && payload.target === target;
      if (!fresh) {
        localStorage.removeItem(HANDOFF_KEY);
        return null;
      }
      if (!matches) return null;
      localStorage.removeItem(HANDOFF_KEY);
      return normalizeDeck(payload.deck);
    } catch (error) {
      return null;
    }
  }

  function bytesToBase64Url(bytes) {
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function base64UrlToBytes(text) {
    const normalized = String(text || "").replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  async function gzipBytes(bytes) {
    if (typeof CompressionStream === "undefined") return null;
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function gunzipBytes(bytes) {
    if (typeof DecompressionStream === "undefined") throw new Error("This browser cannot open the compressed deck link.");
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  function compactDeck(deck) {
    const d = normalizeDeck(deck);
    const t = d.theme;
    return {
      v: 1,
      t: d.title,
      u: d.unit,
      s: d.showSubcategory ? 1 : 0,
      f: d.termFont,
      h: [
        t.pageBackground, t.cardFront, t.cardBack, t.termText, t.definitionText,
        t.menuBackground, t.menuText, t.accent, t.pattern, t.patternColor,
        t.flipButton, t.flipButtonText, t.learnedButton, t.learnedButtonText,
        t.nextButton, t.nextButtonText
      ],
      c: d.cards.map(card => [card.term, card.definition, card.subcategory || "", card.enabled === false ? 0 : 1])
    };
  }

  function expandDeck(compact) {
    if (!compact || !Array.isArray(compact.c)) throw new Error("That deck link is not valid.");
    const h = Array.isArray(compact.h) ? compact.h : [];
    return normalizeDeck({
      title: compact.t,
      unit: compact.u,
      showSubcategory: compact.s !== 0,
      termFont: compact.f,
      theme: {
        pageBackground: h[0],
        cardFront: h[1],
        cardBack: h[2],
        termText: h[3],
        definitionText: h[4],
        menuBackground: h[5],
        menuText: h[6],
        accent: h[7],
        pattern: h[8],
        patternColor: h[9],
        flipButton: h[10],
        flipButtonText: h[11],
        learnedButton: h[12],
        learnedButtonText: h[13],
        nextButton: h[14],
        nextButtonText: h[15]
      },
      cards: compact.c.map(row => ({
        term: row[0],
        definition: row[1],
        subcategory: row[2] || "",
        enabled: row[3] !== 0
      }))
    });
  }

  async function encodeDeck(deck) {
    const json = JSON.stringify(compactDeck(deck));
    const raw = new TextEncoder().encode(json);
    const gz = await gzipBytes(raw);
    if (gz && gz.length < raw.length) return `g.${bytesToBase64Url(gz)}`;
    return `j.${bytesToBase64Url(raw)}`;
  }

  async function decodeDeck(payload) {
    const text = String(payload || "").trim().replace(/^#/, "");
    if (!text) throw new Error("No deck data was found in this link.");
    const dot = text.indexOf(".");
    if (dot < 1) throw new Error("That deck link is not valid.");
    const type = text.slice(0, dot);
    let bytes = base64UrlToBytes(text.slice(dot + 1));
    if (type === "g") bytes = await gunzipBytes(bytes);
    else if (type !== "j") throw new Error("That deck link uses an unknown format.");
    const compact = JSON.parse(new TextDecoder().decode(bytes));
    return expandDeck(compact);
  }

  async function buildShareUrl(deck, baseUrl) {
    const encoded = await encodeDeck(deck);
    const base = baseUrl || `${location.origin}/teacher-resources/digital-flashcards/study/`;
    return `${base}#${encoded}`;
  }

  window.Flashcards = {
    DEFAULT_THEME,
    THEME_PRESETS,
    parseCards,
    cardsToCsv,
    normalizeDeck,
    normalizeTheme,
    getPresetTheme,
    applyTheme,
    setHandoff,
    consumeHandoff,
    encodeDeck,
    decodeDeck,
    buildShareUrl
  };
})();
