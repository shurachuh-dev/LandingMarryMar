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

  /* ---------- Покупка (демо): вікно оплати ---------- */
  function initCheckout() {
    var dlg = document.getElementById('checkout');
    if (!dlg || typeof dlg.showModal !== 'function') return;

    var form = document.getElementById('co-form');
    var success = dlg.querySelector('.co-success');
    var item = dlg.querySelector('.co-item');
    var itemImg = dlg.querySelector('.co-item-img');
    var itemName = dlg.querySelector('.co-item-name');
    var itemDesc = dlg.querySelector('.co-item-desc');
    var itemPrice = dlg.querySelector('.co-item-price');
    var extra = dlg.querySelector('.co-extra');
    var extraList = dlg.querySelector('.co-extra-list');
    var email = document.getElementById('co-email');
    var emailErr = document.getElementById('co-email-err');
    var agree = document.getElementById('co-agree');
    var agreeErr = document.getElementById('co-agree-err');
    var totalOut = document.getElementById('co-total');
    var submit = document.getElementById('co-submit');
    var opener = null;
    var current = null;

    function price(text) { return parseInt(String(text).replace(/\D/g, ''), 10) || 0; }
    function money(n) { return n + ' грн'; }
    function plural(n) {
      var m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return n + ' техкарту';
      if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return n + ' техкарти';
      return n + ' техкарт';
    }

    // Дані беремо з картки на сторінці: назва, фото, ціна.
    function readProduct(btn) {
      var card = btn.closest('.product, .pack');
      var img = card.querySelector('img');
      var old = card.querySelector('.price-old');
      return {
        oldPrice: old ? price(old.textContent) : 0,
        id: btn.getAttribute('data-buy'),
        isPack: card.classList.contains('pack'),
        name: card.querySelector('h3').textContent.trim(),
        desc: card.classList.contains('pack') ? card.querySelector('p').textContent.trim() : 'Техкарта у PDF',
        img: img ? (img.currentSrc || img.src) : '',
        price: price(card.querySelector('.price').textContent)
      };
    }
    var flavors = Array.prototype.map.call(document.querySelectorAll('.product .cart-btn'), readProduct);

    function selectedExtras() {
      return Array.prototype.filter.call(extraList.querySelectorAll('input:checked'), function () { return true; })
        .map(function (input) {
          return flavors.filter(function (f) { return f.id === input.value; })[0];
        });
    }

    function updateTotal() {
      var sum = current.price;
      selectedExtras().forEach(function (f) { sum += f.price; });
      totalOut.textContent = money(sum);
      submit.textContent = 'Оплатити ' + money(sum);
    }

    function showError(input, err, show) {
      err.hidden = !show;
      input.setAttribute('aria-invalid', show ? 'true' : 'false');
    }

    function open(btn) {
      opener = btn;
      current = readProduct(btn);

      form.reset();
      form.hidden = false;
      success.hidden = true;
      showError(email, emailErr, false);
      showError(agree, agreeErr, false);
      submit.disabled = false;

      itemName.textContent = current.name;
      itemDesc.textContent = current.desc;
      itemPrice.textContent = '';
      if (current.oldPrice) {
        var s = document.createElement('s');
        s.className = 'price-old';
        s.textContent = money(current.oldPrice);
        itemPrice.appendChild(s);
        itemPrice.appendChild(document.createTextNode(' '));
      }
      itemPrice.appendChild(document.createTextNode(money(current.price)));
      itemImg.hidden = !current.img;
      item.classList.toggle('no-img', !current.img);
      if (current.img) { itemImg.src = current.img; itemImg.alt = ''; }

      // Інші смаки можна додати лише до окремої техкарти, не до пакетів.
      extraList.innerHTML = '';
      extra.hidden = current.isPack;
      if (!current.isPack) {
        flavors.forEach(function (f) {
          if (f.id === current.id) return;
          var label = document.createElement('label');
          var input = document.createElement('input');
          input.type = 'checkbox';
          input.value = f.id;
          var name = document.createElement('span');
          name.textContent = f.name;
          var p = document.createElement('span');
          p.className = 'co-x-price';
          p.textContent = '+' + money(f.price);
          label.appendChild(input); label.appendChild(name); label.appendChild(p);
          extraList.appendChild(label);
        });
      }

      updateTotal();
      document.documentElement.classList.add('modal-open');
      dlg.showModal();
      email.focus();
    }

    function unlock() { document.documentElement.classList.remove('modal-open'); }
    function close() {
      unlock();
      if (dlg.open) dlg.close();
    }

    dlg.addEventListener('cancel', unlock); // Esc
    dlg.addEventListener('close', function () {
      unlock();
      if (opener) opener.focus();
    });

    // Клік по затемненню (поза вікном) закриває його.
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.querySelector('.co-close').addEventListener('click', close);
    dlg.querySelector('.co-done').addEventListener('click', close);
    extraList.addEventListener('change', updateTotal);

    email.addEventListener('input', function () {
      if (email.getAttribute('aria-invalid') === 'true' && isEmail(email.value)) showError(email, emailErr, false);
    });
    agree.addEventListener('change', function () { if (agree.checked) showError(agree, agreeErr, false); });

    function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var okEmail = isEmail(email.value);
      var okAgree = agree.checked;
      showError(email, emailErr, !okEmail);
      showError(agree, agreeErr, !okAgree);
      if (!okEmail) { email.focus(); return; }
      if (!okAgree) { agree.focus(); return; }

      // Демо: імітуємо обробку платежу. Тут пізніше буде виклик платіжного сервісу.
      var items = [current].concat(selectedExtras());
      var mail = email.value.trim();
      submit.disabled = true;
      submit.textContent = 'Обробка оплати…';

      setTimeout(function () {
        var count = current.isPack ? null : items.length;
        var text = success.querySelector('.co-success-text');
        text.textContent = (count ? 'Ми надіслали ' + plural(count) : 'Ми надіслали ваш набір') + ' на ' + mail + ' (демо).';
        var list = success.querySelector('.co-success-list');
        list.innerHTML = '';
        items.forEach(function (it) {
          var li = document.createElement('li');
          li.textContent = it.name;
          list.appendChild(li);
        });
        form.hidden = true;
        success.hidden = false;
        dlg.scrollTop = 0;
        success.querySelector('.co-title').focus();
      }, 1200);
    });

    document.querySelectorAll('[data-buy]').forEach(function (btn) {
      btn.addEventListener('click', function () { open(btn); });
    });
  }

  /* ---------- Підписка на новинки (демо) ----------
     ЗАРАЗ: email нікуди не надсилається, просто показуємо «Дякуємо, ви в списку».

     ЯК ПІДКЛЮЧИТИ СПРАВЖНІЙ СЕРВІС — замініть функцію send() нижче:

     1) Formspree (найпростіше, безкоштовний тариф):
        - зареєструйтесь на formspree.io і створіть форму, отримаєте адресу виду
          https://formspree.io/f/XXXXXXXX
        - send = function (mail) {
            return fetch('https://formspree.io/f/XXXXXXXX', {
              method: 'POST',
              headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: mail })
            }).then(function (r) { if (!r.ok) throw new Error('send failed'); });
          };
        - листи з адресами приходитимуть вам на пошту, список видно в кабінеті Formspree.

     2) Google Forms (відповіді в Google Таблиці):
        - створіть форму з одним полем «Email», відкрийте її «попередній перегляд»,
          у коді сторінки знайдіть адресу .../formResponse і назву поля entry.XXXXXXX
        - send = function (mail) {
            var data = new FormData();
            data.append('entry.XXXXXXX', mail);
            return fetch('https://docs.google.com/forms/d/e/ВАШ_ID/formResponse', {
              method: 'POST', mode: 'no-cors', body: data
            });
          };
        - mode: 'no-cors' не дає перевірити відповідь, але запис у таблиці з'явиться.

     3) MailerLite (повноцінні розсилки):
        - у MailerLite створіть групу й вбудовану форму (Forms → Embedded forms),
          скопіюйте адресу action з її HTML-коду (https://assets.mailerlite.com/jsonp/.../subscribe)
        - send = function (mail) {
            var data = new FormData();
            data.append('fields[email]', mail);
            return fetch('АДРЕСА_ACTION_З_MAILERLITE', { method: 'POST', body: data })
              .then(function (r) { if (!r.ok) throw new Error('send failed'); });
          };
        - MailerLite сам надсилатиме лист-підтвердження й розсилки.
  */
  function initSubscribe() {
    var box = document.getElementById('subscribe');
    if (!box) return;
    var form = box.querySelector('.sub-form');
    var done = box.querySelector('.sub-done');
    var email = document.getElementById('sub-email');
    var emailErr = document.getElementById('sub-email-err');
    var agree = document.getElementById('sub-agree');
    var agreeErr = document.getElementById('sub-agree-err');
    var btn = form.querySelector('button[type="submit"]');
    var emailErrText = emailErr.textContent;

    // ДЕМО-відправка. Замініть на один із варіантів із коментаря вище.
    var send = function (mail) {
      return new Promise(function (resolve) { setTimeout(resolve, 600); });
    };

    function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); }
    function showError(input, err, show) {
      err.hidden = !show;
      input.setAttribute('aria-invalid', show ? 'true' : 'false');
    }

    email.addEventListener('input', function () {
      if (email.getAttribute('aria-invalid') === 'true' && isEmail(email.value)) showError(email, emailErr, false);
    });
    agree.addEventListener('change', function () { if (agree.checked) showError(agree, agreeErr, false); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      emailErr.textContent = emailErrText;
      var okEmail = isEmail(email.value);
      var okAgree = agree.checked;
      showError(email, emailErr, !okEmail);
      showError(agree, agreeErr, !okAgree);
      if (!okEmail) { email.focus(); return; }
      if (!okAgree) { agree.focus(); return; }

      btn.disabled = true;
      btn.textContent = 'Надсилаємо…';
      send(email.value.trim()).then(function () {
        form.hidden = true;
        done.hidden = false;
        done.focus();
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = 'Підписатися';
        emailErr.textContent = 'Не вдалося підписатися. Спробуйте ще раз пізніше.';
        emailErr.hidden = false;
      });
    });
  }

  initFaq();
  initCalc();
  initSubscribe();
  initMenu();
  initCheckout();
})();
