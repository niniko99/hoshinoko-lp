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

  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;

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
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
