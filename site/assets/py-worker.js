// Python (Pyodide) আলাদা thread-এ চলে — infinite loop হলেও পাতা আটকে যায় না, "থামাও" দিয়ে বন্ধ করা যায়
var PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.28.3/full/";
importScripts(PYODIDE + "pyodide.js");

var HOME = "/home/pyodide";
var ready = (async function () {
  var py = await loadPyodide({ indexURL: PYODIDE });
  var dec = new TextDecoder();
  py.setStdout({ write: function (b) { postMessage({ type: "out", text: dec.decode(b) }); return b.length; } });
  py.setStderr({ write: function (b) { postMessage({ type: "err", text: dec.decode(b) }); return b.length; } });
  // প্রতিবার চালানোর আগে নতুন __main__ আর আগের run-এর import করা module মুছে ফেলা —
  // যাতে logging.basicConfig, unittest.main() ইত্যাদি আলাদা python main.py-র মতোই আচরণ করে
  py.runPython([
    "import sys, types, os, importlib",
    "os.chdir('" + HOME + "')",
    "if '" + HOME + "' not in sys.path: sys.path.insert(0, '" + HOME + "')",
    "_BASE = set(sys.modules)",
    "def _fresh():",
    "    if 'logging' in sys.modules:",
    "        lg = sys.modules['logging']; lg.shutdown()",
    "        for h in list(lg.root.handlers): lg.root.removeHandler(h)",
    "        lg.root.setLevel(lg.WARNING); lg.Logger.manager.loggerDict.clear()",
    "    for k in list(sys.modules):",
    "        if k not in _BASE: del sys.modules[k]",
    "    importlib.invalidate_caches()",
    "    m = types.ModuleType('__main__'); m.__file__ = '" + HOME + "/main.py'",
    "    sys.modules['__main__'] = m; sys.argv = ['main.py']",
    "    return m.__dict__"
  ].join("\n"));
  return py;
})();
ready.then(function () { postMessage({ type: "ready" }); }, function (e) { postMessage({ type: "fail", text: String(e) }); });

onmessage = async function (ev) {
  var msg = ev.data;
  if (msg.type !== "run") return;
  var py;
  try { py = await ready; } catch (e) { return; }
  // একই অধ্যায়ের অন্য ফাইল (geometry.py, school/student.py, students.txt …) আগে লিখে রাখা
  var files = msg.files || {};
  Object.keys(files).forEach(function (name) {
    var path = HOME + "/" + name, dir = path.slice(0, path.lastIndexOf("/"));
    try { py.FS.mkdirTree(dir); py.FS.writeFile(path, files[name]); } catch (e) {}
  });
  var lines = (msg.stdin || "").split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  py.setStdin({
    stdin: function () {
      if (!lines.length) return null;
      var l = lines.shift();
      postMessage({ type: "in", text: l + "\n" });
      return l;
    }
  });
  try { await py.loadPackagesFromImports(msg.code); } catch (e) {}
  var ns = py.globals.get("_fresh")();
  try {
    py.runPython(msg.code, { globals: ns, filename: "main.py" });
    postMessage({ type: "done", ok: true });
  } catch (e) {
    var t = String(e.message || e);
    // Pyodide-এর ভেতরের traceback লাইনগুলো বাদ দিয়ে শুধু তোমার কোডের অংশ দেখাও
    var i = t.indexOf('File "main.py"');
    if (i > 0) t = "Traceback (most recent call last):\n  " + t.slice(i);
    if (/SystemExit: (0|None|False)?\s*$/.test(t)) postMessage({ type: "done", ok: true });
    else postMessage({ type: "done", ok: false, text: t });
  } finally {
    ns.destroy();
  }
};
