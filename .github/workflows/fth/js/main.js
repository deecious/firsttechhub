const mobileMenuButton = document.querySelector('.mobile-menu');
const siteNav = document.querySelector('.site-nav');
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');

const defaultData = window.FTB_DATA || {};

function getSiteData() {
  try {
    const stored = localStorage.getItem('ftbData');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Could not parse stored data:', error);
  }
  return defaultData;
}

function renderCourses(containerId, showAll = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const data = getSiteData();
  const courses = data.courses || [];
  const items = showAll ? courses : courses.slice(0, 3);

  items.forEach((course) => {
    const card = document.createElement('article');
    card.className = 'course-card';
    card.innerHTML = `
      <h3>${course.title}</h3>
      <p>${course.description}</p>
      <div class="meta">${course.duration} • ${course.type}</div>
    `;
    container.appendChild(card);
  });
}

function renderTestimonials(containerId, showAll = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const data = getSiteData();
  const testimonials = data.testimonials || [];
  const items = showAll ? testimonials : testimonials.slice(0, 3);

  items.forEach((testimonial) => {
    const card = document.createElement('article');
    card.className = 'testimonial-card';
    card.innerHTML = `
      <h3>${testimonial.name}</h3>
      <p>${testimonial.feedback}</p>
      <div class="meta">${testimonial.role}</div>
    `;
    container.appendChild(card);
  });
}

function renderBlog(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const data = getSiteData();
  const posts = data.blogPosts || [];

  posts.forEach((post) => {
    const card = document.createElement('article');
    card.className = 'blog-card';
    card.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      <div class="meta">${post.date}</div>
    `;
    container.appendChild(card);
  });
}

function initPageRendering() {
  renderCourses('courseCards');
  renderCourses('courseCardsFull', true);
  renderTestimonials('testimonialCards');
  renderTestimonials('testimonialCardsFull', true);
  renderBlog('blogCards');
}

function animateStats() {
  const stats = document.querySelectorAll('.stat-number');
  if (!stats.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const span = entry.target;
      const target = Number(span.dataset.target) || 0;
      const suffix = span.dataset.suffix || '';
      const duration = 1600;
      let startTime = null;

      const update = (time) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        span.textContent = `${Math.floor(progress * target)}${suffix}`;
        if (progress < 1) {
          window.requestAnimationFrame(update);
        } else {
          span.textContent = `${target}${suffix}`;
        }
      };

      window.requestAnimationFrame(update);
      obs.unobserve(span);
    });
  }, { threshold: 0.5 });

  stats.forEach((stat) => observer.observe(stat));
}

function initContactForm() {
  if (!contactForm) return;
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message) {
      formFeedback.textContent = 'Please complete all fields before sending.';
      formFeedback.style.color = '#ff8a8a';
      return;
    }

    formFeedback.textContent = 'Thank you! Your message is ready to send. We will follow up shortly.';
    formFeedback.style.color = '#9beb8d';
    contactForm.reset();
  });
}

function initMenu() {
  if (!mobileMenuButton || !siteNav) return;
  mobileMenuButton.addEventListener('click', () => {
    siteNav.classList.toggle('visible');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initPageRendering();
  animateStats();
  initContactForm();
});
