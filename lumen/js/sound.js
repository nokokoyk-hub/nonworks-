/* LUMEN sound (Web Audio). Always starts OFF; only the toggle button can turn it on.
   Public API: window.LumenSound = { supported, enabled, toggle(), bounce(size01, strength), pop(),
   note(i), arpeggio(), stretch(), slide() }.
   - size01 is 0 (smallest shape) .. 1 (biggest shape); the caller normalises, this file knows nothing about shapes.
   - Every sound function is a no-op while OFF. */
(() => {
  'use strict';

  const Ctor = window.AudioContext || window.webkitAudioContext;
  /* Pentatonic, 330-880Hz: low notes were inaudible on small speakers, so nothing goes below ~300Hz. */
  const SCALE = [330, 392, 440, 523, 587, 659, 784, 880];
  const MAX_PER_SEC = 12;
  const MIN_STRENGTH = 0.25;

  let ctx = null, master = null;
  let on = false, busy = false;
  /* two separate rate-limit buckets: a pile of collisions must never swallow the sound of a tap */
  const stamps = { hit: [], ui: [] };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const or = (v, d) => (v === undefined ? d : v);
  const notify = () => window.dispatchEvent(new CustomEvent('lumensound', { detail: { on } }));
  const ready = () => on && ctx !== null && ctx.state === 'running';

  /* at most MAX_PER_SEC sounds per rolling second, per bucket */
  function allow(bucket) {
    const list = stamps[bucket], now = performance.now();
    while (list.length && now - list[0] > 1000) list.shift();
    if (list.length >= MAX_PER_SEC) return false;
    list.push(now);
    return true;
  }

  function tone(freq, opts) {
    const o = opts || {};
    const at = or(o.at, 0), dur = or(o.dur, 0.16), vol = or(o.vol, 0.4);
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol), t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  /* a short "pon": sine that settles a little downward, plus a quiet octave for small speakers */
  function pon(freq, at, vol, dur) {
    const d = or(dur, 0.2);
    tone(freq * 1.05, { at, dur: d, vol, glideTo: freq });
    tone(freq * 2, { at, dur: d * 0.6, vol: vol * 0.22, type: 'triangle' });
  }

  function build() {
    /* iPhone: without this, the silent switch mutes Web Audio even when the context is running */
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (_) { /* optional API */ }
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.4;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 20;
    comp.ratio.value = 6;
    comp.attack.value = 0.003;
    comp.release.value = 0.2;
    master.connect(comp);
    comp.connect(ctx.destination);
    /* if the OS interrupts audio (call, other app), fall back to OFF instead of lying.
       onstatechange (not addEventListener) so old webkitAudioContext works too */
    ctx.onstatechange = () => {
      if (on && !busy && ctx.state !== 'running') { on = false; notify(); }
    };
  }

  const withTimeout = (p, ms) => Promise.race([p, new Promise((res) => setTimeout(res, ms))]);

  async function toggle() {
    if (busy) return on;
    busy = true;
    try {
      if (on) {
        on = false;
        try { await withTimeout(ctx.suspend(), 1500); } catch (_) { /* already off */ }
        notify();
        return false;
      }
      if (!Ctor) return false;
      if (!ctx) build();
      await withTimeout(ctx.resume(), 1500);
      if (ctx.state !== 'running') return false; /* stay OFF unless audio really runs */
      on = true;
      notify();
      pon(523, 0, 0.4, 0.2);
      pon(784, 0.1, 0.4, 0.26);
      return true;
    } catch (_) {
      on = false;
      notify();
      return false;
    } finally {
      busy = false;
    }
  }

  window.LumenSound = {
    supported: !!Ctor,
    get enabled() { return ready(); },
    toggle,

    /* collision / wall: bigger shapes sound lower; weak hits stay silent */
    bounce(size01, strength) {
      if (!ready() || strength < MIN_STRENGTH || !allow('hit')) return;
      const jitter = Math.floor(Math.random() * 3) - 1;
      const idx = clamp(Math.round((1 - clamp(size01, 0, 1)) * (SCALE.length - 1)) + jitter, 0, SCALE.length - 1);
      pon(SCALE[idx], 0, 0.16 + 0.34 * clamp(strength, 0, 1));
    },
    /* tap to add shapes */
    pop() {
      if (!ready() || !allow('ui')) return;
      pon(SCALE[3], 0, 0.4, 0.14);
      pon(SCALE[5], 0.07, 0.4, 0.2);
    },
    note(i) {
      if (!ready() || !allow('ui')) return;
      pon(SCALE[((i % SCALE.length) + SCALE.length) % SCALE.length], 0, 0.45, 0.26);
    },
    arpeggio() {
      if (!ready() || !allow('ui')) return; /* judged once per call so the 3 notes stay together */
      [2, 4, 6].forEach((n, k) => pon(SCALE[n], k * 0.13, 0.42, 0.24));
    },
    stretch() {
      if (!ready() || !allow('ui')) return;
      tone(392, { dur: 0.22, vol: 0.4, glideTo: 784 });
      tone(784, { at: 0.22, dur: 0.24, vol: 0.34, glideTo: 392 });
    },
    slide() {
      if (!ready() || !allow('ui')) return;
      tone(880, { dur: 0.55, vol: 0.4, glideTo: 330 });
    }
  };
})();
