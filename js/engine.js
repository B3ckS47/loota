'use strict';
const HEADLESS = typeof document === 'undefined';

/* ================= Karten (alle frei erfunden) ================= */
const MONSTERS = [
  {n:'Wütender Gartenzwerg',lvl:1,tr:1,x:2,bad:{t:'lvl',n:1},txt:'Verteidigt sein Beet mit dem Rechen.',badTxt:'Verliere 1 Stufe.'},
  {n:'Schleimige Socke',lvl:1,tr:1,x:2,bad:{t:'slot',s:'schuhe'},txt:'Lag drei Jahre unter dem Bett.',badTxt:'Verliere dein Schuhwerk.'},
  {n:'Schwarm Stechmücken',lvl:2,tr:1,vs:{race:'elf',val:2},bad:{t:'lvl',n:1},txt:'Lieben Elfenblut: +2 gegen Elfen.',badTxt:'Verliere 1 Stufe.'},
  {n:'Übellaunige Möwe',lvl:2,tr:1,x:2,bad:{t:'slot',s:'kopf'},txt:'Klaut Pommes und Helme.',badTxt:'Verliere deine Kopfbedeckung.'},
  {n:'Kellerassel XXL',lvl:3,tr:1,vs:{race:'halbling',val:3},bad:{t:'hand',n:2},txt:'Hält Halblinge für Snacks: +3 gegen Halblinge.',badTxt:'Wirf 2 zufällige Handkarten ab.'},
  {n:'Rentner-Ritter',lvl:4,tr:2,x:2,bad:{t:'slot',s:'ruestung'},txt:'Erzählt von früher. Stundenlang.',badTxt:'Verliere deine Rüstung.'},
  {n:'Steuerprüfer-Gespenst',lvl:4,tr:2,undead:true,bad:{t:'lvl',n:1},txt:'Untot. Prüft rückwirkend zehn Jahre.',badTxt:'Verliere 1 Stufe.'},
  {n:'Pilzkönig',lvl:5,tr:2,bad:{t:'best'},txt:'Hält Hof im Komposthaufen.',badTxt:'Verliere deinen besten Gegenstand.'},
  {n:'Vampir-Kaninchen',lvl:6,tr:2,undead:true,run:-1,bad:{t:'lvl',n:2},txt:'Untot und erschreckend schnell: Weglaufen −1.',badTxt:'Verliere 2 Stufen.'},
  {n:'Durchgedrehter Saugroboter',lvl:6,tr:2,bad:{t:'multi',l:[{t:'slot',s:'schuhe'},{t:'hand',n:2}]},txt:'Hat deine Schnürsenkel gefressen.',badTxt:'Verliere dein Schuhwerk und 2 Handkarten.'},
  {n:'Riesen-Nacktschnecke',lvl:7,tr:2,run:1,bad:{t:'multi',l:[{t:'slot',s:'schuhe'},{t:'lvl',n:1}]},txt:'Sehr, sehr langsam: Weglaufen +1.',badTxt:'Verliere dein Schuhwerk und 1 Stufe.'},
  {n:'Zombie-Hausmeister',lvl:8,tr:2,undead:true,bad:{t:'class'},txt:'Untot. Hat den Schlüssel zu jedem Raum.',badTxt:'Verliere deine Klasse. Hast du keine: 1 Stufe.'},
  {n:'Troll unter der Autobahnbrücke',lvl:9,tr:3,vs:{race:'zwerg',val:3},bad:{t:'lvl',n:2},txt:'Verlangt Maut. Mag keine Zwerge: +3 gegen Zwerge.',badTxt:'Verliere 2 Stufen.'},
  {n:'Bürokratie-Golem',lvl:10,tr:3,bad:{t:'hand',n:99},txt:'Besteht aus Formularen in dreifacher Ausfertigung.',badTxt:'Wirf deine gesamte Hand ab.'},
  {n:'Falsche Schatztruhe',lvl:11,tr:3,bad:{t:'multi',l:[{t:'best'},{t:'lvl',n:1}]},txt:'Sieht aus wie ein Schatz. Ist keiner.',badTxt:'Verliere deinen besten Gegenstand und 1 Stufe.'},
  {n:'Feuerspeiende Kaffeemaschine',lvl:12,tr:3,np:3,bad:{t:'multi',l:[{t:'slot',s:'kopf'},{t:'slot',s:'ruestung'}]},txt:'Verfolgt niemanden bis Stufe 3.',badTxt:'Verliere Kopfbedeckung und Rüstung.'},
  {n:'Hydra mit Migräne',lvl:14,tr:4,np:4,bad:{t:'lvl',n:3},txt:'Neun Köpfe, neunfache Kopfschmerzen. Verfolgt niemanden bis Stufe 4.',badTxt:'Verliere 3 Stufen.'},
  {n:'Drache des Montagmorgens',lvl:16,tr:4,up:2,np:5,bad:{t:'death'},txt:'Bringt 2 Stufen. Verfolgt niemanden bis Stufe 5.',badTxt:'Du bist tot.'},
  {n:'Lich mit Rückenschmerzen',lvl:18,tr:5,up:2,undead:true,np:5,bad:{t:'death'},txt:'Untot. Bringt 2 Stufen. Verfolgt niemanden bis Stufe 5.',badTxt:'Du bist tot.'}
];
const CURSES = [
  {n:'Pechsträhne',x:2,eff:{t:'lvl',n:1},txt:'Verliere 1 Stufe.'},
  {n:'Windböe',eff:{t:'slot',s:'kopf'},txt:'Verliere deine Kopfbedeckung.'},
  {n:'Rost',eff:{t:'slot',s:'ruestung'},txt:'Verliere deine Rüstung.'},
  {n:'Löcher in den Sohlen',eff:{t:'slot',s:'schuhe'},txt:'Verliere dein Schuhwerk.'},
  {n:'Identitätskrise',eff:{t:'class'},txt:'Verliere deine Klasse. Hast du keine: 1 Stufe.'},
  {n:'Ahnenforschung',eff:{t:'race'},txt:'Verliere deine Rasse. Du bist wieder Mensch.'},
  {n:'Taschendieb-Gnom',eff:{t:'hand',n:2},txt:'Wirf 2 zufällige Handkarten ab.'}
];
const RACES = {
  elf:{n:'Elf',txt:'+1 beim Weglaufen. Hilfst du bei einem Sieg, steigst du 1 Stufe auf.'},
  zwerg:{n:'Zwerg',txt:'Beliebig viele Große Gegenstände. Du darfst 6 Handkarten halten.'},
  halbling:{n:'Halbling',txt:'1 Gegenstand pro Zug doppelt verkaufen. Misslingt ein Fluchtwurf: 1 Karte abwerfen, neu würfeln.'}
};
const CLASSES = {
  krieger:{n:'Krieger',txt:'Du gewinnst bei Gleichstand. Im Kampf bis zu 3 Karten abwerfen: je +1.'},
  zauberer:{n:'Zauberer',txt:'Misslingt ein Fluchtwurf: bis zu 3 Karten abwerfen, je +1 auf den Wurf.'},
  dieb:{n:'Dieb',txt:'1 Karte abwerfen: Ein anderer Spieler bekommt im Kampf −2 (einmal pro Kampf).'},
  priester:{n:'Priester',txt:'Gegen Untote bis zu 3 Karten abwerfen: je +3.'}
};
const ENH = [
  {n:'Stinksauer',v:5,trm:1,x:2},
  {n:'Riesenhaft',v:10,trm:2},
  {n:'Winzig',v:-5,trm:-1,x:2}
];
const ITEMS = [
  {n:'Topfhelm mit Delle',slot:'kopf',b:1,g:200},
  {n:'Spitzhut mit Sternchen',slot:'kopf',b:3,g:400,req:{cls:'zauberer'}},
  {n:'Hörnerhelm',slot:'kopf',b:2,g:600},
  {n:'Lederschürze',slot:'ruestung',b:1,g:200},
  {n:'Kettenhemd aus Kronkorken',slot:'ruestung',b:2,g:400},
  {n:'Glitzer-Plattenrüstung',slot:'ruestung',b:3,g:600,big:true},
  {n:'Rutschige Schleimrüstung',slot:'ruestung',b:1,g:300,run:1},
  {n:'Schnelle Latschen',slot:'schuhe',b:0,g:400,run:2},
  {n:'Stahlkappenstiefel',slot:'schuhe',b:2,g:400},
  {n:'Rostiges Schwert',slot:'hand',hands:1,b:2,g:300},
  {n:'Gusseiserne Bratpfanne',slot:'hand',hands:1,b:1,g:200},
  {n:'Topfdeckel-Schild',slot:'hand',hands:1,b:2,g:400},
  {n:'Zauberstab der Ausreden',slot:'hand',hands:1,b:3,g:500,req:{cls:'zauberer'}},
  {n:'Elfendolch',slot:'hand',hands:1,b:3,g:400,req:{race:'elf'}},
  {n:'Gummihuhn mit Quietsch',slot:'hand',hands:1,b:1,g:100},
  {n:'Heiliges Nudelholz',slot:'hand',hands:1,b:3,g:400,req:{cls:'priester'}},
  {n:'Messer mit Korkenzieher',slot:'hand',hands:1,b:3,g:300,req:{cls:'dieb'}},
  {n:'Riesenhammer',slot:'hand',hands:2,b:4,g:600,big:true},
  {n:'Hellebarde mit Wimpel',slot:'hand',hands:2,b:3,g:500},
  {n:'Zwergenaxt',slot:'hand',hands:2,b:4,g:600,big:true,req:{race:'zwerg'}},
  {n:'Breitschwert der Angeberei',slot:'hand',hands:2,b:4,g:700,req:{cls:'krieger'}},
  {n:'Glücksumhang',slot:'none',b:1,g:300},
  {n:'Protzige Goldkette',slot:'none',b:1,g:600}
];
const ONESHOTS = [
  {n:'Trank der Tapferkeit',b:2,g:100,x:2},
  {n:'Flasche Drachenschnaps',b:3,g:200,x:2},
  {n:'Riesenböller',b:5,g:300},
  {n:'Stinkbombe',b:2,g:100},
  {n:'Nebelpulver',escape:true,g:200,x:2,txt:'Beim Weglaufen statt zu würfeln: Du entkommst automatisch, vor allen Monstern des Kampfes.'}
];
const LEVELUPS = ['Pizza für alle bestellt','Regelheft gelesen','Würfel angehaucht','Snacks mitgebracht'];

const TYPES = {
  monster:{l:'Monster',d:'Tür'}, curse:{l:'Fluch',d:'Tür'}, race:{l:'Rasse',d:'Tür'}, class:{l:'Klasse',d:'Tür'},
  enh:{l:'Monsterverstärker',s:'Verstärker',d:'Tür'}, wander:{l:'Sonderkarte',d:'Tür'},
  item:{l:'Gegenstand',d:'Schatz'}, oneshot:{l:'Einmal einsetzbar',s:'Einmal',d:'Schatz'}, levelup:{l:'Stufenkarte',s:'Stufe',d:'Schatz'}, amulet:{l:'Sonderkarte',d:'Schatz'}
};
// Kartenbilder: Kartenname -> Bilddatei im Ordner art/
const ART = {
  "Flasche Drachenschnaps":"art/einmal-flasche-drachenschnaps.webp",
  "Nebelpulver":"art/einmal-nebelpulver.webp",
  "Riesenböller":"art/einmal-riesenboeller.webp",
  "Stinkbombe":"art/einmal-stinkbombe.webp",
  "Trank der Tapferkeit":"art/einmal-trank-der-tapferkeit.webp",
  "Ahnenforschung":"art/fluch-ahnenforschung.webp",
  "Identitätskrise":"art/fluch-identitaetskrise.webp",
  "Löcher in den Sohlen":"art/fluch-loecher-in-den-sohlen.webp",
  "Pechsträhne":"art/fluch-pechstraehne.webp",
  "Rost":"art/fluch-rost.webp",
  "Taschendieb-Gnom":"art/fluch-taschendieb-gnom.webp",
  "Windböe":"art/fluch-windboee.webp",
  "Breitschwert der Angeberei":"art/gegenstand-breitschwert-der-angeberei.webp",
  "Elfendolch":"art/gegenstand-elfendolch.webp",
  "Glitzer-Plattenrüstung":"art/gegenstand-glitzer-plattenruestung.webp",
  "Glücksumhang":"art/gegenstand-gluecksumhang.webp",
  "Gummihuhn mit Quietsch":"art/gegenstand-gummihuhn-mit-quietsch.webp",
  "Gusseiserne Bratpfanne":"art/gegenstand-gusseiserne-bratpfanne.webp",
  "Heiliges Nudelholz":"art/gegenstand-heiliges-nudelholz.webp",
  "Hellebarde mit Wimpel":"art/gegenstand-hellebarde-mit-wimpel.webp",
  "Hörnerhelm":"art/gegenstand-hoernerhelm.webp",
  "Kettenhemd aus Kronkorken":"art/gegenstand-kettenhemd-aus-kronkorken.webp",
  "Lederschürze":"art/gegenstand-lederschuerze.webp",
  "Messer mit Korkenzieher":"art/gegenstand-messer-mit-korkenzieher.webp",
  "Protzige Goldkette":"art/gegenstand-protzige-goldkette.webp",
  "Riesenhammer":"art/gegenstand-riesenhammer.webp",
  "Rostiges Schwert":"art/gegenstand-rostiges-schwert.webp",
  "Rutschige Schleimrüstung":"art/gegenstand-rutschige-schleimruestung.webp",
  "Schnelle Latschen":"art/gegenstand-schnelle-latschen.webp",
  "Spitzhut mit Sternchen":"art/gegenstand-spitzhut-mit-sternchen.webp",
  "Stahlkappenstiefel":"art/gegenstand-stahlkappenstiefel.webp",
  "Topfdeckel-Schild":"art/gegenstand-topfdeckel-schild.webp",
  "Topfhelm mit Delle":"art/gegenstand-topfhelm-mit-delle.webp",
  "Zauberstab der Ausreden":"art/gegenstand-zauberstab-der-ausreden.webp",
  "Zwergenaxt":"art/gegenstand-zwergenaxt.webp",
  "Dieb":"art/klasse-dieb.webp",
  "Krieger":"art/klasse-krieger.webp",
  "Priester":"art/klasse-priester.webp",
  "Zauberer":"art/klasse-zauberer.webp",
  "Bürokratie-Golem":"art/monster-buerokratie-golem.webp",
  "Drache des Montagmorgens":"art/monster-drache-des-montagmorgens.webp",
  "Durchgedrehter Saugroboter":"art/monster-durchgedrehter-saugroboter.webp",
  "Falsche Schatztruhe":"art/monster-falsche-schatztruhe.webp",
  "Feuerspeiende Kaffeemaschine":"art/monster-feuerspeiende-kaffeemaschine.webp",
  "Hydra mit Migräne":"art/monster-hydra-mit-migraene.webp",
  "Kellerassel XXL":"art/monster-kellerassel-xxl.webp",
  "Lich mit Rückenschmerzen":"art/monster-lich-mit-rueckenschmerzen.webp",
  "Pilzkönig":"art/monster-pilzkoenig.webp",
  "Rentner-Ritter":"art/monster-rentner-ritter.webp",
  "Riesen-Nacktschnecke":"art/monster-riesen-nacktschnecke.webp",
  "Schleimige Socke":"art/monster-schleimige-socke.webp",
  "Schwarm Stechmücken":"art/monster-schwarm-stechmuecken.webp",
  "Steuerprüfer-Gespenst":"art/monster-steuerpruefer-gespenst.webp",
  "Troll unter der Autobahnbrücke":"art/monster-troll-unter-der-autobahnbruecke.webp",
  "Übellaunige Möwe":"art/monster-uebellaunige-moewe.webp",
  "Vampir-Kaninchen":"art/monster-vampir-kaninchen.webp",
  "Wütender Gartenzwerg":"art/monster-wuetender-gartenzwerg.webp",
  "Zombie-Hausmeister":"art/monster-zombie-hausmeister.webp",
  "Elf":"art/rasse-elf.webp",
  "Halbling":"art/rasse-halbling.webp",
  "Zwerg":"art/rasse-zwerg.webp",
  "Glücksamulett":"art/sonder-gluecksamulett.webp",
  "Ungebetener Gast":"art/sonder-ungebetener-gast.webp",
  "Pizza für alle bestellt":"art/stufe-pizza-fuer-alle-bestellt.webp",
  "Regelheft gelesen":"art/stufe-regelheft-gelesen.webp",
  "Snacks mitgebracht":"art/stufe-snacks-mitgebracht.webp",
  "Würfel angehaucht":"art/stufe-wuerfel-angehaucht.webp",
  "Riesenhaft":"art/verstaerker-riesenhaft.webp",
  "Stinksauer":"art/verstaerker-stinksauer.webp",
  "Winzig":"art/verstaerker-winzig.webp"
};
function artKey(c){ if(c.k==='item') return c.slot; return {monster:'monster',curse:'curse',race:'race',class:'cls',enh:'enh',wander:'wander',oneshot:'potion',levelup:'levelup',amulet:'none'}[c.k]; }

const TYPE_ORDER = ['race','class','item','oneshot','levelup','amulet','monster','enh','wander','curse'];
const SLOTN = {kopf:'Kopfbedeckung',ruestung:'Rüstung',schuhe:'Schuhwerk',hand:'Hand',none:'ohne Slot'};

/* ================= Hilfsfunktionen ================= */
const rnd = n => Math.floor(Math.random()*n);
const shuffle = a => { for(let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const sign = v => (v>0?'+':v<0?'−':'±') + Math.abs(v);
const fmt = n => n.toLocaleString('de-DE');
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pl = (n, one, many) => n===1 ? one : many;
let UID = 1;

const STALE = {stale:true};
let TOKEN = 0;
let S = null;
const UI = {tab:'spiel', prompt:null, resolve:null, reject:null, opts:[], sel:null, menu:null, menuActs:[], roll:null,
  speed:'normal', coach:true, advice:true, adv:null, open:false, bots:3, diff:'normal', seen:{}, logLen:0, quiz:{}};
const DIFF = {gemuetlich:0.5, normal:1, gnadenlos:1.6};
const diffF = () => DIFF[UI.diff]||1;
/* Ereignis-Hook für Effekte und Sounds, die Oberfläche setzt FX_HANDLER */
let FX_HANDLER = null;
function fx(type, data){ if(FX_HANDLER){ try{ FX_HANDLER(type, data||{}); }catch(e){ console.error(e); } } }
let CHECKPOINT_HANDLER = null;
const SPEEDS = {langsam:1500, normal:900, schnell:380};
const spd = (f=1) => HEADLESS ? 0 : SPEEDS[UI.speed]*f;

function sleep(ms){ const t=TOKEN; return new Promise((res,rej)=>{ const done=()=>{ if(t!==TOKEN) return rej(STALE); if(UI.paused && !HEADLESS) return setTimeout(done,150); res(); }; setTimeout(done, HEADLESS?0:ms); }); }
function ask(get, ctx, data){
  const t=TOKEN;
  return new Promise((res,rej)=>{
    UI.prompt={get, ctx, data};
    UI.resolve = v => { UI.prompt=null; UI.resolve=null; UI.reject=null; t===TOKEN ? res(v) : rej(STALE); };
    UI.reject = () => rej(STALE);
    render();
  });
}
function selectCards(o){
  const t=TOKEN;
  return new Promise((res,rej)=>{
    UI.menu=null;
    UI.sel = Object.assign({}, o, {picked:new Set(o.pre||[]),
      done:v=>{ UI.sel=null; render(); t===TOKEN ? res(v) : rej(STALE); },
      reject:()=>rej(STALE)});
    render();
  });
}

const P = i => S.players[i];
const me = () => S.players[0];
const nm = p => p.human ? 'Du' : p.name;
const nmA = p => p.human ? 'dich' : p.name;
const nmD = p => p.human ? 'dir' : p.name;
const V = (p, du, er) => p.human ? du : er;
const hasRace = (p,r) => !!(p.race && p.race.r===r);
const hasCls = (p,c) => !!(p.cls && p.cls.c===c);
const handLimit = p => hasRace(p,'zwerg') ? 6 : 5;

function log(t, kind='ev'){ S.log.push({t,kind}); if(S.log.length>400) S.log.splice(0,50); render(); }
function rule(t){ log(t,'rule'); }
function ruleOnce(key,t){ if(UI.seen[key]) return; UI.seen[key]=true; rule(t); }

/* ================= Decks ================= */
function mk(def, deck){ return Object.assign({uid:UID++, deck}, def); }
function buildDecks(){
  const door=[], tr=[];
  const rep = (x,f) => { for(let i=0;i<(x||1);i++) f(); };
  MONSTERS.forEach(m=>rep(m.x,()=>door.push(mk(Object.assign({k:'monster'},m),'door'))));
  CURSES.forEach(c=>rep(c.x,()=>door.push(mk(Object.assign({k:'curse'},c),'door'))));
  Object.keys(RACES).forEach(r=>rep(2,()=>door.push(mk({k:'race',r,n:RACES[r].n,txt:RACES[r].txt},'door'))));
  Object.keys(CLASSES).forEach(c=>rep(2,()=>door.push(mk({k:'class',c,n:CLASSES[c].n,txt:CLASSES[c].txt},'door'))));
  ENH.forEach(e=>rep(e.x,()=>door.push(mk(Object.assign({k:'enh'},e),'door'))));
  rep(2,()=>door.push(mk({k:'wander',n:'Ungebetener Gast',txt:'Spiele diese Karte mit einem Monster von deiner Hand in einen fremden Kampf. Das Monster kämpft mit.'},'door')));
  ITEMS.forEach(i=>tr.push(mk(Object.assign({k:'item',hands:i.slot==='hand'?(i.hands||1):0},i),'tr')));
  ONESHOTS.forEach(o=>rep(o.x,()=>tr.push(mk(Object.assign({k:'oneshot'},o),'tr'))));
  LEVELUPS.forEach(n=>tr.push(mk({k:'levelup',n,txt:'Steige 1 Stufe auf. Jederzeit spielbar, aber nicht für Stufe 10.'},'tr')));
  rep(2,()=>tr.push(mk({k:'amulet',n:'Glücksamulett',txt:'Spiele diese Karte, wenn dich ein Fluch trifft: Er wirkt nicht.'},'tr')));
  return {door:shuffle(door), tr:shuffle(tr)};
}
function drawDoor(){
  if(!S.door.length){ if(!S.doorDisc.length) return null; S.door=shuffle(S.doorDisc); S.doorDisc=[]; log('Der Türstapel ist leer. Die Ablage wird neu gemischt.','sys'); }
  return S.door.pop();
}
function drawTr(){
  if(!S.tr.length){ if(!S.trDisc.length) return null; S.tr=shuffle(S.trDisc); S.trDisc=[]; log('Der Schatzstapel ist leer. Die Ablage wird neu gemischt.','sys'); }
  return S.tr.pop();
}
function discard(c){ if(!c) return; (c.deck==='door' ? S.doorDisc : S.trDisc).push(c); }
function take(p,c){ const u=c.uid; p.hand=p.hand.filter(x=>x.uid!==u); p.eq=p.eq.filter(x=>x.uid!==u); p.pack=p.pack.filter(x=>x.uid!==u); }

/* ================= Werte ================= */
function usable(p,it){
  if(it.req){ if(it.req.cls && !hasCls(p,it.req.cls)) return false; if(it.req.race && !hasRace(p,it.req.race)) return false; }
  return true;
}
function reqName(it){ if(!it.req) return ''; return it.req.cls ? CLASSES[it.req.cls].n : RACES[it.req.race].n; }
function itemBonus(p){ return p.eq.filter(i=>usable(p,i)).reduce((s,i)=>s+(i.b||0),0); }
function power(p){ return p.lvl + itemBonus(p); }
function runBonus(p){ let b=hasRace(p,'elf')?1:0; p.eq.forEach(i=>{ if(i.run && usable(p,i)) b+=i.run; }); return b; }
function handsUsed(p){ return p.eq.filter(i=>i.slot==='hand').reduce((s,i)=>s+(i.hands||1),0); }
function canEquip(p,c){
  if(c.k!=='item') return {ok:false, why:'Das ist kein Gegenstand.'};
  if(!usable(p,c)) return {ok:false, why:`Nur für ${reqName(c)}. Spiele zuerst die passende Karte aus.`};
  if(c.big && !hasRace(p,'zwerg')){
    const other=[...p.eq,...p.pack].find(i=>i.big && i.uid!==c.uid);
    if(other) return {ok:false, why:`Du trägst schon einen Großen Gegenstand (${other.n}). Nur Zwerge dürfen mehrere haben. Verkaufe ihn zuerst.`};
  }
  return {ok:true};
}
function equip(p,c){
  take(p,c); const moved=[];
  if(['kopf','ruestung','schuhe'].includes(c.slot)){
    const old=p.eq.find(i=>i.slot===c.slot);
    if(old){ p.eq=p.eq.filter(i=>i!==old); p.pack.push(old); moved.push(old); }
  }
  if(c.slot==='hand'){
    let used=handsUsed(p);
    while(used + c.hands > 2){
      const o=p.eq.filter(i=>i.slot==='hand').sort((a,b)=>a.b-b.b)[0];
      p.eq=p.eq.filter(i=>i!==o); p.pack.push(o); moved.push(o); used-=o.hands;
    }
  }
  p.eq.push(c);
  return moved;
}
function gainOf(p,it){
  if(!canEquip(p,it).ok) return -1;
  const q=Object.assign({},p,{eq:[...p.eq],pack:[...p.pack],hand:[...p.hand]});
  const before=itemBonus(q)+runBonus(q)*0.5;
  equip(q,it);
  return itemBonus(q)+runBonus(q)*0.5-before;
}
function sellValue(p,cards){
  let sum=cards.reduce((s,c)=>s+(c.g||0),0), dbl=null;
  if(hasRace(p,'halbling') && !p.soldDouble && cards.length){ dbl=cards.reduce((m,c)=>(c.g||0)>(m.g||0)?c:m); sum+=dbl.g||0; }
  return {sum, dbl, lv:Math.floor(sum/1000)};
}
function keepValue(p,c){
  switch(c.k){
    case 'levelup': return 9;
    case 'amulet': return 7;
    case 'oneshot': return 5+(c.b||3);
    case 'curse': return 4;
    case 'enh': return 4;
    case 'wander': return 3;
    case 'monster': return 2;
    case 'race': return p.race?1:6;
    case 'class': return p.cls?1:6;
    case 'item': return 1+(c.g||0)/250+(gainOf(p,c)>0?4:0);
  }
  return 1;
}
function rcText(p){ return `${p.race?p.race.n:'Mensch'} · ${p.cls?p.cls.n:'keine Klasse'}`; }

/* ================= Kampf-Rechnung ================= */
function vsBonus(mc,C){
  if(!mc.vs) return 0;
  const ps=[P(C.f)]; if(C.h!=null) ps.push(P(C.h));
  return ps.some(p=>mc.vs.race && hasRace(p,mc.vs.race)) ? mc.vs.val : 0;
}
function sideStrength(C){
  const f=P(C.f); let s=power(f);
  const parts=[{l:`${f.human?'Deine':f.name+'s'} Stufe`,v:f.lvl,keep:true},{l:`${f.human?'Deine':f.name+'s'} Gegenstände`,v:itemBonus(f)}];
  if(C.h!=null){ const h=P(C.h); s+=power(h); parts.push({l:`Helfer: ${h.human?'du':h.name} (Stufe ${h.lvl} + Gegenst.)`,v:power(h)}); }
  C.pB.forEach(b=>{ s+=b.v; parts.push(b); });
  return {s, parts};
}
function monStrength(C){
  let s=0; const parts=[];
  C.mons.forEach(m=>{
    let v=m.c.lvl; parts.push({l:m.c.n,v:m.c.lvl,keep:true});
    m.enh.forEach(e=>{ v+=e.v; parts.push({l:`„${e.n}“`,v:e.v}); });
    const vs=vsBonus(m.c,C); if(vs){ v+=vs; parts.push({l:`Bonus gegen ${RACES[m.c.vs.race].n}en`,v:vs}); }
    s+=v;
  });
  C.mB.forEach(b=>{ s+=b.v; parts.push(b); });
  return {s, parts};
}
function evalCombat(C){
  const a=sideStrength(C).s, b=monStrength(C).s, tieWin=hasCls(P(C.f),'krieger');
  return {a, b, tieWin, win: a>b || (a===b && tieWin)};
}
const levelsGained = C => C.mons.reduce((s,m)=>s+(m.c.up||1),0);
const treasuresOf = C => C.mons.reduce((s,m)=>s+Math.max(0, m.c.tr + m.enh.reduce((t,e)=>t+(e.trm||0),0)),0);
const monNames = C => C.mons.map(m=>m.c.n).join(' und ');
function wouldWinWith(C,p){ const h=C.h; C.h=p.id; const r=evalCombat(C); C.h=h; return r.win; }
function strongestMon(C){ return C.mons.slice().sort((a,b)=>b.c.lvl-a.c.lvl)[0]; }

/* ================= Spielstart ================= */
function newPlayer(id,name,human){ return {id,name,human,lvl:1,race:null,cls:null,eq:[],pack:[],hand:[],dead:false,soldDouble:false}; }
function newGame(allBots){
  TOKEN++;
  if(UI.reject){ const r=UI.reject; UI.prompt=null; UI.resolve=null; UI.reject=null; try{ r(); }catch(e){} }
  if(UI.sel){ const r=UI.sel.reject; UI.sel=null; try{ r(); }catch(e){} }
  UI.menu=null; UI.roll=null; UI.seen={}; UI.logLen=0;
  UID=1;
  const d=buildDecks();
  buildCatalog([...d.door,...d.tr]);
  S={players:[], door:d.door, tr:d.tr, doorDisc:[], trDisc:[], cur:0, turn:1, phase:0, combat:null, reveal:null, log:[], winner:null};
  const names=['Berta','Kalle','Uschi'];
  S.players.push(newPlayer(0,'Du',!allBots));
  if(allBots) S.players[0].name='Testbot';
  for(let i=0;i<UI.bots;i++) S.players.push(newPlayer(i+1,names[i],false));
  S.players.forEach(p=>{ for(let i=0;i<4;i++){ p.hand.push(drawDoor()); p.hand.push(drawTr()); } });
  S.players.filter(p=>!p.human).forEach(botSetup);
  log('Neue Partie. Alle starten auf Stufe 1 als Mensch ohne Klasse und mit 4 Tür- und 4 Schatzkarten. Du beginnst.','sys');
  rule('Tippe deine Handkarten an, um sie auszuspielen. Rasse, Klasse und Gegenstände darfst du gleich jetzt auslegen.');
  fx('newgame');
  const t=TOKEN;
  return gameLoop(t).catch(e=>{ if(e!==STALE){ console.error(e); if(!HEADLESS) log('Hoppla, ein Programmfehler: '+e.message,'sys'); else throw e; } });
}
async function gameLoop(t){
  while(S.winner==null && t===TOKEN){
    const p=P(S.cur);
    S.phase=0; S.combat=null;
    if(p.human) await humanTurn(p); else await botTurn(p);
    if(S.winner!=null || t!==TOKEN) break;
    S.cur=(S.cur+1)%S.players.length;
    if(S.cur===0) S.turn++;
    if(S.turn>400){ log('Abbruch nach 400 Runden.','sys'); break; }
  }
  if(S.winner!=null && t===TOKEN) fx('gameover',{winner:S.winner});
  render();
}
/* Spielstand fortsetzen (gespeichert zu Beginn deines Zuges) */
function resumeGame(data){
  TOKEN++;
  if(UI.reject){ const r=UI.reject; UI.prompt=null; UI.resolve=null; UI.reject=null; try{ r(); }catch(e){} }
  if(UI.sel){ const r=UI.sel.reject; UI.sel=null; try{ r(); }catch(e){} }
  UI.menu=null; UI.roll=null; UI.seen=data.seen||{}; UI.logLen=0;
  S=data.S;
  let maxU=0; const scan=c=>{ if(c && c.uid>maxU) maxU=c.uid; };
  [S.door,S.tr,S.doorDisc,S.trDisc].forEach(a=>a.forEach(scan));
  S.players.forEach(p=>{ [p.hand,p.eq,p.pack].forEach(a=>a.forEach(scan)); scan(p.race); scan(p.cls); });
  UID=maxU+1;
  const all=[...S.door,...S.tr,...S.doorDisc,...S.trDisc]; S.players.forEach(p=>all.push(...p.hand,...p.eq,...p.pack,...[p.race,p.cls].filter(Boolean)));
  buildCatalog(all);
  S.combat=null; S.reveal=null;
  log('Spielstand geladen. Es geht weiter mit deinem Zug.','sys');
  const t=TOKEN;
  return gameLoop(t).catch(e=>{ if(e!==STALE){ console.error(e); log('Hoppla, ein Programmfehler: '+e.message,'sys'); } });
}
function revive(p){
  p.dead=false;
  for(let i=0;i<4;i++){ const a=drawDoor(), b=drawTr(); if(a) p.hand.push(a); if(b) p.hand.push(b); }
  log(`${p.human?'Du kehrst':p.name+' kehrt'} zurück und ${V(p,'ziehst','zieht')} 4 Tür- und 4 Schatzkarten.`,'sys');
}

/* ================= Dein Zug ================= */
function isFree(){ return S && S.cur===0 && me().human && !S.combat && UI.prompt && !UI.sel && S.winner==null; }

async function humanTurn(p){
  if(p.dead) revive(p);
  p.soldDouble=false;
  S.phase=1;
  log(`Dein Zug · Runde ${S.turn}`,'turn');
  fx('turn',{p});
  if(CHECKPOINT_HANDLER){ try{ CHECKPOINT_HANDLER(); }catch(e){} }
  await ask(()=>({title:'Phase 1 · Tür aufstoßen', text:'Bereite dich vor, dann stoß die Tür auf.', hint:hintStart(p), opts:[{l:'Tür aufstoßen',v:'kick',kind:'primary'}]}), 'kick');
  const c=drawDoor();
  let fought=false;
  if(c){
    S.reveal=c;
    log(`Du stößt die Tür auf: <b>${cardLabel(c)}</b>.`);
    if(c.k==='monster'){ ruleOnce('openmon','Ein offen aufgedecktes Monster musst du sofort bekämpfen.'); S.reveal=null; await combat(0,[c]); fought=true; }
    else if(c.k==='curse'){ ruleOnce('doorcurse','Einen Fluch, den du beim Aufstoßen der Tür aufdeckst, bekommst du selbst ab.'); await sleep(1100); S.reveal=null; await applyCurse(p,c,null); }
    else { await sleep(1000); S.reveal=null; p.hand.push(c); log(`${c.n} kommt auf deine Hand.`); if(c.k==='race'||c.k==='class') ruleOnce('rcplay','Rassen und Klassen darfst du im eigenen Zug jederzeit ausspielen. Zieh die Karte aufs Spielfeld oder tippe sie an.'); }
  }
  if(S.winner!=null) return;
  if(!fought && !p.dead){
    S.phase=2;
    const v=await ask(()=>{
      const mons=p.hand.filter(x=>x.k==='monster');
      return {title:'Phase 2 · Monster herausfordern – oder Phase 3 · Raum durchsuchen', text:'Kein Monster hinter der Tür. Willst du eins von deiner Hand bekämpfen?', hint:hintTrouble(p,mons),
        opts:[...mons.map(m=>({l:`Herausfordern: ${m.n} (Stufe ${m.lvl})`,v:'m'+m.uid,kind:power(p)>m.lvl?'':'danger'})),{l:'Raum durchsuchen',v:'loot',kind:'primary'}]};
    }, 'trouble');
    if(v==='loot'){
      S.phase=3;
      const d=drawDoor();
      if(d){ p.hand.push(d); log(`Du durchsuchst den Raum und ziehst verdeckt: <b>${cardLabel(d)}</b>.`);
        if(d.k==='curse') ruleOnce('hiddencurse','Verdeckt gezogene Flüche wirken nicht auf dich. Du kannst sie später jederzeit auf jemanden spielen.');
        if(d.k==='monster') ruleOnce('handmon','Ein Monster auf der Hand nutzt du nächsten Zug für „Monster herausfordern“ oder mit „Ungebetener Gast“ in fremden Kämpfen.'); }
    } else {
      const m=p.hand.find(x=>'m'+x.uid===v);
      if(m){ take(p,m); log(`Du forderst <b>${m.n}</b> von deiner Hand heraus.`); await combat(0,[m]); }
    }
  }
  if(S.winner!=null) return;
  S.phase=4;
  while(true){
    const v=await ask(()=>{ const over=p.hand.length-handLimit(p);
      return {title:'Phase 4 · Almosen', text: over>0 ? `Du hast ${p.hand.length} Karten, erlaubt sind ${handLimit(p)}.` : 'Dein Zug ist fast vorbei. Lege noch aus, was du brauchst.', hint:hintCharity(p),
        opts: over>0 ? [{l:`${over} ${pl(over,'Karte','Karten')} abgeben`,v:'give',kind:'primary'}] : [{l:'Zug beenden',v:'end',kind:'primary'}]}; }, 'charity');
    if(v==='end') break;
    const over=p.hand.length-handLimit(p);
    if(over<=0) continue;
    const sel=await selectCards({ctx:'charity', title:'Almosen', text:`Wähle ${over} ${pl(over,'Karte','Karten')}, die du abgibst.`, min:over, max:over, cancel:true,
      filter:(c,w)=>w==='hand', confirm:()=> 'Abgeben'});
    if(!sel) continue;
    doCharity(p, sel.map(findCard).filter(Boolean));
  }
}
function hintStart(p){
  const h=[];
  const eqable=p.hand.filter(c=>c.k==='item' && gainOf(p,c)>0);
  if(!p.race && p.hand.some(c=>c.k==='race')) h.push('Du hast eine Rassenkarte auf der Hand. Ausspielen gibt dir ihre Fähigkeit.');
  if(!p.cls && p.hand.some(c=>c.k==='class')) h.push('Du hast eine Klassenkarte auf der Hand. Spiel sie aus, manche Gegenstände brauchen sie.');
  if(eqable.length) h.push(`Anlegen lohnt sich: ${eqable.map(c=>c.n).join(', ')}. Karte antippen, dann „Ausrüsten“.`);
  const sv=sellValue(p,[...p.pack,...p.hand.filter(c=>c.k==='item' && gainOf(p,c)<=0)]);
  if(sv.sum>=1000 && p.lvl<9) h.push(`Du hast nicht genutzte Gegenstände für ${fmt(sv.sum)} Gold. Verkaufen bringt dir eine Stufe.`);
  if(p.hand.some(c=>c.k==='levelup') && p.lvl<9) h.push('Eine Stufenkarte direkt zu benutzen lohnt sich fast immer.');
  if(!h.length) h.push('Alles bereit. Deine Kampfstärke: '+power(p)+'.');
  return h;
}
function hintTrouble(p,mons){
  const h=[];
  if(mons.length){
    const safe=mons.filter(m=>power(p)>m.lvl+2);
    h.push(`Deine Kampfstärke ist ${power(p)}. ${safe.length?'Mit Puffer schlägst du: '+safe.map(m=>m.n).join(', ')+'.':'Keins deiner Hand-Monster schlägst du mit Puffer.'}`);
    h.push('Die anderen können eingreifen. Ein knapper Kampf ist riskant.');
  } else h.push('Ohne Monster auf der Hand bleibt nur: Raum durchsuchen. Du ziehst 1 Türkarte verdeckt.');
  return h;
}
function charityTargets(p){
  const minL=Math.min(...S.players.map(o=>o.lvl));
  if(p.lvl===minL) return null;
  return S.players.filter(o=>o.id!==p.id && o.lvl===minL);
}
function hintCharity(p){
  const lim=handLimit(p), over=p.hand.length-lim;
  if(over<=0) return [`Du hast ${p.hand.length} von höchstens ${lim} Karten. Alles gut.`];
  const t=charityTargets(p);
  return [`Spiele vorher aus, was geht: Gegenstände anlegen, verkaufen, Flüche verteilen. Sonst gibst du ${over} ${pl(over,'Karte','Karten')} ab.`,
    t ? `Die Karten bekommt ${t.map(x=>x.name).join(' und ')} (niedrigste Stufe).` : 'Du hast selbst (mit) die niedrigste Stufe, also werden sie abgelegt.'];
}
function doCharity(p,cards){
  if(!cards.length) return;
  const t=charityTargets(p);
  if(!t){ cards.forEach(c=>{ take(p,c); discard(c); }); log(`${nm(p)} ${V(p,'legst','legt')} ${cards.length} ${pl(cards.length,'Karte','Karten')} ab.`); ruleOnce('charself','Almosen: Wer selbst (mit) die niedrigste Stufe hat, legt die überzähligen Karten ab.'); }
  else { const toMe=[]; cards.forEach((c,i)=>{ take(p,c); const r=t[i%t.length]; r.hand.push(c); if(r.human) toMe.push(c); });
    log(`${nm(p)} ${V(p,'gibst','gibt')} ${cards.length} ${pl(cards.length,'Karte','Karten')} an ${t.map(nmA).join(' und ')} ab.${toMe.length?` Du bekommst: ${toMe.map(c=>`<b>${cardLabel(c)}</b>`).join(', ')}.`:''}`);
    ruleOnce('charity','Almosen: Überzählige Handkarten gehen an den Spieler mit der niedrigsten Stufe.'); }
}

/* ================= Bot-Zug ================= */
function botSetup(p){
  if(!p.race){ const r=p.hand.find(c=>c.k==='race'); if(r){ take(p,r); p.race=r; } }
  if(!p.cls){ const c=p.hand.find(c=>c.k==='class'); if(c){ take(p,c); p.cls=c; } }
  let again=true, guard=0;
  while(again && guard++<10){
    again=false;
    const cands=[...p.hand.filter(c=>c.k==='item'),...p.pack].sort((a,b)=>b.b-a.b);
    for(const it of cands){ if(gainOf(p,it)>0){ equip(p,it); again=true; break; } }
  }
}
async function botManage(p){
  const r0=p.race, c0=p.cls;
  botSetup(p);
  if(p.race!==r0) log(`${p.name} spielt die Rasse ${p.race.n} aus.`);
  if(p.cls!==c0) log(`${p.name} spielt die Klasse ${p.cls.n} aus.`);
  for(const lu of p.hand.filter(c=>c.k==='levelup')){ if(p.lvl<9){ take(p,lu); discard(lu); p.lvl++; log(`${p.name} spielt „${lu.n}“ und steigt auf Stufe ${p.lvl}.`); ruleOnce('levelup','Stufenkarten darf man jederzeit spielen, aber nie für die Siegstufe 10.'); } }
  botSell(p);
  for(const cu of p.hand.filter(c=>c.k==='curse')){
    const t=pickCurseTarget(p,cu);
    if(t && Math.random()<Math.min(0.95,0.75*diffF())){ take(p,cu); log(`${p.name} spielt den Fluch „${cu.n}“ auf ${nmA(t)}!`,'bad'); ruleOnce('cursehand','Flüche von der Hand darf man jederzeit auf jeden Spieler spielen.'); await sleep(spd(0.6)); await applyCurse(t,cu,p); }
  }
}
function botSell(p){
  if(p.lvl>=9) return;
  const cands=[...p.pack,...p.hand.filter(c=>c.k==='item' && gainOf(p,c)<=0)];
  const total=sellValue(p,cands).sum; if(total<1000) return;
  const target=Math.min(Math.floor(total/1000),9-p.lvl);
  cands.sort((a,b)=>b.g-a.g);
  const pick=[]; for(const c of cands){ pick.push(c); if(sellValue(p,pick).sum>=target*1000) break; }
  const sv=sellValue(p,pick); const lv=Math.min(sv.lv,9-p.lvl); if(lv<1) return;
  pick.forEach(c=>{ take(p,c); discard(c); }); p.lvl+=lv; if(sv.dbl) p.soldDouble=true;
  log(`${p.name} verkauft ${pick.map(c=>c.n).join(', ')} für ${fmt(sv.sum)} Gold${sv.dbl?` (als Halbling ${sv.dbl.n} doppelt)`:''} und steigt auf Stufe ${p.lvl}.`);
  ruleOnce('sell','Verkaufen: Je 1.000 Gold gibt es 1 Stufe. Wechselgeld gibt es nicht.');
}
function curseHits(t,c){
  const e=c.eff;
  if(e.t==='slot') return t.eq.some(i=>i.slot===e.s);
  if(e.t==='race') return !!t.race;
  if(e.t==='hand') return t.hand.length>0;
  if(e.t==='lvl') return t.lvl>1;
  return true;
}
function pickCurseTarget(p,c){
  const others=S.players.filter(o=>o.id!==p.id && !o.dead && curseHits(o,c));
  if(!others.length) return null;
  const max=Math.max(...others.map(o=>o.lvl));
  if(max<p.lvl) return null;
  const top=others.filter(o=>o.lvl===max);
  return top[rnd(top.length)];
}
function botTroubleChoice(p){
  const ms=p.hand.filter(c=>c.k==='monster' && power(p) > c.lvl + (c.vs && hasRace(p,c.vs.race)?c.vs.val:0) + 2);
  return ms.sort((a,b)=>b.lvl-a.lvl)[0]||null;
}
async function botTurn(p){
  if(p.dead) revive(p);
  p.soldDouble=false;
  S.phase=1;
  log(`${p.name} ist am Zug`,'turn');
  fx('turn',{p});
  await sleep(spd(0.7));
  await botManage(p);
  if(S.winner!=null) return;
  await sleep(spd(0.5));
  const c=drawDoor(); let fought=false;
  if(c){
    S.reveal=c; log(`${p.name} stößt die Tür auf: <b>${cardLabel(c)}</b>.`); await sleep(spd());
    if(c.k==='monster'){ S.reveal=null; await combat(p.id,[c]); fought=true; }
    else if(c.k==='curse'){ S.reveal=null; await applyCurse(p,c,null); }
    else { S.reveal=null; p.hand.push(c); await botManage(p); }
  }
  if(S.winner!=null) return;
  if(!fought && !p.dead){
    S.phase=2;
    const m=botTroubleChoice(p);
    if(m){ take(p,m); log(`${p.name} fordert <b>${m.n}</b> (Stufe ${m.lvl}) von der Hand heraus.`); await sleep(spd()); await combat(p.id,[m]); }
    else { S.phase=3; const d=drawDoor(); if(d) p.hand.push(d); log(`${p.name} durchsucht den Raum und zieht 1 Türkarte verdeckt.`); await sleep(spd(0.6)); }
  }
  if(S.winner!=null) return;
  await botManage(p);
  S.phase=4;
  const over=p.hand.length-handLimit(p);
  if(over>0){ const give=p.hand.slice().sort((a,b)=>keepValue(p,a)-keepValue(p,b)).slice(0,over); doCharity(p,give); }
  await sleep(spd(0.6));
}

/* ================= Kampf ================= */
async function combat(fid, cards){
  const C=S.combat={f:fid, h:null, deal:0, mons:cards.map(c=>({c,enh:[]})), pB:[], mB:[], used:[], berserk:0, turning:0, stabbed:{}, intf:{}, asked:{}, resolved:false, hchg:false};
  const f=P(fid);
  log(`Kampf: ${nm(f)} gegen <b>${monNames(C)}</b> (Stufe ${C.mons[0].c.lvl}).`);
  ruleOnce('power','Kampfstärke = Stufe + Boni der ausgerüsteten Gegenstände. Sie muss höher sein als die Monsterstufe. Gleichstand verliert, außer für Krieger.');
  render();
  if(f.human) await humanFight(C); else await botFight(C);
  C.resolved=true;
  const r=evalCombat(C);
  if(r.win) await winCombat(C); else await loseCombat(C);
  C.mons.forEach(m=>{ discard(m.c); m.enh.forEach(discard); });
  C.used.forEach(discard);
  await sleep(spd(0.5));
  UI.roll=null;
  S.combat=null;
  render();
}
function combatPrompt(C){
  const p=me(), r=evalCombat(C), h=[];
  const os=p.hand.filter(c=>c.k==='oneshot' && c.b);
  if(!r.win){
    const need=r.b-r.a+(r.tieWin?0:1);
    h.push(`Dir ${pl(need,'fehlt','fehlen')} ${need} ${pl(need,'Punkt','Punkte')}.`);
    if(os.length) h.push(`Einmal-Gegenstände auf deiner Hand: ${os.map(c=>`${c.n} (+${c.b})`).join(', ')}. Aufs Spielfeld ziehen oder antippen.`);
    const tiny=p.hand.find(c=>c.k==='enh' && c.v<0); if(tiny) h.push(`„${tiny.n}“ (${sign(tiny.v)}) darfst du auch auf dein eigenes Monster spielen.`);
    if(C.h==null) h.push('Du kannst einen Mitspieler um Hilfe bitten und Schätze anbieten.');
    h.push('Reicht nichts davon: aufgeben und weglaufen.');
  } else {
    h.push('Wenn du „Fertig“ sagst, haben die anderen noch kurz Zeit einzugreifen.');
    const plus=p.hand.find(c=>c.k==='enh' && c.v>0);
    if(plus && r.a-r.b>plus.v+1) h.push(`Trick: „${plus.n}“ (${sign(plus.v)}) auf dein eigenes Monster bringt dir mehr Schätze. Nur, wenn du trotzdem sicher gewinnst.`);
    if(p.lvl+levelsGained(C)>=10) h.push('Dieser Sieg bringt dir das Spiel. Rechne mit Gegenwehr!');
  }
  const opts=[];
  opts.push(r.win ? {l:'Fertig: Monster besiegen',v:'done',kind:'primary'} : {l:'Aufgeben und weglaufen',v:'run',kind:'danger'});
  if(C.h==null && S.players.some(x=>!x.human && !x.dead && !C.asked[x.id])) opts.push({l:'Um Hilfe bitten',v:'help'});
  if(hasCls(p,'krieger') && C.berserk<3 && p.hand.length) opts.push({l:`Krieger: Karten abwerfen (+1 je Karte)`,v:'berserk'});
  if(hasCls(p,'priester') && C.mons.some(m=>m.c.undead) && C.turning<3 && p.hand.length) opts.push({l:'Priester: gegen Untote (+3 je Karte)',v:'turn'});
  return {title:`Kampf · ${r.a} gegen ${r.b}`, text: r.win ? 'Du gewinnst diesen Kampf gerade.' : (r.a===r.b ? 'Gleichstand. Das reicht nicht, du verlierst gerade.' : 'Du verlierst diesen Kampf gerade.'), hint:h, opts};
}
async function humanFight(C){
  const p=me();
  while(true){
    const v=await ask(()=>combatPrompt(C), 'fight');
    if(v==='help'){ await humanAskHelp(C); continue; }
    if(v==='berserk' || v==='turn'){
      const used = v==='berserk' ? C.berserk : C.turning, per = v==='berserk'?1:3, max=Math.min(3-used,p.hand.length);
      const sel=await selectCards({ctx:v, title: v==='berserk'?'Krieger-Fähigkeit':'Priester gegen Untote', text:`Wirf bis zu ${max} ${pl(max,'Karte','Karten')} ab. Jede bringt +${per}.`, min:1, max, cancel:true, filter:(c,w)=>w==='hand', confirm:cs=>`${cs.length} abwerfen (+${cs.length*per})`});
      if(sel && sel.length){ sel.map(findCard).forEach(c=>{ take(p,c); discard(c); });
        if(v==='berserk'){ C.berserk+=sel.length; C.pB.push({l:`Krieger-Fähigkeit (${sel.length} ${pl(sel.length,'Karte','Karten')})`,v:sel.length}); }
        else { C.turning+=sel.length; C.pB.push({l:`Priester gegen Untote (${sel.length} ${pl(sel.length,'Karte','Karten')})`,v:3*sel.length}); }
        log(`Du wirfst ${sel.length} ${pl(sel.length,'Karte','Karten')} ab und bekommst +${sel.length*per}.`); }
      continue;
    }
    if(v==='run') return;
    if(v==='done'){
      if(!evalCombat(C).win) return;
      log('Du sagst: „Fertig!“ Die anderen dürfen jetzt noch eingreifen …','sys');
      await sleep(spd(0.6));
      const any=await botsInterfere(C);
      if(any){ ruleOnce('respond','Nach einem Eingriff darfst du reagieren: mehr Einmal-Gegenstände, Hilfe holen oder aufgeben.'); continue; }
      log('Niemand greift ein.','sys');
      return;
    }
  }
}
async function humanAskHelp(C){
  const cands=S.players.filter(x=>!x.human && !x.dead && !C.asked[x.id]);
  const total=treasuresOf(C);
  const v=await ask(()=>({title:'Um Hilfe bitten', text:'Wen fragst du? Nur 1 Mitspieler darf helfen.', hint:['Die Kampfstärke des Helfers wird zu deiner addiert. Bietest du Schätze an, sagt er eher Ja.','Niemand hilft gern jemandem, der damit das Spiel gewinnt.'],
    opts:[...cands.map(b=>({l:`${b.name} (Kampfstärke ${power(b)})`,v:b.id})),{l:'Abbrechen',v:'x',kind:'ghost'}]}), 'helpWho');
  if(v==='x') return;
  const b=P(v);
  const offer=await ask(()=>({title:`Angebot an ${b.name}`, text:`Wie viele der ${total} ${pl(total,'Schatz','Schätze')} bietest du an?`, hint:['Mit Helfer werden die Schätze offen gezogen. Der Helfer bekommt, was vereinbart ist.'],
    opts:[...Array.from({length:total+1},(_,i)=>({l:`${i} ${pl(i,'Schatz','Schätze')}`,v:i})),{l:'Abbrechen',v:'x',kind:'ghost'}]}), 'helpOffer', {b});
  if(offer==='x') return;
  C.asked[b.id]=true;
  log(`Du bittest ${b.name} um Hilfe und bietest ${offer} ${pl(offer,'Schatz','Schätze')}.`);
  await sleep(spd(0.6));
  const ans=botAcceptHelp(b,C,offer);
  if(ans.yes){ C.h=b.id; C.deal=offer; log(`${b.name}: „${ans.why}“ ${b.name} hilft dir.`,'good'); ruleOnce('helper','Mit Helfer zählen beide Kampfstärken. Verliert ihr, müssen beide einzeln weglaufen.'); }
  else log(`${b.name} lehnt ab: „${ans.why}“`,'bad');
}
function botAcceptHelp(b,C,offer){
  const f=P(C.f), total=treasuresOf(C);
  if(!wouldWinWith(C,b)) return {yes:false, why:'Selbst mit mir reicht das nicht.'};
  if(f.lvl+levelsGained(C)>=10) return {yes:false, why:'Damit du gewinnst? Sicher nicht!'};
  if(hasRace(b,'elf') && b.lvl<9) return {yes:true, why:'Als Elf steige ich dabei selbst auf. Gern!'};
  const leaderGap=f.lvl - Math.max(...S.players.filter(x=>x.id!==f.id).map(x=>x.lvl));
  let chance = offer===0 ? 0.2 : (total>0 && offer/total>=0.5 ? 0.9 : 0.65);
  if(leaderGap>=2) chance-=0.35;
  if(Math.random()<chance) return {yes:true, why: offer>0 ? 'Abgemacht.' : 'Na gut, ausnahmsweise.'};
  return {yes:false, why: offer===0 ? 'Für nichts? Nein danke.' : 'Nicht dieses Mal.'};
}
function humanCanInterfere(C){
  const p=me(); if(!p.human || p.dead) return false;
  return p.hand.some(c=>(c.k==='enh') || (c.k==='oneshot' && c.b) || c.k==='curse') ||
    (p.hand.some(c=>c.k==='wander') && p.hand.some(c=>c.k==='monster')) ||
    (hasCls(p,'dieb') && !C.stabbed[0] && p.hand.length>0);
}
function interferePrompt(C){
  const f=P(C.f), p=me(), r=evalCombat(C), helper=C.h===0, h=[];
  if(helper){ h.push('Du hilfst. Mit Einmal-Gegenständen kannst du eure Seite stärken.'); }
  else if(r.win){
    if(f.lvl+levelsGained(C)>=10) h.push(`Achtung: Gewinnt ${f.name} diesen Kampf, ist das Spiel vorbei!`);
    const opts=[];
    p.hand.filter(c=>c.k==='enh' && c.v>0).forEach(c=>opts.push(`„${c.n}“ (${sign(c.v)})`));
    p.hand.filter(c=>c.k==='oneshot' && c.b).forEach(c=>opts.push(`${c.n} für das Monster (+${c.b})`));
    if(p.hand.some(c=>c.k==='wander') && p.hand.some(c=>c.k==='monster')) opts.push('Ungebetener Gast mit einem Monster von deiner Hand');
    if(p.hand.some(c=>c.k==='curse')) opts.push('ein Fluch auf '+f.name);
    if(opts.length) h.push('Möglich: '+opts.join(', ')+'. Karte aufs Spielfeld ziehen oder antippen.');
    h.push('Eingreifen kostet Karten. Lohnt sich vor allem gegen den, der vorne liegt.');
  } else h.push(`${f.name} verliert gerade.`);
  const o=[{l: C.hchg ? 'Fertig, weiter' : 'Nicht eingreifen', v:'ok', kind:'primary'}];
  if(!helper && hasCls(p,'dieb') && !C.stabbed[0] && p.hand.length) o.push({l:'Dieb: in den Rücken fallen (−2)',v:'stab'});
  return {title:`${f.name} kämpft · ${r.a} gegen ${r.b}`, text: helper ? `Du hilfst ${f.name} gegen ${monNames(C)}.` : `${f.name} ${r.win?'gewinnt':'verliert'} gerade gegen ${monNames(C)}. Willst du eingreifen?`, hint:h, opts:o};
}
async function humanInterfereWindow(C){
  const p=me(); if(!p.human || p.dead) return false;
  const r=evalCombat(C), helper=C.h===0;
  if(helper){ if(!p.hand.some(c=>c.k==='oneshot' && c.b)) return false; }
  else if(!r.win || !humanCanInterfere(C)) return false;
  C.hchg=false;
  while(true){
    const v=await ask(()=>interferePrompt(C), 'interfere');
    if(v==='stab'){
      const sel=await selectCards({ctx:'stab', title:'Dieb: in den Rücken fallen', text:'Wirf 1 Karte ab. Die kämpfende Seite bekommt −2.', min:1, max:1, cancel:true, filter:(c,w)=>w==='hand', confirm:()=>'Abwerfen'});
      if(sel && sel.length){ const c=findCard(sel[0]); take(p,c); discard(c); C.stabbed[0]=true; C.pB.push({l:'Dieb: du fällst in den Rücken',v:-2}); C.hchg=true; C.asked[0]=true; log(`Du fällst ${P(C.f).name} in den Rücken: −2.`,'bad'); }
      continue;
    }
    break;
  }
  return C.hchg;
}
async function botFight(C){
  const b=P(C.f);
  await sleep(spd());
  botBoost(b,C);
  if(!evalCombat(C).win) await botSeekHelp(b,C);
  let guard=0;
  while(guard++<8){
    let changed=false;
    if(await humanInterfereWindow(C)) changed=true;
    if(await botsInterfere(C)) changed=true;
    if(!changed) break;
    await sleep(spd(0.5));
    botBoost(b,C);
    if(!evalCombat(C).win && C.h==null) await botSeekHelp(b,C);
  }
  await sleep(spd(0.5));
}
function botBoost(b,C){
  const r=evalCombat(C); if(r.win) return false;
  const need=r.b-r.a+(r.tieWin?0:1);
  const res=[];
  const sides=[b]; if(C.h!=null && !P(C.h).human) sides.push(P(C.h));
  sides.forEach(q=>q.hand.forEach(c=>{
    if(c.k==='oneshot' && c.b) res.push({v:c.b, use:()=>{ take(q,c); C.used.push(c); C.pB.push({l:`${c.n} (${q.name})`,v:c.b}); log(`${q.name} setzt ${c.n} ein (+${c.b}).`); }});
    if(c.k==='enh' && c.v<0) res.push({v:-c.v, use:()=>{ take(q,c); const m=strongestMon(C); m.enh.push(c); log(`${q.name} spielt „${c.n}“ (${sign(c.v)}) auf ${m.c.n}.`); }});
  }));
  const spare=b.hand.filter(c=>keepValue(b,c)<5 && c.k!=='oneshot' && !(c.k==='enh' && c.v<0)).sort((x,y)=>keepValue(b,x)-keepValue(b,y));
  if(hasCls(b,'priester') && C.mons.some(m=>m.c.undead)) for(let i=0;i<Math.min(3-C.turning,spare.length);i++) res.push({v:3, card:spare[i], ab:'turn'});
  else if(hasCls(b,'krieger')) for(let i=0;i<Math.min(3-C.berserk,spare.length);i++) res.push({v:1, card:spare[i], ab:'berserk'});
  const total=res.reduce((s,x)=>s+x.v,0);
  if(total<need) return false;
  res.sort((x,y)=>x.v-y.v);
  let chosen=res.find(x=>x.v>=need); chosen = chosen ? [chosen] : null;
  if(!chosen){ chosen=[]; let s=0; for(const x of res.slice().sort((x,y)=>y.v-x.v)){ chosen.push(x); s+=x.v; if(s>=need) break; } }
  let nb=0, nt=0;
  chosen.forEach(x=>{ if(x.use) x.use(); else { take(b,x.card); discard(x.card); if(x.ab==='berserk') nb++; else nt++; } });
  if(nb){ C.berserk+=nb; C.pB.push({l:`Krieger-Fähigkeit (${b.name})`,v:nb}); log(`${b.name} wirft als Krieger ${nb} ${pl(nb,'Karte','Karten')} ab: +${nb}.`); }
  if(nt){ C.turning+=nt; C.pB.push({l:`Priester gegen Untote (${b.name})`,v:3*nt}); log(`${b.name} wirft als Priester ${nt} ${pl(nt,'Karte','Karten')} ab: +${3*nt} gegen Untote.`); }
  return true;
}
async function botSeekHelp(b,C){
  if(C.h!=null) return;
  const total=treasuresOf(C);
  const cands=S.players.filter(p=>p.id!==b.id && !p.dead && !C.asked[p.id] && wouldWinWith(C,p))
    .sort((x,y)=>(y.human?1:0)-(x.human?1:0));
  for(const p of cands){
    C.asked[p.id]=true;
    const offer=total>0 ? Math.max(1,Math.floor(total/2)) : 0;
    if(p.human){
      const r=evalCombat(C);
      const v=await ask(()=>({title:`${b.name} bittet dich um Hilfe`, text:`${b.name} kämpft gegen ${monNames(C)} und steht bei ${r.a} gegen ${r.b}. Mit dir wären es ${r.a+power(p)}. Angebot: ${offer} von ${total} ${pl(total,'Schatz','Schätzen')}.`,
        hint:[`Hilfst du, steigt ${b.name} auf Stufe ${Math.min(10,b.lvl+levelsGained(C))}.${hasRace(p,'elf')?' Als Elf steigst du selbst 1 Stufe auf.':''}`,'Verliert ihr trotzdem (z. B. weil jemand eingreift), musst du auch weglaufen.'],
        opts:[{l:`Helfen (für ${offer} ${pl(offer,'Schatz','Schätze')})`,v:'yes',kind:'primary'},{l:'Ablehnen',v:'no'}]}), 'botHelp', {b, offer});
      if(v==='yes'){ C.h=0; C.deal=offer; log(`Du hilfst ${b.name} für ${offer} ${pl(offer,'Schatz','Schätze')}.`,'good'); ruleOnce('helper','Mit Helfer zählen beide Kampfstärken. Verliert ihr, müssen beide einzeln weglaufen.'); return; }
      log(`Du lehnst ab.`);
    } else {
      const ans=botAcceptHelp(p,C,offer);
      log(`${b.name} bittet ${p.name} um Hilfe (${offer} ${pl(offer,'Schatz','Schätze')}).`);
      await sleep(spd(0.6));
      if(ans.yes){ C.h=p.id; C.deal=offer; log(`${p.name}: „${ans.why}“`,'good'); return; }
      log(`${p.name}: „${ans.why}“`);
    }
  }
}
async function botsInterfere(C){
  let any=false;
  for(const b of S.players){
    if(b.human || b.id===C.f || b.id===C.h || b.dead) continue;
    const r=evalCombat(C); if(!r.win) break;
    const f=P(C.f);
    const threat=f.lvl+levelsGained(C)>=10;
    if((C.intf[b.id]||0) >= (threat?2:1)) continue;
    const others=S.players.filter(x=>x.id!==f.id);
    const leading=f.lvl>=Math.max(...others.map(x=>x.lvl));
    const chance=threat?1:Math.min(1,(leading?0.45:0.15)*diffF());
    if(Math.random()>chance) continue;
    if(botPlayAgainst(b,C,threat)){ C.intf[b.id]=(C.intf[b.id]||0)+1; any=true; await sleep(spd()); }
  }
  return any;
}
function botPlayAgainst(b,C,threat){
  const opts=[];
  b.hand.forEach(c=>{ if(c.k==='enh' && c.v>0) opts.push({c,v:c.v,kind:'enh'}); if(c.k==='oneshot' && c.b) opts.push({c,v:c.b,kind:'os'}); });
  const w=b.hand.find(c=>c.k==='wander'), wm=b.hand.filter(c=>c.k==='monster').sort((x,y)=>y.lvl-x.lvl)[0];
  if(w && wm) opts.push({c:w,m:wm,v:wm.lvl,kind:'wander'});
  if(hasCls(b,'dieb') && !C.stabbed[b.id] && b.hand.length) opts.push({v:2,kind:'stab'});
  if(!opts.length) return false;
  const r=evalCombat(C);
  const need=r.a-r.b+(r.tieWin?1:0);
  opts.sort((x,y)=>x.v-y.v);
  let pick=opts.find(o=>o.v>=need);
  if(!pick){ if(!threat) return false; pick=opts[opts.length-1]; }
  const f=P(C.f);
  fx('interfere',{by:b, kind:pick.kind});
  if(pick.kind==='enh'){ take(b,pick.c); const m=strongestMon(C); m.enh.push(pick.c); log(`${b.name} spielt „${pick.c.n}“ (${sign(pick.c.v)}) auf ${m.c.n}!`,'bad'); ruleOnce('enh','Monsterverstärker darf jeder in jeden Kampf spielen. Sie verändern auch die Zahl der Schätze.'); }
  else if(pick.kind==='os'){ take(b,pick.c); C.used.push(pick.c); C.mB.push({l:`${pick.c.n} (von ${b.name})`,v:pick.c.b}); log(`${b.name} setzt ${pick.c.n} für das Monster ein (+${pick.c.b})!`,'bad'); ruleOnce('osmon','Einmal-Gegenstände dürfen auch für das Monster gespielt werden, direkt von der Hand.'); }
  else if(pick.kind==='wander'){ take(b,pick.c); take(b,pick.m); discard(pick.c); C.mons.push({c:pick.m,enh:[]}); log(`${b.name} spielt „Ungebetener Gast“: <b>${pick.m.n}</b> (Stufe ${pick.m.lvl}) mischt mit!`,'bad'); ruleOnce('wander','Bei mehreren Monstern zählen alle zusammen. Bei einer Niederlage wird vor jedem einzeln weggelaufen.'); }
  else if(pick.kind==='stab'){ const c=b.hand.slice().sort((x,y)=>keepValue(b,x)-keepValue(b,y))[0]; take(b,c); discard(c); C.stabbed[b.id]=true; C.pB.push({l:`${b.name} fällt in den Rücken (Dieb)`,v:-2}); log(`${b.name} fällt ${nmD(f)} als Dieb in den Rücken: −2!`,'bad'); }
  return true;
}
async function winCombat(C){
  const f=P(C.f), h=C.h!=null?P(C.h):null, lv=levelsGained(C);
  fx('win',{p:f, mine: f.human || (h&&h.human)});
  f.lvl+=lv;
  log(`${nm(f)} ${V(f,'besiegst','besiegt')} ${monNames(C)}${h?` mit Hilfe von ${nmD(h)}`:''} und ${V(f,'steigst','steigt')} ${lv} ${pl(lv,'Stufe','Stufen')} auf: Stufe ${Math.min(f.lvl,10)}.`,'good');
  if(f.lvl>=10){ f.lvl=10; S.winner=f.id; log(f.human ? 'Stufe 10! Du hast gewonnen!' : `${f.name} erreicht Stufe 10 und gewinnt das Spiel.`, f.human?'good':'bad'); render(); return; }
  if(h && hasRace(h,'elf')){ const g=Math.min(C.mons.length,Math.max(0,9-h.lvl)); if(g>0){ h.lvl+=g; log(`${nm(h)} ${V(h,'steigst','steigt')} als Elf-Helfer auf: Stufe ${h.lvl}.`,'good'); ruleOnce('elfhelp','Elfen steigen auf, wenn sie jemandem helfen, ein Monster zu besiegen.'); } }
  const n=treasuresOf(C), drawn=[];
  for(let i=0;i<n;i++){ const t=drawTr(); if(t) drawn.push(t); }
  if(h){
    shuffle(drawn);
    const give=drawn.splice(0,Math.min(C.deal,drawn.length));
    h.hand.push(...give); f.hand.push(...drawn);
    log(`Die ${n} ${pl(n,'Schatz','Schätze')} werden offen gezogen. ${nm(h)} ${V(h,'bekommst','bekommt')} ${give.length ? give.map(c=>c.n).join(', ') : 'nichts'}, ${nm(f)} ${V(f,'bekommst','bekommt')} ${drawn.length ? drawn.map(c=>c.n).join(', ') : 'nichts'}.`);
    ruleOnce('opentr','Mit Helfer werden Schätze offen gezogen und wie abgesprochen verteilt.');
  } else {
    f.hand.push(...drawn);
    if(f.human) log(`Du ziehst ${n} ${pl(n,'Schatz','Schätze')} verdeckt: ${drawn.map(c=>`<b>${c.n}</b>`).join(', ')||'keine'}.`,'good');
    else log(`${f.name} zieht ${n} ${pl(n,'Schatz','Schätze')} verdeckt.`);
    ruleOnce('hidtr','Allein gewonnen: Die Schätze werden verdeckt gezogen.');
  }
  render();
}
async function loseCombat(C){
  const f=P(C.f), h=C.h!=null?P(C.h):null;
  fx('lose',{p:f, mine: f.human || (h&&h.human)});
  log(`${nm(f)} ${V(f,'verlierst','verliert')} den Kampf und ${V(f,'musst','muss')} weglaufen!`,'bad');
  ruleOnce('lose','Verloren heißt: keine Stufen, keine Schätze. Jeder Beteiligte würfelt für jedes Monster: ab 5 gelingt die Flucht.');
  for(const p of [f,h].filter(Boolean)){
    for(let i=0;i<C.mons.length;i++){ if(p.dead) break; if(await runAway(p,C.mons[i],i,C.mons.length)==='all') break; }
  }
}
function severe(bad){ if(bad.t==='death') return true; if(bad.t==='lvl') return bad.n>=2; if(bad.t==='multi') return bad.l.length>=2 || bad.l.some(severe); if(bad.t==='hand') return bad.n>=5; return false; }
async function runAway(p,m,i=0,n=1){
  const left=n-i;
  if(m.c.np && p.lvl<=m.c.np){ log(`${m.c.n} verfolgt niemanden bis Stufe ${m.c.np}. ${nm(p)} ${V(p,'entkommst','entkommt')} automatisch.`,'good'); ruleOnce('np','„Verfolgt niemanden bis Stufe X“: Wer diese Stufe oder niedriger hat, entkommt ohne Würfeln.'); return; }
  const mod=runBonus(p)+(m.c.run||0);
  const need=5-mod;
  const nebel=p.hand.find(c=>c.escape);
  if(p.human){
    const parts=[]; if(hasRace(p,'elf')) parts.push('Elf +1'); p.eq.forEach(i=>{ if(i.run && usable(p,i)) parts.push(`${i.n} +${i.run}`); }); if(m.c.run) parts.push(`${m.c.n} ${sign(m.c.run)}`);
    const v=await ask(()=>({title:`Weglaufen vor ${m.c.n}${n>1?` (Monster ${i+1} von ${n})`:''}`, text: need<=1 ? 'Mit deinen Boni klappt die Flucht auf jeden Fall.' : need>6 ? 'Mit diesen Mali schaffst du es nur mit Hilfe von Karten.' : `Du brauchst eine ${need}${need<6?' oder mehr':''}. Grundwert 5${parts.length?', '+parts.join(', '):''}.`,
      hint:[`Misslingt es: ${m.c.badTxt}`, ...(n>1?['Bei mehreren Monstern läufst du vor jedem einzeln weg.']:[]), ...(nebel?[left>1?`Mit Nebelpulver entkommst du sicher, und zwar vor allen ${left} übrigen Monstern.`:'Mit Nebelpulver entkommst du sicher.']:[])],
      opts:[{l:'Würfeln',v:'roll',kind:'primary'}, ...(nebel?[{l:'Nebelpulver einsetzen',v:'nebel'}]:[])]}), 'run', {m, left});
    if(v==='nebel'){ take(p,nebel); discard(nebel); log(`Du verschwindest im Nebelpulver und entkommst${left>1?' allen übrigen Monstern':''}!`,'good'); return 'all'; }
  } else if(nebel && (severe(m.c.bad) || left>1)){ take(p,nebel); discard(nebel); log(`${p.name} verschwindet im Nebelpulver und entkommt${left>1?' allen übrigen Monstern':''}.`,'good'); return 'all'; }
  let roll=await rollDie(p), total=roll+mod;
  log(`${nm(p)} ${V(p,'würfelst','würfelt')} eine ${roll}${mod?` (${sign(mod)} = ${total})`:''}.`);
  if(total<5 && hasRace(p,'halbling') && p.hand.length){
    if(p.human){
      const sel=await selectCards({ctx:'halbling', title:'Halbling: neu würfeln', text:'Wirf 1 Karte ab, um noch einmal zu würfeln.', min:1, max:1, optional:true, filter:(c,w)=>w==='hand', confirm:()=>'Abwerfen und neu würfeln'});
      if(sel && sel.length){ const c=findCard(sel[0]); take(p,c); discard(c); roll=await rollDie(p); total=roll+mod; log(`Neuer Wurf: ${roll}${mod?` (${sign(mod)} = ${total})`:''}.`); }
    } else { const c=p.hand.slice().sort((x,y)=>keepValue(p,x)-keepValue(p,y))[0]; take(p,c); discard(c); roll=await rollDie(p); total=roll+mod; log(`${p.name} wirft als Halbling eine Karte ab und würfelt neu: ${roll}${mod?` (${sign(mod)} = ${total})`:''}.`); }
  }
  if(total<5 && hasCls(p,'zauberer') && p.hand.length>=5-total && 5-total<=3){
    const k=5-total;
    if(p.human){
      const sel=await selectCards({ctx:'zauberer', title:'Zauberer: Fluchtzauber', text:`Wirf ${k} ${pl(k,'Karte','Karten')} ab, um den Wurf auf 5 zu bringen (je +1).`, min:k, max:k, optional:true, filter:(c,w)=>w==='hand', confirm:()=>'Abwerfen'});
      if(sel && sel.length){ sel.map(findCard).forEach(c=>{ take(p,c); discard(c); }); total+=k; log(`Du wirfst ${k} ${pl(k,'Karte','Karten')} ab: Der Wurf zählt jetzt ${total}.`); }
    } else if(severe(m.c.bad) || k===1){ const cs=p.hand.slice().sort((x,y)=>keepValue(p,x)-keepValue(p,y)).slice(0,k); cs.forEach(c=>{ take(p,c); discard(c); }); total+=k; log(`${p.name} wirft als Zauberer ${k} ${pl(k,'Karte','Karten')} ab: Der Wurf zählt ${total}.`); }
  }
  if(total>=5){ log(`${nm(p)} ${V(p,'entkommst','entkommt')}!`,'good'); fx('escape',{p}); }
  else { log(`Flucht misslungen: ${m.c.badTxt}`,'bad'); fx('hurt',{p}); applyBad(p,m.c.bad); render(); await sleep(spd(0.6)); }
}
async function rollDie(p){
  const final=1+rnd(6);
  if(HEADLESS) return final;
  const reduce=window.matchMedia && (matchMedia('(prefers-reduced-motion: reduce)').matches || UI.reduce);
  fx('dice',{p});
  if(!reduce){ for(let i=0;i<10;i++){ UI.roll={who:nm(p),face:1+rnd(6),rolling:true}; render(); await sleep(75); } }
  UI.roll={who:nm(p),face:final,rolling:false}; fx('diceland',{p,face:final}); render();
  await sleep(Math.max(500,spd(0.9)));
  return final;
}

/* ================= Flüche und Niederlagen ================= */
async function applyCurse(t,c,by){
  const am=t.hand.find(x=>x.k==='amulet');
  if(am){
    let use=true;
    if(t.human){ const v=await ask(()=>({title:`Fluch: ${c.n}`, text:`${c.txt} Du hast ein Glücksamulett.`, hint:['Das Amulett hebt den Fluch auf. Danach ist es weg.'], opts:[{l:'Glücksamulett einsetzen',v:'yes',kind:'primary'},{l:'Fluch hinnehmen',v:'no'}]}), 'amulet', {c}); use=v==='yes'; }
    if(use){ take(t,am); discard(am); discard(c); log(`${nm(t)} ${V(t,'wehrst','wehrt')} den Fluch mit dem Glücksamulett ab.`,'good'); return; }
  }
  log(`Fluch „${c.n}“ trifft ${nmA(t)}: ${c.txt}`,'bad');
  fx('curse',{p:t});
  applyBad(t,c.eff);
  discard(c);
  render();
}
function applyBad(p,eff){
  switch(eff.t){
    case 'lvl': { const b=p.lvl; p.lvl=Math.max(1,p.lvl-eff.n); if(b===p.lvl){ log(`${nm(p)} ${V(p,'bist','ist')} schon auf Stufe 1. Tiefer geht es nicht.`); ruleOnce('min1','Unter Stufe 1 kann niemand fallen.'); } else log(`${nm(p)} ${V(p,'verlierst','verliert')} ${b-p.lvl} ${pl(b-p.lvl,'Stufe','Stufen')}: jetzt Stufe ${p.lvl}.`,'bad'); break; }
    case 'slot': { const it=p.eq.find(i=>i.slot===eff.s); if(it){ take(p,it); discard(it); log(`${nm(p)} ${V(p,'verlierst','verliert')} ${it.n}.`,'bad'); } else { log(`${nm(p)} ${V(p,'trägst','trägt')} keine ${SLOTN[eff.s]}. Glück gehabt!`); ruleOnce('nothing','Betrifft ein Fluch oder eine Niederlage etwas, das du nicht hast, passiert einfach nichts.'); } break; }
    case 'best': { const all=[...p.eq,...p.pack].sort((a,b)=>(b.b||0)-(a.b||0)||(b.g-a.g)); if(all.length){ take(p,all[0]); discard(all[0]); log(`${nm(p)} ${V(p,'verlierst','verliert')} ${all[0].n}.`,'bad'); } else log(`${nm(p)} ${V(p,'hast','hat')} keine Gegenstände zu verlieren.`); break; }
    case 'hand': { const n=Math.min(eff.n,p.hand.length), lost=[]; for(let i=0;i<n;i++){ const c=p.hand.splice(rnd(p.hand.length),1)[0]; lost.push(c); discard(c); }
      log(n ? `${nm(p)} ${V(p,'wirfst','wirft')} ${eff.n>=99?'die ganze Hand':n+' '+pl(n,'Handkarte','Handkarten')} ab: ${lost.map(c=>`<b>${cardLabel(c)}</b>`).join(', ')}.` : `${nm(p)} ${V(p,'hast','hat')} keine Handkarten.`,'bad');
      if(n) ruleOnce('discardpublic','Abgeworfene Karten liegen offen in der Ablage. Jeder darf sehen, was weg ist.');
      break; }
    case 'class': { if(p.cls){ log(`${nm(p)} ${V(p,'verlierst','verliert')} die Klasse ${p.cls.n}.`,'bad'); discard(p.cls); p.cls=null; } else { p.lvl=Math.max(1,p.lvl-1); log(`Keine Klasse da: ${nm(p)} ${V(p,'verlierst','verliert')} stattdessen 1 Stufe.`,'bad'); } break; }
    case 'race': { if(p.race){ log(`${nm(p)} ${V(p,'verlierst','verliert')} die Rasse ${p.race.n} und ${V(p,'bist','ist')} wieder Mensch.`,'bad'); discard(p.race); p.race=null; } else log(`${nm(p)} ${V(p,'bist','ist')} sowieso Mensch. Nichts passiert.`); break; }
    case 'death': kill(p); break;
    case 'multi': eff.l.forEach(e=>applyBad(p,e)); break;
  }
}
function kill(p){
  log(`${nm(p)} ${V(p,'bist','ist')} tot!`,'bad');
  fx('death',{p});
  ruleOnce('death','Tod: Stufe, Rasse und Klasse bleiben. Gegenstände und Handkarten sind weg, die anderen teilen sich deine Ausrüstung. Im nächsten Zug gibt es neue 4 + 4 Karten.');
  const loot=shuffle([...p.eq,...p.pack]); p.eq=[]; p.pack=[];
  if(p.human && p.hand.length) log(`Deine Handkarten kommen in die Ablage: ${p.hand.map(c=>`<b>${cardLabel(c)}</b>`).join(', ')}.`,'bad');
  p.hand.forEach(discard); p.hand=[];
  const others=S.players.filter(o=>o.id!==p.id).sort((a,b)=>b.lvl-a.lvl);
  for(const o of others){ if(!loot.length) break; const it=loot.pop(); o.hand.push(it); log(`${o.human?'Du nimmst dir':o.name+' nimmt sich'}: ${it.n}.`); }
  loot.forEach(discard);
  p.dead=true;
}

/* ================= Deine Kartenaktionen ================= */
function findCard(uid){
  if(!S) return null;
  const p=me();
  const pools=[p.hand,p.eq,p.pack];
  for(const a of pools){ const c=a.find(x=>x.uid===uid); if(c) return c; }
  if(p.race && p.race.uid===uid) return p.race;
  if(p.cls && p.cls.uid===uid) return p.cls;
  if(S.reveal && S.reveal.uid===uid) return S.reveal;
  const o=ownerOf(uid); if(o) return o.c;
  if(S.combat){ for(const m of S.combat.mons){ if(m.c.uid===uid) return m.c; const e=m.enh.find(x=>x.uid===uid); if(e) return e; } }
  return null;
}
function ownerOf(uid){
  for(const q of S.players){ if(q.human) continue;
    let c=q.eq.find(x=>x.uid===uid); if(c) return {q,c,z:'eq'};
    c=q.pack.find(x=>x.uid===uid); if(c) return {q,c,z:'pack'};
    if(q.race && q.race.uid===uid) return {q,c:q.race,z:'rc'};
    if(q.cls && q.cls.uid===uid) return {q,c:q.cls,z:'rc'}; }
  return null;
}
function cardActions(c, where){
  const p=me(), C=S.combat, A=[];
  if(!UI.prompt || S.winner!=null || UI.sel) return [{info:'Warte, bis du wieder an der Reihe bist oder gefragt wirst.'}];
  const myTurn=S.cur===0, free=isFree();
  const live=C && !C.resolved;
  const inMine=live && (C.f===0 || C.h===0);
  const sellAct = () => { if(free && c.g>0 && (c.k==='item'||c.k==='oneshot')) A.push({l:`Verkaufen (${fmt(c.g)} Gold)`, fn:()=>startSell(c.uid)}); };
  if(where==='hand'){
    switch(c.k){
      case 'item': {
        if(free){ const ce=canEquip(p,c); A.push({l:'Ausrüsten', fn:()=>doEquip(c), dis: ce.ok?false:ce.why}); }
        else if(myTurn && C) A.push({info:'Im Kampf darfst du keine Gegenstände anlegen.'});
        else A.push({info:'Gegenstände legst du nur im eigenen Zug außerhalb von Kämpfen an.'});
        sellAct(); break;
      }
      case 'race': case 'class': {
        if(myTurn) A.push({l:`Ausspielen${(c.k==='race'?p.race:p.cls)?' (ersetzt '+(c.k==='race'?p.race.n:p.cls.n)+')':''}`, fn:()=>playRC(c)});
        else A.push({info:'Rassen und Klassen spielst du im eigenen Zug aus.'}); break;
      }
      case 'oneshot': {
        if(live && c.b){
          if(inMine) A.push({l:`Für unsere Seite (+${c.b})`, fn:()=>playOneShot(c,'p'), kind:'primary'});
          else A.push({l:`Für ${P(C.f).name} (+${c.b})`, fn:()=>playOneShot(c,'p')});
          A.push({l:`Für das Monster (+${c.b})`, fn:()=>playOneShot(c,'m'), kind: inMine?'':'primary'});
        } else if(c.escape) A.push({info:'Nebelpulver bietet dir das Spiel beim Weglaufen an.'});
        else A.push({info:'Einmal-Gegenstände spielst du während eines Kampfes, auch in fremden.'});
        sellAct(); break;
      }
      case 'enh': {
        if(live) C.mons.forEach(m=>A.push({l:`Auf ${m.c.n} spielen (${sign(c.v)})`, fn:()=>playEnh(c,m), kind:'primary'}));
        else A.push({info:'Monsterverstärker spielst du während eines Kampfes auf ein Monster, in jedem Kampf.'});
        break;
      }
      case 'wander': {
        const ms=p.hand.filter(x=>x.k==='monster');
        if(live && !inMine){ ms.forEach(m=>A.push({l:`Mit ${m.n} (Stufe ${m.lvl}) dazuschicken`, fn:()=>playWander(c,m), kind:'primary'})); if(!ms.length) A.push({info:'Dafür brauchst du zusätzlich ein Monster auf der Hand.'}); }
        else A.push({info:'Spiele diese Karte im Kampf eines Mitspielers, zusammen mit einem Monster von deiner Hand.'});
        break;
      }
      case 'monster': A.push({info: myTurn && S.phase===2 && !C ? 'Zieh das Monster aufs Spielfeld oder tippe unten auf „Monster herausfordern“.' : 'Monster von der Hand spielst du bei „Monster herausfordern“ oder mit „Ungebetener Gast“ in fremde Kämpfe.'}); break;
      case 'curse': {
        S.players.filter(x=>!x.human).forEach(t=>A.push({l:`Auf ${t.name} spielen`, fn:()=>playCurseOn(c,t)}));
        A.push({info:'Flüche von der Hand gehen jederzeit, auf jeden.'}); break;
      }
      case 'levelup': A.push({l:'Benutzen: +1 Stufe', fn:()=>useLevelUp(c), kind:'primary', dis: p.lvl>=9 ? 'Stufe 10 gibt es nur für einen Monstersieg.' : false}); break;
      case 'amulet': A.push({info:'Das Spiel fragt dich automatisch, wenn dich ein Fluch trifft.'}); break;
    }
  } else if(where==='eq'){
    if(free){ A.push({l:'In den Rucksack legen', fn:()=>{ take(p,c); p.pack.push(c); log(`${c.n} kommt in den Rucksack.`); }}); sellAct(); }
    else A.push({info:'Ausrüstung änderst du nur im eigenen Zug außerhalb von Kämpfen.'});
  } else if(where==='pack'){
    if(free){ const ce=canEquip(p,c); A.push({l:'Anlegen', fn:()=>doEquip(c), dis: ce.ok?false:ce.why, kind:'primary'}); sellAct(); }
    else A.push({info:'Aus dem Rucksack holst du Dinge nur im eigenen Zug außerhalb von Kämpfen.'});
  } else if(where==='race' || where==='cls'){
    A.push({l:'Ablegen', fn:()=>{ if(where==='race'){ discard(p.race); p.race=null; } else { discard(p.cls); p.cls=null; } log(`Du legst ${c.n} ab.`); ruleOnce('droprc','Rassen und Klassen kannst du jederzeit ablegen. Gegenstände, die sie voraussetzen, werden dann inaktiv.'); }});
  }
  return A;
}
function doEquip(c){
  const p=me(); const ce=canEquip(p,c); if(!ce.ok){ log(ce.why,'sys'); return; }
  const moved=equip(p,c);
  log(`Du rüstest ${c.n} aus.${moved.length?` ${moved.map(m=>m.n).join(', ')} ${pl(moved.length,'kommt','kommen')} in den Rucksack.`:''}`);
  if(moved.length) ruleOnce('pack','Was du nicht gleichzeitig nutzen kannst, kommt in den Rucksack. Es zählt nicht zu den Handkarten, bringt aber auch keinen Bonus.');
  if(c.big) ruleOnce('big','Große Gegenstände: Davon darfst du nur einen haben, außer du bist Zwerg.');
}
function playRC(c){
  const p=me(); take(p,c);
  if(c.k==='race'){ if(p.race){ discard(p.race); } p.race=c; } else { if(p.cls){ discard(p.cls); } p.cls=c; }
  log(`Du bist jetzt ${c.n}: ${c.txt}`,'good');
  ruleOnce('onerc','Du hast höchstens 1 Rasse und 1 Klasse. Eine neue Karte ersetzt die alte.');
}
function markIntf(){ const C=S.combat; if(C && C.f!==0){ C.hchg=true; } fx('play',{}); }
function playOneShot(c,side){
  const p=me(), C=S.combat; take(p,c); C.used.push(c);
  if(side==='p'){ C.pB.push({l:`${c.n} (von dir)`,v:c.b}); log(`Du setzt ${c.n} für ${C.f===0||C.h===0?'eure Seite':P(C.f).name} ein (+${c.b}).`,'good'); }
  else { C.mB.push({l:`${c.n} (von dir)`,v:c.b}); log(`Du setzt ${c.n} für das Monster ein (+${c.b}).`); if(C.f!==0 && C.h!==0) C.asked[0]=true; }
  markIntf();
}
function playEnh(c,m){
  const p=me(), C=S.combat; take(p,c); m.enh.push(c);
  log(`Du spielst „${c.n}“ (${sign(c.v)}) auf ${m.c.n}.`);
  ruleOnce('enh','Monsterverstärker darf jeder in jeden Kampf spielen. Sie verändern auch die Zahl der Schätze.');
  if(C.f!==0 && C.h!==0 && c.v>0) C.asked[0]=true;
  markIntf();
}
function playWander(w,m){
  const p=me(), C=S.combat; take(p,w); take(p,m); discard(w); C.mons.push({c:m,enh:[]});
  log(`Du spielst „Ungebetener Gast“: <b>${m.n}</b> (Stufe ${m.lvl}) mischt mit!`);
  ruleOnce('wander','Bei mehreren Monstern zählen alle zusammen. Bei einer Niederlage wird vor jedem einzeln weggelaufen.');
  C.asked[0]=true; markIntf();
}
function playCurseOn(c,t){
  const p=me(); take(p,c);
  log(`Du spielst den Fluch „${c.n}“ auf ${t.name}.`);
  ruleOnce('cursehand','Flüche von der Hand darf man jederzeit auf jeden Spieler spielen.');
  if(S.combat && !S.combat.resolved) { markIntf(); if(S.combat.f===t.id) S.combat.asked[0]=true; }
  applyCurse(t,c,p).catch(e=>{ if(e!==STALE) console.error(e); });
}
function useLevelUp(c){
  const p=me(); if(p.lvl>=9) return; take(p,c); discard(c); p.lvl++;
  log(`Du spielst „${c.n}“: Stufe ${p.lvl}.`,'good');
  ruleOnce('levelup','Stufenkarten darf man jederzeit spielen, aber nie für die Siegstufe 10.');
}
async function startSell(pre){
  const p=me(); if(!isFree()) return;
  if(p.lvl>=9){ log('Auf Stufe 9 bringt Verkaufen nichts mehr: Stufe 10 gibt es nur für einen Monstersieg.','sys'); return; }
  try{
    const sel=await selectCards({ctx:'sell', title:'Gegenstände verkaufen', text:'Wähle Gegenstände aus Hand, Ausrüstung oder Rucksack. Je 1.000 Gold gibt es 1 Stufe.', min:1, max:99, pre: Array.isArray(pre)?pre:(pre?[pre]:[]), cancel:true,
      filter:(c,w)=> (c.k==='item'||c.k==='oneshot') && c.g>0 && ['hand','eq','pack'].includes(w),
      extra:cs=>{ const v=sellValue(p,cs), lv=Math.min(v.lv,9-p.lvl), rest=v.sum-lv*1000; return `Summe: <b>${fmt(v.sum)} Gold</b>${v.dbl?` (Halbling: ${v.dbl.n} zählt doppelt)`:''} · ergibt <b>${lv} ${pl(lv,'Stufe','Stufen')}</b>${rest>0&&cs.length?` · ${fmt(rest)} Gold verfallen`:''}`; },
      validate:cs=>{ if(!cs.length) return null; return sellValue(p,cs).lv<1 ? 'Noch keine 1.000 Gold zusammen.' : null; },
      confirm:()=>'Verkaufen'});
    if(!sel || !sel.length) return;
    const cs=sel.map(findCard).filter(Boolean), v=sellValue(p,cs), lv=Math.min(v.lv,9-p.lvl);
    if(lv<1) return;
    cs.forEach(c=>{ take(p,c); discard(c); }); p.lvl+=lv; if(v.dbl) p.soldDouble=true;
    log(`Du verkaufst ${cs.map(c=>c.n).join(', ')} für ${fmt(v.sum)} Gold${v.dbl?` (als Halbling ${v.dbl.n} doppelt)`:''}: Stufe ${p.lvl}.`,'good');
    if(v.dbl) ruleOnce('halbsell','Halbling: Einmal pro Zug darf ein Gegenstand zum doppelten Preis verkauft werden.');
    ruleOnce('sell','Verkaufen: Je 1.000 Gold gibt es 1 Stufe. Wechselgeld gibt es nicht.');
  }catch(e){ if(e!==STALE) throw e; }
}


/* ================= Zug-Empfehlung ================= */
function zoneOf(uid){ const p=me(); if(p.hand.some(c=>c.uid===uid)) return 'hand'; if(p.pack.some(c=>c.uid===uid)) return 'pack'; if(p.eq.some(c=>c.uid===uid)) return 'eq'; return null; }
function cheapest(p,n){ return p.hand.slice().sort((a,b)=>keepValue(p,a)-keepValue(p,b)).slice(0,n); }
const names = cs => cs.map(c=>c.n).join(', ');
function dblWhy(v){ return v.dbl ? ` Als Halbling darfst du einmal pro Zug einen Gegenstand doppelt verkaufen: ${v.dbl.n} bringt ${fmt(v.dbl.g*2)} statt ${fmt(v.dbl.g)} Gold.` : ''; }
function chooseSell(p,cands){
  const maxLv=9-p.lvl, target=Math.min(Math.floor(sellValue(p,cands).sum/1000),maxLv);
  if(target<1) return [];
  const pick=[]; for(const c of cands.slice().sort((a,b)=>b.g-a.g)){ pick.push(c); if(sellValue(p,pick).sum>=target*1000) break; }
  for(const c of pick.slice().sort((a,b)=>a.g-b.g)){ const rest=pick.filter(x=>x!==c); if(rest.length && sellValue(p,rest).sum>=target*1000) pick.splice(pick.indexOf(c),1); }
  return pick;
}
function bestRC(p,kind){
  const cards=p.hand.filter(c=>c.k===kind); if(!cards.length) return null;
  const items=[...p.hand,...p.pack,...p.eq].filter(c=>c.k==='item' && c.req);
  const score=c=>items.filter(i=>kind==='race'?i.req.race===c.r:i.req.cls===c.c).reduce((s,i)=>s+i.b,0)+((kind==='race'&&c.r==='elf')||(kind==='class'&&c.c==='krieger')?0.5:0);
  return cards.sort((a,b)=>score(b)-score(a))[0];
}
function gainWhy(p,it){
  const q=Object.assign({},p,{eq:[...p.eq],pack:[...p.pack],hand:[...p.hand]});
  const b0=power(q), r0=runBonus(q), moved=equip(q,it), b1=power(q), r1=runBonus(q), parts=[];
  if(b1!==b0) parts.push(`Kampfstärke ${b0} → ${b1}`);
  if(r1!==r0) parts.push(`Weglaufen ${sign(r0)} → ${sign(r1)}`);
  return parts.join(', ')+'.'+(moved.length?` ${names(moved)} ${pl(moved.length,'wandert','wandern')} in den Rucksack.`:'')+' Nur ausgerüstete Gegenstände zählen im Kampf.';
}
function curseTargetAdv(p,c,charity){
  const ts=S.players.filter(o=>!o.human && !o.dead && curseHits(o,c)).sort((a,b)=>b.lvl-a.lvl || power(b)-power(a));
  if(!ts.length) return null;
  const t=ts[0];
  return charity || t.lvl>=p.lvl+2 || t.lvl>=8 ? t : null;
}
function curseLoss(f,c){
  const e=c.eff;
  if(e.t==='slot'){ const it=f.eq.find(i=>i.slot===e.s); return it && usable(f,it) ? (it.b||0) : 0; }
  if(e.t==='lvl') return Math.min(e.n, f.lvl-1);
  if(e.t==='class'){ if(!f.cls) return f.lvl>1?1:0; return f.eq.filter(i=>i.req && i.req.cls===f.cls.c).reduce((s,i)=>s+i.b,0); }
  if(e.t==='race'){ if(!f.race) return 0; return f.eq.filter(i=>i.req && i.req.race===f.race.r).reduce((s,i)=>s+i.b,0); }
  return 0;
}
function adviseFree(p,charity){
  const r=bestRC(p,'race');
  if(r && !p.race) return {uid:r.uid, act:'Ausspielen', text:`Spiel die Rasse ${r.n} aus.`, why:`Ohne Rasse bist du Mensch ohne Fähigkeit. ${r.n}: ${r.txt}`};
  const k=bestRC(p,'class');
  if(k && !p.cls) return {uid:k.uid, act:'Ausspielen', text:`Spiel die Klasse ${k.n} aus.`, why:`${k.n}: ${k.txt}`};
  for(const kind of ['race','class']){
    const cur=kind==='race'?p.race:p.cls; if(!cur) continue;
    const inactive=[...p.eq,...p.pack].filter(i=>i.k==='item' && i.req && !usable(p,i));
    for(const card of p.hand.filter(c=>c.k===kind)){
      const on=inactive.filter(i=>kind==='race'?i.req.race===card.r:i.req.cls===card.c);
      const off=p.eq.filter(i=>i.req && usable(p,i) && (kind==='race'?i.req.race===cur.r:i.req.cls===cur.c));
      if(on.reduce((s,i)=>s+i.b,0)-off.reduce((s,i)=>s+i.b,0)>=2) return {uid:card.uid, act:'Ausspielen', text:`Wechsle zu ${card.n}.`, why:`Damit ${pl(on.length,'wird','werden')} ${names(on)} aktiv.`};
    }
  }
  const items=[...p.hand.filter(c=>c.k==='item'),...p.pack].map(c=>({c,g:gainOf(p,c)})).filter(x=>x.g>0).sort((a,b)=>b.g-a.g);
  if(items.length){ const it=items[0].c; return {uid:it.uid, act:p.pack.includes(it)?'Anlegen':'Ausrüsten', text:`Rüste ${it.n} aus.`, why:gainWhy(p,it)}; }
  const lu=p.hand.find(c=>c.k==='levelup');
  if(lu && p.lvl<9) return {uid:lu.uid, act:'Benutzen', text:`Benutze „${lu.n}“.`, why:'Eine Stufe mehr heißt +1 Kampfstärke und ein Schritt zum Sieg. Aufheben bringt fast nie etwas.'};
  if(p.lvl<9){
    const pick=chooseSell(p,[...p.pack,...p.hand.filter(c=>c.k==='item' && gainOf(p,c)<=0)]);
    if(pick.length){ const v=sellValue(p,pick), lv=Math.min(v.lv,9-p.lvl);
      return {sell:true, picks:pick.map(c=>c.uid), text:`Verkaufe ${names(pick)}.`, why:`${pl(pick.length,'Den','Die')} nutzt du gerade nicht.${dblWhy(v)} Zusammen ${fmt(v.sum)} Gold ergeben ${lv} ${pl(lv,'Stufe','Stufen')}.`}; }
  }
  for(const c of p.hand.filter(c=>c.k==='curse')){
    const t=curseTargetAdv(p,c,charity);
    if(t) return {uid:c.uid, act:`Auf ${t.name}`, text:`Spiel den Fluch „${c.n}“ auf ${t.name}.`, why: charity ? `Du musst ohnehin Karten loswerden. Besser ein Fluch auf ${t.name} (Stufe ${t.lvl}) als ein Geschenk.` : `${t.name} liegt mit Stufe ${t.lvl} vorn. Den Führenden zu bremsen ist die beste Verwendung für Flüche.`};
  }
  return null;
}
function adviseTrouble(p){
  const os=p.hand.filter(c=>c.k==='oneshot' && c.b).reduce((s,c)=>s+c.b,0);
  const ms=p.hand.filter(c=>c.k==='monster').map(m=>({m, lv:m.lvl+(m.vs && hasRace(p,m.vs.race)?m.vs.val:0)}))
    .filter(x=>{ const buf=power(p)+os-x.lv, win=p.lvl+(x.m.up||1)>=10; return power(p)>x.lv && buf>=(win?7:4); })
    .sort((a,b)=>b.m.lvl-a.m.lvl);
  if(ms.length){ const x=ms[0], win=p.lvl+(x.m.up||1)>=10;
    return {opt:'m'+x.m.uid, text:`Kämpfe gegen ${x.m.n}.`, why:`Kampfstärke ${power(p)} gegen ${x.lv}${os?`, dazu +${os} aus Einmal-Gegenständen als Reserve`:''}. Genug Puffer, falls jemand eingreift. Bringt ${x.m.tr} ${pl(x.m.tr,'Schatz','Schätze')} und eine Stufe.${win?' Das wäre der Sieg, rechne mit Gegenwehr.':''}`}; }
  return {opt:'loot', text:'Durchsuche den Raum.', why: p.hand.some(c=>c.k==='monster') ? 'Keins deiner Hand-Monster schlägst du mit genug Puffer. Durchsuchen bringt eine Karte ohne Risiko.' : 'Du hast kein Monster auf der Hand. Durchsuchen bringt eine Karte ohne Risiko.'};
}
function bestHelper(C){
  const f=P(C.f); if(f.lvl+levelsGained(C)>=10) return null;
  const elf=x=>hasRace(x,'elf') && x.lvl<9 ? 1 : 0;
  return S.players.filter(x=>!x.human && !x.dead && x.id!==C.f && !C.asked[x.id] && wouldWinWith(C,x))
    .sort((a,b)=>elf(b)-elf(a) || a.lvl-b.lvl || power(b)-power(a))[0] || null;
}
function adviseFight(p,C){
  const r=evalCombat(C);
  if(r.win){ const m=r.a-r.b; return {opt:'done', text:'Sag „Fertig“.', why: m>=3 ? `Du liegst ${m} vorn. Halte Einmal-Gegenstände zurück, bis jemand eingreift.` : 'Knapp vorn. Greift jemand ein, darfst du danach noch reagieren. Vorher Karten zu verbrauchen wäre Verschwendung.'}; }
  const need=r.b-r.a+(r.tieWin?0:1);
  const res=[];
  p.hand.forEach(c=>{
    if(c.k==='oneshot' && c.b) res.push({c,v:c.b,act:'Für unsere Seite',lbl:`${c.n} (+${c.b})`});
    if(c.k==='enh' && c.v<0) res.push({c,v:-c.v,act:'Auf ',lbl:`„${c.n}“ (${sign(c.v)}) auf das Monster`});
  });
  const spare=p.hand.length-res.length;
  let ab=null;
  if(hasCls(p,'priester') && C.mons.some(m=>m.c.undead) && C.turning<3) ab={opt:'turn',per:3,n:Math.min(3-C.turning,spare),name:'Priester'};
  else if(hasCls(p,'krieger') && C.berserk<3) ab={opt:'berserk',per:1,n:Math.min(3-C.berserk,spare),name:'Krieger'};
  const resSum=res.reduce((s,x)=>s+x.v,0), abSum=ab?ab.per*ab.n:0;
  if(resSum+abSum>=need){
    if(ab && abSum>=need){ const k=Math.ceil(need/ab.per); return {opt:ab.opt, text:`Nutze deine ${ab.name}-Fähigkeit: ${k} ${pl(k,'Karte','Karten')} abwerfen.`, why:`Dir ${pl(need,'fehlt','fehlen')} ${need}. Dafür reichen ${k} wertlose ${pl(k,'Karte','Karten')}, deine Einmal-Gegenstände behältst du.`}; }
    res.sort((a,b)=>a.v-b.v);
    const one=res.find(x=>x.v>=need);
    if(one) return {uid:one.c.uid, act:one.act, text:`Spiel ${one.lbl}.`, why:`Dir ${pl(need,'fehlt','fehlen')} ${need}. Das ist die kleinste Karte, die reicht.`};
    const big=res[res.length-1];
    return {uid:big.c.uid, act:big.act, text:`Spiel ${big.lbl}.`, why:`Dir ${pl(need,'fehlt','fehlen')} ${need}. Allein reicht keine Karte, zusammen schon. Fang mit der stärksten an.`};
  }
  if(C.h==null){
    const b=bestHelper(C);
    if(b) return {opt:'help', text:`Bitte ${b.name} um Hilfe.`, why:`Mit ${b.name} (Kampfstärke ${power(b)}) stündet ihr bei ${r.a+power(b)} gegen ${r.b}.${hasRace(b,'elf')?' Als Elf steigt '+b.name+' beim Helfen selbst auf und sagt eher Ja.':''}`};
  }
  const won=p.lvl+levelsGained(C)>=10 && C.h==null;
  return {opt:'run', text:'Gib auf und lauf weg.', why:`Dir ${pl(need,'fehlt','fehlen')} ${need}, und mit deinen Karten ist das nicht zu schaffen.${won?' Hilfe bekommst du nicht, weil du damit gewinnen würdest.':''} Heb deine Karten für später auf.`};
}
function adviseBotHelp(p,C,d){
  const b=d.b, after=Math.min(10,b.lvl+levelsGained(C));
  if(after>=9 && after>p.lvl) return {opt:'no', text:'Lehne ab.', why:`${b.name} käme auf Stufe ${after}. So nah am Sieg hilft man niemandem.`};
  if(b.lvl>=p.lvl+2) return {opt:'no', text:'Lehne ab.', why:`${b.name} liegt schon ${b.lvl-p.lvl} Stufen vor dir. Hilf lieber nicht beim Davonziehen.`};
  if(d.offer===0 && !hasRace(p,'elf')) return {opt:'no', text:'Lehne ab.', why:'Ohne Belohnung hast du nichts davon.'};
  const risky=C.mons.some(m=>severe(m.c.bad));
  return {opt:'yes', text:'Hilf mit.', why:`Du bekommst ${d.offer} ${pl(d.offer,'Schatz','Schätze')}${hasRace(p,'elf')?' und steigst als Elf selbst auf':''}, und ${b.name} zieht nicht davon.${risky?' Kleines Risiko: Greift jemand ein und ihr verliert, musst du auch weglaufen.':''}`};
}
function adviseInterfere(p,C){
  const f=P(C.f), r=evalCombat(C);
  if(C.h===0){
    if(!r.win){ const need=r.b-r.a+(r.tieWin?0:1), os=p.hand.filter(c=>c.k==='oneshot' && c.b).sort((a,b)=>a.b-b.b), pick=os.find(c=>c.b>=need)||os[os.length-1];
      if(pick) return {uid:pick.uid, act:'Für unsere Seite', text:`Spiel ${pick.n} für eure Seite.`, why:`Ihr liegt ${need} zurück. Verliert ihr, musst du auch weglaufen und bekommst keine Schätze.`}; }
    return {opt:'ok', text:'Weiter.', why: r.win ? 'Ihr gewinnt bereits. Spar dir deine Karten.' : 'Du hast nichts, was hilft.'};
  }
  if(!r.win) return {opt:'ok', text:'Nicht eingreifen.', why:`${f.name} verliert sowieso.`};
  const threat=f.lvl+levelsGained(C)>=10;
  const maxO=Math.max(...S.players.filter(x=>x.id!==f.id).map(x=>x.lvl));
  const leading=f.lvl>=maxO && f.lvl>=p.lvl+1;
  if(!threat && !leading) return {opt:'ok', text:'Nicht eingreifen.', why:`${f.name} liegt nicht vorn. Eingreifen kostet Karten, die du später gegen den Führenden brauchst.`};
  const need=r.a-r.b+(r.tieWin?1:0), opts=[];
  p.hand.forEach(c=>{
    if(c.k==='enh' && c.v>0) opts.push({c,v:c.v,act:'Auf ',lbl:`„${c.n}“ (${sign(c.v)}) auf das Monster`});
    if(c.k==='oneshot' && c.b) opts.push({c,v:c.b,act:'Für das Monster',lbl:`${c.n} für das Monster (+${c.b})`});
    if(c.k==='curse'){ const l=curseLoss(f,c); if(l>0) opts.push({c,v:l,act:`Auf ${f.name}`,lbl:`den Fluch „${c.n}“ auf ${f.name} (−${l})`}); }
  });
  const w=p.hand.find(c=>c.k==='wander'), wm=p.hand.filter(c=>c.k==='monster').sort((a,b)=>b.lvl-a.lvl)[0];
  if(w && wm) opts.push({c:w,v:wm.lvl,act:'Mit '+wm.n,lbl:`„Ungebetener Gast“ mit ${wm.n} (+${wm.lvl})`});
  if(hasCls(p,'dieb') && !C.stabbed[0] && p.hand.length) opts.push({stab:true,v:2,lbl:'als Dieb in den Rücken fallen (−2)'});
  const why0 = threat ? `Gewinnt ${f.name} diesen Kampf, ist das Spiel vorbei!` : `${f.name} liegt mit Stufe ${f.lvl} vorn.`;
  if(!opts.length) return {opt:'ok', text:'Nicht eingreifen.', why:`${why0} Du hast aber nichts Passendes auf der Hand.`};
  opts.sort((a,b)=>a.v-b.v);
  let pick=opts.find(o=>o.v>=need), why;
  if(pick) why=`${why0} ${f.name} liegt ${need} vorn, damit dreht sich der Kampf.`;
  else { if(!threat) return {opt:'ok', text:'Nicht eingreifen.', why:`${why0} Allein dreht keine deiner Karten den Kampf (${f.name} liegt ${need} vorn). Spar sie dir.`};
    pick=opts[opts.length-1]; why=`${why0} Allein reicht es nicht, aber vielleicht ziehen die anderen mit.`; }
  return pick.stab ? {opt:'stab', text:'Fall als Dieb in den Rücken.', why} : {uid:pick.c.uid, act:pick.act, text:`Spiel ${pick.lbl}.`, why};
}
function adviseRun(p,d){
  const m=d.m, need=5-(runBonus(p)+(m.c.run||0)), ch=Math.max(0,Math.min(6,7-need))/6, pc=Math.round(ch*100);
  const nebel=p.hand.find(c=>c.escape), left=d.left||1;
  if(nebel && left>1 && ch<1) return {opt:'nebel', text:'Setz das Nebelpulver ein.', why:`Es bringt dich vor allen ${left} übrigen Monstern in Sicherheit. Sonst musst du ${left}-mal würfeln.`};
  if(nebel && (severe(m.c.bad) || ch<=1/3)) return {opt:'nebel', text:'Setz das Nebelpulver ein.', why:`Ohne liegt deine Chance bei ${pc} %, und es droht: ${m.c.badTxt}`};
  return {opt:'roll', text:'Würfle.', why:`Deine Chance: ${pc} %.${nebel?' Das Nebelpulver hebst du für Schlimmeres auf.':''}`};
}
function adviseSel(p){
  const s=UI.sel;
  switch(s.ctx){
    case 'charity': { const cs=cheapest(p,s.min); return {picks:cs.map(c=>c.uid), text:`Gib ${names(cs)} ab.`, why:'Diese Karten sind für dich am wenigsten wert.'}; }
    case 'berserk': case 'turn': {
      const r=evalCombat(S.combat), per=s.ctx==='turn'?3:1, need=Math.max(1,r.b-r.a+(r.tieWin?0:1)), n=Math.min(s.max,Math.ceil(need/per)), cs=cheapest(p,n);
      return {picks:cs.map(c=>c.uid), text:`Wirf ${names(cs)} ab.`, why:`Dir ${pl(need,'fehlt','fehlen')} ${need}. Das sind deine unwichtigsten Karten.`}; }
    case 'sell': {
      const pick=chooseSell(p,[...p.pack,...p.hand.filter(c=>c.k==='item' && gainOf(p,c)<=0)]);
      if(!pick.length) return {text:'Lieber nichts verkaufen.', why:'Deine ungenutzten Gegenstände bringen keine 1.000 Gold. Ausgerüstetes zu verkaufen schwächt dich meist mehr, als die Stufe bringt.'};
      return {picks:pick.map(c=>c.uid), text:`Verkaufe ${names(pick)}.`, why:`Die trägst du nicht oder sie bringen dir nichts.${dblWhy(sellValue(p,pick))}`}; }
    case 'stab': case 'halbling': case 'zauberer': { const cs=cheapest(p,s.min); return {picks:cs.map(c=>c.uid), text:`Wirf ${names(cs)} ab.`, why:`${pl(cs.length,'Diese Karte ist','Diese Karten sind')} für dich am wenigsten wert.`}; }
  }
  return null;
}
function advise(){
  if(!S || S.winner!=null) return null;
  const p=me(); if(!p.human) return null;
  if(UI.sel) return adviseSel(p);
  if(!UI.prompt) return null;
  const pr=UI.prompt, C=S.combat, d=pr.data||{};
  switch(pr.ctx){
    case 'kick': return adviseFree(p,false) || {opt:'kick', text:'Stoß die Tür auf.', why:`Alles Sinnvolle ist ausgelegt. Deine Kampfstärke: ${power(p)}.`};
    case 'trouble': return adviseFree(p,false) || adviseTrouble(p);
    case 'charity': {
      const over=p.hand.length-handLimit(p), f=adviseFree(p,over>0); if(f) return f;
      if(over>0){ const cs=cheapest(p,over), t=charityTargets(p);
        return {opt:'give', picks:cs.map(c=>c.uid), text:`Gib ${over} ${pl(over,'Karte','Karten')} ab: ${names(cs)}.`, why:`Mehr lässt sich nicht sinnvoll ausspielen. ${t?`Die Karten bekommt ${t.map(x=>x.name).join(' und ')}.`:'Du legst sie ab, weil du selbst (mit) die niedrigste Stufe hast.'}`}; }
      return {opt:'end', text:'Beende deinen Zug.', why:'Es gibt nichts mehr, was sich lohnt.'};
    }
    case 'fight': return adviseFight(p,C);
    case 'helpWho': { const b=bestHelper(C); return b ? {opt:b.id, text:`Frag ${b.name}.`, why:`Mit ${b.name} gewinnt ihr.${hasRace(b,'elf')?' Als Elf steigt '+b.name+' beim Helfen selbst auf.':''}`} : {opt:'x', text:'Abbrechen.', why:'Keiner der übrigen Mitspieler würde den Kampf drehen.'}; }
    case 'helpOffer': { const total=treasuresOf(C), elf=hasRace(d.b,'elf') && d.b.lvl<9, n=elf?0:Math.min(total,Math.max(1,Math.ceil(total/2)));
      return {opt:n, text:`Biete ${n} ${pl(n,'Schatz','Schätze')} an.`, why: elf ? `${d.b.name} ist Elf und steigt beim Helfen selbst auf. Das reicht meist als Anreiz.` : 'Etwa die Hälfte ist ein faires Angebot. Bei zu wenig sagen viele Nein.'}; }
    case 'botHelp': return adviseBotHelp(p,C,d);
    case 'interfere': return adviseInterfere(p,C);
    case 'run': return adviseRun(p,d);
    case 'amulet': return curseHits(p,d.c) ? {opt:'yes', text:'Setz das Glücksamulett ein.', why:'Der Fluch würde dich wirklich treffen.'} : {opt:'no', text:'Nimm den Fluch hin.', why:'Er trifft bei dir ins Leere. Heb dir das Amulett für einen Fluch auf, der wehtut.'};
  }
  return null;
}
function adviceHTML(){
  const a=UI.adv; if(!a) return '';
  const can = a.opt!==undefined || a.uid || a.sell || (UI.sel && a.picks);
  return `<div class="advice"><span class="adv-l">Empfehlung</span><b>${linkify(esc(a.text))}</b><span class="adv-why">${linkify(esc(a.why||''))}</span>${can?'<button class="btn small" type="button" data-adv>Übernehmen</button>':''}</div>`;
}
function applyAdvice(){
  const a=UI.adv; if(!a) return;
  if(UI.sel){
    if(!a.picks) return;
    const ok=a.picks.filter(u=>{ const c=findCard(u); return c && UI.sel.filter(c,zoneOf(u)); }).slice(0,UI.sel.max);
    UI.sel.picked=new Set(ok);
    const cs=ok.map(findCard), valid=ok.length>=UI.sel.min && !(UI.sel.validate && UI.sel.validate(cs));
    if(valid) UI.sel.done(ok); else render();
    return;
  }
  if(a.sell){ startSell(a.picks); return; }
  if(a.uid){ const c=findCard(a.uid), w=zoneOf(a.uid); if(!c || !w) return;
    const act=cardActions(c,w).find(x=>x.fn && !x.dis && x.l.startsWith(a.act));
    if(act){ UI.menu=null; act.fn(); render(); } return; }
  if(a.opt!==undefined && UI.prompt && UI.resolve){ const o=UI.prompt.get().opts.find(o=>o.v===a.opt && !o.dis); if(o){ UI.menu=null; UI.resolve(o.v); } }
}


/* ================= Kartennamen anklickbar ================= */
let CATALOG={}, COPIES={}, NAME_RE=null;
function buildCatalog(cards){
  CATALOG={}; COPIES={};
  cards.forEach(c=>{ if(!CATALOG[c.n]) CATALOG[c.n]=c; COPIES[c.n]=(COPIES[c.n]||0)+1; });
  const alts=Object.keys(CATALOG).sort((a,b)=>b.length-a.length).map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  try{ NAME_RE=new RegExp('(?<![\\p{L}\\p{N}])('+alts.join('|')+')(?![\\p{L}\\p{N}])','gu'); }
  catch(e){ NAME_RE=new RegExp('('+alts.join('|')+')','g'); }
}
function linkify(html){
  if(!NAME_RE || !html) return html||'';
  return String(html).split(/(<[^>]+>)/).map(part=> part.startsWith('<') ? part :
    part.replace(NAME_RE, m=>`<button type="button" class="lc" data-cname="${esc(m)}">${m}</button>`)).join('');
}
function cardMeaning(c){
  switch(c.k){
    case 'item': {
      const slot = c.slot==='hand' ? (c.hands===2?'beide Hände':'eine Hand') : c.slot==='none' ? 'keinen Slot' : `den Slot ${SLOTN[c.slot]}`;
      let t = c.b ? `Gibt +${c.b} Kampfstärke, solange er ausgerüstet ist` : 'Gibt keinen Kampfbonus';
      if(c.run) t += `, dazu +${c.run} beim Weglaufen`;
      t += `. Belegt ${slot}.`;
      if(c.req) t += ` Wirkt nur für ${reqName(c)}.`;
      if(c.big) t += ' Großer Gegenstand: davon darf man nur einen haben, Zwerge beliebig viele.';
      return t + ` Verkaufswert ${fmt(c.g)} Gold.`;
    }
    case 'oneshot': return c.escape ? 'Einmal einsetzbar: Beim Weglaufen entkommt man damit ohne Würfeln, auch bei mehreren Monstern vor allen auf einmal. Danach wird die Karte abgelegt.' : `Einmal einsetzbar: Im Kampf direkt von der Hand spielbar, für jede Seite, auch für das Monster. +${c.b}, danach abgelegt. Verkaufswert ${fmt(c.g)} Gold.`;
    case 'monster': return `Stufe ${c.lvl}${c.undead?', untot':''}. Wer es besiegt, steigt ${c.up||1} ${pl(c.up||1,'Stufe','Stufen')} auf und zieht ${c.tr} ${pl(c.tr,'Schatz','Schätze')}. Wer verliert und nicht entkommt: ${c.badTxt}`;
    case 'curse': return 'Fluch. Beim Aufstoßen der Tür aufgedeckt trifft er sofort den, der ihn aufdeckt. Von der Hand darf man ihn jederzeit auf jeden spielen.';
    case 'race': return 'Rasse: Man hat höchstens eine. Eine neue ersetzt die alte, ablegen geht jederzeit.';
    case 'class': return 'Klasse: Man hat höchstens eine. Eine neue ersetzt die alte, ablegen geht jederzeit.';
    case 'levelup': return 'Stufenkarte: Jederzeit spielbar, auch im Zug der anderen. Bringt 1 Stufe, aber nie die Siegstufe 10.';
    case 'enh': return `Monsterverstärker: Jeder darf ihn in jedem Kampf auf ein Monster spielen. ${sign(c.v)} Stufen, ${c.trm>0?'+':'−'}${Math.abs(c.trm)} ${pl(Math.abs(c.trm),'Schatz','Schätze')}.`;
    default: return '';
  }
}
function whereNow(c){
  const n=c.n, out=[];
  if(!S) return out;
  S.players.forEach(p=>{
    p.eq.filter(x=>x.n===n).forEach(()=>out.push(p.human?'Ausgerüstet bei dir.':`Ausgerüstet bei ${p.name}.`));
    p.pack.filter(x=>x.n===n).forEach(()=>out.push(p.human?'In deinem Rucksack.':`Im Rucksack von ${p.name}.`));
    if(p.race && p.race.n===n) out.push(p.human?'Das ist deine Rasse.':`Rasse von ${p.name}.`);
    if(p.cls && p.cls.n===n) out.push(p.human?'Das ist deine Klasse.':`Klasse von ${p.name}.`);
    if(p.human || UI.open) p.hand.filter(x=>x.n===n).forEach(()=>out.push(p.human?'Auf deiner Hand.':`Auf der Hand von ${p.name}.`));
  });
  if(S.combat) S.combat.mons.forEach(m=>{ if(m.c.n===n) out.push('Gerade im Kampf.'); m.enh.forEach(e=>{ if(e.n===n) out.push(`Gerade im Kampf, auf ${m.c.n}.`); }); });
  if(S.reveal && S.reveal.n===n) out.push('Liegt gerade offen auf dem Tisch.');
  const d=[...S.doorDisc,...S.trDisc].filter(x=>x.n===n).length;
  if(d) out.push(`${d}× in der Ablage.`);
  if(COPIES[n]>1) out.push(`Im Spiel gibt es diese Karte ${COPIES[n]}×.`);
  return out;
}


/* ================= Darstellungs-Helfer (rein) ================= */
function cardLabel(c){ return c.k==='curse' ? 'Fluch! '+c.n : c.k==='monster' ? `${c.n} (Stufe ${c.lvl})` : c.n; }
function itemTxt(c){
  const t=[];
  if(c.req) t.push(`Nur für ${reqName(c)}.`);
  if(c.run) t.push(`+${c.run} beim Weglaufen.`);
  if(c.big) t.push('Großer Gegenstand.');
  if(c.slot==='none') t.push('Belegt keinen Slot.');
  return t.join(' ');
}
function slotTxt(c){ if(c.slot==='hand') return c.hands===2?'2 Hände':'1 Hand'; return SLOTN[c.slot]; }
const HUMAN = {k:'race', n:'Mensch', txt:'Keine Besonderheit. Wer keine Rassenkarte ausliegen hat, ist Mensch. Das ist keine eigene Karte.'};
const QUIZ=[
  {q:'Du stößt die Tür auf und deckst einen Fluch auf. Was passiert?', o:['Er kommt auf deine Hand.','Er trifft sofort dich.','Du darfst ihn auf einen Mitspieler spielen.','Er wird abgelegt.'], a:1, e:'Offen beim Aufstoßen der Tür aufgedeckt: Der Fluch wirkt sofort auf dich. Nur verdeckt gezogene Flüche darfst du anderen geben.'},
  {q:'Kampfstärke 8 gegen ein Monster der Stufe 8. Du bist Zauberer. Wie geht es aus?', o:['Du gewinnst.','Ihr würfelt neu.','Du verlierst und musst weglaufen.','Unentschieden, nichts passiert.'], a:2, e:'Gleichstand ist eine Niederlage. Nur Krieger gewinnen bei Gleichstand.'},
  {q:'Ab welchem Würfelergebnis gelingt das Weglaufen ohne Boni?', o:['Ab 4','Ab 5','Nur bei 6','Ab 3'], a:1, e:'5 oder 6. Elfen bekommen +1, manche Gegenstände und Monster ändern den Wurf.'},
  {q:'Du bist auf Stufe 9 und hast Gegenstände für 1.200 Gold. Kannst du dir Stufe 10 kaufen?', o:['Ja, 1.000 Gold sind eine Stufe.','Nein, Stufe 10 gibt es nur für einen Monstersieg.','Ja, aber nur als Halbling.','Nur wenn niemand widerspricht.'], a:1, e:'Die Siegstufe gibt es nur, indem du ein Monster besiegst. Verkaufen und Stufenkarten bringen dich höchstens auf 9.'},
  {q:'Ende deines Zuges: 7 Handkarten, du bist kein Zwerg, Berta hat als Einzige die niedrigste Stufe. Was tust du?', o:['Nichts, das Limit gilt nur für Zwerge.','2 Karten ablegen.','2 Karten an Berta geben.','Alle Karten an Berta geben.'], a:2, e:'Almosen: Alles über 5 Karten geht an den Spieler mit der niedrigsten Stufe. Bist du selbst (mit) am niedrigsten, legst du ab.'},
  {q:'Wie viele Mitspieler dürfen dir in einem Kampf helfen?', o:['Keiner','Genau einer','Zwei','Beliebig viele'], a:1, e:'Nur 1 Helfer. Meist hilft der gegen ein Versprechen von Schätzen.'},
  {q:'Beim Durchsuchen des Raums ziehst du verdeckt einen Fluch. Was jetzt?', o:['Er trifft dich sofort.','Er kommt auf deine Hand. Du kannst ihn später auf jemanden spielen.','Du musst ihn sofort auf den Spieler links spielen.','Er wird abgelegt.'], a:1, e:'Verdeckt gezogene Flüche sind Handkarten. Spielen darfst du sie jederzeit, auf jeden.'},
  {q:'Du stirbst. Was behältst du?', o:['Gar nichts, du fängst auf Stufe 1 an.','Stufe, Rasse und Klasse.','Deine Handkarten.','Deine ausgerüsteten Gegenstände.'], a:1, e:'Stufe, Rasse und Klasse bleiben. Deine Gegenstände teilen sich die anderen, Handkarten werden abgelegt. Im nächsten Zug ziehst du 4 Tür- und 4 Schatzkarten.'},
  {q:'Mitten im Kampf ziehst du einen besseren Helm. Darfst du ihn anlegen?', o:['Ja, jederzeit.','Nein, Gegenstände nur im eigenen Zug außerhalb von Kämpfen.','Ja, wenn du verlierst.','Nur mit Erlaubnis des Helfers.'], a:1, e:'Ausrüstung änderst du nur außerhalb von Kämpfen. Ausnahme: Einmal einsetzbare Gegenstände spielst du direkt von der Hand.'},
  {q:'Wer darf einen Monsterverstärker wie „+5“ spielen?', o:['Nur der Kämpfer.','Nur wer gerade nicht kämpft.','Jeder Spieler, in jedem Kampf.','Niemand, die Karte liegt einfach im Spiel.'], a:2, e:'Jeder darf ihn in jeden Kampf spielen, auch auf das eigene Monster. Verstärker verändern meist auch die Zahl der Schätze.'},
  {q:'Du hilfst Kalle als Elf, und ihr besiegt das Monster. Was bekommst du?', o:['Nur die versprochene Beute.','Die versprochene Beute und 1 Stufe.','Alle Schätze.','2 Stufen.'], a:1, e:'Aufsteigen tut normalerweise nur, wer kämpft. Elfen steigen aber auch als Helfer 1 Stufe auf. Dazu kommt, was ihr als Belohnung vereinbart habt.'}
];
