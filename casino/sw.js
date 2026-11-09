/* Casino Palma Grande — Service Worker (alcance: /casino/)
   · Modelos y face-api: caché primero (pesados, no cambian).
   · Página, CSS y JS: red primero, caché si no hay señal.
   · Nunca intercepta el backend (POST a script.google.com). */
const VERSION = 'casino-v2';
const BASE = ['./', 'index.html', 'css/casino.css', 'js/comun.js', 'js/rostros.js', 'js/registro.js', 'js/supervisor.js', 'js/admin.js',
  'manifest.webmanifest', 'lib/face-api.min.js',
  'models/tiny_face_detector_model-weights_manifest.json', 'models/tiny_face_detector_model-shard1',
  'models/face_landmark_68_model-weights_manifest.json', 'models/face_landmark_68_model-shard1',
  'models/face_recognition_model-weights_manifest.json', 'models/face_recognition_model-shard1',
  'models/face_recognition_model-shard2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('casino-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\/(models|lib)\//.test(url.pathname)) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      const copia = res.clone(); caches.open(VERSION).then(c => c.put(req, copia)); return res;
    })));
    return;
  }
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copia = res.clone(); caches.open(VERSION).then(c => c.put(req, copia)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
