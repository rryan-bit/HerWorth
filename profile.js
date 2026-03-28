/* =============================================
   HERWORTH — PROFILE JS
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
});

async function loadProfile() {
  const user = getCurrentUser();
  if (!user) return;
  const key = getUserKey();

  document.getElementById('profFirst').value = user.firstName || '';
  document.getElementById('profLast').value = user.lastName || '';
  document.getElementById('profEmail').value = user.email || '';

  const initials = (user.firstName || user.email || 'U').charAt(0).toUpperCase();
  const avatarEl = document.getElementById('profileAvatarLarge');
  if (avatarEl) avatarEl.textContent = initials;

  document.getElementById('profileNameDisplay').textContent = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Your Name';
  document.getElementById('profileEmailDisplay').textContent = user.email || '';

  const joined = user.joined ? new Date(user.joined).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' }) : 'Recently';
  document.getElementById('profileJoined').textContent = joined;

  // Stats
  document.getElementById('psTxCount').textContent = (await getExpenses()).length;
  document.getElementById('psGoals').textContent = (await getGoals()).length;
  document.getElementById('psAccounts').textContent = (await getAccounts()).length;

  // Preferences
  const prefs = DB.get('prefs_' + key) || {};
  const currencyEl = document.getElementById('prefCurrency');
  if (currencyEl && prefs.currency) currencyEl.value = prefs.currency;

  const darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) darkToggle.checked = !!DB.get('dark_mode');
}

function saveProfile() {
  const first = document.getElementById('profFirst').value.trim();
  const last = document.getElementById('profLast').value.trim();
  const email = document.getElementById('profEmail').value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email.', 'error'); return;
  }

  const user = getCurrentUser();
  const updated = { ...user, firstName: first, lastName: last, email };
  DB.set('current_user', updated);

  // Update in users array
  const users = DB.get('users') || [];
  const idx = users.findIndex(u => u.email === user.email);
  if (idx >= 0) { users[idx] = { ...users[idx], firstName: first, lastName: last, email }; DB.set('users', users); }

  document.getElementById('profileSuccess').style.display = 'block';
  setTimeout(() => document.getElementById('profileSuccess').style.display = 'none', 3000);
  document.getElementById('profileNameDisplay').textContent = [first, last].filter(Boolean).join(' ') || 'Your Name';
  document.getElementById('profileEmailDisplay').textContent = email;
  populateSidebarUser();
  showToast('Profile saved!');
}

async function changePassword() {
  const cur = document.getElementById('currentPass').value;
  const nw = document.getElementById('newPass').value;
  const errEl = document.getElementById('passError');
  const sucEl = document.getElementById('passSuccess');
  errEl.style.display = 'none';
  sucEl.style.display = 'none';

  if (!cur || !nw) { errEl.textContent = 'Please fill in both fields.'; errEl.style.display = 'block'; return; }
  if (nw.length < 8) { errEl.textContent = 'New password must be at least 8 characters.'; errEl.style.display = 'block'; return; }

  const user = getCurrentUser();
  if (user.password && user.password !== cur) {
    errEl.textContent = 'Current password is incorrect.'; errEl.style.display = 'block'; return;
  }

  const updated = { ...user, password: nw };
  DB.set('current_user', updated);
  const users = DB.get('users') || [];
  const idx = users.findIndex(u => u.email === user.email);
  if (idx >= 0) { users[idx] = { ...users[idx], password: nw }; DB.set('users', users); }

  sucEl.style.display = 'block';
  document.getElementById('currentPass').value = '';
  document.getElementById('newPass').value = '';
  document.getElementById('strengthBar').style.display = 'none';
  showToast('Password updated!');
}

function savePreferences() {
  const currency = document.getElementById('prefCurrency').value;
  DB.set('prefs_' + getUserKey(), { currency });
  showToast('Preferences saved!');
}

async function clearAllData() {
  if (!confirm('This will delete ALL your expenses, budgets, goals and accounts. Are you sure?')) return;
  const key = getUserKey();
  ['expenses_','budgets_','goals_','accounts_','seeded_'].forEach(p => DB.del(p + key));
  showToast('All data cleared.', 'error');
  setTimeout(() => loadProfile(), 500);
}

function deleteAccount() {
  if (!confirm('Delete your HerWorth account permanently? This cannot be undone.')) return;
  const user = getCurrentUser();
  const key = getUserKey();
  ['expenses_','budgets_','goals_','accounts_','seeded_','prefs_'].forEach(p => DB.del(p + key));
  const users = (DB.get('users') || []).filter(u => u.email !== user.email);
  DB.set('users', users);
  logout();
}

// changePassword updated to use Firebase compat above