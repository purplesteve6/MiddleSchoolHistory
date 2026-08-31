/* ============================================================
   Middle School History Coloring Book — Viewer Bootstrap
   Resolves ?page=<id> from the shared page manifest, creates the
   engine config, then loads the shared shell and engine.
   ============================================================ */

(function () {
  "use strict";

  const pages = Array.isArray(window.COLORING_BOOK_PAGES) ? window.COLORING_BOOK_PAGES : [];
  const params = new URLSearchParams(window.location.search);
  const requestedId = String(params.get("page") || "").trim();
  const page = pages.find((item) => item && item.id === requestedId);
  const shellHost = document.getElementById("coloringBookShell");

  function showViewerError(message) {
    document.title = "Coloring Book | Middle School History";
    if (!shellHost) return;
    shellHost.innerHTML = `
      <main class="coloring-viewer-error">
        <div class="coloring-viewer-error__card">
          <h1>Coloring page not found</h1>
          <p>${message}</p>
          <a href="/games/coloring-book/">← Back to the Coloring Book</a>
        </div>
      </main>`;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.body.appendChild(script);
    });
  }

  if (!requestedId) {
    showViewerError("Choose a coloring page from the gallery first.");
    return;
  }

  if (!page || !page.file || !page.title) {
    showViewerError("That coloring page is not listed in the current catalog.");
    return;
  }

  const defaults = {
    colorGroupId: "color",
    inkGroupId: "ink",
    defaultTool: "bucket",
    defaultColor: "#D7263D",
    defaultPalette: "basic",
    defaultLayerPosition: "below",
    palettes: ["basic", "americana", "nationalParks", "earthTones", "autumn", "pastels"],
    maxZoom: 4
  };

  window.COLORING_BOOK_CONFIG = Object.assign(
    {},
    defaults,
    page.options || {},
    {
      title: page.title,
      svgPath: page.file,
      printTitle: page.printTitle || `${page.title} Coloring Page`
    }
  );

  document.title = `${page.title} | Middle School History`;

  loadScript("/games/coloring-book/engine/coloring-book-shell.js?v=9.4")
    .then(() => loadScript("/games/coloring-book/engine/coloring-book.js?v=9.4"))
    .catch((error) => {
      console.error("[coloring-book-viewer]", error);
      showViewerError("The coloring tools could not be loaded. Please return to the gallery and try again.");
    });
})();
