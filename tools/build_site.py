import json, html, re, os, shutil
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "source")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")
BN = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")
KINDS = {"analogy": "বাস্তব উদাহরণ", "tip": "Exam Tip", "practice": "অনুশীলন", "note": "নোট", "oop": "OOP-এর সাথে যোগসূত্র",
         "exam": "সম্ভাব্য পরীক্ষার প্রশ্ন", "remember": "মনে রাখো", "definition": "সংজ্ঞা (পরীক্ষার জন্য)", "answer": "উত্তর"}
TOPICS = {1: "def, argument, pass by value/reference, datetime", 2: "file mode, open ও close, read ও write",
          3: "module, package, application software-এর পরিচয়", 4: "class, object, constructor, self",
          5: "inheritance, encapsulation, polymorphism, abstraction", 6: "iter ও next, yield, @decorator",
          7: "try, except, else, finally, raise", 8: "level, handler, formatter, basicConfig",
          9: "unittest, TestCase, assertion", 10: "pattern, meta character, search, findall, sub",
          11: "শ্রেণিবিভাগ, বৈশিষ্ট্য, কাজ ও একটি পূর্ণ প্রকল্প", 12: "২০২২–২০২৫ সালের প্রশ্নপত্র, বিশ্লেষণ ও সাজেশন"}
SHORT = {1: "Python Functions", 2: "File Operation", 3: "Module, Package ও Application Software", 4: "Basics of OOP",
         5: "Four Pillars of OOP", 6: "Iterator, Generator ও Decorator", 7: "Exception ও Error Handling", 8: "Logging",
         9: "Unit Testing", 10: "RegEx", 11: "Application Software", 12: "বোর্ড প্রশ্ন ও সাজেশন"}

YEAR = "২০২৬"

# ===== অনুশীলনী ও বোর্ড প্রশ্ন লক — PDF ক্রেতারা আনলক কোড দিয়ে খুলবে =====
# লক করা অংশের আসল লেখা পাতার HTML-এ থাকে না: সেটা content/locked/chNN.json-এ যায় (site/-এর বাইরে, তাই public URL নেই)।
# পাতায় থাকে শুধু লেখা ছাড়া skeleton আর unlock box; কোড ঠিক হলে api/unlock.js token দেয়, api/exercise.js সেই token দেখে লেখাটা পাঠায়।
FB_URL = "https://www.facebook.com/kazitauhidrana"
PDF_PRICE = 50   # PDF-এর দাম (টাকা) — unlock box আর description-এ এখান থেকেই বসে
LOCKED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "content", "locked")
FREE_CHAPTERS = {1, 2}   # এই অধ্যায়গুলোর অনুশীলনী সবার জন্য খোলা (api/_lib.js-এর LOCKED_CHAPTERS-এর সাথে মিল থাকতে হবে)

LOCK_SVG = ('<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
            'stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10.5" width="16" height="10.5" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>'
            '<circle cx="12" cy="15.5" r="1.4" fill="currentColor"/></svg>')

# লেখা ছাড়া ঝাপসা skeleton — শুধু বোঝায় এখানে প্রশ্ন, উত্তর আর কোড আছে
SKEL_FIRST = "h l l s c l s l l s c l".split()
SKEL_SLIM = "h l s c".split()
def skeleton(first):
    return ('<div class="lock-preview" aria-hidden="true">'
            + "".join(f'<span class="sk sk-{k}"></span>' for k in (SKEL_FIRST if first else SKEL_SLIM)) + "</div>")

def locked_html(ch, first):
    if first:
        card = (f'<div class="lock-card" id="unlock"><div class="lock-icon">{LOCK_SVG}</div>'
                '<p class="lock-badge">PDF ক্রেতাদের জন্য</p>'
                '<p class="lock-h">অনুশীলনী ও বোর্ড প্রশ্নের উত্তর লক করা</p>'
                '<p class="lock-text">PDF কিনলে একটা <strong>আনলক কোড</strong> পাবে — কোডটা একবার দিলেই এই browser-এ সব অধ্যায়ের অনুশীলনী আর '
                'বোর্ড প্রশ্নের উত্তর খুলে যাবে।</p>'
                f'<p class="lock-price">PDF-এর দাম: <strong>{str(PDF_PRICE).translate(BN)} টাকা</strong></p>'
                '<form class="lock-form"><input name="code" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="আনলক কোড লেখো" aria-label="আনলক কোড" required>'
                '<button type="submit">আনলক করো</button></form><p class="lock-status" role="status"></p>'
                '<ul class="lock-perks"><li>সব অধ্যায়ের অনুশীলনী</li><li>বোর্ড প্রশ্নের উত্তর</li><li>একবারেই সব খোলে</li></ul>'
                f'<p class="lock-buy">PDF কিনতে Facebook-এ মেসেজ দাও · <a href="{FB_URL}" target="_blank" rel="noopener">facebook.com/kazitauhidrana ↗</a></p>'
                '<p class="lock-free">প্রথম ২টি অধ্যায়ের অনুশীলনী সবার জন্য খোলা</p></div>')
    else:
        card = f'<a class="lock-card slim" href="#unlock"><span class="lock-icon">{LOCK_SVG}</span><span>এই অংশ লক করা — <u>আনলক কোড দাও</u></span></a>'
    return f'<div class="locked{" first" if first else ""}" data-ch="{ch}">{skeleton(first)}{card}</div>'

VIDEOS = json.load(open(os.path.join(SRC, "videos.json"), encoding="utf-8")) if os.path.exists(os.path.join(SRC, "videos.json")) else {}
MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"]

def video_html(key, big=False):
    """টপিকের YouTube ভিডিও — প্রথমে শুধু ছবি, চাপলে তবেই player লোড হয় (পাতা দ্রুত থাকে)"""
    v = VIDEOS.get(key)
    if not v: return ""
    y, m = v["date"][:4], int(v["date"][5:7])
    lang = '<span class="yt-lang bn">বাংলা</span>' if v["lang"] == "bn" else '<span class="yt-lang hi">হিন্দি</span>'
    kind = "পুরো অধ্যায়ের ভিডিও ক্লাস" if big else "এই টপিকের ভিডিও"
    t = html.escape(v["title"])
    return (f'<div class="yt{" yt-big" if big else ""}" data-id="{v["id"]}">'
            f'<button type="button" class="yt-play" aria-label="ভিডিও চালাও: {t}"><img src="https://i.ytimg.com/vi/{v["id"]}/mqdefault.jpg" alt="" loading="lazy" width="320" height="180"><span class="yt-icon" aria-hidden="true"></span></button>'
            f'<div class="yt-meta"><p class="yt-k">{lang}{kind} · {MONTHS[m - 1]} {y.translate(BN)}</p><p class="yt-t">{t}</p>'
            f'<p class="yt-c">{html.escape(v["channel"])} · <a href="https://www.youtube.com/watch?v={v["id"]}" target="_blank" rel="noopener">YouTube-এ দেখো ↗</a></p></div></div>')

def esc(s): return html.escape(s, quote=False)
def inline(t):
    out = []
    for part in re.split(r"(\*\*[^*]+\*\*|`[^`]+`)", t):
        if not part: continue
        if part.startswith("**") and part.endswith("**"): out.append("<strong>" + inline_code(part[2:-2]) + "</strong>")
        elif part.startswith("`") and part.endswith("`"): out.append("<code>" + esc(part[1:-1]) + "</code>")
        else: out.append(esc(part))
    return "".join(out)
def inline_code(t):
    return re.sub(r"`([^`]+)`", lambda m: "<code>" + esc(m.group(1)) + "</code>", esc(t))

def code_html(src, label="Python", fname="main.py", numbered=True, cls=""):
    lines = src.split("\n")
    body = "".join(f'<span class="ln">{i}</span>{esc(l) or " "}\n' if numbered else f"{esc(l) or ' '}\n" for i, l in enumerate(lines, 1))
    return (f'<figure class="code {cls}"><figcaption><span>{esc(label)}</span><span class="fn">{esc(fname)}</span>'
            f'</figcaption><pre><code>{body}</code></pre></figure>')
def output_html(out):
    t = esc(out).replace("\x01", '<span class="in">').replace("\x02", "</span>")
    return f'<figure class="output"><figcaption><span>Output</span></figcaption><pre>{t}</pre></figure>'
def items_html(items):
    h = []
    for it in items:
        if isinstance(it, str): h.append(f"<p>{inline(it)}</p>")
        elif it[0] == "bullets": h.append("<ul>" + "".join(f"<li>{inline(x)}</li>" for x in it[1]) + "</ul>")
        elif it[0] == "code": h.append(code_html(it[1], "Python", "", numbered=False, cls="mini"))
    return "".join(h)

LOCK_ON, LOCK_OFF = object(), object()
def render(B, ch):
    h, toc, last = [], [], ""
    sec_id = 0
    # পরিশিষ্টে (ch12) heading ছাড়া সব লক; বাকি অধ্যায়ে (FREE_CHAPTERS বাদে) "অনুশীলনী" heading-এর পরের সব লক
    locking = False
    for b in B:
        t = b["t"]
        if t == "h2" and b["text"].startswith("অনুশীলনী") and ch not in FREE_CHAPTERS: locking = True
        h.append(LOCK_ON if (locking and t != "h2") or (ch == 12 and t not in ("chapter", "h2")) else LOCK_OFF)
        if t == "chapter":
            h.append(f'<header class="chap-head"><p class="chap-num">{esc(b["num"])}</p><h1>{esc(b["title"])}</h1>'
                     + "".join(f'<p class="lead">{inline(x)}</p>' for x in b["intro"]) + "</header>" + video_html(f"{ch}:chapter", True))
        elif t == "h2":
            sec_id += 1; sid = f"s{sec_id}"
            toc.append((sid, b["text"]))
            tag = f'<span class="syl">Syllabus {esc(b["tag"])}</span>' if b.get("tag") else ""
            h.append(f'<h2 id="{sid}">{inline(b["text"])}{tag}</h2>' + video_html(f"{ch}:{sid}"))
        elif t == "h3": h.append(f"<h3>{inline(b['text'])}</h3>")
        elif t == "p": h.append(f"<p>{inline(b['text'])}</p>")
        elif t == "bullets": h.append("<ul>" + "".join(f"<li>{inline(x)}</li>" for x in b["items"]) + "</ul>")
        elif t == "numbers": h.append("<ol>" + "".join(f"<li>{inline(x)}</li>" for x in b["items"]) + "</ol>")
        elif t == "table":
            mono = set(b.get("mono") or [])
            th = "".join(f"<th>{inline(x)}</th>" for x in b["headers"])
            rows = "".join("<tr>" + "".join(f'<td class="{"m" if j in mono else ""}">{inline(c)}</td>' for j, c in enumerate(r)) + "</tr>" for r in b["rows"])
            h.append(f'<div class="tbl"><table><thead><tr>{th}</tr></thead><tbody>{rows}</tbody></table></div>')
        elif t == "example":
            h.append(f'<div class="example"><p class="ex-title"><span class="ex-label">{esc(b["label"])}</span>{inline(b["title"])}</p>'
                     f'<p class="problem"><strong>সমস্যা:</strong> {inline(b["problem"])}</p></div>')
        elif t == "syntax":
            h.append('<div class="syntax"><p class="box-title">Syntax</p>' + code_html(b["code"], "Syntax", "", numbered=False, cls="mini")
                     + (f"<p>{inline(b['note'])}</p>" if b.get("note") else "") + "</div>")
        elif t == "code":
            if b.get("hidden"): continue
            f = b.get("file")
            if f and f.startswith("Terminal"):
                h.append(code_html(b["code"], "Terminal", f.replace("Terminal", "").strip(": "), numbered=False, cls="term"))
            elif f and not f.endswith(".py"):
                h.append(code_html(b["code"], "Text", f, numbered=False, cls="text"))
            else:
                h.append(code_html(b["code"], "Python", f or "main.py"))
                last = b["code"]
            if b.get("output"): h.append(output_html(b["output"]))
        elif t == "explain":
            lines = last.split("\n")
            rows = []
            for ref, txt in b["rows"]:
                if isinstance(ref, list): lab, snip = f"{ref[0]}–{ref[1]}", lines[ref[0]-1:ref[1]]
                elif ref is None: lab, snip = "", []
                else: lab, snip = str(ref), lines[ref-1:ref]
                rows.append(f'<tr><td class="lab">{lab}</td><td class="snip"><pre>{esc(chr(10).join(snip))}</pre></td><td>{inline(txt)}</td></tr>')
            h.append(f'<details class="explain" open><summary>লাইন-বাই-লাইন ব্যাখ্যা</summary><div class="tbl"><table><tbody>{"".join(rows)}</tbody></table></div></details>')
        elif t == "box":
            k = b["kind"]
            h.append(f'<aside class="box {k}"><p class="box-title">{esc(b.get("title") or KINDS.get(k, ""))}</p>{items_html(b["items"])}</aside>')
        elif t == "mistakes":
            parts = []
            for i, m in enumerate(b["items"], 1):
                wo = f'<p class="err">ফল: <code>{esc(m["wrong_out"].splitlines()[-1] if m.get("wrong_out") else "")}</code></p>' if m.get("wrong_out") else ""
                parts.append(f'<div class="mk"><div class="mk-col bad"><p class="mk-h">ভুল</p>{code_html(m["wrong"], "Python", "", False, "mini")}{wo}</div>'
                             f'<div class="mk-col good"><p class="mk-h">সঠিক</p>{code_html(m["right"], "Python", "", False, "mini")}</div>'
                             f'<p class="why">{inline(m["why"])}</p></div>')
            h.append(f'<aside class="box mistake"><p class="box-title">সাধারণ ভুল</p>{"".join(parts)}</aside>')
        elif t == "img":
            fn = os.path.basename(b["path"])
            h.append(f'<figure class="pic"><img src="../img/{fn}" alt="{html.escape(b.get("caption") or "")}" loading="lazy"><figcaption>{inline(b.get("caption") or "")}</figcaption></figure>')
        elif t == "q":
            st = b.get("stars") or 0
            stars = f'<span class="stars s{st}" title="গুরুত্ব {st}/3" aria-label="গুরুত্ব {st} তারকা">{"★" * st}{"☆" * (3 - st)}</span>' if st else ""
            ref = f'<span class="qref">{esc(b["ref"])}</span>' if b.get("ref") else ""
            h.append(f'<div class="q"><span class="qn">{esc(b["num"])}</span><div class="qt">{inline(b["text"])}</div><span class="qr">{ref}</span>{stars}</div>')
        elif t == "section": h.append(f'<p class="qsec">{esc(b["text"])}</p>')
        elif t == "paperhead":
            h.append('<div class="paper">' + "".join(f'<p class="pl{min(i,2)}">{esc(l)}</p>' for i, l in enumerate(b["lines"]))
                     + f'<p class="pmeta"><span>{esc(b["left"])}</span><span>{esc(b["right"])}</span></p><p class="pinst">{esc(b["instr"])}</p></div>')
        elif t == "pagebreak": pass
        else: raise ValueError(t)
    out, buf, locked = [], [], []
    for x in h + [LOCK_OFF]:
        if x is LOCK_ON or x is LOCK_OFF:
            if x is LOCK_OFF and buf: out.append(locked_html(ch, not locked)); locked.append("\n".join(buf)); buf = []
            on = x is LOCK_ON
        elif on: buf.append(x)
        else: out.append(x)
    return "\n".join(out), toc, locked

HEAD = '''<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#FBFCFE"><meta name="format-detection" content="telephone=no">
<title>{title}</title><meta name="description" content="{desc}">
<link rel="canonical" href="{url}"><meta property="og:type" content="{ogtype}"><meta property="og:site_name" content="Python বই — Application Development Using Python">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{url}"><meta property="og:locale" content="bn_BD">
<meta property="og:image" content="{site}/img/og-cover.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Application Development Using Python — বইয়ের প্রচ্ছদ">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{root}img/favicon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
<meta name="robots" content="noarchive"><link rel="stylesheet" href="{root}assets/style.css"><script src="{root}assets/protect.js"></script><script>try{{if(localStorage.getItem("theme")==="dark")document.documentElement.dataset.theme="dark"}}catch(e){{}}</script></head>'''
SITE_URL = "https://miu-python2.vercel.app"
SITE_DESC = (f"Polytechnic ছাত্রদের জন্য বাংলায় Python বই। পুরো বই ফ্রি; প্রথম দুই অধ্যায়ের অনুশীলনী ফ্রি, "
             f"বাকি অনুশীলনীর উত্তর PDF-এর সাথে ({str(PDF_PRICE).translate(BN)} টাকা)।")
# প্রতিটা অধ্যায়ের meta description ও og:description — ১৫০ অক্ষরের মধ্যে, অধ্যায়ের মূল টপিকসহ
CH_DESC = {
    1: "অধ্যায় ১: Python Function — def, argument, return, pass by value ও reference আর datetime, চালানো যায় এমন কোডসহ সহজ বাংলায়।",
    2: "অধ্যায় ২: Python-এ File Operation — file mode, open ও close, read ও write দিয়ে file-এ তথ্য রাখা ও পড়া, উদাহরণসহ সহজ বাংলায়।",
    3: "অধ্যায় ৩: Python Module ও Package — নিজের module ও package বানানো, import, আর Application Software-এর পরিচয় সহজ বাংলায়।",
    4: "অধ্যায় ৪: OOP-এর মূল কথা — class, object, constructor (__init__) ও self, Python উদাহরণ ও কোডসহ সহজ বাংলায়।",
    5: "অধ্যায় ৫: OOP-এর চার স্তম্ভ — inheritance, encapsulation, polymorphism ও abstraction, Python কোড ও উদাহরণসহ সহজ বাংলায়।",
    6: "অধ্যায় ৬: Python Iterator, Generator ও Decorator — iter ও next, yield আর @decorator কীভাবে কাজ করে, উদাহরণসহ সহজ বাংলায়।",
    7: "অধ্যায় ৭: Python-এ Exception ও Error Handling — try, except, else, finally ও raise, উদাহরণ ও কোডসহ সহজ বাংলায়।",
    8: "অধ্যায় ৮: Python Logging — log level, handler, formatter ও basicConfig দিয়ে program-এর log রাখা, উদাহরণসহ সহজ বাংলায়।",
    9: "অধ্যায় ৯: Python-এ Unit Testing — unittest, TestCase ও assertion দিয়ে test লেখা ও চালানো, উদাহরণসহ সহজ বাংলায়।",
    10: "অধ্যায় ১০: Python RegEx — pattern, metacharacter, search, findall ও sub দিয়ে লেখায় শব্দ খোঁজা ও বদলানো, সহজ বাংলায়।",
    11: "অধ্যায় ১১: Application Software — প্রকারভেদ, বৈশিষ্ট্য ও কাজ, আর Python ও Flask দিয়ে Student Result Management System প্রকল্প।",
    12: "পরিশিষ্ট: Application Development Using Python-এর ২০২২–২০২৫ সালের বোর্ড প্রশ্নপত্র, প্রশ্ন বিশ্লেষণ ও সাজেশন।",
}
for _k, _d in CH_DESC.items(): assert len(_d) <= 150, (_k, len(_d))

def head(title, root, path, desc=SITE_DESC, ogtype="website"):
    a = lambda t: html.escape(t, quote=True)
    return HEAD.format(title=a(title), root=root, desc=a(desc), url=SITE_URL + "/" + path, site=SITE_URL, ogtype=ogtype)
TOPBAR = '''<header class="topbar"><a class="brand" href="{root}index.html"><img src="{root}img/logo.png" alt="MIU"><span>Python বই</span></a>
<nav class="topnav"><a href="{root}index.html#chapters">অধ্যায়</a><a href="{root}runner.html">কোড রানার</a><a href="{root}feedback.html">রিভিউ ও মতামত</a>
<button class="theme" type="button" aria-label="ডার্ক মোড">◐</button></nav></header>'''
FOOT = '''<footer class="foot"><p><strong>Application Development Using Python</strong> · লেখক: Kazi Tauhid Rana, Computer Science and Technology, Rajshahi Polytechnic Institute</p><p class="copy-note">© {year} Kazi Tauhid Rana · সর্বস্বত্ব সংরক্ষিত · <a href="{root}copyright.html">কপিরাইট নোটিশ</a> · <a href="{root}pdf.html">বইয়ের PDF</a></p><p>MIU Platform · Learn Grow Succeed</p></footer>
<script src="{root}assets/config.js"></script><script src="{root}assets/app.js"></script><script src="{root}assets/runner.js"></script><script src="{root}assets/lock.js"></script></body></html>'''

ICON = {
    "home": '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    "book": '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5zM4 19.5A1.5 1.5 0 0 0 5.5 21H19v-3"/><path d="M8 7h7M8 10.5h5"/>',
    "run": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m8 9 3 3-3 3M13 15h3"/>',
    "chat": '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 11h7M8.5 14h4.5"/>',
}
def icon(n): return f'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[n]}</svg>'

def bottom_nav(root, active, cur=0, sections=""):
    """মোবাইলের নিচের মেনু আর 'অধ্যায়' চাপলে খোলা sheet — ডেস্কটপে লুকানো থাকে"""
    on = lambda k: ' class="on" aria-current="page"' if k == active else ""
    chs = "".join(f'<li><a href="{root}chapters/ch{j:02d}.html"{" class=on aria-current=page" if j == cur else ""}><span class="u">{"পরি" if j == 12 else str(j).translate(BN)}</span>{esc(SHORT[j])}</a></li>' for j in range(1, 13))
    sec = f'<p class="sheet-h">এই অধ্যায়ে</p><ol class="sheet-sec">{sections}</ol>' if sections else ""
    return (f'<nav class="bnav" aria-label="মোবাইল মেনু"><a href="{root}index.html"{on("home")}>{icon("home")}<span>হোম</span></a>'
            f'<button type="button" class="bn-toc{" on" if active == "read" else ""}" aria-expanded="false" aria-controls="sheet">{icon("book")}<span>অধ্যায়</span></button>'
            f'<a href="{root}runner.html"{on("runner")}>{icon("run")}<span>কোড রানার</span></a>'
            f'<a href="{root}feedback.html"{on("feedback")}>{icon("chat")}<span>মতামত</span></a></nav>'
            f'<div class="sheet" id="sheet" hidden><div class="sheet-backdrop" data-close></div>'
            f'<div class="sheet-panel" role="dialog" aria-modal="true" aria-label="বিষয়সূচি"><div class="sheet-grip" data-close></div>'
            f'<div class="sheet-head"><strong>বিষয়সূচি</strong><button type="button" data-close aria-label="বন্ধ করো">✕</button></div>'
            f'<div class="sheet-body">{sec}<p class="sheet-h">সব অধ্যায়</p><ol class="sheet-ch">{chs}</ol></div></div></div>')

def page_chapter(i, B):
    body, toc, locked = render(B, i)
    path = os.path.join(LOCKED_DIR, f"ch{i:02d}.json")
    if locked: json.dump(locked, open(path, "w", encoding="utf-8"), ensure_ascii=False)
    elif os.path.exists(path): os.remove(path)
    title = next(b for b in B if b["t"] == "chapter")
    side = "".join(f'<li><a class="{"cur" if j == i else ""}" href="ch{j:02d}.html"><span class="u">{"পরি" if j == 12 else str(j).translate(BN)}</span>{esc(SHORT[j])}</a></li>' for j in range(1, 13))
    mini = "".join(f'<li><a href="#{sid}">{inline(txt)}</a></li>' for sid, txt in toc)
    prev = f'<a class="pn prev" href="ch{i-1:02d}.html"><small>আগের অধ্যায়</small>{esc(SHORT[i-1])}</a>' if i > 1 else "<span></span>"
    nxt = f'<a class="pn next" href="ch{i+1:02d}.html"><small>পরের অধ্যায়</small>{esc(SHORT[i+1])}</a>' if i < 12 else "<span></span>"
    quick = f'''<section class="quick" id="quick"><h2>এই অধ্যায় কেমন লাগল?</h2><p>তোমার মতামত সরাসরি লেখকের কাছে যাবে। ভুল পেলে কোন section-এ, সেটাও লিখে দিও।</p>
<form class="fb-form" data-kind="অধ্যায়ের মতামত"><input type="hidden" name="chapter" value="{esc(title["num"])} — {esc(title["title"])}">
<div class="rate" role="radiogroup" aria-label="রেটিং">{"".join(f'<label><input type="radio" name="rating" value="{n}" {"required" if n == 1 else ""}><span>★</span><em>{n}</em></label>' for n in range(1, 6))}</div>
<label class="fld"><span>তোমার নাম (ঐচ্ছিক)</span><input name="name" autocomplete="name"></label>
<label class="fld"><span>মতামত বা যে ভুল পেয়েছ</span><textarea name="message" rows="4" required placeholder="যেমন: 4.5-এর উদাহরণটা বুঝতে কষ্ট হয়েছে, কারণ…"></textarea></label>
<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off"><button type="submit">মতামত পাঠাও</button><p class="status" role="status"></p></form></section>'''
    return (head(f"{title['num']}: {title['title']} — Python বই", "../", f"chapters/ch{i:02d}.html", CH_DESC[i], "article") + '<body class="reader">' + TOPBAR.format(root="../")
            + '<div class="progress"><span></span></div><div class="layout">'
            + f'<nav class="side" aria-label="অধ্যায়ের তালিকা"><button class="side-toggle" type="button">অধ্যায়ের তালিকা</button><ol>{side}</ol></nav>'
            + f'<main class="content">{body}{quick}<nav class="pager">{prev}{nxt}</nav></main>'
            + f'<aside class="mini"><p>এই অধ্যায়ে</p><ol>{mini}</ol><a class="report" href="#quick">ভুল পেয়েছ? জানাও</a></aside></div>'
            + bottom_nav("../", "read", i, mini) + FOOT.format(root="../", year=YEAR))

def page_index(chapters):
    path = "".join(f'''<li><a href="chapters/ch{j:02d}.html"><span class="unit">{"পরিশিষ্ট" if j == 12 else "অধ্যায় " + str(j).translate(BN)}</span><span class="ct">{esc(t)}</span><span class="cs">{esc(TOPICS[j])}</span></a></li>'''
                   for j, t, s in chapters)
    return (head("Application Development Using Python — অনলাইন বই", "", "") + '<body class="home">' + TOPBAR.format(root="") + f'''
<main>
<section class="hero"><div class="hero-text"><p class="kicker">বাকাশিবো · ডিপ্লোমা ইন ইঞ্জিনিয়ারিং · বিষয় কোড ২৮৫৩১</p>
<h1>Application Development<br>Using Python</h1>
<p class="sub">পুরো syllabus — Unit 1 থেকে Unit 11 — সহজ বাংলায়। প্রতিটা উদাহরণের কোড চালিয়ে যাচাই করা, প্রতিটা অধ্যায়ের শেষে বিগত বছরের বোর্ড প্রশ্নের উত্তর।</p>
<div class="cta"><a class="btn primary" href="chapters/ch01.html">পড়া শুরু করো</a><a class="btn" id="resume" href="chapters/ch01.html" hidden>যেখানে থেমেছিলে</a><a class="btn" href="runner.html">▶ কোড রানার</a><a class="btn" href="pdf.html">📘 PDF নিতে আগ্রহী?</a></div>
<p class="author">লেখক: <strong>Kazi Tauhid Rana</strong> · Computer Science and Technology, Rajshahi Polytechnic Institute</p></div>
<figure class="hero-book"><img src="img/cover.png" alt="বইয়ের প্রচ্ছদ"></figure></section>

<section class="peek"><div class="peek-code">{code_html('''class Student:
    def __init__(self, name, cgpa):
        self.name = name
        self.__cgpa = cgpa

s1 = Student("Rahim", 3.75)
print(s1.name, "joined MIU")''', "Python", "main.py")}{output_html("Rahim joined MIU")}</div>
<div class="peek-text"><h2>বইটা যেভাবে পড়াবে</h2><ul>
<li><strong>উদাহরণ ধরে ধরে।</strong> প্রতিটা ধারণার সাথে সমস্যা, কোড, output আর লাইন-বাই-লাইন ব্যাখ্যা।</li>
<li><strong>ভুল থেকে শেখা।</strong> নতুনরা যে ভুলগুলো সবচেয়ে বেশি করে, পাশাপাশি ভুল আর সঠিক কোড।</li>
<li><strong>পরীক্ষার কথা মাথায় রেখে।</strong> ২০২২–২০২৫ সালের সব বোর্ড প্রশ্ন, গুরুত্ব অনুযায়ী ★ দিয়ে, খাতায় লেখার মতো উত্তরসহ।</li>
<li><strong>প্রতিটা টপিকের ভিডিও।</strong> প্রতিটা টপিকের সাথে YouTube থেকে বাছাই করা বাংলা ভিডিও ক্লাস — যেটা পড়ছ, সেটাই দেখে নাও।</li>
<li><strong>পাতাতেই কোড চালাও।</strong> প্রতিটা উদাহরণের পাশে "চালাও" বাটন, আর নিজে লিখে চালানোর জন্য আলাদা <a href="runner.html">কোড রানার</a> — কিছু install করতে হবে না।</li>
<li><strong>একটা পূর্ণ প্রকল্প।</strong> শেষ অধ্যায়ে পুরো বইয়ের জ্ঞান দিয়ে বানানো Student Result Management System।</li></ul></div></section>

<section class="chapters" id="chapters"><h2>অধ্যায়সমূহ</h2><p class="hint">Syllabus-এর ক্রমেই সাজানো — একটার পর একটা পড়লে সবচেয়ে ভালো বুঝবে।</p><ol class="path">{path}</ol></section>

<section class="pdf-cta"><div><p class="pdf-tag">শীঘ্রই আসছে</p><h2>বইটার PDF সংস্করণ</h2><p>পুরো বই অফলাইনে, যেকোনো ডিভাইসে পড়ার জন্য PDF তৈরি হচ্ছে। দাম কত হবে — সেটা ঠিক হবে তোমাদের মতামত দেখেই। নিতে চাইলে নাম লিখে রাখো, তৈরি হলেই জানানো হবে।</p></div><a class="btn primary" href="pdf.html">আগ্রহ জানাও ও দাম বলো</a></section>

<section class="review-cta"><div><h2>বইটা কেমন লাগল?</h2><p>তোমার রিভিউ আর পরামর্শে পরের সংস্করণ আরও ভালো হবে। কোথাও ভুল পেলে সেটাও জানাও।</p></div><a class="btn primary" href="feedback.html">রিভিউ দাও</a></section>
</main>''' + bottom_nav("", "home") + FOOT.format(root="", year=YEAR))

def page_feedback(chapters):
    opts = "".join(f'<option>{"পরিশিষ্ট" if j == 12 else "অধ্যায় " + str(j).translate(BN)} — {esc(t)}</option>' for j, t, s in chapters)
    return (head("রিভিউ ও মতামত — Python বই", "", "feedback.html") + '<body class="formpage">' + TOPBAR.format(root="") + f'''
<main class="fb-wrap"><h1>রিভিউ ও মতামত</h1><p class="lead">তোমার লেখা সরাসরি লেখকের email-এ যাবে, website-এ প্রকাশ হবে না।</p>
<div class="tabs" role="tablist"><button role="tab" aria-selected="true" data-tab="review">বইয়ের রিভিউ</button><button role="tab" aria-selected="false" data-tab="report">ভুল রিপোর্ট / পরামর্শ</button></div>

<form class="fb-form panel" id="review" data-kind="বইয়ের রিভিউ">
<p class="fld-label">সব মিলিয়ে বইটাকে কত দেবে?</p>
<div class="rate big" role="radiogroup" aria-label="রেটিং">{"".join(f'<label><input type="radio" name="rating" value="{n}" {"required" if n == 1 else ""}><span>★</span><em>{n}</em></label>' for n in range(1, 6))}</div>
<div class="row"><label class="fld"><span>নাম</span><input name="name" required autocomplete="name"></label>
<label class="fld"><span>প্রতিষ্ঠান</span><input name="institute" placeholder="যেমন: Rajshahi Polytechnic Institute"></label></div>
<div class="row"><label class="fld"><span>টেকনোলজি ও পর্ব</span><input name="technology" placeholder="যেমন: CST, ৩য় পর্ব"></label>
<label class="fld"><span>সবচেয়ে কাজের অধ্যায়</span><select name="best_chapter"><option value="">— বেছে নাও —</option>{opts}</select></label></div>
<label class="fld"><span>তোমার রিভিউ</span><textarea name="message" rows="6" required placeholder="কী ভালো লেগেছে, কী আরও ভালো হতে পারত…"></textarea></label>
<label class="fld"><span>Email (ঐচ্ছিক — উত্তর চাইলে)</span><input type="email" name="email" autocomplete="email"></label>
<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off"><button type="submit">রিভিউ পাঠাও</button><p class="status" role="status"></p></form>

<form class="fb-form panel" id="report" data-kind="ভুল রিপোর্ট / পরামর্শ" hidden>
<div class="row"><label class="fld"><span>ধরন</span><select name="type" required><option>কোডে ভুল</option><option>লেখায় বা বানানে ভুল</option><option>ব্যাখ্যা বোঝা যায়নি</option><option>বোর্ড প্রশ্ন বা উত্তরে ভুল</option><option>নতুন বিষয় যোগের পরামর্শ</option><option>অন্যান্য</option></select></label>
<label class="fld"><span>অধ্যায়</span><select name="chapter" required>{opts}</select></label></div>
<label class="fld"><span>Section বা পৃষ্ঠা (যেমন 5.4, উদাহরণ 5.6)</span><input name="where"></label>
<label class="fld"><span>বিস্তারিত</span><textarea name="message" rows="6" required></textarea></label>
<div class="row"><label class="fld"><span>নাম (ঐচ্ছিক)</span><input name="name" autocomplete="name"></label><label class="fld"><span>Email (ঐচ্ছিক)</span><input type="email" name="email" autocomplete="email"></label></div>
<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off"><button type="submit">পাঠাও</button><p class="status" role="status"></p></form>
</main>''' + bottom_nav("", "feedback") + FOOT.format(root="", year=YEAR))

def page_copyright():
    return (head("কপিরাইট নোটিশ — Python বই", "", "copyright.html") + '<body class="formpage">' + TOPBAR.format(root="") + f'''
<main class="fb-wrap legal"><h1>কপিরাইট নোটিশ</h1>
<p class="lead">© {YEAR} Kazi Tauhid Rana। <strong>Application Development Using Python</strong> বই ও এই website-এর সব লেখা, কোড উদাহরণ, ছবি, ডায়াগ্রাম, বোর্ড প্রশ্নের উত্তর ও ডিজাইনের সর্বস্বত্ব লেখকের সংরক্ষিত।</p>
<h2>যা করতে পারবে</h2>
<ul><li>এই website-এ বসে নিজের পড়াশোনার জন্য বইটা পড়া।</li><li>বইয়ের কোড দেখে নিজের হাতে টাইপ করে অনুশীলন করা।</li><li>বন্ধুদের সাথে এই website-এর <strong>link</strong> শেয়ার করা।</li></ul>
<h2>যা করা সম্পূর্ণ নিষেধ</h2>
<ul><li>লেখা, কোড, ছবি বা উত্তর কপি করে অন্য কোথাও (website, blog, Facebook, YouTube, PDF, নোট, গাইড বই) প্রকাশ করা।</li>
<li>Screenshot, ছবি তোলা, প্রিন্ট বা অন্য কোনো উপায়ে বইয়ের অংশ সংরক্ষণ করে বিতরণ বা বিক্রি করা।</li>
<li>লেখকের নাম সরিয়ে বা না দিয়ে নিজের নামে চালানো।</li>
<li>লেখকের লিখিত অনুমতি ছাড়া কোনো বাণিজ্যিক কাজে (কোচিং, গাইড, paid course) ব্যবহার করা।</li></ul>
<h2>কপিরাইট লঙ্ঘন করলে কী হবে</h2>
<p>বাংলাদেশের <strong>কপিরাইট আইন, ২০২৩</strong> অনুযায়ী অনুমতি ছাড়া কারো সৃষ্টিকর্ম পুনরুৎপাদন, প্রকাশ, বিতরণ বা অনলাইনে ছড়িয়ে দেওয়া দণ্ডনীয় অপরাধ। লঙ্ঘন প্রমাণিত হলে:</p>
<ul><li><strong>ফৌজদারি শাস্তি:</strong> আইনে নির্ধারিত মেয়াদের কারাদণ্ড, অর্থদণ্ড, অথবা উভয় দণ্ড হতে পারে।</li>
<li><strong>ক্ষতিপূরণ:</strong> লেখক দেওয়ানি আদালতে ক্ষতিপূরণ ও লঙ্ঘনকারী কাজ বন্ধের নিষেধাজ্ঞা চাইতে পারেন।</li>
<li><strong>জব্দ ও অপসারণ:</strong> নকল কপি, প্রিন্ট বা ফাইল জব্দ ও ধ্বংসের আদেশ হতে পারে; অনলাইন কনটেন্ট সরানোর জন্য Facebook, YouTube, Google ও hosting প্রতিষ্ঠানে আনুষ্ঠানিক অভিযোগ (takedown) পাঠানো হবে।</li>
<li><strong>আইনি ব্যবস্থা:</strong> লেখক কপিরাইট অফিস ও আইনশৃঙ্খলা বাহিনীর কাছে অভিযোগ দায়ের করার অধিকার রাখেন।</li></ul>
<p>দেশের বাইরে লঙ্ঘন হলে Berne Convention ও সংশ্লিষ্ট দেশের কপিরাইট আইন অনুযায়ী ব্যবস্থা নেওয়া হবে।</p>
<h2>অনুমতি বা অভিযোগ</h2>
<p>বইয়ের কোনো অংশ ব্যবহারের অনুমতি চাইলে, বা কোথাও এই বইয়ের নকল দেখলে <a href="feedback.html#report">এখানে জানাও</a>।</p>
</main>''' + bottom_nav("", "") + FOOT.format(root="", year=YEAR))

def page_pdf():
    prices = [50, 80, 100, 150, 200]
    chips = "".join(f'<label class="chip"><input type="radio" name="price" value="{n}" required><span>৳ {str(n).translate(BN)}</span></label>' for n in prices)
    want = [("হ্যাঁ, অবশ্যই নেব", "yes"), ("দাম ঠিক থাকলে নেব", "maybe"), ("এখনই না, পরে ভাবব", "later")]
    wants = "".join(f'<label class="chip wide"><input type="radio" name="interest" value="{t}" required><span>{t}</span></label>' for t, _ in want)
    pays = "".join(f'<label class="chip"><input type="checkbox" name="payment" value="{t}"><span>{t}</span></label>' for t in ["বিকাশ", "নগদ", "রকেট", "অন্য"])
    return (head("বইয়ের PDF — আগ্রহ ও দাম — Python বই", "", "pdf.html") + '<body class="formpage">' + TOPBAR.format(root="") + f'''
<main class="fb-wrap pdf-wrap"><p class="pdf-tag">শীঘ্রই আসছে</p><h1>বইয়ের PDF</h1>
<p class="lead">পুরো বইটার PDF সংস্করণ তৈরি হচ্ছে — অফলাইনে, মোবাইল বা কম্পিউটারে যেকোনো জায়গায় পড়ার জন্য। কতজন নিতে চাও আর কত দাম তোমাদের কাছে ঠিক মনে হয়, সেটা জেনেই দাম ঠিক করা হবে।</p>
<div class="pdf-buy"><p><strong>PDF নিতে চাইলে Facebook-এ মেসেজ দাও:</strong> <a href="{FB_URL}" target="_blank" rel="noopener">facebook.com/kazitauhidrana ↗</a></p>
<p>PDF কিনলে সাথে একটা <strong>আনলক কোড</strong> পাবে — সেটা দিয়ে এই website-এ সব অধ্যায়ের অনুশীলনী আর বোর্ড প্রশ্নের উত্তর খুলে যাবে।</p></div>
<ul class="pdf-pts"><li>এই website-এর পুরো বই — ১১টা অধ্যায় আর বোর্ড প্রশ্নের পরিশিষ্ট</li><li>তৈরি হলেই তোমার মোবাইল নম্বরে বা email-এ জানানো হবে</li><li>এখন কোনো টাকা দিতে হবে না — এটা শুধু আগ্রহ আর মতামত জানানোর ফর্ম</li></ul>

<form class="fb-form pdf-form" data-kind="PDF আগ্রহ ও দাম">
<fieldset><legend>তুমি কি PDF নিতে আগ্রহী?</legend><div class="chips">{wants}</div></fieldset>
<fieldset><legend>তোমার মতে PDF-এর ন্যায্য দাম কত?</legend><div class="chips">{chips}<label class="chip"><input type="radio" name="price" value="other"><span>অন্য</span></label></div>
<label class="fld other-price" hidden><span>তোমার প্রস্তাবিত দাম (টাকা)</span><input type="number" name="price_other" min="0" max="5000" inputmode="numeric" placeholder="যেমন: ১২০"></label></fieldset>
<div class="row"><label class="fld"><span>নাম</span><input name="name" required autocomplete="name"></label>
<label class="fld"><span>মোবাইল নম্বর</span><input name="phone" type="tel" required inputmode="tel" autocomplete="tel" pattern="(\\+?88)?01[3-9][0-9]{{8}}" placeholder="01XXXXXXXXX" title="১১ সংখ্যার নম্বর, যেমন 017XXXXXXXX"></label></div>
<div class="row"><label class="fld"><span>প্রতিষ্ঠান</span><input name="institute" placeholder="যেমন: Rajshahi Polytechnic Institute"></label>
<label class="fld"><span>টেকনোলজি ও পর্ব</span><input name="technology" placeholder="যেমন: CST, ৩য় পর্ব"></label></div>
<fieldset><legend>কীভাবে টাকা দিতে সুবিধা? <small>(একাধিক বাছতে পারো)</small></legend><div class="chips">{pays}</div></fieldset>
<label class="fld"><span>Email (ঐচ্ছিক)</span><input type="email" name="email" autocomplete="email"></label>
<label class="fld"><span>PDF-এ আর কী চাও? (ঐচ্ছিক)</span><textarea name="message" rows="3" placeholder="যেমন: অধ্যায়ের শেষে বেশি practice প্রশ্ন, প্রিন্ট করার সুবিধা…"></textarea></label>
<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off"><button type="submit">আগ্রহ জানাও</button><p class="status" role="status"></p>
<p class="pdf-note">তোমার নম্বর আর email শুধু PDF-এর খবর জানাতে ব্যবহার হবে, কারো সাথে শেয়ার করা হবে না।</p></form>
</main>''' + bottom_nav("", "") + FOOT.format(root="", year=YEAR))

def page_runner():
    samples = '<option value="">উদাহরণ…</option><option value="hello">Hello</option><option value="input">input() দিয়ে</option><option value="loop">for loop</option><option value="class">Class ও Object</option>'
    return (head("কোড রানার — Python বই", "", "runner.html") + '<body class="runnerpage">' + TOPBAR.format(root="") + f'''
<main class="runner-wrap"><h1>কোড রানার</h1>
<p class="lead">নিজে Python কোড লেখো আর চালাও। কিছু install করতে হবে না, সব তোমার browser-এই চলে। প্রথমবার চালাতে ১০–২০ সেকেন্ড লাগবে।</p>
<div class="runner">
<section class="pane"><div class="pane-bar"><span class="pane-name">main.py</span><select id="rx-sample" aria-label="উদাহরণ বেছে নাও">{samples}</select><button type="button" id="rx-new">নতুন</button><button type="button" id="rx-run" class="go">▶ চালাও</button></div>
<div class="keys" role="toolbar" aria-label="চিহ্ন বসাও"><button type="button" data-ins="    " aria-label="Tab — ৪টা space">⇥</button><button type="button" data-ins=":">:</button><button type="button" data-ins="()">(</button><button type="button" data-ins=")">)</button><button type="button" data-ins="&quot;&quot;">&quot;</button><button type="button" data-ins="''">'</button><button type="button" data-ins="[]">[</button><button type="button" data-ins="]">]</button><button type="button" data-ins="=">=</button><button type="button" data-ins="_">_</button><button type="button" data-ins="# ">#</button><button type="button" data-ins="+">+</button><button type="button" data-ins="-">-</button><button type="button" data-ins="*">*</button><button type="button" data-ins="/">/</button><button type="button" data-ins="<"><</button><button type="button" data-ins=">">></button><button type="button" data-ins="{{}}">{{</button><button type="button" data-ins="}}">}}</button><button type="button" data-ins=",">,</button><button type="button" data-ins=".">.</button></div><div class="editor"><pre class="gutter" aria-hidden="true">1</pre><textarea id="rx-code" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Python কোড"></textarea></div></section>
<section class="pane io"><label class="pane-bar" for="rx-stdin"><span class="pane-name">Input</span><small>input() থাকলে প্রতি লাইনে একটা মান</small></label>
<textarea id="rx-stdin" rows="3" spellcheck="false"></textarea>
<div class="pane-bar"><span class="pane-name">Output</span><span class="run-status" id="rx-status"></span><button type="button" id="rx-stop">থামাও</button><button type="button" id="rx-clear">মুছো</button></div>
<pre class="run-out" id="rx-out" aria-live="polite"></pre></section>
</div>
<p class="hint"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> = চালাও · <kbd>Tab</kbd> = ৪টা space · তোমার কোড এই browser-এ আপনা-আপনি save থাকে।</p>
</main>''' + bottom_nav("", "runner") + FOOT.format(root="", year=YEAR))

os.makedirs(OUT + "/chapters", exist_ok=True); os.makedirs(LOCKED_DIR, exist_ok=True); os.makedirs(OUT + "/img", exist_ok=True); os.makedirs(OUT + "/assets", exist_ok=True)
chapters = []
for i in range(1, 13):
    B = json.load(open(f"{SRC}/final_{i:02d}.json", encoding="utf-8"))
    for b in B:
        if b["t"] == "img": shutil.copy(f"{SRC}/{b['path']}", f"{OUT}/img/")
    c = next(b for b in B if b["t"] == "chapter")
    chapters.append((i, c["title"], SHORT[i]))
    open(f"{OUT}/chapters/ch{i:02d}.html", "w", encoding="utf-8").write(page_chapter(i, B))
open(f"{OUT}/index.html", "w", encoding="utf-8").write(page_index(chapters))
open(f"{OUT}/feedback.html", "w", encoding="utf-8").write(page_feedback(chapters))
open(f"{OUT}/copyright.html", "w", encoding="utf-8").write(page_copyright())
open(f"{OUT}/runner.html", "w", encoding="utf-8").write(page_runner())
open(f"{OUT}/pdf.html", "w", encoding="utf-8").write(page_pdf())
shutil.copy(f"{SRC}/logo.png", f"{OUT}/img/logo.png")
print("ok")
