// ========================================
// ZEAL Cultural Festival - Custom Cursor
// ========================================

(function () {
  'use strict';

  // Detect touch device
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (isTouch) {
    document.body.classList.add('touch-device');
    return;
  }

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const mythIcon = document.querySelector('.cursor-myth-icon');

  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  // ---- Trail particles ----
  const TRAIL_COUNT = 8;
  const trail = [];

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const t = document.createElement('div');
    t.className = 'cursor-trail';
    const scale = 1 - (i / TRAIL_COUNT) * 0.7;
    const alpha = (1 - i / TRAIL_COUNT) * 0.55;
    t.style.cssText = `
      width: ${4 * scale}px;
      height: ${4 * scale}px;
      opacity: 0;
      background: rgba(212,175,55,${alpha});
      box-shadow: 0 0 ${6 * scale}px rgba(212,175,55,${alpha * 0.6});
    `;
    document.body.appendChild(t);
    trail.push({ el: t, x: -100, y: -100 });
  }

  // ---- Lerp helper ----
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ---- Animation loop ----
  function animateCursor() {
    // Smooth ring
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    // Trail — each follows the previous with decreasing speed
    let prevX = mouseX, prevY = mouseY;
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const t = trail[i];
      const speed = 0.28 - i * 0.025;
      t.x = lerp(t.x, prevX, speed);
      t.y = lerp(t.y, prevY, speed);
      t.el.style.left = t.x + 'px';
      t.el.style.top = t.y + 'px';
      t.el.style.opacity = mouseX < 0 ? '0' : String((1 - i / TRAIL_COUNT) * 0.55);
      prevX = t.x;
      prevY = t.y;
    }

    requestAnimationFrame(animateCursor);
  }

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
    if (mythIcon) {
      mythIcon.style.left = mouseX + 'px';
      mythIcon.style.top = mouseY + 'px';
    }
  });

  requestAnimationFrame(animateCursor);

  // ---- Myth icon helper ----
  const mythElements = {
    '[data-myth="zeus"]': '⚡',
    '[data-myth="poseidon"]': '🔱',
    '[data-myth="athena"]': '🦉',
    '[data-myth="hades"]': '🔥',
    '[data-myth="ares"]': '⚔️',
    '.btn-hero-primary': '⚡',
    '.btn-register': '🏛️',
  };

  function setMythIcon(emoji) {
    if (!mythIcon) return;
    if (emoji) {
      mythIcon.textContent = emoji;
      mythIcon.classList.add('visible');
    } else {
      mythIcon.classList.remove('visible');
    }
  }

  // ---- Hover: buttons ----
  document.querySelectorAll('button, .btn-hero-primary, .btn-hero-secondary, .btn-register, .btn-event-register, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('cursor-hover');
      ring.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('cursor-hover');
      ring.classList.remove('cursor-hover');
      setMythIcon(null);
    });
  });

  // ---- Hover: links ----
  document.querySelectorAll('a').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('cursor-link');
      ring.classList.add('cursor-link');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('cursor-link');
      ring.classList.remove('cursor-link');
    });
  });

  // ---- Hover: images / cards ----
  document.querySelectorAll('img, .gallery-slide, .event-card-header').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('cursor-image');
      ring.classList.add('cursor-image');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('cursor-image');
      ring.classList.remove('cursor-image');
    });
  });

  // ---- Hero section ----
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', () => setMythIcon('⚡'));
    heroSection.addEventListener('mouseleave', () => setMythIcon(null));
  }

  // ---- Special data-myth elements ----
  Object.entries(mythElements).forEach(([selector, icon]) => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mouseenter', () => setMythIcon(icon));
      el.addEventListener('mouseleave', () => setMythIcon(null));
    });
  });

  // ---- Cards: soft glow pulse on hover ----
  document.querySelectorAll('.about-card, .event-card, .team-card, .sponsor-card, .timeline-card, .announcement-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('cursor-card');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('cursor-card');
    });
  });

  // ---- Visibility ----
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
    trail.forEach(t => { t.el.style.opacity = '0'; });
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });

  // ---- Click effect ----
  document.addEventListener('mousedown', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    ring.style.transform = 'translate(-50%, -50%) scale(0.75)';
    // Burst the trail outward briefly
    trail.forEach((t, i) => {
      t.el.style.transform = `translate(-50%, -50%) scale(${1.5 - i * 0.1})`;
    });
  });
  document.addEventListener('mouseup', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(1)';
    ring.style.transform = 'translate(-50%, -50%) scale(1)';
    trail.forEach(t => {
      t.el.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
})();
