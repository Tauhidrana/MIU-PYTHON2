// কনটেন্ট সুরক্ষা — right click, select, copy, print, save, devtools shortcut ও screenshot প্রতিরোধ
(function () {
  var NOTICE = "© Kazi Tauhid Rana — Application Development Using Python। সর্বস্বত্ব সংরক্ষিত। কপি করা কপিরাইট আইন, ২০২৩ অনুযায়ী দণ্ডনীয় অপরাধ।";
  var root = document.documentElement;
  root.classList.add("guard");

  // অন্য website-এ iframe করে দেখানো বন্ধ
  try { if (window.top !== window.self) window.top.location = window.self.location; } catch (e) { document.write(""); }

  function isField(t) {
    return t && t.closest && t.closest("input, textarea, select, [contenteditable]");
  }

  var toastTimer;
  function toast(msg) {
    var el = document.getElementById("guard-toast");
    if (!el) {
      if (!document.body) return;
      el = document.createElement("div"); el.id = "guard-toast"; el.setAttribute("role", "alert");
      document.body.appendChild(el);
    }
    el.textContent = msg || "কপি করা নিষেধ — © কপিরাইট সংরক্ষিত";
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  var shieldTimer;
  function shield(ms) {
    root.classList.add("shielded");
    clearTimeout(shieldTimer);
    if (ms) shieldTimer = setTimeout(function () { root.classList.remove("shielded"); }, ms);
  }
  function unshield() { clearTimeout(shieldTimer); root.classList.remove("shielded"); }

  // Screenshot-এর key চাপলে পাতা সাথে সাথে ফাঁকা হয়ে যায়, আর key ছেড়ে পাতায় আবার mouse/key ব্যবহার করলে ফিরে আসে।
  // Windows key ও PrtSc operating system নিজে ধরে — কোনো website এগুলো বন্ধ করতে পারে না — তাই key চাপার মুহূর্তেই
  // লেখা সরিয়ে ফেলা হয়, যাতে screenshot-এ শুধু ফাঁকা পাতা আসে।
  var TOUCH = window.matchMedia && matchMedia("(pointer:coarse)").matches;
  var IS_WIN = /win/i.test((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "");
  var MODS = { shift: 1, control: 1, alt: 1, meta: 1, os: 1, altgraph: 1, capslock: 1, fn: 1 };
  var armed = false, armTimer;
  function hold() {
    shield(); armed = false;
    clearTimeout(armTimer); armTimer = setTimeout(function () { armed = true; }, 900);
  }
  function wake(e) {
    if (!armed || !document.hasFocus()) return;
    if (e && (e.metaKey || (IS_WIN && e.altKey) || e.getModifierState && e.getModifierState("OS"))) return;
    armed = false; unshield();
  }
  ["mousemove", "mousedown", "wheel", "touchstart"].forEach(function (ev) { document.addEventListener(ev, wake, { passive: true }); });

  function wipeClipboard() {
    try { if (navigator.clipboard) navigator.clipboard.writeText(NOTICE).catch(function () {}); } catch (e) {}
  }

  document.addEventListener("contextmenu", function (e) {
    if (isField(e.target)) return;
    e.preventDefault(); toast((TOUCH ? "Long press" : "Right click") + " বন্ধ করা আছে — © কপিরাইট সংরক্ষিত");
  });
  ["selectstart", "dragstart"].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (!isField(e.target)) e.preventDefault(); });
  });
  // মোবাইলে কোনোভাবে লেখা select হয়ে গেলেও সাথে সাথে মুছে যায় (form-এর ঘর বাদে)
  document.addEventListener("selectionchange", function () {
    var sel = window.getSelection && getSelection();
    if (!sel || sel.isCollapsed || isField(document.activeElement)) return;
    var n = sel.anchorNode, el = n && (n.nodeType === 1 ? n : n.parentElement);
    if (!isField(el)) sel.removeAllRanges();
  });
  ["copy", "cut"].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (isField(e.target)) return;
      e.preventDefault();
      if (e.clipboardData) e.clipboardData.setData("text/plain", NOTICE);
      toast();
    });
  });

  document.addEventListener("keydown", function (e) {
    var k = (e.key || "").toLowerCase(), mod = e.ctrlKey || e.metaKey;
    // Developer tools / view source
    if (k === "f12" || (mod && e.shiftKey && "ijck".indexOf(k) >= 0) || (e.metaKey && e.altKey && "ijcu".indexOf(k) >= 0) || (mod && k === "u")) {
      e.preventDefault(); toast("এই অপশন বন্ধ করা আছে"); return;
    }
    // Screenshot: PrtSc, Windows key (Win+Shift+S, Win+PrtSc, Win+Alt+PrtSc, Win+G), Alt+PrtSc, macOS ⌘⇧3/4/5
    var winKey = k === "meta" || k === "os" || e.metaKey || (e.getModifierState && e.getModifierState("OS"));
    if (k === "printscreen" || (IS_WIN && (winKey || k === "alt")) || (e.metaKey && e.shiftKey)) {
      hold(); wipeClipboard();
      if (k === "printscreen" || e.shiftKey) toast("Screenshot নেওয়া নিষেধ — © কপিরাইট সংরক্ষিত");
      if (k === "printscreen") e.preventDefault();
      return;
    }
    if (!MODS[k]) wake(e);
    // Save, print — সবখানে বন্ধ
    if (mod && (k === "s" || k === "p")) { e.preventDefault(); toast(k === "p" ? "প্রিন্ট করা নিষেধ — © কপিরাইট সংরক্ষিত" : "Save করা নিষেধ — © কপিরাইট সংরক্ষিত"); return; }
    // Copy, cut, select all — শুধু form-এর বাইরে বন্ধ
    if (mod && "cxa".indexOf(k) >= 0 && k && !isField(e.target)) { e.preventDefault(); toast(); }
  }, true);
  document.addEventListener("keyup", function (e) {
    if ((e.key || "").toLowerCase() === "printscreen") { hold(); wipeClipboard(); toast("Screenshot নেওয়া নিষেধ — © কপিরাইট সংরক্ষিত"); }
  }, true);

  // অন্য app-এ গেলে (snipping tool, screen recorder) লেখা ঝাপসা হয়ে যায়
  var away = false;
  // ভিডিওর ভেতরে ক্লিক করলেও window "blur" হয় — তখন পাতা লুকানো হয় না
  function inVideo() { var a = document.activeElement; return a && a.tagName === "IFRAME" && a.closest(".yt"); }
  window.addEventListener("blur", function () {
    setTimeout(function () { if (inVideo()) return; away = true; shield(); }, 0);
  });
  window.addEventListener("focus", function () { if (away) { away = false; hold(); } });
  document.addEventListener("visibilitychange", function () { if (document.hidden) { away = true; shield(); } else if (away) { away = false; hold(); } });

  window.addEventListener("beforeprint", function () { shield(); toast("প্রিন্ট করা নিষেধ — © কপিরাইট সংরক্ষিত"); });
  window.addEventListener("afterprint", function () { unshield(); });

  // প্রতিটা পাতায় হালকা copyright watermark — screenshot নিলেও লেখকের নাম থাকবে
  document.addEventListener("DOMContentLoaded", function () {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="260"><text x="40" y="160" transform="rotate(-24 210 130)" '
      + 'font-family="Hind Siliguri, sans-serif" font-size="17" font-weight="600" fill="#5B6478">© Kazi Tauhid Rana · Python বই</text></svg>';
    var wm = document.createElement("div");
    wm.className = "watermark"; wm.setAttribute("aria-hidden", "true");
    wm.style.backgroundImage = 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
    document.body.appendChild(wm);
    var cover = document.createElement("div");
    cover.className = "shield-msg"; cover.setAttribute("aria-hidden", "true");
    cover.innerHTML = "<p><strong>© কপিরাইট সংরক্ষিত</strong><br>Screenshot নেওয়া নিষেধ।<br><small>" + (TOUCH ? "পড়া চালিয়ে যেতে স্ক্রিনে একবার ছোঁও।" : "পড়া চালিয়ে যেতে mouse নাড়াও বা পাতায় ক্লিক করো।") + "</small></p>";
    document.body.appendChild(cover);
    document.querySelectorAll("img").forEach(function (img) { img.setAttribute("draggable", "false"); });
  });
})();
