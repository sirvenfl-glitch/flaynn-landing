/**
 * Warp transitions + scroll animations — flaynn.fr
 * Handles section entrance animations, warp effect between sections,
 * counter animations, and radar chart deployment.
 */
(function () {
  'use strict';

  var isMobile = window.innerWidth < 768;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── Section entrance animations ───────────────────────────────

  function animateEntrance(section) {
    var animItems = section.querySelectorAll('[data-anim]');
    animItems.forEach(function (el, i) {
      var delay = parseInt(el.getAttribute('data-anim-delay') || (i * 150), 10);
      var type = el.getAttribute('data-anim') || 'fade-up';

      setTimeout(function () {
        el.classList.add('anim-visible');
        el.classList.add('anim-' + type);
      }, reducedMotion ? 0 : delay);
    });
  }

  // ─── Warp effect ───────────────────────────────────────────────

  var warpOverlay = document.querySelector('.warp-overlay');
  var glowPulse = document.querySelector('.glow-pulse');
  var lastSection = -1;
  var warpCooldown = false;

  function triggerWarp() {
    if (warpCooldown || isMobile || reducedMotion) return;
    warpCooldown = true;

    // Speed up starfield
    if (window.starfield) window.starfield.setSpeed(8);

    // Activate warp lines
    if (warpOverlay) {
      warpOverlay.classList.add('active');
      setTimeout(function () {
        warpOverlay.classList.remove('active');
      }, 600);
    }

    // Glow pulse after warp
    setTimeout(function () {
      if (glowPulse) {
        glowPulse.classList.add('active');
        setTimeout(function () {
          glowPulse.classList.remove('active');
        }, 500);
      }
    }, 500);

    // Slow down starfield
    setTimeout(function () {
      if (window.starfield) window.starfield.setSpeed(1);
    }, 600);

    // Cooldown
    setTimeout(function () {
      warpCooldown = false;
    }, 1200);
  }

  // ─── IntersectionObserver for sections ─────────────────────────

  var sections = document.querySelectorAll('[data-section]');

  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var idx = parseInt(entry.target.getAttribute('data-section'), 10);

        // Trigger warp if new section
        if (idx !== lastSection && lastSection !== -1) {
          triggerWarp();
        }
        lastSection = idx;

        // Animate section contents
        if (!entry.target.classList.contains('section-revealed')) {
          entry.target.classList.add('section-revealed');
          animateEntrance(entry.target);
        }
      });
    }, {
      threshold: 0.15
    });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  } else {
    // Fallback: reveal everything
    sections.forEach(function (s) {
      s.classList.add('section-revealed');
      var items = s.querySelectorAll('[data-anim]');
      items.forEach(function (el) { el.classList.add('anim-visible'); });
    });
  }

  // ─── Counter animations ────────────────────────────────────────

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var duration = parseInt(el.getAttribute('data-duration') || '1400', 10);
    var start = performance.now();

    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // Cubic ease out
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    if (reducedMotion) {
      el.textContent = prefix + target + suffix;
    } else {
      requestAnimationFrame(tick);
    }
  }

  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { counterObserver.observe(c); });
  }

  // ─── Pillar bar animations ─────────────────────────────────────

  var bars = document.querySelectorAll('[data-bar]');
  if ('IntersectionObserver' in window && bars.length) {
    var barObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('bar-animated')) {
          entry.target.classList.add('bar-animated');
          var val = entry.target.getAttribute('data-bar');
          entry.target.style.transform = 'scaleX(' + (parseInt(val, 10) / 100) + ')';
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(function (b) { barObserver.observe(b); });
  }

  // ─── Radar chart animation ─────────────────────────────────────

  var radarPoly = document.getElementById('radar-polygon');
  if (radarPoly && 'IntersectionObserver' in window) {
    var radarTarget = radarPoly.getAttribute('data-target-points');
    var radarCenter = radarPoly.getAttribute('data-center');

    var radarObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !radarPoly.classList.contains('radar-animated')) {
          radarPoly.classList.add('radar-animated');

          if (reducedMotion) {
            radarPoly.setAttribute('points', radarTarget);
            return;
          }

          var centerPts = radarCenter.split(' ').map(function (p) {
            return p.split(',').map(Number);
          });
          var targetPts = radarTarget.split(' ').map(function (p) {
            return p.split(',').map(Number);
          });

          var duration = 1000;
          var startTime = performance.now();

          function animRadar(now) {
            var elapsed = now - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);

            var current = centerPts.map(function (cp, i) {
              var tx = targetPts[i][0];
              var ty = targetPts[i][1];
              return (cp[0] + (tx - cp[0]) * eased).toFixed(1) + ',' +
                     (cp[1] + (ty - cp[1]) * eased).toFixed(1);
            }).join(' ');

            radarPoly.setAttribute('points', current);
            if (progress < 1) requestAnimationFrame(animRadar);
          }

          requestAnimationFrame(animRadar);
        }
      });
    }, { threshold: 0.3 });

    radarObserver.observe(radarPoly.closest('svg') || radarPoly);
  }

  // ─── Hero card 3D tilt ─────────────────────────────────────────

  var heroCard = document.querySelector('.hero-card');
  if (heroCard && !isMobile && !reducedMotion) {
    heroCard.style.transform = 'perspective(800px) rotateY(-8deg) rotateX(4deg)';

    heroCard.addEventListener('mousemove', function (e) {
      var rect = heroCard.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      heroCard.style.transform =
        'perspective(800px) rotateY(' + (x * 16).toFixed(1) + 'deg) rotateX(' + (-y * 12).toFixed(1) + 'deg)';
    });

    heroCard.addEventListener('mouseleave', function () {
      heroCard.style.transform = 'perspective(800px) rotateY(-8deg) rotateX(4deg)';
    });
  }

  // ─── Hero staggered entrance ───────────────────────────────────

  var heroItems = document.querySelectorAll('.hero-anim');
  heroItems.forEach(function (el, i) {
    var delay = parseInt(el.getAttribute('data-hero-delay') || (i * 200), 10);
    setTimeout(function () {
      el.classList.add('hero-visible');
    }, reducedMotion ? 0 : delay);
  });

  // ─── Mobile sticky CTA visibility ─────────────────────────────

  if (isMobile) {
    var stickyCta = document.querySelector('.sticky-cta');
    var pricingSection = document.querySelector('[data-section="5"]');

    if (stickyCta && pricingSection && 'IntersectionObserver' in window) {
      var stickyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          stickyCta.classList.toggle('sticky-hidden', entry.isIntersecting);
        });
      }, { threshold: 0.1 });

      stickyObserver.observe(pricingSection);
    }
  }

})();
