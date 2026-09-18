/* Clean Functional V1 Foundation shell — Slice 0. */
(function foundationShell() {
  'use strict';

  const appRoot = document.querySelector('#app');
  const overlayRoot = document.querySelector('#modal');
  const stateKey = 'gv-foundation-state';
  const routeRegistry = new Set(['discover']);

  const seed = {
    initiative: ['יוזמה · פתח תקווה', 'מחפשות עוד 2–3 משפחות לבקרים משותפים', 'שתי אמהות לילדים בני 1.5–3 רוצות להתחיל רוטציה פעמיים בשבוע.'],
    place: ['מקום · הוד השרון', 'סטודיו פנוי בבקרים עם חצר קטנה', 'פתוח לקבוצה קבועה.'],
    offer: ['שירות מקצועי · Online', 'עזרה בסטטיסטיקה לסטודנטיות', 'עזרה מקצועית מרחוק.'],
    job: ['משרה · Hybrid', 'Research Operations · 60%', 'גמישות ושילוב בית.']
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
      draft: isRecord(value.draft) ? value.draft : null
    };
  };
  const normalizePendingAction = value => {
    if (!isRecord(value) || typeof value.action !== 'string') return null;
    return { action: value.action, originRoute: resolveRoute(value.originRoute), payload: isRecord(value.payload) ? value.payload : {} };
  };
  const normalizePersistedState = value => {
    const defaults = initialState();
    if (!isRecord(value)) return defaults;
    const status = isRecord(value.auth) && (value.auth.status === 'anonymous' || value.auth.status === 'authenticated') ? value.auth.status : defaults.auth.status;
    return {
      ...defaults,
      route: { name: resolveRoute(isRecord(value.route) ? value.route.name : defaults.route.name) },
      context: normalizeContext(value.context),
      ui: { overlay: isRecord(value.ui) && value.ui.overlay?.type === 'start' ? { type: 'start' } : null },
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
    try { sessionStorage.setItem(stateKey, JSON.stringify({ flow: state.flow, auth: state.auth, pendingAction: state.pendingAction, context: state.context, route: state.route })); } catch (_) { /* memory remains authoritative */ }
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

  const resolveRoute = route => routeRegistry.has(route) ? route : 'discover';
  const routeFromLocation = () => window.location.hash.replace(/^#/, '').trim() || 'discover';
  const writeLocation = (route, replace) => {
    const hash = `#${route}`;
    if (window.location.hash === hash) return;
    window.history[replace ? 'replaceState' : 'pushState']({}, '', hash);
  };

  const navigate = (requestedRoute, options = {}) => {
    const route = resolveRoute(requestedRoute);
    writeLocation(route, Boolean(options.replace));
    const context = route === 'discover' ? { entityType: null, entityId: null } : normalizeContext(options.context);
    transition({ route: { name: route }, context, ui: { overlay: null } });
    render(appState);
  };

  const restoreRouteAndContext = () => {
    const persisted = readPersistedState() || initialState();
    const route = resolveRoute(routeFromLocation());
    const context = route === 'discover' ? { entityType: null, entityId: null } : normalizeContext(persisted.context);
    transition({ route: { name: route }, context, ui: { overlay: null }, auth: persisted.auth, flow: persisted.flow, pendingAction: persisted.pendingAction });
    writeLocation(route, true);
    render(appState);
  };

  const renderCard = kind => {
    const item = seed[kind];
    const route = kind === 'job' ? 'job' : `${kind}-detail`;
    return `<article class="card ${kind === 'initiative' ? 'featured' : ''}"><span class="context">${item[0]}</span><h2>${item[1]}</h2><p>${item[2]}</p><div class="signals"><span>מתאים להורים</span><span>${kind === 'job' ? 'חלקית' : 'אזור כללי'}</span></div>${actionButton('לפרטים', 'navigate', ` data-route="${route}"`)}</article>`;
  };

  const renderDiscover = () => `<section class="intro">${heading('קהילה שמפנה מקום לשני הצדדים', 'גם לעבוד.<br><em>גם להיות קרובים.</em>', 'להמשיך לעבוד, ללמוד ולהתפתח — תוך קרבה לילדים.')}${actionButton('מה יעזור לך עכשיו?', 'open-start')}</section><nav class="filters"><button class="filter active" data-action="navigate" data-route="discover">הכול</button><button class="filter" data-action="navigate" data-route="discover">השראה</button><button class="filter" data-action="navigate" data-route="discover">עבודה והתפתחות</button></nav><section class="feed"><div style="grid-column:span 7">${renderCard('initiative')}</div><div class="split-cards"><div class="place">${renderCard('place')}</div><div class="care">${renderCard('offer')}</div></div>${renderCard('job')}<article class="action-card">${heading('לא מצאת עדיין?', 'ספרי מה יעזור לך — ונחפש.')}${actionButton('להתחיל לחפש', 'navigate', ' data-route="discover"')}</article></section>`;

  const renderOverlay = overlay => {
    if (!overlay || overlay.type !== 'start') return '';
    return `<div class="scrim open" data-action="close-overlay"></div><section class="sheet open" role="dialog" aria-modal="true"><button class="close" data-action="close-overlay">×</button>${heading('הצעד הראשון', 'מה היית רוצה לעשות?')}<div class="sheet-options"><button data-action="start-create">🌱 ליצור משהו</button><button data-action="start-find">🔎 למצוא משהו</button><button data-action="start-offer">✨ להציע משהו</button></div></section>`;
  };

  const rendererRegistry = { discover: renderDiscover };
  const render = state => {
    const renderer = rendererRegistry[state.route.name] || rendererRegistry.discover;
    appRoot.innerHTML = renderer(state);
    overlayRoot.innerHTML = renderOverlay(state.ui.overlay);
  };

  const dispatch = (action, payload = {}, context = {}) => {
    switch (action) {
      case 'navigate': navigate(payload.route || 'discover', { context }); break;
      case 'start':
      case 'open-start': transition({ ui: { overlay: { type: 'start' } } }); render(appState); break;
      case 'close-overlay': transition({ ui: { overlay: null } }); render(appState); break;
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
    dispatch(action, { route: target.dataset.route || 'discover' }, appState.context);
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
