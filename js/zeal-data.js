/* ============================================================
   ZEAL Website — zeal-data.js
   Public-facing data layer. Fetches from backend and renders
   real content into the public pages.
   No UI changes — only populates existing containers.
   ============================================================ */
(function () {
  'use strict';

  const API_BASE = 'http://localhost:5000/api';
  const IMG_BASE = 'http://localhost:5000';

  /* ── Generic fetch ─────────────────────────────────────── */
  async function apiFetch(path) {
    try {
      const res = await fetch(API_BASE + path);
      const data = await res.json();
      if (!res.ok || data.success === false) return null;
      return data.data;
    } catch (err) {
      console.warn('[ZEAL] API fetch failed for', path, err.message);
      return null;
    }
  }

  /* ── Category icon map for events ─────────────────────── */
  const categoryIconMap = {
    cultural:  'fa-masks-theater',
    technical: 'fa-code',
    literary:  'fa-book-open',
    music:     'fa-music',
    sports:    'fa-running',
  };

  const categoryLabelMap = {
    cultural:  'Cultural',
    technical: 'Technical',
    literary:  'Literary',
    music:     'Music',
    sports:    'Sports',
  };

  /* ══════════════════════════════════════════════════════════
     EVENTS PAGE  —  events.html
     Replaces static event cards with live DB data.
     Container: #events-grid-dynamic
  ══════════════════════════════════════════════════════════ */
  async function loadEvents() {
    const container = document.getElementById('events-grid-dynamic');
    if (!container) return;

    const events = await apiFetch('/events');
    if (!events || !events.length) {
      container.innerHTML = `
        <div class="col-12 text-center py-5" style="color:var(--text-secondary);">
          <i class="fas fa-calendar-xmark" style="font-size:2.5rem;color:var(--gold);opacity:0.4;margin-bottom:1rem;display:block;"></i>
          <p>No events have been published yet. Check back soon!</p>
        </div>`;
      return;
    }

    let delay = 0;
    container.innerHTML = events.map(ev => {
      const icon  = categoryIconMap[ev.category]  || 'fa-star';
      const label = categoryLabelMap[ev.category] || ev.category;
      const d     = delay;
      delay += 50;
      if (delay > 200) delay = 0;

      return `
      <div class="col-md-6 col-lg-4 event-card-wrapper" data-category="${ev.category}" data-aos="fade-up" data-aos-delay="${d}">
        <div class="event-card">
          <div class="event-card-header">
            <i class="fas ${icon} event-icon"></i>
            <div class="event-name">${ev.title}</div>
            <span class="event-category-badge">${label}</span>
          </div>
          <div class="event-card-body">
            ${ev.date     ? `<div class="event-detail"><i class="fas fa-calendar"></i> ${ev.date}</div>` : ''}
            ${ev.location ? `<div class="event-detail"><i class="fas fa-location-dot"></i> ${ev.location}</div>` : ''}
            ${ev.teamSize ? `<div class="event-detail"><i class="fas fa-users"></i> ${ev.teamSize}</div>` : ''}
            ${ev.prize    ? `<div class="event-detail"><i class="fas fa-trophy"></i> <span class="event-prize">${ev.prize}</span></div>` : ''}
            ${ev.description ? `<p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.7;margin-top:0.75rem;">${ev.description}</p>` : ''}
            <a href="index.html#register" class="btn-event-register">Register Now</a>
          </div>
        </div>
      </div>`;
    }).join('');

    // Re-init AOS for the newly injected cards
    if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 100);

    // Re-init filter buttons to work with dynamic cards
    initEventFilter();
  }

  function initEventFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const eventCards = document.querySelectorAll('.event-card-wrapper');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        eventCards.forEach(card => {
          const cat = card.dataset.category;
          const show = filter === 'all' || cat === filter;
          if (show) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
              setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity    = '1';
                card.style.transform  = 'translateY(0)';
              }, 50);
            });
          } else {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity    = '0';
            card.style.transform  = 'translateY(-10px)';
            setTimeout(() => { card.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     SPONSORS PAGE  —  sponsors.html
     Replaces static sponsor cards with live DB data.
     Container: #sponsors-dynamic
  ══════════════════════════════════════════════════════════ */
  async function loadSponsors() {
    const container = document.getElementById('sponsors-dynamic');
    if (!container) return;

    const categories = await apiFetch('/sponsors');
    if (!categories || !categories.length) {
      container.innerHTML = `
        <div class="text-center py-5" style="color:var(--text-secondary);">
          <i class="fas fa-handshake" style="font-size:2.5rem;color:var(--gold);opacity:0.4;margin-bottom:1rem;display:block;"></i>
          <p>Sponsor details will be announced soon.</p>
        </div>`;
      return;
    }

    let delay = 0;
    const html = categories.map(cat => {
      const sponsorCards = (cat.sponsors || []).map(sp => {
        const d = delay;
        delay += 50;
        if (delay > 200) delay = 0;
        const logoHTML = sp.logo
          ? `<img src="${IMG_BASE + sp.logo}" alt="${sp.name}" style="max-height:60px;max-width:120px;object-fit:contain;margin-bottom:0.75rem;" />`
          : `<i class="fas fa-building" style="font-size:1.8rem;color:var(--gold);margin-bottom:0.75rem;"></i>`;

        return `
          <div class="col-6 col-md-3" data-aos="fade-up" data-aos-delay="${d}">
            <div class="sponsor-card">
              ${logoHTML}
              <div class="sponsor-logo-placeholder">${sp.name}</div>
              <div class="sponsor-logo-sub">${cat.category}</div>
            </div>
          </div>`;
      }).join('');

      return `
        <div class="text-center mb-4" data-aos="fade-up">
          <div class="sponsor-tier-title" style="color:var(--gold);">
            <i class="fas fa-tag me-2"></i>${cat.category}
          </div>
          <div class="row g-4 justify-content-center">
            ${sponsorCards || `<div class="col-12"><p style="color:var(--text-secondary);font-size:0.88rem;">No sponsors in this category yet.</p></div>`}
          </div>
        </div>
        <div class="sponsor-tier-separator"></div>`;
    }).join('');

    container.innerHTML = html;
    if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 100);
  }

  /* ══════════════════════════════════════════════════════════
     ANNOUNCEMENTS PAGE  —  announcements.html
     Replaces static announcement cards with live DB data.
     Container: #announcements-dynamic
  ══════════════════════════════════════════════════════════ */
  async function loadAnnouncements() {
    const container = document.getElementById('announcements-dynamic');
    if (!container) return;

    const announcements = await apiFetch('/announcements');

    // Only show visible announcements on public page
    const visible = (announcements || []).filter(a => a.isVisible !== false);

    if (!visible.length) {
      container.innerHTML = `
        <div class="col-12 text-center py-5" style="color:var(--text-secondary);">
          <i class="fas fa-bullhorn" style="font-size:2.5rem;color:var(--gold);opacity:0.4;margin-bottom:1rem;display:block;"></i>
          <p>No announcements yet. Check back soon!</p>
        </div>`;
      return;
    }

    const categoryIconMap = {
      'Important':  'fa-door-open',
      'Workshop':   'fa-chalkboard-teacher',
      'Results':    'fa-award',
      'Schedule':   'fa-calendar-days',
      'General':    'fa-bullhorn',
    };

    let delay = 0;
    container.innerHTML = visible.map(a => {
      const icon  = categoryIconMap[a.category] || 'fa-bullhorn';
      const isNew = isRecentAnnouncement(a.date);
      const d = delay;
      delay += 50;
      if (delay > 150) delay = 0;

      return `
      <div class="col-lg-6" data-aos="fade-up" data-aos-delay="${d}">
        <div class="announcement-card">
          <div class="announcement-header">
            <div class="announcement-icon">
              <i class="fas ${icon}"></i>
            </div>
            <div>
              <span class="announcement-tag">${a.category}</span>
              <div class="announcement-title">${a.title}</div>
            </div>
          </div>
          <div class="announcement-body">
            <p>${a.description || ''}</p>
          </div>
          <div class="announcement-footer">
            <span class="announcement-date">
              <i class="fas fa-calendar me-1" style="color:var(--gold);"></i>
              ${formatDate(a.date)}
            </span>
            <span class="announcement-badge ${isNew ? 'new' : ''}">${isNew ? 'New' : a.category}</span>
          </div>
        </div>
      </div>`;
    }).join('');

    if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 100);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch (_) { return dateStr; }
  }

  function isRecentAnnouncement(dateStr) {
    try {
      const d = new Date(dateStr);
      const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    } catch (_) { return false; }
  }

  /* ══════════════════════════════════════════════════════════
     TEAM PAGE  —  team.html
     Appends DB-driven team sections AFTER the static sections.
     Container: #team-dynamic-sections
  ══════════════════════════════════════════════════════════ */
  async function loadTeam() {
    const container = document.getElementById('team-dynamic-sections');
    if (!container) return;

    const sections = await apiFetch('/team');
    if (!sections || !sections.length) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = sections.map(sec => {
      const members = (sec.members || []);
      if (!members.length) return '';

      const memberCards = members.map(m => {
        const initials = m.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);
        const avatarContent = m.image
          ? `<img src="${IMG_BASE + m.image}" alt="${m.name}"
               style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
               onerror="this.parentElement.textContent='${initials}'" />`
          : initials;

        return `
          <div class="col-6 col-md-4 col-lg-3">
            <div class="team-card text-center">
              <div class="team-avatar" style="overflow:hidden;">${avatarContent}</div>
              <div class="team-name">${m.name}</div>
              <div class="team-role">${m.designation}</div>
              ${m.phone    ? `<div style="font-size:0.72rem;color:var(--text-secondary);margin-top:0.25rem;"><i class="fas fa-phone" style="color:var(--gold);margin-right:0.3rem;"></i>${m.phone}</div>` : ''}
              ${m.instagram? `<div style="font-size:0.72rem;color:var(--text-secondary);"><i class="fab fa-instagram" style="color:var(--gold);margin-right:0.3rem;"></i>@${m.instagram}</div>` : ''}
            </div>
          </div>`;
      }).join('');

      return `
        <div class="hierarchy-tier" data-aos="fade-up">
          <div class="tier-title">${sec.sectionName}</div>
          <div class="row g-4 justify-content-center">
            ${memberCards}
          </div>
        </div>`;
    }).join('');

    if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 100);
  }

  /* ══════════════════════════════════════════════════════════
     HOME PAGE  —  index.html
     Populates: about text, stats, highlights, gallery,
                artists timeline, FAQ sections.
  ══════════════════════════════════════════════════════════ */
  async function loadHomeData() {
    const home = await apiFetch('/home');
    if (!home) return;

    /* About text */
    const aboutEl = document.getElementById('home-about-text');
    if (aboutEl && home.aboutFestival) {
      aboutEl.textContent = home.aboutFestival;
    }

    /* Stats */
    if (home.stats && home.stats.length) {
      const statsContainer = document.getElementById('home-stats-dynamic');
      if (statsContainer) {
        let delay = 0;
        statsContainer.innerHTML = home.stats.map(s => {
          const d = delay;
          delay += 100;
          // Parse number from value for counter animation
          const num = parseInt((s.value || '0').replace(/\D/g, '')) || 0;
          const suffix = (s.value || '').replace(/[0-9]/g, '');
          return `
            <div class="col-6 col-md-3" data-aos="fade-up" data-aos-delay="${d}">
              <div class="about-card text-center">
                <span class="about-stat-number" data-count="${num}" data-suffix="${suffix}">0${suffix}</span>
                <div class="about-ornament"></div>
                <span class="about-stat-label">${s.label}</span>
              </div>
            </div>`;
        }).join('');
        // Re-run counter animation observer for new elements
        reinitCounters();
      }
    }

    /* Highlights / Feature Cards */
    if (home.highlights && home.highlights.length) {
      const hlContainer = document.getElementById('home-highlights-dynamic');
      if (hlContainer) {
        let delay = 0;
        hlContainer.innerHTML = home.highlights.map(h => {
          const d = delay;
          delay += 100;
          return `
            <div class="col-md-4" data-aos="fade-up" data-aos-delay="${d}">
              <div class="about-card" style="text-align:center;">
                <i class="fas fa-star" style="font-size:2rem;color:var(--gold);margin-bottom:1rem;"></i>
                <h4 style="font-family:var(--font-subheading);font-size:1.1rem;margin-bottom:0.75rem;color:var(--text-primary);">${h.title}</h4>
                <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.7;">${h.description}</p>
              </div>
            </div>`;
        }).join('');
      }
    }

    /* Gallery */
    if (home.gallery && home.gallery.length) {
      const galleryWrapper = document.getElementById('home-gallery-wrapper');
      if (galleryWrapper) {
        galleryWrapper.innerHTML = home.gallery.map(g => `
          <div class="swiper-slide">
            <div class="gallery-slide">
              <img src="${IMG_BASE + g.image}" alt="Gallery"
                style="width:100%;height:100%;object-fit:cover;"
                onerror="this.style.display='none'" />
            </div>
          </div>`).join('');

        // Reinitialize Swiper with the new slides
        reinitSwiper();
      }
    }

    /* Artists Timeline */
    if (home.artistsTimeline && home.artistsTimeline.length) {
      const timelineEl = document.getElementById('home-timeline-dynamic');
      if (timelineEl) {
        timelineEl.innerHTML = home.artistsTimeline.map((a, i) => {
          const isEven = i % 2 === 1;
          return `
            <div class="timeline-item">
              ${isEven ? '<div class="timeline-dot"></div>' : ''}
              <div class="timeline-card">
                <span class="timeline-year">${a.year}</span>
                <span class="timeline-name">${a.name}</span>
                <p class="timeline-genre">${a.genre}</p>
              </div>
              ${!isEven ? '<div class="timeline-dot"></div>' : ''}
            </div>`;
        }).join('');
      }
    }

    /* FAQ */
    if (home.faq && home.faq.length) {
      const faqEl = document.getElementById('home-faq-dynamic');
      if (faqEl) {
        faqEl.innerHTML = home.faq.map((f, i) => `
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button ${i > 0 ? 'collapsed' : ''}" type="button"
                data-bs-toggle="collapse" data-bs-target="#faqDyn${i}">
                ${f.question}
              </button>
            </h2>
            <div id="faqDyn${i}" class="accordion-collapse collapse ${i === 0 ? 'show' : ''}"
              data-bs-parent="#zealFAQ">
              <div class="accordion-body">${f.answer}</div>
            </div>
          </div>`).join('');
      }
    }

    if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 100);
  }

  function reinitCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = true;
          const target   = parseInt(entry.target.dataset.count);
          const suffix   = entry.target.dataset.suffix || '';
          const duration = 2000;
          const start    = performance.now();
          const update   = (time) => {
            const progress = Math.min((time - start) / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            entry.target.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => { delete el.dataset.counted; observer.observe(el); });
  }

  function reinitSwiper() {
    if (typeof Swiper === 'undefined') return;
    // Destroy existing Swiper instance if present
    const existing = document.querySelector('.swiper-gallery');
    if (existing && existing.swiper) existing.swiper.destroy(true, true);
    new Swiper('.swiper-gallery', {
      slidesPerView: 1.2,
      spaceBetween: 20,
      centeredSlides: true,
      loop: true,
      autoplay: { delay: 3500, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      breakpoints: {
        576:  { slidesPerView: 1.5, spaceBetween: 24 },
        768:  { slidesPerView: 2.2, spaceBetween: 28 },
        1024: { slidesPerView: 3,   spaceBetween: 30 },
      },
    });
  }

  /* ══════════════════════════════════════════════════════════
     FOOTER — contact & developer credits (all pages)
     Containers: #footer-contact-dynamic, #footer-devs-dynamic
  ══════════════════════════════════════════════════════════ */
  async function loadFooterData() {
    const footer = await apiFetch('/footer');
    if (!footer) return;

    /* Contact block */
    const contactEl = document.getElementById('footer-contact-dynamic');
    if (contactEl && footer.contact) {
      const c = footer.contact;
      const parts = [];
      if (c.address) parts.push(`<i class="fas fa-map-marker-alt" style="color:var(--gold);margin-right:0.5rem;"></i>${c.address}`);
      if (c.email)   parts.push(`<i class="fas fa-envelope" style="color:var(--gold);margin-right:0.5rem;"></i>${c.email}`);
      if (c.phone)   parts.push(`<i class="fas fa-phone" style="color:var(--gold);margin-right:0.5rem;"></i>${c.phone}`);
      if (c.website) parts.push(`<i class="fas fa-globe" style="color:var(--gold);margin-right:0.5rem;"></i><a href="${c.website}" style="color:var(--text-secondary);">${c.website}</a>`);
      if (parts.length) {
        contactEl.innerHTML = parts.join('<br>');
      }
    }

    /* Developer credits */
    const devsEl = document.getElementById('footer-devs-dynamic');
    if (devsEl && footer.developers && footer.developers.length) {
      const devNames = footer.developers
        .filter(d => d.name)
        .map(d => d.name + (d.role ? ` (${d.role})` : ''))
        .join(' &nbsp;|&nbsp; ');
      if (devNames) devsEl.textContent = devNames;
    }
  }

  /* ══════════════════════════════════════════════════════════
     AUTO-DETECT PAGE AND RUN RELEVANT LOADERS
  ══════════════════════════════════════════════════════════ */
  function init() {
    const page = window.location.pathname.split('/').pop() || 'index.html';

    if (page === 'events.html')       loadEvents();
    if (page === 'sponsors.html')     loadSponsors();
    if (page === 'announcements.html') loadAnnouncements();
    if (page === 'team.html')         loadTeam();
    if (page === 'index.html' || page === '') loadHomeData();

    // Footer runs on every page
    loadFooterData();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
