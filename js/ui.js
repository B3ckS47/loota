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
  portrait: {Du: 'icons/portrait-du.png', Berta: 'icons/portrait-berta.png', Kalle: 'icons/portrait-kalle.png', Uschi: 'icons/portrait-uschi.png',
    Rosi: 'icons/portrait-rosi.png', Fridolin: 'icons/portrait-fridolin.png', Gustav: 'icons/portrait-gustav.png', Hilde: 'icons/portrait-hilde.png'}
};
const DICE = [1, 2, 3, 4, 5, 6].map(n => `icons/wuerfel-${n}.png`);
const PHASES = ['Tür aufstoßen', 'Monster herausfordern', 'Raum durchsuchen', 'Almosen'];
const portrait = p => p.human ? myPortrait() : (ICON.portrait[p.name] || ICON.portrait.Du);

/* ================= Profil: Name, Porträt, Rahmen ================= */
const K_PROFILE = 'loota.profile';
const PORTRAITS = [
  ['du', 'Abenteurer', 'icons/portrait-du.png'], ['elf', 'Elfe', 'art/rasse-elf.webp'], ['zwerg', 'Zwerg', 'art/rasse-zwerg.webp'],
  ['halbling', 'Halbling', 'art/rasse-halbling.webp'], ['krieger', 'Krieger', 'art/klasse-krieger.webp'], ['zauberer', 'Zauberer', 'art/klasse-zauberer.webp'],
  ['dieb', 'Dieb', 'art/klasse-dieb.webp'], ['priester', 'Priester', 'art/klasse-priester.webp']
];
const FRAMES = [['gold', 'Gold', '#e9cf9a'], ['silber', 'Silber', '#dfe5ea'], ['bronze', 'Bronze', '#c8875a'], ['rubin', 'Rubin', '#c0392b'], ['smaragd', 'Smaragd', '#3f9a5c'], ['saphir', 'Saphir', '#3d6fb5']];
const PROFILE = Object.assign({id: null, name: '', portrait: 'du', frame: 'gold'}, (() => { try { return JSON.parse(localStorage.getItem(K_PROFILE)); } catch (e) { return null; } })() || {});
if (!PROFILE.id) { PROFILE.id = (crypto.randomUUID ? crypto.randomUUID() : 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2)); try { localStorage.setItem(K_PROFILE, JSON.stringify(PROFILE)); } catch (e) {} }
function saveProfile() { try { localStorage.setItem(K_PROFILE, JSON.stringify(PROFILE)); } catch (e) {} applyProfile(); }
// Aus dem Storymodus freischaltbar: [Schlüssel, Name, Bild/Farbe, Freischalt-ID]
const ALL_PORTRAITS = [...PORTRAITS, ...Object.entries(COSMETICS.portrait).map(([k, v]) => [k, v.n, v.src, 'portrait:' + k])];
const ALL_FRAMES = [...FRAMES, ...Object.entries(COSMETICS.frame).map(([k, v]) => [k, v.n, v.c, 'frame:' + k])];
const cosOpen = x => !x[3] || owns(x[3]);
// Hinweis, wo man eine gesperrte Optik bekommt
function cosmeticSource(id) {
  for (const w of WORLDS) for (const st of w.stations) {
    if (st.reward === id) return `${cosmeticName(id)}: Belohnung in Welt ${w.n}, Station ${st.no} „${st.name}“.`;
    const it = (st.shop || []).find(x => x.id === id);
    if (it) return `${cosmeticName(id)}: in Welt ${w.n} bei „${st.name}“ für ${it.price} Münzen.`;
  }
  for (const w of WORLDS) if (w.starReward && w.starReward.id === id) return `${cosmeticName(id)}: für ${w.starReward.n} Sterne in Welt ${w.n}.`;
  return 'Schaltest du im Storymodus frei.';
}
function myPortrait() { const x = ALL_PORTRAITS.find(q => q[0] === PROFILE.portrait && cosOpen(q)) || PORTRAITS[0]; return x[2]; }
function myFrame() { const f = ALL_FRAMES.find(q => q[0] === PROFILE.frame && cosOpen(q)) || FRAMES[0]; return f[2]; }
function myTitle() { return PROFILE.title && owns('title:' + PROFILE.title) ? COSMETICS.title[PROFILE.title] : ''; }
function myName() { return PROFILE.name || 'Du'; }
function applyProfile() { document.documentElement.style.setProperty('--pf', myFrame()); if (S && CUR === 'game') { W.renderedOnce = true; render(); } }
const PROFILE_NAME_RE = /^[\p{L}\p{N}][\p{L}\p{N} ._-]{1,15}$/u;
function renderProfile() {
  patch($('#pf-hero'), `<img class="pf-big" src="${myPortrait()}" alt=""><div class="pf-who"><b>${esc(PROFILE.name || 'Namenlos')}</b>${myTitle() ? `<em class="pf-title">${esc(myTitle())}</em>` : ''}<span>${esc((ALL_PORTRAITS.find(q => q[2] === myPortrait()) || PORTRAITS[0])[1])} · Rahmen ${esc((ALL_FRAMES.find(q => q[2] === myFrame()) || FRAMES[0])[1])}</span></div>`);
  const inp = $('#pf-name'); if (document.activeElement !== inp) inp.value = PROFILE.name;
  const lockI = '<b class="pf-lock" aria-hidden="true"><svg viewBox="0 0 24 24">' + LOCK_PATH + '</svg></b>';
  patch($('#pf-portraits'), ALL_PORTRAITS.map(x => { const [k, l, src] = x, on = cosOpen(x); return `<button type="button" class="pf-pt${on ? '' : ' locked'}" data-portrait="${k}" aria-pressed="${on && myPortrait() === src && PROFILE.portrait === k}"><img src="${src}" alt="" loading="lazy">${on ? '' : lockI}<span>${l}</span></button>`; }).join(''));
  patch($('#pf-frames'), ALL_FRAMES.map(x => { const [k, l, c] = x, on = cosOpen(x); return `<button type="button" class="pf-fr${on ? '' : ' locked'}" data-frame="${k}" aria-pressed="${on && PROFILE.frame === k}" style="--c:${c}"><i>${on ? '' : `<svg viewBox="0 0 24 24">${LOCK_PATH}</svg>`}</i><span>${l}</span></button>`; }).join(''));
  // Titel: nur die freigeschalteten zeigen, gesperrte wären bei vielen Welten nur Ballast
  const titles = Object.entries(COSMETICS.title).filter(([k]) => owns('title:' + k));
  patch($('#pf-titles'), `<button type="button" class="pf-ti" data-title="" aria-pressed="${!myTitle()}">Kein Titel</button>` + titles.map(([k, l]) => `<button type="button" class="pf-ti" data-title="${k}" aria-pressed="${PROFILE.title === k}">${esc(l)}</button>`).join('') +
    `<p class="hint">${titles.length ? 'Weitere Titel' : 'Titel'} verdienst du im Storymodus.</p>`);
}
document.addEventListener('input', e => {
  if (e.target.id !== 'pf-name') return;
  const v = e.target.value.trim(), hint = $('#pf-name-hint');
  if (!v) { PROFILE.name = ''; hint.classList.remove('err'); hint.textContent = '2 bis 16 Zeichen. Später kann das dein Name für Partien gegen andere sein.'; saveProfile(); renderProfile(); return; }
  if (!PROFILE_NAME_RE.test(v)) { hint.classList.add('err'); hint.textContent = 'Bitte 2 bis 16 Zeichen: Buchstaben, Ziffern, Leerzeichen, Punkt, Binde- oder Unterstrich.'; return; }
  hint.classList.remove('err'); hint.textContent = 'Gespeichert.';
  PROFILE.name = v; saveProfile(); renderProfile();
});

/* ================= Einstellungen und Speicher ================= */
const K_SET = 'loota.settings', K_SAVE = 'loota.save';
function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
function clearSave() { try { localStorage.removeItem(K_SAVE); } catch (e) {} }
const SET_V = 2;
const SAVED_SET = load(K_SET);
const SET = Object.assign({music: true, sfx: true, mvol: 0.5, svol: 0.8, vibrate: true, reduce: false, advice: false, coach: false, open: false, speed: 'normal', bots: 3, diff: 'normal', table: 'taverne', theme: 'taverne'}, SAVED_SET || {});
// Lernhilfen sind ab Einstellungs-Version 2 standardmäßig aus, auch für bereits gespeicherte Einstellungen
if ((SET.sv || 1) < SET_V) { SET.advice = false; SET.coach = false; SET.sv = SET_V; if (SAVED_SET) store(K_SET, SET); }
function saveSettings() { store(K_SET, SET); applySettings(); }
function applySettings() {
  UI.advice = SET.advice && !SCN; UI.coach = SET.coach && !SCN; UI.open = SET.open; UI.speed = SET.speed;
  if (!SCN) { UI.bots = SET.bots; UI.diff = SET.diff; }
  UI.reduce = SET.reduce || matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.toggle('reduce', !!SET.reduce);
  Snd.set({music: SET.music, sfx: SET.sfx, mvol: SET.mvol, svol: SET.svol});
  if (!SET.music) Snd.stopMusic();
  renderSoundBtn();
}
function buzz(p) { if (SET.vibrate && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} } }

let GAME_ON = false;
// Tischfläche und Musik der laufenden Partie: im Storymodus von der Welt, im freien Spiel aus den Optionen
let GAME_TABLE = 'taverne', GAME_THEME = 'taverne';
const moodOpen = () => !!STORY.worlds.w2;
function freeMood() { GAME_TABLE = moodOpen() && SET.table === 'keller' ? 'keller' : 'taverne'; GAME_THEME = moodOpen() && SET.theme === 'keller' ? 'keller' : 'taverne'; }
CHECKPOINT_HANDLER = () => { if (SCN) return; store(K_SAVE, {S, seen: UI.seen, ts: Date.now(), bots: UI.bots, diff: UI.diff, v: APP_VERSION}); };

/* ================= Bildschirme ================= */
/* ================= Deck-Baukasten ================= */
const K_DECK = 'loota.deck';
const POOL = cardPool();
const POOLCAT = Object.fromEntries(POOL.map(p => [p.tpl.n, p.tpl]));
const DEF_COUNTS = Object.fromEntries(POOL.map(p => [p.tpl.n, p.def]));
const DECK_MAX = 4;
/* Decks und Varianten. Weitere Decks (z. B. je Welt aus dem Storymodus) bekommen eigene
   Grund-Stückzahlen (base), ein ikonisches Bild (icon) und eine Freischaltung (unlocked). */
const DECKS = [
  {id: 'grund', name: 'Grunddeck', icon: 'Wütender Gartenzwerg', desc: 'Die Karten, mit denen alles begann.', base: p => p.def, unlocked: () => true},
  {id: 'keller', name: 'Keller-Deck', icon: 'Rattenkönig Rüdiger', desc: 'Staubmäuse, Spukgeister und der Rattenkönig: 18 Kellerkarten plus alles aus dem Grunddeck, was in einen Keller passt.',
    base: kellerCount, unlocked: () => !!STORY.worlds.w2, lockTxt: 'Das Keller-Deck schaltest du frei, wenn du im Storymodus Welt 2 abschließt.'}
];
// Karten einer Welt tauchen in der Kartenliste erst auf, wenn ihr Deck freigeschaltet ist
const cardOpen = c => !c.w || c.w !== 2 || DECKS[1].unlocked();
const VARIANTS = [
  ['standard', 'Standard', 'Die ausgewogene Mischung.', (p, b) => b],
  ['monsterjagd', 'Monsterjagd', 'Mehr Kämpfe, kaum Flüche.', (p, b) => !b ? 0 : p.tpl.k === 'monster' ? b + (p.tpl.lvl <= 12 ? 1 : 0) : p.tpl.k === 'curse' ? b - 1 : p.tpl.k === 'enh' ? b + 1 : b],
  ['fluchchaos', 'Fluch-Chaos', 'Doppelt so viele Flüche, dafür mehr Amulette.', (p, b) => !b ? 0 : p.tpl.k === 'curse' ? b * 2 : p.tpl.k === 'amulet' ? 3 : b],
  ['schnell', 'Schnelle Runde', 'Mehr Stufenkarten und Einmal-Gegenstände, keine Riesenmonster.', (p, b) => !b ? 0 : p.tpl.k === 'levelup' ? 2 : p.tpl.k === 'oneshot' ? b + 1 : p.tpl.k === 'monster' && p.tpl.lvl >= 14 ? 0 : b]
];
const clampCount = n => Math.max(0, Math.min(DECK_MAX, n));
const deckById = id => DECKS.find(d => d.id === id) || DECKS[0];
const variantName = k => k === 'eigenes' ? 'Eigenes' : (VARIANTS.find(v => v[0] === k) || VARIANTS[0])[1];
function variantCounts(deckId, key) {
  const d = deckById(deckId), v = VARIANTS.find(x => x[0] === key) || VARIANTS[0];
  return Object.fromEntries(POOL.map(p => { const b = clampCount(d.base(p)); return [p.tpl.n, clampCount(v[3](p, b))]; }));
}
function currentCounts(s) {
  if (s.variant !== 'eigenes') return variantCounts(s.deck, s.variant);
  const c = s.custom[s.deck] || {}, d = deckById(s.deck);
  return Object.fromEntries(POOL.map(p => [p.tpl.n, clampCount(c[p.tpl.n] != null ? c[p.tpl.n] : d.base(p))]));
}
const DECK = (() => {
  let d = null; try { d = JSON.parse(localStorage.getItem(K_DECK)); } catch (e) {}
  const s = {deck: 'grund', variant: 'standard', custom: {}};
  if (d && d.v === 2) Object.assign(s, {deck: d.deck || 'grund', variant: d.variant || 'standard', custom: d.custom || {}});
  else if (d && d.preset === 'eigenes' && d.counts) { s.variant = 'eigenes'; s.custom.grund = d.counts; }
  else if (d && d.preset) s.variant = d.preset === 'empfohlen' ? 'standard' : d.preset;
  if (!deckById(s.deck).unlocked()) s.deck = 'grund';
  if (s.variant !== 'eigenes' && !VARIANTS.some(v => v[0] === s.variant)) s.variant = 'standard';
  if (s.variant === 'eigenes' && !s.custom[s.deck]) s.variant = 'standard';
  s.counts = currentCounts(s);
  return s;
})();
function saveDeck() { try { localStorage.setItem(K_DECK, JSON.stringify({v: 2, deck: DECK.deck, variant: DECK.variant, custom: DECK.custom})); } catch (e) {} }
function deckStats(counts) {
  let door = 0, tr = 0, mons = 0, curses = 0, lvls = 0, rc = 0;
  POOL.forEach(p => { const n = counts[p.tpl.n] || 0; if (p.deck === 'door') door += n; else tr += n; if (p.tpl.k === 'monster') mons += n; if (p.tpl.k === 'curse') curses += n; if (p.tpl.k === 'levelup') lvls += n; if (p.tpl.k === 'race' || p.tpl.k === 'class') rc += n; });
  const share = door ? mons / door : 0, errors = [], warnings = [];
  const okDoor = door >= 30, okTr = tr >= 25, okMons = mons >= 12 && share >= 0.3;
  if (!okDoor) errors.push(`Der Türstapel braucht mindestens 30 Karten (jetzt ${door}).`);
  if (!okTr) errors.push(`Der Schatzstapel braucht mindestens 25 Karten (jetzt ${tr}).`);
  if (!okMons) errors.push(`Es braucht mindestens 12 Monster, und sie müssen 30 % der Türkarten ausmachen (jetzt ${mons}, ${Math.round(share * 100)} %).`);
  if (lvls > 6) warnings.push('Viele Stufenkarten: Partien werden sehr kurz.');
  if (curses > 16) warnings.push('Sehr viele Flüche: Es wird chaotisch.');
  if (!rc) warnings.push('Ohne Rassen und Klassen gibt es keine Fähigkeiten.');
  return {door, tr, mons, share, okDoor, okTr, okMons, errors, warnings, ok: !errors.length};
}
function deckLabel() { return `${deckById(DECK.deck).name} · ${variantName(DECK.variant)}`; }
const LOCK_SVG = '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>';
function renderDeckPanel() {
  const st = deckStats(DECK.counts), d = deckById(DECK.deck), v = VARIANTS.find(x => x[0] === DECK.variant);
  const tiles = DECKS.map(x => { const un = x.unlocked(); return `<button type="button" class="dtile${un ? '' : ' locked'}" data-deck="${x.id}" aria-pressed="${DECK.deck === x.id}"><span class="dt-img"><img src="${ART[x.icon]}" alt="" draggable="false">${un ? '' : `<i>${LOCK_SVG}</i>`}</span><b>${esc(x.name)}</b></button>`; }).join('') +
    `<button type="button" class="dtile soon" data-deck="soon"><span class="dt-img"><i>${LOCK_SVG}</i></span><b>Weitere Decks</b></button>`;
  const vbtn = (k, l, wide) => `<button type="button" class="vbtn${wide ? ' wide' : ''}" data-variant="${k}" aria-pressed="${DECK.variant === k}">${l}</button>`;
  const vars = VARIANTS.map(([k, l]) => vbtn(k, l)).join('') + vbtn('eigenes', DECK.custom[DECK.deck] ? 'Eigenes' : 'Eigenes <small>· noch leer</small>', true);
  const row = (ok, need, val) => `<li class="${ok ? 'ok' : 'bad'}"><i aria-hidden="true">${ok ? '✓' : '✗'}</i><span>${need}</span><b>${val}</b></li>`;
  const check = `<div class="dk-check"><p class="dk-st ${st.ok ? 'ok' : 'bad'}">${st.ok ? 'Spielbereit' : 'Noch nicht spielbereit'}</p><p class="dk-need">Damit ein Deck spielbereit ist, braucht es:</p><ul class="dk-req">` +
    row(st.okDoor, 'mindestens 30 Türkarten', st.door) + row(st.okTr, 'mindestens 25 Schatzkarten', st.tr) + row(st.okMons, 'mindestens 12 Monster, die 30 % der Türkarten ausmachen', `${st.mons} · ${Math.round(st.share * 100)} %`) +
    `</ul>${st.warnings.map(w => `<p class="dk-warn">${esc(w)}</p>`).join('')}</div>`;
  patch($('#deck-panel'), `<div class="dk-head"><b>Dein Deck</b></div>` +
    `<div class="dk-lbl">Deck</div><div class="dk-decks">${tiles}</div><p class="dk-desc">${esc(d.desc)}</p>` +
    `<div class="dk-lbl">Variante</div><div class="dk-var">${vars}</div><p class="dk-desc">${esc(v ? v[2] : 'Deine eigene Zusammenstellung. Ändere unten die Anzahl der Karten.')}</p>` + check +
    `<p class="hint">Mit − und + legst du fest, wie oft eine Karte im Deck ist (0 bis ${DECK_MAX}). Jede Änderung speichert die Mischung unter „Eigenes“.${GAME_ON && S && S.winner == null ? ' Änderungen gelten ab dem nächsten Spiel.' : ''}</p>`);
}
function selectDeck(id) {
  if (id === 'soon') { toast('Neue Decks schaltest du später im Storymodus frei.'); return; }
  const d = deckById(id);
  if (!d.unlocked()) { toast(d.lockTxt || 'Dieses Deck ist noch nicht freigeschaltet.'); return; }
  DECK.deck = d.id;
  if (DECK.variant === 'eigenes' && !DECK.custom[d.id]) DECK.variant = 'standard';
  DECK.counts = currentCounts(DECK); saveDeck(); renderCards();
}
function selectVariant(k) {
  if (k === 'eigenes' && !DECK.custom[DECK.deck]) { DECK.custom[DECK.deck] = Object.assign({}, DECK.counts); toast('Eigenes Deck angelegt. Passe unten die Anzahl an.'); }
  DECK.variant = k; DECK.counts = currentCounts(DECK); saveDeck(); renderCards();
}
async function setDeckCount(i, delta) {
  const p = POOL[i]; if (!p) return;
  const n = clampCount((DECK.counts[p.tpl.n] || 0) + delta);
  if (n === DECK.counts[p.tpl.n]) { buzz(30); return; }
  if (DECK.variant !== 'eigenes') {
    const old = DECK.custom[DECK.deck];
    if (old && POOL.some(q => clampCount(old[q.tpl.n] || 0) !== DECK.counts[q.tpl.n])) {
      const ok = await confirmDialog('Eigenes Deck ersetzen?', `Deine Änderung startet ein neues eigenes Deck auf Basis von „${esc(variantName(DECK.variant))}“. Dein bisheriges eigenes Deck wird dabei ersetzt.`, 'Ersetzen', 'Abbrechen');
      if (!ok) return;
    } else toast('Deine Mischung steht jetzt unter „Eigenes“.');
    DECK.custom[DECK.deck] = Object.assign({}, DECK.counts); DECK.variant = 'eigenes';
  }
  DECK.custom[DECK.deck][p.tpl.n] = n; DECK.counts = currentCounts(DECK); saveDeck(); renderCards();
}

const SCREENS = ['title', 'setup', 'game', 'settings', 'rules', 'cards', 'quiz', 'profile', 'story'];
let CUR = 'title';
const STACK = [];
function show(name) { if (name !== CUR) STACK.push(CUR); setScreen(name); }
function setScreen(name) {
  SCREENS.forEach(s => { const el = $('#scr-' + s); const on = s === name; el.hidden = !on; if (on) { el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); } });
  CUR = name;
  updatePaused();
  Snd.mood(name === 'game' && S && S.combat ? 'combat' : 'tavern');
  Snd.theme(name === 'game' ? GAME_THEME : 'taverne');
  $('#app').classList.toggle('tbl-keller', name === 'game' && GAME_TABLE === 'keller');
  if (name === 'title') renderTitle();
  if (name === 'setup') { renderControls(); const sd = $('#setup-deck'); if (sd) { const st = deckStats(DECK.counts); sd.innerHTML = `${esc(deckLabel())} <small>${st.door + st.tr} Karten${st.ok ? '' : ' · nicht spielbereit'}</small>`; } }
  if (name === 'settings') { renderControls(); renderSaveInfo(); }
  if (name === 'cards') renderCards();
  if (name === 'quiz') renderQuiz();
  if (name === 'profile') renderProfile();
  if (name === 'story') renderStory();
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
  const cw = currentWorld(), si = $('#story-info');
  if (si) si.textContent = `Welt ${cw.n} · ${worldStars(cw)} von ${worldMaxStars(cw)} Sternen`;
  const btn = $('#btn-continue');
  btn.hidden = !(active || save);
  if (active && S.scn) { const st = stationById(S.scn); $('#continue-info').textContent = st ? `Storymodus · ${st.no} ${st.name}` : 'Storymodus'; }
  else if (active) $('#continue-info').textContent = `Runde ${S.turn} · Stufe ${S.players[0].lvl}`;
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
  $$('.seg[data-set]').forEach(seg => { const k = seg.dataset.set; seg.querySelectorAll('button').forEach(b => { const lk = b.dataset.v === 'keller' && !moodOpen(); b.classList.toggle('locked', lk); b.setAttribute('aria-pressed', String(!lk && String(SET[k] === 'keller' && !moodOpen() ? 'taverne' : SET[k]) === b.dataset.v)); }); });
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
  const st = deckStats(DECK.counts);
  let counts = DECK.counts;
  if (!st.ok) {
    const useDef = await confirmDialog('Dein Deck ist noch nicht spielbereit', esc(st.errors[0]) + ' Mit dem Grunddeck in der Variante „Standard“ spielen?', 'Standard spielen', 'Deck bearbeiten');
    if (!useDef) { show('cards'); return; }
    counts = variantCounts('grund', 'standard');
  }
  DECK_COUNTS = counts;
  SCN = null; STORY_RUN = null; freeMood();
  clearSave(); applySettings();
  W.reset(); GAME_ON = true;
  STACK.length = 0; STACK.push('title');
  setScreen('game');
  newGame(false);
}
function continueGame() {
  if (GAME_ON && S && S.winner == null) { setScreen('game'); return; }
  const d = load(K_SAVE); if (!d) return;
  SCN = null; STORY_RUN = null; freeMood(); applySettings();
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
const coinsHTML = l => { const m = WINLVL(); let s = ''; for (let i = 1; i <= m; i++) s += `<i class="${i <= l ? 'on' : ''}${i === l ? ' cur' : ''}${i === m ? ' goal' : ''}"></i>`; return s; };

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
  if (S.reveal && S.reveal.uid !== W.reveal) { W.reveal = S.reveal.uid; if (S.reveal.boss) banner(S.reveal.n + '!', 'bad'); Snd.sfx('thud'); setTimeout(() => Snd.sfx('flip'), 160); buzz(25); }
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
  patch($('#tb-title'), SCN && SCN.fight ? 'Rätselkampf' : SCN ? `Ziel Stufe ${WINLVL()} · Runde ${S.turn}` : `Runde ${S.turn} · ${esc(who)}`);
  patch($('#phasedots'), ICON.phase.map((src, i) => `<img src="${src}" alt="${PHASES[i]}" title="${PHASES[i]}" class="${S.phase === i + 1 ? 'on' : S.phase > i + 1 ? 'done' : ''}">`).join(''));
  const unread = Math.max(0, S.log.length - W.logSeen), badge = $('#log-badge');
  badge.hidden = unread === 0 || topSheet()?.id === 'log';
  badge.textContent = unread > 99 ? '99+' : unread;
}
function renderOpps() {
  const C = S.combat, many = S.players.length > 3;
  const html = S.players.filter(p => !p.human).map(p => {
    const role = C && (C.f === p.id ? 'kämpft' : C.h === p.id ? 'hilft' : ''), turn = S.cur === p.id && S.winner == null;
    return `<button type="button" class="oc${turn ? ' turn' : ''}${p.dead ? ' dead' : ''}" data-opp="${p.id}" aria-label="${esc(p.name)}, Stufe ${p.lvl}">` +
      (role ? `<span class="tag red">${role}</span>` : p.dead ? '<span class="tag">tot</span>' : turn ? '<span class="tag">am Zug</span>' : '') +
      `<span class="pt"><img src="${portrait(p)}" alt=""><span class="lvb">${p.lvl}</span></span>` +
      `<span class="ot"><span class="on">${esc(p.name)}</span><span class="os"><span><img src="${ICON.kampf}" alt="">${power(p)}</span><span><img src="${ICON.run}" alt="">${sign(runBonus(p))}</span>${many ? '' : `<span><img src="${ICON.hand}" alt="">${p.hand.length}</span>`}</span></span></button>`;
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
  const chip = c.k === 'monster' ? `${c.boss ? 'Boss' : 'Monster'} · Stufe ${c.lvl}` : `${t.d} · ${t.l}`;
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
/* Vorschau beim Ziehen: Bonus kurz eintragen, rechnen, wieder austragen */
function withPv(C, fn) {
  const pv = UI.pv; let undo = null;
  if (pv && C) {
    if (pv.side === 'p') { C.pB.push(pv.b); undo = () => C.pB.pop(); }
    else if (pv.side === 'm') { C.mB.push(pv.b); undo = () => C.mB.pop(); }
    else if (pv.mon && C.mons.includes(pv.mon)) { pv.mon.enh.push(pv.e); undo = () => pv.mon.enh.pop(); }
  }
  try { return fn(); } finally { if (undo) undo(); }
}
function hudHTML(C) {
  const f0 = sideStrength(C).s, m0 = monStrength(C).s;
  const [sF, sM, r] = withPv(C, () => [sideStrength(C), monStrength(C), evalCombat(C)]);
  const pvF = sF.s !== f0, pvM = sM.s !== m0, pv = pvF || pvM;
  const f = P(C.f), h = C.h != null ? P(C.h) : null;
  const pts = [f, h].filter(Boolean).map(p => `<img${p.human ? ' class="me"' : ''} src="${portrait(p)}" alt="">`).join('');
  const who = (f.human ? 'Du' : f.name) + (h ? ' + ' + (h.human ? 'du' : h.name) : '');
  const team = f.human || (h && h.human);
  const verdict = r.win ? (f.human ? 'du gewinnst' : team ? 'ihr gewinnt' : f.name + ' gewinnt') : (f.human ? 'du verlierst' : team ? 'ihr verliert' : f.name + ' verliert');
  return `<button type="button" class="side me" data-go="parts" aria-label="Kampfstärke ${sF.s}, Aufschlüsselung"><span class="pts">${pts}</span><span class="sv">${pvF ? `<span class="was">${f0} →</span>` : ''}<b class="snum${pvF ? ' pv' : ''}" data-n="f">${sF.s}</b><span class="slbl">${esc(who)}</span></span></button>` +
    `<div class="mid"><span class="verdict ${r.win ? 'win' : 'lose'}${pv ? ' pv' : ''}">${pv ? '→ ' : ''}${esc(verdict)}</span>${r.a === r.b ? `<span class="tie">${r.tieWin ? 'Krieger: Gleichstand gewinnt' : 'Gleichstand verliert'}</span>` : ''}</div>` +
    `<button type="button" class="side mon" data-go="parts" aria-label="Monsterstärke ${sM.s}, Aufschlüsselung"><span class="sv">${pvM ? `<span class="was">${m0} →</span>` : ''}<b class="snum red${pvM ? ' pv' : ''}" data-n="m">${sM.s}</b><span class="slbl">${C.mons.length > 1 ? C.mons.length + ' Monster' : 'Monster'}</span></span></button>`;
}
function paintHud(hud, C) {
  if (!patch(hud, hudHTML(C)) || UI.pv) return;
  hud.querySelectorAll('.snum').forEach(b => {
    const k = b.dataset.n, v = +b.textContent;
    if (W.nums[k] != null && W.nums[k] !== v) { b.classList.add(v > W.nums[k] ? 'up' : 'down'); }
    W.nums[k] = v;
  });
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
    paintHud(el.querySelector('.hud'), C);
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
  [/^Fertig: Monster besiegen$/, 'Monster besiegen'], [/^Aufgeben und weglaufen$/, 'Weglaufen'], [/^Um Hilfe bitten$/, 'Hilfe holen'],
  [/^Krieger: .*/, 'Krieger +1'], [/^Priester: .*/, 'Priester +3'], [/^Dieb: .*/, 'Dieb −2'], [/^Nebelpulver einsetzen$/, 'Nebelpulver'],
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
    const w = S.winner >= 0 ? P(S.winner) : null, story = !!S.scn;
    cls += ' your';
    html = `<div class="cap"><span class="ct">${w && w.human ? 'Du hast gewonnen!' : w ? esc(w.name) + ' gewinnt.' : 'Nicht geschafft.'}</span></div><div class="dbtns"><button type="button" class="btn primary" data-go="again">Nochmal</button><button type="button" class="btn" data-go="${story ? 'storymap' : 'menu'}">${story ? 'Zur Karte' : 'Hauptmenü'}</button></div>`;
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
    html = `<button type="button" class="cap${hasInfo ? ' info' : ''}" ${hasInfo ? 'data-dinfo' : 'disabled'}>${tip}<span class="ct">${esc(stripTags(promptCaption(q, ctx, data)))}</span>${hasInfo ? '<span class="ii" aria-label="Mehr Infos">i</span>' : ''}</button><div class="dbtns" data-n="${dockButtons(q, ctx).length}">${btns}</div>`;
  } else {
    cls += ' idle';
    // letzte Meldung seit dem Zugwechsel; direkt nach dem Wechsel steht dort, wer jetzt dran ist
    const last = S.log.slice().reverse().find(e => UI.coach || e.kind !== 'rule');
    const who = P(S.cur);
    const line = !last || last.kind === 'turn' ? (S.cur === 0 ? 'Einen Moment …' : `${who.name} ist am Zug`) : stripTags(last.t);
    // Porträt passend zur Meldung: wer am Satzanfang steht, sonst wer am Zug ist
    const actor = S.players.find(p => p.human ? /^(Du|Dein|Deine)\b/.test(line) : line.startsWith(p.name + ' ') || line.startsWith(p.name + ':')) || who;
    html = `<div class="cap"><img class="cpt${actor.human ? ' me' : ''}" src="${portrait(actor)}" alt=""><span class="ct">${esc(line)}</span></div>`;
  }
  if (el.className !== cls) el.className = cls;
  patch(el, html);
}
function renderMe() {
  const p = me();
  const C = S.combat, role = C ? (C.f === 0 ? ' · kämpft' : C.h === 0 ? ' · hilft' : '') : '';
  const over = p.hand.length > handLimit(p);
  patch($('#mebar'), `<button type="button" class="ptbtn" data-go="equip" aria-label="Deine Werte und Ausrüstung"><img class="pt" src="${myPortrait()}" alt=""></button><span class="lv"><b>Stufe ${p.lvl}${p.dead ? ' · tot' : role}</b><span class="coins${W.coinPop ? ' pop' : ''}">${coinsHTML(p.lvl)}</span></span>` +
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
/* Ausrüsten: was steckt schon im Slot, was wandert in den Rucksack, wie ändert sich die Kampfstärke */
function equipInfo(p, c) {
  if (!p || !c || c.k !== 'item' || !c.slot || c.slot === 'none' || p.eq.includes(c)) return null;
  const q = Object.assign({}, p, {eq: [...p.eq], pack: [...p.pack], hand: [...p.hand]});
  const moved = equip(q, c), ok = canEquip(p, c).ok;
  const now = p.eq.filter(i => i.slot === c.slot);
  return {now, moved, ok, k0: power(p), k1: power(q), r0: runBonus(p), r1: runBonus(q)};
}
const SLOT_HEAD = {kopf: 'Auf dem Kopf trägst du', ruestung: 'Als Rüstung trägst du', schuhe: 'An den Füßen trägst du', hand: 'In der Hand hältst du'};
const SLOT_FREE = {kopf: 'Du trägst noch keine Kopfbedeckung.', ruestung: 'Du trägst noch keine Rüstung.', schuhe: 'Du trägst noch kein Schuhwerk.', hand: 'Beide Hände sind noch frei.'};
function equipInfoHTML(p, c) {
  const e = equipInfo(p, c); if (!e) return '';
  const row = i => { const out = e.moved.includes(i), act = usable(p, i);
    return `<button type="button" class="es-it" data-uid="${i.uid}" data-where="eq"><img src="${ART[i.n] || ART_FALLBACK}" alt=""><span><b>${esc(i.n)}</b><small>${sign(i.b || 0)}${act ? '' : ' · inaktiv'}${i.run ? ` · Weglaufen ${sign(i.run)}` : ''}</small></span><em class="${out ? 'out' : ''}">${out ? 'kommt in den Rucksack' : 'bleibt'}</em></button>`; };
  const head = c.slot === 'hand' && e.now.length > 1 ? 'In den Händen hältst du' : SLOT_HEAD[c.slot];
  const body = e.now.length ? `<span class="es-h">${head}</span>${e.now.map(row).join('')}${c.slot === 'hand' && !e.moved.length ? '<span class="es-free">Die zweite Hand ist noch frei.</span>' : ''}` : `<span class="es-free">${SLOT_FREE[c.slot]}</span>`;
  const d = e.k1 - e.k0, dr = e.r1 - e.r0;
  const pw = e.ok ? `<span class="es-pw ${d > 0 ? 'up' : d < 0 ? 'down' : ''}">Kampfstärke ${e.k0} → ${e.k1}${dr ? ` · Weglaufen ${sign(e.r0)} → ${sign(e.r1)}` : ''}</span>` : '';
  return `<div class="eqswap">${body}${pw}</div>`;
}
function equipSub(p, c) {
  const e = equipInfo(p, c); if (!e) return '';
  return (e.moved.length ? `ersetzt ${e.moved.map(i => i.n).join(' + ')}` : 'Platz frei') + (e.ok ? ` · Kampf ${e.k0} → ${e.k1}` : '');
}
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
    if (s.human) c = HUMAN; else if (s.cname) c = CATALOG[s.cname] || POOLCAT[s.cname]; else c = findCard(s.uid);
    if (!c) return null;
    const live = !s.cname && !s.human && s.where && ['hand', 'eq', 'pack', 'race', 'cls'].includes(s.where);
    const acts = live ? cardActions(c, s.where) : [];
    UI.cardActs = acts;
    const meaning = cardMeaning(c), wh = S && !s.human ? whereNow(c) : [];
    const actHTML = acts.map((a, i) => a.info ? `<p>${a.info}</p>` : `<button type="button" class="btn ${a.kind === 'primary' ? 'primary' : ''}${UI.adv && UI.adv.uid === c.uid && UI.adv.act && a.l.startsWith(UI.adv.act) ? ' rec' : ''}" data-cact="${i}" ${a.dis ? 'disabled' : ''}>${esc(a.l)}</button>${a.dis ? `<p class="err">${a.dis}</p>` : ''}`).join('');
    const swap = live && (s.where === 'hand' || s.where === 'pack') ? equipInfoHTML(me(), c) : '';
    const info = (meaning ? `<p class="meaning">${meaning}</p>` : '') + (wh.length ? `<ul class="wherenow">${wh.map(x => `<li>${x}</li>`).join('')}</ul>` : ''), actBox = actHTML ? `<div class="acts">${actHTML}</div>` : '';
    /* Beim Ausrüsten stehen Slot-Info und Knopf direkt unter der Karte, die Erklärung danach */
    return {head: h3(''), body: cardBig(c) + (swap ? swap + actBox + info : info + actBox)};
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
    return {head: `<img class="pt me" src="${myPortrait()}" alt=""><h3>${esc(myName())}<br><span style="font:700 15px var(--body);color:var(--muted)">Stufe ${p.lvl}${p.dead ? ' · tot' : ''}</span></h3>`, body: `<div class="coins" style="margin:0 0 10px">${coinsHTML(p.lvl)}</div>${stats3(p)}${abilList(p)}<div class="slots">${slotRows(p, true)}</div>` +
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
    if (S && S.scn) { const st = stationById(S.scn);
      return {head: h3(st ? `${st.no} · ${esc(st.name)}` : 'Pause'), body: `${st ? `<div class="st-goal"><b>Ziel</b><p>${esc(st.goal)}</p></div>` : ''}<div class="acts"><button type="button" class="btn primary" data-go="resume">Weiterspielen</button><button type="button" class="btn" data-go="settings">Optionen</button><button type="button" class="btn" data-go="rules">Spielregeln</button><button type="button" class="btn" data-go="storymap">Station abbrechen</button></div><p class="hint">Im Storymodus wird nicht zwischengespeichert. Brichst du ab, startest du die Station neu.</p>`}; }
    return {head: h3('Pause'), body: `<div class="acts"><button type="button" class="btn primary" data-go="resume">Weiterspielen</button><button type="button" class="btn" data-go="settings">Optionen</button><button type="button" class="btn" data-go="rules">Spielregeln</button><button type="button" class="btn" data-go="cards">Alle Karten</button><button type="button" class="btn" data-go="menu">Hauptmenü</button></div><p class="hint">Dein Spiel wird zu Beginn jedes deiner Züge gespeichert.</p>`};
  },
  sel() {
    const s = UI.sel; if (!s) return null;
    const p = me(), cands = [];
    [['hand', p.hand], ['eq', p.eq], ['pack', p.pack]].forEach(([w, arr]) => arr.forEach(c => { if (s.filter(c, w)) cands.push([c, w]); }));
    const picked = [...s.picked].map(findCard).filter(Boolean), err = s.validate ? s.validate(picked) : null;
    const ok = picked.length >= s.min && picked.length <= s.max && !err;
    const mini = ([c, w]) => cardMini(c, {where: w, extra: (s.picked.has(c.uid) ? 'picked' : '') + (UI.adv && UI.adv.picks && UI.adv.picks.includes(c.uid) ? ' rec' : '') + (w === 'eq' && !usable(p, c) ? ' inactive' : '')});
    const zones = [['eq', 'Ausgerüstet'], ['pack', 'Im Rucksack'], ['hand', 'Auf der Hand']].filter(([w]) => cands.some(x => x[1] === w));
    const grid = zones.length > 1
      ? zones.map(([w, l]) => { const cs = cands.filter(x => x[1] === w); return `<h4 class="selgrp">${l}<span>${cs.length}</span></h4><div class="sel-grid">${cs.map(mini).join('')}</div>`; }).join('')
      : `<div class="sel-grid">${cands.map(mini).join('')}</div>`;
    return {head: h3(esc(s.title || 'Karten wählen')), body: `<p class="atxt" style="margin:0">${s.text} <span class="hint">(${picked.length} gewählt)</span></p>${adviceBox()}${s.extra ? `<p class="sel-extra">${s.extra(picked)}</p>` : ''}${err ? `<p class="sel-err">${err}</p>` : ''}${grid}` +
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
    case 'gameover':
      if (S && S.scn && STORY_RUN && !STORY_RUN.done) { STORY_RUN.done = true; const res = finishStation(stationById(STORY_RUN.st), S); setTimeout(() => showStoryEnd(res), 1000); }
      else if (!(S && S.scn)) { setTimeout(() => showEnd(d.winner), 1000); clearSave(); }
      break;
  }
};
function showEnd(wid) {
  if (!S) return;
  const w = P(wid), mine = w.human;
  Snd.sfx(mine ? 'victory' : 'defeat'); buzz(mine ? [40, 60, 40, 60, 120] : 200);
  const el = document.createElement('div'); el.className = 'endov';
  el.innerHTML = `<div class="panel"><img src="${portrait(w)}" alt=""><h2>${mine ? (PROFILE.name ? `Gewonnen, ${esc(PROFILE.name)}!` : 'Gewonnen!') : esc(w.name) + ' gewinnt'}</h2><p>${mine ? 'Stufe 10 durch einen Monstersieg. Die ganze Beute gehört dir!' : 'Kein Drama, die nächste Runde wartet schon. In den Notizen siehst du, wie es dazu kam.'}</p><button type="button" class="btn primary" data-go="again">Nochmal spielen</button><button type="button" class="btn" data-go="log">Notizen ansehen</button><button type="button" class="btn" data-go="menu">Hauptmenü</button></div>`;
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
const KFILTERS = [['alle', 'Alle'], ['monster', 'Monster'], ['curse', 'Flüche'], ['rc', 'Rasse/Klasse'], ['item', 'Gegenstände'], ['misc', 'Sonstige']];
const SLOT_ORDER = ['kopf', 'ruestung', 'schuhe', 'hand', 'none'];
/* Filterleiste: dunkler Grund nur, solange sie oben festklebt */
function updFilterStuck() {
  const sc = $('#scr-cards .content'), f = $('#card-filter'); if (!sc || !f) return;
  f.classList.toggle('stuck', f.getBoundingClientRect().top <= sc.getBoundingClientRect().top + 2);
}
function renderCards() {
  renderDeckPanel(); requestAnimationFrame(updFilterStuck);
  const f = UI.kfilter || 'alle';
  patch($('#card-filter'), KFILTERS.map(([k, l]) => `<button type="button" class="chip" data-kf="${k}" aria-pressed="${f === k}">${l}</button>`).join(''));
  const show = k => f === 'alle' || f === k || (f === 'rc' && (k === 'race' || k === 'class')) || (f === 'misc' && ['enh', 'wander', 'oneshot', 'levelup', 'amulet'].includes(k));
  const all = POOL.map((p, i) => [p.tpl, i]).filter(([c]) => cardOpen(c));
  const sorter = {monster: (a, b) => a.lvl - b.lvl, item: (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot) || (a.hands || 0) - (b.hands || 0) || a.b - b.b, oneshot: (a, b) => (a.b || 0) - (b.b || 0), enh: (a, b) => a.v - b.v};
  let html = '';
  KGROUPS.forEach(([k, label]) => {
    if (!show(k)) return;
    const cs = all.filter(([c]) => c.k === k).sort(([a], [b]) => (sorter[k] || ((x, y) => x.n.localeCompare(y.n, 'de')))(a, b));
    if (!cs.length) return;
    const total = cs.reduce((n, [c]) => n + (DECK.counts[c.n] || 0), 0);
    html += `<h3 class="cgroup">${label}<span>${total} im Deck</span></h3>` + cs.map(([c, i]) => {
      const n = DECK.counts[c.n] || 0;
      return `<div class="dk${n ? '' : ' off'}">${cardMini(c, {cname: true, size: 'grid'})}<div class="stp"><button type="button" data-dk="${i}" data-d="-1" aria-label="${esc(c.n)} einmal weniger" ${n ? '' : 'disabled'}>−</button><b>${n}×</b><button type="button" data-dk="${i}" data-d="1" aria-label="${esc(c.n)} einmal mehr" ${n >= DECK_MAX ? 'disabled' : ''}>+</button></div></div>`;
    }).join('');
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

/* ================= Storymodus: Karte, Stationen, Ergebnis ================= */
let STORY_RUN = null; // {st, done} während eine Station läuft
const LOCK_PATH = '<rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />';
const ST_TYPES = {puzzle: 'Rätselkampf', duel: 'Herausforderung', event: 'Ereignis', shop: 'Händler', boss: 'Boss'};
const ST_ICON = {
  puzzle: '<path d="M14.5 4H20v5.5L9.5 20 4 14.5z M7.5 13.5l3 3 M4 20l2.5-2.5" />',
  duel: '<rect x="3.5" y="5" width="10" height="14" rx="2" /><path d="M15 6.5l5 1.3-3.2 12.2-3.3-.9" />',
  event: '<path d="M5 5h14v10H10l-5 4z M9 9h6 M9 12h4" />',
  shop: '<path d="M6 9h12l-1.2 11H7.2z M9 9a3 3 0 0 1 6 0" />',
  boss: '<path d="M4 18l1.8-10 4.2 5 2-7 2 7 4.2-5L20 18z M4 21h16" />'
};
const starSvg = on => `<svg class="star${on ? ' on' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.8l-5.3 2.9 1.1-6-4.4-4.2 6-.8z" /></svg>`;
const coinImg = '<img src="icons/muenze-voll.png" alt="">';
function renderStory() {
  const open = openWorlds(), cw = open[open.length - 1];
  patch($('#st-coins'), `${coinImg}<b>${STORY.coins}</b>`);
  const head = w => `<span class="st-world">Welt ${w.n}</span><b class="st-name">${esc(w.name)}</b><span class="st-stars">${starSvg(true)}<b>${worldStars(w)}</b> von ${worldMaxStars(w)} Sternen${STORY.worlds[w.id] ? ' · abgeschlossen' : ''}</span>`;
  patch($('#st-head'), head(open[0]));
  let next = null;
  open.forEach(w => { const n = w.stations.find(st => stationUnlocked(st) && !STORY.done[st.id]); if (n) next = n; });
  const maps = open.map((w, i) => (i ? `<div class="st-link" aria-hidden="true"></div><div class="panel st-head st-band">${head(w)}</div>` : '') + worldMapHTML(w, next)).join('');
  const f = fogWorld();
  patch($('#st-map'), maps + (f ? fogHTML(f, f.near) : ''));
  if (!STORY.intro[cw.id]) { STORY.intro[cw.id] = true; saveStory(); openSheet({id: 'storyintro', w: cw.id}); }
  if (next && CUR === 'story') {
    const sc = $('#scr-story .content');
    if (sc && sc.__scrolledTo !== next.id) { sc.__scrolledTo = next.id; requestAnimationFrame(() => { const el = $(`.snode[data-station="${next.id}"]`); if (el) sc.scrollTop = Math.max(0, sc.scrollTop + el.getBoundingClientRect().top - sc.getBoundingClientRect().top - sc.clientHeight / 2); }); }
  }
}
function worldMapHTML(w, next) {
  const art = !!w.map, H = art ? 100 : w.mapH, done = !!STORY.worlds[w.id];
  const X = st => art ? st.ax : st.x, Y = st => art ? st.ay : st.y;
  const segs = [];
  w.stations.forEach(st => (st.req || st.reqAny || []).forEach(r => { const a = stationById(r); if (!a || a.world !== w.id) return; const ya = Y(a), yb = Y(st); segs.push(`<path class="${STORY.done[r] ? 'on' : ''}" d="M${X(a)} ${ya} C${X(a)} ${(ya + yb) / 2} ${X(st)} ${(ya + yb) / 2} ${X(st)} ${yb}" vector-effect="non-scaling-stroke" />`); }));
  const marks = (w.landmarks || []).map(([t, x, y]) => `<span class="st-mark${x < 25 ? ' l' : x > 75 ? ' r' : ''}" style="left:${x}%;top:${y}px">${esc(t)}</span>`).join('');
  const nodes = w.stations.map(st => {
    const un = stationUnlocked(st), dn = !!STORY.done[st.id], s = starsOf(st.id), mx = maxStars(st);
    const stars = mx ? `<span class="sn-stars">${Array.from({length: mx}, (_, i) => starSvg(!!s[i])).join('')}</span>` : '';
    return `<button type="button" class="snode t-${st.type}${un ? '' : ' locked'}${dn ? ' done' : ''}${next === st ? ' next' : ''}" data-station="${st.id}" style="left:${X(st)}%;top:${Y(st)}${art ? '%' : 'px'}" aria-label="${esc(st.no + ' ' + st.name)}${un ? '' : ', gesperrt'}">` +
      `<span class="sn-medal"><svg viewBox="0 0 24 24">${un ? ST_ICON[st.type] : LOCK_PATH}</svg><i>${st.no}</i></span><span class="sn-name">${esc(st.name)}</span>${stars}</button>`;
  }).join('');
  const last = w.stations[w.stations.length - 1];
  if (!art) segs.push(`<path class="${done ? 'on' : ''}" d="M${last.x} ${last.y} L${last.x} ${w.mapH}" vector-effect="non-scaling-stroke" />`);
  return `<div class="smap-in${art ? ' pic' : ''}" data-world="${w.id}" style="${art ? `aspect-ratio:${w.mapRatio};background-image:url(${w.map})` : `height:${w.mapH}px`}"><svg class="st-path" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">${segs.join('')}</svg>${art ? '' : marks}${nodes}</div>`;
}
// Nächste Welt: im Nebel zu erahnen, je weiter unten desto dichter
function fogHTML(f, open) {
  const pts = [[50, 0], ...f.teaser];
  const seg = f.teaser.map((p, i) => { const a = pts[i]; return `<path d="M${a[0]} ${a[1]} C${a[0]} ${(a[1] + p[1]) / 2} ${p[0]} ${(a[1] + p[1]) / 2} ${p[0]} ${p[1]}" vector-effect="non-scaling-stroke" />`; }).join('');
  const dots = f.teaser.map(([x, y]) => `<span class="fog-node" style="left:${x}%;top:${y}%"><span class="sn-medal"><svg viewBox="0 0 24 24"><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8v.5 M12 17h.01" /></svg></span></span>`).join('');
  return `<div class="st-link" aria-hidden="true"></div><div class="st-fog${open ? ' near' : ''}" style="aspect-ratio:${(f.ratio / f.show).toFixed(4)}"><div class="fog-map${f.map ? ' pic' : ''}"${f.map ? ` style="background-image:url(${f.map})"` : ''}><svg class="st-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${seg}</svg>${dots}</div>` +
    `<div class="fog-layer" aria-hidden="true"></div><div class="fog-drift d1" aria-hidden="true"></div><div class="fog-drift d2" aria-hidden="true"></div>` +
    `<div class="fog-label"><span class="sn-medal"><svg viewBox="0 0 24 24">${LOCK_PATH}</svg></span><span class="fog-world">Welt ${f.n}</span><b>${esc(f.name)}</b><small>${open ? esc(f.soon) : esc(f.hint)}</small></div></div>`;
}
function openStation(id) {
  const st = stationById(id); if (!st) return;
  if (!stationUnlocked(st)) { toast('Erst die Station davor schaffen.'); buzz(30); return; }
  if (st.type === 'shop') visitShop(st);
  openSheet({id: 'station', st: id});
  renderStory();
}
function startStation(id) {
  const st = stationById(id); if (!st || !st.scn || !stationUnlocked(st)) return;
  const scn = scenarioFor(st);
  const w = worldById(st.world);
  scn.counts = variantCounts(w.deck, scn.variant || 'standard'); delete scn.variant;
  // Der Endgegner einer Welt (ab Welt 2) kommt nur im Bosskampf ins Deck
  const fin = w.id !== 'w1' && w.stations.find(x => x.final), bossName = fin && fin.scn && fin.scn.boss;
  if (bossName && !scn.boss) scn.counts[bossName] = 0;
  GAME_TABLE = w.table || 'taverne'; GAME_THEME = w.theme || 'taverne';
  SCN = scn; STORY_RUN = {st: st.id, done: false};
  $$('.endov').forEach(x => x.remove()); while (SHEETS.length) SHEETS.pop(); renderSheet(true);
  applySettings();
  UI.bots = (scn.bots || []).length; UI.diff = scn.diff || 'normal';
  W.reset(); GAME_ON = true;
  STACK.length = 0; STACK.push('title', 'story');
  setScreen('game');
  newGame(false);
}
function pickChoice(v) {
  const s = topSheet(); if (!s || s.id !== 'station') return;
  const st = stationById(s.st), r = chooseEvent(st, v); if (!r) return;
  Snd.sfx('coin'); toast(`+${r.coins} Münzen${r.rewards && r.rewards.length ? ` · Neu: ${cosmeticName(r.rewards[0])}` : ''}`); renderSheet(false); renderStory();
}
function buyItem(id) {
  const s = topSheet(); if (!s || s.id !== 'station') return;
  const st = stationById(s.st), item = (st.shop || []).find(x => x.id === id); if (!item) return;
  const r = buyCosmetic(item);
  if (r === 'poor') { toast(`Dafür brauchst du ${item.price} Münzen.`); buzz(40); return; }
  if (r === 'ok') { Snd.sfx('coin'); toast(`${cosmeticName(id)} gehört dir. Auswählen kannst du ihn im Charakter-Bildschirm.`); }
  renderSheet(false); renderStory();
}
function cosmeticPreview(id) {
  const [k, key] = id.split(':'), c = COSMETICS[k][key];
  if (k === 'portrait') return `<img class="cos-pt" src="${c.src}" alt="">`;
  if (k === 'frame') return `<i class="cos-fr" style="--c:${c.c}"></i>`;
  return `<i class="cos-ti">„“</i>`;
}
// Story-Text, wenn bekannt mit dem Gesicht dessen, der spricht oder auftritt
const sayHTML = (face, text) => face ? `<div class="st-say"><img src="${face}" alt=""><p class="st-text">${esc(text)}</p></div>` : `<p class="st-text">${esc(text)}</p>`;
/* Fluch aufs Spielfeld gezogen: hier wählst du, wen er trifft */
function curseImpact(c, t) {
  const e = c.eff || {};
  switch (e.t) {
    case 'lvl': return t.lvl > 1 ? `Stufe ${t.lvl} → ${Math.max(1, t.lvl - e.n)}` : 'Ist schon auf Stufe 1';
    case 'slot': { const it = t.eq.find(i => i.slot === e.s); return it ? `Verliert ${it.n}` : 'Trägt dort nichts'; }
    case 'best': { const all = [...t.eq, ...t.pack].sort((a, b) => (b.b || 0) - (a.b || 0) || (b.g - a.g)); return all.length ? `Verliert ${all[0].n}` : 'Hat keine Gegenstände'; }
    case 'hand': return t.hand.length ? `Hat ${t.hand.length} ${t.hand.length === 1 ? 'Handkarte' : 'Handkarten'}` : 'Hat keine Handkarten';
    case 'class': return t.cls ? `Verliert ${t.cls.n}` : t.lvl > 1 ? `Keine Klasse: Stufe ${t.lvl} → ${t.lvl - 1}` : 'Keine Klasse, schon Stufe 1';
    case 'race': return t.race ? `Verliert ${t.race.n}` : 'Ist schon Mensch';
    default: return '';
  }
}
const curseTargets = c => { const acts = cardActions(c, 'hand'); return S.players.map(t => [t, !t.human && acts.find(a => a.fn && !a.dis && a.l === `Auf ${t.name} spielen`)]).filter(x => x[1]); };
SHEET_VIEWS.curse = s => {
  const c = S && findCard(s.uid); if (!c || !me().hand.includes(c)) return null;
  const ts = curseTargets(c); if (!ts.length) return null;
  const C = S.combat, mean = c.txt ? `<b>Wirkung:</b> ${esc(c.txt)}` : cardMeaning(c);
  const row = ([t]) => { const role = C && !C.resolved ? (C.f === t.id ? 'kämpft' : C.h === t.id ? 'hilft' : '') : S.cur === t.id ? 'am Zug' : '';
    return `<button type="button" class="ctgt" data-cursepick="${t.id}"><img src="${portrait(t)}" alt=""><span class="ct-t"><b>${esc(t.name)}</b><small>Stufe ${t.lvl} · Kampfstärke ${power(t)}${t.dead ? ' · tot' : ''}</small>${curseImpact(c, t) ? `<em>${esc(curseImpact(c, t))}</em>` : ''}</span>${role ? `<span class="ct-role">${role}</span>` : ''}</button>`; };
  return {head: h3(`Wen triffst du mit „${esc(c.n)}“?`), body: (mean ? `<p class="meaning ct-mean">${mean}</p>` : '') + `<div class="ctg">${ts.map(row).join('')}</div>`};
};
SHEET_VIEWS.storyintro = s => {
  const w = worldById(s.w);
  return {head: h3(`Welt ${w.n} · ${esc(w.name)}`), body: `${sayHTML(w.face, w.intro)}<ul class="st-howto"><li>${starSvg(true)}<span>Jede Station gibt bis zu 3 Sterne: einen fürs Schaffen, zwei für Zusatzziele.</span></li><li>${coinImg}<span>Für Siege und Sterne gibt es Münzen. Die tauschst du beim Händler gegen Rahmen, Titel und Porträts.</span></li><li><svg viewBox="0 0 24 24" class="noadv"><path d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3z M9.5 20h5 M4 4l16 16" /></svg><span>Im Storymodus gibt es keine Tipps und keine Zug-Empfehlung.</span></li></ul><div class="acts"><button type="button" class="btn primary" data-storyclose>Auf geht’s</button></div>`};
};
SHEET_VIEWS.station = s => {
  const st = stationById(s.st); if (!st) return null;
  const done = !!STORY.done[st.id], stars = starsOf(st.id);
  let body = `<span class="st-type t-${st.type}">${ST_TYPES[st.type]}${st.hard ? ' · schwer' : st.easy ? ' · leicht' : ''} · ${esc(st.place)}</span>${sayHTML(st.face, st.text)}<div class="st-goal"><b>Ziel</b><p>${esc(st.goal)}</p></div>`;
  if (st.type === 'event') {
    const ch = STORY.choice[st.id];
    body += ch ? `<p class="st-chosen">${starSvg(true)}<span>Entschieden: <b>${esc(st.choices.find(c => c.v === ch).l)}</b>. ${esc(st.choices.find(c => c.v === ch).d)}</span></p><div class="acts"><button type="button" class="btn" data-storyclose>Schließen</button></div>`
      : `<div class="st-choices">${st.choices.map(c => `<button type="button" class="btn st-choice" data-story-choice="${c.v}"><b>${esc(c.l)}</b><small>${esc(c.d)}</small></button>`).join('')}</div><p class="hint">Die Entscheidung gilt für diesen Durchgang der Welt.</p>`;
  } else if (st.type === 'shop') {
    body += `<p class="st-purse">${coinImg}Du hast <b>${STORY.coins}</b> Münzen.</p><div class="shop">${st.shop.map(it => { const own = owns(it.id), poor = STORY.coins < it.price;
      return `<div class="shop-item">${cosmeticPreview(it.id)}<span>${esc(cosmeticName(it.id))}</span>${own ? '<em>Gehört dir</em>' : `<button type="button" class="btn small${poor ? ' poor' : ''}" data-buy="${it.id}">${coinImg}${it.price}</button>`}</div>`; }).join('')}</div>` +
      `<div class="acts"><button type="button" class="btn primary" data-storyclose>${esc(st.onward || 'Weiter')}</button></div>`;
  } else {
    const goals = [['Station schaffen', !!stars[0]], ...(st.extras || []).map((e, i) => [e.t, !!stars[i + 1]])];
    body += `<ul class="st-goals">${goals.map(([t, ok]) => `<li class="${ok ? 'ok' : ''}">${starSvg(ok)}<span>${esc(t)}</span></li>`).join('')}</ul>`;
    if (st.reward) body += `<p class="st-reward">Belohnung: ${esc(cosmeticName(st.reward))}${owns(st.reward) ? ' · hast du schon' : ''}</p>`;
    body += `<div class="acts"><button type="button" class="btn primary" data-story-start="${st.id}">${done ? 'Nochmal spielen' : 'Los geht’s'}</button></div>`;
  }
  return {head: h3(`${esc(st.no)} · ${esc(st.name)}`), body};
};
function showStoryEnd(res) {
  if (!STORY_RUN) return;
  const st = stationById(STORY_RUN.st), w = res.won;
  Snd.sfx(w ? 'victory' : 'defeat'); buzz(w ? [40, 60, 40, 60, 120] : 200);
  const goals = [['Station geschafft', res.stars[0]], ...(st.extras || []).map((e, i) => [e.t, res.stars[i + 1]])];
  const el = document.createElement('div'); el.className = 'endov story';
  const lose = st.type === 'puzzle' ? 'Das reicht noch nicht. Schau dir deine Karten noch einmal an.' : S && S.winner > 0 ? `${esc(P(S.winner).name)} war schneller. Gleich noch einmal?` : 'Gleich noch einmal?';
  el.innerHTML = `<div class="panel"><div class="se-stars">${res.stars.map((v, i) => `<span class="se-star${v ? ' on' : ''}" style="--d:${0.15 + i * 0.25}s">${starSvg(v)}</span>`).join('')}</div>` +
    `<h2>${w ? (st.final ? esc(worldById(st.world).finalTitle || 'Welt geschafft!') : 'Geschafft!') : 'Nicht geschafft'}</h2><p>${w ? esc(st.name) + ' liegt hinter dir.' : lose}</p>` +
    `<ul class="st-goals">${goals.map(([t, ok]) => `<li class="${ok ? 'ok' : ''}">${starSvg(ok)}<span>${esc(t)}</span></li>`).join('')}</ul>` +
    (res.coins ? `<p class="se-coins">${coinImg}+${res.coins} Münzen</p>` : '') +
    res.rewards.map(r => `<p class="se-reward">Neu: ${esc(cosmeticName(r))}</p>`).join('') +
    (res.worldDone ? `<p class="se-outro">${esc(worldById(st.world).outro)}</p>` + (worldById(st.world).unlocks ? `<p class="se-reward">Fürs freie Spiel freigeschaltet: ${esc(worldById(st.world).unlocks.join(', '))}</p>` : '') : '') +
    `<div class="acts"><button type="button" class="btn primary" data-go="storymap">Zur Karte</button><button type="button" class="btn" data-go="again">Nochmal</button></div></div>`;
  document.body.appendChild(el);
  if (w) { let k = 0; const iv = setInterval(() => { Particles.burst(Math.random() * innerWidth, innerHeight * 0.25, 18, 1.4); if (++k > 4) clearInterval(iv); }, 280); }
}

/* ================= Eingaben ================= */
function go(a) {
  switch (a) {
    case 'continue': continueGame(); break;
    case 'setup': show('setup'); break;
    case 'story': show('story'); break;
    case 'storymap': $$('.endov').forEach(x => x.remove()); closeAllSheets(); if (GAME_ON && S && S.scn && S.winner == null) { TOKEN++; } if (S && S.scn) GAME_ON = false; STACK.length = 0; STACK.push('title'); setScreen('story'); break;
    case 'start': startNewGame(); break;
    case 'rules': closeAllSheets(); show('rules'); break;
    case 'cards': closeAllSheets(); show('cards'); break;
    case 'quiz': UI.q = null; show('quiz'); break;
    case 'profile': show('profile'); break;
    case 'settings': closeAllSheets(); show('settings'); break;
    case 'pause': openSheet({id: 'pause'}); break;
    case 'resume': closeAllSheets(); break;
    case 'menu': $$('.endov').forEach(x => x.remove()); closeAllSheets(); STACK.length = 0; setScreen('title'); break;
    case 'again': $$('.endov').forEach(x => x.remove()); closeAllSheets(); if (STORY_RUN && S && S.scn) { startStation(STORY_RUN.st); break; } GAME_ON = false; startNewGame(); break;
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
  if (t.closest('.btn,.iconbtn,.chip,.seg button,.switch,.oc,.mstat,.rcchip,.oitem,.ptbtn,.side,.art,.pf-pt,.pf-fr,.pickbtn')) { Snd.sfx('tap'); buzz(8); }
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
  if ((el = t.closest('[data-cursepick]'))) {
    const sh = topSheet(), c = sh && sh.id === 'curse' && findCard(sh.uid), x = c && curseTargets(c).find(([p]) => p.id === +el.dataset.cursepick);
    closeAllSheets();
    if (!x) { toast('Den Fluch kannst du gerade nicht ausspielen.'); return; }
    Snd.sfx('play'); buzz(15);
    try { x[1].fn(); } catch (err) { if (err !== STALE) console.error(err); }
    render(); return;
  }
  if ((el = t.closest('[data-cact]'))) { const a = UI.cardActs[+el.dataset.cact]; if (a && a.fn && !a.dis) { popSheet(); try { a.fn(); } catch (err) { if (err !== STALE) console.error(err); } render(); } return; }
  if ((el = t.closest('[data-sel]'))) { if (UI.sel) { const v = el.dataset.sel; UI.sel.done(v === 'ok' ? [...UI.sel.picked] : null); } return; }
  if ((el = t.closest('[data-opp]'))) { openSheet({id: 'opp', pid: +el.dataset.opp}); return; }
  if ((el = t.closest('[data-sheetclose]'))) { if (!(topSheet() && topSheet().id === 'sel')) closeAllSheets(); return; }
  if ((el = t.closest('[data-sheetback]'))) { popSheet(); return; }
  if ((el = t.closest('[data-back]'))) { back(); return; }
  if ((el = t.closest('[data-go]'))) { go(el.dataset.go); return; }
  if ((el = t.closest('.seg[data-set] button.locked'))) { toast('Schaltest du frei, wenn du im Storymodus Welt 2 abschließt.'); buzz(30); return; }
  if ((el = t.closest('.seg[data-set] button'))) { const k = el.parentElement.dataset.set; SET[k] = isNaN(+el.dataset.v) ? el.dataset.v : +el.dataset.v; saveSettings(); renderControls(); return; }
  if ((el = t.closest('[data-toggle]'))) { const k = el.dataset.toggle; SET[k] = !SET[k]; saveSettings(); renderControls(); if (k === 'music' && SET.music) { Snd.unlock(); Snd.startMusic(); } if (CUR === 'game') render(); return; }
  if ((el = t.closest('[data-portrait]'))) { if (el.classList.contains('locked')) { toast(cosmeticSource('portrait:' + el.dataset.portrait)); return; } PROFILE.portrait = el.dataset.portrait; saveProfile(); renderProfile(); return; }
  if ((el = t.closest('[data-frame]'))) { if (el.classList.contains('locked')) { toast(cosmeticSource('frame:' + el.dataset.frame)); return; } PROFILE.frame = el.dataset.frame; saveProfile(); renderProfile(); return; }
  if ((el = t.closest('[data-title]'))) { if (el.classList.contains('locked')) { toast('Schaltest du im Storymodus frei.'); return; } PROFILE.title = el.dataset.title; saveProfile(); renderProfile(); return; }
  if ((el = t.closest('[data-station]'))) { openStation(el.dataset.station); return; }
  if ((el = t.closest('[data-story-start]'))) { startStation(el.dataset.storyStart); return; }
  if ((el = t.closest('[data-story-choice]'))) { pickChoice(el.dataset.storyChoice); return; }
  if ((el = t.closest('[data-buy]'))) { buyItem(el.dataset.buy); return; }
  if ((el = t.closest('[data-storyclose]'))) { closeAllSheets(); return; }
  if ((el = t.closest('[data-deck]'))) { selectDeck(el.dataset.deck); return; }
  if ((el = t.closest('[data-variant]'))) { selectVariant(el.dataset.variant); return; }
  if ((el = t.closest('[data-dk]'))) { setDeckCount(+el.dataset.dk, +el.dataset.d); Snd.sfx(+el.dataset.d > 0 ? 'deal' : 'tap', .6); return; }
  if ((el = t.closest('[data-kf]'))) { UI.kfilter = el.dataset.kf; renderCards(); const sc = $('#scr-cards .content'); sc.scrollTop = Math.min(sc.scrollTop, $('#deck-panel').offsetHeight + 6); return; }
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
      acts.forEach(a => I.push({zones: ['table'], label: a.l.replace(/^Benutzen: /, ''), run: a.fn, dis: a.dis, sub: c.k === 'item' && !a.dis ? equipSub(me(), c) : ''})); break;
    case 'oneshot':
      acts.forEach(a => { const mon = /Monster/.test(a.l), z = [mon ? 'monside' : 'fighter']; if (a.kind === 'primary') z.push('table'); I.push({zones: z, label: a.l, run: a.fn, dis: a.dis, pv: c.b ? {side: mon ? 'm' : 'p', b: {l: c.n, v: mon ? c.b : osP(c, C)}} : null}); }); break;
    case 'enh':
      if (C) acts.forEach((a, i) => { const m = C.mons[i]; if (!m) return; const z = ['art:' + m.c.uid]; if (C.mons.length === 1) z.push('table', 'monside'); I.push({zones: z, label: a.l.replace(' spielen', ''), run: a.fn, dis: a.dis, pv: {mon: m, e: {n: c.n, v: c.v}}}); });
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
    case 'curse': {
      /* direkt auf einen Gegner oben, oder irgendwo aufs Spielfeld und danach das Ziel wählen */
      const ts = [];
      acts.forEach(a => { const t = S.players.find(x => !x.human && a.l === `Auf ${x.name} spielen`); if (t) { ts.push([t, a]); I.push({zones: ['opp:' + t.id], label: `Fluch auf ${t.name}`, run: a.fn}); } });
      if (ts.length === 1) I.push({zones: ['table'], label: `Fluch auf ${ts[0][0].name}`, run: ts[0][1].fn});
      else if (ts.length > 1) I.push({zones: ['table'], label: 'Fluch spielen: Ziel wählen', run: () => openSheet({id: 'curse', uid: c.uid}), sheet: true});
      break;
    }
  }
  return I;
}
const Drag = (() => {
  let st = null;
  const TH = 10;
  function zoneAt(x, y) {
    if (st && st.split) {
      const t = $('#table'), r = t && t.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        const left = x < r.left + r.width / 2;
        return {key: left ? 'fighter' : 'monside', el: st.ov && st.ov.querySelector(left ? '.dh.me' : '.dh.mon')};
      }
    }
    const el = document.elementFromPoint(x, y); if (!el) return null;
    let z;
    if ((z = el.closest('.oc[data-opp]'))) return {key: 'opp:' + z.dataset.opp, el: z};
    if ((z = el.closest('#table .side.me'))) return {key: 'fighter', el: z};
    if ((z = el.closest('#table .side.mon'))) return {key: 'monside', el: z};
    if ((z = el.closest('#table .art[data-uid]'))) return {key: 'art:' + z.dataset.uid, el: z, art: true};
    if ((z = el.closest('#table'))) return {key: 'table', el: z};
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
    st.split = !!(S.combat && keys.has('fighter') && keys.has('monside') && $('#table'));
    if (st.split) { st.ov = splitOverlay(st.intents); $('#table').classList.add('splitting'); }
    else keys.forEach(k => zoneEls(k).forEach(z => { if (z) { z.classList.add('dz'); st.marked.push(z); } }));
    Snd.sfx('deal', 0.6); buzz(10);
  }
  function move(x, y) {
    const dx = x - st.x0;
    st.g.style.transform = `translate(${x - st.offX}px, ${y - st.offY}px) rotate(${Math.max(-8, Math.min(8, dx / 25))}deg) scale(1.08)`;
    const zone = zoneAt(x, y), it = intentFor(zone);
    if (st.hover !== (zone && zone.el)) { if (st.hover) st.hover.classList.remove('dzh'); st.hover = zone && it ? zone.el : null; if (st.hover) st.hover.classList.add('dzh'); }
    st.zone = zone; st.it = it;
    const pv = it && !it.dis && it.pv ? it.pv : null;
    if (pv !== UI.pv) setPv(pv);
    const txt = it ? it.label : '', key = txt + '|' + (it && it.sub || '');
    if (st.labKey !== key) { st.labKey = key; st.lab.innerHTML = esc(txt) + (it && it.sub ? `<small>${esc(it.sub)}</small>` : ''); }
    st.lab.classList.toggle('show', !!txt && !st.split);
    st.lab.classList.toggle('no', !!(it && it.dis));
  }
  function setPv(pv) { UI.pv = pv; const hud = $('#table .hud'); if (hud && S && S.combat) paintHud(hud, S.combat); }
  function splitOverlay(intents) {
    const C = S.combat, inMine = C.f === 0 || C.h === 0;
    const who = inMine ? (C.h != null ? 'Für euch' : 'Für dich') : `Für ${P(C.f).name}`;
    const pts = [P(C.f), C.h != null ? P(C.h) : null].filter(Boolean).map(p => `<img${p.human ? ' class="me"' : ''} src="${portrait(p)}" alt="">`).join('');
    const half = (z, cls, lbl, img) => { const it = intents.find(i => i.zones.includes(z)); const v = it && it.pv && it.pv.b ? sign(it.pv.b.v) : '';
      return `<div class="dh ${cls}${it && it.dis ? ' no' : ''}"><span class="dh-who">${img}${esc(lbl)}</span>${v ? `<b class="dh-b">${v}</b>` : ''}</div>`; };
    const el = document.createElement('div'); el.className = 'dsplit';
    el.innerHTML = half('fighter', 'me', who, `<span class="dh-pts">${pts}</span>`) + half('monside', 'mon', C.mons.length > 1 ? 'Für die Monster' : 'Für das Monster', `<span class="dh-pts">${C.mons.map(m => `<img src="${ART[m.c.n] || ART_FALLBACK}" alt="">`).join('')}</span>`);
    $('#table').appendChild(el);
    return el;
  }
  function cleanup() {
    if (!st) return;
    if (st.ov) { const ov = st.ov; ov.classList.add('out'); setTimeout(() => ov.remove(), 160); const t = $('#table'); if (t) t.classList.remove('splitting'); }
    if (UI.pv) setPv(null);
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
    let it = s0.it; const g = s0.g;
    st = null;
    /* Hat sich die Lage während des Ziehens geändert (Kampf vorbei, Fenster zu), zählt die alte Aktion nicht mehr */
    if (it && !it.dis && e.type !== 'pointercancel') { const k = it.zones.join(); it = dragIntents(s0.c).find(i => i.label === it.label && i.zones.join() === k) || null; if (!it) { flyBack(g, s0.r); toast('Zu spät, die Lage hat sich gerade geändert.'); return; } }
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
    if (!it.sheet) { Snd.sfx('play'); buzz(15); }
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
applyProfile();
setScreen('title');
const tap = $('#tapstart');
tap.hidden = false;
{ let raf = 0; $('#scr-cards .content').addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; updFilterStuck(); }); }, {passive: true}); }
tap.addEventListener('click', () => { Snd.unlock(); Snd.startMusic(); tap.hidden = true; Snd.sfx('page'); });
document.addEventListener('pointerdown', () => Snd.unlock(), {once: true});

