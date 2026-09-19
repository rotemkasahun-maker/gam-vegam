import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const require = createRequire(import.meta.url);
const nodeModules = process.env.PLAYWRIGHT_NODE_MODULES ||
  'C:\\Users\\gaya\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';
const { chromium } = require(require.resolve('playwright', { paths: [nodeModules] }));
const families = ['Assistant', 'Heebo', 'Rubik', 'Noto Sans Hebrew'];
const weights = [400, 500, 600, 700, 800];
const widths = [360, 390, 412, 1280, 1440];
const root = resolve('.');
const specimen = 'גם לעבוד גם להיות קרובים בקרים שעובדים בפתח תקווה Remote Hybrid 60 ₪120 45–60 דקות';
const fontFiles = new Map();
const fontRequests = new Map();

const fetchOfficialFonts = async family => {
  const cssUrl = new URL('https://fonts.googleapis.com/css2');
  cssUrl.searchParams.set('family', `${family}:wght@${weights.join(';')}`);
  cssUrl.searchParams.set('text', specimen);
  const cssResponse = await fetch(cssUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!cssResponse.ok) throw new Error(`Official CSS fetch failed for ${family}: HTTP ${cssResponse.status}`);
  const css = await cssResponse.text();
  const urls = [...css.matchAll(/font-weight:\s*(\d+);[\s\S]*?src:\s*url\(([^)]+)\)\s*format\('(woff2|truetype)'\)/g)].map(([, weight, url, format]) => ({ weight: Number(weight), url, format }));
  if (urls.length !== weights.length || new Set(urls.map(face => face.weight)).size !== weights.length) throw new Error(`Official CSS did not provide all requested font weights for ${family}`);
  for (const face of urls) {
    const fontResponse = await fetch(face.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!fontResponse.ok) throw new Error(`Official font fetch failed for ${family}/${face.weight}: HTTP ${fontResponse.status}`);
    const bytes = Buffer.from(await fontResponse.arrayBuffer());
    if (bytes.length < 1000) throw new Error(`Official font payload is unexpectedly small for ${family}/${face.weight}`);
    const key = `${family}/${face.weight}`;
    fontFiles.set(key, { bytes, format: face.format });
    fontRequests.set(key, 0);
  }
};

for (const family of families) await fetchOfficialFonts(family);

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const fontMatch = /^\/__bakeoff_fonts\/([^/]+)\/(\d+)$/.exec(pathname);
  if (fontMatch) {
    const key = `${fontMatch[1]}/${fontMatch[2]}`;
    const font = fontFiles.get(key);
    if (!font) { response.writeHead(404); response.end(); return; }
    fontRequests.set(key, fontRequests.get(key) + 1);
    response.writeHead(200, { 'Content-Type': font.format === 'woff2' ? 'font/woff2' : 'font/ttf', 'Cache-Control': 'no-store' }); response.end(font.bytes); return;
  }
  const file = resolve(root, pathname === '/' ? 'index.html' : pathname.slice(1));
  if (relative(root, file).startsWith('..')) { response.writeHead(403); response.end(); return; }
  try { response.end(await readFile(file)); } catch (_) { response.writeHead(404); response.end(); }
});
await new Promise(resolveServer => server.listen(0, '127.0.0.1', resolveServer));
const appUrl = `http://127.0.0.1:${server.address().port}/#discover`;
const errors = [];
const alias = family => `Bakeoff-${family.replaceAll(' ', '-')}`;
const fontCss = family => weights.map(weight => `@font-face{font-family:"${alias(family)}";font-style:normal;font-weight:${weight};src:url("/__bakeoff_fonts/${encodeURIComponent(family)}/${weight}") format("${fontFiles.get(`${family}/${weight}`).format}");}`).join('');

const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const family of families) for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on('pageerror', error => errors.push(`${family}/${width}: ${error.message}`));
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    const measure = await page.evaluate(async ({ family, css, alias, specimen, weights }) => {
      const style = document.createElement('style'); style.textContent = css; document.head.append(style);
      const familyName = `"${alias}", Arial, sans-serif`;
      document.body.style.fontFamily = familyName;
      const loaded = await Promise.all(weights.map(weight => document.fonts.load(`${weight} 20px "${alias}"`, specimen).then(faces => faces.length > 0)));
      const fixture = document.createElement('section');
      fixture.className = 'card visual-bakeoff-fixture';
      fixture.innerHTML = '<h2>בקרים שעובדים בפתח תקווה — מחפשות עוד 2–3 משפחות לרוטציה נעימה</h2><p>מחפשות דרך מעשית להמשיך לעבוד ולהישאר קרובים לילדים, בלי לוותר על תיאום ברור.</p><label class="field">מה חשוב לדעת?<small>טקסט עזר לפני פרסום</small><input value="Remote / Hybrid · 60% · ₪120 · 45–60 דקות"></label><p class="validation">צריך להוסיף תיאור קצר וברור.</p><div class="signals"><span>בקרים</span><span>אזור כללי</span></div><button class="primary">לפרטים ←</button>';
      document.querySelector('#app').append(fixture);
      const rect = selector => document.querySelector(selector).getBoundingClientRect();
      const result = { heroHeight: rect('.intro h1').height, titleHeight: rect('.card h2').height, fixtureHeight: rect('.visual-bakeoff-fixture').height, overflow: document.documentElement.scrollWidth > window.innerWidth + 1, loaded, computed: getComputedStyle(document.body).fontFamily };
      fixture.remove(); style.remove(); document.body.style.fontFamily = '';
      return result;
    }, { family, css: fontCss(family), alias: alias(family), specimen, weights });
    results.push({ family, width, ...measure });
    await page.close();
  }
  const failed = results.filter(result => result.overflow || result.loaded.some(loaded => !loaded));
  const unused = [...fontRequests].filter(([, count]) => count === 0).map(([key]) => key);
  if (errors.length || failed.length || unused.length) throw new Error(`Bake-off failure: ${[...errors, ...failed.map(result => `${result.family}/${result.width}`), ...unused.map(key => `unrequested:${key}`)].join(', ')}`);
  console.log(JSON.stringify({ status: 'PASS', appUrl, results, fontRequests: Object.fromEntries(fontRequests) }, null, 2));
} finally { await browser.close(); await new Promise(resolveServer => server.close(resolveServer)); }
