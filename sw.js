// Plundo · Website
// Früher lief das Spiel direkt unter plundo.eu/ mit einem Service Worker für die ganze Domain.
// Das Spiel liegt jetzt unter /spiel/. Dieser Worker löscht den alten Cache, meldet sich ab
// und lädt offene Seiten neu, damit die Startseite nicht mehr aus dem alten Cache kommt.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) {
    if (!k.startsWith('loota-')) continue;
    const c = await caches.open(k);
    // Nur der alte Cache enthält /manifest.webmanifest direkt im Hauptverzeichnis.
    if (await c.match(new URL('/manifest.webmanifest', location.origin).href)) await caches.delete(k);
  }
  await self.registration.unregister();
  for (const w of await self.clients.matchAll({type: 'window'})) { try { w.navigate(w.url); } catch (_) {} }
})()));
