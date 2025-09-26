// auth.js － Firebase v12（CDN/ESM）完整版
// 功能：Google 登入/登出、狀態監聽、基本資料表單寫入 Firestore、popup→redirect 後備、持久化

// --- Imports（CDN 模組） ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, onAuthStateChanged, signOut,
  setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
// （可選）Analytics：有 measurementId 才會成功，沒開也不影響
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";

// --- Firebase 設定（請確認 storageBucket 為 *.appspot.com） ---
const firebaseConfig = {
  apiKey: "AIzaSyAFfSE-jujXp_gs-Exy8ZscUd75KLLTnUI",
  authDomain: "trip0-682b0.firebaseapp.com",
  projectId: "trip0-682b0",
  storageBucket: "trip0-682b0.appspot.com",        // ← 修正為 appspot.com
  messagingSenderId: "364871344899",
  appId: "1:364871344899:web:60baf6935ac7f80f883f36",
  measurementId: "G-7E6FS8K0KJ"                     // 沒開 Analytics 可刪這行與 import
};

// --- 初始化 ---
const app = initializeApp(firebaseConfig);
// Analytics 非必需：HTTPS + measurementId 才能用
try { getAnalytics(app); } catch { /* ignore if not available */ }

const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);  // 重整後仍維持登入
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- 抓取頁面元素（不存在就為 null；本檔可在多頁共用） ---
const $ = (sel) => document.querySelector(sel);
const loginBtn   = $('#loginBtn');
const logoutBtn  = $('#logoutBtn');
const statusEl   = $('#status');
const userBox    = $('#userBox');
const nameEl     = $('#name');
const emailEl    = $('#email');
const photoEl    = $('#photo');

// 基本資料表單（登入頁才會有）
const form       = $('#profileForm');
const msg        = $('#pf_msg');
const nameInput  = $('#pf_name');
const phoneInput = $('#pf_phone');
const bdayInput  = $('#pf_birthday');
const noteInput  = $('#pf_note');

let hasProfileDoc = false; // 用來決定是否第一次寫入

// --- UI 更新 ---
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
  hasProfileDoc = false;
}

// --- 監聽登入狀態 ---
onAuthStateChanged(auth, async (user) => {
  if (!user) { renderSignedOut(); return; }
  renderSignedIn(user);

  // 讀取 Firestore：users/{uid}
  if (!db) return;
  try {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    hasProfileDoc = snap.exists();

    if (snap.exists()) {
      const data = snap.data();
      if (nameInput)  nameInput.value  = (data.name ?? user.displayName ?? '');
      if (phoneInput) phoneInput.value = data.phone ?? '';
      if (bdayInput)  bdayInput.value  = data.birthday ?? '';
      if (noteInput)  noteInput.value  = data.note ?? '';
      // 預設：已填過就不顯示表單（想允許修改可改成顯示）
      if (form) form.style.display = 'none';
    } else {
      // 第一次登入：預填姓名並顯示表單
      if (nameInput) nameInput.value = user.displayName ?? '';
      if (form) form.style.display = 'block';
    }
  } catch (err) {
    console.error('讀取使用者文件失敗：', err);
  }
});

// --- 登入：先用 popup，被擋再改 redirect ---
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
// 讓 redirect 回來後完成登入（忽略錯誤即可）
getRedirectResult(auth).catch(() => {});

// --- 登出 ---
logoutBtn?.addEventListener('click', async () => {
  try { await signOut(auth); }
  catch (err) {
    alert('登出失敗：' + (err?.message || err));
    console.error(err);
  }
});

// --- 基本資料表單提交 → 寫入 Firestore ---
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user || !db) return;

  // 準備 payload
  const payload = {
    uid: user.uid,
    email: user.email ?? '',
    name: (nameInput?.value || '').trim(),
    phone: (phoneInput?.value || '').trim(),
    birthday: bdayInput?.value || null, // yyyy-mm-dd
    note: (noteInput?.value || '').trim(),
    updatedAt: serverTimestamp(),
  };
  // 第一次寫入才加 createdAt
  if (!hasProfileDoc) payload.createdAt = serverTimestamp();

  try {
    await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
    if (msg)  { msg.textContent = '已儲存！'; msg.style.display = 'block'; }
    if (form) form.style.display = 'none';
    hasProfileDoc = true;
  } catch (err) {
    alert('儲存失敗：' + (err?.message || err));
    console.error(err);
  }
});
