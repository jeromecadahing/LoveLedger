// Firebase settings for this app. These are not secret;
// the Firestore rules are what keep the data private.
export const firebaseConfig = {
  apiKey: "AIzaSyBRA7f_Y2EJcThuXskLooMo_nrEYQlXcKo",
  authDomain: "loveledger-bf823.firebaseapp.com",
  projectId: "loveledger-bf823",
  storageBucket: "loveledger-bf823.firebasestorage.app",
  messagingSenderId: "1075159355598",
  appId: "1:1075159355598:web:d316e14418f093d826c09f",
  measurementId: "G-GQ8H97BZ8G"
};

// The two Google accounts allowed in. Must match firestore.rules.
export const ALLOWED_EMAILS = [
  "ecadahing@gmail.com",
  "tonsdinglasan@gmail.com"
];

// Web Push key for notifications. Firebase console → Project settings →
// Cloud Messaging → Web Push certificates → Generate key pair, then paste the "Key pair" value here.
export const VAPID_KEY = "BMmW-XuAJ7rGcH8ROFbQ9VsQIuP4yHYr0kTx8iwbSwpCxDWT3ostLgmG4w0LIblE7KRlS5hbiePab6sMhax1X8Y";
