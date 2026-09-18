/* Clean Functional V1 Foundation shell — Slice 3 Creation. */
(function foundationShell() {
  'use strict';

  const appRoot = document.querySelector('#app');
  const overlayRoot = document.querySelector('#modal');
  const stateKey = 'gv-foundation-state';
  const routeRegistry = new Set(['discover', 'mine', 'preview', 'initiative-detail', 'place-detail', 'offering-detail', 'job']);
  const createTypes = new Set(['initiative', 'offering', 'place']);
  const pendingVersion = 1;

  const seed = {
    initiative: { id: 'initiative-pt', type: 'initiative', eyebrow: 'יוזמה · פתח תקווה', title: 'מחפשות עוד 2–3 משפחות לבקרים משותפים', description: 'שתי אמהות לילדים בני 1.5–3 רוצות להתחיל רוטציה פעמיים בשבוע.', area: 'פתח תקווה' },
    place: { id: 'place-hod-hasharon', type: 'place', eyebrow: 'מקום · הוד השרון', title: 'סטודיו פנוי בבקרים עם חצר קטנה', description: 'פתוח לקבוצה קבועה.', area: 'הוד השרון' },
    offer: { id: 'offering-statistics', type: 'offering', eyebrow: 'שירות מקצועי · Online', title: 'עזרה בסטטיסטיקה לסטודנטיות', description: 'עזרה מקצועית מרחוק.', area: 'Online' },
    job: { id: 'job-research-operations', type: 'job', eyebrow: 'משרה · Hybrid', title: 'Research Operations · 60%', description: 'גמישות ושילוב בית.', area: 'Hybrid' }
  };

  const initialState = () => ({ route: { name: 'discover' }, context: { entityType: null, entityId: null }, ui: { overlay: null }, auth: { status: 'anonymous' }, flow: { type: null, step: null, answers: {}, draft: null, targetId: null, targetType: null, validationErrors: [] }, createdItems: [], pendingAction: null });
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
    return { ...defaults, type, step: typeof value.step === 'string' ? value.step : null, answers: isRecord(value.answers) ? value.answers : {}, draft: normalizeDraft(value.draft, createTypes.has(type) ? type : null), targetId: typeof value.targetId === 'string' ? value.targetId : null, targetType: typeof value.targetType === 'string' ? value.targetType : null, validationErrors: Array.isArray(value.validationErrors) ? value.validationErrors.filter(item => typeof item === 'string').slice(0, 5) : [] };
  };
  const normalizeCreatedItem = value => {
    if (!isRecord(value) || typeof value.id !== 'string' || !createTypes.has(value.type)) return null;
    return { ...makeDraft(value.type, value), publishedAt: typeof value.publishedAt === 'number' ? value.publishedAt : 0 };
  };
  const normalizeCreatedItems = value => Array.isArray(value) ? value.map(normalizeCreatedItem).filter(Boolean).slice(-30) : [];

  const seedByTypeAndId = (type, id) => Object.values(seed).find(item => item.type === type && item.id === id) || null;
  const routeParts = (route, createdItems = appState.createdItems) => {
    const value = String(route || '');
    if (/^create\/(initiative|offering|place)$/.test(value)) return { name: value, entityType: 'create', entityId: value.split('/')[1] };
    if (value === 'preview') return { name: value, entityType: 'preview', entityId: null };
    const success = /^publish-success\/([^/]+)$/.exec(value);
    if (success && createdItems.some(item => item.id === success[1])) return { name: value, entityType: 'created', entityId: success[1] };
    const match = /^([^/]+)\/([^/]+)$/.exec(value);
    if (!match || !routeRegistry.has(match[1])) return null;
    const type = match[1] === 'offering-detail' ? 'offering' : match[1].replace(/-detail$/, '');
    return seedByTypeAndId(type, match[2]) ? { name: `${match[1]}/${match[2]}`, entityType: type, entityId: match[2] } : null;
  };
  const resolveRoute = (route, createdItems = appState.createdItems) => {
    if (route === 'discover' || route === 'mine' || route === 'preview') return route;
    return routeParts(route, createdItems)?.name || 'discover';
  };

  const normalizePendingAction = value => {
    if (!isRecord(value) || value.version !== pendingVersion || !['join', 'connect', 'publish'].includes(value.actionType)) return null;
    if (typeof value.id !== 'string' || typeof value.originRoute !== 'string' || typeof value.createdAt !== 'number') return null;
    const originRoute = resolveRoute(value.originRoute);
    if (originRoute === 'discover' && value.originRoute !== 'discover') return null;
    if (!isRecord(value.originContext) || !isRecord(value.payload) || value.continuation !== value.actionType) return null;
    if (value.actionType === 'publish') {
      if (value.originRoute !== 'preview' || typeof value.payload.draftId !== 'string' || !createTypes.has(value.payload.draftType)) return null;
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
    const status = isRecord(value.auth) && (value.auth.status === 'anonymous' || value.auth.status === 'authenticated') ? value.auth.status : defaults.auth.status;
    return { ...defaults, route: { name: resolveRoute(isRecord(value.route) ? value.route.name : defaults.route.name, createdItems) }, context: normalizeContext(value.context), ui: { overlay: isRecord(value.ui) && ['start', 'create-choices', 'account-gate'].includes(value.ui.overlay?.type) ? { type: value.ui.overlay.type } : null }, auth: { status }, flow: normalizeFlow(value.flow), createdItems, pendingAction: normalizePendingAction(value.pendingAction) };
  };
  const readPersistedState = () => {
    try { const value = sessionStorage.getItem(stateKey); return value ? normalizePersistedState(JSON.parse(value)) : null; } catch (_) { sessionStorage.removeItem(stateKey); return null; }
  };
  const persistState = state => { try { sessionStorage.setItem(stateKey, JSON.stringify({ flow: state.flow, auth: state.auth, pendingAction: state.pendingAction, context: state.context, route: state.route, ui: state.ui, createdItems: state.createdItems })); } catch (_) { /* memory remains authoritative */ } };
  const transition = patch => {
    appState = { ...appState, ...patch, route: patch.route ? { ...appState.route, ...patch.route } : appState.route, context: patch.context ? { ...appState.context, ...patch.context } : appState.context, ui: patch.ui ? { ...appState.ui, ...patch.ui } : appState.ui, auth: patch.auth ? { ...appState.auth, ...patch.auth } : appState.auth, flow: patch.flow ? { ...appState.flow, ...patch.flow } : appState.flow, createdItems: patch.createdItems ? patch.createdItems : appState.createdItems };
    persistState(appState);
    return appState;
  };

  const createdById = id => appState.createdItems.find(item => item.id === id) || null;
  const routeForEntity = (type, id) => `${type === 'job' ? 'job' : type === 'offering' ? 'offering-detail' : `${type}-detail`}/${id}`;
  const routeFromLocation = () => window.location.hash.replace(/^#/, '').trim() || 'discover';
  const writeLocation = (route, replace) => { const hash = `#${route}`; if (window.location.hash !== hash) window.history[replace ? 'replaceState' : 'pushState']({}, '', hash); };
  const navigate = (requestedRoute, options = {}) => {
    const route = resolveRoute(requestedRoute);
    writeLocation(route, Boolean(options.replace));
    const parsed = routeParts(route);
    const context = parsed && ['initiative', 'place', 'offering', 'job'].includes(parsed.entityType) ? { entityType: parsed.entityType, entityId: parsed.entityId } : { entityType: null, entityId: null };
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
    const createMatch = /^create\/(initiative|offering|place)$/.exec(route);
    if (createMatch && (!flow.draft || flow.draft.type !== createMatch[1])) flow = { ...flow, type: createMatch[1], step: 'form', draft: makeDraft(createMatch[1]), validationErrors: [] };
    if (route === 'preview' && (!flow.draft || !createTypes.has(flow.draft.type))) { route = 'discover'; ui = { overlay: null }; pendingAction = null; }
    if (/^publish-success\//.test(route) && !routeParts(route, persisted.createdItems)) { route = 'discover'; ui = { overlay: null }; pendingAction = null; }
    const parsed = routeParts(route, persisted.createdItems);
    const context = parsed && ['initiative', 'place', 'offering', 'job'].includes(parsed.entityType) ? { entityType: parsed.entityType, entityId: parsed.entityId } : { entityType: null, entityId: null };
    transition({ route: { name: route }, context, ui, auth: persisted.auth, flow, pendingAction, createdItems: persisted.createdItems });
    writeLocation(route, true);
    render(appState);
  };

  const renderCard = kind => { const item = seed[kind]; return `<article class="card ${kind === 'initiative' ? 'featured' : ''}"><span class="context">${item.eyebrow}</span><h2>${item.title}</h2><p>${item.description}</p><div class="signals"><span>מתאים להורים</span><span>${kind === 'job' ? 'חלקית' : 'אזור כללי'}</span></div>${actionButton('לפרטים', 'open-detail', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`)}</article>`; };
  const renderDiscover = () => `<section class="intro">${heading('קהילה שמפנה מקום לשני הצדדים', 'גם לעבוד.<br><em>גם להיות קרובים.</em>', 'להמשיך לעבוד, ללמוד ולהתפתח — תוך קרבה לילדים.')}${actionButton('מה יעזור לך עכשיו?', 'open-start')}</section><nav class="filters"><button class="filter active" data-action="navigate" data-route="discover">הכול</button><button class="filter" data-action="navigate" data-route="discover">השראה</button><button class="filter" data-action="navigate" data-route="discover">עבודה והתפתחות</button></nav><section class="feed"><div style="grid-column:span 7">${renderCard('initiative')}</div><div class="split-cards"><div class="place">${renderCard('place')}</div><div class="care">${renderCard('offer')}</div></div>${renderCard('job')}<article class="action-card">${heading('לא מצאת עדיין?', 'ספרי מה יעזור לך — ונחפש.')}${actionButton('להתחיל לחפש', 'navigate', ' data-route="discover"')}</article></section>`;
  const renderDetail = state => { const item = seedByTypeAndId(state.context.entityType, state.context.entityId); if (!item) return renderDiscover(state); const protectedAction = item.type === 'initiative' ? actionButton('להצטרף ליוזמה', 'join', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`) : item.type === 'offering' ? actionButton('להתחבר', 'connect', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`) : ''; const confirmed = state.flow.step === 'confirmed' && state.flow.targetId === item.id; const confirmation = confirmed ? `<div class="confirmation" role="status"><p class="eyebrow">הפעולה הושלמה</p><h2>${state.flow.type === 'join' ? 'הצטרפת ליוזמה' : 'בקשת החיבור נשלחה'}</h2><p>${item.title}</p></div>` : protectedAction; return `<section class="intro detail-view"><button class="text-link" data-action="navigate" data-route="discover">← חזרה לגילוי</button>${heading(item.eyebrow, item.title, item.description)}<div class="detail-meta"><p>${item.area}</p><span>מתאים להורים</span></div>${confirmation}</section>`; };

  const field = (label, name, value, multiline = false, required = false) => `<label class="field"><span>${label}${required ? ' *' : ''}</span>${multiline ? `<textarea name="${name}" data-field="${name}" rows="4">${escapeHtml(value)}</textarea>` : `<input name="${name}" data-field="${name}" value="${escapeHtml(value)}" autocomplete="off">`}</label>`;
  const draftTypeLabel = type => ({ initiative: 'יוזמה', offering: 'הצעה', place: 'מקום' }[type] || 'יצירה');
  const renderCreateForm = state => {
    const draft = state.flow.draft;
    if (!draft) return renderDiscover(state);
    const optional = draft.type === 'initiative' ? `${field('גילאי הילדים', 'childAges', draft.childAges)}${field('ימים ושעות', 'daysTimes', draft.daysTimes)}${field('מקום', 'place', draft.place)}${field('צוות / מדריכה', 'educator', draft.educator)}${field('פעילות', 'activity', draft.activity)}${field('תקציב', 'budget', draft.budget)}${field('כמה אנשים צריך', 'peopleNeeded', draft.peopleNeeded)}` : draft.type === 'offering' ? `${field('סוג ההצעה', 'serviceType', draft.serviceType)}${field('מחיר', 'price', draft.price)}` : `${field('סוג המקום / שימוש', 'place', draft.place)}${field('זמינות', 'availability', draft.availability)}${field('קיבולת', 'capacity', draft.capacity)}${field('מתאים לילדים', 'childSuitability', draft.childSuitability)}${field('מתקנים', 'facilities', draft.facilities)}${field('מחיר', 'price', draft.price)}${field('תמונות', 'photos', draft.photos)}`;
    return `<section class="intro creation-view" data-testid="create-form"><button class="text-link" data-action="navigate" data-route="discover">← ביטול</button>${heading(`יצירת ${draftTypeLabel(draft.type)}`, `יוצרות ${draftTypeLabel(draft.type)}`, 'אפשר להתחיל בקטן ולשמור טיוטה.')}<div class="creation-form">${field(draft.type === 'place' ? 'שם המקום' : 'כותרת', 'title', draft.title, false, true)}${field('אזור או Online', 'area', draft.area, false, true)}${field('מה חשוב לדעת', 'description', draft.description, true, true)}${optional}<div class="form-actions">${actionButton('לתצוגה מקדימה', 'preview-draft')}<button class="secondary" data-action="navigate" data-route="discover">לשמור ולהמשיך אחר כך</button></div></div></section>`;
  };
  const validateDraft = draft => { const errors = []; if (!draft || !draft.title.trim()) errors.push('צריך להוסיף כותרת.'); if (!draft || !draft.area.trim()) errors.push('צריך להוסיף אזור או לציין Online.'); if (!draft || draft.description.trim().length < 5) errors.push('צריך להוסיף תיאור קצר וברור.'); return errors; };
  const renderPreview = state => {
    const draft = state.flow.draft;
    if (!draft) return renderDiscover(state);
    const errors = state.flow.validationErrors || [];
    const errorBlock = errors.length ? `<div class="validation" role="alert" data-testid="publish-validation"><strong>עוד רגע — חסר מידע לפרסום:</strong><ul>${errors.map(error => `<li>${escapeHtml(error)}</li>`).join('')}</ul><p>אפשר לחזור לעריכה ולהשלים את הטיוטה.</p></div>` : '';
    return `<section class="intro creation-view" data-testid="preview"><button class="text-link" data-action="edit-draft">← עריכת הטיוטה</button>${heading(`תצוגה מקדימה · ${draftTypeLabel(draft.type)}`, draft.title || 'טיוטה ללא כותרת', draft.description || 'עדיין לא הוספת תיאור.')}${errorBlock}<div class="preview-card"><p class="eyebrow">${escapeHtml(draft.area || 'אזור לא הוגדר')}</p><h2>${escapeHtml(draft.title || 'ללא כותרת')}</h2><p>${escapeHtml(draft.description || 'אין עדיין תיאור')}</p>${draft.serviceType ? `<p><strong>סוג ההצעה:</strong> ${escapeHtml(draft.serviceType)}</p>` : ''}${draft.place ? `<p><strong>מקום / שימוש:</strong> ${escapeHtml(draft.place)}</p>` : ''}</div><div class="form-actions">${actionButton('לפרסם', 'publish-draft')}<button class="secondary" data-action="edit-draft">לחזור לעריכה</button></div></section>`;
  };
  const renderSuccess = state => { const item = createdById(state.context.entityId || state.flow.targetId); if (!item) return renderDiscover(state); return `<section class="intro creation-view publish-success" data-testid="publish-success">${heading('הפרסום הצליח', 'זה באוויר 🎉', 'הפרסום נשמר בחשבון ההדגמה שלך.')}<div class="preview-card"><p class="eyebrow">${draftTypeLabel(item.type)} · ${escapeHtml(item.area)}</p><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p></div><div class="form-actions"><button class="primary" data-action="navigate" data-route="mine">לראות ב״שלי״ <span>←</span></button><button class="secondary" data-action="start">ליצור עוד משהו</button></div></section>`; };
  const renderMine = state => { const items = state.createdItems || []; const cards = items.length ? items.map(item => `<article class="card created-item" data-created-id="${escapeHtml(item.id)}"><span class="context">${draftTypeLabel(item.type)} · ${escapeHtml(item.area)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p><span class="signals"><span>פורסם בחשבון שלך</span></span></article>`).join('') : '<p class="lede">עדיין אין כאן פרסומים. אפשר להתחיל דרך כפתור ה＋.</p>'; return `<section class="intro mine-view" data-testid="mine"><button class="text-link" data-action="navigate" data-route="discover">← חזרה לגילוי</button>${heading('שלי', 'הפרסומים שלי', 'כאן נשמור את הדברים שיצרת.')}<div class="created-list">${cards}</div></section>`; };

  const renderOverlay = overlay => {
    if (!overlay) return '';
    if (overlay.type === 'account-gate') return `<div class="scrim open" data-action="cancel-gate"></div><section class="sheet open account-gate" role="dialog" aria-modal="true"><button class="close" data-action="cancel-gate">×</button>${heading('נדרש חשבון', 'מתחברות כדי להמשיך', 'זהו חשבון הדגמה — ללא פרטים אישיים.')}<div class="sheet-options"><button data-action="demo-auth">להתחבר ולהמשיך</button><button data-action="cancel-gate">ביטול</button></div></section>`;
    if (overlay.type === 'create-choices') return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="create-choices"><button class="close" data-action="close-overlay">×</button>${heading('ליצור משהו', 'מה תרצי ליצור?')}<div class="sheet-options"><button data-action="create-type" data-create-type="initiative">🌱 יוזמה</button><button data-action="create-type" data-create-type="place">🏡 מקום</button></div></section>`;
    if (overlay.type !== 'start') return '';
    return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true" data-testid="start-sheet"><button class="close" data-action="close-overlay">×</button>${heading('הצעד הראשון', 'מה היית רוצה לעשות?')}<div class="sheet-options"><button data-action="start-create">🌱 ליצור משהו</button><button data-action="start-find">🔎 למצוא משהו</button><button data-action="start-offer">✨ להציע משהו</button></div></section>`;
  };
  const rendererRegistry = { discover: renderDiscover, mine: renderMine, preview: renderPreview, 'initiative-detail': renderDetail, 'place-detail': renderDetail, 'offering-detail': renderDetail, job: renderDetail };
  const render = state => { const route = state.route.name; let html; if (/^create\//.test(route)) html = renderCreateForm(state); else if (route === 'preview') html = renderPreview(state); else if (/^publish-success\//.test(route)) html = renderSuccess(state); else { const baseRoute = route.split('/')[0]; const renderer = rendererRegistry[route] || rendererRegistry[baseRoute] || rendererRegistry.discover; html = renderer(state); } appRoot.innerHTML = html; overlayRoot.innerHTML = renderOverlay(state.ui.overlay); };

  const beginCreate = type => { if (!createTypes.has(type)) return; const draft = makeDraft(type); transition({ flow: { type, step: 'form', draft, validationErrors: [] }, ui: { overlay: null } }); navigate(`create/${type}`); };
  const publishDraft = () => { const draft = normalizeDraft(appState.flow.draft, appState.flow.type); const errors = validateDraft(draft); if (errors.length) { transition({ flow: { validationErrors: errors } }); render(appState); return; } if (appState.flow.step === 'published' || appState.flow.step === 'success') return; if (appState.auth.status !== 'authenticated') { transition({ pendingAction: { id: `publish:${draft.id}:${Date.now()}`, actionType: 'publish', originRoute: 'preview', originContext: { ...appState.context }, payload: { draftId: draft.id, draftType: draft.type }, continuation: 'publish', createdAt: Date.now(), version: pendingVersion }, ui: { overlay: { type: 'account-gate' } }, flow: { draft, validationErrors: [] } }); render(appState); return; } dispatch('publish', { continue: true }); };

  const dispatch = (action, payload = {}, context = {}) => {
    switch (action) {
      case 'navigate': navigate(payload.route || 'discover', { context }); break;
      case 'open-detail': { const item = seedByTypeAndId(payload.entityType, payload.entityId); if (item) navigate(routeForEntity(payload.entityType, payload.entityId), { context: { entityType: payload.entityType, entityId: payload.entityId } }); else navigate('discover', { replace: true }); break; }
      case 'start':
      case 'open-start': transition({ ui: { overlay: { type: 'start' } } }); render(appState); break;
      case 'close-overlay': transition({ ui: { overlay: null } }); render(appState); break;
      case 'cancel-gate': transition({ ui: { overlay: null }, pendingAction: null }); render(appState); break;
      case 'start-create': transition({ ui: { overlay: { type: 'create-choices' } } }); render(appState); break;
      case 'start-find': transition({ ui: { overlay: null } }); navigate('discover'); break;
      case 'start-offer': beginCreate('offering'); break;
      case 'create-type': beginCreate(payload.createType); break;
      case 'update-draft': { const draft = normalizeDraft(appState.flow.draft, appState.flow.type); if (!draft || !draftFields.includes(payload.field)) break; transition({ flow: { draft: { ...draft, [payload.field]: String(payload.value ?? '') }, validationErrors: [] } }); break; }
      case 'preview-draft': { if (!normalizeDraft(appState.flow.draft, appState.flow.type)) break; transition({ flow: { step: 'preview', validationErrors: [] } }); navigate('preview'); break; }
      case 'edit-draft': { const type = appState.flow.draft?.type || appState.flow.type; if (createTypes.has(type)) { transition({ flow: { step: 'form', validationErrors: [] } }); navigate(`create/${type}`); } break; }
      case 'publish-draft': publishDraft(); break;
      case 'publish': { const draft = normalizeDraft(appState.flow.draft, appState.flow.type); if (!draft || appState.auth.status !== 'authenticated' || appState.flow.step === 'published') break; const errors = validateDraft(draft); if (errors.length) { transition({ flow: { validationErrors: errors } }); render(appState); break; } const id = `created-${draft.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; const item = { ...draft, id, publishedAt: Date.now() }; const createdItems = appState.createdItems.some(candidate => candidate.id === id) ? appState.createdItems : [...appState.createdItems, item]; transition({ createdItems, pendingAction: null, ui: { overlay: null }, flow: { type: draft.type, step: 'published', draft: null, targetId: id, targetType: draft.type, validationErrors: [] } }); navigate(`publish-success/${id}`); break; }
      case 'join':
      case 'connect': { const item = seedByTypeAndId(payload.entityType, payload.entityId); const valid = item && ((action === 'join' && item.type === 'initiative') || (action === 'connect' && item.type === 'offering')); if (!valid) break; if (appState.auth.status !== 'authenticated' && !payload.continue) { const originRoute = appState.route.name; transition({ pendingAction: { id: `${action}:${item.id}:${Date.now()}`, actionType: action, originRoute, originContext: { ...appState.context }, payload: { entityType: item.type, entityId: item.id }, continuation: action, createdAt: Date.now(), version: pendingVersion }, ui: { overlay: { type: 'account-gate' } } }); render(appState); break; } transition({ ui: { overlay: null }, pendingAction: null, flow: { type: action, step: 'confirmed', targetId: item.id, targetType: item.type } }); render(appState); break; }
      case 'demo-auth': { const pending = normalizePendingAction(appState.pendingAction); if (!pending) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; } if (pending.originRoute !== appState.route.name || pending.originContext.entityType !== appState.context.entityType || pending.originContext.entityId !== appState.context.entityId) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; } if (pending.actionType === 'publish') { const draft = normalizeDraft(appState.flow.draft, pending.payload.draftType); if (!draft || draft.id !== pending.payload.draftId) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; } transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); dispatch('publish', { continue: true }); break; } const item = seedByTypeAndId(pending.payload.entityType, pending.payload.entityId); if (!item) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; } transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); dispatch(pending.continuation, { ...pending.payload, continue: true }, pending.originContext); break; }
      default: break;
    }
  };
  const handleAction = event => { const target = event.target.closest('[data-action], [data-route]'); if (!target) return; const action = target.dataset.action || 'navigate'; event.preventDefault(); dispatch(action, { route: target.dataset.route || 'discover', entityType: target.dataset.entityType, entityId: target.dataset.entityId, createType: target.dataset.createType }, appState.context); };
  const handleInput = event => { const target = event.target.closest('[data-field]'); if (target) dispatch('update-draft', { field: target.dataset.field, value: target.value }); };
  const initializeState = () => { appState = initialState(); return appState; };
  const registerEventOwners = () => { document.addEventListener('click', handleAction); document.addEventListener('input', handleInput); window.addEventListener('popstate', restoreRouteAndContext); };
  const boot = () => { initializeState(); restoreRouteAndContext(); registerEventOwners(); };
  window.__foundation = Object.freeze({ getState: () => appState, boot, initializeState, dispatch, navigate, restoreRouteAndContext, render, rendererRegistry });
  boot();
})();
