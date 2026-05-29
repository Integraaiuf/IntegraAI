/* ─── Integra AI — site.js ────────────────────────────────────────────
   Deps (loaded via CDN before this script):
   - Lenis       https://unpkg.com/lenis/dist/lenis.min.js
   - GSAP        https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
   - ScrollTrigger cdnjs/gsap/3.12.5/ScrollTrigger.min.js
   - THREE       https://unpkg.com/three@0.163.0/build/three.min.js
────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Lenis smooth scroll ──────────────────────────────────────────── */
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ── Scroll progress bar ──────────────────────────────────────────── */
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    lenis.on('scroll', ({ progress }) => {
      progressBar.style.setProperty('--progress', progress);
    });
  }

  /* ── Spotlight cursor ─────────────────────────────────────────────── */
  const spotlight = document.querySelector('.spotlight');
  if (spotlight && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      spotlight.style.setProperty('--cx', e.clientX + 'px');
      spotlight.style.setProperty('--cy', e.clientY + 'px');
    }, { passive: true });
  }

  /* ── Nav scroll state ─────────────────────────────────────────────── */
  const nav = document.getElementById('nav');
  if (nav) {
    lenis.on('scroll', ({ scroll }) => {
      nav.classList.toggle('scrolled', scroll > 40);
    });
  }

  /* ── Mobile menu ──────────────────────────────────────────────────── */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuScrim  = document.getElementById('menu-scrim');
  if (menuToggle) {
    const openIcon  = menuToggle.querySelector('.icon-menu');
    const closeIcon = menuToggle.querySelector('.icon-close');
    function toggleMenu(open) {
      document.body.classList.toggle('menu-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      if (openIcon)  openIcon.style.display  = open ? 'none' : '';
      if (closeIcon) closeIcon.style.display = open ? ''     : 'none';
      if (open) lenis.stop(); else lenis.start();
    }
    menuToggle.addEventListener('click', () => toggleMenu(!document.body.classList.contains('menu-open')));
    menuScrim?.addEventListener('click', () => toggleMenu(false));
    mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  }

  /* ── Chatbot dropdown ─────────────────────────────────────────────── */
  const botDropdown = document.getElementById('bot-dropdown');
  const botToggle   = document.getElementById('bot-toggle');
  const botSearch   = document.getElementById('bot-search-input');
  const botList     = document.getElementById('bot-mega-list');
  const botNone     = document.getElementById('bot-noresult');
  if (botDropdown && botToggle) {
    botToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = botDropdown.classList.toggle('open');
      botToggle.setAttribute('aria-expanded', String(open));
      if (open && botSearch) botSearch.focus();
    });
    document.addEventListener('click', (e) => {
      if (!botDropdown.contains(e.target)) {
        botDropdown.classList.remove('open');
        botToggle.setAttribute('aria-expanded', 'false');
      }
    });
    botSearch?.addEventListener('input', () => {
      const q = botSearch.value.trim().toLowerCase();
      let any = false;
      botList?.querySelectorAll('.bot-row').forEach(row => {
        const name = row.querySelector('.bot-name')?.textContent.toLowerCase() || '';
        const show = !q || name.includes(q);
        row.style.display = show ? '' : 'none';
        if (show) any = true;
      });
      if (botNone) botNone.hidden = any;
    });
  }

  /* ── Hero entrance animations ─────────────────────────────────────── */
  function heroIn() {
    const els = document.querySelectorAll('.hero-eyebrow, h1.hero-h1, .hero-sub, .hero-actions, .hero-stats');
    let delay = 0;
    els.forEach(el => {
      setTimeout(() => el.classList.add('in'), delay);
      delay += 100;
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(heroIn, 100));
  } else {
    setTimeout(heroIn, 100);
  }

  /* ── THREE.js hero particle field ─────────────────────────────────── */
  function initParticles() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 120);
    camera.position.z = 32;

    const COUNT = 900;
    const geo   = new THREE.BufferGeometry();
    const pos   = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
      sizes[i] = Math.random() * 1.2 + 0.3;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.16, color: 0x34D399,
      transparent: true, opacity: 0.35,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 0.4;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.3;
    }, { passive: true });

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize, { passive: true });

    let frame = 0;
    function animate() {
      requestAnimationFrame(animate);
      frame += 0.0006;
      points.rotation.y = frame + mouse.x * 0.5;
      points.rotation.x = mouse.y * 0.3;
      mat.opacity = 0.28 + Math.sin(frame * 3) * 0.06;
      renderer.render(scene, camera);
    }
    animate();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
  } else {
    initParticles();
  }

  /* ── GSAP scroll animations ───────────────────────────────────────── */
  function initScrollAnimations() {
    // Generic fade-up on scroll
    document.querySelectorAll('.fade-up').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => el.classList.add('in'),
      });
    });

    // Tile hover radial gradient follows mouse
    document.querySelectorAll('.tile').forEach((tile) => {
      tile.addEventListener('mousemove', (e) => {
        const r = tile.getBoundingClientRect();
        tile.style.setProperty('--tx', (e.clientX - r.left) + 'px');
        tile.style.setProperty('--ty', (e.clientY - r.top)  + 'px');
      });
    });

    // Stagger bento tiles
    const tiles = document.querySelectorAll('.tile');
    if (tiles.length) {
      gsap.from(tiles, {
        opacity: 0, y: 40,
        duration: 0.7, stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: tiles[0], start: 'top 85%' },
      });
    }

    // Bot grid stagger
    const botCards = document.querySelectorAll('.bot-card');
    if (botCards.length) {
      gsap.from(botCards, {
        opacity: 0, y: 24, scale: 0.96,
        duration: 0.5, stagger: 0.04,
        ease: 'power2.out',
        scrollTrigger: { trigger: botCards[0], start: 'top 88%' },
      });
    }

    // Stat counter animation
    document.querySelectorAll('[data-count-to]').forEach((el) => {
      const target = parseFloat(el.getAttribute('data-count-to'));
      const suffix = el.getAttribute('data-suffix') || '';
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.fromTo({ val: 0 }, { val: target }, {
            duration: 1.6, ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.round(this.targets()[0].val) + suffix;
            },
          });
        },
      });
    });

    // Section headings — clip reveal
    document.querySelectorAll('.section-h2, .page-h1').forEach((h) => {
      gsap.from(h, {
        opacity: 0, y: 30,
        duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: h, start: 'top 90%' },
      });
    });
  }

  /* ── FAQ accordion ────────────────────────────────────────────────── */
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach((item) => {
      const btn = item.querySelector('.faq-q');
      const ans = item.querySelector('.faq-a');
      if (!btn || !ans) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close all
        document.querySelectorAll('.faq-item.open').forEach((openItem) => {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-a').style.maxHeight = '0';
          openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          ans.style.maxHeight = ans.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ── Contact form ─────────────────────────────────────────────────── */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit .btn-primary');
      if (btn) { btn.textContent = 'Skickat!'; btn.style.background = 'var(--accent-2)'; }
      // Real submission would go here (e.g. Formspree, EmailJS)
    });
  }

  /* ── Smooth anchor scroll ─────────────────────────────────────────── */
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.2 });
      });
    });
  }

  /* ── Init ─────────────────────────────────────────────────────────── */
  function init() {
    initScrollAnimations();
    initFAQ();
    initContactForm();
    initAnchorScroll();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
