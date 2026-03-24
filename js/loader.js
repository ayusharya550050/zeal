// ========================================
// ZEAL Cultural Festival - Cinematic Loader
// ========================================

(function () {
  'use strict';

  const loader = document.getElementById('loader');
  if (!loader) return;

  const canvas = document.getElementById('loader-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const progressFill = document.querySelector('.loader-progress-fill');
  const progressText = document.querySelector('.loader-progress-text');
  const loaderContent = document.querySelector('.loader-content');

  let animationFrame;
  let phase = 0; // 0=particles, 1=weapons, 2=zoom, 3=statue, 4=text, 5=exit
  let phaseStart = 0;
  let progress = 0;
  let particles = [];
  let weapons = [];
  let statueOpacity = 0;
  let contentOpacity = 0;
  let exitProgress = 0;

  const GOLD = '#D4AF37';
  const GOLD_DIM = 'rgba(212,175,55,0.4)';
  const BRONZE = '#B08D57';

  // Resize canvas
  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Dust particles
  function initParticles() {
    particles = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: -Math.random() * 0.8 - 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.5 ? GOLD : BRONZE,
      });
    }
  }

  // Weapon shapes
  const weaponDefs = [
    { type: 'spear', angle: 0 },
    { type: 'shield', angle: 60 },
    { type: 'trident', angle: 120 },
    { type: 'bolt', angle: 180 },
    { type: 'sword', angle: 240 },
    { type: 'laurel', angle: 300 },
  ];

  function initWeapons() {
    weapons = weaponDefs.map((w, i) => ({
      ...w,
      orbitAngle: (i * Math.PI * 2) / weaponDefs.length,
      orbitRadius: Math.min(canvas.width, canvas.height) * 0.22,
      rotation: 0,
      opacity: 0,
      scale: 1,
    }));
  }

  function drawSpear(ctx, x, y, rot, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2 * size;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 8;
    // Shaft
    ctx.beginPath();
    ctx.moveTo(0, -size * 30);
    ctx.lineTo(0, size * 20);
    ctx.stroke();
    // Tip
    ctx.beginPath();
    ctx.moveTo(0, -size * 30);
    ctx.lineTo(-size * 6, -size * 18);
    ctx.lineTo(size * 6, -size * 18);
    ctx.closePath();
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.restore();
  }

  function drawShield(ctx, x, y, rot, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2 * size;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, size * 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, size * 10, 0, Math.PI * 2);
    ctx.stroke();
    // Cross
    ctx.beginPath();
    ctx.moveTo(0, -size * 18);
    ctx.lineTo(0, size * 18);
    ctx.moveTo(-size * 18, 0);
    ctx.lineTo(size * 18, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawTrident(ctx, x, y, rot, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2 * size;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 8;
    // Main shaft
    ctx.beginPath();
    ctx.moveTo(0, size * 25);
    ctx.lineTo(0, -size * 15);
    ctx.stroke();
    // Three prongs
    [-12, 0, 12].forEach(offset => {
      ctx.beginPath();
      ctx.moveTo(offset * size, -size * 15);
      ctx.lineTo(offset * size, -size * 28);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawBolt(ctx, x, y, rot, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2 * size;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(size * 8, -size * 28);
    ctx.lineTo(-size * 4, -size * 4);
    ctx.lineTo(size * 6, -size * 4);
    ctx.lineTo(-size * 8, size * 28);
    ctx.strokeStyle = GOLD;
    ctx.stroke();
    ctx.fillStyle = 'rgba(212,175,55,0.2)';
    ctx.fill();
    ctx.restore();
  }

  function drawSword(ctx, x, y, rot, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2 * size;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, size * 28);
    ctx.lineTo(0, -size * 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size * 12, size * 10);
    ctx.lineTo(size * 12, size * 10);
    ctx.stroke();
    ctx.restore();
  }

  function drawLaurel(ctx, x, y, rot, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.5 * size;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 8;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI;
      const r = size * 20;
      ctx.beginPath();
      ctx.ellipse(
        Math.cos(a + Math.PI * 0.5) * r * 0.4,
        Math.sin(a + Math.PI * 0.5) * r * 0.4 - size * 5,
        size * 8, size * 5,
        a, 0, Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  const drawFns = { spear: drawSpear, shield: drawShield, trident: drawTrident, bolt: drawBolt, sword: drawSword, laurel: drawLaurel };

  function drawStatue(ctx, opacity) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const h = Math.min(canvas.height * 0.7, 400);
    const w = h * 0.45;

    ctx.save();
    ctx.globalAlpha = opacity;

    // Gradient fill for statue silhouette
    const grad = ctx.createLinearGradient(cx, cy - h / 2, cx, cy + h / 2);
    grad.addColorStop(0, 'rgba(212,175,55,0.9)');
    grad.addColorStop(0.3, 'rgba(176,141,87,0.7)');
    grad.addColorStop(1, 'rgba(212,175,55,0.1)');

    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 40;

    // Head
    ctx.beginPath();
    ctx.arc(cx, cy - h * 0.38, w * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Torso
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.22, cy - h * 0.28);
    ctx.lineTo(cx + w * 0.22, cy - h * 0.28);
    ctx.lineTo(cx + w * 0.28, cy + h * 0.05);
    ctx.lineTo(cx - w * 0.28, cy + h * 0.05);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Raised arm
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.22, cy - h * 0.22);
    ctx.lineTo(cx + w * 0.55, cy - h * 0.38);
    ctx.lineTo(cx + w * 0.6, cy - h * 0.35);
    ctx.lineTo(cx + w * 0.27, cy - h * 0.16);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Down arm
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.22, cy - h * 0.2);
    ctx.lineTo(cx - w * 0.38, cy + h * 0.04);
    ctx.lineTo(cx - w * 0.32, cy + h * 0.06);
    ctx.lineTo(cx - w * 0.16, cy - h * 0.18);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Robes / lower body
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.28, cy + h * 0.05);
    ctx.lineTo(cx - w * 0.35, cy + h * 0.45);
    ctx.lineTo(cx + w * 0.35, cy + h * 0.45);
    ctx.lineTo(cx + w * 0.28, cy + h * 0.05);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Lightning bolt in hand
    ctx.globalAlpha = opacity * 0.8;
    ctx.strokeStyle = 'rgba(255,240,100,0.9)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#fff';
    const bx = cx + w * 0.55;
    const by = cy - h * 0.38;
    ctx.beginPath();
    ctx.moveTo(bx + 10, by - 20);
    ctx.lineTo(bx - 4, by);
    ctx.lineTo(bx + 6, by);
    ctx.lineTo(bx - 10, by + 20);
    ctx.stroke();

    ctx.restore();
  }

  function drawParticles() {
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x < -10 || p.x > canvas.width + 10) { p.x = Math.random() * canvas.width; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function updateProgress(pct) {
    progress = pct;
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressText) progressText.textContent = Math.floor(pct) + '%';
  }

  function animate(timestamp) {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const elapsed = timestamp - phaseStart;

    // Phase 0: Particles appear (0-1500ms)
    if (phase === 0) {
      const t = Math.min(elapsed / 1500, 1);
      particles.forEach(p => { p.opacity = t * (Math.random() * 0.4 + 0.2); });
      drawParticles();
      updateProgress(t * 20);
      if (t >= 1) { phase = 1; phaseStart = timestamp; initWeapons(); }
    }

    // Phase 1: Weapons orbit (1500-3500ms)
    else if (phase === 1) {
      const t = Math.min(elapsed / 2000, 1);
      drawParticles();

      const speed = 0.008 + t * 0.03;
      weapons.forEach((w, i) => {
        w.orbitAngle += speed;
        w.opacity = Math.min(w.opacity + 0.05, t);
        w.rotation += 0.02;

        const x = canvas.width / 2 + Math.cos(w.orbitAngle) * w.orbitRadius;
        const y = canvas.height / 2 + Math.sin(w.orbitAngle) * w.orbitRadius * 0.6;

        ctx.globalAlpha = w.opacity;
        const fn = drawFns[w.type];
        if (fn) fn(ctx, x, y, w.rotation, 1.0);
        ctx.globalAlpha = 1;
      });

      updateProgress(20 + t * 30);
      if (t >= 1) { phase = 2; phaseStart = timestamp; }
    }

    // Phase 2: Weapons zoom + shatter (3500-4500ms)
    else if (phase === 2) {
      const t = Math.min(elapsed / 800, 1);
      drawParticles();

      const zoomScale = 1 + t * 15;
      weapons.forEach((w, i) => {
        w.orbitAngle += 0.05 + t * 0.1;
        const x = canvas.width / 2 + Math.cos(w.orbitAngle) * w.orbitRadius * (1 - t * 0.9);
        const y = canvas.height / 2 + Math.sin(w.orbitAngle) * w.orbitRadius * 0.6 * (1 - t * 0.9);
        ctx.globalAlpha = Math.max(0, 1 - t * 1.5);
        const fn = drawFns[w.type];
        if (fn) fn(ctx, x, y, w.rotation + t * Math.PI, 1 + t * 3);
        ctx.globalAlpha = 1;
      });

      // Golden flash
      if (t > 0.7) {
        const flashOpacity = (t - 0.7) / 0.3 * 0.6;
        ctx.fillStyle = `rgba(212,175,55,${flashOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      updateProgress(50 + t * 20);
      if (t >= 1) { phase = 3; phaseStart = timestamp; }
    }

    // Phase 3: Statue reveal (4500-6000ms)
    else if (phase === 3) {
      const t = Math.min(elapsed / 1500, 1);
      statueOpacity = t;
      
      // Fade particles
      ctx.globalAlpha = 1 - t * 0.7;
      drawParticles();
      ctx.globalAlpha = 1;

      drawStatue(ctx, statueOpacity * 0.85);

      // Ambient glow
      const grd = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.6
      );
      grd.addColorStop(0, `rgba(212,175,55,${t * 0.08})`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      updateProgress(70 + t * 20);
      if (t >= 1) { 
        phase = 4; 
        phaseStart = timestamp; 
        if (loaderContent) {
          loaderContent.style.opacity = '0';
          loaderContent.style.transition = 'opacity 0.8s ease';
          setTimeout(() => { loaderContent.style.opacity = '1'; }, 100);
        }
      }
    }

    // Phase 4: Text visible + hold (6000-7500ms)
    else if (phase === 4) {
      const t = Math.min(elapsed / 1500, 1);
      drawStatue(ctx, 0.85);

      const grd = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.6
      );
      grd.addColorStop(0, 'rgba(212,175,55,0.08)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      contentOpacity = t;
      updateProgress(90 + t * 10);
      if (t >= 1) { phase = 5; phaseStart = timestamp; }
    }

    // Phase 5: Exit (7500ms+)
    else if (phase === 5) {
      const t = Math.min(elapsed / 1000, 1);
      exitProgress = t;

      ctx.globalAlpha = 1 - t;
      drawStatue(ctx, 0.85);
      ctx.globalAlpha = 1;

      if (loaderContent) {
        loaderContent.style.opacity = (1 - t).toString();
      }
      if (loader) {
        loader.style.opacity = (1 - t).toString();
      }

      updateProgress(100);

      if (t >= 1) {
        loader.style.display = 'none';
        cancelAnimationFrame(animationFrame);
        document.body.style.overflow = '';
        // Trigger hero animations
        window.dispatchEvent(new Event('loaderComplete'));
        return;
      }
    }

    animationFrame = requestAnimationFrame(animate);
  }

  // Start
  document.body.style.overflow = 'hidden';
  initParticles();

  // Minimum display time: 7.5s, but skip if already loaded
  const startTime = performance.now();
  animationFrame = requestAnimationFrame((ts) => {
    phaseStart = ts;
    animate(ts);
  });

  // Skip loader on second visit (via sessionStorage)
  if (sessionStorage.getItem('zeal-loaded')) {
    // Fast skip
    setTimeout(() => {
      loader.style.transition = 'opacity 0.5s';
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
        document.body.style.overflow = '';
        window.dispatchEvent(new Event('loaderComplete'));
      }, 500);
    }, 500);
  } else {
    sessionStorage.setItem('zeal-loaded', '1');
  }
})();
