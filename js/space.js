/* ===== 16 地球が小さくなって、あの青い点へ（画面に入ったら自動で再生） ===== */
(function () {
  'use strict';
  var stage = document.querySelector('.space-stage');
  if (!stage) return;
  var $ = function (s) { return stage.querySelector(s); };

  var photo = $('.pbd-photo'), earth = $('.earth'), marker = $('.dot-marker'), here = $('.here');
  var dist = $('.distance'), dNum = $('.d-num'), replay = $('.replay');

  // NASA PIA23645 の元画像サイズと、地球（点）の位置（横・縦の割合）
  var IW = 5230, IH = 5175, DOT = { x: 0.5942, y: 0.5198 };
  var EARTH_BOX = 1000, GLOBE = 880; // .earth の大きさと、その中の地球の直径（こうの水彩の地球）
  var JP = { x: 0.54, y: 0.17 };     // 地球の絵の中の、日本の位置（横・縦の割合。上のふち近く）
  // 背景は、うしろの、まゆちゃんの絵の星空（main.js / base.css の .night-sky）

  // タイムライン（秒）：[出はじめ, 出きる] または [出はじめ, 出きる, 消えはじめ, 消えきる]
  var T = {
    rise: [0.3, 2.1],        // 地球が昇ってくる
    shrink: [2.1, 6.3],      // 点まで小さくなる
    photo: [5.9, 7.2],       // 本物の写真へ
    marker: [7.0, 7.5],
    here: [7.3, 8.2],        // ここに、私たちがいる。
    c1: [8.6, 9.4, 11.8, 12.4],
    c2: [12.7, 13.7],        // この美しい世界を…
    brand: [13.2, 14.2],     // Kids Club 星の子
    company: [14.2, 15.0]    // PALE BLUE DOT
  };
  var END = 15.4;
  var fades = [
    [marker, T.marker], [here, T.here], [$('.c1'), T.c1], [$('.c2'), T.c2], [$('.c2 .final'), T.c2],
    [$('.c2 .final-brand'), T.brand], [$('.c2 .company-block'), T.company]
  ];

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, dot = { x: 0, y: 0 }, k0, k1, current = 0;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  var range = function (t, a, b) { return clamp((t - a) / (b - a), 0, 1); };

  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    var mobile = W < 900;
    var tx = mobile ? W * 0.62 : W * 0.36;
    var ty = mobile ? H * 0.36 : H * 0.5;
    var s = Math.max(W / IW, H / IH, mobile ? 0.26 : 0.3);
    var pw = IW * s, ph = IH * s;
    var left = clamp(tx - DOT.x * pw, W - pw, 0);
    var top = clamp(ty - DOT.y * ph, H - ph, 0);
    photo.style.width = pw + 'px';
    photo.style.left = left + 'px';
    photo.style.top = top + 'px';
    dot.x = left + DOT.x * pw;
    dot.y = top + DOT.y * ph;
    marker.style.transform = 'translate(' + dot.x + 'px,' + dot.y + 'px)';
    here.style.transform = 'translate(' + (dot.x - 46) + 'px,' + (dot.y - 46) + 'px) translate(-100%,-100%)';

    // はじめは、地球の上のふちだけが見えている大きなアップ。日本が画面の下のほうに入る位置に置く
    var D0 = Math.max(W, H) * 1.5, s0 = D0 / GLOBE;
    k0 = {
      d: D0,
      x: W / 2 - (JP.x - 0.5) * EARTH_BOX * s0,
      y: H * 0.88 + (0.5 - JP.y) * EARTH_BOX * s0
    };
    k1 = { d: Math.min(W, H) * 0.6, x: W / 2, y: H * 0.46 };
  }

  function formatKm(km) {
    if (km < 10000) return Math.round(km).toLocaleString('ja-JP');
    if (km < 1e8) return Math.round(km / 1e4).toLocaleString('ja-JP') + '万';
    return Math.round(km / 1e8).toLocaleString('ja-JP') + '億';
  }

  var lastKm = '';
  function render(t) {
    current = t;
    var d, x, y, km;
    if (t <= T.rise[1]) {
      var a = smooth(range(t, T.rise[0], T.rise[1]));
      d = Math.exp(lerp(Math.log(k0.d), Math.log(k1.d), a));
      x = lerp(k0.x, k1.x, a); y = lerp(k0.y, k1.y, a);
      km = Math.exp(lerp(Math.log(400), Math.log(36000), a));
    } else {
      var u = range(t, T.shrink[0], T.shrink[1]), e = u * u; // だんだん速く遠ざかる
      d = Math.exp(lerp(Math.log(k1.d), Math.log(5), e));
      x = lerp(k1.x, dot.x, smooth(u)); y = lerp(k1.y, dot.y, smooth(u));
      km = Math.exp(lerp(Math.log(36000), Math.log(6e9), e));
    }
    // ゆっくり傾けていく（地球が動いているように見せる。日本はずっと見えたまま）
    var rot = -7 * range(t, T.rise[0], T.shrink[1]);
    earth.style.transform = 'translate(' + (x - EARTH_BOX / 2).toFixed(1) + 'px,' + (y - EARTH_BOX / 2).toFixed(1) + 'px) scale(' + (d / GLOBE).toFixed(5) + ') rotate(' + rot.toFixed(2) + 'deg)';
    earth.style.opacity = (1 - range(t, T.shrink[1] - 0.2, T.shrink[1] + 0.5)).toFixed(3);

    photo.style.opacity = smooth(range(t, T.photo[0], T.photo[1])).toFixed(3);

    // 距離の数字は、ことば（c1）が出る前に消す（スマホで重ならないように）
    dist.style.opacity = (range(t, 0.2, 0.8) * (1 - 0.4 * range(t, T.here[0], T.here[1])) * (1 - range(t, T.c1[0] - 0.6, T.c1[0]))).toFixed(3);
    var label = t >= T.shrink[1] ? '約60億' : formatKm(km);
    if (label !== lastKm) { dNum.textContent = label; lastKm = label; }

    fades.forEach(function (f) {
      var r = f[1], o = range(t, r[0], r[1]);
      if (r.length === 4) o *= 1 - range(t, r[2], r[3]);
      f[0].style.opacity = o.toFixed(3);
    });
  }

  var startAt = 0, running = false;
  function tick(now) {
    var t = (now - startAt) / 1000;
    render(Math.min(t, END));
    if (t < END) { requestAnimationFrame(tick); return; }
    running = false;
    replay.classList.add('is-on');
  }
  function play() {
    if (running) return;
    running = true;
    replay.classList.remove('is-on');
    requestAnimationFrame(function (now) { startAt = now; tick(now); });
  }

  layout();
  if (reduce) {
    render(END); // 動きを減らす設定の人には、最後の画面をそのまま見せる
  } else {
    render(0);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { io.disconnect(); play(); }
      }, { threshold: 0.6 });
      io.observe(stage);
    } else {
      play();
    }
  }
  replay.addEventListener('click', play);
  window.addEventListener('resize', function () { layout(); if (!running) render(current); });
})();
