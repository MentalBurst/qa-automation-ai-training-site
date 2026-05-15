/**
 * utils.js QA Training Site
 * Shared utility functions: toast, modal helpers, form validation, timers
 */

'use strict';

/* ── Toast System ────────────────────────────────────────── */
const Toast = (() => {
  const ICONS = { success: '🟢', error: '🔴', warning: '🟡', info: '🔵' };
  const AUTO_CLOSE = 4000;

  function getContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.setAttribute('role', 'region');
      c.setAttribute('aria-live', 'polite');
      c.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(c);
    }
    return c;
  }

  function show({ type = 'info', title = '', message = '', duration = AUTO_CLOSE }) {
    const container = getContainer();
    const id = 'toast-' + Date.now();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = id;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('data-testid', `toast-${type}`);
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${ICONS[type]}</span>
      <div class="toast-body">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        ${message ? `<p class="toast-message">${message}</p>` : ''}
      </div>
      <button class="toast-close" aria-label="Close notification" data-testid="toast-close">✕</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => remove(toast));
    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => remove(toast), duration);
    }

    return id;
  }

  function remove(el) {
    if (!el || !el.parentNode) return;
    el.classList.add('removing');
    setTimeout(() => el.remove(), 350);
  }

  return {
    success: (title, message, opts) => show({ type: 'success', title, message, ...opts }),
    error:   (title, message, opts) => show({ type: 'error',   title, message, ...opts }),
    warning: (title, message, opts) => show({ type: 'warning', title, message, ...opts }),
    info:    (title, message, opts) => show({ type: 'info',    title, message, ...opts }),
    show,
  };
})();

/* ── Modal helpers ───────────────────────────────────────── */
const Modal = (() => {
  function open(id) {
    const backdrop = document.getElementById(id);
    if (!backdrop) return;
    backdrop.classList.remove('hidden');
    backdrop.setAttribute('aria-hidden', 'false');
    const firstFocusable = backdrop.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
    document.body.style.overflow = 'hidden';
  }

  function close(id) {
    const backdrop = document.getElementById(id);
    if (!backdrop) return;
    backdrop.classList.add('hidden');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Close on backdrop click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.add('hidden');
      document.body.style.overflow = '';
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(b => {
        b.classList.add('hidden');
        document.body.style.overflow = '';
      });
    }
  });

  return { open, close };
})();

/* ── Tabs system ─────────────────────────────────────────── */
function initTabs(container) {
  if (!container) return;
  const buttons = container.querySelectorAll('[role="tab"]');
  const panels  = container.querySelectorAll('[role="tabpanel"]');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab') || btn.getAttribute('aria-controls');
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(target);
      if (panel) {
        panel.classList.add('active');
        panel.hidden = false;
      }
    });
  });

  // Arrow key navigation
  container.addEventListener('keydown', (e) => {
    const active = Array.from(buttons).indexOf(document.activeElement);
    if (active === -1) return;
    if (e.key === 'ArrowRight') {
      const next = (active + 1) % buttons.length;
      buttons[next].focus();
      buttons[next].click();
    } else if (e.key === 'ArrowLeft') {
      const prev = (active - 1 + buttons.length) % buttons.length;
      buttons[prev].focus();
      buttons[prev].click();
    }
  });
}

/* ── Accordion ───────────────────────────────────────────── */
function initAccordions(container) {
  const items = (container || document).querySelectorAll('.accordion-item');
  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (!header) return;
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Optionally close others
      if (item.closest('[data-accordion-exclusive]')) {
        item.closest('[data-accordion-exclusive]')
          .querySelectorAll('.accordion-item.open')
          .forEach(i => i.classList.remove('open'));
      }
      item.classList.toggle('open', !isOpen);
      header.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* ── Form validation helpers ─────────────────────────────── */
const Validate = {
  required: (val) => val !== null && val !== undefined && String(val).trim() !== '',
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  minLength: (val, n) => String(val).trim().length >= n,
  maxLength: (val, n) => String(val).trim().length <= n,
  pattern: (val, re) => re.test(val),
  numeric: (val) => !isNaN(parseFloat(val)) && isFinite(val),
  url: (val) => { try { new URL(val); return true; } catch { return false; } },
  phone: (val) => /^\+?[\d\s\-()]{7,}$/.test(val),

  /** Show/hide inline error.  Returns true if valid. */
  field(input, rules = []) {
    const group = input.closest('.form-group');
    const errorEl = group ? group.querySelector('.form-error') : null;
    let message = '';

    for (const rule of rules) {
      if (!rule.test(input.value)) {
        message = rule.message;
        break;
      }
    }

    input.classList.toggle('is-valid', !message);
    input.classList.toggle('is-invalid', !!message);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.toggle('visible', !!message);
    }
    return !message;
  },
};

/* ── Async helpers ───────────────────────────────────────── */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Show a loading overlay inside an element */
function setLoading(el, on = true) {
  if (!el) return;
  if (on) {
    el.classList.add('is-loading');
    let overlay = el.querySelector('.loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="spinner" aria-label="Loading"></div>';
      overlay.style.cssText = 'position:absolute;inset:0;background:rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;border-radius:inherit;z-index:10';
      el.style.position = el.style.position || 'relative';
      el.appendChild(overlay);
    }
  } else {
    el.classList.remove('is-loading');
    const overlay = el.querySelector('.loading-overlay');
    if (overlay) overlay.remove();
  }
}

/* ── LocalStorage wrapper ────────────────────────────────── */
const Store = {
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  remove(key) { try { localStorage.removeItem(key); } catch {} },
  clear()     { try { localStorage.clear(); } catch {} },
};

/* ── Navigation helpers ──────────────────────────────────── */
function setActiveNavLink() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.endsWith(current) || (current === 'index.html' && href === '../index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── Copy to clipboard ───────────────────────────────────── */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    Toast.success('Copied!', 'Text copied to clipboard.');
    return true;
  } catch {
    Toast.error('Copy failed', 'Clipboard access denied.');
    return false;
  }
}

/* ── DOMContentLoaded initialisation ─────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNavLink();
  initAccordions();
  document.querySelectorAll('[data-tabs]').forEach(initTabs);

  // Mobile nav toggle
  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
  }

  // [data-modal-open] and [data-modal-close] attrs
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => Modal.open(btn.dataset.modalOpen));
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => Modal.close(btn.closest('.modal-backdrop').id));
  });
});

