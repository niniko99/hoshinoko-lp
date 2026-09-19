/* ===== 16 スクロールするほど地球が小さくなって、Pale Blue Dot へ ===== */
(function () {
  'use strict';
  var track = document.querySelector('.earth-track');
  var stage = document.querySelector('.earth-stage');
  if (!track || !stage) return;
  var $ = function (s) { return stage.querySelector(s); };
  var photo = $('.pbd-photo'), earth = $('.earth'), dist = $('.distance'), dNum = $('.d-num'), cap = $('.pbd-caption');

  // NASA PIA23645 の元画像サイズと、地球（点）の位置（横・縦の割合）
  var IW = 5230, IH = 5175, DOT = { x: 0.5942, y: 0.5198 };
  // .earth の箱の大きさと、絵の中の地球の直径の割合（こうの水彩の地球）
  var BOX = 1000, RATIO = 0.9;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) track.style.height = '100vh';

  var W, H, dot = { x: 0, y: 0 }, k0;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  var range = function (t, a, b) { return clamp((t - a) / (b - a), 0, 1); };

  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    var mobile = W < 900;
    // 最後の写真：光の筋と青い点が見える構図（点は真ん中あたり）
    var tx = W * (mobile ? 0.58 : 0.5), ty = H * (mobile ? 0.46 : 0.5);
    var s = Math.max(W / IW, H / IH, mobile ? 0.2 : 0.24);
    var pw = IW * s, ph = IH * s;
    var left = clamp(tx - DOT.x * pw, W - pw, 0);
    var top = clamp(ty - DOT.y * ph, H - ph, 0);
    photo.style.width = pw + 'px';
    photo.style.left = left + 'px';
    photo.style.top = top + 'px';
    dot.x = left + DOT.x * pw;
    dot.y = top + DOT.y * ph;
    // はじめ：画面いっぱいの大きな地球
    k0 = { d: Math.min(W, H) * 1.3, x: W / 2, y: H * 0.52 };
    render();
  }

  function formatKm(km) {
    if (km < 10000) return Math.round(km).toLocaleString('ja-JP');
    if (km < 1e8) return Math.round(km / 1e4).toLocaleString('ja-JP') + '万';
    return Math.round(km / 1e8).toLocaleString('ja-JP') + '億';
  }

  var last = '';
  function render() {
    var r = track.getBoundingClientRect();
    var total = track.offsetHeight - H;
    var p = reduce ? 1 : clamp(-r.top / Math.max(total, 1), 0, 1);

    // 地球：スクロールするほど小さく（だんだん速く遠ざかる）→ 写真の青い点の位置へ
    var u = range(p, 0.04, 0.62), e = u * u;
    var d = Math.exp(lerp(Math.log(k0.d), Math.log(4), e));
    var x = lerp(k0.x, dot.x, smooth(u)), y = lerp(k0.y, dot.y, smooth(u));
    earth.style.transform = 'translate(' + (x - BOX / 2).toFixed(1) + 'px,' + (y - BOX / 2).toFixed(1) + 'px) scale(' + (d / (BOX * RATIO)).toFixed(5) + ')';
    earth.style.opacity = (1 - range(p, 0.6, 0.68)).toFixed(3);

    // 最後は Pale Blue Dot の写真だけ
    photo.style.opacity = smooth(range(p, 0.55, 0.72)).toFixed(3);
    cap.style.opacity = range(p, 0.78, 0.9).toFixed(3);

    // 地球からの距離
    var km = Math.exp(lerp(Math.log(12000), Math.log(6e9), e));
    dist.style.opacity = (range(p, 0.02, 0.08) * (1 - range(p, 0.6, 0.68))).toFixed(3);
    var label = u >= 1 ? '約60億' : formatKm(km);
    if (label !== last) { dNum.textContent = label; last = label; }
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var r = track.getBoundingClientRect();
      if (r.bottom > -100 && r.top < window.innerHeight + 100) render();
    });
  }, { passive: true });
  window.addEventListener('resize', layout);
  layout();
})();
