import Link from "next/link";
import { SimplePage } from "@/components/chrome/SimplePage";
import { SITE_URL, YEAR } from "@/lib/site";

export const metadata = { title: "কপিরাইট নোটিশ", alternates: { canonical: `${SITE_URL}/copyright` }, openGraph: { title: "কপিরাইট নোটিশ — Python বই", url: `${SITE_URL}/copyright` } };

export default function CopyrightPage() {
  return (
    <SimplePage>
      <h1>কপিরাইট নোটিশ</h1>
      <p className="lead">© {YEAR} Kazi Tauhid Rana। <strong>Application Development Using Python</strong> বই ও এই website-এর সব লেখা, কোড উদাহরণ, ছবি, ডায়াগ্রাম, বোর্ড প্রশ্নের উত্তর ও ডিজাইনের সর্বস্বত্ব লেখকের সংরক্ষিত।</p>
      <h2>যা করতে পারবে</h2>
      <ul><li>এই website-এ বসে নিজের পড়াশোনার জন্য বইটা পড়া।</li><li>বইয়ের কোড দেখে নিজের হাতে টাইপ করে অনুশীলন করা।</li><li>বন্ধুদের সাথে এই website-এর <strong>link</strong> শেয়ার করা।</li></ul>
      <h2>যা করা সম্পূর্ণ নিষেধ</h2>
      <ul>
        <li>লেখা, কোড, ছবি বা উত্তর কপি করে অন্য কোথাও (website, blog, Facebook, YouTube, PDF, নোট, গাইড বই) প্রকাশ করা।</li>
        <li>Screenshot, ছবি তোলা, প্রিন্ট বা অন্য কোনো উপায়ে বইয়ের অংশ সংরক্ষণ করে বিতরণ বা বিক্রি করা।</li>
        <li>লেখকের নাম সরিয়ে বা না দিয়ে নিজের নামে চালানো।</li>
        <li>লেখকের লিখিত অনুমতি ছাড়া কোনো বাণিজ্যিক কাজে (কোচিং, গাইড, paid course) ব্যবহার করা।</li>
      </ul>
      <h2>কপিরাইট লঙ্ঘন করলে কী হবে</h2>
      <p>বাংলাদেশের <strong>কপিরাইট আইন, ২০২৩</strong> অনুযায়ী অনুমতি ছাড়া কারো সৃষ্টিকর্ম পুনরুৎপাদন, প্রকাশ, বিতরণ বা অনলাইনে ছড়িয়ে দেওয়া দণ্ডনীয় অপরাধ। লঙ্ঘন প্রমাণিত হলে:</p>
      <ul>
        <li><strong>ফৌজদারি শাস্তি:</strong> আইনে নির্ধারিত মেয়াদের কারাদণ্ড, অর্থদণ্ড, অথবা উভয় দণ্ড হতে পারে।</li>
        <li><strong>ক্ষতিপূরণ:</strong> লেখক দেওয়ানি আদালতে ক্ষতিপূরণ ও লঙ্ঘনকারী কাজ বন্ধের নিষেধাজ্ঞা চাইতে পারেন।</li>
        <li><strong>জব্দ ও অপসারণ:</strong> নকল কপি, প্রিন্ট বা ফাইল জব্দ ও ধ্বংসের আদেশ হতে পারে; অনলাইন কনটেন্ট সরানোর জন্য Facebook, YouTube, Google ও hosting প্রতিষ্ঠানে আনুষ্ঠানিক অভিযোগ (takedown) পাঠানো হবে।</li>
        <li><strong>আইনি ব্যবস্থা:</strong> লেখক কপিরাইট অফিস ও আইনশৃঙ্খলা বাহিনীর কাছে অভিযোগ দায়ের করার অধিকার রাখেন।</li>
      </ul>
      <p>দেশের বাইরে লঙ্ঘন হলে Berne Convention ও সংশ্লিষ্ট দেশের কপিরাইট আইন অনুযায়ী ব্যবস্থা নেওয়া হবে।</p>
      <h2>অনুমতি বা অভিযোগ</h2>
      <p>বইয়ের কোনো অংশ ব্যবহারের অনুমতি চাইলে, বা কোথাও এই বইয়ের নকল দেখলে <Link href="/feedback#report">এখানে জানাও</Link>।</p>
    </SimplePage>
  );
}
