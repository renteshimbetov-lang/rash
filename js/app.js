/**
 * ASOSIY MINI APP CONTROLLER — js/app.js  v20261002_rewrite
 * To'liq qayta yozilgan — toza, ishonchli, muammosiz
 */

// ── CONSTANTS ───────────────────────────────────
var LS_PIN   = 'app_pin';
var LS_USER  = 'app_user';
var LS_THEME = 'app_theme';

// ── GLOBAL STATE ────────────────────────────────
var state = {
  tgUser:       null,
  userInfo:     null,
  isAdmin:      false,
  isActualAdmin:false,
  isSimulatedUser: false,
  activeTab:    'home',
  homeSubtab:   'active',
  pinBuffer:    '',
  pinMode:      'enter',
  pinFirst:     '',
};

// ── API HELPER ──────────────────────────────────
function apiGet(path) {
  return fetch(path, { headers: { 'X-App-Version': 'rewrite-1' } })
    .then(function(r) { return r.json(); });
}

// ── INIT ────────────────────────────────────────
function initApp() {
  var theme = localStorage.getItem(LS_THEME) || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
  syncTelegramTheme(theme);
  updateLangLabel();
  applyI18n();

  var tg = window.Telegram && window.Telegram.WebApp;
  if (tg) {
    try { tg.ready(); tg.expand(); } catch(e) {}
  }

  var tgU = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
  var urlParams = new URLSearchParams(window.location.search);
  var queryTgId = parseInt(urlParams.get('tg_id') || '0', 10);
  var isPreview  = urlParams.get('preview') === 'user' || urlParams.get('demo') === '1';

  var hasTgContext = !!(window.Telegram && window.Telegram.WebApp);

  if (isPreview) {
    state.tgUser  = { id: 7080517395, first_name: "O'quvchi", last_name: '', username: 'demo' };
    state.userInfo = { tg_id: 7080517395, fullname: "O'quvchi (Demo)", phone: '', status: 'approved', is_registered: true };
    window._unregBypassed = true;
  } else if (tgU && tgU.id) {
    state.tgUser = tgU;
  } else if (queryTgId > 0) {
    state.tgUser = { id: queryTgId, first_name: 'Foydalanuvchi', last_name: '', username: '' };
  } else {
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(LS_USER) || 'null'); } catch(e) {}
    if (cached && cached.tg_id) {
      state.tgUser  = { id: cached.tg_id, first_name: cached.fullname || 'Foydalanuvchi', last_name: '', username: '' };
      state.userInfo = cached;
    } else if (hasTgContext) {
      // Telegram WebApp mavjud lekin user ma'lumotlari hali yuklanmagan (ba'zi platformalarda kechikishi mumkin)
      state.tgUser = { id: 0, first_name: 'Foydalanuvchi', last_name: '', username: '' };
    } else {
      var wb = document.getElementById('web-block-screen');
      if (wb) wb.style.display = 'flex';
      var sp = document.getElementById('splashScreen');
      if (sp) sp.style.display = 'none';
      return;
    }
  }


  if (window.BM_LOGO_B64) {
    document.querySelectorAll('.header-logo-img, .header-bm-logo').forEach(function(img) {
      img.src = window.BM_LOGO_B64;
    });
  }

  // PIN ekranini ishga tushiramiz — agar PIN mavjud bo'lsa ko'rsatiladi, aks holda app to'g'ri ochiladi
  if (typeof window.initPinScreen === 'function') {
    window.initPinScreen();
  } else {
    runSplash();
  }
}

// ── SPLASH ──────────────────────────────────────
var _splashTimer = null;

function runSplash() {
  var splash = document.getElementById('splashScreen');
  if (!splash) { launchApp(); return; }
  launchApp();
  _splashTimer = setTimeout(function() { dismissSplash(); }, 3200);
}

function dismissSplash() {
  if (_splashTimer) { clearTimeout(_splashTimer); _splashTimer = null; }
  var splash = document.getElementById('splashScreen');
  if (!splash) return;
  try {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  } catch(e) {}
  splash.classList.add('dismissed');
  setTimeout(function() {
    splash.style.display = 'none';
    checkRegistrationStatus();
    if (!localStorage.getItem('onboarding_nav_tour_seen')) {
      setTimeout(openOnboardingModal, 400);
    }
  }, 600);
}
window.dismissSplash        = dismissSplash;
window.finishSplashImmediately = dismissSplash;

// ── LAUNCH APP ──────────────────────────────────
function launchApp() {
  var pinScreen = document.getElementById('pin-screen');
  if (pinScreen) {
    pinScreen.style.display = 'none';
    pinScreen.style.opacity = '0';
  }
  var splash = document.getElementById('splashScreen');
  if (!splash || splash.style.display === 'none') {
    // Splash allaqachon yo'q yoki ko'rinmaydi — to'g'ridan app'ni ko'rsatamiz
    showMainApp();
  } else {
    runSplash();
  }
}

function showMainApp() {
  var app = document.getElementById('app');
  if (app) {
    app.style.display       = 'flex';
    app.style.flexDirection = 'column';
    app.classList.add('visible');
  }

  applyI18n();
  updateHeaderUser();

  Promise.all([
    loadUserProfile().catch(function(e) { console.warn('Profile err:', e); }),
    loadActiveTests().catch(function(e) { console.warn('ActiveTests err:', e); })
  ]).then(function() {
    updateHeaderUser();
  });

  checkBotServerStatus();
  setInterval(checkBotServerStatus, 30000);
}


// ── THEME ───────────────────────────────────────
function toggleTheme() {
  var cur  = document.documentElement.getAttribute('data-theme') || 'light';
  var next = (cur === 'light') ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(LS_THEME, next);
  updateThemeIcon(next);
  syncTelegramTheme(next);
}
function updateThemeIcon(theme) {
  var el = document.getElementById('theme-icon');
  if (el) el.textContent = (theme === 'dark') ? '☀' : '☾';
}
function syncTelegramTheme(theme) {
  var bg = (theme === 'dark') ? '#0a0b14' : '#f0f4ff';
  var tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) return;
  try {
    if (tg.setHeaderColor)     tg.setHeaderColor(bg);
    if (tg.setBackgroundColor) tg.setBackgroundColor(bg);
    if (tg.setBottomBarColor)  tg.setBottomBarColor(bg);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', bg);
  } catch(e) {}
}

// ── LANGUAGE ────────────────────────────────────
function cycleLang() {
  var langs   = ['uz', 'ru', 'en'];
  var LS_LANG_KEY = 'app_lang';
  var cur  = localStorage.getItem(LS_LANG_KEY) || 'uz';
  var next = langs[(langs.indexOf(cur) + 1) % langs.length];
  localStorage.setItem(LS_LANG_KEY, next);
  updateLangLabel();
  applyI18n();
}
function updateLangLabel() {
  var labels = { uz: 'UZ', ru: 'RU', en: 'EN' };
  var cur    = localStorage.getItem('app_lang') || 'uz';
  var el     = document.getElementById('lang-label');
  if (el) el.textContent = labels[cur] || 'UZ';
}
function t(key) {
  if (typeof window.I18N === 'undefined') return key;
  var lang = localStorage.getItem('app_lang') || 'uz';
  var dict = window.I18N[lang] || window.I18N['uz'] || {};
  return dict[key] || key;
}
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var val = t(key);
    if (val && val !== key) el.textContent = val;
  });
}

// ── HEADER USER ─────────────────────────────────
function updateHeaderUser() {
  var avatar = document.getElementById('header-avatar');
  if (!avatar) return;
  var name = (state.userInfo && state.userInfo.fullname)
    || (state.tgUser && state.tgUser.first_name) || '?';
  var initials = name.trim().split(/\s+/).map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
  avatar.textContent = initials || '?';
}

// ── LOAD USER PROFILE ────────────────────────────
async function loadUserProfile() {
  var tgId = state.tgUser && state.tgUser.id;
  if (!tgId) { checkRegistrationStatus(); return; }

  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('preview') === 'user' || urlParams.get('demo') === '1') {
    checkRegistrationStatus(); return;
  }

  try {
    var data = await apiGet('/api/app/profile?tg_id=' + tgId);
    if (data.success) {
      state.userInfo     = data.user;
      state.isActualAdmin = Boolean(data.is_admin);
      state.isAdmin      = state.isActualAdmin && !state.isSimulatedUser;
      localStorage.setItem(LS_USER, JSON.stringify(data.user));
      if (data.bot_username) window.BOT_USERNAME = data.bot_username;

      var navAdmin = document.getElementById('nav-admin');
      if (navAdmin) navAdmin.style.display = state.isAdmin ? 'flex' : 'none';

      var searchNav = document.getElementById('nav-search');
      if (searchNav) searchNav.style.display = 'flex';

      if (state.isAdmin && data.pending_users > 0) {
        var badge = document.getElementById('admin-badge');
        if (badge) { badge.textContent = data.pending_users; badge.style.display = 'block'; }
      }
      checkRegistrationStatus();
    } else {
      state.userInfo = { status: 'not_registered', is_registered: false };
      checkRegistrationStatus();
    }
  } catch(e) {
    console.warn('loadUserProfile err:', e);
    if (!state.userInfo) state.userInfo = { status: 'not_registered', is_registered: false };
    checkRegistrationStatus();
  }
}

// ── REGISTRATION CHECK ────────────────────────────
function checkRegistrationStatus() {
  var modal = document.getElementById('unregistered-modal');

  if (state.isSimulatedUser || window._unregBypassed) {
    if (modal) modal.style.display = 'none';
    return false;
  }
  if (!state.userInfo) {
    if (modal) modal.style.display = 'none';
    return false;
  }

  var u = state.userInfo;

  if (u.status === 'pending') {
    if (modal) modal.style.display = 'none';
    return false;
  }

  var isReg;
  if (u.is_registered !== undefined) {
    isReg = Boolean(u.is_registered);
  } else {
    isReg = (u.status === 'approved' || u.status === 'active' || u.status === 'pending');
  }

  var tgId   = state.tgUser && state.tgUser.id;
  var isUnreg = !tgId || u.status === 'not_registered' || !isReg;

  if (modal) modal.style.display = isUnreg ? 'flex' : 'none';
  return isUnreg;
}

function goToBotRegister() {
  var bot = window.BOT_USERNAME || 'bm_rashtest_bot';
  var url = 'https://t.me/' + bot;
  try {
    if (window.Telegram && window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url, '_blank');
  } catch(e) { window.open(url, '_blank'); }
}

// ── SERVER STATUS ─────────────────────────────────
async function checkBotServerStatus() {
  var pill = document.getElementById('bot-status-pill');
  var txt  = document.getElementById('bot-status-text');
  if (!pill || !txt) return;
  try {
    var ctrl  = new AbortController();
    var tid   = setTimeout(function() { ctrl.abort(); }, 8000);
    var r     = await fetch('/api/health', { signal: ctrl.signal });
    clearTimeout(tid);
    var data  = await r.json();
    var isOk  = data && (data.status === 'ok' || data.bot_ok);
    pill.className  = 'server-status-pill ' + (isOk ? 'online' : 'offline');
    txt.textContent = isOk ? t('status_active') : t('status_offline');
  } catch(e) {
    pill.className  = 'server-status-pill offline';
    txt.textContent = t('status_offline');
  }
}

// ── TAB NAVIGATION ───────────────────────────────
function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(function(el) {
    el.classList.toggle('active', el.id === 'tab-' + tabId);
  });

  try {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback)
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  } catch(e) {}

  if      (tabId === 'home')    loadActiveTests();
  else if (tabId === 'tests')   loadMyResults();
  else if (tabId === 'profile') renderProfileTab();
  else if (tabId === 'admin')   { renderAdminTab(); loadAllUsers(); }
}

function switchHomeSubtab(subtab) {
  if (state.homeSubtab === subtab) return;
  state.homeSubtab = subtab;
  try {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback)
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
  } catch(e) {}
  if (window._availableTests) renderHomeTab(window._availableTests);
  else loadActiveTests();
}

// ── HOME TAB ─────────────────────────────────────
async function loadActiveTests() {
  var tab = document.getElementById('tab-home');
  if (!tab) return;
  tab.innerHTML = skeletonCards(3);
  try {
    var tgId = (state.tgUser && state.tgUser.id) || 0;
    var data  = await apiGet('/api/app/active-tests?tg_id=' + tgId);
    if (data.success) {
      if (data.server_time) window._serverTimeOffset = (data.server_time * 1000) - Date.now();
      window._availableTests = data.tests || [];
      renderHomeTab(data.tests || []);
    } else {
      tab.innerHTML = errorState(t('empty_active'));
    }
  } catch(e) {
    tab.innerHTML = errorState("Serverga ulanib bo'lmadi");
  }
}

function isTestUpcoming(test) {
  if (!test.is_planned && !test.scheduled_start) return false;
  var now = Date.now() + (window._serverTimeOffset || 0);
  if (test.scheduled_start) {
    var parts = (test.scheduled_start || '').split(':');
    if (parts.length >= 2) {
      var d = new Date();
      d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      if (test.scheduled_date) {
        var dp = test.scheduled_date.split('-');
        if (dp.length === 3) {
          d = new Date(parseInt(dp[0]), parseInt(dp[1]) - 1, parseInt(dp[2]),
            parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
        }
      }
      return d.getTime() > now;
    }
  }
  return Boolean(test.is_planned && !test.is_active);
}

function renderHomeTab(tests) {
  var tab = document.getElementById('tab-home');
  if (!tab) return;
  window._availableTests = tests;

  var upcoming = tests.filter(function(t) { return isTestUpcoming(t); });
  var active   = tests.filter(function(t) { return t.is_active && !isTestUpcoming(t); });
  var past     = tests.filter(function(t) { return !t.is_active && !isTestUpcoming(t); });

  if (active.length === 0 && upcoming.length === 0 && past.length > 0) {
    state.homeSubtab = 'past';
  }
  var sub = state.homeSubtab;

  var html = '<div class="section-header animate-in">' +
    '<div class="section-title">' + t('home_title') + '</div>' +
    '<div class="section-sub">' + t('home_sub') + '</div></div>';

  var activeCnt = active.length + upcoming.length;
  var pastCnt   = past.length;
  html += '<div class="home-subtabs animate-in">' +
    '<button type="button" class="home-subtab ' + (sub === 'active' ? 'active' : '') + '" onclick="switchHomeSubtab(\'active\')">' +
      '<span class="home-subtab-icon">&#9889;</span>' +
      '<span class="home-subtab-text">' + t('subtab_active') + '</span>' +
      '<span class="home-subtab-badge">' + activeCnt + '</span>' +
    '</button>' +
    '<button type="button" class="home-subtab ' + (sub === 'past' ? 'active' : '') + '" onclick="switchHomeSubtab(\'past\')">' +
      '<span class="home-subtab-icon">&#128193;</span>' +
      '<span class="home-subtab-text">' + t('subtab_past') + '</span>' +
      '<span class="home-subtab-badge">' + pastCnt + '</span>' +
    '</button>' +
  '</div>';

  html += '<div class="home-subtab-content animate-in">';

  if (sub === 'active') {
    if (upcoming.length > 0) {
      html += '<div style="margin-bottom:12px;font-weight:800;color:#D97706;font-size:13px;">&#9203; ' + t('upcoming_tests') + ' (' + upcoming.length + ' ' + t('unit_count') + '):</div>';
      upcoming.forEach(function(test) { html += renderTestCard(test, 'upcoming'); });
    }
    if (active.length > 0) {
      if (upcoming.length > 0) {
        html += '<div style="margin:14px 0 10px;font-weight:800;color:var(--success);font-size:13px;">&#129001; ' + t('active_tests_now') + ' (' + active.length + ' ' + t('unit_count') + '):</div>';
      }
      active.forEach(function(test) { html += renderTestCard(test, 'active'); });
    }
    if (activeCnt === 0) {
      var pastBtn = past.length > 0
        ? '<button type="button" onclick="switchHomeSubtab(\'past\')" style="margin-top:16px;padding:10px 24px;background:var(--primary);color:#fff;border:none;border-radius:24px;font-size:14px;font-weight:700;cursor:pointer;">&#128193; ' + t('subtab_past') + ' (' + past.length + ')</button>'
        : '';
      html += '<div class="empty-state animate-in" style="padding:44px 16px;">' +
        '<div class="empty-icon" style="font-size:42px;margin-bottom:12px;">&#128235;</div>' +
        '<div style="font-weight:800;font-size:16px;margin-bottom:6px;color:var(--text)">' + t('empty_active') + '</div>' +
        '<p style="font-size:13px;color:var(--text-muted);margin:0;max-width:280px;line-height:1.5;">' + t('empty_active_sub') + '</p>' +
        pastBtn +
      '</div>';
    }
  } else {
    if (past.length > 0) {
      past.forEach(function(test) { html += renderTestCard(test, 'past'); });
    } else {
      html += '<div class="empty-state animate-in" style="padding:44px 16px;">' +
        '<div class="empty-icon" style="font-size:42px;margin-bottom:12px;">&#128193;</div>' +
        '<div style="font-weight:800;font-size:16px;margin-bottom:6px;color:var(--text)">' + t('empty_past') + '</div>' +
        '<p style="font-size:13px;color:var(--text-muted);margin:0;max-width:280px;line-height:1.5;">' + t('empty_past_sub') + '</p>' +
      '</div>';
    }
  }

  html += '</div>';
  tab.innerHTML = html;
}

function renderTestCard(test, type) {
  var isSubmitted  = Boolean(test.already_submitted);
  var isUpcomingT  = (type === 'upcoming');
  var isActive     = (type === 'active');
  var isPast       = (type === 'past');

  var badge = '';
  if (isUpcomingT)  badge = '<span class="test-badge badge-upcoming">' + t('badge_upcoming') + '</span>';
  else if (isSubmitted) badge = '<span class="test-badge badge-submitted">' + t('badge_submitted') + '</span>';
  else if (isActive)  badge = '<span class="test-badge badge-active">' + t('badge_active_now') + '</span>';
  else if (isPast)    badge = '<span class="test-badge badge-stopped">' + t('badge_stopped') + '</span>';

  var dateStr  = test.scheduled_date || (test.created_at ? formatDateOnly(test.created_at) : t('val_today'));
  var qCount   = (test.total_questions || 45) + ' ' + t('val_questions_format');
  var timeLim  = test.time_limit_min ? (test.time_limit_min + ' ' + t('val_minutes')) : t('val_unlimited');

  var ytHtml = '';
  if (test.youtube_url) {
    ytHtml = '<a href="' + escHtml(test.youtube_url) + '" target="_blank" class="test-card-yt-link" onclick="event.stopPropagation()" style="display:inline-block;margin:6px 0;font-size:13px;color:#EF4444;font-weight:700;text-decoration:none;">' +
      '&#127909; ' + t('val_yt_available') + '</a>';
  }

  var btnHtml = '';
  if (isUpcomingT) {
    btnHtml = '<button type="button" class="btn-action-secondary" disabled style="opacity:0.6;padding:10px 20px;border-radius:12px;border:1px solid var(--border);background:var(--bg-card-sub);font-weight:700;font-size:14px;">' + t('btn_waiting_start') + '</button>';
  } else if (isPast) {
    if (isSubmitted) {
      btnHtml = '<button type="button" class="btn-action-primary" onclick="openPastTestResult(' + test.id + ')" style="padding:10px 20px;border-radius:12px;border:none;background:var(--primary);color:#fff;font-weight:700;font-size:14px;cursor:pointer;">' + t('btn_view_result') + '</button>';
    } else {
      btnHtml = '<button type="button" class="btn-action-secondary" onclick="showPastTestEndedModal(' + test.id + ')" style="padding:10px 20px;border-radius:12px;border:1px solid var(--border);background:var(--bg-card-sub);font-weight:700;font-size:14px;cursor:pointer;">' + t('btn_test_ended_info') + '</button>';
    }
  } else if (isActive) {
    if (isSubmitted) {
      btnHtml = '<button type="button" class="btn-action-primary" onclick="openPastTestResult(' + test.id + ')" style="padding:10px 20px;border-radius:12px;border:none;background:var(--primary);color:#fff;font-weight:700;font-size:14px;cursor:pointer;">' + t('btn_view_result') + '</button>';
    } else {
      btnHtml = '<button type="button" class="btn-action-primary" onclick="openTestSolving(' + test.id + ')" style="padding:10px 20px;border-radius:12px;border:none;background:linear-gradient(135deg,#10B981,#059669);color:#fff;font-weight:700;font-size:14px;cursor:pointer;">' + t('btn_solve_test') + '</button>';
    }
  }

  var userStatus = isSubmitted
    ? '<div style="font-size:12.5px;color:var(--success);font-weight:700;margin:8px 0;">&#9989; ' + t('user_status_participated') + '</div>'
    : '<div style="font-size:12.5px;color:var(--text-muted);margin:8px 0;">&#128100; ' + t('user_status_not_participated') + '</div>';

  return '<div class="test-detail-card animate-in" style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:16px;margin-bottom:12px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">' +
      '<div>' + badge + '</div>' +
      '<div style="font-size:12px;color:var(--text-muted);font-weight:700;">&#128204; #' + escHtml(test.test_code || String(test.id)) + '</div>' +
    '</div>' +
    '<div style="font-size:15.5px;font-weight:900;color:var(--text);margin-bottom:8px;line-height:1.3;">' + escHtml(test.title || t('default_test_title')) + '</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:12.5px;color:var(--text-muted);margin-bottom:4px;">' +
      '<span>&#128197; ' + escHtml(dateStr) + '</span>' +
      '<span>&#10067; ' + escHtml(qCount) + '</span>' +
      (test.time_limit_min ? '<span>&#9203; ' + escHtml(timeLim) + '</span>' : '') +
    '</div>' +
    userStatus +
    (ytHtml ? ytHtml : '') +
    '<div style="margin-top:10px;">' + btnHtml + '</div>' +
  '</div>';
}

function openTestSolving(testId) {
  var tgId = (state.tgUser && state.tgUser.id) || 0;
  window.location.href = '/index.html?test_id=' + testId + '&tg_id=' + tgId;
}

function openPastTestResult(testId) {
  var numId    = Number(testId);
  var matching = null;

  if (window._myResults && window._myResults.length > 0) {
    matching = window._myResults.find(function(r) {
      return (r.test_id !== undefined && Number(r.test_id) === numId) ||
             (r.id      !== undefined && Number(r.id)      === numId) ||
             (r.test_code !== undefined && Number(r.test_code) === numId);
    });
  }

  if (!matching) {
    var tObj = (window._availableTests || []).find(function(t) {
      return Number(t.id) === numId || Number(t.test_code) === numId;
    });
    if (tObj && tObj.already_submitted) {
      matching = {
        test_id: tObj.id, test_title: tObj.title,
        score: tObj.user_score, correct_count: tObj.user_correct,
        total_count: tObj.user_total || 45,
        grade: tObj.user_grade || 'Kutilmoqda',
        submitted_at: tObj.submitted_at,
        results_published: Boolean(tObj.results_published)
      };
    }
  }

  if (matching) { showResultModal(matching); }
  else { switchTab('tests'); loadMyResults(); }
}

function showPastTestEndedModal(testId) {
  var test  = (window._availableTests || []).find(function(t) { return Number(t.id) === Number(testId); });
  if (!test) return;
  var modal = document.getElementById('past-test-modal');
  var body  = document.getElementById('past-test-modal-body');
  if (!modal || !body) return;

  var dateStr = test.scheduled_date || (test.created_at ? formatDateOnly(test.created_at) : t('val_today'));
  var endStr  = test.stopped_at ? formatTimeOnly(test.stopped_at) : (test.scheduled_end || '&#8212;');

  body.innerHTML = '<div style="text-align:center;padding:12px 0;">' +
    '<div style="font-size:48px;margin-bottom:12px;">&#9200;</div>' +
    '<p style="color:var(--text-muted);font-size:14px;line-height:1.6;margin-bottom:12px;">' +
      t('test_ended_on_datetime').replace('{date}', escHtml(dateStr)).replace('{time}', escHtml(String(endStr))) +
    '</p>' +
    (test.already_submitted
      ? '<div style="color:var(--success);font-weight:700;margin-bottom:12px;">&#9989; ' + t('test_ended_user_took') + '</div>' +
        '<button type="button" onclick="openPastTestResult(' + test.id + ');closePastTestModal();" style="padding:12px 24px;background:var(--primary);color:#fff;border:none;border-radius:14px;font-weight:700;cursor:pointer;display:block;width:100%;margin-bottom:10px;">' + t('btn_view_my_result') + '</button>'
      : '<div style="color:var(--error);font-size:13px;margin-bottom:12px;">' + t('test_ended_user_not_took') + '</div>'
    ) +
    '<button type="button" onclick="closePastTestModal()" style="padding:10px 20px;background:var(--bg-card-sub);border:1px solid var(--border);border-radius:12px;font-weight:600;cursor:pointer;width:100%;">' + t('btn_modal_understand') + '</button>' +
  '</div>';

  modal.style.display = 'flex';
}
function closePastTestModal(e) {
  if (e && e.target && e.target.id !== 'past-test-modal') return;
  var modal = document.getElementById('past-test-modal');
  if (modal) modal.style.display = 'none';
}

setInterval(function() {
  if (state.activeTab === 'home' && window._availableTests) {
    var hasUp = window._availableTests.some(function(t) { return isTestUpcoming(t); });
    if (hasUp) loadActiveTests();
  }
}, 15000);

// ── TESTS TAB ────────────────────────────────────
async function loadMyResults() {
  var tab = document.getElementById('tab-tests');
  if (!tab) return;
  tab.innerHTML = skeletonCards(2);
  try {
    var tgId = (state.tgUser && state.tgUser.id) || 0;
    var data  = await apiGet('/api/app/my-results?tg_id=' + tgId);
    if (data.success) {
      window._myResults = data.results || [];
      renderTestsTab(data.results || []);
    } else { tab.innerHTML = errorState(t('empty_tests')); }
  } catch(e) { tab.innerHTML = errorState('Natijalar yuklanmadi'); }
}

function renderTestsTab(results) {
  var tab = document.getElementById('tab-tests');
  if (!tab) return;

  var html = '<div class="section-header animate-in">' +
    '<div class="section-title">' + t('my_tests_title') + '</div>' +
    '<div class="section-sub">' + results.length + ' ' + t('tests_count') + '</div></div>';

  if (results.length === 0) {
    tab.innerHTML = html + '<div class="empty-state animate-in" style="padding:44px 16px;">' +
      '<div class="empty-icon" style="font-size:42px;margin-bottom:12px;">&#128221;</div>' +
      '<div style="font-weight:800;font-size:16px;color:var(--text)">' + t('empty_tests') + '</div></div>';
    return;
  }

  results.forEach(function(r) {
    var score    = r.score !== undefined ? r.score : (r.total_score || '&#8212;');
    var total    = r.total_count || r.total_questions || 45;
    var correct  = r.correct_count !== undefined ? r.correct_count : '&#8212;';
    var dateStr  = r.submitted_at ? formatDateOnly(r.submitted_at) : '&#8212;';
    var grade    = r.grade || r.rasch_grade || '&#8212;';
    var title    = r.test_title || r.title || ('Test #' + (r.test_id || r.id || ''));
    var pub      = Boolean(r.results_published);
    var rJson    = JSON.stringify(r).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    html += '<div class="result-card animate-in" onclick="showResultModal(' + "'" + rJson + "'" + ')" style="cursor:pointer;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:10px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
        '<div style="font-weight:800;font-size:14.5px;color:var(--text);flex:1;margin-right:8px;">' + escHtml(title) + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);">' + escHtml(dateStr) + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:4px;">' +
        '<span style="font-size:13px;color:var(--text-muted);">&#9989; <b style="color:var(--success)">' + correct + '</b>/' + total + '</span>' +
        '<span style="font-size:13px;color:var(--text-muted);">&#11088; <b style="color:var(--primary)">' + score + '</b></span>' +
        (String(grade) !== '&#8212;' ? '<span style="font-size:13px;color:var(--text-muted);">&#127894; <b>' + escHtml(String(grade)) + '</b></span>' : '') +
      '</div>' +
      (!pub ? '<div style="margin-top:8px;font-size:12px;color:var(--warning);font-weight:600;">&#9203; ' + t('test_waiting_result') + '</div>' : '') +
    '</div>';
  });

  tab.innerHTML = html;
}

// ── RESULT MODAL ─────────────────────────────────
function showResultModal(result) {
  if (typeof result === 'string') { try { result = JSON.parse(result); } catch(e) { return; } }
  var modal = document.getElementById('result-modal');
  var body  = document.getElementById('result-modal-body');
  if (!modal || !body) return;

  var title   = result.test_title || result.title || ('Test #' + (result.test_id || result.id));
  var score   = result.score !== undefined ? result.score : (result.total_score || '&#8212;');
  var correct = result.correct_count !== undefined ? result.correct_count : '&#8212;';
  var total   = result.total_count || result.total_questions || 45;
  var grade   = result.grade || result.rasch_grade || '&#8212;';
  var dateStr = result.submitted_at ? formatDateOnly(result.submitted_at) : '&#8212;';
  var pub     = Boolean(result.results_published);

  var titleEl = document.getElementById('result-modal-title');
  if (titleEl) titleEl.textContent = title;

  body.innerHTML = '<div style="text-align:center;padding:8px 0;">' +
    '<div style="font-size:54px;margin-bottom:12px;">' + gradeEmoji(String(grade)) + '</div>' +
    '<div style="font-size:28px;font-weight:900;color:var(--primary);margin-bottom:4px;">' + score + ' ball</div>' +
    (String(grade) !== '&#8212;' ? '<div style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:16px;">Daraja: ' + escHtml(String(grade)) + '</div>' : '<div style="margin-bottom:16px;"></div>') +
    '<div style="background:var(--bg-card-sub);border-radius:14px;padding:14px;text-align:left;display:flex;flex-direction:column;gap:8px;">' +
      '<div style="display:flex;justify-content:space-between;font-size:14px;">' +
        '<span style="color:var(--text-muted);">&#9989; To\'g\'ri javoblar</span>' +
        '<span style="font-weight:700;color:var(--success)">' + correct + ' / ' + total + '</span>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;font-size:14px;">' +
        '<span style="color:var(--text-muted);">&#128197; Topshirilgan sana</span>' +
        '<span style="font-weight:600">' + escHtml(String(dateStr)) + '</span>' +
      '</div>' +
    '</div>' +
    (!pub ? '<div style="margin-top:14px;padding:10px 14px;background:rgba(245,158,11,0.1);border-radius:10px;font-size:13px;color:#D97706;font-weight:600;">&#9203; ' + t('test_waiting_result') + '</div>' : '') +
  '</div>';

  modal.style.display = 'flex';
}

function closeResultModal(e) {
  if (e && e.target && e.target.id !== 'result-modal') return;
  var modal = document.getElementById('result-modal');
  if (modal) modal.style.display = 'none';
}

function gradeEmoji(grade) {
  var g = (grade || '').toUpperCase();
  if (g === 'A+') return '&#127942;';
  if (g === 'A')  return '&#129351;';
  if (g === 'B+') return '&#129352;';
  if (g === 'B')  return '&#129353;';
  if (g === 'C')  return '&#128202;';
  return '&#128203;';
}

// ── PROFILE TAB ──────────────────────────────────
function renderProfileTab() {
  var tab = document.getElementById('tab-profile');
  if (!tab) return;
  if (!state.userInfo) {
    tab.innerHTML = skeletonCards(1);
    loadUserProfile().then(function() { renderProfileTab(); });
    return;
  }
  var u    = state.userInfo;
  var tgU  = state.tgUser;
  var name    = u.fullname || (tgU && tgU.first_name) || 'Foydalanuvchi';
  var phone   = u.phone || '&#8212;';
  var status  = u.status || 'not_registered';
  var isReg   = Boolean(u.is_registered);
  var testCnt = u.tests_count || 0;
  var avg     = u.avg_score !== undefined ? Number(u.avg_score).toFixed(1) : '&#8212;';
  var maxS    = u.max_score !== undefined ? u.max_score : '&#8212;';
  var initials= name.trim().split(/\s+/).map(function(w){return w[0];}).join('').toUpperCase().slice(0,2);

  var statusBadge = isReg
    ? '<span style="display:inline-block;padding:3px 12px;border-radius:20px;background:rgba(16,185,129,0.15);color:#10B981;font-size:12px;font-weight:700;">&#9989; Ro\'yxatdan o\'tgan</span>'
    : '<span style="display:inline-block;padding:3px 12px;border-radius:20px;background:rgba(239,68,68,0.12);color:#EF4444;font-size:12px;font-weight:700;">&#9888; Ro\'yxatdan o\'tmagan</span>';

  tab.innerHTML =
    '<div class="section-header animate-in"><div class="section-title">' + t('profile_title') + '</div></div>' +
    '<div class="profile-card animate-in" style="background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:20px;margin-bottom:12px;">' +
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:18px;">' +
        '<div style="width:64px;height:64px;border-radius:20px;background:linear-gradient(135deg,#3B82F6,#6366F1);color:#fff;font-size:26px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + escHtml(initials) + '</div>' +
        '<div><div style="font-size:18px;font-weight:900;color:var(--text);margin-bottom:4px;">' + escHtml(name) + '</div>' + statusBadge + '</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px;">' +
        statBox('&#128221;', testCnt, t('tests_count')) +
        statBox('&#11088;', avg, "O'rtacha ball") +
        statBox('&#127942;', maxS, 'Eng yuqori') +
      '</div>' +
      '<div style="background:var(--bg-card-sub);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;margin-bottom:14px;">' +
        '<div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--text-muted);">&#128241; Telefon</span><span style="font-weight:700">' + escHtml(String(phone)) + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--text-muted);">&#128100; Telegram ID</span><span style="font-weight:700">' + (tgU && tgU.id ? tgU.id : '&#8212;') + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--text-muted);">&#128202; Holat</span><span style="font-weight:700">' + escHtml(status) + '</span></div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px;">' +
        '<button type="button" onclick="openChangePinFlow()" style="padding:12px;border-radius:12px;background:var(--bg-card-sub);border:1px solid var(--border);font-weight:700;font-size:14px;cursor:pointer;color:var(--text);">&#128272; ' + t('change_pin') + '</button>' +
        (!isReg ? '<button type="button" onclick="goToBotRegister()" style="padding:12px;border-radius:12px;background:linear-gradient(135deg,#3B82F6,#6366F1);color:#fff;border:none;font-weight:700;font-size:14px;cursor:pointer;">&#128640; Ro\'yxatdan o\'tish</button>' : '') +
      '</div>' +
    '</div>';
}

function statBox(icon, val, label) {
  return '<div style="background:var(--bg-card-sub);border-radius:12px;padding:12px;text-align:center;">' +
    '<div style="font-size:22px;margin-bottom:4px;">' + icon + '</div>' +
    '<div style="font-size:17px;font-weight:900;color:var(--text);">' + val + '</div>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + escHtml(String(label)) + '</div>' +
  '</div>';
}

function openChangePinFlow() {
  if (typeof window.changePinPrompt === 'function') window.changePinPrompt();
  else if (typeof window.startPinChange === 'function') window.startPinChange();
  else showToast("PIN o'zgartirish tez orada qo'shiladi");
}

// ── ADMIN TAB ────────────────────────────────────
function renderAdminTab() {
  var tab = document.getElementById('tab-admin');
  if (!tab) return;
  if (!state.isAdmin && !state.isActualAdmin) {
    tab.innerHTML = '<div class="empty-state" style="padding:44px"><div class="empty-icon">&#128683;</div><p>Ruxsat yo\'q</p></div>';
    return;
  }
  tab.innerHTML = skeletonCards(2);
}

async function loadAllUsers() {
  try {
    var tgId = (state.tgUser && state.tgUser.id) || 0;
    var data  = await apiGet('/api/app/users?tg_id=' + tgId);
    if (data.success) renderUsersSection(data.users || [], data.stats || {});
  } catch(e) { console.warn('loadAllUsers err:', e); }
}

function renderUsersSection(users, stats) {
  var tab = document.getElementById('tab-admin');
  if (!tab) return;
  var html = '<div class="section-header animate-in">' +
    '<div class="section-title">Admin Panel</div>' +
    '<div class="section-sub">Jami: ' + (stats.total || users.length) + ' foydalanuvchi</div></div>';

  if (stats.pending > 0) {
    html += '<div style="padding:12px 14px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:12px;margin-bottom:12px;color:#D97706;font-weight:700;font-size:14px;">&#9888; Tasdiqlash kutilmoqda: ' + stats.pending + ' ta</div>';
  }
  users.forEach(function(u) {
    var statusColor = u.status === 'approved' ? 'rgba(16,185,129,0.12);color:#10B981'
      : u.status === 'pending' ? 'rgba(245,158,11,0.12);color:#D97706'
      : 'rgba(239,68,68,0.1);color:#EF4444';
    html += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div style="font-weight:800;font-size:14px;color:var(--text);">' + escHtml(u.fullname || "Noma'lum") + '</div>' +
        '<span style="font-size:11px;padding:2px 10px;border-radius:10px;background:' + statusColor + ';font-weight:700;">' + escHtml(u.status || '&#8212;') + '</span>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">&#128241; ' + escHtml(u.phone || '&#8212;') + ' &middot; &#128100; ' + (u.tg_id || '&#8212;') + '</div>' +
    '</div>';
  });
  tab.innerHTML = html;
}

function toggleUserSimulationMode(enable) {
  if (enable) {
    state.isActualAdmin   = true;
    state.isSimulatedUser = true;
    state.isAdmin         = false;
    showToast("&#128065; O'quvchi rejimiga o'tildi");
  } else {
    state.isSimulatedUser = false;
    state.isAdmin         = true;
    showToast("&#128737; Admin rejimiga qaytildi");
  }
  var banner = document.getElementById('admin-simulation-banner');
  if (banner) banner.style.display = state.isSimulatedUser ? 'flex' : 'none';
  var navAdmin = document.getElementById('nav-admin');
  if (navAdmin) navAdmin.style.display = state.isAdmin ? 'flex' : 'none';
  renderAdminTab();
}

// ── ONBOARDING ───────────────────────────────────
var _obSlide = 0;
var _obTotal = 4;

function renderOnboardingSlides() {}
function openOnboardingModal() {
  var modal = document.getElementById('onboarding-modal');
  if (modal) { _obSlide = 0; goOnboardingSlide(0); modal.style.display = 'flex'; }
}
function closeOnboardingModal() {
  var modal = document.getElementById('onboarding-modal');
  if (modal) modal.style.display = 'none';
}
function nextOnboardingSlide() {
  if (_obSlide < _obTotal - 1) goOnboardingSlide(_obSlide + 1);
  else finishOnboarding();
}
function goOnboardingSlide(idx) {
  _obSlide = idx;
  for (var i = 0; i < _obTotal; i++) {
    var slide = document.getElementById('onboarding-slide-' + i);
    if (slide) slide.style.display = (i === idx) ? 'block' : 'none';
    var dot = document.getElementById('ob-dot-' + i);
    if (dot) {
      dot.style.width      = (i === idx) ? '24px' : '8px';
      dot.style.background = (i === idx) ? 'var(--primary)' : 'var(--border)';
    }
  }
  var nextBtn = document.getElementById('btn-onboarding-next');
  if (nextBtn) nextBtn.textContent = (idx === _obTotal - 1) ? 'Boshlash &#10003;' : 'Keyingisi &#10148;';
}
function finishOnboarding() {
  localStorage.setItem('onboarding_nav_tour_seen', '1');
  closeOnboardingModal();
}

// ── GLOBAL SEARCH ────────────────────────────────
function openGlobalSearch() {
  var modal = document.getElementById('global-search-modal');
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(function() { var inp = document.getElementById('global-search-input'); if (inp) inp.focus(); }, 100);
  }
  if (typeof window.initGlobalSearch === 'function') window.initGlobalSearch();
}
function closeGlobalSearch(e) {
  if (e && e.target && e.target.id !== 'global-search-modal') return;
  var modal = document.getElementById('global-search-modal');
  if (modal) modal.style.display = 'none';
}
function clearGlobalSearch() {
  var inp = document.getElementById('global-search-input');
  if (inp) { inp.value = ''; inp.dispatchEvent(new Event('input')); inp.focus(); }
  var btn = document.getElementById('search-clear-btn');
  if (btn) btn.style.display = 'none';
}
function handleGlobalSearch(q) {
  var btn = document.getElementById('search-clear-btn');
  if (btn) btn.style.display = q ? 'block' : 'none';
  if (typeof window.performSearch === 'function') window.performSearch(q);
}
function selectSearchFilter(f) {
  document.querySelectorAll('.search-chip').forEach(function(c) {
    c.classList.toggle('active', c.id === 'chip-' + f);
  });
  if (typeof window.setSearchFilter === 'function') window.setSearchFilter(f);
}

function closeAboutInfoModal(e) {
  if (e && e.target && e.target.id !== 'about-info-modal') return;
  var m = document.getElementById('about-info-modal');
  if (m) m.style.display = 'none';
}

// ── TOAST ────────────────────────────────────────
var _toastTimer = null;
function showToast(msg, duration) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = msg;
  toast.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() { toast.classList.remove('show'); }, duration || 2800);
}

// ── UTILS ────────────────────────────────────────
function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function formatDateOnly(ts) {
  if (!ts) return '&#8212;';
  var d = new Date(ts * 1000);
  return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
}
function formatTimeOnly(ts) {
  if (!ts) return '&#8212;';
  var d = new Date(ts * 1000);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
function skeletonCards(n) {
  var h = '';
  for (var i = 0; i < n; i++) h += '<div class="skeleton skeleton-card"></div>';
  return h;
}
function errorState(msg) {
  return '<div class="empty-state" style="padding:44px 16px;">' +
    '<div class="empty-icon" style="font-size:42px;margin-bottom:12px;">&#9888;</div>' +
    '<div style="font-weight:800;font-size:15px;color:var(--text)">' + escHtml(msg) + '</div>' +
    '<button type="button" onclick="loadActiveTests()" style="margin-top:14px;padding:10px 20px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;">Qayta urinish</button>' +
  '</div>';
}

// ── ENTRY POINT ──────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
