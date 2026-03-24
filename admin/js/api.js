/* ============================================================
   ZEAL Admin Panel — api.js
   Centralised API layer. All backend calls go through here.
   ============================================================ */
'use strict';

/* ── Configuration ─────────────────────────────────────── */
// Auto-detect local dev: use local backend when opened via file:// or localhost
const _isLocal = location.protocol === 'file:'
  || location.hostname === 'localhost'
  || location.hostname === '127.0.0.1';
const API_BASE = window.ZEAL_API_BASE
  || (_isLocal ? 'http://localhost:5050/api' : 'https://zeal-backend.onrender.com/api');

/* ── Auth helpers ──────────────────────────────────────── */
const Auth = (() => {
  const KEY = 'zeal-admin-token';

  function getToken()       { return localStorage.getItem(KEY); }
  function setToken(token)  { localStorage.setItem(KEY, token); }
  function clearToken()     { localStorage.removeItem(KEY); }
  function isLoggedIn()     { return !!getToken(); }

  function authHeaders() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  function guardPage() {
    if (!isLoggedIn()) {
      window.location.href = 'admin-login.html';
    }
  }

  function logout() {
    clearToken();
    window.location.href = 'admin-login.html';
  }

  return { getToken, setToken, clearToken, isLoggedIn, authHeaders, guardPage, logout };
})();

/* ── Generic fetch wrapper ─────────────────────────────── */
async function apiFetch(path, options = {}) {
  const url = API_BASE + path;
  const headers = {
    ...Auth.authHeaders(),
    ...(options.headers || {}),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok || data.success === false) {
    const msg = data.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

/* ── Admin Auth ────────────────────────────────────────── */
const AdminAPI = {
  async login(email, password) {
    const data = await apiFetch('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    Auth.setToken(data.token);
    return data;
  },
};

/* ── Dashboard ─────────────────────────────────────────── */
const DashboardAPI = {
  async getStats() {
    const data = await apiFetch('/dashboard');
    return data.data;
  },
};

/* ── Events ────────────────────────────────────────────── */
const EventsAPI = {
  async getAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const data = await apiFetch('/events' + (qs ? '?' + qs : ''));
    return data.data;
  },
  async create(payload) {
    const data = await apiFetch('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.data;
  },
  async update(id, payload) {
    const data = await apiFetch(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return data.data;
  },
  async delete(id) {
    return apiFetch(`/events/${id}`, { method: 'DELETE' });
  },
};

/* ── Team ──────────────────────────────────────────────── */
const TeamAPI = {
  async getAll() {
    const data = await apiFetch('/team');
    return data.data;
  },
  async createSection(sectionName) {
    const data = await apiFetch('/team/section', {
      method: 'POST',
      body: JSON.stringify({ sectionName }),
    });
    return data.data;
  },
  async deleteSection(sectionId) {
    return apiFetch(`/team/section/${sectionId}`, { method: 'DELETE' });
  },
  async addMember(sectionId, formData) {
    const res = await fetch(`${API_BASE}/team/${sectionId}`, {
      method: 'POST',
      headers: { ...Auth.authHeaders() },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to add member');
    return data.data;
  },
  async updateMember(sectionId, memberId, formData) {
    const res = await fetch(`${API_BASE}/team/${sectionId}/${memberId}`, {
      method: 'PUT',
      headers: { ...Auth.authHeaders() },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to update member');
    return data.data;
  },
  async deleteMember(sectionId, memberId) {
    return apiFetch(`/team/${sectionId}/${memberId}`, { method: 'DELETE' });
  },
};

/* ── Sponsors ──────────────────────────────────────────── */
const SponsorsAPI = {
  async getAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const data = await apiFetch('/sponsors' + (qs ? '?' + qs : ''));
    return data.data;
  },
  async createCategory(category) {
    const data = await apiFetch('/sponsors/category', {
      method: 'POST',
      body: JSON.stringify({ category }),
    });
    return data.data;
  },
  async deleteCategory(id) {
    return apiFetch(`/sponsors/category/${id}`, { method: 'DELETE' });
  },
  async addSponsor(categoryId, formData) {
    const res = await fetch(`${API_BASE}/sponsors/${categoryId}`, {
      method: 'POST',
      headers: { ...Auth.authHeaders() },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to add sponsor');
    return data.data;
  },
  async updateSponsor(categoryId, sponsorId, formData) {
    const res = await fetch(`${API_BASE}/sponsors/${categoryId}/${sponsorId}`, {
      method: 'PUT',
      headers: { ...Auth.authHeaders() },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to update sponsor');
    return data.data;
  },
  async deleteSponsor(categoryId, sponsorId) {
    return apiFetch(`/sponsors/${categoryId}/${sponsorId}`, { method: 'DELETE' });
  },
};

/* ── Announcements ─────────────────────────────────────── */
const AnnouncementsAPI = {
  async getAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const data = await apiFetch('/announcements' + (qs ? '?' + qs : ''));
    return data.data;
  },
  async create(payload) {
    const data = await apiFetch('/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.data;
  },
  async update(id, payload) {
    const data = await apiFetch(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return data.data;
  },
  async delete(id) {
    return apiFetch(`/announcements/${id}`, { method: 'DELETE' });
  },
  async toggleVisibility(id) {
    const data = await apiFetch(`/announcements/${id}/toggle`, { method: 'PATCH' });
    return data.data;
  },
};

/* ── Home ──────────────────────────────────────────────── */
const HomeAPI = {
  async get() {
    const data = await apiFetch('/home');
    return data.data;
  },
  async updateAbout(aboutFestival) {
    const data = await apiFetch('/home/about', {
      method: 'PUT',
      body: JSON.stringify({ aboutFestival }),
    });
    return data.data;
  },
  async updateStats(stats) {
    const data = await apiFetch('/home/stats', {
      method: 'PUT',
      body: JSON.stringify({ stats }),
    });
    return data.data;
  },
  async updateHighlights(highlights) {
    const data = await apiFetch('/home/highlights', {
      method: 'PUT',
      body: JSON.stringify({ highlights }),
    });
    return data.data;
  },
  async addGalleryImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/home/gallery`, {
      method: 'POST',
      headers: { ...Auth.authHeaders() },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to upload image');
    return data.data;
  },
  async deleteGalleryImage(index) {
    return apiFetch(`/home/gallery/${index}`, { method: 'DELETE' });
  },
  async updateArtists(artistsTimeline) {
    const data = await apiFetch('/home/artists', {
      method: 'PUT',
      body: JSON.stringify({ artistsTimeline }),
    });
    return data.data;
  },
  async updateFAQ(faq) {
    const data = await apiFetch('/home/faq', {
      method: 'PUT',
      body: JSON.stringify({ faq }),
    });
    return data.data;
  },
};

/* ── Footer ────────────────────────────────────────────── */
const FooterAPI = {
  async get() {
    const data = await apiFetch('/footer');
    return data.data;
  },
  async updateDevelopers(developers) {
    const data = await apiFetch('/footer/developers', {
      method: 'PUT',
      body: JSON.stringify({ developers }),
    });
    return data.data;
  },
  async updateContact(contact) {
    const data = await apiFetch('/footer/contact', {
      method: 'PUT',
      body: JSON.stringify(contact),
    });
    return data.data;
  },
  async updateAll(developers, contact) {
    const data = await apiFetch('/footer', {
      method: 'PUT',
      body: JSON.stringify({ developers, contact }),
    });
    return data.data;
  },
};
