(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- shared sample data ---------- */
  var EVENTS = [
    ['Credential stuffing', 'Blocked'],
    ['Phishing link at click time', 'Blocked'],
    ['Impossible-travel sign-in', 'Challenged'],
    ['Session token replay', 'Blocked'],
    ['Password spray across 41 accounts', 'Blocked'],
    ['Malicious attachment', 'Quarantined'],
    ['New device from a risky network', 'Challenged'],
    ['Brute force on admin login', 'Blocked']
  ];
  var NETS = ['192.0.2.', '198.51.100.', '203.0.113.'];
  var CLS = { Blocked: 'blocked', Challenged: 'challenged', Quarantined: 'quar' };
  var rnd = function (n) { return Math.floor(Math.random() * n); };
  var ip = function () { return NETS[rnd(3)] + (1 + rnd(254)); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var stamp = function (d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
  var fmt = function (n) { return n.toLocaleString('en-US'); };

  /* ---------- live feed + hero chips ---------- */
  var rowsEl = $('#feedRows');
  var counts = { screened: 48215, Blocked: 1902, Challenged: 377 };
  function makeRow(ev, act, addr, time) {
    var r = document.createElement('div');
    r.className = 'row';
    [['t', time], ['ev', ev], ['ip', addr]].forEach(function (p) {
      var s = document.createElement('span');
      s.className = p[0]; s.textContent = p[1]; r.appendChild(s);
    });
    var a = document.createElement('span');
    a.className = 'act ' + CLS[act]; a.textContent = act; r.appendChild(a);
    return r;
  }
  (function seed() {
    var now = Date.now();
    for (var i = 0; i < 7; i++) {
      var e = EVENTS[(i * 3 + 1) % EVENTS.length];
      var row = makeRow(e[0], e[1], ip(), stamp(new Date(now - i * 2300)));
      row.style.animation = 'none';
      rowsEl.appendChild(row);
    }
  })();
  function bump() {
    $('#cScreened').textContent = fmt(counts.screened);
    $('#cBlocked').textContent = fmt(counts.Blocked);
    $('#cChallenged').textContent = fmt(counts.Challenged);
  }
  function tickFeed() {
    var e = EVENTS[rnd(EVENTS.length)];
    rowsEl.insertBefore(makeRow(e[0], e[1], ip(), stamp(new Date())), rowsEl.firstChild);
    while (rowsEl.children.length > 7) rowsEl.removeChild(rowsEl.lastChild);
    counts.screened += 20 + rnd(40);
    if (counts[e[1]] !== undefined) counts[e[1]] += 1;
    bump();
  }
  function setChip(id, wantBlocked) {
    var pool = EVENTS.filter(function (e) { return wantBlocked ? e[1] === 'Blocked' : e[1] !== 'Blocked'; });
    var e = pool[rnd(pool.length)];
    var chip = document.getElementById(id);
    chip.setAttribute('data-act', CLS[e[1]]);
    $('.chip-t', chip).textContent = e[1] + ' · ' + e[0].charAt(0).toLowerCase() + e[0].slice(1);
    $('.chip-m', chip).textContent = ip();
  }
  setInterval(tickFeed, reduce ? 5000 : 1900);
  setInterval(function () { setChip('chipA', true); }, 3400);
  setInterval(function () { setChip('chipB', false); }, 4300);

  /* ---------- tilt cards ---------- */
  if (fine && !reduce) {
    $$('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', ((px - 0.5) * 10).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - py) * 8).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- defence stack ---------- */
  var layerBtns = $$('.layer-btn'), layers = $$('.layer');
  function setLayer(k) {
    layerBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-k') === k)); });
    layers.forEach(function (l) { l.classList.toggle('on', l.getAttribute('data-k') === k); });
  }
  layerBtns.forEach(function (b) {
    var k = b.getAttribute('data-k');
    b.addEventListener('click', function () { setLayer(k); });
    b.addEventListener('mouseenter', function () { if (fine) setLayer(k); });
    b.addEventListener('focus', function () { setLayer(k); });
  });
  setLayer('edge');
  var sw = $('#stageWrap'), stage = $('#stage');
  if (fine && !reduce && sw && stage) {
    sw.addEventListener('pointermove', function (e) {
      var r = sw.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty('--tz', (px * 24).toFixed(1) + 'deg');
      stage.style.setProperty('--tx', (py * -10).toFixed(1) + 'deg');
    });
    sw.addEventListener('pointerleave', function () {
      stage.style.setProperty('--tz', '0deg'); stage.style.setProperty('--tx', '0deg');
    });
  }

  /* ---------- password check ---------- */
  var DICT = ['password','passw0rd','welcome','summer','winter','spring','autumn','dragon','monkey','football','baseball','letmein','admin','login','master','iloveyou','qwerty','trustno1','sunshine','princess','shadow','superman','batman','changeme','secret','hello','freedom','whatever','computer','internet','starwars','google','charlie','donald','test','guest','user'];
  var LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's', '!': 'i', '|': 'l' };
  function analyze(pw) {
    var chars = Array.from(pw), len = chars.length;
    if (!len) return { len: 0, pool: 0, bits: 0, flags: {} };
    var pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/[0-9]/.test(pw)) pool += 10;
    if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
    var per = Math.log2(pool || 2);
    var norm = chars.map(function (c) { return LEET[c] || c.toLowerCase(); });
    var joined = norm.join('');
    var cov = new Array(len).fill(false), bits = 0;
    var flags = { word: false, year: false, seq: false, rep: false };
    function free(s, e) { for (var i = s; i < e; i++) if (cov[i]) return false; return true; }
    function mark(s, e) { for (var i = s; i < e; i++) cov[i] = true; }
    /* dictionary words (positions match because every element is one char) */
    if (joined.length === len) {
      DICT.forEach(function (w) {
        var from = 0, i;
        while ((i = joined.indexOf(w, from)) > -1) {
          if (free(i, i + w.length)) { mark(i, i + w.length); bits += 12 + (/[A-Z]/.test(chars[i]) ? 1 : 0); flags.word = true; }
          from = i + w.length;
        }
      });
    }
    /* years */
    for (var y = 0; y + 3 < len; y++) {
      var s4 = chars.slice(y, y + 4).join('');
      if (/^(19|20)\d\d$/.test(s4) && free(y, y + 4)) { mark(y, y + 4); bits += 6.5; flags.year = true; y += 3; }
    }
    /* sequential runs (abc, 4321) */
    for (var i = 0; i < len - 2;) {
      var d = norm[i + 1].charCodeAt(0) - norm[i].charCodeAt(0);
      if (Math.abs(d) === 1) {
        var j = i + 1;
        while (j + 1 < len && norm[j + 1].charCodeAt(0) - norm[j].charCodeAt(0) === d) j++;
        if (j - i + 1 >= 3 && free(i, j + 1)) { mark(i, j + 1); bits += 8; flags.seq = true; }
        i = j;
      } else i++;
    }
    /* repeats (aaa) */
    for (var k = 0; k < len - 2;) {
      var m = k;
      while (m + 1 < len && norm[m + 1] === norm[k]) m++;
      if (m - k + 1 >= 3 && free(k, m + 1)) { mark(k, m + 1); bits += 6; flags.rep = true; }
      k = m + 1;
    }
    var rest = 0;
    for (var n = 0; n < len; n++) if (!cov[n]) rest++;
    bits += rest * per;
    if (bits < 1) bits = 1;
    flags.short = len < 12;
    return { len: len, pool: pool, bits: bits, flags: flags };
  }
  function human(s) {
    if (s < 1) return 'Under a second';
    if (s < 60) return Math.round(s) + ' seconds';
    var m = s / 60; if (m < 60) return Math.round(m) + ' minutes';
    var h = m / 60; if (h < 24) return Math.round(h) + ' hours';
    var d = h / 24; if (d < 365) return Math.round(d) + ' days';
    var y = d / 365;
    if (y >= 1.38e10) return 'Longer than the universe has existed';
    if (y < 1e3) return fmt(Math.round(y)) + ' years';
    if (y < 1e6) return fmt(Math.round(y / 1e3)) + ' thousand years';
    if (y < 1e9) return fmt(Math.round(y / 1e6)) + ' million years';
    return fmt(Math.round(y / 1e9)) + ' billion years';
  }
  var LEVELS = ['Type a password to test', 'Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'];
  var pw = $('#pw');
  function renderPw() {
    var a = analyze(pw.value);
    var level = a.len === 0 ? 0 : a.bits < 28 ? 1 : a.bits < 45 ? 2 : a.bits < 60 ? 3 : a.bits < 80 ? 4 : 5;
    var meter = $('#meter');
    meter.setAttribute('data-level', String(level));
    meter.setAttribute('aria-label', 'Strength ' + level + ' of 5');
    $('#verdict').textContent = LEVELS[level];
    $('#mLen').textContent = String(a.len);
    $('#mPool').textContent = String(a.pool);
    $('#mBits').textContent = a.len ? (a.bits > 128 ? '128+ bits' : Math.round(a.bits) + ' bits') : '0 bits';
    $('#mTime').textContent = a.len ? human(Math.pow(2, a.bits) / 2 / 1e10) : '—';
    var list = $('#findings');
    list.textContent = '';
    function add(text, good) {
      var li = document.createElement('li');
      if (good) li.className = 'good';
      li.textContent = text; list.appendChild(li);
    }
    if (!a.len) { add('Nothing to score yet.', true); return; }
    if (a.flags.word) add('Built on a common word, which attackers try first.');
    if (a.flags.year) add('Contains a year, one of the most predictable parts of a password.');
    if (a.flags.seq) add('Contains a run of characters in order, such as abc or 4321.');
    if (a.flags.rep) add('Repeats the same character three or more times.');
    if (a.flags.short) add('Shorter than 12 characters. Length adds more strength than symbols do.');
    if (level >= 4 && !a.flags.word && !a.flags.year && !a.flags.seq && !a.flags.rep) add('No obvious patterns found.', true);
    add('A password manager can generate and store 16 or more random characters for you.', true);
  }
  pw.addEventListener('input', function () { $('#pwHint').textContent = 'Scored in this page only. Nothing is sent anywhere.'; renderPw(); });
  $('#pwToggle').addEventListener('click', function () {
    var show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    this.textContent = show ? 'Hide' : 'Show';
    this.setAttribute('aria-pressed', String(show));
  });
  renderPw();

  /* ---------- billing toggle ---------- */
  $$('.bill button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var p = btn.getAttribute('data-p');
      $$('.bill button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      $$('.plan .amt').forEach(function (el) { el.textContent = '$' + el.getAttribute('data-' + p); });
      $$('.plan .billed').forEach(function (el) { el.textContent = p === 'y' ? 'Billed yearly' : 'Billed monthly'; });
    });
  });

  /* ---------- hero WebGL scene ---------- */
  (function hero() {
    var host = $('#scene'), canvas = $('#c3d');
    function fallback() { host.classList.add('no-webgl'); }
    if (!window.THREE) { fallback(); return; }
    var THREE = window.THREE, renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (err) { fallback(); return; }
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); fallback(); });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 11.5);
    var group = new THREE.Group();
    scene.add(group);

    scene.add(new THREE.AmbientLight(0x7fb7b8, 0.6));
    var key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(3, 5, 7); scene.add(key);
    var l1 = new THREE.PointLight(0x36d9c0, 2.4, 40); l1.position.set(-6, 2, 5); scene.add(l1);
    var l2 = new THREE.PointLight(0xf5b84a, 1.5, 40); l2.position.set(6, -4, 4); scene.add(l2);

    /* shield with a keyhole cut-out, extruded and bevelled */
    var sh = new THREE.Shape();
    sh.moveTo(0, 1.75); sh.lineTo(1.25, 1.3); sh.lineTo(1.25, 0.15);
    sh.bezierCurveTo(1.25, -0.85, 0.65, -1.45, 0, -1.85);
    sh.bezierCurveTo(-0.65, -1.45, -1.25, -0.85, -1.25, 0.15);
    sh.lineTo(-1.25, 1.3); sh.lineTo(0, 1.75);
    var hole = new THREE.Path();
    var r = 0.27, cy = 0.3, hw = 0.1, dy = Math.sqrt(r * r - hw * hw);
    hole.moveTo(hw, cy - dy);
    hole.absarc(0, cy, r, Math.atan2(-dy, hw), Math.atan2(-dy, -hw) + Math.PI * 2, false);
    hole.lineTo(-0.17, -0.6); hole.lineTo(0.17, -0.6); hole.closePath();
    sh.holes.push(hole);
    var geo = new THREE.ExtrudeGeometry(sh, { depth: 0.38, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.12, bevelSegments: 8, curveSegments: 32 });
    geo.center();
    var shieldMat = new THREE.MeshStandardMaterial({ color: 0x1b4a55, metalness: 0.65, roughness: 0.3, emissive: 0x0e7d73, emissiveIntensity: 0.18 });
    var shield = new THREE.Mesh(geo, shieldMat);
    shield.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 35), new THREE.LineBasicMaterial({ color: 0x36d9c0, transparent: true, opacity: 0.55 })));
    group.add(shield);

    /* soft glow behind it */
    var gc = document.createElement('canvas'); gc.width = gc.height = 256;
    var g = gc.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(54,217,192,0.55)'); gr.addColorStop(0.4, 'rgba(54,217,192,0.12)'); gr.addColorStop(1, 'rgba(54,217,192,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.set(9, 9, 1); glow.position.z = -1.5; group.add(glow);

    /* wire lattice and orbit rings */
    var wire = new THREE.Mesh(new THREE.IcosahedronGeometry(3.1, 1), new THREE.MeshBasicMaterial({ color: 0x36d9c0, wireframe: true, transparent: true, opacity: 0.12 }));
    group.add(wire);
    var ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.012, 8, 220), new THREE.MeshBasicMaterial({ color: 0x36d9c0, transparent: true, opacity: 0.5 }));
    ring1.rotation.x = Math.PI / 2.3; group.add(ring1);
    var ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.15, 0.01, 8, 220), new THREE.MeshBasicMaterial({ color: 0xf5b84a, transparent: true, opacity: 0.4 }));
    ring2.rotation.set(Math.PI / 3, 0.5, 0); group.add(ring2);

    /* particle shell */
    var N = window.innerWidth < 600 ? 700 : 1400, pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(3.4 + Math.random() * 4.6);
      pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
    }
    var pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var points = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x36d9c0, size: 0.035, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
    group.add(points);

    /* incoming threats that get deflected */
    var threats = [], tGeo = new THREE.OctahedronGeometry(0.1), tMat = new THREE.MeshBasicMaterial({ color: 0xff6b5b });
    function spawn(m) {
      m.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(7 + Math.random() * 2);
      m.userData.speed = 0.7 + Math.random() * 1.1;
    }
    for (var t = 0; t < 18; t++) {
      var m = new THREE.Mesh(tGeo, tMat); spawn(m);
      m.position.multiplyScalar(0.45 + Math.random() * 0.55);
      if (m.position.length() < 3.6) m.position.setLength(3.6 + Math.random());
      threats.push(m); group.add(m);
    }

    var tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, time = 0, last = performance.now(), raf = 0;
    function step(dt) {
      time += dt;
      var k = Math.min(1, dt * 3);
      cur.x += (tgt.x - cur.x) * k; cur.y += (tgt.y - cur.y) * k;
      group.rotation.y = cur.x * 0.45 + Math.sin(time * 0.4) * 0.2;
      group.rotation.x = -cur.y * 0.25;
      shield.rotation.y = Math.sin(time * 0.6) * 0.25;
      wire.rotation.y = time * 0.12; wire.rotation.x = time * 0.07;
      ring1.rotation.z = time * 0.25; ring2.rotation.z = -time * 0.18;
      points.rotation.y = time * 0.03;
      shieldMat.emissiveIntensity += (0.18 - shieldMat.emissiveIntensity) * k;
      for (var i = 0; i < threats.length; i++) {
        var m = threats[i], p = m.position;
        p.addScaledVector(p.clone().normalize(), -m.userData.speed * dt);
        m.rotation.x += dt * 2; m.rotation.y += dt * 1.4;
        if (p.length() < 3.3) { shieldMat.emissiveIntensity = 1.0; spawn(m); }
      }
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      step(dt); renderer.render(scene, camera);
    }
    function resize() {
      var b = host.getBoundingClientRect();
      var w = Math.max(1, Math.round(b.width)), h = Math.max(1, Math.round(b.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      if (reduce) renderer.render(scene, camera);
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host); else window.addEventListener('resize', resize);
    resize();

    if (reduce) { step(0); renderer.render(scene, camera); return; }
    if (fine) {
      window.addEventListener('pointermove', function (e) {
        var b = host.getBoundingClientRect();
        tgt.x = Math.max(-1, Math.min(1, ((e.clientX - b.left) / b.width - 0.5) * 2));
        tgt.y = Math.max(-1, Math.min(1, ((e.clientY - b.top) / b.height - 0.5) * 2));
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
        else { cancelAnimationFrame(raf); raf = 0; }
      }).observe(host);
    } else { raf = requestAnimationFrame(loop); }
  })();
})();
