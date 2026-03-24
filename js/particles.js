// ========================================
// ZEAL Cultural Festival - Particles
// ========================================

(function () {
  'use strict';

  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const particles = [];

  // Reduce particle count based on device capability
  const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0;
  const NUM_PARTICLES = isMobile ? 35 : 60;

  const GOLD = 'rgba(212,175,55,';
  const BRONZE = 'rgba(176,141,87,';

  let lastTime = 0;
  const TARGET_FPS = 60;
  const FRAME_INTERVAL = 1000 / TARGET_FPS;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      initParticles();
    }, 200);
  }, { passive: true });

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push(createParticle());
    }
  }

  function createParticle(x, y) {
    return {
      x: x !== undefined ? x : Math.random() * canvas.width,
      y: y !== undefined ? y : Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -Math.random() * 0.45 - 0.08,
      opacity: Math.random() * 0.5 + 0.1,
      maxOpacity: Math.random() * 0.5 + 0.1,
      fadeSpeed: Math.random() * 0.004 + 0.002,
      fadeDir: 1,
      color: Math.random() > 0.5 ? GOLD : BRONZE,
    };
  }

  function animate(timestamp) {
    requestAnimationFrame(animate);

    const delta = timestamp - lastTime;
    if (delta < FRAME_INTERVAL) return;
    lastTime = timestamp - (delta % FRAME_INTERVAL);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.opacity += p.fadeSpeed * p.fadeDir;

      if (p.opacity >= p.maxOpacity) p.fadeDir = -1;
      if (p.opacity <= 0 || p.y < -10) {
        particles[i] = createParticle(
          Math.random() * canvas.width,
          canvas.height + 10
        );
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.fill();
    }
  }

  // Only start after loader completes
  window.addEventListener('loaderComplete', () => {
    canvas.style.opacity = document.body.classList.contains('light-theme') ? '0.12' : '0.4';
    initParticles();
    requestAnimationFrame(animate);
  });

  // If no loader, start immediately
  if (!document.getElementById('loader')) {
    initParticles();
    requestAnimationFrame(animate);
  }
})();

