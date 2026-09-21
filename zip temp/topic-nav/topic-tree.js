(function(){
  const cfg = window.TOPIC_TREE_CONFIG;
  if(!cfg || !Array.isArray(cfg.sections)) return;

  const main = document.getElementById(cfg.mainId || 'content');
  if(!main) return;

  const norm = p => {
    try { p = new URL(p, location.origin).pathname; } catch(e) {}
    return String(p || '/').replace(/\/+$/, '') || '/';
  };
  const current = norm(location.pathname);
  const currentHash = location.hash || '';
  const hrefKey = href => {
    try { const u = new URL(href, location.origin); return norm(u.pathname) + (u.hash || ''); }
    catch(e){ return norm(href); }
  };

  const allItems = cfg.sections.flatMap(s => s.items || []);
  let activeHref = null;
  // Prefer an exact path + hash match. This lets a navigator item point directly to a named feature on a page.
  if(currentHash){
    const hashExact = allItems.find(i => i.href && hrefKey(i.href) === current + currentHash);
    if(hashExact) activeHref = hashExact.href;
  }
  // If no anchor-specific item matched, prefer the ordinary page link without a hash.
  if(!activeHref){
    const exact = allItems.find(i => i.href && !new URL(i.href, location.origin).hash && norm(i.href) === current);
    if(exact) activeHref = exact.href;
  }
  if(!activeHref){
    const pref = allItems
      .filter(i => i.matchPrefix && current.startsWith(norm(i.matchPrefix)))
      .sort((a,b) => norm(b.matchPrefix).length - norm(a.matchPrefix).length)[0];
    if(pref) activeHref = pref.href;
  }

  const rail = document.createElement('aside');
  rail.className = 'topicTreeRail';
  rail.setAttribute('aria-label', `${cfg.title || 'Topic'} navigation`);

  const panel = document.createElement('nav');
  panel.className = 'topicTreePanel';

  const head = document.createElement('div');
  head.className = 'topicTreeHead';
  head.innerHTML = `<div class="topicTreeKicker">Explore</div><div class="topicTreeTitle"></div>`;
  head.querySelector('.topicTreeTitle').textContent = cfg.title || 'Topic';
  panel.appendChild(head);

  cfg.sections.forEach(section => {
    const group = document.createElement('section');
    group.className = 'topicTreeGroup';
    const h = document.createElement('h2');
    h.textContent = section.label;
    group.appendChild(h);

    const list = document.createElement('div');
    list.className = 'topicTreeItems';
    (section.items || []).forEach(item => {
      let el;
      if(item.href && !item.disabled){
        el = document.createElement('a');
        el.href = item.href;
        if(activeHref && hrefKey(activeHref) === hrefKey(item.href)){
          el.classList.add('active');
          el.setAttribute('aria-current','page');
        }
      } else {
        el = document.createElement('span');
        el.classList.add('planned');
        el.setAttribute('aria-disabled','true');
      }
      el.classList.add('topicTreeItem');
      el.textContent = item.label;
      if(item.note) el.title = item.note;
      list.appendChild(el);
    });
    group.appendChild(list);
    panel.appendChild(group);
  });

  rail.appendChild(panel);

  const layout = document.createElement('div');
  layout.className = 'topicTreeLayout';
  main.parentNode.insertBefore(layout, main);
  layout.appendChild(rail);
  layout.appendChild(main);
  document.body.classList.add('topicTreeActive');

  const toggle = document.createElement('button');
  toggle.className = 'topicTreeToggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-label', `Open ${cfg.title || 'topic'} navigation`);
  toggle.innerHTML = '<span aria-hidden="true">☰</span><span>Explore</span>';
  document.body.appendChild(toggle);

  const close = document.createElement('button');
  close.className = 'topicTreeClose';
  close.type = 'button';
  close.setAttribute('aria-label','Close topic navigation');
  close.textContent = '×';
  panel.prepend(close);

  const shade = document.createElement('div');
  shade.className = 'topicTreeShade';
  document.body.appendChild(shade);

  function setOpen(open){
    document.body.classList.toggle('topicTreeOpen', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('topicTreeOpen')));
  close.addEventListener('click', () => setOpen(false));
  shade.addEventListener('click', () => setOpen(false));
  panel.addEventListener('click', e => {
    if(e.target.closest('a') && matchMedia('(max-width: 1099px)').matches) setOpen(false);
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') setOpen(false); });
})();
