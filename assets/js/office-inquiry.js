// Copy utm_* query parameters into hidden fields on the inquiry form.
(function () {
  var form = document.querySelector("form.contact-form[data-inquiry-utm]");
  if (!form || form.getAttribute("data-utm-ready") === "1") return;
  form.setAttribute("data-utm-ready", "1");

  var params = new URLSearchParams(window.location.search);
  var seen = Object.create(null);

  params.forEach(function (value, key) {
    if (!/^utm_[A-Za-z0-9_-]{1,40}$/.test(key) || seen[key]) return;
    seen[key] = true;

    var exists = Array.prototype.some.call(
      form.querySelectorAll('input[type="hidden"]'),
      function (input) { return input.name === key; }
    );
    if (exists) return;

    var input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value).slice(0, 500);
    form.appendChild(input);
  });
})();
