(() => {
  const root = document.querySelector('main');
  if (!root || document.getElementById('contentImageLightbox')) return;

  const selector = [
    'figure.sectionSideVisual img',
    'figure.pathMedia img',
    'figure.sectionBanner img',
    'figure.landingMap img',
    'figure.overviewMap img',
    'figure.contentVisual img',
    'figure.coloringThumb img'
  ].join(',');

  const images = Array.from(root.querySelectorAll(selector));
  if (!images.length) return;

  const overlay = document.createElement('div');
  overlay.id = 'contentImageLightbox';
  overlay.className = 'contentImageLightbox';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Enlarged image');

  overlay.innerHTML = `
    <div class="contentImageLightboxInner">
      <button type="button" class="contentImageLightboxClose" aria-label="Close enlarged image">×</button>
      <img class="contentImageLightboxImage" src="" alt="">
      <div class="contentImageLightboxCaption" hidden></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const fullImage = overlay.querySelector('.contentImageLightboxImage');
  const caption = overlay.querySelector('.contentImageLightboxCaption');
  const closeButton = overlay.querySelector('.contentImageLightboxClose');
  let lastTrigger = null;

  const getCaption = (img) => {
    const figure = img.closest('figure');
    const figcaption = figure?.querySelector('figcaption');
    if (figcaption) return figcaption.textContent.trim();

    if (img.closest('.coloringThumb')) {
      return 'Grant & Lee at Appomattox — coloring book thumbnail.';
    }
    return '';
  };

  const open = (img) => {
    lastTrigger = img;
    fullImage.src = img.currentSrc || img.src;
    fullImage.alt = img.alt || 'Enlarged image';

    const text = getCaption(img);
    caption.textContent = text;
    caption.hidden = !text;

    overlay.hidden = false;
    document.body.classList.add('contentImageLightboxOpen');
    closeButton.focus();
  };

  const close = () => {
    overlay.hidden = true;
    document.body.classList.remove('contentImageLightboxOpen');
    fullImage.removeAttribute('src');
    fullImage.alt = '';
    caption.textContent = '';
    caption.hidden = true;

    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
    lastTrigger = null;
  };

  images.forEach((img) => {
    img.dataset.zoomableContent = 'true';
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Enlarge ${img.alt || 'image'}`);

    img.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      open(img);
    });

    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
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
})();