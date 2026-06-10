(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  //  1. THEME TOGGLE
  // ═══════════════════════════════════════════════════════════
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const current = htmlEl.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // ═══════════════════════════════════════════════════════════
  //  2. PARTICLE NETWORK CANVAS
  // ═══════════════════════════════════════════════════════════
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let animId = null;
    let isVisible = true;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();

    const isLight = () => htmlEl.getAttribute('data-theme') === 'light';

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 0.5;
        this.baseAlpha = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        const color = isLight() ? '0,0,0' : '230,57,70';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${this.baseAlpha})`;
        ctx.fill();
      }
    }

    function initParticles() {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 25000), 60);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }
    initParticles();

    function drawConnections() {
      const maxDist = 150;
      const color = isLight() ? '0,0,0' : '230,57,70';

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${color},${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Connect to mouse
        const mdx = particles[i].x - mouseX;
        const mdy = particles[i].y - mouseY;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 180) {
          const alpha = (1 - mDist / 180) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(${color},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    function animateParticles() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawConnections();
      animId = requestAnimationFrame(animateParticles);
    }

    // Only run when visible
    const canvasObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) animateParticles();
        if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      });
    }, { threshold: 0 });

    canvasObserver.observe(canvas);
    animateParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Re-color particles on theme change
    document.addEventListener('themechange', initParticles);
  }

  // ═══════════════════════════════════════════════════════════
  //  3. TYPING EFFECT
  // ═══════════════════════════════════════════════════════════
  const typingEl = document.getElementById('typingText');
  if (typingEl) {
    const phrases = [
      'Backend Engineer',
      'AI / ML Enthusiast',
      'Distributed Systems',
      'Clean API Designer'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 100;

    function type() {
      const current = phrases[phraseIndex];

      if (isDeleting) {
        typingEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        typeDelay = 50;
      } else {
        typingEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        typeDelay = 100;
      }

      if (!isDeleting && charIndex === current.length) {
        isDeleting = true;
        typeDelay = 2000; // pause at end
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeDelay = 500;
      }

      setTimeout(type, typeDelay);
    }

    // Start after a short delay
    setTimeout(type, 800);
  }

  // ═══════════════════════════════════════════════════════════
  //  4. SCROLL-TRIGGERED NUMBER COUNTERS
  // ═══════════════════════════════════════════════════════════
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1500;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutQuart
          const eased = 1 - Math.pow(1 - progress, 4);
          const current = Math.floor(eased * target);
          el.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = target + suffix;
          }
        }

        requestAnimationFrame(update);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-value[data-count]').forEach((el) => {
    counterObserver.observe(el);
  });

  // ═══════════════════════════════════════════════════════════
  //  5. SKILL BARS ANIMATION
  // ═══════════════════════════════════════════════════════════
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const progress = bar.dataset.progress || '0';
        const fill = bar.querySelector('.skill-bar-fill');
        if (fill) {
          fill.style.setProperty('--progress', progress + '%');
          // Small delay for visual effect
          requestAnimationFrame(() => {
            fill.classList.add('animated');
          });
        }
        skillObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skill-bar').forEach((bar) => {
    skillObserver.observe(bar);
  });

  // ═══════════════════════════════════════════════════════════
  //  6. PROJECT MODAL
  // ═══════════════════════════════════════════════════════════
  const modal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');

  if (modal && modalClose) {
    function openModal(projectData) {
      document.getElementById('modalTitle').textContent = projectData.title;
      document.getElementById('modalBadge').textContent = projectData.badge;
      document.getElementById('modalDesc').textContent = projectData.desc;
      document.getElementById('modalDetails').textContent = projectData.details;

      const techContainer = document.getElementById('modalTech');
      techContainer.innerHTML = '';
      projectData.tech.split(',').forEach((t) => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = t.trim();
        techContainer.appendChild(chip);
      });

      modal.hidden = false;
      // Force reflow
      modal.offsetHeight;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      modalClose.focus();
    }

    function closeModal() {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.hidden = true;
        document.body.style.overflow = '';
      }, 300);
    }

    // Open on card click
    document.querySelectorAll('[data-project]').forEach((card) => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        openModal({
          title: card.dataset.projectTitle,
          badge: card.dataset.projectBadge,
          desc: card.dataset.projectDesc,
          tech: card.dataset.projectTech,
          details: card.dataset.projectDetails
        });
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });

      // Make card keyboard accessible
      if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View details for ${card.dataset.projectTitle}`);
      }
    });

    // Close controls
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  EXISTING: Fade-up animation on scroll
  // ═══════════════════════════════════════════════════════════
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach((el) => fadeObserver.observe(el));

  // ═══════════════════════════════════════════════════════════
  //  EXISTING: Navbar scroll effect
  // ═══════════════════════════════════════════════════════════
  const navbar = document.getElementById('navbar');
  let ticking = false;

  function updateNavbar() {
    if (window.pageYOffset > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });
  updateNavbar();

  // ═══════════════════════════════════════════════════════════
  //  EXISTING: Mobile menu toggle
  // ═══════════════════════════════════════════════════════════
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
      const isActive = navLinks.classList.toggle('active');
      mobileMenuToggle.classList.toggle('active');
      mobileMenuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        mobileMenuToggle.focus();
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  EXISTING: Active nav link highlighting
  // ═══════════════════════════════════════════════════════════
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');
  let navTicking = false;

  function setActiveNav() {
    const scrollPos = window.scrollY + 120;
    let activeId = '';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        activeId = sectionId;
      }
    });

    navItems.forEach((item) => {
      item.classList.remove('active');
      if (activeId && item.getAttribute('href') === '#' + activeId) {
        item.classList.add('active');
      }
    });

    navTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!navTicking) {
      requestAnimationFrame(setActiveNav);
      navTicking = true;
    }
  }, { passive: true });
  setActiveNav();

  // ═══════════════════════════════════════════════════════════
  //  EXISTING: Smooth scroll for anchor links
  // ═══════════════════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  EXISTING: Scroll to top button
  // ═══════════════════════════════════════════════════════════
  const scrollTopBtn = document.getElementById('scrollTop');

  if (scrollTopBtn) {
    let topBtnTicking = false;

    function updateScrollTop() {
      if (window.pageYOffset > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
      topBtnTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!topBtnTicking) {
        requestAnimationFrame(updateScrollTop);
        topBtnTicking = true;
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  EXISTING: Magnetic card effect on hover (desktop)
  // ═══════════════════════════════════════════════════════════
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.project-card, .testimonial-glass, .bento-item').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = (y / rect.height) * -4;
        const rotateY = (x / rect.width) * 4;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  EXISTING: Parallax glow on hero
  // ═══════════════════════════════════════════════════════════
  const heroGlow = document.querySelector('.hero-glow');
  if (heroGlow && window.matchMedia('(pointer: fine)').matches) {
    let glowTicking = false;

    function updateGlow() {
      const scrollY = window.pageYOffset;
      const heroHeight = document.querySelector('.hero').offsetHeight;
      const progress = Math.min(scrollY / heroHeight, 1);
      heroGlow.style.transform = `translateY(${scrollY * 0.3}px) scale(${1 + progress * 0.2})`;
      heroGlow.style.opacity = `${1 - progress * 0.6}`;
      glowTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!glowTicking) {
        requestAnimationFrame(updateGlow);
        glowTicking = true;
      }
    }, { passive: true });
  }
})();
