/* ================================================================
   ONYX — Pixel-art character renderer + behaviors
   32x32 sprite, canvas-based, crisp at any scale.
   ================================================================ */
(function () {
  'use strict';

  var S = 32;

  // 5-color palette
  var body   = '#161616';
  var hi     = '#252525';
  var gold   = '#c9a84c';
  var wht    = '#fff8e1';
  var sock   = '#050505';
  var outline = '#2a2218'; // dark gold outline

  // Body silhouette: [y, x, w]
  var B = [
    [3,11,1],[3,21,1],                                            // ear tips
    [4,10,2],[4,21,2],                                            // ear bases
    [5,10,13],[6,9,15],[7,8,17],                                  // head
    [8,7,19],[9,7,19],[10,7,19],[11,7,19],[12,7,19],[13,7,19],   // face
    [14,7,19],[15,7,19],[16,7,19],
    [17,6,21],[18,6,21],[19,6,21],[20,6,21],                     // body
    [21,7,19],[22,8,17],[23,9,15],[24,10,13],[25,11,11],         // taper
    [26,11,3],[26,19,3],[27,11,3],[27,19,3],                     // feet
  ];

  // Eye sockets: top-left corner, 5x5
  var EL = { x: 10, y: 11 };
  var ER = { x: 18, y: 11 };

  // ---------- State ----------
  var breathY  = 0;
  var jumpY    = 0;
  var eyeX     = 0;  // -1 / 0 / 1
  var eyeY     = 0;
  var blinking = false;
  var perked   = false;
  var lookPhase = 0; // 0=track, 1=left, 2=right
  var sparks   = [];
  var perkUntil = 0;

  var mx = 0.5, my = 0.5;
  var mcx = 0, mcy = 0;

  // ---------- Canvas refs ----------
  var mainC = document.getElementById('onyx-main-canvas');
  var miniC = document.getElementById('onyx-corner-canvas');
  var mainX = mainC ? mainC.getContext('2d') : null;
  var miniX = miniC ? miniC.getContext('2d') : null;

  if (!mainX && !miniX) return;

  // ---------- Draw ----------
  function draw(ctx) {
    ctx.clearRect(0, 0, S, S);
    var by = Math.round(breathY + jumpY);

    // Gold outline (1px expanded silhouette drawn first)
    ctx.fillStyle = outline;
    for (var i = 0; i < B.length; i++) {
      var sy = B[i][0], sx = B[i][1], sw = B[i][2];
      ctx.fillRect(sx - 1, sy + by - 1, sw + 2, 3); // expand 1px in all directions
    }

    // Body (drawn on top of outline)
    ctx.fillStyle = body;
    for (var i = 0; i < B.length; i++) {
      ctx.fillRect(B[i][1], B[i][0] + by, B[i][2], 1);
    }

    // Highlight (top head edge)
    ctx.fillStyle = hi;
    ctx.fillRect(10, 5 + by, 13, 1);
    ctx.fillRect(9, 6 + by, 1, 1);
    ctx.fillRect(23, 6 + by, 1, 1);

    // Gold forehead mark
    ctx.fillStyle = gold;
    ctx.fillRect(16, 8 + by, 1, 1);

    // Eyes
    drawEyes(ctx, by);

    // Sparkles
    ctx.fillStyle = gold;
    for (var j = sparks.length - 1; j >= 0; j--) {
      var sp = sparks[j];
      sp.t++;
      if (sp.t > sp.l) { sparks.splice(j, 1); continue; }
      if (Math.floor(sp.t / sp.b) % 2 === 0) {
        ctx.fillRect(Math.round(sp.x), Math.round(sp.y + by), 1, 1);
      }
      sp.x += sp.vx;
      sp.y += sp.vy;
    }
  }

  function drawEyes(ctx, by) {
    var ox = eyeX, oy = eyeY;
    var tall = perked ? 6 : 5;
    var sy = perked ? -1 : 0;

    // Sockets
    ctx.fillStyle = sock;
    ctx.fillRect(EL.x, EL.y + by + sy, 5, tall);
    ctx.fillRect(ER.x, ER.y + by + sy, 5, tall);

    if (blinking) {
      // Closed — thin gold slit
      ctx.fillStyle = gold;
      ctx.fillRect(EL.x + 1, EL.y + 2 + by, 3, 1);
      ctx.fillRect(ER.x + 1, ER.y + 2 + by, 3, 1);
      return;
    }

    // Iris position (3x3, slides ±1 in socket)
    var ix = 1 + ox;
    var iy = 1 + oy;
    var ih = perked ? 4 : 3;
    var iyo = perked ? iy - 1 : iy;

    ctx.fillStyle = gold;
    ctx.fillRect(EL.x + ix, EL.y + iyo + by, 3, ih);
    ctx.fillRect(ER.x + ix, ER.y + iyo + by, 3, ih);

    // Catchlight
    ctx.fillStyle = wht;
    ctx.fillRect(EL.x + ix, EL.y + iyo + by, 1, 1);
    ctx.fillRect(ER.x + ix, ER.y + iyo + by, 1, 1);
  }

  // ---------- Mouse ----------
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX / window.innerWidth;
    my = e.clientY / window.innerHeight;
    mcx = e.clientX;
    mcy = e.clientY;
  });

  // ---------- Blink ----------
  (function loop() {
    setTimeout(function () {
      blinking = true;
      setTimeout(function () { blinking = false; loop(); }, 100);
    }, (4 + Math.random() * 3) * 1000);
  })();

  // ---------- Look-around ----------
  (function loop() {
    setTimeout(function () {
      lookPhase = 1;
      setTimeout(function () {
        lookPhase = 2;
        setTimeout(function () { lookPhase = 0; loop(); }, 800);
      }, 800);
    }, (15 + Math.random() * 5) * 1000);
  })();

  // ---------- Celebrate (global) ----------
  window.onyxCelebrate = function () {
    jumpY = -3;
    setTimeout(function () { jumpY = -1; }, 100);
    setTimeout(function () { jumpY = 0; }, 200);
    for (var i = 0; i < 12; i++) {
      sparks.push({
        x: 10 + Math.random() * 12,
        y: 4 + Math.random() * 16,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.15 - Math.random() * 0.3,
        t: 0,
        l: 25 + Math.random() * 30,
        b: 3 + Math.floor(Math.random() * 3),
      });
    }
    perkUntil = Date.now() + 1500;
  };

  // ---------- Perk (global — called by chat) ----------
  window.onyxPerk = function () {
    perkUntil = Date.now() + 800;
  };

  // ---------- Corner fade near final CTA ----------
  var cornerEl = document.getElementById('onyx-corner');
  var finalSec = document.querySelector('.final');
  if (cornerEl && finalSec) {
    new IntersectionObserver(function (entries) {
      cornerEl.style.opacity = entries[0].isIntersecting ? '0' : '1';
    }, { threshold: 0.3 }).observe(finalSec);
  }

  // ---------- Animation loop ----------
  var bt = 0;
  var last = 0;

  function tick(now) {
    var dt = (now - last) / 1000;
    last = now;
    if (dt > 0.1) dt = 0.016; // cap on tab-switch

    // Breathing: 1px rise every ~2 sec
    bt += dt;
    breathY = Math.sin(bt * 1.5) > 0.3 ? -1 : 0;

    // Eye tracking
    if (lookPhase === 0) {
      eyeX = mx < 0.33 ? -1 : mx > 0.67 ? 1 : 0;
      eyeY = my < 0.33 ? -1 : my > 0.67 ? 1 : 0;
    } else if (lookPhase === 1) {
      eyeX = -1; eyeY = 0;
    } else {
      eyeX = 1; eyeY = 0;
    }

    // Hover perk (main canvas, 150px radius)
    var hoverPerk = false;
    if (mainC) {
      var r = mainC.getBoundingClientRect();
      var dx = mcx - (r.left + r.width / 2);
      var dy = mcy - (r.top + r.height / 2);
      hoverPerk = Math.sqrt(dx * dx + dy * dy) < 150;
    }
    perked = hoverPerk || Date.now() < perkUntil;

    // Draw both canvases
    if (mainX) draw(mainX);
    if (miniX) draw(miniX);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

})();
