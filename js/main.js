// Інтерактив лендінгу: FAQ, калькулятор, карусель відгуків, мобільне меню.
(function () {
  'use strict';

  /* ---------- FAQ: відкритий лише один пункт ---------- */
  function initFaq() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
    if (!items.length) return;

    function setOpen(item, open) {
      var btn = item.querySelector('.faq-q');
      var answer = item.querySelector('.faq-a');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      item.querySelector('.faq-sign').textContent = open ? '−' : '+';
      answer.hidden = !open;
    }

    // Стартовий стан як у макеті: відкрите перше питання.
    items.forEach(function (item, i) { setOpen(item, i === 0); });

    items.forEach(function (item) {
      item.querySelector('.faq-q').addEventListener('click', function () {
        var wasOpen = this.getAttribute('aria-expanded') === 'true';
        items.forEach(function (other) { setOpen(other, false); });
        if (!wasOpen) setOpen(item, true);
      });
    });
  }

  /* ---------- Калькулятор: коефіцієнт = (новий Ø / старий Ø)² ---------- */
  function initCalc() {
    var from = document.getElementById('d1');
    var to = document.getElementById('d2');
    var amt = document.getElementById('d3');
    var factorOut = document.getElementById('calc-factor');
    var resultOut = document.getElementById('calc-result');
    if (!from || !to || !amt || !factorOut || !resultOut) return;

    function num(input) {
      var v = String(input.value).trim().replace(',', '.');
      return v === '' ? NaN : parseFloat(v);
    }
    function fmt(n) {
      return (Math.round(n * 100) / 100).toString().replace('.', ',');
    }

    function update() {
      var f = num(from), t = num(to), a = num(amt);
      var ok = f > 0 && t > 0 && a >= 0;
      if (!ok) {
        factorOut.textContent = '× —';
        resultOut.textContent = '— г';
        return;
      }
      var factor = (t / f) * (t / f);
      factorOut.textContent = '× ' + fmt(factor);
      resultOut.textContent = Math.round(a * factor) + ' г';
    }

    [from, to, amt].forEach(function (el) { el.addEventListener('input', update); });
    update();
  }

  /* ---------- Карусель відгуків ---------- */
  function initCarousel() {
    var root = document.querySelector('.rv');
    if (!root) return;
    var view = root.querySelector('.rv-view');
    var track = root.querySelector('.rv-track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.rv-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.rv-dot'));
    var btns = root.querySelectorAll('.rv-btn');
    var count = slides.length;
    var current = 0;
    if (!count) return;

    function go(i) {
      current = (i % count + count) % count; // по колу в обидва боки
      track.style.transform = 'translateX(' + (-100 * current) + '%)';
      slides.forEach(function (s, k) { s.setAttribute('aria-hidden', k === current ? 'false' : 'true'); });
      dots.forEach(function (d, k) {
        d.classList.toggle('is-active', k === current);
        if (k === current) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    }

    btns[0].addEventListener('click', function () { go(current - 1); });
    btns[1].addEventListener('click', function () { go(current + 1); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });

    // Стрілки на клавіатурі, коли фокус усередині каруселі.
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(current - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { go(current + 1); e.preventDefault(); }
    });

    // Свайп пальцем (і мишею).
    var startX = null, startY = null;
    view.addEventListener('pointerdown', function (e) { startX = e.clientX; startY = e.clientY; });
    view.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      startX = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1));
    });
    view.addEventListener('pointercancel', function () { startX = null; });

    go(0);
  }

  /* ---------- Мобільне меню ---------- */
  function initMenu() {
    var nav = document.querySelector('.nav');
    var burger = document.querySelector('.burger');
    if (!nav || !burger) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Меню');
    }

    burger.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    nav.querySelectorAll('ul a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        burger.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
    });
  }

  initFaq();
  initCalc();
  initCarousel();
  initMenu();
})();
