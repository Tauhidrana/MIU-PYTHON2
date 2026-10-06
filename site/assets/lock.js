// ===== অনুশীলনী ও বোর্ড প্রশ্নের লক — PDF-এর সাথে পাওয়া আনলক কোড দিয়ে খোলে =====
// লক করা অংশ পাতায় encrypt করা থাকে (tools/build_site.py); কোড থেকে key বানিয়ে এখানে decrypt হয়।
// একবার খুললে key এই browser-এ মনে থাকে, তাই বাকি অধ্যায়গুলোও আপনা-আপনি খুলে যায়।
(function () {
  var SALT = "miu-python-book/unlock/v1", ITER = 200000;   // build_site.py-এর LOCK_SALT, LOCK_ITER
  var boxes = document.querySelectorAll(".locked");
  if (!boxes.length) return;
  var subtle = window.crypto && crypto.subtle;
  var form = document.querySelector(".lock-form"), status = document.querySelector(".lock-status");

  function bytes(b64) { var s = atob(b64), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  function toHex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); }
  function fromHex(h) { var a = new Uint8Array(h.length / 2); for (var i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16); return a; }
  function derive(code) {
    var enc = new TextEncoder();
    return subtle.importKey("raw", enc.encode(code), "PBKDF2", false, ["deriveBits"]).then(function (k) {
      return subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(SALT), iterations: ITER, hash: "SHA-256" }, k, 256);
    });
  }
  // সব লক করা অংশ খোলে; ভুল key হলে reject করে
  function openAll(raw) {
    return subtle.importKey("raw", raw, { name: "AES-CBC" }, false, ["decrypt"]).then(function (key) {
      return Promise.all(Array.prototype.map.call(boxes, function (b) {
        return subtle.decrypt({ name: "AES-CBC", iv: bytes(b.dataset.iv) }, key, bytes(b.dataset.enc)).then(function (buf) {
          var t = new TextDecoder().decode(buf);
          if (t.slice(0, 4) !== "MIU1") throw new Error("bad key");
          return t.slice(4);
        });
      }));
    }).then(function (htmls) {
      boxes.forEach(function (b, i) {
        var d = document.createElement("div");
        d.className = "unlocked"; d.innerHTML = htmls[i];
        b.replaceWith(d);
        if (window.MIU_scanCode) window.MIU_scanCode(d);
      });
    });
  }
  function say(cls, msg) { if (status) { status.className = "lock-status " + cls; status.textContent = msg; } }

  if (!subtle) { say("err", "এই browser-এ লক খোলা যাচ্ছে না — Chrome বা অন্য নতুন browser-এ খোলো।"); return; }

  var saved = null;
  try { saved = localStorage.getItem("unlock-key"); } catch (e) {}
  if (saved) openAll(fromHex(saved)).catch(function () { try { localStorage.removeItem("unlock-key"); } catch (e) {} });

  if (form) form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var input = form.querySelector("input"), btn = form.querySelector("button");
    var code = input.value.trim().replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); });
    if (!code) return;
    btn.disabled = true; say("", "যাচাই হচ্ছে…");
    var raw;
    derive(code).then(function (r) { raw = r; return openAll(r); })
      .then(function () { try { localStorage.setItem("unlock-key", toHex(raw)); } catch (e) {} })
      .catch(function () { btn.disabled = false; say("err", "কোডটা সঠিক নয়। আবার দেখে লেখো।"); input.select(); });
  });
})();
