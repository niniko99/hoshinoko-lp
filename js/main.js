/* ===== 動き：ふわっと表示・ヘッダー・雲の奥行き・1文字ずつ ===== */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 「今日も最高に楽しかった！」を1文字ずつに分ける */
  var big = document.querySelector('.today-big');
  if (big && !reduce) {
    var i = 0;
    big.querySelectorAll('.l').forEach(function (line) {
      var text = line.textContent;
      line.textContent = '';
      Array.prototype.forEach.call(text, function (ch) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--i', i++);
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

  /* ヘッダー：背景の明るさに合わせて色を変える／宇宙のシーンでは隠す */
  var header = document.querySelector('.site-header');
  var darkSections = document.querySelectorAll('main > section[data-tone="dark"]');
  var spaceStage = document.querySelector('.space-stage');
  var parallax = document.querySelectorAll('[data-parallax]');
  var hero = document.querySelector('.s-hero');
  var ticking = false;

  /* 背景の空：スクロールに合わせて、次の空へゆっくり移り変わる
     s2=昼／s3=夕方前／s4=夕方／s5=夜。この目印の下端を通るころに切り替わる */
  var skies = document.querySelectorAll('.sky-layer .sky');
  var skyMarks = ['#hero', '#try', '#together', '#today'];
  function skyUpdate(y, vh) {
    if (skies.length < 2) return;
    var c = y + vh * 0.4, F = vh * 0.2;
    for (var i = 1; i < skies.length; i++) {
      var el = document.querySelector(skyMarks[i - 1]);
      if (!el) continue;
      var b = el.offsetTop + el.offsetHeight;
      var o = Math.min(1, Math.max(0, (c - (b - F)) / (2 * F)));
      skies[i].style.opacity = o.toFixed(3);
    }
  }

  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    skyUpdate(y, vh);

    if (header) {
      header.classList.toggle('is-scrolled', y > 40);
      var mid = header.offsetHeight / 2, dark = false;
      darkSections.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) dark = true;
      });
      header.setAttribute('data-tone', dark ? 'dark' : 'light');
      if (spaceStage) {
        var t = spaceStage.getBoundingClientRect();
        header.classList.toggle('is-hidden', t.top <= vh * 0.2 && t.bottom > vh * 0.5);
      }
    }

    if (!reduce && hero && y < hero.offsetHeight * 1.2) {
      parallax.forEach(function (el) {
        el.style.transform = 'translate3d(0,' + (y * parseFloat(el.getAttribute('data-parallax'))).toFixed(1) + 'px,0)';
      });
    }
  }
  /* 流れ星：夜のあいだだけ、ときどき流れる
     ご利用案内（紫〜紺）のあたりは控えめ → 夜が深くなるほど少し増える → 宇宙では出さない */
  var shootLayer = document.querySelector('.shoot-layer');
  function nightRate() {
    var info = document.querySelector('#info'), fut = document.querySelector('#future'), stage = document.querySelector('.space-stage');
    if (!info || !fut || !stage) return 0;
    var c = (window.scrollY || window.pageYOffset) + window.innerHeight * 0.5;
    var a = info.offsetTop, b = fut.offsetTop, s = fut.offsetTop + fut.offsetHeight;
    if (c < a || c > s) return 0;              // 夜の前と、宇宙に入ってからは出さない
    if (c < b) return 0.35 * (c - a) / (b - a); // 紫〜紺：控えめ
    return 0.35 + 0.65 * (c - b) / (s - b);     // 星空が深くなるほど少し増やす
  }
  function shootOnce() {
    if (!shootLayer || reduce) return;
    var r = nightRate();
    if (r < 0.03 || Math.random() > r * 0.13) return; // rate1で約3秒に1本、rate0.35で約9秒に1本
    var el = document.createElement('span');
    var len = 90 + Math.random() * 160;
    var dur = 0.8 + Math.random() * 0.7;
    el.className = 'shoot';
    el.style.cssText = 'left:' + (Math.random() * 72).toFixed(1) + '%;top:' + (5 + Math.random() * 48).toFixed(1) +
      '%;width:' + len.toFixed(0) + 'px;opacity:' + (0.5 + Math.random() * 0.5).toFixed(2) +
      ';--ang:' + (18 + Math.random() * 22).toFixed(0) + 'deg;--dur:' + dur.toFixed(2) + 's;--dist:' + (len * 2.4).toFixed(0) + 'px';
    shootLayer.appendChild(el);
    setTimeout(function () { el.remove(); }, dur * 1000 + 300);
  }
  if (shootLayer && !reduce) setInterval(shootOnce, 400);

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
