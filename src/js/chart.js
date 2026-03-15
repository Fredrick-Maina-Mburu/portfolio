/* ═══════════════════════════════════════════════
   FREDRICK MAINA PORTFOLIO — chart.js
   Impact Constellation — force-directed graph
   showing roles as nodes and impact metrics
   as satellite nodes with weighted edges
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── DATA ─────────────────────────────────── */
  var NODES = [
    // Core role nodes
    { id: 0, type: 'role', label: 'KRA Intern', x: 0, y: 0, radius: 22, color: '#4AEFB8' },
    { id: 1, type: 'role', label: 'Data Analytics', x: 0, y: 0, radius: 20, color: '#4AEFB8' },
    { id: 2, type: 'role', label: 'ML Trainee', x: 0, y: 0, radius: 18, color: '#2DD4BF' },
    { id: 3, type: 'role', label: 'Dev & QA', x: 0, y: 0, radius: 18, color: '#2DD4BF' },

    // Metric satellite nodes
    { id: 4, type: 'metric', label: '95% accuracy', parent: 0, x: 0, y: 0, radius: 13, color: '#F5A623', value: 95 },
    { id: 5, type: 'metric', label: '20+ daily\ncustomers interactions', parent: 0, x: 0, y: 0, radius: 11, color: '#F5A623', value: 50 },
    { id: 6, type: 'metric', label: '30% fewer\nrepeat queries', parent: 0, x: 0, y: 0, radius: 10, color: '#F5A623', value: 30 },

    { id: 7, type: 'metric', label: '40% faster\nqueries', parent: 1, x: 0, y: 0, radius: 13, color: '#F5A623', value: 40 },
    { id: 8, type: 'metric', label: '4 dashboards', parent: 1, x: 0, y: 0, radius: 11, color: '#F5A623', value: 4 },

    { id: 9, type: 'metric', label: '>85% model\naccuracy', parent: 2, x: 0, y: 0, radius: 12, color: '#F5A623', value: 85 },

    { id: 10, type: 'metric', label: '90% test\ncoverage', parent: 3, x: 0, y: 0, radius: 14, color: '#F5A623', value: 90 },
    { id: 11, type: 'metric', label: '35% faster\nDB queries', parent: 3, x: 0, y: 0, radius: 12, color: '#F5A623', value: 35 },
    { id: 12, type: 'metric', label: '20% fewer\nproduction errors', parent: 3, x: 0, y: 0, radius: 10, color: '#F5A623', value: 20 },
  ];

  /* ── INITIAL LAYOUT ──────────────────────── */
  function layoutNodes(cx, cy, scale) {
    scale = scale || 1;
    // Role nodes in a diamond pattern
    var rolePositions = [
      { x: cx, y: cy - 120 * scale },          // top: KRA
      { x: cx - 120 * scale, y: cy + 50 * scale },  // left: Analytics
      { x: cx + 110 * scale, y: cy + 60 * scale },   // right: ML
      { x: cx, y: cy + 150 * scale },           // bottom: Dev
    ];

    NODES.forEach(function (node, i) {
      if (node.type === 'role') {
        var pos = rolePositions[i];
        node.x = pos.x;
        node.y = pos.y;
        node.vx = 0;
        node.vy = 0;
      }
    });

    // Metric satellites orbit their parent
    NODES.forEach(function (node) {
      if (node.type === 'metric') {
        var parent = NODES[node.parent];
        var angle = Math.random() * Math.PI * 2;
        var dist = 65 * scale + Math.random() * 20 * scale;
        node.x = parent.x + Math.cos(angle) * dist;
        node.y = parent.y + Math.sin(angle) * dist;
        node.vx = 0;
        node.vy = 0;
        node.orbitAngle = angle;
        node.orbitSpeed = (Math.random() * 0.002 + 0.001) * (Math.random() > 0.5 ? 1 : -1);
        node.orbitRadius = dist;
      }
    });
  }

  /* ── STATE ────────────────────────────────── */
  var canvas, ctx, animId;
  var hoveredNode = null;
  var loadProgress = 0;
  var startTime = null;

  /* ── DRAW EDGE ────────────────────────────── */
  function drawEdge(a, b, weight) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    var alpha = Math.min(0.35, 0.1 + weight * 0.003);
    ctx.strokeStyle = 'rgba(74,239,184,' + alpha + ')';
    ctx.lineWidth = Math.min(2, 0.5 + weight * 0.01);
    ctx.stroke();
  }

  /* ── DRAW NODE ────────────────────────────── */
  function drawNode(node, isHovered) {
    var scale = isHovered ? 1.3 : 1;
    var r = node.radius * scale;

    // Glow for hovered
    if (isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74,239,184,0.08)';
      ctx.fill();
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);

    if (node.type === 'role') {
      ctx.fillStyle = isHovered ? node.color : 'rgba(74,239,184,0.12)';
      ctx.fill();
      ctx.strokeStyle = node.color;
      ctx.lineWidth = isHovered ? 2 : 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = isHovered ? 'rgba(245,166,35,0.25)' : 'rgba(245,166,35,0.1)';
      ctx.fill();
      ctx.strokeStyle = isHovered ? node.color : 'rgba(245,166,35,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Label
    if (node.type === 'role' || isHovered) {
      ctx.font = node.type === 'role'
        ? 'bold ' + Math.max(9, 10 * scale) + 'px "Space Mono", monospace'
        : Math.max(7, 8 * scale) + 'px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = node.type === 'role' ? (isHovered ? '#0A0C0F' : '#4AEFB8') : '#F5A623';

      var lines = node.label.split('\n');
      var lineH = node.type === 'role' ? 13 : 10;
      var startY = node.y - (lines.length - 1) * lineH / 2;
      lines.forEach(function (line, i) {
        ctx.fillText(line, node.x, startY + i * lineH);
      });
    }
  }

  /* ── ANIMATION TICK ──────────────────────── */
  function tick(timestamp) {
    if (!startTime) startTime = timestamp;
    var elapsed = timestamp - startTime;

    // Fade in
    loadProgress = Math.min(1, elapsed / 800);

    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.globalAlpha = loadProgress;

    // Orbit metric nodes around parents
    NODES.forEach(function (node) {
      if (node.type === 'metric') {
        node.orbitAngle += node.orbitSpeed;
        var parent = NODES[node.parent];
        node.x = parent.x + Math.cos(node.orbitAngle) * node.orbitRadius;
        node.y = parent.y + Math.sin(node.orbitAngle) * node.orbitRadius;
      }
    });

    // Draw edges
    NODES.forEach(function (node) {
      if (node.type === 'metric') {
        var parent = NODES[node.parent];
        drawEdge(parent, node, node.value || 20);
      }
    });

    // Draw role-to-role connections (faint)
    var roleNodes = NODES.filter(function (n) { return n.type === 'role'; });
    for (var i = 0; i < roleNodes.length; i++) {
      for (var j = i + 1; j < roleNodes.length; j++) {
        ctx.beginPath();
        ctx.moveTo(roleNodes[i].x, roleNodes[i].y);
        ctx.lineTo(roleNodes[j].x, roleNodes[j].y);
        ctx.strokeStyle = 'rgba(74,239,184,0.06)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw metric nodes first (below roles)
    NODES.forEach(function (node) {
      if (node.type === 'metric') {
        drawNode(node, hoveredNode === node);
      }
    });

    // Draw role nodes on top
    NODES.forEach(function (node) {
      if (node.type === 'role') {
        drawNode(node, hoveredNode === node);
      }
    });

    ctx.globalAlpha = 1;

    if (loadProgress >= 1) {
      canvas.classList.add('loaded');
    }

    animId = requestAnimationFrame(tick);
  }

  /* ── HIT TEST ─────────────────────────────── */
  function getNodeAt(x, y) {
    var scale = canvas.width / canvas.offsetWidth;
    var cx = x * scale;
    var cy = y * scale;

    for (var i = NODES.length - 1; i >= 0; i--) {
      var node = NODES[i];
      var dx = cx - node.x;
      var dy = cy - node.y;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius * 1.4) {
        return node;
      }
    }
    return null;
  }

  /* ── TOOLTIP ──────────────────────────────── */
  var tooltipEl;
  function showTooltip(node, x, y) {
    if (!tooltipEl) return;
    var descriptions = {
      0: 'Kenya Revenue Authority — 95% data accuracy, 20+ daily interactions',
      1: 'Teach2Give — Built 4 live dashboards adopted as primary reporting tools',
      2: 'SKIES Program — ML models with >85% accuracy on 3 team projects',
      3: 'Full-Stack Dev — 90% test coverage, 35% faster DB query processing',
    };
    tooltipEl.innerHTML = node.type === 'role'
      ? '<strong>' + node.label + '</strong>' + (descriptions[node.id] || '')
      : '<strong>' + node.label + '</strong>';
    tooltipEl.style.left = (x + 16) + 'px';
    tooltipEl.style.top = (y - 16) + 'px';
    tooltipEl.removeAttribute('hidden');
  }
  function hideTooltip() {
    if (tooltipEl) tooltipEl.setAttribute('hidden', '');
  }

  /* ── EVENTS ──────────────────────────────── */
  function attachEvents() {
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var node = getNodeAt(x, y);
      hoveredNode = node;
      canvas.style.cursor = node ? 'pointer' : 'default';
      if (node) {
        showTooltip(node, e.clientX - rect.left + canvas.offsetLeft, e.clientY - rect.top + canvas.offsetTop);
      } else {
        hideTooltip();
      }
    });

    canvas.addEventListener('mouseleave', function () {
      hoveredNode = null;
      hideTooltip();
      canvas.style.cursor = 'default';
    });

    // Touch support
    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      var touch = e.touches[0];
      var rect = canvas.getBoundingClientRect();
      var x = touch.clientX - rect.left;
      var y = touch.clientY - rect.top;
      hoveredNode = getNodeAt(x, y);
    }, { passive: false });

    canvas.addEventListener('touchend', function () {
      hoveredNode = null;
    });
  }

  /* ── RESIZE ──────────────────────────────── */
  function resizeCanvas() {
    var wrap = canvas.parentElement;
    var size = Math.min(wrap.offsetWidth, 520);
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    layoutNodes(size / 2, size / 2, size / 520);
  }

  /* ── INIT ────────────────────────────────── */
  function init() {
    canvas = document.getElementById('constellation');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    tooltipEl = document.getElementById('constellation-tooltip');

    resizeCanvas();
    attachEvents();

    // Observe and start when in viewport
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!animId) animId = requestAnimationFrame(tick);
        } else {
          if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
            startTime = null;
          }
        }
      });
    }, { threshold: 0.1 });

    observer.observe(canvas);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        startTime = null;
        loadProgress = 0;
        resizeCanvas();
      }, 200);
    });
  }

  document.addEventListener('DOMContentLoaded', init);

})();
