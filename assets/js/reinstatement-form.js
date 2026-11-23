// 退租復原工程 — 兩步需求表單
// 第 1 步（聯絡方式）與第 2 步（需求資料）各送一次 Formspree，用同一個 ref_id 串接。
// 沒有 JavaScript 時，第 1 步會以一般表單送出（見 HTML）。
(function () {
  "use strict";

  var step1 = document.getElementById("rs-step1");
  var step2 = document.getElementById("rs-step2");
  if (!step1 || !step2) return;

  var THANKS_URL = "reinstatement-thanks.html";
  var REF_KEY = "rs_ref_id";
  var REF_PATTERN = /^RS-\d{8}-[A-Z0-9]{4}$/;
  var MAX_SITES = 5;
  var ERROR_HELP =
    '送出沒有成功，可能是網路不穩。請再試一次，或直接打 <a href="tel:0225573003">02-2557-3003</a>、' +
    '寫信到 <a href="mailto:info@hqdesign.tw">info@hqdesign.tw</a>。';

  // 改由下面的程式驗證，才能顯示中文訊息與「電話或 Email 擇一」
  step1.noValidate = true;
  step2.noValidate = true;

  /* ---------- 小工具 ---------- */
  function $(id) {
    return document.getElementById(id);
  }
  function all(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }
  function trim(value) {
    return String(value == null ? "" : value).trim();
  }

  function storageGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  function storageSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (e) {
      /* 無痕模式等情況，略過 */
    }
  }

  function todayString() {
    var d = new Date();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    return (
      d.getFullYear() +
      "-" +
      (m.length < 2 ? "0" + m : m) +
      "-" +
      (day.length < 2 ? "0" + day : day)
    );
  }

  /* ---------- 參考編號 ---------- */
  function makeRefId() {
    var alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // 去掉 0、1、I、O
    var code = "";
    var values = new Uint32Array(4);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(values);
    } else {
      for (var i = 0; i < 4; i++)
        values[i] = Math.floor(Math.random() * 4294967296);
    }
    for (var j = 0; j < 4; j++)
      code += alphabet.charAt(values[j] % alphabet.length);
    return "RS-" + todayString().replace(/-/g, "") + "-" + code;
  }

  var refId = storageGet(REF_KEY);
  if (!refId || !REF_PATTERN.test(refId)) {
    refId = makeRefId();
    storageSet(REF_KEY, refId);
  }
  all(document, "[data-rs-ref-field]").forEach(function (input) {
    input.value = refId;
  });
  all(document, "[data-rs-ref-text]").forEach(function (el) {
    el.textContent = refId;
  });

  /* ---------- 送出 ---------- */
  // 只送有填的欄位，通知信比較好讀
  function send(form, fields) {
    var data = new FormData();
    Object.keys(fields).forEach(function (key) {
      var value = trim(fields[key]);
      if (value) data.append(key, value);
    });
    return fetch(form.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    }).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response;
    });
  }

  function setBusy(button, busy, busyText) {
    if (!button.dataset.label) button.dataset.label = button.textContent;
    button.disabled = busy;
    button.textContent = busy ? busyText : button.dataset.label;
  }

  /* ---------- 第 1 步 ---------- */
  var nameInput = $("rs-name");
  var companyInput = $("rs-company");
  var phoneInput = $("rs-phone");
  var emailInput = $("rs-email");
  var consentInput = $("rs-consent");
  var step1Status = $("rs-step1-status");
  var step1Submit = $("rs-step1-submit");
  var contact = {};

  function setError(input, errorEl, message) {
    errorEl.textContent = message || "";
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function validateStep1() {
    var firstInvalid = null;
    function check(input, errorEl, message) {
      setError(input, errorEl, message);
      if (message && !firstInvalid) firstInvalid = input;
    }

    check(
      nameInput,
      $("rs-name-err"),
      trim(nameInput.value) ? "" : "請填聯絡人姓名。",
    );
    check(
      companyInput,
      $("rs-company-err"),
      trim(companyInput.value) ? "" : "請填公司名稱。",
    );

    var phone = trim(phoneInput.value);
    var email = trim(emailInput.value);
    var contactErr = $("rs-contact-err");
    var contactMessage = "";
    var contactField = phoneInput;
    phoneInput.removeAttribute("aria-invalid");
    emailInput.removeAttribute("aria-invalid");

    if (!phone && !email) {
      contactMessage = "電話或 Email 請至少填一個，我們才聯絡得到你。";
    } else if (phone && phone.replace(/\D/g, "").length < 7) {
      contactMessage = "電話號碼好像少了幾碼，請再確認一次。";
    } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      contactMessage = "Email 格式好像不對，請再確認一次。";
      contactField = emailInput;
    }
    contactErr.textContent = contactMessage;
    if (contactMessage) {
      contactField.setAttribute("aria-invalid", "true");
      if (!firstInvalid) firstInvalid = contactField;
    }

    check(
      consentInput,
      $("rs-consent-err"),
      consentInput.checked ? "" : "請勾選同意，我們才能用這些資料聯絡你。",
    );

    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function showStep2() {
    step1.hidden = true;
    step2.hidden = false;
    var p1 = $("rs-progress-1");
    var p2 = $("rs-progress-2");
    if (p1) {
      p1.removeAttribute("aria-current");
      p1.classList.add("is-done");
    }
    if (p2) p2.setAttribute("aria-current", "step");
    var title = $("rs-step2-title");
    if (title) title.focus();
    var top = step2.getBoundingClientRect().top + window.pageYOffset - 140;
    window.scrollTo(0, Math.max(0, top));
  }

  step1.addEventListener("submit", function (event) {
    event.preventDefault();
    step1Status.textContent = "";
    if (!validateStep1()) return;
    if (trim($("rs-gotcha-1").value)) return; // 機器人填了隱藏欄位

    contact = {
      name: trim(nameInput.value),
      company: trim(companyInput.value),
      phone: trim(phoneInput.value),
      email: trim(emailInput.value),
    };

    setBusy(step1Submit, true, "送出中…");
    send(step1, {
      _subject: "【HQ 退租復原｜新聯絡】" + contact.company + "｜" + refId,
      _language: "zh",
      ref_id: refId,
      form_step: "1 聯絡方式",
      name: contact.name,
      company: contact.company,
      phone: contact.phone,
      email: contact.email,
      privacy_consent: "同意",
    })
      .then(function () {
        setBusy(step1Submit, false);
        showStep2();
      })
      .catch(function () {
        setBusy(step1Submit, false);
        step1Status.innerHTML = ERROR_HELP;
      });
  });

  /* ---------- 第 2 步：你是誰 → 條件欄位 ---------- */
  function currentRole() {
    var checked = step2.querySelector('input[name="role"]:checked');
    return checked ? checked.getAttribute("data-rs-role") : "";
  }

  function applyRole() {
    var role = currentRole();
    all(step2, "[data-rs-show-for]").forEach(function (block) {
      var show = block.getAttribute("data-rs-show-for") === role;
      block.hidden = !show;
      all(block, "input, textarea, select").forEach(function (input) {
        input.disabled = !show;
      });
    });
    all(step2, "[data-rs-lease-label]").forEach(function (label) {
      label.textContent = role === "landlord" ? "租客搬離日" : "租約到期日";
    });
  }
  all(step2, 'input[name="role"]').forEach(function (radio) {
    radio.addEventListener("change", applyRole);
  });
  applyRole();

  /* ---------- 第 2 步：日期已過的提醒（不擋送出） ---------- */
  step2.addEventListener("change", function (event) {
    var input = event.target;
    if (!input.matches || !input.matches("[data-rs-date]")) return;
    var warn = input.parentNode.querySelector("[data-rs-date-warn]");
    if (warn) warn.hidden = !(input.value && input.value < todayString());
  });

  /* ---------- 第 2 步：拆除項目總開關 ---------- */
  var demoAll = $("rs-demo-all");
  var demoList = $("rs-demo-list");
  function applyDemoAll() {
    all(demoList, 'input[type="radio"]').forEach(function (radio) {
      radio.disabled = demoAll.checked;
    });
  }
  demoAll.addEventListener("change", applyDemoAll);
  applyDemoAll();

  /* ---------- 第 2 步：多據點 ---------- */
  var sitesWrap = $("rs-sites");
  var addSiteBtn = $("rs-add-site");
  var siteTemplate = $("rs-site-template");

  function renumberSites() {
    var sites = all(sitesWrap, "[data-rs-site]");
    sites.forEach(function (site, index) {
      var n = index + 2; // 第一個地點是上面的主要欄位
      site.querySelector("[data-rs-site-title]").textContent = "地點 " + n;
      site
        .querySelector("[data-rs-site-remove]")
        .setAttribute("aria-label", "移除地點 " + n);
      all(site, "[data-rs-field]").forEach(function (input) {
        var key = input.getAttribute("data-rs-field");
        var id = "rs-site-" + n + "-" + key;
        input.name = "site_" + n + "_" + key;
        input.id = id;
        var label = site.querySelector('[data-rs-for="' + key + '"]');
        if (label) label.setAttribute("for", id);
      });
    });
    addSiteBtn.hidden = sites.length >= MAX_SITES - 1;
  }

  addSiteBtn.addEventListener("click", function () {
    if (!siteTemplate || !siteTemplate.content) return;
    var node = siteTemplate.content.firstElementChild.cloneNode(true);
    sitesWrap.appendChild(node);
    renumberSites();
    applyRole();
    var first = node.querySelector("[data-rs-field]");
    if (first) first.focus();
  });

  sitesWrap.addEventListener("click", function (event) {
    var button = event.target.closest
      ? event.target.closest("[data-rs-site-remove]")
      : null;
    if (!button) return;
    var site = button.closest("[data-rs-site]");
    if (site) site.parentNode.removeChild(site);
    renumberSites();
    addSiteBtn.focus();
  });

  /* ---------- 第 2 步：送出／跳過 ---------- */
  var step2Status = $("rs-step2-status");
  var step2Submit = $("rs-step2-submit");
  var step2Skip = $("rs-step2-skip");

  function goThanks() {
    window.location.href = THANKS_URL + "?ref=" + encodeURIComponent(refId);
  }

  // 收集使用者有填的欄位；複選題合併成一個欄位
  function collectStep2() {
    var answers = {};
    all(step2, "input, textarea, select").forEach(function (input) {
      if (!input.name || input.disabled || input.type === "hidden") return;
      if (input.name.charAt(0) === "_") return;
      if (
        (input.type === "radio" || input.type === "checkbox") &&
        !input.checked
      )
        return;
      var value = trim(input.value);
      if (!value) return;
      answers[input.name] = answers[input.name]
        ? answers[input.name] + "、" + value
        : value;
    });
    return answers;
  }

  step2.addEventListener("submit", function (event) {
    event.preventDefault();
    step2Status.textContent = "";
    if (trim($("rs-gotcha-2").value)) return;

    var answers = collectStep2();
    if (!Object.keys(answers).length) {
      goThanks();
      return;
    } // 什麼都沒填，等同跳過

    var subject =
      "【HQ 退租復原｜補充資料】" +
      (contact.company || "未填公司") +
      "｜" +
      (answers.site_address || "地址未填") +
      "｜到期 " +
      (answers.lease_end || (answers.lease_end_unsure ? "還不確定" : "未填")) +
      "｜" +
      refId;

    var fields = {
      _subject: subject,
      _language: "zh",
      ref_id: refId,
      form_step: "2 補充需求",
      company: contact.company,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
    };
    Object.keys(answers).forEach(function (key) {
      fields[key] = answers[key];
    });

    setBusy(step2Submit, true, "送出中…");
    step2Skip.disabled = true;
    send(step2, fields)
      .then(goThanks)
      .catch(function () {
        setBusy(step2Submit, false);
        step2Skip.disabled = false;
        step2Status.innerHTML =
          ERROR_HELP + "你的聯絡方式我們已經收到了，也可以按「先跳過」。";
      });
  });

  step2Skip.addEventListener("click", goThanks);

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
