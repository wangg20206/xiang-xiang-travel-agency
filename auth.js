// ✅ CDN 模組匯入（適合 GitHub Pages 純前端）
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  signOut, onAuthStateChanged, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// ← 把這段換成你專案「Your apps」裡的 config（注意 storageBucket 應為 *.appspot.com）
const firebaseConfig = {
  apiKey: "AIzaSyAFfSE-jujXp_gs-Exy8ZscUd75KLLTnUI",
  authDomain: "trip0-682b0.firebaseapp.com",
  projectId: "trip0-682b0",
  storageBucket: "trip0-682b0.appspot.com",   // ← 修正
  messagingSenderId: "364871344899",
  appId: "1:364871344899:web:60baf6935ac7f80f883f36"
};

// 初始化 & Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);

const statusEl = document.getElementById('status');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

onAuthStateChanged(auth, (user) => {
  if (user) {
    statusEl.textContent = `已登入：${user.displayName ?? ''} ${user.email ?? ''}`;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  } else {
    statusEl.textContent = '尚未登入';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
  }
});

const provider = new GoogleAuthProvider();
loginBtn.addEventListener('click', async () => {
  try { await signInWithPopup(auth, provider); }
  catch (e) { alert('登入失敗：' + (e.message || e)); }
});
logoutBtn.addEventListener('click', async () => {
  try { await signOut(auth); }
  catch (e) { alert('登出失敗：' + (e.message || e)); }
});
