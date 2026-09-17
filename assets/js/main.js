// HQ Interior & Space Design — Main JS

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
