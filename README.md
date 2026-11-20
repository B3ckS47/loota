# Plundo

Freches Fantasy-Kartenspiel gegen 2 oder 3 Bots: Monster besiegen, Beute machen, als Erster Stufe 10 erreichen. Live unter **https://plundo.eu**.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `/` (`index.html`, `css/`, `assets/`) | Website mit Startseite, News und Community |
| `/impressum.html`, `/datenschutz.html` | Rechtliches, gilt für Website und Spiel |
| `/sw.js` | Räumt den alten Service Worker auf (bis Nov. 2026 lag das Spiel direkt unter `/`) |
| `/spiel/` | Das Spiel als PWA. Hat einen eigenen Service Worker und läuft nach dem ersten Start offline |
| `CNAME` | Domain plundo.eu für GitHub Pages |

Einsprünge von der Website ins Spiel: `spiel/#konto` öffnet die Anmeldung, `spiel/#regeln` die Regeln.

## Spiel bauen

Die Quellen (`index.src.html`, `rules.html`, `build_mobile.py`) liegen nicht im Repository. `build_mobile.py` erzeugt `spiel/index.html` und `spiel/sw.js` mit der Liste der Dateien für den Offline-Speicher.

## Auf dem Handy installieren

- **Android (Chrome):** https://plundo.eu/spiel/ öffnen, im Chrome-Menü (⋮) **App installieren**.
- **iPhone (Safari):** https://plundo.eu/spiel/ öffnen, auf **Teilen** tippen, dann **Zum Home-Bildschirm**.
