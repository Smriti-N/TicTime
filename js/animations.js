(() => {
  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-stagger]').forEach((list) => {
    [...list.children].forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${index * 100}ms`);
    });
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -32px 0px' });

  revealItems.forEach((item) => observer.observe(item));
})();
