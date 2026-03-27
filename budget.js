/* =============================================
   HERWORTH — BUDGET & GOALS JS
   ============================================= */

let selectedGoalEmoji = '🏖';

document.addEventListener('DOMContentLoaded', () => {
  renderBudgets();
  renderGoals();
});

/* ---- BUDGETS ---- */
function renderBudgets() {
  const grid = document.getElementById('budgetsGrid');
  if (!grid) return;
  const budgets = getBudgets();
  const expenses = getExpenses();
  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  if (budgets.length === 0) {
    grid.innerHTML = '<div class="empty-state card">No budgets set yet. Click <strong>+ Set Budget</strong> to add one.</div>';
    return;
  }

  grid.innerHTML = budgets.map(b => {
    const spent = thisMonth.filter(e => e.category === b.category).reduce((s, e) => s + parseFloat(e.amount), 0);
    const pct = Math.min((spent / b.limit) * 100, 100);
    const cls = pct >= 100 ? 'danger' : pct >= 75 ? 'warning' : '';
    const alertMsg = pct >= 100 ? '⚠️ Budget exceeded!' : pct >= 75 ? '⚠️ Nearing limit' : '✓ On track';
    return `
      <div class="budget-card">
        <div class="budget-header">
          <span class="budget-cat">${getCategoryIcon(b.category)} ${b.category}</span>
          <span class="budget-limit">${formatCurrency(b.limit)}/mo</span>
        </div>
        <div class="budget-bar"><div class="budget-fill ${cls}" style="width:${pct}%"></div></div>
        <div class="budget-nums">
          <span class="budget-spent">${formatCurrency(spent)} spent</span>
          <span class="budget-pct">${pct.toFixed(0)}%</span>
        </div>
        <div style="font-size:0.72rem;margin-top:0.3rem;color:${cls === 'danger' ? '#dc2626' : cls === 'warning' ? '#d97706' : '#16a34a'}">${alertMsg}</div>
        <div class="budget-actions">
          <button class="btn-outline btn-sm" onclick="editBudget('${b.id}')">Edit</button>
          <button class="btn-danger btn-sm" onclick="deleteBudget('${b.id}')">Remove</button>
        </div>
      </div>`;
  }).join('');
}

function openBudgetModal(id) {
  document.getElementById('budgetModal').style.display = 'flex';
  document.getElementById('editBudgetId').value = '';
  document.getElementById('budgetCategory').value = '';
  document.getElementById('budgetLimit').value = '';
  document.getElementById('budgetModalTitle').textContent = 'Set Budget Limit';
  document.getElementById('budgetCategoryErr').textContent = '';
  document.getElementById('budgetLimitErr').textContent = '';
}

function closeBudgetModal() { document.getElementById('budgetModal').style.display = 'none'; }

function editBudget(id) {
  const b = getBudgets().find(x => x.id === id);
  if (!b) return;
  document.getElementById('budgetModal').style.display = 'flex';
  document.getElementById('editBudgetId').value = b.id;
  document.getElementById('budgetCategory').value = b.category;
  document.getElementById('budgetLimit').value = b.limit;
  document.getElementById('budgetModalTitle').textContent = 'Edit Budget';
}

function saveBudget() {
  const editId = document.getElementById('editBudgetId').value;
  const category = document.getElementById('budgetCategory').value;
  const limit = parseFloat(document.getElementById('budgetLimit').value);
  let valid = true;
  document.getElementById('budgetCategoryErr').textContent = '';
  document.getElementById('budgetLimitErr').textContent = '';
  if (!category) { document.getElementById('budgetCategoryErr').textContent = 'Select a category.'; valid = false; }
  if (!limit || limit <= 0) { document.getElementById('budgetLimitErr').textContent = 'Enter a valid limit.'; valid = false; }
  if (!valid) return;

  let budgets = getBudgets();
  if (editId) {
    budgets = budgets.map(b => b.id === editId ? { ...b, category, limit } : b);
    showToast('Budget updated!');
  } else {
    if (budgets.find(b => b.category === category)) {
      document.getElementById('budgetCategoryErr').textContent = 'Budget for this category already exists.';
      return;
    }
    budgets.push({ id: 'b_' + Date.now(), category, limit });
    showToast('Budget set!');
  }
  saveBudgets(budgets);
  closeBudgetModal();
  renderBudgets();
}

function deleteBudget(id) {
  saveBudgets(getBudgets().filter(b => b.id !== id));
  renderBudgets();
  showToast('Budget removed.', 'error');
}

/* ---- GOALS ---- */
function renderGoals() {
  const grid = document.getElementById('goalsGrid');
  if (!grid) return;
  const goals = getGoals();
  if (goals.length === 0) {
    grid.innerHTML = '<div class="empty-state card">No savings goals yet. Click <strong>+ Add Goal</strong> to start saving toward something.</div>';
    return;
  }
  grid.innerHTML = goals.map(g => {
    const pct = Math.min((g.saved / g.target) * 100, 100);
    return `
      <div class="goal-card">
        <span class="goal-emoji">${g.emoji || '💰'}</span>
        <div class="goal-name">${g.name}</div>
        <div class="goal-progress-text">${formatCurrency(g.saved)} saved of ${formatCurrency(g.target)} goal</div>
        <div class="goal-bar"><div class="goal-fill" style="width:${pct}%"></div></div>
        <div class="goal-pct">${pct.toFixed(0)}%</div>
        <div class="goal-actions">
          <button class="btn-outline btn-sm" onclick="editGoal('${g.id}')">Edit</button>
          <button class="btn-danger btn-sm" onclick="deleteGoal('${g.id}')">Remove</button>
        </div>
      </div>`;
  }).join('');
}

function openGoalModal() {
  document.getElementById('goalModal').style.display = 'flex';
  document.getElementById('editGoalId').value = '';
  document.getElementById('goalName').value = '';
  document.getElementById('goalTarget').value = '';
  document.getElementById('goalSaved').value = '';
  document.getElementById('goalEmoji').value = '🏖';
  document.getElementById('goalModalTitle').textContent = 'Add Savings Goal';
  selectedGoalEmoji = '🏖';
  document.querySelectorAll('.emoji-opt').forEach(el => el.classList.remove('selected'));
  document.querySelector('.emoji-opt')?.classList.add('selected');
}

function closeGoalModal() { document.getElementById('goalModal').style.display = 'none'; }

function selectEmoji(el, emoji) {
  document.querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedGoalEmoji = emoji;
  document.getElementById('goalEmoji').value = emoji;
}

function editGoal(id) {
  const g = getGoals().find(x => x.id === id);
  if (!g) return;
  document.getElementById('goalModal').style.display = 'flex';
  document.getElementById('editGoalId').value = g.id;
  document.getElementById('goalName').value = g.name;
  document.getElementById('goalTarget').value = g.target;
  document.getElementById('goalSaved').value = g.saved;
  document.getElementById('goalEmoji').value = g.emoji;
  document.getElementById('goalModalTitle').textContent = 'Edit Goal';
  selectedGoalEmoji = g.emoji;
  document.querySelectorAll('.emoji-opt').forEach(el => {
    el.classList.toggle('selected', el.textContent.trim() === g.emoji);
  });
}

function saveGoal() {
  const editId = document.getElementById('editGoalId').value;
  const name = document.getElementById('goalName').value.trim();
  const target = parseFloat(document.getElementById('goalTarget').value);
  const saved = parseFloat(document.getElementById('goalSaved').value) || 0;
  const emoji = selectedGoalEmoji || '💰';
  let valid = true;
  document.getElementById('goalNameErr').textContent = '';
  document.getElementById('goalTargetErr').textContent = '';
  if (!name) { document.getElementById('goalNameErr').textContent = 'Enter a goal name.'; valid = false; }
  if (!target || target <= 0) { document.getElementById('goalTargetErr').textContent = 'Enter a valid target amount.'; valid = false; }
  if (!valid) return;

  let goals = getGoals();
  if (editId) {
    goals = goals.map(g => g.id === editId ? { ...g, name, target, saved, emoji } : g);
    showToast('Goal updated!');
  } else {
    goals.push({ id: 'g_' + Date.now(), name, target, saved, emoji });
    showToast('Goal added!');
  }
  saveGoals(goals);
  closeGoalModal();
  renderGoals();
}

function deleteGoal(id) {
  saveGoals(getGoals().filter(g => g.id !== id));
  renderGoals();
  showToast('Goal removed.', 'error');
}
