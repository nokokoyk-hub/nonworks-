/* LUMEN hero playground: bouncy shapes with eyes on a 2D canvas.
   - mouse: press on a shape to grab and throw it, press on empty space to add 5 shapes
   - touch: a touch that starts on a shape grabs it (page does not scroll);
            a touch that starts on empty space scrolls the page, and a short still tap adds shapes
   - keyboard / assistive tech: the "+5 ふやす" button next to the counter (the canvas itself is decoration)
   Units: positions are px, velocities are px per 60Hz frame; `dt` is "how many 60Hz frames passed",
   so everything below behaves the same on 60Hz and 120Hz screens. */
(() => {
  'use strict';

  const hero = document.getElementById('top');
  const cv = document.getElementById('playground');
  const countEl = document.getElementById('count');
  const spawnBtn = document.getElementById('spawn-btn');
  if (!hero || !cv) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const foot = hero.querySelector('.hero-foot'); /* button + hint + marquee: shapes stay above all of it */
  const header = document.querySelector('.site-header'); /* ...and below the fixed header */

  /* ---- feel of the toy (approved by hand; change with care) ---- */
  const TUNE = {
    /* sizes */
    smallBelow: 720,                       /* この幅(px)より狭い画面は小さい図形を使う */
    radiusSmall: { min: 17, max: 40 },     /* 狭い画面の図形の半径(px) */
    radiusLarge: { min: 26, max: 64 },     /* 広い画面の図形の半径(px) */
    coverageStart: 0.15,                   /* はじめに図形が占める面積の割合 */
    coverageMax: 0.28,                     /* 増やしても超えない面積の割合（超えると古い図形から消える） */
    minCount: 5,                           /* どんなに狭くても最低これだけは置く */
    /* launch + spawn */
    startSpeed: 3.4,                       /* はじめの図形の最大速度 */
    startSpeedSlow: 1.2,                   /* 「動きを減らす」設定のとき */
    spawnCount: 5,                         /* タップ1回で増える数 */
    spawnSpeed: [5, 9],                    /* 生まれた図形が飛び出す速さの範囲 */
    spawnPushRange: 280,                   /* 増えた時、周りの図形を押しのける範囲(px) */
    spawnPushPower: 9,                     /* その押しのける強さ（近いほど強い） */
    spawnSlowFactor: 0.5,                  /* 「動きを減らす」設定のとき、上の速さ・強さにかける */
    /* grab + throw */
    grabFollow: 0.35,                      /* つかんだ図形が指に追いつく割合(1フレームあたり) */
    grabPad: 8,                            /* 指でつかむ時だけ、当たり判定に足す余白(px) */
    throwMax: 26,                          /* 投げた時の最高速度 */
    throwMaxSlow: 10,                      /* 「動きを減らす」設定のとき */
    /* bounce */
    wallBounce: 0.95,                      /* 壁・床・天井の反発（1で勢いそのまま） */
    collideBounce: 1.92,                   /* 図形同士の反発（1+反発係数。2で完全弾性） */
    hitFullSpeed: 6,                       /* ぶつかりの強さが「最大」になる接近速度 */
    wallFullSpeed: 12,                     /* 壁にぶつかる音が「最大」になる速度 */
    /* cruising */
    speedMax: 24,                          /* これより速いと減速する */
    speedMaxSlow: 7,                       /* 「動きを減らす」設定のとき */
    speedMin: 1.4,                         /* これより遅いと、止まらないようにそっと押す */
    speedMinSlow: 0.5,
    nudge: 0.3,                            /* 止まりそうな時に足す速さ(1フレームあたり) */
    cruiseAbove: 5,                        /* この速度を超えるとゆっくり減速する */
    cruiseDrag: 0.992,                     /* その減速（1フレームあたりの残り率） */
    overspeedDrag: 0.96,                   /* speedMax を超えた時の減速（同上） */
    /* mouse dodge */
    dodgeMargin: 70,                       /* マウスがこの距離(図形の半径に足す)まで近づくと逃げる */
    dodgePower: 1.1,                       /* 逃げる強さ(1フレームあたり) */
    /* layout */
    ceilGap: 6,                            /* ヘッダーの下に空ける余白(px) */
    floorGap: 10,                          /* ヒント・ボタン帯の上に空ける余白(px)。影の分 */
    /* input */
    tapMovePx: 10,                         /* これ未満しか動かない指は「タップ」 */
    tapMs: 400                             /* これより短い接触は「タップ」 */
  };

  const reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = () => reduceMq.matches;
  const paused = () => document.documentElement.classList.contains('is-paused');
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pickOf = (arr) => arr[(Math.random() * arr.length) | 0];
  const COLORS = ['#ff3b2f', '#1f4bff', '#ffffff', '#00a6c8', '#ff8ac4', '#10b981', '#7c3aed'];

  let W = 0, H = 0, DPR = 1, floorH = 44, ceilH = 0;
  let raf = 0, last = 0, onScreen = true;
  let shapes = [], grab = null, rings = [];
  let lastRange = null; /* radius range the current shapes were made for: { min, max } */
  /* pointer: where it is, whether a shape is held, and whether it is a mouse (only mice make shapes dodge) */
  const ptr = { x: 0, y: 0, down: false, active: false, mouse: false };
  /* The one finger we follow. state: 'idle' | 'pending' (finger down on empty space: scroll or tap) | 'grab'.
     id is the pointerId; it is null only when touchstart arrived before its pointerdown (then pointerdown fills it in).
     Fingers other than the tracked one are ignored. */
  const touch = { state: 'idle', id: null, x: 0, y: 0, t: 0 };

  /* ---- geometry (all derived from the current screen) ---- */
  const small = () => W < TUNE.smallBelow;
  const rmin = () => (small() ? TUNE.radiusSmall.min : TUNE.radiusLarge.min);
  const floorY = () => H - floorH;
  const rmax = () => Math.min(small() ? TUNE.radiusSmall.max : TUNE.radiusLarge.max, floorY() / 4);
  const ceilY = () => Math.min(ceilH, Math.max(0, floorY() - rmax() * 2 - 4));
  const playH = () => floorY() - ceilY();
  /* how many shapes cover `coverage` of the play area (average shape area from the radius range) */
  function countFor(coverage) {
    const a = rmin(), b = Math.max(a, rmax());
    const mean = Math.PI * (a * a + a * b + b * b) / 3;
    return Math.max(TUNE.minCount, Math.round(coverage * W * playH() / mean));
  }
  /* how much of the play area the shapes really cover right now (0..1) */
  const covered = () => shapes.reduce((sum, s) => sum + Math.PI * s.r * s.r, 0) / Math.max(1, W * playH());

  const snd = () => (window.LumenSound && window.LumenSound.enabled ? window.LumenSound : null);
  const sayCount = () => { if (countEl) countEl.textContent = String(shapes.length); };

  function make(x, y, vx, vy, r) {
    return {
      x, y, vx, vy, r,          /* position, velocity, radius */
      rot: rnd(0, TAU),         /* rotation angle */
      vr: rnd(-0.03, 0.03),     /* spin speed */
      type: (Math.random() * 6) | 0, /* 0 circle, 1 square, 2 triangle, 3 star, 4 pill, 5 flower */
      col: pickOf(COLORS),
      eyes: Math.random() < 0.5,
      w: 0,                     /* wobble strength 0..1: jumps to 1 when hit, fades out */
      ph: rnd(0, 6),            /* wobble phase */
      blink: rnd(1, 6),         /* seconds until the next blink */
      bl: 0                     /* blink amount 0..1 (1 = eyes shut) */
    };
  }

  function path(type, r) {
    ctx.beginPath();
    if (type === 0) {
      ctx.arc(0, 0, r, 0, TAU);
    } else if (type === 1) {
      const s = r * 1.62;
      if (ctx.roundRect) ctx.roundRect(-s / 2, -s / 2, s, s, r * 0.34); else ctx.rect(-s / 2, -s / 2, s, s);
    } else if (type === 2) {
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + i * TAU / 3;
        ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95 + r * 0.12);
      }
      ctx.closePath();
    } else if (type === 3) {
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.52 : r * 1.02;
        ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * q, Math.sin(a) * q);
      }
      ctx.closePath();
    } else if (type === 4) {
      const w = r * 2.1, h = r * 1.2;
      if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); else ctx.rect(-w / 2, -h / 2, w, h);
    } else {
      for (let i = 0; i < 6; i++) {
        const a = i * TAU / 6;
        ctx.moveTo(Math.cos(a) * r * 0.58 + r * 0.46, Math.sin(a) * r * 0.58);
        ctx.arc(Math.cos(a) * r * 0.58, Math.sin(a) * r * 0.58, r * 0.46, 0, TAU);
      }
      ctx.moveTo(r * 0.5, 0);
      ctx.arc(0, 0, r * 0.5, 0, TAU);
    }
  }

  function paint(s, col) {
    ctx.fillStyle = col;
    ctx.fill();
    if (s.type === 2 || s.type === 3) {
      ctx.strokeStyle = col;
      ctx.lineJoin = 'round';
      ctx.lineWidth = s.r * (s.type === 2 ? 0.34 : 0.24);
      ctx.stroke();
    }
  }

  /* keep a shape's centre inside the play box (position only, velocity untouched) */
  function confine(s) {
    const cy = ceilY(), fy = floorY();
    s.x = clamp(s.x, s.r, Math.max(s.r, W - s.r));
    s.y = clamp(s.y, cy + s.r, Math.max(cy + s.r, fy - s.r));
  }

  /* ---- actions ---- */
  function shapeAt(x, y, pad) {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      if (Math.hypot(x - s.x, y - s.y) < s.r * 1.15 + pad) return i;
    }
    return -1;
  }

  function grabAt(x, y, pad) {
    const i = shapeAt(x, y, pad);
    if (i < 0) return false;
    const s = shapes[i];
    grab = s; s.w = 1;
    shapes.splice(i, 1); shapes.push(s); /* draw on top; also keeps the array ordered oldest -> newest */
    ptr.down = true;
    return true;
  }

  function release() {
    if (grab) {
      const vmax = reduce() ? TUNE.throwMaxSlow : TUNE.throwMax, v = Math.hypot(grab.vx, grab.vy);
      if (v > vmax) { grab.vx *= vmax / v; grab.vy *= vmax / v; }
      grab = null;
    }
    ptr.down = false;
  }

  /* drop the oldest shapes (never the held one) while they cover more than coverageMax of the play area */
  function trimExtra() {
    while (shapes.length > TUNE.minCount && covered() > TUNE.coverageMax) {
      const i = shapes[0] === grab ? 1 : 0;
      shapes.splice(i, 1);
    }
  }

  function spawn(x, y) {
    const k = reduce() ? TUNE.spawnSlowFactor : 1;
    for (let i = 0; i < TUNE.spawnCount; i++) {
      const a = i / TUNE.spawnCount * TAU + rnd(0, 1), v = rnd(TUNE.spawnSpeed[0], TUNE.spawnSpeed[1]) * k;
      const s = make(x, y, Math.cos(a) * v, Math.sin(a) * v, rnd(rmin(), rmax() * 0.8));
      s.w = 1;
      confine(s); /* never appear behind the header / hint / button */
      shapes.push(s);
    }
    trimExtra();
    const range = TUNE.spawnPushRange;
    for (const s of shapes) {
      const dx = s.x - x, dy = s.y - y, d = Math.hypot(dx, dy) || 1;
      if (d < range) {
        const f = (1 - d / range) * TUNE.spawnPushPower * k;
        s.vx += dx / d * f; s.vy += dy / d * f; s.w = Math.max(s.w, 0.7);
      }
    }
    rings.push({ x, y, r: 12, a: 1 });
    sayCount();
    const a = snd(); if (a) a.pop();
    if (paused()) step(0); /* frozen: still show the result once */
  }

  function seed() {
    shapes = []; grab = null; rings = [];
    const sp = reduce() ? TUNE.startSpeedSlow : TUNE.startSpeed, cy = ceilY(), fy = floorY();
    const n = countFor(TUNE.coverageStart);
    lastRange = { min: rmin(), max: rmax() };
    for (let i = 0; i < n; i++) {
      const r = rnd(rmin(), rmax());
      const s = make(rnd(r, Math.max(r, W - r)), rnd(cy + r, Math.max(cy + r, fy - r)), rnd(-sp, sp), rnd(-sp, sp), r);
      shapes.push(s);
    }
    sayCount();
  }

  /* after a resize / rotation: shrink and drop what no longer fits, then pull everything inside */
  function fit() {
    const lo = rmin(), hi = rmax();
    if (lastRange && (lastRange.min !== lo || lastRange.max !== hi)) { /* map old sizes onto the new size range */
      for (const s of shapes) {
        const t = clamp((s.r - lastRange.min) / Math.max(1, lastRange.max - lastRange.min), 0, 1);
        s.r = lo + t * (hi - lo);
      }
    }
    lastRange = { min: lo, max: hi };
    for (const s of shapes) confine(s);
    trimExtra();
    sayCount();
  }

  function size() {
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return false;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = w; H = h;
    floorH = (foot ? foot.offsetHeight : 44) + TUNE.floorGap;
    ceilH = header ? header.offsetHeight + (parseFloat(getComputedStyle(header).top) || 0) + TUNE.ceilGap : 0;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return true;
  }

  /* ---- physics + drawing ---- */
  function hitSound(a, b, strength) {
    const s = snd();
    if (!s) return;
    const r = b ? (a.r + b.r) / 2 : a.r;
    s.bounce(clamp((r - rmin()) / Math.max(1, rmax() - rmin()), 0, 1), strength);
  }

  function step(dt) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    const cy = ceilY(), fy = floorY(), slow = reduce();
    const vcap = slow ? TUNE.speedMaxSlow : TUNE.speedMax, lo = slow ? TUNE.speedMinSlow : TUNE.speedMin;
    if (grab && ptr.down) { grab.vx = (ptr.x - grab.x) * TUNE.grabFollow; grab.vy = (ptr.y - grab.y) * TUNE.grabFollow; }

    for (const s of shapes) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.rot += s.vr * dt * (slow ? 0.4 : 1); s.ph += 0.5 * dt;
      s.w *= Math.pow(0.93, dt);
      if (s !== grab) {
        const v = Math.hypot(s.vx, s.vy);
        if (v < lo) { const a = rnd(0, TAU); s.vx += Math.cos(a) * TUNE.nudge * dt; s.vy += Math.sin(a) * TUNE.nudge * dt; }
        else if (v > vcap) { const d = Math.pow(TUNE.overspeedDrag, dt); s.vx *= d; s.vy *= d; }
        else if (v > TUNE.cruiseAbove) { const d = Math.pow(TUNE.cruiseDrag, dt); s.vx *= d; s.vy *= d; }
        if (ptr.active && ptr.mouse && !ptr.down) { /* shapes dodge the mouse */
          const dx = s.x - ptr.x, dy = s.y - ptr.y, d = Math.hypot(dx, dy) || 1, reach = s.r + TUNE.dodgeMargin;
          if (d < reach) {
            const f = (1 - d / reach) * TUNE.dodgePower * dt;
            s.vx += dx / d * f; s.vy += dy / d * f; s.w = Math.max(s.w, 0.35);
          }
        }
      }
      let wall = 0;
      if (s.x < s.r) { wall = Math.abs(s.vx); s.x = s.r; s.vx = Math.abs(s.vx) * TUNE.wallBounce; }
      else if (s.x > W - s.r) { wall = Math.abs(s.vx); s.x = W - s.r; s.vx = -Math.abs(s.vx) * TUNE.wallBounce; }
      if (s.y < cy + s.r) { wall = Math.max(wall, Math.abs(s.vy)); s.y = cy + s.r; s.vy = Math.abs(s.vy) * TUNE.wallBounce; }
      else if (s.y > fy - s.r) { wall = Math.max(wall, Math.abs(s.vy)); s.y = fy - s.r; s.vy = -Math.abs(s.vy) * TUNE.wallBounce; }
      if (wall && dt > 0) { s.w = 1; if (s !== grab) hitSound(s, null, Math.min(1, wall / TUNE.wallFullSpeed)); }
      s.blink -= dt / 60;
      if (s.blink < 0) { s.bl = 1; s.blink = rnd(2, 6); }
      s.bl *= Math.pow(0.8, dt);
    }

    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        const a = shapes[i], b = shapes[j], dx = b.x - a.x, dy = b.y - a.y, min = a.r + b.r, d2 = dx * dx + dy * dy;
        if (d2 >= min * min || d2 === 0) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = min - d, ma = a.r * a.r, mb = b.r * b.r, tot = ma + mb;
        const fa = a === grab ? 0 : (b === grab ? 1 : mb / tot), fb = b === grab ? 0 : (a === grab ? 1 : ma / tot);
        a.x -= nx * ov * fa; a.y -= ny * ov * fa; b.x += nx * ov * fb; b.y += ny * ov * fb;
        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rv > 0) continue;
        const imp = -TUNE.collideBounce * rv / tot;
        if (a !== grab) { a.vx -= imp * mb * nx; a.vy -= imp * mb * ny; }
        if (b !== grab) { b.vx += imp * ma * nx; b.vy += imp * ma * ny; }
        const hit = Math.min(1, -rv / TUNE.hitFullSpeed);
        a.w = Math.max(a.w, hit); b.w = Math.max(b.w, hit);
        if (dt > 0) hitSound(a, b, hit);
      }
    }
    /* the push-apart above can shove a shape through a wall: put everyone back inside */
    for (const s of shapes) confine(s);

    for (let i = rings.length - 1; i >= 0; i--) {
      const g = rings[i];
      g.r += 11 * dt; g.a -= 0.045 * dt;
      if (g.a <= 0) { rings.splice(i, 1); continue; }
      ctx.strokeStyle = 'rgba(20,20,20,' + g.a + ')';
      ctx.lineWidth = 6 * g.a + 1;
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, TAU); ctx.stroke();
    }

    const lookX = ptr.active ? ptr.x : W / 2, lookY = ptr.active ? ptr.y : H * 0.45;
    for (const s of shapes) {
      const wob = Math.sin(s.ph) * s.w * (slow ? 0.1 : 0.2);
      ctx.save(); ctx.translate(s.x, s.y + s.r * 0.16); ctx.rotate(s.rot); ctx.scale(1 + wob, 1 - wob);
      path(s.type, s.r); paint(s, 'rgba(60,40,0,.2)'); ctx.restore();
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot); ctx.scale(1 + wob, 1 - wob);
      path(s.type, s.r); paint(s, s.col); ctx.restore();
      if (s.eyes) {
        const ang = Math.atan2(lookY - s.y, lookX - s.x), er = s.r * 0.2, off = s.r * 0.27, open = Math.max(0.12, 1 - s.bl);
        const white = s.col === '#ffffff';
        for (const sx of [-off, off]) {
          ctx.save(); ctx.translate(s.x + sx, s.y - s.r * 0.06); ctx.scale(1, open);
          if (!white) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, er, 0, TAU); ctx.fill(); }
          ctx.fillStyle = '#141414'; ctx.beginPath();
          ctx.arc(Math.cos(ang) * er * 0.38, Math.sin(ang) * er * 0.38, er * (white ? 0.72 : 0.55), 0, TAU); ctx.fill();
          ctx.restore();
        }
      }
    }
  }

  /* ---- loop ---- */
  const shouldRun = () => W > 0 && onScreen && !document.hidden && !paused();
  function frame(now) {
    raf = 0;
    const dt = clamp((now - last) / 16.67 || 1, 0.1, 2.2); /* never 0 or negative; capped after tab stalls */
    last = now;
    step(dt);
    if (shouldRun()) raf = requestAnimationFrame(frame);
  }
  function run() {
    if (!raf && shouldRun()) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  /* ---- input ---- */
  const at = (cx, cy) => { const r = cv.getBoundingClientRect(); return [cx - r.left, cy - r.top]; };
  const isMine = (e) => touch.id === null || touch.id === e.pointerId;

  cv.addEventListener('pointerdown', (e) => {
    const [x, y] = at(e.clientX, e.clientY);
    if (e.pointerType === 'touch') {
      if (touch.state === 'grab' && touch.id === null) { touch.id = e.pointerId; return; } /* touchstart came first */
      if (touch.state !== 'idle') return; /* a finger is already being followed */
      touch.state = 'pending'; touch.id = e.pointerId; touch.x = x; touch.y = y; touch.t = e.timeStamp;
      return;
    }
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try { cv.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    ptr.x = x; ptr.y = y; ptr.active = true; ptr.mouse = e.pointerType === 'mouse';
    if (!grabAt(x, y, 0)) spawn(x, y);
  });

  /* Decided here because only touchstart can stop the page from scrolling:
     finger on a shape -> grab (no scroll); finger on empty space -> do nothing, the browser scrolls. */
  cv.addEventListener('touchstart', (e) => {
    if (!e.cancelable) return; /* e.g. momentum scrolling is running: leave it alone */
    if (e.touches.length !== 1 || touch.state === 'grab') return;
    const t = e.changedTouches[0];
    const [x, y] = at(t.clientX, t.clientY);
    if (shapeAt(x, y, TUNE.grabPad) < 0) return;
    e.preventDefault();
    ptr.x = x; ptr.y = y; ptr.active = true; ptr.mouse = false;
    grabAt(x, y, TUNE.grabPad);
    if (touch.state === 'idle') { touch.id = null; touch.x = x; touch.y = y; touch.t = e.timeStamp; } /* pointerdown fills id */
    touch.state = 'grab';
  }, { passive: false });

  cv.addEventListener('touchmove', (e) => { if (touch.state === 'grab' && e.cancelable) e.preventDefault(); }, { passive: false });

  cv.addEventListener('pointermove', (e) => {
    const [x, y] = at(e.clientX, e.clientY);
    if (e.pointerType === 'touch') {
      if (touch.state !== 'grab' || !isMine(e)) return;
      if (touch.id === null) touch.id = e.pointerId;
      ptr.x = x; ptr.y = y;
      return;
    }
    ptr.x = x; ptr.y = y; ptr.active = true; ptr.mouse = e.pointerType === 'mouse';
  });

  cv.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'touch') { release(); return; }
    if (touch.state === 'idle' || !isMine(e)) return;
    const was = touch.state;
    touch.state = 'idle'; touch.id = null;
    if (was === 'grab') { release(); ptr.active = false; return; }
    const [x, y] = at(e.clientX, e.clientY);
    if (Math.hypot(x - touch.x, y - touch.y) < TUNE.tapMovePx && e.timeStamp - touch.t < TUNE.tapMs) spawn(touch.x, touch.y);
  });

  cv.addEventListener('pointercancel', (e) => {
    if (e.pointerType !== 'touch') { release(); return; }
    /* the browser took over (vertical scroll): do nothing, just drop a held shape if any */
    if (touch.state === 'idle' || !isMine(e)) return;
    if (touch.state === 'grab') { release(); ptr.active = false; }
    touch.state = 'idle'; touch.id = null;
  });

  /* pointer capture lost without pointerup (window switched while holding): do not leave a shape stuck to the cursor */
  cv.addEventListener('lostpointercapture', (e) => {
    if (e.pointerType === 'touch') {
      if (touch.state === 'grab' && touch.id === e.pointerId) { release(); ptr.active = false; touch.state = 'idle'; touch.id = null; }
      return;
    }
    release();
  });

  cv.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !ptr.down) ptr.active = false; });

  if (spawnBtn) {
    spawnBtn.addEventListener('click', () => {
      const cy = ceilY(), fy = floorY();
      spawn(rnd(0.2, 0.8) * W, rnd(cy + (fy - cy) * 0.2, cy + (fy - cy) * 0.7));
    });
  }

  /* ---- lifecycle ---- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => { onScreen = es[es.length - 1].isIntersecting; run(); }, { threshold: 0.01 }).observe(hero);
  }
  document.addEventListener('visibilitychange', run);
  /* "うごき" button (site.js) toggles html.is-paused and tells us */
  window.addEventListener('lumenmotion', () => { if (paused()) stop(); else run(); });

  let rt = 0;
  function onResize() {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (!size()) return;
      if (!shapes.length) seed(); else fit();
      if (paused()) step(0); else run(); /* frozen: repaint once at the new size */
    }, 100);
  }
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(onResize);
    ro.observe(hero);
    if (foot) ro.observe(foot);     /* hint wraps / fonts load => floor moves */
    if (header) ro.observe(header); /* header height changes => ceiling moves */
  } else {
    window.addEventListener('resize', onResize);
  }
  window.addEventListener('orientationchange', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

  (function boot() {
    if (!size()) { requestAnimationFrame(boot); return; }
    seed();
    if (paused()) step(0); else run();
  })();
})();
