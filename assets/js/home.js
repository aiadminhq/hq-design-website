// HQ Design — 首頁 loader（只負責開場動畫；內容與導覽不依賴本檔）
// 規格：docs/redesign/motion-study.md。
// - head 內聯腳本決定「是否播放」（未開啟減少動態、本 session 首次）並加上 html.hm-loading。
// - 這裡只推進 data-step，並處理 Skip、Esc、inert、焦點與收尾。
(function () {
  var root = document.documentElement;
  var loader = document.getElementById('hm-loader');
  var page = document.getElementById('hm-page');
  if (!loader) return;

  // 沒有要播放：確認狀態乾淨後離開
  if (!root.classList.contains('hm-loading')) {
    loader.parentNode && loader.parentNode.removeChild(loader);
    return;
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var timers = [];
  var finished = false;
  var skip = loader.querySelector('.hm-loader__skip');
  var previousFocus = document.activeElement;

  function later(fn, ms) {
    timers.push(window.setTimeout(fn, ms));
  }
  function setStep(n) {
    loader.setAttribute('data-step', String(n));
  }
  function setPageInert(on) {
    if (!page) return;
    if (on) {
      page.setAttribute('inert', '');
      page.setAttribute('aria-hidden', 'true');
    } else {
      page.removeAttribute('inert');
      page.removeAttribute('aria-hidden');
    }
  }

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(window.clearTimeout);
    document.removeEventListener('keydown', onKey);
    setStep(4); // 淡出（CSS 450ms）
    setPageInert(false);
    root.classList.remove('hm-loading'); // hero 內容開始入場、解除捲動鎖
    try {
      if (previousFocus && previousFocus !== document.body && previousFocus.focus) previousFocus.focus();
      else if (skip) skip.blur();
    } catch (e) {}
    later(function () {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 700);
  }

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Esc') finish();
    // 焦點陷阱：loader 只有一個可操作元素
    if (e.key === 'Tab') {
      e.preventDefault();
      if (skip) skip.focus();
    }
  }

  // 若使用者在播放中途打開「減少動態」
  if (reduce && reduce.addEventListener) {
    reduce.addEventListener('change', function (e) {
      if (e.matches) finish();
    });
  }

  try {
    sessionStorage.setItem('hqLoader', '1');
  } catch (e) {}

  setPageInert(true);
  document.addEventListener('keydown', onKey);
  if (skip) {
    skip.addEventListener('click', finish);
    skip.focus({ preventScroll: true });
  }

  // 時間軸（ms）：0 空白 → 250 縮寫 → 1150 展開成詞 → 2300 視窗開出 → 3300 完成
  setStep(0);
  later(function () { setStep(1); }, 250);
  later(function () { setStep(2); }, 1150);
  later(function () { setStep(3); }, 2300);
  later(finish, 3300);
  // 保險：任何情況 6 秒內一定結束
  later(finish, 6000);
})();
