/* =============================================
   HERWORTH — EXPENSES JS
   ============================================= */

let deleteTargetId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  const expDate = document.getElementById('expDate');
  if (expDate) expDate.value = today;
  renderExpenses(); // called async internally
});

async function renderExpenses() {
  const list = document.getElementById('expenseList');
  const countEl = document.getElementById('txCount');
  if (!list) return;

  let expenses = await getExpenses();
  const catFilter = document.getElementById('filterCategory')?.value;
  const fromFilter = document.getElementById('filterFrom')?.value;
  const toFilter = document.getElementById('filterTo')?.value;
  const sort = document.getElementById('filterSort')?.value || 'newest';

  if (catFilter) expenses = expenses.filter(e => e.category === catFilter);
  if (fromFilter) expenses = expenses.filter(e => e.date >= fromFilter);
  if (toFilter) expenses = expenses.filter(e => e.date <= toFilter);

  expenses.sort((a, b) => {
    if (sort === 'newest') return new Date(b.date) - new Date(a.date);
    if (sort === 'oldest') return new Date(a.date) - new Date(b.date);
    if (sort === 'highest') return parseFloat(b.amount) - parseFloat(a.amount);
    if (sort === 'lowest') return parseFloat(a.amount) - parseFloat(b.amount);
  });

  if (countEl) countEl.textContent = expenses.length + ' transaction' + (expenses.length !== 1 ? 's' : '');

  if (expenses.length === 0) {
    list.innerHTML = '<div class="empty-state">No expenses match your filters.</div>';
    return;
  }

  list.innerHTML = expenses.map(e => `
    <div class="expense-item">
      <div class="tx-icon">${getCategoryIcon(e.category)}</div>
      <div class="tx-info">
        <div class="tx-name">${e.description || e.category}</div>
        <div class="tx-cat">${e.category} · ${formatDate(e.date)}</div>
      </div>
      <div class="tx-amount">-${formatCurrency(e.amount)}</div>
      <div class="tx-actions">
        <button class="tx-action-btn" onclick="editExpense('${e.id}')" title="Edit">✎</button>
        <button class="tx-action-btn delete" onclick="openDeleteModal('${e.id}')" title="Delete">✕</button>
      </div>
    </div>
  `).join('');
}

function openExpenseModal(id) {
  document.getElementById('expenseModal').style.display = 'flex';
  document.getElementById('editExpenseId').value = '';
  document.getElementById('expAmount').value = '';
  document.getElementById('expCategory').value = '';
  document.getElementById('expDesc').value = '';
  document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('modalTitle').textContent = 'Add Expense';
  clearExpenseErrors();
}

function closeExpenseModal() {
  document.getElementById('expenseModal').style.display = 'none';
}

function editExpense(id) {
  const expenses = getExpenses();
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  document.getElementById('expenseModal').style.display = 'flex';
  document.getElementById('editExpenseId').value = e.id;
  document.getElementById('expAmount').value = e.amount;
  document.getElementById('expCategory').value = e.category;
  document.getElementById('expDesc').value = e.description || '';
  document.getElementById('expDate').value = e.date;
  document.getElementById('modalTitle').textContent = 'Edit Expense';
}

function clearExpenseErrors() {
  ['expAmountErr','expCategoryErr','expDateErr'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

async function saveExpense() {
  clearExpenseErrors();
  const amount = parseFloat(document.getElementById('expAmount')?.value);
  const category = document.getElementById('expCategory')?.value;
  const description = document.getElementById('expDesc')?.value.trim();
  const date = document.getElementById('expDate')?.value;
  const editId = document.getElementById('editExpenseId')?.value;

  let valid = true;
  if (!amount || amount <= 0) { document.getElementById('expAmountErr').textContent = 'Please enter a valid amount.'; valid = false; }
  if (!category) { document.getElementById('expCategoryErr').textContent = 'Please select a category.'; valid = false; }
  if (!date) { document.getElementById('expDateErr').textContent = 'Please select a date.'; valid = false; }
  if (!valid) return;

  let expenses = await getExpenses();

  if (editId) {
    expenses = expenses.map(e => e.id === editId ? { ...e, amount: amount.toFixed(2), category, description, date } : e);
    showToast('Expense updated!');
  } else {
    expenses.push({ id: 'exp_' + Date.now(), amount: amount.toFixed(2), category, description, date, createdAt: new Date().toISOString() });
    showToast('Expense added!');
  }

  await saveExpenses(expenses);
  closeExpenseModal();
  await renderExpenses(); // called async internally
}

function openDeleteModal(id) {
  deleteTargetId = id;
  document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const expenses = (await getExpenses()).filter(e => e.id !== deleteTargetId);
  await saveExpenses(expenses);
  closeDeleteModal();
  await renderExpenses(); // called async internally
  showToast('Expense deleted.', 'error');
}

function clearFilters() {
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterFrom').value = '';
  document.getElementById('filterTo').value = '';
  document.getElementById('filterSort').value = 'newest';
  renderExpenses(); // called async internally
}
