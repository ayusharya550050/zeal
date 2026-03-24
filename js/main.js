// ========================================
// ZEAL Cultural Festival - Main JS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS
  function initAOS() {
    if (typeof AOS === 'undefined') return;
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 30,
      delay: 0,
      anchorPlacement: 'top-bottom',
      disable: false,
    });
    // Refresh after a short tick to catch already-visible elements
    setTimeout(() => AOS.refresh(), 100);
  }

  initAOS();

  // On the homepage the loader hides content — re-run AOS after it completes
  window.addEventListener('loaderComplete', () => {
    setTimeout(initAOS, 150);
  });

  // Swiper Gallery (home page)
  const galleryEl = document.querySelector('.swiper-gallery');
  if (galleryEl && typeof Swiper !== 'undefined') {
    new Swiper('.swiper-gallery', {
      slidesPerView: 1.2,
      spaceBetween: 20,
      centeredSlides: true,
      loop: true,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        576: { slidesPerView: 1.5, spaceBetween: 24 },
        768: { slidesPerView: 2.2, spaceBetween: 28 },
        1024: { slidesPerView: 3, spaceBetween: 30 },
      },
    });
  }

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar-zeal');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Active nav link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link-zeal').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Smooth parallax on hero
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroContent.style.opacity = 1 - scrollY / 600;
    }, { passive: true });
  }

  // Counter animation for stats
  const counters = document.querySelectorAll('[data-count]');
  const observerOptions = { threshold: 0.5 };
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = true;
        animateCounter(entry.target);
      }
    });
  }, observerOptions);
  
  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();
    
    const update = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    
    requestAnimationFrame(update);
  }

  // Accordion gold border
  document.querySelectorAll('.accordion-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      item.style.borderColor = btn.classList.contains('collapsed') 
        ? 'rgba(212,175,55,0.3)' 
        : 'rgba(212,175,55,0.7)';
    });
  });

  // Register button ripple
  document.querySelectorAll('.btn-register, .btn-hero-primary, .btn-event-register').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(212,175,55,0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
        pointer-events: none;
      `;
      
      if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = '@keyframes rippleEffect { to { transform: scale(2); opacity: 0; } }';
        document.head.appendChild(style);
      }
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Fade in sections on scroll
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-section').forEach(el => {
    fadeObserver.observe(el);
  });
});
