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
