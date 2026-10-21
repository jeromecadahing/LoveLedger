// Sends Ours push notifications. Run by .github/workflows/notify.yml.
//   MODE=check  (every 15 min) new transactions → the other person; "Send a reminder" taps → the other person
//   MODE=weekly (Sunday evening) balance summary → both of you, skipped when you're all square
//   MODE=test   a test notification → every phone that has notifications on
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getAuth } from "firebase-admin/auth";

initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = getFirestore(), fcm = getMessaging(), auth = getAuth();
const MODE = process.env.MODE || "check";
const APP_URL = (process.env.APP_URL || "").replace(/\/?$/, "/");

const SYM = { GBP: "£", PHP: "₱" };
const fmt = (n, c) => SYM[c] + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const namesDoc = (await db.doc("settings/names").get()).data() || {};
const names = { A: namesDoc.A || "Person 1", B: namesDoc.B || "Person 2" };
const nm = k => names[k];
const tokens = (await db.collection("pushTokens").get()).docs
  .map(d => ({ token: d.id, email: String(d.get("email") || "").toLowerCase() }));
const notTo = email => tokens.filter(t => t.email !== String(email || "").toLowerCase());

async function balanceText() {
  const bal = { GBP: 0, PHP: 0 }; // positive = B owes A, same as the app
  for (const d of (await db.collection("entries").get()).docs) {
    const e = d.data();
    if (e.settled || !SYM[e.currency] || !(e.amount > 0)) continue;
    bal[e.currency] += (e.from === "A" ? 1 : -1) * Number(e.amount);
  }
  const lines = [];
  for (const cur of ["GBP", "PHP"]) {
    const v = Math.round(bal[cur] * 100) / 100;
    if (v === 0) continue;
    const debtor = v > 0 ? "B" : "A", creditor = debtor === "A" ? "B" : "A";
    lines.push(`${nm(debtor)} owes ${nm(creditor)} ${fmt(Math.abs(v), cur)}`);
  }
  return lines.length ? lines.join("\n") : "You’re all square 🎉";
}

async function firstName(email) {
  try { const u = await auth.getUserByEmail(email); return (u.displayName || "").split(" ")[0] || null; }
  catch { return null; }
}

async function send(to, title, body) {
  if (!to.length) { console.log(`No phones to notify for "${title}"`); return; }
  const res = await fcm.sendEachForMulticast({
    tokens: to.map(t => t.token),
    webpush: {
      notification: { title, body, icon: APP_URL + "icon-192.png", badge: APP_URL + "icon-192.png" },
      fcmOptions: { link: APP_URL }
    }
  });
  // Forget phones that have uninstalled the app or switched notifications off.
  const gone = ["messaging/registration-token-not-registered", "messaging/invalid-registration-token"];
  await Promise.all(res.responses.map((r, i) =>
    r.error && gone.includes(r.error.code) ? db.collection("pushTokens").doc(to[i].token).delete() : null));
  res.responses.forEach(r => r.error && !gone.includes(r.error.code) && console.warn("Send failed:", r.error.code));
  console.log(`Sent "${title}" to ${res.successCount}/${to.length} phone(s)`);
}

function describe(e) {
  const total = e.total ?? e.amount;
  if (e.kind === "repay") return `${nm(e.from)} paid ${nm(e.to)} back ${fmt(e.amount, e.currency)}`;
  if (e.kind === "split") return `${nm(e.from)} paid ${fmt(total, e.currency)}, split 50/50. ${nm(e.to)} owes ${fmt(e.amount, e.currency)}`;
  return `${nm(e.from)} paid ${fmt(total, e.currency)} for ${nm(e.to)}`;
}

if (MODE === "test") {
  await send(tokens, "Ours notifications work 🎉", "You’ll get reminders and new transactions here.");
}

if (MODE === "weekly") {
  const text = await balanceText();
  if (text.startsWith("You’re all square")) console.log("All square, no weekly summary");
  else await send(tokens, "Weekly check-in", text);
}

if (MODE === "check") {
  // New transactions, grouped by who logged them.
  const fresh = (await db.collection("entries").where("notify", "==", true).get()).docs;
  const byPerson = {};
  for (const d of fresh) (byPerson[d.get("by") || ""] ??= []).push(d);
  for (const [by, docs] of Object.entries(byPerson)) {
    if (by) {
      if (docs.length <= 3) {
        for (const d of docs) { const e = d.data(); await send(notTo(by), e.note || (e.kind === "repay" ? "Paid back" : "New transaction"), describe(e)); }
      } else {
        await send(notTo(by), `${docs.length} new transactions`, await balanceText());
      }
    }
    await Promise.all(docs.map(d => d.ref.update({ notify: FieldValue.delete() })));
  }

  // "Send a reminder" taps.
  const nudges = (await db.collection("nudges").orderBy("createdAt").get()).docs;
  if (nudges.length) {
    const balance = await balanceText();
    for (const d of nudges) {
      const n = d.data();
      const who = await firstName(n.by);
      const body = n.note ? `${n.note}\n\n${balance}` : balance;
      // Reminders older than a day (e.g. sent while the Action was paused) are dropped instead of delivered late.
      if (Date.now() - (n.createdAt || 0) < 24 * 3600e3) await send(notTo(n.by), who ? `💙 Reminder from ${who}` : "💙 A reminder from Ours", body);
      await d.ref.delete();
    }
  }
}
