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
  // 空の色は day-sky-strip.png＝実際の空の絵（朝・夏の青空・夕方・夕焼け・夜）から
  // 1行ずつ色を取って、1日ぶんにつないだもの。
  // 以下の数字は、すべて「ページの上から何割の位置か」。画像の高さ＝ページの高さ
  var SKY_END = 1;
  var NIGHT = 0.825, DEEP = 0.895;  // 星が見えはじめる位置／星空が深くなる位置
  var MILKY = [0.87, 0.99];         // 天の川の帯
  var LIGHT_END = 0.775;            // ここまでは空が明るい（文字を濃い色にする範囲。料金欄の下で切りかえる）
  var TEX_IN = 0.79;                // 宇宙の水彩の質感を出しはじめる位置（昼のあいだは出さない）
  var SUNSET = 0.755;               // 夕焼けがいちばん濃いところ
  var PLANET = { x: 0.829, y: 0.444, page: 0.855 };  // x,y＝見本の絵のどこを切り抜くか／page＝ページのどこに置くか
  // 薄い横すじの雲。空の絵から「白いところ」だけを抜いて、横に引きのばしたもの（白＋透明）。
  // 色を持っていないので、うしろの空が青でもピンクでもそのまま馴染む。
  //   page＝ページのどこに置くか／k＝帯の高さの倍率／op＝濃さ／x＝横にずらす量／flip＝左右反転
  // 同じ絵でも、濃さ・向き・横位置・大きさを変えて置くと、くり返しに見えない
  var CLOUDS = [
    { src: 'assets/src/cloudfield-2.png', page: 0.045, k: 1.35, op: 0.78, x: 10 },
    { src: 'assets/src/cloudfield-1.png', page: 0.108, k: 1.55, op: 0.92, x: 62, flip: true },
    { src: 'assets/src/cloudfield-3.png', page: 0.170, k: 1.30, op: 0.70, x: 30 },
    { src: 'assets/src/cloudfield-1.png', page: 0.233, k: 1.60, op: 0.90, x: 84 },
    { src: 'assets/src/cloudfield-2.png', page: 0.295, k: 1.35, op: 0.66, x: 45, flip: true },
    { src: 'assets/src/cloudfield-3.png', page: 0.358, k: 1.55, op: 0.92, x: 8, flip: true },
    { src: 'assets/src/cloudfield-1.png', page: 0.420, k: 1.30, op: 0.70, x: 70 },
    { src: 'assets/src/cloudfield-2.png', page: 0.482, k: 1.55, op: 0.88, x: 24, flip: true },
    { src: 'assets/src/cloudfield-3.png', page: 0.545, k: 1.35, op: 0.74, x: 55 },
    { src: 'assets/src/cloudfield-1.png', page: 0.608, k: 1.55, op: 0.88, x: 16, flip: true },
    { src: 'assets/src/cloudfield-2.png', page: 0.670, k: 1.40, op: 0.84, x: 78 },
    { src: 'assets/src/cloudfield-3.png', page: 0.730, k: 1.35, op: 0.72, x: 38, flip: true },
    { src: 'assets/src/cloudfield-1.png', page: 0.785, k: 1.20, op: 0.34, x: 60 }
  ];
  var world = $('.world-bg'), planet = $('.world-planet'), worldStars = $('.world-stars'), milky = $('.world-milky'), main = $('main');
  // 雲のレイヤーを一度だけ作る
  var cloudBox = $('.world-clouds'), cloudEls = [], cloudBand = [], cloudOn = [];
  if (cloudBox) {
    for (var ci = 0; ci < CLOUDS.length; ci++) {
      var c = CLOUDS[ci], el = document.createElement('div');
      el.className = 'world-cloud';
      el.style.backgroundImage = 'url("' + c.src + '")';
      el.style.opacity = c.op;
      if (c.flip) el.style.transform = 'scaleX(-1)';
      // 横にずらして置く（同じ形でも別の雲に見える）。
      // 上下のふちは画像じたいに黒く溶かしこんであるので、ここで溶かす必要はない
      el.style.backgroundPosition = c.x + '% center';
      el.style.display = 'none';
      cloudBox.appendChild(el);
      cloudEls.push(el);
      cloudBand.push([0, 0]);
      cloudOn.push(false);
    }
  }
  // 雲は、画面のまわりにあるものだけ出す。
  // 14枚ぜんぶ出しっぱなしにすると、スマホで絵がうまく描かれないことがあったため
  function showNearCloudsOnly() {
    if (!cloudEls.length) return;
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight || 800;
    var a = y - vh * 1.3, b = y + vh * 2.3;
    for (var i = 0; i < cloudEls.length; i++) {
      var on = cloudBand[i][1] > a && cloudBand[i][0] < b;
      if (on !== cloudOn[i]) { cloudEls[i].style.display = on ? 'block' : 'none'; cloudOn[i] = on; }
    }
  }
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
    // 雲：横幅と画面の高さの両方を見て帯の高さを決める（スマホで細くなりすぎないように）
    for (var ci = 0; ci < cloudEls.length; ci++) {
      var c = CLOUDS[ci];
      var ch = Math.round(Math.max(W * 0.35, vh * 0.32) * c.k), ct = Math.round(rowY(c.page) - ch / 2);
      cloudEls[ci].style.top = ct + 'px';
      cloudEls[ci].style.height = ch + 'px';
      cloudBand[ci] = [main.offsetTop + ct, main.offsetTop + ct + ch];  // ページ全体での位置
    }
    showNearCloudsOnly();
    // 夕焼けの光のにじみ（空がいちばん赤くなるところ）
    var glow = $('.world-glow');
    if (glow) {
      var gh = Math.round(vh * 1.15);
      glow.style.top = (rowY(SUNSET) - gh / 2).toFixed(0) + 'px';
      glow.style.height = gh + 'px';
    }
    // 水彩の質感：昼のあいだは出さない。日が落ちてから、宇宙に向かってだんだん乗せる
    var tex = $('.world-tex');
    if (tex) {
      var tw = Math.round(Math.max(W * 1.35, 640));
      tex.style.backgroundSize = tw + 'px ' + Math.round(tw * 1316 / 720) + 'px';
      var m = 'linear-gradient(to bottom,transparent 0%,transparent ' + pct(rowY(TEX_IN)) +
        ',rgba(0,0,0,.55) ' + pct(rowY(NIGHT + 0.02)) + ',#000 ' + pct(rowY(DEEP)) + ',#000 100%)';
      tex.style.webkitMaskImage = m;
      tex.style.maskImage = m;
    }
    if (worldStars) {
      // 昼のあいだは星を出さない（ここが「ずっと夜に見える」原因だった）。
      // 夕焼けのおわりに一番星がぽつぽつ出て、夜に向かってしっかり増える
      var m = 'linear-gradient(to bottom,transparent 0%,transparent ' + pct(rowY(0.755)) +
        ',rgba(0,0,0,.10) ' + pct(rowY(0.80)) + ',rgba(0,0,0,.40) ' + pct(rowY(0.835)) +
        ',rgba(0,0,0,.75) ' + pct(rowY(0.865)) + ',#000 ' + pct(rowY(DEEP)) + ')';
      worldStars.style.webkitMaskImage = m;
      worldStars.style.maskImage = m;
    }
    if (milky) {
      milky.style.top = rowY(MILKY[0]).toFixed(0) + 'px';
      milky.style.height = (rowY(MILKY[1]) - rowY(MILKY[0])).toFixed(0) + 'px';
    }
    // 空が明るいところ（ページの上から63%まで）にあるセクションは、
    // 白い文字だと読めないので、濃い色にする印をつける。
    // 1枚目（hero）だけは別。白い文字に濃い影を敷いて読ませる（sections.css の .hero-copy）
    var secs = main.querySelectorAll(':scope > section');
    for (var si = 0; si < secs.length; si++) {
      var s = secs[si];
      s.classList.toggle('on-light', s.id !== 'hero' && (s.offsetTop + s.offsetHeight / 2) / H < LIGHT_END);
    }
  }

  /* ヘッダー：スクロールしたらすりガラスに／地球の場面では隠す */
  var header = $('.site-header'), stage = $('.space-stage'), ticking = false;
  function update() {
    ticking = false;
    showNearCloudsOnly();
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
  // ページの高さは、あとから読みこまれる写真でどんどん伸びる。
  // 伸びたままにしておくと、空がページの下までとどかず、下のほうが地の色のままになる。
  // だから高さが変わったら空を引きなおす
  if (main && 'ResizeObserver' in window) {
    var lastH = 0, rt = 0;
    new ResizeObserver(function () {
      var h = main.offsetHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      clearTimeout(rt);
      rt = setTimeout(paintWorld, 60);
    }).observe(main);
  }
  paintWorld();
  update();
})();
