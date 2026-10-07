# MIU Python Book Website

*Application Development Using Python* বইয়ের website — বইয়ের মতো পড়ার অভিজ্ঞতা, পাতাতেই Python কোড চালানো, আর PDF ক্রেতাদের জন্য লক করা অনুশীলনী।

## Stack

Next.js (App Router, static generation) · TypeScript · Tailwind CSS · Framer Motion · Vercel

## Content কোথা থেকে আসে

বইয়ের লেখা হাতে লেখা হয় না — `tools/source/final_NN.json` থেকে `scripts/convert.ts` typed data বানায়:

- `content/generated/chNN.json` — অধ্যায়ের খোলা অংশ (build-এর সময় তৈরি, git-এ নেই)
- `content/locked/chNN.json` — লক করা অনুশীলনী; শুধু `/api/exercise` পড়ে, কখনো client bundle-এ যায় না
- `public/img/` — অধ্যায়ের ছবি

`npm run build` আর `npm run dev` নিজেই আগে convert চালায়।

## চালানো

```bash
npm install
npm run dev          # http://localhost:3000
```

Unlock পরীক্ষা করতে `.env.local`-এ `UNLOCK_SECRET` দাও (Vercel-এ যেটা আছে সেটাই, না হলে কোড মিলবে না)।

## আনলক কোড

```bash
node scripts/make_code.js rahim01      # → rahim01-XXXXXXXX
```

- `POST /api/unlock {code}` → `{token}`
- `GET /api/exercise?ch=N` (`Authorization: Bearer <token>`) → `{ch, blocks}`

কোড আর token-এর নিয়ম `lib/unlock.js`-এ, `UNLOCK_SECRET` env var থেকে। Database লাগে না।

## Forms

রিভিউ, ভুল রিপোর্ট, অধ্যায়ের মতামত আর PDF আগ্রহ ফর্ম Web3Forms (না থাকলে FormSubmit) দিয়ে Gmail-এ যায় — `lib/site.ts`-এর `FORMS`।

## সুরক্ষা সম্পর্কে

Copy, right-click, Ctrl+C/P/S আর print বন্ধ রাখা হয়েছে শুধু নিরুৎসাহিত করতে — এটা আসল তালা না। লক করা অনুশীলনী শুধু server থেকে, বৈধ token দেখালে আসে।
