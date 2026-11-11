/* LUMEN page behaviour: reveal on scroll, mobile menu, sound + motion buttons, room tiles, ticket confetti.
   Every block is wrapped in safe(): if one throws WHILE SETTING UP, it is logged and the others keep working
   (errors thrown later, inside event handlers, are not caught here - they surface in the console as usual).
   Two blocks have a fallback, because a silent failure there would hide the page or strand the reader:
   reveal -> show everything; menu -> html.no-menu (the plain nav links stay visible on small screens).
   window.LumenSiteReady is set LAST, so the head fail-safe also catches a script that dies half-way.
   Contracts with the other files (rename on both sides): html.is-paused + the "lumenmotion" event are read by
   playground.js; the "lumensound" event comes from sound.js. */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const sound = () => window.LumenSound;
  const reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
  const safe = (name, fn, onFail) => {
    try { fn(); } catch (err) {
      console.error('[LUMEN] ' + name + ' failed', err);
      if (onFail) { try { onFail(); } catch (_) { /* nothing more we can do */ } }
    }
  };
  /* old Safari has addListener only */
  const onMq = (mq, fn) => { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); };

  /* ---------- reveal on scroll (first, so the page is readable whatever happens below) ---------- */
  safe('reveal', () => {
    const items = $$('.reveal');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      items.forEach((el) => io.observe(el));
    } else {
      items.forEach((el) => el.classList.add('in'));
    }
  }, () => {
    /* the reveal set-up itself broke: never leave the text invisible */
    $$('.reveal').forEach((el) => el.classList.add('in'));
  });

  /* ---------- mobile menu ---------- */
  safe('menu', () => {
    const menu = $('#menu'), menuBtn = $('#menu-btn'), menuClose = $('#menu-close');
    if (!menu || !menuBtn || !menuClose) return;
    const behind = ['.skip', '.site-header', '#main', '.site-footer'].map((s) => $(s)).filter(Boolean);

    /* the one place that opens / closes the menu. moveFocus=false when a link is clicked (the page jumps instead) */
    function setMenu(open, moveFocus) {
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      behind.forEach((el) => { if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
      if (!moveFocus) return;
      if (open) menuClose.focus(); else menuBtn.focus();
    }
    menuBtn.addEventListener('click', () => setMenu(true, true));
    menuClose.addEventListener('click', () => setMenu(false, true));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false, false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false, true); });
    onMq(matchMedia('(min-width: 721px)'), (e) => { if (e.matches && !menu.hidden) setMenu(false, false); });
  }, () => {
    /* no working menu: lumen.css then shows the plain nav links instead of a dead "メニュー" button */
    root.classList.add('no-menu');
  });

  /* ---------- sound button ---------- */
  safe('sound', () => {
    const btn = $('#sound-btn'), tip = $('#sound-tip');
    if (!btn) return;
    const s = sound();
    if (!s || !s.supported) { btn.hidden = true; return; } /* no Web Audio: no button */
    let tipTimer = 0;
    function render(on) {
      btn.textContent = on ? 'おと ON' : 'おと OFF';
      btn.setAttribute('aria-pressed', String(on));
    }
    function showTip() { /* iPhone silent switch / low volume is the usual reason for "ON but silent" */
      if (!tip) return;
      tip.textContent = '音が出ないときは、マナーモードと音量をたしかめてね';
      clearTimeout(tipTimer);
      tipTimer = setTimeout(() => { tip.textContent = ''; }, 5000);
    }
    btn.addEventListener('click', () => { s.toggle().then((on) => { render(on); if (on) showTip(); }); });
    window.addEventListener('lumensound', (e) => {
      render(e.detail.on);
      if (!e.detail.on && tip) { clearTimeout(tipTimer); tip.textContent = ''; }
    });
  });

  /* ---------- motion button (stops every looping animation, including the playground) ---------- */
  safe('motion', () => {
    const btns = $$('.motion-btn');
    if (!btns.length) return;
    function setPaused(p) {
      root.classList.toggle('is-paused', p);
      btns.forEach((b) => {
        b.textContent = p ? 'うごき OFF' : 'うごき ON';
        b.setAttribute('aria-pressed', String(!p));
      });
      window.dispatchEvent(new CustomEvent('lumenmotion', { detail: { paused: p } }));
    }
    btns.forEach((b) => b.addEventListener('click', () => setPaused(!root.classList.contains('is-paused'))));
  });

  /* ---------- room tiles ---------- */
  safe('tiles', () => {
    const roomSound = {
      1: (s) => s.boing(),
      2: (s) => s.stretch(),
      3: (s) => s.note(5),
      4: (s) => s.arpeggio(),
      5: (s) => s.slide(),
      6: (s) => s.note(1)
    };
    const timers = new WeakMap();
    $$('.tile').forEach((tile) => {
      tile.addEventListener('click', () => {
        clearTimeout(timers.get(tile));
        tile.classList.remove('is-on');
        void tile.getBoundingClientRect(); /* restart the CSS animation */
        tile.classList.add('is-on');
        timers.set(tile, setTimeout(() => tile.classList.remove('is-on'), 1400));
        const s = sound(), play = roomSound[tile.dataset.room];
        if (s && play) play(s);
      });
    });
  });

  /* ---------- ticket + confetti ---------- */
  safe('ticket', () => {
    const buyBtn = $('#buy-btn'), msg = $('#ticket-msg');
    if (!buyBtn || !msg) return;
    const MESSAGE = '買えないけど、気持ちはうれしい。かわりに紙ふぶきをどうぞ。';
    let confettiCv = null;

    function confetti() {
      if (confettiCv) confettiCv.remove();
      const cv = document.createElement('canvas');
      cv.className = 'confetti';
      cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv);
      confettiCv = cv;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth, H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const c = cv.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const colors = ['#ff3b2f', '#1f4bff', '#ffd43b', '#ffffff', '#00a6c8', '#ff8ac4', '#10b981', '#7c3aed', '#141414'];
      const n = W < 720 ? 90 : 160, R = (a, b) => a + Math.random() * (b - a);
      const ps = Array.from({ length: n }, () => ({
        x: R(0, W), y: R(-H * 0.5, -10), vy: R(2.2, 5), sway: R(0.5, 2), ph: R(0, 6.3),
        rot: R(0, 6.3), vr: R(-0.2, 0.2), s: R(8, 17), col: colors[(Math.random() * colors.length) | 0], shape: (Math.random() * 4) | 0
      }));
      const T = 3600, t0 = performance.now();
      (function tick(now) {
        const t = now - t0;
        if (t > T || cv !== confettiCv) { cv.remove(); if (cv === confettiCv) confettiCv = null; return; }
        c.clearRect(0, 0, W, H);
        c.globalAlpha = t > T - 700 ? Math.max(0, (T - t) / 700) : 1;
        for (const p of ps) {
          p.y += p.vy; p.ph += 0.06; p.x += Math.sin(p.ph) * p.sway; p.rot += p.vr;
          c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col; c.beginPath();
          if (p.shape === 0) c.rect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
          else if (p.shape === 1) c.arc(0, 0, p.s / 2.2, 0, 6.2832);
          else if (p.shape === 2) { c.moveTo(0, -p.s / 2); c.lineTo(p.s / 2, p.s / 2); c.lineTo(-p.s / 2, p.s / 2); c.closePath(); }
          else { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? p.s * 0.25 : p.s * 0.55; c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * q, Math.sin(a) * q); } c.closePath(); }
          c.fill(); c.restore();
        }
        requestAnimationFrame(tick);
      })(t0);
    }

    buyBtn.addEventListener('click', () => {
      msg.textContent = '';
      requestAnimationFrame(() => { msg.textContent = MESSAGE; }); /* re-announce on repeat clicks */
      const s = sound(); if (s) s.pop();
      /* no falling confetti for people who asked for less motion, in the OS or with the "うごき" button */
      if (!reduceMq.matches && !root.classList.contains('is-paused')) confetti();
    });
  });

  /* ---------- done: tell the head fail-safe we are alive ---------- */
  root.classList.add('js'); /* in case the 3s fail-safe already fired on a slow load */
  window.LumenSiteReady = true;
})();
