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

  // Privacy & Trust: sensitive public details block publishing, retain the original draft, and do not infer from ordinary age ranges.
  const privacyCases = [
    { field: 'description', value: 'לתיאום אפשר לפנות ל-050-123-4567.', expected: 'מספר טלפון' },
    { field: 'description', value: 'אפשר לכתוב ל-noa@example.com לפרטים.', expected: 'כתובת אימייל' },
    { field: 'description', value: 'נפגשות ברחוב הרצל 12 בימי רביעי.', expected: 'כתובת רחוב מדויקת' },
    { field: 'description', value: 'הבת שלי, נועה בת 4, תשמח להצטרף.', expected: 'שם או פרט מזהה של ילד/ה' }
  ];
  for (const privacyCase of privacyCases) {
    await openCreate('initiative');
    await fillDraft('יוזמה פרטית', 'פתח תקווה', 'תיאור כללי ובטוח לפרסום.');
    await page.locator(`[data-field="${privacyCase.field}"]`).fill(privacyCase.value);
    await page.locator('[data-action="preview-draft"]').click();
    await page.locator('[data-action="publish-draft"]').click();
    assert(await page.locator('[data-testid="publish-privacy-guardrail"]').count() === 1, `Privacy guardrail missing for ${privacyCase.expected}`);
    assert((await text(page)).includes(privacyCase.expected), `Privacy guardrail did not explain ${privacyCase.expected}`);
    assert(await page.locator('[data-action="demo-auth"]').count() === 0, `Sensitive ${privacyCase.expected} opened Account Gate`);
    await page.locator('[data-action="edit-draft"]').first().click();
    assert((await page.locator(`[data-field="${privacyCase.field}"]`).inputValue()) === privacyCase.value, `Sensitive ${privacyCase.expected} was silently changed`);
  }
  await openCreate('initiative');
  await fillDraft('יוזמה לגילאים', 'פתח תקווה', 'מחפשות משפחות עם ילדים בני 1.5–3 לבקרים משותפים.');
  await page.locator('[data-action="preview-draft"]').click();
  await page.locator('[data-action="publish-draft"]').click();
  assert(await page.locator('[data-testid="publish-privacy-guardrail"]').count() === 0, 'Ordinary age range was treated as child-identifying detail');
  assert(await page.locator('[data-action="demo-auth"]').count() === 1, 'Ordinary age range did not reach the normal publish Gate');
  await page.locator('[data-action="cancel-gate"]').first().click();

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

  // Slice 4 Search & Intent smoke checks. Search, Saved Intent, and Post remain separate state.
  const chooseSearch = async (field, value) => page.locator(`[data-action="answer-search"][data-search-field="${field}"][data-search-value="${value}"]`).click();
  const openSearch = async () => {
    await clearSession(page);
    await page.goto(`${baseUrl}/#discover`, { waitUntil: 'networkidle' });
    await page.locator('[data-action="start"]').click();
    await page.locator('[data-action="start-find"]').click();
    assert(hash(page) === '#search/q1', 'Start Sheet Find did not open canonical Search Q1');
    assert(await page.locator('[data-testid="search-q1"]').count() === 1, 'Search Q1 missing');
  };

  // A/B/C: full flow, Back preservation, Results, and correct Detail.
  await openSearch();
  await chooseSearch('need', 'initiatives');
  assert(hash(page) === '#search/q2', 'Q1 did not advance to Q2');
  await chooseSearch('area', 'פתח תקווה');
  assert(hash(page) === '#search/q3', 'Q2 did not advance to Q3');
  await page.goBack();
  await waitForHash(page, '#search/q2');
  assert(await page.locator('[data-search-field="area"][data-search-value="פתח תקווה"].selected').count() === 1, 'Back to Q2 lost area answer');
  await page.goBack();
  await waitForHash(page, '#search/q1');
  assert(await page.locator('[data-search-field="need"][data-search-value="initiatives"].selected').count() === 1, 'Back to Q1 lost need answer');
  await page.goForward(); await page.goForward();
  await waitForHash(page, '#search/q3');
  await chooseSearch('context', 'mornings');
  assert(hash(page) === '#search/results', 'Exact search did not reach Results');
  assert(await page.locator('[data-testid="search-results"]').count() === 1, 'Results state missing');
  assert(await page.locator('[data-search-result-id="initiative-pt"]').count() === 1, 'Expected deterministic initiative match missing');
  await page.locator('[data-search-result-id="initiative-pt"] [data-action="open-detail"]').click();
  assert(hash(page) === '#initiative-detail/initiative-pt', 'Result did not open correct Detail');
  await page.goBack();
  await waitForHash(page, '#search/results');

  // D: a category match with mismatched constraints is Partial, not a fabricated exact match.
  await openSearch();
  await chooseSearch('need', 'jobs');
  await chooseSearch('area', 'פתח תקווה');
  await chooseSearch('context', 'mornings');
  assert(hash(page) === '#search/partial', 'Mismatched job search did not reach Partial');
  assert(await page.locator('[data-testid="search-partial"]').count() === 1, 'Partial state missing');
  assert(await page.locator('[data-search-result-id="job-research-operations"]').count() === 1, 'Partial candidate missing');
  await openSearch();
  await chooseSearch('need', 'initiatives');
  await chooseSearch('area', 'אזור אחר');
  await chooseSearch('context', 'mornings');
  assert(hash(page) === '#search/partial', 'Other area incorrectly acted as an exact-match wildcard');
  assert(await page.locator('[data-testid="search-results"]').count() === 0, 'Other area rendered canonical Results');
  assert(await page.locator('[data-search-result-id="initiative-pt"]').count() === 1, 'Other area Partial did not retain the relevant category candidate');

  // E/F: unsupported category reaches No Results and editing retains answers.
  await openSearch();
  await chooseSearch('need', 'care');
  await chooseSearch('area', 'הוד השרון');
  await chooseSearch('context', 'flexible');
  assert(hash(page) === '#search/no-results', 'Unsupported search did not reach No Results');
  assert(await page.locator('[data-testid="search-no-results"]').count() === 1, 'No Results state missing');
  await page.locator('[data-action="edit-search"]').click();
  assert(hash(page) === '#search/q1', 'Broaden Search did not return to Q1');
  assert(await page.locator('[data-search-field="need"][data-search-value="care"].selected').count() === 1, 'Broaden Search lost preserved answers');
  await page.goBack();
  await waitForHash(page, '#search/no-results');

  // G/H: explicit consent, canonical Gate, consume-once, private My item, refresh/replay idempotency.
  assert(await page.evaluate(() => window.__foundation.getState().savedIntents.length === 0), 'Search silently created a Saved Intent');
  await page.locator('[data-action="request-save-intent"]').click();
  assert(await page.locator('[data-testid="save-intent-consent"]').count() === 1, 'Save Intent consent missing');
  assert((await text(page)).includes('לא יפורסמו כפוסט'), 'Save Intent privacy explanation missing');
  await page.locator('[data-action="confirm-save-intent"]').click();
  assert(await page.locator('[data-action="demo-auth"]').count() === 1, 'Save Intent did not reuse Account Gate');
  await page.reload({ waitUntil: 'networkidle' });
  assert(await page.locator('[data-action="demo-auth"]').count() === 1, 'Save Intent Gate did not survive refresh');
  await page.locator('[data-action="demo-auth"]').click();
  assert(await page.locator('[data-testid="intent-saved"]').count() === 1, 'Saved Intent confirmation missing');
  assert(await page.evaluate(() => window.__foundation.getState().savedIntents.length === 1), 'Saved Intent missing or duplicated');
  assert(await page.evaluate(() => window.__foundation.getState().pendingAction === null), 'Save Intent pending action was not consumed');
  assert(await page.evaluate(() => window.__foundation.getState().createdItems.length === 0), 'Saving intent created a public Post');
  await page.reload({ waitUntil: 'networkidle' });
  assert(await page.evaluate(() => window.__foundation.getState().savedIntents.length === 1), 'Refresh duplicated Saved Intent');
  await page.locator('[data-route="mine"]').last().click();
  assert(await page.locator('[data-saved-intent-id]').count() === 1, 'Private Saved Intent missing from My');
  assert((await text(page)).includes('גלוי רק לך'), 'My did not label Saved Intent private');
  assert(await page.locator('[data-created-id]').count() === 0, 'Saved Intent appeared as public Post in My');
  await page.goBack(); await page.goForward();
  assert(await page.locator('[data-saved-intent-id]').count() === 1, 'History replay duplicated Saved Intent');

  // I/J/K: Search creates an editable prefilled Post draft, preserves provenance, and does not auto-publish.
  await openSearch();
  await chooseSearch('need', 'care');
  await chooseSearch('area', 'אזור אחר');
  await chooseSearch('context', 'flexible');
  await page.locator('[data-action="publish-search-need"]').click();
  assert(hash(page) === '#create/post', 'Publish Need did not open canonical Post draft');
  assert(await page.locator('[data-testid="search-provenance"]').count() === 1, 'Search draft provenance explanation missing');
  assert((await page.locator('[data-field="title"]').inputValue()).includes('חינוך וטיפול'), 'Search draft title was not prefilled');
  assert((await page.locator('[data-field="area"]').inputValue()) === 'אזור אחר', 'Search draft area was not prefilled');
  const editedSearchDescription = 'מחפשת מסגרת קטנה וגמישה, ואשמח לשמוע על אפשרויות באזור.';
  await page.locator('[data-field="description"]').fill(editedSearchDescription);
  await page.reload({ waitUntil: 'networkidle' });
  assert((await page.locator('[data-field="description"]').inputValue()) === editedSearchDescription, 'Edited Search draft did not survive refresh');
  assert(await page.evaluate(() => window.__foundation.getState().flow.draft.createdFrom === 'search'), 'Search draft lost createdFrom provenance');
  assert(await page.evaluate(() => window.__foundation.getState().createdItems.length === 0), 'Search draft published before explicit Publish');
  await page.locator('[data-action="preview-draft"]').click();
  assert((await text(page)).includes(editedSearchDescription), 'Preview lost edited Search draft values');
  assert(await page.evaluate(() => window.__foundation.getState().createdItems.length === 0), 'Preview auto-published Search draft');
  await page.locator('[data-action="edit-draft"]').first().click();
  assert((await page.locator('[data-field="description"]').inputValue()) === editedSearchDescription, 'Edit after Preview lost Search draft values');
  await page.locator('[data-action="preview-draft"]').click();
  await page.locator('[data-action="publish-draft"]').click();
  assert(await page.locator('[data-action="demo-auth"]').count() === 1, 'Explicit Search Post publish did not reuse Account Gate');
  assert(await page.evaluate(() => window.__foundation.getState().createdItems.length === 0), 'Search Post existed before Gate continuation');
  await page.locator('[data-action="demo-auth"]').click();
  assert(await page.locator('[data-testid="publish-success"]').count() === 1, 'Search Post explicit publish did not reach success');
  assert(await page.evaluate(() => window.__foundation.getState().createdItems.length === 1), 'Search Post explicit publish did not create one item');
  assert(await page.evaluate(() => window.__foundation.getState().createdItems[0].createdFrom === 'search'), 'Published Search Post lost provenance');
  await page.locator('[data-action="navigate"][data-route="mine"]').click();
  assert(await page.locator('[data-created-id]').count() === 1, 'Published Search Post missing from My');
  assert((await text(page)).includes('נוצר מחיפוש'), 'My did not expose Search Post provenance');

  // Deliberate replacement is required for an unrelated valid draft.
  await clearSession(page);
  await page.evaluate(() => sessionStorage.setItem('gv-foundation-state', JSON.stringify({
    route: { name: 'search/no-results' },
    search: { answers: { need: 'care', area: 'אזור אחר', context: 'flexible' }, outcome: 'no-results' },
    flow: { type: 'initiative', step: 'form', draft: { id: 'draft-existing', type: 'initiative', title: 'טיוטה חשובה', area: 'חיפה', description: 'טיוטה תקינה שלא מחליפים בלי אישור' } }
  })));
  await page.goto(`${baseUrl}/#search/no-results`, { waitUntil: 'networkidle' });
  await page.locator('[data-action="publish-search-need"]').click();
  assert(await page.locator('[data-testid="replace-draft-confirm"]').count() === 1, 'Unrelated valid draft was replaced without confirmation');
  assert(await page.evaluate(() => window.__foundation.getState().flow.draft.title === 'טיוטה חשובה'), 'Draft changed before replacement confirmation');
  await page.locator('[data-action="confirm-replace-draft"]').click();
  assert(hash(page) === '#create/post', 'Confirmed draft replacement did not open Post form');

  // Incomplete unrelated drafts receive the same deliberate replacement protection.
  await clearSession(page);
  await page.evaluate(() => sessionStorage.setItem('gv-foundation-state', JSON.stringify({
    route: { name: 'search/no-results' },
    search: { answers: { need: 'care', area: 'אזור אחר', context: 'flexible' }, outcome: 'no-results' },
    flow: { type: 'place', step: 'form', draft: { id: 'draft-incomplete', type: 'place', title: 'טיוטה חלקית', area: '', description: '' } }
  })));
  await page.goto(`${baseUrl}/?incomplete-draft=1#search/no-results`, { waitUntil: 'networkidle' });
  await page.locator('[data-action="publish-search-need"]').click();
  assert(await page.locator('[data-testid="replace-draft-confirm"]').count() === 1, 'Incomplete unrelated draft was replaced without confirmation');
  assert(await page.evaluate(() => window.__foundation.getState().flow.draft.id === 'draft-incomplete'), 'Incomplete draft changed before replacement confirmation');
  await page.locator('[data-action="close-overlay"]').last().click();
  assert(hash(page) === '#search/no-results', 'Canceling incomplete draft replacement changed route');
  assert(await page.evaluate(() => window.__foundation.getState().flow.draft.id === 'draft-incomplete'), 'Canceling incomplete draft replacement lost draft');

  // L: malformed Search state recovers to the earliest valid canonical step without side effects.
  await clearSession(page);
  await page.evaluate(() => sessionStorage.setItem('gv-foundation-state', JSON.stringify({
    route: { name: 'search/results' },
    search: { answers: { need: 'not-valid', area: 42, context: 'mornings' }, outcome: 'results' },
    savedIntents: [{ id: 'malformed', answers: { need: 'care' } }]
  })));
  await page.goto(`${baseUrl}/?malformed-search=1#search/results`, { waitUntil: 'networkidle' });
  assert(hash(page) === '#search/q1', `Malformed Search state did not recover to Q1: ${hash(page)}`);
  assert(await page.locator('[data-testid="search-q1"]').count() === 1, 'Malformed Search recovery did not render Q1');
  assert(await page.evaluate(() => window.__foundation.getState().savedIntents.length === 0), 'Malformed Search recovery retained invalid intent');
  assert(await page.evaluate(() => window.__foundation.getState().createdItems.length === 0), 'Malformed Search recovery published content');

  // Slice 5 Inspiration checks: curated library, route restoration, editable provenance, and deliberate replacement.
  await clearSession(page);
  await page.goto(`${baseUrl}/#discover`, { waitUntil: 'networkidle' });
  await page.locator('[data-route="inspiration"]').last().click();
  assert(hash(page) === '#inspiration', 'Top-level Inspiration did not open canonical library');
  assert(await page.locator('[data-testid="inspiration-library"]').count() === 1, 'Inspiration library missing');
  assert(await page.locator('[data-inspiration-card-id]').count() >= 5, 'Curated Inspiration library is incomplete');
  await page.reload({ waitUntil: 'networkidle' });
  assert(hash(page) === '#inspiration' && await page.locator('[data-testid="inspiration-library"]').count() === 1, 'Inspiration library did not survive refresh');

  const modelId = 'care-rotation';
  await page.locator(`[data-action="open-inspiration"][data-inspiration-model-id="${modelId}"]`).click();
  assert(hash(page) === `#inspiration/${modelId}`, 'Inspiration model did not open canonical detail');
  assert(await page.locator(`[data-testid="inspiration-detail"][data-inspiration-model-id="${modelId}"]`).count() === 1, 'Wrong Inspiration model detail rendered');
  await page.goBack(); await waitForHash(page, '#inspiration');
  await page.goForward(); await waitForHash(page, `#inspiration/${modelId}`);
  await page.goto(`${baseUrl}/#inspiration/not-allowed`, { waitUntil: 'networkidle' });
  await waitForHash(page, '#discover');

  await page.goto(`${baseUrl}/#inspiration/${modelId}`, { waitUntil: 'networkidle' });
  await page.locator('[data-action="request-inspiration-draft"]').click();
  assert(hash(page) === '#create/initiative', 'Inspiration CTA did not create an Initiative draft');
  assert(await page.locator('[data-testid="inspiration-provenance"]').count() === 1, 'Inspiration draft provenance missing');
  assert((await page.locator('[data-field="title"]').inputValue()).includes('רוטציית'), 'Inspiration title was not prefilled');
  assert(await page.evaluate(() => { const draft = window.__foundation.getState().flow.draft; return draft.createdFrom === 'inspiration' && draft.inspirationModelId === 'care-rotation' && window.__foundation.getState().createdItems.length === 0; }), 'Inspiration draft provenance or no-auto-publish contract failed');
  await page.locator('[data-field="area"]').fill('רמת גן');
  await page.locator('[data-field="description"]').fill('טיוטת השראה ערוכה שאפשר לפרסם רק לאחר אישור מפורש.');
  await page.reload({ waitUntil: 'networkidle' });
  assert(await page.locator('[data-testid="inspiration-provenance"]').count() === 1, 'Inspiration draft did not survive refresh');
  await page.locator('[data-action="preview-draft"]').click();
  assert(await page.locator('[data-testid="inspiration-preview-provenance"]').count() === 1, 'Preview lost Inspiration provenance');
  assert(await page.evaluate(() => window.__foundation.getState().createdItems.length === 0), 'Inspiration Preview auto-published');
  await page.locator('[data-action="edit-draft"]').first().click();
  assert((await page.locator('[data-field="area"]').inputValue()) === 'רמת גן', 'Inspiration draft was not editable');
  await page.locator('[data-action="navigate"][data-route="inspiration/care-rotation"]').first().click();
  assert(hash(page) === '#inspiration/care-rotation', 'Inspiration draft back route is incorrect');
  await page.locator('[data-action="request-inspiration-draft"]').click();
  assert(hash(page) === '#create/initiative', 'Reopening same Inspiration model did not restore the existing draft');
  assert((await page.locator('[data-field="area"]').inputValue()) === 'רמת גן', 'Same Inspiration model replaced edited draft');
  await page.locator('[data-action="preview-draft"]').click();
  await page.locator('[data-action="publish-draft"]').click();
  assert(await page.locator('[data-action="demo-auth"]').count() === 1, 'Inspiration publish did not reuse Account Gate');
  await page.locator('[data-action="demo-auth"]').click();
  await page.locator('[data-action="navigate"][data-route="mine"]').click();
  assert(await page.locator('[data-testid="inspiration-created-provenance"]').count() === 1, 'Published Inspiration item lost provenance in My');

  await clearSession(page);
  await page.evaluate(() => sessionStorage.setItem('gv-foundation-state', JSON.stringify({
    route: { name: 'inspiration/care-rotation' },
    flow: { type: 'place', step: 'form', draft: { id: 'draft-unrelated', type: 'place', title: 'טיוטה אחרת', area: '', description: '' } }
  })));
  await page.goto(`${baseUrl}/#inspiration/care-rotation`, { waitUntil: 'networkidle' });
  await page.locator('[data-action="request-inspiration-draft"]').click();
  assert(await page.locator('[data-testid="replace-draft-confirm"]').count() === 1, 'Unrelated incomplete draft was overwritten by Inspiration');
  assert(await page.evaluate(() => window.__foundation.getState().flow.draft.id === 'draft-unrelated'), 'Inspiration changed draft before confirmation');
  await page.locator('[data-action="close-overlay"]').last().click();
  assert(await page.evaluate(() => window.__foundation.getState().flow.draft.id === 'draft-unrelated'), 'Canceling Inspiration replacement lost existing draft');

  await clearSession(page);
  await page.goto(`${baseUrl}/#search/no-results`, { waitUntil: 'networkidle' });
  // A valid No Results state is required; use the existing canonical search flow to reach it.
  await page.goto(`${baseUrl}/#discover`, { waitUntil: 'networkidle' });
  await page.locator('[data-action="open-start"]').click(); await page.locator('[data-action="start-find"]').click();
  await chooseSearch('need', 'care'); await chooseSearch('area', 'הוד השרון'); await chooseSearch('context', 'flexible');
  assert(await page.locator('[data-action="navigate"][data-route="inspiration"]').count() === 1, 'No Results missing Inspiration next-best action');
  await page.locator('[data-action="navigate"][data-route="inspiration"]').click();
  assert(hash(page) === '#inspiration', 'No Results Inspiration entry did not navigate');
  assert(await page.evaluate(() => window.__foundation.getState().createdItems.length === 0), 'No Results Inspiration entry had side effects');

  // Slice 6 Mine / downstream: private intent, owned initiative management, and idempotent connection state.
  await clearSession(page);
  const mineInitiative = { id: 'created-initiative-mine', type: 'initiative', title: 'יוזמה לניהול', area: 'פתח תקווה', description: 'יוזמה עם צרכים קיימים בלבד.', peopleNeeded: 'עוד שתי משפחות', place: 'חלל משותף', educator: 'אשת חינוך' };
  const mineIntent = { id: 'intent-1rt9erp', answers: { need: 'initiatives', area: 'פתח תקווה', context: 'mornings' }, private: true, savedAt: 1 };
  await page.evaluate(({ mineInitiative, mineIntent }) => sessionStorage.setItem('gv-foundation-state', JSON.stringify({
    auth: { status: 'authenticated' }, route: { name: 'mine' }, createdItems: [mineInitiative], savedIntents: [mineIntent]
  })), { mineInitiative, mineIntent });
  await page.goto(`${baseUrl}/#mine`, { waitUntil: 'networkidle' });
  assert(await page.locator('[data-testid="mine"]').count() === 1, 'Mine canonical route missing');
  assert((await text(page)).includes('מה שאני מחפשת') && (await text(page)).includes('היוזמות שלי') && (await text(page)).includes('החיבורים שלי'), 'Mine sections are incomplete');
  assert(await page.locator('[data-saved-intent-id]').count() === 1 && (await text(page)).includes('גלוי רק לך'), 'Private intent missing or not private');
  await page.locator('[data-action="open-saved-intent"]').click();
  assert(hash(page) === `#saved-intent/${mineIntent.id}` && await page.locator('[data-testid="saved-intent-detail"]').count() === 1, 'Saved intent did not open by stable identity');
  await page.reload({ waitUntil: 'networkidle' });
  assert(hash(page) === `#saved-intent/${mineIntent.id}`, 'Saved intent route did not survive refresh');
  await page.locator('[data-action="resume-saved-intent"]').click();
  assert(hash(page) === '#search/results', 'Saved intent did not return to its existing search context');
  await page.locator('[data-route="mine"]').last().click();
  await page.locator('[data-action="manage-initiative"]').click();
  assert(await page.locator('[data-testid="manage-initiative"]').count() === 1, 'Owned initiative management route missing');
  assert((await text(page)).includes('עוד שתי משפחות') && (await text(page)).includes('חלל משותף') && (await text(page)).includes('אשת חינוך'), 'Initiative management lost known needs');
  await page.goto(`${baseUrl}/#initiative-detail/initiative-pt`, { waitUntil: 'networkidle' });
  await page.locator('[data-action="join"]').click();
  assert(await page.locator('[data-testid="connection-status"]').count() === 1, 'Join downstream status missing');
  await page.locator('[data-route="mine"]').last().click();
  assert(await page.locator('[data-connection-id="join:initiative-pt"]').count() === 1, 'My Connections did not retain Join request');
  await page.locator('[data-action="open-detail"][data-entity-id="initiative-pt"]').click();
  assert(await page.locator('[data-action="join"]').count() === 0, 'Duplicate Join remained actionable');
  assert(await page.evaluate(() => window.__foundation.getState().connections.length === 1 && window.__foundation.getState().createdItems.length === 1), 'Join was not idempotent or created an initiative');
  await page.goto(`${baseUrl}/#manage-initiative/not-owned`, { waitUntil: 'networkidle' });
  await waitForHash(page, '#discover');
  assert(hash(page) === '#discover', 'Invalid management route did not recover safely');

  // A place search outside the known availability area must reach recovery, not a fabricated partial match.
  await openSearch();
  await chooseSearch('need', 'places');
  await chooseSearch('area', 'אזור אחר');
  await chooseSearch('context', 'flexible');
  assert(hash(page) === '#search/no-results', 'Zero-availability place search did not reach No Results');
  assert(await page.locator('[data-testid="no-place-recovery"]').count() === 1, 'No Place recovery was not rendered');
  assert((await text(page)).includes('אין כאן זמינות מאומתת'), 'No Place recovery implied fake availability');
  await page.locator('[data-action="create-type"][data-create-type="place"]').click();
  assert(hash(page) === '#create/place', 'No Place recovery did not offer a valid publish path');

  // Privacy P0: report/block are local, idempotent, suppress supported paths, and make stale links safe.
  await clearSession(page);
  await page.goto(`${baseUrl}/#initiative-detail/initiative-pt`, { waitUntil: 'networkidle' });
  assert(await page.locator('[data-action="request-report"]').count() === 1 && await page.locator('[data-action="block-entity"]').count() === 1, 'Privacy actions are missing from the public detail');
  await page.locator('[data-action="request-report"]').click();
  assert(await page.locator('[data-testid="report-reasons"] button[data-action="confirm-report"]').count() === 6, 'Report reason set is incomplete');
  await page.locator('[data-action="confirm-report"]').first().click();
  assert(await page.locator('[data-testid="report-confirm"]').count() === 1, 'Report confirmation missing');
  assert(await page.evaluate(() => window.__foundation.getState().reports.length === 1), 'Report was not persisted');
  await page.evaluate(() => window.__foundation.dispatch('confirm-report', { entityType: 'initiative', entityId: 'initiative-pt', reportReason: 'אחר' }));
  assert(await page.evaluate(() => window.__foundation.getState().reports.length === 1), 'Report was not idempotent');
  await page.goto(`${baseUrl}/#discover`, { waitUntil: 'networkidle' });
  assert(await page.locator('[data-entity-id="initiative-pt"]').count() === 0, 'Reported entity remained in Discover');
  await page.goto(`${baseUrl}/#initiative-detail/initiative-pt`, { waitUntil: 'networkidle' });
  assert(await page.locator('[data-testid="hidden-entity-recovery"]').count() === 1 && !(await text(page)).includes('מחפשות עוד 2–3'), 'Reported direct link leaked details');

  await clearSession(page);
  await page.evaluate(() => sessionStorage.setItem('gv-foundation-state', JSON.stringify({ auth: { status: 'authenticated' }, route: { name: 'offering-detail/offering-statistics' } })));
  await page.goto(`${baseUrl}/#offering-detail/offering-statistics`, { waitUntil: 'networkidle' });
  await page.locator('[data-action="connect"]').click();
  assert(await page.locator('[data-testid="connection-status"]').count() === 1, 'Privacy setup connection was not created');
  await page.locator('[data-action="block-entity"]').click();
  assert(await page.locator('[data-testid="block-confirm"]').count() === 1, 'Block confirmation missing');
  assert(await page.evaluate(() => { const state = window.__foundation.getState(); return state.blockedEntityIds.length === 1 && state.connections.length === 1 && state.connections[0].status === 'inactive'; }), 'Block did not persist or deactivate the matching connection');
  await page.evaluate(() => window.__foundation.dispatch('block-entity', { entityType: 'offering', entityId: 'offering-statistics' }));
  assert(await page.evaluate(() => window.__foundation.getState().blockedEntityIds.length === 1), 'Block was not idempotent');
  await page.reload({ waitUntil: 'networkidle' });
  assert(await page.locator('[data-testid="hidden-entity-recovery"]').count() === 1 && await page.locator('[data-action="connect"]').count() === 0, 'Blocked Connect direct link was actionable after refresh');
  await page.goto(`${baseUrl}/#mine`, { waitUntil: 'networkidle' });
  assert(await page.locator('[data-connection-id="connect:offering-statistics"]').count() === 0, 'Blocked connection remained interactive in Mine');
  await page.goto(`${baseUrl}/#initiative-detail/initiative-pt`, { waitUntil: 'networkidle' });
  await page.locator('[data-action="block-entity"]').click();
  await page.goto(`${baseUrl}/#initiative-detail/initiative-pt`, { waitUntil: 'networkidle' });
  assert(await page.locator('[data-action="join"]').count() === 0 && await page.locator('[data-testid="hidden-entity-recovery"]').count() === 1, 'Blocked Join context remained actionable');

  if (errors.length) throw new Error(`browser errors detected:\n${errors.join('\n')}`);
  console.log(JSON.stringify({ status: 'PASS', baseUrl, entities: entities.map(e => e.id), errors: [] }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ status: 'FAIL', baseUrl, errors, message: error.message }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
