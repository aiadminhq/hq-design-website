// 退租復原工程 — 前後對照滑桿與場景切換
// 滑鼠／觸控：Pointer Events；鍵盤：每個滑桿內的 <input type="range">。
(function () {
  "use strict";

  document.documentElement.classList.add("rs-js");

  function clamp(n) {
    return Math.min(100, Math.max(0, n));
  }

  function initCompare(el) {
    var range = el.querySelector(".rs-compare-range");
    var dragging = false;

    function setPos(value, fromRange) {
      var pos = Math.round(clamp(value));
      el.style.setProperty("--pos", pos + "%");
      if (range) {
        if (!fromRange) range.value = String(pos);
        range.setAttribute(
          "aria-valuetext",
          "完工時 " + pos + "%，復原後 " + (100 - pos) + "%",
        );
      }
    }

    function posFromEvent(e) {
      var rect = el.getBoundingClientRect();
      if (!rect.width) return 50;
      return ((e.clientX - rect.left) / rect.width) * 100;
    }

    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      try {
        el.setPointerCapture(e.pointerId);
      } catch (err) {
        /* 舊瀏覽器 */
      }
      setPos(posFromEvent(e));
    });
    el.addEventListener("pointermove", function (e) {
      if (dragging) setPos(posFromEvent(e));
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(
      function (type) {
        el.addEventListener(type, function () {
          dragging = false;
        });
      },
    );

    if (range) {
      range.addEventListener("input", function () {
        setPos(Number(range.value), true);
      });
    }

    setPos(range ? Number(range.value) : 50, true);
  }

  var compares = document.querySelectorAll("[data-rs-compare]");
  Array.prototype.forEach.call(compares, initCompare);

  // 場景切換
  var buttons = document.querySelectorAll("[data-rs-scene]");
  var panels = document.querySelectorAll("[data-rs-panel]");
  var caption = document.querySelector("[data-rs-caption]");

  function showScene(id) {
    Array.prototype.forEach.call(panels, function (panel) {
      panel.hidden = panel.getAttribute("data-rs-panel") !== id;
    });
    Array.prototype.forEach.call(buttons, function (btn) {
      var active = btn.getAttribute("data-rs-scene") === id;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      if (active && caption) caption.textContent = btn.textContent.trim();
    });
  }

  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener("click", function () {
      showScene(btn.getAttribute("data-rs-scene"));
    });
  });

  if (buttons.length && panels.length) {
    showScene(buttons[0].getAttribute("data-rs-scene"));
  }

  // 手機選單：讓 hamburger 也能用鍵盤操作（main.js 只綁了 click）
  var hamburger = document.querySelector(".hamburger");
  if (hamburger) {
    hamburger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        hamburger.click();
      }
    });
  }
})();
