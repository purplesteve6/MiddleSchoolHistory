async function loadInto(id, url){
  const el = document.getElementById(id);
  if(!el) return;

  const res = await fetch(url, { cache: "no-store" });
  if(!res.ok){
    console.warn(`[include.js] Failed to load ${url} (HTTP ${res.status})`);
    return;
  }
  el.innerHTML = await res.text();
}

// Load a script once (even if multiple pages/partials try)
function loadScriptOnce(src){
  return new Promise((resolve, reject) => {
    // If already present, resolve immediately
    if (document.querySelector(`script[src="${src}"]`)) return resolve();

    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(s);
  });
}

function applyConfig(){
  const cfg = window.TOPIC_CONFIG || {};

  document.querySelectorAll("[data-bind]").forEach(el=>{
    const key = el.getAttribute("data-bind");
    if(cfg[key]) el.setAttribute("src", cfg[key]);
  });

  document.querySelectorAll("[data-bind-text]").forEach(el=>{
    const key = el.getAttribute("data-bind-text");
    if(cfg[key]) el.textContent = cfg[key];
  });

  document.querySelectorAll("[data-bind-href]").forEach(el=>{
    const key = el.getAttribute("data-bind-href");
    if(cfg[key]) el.setAttribute("href", cfg[key]);
  });

  const y = document.getElementById("copyright-year");
  if(y) y.textContent = new Date().getFullYear();
}

(async function(){
  // Works for BOTH spellings: /emperors/ and /empeors/
  const inEmperorSubfolder = /\/empe?rors\//i.test(location.pathname);
  const base = inEmperorSubfolder ? ".." : "."; // (left as-is; currently unused)

  const headerEl = document.getElementById("siteHeader");
  const footerEl = document.getElementById("siteFooter");

  const headerUrl = headerEl?.getAttribute("data-include") || "/partials/header.html";
  const footerUrl = footerEl?.getAttribute("data-include") || "/partials/footer.html";

  await loadInto("siteHeader", headerUrl);
  await loadInto("siteFooter", footerUrl);

  // ✅ If we injected the MAIN header, load nav.js now (after elements exist)
  if (headerUrl.includes("main-header.html")) {
    try {
      await loadScriptOnce("/nav.js");
    } catch (e) {
      console.error(e);
    }
  }

  applyConfig();
})();
