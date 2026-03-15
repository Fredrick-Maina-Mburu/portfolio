/* ═══════════════════════════════════════════════
   FREDRICK MAINA PORTFOLIO — main.js
   Navigation, scroll effects, animations, counters
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── SCROLL PROGRESS BAR ──────────────────── */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);

    function updateProgress() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.transform = 'scaleX(' + progress + ')';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  /* ── NAVIGATION SCROLL STATE ──────────────── */
  function initNavScroll() {
    var nav = document.querySelector('.nav');
    if (!nav) return;

    function onScroll() {
      if (window.scrollY > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── ACTIVE NAV LINKS ─────────────────────── */
  function initActiveNav() {
    var links = document.querySelectorAll('.nav__link[href^="#"]');
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) sections.push({ link: link, section: section });
    });

    function onScroll() {
      var scrollY = window.scrollY + 120;
      var current = null;

      sections.forEach(function (item) {
        if (item.section.offsetTop <= scrollY) {
          current = item;
        }
      });

      links.forEach(function (link) { link.classList.remove('active'); });
      if (current) current.link.classList.add('active');
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── MOBILE NAV TOGGLE ────────────────────── */
  function initMobileNav() {
    var toggle = document.querySelector('.nav__toggle');
    var links = document.querySelector('.nav__links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      links.classList.toggle('open');
    });

    // Close on link click
    links.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      }
    });
  }

  /* ── INTERSECTION OBSERVER ANIMATIONS ─────── */
  function initAnimations() {
    var elements = document.querySelectorAll('[data-animate]');
    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(function () {
            el.classList.add('in-view');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ── ANIMATED COUNTERS ────────────────────── */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el, target, duration) {
    var start = null;
    var startVal = 0;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = easeOutExpo(progress);
      el.textContent = Math.round(startVal + (target - startVal) * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-count'), 10);
          animateCounter(el, target, 1800);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ── SKELETON LOADERS ─────────────────────── */
  function initSkeletons() {
    // Simulate async content loading with a short delay
    var cards = document.querySelectorAll('.project-card');
    cards.forEach(function (card, i) {
      setTimeout(function () {
        card.classList.add('loaded');
      }, 200 + i * 80);
    });
  }

  /* ── SMOOTH SCROLL FOR ANCHOR LINKS ──────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update URL without jumping
          history.pushState(null, '', this.getAttribute('href'));
        }
      });
    });
  }

  /* ── KEYBOARD NAVIGATION FOR CARDS ──────── */
  function initCardKeyboard() {
    var cards = document.querySelectorAll('.project-card[tabindex]');
    cards.forEach(function (card) {
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  /* ── INIT ALL ─────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollProgress();
    initNavScroll();
    initActiveNav();
    initMobileNav();
    initAnimations();
    initCounters();
    initSkeletons();
    initSmoothScroll();
    initCardKeyboard();
  });

})();
