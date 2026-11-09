/* ═══════════════════════════════════════════════════════════
   Casino — administración desde la tablet (rol ADMIN)
   Personas del casino, SAS, rostros (enrolar / importar / respaldar),
   anulación de registros del día y datos de la tablet.
═══════════════════════════════════════════════════════════ */
'use strict';

const Admin = { tab: 'personas', filtroPer: '', filtroRos: '', editDoc: null, editSas: null, tipo: '' };

function tokenAdmin() {
  const s = sesion();
  if (!s || s.usuario.rol !== 'ADMIN') { toast('Requiere sesión de ADMIN', 'err'); return null; }
  return s.token;
}
async function apiAdmin(accion, datos) {
  const token = tokenAdmin(); if (!token) return null;
  if (!navigator.onLine) { toast('Sin señal: esta acción necesita conexión', 'err'); return null; }
  try {
    const r = await api(accion, Object.assign({ token, dispositivo: (lsGet(LS.disp, null) || {}).id || '' }, datos));
    if (!r.ok) { toast(r.error || 'No se pudo completar', 'err'); return r; }
    return r;
  } catch (e) { toast('No se pudo contactar el servidor', 'err'); return null; }
}
function listaPersonas() { return (App.catalogo && App.catalogo.personas) || []; }

function abrirAdmin() {
  if (!tokenAdmin()) return;
  mostrar('pAdmin');
  pintarTab();
}

function pintarTab() {
  document.querySelectorAll('#adminTabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === Admin.tab));
  document.querySelectorAll('#pAdmin .tab').forEach(p => { p.hidden = p.dataset.panel !== Admin.tab; });
  ({ personas: pintarPersonas, rostros: pintarRostros, sas: pintarSAS, hoy: pintarHoy, tablet: pintarTablet })[Admin.tab]();
}

function etiquetaPersona(p) {
  if (p.motivo === 'INACTIVO') return '<span class="etq etq-gris">INACTIVA</span>';
  if (p.tipo_pago === 'SAS') return `<span class="etq etq-sas">SAS</span>`;
  if (p.tipo_pago === 'EMPRESA') return '<span class="etq etq-emp">EMPRESA</span>';
  return '<span class="etq etq-gris">SIN CLASIFICAR</span>';
}
function coincide(p, q) {
  if (!q) return true;
  const n = normNombre(q);
  return normNombre(p.nombre).includes(n) || p.documento.includes(q.replace(/\D/g, '') || '¬');
}

/* ══════════ Personas ══════════ */
function pintarPersonas() {
  const q = $('perBuscar').value.trim();
  const f = Admin.filtroPer;
  const lista = listaPersonas().filter(p => coincide(p, q)).filter(p => {
    if (f === 'SIN') return p.motivo === 'SIN_CLASIFICAR';
    if (f === 'INA') return p.motivo === 'INACTIVO';
    if (f) return p.tipo_pago === f && p.motivo !== 'INACTIVO';
    return true;
  }).sort((a, b) => a.nombre.localeCompare(b.nombre)).slice(0, 200);
  $('perLista').innerHTML = lista.map(p => {
    const sas = p.tipo_pago === 'SAS' ? (App.sas[p.sas] || {}).nombre || p.sas : p.centro_costo;
    return `<div class="item"><div class="item-txt"><b>${esc(p.nombre)}</b>
      <span>C.C. ${esc(p.documento)}${sas ? ' · ' + esc(sas) : ''}${p.cuadrilla ? ' · ' + esc(p.cuadrilla) : ''}${p.origen === 'ASISTENCIA' ? ' · Asistencia' : ''}</span></div>
      ${etiquetaPersona(p)}<button class="btn" data-doc="${esc(p.documento)}">Editar</button></div>`;
  }).join('');
  $('perLista').querySelectorAll('[data-doc]').forEach(b => { b.onclick = () => abrirPersona(b.dataset.doc); });
}

function abrirPersona(doc) {
  const p = doc ? App.personas[doc] : null;
  Admin.editDoc = doc || null;
  $('perTitulo').textContent = p ? 'Editar persona' : 'Nueva persona';
  $('perDoc').value = p ? p.documento : '';
  $('perDoc').disabled = !!p;
  $('perNombre').value = p ? p.nombre : '';
  $('perCargo').value = p ? p.cargo : '';
  const deAsis = p && p.origen === 'ASISTENCIA';
  $('perNombre').disabled = deAsis; $('perCargo').disabled = deAsis;
  $('perOrigen').textContent = deAsis ? 'Nombre y cargo vienen de Asistencia (solo lectura).' : '';
  $('perSas').innerHTML = '<option value="">Seleccione…</option>' +
    ((App.catalogo && App.catalogo.sas) || []).map(s => `<option value="${esc(s.id)}">${esc(s.nombre)}${s.activo ? '' : ' (inactiva)'}</option>`).join('');
  $('perSas').value = p ? p.sas : '';
  $('perCc').value = p ? p.centro_costo : '';
  $('perCuadrilla').value = p ? p.cuadrilla : '';
  $('perActivo').checked = !p || p.motivo !== 'INACTIVO';
  ponerTipo(p ? p.tipo_pago : '');
  $('perError').textContent = '';
  abrirModal('modalPersona');
}
function ponerTipo(t) {
  Admin.tipo = t;
  document.querySelectorAll('#perTipo button').forEach(b => b.classList.toggle('on', b.dataset.v === t));
  $('perSasCampo').hidden = t !== 'SAS';
  $('perCcCampo').hidden = t !== 'EMPRESA';
}
async function guardarPersona() {
  const persona = {
    documento: $('perDoc').value.replace(/\D/g, ''), nombre: $('perNombre').value.trim(), cargo: $('perCargo').value.trim(),
    tipo_pago: Admin.tipo, sas: $('perSas').value, centro_costo: $('perCc').value.trim(),
    cuadrilla: $('perCuadrilla').value.trim(), activo: $('perActivo').checked ? 'SI' : 'NO'
  };
  const err = $('perError');
  if (persona.documento.length < 5) { err.textContent = 'Cédula inválida.'; return; }
  if (!Admin.editDoc && App.personas[persona.documento]) { err.textContent = 'Esa cédula ya existe; búsquela y edítela.'; return; }
  if (!persona.nombre) { err.textContent = 'Escriba el nombre.'; return; }
  if (!persona.tipo_pago) { err.textContent = 'Seleccione EMPRESA o SAS.'; return; }
  if (persona.tipo_pago === 'SAS' && !persona.sas) { err.textContent = 'Seleccione la SAS.'; return; }
  if (persona.tipo_pago === 'EMPRESA' && !persona.centro_costo) { err.textContent = 'Escriba el centro de costo.'; return; }
  $('perGuardar').disabled = true;
  const r = await apiAdmin('guardarPersona', { persona });
  $('perGuardar').disabled = false;
  if (!r || !r.ok) { if (r) err.textContent = r.error; return; }
  cerrarModal('modalPersona');
  toast('Persona guardada', 'ok');
  await cargarCatalogo(true);
  pintarTab();
  if (!Admin.editDoc && !Rostros.tiene(persona.documento) &&
      await confirmar(`¿Enrolar ahora el rostro de ${persona.nombre}?`, 'Enrolar')) abrirEnrolar(persona.documento);
}

/* ══════════ Rostros ══════════ */
function pintarRostros() {
  const activas = listaPersonas().filter(p => p.motivo !== 'INACTIVO');
  const con = activas.filter(p => Rostros.tiene(p.documento)).length;
  $('rosResumen').innerHTML = `<b>${Rostros.total()}</b> rostros en esta tablet · ${con} de ${activas.length} personas activas tienen rostro.
    Los rostros se guardan <b>solo en esta tablet</b>: respalde después de enrolar.`;
  const nLocal = Rostros.hayAsistenciaLocal();
  $('rosLocal').hidden = !nLocal;
  if (nLocal) $('rosLocal').textContent = `Leer ${nLocal} rostros de Asistencia de este navegador`;
  const q = $('rosBuscar').value.trim(), f = Admin.filtroRos;
  const lista = activas.filter(p => coincide(p, q)).filter(p => {
    if (f === 'SIN') return !Rostros.tiene(p.documento);
    if (f === 'CON') return Rostros.tiene(p.documento);
    return true;
  }).sort((a, b) => a.nombre.localeCompare(b.nombre)).slice(0, 200);
  $('rosLista').innerHTML = lista.map(p => {
    const t = Rostros.tiene(p.documento);
    return `<div class="item"><div class="item-txt"><b>${esc(p.nombre)}</b><span>C.C. ${esc(p.documento)} · ${t ? 'con rostro' : 'sin rostro'}</span></div>
      ${t ? `<button class="btn" data-borrar="${esc(p.documento)}">Borrar</button>` : ''}
      <button class="btn" data-enrolar="${esc(p.documento)}">${t ? 'Re-enrolar' : 'Enrolar'}</button></div>`;
  }).join('');
  $('rosLista').querySelectorAll('[data-enrolar]').forEach(b => { b.onclick = () => abrirEnrolar(b.dataset.enrolar); });
  $('rosLista').querySelectorAll('[data-borrar]').forEach(b => {
    b.onclick = async () => {
      const p = App.personas[b.dataset.borrar];
      if (!await confirmar(`¿Borrar el rostro de ${p ? p.nombre : b.dataset.borrar} de esta tablet?`, 'Borrar')) return;
      await Rostros.borrar(b.dataset.borrar);
      pintarRostros();
    };
  });
}

let enrolando = false, enrolCancel = false, enrolDoc = null;
async function abrirEnrolar(doc) {
  const p = App.personas[doc];
  enrolDoc = doc;
  $('enrTitulo').textContent = `Enrolar · ${p ? p.nombre : doc}`;
  $('enrPaso').textContent = 'Ubique a la persona frente a la cámara.';
  $('enrNota').textContent = '';
  $('enrBarra').style.width = '0';
  $('enrIniciar').disabled = false;
  abrirModal('modalEnrolar');
  try {
    await Rostros.cargarModelos();
    await Rostros.iniciarCamara($('videoEnrolar'));
  } catch (e) {
    $('enrNota').textContent = 'No se pudo iniciar la cámara: ' + (e.message || e);
    $('enrIniciar').disabled = true;
  }
}
async function iniciarEnrolamiento() {
  if (enrolando) return;
  enrolando = true; enrolCancel = false;
  $('enrIniciar').disabled = true;
  const r = await Rostros.enrolar(enrolDoc, {
    cancelado: () => enrolCancel,
    onPaso: (i, txt, nota) => {
      $('enrPaso').textContent = `${i + 1}/5 · ${txt}`;
      $('enrNota').textContent = nota;
      $('enrBarra').style.width = (i / 5 * 100) + '%';
    }
  });
  enrolando = false;
  if (!r.ok) {
    if (r.motivo !== 'cancelado') { $('enrNota').textContent = r.motivo + ' Intente de nuevo.'; $('enrIniciar').disabled = false; }
    return;
  }
  $('enrBarra').style.width = '100%';
  if (r.parecido) {
    const otro = App.personas[r.parecido];
    if (!await confirmar(`Este rostro se parece mucho al de ${otro ? otro.nombre : 'C.C. ' + r.parecido}. ¿Seguro que es otra persona y desea guardarlo?`, 'Guardar igual')) {
      $('enrIniciar').disabled = false; return;
    }
  }
  await Rostros.guardar(enrolDoc, r.descriptores, 'CASINO');
  cerrarEnrolar();
  toast('Rostro enrolado', 'ok');
  pintarRostros();
}
function cerrarEnrolar() {
  enrolCancel = true;
  cerrarModal('modalEnrolar');
}

function descargarJSON(obj, nombre) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(obj)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = nombre; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function resumenImport(r) {
  let t = `Rostros importados: ${r.importados}.`;
  if (r.sinPersona.length) t += `\n\nSin persona en el casino (${r.sinPersona.length}): ${r.sinPersona.slice(0, 15).join(', ')}${r.sinPersona.length > 15 ? '…' : ''}`;
  if (r.ambiguos.length) t += `\n\nNombre repetido, no se importaron (${r.ambiguos.length}): ${r.ambiguos.join(', ')}`;
  return t;
}

/* ══════════ SAS ══════════ */
function pintarSAS() {
  const lista = (App.catalogo && App.catalogo.sas) || [];
  $('sasLista').innerHTML = lista.map(s => {
    const n = listaPersonas().filter(p => p.tipo_pago === 'SAS' && p.sas === s.id && p.motivo !== 'INACTIVO').length;
    return `<div class="item"><div class="item-txt"><b>${esc(s.nombre)}</b><span>NIT ${esc(s.nit || '—')} · ${n} trabajadores activos</span></div>
      <span class="etq ${s.activo ? 'etq-emp' : 'etq-gris'}">${s.activo ? 'ACTIVA' : 'INACTIVA'}</span>
      <button class="btn" data-sas="${esc(s.id)}">Editar</button></div>`;
  }).join('');
  $('sasLista').querySelectorAll('[data-sas]').forEach(b => { b.onclick = () => abrirSAS(b.dataset.sas); });
}
function abrirSAS(id) {
  const s = id ? App.sas[id] : null;
  Admin.editSas = id || null;
  $('sasTitulo').textContent = s ? 'Editar SAS' : 'Nueva SAS';
  $('sasNombre').value = s ? s.nombre : '';
  $('sasNit').value = s ? s.nit : '';
  $('sasActivo').checked = !s || s.activo;
  $('sasError').textContent = '';
  abrirModal('modalSAS');
}
async function guardarSAS() {
  const sas = { id: Admin.editSas || '', nombre: $('sasNombre').value.trim(), nit: $('sasNit').value.trim(),
                activo: $('sasActivo').checked ? 'SI' : 'NO' };
  if (!sas.nombre) { $('sasError').textContent = 'Escriba el nombre.'; return; }
  if (Admin.editSas && sas.activo === 'NO' && App.sas[Admin.editSas].activo &&
      !await confirmar('Al inactivar la SAS, sus trabajadores no podrán recibir raciones. ¿Continuar?', 'Inactivar')) return;
  $('sasGuardar').disabled = true;
  const r = await apiAdmin('guardarSAS', { sas });
  $('sasGuardar').disabled = false;
  if (!r || !r.ok) { if (r) $('sasError').textContent = r.error; return; }
  cerrarModal('modalSAS');
  toast('SAS guardada', 'ok');
  await cargarCatalogo(true);
  pintarTab();
}

/* ══════════ Hoy: anulaciones ══════════ */
function pintarHoy() {
  const h = hoy();
  const servs = {}; ((App.catalogo && App.catalogo.servicios) || []).forEach(s => { servs[s.id] = s.nombre; });
  const filas = [
    ...h.raciones.map(r => ({ hoja: 'Raciones', id: r.id, hora: r.hora, servicio: r.servicio, pendiente: r.pendiente,
      nombre: (App.personas[r.documento] || {}).nombre || 'C.C. ' + r.documento,
      det: (r.modo === 'CAMPO' ? 'Campo' : 'Casino') + ' · ' + (r.tipo_pago || '') })),
    ...h.visitantes.map(v => ({ hoja: 'Visitantes', id: v.id, hora: v.hora, servicio: v.servicio, pendiente: v.pendiente,
      nombre: v.nombre || 'Visitante', det: 'Visitante' }))
  ].sort((a, b) => b.hora.localeCompare(a.hora));
  $('hoyLista').innerHTML = filas.map(f => `<div class="item"><div class="item-txt"><b>${esc(f.nombre)}</b>
      <span>${esc(f.hora.slice(0, 5))} · ${esc(servs[f.servicio] || f.servicio)} · ${esc(f.det)}${f.pendiente ? ' · pendiente de enviar' : ''}</span></div>
      ${f.pendiente ? '' : `<button class="btn" data-anular="${esc(f.id)}" data-hoja="${f.hoja}">Anular</button>`}</div>`).join('');
  $('hoyLista').querySelectorAll('[data-anular]').forEach(b => {
    b.onclick = async () => {
      const motivo = await pedirTexto('Motivo de la anulación', { placeholder: 'Ej. registrada por error', minimo: 5 });
      if (!motivo) return;
      const r = await apiAdmin('anularRegistro', { hoja: b.dataset.hoja, id: b.dataset.anular, motivo });
      if (!r || !r.ok) return;
      toast('Registro anulado', 'ok');
      await cargarCatalogo(true);
      pintarHoy();
    };
  });
}

/* ══════════ Tablet ══════════ */
function pintarTablet() {
  const d = lsGet(LS.disp, null) || {};
  const c = cola();
  const cat = App.catalogo;
  const act = cat && cat.actualizado ? new Date(cat.actualizado) : null;
  $('tabInfo').innerHTML = `
    <div><b>${esc(d.nombre || 'Sin autorizar')}</b> · <span class="nota">${esc(d.id || '')}</span></div>
    <div>Pendientes de enviar: <b>${c.raciones.length}</b> raciones · <b>${c.visitantes.length}</b> visitantes · <b>${c.intentos.length}</b> intentos</div>
    <div>Datos del casino: ${act ? 'actualizados ' + esc(fechaCorta(ahoraBogota(act).fecha)) + ' ' + esc(ahoraBogota(act).hhmm) : 'sin descargar'}</div>
    <div>Rostros en esta tablet: <b>${Rostros.total()}</b></div>
    <div class="nota">Backend: ${esc(gasUrl().replace(/^https:\/\/script\.google\.com\/macros\/s\//, '…/').slice(0, 40))}…</div>`;
}

/* ══════════ Eventos ══════════ */
document.addEventListener('DOMContentLoaded', () => {
  $('btnAdmin').onclick = abrirAdmin;
  $('adminVolver').onclick = async () => {
    mostrar('pRegistro');
    try { await Rostros.iniciarCamara($('video')); } catch {}
    limpiarFicha(); pintarCabecera(); pintarContadores(); pintarSync(); pintarAvisos();
  };
  $('adminTabs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    Admin.tab = b.dataset.tab; pintarTab();
  });
  $('perBuscar').addEventListener('input', pintarPersonas);
  $('perFiltros').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    Admin.filtroPer = b.dataset.f;
    $('perFiltros').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    pintarPersonas();
  });
  $('perNueva').onclick = () => abrirPersona(null);
  $('perTipo').addEventListener('click', e => { const b = e.target.closest('button'); if (b) ponerTipo(b.dataset.v); });
  $('perGuardar').onclick = guardarPersona;
  $('perDoc').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); });
  $('perSync').onclick = async () => {
    $('perSync').disabled = true;
    const r = await apiAdmin('sincronizarPersonal', {});
    $('perSync').disabled = false;
    if (!r || !r.ok) return;
    toast(`Asistencia: ${r.nuevos} nuevas · ${r.actualizados} actualizadas`, 'ok');
    await cargarCatalogo(true);
    pintarPersonas();
  };

  $('rosBuscar').addEventListener('input', pintarRostros);
  $('rosFiltros').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    Admin.filtroRos = b.dataset.f;
    $('rosFiltros').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    pintarRostros();
  });
  $('enrIniciar').onclick = iniciarEnrolamiento;
  $('enrCancelar').onclick = cerrarEnrolar;
  $('rosImportar').onclick = () => $('rosArchivo').click();
  $('rosArchivo').addEventListener('change', async e => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    let payload;
    try { payload = JSON.parse(await file.text()); } catch { toast('Ese archivo no es un respaldo válido', 'err'); return; }
    const pass = await pedirTexto('Contraseña del respaldo', { tipo: 'password', minimo: 1 });
    if (!pass) return;
    try {
      const r = await Rostros.importarArchivo(payload, pass, listaPersonas());
      await confirmar(resumenImport(r), 'Listo');
      pintarRostros();
    } catch { toast('Contraseña incorrecta o archivo dañado', 'err'); }
  });
  $('rosLocal').onclick = async () => {
    const r = await Rostros.importarAsistenciaLocal(listaPersonas());
    await confirmar(resumenImport(r), 'Listo');
    pintarRostros();
  };
  $('rosExportar').onclick = async () => {
    if (!Rostros.total()) { toast('No hay rostros para respaldar', 'err'); return; }
    const p1 = await pedirTexto('Cree una contraseña para el respaldo (mín. 6). Sin ella no se podrá restaurar.', { tipo: 'password', minimo: 6 });
    if (!p1) return;
    const p2 = await pedirTexto('Repita la contraseña', { tipo: 'password', minimo: 6 });
    if (p2 !== p1) { toast('Las contraseñas no coinciden', 'err'); return; }
    const r = await Rostros.exportarCasino(p1);
    descargarJSON(r.payload, `respaldo_rostros_casino_${fechaBogota()}.json`);
    toast(`Respaldo de ${r.n} rostros descargado`, 'ok');
  };

  $('sasNueva').onclick = () => abrirSAS(null);
  $('sasGuardar').onclick = guardarSAS;

  $('tabSync').onclick = async () => { await sincronizar(); pintarTablet(); toast(totalCola() ? 'Quedan pendientes (¿hay señal?)' : 'Todo enviado', totalCola() ? 'err' : 'ok'); };
  $('tabCatalogo').onclick = async () => { if (await cargarCatalogo()) toast('Datos actualizados', 'ok'); pintarTablet(); };
  $('tabUrl').onclick = () => { salirRegistro(); $('setupUrl').value = gasUrl(); mostrar('pSetup'); };
  $('tabReautorizar').onclick = async () => {
    if (!await confirmar('Se pedirá autorizar esta tablet de nuevo (por ejemplo, si fue revocada). Lo pendiente no se pierde. ¿Continuar?', 'Continuar')) return;
    salirRegistro();
    lsDel(LS.disp);
    ruta();
  };
});
