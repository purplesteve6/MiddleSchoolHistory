document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-reveal]');
  if (!button) return;
  const box = document.getElementById(button.dataset.reveal);
  if (!box) return;
  const group = button.closest('.decisionBox');
  if (group) {
    group.querySelectorAll('.revealPanel').forEach(p => p.classList.remove('show'));
    group.querySelectorAll('[data-reveal]').forEach(b => b.classList.remove('selected'));
  }
  button.classList.add('selected');
  box.classList.add('show');
});

// Battle icon strip: convert vertical mouse-wheel motion to horizontal scrolling
// while the pointer is over the battle navigator. At either end, normal page
// scrolling is allowed to continue.
document.addEventListener('DOMContentLoaded', () => {
  const strip = document.querySelector('.battleIconNav .battleNavScroll');
  if (!strip) return;

  const active = strip.querySelector('.battleNavItem.active');
  if (active) {
    const target = active.offsetLeft - ((strip.clientWidth - active.offsetWidth) / 2);
    strip.scrollLeft = Math.max(0, target);
  }

  strip.addEventListener('wheel', (event) => {
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!delta) return;
    const maxScroll = Math.max(0, strip.scrollWidth - strip.clientWidth);
    if (!maxScroll) return;
    const next = Math.max(0, Math.min(maxScroll, strip.scrollLeft + delta));
    if (Math.abs(next - strip.scrollLeft) > 0.5) {
      event.preventDefault();
      strip.scrollLeft = next;
    }
  }, { passive: false });
});


// Enlarged-view lightbox for the overview battlefield-distribution map and
// Mathew Brady / Antietam gallery photographs.
document.addEventListener('DOMContentLoaded', () => {
  const targets = Array.from(document.querySelectorAll(
    '.overviewHeroRow .mapPanel img, .antietamGallery img, img.battleZoomTarget'
  ));
  if (!targets.length || document.getElementById('battleImageLightbox')) return;

  const overlay = document.createElement('div');
  overlay.id = 'battleImageLightbox';
  overlay.className = 'battleImageLightbox';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Enlarged image');
  overlay.innerHTML = `
    <div class="battleImageLightboxInner">
      <button type="button" class="battleImageLightboxClose" aria-label="Close enlarged image">×</button>
      <img class="battleImageLightboxImage" src="" alt="">
      <div class="battleImageLightboxCaption" hidden></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const fullImage = overlay.querySelector('.battleImageLightboxImage');
  const caption = overlay.querySelector('.battleImageLightboxCaption');
  const closeButton = overlay.querySelector('.battleImageLightboxClose');
  let lastTrigger = null;

  const getCaption = (img) => {
    if (img.dataset.zoomCaption) return img.dataset.zoomCaption;
    const figure = img.closest('figure');
    const figcaption = figure?.querySelector('figcaption');
    if (figcaption) return figcaption.textContent.trim();
    const panel = img.closest('.stackPanel');
    const small = panel?.querySelector('small');
    return small ? small.textContent.trim() : '';
  };

  const open = (img) => {
    lastTrigger = img;
    fullImage.src = img.currentSrc || img.src;
    fullImage.alt = img.alt || 'Enlarged image';
    const text = getCaption(img);
    caption.textContent = text;
    caption.hidden = !text;
    overlay.hidden = false;
    document.body.classList.add('battleImageLightboxOpen');
    closeButton.focus();
  };

  const close = () => {
    overlay.hidden = true;
    document.body.classList.remove('battleImageLightboxOpen');
    fullImage.removeAttribute('src');
    fullImage.alt = '';
    caption.textContent = '';
    caption.hidden = true;
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    lastTrigger = null;
  };

  [...new Set(targets)].forEach((img) => {
    img.classList.add('battleZoomTarget');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Enlarge ${img.alt || 'image'}`);
    img.addEventListener('click', (event) => {
      event.preventDefault();
      open(img);
    });
    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(img);
      }
    });
  });

  closeButton.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) close();
  });
});
