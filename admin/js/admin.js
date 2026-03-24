/* ============================================================
   ZEAL Admin Panel — admin.js  v2.0
   Theme switching, toasts, sidebar, store, helpers
   ============================================================ */
'use strict';

/* ══════════════════════════════════════════════════════════
   1. THEME MANAGER
   Persists choice in localStorage; applies on every page load.
══════════════════════════════════════════════════════════ */
const ThemeManager = (() => {
  const STORAGE_KEY = 'zeal-admin-theme';
  const DARK  = 'dark-theme';
  const LIGHT = 'light-theme';

  function get()       { return localStorage.getItem(STORAGE_KEY) || DARK; }
  function save(theme) { localStorage.setItem(STORAGE_KEY, theme); }

  function apply(theme) {
    // Apply to both <html> (instant, anti-flash) and <body> (for CSS variable scope)
    document.documentElement.classList.remove(DARK, LIGHT);
    document.documentElement.classList.add(theme);
    document.body.classList.remove(DARK, LIGHT);
    document.body.classList.add(theme);
    save(theme);
    _updateButtons(theme);
  }

  function toggle() {
    const current = get();
    apply(current === DARK ? LIGHT : DARK);
  }

  /* Sync all .theme-toggle-btn icons across the page */
  function _updateButtons(theme) {
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.setAttribute('title', theme === DARK ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.setAttribute('aria-label', theme === DARK ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
  }

  /* Called once on DOMContentLoaded */
  function init() {
    apply(get());

    /* Wire every toggle button on the page */
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
  }

  return { init, toggle, apply, get };
})();

/* ══════════════════════════════════════════════════════════
   2. TOAST NOTIFICATION SYSTEM
══════════════════════════════════════════════════════════ */
const Toast = (() => {
  let container = null;

  function _ensureContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container-custom';
      document.body.appendChild(container);
    }
  }

  /**
   * Show a toast message.
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   * @param {number} duration  ms before auto-dismiss
   */
  function show(message, type = 'success', duration = 3000) {
    _ensureContainer();

    const icons = {
      success: '<i class="fa-solid fa-circle-check"></i>',
      error:   '<i class="fa-solid fa-circle-xmark"></i>',
      info:    '<i class="fa-solid fa-circle-info"></i>',
    };

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    toast.style.setProperty('--toast-dur', `${duration}ms`);
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-msg">${message}</span>
      <button class="toast-close" aria-label="Dismiss">✕</button>`;

    toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));
    container.appendChild(toast);

    /* Auto-dismiss */
    const timer = setTimeout(() => dismiss(toast), duration);
    toast._timer = timer;
  }

  function dismiss(toast) {
    clearTimeout(toast._timer);
    toast.style.animation = 'toastSlide 0.28s ease reverse forwards';
    setTimeout(() => toast.remove(), 290);
  }

  return { show };
})();

/* ══════════════════════════════════════════════════════════
   3. SIDEBAR
══════════════════════════════════════════════════════════ */
function initSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  const toggle  = document.querySelector('.topbar-toggle');
  if (!sidebar) return;

  /* Create overlay */
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  const open  = () => { sidebar.classList.add('open');    overlay.classList.add('show'); };
  const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };

  if (toggle) toggle.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  overlay.addEventListener('click', close);

  /* Active link highlight */
  const current = location.pathname.split('/').pop() || '';
  sidebar.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href && (href === current || current.startsWith(href.split('.')[0]))) {
      link.classList.add('active');
    }
  });
}

/* ══════════════════════════════════════════════════════════
   4. IMAGE PREVIEW HELPERS
══════════════════════════════════════════════════════════ */
/** Single image preview */
function initSingleImagePreview(inputId, previewId) {
  const input   = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);
  });
}

/** Multiple image gallery preview */
function initGalleryPreview(inputId, containerId) {
  const input     = document.getElementById(inputId);
  const container = document.getElementById(containerId);
  if (!input || !container) return;
  input.addEventListener('change', () => {
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const wrap = document.createElement('div');
        wrap.className = 'gallery-thumb';
        wrap.innerHTML = `<img src="${e.target.result}" alt="preview" /><button class="thumb-remove" aria-label="Remove">✕</button>`;
        wrap.querySelector('.thumb-remove').onclick = () => wrap.remove();
        container.appendChild(wrap);
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  });
}

/* ══════════════════════════════════════════════════════════
   5. DYNAMIC LIST MANAGER
══════════════════════════════════════════════════════════ */
/**
 * @param {string}   addBtnId  - id of "Add" button
 * @param {string}   listId    - id of container
 * @param {function} buildHTML - fn(index) → HTML string
 * @param {function} [onAdd]   - optional callback(wrapper, index)
 */
function DynamicList(addBtnId, listId, buildHTML, onAdd) {
  const addBtn = document.getElementById(addBtnId);
  const list   = document.getElementById(listId);
  if (!addBtn || !list) return;

  let index = list.querySelectorAll('.dynamic-item').length;

  addBtn.addEventListener('click', () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'dynamic-item';
    wrapper.innerHTML = buildHTML(index);
    list.appendChild(wrapper);
    index++;
    if (onAdd) onAdd(wrapper, index);
  });

  list.addEventListener('click', e => {
    const btn = e.target.closest('.item-remove');
    if (btn) btn.closest('.dynamic-item').remove();
  });
}

/* ══════════════════════════════════════════════════════════
   6. LOCAL STATE STORE
   In production: replace Store.set / Store.get with API calls.
══════════════════════════════════════════════════════════ */
const Store = (() => {
  const data = {
    homeAbout: {
      description: 'ZEAL is the annual cultural festival of our institution, celebrating creativity, talent, and tradition through a spectacular array of performances, competitions, and exhibitions.'
    },
    homeStats: [
      { title: '25+', label: 'Events' },
      { title: '5000+', label: 'Participants' },
      { title: '3', label: 'Days' },
      { title: '50+', label: 'Artists' },
    ],
    homeFeatures: [
      { title: 'Performances', description: 'Captivating live music, dance, and theatrical acts by talented artists.' },
      { title: 'Competitions', description: 'Battle of wits and talent across 25+ competitive events.' },
      { title: 'Exhibitions', description: 'Showcase of visual arts, installations, and creative work.' },
    ],
    homeArtists: [
      { year: '2024', name: 'Ritviz', genre: 'Electronic / Indie Pop' },
      { year: '2023', name: 'The Local Train', genre: 'Rock' },
    ],
    homeFaqs: [
      { question: 'When is ZEAL 2025?', answer: 'ZEAL 2025 is scheduled for March 14–16, 2025.' },
      { question: 'Is there an entry fee?', answer: 'General entry is free. Some events require prior registration.' },
    ],
    events: [
      { id: 1, title: 'Battle of Bands', type: 'Music', description: 'Inter-college band competition.' },
      { id: 2, title: 'Nukkad Natak', type: 'Theatre', description: 'Street play competition.' },
      { id: 3, title: 'Photography Hunt', type: 'Visual Arts', description: '3-hour campus photography challenge.' },
    ],
    team: [
      {
        sectionId: 's1', title: 'Conveners',
        members: [
          { id: 'm1', name: 'Arjun Sharma', designation: 'Student Convener', phone: '+91 98765 43210', instagram: 'arjunsharma_zeal' },
          { id: 'm2', name: 'Priya Singh',  designation: 'Student Co-Convener', phone: '+91 87654 32109', instagram: 'priyasingh_zeal' },
        ]
      },
      {
        sectionId: 's2', title: 'Coordinators',
        members: [
          { id: 'm3', name: 'Rohit Kumar', designation: 'Events Coordinator', phone: '+91 76543 21098', instagram: 'rohitkumar_' },
        ]
      }
    ],
    sponsors: [
      { id: 1, category: 'Title Partner', name: 'TechCorp India', logo: null },
      { id: 2, category: 'Powered By',   name: 'StartupHub',     logo: null },
      { id: 3, category: 'Food Partner', name: 'Zomato',         logo: null },
    ],
    announcements: [
      { id: 1, title: 'Registration Open', category: 'Important', date: '2025-01-10', description: 'Registrations for all ZEAL events are now open.' },
      { id: 2, title: 'Workshop Schedule', category: 'Workshop',  date: '2025-01-15', description: 'The schedule for pre-fest workshops has been released.' },
    ],
    footer: {
      developers: [
        { name: 'Aarav Mehta',  role: 'Frontend Developer' },
        { name: 'Sneha Patel',  role: 'Backend Developer' },
      ],
      contact: {
        address: 'Institute Campus, City, State – 411001',
        website: 'https://zeal.institute.edu.in',
        email:   'zeal@institute.edu.in',
        phone:   '+91 20 1234 5678'
      }
    }
  };

  return {
    get:    key   => JSON.parse(JSON.stringify(data[key] ?? null)),
    set:    (key, value) => { data[key] = value; },
    getAll: ()    => data,
  };
})();

/* ══════════════════════════════════════════════════════════
   7. MODAL HELPERS
══════════════════════════════════════════════════════════ */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) bootstrap.Modal.getOrCreateInstance(el).show();
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) bootstrap.Modal.getInstance(el)?.hide();
}

/* ══════════════════════════════════════════════════════════
   8. UTILITIES
══════════════════════════════════════════════════════════ */
/** Styled confirm with fallback to native */
function confirmDelete(message, onConfirm) {
  if (confirm(message || 'Are you sure you want to delete this?')) onConfirm();
}

/** Format a YYYY-MM-DD date string for display */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Generate a short unique ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ══════════════════════════════════════════════════════════
   9. INIT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();  // Always first — avoids flash
  initSidebar();
});
