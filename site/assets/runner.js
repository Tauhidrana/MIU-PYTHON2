// কোড রানার — বইয়ের প্রতিটা Python কোডের পাশে "চালাও" বাটন, আর runner.html-এর নিজের লেখা কোড চালানো
(function () {
  var WORKER_URL = new URL("py-worker.js", document.currentScript.src).href;
  var MAX_OUT = 60000, MAX_MS = 20000, LOAD_MS = 60000;
  var LOAD_FAIL = "Python লোড করা যায়নি। Internet সংযোগ দেখে আবার \"চালাও\" চাপো।";
  var worker = null, ready = false, pending = null, job = null, killTimer, loadTimer;

  function boot() {
    if (worker) return;
    ready = false;
    worker = new Worker(WORKER_URL);
    worker.onmessage = onMessage;
    worker.onerror = function () { fail(LOAD_FAIL); };
    // CDN আটকে গেলে অনন্তকাল "লোড হচ্ছে" না দেখিয়ে এক মিনিট পরে error দেখাও
    clearTimeout(loadTimer);
    loadTimer = setTimeout(function () { if (!ready) fail("Python লোড হতে অনেক সময় লাগছে। Internet ধীর হতে পারে — একটু পরে আবার \"চালাও\" চাপো।"); }, LOAD_MS);
  }
  function fail(text) {
    clearTimeout(loadTimer);
    if (worker) worker.terminate();
    worker = null; ready = false;
    var j = job || (pending && pending.sink);
    job = null; pending = null;
    if (j) j.done(false, text);
  }
  function send(p) {
    job = p.sink; job.size = 0;
    job.status("চলছে…");
    clearTimeout(killTimer);
    killTimer = setTimeout(function () { stop("২০ সেকেন্ডের বেশি চলছে, তাই থামিয়ে দেওয়া হলো। কোথাও infinite loop আছে কিনা দেখো।"); }, MAX_MS);
    worker.postMessage({ type: "run", code: p.code, stdin: p.stdin, files: p.files });
  }
  function onMessage(ev) {
    var m = ev.data;
    if (m.type === "ready") { ready = true; clearTimeout(loadTimer); if (pending) { var p = pending; pending = null; send(p); } return; }
    if (m.type === "fail") { fail(LOAD_FAIL); return; }
    if (!job) return;
    if (m.type === "out" || m.type === "err" || m.type === "in") {
      job.size += m.text.length;
      if (job.size > MAX_OUT) { stop("Output অনেক বড় হয়ে গেছে, তাই থামিয়ে দেওয়া হলো।"); return; }
      job.out(m.text, m.type);
    } else if (m.type === "done") {
      clearTimeout(killTimer);
      var j = job; job = null;
      j.done(m.ok, m.text ? m.text + hint(m.text) : "");
    }
  }
  function hint(t) {
    if (/ModuleNotFoundError/.test(t)) return "\n\n→ এই module browser-এ নেই, অথবা উদাহরণটার জন্য বইয়ের অন্য একটা .py ফাইল লাগে।";
    if (/EOFError/.test(t)) return "\n\n→ input() আরও মান চাইছে। Input ঘরে প্রতি লাইনে একটা করে মান লেখো।";
    return "";
  }
  function run(code, stdin, sink, files) {
    if (job) { stop(); }
    var p = { code: code, stdin: stdin || "", sink: sink, files: files || {} };
    boot();
    if (ready) send(p);
    else { if (pending) pending.sink.done(false, "", true); pending = p; sink.status("Python লোড হচ্ছে… (প্রথমবার ১০–২০ সেকেন্ড)"); }
  }
  function stop(reason) {
    clearTimeout(killTimer);
    var j = job || (pending && pending.sink);
    if (!j) return;
    job = null; pending = null;
    clearTimeout(loadTimer);
    if (worker) worker.terminate();
    worker = null; ready = false;
    j.done(false, reason || "থামানো হয়েছে।", true);
  }
  window.PyRun = { run: run, stop: stop, busy: function () { return !!(job || pending); } };

  // একটা output বাক্স — দুই জায়গাতেই একই রকম
  function sinkFor(pre, statusEl, onEnd) {
    return {
      status: function (t) { statusEl.textContent = t; statusEl.className = "run-status busy"; },
      out: function (text, kind) {
        if (pre.dataset.fresh) { pre.textContent = ""; delete pre.dataset.fresh; }
        var s = document.createElement("span");
        s.className = "o-" + kind; s.textContent = text;
        pre.appendChild(s);
        pre.scrollTop = pre.scrollHeight;
      },
      done: function (ok, err, stopped) {
        if (pre.dataset.fresh) { pre.textContent = ""; delete pre.dataset.fresh; }
        if (err) { var e = document.createElement("span"); e.className = stopped ? "o-note" : "o-error"; e.textContent = (pre.textContent ? "\n" : "") + err; pre.appendChild(e); }
        if (!pre.textContent) { var n = document.createElement("span"); n.className = "o-note"; n.textContent = "(কোনো output নেই)"; pre.appendChild(n); }
        statusEl.textContent = stopped ? "থেমেছে" : ok ? "✓ সফল" : "✗ Error";
        statusEl.className = "run-status " + (stopped ? "" : ok ? "ok" : "bad");
        pre.scrollTop = pre.scrollHeight;
        if (onEnd) onEnd();
      }
    };
  }
  function begin(pre) { pre.dataset.fresh = "1"; }

  // ===== বইয়ের পাতায়: প্রতিটা Python কোডের পাশে "চালাও" =====
  function codeOf(fig) {
    var c = fig.querySelector("pre code").cloneNode(true);
    c.querySelectorAll(".ln").forEach(function (n) { n.remove(); });
    return c.textContent.replace(/\n$/, "").split("\n").map(function (l) { return l === " " ? "" : l; }).join("\n");
  }
  // অধ্যায়ে যে ফাইলগুলো দেখানো আছে (geometry.py, school/student.py, students.txt …) — একই নামের একাধিক
  // সংস্করণ থাকলে, যে কোড চালানো হচ্ছে তার আগেরটা (না থাকলে পরেরটা) নেওয়া হয়
  var named = [];
  function filesFor(fig) {
    var pick = {};
    named.forEach(function (n) {
      if (n.fig === fig) return;
      var before = n.fig.compareDocumentPosition(fig) & Node.DOCUMENT_POSITION_FOLLOWING;
      if (before || !pick[n.name]) pick[n.name] = { fig: n.fig };
    });
    var out = {};
    Object.keys(pick).forEach(function (k) { out[k] = codeOf(pick[k].fig); });
    return out;
  }
  function attach(fig) {
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "run"; btn.innerHTML = "▶ চালাও";
    btn.setAttribute("aria-label", "এই কোড চালাও");
    var cap = fig.querySelector("figcaption");
    if (fig.classList.contains("mini")) { fig.classList.add("has-run"); fig.appendChild(btn); }
    else cap.appendChild(btn);
    var panel;
    btn.addEventListener("click", function () {
      var code = codeOf(fig);
      if (!panel) {
        panel = document.createElement("div");
        panel.className = "run-panel";
        var needsIn = /\binput\s*\(/.test(code);
        var out = fig.nextElementSibling && fig.nextElementSibling.classList.contains("output") ? fig.nextElementSibling : null;
        var given = out ? Array.prototype.map.call(out.querySelectorAll(".in"), function (s) { return s.textContent; }).join("\n") : "";
        panel.innerHTML = '<div class="run-head"><span class="run-title">Live Output</span><span class="run-status"></span>'
          + '<button type="button" class="rp-again">↻ আবার</button><button type="button" class="rp-stop">থামাও</button><button type="button" class="rp-close" aria-label="বন্ধ করো">✕</button></div>'
          + (needsIn ? '<label class="run-stdin"><span>Input — প্রতি লাইনে একটা মান (বদলে আবার চালাও)</span><textarea rows="2" spellcheck="false"></textarea></label>' : "")
          + '<pre class="run-out" aria-live="polite"></pre>';
        if (needsIn) panel.querySelector("textarea").value = given;
        (out || fig).after(panel);
        var pre = panel.querySelector(".run-out"), st = panel.querySelector(".run-status");
        var go = function () {
          begin(pre);
          var ta = panel.querySelector("textarea");
          run(codeOf(fig), ta ? ta.value : "", sinkFor(pre, st), filesFor(fig));
        };
        panel.querySelector(".rp-again").addEventListener("click", go);
        panel.querySelector(".rp-stop").addEventListener("click", function () { stop(); });
        panel.querySelector(".rp-close").addEventListener("click", function () { stop(); panel.hidden = true; });
        panel.go = go;
      }
      panel.hidden = false;
      panel.go();
    });
  }
  // root-এর ভেতরের কোডে "চালাও" বসায় — লক খোলার পর নতুন অংশের জন্যও (assets/lock.js) ডাকা হয়
  function scan(root) {
    root.querySelectorAll("figure.code:not(.term):not(.mini)").forEach(function (f) {
      var fn = (f.querySelector(".fn") || {}).textContent || "";
      if (/^[\w./-]+\.\w+$/.test(fn) && fn !== "main.py") named.push({ name: fn, fig: f });
    });
    root.querySelectorAll("figure.code").forEach(function (fig) {
      if (fig.classList.contains("term") || fig.classList.contains("text")) return;
      if (fig.closest(".syntax")) return;
      if (fig.classList.contains("mini") && !fig.closest(".mk-col")) return;
      attach(fig);
    });
  }
  window.MIU_scanCode = scan;
  scan(document);

  // ===== runner.html — নিজে লিখে চালাও =====
  var ed = document.getElementById("rx-code");
  if (!ed) return;
  var gutter = document.querySelector(".gutter"), stdin = document.getElementById("rx-stdin");
  var outEl = document.getElementById("rx-out"), statusEl = document.getElementById("rx-status"), runBtn = document.getElementById("rx-run");
  var SAMPLES = {
    hello: ['print("Hello, Python!")', 'print("২ + ৩ =", 2 + 3)', ""],
    input: ['name = input("তোমার নাম: ")', 'marks = int(input("নম্বর: "))', 'print("স্বাগতম,", name)', 'print("পাস" if marks >= 40 else "ফেল")', "Rahim\n72"],
    loop: ["for i in range(1, 11):", '    print(5, "x", i, "=", 5 * i)', ""],
    "class": ["class Student:", "    def __init__(self, name, cgpa):", "        self.name = name", "        self.cgpa = cgpa", "",
              "    def show(self):", '        print(self.name, "-", self.cgpa)', "", 's = Student("Sumaiya", 3.9)', "s.show()", ""]
  };
  function lines() { var n = ed.value.split("\n").length, a = []; for (var i = 1; i <= n; i++) a.push(i); gutter.textContent = a.join("\n"); gutter.scrollTop = ed.scrollTop; }
  function save() { try { localStorage.setItem("runner-code", ed.value); localStorage.setItem("runner-stdin", stdin.value); } catch (e) {} }
  function load(name) { var s = SAMPLES[name]; ed.value = s.slice(0, -1).join("\n"); stdin.value = s[s.length - 1]; lines(); save(); ed.focus(); }
  var saved = null;
  try { saved = localStorage.getItem("runner-code"); if (saved !== null) { ed.value = saved; stdin.value = localStorage.getItem("runner-stdin") || ""; } } catch (e) {}
  if (saved === null) load("hello");
  lines();
  ed.addEventListener("input", function () { lines(); save(); });
  stdin.addEventListener("input", save);
  ed.addEventListener("scroll", function () { gutter.scrollTop = ed.scrollTop; });
  function insert(t) {
    var s = ed.selectionStart, e = ed.selectionEnd;
    ed.setRangeText(t, s, e, "end");
    ed.dispatchEvent(new Event("input"));
  }
  // মোবাইলের চিহ্ন-বার: চাপলে editor থেকে focus সরে না, তাই keyboard খোলাই থাকে
  var keys = document.querySelector(".keys");
  if (keys) {
    keys.addEventListener("pointerdown", function (e) { if (e.target.closest("button")) e.preventDefault(); });
    keys.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var t = b.dataset.ins, pair = t.length === 2 && "()[]{}\"\"''".indexOf(t) % 2 === 0 && "()[]{}\"\"''".indexOf(t) >= 0;
      if (document.activeElement !== ed) ed.focus();
      insert(t);
      if (pair) { ed.selectionStart = ed.selectionEnd = ed.selectionStart - 1; }
    });
  }
  ed.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); go(); return; }
    if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); insert("    "); return; }
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
      var before = ed.value.slice(0, ed.selectionStart), line = before.slice(before.lastIndexOf("\n") + 1);
      var ind = line.match(/^ */)[0] + (/:\s*$/.test(line) ? "    " : "");
      e.preventDefault(); insert("\n" + ind);
    }
  });
  function go() {
    begin(outEl);
    runBtn.disabled = true;
    // মোবাইলে keyboard বন্ধ করে output দেখাও
    if (window.matchMedia && matchMedia("(max-width:860px)").matches) {
      ed.blur();
      outEl.closest(".pane").scrollIntoView({ block: "start", behavior: "smooth" });
    }
    run(ed.value, stdin.value, sinkFor(outEl, statusEl, function () { runBtn.disabled = false; }));
  }
  runBtn.addEventListener("click", go);
  document.getElementById("rx-stop").addEventListener("click", function () { stop(); });
  document.getElementById("rx-clear").addEventListener("click", function () { outEl.textContent = ""; statusEl.textContent = ""; statusEl.className = "run-status"; });
  document.getElementById("rx-new").addEventListener("click", function () { ed.value = ""; stdin.value = ""; lines(); save(); ed.focus(); });
  document.getElementById("rx-sample").addEventListener("change", function () { if (this.value) load(this.value); this.value = ""; });
})();
