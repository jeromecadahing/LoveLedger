# Ours — money between us

A private tracker for money lent and paid back between two people, in GBP and PHP, with the bank each payment came from. Hosted free on GitHub Pages, data stored in Firebase Firestore, sign-in with Google. Only the two Google accounts you list can read or change anything.

## Setup (about 20 minutes)

1. **Create a Firebase project.** Go to console.firebase.google.com, choose Add project, and skip Google Analytics. The free Spark plan is plenty.
2. **Turn on Google sign-in.** Build → Authentication → Get started → Sign-in method → Google → Enable.
3. **Create the database.** Build → Firestore Database → Create database. Pick a location near you (e.g. `europe-west2` London) and start in **production mode**.
4. **Lock it down.** In Firestore → Rules, paste the contents of `firestore.rules`, replace the two emails with your Gmail and your wife's Gmail (lowercase), and click Publish.
5. **Register the web app.** Project settings (gear icon) → Your apps → Web (`</>`). Copy the `firebaseConfig` values into `config.js`, and put the same two emails in `ALLOWED_EMAILS`.
6. **Put it on GitHub.** Create a repository, upload all these files to it, then go to Settings → Pages → Deploy from branch → `main` / root. Your site will be at `https://YOUR-USERNAME.github.io/REPO-NAME/`.
7. **Allow your site to sign in.** Firebase → Authentication → Settings → Authorized domains → Add domain → `YOUR-USERNAME.github.io`.
8. **Install on your phones.** Open the site, sign in, then iPhone: Share → Add to Home Screen; Android: menu → Add to Home screen / Install app.

## Extra hardening (recommended)

Restrict the API key: Google Cloud console → APIs & Services → Credentials → the "Browser key" → Application restrictions → Websites → add `https://YOUR-USERNAME.github.io/*`. This stops other sites from using your project's quota.

Use a private repo if you prefer. GitHub Pages from a private repo needs a paid GitHub plan, but nothing in this repo is secret either way: the Firebase config is meant to be public, and the rules are what protect the data.

## Notes

The app works offline. Entries you add without signal are saved on the phone and sync when you're back online.

If Google sign-in fails inside the home-screen app on iPhone, open the site once in Safari, sign in there, then use Add to Home Screen again.

To change the people's names shown in the app, tap **Names**. To change which accounts are allowed, edit both `firestore.rules` (and publish it in Firebase) and `config.js`.
