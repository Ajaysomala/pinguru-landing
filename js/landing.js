const FORMSPREE_URL = 'https://formspree.io/f/mykbvqoj';

function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

async function handleSubmit(e) {
  e.preventDefault();
  const emailInputs = [
    document.getElementById('email-input'),
    document.getElementById('email-input-2')
  ];
  const email = emailInputs.find(el => el && el.value)?.value;

  try {
    const resp = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'pinguru-landing' })
    });
    if (resp.ok) {
      document.getElementById('success-msg').style.display = 'block';
      emailInputs.forEach(el => { if (el) el.value = ''; });
    }
  } catch {
    document.getElementById('success-msg').style.display = 'block';
    emailInputs.forEach(el => { if (el) el.value = ''; });
  }
}

// Hamburger menu
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('open');
}

// Entrance animations
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.step-card, .feature-card, .price-card, .hero-panel').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    observer.observe(el);
  });
});
