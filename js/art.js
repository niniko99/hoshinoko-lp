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

  /* 星空のタイル（細かい星。いちばん上から下までずっと見える。濃さは main.js が決める）
     こうの絵に寄せて、星はまんべんなくではなく「集まっているところ」と「少ないところ」をつくる */
  function starTile(size, count, seed, maxR) {
    var R = rng(seed), c = '', tints = ['#ffffff', '#ffffff', '#ffffff', '#fff1c4', '#d6e4ff'];
    var hubs = [];
    for (var k = 0; k < 5; k++) hubs.push([R() * size, R() * size, size * (0.16 + R() * 0.2)]);
    for (var i = 0; i < count; i++) {
      var x, y;
      if (R() < 0.66) {                       // 3分の2は、集まっているところへ寄せる
        var hb = hubs[Math.floor(R() * hubs.length)];
        var ang = R() * 6.2832, dd = Math.pow(R(), 0.7) * hb[2];
        x = (hb[0] + Math.cos(ang) * dd + size) % size;
        y = (hb[1] + Math.sin(ang) * dd + size) % size;
      } else {                                // 残りはまんべんなく
        x = R() * size; y = R() * size;
      }
      var r = Math.pow(R(), 3.2) * maxR + 0.32;
      c += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + r.toFixed(2) +
        '" fill="' + tints[Math.floor(R() * tints.length)] + '" fill-opacity="' + (0.3 + R() * 0.68).toFixed(2) + '"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '">' + c + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  /* 黄色い星（こうの絵にある、ぽってりした五角の星）。ごく少なく散らす */
  function goldTile(size, count, seed) {
    var R = rng(seed), c = '';
    for (var i = 0; i < count; i++) {
      var cxv = R() * size, cyv = R() * size, rad = 7 + R() * 6, rot = R() * 72, pts = '';
      for (var p = 0; p < 10; p++) {
        var ang = (p * 36 + rot) * Math.PI / 180 - Math.PI / 2;
        var rr = p % 2 ? rad * 0.47 : rad;
        pts += f1(cxv + Math.cos(ang) * rr) + ',' + f1(cyv + Math.sin(ang) * rr) + ' ';
      }
      c += '<polygon points="' + pts.trim() + '" fill="#ffd968" fill-opacity="' + (0.5 + R() * 0.32).toFixed(2) +
        '" stroke="#fff0b8" stroke-width="1.2" stroke-opacity="' + (0.3 + R() * 0.3).toFixed(2) + '" stroke-linejoin="round"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '">' + c + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  /* キラキラ（四方向にのびる光をもつ、大きめの星）。宇宙っぽさはこれで出る */
  function sparkleTile(size, count, seed) {
    var R = rng(seed), c = '', tints = ['#ffffff', '#ffffff', '#fff3cd', '#cfe0ff'];
    for (var i = 0; i < count; i++) {
      var x = R() * size, y = R() * size, s = 3.4 + Math.pow(R(), 2) * 7.5;
      var o = (0.4 + R() * 0.5).toFixed(2), t = tints[Math.floor(R() * tints.length)], k = s * 0.3;
      // 中心から上下左右へすっとのびる、細い光の十字
      c += '<path d="M' + f1(x) + ' ' + f1(y - s) + 'Q' + f1(x + k) + ' ' + f1(y - k) + ' ' + f1(x + s) + ' ' + f1(y) +
        'Q' + f1(x + k) + ' ' + f1(y + k) + ' ' + f1(x) + ' ' + f1(y + s) +
        'Q' + f1(x - k) + ' ' + f1(y + k) + ' ' + f1(x - s) + ' ' + f1(y) +
        'Q' + f1(x - k) + ' ' + f1(y - k) + ' ' + f1(x) + ' ' + f1(y - s) +
        'Z" fill="' + t + '" fill-opacity="' + o + '"/>';
      c += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + (s * 0.2).toFixed(2) + '" fill="' + t + '" fill-opacity="' + o + '"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '">' + c + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  root.setProperty('--stars-a', starTile(560, 420, 11, 1.0));   // ごく細かい星をたくさん
  root.setProperty('--stars-b', starTile(900, 170, 23, 2.3));   // ときどき大きめの星
  root.setProperty('--stars-c', starTile(260, 210, 37, 0.8));   // 天の川の帯（細かい星が集まったところ）
  root.setProperty('--sparkle', sparkleTile(1500, 3, 53));      // 光がのびる星は、ごくたまに
  root.setProperty('--gold', goldTile(1700, 2, 71));            // 黄色い星も、ごくたまに
})();
