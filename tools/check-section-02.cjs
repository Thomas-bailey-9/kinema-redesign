// Section 2 (cinematic opening) checks at 1440×900, 768×1024, 390×844 and 320×640:
// layout/overlap, headline integrity, text contrast over the photograph, opening links,
// film-preview dialog (keyboard, Escape, focus return, scroll lock), hover, image settle,
// reduced motion and the no-backdrop-filter fallback. Run check-section-01.cjs as well.
// Usage: node tools/check-section-02.cjs <screenshotDir> [url]
// Serve site/ under /kinema-redesign/ first (see check-section-01.cjs).
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2] || 'check-output';
const URL = process.argv[3] || 'http://localhost:8010/kinema-redesign/';
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`);
const HEADLINE = 'A little woodland. A little wonder. A world of cinema.';

async function open(browser, vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: opts.dsf ?? 1, isMobile: !!opts.mobile, hasTouch: !!opts.mobile, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
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
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1900); // let the settle + reveal finish
  return { ctx, page, errors };
}

// Contrast of ivory text against the lightest 5% of photo pixels behind an element (text hidden).
async function minContrast(page, selector) {
  const box = await page.locator(selector).boundingBox();
  await page.addStyleTag({ content: '.opening *, .site-header * { color: transparent !important; text-shadow: none !important; } .opening .btn-primary, .opening .btn-glass, .film-card, .opening__actions { visibility: hidden !important; }' });
  const buf = await page.screenshot({ clip: box });
  await page.evaluate(() => document.querySelector('style:last-of-type').remove());
  return page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data; const L = [];
    const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    for (let i = 0; i < d.length; i += 16) L.push(0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]));
    L.sort((a, b) => a - b); const bg = L[Math.floor(L.length * 0.95)];
    const ivory = 0.2126 * lin(0xf4) + 0.7152 * lin(0xee) + 0.0722 * lin(0xdf);
    return +((ivory + 0.05) / (bg + 0.05)).toFixed(2);
  }, buf.toString('base64'));
}

(async () => {
  const browser = await chromium.launch();
  const sizes = [['desktop-1440', { width: 1440, height: 900 }, false], ['tablet-768', { width: 768, height: 1024 }, true], ['phone-390', { width: 390, height: 844 }, true], ['phone-320', { width: 320, height: 640 }, true]];

  for (const [v, vp, mobile] of sizes) {
    const { ctx, page, errors } = await open(browser, vp, { mobile, dsf: 2 });
    check(`${v} no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const img = await page.evaluate(() => { const i = document.querySelector('.opening__img'); return { ok: i.complete && i.naturalWidth > 0, src: i.currentSrc.split('/').pop(), lazy: i.loading, prio: i.getAttribute('fetchpriority') }; });
    check(`${v} opening photo loaded (not lazy, high priority)`, img.ok && img.lazy !== 'lazy' && img.prio === 'high', img.src);
    check(`${v} sample artwork loaded`, await page.evaluate(() => { const i = document.querySelector('.film-card__art img'); return i.complete && i.naturalWidth > 0; }));
    const title = await page.evaluate(() => document.querySelector('.opening__title').textContent.replace(/\s+/g, ' ').trim());
    check(`${v} exact headline`, title === HEADLINE, title);
    const geo = await page.evaluate(() => {
      const r = s => document.querySelector(s).getBoundingClientRect();
      const lines = [...document.querySelectorAll('.opening__line')].map(l => { const rects = l.getClientRects(); return { n: rects.length, right: Math.max(...[...rects].map(x => x.right)) }; });
      const t = document.querySelector('.opening__title');
      return { header: r('.site-header__bar'), intro: r('.opening__intro'), card: r('.film-card'), lines, clipped: t.scrollWidth > t.clientWidth, vw: innerWidth };
    });
    check(`${v} headline lines unclipped`, !geo.clipped && geo.lines.every(l => l.right <= geo.vw - 8), geo.lines.map(l => `${l.n} row(s), right ${Math.round(l.right)}`).join('; '));
    check(`${v} header does not overlap introduction`, geo.header.bottom <= geo.intro.top, `header bottom ${Math.round(geo.header.bottom)}, intro top ${Math.round(geo.intro.top)}`);
    const overlapIC = !(geo.intro.right <= geo.card.left || geo.card.right <= geo.intro.left || geo.intro.bottom <= geo.card.top || geo.card.bottom <= geo.intro.top);
    check(`${v} introduction and film panel do not overlap`, !overlapIC);
    check(`${v} ${mobile ? 'film panel below introduction' : 'film panel to the lower right'}`, mobile ? geo.card.top >= geo.intro.bottom : (geo.card.left > geo.intro.right && geo.card.bottom > geo.vw * 0 && geo.card.bottom <= vp.height));
    // Concept badge visible and not covering any visible control on the first screen
    const badge = await page.evaluate(() => {
      const b = document.getElementById('concept-badge').getBoundingClientRect();
      const hits = [...document.querySelectorAll('a, button')].filter(el => !el.closest('#concept-badge') && el.offsetParent && getComputedStyle(el).visibility !== 'hidden').map(el => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width && r.bottom > 0 && r.top < innerHeight && !(r.right <= b.left || b.right <= r.left || r.bottom <= b.top || b.bottom <= r.top))
        .map(({ el }) => el.textContent.trim().slice(0, 24));
      return { visible: b.top >= 0 && b.bottom <= innerHeight && b.width > 0, hits };
    });
    check(`${v} concept notice visible, covers no controls`, badge.visible && badge.hits.length === 0, badge.hits.join(', '));
    // Readability over the photograph
    for (const sel of ['.opening__title', '.opening__lede', '.primary-nav, .site-header__inner .wordmark']) {
      const s = sel.includes('primary-nav') ? (mobile ? '.site-header__inner .wordmark' : '.primary-nav') : sel;
      const c = await minContrast(page, s);
      const need = s === '.opening__title' ? 3 : 4.5;
      check(`${v} contrast ${s} ≥ ${need}:1 (vs lightest 5% of photo)`, c >= need, `${c}:1`);
    }
    await page.screenshot({ path: `${OUT}/${v}-opening.png` });

    // Opening actions go to the honest placeholders
    const hrefs = await page.evaluate(() => [...document.querySelectorAll('.opening__actions a')].map(a => a.textContent.trim() + '→' + a.getAttribute('href')));
    check(`${v} opening actions link to placeholders`, hrefs.join('|') === 'Explore what’s on→#whats-on|Discover the Kinema→#our-story', hrefs.join(' | '));

    // Film preview dialog
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator('.film-card__action').focus();
    await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    const dlg = await page.evaluate(() => { const d = document.getElementById('film-preview'); return { open: d.open, modal: d.matches(':modal'), locked: document.documentElement.classList.contains('is-scroll-locked'), focusInside: d.contains(document.activeElement), text: d.textContent.replace(/\s+/g, ' ') }; });
    check(`${v} View film opens labelled demo dialog`, dlg.open && dlg.modal && dlg.locked && dlg.focusInside && /Demo/.test(dlg.text) && /sample film/i.test(dlg.text) && /Section 5/.test(dlg.text), JSON.stringify({ open: dlg.open, locked: dlg.locked, focusInside: dlg.focusInside }));
    check(`${v} film dialog makes no availability claims`, !/(available|book now|seats? left|\b\d{1,2}:\d{2}\b)/i.test(dlg.text));
    await page.screenshot({ path: `${OUT}/${v}-film-preview.png` });
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    check(`${v} Escape closes film dialog, focus returns, scroll unlocked`, await page.evaluate(() => !document.getElementById('film-preview').open && document.activeElement.classList.contains('film-card__action') && !document.documentElement.classList.contains('is-scroll-locked')));

    // Primary action navigates and focuses the What's On placeholder
    await page.click('.opening__actions .btn-primary'); await page.waitForTimeout(1200);
    const nav = await page.evaluate(() => ({ hash: location.hash, focused: document.activeElement.id, top: Math.round(document.getElementById('whats-on').getBoundingClientRect().top), compact: document.getElementById('site-header').classList.contains('is-compact') }));
    check(`${v} Explore what's on → #whats-on placeholder (header compact)`, nav.hash === '#whats-on' && nav.focused === 'whats-on' && nav.top >= 50 && nav.top <= 100 && nav.compact, JSON.stringify(nav));
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(500);
    check(`${v} header expands again at top`, !(await page.evaluate(() => document.getElementById('site-header').classList.contains('is-compact'))));
    await page.click('.opening__actions .btn-glass'); await page.waitForTimeout(1200);
    check(`${v} Discover the Kinema → #our-story placeholder`, await page.evaluate(() => location.hash === '#our-story' && document.activeElement.id === 'our-story'));
    check(`${v} no console/network errors`, errors.length === 0, errors.join('; '));
    await ctx.close();
  }

  // Desktop: motion, hover, keyboard order and focus ring
  {
    const { ctx, page } = await open(browser, { width: 1440, height: 900 }, { dsf: 2 });
    check('desktop image settled to scale 1', await page.evaluate(() => document.querySelector('.opening').classList.contains('is-settled') && getComputedStyle(document.querySelector('.opening__img')).transform.replace(/\s/g, '') === 'matrix(1,0,0,1,0,0)'));
    await page.hover('.film-card'); await page.waitForTimeout(700);
    const hov = await page.evaluate(() => ({ card: getComputedStyle(document.querySelector('.film-card')).transform, art: getComputedStyle(document.querySelector('.film-card__art img')).transform }));
    check('desktop film panel lifts and artwork zooms on hover', hov.card !== 'none' && /matrix\(1\.0[5-6]/.test(hov.art), JSON.stringify(hov));
    await page.screenshot({ path: `${OUT}/desktop-1440-film-hover.png`, clip: await page.locator('.film-card').boundingBox().then(b => ({ x: b.x - 24, y: b.y - 24, width: b.width + 48, height: b.height + 48 })) });
    await page.mouse.move(10, 450);
    await page.evaluate(() => { document.activeElement.blur(); scrollTo(0, 0); });
    const order = [];
    for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); order.push(await page.evaluate(() => document.activeElement.textContent.replace(/\s+/g, ' ').trim().slice(0, 22))); }
    const iE = order.indexOf('Explore what’s on'), iD = order.indexOf('Discover the Kinema'), iV = order.findIndex(t => t.startsWith('View film'));
    check('desktop tab order: header → Explore → Discover → View film', iE > order.indexOf('Book tickets') && iD === iE + 1 && iV === iD + 1, order.join(' | '));
    while (!(await page.evaluate(() => document.activeElement.classList.contains('btn-primary')))) await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(400);
    check('desktop primary action shows focus ring', /rgb\(234, 214, 166\) 0px 0px 0px 4px/.test(await page.evaluate(() => getComputedStyle(document.activeElement).boxShadow)));
    await page.screenshot({ path: `${OUT}/desktop-1440-focus-primary.png` });
    await ctx.close();
  }

  // Reduced motion
  {
    const { ctx, page } = await open(browser, { width: 1440, height: 900 }, { reduced: true });
    const rm = await page.evaluate(() => ({ settling: document.querySelector('.opening').classList.contains('is-settling'), img: getComputedStyle(document.querySelector('.opening__img')).transform, anim: getComputedStyle(document.querySelector('.film-card')).animationDuration }));
    check('reduced motion: no settle, no reveal animation', !rm.settling && rm.img === 'none' && parseFloat(rm.anim) < 0.001, JSON.stringify(rm));
    await page.hover('.film-card');
    check('reduced motion: no hover lift/zoom', await page.evaluate(() => getComputedStyle(document.querySelector('.film-card')).transform === 'none' && getComputedStyle(document.querySelector('.film-card__art img')).transform === 'none'));
    await ctx.close();
  }

  // No backdrop-filter fallback
  for (const [v, vp, mobile] of [['fallback-1440', { width: 1440, height: 900 }, false], ['fallback-390', { width: 390, height: 844 }, true]]) {
    const { ctx, page } = await open(browser, vp, { noBlur: true, mobile });
    const bg = await page.evaluate(() => getComputedStyle(document.querySelector('.film-card')).backgroundColor);
    check(`${v} film panel solid fallback`, bg === 'rgb(15, 31, 24)', bg);
    await page.screenshot({ path: `${OUT}/${v}-opening.png` });
    await ctx.close();
  }

  await browser.close();
  console.log(results.join('\n'));
  console.log(`\n${results.filter(r => r.startsWith('FAIL')).length} failed of ${results.length}`);
})();
