// Shared client helpers for Focus Frontier
const API_BASE = localStorage.getItem('api_base') || 'http://localhost:4000/api';

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

function toast(message, variant = 'info') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.borderColor = variant === 'error' ? 'var(--danger)' : 'rgba(255,255,255,0.12)';
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 2400);
}

function authHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function startSession(gameKey, difficulty = null) {
  const body = difficulty ? { gameKey, difficulty } : { gameKey };
  const data = await api('/sessions/start', { method: 'POST', body: JSON.stringify(body) });
  return data.id;
}

async function recordMetrics(sessionId, metrics = [], end = false) {
  if (!sessionId) return;
  await api(`/sessions/${sessionId}/record`, {
    method: 'POST',
    body: JSON.stringify({ metrics, end })
  });
}

async function loadAnalytics(scope = 'me', days = 30) {
  return api(`/analytics/overview?scope=${scope}&days=${days}`, { method: 'GET' });
}

function downloadBlob(filename, blob) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 0);
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(filename, blob);
}

function toCsv(rows, headers) {
  const escape = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const headerLine = headers.map(escape).join(',');
  const body = rows.map((row) => headers.map((h) => escape(row[h])).join(',')).join('\n');
  return `${headerLine}\n${body}`;
}

function downloadCsv(filename, rows, headers) {
  const csv = toCsv(rows, headers);
  const blob = new Blob([csv], { type: 'text/csv' });
  downloadBlob(filename, blob);
}

function savePrefs({ highContrast, fontScale }) {
  if (typeof highContrast === 'boolean') localStorage.setItem('pref_highContrast', highContrast ? '1' : '0');
  if (fontScale) localStorage.setItem('pref_fontScale', String(fontScale));
}

function applyPrefsFromStorage() {
  const hc = localStorage.getItem('pref_highContrast') === '1';
  document.body.classList.toggle('high-contrast', hc);
  const fs = parseFloat(localStorage.getItem('pref_fontScale') || '1');
  if (!isNaN(fs)) document.documentElement.style.fontSize = `${16 * fs}px`;
}

function bindContrastToggle(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener('click', () => {
    const on = !document.body.classList.contains('high-contrast');
    document.body.classList.toggle('high-contrast', on);
    savePrefs({ highContrast: on });
  });
}

function bindFontSlider(sliderId) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;
  slider.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value || '1');
    if (!isNaN(v)) {
      document.documentElement.style.fontSize = `${16 * v}px`;
      savePrefs({ fontScale: v });
    }
  });
}

async function handleAuth(form) {
  const email = form.querySelector('input[name=email]')?.value.trim();
  const password = form.querySelector('input[name=password]')?.value;
  const displayName = form.querySelector('input[name=displayName]')?.value?.trim();
  const mode = form.dataset.mode;
  try {
    const payload = { email, password, ...(displayName ? { displayName } : {}) };
    const data = await api(`/auth/${mode === 'register' ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    toast('Signed in');
    window.location.href = 'index.html';
  } catch (e) {
    toast(e.message || 'Auth failed', 'error');
  }
}

function renderUserChip(targetSel) {
  const target = $(targetSel);
  if (!target) return;
  const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
  if (!user) {
    target.innerHTML = '<a href="auth.html" class="chip">Login / Register</a>';
  } else {
    target.innerHTML = `<span class="chip">${user.displayName || user.email}</span> <button class="btn secondary" id="logout-btn">Logout</button>`;
    const logout = document.getElementById('logout-btn');
    logout?.addEventListener('click', () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.reload();
    });
  }
}

document.addEventListener('DOMContentLoaded', applyPrefsFromStorage);
