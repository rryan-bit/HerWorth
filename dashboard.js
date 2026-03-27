/* =============================================
   HERWORTH — DASHBOARD JS
   ============================================= */

let lineChartInstance = null;
let pieChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});

function loadDashboard() {
  const expenses = getExpenses();
  const accounts = getAccounts();
  const budgets = getBudgets();
  const goals = getGoals();

  // Calculate stats
  const totalBalance = accounts.reduce((s, a) => s + parseFloat(a.balance || 0), 0);
  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = expenses.filter(e => {
    const d = new Date(e.date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });

  const monthlySpend = thisMonth.reduce((s, e) => s + parseFloat(e.amount), 0);
  const lastMonthSpend = lastMonth.reduce((s, e) => s + parseFloat(e.amount), 0);
  const topGoal = goals[0];
  const totalSaved = goals.reduce((s, g) => s + parseFloat(g.saved || 0), 0);

  // Update stat cards
  document.getElementById('statBalance').textContent = formatCurrency(totalBalance);
  document.getElementById('statSpending').textContent = formatCurrency(monthlySpend);

  const spendChange = lastMonthSpend ? ((monthlySpend - lastMonthSpend) / lastMonthSpend * 100) : 0;
  const changeEl = document.getElementById('statSpendingChange');
  changeEl.textContent = (spendChange >= 0 ? '↑ ' : '↓ ') + Math.abs(spendChange).toFixed(0) + '% vs last month';
  changeEl.className = 'stat-change ' + (spendChange > 0 ? 'negative' : 'positive');

  document.getElementById('statBalanceChange').textContent = accounts.length + ' account' + (accounts.length !== 1 ? 's' : '');
  document.getElementById('statSavings').textContent = formatCurrency(totalSaved);
  document.getElementById('statSavingsSub').textContent = goals.length ? `across ${goals.length} goal${goals.length !== 1 ? 's' : ''}` : 'No goals yet';
  document.getElementById('statTxCount').textContent = thisMonth.length;

  renderLineChart(expenses, 'week');
  renderPieChart(expenses);
  renderRecentTx(expenses);
  renderBudgetAlerts(budgets, expenses);
}

function renderLineChart(expenses, period) {
  const ctx = document.getElementById('lineChart')?.getContext('2d');
  if (!ctx) return;
  if (lineChartInstance) lineChartInstance.destroy();

  const now = new Date();
  let labels = [], data = [];

  if (period === 'week') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-AU', { weekday: 'short' }));
      const dayStr = d.toISOString().split('T')[0];
      const total = expenses.filter(e => e.date === dayStr).reduce((s, e) => s + parseFloat(e.amount), 0);
      data.push(total);
    }
  } else if (period === 'month') {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      labels.push(d);
      const dayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const total = expenses.filter(e => e.date === dayStr).reduce((s, e) => s + parseFloat(e.amount), 0);
      data.push(total);
    }
  } else {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let m = 0; m < 12; m++) {
      labels.push(months[m]);
      const total = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === m;
      }).reduce((s, e) => s + parseFloat(e.amount), 0);
      data.push(total);
    }
  }

  const isDark = document.body.classList.contains('dark');
  const textColor = isDark ? '#b8b0c0' : '#6b6b7a';

  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Spending',
        data,
        borderColor: '#c4637a',
        backgroundColor: 'rgba(248,200,220,0.2)',
        borderWidth: 2.5,
        pointBackgroundColor: '#c4637a',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => '$' + ctx.parsed.y.toFixed(2) } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'DM Sans', size: 11 } } },
        y: { grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }, ticks: { color: textColor, font: { family: 'DM Sans', size: 11 }, callback: v => '$' + v } }
      }
    }
  });
}

function renderPieChart(expenses) {
  const ctx = document.getElementById('pieChart')?.getContext('2d');
  if (!ctx) return;
  if (pieChartInstance) pieChartInstance.destroy();

  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const catMap = {};
  thisMonth.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + parseFloat(e.amount); });
  const cats = Object.keys(catMap);
  const vals = cats.map(c => catMap[c]);

  const colors = ['#f8c8dc','#e8a0bd','#c4637a','#a84d64','#d4a0c0','#b88080','#f0d0e0','#c89090','#e0b8c8','#d090a8'];

  if (cats.length === 0) {
    ctx.canvas.style.display = 'none';
    return;
  }

  pieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{ data: vals, backgroundColor: colors.slice(0, cats.length), borderWidth: 2, borderColor: document.body.classList.contains('dark') ? '#20202c' : '#fff' }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ctx.label + ': $' + ctx.parsed.toFixed(2) } }
      }
    }
  });

  const legend = document.getElementById('pieLegend');
  if (legend) {
    legend.innerHTML = cats.map((c, i) =>
      `<div class="legend-item"><span class="legend-dot" style="background:${colors[i]}"></span>${c}</div>`
    ).join('');
  }
}

function renderRecentTx(expenses) {
  const list = document.getElementById('recentTxList');
  if (!list) return;
  const recent = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  if (recent.length === 0) {
    list.innerHTML = `<div class="empty-state">No transactions yet. <a href="expenses.html" class="link-soft">Add one →</a></div>`;
    return;
  }
  list.innerHTML = recent.map(e => `
    <div class="tx-item">
      <div class="tx-icon">${getCategoryIcon(e.category)}</div>
      <div class="tx-info">
        <div class="tx-name">${e.description || e.category}</div>
        <div class="tx-cat">${e.category} · ${formatDate(e.date)}</div>
      </div>
      <div class="tx-amount">-${formatCurrency(e.amount)}</div>
    </div>
  `).join('');
}

function renderBudgetAlerts(budgets, expenses) {
  const list = document.getElementById('budgetAlertList');
  if (!list) return;
  if (budgets.length === 0) {
    list.innerHTML = `<div class="empty-state">No budgets set. <a href="budget.html" class="link-soft">Set one →</a></div>`;
    return;
  }

  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const alerts = budgets.map(b => {
    const spent = thisMonth.filter(e => e.category === b.category).reduce((s, e) => s + parseFloat(e.amount), 0);
    const pct = Math.min((spent / b.limit) * 100, 100);
    return { ...b, spent, pct };
  }).filter(b => b.pct >= 50).sort((a, b) => b.pct - a.pct);

  if (alerts.length === 0) {
    list.innerHTML = `<div class="empty-state" style="padding:1rem;text-align:center;color:#16a34a;">✓ All budgets on track!</div>`;
    return;
  }

  list.innerHTML = alerts.map(b => {
    const cls = b.pct >= 100 ? 'danger' : b.pct >= 75 ? 'warning' : '';
    return `
      <div class="alert-item ${cls}">
        <div class="alert-header">
          <span class="alert-cat">${getCategoryIcon(b.category)} ${b.category}</span>
          <span class="alert-pct">${b.pct.toFixed(0)}%</span>
        </div>
        <div class="alert-bar"><div class="alert-fill" style="width:${b.pct}%"></div></div>
        <div class="alert-sub">${formatCurrency(b.spent)} of ${formatCurrency(b.limit)} limit</div>
      </div>`;
  }).join('');
}

function setPeriod(period, btn) {
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderLineChart(getExpenses(), period);
}
