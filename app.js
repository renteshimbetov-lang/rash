/**
 * ASOSIY MINI APP — app.js
 * PIN tizimi, tab navigatsiya, API, Til, Tema
 */

const API_BASE = '';
const LS_PIN = 'app_pin';
const LS_USER = 'app_user';
const LS_LANG = 'app_lang';
const LS_THEME = 'app_theme';

// ── I18N ────────────────────────────────────────
var I18N = {
  uz: {
    tab_home:'Asosiy', tab_tests:'Testlar', tab_profile:'Profil', tab_admin:'Admin',
    pin_create:'PIN kod yarating', pin_create_sub:'Xavfsizlik uchun 4 xonali PIN kod belgilang',
    pin_confirm:'PIN kodni tasdiqlang', pin_confirm_sub:'Tasdiqlash uchun PIN kodingizni qayta kiriting',
    pin_enter_sub:'Kirish uchun PIN kodingizni kiriting',
    pin_mismatch:'PIN kodlar mos kelmadi', pin_wrong:"Noto\u02BBg\u02BBri PIN kod",
    welcome:'Xush kelibsiz',
    home_title:'Asosiy', home_sub:'Testlar va rejalar',
    active_tests:'FAOL TESTLAR', closed_tests:"TO\u02BBXTATILGAN",
    already_done:'Allaqachon topshirildi', start_test:'Testni boshlash',
    my_tests_title:'Mening testlarim', tests_count:'ta test topshirildi',
    empty_tests:'Hali hech qanday test topshirmadingiz',
    empty_active:"Hozircha faol test yo\u02BBq",
    profile_title:'Profil', change_pin:"PIN kodni o\u02BBzgartirish",
    stat_tests:'Testlar', stat_avg:"O\u02BBrtacha", stat_max:'Eng yuqori', stat_status:'Holat',
    info_name:"To\u02BBlliq ism", info_phone:'Telefon', info_tg:'Telegram', info_id:'TG ID',
    status_new:"Yangi o\u02BBquvchi", status_gold:'Oltin', status_silver:'Kumush',
    status_bronze:'Bronza', status_learner:"O\u02BBrganuvchi",
    result_title:'Natija', result_correct:"To\u02BBg\u02BBri", result_wrong:"Noto\u02BBg\u02BBri",
    result_blank:'Belgilanmagan', result_date:'Sana', result_grade:'Daraja',
    users_title:'Foydalanuvchilar', total:'Jami', approved:'Tasdiqlangan', pending:'Kutayotgan',
    create_test:'Test yaratish', admin_panel:'Admin Panel', grade_lbl:'daraja',
    theme_dark:'Tungi', theme_light:'Kunduzgi'
  },
  ru: {
    tab_home:'\u0413\u043b\u0430\u0432\u043d\u0430\u044f', tab_tests:'\u0422\u0435\u0441\u0442\u044b', tab_profile:'\u041f\u0440\u043e\u0444\u0438\u043b\u044c', tab_admin:'\u0410\u0434\u043c\u0438\u043d',
    pin_create:'\u0421\u043e\u0437\u0434\u0430\u0439\u0442\u0435 PIN', pin_create_sub:'\u0412\u0432\u0435\u0434\u0438\u0442\u0435 4-\u0437\u043d\u0430\u0447\u043d\u044b\u0439 PIN \u0434\u043b\u044f \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u0438',
    pin_confirm:'\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 PIN', pin_confirm_sub:'\u0412\u0432\u0435\u0434\u0438\u0442\u0435 PIN \u0435\u0449\u0451 \u0440\u0430\u0437',
    pin_enter_sub:'\u0412\u0432\u0435\u0434\u0438\u0442\u0435 PIN-\u043a\u043e\u0434 \u0434\u043b\u044f \u0432\u0445\u043e\u0434\u0430',
    pin_mismatch:'PIN-\u043a\u043e\u0434\u044b \u043d\u0435 \u0441\u043e\u0432\u043f\u0430\u0434\u0430\u044e\u0442', pin_wrong:'\u041d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 PIN-\u043a\u043e\u0434',
    welcome:'\u0414\u043e\u0431\u0440\u043e \u043f\u043e\u0436\u0430\u043b\u043e\u0432\u0430\u0442\u044c',
    home_title:'\u0413\u043b\u0430\u0432\u043d\u0430\u044f', home_sub:'\u0422\u0435\u0441\u0442\u044b \u0438 \u043f\u043b\u0430\u043d\u044b',
    active_tests:'\u0410\u041a\u0422\u0418\u0412\u041d\u042b\u0415 \u0422\u0415\u0421\u0422\u042b', closed_tests:'\u0417\u0410\u0412\u0415\u0420\u0428\u0415\u041d\u042b',
    already_done:'\u0423\u0436\u0435 \u0441\u0434\u0430\u043d', start_test:'\u041d\u0430\u0447\u0430\u0442\u044c \u0442\u0435\u0441\u0442',
    my_tests_title:'\u041c\u043e\u0438 \u0442\u0435\u0441\u0442\u044b', tests_count:'\u0442\u0435\u0441\u0442\u043e\u0432 \u0441\u0434\u0430\u043d\u043e',
    empty_tests:'\u0412\u044b \u0435\u0449\u0451 \u043d\u0435 \u0441\u0434\u0430\u0432\u0430\u043b\u0438 \u043d\u0438 \u043e\u0434\u043d\u043e\u0433\u043e \u0442\u0435\u0441\u0442\u0430',
    empty_active:'\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0445 \u0442\u0435\u0441\u0442\u043e\u0432',
    profile_title:'\u041f\u0440\u043e\u0444\u0438\u043b\u044c', change_pin:'\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c PIN-\u043a\u043e\u0434',
    stat_tests:'\u0422\u0435\u0441\u0442\u044b', stat_avg:'\u0421\u0440\u0435\u0434\u043d\u0435\u0435', stat_max:'\u041c\u0430\u043a\u0441\u0438\u043c\u0443\u043c', stat_status:'\u0421\u0442\u0430\u0442\u0443\u0441',
    info_name:'\u041f\u043e\u043b\u043d\u043e\u0435 \u0438\u043c\u044f', info_phone:'\u0422\u0435\u043b\u0435\u0444\u043e\u043d', info_tg:'Telegram', info_id:'TG ID',
    status_new:'\u041d\u043e\u0432\u044b\u0439 \u0443\u0447\u0435\u043d\u0438\u043a', status_gold:'\u0417\u043e\u043b\u043e\u0442\u043e', status_silver:'\u0421\u0435\u0440\u0435\u0431\u0440\u043e',
    status_bronze:'\u0411\u0440\u043e\u043d\u0437\u0430', status_learner:'\u041e\u0431\u0443\u0447\u0430\u044e\u0449\u0438\u0439\u0441\u044f',
    result_title:'\u0420\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442', result_correct:'\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u044b\u0435', result_wrong:'\u041d\u0435\u043f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u044b\u0435',
    result_blank:'\u041d\u0435 \u043e\u0442\u043c\u0435\u0447\u0435\u043d\u043e', result_date:'\u0414\u0430\u0442\u0430', result_grade:'\u0423\u0440\u043e\u0432\u0435\u043d\u044c',
    users_title:'\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438', total:'\u0412\u0441\u0435\u0433\u043e', approved:'\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u044b', pending:'\u041e\u0436\u0438\u0434\u0430\u044e\u0442',
    create_test:'\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0442\u0435\u0441\u0442', admin_panel:'\u041f\u0430\u043d\u0435\u043b\u044c \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0430',
    grade_lbl:'\u0443\u0440\u043e\u0432\u0435\u043d\u044c', theme_dark:'\u0422\u0451\u043c\u043d\u0430\u044f', theme_light:'\u0421\u0432\u0435\u0442\u043b\u0430\u044f'
  },
  en: {
    tab_home:'Home', tab_tests:'Tests', tab_profile:'Profile', tab_admin:'Admin',
    pin_create:'Create PIN Code', pin_create_sub:'Set a 4-digit PIN for security',
    pin_confirm:'Confirm PIN', pin_confirm_sub:'Enter your PIN again to confirm',
    pin_enter_sub:'Enter your PIN to sign in',
    pin_mismatch:"PIN codes don't match", pin_wrong:'Wrong PIN code',
    welcome:'Welcome',
    home_title:'Home', home_sub:'Tests and schedules',
    active_tests:'ACTIVE TESTS', closed_tests:'CLOSED',
    already_done:'Already submitted', start_test:'Start test',
    my_tests_title:'My Tests', tests_count:'tests submitted',
    empty_tests:"You haven't submitted any tests yet",
    empty_active:'No active tests right now',
    profile_title:'Profile', change_pin:'Change PIN Code',
    stat_tests:'Tests', stat_avg:'Average', stat_max:'Best', stat_status:'Status',
    info_name:'Full name', info_phone:'Phone', info_tg:'Telegram', info_id:'TG ID',
    status_new:'New student', status_gold:'Gold', status_silver:'Silver',
    status_bronze:'Bronze', status_learner:'Learner',
    result_title:'Result', result_correct:'Correct', result_wrong:'Wrong',
    result_blank:'Blank', result_date:'Date', result_grade:'Grade',
    users_title:'Users', total:'Total', approved:'Approved', pending:'Pending',
    create_test:'Create test', admin_panel:'Admin Panel',
    grade_lbl:'grade', theme_dark:'Dark', theme_light:'Light'
  }
};

function t(key) {
  var lang = localStorage.getItem(LS_LANG) || 'uz';
  return (I18N[lang] && I18N[lang][key]) || (I18N.uz && I18N.uz[key]) || key;
}

// ── STATE ────────────────────────────────────────
var state = {
  tgUser: null,
  userInfo: null,
  isAdmin: false,
  pinBuffer: '',
  pinMode: 'enter',
  pinFirst: '',
  activeTab: 'home',
  homeSubtab: 'active',
  adminSubtab: 'users',
};

// ── INIT ────────────────────────────────────────
function initApp() {
  // Birinchi kirishda oq (light), foydalanuvchi qora (dark) qilsa o'sha saqlanadi
  var savedTheme = localStorage.getItem(LS_THEME) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  updateLangLabel();

  try {
    var urlParams = new URLSearchParams(window.location.search);
    var queryTgId = urlParams.get('tg_id');
    var tg = window.Telegram && window.Telegram.WebApp;
    if (tg) {
      try { tg.ready(); tg.expand(); } catch (e) {}
    }
    var tgU = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (tgU && tgU.id) {
      state.tgUser = tgU;
    } else if (queryTgId && parseInt(queryTgId) > 0) {
      state.tgUser = { id: parseInt(queryTgId), first_name: 'Foydalanuvchi', last_name: '', username: '' };
    } else {
      state.tgUser = { id: 0, first_name: 'Mehmon', last_name: '', username: '' };
    }
    try {
      var saved = localStorage.getItem(LS_USER);
      if (saved) state.userInfo = JSON.parse(saved);
    } catch (e) {}
  } catch (err) {
    console.error('initApp error:', err);
  }

  runSplash();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// ── SPLASH (Chiroyli kirish animatsiyasi) ──────────
function runSplash() {
  var splash = document.getElementById('splash-screen');
  var logoBox = document.getElementById('splash-logo-box');
  var ring = document.getElementById('splash-ring');
  var ring2 = document.getElementById('splash-ring-2');

  if (!splash) { launchApp(); return; }

  // Ma'lumotlarni fonda oldindan tayyorlab qo'yish
  launchApp();

  // 1.0s — Muvaffaqiyatli tekshiruv (checkmark) animatsiyasi
  setTimeout(function() {
    if (logoBox) logoBox.classList.add('success');
    if (ring) ring.classList.add('success');
    if (ring2) ring2.classList.add('success');
  }, 1000);

  // 1.8s — Yumshoq tarzda asosiy ilovaga o'tish (fade-out)
  setTimeout(function() {
    if (splash) splash.classList.add('hide-splash');
    setTimeout(function() {
      if (splash) splash.style.display = 'none';

      // Kirish animatsiyasi 100% tugagachgina tugmalar va dizayn yo'riqnomasini ochish
      if (!localStorage.getItem('onboarding_nav_tour_seen')) {
        setTimeout(function() {
          openOnboardingModal();
        }, 350);
      }
    }, 450);
  }, 1800);
}

// ── PIN SYSTEM ──────────────────────────────────
async function initPinScreen() {
  var hasPin = !!localStorage.getItem(LS_PIN);
  if (!hasPin && state.userInfo && state.userInfo.has_pin) {
    hasPin = true;
  }

  // Telegram CloudStorage tekshirish
  if (!hasPin && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
    try {
      window.Telegram.WebApp.CloudStorage.getItem(LS_PIN, function(err, val) {
        if (!err && val) {
          localStorage.setItem(LS_PIN, val);
          state.pinMode = 'enter';
          updatePinUI(true);
        }
      });
    } catch(e) {}
  }

  updatePinUI(hasPin);
  renderPinDots(0);
}

function updatePinUI(hasPin) {
  var pinTitle = document.getElementById('pin-title');
  var pinSub = document.getElementById('pin-subtitle');
  if (!pinTitle || !pinSub) return;

  if (!hasPin) {
    state.pinMode = 'setup';
    pinTitle.textContent = t('pin_create');
    pinSub.textContent = t('pin_create_sub');
  } else {
    state.pinMode = 'enter';
    var name = (state.userInfo && state.userInfo.fullname)
      || (state.tgUser && state.tgUser.first_name) || 'Salom';
    pinTitle.textContent = t('welcome') + ', ' + name.split(' ')[0] + '!';
    pinSub.textContent = t('pin_enter_sub');
  }
}

function onPinKey(val) {
  if (state.pinBuffer.length >= 4) return;
  state.pinBuffer += val;
  renderPinDots(state.pinBuffer.length);
  if (state.pinBuffer.length === 4) setTimeout(processPin, 120);
}

function onPinDel() {
  if (state.pinBuffer.length === 0) return;
  state.pinBuffer = state.pinBuffer.slice(0, -1);
  renderPinDots(state.pinBuffer.length);
}

function renderPinDots(count, mode) {
  var dots = document.querySelectorAll('.pin-dot');
  dots.forEach(function(d, i) {
    d.classList.remove('filled', 'error');
    if (mode === 'error') { d.classList.add('error'); }
    else if (i < count) { d.classList.add('filled'); }
  });
}

async function processPin() {
  var pin = state.pinBuffer;
  state.pinBuffer = '';
  var tgId = (state.tgUser && state.tgUser.id) || 0;

  if (state.pinMode === 'setup') {
    state.pinFirst = pin;
    state.pinMode = 'confirm';
    document.getElementById('pin-title').textContent = t('pin_confirm');
    document.getElementById('pin-subtitle').textContent = t('pin_confirm_sub');
    renderPinDots(0);
    showPinError('');
  } else if (state.pinMode === 'confirm') {
    if (pin === state.pinFirst) {
      // 1. LocalStorage ga saqlash
      localStorage.setItem(LS_PIN, btoa(pin));
      // 2. Telegram CloudStorage ga saqlash
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
        try { window.Telegram.WebApp.CloudStorage.setItem(LS_PIN, btoa(pin)); } catch(e) {}
      }
      if (tgId) {
        try {
          fetch('/api/app/set-pin', {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ tg_id: tgId, pin: pin, init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || '' })
          });
        } catch(e) {}
      }
      showPinError('');
      launchApp();
    } else {
      showPinError(t('pin_mismatch'));
      renderPinDots(4, 'error');
      state.pinMode = 'setup';
      state.pinFirst = '';
      setTimeout(function() {
        renderPinDots(0);
        document.getElementById('pin-title').textContent = t('pin_create');
        document.getElementById('pin-subtitle').textContent = t('pin_create_sub');
        showPinError('');
      }, 1000);
    }
  } else {
    var stored = '';
    try { stored = atob(localStorage.getItem(LS_PIN) || ''); } catch(e) {}
    
    var isValid = (stored && pin === stored);

    if (!isValid && tgId) {
      try {
        var res = await fetch('/api/app/verify-pin', {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ tg_id: tgId, pin: pin, init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || '' })
        });
        var data = await res.json();
        if (data.valid) {
          isValid = true;
          localStorage.setItem(LS_PIN, btoa(pin));
        }
      } catch(e) {}
    }

    if (isValid) {
      showPinError('');
      launchApp();
    } else {
      showPinError(t('pin_wrong'));
      renderPinDots(4, 'error');
      setTimeout(function() { renderPinDots(0); showPinError(''); }, 900);
    }
  }
}

function showPinError(msg) {
  var el = document.getElementById('pin-error');
  if (el) el.textContent = msg;
}

// ── LAUNCH APP ──────────────────────────────────
async function launchApp() {
  var pinScreen = document.getElementById('pin-screen');
  if (pinScreen) {
    pinScreen.style.display = 'none';
  }

  var app = document.getElementById('app');
  if (app) {
    app.style.display = 'flex';
    app.style.flexDirection = 'column';
    app.classList.add('visible');
  }

  applyI18n();
  updateHeaderUser();

  // Profil va faol testlarni parallel (bir vaqtda) yuklash
  Promise.all([
    loadUserProfile().catch(function(e) { console.warn('Profile:', e); }),
    loadActiveTests().catch(function(e) { console.warn('ActiveTests:', e); })
  ]).then(function() {
    updateHeaderUser();
    try {
      var urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tab') === 'admin' && state.isAdmin) {
        switchTab('admin');
      }
    } catch (e) {}
  });

  // Yangi foydalanuvchilar uchun tugmalar va dizayn qo'llanmasi
  var splashScreen = document.getElementById('splash-screen');
  if (!splashScreen && !localStorage.getItem('onboarding_nav_tour_seen')) {
    setTimeout(function() {
      openOnboardingModal();
    }, 600);
  }

  // Real vaqt rejimida Bot & Server faolligini tekshirish
  checkBotServerStatus();
  setInterval(checkBotServerStatus, 25000);
}

// ── SERVER & BOT STATUS MONITOR ─────────────────
async function checkBotServerStatus() {
  var pill = document.getElementById('bot-status-pill');
  var txt = document.getElementById('bot-status-text');
  if (!pill || !txt) return;

  try {
    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 4000);
    var res = await fetch(API_BASE + '/api/app/status', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      var data = await res.json();
      if (data.bot_active || data.status === 'online') {
        pill.className = 'server-status-pill online';
        txt.textContent = 'Faol';
        pill.setAttribute('title', '🟢 Bot va Server 24/7 faol ishlamoqda');
        return;
      }
    }
    throw new Error('Offline');
  } catch (e) {
    pill.className = 'server-status-pill offline';
    txt.textContent = 'O\'chiq';
    pill.setAttribute('title', '🔴 Server yoki Macbook o\'chiq holatda');
  }
}

// ── API & AUTENTIFIKATSIYA ─────────────────────────
function getAuthHeaders(customHeaders) {
  var headers = Object.assign({}, customHeaders || {});
  var initData = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || '';
  if (initData) {
    headers['X-Telegram-Init-Data'] = initData;
  }
  return headers;
}

async function apiGet(path) {
  var initData = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || '';
  var fullUrl = API_BASE + path;
  if (initData && fullUrl.indexOf('init_data=') === -1) {
    var sep = fullUrl.indexOf('?') === -1 ? '?' : '&';
    fullUrl += sep + 'init_data=' + encodeURIComponent(initData);
  }
  var res = await fetch(fullUrl, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('API ' + res.status);
  return res.json();
}

async function loadUserProfile() {
  var urlParams = new URLSearchParams(window.location.search);
  var tgId = (state.tgUser && state.tgUser.id) || parseInt(urlParams.get('tg_id')) || 0;
  if (!tgId) {
    var tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      tgId = tg.initDataUnsafe.user.id;
      state.tgUser = tg.initDataUnsafe.user;
    }
  }
  if (!tgId) return;
  try {
    var data = await apiGet('/api/app/profile?tg_id=' + tgId);
    if (data.success) {
      state.userInfo = data.user;
      state.isAdmin = data.is_admin;
      localStorage.setItem(LS_USER, JSON.stringify(data.user));
      var adminTab = document.getElementById('nav-admin');
      if (adminTab) adminTab.style.display = state.isAdmin ? 'flex' : 'none';
      if (state.isAdmin && data.pending_users > 0) {
        var badge = document.getElementById('admin-badge');
        if (badge) { badge.textContent = data.pending_users; badge.style.display = 'block'; }
      }
      if (urlParams.get('tab') === 'admin' && state.isAdmin) {
        switchTab('admin');
      }
    }
  } catch (e) { console.warn('loadUserProfile err:', e); }
}

async function loadActiveTests() {
  var tab = document.getElementById('tab-home');
  if (!tab) return;
  tab.innerHTML = '<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>';
  try {
    var tgId = (state.tgUser && state.tgUser.id) || 0;
    var data = await apiGet('/api/app/active-tests?tg_id=' + tgId);
    if (data.success) {
      window.availableActiveTests = data.tests || [];
      renderHomeTab(data.tests);
    }
    else throw new Error('no success');
  } catch (e) {
    tab.innerHTML = '<div class="empty-state"><div class="empty-icon">\u26A0\uFE0F</div><p>' + t('empty_active') + '</p></div>';
  }
}

async function loadMyResults() {
  var tab = document.getElementById('tab-tests');
  tab.innerHTML = '<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>';
  try {
    var tgId = (state.tgUser && state.tgUser.id) || 0;
    var data = await apiGet('/api/app/my-results?tg_id=' + tgId);
    if (data.success) renderTestsTab(data.results);
    else throw new Error('no success');
  } catch (e) {
    tab.innerHTML = '<div class="empty-state"><div class="empty-icon">\u26A0\uFE0F</div><p>' + t('empty_tests') + '</p></div>';
  }
}

async function loadAllUsers() {
  try {
    var urlParams = new URLSearchParams(window.location.search);
    var tgId = (state.tgUser && state.tgUser.id) || parseInt(urlParams.get('tg_id')) || 0;
    
    // Agar testlar ro'yxati yuklanmagan bo'lsa, shablonlar uchun fon rejimida yuklab olamiz
    if (!window.availableActiveTests) {
      apiGet('/api/app/active-tests?tg_id=' + tgId).then(function(d) {
        if (d && d.success) window.availableActiveTests = d.tests || [];
      }).catch(function() {});
    }

    var data = await apiGet('/api/app/users?tg_id=' + tgId);
    if (data.success) {
      renderUsersSection(data.users, data.stats);
    } else {
      var listEl = document.getElementById('users-list');
      if (listEl) {
        listEl.innerHTML = '<div class="empty-state" style="padding:24px 10px;"><div class="empty-icon">⚠️</div><p>' + (data.message || 'Foydalanuvchilarni yuklab bo\'lmadi') + '</p></div>';
      }
    }
  } catch (e) {
    console.warn('users err:', e);
    var listEl = document.getElementById('users-list');
    if (listEl) {
      listEl.innerHTML = '<div class="empty-state" style="padding:24px 10px;"><div class="empty-icon">⚠️</div><p>Server bilan bog\'lanishda xatolik</p></div>';
    }
  }
}

// ── TAB NAVIGATION ──────────────────────────────
function switchTab(tabId) {
  state.activeTab = tabId;

  // Telegram Haptic feedback
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    } catch(e) {}
  }

  // Animate clicked nav button with spring pop
  var activeBtn = document.getElementById('nav-' + tabId);
  if (activeBtn) {
    activeBtn.classList.remove('nav-tap-pop');
    void activeBtn.offsetWidth; // trigger reflow
    activeBtn.classList.add('nav-tap-pop');
    setTimeout(function() {
      activeBtn.classList.remove('nav-tap-pop');
    }, 450);
  }

  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(function(el) {
    el.classList.toggle('active', el.id === 'tab-' + tabId);
  });
  if (tabId === 'home') loadActiveTests();
  else if (tabId === 'tests') loadMyResults();
  else if (tabId === 'profile') renderProfileTab();
  else if (tabId === 'admin') { renderAdminTab(); loadAllUsers(); }
}

function switchHomeSubtab(subtab) {
  if (state.homeSubtab === subtab) return;
  state.homeSubtab = subtab;

  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    } catch(e) {}
  }

  if (window.availableActiveTests) {
    renderHomeTab(window.availableActiveTests);
  } else {
    loadActiveTests();
  }
}

function openTestSolving(testId) {
  var tgId = (state.tgUser && state.tgUser.id) || 0;
  window.location.href = '/index.html?test_id=' + testId + '&tg_id=' + tgId;
}

function returnToTelegramChat() {
  if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.close === 'function') {
    window.Telegram.WebApp.close();
  } else {
    showToast('Telegram bot chatiga qaytildi');
  }
}

function startTestInBot(testCode, testId) {
  var tgId = (state.tgUser && state.tgUser.id) || 0;
  if (!tgId && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
    tgId = window.Telegram.WebApp.initDataUnsafe.user.id;
  }

  if (tgId) {
    var url = '/api/app/trigger-solve?tg_id=' + encodeURIComponent(tgId) + 
              '&test_code=' + encodeURIComponent(testCode || '') + 
              '&test_id=' + encodeURIComponent(testId || '');
    try {
      fetch(url, { keepalive: true }).catch(function(e) { console.error(e); });
    } catch(e) {
      console.error("Trigger solve error:", e);
    }
  }

  if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.close === 'function' && window.Telegram.WebApp.initData) {
    if (window.Telegram.WebApp.HapticFeedback && window.Telegram.WebApp.HapticFeedback.notificationOccurred) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    setTimeout(function() {
      window.Telegram.WebApp.close();
    }, 120);
  } else {
    // Brauzerda test rejimida ochilganda bevosita yechish oynasiga o'tish
    openTestSolving(testId);
  }
}

function renderTestDetailCard(test, type) {
  var tgId = (state.tgUser && state.tgUser.id) || 0;
  var isUpcoming = (type === 'upcoming');
  var isActive = (type === 'active');
  var isInactive = (type === 'inactive');
  var done = Boolean(test.already_submitted);

  var cardClass = isUpcoming ? 'test-card-upcoming' : (isActive ? 'test-card-active' : 'test-card-closed');
  var badgeHtml = '';
  if (isUpcoming) {
    badgeHtml = '<span class="badge" style="background:rgba(245,158,11,0.15);color:#D97706;border:1px solid rgba(245,158,11,0.3);font-weight:800;">⏳ Kutilmoqda</span>';
  } else if (isActive) {
    if (done) {
      badgeHtml = '<span class="badge" style="background:rgba(16,185,129,0.15);color:#059669;border:1px solid rgba(16,185,129,0.3);font-weight:800;">✅ Topshirilgan</span>';
    } else {
      badgeHtml = '<span class="badge" style="background:rgba(16,185,129,0.15);color:#10B981;border:1px solid rgba(16,185,129,0.3);font-weight:800;">🟢 Hozir faol</span>';
    }
  } else {
    badgeHtml = '<span class="badge badge-inactive">🔴 To\'xtatildi</span>';
  }

  var codeDisplay = test.test_code ? (String(test.test_code).startsWith('#') ? test.test_code : ('#' + test.test_code)) : '—';
  var dateStr = test.scheduled_date ? escHtml(test.scheduled_date) : (isUpcoming ? 'Belgilangan vaqtda' : 'Bugun');
  var startStr = test.scheduled_start ? (escHtml(test.scheduled_start) + ' (UZB)') : (isActive ? 'Boshlangan' : '—');
  var endStr = test.scheduled_end ? (escHtml(test.scheduled_end) + ' (UZB)') : 'Cheklanmagan';
  var totalQuestions = (test.total_questions || 45) + ' ta savol (55 ta band)';
  var timeLimit = test.time_limit_min ? (test.time_limit_min + ' daqiqa') : 'Cheksiz';
  var ytUrl = (test.youtube_url || '').trim();
  var ytStatus = ytUrl ? '<span style="color:#DC2626;font-weight:700;">Mavjud (YouTube) 🎬</span>' : '<span style="color:var(--text-muted);">Rejalashtirilmoqda</span>';

  var html = '<div class="test-rich-card ' + cardClass + ' animate-in">' +
    '<div class="test-rich-header">' +
      '<div class="test-rich-icon ' + (isUpcoming ? 'amber' : (isActive ? 'green' : 'gray')) + '">' +
        (isUpcoming ? '⏳' : (isActive ? '📝' : '🔒')) +
      '</div>' +
      '<div class="test-rich-title-box">' +
        '<div class="test-rich-title">' + escHtml(test.title || 'Matematika Testi') + '</div>' +
        '<div class="test-rich-subject">' + escHtml(test.subject || 'Matematika') + '</div>' +
      '</div>' +
      '<div>' + badgeHtml + '</div>' +
    '</div>' +

    // Qatorma-qator to'liq ma'lumotlar ro'yxati
    '<div class="test-rich-info-grid">' +
      '<div class="test-rich-info-row">' +
        '<span class="test-rich-label">📌 Test kodi:</span>' +
        '<span class="test-rich-val test-rich-code">' + escHtml(codeDisplay) + '</span>' +
      '</div>' +
      '<div class="test-rich-info-row">' +
        '<span class="test-rich-label">📅 Belgilangan sana:</span>' +
        '<span class="test-rich-val">' + dateStr + '</span>' +
      '</div>' +
      '<div class="test-rich-info-row">' +
        '<span class="test-rich-label">🕐 Boshlanish vaqti:</span>' +
        '<span class="test-rich-val">' + startStr + '</span>' +
      '</div>' +
      '<div class="test-rich-info-row">' +
        '<span class="test-rich-label">🕕 Tugash vaqti:</span>' +
        '<span class="test-rich-val">' + endStr + '</span>' +
      '</div>' +
      '<div class="test-rich-info-row">' +
        '<span class="test-rich-label">❓ Savollar soni:</span>' +
        '<span class="test-rich-val">' + totalQuestions + '</span>' +
      '</div>' +
      (test.time_limit_min ? (
        '<div class="test-rich-info-row">' +
          '<span class="test-rich-label">⏱ Vaqt chegarasi:</span>' +
          '<span class="test-rich-val">' + timeLimit + '</span>' +
        '</div>'
      ) : '') +
      '<div class="test-rich-info-row">' +
        '<span class="test-rich-label">🎬 Video tahlil:</span>' +
        '<span class="test-rich-val">' + ytStatus + '</span>' +
      '</div>' +
    '</div>';

  // Tugmalar
  html += '<div class="test-rich-actions">';
  if (isUpcoming) {
    html += '<button type="button" class="btn-rich-action btn-rich-secondary" style="width:100%" onclick="returnToTelegramChat()">' +
      '<span>💬</span> Botga (chatga) qaytish' +
    '</button>';
  } else if (isActive) {
    if (done) {
      html += '<button type="button" class="btn-rich-action btn-rich-success" style="width:100%" onclick="switchTab(\'tests\')">' +
        '<span>✅</span> Natijani ko\'rish' +
      '</button>';
    } else {
      html += '<button type="button" class="btn-rich-action btn-rich-primary" style="width:100%" onclick="startTestInBot(\'' + (test.test_code || '') + '\', ' + test.id + ')">' +
        '<span>✍️</span> Testni yechish' +
      '</button>';
    }
  } else {
    if (done) {
      html += '<button type="button" class="btn-rich-action btn-rich-success" style="width:100%" onclick="switchTab(\'tests\')">' +
        '<span>✅</span> Natijani ko\'rish' +
      '</button>';
    } else {
      html += '<button type="button" class="btn-rich-action btn-rich-secondary" style="width:100%" onclick="returnToTelegramChat()">' +
        '<span>🔒</span> Test muddati tugagan' +
      '</button>';
    }
  }
  html += '</div>';

  html += '</div>';
  return html;
}

// ── HOME TAB (Faol va Oldingi testlar - 2 ta bo'lim) ─
function renderHomeTab(tests) {
  var tab = document.getElementById('tab-home');
  if (!tab) return;
  window.availableActiveTests = tests || [];
  var currentSubtab = state.homeSubtab || 'active';

  var upcoming = tests.filter(function(t) { return t.is_upcoming; });
  var active = tests.filter(function(t) { return t.is_active && !t.is_upcoming; });
  var inactive = tests.filter(function(t) { return !t.is_active && !t.is_upcoming; });

  var activeTotalCount = active.length + upcoming.length;
  var pastTotalCount = inactive.length;

  var html = '<div class="section-header animate-in">' +
    '<div class="section-title">' + t('home_title') + '</div>' +
    '<div class="section-sub">' + t('home_sub') + '</div></div>';

  // ── SUBTABS (2 ta bo'lim: Faol va Oldingi) ──
  var boltIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/></svg>';
  var archiveIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';

  html += '<div class="home-subtabs animate-in">' +
    '<button type="button" class="home-subtab ' + (currentSubtab === 'active' ? 'active' : '') + '" onclick="switchHomeSubtab(\'active\')">' +
      '<span class="home-subtab-icon">' + boltIcon + '</span>' +
      '<span class="home-subtab-text">Faol testlar</span>' +
      '<span class="home-subtab-badge">' + activeTotalCount + '</span>' +
    '</button>' +
    '<button type="button" class="home-subtab ' + (currentSubtab === 'past' ? 'active' : '') + '" onclick="switchHomeSubtab(\'past\')">' +
      '<span class="home-subtab-icon">' + archiveIcon + '</span>' +
      '<span class="home-subtab-text">Oldingi testlar</span>' +
      '<span class="home-subtab-badge">' + pastTotalCount + '</span>' +
    '</button>' +
  '</div>';

  // ── SUBTAB MAZMUNI ──
  html += '<div class="home-subtab-content animate-in">';

  if (currentSubtab === 'active') {
    // 1. Kutilayotgan testlar (Upcoming)
    if (upcoming.length > 0) {
      html += '<div class="section-sub" style="margin-bottom:12px;font-weight:800;color:#D97706;font-size:13px;display:flex;align-items:center;gap:6px;">' +
        '<span>⏳</span> Kutilayotgan testlar (' + upcoming.length + ' ta):' +
      '</div>';
      upcoming.forEach(function(test) {
        html += renderTestDetailCard(test, 'upcoming');
      });
    }

    // 2. Faol testlar (Active)
    if (active.length > 0) {
      if (upcoming.length > 0) {
        html += '<div class="section-sub" style="margin:16px 0 12px;font-weight:800;color:var(--success);font-size:13px;display:flex;align-items:center;gap:6px;">' +
          '<span>🟢</span> Hozir faol testlar (' + active.length + ' ta):' +
        '</div>';
      }
      active.forEach(function(test) {
        html += renderTestDetailCard(test, 'active');
      });
    }

    // Bo'sh holat
    if (activeTotalCount === 0) {
      html += '<div class="empty-state animate-in" style="padding:44px 16px;">' +
        '<div class="empty-icon" style="font-size:42px;margin-bottom:12px;">📫</div>' +
        '<div style="font-weight:800;font-size:16px;margin-bottom:6px;color:var(--text)">Hozircha faol test yo\'q</div>' +
        '<p style="font-size:13px;color:var(--text-muted);margin:0;max-width:280px;line-height:1.5;">Yangi testlar rejalashtirilganda yoki boshlanganda shu yerda ko\'rinadi.</p>' +
      '</div>';
    }
  } else {
    // 3. Oldingi / Muddati tugagan testlar (Closed)
    if (inactive.length > 0) {
      inactive.forEach(function(test) {
        html += renderTestDetailCard(test, 'inactive');
      });
    } else {
      html += '<div class="empty-state animate-in" style="padding:44px 16px;">' +
        '<div class="empty-icon" style="font-size:42px;margin-bottom:12px;">📁</div>' +
        '<div style="font-weight:800;font-size:16px;margin-bottom:6px;color:var(--text)">Oldingi testlar mavjud emas</div>' +
        '<p style="font-size:13px;color:var(--text-muted);margin:0;max-width:280px;line-height:1.5;">Muddati tugagan yoki yakunlangan testlar arxivi shu yerda saqlanadi.</p>' +
      '</div>';
    }
  }

  html += '</div>';

  tab.innerHTML = html;
}

// ── TESTS TAB (faqat topshirilgan, bosilsa natija) ─
function renderTestsTab(results) {
  var tab = document.getElementById('tab-tests');
  var html = '<div class="section-header animate-in">' +
    '<div class="section-title">' + t('my_tests_title') + '</div>' +
    '<div class="section-sub">' + results.length + ' ' + t('tests_count') + '</div></div>';

  if (results.length === 0) {
    html += '<div class="empty-state animate-in"><div class="empty-icon">\uD83D\uDCED</div><p>' + t('empty_tests') + '</p></div>';
  } else {
    window._myResults = results;
    results.forEach(function(r, i) {
      var isPub = Boolean(r.results_published);
      var maxScore = r.max_score || 100;
      var date = formatDate(r.submitted_at);

      if (isPub) {
        var score = (r.score != null) ? r.score : 0;
        var grade = r.grade || getGradeFromScore(score, maxScore);
        var gradeClass = gradeToClass(grade);
        html += '<div class="history-card animate-in" style="animation-delay:' + (i * 0.05) + 's;cursor:pointer" onclick="showResultModal(window._myResults[' + i + '])">' +
          '<div class="history-info" style="padding-left:12px">' +
          '<div class="history-title">' + escHtml(r.test_title || r.title || 'Test') + '</div>' +
          '<div class="history-meta"><span class="badge ' + gradeClass + '" style="margin-right:6px;font-weight:800;padding:2px 8px;border-radius:6px;font-size:11px;">' + grade + '</span> 📅 ' + date + ' • ✅ ' + r.correct_count + '/' + (r.total_count || 55) + '</div>' +
          '</div>' +
          '<div class="history-score"><div class="history-score-val" style="color:var(--primary);font-weight:800;">' + score + '</div><div class="history-score-sub">ball</div></div>' +
          '</div>';
      } else {
        html += '<div class="history-card animate-in" style="animation-delay:' + (i * 0.05) + 's;cursor:pointer" onclick="showResultModal(window._myResults[' + i + '])">' +
          '<div class="history-info" style="padding-left:12px">' +
          '<div class="history-title">' + escHtml(r.test_title || r.title || 'Test') + '</div>' +
          '<div class="history-meta"><span class="badge" style="margin-right:6px;font-weight:800;padding:2px 8px;border-radius:6px;font-size:11px;background:rgba(245,158,11,0.15);color:#F59E0B;">⏳ Test davom etmoqda</span> 📅 ' + date + '</div>' +
          '</div>' +
          '<div class="history-score"><div class="history-score-val" style="color:#F59E0B;font-weight:800;font-size:13px;">Kutilmoqda</div><div class="history-score-sub">natija</div></div>' +
          '</div>';
      }
    });
  }
  tab.innerHTML = html;
}

// ── PROFILE TAB ─────────────────────────────────
function renderProfileTab() {
  var tab = document.getElementById('tab-profile');
  var u = state.userInfo;
  var tgU = state.tgUser;
  var fullname = (u && u.fullname) || ((tgU && ((tgU.first_name || '') + ' ' + (tgU.last_name || '')).trim())) || 'Foydalanuvchi';
  var phone = (u && u.phone) || '\u2014';
  var username = (tgU && tgU.username) ? '@' + tgU.username : '\u2014';
  var tgId = (tgU && tgU.id) || 0;
  var testsCount = (u && u.tests_count) || 0;
  var avgScore = (u && u.avg_score) ? Math.round(u.avg_score) : 0;
  var maxScore = (u && u.max_score) || 0;
  var status = computeStatus(testsCount, avgScore);
  var avatarLetter = fullname.charAt(0).toUpperCase();

  var st = (u && u.status) || 'pending';
  var statusBadgeHtml = '';
  var heroBadgeHtml = '';
  if (st === 'approved') {
    statusBadgeHtml = '<div class="stat-status-badge status-approved"><span class="status-dot approved"></span> Faol</div>';
    heroBadgeHtml = '<span class="profile-status-badge status-approved" style="background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.35)"><span class="status-dot approved"></span> Tasdiqlangan (Faol)</span>';
  } else if (st === 'pending') {
    statusBadgeHtml = '<div class="stat-status-badge status-pending"><span class="status-dot pending"></span> Kutilmoqda</div>';
    heroBadgeHtml = '<span class="profile-status-badge status-pending" style="background:rgba(245,158,11,0.15);color:#f59e0b;border:1px solid rgba(245,158,11,0.35)"><span class="status-dot pending"></span> Tasdiqlanmagan (Kutilmoqda)</span>';
  } else {
    statusBadgeHtml = '<div class="stat-status-badge status-rejected"><span class="status-dot rejected"></span> Rad etilgan</div>';
    heroBadgeHtml = '<span class="profile-status-badge status-rejected" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.35)"><span class="status-dot rejected"></span> Cheklangan</span>';
  }

  tab.innerHTML =
    '<div class="profile-hero animate-in">' +
    '<div class="profile-avatar">' + avatarLetter + '</div>' +
    '<div class="profile-name">' + escHtml(fullname) + '</div>' +
    '<div class="profile-phone">' + escHtml(phone) + '</div>' +
    heroBadgeHtml +
    '</div>' +
    '<div class="stats-grid animate-in">' +
    '<div class="stat-card"><div class="stat-value">' + testsCount + '</div><div class="stat-label">' + t('stat_tests') + '</div></div>' +
    '<div class="stat-card"><div class="stat-value">' + avgScore + '</div><div class="stat-label">' + t('stat_avg') + '</div></div>' +
    '<div class="stat-card"><div class="stat-value">' + maxScore + '</div><div class="stat-label">' + t('stat_max') + '</div></div>' +
    '<div class="stat-card" style="display:flex;flex-direction:column;justify-content:center;align-items:center;">' + statusBadgeHtml + '<div class="stat-label">' + t('stat_status') + '</div></div>' +
    '</div>' +
    '<div class="card animate-in">' +
    '<div class="info-row"><div class="info-icon">\uD83D\uDC64</div><div><div class="info-label">' + t('info_name') + '</div><div class="info-value">' + escHtml(fullname) + '</div></div></div>' +
    '<div class="info-row"><div class="info-icon">\uD83D\uDCF1</div><div><div class="info-label">' + t('info_phone') + '</div><div class="info-value">' + escHtml(phone) + '</div></div></div>' +
    '<div class="info-row"><div class="info-icon">\uD83D\uDD17</div><div><div class="info-label">' + t('info_tg') + '</div><div class="info-value">' + escHtml(username) + '</div></div></div>' +
    '<div class="info-row"><div class="info-icon">\uD83C\uDD94</div><div><div class="info-label">' + t('info_id') + '</div><div class="info-value">' + tgId + '</div></div></div>' +
    '</div>' +
    '<button class="admin-action-btn animate-in" onclick="openOnboardingModal()" style="margin-top:12px;background:linear-gradient(135deg,rgba(59,130,246,0.12),rgba(99,102,241,0.12));border:1px solid rgba(59,130,246,0.25);">' +
    '<div class="btn-icon" style="background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff">📖</div>' +
    '<div><span style="font-weight:700;color:var(--text);display:block">Bot qanday ishlaydi?</span><span style="font-size:11px;color:var(--text-muted)">Yangi o\'quvchilar uchun to\'liq qo\'llanma</span></div>' +
    '<span class="btn-arrow" style="color:#3b82f6">›</span>' +
    '</button>';
}

// ── ADMIN TAB ───────────────────────────────────
var ADMIN_QUICK_TEMPLATES = {
  '30m': "⏳ Diqqat! Test boshlanishiga 30 daqiqa qoldi! Internet aloqangizni tekshirib, qoralama qog'ozlarni tayyorlab oling.",
  '10m': "⚠️ Test boshlanishiga 10 daqiqa qoldi! Mini ilovaga kirib, tayyor bo'lib turing.",
  'started': "🚀 Test boshlandi! Barchaga omad tilaymiz. Belgilangan vaqt ichida javoblarni topshirishni unutmang.",
  '15m': "⏰ Diqqat, test yakunlanishiga 15 daqiqa qoldi! Qolgan javoblarni tekshirib, topshirishga shoshiling.",
  'ended': "🛑 Test yakunlandi! Javoblarni qabul qilish to'xtatildi. Ishtirok etgan barcha o'quvchilarga minnatdorchilik bildiramiz. Tez orada to'liq tahlil va rasmiy natijalar e'lon qilinadi."
};

function getActiveOrPlannedTestCode() {
  var tests = window.availableActiveTests || [];
  var active = tests.find(function(t) { return t.is_active; });
  if (active && active.test_code) return String(active.test_code).trim();
  if (tests.length > 0 && tests[0].test_code) return String(tests[0].test_code).trim();
  return '';
}

function applyQuickTemplate(type) {
  var textarea = document.getElementById('admin-broadcast-text');
  if (!textarea) return;

  var text = ADMIN_QUICK_TEMPLATES[type] || '';
  if (type === 'started' || type === 'ended') {
    var code = getActiveOrPlannedTestCode();
    var codeDisplay = code ? (code.startsWith('#') ? code : ('#' + code)) : '#TEST_KODI';
    text = text + "\n\n📌 Test kodi: " + codeDisplay;
  }

  textarea.value = text;
  updateBroadcastCharCount();

  textarea.focus();
  try {
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  } catch (e) {}

  try {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  } catch (e) {}

  var btn = document.getElementById('tmpl-btn-' + type);
  if (btn) {
    btn.classList.add('tmpl-active');
    setTimeout(function() { btn.classList.remove('tmpl-active'); }, 300);
  }
}

function updateBroadcastCharCount() {
  var textarea = document.getElementById('admin-broadcast-text');
  var countEl = document.getElementById('broadcast-char-count');
  if (!textarea) return;
  window._cachedBroadcastText = textarea.value || '';
  if (countEl) {
    var len = (textarea.value || '').length;
    countEl.textContent = len + ' belgi';
  }
}

function clearBroadcastText() {
  var textarea = document.getElementById('admin-broadcast-text');
  if (textarea) {
    textarea.value = '';
    window._cachedBroadcastText = '';
    updateBroadcastCharCount();
    textarea.focus();
  }
}

async function sendAdminBroadcast() {
  var textarea = document.getElementById('admin-broadcast-text');
  if (!textarea) return;
  var msg = (textarea.value || '').trim();
  if (!msg) {
    alert("Iltimos, avval xabar matnini kiriting yoki yuqoridagi tayyor shablonlardan birini tanlang!");
    textarea.focus();
    return;
  }

  var usersCount = (window.currentAdminUsers || []).filter(function(u) { return (u.status || '').toLowerCase() === 'approved'; }).length;
  var countPrompt = usersCount ? usersCount + " nafar faol" : "barcha";

  if (!confirm("📢 Ushbu xabarni " + countPrompt + " o'quvchilarga yuborishni tasdiqlaysizmi?\n\n\"" + (msg.length > 80 ? msg.substring(0, 80) + '...' : msg) + "\"")) {
    return;
  }

  var btn = document.getElementById('btn-send-broadcast');
  var originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Xabar yuborilmoqda...</span>';
  }

  var urlParams = new URLSearchParams(window.location.search);
  var adminId = (state.tgUser && state.tgUser.id) || parseInt(urlParams.get('tg_id')) || 0;

  try {
    var res = await fetch('/api/app/broadcast', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        admin_id: adminId,
        message: msg,
        init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || ''
      })
    });
    var data = await res.json();
    if (data.success) {
      alert("✅ Xabar muvaffaqiyatli tarqatildi!\n\n📨 Yetkazildi: " + (data.sent || 0) + " ta o'quvchiga" + (data.fail ? "\n⚠️ Yetkazilmadi: " + data.fail + " ta" : ""));
      textarea.value = '';
      window._cachedBroadcastText = '';
      updateBroadcastCharCount();
    } else {
      alert("⚠️ Xatolik yuz berdi: " + (data.message || "Xabar yuborib bo'lmadi"));
    }
  } catch (e) {
    console.error("Broadcast error:", e);
    alert("⚠️ Server bilan bog'lanishda xatolik yuz berdi: " + e.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

function switchAdminSubtab(subtab) {
  if (state.adminSubtab === subtab) return;

  var currentText = document.getElementById('admin-broadcast-text');
  if (currentText) {
    window._cachedBroadcastText = currentText.value;
  }

  state.adminSubtab = subtab;

  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    } catch(e) {}
  }

  renderAdminTab();

  if (subtab === 'users') {
    if (window.currentAdminUsers) {
      renderUsersSection(window.currentAdminUsers, window.currentAdminStats);
    } else {
      loadAllUsers();
    }
  } else if (subtab === 'broadcast') {
    var ta = document.getElementById('admin-broadcast-text');
    if (ta && window._cachedBroadcastText) {
      ta.value = window._cachedBroadcastText;
      updateBroadcastCharCount();
    }
  }
}

function renderAdminTab() {
  var tab = document.getElementById('tab-admin');
  if (!tab) return;
  var currentSubtab = state.adminSubtab || 'users';
  var usersCount = window.currentAdminUsers ? window.currentAdminUsers.length : 0;

  var usersIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  var broadcastIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';

  var html =
    '<div class="admin-header-card animate-in">' +
      '<div class="admin-header-icon">⚙️</div>' +
      '<div>' +
        '<div style="font-size:16px;font-weight:800;color:var(--text)">' + t('admin_panel') + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-top:2px">Foydalanuvchilar va tizim boshqaruvi</div>' +
      '</div>' +
    '</div>' +

    // ── ADMIN SUBTABS SWITCHER (Bo'limlarga ajratish) ──
    '<div class="admin-subtabs animate-in" style="margin-top:12px;margin-bottom:14px;">' +
      '<button type="button" class="admin-subtab ' + (currentSubtab === 'users' ? 'active' : '') + '" onclick="switchAdminSubtab(\'users\')">' +
        '<span class="admin-subtab-icon">' + usersIcon + '</span>' +
        '<span class="admin-subtab-text">Foydalanuvchilar</span>' +
        '<span class="admin-subtab-badge" id="admin-subtab-users-count">' + usersCount + '</span>' +
      '</button>' +
      '<button type="button" class="admin-subtab ' + (currentSubtab === 'broadcast' ? 'active' : '') + '" onclick="switchAdminSubtab(\'broadcast\')">' +
        '<span class="admin-subtab-icon">' + broadcastIcon + '</span>' +
        '<span class="admin-subtab-text">Xabar yuborish</span>' +
        '<span class="admin-subtab-badge">⚡️</span>' +
      '</button>' +
    '</div>';

  if (currentSubtab === 'users') {
    html +=
      // Statistika konteyneri (JS to'ldiradi)
      '<div id="admin-stats-container" class="animate-in"></div>' +

      // Foydalanuvchilar kartasi
      '<div class="card animate-in" style="margin-top:0">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
          '<div style="font-size:13.5px;font-weight:800;color:var(--text)">👥 Foydalanuvchilar ro\'yxati</div>' +
          '<div id="admin-users-badge-count" style="font-size:11.5px;font-weight:700;color:var(--text-muted)">0 ta</div>' +
        '</div>' +

        // Qidiruv paneli
        '<div class="admin-search-box">' +
          '<span class="admin-search-icon">🔍</span>' +
          '<input type="text" id="admin-user-search-input" class="admin-search-input" placeholder="Ism, telefon yoki Telegram ID..." oninput="handleAdminUserSearch(this.value)">' +
        '</div>' +

        // Filtr tugmalari
        '<div class="admin-filter-tabs">' +
          '<button class="admin-filter-btn active" id="btn-flt-all" onclick="setAdminUserFilter(\'all\')">Barchasi</button>' +
          '<button class="admin-filter-btn" id="btn-flt-approved" onclick="setAdminUserFilter(\'approved\')">✅ Faol</button>' +
          '<button class="admin-filter-btn" id="btn-flt-pending" onclick="setAdminUserFilter(\'pending\')">⏳ Kutilmoqda</button>' +
          '<button class="admin-filter-btn" id="btn-flt-blocked" onclick="setAdminUserFilter(\'blocked\')">⛔️ Bloklangan</button>' +
        '</div>' +

        // Ro'yxat
        '<div id="users-list">' +
          '<div class="skeleton skeleton-card" style="height:50px"></div>' +
          '<div class="skeleton skeleton-card" style="height:50px;margin-top:8px"></div>' +
        '</div>' +
      '</div>' +

      // Barchani cheklash tugmasi
      '<button class="admin-btn-restrict-all animate-in" style="margin-top:14px;" onclick="restrictAllUsersFromApp()">' +
        '🔒 Barcha o\'quvchilarni cheklash (qayta so\'rov)' +
      '</button>';
  } else {
    // 📢 O'quvchilarga xabar yuborish (Tezkor shablonlar + Textarea)
    html +=
      '<div class="admin-broadcast-card animate-in">' +
        '<div class="admin-broadcast-header">' +
          '<div class="admin-broadcast-title-wrap">' +
            '<div class="admin-broadcast-icon-box">📢</div>' +
            '<div>' +
              '<div class="admin-broadcast-title">O\'quvchilarga xabar yuborish</div>' +
              '<div class="admin-broadcast-subtitle">Barcha faol o\'quvchilarga tezkor xabarnoma tarqatish</div>' +
            '</div>' +
          '</div>' +
          '<span class="admin-broadcast-badge">⚡️ Tezkor</span>' +
        '</div>' +

        // Tezkor tayyor shablonlar
        '<div class="quick-templates-section">' +
          '<div class="quick-templates-label"><span>⚡️</span> Tezkor tayyor shablonlar:</div>' +
          '<div class="quick-templates-grid">' +
            '<button type="button" class="quick-tmpl-btn" id="tmpl-btn-30m" onclick="applyQuickTemplate(\'30m\')">' +
              '<span class="tmpl-icon">⏳</span>' +
              '<span class="tmpl-text">30 daqiqa qoldi</span>' +
            '</button>' +
            '<button type="button" class="quick-tmpl-btn" id="tmpl-btn-10m" onclick="applyQuickTemplate(\'10m\')">' +
              '<span class="tmpl-icon">⚠️</span>' +
              '<span class="tmpl-text">10 daqiqa qoldi</span>' +
            '</button>' +
            '<button type="button" class="quick-tmpl-btn" id="tmpl-btn-started" onclick="applyQuickTemplate(\'started\')">' +
              '<span class="tmpl-icon">🚀</span>' +
              '<span class="tmpl-text">Test boshlandi</span>' +
            '</button>' +
            '<button type="button" class="quick-tmpl-btn" id="tmpl-btn-15m" onclick="applyQuickTemplate(\'15m\')">' +
              '<span class="tmpl-icon">⏰</span>' +
              '<span class="tmpl-text">15 daqiqa qoldi</span>' +
            '</button>' +
            '<button type="button" class="quick-tmpl-btn" id="tmpl-btn-ended" onclick="applyQuickTemplate(\'ended\')">' +
              '<span class="tmpl-icon">🛑</span>' +
              '<span class="tmpl-text">Test yakunlandi</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // Xabar matni maydoni (textarea)
        '<div class="broadcast-textarea-wrap">' +
          '<textarea id="admin-broadcast-text" class="admin-broadcast-textarea" rows="4" placeholder="Xabar matnini kiriting yoki yuqoridagi tayyor shablonlardan birini bosing..." oninput="updateBroadcastCharCount()">' + escHtml(window._cachedBroadcastText || '') + '</textarea>' +
          '<div class="broadcast-meta-row">' +
            '<span id="broadcast-char-count" class="broadcast-char-count">' + (window._cachedBroadcastText ? window._cachedBroadcastText.length : 0) + ' belgi</span>' +
            '<button type="button" class="btn-clear-broadcast" onclick="clearBroadcastText()">✕ Tozalash</button>' +
          '</div>' +
        '</div>' +

        // Yuborish tugmasi
        '<button type="button" class="btn-send-broadcast" id="btn-send-broadcast" onclick="sendAdminBroadcast()">' +
          '<span>🚀 Barcha o\'quvchilarga yuborish</span>' +
        '</button>' +
      '</div>';
  }

  tab.innerHTML = html;
}

function handleAdminUserSearch(query) {
  window.adminSearchQuery = (query || '').trim().toLowerCase();
  renderFilteredAdminUsers();
}

function setAdminUserFilter(filter) {
  window.adminCurrentFilter = filter;
  ['all', 'approved', 'pending', 'blocked'].forEach(function(f) {
    var btn = document.getElementById('btn-flt-' + f);
    if (btn) btn.classList.toggle('active', f === filter);
  });
  renderFilteredAdminUsers();
}

function renderUsersSection(users, stats) {
  window.currentAdminUsers = users || [];
  window.currentAdminStats = stats || null;
  window.adminCurrentFilter = window.adminCurrentFilter || 'all';
  window.adminSearchQuery = window.adminSearchQuery || '';

  // Admin subtabdagi foydalanuvchilar soni
  var subtabBadge = document.getElementById('admin-subtab-users-count');
  if (subtabBadge) {
    subtabBadge.textContent = window.currentAdminUsers.length;
  }

  // 1. Statistikani yangilash
  var statsContainer = document.getElementById('admin-stats-container');
  if (statsContainer && stats) {
    statsContainer.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px">' +
        '<div class="stat-card" style="padding:8px 4px;text-align:center"><div class="stat-value" style="font-size:16px;font-weight:800">' + (stats.total||0) + '</div><div class="stat-label" style="font-size:10px">Jami</div></div>' +
        '<div class="stat-card" style="padding:8px 4px;text-align:center"><div class="stat-value" style="font-size:16px;font-weight:800;color:#10b981">' + (stats.approved||0) + '</div><div class="stat-label" style="font-size:10px">Faol</div></div>' +
        '<div class="stat-card" style="padding:8px 4px;text-align:center"><div class="stat-value" style="font-size:16px;font-weight:800;color:#f59e0b">' + (stats.pending||0) + '</div><div class="stat-label" style="font-size:10px">Kutilmoqda</div></div>' +
        '<div class="stat-card" style="padding:8px 4px;text-align:center"><div class="stat-value" style="font-size:16px;font-weight:800;color:#ef4444">' + (stats.blocked||0) + '</div><div class="stat-label" style="font-size:10px">Bloklangan</div></div>' +
      '</div>';
  }

  // 2. Foydalanuvchilar ro'yxatini render qilish
  renderFilteredAdminUsers();
}

function renderFilteredAdminUsers() {
  var listEl = document.getElementById('users-list');
  if (!listEl) return;

  var users = window.currentAdminUsers || [];
  var filter = window.adminCurrentFilter || 'all';
  var q = window.adminSearchQuery || '';

  var filtered = users.filter(function(u) {
    // Holat bo'yicha filter
    var st = (u.status || 'pending').toLowerCase();
    if (filter === 'approved' && st !== 'approved') return false;
    if (filter === 'pending' && st !== 'pending') return false;
    if (filter === 'blocked' && st !== 'blocked') return false;

    // Qidiruv bo'yicha filter
    if (q) {
      var nameMatch = (u.fullname || '').toLowerCase().indexOf(q) !== -1;
      var phoneMatch = (u.phone || '').toLowerCase().indexOf(q) !== -1;
      var idMatch = String(u.tg_id || '').indexOf(q) !== -1;
      var userMatch = (u.username || '').toLowerCase().indexOf(q) !== -1;
      if (!nameMatch && !phoneMatch && !idMatch && !userMatch) return false;
    }
    return true;
  });

  var countBadge = document.getElementById('admin-users-badge-count');
  if (countBadge) {
    countBadge.textContent = filtered.length + ' ta' + (filtered.length !== users.length ? ' (saralangan)' : '');
  }

  if (filtered.length === 0) {
    listEl.innerHTML =
      '<div class="empty-state" style="padding:24px 10px;">' +
        '<div class="empty-icon" style="font-size:36px;">🔍</div>' +
        '<p style="font-size:13px;color:var(--text-muted);">' + (q ? 'Mos keluvchi foydalanuvchi topilmadi' : 'Foydalanuvchilar mavjud emas') + '</p>' +
      '</div>';
    return;
  }

  var usersHtml = filtered.map(function(u) {
    var letter = (u.fullname || 'F').charAt(0).toUpperCase();
    var tc = u.tests_count || 0;
    var st = (u.status || 'pending').toLowerCase();
    var sb = '';
    if (st === 'approved') {
      sb = '<span class="badge" style="padding:3px 8px;font-size:10.5px;display:inline-flex;align-items:center;gap:4px;background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.3);border-radius:12px;"><span class="status-dot approved" style="width:6px;height:6px"></span> Faol</span>';
    } else if (st === 'pending') {
      sb = '<span class="badge" style="padding:3px 8px;font-size:10.5px;display:inline-flex;align-items:center;gap:4px;background:rgba(245,158,11,0.15);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);border-radius:12px;"><span class="status-dot pending" style="width:6px;height:6px"></span> Kutilmoqda</span>';
    } else if (st === 'blocked') {
      sb = '<span class="badge" style="padding:3px 8px;font-size:10.5px;display:inline-flex;align-items:center;gap:4px;background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:12px;"><span class="status-dot rejected" style="width:6px;height:6px"></span> Bloklangan</span>';
    } else {
      sb = '<span class="badge" style="padding:3px 8px;font-size:10.5px;display:inline-flex;align-items:center;gap:4px;background:rgba(100,116,139,0.15);color:#94a3b8;border:1px solid rgba(100,116,139,0.3);border-radius:12px;">' + st + '</span>';
    }

    return '<div class="user-row clickable" onclick="openAdminUserModal(' + u.tg_id + ')">' +
      '<div class="user-row-avatar">' + letter + '</div>' +
      '<div class="user-row-info">' +
        '<div class="user-row-name">' + escHtml(u.fullname || 'Nomaʼlum') + '</div>' +
        '<div class="user-row-meta">' + escHtml(u.phone || '—') + ' • ID: <code>' + u.tg_id + '</code> • ' + tc + ' test</div>' +
      '</div>' +
      sb +
      '<span style="color:var(--text-muted);font-size:16px;margin-left:4px">›</span>' +
    '</div>';
  }).join('');

  listEl.innerHTML = usersHtml;
}

function openAdminUserModal(targetUid) {
  var users = window.currentAdminUsers || [];
  var u = users.find(function(item) { return item.tg_id === Number(targetUid); });
  if (!u && typeof targetUid === 'object') u = targetUid;

  if (!u) {
    alert('Foydalanuvchi ma\'lumotlari topilmadi');
    return;
  }

  var modal = document.getElementById('admin-user-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-user-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.7);align-items:center;justify-content:center;backdrop-filter:blur(6px);padding:16px;';
    modal.onclick = function(e) { closeAdminUserModal(e); };
    modal.innerHTML =
      '<div class="modal-box" id="admin-user-modal-box" style="max-width:400px;width:100%;max-height:92vh;overflow-y:auto;padding:22px 18px;border-radius:24px;background:var(--bg-card,#1e293b);border:1px solid var(--border,rgba(255,255,255,0.12));box-shadow:0 24px 60px rgba(0,0,0,0.5);position:relative;">' +
        '<div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
          '<div class="modal-title" style="font-size:16px;font-weight:800;color:var(--text,#fff);">👤 Foydalanuvchi boshqaruvi</div>' +
          '<button class="modal-close" onclick="closeAdminUserModal()" style="background:none;border:none;font-size:22px;color:var(--text-muted,#94a3b8);cursor:pointer;padding:4px 8px;line-height:1;">✕</button>' +
        '</div>' +
        '<div class="modal-body" id="admin-user-modal-body"></div>' +
      '</div>';
    document.body.appendChild(modal);
  }

  var body = document.getElementById('admin-user-modal-body');
  if (!body) return;

  var letter = (u.fullname || 'F').charAt(0).toUpperCase();
  var st = (u.status || 'pending').toLowerCase();

  var statusBadge = '';
  if (st === 'approved') {
    statusBadge = '<span class="stat-status-badge status-approved" style="font-size:12px;padding:4px 12px;"><span class="status-dot approved"></span> Faol (Ruxsat berilgan)</span>';
  } else if (st === 'pending') {
    statusBadge = '<span class="stat-status-badge status-pending" style="font-size:12px;padding:4px 12px;"><span class="status-dot pending"></span> Kutilmoqda (Cheklangan)</span>';
  } else if (st === 'blocked') {
    statusBadge = '<span class="stat-status-badge status-rejected" style="font-size:12px;padding:4px 12px;"><span class="status-dot rejected"></span> Bloklangan (Chiqarilgan)</span>';
  } else {
    statusBadge = '<span class="stat-status-badge" style="font-size:12px;padding:4px 12px;">' + st + '</span>';
  }

  var regDateStr = u.registered_at ? formatDate(u.registered_at) : 'Nomaʼlum';
  var lastTestStr = u.last_test_at ? formatDate(u.last_test_at) : 'Hali test topshirmagan';
  var usernameStr = u.username ? ('@' + u.username) : 'Mavjud emas';

  // Harakat tugmalari (Action buttons) - Birinchi o'rinda ko'rinadi
  var actionButtonsHtml = '<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">';

  if (st !== 'approved') {
    actionButtonsHtml += '<button class="admin-btn-action admin-btn-approve" onclick="updateUserStatusFromModal(' + u.tg_id + ', \'approved\')">✅ Ruxsat berish (Faollashtirish)</button>';
  } else {
    actionButtonsHtml += '<button class="admin-btn-action admin-btn-pending" onclick="updateUserStatusFromModal(' + u.tg_id + ', \'pending\')">⏳ Huquqini to\'xtatish (Kutilmoqda)</button>';
  }

  if (st !== 'blocked') {
    actionButtonsHtml += '<button class="admin-btn-action admin-btn-block" onclick="updateUserStatusFromModal(' + u.tg_id + ', \'blocked\')">⛔️ Bloklash (Botdan chiqarish)</button>';
  } else {
    actionButtonsHtml += '<button class="admin-btn-action admin-btn-approve" onclick="updateUserStatusFromModal(' + u.tg_id + ', \'approved\')">🔓 Blokdan chiqarish va Ruxsat berish</button>';
  }

  actionButtonsHtml += '<button class="admin-btn-action admin-btn-delete" onclick="updateUserStatusFromModal(' + u.tg_id + ', \'delete\')">🗑 Bazadan butunlay o\'chirish</button>';
  actionButtonsHtml += '</div>';

  // Foydalanuvchi ma'lumotlari (Akkordeon / Ko'rsatish-Yashirish)
  var infoToggleHtml =
    '<button type="button" class="admin-user-info-toggle-btn" id="btn-toggle-user-info" onclick="toggleAdminUserInfo()">' +
      '<span class="info-toggle-left">' +
        '<span style="font-size:15px;">📋</span>' +
        '<span>Foydalanuvchi ma\'lumotlari</span>' +
      '</span>' +
      '<span class="info-toggle-arrow" id="info-toggle-arrow">Ko\'rsatish ▼</span>' +
    '</button>' +
    '<div id="admin-user-info-content" class="admin-user-info-content" style="display:none;">' +
      '<div class="card" style="margin:0;padding:10px 14px;border-radius:14px;background:var(--bg-glass-2);border:1px solid var(--border);">' +
        '<div class="info-row" style="padding:9px 0;"><div class="info-icon" style="width:32px;height:32px;font-size:16px;">📱</div><div><div class="info-label" style="font-size:11px;">Telefon raqami</div><div class="info-value" style="font-size:14px;font-weight:700;"><a href="tel:' + escHtml(u.phone || '') + '" style="color:var(--primary);text-decoration:none;">' + escHtml(u.phone || '—') + '</a></div></div></div>' +
        '<div class="info-row" style="padding:9px 0;"><div class="info-icon" style="width:32px;height:32px;font-size:16px;">🆔</div><div><div class="info-label" style="font-size:11px;">Telegram ID</div><div class="info-value" style="font-size:14px;font-weight:700;"><code>' + u.tg_id + '</code></div></div></div>' +
        '<div class="info-row" style="padding:9px 0;"><div class="info-icon" style="width:32px;height:32px;font-size:16px;">🔗</div><div><div class="info-label" style="font-size:11px;">Username</div><div class="info-value" style="font-size:14px;font-weight:700;">' + escHtml(usernameStr) + '</div></div></div>' +
        '<div class="info-row" style="padding:9px 0;"><div class="info-icon" style="width:32px;height:32px;font-size:16px;">🕒</div><div><div class="info-label" style="font-size:11px;">Roʻyxatdan oʻtgan vaqti</div><div class="info-value" style="font-size:13.5px;font-weight:700;color:var(--primary);">' + regDateStr + '</div></div></div>' +
        '<div class="info-row" style="padding:9px 0;"><div class="info-icon" style="width:32px;height:32px;font-size:16px;">📝</div><div><div class="info-label" style="font-size:11px;">Topshirgan testlari soni</div><div class="info-value" style="font-size:14px;font-weight:700;">' + (u.tests_count || 0) + ' ta</div></div></div>' +
        '<div class="info-row" style="padding:9px 0;border-bottom:none;"><div class="info-icon" style="width:32px;height:32px;font-size:16px;">⏱</div><div><div class="info-label" style="font-size:11px;">Oxirgi test topshirgan vaqti</div><div class="info-value" style="font-size:13px;font-weight:600;">' + lastTestStr + '</div></div></div>' +
      '</div>' +
    '</div>';

  body.innerHTML =
    '<div style="text-align:center;padding:2px 0 10px;">' +
      '<div class="profile-avatar" style="margin:0 auto 8px;width:52px;height:52px;font-size:22px;display:flex;align-items:center;justify-content:center;">' + letter + '</div>' +
      '<div style="font-size:16.5px;font-weight:800;color:var(--text);">' + escHtml(u.fullname || 'Foydalanuvchi') + '</div>' +
      '<div style="margin-top:6px;">' + statusBadge + '</div>' +
    '</div>' +
    actionButtonsHtml +
    infoToggleHtml;

  modal.style.display = 'flex';
}

function toggleAdminUserInfo() {
  var content = document.getElementById('admin-user-info-content');
  var arrow = document.getElementById('info-toggle-arrow');
  if (!content) return;
  var isHidden = content.style.display === 'none' || content.style.display === '';
  if (isHidden) {
    content.style.display = 'block';
    if (arrow) arrow.innerHTML = 'Yashirish ▲';
  } else {
    content.style.display = 'none';
    if (arrow) arrow.innerHTML = 'Ko\'rsatish ▼';
  }
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    } catch(e) {}
  }
}

function closeAdminUserModal(e) {
  if (e && e.target && e.target !== e.currentTarget && !e.target.classList.contains('modal-close')) return;
  var modal = document.getElementById('admin-user-modal');
  if (modal) modal.style.display = 'none';
}

async function updateUserStatusFromModal(targetUid, newStatus) {
  if (newStatus === 'delete') {
    if (!confirm('⚠️ DIQQAT! Haqiqatan ham ushbu foydalanuvchini va uning barcha test natijalarini butunlay o\'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo\'lmaydi!')) {
      return;
    }
  } else if (newStatus === 'blocked') {
    if (!confirm('Ushbu foydalanuvchini bloklamoqchimisiz? U botdan va test tizimidan chiqarib yuboriladi.')) {
      return;
    }
  } else if (newStatus === 'pending') {
    if (!confirm('Ushbu foydalanuvchining huquqini to\'xtatib, kutilmoqda holatiga o\'tkazmoqchimisiz?')) {
      return;
    }
  }

  var adminId = (state.tgUser && state.tgUser.id) || 0;
  var btn = (typeof event !== 'undefined' && event && event.target) ? event.target : null;
  var originalText = btn ? btn.textContent : '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Bajarilmoqda...';
  }

  try {
    var res = await fetch('/api/app/update-user-status', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        admin_id: adminId,
        target_uid: targetUid,
        status: newStatus,
        init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || ''
      })
    });
    var data = await res.json();
    if (data.success) {
      closeAdminUserModal();
      if (newStatus === 'delete') {
        alert('🗑 Foydalanuvchi muvaffaqiyatli o\'chirildi!');
      } else if (newStatus === 'approved') {
        alert('✅ Foydalanuvchiga ruxsat berildi!');
      } else if (newStatus === 'blocked') {
        alert('⛔️ Foydalanuvchi bloklandi!');
      } else if (newStatus === 'pending') {
        alert('⏳ Foydalanuvchi kutilmoqda holatiga o\'tkazildi!');
      }
      loadAllUsers();
    } else {
      alert(data.message || 'Xatolik yuz berdi');
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
  } catch (err) {
    alert('Server bilan bogʻlanishda xatolik: ' + err.message);
    if (btn) { btn.disabled = false; btn.textContent = originalText; }
  }
}

async function restrictAllUsersFromApp() {
  if (!confirm('⚠️ DIQQAT! Barcha oddiy foydalanuvchilarning ruxsatini bekor qilib, ularni «kutilmoqda» (pending) holatiga o\'tkazmoqchimisiz?\n\nAdminlar daxlsiz qoladi.')) {
    return;
  }

  var adminId = (state.tgUser && state.tgUser.id) || 0;
  try {
    var res = await fetch('/api/app/restrict-all-users', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        admin_id: adminId,
        init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || ''
      })
    });
    var data = await res.json();
    if (data.success) {
      alert('🔒 Jami ' + (data.count || 0) + ' ta foydalanuvchi muvaffaqiyatli cheklandi!');
      loadAllUsers();
    } else {
      alert(data.message || 'Xatolik yuz berdi');
    }
  } catch (err) {
    alert('Server bilan bogʻlanishda xatolik: ' + err.message);
  }
}

// Webapp redirection functions removed (users will use bot inline buttons directly)

// ── PIN CHANGE ───────────────────────────────────
function changePinPrompt() {
  localStorage.removeItem(LS_PIN);
  state.pinBuffer = '';
  state.pinFirst = '';
  state.pinMode = 'setup';
  var pinScreen = document.getElementById('pin-screen');
  var app = document.getElementById('app');
  document.getElementById('pin-title').textContent = t('pin_create');
  document.getElementById('pin-subtitle').textContent = t('pin_create_sub');
  renderPinDots(0);
  showPinError('');
  app.style.display = 'none';
  app.classList.remove('visible');
  pinScreen.style.transition = '';
  pinScreen.style.opacity = '1';
  pinScreen.style.transform = 'scale(1)';
  pinScreen.style.display = 'flex';
}

// ── THEME ────────────────────────────────────────
function toggleTheme() {
  var cur = document.documentElement.getAttribute('data-theme') || 'dark';
  var next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(LS_THEME, next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  var el = document.getElementById('theme-icon');
  if (el) el.innerHTML = theme === 'dark' ? '&#9790;' : '&#9728;';
}

// ── LANGUAGE ─────────────────────────────────────
var LANGS = ['uz', 'ru', 'en'];
var LANG_LABELS = { uz: 'UZ', ru: 'RU', en: 'EN' };

function cycleLang() {
  var cur = localStorage.getItem(LS_LANG) || 'uz';
  var idx = LANGS.indexOf(cur);
  var next = LANGS[(idx + 1) % LANGS.length];
  localStorage.setItem(LS_LANG, next);
  updateLangLabel();
  applyI18n();
  // Aktiv tabni qayta render qilish
  if (state.activeTab) switchTab(state.activeTab);
}

function updateLangLabel() {
  var cur = localStorage.getItem(LS_LANG) || 'uz';
  var el = document.getElementById('lang-label');
  if (el) el.textContent = LANG_LABELS[cur] || 'UZ';
}

function applyI18n() {
  // data-i18n atributli barcha elementlar
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  // PIN ekrani matnlari
  var pinTitle = document.getElementById('pin-title');
  var pinSub = document.getElementById('pin-subtitle');
  if (pinTitle && pinSub) {
    var hasPin = !!localStorage.getItem(LS_PIN);
    if (!hasPin || state.pinMode === 'setup') {
      pinTitle.textContent = t('pin_create');
      pinSub.textContent = t('pin_create_sub');
    } else {
      pinSub.textContent = t('pin_enter_sub');
    }
  }
}

// ── RESULT MODAL ─────────────────────────────────
function showResultModal(result) {
  var modal = document.getElementById('result-modal');
  var title = document.getElementById('result-modal-title');
  var body = document.getElementById('result-modal-body');
  if (!modal || !body) return;

  var score = (result.score != null) ? result.score : 0;
  var maxScore = result.max_score || 100;
  var grade = result.grade || getGradeFromScore(score, maxScore);
  var gradeClass = gradeToClass(grade);
  var date = formatDate(result.submitted_at);
  var correct = result.correct_count || 0;
  var total = result.total_count || 45;
  var wrong = result.incorrect_count || (total - correct);
  var blank = result.unanswered_count || 0;

  var gradeBg = { 'grade-5':'rgba(16,185,129,0.15)', 'grade-4':'rgba(59,130,246,0.15)', 'grade-3':'rgba(245,158,11,0.15)', 'grade-2':'rgba(239,68,68,0.15)' };
  var gradeColor = { 'grade-5':'#10B981', 'grade-4':'#3B82F6', 'grade-3':'#F59E0B', 'grade-2':'#EF4444' };
  var gradeBorder = { 'grade-5':'#10B981', 'grade-4':'#3B82F6', 'grade-3':'#F59E0B', 'grade-2':'#EF4444' };

  var isPub = Boolean(result.results_published);
  title.textContent = (result.test_title || result.title || 'Test Natijasi');

  if (!isPub) {
    body.innerHTML = 
      '<div style="text-align:center;margin:16px 0 20px;">' +
        '<div style="width:70px;height:70px;border-radius:24px;background:rgba(245,158,11,0.15);color:#F59E0B;font-size:32px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">⏳</div>' +
        '<h3 style="font-size:18px;font-weight:900;color:var(--text);margin-bottom:6px;">⏳ Javoblaringiz tekshirilmoqda...</h3>' +
        '<p style="font-size:13.5px;color:var(--text-muted);line-height:1.5;max-width:300px;margin:0 auto 16px;">Test hozirda davom etmoqda. Admin testni to‘xtatib, Rasch tahlili asosida natijalarni e’lon qilgach, bu yerda to‘liq ball, to‘g‘ri javoblar va darajangiz ko‘rsatiladi.</p>' +
        '<div style="background:var(--bg-body);border:1px solid var(--border);border-radius:12px;padding:12px;font-size:13px;color:var(--text-muted);font-weight:600;">📅 Topshirilgan vaqt: ' + date + '</div>' +
      '</div>';
    modal.style.display = 'flex';
    return;
  }

  body.innerHTML =
    '<div style="text-align:center;margin:10px 0 16px;">' +
      '<div style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;padding:12px 28px;border-radius:18px;background:' + (gradeBg[gradeClass]||'rgba(99,102,241,0.15)') + ';border:2px solid ' + (gradeBorder[gradeClass]||'#6366F1') + ';min-width:140px;">' +
        '<span style="font-size:32px;font-weight:900;line-height:1.1;color:' + (gradeColor[gradeClass]||'#6366F1') + ';">' + grade + '</span>' +
        '<span style="font-size:14px;font-weight:800;color:var(--text-main);margin-top:4px;">' + score + ' ball</span>' +
      '</div>' +
    '</div>' +
    '<div id="compare-keys-section" style="text-align:center; margin: 12px 0;">' +
      '<button id="btn-compare-keys" onclick="promptCompareKeys(' + result.test_id + ')" style="background:linear-gradient(135deg, #3B82F6, #6366F1);color:white;border:none;padding:12px;border-radius:12px;font-weight:800;font-size:14.5px;cursor:pointer;width:100%;box-shadow:0 4px 14px rgba(59, 130, 246, 0.4);">🔑 To\'g\'ri javoblarni ko\'rish</button>' +
      '<div id="compare-keys-auth" style="display:none;margin-top:10px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:12px;">' +
        '<p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;font-weight:600;">Test kalitlarini ko\'rish uchun maxfiy parolni kiriting</p>' +
        '<input type="password" id="input-key-code" placeholder="Parol..." style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg-body);color:var(--text-main);font-size:14px;margin-bottom:8px;">' +
        '<button onclick="submitCompareKeys(' + result.test_id + ')" style="background:#10B981;color:white;border:none;padding:10px;border-radius:8px;font-weight:700;cursor:pointer;width:100%;">Tasdiqlash</button>' +
        '<div id="compare-keys-error" style="color:var(--error);font-size:12px;margin-top:6px;display:none;"></div>' +
      '</div>' +
    '</div>' +
    '<div id="compare-keys-result" style="display:none;margin-bottom:16px;max-height:250px;overflow-y:auto;border:1px solid var(--border);border-radius:12px;padding:8px;"></div>' +
    '<div class="result-row"><span class="result-row-label">To\'plangan ball</span><span class="result-row-val" style="color:var(--primary);font-weight:800;font-size:16px;">' + score + ' ball</span></div>' +
    '<div class="result-row"><span class="result-row-label">' + t('result_grade') + '</span><span class="result-row-val" style="color:' + (gradeColor[gradeClass]||'var(--accent)') + ';font-weight:800;">' + grade + '</span></div>' +
    '<div class="result-row"><span class="result-row-label">' + t('result_correct') + '</span><span class="result-row-val green">' + correct + ' / ' + total + ' ta</span></div>' +
    '<div class="result-row"><span class="result-row-label">' + t('result_wrong') + '</span><span class="result-row-val red">' + wrong + ' ta</span></div>' +
    '<div class="result-row"><span class="result-row-label">' + t('result_blank') + '</span><span class="result-row-val orange">' + blank + ' ta</span></div>' +
    '<div class="result-row"><span class="result-row-label">' + t('result_date') + '</span><span class="result-row-val">' + date + '</span></div>';

  modal.style.display = 'flex';
}

function promptCompareKeys(testId) {
  document.getElementById('btn-compare-keys').style.display = 'none';
  document.getElementById('compare-keys-auth').style.display = 'block';
}

async function submitCompareKeys(testId) {
  var tgId = (state.tgUser && state.tgUser.id) || 0;
  var code = document.getElementById('input-key-code').value.trim();
  var errEl = document.getElementById('compare-keys-error');
  var resEl = document.getElementById('compare-keys-result');
  
  if (!code) {
    errEl.textContent = "Iltimos, parolni kiriting!";
    errEl.style.display = 'block';
    return;
  }
  
  try {
    const res = await fetch('/api/app/compare-keys', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        tg_id: tgId,
        test_id: testId,
        code: code,
        init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || ''
      })
    });
    const data = await res.json();
    
    if (data.success) {
      document.getElementById('compare-keys-auth').style.display = 'none';
      renderKeyComparison(data.correct_answers, data.user_answers, resEl);
    } else {
      errEl.textContent = data.message || "Xatolik yuz berdi.";
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.textContent = "Tarmoq xatosi.";
    errEl.style.display = 'block';
  }
}

function renderKeyComparison(correct, user, container) {
  if (!container) return;
  container.style.display = 'block';

  function getAnswerVal(val) {
    if (val === undefined || val === null) return '-';
    if (typeof val === 'object') {
      if (val.ans !== undefined && val.ans !== null) return String(val.ans).trim() || '-';
      if (val.answer !== undefined && val.answer !== null) return String(val.answer).trim() || '-';
      return '-';
    }
    var s = String(val).trim();
    return s.length > 0 ? s : '-';
  }

  function normalizeAnswer(ans) {
    if (ans === undefined || ans === null || ans === '-') return '';
    var s = String(ans).trim().toLowerCase();

    // Bo'shliqlar va dollar belgilarini olib tashlash
    s = s.replace(/[\s\$]/g, '');

    // 1. Vergul va nuqta: "2,5" -> "2.5"
    s = s.replace(/,/g, '.');

    // 2. Ko'paytirish belgilari: "×", "·" -> "*"
    s = s.replace(/×/g, '*').replace(/·/g, '*');
    s = s.replace(/\\+(?:cdot|times)\b/g, '*');

    // 3. Pi soni: \pi, pi, π
    s = s.replace(/(^|[^a-zA-Z])\\*pi(?![a-zA-Z])/g, '$1π');

    // 4. LaTeX residuallari: \frac, \sqrt, \sqrt[n]
    while (/\\+sqrt\[([^\]]+)\]\{([^}]+)\}/.test(s)) {
      s = s.replace(/\\+sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√$2');
    }
    while (/\\+d?frac\{([^}]+)\}\{([^}]+)\}/.test(s)) {
      s = s.replace(/\\+d?frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');
    }
    while (s.includes('sqrt{')) {
      s = s.replace(/\\+sqrt\{([^}]+)\}/g, '√$1');
    }
    s = s.replace(/\\+sqrt([0-9a-zA-Z]+)/g, '√$1');
    s = s.replace(/sqrt/g, '√');

    // Ildizlar va darajalar:
    s = s.replace(/∛/g, '3√').replace(/cbrt/g, '3√').replace(/³√/g, '3√');
    s = s.replace(/∜/g, '4√').replace(/⁴√/g, '4√');
    s = s.replace(/⁰√/g, '0√').replace(/¹√/g, '1√').replace(/²√/g, '2√');
    s = s.replace(/⁵√/g, '5√').replace(/⁶√/g, '6√').replace(/⁷√/g, '7√');
    s = s.replace(/⁸√/g, '8√').replace(/⁹√/g, '9√').replace(/ⁿ√/g, 'n√');

    // 5. Ildiz qavslari: "√(29)" -> "√29", "5√(32)" -> "5√32", "3√(8)" -> "3√8"
    while (/([0-9a-zA-Z]*√)\(([^()]+)\)/.test(s)) {
      s = s.replace(/([0-9a-zA-Z]*√)\(([^()]+)\)/g, '$1$2');
    }

    // Agar ildiz butunligicha qavs ichida bo'lsa: "(√29)" -> "√29"
    while (/\(([0-9a-zA-Z]*√[^()]+)\)/.test(s)) {
      s = s.replace(/\(([0-9a-zA-Z]*√[^()]+)\)/g, '$1');
    }

    // 6. Ko'paytirish belgisi ko'rinishi: "8*√58" -> "8√58", "36*π" -> "36π"
    s = s.replace(/(\d|\))\*(√|[0-9a-zA-Z]+√|π|[a-zA-Z])/g, '$1$2');
    s = s.replace(/(\d)\((√|[0-9a-zA-Z]+√|π)/g, '$1$2');
    s = s.replace(/\*(π)/g, '$1');
    s = s.replace(/(π)\*/g, '$1');

    // Darajalarni standart ^ shakliga keltirish:
    s = s.replace(/⁰/g, '^0').replace(/¹/g, '^1').replace(/²/g, '^2').replace(/³/g, '^3');
    s = s.replace(/⁴/g, '^4').replace(/⁵/g, '^5').replace(/⁶/g, '^6').replace(/⁷/g, '^7').replace(/⁸/g, '^8').replace(/⁹/g, '^9');

    // Ortiqcha figurali qavslar va sleshlar
    s = s.replace(/\{([^}]+)\}/g, '$1');
    s = s.replace(/\\/g, '');

    return s;
  }

  function parseNumericOrFraction(val) {
    if (!val) return null;
    val = String(val).trim();
    try {
      // Sof kasr holati: "a/b"
      if (/^-?\d+(?:\.\d+)?\/-?\d+(?:\.\d+)?$/.test(val)) {
        var parts = val.split('/');
        var num = parseFloat(parts[0]);
        var den = parseFloat(parts[1]);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          return num / den;
        }
        return null;
      }
      // Sof butun yoki o'nlik kasr: "123", "-123.45"
      if (/^-?\d+(?:\.\d+)?$/.test(val)) {
        var f = parseFloat(val);
        return !isNaN(f) ? f : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function isAnswerMatching(cVal, uVal) {
    var nC = normalizeAnswer(cVal);
    var nU = normalizeAnswer(uVal);
    if (!nC || !nU) return false;
    if (nC === nU) return true;
    var numC = parseNumericOrFraction(nC);
    var numU = parseNumericOrFraction(nU);
    if (numC !== null && numU !== null) {
      return Math.abs(numC - numU) < 1e-5;
    }
    return false;
  }

  var closedItems = [];
  var totalCorrectClosed = 0;

  // 1-bosqich: 1 dan 35 gacha bo'lgan yopiq savollar
  // (1–32: 4 ta variant A, B, C, D; 33–35: 6 ta variant A, B, C, D, E, F)
  for (var i = 1; i <= 35; i++) {
    var key = String(i);
    var cVal = getAnswerVal(correct ? (correct[key] !== undefined ? correct[key] : correct[i]) : null);
    var uVal = getAnswerVal(user ? (user[key] !== undefined ? user[key] : user[i]) : null);
    var nC = normalizeAnswer(cVal);
    var nU = normalizeAnswer(uVal);
    var isOk = (nC !== '' && nU !== '' && nC === nU);
    if (isOk) totalCorrectClosed++;
    closedItems.push({
      key: key,
      cVal: cVal,
      uVal: uVal,
      isOk: isOk,
      typeNote: i <= 32 ? '4-talik' : '6-talik'
    });
  }

  // 2-bosqich: 36 dan 45 gacha bo'lgan ochiq savollar (36a–45b, jami 20 ta ochiq band)
  var openItems = [];
  var totalCorrectOpen = 0;
  for (var q = 36; q <= 45; q++) {
    ['a', 'b'].forEach(function(sub) {
      var key = q + sub;
      var cVal = getAnswerVal(correct ? correct[key] : null);
      var uVal = getAnswerVal(user ? user[key] : null);
      var isOk = isAnswerMatching(cVal, uVal);
      if (isOk) totalCorrectOpen++;
      openItems.push({
        key: key,
        cVal: cVal,
        uVal: uVal,
        isOk: isOk
      });
    });
  }

  var totalCorrect = totalCorrectClosed + totalCorrectOpen;

  var html = '<div class="key-comparison-box" style="margin-top:14px;background:var(--bg-card, #1A1D2D);border:1px solid var(--border, rgba(255,255,255,0.08));border-radius:14px;padding:16px;">';

  // Sarlavha va umumiy ko'rsatkich
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border, rgba(255,255,255,0.08));flex-wrap:wrap;gap:8px;">';
  html += '<div><h4 style="margin:0;font-size:15px;font-weight:700;color:var(--text, #FFF);">Kalitlar va javoblar tahlili</h4><span style="font-size:12px;color:var(--text-muted, #94A3B8);">Jami 55 ta savol (35 yopiq + 20 ochiq band)</span></div>';
  html += '<div style="font-size:13px;font-weight:700;padding:4px 12px;border-radius:999px;background:' + (totalCorrect >= 28 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') + ';color:' + (totalCorrect >= 28 ? '#10B981' : '#EF4444') + ';border:1px solid ' + (totalCorrect >= 28 ? '#10B981' : '#EF4444') + ';">' + totalCorrect + ' / 55 to\'g\'ri</div>';
  html += '</div>';

  // 1-bosqich: Yopiq testlar (1–35)
  html += '<div style="margin-bottom:16px;">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
  html += '<span style="font-size:13px;font-weight:600;color:var(--primary, #6366F1);">1-bosqich: Yopiq savollar (1–35)</span>';
  html += '<span style="font-size:11px;font-weight:600;color:var(--text-muted, #94A3B8);">' + totalCorrectClosed + ' / 35 to\'g\'ri</span>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(64px, 1fr));gap:6px;">';
  closedItems.forEach(function(item) {
    var bg = item.isOk ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    var col = item.isOk ? '#10B981' : '#EF4444';
    var icon = item.isOk ? '✓' : '✗';
    html += '<div style="background:' + bg + ';color:' + col + ';border:1px solid ' + col + ';border-radius:8px;padding:6px 2px;text-align:center;font-size:11px;line-height:1.2;">';
    html += '<div style="font-weight:700;font-size:11px;margin-bottom:2px;">#' + item.key + ' ' + icon + '</div>';
    html += '<div style="font-size:10px;opacity:0.9;">Siz: <b>' + item.uVal + '</b></div>';
    html += '<div style="font-size:10px;opacity:0.9;">Asl: <b>' + item.cVal + '</b></div>';
    html += '</div>';
  });
  html += '</div></div>';

  // 2-bosqich: Ochiq yozma savollar (36a–45b, jami 20 ta ochiq band)
  html += '<div>';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
  html += '<span style="font-size:13px;font-weight:600;color:var(--primary, #6366F1);">2-bosqich: Ochiq yozma savollar (36a–45b, 20 band)</span>';
  html += '<span style="font-size:11px;font-weight:600;color:var(--text-muted, #94A3B8);">' + totalCorrectOpen + ' / 20 to\'g\'ri</span>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(78px, 1fr));gap:6px;">';
  openItems.forEach(function(item) {
    var bg = item.isOk ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    var col = item.isOk ? '#10B981' : '#EF4444';
    var icon = item.isOk ? '✓' : '✗';
    html += '<div style="background:' + bg + ';color:' + col + ';border:1px solid ' + col + ';border-radius:8px;padding:6px 2px;text-align:center;font-size:11px;line-height:1.2;overflow:hidden;">';
    html += '<div style="font-weight:700;font-size:11px;margin-bottom:2px;">#' + item.key + ' ' + icon + '</div>';
    html += '<div style="font-size:10px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;" title="' + item.uVal + '">Siz: <b>' + item.uVal + '</b></div>';
    html += '<div style="font-size:10px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;" title="' + item.cVal + '">Asl: <b>' + item.cVal + '</b></div>';
    html += '</div>';
  });
  html += '</div></div>';

  html += '</div>';
  container.innerHTML = html;
}

function closeResultModal(e) {
  if (e && e.target && e.target.id !== 'result-modal') return;
  var modal = document.getElementById('result-modal');
  if (modal) modal.style.display = 'none';
}

// ── HEADER UPDATE ────────────────────────────────
function updateHeaderUser() {
  var u = state.userInfo;
  var tgU = state.tgUser;
  var name = (u && u.fullname) || (tgU && tgU.first_name) || 'F';
  var el = document.getElementById('header-avatar');
  if (el) el.textContent = name.charAt(0).toUpperCase();
}

// ── HELPERS ─────────────────────────────────────
function computeStatus(testsCount, avgScore) {
  if (testsCount === 0) return { label: t('status_new'), icon: '\uD83C\uDF31', cls: 'status-beginner' };
  if (avgScore >= 40) return { label: t('status_gold'), icon: '\uD83E\uDD47', cls: 'status-gold' };
  if (avgScore >= 30) return { label: t('status_silver'), icon: '\uD83E\uDD48', cls: 'status-silver' };
  if (avgScore >= 20) return { label: t('status_bronze'), icon: '\uD83E\uDD49', cls: 'status-bronze' };
  return { label: t('status_learner'), icon: '\uD83D\uDCDA', cls: 'status-beginner' };
}

function getGradeFromScore(score, maxScore) {
  var s = parseFloat(score) || 0;
  var max = parseFloat(maxScore) || 100;

  // Agar ball 0 yoki undan kam bo'lsa, darhol daraja berilmasin
  if (s <= 0) return 'Yetarli emas';

  var pct = (max > 0) ? (s / max * 100) : s;
  
  if (pct >= 86 && s >= 70) return 'A+';
  if (pct >= 75 && s >= 65) return 'A';
  if (pct >= 65 && s >= 60) return 'B+';
  if (pct >= 60 && s >= 55) return 'B';
  if (pct >= 55 && s >= 50) return 'C+';
  if (pct >= 46 && s >= 46) return 'C';
  
  return 'Yetarli emas';
}

function gradeToClass(grade) {
  if (!grade) return 'grade-2';
  var g = String(grade).toUpperCase();
  if (g.startsWith('A')) return 'grade-5';
  if (g.startsWith('B')) return 'grade-4';
  if (g.startsWith('C')) return 'grade-3';
  return 'grade-2';
}

function formatDate(ts) {
  if (!ts) return '\u2014';
  var d = new Date(ts * 1000);
  return d.toLocaleDateString('uz-UZ', { timeZone: 'Asia/Tashkent', day:'2-digit', month:'2-digit', year:'numeric' }) +
    ' ' + d.toLocaleTimeString('uz-UZ', { timeZone: 'Asia/Tashkent', hour:'2-digit', minute:'2-digit', hour12: false });
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2200);
}

// ── ONBOARDING / BOT QO'LLANMA OYNASI ───────────
var currentOnboardingSlide = 0;
var totalOnboardingSlides = 4;

function openOnboardingModal() {
  currentOnboardingSlide = 0;
  goOnboardingSlide(0);
  var modal = document.getElementById('onboarding-modal');
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(function() {
      modal.classList.add('open');
    }, 20);
  }
}

function closeOnboardingModal() {
  var modal = document.getElementById('onboarding-modal');
  if (modal) {
    modal.classList.remove('open');
    setTimeout(function() {
      modal.style.display = 'none';
    }, 280);
  }
}

function goOnboardingSlide(idx) {
  currentOnboardingSlide = idx;
  for (var i = 0; i < totalOnboardingSlides; i++) {
    var slide = document.getElementById('onboarding-slide-' + i);
    var dot = document.getElementById('ob-dot-' + i);
    if (slide) {
      if (i === idx) {
        slide.style.display = 'block';
        slide.classList.add('active');
      } else {
        slide.style.display = 'none';
        slide.classList.remove('active');
      }
    }
    if (dot) {
      if (i === idx) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    }
  }

  var btnNext = document.getElementById('btn-onboarding-next') || document.getElementById('onboarding-next-btn');
  if (btnNext) {
    if (idx === totalOnboardingSlides - 1) {
      btnNext.innerHTML = 'Tushunarli / Boshlash 🚀';
    } else {
      btnNext.innerHTML = 'Keyingisi ➔';
    }
  }
}

function nextOnboardingSlide() {
  if (currentOnboardingSlide < totalOnboardingSlides - 1) {
    goOnboardingSlide(currentOnboardingSlide + 1);
  } else {
    finishOnboarding();
  }
}

function finishOnboarding() {
  localStorage.setItem('onboarding_nav_tour_seen', 'true');
  closeOnboardingModal();
  showToast('Yo‘riqnoma yakunlandi. Xush kelibsiz! 🎉');
}
