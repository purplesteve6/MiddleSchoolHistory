(() => {
  "use strict";

  const F = window.Flashcards;
  const Study = window.FlashcardStudy;
  const loading = document.getElementById("studyLoading");
  const errorBox = document.getElementById("studyError");
  const errorMessage = document.getElementById("studyErrorMessage");
  const root = document.getElementById("studentStudyRoot");

  function shortHash(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function progressKey(payload) {
    return `msh-flashcard-progress-${shortHash(payload)}`;
  }

  function loadProgress(key, cardCount) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      if (!parsed) return null;
      const enabled = Array.isArray(parsed.enabled) && parsed.enabled.length === cardCount ? parsed.enabled.map(Boolean) : null;
      const learned = Array.isArray(parsed.learned) ? parsed.learned.filter(index => Number.isInteger(index) && index >= 0 && index < cardCount) : [];
      return { enabled, learned };
    } catch (error) {
      return null;
    }
  }

  function saveProgress(key, deck, learned) {
    try {
      localStorage.setItem(key, JSON.stringify({
        enabled: deck.cards.map(card => card.enabled !== false),
        learned
      }));
    } catch (error) {}
  }

  async function start() {
    if (!F || !Study) return;
    const payload = location.hash.replace(/^#/, "");
    if (!payload) {
      loading.hidden = true;
      errorBox.hidden = false;
      errorMessage.textContent = "No deck data was included in this link.";
      return;
    }

    try {
      let deck = await F.decodeDeck(payload);
      if (!deck.cards.length) throw new Error("This deck does not contain any cards.");

      document.title = `${deck.title} | Digital Flashcards | Middle School History`;
      const key = progressKey(payload);
      const saved = loadProgress(key, deck.cards.length);
      if (saved && saved.enabled) {
        deck.cards.forEach((card, index) => { card.enabled = saved.enabled[index]; });
      }

      let latestDeck = deck;
      let latestLearned = saved ? saved.learned : [];
      loading.hidden = true;
      root.hidden = false;

      Study.create(root, deck, {
        initialLearned: latestLearned,
        onStateChange: nextDeck => {
          latestDeck = nextDeck;
          saveProgress(key, latestDeck, latestLearned);
        },
        onProgressChange: learned => {
          latestLearned = learned;
          saveProgress(key, latestDeck, latestLearned);
        }
      });
    } catch (error) {
      loading.hidden = true;
      root.hidden = true;
      errorBox.hidden = false;
      errorMessage.textContent = error && error.message ? error.message : "The link may be incomplete or damaged.";
    }
  }

  start();
})();
