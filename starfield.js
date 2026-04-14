/**
 * Starfield Canvas — flaynn.fr
 * 3-layer parallax star field with speed API for warp effect.
 * Respects prefers-reduced-motion.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const isMobile = window.innerWidth < 768;
  const STAR_COUNT = isMobile ? 100 : 250;
  const LAYERS = [0.5, 1, 1.5]; // depth multipliers
  const BASE_DRIFT = 0.15; // px per frame

  let speed = 1;
  let targetSpeed = 1;
  let w = 0;
  let h = 0;
  let stars = [];
  let rafId = null;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.5,
        o: 0.3 + Math.random() * 0.5,
        layer: LAYERS[Math.floor(Math.random() * LAYERS.length)]
      });
    }
  }

  function draw() {
    // Smooth speed interpolation
    speed += (targetSpeed - speed) * 0.08;

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Move
      s.y += BASE_DRIFT * s.layer * speed;

      // Warp stretch effect
      const stretch = speed > 2 ? Math.min((speed - 2) * 0.4, 6) * s.layer : 0;

      // Wrap around
      if (s.y - stretch > h) {
        s.y = -stretch;
        s.x = Math.random() * w;
      }

      ctx.globalAlpha = Math.min(s.o + (speed > 2 ? 0.2 : 0), 1);
      ctx.fillStyle = '#fff';

      if (stretch > 1) {
        // Draw as line during warp
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - stretch);
        ctx.lineTo(s.x, s.y + stretch);
        ctx.lineWidth = s.r * 0.8;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(draw);
  }

  function init() {
    if (reducedMotion) {
      // Static render: draw once
      resize();
      createStars();
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        ctx.globalAlpha = s.o;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return;
    }

    resize();
    createStars();
    draw();
  }

  window.addEventListener('resize', function () {
    resize();
    createStars();
  });

  // Public API
  window.starfield = {
    setSpeed: function (multiplier) {
      targetSpeed = Math.max(1, multiplier);
    },
    getSpeed: function () {
      return speed;
    }
  };

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
