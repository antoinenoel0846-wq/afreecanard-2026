(function () {
  'use strict';

  var IG_URL = 'https://www.instagram.com/afreecanard/';
  var COUNTDOWN_TARGET = new Date('2026-08-14T19:00:00').getTime();

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function updateCountdown() {
    var diff = Math.max(0, COUNTDOWN_TARGET - Date.now());
    var s = Math.floor(diff / 1000);
    var days = Math.floor(s / 86400);
    var hours = Math.floor((s % 86400) / 3600);
    var minutes = Math.floor((s % 3600) / 60);
    var seconds = s % 60;

    var elDays = document.getElementById('countdown-days');
    var elHours = document.getElementById('countdown-hours');
    var elMinutes = document.getElementById('countdown-minutes');
    var elSeconds = document.getElementById('countdown-seconds');

    if (elDays) elDays.textContent = String(days);
    if (elHours) elHours.textContent = pad(hours);
    if (elMinutes) elMinutes.textContent = pad(minutes);
    if (elSeconds) elSeconds.textContent = pad(seconds);
  }

  function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  function scrollGallery(mult) {
    var track = document.getElementById('ac-gallery-track');
    if (!track) return;
    track.scrollBy({ left: Math.round(track.clientWidth * 0.85) * mult, behavior: 'smooth' });
  }

  function initGallery() {
    var prev = document.getElementById('gal-prev');
    var next = document.getElementById('gal-next');
    if (prev) prev.addEventListener('click', function () { scrollGallery(-1); });
    if (next) next.addEventListener('click', function () { scrollGallery(1); });
  }

  function initReveal() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!els.length) return;

    if (reduce) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-visible');
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  function initNav() {
    var header = document.getElementById('header');
    var toggle = document.getElementById('nav-toggle');
    var overlay = document.getElementById('nav-overlay');
    var navLinks = document.querySelectorAll('.nav__link[href^="#"]');

    // Transparent → frosted glass on scroll
    function updateScrollState() {
      header.classList.toggle('is-scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();

    // Mobile overlay toggle
    if (toggle && overlay) {
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

      overlay.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
    }

    // Active section highlight
    var sections = document.querySelectorAll('main section[id]');
    if (sections.length && navLinks.length) {
      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
          });
        });
      }, { threshold: 0.3, rootMargin: '-15% 0px -55% 0px' });

      sections.forEach(function (s) { sectionObserver.observe(s); });
    }
  }

  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    function update() {
      var total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (total > 0 ? window.scrollY / total : 0) + ')';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initCardTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    var cards = document.querySelectorAll('.programme-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transition = 'transform 0.08s ease, box-shadow 0.2s ease';
        card.style.transform =
          'perspective(900px) rotateX(' + (-y * 9) + 'deg) rotateY(' + (x * 9) + 'deg) translateY(-10px)';
        card.style.boxShadow =
          (x > 0 ? (x * 12) + 'px' : '0px') + ' 24px 0 rgba(0,0,0,0.22), 0 10px 32px rgba(0,0,0,0.16)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s ease';
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  function initParallax() {
    var el = document.querySelector('.ambiance');
    if (!el) return;
    function update() {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      el.style.backgroundPositionY = 'calc(30% + ' + ((progress - 0.5) * 70) + 'px)';
    }
    window.addEventListener('scroll', update, { passive: true });
  }

  function initFaq() {
    var items = document.querySelectorAll('.faq__item');
    items.forEach(function (item) {
      var btn = item.querySelector('.faq__question');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        items.forEach(function (i) {
          i.classList.remove('is-open');
          var b = i.querySelector('.faq__question');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCountdown();
    initGallery();
    initReveal();
    initNav();
    initFaq();
    initScrollProgress();
    initCardTilt();
    initParallax();

    document.querySelectorAll('a[data-ig]').forEach(function (a) {
      a.href = IG_URL;
    });
  });
})();
