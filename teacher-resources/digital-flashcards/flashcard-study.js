(() => {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function fontStack(font) {
    if (font === "marker") return '"Marker Style", cursive';
    if (font === "times") return '"Times New Roman", Times, serif';
    if (font === "courier") return '"Courier New", Courier, monospace';
    return 'Arial, Helvetica, sans-serif';
  }

  function groupCards(cards) {
    const map = new Map();
    cards.forEach((card, index) => {
      const label = card.subcategory || "Other";
      if (!map.has(label)) map.set(label, []);
      map.get(label).push({ card, index });
    });
    return [...map.entries()].map(([label, items]) => ({ label, items }));
  }

  function create(root, inputDeck, options = {}) {
    if (!root || !window.Flashcards) return null;

    let deck = window.Flashcards.normalizeDeck(inputDeck);
    let currentIndex = deck.cards.findIndex(card => card.enabled !== false);
    if (currentIndex < 0 && deck.cards.length) currentIndex = 0;
    let flipped = false;
    const learned = new Set(Array.isArray(options.initialLearned) ? options.initialLearned.filter(index => Number.isInteger(index) && index >= 0 && index < deck.cards.length) : []);
    let previousRandomIndex = -1;

    root.innerHTML = `
      <div class="fc-study-shell">
        <button class="fc-mobile-nav-button" type="button" data-action="toggle-nav" aria-expanded="false">☰ Terms</button>
        <div class="fc-study-layout">
          <aside class="fc-nav" aria-label="Flashcard terms">
            <div class="fc-nav-head">
              <div>
                <div class="fc-nav-kicker">Study deck</div>
                <div class="fc-nav-title" data-role="nav-title"></div>
              </div>
              <button class="fc-nav-close" type="button" data-action="close-nav" aria-label="Close terms">×</button>
            </div>
            <label class="fc-select-all">
              <input type="checkbox" data-role="select-all" />
              <span><strong>All terms</strong><small data-role="selected-summary"></small></span>
            </label>
            <div class="fc-nav-groups" data-role="groups"></div>
          </aside>

          <section class="fc-stage" aria-label="Flashcard study area">
            <div class="fc-stage-topline">
              <div>
                <div class="fc-stage-kicker" data-role="unit"></div>
                <h2 class="fc-stage-title" data-role="deck-title"></h2>
              </div>
              <div class="fc-progress-chip" data-role="progress">0 learned</div>
            </div>

            <div class="fc-empty" data-role="empty" hidden>
              <strong>No terms are in the rotation.</strong>
              <span>Choose at least one term in the navigator.</span>
            </div>

            <button class="fc-card-scene" type="button" data-action="flip" aria-label="Flip flashcard">
              <span class="fc-card" data-role="card">
                <span class="fc-card-face fc-card-front">
                  <span class="fc-term" data-role="term"></span>
                  <span class="fc-card-hint">Click to flip</span>
                </span>
                <span class="fc-card-face fc-card-back">
                  <span class="fc-card-unit" data-role="card-unit"></span>
                  <span class="fc-definition" data-role="definition"></span>
                  <span class="fc-card-subcategory" data-role="subcategory"></span>
                  <span class="fc-card-hint">Click to flip back</span>
                </span>
              </span>
            </button>

            <div class="fc-controls" aria-label="Flashcard controls">
              <button type="button" class="fc-control fc-control-secondary" data-action="flip">↻ Flip</button>
              <button type="button" class="fc-control fc-control-learned" data-action="learned">✓ Learned</button>
              <button type="button" class="fc-control fc-control-primary" data-action="next">Next random →</button>
            </div>
            <div class="fc-lower-controls">
              <span data-role="position"></span>
              <button type="button" class="fc-reset-button" data-action="reset-learned">Reset learned</button>
            </div>
          </section>
        </div>
        <div class="fc-nav-shade" data-action="close-nav"></div>
      </div>`;

    const q = selector => root.querySelector(selector);
    const qa = selector => [...root.querySelectorAll(selector)];
    const els = {
      navTitle: q('[data-role="nav-title"]'),
      deckTitle: q('[data-role="deck-title"]'),
      unit: q('[data-role="unit"]'),
      groups: q('[data-role="groups"]'),
      selectAll: q('[data-role="select-all"]'),
      selectedSummary: q('[data-role="selected-summary"]'),
      progress: q('[data-role="progress"]'),
      empty: q('[data-role="empty"]'),
      cardScene: q('.fc-card-scene'),
      card: q('[data-role="card"]'),
      term: q('[data-role="term"]'),
      cardUnit: q('[data-role="card-unit"]'),
      definition: q('[data-role="definition"]'),
      subcategory: q('[data-role="subcategory"]'),
      position: q('[data-role="position"]'),
      mobileNav: q('[data-action="toggle-nav"]')
    };

    function enabledIndices(includeLearned = true) {
      return deck.cards
        .map((card, index) => ({ card, index }))
        .filter(item => item.card.enabled !== false && (includeLearned || !learned.has(item.index)))
        .map(item => item.index);
    }

    function ensureCurrent() {
      if (!deck.cards.length) {
        currentIndex = -1;
        return;
      }
      if (currentIndex < 0 || currentIndex >= deck.cards.length) {
        currentIndex = enabledIndices()[0] ?? 0;
      }
    }

    function updateMasterCheckboxes() {
      const selected = deck.cards.filter(card => card.enabled !== false).length;
      els.selectAll.checked = selected === deck.cards.length && deck.cards.length > 0;
      els.selectAll.indeterminate = selected > 0 && selected < deck.cards.length;
      els.selectedSummary.textContent = `${selected} of ${deck.cards.length} included`;

      qa('[data-category-checkbox]').forEach(box => {
        const category = box.dataset.categoryCheckbox;
        const indices = deck.cards
          .map((card, index) => ({ card, index }))
          .filter(item => (item.card.subcategory || "Other") === category)
          .map(item => item.index);
        const count = indices.filter(index => deck.cards[index].enabled !== false).length;
        box.checked = count === indices.length && indices.length > 0;
        box.indeterminate = count > 0 && count < indices.length;
      });
    }

    function renderNavigator() {
      const groups = groupCards(deck.cards);
      els.groups.innerHTML = groups.map((group, groupIndex) => `
        <section class="fc-nav-group ${groupIndex === 0 ? "is-open" : ""}" data-category="${escapeHtml(group.label)}">
          <div class="fc-nav-group-head">
            <label class="fc-category-check" title="Include or exclude this whole category">
              <input type="checkbox" data-category-checkbox="${escapeHtml(group.label)}" />
              <span>${escapeHtml(group.label)}</span>
            </label>
            <button type="button" class="fc-category-toggle" data-action="toggle-category" aria-expanded="${groupIndex === 0 ? "true" : "false"}" aria-label="Show or hide ${escapeHtml(group.label)} terms">⌄</button>
          </div>
          <div class="fc-nav-items">
            ${group.items.map(({ card, index }) => `
              <div class="fc-term-row" data-card-row="${index}">
                <input class="fc-term-check" type="checkbox" data-card-check="${index}" aria-label="Include ${escapeHtml(card.term)}" />
                <button type="button" class="fc-term-jump" data-action="jump" data-index="${index}">${escapeHtml(card.term)}</button>
                <span class="fc-learned-mark" data-learned-mark="${index}" title="Learned">✓</span>
              </div>`).join("")}
          </div>
        </section>`).join("");

      deck.cards.forEach((card, index) => {
        const box = q(`[data-card-check="${index}"]`);
        if (box) box.checked = card.enabled !== false;
      });
      updateMasterCheckboxes();
      updateLearnedMarks();
      updateCurrentRow();
    }

    function updateLearnedMarks() {
      deck.cards.forEach((card, index) => {
        const mark = q(`[data-learned-mark="${index}"]`);
        const row = q(`[data-card-row="${index}"]`);
        const isLearned = learned.has(index);
        if (mark) mark.classList.toggle("is-visible", isLearned);
        if (row) row.classList.toggle("is-learned", isLearned);
      });
    }

    function updateCurrentRow() {
      qa('[data-card-row]').forEach(row => {
        row.classList.toggle("is-current", Number(row.dataset.cardRow) === currentIndex);
      });
    }

    function updateCard() {
      ensureCurrent();
      const selected = enabledIndices();
      const remaining = enabledIndices(false);
      const empty = selected.length === 0;
      els.empty.hidden = !empty;
      els.cardScene.hidden = deck.cards.length === 0 || currentIndex < 0;
      qa('.fc-controls button').forEach(button => { button.disabled = deck.cards.length === 0 || currentIndex < 0; });

      els.deckTitle.textContent = deck.title;
      els.navTitle.textContent = deck.title;
      els.unit.textContent = deck.unit || "Digital flashcards";
      root.style.setProperty("--fc-term-font", fontStack(deck.termFont));

      if (!empty && currentIndex >= 0) {
        const card = deck.cards[currentIndex];
        els.term.textContent = card.term;
        els.cardUnit.textContent = deck.unit || "";
        els.cardUnit.hidden = !deck.unit;
        els.definition.textContent = card.definition;
        els.subcategory.textContent = deck.showSubcategory ? (card.subcategory || "") : "";
        els.subcategory.hidden = !(deck.showSubcategory && card.subcategory);
        els.card.classList.toggle("is-flipped", flipped);
        els.cardScene.setAttribute("aria-label", flipped ? `Definition: ${card.definition}. Flip to term.` : `Term: ${card.term}. Flip to definition.`);
        const selectedPosition = selected.indexOf(currentIndex);
        els.position.textContent = selectedPosition >= 0 ? `Card ${selectedPosition + 1} of ${selected.length} selected` : "Viewing an excluded term";
      } else {
        els.position.textContent = "0 cards selected";
      }

      const selectedLearned = selected.filter(index => learned.has(index)).length;
      els.progress.textContent = `${selectedLearned} of ${selected.length} learned`;
      const learnedButton = q('[data-action="learned"]');
      if (learnedButton) {
        const currentLearned = learned.has(currentIndex);
        learnedButton.classList.toggle("is-learned", currentLearned);
        learnedButton.textContent = currentLearned ? "✓ Learned" : "✓ Mark learned";
      }

      const reset = q('[data-action="reset-learned"]');
      if (reset) reset.disabled = learned.size === 0;
      const next = q('[data-action="next"]');
      if (next) next.disabled = empty;

      updateLearnedMarks();
      updateCurrentRow();
      if (typeof options.onStateChange === "function") options.onStateChange(getDeck());
      if (typeof options.onProgressChange === "function") options.onProgressChange([...learned].sort((a, b) => a - b));
    }

    function flipCard() {
      if (currentIndex < 0 || !deck.cards.length) return;
      flipped = !flipped;
      els.card.classList.toggle("is-flipped", flipped);
    }

    function chooseRandom() {
      let candidates = enabledIndices(false);
      if (!candidates.length) {
        candidates = enabledIndices(true);
        if (!candidates.length) return;
      }
      if (candidates.length > 1) {
        candidates = candidates.filter(index => index !== currentIndex && index !== previousRandomIndex);
        if (!candidates.length) candidates = enabledIndices(false).filter(index => index !== currentIndex);
        if (!candidates.length) candidates = enabledIndices(true).filter(index => index !== currentIndex);
      }
      previousRandomIndex = currentIndex;
      currentIndex = candidates[Math.floor(Math.random() * candidates.length)] ?? candidates[0];
      flipped = false;
      updateCard();
    }

    function markLearned() {
      if (currentIndex < 0) return;
      if (learned.has(currentIndex)) learned.delete(currentIndex);
      else learned.add(currentIndex);
      updateCard();
      if (learned.has(currentIndex)) chooseRandom();
    }

    function setEnabled(index, enabled) {
      if (!deck.cards[index]) return;
      deck.cards[index].enabled = Boolean(enabled);
      if (!deck.cards[currentIndex] || deck.cards[currentIndex].enabled === false) {
        currentIndex = enabledIndices()[0] ?? currentIndex;
        flipped = false;
      }
      updateMasterCheckboxes();
      updateCard();
    }

    function setCategoryEnabled(category, enabled) {
      deck.cards.forEach(card => {
        if ((card.subcategory || "Other") === category) card.enabled = Boolean(enabled);
      });
      if (deck.cards[currentIndex] && deck.cards[currentIndex].enabled === false) {
        currentIndex = enabledIndices()[0] ?? currentIndex;
        flipped = false;
      }
      deck.cards.forEach((card, index) => {
        const box = q(`[data-card-check="${index}"]`);
        if (box) box.checked = card.enabled !== false;
      });
      updateMasterCheckboxes();
      updateCard();
    }

    function setAllEnabled(enabled) {
      deck.cards.forEach(card => { card.enabled = Boolean(enabled); });
      qa('[data-card-check]').forEach(box => { box.checked = Boolean(enabled); });
      if (enabled && (currentIndex < 0 || deck.cards[currentIndex].enabled === false)) currentIndex = 0;
      updateMasterCheckboxes();
      updateCard();
    }

    function jumpTo(index) {
      if (!deck.cards[index]) return;
      currentIndex = index;
      flipped = false;
      updateCard();
      root.classList.remove("fc-nav-open");
      els.mobileNav.setAttribute("aria-expanded", "false");
    }

    function toggleNav(open) {
      const next = typeof open === "boolean" ? open : !root.classList.contains("fc-nav-open");
      root.classList.toggle("fc-nav-open", next);
      els.mobileNav.setAttribute("aria-expanded", String(next));
    }

    root.addEventListener("click", event => {
      const actionEl = event.target.closest("[data-action]");
      if (!actionEl) return;
      const action = actionEl.dataset.action;
      if (action === "flip") flipCard();
      else if (action === "next") chooseRandom();
      else if (action === "learned") markLearned();
      else if (action === "reset-learned") {
        learned.clear();
        updateCard();
      } else if (action === "jump") {
        jumpTo(Number(actionEl.dataset.index));
      } else if (action === "toggle-category") {
        const group = actionEl.closest(".fc-nav-group");
        if (group) {
          const open = !group.classList.contains("is-open");
          group.classList.toggle("is-open", open);
          actionEl.setAttribute("aria-expanded", String(open));
        }
      } else if (action === "toggle-nav") toggleNav();
      else if (action === "close-nav") toggleNav(false);
    });

    root.addEventListener("change", event => {
      const cardBox = event.target.closest("[data-card-check]");
      if (cardBox) {
        setEnabled(Number(cardBox.dataset.cardCheck), cardBox.checked);
        return;
      }
      const categoryBox = event.target.closest("[data-category-checkbox]");
      if (categoryBox) {
        setCategoryEnabled(categoryBox.dataset.categoryCheckbox, categoryBox.checked);
        return;
      }
      if (event.target === els.selectAll) setAllEnabled(els.selectAll.checked);
    });

    root.addEventListener("keydown", event => {
      if (event.target.matches("input, textarea, select, button")) return;
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        flipCard();
      } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "n") {
        chooseRandom();
      } else if (event.key.toLowerCase() === "l") {
        markLearned();
      }
    });

    function getDeck() {
      return window.Flashcards.normalizeDeck(deck);
    }

    function setDeck(nextDeck, config = {}) {
      const oldEnabled = deck.cards.map(card => card.enabled !== false);
      deck = window.Flashcards.normalizeDeck(nextDeck);
      if (config.preserveSelection && oldEnabled.length === deck.cards.length) {
        deck.cards.forEach((card, index) => { card.enabled = oldEnabled[index]; });
      }
      if (!config.preserveLearned) learned.clear();
      currentIndex = deck.cards.findIndex(card => card.enabled !== false);
      if (currentIndex < 0 && deck.cards.length) currentIndex = 0;
      flipped = false;
      window.Flashcards.applyTheme(root, deck.theme);
      renderNavigator();
      updateCard();
    }

    function updateMeta(nextDeck) {
      const next = window.Flashcards.normalizeDeck(nextDeck);
      deck.title = next.title;
      deck.unit = next.unit;
      deck.showSubcategory = next.showSubcategory;
      deck.termFont = next.termFont;
      deck.theme = next.theme;
      window.Flashcards.applyTheme(root, deck.theme);
      updateCard();
    }

    window.Flashcards.applyTheme(root, deck.theme);
    renderNavigator();
    updateCard();

    return {
      getDeck,
      setDeck,
      updateMeta,
      showCard: jumpTo,
      next: chooseRandom,
      flip: flipCard,
      getLearned: () => [...learned].sort((a, b) => a - b),
      resetLearned: () => { learned.clear(); updateCard(); }
    };
  }

  window.FlashcardStudy = { create };
})();
