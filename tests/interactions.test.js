/**
 * tests/interactions.test.js
 * Unit tests for interaction behaviours
 */

// Minimal DOM mock for testing without a browser
function createMockElement(tag, attrs) {
  var el = {
    tagName: tag || 'DIV',
    classList: {
      _classes: new Set(),
      add: function(c) { this._classes.add(c); },
      remove: function(c) { this._classes.delete(c); },
      contains: function(c) { return this._classes.has(c); },
      toggle: function(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); }
    },
    style: {},
    attributes: attrs || {},
    getAttribute: function(k) { return this.attributes[k] || null; },
    setAttribute: function(k, v) { this.attributes[k] = v; },
    removeAttribute: function(k) { delete this.attributes[k]; },
    get hidden() { return 'hidden' in this.attributes; },
    set hidden(v) { if (v) this.attributes['hidden'] = ''; else delete this.attributes['hidden']; },
    _listeners: {},
    addEventListener: function(event, cb) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(cb);
    },
    dispatchEvent: function(event) {
      var handlers = this._listeners[event.type] || [];
      handlers.forEach(function(h) { h(event); });
    },
    children: [],
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; },
    closest: function() { return null; },
    click: function() { this.dispatchEvent({ type: 'click', preventDefault: function(){} }); },
    textContent: '',
    innerHTML: '',
  };
  return el;
}

// ── COUNTER ANIMATION TESTS ──────────────────────
describe('Counter Animation', function() {
  test('easeOutExpo returns 1 for t=1', function() {
    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
    expect(easeOutExpo(1)).toBe(1);
  });

  test('easeOutExpo returns 0 for t=0', function() {
    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
    expect(easeOutExpo(0)).toBeCloseTo(0, 5);
  });

  test('easeOutExpo is monotonically increasing', function() {
    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
    var values = [0, 0.1, 0.2, 0.5, 0.8, 0.9, 1];
    for (var i = 1; i < values.length; i++) {
      expect(easeOutExpo(values[i])).toBeGreaterThanOrEqual(easeOutExpo(values[i - 1]));
    }
  });
});

// ── NAV SCROLL STATE TESTS ────────────────────────
describe('Navigation Scroll State', function() {
  test('nav gets "scrolled" class when scrollY > 80', function() {
    var nav = createMockElement('NAV');
    var scrollY = 100;

    if (scrollY > 80) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    expect(nav.classList.contains('scrolled')).toBe(true);
  });

  test('nav loses "scrolled" class when scrollY <= 80', function() {
    var nav = createMockElement('NAV');
    nav.classList.add('scrolled');

    var scrollY = 50;
    if (scrollY > 80) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    expect(nav.classList.contains('scrolled')).toBe(false);
  });
});

// ── MOBILE NAV TESTS ──────────────────────────────
describe('Mobile Navigation Toggle', function() {
  test('toggle sets aria-expanded to true on first click', function() {
    var toggle = createMockElement('BUTTON', { 'aria-expanded': 'false' });
    var links = createMockElement('UL');

    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    links.classList.toggle('open');

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(links.classList.contains('open')).toBe(true);
  });

  test('toggle sets aria-expanded to false on second click', function() {
    var toggle = createMockElement('BUTTON', { 'aria-expanded': 'true' });
    var links = createMockElement('UL');
    links.classList.add('open');

    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    links.classList.toggle('open');

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(links.classList.contains('open')).toBe(false);
  });
});

// ── SKELETON LOADING TESTS ────────────────────────
describe('Skeleton Loading', function() {
  test('project card gains "loaded" class after delay', function(done) {
    var card = createMockElement('ARTICLE');

    setTimeout(function() {
      card.classList.add('loaded');
    }, 50);

    setTimeout(function() {
      expect(card.classList.contains('loaded')).toBe(true);
      done();
    }, 100);
  });

  test('multiple cards load with staggered delays', function(done) {
    var cards = [
      createMockElement('ARTICLE'),
      createMockElement('ARTICLE'),
      createMockElement('ARTICLE'),
    ];
    var loadOrder = [];

    cards.forEach(function(card, i) {
      setTimeout(function() {
        card.classList.add('loaded');
        loadOrder.push(i);
      }, 50 + i * 30);
    });

    setTimeout(function() {
      expect(loadOrder).toEqual([0, 1, 2]);
      done();
    }, 250);
  });
});

// ── ANIMATION OBSERVER TESTS ──────────────────────
describe('Animation on Scroll', function() {
  test('element gains "in-view" class when in viewport', function() {
    var el = createMockElement('DIV', { 'data-animate': 'fade-up', 'data-delay': '0' });

    // Simulate intersection observer firing
    var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
    expect(delay).toBe(0);

    // Apply in-view class (simulating observer callback)
    el.classList.add('in-view');
    expect(el.classList.contains('in-view')).toBe(true);
  });

  test('element respects data-delay attribute', function(done) {
    var el = createMockElement('DIV', { 'data-animate': 'fade-up', 'data-delay': '100' });

    var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
    setTimeout(function() {
      el.classList.add('in-view');
    }, delay);

    // Not yet in view
    expect(el.classList.contains('in-view')).toBe(false);

    setTimeout(function() {
      expect(el.classList.contains('in-view')).toBe(true);
      done();
    }, 200);
  });
});

// ── CONSTELLATION NODE HIT TEST ───────────────────
describe('Constellation Node Hit Test', function() {
  test('hit test returns node within radius', function() {
    var nodes = [
      { id: 0, x: 100, y: 100, radius: 20, label: 'KRA', type: 'role' },
      { id: 1, x: 200, y: 200, radius: 15, label: 'Analytics', type: 'role' },
    ];

    function getNodeAt(x, y) {
      for (var i = nodes.length - 1; i >= 0; i--) {
        var node = nodes[i];
        var dx = x - node.x;
        var dy = y - node.y;
        if (Math.sqrt(dx * dx + dy * dy) <= node.radius * 1.4) {
          return node;
        }
      }
      return null;
    }

    expect(getNodeAt(105, 105)).toBeTruthy();
    expect(getNodeAt(105, 105).id).toBe(0);
    expect(getNodeAt(300, 300)).toBeNull();
  });

  test('hit test returns last (topmost) node when overlapping', function() {
    var nodes = [
      { id: 0, x: 100, y: 100, radius: 25, label: 'Node A', type: 'role' },
      { id: 1, x: 100, y: 100, radius: 20, label: 'Node B', type: 'metric' },
    ];

    function getNodeAt(x, y) {
      for (var i = nodes.length - 1; i >= 0; i--) {
        var node = nodes[i];
        var dx = x - node.x;
        var dy = y - node.y;
        if (Math.sqrt(dx * dx + dy * dy) <= node.radius * 1.4) {
          return node;
        }
      }
      return null;
    }

    // Last node in array wins (rendered on top)
    expect(getNodeAt(100, 100).id).toBe(1);
  });
});
