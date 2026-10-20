// 1. Paste the config from Firebase console → Project settings → Your apps → Web app.
//    These values are not secret; your Firestore rules are what keep the data private.
export const firebaseConfig = {
  apiKey: "PASTE_HERE",
  authDomain: "PASTE_HERE.firebaseapp.com",
  projectId: "PASTE_HERE",
  storageBucket: "PASTE_HERE.appspot.com",
  messagingSenderId: "PASTE_HERE",
  appId: "PASTE_HERE"
};

// 2. The two Google accounts allowed in. Must match the list in firestore.rules.
export const ALLOWED_EMAILS = [
  "you@gmail.com",
  "wife@gmail.com"
];
