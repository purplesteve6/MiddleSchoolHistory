function applyConfig(root = document) {
  const cfg = window.TOPIC_CONFIG || {};

  root.querySelectorAll("[data-bind]").forEach(el => {
    const key = el.getAttribute("data-bind");
    if (cfg[key]) el.setAttribute("src", cfg[key]);
  });

  root.querySelectorAll("[data-bind-text]").forEach(el => {
    const key = el.getAttribute("data-bind-text");
    if (cfg[key]) el.textContent = cfg[key];
  });

  root.querySelectorAll("[data-bind-href]").forEach(el => {
    const key = el.getAttribute("data-bind-href");
    if (cfg[key]) el.setAttribute("href", cfg[key]);
  });

  const y = document.getElementById("copyright-year");
  if (y) y.textContent = new Date().getFullYear();
}

function injectHeaderFooter() {
  const headerHTML = `
<header class="topic-header">
  <a class="nav-logo" href="/">
    <img class="nav-logo-img" data-bind="mainLogo" alt="Middle School History">
  </a>

  <div class="nav">
    <div class="brand">
      <div class="columnIcon gradeBadge" aria-hidden="true">
        <img data-bind="badgeIcon" alt="">
      </div>

      <div class="brandText">
        <div class="brandKicker" data-bind-text="gradeKicker"></div>
        <div class="brandTitle" data-bind-text="title"></div>
        <div class="brandSub" data-bind-text="subtitle"></div>
      </div>
    </div>

    <nav aria-label="Page navigation">
      <a class="btn" data-bind-href="homeHref">
        🏛️ <span data-bind-text="homeLabel"></span>
      </a>
    </nav>
  </div>
</header>
`;

  const footerHTML = `
<footer class="site-footer" role="contentinfo">
  <hr class="footer-rule" />

  <div class="footer-inner">
    <div class="footer-brand">
      <img
        src="/assets/images/logo/MSHistory_Logo_Basic_Web.png"
        alt="Middle School History"
        class="footer-logo-icon"
      />
      <img
        src="/assets/images/logo/MSHistory_Logo_Text_Basic.png"
        alt=""
        aria-hidden="true"
        class="footer-logo-text"
      />
    </div>

    <div class="footer-copy">
      © <span id="copyright-year"></span>
      Stephen Sovocool ·
      <span class="footer-site">MiddleSchoolHistory.com</span>
      <br />
      All rights reserved.
    </div>
  </div>
</footer>
`;

  const h = document.getElementById("siteHeader");
  const f = document.getElementById("siteFooter");

  if (h) h.innerHTML = headerHTML;
  if (f) f.innerHTML = footerHTML;

  applyConfig(document);
}

(function () {
  // Make sure DOM exists before we inject
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectHeaderFooter);
  } else {
    injectHeaderFooter();
  }
})();
