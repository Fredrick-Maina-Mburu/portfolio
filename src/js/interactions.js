/* ═══════════════════════════════════════════════
   FREDRICK MAINA PORTFOLIO — interactions.js
   Micro-interactions: hover states, CTA effects
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── PROJECT CARD KEYBOARD INTERACTION ──────── */
  function initProjectCards() {
    var cards = document.querySelectorAll('.project-card');
    cards.forEach(function (card) {
      // Pulse animation on focus (keyboard nav)
      card.addEventListener('focus', function () {
        card.style.animation = 'pulse-ring 600ms ease-out';
      });
      card.addEventListener('blur', function () {
        card.style.animation = '';
      });
    });
  }

  /* ── CERT CARDS ──────────────────────────────── */
  function initCertCards() {
    var certs = document.querySelectorAll('.cert-card');
    certs.forEach(function (cert) {
      cert.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cert.click();
        }
      });
    });
  }

  /* ── NAV LINK UNDERLINE SLIDE ────────────────── */
  function initNavLinks() {
    var links = document.querySelectorAll('.nav__link:not(.nav__link--cta)');
    links.forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        link.style.setProperty('--underline-w', '100%');
      });
      link.addEventListener('mouseleave', function () {
        if (!link.classList.contains('active')) {
          link.style.setProperty('--underline-w', '0%');
        }
      });
    });
  }

  /* ── TIMELINE CARD REVEAL ────────────────────── */
  function initTimelineHover() {
    var cards = document.querySelectorAll('.timeline__card');
    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        var dot = card.closest('.timeline__item').querySelector('.timeline__dot');
        if (dot) {
          dot.style.borderColor = 'var(--accent)';
          dot.style.boxShadow = '0 0 8px rgba(74,239,184,0.4)';
        }
      });
      card.addEventListener('mouseleave', function () {
        var dot = card.closest('.timeline__item').querySelector('.timeline__dot');
        if (dot && !dot.classList.contains('timeline__dot--active')) {
          dot.style.borderColor = '';
          dot.style.boxShadow = '';
        }
      });
    });
  }

  /* ── SKILL TAG HOVER RIPPLE ──────────────────── */
  function initTagHover() {
    var tags = document.querySelectorAll('.tag--accent');
    tags.forEach(function (tag) {
      tag.addEventListener('mouseenter', function () {
        tag.style.transform = 'translateY(-1px)';
        tag.style.boxShadow = '0 4px 12px rgba(74,239,184,0.15)';
      });
      tag.addEventListener('mouseleave', function () {
        tag.style.transform = '';
        tag.style.boxShadow = '';
      });
    });
  }

  /* ── ABOUT LINK HOVER ────────────────────────── */
  function initAboutLinks() {
    var links = document.querySelectorAll('.about__link');
    links.forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        link.style.transform = 'translateX(3px)';
      });
      link.addEventListener('mouseleave', function () {
        link.style.transform = '';
      });
    });
  }

  /* ── CONSTELLATION TOOLTIP POSITION ──────────── */
  function initTooltipBounds() {
    var tooltip = document.getElementById('constellation-tooltip');
    var wrap = document.querySelector('.constellation-wrap');
    if (!tooltip || !wrap) return;

    // Ensure tooltip stays within wrap bounds
    var observer = new MutationObserver(function () {
      if (!tooltip.hidden) {
        var wrapRect = wrap.getBoundingClientRect();
        var tipRect = tooltip.getBoundingClientRect();
        if (tipRect.right > wrapRect.right - 8) {
          tooltip.style.left = (parseFloat(tooltip.style.left) - tipRect.width - 24) + 'px';
        }
      }
    });
    observer.observe(tooltip, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ── INIT ─────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initProjectCards();
    initCertCards();
    initNavLinks();
    initTimelineHover();
    initTagHover();
    initAboutLinks();
    initTooltipBounds();
  });

  /* ── EXPORTS for testing ───────────────────── */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      initProjectCards: initProjectCards,
      initCertCards: initCertCards,
      initTagHover: initTagHover,
    };
  }

})();
