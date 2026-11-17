// Kinema in the Woods — unofficial redesign concept.
// Section 3: quick booking — connected Film → Date → Time → Continue, using the shared
// fictional data in demo-data.js. Demo only: nothing is reserved or sent anywhere.
(() => {
  'use strict';

  const data = window.KINEMA_DEMO;
  const form = document.getElementById('quick-book-form');
  if (!data || !form) return;

  const filmSel = document.getElementById('qb-film');
  const dateSel = document.getElementById('qb-date');
  const timeSel = document.getElementById('qb-time');
  const continueBtn = document.getElementById('qb-continue');
  const noticeEl = document.querySelector('[data-qb-notice]');
  const guideEl = document.querySelector('[data-qb-guide]');
  const summaryEl = document.querySelector('[data-qb-summary]');
  const dialog = document.getElementById('screening-demo');

  /* ---------- Formatting (explicit UK formats, independent of the visitor's locale) ---------- */
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const parts = (iso) => { const [y, m, d] = iso.split('-').map(Number); return { y, m, d, wd: new Date(Date.UTC(y, m - 1, d)).getUTCDay() }; };
  const shortDate = (iso) => { const p = parts(iso); return `${DAYS[p.wd].slice(0, 3)} ${p.d} ${MONTHS[p.m - 1].slice(0, 3)} ${p.y}`; };
  const longDate = (iso) => { const p = parts(iso); return `${DAYS[p.wd]} ${p.d} ${MONTHS[p.m - 1]} ${p.y}`; };
  // Times are stored as 24-hour "HH:MM" strings already.

  /* ---------- Data helpers ---------- */
  const filmById = new Map(data.films.map((f) => [f.id, f]));
  const screeningsFor = (filmId, date) => data.screenings
    .filter((s) => s.filmId === filmId && (!date || s.date === date))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const datesFor = (filmId) => {
    const byDate = new Map();
    screeningsFor(filmId).forEach((s) => byDate.set(s.date, (byDate.get(s.date) || false) || !s.soldOut));
    return [...byDate].map(([date, available]) => ({ date, available }));
  };
  const findScreening = (filmId, date, time) => data.screenings.find((s) => s.filmId === filmId && s.date === date && s.time === time);
  const dateAvailable = (filmId, date) => screeningsFor(filmId, date).some((s) => !s.soldOut);

  /* ---------- State (kept in page state for the later booking flow) ---------- */
  const state = { filmId: '', date: '', time: '' };
  const selected = () => {
    const s = state.time && findScreening(state.filmId, state.date, state.time);
    return s && !s.soldOut ? s : null;
  };
  window.KinemaDemoState = window.KinemaDemoState || {};
  const publish = () => {
    const s = selected();
    window.KinemaDemoState.quickBooking = s ? { screeningId: s.id, filmId: s.filmId, date: s.date, time: s.time } : null;
  };

  /* ---------- Rendering ---------- */
  const option = (value, text, { disabled = false } = {}) => {
    const o = document.createElement('option');
    o.value = value; o.textContent = text; o.disabled = disabled;
    return o;
  };
  const setField = (select, enabled) => {
    select.disabled = !enabled;
    select.closest('.qb-field').classList.toggle('is-disabled', !enabled);
  };

  filmSel.replaceChildren(option('', 'Choose a film'), ...data.films.map((f) => option(f.id, f.title)));

  const renderDates = () => {
    if (!state.filmId) {
      dateSel.replaceChildren(option('', 'Choose a film first'));
      setField(dateSel, false);
      return;
    }
    dateSel.replaceChildren(option('', 'Choose a date'), ...datesFor(state.filmId).map(({ date, available }) =>
      option(date, available ? shortDate(date) : `${shortDate(date)} · Sold out`, { disabled: !available })));
    dateSel.value = state.date;
    setField(dateSel, true);
  };
  const renderTimes = () => {
    if (!state.date) {
      timeSel.replaceChildren(option('', 'Choose a date first'));
      setField(timeSel, false);
      return;
    }
    timeSel.replaceChildren(option('', 'Choose a time'), ...screeningsFor(state.filmId, state.date).map((s) =>
      option(s.time, s.soldOut ? `${s.time} · Sold out` : s.time, { disabled: s.soldOut })));
    timeSel.value = state.time;
    setField(timeSel, true);
  };

  let notice = '';
  const renderStatus = () => {
    const s = selected();
    noticeEl.textContent = notice;
    noticeEl.hidden = !notice;
    if (s) {
      const title = filmById.get(s.filmId).title;
      summaryEl.innerHTML = '';
      const label = document.createElement('span');
      label.className = 'quick-book__summary-label';
      label.textContent = 'Your selection: ';
      summaryEl.append(label, `${title} · ${shortDate(s.date)} · ${s.time}`);
      summaryEl.hidden = false;
      summaryEl.classList.remove('is-fresh'); void summaryEl.offsetWidth; summaryEl.classList.add('is-fresh');
      guideEl.textContent = 'Ready to continue.';
    } else {
      summaryEl.hidden = true;
      guideEl.textContent = !state.filmId ? 'Choose a film to see its demo dates.'
        : !state.date ? 'Next, choose a date.'
        : 'Next, choose a time.';
    }
    continueBtn.disabled = !s;
    publish();
  };
  const render = () => { renderDates(); renderTimes(); renderStatus(); };

  /* ---------- Changes: keep later choices only while they remain valid ---------- */
  filmSel.addEventListener('change', () => {
    const prev = { ...state };
    notice = '';
    state.filmId = filmSel.value;
    if (!state.filmId) {
      if (prev.date) notice = 'Film cleared, so the date and time were reset.';
      state.date = ''; state.time = '';
    } else if (state.date) {
      const title = filmById.get(state.filmId).title;
      if (!dateAvailable(state.filmId, state.date)) {
        notice = `${title} has no available demo screenings on ${shortDate(state.date)}, so the date${state.time ? ' and time were' : ' was'} cleared.`;
        state.date = ''; state.time = '';
      } else if (state.time) {
        const s = findScreening(state.filmId, state.date, state.time);
        if (!s || s.soldOut) {
          notice = `${state.time} isn’t available for ${title} on ${shortDate(state.date)}, so the time was cleared.`;
          state.time = '';
        } else {
          notice = `${title} also shows on ${shortDate(state.date)} at ${state.time}, so your date and time were kept.`;
        }
      } else {
        notice = `${title} also shows on ${shortDate(state.date)}, so your date was kept.`;
      }
    }
    render();
  });

  dateSel.addEventListener('change', () => {
    notice = '';
    const date = dateSel.value;
    if (date && !dateAvailable(state.filmId, date)) {
      // Guard: a sold-out date cannot be chosen.
      notice = `${shortDate(date)} is sold out for this film. Please choose another date.`;
      state.date = ''; state.time = '';
      render();
      return;
    }
    state.date = date;
    if (!state.date) {
      if (state.time) notice = 'Date cleared, so the time was reset.';
      state.time = '';
    } else if (state.time) {
      const s = findScreening(state.filmId, state.date, state.time);
      if (!s || s.soldOut) {
        notice = `${state.time} isn’t showing on ${shortDate(state.date)}, so the time was cleared.`;
        state.time = '';
      } else {
        notice = `${state.time} is also showing on ${shortDate(state.date)}, so your time was kept.`;
      }
    }
    renderTimes(); renderStatus();
  });

  timeSel.addEventListener('change', () => {
    notice = '';
    const s = timeSel.value && findScreening(state.filmId, state.date, timeSel.value);
    if (timeSel.value && (!s || s.soldOut)) {
      // Guard: sold-out or unknown screenings are never accepted.
      notice = `${timeSel.value} is sold out. Please choose another time.`;
      state.time = '';
      renderTimes();
    } else {
      state.time = timeSel.value;
    }
    renderStatus();
  });

  /* ---------- Continue: show the chosen demo screening (no reservation) ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = selected();
    if (!s) { renderStatus(); return; }
    dialog.querySelector('[data-sd-film]').textContent = filmById.get(s.filmId).title;
    dialog.querySelector('[data-sd-date]').textContent = longDate(s.date);
    dialog.querySelector('[data-sd-time]').textContent = s.time;
    window.KinemaDemoState.selectedScreening = { screeningId: s.id, filmId: s.filmId, date: s.date, time: s.time };
    if (window.KinemaUI) window.KinemaUI.openDialog(dialog, continueBtn);
    else dialog.showModal();
  });

  render(); // initial state matches the server-rendered text, so nothing is announced on load
})();
