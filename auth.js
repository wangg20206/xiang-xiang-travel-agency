// auth.js － 使用 CDN/ESM（v12.3.0）
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// （可選）Analytics：若你的頁面在 HTTPS & 有 measurementId 再啟用
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";

// ← 把 config 換成你專案的；注意 storageBucket 要是 *.appspot.com
const firebaseConfig = {
  apiKey: "AIzaSyAFfSE-jujXp_gs-Exy8ZscUd75KLLTnUI",
  authDomain: "trip0-682b0.firebaseapp.com",
  projectId: "trip0-682b0",
  storageBucket: "trip0-682b0.appspot.com",   // ← 修正這裡
  messagingSenderId: "364871344899",
  appId: "1:364871344899:web:60baf6935ac7f80f883f36",
  measurementId: "G-7E6FS8K0KJ"               // 若不用 Analytics 可刪
};

// 初始化
const app = initializeApp(firebaseConfig);

// （可選）Analytics：HTTP 或無 measurementId 會丟錯，可用 try 包起來
try { getAnalytics(app); } catch { /* ignore if not available */ }

// Auth 初始化與持久化（重整不登出）
const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);

// UI 元素
const loginBtn  = document.querySelector('#loginBtn');
const logoutBtn = document.querySelector('#logoutBtn');
const statusEl  = document.querySelector('#status');      // 也可顯示使用者資訊的元素
const nameEl    = document.querySelector('#name');        // （可選）
const emailEl   = document.querySelector('#email');       // （可選）
const photoEl   = document.querySelector('#photo');       // （可選）

// 監聽登入狀態
onAuthStateChanged(auth, (user) => {
  if (user) {
    statusEl.textContent = `已登入：${user.displayName ?? ''} ${user.email ?? ''}`;
    loginBtn.style.display  = 'none';
    logoutBtn.style.display = 'inline-block';
    if (nameEl)  nameEl.textContent  = user.displayName ?? '';
    if (emailEl) emailEl.textContent = user.email ?? '';
    if (photoEl) photoEl.src = user.photoURL || '';
  } else {
    statusEl.textContent = '尚未登入';
    loginBtn.style.display  = 'inline-block';
    logoutBtn.style.display = 'none';
    if (nameEl)  nameEl.textContent  = '';
    if (emailEl) emailEl.textContent = '';
    if (photoEl) photoEl.removeAttribute('src');
  }
});

// 登入：先嘗試 popup，被擋則改 redirect
const provider = new GoogleAuthProvider();
loginBtn?.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    if (err?.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider);
    } else {
      alert('登入失敗：' + (err?.message || err));
      console.error(err);
    }
  }
});

// 讓 redirect 回來後完成登入
getRedirectResult(auth).catch(() => { /* ignore */ });

// 登出
logoutBtn?.addEventListener('click', async () => {
  try { await signOut(auth); }
  catch (err) {
    alert('登出失敗：' + (err?.message || err));
    console.error(err);
  }
});
