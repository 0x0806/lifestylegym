/* New Lifestyle Way Gym: page behaviour. Plain JavaScript, no dependencies. */
(function () {
  'use strict';
  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conn = navigator.connection || {};
  var lowData = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  var canAutoplay = !reduced && !lowData;

  /* ---- mobile menu ---- */
  var menuBtn = $('#menuBtn'), nav = $('#nav');
  function setMenu(open) {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) nav.setAttribute('data-open', ''); else nav.removeAttribute('data-open');
    doc.body.style.overflow = open && window.innerWidth <= 980 ? 'hidden' : '';
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 980) setMenu(false); });
  }

  /* ---- services: pick a row to change the picture, and prefill the form ---- */
  var svcVideo = $('#svcVideo'), rows = $$('.svc-row'), service = $('#service');
  function pickService(row, fromUser) {
    rows.forEach(function (r) {
      var on = r === row;
      r.classList.toggle('is-on', on);
      var b = $('button', r); if (b) b.setAttribute('aria-pressed', String(on));
    });
    var name = row.getAttribute('data-video');
    if (svcVideo && name) {
      svcVideo.setAttribute('poster', 'assets/img/' + name + '.webp');
      if (canAutoplay && (fromUser || svcVideo.getAttribute('data-src'))) {
        svcVideo.src = 'assets/video/' + name + '.mp4';
        svcVideo.setAttribute('data-src', name);
        var p = svcVideo.play(); if (p && p.catch) p.catch(function () {});
      } else {
        svcVideo.pause(); svcVideo.removeAttribute('src'); svcVideo.load();
      }
    }
    if (fromUser && service) { var v = row.getAttribute('data-service'); if (v) service.value = v; }
  }
  rows.forEach(function (row) {
    row.addEventListener('click', function () { pickService(row, true); });
    row.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches && !row.classList.contains('is-on')) pickService(row, true); });
  });
  if (svcVideo && canAutoplay && rows[0] && 'IntersectionObserver' in window) {
    var started = false;
    new IntersectionObserver(function (es, obs) {
      es.forEach(function (e) {
        if (e.isIntersecting && !started) { started = true; svcVideo.src = 'assets/video/' + rows[0].getAttribute('data-video') + '.mp4'; svcVideo.setAttribute('data-src', 'home'); var p = svcVideo.play(); if (p && p.catch) p.catch(function () {}); obs.disconnect(); }
      });
    }, { threshold: 0.3 }).observe(svcVideo);
  }

  /* ---- floor reel: loads on demand ---- */
  var reel = $('#reel'), reelPlay = $('#reelPlay'), reelBox = $('#reelBox');
  if (reel && reelPlay && reelBox) {
    reel.removeAttribute('controls');
    reelPlay.addEventListener('click', function () {
      reel.setAttribute('controls', ''); reelBox.classList.add('playing');
      var p = reel.play(); if (p && p.catch) p.catch(function () {});
    });
    reel.addEventListener('ended', function () { reelBox.classList.remove('playing'); reel.removeAttribute('controls'); });
  }

  /* ---- the 24/7 moment: red fills in as the section passes ---- */
  var big = $('#big247'), floor = $('#floor');
  if (big && floor) {
    if (reduced) { big.style.setProperty('--p', '1'); }
    else {
      var ticking = false;
      var update = function () {
        ticking = false;
        var r = floor.getBoundingClientRect(), vh = window.innerHeight;
        var p = (vh * 0.85 - r.top) / (vh * 0.85 + r.height * 0.15);
        big.style.setProperty('--p', String(Math.max(0, Math.min(1, p))));
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
  }

  /* ---- demo forms (hero quick card + booking section): one handler ---- */
  var formDate = $('#preferredDate');
  if (formDate) { var d0 = new Date(); formDate.min = d0.getFullYear() + '-' + String(d0.getMonth() + 1).padStart(2, '0') + '-' + String(d0.getDate()).padStart(2, '0'); }

  function wireLeadForm(form) {
    var status = $('.form-status', form), btn = $('button[type="submit"]', form), ts = $('.ts', form) || $('[name="_timestamp"]', form);
    var label = btn.textContent, opened = Date.now();
    if (ts) ts.value = new Date().toISOString();
    var field = function (name) { return form.querySelector('[name="' + name + '"]'); };
    var setErr = function (el, msg) {
      if (!el) return;
      var e = $('.err[data-for="' + el.id + '"]', form);
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      if (e) { e.textContent = msg || ''; if (!e.id) e.id = el.id + '-err'; el.setAttribute('aria-describedby', e.id); }
    };
    var validate = function () {
      var ok = true, first = null;
      var chk = function (name, bad, msg) { var el = field(name); if (!el) return; setErr(el, bad ? msg : ''); if (bad) { ok = false; if (!first) first = el; } };
      chk('firstName', field('firstName').value.trim().length < 2, 'Please enter your first name.');
      chk('phone', !/^\+?\d{7,15}$/.test(field('phone').value.replace(/[\s\-().]/g, '')), 'Please enter a valid phone number, for example 0581234567.');
      var em = field('email'); if (em) chk('email', em.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim()), 'That email address looks incomplete.');
      chk('service', !field('service').value, 'Please choose a service.');
      if (first) first.focus();
      return ok;
    };
    $$('input,select', form).forEach(function (f) { f.addEventListener('input', function () { setErr(f, ''); }); });
    var say = function (msg, kind, wa) {
      status.className = 'form-status ' + (kind || '');
      status.textContent = msg;
      if (wa) {
        status.appendChild(doc.createTextNode(' '));
        var a = doc.createElement('a'); a.className = 'link'; a.href = wa; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Send it on WhatsApp instead';
        status.appendChild(a);
      }
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (field('_honey').value) return; /* bot */
      if (!validate()) return;
      if (Date.now() - opened < 2500) { say('Please check your details, then press the button again.', 'bad'); opened = 0; return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      btn.disabled = true; btn.textContent = 'Sending\u2026'; say('');
      var wa = 'https://wa.me/971581790093?text=' + encodeURIComponent('Hi, I would like to book a free demo. My name is ' + data.firstName + ' and my number is ' + data.phone + '.');
      fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error('http'); return r.json().catch(function () { return {}; }); })
        .then(function (j) {
          if (j && (j.success === 'false' || j.success === false)) throw new Error('rejected');
          form.reset(); if (ts) ts.value = new Date().toISOString();
          say('Thank you. We have your request and will contact you within 24 hours to arrange your free demo.', 'ok');
        })
        .catch(function () { say('Sorry, that did not send. Please try again.', 'bad', wa); })
        .then(function () { btn.disabled = false; btn.textContent = label; });
    });
  }
  $$('#demoForm').forEach(wireLeadForm);

  /* ---- chat: load the assistant only when someone asks for it ---- */
  var chatBtn = $('#chatOpen');
  if (chatBtn) {
    var loading = false;
    chatBtn.addEventListener('click', function onFirst() {
      if (window.LGChat || loading) return;
      loading = true;
      chatBtn.removeEventListener('click', onFirst);
      window.__lgChatOpenOnLoad = true;
      var s = doc.createElement('script'); s.src = 'chat.js'; s.defer = true; doc.body.appendChild(s);
    }, { once: false });
    /* the opener's own handler is attached by chat.js after load; the first click only loads it */
  }
})();
