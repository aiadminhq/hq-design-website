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

// English pages: WhatsApp links open in a new tab from the markup.
// Track clicks for both GA4 properties and keep a corner button clear of submit controls.
(function initWhatsApp() {
  const WHATSAPP_URL = 'https://wa.me/886937061533?text=Hi%20HQ%20Design%2C%20I%27d%20like%20to%20discuss%20a%20project.';
  const GLYPH = '<svg class="wa-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-whatsapp]');
    if (!link || typeof gtag !== 'function') return;
    const label = (link.getAttribute('aria-label') || link.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);
    gtag('event', 'whatsapp_click', {
      link_url: link.href,
      link_text: label,
    });
  });

  const lang = (document.documentElement.lang || '').toLowerCase();
  if (!lang.startsWith('en') || document.querySelector('.wa-float')) return;

  const button = document.createElement('a');
  button.className = 'wa-float';
  button.href = WHATSAPP_URL;
  button.target = '_blank';
  button.rel = 'noopener';
  button.setAttribute('aria-label', 'Chat on WhatsApp');
  button.setAttribute('data-whatsapp', '');
  button.innerHTML = GLYPH;
  document.body.appendChild(button);

  const mobile = window.matchMedia('(max-width: 768px)');
  let frame = 0;

  function restingFabRect() {
    const size = 48;
    const margin = 16;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const right = width - margin;
    const bottom = height - margin;
    return { left: right - size, right, top: bottom - size, bottom };
  }

  function overlaps(el, rect) {
    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return false;
    return !(box.right < rect.left - 4 || box.left > rect.right + 4 || box.bottom < rect.top - 4 || box.top > rect.bottom + 4);
  }

  function placeFloat() {
    frame = 0;
    const rest = () => {
      button.classList.remove('is-raised', 'is-hidden');
      button.style.removeProperty('--wa-lift');
      button.removeAttribute('tabindex');
    };
    if (!mobile.matches) {
      rest();
      return;
    }
    const zone = restingFabRect();
    const formCovered = Array.from(document.querySelectorAll('form')).some((el) => overlaps(el, zone));
    if (formCovered) {
      button.classList.remove('is-raised');
      button.style.removeProperty('--wa-lift');
      button.classList.add('is-hidden');
      button.setAttribute('tabindex', '-1');
      return;
    }

    let top = Infinity;
    document.querySelectorAll('.hero-stats').forEach((el) => {
      if (!overlaps(el, zone)) return;
      const box = el.getBoundingClientRect();
      if (box.top < top) top = box.top;
    });
    if (top === Infinity) {
      rest();
      return;
    }
    const lift = Math.round(window.innerHeight - top + 12);
    if (lift > 180) {
      rest();
      return;
    }
    button.classList.remove('is-hidden');
    button.removeAttribute('tabindex');
    button.style.setProperty('--wa-lift', lift + 'px');
    button.classList.add('is-raised');
  }

  function schedule() {
    if (frame) return;
    frame = window.requestAnimationFrame(placeFloat);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', schedule);
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
  }
  placeFloat();
})();
