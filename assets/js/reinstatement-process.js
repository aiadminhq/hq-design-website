// 退租復原工程 — 流程區塊（橫向）
// 整頁照常往下捲；捲進這一區時畫面固定，往下捲＝步驟卡片往左滑，
// 下方的拆除動畫跟著播到目前那一步。
// 動畫在 iframe 裡（assets/anatomy/reinstatement/*.html?embed=1），用 postMessage 溝通：
//   頁面 → 動畫：{ type: "rs-anatomy-step", step: 1..5 }
//   動畫 → 頁面：{ type: "rs-anatomy-ready" }（載入完成，請送目前的步驟）
(function () {
  "use strict";

  var root = document.querySelector("[data-rs-process]");
  if (!root) return;
  var pin = root.querySelector(".rs-process-pin");
  var track = root.querySelector(".rs-process-track");
  var list = root.querySelector(".rs-process-list");
  var frame = root.querySelector("[data-rs-anatomy]");
  var steps = Array.prototype.slice.call(
    root.querySelectorAll("[data-rs-step]"),
  );
  if (!pin || !track || !list || !frame || !steps.length) return;

  var origin =
    window.location.origin && window.location.origin !== "null"
      ? window.location.origin
      : "*";
  var current = 0;
  var ticking = false;

  root.style.setProperty("--rs-steps", String(steps.length));
  root.classList.add("is-enhanced");

  // 進度點（純裝飾，螢幕閱讀器略過；步驟本身有 aria-current）
  var dots = document.createElement("ol");
  dots.className = "rs-process-dots";
  dots.setAttribute("aria-hidden", "true");
  steps.forEach(function () {
    dots.appendChild(document.createElement("li"));
  });
  track.insertAdjacentElement("afterend", dots);
  var dotItems = Array.prototype.slice.call(dots.children);

  function send(step) {
    if (!frame.contentWindow) return;
    frame.contentWindow.postMessage(
      { type: "rs-anatomy-step", step: step },
      origin,
    );
  }

  function activate(step) {
    if (step === current) return;
    current = step;
    steps.forEach(function (el, i) {
      var on = i + 1 === step;
      el.classList.toggle("is-active", on);
      if (on) el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
      dotItems[i].classList.toggle("is-active", on);
    });
    send(step);
  }

  var stride = 0;
  var center = 0;

  function measure() {
    // 每張卡片的寬度＋間距，用來把「目前這一步」對齊到左邊
    var first = steps[0];
    var second = steps[1];
    stride = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    // 目前這一步的卡片置中，前後兩張各露出一部分
    center = Math.max(0, (track.clientWidth - first.offsetWidth) / 2);
  }

  // 每一步前後各停 30%（讓動畫播），中間 40% 才滑到下一張
  function dwell(t) {
    if (t <= 0.3) return 0;
    if (t >= 0.7) return 1;
    var x = (t - 0.3) / 0.4;
    return x * x * (3 - 2 * x);
  }

  function update() {
    ticking = false;
    var rect = root.getBoundingClientRect();
    var travel = root.offsetHeight - pin.offsetHeight;
    // 固定區從導覽列下緣開始算（sticky top），不是從螢幕最上面
    var stickyTop = parseFloat(window.getComputedStyle(pin).top) || 0;
    var progress =
      travel > 0
        ? Math.min(1, Math.max(0, (stickyTop - rect.top) / travel))
        : 0;
    var pos = progress * (steps.length - 1);
    var index = Math.floor(pos);
    var shift = index + dwell(pos - index);
    root.style.setProperty(
      "--rs-x",
      (center - shift * stride).toFixed(1) + "px",
    );
    activate(Math.min(steps.length, Math.round(pos) + 1));
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", function () {
    measure();
    requestUpdate();
  });

  window.addEventListener("message", function (e) {
    if (origin !== "*" && e.origin !== origin) return;
    if (e.source !== frame.contentWindow) return;
    if (e.data && e.data.type === "rs-anatomy-ready") send(current || 1);
  });
  frame.addEventListener("load", function () {
    send(current || 1);
  });

  // 鍵盤使用者 Tab 到步驟卡片裡的連結時，把頁面捲到對應的位置
  steps.forEach(function (el, i) {
    el.addEventListener("focusin", function () {
      var travel = root.offsetHeight - pin.offsetHeight;
      var top = root.getBoundingClientRect().top + window.pageYOffset;
      top -= parseFloat(window.getComputedStyle(pin).top) || 0;
      window.scrollTo(0, top + (travel * (i + 0.5)) / steps.length);
    });
  });

  measure();
  activate(1);
  update();
})();
