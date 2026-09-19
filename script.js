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
    initiative: { id: 'initiative-pt', type: 'initiative', eyebrow: 'יוזמה · פתח תקווה', title: 'בקרים שעובדים בפתח תקווה', description: 'מחפשות עוד 2–3 משפחות לרוטציה פעמיים בשבוע, בקצב שמתאים לכולנו.', area: 'פתח תקווה', searchKinds: ['people', 'initiatives', 'collaboration'], searchContexts: ['mornings', 'flexible'] },
    place: { id: 'place-hod-hasharon', type: 'place', eyebrow: 'מקום · הוד השרון', title: 'סטודיו עם חצר קטנה בבקרים', description: 'חלל נעים לקבוצה קטנה, באזור כללי של הוד השרון.', area: 'הוד השרון', searchKinds: ['places'], searchContexts: ['mornings', 'flexible'] },
    offer: { id: 'offering-statistics', type: 'offering', eyebrow: 'שירות מקצועי · Online', title: 'עזרה בסטטיסטיקה בלי להפוך את זה לקורס', description: 'פגישה ממוקדת מרחוק, 45–60 דקות, סביב שאלה שאת כבר עובדת עליה.', area: 'Online', searchKinds: ['services', 'learning'], searchContexts: ['remote', 'flexible'] },
    job: { id: 'job-research-operations', type: 'job', eyebrow: 'משרה לדוגמה בלבד · Hybrid', title: 'Research Operations Assistant — 60%', description: 'דוגמה בלבד למשרה היברידית בהיקף 60% עם גמישות סביב היום.', area: 'Hybrid', searchKinds: ['jobs'], searchContexts: ['hybrid', 'flexible'] }
  };
  const inspirationModels = {
    'care-rotation': { id: 'care-rotation', asset: 'אמא נוספת', title: 'רוטציה בין משפחות', summary: 'שתי משפחות או יותר מחלקות ביניהן בקרים קבועים עם הילדים.', how: 'קובעות ימים, מספר ילדים וכללי תיאום פשוטים.', needed: 'עוד משפחה, תיאום בסיסי ומקום שמתחלף ביניכן.', fit: 'מתאים כשיש רצון לעזרה הדדית בלי להקים מסגרת שלמה.', draft: { title: 'מחפשות משפחה לרוטציית בקרים', description: 'נשמח לבחון רוטציה פשוטה של בקרים משותפים עם עוד משפחה, בתיאום שמתאים לכולנו.', peopleNeeded: 'משפחה אחת או שתיים', daysTimes: 'בקרים, בתיאום' } },
    'park-work': { id: 'park-work', asset: 'פארק', title: 'עובדות ונפגשות בפארק', summary: 'מפגש קבוע בפארק שבו הילדים משחקים וההורים יוצרות יחד זמן עבודה גמיש.', how: 'בוחרות פארק, שעות ומבוגרות אחראיות לכל מפגש.', needed: 'פארק קרוב, כמה הורים ותיאום ציפיות.', fit: 'מתאים למי שמחפשת קהילה קרובה וגמישות סביב היום.', draft: { title: 'מחפשות שותפות לבקרים בפארק', description: 'רוצות לנסות מפגש בוקר קבוע בפארק: הילדים יחד ואנחנו מפנות זמן לעבודה או למפגש.', place: 'פארק קרוב', peopleNeeded: 'עוד הורים', daysTimes: 'בקרים, פעם או פעמיים בשבוע' } },
    'host-home': { id: 'host-home', asset: 'בית / חצר', title: 'בית או חצר מארחים', summary: 'בית או חצר הופכים למקום קבוע למפגש קטן של משפחות.', how: 'מארחת או מארח מציעים מקום, והקבוצה מסכימה יחד על שימוש ותיאום.', needed: 'בית או חצר, קבוצה קטנה וכללי אירוח.', fit: 'מתאים כשכבר יש מקום נעים שרוצים לפתוח לעוד משפחות.', draft: { title: 'פותחות בית או חצר למפגשים קטנים', description: 'יש לנו מקום שיכול לארח מפגש קטן של משפחות, ונשמח לבדוק קבוצה קבועה בתיאום משותף.', place: 'בית / חצר', peopleNeeded: 'משפחות נוספות' } },
    'educator-families': { id: 'educator-families', asset: 'אשת חינוך', title: 'משפחות יחד עם אשת חינוך', summary: 'כמה משפחות בוחנות מסגרת קטנה עם אשת חינוך שמתאימה לקצב שלהן.', how: 'מגדירות יחד ימים, מקום, אחריות ותקציב לפני שמחליטים.', needed: 'משפחות, אשת חינוך ותיאום ברור.', fit: 'מתאים למי שמחפשת פתרון קבוצתי עם ניסיון חינוכי.', draft: { title: 'בוחנות קבוצה קטנה עם אשת חינוך', description: 'מחפשות משפחות שרוצות לבחון יחד קבוצה קטנה עם אשת חינוך, בקצב ובתנאים שנגדיר יחד.', educator: 'אשת חינוך', peopleNeeded: 'משפחות נוספות' } },
    'studio-mornings': { id: 'studio-mornings', asset: 'סטודיו / חדר פנוי', title: 'סטודיו או חדר לבקרים קבועים', summary: 'חלל פנוי יכול להפוך לנקודת מפגש קבועה לפעילות, עבודה וקרבה לילדים.', how: 'בודקות שימוש מתאים, זמינות ועלויות לפני שמתחייבות.', needed: 'חלל פנוי, משפחות ותיאום שימוש.', fit: 'מתאים למי שכבר מכירה חלל שיכול לשרת קבוצה קטנה.', draft: { title: 'מחפשות שותפות לבקרים בסטודיו', description: 'רוצות לבחון שימוש קבוע בסטודיו או חדר פנוי לבקרים משותפים למשפחות.', place: 'סטודיו / חדר פנוי', peopleNeeded: 'משפחות נוספות', daysTimes: 'בקרים קבועים' } }
  };

  const reportReasons = ['מידע אישי / ילדים / כתובת', 'הטרדה או פנייה חוזרת', 'תוכן מסוכן / לא מתאים', 'התחזות / הטעיה', 'ספאם / שיווק', 'אחר'];
  const initialState = () => ({ route: { name: 'discover' }, context: { entityType: null, entityId: null }, ui: { overlay: null }, auth: { status: 'anonymous' }, flow: { type: null, step: null, draft: null, targetId: null, targetType: null, validationErrors: [] }, search: { answers: { need: '', area: '', context: '' }, outcome: null }, savedIntents: [], createdItems: [], connections: [], reports: [], blockedEntityIds: [], pendingAction: null });
  let appState = initialState();

  const heading = (eyebrow, title, lede = '') => `<p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}`;
  const actionButton = (label, action, extra = '') => `<button class="primary" data-action="${action}"${extra}>${label} <span>←</span></button>`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const isRecord = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  const textValue = value => typeof value === 'string' ? value : '';
  const normalizeContext = value => isRecord(value) ? { entityType: typeof value.entityType === 'string' ? value.entityType : null, entityId: typeof value.entityId === 'string' ? value.entityId : null } : { entityType: null, entityId: null };

  const draftFields = ['title', 'area', 'description', 'childAges', 'daysTimes', 'place', 'educator', 'activity', 'budget', 'peopleNeeded', 'serviceType', 'availability', 'capacity', 'childSuitability', 'facilities', 'price', 'photos', 'privateAddress'];
  const publicDraftFields = draftFields.filter(fieldName => fieldName !== 'privateAddress');
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
  const normalizeNeedStates = value => {
    const source = isRecord(value) ? value : {};
    return ['people', 'place', 'educator'].reduce((states, key) => ({ ...states, [key]: source[key] === 'paused' ? 'paused' : 'open' }), {});
  };
  const normalizeCreatedItem = value => {
    if (!isRecord(value) || typeof value.id !== 'string' || !createTypes.has(value.type)) return null;
    return { ...makeDraft(value.type, value), needStates: value.type === 'initiative' ? normalizeNeedStates(value.needStates) : null, publishedAt: typeof value.publishedAt === 'number' ? value.publishedAt : 0 };
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
  const normalizeConnection = value => {
    if (!isRecord(value) || !['join', 'connect'].includes(value.actionType) || typeof value.entityId !== 'string') return null;
    const expectedType = value.actionType === 'join' ? 'initiative' : 'offering';
    if (value.entityType !== expectedType || !seedByTypeAndId(value.entityType, value.entityId)) return null;
    return { id: `${value.actionType}:${value.entityId}`, actionType: value.actionType, entityType: value.entityType, entityId: value.entityId, status: ['handled', 'inactive'].includes(value.status) ? value.status : 'requested', createdAt: typeof value.createdAt === 'number' ? value.createdAt : 0 };
  };
  const normalizeConnections = value => Array.isArray(value) ? [...new Map(value.map(normalizeConnection).filter(Boolean).map(connection => [connection.id, connection])).values()].slice(-30) : [];
  const entityKey = (type, id) => `${type}:${id}`;
  const normalizeEntityKey = value => {
    if (typeof value !== 'string') return null;
    const match = /^(initiative|place|offering|job):([^:]+)$/.exec(value);
    return match ? entityKey(match[1], match[2]) : null;
  };
  const normalizeBlockedEntityIds = value => Array.isArray(value) ? [...new Set(value.map(normalizeEntityKey).filter(Boolean))].slice(-30) : [];
  const normalizeReport = value => {
    if (!isRecord(value) || !reportReasons.includes(value.reason)) return null;
    const key = normalizeEntityKey(value.entityKey);
    return key ? { id: `report:${key}`, entityKey: key, reason: value.reason, createdAt: typeof value.createdAt === 'number' ? value.createdAt : 0 } : null;
  };
  const normalizeReports = value => Array.isArray(value) ? [...new Map(value.map(normalizeReport).filter(Boolean).map(report => [report.id, report])).values()].slice(-30) : [];

  const seedByTypeAndId = (type, id) => Object.values(seed).find(item => item.type === type && item.id === id) || null;
  const routeParts = (route, createdItems = appState.createdItems, savedIntents = appState.savedIntents) => {
    const value = String(route || '');
    if (/^create\/(initiative|offering|place|post)$/.test(value)) return { name: value, entityType: 'create', entityId: value.split('/')[1] };
    if (value === 'preview') return { name: value, entityType: 'preview', entityId: null };
    if (searchRoutes.has(value)) return { name: value, entityType: 'search', entityId: value.split('/')[1] };
    if (value === 'inspiration') return { name: value, entityType: 'inspiration', entityId: null };
    const inspiration = /^inspiration\/([^/]+)$/.exec(value);
    if (inspiration && inspirationModels[inspiration[1]]) return { name: value, entityType: 'inspiration', entityId: inspiration[1] };
    const success = /^publish-success\/([^/]+)$/.exec(value);
    if (success && createdItems.some(item => item.id === success[1])) return { name: value, entityType: 'created', entityId: success[1] };
    const published = /^published\/([^/]+)$/.exec(value);
    if (published && createdItems.some(item => item.id === published[1])) return { name: value, entityType: 'created', entityId: published[1] };
    const manage = /^manage-initiative\/([^/]+)$/.exec(value);
    if (manage && createdItems.some(item => item.id === manage[1] && item.type === 'initiative')) return { name: value, entityType: 'managed-initiative', entityId: manage[1] };
    const savedIntent = /^saved-intent\/([^/]+)$/.exec(value);
    if (savedIntent && savedIntents.some(item => item.id === savedIntent[1])) return { name: value, entityType: 'saved-intent', entityId: savedIntent[1] };
    const match = /^([^/]+)\/([^/]+)$/.exec(value);
    if (!match || !routeRegistry.has(match[1])) return null;
    const type = match[1] === 'offering-detail' ? 'offering' : match[1].replace(/-detail$/, '');
    return seedByTypeAndId(type, match[2]) ? { name: `${match[1]}/${match[2]}`, entityType: type, entityId: match[2] } : null;
  };
  const resolveRoute = (route, createdItems = appState.createdItems, savedIntents = appState.savedIntents) => {
    if (route === 'discover' || route === 'inspiration' || route === 'mine' || route === 'preview' || searchRoutes.has(route)) return route;
    return routeParts(route, createdItems, savedIntents)?.name || 'discover';
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
    const connections = normalizeConnections(value.connections);
    const status = isRecord(value.auth) && (value.auth.status === 'anonymous' || value.auth.status === 'authenticated') ? value.auth.status : defaults.auth.status;
    const overlayType = isRecord(value.ui) ? value.ui.overlay?.type : null;
    const reports = normalizeReports(value.reports);
    return { ...defaults, route: { name: resolveRoute(isRecord(value.route) ? value.route.name : defaults.route.name, createdItems, savedIntents) }, context: normalizeContext(value.context), ui: { overlay: ['start', 'create-choices', 'account-gate', 'save-intent-consent', 'replace-draft-confirm', 'report-reasons', 'report-confirm', 'block-confirm'].includes(overlayType) ? { type: overlayType, entityType: typeof value.ui.overlay?.entityType === 'string' ? value.ui.overlay.entityType : null, entityId: typeof value.ui.overlay?.entityId === 'string' ? value.ui.overlay.entityId : null } : null }, auth: { status }, flow: normalizeFlow(value.flow), search: normalizeSearch(value.search), savedIntents, createdItems, connections, reports, blockedEntityIds: normalizeBlockedEntityIds(value.blockedEntityIds), pendingAction: normalizePendingAction(value.pendingAction) };
  };
  const readPersistedState = () => {
    try { const value = sessionStorage.getItem(stateKey); return value ? normalizePersistedState(JSON.parse(value)) : null; } catch (_) { sessionStorage.removeItem(stateKey); return null; }
  };
  const persistState = state => { try { sessionStorage.setItem(stateKey, JSON.stringify({ flow: state.flow, search: state.search, savedIntents: state.savedIntents, connections: state.connections, reports: state.reports, blockedEntityIds: state.blockedEntityIds, auth: state.auth, pendingAction: state.pendingAction, context: state.context, route: state.route, ui: state.ui, createdItems: state.createdItems })); } catch (_) { /* memory remains authoritative */ } };
  const transition = patch => {
    appState = { ...appState, ...patch, route: patch.route ? { ...appState.route, ...patch.route } : appState.route, context: patch.context ? { ...appState.context, ...patch.context } : appState.context, ui: patch.ui ? { ...appState.ui, ...patch.ui } : appState.ui, auth: patch.auth ? { ...appState.auth, ...patch.auth } : appState.auth, flow: patch.flow ? { ...appState.flow, ...patch.flow } : appState.flow, search: patch.search ? { ...appState.search, ...patch.search } : appState.search, savedIntents: patch.savedIntents || appState.savedIntents, createdItems: patch.createdItems || appState.createdItems, connections: patch.connections || appState.connections, reports: patch.reports || appState.reports, blockedEntityIds: patch.blockedEntityIds || appState.blockedEntityIds };
    persistState(appState);
    return appState;
  };

  const createdById = id => appState.createdItems.find(item => item.id === id) || null;
  const routeForEntity = (type, id) => `${type === 'job' ? 'job' : type === 'offering' ? 'offering-detail' : `${type}-detail`}/${id}`;
  const isReported = (type, id, state = appState) => state.reports.some(report => report.entityKey === entityKey(type, id));
  const isBlocked = (type, id, state = appState) => state.blockedEntityIds.includes(entityKey(type, id));
  const isHiddenEntity = (type, id, state = appState) => isReported(type, id, state) || isBlocked(type, id, state);
  const searchCandidates = answers => Object.values(seed).filter(item => !isHiddenEntity(item.type, item.id) && (answers.need === 'unsure' || item.searchKinds.includes(answers.need)));
  const evaluateSearch = answers => {
    const candidates = searchCandidates(answers);
    // "Other area" has no known place availability in the V1 seed. Do not turn a
    // mismatched place into a partial availability claim; offer the no-place recovery.
    if (answers.need === 'places' && answers.area === 'אזור אחר') return { outcome: 'no-results', matches: [] };
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
    const context = parsed && ['initiative', 'place', 'offering', 'job', 'inspiration', 'created', 'managed-initiative', 'saved-intent'].includes(parsed.entityType) ? { entityType: parsed.entityType, entityId: parsed.entityId } : { entityType: null, entityId: null };
    transition({ route: { name: route }, context, ui: { overlay: null } });
    render(appState);
  };
  const restoreRouteAndContext = () => {
    const persisted = readPersistedState() || initialState();
    const requested = routeFromLocation();
    let route = resolveRoute(requested, persisted.createdItems, persisted.savedIntents);
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
    const parsed = routeParts(route, persisted.createdItems, persisted.savedIntents);
    const context = parsed && ['initiative', 'place', 'offering', 'job', 'inspiration', 'created', 'managed-initiative', 'saved-intent'].includes(parsed.entityType) ? { entityType: parsed.entityType, entityId: parsed.entityId } : { entityType: null, entityId: null };
    transition({ route: { name: route }, context, ui, auth: persisted.auth, flow, search, savedIntents: persisted.savedIntents, connections: persisted.connections, reports: persisted.reports, blockedEntityIds: persisted.blockedEntityIds, pendingAction, createdItems: persisted.createdItems });
    writeLocation(route, true);
    render(appState);
  };

  const renderCard = kind => { const item = seed[kind]; return isHiddenEntity(item.type, item.id) ? '' : `<article class="card ${kind === 'initiative' ? 'featured' : ''}" data-entity-id="${item.id}"><span class="context">${item.eyebrow}</span><h2>${item.title}</h2><p>${item.description}</p><div class="signals"><span>${kind === 'job' ? 'חלקית' : 'אזור כללי'}</span></div>${actionButton('לפרטים', 'open-detail', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`)}</article>`; };
  const renderDiscover = () => `<section class="intro">${heading('קהילה שמפנה מקום לשני הצדדים', 'גם לעבוד.<br><em>גם להיות קרובים.</em>', 'להמשיך לעבוד, ללמוד ולהתפתח — ולהישאר קרובים לילדים.')}${actionButton('מה את מחפשת עכשיו?', 'open-start')}</section><nav class="filters"><button class="filter active" data-action="navigate" data-route="discover">הכול</button><button class="filter" data-action="navigate" data-route="inspiration">השראה</button><button class="filter" data-action="navigate" data-route="discover">עבודה והתפתחות</button></nav><section class="feed"><div style="grid-column:span 7">${renderCard('initiative')}</div><div class="split-cards"><div class="place">${renderCard('place')}</div><div class="care">${renderCard('offer')}</div></div>${renderCard('job')}<article class="inspiration-card"><div>${heading('בואי תראי מה כבר קיים', 'רעיונות שאפשר להתחיל מהם', 'דוגמאות קטנות למה שגם וגם יכול להיראות — ואז עורכות את זה כך שיתאים לך.')}</div><button class="secondary" data-action="navigate" data-route="inspiration">לכל ההשראות</button></article><article class="action-card">${heading('לא מצאת עדיין?', 'ספרי מה יעזור לך — ונחפש.')}${actionButton('להתחיל לחפש', 'begin-search')}</article></section>`;
  const renderUnavailable = () => `<section class="intro detail-view" data-testid="hidden-entity-recovery">${heading('הפריט אינו זמין', 'הפריט הזה הוסתר אצלך', 'לא נציג כאן פרטים נוספים. אפשר לחזור לגילוי או ל״שלי״.')}<div class="form-actions"><button class="primary" data-action="navigate" data-route="discover">לגילוי <span>←</span></button><button class="secondary" data-action="navigate" data-route="mine">לשלי</button></div></section>`;
  const safetyActions = item => `<div class="form-actions"><button class="secondary" data-action="request-report" data-entity-type="${item.type}" data-entity-id="${item.id}">לדווח</button><button class="secondary" data-action="block-entity" data-entity-type="${item.type}" data-entity-id="${item.id}">לחסום</button></div>`;
  const publicDraftDetails = item => {
    const facts = item.type === 'initiative' ? [['גילאי הילדים', item.childAges], ['ימים ושעות', item.daysTimes], ['כמה אנשים צריך', item.peopleNeeded], ['מקום', item.place], ['אשת חינוך / מקצוע', item.educator]] : item.type === 'offering' ? [['סוג ההצעה', item.serviceType], ['זמינות', item.availability], ['מחיר', item.price]] : item.type === 'place' ? [['סוג המקום / שימוש', item.place], ['זמינות', item.availability], ['קיבולת', item.capacity], ['מתאים לילדים', item.childSuitability], ['מתקנים', item.facilities], ['מחיר', item.price]] : [];
    return facts.filter(([, value]) => value).map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join('');
  };
  const renderDetail = state => { const item = seedByTypeAndId(state.context.entityType, state.context.entityId); if (!item) return renderDiscover(state); if (isHiddenEntity(item.type, item.id, state)) return renderUnavailable(); const request = state.connections.find(connection => connection.entityId === item.id && connection.entityType === item.type && connection.status !== 'inactive'); const protectedAction = item.type === 'initiative' ? actionButton('לשלוח בקשת הצטרפות', 'join', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`) : item.type === 'offering' ? actionButton('לשלוח בקשת חיבור', 'connect', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`) : ''; const confirmation = request ? `<div class="confirmation" role="status" data-testid="connection-status"><p class="eyebrow">${request.status === 'handled' ? 'טופל' : 'הבקשה נשלחה'}</p><h2>${request.actionType === 'join' ? 'הבקשה נשלחה' : 'בקשת החיבור נשלחה'}</h2><p>נעדכן אותך כשיהיה שינוי. אפשר לעקוב אחריה באזור האישי.</p><button class="secondary" data-action="navigate" data-route="mine">לשלי</button></div>` : protectedAction; const jobBoundary = item.type === 'job' ? '<div class="privacy-note" data-testid="job-outbound-boundary"><strong>מקור:</strong> דוגמת תוכן בלבד. זו אינה משרה חיה או מאומתת, ולכן אין קישור להגשה. הגשות למשרות חיות מתבצעות מחוץ לגם וגם.</div>' : ''; return `<section class="intro detail-view"><button class="text-link" data-action="navigate" data-route="discover">← חזרה לגילוי</button>${heading(item.eyebrow, item.title, item.description)}<div class="detail-meta"><p>${item.area}</p></div>${jobBoundary}${confirmation}${safetyActions(item)}</section>`; };
  const renderInspiration = state => {
    const model = state.context.entityId ? inspirationModels[state.context.entityId] : null;
    if (state.context.entityId && !model) return renderDiscover(state);
    if (model) return `<section class="intro detail-view inspiration-detail" data-testid="inspiration-detail" data-inspiration-model-id="${model.id}"><button class="text-link" data-action="navigate" data-route="inspiration">← חזרה להשראה</button>${heading('בואי נתאים את הרעיון אלייך', model.title, 'מילאנו התחלה לפי הרעיון שבחרת. אפשר לשנות הכול לפני שמפרסמים.')}<div class="preview-card"><p><strong>איך זה עובד:</strong> ${model.how}</p><p><strong>מה צריך:</strong> ${model.needed}</p><p><strong>למה זה עשוי להתאים:</strong> ${model.fit}</p></div><div class="form-actions">${actionButton('זה יכול להתאים לי', 'request-inspiration-draft', ` data-inspiration-model-id="${model.id}"`)}</div></section>`;
    const cards = Object.values(inspirationModels).map(item => `<article class="inspiration-card" data-inspiration-card-id="${item.id}"><div><span class="context">יש עוד אמא אחת?</span><h2>${item.title}</h2><p>${item.summary}</p></div><button class="secondary" data-action="open-inspiration" data-inspiration-model-id="${item.id}">לפרטים</button></article>`).join('');
    return `<section class="intro inspiration-view" data-testid="inspiration-library"><button class="text-link" data-action="navigate" data-route="discover">← חזרה לגילוי</button>${heading('רעיונות שאפשר להתחיל מהם', 'רעיונות שאפשר להתחיל מהם', 'אלה רק נקודות פתיחה. אפשר לבחור רעיון, להתאים אותו למה שיש לך — ולפרסם רק אם תרצי.')}<div class="created-list">${cards}</div></section>`;
  };

  const needLabels = { people: 'אנשים ומשפחות', initiatives: 'יוזמות', places: 'מקומות', care: 'חינוך וטיפול', jobs: 'עבודה', services: 'עזרה ושירותים מקצועיים', collaboration: 'שיתוף פעולה', learning: 'למידה ועזרה', unsure: 'עוד לא בטוחה' };
  const contextLabels = { mornings: 'בקרים', hybrid: 'גמיש / היברידי', remote: 'מרחוק', flexible: 'לא משנה כרגע' };
  const searchChoice = (fieldName, value, label, selected) => `<button class="search-choice${selected === value ? ' selected' : ''}" data-action="answer-search" data-search-field="${fieldName}" data-search-value="${escapeHtml(value)}">${label}</button>`;
  const renderSearchQuestion = (state, step) => {
    const answers = state.search.answers;
    if (step === 'q1') return `<section class="intro search-view" data-testid="search-q1"><button class="text-link" data-action="navigate" data-route="discover">← חזרה לגילוי</button>${heading('חיפוש · 1 מתוך 3', 'מה את מחפשת עכשיו?', 'הבחירה נשארת חיפוש פרטי עד שתבחרי לשמור או לפרסם.')}<div class="search-choices">${Object.entries(needLabels).map(([value, label]) => searchChoice('need', value, label, answers.need)).join('')}</div></section>`;
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
    const savedNotice = isSaved ? '<div class="confirmation compact-confirmation" role="status" data-testid="intent-saved">החיפוש הזה נשמר באופן פרטי ב״שלי״.</div>' : '';
    const inspirationAction = evaluated.outcome === 'no-results' ? '<button class="secondary" data-action="navigate" data-route="inspiration">לראות מודלים להשראה</button>' : '';
    const noPlace = evaluated.outcome === 'no-results' && state.search.answers.need === 'places' ? '<div class="confirmation" data-testid="no-place-recovery"><h2>אין מקום זמין כרגע</h2><p>אין כאן זמינות מאומתת. אפשר להתחיל קטן במקום ציבורי או משותף, או לפרסם חיפוש מקום.</p><button class="secondary" data-action="create-type" data-create-type="place">לפרסם חיפוש מקום</button></div>' : '';
    const notNow = evaluated.outcome === 'no-results' ? '<button class="secondary" data-action="navigate" data-route="discover">לא עכשיו</button>' : '';
    return `<section class="intro search-view search-outcome" data-testid="search-${evaluated.outcome}"><button class="text-link" data-action="navigate" data-route="search/q3">← לעריכת התשובה האחרונה</button>${content}${noPlace}${savedNotice}${cards ? `<div class="search-results">${cards}</div>` : ''}<div class="search-next-actions"><button class="secondary" data-action="edit-search">לשנות או להרחיב חיפוש</button>${isSaved ? '' : actionButton('לשמור ולעדכן אותי', 'request-save-intent')}${inspirationAction}<button class="secondary" data-action="publish-search-need">לפרסם מה אני מחפשת</button>${notNow}</div></section>`;
  };

  const field = (label, name, value, multiline = false, required = false) => { const placeholder = { description: 'למשל: מחפשת עוד 2–3 משפחות לבקרים משותפים, פעמיים בשבוע.', daysTimes: 'למשל: בקרים, פעמיים בשבוע', place: 'למשל: סטודיו קטן עם חצר' }[name] || ''; const hint = name === 'description' ? '<small class="field-hint">לא לכתוב שמות ילדים או פרטים אישיים שמאפשרים לזהות אותם.</small>' : ''; return `<label class="field"><span>${label}${required ? ' *' : ''}</span>${multiline ? `<textarea name="${name}" data-field="${name}" rows="4" placeholder="${placeholder}">${escapeHtml(value)}</textarea>` : `<input name="${name}" data-field="${name}" value="${escapeHtml(value)}" autocomplete="off" placeholder="${placeholder}">`}${hint}</label>`; };
  const choiceField = (label, name, value, options) => `<fieldset class="choice-field"><legend>${label}</legend><div class="search-choices" data-choice-field="${name}">${options.map(option => `<button type="button" class="search-choice${value === option ? ' selected' : ''}" data-action="select-field" data-field="${name}" data-field-value="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join('')}</div></fieldset>`;
  const draftTypeLabel = type => ({ initiative: 'יוזמה', offering: 'הצעה', place: 'מקום', post: 'בקשה' }[type] || 'יצירה');
  const renderCreateForm = state => {
    const draft = state.flow.draft;
    if (!draft) return renderDiscover(state);
    const reveal = (condition, content) => condition ? content : '';
    const optional = draft.type === 'initiative' ? `${choiceField('גילאי הילדים', 'childAges', draft.childAges, ['פעוטות', 'ילדים בגיל גן', 'ילדים גדולים יותר', 'טווח גילאים רחב', 'עוד לא יודעת'])}${reveal(Boolean(draft.childAges || draft.daysTimes || draft.place || draft.educator || draft.peopleNeeded || draft.activity || draft.budget), choiceField('מתי זה יכול לקרות?', 'daysTimes', draft.daysTimes, ['בקרים', 'צהריים', 'אחר הצהריים', 'ערב', 'סופי שבוע', 'גמישה']))}${reveal(Boolean(draft.daysTimes || draft.place || draft.educator || draft.peopleNeeded || draft.activity || draft.budget), choiceField('יש כבר מקום?', 'place', draft.place, ['יש כבר מקום', 'עדיין אין מקום', 'פתוחה להצעות', 'עוד לא יודעת']))}${reveal(Boolean(draft.place || draft.educator || draft.peopleNeeded || draft.activity || draft.budget), choiceField('צריך אשת מקצוע?', 'educator', draft.educator, ['כן', 'לא', 'אולי', 'עוד לא יודעת']))}${reveal(Boolean(draft.educator || draft.peopleNeeded || draft.activity || draft.budget), choiceField('כמה משפחות?', 'peopleNeeded', draft.peopleNeeded, ['עוד 1', 'עוד 2–3', 'עוד 4–5', 'יותר', 'עוד לא יודעת']))}${reveal(Boolean(draft.peopleNeeded || draft.activity || draft.budget), `${field('פעילות', 'activity', draft.activity)}${field('תקציב', 'budget', draft.budget)}`)}` : draft.type === 'offering' ? `${choiceField('סוג ההצעה', 'serviceType', draft.serviceType, ['שירות מקצועי', 'פעילות', 'ידע / עזרה', 'מקום', 'שיתוף פעולה'])}${reveal(Boolean(draft.serviceType || draft.availability || draft.price), choiceField('מתי זה יכול לקרות?', 'availability', draft.availability, ['בקרים', 'צהריים', 'ערב', 'גמישה', 'בתיאום']))}${reveal(Boolean(draft.availability || draft.price), field('מחיר', 'price', draft.price))}` : draft.type === 'place' ? `${choiceField('מתי אפשר להשתמש במקום?', 'availability', draft.availability, ['בקרים', 'צהריים', 'אחר הצהריים', 'ערב', 'סופי שבוע', 'גמיש / בתיאום'])}${reveal(Boolean(draft.availability || draft.capacity || draft.childSuitability || draft.facilities || draft.price || draft.privateAddress || draft.photos), choiceField('לכמה משפחות המקום מתאים?', 'capacity', draft.capacity, ['עד 3 משפחות', '4–6 משפחות', '7–10', 'יותר', 'עוד לא יודעת']))}${reveal(Boolean(draft.capacity || draft.childSuitability || draft.facilities || draft.price || draft.privateAddress || draft.photos), choiceField('למי המקום מתאים?', 'childSuitability', draft.childSuitability, ['מתאים לפעוטות', 'מתאים לילדים גדולים יותר', 'מתאים לטווח גילאים רחב', 'צריך לבדוק יחד']))}${reveal(Boolean(draft.childSuitability || draft.facilities || draft.price || draft.privateAddress || draft.photos), `${field('מתקנים', 'facilities', draft.facilities)}${field('מחיר', 'price', draft.price)}${field('כתובת מדויקת (פרטית, לא תפורסם)', 'privateAddress', draft.privateAddress)}${field('תמונות', 'photos', draft.photos)}`)}` : '';
    const backRoute = draft.createdFrom === 'search' ? `search/${evaluateSearch(draft.searchAnswers).outcome}` : draft.createdFrom === 'inspiration' && draft.inspirationModelId ? `inspiration/${draft.inspirationModelId}` : 'discover';
    const provenance = draft.createdFrom === 'search' ? '<p class="privacy-note" data-testid="search-provenance">אפשר לערוך את הטקסט לפני שמפרסמים.</p>' : draft.createdFrom === 'inspiration' && draft.inspirationModelId ? `<p class="privacy-note" data-testid="inspiration-provenance">אפשר לשנות הכול לפני שמפרסמים.</p>` : '';
    const descriptionLabel = draft.type === 'initiative' ? 'כמה מילים על מה שאת מחפשת' : draft.type === 'offering' ? 'כמה מילים על מה שאת מציעה' : 'כמה מילים על המקום';
    return `<section class="intro creation-view" data-testid="create-form"><button class="text-link" data-action="navigate" data-route="${backRoute}">ביטול →</button>${heading(`יצירת ${draftTypeLabel(draft.type)}`, `יוצרות ${draftTypeLabel(draft.type)}`, 'אפשר לערוך הכול לפני הפרסום.')} ${provenance}<div class="creation-form">${field(draft.type === 'place' ? 'שם המקום' : 'כותרת', 'title', draft.title, false, true)}${field('אזור או Online', 'area', draft.area, false, true)}${field(descriptionLabel, 'description', draft.description, true, true)}${optional}<div class="form-actions">${actionButton('לתצוגה מקדימה', 'preview-draft')}<button class="secondary" data-action="navigate" data-route="${backRoute}">לשמור ולהמשיך אחר כך</button></div></div></section>`;
  };
  const privacyGuardrailErrors = draft => {
    const publicText = publicDraftFields.map(fieldName => String(draft?.[fieldName] || '')).join('\n');
    const errors = [];
    const hasPhone = /(?:\+972|00972)[\s.-]?5\d[\s.-]?\d{3}[\s.-]?\d{4}|(?:^|[^\d])0(?:2|3|4|8|9|5\d)[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)|\+\d{1,3}[\s.-]?(?:\(?\d{1,4}\)?[\s.-]?)?\d{3,4}[\s.-]\d{4}\b/.test(publicText);
    const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(publicText);
    const hasStreetAddress = /(?:רחוב|רח['׳]|שדרות|שד['׳]|סמטה|דרך|street|st\.?|avenue|ave\.?|road|rd\.?)\s+[A-Za-zא-ת"'׳\-\s]{2,60}\s+\d{1,4}[A-Za-zא-ת]?/i.test(publicText);
    const hasChildIdentity = /(?:הבן|הבת|הילד|הילדה)\s+שלי\s+(?:קוראים\s+לו|קוראים\s+לה|שמו|שמה)\s+[א-ת]{2,}|(?:הבן|הבת|הילד|הילדה)\s+שלי\s*[,:-]?\s+[א-ת]{2,}\s+(?:בן|בת)\s+\d{1,2}\b|(?:ילד|ילדה)\s+בשם\s+[א-ת]{2,}|(?:הבן|הבת|הילד|הילדה)\s+[א-ת]{2,}\s+(?:בן|בת)\s+\d{1,2}\b|(?:הבן|הבת|הילד|הילדה)[^.!?\n]{0,120}(?:לפנות\s+אלי[וה]\s+בשם|קוראים\s+ל[וה])\s+[א-ת]{2,}|(?:בקשו|אפשר\s+לפנות|פנו)\s+(?:אותו|אותה|אליו|אליה)\s+בשם\s+[א-ת]{2,}|(?:הבן|הבת|הילד|הילדה)\s+[א-ת]{2,}(?:\s+[א-ת]{2,})?\s+(?:מגן|בגן|מעון|במעון|כיתה|בית\s+ספר)|(?:אפשר\s+לדבר\s+עם|לדבר\s+עם)\s+[א-ת]{2,}[^.!?\n]{0,30}(?:היא|הוא)\s+(?:הילדה|הילד)\s+שלי/.test(publicText);
    if (hasPhone) errors.push('נראה שנכלל מספר טלפון. צריך להסיר אותו או להחליף בתיאור כללי לפני הפרסום.');
    if (hasEmail) errors.push('נראה שנכללה כתובת אימייל. צריך להסיר אותה או להחליף בתיאור כללי לפני הפרסום.');
    if (hasStreetAddress) errors.push('נראית כתובת רחוב מדויקת. צריך להסיר אותה או להחליף באזור כללי לפני הפרסום.');
    if (hasChildIdentity) errors.push('נראה שנכלל שם או פרט מזהה של ילד/ה. צריך להסיר אותו או להכליל את התיאור לפני הפרסום.');
    return errors;
  };
  const validateDraft = draft => { const errors = []; if (!draft || !draft.title.trim()) errors.push('צריך להוסיף כותרת.'); if (!draft || !draft.area.trim()) errors.push('צריך להוסיף אזור או לציין Online.'); if (!draft || draft.description.trim().length < 5) errors.push('צריך להוסיף תיאור קצר וברור.'); return [...errors, ...privacyGuardrailErrors(draft)]; };
  const renderPreview = state => {
    const draft = state.flow.draft;
    if (!draft) return renderDiscover(state);
    const errors = state.flow.validationErrors || [];
    const hasPrivacyGuardrail = errors.some(error => error.includes('צריך להסיר') || error.includes('צריך להכליל'));
    const errorBlock = errors.length ? `<div class="validation" role="alert" data-testid="publish-validation"><strong>${hasPrivacyGuardrail ? 'יש כאן פרט אישי על ילד' : 'עוד רגע — צריך לעדכן את הטיוטה לפני הפרסום:'}</strong>${hasPrivacyGuardrail ? '<p data-testid="publish-privacy-guardrail">כדי לשמור על פרטיות הילדים, כדאי להסיר שם או פרט שמאפשר לזהות ילד לפני שמפרסמים.</p>' : ''}<ul>${errors.map(error => `<li>${escapeHtml(error)}</li>`).join('')}</ul><p>אפשר לחזור לעריכה ולעדכן את הטיוטה.</p></div>` : '';
    const provenance = draft.createdFrom === 'inspiration' && draft.inspirationModelId ? `<p class="privacy-note" data-testid="inspiration-preview-provenance">מבוסס על השראה: ${escapeHtml(inspirationModels[draft.inspirationModelId].title)}</p>` : '';
    const privateAddressNotice = draft.type === 'place' && draft.privateAddress ? '<p class="privacy-note" data-testid="private-address-notice">הכתובת המדויקת נשמרת בטיוטה כפרטית ולא תפורסם.</p>' : '';
    return `<section class="intro creation-view" data-testid="preview"><button class="text-link" data-action="edit-draft">← עריכת הטיוטה</button>${heading(`תצוגה מקדימה · ${draftTypeLabel(draft.type)}`, draft.title || 'טיוטה ללא כותרת', draft.description || 'עדיין לא הוספת תיאור.')}${errorBlock}${provenance}<div class="preview-card"><p class="eyebrow">${escapeHtml(draft.area || 'אזור לא הוגדר')}</p><h2>${escapeHtml(draft.title || 'ללא כותרת')}</h2><p>${escapeHtml(draft.description || 'אין עדיין תיאור')}</p>${publicDraftDetails(draft)}</div>${privateAddressNotice}<div class="form-actions">${actionButton('לפרסם', 'publish-draft')}<button class="secondary" data-action="edit-draft">${hasPrivacyGuardrail ? 'חזרה לעריכה' : 'לחזור לעריכה'}</button></div></section>`;
  };
  const renderSuccess = state => { const item = createdById(state.context.entityId || state.flow.targetId); if (!item) return renderDiscover(state); return `<section class="intro creation-view publish-success" data-testid="publish-success">${heading('הפרסום', 'הפרסום עלה', 'אפשר לראות אותו עכשיו ולחזור אליו אחר כך באזור האישי.')}<div class="preview-card"><p class="eyebrow">${draftTypeLabel(item.type)} · ${escapeHtml(item.area)}</p><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p>${publicDraftDetails(item)}</div><p class="privacy-note">המידע שמופיע כאן ובפרסום הוא ציבורי. כתובת מדויקת ופרטי קשר נשארים פרטיים.</p><div class="form-actions"><button class="primary" data-action="open-created" data-item-id="${item.id}">לצפות בפרסום <span>←</span></button><button class="secondary" data-action="navigate" data-route="mine">לראות באזור שלי</button><button class="secondary" data-action="begin-search">להמשיך לגלות</button></div></section>`; };
  const emptyMy = (text, action, label) => `<div class="confirmation"><p>${text}</p><button class="secondary" data-action="${action}">${label}</button></div>`;
  const renderMine = state => {
    const initiatives = state.createdItems.filter(item => item.type === 'initiative');
    const published = state.createdItems.filter(item => item.type !== 'initiative');
    const itemCard = (item, manage = false) => `<article class="card created-item" data-created-id="${escapeHtml(item.id)}"><span class="context">${draftTypeLabel(item.type)} · ${escapeHtml(item.area)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p><span class="signals"><span>פורסם בחשבון שלך</span>${item.createdFrom === 'search' ? '<span>נוצר מחיפוש</span>' : ''}${item.createdFrom === 'inspiration' && item.inspirationModelId ? `<span data-testid="inspiration-created-provenance">נוצר מהשראה · ${escapeHtml(inspirationModels[item.inspirationModelId].title)}</span>` : ''}</span><div class="form-actions"><button class="secondary" data-action="open-created" data-item-id="${item.id}">לצפות</button>${manage ? `<button class="secondary" data-action="manage-initiative" data-item-id="${item.id}">ניהול יוזמה</button>` : ''}</div></article>`;
    const intents = state.savedIntents.length ? state.savedIntents.map(intent => `<article class="card saved-intent" data-saved-intent-id="${intent.id}"><span class="context">חיפוש פרטי</span><h2>${escapeHtml(needLabels[intent.answers.need])}</h2><p>${escapeHtml(intent.answers.area)} · ${escapeHtml(contextLabels[intent.answers.context])}</p><span class="signals"><span>גלוי רק לך</span><span>לא פורסם</span></span><div class="form-actions"><button class="secondary" data-action="open-saved-intent" data-intent-id="${intent.id}">לפתוח ולחזור לחיפוש</button></div></article>`).join('') : emptyMy('עדיין לא שמרת חיפושים.', 'begin-search', 'להתחיל חיפוש');
    const visibleConnections = state.connections.filter(connection => connection.status !== 'inactive' && !isHiddenEntity(connection.entityType, connection.entityId, state));
    const connections = visibleConnections.length ? visibleConnections.map(connection => { const item = seedByTypeAndId(connection.entityType, connection.entityId); return `<article class="card" data-connection-id="${connection.id}"><span class="context">${connection.actionType === 'join' ? 'יוזמה' : 'חיבור מקצועי'} · ${connection.status === 'handled' ? 'טופל' : 'הבקשה נשלחה'}</span><h2>${escapeHtml(item.title)}</h2><p>זהו מצב בקשה בלבד — הוא לא יוצר יוזמה חדשה.</p><button class="secondary" data-action="open-detail" data-entity-type="${item.type}" data-entity-id="${item.id}">לפרטים</button></article>`; }).join('') : emptyMy('עדיין אין חיבורים או בקשות.', 'begin-search', 'לגלות אפשרויות');
    return `<section class="intro mine-view" data-testid="mine"><button class="text-link" data-action="navigate" data-route="discover">← חזרה לגילוי</button>${heading('האזור שלי', 'האזור שלי', 'כאן נמצאים החיפושים ששמרת, הדברים שפרסמת והבקשות והחיבורים שלך.')}<h2 class="section-title">החיפושים ששמרתי</h2><p class="privacy-note">החיפושים ששמרת כאן פרטיים ולא מתפרסמים.</p><div class="created-list">${intents}</div><h2 class="section-title">הדברים שפרסמתי</h2><div class="created-list">${initiatives.length ? initiatives.map(item => itemCard(item, true)).join('') : emptyMy('עדיין אין יוזמה שפרסמת.', 'start', 'להתחיל חיפוש')}</div><div class="created-list">${published.length ? published.map(item => itemCard(item)).join('') : emptyMy('עדיין אין פרסומים נוספים.', 'start', 'להתחיל חיפוש')}</div><h2 class="section-title">הבקשות והחיבורים שלי</h2><div class="created-list">${connections}</div></section>`;
  };
  const renderCreated = state => { const item = createdById(state.context.entityId); if (!item) return renderMine(state); return `<section class="intro detail-view" data-testid="created-detail"><button class="text-link" data-action="navigate" data-route="mine">← חזרה לשלי</button>${heading(`${draftTypeLabel(item.type)} · ${escapeHtml(item.area)}`, escapeHtml(item.title), escapeHtml(item.description))}<div class="preview-card">${publicDraftDetails(item)}</div><p class="privacy-note">זהו פרסום שלך בחשבון ההדגמה. פרטי קשר וכתובת מדויקת אינם מוצגים כאן.</p>${item.type === 'initiative' ? `<button class="secondary" data-action="manage-initiative" data-item-id="${item.id}">ניהול יוזמה</button>` : ''}</section>`; };
  const renderManageInitiative = state => { const item = createdById(state.context.entityId); if (!item || item.type !== 'initiative') return renderMine(state); const needs = [['people', 'אנשים', item.peopleNeeded], ['place', 'מקום', item.place], ['educator', 'אשת חינוך / מקצוע', item.educator]].filter(([, , value]) => value); return `<section class="intro detail-view" data-testid="manage-initiative"><button class="text-link" data-action="navigate" data-route="mine">← חזרה לשלי</button>${heading('ניהול יוזמה', escapeHtml(item.title), 'אפשר לעדכן כל צורך בנפרד.')}<div class="preview-card"><p><strong>סטטוס:</strong> פורסמה</p><p><strong>אזור:</strong> ${escapeHtml(item.area)}</p>${needs.length ? needs.map(([key, label, value]) => { const paused = item.needStates?.[key] === 'paused'; return `<div class="manage-need" data-need-key="${key}"><p><strong>${label}:</strong> ${escapeHtml(value)} · ${paused ? 'מצאתי כרגע' : 'עדיין מחפשת'}</p><button class="secondary" data-action="set-initiative-need-state" data-item-id="${item.id}" data-need-key="${key}" data-need-state="${paused ? 'open' : 'paused'}">${paused ? 'לחדש' : 'להשהות'}</button></div>`; }).join('') : '<p>לא הוגדר צורך נוסף בפרסום הזה.</p>'}</div><button class="secondary" data-action="open-created" data-item-id="${item.id}">לצפות בפרסום</button></section>`; };
  const renderSavedIntent = state => { const intent = state.savedIntents.find(item => item.id === state.context.entityId); if (!intent) return renderMine(state); return `<section class="intro detail-view" data-testid="saved-intent-detail"><button class="text-link" data-action="navigate" data-route="mine">← חזרה לשלי</button>${heading('חיפוש פרטי', needLabels[intent.answers.need], `${intent.answers.area} · ${contextLabels[intent.answers.context]}`)}<p class="privacy-note">גלוי רק לך. החיפוש לא פורסם ולא הופך לפוסט.</p><button class="primary" data-action="resume-saved-intent" data-intent-id="${intent.id}">לחזור לחיפוש הזה <span>←</span></button></section>`; };

  const renderOverlay = overlay => {
    if (!overlay) return '';
    if (overlay.type === 'account-gate') { const gateAction = appState.pendingAction?.actionType; const gateSupport = gateAction === 'join' ? 'כדי שנוכל לשמור את בקשת ההצטרפות ולהחזיר אותך בדיוק לכאן.' : gateAction === 'connect' ? 'כדי שנוכל לשמור את בקשת החיבור ולהחזיר אותך בדיוק לכאן.' : 'כדי שנוכל לשמור את הפעולה ולהחזיר אותך בדיוק לכאן.'; return `<div class="scrim open" data-action="cancel-gate"></div><section class="sheet open account-gate" role="dialog" aria-modal="true"><button class="close" data-action="cancel-gate">×</button>${heading('צריך להתחבר כדי להמשיך', 'מתחברות כדי לשמור את הפעולה', gateSupport)}<p class="privacy-note">בדמו הזה ההתחברות מדומה.</p><div class="sheet-options"><button data-action="demo-auth">להתחבר ולהמשיך</button><button data-action="cancel-gate">לא עכשיו</button></div></section>`; }
    if (overlay.type === 'save-intent-consent') return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="save-intent-consent"><button class="close" data-action="close-overlay">×</button>${heading('שמירת חיפוש', 'לשמור את החיפוש הזה?', 'החיפוש יישמר בחשבון שלך להתאמות עתידיות. הוא לא יפורסם.')}<div class="sheet-options"><button data-action="confirm-save-intent">כן, לשמור את החיפוש</button><button data-action="close-overlay">לא עכשיו</button></div></section>`;
    if (overlay.type === 'replace-draft-confirm') return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="replace-draft-confirm"><button class="close" data-action="close-overlay">×</button>${heading('יש טיוטה אחרת', 'להחליף את הטיוטה הקיימת?', 'הטיוטה הקיימת תוחלף רק אם תאשרי. שום דבר לא מתפרסם בשלב הזה.')}<div class="sheet-options"><button data-action="confirm-replace-draft">להחליף וליצור טיוטה</button><button data-action="close-overlay">לשמור את הטיוטה הקיימת</button></div></section>`;
    if (overlay.type === 'report-reasons') return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="report-reasons"><button class="close" data-action="close-overlay">×</button>${heading('דיווח', 'מה הסיבה לדיווח?', 'הדיווח נשמר בחשבון ההדגמה שלך. הוא לא נשלח לבדיקת אדם ולא חושף את זהותך לצד השני.')}<div class="sheet-options">${reportReasons.map(reason => `<button data-action="confirm-report" data-report-reason="${escapeHtml(reason)}" data-entity-type="${escapeHtml(overlay.entityType)}" data-entity-id="${escapeHtml(overlay.entityId)}">${escapeHtml(reason)}</button>`).join('')}<button data-action="close-overlay">ביטול</button></div></section>`;
    if (overlay.type === 'report-confirm') return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="report-confirm"><button class="close" data-action="close-overlay">×</button>${heading('הדיווח נשמר', 'קיבלנו את הדיווח', 'קיבלנו את הדיווח. הפריט הוסתר אצלך לעת עתה.')}<div class="sheet-options"><button data-action="navigate" data-route="discover">לגילוי</button><button data-action="navigate" data-route="mine">לשלי</button></div></section>`;
    if (overlay.type === 'block-confirm') return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="block-confirm"><button class="close" data-action="close-overlay">×</button>${heading('חסימה', 'הפריט נחסם', 'לא תראי את הפריט הזה ולא תישלח פנייה חדשה לגביו דרך גם וגם.')}<div class="sheet-options"><button data-action="navigate" data-route="discover">לגילוי</button><button data-action="navigate" data-route="mine">לשלי</button></div></section>`;
    if (overlay.type === 'create-choices') return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="create-choices"><button class="close" data-action="close-overlay">×</button>${heading('אני רוצה להתחיל…', 'יוזמה, מפגש או מסגרת שמתאימה לחיים עם ילדים')}<div class="sheet-options"><button data-action="create-type" data-create-type="initiative">🌱 יוזמה</button><button data-action="create-type" data-create-type="place">🏡 מקום</button></div></section>`;
    if (overlay.type !== 'start') return '';
    return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="start-sheet"><button class="close" data-action="close-overlay">×</button>${heading('הצעד הראשון', 'מה היית רוצה לעשות?')}<div class="sheet-options"><button data-action="start-find">🔎 אני מחפשת…<small>אנשים, מקום, עבודה, שירות או הזדמנות</small></button><button data-action="start-create">🌱 אני רוצה להתחיל…<small>יוזמה, מפגש או מסגרת שמתאימה לחיים עם ילדים</small></button><button data-action="start-offer">✨ יש לי מה להציע<small>שירות, פעילות, מקום, ידע או עזרה מקצועית</small></button></div></section>`;
  };
  const rendererRegistry = { discover: renderDiscover, inspiration: renderInspiration, mine: renderMine, preview: renderPreview, 'initiative-detail': renderDetail, 'place-detail': renderDetail, 'offering-detail': renderDetail, job: renderDetail };
  const render = state => { const route = state.route.name; let html; if (/^search\/(q1|q2|q3)$/.test(route)) html = renderSearchQuestion(state, route.split('/')[1]); else if (resultRoutes.has(route)) html = renderSearchOutcome(state); else if (/^create\//.test(route)) html = renderCreateForm(state); else if (route === 'preview') html = renderPreview(state); else if (/^publish-success\//.test(route)) html = renderSuccess(state); else if (/^published\//.test(route)) html = renderCreated(state); else if (/^manage-initiative\//.test(route)) html = renderManageInitiative(state); else if (/^saved-intent\//.test(route)) html = renderSavedIntent(state); else { const baseRoute = route.split('/')[0]; const renderer = rendererRegistry[route] || rendererRegistry[baseRoute] || rendererRegistry.discover; html = renderer(state); } html = html.replaceAll('← חזרה', 'חזרה →').replaceAll('← לשאלה', 'לשאלה →').replaceAll('← לעריכת', 'לעריכת →').replaceAll('← עריכת', 'עריכת →'); appRoot.innerHTML = html; overlayRoot.innerHTML = renderOverlay(state.ui.overlay); };

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
      case 'request-report': { const item = seedByTypeAndId(payload.entityType, payload.entityId); if (!item || isHiddenEntity(item.type, item.id)) break; transition({ ui: { overlay: { type: 'report-reasons', entityType: item.type, entityId: item.id } } }); render(appState); break; }
      case 'confirm-report': { const item = seedByTypeAndId(payload.entityType, payload.entityId); if (!item || !reportReasons.includes(payload.reportReason)) break; const key = entityKey(item.type, item.id); const reports = appState.reports.some(report => report.entityKey === key) ? appState.reports : [...appState.reports, { id: `report:${key}`, entityKey: key, reason: payload.reportReason, createdAt: Date.now() }]; transition({ reports, ui: { overlay: { type: 'report-confirm', entityType: item.type, entityId: item.id } }, pendingAction: null }); render(appState); break; }
      case 'block-entity': { const item = seedByTypeAndId(payload.entityType, payload.entityId); if (!item) break; const key = entityKey(item.type, item.id); const blockedEntityIds = appState.blockedEntityIds.includes(key) ? appState.blockedEntityIds : [...appState.blockedEntityIds, key]; const connections = appState.connections.map(connection => connection.entityType === item.type && connection.entityId === item.id ? { ...connection, status: 'inactive' } : connection); transition({ blockedEntityIds, connections, ui: { overlay: { type: 'block-confirm', entityType: item.type, entityId: item.id } }, pendingAction: null }); render(appState); break; }
      case 'open-created': { const item = createdById(payload.createdId); if (item) navigate(`published/${item.id}`); else navigate('mine', { replace: true }); break; }
      case 'manage-initiative': { const item = createdById(payload.createdId); if (item?.type === 'initiative') navigate(`manage-initiative/${item.id}`); else navigate('mine', { replace: true }); break; }
      case 'set-initiative-need-state': { const item = createdById(payload.createdId); const validKey = ['people', 'place', 'educator'].includes(payload.needKey); const validState = ['open', 'paused'].includes(payload.needState); if (!item || item.type !== 'initiative' || !validKey || !validState) break; const createdItems = appState.createdItems.map(candidate => candidate.id === item.id ? { ...candidate, needStates: { ...normalizeNeedStates(candidate.needStates), [payload.needKey]: payload.needState } } : candidate); transition({ createdItems }); render(appState); break; }
      case 'open-saved-intent': { const intent = appState.savedIntents.find(item => item.id === payload.savedIntentId); if (intent) navigate(`saved-intent/${intent.id}`); else navigate('mine', { replace: true }); break; }
      case 'resume-saved-intent': { const intent = appState.savedIntents.find(item => item.id === payload.savedIntentId); if (!intent) { navigate('mine', { replace: true }); break; } transition({ search: { answers: { ...intent.answers }, outcome: evaluateSearch(intent.answers).outcome } }); navigate(`search/${evaluateSearch(intent.answers).outcome}`); break; }
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
      case 'select-field': { const draft = normalizeDraft(appState.flow.draft, appState.flow.type); if (!draft || !draftFields.includes(payload.field) || typeof payload.value !== 'string') break; transition({ flow: { draft: { ...draft, [payload.field]: payload.value }, validationErrors: [] } }); render(appState); break; }
      case 'preview-draft': { if (!normalizeDraft(appState.flow.draft, appState.flow.type)) break; transition({ flow: { step: 'preview', validationErrors: [] } }); navigate('preview'); break; }
      case 'edit-draft': { const type = appState.flow.draft?.type || appState.flow.type; if (createTypes.has(type)) { transition({ flow: { step: 'form', validationErrors: [] } }); navigate(`create/${type}`); } break; }
      case 'publish-draft': publishDraft(); break;
      case 'publish': { const draft = normalizeDraft(appState.flow.draft, appState.flow.type); if (!draft || appState.auth.status !== 'authenticated' || appState.flow.step === 'published') break; const errors = validateDraft(draft); if (errors.length) { transition({ flow: { validationErrors: errors } }); render(appState); break; } const id = `created-${draft.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; const item = { ...draft, id, needStates: draft.type === 'initiative' ? normalizeNeedStates() : null, publishedAt: Date.now() }; const createdItems = appState.createdItems.some(candidate => candidate.id === id) ? appState.createdItems : [...appState.createdItems, item]; transition({ createdItems, pendingAction: null, ui: { overlay: null }, flow: { type: draft.type, step: 'published', draft: null, targetId: id, targetType: draft.type, validationErrors: [] } }); navigate(`publish-success/${id}`); break; }
      case 'join':
      case 'connect': { const item = seedByTypeAndId(payload.entityType, payload.entityId); const valid = item && ((action === 'join' && item.type === 'initiative') || (action === 'connect' && item.type === 'offering')); if (!valid || isHiddenEntity(item.type, item.id)) break; if (appState.auth.status !== 'authenticated' && !payload.continue) { const originRoute = appState.route.name; transition({ pendingAction: { id: `${action}:${item.id}:${Date.now()}`, actionType: action, originRoute, originContext: { ...appState.context }, payload: { entityType: item.type, entityId: item.id }, continuation: action, createdAt: Date.now(), version: pendingVersion }, ui: { overlay: { type: 'account-gate' } } }); render(appState); break; } const id = `${action}:${item.id}`; const connections = appState.connections.some(connection => connection.id === id && connection.status !== 'inactive') ? appState.connections : [...appState.connections.filter(connection => connection.id !== id), { id, actionType: action, entityType: item.type, entityId: item.id, status: 'requested', createdAt: Date.now() }]; transition({ connections, ui: { overlay: null }, pendingAction: null, flow: { type: action, step: 'confirmed', targetId: item.id, targetType: item.type } }); render(appState); break; }
      case 'demo-auth': { const pending = normalizePendingAction(appState.pendingAction); if (!pending) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; } if (pending.originRoute !== appState.route.name || pending.originContext.entityType !== appState.context.entityType || pending.originContext.entityId !== appState.context.entityId) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; } if (pending.actionType === 'publish') { const draft = normalizeDraft(appState.flow.draft, pending.payload.draftType); if (!draft || draft.id !== pending.payload.draftId) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; } transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); dispatch('publish', { continue: true }); break; } if (pending.actionType === 'save-intent') { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); dispatch('save-intent', { ...pending.payload, continue: true }); break; } const item = seedByTypeAndId(pending.payload.entityType, pending.payload.entityId); if (!item) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; } transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); dispatch(pending.continuation, { ...pending.payload, continue: true }, pending.originContext); break; }
      default: break;
    }
  };
  const handleAction = event => { const target = event.target.closest('[data-action], [data-route]'); if (!target) return; const action = target.dataset.action || 'navigate'; event.preventDefault(); dispatch(action, { route: target.dataset.route || 'discover', entityType: target.dataset.entityType, entityId: target.dataset.entityId, createdId: target.dataset.createdId || target.dataset.itemId, savedIntentId: target.dataset.savedIntentId || target.dataset.intentId, inspirationModelId: target.dataset.inspirationModelId, createType: target.dataset.createType, searchField: target.dataset.searchField, searchValue: target.dataset.searchValue, reportReason: target.dataset.reportReason, needKey: target.dataset.needKey, needState: target.dataset.needState, field: target.dataset.field, value: target.dataset.fieldValue }, appState.context); };
  const handleInput = event => { const target = event.target.closest('[data-field]'); if (target) dispatch('update-draft', { field: target.dataset.field, value: target.value }); };
  const initializeState = () => { appState = initialState(); return appState; };
  const registerEventOwners = () => { document.addEventListener('click', handleAction); document.addEventListener('input', handleInput); window.addEventListener('popstate', restoreRouteAndContext); };
  const boot = () => { initializeState(); restoreRouteAndContext(); registerEventOwners(); };
  window.__foundation = Object.freeze({ getState: () => appState, boot, initializeState, dispatch, navigate, restoreRouteAndContext, render, rendererRegistry });
  boot();
})();
