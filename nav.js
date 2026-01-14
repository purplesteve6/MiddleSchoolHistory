(() => {
  const band = document.getElementById("dropdownBand");
  const arrow = document.getElementById("dropdownArrow");
  const navItems = document.querySelectorAll(".nav-item");
  const panels = document.querySelectorAll(".dropdown-panel");

  let activeKey = null;
  let closeTimer = null;

  function showPanel(key, anchorEl) {
    // Only open band for dropdown-enabled items
    const panel = document.querySelector(`.dropdown-panel[data-panel="${key}"]`);
    if (!panel) return;

    // Close any previously visible panel
    panels.forEach(p => p.classList.remove("is-visible"));
    panel.classList.add("is-visible");

    // Mark active nav item
    navItems.forEach(li => li.classList.remove("is-active"));
    const item = document.querySelector(`.nav-item[data-menu="${key}"]`);
    if (item) item.classList.add("is-active");

    // Open the band
    band.classList.add("is-open");
    band.setAttribute("aria-hidden", "false");

    // Position arrow under hovered item (centered)
    const rect = anchorEl.getBoundingClientRect();
    const parentRect = band.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const left = centerX - parentRect.left - 10; // 10 = half arrow width
    arrow.style.left = `${Math.max(18, left)}px`;

    activeKey = key;
  }

  function hideBand() {
    band.classList.remove("is-open");
    band.setAttribute("aria-hidden", "true");
    panels.forEach(p => p.classList.remove("is-visible"));
    navItems.forEach(li => li.classList.remove("is-active"));
    activeKey = null;
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(hideBand, 140);
  }

  // Hover behavior like NatGeo:
  // - hover nav item opens band
  // - moving into band keeps it open
  navItems.forEach(item => {
    const key = item.getAttribute("data-menu");
    const isDropdown = item.classList.contains("has-dropdown");

    item.addEventListener("mouseenter", () => {
      clearTimeout(closeTimer);
      if (!isDropdown) {
        // Option: show “home” panel or close for non-dropdown items.
        // Here we close for non-dropdowns to keep it clean.
        hideBand();
        return;
      }
      showPanel(key, item);
    });

    item.addEventListener("mouseleave", () => {
      // Only schedule close if the cursor isn't entering the band
      scheduleClose();
    });
  });

  band.addEventListener("mouseenter", () => {
    clearTimeout(closeTimer);
  });

  band.addEventListener("mouseleave", () => {
    scheduleClose();
  });

  // Accessibility: ESC closes dropdown
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideBand();
  });
})();
