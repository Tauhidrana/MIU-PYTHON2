Python বই — অনলাইন Website
==========================

site/   ← এই folder-টাই website। পুরোটা deploy করো।
tools/  ← পরে content বদলাতে চাইলে (নিচে দেখো)।

ধাপ ১: Email সংযোগ (একবারই, ১ মিনিট)
-------------------------------------
সব ফর্ম (বইয়ের রিভিউ, ভুল রিপোর্ট, অধ্যায়ের মতামত, PDF আগ্রহ ও দাম) যায় tauhidrana00@gmail.com-এ —
FormSubmit (formsubmit.co) দিয়ে, কোনো key বা account লাগে না।
1. Website deploy করার পর নিজে যেকোনো একটা ফর্ম জমা দাও।
2. tauhidrana00@gmail.com-এ FormSubmit থেকে "Activate Form" email আসবে (না পেলে Spam folder দেখো) — "Activate" চাপো।
3. ব্যস! এরপর থেকে প্রতিটা ফর্ম সরাসরি ওই Gmail-এ আসবে। Activate-এর আগে জমা পড়া ফর্ম আসবে না।
Email ঠিকানা বদলাতে চাইলে: site/assets/config.js-এ EMAIL বদলাও (নতুন ঠিকানাতেও আবার একবার Activate করতে হবে)।
(ঐচ্ছিক) Web3Forms ব্যবহার করতে চাইলে web3forms.com থেকে Access Key নিয়ে config.js-এর WEB3FORMS_KEY-তে বসাও।

ধাপ ২: Deploy — যেকোনো একটা উপায়
-----------------------------------
সবচেয়ে সহজ — Netlify Drop:
  https://app.netlify.com/drop -এ গিয়ে site folder-টা টেনে ছেড়ে দাও। এক মিনিটে link পাবে।
Vercel:
  vercel.com → Add New Project → site folder upload (বা GitHub repo) → Framework: "Other" → Deploy।
GitHub Pages:
  নতুন repo বানাও, site folder-এর ভেতরের সব file repo-র root-এ push করো →
  Settings → Pages → Branch: main, folder: / (root) → Save।

কোড রানার কীভাবে কাজ করে
------------------------
Python চলে পাঠকের browser-এই (Pyodide, cdn.jsdelivr.net থেকে লোড হয়) — কোনো server লাগে না।
প্রথমবার চালাতে কয়েক সেকেন্ড লাগে, পরে দ্রুত। ২০ সেকেন্ডের বেশি চললে আপনা-আপনি থেমে যায়।
অধ্যায়ের অন্য ফাইল (যেমন geometry.py, school/student.py, students.txt) আগে লিখে রাখা হয়, তাই import কাজ করে।
নিজের কম্পিউটারে পরীক্ষা করতে site folder-এ `python3 -m http.server` চালিয়ে http://localhost:8000 খোলো
(সরাসরি file হিসেবে খুললে কোড রানার চলবে না)।

ধাপ ৩: পরীক্ষা
--------------
Deploy-এর পর নিজে একটা রিভিউ পাঠিয়ে দেখো email আসে কিনা (spam folder-ও দেখো)।

Website-এ যা আছে
-----------------
* প্রথম পাতা, ১১টা অধ্যায় আর বোর্ড প্রশ্নের পরিশিষ্ট — বইয়ের পুরো content
* প্রতিটা কোডের output আর লাইন-বাই-লাইন ব্যাখ্যা
* প্রতিটা Python কোডের পাশে "▶ চালাও" — পাতাতেই কোড চলে, input() থাকলে বইয়ের মানগুলো আগে থেকে বসানো থাকে
* কোড রানার পাতা (runner.html) — পাঠক নিজে কোড লিখে চালাতে পারে
* প্রতিটা টপিকের নিচে YouTube ভিডিও (৬৪টা টপিক + ৬টা পুরো-অধ্যায়ের ক্লাস) — আগে বাংলা, না পেলে হিন্দি;
  চাপলে তবেই ভিডিও লোড হয়, তাই পাতা ধীর হয় না
* ডার্ক মোড (◐ বাটন)
* মোবাইল: নিচে app-এর মতো মেনু (হোম · অধ্যায় · কোড রানার · মতামত); "অধ্যায়" চাপলে নিচ থেকে বিষয়সূচি খোলে —
  এই অধ্যায়ের section আর সব অধ্যায়; কোড রানারে চিহ্নের বার ( : ( ) " ' [ ] = … ) যাতে ফোনে কোড লেখা সহজ হয়
* পড়া কোথায় থেমেছিল মনে রাখে; শেষ করা অধ্যায়ে ✓ চিহ্ন
* প্রতিটা অধ্যায়ের শেষে রেটিং ও মতামত form; "রিভিউ ও মতামত" পাতায় বইয়ের রিভিউ আর ভুল রিপোর্ট
* কপিরাইট নোটিশ পাতা (copyright.html) — প্রতিটা পাতার নিচে link
* বইয়ের PDF পাতা (pdf.html) — কে PDF নিতে চায় আর কত দাম ঠিক মনে করে, সেই ফর্ম। প্রতিটা উত্তর email-এ আসে;
  subject-এ দাম আর আগ্রহ লেখা থাকে (যেমন "দাম: ৳100 — হ্যাঁ, অবশ্যই নেব"), তাই inbox দেখেই হিসাব করা যায়

কনটেন্ট সুরক্ষা (site/assets/protect.js)
---------------------------------------
* PDF ডাউনলোড বন্ধ — PDF এখন tools/private/-এ, site-এ নেই (deploy হয় না)
* Right click / মোবাইলে long press, text select, copy/cut, image drag ও save বন্ধ (form-এর ঘর বাদে)
* Ctrl/⌘ + C, A, S, P, U, F12, DevTools shortcut বন্ধ; প্রিন্ট করলে শুধু কপিরাইট বার্তা আসে
* Windows key, Alt (Windows-এ), PrtSc, ⌘⇧3/4/5 চাপলে বা অন্য app-এ গেলে পাতা সাথে সাথে ফাঁকা হয়ে যায়, clipboard মুছে যায়;
  key ছেড়ে mouse নাড়ালে লেখা ফিরে আসে
* প্রতিটা পাতায় হালকা "© Kazi Tauhid Rana" watermark
* _headers (Netlify) ও vercel.json — অন্য website-এ iframe করে দেখানো বন্ধ
সতর্কতা: browser-এ দেখানো কোনো লেখা ১০০% আটকানো সম্ভব না (মোবাইল ক্যামেরা, ব্রাউজার
সেটিং বদলানো ইত্যাদি)। এগুলো সাধারণ ব্যবহারকারীকে আটকায়, আর watermark + কপিরাইট নোটিশ আইনি প্রমাণ রাখে।

ভিডিও বদলাতে চাইলে
------------------
tools/source/videos.json খোলো। প্রতিটা লাইনের key হলো "অধ্যায়:section" (যেমন "5:s3" = অধ্যায় ৫-এর ৩ নম্বর টপিক,
"5:chapter" = পুরো অধ্যায়ের ভিডিও)। "id" হলো YouTube link-এর v= এর পরের অংশ। বদলে নিচের মতো build চালাও।
কোনো টপিকের ভিডিও না চাইলে সেই লাইনটা মুছে দাও।

Content বদলাতে চাইলে
--------------------
tools/source/final_XX.json হলো প্রতিটা অধ্যায়ের content। বদলানোর পর:
  cd tools
  python build_site.py
অধ্যায়ের পাতাগুলো নতুন করে তৈরি হবে (assets folder, config.js-এর key আর ডিজাইন অপরিবর্তিত থাকে)। তারপর আবার deploy করো।
