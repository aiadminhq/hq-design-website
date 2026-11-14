// HQ Design — Main JS

// Nav scroll effect
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile nav toggle
const hamburger = document.querySelector('.hamburger');
hamburger?.addEventListener('click', () => {
  nav?.classList.toggle('nav-mobile-open');
});

// Set active nav link
const navLinks = document.querySelectorAll('.nav-links a');
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
navLinks.forEach(link => {
  if (link.getAttribute('href') === currentPage) link.classList.add('active');
});

// Project filter (projects page) — default: corporate office (not "all")
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card[data-type]');
function applyProjectFilter(filter) {
  const grid = document.querySelector('.projects-grid');
  if (grid) grid.classList.remove('view-all');
  projectCards.forEach(card => {
    const show = card.dataset.type === filter;
    card.style.display = show ? '' : 'none';
  });
}
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyProjectFilter(btn.dataset.filter);
  });
});
// Initial state: corporate office
(function initProjectFilter() {
  if (!filterBtns.length || !projectCards.length) return;
  const officeBtn = document.querySelector('.filter-btn[data-filter="office"]');
  filterBtns.forEach(b => b.classList.remove('active'));
  if (officeBtn) officeBtn.classList.add('active');
  applyProjectFilter('office');
})();


// Careers: apply button pre-selects position in form
document.querySelectorAll('.apply-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const pos = this.dataset.position;
    if (pos) {
      const sel = document.querySelector('#apply-form select[name="position"]');
      if (sel) sel.value = pos;
    }
  });
});

// Intersection Observer for fade-in animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.why-card, .project-card, .service-card, .career-card')
  .forEach(el => observer.observe(el));

// Contact forms: AJAX submit to Formspree (stay on page + thank-you)
(function initContactFormAjax() {
  const COPY = {
    en: {
      sending: 'Sending…',
      done: 'Sent',
      success: "Thanks — we received your message. We'll reply soon.",
      error: 'Something went wrong. Please try again, or email info@hqdesign.tw.',
      submit: 'Submit Request →',
    },
    zh: {
      sending: '傳送中…',
      done: '已送出',
      success: '已收到您的訊息，我們會盡快回覆。',
      error: '送出失敗，請再試一次，或改寄信至 info@hqdesign.tw。',
      submit: '送出需求 →',
    },
  };

  function localeFor(form) {
    const raw = (form.dataset.locale || document.documentElement.lang || 'en').toLowerCase();
    return raw.startsWith('zh') ? 'zh' : 'en';
  }

  function trackFormSubmit(form) {
    if (typeof gtag !== 'function') return;
    const submitBtn = form.querySelector('.contact-form-submit');
    gtag('event', 'form_submit', {
      form_id: form.id || 'contact',
      form_name: 'contact',
      form_destination: form.getAttribute('action') || '',
      form_submit_text: (submitBtn && submitBtn.textContent.trim()) || '',
    });
  }

  document.querySelectorAll('form.contact-form[data-contact-ajax]').forEach((form) => {
    const fields = form.querySelector('.contact-form-fields');
    const status = form.querySelector('.contact-form-status');
    const submitBtn = form.querySelector('.contact-form-submit');
    if (!fields || !status || !submitBtn) return;

    const copy = COPY[localeFor(form)];
    const defaultLabel = submitBtn.textContent.trim() || copy.submit;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (submitBtn.disabled) return;

      status.hidden = true;
      status.className = 'contact-form-status';
      status.textContent = '';

      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.textContent = copy.sending;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          trackFormSubmit(form);
          form.classList.add('is-sent');
          fields.hidden = true;
          // Keep button disabled; clear busy/"Sending…" so UI is clean if fields ever reappear
          submitBtn.removeAttribute('aria-busy');
          submitBtn.textContent = copy.done;
          status.hidden = false;
          status.className = 'contact-form-status is-success';
          status.innerHTML = `<p class="contact-form-thankyou">${copy.success}</p>`;
          status.setAttribute('tabindex', '-1');
          // Skip reset: fields are hidden; resetting emptied inputs looked like a failed send
          status.focus();
          return;
        }

        let message = copy.error;
        try {
          const data = await response.json();
          if (data && Array.isArray(data.errors) && data.errors.length) {
            message = data.errors.map((e) => e.message).filter(Boolean).join(' ') || copy.error;
          }
        } catch (_) { /* keep fallback */ }

        status.hidden = false;
        status.className = 'contact-form-status is-error';
        status.textContent = message;
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.textContent = defaultLabel;
      } catch (_) {
        status.hidden = false;
        status.className = 'contact-form-status is-error';
        status.textContent = copy.error;
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.textContent = defaultLabel;
      }
    });
  });
})();

// Free-review offer: preselect the Formspree subject from ?review= or the on-page choice.
(function initFreeReview() {
  const select = document.querySelector('#contact-review');
  const subject = document.querySelector('form.contact-form input[name="_subject"]');
  if (!select || !subject) return;

  const locale = (document.documentElement.lang || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  const SUBJECTS = {
    en: {
      reinstatement: '[HQ Enquiry] Free review — lease restoration terms',
      permit: '[HQ Enquiry] Free review — interior renovation permit',
    },
    zh: {
      reinstatement: '【HQ 新詢問】免費檢視 — 租約退租復原條款',
      permit: '【HQ 新詢問】免費檢視 — 室內裝修許可',
    },
  };
  const NOTES = {
    en: {
      reinstatement: 'Selected: lease restoration terms. This will be included when you submit the form.',
      permit: 'Selected: interior renovation permit. This will be included when you submit the form.',
    },
    zh: {
      reinstatement: '已選擇：租約退租復原條款。送出表單時會一併註明。',
      permit: '已選擇：室內裝修許可。送出表單時會一併註明。',
    },
  };
  const defaultSubject = subject.value;
  const note = document.querySelector('#review-selection-note');

  function apply(value, scroll) {
    const known = Object.prototype.hasOwnProperty.call(SUBJECTS[locale], value);
    select.value = known ? value : '';
    subject.value = known ? SUBJECTS[locale][value] : defaultSubject;
    document.querySelectorAll('button.review-option[data-review]').forEach((btn) => {
      const on = btn.getAttribute('data-review') === select.value;
      btn.classList.toggle('is-selected', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (note) {
      if (known) {
        note.hidden = false;
        note.textContent = NOTES[locale][value];
      } else {
        note.hidden = true;
        note.textContent = '';
      }
    }
    if (scroll && known) {
      const form = document.querySelector('#enquiry-form');
      form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const initial = new URLSearchParams(window.location.search).get('review');
  if (initial) apply(initial, false);
  select.addEventListener('change', () => apply(select.value, false));
  document.querySelectorAll('button.review-option[data-review]').forEach((btn) => {
    btn.addEventListener('click', () => apply(btn.getAttribute('data-review'), true));
  });
})();

// Project pages: render a testimonial only when a real quote is filled in.
(function initTestimonials() {
  const slots = document.querySelectorAll('[data-testimonial]');
  if (!slots.length) return;
  const data = window.HQ_TESTIMONIALS || {};
  const blocked = /placeholder|paste a real|replace with|fictional|範例|請替換|貼上真實/i;

  slots.forEach((slot) => {
    const slug = slot.getAttribute('data-testimonial');
    const locale = (slot.getAttribute('data-locale') || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
    const entry = data[slug] && data[slug][locale];
    const quote = entry && typeof entry.quote === 'string' ? entry.quote.trim() : '';
    if (!quote || blocked.test(quote)) return;

    const name = entry.name && typeof entry.name === 'string' ? entry.name.trim() : '';
    const role = entry.role && typeof entry.role === 'string' ? entry.role.trim() : '';
    if (blocked.test(name) || blocked.test(role)) return;

    const quoteEl = document.createElement('blockquote');
    quoteEl.textContent = quote;
    const figure = document.createElement('figure');
    figure.appendChild(quoteEl);
    if (name || role) {
      const cap = document.createElement('figcaption');
      cap.textContent = [name, role].filter(Boolean).join(' · ');
      figure.appendChild(cap);
    }
    slot.replaceChildren(figure);
    slot.hidden = false;
  });
})();

// Contact page: count WhatsApp button clicks in both GA4 properties.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-whatsapp]');
  if (!link || typeof gtag !== 'function') return;
  const label = (link.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
  gtag('event', 'whatsapp_click', {
    link_url: link.href,
    link_text: label,
  });
});
