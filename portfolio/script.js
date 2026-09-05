/* =========================================================================
   PORTFOLIO SCRIPT — Dusa Neeraj
   Table of contents:
   1. Preloader
   2. Mobile hamburger menu
   3. Navbar shadow on scroll
   4. Smooth scroll + active nav link on scroll
   5. Typing animation (hero tagline)
   6. Dark mode toggle with localStorage
   7. Scroll reveal animation (IntersectionObserver)
   8. Animated counters (About stats)
   9. Animated skill progress bars
   10. Back-to-top button
   11. Contact form validation
   12. Dynamic footer year
   ========================================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. PRELOADER ----------
     Hide the preloader shortly after the page's HTML is ready.
     We do NOT wait for window.load (which waits on every image/CDN
     resource) because a slow or blocked external resource — like the
     Font Awesome CDN when offline — could otherwise leave the visitor
     stuck on the preloader forever. A short fixed delay feels just as
     polished and is much more reliable. */
  const preloader = document.getElementById('preloader');
  setTimeout(function () {
    preloader.classList.add('loaded');
  }, 600);

  /* ---------- 2. MOBILE HAMBURGER MENU ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close the mobile menu automatically after clicking a link
  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });

  /* ---------- 3. NAVBAR SHADOW ON SCROLL ---------- */
  const navbar = document.getElementById('navbar');
  function handleNavbarShadow() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', handleNavbarShadow);
  handleNavbarShadow();

  /* ---------- 4. ACTIVE NAV LINK ON SCROLL ----------
     Smooth scrolling itself is handled by CSS (scroll-behavior: smooth).
     Here we just track which section is in view and highlight its link. */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  function setActiveLink() {
    let currentId = '';
    const scrollPos = window.scrollY + 120; // offset for navbar height

    sections.forEach(function (section) {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinkEls.forEach(function (link) {
      link.classList.toggle('active-link', link.getAttribute('href') === '#' + currentId);
    });
  }

  window.addEventListener('scroll', setActiveLink);
  setActiveLink();

  /* ---------- 5. TYPING ANIMATION ---------- */
  const typingPhrases = [
    'Building real-world projects with Python.',
    'Practising Data Structures & Algorithms daily.',
    'Learning Web Development, one project at a time.'
  ];
  const typingEl = document.getElementById('typingText');
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeLoop() {
    const currentPhrase = typingPhrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }

    typingEl.textContent = currentPhrase.substring(0, charIndex);

    let delay = isDeleting ? 35 : 65;

    if (!isDeleting && charIndex === currentPhrase.length) {
      delay = 1400; // pause at the end of a full phrase
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % typingPhrases.length;
      delay = 300;
    }

    setTimeout(typeLoop, delay);
  }

  typeLoop();

  /* ---------- 6. DARK MODE TOGGLE (with localStorage) ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('i');
  const THEME_KEY = 'neeraj-portfolio-theme';

  function applyTheme(theme) {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    themeIcon.classList.toggle('fa-moon', theme !== 'dark');
    themeIcon.classList.toggle('fa-sun', theme === 'dark');
  }

  // On load, use saved preference, or fall back to the visitor's OS setting
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }

  themeToggle.addEventListener('click', function () {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  });

  /* ---------- 7. SCROLL REVEAL (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- 8. ANIMATED COUNTERS (About stats) ---------- */
  const counters = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    let current = 0;
    const duration = 1200; // ms
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, stepTime);
  }

  const counterObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (counter) {
    counterObserver.observe(counter);
  });

  /* ---------- 9. ANIMATED SKILL PROGRESS BARS ---------- */
  const progressBars = document.querySelectorAll('.progress-fill');

  const progressObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  progressBars.forEach(function (bar) {
    progressObserver.observe(bar);
  });

  /* ---------- 10. BACK TO TOP BUTTON ---------- */
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    backToTopBtn.classList.toggle('show', window.scrollY > 500);
  });

  backToTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 11. CONTACT FORM VALIDATION ----------
     This is front-end only for now — it checks the fields look correct
     and shows a success message. No data is actually sent anywhere yet
     (that will come later once backend/JS integration is added). */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  function showError(inputId, errorId, message) {
    document.getElementById(inputId).parentElement.classList.add('error');
    document.getElementById(errorId).textContent = message;
  }

  function clearError(inputId, errorId) {
    document.getElementById(inputId).parentElement.classList.remove('error');
    document.getElementById(errorId).textContent = '';
  }

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    let isValid = true;

    const nameVal = document.getElementById('name').value.trim();
    const emailVal = document.getElementById('email').value.trim();
    const messageVal = document.getElementById('message').value.trim();

    // Name check
    if (nameVal.length < 2) {
      showError('name', 'nameError', 'Please enter your full name.');
      isValid = false;
    } else {
      clearError('name', 'nameError');
    }

    // Email check (simple pattern good enough for front-end validation)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailVal)) {
      showError('email', 'emailError', 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearError('email', 'emailError');
    }

    // Message check
    if (messageVal.length < 10) {
      showError('message', 'messageError', 'Message should be at least 10 characters.');
      isValid = false;
    } else {
      clearError('message', 'messageError');
    }

    if (isValid) {
      formSuccess.classList.add('show');
      contactForm.reset();
      setTimeout(function () {
        formSuccess.classList.remove('show');
      }, 6000);
    } else {
      formSuccess.classList.remove('show');
    }
  });

  /* ---------- 12. DYNAMIC FOOTER YEAR ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

});
