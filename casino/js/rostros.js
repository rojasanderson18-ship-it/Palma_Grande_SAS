/* ═══════════════════════════════════════════════════════════
   Casino — reconocimiento facial (face-api.js, 100 % en la tablet)
   · Los descriptores se guardan en IndexedDB de ESTA tablet, por
     DOCUMENTO (no por nombre). Nunca se suben al servidor.
   · IndexedDB en vez de localStorage: el cupo de localStorage (~5 MB)
     se comparte con Asistencia y el hub en el mismo origen github.io.
   · Mismos umbrales que Asistencia: 0,49 (5 poses) / 0,54 (1 pose),
     tope 0,55; distancia = promedio de las 2 mejores.
═══════════════════════════════════════════════════════════ */
'use strict';

const Rostros = (() => {
  const MODEL_URL  = 'models';
  const UMBRAL_V2  = 0.49, UMBRAL_V1 = 0.54, UMBRAL_MAX = 0.55;
  const HITS = 2, VENTANA_MS = 1800;
  const PASOS = [
    'Mire directamente a la cámara.',
    'Gire ligeramente a la izquierda.',
    'Gire ligeramente a la derecha.',
    'Levante ligeramente el rostro.',
    'Posición frontal — última captura.'
  ];

  let modelos = false, cargando = null;
  let stream = null, video = null, loopOn = false, loopGen = 0;
  let mapa = {};          // documento → [Float32Array]
  let db = null;

  /* ── IndexedDB ── */
  function abrirDB() {
    if (db) return Promise.resolve(db);
    return new Promise((ok, ko) => {
      const r = indexedDB.open('casino_rostros', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('rostros', { keyPath: 'documento' });
      r.onsuccess = () => { db = r.result; ok(db); };
      r.onerror = () => ko(r.error);
    });
  }
  async function tx(modo, fn) {
    const d = await abrirDB();
    return new Promise((ok, ko) => {
      const t = d.transaction('rostros', modo);
      const st = t.objectStore('rostros');
      const res = fn(st);
      t.oncomplete = () => ok(res && res.result !== undefined ? res.result : res);
      t.onerror = () => ko(t.error);
    });
  }
  async function cargar() {
    const todos = await tx('readonly', st => st.getAll());
    mapa = {};
    (todos || []).forEach(r => { mapa[r.documento] = { v: r.v, d: r.descriptores.map(x => new Float32Array(x)) }; });
    return Object.keys(mapa).length;
  }
  const redondear = d => Array.from(d, x => Math.round(x * 1e5) / 1e5);
  async function guardar(documento, descriptores, origen) {
    const reg = { documento: String(documento), descriptores: descriptores.map(redondear),
                  v: descriptores.length > 1 ? 2 : 1, origen: origen || 'CASINO', fecha: ahoraBogota().fecha };
    await tx('readwrite', st => st.put(reg));
    mapa[reg.documento] = { v: reg.v, d: reg.descriptores.map(x => new Float32Array(x)) };
  }
  async function guardarVarios(regs) {
    await tx('readwrite', st => { regs.forEach(r => st.put(r)); });
    await cargar();
  }
  async function borrar(documento) {
    await tx('readwrite', st => st.delete(String(documento)));
    delete mapa[String(documento)];
  }
  async function todosCrudos() { return tx('readonly', st => st.getAll()); }
  const tiene = doc => !!mapa[String(doc)];
  const total = () => Object.keys(mapa).length;

  /* ── Modelos y cámara ── */
  function cargarModelos() {
    if (modelos) return Promise.resolve(true);
    if (cargando) return cargando;
    cargando = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]).then(() => { modelos = true; return true; })
      .catch(e => { cargando = null; throw e; });
    return cargando;
  }

  async function iniciarCamara(elVideo) {
    video = elVideo;
    if (stream) { video.srcObject = stream; return; }
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'user' }, width: { ideal: 720 }, height: { ideal: 720 } }, audio: false
    });
    video.srcObject = stream;
    await video.play().catch(() => {});
  }
  function detenerCamara() {
    loopOn = false;
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null;
    if (video) video.srcObject = null;
  }

  async function detectar(inputSize, score) {
    if (!video || video.readyState < 2) return null;
    return faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold: score }))
      .withFaceLandmarks().withFaceDescriptor();
  }

  function calidad(det) {
    const w = video.videoWidth || 480, h = video.videoHeight || 480;
    const b = det.detection.box, cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    if (b.width < w * 0.10) return 'Acérquese un poco.';
    if (cx < w * 0.2 || cx > w * 0.8 || cy < h * 0.2 || cy > h * 0.8) return 'Centre el rostro.';
    if (det.detection.score < 0.52) return 'Mejore la iluminación.';
    return '';
  }

  function distancia(desc, lista) {
    const ds = lista.map(r => faceapi.euclideanDistance(desc, r)).sort((a, b) => a - b);
    return ds.length === 1 ? ds[0] : (ds[0] + ds[1]) / 2;
  }
  function umbral(doc) { return Math.min(mapa[doc] && mapa[doc].v === 2 ? UMBRAL_V2 : UMBRAL_V1, UMBRAL_MAX); }

  function mejorCoincidencia(desc, excluir) {
    let mejor = null, dist = Infinity;
    for (const doc in mapa) {
      if (doc === excluir) continue;
      const x = distancia(desc, mapa[doc].d);
      if (x < dist) { dist = x; mejor = doc; }
    }
    return { documento: mejor, dist };
  }

  /* ── Bucle de reconocimiento ──
     onMatch(documento, dist) tras 2 coincidencias seguidas; onEstado(texto, tipo). */
  async function iniciarReconocimiento({ onMatch, onEstado, pausado }) {
    loopOn = true;
    const gen = ++loopGen;
    let consec = { doc: null, t0: 0, n: 0 };
    let intervalo = 280;
    while (loopOn && gen === loopGen) {
      await new Promise(r => setTimeout(r, intervalo));
      if (!loopOn || gen !== loopGen) break;
      if (pausado && pausado()) continue;
      if (!total()) { onEstado('Sin rostros enrolados en esta tablet · use Buscar por cédula', 'aviso'); continue; }
      const t0 = Date.now();
      let det;
      try { det = await detectar(256, 0.45); } catch { onEstado('Error de reconocimiento', 'err'); continue; }
      intervalo = Math.max(180, Math.min(600, Math.round((Date.now() - t0) * 0.65)));
      if (!det) { onEstado('Mire a la cámara', ''); consec.n = 0; continue; }
      const m = mejorCoincidencia(det.descriptor);
      if (m.documento && m.dist <= umbral(m.documento)) {
        onEstado('Rostro reconocido…', 'ok');
        const ahora = Date.now();
        if (consec.doc === m.documento && ahora - consec.t0 <= VENTANA_MS) consec.n++;
        else consec = { doc: m.documento, t0: ahora, n: 1 };
        if (consec.n >= HITS) { consec = { doc: null, t0: 0, n: 0 }; onMatch(m.documento, m.dist); }
      } else {
        consec.n = 0;
        onEstado(calidad(det) || 'Rostro no reconocido · use Buscar por cédula', 'aviso');
      }
    }
  }
  function pararReconocimiento() { loopOn = false; }

  /* ── Enrolamiento: 5 poses ── */
  async function enrolar(documento, { onPaso, cancelado }) {
    const descs = [];
    for (let paso = 0; paso < PASOS.length; paso++) {
      onPaso(paso, PASOS[paso], '');
      if (paso > 0) await new Promise(r => setTimeout(r, 700));
      const t0 = Date.now();
      let listo = false;
      while (!listo) {
        if (cancelado()) return { ok: false, motivo: 'cancelado' };
        if (Date.now() - t0 > 15000) return { ok: false, motivo: 'No se pudo capturar: ' + PASOS[paso] };
        await new Promise(r => setTimeout(r, 250));
        let det = null;
        try { det = await detectar(224, 0.5); } catch {}
        if (!det) { onPaso(paso, PASOS[paso], 'No se detecta rostro — acérquese.'); continue; }
        const q = calidad(det);
        if (q) { onPaso(paso, PASOS[paso], q); continue; }
        descs.push(det.descriptor); listo = true;
      }
    }
    // ¿Este rostro ya está enrolado con otro documento?
    const prom = new Float32Array(128);
    descs.forEach(d => d.forEach((x, i) => { prom[i] += x / descs.length; }));
    const otro = mejorCoincidencia(prom, String(documento));
    const parecido = otro.documento && otro.dist <= UMBRAL_V2 ? otro.documento : null;
    return { ok: true, descriptores: descs, parecido };
  }

  /* ── Respaldos cifrados (mismo formato que Asistencia) ──
     { v:1, salt, iv, data } · AES-256-GCM · PBKDF2-SHA256 150.000 it.
     Asistencia: { rostros: {NOMBRE: descs}, meta }  → se convierte a documento.
     Casino:     { casino: 1, rostros: {DOCUMENTO: descs} } */
  const b64 = buf => {
    const u = new Uint8Array(buf); let s = '';
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    return btoa(s);
  };
  const deB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  async function clave(pass, salt) {
    const mat = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
      mat, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function descifrar(payload, pass) {
    if (!payload || payload.v !== 1 || !payload.salt || !payload.iv || !payload.data) throw new Error('formato');
    const k = await clave(pass, deB64(payload.salt));
    const plano = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(payload.iv) }, k, deB64(payload.data));
    return JSON.parse(new TextDecoder().decode(plano));
  }
  async function cifrar(datos, pass) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const k = await clave(pass, salt);
    const c = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(JSON.stringify(datos)));
    return { v: 1, salt: b64(salt), iv: b64(iv), data: b64(c) };
  }

  // Convierte {NOMBRE: descs} de Asistencia a registros por documento.
  function mapearPorNombre(rostrosPorNombre, personas, origen) {
    const porNombre = {};
    personas.forEach(p => {
      const k = normNombre(p.nombre);
      (porNombre[k] = porNombre[k] || []).push(p.documento);
    });
    const regs = [], sinPersona = [], ambiguos = [];
    Object.keys(rostrosPorNombre || {}).forEach(nombre => {
      const docs = porNombre[normNombre(nombre)] || [];
      if (!docs.length) { sinPersona.push(nombre); return; }
      if (docs.length > 1) { ambiguos.push(nombre); return; }
      const raw = rostrosPorNombre[nombre];
      const lista = Array.isArray(raw[0]) ? raw : [raw];
      regs.push({ documento: docs[0], descriptores: lista.map(redondear), v: lista.length > 1 ? 2 : 1,
                  origen, fecha: ahoraBogota().fecha });
    });
    return { regs, sinPersona, ambiguos };
  }

  async function importarArchivo(payload, pass, personas) {
    const datos = await descifrar(payload, pass);
    if (datos.casino) {
      const regs = Object.keys(datos.rostros || {}).map(doc => {
        const lista = datos.rostros[doc];
        return { documento: doc, descriptores: lista.map(redondear), v: lista.length > 1 ? 2 : 1,
                 origen: 'RESPALDO_CASINO', fecha: ahoraBogota().fecha };
      });
      await guardarVarios(regs);
      return { importados: regs.length, sinPersona: [], ambiguos: [] };
    }
    const r = mapearPorNombre(datos.rostros, personas, 'ASISTENCIA');
    await guardarVarios(r.regs);
    return { importados: r.regs.length, sinPersona: r.sinPersona, ambiguos: r.ambiguos };
  }

  // Solo lectura de los rostros de Asistencia si se usa en ESTE navegador.
  function hayAsistenciaLocal() {
    try { return Object.keys(JSON.parse(localStorage.getItem('rostros_enrolados') || '{}')).length; } catch { return 0; }
  }
  async function importarAsistenciaLocal(personas) {
    let raw = {};
    try { raw = JSON.parse(localStorage.getItem('rostros_enrolados') || '{}'); } catch {}
    const r = mapearPorNombre(raw, personas, 'ASISTENCIA_LOCAL');
    await guardarVarios(r.regs);
    return { importados: r.regs.length, sinPersona: r.sinPersona, ambiguos: r.ambiguos };
  }

  async function exportarCasino(pass) {
    const todos = await todosCrudos();
    const rostros = {};
    todos.forEach(r => { rostros[r.documento] = r.descriptores; });
    return { payload: await cifrar({ casino: 1, rostros }, pass), n: todos.length };
  }

  return {
    cargar, guardar, borrar, tiene, total, cargarModelos, iniciarCamara, detenerCamara,
    iniciarReconocimiento, pararReconocimiento, enrolar, importarArchivo, hayAsistenciaLocal,
    importarAsistenciaLocal, exportarCasino, get modelosListos() { return modelos; }
  };
})();
