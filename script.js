// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  nav.classList.toggle('is-open');
});
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('is-open'));
});

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('is-open'));
    if (!isOpen) item.classList.add('is-open');
  });
});

// Order form submit (no backend)
const orderForm = document.getElementById('orderForm');
const orderSuccess = document.getElementById('orderSuccess');
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  orderForm.hidden = true;
  orderSuccess.hidden = false;
  orderSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
