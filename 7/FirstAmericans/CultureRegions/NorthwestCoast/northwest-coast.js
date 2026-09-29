(() => {
  document.querySelectorAll('.plannedPhoto').forEach(el => {
    el.setAttribute('role','img');
    if(!el.getAttribute('aria-label')){
      const strong = el.querySelector('strong');
      el.setAttribute('aria-label', strong ? `Planned image: ${strong.textContent.trim()}` : 'Planned image');
    }
  });
  const buttons=[...document.querySelectorAll('[data-shape-button]')];
  const cards=[...document.querySelectorAll('[data-shape-card]')];
  if(buttons.length && cards.length){
    const activate=(name)=>{
      buttons.forEach(b=>b.classList.toggle('is-active',b.dataset.shapeButton===name));
      cards.forEach(c=>c.classList.toggle('is-active',c.dataset.shapeCard===name));
    };
    buttons.forEach(b=>b.addEventListener('click',()=>activate(b.dataset.shapeButton)));
    activate(buttons[0].dataset.shapeButton);
  }
})();
