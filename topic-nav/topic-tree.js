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
  const flatten = items => (items || []).flatMap(item => [item, ...flatten(item.children)]);
  const allItems = cfg.sections.flatMap(s => flatten(s.items));

  let activeHref = null;
  if(currentHash){
    const hashExact = allItems.find(i => i.href && hrefKey(i.href) === current + currentHash);
    if(hashExact) activeHref = hashExact.href;
  }
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

  const itemIsActive = item => !!(item.href && activeHref && hrefKey(activeHref) === hrefKey(item.href));
  const itemContainsActive = item => itemIsActive(item) || (item.children || []).some(itemContainsActive);

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

  function buildItem(item, depth=0){
    const node = document.createElement('div');
    node.className = 'topicTreeItemNode';
    if(depth) node.classList.add('is-nested');

    let el;
    if(item.href && !item.disabled){
      el = document.createElement('a');
      el.href = item.href;
      if(itemIsActive(item)){
        el.classList.add('active');
        el.setAttribute('aria-current','page');
      } else if((item.children || []).some(itemContainsActive)){
        el.classList.add('ancestor-active');
      }
    } else {
      el = document.createElement('span');
      el.classList.add('planned');
      el.setAttribute('aria-disabled','true');
    }
    el.classList.add('topicTreeItem');
    if(item.children && item.children.length) el.classList.add('has-children');
    el.textContent = item.label;
    if(item.note) el.title = item.note;
    node.appendChild(el);

    if(item.children && item.children.length){
      const children = document.createElement('div');
      children.className = 'topicTreeChildren';
      item.children.forEach(child => children.appendChild(buildItem(child, depth+1)));
      node.appendChild(children);
    }
    return node;
  }

  cfg.sections.forEach((section, sectionIndex) => {
    const group = document.createElement('section');
    group.className = 'topicTreeGroup';

    const list = document.createElement('div');
    list.className = 'topicTreeItems';
    const listId = `topicTreeItems-${sectionIndex}`;
    list.id = listId;

    const sectionItems = section.items || [];
    const containsActive = sectionItems.some(itemContainsActive);

    if(cfg.accordion){
      group.classList.add('isAccordion');
      const sectionToggle = document.createElement('button');
      sectionToggle.type = 'button';
      sectionToggle.className = 'topicTreeGroupToggle';
      sectionToggle.setAttribute('aria-controls', listId);
      sectionToggle.innerHTML = `<span class="topicTreeGroupLabel"></span><span class="topicTreeChevron" aria-hidden="true">⌄</span>`;
      sectionToggle.querySelector('.topicTreeGroupLabel').textContent = section.label;
      const initiallyOpen = containsActive || (!activeHref && sectionIndex === 0) || section.open === true;
      group.classList.toggle('is-open', initiallyOpen);
      sectionToggle.setAttribute('aria-expanded', String(initiallyOpen));
      sectionToggle.addEventListener('click', () => {
        const opening = !group.classList.contains('is-open');
        if(opening){
          panel.querySelectorAll('.topicTreeGroup.isAccordion.is-open').forEach(other => {
            if(other === group) return;
            other.classList.remove('is-open');
            const otherButton = other.querySelector('.topicTreeGroupToggle');
            if(otherButton) otherButton.setAttribute('aria-expanded','false');
          });
        }
        group.classList.toggle('is-open', opening);
        sectionToggle.setAttribute('aria-expanded', String(opening));
      });
      group.appendChild(sectionToggle);
    } else {
      const h = document.createElement('h2');
      h.textContent = section.label;
      group.appendChild(h);
    }

    sectionItems.forEach(item => list.appendChild(buildItem(item)));
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
