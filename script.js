/**
 * Kinshu Kumawat — Portfolio Scripts
 * Handles interactive animations, custom cursor, scroll reveals,
 * mobile navigation, back-to-top button, and toast notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initScrollReveal();
  initNavbar();
  initBackToTop();
  initSmoothScroll();
  initContactForm();
  initFooterYear();
});

/**
 * Custom Interactive Cursor with Lerp Physics
 */
function initCustomCursor() {
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouchDevice || prefersReducedMotion) return;

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  document.documentElement.classList.add('custom-cursor-on');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let isHovered = false;
  let isVisible = false;
  let animId = null;

  const onMouseMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }

    isHovered = !!e.target?.closest('a, button, input, textarea, select, [role="button"]');
  };

  const onMouseLeave = () => {
    isVisible = false;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  };

  const updateCursor = () => {
    // Smooth lerp following physics (0.16 factor matches original React bundle)
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;

    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${isHovered ? 0.6 : 1})`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${isHovered ? 1.7 : 1})`;
    ring.style.borderColor = isHovered ? 'var(--primary)' : 'color-mix(in oklab, var(--accent) 70%, transparent)';

    animId = requestAnimationFrame(updateCursor);
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onMouseLeave);
  animId = requestAnimationFrame(updateCursor);
}

/**
 * Scroll Reveal using IntersectionObserver
 */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach((el) => observer.observe(el));
}

/**
 * Sticky Navbar & Mobile Navigation Drawer
 */
function initNavbar() {
  const header = document.querySelector('header');
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  let isMenuOpen = false;

  const updateHeaderState = () => {
    if (window.scrollY > 20 || isMenuOpen) {
      header.classList.add('glass', 'border-x-0', 'border-t-0');
    } else {
      header.classList.remove('glass', 'border-x-0', 'border-t-0');
    }
  };

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  if (menuBtn && mobileMenu) {
    const hamburgerIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>
    `;
    const closeIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
    `;

    menuBtn.addEventListener('click', () => {
      isMenuOpen = !isMenuOpen;
      menuBtn.setAttribute('aria-expanded', String(isMenuOpen));
      menuBtn.setAttribute('aria-label', isMenuOpen ? 'Close menu' : 'Open menu');
      menuBtn.innerHTML = isMenuOpen ? closeIcon : hamburgerIcon;

      if (isMenuOpen) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('flex');
      } else {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
      }

      updateHeaderState();
    });

    // Close menu when clicking any nav link
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (!isMenuOpen) return;
        isMenuOpen = false;
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open menu');
        menuBtn.innerHTML = hamburgerIcon;
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        updateHeaderState();
      });
    });
  }
}

/**
 * Back to Top Floating Button
 */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const onScroll = () => {
    if (window.scrollY > 600) {
      btn.classList.remove('opacity-0', 'pointer-events-none');
      btn.classList.add('opacity-100');
    } else {
      btn.classList.add('opacity-0', 'pointer-events-none');
      btn.classList.remove('opacity-100');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Smooth Anchor Scrolling and ScrollSpy Active Links
 */
function initSmoothScroll() {
  const navLinks = document.querySelectorAll('header nav ul a[href^="#"]');
  const sections = document.querySelectorAll('main section[id]');

  // Scrollspy to highlight active link
  const onScroll = () => {
    let currentId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.remove('text-muted-foreground');
        link.classList.add('text-foreground', 'font-semibold');
      } else {
        link.classList.remove('text-foreground', 'font-semibold');
        link.classList.add('text-muted-foreground');
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * Contact Form Handling & Toast Notifications
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Button loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Sending...';

    // Simulate async submission
    setTimeout(() => {
      showToast("Message sent! I'll get back to you soon.");
      form.reset();

      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Message';
    }, 700);
  });
}

/**
 * Toast Notification System (replaces Sonner toast with pure vanilla JS)
 */
function showToast(message, duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `
    <div class="toast-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
    </div>
    <div class="toast-msg">${message}</div>
    <button class="toast-close-btn" aria-label="Dismiss toast">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
    </button>
  `;

  const closeToast = () => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  };

  const closeBtn = toast.querySelector('.toast-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeToast);
  }

  container.appendChild(toast);

  // Auto dismiss
  setTimeout(closeToast, duration);
}

/**
 * Set Dynamic Year in Footer
 */
function initFooterYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
