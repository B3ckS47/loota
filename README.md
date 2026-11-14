# Loota

Fantasy-Kartenspiel gegen 2 oder 3 Bots: Monster besiegen, Beute machen, als Erster Stufe 10 erreichen. Mit Zug-Empfehlung, Regeln, Kartenübersicht und Quiz. Musik und Sounds entstehen direkt im Code, Bilder und Schriften liegen alle in diesem Ordner. Einmal geöffnet, läuft die App auch offline.

## Am PC ausprobieren

`index.html` doppelklicken. Das Spiel läuft dann im Browser. Installieren und offline spielen geht so noch nicht, dafür muss die App im Internet liegen (siehe unten).

## Auf GitHub Pages veröffentlichen (kostenlos)

1. Auf github.com anmelden, oben rechts auf **+** → **New repository**. Name zum Beispiel `loota`, Sichtbarkeit **Public**, dann **Create repository**.
2. Dateien hochladen, entweder per Git aus diesem Ordner:
   ```
   git init -b main
   git add .
   git commit -m "Loota v1"
   git remote add origin https://github.com/DEINNAME/loota.git
   git push -u origin main
   ```
   oder im Browser über **uploading an existing file**. GitHub nimmt dort höchstens 100 Dateien pro Upload: erst alles außer dem Ordner `art`, dann den Ordner `art` allein.
3. Im Repository auf **Settings** → **Pages**. Bei *Source* „Deploy from a branch“, Branch `main` und `/ (root)`, dann **Save**.
4. Nach ein bis zwei Minuten läuft die App unter `https://DEINNAME.github.io/loota/`.

## Auf dem Handy installieren

- **Android (Chrome):** Adresse öffnen, auf dem Startbildschirm der App „Als App installieren“ tippen. Alternativ im Chrome-Menü (⋮) **App installieren**.
- **iPhone (Safari):** Adresse öffnen, unten auf **Teilen** tippen, dann **Zum Home-Bildschirm**.

Einmal mit Internet starten, dann lädt die App alle Bilder und läuft danach auch offline.

## Spielstand

Das Spiel speichert automatisch zu Beginn jedes deiner Züge. Über **Weiterspielen** geht es nach dem Schließen dort weiter. Löschen lässt sich der Spielstand unter **Optionen**.

## Später etwas ändern

Geänderte Dateien wieder hochladen (oder `git add . && git commit && git push`). Die App holt sich die neue Version beim nächsten Start.

Der Ordner `Entwicklung` neben diesem Ordner enthält die Quelldateien. Wer `index.src.html` oder `rules.html` ändert, baut mit `python build_mobile.py` die `index.html` und `sw.js` neu.

Neues Logo: Bild auf magentafarbenem Hintergrund als `Entwicklung/quellbilder/logo-emblem.png` speichern, dann im Ordner `Entwicklung` erst `python logo_verarbeiten.py` (braucht `pip install pillow numpy`) und danach `python build_mobile.py` ausführen. Das erzeugt Emblem und App-Icons neu.

## Schriften

Grenze Gotisch, Alegreya Sans und Kalam unter der SIL Open Font License (siehe `fonts/LICENSE-*.txt`).
