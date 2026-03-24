// ========================================
// ZEAL Cultural Festival - GSAP Animations
// ========================================

function initHeroAnimations() {
  if (typeof gsap === 'undefined') {
    // Fallback without GSAP
    ['#hero-eyebrow', '#hero-title', '#hero-subtitle', '#hero-buttons'].forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.transition = `opacity 0.8s ease ${i * 0.3}s, transform 0.8s ease ${i * 0.3}s`;
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      }
    });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  const eyebrow = document.querySelector('.hero-eyebrow');
  const title = document.querySelector('.hero-title');
  const subtitle = document.querySelector('.hero-subtitle');
  const buttons = document.querySelector('.hero-buttons');
  const scrollIndicator = document.querySelector('.hero-scroll-indicator');

  if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }, 0);
  if (title) tl.to(title, { opacity: 1, y: 0, duration: 1.0 }, 0.4);
  if (subtitle) tl.to(subtitle, { opacity: 1, y: 0, duration: 0.8 }, 0.8);
  if (buttons) tl.to(buttons, { opacity: 1, y: 0, duration: 0.8 }, 1.0);
  if (scrollIndicator) tl.to(scrollIndicator, { opacity: 0.6, duration: 0.8 }, 1.4);

  // Rays animation
  const rays = document.querySelectorAll('.hero-ray');
  rays.forEach((ray, i) => {
    gsap.to(ray, {
      opacity: 0.6,
      delay: 1 + i * 0.3,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
  });
}

// Trigger on loader complete or immediately
window.addEventListener('loaderComplete', () => {
  setTimeout(initHeroAnimations, 100);
});

// For non-home pages (no loader)
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('loader')) {
    initHeroAnimations();
  }
  
  // Page hero animation
  const pageHeroTitle = document.querySelector('.page-hero-title');
  if (pageHeroTitle && typeof gsap !== 'undefined') {
    gsap.from(pageHeroTitle, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      delay: 0.3,
    });
  }
});
