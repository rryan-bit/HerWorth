/* =============================================
   HERWORTH — CORE APP JS
   Firebase Auth + AES-GCM Encrypted Storage
   ============================================= */

/* ---- Plain DB for non-sensitive prefs ---- */
const DB = {
  get: (k) => { try { return JSON.parse(localStorage.getItem('hw_' + k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem('hw_' + k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem('hw_' + k),
};

/* ---- AES-GCM encryption (PBKDF2 key derived from uid) ---- */
const _SALT = "herworth_v1_2026";

async function _deriveKey(uid) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey("raw", enc.encode(uid + _SALT), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(_SALT), iterations: 100000, hash: "SHA-256" },
    km, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}

async function _encrypt(uid, data) {
  try {
    const key = await _deriveKey(uid);
    const iv  = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const ct  = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(data)));
    const buf = new Uint8Array(12 + ct.byteLength);
    buf.set(iv, 0); buf.set(new Uint8Array(ct), 12);
    return btoa(String.fromCharCode(...buf));
  } catch { return null; }
}

async function _decrypt(uid, b64) {
  try {
    const key = await _deriveKey(uid);
    const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12) }, key, buf.slice(12));
    return JSON.parse(new TextDecoder().decode(dec));
  } catch { return null; }
}

function _skey(uid, k) { return "hw_e_" + uid.slice(0, 10) + "_" + k; }
async function secureSet(uid, k, v) { const e = await _encrypt(uid, v); if (e) localStorage.setItem(_skey(uid, k), e); }
async function secureGet(uid, k) { const r = localStorage.getItem(_skey(uid, k)); return r ? _decrypt(uid, r) : null; }
function secureDel(uid, k) { localStorage.removeItem(_skey(uid, k)); }

/* ---- AUTH ---- */
let _currentUser = null;
function getCurrentUser() { return _currentUser || DB.get('session_user'); }
function setCurrentUser(u) { _currentUser = u; DB.set('session_user', u); }
function requireAuth() {
  const u = getCurrentUser();
  if (!u || !u.uid) { window.location.href = 'index.html'; return null; }
  return u;
}
function logout() {
  _currentUser = null; DB.del('session_user');
  if (window._fbAuth) window._fbAuth.signOut().catch(() => {});
  window.location.href = 'index.html';
}
function getUserKey() {
  const u = getCurrentUser();
  return u ? (u.uid || (u.email || 'g').replace(/[^a-z0-9]/gi, '_')) : 'guest';
}

/* ---- ENCRYPTED DATA ACCESSORS ---- */
async function getExpenses()  { return (await secureGet(getUserKey(), 'expenses'))  || []; }
async function saveExpenses(d){ await secureSet(getUserKey(), 'expenses', d); }
async function getBudgets()   { return (await secureGet(getUserKey(), 'budgets'))   || []; }
async function saveBudgets(d) { await secureSet(getUserKey(), 'budgets', d); }
async function getGoals()     { return (await secureGet(getUserKey(), 'goals'))     || []; }
async function saveGoals(d)   { await secureSet(getUserKey(), 'goals', d); }
async function getAccounts()  { return (await secureGet(getUserKey(), 'accounts'))  || []; }
async function saveAccounts(d){ await secureSet(getUserKey(), 'accounts', d); }
async function getRecurring() { return (await secureGet(getUserKey(), 'recurring')) || []; }
async function saveRecurring(d){ await secureSet(getUserKey(), 'recurring', d); }

/* ---- DEMO SEED ---- */
function _nextDate(dom) {
  const n = new Date(); let d = new Date(n.getFullYear(), n.getMonth(), dom || n.getDate());
  if (d <= n) d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}
async function seedDemoData(uid) {
  const existing = await secureGet(uid, 'expenses');
  if (existing && existing.length) return;
  const now = new Date();
  const cats = { Food:['Groceries','Lunch','Dinner out','Coffee'], Drinks:['Wine','Smoothie','Cocktails'],
    Transport:['Uber','Petrol','Bus pass','Parking'], Shopping:['New dress','Shoes','Online order'],
    Bills:['Electricity','Internet','Phone plan'], Health:['Gym','Vitamins','Skincare'],
    Entertainment:['Netflix','Movie tickets','Concert'], Beauty:['Haircut','Nails','Makeup'] };
  const keys = Object.keys(cats);
  const expenses = Array.from({length: 28}, (_, i) => {
    const cat = keys[Math.floor(Math.random() * keys.length)];
    const d = new Date(now); d.setDate(d.getDate() - Math.floor(Math.random() * 60));
    const descs = cats[cat];
    return { id:'exp_'+Date.now()+'_'+i, amount:(Math.random()*180+5).toFixed(2), category:cat,
      description:descs[Math.floor(Math.random()*descs.length)], date:d.toISOString().split('T')[0],
      createdAt:d.toISOString() };
  });
  await secureSet(uid, 'expenses', expenses);
  await secureSet(uid, 'budgets', [
    {id:'b1',category:'Food',limit:400}, {id:'b2',category:'Shopping',limit:200},
    {id:'b3',category:'Transport',limit:150}, {id:'b4',category:'Entertainment',limit:100}]);
  await secureSet(uid, 'goals', [
    {id:'g1',name:'Emergency Fund',target:5000,saved:1800,emoji:'💰'},
    {id:'g2',name:'Holiday Fund',target:3000,saved:750,emoji:'🏖'},
    {id:'g3',name:'New Laptop',target:2000,saved:1400,emoji:'💻'}]);
  await secureSet(uid, 'accounts', [
    {id:'a1',name:'Everyday Account',type:'Checking',balance:3420.50,color:'#f8c8dc'},
    {id:'a2',name:'High Interest Savings',type:'Savings',balance:12840.00,color:'#b8ddf0'},
    {id:'a3',name:'Investment Portfolio',type:'Investment',balance:8200.00,color:'#b8f0d4'}]);
  await secureSet(uid, 'recurring', [
    {id:'r1',name:'Rent',amount:'1800.00',category:'Bills',frequency:'monthly',dayOfMonth:1,active:true,nextDate:_nextDate(1)},
    {id:'r2',name:'Netflix',amount:'17.99',category:'Entertainment',frequency:'monthly',dayOfMonth:15,active:true,nextDate:_nextDate(15)},
    {id:'r3',name:'Gym Membership',amount:'49.99',category:'Health',frequency:'monthly',dayOfMonth:1,active:true,nextDate:_nextDate(1)},
    {id:'r4',name:'Spotify',amount:'11.99',category:'Entertainment',frequency:'monthly',dayOfMonth:20,active:true,nextDate:_nextDate(20)}]);
}

/* ---- UI HELPERS ---- */
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
  const cb = document.getElementById('darkModeToggle'); if (cb) cb.checked = !!DB.get('dark_mode');
}
function toggleDark() { DB.set('dark_mode', !DB.get('dark_mode')); applyDark(); }
function toggleDarkFromCheckbox(el) { DB.set('dark_mode', el.checked); applyDark(); }

let _tt;
function showToast(msg, type='success') {
  let t = document.getElementById('hwToast');
  if (!t) { t = document.createElement('div'); t.id='hwToast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = (type==='success'?'✓ ':type==='error'?'✕ ':'')+msg;
  t.className = `toast ${type}`;
  clearTimeout(_tt);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  _tt = setTimeout(() => t.classList.remove('show'), 3200);
}
function formatCurrency(v) {
  const syms = {AUD:'$',USD:'$',GBP:'£',EUR:'€',NZD:'$'};
  const prefs = DB.get('prefs_'+getUserKey()) || {};
  return (syms[prefs.currency]||'$')+parseFloat(v||0).toFixed(2);
}
function formatDate(s) {
  return new Date(s+'T00:00:00').toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'});
}
function getCategoryIcon(c) {
  return {Food:'🍽',Drinks:'🍹',Transport:'🚗',Shopping:'🛍',Furniture:'🛋',
    Bills:'💡',Health:'💊',Entertainment:'🎬',Beauty:'💄',Travel:'✈️',Other:'📦'}[c]||'📦';
}
function closeModalOutside(e, id) { if (e.target.id===id) document.getElementById(id).style.display='none'; }
function toggleSidebar() { document.getElementById('sidebar')?.classList.toggle('open'); }

/* ---- AUTH PAGE ---- */
function switchTab(tab) {
  document.getElementById('loginForm').style.display  = tab==='login'  ? 'block':'none';
  document.getElementById('signupForm').style.display = tab==='signup' ? 'block':'none';
  document.getElementById('loginTab').classList.toggle('active', tab==='login');
  document.getElementById('signupTab').classList.toggle('active', tab==='signup');
}
function togglePass(id, btn) {
  const el=document.getElementById(id); if(!el) return;
  el.type = el.type==='password'?'text':'password';
  btn.textContent = el.type==='password'?'👁':'🙈';
}
function checkStrength(val) {
  const bar=document.getElementById('strengthBar'), fill=document.getElementById('strengthFill'), lbl=document.getElementById('strengthLabel');
  if (!bar) return;
  if (!val) { bar.style.display='none'; return; }
  bar.style.display='block';
  let s=0; if(val.length>=8)s++; if(/[A-Z]/.test(val))s++; if(/[0-9]/.test(val))s++; if(/[^A-Za-z0-9]/.test(val))s++;
  const lvl=[{w:'25%',c:'#f87171',t:'Weak'},{w:'50%',c:'#fbbf24',t:'Fair'},{w:'75%',c:'#60a5fa',t:'Good'},{w:'100%',c:'#34d399',t:'Strong ✓'}][Math.max(0,s-1)];
  fill.style.width=lvl.w; fill.style.background=lvl.c; lbl.textContent=lvl.t; lbl.style.color=lvl.c;
}

async function handleLogin() {
  const email=document.getElementById('loginEmail')?.value.trim();
  const pass=document.getElementById('loginPassword')?.value;
  ['loginEmailErr','loginPassErr'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='';});
  document.getElementById('loginError').style.display='none';
  let ok=true;
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){document.getElementById('loginEmailErr').textContent='Valid email required.';ok=false;}
  if(!pass||pass.length<6){document.getElementById('loginPassErr').textContent='Password required.';ok=false;}
  if(!ok) return;
  const btn=document.querySelector('#loginForm .btn-primary');
  btn.querySelector('.btn-label').style.display='none'; btn.querySelector('.btn-spinner').style.display='inline'; btn.disabled=true;
  try {
    const {auth,signInWithEmailAndPassword,db,doc,getDoc} = await import('./firebase-config.js');
    window._fbAuth = auth;
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;
    let firstName=email.split('@')[0], lastName='', joined=new Date().toISOString();
    try { const snap=await getDoc(doc(db,'users',uid)); if(snap.exists()){const d=snap.data();firstName=d.firstName||firstName;lastName=d.lastName||'';joined=d.joined||joined;} } catch {}
    setCurrentUser({uid,email,firstName,lastName,joined});
    await seedDemoData(uid);
    window.location.href='dashboard.html';
  } catch(err) {
    const msg=['auth/user-not-found','auth/wrong-password','auth/invalid-credential'].includes(err.code)
      ?'Incorrect email or password.':err.code==='auth/too-many-requests'?'Too many attempts. Wait a moment.':'Login failed. Try again.';
    document.getElementById('loginError').style.display='block';
    document.getElementById('loginError').textContent=msg;
    btn.querySelector('.btn-label').style.display='inline'; btn.querySelector('.btn-spinner').style.display='none'; btn.disabled=false;
  }
}

async function handleSignup() {
  const first=document.getElementById('signupFirst')?.value.trim();
  const last=document.getElementById('signupLast')?.value.trim();
  const email=document.getElementById('signupEmail')?.value.trim();
  const pass=document.getElementById('signupPassword')?.value;
  const terms=document.getElementById('agreeTerms')?.checked;
  ['signupFirstErr','signupEmailErr','signupPassErr','signupTermsErr'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='';});
  document.getElementById('signupError').style.display='none';
  let ok=true;
  if(!first){document.getElementById('signupFirstErr').textContent='First name required.';ok=false;}
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){document.getElementById('signupEmailErr').textContent='Valid email required.';ok=false;}
  if(!pass||pass.length<8){document.getElementById('signupPassErr').textContent='Min 8 characters.';ok=false;}
  if(!terms){document.getElementById('signupTermsErr').textContent='You must agree to continue.';ok=false;}
  if(!ok) return;
  const btn=document.querySelector('#signupForm .btn-primary');
  btn.querySelector('.btn-label').style.display='none'; btn.querySelector('.btn-spinner').style.display='inline'; btn.disabled=true;
  try {
    const {auth,createUserWithEmailAndPassword,db,doc,setDoc,serverTimestamp} = await import('./firebase-config.js');
    window._fbAuth = auth;
    const cred=await createUserWithEmailAndPassword(auth,email,pass);
    const uid=cred.user.uid; const joined=new Date().toISOString();
    await setDoc(doc(db,'users',uid),{firstName:first,lastName:last||'',email,joined,createdAt:serverTimestamp()});
    setCurrentUser({uid,email,firstName:first,lastName:last||'',joined});
    await seedDemoData(uid);
    window.location.href='dashboard.html';
  } catch(err) {
    const msg=err.code==='auth/email-already-in-use'?'Email already registered.':'Signup failed. Try again.';
    document.getElementById('signupError').style.display='block'; document.getElementById('signupError').textContent=msg;
    btn.querySelector('.btn-label').style.display='inline'; btn.querySelector('.btn-spinner').style.display='none'; btn.disabled=false;
  }
}

async function handleGoogleAuth() {
  try {
    const {auth,googleProvider,signInWithPopup,db,doc,getDoc,setDoc,serverTimestamp}=await import('./firebase-config.js');
    window._fbAuth=auth;
    const result=await signInWithPopup(auth,googleProvider);
    const uid=result.user.uid, email=result.user.email, joined=new Date().toISOString();
    let firstName=result.user.displayName?.split(' ')[0]||email.split('@')[0];
    let lastName=result.user.displayName?.split(' ').slice(1).join(' ')||'';
    const snap=await getDoc(doc(db,'users',uid));
    if(!snap.exists()) await setDoc(doc(db,'users',uid),{firstName,lastName,email,joined,createdAt:serverTimestamp()});
    else { const d=snap.data(); firstName=d.firstName||firstName; lastName=d.lastName||lastName; }
    setCurrentUser({uid,email,firstName,lastName,joined});
    await seedDemoData(uid);
    window.location.href='dashboard.html';
  } catch(err) { console.error(err); showToast('Google sign-in failed.','error'); }
}

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  applyDark();
  if (!document.body.classList.contains('auth-page')) {
    requireAuth(); populateSidebarUser();
    const g=document.getElementById('greetName'); if(g){const u=getCurrentUser();g.textContent=u?.firstName||'there';}
    const m=document.getElementById('currentMonth'); if(m) m.textContent=new Date().toLocaleDateString('en-AU',{month:'long',year:'numeric'});
  }
  document.addEventListener('keydown', e => { if(e.key==='Escape') document.querySelectorAll('.modal-overlay').forEach(m=>m.style.display='none'); });
});
