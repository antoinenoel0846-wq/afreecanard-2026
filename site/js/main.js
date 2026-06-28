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

  function initSmoothScroll() {
    if (!window.Lenis || !window.gsap || !window.ScrollTrigger) return;

    var lenis = new Lenis({
      duration: 0.9,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function initHeroScroll() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    var pin   = document.querySelector('.hero-pin');
    var doorL = document.querySelector('.hero-pin__door--left');
    var doorR = document.querySelector('.hero-pin__door--right');
    var items = document.querySelectorAll('.hero-pin__item');
    var duckG = document.querySelector('.hero__duck-wrap--guitar');
    var duckS = document.querySelector('.hero__duck-wrap--saxo');
    var duckM = document.querySelector('.hero__duck-wrap--micro');
    var hint  = document.querySelector('.hero-pin__scroll-hint');

    if (!pin || !doorL) return;

    /* Reduced motion → état final direct, pas d'animation */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(doorL, { xPercent: -105 });
      gsap.set(doorR, { xPercent:  105 });
      gsap.set(items, { opacity: 1, y: 0 });
      if (duckG) gsap.set(duckG, { opacity: 1 });
      if (duckS) gsap.set(duckS, { opacity: 1 });
      if (duckM) gsap.set(duckM, { opacity: 1 });
      return;
    }

    var isMobile = window.matchMedia('(max-width: 768px)').matches;

    /* État initial des canards et de l'indicateur */
    if (duckG) gsap.set(duckG, { opacity: 0, x: -55 });
    if (duckS) gsap.set(duckS, { opacity: 0, x:  55 });
    if (duckM) gsap.set(duckM, { opacity: 0 });

    /* ── Timeline scrubbée ── */
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: isMobile ? '+=65%' : '+=95%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
      },
    });

    /* Phase 1 — Portes s'écartent (0 → 52 %) — logo-enfant suit la porte */
    tl.to(doorL, { xPercent: -100, ease: 'power2.inOut', duration: 0.52 }, 0);
    tl.to(doorR, { xPercent:  100, ease: 'power2.inOut', duration: 0.52 }, 0);

    /* Indicateur scroll : apparaît au tout début, disparaît quand les rideaux s'ouvrent */
    if (hint) {
      tl.fromTo(hint, { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.01);
      tl.to(hint,     { opacity: 0, duration: 0.05 }, 0.36);
    }

    /* Phase 2 — Contenu en cascade (42 → 98 %) */
    var staggerStart = 0.42;
    Array.prototype.forEach.call(items, function (el, i) {
      tl.fromTo(el,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, ease: 'power2.out', duration: 0.13 },
        staggerStart + i * 0.09
      );
    });

    /* Canards (desktop uniquement — mobile : pas de déco lourde) */
    if (!isMobile) {
      if (duckG) tl.fromTo(duckG, { opacity: 0, x: -55 }, { opacity: 1, x: 0, ease: 'power3.out', duration: 0.12 }, 0.48);
      if (duckS) tl.fromTo(duckS, { opacity: 0, x:  55 }, { opacity: 1, x: 0, ease: 'power3.out', duration: 0.12 }, 0.50);
      if (duckM) tl.fromTo(duckM, { opacity: 0 },         { opacity: 1, ease: 'power2.out', duration: 0.10 },        0.54);
    }

    /* Pause courte avant libération */
    tl.to({}, { duration: 0.1 }, 0.95);
  }

  function initHeroEntrance() {
    if (!window.gsap) return;
    if (document.querySelector('.hero-pin')) return; /* scroll-pin prend le relais */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var duckGuitar = document.querySelector('.hero__duck-wrap--guitar');
    var duckSaxo   = document.querySelector('.hero__duck-wrap--saxo');
    var duckMicro  = document.querySelector('.hero__duck-wrap--micro');
    var tagline    = document.querySelector('.hero__tagline');
    var logo       = document.querySelector('.hero__logo');
    var dates      = document.querySelector('.hero__dates');
    var location   = document.querySelector('.hero__location');
    var countdown  = document.querySelectorAll('.countdown__box');
    var ctaBtns    = document.querySelectorAll('.hero__actions .btn');

    if (!duckGuitar || !logo) return;

    // Set initial invisible states
    gsap.set(duckGuitar, { x: -240, opacity: 0 });
    gsap.set(duckSaxo,   { x:  240, opacity: 0 });
    gsap.set(duckMicro,  { x:   90, y: 70, opacity: 0 });
    gsap.set(tagline,    { opacity: 0, y: 22 });
    gsap.set(logo,       { opacity: 0, scale: 0.85 });
    gsap.set(dates,      { opacity: 0, y: 18 });
    gsap.set(location,   { opacity: 0 });
    gsap.set(countdown,  { opacity: 0, y: 20, scale: 0.88 });
    gsap.set(ctaBtns,    { opacity: 0, y: 18 });

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl
      // Canards volent depuis les côtés
      .to(duckGuitar, { x: 0, opacity: 1, duration: 1.05, ease: 'back.out(1.3)' }, 0)
      .to(duckSaxo,   { x: 0, opacity: 1, duration: 1.05, ease: 'back.out(1.3)' }, 0.08)
      .to(duckMicro,  { x: 0, y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.16)
      // Textes hero
      .to(tagline,  { opacity: 1, y: 0, duration: 0.65 }, 0.22)
      .to(logo,     { opacity: 1, scale: 1, duration: 1.05, ease: 'back.out(1.5)' }, 0.36)
      .to(dates,    { opacity: 1, y: 0, duration: 0.6 }, 0.62)
      .to(location, { opacity: 1, duration: 0.5 }, 0.75)
      // Countdown avec spring staggeré
      .to(countdown, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(2)' }, 0.88)
      // CTA buttons
      .to(ctaBtns, { opacity: 1, y: 0, duration: 0.5, stagger: 0.13, ease: 'back.out(1.7)' }, 1.28);
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

  function initProgramme() {
    var tabs   = Array.prototype.slice.call(document.querySelectorAll('.prog-tab'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.prog-panel'));
    if (!tabs.length || !panels.length) return;

    var current = 0;
    var busy = false;
    var noAnim = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function activate(newIdx) {
      if (newIdx === current || busy) return;
      busy = true;

      var dir     = newIdx > current ? -1 : 1;
      var leaving = panels[current];
      var entering = panels[newIdx];

      tabs[current].classList.remove('prog-tab--active');
      tabs[current].setAttribute('aria-selected', 'false');
      tabs[newIdx].classList.add('prog-tab--active');
      tabs[newIdx].setAttribute('aria-selected', 'true');
      current = newIdx;

      if (!window.gsap || noAnim) {
        leaving.hidden = true;
        entering.hidden = false;
        busy = false;
        return;
      }

      // Duck bounce sur le nouvel onglet actif
      var duck = tabs[newIdx].querySelector('.prog-tab__duck');
      if (duck) {
        gsap.fromTo(duck,
          { scale: 0, y: 10 },
          { scale: 1, y: 0, duration: 0.52, ease: 'back.out(2.2)' }
        );
      }

      gsap.to(leaving, {
        opacity: 0,
        x: dir * 38,
        scale: 0.97,
        duration: 0.22,
        ease: 'power3.in',
        onComplete: function () {
          leaving.hidden = true;
          gsap.set(leaving, { x: 0, opacity: 1, scale: 1 });

          entering.hidden = false;
          gsap.fromTo(entering,
            { opacity: 0, x: -dir * 38, scale: 0.97 },
            { opacity: 1, x: 0, scale: 1, duration: 0.32, ease: 'power3.out',
              onComplete: function () { busy = false; } }
          );

          var items = entering.querySelectorAll('.prog-block, .prog-prix');
          gsap.fromTo(items,
            { opacity: 0, y: 24, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.38, stagger: 0.07,
              ease: 'back.out(1.3)', delay: 0.08 }
          );
        }
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activate(parseInt(tab.getAttribute('data-idx'), 10));
        tab.focus();
      });

      tab.addEventListener('keydown', function (e) {
        var idx = parseInt(tab.getAttribute('data-idx'), 10);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          var next = (idx + 1) % tabs.length;
          tabs[next].focus();
          activate(next);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = (idx - 1 + tabs.length) % tabs.length;
          tabs[prev].focus();
          activate(prev);
        }
      });
    });
  }

  /* ──────────────────────────────────────────────────────
     Photo peek — image qui suit le curseur au survol des
     éléments [data-photo] dans la section programme
  ────────────────────────────────────────────────────── */
  function initProgPeek() {
    var peek    = document.querySelector('.prog-peek');
    var peekImg = peek ? peek.querySelector('.prog-peek__img') : null;
    if (!peek || !peekImg) return;

    var targets  = document.querySelectorAll('[data-photo]');
    var preloads = {};

    // Pré-charger toutes les images d'un coup
    targets.forEach(function (el) {
      var src = el.getAttribute('data-photo');
      if (src && !preloads[src]) {
        var img = new Image();
        img.src = src;
        preloads[src] = true;
      }
    });

    /* ── MOBILE : photo inline sous l'artiste / l'activité ── */
    if (!window.matchMedia('(hover: hover)').matches) {
      targets.forEach(function (el) {
        var isLineup    = el.classList.contains('prog-lineup');
        var isHighlight = el.classList.contains('prog-highlight--star');
        if (!isLineup && !isHighlight) return;
        var src = el.getAttribute('data-photo');
        if (!src) return;
        var img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.className = isLineup ? 'prog-lineup__mob-photo' : 'prog-highlight__mob-photo';
        img.loading = 'lazy';
        if (isLineup) {
          el.appendChild(img);
        } else {
          el.after(img); /* après le bloc highlight, pas dedans (flex-row) */
        }
      });
      return;
    }

    /* ── DESKTOP : hover → peek curseur ── */
    var cursorX = 0;
    var cursorY = 0;
    var visible = false;

    function hidePeek() {
      if (!visible) return;
      visible = false;
      gsap.to(peek, {
        opacity: 0,
        scale: 0.86,
        duration: 0.22,
        ease: 'power2.in',
        overwrite: 'auto'
      });
    }

    document.addEventListener('mousemove', function (e) {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (visible) {
        gsap.to(peek, {
          x: cursorX + 28,
          y: cursorY - 170,
          duration: 0.18,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });

    // Bug fix 1 : switching de tab sans mouseleave → force hide
    document.querySelectorAll('.prog-tab').forEach(function (tab) {
      tab.addEventListener('click', hidePeek);
    });

    // Bug fix 2 : curseur qui quitte la fenêtre
    document.addEventListener('mouseleave', hidePeek);

    targets.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        var src = el.getAttribute('data-photo');
        if (!src) return;
        visible = true;

        var rot = (Math.random() * 8) - 4;
        peekImg.src = src;
        gsap.set(peek, { x: cursorX + 28, y: cursorY - 170 });
        // Bug fix 3 : overwrite évite la race condition entre show et hide rapides
        gsap.fromTo(peek,
          { opacity: 0, scale: 0.82, rotation: rot - 6 },
          { opacity: 1, scale: 1, rotation: rot, duration: 0.38, ease: 'power3.out', overwrite: 'auto' }
        );
      });

      el.addEventListener('mouseleave', hidePeek);
    });
  }

  /* ──────────────────────────────────────────────────────
     Récap vidéo YouTube — embed au clic sur le play
  ────────────────────────────────────────────────────── */
  function initRecapVideo() {
    var container = document.querySelector('.recap-video');
    if (!container) return;
    var ytId = container.getAttribute('data-yt');
    if (!ytId) return;

    container.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.className    = 'recap-video__iframe';
      iframe.src          = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0&modestbranding=1';
      iframe.allow        = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.title        = 'Récap Afreecanard 2024';

      // Remplacer le contenu par l'iframe
      container.innerHTML = '';
      container.appendChild(iframe);
    }, { once: true });
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

  function initBodegasTilt() {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.bodega-card'));
    if (!cards.length || typeof gsap === 'undefined') return;

    // 1. Char split on names (desktop only — skip on touch for performance)
    if (!reducedMotion) {
      cards.forEach(function (card) {
        var nameEl = card.querySelector('.bodega-card__name');
        if (!nameEl) return;
        var text = nameEl.textContent;
        nameEl.textContent = '';
        text.split('').forEach(function (ch) {
          var s = document.createElement('span');
          s.className = 'bod-char';
          s.style.display = 'inline-block';
          s.textContent = ch === ' ' ? ' ' : ch;
          nameEl.appendChild(s);
        });
        gsap.set(nameEl.querySelectorAll('.bod-char'), { opacity: 0, y: 16 });
      });
    }

    // 2. Set initial hidden state for scroll entrance
    if (!reducedMotion) {
      cards.forEach(function (card) {
        gsap.set(card, { opacity: 0, y: 46 });
        var blason = card.querySelector('.bodega-card__blason');
        if (blason) gsap.set(blason, { opacity: 0, scale: 0, rotation: -18 });
        gsap.set(card.querySelectorAll('.bodega-tag'), { opacity: 0, scale: 0.72 });
      });
    }

    // 3. Scroll entrance via ScrollTrigger stagger
    cards.forEach(function (card, i) {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 86%',
        once: true,
        onEnter: function () {
          var d = i * 0.13;
          gsap.to(card, { opacity: 1, y: 0, duration: 0.72, ease: 'power3.out', delay: d });

          if (!reducedMotion) {
            // Chars cascade
            var chars = card.querySelectorAll('.bod-char');
            if (chars.length) {
              gsap.to(chars, { opacity: 1, y: 0, duration: 0.42, stagger: 0.027, ease: 'power3.out', delay: d + 0.22 });
            }
            // Blason pop
            var blason = card.querySelector('.bodega-card__blason');
            if (blason) {
              gsap.to(blason, { opacity: 1, scale: 1, rotation: 0, duration: 0.60, ease: 'back.out(2.4)', delay: d + 0.3 });
            }
            // Tags pop-in
            var tags = card.querySelectorAll('.bodega-tag');
            if (tags.length) {
              gsap.to(tags, { opacity: 1, scale: 1, duration: 0.32, stagger: 0.06, ease: 'back.out(1.8)', delay: d + 0.48 });
            }
          }
        }
      });
    });

    if (reducedMotion || !canHover) return;

    // 4. 3D Tilt + glow (desktop hover only)
    var GLOW = {
      foot:   { on: '0 28px 80px rgba(47,107,44,0.48), 0 0 0 3px rgba(47,107,44,0.55)',
                off: '0 14px 0 rgba(47,107,44,0.22)' },
      rugby:  { on: '0 28px 80px rgba(196,48,43,0.48), 0 0 0 3px rgba(196,48,43,0.55)',
                off: '0 14px 0 rgba(196,48,43,0.22)' },
      ancien: { on: '0 28px 80px rgba(217,154,28,0.48), 0 0 0 3px rgba(217,154,28,0.55)',
                off: '0 14px 0 rgba(217,154,28,0.22)' }
    };

    cards.forEach(function (card) {
      var type = card.classList.contains('bodega-card--foot') ? 'foot'
               : card.classList.contains('bodega-card--rugby') ? 'rugby' : 'ancien';
      var glow = GLOW[type];
      var blason = card.querySelector('.bodega-card__blason');

      card.addEventListener('mouseenter', function () {
        card.style.willChange = 'transform';
        gsap.to(card, { y: -8, boxShadow: glow.on, duration: 0.3, ease: 'power2.out' });
      });

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var dx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        var dy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        gsap.to(card, {
          rotationX: -dy * 9, rotationY: dx * 9, transformPerspective: 900,
          duration: 0.38, ease: 'power2.out', overwrite: 'auto'
        });
        if (blason) {
          gsap.to(blason, { x: dx * 14, y: dy * 8, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        }
      });

      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          rotationX: 0, rotationY: 0, y: 0, boxShadow: glow.off,
          duration: 0.65, ease: 'elastic.out(1, 0.75)', overwrite: 'auto',
          onComplete: function () { card.style.willChange = ''; }
        });
        if (blason) {
          gsap.to(blason, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.75)', overwrite: 'auto' });
        }
      });

      // Tag micro-hover
      card.querySelectorAll('.bodega-tag').forEach(function (tag) {
        tag.addEventListener('mouseenter', function () { gsap.to(tag, { y: -3, duration: 0.17, ease: 'power2.out' }); });
        tag.addEventListener('mouseleave', function () { gsap.to(tag, { y: 0, duration: 0.2, ease: 'power2.out' }); });
      });
    });
  }

  function initInfosAnim() {
    if (typeof gsap === 'undefined' || !window.ScrollTrigger) return;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.info-card'));
    if (!cards.length) return;

    // ── 1. Prep SVG stroke draw-on (dasharray = full length, offset = full length) ──
    cards.forEach(function (card) {
      card.querySelectorAll('.info-card__icon path, .info-card__icon line, .info-card__icon circle, .info-card__icon rect').forEach(function (el) {
        var len = el.getTotalLength ? Math.ceil(el.getTotalLength()) : 40;
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
      });
    });

    // ── Reduced motion: instant reveal, draw icons ──
    if (reducedMotion) {
      cards.forEach(function (card) {
        card.querySelectorAll('.info-card__icon path, .info-card__icon line, .info-card__icon circle, .info-card__icon rect').forEach(function (el) {
          el.style.strokeDashoffset = 0;
        });
      });
      return;
    }

    // ── 2. Set initial hidden states ──
    cards.forEach(function (card) {
      gsap.set(card, { opacity: 0, y: 48, scale: 0.94 });
      var title = card.querySelector('.info-card__title');
      var body  = card.querySelector('.info-card__tarifs') || card.querySelector('.info-card__desc');
      var perks = Array.prototype.slice.call(card.querySelectorAll('.info-perk'));
      if (title) gsap.set(title, { opacity: 0, y: 12 });
      if (body)  gsap.set(body,  { opacity: 0, y: 10 });
      if (perks.length) gsap.set(perks, { opacity: 0, x: -10 });
    });

    // ── 3. ScrollTrigger entrance — staggered cascade ──
    ScrollTrigger.create({
      trigger: '.infos__grid',
      start: 'top 80%',
      once: true,
      onEnter: function () {
        cards.forEach(function (card, i) {
          var d = i * 0.11;

          // Card body rises
          gsap.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.72, ease: 'power3.out', delay: d });

          // SVG draw-on
          var paths = Array.prototype.slice.call(card.querySelectorAll('.info-card__icon path, .info-card__icon line, .info-card__icon circle, .info-card__icon rect'));
          paths.forEach(function (el, pi) {
            gsap.to(el, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut', delay: d + 0.1 + pi * 0.07 });
          });

          // Title
          var title = card.querySelector('.info-card__title');
          if (title) gsap.to(title, { opacity: 1, y: 0, duration: 0.48, ease: 'power2.out', delay: d + 0.24 });

          // Body (desc or tarifs)
          var body = card.querySelector('.info-card__tarifs') || card.querySelector('.info-card__desc');
          if (body) gsap.to(body, { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out', delay: d + 0.36 });

          // Perks slide in from left (ENTRÉE card only)
          var perks = Array.prototype.slice.call(card.querySelectorAll('.info-perk'));
          if (perks.length) {
            gsap.to(perks, { opacity: 1, x: 0, duration: 0.34, stagger: 0.09, ease: 'power2.out', delay: d + 0.52 });
          }
        });
      }
    });

    if (!canHover) return;

    // ── 4. Hover: 3D tilt + yellow glow ring ──
    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.style.willChange = 'transform';
        gsap.to(card, {
          y: -9,
          boxShadow: '0 24px 56px rgba(16,26,70,0.38), 0 0 0 2.5px rgba(255,209,30,0.55)',
          duration: 0.28, ease: 'power2.out'
        });
        gsap.to(card.querySelector('.info-card__icon'), { opacity: 1, duration: 0.18 });
      });

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var dx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
        var dy = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
        gsap.to(card, {
          rotationX: -dy * 7, rotationY: dx * 7,
          transformPerspective: 900,
          duration: 0.32, ease: 'power2.out', overwrite: 'auto'
        });
      });

      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          rotationX: 0, rotationY: 0, y: 0,
          boxShadow: 'none',
          duration: 0.7, ease: 'elastic.out(1, 0.72)', overwrite: 'auto',
          onComplete: function () { card.style.willChange = ''; }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSmoothScroll();
    initHeroScroll();
    initHeroEntrance();
    initCountdown();
    initGallery();
    initReveal();
    initNav();
    initProgramme();
    initProgPeek();
    initRecapVideo();
    initFaq();
    initScrollProgress();
    initCardTilt();
    initParallax();
    initBodegasTilt();
    initInfosAnim();

    document.querySelectorAll('a[data-ig]').forEach(function (a) {
      a.href = IG_URL;
    });
  });
})();
