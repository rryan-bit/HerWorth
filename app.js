/* =============================================
   HERWORTH — CORE APP JS
   Uses Firebase Compat SDK (loaded via CDN in HTML)
   No ES modules — works as a plain <script> tag
   ============================================= */

/* ============================================
   ENCRYPTION — AES-GCM via Web Crypto API
   Key derived from user UID via PBKDF2
   All localStorage data is encrypted at rest
   ============================================= */
const _SALT = "herworth_v1_2026";

async function _deriveKey(uid) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey(
    "raw", enc.encode(uid + _SALT), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(_SALT), iterations: 100000, hash: "SHA-256" },
    km, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}

async function _encrypt(uid, data) {
  try {
    const key = await _deriveKey(uid);
    const iv  = crypto.getRandomValues(new Uint8Array(12));
    const ct  = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, key,
      new TextEncoder().encode(JSON.stringify(data))
    );
    const buf = new Uint8Array(12 + ct.byteLength);
    buf.set(iv, 0); buf.set(new Uint8Array(ct), 12);
    return btoa(String.fromCharCode(...buf));
  } catch (e) { console.error('Encrypt error:', e); return null; }
}

async function _decrypt(uid, b64) {
  try {
    const key = await _deriveKey(uid);
    const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const dec = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: buf.slice(0, 12) }, key, buf.slice(12)
    );
    return JSON.parse(new TextDecoder().decode(dec));
  } catch { return null; }
}

function _skey(uid, k) { return "hw_e_" + uid.slice(0, 10) + "_" + k; }

async function secureSet(uid, k, v) {
  const e = await _encrypt(uid, v);
  if (e) localStorage.setItem(_skey(uid, k), e);
}
async function secureGet(uid, k) {
  const r = localStorage.getItem(_skey(uid, k));
  return r ? _decrypt(uid, r) : null;
}
function secureDel(uid, k) { localStorage.removeItem(_skey(uid, k)); }

/* ============================================
   PLAIN STORAGE for non-sensitive prefs
   ============================================= */
const DB = {
  get: (k) => { try { return JSON.parse(localStorage.getItem('hw_' + k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem('hw_' + k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem('hw_' + k),
};

/* ============================================
   AUTH STATE
   ============================================= */
let _currentUser = null;

function getCurrentUser() {
  return _currentUser || DB.get('session_user');
}
function setCurrentUser(u) {
  _currentUser = u;
  DB.set('session_user', u);
}
function requireAuth() {
  const u = getCurrentUser();
  if (!u || !u.uid) { window.location.href = 'index.html'; return null; }
  return u;
}
function logout() {
  _currentUser = null;
  DB.del('session_user');
  try { firebase.auth().signOut(); } catch (e) {}
  window.location.href = 'index.html';
}
function getUserKey() {
  const u = getCurrentUser();
  return u ? (u.uid || (u.email || 'g').replace(/[^a-z0-9]/gi, '_')) : 'guest';
}

/* ============================================
   ENCRYPTED DATA ACCESSORS
   ============================================= */
async function getExpenses()   { return (await secureGet(getUserKey(), 'expenses'))  || []; }
async function saveExpenses(d) { await secureSet(getUserKey(), 'expenses', d); }
async function getBudgets()    { return (await secureGet(getUserKey(), 'budgets'))   || []; }
async function saveBudgets(d)  { await secureSet(getUserKey(), 'budgets', d); }
async function getGoals()      { return (await secureGet(getUserKey(), 'goals'))     || []; }
async function saveGoals(d)    { await secureSet(getUserKey(), 'goals', d); }
async function getAccounts()   { return (await secureGet(getUserKey(), 'accounts'))  || []; }
async function saveAccounts(d) { await secureSet(getUserKey(), 'accounts', d); }
async function getRecurring()  { return (await secureGet(getUserKey(), 'recurring')) || []; }
async function saveRecurring(d){ await secureSet(getUserKey(), 'recurring', d); }

/* ============================================
   DEMO DATA SEED
   ============================================= */
function _nextDate(dom) {
  const n = new Date();
  let d = new Date(n.getFullYear(), n.getMonth(), dom || n.getDate());
  if (d <= n) d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}

async function seedDemoData(uid) {
  const existing = await secureGet(uid, 'expenses');
  if (existing && existing.length) return; // already seeded

  const now = new Date();
  const cats = {
    Food: ['Groceries','Lunch','Dinner out','Coffee','Meal prep'],
    Drinks: ['Wine','Smoothie','Cocktails','Coffee run'],
    Transport: ['Uber','Petrol','Bus pass','Parking'],
    Shopping: ['New dress','Shoes','Online order','Gift'],
    Bills: ['Electricity','Internet','Phone plan'],
    Health: ['Gym','Vitamins','Skincare'],
    Entertainment: ['Netflix','Movie tickets','Concert'],
    Beauty: ['Haircut','Nails','Makeup'],
  };
  const keys = Object.keys(cats);
  const expenses = Array.from({ length: 28 }, (_, i) => {
    const cat = keys[Math.floor(Math.random() * keys.length)];
    const d = new Date(now); d.setDate(d.getDate() - Math.floor(Math.random() * 60));
    const descs = cats[cat];
    return {
      id: 'exp_' + Date.now() + '_' + i,
      amount: (Math.random() * 180 + 5).toFixed(2),
      category: cat,
      description: descs[Math.floor(Math.random() * descs.length)],
      date: d.toISOString().split('T')[0],
      createdAt: d.toISOString(),
    };
  });

  await secureSet(uid, 'expenses', expenses);
  await secureSet(uid, 'budgets', [
    { id: 'b1', category: 'Food', limit: 400 },
    { id: 'b2', category: 'Shopping', limit: 200 },
    { id: 'b3', category: 'Transport', limit: 150 },
    { id: 'b4', category: 'Entertainment', limit: 100 },
  ]);
  await secureSet(uid, 'goals', [
    { id: 'g1', name: 'Emergency Fund', target: 5000, saved: 1800, emoji: '💰' },
    { id: 'g2', name: 'Holiday Fund',   target: 3000, saved: 750,  emoji: '🏖' },
    { id: 'g3', name: 'New Laptop',     target: 2000, saved: 1400, emoji: '💻' },
  ]);
  await secureSet(uid, 'accounts', [
    { id: 'a1', name: 'Everyday Account',     type: 'Checking',   balance: 3420.50,  color: '#f8c8dc' },
    { id: 'a2', name: 'High Interest Savings',type: 'Savings',    balance: 12840.00, color: '#b8ddf0' },
    { id: 'a3', name: 'Investment Portfolio',  type: 'Investment', balance: 8200.00,  color: '#b8f0d4' },
  ]);
  await secureSet(uid, 'recurring', [
    { id: 'r1', name: 'Rent',           amount: '1800.00', category: 'Bills',         frequency: 'monthly', dayOfMonth: 1,  active: true, nextDate: _nextDate(1) },
    { id: 'r2', name: 'Netflix',        amount: '17.99',   category: 'Entertainment', frequency: 'monthly', dayOfMonth: 15, active: true, nextDate: _nextDate(15) },
    { id: 'r3', name: 'Gym Membership', amount: '49.99',   category: 'Health',        frequency: 'monthly', dayOfMonth: 1,  active: true, nextDate: _nextDate(1) },
    { id: 'r4', name: 'Spotify',        amount: '11.99',   category: 'Entertainment', frequency: 'monthly', dayOfMonth: 20, active: true, nextDate: _nextDate(20) },
  ]);
}

/* ============================================
   FIREBASE AUTH HANDLERS
   (Firebase compat SDK must be loaded before this)
   ============================================= */
async function handleLogin() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass  = document.getElementById('loginPassword')?.value;

  // Clear errors
  ['loginEmailErr','loginPassErr'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '';
  });
  const errBanner = document.getElementById('loginError');
  if (errBanner) errBanner.style.display = 'none';

  let valid = true;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('loginEmailErr').textContent = 'Please enter a valid email.'; valid = false;
  }
  if (!pass || pass.length < 6) {
    document.getElementById('loginPassErr').textContent = 'Password must be at least 6 characters.'; valid = false;
  }
  if (!valid) return;

  const btn = document.querySelector('#loginForm .btn-primary');
  const label = btn.querySelector('.btn-label');
  const spinner = btn.querySelector('.btn-spinner');
  label.style.display = 'none'; spinner.style.display = 'inline'; btn.disabled = true;

  try {
    const cred = await firebase.auth().signInWithEmailAndPassword(email, pass);
    const uid = cred.user.uid;

    // Load profile from Firestore
    let firstName = email.split('@')[0], lastName = '', joined = new Date().toISOString();
    try {
      const snap = await firebase.firestore().collection('users').doc(uid).get();
      if (snap.exists) {
        const d = snap.data();
        firstName = d.firstName || firstName;
        lastName  = d.lastName  || '';
        joined    = d.joined    || joined;
      }
    } catch (e) { /* Firestore optional — continue */ }

    setCurrentUser({ uid, email, firstName, lastName, joined });
    await seedDemoData(uid);
    window.location.href = 'dashboard.html';

  } catch (err) {
    const msgs = {
      'auth/user-not-found':      'No account found with this email.',
      'auth/wrong-password':      'Incorrect password. Please try again.',
      'auth/invalid-credential':  'Incorrect email or password.',
      'auth/invalid-email':       'Please enter a valid email address.',
      'auth/too-many-requests':   'Too many attempts. Please wait a moment and try again.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };
    if (errBanner) {
      errBanner.textContent = msgs[err.code] || 'Login failed. Please try again.';
      errBanner.style.display = 'block';
    }
    label.style.display = 'inline'; spinner.style.display = 'none'; btn.disabled = false;
  }
}

async function handleSignup() {
  const first = document.getElementById('signupFirst')?.value.trim();
  const last  = document.getElementById('signupLast')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const pass  = document.getElementById('signupPassword')?.value;
  const terms = document.getElementById('agreeTerms')?.checked;

  // Clear errors
  ['signupFirstErr','signupEmailErr','signupPassErr','signupTermsErr'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '';
  });
  const errBanner = document.getElementById('signupError');
  if (errBanner) errBanner.style.display = 'none';

  let valid = true;
  if (!first) { document.getElementById('signupFirstErr').textContent = 'First name is required.'; valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('signupEmailErr').textContent = 'Please enter a valid email.'; valid = false;
  }
  if (!pass || pass.length < 8) {
    document.getElementById('signupPassErr').textContent = 'Password must be at least 8 characters.'; valid = false;
  }
  if (!terms) { document.getElementById('signupTermsErr').textContent = 'You must agree to continue.'; valid = false; }
  if (!valid) return;

  const btn = document.querySelector('#signupForm .btn-primary');
  const label = btn.querySelector('.btn-label');
  const spinner = btn.querySelector('.btn-spinner');
  label.style.display = 'none'; spinner.style.display = 'inline'; btn.disabled = true;

  try {
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, pass);
    const uid    = cred.user.uid;
    const joined = new Date().toISOString();

    // Save profile to Firestore (no password stored — Firebase handles auth)
    try {
      await firebase.firestore().collection('users').doc(uid).set({
        firstName: first, lastName: last || '', email, joined,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) { /* Firestore optional — continue */ }

    setCurrentUser({ uid, email, firstName: first, lastName: last || '', joined });
    await seedDemoData(uid);
    window.location.href = 'dashboard.html';

  } catch (err) {
    const msgs = {
      'auth/email-already-in-use': 'An account with this email already exists. Please sign in.',
      'auth/weak-password':         'Password is too weak. Please use at least 8 characters.',
      'auth/invalid-email':         'Please enter a valid email address.',
      'auth/network-request-failed':'Network error. Please check your connection.',
    };
    if (errBanner) {
      errBanner.textContent = msgs[err.code] || 'Sign up failed. Please try again.';
      errBanner.style.display = 'block';
    }
    label.style.display = 'inline'; spinner.style.display = 'none'; btn.disabled = false;
  }
}

async function handleGoogleAuth() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
    const uid   = result.user.uid;
    const email = result.user.email;
    const displayName = result.user.displayName || '';
    const firstName = displayName.split(' ')[0] || email.split('@')[0];
    const lastName  = displayName.split(' ').slice(1).join(' ') || '';
    const joined = new Date().toISOString();

    try {
      const snap = await firebase.firestore().collection('users').doc(uid).get();
      if (!snap.exists) {
        await firebase.firestore().collection('users').doc(uid).set({
          firstName, lastName, email, joined,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {}

    setCurrentUser({ uid, email, firstName, lastName, joined });
    await seedDemoData(uid);
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error('Google auth error:', err);
    showToast('Google sign-in failed. Please try again.', 'error');
  }
}

/* ============================================
   UI HELPERS
   ============================================= */
function populateSidebarUser() {
  const u = getCurrentUser(); if (!u) return;
  const first = u.firstName || u.email?.split('@')[0] || 'You';
  const init  = first.charAt(0).toUpperCase();
  document.querySelectorAll('#userAvatar').forEach(el => el.textContent = init);
  document.querySelectorAll('#userName').forEach(el => el.textContent = first);
  document.querySelectorAll('#userEmail').forEach(el => el.textContent = u.email || '');
}

function applyDark() {
  document.body.classList.toggle('dark', !!DB.get('dark_mode'));
  const cb = document.getElementById('darkModeToggle');
  if (cb) cb.checked = !!DB.get('dark_mode');
}
function toggleDark() { DB.set('dark_mode', !DB.get('dark_mode')); applyDark(); }
function toggleDarkFromCheckbox(el) { DB.set('dark_mode', el.checked); applyDark(); }

let _toastTimer;
function showToast(msg, type = 'success') {
  let t = document.getElementById('hwToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'hwToast'; t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = (type === 'success' ? '✓ ' : type === 'error' ? '✕ ' : '') + msg;
  t.className = `toast ${type}`;
  clearTimeout(_toastTimer);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

function formatCurrency(v) {
  const prefs = DB.get('prefs_' + getUserKey()) || {};
  const syms  = { AUD: '$', USD: '$', GBP: '£', EUR: '€', NZD: '$' };
  return (syms[prefs.currency] || '$') + parseFloat(v || 0).toFixed(2);
}
function formatDate(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}
function getCategoryIcon(c) {
  return { Food:'🍽',Drinks:'🍹',Transport:'🚗',Shopping:'🛍',Furniture:'🛋',
    Bills:'💡',Health:'💊',Entertainment:'🎬',Beauty:'💄',Travel:'✈️',Other:'📦' }[c] || '📦';
}
function closeModalOutside(e, id) {
  if (e.target.id === id) document.getElementById(id).style.display = 'none';
}
function toggleSidebar() { document.getElementById('sidebar')?.classList.toggle('open'); }

/* AUTH PAGE helpers */
function switchTab(tab) {
  document.getElementById('loginForm').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('loginTab').classList.toggle('active',  tab === 'login');
  document.getElementById('signupTab').classList.toggle('active', tab === 'signup');
}
function togglePass(id, btn) {
  const el = document.getElementById(id); if (!el) return;
  el.type = el.type === 'password' ? 'text' : 'password';
  btn.textContent = el.type === 'password' ? '👁' : '🙈';
}
function checkStrength(val) {
  const bar  = document.getElementById('strengthBar');
  const fill = document.getElementById('strengthFill');
  const lbl  = document.getElementById('strengthLabel');
  if (!bar) return;
  if (!val) { bar.style.display = 'none'; return; }
  bar.style.display = 'block';
  let s = 0;
  if (val.length >= 8) s++;
  if (/[A-Z]/.test(val)) s++;
  if (/[0-9]/.test(val)) s++;
  if (/[^A-Za-z0-9]/.test(val)) s++;
  const l = [
    { w: '25%', c: '#f87171', t: 'Weak' },
    { w: '50%', c: '#fbbf24', t: 'Fair' },
    { w: '75%', c: '#60a5fa', t: 'Good' },
    { w: '100%', c: '#34d399', t: 'Strong ✓' },
  ][Math.max(0, s - 1)];
  fill.style.width = l.w; fill.style.background = l.c;
  lbl.textContent = l.t; lbl.style.color = l.c;
}

/* ============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  applyDark();

  if (!document.body.classList.contains('auth-page')) {
    requireAuth();
    populateSidebarUser();
    const g = document.getElementById('greetName');
    if (g) { const u = getCurrentUser(); g.textContent = u?.firstName || 'there'; }
    const m = document.getElementById('currentMonth');
    if (m) m.textContent = new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    }
  });
});
