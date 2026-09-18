/* Clean Functional V1 Foundation shell — Slice 5 Inspiration. */
(function foundationShell() {
  'use strict';

  const appRoot = document.querySelector('#app');
  const overlayRoot = document.querySelector('#modal');
  const stateKey = 'gv-foundation-state';
  const routeRegistry = new Set(['discover', 'inspiration', 'mine', 'preview', 'search/q1', 'search/q2', 'search/q3', 'search/results', 'search/partial', 'search/no-results', 'initiative-detail', 'place-detail', 'offering-detail', 'job']);
  const searchRoutes = new Set(['search/q1', 'search/q2', 'search/q3', 'search/results', 'search/partial', 'search/no-results']);
  const resultRoutes = new Set(['search/results', 'search/partial', 'search/no-results']);
  const createTypes = new Set(['initiative', 'offering', 'place', 'post']);
  const pendingVersion = 1;

  const seed = {
    initiative: { id: 'initiative-pt', type: 'initiative', eyebrow: 'יוזמה · פתח תקווה', title: 'מחפשות עוד 2–3 משפחות לבקרים משותפים', description: 'שתי אמהות לילדים בני 1.5–3 רוצות להתחיל רוטציה פעמיים בשבוע.', area: 'פתח תקווה', searchKinds: ['people', 'initiatives', 'collaboration'], searchContexts: ['mornings', 'flexible'] },
    place: { id: 'place-hod-hasharon', type: 'place', eyebrow: 'מקום · הוד השרון', title: 'סטודיו פנוי בבקרים עם חצר קטנה', description: 'פתוח לקבוצה קבועה.', area: 'הוד השרון', searchKinds: ['places'], searchContexts: ['mornings', 'flexible'] },
    offer: { id: 'offering-statistics', type: 'offering', eyebrow: 'שירות מקצועי · Online', title: 'עזרה בסטטיסטיקה לסטודנטיות', description: 'עזרה מקצועית מרחוק.', area: 'Online', searchKinds: ['services', 'learning'], searchContexts: ['remote', 'flexible'] },
    job: { id: 'job-research-operations', type: 'job', eyebrow: 'משרה · Hybrid', title: 'Research Operations · 60%', description: 'גמישות ושילוב בית.', area: 'Hybrid', searchKinds: ['jobs'], searchContexts: ['hybrid', 'flexible'] }
  };
  const inspirationModels = {
    'care-rotation': { id: 'care-rotation', asset: 'אמא נוספת', title: 'רוטציה בין משפחות', summary: 'שתי משפחות או יותר מחלקות ביניהן בקרים קבועים עם הילדים.', how: 'קובעות ימים, מספר ילדים וכללי תיאום פשוטים.', needed: 'עוד משפחה, תיאום בסיסי ומקום שמתחלף ביניכן.', fit: 'מתאים כשיש רצון לעזרה הדדית בלי להקים מסגרת שלמה.', draft: { title: 'מחפשות משפחה לרוטציית בקרים', description: 'נשמח לבחון רוטציה פשוטה של בקרים משותפים עם עוד משפחה, בתיאום שמתאים לכולנו.', peopleNeeded: 'משפחה אחת או שתיים', daysTimes: 'בקרים, בתיאום' } },
    'park-work': { id: 'park-work', asset: 'פארק', title: 'עובדות ונפגשות בפארק', summary: 'מפגש קבוע בפארק שבו הילדים משחקים וההורים יוצרות יחד זמן עבודה גמיש.', how: 'בוחרות פארק, שעות ומבוגרות אחראיות לכל מפגש.', needed: 'פארק קרוב, כמה הורים ותיאום ציפיות.', fit: 'מתאים למי שמחפשת קהילה קרובה וגמישות סביב היום.', draft: { title: 'מחפשות שותפות לבקרים בפארק', description: 'רוצות לנסות מפגש בוקר קבוע בפארק: הילדים יחד ואנחנו מפנות זמן לעבודה או למפגש.', place: 'פארק קרוב', peopleNeeded: 'עוד הורים', daysTimes: 'בקרים, פעם או פעמיים בשבוע' } },
    'host-home': { id: 'host-home', asset: 'בית / חצר', title: 'בית או חצר מארחים', summary: 'בית או חצר הופכים למקום קבוע למפגש קטן של משפחות.', how: 'מארחת או מארח מציעים מקום, והקבוצה מסכימה יחד על שימוש ותיאום.', needed: 'בית או חצר, קבוצה קטנה וכללי אירוח.', fit: 'מתאים כשכבר יש מקום נעים שרוצים לפתוח לעוד משפחות.', draft: { title: 'פותחות בית או חצר למפגשים קטנים', description: 'יש לנו מקום שיכול לארח מפגש קטן של משפחות, ונשמח לבדוק קבוצה קבועה בתיאום משותף.', place: 'בית / חצר', peopleNeeded: 'משפחות נוספות' } },
    'educator-families': { id: 'educator-families', asset: 'אשת חינוך', title: 'משפחות יחד עם אשת חינוך', summary: 'כמה משפחות בוחנות מסגרת קטנה עם אשת חינוך שמתאימה לקצב שלהן.', how: 'מגדירות יחד ימים, מקום, אחריות ותקציב לפני שמחליטים.', needed: 'משפחות, אשת חינוך ותיאום ברור.', fit: 'מתאים למי שמחפשת פתרון קבוצתי עם ניסיון חינוכי.', draft: { title: 'בוחנות קבוצה קטנה עם אשת חינוך', description: 'מחפשות משפחות שרוצות לבחון יחד קבוצה קטנה עם אשת חינוך, בקצב ובתנאים שנגדיר יחד.', educator: 'אשת חינוך', peopleNeeded: 'משפחות נוספות' } },
    'studio-mornings': { id: 'studio-mornings', asset: 'סטודיו / חדר פנוי', title: 'סטודיו או חדר לבקרים קבועים', summary: 'חלל פנוי יכול להפוך לנקודת מפגש קבועה לפעילות, עבודה וקרבה לילדים.', how: 'בודקות שימוש מתאים, זמינות ועלויות לפני שמתחייבות.', needed: 'חלל פנוי, משפחות ותיאום שימוש.', fit: 'מתאים למי שכבר מכירה חלל שיכול לשרת קבוצה קטנה.', draft: { title: 'מחפשות שותפות לבקרים בסטודיו', description: 'רוצות לבחון שימוש קבוע בסטודיו או חדר פנוי לבקרים משותפים למשפחות.', place: 'סטודיו / חדר פנוי', peopleNeeded: 'משפחות נוספות', daysTimes: 'בקרים קבועים' } }
  };

  const initialState = () => ({ route: { name: 'discover' }, context: { entityType: null, entityId: null }, ui: { overlay: null }, auth: { status: 'anonymous' }, flow: { type: null, step: null, draft: null, targetId: null, targetType: null, validationErrors: [] }, search: { answers: { need: '', area: '', context: '' }, outcome: null }, savedIntents: [], createdItems: [], pendingAction: null });
  let appState = initialState();

  const heading = (eyebrow, title, lede = '') => `<p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}`;
  const actionButton = (label, action, extra = '') => `<button class="primary" data-action="${action}"${extra}>${label} <span>←</span></button>`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const isRecord = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  const textValue = value => typeof value === 'string' ? value : '';
  const normalizeContext = value => isRecord(value) ? { entityType: typeof value.entityType === 'string' ? value.entityType : null, entityId: typeof value.entityId === 'string' ? value.entityId : null } : { entityType: null, entityId: null };

  const draftFields = ['title', 'area', 'description', 'childAges', 'daysTimes', 'place', 'educator', 'activity', 'budget', 'peopleNeeded', 'serviceType', 'availability', 'capacity', 'childSuitability', 'facilities', 'price', 'photos'];
  const makeDraft = (type, value = {}) => {
    const draft = { id: typeof value.id === 'string' && value.id ? value.id : `draft-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type };
    draftFields.forEach(field => { draft[field] = textValue(value[field]); });
    draft.createdFrom = value.createdFrom === 'search' ? 'search' : value.createdFrom === 'inspiration' && inspirationModels[value.inspirationModelId] ? 'inspiration' : null;
    draft.searchAnswers = value.createdFrom === 'search' ? normalizeSearchAnswers(value.searchAnswers) : null;
    draft.inspirationModelId = value.createdFrom === 'inspiration' && inspirationModels[value.inspirationModelId] ? value.inspirationModelId : null;
    return draft;
  };
  const normalizeDraft = (value, expectedType = null) => {
    if (!isRecord(value) || !createTypes.has(value.type) || (expectedType && value.type !== expectedType)) return null;
    return makeDraft(value.type, value);
  };
  const normalizeFlow = value => {
    const defaults = initialState().flow;
    if (!isRecord(value)) return defaults;
    const type = createTypes.has(value.type) ? value.type : (typeof value.type === 'string' ? value.type : null);
    const replacement = isRecord(value.draftReplacement) && (value.draftReplacement.source === 'search' || (value.draftReplacement.source === 'inspiration' && inspirationModels[value.draftReplacement.inspirationModelId])) ? { source: value.draftReplacement.source, inspirationModelId: value.draftReplacement.source === 'inspiration' ? value.draftReplacement.inspirationModelId : null } : null;
    return { ...defaults, type, step: typeof value.step === 'string' ? value.step : null, draft: normalizeDraft(value.draft, createTypes.has(type) ? type : null), targetId: typeof value.targetId === 'string' ? value.targetId : null, targetType: typeof value.targetType === 'string' ? value.targetType : null, draftReplacement: replacement, validationErrors: Array.isArray(value.validationErrors) ? value.validationErrors.filter(item => typeof item === 'string').slice(0, 5) : [] };
  };
  const normalizeCreatedItem = value => {
    if (!isRecord(value) || typeof value.id !== 'string' || !createTypes.has(value.type)) return null;
    return { ...makeDraft(value.type, value), publishedAt: typeof value.publishedAt === 'number' ? value.publishedAt : 0 };
  };
  const normalizeCreatedItems = value => Array.isArray(value) ? value.map(normalizeCreatedItem).filter(Boolean).slice(-30) : [];

  const searchOptions = {
    need: new Set(['people', 'initiatives', 'places', 'care', 'jobs', 'services', 'collaboration', 'learning', 'unsure']),
    area: new Set(['פתח תקווה', 'הוד השרון', 'Online', 'Hybrid', 'אזור אחר']),
    context: new Set(['mornings', 'hybrid', 'remote', 'flexible'])
  };
  function normalizeSearchAnswers(value) {
    const source = isRecord(value) ? value : {};
    return {
      need: searchOptions.need.has(source.need) ? source.need : '',
      area: searchOptions.area.has(source.area) ? source.area : '',
      context: searchOptions.context.has(source.context) ? source.context : ''
    };
  }
  const normalizeSearch = value => {
    const answers = normalizeSearchAnswers(isRecord(value) ? value.answers : null);
    const outcome = isRecord(value) && ['results', 'partial', 'no-results'].includes(value.outcome) ? value.outcome : null;
    return { answers, outcome };
  };
  const intentIdFor = answers => {
    const canonical = `${answers.need}|${answers.area}|${answers.context}`;
    let hash = 2166136261;
    for (let index = 0; index < canonical.length; index += 1) hash = Math.imul(hash ^ canonical.charCodeAt(index), 16777619);
    return `intent-${(hash >>> 0).toString(36)}`;
  };
  const normalizeSavedIntent = value => {
    if (!isRecord(value)) return null;
    const answers = normalizeSearchAnswers(value.answers);
    if (!answers.need || !answers.area || !answers.context || value.id !== intentIdFor(answers)) return null;
    return { id: value.id, answers, private: true, savedAt: typeof value.savedAt === 'number' ? value.savedAt : 0 };
  };
  const normalizeSavedIntents = value => Array.isArray(value) ? [...new Map(value.map(normalizeSavedIntent).filter(Boolean).map(intent => [intent.id, intent])).values()].slice(-30) : [];

  const seedByTypeAndId = (type, id) => Object.values(seed).find(item => item.type === type && item.id === id) || null;
  const routeParts = (route, createdItems = appState.createdItems) => {
    const value = String(route || '');
    if (/^create\/(initiative|offering|place|post)$/.test(value)) return { name: value, entityType: 'create', entityId: value.split('/')[1] };
    if (value === 'preview') return { name: value, entityType: 'preview', entityId: null };
    if (searchRoutes.has(value)) return { name: value, entityType: 'search', entityId: value.split('/')[1] };
    if (value === 'inspiration') return { name: value, entityType: 'inspiration', entityId: null };
    const inspiration = /^inspiration\/([^/]+)$/.exec(value);
    if (inspiration && inspirationModels[inspiration[1]]) return { name: value, entityType: 'inspiration', entityId: inspiration[1] };
    const success = /^publish-success\/([^/]+)$/.exec(value);
    if (success && createdItems.some(item => item.id === success[1])) return { name: value, entityType: 'created', entityId: success[1] };
    const match = /^([^/]+)\/([^/]+)$/.exec(value);
    if (!match || !routeRegistry.has(match[1])) return null;
    const type = match[1] === 'offering-detail' ? 'offering' : match[1].replace(/-detail$/, '');
    return seedByTypeAndId(type, match[2]) ? { name: `${match[1]}/${match[2]}`, entityType: type, entityId: match[2] } : null;
  };
  const resolveRoute = (route, createdItems = appState.createdItems) => {
    if (route === 'discover' || route === 'inspiration' || route === 'mine' || route === 'preview' || searchRoutes.has(route)) return route;
    return routeParts(route, createdItems)?.name || 'discover';
  };

  const normalizePendingAction = value => {
    if (!isRecord(value) || value.version !== pendingVersion || !['join', 'connect', 'publish', 'save-intent'].includes(value.actionType)) return null;
    if (typeof value.id !== 'string' || typeof value.originRoute !== 'string' || typeof value.createdAt !== 'number') return null;
    const originRoute = resolveRoute(value.originRoute);
    if (originRoute === 'discover' && value.originRoute !== 'discover') return null;
    if (!isRecord(value.originContext) || !isRecord(value.payload) || value.continuation !== value.actionType) return null;
    if (value.actionType === 'publish') {
      if (value.originRoute !== 'preview' || typeof value.payload.draftId !== 'string' || !createTypes.has(value.payload.draftType)) return null;
    } else if (value.actionType === 'save-intent') {
      const answers = normalizeSearchAnswers(value.payload.answers);
      if (!resultRoutes.has(originRoute) || !answers.need || !answers.area || !answers.context || value.payload.intentId !== intentIdFor(answers)) return null;
      value = { ...value, payload: { intentId: value.payload.intentId, answers } };
    } else {
      const expectedType = value.actionType === 'join' ? 'initiative' : 'offering';
      if (value.payload.entityType !== expectedType || typeof value.payload.entityId !== 'string') return null;
    }
    return { id: value.id, actionType: value.actionType, originRoute, originContext: normalizeContext(value.originContext), payload: value.payload, continuation: value.continuation, createdAt: value.createdAt, version: pendingVersion };
  };

  const normalizePersistedState = value => {
    const defaults = initialState();
    if (!isRecord(value)) return defaults;
    const createdItems = normalizeCreatedItems(value.createdItems);
    const savedIntents = normalizeSavedIntents(value.savedIntents);
    const status = isRecord(value.auth) && (value.auth.status === 'anonymous' || value.auth.status === 'authenticated') ? value.auth.status : defaults.auth.status;
    const overlayType = isRecord(value.ui) ? value.ui.overlay?.type : null;
    return { ...defaults, route: { name: resolveRoute(isRecord(value.route) ? value.route.name : defaults.route.name, createdItems) }, context: normalizeContext(value.context), ui: { overlay: ['start', 'create-choices', 'account-gate', 'save-intent-consent', 'replace-draft-confirm'].includes(overlayType) ? { type: overlayType } : null }, auth: { status }, flow: normalizeFlow(value.flow), search: normalizeSearch(value.search), savedIntents, createdItems, pendingAction: normalizePendingAction(value.pendingAction) };
  };
  const readPersistedState = () => {
    try { const value = sessionStorage.getItem(stateKey); return value ? normalizePersistedState(JSON.parse(value)) : null; } catch (_) { sessionStorage.removeItem(stateKey); return null; }
  };
  const persistState = state => { try { sessionStorage.setItem(stateKey, JSON.stringify({ flow: state.flow, search: state.search, savedIntents: state.savedIntents, auth: state.auth, pendingAction: state.pendingAction, context: state.context, route: state.route, ui: state.ui, createdItems: state.createdItems })); } catch (_) { /* memory remains authoritative */ } };
  const transition = patch => {
    appState = { ...appState, ...patch, route: patch.route ? { ...appState.route, ...patch.route } : appState.route, context: patch.context ? { ...appState.context, ...patch.context } : appState.context, ui: patch.ui ? { ...appState.ui, ...patch.ui } : appState.ui, auth: patch.auth ? { ...appState.auth, ...patch.auth } : appState.auth, flow: patch.flow ? { ...appState.flow, ...patch.flow } : appState.flow, search: patch.search ? { ...appState.search, ...patch.search } : appState.search, savedIntents: patch.savedIntents || appState.savedIntents, createdItems: patch.createdItems || appState.createdItems };
    persistState(appState);
    return appState;
  };

  const createdById = id => appState.createdItems.find(item => item.id === id) || null;
  const routeForEntity = (type, id) => `${type === 'job' ? 'job' : type === 'offering' ? 'offering-detail' : `${type}-detail`}/${id}`;
  const searchCandidates = answers => Object.values(seed).filter(item => answers.need === 'unsure' || item.searchKinds.includes(answers.need));
  const evaluateSearch = answers => {
    const candidates = searchCandidates(answers);
    const matches = candidates.filter(item => item.area === answers.area && item.searchContexts.includes(answers.context));
    if (matches.length) return { outcome: 'results', matches };
    if (candidates.length) return { outcome: 'partial', matches: candidates };
    return { outcome: 'no-results', matches: [] };
  };
  const validCompleteSearch = search => Boolean(search.answers.need && search.answers.area && search.answers.context);
  const routeFromLocation = () => window.location.hash.replace(/^#/, '').trim() || 'discover';
  const writeLocation = (route, replace) => { const hash = `#${route}`; if (window.location.hash !== hash) window.history[replace ? 'replaceState' : 'pushState']({}, '', hash); };
  const navigate = (requestedRoute, options = {}) => {
    const route = resolveRoute(requestedRoute);
    writeLocation(route, Boolean(options.replace));
    const parsed = routeParts(route);
    const context = parsed && ['initiative', 'place', 'offering', 'job', 'inspiration'].includes(parsed.entityType) ? { entityType: parsed.entityType, entityId: parsed.entityId } : { entityType: null, entityId: null };
    transition({ route: { name: route }, context, ui: { overlay: null } });
    render(appState);
  };
  const restoreRouteAndContext = () => {
    const persisted = readPersistedState() || initialState();
    const requested = routeFromLocation();
    let route = resolveRoute(requested, persisted.createdItems);
    let flow = persisted.flow;
    let ui = persisted.ui;
    let pendingAction = persisted.pendingAction;
    let search = persisted.search;
    const createMatch = /^create\/(initiative|offering|place|post)$/.exec(route);
    if (createMatch && (!flow.draft || flow.draft.type !== createMatch[1])) flow = { ...flow, type: createMatch[1], step: 'form', draft: makeDraft(createMatch[1]), validationErrors: [] };
    if (route === 'preview' && (!flow.draft || !createTypes.has(flow.draft.type))) { route = 'discover'; ui = { overlay: null }; pendingAction = null; }
    if (/^publish-success\//.test(route) && !routeParts(route, persisted.createdItems)) { route = 'discover'; ui = { overlay: null }; pendingAction = null; }
    if (route === 'search/q2' && !search.answers.need) route = 'search/q1';
    if (route === 'search/q3' && (!search.answers.need || !search.answers.area)) route = search.answers.need ? 'search/q2' : 'search/q1';
    if (resultRoutes.has(route)) {
      if (!validCompleteSearch(search)) route = !search.answers.need ? 'search/q1' : !search.answers.area ? 'search/q2' : 'search/q3';
      else {
        const evaluated = evaluateSearch(search.answers);
        route = `search/${evaluated.outcome}`;
        search = { ...search, outcome: evaluated.outcome };
      }
    }
    if (ui.overlay?.type === 'save-intent-consent' && !resultRoutes.has(route)) ui = { overlay: null };
    if (ui.overlay?.type === 'replace-draft-confirm' && !resultRoutes.has(route) && !/^inspiration\/[^/]+$/.test(route)) ui = { overlay: null };
    const parsed = routeParts(route, persisted.createdItems);
    const context = parsed && ['initiative', 'place', 'offering', 'job', 'inspiration'].includes(parsed.entityType) ? { entityType: parsed.entityType, entityId: parsed.entityId } : { entityType: null, entityId: null };
    transition({ route: { name: route }, context, ui, auth: persisted.auth, flow, search, savedIntents: persisted.savedIntents, pendingAction, createdItems: persisted.createdItems });
    writeLocation(route, true);
    render(appState);
  };

  const renderCard = kind => { const item = seed[kind]; return `<article class="card ${kind === 'initiative' ? 'featured' : ''}"><span class="context">${item.eyebrow}</span><h2>${item.title}</h2><p>${item.description}</p><div class="signals"><span>מתאים להורים</span><span>${kind === 'job' ? 'חלקית' : 'אזור כללי'}</span></div>${actionButton('לפרטים', 'open-detail', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`)}</article>`; };
  const renderDiscover = () => `<section class="intro">${heading('קהילה שמפנה מקום לשני הצדדים', 'גם לעבוד.<br><em>גם להיות קרובים.</em>', 'להמשיך לעבוד, ללמוד ולהתפתח — תוך קרבה לילדים.')}${actionButton('מה יעזור לך עכשיו?', 'open-start')}</section><nav class="filters"><button class="filter active" data-action="navigate" data-route="discover">הכול</button><button class="filter" data-action="navigate" data-route="inspiration">השראה</button><button class="filter" data-action="navigate" data-route="discover">עבודה והתפתחות</button></nav><section class="feed"><div style="grid-column:span 7">${renderCard('initiative')}</div><div class="split-cards"><div class="place">${renderCard('place')}</div><div class="care">${renderCard('offer')}</div></div>${renderCard('job')}<article class="inspiration-card"><div>${heading('לא בטוחה מה אפשר לעשות?', 'יש מודלים שאפשר להתחיל מהם', 'דוגמאות קטנות למה שגם וגם יכול להיראות — ואז עורכות את זה כך שיתאים לך.')}</div><button class="secondary" data-action="navigate" data-route="inspiration">לכל ההשראות</button></article><article class="action-card">${heading('לא מצאת עדיין?', 'ספרי מה יעזור לך — ונחפש.')}${actionButton('להתחיל לחפש', 'begin-search')}</article></section>`;
  const renderDetail = state => { const item = seedByTypeAndId(state.context.entityType, state.context.entityId); if (!item) return renderDiscover(state); const protectedAction = item.type === 'initiative' ? actionButton('להצטרף ליוזמה', 'join', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`) : item.type === 'offering' ? actionButton('להתחבר', 'connect', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`) : ''; const confirmed = state.flow.step === 'confirmed' && state.flow.targetId === item.id; const confirmation = confirmed ? `<div class="confirmation" role="status"><p class="eyebrow">הפעולה הושלמה</p><h2>${state.flow.type === 'join' ? 'הצטרפת ליוזמה' : 'בקשת החיבור נשלחה'}</h2><p>${item.title}</p></div>` : protectedAction; return `<section class="intro detail-view"><button class="text-link" data-action="navigate" data-route="discover">← חזרה לגילוי</button>${heading(item.eyebrow, item.title, item.description)}<div class="detail-meta"><p>${item.area}</p><span>מתאים להורים</span></div>${confirmation}</section>`; };
  const renderInspiration = state => {
    const model = state.context.entityId ? inspirationModels[state.context.entityId] : null;
    if (state.context.entityId && !model) return renderDiscover(state);
    if (model) return `<section class="intro detail-view inspiration-detail" data-testid="inspiration-detail" data-inspiration-model-id="${model.id}"><button class="text-link" data-action="navigate" data-route="inspiration">← חזרה להשראה</button>${heading(`השראה · ${model.asset}`, model.title, model.summary)}<div class="preview-card"><p><strong>איך זה עובד:</strong> ${model.how}</p><p><strong>מה צריך:</strong> ${model.needed}</p><p><strong>למה זה עשוי להתאים:</strong> ${model.fit}</p></div><div class="form-actions">${actionButton('זה יכול להתאים לי', 'request-inspiration-draft', ` data-inspiration-model-id="${model.id}"`)}</div></section>`;
    const cards = Object.values(inspirationModels).map(item => `<article class="inspiration-card" data-inspiration-card-id="${item.id}"><div><span class="context">מתחילים ממה שכבר יש · ${item.asset}</span><h2>${item.title}</h2><p>${item.summary}</p></div><button class="secondary" data-action="open-inspiration" data-inspiration-model-id="${item.id}">לפרטים</button></article>`).join('');
    return `<section class="intro inspiration-view" data-testid="inspiration-library"><button class="text-link" data-action="navigate" data-route="discover">← חזרה לגילוי</button>${heading('השראה', 'מודלים שאפשר להתחיל מהם', 'אלה דוגמאות, לא מסלול קבוע. אפשר לפתוח אחת, לערוך אותה, ורק אז לבחור אם לפרסם.')}<div class="created-list">${cards}</div></section>`;
  };

  const needLabels = { people: 'אנשים ומשפחות', initiatives: 'יוזמות', places: 'מקומות', care: 'חינוך וטיפול', jobs: 'עבודה', services: 'עזרה ושירותים מקצועיים', collaboration: 'שיתוף פעולה', learning: 'למידה ועזרה', unsure: 'עוד לא בטוחה' };
  const contextLabels = { mornings: 'בקרים', hybrid: 'גמיש / היברידי', remote: 'מרחוק', flexible: 'לא משנה כרגע' };
  const searchChoice = (fieldName, value, label, selected) => `<button class="search-choice${selected === value ? ' selected' : ''}" data-action="answer-search" data-search-field="${fieldName}" data-search-value="${escapeHtml(value)}">${label}</button>`;
  const renderSearchQuestion = (state, step) => {
    const answers = state.search.answers;
    if (step === 'q1') return `<section class="intro search-view" data-testid="search-q1"><button class="text-link" data-action="navigate" data-route="discover">← חזרה לגילוי</button>${heading('חיפוש · 1 מתוך 3', 'מה יעזור לך עכשיו?', 'הבחירה נשארת חיפוש פרטי עד שתבחרי לשמור או לפרסם.')}<div class="search-choices">${Object.entries(needLabels).map(([value, label]) => searchChoice('need', value, label, answers.need)).join('')}</div></section>`;
    if (step === 'q2') return `<section class="intro search-view" data-testid="search-q2"><button class="text-link" data-action="navigate" data-route="search/q1">← לשאלה הקודמת</button>${heading('חיפוש · 2 מתוך 3', 'באיזה אזור?', `מחפשות ${needLabels[answers.need] || 'משהו מתאים'}.`)}<div class="search-choices">${[...searchOptions.area].map(value => searchChoice('area', value, value, answers.area)).join('')}</div></section>`;
    return `<section class="intro search-view" data-testid="search-q3"><button class="text-link" data-action="navigate" data-route="search/q2">← לשאלה הקודמת</button>${heading('חיפוש · 3 מתוך 3', 'מה ההקשר שמתאים לך?', 'אפשר לשנות את כל התשובות גם אחר כך.')}<div class="search-choices">${Object.entries(contextLabels).map(([value, label]) => searchChoice('context', value, label, answers.context)).join('')}</div></section>`;
  };
  const renderSearchResultCard = (item, partial) => `<article class="card search-result" data-search-result-id="${item.id}"><span class="context">${partial ? 'התאמה חלקית · ' : ''}${item.eyebrow}</span><h2>${item.title}</h2><p>${item.description}</p>${actionButton('לפרטים', 'open-detail', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`)}</article>`;
  const renderSearchOutcome = state => {
    const evaluated = evaluateSearch(state.search.answers);
    const isSaved = state.savedIntents.some(intent => intent.id === intentIdFor(state.search.answers));
    const content = evaluated.outcome === 'results'
      ? heading('מצאנו התאמות', 'יש כאן משהו שיכול להתאים', 'אלה תוצאות מתוך התוכן שכבר קיים באתר.')
      : evaluated.outcome === 'partial'
        ? heading('התאמה חלקית', 'מצאנו כיוון, אבל לא הכול מסתדר', 'התוצאות קשורות למה שחיפשת, אך האזור או ההקשר שונים.')
        : heading('אין תוצאה מתאימה כרגע', 'אפשר להרחיב את החיפוש או לספר מה צריך', 'לא ניצור התאמה מלאכותית. החיפוש עצמו עדיין לא נשמר ולא פורסם.');
    const cards = evaluated.matches.map(item => renderSearchResultCard(item, evaluated.outcome === 'partial')).join('');
    const savedNotice = isSaved ? '<div class="confirmation compact-confirmation" role="status" data-testid="intent-saved">הכוונה הזאת נשמרה באופן פרטי ב״שלי״.</div>' : '';
    const inspirationAction = evaluated.outcome === 'no-results' ? '<button class="secondary" data-action="navigate" data-route="inspiration">לראות מודלים להשראה</button>' : '';
    return `<section class="intro search-view search-outcome" data-testid="search-${evaluated.outcome}"><button class="text-link" data-action="navigate" data-route="search/q3">← לעריכת התשובה האחרונה</button>${content}${savedNotice}${cards ? `<div class="search-results">${cards}</div>` : ''}<div class="search-next-actions"><button class="secondary" data-action="edit-search">לשנות או להרחיב חיפוש</button>${isSaved ? '' : actionButton('לשמור כוונה באופן פרטי', 'request-save-intent')}${inspirationAction}<button class="secondary" data-action="publish-search-need">לפרסם מה אני צריכה</button></div></section>`;
  };

  const field = (label, name, value, multiline = false, required = false) => `<label class="field"><span>${label}${required ? ' *' : ''}</span>${multiline ? `<textarea name="${name}" data-field="${name}" rows="4">${escapeHtml(value)}</textarea>` : `<input name="${name}" data-field="${name}" value="${escapeHtml(value)}" autocomplete="off">`}</label>`;
  const draftTypeLabel = type => ({ initiative: 'יוזמה', offering: 'הצעה', place: 'מקום', post: 'בקשה' }[type] || 'יצירה');
  const renderCreateForm = state => {
    const draft = state.flow.draft;
    if (!draft) return renderDiscover(state);
    const optional = draft.type === 'initiative' ? `${field('גילאי הילדים', 'childAges', draft.childAges)}${field('ימים ושעות', 'daysTimes', draft.daysTimes)}${field('מקום', 'place', draft.place)}${field('צוות / מדריכה', 'educator', draft.educator)}${field('פעילות', 'activity', draft.activity)}${field('תקציב', 'budget', draft.budget)}${field('כמה אנשים צריך', 'peopleNeeded', draft.peopleNeeded)}` : draft.type === 'offering' ? `${field('סוג ההצעה', 'serviceType', draft.serviceType)}${field('מחיר', 'price', draft.price)}` : draft.type === 'place' ? `${field('סוג המקום / שימוש', 'place', draft.place)}${field('זמינות', 'availability', draft.availability)}${field('קיבולת', 'capacity', draft.capacity)}${field('מתאים לילדים', 'childSuitability', draft.childSuitability)}${field('מתקנים', 'facilities', draft.facilities)}${field('מחיר', 'price', draft.price)}${field('תמונות', 'photos', draft.photos)}` : '';
    const backRoute = draft.createdFrom === 'search' ? `search/${evaluateSearch(draft.searchAnswers).outcome}` : draft.createdFrom === 'inspiration' && draft.inspirationModelId ? `inspiration/${draft.inspirationModelId}` : 'discover';
    const provenance = draft.createdFrom === 'search' ? '<p class="privacy-note" data-testid="search-provenance">טיוטה שנוצרה מהחיפוש. היא ניתנת לעריכה ולא תפורסם בלי אישור מפורש.</p>' : draft.createdFrom === 'inspiration' && draft.inspirationModelId ? `<p class="privacy-note" data-testid="inspiration-provenance">טיוטה שנוצרה מהשראה: ${escapeHtml(inspirationModels[draft.inspirationModelId].title)}. היא ניתנת לעריכה ולא תפורסם בלי אישור מפורש.</p>` : '';
    return `<section class="intro creation-view" data-testid="create-form"><button class="text-link" data-action="navigate" data-route="${backRoute}">← ביטול</button>${heading(`יצירת ${draftTypeLabel(draft.type)}`, `יוצרות ${draftTypeLabel(draft.type)}`, 'אפשר לערוך הכול לפני הפרסום.')} ${provenance}<div class="creation-form">${field(draft.type === 'place' ? 'שם המקום' : 'כותרת', 'title', draft.title, false, true)}${field('אזור או Online', 'area', draft.area, false, true)}${field('מה חשוב לדעת', 'description', draft.description, true, true)}${optional}<div class="form-actions">${actionButton('לתצוגה מקדימה', 'preview-draft')}<button class="secondary" data-action="navigate" data-route="${backRoute}">לשמור ולהמשיך אחר כך</button></div></div></section>`;
  };
  const validateDraft = draft => { const errors = []; if (!draft || !draft.title.trim()) errors.push('צריך להוסיף כותרת.'); if (!draft || !draft.area.trim()) errors.push('צריך להוסיף אזור או לציין Online.'); if (!draft || draft.description.trim().length < 5) errors.push('צריך להוסיף תיאור קצר וברור.'); return errors; };
  const renderPreview = state => {
    const draft = state.flow.draft;
    if (!draft) return renderDiscover(state);
    const errors = state.flow.validationErrors || [];
    const errorBlock = errors.length ? `<div class="validation" role="alert" data-testid="publish-validation"><strong>עוד רגע — חסר מידע לפרסום:</strong><ul>${errors.map(error => `<li>${escapeHtml(error)}</li>`).join('')}</ul><p>אפשר לחזור לעריכה ולהשלים את הטיוטה.</p></div>` : '';
    const provenance = draft.createdFrom === 'inspiration' && draft.inspirationModelId ? `<p class="privacy-note" data-testid="inspiration-preview-provenance">מבוסס על השראה: ${escapeHtml(inspirationModels[draft.inspirationModelId].title)}</p>` : '';
    return `<section class="intro creation-view" data-testid="preview"><button class="text-link" data-action="edit-draft">← עריכת הטיוטה</button>${heading(`תצוגה מקדימה · ${draftTypeLabel(draft.type)}`, draft.title || 'טיוטה ללא כותרת', draft.description || 'עדיין לא הוספת תיאור.')}${errorBlock}${provenance}<div class="preview-card"><p class="eyebrow">${escapeHtml(draft.area || 'אזור לא הוגדר')}</p><h2>${escapeHtml(draft.title || 'ללא כותרת')}</h2><p>${escapeHtml(draft.description || 'אין עדיין תיאור')}</p>${draft.serviceType ? `<p><strong>סוג ההצעה:</strong> ${escapeHtml(draft.serviceType)}</p>` : ''}${draft.place ? `<p><strong>מקום / שימוש:</strong> ${escapeHtml(draft.place)}</p>` : ''}</div><div class="form-actions">${actionButton('לפרסם', 'publish-draft')}<button class="secondary" data-action="edit-draft">לחזור לעריכה</button></div></section>`;
  };
  const renderSuccess = state => { const item = createdById(state.context.entityId || state.flow.targetId); if (!item) return renderDiscover(state); return `<section class="intro creation-view publish-success" data-testid="publish-success">${heading('הפרסום הצליח', 'זה באוויר 🎉', 'הפרסום נשמר בחשבון ההדגמה שלך.')}<div class="preview-card"><p class="eyebrow">${draftTypeLabel(item.type)} · ${escapeHtml(item.area)}</p><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p></div><div class="form-actions"><button class="primary" data-action="navigate" data-route="mine">לראות ב״שלי״ <span>←</span></button><button class="secondary" data-action="start">ליצור עוד משהו</button></div></section>`; };
  const renderMine = state => {
    const items = state.createdItems || [];
    const cards = items.length ? items.map(item => `<article class="card created-item" data-created-id="${escapeHtml(item.id)}"><span class="context">${draftTypeLabel(item.type)} · ${escapeHtml(item.area)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p><span class="signals"><span>פורסם בחשבון שלך</span>${item.createdFrom === 'search' ? '<span>נוצר מחיפוש</span>' : ''}${item.createdFrom === 'inspiration' && item.inspirationModelId ? `<span data-testid="inspiration-created-provenance">נוצר מהשראה · ${escapeHtml(inspirationModels[item.inspirationModelId].title)}</span>` : ''}</span></article>`).join('') : '<p class="lede">עדיין אין כאן פרסומים.</p>';
    const intents = state.savedIntents.length ? state.savedIntents.map(intent => `<article class="card saved-intent" data-saved-intent-id="${intent.id}"><span class="context">כוונה פרטית</span><h2>${escapeHtml(needLabels[intent.answers.need])}</h2><p>${escapeHtml(intent.answers.area)} · ${escapeHtml(contextLabels[intent.answers.context])}</p><span class="signals"><span>גלוי רק לך</span><span>לא פורסם</span></span></article>`).join('') : '<p class="lede">עדיין לא שמרת כוונות פרטיות.</p>';
    return `<section class="intro mine-view" data-testid="mine"><button class="text-link" data-action="navigate" data-route="discover">← חזרה לגילוי</button>${heading('שלי', 'הדברים שלי', 'פרסומים וכוונות פרטיות נשמרים כאן בנפרד.')}<h2 class="section-title">הפרסומים שלי</h2><div class="created-list">${cards}</div><h2 class="section-title">כוונות שמורות</h2><p class="privacy-note">הכוונות האלה פרטיות ואינן פוסט ציבורי.</p><div class="created-list">${intents}</div></section>`;
  };

  const renderOverlay = overlay => {
    if (!overlay) return '';
    if (overlay.type === 'account-gate') return `<div class="scrim open" data-action="cancel-gate"></div><section class="sheet open account-gate" role="dialog" aria-modal="true"><button class="close" data-action="cancel-gate">×</button>${heading('נדרש חשבון', 'מתחברות כדי להמשיך', 'זהו חשבון הדגמה — ללא פרטים אישיים.')}<div class="sheet-options"><button data-action="demo-auth">להתחבר ולהמשיך</button><button data-action="cancel-gate">ביטול</button></div></section>`;
    if (overlay.type === 'save-intent-consent') return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="save-intent-consent"><button class="close" data-action="close-overlay">×</button>${heading('שמירה פרטית', 'לשמור את הכוונה הזאת?', 'התשובות יישמרו בחשבון שלך להתאמות עתידיות. הן לא יפורסמו כפוסט.')}<div class="sheet-options"><button data-action="confirm-save-intent">כן, לשמור באופן פרטי</button><button data-action="close-overlay">לא עכשיו</button></div></section>`;
    if (overlay.type === 'replace-draft-confirm') return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="replace-draft-confirm"><button class="close" data-action="close-overlay">×</button>${heading('יש טיוטה אחרת', 'להחליף את הטיוטה הקיימת?', 'הטיוטה הקיימת תוחלף רק אם תאשרי. שום דבר לא מתפרסם בשלב הזה.')}<div class="sheet-options"><button data-action="confirm-replace-draft">להחליף וליצור טיוטה</button><button data-action="close-overlay">לשמור את הטיוטה הקיימת</button></div></section>`;
    if (overlay.type === 'create-choices') return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="create-choices"><button class="close" data-action="close-overlay">×</button>${heading('ליצור משהו', 'מה תרצי ליצור?')}<div class="sheet-options"><button data-action="create-type" data-create-type="initiative">🌱 יוזמה</button><button data-action="create-type" data-create-type="place">🏡 מקום</button></div></section>`;
    if (overlay.type !== 'start') return '';
    return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="start-sheet"><button class="close" data-action="close-overlay">×</button>${heading('הצעד הראשון', 'מה היית רוצה לעשות?')}<div class="sheet-options"><button data-action="start-create">🌱 ליצור משהו</button><button data-action="start-find">🔎 למצוא משהו</button><button data-action="start-offer">✨ להציע משהו</button></div></section>`;
  };
  const rendererRegistry = { discover: renderDiscover, inspiration: renderInspiration, mine: renderMine, preview: renderPreview, 'initiative-detail': renderDetail, 'place-detail': renderDetail, 'offering-detail': renderDetail, job: renderDetail };
  const render = state => { const route = state.route.name; let html; if (/^search\/(q1|q2|q3)$/.test(route)) html = renderSearchQuestion(state, route.split('/')[1]); else if (resultRoutes.has(route)) html = renderSearchOutcome(state); else if (/^create\//.test(route)) html = renderCreateForm(state); else if (route === 'preview') html = renderPreview(state); else if (/^publish-success\//.test(route)) html = renderSuccess(state); else { const baseRoute = route.split('/')[0]; const renderer = rendererRegistry[route] || rendererRegistry[baseRoute] || rendererRegistry.discover; html = renderer(state); } appRoot.innerHTML = html; overlayRoot.innerHTML = renderOverlay(state.ui.overlay); };

  const beginCreate = type => { if (!createTypes.has(type)) return; const draft = makeDraft(type); transition({ flow: { type, step: 'form', draft, validationErrors: [] }, ui: { overlay: null } }); navigate(`create/${type}`); };
  const buildSearchDraft = answers => makeDraft('post', {
    id: `draft-search-${intentIdFor(answers)}`,
    title: `מחפשת ${needLabels[answers.need]}`,
    area: answers.area,
    description: `אני מחפשת ${needLabels[answers.need]} באזור ${answers.area}, בהקשר של ${contextLabels[answers.context]}.`,
    createdFrom: 'search',
    searchAnswers: answers
  });
  const beginSearchDraft = () => {
    if (!validCompleteSearch(appState.search)) return;
    const draft = buildSearchDraft(appState.search.answers);
    transition({ flow: { type: 'post', step: 'form', draft, draftReplacement: null, validationErrors: [] }, ui: { overlay: null } });
    navigate('create/post');
  };
  const requestSearchDraft = () => {
    if (!validCompleteSearch(appState.search) || !resultRoutes.has(appState.route.name)) return;
    const existing = normalizeDraft(appState.flow.draft, appState.flow.type);
    const sameSearch = existing?.createdFrom === 'search' && intentIdFor(existing.searchAnswers) === intentIdFor(appState.search.answers);
    if (sameSearch) { navigate('create/post'); return; }
    if (existing) { transition({ flow: { draftReplacement: { source: 'search', inspirationModelId: null } }, ui: { overlay: { type: 'replace-draft-confirm' } } }); render(appState); return; }
    beginSearchDraft();
  };
  const buildInspirationDraft = model => makeDraft('initiative', {
    id: `draft-inspiration-${model.id}`,
    title: model.draft.title,
    area: '',
    description: model.draft.description,
    childAges: '',
    daysTimes: model.draft.daysTimes || '',
    place: model.draft.place || '',
    educator: model.draft.educator || '',
    peopleNeeded: model.draft.peopleNeeded || '',
    createdFrom: 'inspiration',
    inspirationModelId: model.id
  });
  const beginInspirationDraft = modelId => {
    const model = inspirationModels[modelId];
    if (!model) return;
    const draft = buildInspirationDraft(model);
    transition({ flow: { type: 'initiative', step: 'form', draft, draftReplacement: null, validationErrors: [] }, ui: { overlay: null } });
    navigate('create/initiative');
  };
  const requestInspirationDraft = modelId => {
    const model = inspirationModels[modelId];
    if (!model || appState.route.name !== `inspiration/${modelId}`) return;
    const existing = normalizeDraft(appState.flow.draft, appState.flow.type);
    if (existing?.createdFrom === 'inspiration' && existing.inspirationModelId === modelId) { navigate('create/initiative'); return; }
    if (existing) { transition({ flow: { draftReplacement: { source: 'inspiration', inspirationModelId: modelId } }, ui: { overlay: { type: 'replace-draft-confirm' } } }); render(appState); return; }
    beginInspirationDraft(modelId);
  };
  const publishDraft = () => { const draft = normalizeDraft(appState.flow.draft, appState.flow.type); const errors = validateDraft(draft); if (errors.length) { transition({ flow: { validationErrors: errors } }); render(appState); return; } if (appState.flow.step === 'published' || appState.flow.step === 'success') return; if (appState.auth.status !== 'authenticated') { transition({ pendingAction: { id: `publish:${draft.id}:${Date.now()}`, actionType: 'publish', originRoute: 'preview', originContext: { ...appState.context }, payload: { draftId: draft.id, draftType: draft.type }, continuation: 'publish', createdAt: Date.now(), version: pendingVersion }, ui: { overlay: { type: 'account-gate' } }, flow: { draft, validationErrors: [] } }); render(appState); return; } dispatch('publish', { continue: true }); };

  const dispatch = (action, payload = {}, context = {}) => {
    switch (action) {
      case 'navigate': navigate(payload.route || 'discover', { context }); break;
      case 'open-detail': { const item = seedByTypeAndId(payload.entityType, payload.entityId); if (item) navigate(routeForEntity(payload.entityType, payload.entityId), { context: { entityType: payload.entityType, entityId: payload.entityId } }); else navigate('discover', { replace: true }); break; }
      case 'open-inspiration': { const modelId = payload.inspirationModelId; if (inspirationModels[modelId]) navigate(`inspiration/${modelId}`); else navigate('inspiration', { replace: true }); break; }
      case 'start':
      case 'open-start': transition({ ui: { overlay: { type: 'start' } } }); render(appState); break;
      case 'close-overlay': transition({ ui: { overlay: null } }); render(appState); break;
      case 'cancel-gate': transition({ ui: { overlay: null }, pendingAction: null }); render(appState); break;
      case 'start-create': transition({ ui: { overlay: { type: 'create-choices' } } }); render(appState); break;
      case 'start-find':
      case 'begin-search': transition({ ui: { overlay: null }, search: { answers: { need: '', area: '', context: '' }, outcome: null } }); navigate('search/q1'); break;
      case 'start-offer': beginCreate('offering'); break;
      case 'create-type': beginCreate(payload.createType); break;
      case 'answer-search': {
        if (!Object.prototype.hasOwnProperty.call(searchOptions, payload.searchField) || !searchOptions[payload.searchField].has(payload.searchValue)) break;
        const answers = { ...appState.search.answers, [payload.searchField]: payload.searchValue };
        if (payload.searchField === 'need') { answers.area = ''; answers.context = ''; transition({ search: { answers, outcome: null } }); navigate('search/q2'); }
        else if (payload.searchField === 'area') { answers.context = ''; transition({ search: { answers, outcome: null } }); navigate('search/q3'); }
        else {
          const evaluated = evaluateSearch(answers);
          transition({ search: { answers, outcome: evaluated.outcome } });
          navigate(`search/${evaluated.outcome}`);
        }
        break;
      }
      case 'edit-search': navigate('search/q1'); break;
      case 'request-save-intent': if (validCompleteSearch(appState.search) && resultRoutes.has(appState.route.name)) { transition({ ui: { overlay: { type: 'save-intent-consent' } } }); render(appState); } break;
      case 'confirm-save-intent': {
        if (!validCompleteSearch(appState.search) || !resultRoutes.has(appState.route.name)) { transition({ ui: { overlay: null } }); render(appState); break; }
        const answers = { ...appState.search.answers };
        const intentId = intentIdFor(answers);
        if (appState.auth.status !== 'authenticated') {
          transition({ pendingAction: { id: `save-intent:${intentId}`, actionType: 'save-intent', originRoute: appState.route.name, originContext: { ...appState.context }, payload: { intentId, answers }, continuation: 'save-intent', createdAt: Date.now(), version: pendingVersion }, ui: { overlay: { type: 'account-gate' } } });
          render(appState);
        } else dispatch('save-intent', { intentId, answers, continue: true });
        break;
      }
      case 'save-intent': {
        const answers = normalizeSearchAnswers(payload.answers);
        const intentId = payload.intentId;
        if (appState.auth.status !== 'authenticated' || !answers.need || !answers.area || !answers.context || intentId !== intentIdFor(answers)) break;
        const savedIntents = appState.savedIntents.some(intent => intent.id === intentId) ? appState.savedIntents : [...appState.savedIntents, { id: intentId, answers, private: true, savedAt: Date.now() }];
        transition({ savedIntents, pendingAction: null, ui: { overlay: null } });
        render(appState);
        break;
      }
      case 'publish-search-need': requestSearchDraft(); break;
      case 'request-inspiration-draft': requestInspirationDraft(payload.inspirationModelId); break;
      case 'confirm-replace-draft':
      case 'confirm-publish-search-need': {
        const replacement = appState.flow.draftReplacement;
        if (replacement?.source === 'inspiration') beginInspirationDraft(replacement.inspirationModelId);
        else if (replacement?.source === 'search') beginSearchDraft();
        else { transition({ ui: { overlay: null }, flow: { draftReplacement: null } }); render(appState); }
        break;
      }
      case 'update-draft': { const draft = normalizeDraft(appState.flow.draft, appState.flow.type); if (!draft || !draftFields.includes(payload.field)) break; transition({ flow: { draft: { ...draft, [payload.field]: String(payload.value ?? '') }, validationErrors: [] } }); break; }
      case 'preview-draft': { if (!normalizeDraft(appState.flow.draft, appState.flow.type)) break; transition({ flow: { step: 'preview', validationErrors: [] } }); navigate('preview'); break; }
      case 'edit-draft': { const type = appState.flow.draft?.type || appState.flow.type; if (createTypes.has(type)) { transition({ flow: { step: 'form', validationErrors: [] } }); navigate(`create/${type}`); } break; }
      case 'publish-draft': publishDraft(); break;
      case 'publish': { const draft = normalizeDraft(appState.flow.draft, appState.flow.type); if (!draft || appState.auth.status !== 'authenticated' || appState.flow.step === 'published') break; const errors = validateDraft(draft); if (errors.length) { transition({ flow: { validationErrors: errors } }); render(appState); break; } const id = `created-${draft.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; const item = { ...draft, id, publishedAt: Date.now() }; const createdItems = appState.createdItems.some(candidate => candidate.id === id) ? appState.createdItems : [...appState.createdItems, item]; transition({ createdItems, pendingAction: null, ui: { overlay: null }, flow: { type: draft.type, step: 'published', draft: null, targetId: id, targetType: draft.type, validationErrors: [] } }); navigate(`publish-success/${id}`); break; }
      case 'join':
      case 'connect': { const item = seedByTypeAndId(payload.entityType, payload.entityId); const valid = item && ((action === 'join' && item.type === 'initiative') || (action === 'connect' && item.type === 'offering')); if (!valid) break; if (appState.auth.status !== 'authenticated' && !payload.continue) { const originRoute = appState.route.name; transition({ pendingAction: { id: `${action}:${item.id}:${Date.now()}`, actionType: action, originRoute, originContext: { ...appState.context }, payload: { entityType: item.type, entityId: item.id }, continuation: action, createdAt: Date.now(), version: pendingVersion }, ui: { overlay: { type: 'account-gate' } } }); render(appState); break; } transition({ ui: { overlay: null }, pendingAction: null, flow: { type: action, step: 'confirmed', targetId: item.id, targetType: item.type } }); render(appState); break; }
      case 'demo-auth': { const pending = normalizePendingAction(appState.pendingAction); if (!pending) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; } if (pending.originRoute !== appState.route.name || pending.originContext.entityType !== appState.context.entityType || pending.originContext.entityId !== appState.context.entityId) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; } if (pending.actionType === 'publish') { const draft = normalizeDraft(appState.flow.draft, pending.payload.draftType); if (!draft || draft.id !== pending.payload.draftId) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; } transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); dispatch('publish', { continue: true }); break; } if (pending.actionType === 'save-intent') { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); dispatch('save-intent', { ...pending.payload, continue: true }); break; } const item = seedByTypeAndId(pending.payload.entityType, pending.payload.entityId); if (!item) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; } transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); dispatch(pending.continuation, { ...pending.payload, continue: true }, pending.originContext); break; }
      default: break;
    }
  };
  const handleAction = event => { const target = event.target.closest('[data-action], [data-route]'); if (!target) return; const action = target.dataset.action || 'navigate'; event.preventDefault(); dispatch(action, { route: target.dataset.route || 'discover', entityType: target.dataset.entityType, entityId: target.dataset.entityId, inspirationModelId: target.dataset.inspirationModelId, createType: target.dataset.createType, searchField: target.dataset.searchField, searchValue: target.dataset.searchValue }, appState.context); };
  const handleInput = event => { const target = event.target.closest('[data-field]'); if (target) dispatch('update-draft', { field: target.dataset.field, value: target.value }); };
  const initializeState = () => { appState = initialState(); return appState; };
  const registerEventOwners = () => { document.addEventListener('click', handleAction); document.addEventListener('input', handleInput); window.addEventListener('popstate', restoreRouteAndContext); };
  const boot = () => { initializeState(); restoreRouteAndContext(); registerEventOwners(); };
  window.__foundation = Object.freeze({ getState: () => appState, boot, initializeState, dispatch, navigate, restoreRouteAndContext, render, rendererRegistry });
  boot();
})();
