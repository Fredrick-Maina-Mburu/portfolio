/**
 * tests/chart.test.js
 * Unit tests for the Impact Constellation chart
 */

// ── NODE DATA STRUCTURE TESTS ─────────────────────
describe('Constellation Node Data', function() {
  var NODES = [
    { id: 0, type: 'role', label: 'KRA Intern', radius: 22, color: '#4AEFB8' },
    { id: 1, type: 'role', label: 'Data Analytics', radius: 20, color: '#4AEFB8' },
    { id: 2, type: 'role', label: 'ML Trainee', radius: 18, color: '#2DD4BF' },
    { id: 3, type: 'role', label: 'Dev & QA', radius: 18, color: '#2DD4BF' },
    { id: 4, type: 'metric', label: '95% accuracy', parent: 0, radius: 13, color: '#F5A623', value: 95 },
    { id: 5, type: 'metric', label: '20+ daily customers interactions', parent: 0, radius: 11, color: '#F5A623', value: 50 },
    { id: 6, type: 'metric', label: '30% fewer queries', parent: 0, radius: 10, color: '#F5A623', value: 30 },
    { id: 7, type: 'metric', label: '40% faster queries', parent: 1, radius: 13, color: '#F5A623', value: 40 },
    { id: 8, type: 'metric', label: '4 dashboards', parent: 1, radius: 11, color: '#F5A623', value: 4 },
    { id: 9, type: 'metric', label: '>85% accuracy', parent: 2, radius: 12, color: '#F5A623', value: 85 },
    { id: 10, type: 'metric', label: '90% test coverage', parent: 3, radius: 14, color: '#F5A623', value: 90 },
    { id: 11, type: 'metric', label: '35% faster DB', parent: 3, radius: 12, color: '#F5A623', value: 35 },
    { id: 12, type: 'metric', label: '20% fewer errors', parent: 3, radius: 10, color: '#F5A623', value: 20 },
  ];

  test('has exactly 4 role nodes', function() {
    var roles = NODES.filter(function(n) { return n.type === 'role'; });
    expect(roles.length).toBe(4);
  });

  test('has metric nodes with parent references', function() {
    var metrics = NODES.filter(function(n) { return n.type === 'metric'; });
    expect(metrics.length).toBeGreaterThan(0);
    metrics.forEach(function(m) {
      expect(m.parent).toBeDefined();
      expect(typeof m.parent).toBe('number');
    });
  });

  test('all metric parent references point to valid role nodes', function() {
    var roleIds = NODES
      .filter(function(n) { return n.type === 'role'; })
      .map(function(n) { return n.id; });

    var metrics = NODES.filter(function(n) { return n.type === 'metric'; });
    metrics.forEach(function(m) {
      expect(roleIds).toContain(m.parent);
    });
  });

  test('all nodes have required properties', function() {
    NODES.forEach(function(node) {
      expect(node.id).toBeDefined();
      expect(node.type).toBeDefined();
      expect(node.label).toBeDefined();
      expect(node.radius).toBeGreaterThan(0);
      expect(node.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  test('metric values are positive numbers', function() {
    var metrics = NODES.filter(function(n) { return n.type === 'metric'; });
    metrics.forEach(function(m) {
      if (m.value !== undefined) {
        expect(m.value).toBeGreaterThan(0);
      }
    });
  });
});

// ── NODE LAYOUT TESTS ─────────────────────────────
describe('Node Layout', function() {
  function layoutNodes(nodes, cx, cy, scale) {
    scale = scale || 1;
    var rolePositions = [
      { x: cx, y: cy - 120 * scale },
      { x: cx - 120 * scale, y: cy + 50 * scale },
      { x: cx + 110 * scale, y: cy + 60 * scale },
      { x: cx, y: cy + 150 * scale },
    ];

    var roleIndex = 0;
    nodes.forEach(function(node) {
      if (node.type === 'role') {
        var pos = rolePositions[roleIndex++];
        node.x = pos.x;
        node.y = pos.y;
        node.vx = 0;
        node.vy = 0;
      }
    });

    nodes.forEach(function(node) {
      if (node.type === 'metric') {
        var parent = nodes[node.parent];
        var angle = Math.PI / 4;
        var dist = 65 * scale;
        node.x = parent.x + Math.cos(angle) * dist;
        node.y = parent.y + Math.sin(angle) * dist;
        node.vx = 0;
        node.vy = 0;
        node.orbitAngle = angle;
        node.orbitSpeed = 0.001;
        node.orbitRadius = dist;
      }
    });

    return nodes;
  }

  var baseNodes = [
    { id: 0, type: 'role', label: 'KRA', radius: 22 },
    { id: 1, type: 'role', label: 'Analytics', radius: 20 },
    { id: 2, type: 'role', label: 'ML', radius: 18 },
    { id: 3, type: 'role', label: 'Dev', radius: 18 },
    { id: 4, type: 'metric', label: '95%', parent: 0, radius: 13, value: 95 },
  ];

  test('role nodes get assigned x,y positions', function() {
    var nodes = JSON.parse(JSON.stringify(baseNodes));
    layoutNodes(nodes, 260, 260, 1);
    var roles = nodes.filter(function(n) { return n.type === 'role'; });
    roles.forEach(function(r) {
      expect(typeof r.x).toBe('number');
      expect(typeof r.y).toBe('number');
    });
  });

  test('metric nodes are placed relative to parent', function() {
    var nodes = JSON.parse(JSON.stringify(baseNodes));
    layoutNodes(nodes, 260, 260, 1);
    var metric = nodes[4];
    var parent = nodes[0];
    var dx = metric.x - parent.x;
    var dy = metric.y - parent.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    expect(dist).toBeGreaterThan(40);
    expect(dist).toBeLessThan(120);
  });

  test('layout scales proportionally with scale factor', function() {
    var nodes1 = JSON.parse(JSON.stringify(baseNodes));
    var nodes2 = JSON.parse(JSON.stringify(baseNodes));
    layoutNodes(nodes1, 260, 260, 1);
    layoutNodes(nodes2, 260, 260, 0.5);

    var role1 = nodes1.find(function(n) { return n.type === 'role' && n.id === 0; });
    var role2 = nodes2.find(function(n) { return n.type === 'role' && n.id === 0; });

    // Distance from center should be halved
    var dist1 = Math.abs(role1.y - 260);
    var dist2 = Math.abs(role2.y - 260);
    expect(dist2).toBeCloseTo(dist1 * 0.5, 0);
  });
});

// ── EDGE WEIGHT CALCULATION ───────────────────────
describe('Edge Weight Rendering', function() {
  test('edge alpha increases with higher value', function() {
    function edgeAlpha(value) {
      return Math.min(0.35, 0.1 + value * 0.003);
    }

    expect(edgeAlpha(95)).toBeGreaterThan(edgeAlpha(20));
    expect(edgeAlpha(100)).toBeLessThanOrEqual(0.35);
    expect(edgeAlpha(0)).toBeCloseTo(0.1, 2);
  });

  test('edge lineWidth caps at maximum', function() {
    function edgeWidth(value) {
      return Math.min(2, 0.5 + value * 0.01);
    }

    expect(edgeWidth(200)).toBe(2);
    expect(edgeWidth(0)).toBeCloseTo(0.5, 2);
    expect(edgeWidth(95)).toBeLessThanOrEqual(2);
  });
});

// ── ORBIT ANIMATION TESTS ─────────────────────────
describe('Orbit Animation', function() {
  test('orbit position updates correctly each tick', function() {
    var node = {
      orbitAngle: 0,
      orbitSpeed: 0.01,
      orbitRadius: 65,
      x: 0,
      y: 0,
    };
    var parent = { x: 260, y: 260 };

    // Simulate one tick
    node.orbitAngle += node.orbitSpeed;
    node.x = parent.x + Math.cos(node.orbitAngle) * node.orbitRadius;
    node.y = parent.y + Math.sin(node.orbitAngle) * node.orbitRadius;

    var dx = node.x - parent.x;
    var dy = node.y - parent.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    expect(dist).toBeCloseTo(65, 0);
  });

  test('orbit radius stays constant over multiple ticks', function() {
    var node = { orbitAngle: 0, orbitSpeed: 0.05, orbitRadius: 80 };
    var parent = { x: 200, y: 200 };

    for (var i = 0; i < 100; i++) {
      node.orbitAngle += node.orbitSpeed;
      node.x = parent.x + Math.cos(node.orbitAngle) * node.orbitRadius;
      node.y = parent.y + Math.sin(node.orbitAngle) * node.orbitRadius;

      var dx = node.x - parent.x;
      var dy = node.y - parent.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeCloseTo(80, 5);
    }
  });
});
