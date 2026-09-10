(() => {
  "use strict";

  const F = window.Flashcards;
  const Study = window.FlashcardStudy;
  if (!F || !Study) return;

  const $ = id => document.getElementById(id);
  const els = {
    file: $("digitalCsvFile"),
    text: $("digitalCsvText"),
    parse: $("digitalParseBtn"),
    clear: $("digitalClearBtn"),
    demo: $("digitalDemoBtn"),
    title: $("deckTitle"),
    unit: $("deckUnit"),
    termFont: $("digitalTermFont"),
    showSubcategory: $("digitalShowSubcategory"),
    preset: $("themePreset"),
    pattern: $("backgroundPattern"),
    pageBackground: $("pageBackground"),
    patternColor: $("patternColor"),
    cardFront: $("cardFront"),
    cardBack: $("cardBack"),
    termText: $("termText"),
    definitionText: $("definitionText"),
    menuBackground: $("menuBackground"),
    menuText: $("menuText"),
    accent: $("accentColor"),
    flipButton: $("flipButtonColor"),
    flipButtonText: $("flipButtonTextColor"),
    learnedButton: $("learnedButtonColor"),
    learnedButtonText: $("learnedButtonTextColor"),
    nextButton: $("nextButtonColor"),
    nextButtonText: $("nextButtonTextColor"),
    previewShell: $("creatorPreviewShell"),
    previewEmpty: $("creatorPreviewEmpty"),
    previewScene: $("creatorCardScene"),
    previewCard: $("creatorCard"),
    previewTerm: $("creatorTerm"),
    previewDefinition: $("creatorDefinition"),
    previewUnit: $("creatorUnit"),
    previewSubcategory: $("creatorSubcategory"),
    previewActions: $("creatorPreviewActions"),
    previewPrev: $("creatorPrev"),
    previewFlip: $("creatorFlip"),
    previewNext: $("creatorNext"),
    workspace: $("workspaceSection"),
    studyRoot: $("builderStudyRoot"),
    toPrint: $("toPrintBtn"),
    openStudent: $("openStudentBtn"),
    share: $("shareBtn"),
    sharePanel: $("sharePanel"),
    shareOutput: $("shareOutput"),
    copyShare: $("copyShareBtn"),
    shareLength: $("shareLength"),
    shareMessage: $("shareMessage")
  };

  const demoText = `term,definition,subcategory
Abolitionist,A person who wanted to end slavery.,People & Ideas
Secession,The act of withdrawing from the United States.,Causes
Confederacy,The group of Southern states that left the Union.,Sides
Union,The United States and the states that remained loyal to it.,Sides
Gettysburg,A major 1863 battle in Pennsylvania and a turning point in the Civil War.,Key Battles
Emancipation Proclamation,Lincoln's order declaring enslaved people in Confederate territory to be free.,People & Ideas
Appomattox Court House,The Virginia location where Robert E. Lee surrendered to Ulysses S. Grant in 1865.,Key Battles
Reconstruction,The period after the Civil War when the nation worked to rebuild and reunite.,Aftermath`;

  let cards = [];
  let study = null;
  let previewIndex = 0;
  let previewFlipped = false;
  let applyingPreset = false;

  function currentTheme() {
    return F.normalizeTheme({
      pageBackground: els.pageBackground.value,
      patternColor: els.patternColor.value,
      cardFront: els.cardFront.value,
      cardBack: els.cardBack.value,
      termText: els.termText.value,
      definitionText: els.definitionText.value,
      menuBackground: els.menuBackground.value,
      menuText: els.menuText.value,
      accent: els.accent.value,
      flipButton: els.flipButton.value,
      flipButtonText: els.flipButtonText.value,
      learnedButton: els.learnedButton.value,
      learnedButtonText: els.learnedButtonText.value,
      nextButton: els.nextButton.value,
      nextButtonText: els.nextButtonText.value,
      pattern: els.pattern.value
    });
  }

  function getDeck() {
    const studyDeck = study ? study.getDeck() : null;
    const sourceCards = studyDeck && studyDeck.cards.length === cards.length ? studyDeck.cards : cards;
    return F.normalizeDeck({
      title: els.title.value,
      unit: els.unit.value,
      showSubcategory: els.showSubcategory.checked,
      termFont: els.termFont.value,
      theme: currentTheme(),
      cards: sourceCards
    });
  }

  function setThemeControls(theme, presetId = "custom") {
    const t = F.normalizeTheme(theme);
    applyingPreset = true;
    els.pageBackground.value = t.pageBackground;
    els.patternColor.value = t.patternColor;
    els.cardFront.value = t.cardFront;
    els.cardBack.value = t.cardBack;
    els.termText.value = t.termText;
    els.definitionText.value = t.definitionText;
    els.menuBackground.value = t.menuBackground;
    els.menuText.value = t.menuText;
    els.accent.value = t.accent;
    els.flipButton.value = t.flipButton;
    els.flipButtonText.value = t.flipButtonText;
    els.learnedButton.value = t.learnedButton;
    els.learnedButtonText.value = t.learnedButtonText;
    els.nextButton.value = t.nextButton;
    els.nextButtonText.value = t.nextButtonText;
    els.pattern.value = t.pattern;
    els.preset.value = presetId;
    applyingPreset = false;
  }

  function renderCreatorPreview() {
    const hasCards = cards.length > 0;
    els.previewEmpty.hidden = hasCards;
    els.previewScene.hidden = !hasCards;
    els.previewActions.hidden = !hasCards;
    F.applyTheme(els.previewShell, currentTheme());
    els.previewShell.style.setProperty("--fc-term-font", els.termFont.value === "times" ? '"Times New Roman", Times, serif' : els.termFont.value === "courier" ? '"Courier New", Courier, monospace' : 'Arial, Helvetica, sans-serif');

    if (!hasCards) return;
    previewIndex = Math.max(0, Math.min(previewIndex, cards.length - 1));
    const card = cards[previewIndex];
    els.previewTerm.textContent = card.term;
    els.previewDefinition.textContent = card.definition;
    els.previewUnit.textContent = els.unit.value.trim();
    els.previewUnit.hidden = !els.unit.value.trim();
    els.previewSubcategory.textContent = els.showSubcategory.checked ? card.subcategory : "";
    els.previewSubcategory.hidden = !(els.showSubcategory.checked && card.subcategory);
    els.previewCard.classList.toggle("is-flipped", previewFlipped);
  }

  function syncStudyMeta() {
    renderCreatorPreview();
    if (study) study.updateMeta(getDeck());
    els.sharePanel.hidden = true;
  }

  function initializeStudy() {
    els.workspace.hidden = cards.length === 0;
    if (!cards.length) {
      els.studyRoot.innerHTML = "";
      study = null;
      return;
    }

    const deck = getDeck();
    if (!study) {
      study = Study.create(els.studyRoot, deck, {
        onStateChange: nextDeck => {
          cards = nextDeck.cards.map(card => ({ ...card }));
          els.sharePanel.hidden = true;
        }
      });
    } else {
      study.setDeck(deck, { preserveLearned: false });
    }
  }

  function loadCardsFromText() {
    const parsed = F.parseCards(els.text.value);
    if (!parsed.length) {
      cards = [];
      previewIndex = 0;
      previewFlipped = false;
      initializeStudy();
      renderCreatorPreview();
      if (els.text.value.trim()) alert("No complete term/definition pairs were found.");
      return;
    }
    cards = parsed;
    previewIndex = 0;
    previewFlipped = false;
    initializeStudy();
    renderCreatorPreview();
  }

  function loadDeck(deck) {
    const normalized = F.normalizeDeck(deck);
    cards = normalized.cards.map(card => ({ ...card }));
    els.text.value = F.cardsToCsv(cards);
    els.title.value = normalized.title;
    els.unit.value = normalized.unit;
    els.showSubcategory.checked = normalized.showSubcategory;
    els.termFont.value = normalized.termFont;
    setThemeControls(normalized.theme, "custom");
    previewIndex = 0;
    previewFlipped = false;
    initializeStudy();
    renderCreatorPreview();
  }

  async function generateShareUrl() {
    if (!cards.length) {
      alert("Load some cards first.");
      return "";
    }
    const deck = getDeck();
    const url = await F.buildShareUrl(deck, `${location.origin}/teacher-resources/digital-flashcards/study/`);
    els.shareOutput.value = url;
    els.sharePanel.hidden = false;
    els.shareLength.textContent = `${url.length.toLocaleString()} characters`;
    if (url.length > 12000) {
      els.shareMessage.textContent = "Long deck link — consider fewer cards if sharing through a system that shortens or wraps URLs.";
      els.shareMessage.className = "share-warning";
    } else {
      els.shareMessage.textContent = "Deck data is contained in the link; nothing was uploaded.";
      els.shareMessage.className = "";
    }
    return url;
  }

  async function copyShareLink() {
    const url = els.shareOutput.value || await generateShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      els.copyShare.textContent = "Copied!";
    } catch (error) {
      els.shareOutput.focus();
      els.shareOutput.select();
      document.execCommand("copy");
      els.copyShare.textContent = "Copied!";
    }
    setTimeout(() => { els.copyShare.textContent = "Copy link"; }, 1400);
  }

  async function openStudentView() {
    if (!cards.length) return;
    const newTab = window.open("about:blank", "_blank");
    const url = await generateShareUrl();
    if (!url) {
      if (newTab) newTab.close();
      return;
    }
    if (newTab) {
      try { newTab.opener = null; } catch (error) {}
      newTab.location.href = url;
    } else {
      location.href = url;
    }
  }

  function sendToPrintMaker() {
    const deck = getDeck();
    const selected = deck.cards.filter(card => card.enabled !== false);
    if (!selected.length) {
      alert("Select at least one term before creating printable cards.");
      return;
    }
    const printDeck = F.normalizeDeck({ ...deck, cards: selected.map(card => ({ ...card, enabled: true })) });
    if (!F.setHandoff(printDeck, "print")) {
      alert("Your browser blocked the temporary handoff. Copy the CSV into the printable maker instead.");
      return;
    }
    location.href = "/teacher-resources/flashcard-maker/";
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
    previewIndex = 0;
    previewFlipped = false;
    els.file.value = "";
    els.text.value = "";
    initializeStudy();
    renderCreatorPreview();
  });
  els.demo.addEventListener("click", () => {
    els.text.value = demoText;
    els.title.value = "Civil War Vocabulary";
    els.unit.value = "Civil War";
    loadCardsFromText();
  });

  els.preset.addEventListener("change", () => {
    if (els.preset.value === "custom") return;
    setThemeControls(F.getPresetTheme(els.preset.value), els.preset.value);
    syncStudyMeta();
  });

  [
    els.pattern, els.pageBackground, els.patternColor, els.cardFront, els.cardBack,
    els.termText, els.definitionText, els.menuBackground, els.menuText, els.accent,
    els.flipButton, els.flipButtonText, els.learnedButton, els.learnedButtonText,
    els.nextButton, els.nextButtonText
  ].forEach(input => input.addEventListener("input", () => {
      if (!applyingPreset) els.preset.value = "custom";
      syncStudyMeta();
    }));

  [els.title, els.unit, els.termFont, els.showSubcategory]
    .forEach(input => input.addEventListener("input", syncStudyMeta));

  els.previewScene.addEventListener("click", () => {
    previewFlipped = !previewFlipped;
    renderCreatorPreview();
  });
  els.previewFlip.addEventListener("click", () => {
    previewFlipped = !previewFlipped;
    renderCreatorPreview();
  });
  els.previewPrev.addEventListener("click", () => {
    if (!cards.length) return;
    previewIndex = (previewIndex - 1 + cards.length) % cards.length;
    previewFlipped = false;
    renderCreatorPreview();
  });
  els.previewNext.addEventListener("click", () => {
    if (!cards.length) return;
    previewIndex = (previewIndex + 1) % cards.length;
    previewFlipped = false;
    renderCreatorPreview();
  });

  els.share.addEventListener("click", generateShareUrl);
  els.copyShare.addEventListener("click", copyShareLink);
  els.openStudent.addEventListener("click", openStudentView);
  els.toPrint.addEventListener("click", sendToPrintMaker);

  const handoff = F.consumeHandoff("digital");
  if (handoff && handoff.cards.length) loadDeck(handoff);
  else {
    setThemeControls(F.getPresetTheme("classic"), "classic");
    renderCreatorPreview();
  }
})();
