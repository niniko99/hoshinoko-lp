/* ===== 絵を描く：星空のタイル・紙の質感 ===== */
(function () {
  'use strict';

  // 毎回同じ絵になるように、決まった順番で乱数を出す
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var f1 = function (n) { return n.toFixed(1); };
  var root = document.documentElement.style;

  /* 紙の質感 */
  (function grain() {
    var c = document.createElement('canvas');
    c.width = c.height = 180;
    var ctx = c.getContext('2d');
    if (!ctx) return;
    var img = ctx.createImageData(180, 180), d = img.data, R = rng(7);
    for (var i = 0; i < d.length; i += 4) {
      var v = R() < 0.5 ? 0 : 255;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = R() * 16;
    }
    ctx.putImageData(img, 0, 0);
    root.setProperty('--grain', 'url(' + c.toDataURL() + ')');
  })();

  /* 星空のタイル（細かい星。夜が深くなるほど見えるように、main.js が見える範囲を決める） */
  function starTile(size, count, seed, maxR) {
    var R = rng(seed), c = '', tints = ['#ffffff', '#ffffff', '#ffffff', '#fff1c4', '#d6e4ff'];
    for (var i = 0; i < count; i++) {
      var r = Math.pow(R(), 3) * maxR + 0.4;
      c += '<circle cx="' + f1(R() * size) + '" cy="' + f1(R() * size) + '" r="' + r.toFixed(2) +
        '" fill="' + tints[Math.floor(R() * tints.length)] + '" fill-opacity="' + (0.35 + R() * 0.65).toFixed(2) + '"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '">' + c + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }
  root.setProperty('--stars-a', starTile(620, 90, 11, 1.1));
  root.setProperty('--stars-b', starTile(940, 60, 23, 1.9));
})();
