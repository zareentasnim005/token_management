# 🍽️ PUST অনলাইন হল মিল ম্যানেজমেন্ট সিস্টেম

পাবনা বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের চারটি হলের জন্য অনলাইন মিল টোকেন সিস্টেম।
শিক্ষার্থী → আইডি → হল → মিল → bKash পেমেন্ট (ডেমো) → QR টোকেন। অ্যাডমিন → লগইন → QR স্ক্যান → খাবার প্রদান → হিসাব।

**প্রযুক্তি:** React 19 + Vite, প্লেইন CSS (`src/styles.css`), Firebase (Firestore + Authentication), `qrcode.react` (QR তৈরি), `html5-qrcode` (QR স্ক্যান)।

---

## ⚡ দ্রুত শুরু (৫টি ধাপ)

আগে কম্পিউটারে **Node.js (v18 বা তার বেশি)** ইনস্টল থাকতে হবে → https://nodejs.org

### ধাপ ১ — প্যাকেজ ইনস্টল
VS Code এ প্রজেক্ট ফোল্ডার খুলে Terminal (`Ctrl + ~`) এ:
```bash
npm install
```

### ধাপ ২ — Firebase প্রজেক্ট বানাও
1. https://console.firebase.google.com এ যাও → **Add project** → একটি নাম দাও (Google Analytics দরকার নেই)।
2. **Build → Authentication → Get started**, তারপর **Sign-in method** ট্যাবে দুটি চালু করো:
   - ✅ **Anonymous** (শিক্ষার্থীদের জন্য)
   - ✅ **Email/Password** (অ্যাডমিনদের জন্য)
3. **Build → Firestore Database → Create database** → *Production mode* → লোকেশন (যেমন `asia-south1`) বেছে নাও।
4. **Project settings (⚙️) → General → Your apps → Web (`</>`)** এ অ্যাপ রেজিস্টার করো। যে `firebaseConfig` দেখাবে সেটা পরের ধাপে লাগবে।

### ধাপ ৩ — `.env` ফাইল বানাও
`.env.example` ফাইলটি কপি করে নাম দাও `.env`, তারপর Firebase config এর মান বসাও:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**Security Rules বসাও (খুব গুরুত্বপূর্ণ):** Firebase Console → Firestore Database → **Rules** ট্যাবে `firestore.rules` ফাইলের পুরো লেখা পেস্ট করে **Publish** চাপো।
(অথবা firebase-tools দিয়ে: `npm i -g firebase-tools && firebase login && firebase use <project-id> && firebase deploy --only firestore:rules`)

### ধাপ ৪ — ডেমো ডেটা ঢোকাও (হল, মিল, শিক্ষার্থী, ডেমো টোকেন, ডেমো অ্যাডমিন)
1. Firebase Console → **Project settings → Service accounts → Generate new private key**।
2. ডাউনলোড হওয়া ফাইলের নাম বদলে `serviceAccountKey.json` করে **প্রজেক্ট ফোল্ডারের ভেতরে (`package.json` এর পাশে)** রাখো। ⚠️ এই ফাইল কাউকে দিও না / GitHub এ তুলো না (`.gitignore` এ আছে)।
3. চালাও:
```bash
npm run seed
```
এতে তৈরি হবে: ৪টি হল, ৬টি মিল অপশন, ৬ জন ডেমো শিক্ষার্থী, ৫টি ডেমো টোকেন এবং একটি **সুপার অ্যাডমিন**।

### ধাপ ৫ — চালাও
```bash
npm run dev
```
ব্রাউজারে http://localhost:5173 খোলো। ✅

---

## 🔑 ডেমো লগইন তথ্য

| ভূমিকা | তথ্য |
|---|---|
| শিক্ষার্থী (মেয়ে) | আইডি `2021101001`, `2022201001`, `2023301001` (গণতন্ত্র হল), `2023301002` (মাতৃভাষা হল) |
| শিক্ষার্থী (ছেলে) | আইডি `2022201002` (৬ জুলাই হল), `2022201003` (স্বাধীনতা হল) |
| অ্যাডমিন (সুপার) | ইউজার নাম `admin123` , পাসওয়ার্ড `admin123` (যেকোনো হল বেছে নিয়ে ঢুকতে পারবে) |
| ডেমো টোকেন | `TKN-002` (অব্যবহৃত, আজকের) · `TKN-003` (অব্যবহৃত, আজকের) · `TKN-001` (ব্যবহৃত) · `TKN-005` (মেয়াদোত্তীর্ণ) |

> ⚠️ বাস্তবে চালু করার আগে: `admin123` ইউজারের পাসওয়ার্ড বদলাও (বা ইউজার মুছো), এবং `src/config.js` এ `SHOW_DEMO_HINTS = false` করো।

---

## 👤 নতুন অ্যাডমিন যোগ ও অনুমোদন

1. অ্যাডমিন প্যানেল → হল বেছে নাও → **"নতুন অ্যাকাউন্ট তৈরি করুন"** থেকে রেজিস্টার করো।
2. নতুন অ্যাকাউন্ট শুরুতে **অনুমোদনহীন (`approved: false`)** থাকে — লগইন করতে পারবে না।
3. Firebase Console → **Firestore → `admins`** কালেকশনে ওই ইউজারের ডকুমেন্ট খুলে `approved` কে `true` করো।
4. কাউকে সব হলের অ্যাক্সেস দিতে চাইলে `role` কে `superAdmin` করো। (হল অ্যাডমিন = `hallAdmin`, শুধু নিজের হলের ডেটা দেখতে পারে।)

**`npm run seed` না চালালে প্রথম সুপার অ্যাডমিন হাতে বানাতে হবে:**
Authentication → Users → **Add user** (ইমেইল `yourname@hallmeal.pust.example`, পাসওয়ার্ড দাও) → ইউজারের UID কপি করো → Firestore এ `admins/{UID}` ডকুমেন্ট বানাও:
`adminId` (string = UID), `email`, `username`, `name`, `role` = "superAdmin", `hallId` = "gonotontro", `approved` = true (boolean)।
লগইনের সময় ইউজার নাম হিসেবে `yourname` লিখলেই চলবে।

---

## ⏰ রাত ১০টার নিয়ম

- আগামী দিনের টোকেন শুধু **আগের রাত ১০:০০টার (বাংলাদেশ সময়, UTC+6) আগে** কেনা যায়। রাত ১০টার পর মিল নির্বাচন/পেমেন্ট বন্ধ থাকে।
- নিয়মটি **দুই জায়গায়** কার্যকর: অ্যাপে (`src/utils/time.js`) এবং Firestore Security Rules এ (ব্রাউজার বদলে ফাঁকি দেওয়া যাবে না)।
- টেস্ট করতে `.env` এ লাইন যোগ করে `npm run dev` আবার চালাও (শুধু ডেভেলপমেন্টে কাজ করে):
```
VITE_FAKE_NOW=2026-09-24T22:30:00+06:00
```
  ⚠️ এটি শুধু অ্যাপের UI বদলায়; Security Rules সবসময় সার্ভারের আসল সময় ব্যবহার করে। তাই নকল সময়ে ১০টার আগের সময় দিয়ে পেমেন্ট করতে গেলে রাত ১০টার পর আসল সময়ে Rules ব্লক করবে — এটাই সঠিক আচরণ।

---

## 📷 QR স্ক্যানার

- ক্যামেরা চালাতে ব্রাউজারে **HTTPS** বা `localhost` লাগে (ডেপ্লয় করলে Firebase Hosting স্বয়ংক্রিয়ভাবে HTTPS দেয়)।
- ফোনে ক্যামেরা চালাতে হলে অ্যাপটি ডেপ্লয় করে HTTPS লিংকে খুলতে হবে।
- ক্যামেরা কাজ না করলে **টোকেন আইডি হাতে লিখে** (যেমন `TKN-002`) যাচাই করা যাবে।
- QR এর ভেতরের লেখাকে বিশ্বাস করা হয় না — শুধু `tokenId` নিয়ে Firestore থেকে আসল তথ্য যাচাই করা হয়। খাবার দেওয়ার সময় `Unused → Collected` Transaction এ হয়, তাই একই টোকেন দুইবার ব্যবহার করা যায় না।

---

## 🚀 ডেপ্লয় (ঐচ্ছিক — Firebase Hosting)

```bash
npm i -g firebase-tools
firebase login
firebase use <আপনার-project-id>
npm run build
firebase deploy
```
ডেপ্লয়ের পর Authentication → Settings → **Authorized domains** এ আপনার ডোমেইন থাকা নিশ্চিত করো (`*.web.app` স্বয়ংক্রিয়ভাবে থাকে)।

---

## 🗂️ Firestore কালেকশন

| কালেকশন | কাজ |
|---|---|
| `users` | শিক্ষার্থী (ডকুমেন্ট আইডি = studentId; নাম, লিঙ্গ, হল ইত্যাদি) |
| `halls` | ৪টি হল (`gender` দিয়ে ছেলে/মেয়ে আলাদা) |
| `mealTypes` | ৬টি মেনু অপশন ও দাম |
| `mealTokens` | কেনা টোকেন (স্ট্যাটাস: Unused / Collected; মেয়াদ পেরোলে অ্যাপে Expired দেখায়) |
| `payments` | পেমেন্ট রেকর্ড |
| `admins` | অ্যাডমিন প্রোফাইল (`approved`, `role`, `hallId`) |
| `foodCollection` | কোন টোকেনে কখন খাবার দেওয়া হয়েছে |

## 📁 ফোল্ডার কাঠামো
```
src/
  pages/        শিক্ষার্থী ও অ্যাডমিন পেজ (pages/admin/ এ ড্যাশবোর্ড, স্ক্যানার, লগ, খরচ, ইতিহাস)
  components/   Header, Stepper, TokenCard, QRScanner, TokenTable, SummaryBlock, ui
  services/     Firebase এর সব কল (student, token, payment, admin)
  context/      Flow, Auth, AdminData, Toast
  utils/        time (১০টার নিয়ম), token, format (বাংলা সংখ্যা), stats
  data/         seedData.js (হল/মিল/ডেমো শিক্ষার্থী)
  config.js     সিস্টেম নিয়ম ও বাংলা লেবেল
scripts/seed.js ডেমো ডেটা স্ক্রিপ্ট
firestore.rules সিকিউরিটি রুলস
```

---

## ⚠️ গুরুত্বপূর্ণ সীমাবদ্ধতা

1. **bKash পেমেন্ট এখন ডেমো।** যেকোনো সঠিক ফরম্যাটের নম্বর (`01XXXXXXXXX`) দিলে "সফল" হয়; টাকা কাটা হয় না। বাস্তব পেমেন্টের জন্য bKash Tokenized Checkout API + একটি Cloud Function/সার্ভার লাগবে (`src/services/paymentService.js` এ কীভাবে জুড়তে হবে লেখা আছে) এবং Rules এ পেমেন্ট যাচাই সার্ভার-সাইডে করতে হবে।
2. **শিক্ষার্থী যাচাই** শুধু Student ID দিয়ে হয় (পাসওয়ার্ড/OTP নেই — স্পেক অনুযায়ী)। বাস্তবে চালু করলে বিশ্ববিদ্যালয়ের ডেটাবেস বা OTP যুক্ত করা ভালো।
3. স্টাইলিংয়ে Tailwind নয়, প্লেইন CSS (`src/styles.css`) ব্যবহার করা হয়েছে।
4. আসল শিক্ষার্থীদের তালিকা ঢোকাতে `users` কালেকশনে `studentId`, `name`, `gender` (`male`/`female`), `hallId`, `department`, `year` ফিল্ডসহ ডকুমেন্ট বানাও (`src/data/seedData.js` দেখো)।

## 🛠️ সমস্যা হলে
- **"Firebase কনফিগার করা হয়নি"** → `.env` ফাইল ঠিক আছে কি না দেখো, তারপর `npm run dev` বন্ধ করে আবার চালাও।
- **"Missing or insufficient permissions"** → Security Rules Publish করা হয়নি, অথবা `npm run seed` চালানো হয়নি।
- **`auth/operation-not-allowed`** → Authentication এ Anonymous / Email-Password চালু করা হয়নি।
- **সিডে auth সংক্রান্ত ত্রুটি** → Authentication → Get started চেপে Email/Password চালু করে আবার `npm run seed` দাও।
