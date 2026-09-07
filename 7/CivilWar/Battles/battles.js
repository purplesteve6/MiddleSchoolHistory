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
