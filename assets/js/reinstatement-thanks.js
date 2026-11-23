// 退租復原工程 — 感謝頁：顯示參考編號
(function () {
  'use strict';

  var REF_PATTERN = /^RS-\d{8}-[A-Z0-9]{4}$/;
  var ref = '';

  try {
    ref = new URLSearchParams(window.location.search).get('ref') || '';
  } catch (e) { /* 舊瀏覽器 */ }

  if (!REF_PATTERN.test(ref)) {
    try {
      ref = window.sessionStorage.getItem('rs_ref_id') || '';
    } catch (e) { ref = ''; }
  }

  // 這次需求已經結束，下次進表單要產生新的編號
  try {
    window.sessionStorage.removeItem('rs_ref_id');
    window.sessionStorage.removeItem('rs_step1_draft');
  } catch (e) { /* 略過 */ }

  var box = document.getElementById('rs-refbox');
  var text = document.getElementById('rs-ref');
  if (box && text && REF_PATTERN.test(ref)) {
    text.textContent = ref;
    box.hidden = false;
  }

  var hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    hamburger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hamburger.click();
      }
    });
  }
})();
