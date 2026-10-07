// Parts of the page come into view as they are scrolled to, once.
(() => {
  const parts = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    parts.forEach((part) => part.classList.add('in'));
    return;
  }
  const watch = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        watch.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  parts.forEach((part) => watch.observe(part));
})();
