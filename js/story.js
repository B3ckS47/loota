'use strict';
/* ================= Storymodus: Welten, Stationen, Fortschritt =================
   Nur Daten und Logik, keine Oberfläche. ui.js zeichnet Karte, Blätter und Ergebnis.
   Eine Station beschreibt ihr Szenario (scn) so, wie es die Engine als SCN erwartet. */
const K_STORY = 'loota.story';

// Freischaltbare Optik. Rahmenfarben und Porträts übernimmt der Charakter-Bildschirm.
const COSMETICS = {
  title: {
    stammgast: 'Stammgast',
    brueckenbezwinger: 'Brückenbezwinger',
    montagsheld: 'Montagsheld'
  },
  frame: {
    kupferkessel: {n: 'Kupferkessel', c: '#c8773a'},
    moewenfeder: {n: 'Möwenfeder', c: '#e9eef2'}
  },
  portrait: {
    gartenzwerg: {n: 'Gartenzwerg', src: 'art/monster-wuetender-gartenzwerg.webp'},
    rentner: {n: 'Rentner-Ritter', src: 'art/monster-rentner-ritter.webp'}
  }
};
function cosmeticName(id) {
  const [k, key] = id.split(':'), c = COSMETICS[k] && COSMETICS[k][key];
  if (!c) return id;
  const kind = {title: 'Titel', frame: 'Rahmen', portrait: 'Porträt'}[k];
  return `${kind} „${typeof c === 'string' ? c : c.n}“`;
}

const storyWon = S => S.winner === 0;
const WORLDS = [{
  id: 'w1', n: 1, name: 'Rund um die Taverne', deck: 'grund', mapH: 1000, map: 'art/karte-welt1.webp', mapRatio: 768 / 1376,
  intro: 'Du bist neu in der Taverne. Berta, Kalle und Uschi sitzen jeden Abend am Stammtisch und lachen über jeden Neuen. Wirtin Hilde zwinkert dir zu: „Willst du dir einen Namen machen? Das Städtchen hat Plagen genug. Fang im Garten an.“',
  outro: 'Der Drache trollt sich, das Städtchen atmet auf. Am Stammtisch ist plötzlich ein Stuhl für dich frei. Da ruft Hilde aus der Küche: „Das Bier ist alle! Und aus dem Keller kommen komische Geräusche …“',
  landmarks: [['Taverne', 50, 22], ['Garten', 80, 92], ['Hafen', 88, 312], ['Autobahnbrücke', 5, 548], ['Rathaus', 5, 604], ['Flohmarkt', 95, 604], ['Drachenhöhle', 95, 862]],
  stations: [
    {id: 'w1s1', ax: 72.9, ay: 19.6, no: '1', x: 50, y: 90, type: 'puzzle', name: 'Ärger im Beet', place: 'Garten',
      text: 'Hildes Gartenzwerg ist schon wieder stinksauer und bewacht das Kräuterbeet mit dem Rechen. „Ich brauche Petersilie“, seufzt Hilde. „Und zwar heute.“',
      goal: 'Besiege den stinksauren Wütenden Gartenzwerg (Kampfstärke 6). Du hast Stufe 2, eine Bratpfanne und drei Karten auf der Hand.',
      scn: {fight: {mons: ['Wütender Gartenzwerg'], enh: ['Stinksauer']}, start: {lvl: 2, eq: ['Gusseiserne Bratpfanne'], hand: ['Winzig', 'Trank der Tapferkeit', 'Riesenböller'], deal: false}, bots: []},
      extras: [{t: 'Mit nur einer Karte gewinnen', ok: st => st.played <= 1}, {t: 'Den Riesenböller behalten', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Riesenböller')}],
      reward: 'title:stammgast'},
    {id: 'w1s2', ax: 48.2, ay: 11.6, no: '2', x: 28, y: 200, type: 'duel', name: 'Kalle prahlt', place: 'Stammtisch', req: ['w1s1'],
      text: 'Kalle lehnt sich zurück: „Eine Runde, du und ich. Wer zuerst Stufe 5 hat, zahlt die Zeche nicht.“ Er grinst, als hätte er schon gewonnen.',
      goal: '1 gegen 1 gegen Kalle: Erreiche Stufe 5 vor ihm.',
      scn: {target: 5, bots: ['Kalle'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}],
      reward: 'frame:kupferkessel'},
    {id: 'w1s3', ax: 55.3, ay: 32.3, no: '3', x: 66, y: 310, type: 'event', name: 'Die Möwe am Hafen', place: 'Hafen', req: ['w1s2'],
      text: 'Am Hafen sitzt die Übellaunige Möwe auf einem Poller, Bertas Hörnerhelm im Schnabel. Mit einem Stück Brot lockst du sie weg. Jetzt hältst du den Helm in der Hand.',
      goal: 'Entscheide, was mit dem Helm passiert. Das wirkt sich auf die nächste Station aus.',
      choices: [
        {v: 'return', l: 'Berta den Helm zurückgeben', d: 'Berta hilft dir in Station 4 einmal, ohne dass du ihr etwas anbieten musst.'},
        {v: 'keep', l: 'Den Hörnerhelm behalten', d: 'Du startest Station 4 mit dem Hörnerhelm (+2).'},
        {v: 'sell', l: 'Den Helm verkaufen', d: 'Du bekommst 30 Münzen.', coins: 30}
      ]},
    {id: 'w1s4', ax: 21.5, ay: 33.1, no: '4', x: 34, y: 420, type: 'duel', name: 'Kartenrunde am Ufer', place: 'Seeufer', req: ['w1s3'],
      text: 'Am Seeufer haben Berta und Uschi einen Klapptisch aufgestellt. „Mal sehen, ob du auch gegen zwei bestehst“, sagt Uschi und mischt verdächtig gut.',
      goal: 'Gegen Berta und Uschi: Erreiche vor den beiden Stufe 6.',
      scn: story => ({target: 6, bots: ['Berta', 'Uschi'], diff: 'gemuetlich',
        start: story.choice.w1s3 === 'keep' ? {eq: ['Hörnerhelm']} : undefined,
        perks: story.choice.w1s3 === 'return' ? {freeHelp: 'Berta'} : undefined}),
      extras: [{t: 'Nie Hilfe annehmen', ok: st => !st.help}, {t: 'Höchstens 1 Fluch abbekommen', ok: st => st.curses <= 1}]},
    {id: 'w1s5', ax: 50.8, ay: 44.0, no: '5', x: 68, y: 530, type: 'puzzle', name: 'Maut unter der Brücke', place: 'Autobahnbrücke', req: ['w1s4'],
      text: 'Unter der Autobahnbrücke verlangt ein Troll Maut. Zwerge kann er nicht ausstehen, und du bist heute leider einer.',
      goal: 'Besiege den Troll unter der Autobahnbrücke (Stufe 9, gegen Zwerge +3). Du bist Zwerg auf Stufe 5 mit Stahlkappenstiefeln und Hellebarde.',
      scn: {fight: {mons: ['Troll unter der Autobahnbrücke']}, start: {lvl: 5, race: 'Zwerg', eq: ['Stahlkappenstiefel', 'Hellebarde mit Wimpel'], hand: ['Trank der Tapferkeit', 'Stinkbombe', 'Krieger'], deal: false}, bots: []},
      extras: [{t: 'Ohne Einmal-Gegenstand', ok: st => !st.os}, {t: 'Ohne eine Karte auszuspielen', ok: st => !st.played}],
      reward: 'title:brueckenbezwinger'},
    {id: 'w1s6a', ax: 22.8, ay: 64.0, no: '6a', x: 25, y: 650, type: 'duel', name: 'Ein Tag im Amt', place: 'Rathaus', hard: true, req: ['w1s5'],
      text: 'Im Rathaus stapeln sich die Formulare bis unter die Decke. Bürokratie-Golem und Steuerprüfer-Gespenst warten schon, und Berta, Kalle und Uschi wollen auch einen Stempel.',
      goal: 'Gegen alle drei, mit doppelt so vielen Flüchen im Deck: Erreiche Stufe 7. Hier gibt es doppelte Münzen.',
      scn: {target: 7, bots: ['Berta', 'Kalle', 'Uschi'], variant: 'fluchchaos', diff: 'normal'}, coinMul: 2,
      extras: [{t: 'In weniger als 15 Runden', ok: (st, S) => S.turn < 15}, {t: 'Höchstens 2 Flüche abbekommen', ok: st => st.curses <= 2}]},
    {id: 'w1s6b', ax: 79.4, ay: 62.5, no: '6b', x: 75, y: 650, type: 'duel', name: 'Flohmarkt', place: 'Flohmarkt', easy: true, req: ['w1s5'],
      text: 'Auf dem Flohmarkt verkauft Kalle angeblich echte Heldenausrüstung. Ihr spielt um seinen Stand.',
      goal: 'Gegen Kalle: Erreiche Stufe 6.',
      scn: {target: 6, bots: ['Kalle'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}]},
    {id: 'w1s7', ax: 51.4, ay: 77.0, no: '7', x: 50, y: 770, type: 'shop', name: 'Rast im Gasthof', place: 'Gasthof', reqAny: ['w1s6a', 'w1s6b'],
      text: 'Kurz vor der Drachenhöhle steht ein kleiner Gasthof. Der Wirt zeigt auf ein Regal voller Kram: „Für ein paar Münzen ist alles zu haben. Wer weiß, ob du wiederkommst.“',
      goal: 'Tausche Münzen gegen Rahmen und Porträts. Danach geht es zum Drachen.',
      shop: [{id: 'frame:moewenfeder', price: 30}, {id: 'portrait:gartenzwerg', price: 40}, {id: 'portrait:rentner', price: 40}]},
    {id: 'w1s8', ax: 80.7, ay: 90.8, no: '8', x: 50, y: 895, type: 'boss', name: 'Der Drache des Montagmorgens', place: 'Drachenhöhle', req: ['w1s7'],
      text: 'Jeden Montag legt der Drache das Städtchen lahm: kein Kaffee, keine Laune, kein Durchkommen. Heute stellst du dich ihm. Die drei vom Stammtisch wollen den Ruhm natürlich selbst.',
      goal: 'Gegen Berta, Kalle und Uschi. Der Drache steckt in der unteren Hälfte des Türstapels und ist montags noch nicht ganz wach: Stufe 13 statt 16. Wer ihn besiegt, gewinnt. Besiegt ihn jemand anderes, hast du verloren. Stufe 10 gewinnt wie gewohnt.',
      scn: {target: 10, bots: ['Berta', 'Kalle', 'Uschi'], boss: 'Drache des Montagmorgens', bossLvl: 13, diff: 'normal'},
      extras: [{t: 'Den Drachen selbst besiegen', ok: st => st.bossBy === 0}, {t: 'Nie Hilfe annehmen', ok: st => !st.help}],
      reward: 'title:montagsheld', final: true}
  ]
}];

// Welten, die noch kommen: auf der Karte im Nebel zu erahnen (map = späteres Musely-Bild)
const WORLDS_SOON = [
  {id: 'w2', n: 2, name: 'Der Tavernenkeller', h: 330, map: null, teaser: [[50, 52], [27, 118], [70, 176]],
    hint: 'Besiege den Drachen des Montagmorgens, dann geht es hinab.', soon: 'Folgt bald: neue Karten, neue Gegner und ein Rattenkönig.'}
];

const STORY = (() => {
  let s = null;
  try { if (typeof localStorage !== 'undefined') s = JSON.parse(localStorage.getItem(K_STORY)); } catch (e) {}
  const base = {v: 1, done: {}, stars: {}, coins: 0, owned: [], choice: {}, worlds: {}, intro: {}};
  return Object.assign(base, s || {});
})();
function saveStory() { try { localStorage.setItem(K_STORY, JSON.stringify(STORY)); } catch (e) {} }

const allStations = () => WORLDS.flatMap(w => w.stations.map(st => Object.assign(st, {world: w.id})));
function stationById(id) { return allStations().find(st => st.id === id); }
function worldById(id) { return WORLDS.find(w => w.id === id); }
function stationUnlocked(st) {
  if (st.req && !st.req.every(r => STORY.done[r])) return false;
  if (st.reqAny && !st.reqAny.some(r => STORY.done[r])) return false;
  return true;
}
const maxStars = st => st.type === 'event' ? 1 : st.type === 'shop' ? 0 : 1 + (st.extras || []).length;
const starsOf = id => STORY.stars[id] || [];
const starNum = id => starsOf(id).filter(Boolean).length;
function worldStars(w) { return w.stations.reduce((n, st) => n + starNum(st.id), 0); }
function worldMaxStars(w) { return w.stations.reduce((n, st) => n + maxStars(st), 0); }
const owns = id => STORY.owned.includes(id);
function grant(id) { if (id && !owns(id)) { STORY.owned.push(id); return true; } return false; }

// Szenario für die Engine; variant wird von der Oberfläche in Stückzahlen übersetzt
function scenarioFor(st) {
  const raw = typeof st.scn === 'function' ? st.scn(STORY) : st.scn;
  const scn = Object.assign({id: st.id}, raw);
  Object.keys(scn).forEach(k => scn[k] === undefined && delete scn[k]);
  return scn;
}

// Ergebnis einer gespielten Station auswerten und speichern
function finishStation(st, S) {
  const w = storyWon(S), mul = st.coinMul || 1;
  const stars = [w, ...(st.extras || []).map(e => { try { return w && !!e.ok(S.stats || {}, S); } catch (err) { return false; } })];
  const old = starsOf(st.id), merged = stars.map((v, i) => v || !!old[i]);
  const fresh = merged.filter((v, i) => v && !old[i]).length;
  let coins = 0;
  if (w && !STORY.done[st.id]) coins += 10 * mul;
  coins += fresh * 5 * mul;
  const rewards = [];
  if (w && st.reward && grant(st.reward)) rewards.push(st.reward);
  let worldDone = false;
  if (w) STORY.done[st.id] = true;
  if (w && st.final && !STORY.worlds[st.world]) { STORY.worlds[st.world] = true; worldDone = true; }
  STORY.stars[st.id] = merged;
  STORY.coins += coins;
  saveStory();
  return {won: w, stars, fresh, coins, rewards, worldDone};
}
function chooseEvent(st, v) {
  const c = st.choices.find(x => x.v === v); if (!c || STORY.done[st.id]) return null;
  STORY.choice[st.id] = v; STORY.done[st.id] = true; STORY.stars[st.id] = [true];
  const coins = 5 + (c.coins || 0); STORY.coins += coins;
  saveStory();
  return {coins};
}
function visitShop(st) { if (!STORY.done[st.id]) { STORY.done[st.id] = true; saveStory(); } }
function buyCosmetic(item) {
  if (owns(item.id)) return 'owned';
  if (STORY.coins < item.price) return 'poor';
  STORY.coins -= item.price; grant(item.id); saveStory();
  return 'ok';
}
if (typeof module !== 'undefined') module.exports = {WORLDS, STORY, COSMETICS, scenarioFor, finishStation, chooseEvent, stationById, stationUnlocked, maxStars};
