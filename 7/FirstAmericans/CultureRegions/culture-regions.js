(() => {
  document.querySelectorAll('[data-region-card]').forEach(card => {
    if(card.matches('a')) return;
    card.addEventListener('click', () => {
      card.classList.toggle('is-open');
    });
  });
})();
