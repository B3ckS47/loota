'use strict';
/* ================= Loota · Handy-Oberfläche ================= */
const APP_VERSION = '1.0';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const ICON = {
  phase: ['icons/phase-tuer.png', 'icons/phase-aerger.png', 'icons/phase-pluendern.png', 'icons/phase-gabe.png'],
  kampf: 'icons/wert-kampf.png', run: 'icons/wert-weglaufen.png', hand: 'icons/wert-hand.png',
  slot: {kopf: 'icons/icon-kopf.png', ruestung: 'icons/icon-ruestung.png', schuhe: 'icons/icon-schuhe.png', hand: 'icons/icon-haende.png',
    none: 'icons/icon-sonstiges.png', pack: 'icons/icon-rucksack.png', race: 'icons/icon-rasse.png', cls: 'icons/icon-klasse.png'},
  portrait: {Du: 'icons/portrait-du.png', Berta: 'icons/portrait-berta.png', Kalle: 'icons/portrait-kalle.png', Uschi: 'icons/portrait-uschi.png'}
};
const DICE = [1, 2, 3, 4, 5, 6].map(n => `icons/wuerfel-${n}.png`);
const PHASES = ['Tür aufstoßen', 'Monster herausfordern', 'Raum durchsuchen', 'Almosen'];
const portrait = p => p.human ? ICON.portrait.Du : (ICON.portrait[p.name] || ICON.portrait.Du);

/* ================= Einstellungen und Speicher ================= */
const K_SET = 'loota.settings', K_SAVE = 'loota.save';
function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
function clearSave() { try { localStorage.removeItem(K_SAVE); } catch (e) {} }
const SET_V = 2;
const SAVED_SET = load(K_SET);
const SET = Object.assign({music: true, sfx: true, mvol: 0.5, svol: 0.8, vibrate: true, reduce: false, advice: false, coach: false, open: false, speed: 'normal', bots: 3, diff: 'normal'}, SAVED_SET || {});
// Lernhilfen sind ab Einstellungs-Version 2 standardmäßig aus, auch für bereits gespeicherte Einstellungen
if ((SET.sv || 1) < SET_V) { SET.advice = false; SET.coach = false; SET.sv = SET_V; if (SAVED_SET) store(K_SET, SET); }
function saveSettings() { store(K_SET, SET); applySettings(); }
function applySettings() {
  UI.advice = SET.advice; UI.coach = SET.coach; UI.open = SET.open; UI.speed = SET.speed; UI.bots = SET.bots; UI.diff = SET.diff;
  UI.reduce = SET.reduce || matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.toggle('reduce', !!SET.reduce);
  Snd.set({music: SET.music, sfx: SET.sfx, mvol: SET.mvol, svol: SET.svol});
  if (!SET.music) Snd.stopMusic();
  renderSoundBtn();
}
function buzz(p) { if (SET.vibrate && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} } }

let GAME_ON = false;
CHECKPOINT_HANDLER = () => { store(K_SAVE, {S, seen: UI.seen, ts: Date.now(), bots: UI.bots, diff: UI.diff, v: APP_VERSION}); };

/* ================= Bildschirme ================= */
const SCREENS = ['title', 'setup', 'game', 'settings', 'rules', 'cards', 'quiz'];
let CUR = 'title';
const STACK = [];
function show(name) { if (name !== CUR) STACK.push(CUR); setScreen(name); }
function setScreen(name) {
  SCREENS.forEach(s => { const el = $('#scr-' + s); const on = s === name; el.hidden = !on; if (on) { el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); } });
  CUR = name;
  updatePaused();
  Snd.mood(name === 'game' && S && S.combat ? 'combat' : 'tavern');
  if (name === 'title') renderTitle();
  if (name === 'setup') renderControls();
  if (name === 'settings') { renderControls(); renderSaveInfo(); }
  if (name === 'cards') renderCards();
  if (name === 'quiz') renderQuiz();
  if (name === 'game') { W.renderedOnce = false; render(); }
  Motes.toggle(name === 'title');
}
function back() {
  if ($('.dialog')) { $('.dialog').remove(); return; }
  if (SHEETS.length) { if (topSheet().id === 'sel') return; popSheet(); return; }
  if (CUR === 'game') { openSheet({id: 'pause'}); return; }
  if (CUR === 'title') return;
  setScreen(STACK.pop() || 'title');
}
history.pushState({app: 1}, '');
window.addEventListener('popstate', () => { back(); history.pushState({app: 1}, ''); });

/* ================= Startbildschirm ================= */
function renderTitle() {
  const save = load(K_SAVE), active = GAME_ON && S && S.winner == null;
  const btn = $('#btn-continue');
  btn.hidden = !(active || save);
  if (active) $('#continue-info').textContent = `Runde ${S.turn} · Stufe ${S.players[0].lvl}`;
  else if (save) $('#continue-info').textContent = `Gespeichert: Runde ${save.S.turn} · Stufe ${save.S.players[0].lvl}`;
}
const Motes = (() => {
  const cv = $('#motes'), cx = cv.getContext('2d'); let on = false, parts = [];
  function size() { cv.width = cv.clientWidth * devicePixelRatio; cv.height = cv.clientHeight * devicePixelRatio; }
  function step() {
    if (!on) return;
    const w = cv.width, h = cv.height;
    cx.clearRect(0, 0, w, h);
    parts.forEach(p => { p.y -= p.v; p.x += Math.sin((p.y + p.o) / 60) * 0.3; if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      cx.globalAlpha = p.a; cx.fillStyle = '#f3c873'; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.3); cx.fill(); });
    requestAnimationFrame(step);
  }
  return { toggle(v) {
    if (v === on) return; on = v;
    if (on && !UI.reduce) { size(); parts = Array.from({length: 34}, () => ({x: Math.random() * cv.width, y: Math.random() * cv.height, r: (Math.random() * 1.6 + 0.6) * devicePixelRatio, v: (Math.random() * 0.35 + 0.12) * devicePixelRatio, a: Math.random() * 0.5 + 0.2, o: Math.random() * 400})); requestAnimationFrame(step); }
    else cx.clearRect(0, 0, cv.width, cv.height);
  } };
})();

/* ================= Steuerelemente (Setup und Optionen) ================= */
const DIFF_TXT = {gemuetlich: 'Die Bots greifen selten ein und verfluchen wenig. Gut zum Kennenlernen.', normal: 'Die Bots spielen wie typische Mitspieler: Sie bremsen vor allem, wer vorne liegt.', gnadenlos: 'Die Bots greifen oft ein und verteilen Flüche großzügig. Hier schenkt dir niemand etwas.'};
function renderControls() {
  $$('.seg[data-set]').forEach(seg => { const k = seg.dataset.set; seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(String(SET[k]) === b.dataset.v))); });
  $$('[data-toggle]').forEach(sw => sw.setAttribute('aria-checked', String(!!SET[sw.dataset.toggle])));
  $$('[data-range]').forEach(r => { r.value = SET[r.dataset.range]; });
  $('#diff-hint').textContent = DIFF_TXT[SET.diff] || '';
  $('#row-vibrate').hidden = !('vibrate' in navigator);
}
function renderSaveInfo() {
  const s = load(K_SAVE);
  $('#save-info').textContent = s ? `Gespeichert am ${new Date(s.ts).toLocaleString('de-DE', {dateStyle: 'short', timeStyle: 'short'})}: Runde ${s.S.turn}, du auf Stufe ${s.S.players[0].lvl}.` : 'Kein gespeichertes Spiel.';
  $('#app-version').textContent = 'Version ' + APP_VERSION;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent), standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  $('#install-hint').textContent = standalone ? 'Die App ist installiert.' : ios ? 'Installieren am iPhone: In Safari auf „Teilen“ tippen, dann „Zum Home-Bildschirm“.' : 'Installieren: Im Browser-Menü „App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen.';
}
document.addEventListener('input', e => {
  const r = e.target.closest('[data-range]'); if (!r) return;
  SET[r.dataset.range] = +r.value; saveSettings();
});

/* ================= Spiel starten ================= */
async function startNewGame() {
  if ((GAME_ON && S && S.winner == null) || load(K_SAVE)) {
    const ok = await confirmDialog('Neues Spiel?', 'Dein laufendes Spiel wird dabei überschrieben.', 'Neues Spiel', 'Abbrechen');
    if (!ok) return;
  }
  clearSave(); applySettings();
  W.reset(); GAME_ON = true;
  STACK.length = 0; STACK.push('title');
  setScreen('game');
  newGame(false);
}
function continueGame() {
  if (GAME_ON && S && S.winner == null) { setScreen('game'); return; }
  const d = load(K_SAVE); if (!d) return;
  UI.bots = d.bots || UI.bots; UI.diff = d.diff || UI.diff;
  W.reset(); GAME_ON = true;
  STACK.length = 0; STACK.push('title');
  setScreen('game');
  resumeGame(d);
}

/* ================= Hilfen für Darstellung ================= */
function patch(el, html) { if (el.__h !== html) { el.innerHTML = html; el.__h = html; return true; } return false; }
function cardNum(c) {
  switch (c.k) {
    case 'monster': return c.lvl; case 'curse': return '!'; case 'enh': return sign(c.v);
    case 'item': case 'oneshot': return c.b ? '+' + c.b : ''; case 'levelup': return '+1'; default: return '';
  }
}
function cardMini(c, o = {}) {
  const t = TYPES[c.k], num = cardNum(c), art = ART[c.n];
  const tag = o.inert ? 'span' : 'button';
  const data = o.inert ? '' : o.cname ? `data-cname="${esc(c.n)}"` : `data-uid="${c.uid}" data-where="${o.where || ''}"`;
  return `<${tag}${o.inert ? '' : ' type="button"'} class="mc k-${c.k}${o.size ? ' ' + o.size : ''}${o.extra ? ' ' + o.extra : ''}" ${data} aria-label="${esc(c.n)}">` +
    `<span class="mc-head"><span class="mc-type">${t.s || t.l}</span>${num !== '' ? `<span class="mc-num">${num}</span>` : ''}</span>` +
    (art ? `<img class="mc-art" src="${art}" alt="" loading="lazy" decoding="async" draggable="false">` : `<img class="mc-art" src="${ICON.slot.race}" alt="" draggable="false" style="object-fit:contain;padding:8px">`) +
    `<span class="mc-name">${esc(c.n)}</span></${tag}>`;
}
function cardBig(c) {
  const t = TYPES[c.k], num = cardNum(c), human = c === HUMAN;
  let body = '', foot = '';
  switch (c.k) {
    case 'monster': body = `<div>${c.txt}</div><div class="bc-bad"><b>Bei Niederlage:</b> ${c.badTxt}</div>`; foot = `<span>${c.tr} ${pl(c.tr, 'Schatz', 'Schätze')}</span><span>${c.up || 1} ${pl(c.up || 1, 'Stufe', 'Stufen')}</span>`; break;
    case 'item': body = `<div>${itemTxt(c) || 'Keine Besonderheit.'}</div>`; foot = `<span>${slotTxt(c)}</span><span>${fmt(c.g)} Gold</span>`; break;
    case 'oneshot': body = `<div>${c.txt || 'Im Kampf für eine Seite deiner Wahl. Danach ablegen.'}</div>`; foot = `<span>Einmal einsetzbar</span><span>${fmt(c.g)} Gold</span>`; break;
    case 'enh': body = '<div>In einem beliebigen Kampf auf ein Monster spielen.</div>'; foot = `<span>${c.trm > 0 ? '+' : '−'}${Math.abs(c.trm)} ${pl(Math.abs(c.trm), 'Schatz', 'Schätze')}</span>`; break;
    default: body = `<div>${c.txt || ''}</div>`;
  }
  const art = ART[c.n] ? `<img class="bc-art" src="${ART[c.n]}" alt="">` : human ? `<img class="bc-art human" src="${ICON.slot.race}" alt="">` : '';
  return `<div class="bc k-${c.k}"><div class="bc-head"><span class="bc-type">${human ? 'Rasse · keine Karte' : `${t.l} · ${t.d}karte`}</span>${num !== '' ? `<span class="bc-num">${num}</span>` : ''}</div>` +
    `<div class="bc-name">${esc(c.n)}</div>${art}<div class="bc-body">${body}</div>${foot ? `<div class="bc-foot">${foot}</div>` : ''}</div>`;
}
const coinsHTML = l => { let s = ''; for (let i = 1; i <= 10; i++) s += `<i class="${i <= l ? 'on' : ''}${i === l ? ' cur' : ''}${i === 10 ? ' goal' : ''}"></i>`; return s; };

/* ================= Beobachter: Effekte aus Zustandsänderungen ================= */
const W = {
  lv: {}, hand: new Set(), fresh: new Set(), reveal: null, combat: false, logSeen: 0, diceHideAt: 0, pulse: new Set(), renderedOnce: false,
  reset() { this.tableKey = null; this.fightRef = null; this.nums = {}; this.lv = {}; this.hand = new Set(); this.fresh = new Set(); this.reveal = null; this.combat = false; this.logSeen = 0; this.diceHideAt = 0; this.pulse = new Set(); this.renderedOnce = false; }
};
function watch() {
  if (!S) return;
  const first = !W.renderedOnce;
  S.players.forEach(p => {
    const prev = W.lv[p.id];
    if (prev != null && p.lvl !== prev) {
      if (p.lvl > prev) {
        if (p.human) { Snd.sfx('levelup'); buzz([20, 40, 20]); banner(`Stufe ${p.lvl}!`, 'good'); W.coinPop = true; setTimeout(() => { W.coinPop = false; }, 700); burstAt('#mebar', 14); }
        else { Snd.sfx('coin', 0.5); W.pulse.add(p.id); }
      } else if (p.human) { Snd.sfx('leveldown'); buzz(60); }
    }
    W.lv[p.id] = p.lvl;
  });
  const me0 = S.players[0], ids = new Set(me0.hand.map(c => c.uid));
  let added = 0;
  ids.forEach(u => { if (!W.hand.has(u)) { added++; if (!first) W.fresh.add(u); } });
  if (added && !first && CUR === 'game') { Snd.sfx('deal'); setTimeout(() => { W.fresh.clear(); render(); }, 650); }
  W.hand = ids;
  if (S.reveal && S.reveal.uid !== W.reveal) { W.reveal = S.reveal.uid; Snd.sfx('thud'); setTimeout(() => Snd.sfx('flip'), 160); buzz(25); }
  if (!S.reveal) W.reveal = null;
  const inC = !!S.combat;
  if (inC && !W.combat) { Snd.sfx('battle'); buzz(30); }
  if (inC !== W.combat && CUR === 'game') Snd.mood(inC ? 'combat' : 'tavern');
  W.combat = inC;
  W.renderedOnce = true;
}

/* ================= Rendern ================= */
let RQ = 0;
function render() {
  if (RQ) return;
  RQ = requestAnimationFrame(() => { RQ = 0; try { doRender(); } catch (e) { console.error(e); } });
}
function doRender() {
  if (S) { try { UI.adv = UI.advice ? advise() : null; } catch (e) { console.error(e); UI.adv = null; } } else UI.adv = null;
  watch();
  if (CUR === 'game' && S) { $('#scr-game').classList.toggle('fighting', !!S.combat); renderTop(); renderOpps(); renderTable(); renderAct(); renderMe(); renderHand(); }
  syncSel();
  if (SHEETS.length) renderSheet(false);
  renderDice();
}
function renderSoundBtn() {
  const on = SET.music || SET.sfx, b = $('#btn-sound'); if (!b) return;
  patch(b, on ? '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z M16 9a4 4 0 0 1 0 6 M18.5 6.5a8 8 0 0 1 0 11" /></svg>' : '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z M17 9l5 6 M22 9l-5 6" /></svg>');
}
function renderTop() {
  const who = S.winner != null ? 'Spiel vorbei' : S.cur === 0 ? 'Dein Zug' : `${P(S.cur).name} ist am Zug`;
  patch($('#tb-title'), `Runde ${S.turn} · ${esc(who)}`);
  patch($('#phasedots'), ICON.phase.map((src, i) => `<img src="${src}" alt="${PHASES[i]}" title="${PHASES[i]}" class="${S.phase === i + 1 ? 'on' : S.phase > i + 1 ? 'done' : ''}">`).join(''));
  const unread = Math.max(0, S.log.length - W.logSeen), badge = $('#log-badge');
  badge.hidden = unread === 0 || topSheet()?.id === 'log';
  badge.textContent = unread > 99 ? '99+' : unread;
}
function renderOpps() {
  const C = S.combat;
  const html = S.players.filter(p => !p.human).map(p => {
    const role = C && (C.f === p.id ? 'kämpft' : C.h === p.id ? 'hilft' : ''), turn = S.cur === p.id && S.winner == null;
    return `<button type="button" class="oc${turn ? ' turn' : ''}${p.dead ? ' dead' : ''}" data-opp="${p.id}" aria-label="${esc(p.name)}, Stufe ${p.lvl}">` +
      (role ? `<span class="tag red">${role}</span>` : p.dead ? '<span class="tag">tot</span>' : turn ? '<span class="tag">am Zug</span>' : '') +
      `<span class="pt"><img src="${portrait(p)}" alt=""><span class="lvb">${p.lvl}</span></span>` +
      `<span class="ot"><span class="on">${esc(p.name)}</span><span class="os"><span><img src="${ICON.kampf}" alt="">${power(p)}</span><span><img src="${ICON.run}" alt="">${sign(runBonus(p))}</span><span><img src="${ICON.hand}" alt="">${p.hand.length}</span></span></span></button>`;
  }).join('');
  patch($('#opps'), html);
  if (W.pulse.size) { W.pulse.forEach(id => { const el = $(`.oc[data-opp="${id}"]`); if (el) { el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); } }); W.pulse.clear(); }
}
/* Spielfeld: große Bildfläche für Kampf und aufgedeckte Karten */
const ART_FALLBACK = 'icons/icon-sonstiges.png';
function revealTxt(c) {
  if (c.k === 'item') return itemTxt(c) || `${slotTxt(c)}, ${fmt(c.g)} Gold`;
  if (c.k === 'enh') return `${sign(c.v)} für ein Monster`;
  if (c.k === 'oneshot') return c.txt || 'Einmal im Kampf einsetzbar.';
  return c.txt || '';
}
function artTop(c, enh) {
  const t = TYPES[c.k];
  const chip = c.k === 'monster' ? `Monster · Stufe ${c.lvl}` : `${t.d} · ${t.l}`;
  return `<span class="chip-k">${chip}</span><span class="aname">${esc(c.n)}</span>` +
    (enh && enh.length ? `<span class="enhs">${enh.map(e => `<span class="enh">${esc(e.n)} ${sign(e.v)}</span>`).join('')}</span>` : '');
}
function artNode(c, enh, anim) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = `art k-${c.k}${anim ? ' ' + anim : ''}`;
  b.dataset.uid = c.uid; b.dataset.where = 'table';
  b.setAttribute('aria-label', c.n + ', Karte ansehen');
  b.innerHTML = `<img src="${ART[c.n] || ART_FALLBACK}" alt="" decoding="async"><span class="art-top"></span>`;
  patch(b.querySelector('.art-top'), artTop(c, enh));
  return b;
}
function hudHTML(C) {
  const sF = sideStrength(C), sM = monStrength(C), r = evalCombat(C), f = P(C.f), h = C.h != null ? P(C.h) : null;
  const pts = [f, h].filter(Boolean).map(p => `<img src="${portrait(p)}" alt="">`).join('');
  const who = (f.human ? 'Du' : f.name) + (h ? ' + ' + (h.human ? 'du' : h.name) : '');
  const team = f.human || (h && h.human);
  const verdict = r.win ? (f.human ? 'du gewinnst' : team ? 'ihr gewinnt' : f.name + ' gewinnt') : (f.human ? 'du verlierst' : team ? 'ihr verliert' : f.name + ' verliert');
  return `<button type="button" class="side me" data-go="parts" aria-label="Kampfstärke ${sF.s}, Aufschlüsselung"><span class="pts">${pts}</span><span class="sv"><b class="snum" data-n="f">${sF.s}</b><span class="slbl">${esc(who)}</span></span></button>` +
    `<div class="mid"><span class="verdict ${r.win ? 'win' : 'lose'}">${esc(verdict)}</span>${r.a === r.b ? `<span class="tie">${r.tieWin ? 'Krieger: Gleichstand gewinnt' : 'Gleichstand verliert'}</span>` : ''}</div>` +
    `<button type="button" class="side mon" data-go="parts" aria-label="Monsterstärke ${sM.s}, Aufschlüsselung"><span class="sv"><b class="snum red" data-n="m">${sM.s}</b><span class="slbl">${C.mons.length > 1 ? C.mons.length + ' Monster' : 'Monster'}</span></span></button>`;
}
function renderTable() {
  const el = $('#table');
  const C = S.combat, R = S.reveal;
  const key = C ? 'fight' : R ? 'reveal:' + R.uid : 'idle';
  if (key !== W.tableKey || (C && C !== W.fightRef)) {
    const prevReveal = W.tableKey && W.tableKey.startsWith('reveal:') ? +W.tableKey.slice(7) : null;
    W.tableKey = key; W.fightRef = C || null; W.nums = {};
    el.__h = null; el.innerHTML = '';
    if (C) {
      el.innerHTML = '<div class="arena fight"><div class="arts"></div><div class="hud enter"></div></div>';
    } else if (R) {
      el.innerHTML = '<div class="arena reveal"><div class="arts"></div><div class="hud rhud enter"></div></div>';
      el.querySelector('.arts').appendChild(artNode(R, null, 'flip'));
      patch(el.querySelector('.hud'), `<span class="rtxt">${linkify(esc(stripTags(revealTxt(R))))}</span>`);
    } else {
      el.innerHTML = '<div class="idle"></div>';
    }
    W.prevReveal = prevReveal;
  }
  if (C) {
    const arts = el.querySelector('.arts'), have = new Map([...arts.children].map(n => [+n.dataset.uid, n]));
    C.mons.forEach((m, i) => {
      let n = have.get(m.c.uid);
      if (!n) { n = artNode(m.c, m.enh, m.c.uid === W.prevReveal ? '' : 'enter'); }
      else patch(n.querySelector('.art-top'), artTop(m.c, m.enh));
      have.delete(m.c.uid);
      if (arts.children[i] !== n) arts.insertBefore(n, arts.children[i] || null);
    });
    have.forEach(n => n.remove());
    arts.dataset.n = C.mons.length;
    const hud = el.querySelector('.hud');
    if (patch(hud, hudHTML(C))) {
      hud.querySelectorAll('.snum').forEach(b => {
        const k = b.dataset.n, v = +b.textContent;
        if (W.nums[k] != null && W.nums[k] !== v) { b.classList.add(v > W.nums[k] ? 'up' : 'down'); }
        W.nums[k] = v;
      });
    }
  } else if (!R) {
    patch(el.querySelector('.idle'), `<div class="decks"><div class="deck"><div class="back door">Tür</div>${S.door.length} · Ablage ${S.doorDisc.length}</div><div class="deck"><div class="back treas">Schatz</div>${S.tr.length} · Ablage ${S.trDisc.length}</div></div><div class="idle-txt">${S.winner != null ? 'Das Spiel ist vorbei.' : S.cur === 0 ? 'Die Tür ist noch zu. Was wohl dahinter lauert?' : esc(P(S.cur).name) + ' ist am Zug.'}</div>`);
  }
}
const stripTags = h => String(h).replace(/<[^>]+>/g, '');
function adviceBox() {
  const a = UI.adv; if (!a) return '';
  const can = a.opt !== undefined || a.uid || a.sell || (UI.sel && a.picks);
  return `<div class="adv${UI.advOpen ? ' open' : ''}" data-advtoggle><div class="t"><b>${linkify(esc(a.text))}</b><span class="why">${linkify(esc(a.why || ''))}</span></div>${can ? '<button type="button" class="btn" data-adv>Übernehmen</button>' : ''}</div>`;
}
/* Aktionsleiste: eine Zeile Kontext, darunter wenige kompakte Buttons */
const SHORT_OPT = [
  [/^Fertig: Monster besiegen$/, 'Monster besiegen'], [/^Aufgeben und weglaufen$/, 'Weglaufen'],
  [/^Krieger: .*/, 'Krieger-Fähigkeit'], [/^Priester: .*/, 'Gegen Untote'], [/^Dieb: .*/, 'In den Rücken fallen'],
  [/^(.+) \(Kampfstärke (\d+)\)$/, '$1 ($2)'], [/^Helfen \(für (\d+) (Schatz|Schätze)\)$/, 'Helfen: $1 $2'], [/^Glücksamulett einsetzen$/, 'Amulett einsetzen']
];
function shortOpt(l, ctx) {
  if (ctx === 'helpOffer') { const m = l.match(/^(\d+) (Schatz|Schätze)$/); if (m) return m[1]; }
  for (const [re, rep] of SHORT_OPT) if (re.test(l)) return l.replace(re, rep);
  return l;
}
function promptCaption(q, ctx, data) {
  const p = me();
  switch (ctx) {
    case 'kick': return q.text || q.title;
    case 'trouble': return 'Kein Monster hinter der Tür';
    case 'charity': { const over = p.hand.length - handLimit(p); return over > 0 ? `Almosen: ${over} ${pl(over, 'Karte', 'Karten')} zu viel` : 'Fertig? Dann Zug beenden'; }
    case 'helpWho': return 'Wen bittest du um Hilfe?';
    case 'helpOffer': return data && data.b ? `Wie viele Schätze bekommt ${data.b.name}?` : q.title;
    case 'botHelp': return data && data.b ? `${data.b.name} bittet dich um Hilfe` : q.title;
    case 'run': {
      if (!data || !data.m) return q.title;
      const need = 5 - (runBonus(p) + (data.m.c.run || 0));
      return `Flucht vor ${data.m.c.n}: ` + (need <= 1 ? 'klappt sicher' : need > 6 ? 'nur mit Karten' : `ab einer ${need}`);
    }
    default: return q.title;
  }
}
function dockButtons(q, ctx) {
  const items = [];
  const mons = ctx === 'trouble' ? q.opts.map((o, i) => [o, i]).filter(([o]) => /^m\d+$/.test(String(o.v))) : [];
  q.opts.forEach((o, i) => { if (!mons.some(([, j]) => j === i)) items.push({type: 'opt', i, o}); });
  if (mons.length) items.unshift({type: 'pick', o: {l: 'Herausfordern', kind: ''}, rec: UI.adv && mons.some(([o]) => o.v === UI.adv.opt)});
  // Primäraktion zuerst, „Abbrechen“ zuletzt
  items.sort((x, y) => (x.o.kind === 'primary' ? -1 : 0) - (y.o.kind === 'primary' ? -1 : 0) || (x.o.kind === 'ghost' ? 1 : 0) - (y.o.kind === 'ghost' ? 1 : 0));
  const cancel = items.filter(it => it.o.kind === 'ghost');
  let main = items.filter(it => it.o.kind !== 'ghost');
  const allNum = main.every(it => it.type === 'opt' && /^\d+$/.test(shortOpt(it.o.l, ctx)));
  if (main.length > 3 && !allNum) main = [...main.slice(0, 2), {type: 'more', o: {l: 'Mehr …', kind: ''}}];
  return [...main, ...cancel];
}
function renderAct() {
  const el = $('#act');
  let html, cls = 'act';
  if (S.winner != null) {
    const w = P(S.winner);
    cls += ' your';
    html = `<div class="cap"><span class="ct">${w.human ? 'Du hast gewonnen!' : esc(w.name) + ' gewinnt.'}</span></div><div class="dbtns"><button type="button" class="btn primary" data-go="again">Nochmal</button><button type="button" class="btn" data-go="menu">Hauptmenü</button></div>`;
  } else if (UI.prompt) {
    const q = UI.prompt.get(), ctx = UI.prompt.ctx, data = UI.prompt.data; UI.opts = q.opts;
    cls += ' your';
    const hasInfo = !!(q.text || (UI.coach && q.hint && q.hint.length) || UI.adv);
    const tip = UI.adv ? '<span class="tipchip">Tipp</span>' : '';
    const btns = dockButtons(q, ctx).map(it => {
      const k = it.o.kind === 'primary' ? ' primary' : it.o.kind === 'danger' ? ' danger' : it.o.kind === 'ghost' ? ' ghost' : '';
      const rec = (it.type === 'opt' && UI.adv && UI.adv.opt !== undefined && UI.adv.opt === it.o.v) || it.rec ? ' rec' : '';
      const num = it.type === 'opt' && /^\d+$/.test(shortOpt(it.o.l, ctx)) ? ' num' : '';
      const attr = it.type === 'opt' ? `data-opt="${it.i}"` : it.type === 'pick' ? 'data-dpick' : 'data-dmore';
      if (it.o.kind === 'ghost' && /^Abbrechen$/.test(it.o.l)) return `<button type="button" class="btn ghost x" ${attr} aria-label="Abbrechen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg></button>`;
      return `<button type="button" class="btn${k}${rec}${num}" ${attr} ${it.o.dis ? 'disabled' : ''}>${esc(it.type === 'opt' ? shortOpt(it.o.l, ctx) : it.o.l)}</button>`;
    }).join('');
    html = `<button type="button" class="cap${hasInfo ? ' info' : ''}" ${hasInfo ? 'data-dinfo' : 'disabled'}>${tip}<span class="ct">${esc(stripTags(promptCaption(q, ctx, data)))}</span>${hasInfo ? '<span class="ii" aria-label="Mehr Infos">i</span>' : ''}</button><div class="dbtns">${btns}</div>`;
  } else {
    cls += ' idle';
    const last = S.log.slice().reverse().find(e => e.kind !== 'turn' && (UI.coach || e.kind !== 'rule'));
    const who = P(S.cur);
    const line = last ? stripTags(last.t) : (S.cur === 0 ? 'Einen Moment …' : `${who.name} ist am Zug`);
    html = `<div class="cap"><img class="cpt" src="${portrait(who)}" alt=""><span class="ct">${esc(line)}</span></div>`;
  }
  if (el.className !== cls) el.className = cls;
  patch(el, html);
}
function renderMe() {
  const p = me();
  const C = S.combat, role = C ? (C.f === 0 ? ' · kämpft' : C.h === 0 ? ' · hilft' : '') : '';
  const over = p.hand.length > handLimit(p);
  patch($('#mebar'), `<button type="button" class="ptbtn" data-go="equip" aria-label="Deine Werte und Ausrüstung"><img class="pt" src="${ICON.portrait.Du}" alt=""></button><span class="lv"><b>Stufe ${p.lvl}${p.dead ? ' · tot' : role}</b><span class="coins${W.coinPop ? ' pop' : ''}">${coinsHTML(p.lvl)}</span></span>` +
    `<span class="mstats"><button type="button" class="mstat" data-go="equip" aria-label="Kampfstärke ${power(p)}"><img src="${ICON.kampf}" alt="">${power(p)}</button>` +
    `<button type="button" class="mstat" data-go="equip" aria-label="Weglaufen ${sign(runBonus(p))}"><img src="${ICON.run}" alt="">${sign(runBonus(p))}</button>` +
    `<button type="button" class="mstat${over ? ' warn' : ''}" data-go="equip" aria-label="Handkarten ${p.hand.length} von ${handLimit(p)}"><img src="${ICON.hand}" alt="">${p.hand.length}/${handLimit(p)}</button>` +
    `<button type="button" class="mstat" data-go="equip" aria-label="Ausrüstung"><img src="${ICON.slot.pack}" alt=""></button></span>`);
}
function renderHand() {
  const el = $('#hand'), p = me();
  const cards = p.hand.slice().sort((a, b) => TYPE_ORDER.indexOf(a.k) - TYPE_ORDER.indexOf(b.k));
  if (!cards.length) { patch(el, '<p class="empty">Keine Handkarten.</p>'); return; }
  if (el.__h) { el.innerHTML = ''; el.__h = null; }
  const existing = new Map([...el.children].map(n => [n.dataset.uid, n]));
  const nodes = cards.map(c => {
    const cls = [];
    if (UI.adv && (UI.adv.uid === c.uid || (UI.adv.picks && UI.adv.picks.includes(c.uid)))) cls.push('rec');
    if (W.fresh.has(c.uid)) cls.push('new');
    if (dragIntents(c).some(it => !it.dis)) cls.push('can');
    const html = cardMini(c, {where: 'hand', extra: cls.join(' ')});
    let node = existing.get(String(c.uid));
    if (!node || node.__h !== html) { const tmp = document.createElement('div'); tmp.innerHTML = html; const n = tmp.firstElementChild; n.__h = html; if (node) node.replaceWith(n); node = n; }
    existing.delete(String(c.uid));
    return node;
  });
  existing.forEach(n => n.remove());
  nodes.forEach((n, i) => { if (el.children[i] !== n) el.insertBefore(n, el.children[i] || null); });
}
function renderDice() {
  const ov = $('#diceov'), r = UI.roll;
  if (!r || (W.diceHideAt && performance.now() > W.diceHideAt)) { ov.hidden = true; return; }
  ov.hidden = false;
  const img = $('#dice-img'), src = DICE[r.face - 1];
  if (img.getAttribute('src') !== src) img.setAttribute('src', src);
  const cls = r.rolling ? 'roll' : 'land'; if (img.className !== cls) img.className = cls;
  $('#dice-cap').textContent = r.rolling ? (r.who === 'Du' ? 'Du würfelst …' : `${r.who} würfelt …`) : `${r.who === 'Du' ? 'Dein Wurf' : r.who}: ${r.face}`;
}

/* ================= Blätter ================= */
const SHEETS = [];
const topSheet = () => SHEETS[SHEETS.length - 1];
function updatePaused() { UI.paused = CUR !== 'game' || document.hidden || SHEETS.some(s => s.id !== 'sel' && s.id !== 'log'); }
function openSheet(s) { SHEETS.push(s); renderSheet(true); Snd.sfx('page'); }
function popSheet() { SHEETS.pop(); renderSheet(true); }
function closeAllSheets() { while (SHEETS.length && topSheet().id !== 'sel') SHEETS.pop(); if (SHEETS.length && topSheet().id === 'sel') { renderSheet(false); return; } renderSheet(true); }
function renderSheet(fresh) {
  const wrap = $('#sheetwrap'), el = $('#sheet');
  updatePaused();
  if (!SHEETS.length) { wrap.classList.remove('open'); wrap.setAttribute('aria-hidden', 'true'); el.innerHTML = ''; el.__h = ''; return; }
  const s = topSheet(), view = SHEET_VIEWS[s.id](s);
  if (!view) { SHEETS.pop(); renderSheet(true); return; }
  wrap.classList.add('open'); wrap.setAttribute('aria-hidden', 'false');
  const canClose = s.id !== 'sel';
  const html = `<div class="grab"><i></i></div><div class="sh-head">${SHEETS.length > 1 && canClose ? '<button type="button" class="iconbtn" data-sheetback aria-label="Zurück"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg></button>' : ''}${view.head || ''}${canClose ? '<button type="button" class="iconbtn" data-sheetclose aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg></button>' : ''}</div><div class="sh-body">${view.body}</div>`;
  const body = el.querySelector('.sh-body'), st = body && !fresh ? body.scrollTop : 0;
  if (fresh) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }
  if (patch(el, html)) { const nb = el.querySelector('.sh-body'); if (nb) nb.scrollTop = s.id === 'log' && (fresh || s.stick) ? nb.scrollHeight : st; }
  if (s.id === 'log') W.logSeen = S ? S.log.length : 0;
}
const h3 = t => `<h3>${t}</h3>`;
const SHEET_VIEWS = {
  info() {
    if (!UI.prompt) return null;
    const q = UI.prompt.get();
    const hints = UI.coach && q.hint && q.hint.length ? `<ul class="hints">${q.hint.map(x => `<li>${linkify(x)}</li>`).join('')}</ul>` : '';
    return {head: h3(esc(q.title)), body: `${q.text ? `<p class="atxt">${linkify(q.text)}</p>` : ''}${adviceBox()}${hints}<div class="acts">${q.opts.map((o, i) => `<button type="button" class="btn ${o.kind === 'primary' ? 'primary' : o.kind === 'danger' ? 'danger' : ''}${UI.adv && UI.adv.opt !== undefined && UI.adv.opt === o.v ? ' rec' : ''}" data-opt="${i}" ${o.dis ? 'disabled' : ''}>${esc(o.l)}</button>`).join('')}</div>`};
  },
  pick() {
    if (!UI.prompt || UI.prompt.ctx !== 'trouble') return null;
    const q = UI.prompt.get(), p = me();
    const items = q.opts.map((o, i) => [o, i]).filter(([o]) => /^m\d+$/.test(String(o.v))).map(([o, i]) => {
      const c = findCard(+String(o.v).slice(1)); if (!c) return '';
      const ok = power(p) > c.lvl;
      return `<button type="button" class="pickbtn${UI.adv && UI.adv.opt === o.v ? ' rec' : ''}" data-opt="${i}">${cardMini(c, {inert: true, size: 'grid'})}<span class="pk ${ok ? 'good' : 'bad'}">Du ${power(p)} : ${c.lvl}</span></button>`;
    }).join('');
    return {head: h3('Welches Monster forderst du heraus?'), body: `<div class="sel-grid">${items}</div><p class="hint">Tipp: Du kannst ein Monster auch direkt aufs Spielfeld ziehen.</p>`};
  },
  more() {
    if (!UI.prompt) return null;
    const q = UI.prompt.get();
    return {head: h3(esc(q.title)), body: `<div class="acts">${q.opts.map((o, i) => `<button type="button" class="btn ${o.kind === 'primary' ? 'primary' : o.kind === 'danger' ? 'danger' : ''}" data-opt="${i}" ${o.dis ? 'disabled' : ''}>${esc(o.l)}</button>`).join('')}</div>`};
  },
  card(s) {
    let c = null;
    if (s.human) c = HUMAN; else if (s.cname) c = CATALOG[s.cname]; else c = findCard(s.uid);
    if (!c) return null;
    const live = !s.cname && !s.human && s.where && ['hand', 'eq', 'pack', 'race', 'cls'].includes(s.where);
    const acts = live ? cardActions(c, s.where) : [];
    UI.cardActs = acts;
    const meaning = cardMeaning(c), wh = S && !s.human ? whereNow(c) : [];
    const actHTML = acts.map((a, i) => a.info ? `<p>${a.info}</p>` : `<button type="button" class="btn ${a.kind === 'primary' ? 'primary' : ''}${UI.adv && UI.adv.uid === c.uid && UI.adv.act && a.l.startsWith(UI.adv.act) ? ' rec' : ''}" data-cact="${i}" ${a.dis ? 'disabled' : ''}>${esc(a.l)}</button>${a.dis ? `<p class="err">${a.dis}</p>` : ''}`).join('');
    return {head: h3(''), body: cardBig(c) + (meaning ? `<p class="meaning">${meaning}</p>` : '') + (wh.length ? `<ul class="wherenow">${wh.map(x => `<li>${x}</li>`).join('')}</ul>` : '') + (actHTML ? `<div class="acts">${actHTML}</div>` : '')};
  },
  opp(s) {
    const p = S && S.players[s.pid]; if (!p) return null;
    const rc = `<div class="rcrow">${p.race ? `<button type="button" class="rcchip" data-uid="${p.race.uid}" data-where="opp"><small>Rasse</small>${esc(p.race.n)}</button>` : '<button type="button" class="rcchip" data-human="1"><small>Rasse</small>Mensch</button>'}${p.cls ? `<button type="button" class="rcchip cls" data-uid="${p.cls.uid}" data-where="opp"><small>Klasse</small>${esc(p.cls.n)}</button>` : '<span class="rcchip cls"><small>Klasse</small>keine</span>'}</div>`;
    const ab = abilList(p);
    const rows = slotRows(p, false);
    const hand = UI.open && p.hand.length ? `<div class="tipbox"><span class="tip-h">Handkarten (sichtbar, weil eingeschaltet)</span>${p.hand.map(c => linkify(esc(cardLabel(c)))).join(', ')}</div>` : '';
    return {head: `<img class="pt" src="${portrait(p)}" alt=""><h3>${esc(p.name)}<br><span style="font:700 15px var(--body);color:var(--muted)">Stufe ${p.lvl}${p.dead ? ' · tot' : ''}</span></h3>`,
      body: `<div class="coins" style="margin:0 0 10px">${coinsHTML(p.lvl)}</div>${rc}${ab}${stats3(p)}<div class="tipbox">${powerTip(p)}</div><div class="tipbox">${runTip(p)}</div><div class="slots">${rows}</div>${hand}`};
  },
  equip() {
    if (!S) return null;
    const p = me(), free = isFree();
    return {head: `<img class="pt" src="${ICON.portrait.Du}" alt=""><h3>Du<br><span style="font:700 15px var(--body);color:var(--muted)">Stufe ${p.lvl}${p.dead ? ' · tot' : ''}</span></h3>`, body: `<div class="coins" style="margin:0 0 10px">${coinsHTML(p.lvl)}</div>${stats3(p)}${abilList(p)}<div class="slots">${slotRows(p, true)}</div>` +
      `<p class="hint">Im Kampf zählen nur Rasse, Klasse und ausgerüstete Gegenstände. Der Rucksack bringt keinen Bonus. Karte antippen für Aktionen.</p>` +
      (free ? `<div class="acts"><button type="button" class="btn${UI.adv && UI.adv.sell ? ' rec' : ''}" data-go="sell">Gegenstände verkaufen</button></div>` : '') +
      `<div class="tipbox" style="margin-top:12px">${powerTip(p)}</div><div class="tipbox">${runTip(p)}</div><div class="tipbox">${handTip(p)}</div>`};
  },
  log(s) {
    if (!S) return null;
    s.stick = true;
    const items = S.log.filter(e => UI.coach || e.kind !== 'rule');
    return {head: h3('Spielleiter-Notizen'), body: `<ul class="loglist">${items.map(e => `<li class="l-${e.kind}">${e.kind === 'rule' ? '<b>Regel:</b> ' : ''}${linkify(e.t)}</li>`).join('')}</ul>`};
  },
  parts() {
    const C = S && S.combat; if (!C) return null;
    const sF = sideStrength(C), sM = monStrength(C), r = evalCombat(C);
    const li = x => `<li><span>${esc(x.l)}</span><b>${x.keep ? x.v : sign(x.v)}</b></li>`;
    return {head: h3('Wie sich der Kampf zusammensetzt'), body: `<h4 class="lbl">Kämpfende Seite</h4><ul class="parts">${sF.parts.filter(x => x.v !== 0 || x.keep).map(li).join('')}<li class="sum"><span>Summe</span><b>${sF.s}</b></li></ul>` +
      `<h4 class="lbl">Monster</h4><ul class="parts">${sM.parts.filter(x => x.v !== 0 || x.keep).map(li).join('')}<li class="sum"><span>Summe</span><b>${sM.s}</b></li></ul>` +
      `<p class="hint">${r.win ? 'Die kämpfende Seite ist stärker und gewinnt.' : r.a === r.b ? 'Gleichstand reicht nicht, außer für Krieger.' : 'Das Monster ist stärker. Ohne weitere Hilfe heißt es weglaufen.'}</p>`};
  },
  pause() {
    return {head: h3('Pause'), body: `<div class="acts"><button type="button" class="btn primary" data-go="resume">Weiterspielen</button><button type="button" class="btn" data-go="settings">Optionen</button><button type="button" class="btn" data-go="rules">Spielregeln</button><button type="button" class="btn" data-go="cards">Alle Karten</button><button type="button" class="btn" data-go="menu">Hauptmenü</button></div><p class="hint">Dein Spiel wird zu Beginn jedes deiner Züge gespeichert.</p>`};
  },
  sel() {
    const s = UI.sel; if (!s) return null;
    const p = me(), cands = [];
    [['hand', p.hand], ['eq', p.eq], ['pack', p.pack]].forEach(([w, arr]) => arr.forEach(c => { if (s.filter(c, w)) cands.push([c, w]); }));
    const picked = [...s.picked].map(findCard).filter(Boolean), err = s.validate ? s.validate(picked) : null;
    const ok = picked.length >= s.min && picked.length <= s.max && !err;
    const grid = cands.map(([c, w]) => cardMini(c, {where: w, extra: (s.picked.has(c.uid) ? 'picked' : '') + (UI.adv && UI.adv.picks && UI.adv.picks.includes(c.uid) ? ' rec' : '')})).join('');
    return {head: h3(esc(s.title || 'Karten wählen')), body: `<p class="atxt" style="margin:0">${s.text} <span class="hint">(${picked.length} gewählt)</span></p>${adviceBox()}${s.extra ? `<p class="sel-extra">${s.extra(picked)}</p>` : ''}${err ? `<p class="sel-err">${err}</p>` : ''}<div class="sel-grid">${grid}</div>` +
      `<div class="acts"><button type="button" class="btn primary" data-sel="ok" ${ok ? '' : 'disabled'}>${s.confirm ? s.confirm(picked) : 'Bestätigen'}</button>${s.optional ? '<button type="button" class="btn" data-sel="skip">Überspringen</button>' : ''}${s.cancel ? '<button type="button" class="btn ghost" style="color:var(--ink);border-color:var(--edge)" data-sel="cancel">Abbrechen</button>' : ''}</div>`};
  }
};
function syncSel() {
  const has = SHEETS.some(s => s.id === 'sel');
  if (UI.sel && !has) openSheet({id: 'sel'});
  if (!UI.sel && has) { for (let i = SHEETS.length - 1; i >= 0; i--) if (SHEETS[i].id === 'sel') SHEETS.splice(i, 1); renderSheet(true); }
}
function stats3(p) {
  return `<div class="stats3"><div class="stat3"><img src="${ICON.kampf}" alt=""><b>${power(p)}</b><span>Kampfstärke</span></div><div class="stat3"><img src="${ICON.run}" alt=""><b>${sign(runBonus(p))}</b><span>Weglaufen</span></div><div class="stat3"><img src="${ICON.hand}" alt=""><b>${p.hand.length}/${handLimit(p)}</b><span>Handkarten</span></div></div>`;
}
function abilList(p) {
  const a = [...(p.race ? ABIL[p.race.r].map(x => `<span class="ab race">${x}</span>`) : []), ...(p.cls ? ABIL[p.cls.c].map(x => `<span class="ab">${x}</span>`) : [])];
  return `<div class="abil">${a.length ? a.join('') : '<span class="ab none">keine Fähigkeiten</span>'}</div>`;
}
function slotRows(p, mine) {
  const item = (c, w) => mine ? cardMini(c, {where: w, size: 'tiny', extra: (w === 'eq' && !usable(p, c) ? 'inactive' : '') + (UI.adv && UI.adv.uid === c.uid ? ' rec' : '')})
    : `<button type="button" class="oitem${w === 'pack' ? ' pack' : ''}${w === 'eq' && !usable(p, c) ? ' off' : ''}" data-uid="${c.uid}" data-where="opp">${esc(c.n)}${w === 'eq' && c.b ? ` <b>+${c.b}</b>` : ''}${w === 'eq' && c.run ? ` <b>Flucht +${c.run}</b>` : ''}</button>`;
  const rows = [];
  if (mine) {
    rows.push(['race', 'Rasse', p.race ? cardMini(p.race, {where: 'race', size: 'tiny'}) : `<button type="button" class="mc tiny k-race" data-human="1"><span class="mc-head"><span class="mc-type">Rasse</span></span><img class="mc-art" src="${ICON.slot.race}" alt="" style="object-fit:contain;padding:6px"><span class="mc-name">Mensch</span></button>`]);
    rows.push(['cls', 'Klasse', p.cls ? cardMini(p.cls, {where: 'cls', size: 'tiny'}) : '<span class="none">keine Klasse</span>']);
  }
  const by = s => p.eq.filter(i => i.slot === s);
  [['kopf', 'Kopf'], ['ruestung', 'Rüstung'], ['schuhe', 'Schuhe'], ['hand', `Hände ${handsUsed(p)}/2`], ['none', 'Sonstiges']].forEach(([s, l]) => rows.push([s, l, by(s).map(c => item(c, 'eq')).join('') || '<span class="none">leer</span>']));
  rows.push(['pack', 'Rucksack', p.pack.map(c => item(c, 'pack')).join('') || '<span class="none">leer</span>']);
  return rows.map(([k, l, v]) => `<div class="slotrow"><span class="sl"><img src="${ICON.slot[k]}" alt="">${l}</span><span class="sv">${v}</span></div>`).join('');
}

/* Ziehen zum Schließen */
(() => {
  let y0 = null, dy = 0;
  const sheet = $('#sheet');
  sheet.addEventListener('touchstart', e => { if (!e.target.closest('.grab,.sh-head')) return; y0 = e.touches[0].clientY; dy = 0; sheet.style.transition = 'none'; }, {passive: true});
  sheet.addEventListener('touchmove', e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sheet.style.transform = `translateY(${dy}px)`; }, {passive: true});
  sheet.addEventListener('touchend', () => { if (y0 == null) return; sheet.style.transition = ''; sheet.style.transform = ''; if (dy > 90 && topSheet() && topSheet().id !== 'sel') closeAllSheets(); y0 = null; });
})();

/* ================= Effekte ================= */
function quietSheet() { return SHEETS.some(s => s.id !== 'sel'); }
function banner(text, kind) {
  if (quietSheet()) return;
  $$('.banner').forEach(b => b.remove());
  const b = document.createElement('div'); b.className = 'banner ' + (kind || ''); b.textContent = text;
  document.body.appendChild(b); setTimeout(() => b.remove(), 1500);
}
function flash(kind) { if (UI.reduce) return; const f = document.createElement('div'); f.className = 'flash ' + kind; document.body.appendChild(f); setTimeout(() => f.remove(), 700); }
function shake() { if (UI.reduce) return; const g = $('#scr-game'); g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake'); }
function toast(text) { if (SHEETS.length) return; $$('.toast').forEach(t => t.remove()); const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = text; document.body.appendChild(t); setTimeout(() => t.remove(), 2500); }
const Particles = (() => {
  const cv = $('#fxcanvas'), cx = cv.getContext('2d'), coin = new Image(); coin.src = 'icons/muenze-voll.png';
  let parts = [], running = false;
  function step() {
    const dpr = devicePixelRatio || 1;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach(p => { p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.011;
      cx.save(); cx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5)); cx.translate(p.x, p.y); cx.rotate(p.r); cx.drawImage(coin, -p.s / 2, -p.s / 2, p.s, p.s); cx.restore(); });
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 50);
    if (parts.length) requestAnimationFrame(step); else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  return { burst(x, y, n = 22, spread = 1) {
    if (UI.reduce) return;
    const dpr = devicePixelRatio || 1; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    for (let i = 0; i < n; i++) parts.push({x, y, vx: (Math.random() - 0.5) * 9 * spread, vy: -Math.random() * 9 - 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, s: 14 + Math.random() * 12, life: 1});
    if (!running) { running = true; requestAnimationFrame(step); }
  } };
})();
function burstAt(sel, n) { const el = $(sel); if (!el) return; const r = el.getBoundingClientRect(); Particles.burst(r.left + r.width / 2, r.top + r.height / 2, n); }

FX_HANDLER = (t, d) => {
  switch (t) {
    case 'newgame': W.reset(); break;
    case 'turn': if (d.p.human) { Snd.sfx('page'); buzz(15); if (W.renderedOnce) toast('Du bist am Zug'); } break;
    case 'interfere': Snd.sfx('evil'); buzz(40); toast(`${esc(d.by.name)} greift ein!`); break;
    case 'play': Snd.sfx('play'); buzz(12); break;
    case 'win': Snd.sfx('win'); banner(d.p.human ? 'Sieg!' : `${d.p.name} siegt`, d.mine ? 'good' : ''); if (d.mine) { burstAt('#table', 26); flash('gold'); } break;
    case 'lose': Snd.sfx('lose'); banner(d.p.human ? 'Niederlage' : `${d.p.name} verliert`, d.mine ? 'bad' : ''); break;
    case 'escape': Snd.sfx('escape'); if (d.p.human) banner('Entkommen!', 'good'); break;
    case 'hurt': Snd.sfx('hurt'); if (d.p.human) { shake(); flash('red'); buzz([60, 40, 60]); } break;
    case 'curse': Snd.sfx('curse'); if (d.p.human) { flash('purple'); buzz(80); banner('Verflucht!', 'bad'); } break;
    case 'death': Snd.sfx('death'); if (d.p.human) { flash('dark'); banner('Tot!', 'bad'); buzz([100, 50, 100]); } break;
    case 'dice': Snd.sfx('dice'); W.diceHideAt = 0; break;
    case 'diceland': Snd.sfx('diceland'); buzz(20); W.diceHideAt = performance.now() + 1500; setTimeout(render, 1550); break;
    case 'gameover': setTimeout(() => showEnd(d.winner), 1000); clearSave(); break;
  }
};
function showEnd(wid) {
  if (!S) return;
  const w = P(wid), mine = w.human;
  Snd.sfx(mine ? 'victory' : 'defeat'); buzz(mine ? [40, 60, 40, 60, 120] : 200);
  const el = document.createElement('div'); el.className = 'endov';
  el.innerHTML = `<div class="panel"><img src="${portrait(w)}" alt=""><h2>${mine ? 'Gewonnen!' : esc(w.name) + ' gewinnt'}</h2><p>${mine ? 'Stufe 10 durch einen Monstersieg. Die ganze Beute gehört dir!' : 'Kein Drama, die nächste Runde wartet schon. In den Notizen siehst du, wie es dazu kam.'}</p><button type="button" class="btn primary" data-go="again">Nochmal spielen</button><button type="button" class="btn" data-go="log">Notizen ansehen</button><button type="button" class="btn" data-go="menu">Hauptmenü</button></div>`;
  document.body.appendChild(el);
  if (mine) { let k = 0; const iv = setInterval(() => { Particles.burst(Math.random() * innerWidth, innerHeight * 0.25, 18, 1.4); if (++k > 5) clearInterval(iv); }, 280); }
}
function confirmDialog(title, text, yes, no) {
  return new Promise(res => {
    const d = document.createElement('div'); d.className = 'dialog';
    d.innerHTML = `<div class="panel"><h3>${title}</h3><p>${text}</p><div class="btnrow"><button type="button" class="btn" data-dlg="0">${no}</button><button type="button" class="btn primary" data-dlg="1">${yes}</button></div></div>`;
    d.addEventListener('click', e => { const b = e.target.closest('[data-dlg]'); if (!b) return; d.remove(); res(b.dataset.dlg === '1'); });
    document.body.appendChild(d);
  });
}

/* ================= Karten-Übersicht und Quiz ================= */
const KGROUPS = [['monster', 'Monster'], ['curse', 'Flüche'], ['race', 'Rassen'], ['class', 'Klassen'], ['enh', 'Monsterverstärker'], ['wander', 'Sonderkarten (Tür)'], ['item', 'Gegenstände'], ['oneshot', 'Einmal einsetzbar'], ['levelup', 'Stufenkarten'], ['amulet', 'Sonderkarten (Schatz)']];
const KFILTERS = [['alle', 'Alle'], ['monster', 'Monster'], ['curse', 'Flüche'], ['rc', 'Rassen & Klassen'], ['item', 'Gegenstände'], ['misc', 'Sonstige']];
const SLOT_ORDER = ['kopf', 'ruestung', 'schuhe', 'hand', 'none'];
function renderCards() {
  const f = UI.kfilter || 'alle';
  patch($('#card-filter'), KFILTERS.map(([k, l]) => `<button type="button" class="chip" data-kf="${k}" aria-pressed="${f === k}">${l}</button>`).join(''));
  const show = k => f === 'alle' || f === k || (f === 'rc' && (k === 'race' || k === 'class')) || (f === 'misc' && ['enh', 'wander', 'oneshot', 'levelup', 'amulet'].includes(k));
  const all = Object.values(CATALOG);
  const sorter = {monster: (a, b) => a.lvl - b.lvl, item: (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot) || (a.hands || 0) - (b.hands || 0) || a.b - b.b, oneshot: (a, b) => (a.b || 0) - (b.b || 0), enh: (a, b) => a.v - b.v};
  let html = '';
  KGROUPS.forEach(([k, label]) => {
    if (!show(k)) return;
    const cs = all.filter(c => c.k === k).sort(sorter[k] || ((a, b) => a.n.localeCompare(b.n, 'de')));
    if (!cs.length) return;
    html += `<h3 class="cgroup">${label}<span>${cs.length}</span></h3>` + cs.map(c => cardMini(c, {cname: true, size: 'grid'})).join('');
  });
  patch($('#card-grid'), html);
}
function renderQuiz() {
  const Q = UI.q || (UI.q = {i: 0, ans: []});
  const el = $('#quiz');
  if (Q.i >= QUIZ.length) {
    const right = Q.ans.filter((a, i) => a === QUIZ[i].a).length;
    const verdict = right >= 10 ? 'Regelfest! Die Bots können sich warm anziehen.' : right >= 7 ? 'Sehr ordentlich. Ein, zwei Regeln noch mal anschauen.' : 'Ein Blick in die Spielregeln lohnt sich noch.';
    patch(el, `<div class="panel qscore"><div class="big">${right} / ${QUIZ.length}</div><p>${verdict}</p><button type="button" class="btn primary" data-q="restart">Nochmal</button></div>`);
    return;
  }
  const q = QUIZ[Q.i], a = Q.ans[Q.i];
  patch(el, `<div class="qprog"><span>Frage ${Q.i + 1} / ${QUIZ.length}</span><span class="qbar"><i style="width:${(Q.i / QUIZ.length) * 100}%"></i></span></div>` +
    `<div class="panel qcard"><h3>${q.q}</h3><div class="qopts">${q.o.map((o, j) => `<button type="button" class="btn ${a != null ? (j === q.a ? 'right' : j === a ? 'wrong' : '') : ''}" data-q="${j}" ${a != null ? 'disabled' : ''}>${o}</button>`).join('')}</div>` +
    (a != null ? `<p class="qexpl">${a === q.a ? 'Richtig. ' : 'Nicht ganz. '}${q.e}</p><div class="acts"><button type="button" class="btn primary" data-q="next">${Q.i + 1 < QUIZ.length ? 'Nächste Frage' : 'Ergebnis'}</button></div>` : '') + '</div>');
}

/* ================= Eingaben ================= */
function go(a) {
  switch (a) {
    case 'continue': continueGame(); break;
    case 'setup': show('setup'); break;
    case 'start': startNewGame(); break;
    case 'rules': closeAllSheets(); show('rules'); break;
    case 'cards': closeAllSheets(); show('cards'); break;
    case 'quiz': UI.q = null; show('quiz'); break;
    case 'settings': closeAllSheets(); show('settings'); break;
    case 'pause': openSheet({id: 'pause'}); break;
    case 'resume': closeAllSheets(); break;
    case 'menu': $$('.endov').forEach(x => x.remove()); closeAllSheets(); STACK.length = 0; setScreen('title'); break;
    case 'again': $$('.endov').forEach(x => x.remove()); closeAllSheets(); GAME_ON = false; startNewGame(); break;
    case 'log': $$('.endov').forEach(x => x.remove()); openSheet({id: 'log'}); break;
    case 'equip': openSheet({id: 'equip'}); break;
    case 'parts': openSheet({id: 'parts'}); break;
    case 'sell': startSell(); render(); break;
    case 'sound': { const on = SET.music || SET.sfx; SET.music = !on; SET.sfx = !on; saveSettings(); if (SET.music) { Snd.unlock(); Snd.startMusic(); } toast(on ? 'Ton aus' : 'Ton an'); break; }
    case 'delsave': confirmDialog('Spielstand löschen?', 'Das gespeicherte Spiel ist danach weg.', 'Löschen', 'Behalten').then(ok => { if (ok) { clearSave(); if (GAME_ON) { GAME_ON = false; TOKEN++; } renderSaveInfo(); toast('Spielstand gelöscht'); } }); break;
  }
}
document.addEventListener('click', e => {
  const t = e.target;
  if (performance.now() < Drag.noClickUntil) { e.preventDefault(); e.stopPropagation(); return; }
  if (t.closest('.btn,.iconbtn,.chip,.seg button,.switch,.oc,.mstat,.rcchip,.oitem,.ptbtn,.side,.art')) { Snd.sfx('tap'); buzz(8); }
  let el;
  if ((el = t.closest('[data-cname]'))) { openSheet({id: 'card', cname: el.dataset.cname}); return; }
  if ((el = t.closest('[data-human]'))) { openSheet({id: 'card', human: true}); return; }
  if ((el = t.closest('[data-uid]'))) {
    const uid = +el.dataset.uid, where = el.dataset.where;
    if (UI.sel && topSheet() && topSheet().id === 'sel' && ['hand', 'eq', 'pack'].includes(where)) {
      const c = findCard(uid);
      if (c && UI.sel.filter(c, where)) { const s = UI.sel.picked; if (s.has(uid)) s.delete(uid); else { if (UI.sel.max === 1) s.clear(); if (s.size < UI.sel.max) s.add(uid); } Snd.sfx('deal'); render(); }
      return;
    }
    openSheet({id: 'card', uid, where}); return;
  }
  if ((el = t.closest('[data-opt]'))) { const o = UI.opts[+el.dataset.opt]; if (o && !o.dis && UI.resolve) { UI.advOpen = false; UI.hintsOpen = false; closeAllSheets(); UI.resolve(o.v); } return; }
  if ((el = t.closest('[data-dpick]'))) { openSheet({id: 'pick'}); return; }
  if ((el = t.closest('[data-dmore]'))) { openSheet({id: 'more'}); return; }
  if ((el = t.closest('[data-dinfo]'))) { openSheet({id: 'info'}); return; }
  if ((el = t.closest('[data-adv]'))) { closeAllSheets(); applyAdvice(); render(); return; }
  if ((el = t.closest('[data-advtoggle]'))) { UI.advOpen = !UI.advOpen; render(); return; }
  if ((el = t.closest('[data-hints]'))) { UI.hintsOpen = !UI.hintsOpen; render(); return; }
  if ((el = t.closest('[data-cact]'))) { const a = UI.cardActs[+el.dataset.cact]; if (a && a.fn && !a.dis) { popSheet(); try { a.fn(); } catch (err) { if (err !== STALE) console.error(err); } render(); } return; }
  if ((el = t.closest('[data-sel]'))) { if (UI.sel) { const v = el.dataset.sel; UI.sel.done(v === 'ok' ? [...UI.sel.picked] : null); } return; }
  if ((el = t.closest('[data-opp]'))) { openSheet({id: 'opp', pid: +el.dataset.opp}); return; }
  if ((el = t.closest('[data-sheetclose]'))) { if (!(topSheet() && topSheet().id === 'sel')) closeAllSheets(); return; }
  if ((el = t.closest('[data-sheetback]'))) { popSheet(); return; }
  if ((el = t.closest('[data-back]'))) { back(); return; }
  if ((el = t.closest('[data-go]'))) { go(el.dataset.go); return; }
  if ((el = t.closest('.seg[data-set] button'))) { const k = el.parentElement.dataset.set; SET[k] = isNaN(+el.dataset.v) ? el.dataset.v : +el.dataset.v; saveSettings(); renderControls(); return; }
  if ((el = t.closest('[data-toggle]'))) { const k = el.dataset.toggle; SET[k] = !SET[k]; saveSettings(); renderControls(); if (k === 'music' && SET.music) { Snd.unlock(); Snd.startMusic(); } if (CUR === 'game') render(); return; }
  if ((el = t.closest('[data-kf]'))) { UI.kfilter = el.dataset.kf; renderCards(); $('#scr-cards .content').scrollTop = 0; return; }
  if ((el = t.closest('[data-q]'))) {
    const Q = UI.q, v = el.dataset.q;
    if (v === 'next') { Q.i++; } else if (v === 'restart') { UI.q = {i: 0, ans: []}; } else { Q.ans[Q.i] = +v; Snd.sfx(+v === QUIZ[Q.i].a ? 'coin' : 'leveldown'); buzz(+v === QUIZ[Q.i].a ? 15 : 50); }
    renderQuiz(); return;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') back(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) Snd.suspend(); else Snd.resume();
  updatePaused();
});

/* ================= Werte erklärt ================= */
function tipRows(rows,total){
  return `<ul class="tip-l">${rows.map(r=>`<li class="${r.off?'off':''}"><span>${esc(r.l)}</span><b>${r.v}</b></li>`).join('')}${total!=null?`<li class="sum"><span>Summe</span><b>${total}</b></li>`:''}</ul>`;
}
function powerTip(p){
  const rows=[{l:'Stufe',v:p.lvl}];
  p.eq.forEach(i=>{ if(!i.b) return; rows.push(usable(p,i) ? {l:i.n,v:'+'+i.b} : {l:`${i.n} (nur für ${reqName(i)})`,v:'0',off:true}); });
  const n=[];
  if(hasCls(p,'krieger')) n.push('Gewinnt bei Gleichstand und darf im Kampf bis zu 3 Karten für je +1 abwerfen.');
  if(hasCls(p,'priester')) n.push('Gegen Untote je abgeworfener Karte +3 (höchstens 3 Karten).');
  n.push('Im Kampf kommen noch Einmal-Gegenstände, ein Helfer und Monsterboni dazu.');
  return `<b class="tip-h">Kampfstärke = Stufe + ausgerüstete Gegenstände</b>${tipRows(rows,power(p))}<span class="tip-n">${n.join(' ')}</span>`;
}
function runTip(p){
  const rows=[];
  if(hasRace(p,'elf')) rows.push({l:'Elf',v:'+1'});
  p.eq.forEach(i=>{ if(!i.run) return; rows.push(usable(p,i) ? {l:i.n,v:'+'+i.run} : {l:`${i.n} (inaktiv)`,v:'0',off:true}); });
  const b=runBonus(p), need=5-b, pc=Math.round(Math.max(0,Math.min(6,7-need))/6*100);
  const n=[];
  if(hasRace(p,'halbling')) n.push('Halbling: Misslingt der Wurf, darf er 1 Karte abwerfen und neu würfeln.');
  if(hasCls(p,'zauberer')) n.push('Zauberer: Nach einem misslungenen Wurf bis zu 3 Karten abwerfen, je +1.');
  n.push('Manche Monster ändern den Wurf noch, etwa das Vampir-Kaninchen (−1).');
  return `<b class="tip-h">Weglaufen: ohne Bonus ab einer 5</b>${rows.length?tipRows(rows,sign(b)):'<span class="tip-n">Keine Boni.</span>'}<b>${need<=1?'Entkommt immer.':`Entkommt ab einer ${need}: ${pc} %.`}</b><span class="tip-n">${n.join(' ')}</span>`;
}
function handTip(p){
  return `<b class="tip-h">Handkarten: höchstens ${handLimit(p)}${hasRace(p,'zwerg')?' (Zwerg: 6 statt 5)':''}</b><span class="tip-n">Gilt am Ende des eigenen Zugs. Den Überschuss bekommt bei der Milden Gabe, wer die niedrigste Stufe hat.${p.human?'':' Welche Karten das sind, ist geheim.'}</span>`;
}
const ABIL={
  elf:['steigt beim Helfen auf'], zwerg:['6 Handkarten','beliebig viele Große'], halbling:['1× pro Zug doppelt verkaufen','Fluchtwurf wiederholen'],
  krieger:['gewinnt bei Gleichstand','Karten abwerfen: +1'], zauberer:['Fluchtzauber: Karten abwerfen'], dieb:['in den Rücken fallen: −2'], priester:['gegen Untote: +3 je Karte']
};

/* ================= Ziehen und Ablegen: Karten aufs Spielfeld ================= */
function resolveOpt(v) { closeAllSheets(); UI.advOpen = false; if (UI.resolve) UI.resolve(v); }
function dragIntents(c) {
  const I = [];
  if (!S || S.winner != null || !UI.prompt || UI.sel || !c) return I;
  if (UI.prompt.ctx === 'trouble' && c.k === 'monster') {
    const o = UI.prompt.get().opts.find(o => o.v === 'm' + c.uid);
    if (o) I.push({zones: ['table'], label: `${c.n} herausfordern`, run: () => resolveOpt(o.v)});
  }
  if (!me().hand.includes(c)) return I;
  const acts = cardActions(c, 'hand').filter(a => a.l && a.fn && !/^Verkaufen/.test(a.l));
  const C = S.combat;
  switch (c.k) {
    case 'item': case 'race': case 'class': case 'levelup':
      acts.forEach(a => I.push({zones: ['table', 'me'], label: a.l.replace(/^Benutzen: /, ''), run: a.fn, dis: a.dis})); break;
    case 'oneshot':
      acts.forEach(a => { const mon = /Monster/.test(a.l), z = [mon ? 'monside' : 'fighter']; if (a.kind === 'primary') z.push('table'); I.push({zones: z, label: a.l, run: a.fn, dis: a.dis}); }); break;
    case 'enh':
      if (C) acts.forEach((a, i) => { const m = C.mons[i]; if (!m) return; const z = ['art:' + m.c.uid]; if (C.mons.length === 1) z.push('table', 'monside'); I.push({zones: z, label: a.l.replace(' spielen', ''), run: a.fn, dis: a.dis}); });
      break;
    case 'wander':
      if (acts.length === 1) I.push({zones: ['table'], label: acts[0].l, run: acts[0].fn});
      else if (acts.length > 1) I.push({zones: ['table'], label: 'Monster wählen …', run: () => openSheet({id: 'card', uid: c.uid, where: 'hand'})});
      break;
    case 'monster': {
      const w = me().hand.find(x => x.k === 'wander');
      if (w) { const wa = cardActions(w, 'hand').find(a => a.fn && a.l.startsWith(`Mit ${c.n} (`)); if (wa) I.push({zones: ['table'], label: 'Mit Ungebetenem Gast dazuschicken', run: wa.fn}); }
      break;
    }
    case 'curse':
      acts.forEach(a => { const t = S.players.find(x => !x.human && a.l === `Auf ${x.name} spielen`); if (t) I.push({zones: ['opp:' + t.id], label: `Fluch auf ${t.name}`, run: a.fn}); });
      break;
  }
  return I;
}
const Drag = (() => {
  let st = null;
  const TH = 10;
  function zoneAt(x, y) {
    const el = document.elementFromPoint(x, y); if (!el) return null;
    let z;
    if ((z = el.closest('.oc[data-opp]'))) return {key: 'opp:' + z.dataset.opp, el: z};
    if ((z = el.closest('#table .side.me'))) return {key: 'fighter', el: z};
    if ((z = el.closest('#table .side.mon'))) return {key: 'monside', el: z};
    if ((z = el.closest('#table .art[data-uid]'))) return {key: 'art:' + z.dataset.uid, el: z, art: true};
    if ((z = el.closest('#table'))) return {key: 'table', el: z};
    if ((z = el.closest('#mebar'))) return {key: 'me', el: z};
    return null;
  }
  function intentFor(zone) {
    if (!zone || !st) return null;
    let it = st.intents.find(i => i.zones.includes(zone.key));
    if (!it && (zone.art || zone.key === 'fighter' || zone.key === 'monside')) it = st.intents.find(i => i.zones.includes('table'));
    return it || null;
  }
  function zoneEls(key) {
    if (key === 'table') return [$('#table')];
    if (key === 'me') return [$('#mebar')];
    if (key === 'fighter') return [$('#table .side.me')];
    if (key === 'monside') return [$('#table .side.mon')];
    if (key.startsWith('opp:')) return [$(`.oc[data-opp="${key.slice(4)}"]`)];
    if (key.startsWith('art:')) return [$(`#table .art[data-uid="${key.slice(4)}"]`)];
    return [];
  }
  function down(e) {
    if (CUR !== 'game' || !S || (e.button != null && e.button > 0)) return;
    const el = e.target.closest('#hand .mc[data-uid]'); if (!el || SHEETS.length || UI.sel) return;
    st = {uid: +el.dataset.uid, el, x0: e.clientX, y0: e.clientY, id: e.pointerId, started: false};
  }
  function start(e) {
    const c = findCard(st.uid); if (!c) { st = null; return; }
    st.c = c; st.intents = dragIntents(c); st.started = true;
    const r = st.el.getBoundingClientRect();
    st.offX = st.x0 - r.left; st.offY = st.y0 - r.top;
    const g = st.el.cloneNode(true);
    g.classList.remove('new', 'can', 'rec'); g.classList.add('ghost'); g.removeAttribute('data-uid');
    g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
    const lab = document.createElement('span'); lab.className = 'dlabel'; g.appendChild(lab);
    document.body.appendChild(g); st.g = g; st.lab = lab; st.r = r;
    st.el.classList.add('lifted');
    try { st.el.setPointerCapture(e.pointerId); } catch (err) {}
    const keys = new Set(); st.intents.forEach(i => i.zones.forEach(z => keys.add(z)));
    st.marked = [];
    keys.forEach(k => zoneEls(k).forEach(z => { if (z) { z.classList.add('dz'); st.marked.push(z); } }));
    Snd.sfx('deal', 0.6); buzz(10);
  }
  function move(x, y) {
    const dx = x - st.x0;
    st.g.style.transform = `translate(${x - st.offX}px, ${y - st.offY}px) rotate(${Math.max(-8, Math.min(8, dx / 25))}deg) scale(1.08)`;
    const zone = zoneAt(x, y), it = intentFor(zone);
    if (st.hover !== (zone && zone.el)) { if (st.hover) st.hover.classList.remove('dzh'); st.hover = zone && it ? zone.el : null; if (st.hover) st.hover.classList.add('dzh'); }
    st.zone = zone; st.it = it;
    const txt = it ? it.label : '';
    if (st.lab.textContent !== txt) st.lab.textContent = txt;
    st.lab.classList.toggle('show', !!txt);
    st.lab.classList.toggle('no', !!(it && it.dis));
  }
  function cleanup() {
    if (!st) return;
    (st.marked || []).forEach(z => z.classList.remove('dz', 'dzh'));
    if (st.el) st.el.classList.remove('lifted');
  }
  function flyBack(g, r) {
    g.style.transition = 'transform .28s cubic-bezier(.3,.8,.3,1.1)';
    g.style.transform = `translate(${r.left}px, ${r.top}px) rotate(0) scale(1)`;
    setTimeout(() => g.remove(), 300);
  }
  function end(e) {
    if (!st || (e && e.pointerId !== st.id)) return;
    const s0 = st;
    if (!s0.started) { st = null; return; }
    Drag.noClickUntil = performance.now() + 400;
    cleanup();
    const it = s0.it, g = s0.g;
    st = null;
    if (e.type === 'pointercancel' || !it || it.dis) {
      flyBack(g, s0.r);
      if (e.type !== 'pointercancel' && s0.zone) {
        if (it && it.dis) toast(esc(it.dis));
        else { const info = cardActions(s0.c, 'hand').find(a => a.info); toast(info ? info.info : 'Diese Karte kannst du gerade nicht ausspielen.'); }
        Snd.sfx('leveldown', 0.4); buzz(40);
      }
      return;
    }
    g.style.transition = 'transform .25s ease, opacity .25s ease';
    g.style.transform = g.style.transform.replace(/scale\([^)]*\)/, 'scale(.5)');
    g.style.opacity = '0';
    setTimeout(() => g.remove(), 270);
    Snd.sfx('play'); buzz(15);
    try { it.run(); } catch (err) { if (err !== STALE) console.error(err); }
    render();
  }
  document.addEventListener('pointerdown', down);
  document.addEventListener('pointermove', e => {
    if (!st || e.pointerId !== st.id) return;
    if (!st.started) {
      const dx = e.clientX - st.x0, dy = e.clientY - st.y0;
      if (Math.abs(dx) > TH && Math.abs(dx) > Math.abs(dy)) { st = null; return; }
      if (dy < -TH && Math.abs(dy) > Math.abs(dx) * 0.8) start(e); else return;
      if (!st) return;
    }
    e.preventDefault();
    move(e.clientX, e.clientY);
  }, {passive: false});
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
  return {noClickUntil: 0, active: () => !!(st && st.started)};
})();

/* ================= Start ================= */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; $('#btn-install').hidden = false; });
$('#btn-install').addEventListener('click', async () => { if (!deferredInstall) return; deferredInstall.prompt(); try { await deferredInstall.userChoice; } catch (e) {} deferredInstall = null; $('#btn-install').hidden = true; });
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
(() => { const d = buildDecks(); buildCatalog([...d.door, ...d.tr]); })();
applySettings();
setScreen('title');
const tap = $('#tapstart');
tap.hidden = false;
tap.addEventListener('click', () => { Snd.unlock(); Snd.startMusic(); tap.hidden = true; Snd.sfx('page'); });
document.addEventListener('pointerdown', () => Snd.unlock(), {once: true});

