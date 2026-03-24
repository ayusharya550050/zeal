// ========================================
// ZEAL Cultural Festival - PWA Registration
// ========================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use relative path for service worker
    const swPath = 'pwa/service-worker.js';
    navigator.serviceWorker.register(swPath, { scope: './' })
      .then(registration => {
        console.log('[ZEAL PWA] Service Worker registered:', registration.scope);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast();
            }
          });
        });
      })
      .catch(err => console.warn('[ZEAL PWA] Service Worker registration failed:', err));
  });
}

// Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner();
  showNavInstallBtn();
});

function showNavInstallBtn() {
  document.querySelectorAll('#nav-install-btn, #nav-install-btn-mobile').forEach(btn => {
    if (btn) btn.classList.add('visible');
  });
}

function showInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.display = 'flex';
    setTimeout(() => banner.classList.add('visible'), 100);
  }
}

function showUpdateToast() {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #14141A;
    border: 1px solid rgba(212,175,55,0.3);
    color: #F2F2F2;
    padding: 1rem 1.5rem;
    border-radius: 4px;
    z-index: 9999;
    font-family: 'Poppins', sans-serif;
    font-size: 0.85rem;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
  `;
  toast.innerHTML = `
    New version available.
    <button onclick="location.reload()" style="color:#D4AF37;background:none;border:none;cursor:pointer;font-weight:600;">Refresh</button>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 8000);
}

async function triggerInstall() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  if (choice.outcome === 'accepted') {
    console.log('[ZEAL PWA] App installed');
  }
  deferredPrompt = null;
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.style.display = 'none';
  document.querySelectorAll('#nav-install-btn, #nav-install-btn-mobile').forEach(btn => {
    if (btn) btn.classList.remove('visible');
  });
}

// Install button handlers
document.addEventListener('click', (e) => {
  const target = e.target.closest('#pwa-install-btn, #nav-install-btn, #nav-install-btn-mobile');
  if (target) {
    triggerInstall();
    return;
  }
  if (e.target.id === 'pwa-dismiss-btn') {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.style.display = 'none';
  }
});

window.addEventListener('appinstalled', () => {
  console.log('[ZEAL PWA] App installed successfully');
  deferredPrompt = null;
  document.querySelectorAll('#nav-install-btn, #nav-install-btn-mobile').forEach(btn => {
    if (btn) btn.classList.remove('visible');
  });
});

