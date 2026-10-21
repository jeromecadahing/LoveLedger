// Lets Android offer "Install app", lets the app open without signal,
// and shows push notifications (reminders, new transactions) when the app is closed.
// Always tries the network first, so updates you push to GitHub show up straight away.

// Firebase Cloud Messaging. These values are the public ones from config.js
// (a service worker can't import config.js, so they're repeated here).
try {
  importScripts(
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
  );
  firebase.initializeApp({
    apiKey: "AIzaSyBRA7f_Y2EJcThuXskLooMo_nrEYQlXcKo",
    authDomain: "loveledger-bf823.firebaseapp.com",
    projectId: "loveledger-bf823",
    storageBucket: "loveledger-bf823.firebasestorage.app",
    messagingSenderId: "1075159355598",
    appId: "1:1075159355598:web:d316e14418f093d826c09f"
  });
  // Displays incoming notifications and opens the app when one is tapped.
  firebase.messaging();
} catch (_) { /* no signal on first install: the app still works, notifications start next time */ }

const CACHE = "ours-v2";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req))
  );
});
