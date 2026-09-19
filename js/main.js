/* ===== 動き：ふわっと表示・ヘッダー・空の色の流れ・流れ星 ===== */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s) { return document.querySelector(s); };

  /* 「今日も最高に楽しかった！」を1文字ずつに分ける */
  var big = $('.today-big');
  if (big && !reduce) {
    var n = 0;
    big.querySelectorAll('.l').forEach(function (line) {
      var text = line.textContent;
      line.textContent = '';
      Array.prototype.forEach.call(text, function (ch) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--i', n++);
        s.textContent = ch;
        line.appendChild(s);
      });
    });
    big.classList.add('reveal-chars');
  }

  /* スクロールで表示 */
  var targets = document.querySelectorAll('.reveal, .reveal-chars');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* 空の色の流れ：ページと一緒に流れる、ひと続きの空
     鮮やかな青空を長め（〜いっぱい遊ぼう）→ 青紫 → 紫 → 深い紫〜ネイビー → 星空 → 宇宙 */
  var world = $('.world-bg'), worldStars = $('.world-stars'), main = $('main');
  function paintWorld() {
    if (!world || !main) return;
    var H = main.offsetHeight || 1;
    var at = function (sel, where) {
      var e = $(sel);
      if (!e) return 0;
      var y = e.offsetTop + (where === 'bottom' ? e.offsetHeight : where === 'mid' ? e.offsetHeight / 2 : 0);
      return Math.max(0, Math.min(100, y / H * 100));
    };
    var stops = [
      ['#2f7be0', 0], ['#2f7be0', at('#hero', 'bottom')],
      ['#3a86e6', at('#play', 'bottom')],   // 鮮やかな青空を長めに
      ['#4a7ee2', at('#can', 'bottom')],
      ['#6a6fd6', at('#day', 'mid')],       // 青紫
      ['#8a63c8', at('#staff', 'mid')],     // 紫
      ['#6a4cae', at('#voices', 'bottom')],
      ['#3a3688', at('#price', 'bottom')],  // 深い紫〜ネイビー
      ['#1f2260', at('#faq', 'bottom')],
      ['#0f1440', at('#contact', 'bottom')],
      ['#070a24', at('#future', 'bottom')], // 星空 → 宇宙
      ['#05071a', 100]
    ];
    world.style.background = 'linear-gradient(to bottom,' + stops.map(function (s) { return s[0] + ' ' + s[1].toFixed(2) + '%'; }).join(',') + ')';
    if (worldStars) { // 星：スタッフのあたりからうっすら、夜が深くなるほど多く
      var m = 'linear-gradient(to bottom,transparent 0%,transparent ' + at('#staff', 'top').toFixed(1) + '%,rgba(0,0,0,.3) ' +
        at('#price', 'top').toFixed(1) + '%,#000 ' + at('#future', 'top').toFixed(1) + '%)';
      worldStars.style.webkitMaskImage = m;
      worldStars.style.maskImage = m;
    }
  }

  /* ヘッダー：スクロールしたらすりガラスに／地球の場面では隠す */
  var header = $('.site-header'), stage = $('.earth-stage'), ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight;
    if (header) {
      header.classList.toggle('is-scrolled', y > 40);
      if (stage) {
        var t = stage.getBoundingClientRect();
        header.classList.toggle('is-hidden', t.top <= vh * 0.2 && t.bottom > vh * 0.5);
      }
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  /* 流れ星：夜のあいだだけ、ときどき流れる
     料金〜お問い合わせ（紫〜紺）は控えめ → 星空が深くなるほど少し増える → 地球の場面では出さない */
  var shootLayer = $('.shoot-layer');
  function nightRate() {
    var a = $('#price'), b = $('#future'), e = $('#earth');
    if (!a || !b || !e) return 0;
    var c = (window.scrollY || window.pageYOffset) + window.innerHeight * 0.5;
    var A = a.offsetTop, B = b.offsetTop, S = e.offsetTop;
    if (c < A || c > S) return 0;
    if (c < B) return 0.35 * (c - A) / (B - A);
    return 0.35 + 0.65 * (c - B) / (S - B);
  }
  function shootOnce() {
    var r = nightRate();
    if (r < 0.03 || Math.random() > r * 0.13) return; // rate1で約3秒に1本、rate0.35で約9秒に1本
    var el = document.createElement('span');
    var len = 90 + Math.random() * 160, dur = 0.8 + Math.random() * 0.7;
    el.className = 'shoot';
    el.style.cssText = 'left:' + (Math.random() * 72).toFixed(1) + '%;top:' + (5 + Math.random() * 48).toFixed(1) +
      '%;width:' + len.toFixed(0) + 'px;opacity:' + (0.5 + Math.random() * 0.5).toFixed(2) +
      ';--ang:' + (18 + Math.random() * 22).toFixed(0) + 'deg;--dur:' + dur.toFixed(2) + 's;--dist:' + (len * 2.4).toFixed(0) + 'px';
    shootLayer.appendChild(el);
    setTimeout(function () { el.remove(); }, dur * 1000 + 300);
  }
  if (shootLayer && !reduce) setInterval(shootOnce, 400);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { paintWorld(); onScroll(); });
  window.addEventListener('load', paintWorld);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintWorld);
  paintWorld();
  update();
})();
