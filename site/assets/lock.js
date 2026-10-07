// ===== অনুশীলনী ও বোর্ড প্রশ্নের লক — PDF-এর সাথে পাওয়া আনলক কোড দিয়ে খোলে =====
// পাতায় আসল লেখা নেই, শুধু skeleton। কোড দিলে /api/unlock একটা token দেয়; সেই token দেখিয়ে /api/exercise থেকে
// এই অধ্যায়ের লেখা আসে। token এই browser-এ থাকে, তাই reload-এ বা অন্য অধ্যায়ে আবার কোড দিতে হয় না।
(function () {
  var boxes = document.querySelectorAll(".locked");
  if (!boxes.length) return;
  var KEY = "unlock-token", ch = boxes[0].dataset.ch;
  var form = document.querySelector(".lock-form"), status = document.querySelector(".lock-status");

  function say(cls, msg) { if (status) { status.className = "lock-status " + cls; status.textContent = msg; } }
  function getToken() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setToken(t) { try { if (t) localStorage.setItem(KEY, t); else localStorage.removeItem(KEY); } catch (e) {} }

  // token দিয়ে এই অধ্যায়ের লক করা অংশগুলো এনে বসায়; token বাতিল হলে reject({auth: true})
  function openAll(token) {
    return fetch("/api/exercise?ch=" + encodeURIComponent(ch), { headers: { Authorization: "Bearer " + token }, cache: "no-store" })
      .then(function (r) {
        if (r.status === 401) throw { auth: true };
        if (!r.ok) throw { msg: "অনুশীলনী লোড করা যায়নি। একটু পরে পাতাটা আবার খোলো।" };
        return r.json();
      })
      .then(function (d) {
        boxes.forEach(function (b, i) {
          if (d.blocks[i] == null) return;
          var div = document.createElement("div");
          div.className = "unlocked"; div.innerHTML = d.blocks[i];
          b.replaceWith(div);
          if (window.MIU_scanCode) window.MIU_scanCode(div);
        });
        if (location.hash === "#unlock") history.replaceState(null, "", location.pathname + location.search);
      });
  }
  function netErr(e) { return e && e.msg ? e.msg : "সার্ভারে পৌঁছানো যাচ্ছে না। Internet সংযোগ দেখে আবার চেষ্টা করো।"; }

  var saved = getToken();
  if (saved) {
    say("", "অনুশীলনী খোলা হচ্ছে…");
    openAll(saved).catch(function (e) {
      if (e && e.auth) { setToken(null); say("err", "আগের আনলকের মেয়াদ শেষ — কোডটা আবার দাও।"); }
      else say("err", netErr(e));
    });
  }

  if (form) form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var input = form.querySelector("input"), btn = form.querySelector("button");
    var code = input.value.trim();
    if (!code) return;
    btn.disabled = true; say("", "যাচাই হচ্ছে…");
    fetch("/api/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: code }) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (r.status === 429) throw { msg: d.error || "অনেকবার চেষ্টা হয়েছে। এক মিনিট পরে আবার চেষ্টা করো।" };
          if (!r.ok || !d.token) throw { msg: r.status === 401 || r.status === 400 ? "কোডটা সঠিক নয়। আবার দেখে লেখো।" : d.error || "সার্ভারে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করো।" };
          setToken(d.token);
          return openAll(d.token);
        });
      })
      .catch(function (e) { btn.disabled = false; say("err", netErr(e)); input.select(); });
  });
})();
