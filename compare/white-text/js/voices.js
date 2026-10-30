/* Voice disclosure is opt-in: no approved data-voices-initial value means no changes. */
(function () {
  'use strict';
  var lists = document.querySelectorAll('#kidsvoice .kv-list[data-voices-initial], #voices .voices[data-voices-initial]');
  Array.prototype.forEach.call(lists, function (list) {
    var raw = list.getAttribute('data-voices-initial');
    if (!/^[1-9]\d*$/.test(raw || '')) return;
    var initial = Number(raw);
    var items = Array.prototype.slice.call(list.children);
    if (!Number.isSafeInteger(initial) || initial >= items.length || list.getAttribute('data-voices-ready') === 'true') return;

    var section = list.closest('section');
    var label = section && section.id === 'kidsvoice' ? '子どもたちの声' : '保護者の声';
    var extra = items.slice(initial);
    var id = list.id;
    if (!id) {
      var base = section && section.id === 'kidsvoice' ? 'kidsvoice-items' : 'parents-voice-items';
      id = base;
      for (var suffix = 2; document.getElementById(id); suffix++) id = base + '-' + suffix;
      list.id = id;
    }
    var controls = document.createElement('div');
    controls.className = 'voices-controls';
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'voices-toggle';
    button.setAttribute('aria-controls', id);
    var expanded = false;
    function update() {
      extra.forEach(function (item) {
        item.hidden = !expanded;
        // Newly revealed cards should not wait for the page's one-shot reveal observer.
        if (expanded) item.classList.add('is-in');
      });
      button.textContent = expanded ? '閉じる' : 'もっと見る';
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', expanded ? label + 'の追加分を閉じる' : label + 'をもっと見る（残り' + extra.length + '件）');
    }
    controls.appendChild(button);
    list.insertAdjacentElement('afterend', controls);
    list.classList.add('voices-list-collapsible');
    list.setAttribute('data-voices-ready', 'true');
    update();
    button.addEventListener('click', function () {
      var closing = expanded;
      var before = button.getBoundingClientRect();
      var wasInView = before.top >= 0 && before.bottom <= window.innerHeight;
      if (closing) button.focus({ preventScroll: true });
      expanded = !expanded;
      update();
      if (closing && wasInView) {
        // Keep the closing control at its prior viewport position as the list shrinks.
        var delta = button.getBoundingClientRect().top - before.top;
        if (Math.abs(delta) > 1) {
          var root = document.documentElement;
          var previous = root.style.scrollBehavior;
          root.style.scrollBehavior = 'auto';
          window.scrollBy(0, delta);
          requestAnimationFrame(function () { root.style.scrollBehavior = previous; });
        }
      }
    });
  });
})();
