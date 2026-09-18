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
const clearSession = async page => page.evaluate(() => sessionStorage.clear());
const text = page => page.locator('body').innerText();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => {
  if (message.type() === 'error' && !message.text().includes('Failed to load resource: net::ERR_NETWORK_ACCESS_DENIED')) errors.push(`console: ${message.text()}`);
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

  // Slice 2 protected-action smoke checks. Each scenario starts from a clean session.
  await clearSession(page);
  await page.goto(urlFor(entities[0]), { waitUntil: 'networkidle' });
  await page.locator('[data-action="join"]').click();
  assert(await page.locator('[data-action="demo-auth"]').count() === 1, 'Join did not open Account Gate');
  await page.locator('[data-action="demo-auth"]').click();
  assert((await text(page)).includes('הצטרפת ליוזמה'), 'Join confirmation missing');
  assert((await text(page)).includes(entities[0].marker), 'Join confirmation lost initiative context');
  assert(await page.evaluate(() => window.__foundation.getState().pendingAction === null), 'Join pending action was not consumed');
  await page.reload({ waitUntil: 'networkidle' });
  assert((await text(page)).includes('הצטרפת ליוזמה'), 'Join confirmation replayed incorrectly after refresh');
  const joinConfirmationCount = ((await text(page)).match(/הצטרפת ליוזמה/g) || []).length;
  await page.goBack();
  await page.goForward();
  assert((await text(page)).includes('הצטרפת ליוזמה'), 'Join confirmation lost after Back/Forward');
  assert(((await text(page)).match(/הצטרפת ליוזמה/g) || []).length === joinConfirmationCount, 'Back/Forward duplicated Join confirmation');
  assert(await page.evaluate(() => window.__foundation.getState().pendingAction === null), 'Back/Forward restored consumed Join pending action');

  await clearSession(page);
  await page.goto(urlFor(entities[2]), { waitUntil: 'networkidle' });
  await page.locator('[data-action="connect"]').click();
  assert(await page.locator('[data-action="demo-auth"]').count() === 1, 'Connect did not open Account Gate');
  await page.locator('[data-action="demo-auth"]').click();
  assert((await text(page)).includes('בקשת החיבור נשלחה'), 'Connect confirmation missing');
  assert((await text(page)).includes(entities[2].marker), 'Connect confirmation lost offering context');
  assert(await page.evaluate(() => window.__foundation.getState().pendingAction === null), 'Connect pending action was not consumed');

  await clearSession(page);
  await page.goto(urlFor(entities[0]), { waitUntil: 'networkidle' });
  const cancelHistory = await page.evaluate(() => history.length);
  await page.locator('[data-action="join"]').click();
  await page.locator('[data-action="cancel-gate"]').first().click();
  assert(hash(page) === `#${entities[0].route}/${entities[0].id}`, 'Gate cancel changed origin route');
  assert(!(await text(page)).includes('הצטרפת ליוזמה'), 'Gate cancel executed Join');
  assert(await page.evaluate(() => history.length) === cancelHistory, 'Gate cancel polluted history');

  await clearSession(page);
  await page.goto(urlFor(entities[2]), { waitUntil: 'networkidle' });
  await page.locator('[data-action="connect"]').click();
  await page.locator('[data-action="demo-auth"]').click();
  assert(await page.locator('[data-action="demo-auth"]').count() === 0, 'Authenticated action reopened Gate');
  await page.reload({ waitUntil: 'networkidle' });
  assert((await text(page)).includes('בקשת החיבור נשלחה'), 'Connect confirmation was not refresh-safe');

  await clearSession(page);
  await page.goto(`${baseUrl}/#discover`, { waitUntil: 'networkidle' });
  await page.locator('[data-action="open-detail"][data-entity-id="offering-statistics"]').click();
  await page.locator('[data-action="connect"]').click();
  assert(await page.locator('[data-action="demo-auth"]').count() === 1, 'Gate was not opened for refresh test');
  await page.reload({ waitUntil: 'networkidle' });
  assert(await page.locator('[data-action="demo-auth"]').count() === 1, 'Account Gate did not survive refresh');
  assert(hash(page) === '#offering-detail/offering-statistics', 'Gate refresh lost origin route');
  await page.locator('[data-action="cancel-gate"]').first().click();
  assert(!(await text(page)).includes('בקשת החיבור נשלחה'), 'Gate refresh/cancel executed Connect');

  await clearSession(page);
  await page.evaluate(() => sessionStorage.setItem('gv-foundation-state', JSON.stringify({ auth: { status: 'authenticated' } })));
  await page.goto(urlFor(entities[2]), { waitUntil: 'networkidle' });
  await page.locator('[data-action="connect"]').click();
  assert(await page.locator('[data-action="demo-auth"]').count() === 0, 'Authenticated direct Connect opened Gate');
  assert((await text(page)).includes('בקשת החיבור נשלחה'), 'Authenticated direct Connect confirmation missing');

  await clearSession(page);
  await page.evaluate(() => sessionStorage.setItem('gv-foundation-state', JSON.stringify({ auth: { status: 'authenticated' } })));
  await page.goto(urlFor(entities[0]), { waitUntil: 'networkidle' });
  await page.locator('[data-action="join"]').click();
  assert(await page.locator('[data-action="demo-auth"]').count() === 0, 'Authenticated direct Join opened Gate');
  assert((await text(page)).includes('הצטרפת ליוזמה'), 'Authenticated direct Join confirmation missing');
  assert((await text(page)).includes(entities[0].marker), 'Authenticated direct Join lost initiative context');

  await clearSession(page);
  await page.goto(urlFor(entities[0]), { waitUntil: 'networkidle' });
  await page.evaluate(() => sessionStorage.setItem('gv-foundation-state', JSON.stringify({ auth: { status: 'anonymous' }, route: { name: 'initiative-detail/initiative-pt' }, context: { entityType: 'initiative', entityId: 'initiative-pt' }, ui: { overlay: { type: 'account-gate' } }, pendingAction: { version: 999, actionType: 'join', continuation: 'join', payload: { entityType: 'initiative', entityId: 'initiative-pt' } } })));
  await page.reload({ waitUntil: 'networkidle' });
  assert(await page.locator('[data-action="demo-auth"]').count() === 1, 'Malformed pending recovery did not remain deterministic');
  await page.locator('[data-action="demo-auth"]').click();
  assert(!(await text(page)).includes('הצטרפת ליוזמה'), 'Malformed pending action executed');
  assert(await page.evaluate(() => window.__foundation.getState().pendingAction === null), 'Malformed pending action was not cleared');

  await clearSession(page);
  await page.goto(urlFor(entities[0]), { waitUntil: 'networkidle' });
  await page.evaluate(() => sessionStorage.setItem('gv-foundation-state', JSON.stringify({
    auth: { status: 'anonymous' },
    route: { name: 'initiative-detail/initiative-pt' },
    context: { entityType: 'initiative', entityId: 'initiative-pt' },
    ui: { overlay: { type: 'account-gate' } },
    pendingAction: { id: 'join:missing', actionType: 'join', originRoute: 'initiative-detail/initiative-pt', originContext: { entityType: 'initiative', entityId: 'initiative-pt' }, payload: { entityType: 'initiative', entityId: 'initiative-missing' }, continuation: 'join', createdAt: Date.now(), version: 1 }
  })));
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-action="demo-auth"]').click();
  assert(await page.locator('[data-action="demo-auth"]').count() === 0, 'Missing-entity pending action left Gate open');
  assert((await text(page)).includes('מחפשות עוד 2–3 משפחות'), 'Missing-entity recovery lost origin detail');
  assert(!(await text(page)).includes('הצטרפת ליוזמה'), 'Missing-entity pending action executed');
  assert(await page.evaluate(() => window.__foundation.getState().pendingAction === null), 'Missing-entity pending action was not cleared');

  // Slice 3 Creation vertical smoke checks. Each scenario starts from a clean session.
  const fillDraft = async (title, area, description) => {
    await page.locator('[data-field="title"]').fill(title);
    await page.locator('[data-field="area"]').fill(area);
    await page.locator('[data-field="description"]').fill(description);
  };
  const openCreate = async type => {
    await clearSession(page);
    await page.goto(`${baseUrl}/#discover`, { waitUntil: 'networkidle' });
    await page.locator('[data-action="start"]').click();
    assert(await page.locator('[data-testid="start-sheet"]').count() === 1, 'Start Sheet missing');
    if (type === 'offering') await page.locator('[data-action="start-offer"]').click();
    else {
      await page.locator('[data-action="start-create"]').click();
      await page.locator(`[data-action="create-type"][data-create-type="${type}"]`).click();
    }
    assert(await page.locator(`[data-testid="create-form"]`).count() === 1, `${type} form missing`);
  };
  const publishCreation = async (type, title, area, description) => {
    await openCreate(type);
    await fillDraft(title, area, description);
    await page.locator('[data-action="preview-draft"]').click();
    assert(await page.locator('[data-testid="preview"]').count() === 1, `${type} preview missing`);
    assert((await text(page)).includes(title), `${type} preview lost title`);
    await page.locator('[data-action="edit-draft"]').first().click();
    assert((await page.locator('[data-field="title"]').inputValue()) === title, `${type} edit lost title`);
    await page.locator('[data-action="preview-draft"]').click();
    await page.locator('[data-action="publish-draft"]').click();
    assert(await page.locator('[data-action="demo-auth"]').count() === 1, `${type} publish did not open Account Gate`);
    await page.reload({ waitUntil: 'networkidle' });
    assert(await page.locator('[data-action="demo-auth"]').count() === 1, `${type} Gate did not survive refresh`);
    await page.locator('[data-action="demo-auth"]').click();
    assert(await page.locator('[data-testid="publish-success"]').count() === 1, `${type} success missing`);
    await page.locator('[data-action="navigate"][data-route="mine"]').click();
    assert(await page.locator(`[data-created-id]`).count() === 1, `${type} My item missing or duplicated`);
    assert((await text(page)).includes(title), `${type} My item title missing`);
    await page.reload({ waitUntil: 'networkidle' });
    assert(await page.locator(`[data-created-id]`).count() === 1, `${type} refresh duplicated My item`);
    await page.goBack(); await page.goForward();
    assert(await page.locator(`[data-created-id]`).count() === 1, `${type} history replay duplicated My item`);
  };
  await publishCreation('initiative', 'בדיקת יוזמה', 'פתח תקווה', 'תיאור יוזמה מלא וברור');
  await publishCreation('offering', 'בדיקת הצעה', 'Online', 'עזרה מקצועית מלאה וברורה');
  await publishCreation('place', 'בדיקת מקום', 'הוד השרון', 'מקום מתאים לילדים ולמשפחות');

  await openCreate('initiative');
  await page.locator('[data-field="title"]').fill('טיוטה חלקית');
  await page.locator('[data-action="preview-draft"]').click();
  assert((await text(page)).includes('טיוטה חלקית'), 'Partial preview lost entered data');
  await page.locator('[data-action="publish-draft"]').click();
  assert(await page.locator('[data-testid="publish-validation"]').count() === 1, 'Invalid publish did not show validation');
  assert(await page.locator('[data-action="demo-auth"]').count() === 0, 'Invalid publish opened Account Gate');
  await page.locator('[data-action="edit-draft"]').first().click();
  assert((await page.locator('[data-field="title"]').inputValue()) === 'טיוטה חלקית', 'Invalid draft was not preserved');

  await openCreate('initiative');
  await fillDraft('יוזמה לביטול', 'רמת גן', 'תיאור מספיק לבדיקת ביטול');
  await page.locator('[data-action="preview-draft"]').click();
  await page.locator('[data-action="publish-draft"]').click();
  await page.locator('[data-action="cancel-gate"]').first().click();
  assert(await page.locator('[data-testid="preview"]').count() === 1, 'Gate cancel did not return to Preview');
  assert(await page.evaluate(() => window.__foundation.getState().pendingAction === null), 'Publish Gate cancel left pending action');
  assert(await page.locator('[data-testid="publish-success"]').count() === 0, 'Gate cancel published draft');

  await openCreate('initiative');
  await fillDraft('טיוטה למלפורמט', 'חיפה', 'תיאור לא יפורסם בטעות');
  await page.locator('[data-action="preview-draft"]').click();
  await page.evaluate(() => sessionStorage.setItem('gv-foundation-state', JSON.stringify({ flow: { type: 'initiative', step: 'preview', draft: { type: 'unknown', title: 'דליפה' } }, route: { name: 'preview' } })));
  await page.reload({ waitUntil: 'networkidle' });
  assert(hash(page) === '#discover', 'Malformed draft did not recover to Discover');
  assert(!(await text(page)).includes('דליפה'), 'Malformed draft leaked stale content');

  if (errors.length) throw new Error(`browser errors detected:\n${errors.join('\n')}`);
  console.log(JSON.stringify({ status: 'PASS', baseUrl, entities: entities.map(e => e.id), errors: [] }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ status: 'FAIL', baseUrl, errors, message: error.message }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
