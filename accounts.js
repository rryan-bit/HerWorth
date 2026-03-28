/* =============================================
   HERWORTH — ACCOUNTS JS
   ============================================= */
let selectedAccountColor = '#f8c8dc';

document.addEventListener('DOMContentLoaded', () => {
  renderAccounts();
});

async function renderAccounts() {
  const grid = document.getElementById('accountsGrid');
  const totalEl = document.getElementById('totalBalance');
  if (!grid) return;
  const accounts = await getAccounts();
  const total = accounts.reduce((s, a) => s + parseFloat(a.balance || 0), 0);
  if (totalEl) totalEl.textContent = formatCurrency(total);

  if (accounts.length === 0) {
    grid.innerHTML = '<div class="empty-state card">No accounts yet. Click <strong>+ Add Account</strong> to add your first account.</div>';
    return;
  }

  const typeIcons = { Savings: '💰', Checking: '💳', Investment: '📈', Cash: '💵', Other: '📦' };

  grid.innerHTML = accounts.map(a => `
    <div class="account-card" style="background:${a.color || '#f8c8dc'};">
      <div class="account-type-badge">${typeIcons[a.type] || '📦'} ${a.type}</div>
      <div class="account-name">${a.name}</div>
      <div class="account-balance">${formatCurrency(a.balance)}</div>
      <div class="account-actions">
        <button class="btn-outline btn-sm" onclick="editAccount('${a.id}')">Edit</button>
        <button class="btn-outline btn-sm" onclick="deleteAccount('${a.id}')">Remove</button>
      </div>
    </div>
  `).join('');
}

function openAccountModal() {
  document.getElementById('accountModal').style.display = 'flex';
  document.getElementById('editAccountId').value = '';
  document.getElementById('accountName').value = '';
  document.getElementById('accountType').value = 'Savings';
  document.getElementById('accountBalance').value = '';
  document.getElementById('accountColor').value = '#f8c8dc';
  document.getElementById('accountModalTitle').textContent = 'Add Account';
  selectedAccountColor = '#f8c8dc';
  document.querySelectorAll('.color-opt').forEach((el, i) => el.classList.toggle('selected', i === 0));
}

function closeAccountModal() { document.getElementById('accountModal').style.display = 'none'; }

function editAccount(id) {
  const a = getAccounts().find(x => x.id === id);
  if (!a) return;
  document.getElementById('accountModal').style.display = 'flex';
  document.getElementById('editAccountId').value = a.id;
  document.getElementById('accountName').value = a.name;
  document.getElementById('accountType').value = a.type;
  document.getElementById('accountBalance').value = a.balance;
  document.getElementById('accountColor').value = a.color;
  document.getElementById('accountModalTitle').textContent = 'Edit Account';
  selectedAccountColor = a.color;
  document.querySelectorAll('.color-opt').forEach(el => el.classList.toggle('selected', el.dataset.color === a.color));
}

function selectColor(el) {
  document.querySelectorAll('.color-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedAccountColor = el.dataset.color;
  document.getElementById('accountColor').value = selectedAccountColor;
}

async function saveAccount() {
  const editId = document.getElementById('editAccountId').value;
  const name = document.getElementById('accountName').value.trim();
  const type = document.getElementById('accountType').value;
  const balance = parseFloat(document.getElementById('accountBalance').value);
  let valid = true;
  document.getElementById('accountNameErr').textContent = '';
  document.getElementById('accountBalanceErr').textContent = '';
  if (!name) { document.getElementById('accountNameErr').textContent = 'Enter an account name.'; valid = false; }
  if (isNaN(balance) || balance < 0) { document.getElementById('accountBalanceErr').textContent = 'Enter a valid balance.'; valid = false; }
  if (!valid) return;

  let accounts = await getAccounts();
  if (editId) {
    accounts = accounts.map(a => a.id === editId ? { ...a, name, type, balance, color: selectedAccountColor } : a);
    showToast('Account updated!');
  } else {
    accounts.push({ id: 'a_' + Date.now(), name, type, balance, color: selectedAccountColor });
    showToast('Account added!');
  }
  await saveAccounts(accounts);
  closeAccountModal();
  await renderAccounts();
}

async function deleteAccount(id) {
  if (!confirm('Remove this account?')) return;
  await saveAccounts((await getAccounts()).filter(a => a.id !== id));
  await renderAccounts();
  showToast('Account removed.', 'error');
}
