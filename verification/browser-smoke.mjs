import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const baseUrl = (process.env.BASE_URL || 'https://gam-vegam.rotemka.chatgpt.site').replace(/\/$/, '');
const nodeModules = process.env.PLAYWRIGHT_NODE_MODULES ||
  'C:\\Users\\gaya\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';

let playwright;
try {
  const modulePath = process.env.PLAYWRIGHT_MODULE_PATH;
  playwright = modulePath
    ? require(modulePath)
    : require(require.resolve('playwright', { paths: [nodeModules] }));
} catch (error) {
  console.error('Unable to load Playwright. Set PLAYWRIGHT_MODULE_PATH or PLAYWRIGHT_NODE_MODULES.');
  console.error(error.message);
  process.exit(2);
}

const { chromium } = playwright;
const entities = [
  { type: 'initiative', id: 'initiative-pt', route: 'initiative-detail', marker: 'מחפשות עוד 2–3 משפחות' },
  { type: 'place', id: 'place-hod-hasharon', route: 'place-detail', marker: 'סטודיו פנוי בבקרים' },
  { type: 'offering', id: 'offering-statistics', route: 'offering-detail', marker: 'עזרה בסטטיסטיקה' },
  { type: 'job', id: 'job-research-operations', route: 'job', marker: 'Research Operations' }
];

const urlFor = entity => `${baseUrl}/#${entity.route}/${entity.id}`;
const errors = [];
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const hash = page => new URL(page.url()).hash;
const waitForHash = async (page, expected) => page.waitForFunction(value => location.hash === value, expected);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

try {
  await page.goto(`${baseUrl}/#discover`, { waitUntil: 'networkidle' });
  assert(hash(page) === '#discover', `boot route was ${hash(page)}`);
  assert(await page.locator('[data-action="open-detail"]').count() === 4, 'Discover did not render four entity cards');

  for (const entity of entities) {
    await page.goto(`${baseUrl}/#discover`, { waitUntil: 'networkidle' });
    const button = page.locator(`[data-action="open-detail"][data-entity-id="${entity.id}"]`);
    assert(await button.count() === 1, `missing card action for ${entity.id}`);
    const historyBefore = await page.evaluate(() => history.length);
    await button.click();
    await waitForHash(page, `#${entity.route}/${entity.id}`);
    const historyAfter = await page.evaluate(() => history.length);
    assert(historyAfter === historyBefore + 1, `${entity.id} caused ${historyAfter - historyBefore} history entries, expected 1`);
    assert((await page.locator('body').innerText()).includes(entity.marker), `${entity.id} content marker missing`);

    await page.reload({ waitUntil: 'networkidle' });
    assert(hash(page) === `#${entity.route}/${entity.id}`, `${entity.id} reload lost canonical URL`);
    assert((await page.locator('body').innerText()).includes(entity.marker), `${entity.id} reload lost content`);
    await page.goBack();
    await waitForHash(page, '#discover');
    await page.goForward();
    await waitForHash(page, `#${entity.route}/${entity.id}`);
    assert((await page.locator('body').innerText()).includes(entity.marker), `${entity.id} forward lost content`);
    await page.goto(urlFor(entity), { waitUntil: 'networkidle' });
    assert(hash(page) === `#${entity.route}/${entity.id}`, `${entity.id} direct URL failed`);
  }

  for (const invalid of ['#not-a-route', '#initiative-detail/unknown-entity']) {
    await page.goto(`${baseUrl}/${invalid}`, { waitUntil: 'networkidle' });
    await waitForHash(page, '#discover');
    assert(await page.locator('[data-action="open-detail"]').count() === 4, `invalid route ${invalid} did not recover`);
  }

  if (errors.length) throw new Error(`browser errors detected:\n${errors.join('\n')}`);
  console.log(JSON.stringify({ status: 'PASS', baseUrl, entities: entities.map(e => e.id), errors: [] }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ status: 'FAIL', baseUrl, errors, message: error.message }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
