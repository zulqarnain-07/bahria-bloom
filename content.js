/* Bahria Bloom: builds the few extra elements the redesign needs.
   It never touches forms, hidden fields or ASP.NET controls. */
(function () {
  'use strict';

  var doc = document;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };
  var uid = 0;

  var ICONS = {
    candidate: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h4"/>',
    student: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 9v6"/>',
    faculty: '<path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z"/><path d="M12 6v14"/>',
    alumni: '<circle cx="12" cy="9" r="5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/>',
    staff: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M3 13h18"/>',
    executive: '<path d="M3 18h18l-1.5-10-5 4-2.5-6-2.5 6-5-4z"/>'
  };

  // Small seeded random so the door looks the same on every visit
  function seeded(n) { return function () { n = (n * 16807) % 2147483647; return (n - 1) / 2147483646; }; }

  function flower(cx, cy, r, fill, delay) {
    var petals = '';
    for (var k = 0; k < 5; k++) {
      var a = (72 * k - 90) * Math.PI / 180;
      petals += '<circle cx="' + (Math.cos(a) * r * 0.58).toFixed(1) + '" cy="' + (Math.sin(a) * r * 0.58).toFixed(1) +
        '" r="' + (r * 0.5).toFixed(1) + '" fill="' + fill + '" stroke="#cc8db3" stroke-width=".8"/>';
    }
    return '<g transform="translate(' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')"><g class="fl" style="--d:' + delay.toFixed(2) + 's">' +
      petals + '<circle r="' + (r * 0.2).toFixed(1) + '" fill="#250e2c"/></g></g>';
  }

  function leaf(cx, cy, rot, len, fill) {
    return '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + (len * 0.38).toFixed(1) + '" ry="' + len.toFixed(1) +
      '" fill="' + fill + '" transform="rotate(' + rot.toFixed(0) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')"/>';
  }

  // An arched wooden door wreathed in blossoms. Flat fills only.
  function door() {
    var id = 'lb-door-' + (++uid), rnd = seeded(11);
    var doorPath = 'M78 372V170C78 98 122 56 180 56s102 42 102 114v202z';
    var s = '<svg class="bu-door" viewBox="0 0 360 400" role="img" aria-label="An arched wooden door wreathed in blossoms">';
    s += '<defs><clipPath id="' + id + '"><path d="' + doorPath + '"/></clipPath></defs>';
    s += '<ellipse cx="180" cy="378" rx="158" ry="14" fill="#9d85b6"/>';
    s += '<path d="M62 372V168C62 86 114 40 180 40s118 46 118 128v204z" fill="#250e2c"/>';
    s += '<path d="' + doorPath + '" fill="#f7c2ca"/>';
    s += '<g clip-path="url(#' + id + ')" stroke="#f6a5c0" stroke-width="3">';
    [112, 146, 180, 214, 248].forEach(function (x) { s += '<path d="M' + x + ' 40V380"/>'; });
    s += '</g>';
    s += '<path d="M158 172V134a22 22 0 0 1 44 0V172z" fill="#837ab6" stroke="#250e2c" stroke-width="5" stroke-linejoin="round"/>';
    s += '<path d="M180 112V172M158 142H202" stroke="#250e2c" stroke-width="4"/>';
    s += '<path d="M166 132a14 14 0 0 1 8-9" stroke="#9d85b6" stroke-width="3" fill="none" stroke-linecap="round"/>';
    s += '<rect x="78" y="196" width="22" height="14" rx="3" fill="#250e2c"/><rect x="78" y="312" width="22" height="14" rx="3" fill="#250e2c"/>';
    s += '<circle cx="256" cy="262" r="8" fill="#250e2c"/><circle cx="256" cy="262" r="3" fill="#f6a5c0"/>';
    s += '<rect x="52" y="366" width="256" height="14" rx="4" fill="#cc8db3"/>';

    var cols = ['#f6a5c0', '#f7c2ca', '#cc8db3', '#f7c2ca', '#f6a5c0'];
    var spots = [], i, a;
    for (i = 0; i < 11; i++) {                       // along the arch
      a = (176 - i * 17) * Math.PI / 180;
      spots.push([180 + 120 * Math.cos(a) + (rnd() - .5) * 10, 168 - 130 * Math.sin(a) + (rnd() - .5) * 10, 10 + rnd() * 8]);
    }
    [[52, 214, 14], [44, 262, 12], [58, 306, 15], [50, 346, 11], [310, 232, 11], [316, 300, 14], [306, 346, 10]].forEach(function (p) { spots.push(p); });
    var leaves = '', flowers = '';
    spots.forEach(function (p, n) {
      leaves += leaf(p[0] + (rnd() - .5) * 26, p[1] + (rnd() - .5) * 26, rnd() * 180, 11 + rnd() * 6, n % 2 ? '#9d85b6' : '#837ab6');
    });
    spots.forEach(function (p, n) { flowers += flower(p[0], p[1], p[2], cols[n % cols.length], 0.25 + n * 0.08); });
    return s + leaves + flowers + '</svg>';
  }

  function landing() {
    var overlay = $('.overlay');
    if (!overlay || $('#bu-hero')) return;

    var hero = doc.createElement('div');
    hero.id = 'bu-hero';
    hero.innerHTML = '<h1>Bahria University Campus Management System</h1>' +
      '<p>Courses, attendance, fees and results all live here. Pick your portal and sign in.</p>' + door();
    overlay.insertBefore(hero, overlay.firstChild);

    Object.keys(ICONS).forEach(function (role) {
      var card = $('.portal-card.' + role);
      if (!card) return;
      var chip = doc.createElement('span');
      chip.className = 'bu-ico';
      chip.setAttribute('aria-hidden', 'true');
      chip.innerHTML = '<svg viewBox="0 0 24 24">' + ICONS[role] + '</svg>';
      card.insertBefore(chip, card.firstChild);
    });

    // The whole row is the link now; give it a proper name for screen readers
    var cards = overlay.querySelectorAll('.portal-card');
    Array.prototype.forEach.call(cards, function (card) {
      var a = card.querySelector('a.portal-btn'), h = card.querySelector('h2');
      if (a && h) a.setAttribute('aria-label', h.textContent.trim());
    });
  }

  function login() {
    var overlay = $('.overlay');
    if (!overlay || $('.bu-side')) return;
    var side = doc.createElement('div');
    side.className = 'bu-side';
    side.innerHTML = '<h2>Welcome back</h2><p>Courses, attendance, fees and results are waiting on the other side.</p>' + door();
    overlay.insertBefore(side, overlay.firstChild);
  }

  function greet() {
    var nameEl = $('#ProfileInfo_lblName'), head = $('#pageHeading');
    if (!nameEl || !head || $('.lb-greet')) return;
    var first = (nameEl.textContent || '').trim().split(/\s+/)[0] || '';
    if (!first) return;
    first = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
    var h = new Date().getHours();
    var text = h < 5 ? 'Hello, ' : h < 12 ? 'Good morning, ' : h < 18 ? 'Good afternoon, ' : 'Good evening, ';
    var p = doc.createElement('p');
    p.className = 'lb-greet';
    p.textContent = text + first + '.';
    head.appendChild(p);
  }

  // Faint door behind the signed-in pages, centred in the area right of the side bar
  function backdropDoor() {
    var content = $('#pageContent');
    if (!content || $('.bu-door-bg')) return;
    var wrap = doc.createElement('div');
    wrap.innerHTML = door();
    var svg = wrap.firstChild;
    svg.classList.add('bu-door-bg');
    svg.setAttribute('aria-hidden', 'true');
    svg.removeAttribute('role'); svg.removeAttribute('aria-label');
    doc.body.appendChild(svg);

    var bar = $('#sideBar');
    function place() {
      var left = 0;
      if (bar) { var r = bar.getBoundingClientRect(); if (r.width > 0 && r.right > 0) left = r.right; }
      svg.style.left = (left + (window.innerWidth - left) / 2) + 'px';
    }
    place();
    window.addEventListener('resize', place);
    if (window.ResizeObserver) new ResizeObserver(place).observe(content);   // fires when the side bar is toggled
    if (bar) bar.addEventListener('transitionend', place);
    setTimeout(place, 400);
  }

  function init() {
    if ($('.portal-container')) landing();
    else if ($('#BodyPH_btnLogin')) login();
    if ($('#sideBar')) backdropDoor();
    if (/\/Dashboard\.aspx$/i.test(location.pathname)) greet();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
