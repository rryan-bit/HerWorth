/* =============================================
   HERWORTH — CORE APP JS
   Auth, storage, utils, shared functions
   ============================================= */

/* ---- STORAGE HELPERS ---- */
const DB = {
  get: (key) => { try { return JSON.parse(localStorage.getItem('hw_' + key)); } catch { return null; } },
  set: (key, val) => localStorage.setItem('hw_' + key, JSON.stringify(val)),
  del: (key) => localStorage.removeItem('hw_' + key),
};

/* ---- AUTH STATE ---- */
function getCurrentUser() {
  return DB.get('current_user');
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return null; }
  return user;
}

function logout() {
  DB.del('current_user');
  window.location.href = 'index.html';
}

/* ---- POPULATE SIDEBAR USER ---- */
function populateSidebarUser() {
  const user = getCurrentUser();
  if (!user) return;
  const first = user.firstName || user.name?.split(' ')[0] || 'You';
  const initial = first.charAt(0).toUpperCase();
  const el = document.getElementById('userAvatar');
  if (el) el.textContent = initial;
  const nameEl = document.getElementById('userName');
  if (nameEl) nameEl.textContent = first;
  const emailEl = document.getElementById('userEmail');
  if (emailEl) emailEl.textContent = user.email || '';
}

/* ---- DARK MODE ---- */
function applyDark() {
  const dark = DB.get('dark_mode');
  if (dark) document.body.classList.add('dark');
  else document.body.classList.remove('dark');
  const checkbox = document.getElementById('darkModeToggle');
  if (checkbox) checkbox.checked = !!dark;
}

function toggleDark() {
  const isDark = DB.get('dark_mode');
  DB.set('dark_mode', !isDark);
  applyDark();
}

function toggleDarkFromCheckbox(el) {
  DB.set('dark_mode', el.checked);
  applyDark();
}

/* ---- TOAST NOTIFICATIONS ---- */
let toastTimeout;
function showToast(msg, type = 'success') {
  let toast = document.getElementById('hwToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'hwToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = type === 'success' ? '✓ ' + msg : type === 'error' ? '✕ ' + msg : msg;
  toast.className = `toast ${type}`;
  clearTimeout(toastTimeout);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ---- AUTH FORM FUNCTIONS (index.html) ---- */
function switchTab(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('signupTab').classList.toggle('active', tab === 'signup');
}

function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.textContent = input.type === 'password' ? '👁' : '🙈';
}

function checkStrength(val) {
  const bar = document.getElementById('strengthBar');
  const fill = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  if (!bar || !fill || !label) return;
  if (!val) { bar.style.display = 'none'; return; }
  bar.style.display = 'block';
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { w: '25%', color: '#f87171', text: 'Weak' },
    { w: '50%', color: '#fbbf24', text: 'Fair' },
    { w: '75%', color: '#60a5fa', text: 'Good' },
    { w: '100%', color: '#34d399', text: 'Strong ✓' },
  ];
  const lvl = levels[Math.max(0, score - 1)];
  fill.style.width = lvl.w;
  fill.style.background = lvl.color;
  label.textContent = lvl.text;
  label.style.color = lvl.color;
}

function clearFieldErrs(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function handleLogin() {
  clearFieldErrs('loginEmailErr', 'loginPassErr');
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass = document.getElementById('loginPassword')?.value;
  let valid = true;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('loginEmailErr').textContent = 'Please enter a valid email.';
    valid = false;
  }
  if (!pass || pass.length < 6) {
    document.getElementById('loginPassErr').textContent = 'Password must be at least 6 characters.';
    valid = false;
  }
  if (!valid) return;

  const btn = document.querySelector('#loginForm .btn-primary');
  btn.querySelector('.btn-label').style.display = 'none';
  btn.querySelector('.btn-spinner').style.display = 'inline';
  btn.disabled = true;

  setTimeout(() => {
    // Check stored users
    const users = DB.get('users') || [];
    const user = users.find(u => u.email === email && u.password === pass);
    if (!user) {
      // Demo: allow any login to work with demo data
      const demoUser = { email, firstName: email.split('@')[0], lastName: '', joined: new Date().toISOString() };
      if (email === 'demo@herworth.com') {
        DB.set('current_user', demoUser);
        seedDemoData(email);
        window.location.href = 'dashboard.html';
        return;
      }
      document.getElementById('loginError').style.display = 'block';
      document.getElementById('loginError').textContent = 'No account found with those details. Please sign up or check your credentials.';
      btn.querySelector('.btn-label').style.display = 'inline';
      btn.querySelector('.btn-spinner').style.display = 'none';
      btn.disabled = false;
      return;
    }
    DB.set('current_user', user);
    window.location.href = 'dashboard.html';
  }, 1200);
}

function handleSignup() {
  clearFieldErrs('signupFirstErr', 'signupEmailErr', 'signupPassErr', 'signupTermsErr');
  const first = document.getElementById('signupFirst')?.value.trim();
  const last = document.getElementById('signupLast')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const pass = document.getElementById('signupPassword')?.value;
  const terms = document.getElementById('agreeTerms')?.checked;
  let valid = true;

  if (!first) { document.getElementById('signupFirstErr').textContent = 'First name is required.'; valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('signupEmailErr').textContent = 'Please enter a valid email.'; valid = false;
  }
  if (!pass || pass.length < 8) {
    document.getElementById('signupPassErr').textContent = 'Password must be at least 8 characters.'; valid = false;
  }
  if (!terms) {
    document.getElementById('signupTermsErr').textContent = 'You must agree to the terms.'; valid = false;
  }
  if (!valid) return;

  const btn = document.querySelector('#signupForm .btn-primary');
  btn.querySelector('.btn-label').style.display = 'none';
  btn.querySelector('.btn-spinner').style.display = 'inline';
  btn.disabled = true;

  setTimeout(() => {
    const users = DB.get('users') || [];
    if (users.find(u => u.email === email)) {
      document.getElementById('signupError').style.display = 'block';
      document.getElementById('signupError').textContent = 'An account with this email already exists.';
      btn.querySelector('.btn-label').style.display = 'inline';
      btn.querySelector('.btn-spinner').style.display = 'none';
      btn.disabled = false;
      return;
    }
    const user = { email, password: pass, firstName: first, lastName: last, joined: new Date().toISOString() };
    users.push(user);
    DB.set('users', users);
    DB.set('current_user', user);
    seedDemoData(email);
    window.location.href = 'dashboard.html';
  }, 1200);
}

function handleGoogleAuth() {
  // Mock Google OAuth
  const mockUser = { email: 'google.user@gmail.com', firstName: 'Google', lastName: 'User', joined: new Date().toISOString() };
  DB.set('current_user', mockUser);
  seedDemoData(mockUser.email);
  window.location.href = 'dashboard.html';
}

/* ---- SEED DEMO DATA ---- */
function seedDemoData(email) {
  const key = email.replace(/[^a-z0-9]/gi, '_');
  if (DB.get('seeded_' + key)) return;

  const today = new Date();
  const expenses = [];
  const categories = ['Food','Drinks','Transport','Shopping','Bills','Health','Entertainment','Beauty'];
  const descs = {
    Food: ['Groceries','Lunch','Dinner out','Coffee','Meal prep'],
    Drinks: ['Wine','Smoothie','Cocktails','Coffee run'],
    Transport: ['Uber','Petrol','Bus pass','Parking'],
    Shopping: ['New dress','Shoes','Online order','Gift'],
    Bills: ['Electricity','Internet','Phone plan','Rent'],
    Health: ['Gym','Vitamins','Appointment','Skincare'],
    Entertainment: ['Netflix','Movie tickets','Concert','Books'],
    Beauty: ['Haircut','Nails','Makeup','Spa'],
  };

  for (let i = 0; i < 24; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const d = new Date(today);
    d.setDate(d.getDate() - Math.floor(Math.random() * 60));
    const descList = descs[cat];
    expenses.push({
      id: 'exp_' + Date.now() + '_' + i,
      amount: (Math.random() * 180 + 5).toFixed(2),
      category: cat,
      description: descList[Math.floor(Math.random() * descList.length)],
      date: d.toISOString().split('T')[0],
      createdAt: d.toISOString(),
    });
  }
  DB.set('expenses_' + key, expenses);

  const budgets = [
    { id: 'b1', category: 'Food', limit: 400 },
    { id: 'b2', category: 'Shopping', limit: 200 },
    { id: 'b3', category: 'Transport', limit: 150 },
    { id: 'b4', category: 'Entertainment', limit: 100 },
  ];
  DB.set('budgets_' + key, budgets);

  const goals = [
    { id: 'g1', name: 'Emergency Fund', target: 5000, saved: 1800, emoji: '💰' },
    { id: 'g2', name: 'Holiday Fund', target: 3000, saved: 750, emoji: '🏖' },
    { id: 'g3', name: 'New Laptop', target: 2000, saved: 1400, emoji: '💻' },
  ];
  DB.set('goals_' + key, goals);

  const accounts = [
    { id: 'a1', name: 'Everyday Account', type: 'Checking', balance: 3420.50, color: '#f8c8dc' },
    { id: 'a2', name: 'High Interest Savings', type: 'Savings', balance: 12840.00, color: '#b8ddf0' },
    { id: 'a3', name: 'Investment Portfolio', type: 'Investment', balance: 8200.00, color: '#b8f0d4' },
  ];
  DB.set('accounts_' + key, accounts);

  DB.set('seeded_' + key, true);
}

/* ---- USER DATA KEY ---- */
function getUserKey() {
  const user = getCurrentUser();
  if (!user) return null;
  return (user.email || 'guest').replace(/[^a-z0-9]/gi, '_');
}

function getExpenses() { return DB.get('expenses_' + getUserKey()) || []; }
function saveExpenses(data) { DB.set('expenses_' + getUserKey(), data); }
function getBudgets() { return DB.get('budgets_' + getUserKey()) || []; }
function saveBudgets(data) { DB.set('budgets_' + getUserKey(), data); }
function getGoals() { return DB.get('goals_' + getUserKey()) || []; }
function saveGoals(data) { DB.set('goals_' + getUserKey(), data); }
function getAccounts() { return DB.get('accounts_' + getUserKey()) || []; }
function saveAccounts(data) { DB.set('accounts_' + getUserKey(), data); }

/* ---- UTILS ---- */
function formatCurrency(amount) {
  const user = getCurrentUser();
  const prefs = DB.get('prefs_' + getUserKey()) || {};
  const currency = prefs.currency || 'AUD';
  const symbols = { AUD: '$', USD: '$', GBP: '£', EUR: '€', NZD: '$' };
  return (symbols[currency] || '$') + parseFloat(amount || 0).toFixed(2);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getCategoryIcon(cat) {
  const icons = {
    Food: '🍽', Drinks: '🍹', Transport: '🚗', Shopping: '🛍',
    Furniture: '🛋', Bills: '💡', Health: '💊', Entertainment: '🎬',
    Beauty: '💄', Travel: '✈️', Other: '📦'
  };
  return icons[cat] || '📦';
}

function closeModalOutside(e, modalId) {
  if (e.target.id === modalId) document.getElementById(modalId).style.display = 'none';
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

/* ---- INIT ON EVERY APP PAGE ---- */
document.addEventListener('DOMContentLoaded', () => {
  applyDark();
  if (!document.body.classList.contains('auth-page')) {
    requireAuth();
    populateSidebarUser();
  }
  // Greet name on dashboard
  const greetEl = document.getElementById('greetName');
  if (greetEl) {
    const user = getCurrentUser();
    greetEl.textContent = user?.firstName || 'there';
  }
  // Current month
  const monthEl = document.getElementById('currentMonth');
  if (monthEl) {
    monthEl.textContent = new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  }
  // Escape to close modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    }
  });
});
