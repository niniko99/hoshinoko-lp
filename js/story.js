(function () {
  'use strict';
  var dialog = document.getElementById('brand-story');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.story-open'));
  var close = dialog.querySelector('.story-close');
  var content = dialog.querySelector('.story-body');
  var opener, scrollY = 0, bodyStyle, htmlOverflow, htmlScrollBehavior;
  // 入口は写真の下へ独立。演出の透明度に関係なく利用できる。
  triggers.forEach(function (button) { button.disabled = false; });

  triggers.forEach(function (button) {
    button.addEventListener('click', function () {
      if (dialog.open) return;
      opener = button;
      scrollY = window.scrollY;
      bodyStyle = document.body.style.cssText;
      htmlOverflow = document.documentElement.style.overflow;
      htmlScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = -scrollY + 'px';
      document.body.style.width = '100%';
      dialog.showModal();
      content.scrollTop = 0;
      close.focus({ preventScroll: true });
    });
  });
  close.addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('cancel', function (event) { event.preventDefault(); dialog.close(); });
  var startedOutside = false;
  function outside(event) {
    var box = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom);
  }
  dialog.addEventListener('pointerdown', function (event) { startedOutside = outside(event); });
  dialog.addEventListener('click', function (event) {
    if (startedOutside && outside(event)) dialog.close();
    startedOutside = false;
  });
  dialog.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    var items = [close, content];
    var first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  dialog.addEventListener('close', function () {
    document.body.style.cssText = bodyStyle;
    document.documentElement.style.overflow = htmlOverflow;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollY);
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    requestAnimationFrame(function () { document.documentElement.style.scrollBehavior = htmlScrollBehavior; });
  });
})();
