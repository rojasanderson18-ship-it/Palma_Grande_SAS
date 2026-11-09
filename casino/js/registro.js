/* ═══════════════════════════════════════════════════════════
   Casino — arranque, ingreso y Pantalla 1: Registro en casino
   Sin señal: localStorage es la fuente (cola + raciones del día) y se
   sincroniza luego sin duplicar (cada ración tiene id único).
═══════════════════════════════════════════════════════════ */
'use strict';

const App = {
  usuario: null,
  catalogo: null,
  personas: {},     // documento → persona
  sas: {},          // id → sas
  ficha: null,      // { persona, documento, metodo, ok, t }
  ultimaEntrega: { documento: null, t: 0 },
  sincronizando: false,
  ultimoCatalogo: 0,
  enRegistro: false
};
const $ = id => document.getElementById(id);

/* ══════════ Navegación ══════════ */
function mostrar(id) {
  document.querySelectorAll('.pant').forEach(p => { p.hidden = p.id !== id; });
  window.scrollTo(0, 0);
}

function iniciar() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  document.querySelectorAll('[data-salir]').forEach(b => b.addEventListener('click', salir));
  document.querySelectorAll('[data-cerrar]').forEach(b => b.addEventListener('click', () => cerrarModal(b.dataset.cerrar)));
  window.addEventListener('online', () => { pintarSync(); sincronizar(); });
  window.addEventListener('offline', pintarSync);
  configurarSetup();
  configurarLogin();
  configurarTablet();
  configurarRegistro();
  setInterval(tick, 15000);
  setInterval(() => { if (App.enRegistro) sincronizar(); }, 30000);
  ruta();
}

function ruta() {
  if (!gasUrl()) { mostrar('pSetup'); return; }
  const s = sesion();
  if (!s) { abrirLogin(); return; }
  App.usuario = s.usuario;
  if (s.usuario.rol === 'CASINO' || s.usuario.rol === 'ADMIN') {
    if (!lsGet(LS.disp, null)) {
      $('tabletAdmin').hidden = s.usuario.rol !== 'ADMIN';
      $('tabletNoAdmin').hidden = s.usuario.rol === 'ADMIN';
      mostrar('pTablet');
      return;
    }
    entrarRegistro();
  } else {
    $('otroRolUsuario').textContent = `${s.usuario.nombre} · ${s.usuario.rol}`;
    mostrar('pOtroRol');
  }
}

async function salir() {
  const n = totalCola();
  const msg = n
    ? `Hay ${n} registro(s) pendientes de enviar. No se pierden: se enviarán cuando haya señal. ¿Cerrar la sesión de ${App.usuario ? App.usuario.nombre : ''}?`
    : `¿Cerrar la sesión de ${App.usuario ? App.usuario.nombre : ''}?`;
  if (!navigator.onLine) {
    if (!await confirmar(msg + '\n\nSin señal no se puede volver a ingresar hasta recuperarla.', 'Cerrar sesión')) return;
  } else if (!await confirmar(msg, 'Cerrar sesión')) return;
  salirRegistro();
  cerrarSesion();
  App.usuario = null;
  ruta();
}

/* ══════════ Configuración de URL ══════════ */
function configurarSetup() {
  $('setupUrl').value = gasUrl();
  $('setupGuardar').onclick = () => {
    const u = $('setupUrl').value.trim();
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(u)) {
      $('setupError').textContent = 'La URL debe ser de Apps Script y terminar en /exec.';
      return;
    }
    lsSet(LS.url, u);
    $('setupError').textContent = '';
    ruta();
  };
  $('loginCambiarUrl').onclick = () => { $('setupUrl').value = gasUrl(); mostrar('pSetup'); };
}

/* ══════════ Ingreso: usuario + PIN de 5 dígitos ══════════ */
let pinBuf = [];
function pintarPin() { document.querySelectorAll('#pinDots i').forEach((d, i) => d.classList.toggle('on', i < pinBuf.length)); }

function abrirLogin() {
  pinBuf = []; pintarPin();
  $('loginError').textContent = '';
  $('loginUsuario').value = lsGet(LS.ultUsuario, '') || '';
  $('loginFecha').textContent = fechaCorta(fechaBogota());
  $('loginNota').textContent = navigator.onLine ? '' : 'Sin señal: el ingreso necesita conexión. Lo ya registrado sigue guardado en la tablet.';
  mostrar('pLogin');
}

function configurarLogin() {
  $('pinPad').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const k = b.dataset.k;
    if (k === 'C') pinBuf.pop();
    else if (k === 'OK') { hacerLogin(); return; }
    else if (pinBuf.length < 5) pinBuf.push(k);
    pintarPin();
    if (pinBuf.length === 5) hacerLogin();
  });
  document.addEventListener('keydown', e => {
    if ($('pLogin').hidden || document.activeElement === $('loginUsuario')) return;
    if (/^\d$/.test(e.key) && pinBuf.length < 5) { pinBuf.push(e.key); pintarPin(); if (pinBuf.length === 5) hacerLogin(); }
    else if (e.key === 'Backspace') { pinBuf.pop(); pintarPin(); }
  });
}

let loginEnCurso = false;
async function hacerLogin() {
  if (loginEnCurso) return;
  const usuario = $('loginUsuario').value.trim().toLowerCase();
  const err = $('loginError');
  if (!usuario) { err.textContent = 'Escriba su usuario.'; $('loginUsuario').focus(); return; }
  if (pinBuf.length !== 5) { err.textContent = 'Ingrese los 5 dígitos del PIN.'; return; }
  loginEnCurso = true;
  err.textContent = '';
  $('loginNota').textContent = 'Verificando…';
  try {
    const hash = await sha256Hex(pinBuf.join(''));
    const disp = lsGet(LS.disp, null);
    const r = await api('login', { usuario, hash, dispositivo: disp ? disp.id : '' });
    if (!r.ok) { err.textContent = r.error || 'No se pudo ingresar.'; return; }
    lsSet(LS.sesion, { token: r.token, exp: r.exp, usuario: r.usuario });
    lsSet(LS.ultUsuario, usuario);
    ruta();
  } catch (e) {
    err.textContent = navigator.onLine ? 'No se pudo contactar el servidor: ' + e.message : 'Sin señal. El ingreso necesita conexión.';
  } finally {
    loginEnCurso = false;
    pinBuf = []; pintarPin();
    $('loginNota').textContent = '';
  }
}

/* ══════════ Autorizar tablet (ADMIN) ══════════ */
function configurarTablet() {
  $('tabletAutorizar').onclick = async () => {
    const s = sesion(); if (!s) { abrirLogin(); return; }
    const nombre = $('tabletNombre').value.trim();
    if (nombre.length < 3) { $('tabletError').textContent = 'Escriba un nombre para la tablet.'; return; }
    $('tabletAutorizar').disabled = true;
    try {
      const r = await api('autorizarDispositivo', { token: s.token, nombre });
      if (!r.ok) { $('tabletError').textContent = r.error; return; }
      lsSet(LS.disp, r.dispositivo);
      toast('Tablet autorizada', 'ok');
      ruta();
    } catch (e) {
      $('tabletError').textContent = 'No se pudo contactar el servidor: ' + e.message;
    } finally { $('tabletAutorizar').disabled = false; }
  };
}

/* ══════════ Catálogo y datos del día ══════════ */
function indexar() {
  const c = App.catalogo || lsGet(LS.catalogo, null);
  App.catalogo = c;
  App.personas = {}; App.sas = {};
  if (!c) return;
  (c.personas || []).forEach(p => { App.personas[p.documento] = p; });
  (c.sas || []).forEach(s => { App.sas[s.id] = s; });
}

function cola() { return lsGet(LS.cola, null) || { raciones: [], intentos: [], visitantes: [] }; }
function totalCola() { const c = cola(); return c.raciones.length + c.intentos.length + c.visitantes.length; }

function hoy() {
  const f = fechaBogota();
  let h = lsGet(LS.hoy, null);
  if (!h || h.fecha !== f) {
    h = { fecha: f, raciones: [], visitantes: [] };
    lsSet(LS.hoy, h);
    lsSet(LS.vistos, {});
  }
  return h;
}

// Lo del servidor manda; se conservan solo los registros locales aún pendientes.
function fusionarHoy(srv) {
  const f = fechaBogota();
  if (!srv || srv.fecha !== f) return;
  const c = cola();
  const pendR = new Set(c.raciones.map(r => r.id)), pendV = new Set(c.visitantes.map(v => v.id));
  const local = hoy();
  const raciones = srv.raciones.slice();
  const idsR = new Set(raciones.map(r => r.id));
  local.raciones.forEach(r => { if (pendR.has(r.id) && !idsR.has(r.id)) raciones.push(r); });
  const visitantes = srv.visitantes.slice();
  const idsV = new Set(visitantes.map(v => v.id));
  local.visitantes.forEach(v => { if (pendV.has(v.id) && !idsV.has(v.id)) visitantes.push(v); });
  lsSet(LS.hoy, { fecha: f, raciones, visitantes });
}

async function cargarCatalogo(silencioso) {
  const cred = credDispositivo();
  if (!cred.dispositivo) return false;
  try {
    const r = await api('catalogo', cred);
    if (!r.ok) {
      if (!silencioso) toast(r.error || 'No se pudo actualizar', 'err');
      if (/autoriz|revocad/i.test(r.error || '')) agregarAviso('cat-auth', 'El servidor rechazó esta tablet: ' + r.error + ' Un ADMIN debe volver a autorizarla (Administración → Tablet). Lo pendiente sigue guardado.');
      return false;
    }
    const cat = { config: r.config, servicios: r.servicios, sas: r.sas, personas: r.personas,
                  dispositivo: r.dispositivo, actualizado: Date.now() };
    lsSet(LS.catalogo, cat);
    App.catalogo = cat;
    const d = lsGet(LS.disp, null);
    if (d && r.dispositivo && r.dispositivo.nombre && d.nombre !== r.dispositivo.nombre) { d.nombre = r.dispositivo.nombre; lsSet(LS.disp, d); }
    fusionarHoy(r.hoy);
    App.ultimoCatalogo = Date.now();
    indexar();
    quitarAviso('cat-auth');
    return true;
  } catch (e) {
    if (!silencioso) toast('Sin conexión: se usan los datos guardados', 'err');
    return false;
  } finally {
    if (App.enRegistro) { pintarCabecera(); pintarContadores(); pintarSync(); }
  }
}

/* ══════════ Sincronización (idempotente) ══════════ */
async function sincronizar() {
  if (App.sincronizando || !navigator.onLine) { pintarSync(); return; }
  const c = cola();
  if (!c.raciones.length && !c.intentos.length && !c.visitantes.length) {
    pintarSync();
    if (Date.now() - App.ultimoCatalogo > 5 * 60 * 1000) cargarCatalogo(true);
    return;
  }
  App.sincronizando = true;
  pintarSync();
  try {
    const ahora = Date.now();
    const marcar = x => Object.assign({}, x, { offline: x.offline || (ahora - (x._t || ahora) > 60000) });
    const lote = { raciones: c.raciones.slice(0, 200).map(marcar), intentos: c.intentos.slice(0, 200),
                   visitantes: c.visitantes.slice(0, 50).map(marcar) };
    const r = await api('registrarLote', Object.assign(credDispositivo(), lote), 30000);
    if (!r.ok) {
      if (/autoriz|revocad/i.test(r.error || '')) agregarAviso('cat-auth', 'El servidor rechazó esta tablet: ' + r.error + ' Lo pendiente sigue guardado en la tablet.');
      return;
    }
    const res = {}; (r.resultados || []).forEach(x => { res[x.id] = x; });
    const enviados = new Set([...lote.raciones, ...lote.intentos, ...lote.visitantes].map(x => x.id));
    // Solo se quitan de la cola los que el servidor respondió.
    const actual = cola();
    const quedan = arr => arr.filter(x => !(enviados.has(x.id) && res[x.id]));
    lsSet(LS.cola, { raciones: quedan(actual.raciones), intentos: quedan(actual.intentos), visitantes: quedan(actual.visitantes) });

    const h = hoy();
    const rechazadas = [];
    h.raciones = h.raciones.filter(x => {
      const z = res[x.id];
      if (z && z.estado === 'RECHAZADA') { rechazadas.push({ x, z }); return false; }
      if (z) delete x.pendiente;
      return true;
    });
    h.visitantes = h.visitantes.filter(x => {
      const z = res[x.id];
      if (z && z.estado === 'RECHAZADA') { rechazadas.push({ x, z, vis: true }); return false; }
      if (z) delete x.pendiente;
      return true;
    });
    lsSet(LS.hoy, h);
    rechazadas.forEach(({ x, z, vis }) => {
      const p = App.personas[x.documento];
      const quien = vis ? 'Visitante ' + (x.nombre || '') : (p ? p.nombre : 'C.C. ' + x.documento);
      const sv = servicios().find(z => z.id === x.servicio);
      agregarAviso('rech-' + x.id, `Ración no aceptada al sincronizar · ${quien} (${sv ? sv.nombre : x.servicio} ${x.hora.slice(0, 5)}): ${textoMotivo(z.motivo)}${z.hora_previa ? ' a las ' + z.hora_previa.slice(0, 5) : ''}.`);
    });
    if (totalCola()) setTimeout(sincronizar, 500);
  } catch (e) {
    // Sin red o servidor caído: queda en la cola, se reintenta.
  } finally {
    App.sincronizando = false;
    if (App.enRegistro) { pintarSync(); pintarContadores(); }
  }
}

/* ══════════ Avisos persistentes ══════════ */
function agregarAviso(id, texto) {
  const a = lsGet(LS.avisos, []).filter(x => x.id !== id);
  a.unshift({ id, texto });
  lsSet(LS.avisos, a.slice(0, 20));
  pintarAvisos();
}
function quitarAviso(id) { lsSet(LS.avisos, lsGet(LS.avisos, []).filter(x => x.id !== id)); pintarAvisos(); }
function pintarAvisos() {
  const el = $('avisos'); if (!el) return;
  el.innerHTML = lsGet(LS.avisos, []).map(a =>
    `<div class="alerta"><div>${esc(a.texto)}</div><button aria-label="Cerrar aviso" data-aviso="${esc(a.id)}">×</button></div>`).join('');
  el.querySelectorAll('[data-aviso]').forEach(b => { b.onclick = () => quitarAviso(b.dataset.aviso); });
}

/* ══════════ Servicio actual ══════════ */
function servicios() { return ((App.catalogo && App.catalogo.servicios) || []).filter(s => s.activo); }
function servicioActual() {
  const h = ahoraBogota().hhmm;
  return servicios().find(s => h >= s.hora_inicio && h <= s.hora_fin) || null;
}
function proximoServicio() {
  const h = ahoraBogota().hhmm;
  return servicios().filter(s => s.hora_inicio > h).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))[0] || null;
}

/* ══════════ Pantalla 1 ══════════ */
function configurarRegistro() {
  $('btnEntregar').onclick = entregar;
  $('btnCedula').onclick = () => { $('cedInput').value = ''; $('cedError').textContent = ''; abrirModal('modalCedula'); };
  $('cedBuscar').onclick = buscarCedula;
  $('cedInput').addEventListener('keydown', e => { if (e.key === 'Enter') buscarCedula(); });
  $('cedInput').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); });
  $('btnVisitante').onclick = abrirVisitante;
  $('visGuardar').onclick = guardarVisitante;
  $('visDoc').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); });
}

async function entrarRegistro() {
  App.enRegistro = true;
  indexar();
  hoy();
  mostrar('pRegistro');
  $('btnAdmin').hidden = !(App.usuario && App.usuario.rol === 'ADMIN');
  limpiarFicha();
  pintarCabecera(); pintarContadores(); pintarSync(); pintarAvisos(); pintarPie();
  if (!App.catalogo) $('camEstado').textContent = 'Descargando datos del casino…';
  cargarCatalogo(!!App.catalogo).then(sincronizar);
  iniciarCamaraRegistro();
}

function salirRegistro() {
  App.enRegistro = false;
  Rostros.pararReconocimiento();
  Rostros.detenerCamara();
}

async function iniciarCamaraRegistro() {
  const est = (t, tipo) => {
    $('camEstado').textContent = t;
    $('camBox').classList.toggle('ok', tipo === 'ok');
    $('camBox').classList.toggle('aviso', tipo === 'aviso');
  };
  try {
    await Rostros.cargar();
    est('Cargando reconocimiento facial…');
    await Rostros.cargarModelos();
    await Rostros.iniciarCamara($('video'));
    est('Mire a la cámara');
    Rostros.iniciarReconocimiento({
      onEstado: (t, tipo) => { if (!App.ficha) est(t, tipo); },
      onMatch: (doc) => {
        if (App.ficha && App.ficha.documento === doc) return;
        mostrarFicha(doc, 'ROSTRO');
      },
      // Con una ficha en pantalla no se cambia de persona durante 6 s.
      pausado: () => !App.enRegistro || !$('pAdmin').hidden ||
        (App.ficha && Date.now() - App.ficha.t < 6000) || !$('modalCedula').hidden || !$('modalVisitante').hidden
    });
  } catch (e) {
    est('Cámara o reconocimiento no disponible · use Buscar por cédula', 'aviso');
  }
}

function pintarCabecera() {
  const cfg = (App.catalogo && App.catalogo.config) || {};
  $('regCasino').textContent = cfg.nombre_casino || 'Casino';
  const s = servicioActual();
  const f = fechaCorta(fechaBogota());
  if (s) {
    $('regServicio').textContent = s.nombre;
    $('regLinea').textContent = `${f} · servicio abierto ${s.hora_inicio} – ${s.hora_fin}`;
  } else {
    const p = proximoServicio();
    $('regServicio').textContent = App.catalogo ? 'Sin servicio abierto' : 'Sin datos del casino';
    $('regLinea').textContent = p ? `${f} · próximo: ${p.nombre} ${p.hora_inicio} – ${p.hora_fin}` : `${f} · no hay más servicios hoy`;
  }
  $('btnVisitante').disabled = !s;
}

function pintarContadores() {
  const s = servicioActual();
  const h = hoy();
  const rs = s ? h.raciones.filter(r => r.servicio === s.id) : h.raciones;
  const vs = s ? h.visitantes.filter(v => v.servicio === s.id) : h.visitantes;
  const emp = rs.filter(r => r.tipo_pago === 'EMPRESA').length, sas = rs.filter(r => r.tipo_pago === 'SAS').length;
  const etiqueta = s ? `${s.nombre}s entregados hoy` : 'Entregadas hoy';
  $('contadores').innerHTML =
    `<span>${esc(etiqueta)}: <b>${rs.length + vs.length}</b></span>` +
    `<span>Empresa <b class="c-emp">${emp}</b> · SAS <b class="c-sas">${sas}</b>${vs.length ? ` · Visit. <b>${vs.length}</b>` : ''}</span>`;
}

function pintarSync() {
  const el = $('regSync'); if (!el) return;
  const n = totalCola();
  if (!navigator.onLine) { el.className = 'sync off'; el.textContent = n ? `Sin señal · ${n} pendientes` : 'Sin señal'; }
  else if (App.sincronizando) { el.className = 'sync pend'; el.textContent = 'Enviando…'; }
  else if (n) { el.className = 'sync pend'; el.textContent = `${n} pendientes`; }
  else { el.className = 'sync'; el.textContent = 'Al día'; }
}

function pintarPie() {
  const d = lsGet(LS.disp, null);
  const u = App.usuario;
  $('regPie').textContent = `Entrega: ${u ? u.nombre : '—'} (${u ? u.rol.toLowerCase() : ''}) · ${d ? d.nombre : 'tablet sin autorizar'}`;
}

function tick() {
  if (!App.enRegistro) return;
  if (!sesion()) { salirRegistro(); toast('La sesión terminó. Ingrese de nuevo.', 'err'); ruta(); return; }
  hoy();
  pintarCabecera(); pintarContadores(); pintarSync();
  if (App.ficha && Date.now() - App.ficha.t > 25000) limpiarFicha();
}

/* ── Ficha ── */
const ICO_OK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';
const ICO_X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

function limpiarFicha() {
  App.ficha = null;
  $('ficha').classList.remove('entregada');
  $('ficha').innerHTML = '<div class="ficha-vacia">Esperando trabajador…<br><span>Rostro o cédula</span></div>';
  $('btnEntregar').disabled = true;
}

// Evalúa si la persona puede recibir ahora. Devuelve { ok, motivo, texto, previa }.
function evaluar(persona, documento, s) {
  if (!s) return { ok: false, motivo: 'FUERA_HORARIO', texto: 'No hay servicio abierto en este momento' };
  if (!persona) return { ok: false, motivo: 'NO_REGISTRADO', texto: textoMotivo('NO_REGISTRADO') };
  if (persona.motivo) return { ok: false, motivo: persona.motivo, texto: textoMotivo(persona.motivo) };
  const previa = hoy().raciones.find(r => r.documento === documento && r.servicio === s.id);
  if (previa) return { ok: false, motivo: 'DUPLICADA', texto: `Ya recibió ${s.nombre.toLowerCase()} hoy · ${previa.hora.slice(0, 5)}`, previa };
  return { ok: true, texto: `Primer ${s.nombre.toLowerCase()} del día · ${ahoraBogota().hhmm}` };
}

function mostrarFicha(documento, metodo) {
  if (!App.catalogo) { toast('Faltan los datos del casino: conecte la tablet a internet una vez', 'err'); return; }
  const p = App.personas[documento] || null;
  const s = servicioActual();
  const ev = evaluar(p, documento, s);
  App.ficha = { documento, persona: p, metodo, ok: ev.ok, t: Date.now() };

  const reciente = App.ultimaEntrega.documento === documento && Date.now() - App.ultimaEntrega.t < 90000;
  let etq = '<span class="etq etq-gris">SIN CLASIFICAR</span>';
  let linea = '';
  if (p && p.tipo_pago === 'SAS') {
    const sas = App.sas[p.sas];
    etq = '<span class="etq etq-sas">SAS</span>';
    linea = `Contratista: <b>${esc(sas ? sas.nombre : p.sas || '—')}</b> · ${sas && sas.activo ? 'Contrato vigente' : 'Contrato inactivo'}`;
  } else if (p && p.tipo_pago === 'EMPRESA') {
    etq = '<span class="etq etq-emp">EMPRESA</span>';
    linea = `Centro de costo: <b>${esc(p.centro_costo || '—')}</b>`;
  }
  const clase = ev.ok ? 'estado-ok' : (ev.motivo === 'FUERA_HORARIO' ? 'estado-aviso' : 'estado-err');
  const estadoTxt = reciente && ev.motivo === 'DUPLICADA' ? `Ración entregada · ${ev.previa.hora.slice(0, 5)}` : ev.texto;
  $('ficha').classList.remove('entregada');
  $('ficha').innerHTML = `
    <div class="ficha-cab"><div class="ficha-nombre">${esc(p ? p.nombre : 'Persona no registrada')}</div>${p ? etq : ''}</div>
    <div class="ficha-dato">C.C. ${esc(docOculto(documento))}${p && p.cargo ? ' · ' + esc(p.cargo) : ''} · ${metodo === 'ROSTRO' ? 'por rostro' : 'por cédula'}</div>
    ${linea ? `<div class="ficha-dato">${linea}</div>` : ''}
    <div class="estado ${reciente && ev.motivo === 'DUPLICADA' ? 'estado-ok' : clase}">${ev.ok || reciente ? ICO_OK : ICO_X}${esc(estadoTxt)}</div>`;
  $('btnEntregar').disabled = !ev.ok;
  if (!ev.ok) {
    $('camBox').classList.remove('ok');
    // Bloqueado: se registra el intento (una vez por persona/servicio/motivo al día),
    // salvo que sea la misma persona que acaba de recibir y sigue frente a la cámara.
    if (!(reciente && ev.motivo === 'DUPLICADA') && ev.motivo !== 'FUERA_HORARIO') registrarIntento(documento, s, ev);
  }
}

function registrarIntento(documento, s, ev) {
  const a = ahoraBogota();
  const vistos = lsGet(LS.vistos, {});
  const k = `${a.fecha}|${documento}|${s ? s.id : ''}|${ev.motivo}`;
  if (vistos[k]) return;
  vistos[k] = 1; lsSet(LS.vistos, vistos);
  const c = cola();
  c.intentos.push({ id: uid('I'), fecha: a.fecha, hora: a.hora, documento, servicio: s ? s.id : '',
                    motivo: ev.motivo, usuario: App.usuario.usuario,
                    detalle: ev.previa ? 'Ya recibió a las ' + ev.previa.hora.slice(0, 5) : '' });
  lsSet(LS.cola, c);
  pintarSync();
  sincronizar();
}

function entregar() {
  const f = App.ficha;
  if (!f) return;
  $('btnEntregar').disabled = true;     // evita doble toque
  const s = servicioActual();
  const ev = evaluar(f.persona, f.documento, s);
  if (!ev.ok) { mostrarFicha(f.documento, f.metodo); return; }
  const a = ahoraBogota();
  const racion = { id: uid('R'), fecha: a.fecha, hora: a.hora, documento: f.documento, servicio: s.id,
                   metodo_id: f.metodo, entregado_por: App.usuario.usuario, offline: !navigator.onLine, _t: Date.now() };
  const c = cola();
  c.raciones.push(racion);
  if (!lsSet(LS.cola, c)) { toast('No se pudo guardar en la tablet', 'err'); return; }
  const h = hoy();
  h.raciones.push({ id: racion.id, documento: f.documento, servicio: s.id, hora: a.hora, modo: 'CASINO',
                    tipo_pago: f.persona.tipo_pago, pendiente: true });
  lsSet(LS.hoy, h);
  App.ultimaEntrega = { documento: f.documento, t: Date.now() };

  $('ficha').classList.add('entregada');
  const est = $('ficha').querySelector('.estado');
  if (est) { est.className = 'estado estado-ok'; est.innerHTML = ICO_OK + esc(`Ración entregada · ${a.hhmm}`); }
  toast(`✓ ${s.nombre} entregado a ${f.persona.nombre.split(' ')[0]}`, 'ok');
  pintarContadores(); pintarSync();
  setTimeout(() => { if (App.ficha === f) limpiarFicha(); }, 2500);
  sincronizar();
}

function buscarCedula() {
  const doc = $('cedInput').value.replace(/\D/g, '');
  if (doc.length < 5) { $('cedError').textContent = 'Escriba la cédula completa.'; return; }
  cerrarModal('modalCedula');
  mostrarFicha(doc, 'CEDULA');
}

/* ── Visitantes ── */
function abrirVisitante() {
  const s = servicioActual();
  if (!s) { toast('No hay servicio abierto', 'err'); return; }
  const cfg = (App.catalogo && App.catalogo.config) || {};
  $('visServicio').textContent = `${s.nombre} · ${pesos(s.valor)}`;
  $('visCargo').textContent = cfg.cargo_visitantes || 'Palma Grande S.A.S';
  ['visNombre', 'visDoc', 'visEmpresa', 'visAutoriza'].forEach(id => { $(id).value = ''; });
  $('visError').textContent = '';
  abrirModal('modalVisitante');
}

function guardarVisitante() {
  const s = servicioActual();
  const nombre = $('visNombre').value.trim(), autoriza = $('visAutoriza').value.trim();
  const documento = $('visDoc').value.replace(/\D/g, '');
  if (!s) { $('visError').textContent = 'El servicio ya cerró.'; return; }
  if (nombre.length < 3) { $('visError').textContent = 'Escriba el nombre del visitante.'; return; }
  if (autoriza.length < 3) { $('visError').textContent = 'Escriba quién autoriza.'; return; }
  const h = hoy();
  if (documento && h.visitantes.some(v => v.documento === documento && v.servicio === s.id)) {
    $('visError').textContent = 'Ese visitante ya recibió este servicio hoy.'; return;
  }
  const a = ahoraBogota();
  const v = { id: uid('V'), fecha: a.fecha, hora: a.hora, nombre, documento, empresa_motivo: $('visEmpresa').value.trim(),
              servicio: s.id, autorizado_por: autoriza, entregado_por: App.usuario.usuario, offline: !navigator.onLine, _t: Date.now() };
  const c = cola(); c.visitantes.push(v);
  if (!lsSet(LS.cola, c)) return;
  h.visitantes.push({ id: v.id, documento, nombre, servicio: s.id, hora: a.hora, pendiente: true });
  lsSet(LS.hoy, h);
  cerrarModal('modalVisitante');
  toast(`✓ ${s.nombre} entregado a visitante`, 'ok');
  pintarContadores(); pintarSync();
  sincronizar();
}

document.addEventListener('DOMContentLoaded', iniciar);
