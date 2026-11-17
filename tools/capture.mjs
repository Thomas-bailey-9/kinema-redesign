// Capture desktop + phone screenshots of a locally served page and report missing assets.
// Usage: node tools/capture.mjs <url> <outDir> [prefix]
// Uses the globally available Playwright (no project dependency). Writes PNGs and a JSON report.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [url, outDir = 'reference/screenshots', prefix = 'capture'] = process.argv.slice(2);
if (!url) { console.error('Usage: node tools/capture.mjs <url> <outDir> [prefix]'); process.exit(1); }
mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900, isMobile: false },
  { name: 'phone-390', width: 390, height: 844, isMobile: true },
];

const browser = await chromium.launch();
const report = { url, capturedAt: new Date().toISOString(), viewports: {} };

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2, isMobile: vp.isMobile, hasTouch: vp.isMobile,
  });
  const page = await context.newPage();
  const failed = [], httpErrors = [], consoleErrors = [];
  page.on('requestfailed', r => failed.push({ url: r.url(), error: r.failure()?.errorText }));
  page.on('response', r => { if (r.status() >= 400) httpErrors.push({ url: r.url(), status: r.status() }); });
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => consoleErrors.push(`goto: ${e.message}`));
  // Scroll through to trigger lazy-loaded images, then return to top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);

  const dom = await page.evaluate(() => ({
    brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src),
    horizontalOverflowPx: document.documentElement.scrollWidth - window.innerWidth,
    pageHeight: document.documentElement.scrollHeight,
  }));

  await page.screenshot({ path: join(outDir, `${prefix}-${vp.name}-fold.png`) });
  await page.screenshot({ path: join(outDir, `${prefix}-${vp.name}-full.png`), fullPage: true });
  report.viewports[vp.name] = { ...dom, failedRequests: failed, httpErrors, consoleErrors };
  await context.close();
}

await browser.close();
writeFileSync(join(outDir, `${prefix}-report.json`), JSON.stringify(report, null, 2));
for (const [name, r] of Object.entries(report.viewports)) {
  console.log(`${name}: ${r.failedRequests.length} failed, ${r.httpErrors.length} HTTP errors, ` +
    `${r.brokenImages.length} broken images, overflow ${r.horizontalOverflowPx}px, height ${r.pageHeight}px`);
}
