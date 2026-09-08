(function(){
  const evidence = {
    postholes: {
      icon: '⌾',
      title: 'Postholes',
      text: 'Dark stains where wooden posts once stood can reveal the outlines of houses, walls, and even huge timber circles such as Woodhenge.'
    },
    pottery: {
      icon: '◒',
      title: 'Pottery',
      text: 'Broken pottery can show how people cooked and stored food, what styles they preferred, and how ideas or goods moved between communities.'
    },
    food: {
      icon: '✦',
      title: 'Food remains',
      text: 'Corn kernels, seeds, animal bones, fish remains, and other traces help archaeologists reconstruct diets, farming, hunting, and seasonal activity.'
    },
    soil: {
      icon: '≋',
      title: 'Soil & mound layers',
      text: 'Different layers of fill show that mounds were built and rebuilt in stages. Soil samples can also preserve clues about flooding, drought, vegetation, and human activity.'
    }
  };

  document.addEventListener('click', (event) => {
    const evidenceButton = event.target.closest('[data-evidence]');
    if(evidenceButton){
      const key = evidenceButton.dataset.evidence;
      const item = evidence[key];
      const display = document.getElementById('evidenceDisplay');
      if(item && display){
        document.querySelectorAll('[data-evidence]').forEach(btn => btn.classList.toggle('active', btn === evidenceButton));
        display.innerHTML = `<span class="evidenceIcon" aria-hidden="true">${item.icon}</span><div><h3>${item.title}</h3><p>${item.text}</p></div>`;
      }
    }

    const zoomButton = event.target.closest('[data-zoom-src]');
    if(zoomButton){
      const lightbox = document.getElementById('imageLightbox');
      const lightboxImage = document.getElementById('lightboxImage');
      const sourceImage = zoomButton.querySelector('img');
      if(lightbox && lightboxImage){
        lightboxImage.src = zoomButton.dataset.zoomSrc;
        lightboxImage.alt = sourceImage ? sourceImage.alt : '';
        lightbox.hidden = false;
        document.body.classList.add('modalOpen');
        lightbox.querySelector('.lightboxClose')?.focus();
      }
    }

    if(event.target.closest('.lightboxClose') || event.target.id === 'imageLightbox'){
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    if(event.key === 'Escape') closeLightbox();
  });

  function closeLightbox(){
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    if(lightbox && !lightbox.hidden){
      lightbox.hidden = true;
      if(lightboxImage) lightboxImage.src = '';
      document.body.classList.remove('modalOpen');
    }
  }
})();
