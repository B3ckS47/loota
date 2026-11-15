'use strict';
/* ================= Storymodus: Welten, Stationen, Fortschritt =================
   Nur Daten und Logik, keine Oberfläche. ui.js zeichnet Karte, Blätter und Ergebnis.
   Eine Station beschreibt ihr Szenario (scn) so, wie es die Engine als SCN erwartet. */
const K_STORY = 'loota.story';

// Freischaltbare Optik. Rahmenfarben und Porträts übernimmt der Charakter-Bildschirm.
const COSMETICS = {
  title: {
    neuling: 'Neuling',
    stammgast: 'Stammgast',
    brueckenbezwinger: 'Brückenbezwinger',
    montagsheld: 'Montagsheld',
    kellerkind: 'Kellerkind',
    geisterjaeger: 'Geisterjäger',
    fassfluesterer: 'Fassflüsterer',
    rattenschreck: 'Rattenschreck'
  },
  frame: {
    kupferkessel: {n: 'Kupferkessel', c: '#c8773a'},
    moewenfeder: {n: 'Möwenfeder', c: '#e9eef2'},
    rattengrau: {n: 'Rattengrau', c: '#8b9096'},
    kerzenwachs: {n: 'Kerzenwachs', c: '#f1e2b8'},
    goldkronkorken: {n: 'Goldener Kronkorken', c: '#e8b923'}
  },
  portrait: {
    gartenzwerg: {n: 'Gartenzwerg', src: 'icons/portrait-gartenzwerg.png'},
    rentner: {n: 'Rentner-Ritter', src: 'icons/portrait-rentner.png'},
    rosi: {n: 'Ratte Rosi', src: 'icons/portrait-rosi.png'}
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
  id: 'w1', n: 1, name: 'Rund um die Taverne', face: 'icons/portrait-hilde.png', deck: 'grund', mapH: 1000, map: 'art/karte-welt1.webp', mapRatio: 768 / 1376,
  intro: 'Du bist neu in der Taverne. Berta, Kalle und Uschi sitzen jeden Abend am Stammtisch und lachen über jeden Neuen. Wirtin Hilde zwinkert dir zu: „Willst du dir einen Namen machen? Das Städtchen hat Plagen genug. Fang im Garten an.“',
  outro: 'Der Drache trollt sich, das Städtchen atmet auf. Am Stammtisch ist plötzlich ein Stuhl für dich frei. Da ruft Hilde aus der Küche: „Das Bier ist alle! Und aus dem Keller kommen komische Geräusche …“',
  landmarks: [['Taverne', 50, 22], ['Garten', 80, 92], ['Hafen', 88, 312], ['Autobahnbrücke', 5, 548], ['Rathaus', 5, 604], ['Flohmarkt', 95, 604], ['Drachenhöhle', 95, 862]],
  stations: [
    {id: 'w1s0', face: 'icons/portrait-hilde.png', ax: 80, ay: 7, no: '0', type: 'tutorial', name: 'Hildes Probespiel', place: 'Taverne',
      text: 'Bevor du dich mit dem Stammtisch anlegst, winkt dich Hilde an einen freien Tisch: „Komm, ich zeig dir erst mal, wie das hier läuft. Berta spielt mit, die ist heute ganz friedlich.“',
      goal: 'Eine kurze Übungspartie gegen Berta bis Stufe 4. Hilde erklärt dir dabei jeden Schritt.',
      scn: {tut: true, target: 4, bots: ['Berta'], diff: 'gemuetlich',
        start: {lvl: 1, hand: ['Rostiges Schwert', 'Trank der Tapferkeit', 'Wütender Gartenzwerg'], deal: false},
        botStart: {Berta: {lvl: 1, eq: ['Riesenhammer', 'Hörnerhelm'], deal: false}},
        botStyles: {Berta: {help: 3, curse: 0, intf: 0, l: 'im Probespiel ganz friedlich'}},
        perks: {freeHelp: 'Berta', always: true, why: 'Für dich doch immer!'},
        // Reihenfolge der Züge: du, Berta (Tür + Raum durchsuchen), du, …
        deck: {door: ['Schleimige Socke', 'Krieger', 'Halbling', 'Elf', 'Zauberer', 'Priester', 'Pechsträhne', 'Windböe', 'Krieger', 'Halbling', 'Pilzkönig', 'Zauberer', 'Priester', 'Troll unter der Autobahnbrücke'],
          tr: ['Topfhelm mit Delle', 'Schnelle Latschen', 'Lederschürze', 'Gusseiserne Bratpfanne', 'Glücksumhang', 'Flasche Drachenschnaps', 'Protzige Goldkette']}},
      winText: 'Hilde klatscht in die Hände: „Na also! Jetzt kennst du die Grundlagen. Ab hier sage ich nichts mehr, das schaffst du allein. Alles Weitere steht in den Regeln.“',
      reward: 'title:neuling'},
    {id: 'w1s1', req: ['w1s0'], face: 'icons/portrait-hilde.png', ax: 72.9, ay: 19.6, no: '1', x: 50, y: 90, type: 'puzzle', name: 'Ärger im Beet', place: 'Garten',
      text: 'Hildes Gartenzwerg ist schon wieder stinksauer und bewacht das Kräuterbeet mit dem Rechen. „Ich brauche Petersilie“, seufzt Hilde. „Und zwar heute.“',
      goal: 'Besiege den stinksauren Wütenden Gartenzwerg (Kampfstärke 6). Du hast Stufe 2, eine Bratpfanne und drei Karten auf der Hand.',
      scn: {fight: {mons: ['Wütender Gartenzwerg'], enh: ['Stinksauer']}, start: {lvl: 2, eq: ['Gusseiserne Bratpfanne'], hand: ['Winzig', 'Trank der Tapferkeit', 'Riesenböller'], deal: false}, bots: []},
      extras: [{t: 'Mit nur einer Karte gewinnen', ok: st => st.played <= 1}, {t: 'Den Riesenböller behalten', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Riesenböller')}],
      reward: 'title:stammgast'},
    {id: 'w1s2', luck: 0.55, face: 'icons/portrait-kalle.png', ax: 48.2, ay: 11.6, no: '2', x: 28, y: 200, type: 'duel', name: 'Kalle prahlt', place: 'Stammtisch', req: ['w1s1'],
      text: 'Kalle lehnt sich zurück: „Eine Runde, du und ich. Wer zuerst Stufe 5 hat, zahlt die Zeche nicht.“ Er grinst, als hätte er schon gewonnen.',
      goal: '1 gegen 1 gegen Kalle: Erreiche Stufe 5 vor ihm.',
      scn: {target: 5, bots: ['Kalle'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}],
      reward: 'frame:kupferkessel'},
    {id: 'w1s3', face: 'art/monster-uebellaunige-moewe.webp', ax: 55.3, ay: 32.3, no: '3', x: 66, y: 310, type: 'event', name: 'Die Möwe am Hafen', place: 'Hafen', req: ['w1s2'],
      text: 'Am Hafen sitzt die Übellaunige Möwe auf einem Poller, Bertas Hörnerhelm im Schnabel. Mit einem Stück Brot lockst du sie weg. Jetzt hältst du den Helm in der Hand.',
      goal: 'Entscheide, was mit dem Helm passiert. Das wirkt sich auf die nächste Station aus.',
      choices: [
        {v: 'return', l: 'Berta den Helm zurückgeben', d: 'Berta hilft dir in Station 4 einmal, ohne dass du ihr etwas anbieten musst.'},
        {v: 'keep', l: 'Den Hörnerhelm behalten', d: 'Du startest Station 4 mit dem Hörnerhelm (+2).'},
        {v: 'sell', l: 'Den Helm verkaufen', d: 'Du bekommst 30 Münzen.', coins: 30}
      ]},
    {id: 'w1s4', luck: 0.3, face: 'icons/portrait-uschi.png', ax: 21.5, ay: 33.1, no: '4', x: 34, y: 420, type: 'duel', name: 'Kartenrunde am Ufer', place: 'Seeufer', req: ['w1s3'],
      text: 'Am Seeufer haben Berta und Uschi einen Klapptisch aufgestellt. „Mal sehen, ob du auch gegen zwei bestehst“, sagt Uschi und mischt verdächtig gut.',
      goal: 'Gegen Berta und Uschi: Erreiche vor den beiden Stufe 6.',
      scn: story => ({target: 6, bots: ['Berta', 'Uschi'], diff: 'gemuetlich',
        start: story.choice.w1s3 === 'keep' ? {eq: ['Hörnerhelm']} : undefined,
        perks: story.choice.w1s3 === 'return' ? {freeHelp: 'Berta', why: 'Du hast mir meinen Helm zurückgebracht. Ehrensache!'} : undefined}),
      extras: [{t: 'Nie Hilfe annehmen', ok: st => !st.help}, {t: 'Höchstens 1 Fluch abbekommen', ok: st => st.curses <= 1}]},
    {id: 'w1s5', face: 'art/monster-troll-unter-der-autobahnbruecke.webp', ax: 50.8, ay: 44.0, no: '5', x: 68, y: 530, type: 'puzzle', name: 'Maut unter der Brücke', place: 'Autobahnbrücke', req: ['w1s4'],
      text: 'Unter der Autobahnbrücke verlangt ein Troll Maut. Zwerge kann er nicht ausstehen, und du bist heute leider einer.',
      goal: 'Besiege den Troll unter der Autobahnbrücke (Stufe 9, gegen Zwerge +3). Du bist Zwerg auf Stufe 5 mit Stahlkappenstiefeln und Hellebarde.',
      scn: {fight: {mons: ['Troll unter der Autobahnbrücke']}, start: {lvl: 5, race: 'Zwerg', eq: ['Stahlkappenstiefel', 'Hellebarde mit Wimpel'], hand: ['Trank der Tapferkeit', 'Stinkbombe', 'Krieger'], deal: false}, bots: []},
      extras: [{t: 'Ohne Einmal-Gegenstand', ok: st => !st.os}, {t: 'Ohne eine Karte auszuspielen', ok: st => !st.played}],
      reward: 'title:brueckenbezwinger'},
    {id: 'w1s6a', luck: 0.2, face: 'art/monster-buerokratie-golem.webp', ax: 22.8, ay: 64.0, no: '6a', x: 25, y: 650, type: 'duel', name: 'Ein Tag im Amt', place: 'Rathaus', hard: true, req: ['w1s5'],
      text: 'Im Rathaus stapeln sich die Formulare bis unter die Decke. Bürokratie-Golem und Steuerprüfer-Gespenst warten schon, und Berta, Kalle und Uschi wollen auch einen Stempel.',
      goal: 'Gegen alle drei, mit doppelt so vielen Flüchen im Deck: Erreiche Stufe 7. Hier gibt es doppelte Münzen.',
      scn: {target: 7, bots: ['Berta', 'Kalle', 'Uschi'], variant: 'fluchchaos', diff: 'normal'}, coinMul: 2,
      extras: [{t: 'In weniger als 15 Runden', ok: (st, S) => S.turn < 15}, {t: 'Höchstens 2 Flüche abbekommen', ok: st => st.curses <= 2}]},
    {id: 'w1s6b', luck: 0.3, face: 'icons/portrait-kalle.png', ax: 79.4, ay: 62.5, no: '6b', x: 75, y: 650, type: 'duel', name: 'Flohmarkt', place: 'Flohmarkt', easy: true, req: ['w1s5'],
      text: 'Auf dem Flohmarkt verkauft Kalle angeblich echte Heldenausrüstung. Ihr spielt um seinen Stand.',
      goal: 'Gegen Kalle: Erreiche Stufe 6.',
      scn: {target: 6, bots: ['Kalle'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}]},
    {id: 'w1s7', ax: 51.4, ay: 77.0, no: '7', x: 50, y: 770, type: 'shop', name: 'Rast im Gasthof', place: 'Gasthof', reqAny: ['w1s6a', 'w1s6b'],
      text: 'Kurz vor der Drachenhöhle steht ein kleiner Gasthof. Der Wirt zeigt auf ein Regal voller Kram: „Für ein paar Münzen ist alles zu haben. Wer weiß, ob du wiederkommst.“',
      goal: 'Tausche Münzen gegen Rahmen und Porträts. Danach geht es zum Drachen.',
      shop: [{id: 'frame:moewenfeder', price: 30}, {id: 'portrait:gartenzwerg', price: 40}, {id: 'portrait:rentner', price: 40}], onward: 'Weiter zum Drachen'},
    {id: 'w1s8', luck: 0.25, face: 'art/monster-drache-des-montagmorgens.webp', ax: 80.7, ay: 90.8, no: '8', x: 50, y: 895, type: 'boss', name: 'Der Drache des Montagmorgens', place: 'Drachenhöhle', req: ['w1s7'],
      text: 'Jeden Montag legt der Drache das Städtchen lahm: kein Kaffee, keine Laune, kein Durchkommen. Heute stellst du dich ihm. Die drei vom Stammtisch wollen den Ruhm natürlich selbst.',
      goal: 'Gegen Berta, Kalle und Uschi. Der Drache steckt in der unteren Hälfte des Türstapels und ist montags noch nicht ganz wach: Stufe 13 statt 16. Wer ihn besiegt, gewinnt. Besiegt ihn jemand anderes, hast du verloren. Stufe 10 gewinnt wie gewohnt.',
      scn: {target: 10, bots: ['Berta', 'Kalle', 'Uschi'], boss: 'Drache des Montagmorgens', bossLvl: 13, diff: 'normal'},
      extras: [{t: 'Den Drachen selbst besiegen', ok: st => st.bossBy === 0}, {t: 'Nie Hilfe annehmen', ok: st => !st.help}],
      reward: 'title:montagsheld', final: true}
  ],
  finalTitle: 'Der Drache ist besiegt!'
}, {
  id: 'w2', n: 2, name: 'Der Tavernenkeller', face: 'icons/portrait-hilde.png', deck: 'keller', table: 'keller', theme: 'keller', map: 'art/karte-welt2.webp', mapRatio: 768 / 1376,
  // solange Welt 1 offen ist: im Nebel zu erahnen (Punkte in Prozent der oberen 55 % des Bildes)
  fog: {show: 0.55, teaser: [[49.9, 30.5], [17.5, 43.1], [36.7, 69.3]], hint: 'Besiege den Drachen des Montagmorgens, dann geht es hinab.'},
  intro: 'Das Bier ist alle, und aus dem Keller kommen seltsame Geräusche. Hilde drückt dir eine Laterne in die Hand: „Unten hat sich Rattenkönig Rüdiger zum Herrscher ausgerufen. Seitdem spielen alle da unten nach seinen Regeln. Hol mir mein Bier zurück!“ Am Stammtisch wetten Berta, Kalle und Uschi schon, ob du überhaupt wiederkommst.',
  outro: 'Rüdiger rückt seinen Kronkorken gerade und gibt sich geschlagen. Hilde bekommt ihr Bier, der Stammtisch zahlt die Wettschulden. Hinter dem Thron entdeckst du einen schmalen Tunnel. Es riecht nach Moos und Pilzen …',
  unlocks: ['das Keller-Deck', 'die Tischfläche „Kellergewölbe“', 'die Kellermusik'],
  starReward: {n: 18, id: 'frame:goldkronkorken'},
  finalTitle: 'Rüdiger ist besiegt!',
  stations: [
    {id: 'w2s1', face: 'art/monster-staubmaus-bande.webp', ax: 49.9, ay: 16.8, no: '1', type: 'puzzle', name: 'Die Kellertreppe', place: 'Kellertreppe', req: ['w1s8'],
      text: 'Unten an der Kellertreppe raschelt es. Auf der letzten Stufe hockt eine Staubmaus-Bande, zu dritt und stinksauer, weil du ihnen mit der Laterne ins Gesicht leuchtest.',
      goal: 'Besiege die stinksaure Staubmaus-Bande (Kampfstärke 6). Du hast Stufe 2, eine Kellerlaterne und drei Karten auf der Hand.',
      scn: {fight: {mons: ['Staubmaus-Bande'], enh: ['Stinksauer']}, start: {lvl: 2, eq: ['Kellerlaterne'], hand: ['Mausefalle', 'Trank der Tapferkeit', 'Riesenböller'], deal: false}, bots: []},
      extras: [{t: 'Mit nur einer Karte gewinnen', ok: st => st.played <= 1}, {t: 'Den Riesenböller behalten', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Riesenböller')}],
      reward: 'title:kellerkind'},
    {id: 'w2s2', luck: 0.35, face: 'icons/portrait-rosi.png', ax: 17.5, ay: 23.7, no: '2', type: 'duel', name: 'Rosi will spielen', place: 'Fässerecke', req: ['w2s1'],
      text: 'Zwischen den Fässern sitzt Ratte Rosi, Rüdigers vorlaute Nichte, und mischt Karten mit dem Schwanz. „Du willst zu meinem Onkel? Erst gegen mich. Und glaub ja nicht, dass ich dir jemals helfe.“',
      goal: '1 gegen 1 gegen Ratte Rosi, mit dem Keller-Deck: Erreiche Stufe 5 vor ihr.',
      scn: {target: 5, bots: ['Rosi'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}],
      reward: 'frame:rattengrau'},
    {id: 'w2s3', face: 'icons/portrait-fridolin.png', ax: 36.7, ay: 38.1, via: {w2s2: [[15.5, 31], [22, 37.5]]}, no: '3', type: 'event', name: 'Das sprechende Fass', place: 'Fasslager', req: ['w2s2'],
      text: 'Ein dickes Bierfass räuspert sich: „Fass Fridolin, sehr erfreut. Du willst in den Vorratsraum? Da spielen Rosi und ich heute Karten. Ich mach dir ein Angebot, unter Kellerleuten.“',
      goal: 'Nimm eines von Fridolins Angeboten an. Es wirkt sich auf die nächste Station aus.',
      choices: [
        {v: 'shield', l: 'Den Fassdeckel-Schild nehmen', d: 'Du startest Station 4 mit dem Fassdeckel-Schild (+2, gegen Untote +4).'},
        {v: 'help', l: 'Fridolins Hilfe annehmen', d: 'Fridolin hilft dir in Station 4 einmal, ohne Schätze zu verlangen.'},
        {v: 'coins', l: 'Die 30 Münzen nehmen', d: 'Du bekommst 30 Münzen.', coins: 30}
      ]},
    {id: 'w2s4', luck: 0.25, face: 'icons/portrait-fridolin.png', ax: 80.8, ay: 37.9, no: '4', type: 'duel', name: 'Kartenrunde im Vorratsraum', place: 'Vorratsraum', req: ['w2s3'],
      text: 'Zwischen Kartoffelsäcken und Schatztruhen haben Rosi und Fridolin einen Tisch aus Kisten gebaut. „Wer zuerst Stufe 6 hat, kriegt die Truhe“, quiekt Rosi. Fridolin gluckert zustimmend.',
      goal: 'Gegen Rosi und Fridolin: Erreiche als Erster Stufe 6.',
      scn: story => ({target: 6, bots: ['Rosi', 'Fridolin'], diff: 'gemuetlich',
        start: story.choice.w2s3 === 'shield' ? {eq: ['Fassdeckel-Schild']} : undefined,
        perks: story.choice.w2s3 === 'help' ? {freeHelp: 'Fridolin', why: 'Abgemacht ist abgemacht. Einmal umsonst!'} : undefined}),
      extras: [{t: 'Nie Hilfe annehmen', ok: st => !st.help}, {t: 'Höchstens 1 Fluch abbekommen', ok: st => st.curses <= 1}]},
    {id: 'w2s5', face: 'icons/portrait-gustav.png', ax: 81.8, ay: 57.5, no: '5', type: 'puzzle', name: 'Gustavs Geisterstunde', place: 'Weinkeller', req: ['w2s4'],
      text: 'Im Weinkeller schlägt eine Uhr, die es gar nicht gibt. Gespenst Gustav, seit 300 Jahren gelangweilt, hat zwei Untote zum Spielen eingeladen und den Korkgeist schon mal stinksauer gemacht. „Endlich Unterhaltung“, gähnt er.',
      goal: 'Besiege Korkgeist und Steuerprüfer-Gespenst zusammen (Kampfstärke 13, beide untot). Du bist Priester auf Stufe 4 mit dem Fassdeckel-Schild: Kampfstärke 8 gegen Untote.',
      scn: {fight: {mons: ['Korkgeist', 'Steuerprüfer-Gespenst'], enh: ['Stinksauer']}, start: {lvl: 4, cls: 'Priester', eq: ['Fassdeckel-Schild'], hand: ['Knoblauchzopf', 'Trank der Tapferkeit', 'Winzig', 'Gummihuhn mit Quietsch', 'Ahnenforschung'], deal: false}, bots: []},
      extras: [{t: 'Den Knoblauchzopf behalten', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Knoblauchzopf')}, {t: 'Keine Karten abwerfen', ok: st => !st.discarded}],
      reward: 'title:geisterjaeger'},
    {id: 'w2s6a', luck: 0.1, face: 'icons/portrait-gustav.png', ax: 49.6, ay: 57.1, no: '6a', type: 'duel', name: 'Weinkeller', place: 'Weinkeller', hard: true, req: ['w2s5'],
      text: 'Tiefer im Weinkeller ist es kalt, und die Flaschen flüstern. Rosi und Gustav spielen hier ihre Lieblingsvariante, mit doppelt so vielen Flüchen. „Ich liebe Flüche“, kichert Rosi.',
      goal: 'Gegen Rosi und Gustav, mit doppelt so vielen Flüchen im Deck: Erreiche Stufe 7. Hier gibt es doppelte Münzen.',
      scn: {target: 7, bots: ['Rosi', 'Gustav'], variant: 'fluchchaos', diff: 'normal'}, coinMul: 2,
      extras: [{t: 'In weniger als 15 Runden', ok: (st, S) => S.turn < 15}, {t: 'Nie aus einem Kampf weglaufen', ok: st => !st.ran}]},
    {id: 'w2s6b', luck: 0.3, face: 'icons/portrait-fridolin.png', ax: 48.3, ay: 75.7, via: {w2s5: [[84, 66], [83, 77], [74, 80.5], [58, 80]]}, no: '6b', type: 'duel', name: 'Kartoffelkeller', place: 'Kartoffelkeller', easy: true, req: ['w2s5'],
      text: 'Im Kartoffelkeller riecht es nach Erde. Fridolin hat sich gemütlich zwischen die Säcke gerollt: „Eine ruhige Runde, nur wir zwei? Ich helfe dir sogar, gegen eine kleine Gebühr.“',
      goal: 'Gegen Fridolin: Erreiche Stufe 6.',
      scn: {target: 6, bots: ['Fridolin'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}]},
    {id: 'w2s7', ax: 19.4, ay: 82.3, via: {w2s6a: [[24, 58.5], [16, 64], [16, 75]]}, no: '7', type: 'shop', name: 'Rast beim Kellermeister', place: 'Kellermeister', reqAny: ['w2s6a', 'w2s6b'],
      text: 'Kurz vor dem Thronsaal hat der alte Kellermeister seinen Stand: Kerzenstummel, Korken und allerlei Krimskrams. „Für ein paar Münzen ist alles zu haben. Rüdiger zahlt ja nie.“',
      goal: 'Tausche Münzen gegen Rahmen, Titel und Porträts. Danach geht es zu Rüdiger.',
      shop: [{id: 'title:fassfluesterer', price: 30}, {id: 'frame:kerzenwachs', price: 40}, {id: 'portrait:rosi', price: 60}], onward: 'Weiter zu Rüdiger'},
    {id: 'w2s8', luck: 0.25, face: 'art/monster-rattenkoenig-ruediger.webp', ax: 49.2, ay: 90.4, no: '8', type: 'boss', name: 'Rüdigers Thronsaal', place: 'Thronsaal', req: ['w2s7'],
      text: 'Auf einem Thron aus Pfandkisten sitzt Rattenkönig Rüdiger, den Kronkorken schief auf dem Kopf. Rosi, Fridolin und Gustav sitzen schon am Tisch. „Wer mich besiegt, kriegt das Bier“, piepst Rüdiger. „Aber das schafft eh keiner.“',
      goal: 'Gegen Rosi, Fridolin und Gustav. Rüdiger steckt in der unteren Hälfte des Türstapels und ist nach dem Festmahl etwas träge: Stufe 13 statt 14. Wer ihn besiegt, gewinnt. Besiegt ihn jemand anderes, hast du verloren. Stufe 10 gewinnt wie gewohnt.',
      scn: {target: 10, bots: ['Rosi', 'Fridolin', 'Gustav'], boss: 'Rattenkönig Rüdiger', bossLvl: 13, diff: 'normal'},
      extras: [{t: 'Rüdiger selbst besiegen', ok: st => st.bossBy === 0}, {t: 'Ohne Hilfe gegen Rüdiger', ok: st => st.bossBy === 0 && !st.bossHelped}],
      reward: 'title:rattenschreck', final: true}
  ]
}];

// Welten, die noch kommen: auf der Karte im Nebel zu erahnen (map = späteres Musely-Bild)
// map fehlt noch: dann zeigt der Nebel eine schlichte Fläche. teaser in Prozent des sichtbaren Ausschnitts
const WORLDS_SOON = [
  {id: 'w3', n: 3, name: 'Der Pilzwald', map: null, ratio: 768 / 1376, show: 0.45, teaser: [[50, 30], [28, 52], [66, 74]],
    hint: 'Besiege Rattenkönig Rüdiger, dann führt ein Tunnel weiter.', soon: 'Folgt bald: Hinter Rüdigers Thron wartet der Pilzwald.'}
];
// Welten, die gerade offen sind: Welt 1 immer, jede weitere nach Abschluss der vorigen
const openWorlds = () => WORLDS.filter((w, i) => i === 0 || STORY.worlds[WORLDS[i - 1].id]);
const currentWorld = () => { const o = openWorlds(); return o[o.length - 1]; };
// Die erste noch verschlossene Welt, als Nebel-Teaser (echte Welt mit fog-Daten oder Vorschau)
function fogWorld() {
  const o = openWorlds(), w = WORLDS[o.length];
  if (w) return {id: w.id, n: w.n, name: w.name, map: w.map, ratio: w.mapRatio, show: w.fog.show, teaser: w.fog.teaser, hint: w.fog.hint, soon: w.fog.hint, near: false};
  const f = WORLDS_SOON[0]; return f ? Object.assign({near: !!STORY.worlds[o[o.length - 1].id]}, f) : null;
}

const STORY = (() => {
  let s = null;
  try { if (typeof localStorage !== 'undefined') s = JSON.parse(localStorage.getItem(K_STORY)); } catch (e) {}
  const base = {v: 1, done: {}, stars: {}, coins: 0, owned: [], choice: {}, worlds: {}, intro: {}, fails: {}};
  return Object.assign(base, s || {});
})();
function saveStory() { try { localStorage.setItem(K_STORY, JSON.stringify(STORY)); } catch (e) {} }

const allStations = () => WORLDS.flatMap(w => w.stations.map(st => Object.assign(st, {world: w.id})));
function stationById(id) { return allStations().find(st => st.id === id); }
function worldById(id) { return WORLDS.find(w => w.id === id); }
function stationUnlocked(st) {
  if (STORY.done[st.id]) return true;   // einmal geschafft, bleibt offen (auch wenn später eine Station davor dazukommt)
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
  // Verstecktes Glück: Grundwert der Station, dazu +0,1 je Niederlage dort (höchstens +0,4)
  const fails = Math.min(4, (STORY.fails || {})[st.id] || 0);
  if (st.luck || fails) scn.luck = Math.min(0.9, (st.luck || 0) + 0.1 * fails);
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
  STORY.stars[st.id] = merged;
  starReward(st.world, rewards);
  let worldDone = false;
  if (w) STORY.done[st.id] = true;
  STORY.fails = STORY.fails || {};
  if (!w && !STORY.done[st.id]) STORY.fails[st.id] = (STORY.fails[st.id] || 0) + 1;
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
  const rewards = []; starReward(st.world, rewards);
  saveStory();
  return {coins, rewards};
}
// Sterne-Belohnung einer Welt (z. B. Rahmen ab 18 Sternen)
function starReward(worldId, rewards) {
  const w = worldById(worldId), r = w && w.starReward;
  if (r && worldStars(w) >= r.n && grant(r.id)) rewards.push(r.id);
}
// Testmodus: eine Station als geschafft werten, mit allen Sternen, Belohnung und Münzen wie bei einem Sieg
function skipStation(st) {
  if (!st || STORY.done[st.id]) return;
  if (st.type === 'event') { chooseEvent(st, st.choices[0].v); return; }
  STORY.done[st.id] = true;
  if (st.type !== 'shop') {
    const stars = [true, ...(st.extras || []).map(() => true)], mul = st.coinMul || 1;
    STORY.stars[st.id] = stars; STORY.coins += (10 + 5 * stars.length) * mul;
    if (st.reward) grant(st.reward);
    if (st.final) STORY.worlds[st.world] = true;
    starReward(st.world, []);
  }
  saveStory();
}
// Testmodus: alles bis vor diese Station überspringen (frühere Welten und die Stationen davor)
function skipTo(st) {
  for (const w of WORLDS) {
    for (const x of w.stations) { if (x === st) return; if (!(x.easy && w.stations.some(y => y.hard && STORY.done[y.id]))) skipStation(x); }
  }
}
function resetStory() { Object.assign(STORY, {done: {}, stars: {}, coins: 0, owned: [], choice: {}, worlds: {}, intro: {}, fails: {}}); saveStory(); }
function visitShop(st) { if (!STORY.done[st.id]) { STORY.done[st.id] = true; saveStory(); } }
function buyCosmetic(item) {
  if (owns(item.id)) return 'owned';
  if (STORY.coins < item.price) return 'poor';
  STORY.coins -= item.price; grant(item.id); saveStory();
  return 'ok';
}
if (typeof module !== 'undefined') module.exports = {WORLDS, STORY, COSMETICS, scenarioFor, finishStation, chooseEvent, stationById, stationUnlocked, maxStars, openWorlds, worldStars, worldMaxStars};
