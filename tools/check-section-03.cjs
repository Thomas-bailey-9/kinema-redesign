// Section 3 (quick booking) checks at 1440×900, 768×1024, 390×844 and 320×640:
// initial/partial/complete states, every demo film/date/time combination, changing earlier
// choices, sold-out guards, Continue dialog, header Book links, keyboard-only use, layout and
// overlap, reduced motion, no-blur and no-JavaScript fallbacks. Run sections 1–2 checks too.
// Usage: node tools/check-section-03.cjs <screenshotDir> [url]
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2] || 'check-output';
const URL = process.argv[3] || 'http://localhost:8010/kinema-redesign/';
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`);

async function open(browser, vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: opts.dsf ?? 1, isMobile: !!opts.mobile, hasTouch: !!opts.mobile, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', javaScriptEnabled: opts.js !== false });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', e => errors.push(e.message));
  page.on('requestfailed', r => errors.push('failed: ' + r.url()));
  page.on('response', r => r.status() >= 400 && errors.push(r.status() + ' ' + r.url()));
  if (opts.noBlur) await page.route('**/main.css', async route => {
    const res = await route.fetch(); let body = await res.text();
    body = body.replace('@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px)))', '@supports (display: block)')
               .replace(/(-webkit-)?backdrop-filter:[^;]+;/g, '');
    route.fulfill({ response: res, body });
  });
  await page.goto(URL, { waitUntil: 'networkidle' });
  if (opts.js !== false) await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  return { ctx, page, errors };
}
const st = (page) => page.evaluate(() => {
  const g = id => document.getElementById(id);
  const opt = s => [...s.options].map(o => ({ v: o.value, t: o.textContent, d: o.disabled }));
  return {
    film: g('qb-film').value, date: g('qb-date').value, time: g('qb-time').value,
    dateDisabled: g('qb-date').disabled, timeDisabled: g('qb-time').disabled, continueDisabled: g('qb-continue').disabled,
    dateText: g('qb-date').selectedOptions[0]?.textContent, timeText: g('qb-time').selectedOptions[0]?.textContent,
    dates: opt(g('qb-date')), times: opt(g('qb-time')), films: opt(g('qb-film')),
    notice: document.querySelector('[data-qb-notice]').hidden ? '' : document.querySelector('[data-qb-notice]').textContent,
    guide: document.querySelector('[data-qb-guide]').textContent,
    summary: document.querySelector('[data-qb-summary]').hidden ? '' : document.querySelector('[data-qb-summary]').textContent,
    active: document.activeElement.id, stored: window.KinemaDemoState && window.KinemaDemoState.quickBooking,
  };
});
// Select like a user: focus the control, change it, fire change (as a native select does).
const pick = async (page, id, value) => { await page.focus('#' + id); await page.selectOption('#' + id, value); };
const reset = (page) => page.evaluate(() => { const f = document.getElementById('qb-film'); f.value = ''; f.dispatchEvent(new Event('change')); });
const rect = (page, s) => page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left, right: r.right, width: r.width, height: r.height }; }, s);
const overlaps = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);

(async () => {
  const browser = await chromium.launch();
  const sizes = [['desktop-1440', { width: 1440, height: 900 }, false], ['tablet-768', { width: 768, height: 1024 }, true], ['phone-390', { width: 390, height: 844 }, true], ['phone-320', { width: 320, height: 640 }, true]];

  for (const [v, vp, mobile] of sizes) {
    const { ctx, page, errors } = await open(browser, vp, { mobile, dsf: 2 });
    /* ----- Initial state ----- */
    let s = await st(page);
    check(`${v} initial: Choose a film / film first / date first / Continue unavailable`,
      s.film === '' && s.films[0].t === 'Choose a film' && s.dateDisabled && s.dateText === 'Choose a film first' && s.timeDisabled && s.timeText === 'Choose a date first' && s.continueDisabled && /Choose a film/.test(s.guide), s.guide);
    check(`${v} heading, supporting line and Demo screenings label`, await page.evaluate(() =>
      document.getElementById('qb-title').textContent === 'Your next cinema night' && document.querySelector('.quick-book__intro').textContent === 'Choose a film, find a time.' && document.querySelector('.quick-book__tag').textContent === 'Demo screenings'));
    check(`${v} live region is role=status and describes the fields`, await page.evaluate(() =>
      document.getElementById('qb-status').getAttribute('role') === 'status' && ['qb-film', 'qb-date', 'qb-time', 'qb-continue'].every(id => document.getElementById(id).getAttribute('aria-describedby') === 'qb-status')));
    check(`${v} no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    /* ----- Layout & overlap ----- */
    const L = { panel: await rect(page, '.quick-book__panel'), opening: await rect(page, '.opening'), card: await rect(page, '.film-card'), intro: await rect(page, '.opening__intro'), credit: await rect(page, '.opening__credit'), badge: await rect(page, '#concept-badge'), header: await rect(page, '.site-header__bar') };
    check(`${v} panel clear of film card, introduction, photo credit, notice and header`,
      !overlaps(L.panel, L.card) && !overlaps(L.panel, L.intro) && !overlaps(L.panel, L.credit) && !overlaps(L.panel, L.badge) && !overlaps(L.panel, L.header));
    if (!mobile) {
      check(`${v} panel overlaps the opening's lower edge`, L.panel.top < L.opening.bottom && L.panel.bottom > L.opening.bottom, `panel ${Math.round(L.panel.top)}–${Math.round(L.panel.bottom)}, opening ends ${Math.round(L.opening.bottom)}`);
      check(`${v} whole panel within the first screen`, L.panel.bottom <= vp.height, `bottom ${Math.round(L.panel.bottom)}`);
      const row = await page.evaluate(() => ['.qb-field--film', '.qb-field--date', '.qb-field--time', '.qb-field--action'].map(sel => Math.round(document.querySelector(sel).getBoundingClientRect().bottom)));
      check(`${v} Film · Date · Time · Continue on one row`, Math.max(...row) - Math.min(...row) <= 6, row.join(','));
    } else {
      check(`${v} panel beneath the opening content (no overlap)`, L.panel.top >= L.opening.bottom - 1, `panel top ${Math.round(L.panel.top)}, opening ends ${Math.round(L.opening.bottom)}`);
      const f = await page.evaluate(() => ['film', 'date', 'time', 'action'].map(n => { const r = document.querySelector('.qb-field--' + n).getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width) }; }));
      const sideBySide = f[1].t === f[2].t && f[2].l > f[1].l;
      check(`${v} date/time ${vp.width >= 480 ? 'side by side' : 'stacked'}; film and Continue full width`, (vp.width >= 480 ? sideBySide : !sideBySide) && f[0].w >= f[1].w && Math.abs(f[3].w - f[0].w) <= 2, JSON.stringify(f));
    }
    const sizesOk = await page.evaluate(() => {
      const ctl = ['qb-film', 'qb-date', 'qb-time', 'qb-continue'].map(id => document.getElementById(id).getBoundingClientRect().height);
      const fonts = [...document.querySelectorAll('.quick-book__panel *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(e => parseFloat(getComputedStyle(e).fontSize));
      return { minCtl: Math.min(...ctl), minFont: Math.min(...fonts) };
    });
    check(`${v} touch targets ≥ 44px, text ≥ 12px`, sizesOk.minCtl >= 44 && sizesOk.minFont >= 12, JSON.stringify(sizesOk));
    // Longest film title and date fit inside their select without clipping
    const fit = await page.evaluate(() => {
      const meas = (sel, text) => { const el = document.getElementById(sel), cs = getComputedStyle(el); const c = document.createElement('canvas').getContext('2d'); c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; return { need: c.measureText(text).width, have: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) }; };
      const film = meas('qb-film', 'Midnight at the Paragon'), date = meas('qb-date', 'Wed 30 Dec 2026'), time = meas('qb-time', '19:30 · Sold out');
      return { film, date, time, ok: [film, date, time].every(x => x.need <= x.have) };
    });
    check(`${v} longest selected values fit without clipping`, fit.ok, JSON.stringify(fit, (k, x) => typeof x === 'number' ? Math.round(x) : x));
    // Disabled field explanation remains readable (ivory @ 0.74 over the panel's darkest fill)
    const dis = await page.evaluate(() => {
      const c = getComputedStyle(document.getElementById('qb-date')).color.match(/[\d.]+/g).map(Number);
      const a = c[3] ?? 1, bg = [12, 26, 19]; const mix = c.slice(0, 3).map((x, i) => x * a + bg[i] * (1 - a));
      const lin = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
      const L = rgb => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
      return +((L(mix) + 0.05) / (L(bg) + 0.05)).toFixed(1);
    });
    check(`${v} disabled-field text contrast ≥ 4.5:1`, dis >= 4.5, `${dis}:1`);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `${OUT}/${v}-01-initial.png` });

    /* ----- Partial states ----- */
    await pick(page, 'qb-film', 'lantern-path');
    s = await st(page);
    check(`${v} after film: dates enabled, time still waits, guidance updates, focus stays`, !s.dateDisabled && s.dateText === 'Choose a date' && s.timeDisabled && s.timeText === 'Choose a date first' && s.continueDisabled && /choose a date/i.test(s.guide) && s.active === 'qb-film');
    await pick(page, 'qb-date', '2026-12-05');
    s = await st(page);
    const sold = s.times.find(t => t.v === '19:30');
    check(`${v} after date: times enabled in 24-hour format; sold out labelled + unselectable`, !s.timeDisabled && s.times.slice(1).every(t => /^\d{2}:\d{2}/.test(t.t)) && sold && sold.d && /Sold out/.test(sold.t) && s.continueDisabled && s.active === 'qb-date', s.times.map(t => t.t).join(' | '));
    await pick(page, 'qb-time', '11:00');
    s = await st(page);
    check(`${v} complete: summary "Film · Date · Time", Continue enabled, state stored`, s.summary === 'Your selection: The Lantern Path · Sat 5 Dec 2026 · 11:00' && !s.continueDisabled && s.stored && s.stored.screeningId === 'lantern-path_2026-12-05_1100' && s.active === 'qb-time', s.summary);
    await page.locator('.quick-book__panel').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy({ top: -60, behavior: 'instant' }));
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${OUT}/${v}-02-complete.png` });

    /* ----- Continue dialog ----- */
    await page.click('#qb-continue'); await page.waitForTimeout(400);
    const d = await page.evaluate(() => { const dl = document.getElementById('screening-demo'); return { open: dl.open, modal: dl.matches(':modal'), locked: document.documentElement.classList.contains('is-scroll-locked'), inside: dl.contains(document.activeElement), film: dl.querySelector('[data-sd-film]').textContent, date: dl.querySelector('[data-sd-date]').textContent, time: dl.querySelector('[data-sd-time]').textContent, text: dl.textContent.replace(/\s+/g, ' '), title: dl.querySelector('h2').textContent, stored: window.KinemaDemoState.selectedScreening }; });
    check(`${v} Continue opens "Your demo screening" with film, full date, time`, d.open && d.modal && d.locked && d.inside && d.title === 'Your demo screening' && d.film === 'The Lantern Path' && d.date === 'Saturday 5 December 2026' && d.time === '11:00', `${d.film} | ${d.date} | ${d.time}`);
    check(`${v} dialog states no seats reserved; seat selection later; no fake success`, d.text.includes('This is a portfolio demonstration. No seats have been reserved.') && /seat selection will be added in the booking section/i.test(d.text) && !/(confirmed|booking reference|payment|paid|success)/i.test(d.text));
    check(`${v} selected screening kept in page state`, d.stored && d.stored.screeningId === 'lantern-path_2026-12-05_1100');
    await page.screenshot({ path: `${OUT}/${v}-03-dialog.png` });
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    check(`${v} Escape closes, focus returns to Continue, scroll unlocked`, await page.evaluate(() => !document.getElementById('screening-demo').open && document.activeElement.id === 'qb-continue' && !document.documentElement.classList.contains('is-scroll-locked')));
    await page.click('#qb-continue'); await page.waitForTimeout(300);
    await page.click('#screening-demo [data-close-dialog]'); await page.waitForTimeout(300);
    s = await st(page);
    check(`${v} "Change selection" returns to the panel with the selection intact`, s.active === 'qb-continue' && s.time === '11:00' && !(await page.evaluate(() => document.getElementById('screening-demo').open)));

    /* ----- Changing earlier choices ----- */
    // Film change where the date no longer exists
    await pick(page, 'qb-film', 'midnight-paragon'); s = await st(page);
    check(`${v} film change, date unavailable → date+time cleared with explanation, no auto-switch`, s.film === 'midnight-paragon' && s.date === '' && s.time === '' && s.timeDisabled && s.continueDisabled && /no available demo screenings on Sat 5 Dec 2026/.test(s.notice) && s.active === 'qb-film', s.notice);
    await page.locator('.quick-book__panel').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUT}/${v}-04-change-cleared.png` });
    // Film change where date and time both remain valid
    await pick(page, 'qb-film', 'lantern-path'); await pick(page, 'qb-date', '2026-12-04'); await pick(page, 'qb-time', '17:30');
    await pick(page, 'qb-film', 'midnight-paragon'); s = await st(page);
    check(`${v} film change, same date+time exists → both kept and explained`, s.date === '2026-12-04' && s.time === '17:30' && !s.continueDisabled && /kept/.test(s.notice) && s.summary.includes('Midnight at the Paragon · Fri 4 Dec 2026 · 17:30'), s.notice);
    // Film change where date stays but time is invalid
    await pick(page, 'qb-film', 'lantern-path'); await pick(page, 'qb-date', '2026-12-03'); await pick(page, 'qb-time', '14:00');
    await pick(page, 'qb-film', 'fern-night-train'); s = await st(page);
    check(`${v} film change, date valid but time not → time cleared only`, s.date === '2026-12-03' && s.time === '' && !s.timeDisabled && s.continueDisabled && /14:00 isn’t available/.test(s.notice), s.notice);
    // Date change: time invalid → cleared; time valid → kept
    await pick(page, 'qb-film', 'lantern-path'); await pick(page, 'qb-date', '2026-12-03'); await pick(page, 'qb-time', '18:00');
    await pick(page, 'qb-date', '2026-12-04'); s = await st(page);
    check(`${v} date change, time unavailable → time cleared with explanation`, s.date === '2026-12-04' && s.time === '' && s.continueDisabled && /18:00 isn’t showing/.test(s.notice) && s.active === 'qb-date', s.notice);
    await pick(page, 'qb-film', 'salt-and-silver'); await pick(page, 'qb-date', '2026-12-05'); await pick(page, 'qb-time', '19:15');
    await pick(page, 'qb-date', '2026-12-06'); s = await st(page);
    check(`${v} date change, same time exists → time kept and explained`, s.time === '19:15' && !s.continueDisabled && /kept/.test(s.notice), s.notice);
    // Clearing the film resets everything
    await pick(page, 'qb-film', ''); s = await st(page);
    check(`${v} clearing the film resets date and time`, s.date === '' && s.time === '' && s.dateDisabled && s.timeDisabled && s.continueDisabled && /reset/.test(s.notice));

    /* ----- Sold-out and invalid handling ----- */
    await pick(page, 'qb-film', 'fern-night-train'); s = await st(page);
    const soldDate = s.dates.find(x => x.v === '2026-12-06');
    check(`${v} fully sold-out date labelled + unselectable`, soldDate && soldDate.d && /Sold out/.test(soldDate.t), soldDate && soldDate.t);
    // Force a sold-out time programmatically (bypassing the disabled option): must be rejected
    await pick(page, 'qb-film', 'lantern-path'); await pick(page, 'qb-date', '2026-12-05');
    await page.evaluate(() => { const t = document.getElementById('qb-time'); t.value = '19:30'; t.dispatchEvent(new Event('change')); });
    s = await st(page);
    check(`${v} forced sold-out time rejected with a message`, s.time === '' && s.continueDisabled && /sold out/i.test(s.notice) && !s.stored, s.notice);
    await page.evaluate(() => { const t = document.getElementById('qb-date'); t.value = '2026-12-06'; t.dispatchEvent(new Event('change')); });
    await pick(page, 'qb-film', 'fern-night-train');
    await page.evaluate(() => { const t = document.getElementById('qb-date'); t.value = '2026-12-06'; t.dispatchEvent(new Event('change')); });
    s = await st(page);
    check(`${v} forced sold-out date rejected`, s.date === '' && s.timeDisabled && /sold out/i.test(s.notice), s.notice);
    check(`${v} no console/network errors`, errors.length === 0, errors.join('; '));
    await ctx.close();
  }

  /* ----- Every demo film/date/time combination (desktop) ----- */
  {
    const { ctx, page } = await open(browser, { width: 1440, height: 900 });
    const expected = await page.evaluate(() => window.KINEMA_DEMO.screenings.map(s => ({ ...s })));
    let ok = 0, soldOk = 0; const bad = [];
    const films = await page.evaluate(() => window.KINEMA_DEMO.films.map(f => [f.id, f.title]));
    for (const [fid, title] of films) {
      await reset(page); await pick(page, 'qb-film', fid);
      const dates = (await st(page)).dates.slice(1);
      const expDates = [...new Set(expected.filter(e => e.filmId === fid).map(e => e.date))].sort();
      if (dates.map(x => x.v).join() !== expDates.join()) bad.push(`${fid} dates ${dates.map(x => x.v)}`);
      for (const dt of dates) {
        if (dt.d) { // fully sold-out date
          if (expected.filter(e => e.filmId === fid && e.date === dt.v).every(e => e.soldOut)) soldOk++; else bad.push(`${fid} ${dt.v} wrongly disabled`);
          continue;
        }
        await pick(page, 'qb-date', dt.v);
        const times = (await st(page)).times.slice(1);
        for (const tm of times) {
          const e = expected.find(x => x.filmId === fid && x.date === dt.v && x.time === tm.v);
          if (!e) { bad.push(`${fid} ${dt.v} ${tm.v} not in data`); continue; }
          if (tm.d) { if (e.soldOut && /Sold out/.test(tm.t)) soldOk++; else bad.push(`${fid} ${dt.v} ${tm.v} disabled wrongly`); continue; }
          await pick(page, 'qb-time', tm.v);
          const s = await st(page);
          if (!s.continueDisabled && s.stored && s.stored.screeningId === e.id && s.summary.endsWith(`${title} · ${s.dateText} · ${tm.v}`)) ok++; else bad.push(`${fid} ${dt.v} ${tm.v}: ${s.summary}`);
        }
      }
    }
    const total = expected.filter(e => !e.soldOut).length;
    check(`every available combination selectable with correct summary (${ok}/${total})`, ok === total && bad.length === 0, bad.join('; '));
    check(`sold-out screenings shown and blocked (${soldOk})`, soldOk >= 2);
    check('dates use explicit year; times are 24-hour', expected.every(e => /^2026-\d{2}-\d{2}$/.test(e.date) && /^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)));
    await ctx.close();
  }

  /* ----- Keyboard-only use (desktop) ----- */
  {
    const { ctx, page } = await open(browser, { width: 1440, height: 900 }, { dsf: 2 });
    await page.focus('.btn-book'); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
    check('keyboard: Book tickets (Enter) → focus on Film', (await st(page)).active === 'qb-film');
    await page.keyboard.press('ArrowDown'); // native select: next option
    let s = await st(page);
    check('keyboard: Arrow key chooses a film without moving focus', s.film !== '' && !s.dateDisabled && s.active === 'qb-film', s.film);
    await page.keyboard.press('Tab'); await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Tab'); await page.keyboard.press('ArrowDown');
    s = await st(page);
    check('keyboard: Tab to Date and Time, Arrow to choose', s.date !== '' && s.time !== '' && s.active === 'qb-time' && !s.continueDisabled, `${s.date} ${s.time}`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/desktop-1440-05-keyboard-focus.png`, clip: await page.locator('.quick-book__panel').boundingBox().then(b => ({ x: b.x - 16, y: b.y - 16, width: b.width + 32, height: b.height + 32 })) });
    await page.keyboard.press('Tab');
    check('keyboard: Tab reaches Continue with a visible focus ring', await page.evaluate(() => document.activeElement.id === 'qb-continue' && /0px 0px 0px 4px/.test(getComputedStyle(document.activeElement).boxShadow)));
    await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    check('keyboard: Enter on Continue opens the dialog, focus inside', await page.evaluate(() => document.getElementById('screening-demo').open && document.getElementById('screening-demo').contains(document.activeElement)));
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
    check('keyboard: focus stays within the open modal', await page.evaluate(() => document.getElementById('screening-demo').contains(document.activeElement) || document.activeElement === document.body));
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    check('keyboard: Escape returns focus to Continue', (await st(page)).active === 'qb-continue');
    await page.keyboard.press('Shift+Tab');
    check('keyboard: no trap outside the modal (Shift+Tab reaches Time)', (await st(page)).active === 'qb-time');
    // Hover highlight on an available field
    await page.hover('.qb-field--film'); await page.waitForTimeout(300);
    check('hover: soft glass highlight on available fields only', await page.evaluate(() => getComputedStyle(document.querySelector('.qb-field--film')).backgroundColor !== 'rgba(0, 0, 0, 0)'));
    await ctx.close();
  }

  /* ----- Reduced motion ----- */
  {
    const { ctx, page } = await open(browser, { width: 1440, height: 900 }, { reduced: true });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.click('.btn-book'); await page.waitForTimeout(120);
    const y = await page.evaluate(() => ({ top: Math.round(document.querySelector('.quick-book__panel').getBoundingClientRect().top), active: document.activeElement.id }));
    check('reduced motion: Book jumps to the panel without smooth scrolling', y.top >= 60 && y.top <= 100 && y.active === 'qb-film', JSON.stringify(y));
    await pick(page, 'qb-film', 'lantern-path'); await pick(page, 'qb-date', '2026-12-03'); await pick(page, 'qb-time', '14:00');
    const rm = await page.evaluate(() => ({ anim: parseFloat(getComputedStyle(document.querySelector('[data-qb-summary]')).animationDuration), trans: parseFloat(getComputedStyle(document.getElementById('qb-date')).transitionDuration), shown: !document.querySelector('[data-qb-summary]').hidden }));
    check('reduced motion: no fade/transition, state change still clear', rm.anim < 0.001 && rm.trans < 0.001 && rm.shown, JSON.stringify(rm));
    await ctx.close();
  }

  /* ----- No backdrop-filter ----- */
  for (const [v, vp, mobile] of [['fallback-1440', { width: 1440, height: 900 }, false], ['fallback-390', { width: 390, height: 844 }, true]]) {
    const { ctx, page } = await open(browser, vp, { noBlur: true, mobile });
    const bg = await page.evaluate(() => getComputedStyle(document.querySelector('.quick-book__panel')).backgroundColor);
    check(`${v} panel solid fallback`, bg === 'rgb(17, 37, 27)', bg);
    await page.locator('.quick-book__panel').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUT}/${v}-panel.png` });
    await ctx.close();
  }

  /* ----- JavaScript unavailable ----- */
  {
    const { ctx, page } = await open(browser, { width: 390, height: 844 }, { js: false, mobile: true });
    const nj = await page.evaluate(() => ({ msg: [...document.querySelectorAll('.quick-book__noscript')].some(p => p.offsetParent && /needs JavaScript/.test(p.textContent)), cont: document.getElementById('qb-continue').disabled, date: document.getElementById('qb-date').disabled }));
    check('no JavaScript: helpful message shown, controls safely unavailable', nj.msg && nj.cont && nj.date, JSON.stringify(nj));
    await page.locator('.quick-book__panel').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUT}/phone-390-no-js.png` });
    await ctx.close();
  }

  await browser.close();
  console.log(results.join('\n'));
  console.log(`\n${results.filter(r => r.startsWith('FAIL')).length} failed of ${results.length}`);
})();
