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
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('is-open');
      });
    });
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

    document.querySelectorAll('a[data-ig]').forEach(function (a) {
      a.href = IG_URL;
    });
  });
})();
