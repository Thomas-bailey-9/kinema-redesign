// Kinema in the Woods — unofficial redesign concept.
// Section 1: header state, search panel, mobile menu and demo dialogs.
// Section 2: opening image settle; opening actions reuse the section-link handler.
// Section 3: header Book links go to the quick-booking panel; shared helpers exposed on window.KinemaUI.
// Demo only: nothing here sends data anywhere.
(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.getElementById('site-header');
  const searchToggle = header.querySelector('.search-toggle');
  const searchPanel = document.getElementById('search-panel');
  const menuToggle = header.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
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
  // scroll-padding-top on <html> keeps targets clear of the sticky header.
  // focusId (optional) names a control to focus instead of the section itself.
  const goToSection = (hash, focusId) => {
    const target = hash === '#top' ? document.getElementById('top') : document.querySelector(hash);
    if (!target) return;
    const behavior = reducedMotion.matches ? 'auto' : 'smooth';
    if (hash === '#top') window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior, block: 'start' });
    const focusEl = focusId && document.getElementById(focusId);
    if (focusEl && !focusEl.disabled) focusEl.focus({ preventScroll: true });
    else if (target.tabIndex >= 0 || target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
    history.pushState(null, '', hash);
  };
  document.querySelectorAll('.nav-link, .mobile-menu__link, .wordmark, [data-section-link]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (!hash || !hash.startsWith('#')) return;
      e.preventDefault();
      closeSearch();
      closeMenu(); // no-op unless the mobile menu is open (e.g. header Book while the menu is open)
      // Wait a frame so the scroll lock is released before scrolling.
      requestAnimationFrame(() => goToSection(hash, link.dataset.focus));
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

  /* ---------- Demo dialogs (film preview, demo screening) ---------- */
  // Native modal <dialog>: focus is contained and Escape closes it; we restore focus
  // to the control that opened it and lock page scroll while it is open.
  let dialogOpener = null;
  const openDialog = (target, opener) => {
    closeSearch();
    dialogOpener = opener || document.activeElement;
    target.showModal();
    lockScroll('dialog', true);
  };
  document.querySelectorAll('[data-open-dialog]').forEach((btn) => {
    const target = document.getElementById(btn.dataset.openDialog);
    if (!target) return;
    btn.addEventListener('click', () => openDialog(target, btn));
  });
  document.querySelectorAll('dialog.demo-dialog').forEach((dlg) => {
    dlg.querySelectorAll('[data-close-dialog]').forEach((b) => b.addEventListener('click', () => dlg.close()));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // backdrop
    dlg.addEventListener('close', () => {
      lockScroll('dialog', false);
      if (dialogOpener && dialogOpener.isConnected) dialogOpener.focus();
      dialogOpener = null;
    });
  });
  const anyDialogOpen = () => !!document.querySelector('dialog[open]');
  window.KinemaUI = Object.freeze({ openDialog, reducedMotion });

  /* ---------- Section 2: opening image settle ---------- */
  // Content and actions are visible immediately; only the photograph eases from 1.03 to 1.
  const opening = document.querySelector('.opening');
  const openingImg = opening && opening.querySelector('.opening__img');
  if (openingImg && !reducedMotion.matches) {
    opening.classList.add('is-settling');
    const settle = () => requestAnimationFrame(() => requestAnimationFrame(() => opening.classList.add('is-settled')));
    if (openingImg.complete) settle();
    else {
      openingImg.addEventListener('load', settle, { once: true });
      openingImg.addEventListener('error', settle, { once: true });
    }
  }

  /* ---------- Escape closes the topmost open panel ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || anyDialogOpen()) return; // dialogs handle their own Escape
    if (isOpen(searchToggle)) { e.preventDefault(); closeSearch({ restoreFocus: true }); }
    else if (isOpen(menuToggle)) { e.preventDefault(); closeMenu({ restoreFocus: true }); }
  });
})();
