/**
 * Quick Score widget — flaynn.fr
 * Calls POST https://flaynn.tech/api/mini-score
 */
(function () {
  'use strict';

  var form = document.getElementById('quickscore-form');
  var input = document.getElementById('quickscore-input');
  var btn = document.getElementById('quickscore-btn');
  var result = document.getElementById('quickscore-result');
  var scoreEl = document.getElementById('quickscore-score');
  var conseilEl = document.getElementById('quickscore-conseil');
  var fullCta = document.getElementById('quickscore-full-cta');

  if (!form || !input) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var idea = input.value.trim();
    if (!idea) return;

    // Loading state
    btn.disabled = true;
    btn.textContent = 'Analyse en cours...';
    result.classList.remove('qs-visible');

    // Track event
    if (window.plausible) {
      window.plausible('quickscore_submit');
    }

    fetch('https://flaynn.tech/api/mini-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: idea })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(function (data) {
        scoreEl.textContent = data.score + '/100';
        conseilEl.textContent = data.conseil;
        result.classList.add('qs-visible');
        if (fullCta) fullCta.style.display = 'inline-flex';
      })
      .catch(function () {
        scoreEl.textContent = '--';
        conseilEl.textContent = 'Service temporairement indisponible. Essayez le scoring complet.';
        result.classList.add('qs-visible');
      })
      .finally(function () {
        btn.disabled = false;
        btn.innerHTML = 'Tester <span class="btn-arrow">\u2192</span>';
      });
  });

  // Track full CTA click
  if (fullCta) {
    fullCta.addEventListener('click', function () {
      if (window.plausible) {
        window.plausible('quickscore_to_full');
      }
    });
  }
})();
