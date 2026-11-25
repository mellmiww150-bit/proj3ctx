
var $ = function (id) { return document.getElementById(id); };
var last = null;

function say(msg, cls) {
  var e = $("st");
  e.textContent = "";
  e.className = cls === "ok" ? "ok" : cls === "err" ? "err" : "";
  if (cls === "load") {
    var s = document.createElement("span");
    s.className = "spin";
    e.appendChild(s);
    e.appendChild(document.createTextNode(msg));
    return;
  }
  e.textContent = msg;
}

async function run() {
  var v = $("u").value.trim();
  if (!v) { say("ใส่ URL ก่อนครับ", "err"); return; }
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;

  $("go").disabled = true;
  say("กำลังดึงข้อมูล...", "load");

  try {
    var q = "/clone?url=" + encodeURIComponent(v)
      + "&assets="  + ($("a").checked ? 1 : 0)
      + "&inline="  + ($("i").checked ? 1 : 0)
      + "&rewrite=" + ($("r").checked ? 1 : 0)
      + "&strip="   + ($("s").checked ? 1 : 0);

    var r = await fetch(q);
    var d = await r.json();

    if (!d.success) throw new Error(d.error || "ไม่ทราบสาเหตุ");

    last = d;
    $("out").value = d.html;
    $("out-card").classList.add("on");
    $("meta").innerHTML = "<b>✓ สำเร็จ</b> &nbsp;" + Math.round(d.size / 1024)
      + " KB &nbsp;·&nbsp; CSS " + d.stats.css + " &nbsp;·&nbsp; รูป " + d.stats.img
      + " &nbsp;·&nbsp; พลาด " + d.stats.fail;
    say("เสร็จสิ้น", "ok");
  } catch (e) {
    say("ล้มเหลว: " + e.message, "err");
  }

  $("go").disabled = false;
}

$("go").addEventListener("click", run);
$("u").addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });

$("dl").addEventListener("click", function () {
  if (!last) return;
  var b = new Blob([last.html], { type: "text/html;charset=utf-8" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = "index.html";
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
});

$("cp").addEventListener("click", async function () {
  var t = $("out");
  try {
    await navigator.clipboard.writeText(t.value);
  } catch (e) {
    t.select();
    document.execCommand("copy");
  }
  say("คัดลอกโค้ดแล้ว", "ok");
});

$("op").addEventListener("click", function () {
  if (!last) return;
  var w = window.open("", "_blank");
  if (!w) { say("เบราว์เซอร์บล็อก popup", "err"); return; }
  w.document.open();
  w.document.write(last.html);
  w.document.close();
});
