// ========================================
// ZEAL Cultural Festival - Theme Switcher
// ========================================

(function () {
  'use strict';

  const STORAGE_KEY = 'zeal-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  // Get saved preference, default to dark
  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DARK;
    } catch (e) {
      return DARK;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }

  function applyTheme(theme) {
    const isLight = theme === LIGHT;
    document.body.classList.toggle('light-theme', isLight);
    document.documentElement.classList.remove('light-theme-preload');

    // Update all toggle buttons
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      const icon = btn.querySelector('.theme-icon');
      const label = btn.querySelector('.theme-label');
      if (icon) icon.textContent = isLight ? '🌙' : '☀️';
      if (label) label.textContent = isLight ? 'Dark' : 'Light';
      btn.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} mode`);
    });

    // Update particles opacity for light theme
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
      canvas.style.opacity = isLight ? '0.12' : '0.4';
    }
  }

  function toggleTheme() {
    const current = document.body.classList.contains('light-theme') ? LIGHT : DARK;
    const next = current === DARK ? LIGHT : DARK;
    applyTheme(next);
    saveTheme(next);
  }

  // Apply on page load
  document.addEventListener('DOMContentLoaded', function () {
    const saved = getSavedTheme();
    applyTheme(saved);

    // Bind all toggle buttons
    document.querySelectorAll('#themeToggle, #themeToggleMobile').forEach(btn => {
      if (btn) {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', toggleTheme);
      }
    });
  });

  // Also apply immediately if preload class exists
  const preloadEl = document.documentElement;
  if (preloadEl.classList.contains('light-theme-preload')) {
    // Will be properly applied on DOMContentLoaded
  }

  // Expose globally
  window.zealToggleTheme = toggleTheme;
})();
