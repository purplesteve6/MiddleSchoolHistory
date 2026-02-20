(function(){
  function getParam(name){
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  // topic can be a path like "/6/RomanEmperors"
  let topic = getParam("topic") || "/6/RomanEmperors";

  // normalize: ensure it starts with "/" and does not end with "/"
  if (!topic.startsWith("/")) topic = "/" + topic;
  topic = topic.replace(/\/+$/, "");

  // Config lives INSIDE the topic folder
  const cfgUrl = `${topic}/timeline-config.js`;

  // Base folder for resolving images/hrefs inside timeline-core.js
  window.TIMELINE_CONFIG_BASE = `${topic}/`;

  const cfg = document.createElement("script");
  cfg.src = cfgUrl;
  cfg.async = true;

  cfg.onload = () => {
    const core = document.createElement("script");
    core.src = `/timeline/timeline-core.js`;
    core.async = true;
    document.body.appendChild(core);
  };

  cfg.onerror = () => {
    const mount = document.getElementById("timelineMount");
    if (mount){
      mount.innerHTML = `
        <div style="padding:.5rem .25rem; color: rgba(255,246,229,.9); font-weight:900;">
          Timeline config not found.<br/>
          Expected: <code style="font-weight:900;">${cfgUrl}</code>
        </div>
      `;
    }
  };

  document.body.appendChild(cfg);
})();
