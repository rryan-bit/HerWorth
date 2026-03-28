/* =============================================
   HERWORTH — CALENDAR JS
   ============================================= */

let calYear, calMonth, selectedDateStr = null, miniChart = null;
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

document.addEventListener('DOMContentLoaded', async () => {
  const now = new Date();
  calYear = now.getFullYear(); calMonth = now.getMonth();
  document.getElementById('calPrevMonth').addEventListener('click', () => changeCalMonth(-1));
  document.getElementById('calNextMonth').addEventListener('click', () => changeCalMonth(1));
  // Set today as default date for add expense
  document.getElementById('calExpDate').value = now.toISOString().split('T')[0];
  document.getElementById('recStartDate').value = now.toISOString().split('T')[0];
  await renderAll();
});

async function renderAll() {
  const expenses  = await getExpenses();
  const recurring = await getRecurring();
  renderCalHeader();
  renderCalGrid(expenses, recurring);
  renderSummary(expenses, recurring);
  renderUpcomingRecurring(recurring);
  renderRecurringList(recurring);
  renderMiniTrend(expenses);
  if (selectedDateStr) renderDayPanel(selectedDateStr, expenses, recurring);
}

function renderCalHeader() {
  document.getElementById('calMonthName').textContent = MONTHS[calMonth];
  document.getElementById('calMonthYear').textContent = calYear;
}

function renderCalGrid(expenses, recurring) {
  const grid = document.getElementById('calGridMain');
  grid.innerHTML = '';
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrev  = new Date(calYear, calMonth, 0).getDate();

  // Build lookup: date -> {expTotal, hasRecurring}
  const lookup = buildDateLookup(expenses, recurring, calYear, calMonth);

  // Prev month fillers
  for (let i = firstDay - 1; i >= 0; i--) {
    const cell = makeCell(daysInPrev - i, true, false, null, null);
    grid.appendChild(cell);
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = ds === today;
    const isSelected = ds === selectedDateStr;
    const info = lookup[ds] || { expTotal: 0, hasExpense: false, hasRecurring: false };
    const cell = makeCell(d, false, isToday, isSelected, info, ds);
    cell.addEventListener('click', () => selectDay(ds));
    grid.appendChild(cell);
  }
  // Next month fillers
  const total = firstDay + daysInMonth;
  const rem = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= rem; d++) makeCell(d, true, false, null, null, null, grid);
}

function makeCell(day, otherMonth, isToday, isSelected, info, dateStr) {
  const cell = document.createElement('div');
  cell.className = 'cal-cell' + (otherMonth ? ' other-month' : '') + (isToday ? ' today' : '') + (isSelected ? ' selected' : '');

  const dayEl = document.createElement('div');
  dayEl.className = 'cal-cell-day';
  dayEl.textContent = day;
  cell.appendChild(dayEl);

  if (info && (info.hasExpense || info.hasRecurring)) {
    if (info.expTotal > 0) {
      const amtEl = document.createElement('div');
      amtEl.className = 'cal-cell-amount';
      amtEl.textContent = formatCurrency(info.expTotal);
      cell.appendChild(amtEl);
    }
    const dots = document.createElement('div');
    dots.className = 'cal-cell-dots';
    if (info.hasExpense && info.hasRecurring) {
      const d = document.createElement('span'); d.className = 'cal-dot cal-dot--both'; dots.appendChild(d);
    } else if (info.hasExpense) {
      const d = document.createElement('span'); d.className = 'cal-dot cal-dot--expense'; dots.appendChild(d);
    } else {
      const d = document.createElement('span'); d.className = 'cal-dot cal-dot--recurring'; dots.appendChild(d);
    }
    cell.appendChild(dots);
  }
  return cell;
}

function buildDateLookup(expenses, recurring, year, month) {
  const lookup = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Regular expenses
  expenses.forEach(e => {
    if (!e.date) return;
    const [ey, em] = e.date.split('-').map(Number);
    if (ey === year && em - 1 === month) {
      if (!lookup[e.date]) lookup[e.date] = { expTotal: 0, hasExpense: false, hasRecurring: false };
      lookup[e.date].expTotal += parseFloat(e.amount || 0);
      lookup[e.date].hasExpense = true;
    }
  });

  // Recurring occurrences in this month
  recurring.forEach(r => {
    if (!r.active) return;
    const dates = getRecurringDatesInMonth(r, year, month);
    dates.forEach(ds => {
      if (!lookup[ds]) lookup[ds] = { expTotal: 0, hasExpense: false, hasRecurring: false };
      lookup[ds].hasRecurring = true;
    });
  });
  return lookup;
}

function getRecurringDatesInMonth(r, year, month) {
  const dates = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  if (r.frequency === 'monthly') {
    const dom = Math.min(parseInt(r.dayOfMonth || 1), daysInMonth);
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(dom).padStart(2,'0')}`;
    if (!r.startDate || ds >= r.startDate) dates.push(ds);
  } else if (r.frequency === 'weekly') {
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      const ds = dt.toISOString().split('T')[0];
      const start = r.startDate ? new Date(r.startDate) : new Date(year, month, 1);
      const diff = (dt - start) / (1000*60*60*24);
      if (diff >= 0 && diff % 7 === 0) dates.push(ds);
    }
  } else if (r.frequency === 'daily') {
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      dates.push(ds);
    }
  } else if (r.frequency === 'yearly') {
    if (r.startDate) {
      const [sy, sm, sd] = r.startDate.split('-');
      if (parseInt(sm) - 1 === month) {
        const ds = `${year}-${sm}-${sd}`;
        dates.push(ds);
      }
    }
  } else if (r.frequency === 'custom' && r.customDays) {
    const start = r.startDate ? new Date(r.startDate) : new Date(year, month, 1);
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      const diff = (dt - start) / (1000*60*60*24);
      if (diff >= 0 && diff % parseInt(r.customDays) === 0) dates.push(dt.toISOString().split('T')[0]);
    }
  }
  return dates;
}

function selectDay(ds) {
  selectedDateStr = ds;
  renderAll();
  document.getElementById('calDayPanel').style.display = 'block';
  document.getElementById('calExpDate').value = ds;
}

function renderDayPanel(ds, expenses, recurring) {
  const panel = document.getElementById('calDayPanel');
  const content = document.getElementById('calDayContent');
  const d = new Date(ds + 'T00:00:00');
  document.getElementById('calDayTitle').textContent = d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });

  const dayExp = expenses.filter(e => e.date === ds);
  const dayRec = recurring.filter(r => r.active && getRecurringDatesInMonth(r, d.getFullYear(), d.getMonth()).includes(ds));
  const allItems = [...dayExp.map(e => ({...e, isRecurring: false})), ...dayRec.map(r => ({...r, isRecurring: true}))];

  if (allItems.length === 0) {
    content.innerHTML = `<div class="empty-state" style="padding:1rem;">No expenses on this day. <a href="#" class="link-soft" onclick="openAddExpenseModal('${ds}');return false;">Add one →</a></div>`;
    return;
  }

  const total = dayExp.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const recTotal = dayRec.reduce((s, r) => s + parseFloat(r.amount || 0), 0);

  content.innerHTML = allItems.map(item => `
    <div class="cal-day-item ${item.isRecurring ? 'recurring' : ''}">
      <div class="cal-day-item-icon">${getCategoryIcon(item.category)}</div>
      <div class="cal-day-item-info">
        <div class="cal-day-item-name">${item.description || item.name || item.category}</div>
        <div class="cal-day-item-cat">${item.category}${item.isRecurring ? ' · 🔁 Recurring' : ''}</div>
      </div>
      <div class="cal-day-item-amount">${item.isRecurring ? '' : '-'}${formatCurrency(item.amount)}</div>
      ${!item.isRecurring ? `<button class="tx-action-btn delete" onclick="deleteCalExpense('${item.id}')">✕</button>` : ''}
    </div>
  `).join('') + `
    <div class="cal-day-total">
      <span>Day total</span>
      <span>${formatCurrency(total + recTotal)}</span>
    </div>`;
}

async function renderSummary(expenses, recurring) {
  const now = new Date();
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
  const todayStr = now.toISOString().split('T')[0];
  const weekStr  = startOfWeek.toISOString().split('T')[0];

  const monthTotal = expenses.filter(e => {
    const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + parseFloat(e.amount), 0);

  const weekTotal = expenses.filter(e => e.date >= weekStr && e.date <= todayStr)
    .reduce((s, e) => s + parseFloat(e.amount), 0);

  const todayTotal = expenses.filter(e => e.date === todayStr)
    .reduce((s, e) => s + parseFloat(e.amount), 0);

  const recMonthly = recurring.filter(r => r.active).reduce((s, r) => {
    const a = parseFloat(r.amount || 0);
    if (r.frequency === 'monthly') return s + a;
    if (r.frequency === 'weekly') return s + a * 4.33;
    if (r.frequency === 'yearly') return s + a / 12;
    if (r.frequency === 'daily') return s + a * 30;
    return s + a;
  }, 0);

  document.getElementById('sumMonth').textContent = formatCurrency(monthTotal);
  document.getElementById('sumWeek').textContent  = formatCurrency(weekTotal);
  document.getElementById('sumToday').textContent = formatCurrency(todayTotal);
  document.getElementById('sumRecurring').textContent = formatCurrency(recMonthly);
}

function renderUpcomingRecurring(recurring) {
  const list = document.getElementById('upcomingRecurringList');
  const active = recurring.filter(r => r.active);
  if (active.length === 0) { list.innerHTML = '<div class="empty-state" style="padding:1rem;">No recurring expenses set.</div>'; return; }

  const now = new Date(); const in30 = new Date(now); in30.setDate(in30.getDate() + 30);
  const upcoming = [];
  active.forEach(r => {
    const dates = getNextNDates(r, 2);
    dates.forEach(ds => {
      const d = new Date(ds + 'T00:00:00');
      if (d >= now && d <= in30) upcoming.push({ ...r, nextDate: ds });
    });
  });
  upcoming.sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  list.innerHTML = upcoming.slice(0, 6).map(r => {
    const d = new Date(r.nextDate + 'T00:00:00');
    return `<div class="rec-upcoming-item">
      <div class="rec-date-badge">
        <div class="rec-date-day">${d.getDate()}</div>
        <div class="rec-date-mon">${SHORT_MONTHS[d.getMonth()]}</div>
      </div>
      <div class="rec-info">
        <div class="rec-name">${r.name}</div>
        <div class="rec-freq">${getCategoryIcon(r.category)} ${r.category}</div>
      </div>
      <div class="rec-amount">${formatCurrency(r.amount)}</div>
    </div>`;
  }).join('');
}

function getNextNDates(r, n) {
  const dates = [];
  const now = new Date();
  for (let m = 0; m <= 3 && dates.length < n; m++) {
    const yr = new Date(now.getFullYear(), now.getMonth() + m, 1).getFullYear();
    const mo = new Date(now.getFullYear(), now.getMonth() + m, 1).getMonth();
    const ds = getRecurringDatesInMonth(r, yr, mo);
    ds.forEach(d => { if (new Date(d+'T00:00:00') >= now && !dates.includes(d)) dates.push(d); });
  }
  return dates.slice(0, n);
}

function renderRecurringList(recurring) {
  const container = document.getElementById('recurringList');
  if (recurring.length === 0) { container.innerHTML = '<div class="empty-state">No recurring expenses yet. Click <strong>+ Add Recurring</strong> to set one up.</div>'; return; }

  const freqLabel = { daily:'Daily', weekly:'Weekly', monthly:'Monthly', yearly:'Yearly', custom:'Custom' };
  container.innerHTML = `<table class="recurring-table">
    <thead><tr><th>Name</th><th>Category</th><th>Amount</th><th>Frequency</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>` +
    recurring.map(r => `<tr>
      <td><strong>${r.name}</strong></td>
      <td>${getCategoryIcon(r.category)} ${r.category}</td>
      <td><strong>${formatCurrency(r.amount)}</strong></td>
      <td>${freqLabel[r.frequency] || r.frequency}</td>
      <td><span class="rec-status ${r.active ? 'active' : 'paused'}">${r.active ? '● Active' : '○ Paused'}</span></td>
      <td><div class="rec-actions">
        <button class="btn-outline btn-sm" onclick="editRecurring('${r.id}')">Edit</button>
        <button class="btn-outline btn-sm" onclick="toggleRecurring('${r.id}')">${r.active ? 'Pause' : 'Resume'}</button>
        <button class="btn-danger btn-sm" onclick="deleteRecurring('${r.id}')">Remove</button>
      </div></td>
    </tr>`).join('') +
    '</tbody></table>';
}

function renderMiniTrend(expenses) {
  const ctx = document.getElementById('miniTrendChart')?.getContext('2d');
  if (!ctx) return;
  if (miniChart) miniChart.destroy();

  const now = new Date(); const labels = [], data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-AU', { weekday: 'short' }));
    const ds = d.toISOString().split('T')[0];
    data.push(expenses.filter(e => e.date === ds).reduce((s, e) => s + parseFloat(e.amount), 0));
  }
  const isDark = document.body.classList.contains('dark');
  miniChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ data, backgroundColor: 'rgba(248,200,220,0.7)', borderColor: '#c4637a', borderWidth: 1.5, borderRadius: 4 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => '$'+c.parsed.y.toFixed(2) } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: isDark ? '#b8b0c0' : '#6b6b7a', font: { family:'DM Sans', size:10 } } },
        y: { grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, ticks: { color: isDark ? '#b8b0c0' : '#6b6b7a', font: { family:'DM Sans', size:10 }, callback: v => '$'+v } }
      }
    }
  });
}

/* ---- NAVIGATION ---- */
async function changeCalMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  selectedDateStr = null;
  document.getElementById('calDayPanel').style.display = 'none';
  await renderAll();
}
async function goToToday() {
  const now = new Date(); calYear = now.getFullYear(); calMonth = now.getMonth();
  await renderAll();
}

/* ---- ADD EXPENSE ---- */
function openAddExpenseModal(ds) {
  document.getElementById('addExpenseModal').style.display = 'flex';
  document.getElementById('calExpDate').value = ds || selectedDateStr || new Date().toISOString().split('T')[0];
  document.getElementById('calExpAmount').value = '';
  document.getElementById('calExpCategory').value = '';
  document.getElementById('calExpDesc').value = '';
  ['calExpAmountErr','calExpCategoryErr','calExpDateErr'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=''; });
}

async function saveCalExpense() {
  const amount = parseFloat(document.getElementById('calExpAmount')?.value);
  const catRaw  = document.getElementById('calExpCategory')?.value;
  const category = catRaw?.replace(/^[^\s]+ /, ''); // strip emoji
  const description = document.getElementById('calExpDesc')?.value.trim();
  const date = document.getElementById('calExpDate')?.value;
  let valid = true;
  if (!amount || amount <= 0) { document.getElementById('calExpAmountErr').textContent='Enter a valid amount.'; valid=false; }
  if (!catRaw) { document.getElementById('calExpCategoryErr').textContent='Select a category.'; valid=false; }
  if (!date) { document.getElementById('calExpDateErr').textContent='Select a date.'; valid=false; }
  if (!valid) return;

  const expenses = await getExpenses();
  expenses.push({ id:'exp_'+Date.now(), amount:amount.toFixed(2), category, description, date, createdAt:new Date().toISOString() });
  await saveExpenses(expenses);
  document.getElementById('addExpenseModal').style.display = 'none';
  selectedDateStr = date;
  showToast('Expense added!');
  await renderAll();
}

async function deleteCalExpense(id) {
  const expenses = (await getExpenses()).filter(e => e.id !== id);
  await saveExpenses(expenses);
  showToast('Expense removed.', 'error');
  await renderAll();
}

/* ---- RECURRING ---- */
function updateFreqFields() {
  const freq = document.getElementById('recFrequency').value;
  document.getElementById('recDomGroup').style.display = freq === 'monthly' ? 'block' : 'none';
  document.getElementById('recCustomGroup').style.display = freq === 'custom' ? 'block' : 'none';
}

function openRecurringModal() {
  document.getElementById('recurringModal').style.display = 'flex';
  document.getElementById('recurringModalTitle').textContent = 'Add Recurring Expense';
  document.getElementById('editRecurringId').value = '';
  document.getElementById('recName').value = '';
  document.getElementById('recAmount').value = '';
  document.getElementById('recCategory').value = 'Bills';
  document.getElementById('recFrequency').value = 'monthly';
  document.getElementById('recDayOfMonth').value = '1';
  document.getElementById('recStartDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('recDomGroup').style.display = 'block';
  document.getElementById('recCustomGroup').style.display = 'none';
  ['recNameErr','recAmountErr'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=''; });
}

async function editRecurring(id) {
  const r = (await getRecurring()).find(x => x.id === id);
  if (!r) return;
  document.getElementById('recurringModal').style.display = 'flex';
  document.getElementById('recurringModalTitle').textContent = 'Edit Recurring Expense';
  document.getElementById('editRecurringId').value = r.id;
  document.getElementById('recName').value = r.name;
  document.getElementById('recAmount').value = r.amount;
  document.getElementById('recCategory').value = r.category;
  document.getElementById('recFrequency').value = r.frequency;
  document.getElementById('recDayOfMonth').value = r.dayOfMonth || 1;
  document.getElementById('recStartDate').value = r.startDate || '';
  if (r.customDays) document.getElementById('recCustomDays').value = r.customDays;
  updateFreqFields();
}

async function saveRecurringExpense() {
  const editId = document.getElementById('editRecurringId').value;
  const name = document.getElementById('recName').value.trim();
  const amount = parseFloat(document.getElementById('recAmount').value);
  const category = document.getElementById('recCategory').value;
  const frequency = document.getElementById('recFrequency').value;
  const dayOfMonth = parseInt(document.getElementById('recDayOfMonth').value) || 1;
  const customDays = parseInt(document.getElementById('recCustomDays').value) || null;
  const startDate  = document.getElementById('recStartDate').value;
  let valid = true;
  document.getElementById('recNameErr').textContent = '';
  document.getElementById('recAmountErr').textContent = '';
  if (!name) { document.getElementById('recNameErr').textContent='Name required.'; valid=false; }
  if (!amount||amount<=0) { document.getElementById('recAmountErr').textContent='Enter a valid amount.'; valid=false; }
  if (!valid) return;

  const nextDate = getNextOccurrence({ frequency, dayOfMonth, startDate, customDays });
  let recurring = await getRecurring();
  if (editId) {
    recurring = recurring.map(r => r.id===editId ? {...r,name,amount:amount.toFixed(2),category,frequency,dayOfMonth,customDays,startDate,nextDate,active:r.active} : r);
    showToast('Recurring expense updated!');
  } else {
    recurring.push({ id:'rec_'+Date.now(), name, amount:amount.toFixed(2), category, frequency, dayOfMonth, customDays, startDate, nextDate, active:true });
    showToast('Recurring expense added!');
  }
  await saveRecurring(recurring);
  document.getElementById('recurringModal').style.display = 'none';
  await renderAll();
}

function getNextOccurrence(r) {
  const now = new Date();
  if (r.frequency === 'monthly') {
    let d = new Date(now.getFullYear(), now.getMonth(), r.dayOfMonth || 1);
    if (d <= now) d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  }
  if (r.frequency === 'weekly') {
    const d = new Date(now); d.setDate(d.getDate() + (7 - d.getDay()));
    return d.toISOString().split('T')[0];
  }
  return r.startDate || now.toISOString().split('T')[0];
}

async function toggleRecurring(id) {
  let recurring = await getRecurring();
  recurring = recurring.map(r => r.id===id ? {...r, active:!r.active} : r);
  await saveRecurring(recurring);
  showToast('Updated.');
  await renderAll();
}

async function deleteRecurring(id) {
  if (!confirm('Remove this recurring expense?')) return;
  await saveRecurring((await getRecurring()).filter(r => r.id !== id));
  showToast('Removed.', 'error');
  await renderAll();
}
