/* Bahria Bloom: falling petals + click bursts.
   One fixed canvas, pointer-events: none, so it never blocks the CMS. */
(function () {
  'use strict';
  if (window.__bahriaBloom) return;
  window.__bahriaBloom = true;

  var STORE_KEY = 'bahria-bloom:petals';
  var TAU = Math.PI * 2;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  var enabled = true;
  try { enabled = localStorage.getItem(STORE_KEY) !== 'off'; } catch (e) {}

  // Petal tints from the palette, plus a pale one for variety
  var COLORS = ['#f6a5c0', '#f7c2ca', '#f7c2ca', '#cc8db3', '#fbd3dc', '#f6a5c0'];
  var BACK_TINT = 'rgba(204,141,179,0.35)';  // the underside of a turned petal
  var BASE_TINT = 'rgba(204,141,179,0.75)';  // where the petal meets the stem

  var canvas = document.createElement('canvas');
  canvas.id = 'lb-petals';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2147483000;';
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  var petals = [];
  var ripples = [];
  var raf = 0, last = 0, startedAt = 0, fade = 1;

  // Wind: slow drift + a gust every so often
  var gustPeak = 0, gustStart = 0, gustDur = 3000, nextGust = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function targetCount() { return Math.max(22, Math.min(64, Math.round(W / 30))); }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }

  function makePetal(x, y, o) {
    o = o || {};
    var z = o.z || rand(0.45, 1);                 // depth: far petals are small, slow and faint
    return {
      x: x, y: y, z: z,
      size: (o.size || rand(10, 20)) * (0.6 + 0.55 * z),
      color: pick(COLORS),
      alpha: 0.5 + 0.45 * z,
      rot: rand(0, TAU), rotSpd: o.rotSpd !== undefined ? o.rotSpd : rand(-0.025, 0.025),
      flip: rand(0, TAU), flipSpd: rand(0.015, 0.05),
      tilt: rand(0, TAU), tiltSpd: rand(0.01, 0.03),
      sway: rand(0, TAU), swaySpd: rand(0.015, 0.035), swayAmp: rand(0.15, 0.55),
      fall: rand(0.55, 1.15) * (0.55 + 0.5 * z),
      vx: o.vx || 0, vy: o.vy || 0,
      k: o.k || 0.028,                            // how fast velocity relaxes to the natural drift
      once: !!o.once
    };
  }

  function seed(fillScreen) {
    petals.length = 0;
    var n = targetCount();
    for (var i = 0; i < n; i++) {
      var p = makePetal(rand(0, W), fillScreen ? rand(-40, H) : rand(-H, -20));
      p.vy = p.fall;
      petals.push(p);
    }
  }

  function burst(x, y) {
    var n = 15 + ((Math.random() * 6) | 0);
    for (var i = 0; i < n; i++) {
      var a = rand(0, TAU);
      var speed = rand(2.5, 8.5);
      var p = makePetal(x, y, {
        z: rand(0.8, 1),
        size: rand(11, 20),
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 2.2,            // lift them a little first
        rotSpd: rand(-0.16, 0.16),
        k: rand(0.03, 0.05),
        once: true
      });
      petals.push(p);
    }
    ripples.push({ x: x, y: y, t0: performance.now() });
    // Keep the total bounded if someone clicks like mad
    var cap = targetCount() + 220;
    if (petals.length > cap) {
      for (var j = 0; j < petals.length && petals.length > cap; j++) {
        if (petals[j].once) { petals.splice(j, 1); j--; }
      }
    }
  }

  function drawPetal(p) {
    var L = p.size, w = p.size * 0.62;
    var face = Math.cos(p.flip);                  // -1..1: turning about the long axis
    var sx = Math.max(0.14, Math.abs(face));
    var sy = 0.8 + 0.2 * Math.cos(p.tilt);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(sx, sy);
    ctx.globalAlpha = p.alpha * fade;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, L * 0.5);
    ctx.bezierCurveTo(-w * 0.95, L * 0.22, -w * 0.78, -L * 0.46, -w * 0.18, -L * 0.5);
    ctx.lineTo(0, -L * 0.37);                     // the notch at the tip
    ctx.lineTo(w * 0.18, -L * 0.5);
    ctx.bezierCurveTo(w * 0.78, -L * 0.46, w * 0.95, L * 0.22, 0, L * 0.5);
    ctx.closePath();
    ctx.fill();
    if (face < 0) { ctx.fillStyle = BACK_TINT; ctx.fill(); }
    ctx.fillStyle = BASE_TINT;
    ctx.beginPath();
    ctx.ellipse(0, L * 0.36, w * 0.09, L * 0.09, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawRipple(r, now) {
    var t = (now - r.t0) / 520;
    if (t >= 1) return false;
    var e = 1 - Math.pow(1 - t, 3);
    ctx.save();
    ctx.globalAlpha = (1 - t) * 0.9;
    ctx.strokeStyle = '#f6a5c0';
    ctx.lineWidth = 3 * (1 - t) + 0.5;
    ctx.beginPath(); ctx.arc(r.x, r.y, 6 + 56 * e, 0, TAU); ctx.stroke();
    ctx.globalAlpha = (1 - t) * 0.35;
    ctx.fillStyle = '#f7c2ca';
    ctx.beginPath(); ctx.arc(r.x, r.y, 4 + 22 * e, 0, TAU); ctx.fill();
    ctx.restore();
    return true;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min((now - last) / 16.667, 3) || 1;
    last = now;

    if (now > nextGust) {
      gustPeak = rand(0.9, 1.9) * (Math.random() < 0.6 ? 1 : -1);
      gustStart = now; gustDur = rand(2500, 4500);
      nextGust = now + rand(8000, 17000);
    }
    var gustAge = now - gustStart;
    var env = gustAge < gustDur ? Math.sin(Math.PI * gustAge / gustDur) : 0;
    var wind = 0.12 + 0.35 * Math.sin(now / 5200) + 0.15 * Math.sin(now / 1900) + gustPeak * env;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    fade = Math.min(1, (now - startedAt) / 1600);   // ease the shower in on load

    // Keep the ambient shower topped up after a resize
    var ambient = 0;
    for (var a = 0; a < petals.length; a++) if (!petals[a].once) ambient++;
    var want = targetCount();
    while (ambient < want) { var np = makePetal(rand(0, W), rand(-60, -20)); np.vy = np.fall; petals.push(np); ambient++; }

    for (var i = petals.length - 1; i >= 0; i--) {
      var p = petals[i];
      p.flip += p.flipSpd * dt;
      p.tilt += p.tiltSpd * dt;
      p.sway += p.swaySpd * dt;

      var tx = wind * p.z * 1.7 + Math.sin(p.sway) * p.swayAmp;
      var ty = p.fall * (0.72 + 0.28 * Math.abs(Math.sin(p.flip * 0.7)));   // broadside to the air falls slower
      p.vx += (tx - p.vx) * p.k * dt;
      p.vy += (ty - p.vy) * p.k * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += (p.rotSpd + p.vx * 0.012) * dt;
      p.rotSpd *= Math.pow(0.992, dt);
      if (Math.abs(p.rotSpd) < 0.01) p.rotSpd += rand(-0.0006, 0.0006);

      if (p.y > H + 40 || (p.once && (p.x < -60 || p.x > W + 60))) {
        if (p.once) { petals.splice(i, 1); continue; }
        p.y = rand(-50, -20); p.x = rand(-20, W + 20);
        p.vy = p.fall; p.color = pick(COLORS);
      } else if (!p.once) {
        if (p.x < -40) p.x = W + 30;
        else if (p.x > W + 40) p.x = -30;
      }
    }

    // Far petals first so near ones overlap them
    petals.sort(function (a, b) { return a.z - b.z; });
    for (var k = 0; k < petals.length; k++) drawPetal(petals[k]);

    ctx.globalAlpha = 1;
    for (var r = ripples.length - 1; r >= 0; r--) if (!drawRipple(ripples[r], now)) ripples.splice(r, 1);
  }

  function start() {
    if (raf || !enabled) return;
    resize();
    if (!petals.length) seed(true);
    startedAt = last = performance.now();
    nextGust = startedAt + rand(4000, 9000);
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.length = 0; ripples.length = 0;
  }

  // Click anywhere: petals burst from the pointer. Passive, so forms and links behave as normal.
  window.addEventListener('pointerdown', function (e) {
    if (!enabled || !raf || e.button > 0) return;
    if (e.target && e.target.closest && e.target.closest('.lb-toggle')) return;
    burst(e.clientX, e.clientY);
  }, { capture: true, passive: true });

  window.addEventListener('resize', function () { if (raf) resize(); });
  reduce.addEventListener && reduce.addEventListener('change', function () {
    if (reduce.matches) stop(); else start();
  });

  function buildToggle() {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lb-toggle';
    b.setAttribute('aria-label', 'Falling petals');
    b.setAttribute('aria-pressed', String(enabled));
    b.title = 'Falling petals';
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<g fill="#fff8f9" stroke="#250e2c" stroke-width="1.4">' +
      '<circle cx="12" cy="6.4" r="3.6"/><circle cx="17.3" cy="10.3" r="3.6"/><circle cx="15.3" cy="16.6" r="3.6"/>' +
      '<circle cx="8.7" cy="16.6" r="3.6"/><circle cx="6.7" cy="10.3" r="3.6"/></g>' +
      '<circle cx="12" cy="12" r="2" fill="#250e2c"/></svg>';
    b.addEventListener('click', function () {
      enabled = !enabled;
      b.setAttribute('aria-pressed', String(enabled));
      try { localStorage.setItem(STORE_KEY, enabled ? 'on' : 'off'); } catch (e) {}
      if (enabled) start(); else stop();
    });
    document.body.appendChild(b);
  }

  document.body.appendChild(canvas);
  buildToggle();
  start();
})();
