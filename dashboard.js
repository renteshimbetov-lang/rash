/**
 * Shohruh Matematika — MacBook Pro Admin Dashboard
 * High-performance, Real-time Desktop Web Application
 */

const State = {
  activeTab: 'overview',
  overview: null,
  submissions: [],
  users: [],
  tests: [],
  logs: [],
  overviewLogs: [],
  submissionsFilter: 'all',
  submissionsTestFilter: '',
  usersFilter: 'all',
  globalSearch: '',
  autoRefresh: true,
  refreshTimer: null,
  currentModalSubmission: null,
  currentModalTest: null,
  activityDayFilter: 'all'
};

// ----------------------------------------------------
// SMART UZBEK DATE & DAY HELPERS
// ----------------------------------------------------
const UZB_DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const UZB_DAYS_SHORT = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
const UZB_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

function parseToDateObj(timestampOrStr) {
  if (!timestampOrStr) return null;
  if (typeof timestampOrStr === 'number') {
    return new Date(timestampOrStr * 1000);
  }
  if (/^\d+$/.test(String(timestampOrStr).trim())) {
    return new Date(parseInt(timestampOrStr, 10) * 1000);
  }
  if (typeof timestampOrStr === 'string' && timestampOrStr.includes('.')) {
    const parts = timestampOrStr.trim().split(' ');
    const dParts = parts[0].split('.');
    const tParts = (parts[1] || '00:00:00').split(':');
    return new Date(
      parseInt(dParts[2], 10),
      parseInt(dParts[1], 10) - 1,
      parseInt(dParts[0], 10),
      parseInt(tParts[0], 10),
      parseInt(tParts[1], 10),
      parseInt(tParts[2] || 0, 10)
    );
  }
  const d = new Date(timestampOrStr);
  return isNaN(d.getTime()) ? null : d;
}

function formatUzbSmartDateTime(timestampOrStr) {
  const dateObj = parseToDateObj(timestampOrStr);
  if (!dateObj) {
    return {
      dayBadgeText: '—',
      dayBadgeClass: 'day-chip-past',
      groupKey: 'earlier',
      groupTitle: 'Avvalgi kunlar',
      timeStr: '—',
      fullDate: '—',
      dateOnly: '—'
    };
  }

  // Now in Tashkent time (UTC+5)
  const now = new Date();
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  const nowUzb = new Date(utcNow + (3600000 * 5));

  const eventYear = dateObj.getFullYear();
  const eventMonth = dateObj.getMonth();
  const eventDate = dateObj.getDate();
  const eventDay = dateObj.getDay();

  const nowYear = nowUzb.getFullYear();
  const nowMonth = nowUzb.getMonth();
  const nowDate = nowUzb.getDate();

  const todayMidnight = new Date(nowYear, nowMonth, nowDate).getTime();
  const eventMidnight = new Date(eventYear, eventMonth, eventDate).getTime();
  const diffDays = Math.round((todayMidnight - eventMidnight) / (86400 * 1000));

  const dayNameFull = UZB_DAYS[eventDay];
  const dayNameShort = UZB_DAYS_SHORT[eventDay];

  const h = String(dateObj.getHours()).padStart(2, '0');
  const m = String(dateObj.getMinutes()).padStart(2, '0');
  const s = String(dateObj.getSeconds()).padStart(2, '0');
  const timeStr = `${h}:${m}:${s}`;
  const dStr = `${String(eventDate).padStart(2, '0')}.${String(eventMonth + 1).padStart(2, '0')}.${eventYear}`;

  let dayBadgeText = '';
  let dayBadgeClass = '';
  let groupKey = 'earlier';
  let groupTitle = `${dayNameFull}, ${eventDate}-${UZB_MONTHS[eventMonth]}`;

  if (diffDays === 0) {
    dayBadgeText = `Bugun (${dayNameShort})`;
    dayBadgeClass = 'day-chip-today';
    groupKey = 'today';
    groupTitle = `Bugun (${dayNameFull}, ${eventDate}-${UZB_MONTHS[eventMonth]})`;
  } else if (diffDays === 1) {
    dayBadgeText = `Kecha (${dayNameShort})`;
    dayBadgeClass = 'day-chip-yesterday';
    groupKey = 'yesterday';
    groupTitle = `Kecha (${dayNameFull}, ${eventDate}-${UZB_MONTHS[eventMonth]})`;
  } else if (diffDays === 2) {
    dayBadgeText = `Avvalgi kun (${dayNameShort})`;
    dayBadgeClass = 'day-chip-earlier';
    groupKey = 'earlier';
    groupTitle = `Avvalgi kun (${dayNameFull}, ${eventDate}-${UZB_MONTHS[eventMonth]})`;
  } else {
    dayBadgeText = `${dayNameShort}, ${eventDate}-${UZB_MONTHS[eventMonth].slice(0, 3)}`;
    dayBadgeClass = 'day-chip-past';
    groupKey = 'past';
    groupTitle = `${dayNameFull}, ${eventDate}-${UZB_MONTHS[eventMonth]} ${eventYear}`;
  }

  return {
    diffDays,
    dayBadgeText,
    dayBadgeClass,
    groupKey,
    groupTitle,
    timeStr,
    fullDate: `${dStr} ${timeStr}`,
    dateOnly: dStr,
    dayName: dayNameFull
  };
}

// ----------------------------------------------------
// macOS BOOT ANIMATION — MAIN APP STYLE
// ----------------------------------------------------
function startBootCanvas() {
  var canvas = document.getElementById('boot-splash-canvas');
  if (!canvas) return null;
  var ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var symbols = ['∞', 'π', '∑', '∫', '√x', 'f(x)', '∆', 'θ', 'λ', '≈', '≠', 'e²', 'α', 'β', '∂y', 'lim', 'dx', '∇'];
  var count = Math.min(28, Math.max(16, Math.floor(canvas.width / 18)));
  var particles = [];
  for (var i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      char: symbols[Math.floor(Math.random() * symbols.length)],
      size: 13 + Math.random() * 20,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.7,
      opacity: 0.1 + Math.random() * 0.4,
      pulseSpeed: 0.018 + Math.random() * 0.025,
      angle: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.012
    });
  }

  var animId = null;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy; p.angle += p.spinSpeed;
      p.opacity += Math.sin(Date.now() * p.pulseSpeed) * 0.004;
      if (p.opacity < 0.08) p.opacity = 0.08;
      if (p.opacity > 0.55) p.opacity = 0.55;
      if (p.y < -30) { p.y = canvas.height + 30; p.x = Math.random() * canvas.width; }
      if (p.x < -30) p.x = canvas.width + 30;
      if (p.x > canvas.width + 30) p.x = -30;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.font = 'bold ' + p.size + 'px serif';
      ctx.fillStyle = 'rgba(0, 200, 167, ' + p.opacity + ')';
      ctx.shadowColor = 'rgba(0, 163, 137, 0.4)';
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.char, 0, 0);
      ctx.restore();
    }
    animId = requestAnimationFrame(draw);
  }
  animId = requestAnimationFrame(draw);
  return function stop() { if (animId) cancelAnimationFrame(animId); };
}

var _bootCanvasStop = null;

function enterFullscreen() {
  var el = document.documentElement;
  try {
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  } catch(e) {}
}

function skipBootSplash() {
  var splash = document.getElementById('mac-boot-splash');
  if (!splash) return;
  if (_bootCanvasStop) _bootCanvasStop();
  splash.classList.add('hidden');
  setTimeout(() => {
    if (splash.parentNode) splash.remove();
    // To'liq ekranga o'tish
    enterFullscreen();
  }, 700);
}
window.skipBootSplash = skipBootSplash;

function runBootAnimation() {
  var splash = document.getElementById('mac-boot-splash');
  var bar = document.getElementById('boot-progress-bar');
  if (!splash) return;

  // Start floating math particles
  _bootCanvasStop = startBootCanvas();

  if (!bar) { setTimeout(skipBootSplash, 3200); return; }

  // Progress animation: 4 natural steps
  var pct = 0;
  var steps = [
    { target: 28, delay: 200,  speed: 20 },
    { target: 62, delay: 500,  speed: 18 },
    { target: 87, delay: 600,  speed: 30 },
    { target: 100, delay: 350, speed: 16 }
  ];
  var stepIdx = 0;
  function runStep() {
    if (stepIdx >= steps.length) {
      setTimeout(skipBootSplash, 220);
      return;
    }
    var s = steps[stepIdx++];
    setTimeout(() => {
      var iv = setInterval(() => {
        if (pct >= s.target) { clearInterval(iv); runStep(); return; }
        pct = Math.min(pct + 1, s.target);
        bar.style.width = pct + '%';
      }, s.speed);
    }, s.delay);
  }
  runStep();
}

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  runBootAnimation();
  initLiveClock();
  setupKeyboardShortcuts();
  fetchDashboardData();
  startAutoRefresh();
});

// Live Tashkent Clock (UTC+5)
function initLiveClock() {
  const update = () => {
    const el = document.getElementById('live-clock');
    if (!el) return;
    const now = new Date();
    // UTC+5 calculation
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const uzbDate = new Date(utc + (3600000 * 5));
    const h = String(uzbDate.getHours()).padStart(2, '0');
    const m = String(uzbDate.getMinutes()).padStart(2, '0');
    const s = String(uzbDate.getSeconds()).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  };
  update();
  setInterval(update, 1000);
}

// ----------------------------------------------------
// TAB SWITCHING
// ----------------------------------------------------
function switchDashboardTab(tabId) {
  State.activeTab = tabId;

  // Update navigation classes
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-tab') === tabId);
  });

  // Update Views
  document.querySelectorAll('.page-view').forEach(el => {
    el.classList.remove('active');
  });
  const targetView = document.getElementById(`view-${tabId}`);
  if (targetView) targetView.classList.add('active');

  // Update Title & Subtitle
  const titles = {
    overview: { t: 'Dashboard', sub: 'Umumiy tizim holati, statistika va faolliklar' },
    submissions: { t: 'Natijalar Bazasi', sub: 'O\'quvchilarning ishlagan barcha test javoblari va vaqtlari' },
    users: { t: 'Foydalanuvchilar Bazasi', sub: 'Bot a\'zolari va o\'quvchilar ro\'yxati' },
    tests: { t: 'Testlar Boshqaruvi', sub: 'Yaratilgan barcha milliy sertifikat va blok testlar' },
    activity: { t: 'Jarayonlar & Audit', sub: 'Tizimda sodir bo\'lgan barcha hodisalar jurnali' },
    database: { t: 'Baza & SQL Konsoli', sub: 'PostgreSQL Cloud ma\'lumotlar bazasi va to\'g\'ridan-to\'g\'ri so\'rovlar' }
  };

  const info = titles[tabId] || { t: 'Boshqaruv', sub: '' };
  document.getElementById('page-title').textContent = info.t;
  document.getElementById('page-subtitle').textContent = info.sub;

  // Render view
  renderCurrentView();
}

function renderCurrentView() {
  if (State.activeTab === 'overview') renderOverview();
  else if (State.activeTab === 'submissions') renderSubmissions();
  else if (State.activeTab === 'users') renderUsers();
  else if (State.activeTab === 'tests') renderTests();
  else if (State.activeTab === 'activity') renderLogs();
  else if (State.activeTab === 'database') renderDatabase();
}

// ----------------------------------------------------
// DATA FETCHING (REAL-TIME)
// ----------------------------------------------------
async function fetchDashboardData(manual = false) {
  try {
    // 1. Overview & Stats
    const resOverview = await fetch('/api/dashboard/overview');
    if (resOverview.ok) {
      const data = await resOverview.json();
      if (data.success) {
        State.overview = data.summary;
        State.tests = data.tests || [];
        updateHeaderAndBadges(data.summary);
        if (State.activeTab === 'overview') {
          renderOverviewData(data);
        }
      }
    }

    // 2. Fetch specific tab data if active
    if (State.activeTab === 'submissions') {
      await fetchSubmissionsData();
    } else if (State.activeTab === 'users') {
      await fetchUsersData();
    } else if (State.activeTab === 'tests') {
      await fetchTestsData();
    } else if (State.activeTab === 'activity') {
      await fetchLogsData();
    }

    if (manual) {
      showToast('Ma\'lumotlar muvaffaqiyatli yangilandi! ⚡️', 'success');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    if (manual) showToast('Bog\'lanishda xatolik yuz berdi', 'danger');
  }
}

async function fetchSubmissionsData() {
  const res = await fetch('/api/dashboard/submissions?limit=1500');
  if (res.ok) {
    const data = await res.json();
    if (data.success) {
      State.submissions = data.submissions || [];
      renderSubmissions();
      // Populate test filter dropdown
      populateTestFilterDropdown();
    }
  }
}

async function fetchUsersData() {
  const res = await fetch('/api/dashboard/users');
  if (res.ok) {
    const data = await res.json();
    if (data.success) {
      State.users = data.users || [];
      renderUsers();
    }
  }
}

async function fetchTestsData() {
  const res = await fetch('/api/dashboard/tests');
  if (res.ok) {
    const data = await res.json();
    if (data.success) {
      State.tests = data.tests || [];
      renderTests();
    }
  }
}

async function fetchLogsData() {
  const res = await fetch('/api/dashboard/logs?limit=150');
  if (res.ok) {
    const data = await res.json();
    if (data.success) {
      State.logs = data.logs || [];
      renderLogs();
    }
  }
}

function updateHeaderAndBadges(summary) {
  if (!summary) return;
  document.getElementById('badge-submissions-count').textContent = summary.total_submissions || 0;
  document.getElementById('badge-users-count').textContent = summary.total_users || 0;
  document.getElementById('badge-tests-count').textContent = summary.total_tests || 0;

  // Stat Cards in Overview
  const elTotalUsers = document.getElementById('stat-total-users');
  if (elTotalUsers) {
    elTotalUsers.textContent = summary.total_users || 0;
    document.getElementById('stat-approved-users').textContent = `${summary.approved_users || 0} faol`;
    document.getElementById('stat-pending-users').textContent = `${summary.pending_users || 0} kutilmoqda`;
    document.getElementById('stat-blocked-users').textContent = `${summary.blocked_users || 0} blok`;
    
    document.getElementById('stat-total-subs').textContent = summary.total_submissions || 0;
    document.getElementById('stat-today-subs').textContent = `+${summary.today_submissions || 0} bugun`;
    document.getElementById('stat-late-subs').textContent = `${summary.late_submissions || 0} kechikkan`;

    document.getElementById('stat-avg-score').textContent = `${summary.avg_score || 0} ball`;
    document.getElementById('stat-avg-corr').textContent = `${summary.avg_correct || 0} ta`;

    document.getElementById('stat-total-tests').textContent = `${summary.total_tests || 0} ta`;
    document.getElementById('stat-active-tests').textContent = `${summary.active_tests || 0} ta faol`;
    
    // DB Explorer counts
    const elTblUsers = document.getElementById('db-tbl-users');
    if (elTblUsers) elTblUsers.textContent = `${summary.total_users || 0} qator`;
    const elTblSubs = document.getElementById('db-tbl-subs');
    if (elTblSubs) elTblSubs.textContent = `${summary.total_submissions || 0} qator`;
    const elTblTests = document.getElementById('db-tbl-tests');
    if (elTblTests) elTblTests.textContent = `${summary.total_tests || 0} qator`;
  }
}

// ----------------------------------------------------
// OVERVIEW RENDERING
// ----------------------------------------------------
function renderOverview() {
  fetchDashboardData();
}

function renderOverviewData(data) {
  // 1. Recent Submissions
  const subsBody = document.getElementById('overview-recent-subs-body');
  if (subsBody) {
    const list = data.recent_submissions || [];
    if (list.length === 0) {
      subsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">Natijalar mavjud emas</td></tr>';
    } else {
      subsBody.innerHTML = list.slice(0, 8).map(s => {
        const usernameTag = s.username ? `<span style="color:var(--primary);font-size:11px;font-weight:700;">@${esc(s.username.replace(/^@/, ''))}</span>` : '';
        const lateBadge = s.is_late == 1 ? '<span class="badge badge-warning" style="margin-left:4px;">⏰ Kech</span>' : '';
        const dt = formatUzbSmartDateTime(s.submitted_at || s.submitted_at_fmt);
        return `
          <tr class="clickable-row" onclick="openSubmissionModal(${s.id})">
            <td>
              <div style="font-weight:700;font-size:13.5px;color:var(--text-main);">${esc(s.fullname || 'Foydalanuvchi')}</div>
              ${usernameTag}
            </td>
            <td><b style="color:var(--text-main);font-family:var(--font-mono);">#${esc(s.test_code || '')}</b></td>
            <td>
              <div class="time-cell-wrap">
                <span class="day-chip ${dt.dayBadgeClass}">${dt.dayBadgeText}</span>
                <span class="time-str-mono" style="font-size:11px;">${dt.timeStr}</span>
              </div>
            </td>
            <td>
              <span style="font-weight:800;color:var(--success);">${s.correct_count || 0} / ${s.total_count || 55}</span>
              ${lateBadge}
            </td>
            <td><b style="color:var(--primary);font-size:14px;">${s.score || 0} ball</b></td>
            <td onclick="event.stopPropagation();">
              <div style="display:inline-flex;gap:6px;align-items:center;">
                <button class="btn btn-secondary btn-sm" onclick="openSubmissionModal(${s.id})">Ko'rish 👁</button>
                <button class="btn btn-danger btn-sm" onclick="openCancelSubModalById(${s.id})" title="Javobni bekor qilish">Bekor qilish 🚫</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 2. Activity Timeline with Day Groups & Priority
  State.overviewLogs = data.activity_logs || [];
  renderOverviewActivities(State.overviewLogs);
}

function setActivityDayFilter(filter, btn) {
  State.activityDayFilter = filter;
  if (btn && btn.parentElement) {
    btn.parentElement.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderOverviewActivities(State.overviewLogs);
}
window.setActivityDayFilter = setActivityDayFilter;

function renderOverviewActivities(logs) {
  const container = document.getElementById('overview-activity-list');
  if (!container) return;

  if (!logs || logs.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:24px;">Faolliklar mavjud emas</div>';
    return;
  }

  const groups = {
    today: { title: 'Bugun', items: [] },
    yesterday: { title: 'Kecha', items: [] },
    earlier: { title: 'Undan oldingi kunlar', items: [] }
  };

  logs.forEach(l => {
    const dt = formatUzbSmartDateTime(l.time || l.time_fmt);
    l._dt = dt;
    if (dt.groupKey === 'today') {
      groups.today.items.push(l);
      groups.today.title = dt.groupTitle;
    } else if (dt.groupKey === 'yesterday') {
      groups.yesterday.items.push(l);
      groups.yesterday.title = dt.groupTitle;
    } else {
      groups.earlier.items.push(l);
    }
  });

  const filter = State.activityDayFilter || 'all';

  const renderGroup = (key, grp, headerClass) => {
    if (grp.items.length === 0) {
      if (filter === key) {
        return `
          <div class="activity-day-group">
            <div class="activity-day-header ${headerClass}">
              <span>📅 ${esc(grp.title)}</span>
              <span class="badge" style="font-size:10px;">0 ta amal</span>
            </div>
            <div style="font-size:12px;color:var(--text-muted);padding:10px 4px;">Ushbu kunda yangi amallar qayd etilmagan</div>
          </div>
        `;
      }
      return '';
    }

    const itemsHtml = grp.items.map(l => {
      const un = l.username ? ` (@${esc(l.username.replace(/^@/, ''))})` : '';
      return `
        <div class="activity-item">
          <div class="activity-icon-box">
            ${l.type === 'submission' ? '🏆' : (l.type === 'late_submission' ? '⏰' : '👤')}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:12.5px;font-weight:700;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(l.title)}</div>
            <div style="font-size:11.5px;color:var(--text-muted);margin-top:1px;font-weight:500;">
              ${esc(l.user_name || '')}${un}
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:3px;">
              <span class="day-chip ${l._dt.dayBadgeClass}">${l._dt.dayBadgeText}</span>
              <span style="font-size:11px;font-family:var(--font-mono);color:var(--text-dim);font-weight:700;">${l._dt.timeStr}</span>
            </div>
          </div>
          <span class="badge badge-${l.badge_color || 'info'}" style="font-size:10px;flex-shrink:0;">${esc(l.badge || '')}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="activity-day-group">
        <div class="activity-day-header ${headerClass}">
          <span>📅 ${esc(grp.title)}</span>
          <span class="badge" style="font-size:10px;font-weight:800;">${grp.items.length} ta amal</span>
        </div>
        <div>${itemsHtml}</div>
      </div>
    `;
  };

  let renderedHtml = '';
  if (filter === 'today') {
    renderedHtml = renderGroup('today', groups.today, 'today');
  } else if (filter === 'yesterday') {
    renderedHtml = renderGroup('yesterday', groups.yesterday, 'yesterday');
  } else {
    // ALL: Prioritize Today's actions at top!
    if (groups.today.items.length === 0) {
      renderedHtml += `
        <div class="activity-day-group">
          <div class="activity-day-header today">
            <span>📅 Bugungi amallar</span>
            <span class="badge badge-warning" style="font-size:10px;">Bugun hozircha yangi amal yo'q</span>
          </div>
        </div>
      `;
    } else {
      renderedHtml += renderGroup('today', groups.today, 'today');
    }
    renderedHtml += renderGroup('yesterday', groups.yesterday, 'yesterday');
    renderedHtml += renderGroup('earlier', groups.earlier, 'earlier');
  }

  container.innerHTML = renderedHtml;
}

// ----------------------------------------------------
// SUBMISSIONS RENDERING & FILTERING
// ----------------------------------------------------
function setSubmissionsFilter(filter, btn) {
  State.submissionsFilter = filter;
  if (btn && btn.parentElement) {
    btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderSubmissions();
}

function filterSubmissionsByTest(testCode) {
  State.submissionsTestFilter = testCode;
  renderSubmissions();
}

function populateTestFilterDropdown() {
  const sel = document.getElementById('filter-test-select');
  if (!sel) return;
  const codes = [...new Set(State.submissions.map(s => String(s.test_code)).filter(Boolean))];
  const cur = sel.value;
  sel.innerHTML = '<option value="">Barcha testlar</option>' + 
    codes.map(c => `<option value="${esc(c)}" ${cur === c ? 'selected' : ''}>#${esc(c)} testi</option>`).join('');
}

function renderSubmissions() {
  const body = document.getElementById('submissions-table-body');
  if (!body) return;

  const q = State.globalSearch.toLowerCase().trim();
  const cleanQ = q.replace(/^@+/, '').trim();

  let filtered = State.submissions.filter(s => {
    // 1. Status filter
    if (State.submissionsFilter === 'ontime' && s.is_late == 1) return false;
    if (State.submissionsFilter === 'late' && s.is_late != 1) return false;

    // 2. Test filter
    if (State.submissionsTestFilter && String(s.test_code) !== String(State.submissionsTestFilter)) return false;

    // 3. Search query
    if (q) {
      const uName = (s.username || '').toLowerCase().replace(/^@+/, '').trim();
      const fn = (s.fullname || '').toLowerCase();
      const code = String(s.test_code || '').toLowerCase();
      const idStr = String(s.user_tg_id || '');
      const match = fn.includes(q) || fn.includes(cleanQ) || (uName && (uName.includes(cleanQ) || ('@' + uName).includes(q))) || code.includes(cleanQ) || idStr.includes(cleanQ);
      if (!match) return false;
    }
    return true;
  });

  const countBadge = document.getElementById('submissions-count-badge');
  if (countBadge) countBadge.textContent = `${filtered.length} ta`;

  if (filtered.length === 0) {
    body.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-muted);">Qidiruv bo\'yicha hech narsa topilmadi</td></tr>';
    return;
  }

  body.innerHTML = filtered.map((s, idx) => {
    const usernameTag = s.username ? `<span style="color:var(--primary);font-size:11.5px;font-weight:700;">@${esc(s.username.replace(/^@/, ''))}</span>` : '<span style="color:var(--text-dim);font-size:11px;">—</span>';
    
    // Status Badge
    let stBadge = '';
    if (s.status === 'rejected') {
      stBadge = '<span class="badge badge-danger" style="background:#EF4444;color:#fff;">⛔️ Bekor qilingan</span>';
    } else if (s.is_late == 1) {
      stBadge = '<span class="badge badge-warning">⏰ Kechikkan</span>';
    } else {
      stBadge = '<span class="badge badge-success">✅ O\'z vaqtida</span>';
    }

    // Grade Badge
    const gr = s.grade || '—';
    let grColor = 'purple';
    if (gr === 'A+' || gr === 'A') grColor = 'success';
    else if (gr === 'B+' || gr === 'B') grColor = 'info';
    else if (gr === 'C+' || gr === 'C') grColor = 'warning';

    // Smart Date & Day Badge
    const dt = formatUzbSmartDateTime(s.submitted_at || s.submitted_at_fmt);

    return `
      <tr class="clickable-row" onclick="openSubmissionModal(${s.id})">
        <td style="color:var(--text-dim);font-weight:700;font-family:var(--font-mono);">${idx + 1}</td>
        <td>
          <div style="font-weight:700;font-size:13.5px;color:var(--text-main);">${esc(s.fullname || 'Foydalanuvchi')}</div>
          <div style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono);font-weight:700;">ID: ${s.user_tg_id}</div>
        </td>
        <td>${usernameTag}</td>
        <td><span class="badge badge-info" style="font-family:var(--font-mono);font-size:11.5px;">#${esc(s.test_code || '')}</span></td>
        <td>
          <div class="time-cell-wrap">
            <span class="day-chip ${dt.dayBadgeClass}">${dt.dayBadgeText}</span>
            <span class="time-str-mono">${dt.fullDate}</span>
          </div>
        </td>
        <td>
          <b style="color:var(--success);font-size:13px;">${s.correct_count || 0}</b>
          <span style="color:var(--text-muted);font-size:11px;">/ ${s.total_count || 55}</span>
        </td>
        <td><b style="color:var(--primary);font-size:14.5px;">${s.score || 0} ball</b></td>
        <td><span class="badge badge-${grColor}">${esc(gr)}</span></td>
        <td>${stBadge}</td>
        <td style="text-align:right;" onclick="event.stopPropagation();">
          <div style="display:inline-flex;gap:6px;align-items:center;">
            <button class="btn btn-secondary btn-sm" onclick="openSubmissionModal(${s.id})">
              Ko'rish 👁
            </button>
            <button class="btn btn-danger btn-sm" onclick="openCancelSubModalById(${s.id})" title="Javobni bekor qilish">
              Bekor qilish 🚫
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ----------------------------------------------------
// USERS RENDERING & FILTERING
// ----------------------------------------------------
function setUsersFilter(filter, btn) {
  State.usersFilter = filter;
  if (btn && btn.parentElement) {
    btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderUsers();
}

function renderUsers() {
  const body = document.getElementById('users-table-body');
  if (!body) return;

  const q = State.globalSearch.toLowerCase().trim();
  const cleanQ = q.replace(/^@+/, '').trim();

  let filtered = State.users.filter(u => {
    // 1. Status Filter
    const st = (u.status || 'pending').toLowerCase();
    if (State.usersFilter === 'approved' && st !== 'approved') return false;
    if (State.usersFilter === 'pending' && st !== 'pending') return false;
    if (State.usersFilter === 'blocked' && st !== 'blocked') return false;

    // 2. Search query
    if (q) {
      const uName = (u.username || '').toLowerCase().replace(/^@+/, '').trim();
      const fn = (u.fullname || '').toLowerCase();
      const ph = (u.phone || '').toLowerCase();
      const idStr = String(u.tg_id || '');
      const match = fn.includes(q) || fn.includes(cleanQ) || (uName && (uName.includes(cleanQ) || ('@' + uName).includes(q))) || ph.includes(cleanQ) || idStr.includes(cleanQ);
      if (!match) return false;
    }
    return true;
  });

  const countBadge = document.getElementById('users-count-badge');
  if (countBadge) countBadge.textContent = `${filtered.length} nafar`;

  if (filtered.length === 0) {
    body.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-muted);">Foydalanuvchilar topilmadi</td></tr>';
    return;
  }

  body.innerHTML = filtered.map(u => {
    const usernameTag = u.username ? `<span style="color:var(--primary);font-size:12px;font-weight:700;">@${esc(u.username.replace(/^@/, ''))}</span>` : '<span style="color:var(--text-dim);">—</span>';
    
    // Status Badge
    let stBadge = '';
    const st = (u.status || 'pending').toLowerCase();
    if (st === 'approved') stBadge = '<span class="badge badge-success">✅ Faol</span>';
    else if (st === 'pending') stBadge = '<span class="badge badge-warning">⏳ Kutilmoqda</span>';
    else if (st === 'blocked') stBadge = '<span class="badge badge-danger">⛔️ Bloklangan</span>';

    const regDt = formatUzbSmartDateTime(u.registered_at || u.registered_at_fmt);
    const lastDt = u.last_test_at ? formatUzbSmartDateTime(u.last_test_at || u.last_test_at_fmt) : null;

    return `
      <tr>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--text-dim);font-weight:700;">${u.tg_id}</td>
        <td><div style="font-weight:700;font-size:14px;color:var(--text-main);">${esc(u.fullname || 'Foydalanuvchi')}</div></td>
        <td>${usernameTag}</td>
        <td style="font-size:12.5px;color:var(--text-muted);font-weight:600;">${esc(u.phone || '—')}</td>
        <td>${stBadge}</td>
        <td>
          <div class="time-cell-wrap">
            <span class="day-chip ${regDt.dayBadgeClass}">${regDt.dayBadgeText}</span>
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim);font-weight:600;">${regDt.fullDate}</span>
          </div>
        </td>
        <td><b style="color:var(--primary);font-size:13.5px;">${u.tests_count || 0} ta</b></td>
        <td>
          ${lastDt ? `
            <div class="time-cell-wrap">
              <span class="day-chip ${lastDt.dayBadgeClass}">${lastDt.dayBadgeText}</span>
              <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim);font-weight:600;">${lastDt.fullDate}</span>
            </div>
          ` : '<span style="color:var(--text-dim);">—</span>'}
        </td>
        <td style="text-align:right;">
          <div style="display:inline-flex;gap:6px;">
            ${st !== 'approved' ? `<button class="btn btn-secondary btn-sm" onclick="changeUserStatus(${u.tg_id}, 'approve')">✅ Faol</button>` : ''}
            ${st !== 'blocked' ? `<button class="btn btn-secondary btn-sm" onclick="changeUserStatus(${u.tg_id}, 'block')">⛔️ Blok</button>` : ''}
            <button class="btn btn-danger btn-sm" onclick="changeUserStatus(${u.tg_id}, 'delete')">🗑 O'chirish</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ----------------------------------------------------
// TESTS RENDERING & ACTIONS
// ----------------------------------------------------
function renderTests() {
  const body = document.getElementById('tests-table-body');
  if (!body) return;

  const list = State.tests || [];
  if (list.length === 0) {
    body.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-muted);">Mavjud testlar topilmadi</td></tr>';
    return;
  }

  body.innerHTML = list.map(t => {
    const isAct = t.is_active == 1;
    const isPub = t.results_published == 1;

    return `
      <tr class="clickable-row" onclick="openTestModal(${t.id})">
        <td><b style="color:var(--primary);font-size:14px;font-family:var(--font-mono);">#${esc(t.test_code || '')}</b></td>
        <td>
          <div style="font-weight:700;font-size:14px;color:var(--text-main);">${esc(t.title || 'Test')}</div>
          <div style="font-size:11px;color:var(--text-muted);font-weight:600;">Batafsil ma'lumot va kalitlar uchun bosing 👆</div>
        </td>
        <td><span class="badge badge-purple">${esc(t.subject || 'Matematika')}</span></td>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--text-main);font-weight:600;">${esc(t.scheduled_date || '—')} ${esc(t.scheduled_start || '')}</td>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--text-main);font-weight:600;">${esc(t.scheduled_end || '—')}</td>
        <td><b>${t.total_questions || 55} ta</b></td>
        <td><b style="color:var(--success);font-size:13.5px;">${t.submissions_count || 0} kishi</b></td>
        <td>
          <span class="badge badge-${isAct ? 'success' : 'danger'}">
            ${isAct ? '🟢 Faol' : '🔴 To\'xtatilgan'}
          </span>
        </td>
        <td>
          <span class="badge badge-${isPub ? 'success' : 'warning'}">
            ${isPub ? '📢 E\'lon qilingan' : '🔒 Yashirin'}
          </span>
        </td>
        <td style="text-align:right;" onclick="event.stopPropagation();">
          <div style="display:inline-flex;gap:6px;">
            <button class="btn btn-secondary btn-sm" onclick="openTestModal(${t.id})" title="Barcha kalitlar va statistikani ko'rish">
              Tafsilot 👁
            </button>
            <button class="btn btn-secondary btn-sm" onclick="toggleTestStatus(${t.id})" title="Testni to'xtatish / yoqish">
              ${isAct ? '⏸' : '▶️'}
            </button>
            <button class="btn btn-secondary btn-sm" onclick="toggleTestPublish(${t.id})" title="Natijalarni e'lon qilish / yashirish">
              ${isPub ? '🔒' : '📢'}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ----------------------------------------------------
// TEST DETAILS MODAL (Ustiga bosganda ma'lumot berish)
// ----------------------------------------------------
function extractKeyValue(val) {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'string' || typeof val === 'number') return String(val).trim();
  if (typeof val === 'object') {
    if (val.ans !== undefined) return String(val.ans).trim();
    if (val.answer !== undefined) return String(val.answer).trim();
    if (val.key !== undefined) return String(val.key).trim();
    if (val.val !== undefined) return String(val.val).trim();
    if (val.correct !== undefined) return String(val.correct).trim();
    const values = Object.values(val);
    if (values.length > 0 && typeof values[0] !== 'object') return String(values[0]).trim();
    return JSON.stringify(val);
  }
  return String(val).trim();
}

function openTestModal(testId) {
  const modal = document.getElementById('test-detail-modal');
  if (!modal) return;

  const t = (State.tests || []).find(item => item.id == testId);
  if (!t) {
    showToast('Test ma\'lumotlari topilmadi', 'warning');
    return;
  }
  State.currentModalTest = t;
  modal.classList.add('open');

  document.getElementById('modal-test-title').textContent = `#${t.test_code} — ${t.title || 'Test'}`;
  document.getElementById('modal-test-sub').textContent = `Fan: ${t.subject || 'Matematika'} • Yaratilgan sana: ${t.created_at_fmt || t.created_date || '—'}`;

  // 1. Schedule & Times (Qachon boshlangan, qachon tugagan)
  const startTimeStr = t.scheduled_date ? `${t.scheduled_date} ${t.scheduled_start || ''}`.trim() : (t.created_at_fmt || 'E\'lon qilingan vaqtdan');
  const endTimeStr = t.scheduled_end ? `${t.scheduled_date || ''} ${t.scheduled_end}`.trim() : (t.is_active == 1 ? '🟢 Hozirda davom etmoqda' : '🔴 Yakunlangan');
  const durationStr = t.time_limit_min ? `${t.time_limit_min} daqiqa (${(t.time_limit_min/60).toFixed(1)} soat)` : 'Vaqt chegarasisiz';
  
  document.getElementById('modal-test-start-time').textContent = startTimeStr;
  document.getElementById('modal-test-end-time').textContent = endTimeStr;
  document.getElementById('modal-test-duration').textContent = durationStr;
  document.getElementById('modal-test-q-count').textContent = `${t.total_questions || 55} ta savol`;

  // 2. Statistics
  document.getElementById('modal-test-subs-count').textContent = `${t.submissions_count || 0} kishi`;
  document.getElementById('modal-test-subs-sub').textContent = t.submissions_count > 0 ? "O'quvchilar topshirdi" : "Hozircha topshirilmadi";
  document.getElementById('modal-test-avg-score').textContent = `${Number(t.avg_score || 0).toFixed(1)} ball`;
  document.getElementById('modal-test-avg-corr').textContent = `O'rtacha ko'rsatkich`;
  document.getElementById('modal-test-max-score').textContent = `${Number(t.max_score_achieved || 0).toFixed(1)} ball`;

  const isAct = t.is_active == 1;
  const isPub = t.results_published == 1;

  document.getElementById('modal-test-status-badge').innerHTML = `
    <span class="badge badge-${isAct ? 'success' : 'danger'}" style="font-size:11.5px;">
      ${isAct ? '🟢 Qabul ochiq (Faol)' : '🔴 To\'xtatilgan'}
    </span>
  `;
  document.getElementById('modal-test-pub-badge').innerHTML = `
    <span class="badge badge-${isPub ? 'success' : 'warning'}" style="font-size:11.5px;">
      ${isPub ? '📢 Natijalar e\'lon qilingan' : '🔒 Natijalar yashirin'}
    </span>
  `;

  // 3. Action buttons inside modal
  const actContainer = document.getElementById('modal-test-actions');
  if (actContainer) {
    actContainer.innerHTML = `
      <button class="btn btn-secondary btn-sm" onclick="toggleTestStatusFromModal(${t.id})">
        ${isAct ? '⏸ Qabulni to\'xtatish' : '▶️ Testni yoqish'}
      </button>
      <button class="btn btn-secondary btn-sm" onclick="toggleTestPublishFromModal(${t.id})">
        ${isPub ? '🔒 Natijalarni yashirish' : '📢 Natijalarni e\'lon qilish'}
      </button>
    `;
  }

  // 4. Reset keys drawer (boshida yopiq turadi!)
  const drawer = document.getElementById('modal-test-keys-drawer');
  if (drawer) drawer.style.display = 'none';
  const btnKeys = document.getElementById('btn-toggle-test-keys');
  if (btnKeys) btnKeys.textContent = '🔑 Kalitlarni ko\'rish ▼';
}

function toggleTestKeysView() {
  const drawer = document.getElementById('modal-test-keys-drawer');
  const btn = document.getElementById('btn-toggle-test-keys');
  if (!drawer) return;
  const isHidden = drawer.style.display === 'none' || !drawer.style.display;
  if (isHidden) {
    drawer.style.display = 'block';
    if (btn) btn.textContent = '🔒 Kalitlarni yashirish ▲';
    if (State.currentModalTest) {
      renderTestKeysGrid(State.currentModalTest);
    }
  } else {
    drawer.style.display = 'none';
    if (btn) btn.textContent = '🔑 Kalitlarni ko\'rish ▼';
  }
}
window.toggleTestKeysView = toggleTestKeysView;

function renderTestKeysGrid(t) {
  const grid = document.getElementById('modal-test-keys-grid');
  if (!grid) return;

  let keysObj = {};
  try {
    if (typeof t.answers_json === 'string') {
      keysObj = JSON.parse(t.answers_json || '{}');
    } else if (typeof t.answers_json === 'object') {
      keysObj = t.answers_json || {};
    }
  } catch (e) {
    keysObj = {};
  }

  const keysList = [];
  const totalQ = t.total_questions || 55;
  if (totalQ === 55 || totalQ >= 45) {
    for (let i = 1; i <= 35; i++) keysList.push(String(i));
    for (let i = 36; i <= 45; i++) {
      keysList.push(`${i}a`);
      keysList.push(`${i}b`);
    }
  } else {
    for (let i = 1; i <= totalQ; i++) keysList.push(String(i));
  }

  if (Object.keys(keysObj).length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--text-muted);">Ushbu test uchun to\'g\'ri kalitlar bazada kiritilmagan.</div>';
    return;
  }

  let html = '';
  keysList.forEach(k => {
    const rawVal = keysObj[k] !== undefined ? keysObj[k] : keysObj[k.toUpperCase()];
    const val = extractKeyValue(rawVal);
    const isSpecial = k.includes('a') || k.includes('b');
    html += `
      <div class="answer-card" style="border-left: 3px solid var(--primary);">
        <div style="display:flex;justify-content:space-between;font-weight:700;">
          <span>${k}-savol</span>
          <span style="font-size:10px;color:var(--text-muted);">${isSpecial ? 'Yozma' : 'Variant'}</span>
        </div>
        <div style="font-size:13.5px;color:var(--primary);font-weight:800;font-family:var(--font-mono);margin-top:2px;">
          ${esc(val)}
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

function closeTestModal() {
  const modal = document.getElementById('test-detail-modal');
  if (modal) modal.classList.remove('open');
  State.currentModalTest = null;
}

function viewTestSubmissionsFromModal() {
  if (!State.currentModalTest) return;
  const code = State.currentModalTest.test_code;
  closeTestModal();
  switchDashboardTab('submissions');
  setTimeout(() => {
    filterSubmissionsByTest(code);
    const sel = document.getElementById('filter-test-select');
    if (sel) sel.value = String(code);
  }, 100);
}

async function toggleTestStatusFromModal(testId) {
  await toggleTestStatus(testId);
  const t = (State.tests || []).find(item => item.id == testId);
  if (t) openTestModal(testId);
}

async function toggleTestPublishFromModal(testId) {
  await toggleTestPublish(testId);
  const t = (State.tests || []).find(item => item.id == testId);
  if (t) openTestModal(testId);
}

window.openTestModal = openTestModal;
window.closeTestModal = closeTestModal;
window.viewTestSubmissionsFromModal = viewTestSubmissionsFromModal;
window.toggleTestStatusFromModal = toggleTestStatusFromModal;
window.toggleTestPublishFromModal = toggleTestPublishFromModal;

// ----------------------------------------------------
// ACTIVITY LOGS RENDERING
// ----------------------------------------------------
function renderLogs() {
  const body = document.getElementById('activity-table-body');
  if (!body) return;

  const list = State.logs || [];
  if (list.length === 0) {
    body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted);">Faolliklar jurnali bo\'sh</td></tr>';
    return;
  }

  body.innerHTML = list.map(l => {
    const un = l.username ? ` (@${esc(l.username.replace(/^@/, ''))})` : '';
    const dt = formatUzbSmartDateTime(l.time || l.time_fmt);
    return `
      <tr>
        <td>
          <div class="time-cell-wrap">
            <span class="day-chip ${dt.dayBadgeClass}">${dt.dayBadgeText}</span>
            <span class="time-str-mono">${dt.fullDate}</span>
          </div>
        </td>
        <td>
          <span class="badge badge-${l.badge_color || 'info'}">${esc(l.type || 'hodisa')}</span>
        </td>
        <td>
          <div style="font-weight:700;color:var(--text-main);">${esc(l.user_name || 'Foydalanuvchi')}</div>
          <div style="font-size:11px;color:var(--text-dim);font-weight:700;">${un} (ID: ${l.user_id})</div>
        </td>
        <td><div style="font-size:13px;color:var(--text-main);font-weight:600;">${esc(l.title || '')}</div></td>
        <td><b style="color:var(--primary);font-size:12px;">${esc(l.badge || '')}</b></td>
      </tr>
    `;
  }).join('');
}

// ----------------------------------------------------
// DATABASE & SQL CONSOLE
// ----------------------------------------------------
function renderDatabase() {
  fetchDashboardData();
}

async function runSqlConsoleQuery() {
  const input = document.getElementById('sql-query-input');
  const resContainer = document.getElementById('sql-result-container');
  if (!input || !resContainer) return;

  const q = input.value.trim();
  if (!q) return;

  resContainer.innerHTML = '<div style="color:var(--text-muted);padding:10px;">So\'rov bajarilmoqda...</div>';

  try {
    const res = await fetch('/api/dashboard/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q })
    });
    const data = await res.json();
    if (!data.success) {
      resContainer.innerHTML = `<div style="color:var(--danger);padding:10px;font-family:var(--font-mono);background:rgba(239,68,68,0.1);border-radius:6px;">Xatolik: ${esc(data.error || 'Noma\'lum xatolik')}</div>`;
      return;
    }

    const rows = data.rows || [];
    if (rows.length === 0) {
      resContainer.innerHTML = '<div style="color:var(--text-muted);padding:10px;">Natija topilmadi (0 qator).</div>';
      return;
    }

    const cols = Object.keys(rows[0]);
    let tableHtml = `
      <div style="margin-bottom:8px;font-size:12px;color:var(--text-muted);">Qaytarildi: <b>${rows.length} ta qator</b></div>
      <table class="mac-table" style="font-size:12px;">
        <thead>
          <tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(r => `<tr>${cols.map(c => `<td style="font-family:var(--font-mono);">${esc(String(r[c] !== null ? r[c] : 'NULL'))}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    `;
    resContainer.innerHTML = tableHtml;
  } catch (e) {
    resContainer.innerHTML = `<div style="color:var(--danger);padding:10px;">Server xatosi: ${esc(String(e))}</div>`;
  }
}

// ----------------------------------------------------
// SUBMISSION DETAILS MODAL
// ----------------------------------------------------
async function openSubmissionModal(subId) {
  const modal = document.getElementById('submission-modal');
  if (!modal) return;
  modal.classList.add('open');

  document.getElementById('modal-sub-title').textContent = 'Yuklanmoqda...';
  document.getElementById('modal-sub-answers-grid').innerHTML = '<div style="color:var(--text-muted);padding:20px;">Yuklanmoqda...</div>';

  try {
    const res = await fetch(`/api/dashboard/submission/${subId}`);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const s = data.submission;
    State.currentModalSubmission = s;

    const un = s.username ? ` (@${esc(s.username.replace(/^@/, ''))})` : '';
    const dt = formatUzbSmartDateTime(s.submitted_at || s.submitted_at_fmt);
    document.getElementById('modal-sub-time').innerHTML = `Topshirilgan vaqt: <b style="color:var(--text-main);">${dt.fullDate}</b> <span class="day-chip ${dt.dayBadgeClass}" style="margin-left:6px;">${dt.dayBadgeText}</span>`;
    document.getElementById('modal-sub-score').textContent = `${s.score || 0} ball`;
    document.getElementById('modal-sub-correct').textContent = `${s.correct_count || 0} / ${s.total_count || 55}`;
    document.getElementById('modal-sub-grade').textContent = s.grade || '—';

    // Late badge & Late decision box
    const lateBadgeEl = document.getElementById('modal-sub-late-badge');
    const lateBox = document.getElementById('modal-sub-late-box');
    if (s.is_late == 1) {
      lateBadgeEl.innerHTML = '<span class="badge badge-warning">⏰ Kechikkan</span>';
      if (lateBox) lateBox.style.display = 'block';
    } else {
      lateBadgeEl.innerHTML = '<span class="badge badge-success">✅ O\'z vaqtida</span>';
      if (lateBox) lateBox.style.display = 'none';
    }

    // Question-by-question breakdown
    renderSubmissionAnswersGrid(s);
  } catch (err) {
    document.getElementById('modal-sub-answers-grid').innerHTML = `<div style="color:var(--danger);padding:20px;">Xatolik: ${esc(String(err))}</div>`;
  }
}

function renderSubmissionAnswersGrid(s) {
  const grid = document.getElementById('modal-sub-answers-grid');
  if (!grid) return;

  const details = s.details || {};
  const userAnswers = s.answers || {};

  // Build list of keys: 1..35, 36a..45b
  const keys = [];
  for (let i = 1; i <= 35; i++) keys.push(String(i));
  for (let i = 36; i <= 45; i++) {
    keys.push(`${i}a`);
    keys.push(`${i}b`);
  }

  let html = '';
  keys.forEach(k => {
    const qInfo = details[k] || {};
    const uVal = qInfo.user !== undefined ? qInfo.user : (userAnswers[k] || '');
    const cVal = qInfo.correct !== undefined ? qInfo.correct : '';
    const status = qInfo.status || (uVal ? 'incorrect' : 'unanswered');

    let statusClass = 'unanswered';
    let statusLabel = '—';
    if (status === 'correct') {
      statusClass = 'correct';
      statusLabel = '✓ To\'g\'ri';
    } else if (status === 'partial') {
      statusClass = 'partial';
      statusLabel = '⚠️ Qisman (30%)';
    } else if (status === 'incorrect') {
      statusClass = 'incorrect';
      statusLabel = '✗ Noto\'g\'ri';
    }

    const scoreBadge = (status === 'partial') ? `
      <div style="font-size:10px;color:#f59e0b;font-weight:700;margin-top:2px;">
        Ball: ${qInfo.score !== undefined ? qInfo.score : '0.45'} / ${qInfo.max_score || '1.5'} (Oxirgacha hisoblanmagan)
      </div>` : '';

    html += `
      <div class="answer-card ${statusClass}">
        <div style="display:flex;justify-content:space-between;font-weight:700;">
          <span>${k}-savol</span>
          <span style="font-size:10px;">${statusLabel}</span>
        </div>
        <div style="font-size:11.5px;color:var(--text-main);">
          Javob: <b>${esc(uVal || 'Belgilanmagan')}</b>
        </div>
        <div style="font-size:10.5px;color:var(--text-muted);">
          Kalit: <span style="color:var(--primary);font-weight:700;">${esc(cVal || '—')}</span>
        </div>
        ${scoreBadge}
      </div>
    `;
  });

  grid.innerHTML = html;
}

function closeSubmissionModal() {
  const modal = document.getElementById('submission-modal');
  if (modal) modal.classList.remove('open');
  State.currentModalSubmission = null;
}

async function handleModalLateAction(action) {
  if (!State.currentModalSubmission) return;
  const subId = State.currentModalSubmission.id;

  try {
    const res = await fetch('/api/dashboard/late-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_id: subId, action: action })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Muvaffaqiyatli bajarildi', 'success');
      closeSubmissionModal();
      fetchDashboardData();
    } else {
      showToast(data.error || 'Xatolik', 'danger');
    }
  } catch (e) {
    showToast('Server bilan bog\'lanishda xatolik', 'danger');
  }
}

// ----------------------------------------------------
// ACTIONS (USER, TEST)
// ----------------------------------------------------
async function changeUserStatus(userId, action) {
  const confirmMsg = action === 'delete' 
    ? 'Haqiqatan ham bu foydalanuvchini bazadan butunlay o\'chirmoqchimisiz?' 
    : (action === 'block' ? 'Foydalanuvchini bloklamoqchimisiz?' : 'Foydalanuvchini tasdiqlaysizmi?');

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch('/api/dashboard/user-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, action: action })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      fetchUsersData();
      fetchDashboardData();
    } else {
      showToast(data.error || 'Xatolik', 'danger');
    }
  } catch (e) {
    showToast('Xatolik yuz berdi', 'danger');
  }
}

async function toggleTestStatus(testId) {
  try {
    const res = await fetch('/api/dashboard/test-toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test_id: testId })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      fetchTestsData();
      fetchDashboardData();
    }
  } catch (e) {
    showToast('Xatolik', 'danger');
  }
}

async function toggleTestPublish(testId) {
  try {
    const res = await fetch('/api/dashboard/test-publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test_id: testId })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      fetchTestsData();
      fetchDashboardData();
    }
  } catch (e) {
    showToast('Xatolik', 'danger');
  }
}

// ----------------------------------------------------
// CSV EXPORT
// ----------------------------------------------------
function exportCurrentTable() {
  if (State.activeTab === 'submissions') {
    exportSubmissionsToCSV();
  } else if (State.activeTab === 'users') {
    exportUsersToCSV();
  } else {
    showToast('Hozirgi bo\'lim eksportini tanlash uchun Natijalar yoki Foydalanuvchilar bo\'limiga o\'ting.', 'info');
  }
}

function exportSubmissionsToCSV() {
  if (!State.submissions || State.submissions.length === 0) {
    showToast('Eksport qilish uchun natijalar yo\'q', 'warning');
    return;
  }
  let csv = 'ID,Foydalanuvchi,Username,Telefon,Test Kodi,Topshirilgan Vaqt,Togri Javoblar,Jami Savollar,Ball,Daraja,Kechikkan\n';
  State.submissions.forEach(s => {
    const fn = (s.fullname || '').replace(/,/g, ' ');
    const un = (s.username || '').replace(/,/g, ' ');
    const ph = (s.phone || '').replace(/,/g, ' ');
    csv += `${s.id},"${fn}","${un}","${ph}",#${s.test_code},"${s.submitted_at_fmt || ''}",${s.correct_count || 0},${s.total_count || 55},${s.score || 0},"${s.grade || ''}",${s.is_late == 1 ? 'HA' : 'YOQ'}\n`;
  });
  downloadFile(csv, `natijalar_baza_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  showToast('Natijalar CSV fayli yuklab olindi! 📥', 'success');
}

function exportUsersToCSV() {
  if (!State.users || State.users.length === 0) {
    showToast('Eksport qilish uchun foydalanuvchilar yo\'q', 'warning');
    return;
  }
  let csv = 'Telegram ID,Foydalanuvchi Ismi,Username,Telefon,Holati,Qoshilgan Vaqt,Testlar Soni\n';
  State.users.forEach(u => {
    const fn = (u.fullname || '').replace(/,/g, ' ');
    const un = (u.username || '').replace(/,/g, ' ');
    const ph = (u.phone || '').replace(/,/g, ' ');
    csv += `${u.tg_id},"${fn}","${un}","${ph}","${u.status || ''}","${u.registered_at_fmt || ''}",${u.tests_count || 0}\n`;
  });
  downloadFile(csv, `foydalanuvchilar_baza_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  showToast('Foydalanuvchilar CSV fayli yuklab olindi! 📥', 'success');
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------
// AUTO-REFRESH & THEME & SHORTCUTS
// ----------------------------------------------------
function toggleAutoRefresh() {
  State.autoRefresh = !State.autoRefresh;
  const label = document.getElementById('refresh-label');
  const icon = document.getElementById('refresh-icon');
  if (State.autoRefresh) {
    startAutoRefresh();
    if (label) label.textContent = 'Jonli (10s)';
    if (icon) icon.textContent = '⚡️';
    showToast('Avtomatik yangilanish yoqildi (har 10s)', 'success');
  } else {
    stopAutoRefresh();
    if (label) label.textContent = 'To\'xtatilgan';
    if (icon) icon.textContent = '⏸';
    showToast('Avtomatik yangilanish to\'xtatildi', 'info');
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  State.refreshTimer = setInterval(() => {
    if (State.autoRefresh) {
      fetchDashboardData();
    }
  }, 10000);
}

function stopAutoRefresh() {
  if (State.refreshTimer) {
    clearInterval(State.refreshTimer);
    State.refreshTimer = null;
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const cur = html.getAttribute('data-theme') || 'dark';
  const nxt = cur === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', nxt);
  document.getElementById('btn-theme-toggle').textContent = nxt === 'dark' ? '🌙' : '☀️';
  showToast(`Rejim o'zgartirildi: ${nxt === 'dark' ? 'Qorong\'u' : 'Yorug'}`, 'info');
}

function handleGlobalSearch(val) {
  State.globalSearch = val || '';
  if (State.activeTab === 'submissions') renderSubmissions();
  else if (State.activeTab === 'users') renderUsers();
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Cmd+K or Ctrl+K to focus search
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const inp = document.getElementById('global-search-input');
      if (inp) {
        inp.focus();
        inp.select();
      }
    }
    // Cmd+R to refresh data
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      fetchDashboardData(true);
    }
    // Escape to close modals
    if (e.key === 'Escape') {
      closeSubmissionModal();
    }
    // Cmd+1..6 tab switching
    if ((e.metaKey || e.ctrlKey) && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
      e.preventDefault();
      const tabs = ['overview', 'submissions', 'users', 'tests', 'activity', 'database'];
      const idx = parseInt(e.key) - 1;
      if (tabs[idx]) switchDashboardTab(tabs[idx]);
    }
  });
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function closeDashboardWindow() {
  if (confirm('Boshqaruv panelini yopmoqchimisiz?')) {
    window.close();
  }
}

function minimizeDashboardWindow() {
  showToast('MacBook oynasi kichraytirildi (Dock rejimi)', 'info');
}

// ----------------------------------------------------
// TOAST NOTIFICATIONS
// ----------------------------------------------------
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const t = document.createElement('div');
  t.className = 'mac-toast';
  
  let icon = 'ℹ️';
  let color = 'var(--info)';
  if (type === 'success') { icon = '✅'; color = 'var(--success)'; }
  else if (type === 'danger') { icon = '🚫'; color = 'var(--danger)'; }
  else if (type === 'warning') { icon = '⚠️'; color = 'var(--warning)'; }

  t.style.borderLeft = `4px solid ${color}`;
  t.innerHTML = `<span style="font-size:16px;">${icon}</span><span style="flex:1;">${esc(msg)}</span>`;
  container.appendChild(t);

  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(10px)';
    t.style.transition = 'all 0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, 3200);
}

// Helper: Escape HTML
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ====================================================
// SUBMISSION CANCELLATION (JAVOBNI BEKOR QILISH)
// 1. Javobni qabul qilmaslik (reject)
// 2. Qayta topshirish (allow_retake)
// ====================================================
let cancelModalSub = null;
let selectedCancelActionType = null;

function openCancelSubModalById(subId) {
  const s = (State.submissions || []).find(x => Number(x.id) === Number(subId)) ||
            (State.overviewSubmissions || []).find(x => Number(x.id) === Number(subId)) ||
            (State.currentModalSubmission && Number(State.currentModalSubmission.id) === Number(subId) ? State.currentModalSubmission : null);

  if (!s) {
    fetch(`/api/dashboard/submission/${subId}`)
      .then(r => r.json())
      .then(d => {
        if (d && d.submission) {
          openCancelSubModalWithData(d.submission);
        } else {
          showToast('Natija topilmadi', 'danger');
        }
      })
      .catch(e => showToast('Xatolik: ' + e, 'danger'));
    return;
  }
  openCancelSubModalWithData(s);
}
window.openCancelSubModalById = openCancelSubModalById;

function promptCancelCurrentModalSubmission() {
  if (State.currentModalSubmission) {
    openCancelSubModalWithData(State.currentModalSubmission);
  } else {
    showToast('Natija ma\'lumotlari yuklanmagan', 'warning');
  }
}
window.promptCancelCurrentModalSubmission = promptCancelCurrentModalSubmission;

function openCancelSubModalWithData(sub) {
  cancelModalSub = sub;
  selectedCancelActionType = null;

  const infoEl = document.getElementById('cancel-sub-user-info');
  if (infoEl) {
    const un = sub.username ? ` (@${sub.username.replace(/^@/, '')})` : '';
    infoEl.innerHTML = `<b style="color:var(--text-main);">${esc(sub.fullname || 'Foydalanuvchi')}</b> (ID: ${sub.user_tg_id})${un} • Test #${esc(sub.test_code || '')}`;
  }

  // Show Step 1, hide Step 2
  backToCancelStep1();

  const modal = document.getElementById('cancel-sub-modal');
  if (modal) modal.classList.add('open');
}

function closeCancelSubModal() {
  const modal = document.getElementById('cancel-sub-modal');
  if (modal) modal.classList.remove('open');
  cancelModalSub = null;
  selectedCancelActionType = null;
}
window.closeCancelSubModal = closeCancelSubModal;

function selectCancelAction(actionType) {
  if (!cancelModalSub) return;
  selectedCancelActionType = actionType;

  const step1 = document.getElementById('cancel-sub-step-1');
  const step2 = document.getElementById('cancel-sub-step-2');
  const confirmActions = document.getElementById('cancel-sub-confirm-actions');
  const titleEl = document.getElementById('cancel-sub-confirm-title');
  const descEl = document.getElementById('cancel-sub-confirm-desc');
  const btnExec = document.getElementById('btn-confirm-cancel-exec');

  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'block';
  if (confirmActions) confirmActions.style.display = 'flex';

  const fn = esc(cancelModalSub.fullname || 'Foydalanuvchi');
  const tc = esc(cancelModalSub.test_code || '');

  if (actionType === 'reject') {
    if (titleEl) {
      titleEl.innerHTML = '⚠️ Javobni qabul qilmaslikni tasdiqlaysizmi?';
      titleEl.style.color = '#EF4444';
    }
    if (descEl) {
      descEl.innerHTML = `Haqiqatan ham <b>${fn}</b> ning #${tc} test bo'yicha topshirgan javoblarini <b>qabul qilmaslikni (rad etishni)</b> tasdiqlaysizmi?<br><br>• Natija bekor qilinadi va hisobga olinmaydi.<br>• O'quvchi testni qayta topshira olmaydi.<br>• O'quvchining shaxsiy Telegramiga xabar yuboriladi.`;
    }
    if (btnExec) {
      btnExec.textContent = 'Ha, qabul qilinmasin (Rad etish)';
      btnExec.className = 'btn btn-danger';
    }
  } else if (actionType === 'allow_retake') {
    if (titleEl) {
      titleEl.innerHTML = '🔄 Qayta topshirishga ruxsat berishni tasdiqlaysizmi?';
      titleEl.style.color = '#2563EB';
    }
    if (descEl) {
      descEl.innerHTML = `Haqiqatan ham <b>${fn}</b> ga #${tc} testni <b>qaytadan topshirishga</b> ruxsat berishni tasdiqlaysizmi?<br><br>• Avvalgi topshirgan natijasi bazadan butunlay o'chiriladi.<br>• O'quvchi bot orqali testni qaytadan boshidan ishlashi mumkin bo'ladi.<br>• O'quvchining shaxsiy Telegramiga testni qayta topshirishi mumkinligi haqida xabar boradi.`;
    }
    if (btnExec) {
      btnExec.textContent = 'Ha, qayta topshirishga ruxsat';
      btnExec.className = 'btn btn-primary';
    }
  }
}
window.selectCancelAction = selectCancelAction;

function backToCancelStep1() {
  selectedCancelActionType = null;
  const step1 = document.getElementById('cancel-sub-step-1');
  const step2 = document.getElementById('cancel-sub-step-2');
  const confirmActions = document.getElementById('cancel-sub-confirm-actions');

  if (step1) step1.style.display = 'block';
  if (step2) step2.style.display = 'none';
  if (confirmActions) confirmActions.style.display = 'none';
}
window.backToCancelStep1 = backToCancelStep1;

async function executeCancelSubmission() {
  if (!cancelModalSub || !selectedCancelActionType) return;

  const btnExec = document.getElementById('btn-confirm-cancel-exec');
  if (btnExec) {
    btnExec.disabled = true;
    btnExec.textContent = 'Bajarilmoqda...';
  }

  try {
    const res = await fetch('/api/dashboard/submissions/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission_id: cancelModalSub.id,
        action: selectedCancelActionType
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Xatolik yuz berdi');
    }

    showToast(data.message || 'Muvaffaqiyatli bajarildi!', 'success');
    closeCancelSubModal();
    closeSubmissionModal();

    // Reload submissions and overview
    if (typeof loadSubmissions === 'function') loadSubmissions();
    if (typeof loadOverview === 'function') loadOverview();
  } catch (err) {
    showToast(String(err.message || err), 'danger');
  } finally {
    if (btnExec) {
      btnExec.disabled = false;
      btnExec.textContent = 'Ha, tasdiqlayman';
    }
  }
}
window.executeCancelSubmission = executeCancelSubmission;

