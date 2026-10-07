import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="page-wrap paper sheet" style={{ textAlign: "center" }}>
      <h1>পাতাটা পাওয়া যায়নি</h1>
      <p className="lead">হয়তো link-টা পুরনো। সূচিপত্র থেকে অধ্যায় বেছে নাও।</p>
      <Link className="btn primary" href="/#chapters">সূচিপত্রে যাও</Link>
    </main>
  );
}
