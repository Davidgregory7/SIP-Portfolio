const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', event => {
  if (event.target.matches('a')) {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const sections = [...document.querySelectorAll('main > section')];
const navLinks = [...document.querySelectorAll('#site-nav a')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-30% 0px -60% 0px' });
sections.forEach(section => sectionObserver.observe(section));

document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Portfolio inquiry from ${data.get('name')}`);
  const body = encodeURIComponent(`${data.get('message')}\n\nReply to: ${data.get('email')}`);
 window.location.href = `mailto:DGREGORY83851@uat.edu?subject=${subject}&body=${body}`;
document.querySelector('#form-status').textContent =
  'Your email application should open with the inquiry prepared.';
});
document.querySelector('#year').textContent = new Date().getFullYear();
