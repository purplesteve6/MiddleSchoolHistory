document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-timeline]');
  if (t) {
    const id = t.dataset.timeline;
    const detail = document.getElementById(id);
    if (detail) {
      const open = detail.classList.toggle('show');
      t.classList.toggle('open', open);
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }

  const choice = e.target.closest('[data-choice]');
  if (choice) {
    const box = document.getElementById('choiceResult');
    if (box) {
      const joined = choice.dataset.choice === 'join';
      box.innerHTML = joined
        ? '<b>You chose to join Brown.</b> Frederick Douglass did not. He believed attacking a federal armory would trap Brown and his men and lead to disaster. Douglass tried to persuade Brown to abandon the plan.'
        : '<b>You chose to refuse.</b> That is what Frederick Douglass did. He opposed slavery just as strongly as Brown, but he believed the Harpers Ferry plan was too dangerous and likely to fail.';
      box.classList.add('show');
    }
  }

  const legacy = e.target.closest('[data-legacy]');
  if (legacy) {
    document.querySelectorAll('.legacyEvidence').forEach(x => x.classList.remove('show'));
    const box = document.getElementById('legacy-' + legacy.dataset.legacy);
    if (box) box.classList.add('show');
  }
});
