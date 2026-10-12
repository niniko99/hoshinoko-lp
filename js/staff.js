/* 先生紹介：指で横スクロール、ボタンとキーボードでも移動。自動再生なし。 */
(function () {
  'use strict';
  var track = document.getElementById('staff-cards');
  if (!track) return;
  var cards = Array.prototype.slice.call(track.querySelectorAll('.staff'));
  var controls = document.querySelector('.staff-controls');
  var prev = controls.querySelector('.staff-prev');
  var next = controls.querySelector('.staff-next');
  var status = controls.querySelector('.staff-position');
  var current = 0, timer;

  function position(card) {
    return card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
  }
  function update() {
    var nearest = 0, distance = Infinity;
    cards.forEach(function (card, index) {
      var d = Math.abs(position(card) - track.scrollLeft);
      if (d < distance) { distance = d; nearest = index; }
    });
    current = nearest;
    prev.disabled = current === 0;
    next.disabled = current === cards.length - 1;
    status.textContent = (current + 1) + ' / ' + cards.length;
  }
  function go(index, immediate) {
    index = Math.max(0, Math.min(cards.length - 1, index));
    current = index;
    track.scrollTo({ left: position(cards[index]), behavior: 'auto' });
    update();
  }
  function size() {
    // 最後のカードも左端に揃えられる余白。縦方向の操作は捕まえない。
    var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    track.style.setProperty('--staff-tail', Math.max(0, track.clientWidth - cards[cards.length - 1].offsetWidth - gap) + 'px');
    go(current, true);
    update();
  }
  prev.addEventListener('click', function () { go(current - 1); });
  next.addEventListener('click', function () { go(current + 1); });
  track.addEventListener('scroll', function () { clearTimeout(timer); timer = setTimeout(update, 120); }, { passive: true });
  track.addEventListener('keydown', function (event) {
    var index;
    if (event.key === 'ArrowRight') index = current + 1;
    else if (event.key === 'ArrowLeft') index = current - 1;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = cards.length - 1;
    else return;
    event.preventDefault();
    go(index);
  });
  controls.hidden = false;
  if ('ResizeObserver' in window) new ResizeObserver(size).observe(track);
  else window.addEventListener('resize', size);
  size();
})();
