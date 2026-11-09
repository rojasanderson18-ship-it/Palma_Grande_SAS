/***********************************************************
 * CONTROL DE CASINO — Palma Grande S.A.S.
 * Backend Google Apps Script + Google Sheets
 *
 * Proyecto INDEPENDIENTE: no modifica el Code.gs del hub ni el de
 * Asistencia. Debe crearse VINCULADO al Sheet "Casino Palma Grande"
 * (en el Sheet: Extensiones → Apps Script) y publicarse como
 * Aplicación web (Ejecutar como: yo · Acceso: cualquier usuario).
 *
 * Configuración inicial desde el menú "Casino" del Sheet:
 *   1. Inicializar hojas
 *   2. Crear usuario (el primero debe ser ADMIN)
 *   3. (Opcional) ID del Sheet de Asistencia → para copiar el personal
 *
 * Zona horaria: TODAS las fechas se calculan en America/Bogota.
 * Fechas se guardan como texto yyyy-MM-dd y horas como HH:mm:ss.
 *
 * Seguridad:
 *  · PIN por usuario: el cliente envía SHA-256(PIN); el servidor guarda
 *    HMAC(SHA-256(PIN), secreto) — nunca el PIN ni su hash simple.
 *  · Sesiones: token firmado (HMAC) con expiración, validado en cada
 *    llamada contra el usuario activo.
 *  · Tablets: deben ser autorizadas por un ADMIN (deviceToken). El
 *    registro de raciones se autentica con el deviceToken para poder
 *    sincronizar lo entregado sin señal aunque la sesión haya vencido.
 *  · Nunca se borran filas: se anulan con motivo y usuario.
 *  · Toda creación/cambio queda en la hoja Log.
 ***********************************************************/

const TZ           = 'America/Bogota';
const APP_VERSION  = 'casino-1.0';
const SESION_HORAS = 12;          // turno del casino
const MAX_INTENTOS_PIN = 5;
const BLOQUEO_SEG      = 600;
const DIAS_OFFLINE_MAX = 3;       // raciones sin señal aceptadas hasta 3 días atrás
const ROLES = ['CASINO', 'SUPERVISOR', 'AUTORIZA', 'ADMIN'];
const CARGO_VISITANTES_DEF = 'Palma Grande S.A.S';

const HOJAS = {
  Personas_Casino: ['documento','nombre','cargo','origen','estado_asistencia','tipo_pago','sas_contratista',
                    'centro_costo','cuadrilla','activo','actualizado_por','actualizado_en'],
  SAS:             ['id','nombre','nit','activo','creado_por','creado_en'],
  Servicios:       ['id','nombre','hora_inicio','hora_fin','valor','permite_campo','activo'],
  Raciones:        ['id','fecha','hora','documento','nombre','tipo_pago','sas','centro_costo','servicio','modo',
                    'metodo_id','pedido_id','valor','entregado_por','dispositivo','estado','motivo_anulacion',
                    'anulado_por','anulado_en','registrado_en','offline'],
  Intentos:        ['id','fecha','hora','documento','servicio','motivo','dispositivo','usuario','detalle','registrado_en'],
  Visitantes:      ['id','fecha','hora','nombre','documento','empresa_motivo','servicio','autorizado_por','cargo_a',
                    'valor','entregado_por','dispositivo','estado','motivo_anulacion','anulado_por','anulado_en',
                    'registrado_en','offline'],
  Pedidos_Campo:   ['id','fecha','servicio','sas','cuadrilla','supervisor','punto_entrega','personas','cantidad',
                    'estado','extemporaneo','justificacion','autorizado_por','hora_autorizacion','motivo_rechazo',
                    'despachado_por','hora_despacho','conductor','creado_en','modificado_por','modificado_en'],
  Cortes_SAS:      ['id','sas','periodo_desde','periodo_hasta','total_raciones','detalle','valor','estado',
                    'creado_por','creado_en','enviado_por','enviado_en','aceptado_por','aceptado_en',
                    'descontado_por','descontado_en','factura_ref','observaciones'],
  Conciliacion_Proveedor: ['periodo_desde','periodo_hasta','raciones_factura','valor_factura','factura_ref',
                    'editado_por','editado_en'],
  Usuarios:        ['usuario','nombre','rol','sas','cuadrillas','pin_hash','activo','creado_en'],
  Dispositivos:    ['id','token_hash','nombre','estado','autorizado_por','autorizado_en','ultima_conexion'],
  Config:          ['clave','valor'],
  Log:             ['id','fecha','hora','usuario','rol','accion','hoja','registro_id','antes','despues','dispositivo']
};

const SERVICIOS_INICIALES = [
  ['DES', 'Desayuno',   '05:30', '08:00', 9000, 'NO', 'SI'],
  ['ALM', 'Almuerzo',   '11:30', '14:00', 9000, 'SI', 'SI'],
  ['CEN', 'Cena',       '17:30', '20:00', 8600, 'NO', 'SI'],
  ['REF', 'Refrigerio', '09:00', '10:00', 0,    'SI', 'NO']
];
const CONFIG_INICIAL = [
  ['hora_corte_pedidos', '08:00'],
  ['nombre_casino', 'Casino · Finca principal'],
  ['cargo_visitantes', CARGO_VISITANTES_DEF]
];

/* ══════════════════════════════════════════════════════
   FECHAS (America/Bogota)
══════════════════════════════════════════════════════ */
function _ahora() {
  const d = new Date();
  return {
    fecha: Utilities.formatDate(d, TZ, 'yyyy-MM-dd'),
    hora:  Utilities.formatDate(d, TZ, 'HH:mm:ss'),
    ts:    Utilities.formatDate(d, TZ, 'yyyy-MM-dd HH:mm:ss')
  };
}
// Suma días a una fecha yyyy-MM-dd sin pasar por UTC (mediodía evita saltos).
function _sumarDias(fecha, n) {
  const p = fecha.split('-').map(Number);
  const d = new Date(Date.UTC(p[0], p[1] - 1, p[2], 12));
  d.setUTCDate(d.getUTCDate() + n);
  return Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd');
}
function _tzHoja() {
  try { return _ss().getSpreadsheetTimeZone() || TZ; } catch (e) { return TZ; }
}
function _txt(v) { return v == null ? '' : String(v).trim(); }
function _txtFecha(v) {
  if (v instanceof Date) return Utilities.formatDate(v, _tzHoja(), 'yyyy-MM-dd');
  return _txt(v);
}
function _txtHora(v) {
  if (v instanceof Date) return Utilities.formatDate(v, _tzHoja(), 'HH:mm');
  const s = _txt(v);
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return s;
  return ('0' + m[1]).slice(-2) + ':' + m[2] + (m[3] ? ':' + m[3] : '');
}
function _txtTs(v) {
  if (v instanceof Date) return Utilities.formatDate(v, _tzHoja(), 'yyyy-MM-dd HH:mm:ss');
  return _txt(v);
}
function _hhmm(h) { return _txtHora(h).slice(0, 5); }

/* ══════════════════════════════════════════════════════
   ACCESO A HOJAS
══════════════════════════════════════════════════════ */
let _SS = null;
function _ss() {
  if (_SS) return _SS;
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  _SS = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  if (!_SS) throw new Error('Script no vinculado a un Sheet. Ejecute setSheetId().');
  return _SS;
}

function _hoja(nombre) {
  const ss = _ss();
  let sh = ss.getSheetByName(nombre);
  const cols = HOJAS[nombre];
  if (!sh) {
    sh = ss.insertSheet(nombre);
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
    // Todo como texto: evita que Sheets convierta fechas, horas y cédulas.
    sh.getRange(1, 1, sh.getMaxRows(), cols.length).setNumberFormat('@');
    sh.setFrozenRows(1);
  } else {
    // Agrega columnas nuevas al final si faltan (migración sin perder datos).
    const actuales = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map(String);
    cols.forEach(function (c) {
      if (actuales.indexOf(c) === -1) {
        const col = actuales.length + 1;
        sh.getRange(1, col).setValue(c).setFontWeight('bold');
        sh.getRange(1, col, sh.getMaxRows(), 1).setNumberFormat('@');
        actuales.push(c);
      }
    });
  }
  return sh;
}

function _headers(sh) {
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
}

function _filaAObj(headers, fila, nFila) {
  const o = { _fila: nFila };
  headers.forEach(function (h, i) { o[h] = fila[i]; });
  return o;
}

// Lee una hoja completa (para hojas pequeñas: maestros, usuarios, config).
function _leer(nombre) {
  const sh = _hoja(nombre);
  const headers = _headers(sh);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const vals = sh.getRange(2, 1, last - 1, headers.length).getValues();
  const out = [];
  for (let i = 0; i < vals.length; i++) {
    if (vals[i].join('') === '') continue;
    out.push(_filaAObj(headers, vals[i], i + 2));
  }
  return out;
}

// Lee desde el final las filas registradas en los últimos `dias` días
// (columna registrado_en, que es la hora del servidor y crece con cada
// fila). Evita leer toda la hoja de Raciones, que crece todos los días.
function _recientes(nombre, dias) {
  const sh = _hoja(nombre);
  const headers = _headers(sh);
  const iReg = headers.indexOf('registrado_en');
  const limite = _sumarDias(_ahora().fecha, -dias) + ' 00:00:00';
  const out = [];
  let fin = sh.getLastRow();
  const BLOQUE = 1500;
  while (fin >= 2) {
    const ini = Math.max(2, fin - BLOQUE + 1);
    const vals = sh.getRange(ini, 1, fin - ini + 1, headers.length).getValues();
    let parar = false;
    for (let i = vals.length - 1; i >= 0; i--) {
      if (vals[i].join('') === '') continue;
      const reg = _txtTs(vals[i][iReg]);
      if (reg && reg < limite) { parar = true; break; }
      out.push(_filaAObj(headers, vals[i], ini + i));
    }
    if (parar) break;
    fin = ini - 1;
  }
  return out;
}

function _append(nombre, objs) {
  if (!objs.length) return;
  const sh = _hoja(nombre);
  const headers = _headers(sh);
  const filas = objs.map(function (o) {
    return headers.map(function (h) { return o[h] == null ? '' : o[h]; });
  });
  const ini = sh.getLastRow() + 1;
  const rng = sh.getRange(ini, 1, filas.length, headers.length);
  rng.setNumberFormat('@');
  rng.setValues(filas);
}

function _actualizarFila(nombre, nFila, cambios) {
  const sh = _hoja(nombre);
  const headers = _headers(sh);
  Object.keys(cambios).forEach(function (k) {
    const c = headers.indexOf(k);
    if (c === -1) return;
    const cel = sh.getRange(nFila, c + 1);
    cel.setNumberFormat('@');
    cel.setValue(cambios[k] == null ? '' : cambios[k]);
  });
}

function _buscarFila(nombre, columna, valor) {
  const sh = _hoja(nombre);
  const headers = _headers(sh);
  const c = headers.indexOf(columna);
  if (c === -1 || sh.getLastRow() < 2) return null;
  const tf = sh.getRange(2, c + 1, sh.getLastRow() - 1, 1)
    .createTextFinder(String(valor)).matchEntireCell(true).findNext();
  if (!tf) return null;
  const n = tf.getRow();
  return _filaAObj(headers, sh.getRange(n, 1, 1, headers.length).getValues()[0], n);
}

function _limpio(o) {
  const r = {};
  Object.keys(o).forEach(function (k) { if (k !== '_fila') r[k] = o[k] instanceof Date ? _txtTs(o[k]) : o[k]; });
  return r;
}

// Evita inyección de fórmulas en celdas (=, +, -, @).
function _san(v, max) {
  let s = _txt(v).slice(0, max || 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function _uid(prefijo) {
  return prefijo + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
}

/* ══════════════════════════════════════════════════════
   LOG
══════════════════════════════════════════════════════ */
function _logs(entradas) {
  const a = _ahora();
  _append('Log', entradas.map(function (e) {
    return {
      id: _uid('L'), fecha: a.fecha, hora: a.hora,
      usuario: e.usuario || '', rol: e.rol || '', accion: e.accion, hoja: e.hoja || '',
      registro_id: e.registro_id || '',
      antes:   e.antes   ? JSON.stringify(e.antes).slice(0, 4000)   : '',
      despues: e.despues ? JSON.stringify(e.despues).slice(0, 4000) : '',
      dispositivo: e.dispositivo || ''
    };
  }));
}
function _log(e) { _logs([e]); }

/* ══════════════════════════════════════════════════════
   SEGURIDAD: secreto, hashes, tokens
══════════════════════════════════════════════════════ */
function _secreto() {
  const props = PropertiesService.getScriptProperties();
  let s = props.getProperty('CASINO_SECRET');
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty('CASINO_SECRET', s);
  }
  return s;
}
function _hex(bytes) {
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}
function _sha256Hex(s) {
  return _hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8));
}
function _hmacHex(s) {
  return _hex(Utilities.computeHmacSha256Signature(s, _secreto()));
}
function _pinHash(hashCliente) { return _hmacHex('pin:' + String(hashCliente).toLowerCase()); }

function _crearToken(u) {
  const exp = Date.now() + SESION_HORAS * 3600 * 1000;
  const payload = [u.usuario, u.rol, exp].join('|');
  const b64 = Utilities.base64EncodeWebSafe(payload, Utilities.Charset.UTF_8);
  return { token: b64 + '.' + _hmacHex('tok:' + payload), exp: exp };
}

function _usuarios() {
  const cache = CacheService.getScriptCache();
  const c = cache.get('USUARIOS');
  if (c) return JSON.parse(c);
  const lista = _leer('Usuarios').map(function (u) {
    return {
      usuario: _txt(u.usuario).toLowerCase(), nombre: _txt(u.nombre), rol: _txt(u.rol).toUpperCase(),
      sas: _txt(u.sas), cuadrillas: _txt(u.cuadrillas), pin_hash: _txt(u.pin_hash),
      activo: _txt(u.activo).toUpperCase() !== 'NO'
    };
  });
  try { cache.put('USUARIOS', JSON.stringify(lista), 60); } catch (e) {}
  return lista;
}
function _usuario(usuario) {
  const u = String(usuario || '').toLowerCase().trim();
  return _usuarios().filter(function (x) { return x.usuario === u; })[0] || null;
}

function _validarSesion(token, rolesPermitidos) {
  const t = String(token || '');
  const partes = t.split('.');
  if (partes.length !== 2) return { ok: false, error: 'Sesión inválida. Ingrese de nuevo.' };
  let payload;
  try {
    payload = Utilities.newBlob(Utilities.base64DecodeWebSafe(partes[0])).getDataAsString();
  } catch (e) { return { ok: false, error: 'Sesión inválida. Ingrese de nuevo.' }; }
  if (_hmacHex('tok:' + payload) !== partes[1]) return { ok: false, error: 'Sesión inválida. Ingrese de nuevo.' };
  const p = payload.split('|');
  if (Number(p[2]) < Date.now()) return { ok: false, error: 'Sesión vencida. Ingrese de nuevo.' };
  const u = _usuario(p[0]);
  if (!u || !u.activo) return { ok: false, error: 'Usuario inactivo.' };
  if (rolesPermitidos && rolesPermitidos.indexOf(u.rol) === -1)
    return { ok: false, error: 'Su rol no tiene permiso para esta acción.' };
  return { ok: true, usuario: u };
}

function _rateLimit(clave) {
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get('rl_' + clave) || 0);
  return n >= MAX_INTENTOS_PIN;
}
function _falloPin(clave) {
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get('rl_' + clave) || 0) + 1;
  cache.put('rl_' + clave, String(n), BLOQUEO_SEG);
  return MAX_INTENTOS_PIN - n;
}

/* ── Dispositivos (tablets autorizadas) ── */
function _validarDispositivo(id, token) {
  const did = _txt(id).slice(0, 40), tok = _txt(token);
  if (!did || !tok) return { ok: false, error: 'Tablet no autorizada.' };
  const cache = CacheService.getScriptCache();
  const h = _sha256Hex(tok);
  const c = cache.get('dev_' + did);
  if (c === h) return { ok: true, id: did };
  const fila = _buscarFila('Dispositivos', 'id', did);
  if (!fila || _txt(fila.estado).toUpperCase() !== 'ACTIVO' || _txt(fila.token_hash) !== h)
    return { ok: false, error: 'Tablet no autorizada o revocada.' };
  cache.put('dev_' + did, h, 300);
  _actualizarFila('Dispositivos', fila._fila, { ultima_conexion: _ahora().ts });
  return { ok: true, id: did, nombre: _txt(fila.nombre) };
}

/* ══════════════════════════════════════════════════════
   MAESTROS
══════════════════════════════════════════════════════ */
function _config() {
  const cfg = {};
  CONFIG_INICIAL.forEach(function (c) { cfg[c[0]] = c[1]; });
  _leer('Config').forEach(function (r) { if (_txt(r.clave)) cfg[_txt(r.clave)] = _txt(r.valor); });
  return cfg;
}

function _servicios() {
  return _leer('Servicios').map(function (s) {
    return {
      id: _txt(s.id).toUpperCase(), nombre: _txt(s.nombre),
      hora_inicio: _hhmm(s.hora_inicio), hora_fin: _hhmm(s.hora_fin),
      valor: Number(String(s.valor).replace(/[^\d.]/g, '')) || 0,
      permite_campo: _txt(s.permite_campo).toUpperCase() === 'SI',
      activo: _txt(s.activo).toUpperCase() !== 'NO'
    };
  });
}

function _sasLista() {
  return _leer('SAS').map(function (s) {
    return { id: _txt(s.id), nombre: _txt(s.nombre), nit: _txt(s.nit), activo: _txt(s.activo).toUpperCase() !== 'NO' };
  });
}

function _personas() {
  return _leer('Personas_Casino').map(function (p) {
    return {
      _fila: p._fila,
      documento: _txt(p.documento), nombre: _txt(p.nombre), cargo: _txt(p.cargo),
      origen: _txt(p.origen) || 'MANUAL', estado_asistencia: _txt(p.estado_asistencia).toUpperCase(),
      tipo_pago: _txt(p.tipo_pago).toUpperCase(), sas: _txt(p.sas_contratista),
      centro_costo: _txt(p.centro_costo), cuadrilla: _txt(p.cuadrilla),
      activo: _txt(p.activo).toUpperCase() !== 'NO'
    };
  }).filter(function (p) { return p.documento; });
}

// Devuelve '' si puede recibir ración, o el motivo del bloqueo.
function _motivoNoElegible(p, sasMap) {
  if (!p) return 'NO_REGISTRADO';
  if (!p.activo || p.estado_asistencia === 'INACTIVO') return 'INACTIVO';
  if (p.tipo_pago !== 'EMPRESA' && p.tipo_pago !== 'SAS') return 'SIN_CLASIFICAR';
  if (p.tipo_pago === 'EMPRESA' && !p.centro_costo) return 'SIN_CLASIFICAR';
  if (p.tipo_pago === 'SAS') {
    const s = sasMap[p.sas];
    if (!s) return 'SIN_CLASIFICAR';
    if (!s.activo) return 'SAS_INACTIVA';
  }
  return '';
}

/* ══════════════════════════════════════════════════════
   doGet / doPost
══════════════════════════════════════════════════════ */
function _json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return _json({ ok: true, app: 'casino', version: APP_VERSION, servidor: _ahora() });
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return _json({ ok: false, error: 'Solicitud inválida' }); }
  const accion = _txt(d.accion);
  try {
    const fn = ACCIONES[accion];
    if (!fn) return _json({ ok: false, error: 'Acción desconocida: ' + accion });
    return _json(fn(d));
  } catch (err) {
    return _json({ ok: false, error: 'Error del servidor: ' + (err && err.message ? err.message : err) });
  }
}

const ACCIONES = {
  login: accLogin,
  autorizarDispositivo: accAutorizarDispositivo,
  catalogo: accCatalogo,
  registrarLote: accRegistrarLote,
  anularRegistro: accAnularRegistro,
  guardarPersona: accGuardarPersona,
  guardarSAS: accGuardarSAS,
  sincronizarPersonal: accSincronizarPersonal
};

/* ── login {usuario, hash, dispositivo} ── */
function accLogin(d) {
  const usuario = _txt(d.usuario).toLowerCase().slice(0, 40);
  const hash = _txt(d.hash).toLowerCase();
  if (!usuario || hash.length !== 64) return { ok: false, error: 'Usuario y PIN requeridos.' };
  const clave = usuario;
  if (_rateLimit(clave)) return { ok: false, error: 'Demasiados intentos. Espere 10 minutos.' };
  const u = _usuario(usuario);
  if (!u || !u.activo || u.pin_hash !== _pinHash(hash)) {
    const quedan = _falloPin(clave);
    _log({ usuario: usuario, accion: 'LOGIN_FALLIDO', dispositivo: _txt(d.dispositivo) });
    return { ok: false, error: quedan > 0 ? 'Usuario o PIN incorrecto. Quedan ' + quedan + ' intentos.'
                                          : 'Demasiados intentos. Espere 10 minutos.' };
  }
  CacheService.getScriptCache().remove('rl_' + clave);
  const t = _crearToken(u);
  _log({ usuario: u.usuario, rol: u.rol, accion: 'LOGIN', dispositivo: _txt(d.dispositivo) });
  return { ok: true, token: t.token, exp: t.exp,
           usuario: { usuario: u.usuario, nombre: u.nombre, rol: u.rol, sas: u.sas, cuadrillas: u.cuadrillas } };
}

/* ── autorizarDispositivo {token(ADMIN), nombre} ── */
function accAutorizarDispositivo(d) {
  const sv = _validarSesion(d.token, ['ADMIN']);
  if (!sv.ok) return sv;
  const nombre = _san(d.nombre, 60) || 'Tablet';
  const id = _uid('TAB');
  const token = Utilities.getUuid() + Utilities.getUuid();
  const a = _ahora();
  const fila = { id: id, token_hash: _sha256Hex(token), nombre: nombre, estado: 'ACTIVO',
                 autorizado_por: sv.usuario.usuario, autorizado_en: a.ts, ultima_conexion: a.ts };
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    _append('Dispositivos', [fila]);
    _log({ usuario: sv.usuario.usuario, rol: sv.usuario.rol, accion: 'AUTORIZAR_DISPOSITIVO',
           hoja: 'Dispositivos', registro_id: id, despues: { id: id, nombre: nombre }, dispositivo: id });
  } finally { lock.releaseLock(); }
  return { ok: true, dispositivo: { id: id, token: token, nombre: nombre } };
}

/* ── catalogo {dispositivo, deviceToken} ──
   Todo lo que la tablet necesita para trabajar sin señal. */
function accCatalogo(d) {
  const dv = _validarDispositivo(d.dispositivo, d.deviceToken);
  if (!dv.ok) return dv;
  const a = _ahora();
  const sas = _sasLista();
  const sasMap = {}; sas.forEach(function (s) { sasMap[s.id] = s; });
  const personas = _personas().map(function (p) {
    return { documento: p.documento, nombre: p.nombre, cargo: p.cargo, origen: p.origen,
             tipo_pago: p.tipo_pago, sas: p.sas, centro_costo: p.centro_costo, cuadrilla: p.cuadrilla,
             motivo: _motivoNoElegible(p, sasMap) };
  });
  const hoyR = _recientes('Raciones', 1).filter(function (r) {
    return _txtFecha(r.fecha) === a.fecha && _txt(r.estado).toUpperCase() === 'VALIDA';
  }).map(function (r) {
    return { id: _txt(r.id), documento: _txt(r.documento), servicio: _txt(r.servicio).toUpperCase(),
             hora: _txtHora(r.hora), modo: _txt(r.modo), tipo_pago: _txt(r.tipo_pago) };
  });
  const hoyV = _recientes('Visitantes', 1).filter(function (r) {
    return _txtFecha(r.fecha) === a.fecha && _txt(r.estado).toUpperCase() === 'VALIDA';
  }).map(function (r) {
    return { id: _txt(r.id), documento: _txt(r.documento), nombre: _txt(r.nombre), servicio: _txt(r.servicio).toUpperCase(), hora: _txtHora(r.hora) };
  });
  return { ok: true, servidor: a, config: _config(), servicios: _servicios(), sas: sas, personas: personas,
           hoy: { fecha: a.fecha, raciones: hoyR, visitantes: hoyV }, dispositivo: { id: dv.id, nombre: dv.nombre || '' } };
}

/* ── registrarLote {dispositivo, deviceToken, raciones[], intentos[], visitantes[]} ──
   Idempotente: un id que ya existe responde YA_EXISTIA y no se duplica. */
function accRegistrarLote(d) {
  const dv = _validarDispositivo(d.dispositivo, d.deviceToken);
  if (!dv.ok) return dv;
  const raciones   = (d.raciones   || []).slice(0, 300);
  const intentos   = (d.intentos   || []).slice(0, 300);
  const visitantes = (d.visitantes || []).slice(0, 100);

  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const a = _ahora();
    const minFecha = _sumarDias(a.fecha, -DIAS_OFFLINE_MAX);
    const horaMax = _sumarMin(a.hora, 5);
    const servicios = {}; _servicios().forEach(function (s) { servicios[s.id] = s; });
    const sasMap = {}; _sasLista().forEach(function (s) { sasMap[s.id] = s; });
    const personas = {}; _personas().forEach(function (p) { personas[p.documento] = p; });
    const cfg = _config();

    const dias = DIAS_OFFLINE_MAX + 1;
    const recR = _recientes('Raciones', dias);
    const idsR = {}, ocupado = {};
    recR.forEach(function (r) {
      idsR[_txt(r.id)] = true;
      if (_txt(r.estado).toUpperCase() === 'VALIDA')
        ocupado[_txtFecha(r.fecha) + '|' + _txt(r.documento) + '|' + _txt(r.servicio).toUpperCase()] = _txtHora(r.hora);
    });
    const idsI = {}; _recientes('Intentos', dias).forEach(function (r) { idsI[_txt(r.id)] = true; });
    const recV = _recientes('Visitantes', dias);
    const idsV = {}, ocupadoV = {};
    recV.forEach(function (r) {
      idsV[_txt(r.id)] = true;
      if (_txt(r.documento) && _txt(r.estado).toUpperCase() === 'VALIDA')
        ocupadoV[_txtFecha(r.fecha) + '|' + _txt(r.documento) + '|' + _txt(r.servicio).toUpperCase()] = true;
    });

    const nuevasR = [], nuevosI = [], nuevosV = [], logs = [], resultados = [];
    const usuariosOk = {};
    function usuarioValido(usr) {
      const k = _txt(usr).toLowerCase();
      if (usuariosOk[k] == null) {
        const u = _usuario(k);
        usuariosOk[k] = !!(u && (u.rol === 'CASINO' || u.rol === 'ADMIN'));
      }
      return usuariosOk[k];
    }
    function validarTiempo(fecha, hora, servicio) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}(:\d{2})?$/.test(hora)) return 'FECHA_INVALIDA';
      if (fecha > a.fecha || fecha < minFecha) return 'FECHA_INVALIDA';
      if (fecha === a.fecha && hora > horaMax) return 'FECHA_INVALIDA';
      const s = servicios[servicio];
      if (!s || !s.activo) return 'SERVICIO_INVALIDO';
      const h = hora.slice(0, 5);
      if (h < s.hora_inicio || h > s.hora_fin) return 'FUERA_HORARIO';
      return '';
    }
    function intento(base, motivo, detalle) {
      const iid = 'I-' + base.id;
      if (idsI[iid]) return;
      idsI[iid] = true;
      nuevosI.push({ id: iid, fecha: base.fecha, hora: base.hora, documento: base.documento || '',
                     servicio: base.servicio || '', motivo: motivo, dispositivo: dv.id,
                     usuario: base.usuario || '', detalle: _san(detalle || '', 300), registrado_en: a.ts });
    }

    /* Raciones */
    raciones.forEach(function (r) {
      const id = _txt(r.id).slice(0, 80);
      const base = { id: id, fecha: _txt(r.fecha), hora: _txtHora(r.hora), documento: _txt(r.documento).replace(/\D/g, ''),
                     servicio: _txt(r.servicio).toUpperCase(), usuario: _txt(r.entregado_por).toLowerCase() };
      if (!/^R-[A-Za-z0-9-]{6,78}$/.test(id)) { resultados.push({ id: id, estado: 'RECHAZADA', motivo: 'ID_INVALIDO' }); return; }
      if (idsR[id]) { resultados.push({ id: id, estado: 'YA_EXISTIA' }); return; }
      if (!usuarioValido(base.usuario)) { resultados.push({ id: id, estado: 'RECHAZADA', motivo: 'USUARIO_INVALIDO' }); return; }
      let motivo = validarTiempo(base.fecha, base.hora, base.servicio);
      const p = personas[base.documento];
      if (!motivo) motivo = _motivoNoElegible(p, sasMap);
      const clave = base.fecha + '|' + base.documento + '|' + base.servicio;
      if (!motivo && ocupado[clave]) motivo = r.offline ? 'DUPLICADA_SYNC' : 'DUPLICADA';
      if (motivo) {
        intento(base, motivo, motivo.indexOf('DUPLICADA') === 0 ? 'Ya recibió a las ' + ocupado[clave] : '');
        resultados.push({ id: id, estado: 'RECHAZADA', motivo: motivo, hora_previa: ocupado[clave] || '' });
        return;
      }
      const s = servicios[base.servicio];
      const fila = {
        id: id, fecha: base.fecha, hora: base.hora.length === 5 ? base.hora + ':00' : base.hora,
        documento: p.documento, nombre: p.nombre, tipo_pago: p.tipo_pago,
        sas: p.tipo_pago === 'SAS' ? p.sas : '', centro_costo: p.tipo_pago === 'EMPRESA' ? p.centro_costo : '',
        servicio: base.servicio, modo: 'CASINO', metodo_id: _txt(r.metodo_id).toUpperCase() === 'ROSTRO' ? 'ROSTRO' : 'CEDULA',
        pedido_id: '', valor: s.valor, entregado_por: base.usuario, dispositivo: dv.id, estado: 'VALIDA',
        registrado_en: a.ts, offline: r.offline ? 'SI' : 'NO'
      };
      nuevasR.push(fila);
      idsR[id] = true; ocupado[clave] = fila.hora;
      logs.push({ usuario: base.usuario, rol: 'CASINO', accion: 'CREAR', hoja: 'Raciones', registro_id: id,
                  despues: fila, dispositivo: dv.id });
      resultados.push({ id: id, estado: 'REGISTRADA' });
    });

    /* Intentos bloqueados en la tablet (sin señal o validación local) */
    intentos.forEach(function (it) {
      const id = _txt(it.id).slice(0, 80);
      if (!/^I-[A-Za-z0-9-]{6,78}$/.test(id)) return;
      if (idsI[id]) { resultados.push({ id: id, estado: 'YA_EXISTIA' }); return; }
      idsI[id] = true;
      nuevosI.push({ id: id, fecha: _txt(it.fecha).slice(0, 10), hora: _txtHora(it.hora),
                     documento: _txt(it.documento).replace(/\D/g, '').slice(0, 20),
                     servicio: _txt(it.servicio).toUpperCase().slice(0, 5), motivo: _san(it.motivo, 30),
                     dispositivo: dv.id, usuario: _txt(it.usuario).toLowerCase().slice(0, 40),
                     detalle: _san(it.detalle, 300), registrado_en: a.ts });
      resultados.push({ id: id, estado: 'REGISTRADA' });
    });

    /* Visitantes */
    visitantes.forEach(function (v) {
      const id = _txt(v.id).slice(0, 80);
      const base = { id: id, fecha: _txt(v.fecha), hora: _txtHora(v.hora), documento: _txt(v.documento).replace(/\D/g, '').slice(0, 20),
                     servicio: _txt(v.servicio).toUpperCase(), usuario: _txt(v.entregado_por).toLowerCase() };
      if (!/^V-[A-Za-z0-9-]{6,78}$/.test(id)) { resultados.push({ id: id, estado: 'RECHAZADA', motivo: 'ID_INVALIDO' }); return; }
      if (idsV[id]) { resultados.push({ id: id, estado: 'YA_EXISTIA' }); return; }
      if (!usuarioValido(base.usuario)) { resultados.push({ id: id, estado: 'RECHAZADA', motivo: 'USUARIO_INVALIDO' }); return; }
      const nombre = _san(v.nombre, 80), autoriza = _san(v.autorizado_por, 80);
      let motivo = (!nombre || !autoriza) ? 'DATOS_INCOMPLETOS' : validarTiempo(base.fecha, base.hora, base.servicio);
      const clave = base.fecha + '|' + base.documento + '|' + base.servicio;
      if (!motivo && base.documento && ocupadoV[clave]) motivo = 'DUPLICADA';
      if (motivo) {
        intento(base, motivo, 'Visitante ' + nombre);
        resultados.push({ id: id, estado: 'RECHAZADA', motivo: motivo });
        return;
      }
      const fila = {
        id: id, fecha: base.fecha, hora: base.hora.length === 5 ? base.hora + ':00' : base.hora,
        nombre: nombre, documento: base.documento, empresa_motivo: _san(v.empresa_motivo, 120),
        servicio: base.servicio, autorizado_por: autoriza, cargo_a: cfg.cargo_visitantes || CARGO_VISITANTES_DEF,
        valor: servicios[base.servicio].valor, entregado_por: base.usuario, dispositivo: dv.id, estado: 'VALIDA',
        registrado_en: a.ts, offline: v.offline ? 'SI' : 'NO'
      };
      nuevosV.push(fila);
      idsV[id] = true; if (base.documento) ocupadoV[clave] = true;
      logs.push({ usuario: base.usuario, rol: 'CASINO', accion: 'CREAR', hoja: 'Visitantes', registro_id: id,
                  despues: fila, dispositivo: dv.id });
      resultados.push({ id: id, estado: 'REGISTRADA' });
    });

    nuevosI.forEach(function (i) {
      logs.push({ usuario: i.usuario, rol: 'CASINO', accion: 'INTENTO_BLOQUEADO', hoja: 'Intentos',
                  registro_id: i.id, despues: i, dispositivo: dv.id });
    });
    _append('Raciones', nuevasR);
    _append('Visitantes', nuevosV);
    _append('Intentos', nuevosI);
    _logs(logs);
    return { ok: true, resultados: resultados, servidor: a };
  } finally {
    lock.releaseLock();
  }
}

function _sumarMin(hora, min) {
  const p = hora.split(':').map(Number);
  let t = p[0] * 60 + p[1] + min;
  if (t > 23 * 60 + 59) t = 23 * 60 + 59;
  return ('0' + Math.floor(t / 60)).slice(-2) + ':' + ('0' + (t % 60)).slice(-2) + ':' + ('0' + (p[2] || 0)).slice(-2);
}

/* ── anularRegistro {token(ADMIN), hoja: Raciones|Visitantes, id, motivo} ── */
function accAnularRegistro(d) {
  const sv = _validarSesion(d.token, ['ADMIN']);
  if (!sv.ok) return sv;
  const hoja = d.hoja === 'Visitantes' ? 'Visitantes' : 'Raciones';
  const motivo = _san(d.motivo, 300);
  if (motivo.length < 5) return { ok: false, error: 'Escriba el motivo de la anulación.' };
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const fila = _buscarFila(hoja, 'id', _txt(d.id));
    if (!fila) return { ok: false, error: 'Registro no encontrado.' };
    if (_txt(fila.estado).toUpperCase() === 'ANULADA') return { ok: false, error: 'El registro ya estaba anulado.' };
    const antes = _limpio(fila);
    const cambios = { estado: 'ANULADA', motivo_anulacion: motivo, anulado_por: sv.usuario.usuario, anulado_en: _ahora().ts };
    _actualizarFila(hoja, fila._fila, cambios);
    _log({ usuario: sv.usuario.usuario, rol: sv.usuario.rol, accion: 'ANULAR', hoja: hoja, registro_id: antes.id,
           antes: antes, despues: cambios, dispositivo: _txt(d.dispositivo) });
    return { ok: true };
  } finally { lock.releaseLock(); }
}

/* ── guardarPersona {token(ADMIN), persona} ── alta o edición */
function accGuardarPersona(d) {
  const sv = _validarSesion(d.token, ['ADMIN']);
  if (!sv.ok) return sv;
  const p = d.persona || {};
  const documento = _txt(p.documento).replace(/\D/g, '');
  if (documento.length < 5 || documento.length > 15) return { ok: false, error: 'Documento inválido.' };
  const tipo = _txt(p.tipo_pago).toUpperCase();
  if (tipo !== 'EMPRESA' && tipo !== 'SAS') return { ok: false, error: 'Tipo de pago debe ser EMPRESA o SAS.' };
  const sas = tipo === 'SAS' ? _txt(p.sas) : '';
  const cc = tipo === 'EMPRESA' ? _san(p.centro_costo, 60) : _san(p.centro_costo, 60);
  if (tipo === 'SAS' && !_sasLista().some(function (s) { return s.id === sas; }))
    return { ok: false, error: 'Seleccione una SAS contratista válida.' };
  if (tipo === 'EMPRESA' && !cc) return { ok: false, error: 'El centro de costo es obligatorio para EMPRESA.' };

  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const existente = _buscarFila('Personas_Casino', 'documento', documento);
    const a = _ahora();
    const nombre = _san(p.nombre, 80);
    if (!existente && !nombre) return { ok: false, error: 'El nombre es obligatorio.' };
    const datos = {
      tipo_pago: tipo, sas_contratista: sas, centro_costo: cc, cuadrilla: _san(p.cuadrilla, 40),
      activo: _txt(p.activo).toUpperCase() === 'NO' ? 'NO' : 'SI',
      actualizado_por: sv.usuario.usuario, actualizado_en: a.ts
    };
    if (existente) {
      // Nombre y cargo de personas de Asistencia los manda Asistencia.
      if (_txt(existente.origen) !== 'ASISTENCIA') {
        if (nombre) datos.nombre = nombre;
        datos.cargo = _san(p.cargo, 60);
      }
      const antes = _limpio(existente);
      _actualizarFila('Personas_Casino', existente._fila, datos);
      _log({ usuario: sv.usuario.usuario, rol: sv.usuario.rol, accion: 'EDITAR', hoja: 'Personas_Casino',
             registro_id: documento, antes: antes, despues: datos, dispositivo: _txt(d.dispositivo) });
    } else {
      datos.documento = documento; datos.nombre = nombre; datos.cargo = _san(p.cargo, 60);
      datos.origen = 'MANUAL'; datos.estado_asistencia = '';
      _append('Personas_Casino', [datos]);
      _log({ usuario: sv.usuario.usuario, rol: sv.usuario.rol, accion: 'CREAR', hoja: 'Personas_Casino',
             registro_id: documento, despues: datos, dispositivo: _txt(d.dispositivo) });
    }
    return { ok: true };
  } finally { lock.releaseLock(); }
}

/* ── guardarSAS {token(ADMIN), sas:{id?, nombre, nit, activo}} ── */
function accGuardarSAS(d) {
  const sv = _validarSesion(d.token, ['ADMIN']);
  if (!sv.ok) return sv;
  const s = d.sas || {};
  const nombre = _san(s.nombre, 80), nit = _san(s.nit, 20);
  if (!nombre) return { ok: false, error: 'El nombre de la SAS es obligatorio.' };
  const activo = _txt(s.activo).toUpperCase() === 'NO' ? 'NO' : 'SI';
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const a = _ahora();
    const id = _txt(s.id);
    if (id) {
      const ex = _buscarFila('SAS', 'id', id);
      if (!ex) return { ok: false, error: 'SAS no encontrada.' };
      const antes = _limpio(ex);
      const cambios = { nombre: nombre, nit: nit, activo: activo };
      _actualizarFila('SAS', ex._fila, cambios);
      _log({ usuario: sv.usuario.usuario, rol: sv.usuario.rol, accion: 'EDITAR', hoja: 'SAS', registro_id: id,
             antes: antes, despues: cambios, dispositivo: _txt(d.dispositivo) });
      return { ok: true, id: id };
    }
    const nuevo = { id: 'SAS-' + (_leer('SAS').length + 1) + '-' + Utilities.getUuid().slice(0, 4).toUpperCase(),
                    nombre: nombre, nit: nit, activo: activo, creado_por: sv.usuario.usuario, creado_en: a.ts };
    _append('SAS', [nuevo]);
    _log({ usuario: sv.usuario.usuario, rol: sv.usuario.rol, accion: 'CREAR', hoja: 'SAS', registro_id: nuevo.id,
           despues: nuevo, dispositivo: _txt(d.dispositivo) });
    return { ok: true, id: nuevo.id };
  } finally { lock.releaseLock(); }
}

/* ── sincronizarPersonal {token(ADMIN)} ──
   Copia de SOLO LECTURA desde la hoja "Personal" de Asistencia. Nunca
   escribe en el Sheet de Asistencia. */
function accSincronizarPersonal(d) {
  const sv = _validarSesion(d.token, ['ADMIN']);
  if (!sv.ok) return sv;
  const r = _sincronizarDesdeAsistencia(sv.usuario.usuario);
  return r;
}

function _sincronizarDesdeAsistencia(usuario) {
  const idAsis = PropertiesService.getScriptProperties().getProperty('ASIST_SHEET_ID');
  if (!idAsis) return { ok: false, error: 'No está configurado el ID del Sheet de Asistencia (menú Casino).' };
  let hojaAsis;
  try { hojaAsis = SpreadsheetApp.openById(idAsis).getSheetByName('Personal'); }
  catch (e) { return { ok: false, error: 'Sin permiso de lectura sobre el Sheet de Asistencia.' }; }
  if (!hojaAsis) return { ok: false, error: 'No se encontró la hoja Personal en Asistencia.' };
  const filas = hojaAsis.getDataRange().getValues();
  const lock = LockService.getScriptLock(); lock.waitLock(25000);
  try {
    const actuales = {}; _personas().forEach(function (p) { actuales[p.documento] = p; });
    const a = _ahora();
    const nuevos = [], logs = [];
    let actualizados = 0;
    for (let i = 1; i < filas.length; i++) {
      const doc = _txt(filas[i][0]).replace(/\D/g, ''), nombre = _txt(filas[i][1]);
      if (!doc || !nombre) continue;
      const cargo = _txt(filas[i][2]);
      const estado = (_txt(filas[i][5]) || 'ACTIVO').toUpperCase();
      const ex = actuales[doc];
      if (!ex) {
        const n = { documento: doc, nombre: _san(nombre, 80), cargo: _san(cargo, 60), origen: 'ASISTENCIA',
                    estado_asistencia: estado, tipo_pago: '', sas_contratista: '', centro_costo: '', cuadrilla: '',
                    activo: 'SI', actualizado_por: 'sync-asistencia', actualizado_en: a.ts };
        nuevos.push(n);
        logs.push({ usuario: usuario, accion: 'CREAR', hoja: 'Personas_Casino', registro_id: doc, despues: n });
      } else if (ex.nombre !== nombre || ex.cargo !== cargo || ex.estado_asistencia !== estado) {
        const cambios = { nombre: _san(nombre, 80), cargo: _san(cargo, 60), estado_asistencia: estado,
                          actualizado_por: 'sync-asistencia', actualizado_en: a.ts };
        if (ex.origen !== 'ASISTENCIA') cambios.origen = 'ASISTENCIA';
        _actualizarFila('Personas_Casino', ex._fila, cambios);
        logs.push({ usuario: usuario, accion: 'EDITAR', hoja: 'Personas_Casino', registro_id: doc,
                    antes: { nombre: ex.nombre, cargo: ex.cargo, estado_asistencia: ex.estado_asistencia }, despues: cambios });
        actualizados++;
      }
    }
    _append('Personas_Casino', nuevos);
    logs.push({ usuario: usuario, accion: 'SYNC_ASISTENCIA', hoja: 'Personas_Casino',
                despues: { nuevos: nuevos.length, actualizados: actualizados } });
    _logs(logs);
    return { ok: true, nuevos: nuevos.length, actualizados: actualizados };
  } finally { lock.releaseLock(); }
}

// Para un disparador diario (Activadores → sincronizacionDiaria).
function sincronizacionDiaria() { _sincronizarDesdeAsistencia('disparador'); }

/* ══════════════════════════════════════════════════════
   CONFIGURACIÓN DESDE EL SHEET (menú "Casino")
══════════════════════════════════════════════════════ */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Casino')
    .addItem('1 · Inicializar hojas', 'inicializarHojas')
    .addItem('2 · Crear usuario', 'menuCrearUsuario')
    .addItem('Cambiar PIN de usuario', 'menuCambiarPin')
    .addItem('ID del Sheet de Asistencia', 'menuAsistenciaId')
    .addItem('Copiar personal de Asistencia ahora', 'menuSincronizar')
    .addToUi();
}

function inicializarHojas() {
  Object.keys(HOJAS).forEach(_hoja);
  if (_leer('Servicios').length === 0) {
    _append('Servicios', SERVICIOS_INICIALES.map(function (s) {
      return { id: s[0], nombre: s[1], hora_inicio: s[2], hora_fin: s[3], valor: s[4], permite_campo: s[5], activo: s[6] };
    }));
  }
  if (_leer('Config').length === 0) {
    _append('Config', CONFIG_INICIAL.map(function (c) { return { clave: c[0], valor: c[1] }; }));
  }
  const def = _ss().getSheetByName('Hoja 1') || _ss().getSheetByName('Sheet1');
  if (def && def.getLastRow() === 0 && _ss().getSheets().length > 1) _ss().deleteSheet(def);
  _secreto();
  _log({ usuario: Session.getEffectiveUser().getEmail(), accion: 'INICIALIZAR_HOJAS' });
  try { SpreadsheetApp.getUi().alert('Hojas listas. Revise los horarios en la hoja Servicios.'); } catch (e) {}
}

function _pedir(ui, texto) {
  const r = ui.prompt(texto, ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return null;
  return r.getResponseText().trim();
}

function menuCrearUsuario() {
  const ui = SpreadsheetApp.getUi();
  const usuario = _pedir(ui, 'Usuario (sin espacios, ej. marta.casino):'); if (!usuario) return;
  const nombre  = _pedir(ui, 'Nombre completo:'); if (!nombre) return;
  const rol     = (_pedir(ui, 'Rol (' + ROLES.join(' / ') + '):') || '').toUpperCase(); if (!rol) return;
  let sas = '';
  if (rol === 'SUPERVISOR') sas = _pedir(ui, 'ID de la SAS que supervisa (vacío si es de la empresa):') || '';
  const pin     = _pedir(ui, 'PIN de 5 dígitos (se guarda cifrado):'); if (!pin) return;
  const r = crearUsuario(usuario, nombre, rol, pin, sas);
  ui.alert(r.ok ? 'Usuario creado: ' + usuario.toLowerCase() : r.error);
}

function crearUsuario(usuario, nombre, rol, pin, sas) {
  usuario = String(usuario || '').toLowerCase().trim();
  rol = String(rol || '').toUpperCase().trim();
  if (!/^[a-z0-9._-]{3,40}$/.test(usuario)) return { ok: false, error: 'Usuario inválido (3–40 letras, números, . _ -).' };
  if (ROLES.indexOf(rol) === -1) return { ok: false, error: 'Rol inválido.' };
  if (!/^\d{5}$/.test(String(pin))) return { ok: false, error: 'El PIN debe tener 5 dígitos.' };
  if (_buscarFila('Usuarios', 'usuario', usuario)) return { ok: false, error: 'Ese usuario ya existe.' };
  const fila = { usuario: usuario, nombre: _san(nombre, 80), rol: rol, sas: _san(sas, 40), cuadrillas: '',
                 pin_hash: _pinHash(_sha256Hex(String(pin))), activo: 'SI', creado_en: _ahora().ts };
  _append('Usuarios', [fila]);
  CacheService.getScriptCache().remove('USUARIOS');
  _log({ usuario: Session.getEffectiveUser().getEmail(), accion: 'CREAR_USUARIO', hoja: 'Usuarios',
         registro_id: usuario, despues: { usuario: usuario, nombre: fila.nombre, rol: rol, sas: fila.sas } });
  return { ok: true };
}

function menuCambiarPin() {
  const ui = SpreadsheetApp.getUi();
  const usuario = (_pedir(ui, 'Usuario:') || '').toLowerCase(); if (!usuario) return;
  const pin = _pedir(ui, 'Nuevo PIN de 5 dígitos:'); if (!pin) return;
  if (!/^\d{5}$/.test(pin)) { ui.alert('El PIN debe tener 5 dígitos.'); return; }
  const f = _buscarFila('Usuarios', 'usuario', usuario);
  if (!f) { ui.alert('Usuario no encontrado.'); return; }
  _actualizarFila('Usuarios', f._fila, { pin_hash: _pinHash(_sha256Hex(pin)) });
  CacheService.getScriptCache().remove('USUARIOS');
  CacheService.getScriptCache().remove('rl_' + usuario);
  _log({ usuario: Session.getEffectiveUser().getEmail(), accion: 'CAMBIAR_PIN', hoja: 'Usuarios', registro_id: usuario });
  ui.alert('PIN actualizado.');
}

function menuAsistenciaId() {
  const ui = SpreadsheetApp.getUi();
  const id = _pedir(ui, 'ID del Sheet de Asistencia (la parte de la URL entre /d/ y /edit):'); if (!id) return;
  const limpio = id.replace(/^.*\/d\//, '').replace(/\/.*$/, '');
  PropertiesService.getScriptProperties().setProperty('ASIST_SHEET_ID', limpio);
  _log({ usuario: Session.getEffectiveUser().getEmail(), accion: 'CONFIG_ASISTENCIA_ID' });
  ui.alert('Guardado. Use "Copiar personal de Asistencia ahora" para probar el acceso.');
}

function menuSincronizar() {
  const r = _sincronizarDesdeAsistencia(Session.getEffectiveUser().getEmail());
  SpreadsheetApp.getUi().alert(r.ok ? 'Personas nuevas: ' + r.nuevos + ' · actualizadas: ' + r.actualizados : r.error);
}

// Solo si el script NO está vinculado al Sheet del casino.
function setSheetId(id) {
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', String(id).trim());
}
