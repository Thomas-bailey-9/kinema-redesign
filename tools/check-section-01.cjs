// Section 1 (header and navigation) checks: states, keyboard, focus, scroll lock,
// reduced motion and the no-backdrop-filter fallback at 1440, 390, 360 and 768 px.
// Usage: node tools/check-section-01.cjs <screenshotDir> [url]
// Serve site/ under a /kinema-redesign/ sub-path first to mirror GitHub Pages, e.g.
//   mkdir -p /tmp/pages && ln -s "$PWD/site" /tmp/pages/kinema-redesign
//   python3 -m http.server 8010 --directory /tmp/pages
// Uses the globally available Playwright; no project dependency.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2] || 'check-output';
const URL = process.argv[3] || 'http://localhost:8010/kinema-redesign/';
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`);

async function newPage(browser, vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: opts.dsf ?? 2, isMobile: !!opts.mobile, hasTouch: !!opts.mobile, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
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
  return { ctx, page, errors };
}
const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png` });
const settle = (page) => page.waitForTimeout(500);
const active = (page) => page.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.className || a.tagName) : null; });

(async () => {
  const browser = await chromium.launch();

  /* ===== Desktop 1440×900 ===== */
  {
    const { ctx, page, errors } = await newPage(browser, { width: 1440, height: 900 });
    const v = 'desktop-1440';
    const fonts = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family));
    check(`${v} fonts loaded`, fonts.includes('Inter') && fonts.includes('Cormorant Garamond'), fonts.join(', '));
    check(`${v} no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check(`${v} nav visible, menu toggle hidden`, await page.isVisible('.primary-nav') && !(await page.isVisible('.menu-toggle')));
    await shot(page, `${v}-01-top`);

    // Hover states
    await page.hover('.nav-link >> nth=0'); await settle(page); await shot(page, `${v}-02-hover-nav`);
    await page.hover('.btn-book'); await page.waitForTimeout(350); await shot(page, `${v}-03-hover-book-midsweep`);
    await page.hover('.search-toggle'); await settle(page); await shot(page, `${v}-04-hover-search`);
    await page.mouse.move(700, 600);

    // Keyboard order
    const order = [];
    await page.focus('body');
    for (let i = 0; i < 9; i++) { await page.keyboard.press('Tab'); order.push(await page.evaluate(() => (document.activeElement.textContent || document.activeElement.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 28))); }
    check(`${v} tab order`, order.slice(0, 8).join(' | ').startsWith('Skip to content | Kinema In the Woods'), order.join(' | '));
    // Focus-visible on a nav link
    await page.focus('body'); for (let i = 0; i < 3; i++) await page.keyboard.press('Tab'); await settle(page);
    await shot(page, `${v}-05-focus-nav`);

    // Search panel: open, expanded state, focus, demo status, Escape restores focus
    await page.click('.search-toggle'); await settle(page);
    check(`${v} search aria-expanded=true`, await page.getAttribute('.search-toggle', 'aria-expanded') === 'true');
    check(`${v} search input focused`, await active(page) === 'search-input-desktop');
    await page.keyboard.type('Wicked');
    await page.keyboard.press('Enter'); await settle(page);
    const status = await page.textContent('#search-status-desktop');
    check(`${v} search honest empty state`, /No results for “Wicked”/.test(status), status.trim().slice(0, 70));
    await shot(page, `${v}-06-search-open`);
    await page.keyboard.press('Escape'); // first Escape may clear the search input
    if (await page.getAttribute('.search-toggle', 'aria-expanded') === 'true') await page.keyboard.press('Escape');
    await settle(page);
    check(`${v} Escape closes search`, await page.getAttribute('.search-toggle', 'aria-expanded') === 'false' && await page.evaluate(() => document.getElementById('search-panel').hidden));
    check(`${v} focus restored to search toggle`, (await active(page)).includes('search-toggle'));
    // Click outside closes
    await page.click('.search-toggle'); await settle(page); await page.mouse.click(700, 600); await settle(page);
    check(`${v} click outside closes search`, await page.getAttribute('.search-toggle', 'aria-expanded') === 'false');

    // Booking dialog
    const xBefore = await page.evaluate(() => document.querySelector('.site-header__inner').getBoundingClientRect().left);
    await page.click('.btn-book'); await settle(page);
    check(`${v} booking dialog open (modal)`, await page.evaluate(() => document.getElementById('booking-demo').open && document.documentElement.classList.contains('is-scroll-locked')));
    const xAfter = await page.evaluate(() => document.querySelector('.site-header__inner').getBoundingClientRect().left);
    check(`${v} no layout shift when scroll locked`, xBefore === xAfter, `${xBefore} → ${xAfter}`);
    check(`${v} dialog focus inside`, await page.evaluate(() => document.getElementById('booking-demo').contains(document.activeElement)));
    await shot(page, `${v}-07-booking-demo`);
    await page.keyboard.press('Escape'); await settle(page);
    check(`${v} Escape closes dialog + restores focus`, !(await page.evaluate(() => document.getElementById('booking-demo').open)) && (await active(page)).includes('btn-book'));
    check(`${v} scroll unlocked after dialog`, !(await page.evaluate(() => document.documentElement.classList.contains('is-scroll-locked'))));

    // Compact on scroll, no layout shift of content
    const mainTop0 = await page.evaluate(() => document.getElementById('whats-on').getBoundingClientRect().top + scrollY);
    await page.mouse.wheel(0, 700); await page.waitForTimeout(700);
    check(`${v} compact after scroll`, await page.evaluate(() => document.getElementById('site-header').classList.contains('is-compact')));
    const mainTop1 = await page.evaluate(() => document.getElementById('whats-on').getBoundingClientRect().top + scrollY);
    check(`${v} content position stable on compact`, mainTop0 === mainTop1);
    const h = await page.evaluate(() => document.querySelector('.site-header__bar').getBoundingClientRect().height);
    check(`${v} compact bar height 64`, Math.round(h) === 64, String(h));
    await shot(page, `${v}-08-compact`);
    await page.hover('.nav-link >> nth=1'); await settle(page); await shot(page, `${v}-09-compact-hover`);

    // Nav link moves to section and focuses it
    await page.click('.nav-link >> text=Visit'); await page.waitForTimeout(1200);
    const visit = await page.evaluate(() => ({ top: Math.round(document.getElementById('visit').getBoundingClientRect().top), atBottom: Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 1, hash: location.hash, focused: document.activeElement.id }));
    check(`${v} nav → #visit placeholder`, visit.hash === '#visit' && visit.focused === 'visit' && ((visit.top >= 60 && visit.top <= 90) || visit.atBottom), JSON.stringify(visit));
    await shot(page, `${v}-10-visit-placeholder`);
    check(`${v} no console/network errors`, errors.length === 0, errors.join('; '));
    await ctx.close();
  }

  /* ===== Phone / tablet ===== */
  for (const [v, vp] of [['phone-390', { width: 390, height: 844 }], ['phone-360', { width: 360, height: 740 }], ['tablet-768', { width: 768, height: 1024 }]]) {
    const { ctx, page, errors } = await newPage(browser, vp, { mobile: true });
    check(`${v} no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check(`${v} menu toggle visible, nav/search icon hidden`, await page.isVisible('.menu-toggle') && !(await page.isVisible('.primary-nav')) && !(await page.isVisible('.search-toggle')));
    const bookName = await page.evaluate(() => document.querySelector('.btn-book').textContent.replace(/\s+/g, ' ').trim());
    check(`${v} Book button accessible name`, bookName === 'Book tickets', bookName);
    const fit = await page.evaluate(() => { const r = document.querySelector('.menu-toggle').getBoundingClientRect(); const w = document.querySelector('.wordmark').getBoundingClientRect(); const b = document.querySelector('.btn-book').getBoundingClientRect(); return r.right <= innerWidth && w.right < b.left; });
    check(`${v} header controls fit without overlap`, fit);
    await shot(page, `${v}-01-top`);

    await page.tap('.menu-toggle'); await settle(page);
    const st = await page.evaluate(() => ({ exp: document.querySelector('.menu-toggle').getAttribute('aria-expanded'), locked: document.documentElement.classList.contains('is-scroll-locked'), inert: document.getElementById('main').inert, visible: !document.getElementById('mobile-menu').hidden }));
    check(`${v} menu opens (expanded, locked, background inert)`, st.exp === 'true' && st.locked && st.inert && st.visible, JSON.stringify(st));
    const y0 = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 500); await page.waitForTimeout(300);
    check(`${v} background does not scroll while menu open`, (await page.evaluate(() => scrollY)) === y0);
    await shot(page, `${v}-02-menu-open`);
    await page.fill('#search-input-menu', 'Elf'); await page.press('#search-input-menu', 'Enter'); await settle(page);
    check(`${v} menu search demo state`, /No results for “Elf”/.test(await page.textContent('#search-status-menu')));
    await page.click('.menu-toggle'); await page.keyboard.press('Escape'); await settle(page);
    check(`${v} Escape closes menu + restores focus`, await page.getAttribute('.menu-toggle', 'aria-expanded') === 'false' && (await active(page)).includes('menu-toggle') && !(await page.evaluate(() => document.getElementById('main').inert)));

    await page.tap('.menu-toggle'); await settle(page);
    await page.tap('.mobile-menu__link >> text=Experiences'); await page.waitForTimeout(1200);
    const nav = await page.evaluate(() => ({ hash: location.hash, top: Math.round(document.getElementById('experiences').getBoundingClientRect().top), closed: document.getElementById('mobile-menu').hidden, locked: document.documentElement.classList.contains('is-scroll-locked') }));
    check(`${v} menu link navigates and closes menu`, nav.hash === '#experiences' && nav.closed && !nav.locked && nav.top >= 50 && nav.top <= 80, JSON.stringify(nav));
    check(`${v} compact after navigating`, await page.evaluate(() => document.getElementById('site-header').classList.contains('is-compact')));
    await shot(page, `${v}-03-compact`);

    await page.tap('.btn-book'); await settle(page);
    check(`${v} booking demo dialog opens`, await page.evaluate(() => document.getElementById('booking-demo').open));
    await shot(page, `${v}-04-booking-demo`);
    await page.tap('[data-close-dialog]'); await settle(page);
    check(`${v} dialog close restores focus`, (await active(page)).includes('btn-book'));
    check(`${v} no console/network errors`, errors.length === 0, errors.join('; '));
    await ctx.close();
  }

  /* ===== Reduced motion ===== */
  {
    const { ctx, page } = await newPage(browser, { width: 1440, height: 900 }, { reduced: true, dsf: 1 });
    const d = await page.evaluate(() => getComputedStyle(document.querySelector('.site-header__bar')).transitionDuration);
    check('reduced-motion: transitions ~0', d.split(',').every(x => parseFloat(x) < 0.001), d);
    await page.hover('.nav-link >> nth=0');
    check('reduced-motion: no lift on nav hover', (await page.evaluate(() => getComputedStyle(document.querySelector('.nav-link')).transform)) === 'none');
    await ctx.close();
  }

  /* ===== No backdrop-filter fallback ===== */
  for (const [v, vp] of [['fallback-1440', { width: 1440, height: 900 }], ['fallback-390', { width: 390, height: 844 }]]) {
    const { ctx, page } = await newPage(browser, vp, { noBlur: true, dsf: 1 });
    await page.mouse.wheel(0, 900); await page.waitForTimeout(700);
    const bg = await page.evaluate(() => getComputedStyle(document.querySelector('.site-header__bar'), '::after').backgroundColor);
    check(`${v} solid compact fallback`, bg === 'rgb(15, 31, 24)', bg);
    await shot(page, `${v}-compact`);
    await ctx.close();
  }

  await browser.close();
  console.log(results.join('\n'));
  console.log(`\n${results.filter(r => r.startsWith('FAIL')).length} failed of ${results.length}`);
})();
