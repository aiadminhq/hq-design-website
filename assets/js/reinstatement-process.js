// 退租復原工程 — 流程區塊：捲到哪一步，左邊的拆除動畫就播到哪一步
// 動畫在 iframe 裡（assets/anatomy/reinstatement/*.html?embed=1），用 postMessage 溝通：
//   頁面 → 動畫：{ type: "rs-anatomy-step", step: 1..5 }
//   動畫 → 頁面：{ type: "rs-anatomy-ready" }（載入完成，請送目前的步驟）
(function () {
  "use strict";

  var root = document.querySelector("[data-rs-process]");
  if (!root) return;
  var frame = root.querySelector("[data-rs-anatomy]");
  var steps = Array.prototype.slice.call(
    root.querySelectorAll("[data-rs-step]"),
  );
  if (!frame || !steps.length) return;

  root.classList.add("is-enhanced");
  var origin =
    window.location.origin && window.location.origin !== "null"
      ? window.location.origin
      : "*";
  var current = 0;

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
    steps.forEach(function (el) {
      var on = Number(el.getAttribute("data-rs-step")) === step;
      el.classList.toggle("is-active", on);
      if (on) el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
    });
    send(step);
  }

  window.addEventListener("message", function (e) {
    if (origin !== "*" && e.origin !== origin) return;
    if (e.source !== frame.contentWindow) return;
    if (e.data && e.data.type === "rs-anatomy-ready") send(current || 1);
  });
  frame.addEventListener("load", function () {
    send(current || 1);
  });

  // 步驟進入畫面中間那一條帶狀區域時，視為目前步驟
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting)
            activate(Number(entry.target.getAttribute("data-rs-step")));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    steps.forEach(function (el) {
      io.observe(el);
    });
  }

  activate(1);
})();
