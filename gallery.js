(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const videos = document.querySelectorAll('video');

  videos.forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
  });

  if (reduceMotion.matches) {
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

  const hero = document.querySelector('.hero');
  let ticking = false;

  function updateHeroShift() {
    const progress = Math.min(1, window.scrollY / Math.max(1, hero.offsetHeight));
    hero.style.setProperty('--hero-shift', `${progress * 28}px`);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateHeroShift);
  }, { passive: true });
})();
