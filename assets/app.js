(function () {
  'use strict';

  var hdr = document.getElementById('hdr');
  function onScroll() { hdr.classList.toggle('scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var mm = document.getElementById('mobileMenu');
  document.getElementById('burger').addEventListener('click', function () { mm.classList.add('open'); });
  document.getElementById('closeMenu').addEventListener('click', function () { mm.classList.remove('open'); });
  mm.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { mm.classList.remove('open'); });
  });

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    return startCanvas();
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  startCanvas();

  function startCanvas() {
  var RTL = document.documentElement.dir === 'rtl';
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var canvas = document.getElementById('streaks');
  if (!canvas) { return; }
  var ctx = canvas.getContext('2d');
  var W, H, DPR, streaks = [];
  var COLORS = ['#FE9F00', '#FEC700', '#005499', '#3a8fd0'];

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function vanish() { return { x: RTL ? W * 0.08 : W * 0.92, y: H * 0.5 }; }

  function makeStreak() {
    var v = vanish();
    var angle = (Math.random() * 2 - 1) * 0.9;
    var dist = Math.max(W, H) * 1.2;
    var sx = v.x - Math.cos(angle) * dist * (RTL ? -1 : 1);
    var sy = v.y - Math.sin(angle) * dist * 0.55;
    return {
      x: sx, y: sy, vx: (v.x - sx), vy: (v.y - sy),
      t: Math.random(), speed: 0.0014 + Math.random() * 0.0026,
      len: 0.06 + Math.random() * 0.10, w: 0.6 + Math.random() * 1.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  }

  function init() {
    resize();
    streaks = Array.from({ length: W < 700 ? 22 : 46 }, makeStreak);
  }

  function segment(s, head, tail) {
    var hx = s.x + s.vx * head, hy = s.y + s.vy * head;
    var tx = s.x + s.vx * tail, ty = s.y + s.vy * tail;
    var g = ctx.createLinearGradient(tx, ty, hx, hy);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, s.color);
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(hx, hy);
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < streaks.length; i++) {
      var s = streaks[i];
      s.t += s.speed;
      if (s.t >= 1) { Object.assign(s, makeStreak()); s.t = 0; continue; }
      var head = s.t, tail = Math.max(0, s.t - s.len);
      ctx.lineWidth = s.w * (0.5 + head);
      ctx.lineCap = 'round';
      ctx.globalAlpha = Math.min(1, head * 1.6) * 0.85;
      segment(s, head, tail);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }

  function drawStatic() {
    resize();
    streaks = Array.from({ length: 30 }, makeStreak).map(function (s) {
      s.t = 0.3 + Math.random() * 0.5;
      return s;
    });
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < streaks.length; i++) {
      var s = streaks[i];
      ctx.lineWidth = s.w;
      ctx.globalAlpha = 0.6;
      segment(s, s.t, Math.max(0, s.t - s.len));
    }
  }

  if (canvas.clientWidth) {
    if (reduce) { drawStatic(); } else { init(); draw(); }
  }
  window.addEventListener('resize', function () {
    if (reduce) { drawStatic(); } else { init(); }
  });
  }
})();
