import Link from "next/link";
import { YEAR } from "@/lib/site";

export function Footer() {
  return (
    <footer className="foot">
      <p><strong>Application Development Using Python</strong> · লেখক: Kazi Tauhid Rana, Computer Science and Technology, Rajshahi Polytechnic Institute</p>
      <p>© {YEAR} Kazi Tauhid Rana · সর্বস্বত্ব সংরক্ষিত · <Link href="/copyright">কপিরাইট নোটিশ</Link> · <Link href="/pdf">বইয়ের PDF</Link></p>
      <p>MIU Platform · Learn Grow Succeed</p>
    </footer>
  );
}
