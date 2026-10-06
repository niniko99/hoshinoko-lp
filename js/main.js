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

  /* 背景：まゆちゃんの見本の絵（_ref/まゆちゃん_色のイメージ.jpg）のとおりに作る。ページと一緒に流れる
     ・色と並び：見本から取った実際の色をそのまま使う（mayu-sky-strip.png ＝ 見本の左66%を細く縮めたもの）。
       なめらかなグラデなので、ページの高さに合わせて伸ばしても見た目は変わらない
     ・星・天の川：こちらで描く（art.js のタイル）。どの画面サイズでもぼやけず、ページの長さにも合わせられる
     ・明るい星（宵の明星）：見本の絵から小さく切り抜いて置く
     ・最後のアニメーションも、この星空の上で再生する */
  var IMG = { w: 667, h: 2000 };
  // 空の色は mayu-sky-strip2.png（見本の色そのまま。昼を長く、夜を後半にまとめ直したもの）。
  // 以下の数字は、すべて「ページの上から何割の位置か」。画像の高さ＝ページの高さ
  var SKY_END = 1;
  var NIGHT = 0.74, DEEP = 0.85;    // 星が見えはじめる位置／星空が深くなる位置
  var MILKY = [0.77, 0.95];         // 天の川の帯
  var LIGHT_END = 0.63;             // ここまでは空が明るい（文字を濃い色にする範囲）
  var PLANET = { x: 0.829, y: 0.444, page: 0.66 };  // x,y＝見本の絵のどこを切り抜くか／page＝ページのどこに置くか
  var world = $('.world-bg'), planet = $('.world-planet'), worldStars = $('.world-stars'), milky = $('.world-milky'), main = $('main');
  var nightTop = 0;
  function paintWorld() {
    if (!world || !main) return;
    var W = main.clientWidth, H = main.offsetHeight || 1;
    var sh = H / SKY_END;                                  // 伸ばしたあとの、見本の絵の高さ
    var rowY = function (r) { return r * sh; };            // 絵の上から r の位置が、ページのどこに来るか
    var pct = function (y) { return (y / H * 100).toFixed(1) + '%'; };
    world.style.backgroundSize = '100% ' + sh.toFixed(0) + 'px';
    world.style.backgroundPosition = '0 0';
    nightTop = main.offsetTop + rowY(NIGHT);
    if (planet) {  // 明るい星（宵の明星）：見本の絵から小さく切り抜いて、絵のとおりの大きさで置く
      var ps = Math.max(W / IMG.w, 1), d = Math.round(44 * ps);
      planet.style.width = planet.style.height = d + 'px';
      planet.style.left = (PLANET.x * W - d / 2).toFixed(1) + 'px';
      planet.style.top = (rowY(PLANET.page) - d / 2).toFixed(1) + 'px';
      planet.style.backgroundSize = (IMG.w * ps).toFixed(1) + 'px ' + (IMG.h * ps).toFixed(1) + 'px';
      planet.style.backgroundPosition = (d / 2 - PLANET.x * IMG.w * ps).toFixed(1) + 'px ' + (d / 2 - PLANET.y * IMG.h * ps).toFixed(1) + 'px';
    }
    var vh = window.innerHeight || 800;
    // 夕焼けの光のにじみ（ピンクの帯のまんなか）
    var glow = $('.world-glow');
    if (glow) {
      var gh = Math.round(vh * 1.15);
      glow.style.top = (rowY(0.52) - gh / 2).toFixed(0) + 'px';
      glow.style.height = gh + 'px';
    }
    // 水彩の質感：横幅より少し大きめに出して、星の粒が自然な大きさになるようにする
    var tex = $('.world-tex');
    if (tex) {
      var tw = Math.round(Math.max(W * 1.35, 640));
      tex.style.backgroundSize = tw + 'px ' + Math.round(tw * 1316 / 720) + 'px';
      var m = 'linear-gradient(to bottom,transparent 0%,#000 ' + pct(rowY(0.05)) + ',#000 100%)';
      tex.style.webkitMaskImage = m;
      tex.style.maskImage = m;
    }
    if (worldStars) {
      // 昼のあいだはごくうっすら。日が暮れるあたり（6〜7割）からだんだん増えて、
      // 夜に向かってしっかり見えるようにする
      var m = 'linear-gradient(to bottom,rgba(0,0,0,.07) 0%,rgba(0,0,0,.11) ' + pct(rowY(0.40)) +
        ',rgba(0,0,0,.2) ' + pct(rowY(0.58)) + ',rgba(0,0,0,.44) ' + pct(rowY(0.68)) +
        ',rgba(0,0,0,.8) ' + pct(rowY(NIGHT + 0.02)) + ',#000 ' + pct(rowY(DEEP)) + ')';
      worldStars.style.webkitMaskImage = m;
      worldStars.style.maskImage = m;
    }
    if (milky) {
      milky.style.top = rowY(MILKY[0]).toFixed(0) + 'px';
      milky.style.height = (rowY(MILKY[1]) - rowY(MILKY[0])).toFixed(0) + 'px';
    }
    // 空が明るいところ（ページの上から63%まで）にあるセクションは、
    // 白い文字だと読めないので、濃い色にする印をつける
    var secs = main.querySelectorAll(':scope > section');
    for (var si = 0; si < secs.length; si++) {
      var s = secs[si];
      s.classList.toggle('on-light', (s.offsetTop + s.offsetHeight / 2) / H < LIGHT_END);
    }
  }

  /* ヘッダー：スクロールしたらすりガラスに／地球の場面では隠す */
  var header = $('.site-header'), stage = $('.space-stage'), ticking = false;
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
     星空のはじまり（ご利用案内）は控えめ → 星空が深くなるほど少し増える → 地球の場面では出さない */
  var shootLayer = $('.shoot-layer');
  function nightRate() {
    var b = $('#future'), e = $('#earth');
    if (!b || !e || !nightTop) return 0;
    var c = (window.scrollY || window.pageYOffset) + window.innerHeight * 0.5;
    var A = nightTop, B = Math.max(b.offsetTop, A + 1), S = e.offsetTop;
    if (c < A || c > S) return 0;
    if (c < B) return 0.35 * (c - A) / (B - A);
    return 0.35 + 0.65 * (c - B) / Math.max(S - B, 1);
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
