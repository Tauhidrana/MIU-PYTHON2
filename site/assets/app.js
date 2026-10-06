(function () {
  var root = document.documentElement;
  var themeBtn = document.querySelector(".theme");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var dark = root.dataset.theme !== "dark";
    if (dark) root.dataset.theme = "dark"; else delete root.dataset.theme;
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
  });

  // মোবাইল: নিচের মেনুর "অধ্যায়" বাটন — বিষয়সূচির sheet খোলা/বন্ধ
  var sheet = document.getElementById("sheet"), tocBtn = document.querySelector(".bn-toc");
  if (sheet && tocBtn) {
    var openSheet = function () {
      sheet.hidden = false; tocBtn.setAttribute("aria-expanded", "true");
      document.documentElement.classList.add("sheet-open");
      requestAnimationFrame(function () { sheet.classList.add("show"); });
      var cur = sheet.querySelector(".sheet-sec a.on") || sheet.querySelector(".sheet-ch a.on");
      if (cur) cur.scrollIntoView({ block: "center" });
    };
    var closeSheet = function () {
      sheet.classList.remove("show"); tocBtn.setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("sheet-open");
      setTimeout(function () { if (!sheet.classList.contains("show")) sheet.hidden = true; }, 220);
    };
    tocBtn.addEventListener("click", function () { if (sheet.hidden) openSheet(); else closeSheet(); });
    sheet.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]") || e.target.closest("a")) closeSheet();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });
    // যে section পড়া হচ্ছে, sheet-এ সেটা চিহ্নিত থাকে
    var secLinks = sheet.querySelectorAll(".sheet-sec a");
    if (secLinks.length && "IntersectionObserver" in window) {
      var smap = {}; secLinks.forEach(function (a) { smap[a.getAttribute("href").slice(1)] = a; });
      var sio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { secLinks.forEach(function (a) { a.classList.remove("on"); }); smap[e.target.id].classList.add("on"); } });
      }, { rootMargin: "-80px 0px -70% 0px" });
      Object.keys(smap).forEach(function (id) { var el = document.getElementById(id); if (el) sio.observe(el); });
    }
  }

  // টপিকের ভিডিও: চাপলে তবেই YouTube player লোড হয়
  document.querySelectorAll(".yt-play").forEach(function (b) {
    b.addEventListener("click", function () {
      var box = b.closest(".yt"), id = box.dataset.id;
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      f.title = b.getAttribute("aria-label").replace("ভিডিও চালাও: ", "");
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      var wrap = document.createElement("div"); wrap.className = "yt-frame"; wrap.appendChild(f);
      b.replaceWith(wrap); box.classList.add("playing");
    });
  });

  var toggle = document.querySelector(".side-toggle");
  if (toggle) toggle.addEventListener("click", function () { toggle.parentElement.classList.toggle("open"); });

  // reading progress + resume
  var bar = document.querySelector(".progress span");
  var page = location.pathname.split("/").pop();
  if (document.body.classList.contains("reader")) {
    var saveAt = 0;
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      var p = h > 0 ? Math.min(1, scrollY / h) : 0;
      if (bar) bar.style.width = (p * 100) + "%";
      var now = Date.now();
      if (now - saveAt > 800) {
        saveAt = now;
        try {
          localStorage.setItem("last", JSON.stringify({ page: page, y: scrollY }));
          if (p > 0.9) { var d = JSON.parse(localStorage.getItem("done") || "[]"); if (d.indexOf(page) < 0) { d.push(page); localStorage.setItem("done", JSON.stringify(d)); } }
        } catch (e) {}
      }
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    try {
      var done = JSON.parse(localStorage.getItem("done") || "[]");
      document.querySelectorAll(".side a").forEach(function (a) { if (done.indexOf(a.getAttribute("href")) >= 0) a.classList.add("done"); });
      var last = JSON.parse(localStorage.getItem("last") || "null");
      if (last && last.page === page && !location.hash && sessionStorage.getItem("restored") !== page) { scrollTo(0, last.y); sessionStorage.setItem("restored", page); }
    } catch (e) {}
    var links = document.querySelectorAll(".mini a[href^='#s']");
    if ("IntersectionObserver" in window && links.length) {
      var map = {}; links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { links.forEach(function (a) { a.classList.remove("on"); }); map[e.target.id].classList.add("on"); } });
      }, { rootMargin: "-80px 0px -70% 0px" });
      Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
    }
  }
  var resume = document.getElementById("resume");
  if (resume) try {
    var l = JSON.parse(localStorage.getItem("last") || "null");
    if (l && l.page) { resume.href = "chapters/" + l.page; resume.hidden = false; }
  } catch (e) {}

  // tabs
  document.querySelectorAll(".tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".tabs button").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
      document.querySelectorAll(".panel").forEach(function (p) { p.hidden = p.id !== b.dataset.tab; });
    });
  });
  if (location.hash === "#report") { var rb = document.querySelector('[data-tab="report"]'); if (rb) rb.click(); }

  // PDF ফর্ম: "অন্য" দাম বাছলে ঘর দেখাও
  document.querySelectorAll(".pdf-form").forEach(function (form) {
    var other = form.querySelector(".other-price");
    form.addEventListener("change", function (e) {
      if (e.target.name !== "price") return;
      other.hidden = e.target.value !== "other";
      if (!other.hidden) other.querySelector("input").focus();
    });
    form.addEventListener("reset", function () { other.hidden = true; });
  });

  // forms -> Gmail (FormSubmit), অথবা key থাকলে Web3Forms
  document.querySelectorAll(".fb-form").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var status = form.querySelector(".status"), btn = form.querySelector("button[type=submit]");
      var cfg = window.SITE_CONFIG || {};
      var useW3 = cfg.WEB3FORMS_KEY && cfg.WEB3FORMS_KEY.indexOf("YOUR_") !== 0;
      if (!useW3 && !cfg.EMAIL) {
        status.className = "status err"; status.textContent = "Website-এর মালিক এখনো email সংযোগ চালু করেননি (assets/config.js)।"; return;
      }
      // একই নামের একাধিক checkbox (যেমন পেমেন্টের মাধ্যম) কমা দিয়ে জোড়া লাগে
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = data[k] ? data[k] + ", " + v : v; });
      if (data.price === "other") {
        if (!data.price_other) { status.className = "status err"; status.textContent = "তোমার প্রস্তাবিত দামটা লেখো।"; form.querySelector("[name=price_other]").focus(); return; }
        data.price = data.price_other;
      }
      delete data.price_other;
      if (data.botcheck) return;
      delete data.botcheck;
      var kind = form.dataset.kind;
      var stars = data.rating ? " — " + "★".repeat(+data.rating) + " (" + data.rating + "/5)" : "";
      if (data.price) stars += " — দাম: ৳" + data.price + (data.interest ? " — " + data.interest : "");
      var subject = "[" + (cfg.SITE_NAME || "Python বই") + "] " + kind + stars;
      var url, payload;
      if (useW3) {
        url = "https://api.web3forms.com/submit";
        payload = Object.assign({ access_key: cfg.WEB3FORMS_KEY, subject: subject, from_name: data.name ? data.name + " (Python বই)" : "Python বই — পাঠক", form: kind, page: document.title }, data);
      } else {
        url = "https://formsubmit.co/ajax/" + encodeURIComponent(cfg.EMAIL);
        payload = Object.assign({ _subject: subject, _template: "table", _captcha: "false", form: kind, page: document.title }, data);
      }
      btn.disabled = true; status.className = "status"; status.textContent = "পাঠানো হচ্ছে…";
      fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.success === true || res.success === "true") { form.reset(); status.className = "status ok"; status.textContent = "ধন্যবাদ! তোমার মতামত লেখকের কাছে পৌঁছে গেছে।"; }
          else throw new Error(res.message);
        })
        .catch(function () { status.className = "status err"; status.textContent = "পাঠানো যায়নি। Internet সংযোগ দেখে আবার চেষ্টা করো।"; })
        .finally(function () { btn.disabled = false; });
    });
  });
})();
