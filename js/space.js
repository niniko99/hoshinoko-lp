/* ===== ⑨ あの青い点から、地球へ（画面に入ったら自動で再生） ===== */
(function () {
  'use strict';
  var stage = document.querySelector('.space-stage');
  if (!stage) return;
  var $ = function (s) { return stage.querySelector(s); };

  var photo = $('.pbd-photo'), earth = $('.earth'), close = $('.earth-close'), marker = $('.dot-marker');
  var here = $('.here'), dist = $('.distance'), dNum = $('.d-num'), stars = $('.stars');
  var deco = $('.star-deco'), scrim = $('.stage-scrim'), replay = $('.replay');

  // NASA PIA23645 の元画像サイズと、地球（点）の位置（横・縦の割合）
  var IW = 5230, IH = 5175, DOT = { x: 0.5942, y: 0.5198 };
  // .earth の箱の大きさと、その絵の中の地球の直径の割合
  var EARTH_BOX = 1000, GLOBE_RATIO = 0.9;

  // タイムライン（秒）：[出はじめ, 出きる] または [出はじめ, 出きる, 消えはじめ, 消えきる]
  var T = {
    photo:    [0.2, 1.6],          // 写真があらわれる
    here:     [1.2, 2.2, 3.2, 3.9],// ここに、私たちがいる。
    zoom:     [2.8, 7.2],          // 青い点 → 地球（近づいていく）
    photoOut: [3.2, 5.8],
    close:    [6.6, 8.0],          // ポスターの地球へ切り替え
    c1:       [8.4, 9.2, 11.6, 12.2],
    c2:       [12.5, 13.5],
    brand:    [13.0, 14.0],
    company:  [14.0, 14.8],
    credit:   [14.8, 15.4]
  };
  var END = 15.8;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, dot = { x: 0, y: 0 }, big, current = 0;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  var range = function (t, a, b) { return clamp((t - a) / (b - a), 0, 1); };
  var fade = function (t, r) { var o = range(t, r[0], r[1]); return r.length === 4 ? o * (1 - range(t, r[2], r[3])) : o; };

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
    // 写真は「青い点」を中心に拡大する
    photo.style.transformOrigin = ((dot.x = left + DOT.x * pw) - left) / pw * 100 + '% ' +
      ((dot.y = top + DOT.y * ph) - top) / ph * 100 + '%';

    marker.style.transform = 'translate(' + dot.x + 'px,' + dot.y + 'px)';
    here.style.transform = 'translate(' + (dot.x - 46) + 'px,' + (dot.y - 46) + 'px) translate(-100%,-100%)';
    big = Math.max(W, H) * 1.8; // 近づききったときの地球の直径
  }

  function formatKm(km) {
    if (km < 10000) return Math.round(km).toLocaleString('ja-JP');
    if (km < 1e8) return Math.round(km / 1e4).toLocaleString('ja-JP') + '万';
    return Math.round(km / 1e8).toLocaleString('ja-JP') + '億';
  }

  var lastKm = '';
  function render(t) {
    current = t;

    // 写真（あの青い点）
    var out = range(t, T.photoOut[0], T.photoOut[1]);
    photo.style.opacity = (fade(t, T.photo) * (1 - out)).toFixed(3);
    photo.style.transform = 'scale(' + (1 + 2.2 * smooth(out)).toFixed(4) + ')';

    // 点 → 地球（だんだん近づく）
    var u = range(t, T.zoom[0], T.zoom[1]), e = u * u; // はじめはゆっくり、だんだん速く
    var d = Math.exp(lerp(Math.log(5), Math.log(big), e));
    var x = lerp(dot.x, W / 2, smooth(u)), y = lerp(dot.y, H / 2, smooth(u));
    earth.style.transform = 'translate(' + (x - EARTH_BOX / 2).toFixed(1) + 'px,' + (y - EARTH_BOX / 2).toFixed(1) +
      'px) scale(' + (d / (EARTH_BOX * GLOBE_RATIO)).toFixed(5) + ')';
    earth.style.opacity = (range(t, T.zoom[0], T.zoom[0] + 0.4) * (1 - range(t, T.close[0], T.close[1]))).toFixed(3);

    // ポスターの地球（最後の画面）
    close.style.opacity = smooth(range(t, T.close[0], T.close[1])).toFixed(3);
    if (scrim) scrim.style.opacity = smooth(range(t, T.close[0] + 0.4, T.close[1] + 0.6)).toFixed(3);

    // 星（最後の絵には星が描いてあるので消す）
    var starO = (range(t, 0, 0.6) * (1 - range(t, T.close[0], T.close[1]))).toFixed(3);
    stars.style.setProperty('--star-o', starO);
    if (deco) deco.style.opacity = starO;

    marker.style.opacity = fade(t, [T.here[0] - 0.4, T.here[1] - 0.4, T.here[2], T.here[3]]).toFixed(3);
    here.style.opacity = fade(t, T.here).toFixed(3);

    // 地球までの距離（60億km → 0）
    var km = Math.exp(lerp(Math.log(6e9), Math.log(400), e));
    dist.style.opacity = (fade(t, [T.photo[0] + 0.6, T.photo[1] + 0.4, T.zoom[1] - 0.6, T.zoom[1]])).toFixed(3);
    var label = u >= 1 ? '0' : formatKm(km);
    if (label !== lastKm) { dNum.textContent = label; lastKm = label; }

    // ことば
    $('.c1').style.opacity = fade(t, T.c1).toFixed(3);
    $('.c2').style.opacity = fade(t, T.c2).toFixed(3);
    $('.c2 .final').style.opacity = fade(t, T.c2).toFixed(3);
    $('.c2 .final-brand').style.opacity = fade(t, T.brand).toFixed(3);
    $('.c2 .company-block').style.opacity = fade(t, T.company).toFixed(3);
    $('.space-credit').style.opacity = fade(t, T.credit).toFixed(3);
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
