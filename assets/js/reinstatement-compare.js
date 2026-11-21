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
          /^en/i.test(document.documentElement.lang || "")
            ? "Before " + pos + "%, after " + (100 - pos) + "%"
            : "完工時 " + pos + "%，復原後 " + (100 - pos) + "%",
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

  // 並排照片：點擊開「前後對照燈箱」。燈箱內可拖拉滑桿比對 Before／After，
  // 下方用左右按鈕與圓點切換不同區域。沒有 <dialog> 時，連結會直接打開圖片。
  var zoomDialog = document.querySelector("[data-rs-zoom-dialog]");
  var pairs = Array.prototype.map.call(
    document.querySelectorAll(".rs-pair"),
    function (pair) {
      var shots = pair.querySelectorAll(".rs-pair-shot");
      var name = pair.querySelector(".rs-pair-name");
      var num = name && name.querySelector(".rs-pair-num");
      function shot(fig) {
        var img = fig && fig.querySelector("img");
        var label = fig && fig.querySelector(".rs-pair-label");
        return {
          src: img ? img.getAttribute("src") : "",
          alt: img ? img.getAttribute("alt") || "" : "",
          label: label ? label.textContent.trim() : "",
        };
      }
      return {
        el: pair,
        num: num ? num.textContent.trim() : "",
        name: name
          ? name.textContent.replace(num ? num.textContent : "", "").trim()
          : "",
        before: shot(shots[0]),
        after: shot(shots[1]),
      };
    },
  );

  if (zoomDialog && typeof zoomDialog.showModal === "function" && pairs.length) {
    var isEn = /^en/i.test(document.documentElement.lang || "");
    var t = isEn
      ? { close: "Close", prev: "Previous area", next: "Next area", go: "Show", drag: "Drag the handle to compare before and after" }
      : { close: "關閉", prev: "上一個區域", next: "下一個區域", go: "顯示", drag: "拖拉中間的把手比對前後" };
    var current = 0;

    function el(tag, cls, attrs) {
      var node = document.createElement(tag);
      if (cls) node.className = cls;
      if (attrs) for (var k in attrs) node.setAttribute(k, attrs[k]);
      return node;
    }

    // 以 JS 重建燈箱內容（沿用頁面上原本的 <dialog>）
    zoomDialog.classList.add("rs-lb");
    zoomDialog.textContent = "";
    zoomDialog.setAttribute("aria-labelledby", "rs-lb-title");

    var bar = el("div", "rs-lb-bar");
    var title = el("p", "rs-lb-title", { id: "rs-lb-title", "aria-live": "polite" });
    var closeBtn = el("button", "rs-lb-close", { type: "button" });
    closeBtn.textContent = t.close;
    bar.appendChild(title);
    bar.appendChild(closeBtn);

    var stage = el("figure", "rs-compare rs-lb-compare", { "data-rs-compare": "" });
    var imgAfter = el("img", "rs-compare-after", { width: "1600", height: "1067", alt: "" });
    var imgBefore = el("img", "rs-compare-before", { width: "1600", height: "1067", alt: "" });
    var tagBefore = el("span", "rs-compare-tag rs-compare-tag--before", { "aria-hidden": "true" });
    var tagAfter = el("span", "rs-compare-tag rs-compare-tag--after", { "aria-hidden": "true" });
    var range = el("input", "rs-compare-range", { type: "range", min: "0", max: "100", step: "2", value: "50" });
    var handle = el("span", "rs-compare-handle", { "aria-hidden": "true" });
    [imgAfter, imgBefore, tagBefore, tagAfter, range, handle].forEach(function (n) {
      stage.appendChild(n);
    });

    var hint = el("p", "rs-lb-hint");
    hint.textContent = t.drag;

    var nav = el("div", "rs-lb-nav");
    var prevBtn = el("button", "rs-lb-arrow rs-lb-arrow--prev", { type: "button", "aria-label": t.prev });
    var nextBtn = el("button", "rs-lb-arrow rs-lb-arrow--next", { type: "button", "aria-label": t.next });
    prevBtn.innerHTML = '<span aria-hidden="true">&#8249;</span>';
    nextBtn.innerHTML = '<span aria-hidden="true">&#8250;</span>';
    var dots = el("div", "rs-lb-dots", { role: "group", "aria-label": isEn ? "Areas" : "區域" });
    var dotBtns = pairs.map(function (p, i) {
      var d = el("button", "rs-lb-dot", { type: "button", "aria-label": t.go + " " + p.num + " " + p.name });
      d.addEventListener("click", function () {
        show(i);
      });
      dots.appendChild(d);
      return d;
    });
    nav.appendChild(prevBtn);
    nav.appendChild(dots);
    nav.appendChild(nextBtn);
    if (pairs.length < 2) nav.hidden = true;

    zoomDialog.appendChild(bar);
    zoomDialog.appendChild(stage);
    zoomDialog.appendChild(hint);
    zoomDialog.appendChild(nav);
    initCompare(stage);

    function preload(i) {
      var p = pairs[(i + pairs.length) % pairs.length];
      [p.before.src, p.after.src].forEach(function (src) {
        if (src) new Image().src = src;
      });
    }

    function setRange(value) {
      range.value = String(value);
      range.dispatchEvent(new Event("input"));
    }

    function show(i) {
      current = (i + pairs.length) % pairs.length;
      var p = pairs[current];
      imgBefore.src = p.before.src;
      imgBefore.alt = p.before.alt;
      imgAfter.src = p.after.src;
      imgAfter.alt = p.after.alt;
      tagBefore.textContent = p.before.label;
      tagAfter.textContent = p.after.label;
      title.textContent =
        p.num + " / " + String(pairs.length).padStart(2, "0") + "　" + p.name;
      range.setAttribute(
        "aria-label",
        p.name + (isEn ? ", before and after" : "，前後對照"),
      );
      setRange(50);
      dotBtns.forEach(function (d, j) {
        if (j === current) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      preload(current + 1);
      preload(current - 1);
    }

    prevBtn.addEventListener("click", function () {
      show(current - 1);
    });
    nextBtn.addEventListener("click", function () {
      show(current + 1);
    });
    closeBtn.addEventListener("click", function () {
      zoomDialog.close();
    });
    // 左右方向鍵切換區域；焦點在滑桿上時，方向鍵留給滑桿。
    zoomDialog.addEventListener("keydown", function (e) {
      if (e.target === range || pairs.length < 2) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        show(current - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        show(current + 1);
      }
    });

    Array.prototype.forEach.call(
      document.querySelectorAll("[data-rs-zoom]"),
      function (link) {
        link.addEventListener("click", function (e) {
          var index = -1;
          pairs.forEach(function (p, i) {
            if (p.el.contains(link)) index = i;
          });
          if (index < 0) return;
          e.preventDefault();
          show(index);
          try {
            if (!zoomDialog.open) zoomDialog.showModal();
            closeBtn.focus();
          } catch (err) {
            window.location.href = link.href;
          }
        });
      },
    );
    // 點背景關閉：按下與放開都要在背景上，避免在圖片上拖拉後放開就誤關。
    var pressedOnBackdrop = false;
    zoomDialog.addEventListener("pointerdown", function (e) {
      pressedOnBackdrop = e.target === zoomDialog;
    });
    zoomDialog.addEventListener("click", function (e) {
      if (e.target === zoomDialog && pressedOnBackdrop) zoomDialog.close();
      pressedOnBackdrop = false;
    });
    // 開啟時鎖住背景捲動；Esc、關閉鈕、點背景都會觸發 close。
    var root = document.documentElement;
    new MutationObserver(function () {
      root.style.overflow = zoomDialog.open ? "hidden" : "";
    }).observe(zoomDialog, { attributes: true, attributeFilter: ["open"] });
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
