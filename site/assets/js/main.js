// Kinema in the Woods — unofficial redesign concept.
// Section 1: header state, search panel, mobile menu and booking-demo dialog.
// Demo only: nothing here sends data anywhere.
(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.getElementById('site-header');
  const searchToggle = header.querySelector('.search-toggle');
  const searchPanel = document.getElementById('search-panel');
  const menuToggle = header.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const dialog = document.getElementById('booking-demo');
  const desktopQuery = window.matchMedia('(min-width: 960px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const PANEL_MS = 260;

  // Elements made inert while the full-screen menu is open.
  const backgroundEls = [document.getElementById('main'), document.querySelector('.footer-temp'),
    document.getElementById('concept-badge'), document.querySelector('.skip-link')];

  /* ---------- Compact header on scroll ---------- */
  const COMPACT_AFTER = 24;
  let ticking = false;
  const updateHeader = () => {
    header.classList.toggle('is-compact', window.scrollY > COMPACT_AFTER);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateHeader); }
  }, { passive: true });
  updateHeader();

  /* ---------- Scroll lock (reasons can overlap: menu + dialog) ---------- */
  const locks = new Set();
  const lockScroll = (reason, on) => {
    on ? locks.add(reason) : locks.delete(reason);
    root.classList.toggle('is-scroll-locked', locks.size > 0);
  };

  /* ---------- Animated show/hide for [hidden] panels (interruptible) ---------- */
  const timers = new WeakMap();
  const showPanel = (el) => {
    clearTimeout(timers.get(el));
    el.hidden = false;
    void el.offsetWidth; // commit start state so the entrance transition runs
    el.classList.add('is-open');
  };
  const hidePanel = (el) => {
    el.classList.remove('is-open');
    clearTimeout(timers.get(el));
    timers.set(el, setTimeout(() => { el.hidden = true; }, reducedMotion.matches ? 0 : PANEL_MS));
  };
  const isOpen = (toggle) => toggle.getAttribute('aria-expanded') === 'true';

  /* ---------- Desktop search panel ---------- */
  const openSearch = () => {
    searchToggle.setAttribute('aria-expanded', 'true');
    showPanel(searchPanel);
    searchPanel.querySelector('input').focus();
  };
  const closeSearch = ({ restoreFocus = false } = {}) => {
    if (!isOpen(searchToggle)) return;
    searchToggle.setAttribute('aria-expanded', 'false');
    hidePanel(searchPanel);
    if (restoreFocus) searchToggle.focus();
  };
  searchToggle.addEventListener('click', () => (isOpen(searchToggle) ? closeSearch() : openSearch()));
  searchPanel.querySelector('[data-close-search]').addEventListener('click', () => closeSearch({ restoreFocus: true }));

  // Close when focus or a click moves outside the panel and its toggle.
  document.addEventListener('pointerdown', (e) => {
    if (isOpen(searchToggle) && !searchPanel.contains(e.target) && !searchToggle.contains(e.target)) closeSearch();
  });
  searchPanel.addEventListener('focusout', (e) => {
    if (e.relatedTarget && !searchPanel.contains(e.relatedTarget) && e.relatedTarget !== searchToggle) closeSearch();
  });

  /* ---------- Mobile / tablet menu ---------- */
  const setBackgroundInert = (on) => backgroundEls.forEach((el) => { if (el) el.inert = on; });
  const openMenu = () => {
    closeSearch();
    menuToggle.setAttribute('aria-expanded', 'true');
    showPanel(menu);
    setBackgroundInert(true);
    lockScroll('menu', true);
  };
  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!isOpen(menuToggle)) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    hidePanel(menu);
    setBackgroundInert(false);
    lockScroll('menu', false);
    if (restoreFocus) menuToggle.focus();
  };
  menuToggle.addEventListener('click', () => (isOpen(menuToggle) ? closeMenu() : openMenu()));

  // Switching to the desktop layout closes the menu; switching to mobile closes desktop search.
  desktopQuery.addEventListener('change', (e) => {
    if (e.matches) closeMenu();
    else closeSearch();
  });

  /* ---------- In-page navigation to section placeholders ---------- */
  const goToSection = (hash) => {
    const target = hash === '#top' ? document.getElementById('top') : document.querySelector(hash);
    if (!target) return;
    const behavior = reducedMotion.matches ? 'auto' : 'smooth';
    if (hash === '#top') window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior, block: 'start' });
    if (target.tabIndex >= 0 || target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
    history.pushState(null, '', hash);
  };
  document.querySelectorAll('.nav-link, .mobile-menu__link, .wordmark').forEach((link) => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (!hash || !hash.startsWith('#')) return;
      e.preventDefault();
      const fromMenu = menu.contains(link);
      if (fromMenu) closeMenu();
      // Wait a frame so the scroll lock is released before scrolling.
      requestAnimationFrame(() => goToSection(hash));
    });
  });

  /* ---------- Film search (honest demo state) ---------- */
  document.querySelectorAll('[data-film-search]').forEach((form) => {
    const input = form.querySelector('input');
    const status = form.querySelector('[data-search-status]');
    const initial = status.textContent.trim().replace(/\s+/g, ' ');
    const render = () => {
      const q = input.value.trim();
      status.textContent = q
        ? `No results for “${q}”. This concept has no film programme loaded yet — search will connect to the What’s On demo in Section 4.`
        : initial;
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); render(); });
    input.addEventListener('search', render); // clearing via the native ✕
  });

  /* ---------- Booking demo dialog ---------- */
  let dialogOpener = null;
  document.querySelectorAll('[data-open-booking]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeSearch();
      dialogOpener = btn;
      dialog.showModal();
      lockScroll('dialog', true);
    });
  });
  dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); // backdrop
  dialog.addEventListener('close', () => {
    lockScroll('dialog', false);
    if (dialogOpener && dialogOpener.isConnected) dialogOpener.focus();
    dialogOpener = null;
  });

  /* ---------- Escape closes the topmost open panel ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || dialog.open) return; // the dialog handles its own Escape
    if (isOpen(searchToggle)) { e.preventDefault(); closeSearch({ restoreFocus: true }); }
    else if (isOpen(menuToggle)) { e.preventDefault(); closeMenu({ restoreFocus: true }); }
  });
})();
