(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const els = {
    file: $("csvFile"),
    text: $("csvText"),
    parse: $("parseBtn"),
    clear: $("clearBtn"),
    demo: $("loadDemoBtn"),
    unit: $("unitLine"),
    showSubcategory: $("showSubcategory"),
    duplex: $("duplexMode"),
    cutLines: $("cutLineMode"),
    termFont: $("termFont"),
    preview: $("sheetPreview"),
    status: $("cardStatus"),
    prevSheet: $("prevSheetBtn"),
    nextSheet: $("nextSheetBtn"),
    previewSheetStatus: $("previewSheetStatus"),
    generate: $("generateBtn"),
    createDigital: $("createDigitalBtn")
  };

  let cards = [];
  let previewSide = "front";
  let previewSheetIndex = 0;
  let handoffTheme = window.Flashcards ? window.Flashcards.getPresetTheme("classic") : null;
  let handoffTitle = "";

  const demoText = `term,definition,subcategory
Abolitionist,A person who wanted to end slavery.,People & Ideas
Secession,The act of withdrawing from the United States.,Causes
Confederacy,The group of Southern states that left the Union.,Sides
Union,The United States and the states that remained loyal to it.,Sides
Gettysburg,A major 1863 battle in Pennsylvania and a turning point in the Civil War.,Key Battles
Emancipation Proclamation,Lincoln's order declaring enslaved people in Confederate territory to be free.,People & Ideas
Appomattox Court House,The Virginia location where Robert E. Lee surrendered to Ulysses S. Grant in 1865.,Key Battles
Reconstruction,The period after the Civil War when the nation worked to rebuild and reunite.,`;

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

  // Lightweight RFC-4180-style parser: quoted fields, embedded delimiters and newlines.
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
        subcategory: row[2] || ""
      }));
  }

  function loadCardsFromText() {
    const text = els.text.value;
    if (!text.trim()) {
      cards = [];
      updateUI("Paste or import some card data first.");
      return;
    }

    if (window.Flashcards) {
      cards = window.Flashcards.parseCards(text);
    } else {
      const delimiter = detectDelimiter(text);
      cards = rowsToCards(parseDelimited(text, delimiter));
    }
    previewSheetIndex = 0;

    if (!cards.length) {
      updateUI("No complete term/definition pairs were found.");
      return;
    }

    updateUI();
  }

  function reorderBacks(group, mode) {
    const g = group.slice(0, 4);
    while (g.length < 4) g.push(null);

    if (mode === "long") return [g[2], g[3], g[0], g[1]];  // mirror top/bottom
    if (mode === "short") return [g[1], g[0], g[3], g[2]]; // mirror left/right
    return g;
  }

  function previewGroup() {
    const start = previewSheetIndex * 4;
    const group = cards.slice(start, start + 4);
    while (group.length < 4) group.push(null);
    return group;
  }

  function getPreviewCards() {
    const group = previewGroup();
    return previewSide === "back" ? reorderBacks(group, els.duplex.value) : group;
  }

  function shouldShowCutLines(side) {
    const mode = els.cutLines.value;
    return mode === "both" || (mode === "backs" && side === "back");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function previewTermFontStack() {
    const stacks = {
      helvetica: 'Arial, Helvetica, sans-serif',
      times: '"Times New Roman", Times, serif',
      courier: '"Courier New", Courier, monospace',
      marker: '"Marker Style", cursive'
    };
    return stacks[els.termFont.value] || stacks.helvetica;
  }

  function renderPreview() {
    const previewCards = getPreviewCards();
    const showLines = shouldShowCutLines(previewSide);
    const unit = els.unit.value.trim();
    const showSubcategory = els.showSubcategory.checked;

    // Keep the browser preview in sync with the PDF term typeface setting.
    els.preview.style.setProperty("--preview-term-font", previewTermFontStack());

    els.preview.innerHTML = previewCards.map(card => {
      const classes = ["preview-card"];
      if (showLines) classes.push("has-cut-lines");

      if (!card) {
        return `<div class="${classes.join(" ")}"><div class="preview-empty">Blank</div></div>`;
      }

      if (previewSide === "front") {
        return `<div class="${classes.join(" ")}"><div class="preview-term">${escapeHtml(card.term)}</div></div>`;
      }

      const unitMarkup = unit
        ? `<div class="preview-unit">${escapeHtml(unit)}</div>`
        : "";
      const subcategoryMarkup = showSubcategory && card.subcategory
        ? `<div class="preview-subcategory">${escapeHtml(card.subcategory)}</div>`
        : "";

      return `<div class="${classes.join(" ")}">
        <div class="preview-definition-wrap">
          ${unitMarkup}
          <div class="preview-definition">${escapeHtml(card.definition)}</div>
          ${subcategoryMarkup}
        </div>
      </div>`;
    }).join("");
  }

  function updatePreviewPager() {
    const sheets = Math.ceil(cards.length / 4);

    if (!sheets) {
      previewSheetIndex = 0;
      els.previewSheetStatus.textContent = "No sheets";
      els.prevSheet.disabled = true;
      els.nextSheet.disabled = true;
      return;
    }

    previewSheetIndex = Math.max(0, Math.min(previewSheetIndex, sheets - 1));
    els.previewSheetStatus.textContent = `Sheet ${previewSheetIndex + 1} of ${sheets}`;
    els.prevSheet.disabled = previewSheetIndex === 0;
    els.nextSheet.disabled = previewSheetIndex >= sheets - 1;
  }

  function updateUI(message = "") {
    const sheets = Math.ceil(cards.length / 4);
    const pages = sheets * 2;

    if (cards.length) {
      els.status.textContent = `${cards.length} card${cards.length === 1 ? "" : "s"} • ${sheets} sheet${sheets === 1 ? "" : "s"} • ${pages} PDF page${pages === 1 ? "" : "s"}`;
      els.status.classList.add("has-cards");
      els.generate.disabled = false;
      if (els.createDigital) els.createDigital.disabled = false;
    } else {
      els.status.textContent = message || "No cards loaded";
      els.status.classList.remove("has-cards");
      els.generate.disabled = true;
      if (els.createDigital) els.createDigital.disabled = true;
    }

    updatePreviewPager();
    renderPreview();
  }

  function getPdfApi() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("The PDF library could not be loaded. Check your internet connection and try again.");
    }
    return window.jspdf.jsPDF;
  }

  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = "";
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunkSize, bytes.length)));
    }
    return btoa(binary);
  }

  async function registerSelectedCustomFont(doc) {
    if (els.termFont.value !== "marker") return;

    const response = await fetch("/assets/fonts/MarkerStyle-Regular.ttf", { cache: "force-cache" });
    if (!response.ok) throw new Error("Marker Style could not be loaded from /assets/fonts/MarkerStyle-Regular.ttf.");

    const base64 = arrayBufferToBase64(await response.arrayBuffer());
    doc.addFileToVFS("MarkerStyle-Regular.ttf", base64);
    doc.addFont("MarkerStyle-Regular.ttf", "marker", "normal");
  }

  function selectedPdfTermFont() {
    return els.termFont.value === "marker"
      ? { font: "marker", style: "normal" }
      : { font: els.termFont.value, style: "bold" };
  }

  // All PDF geometry is in points. 72 points = 1 inch.
  const PT = 72;
  const PAGE_W = 11 * PT;
  const PAGE_H = 8.5 * PT;
  const CARD_W = 5 * PT;
  const CARD_H = 3 * PT;
  const BLOCK_W = CARD_W * 2;
  const BLOCK_H = CARD_H * 2;
  const START_X = (PAGE_W - BLOCK_W) / 2; // 0.5 in
  const START_Y = (PAGE_H - BLOCK_H) / 2; // 1.25 in

  const positions = [
    [START_X, START_Y],
    [START_X + CARD_W, START_Y],
    [START_X, START_Y + CARD_H],
    [START_X + CARD_W, START_Y + CARD_H]
  ];

  function drawCutLines(doc) {
    doc.setDrawColor(190, 190, 190);
    doc.setLineWidth(0.45);
    doc.rect(START_X, START_Y, BLOCK_W, BLOCK_H);
    doc.line(START_X + CARD_W, START_Y, START_X + CARD_W, START_Y + BLOCK_H);
    doc.line(START_X, START_Y + CARD_H, START_X + BLOCK_W, START_Y + CARD_H);
  }

  function fitText(doc, text, maxWidth, maxHeight, options) {
    const {
      font = "helvetica",
      style = "normal",
      maxSize = 30,
      minSize = 8,
      lineHeightFactor = 1.18
    } = options || {};

    doc.setFont(font, style);

    for (let size = maxSize; size >= minSize; size -= 0.5) {
      doc.setFontSize(size);
      doc.setLineHeightFactor(lineHeightFactor);
      const lines = doc.splitTextToSize(String(text), maxWidth);
      const lineHeight = size * lineHeightFactor;
      const height = lines.length * lineHeight;
      if (height <= maxHeight) return { size, lines, lineHeight };
    }

    doc.setFontSize(minSize);
    doc.setLineHeightFactor(lineHeightFactor);
    const lines = doc.splitTextToSize(String(text), maxWidth);
    return { size: minSize, lines, lineHeight: minSize * lineHeightFactor };
  }

  function drawCenteredLines(doc, lines, xCenter, yTop, lineHeight) {
    lines.forEach((line, index) => {
      const y = yTop + (index * lineHeight);
      doc.text(line, xCenter, y, { align: "center" });
    });
  }

  function drawTerm(doc, card, x, y) {
    if (!card) return;

    const padX = 0.35 * PT;
    const padY = 0.35 * PT;
    const usableW = CARD_W - padX * 2;
    const usableH = CARD_H - padY * 2;
    const { font, style } = selectedPdfTermFont();

    const fit = fitText(doc, card.term, usableW, usableH, {
      font,
      style,
      maxSize: 34,
      minSize: 13,
      lineHeightFactor: 1.08
    });

    doc.setFont(font, style);
    doc.setFontSize(fit.size);
    doc.setTextColor(22, 22, 22);

    const blockHeight = fit.lines.length * fit.lineHeight;
    const firstBaseline = y + (CARD_H - blockHeight) / 2 + fit.size;
    drawCenteredLines(doc, fit.lines, x + CARD_W / 2, firstBaseline, fit.lineHeight);
  }

  function drawDefinition(doc, card, x, y) {
    if (!card) return;

    const unit = els.unit.value.trim();
    const subcategory = els.showSubcategory.checked ? String(card.subcategory || "").trim() : "";
    const xCenter = x + CARD_W / 2;

    const padX = 0.32 * PT;
    const usableW = CARD_W - padX * 2;
    const labelSpace = (unit ? 17 : 0) + (subcategory ? 17 : 0);
    const usableH = CARD_H - (0.50 * PT) - labelSpace;

    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);

    if (unit) {
      const labelY = y + 17;
      doc.text(unit.toUpperCase(), xCenter, labelY, { align: "center" });
    }

    if (subcategory) {
      const labelY = y + CARD_H - 12;
      doc.text(subcategory.toUpperCase(), xCenter, labelY, { align: "center" });
    }

    const fit = fitText(doc, card.definition, usableW, usableH, {
      font: "helvetica",
      style: "normal",
      maxSize: 16,
      minSize: 8,
      lineHeightFactor: 1.22
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fit.size);
    doc.setTextColor(35, 35, 35);

    const topLimit = y + (unit ? 30 : 15);
    const bottomLimit = y + CARD_H - (subcategory ? 25 : 15);
    const centerY = (topLimit + bottomLimit) / 2;
    const blockHeight = fit.lines.length * fit.lineHeight;
    const firstBaseline = centerY - blockHeight / 2 + fit.size;

    drawCenteredLines(doc, fit.lines, xCenter, firstBaseline, fit.lineHeight);
  }

  function addSheetSide(doc, group, side, isFirstPage) {
    if (!isFirstPage) doc.addPage([PAGE_W, PAGE_H], "landscape");

    const arranged = side === "back" ? reorderBacks(group, els.duplex.value) : group;
    const drawLines = els.cutLines.value === "both" || (els.cutLines.value === "backs" && side === "back");

    if (drawLines) drawCutLines(doc);

    arranged.forEach((card, index) => {
      const [x, y] = positions[index];
      if (side === "front") drawTerm(doc, card, x, y);
      else drawDefinition(doc, card, x, y);
    });
  }

  async function generatePdf() {
    if (!cards.length) return;

    let jsPDF;
    try {
      jsPDF = getPdfApi();
    } catch (error) {
      alert(error.message);
      return;
    }

    const originalLabel = els.generate.textContent;
    els.generate.disabled = true;
    if (els.termFont.value === "marker") els.generate.textContent = "Loading Marker Style…";

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "letter",
        compress: true
      });

      await registerSelectedCustomFont(doc);

      const totalGroups = Math.ceil(cards.length / 4);
      let firstPage = true;

      for (let groupIndex = 0; groupIndex < totalGroups; groupIndex += 1) {
        const group = cards.slice(groupIndex * 4, groupIndex * 4 + 4);
        while (group.length < 4) group.push(null);

        addSheetSide(doc, group, "front", firstPage);
        firstPage = false;
        addSheetSide(doc, group, "back", false);
      }

      const safeUnit = els.unit.value.trim()
        .replace(/[^a-z0-9_-]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

      doc.save(safeUnit ? `${safeUnit}-flashcards.pdf` : "flashcards.pdf");
    } catch (error) {
      alert(error && error.message ? error.message : "The PDF could not be created.");
    } finally {
      els.generate.textContent = originalLabel;
      els.generate.disabled = cards.length === 0;
    }
  }

  els.file.addEventListener("change", () => {
    const file = els.file.files && els.file.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      els.text.value = String(reader.result || "");
      loadCardsFromText();
    };
    reader.onerror = () => alert("That file could not be read.");
    reader.readAsText(file);
  });

  els.parse.addEventListener("click", loadCardsFromText);

  els.clear.addEventListener("click", () => {
    cards = [];
    previewSheetIndex = 0;
    handoffTitle = "";
    handoffTheme = window.Flashcards ? window.Flashcards.getPresetTheme("classic") : null;
    els.file.value = "";
    els.text.value = "";
    updateUI();
  });

  els.demo.addEventListener("click", () => {
    els.text.value = demoText;
    loadCardsFromText();
  });

  [els.unit, els.showSubcategory, els.duplex, els.cutLines]
    .forEach(el => el.addEventListener("input", renderPreview));

  els.termFont.addEventListener("change", renderPreview);

  document.querySelectorAll("[data-preview-side]").forEach(button => {
    button.addEventListener("click", () => {
      previewSide = button.dataset.previewSide;
      document.querySelectorAll("[data-preview-side]").forEach(tab => {
        const active = tab === button;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
      });
      renderPreview();
    });
  });

  els.prevSheet.addEventListener("click", () => {
    if (previewSheetIndex <= 0) return;
    previewSheetIndex -= 1;
    updatePreviewPager();
    renderPreview();
  });

  els.nextSheet.addEventListener("click", () => {
    const sheets = Math.ceil(cards.length / 4);
    if (previewSheetIndex >= sheets - 1) return;
    previewSheetIndex += 1;
    updatePreviewPager();
    renderPreview();
  });

  els.generate.addEventListener("click", generatePdf);
  if (els.createDigital) els.createDigital.addEventListener("click", createDigitalDeck);

  function createDigitalDeck() {
    if (!cards.length) return;
    if (!window.Flashcards) {
      alert("The digital deck tools could not be loaded. Refresh the page and try again.");
      return;
    }

    const deck = window.Flashcards.normalizeDeck({
      title: handoffTitle || els.unit.value.trim() || "Flashcard Deck",
      unit: els.unit.value.trim(),
      showSubcategory: els.showSubcategory.checked,
      termFont: els.termFont.value,
      theme: handoffTheme || window.Flashcards.getPresetTheme("classic"),
      cards: cards.map(card => ({ ...card, enabled: true }))
    });

    if (!window.Flashcards.setHandoff(deck, "digital")) {
      alert("Your browser blocked the temporary handoff. Copy the CSV into the digital maker instead.");
      return;
    }
    location.href = "/teacher-resources/digital-flashcards/";
  }

  function loadPrintHandoff() {
    if (!window.Flashcards) return false;
    const deck = window.Flashcards.consumeHandoff("print");
    if (!deck || !deck.cards.length) return false;

    cards = deck.cards.map(card => ({
      term: card.term,
      definition: card.definition,
      subcategory: card.subcategory || ""
    }));
    handoffTheme = deck.theme;
    handoffTitle = deck.title;
    els.text.value = window.Flashcards.cardsToCsv(cards);
    els.unit.value = deck.unit || "";
    els.showSubcategory.checked = deck.showSubcategory;
    els.termFont.value = deck.termFont;
    previewSheetIndex = 0;
    updateUI();
    return true;
  }

  if (!loadPrintHandoff()) updateUI();
})();
