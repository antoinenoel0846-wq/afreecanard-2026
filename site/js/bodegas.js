(function () {
  'use strict';

  var IG_URL = 'https://www.instagram.com/afreecanard/';

  /* ── Nav scroll state ── */
  function initNav() {
    var header = document.getElementById('header');
    if (!header) return;

    function updateScrollState() {
      header.classList.toggle('is-scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();

    var toggle  = document.getElementById('nav-toggle');
    var overlay = document.getElementById('nav-overlay');
    if (!toggle || !overlay) return;

    function openMenu() {
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    toggle.addEventListener('click', function () {
      toggle.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    overlay.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ── Scroll progress bar ── */
  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      bar.style.transform = 'scaleX(' + Math.min(1, pct) + ')';
    }, { passive: true });
  }

  /* ── Generic reveal (IntersectionObserver) ── */
  function initReveal() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!els.length) return;
    if (reduce) { els.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = parseInt(entry.target.getAttribute('data-reveal-delay') || '0', 10);
        entry.target.style.transitionDelay = delay + 'ms';
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ── Menu items staggered reveal ── */
  function initMenuReveal() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cols = Array.prototype.slice.call(document.querySelectorAll('.bod-menu-col'));
    cols.forEach(function (col) {
      var items = Array.prototype.slice.call(col.querySelectorAll('.bod-item'));
      items.forEach(function (item) { item.classList.add('js-menu-item'); });
      if (reduce) { items.forEach(function (item) { item.classList.add('is-visible'); }); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.disconnect();
          items.forEach(function (item, i) {
            setTimeout(function () { item.classList.add('is-visible'); }, i * 55);
          });
        });
      }, { threshold: 0.15 });
      io.observe(col);
    });
  }

  /* ── Subnav active section ── */
  function initSubnav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.bod-subnav__link'));
    if (!links.length) return;
    var sectionMap = [];
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href[0] !== '#') return;
      var section = document.getElementById(href.slice(1));
      if (section) sectionMap.push({ link: link, section: section });
    });
    if (!sectionMap.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        sectionMap.forEach(function (s) {
          if (s.section === entry.target) s.link.classList.add('is-active');
        });
      });
    }, { threshold: 0.35 });

    sectionMap.forEach(function (s) { io.observe(s.section); });

    /* Activate first by default */
    if (sectionMap.length) sectionMap[0].link.classList.add('is-active');
  }

  /* ── Lenis smooth scroll ── */
  function initSmoothScroll() {
    if (!window.Lenis) return;
    var lenis = new Lenis({
      duration: 0.9,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      smoothTouch: false,
    });
    if (window.gsap) {
      if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function tick(time) { lenis.raf(time); requestAnimationFrame(tick); })(0);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initScrollProgress();
    initReveal();
    initMenuReveal();
    initSubnav();
    initSmoothScroll();
    document.querySelectorAll('a[data-ig]').forEach(function (a) { a.href = IG_URL; });
  });
})();
