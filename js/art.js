/* ===== 絵を描く：星・色とりどりの星・夜の街・紙の質感 ===== */
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

  /* 星空のタイル */
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
  root.setProperty('--stars-c', starTile(780, 26, 37, 1.6));

  // 青空（①）と夕方（⑦）は、こうの絵（poster-sky／poster-evening。PC用・スマホ用）をCSSで背景にしている

  /* 「みんな大切なひとり」：色も大きさも違う星 */
  (function scatter() {
    var box = document.querySelector('.star-scatter');
    if (!box) return;
    var R = rng(17), colors = ['#f6c945', '#8fc9f0', '#f39bb3', '#9ed9a5', '#b79be6', '#f6a66b', '#7fb0e8'], html = '';
    for (var i = 0; i < 20; i++) {
      var left = i % 2 ? 80 + R() * 17 : 2 + R() * 17, col = colors[i % colors.length];
      html += '<svg viewBox="0 0 24 24" style="left:' + f1(left) + '%;top:' + f1(6 + R() * 86) + '%;--s:' + Math.round(14 + R() * 22) +
        'px;--t:' + f1(3 + R() * 4) + 's;--dl:-' + f1(R() * 4) + 's;fill:' + col + ';stroke:' + col + '"><use href="#i-star"/></svg>';
    }
    box.innerHTML = html;
  })();

  /* 宇宙の画面：ポスターのような黄色い星 */
  (function spaceStars() {
    var box = document.querySelector('.star-deco');
    if (!box) return;
    var R = rng(41), html = '';
    for (var i = 0; i < 14; i++) {
      html += '<svg viewBox="0 0 24 24" style="left:' + f1(2 + R() * 94) + '%;top:' + f1(2 + R() * 92) +
        '%;--s:' + Math.round(9 + R() * 14) + 'px;--t:' + f1(2.5 + R() * 3) + 's;--dl:-' + f1(R() * 4) + 's"><use href="#i-star"/></svg>';
    }
    box.innerHTML = html;
  })();

  /* 夜の街：家の窓にあかり */
  (function town() {
    var box = document.querySelector('.town');
    if (!box) return;
    var W = 1600, H = 240, R = rng(29);
    var g1 = function (x) { return 196 + 7 * Math.sin(x / 260); };
    var g2 = function (x) { return 150 + 16 * Math.sin(x / 330 + 1) + 9 * Math.sin(x / 140); };
    var path = function (fn) {
      var d = 'M0 ' + f1(fn(0));
      for (var x = 40; x <= W; x += 40) d += ' L' + x + ' ' + f1(fn(x));
      return d + ' V' + H + ' H0Z';
    };
    var s = '<defs><radialGradient id="win"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient></defs>';
    s += '<path d="' + path(g2) + '" fill="#0b1030"/>';
    var shapes = '', lights = '';
    for (var x = 30; x < W - 40;) {
      var gy = g1(x) + 4;
      if (R() < 0.62) {
        var w = 46 + R() * 42, h = 34 + R() * 34, roof = 14 + R() * 16;
        shapes += '<rect x="' + f1(x) + '" y="' + f1(gy - h) + '" width="' + f1(w) + '" height="' + f1(h + 8) + '"/>';
        shapes += '<path d="M' + f1(x - 5) + ' ' + f1(gy - h) + ' L' + f1(x + w / 2) + ' ' + f1(gy - h - roof) + ' L' + f1(x + w + 5) + ' ' + f1(gy - h) + 'Z"/>';
        var n = 1 + Math.floor(R() * 3);
        for (var k = 0; k < n; k++) {
          if (R() < 0.25) continue;
          var wx = x + 9 + k * ((w - 18) / n), wy = gy - h + 10 + R() * (h - 26);
          lights += '<circle cx="' + f1(wx + 5) + '" cy="' + f1(wy + 6) + '" r="18" fill="url(#win)"/>' +
            '<rect x="' + f1(wx) + '" y="' + f1(wy) + '" width="10" height="12" rx="1.5" fill="#ffd98a"/>';
        }
        x += w + 14 + R() * 40;
      } else {
        var tr = 12 + R() * 16;
        shapes += '<circle cx="' + f1(x + tr) + '" cy="' + f1(gy - tr * 1.5) + '" r="' + f1(tr) + '"/><rect x="' + f1(x + tr - 2) + '" y="' + f1(gy - tr) + '" width="4" height="' + f1(tr + 4) + '"/>';
        x += tr * 2 + 10 + R() * 30;
      }
    }
    // 天体観測ドーム
    var dx = 1240, dy = g1(dx) + 4;
    shapes += '<rect x="' + (dx - 34) + '" y="' + f1(dy - 40) + '" width="68" height="44"/><path d="M' + (dx - 40) + ' ' + f1(dy - 40) + ' a40 36 0 0 1 80 0Z"/>';
    s += '<path d="' + path(g1) + '" fill="#03050f"/><g fill="#03050f">' + shapes + '</g>' + lights;
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMax slice">' + s + '</svg>';
  })();
})();
