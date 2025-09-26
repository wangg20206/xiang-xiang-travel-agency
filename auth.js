// auth.js － Firebase v12（CDN/ESM）完整版＋重新填入口

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, onAuthStateChanged, signOut,
  setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFfSE-jujXp_gs-Exy8ZscUd75KLLTnUI",
  authDomain: "trip0-682b0.firebaseapp.com",
  projectId: "trip0-682b0",
  storageBucket: "trip0-682b0.appspot.com",
  messagingSenderId: "364871344899",
  appId: "1:364871344899:web:60baf6935ac7f80f883f36",
  measurementId: "G-7E6FS8K0KJ"
};

const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch {}

const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const $ = (sel) => document.querySelector(sel);
const loginBtn   = $('#loginBtn');
const logoutBtn  = $('#logoutBtn');
const statusEl   = $('#status');
const userBox    = $('#userBox');
const nameEl     = $('#name');
const emailEl    = $('#email');
const photoEl    = $('#photo');

const form       = $('#profileForm');
const msg        = $('#pf_msg');
const nameInput  = $('#pf_name');
const phoneInput = $('#pf_phone');
const bdayInput  = $('#pf_birthday');
const noteInput  = $('#pf_note');

const editBtn    = $('#editProfileBtn');
const cancelBtn  = $('#cancelEditBtn');

let hasProfileDoc = false;
let cachedProfile = null; // 快取已存資料，編輯/取消用

function renderSignedIn(user) {
  if (statusEl) statusEl.textContent = '你已成功登入';
  if (loginBtn)  loginBtn.style.display  = 'none';
  if (logoutBtn) logoutBtn.style.display = 'inline-flex';
  if (userBox)   userBox.style.display   = 'block';
  if (nameEl)    nameEl.textContent  = user.displayName ?? '(未提供姓名)';
  if (emailEl)   emailEl.textContent = user.email ?? '';
  if (photoEl)   photoEl.src = user.photoURL || '';
}
function renderSignedOut() {
  if (statusEl) statusEl.textContent = '尚未登入';
  if (loginBtn)  loginBtn.style.display  = 'inline-flex';
  if (logoutBtn) logoutBtn.style.display = 'none';
  if (userBox)   userBox.style.display   = 'none';
  if (nameEl)    nameEl.textContent  = '';
  if (emailEl)   emailEl.textContent = '';
  if (photoEl)   photoEl.removeAttribute?.('src');
  if (form)      form.style.display = 'none';
  if (msg)       msg.style.display  = 'none';
  if (editBtn)   editBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = 'none';
  hasProfileDoc = false;
  cachedProfile = null;
}

function fillFormWith(data, user) {
  nameInput && (nameInput.value  = (data?.name ?? user?.displayName ?? ''));
  phoneInput && (phoneInput.value = data?.phone ?? '');
  bdayInput && (bdayInput.value  = data?.birthday ?? '');
  noteInput && (noteInput.value  = data?.note ?? '');
}

onAuthStateChanged(auth, async (user) => {
  if (!user) { renderSignedOut(); return; }
  renderSignedIn(user);

  try {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    hasProfileDoc = snap.exists();

    if (snap.exists()) {
      cachedProfile = snap.data();
      fillFormWith(cachedProfile, user);
      // 預設：已填過先隱藏表單，顯示「重新填資料」
      if (form) form.style.display = 'none';
      if (editBtn) editBtn.style.display = 'inline';
      if (cancelBtn) cancelBtn.style.display = 'none';
    } else {
      cachedProfile = null;
      fillFormWith(null, user);
      if (form) form.style.display = 'block';
      if (editBtn) editBtn.style.display = 'none';
      if (cancelBtn) cancelBtn.style.display = 'none';
    }
  } catch (err) {
    console.error('讀取使用者文件失敗：', err);
  }
});

loginBtn?.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, provider);
    } else {
      alert('登入失敗：' + (err?.message || err));
      console.error(err);
    }
  }
});
getRedirectResult(auth).catch(() => {});

logoutBtn?.addEventListener('click', async () => {
  try { await signOut(auth); }
  catch (err) {
    alert('登出失敗：' + (err?.message || err));
    console.error(err);
  }
});

// 重新填入口：顯示表單、預填目前資料
editBtn?.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return;
  // 以快取為主，再嘗試重新抓（避免舊資料）
  try {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) cachedProfile = snap.data();
  } catch {}
  fillFormWith(cachedProfile, user);
  if (form) form.style.display = 'block';
  if (editBtn) editBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = 'inline';
  if (msg) msg.style.display = 'none';
});

// 取消編輯：收起表單、還原按鈕
cancelBtn?.addEventListener('click', () => {
  if (form) form.style.display = 'none';
  if (editBtn) editBtn.style.display = 'inline';
  if (cancelBtn) cancelBtn.style.display = 'none';
  if (msg) msg.style.display = 'none';
});

// 送出表單 → Firestore
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const payload = {
    uid: user.uid,
    email: user.email ?? '',
    name: (nameInput?.value || '').trim(),
    phone: (phoneInput?.value || '').trim(),
    birthday: bdayInput?.value || null,
    note: (noteInput?.value || '').trim(),
    updatedAt: serverTimestamp(),
  };
  if (!hasProfileDoc) payload.createdAt = serverTimestamp();

  try {
    await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
    hasProfileDoc = true;
    cachedProfile = { ...cachedProfile, ...payload };

    if (msg) { msg.textContent = '已儲存！'; msg.style.display = 'block'; }
    if (form) form.style.display = 'none';
    if (editBtn) editBtn.style.display = 'inline';
    if (cancelBtn) cancelBtn.style.display = 'none';
  } catch (err) {
    alert('儲存失敗：' + (err?.message || err));
    console.error(err);
  }
});
