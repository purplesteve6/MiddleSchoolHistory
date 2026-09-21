(() => {
  document.querySelectorAll('.placeholderPhoto').forEach(el => {
    el.setAttribute('role','img');
    if(!el.getAttribute('aria-label')) el.setAttribute('aria-label','Image placeholder');
  });
})();
