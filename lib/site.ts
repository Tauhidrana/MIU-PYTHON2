// সাইট-জুড়ে ব্যবহৃত মান — পুরনো tools/build_site.py আর site/assets/config.js থেকে
export const SITE_URL = "https://miu-python2.vercel.app";
export const SITE_NAME = "Application Development Using Python";
export const OG_SITE_NAME = "Python বই — Application Development Using Python";
export const AUTHOR = "Kazi Tauhid Rana";
export const YEAR = "২০২৬";
export const FB_URL = "https://www.facebook.com/kazitauhidrana";
export const PDF_PRICE = 50;
export const SITE_DESC =
  `Polytechnic ছাত্রদের জন্য বাংলায় Python বই। পুরো বই ফ্রি; প্রথম দুই অধ্যায়ের অনুশীলনী ফ্রি, বাকি অনুশীলনীর উত্তর PDF-এর সাথে (${bn(PDF_PRICE)} টাকা)।`;

// ফর্মগুলো (রিভিউ, ভুল রিপোর্ট, অধ্যায়ের মতামত, PDF আগ্রহ) কোথায় যাবে।
// Web3Forms key থাকলে সেটা দিয়ে যায়, না থাকলে FormSubmit দিয়ে EMAIL-এ।
export const FORMS = {
  EMAIL: "tauhidrana00@gmail.com",
  WEB3FORMS_KEY: "39bc7fb7-d775-40be-85ef-4577153cf05a",
  SITE_NAME: "Application Development Using Python",
};

const BN = "০১২৩৪৫৬৭৮৯";
export function bn(n: number | string) {
  return String(n).replace(/\d/g, (d) => BN[+d]);
}
export const chapterLabel = (n: number) => (n === 12 ? "পরিশিষ্ট" : `অধ্যায় ${bn(n)}`);
export const chapterUnit = (n: number) => (n === 12 ? "পরি" : bn(n));
