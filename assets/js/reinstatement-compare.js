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

  // 前後對照：彈性手風琴相簿（取代並排照片的呈現）＋燈箱。
  // 相簿：滑過／聚焦／點一下展開該區域；再點一次（或按「播放」）開燈箱。
  // 燈箱：「縮時影片」與「前後對照」兩種模式可切換；下方左右鍵與圓點切換區域。
  // 沒有 JS 或沒有 <dialog> 時，原本的並排照片與圖片連結照常可用。

  // 縮時影片清單：key 為照片檔名前綴（例：secom7f-01）。影片做好後在這裡加一行即可。
  // 例："secom7f-01": "assets/video/reinstatement/secom7f-01"（會自動找 .webm 與 .mp4）
  var RS_VIDEOS = {};

  var assetBase = /\/zh\//.test(location.pathname) ? "../" : "";
  var zoomDialog = document.querySelector("[data-rs-zoom-dialog]");
  var pairList = document.querySelector(".rs-pair-list");
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      var before = shot(shots[0]);
      var key = (before.src.split("/").pop() || "").replace(/-(before|after)\.\w+$/, "");
      var video = RS_VIDEOS[key] ? assetBase + RS_VIDEOS[key] : "";
      return {
        el: pair,
        num: num ? num.textContent.trim() : "",
        name: name
          ? name.textContent.replace(num ? num.textContent : "", "").trim()
          : "",
        before: before,
        after: shot(shots[1]),
        video: video,
      };
    },
  );

  if (zoomDialog && typeof zoomDialog.showModal === "function" && pairs.length) {
    var isEn = /^en/i.test(document.documentElement.lang || "");
    var t = isEn
      ? {
          close: "Close", prev: "Previous area", next: "Next area", go: "Show",
          drag: "Drag the handle to compare before and after",
          video: "Time-lapse", compare: "Before / After", mode: "View",
          soon: "Time-lapse coming soon", play: "Play time-lapse",
          open: "Compare before and after", areas: "Areas",
          note: "Illustrative time-lapse based on the real before and after photos.",
        }
      : {
          close: "關閉", prev: "上一個區域", next: "下一個區域", go: "顯示",
          drag: "拖拉中間的把手比對前後",
          video: "縮時影片", compare: "前後對照", mode: "檢視方式",
          soon: "縮時影片製作中", play: "播放縮時影片",
          open: "比對前後", areas: "區域",
          note: "示意動畫：依實際完工與復原照片製作。",
        };
    var current = 0;
    var mode = "compare";

    function el(tag, cls, attrs) {
      var node = document.createElement(tag);
      if (cls) node.className = cls;
      if (attrs) for (var k in attrs) node.setAttribute(k, attrs[k]);
      return node;
    }

    // ---------- 燈箱（沿用頁面上原本的 <dialog>，內容由 JS 重建） ----------
    zoomDialog.classList.add("rs-lb");
    zoomDialog.textContent = "";
    zoomDialog.setAttribute("aria-labelledby", "rs-lb-title");

    var bar = el("div", "rs-lb-bar");
    var title = el("p", "rs-lb-title", { id: "rs-lb-title", "aria-live": "polite" });
    var modes = el("div", "rs-lb-modes", { role: "group", "aria-label": t.mode });
    var videoTab = el("button", "rs-lb-mode", { type: "button", "data-mode": "video" });
    var compareTab = el("button", "rs-lb-mode", { type: "button", "data-mode": "compare" });
    videoTab.innerHTML = '<span aria-hidden="true">&#9654;</span> ' + t.video;
    compareTab.innerHTML = '<span aria-hidden="true">&#8249;&#8250;</span> ' + t.compare;
    modes.appendChild(videoTab);
    modes.appendChild(compareTab);
    var closeBtn = el("button", "rs-lb-close", { type: "button" });
    closeBtn.textContent = t.close;
    bar.appendChild(title);
    bar.appendChild(modes);
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

    var videoWrap = el("div", "rs-lb-video");
    var video = el("video", "", {
      muted: "", playsinline: "", loop: "", controls: "", preload: "none",
      width: "1600", height: "1067",
    });
    video.muted = true;
    videoWrap.appendChild(video);

    var hint = el("p", "rs-lb-hint");

    var nav = el("div", "rs-lb-nav");
    var prevBtn = el("button", "rs-lb-arrow rs-lb-arrow--prev", { type: "button", "aria-label": t.prev });
    var nextBtn = el("button", "rs-lb-arrow rs-lb-arrow--next", { type: "button", "aria-label": t.next });
    prevBtn.innerHTML = '<span aria-hidden="true">&#8249;</span>';
    nextBtn.innerHTML = '<span aria-hidden="true">&#8250;</span>';
    var dots = el("div", "rs-lb-dots", { role: "group", "aria-label": t.areas });
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
    zoomDialog.appendChild(videoWrap);
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

    function loadVideo(p) {
      video.pause();
      video.textContent = "";
      video.removeAttribute("src");
      if (!p.video) return;
      video.setAttribute("poster", p.before.src);
      [["webm", "video/webm"], ["mp4", "video/mp4"]].forEach(function (f) {
        video.appendChild(el("source", "", { src: p.video + "." + f[0], type: f[1] }));
      });
      video.setAttribute("aria-label", p.name + " · " + t.video);
      video.load();
    }

    function setMode(next) {
      var p = pairs[current];
      if (next === "video" && !p.video) next = "compare";
      mode = next;
      var isVideo = mode === "video";
      stage.hidden = isVideo;
      videoWrap.hidden = !isVideo;
      videoTab.setAttribute("aria-pressed", isVideo ? "true" : "false");
      compareTab.setAttribute("aria-pressed", isVideo ? "false" : "true");
      videoTab.disabled = !p.video;
      videoTab.title = p.video ? "" : t.soon;
      hint.textContent = isVideo ? t.note : p.video ? t.drag : t.drag + "（" + t.soon + "）";
      if (isEn && !isVideo && !p.video) hint.textContent = t.drag + " (" + t.soon + ")";
      if (isVideo) {
        if (!reduceMotion) {
          var playing = video.play();
          if (playing && playing.catch) playing.catch(function () {});
        }
      } else {
        video.pause();
      }
    }

    function show(i, wantMode) {
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
      range.setAttribute("aria-label", p.name + (isEn ? ", before and after" : "，前後對照"));
      setRange(50);
      loadVideo(p);
      dotBtns.forEach(function (d, j) {
        if (j === current) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      setMode(wantMode || (p.video ? "video" : "compare"));
      setActive(current);
      preload(current + 1);
      preload(current - 1);
    }

    function openAt(i, wantMode) {
      show(i, wantMode);
      try {
        if (!zoomDialog.open) zoomDialog.showModal();
        closeBtn.focus();
        if (mode === "video" && !reduceMotion) {
          var playing = video.play();
          if (playing && playing.catch) playing.catch(function () {});
        }
        return true;
      } catch (err) {
        return false;
      }
    }

    videoTab.addEventListener("click", function () {
      setMode("video");
    });
    compareTab.addEventListener("click", function () {
      setMode("compare");
    });
    prevBtn.addEventListener("click", function () {
      show(current - 1, mode);
    });
    nextBtn.addEventListener("click", function () {
      show(current + 1, mode);
    });
    closeBtn.addEventListener("click", function () {
      zoomDialog.close();
    });
    zoomDialog.addEventListener("close", function () {
      video.pause();
      if (cards[current]) cards[current].focus();
    });
    // 左右方向鍵切換區域；焦點在滑桿或影片上時，方向鍵留給它們。
    zoomDialog.addEventListener("keydown", function (e) {
      if (e.target === range || e.target === video || pairs.length < 2) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        show(current - 1, mode);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        show(current + 1, mode);
      }
    });

    // 原本的並排照片連結（相簿建不起來時仍可用）
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
          if (!openAt(index, "compare")) window.location.href = link.href;
        });
      },
    );

    // ---------- 彈性手風琴相簿 ----------
    var cards = [];
    function setActive(i) {
      cards.forEach(function (c, j) {
        var on = j === i;
        c.classList.toggle("is-active", on);
        if (c.parentNode) c.parentNode.classList.toggle("is-active", on);
        c.setAttribute("aria-expanded", on ? "true" : "false");
      });
    }

    if (pairList) {
      var gallery = el("div", "rs-eg", { role: "list" });
      cards = pairs.map(function (p, i) {
        var item = el("div", "rs-eg-item", { role: "listitem" });
        var card = el("button", "rs-eg-card", {
          type: "button",
          "aria-expanded": "false",
          "aria-label": p.num + " " + p.name + " · " + (p.video ? t.play : t.open),
        });
        var media = el("span", "rs-eg-media", { "aria-hidden": "true" });
        var imgB = el("img", "rs-eg-img rs-eg-img--before", {
          src: p.before.src, alt: "", width: "1600", height: "1067", loading: "lazy", decoding: "async",
        });
        var imgA = el("img", "rs-eg-img rs-eg-img--after", {
          src: p.after.src, alt: "", width: "1600", height: "1067", loading: "lazy", decoding: "async",
        });
        media.appendChild(imgB);
        media.appendChild(imgA);
        var shade = el("span", "rs-eg-shade", { "aria-hidden": "true" });
        var body = el("span", "rs-eg-body", { "aria-hidden": "true" });
        var tags = el("span", "rs-eg-tags");
        var tagNum = el("span", "rs-eg-tag");
        tagNum.textContent = p.num;
        var tagState = el("span", "rs-eg-tag rs-eg-tag--state");
        tagState.textContent = p.before.label + " → " + p.after.label;
        tags.appendChild(tagNum);
        tags.appendChild(tagState);
        var name = el("span", "rs-eg-name");
        name.textContent = p.name;
        var cta = el("span", "rs-eg-cta");
        cta.innerHTML = p.video
          ? '<span class="rs-eg-play">&#9654;</span>' + t.play
          : '<span class="rs-eg-play">&#8249;&#8250;</span>' + t.open;
        body.appendChild(tags);
        body.appendChild(name);
        body.appendChild(cta);
        var label = el("span", "rs-eg-label", { "aria-hidden": "true" });
        label.textContent = p.name;
        var numLabel = el("span", "rs-eg-num", { "aria-hidden": "true" });
        numLabel.textContent = p.num;
        card.appendChild(media);
        card.appendChild(shade);
        card.appendChild(body);
        card.appendChild(label);
        card.appendChild(numLabel);

        // 滑鼠滑過或鍵盤聚焦就展開；點一下：未展開→展開，已展開→開燈箱。
        card.addEventListener("mouseenter", function () {
          setActive(i);
        });
        card.addEventListener("focus", function () {
          setActive(i);
        });
        card.addEventListener("click", function (e) {
          var wasActive = card.classList.contains("is-active") && !card._justFocused;
          card._justFocused = false;
          setActive(i);
          if (wasActive || e.detail === 0) openAt(i);
        });
        card.addEventListener("pointerdown", function (e) {
          // 觸控：第一次點只展開，第二次才開燈箱
          card._justFocused =
            e.pointerType !== "mouse" && !card.classList.contains("is-active");
        });

        item.appendChild(card);
        gallery.appendChild(item);
        return card;
      });
      pairList.parentNode.insertBefore(gallery, pairList);
      pairList.hidden = true;
      pairList.classList.add("rs-pair-list--replaced");
      setActive(0);
    }

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
      if (!zoomDialog.open) video.pause();
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
