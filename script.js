/* Clean Functional V1 Foundation shell — Slice 0. */
(function foundationShell() {
  'use strict';

  const appRoot = document.querySelector('#app');
  const overlayRoot = document.querySelector('#modal');
  const stateKey = 'gv-foundation-state';
  const routeRegistry = new Set(['discover', 'initiative-detail', 'place-detail', 'offering-detail', 'job']);
  const pendingVersion = 1;

  const seed = {
    initiative: { id: 'initiative-pt', type: 'initiative', eyebrow: 'יוזמה · פתח תקווה', title: 'מחפשות עוד 2–3 משפחות לבקרים משותפים', description: 'שתי אמהות לילדים בני 1.5–3 רוצות להתחיל רוטציה פעמיים בשבוע.', area: 'פתח תקווה' },
    place: { id: 'place-hod-hasharon', type: 'place', eyebrow: 'מקום · הוד השרון', title: 'סטודיו פנוי בבקרים עם חצר קטנה', description: 'פתוח לקבוצה קבועה.', area: 'הוד השרון' },
    offer: { id: 'offering-statistics', type: 'offering', eyebrow: 'שירות מקצועי · Online', title: 'עזרה בסטטיסטיקה לסטודנטיות', description: 'עזרה מקצועית מרחוק.', area: 'Online' },
    job: { id: 'job-research-operations', type: 'job', eyebrow: 'משרה · Hybrid', title: 'Research Operations · 60%', description: 'גמישות ושילוב בית.', area: 'Hybrid' }
  };

  const initialState = () => ({ route: { name: 'discover' }, context: { entityType: null, entityId: null }, ui: { overlay: null }, auth: { status: 'anonymous' }, flow: { type: null, step: null, answers: {}, draft: null }, pendingAction: null });
  let appState = initialState();

  const heading = (eyebrow, title, lede = '') => `<p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}`;
  const actionButton = (label, action, extra = '') => `<button class="primary" data-action="${action}"${extra}>${label} <span>←</span></button>`;

  const isRecord = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  const normalizeContext = value => isRecord(value) ? {
    entityType: typeof value.entityType === 'string' ? value.entityType : null,
    entityId: typeof value.entityId === 'string' ? value.entityId : null
  } : { entityType: null, entityId: null };
  const normalizeFlow = value => {
    if (!isRecord(value)) return initialState().flow;
    return {
      type: typeof value.type === 'string' ? value.type : null,
      step: typeof value.step === 'string' ? value.step : null,
      answers: isRecord(value.answers) ? value.answers : {},
      draft: isRecord(value.draft) ? value.draft : null,
      targetId: typeof value.targetId === 'string' ? value.targetId : null,
      targetType: typeof value.targetType === 'string' ? value.targetType : null
    };
  };
  const normalizePendingAction = value => {
    if (!isRecord(value) || value.version !== pendingVersion || !['join', 'connect'].includes(value.actionType)) return null;
    if (typeof value.id !== 'string' || typeof value.originRoute !== 'string' || typeof value.createdAt !== 'number') return null;
    const originRoute = resolveRoute(value.originRoute);
    if (originRoute === 'discover' && value.originRoute !== 'discover') return null;
    if (!isRecord(value.originContext) || !isRecord(value.payload) || value.continuation !== value.actionType) return null;
    const expectedType = value.actionType === 'join' ? 'initiative' : 'offering';
    if (value.payload.entityType !== expectedType || typeof value.payload.entityId !== 'string') return null;
    return { id: value.id, actionType: value.actionType, originRoute, originContext: normalizeContext(value.originContext), payload: value.payload, continuation: value.continuation, createdAt: value.createdAt, version: pendingVersion };
  };
  const normalizePersistedState = value => {
    const defaults = initialState();
    if (!isRecord(value)) return defaults;
    const status = isRecord(value.auth) && (value.auth.status === 'anonymous' || value.auth.status === 'authenticated') ? value.auth.status : defaults.auth.status;
    return {
      ...defaults,
      route: { name: resolveRoute(isRecord(value.route) ? value.route.name : defaults.route.name) },
      context: normalizeContext(value.context),
      ui: { overlay: isRecord(value.ui) && ['start', 'account-gate'].includes(value.ui.overlay?.type) ? { type: value.ui.overlay.type } : null },
      auth: { status },
      flow: normalizeFlow(value.flow),
      pendingAction: normalizePendingAction(value.pendingAction)
    };
  };

  const readPersistedState = () => {
    try {
      const value = sessionStorage.getItem(stateKey);
      if (!value) return null;
      const parsed = JSON.parse(value);
      return normalizePersistedState(parsed);
    } catch (_) {
      sessionStorage.removeItem(stateKey);
      return null;
    }
  };

  const persistState = state => {
    try { sessionStorage.setItem(stateKey, JSON.stringify({ flow: state.flow, auth: state.auth, pendingAction: state.pendingAction, context: state.context, route: state.route, ui: state.ui })); } catch (_) { /* memory remains authoritative */ }
  };

  const transition = patch => {
    appState = {
      ...appState, ...patch,
      route: patch.route ? { ...appState.route, ...patch.route } : appState.route,
      context: patch.context ? { ...appState.context, ...patch.context } : appState.context,
      ui: patch.ui ? { ...appState.ui, ...patch.ui } : appState.ui,
      auth: patch.auth ? { ...appState.auth, ...patch.auth } : appState.auth,
      flow: patch.flow ? { ...appState.flow, ...patch.flow } : appState.flow
    };
    persistState(appState);
    return appState;
  };

  const seedByTypeAndId = (type, id) => Object.values(seed).find(item => item.type === type && item.id === id) || null;
  const routeForEntity = (type, id) => `${type === 'job' ? 'job' : type === 'offering' ? 'offering-detail' : `${type}-detail`}/${id}`;
  const routeParts = route => {
    const match = /^([^/]+)\/([^/]+)$/.exec(String(route || ''));
    if (!match || !routeRegistry.has(match[1])) return null;
    const type = match[1] === 'offering-detail' ? 'offering' : match[1].replace(/-detail$/, '');
    return seedByTypeAndId(type, match[2]) ? { name: `${match[1]}/${match[2]}`, entityType: type, entityId: match[2] } : null;
  };
  const resolveRoute = route => {
    if (route === 'discover') return route;
    return routeParts(route)?.name || 'discover';
  };
  const routeFromLocation = () => window.location.hash.replace(/^#/, '').trim() || 'discover';
  const writeLocation = (route, replace) => {
    const hash = `#${route}`;
    if (window.location.hash === hash) return;
    window.history[replace ? 'replaceState' : 'pushState']({}, '', hash);
  };

  const navigate = (requestedRoute, options = {}) => {
    const route = resolveRoute(requestedRoute);
    writeLocation(route, Boolean(options.replace));
    const parsed = routeParts(route);
    const context = parsed ? { entityType: parsed.entityType, entityId: parsed.entityId } : { entityType: null, entityId: null };
    transition({ route: { name: route }, context, ui: { overlay: null } });
    render(appState);
  };

  const restoreRouteAndContext = () => {
    const persisted = readPersistedState() || initialState();
    const route = resolveRoute(routeFromLocation());
    const parsed = routeParts(route);
    const context = parsed ? { entityType: parsed.entityType, entityId: parsed.entityId } : { entityType: null, entityId: null };
    transition({ route: { name: route }, context, ui: persisted.ui, auth: persisted.auth, flow: persisted.flow, pendingAction: persisted.pendingAction });
    writeLocation(route, true);
    render(appState);
  };

  const renderCard = kind => {
    const item = seed[kind];
    return `<article class="card ${kind === 'initiative' ? 'featured' : ''}"><span class="context">${item.eyebrow}</span><h2>${item.title}</h2><p>${item.description}</p><div class="signals"><span>מתאים להורים</span><span>${kind === 'job' ? 'חלקית' : 'אזור כללי'}</span></div>${actionButton('לפרטים', 'open-detail', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`)}</article>`;
  };

  const renderDiscover = () => `<section class="intro">${heading('קהילה שמפנה מקום לשני הצדדים', 'גם לעבוד.<br><em>גם להיות קרובים.</em>', 'להמשיך לעבוד, ללמוד ולהתפתח — תוך קרבה לילדים.')}${actionButton('מה יעזור לך עכשיו?', 'open-start')}</section><nav class="filters"><button class="filter active" data-action="navigate" data-route="discover">הכול</button><button class="filter" data-action="navigate" data-route="discover">השראה</button><button class="filter" data-action="navigate" data-route="discover">עבודה והתפתחות</button></nav><section class="feed"><div style="grid-column:span 7">${renderCard('initiative')}</div><div class="split-cards"><div class="place">${renderCard('place')}</div><div class="care">${renderCard('offer')}</div></div>${renderCard('job')}<article class="action-card">${heading('לא מצאת עדיין?', 'ספרי מה יעזור לך — ונחפש.')}${actionButton('להתחיל לחפש', 'navigate', ' data-route="discover"')}</article></section>`;

  const renderDetail = state => {
    const item = seedByTypeAndId(state.context.entityType, state.context.entityId);
    if (!item) return renderDiscover(state);
    const protectedAction = item.type === 'initiative' ? actionButton('להצטרף ליוזמה', 'join', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`) : item.type === 'offering' ? actionButton('להתחבר', 'connect', ` data-entity-type="${item.type}" data-entity-id="${item.id}"`) : '';
    const confirmed = state.flow.step === 'confirmed' && state.flow.targetId === item.id;
    const confirmation = confirmed ? `<div class="confirmation" role="status"><p class="eyebrow">הפעולה הושלמה</p><h2>${state.flow.type === 'join' ? 'הצטרפת ליוזמה' : 'בקשת החיבור נשלחה'}</h2><p>${item.title}</p></div>` : protectedAction;
    return `<section class="intro detail-view"><button class="text-link" data-action="navigate" data-route="discover">← חזרה לגילוי</button>${heading(item.eyebrow, item.title, item.description)}<div class="detail-meta"><p>${item.area}</p><span>מתאים להורים</span></div>${confirmation}</section>`;
  };

  const renderOverlay = overlay => {
    if (!overlay) return '';
    if (overlay.type === 'account-gate') return `<div class="scrim open" data-action="cancel-gate"></div><section class="sheet open account-gate" role="dialog" aria-modal="true"><button class="close" data-action="cancel-gate">×</button>${heading('נדרש חשבון', 'מתחברות כדי להמשיך', 'זהו חשבון הדגמה — ללא פרטים אישיים.')}<div class="sheet-options"><button data-action="demo-auth">להתחבר ולהמשיך</button><button data-action="cancel-gate">ביטול</button></div></section>`;
    if (overlay.type !== 'start') return '';
    return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true"><button class="close" data-action="close-overlay">×</button>${heading('הצעד הראשון', 'מה היית רוצה לעשות?')}<div class="sheet-options"><button data-action="start-create">🌱 ליצור משהו</button><button data-action="start-find">🔎 למצוא משהו</button><button data-action="start-offer">✨ להציע משהו</button></div></section>`;
  };

  const rendererRegistry = { discover: renderDiscover, 'initiative-detail': renderDetail, 'place-detail': renderDetail, 'offering-detail': renderDetail, job: renderDetail };
  const render = state => {
    const baseRoute = state.route.name.split('/')[0];
    const renderer = rendererRegistry[state.route.name] || rendererRegistry[baseRoute] || rendererRegistry.discover;
    appRoot.innerHTML = renderer(state);
    overlayRoot.innerHTML = renderOverlay(state.ui.overlay);
  };

  const dispatch = (action, payload = {}, context = {}) => {
    switch (action) {
      case 'navigate': navigate(payload.route || 'discover', { context }); break;
      case 'open-detail': {
        const type = payload.entityType;
        const id = payload.entityId;
        const item = seedByTypeAndId(type, id);
        if (item) navigate(routeForEntity(type, id), { context: { entityType: type, entityId: id } });
        else navigate('discover', { replace: true });
        break;
      }
      case 'start':
      case 'open-start': transition({ ui: { overlay: { type: 'start' } } }); render(appState); break;
      case 'close-overlay': transition({ ui: { overlay: null } }); render(appState); break;
      case 'cancel-gate': transition({ ui: { overlay: null }, pendingAction: null }); render(appState); break;
      case 'join':
      case 'connect': {
        const item = seedByTypeAndId(payload.entityType, payload.entityId);
        const valid = item && ((action === 'join' && item.type === 'initiative') || (action === 'connect' && item.type === 'offering'));
        if (!valid) break;
        if (appState.auth.status !== 'authenticated' && !payload.continue) {
          const originRoute = appState.route.name;
          transition({ pendingAction: { id: `${action}:${item.id}:${Date.now()}`, actionType: action, originRoute, originContext: { ...appState.context }, payload: { entityType: item.type, entityId: item.id }, continuation: action, createdAt: Date.now(), version: pendingVersion }, ui: { overlay: { type: 'account-gate' } } });
          render(appState);
          break;
        }
        transition({ ui: { overlay: null }, pendingAction: null, flow: { type: action, step: 'confirmed', targetId: item.id, targetType: item.type } });
        render(appState);
        break;
      }
      case 'demo-auth': {
        const pending = normalizePendingAction(appState.pendingAction);
        if (!pending) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; }
        const item = seedByTypeAndId(pending.payload.entityType, pending.payload.entityId);
        if (!item || pending.originRoute !== appState.route.name || pending.originContext.entityType !== appState.context.entityType || pending.originContext.entityId !== appState.context.entityId) { transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null }); render(appState); break; }
        transition({ auth: { status: 'authenticated' }, ui: { overlay: null }, pendingAction: null });
        dispatch(pending.continuation, { ...pending.payload, continue: true }, pending.originContext);
        break;
      }
      case 'start-create':
      case 'start-find':
      case 'start-offer':
        transition({ ui: { overlay: null }, flow: { type: action.replace('start-', '') } });
        render(appState);
        break;
      default: break;
    }
  };

  const handleAction = event => {
    const target = event.target.closest('[data-action], [data-route]');
    if (!target) return;
    const action = target.dataset.action || 'navigate';
    event.preventDefault();
    dispatch(action, { route: target.dataset.route || 'discover', entityType: target.dataset.entityType, entityId: target.dataset.entityId }, appState.context);
  };

  const initializeState = () => {
    appState = initialState();
    return appState;
  };

  const registerEventOwners = () => {
    document.addEventListener('click', handleAction);
    window.addEventListener('popstate', restoreRouteAndContext);
  };

  const boot = () => {
    initializeState();
    restoreRouteAndContext();
    registerEventOwners();
  };

  window.__foundation = Object.freeze({ getState: () => appState, boot, initializeState, dispatch, navigate, restoreRouteAndContext, render, rendererRegistry });
  boot();
})();
