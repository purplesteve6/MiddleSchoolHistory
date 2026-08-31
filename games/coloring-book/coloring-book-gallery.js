/* ============================================================
   Middle School History Coloring Book — Catalog / Gallery
   All cards, search, filters, pagination and Surprise Me are
   generated from coloring-pages-manifest.js.
   ============================================================ */

(function () {
  "use strict";

  const pages = Array.isArray(window.COLORING_BOOK_PAGES) ? window.COLORING_BOOK_PAGES : [];
  const filters = window.COLORING_BOOK_FILTERS || {};
  const gradeOptions = Array.isArray(filters.gradeLevels) ? filters.gradeLevels : [];
  const subjectOptions = Array.isArray(filters.subjects) ? filters.subjects : [];

  const els = {
    search: document.getElementById("coloringSearch"),
    grade: document.getElementById("coloringGradeFilter"),
    subject: document.getElementById("coloringSubjectFilter"),
    pageSize: document.getElementById("coloringPageSize"),
    surprise: document.getElementById("coloringSurpriseBtn"),
    clear: document.getElementById("coloringClearFilters"),
    grid: document.getElementById("coloringGrid"),
    empty: document.getElementById("coloringEmpty"),
    count: document.getElementById("coloringResultCount"),
    pagination: document.getElementById("coloringPagination")
  };

  let currentPage = 1;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function optionLabel(options, id) {
    return options.find((item) => item && item.id === id)?.label || id;
  }

  function fillSelect(select, options, allLabel) {
    if (!select) return;
    select.innerHTML = `<option value="">${escapeHtml(allLabel)}</option>`;
    options.forEach((item) => {
      if (!item?.id || !item?.label) return;
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.label;
      select.appendChild(option);
    });
  }

  function pageSearchText(page) {
    const subjects = (page.subjects || []).map((id) => optionLabel(subjectOptions, id));
    const grades = (page.gradeLevels || []).map((id) => optionLabel(gradeOptions, id));
    return [
      page.title,
      page.description,
      ...(page.tags || []),
      ...subjects,
      ...grades
    ].join(" ").toLowerCase();
  }

  function filteredPages() {
    const search = String(els.search?.value || "").trim().toLowerCase();
    const grade = els.grade?.value || "";
    const subject = els.subject?.value || "";

    return pages.filter((page) => {
      if (!page?.id || !page?.title || !page?.file) return false;

      if (search && !pageSearchText(page).includes(search)) return false;

      const pageGrades = Array.isArray(page.gradeLevels) ? page.gradeLevels : [];
      if (grade && pageGrades.length && !pageGrades.includes(grade)) return false;

      const pageSubjects = Array.isArray(page.subjects) ? page.subjects : [];
      if (subject && !pageSubjects.includes(subject)) return false;

      return true;
    });
  }

  function metadataChips(page) {
    const chips = [];
    const grades = Array.isArray(page.gradeLevels) ? page.gradeLevels : [];
    const subjects = Array.isArray(page.subjects) ? page.subjects : [];

    if (grades.length) {
      chips.push(...grades.map((id) => optionLabel(gradeOptions, id)));
    }
    chips.push(...subjects.map((id) => optionLabel(subjectOptions, id)));

    return chips.map((label) => `<span class="coloring-card__chip">${escapeHtml(label)}</span>`).join("");
  }

  function renderCard(page) {
    const href = `/games/coloring-book/viewer/?page=${encodeURIComponent(page.id)}`;
    const initialThumb = page.thumbnail || page.file;
    const safeFile = escapeHtml(page.file);
    const safeThumb = escapeHtml(initialThumb);
    const safeTitle = escapeHtml(page.title);
    const safeDescription = escapeHtml(page.description || "Choose this page to start coloring.");

    return `
      <a class="coloring-card" href="${href}">
        <div class="coloring-card__thumb">
          <img src="${safeThumb}" data-fallback-src="${safeFile}" alt="${safeTitle} coloring page preview" loading="lazy" />
        </div>
        <div class="coloring-card__body">
          <div class="coloring-card__label">${safeTitle}</div>
          <div class="coloring-card__sub">${safeDescription}</div>
          <div class="coloring-card__chips">${metadataChips(page)}</div>
        </div>
      </a>`;
  }

  function renderPagination(totalPages) {
    if (!els.pagination) return;
    els.pagination.innerHTML = "";
    els.pagination.hidden = totalPages <= 1;
    if (totalPages <= 1) return;

    const addButton = (label, pageNumber, options = {}) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "coloring-page-button";
      button.textContent = label;
      button.disabled = !!options.disabled;
      if (options.active) {
        button.classList.add("is-active");
        button.setAttribute("aria-current", "page");
      }
      button.addEventListener("click", () => {
        currentPage = pageNumber;
        render();
        document.querySelector(".coloring-catalog-controls")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      els.pagination.appendChild(button);
    };

    addButton("‹", Math.max(1, currentPage - 1), { disabled: currentPage === 1 });

    const windowStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const windowEnd = Math.min(totalPages, windowStart + 4);
    for (let i = windowStart; i <= windowEnd; i += 1) {
      addButton(String(i), i, { active: i === currentPage });
    }

    addButton("›", Math.min(totalPages, currentPage + 1), { disabled: currentPage === totalPages });
  }

  function wireThumbnailFallbacks() {
    els.grid?.querySelectorAll("img[data-fallback-src]").forEach((img) => {
      img.addEventListener("error", () => {
        const fallback = img.dataset.fallbackSrc;
        if (!fallback || img.src.endsWith(fallback)) return;
        img.src = fallback;
      }, { once: true });
    });
  }

  function render() {
    const matches = filteredPages();
    const pageSize = Math.max(1, Number(els.pageSize?.value) || 24);
    const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);

    const start = (currentPage - 1) * pageSize;
    const visible = matches.slice(start, start + pageSize);

    if (els.grid) {
      els.grid.innerHTML = visible.map(renderCard).join("");
      els.grid.hidden = visible.length === 0;
    }
    wireThumbnailFallbacks();

    if (els.empty) els.empty.hidden = matches.length !== 0;
    if (els.count) {
      els.count.textContent = `${matches.length} ${matches.length === 1 ? "page" : "pages"}`;
    }

    renderPagination(matches.length ? totalPages : 0);
  }

  function resetAndRender() {
    currentPage = 1;
    render();
  }

  function surpriseMe() {
    const matches = filteredPages();
    const choices = matches.length ? matches : pages.filter((page) => page?.id && page?.file);
    if (!choices.length) return;
    const pick = choices[Math.floor(Math.random() * choices.length)];
    window.location.href = `/games/coloring-book/viewer/?page=${encodeURIComponent(pick.id)}`;
  }

  function clearFilters() {
    if (els.search) els.search.value = "";
    if (els.grade) els.grade.value = "";
    if (els.subject) els.subject.value = "";
    resetAndRender();
    els.search?.focus();
  }

  fillSelect(els.grade, gradeOptions, "All Grade Levels");
  fillSelect(els.subject, subjectOptions, "All Subject Areas");

  els.search?.addEventListener("input", resetAndRender);
  els.grade?.addEventListener("change", resetAndRender);
  els.subject?.addEventListener("change", resetAndRender);
  els.pageSize?.addEventListener("change", resetAndRender);
  els.surprise?.addEventListener("click", surpriseMe);
  els.clear?.addEventListener("click", clearFilters);

  render();
})();
