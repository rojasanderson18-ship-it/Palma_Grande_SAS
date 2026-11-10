/* ═══════════════════════════════════════════════════════════
   Casino — Pantalla 2: Pedido de campo (supervisor)
   · El supervisor entra con su usuario y PIN desde su celular.
   · Ve solo los trabajadores activos de su SAS/cuadrilla.
   · La hora de corte (8:00 por defecto) la decide el SERVIDOR; aquí
     solo se muestra la cuenta regresiva con la hora del servidor.
═══════════════════════════════════════════════════════════ */
'use strict';

const LS_SUP = { datos: 'casino_sup_datos', borrador: 'casino_sup_borrador' };

const Sup = {
  datos: null,
  offset: 0,          // ms: hora del servidor − hora de este teléfono
  edit: null,         // pedido que se está ajustando (o null si es nuevo)
  sel: new Set(),
  timer: null,
  ultimaCarga: 0
};

/* ── Hora del servidor (Bogotá, UTC−5 sin horario de verano) ── */
function supAhora() { return ahoraBogota(new Date(Date.now() + Sup.offset)); }
function hora12(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
}
function minutos(hhmm) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }
function despuesDelCorte() { return Sup.datos && supAhora().hhmm >= Sup.datos.hora_corte; }
function servicioPorId(id) { return ((Sup.datos && Sup.datos.servicios) || []).find(s => s.id === id); }
function plural(s) { const n = s.nombre.toLowerCase(); return n.endsWith('s') ? n : n + 's'; }

/* ── Entrada ── */
function entrarSupervisor() {
  Sup.datos = lsGet(LS_SUP.datos, null);
  if (Sup.datos && Sup.datos.servidor && Sup.datos.servidor.fecha !== fechaBogota()) Sup.datos = null;
  if (Sup.datos) calcularOffset(Sup.datos);
  mostrar('pSupervisor');
  verLista();
  cargarSupervisor();
  clearInterval(Sup.timer);
  Sup.timer = setInterval(() => {
    if ($('pSupervisor').hidden) { clearInterval(Sup.timer); return; }
    if (!sesion()) { clearInterval(Sup.timer); toast('La sesión terminó. Ingrese de nuevo.', 'err'); ruta(); return; }
    pintarCorte();
    // Refresca para ver autorizaciones y despachos (solo en la lista).
    if (!$('supLista').hidden && Date.now() - Sup.ultimaCarga > 60000) cargarSupervisor(true);
  }, 15000);
}

function calcularOffset(d) {
  // servidor.fecha + hora están en Bogotá (UTC−5 fijo).
  const srv = Date.parse(`${d.servidor.fecha}T${d.servidor.hora}-05:00`);
  if (!isNaN(srv) && d._recibido) Sup.offset = srv - d._recibido;
}

async function cargarSupervisor(silencioso) {
  const s = sesion(); if (!s) { ruta(); return; }
  if (!silencioso) $('supNota').textContent = 'Actualizando…';
  try {
    const r = await api('datosSupervisor', { token: s.token });
    if (!r.ok) {
      $('supNota').textContent = '';
      if (/Sesión|inactivo/i.test(r.error || '')) { cerrarSesion(); ruta(); return; }
      $('supError').textContent = r.error;
      return;
    }
    r._recibido = Date.now();
    Sup.datos = r;
    calcularOffset(r);
    lsSet(LS_SUP.datos, r);
    Sup.ultimaCarga = Date.now();
    $('supError').textContent = '';
    $('supNota').textContent = '';
  } catch (e) {
    $('supNota').textContent = Sup.datos ? 'Sin señal: se muestran los últimos datos descargados.' : 'Sin señal. Conéctese para ver sus trabajadores.';
  }
  if (!$('supLista').hidden) pintarLista();
  pintarCorte();
}

/* ── Cabecera y cuenta regresiva ── */
function pintarCorte() {
  const d = Sup.datos;
  const el = $('supCorte');
  const u = d ? d.usuario : (sesion() || {}).usuario || {};
  $('supQuien').textContent = `Supervisor · ${u.sas_nombre || (u.sas ? u.sas : 'Palma Grande')}${u.nombre ? ' · ' + u.nombre : ''}`;
  if (!d) { el.hidden = true; return; }
  el.hidden = false;
  const ahora = supAhora().hhmm, corte = d.hora_corte;
  if (ahora < corte) {
    const falta = minutos(corte) - minutos(ahora);
    const txt = falta >= 60 ? `faltan ${Math.floor(falta / 60)} h ${falta % 60} min` : (falta <= 1 ? 'falta menos de 1 min' : `faltan ${falta} min`);
    el.className = 'corte corte-ok';
    el.innerHTML = `${ICO_RELOJ} Cierra a las ${hora12(corte)} · ${txt}`;
  } else {
    el.className = 'corte corte-tarde';
    el.innerHTML = `${ICO_RELOJ} Pasó el corte de las ${hora12(corte)} · los pedidos nuevos son extemporáneos`;
  }
  if (!$('supForm').hidden) pintarJustificacion();
}
const ICO_RELOJ = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

/* ══════════ Lista de pedidos del día ══════════ */
function verLista() {
  $('supLista').hidden = false; $('supForm').hidden = true;
  $('supTitulo').textContent = 'Almuerzos a campo';
  pintarLista();
  pintarCorte();
}

const ESTADO_TXT = {
  ENVIADO:    ['etq-sas', 'Pendiente autorización'],
  AUTORIZADO: ['etq-emp', 'Autorizado'],
  RECHAZADO:  ['etq-err', 'Rechazado'],
  DESPACHADO: ['etq-emp', 'Despachado'],
  ANULADO:    ['etq-gris', 'Cancelado']
};
function horaDe(ts) { return ts ? ts.slice(11, 16) : ''; }

function pintarLista() {
  const d = Sup.datos;
  const cont = $('supPedidos');
  const servs = (d && d.servicios) || [];
  $('supNuevo').disabled = !d || !servs.length || !d.puntos.length || !d.personas.length;
  if (!d) { cont.innerHTML = ''; return; }
  const avisos = [];
  if (d.usuario.sas && !d.usuario.sas_activa) avisos.push('Su SAS contratista está inactiva: no puede pedir raciones.');
  else if (!d.personas.length) avisos.push('No tiene trabajadores activos asignados. Pida al administrador que revise su SAS o cuadrillas.');
  if (!servs.length) avisos.push('No hay servicios habilitados para pedidos a campo.');
  if (!d.puntos.length) avisos.push('No hay puntos de entrega configurados. Pida al administrador que los cree.');
  const ped = d.pedidos.slice().sort((a, b) => b.creado_en.localeCompare(a.creado_en));
  cont.innerHTML = avisos.map(a => `<div class="alerta"><div>${esc(a)}</div></div>`).join('') +
    (ped.length ? '<div class="campo-lbl">Pedidos de hoy</div>' : '<p class="txt">Aún no ha enviado pedidos hoy.</p>') +
    ped.map(p => {
      const s = servicioPorId(p.servicio);
      const [cls, txt] = ESTADO_TXT[p.estado] || ['etq-gris', p.estado];
      let det = '';
      if (p.estado === 'AUTORIZADO') det = `Autorizó ${esc(p.autorizado_por)} · ${horaDe(p.hora_autorizacion)}`;
      if (p.estado === 'RECHAZADO') det = `Rechazó ${esc(p.rechazado_por || '')} ${horaDe(p.hora_rechazo)} · Motivo: ${esc(p.motivo_rechazo || '—')}`;
      if (p.estado === 'DESPACHADO') det = `Despachado ${horaDe(p.hora_despacho)}${p.conductor ? ' · conductor ' + esc(p.conductor) : ''}`;
      if (p.estado === 'ANULADO') det = `Motivo: ${esc(p.motivo_cancelacion || '—')}`;
      const editable = ['ENVIADO', 'AUTORIZADO', 'RECHAZADO'].includes(p.estado);
      return `<div class="tarjeta pedido">
        <div class="ped-cab"><b>${esc(p.punto_entrega)}</b><span class="ped-n">${p.cantidad}</span></div>
        <div class="nota">${esc(s ? s.nombre : p.servicio)} · enviado ${horaDe(p.creado_en)}${p.modificado_en && p.modificado_en !== p.creado_en ? ' · ajustado ' + horaDe(p.modificado_en) : ''}</div>
        <div class="ped-estado"><span class="etq ${cls}">${txt}</span>${p.extemporaneo ? '<span class="etq etq-sas">Extemporáneo</span>' : ''}</div>
        ${det ? `<div class="ficha-dato">${det}</div>` : ''}
        ${editable ? `<div class="fila-btns"><button class="btn btn-sec" data-cancelar="${esc(p.id)}">Cancelar</button><button class="btn btn-sec" data-ajustar="${esc(p.id)}">${p.estado === 'RECHAZADO' ? 'Corregir y reenviar' : 'Ajustar'}</button></div>` : ''}
      </div>`;
    }).join('');
  cont.querySelectorAll('[data-ajustar]').forEach(b => { b.onclick = () => abrirPedido(b.dataset.ajustar); });
  cont.querySelectorAll('[data-cancelar]').forEach(b => { b.onclick = () => cancelarPedido(b.dataset.cancelar); });
}

async function cancelarPedido(id) {
  const s = sesion(); if (!s) { ruta(); return; }
  const motivo = await pedirTexto('Motivo de la cancelación', { placeholder: 'Ej. se suspendió la labor por lluvia', minimo: 5 });
  if (!motivo) return;
  try {
    const r = await api('cancelarPedido', { token: s.token, id, motivo });
    if (!r.ok) { toast(r.error, 'err'); return; }
    toast('Pedido cancelado', 'ok');
    await cargarSupervisor(true);
  } catch { toast('Sin señal: no se pudo cancelar', 'err'); }
}

/* ══════════ Formulario de pedido ══════════ */
function abrirPedido(id) {
  const d = Sup.datos; if (!d) return;
  Sup.edit = id ? d.pedidos.find(p => p.id === id) || null : null;
  const borr = lsGet(LS_SUP.borrador, null);
  const usarBorr = borr && (borr.id || null) === (id || null) && borr.fecha === supAhora().fecha;
  $('supLista').hidden = true; $('supForm').hidden = false;
  $('supTitulo').textContent = Sup.edit ? 'Ajustar pedido' : 'Nuevo pedido';
  window.scrollTo(0, 0);

  $('pedServicio').innerHTML = d.servicios.map(s => `<option value="${esc(s.id)}">${esc(s.nombre)} · ${s.hora_inicio}–${s.hora_fin}</option>`).join('');
  $('pedServCampo').hidden = d.servicios.length < 2;
  $('pedPunto').innerHTML = '<option value="">Seleccione…</option>' +
    d.puntos.map(p => `<option value="${esc(p.id)}">${esc(p.nombre)}${p.finca ? ' · ' + esc(p.finca) : ''}</option>`).join('');

  const nombrePunto = p => p.nombre + (p.finca ? ' · ' + p.finca : '');
  if (usarBorr) {
    $('pedServicio').value = borr.servicio; $('pedPunto').value = borr.punto;
    Sup.sel = new Set(borr.personas); $('pedJust').value = borr.just || '';
  } else if (Sup.edit) {
    $('pedServicio').value = Sup.edit.servicio;
    const pt = d.puntos.find(p => nombrePunto(p) === Sup.edit.punto_entrega);
    $('pedPunto').value = pt ? pt.id : '';
    Sup.sel = new Set(Sup.edit.personas);
    $('pedJust').value = Sup.edit.justificacion || '';
  } else {
    $('pedServicio').value = d.servicios[0].id; $('pedPunto').value = d.puntos.length === 1 ? d.puntos[0].id : '';
    Sup.sel = new Set(); $('pedJust').value = '';
  }
  $('pedBuscar').value = '';
  $('pedBuscar').hidden = d.personas.length < 15;
  $('pedError').textContent = '';
  pintarEstadoPedido();
  pintarChecklist();
  pintarCorte();
}

function ocupadoPor(doc) {
  const d = Sup.datos, servicio = $('pedServicio').value;
  const o = d.ocupados && d.ocupados[servicio] && d.ocupados[servicio][doc];
  if (!o || (Sup.edit && o.pedido === Sup.edit.id)) return null;
  return o;
}

function pintarChecklist() {
  const d = Sup.datos;
  const q = normNombre($('pedBuscar').value);
  const lista = d.personas.filter(p => !q || normNombre(p.nombre).includes(q) || p.documento.includes($('pedBuscar').value.trim()));
  // Quien quedó ocupado en otro pedido sale de la selección.
  [...Sup.sel].forEach(doc => { if (ocupadoPor(doc) || !d.personas.some(p => p.documento === doc)) Sup.sel.delete(doc); });
  $('pedLista').innerHTML = lista.map(p => {
    const o = ocupadoPor(p.documento);
    const marcado = Sup.sel.has(p.documento);
    return `<label class="ck${o ? ' ck-off' : ''}"><input type="checkbox" data-doc="${esc(p.documento)}"${marcado ? ' checked' : ''}${o ? ' disabled' : ''}>
      <span class="ck-txt">${esc(p.nombre)}${p.cuadrilla ? `<small>${esc(p.cuadrilla)}</small>` : ''}</span>
      ${o ? `<span class="ck-nota">en pedido de ${esc(o.supervisor)}</span>` : ''}</label>`;
  }).join('') || '<div class="ck ck-off">Sin resultados</div>';
  $('pedLista').querySelectorAll('input[data-doc]').forEach(i => {
    i.onchange = () => { i.checked ? Sup.sel.add(i.dataset.doc) : Sup.sel.delete(i.dataset.doc); actualizarConteo(); guardarBorrador(); };
  });
  actualizarConteo();
}

function disponibles() { return Sup.datos.personas.filter(p => !ocupadoPor(p.documento)); }

function actualizarConteo() {
  const disp = disponibles();
  $('pedConteo').textContent = `Trabajadores activos (${disp.length}) · marcados ${Sup.sel.size}`;
  $('pedTodos').textContent = Sup.sel.size >= disp.length && disp.length ? 'Desmarcar todos' : 'Marcar todos';
  const s = servicioPorId($('pedServicio').value);
  const n = Sup.sel.size;
  $('pedEnviar').textContent = `${Sup.edit ? 'Guardar cambios' : 'Enviar pedido'} · ${n} ${s ? (n === 1 ? s.nombre.toLowerCase() : plural(s)) : ''}`;
  $('pedEnviar').disabled = !n;
  pintarJustificacion();
}

// ¿Este envío sería extemporáneo? (el servidor tiene la última palabra)
function seraExtemporaneo() {
  if (Sup.edit && Sup.edit.extemporaneo) return true;
  if (!despuesDelCorte()) return false;
  if (!Sup.edit) return true;
  if (Sup.edit.estado === 'RECHAZADO') return true;
  return [...Sup.sel].some(doc => !Sup.edit.personas.includes(doc));
}

function pintarJustificacion() {
  const ext = seraExtemporaneo();
  $('pedJustCampo').hidden = !ext;
  const corte = Sup.datos ? hora12(Sup.datos.hora_corte) : '8:00 a. m.';
  if (Sup.edit && Sup.edit.estado === 'AUTORIZADO') $('pedPie').textContent = 'Si cambia el pedido, vuelve a quedar pendiente de autorización.';
  else if (ext) $('pedPie').textContent = `Pedido extemporáneo (después de las ${corte}): requiere justificación y autorización.`;
  else $('pedPie').textContent = `Después de las ${corte} queda como extemporáneo y requiere justificación.`;
}

function pintarEstadoPedido() {
  const p = Sup.edit, el = $('pedEstado');
  if (!p) { el.hidden = true; return; }
  const [cls, txt] = ESTADO_TXT[p.estado] || ['etq-gris', p.estado];
  el.hidden = false;
  el.innerHTML = `<div class="campo-lbl">Estado del pedido</div>
    <div>Enviado ${horaDe(p.creado_en)} → <span class="etq ${cls}">${txt}</span></div>
    ${p.estado === 'RECHAZADO' ? `<div class="ficha-dato">Motivo: ${esc(p.motivo_rechazo || '—')}</div>` : ''}
    <div class="nota">Autoriza: Superintendencia / supervisor Palma Grande</div>`;
}

function guardarBorrador() {
  lsSet(LS_SUP.borrador, { id: Sup.edit ? Sup.edit.id : null, fecha: supAhora().fecha, servicio: $('pedServicio').value,
    punto: $('pedPunto').value, personas: [...Sup.sel], just: $('pedJust').value });
}

let enviandoPedido = false;
async function enviarPedido() {
  if (enviandoPedido) return;
  const s = sesion(); if (!s) { ruta(); return; }
  const err = $('pedError');
  const pedido = { id: Sup.edit ? Sup.edit.id : '', servicio: $('pedServicio').value, punto: $('pedPunto').value,
                   personas: [...Sup.sel], justificacion: $('pedJust').value.trim() };
  if (!pedido.punto) { err.textContent = 'Seleccione el punto de entrega.'; return; }
  if (!pedido.personas.length) { err.textContent = 'Marque al menos un trabajador.'; return; }
  if (seraExtemporaneo() && pedido.justificacion.length < 10 && !(Sup.edit && Sup.edit.justificacion)) {
    err.textContent = 'Escriba la justificación del pedido extemporáneo (mínimo 10 caracteres).';
    $('pedJust').focus(); return;
  }
  guardarBorrador();
  enviandoPedido = true; $('pedEnviar').disabled = true; err.textContent = '';
  try {
    const r = await api('guardarPedido', { token: s.token, pedido });
    if (!r.ok) {
      err.textContent = r.error;
      if (r.extemporaneo) { $('pedJustCampo').hidden = false; $('pedJust').focus(); }
      if (/otro pedido|ya recibieron/i.test(r.error || '')) cargarSupervisor(true).then(() => { if (!$('supForm').hidden) pintarChecklist(); });
      return;
    }
    lsDel(LS_SUP.borrador);
    toast(r.sinCambios ? 'Sin cambios' : (Sup.edit ? 'Pedido ajustado' : `Pedido enviado · ${r.pedido.cantidad}`), 'ok');
    await cargarSupervisor(true);
    verLista();
  } catch (e) {
    err.textContent = 'Sin señal: el pedido NO se ha enviado. Su selección quedó guardada en el teléfono; intente de nuevo cuando tenga señal.';
  } finally { enviandoPedido = false; $('pedEnviar').disabled = !Sup.sel.size; }
}

/* ── Eventos ── */
document.addEventListener('DOMContentLoaded', () => {
  $('supNuevo').onclick = () => abrirPedido(null);
  $('supRecargar').onclick = () => cargarSupervisor();
  $('pedVolver').onclick = verLista;
  $('pedEnviar').onclick = enviarPedido;
  $('pedBuscar').addEventListener('input', pintarChecklist);
  $('pedServicio').addEventListener('change', () => { pintarChecklist(); guardarBorrador(); });
  $('pedPunto').addEventListener('change', guardarBorrador);
  $('pedJust').addEventListener('input', guardarBorrador);
  $('pedTodos').onclick = () => {
    const disp = disponibles();
    if (Sup.sel.size >= disp.length) Sup.sel.clear(); else disp.forEach(p => Sup.sel.add(p.documento));
    pintarChecklist(); guardarBorrador();
  };
});
