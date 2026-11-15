'use strict';
/* ================= Klang: alles wird live mit der Web-Audio-Schnittstelle erzeugt =================
   Keine Audiodateien. Musik: eine kleine Tavernen-Jig im 6/8-Takt (D-Dorisch) mit Laute, Bass und Rahmentrommel.
   Im Kampf wechselt die Musik auf eine düstere Trommel-Variante. */
const Snd = (() => {
  let ctx = null, master = null, musicBus = null, sfxBus = null, revIn = null, noiseBuf = null;
  const st = {music: true, sfx: true, mvol: 0.5, svol: 0.8};
  let playing = false, timer = null, nextT = 0, bar = 0, beat = 0, mood = 'tavern', pendingMood = 'tavern', round = 0, theme = 'taverne', pendingTheme = 'taverne';

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2;
    master = ctx.createGain(); master.gain.value = 0.9;
    master.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain(); sfxBus = ctx.createGain();
    musicBus.connect(master); sfxBus.connect(master);
    // kleiner Hall für den Tavernenraum
    const conv = ctx.createConvolver(); conv.buffer = impulse(1.8, 2.8);
    const revGain = ctx.createGain(); revGain.gain.value = 0.25;
    revIn = ctx.createGain(); revIn.connect(conv); conv.connect(revGain); revGain.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    applyVol(true);
    return true;
  }
  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return buf;
  }
  function applyVol(now) {
    if (!ctx) return;
    const t = ctx.currentTime, m = st.music ? st.mvol * 0.55 : 0, s = st.sfx ? st.svol : 0;
    musicBus.gain.cancelScheduledValues(t); sfxBus.gain.cancelScheduledValues(t);
    if (now) { musicBus.gain.value = m; sfxBus.gain.value = s; }
    else { musicBus.gain.setTargetAtTime(m, t, 0.15); sfxBus.gain.setTargetAtTime(s, t, 0.05); }
  }

  /* ---------- Bausteine ---------- */
  function tone(f, t, dur, type, vol, o = {}) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + (o.glide || dur));
    if (o.detune) osc.detune.value = o.detune;
    let node = osc;
    if (o.lp || o.bp || o.hp) {
      const fl = ctx.createBiquadFilter(); fl.type = o.lp ? 'lowpass' : o.bp ? 'bandpass' : 'highpass';
      fl.frequency.value = o.lp || o.bp || o.hp; fl.Q.value = o.q || (o.bp ? 4 : 0.8);
      if (o.lpTo) fl.frequency.exponentialRampToValueAtTime(o.lpTo, t + dur);
      osc.connect(fl); node = fl;
    }
    if (o.vib) { const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = o.vib; lg.gain.value = o.vibAmt || 6; lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t); lfo.stop(t + dur + 0.1); }
    const a = o.a || 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g); g.connect(o.bus || sfxBus);
    if (o.rev) { const rg = ctx.createGain(); rg.gain.value = o.rev; g.connect(rg); rg.connect(revIn); }
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  function noise(t, dur, vol, type, f0, f1, o = {}) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const fl = ctx.createBiquadFilter(); fl.type = type || 'bandpass'; fl.frequency.setValueAtTime(f0 || 1000, t);
    if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
    fl.Q.value = o.q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (o.a || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(fl); fl.connect(g); g.connect(o.bus || sfxBus);
    if (o.rev) { const rg = ctx.createGain(); rg.gain.value = o.rev; g.connect(rg); rg.connect(revIn); }
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }
  function brass(f, t, dur, vol) {
    tone(f, t, dur, 'sawtooth', vol, {lp: 900, lpTo: 2400, a: 0.03, rev: 0.3});
    tone(f * 1.003, t, dur, 'sawtooth', vol * 0.6, {lp: 700, a: 0.04});
  }

  /* ---------- Soundeffekte ---------- */
  const FX = {
    tap(t)     { tone(1250, t, 0.035, 'sine', 0.10); noise(t, 0.02, 0.04, 'highpass', 3500); },
    page(t)    { noise(t, 0.22, 0.10, 'bandpass', 700, 2600, {q: 0.8}); },
    deal(t)    { noise(t, 0.08, 0.16, 'highpass', 2200); tone(420, t, 0.05, 'triangle', 0.04); },
    flip(t)    { noise(t, 0.13, 0.22, 'bandpass', 3200, 900, {q: 1.2}); tone(240, t + 0.02, 0.06, 'triangle', 0.06); },
    thud(t)    { tone(120, t, 0.28, 'sine', 0.7, {to: 42}); noise(t, 0.14, 0.35, 'lowpass', 600, 200); noise(t + 0.06, 0.4, 0.05, 'bandpass', 500, 300, {q: 3, rev: 0.6}); },
    play(t)    { noise(t, 0.07, 0.28, 'lowpass', 1800, 600); tone(190, t, 0.06, 'sine', 0.12); },
    coin(t, v=1){ tone(1568, t, 0.25, 'triangle', 0.16 * v, {rev: 0.3}); tone(2093, t + 0.07, 0.4, 'triangle', 0.14 * v, {rev: 0.3}); tone(3136, t + 0.07, 0.25, 'sine', 0.05 * v); },
    levelup(t) { [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.085, 0.3, 'triangle', 0.17, {rev: 0.4})); tone(2093, t + 0.34, 0.5, 'sine', 0.07, {rev: 0.5}); tone(2637, t + 0.41, 0.5, 'sine', 0.05, {rev: 0.5}); },
    leveldown(t){ [392, 330, 262].forEach((f, i) => tone(f, t + i * 0.11, 0.25, 'square', 0.05, {lp: 1100})); },
    battle(t)  { tone(80, t, 0.5, 'sine', 0.8, {to: 40}); noise(t, 0.2, 0.3, 'lowpass', 900, 200); tone(587, t + 0.03, 0.6, 'square', 0.045, {bp: 1900, q: 8, rev: 0.5}); tone(881, t + 0.03, 0.5, 'square', 0.035, {bp: 2700, q: 8, rev: 0.5}); },
    evil(t)    { tone(220, t, 0.6, 'sawtooth', 0.11, {to: 104, lp: 900, vib: 7, vibAmt: 5}); tone(233, t + 0.02, 0.6, 'sawtooth', 0.08, {to: 110, lp: 700}); },
    win(t)     { brass(523, t, 0.13, 0.13); brass(659, t + 0.12, 0.13, 0.13); brass(784, t + 0.24, 0.13, 0.13); brass(1047, t + 0.36, 0.6, 0.15); tone(1568, t + 0.36, 0.6, 'triangle', 0.05, {rev: 0.4}); },
    lose(t)    { [392, 370, 349].forEach((f, i) => brass(f / 2, t + i * 0.28, 0.27, 0.12)); tone(330 / 2, t + 0.84, 0.9, 'sawtooth', 0.12, {lp: 800, vib: 6, vibAmt: 4, a: 0.03}); },
    dice(t)    { for (let i = 0, x = 0; i < 9; i++) { x += 0.05 + Math.random() * 0.04; noise(t + x, 0.025, 0.18, 'bandpass', 1800 + Math.random() * 2200, null, {q: 3}); } },
    diceland(t){ noise(t, 0.06, 0.35, 'bandpass', 1400, null, {q: 2}); tone(260, t, 0.06, 'sine', 0.12); },
    escape(t)  { noise(t, 0.38, 0.2, 'bandpass', 450, 3600, {q: 1.5}); tone(500, t + 0.1, 0.25, 'triangle', 0.05, {to: 1200}); },
    hurt(t)    { tone(95, t, 0.35, 'sine', 0.7, {to: 45}); noise(t, 0.18, 0.4, 'lowpass', 900, 250); tone(160, t, 0.2, 'sawtooth', 0.06, {lp: 500}); },
    curse(t)   { [311, 330, 466].forEach((f, i) => tone(f, t + i * 0.06, 0.9, 'sawtooth', 0.05, {lp: 1100, vib: 5 + i, vibAmt: 8, a: 0.05, rev: 0.6})); tone(78, t, 0.9, 'sine', 0.25); },
    death(t)   { [[220, 1], [440 * 1.19, 0.5], [660 * 1.33, 0.3], [880 * 1.5, 0.2]].forEach(([f, v]) => tone(f, t, 2.4, 'sine', 0.16 * v, {rev: 0.8})); tone(110, t, 1.2, 'sine', 0.2, {rev: 0.5}); },
    victory(t) { const n = [523, 659, 784, 1047, 784, 1047]; n.forEach((f, i) => brass(f, t + i * 0.14, i === 5 ? 1.1 : 0.15, 0.14)); [523, 659, 784].forEach(f => tone(f, t + 0.7, 1.2, 'triangle', 0.06, {rev: 0.5})); },
    defeat(t)  { [294, 277, 262, 247].forEach((f, i) => tone(f, t + i * 0.35, 0.5, 'triangle', 0.12, {rev: 0.5})); tone(123, t + 1.4, 1.4, 'sine', 0.2, {rev: 0.6}); }
  };
  function sfx(name, v) {
    if (!ctx || !st.sfx || !FX[name]) return;
    try { FX[name](ctx.currentTime + 0.01, v); } catch (e) { /* Klang ist Beiwerk */ }
  }

  /* ---------- Musik ---------- */
  // Takte à 6 Achtel: [Midi-Note, Achtel]; 0 = Pause
  const A = [
    [[69,2],[74,1],[74,2],[76,1]], [[77,2],[76,1],[74,2],[72,1]], [[69,2],[67,1],[65,2],[67,1]], [[69,3],[69,2],[0,1]],
    [[69,2],[74,1],[74,2],[76,1]], [[77,2],[79,1],[77,2],[76,1]], [[74,2],[72,1],[69,2],[67,1]], [[74,3],[74,2],[0,1]]
  ];
  const B = [
    [[77,2],[77,1],[76,2],[74,1]], [[72,2],[74,1],[76,3]], [[74,2],[72,1],[69,2],[67,1]], [[65,2],[67,1],[69,3]],
    [[77,2],[77,1],[76,2],[74,1]], [[72,2],[74,1],[76,2],[77,1]], [[74,2],[72,1],[69,2],[71,1]], [[74,3],[74,3]]
  ];
  const CH = { Dm: [50, 53, 57], F: [53, 57, 60], C: [48, 52, 55], Am: [45, 48, 52], G: [43, 47, 50], Bb: [46, 50, 53], A: [45, 49, 52] };
  const A_CH = ['Dm', 'F', 'F', 'Am', 'Dm', 'F', 'C', 'Dm'];
  const B_CH = ['F', 'C', 'Dm', 'F', 'F', 'C', 'G', 'Dm'];
  const BATTLE_CH = ['Dm', 'Dm', 'Bb', 'A'];
  // Keller: langsam, Moll, Bordunton und tropfendes Wasser
  CH.Gm = [43, 46, 50];
  const K = [
    [[62,3],[65,3]], [[64,2],[62,1],[60,3]], [[57,6]], [[0,6]],
    [[62,3],[65,3]], [[69,2],[67,1],[65,3]], [[64,3],[61,3]], [[62,4],[0,2]]
  ];
  const K_CH = ['Dm', 'Gm', 'Dm', 'A', 'Dm', 'Bb', 'A', 'Dm'];
  const KB_CH = ['Dm', 'Bb', 'Gm', 'A'];
  function drip(t) { const f = 1500 + Math.random() * 1100; tone(f, t, 0.09, 'sine', 0.045, {bus: musicBus, to: f * 1.6, rev: 0.85}); }

  function pluck(m, t, dur, vol) {
    const f = mtof(m);
    tone(f, t, dur * 1.6, 'triangle', vol, {bus: musicBus, lp: 3200, lpTo: 700, rev: 0.35});
    tone(f * 2, t, dur * 0.7, 'sawtooth', vol * 0.18, {bus: musicBus, lp: 2500, lpTo: 600});
  }
  function bassN(m, t, dur, vol) { tone(mtof(m), t, dur, 'triangle', vol, {bus: musicBus, lp: 500}); }
  function drum(t, vol, low = true) {
    tone(low ? 105 : 180, t, low ? 0.25 : 0.12, 'sine', vol, {bus: musicBus, to: low ? 48 : 90});
    noise(t, 0.05, vol * 0.25, 'lowpass', 1200, 400, {bus: musicBus});
  }
  function rim(t, vol) { noise(t, 0.03, vol, 'bandpass', 2600, null, {bus: musicBus, q: 2}); }

  function scheduleBar(t, e) {
    if (theme === 'keller' && mood === 'tavern') {
      const idx = bar % 8, ch = CH[K_CH[idx]];
      let x = 0;
      K[idx].forEach(([m, len]) => { if (m) pluck(m, t + x * e, len * e, 0.12); x += len; });
      tone(mtof(38), t, 6 * e, 'triangle', 0.11, {bus: musicBus, lp: 380});
      tone(mtof(45), t, 6 * e, 'sine', 0.05, {bus: musicBus, lp: 600});
      [0, 1, 2].forEach(i => pluck(ch[i], t + i * 0.09 + 3 * e, 2.4 * e, 0.03));
      drum(t, 0.14);
      if (Math.random() < 0.6) drip(t + Math.random() * 6 * e);
      if (Math.random() < 0.25) drip(t + Math.random() * 6 * e);
      return;
    }
    if (theme === 'keller') {
      const ch = CH[KB_CH[bar % 4]];
      for (let i = 0; i < 6; i++) bassN(ch[0] - 12, t + i * e, 0.85 * e, i % 3 === 0 ? 0.27 : 0.15);
      drum(t, 0.45); drum(t + 2 * e, 0.22, false); drum(t + 3 * e, 0.38); drum(t + 5 * e, 0.25, false); rim(t + 4 * e, 0.07);
      [0, 1, 2].forEach(i => pluck(ch[i] + 12, t + i * 0.025, 1.8 * e, 0.055));
      if (bar % 2 === 1) { pluck(ch[2] + 12, t + 3 * e, e, 0.07); pluck(ch[1] + 12, t + 4 * e, e, 0.07); pluck(ch[0] + 12, t + 5 * e, e, 0.07); }
      return;
    }
    if (mood === 'tavern') {
      const part = (bar % 16) < 8 ? A : B, idx = bar % 8, notes = part[idx];
      const ch = CH[((bar % 16) < 8 ? A_CH : B_CH)[idx]];
      let x = 0;
      notes.forEach(([m, len]) => {
        if (m) { pluck(m, t + x * e, len * e, 0.17); if (round % 2 === 1 && len >= 2) pluck(m - (m % 12 === 2 || m % 12 === 9 ? 3 : 4), t + x * e, len * e, 0.06); }
        x += len;
      });
      // Begleitung: Bass auf 1 und 4, gebrochener Akkord
      bassN(ch[0] - 12, t, 2.6 * e, 0.22); bassN(ch[0] - 5, t + 3 * e, 2.6 * e, 0.18);
      [0, 1, 2].forEach(i => pluck(ch[i], t + (i * 0.06) + 1 * e, 1.6 * e, 0.045));
      [0, 1, 2].forEach(i => pluck(ch[i], t + (i * 0.06) + 4 * e, 1.6 * e, 0.04));
      drum(t, 0.32); rim(t + 2 * e, 0.05); drum(t + 3 * e, 0.18, false); rim(t + 5 * e, 0.06);
    } else {
      const ch = CH[BATTLE_CH[bar % 4]];
      for (let i = 0; i < 6; i++) bassN(ch[0] - 12, t + i * e, 0.9 * e, i === 0 || i === 3 ? 0.26 : 0.14);
      drum(t, 0.45); drum(t + 3 * e, 0.35); drum(t + 4 * e, 0.2, false); drum(t + 5 * e, 0.25, false);
      if (bar % 2 === 0) [0, 1, 2].forEach(i => pluck(ch[i] + 12, t + i * 0.03, 2.5 * e, 0.06));
      if (bar % 4 === 3) { pluck(69, t + 3 * e, e, 0.08); pluck(70, t + 4 * e, e, 0.08); pluck(69, t + 5 * e, e, 0.08); }
    }
  }
  function tick() {
    if (!ctx || !playing) return;
    const e = mood === 'tavern' ? (theme === 'keller' ? 0.26 : 0.19) : (theme === 'keller' ? 0.13 : 0.15);
    while (nextT < ctx.currentTime + 0.25) {
      if (pendingMood !== mood || pendingTheme !== theme) { mood = pendingMood; theme = pendingTheme; bar = 0; }
      scheduleBar(nextT, e);
      nextT += 6 * e; bar++;
      if (mood === 'tavern' && bar % 16 === 0) round++;
    }
  }
  function startMusic() {
    if (!ctx || playing) return;
    playing = true; nextT = ctx.currentTime + 0.1; bar = 0; mood = pendingMood; theme = pendingTheme;
    timer = setInterval(tick, 40); tick();
  }
  function stopMusic() { playing = false; if (timer) clearInterval(timer); timer = null; }

  return {
    unlock() { if (!init()) return; if (ctx.state === 'suspended') ctx.resume(); },
    running: () => !!ctx && ctx.state === 'running',
    set(o) { Object.assign(st, o); applyVol(false); if (st.music && ctx && !playing) startMusic(); },
    sfx,
    startMusic() { if (st.music) startMusic(); },
    stopMusic,
    mood(m) { pendingMood = m; },
    theme(t) { pendingTheme = t === 'keller' ? 'keller' : 'taverne'; },
    suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); },
    resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); },
    get ready() { return !!ctx; }
  };
})();
