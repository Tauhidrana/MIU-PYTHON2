# ভিডিওগুলোর review তালিকা বানায়: tools/source/videos.json → videos_review.csv
# কোনো ভিডিও মোছে না — শুধু যেগুলো সন্দেহজনক, সেগুলোর পাশে FLAG আর কারণ লেখে। লেখক দেখে videos.json থেকে বাদ দেবেন।
import csv, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "source")
OUT = os.path.join(HERE, "..", "videos_review.csv")

# বাংলাদেশের ডিপ্লোমা (বাকাশিবো) syllabus-এর নয় — পশ্চিমবঙ্গ/ভারতের বোর্ড বা ক্লাসের চিহ্ন
OTHER_SYLLABUS = re.compile(r"WBCHSE|West\s*Bengal|Kolkata|Class\s*(XI|XII|11|12)\b|\bSem(ester)?\b", re.I)

# হাতে দেখে পাওয়া: section-এর বিষয়ের সাথে মেলে না, বা অন্য সমস্যা
MANUAL = {
    "1:s3": "section-এর বিষয় function ডাকার পদ্ধতি; ভিডিওটা শুধু return নিয়ে",
    "4:s3": "section-এর বিষয় OOP-এর বৈশিষ্ট্য; ভিডিওটা ৪.৫ ঘণ্টার পুরো OOP course, নির্দিষ্ট টপিকের নয়",
    "8:s3": "হিন্দি ভিডিও; আর section-এর বিষয় Logging-এর Level, ভিডিওটা শুধু Logging কী",
    "9:s2": "section-এর বিষয় Unit Testing-এর গুরুত্ব; ভিডিওটা Black box/White box/Integration testing নিয়ে",
    "11:s3": "section-এর বিষয় Application Software-এর বৈশিষ্ট্য; ভিডিওটা সাধারণ software কী নিয়ে",
}

def sections():
    out = {}
    for i in range(1, 13):
        B = json.load(open(os.path.join(SRC, f"final_{i:02d}.json"), encoding="utf-8"))
        n = 0
        for b in B:
            if b["t"] == "chapter": out[f"{i}:chapter"] = f"পুরো অধ্যায় — {b['title']}"
            elif b["t"] == "h2": n += 1; out[f"{i}:s{n}"] = b["text"]
    return out

videos = json.load(open(os.path.join(SRC, "videos.json"), encoding="utf-8"))
sec = sections()
seen, rows = {}, []
for key, v in videos.items():
    ch = key.split(":")[0]
    reasons = []
    m = OTHER_SYLLABUS.search(v["title"] + " " + v["channel"])
    if m: reasons.append(f"বাংলাদেশের ডিপ্লোমা syllabus-এর নয় (\"{m.group(0)}\")")
    if key in MANUAL: reasons.append(MANUAL[key])
    note = f"একই ভিডিও {seen[v['id']]}-এও আছে" if v["id"] in seen else ""
    seen.setdefault(v["id"], key)
    rows.append([ch, sec.get(key, key), v["title"], v["channel"], f"https://www.youtube.com/watch?v={v['id']}",
                 "FLAG" if reasons else "", "; ".join(reasons), note])

with open(OUT, "w", encoding="utf-8-sig", newline="") as f:   # utf-8-sig: Excel-এ বাংলা ঠিক দেখায়
    w = csv.writer(f)
    w.writerow(["অধ্যায়", "section", "শিরোনাম", "channel", "link", "FLAG", "কারণ", "নোট"])
    w.writerows(rows)
print(f"{len(rows)}টা ভিডিও, {sum(1 for r in rows if r[5])}টা FLAG → videos_review.csv")
