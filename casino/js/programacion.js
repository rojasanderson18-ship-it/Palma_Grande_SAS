/* ═══════════════════════════════════════════════════════════
   Casino — Pantalla 4: Programación del día (tablet del casino)
   · Totales del servicio: en casino (registradas) y a campo (pedidos).
   · Despachos agrupados por punto de entrega y SAS.
   · "Marcar despachado" con conductor: el servidor registra las
     raciones CAMPO del pedido, que son las que se cobran a la SAS.
═══════════════════════════════════════════════════════════ */
'use strict';

const LS_PROG = { datos: 'casino_prog_datos', conductores: 'casino_conductores' };
const Prog = { datos: null, servicio: null, abiertos: new Set(), despachando: null, timer: null, ultima: 0 };

function abrirProgramacion() {
  if (!sesion()) { ruta(); return; }
  Prog.datos = lsGet(LS_PROG.datos, null);
  if (Prog.datos && Prog.datos.servidor.fecha !== fechaBogota()) Prog.datos = null;
  mostrar('pProgramacion');
  pintarProgramacion();
  cargarProgramacion();
  clearInterval(Prog.timer);
  Prog.timer = setInterval(() => {
    if ($('pProgramacion').hidden) { clearInterval(Prog.timer); return; }
    if (Date.now() - Prog.ultima > 45000 && !Prog.despachando) cargarProgramacion(true);
  }, 15000);
}

async function volverDeProgramacion() {
  clearInterval(Prog.timer);
  mostrar('pRegistro');
  try { await Rostros.iniciarCamara($('video')); } catch {}
  limpiarFicha(); pintarCabecera(); pintarContadores(); pintarSync(); pintarAvisos();
}

async function cargarProgramacion(silencioso) {
  const s = sesion(); if (!s) { ruta(); return; }
  if (!silencioso) $('progNota').textContent = 'Actualizando…';
  try {
    const r = await api('programacionDia', { token: s.token });
    if (!r.ok) {
      if (/Sesión|inactivo/i.test(r.error || '')) { cerrarSesion(); ruta(); return; }
      $('progNota').textContent = r.error; return;
    }
    Prog.datos = r; Prog.ultima = Date.now();
    lsSet(LS_PROG.datos, r);
    $('progNota').textContent = `Actualizado ${r.servidor.hora.slice(0, 5)}`;
  } catch {
    $('progNota').textContent = Prog.datos ? 'Sin señal: datos de la última actualización. Para despachar se necesita señal.' : 'Sin señal.';
  }
  pintarProgramacion();
}

function serviciosProg() {
  const d = Prog.datos; if (!d) return [];
  const conPedidos = new Set(d.pedidos.map(p => p.servicio));
  return d.servicios.filter(s => s.permite_campo || conPedidos.has(s.id));
}

function pintarProgramacion() {
  const d = Prog.datos;
  const cfgNombre = ((App.catalogo && App.catalogo.config) || {}).nombre_casino || 'Casino';
  $('progLinea').textContent = d ? `${cfgNombre} · ${fechaCorta(d.servidor.fecha)} · corte de pedidos ${hora12(d.hora_corte)}` : cfgNombre;
  const servs = serviciosProg();
  if (!Prog.servicio || !servs.some(s => s.id === Prog.servicio)) {
    const actual = servicioActual();
    Prog.servicio = (actual && servs.some(s => s.id === actual.id) ? actual.id : (servs[0] || {}).id) || null;
  }
  $('progServicios').hidden = servs.length < 2;
  $('progServicios').innerHTML = servs.map(s => `<button data-s="${esc(s.id)}" class="${s.id === Prog.servicio ? 'on' : ''}">${esc(s.nombre)}</button>`).join('');
  $('progServicios').querySelectorAll('button').forEach(b => { b.onclick = () => { Prog.servicio = b.dataset.s; pintarProgramacion(); }; });
  const s = servs.find(x => x.id === Prog.servicio);
  $('progTitulo').textContent = s ? `Programación de ${plural(s)}` : 'Programación del día';
  if (!d || !s) {
    $('progTotales').innerHTML = ''; $('progPendientes').innerHTML = '';
    $('progLista').innerHTML = `<p class="txt centro">${d ? 'No hay servicios con pedidos a campo.' : 'Cargando…'}</p>`;
    return;
  }

  const peds = d.pedidos.filter(p => p.servicio === s.id);
  const listos = peds.filter(p => p.estado === 'AUTORIZADO' || p.estado === 'DESPACHADO');
  const pend = peds.filter(p => p.estado === 'ENVIADO');
  const aCampo = listos.reduce((t, p) => t + (p.estado === 'DESPACHADO' && p.cantidad_despachada != null ? p.cantidad_despachada : p.cantidad), 0);
  const c = (d.conteo && d.conteo[s.id]) || { CASINO: 0, CAMPO: 0 };
  const enCasino = c.CASINO + ((d.visitantes && d.visitantes[s.id]) || 0);
  const despachados = listos.filter(p => p.estado === 'DESPACHADO').length;
  $('progTotales').innerHTML = `
    <div class="kpi"><div class="kpi-l">Total</div><div class="kpi-n">${enCasino + aCampo}</div></div>
    <div class="kpi"><div class="kpi-l">En casino</div><div class="kpi-n">${enCasino}</div><div class="kpi-s">registradas</div></div>
    <div class="kpi"><div class="kpi-l">A campo</div><div class="kpi-n">${aCampo}</div><div class="kpi-s">${despachados}/${listos.length} despachados</div></div>`;
  $('progPendientes').innerHTML = pend.length
    ? `<div class="alerta"><div><b>${pend.length} pedido(s) sin autorizar</b> (${pend.reduce((t, p) => t + p.cantidad, 0)} raciones): no se pueden despachar hasta que los autoricen.</div></div>` : '';

  // Agrupado por punto de entrega; dentro, un bloque por pedido (SAS).
  const grupos = {};
  listos.concat(pend).forEach(p => { (grupos[p.punto_entrega] = grupos[p.punto_entrega] || []).push(p); });
  const nombres = Object.keys(grupos).sort((a, b) => {
    const pa = grupos[a].some(p => p.estado === 'AUTORIZADO'), pb = grupos[b].some(p => p.estado === 'AUTORIZADO');
    return pa === pb ? a.localeCompare(b) : (pa ? -1 : 1);   // primero lo que falta despachar
  });
  $('progLista').innerHTML = nombres.length ? '<div class="campo-lbl">Despachos a campo</div>' + nombres.map(n => {
    const ps = grupos[n].sort((a, b) => a.sas_nombre.localeCompare(b.sas_nombre));
    const tot = ps.reduce((t, p) => t + (p.estado === 'DESPACHADO' && p.cantidad_despachada != null ? p.cantidad_despachada : p.cantidad), 0);
    return `<div class="tarjeta pedido grupo">
      <div class="ped-cab"><b>${esc(n)}</b><span class="ped-n">${tot}</span></div>
      ${ps.map(bloquePedido).join('')}
    </div>`;
  }).join('') : '<p class="txt centro">No hay pedidos a campo para este servicio.</p>';

  $('progLista').querySelectorAll('[data-ver]').forEach(b => {
    b.onclick = () => { const id = b.dataset.ver; Prog.abiertos.has(id) ? Prog.abiertos.delete(id) : Prog.abiertos.add(id); pintarProgramacion(); };
  });
  $('progLista').querySelectorAll('[data-despachar]').forEach(b => { b.onclick = () => abrirDespacho(b.dataset.despachar); });
}

function bloquePedido(p) {
  const comieron = p.trabajadores.filter(t => t.ya_comio);
  const abierto = Prog.abiertos.has(p.id);
  let estado = '';
  if (p.estado === 'DESPACHADO') {
    const excl = p.cantidad_despachada != null && p.cantidad_despachada < p.cantidad ? ` · ${p.cantidad - p.cantidad_despachada} excluido(s)` : '';
    estado = `<div class="estado estado-ok">${ICO_OK}Despachado ${horaTs(p.hora_despacho)} · conductor ${esc(p.conductor)}${excl}</div>`;
  } else if (p.estado === 'AUTORIZADO') {
    estado = `<button class="btn btn-prim" data-despachar="${esc(p.id)}">Marcar despachado · ${p.cantidad - comieron.length}</button>`;
  } else {
    estado = '<div class="estado estado-aviso">Pendiente de autorización · no se puede despachar</div>';
  }
  return `<div class="bloque">
    <div class="bloque-cab"><span>${esc(p.sas_nombre)} · Supervisor: ${esc(p.supervisor_nombre)}</span><b>${p.cantidad}</b></div>
    ${p.extemporaneo ? `<div class="nota txt-sas">Extemporáneo${p.autorizado_nombre ? ` · autorizó ${esc(p.autorizado_nombre)} ${horaTs(p.hora_autorizacion)}` : ''}</div>`
                     : (p.autorizado_nombre ? `<div class="nota">Autorizó ${esc(p.autorizado_nombre)} ${horaTs(p.hora_autorizacion)}</div>` : '')}
    ${comieron.length && p.estado !== 'DESPACHADO' ? `<div class="nota txt-err">${comieron.length} ya comió en el casino: no se le despacha (${esc(comieron.map(t => t.nombre).join(', '))})</div>` : ''}
    <button class="btn-link" data-ver="${esc(p.id)}">${abierto ? 'Ocultar lista' : 'Ver lista'}</button>
    ${abierto ? `<div class="ped-trab">${p.trabajadores.map(t => `<div${t.ya_comio ? ' class="malo"' : ''}>${esc(t.nombre)}${t.ya_comio ? ` <small>· comió en casino ${t.ya_comio}</small>` : ''}</div>`).join('')}</div>` : ''}
    ${estado}
  </div>`;
}

/* ── Despacho ── */
function abrirDespacho(id) {
  const p = Prog.datos.pedidos.find(x => x.id === id); if (!p) return;
  Prog.despachando = p;
  const comieron = p.trabajadores.filter(t => t.ya_comio).length;
  $('despResumen').innerHTML = `<b>${esc(p.punto_entrega)}</b><br>${esc(p.sas_nombre)} · ${p.cantidad - comieron} raciones` +
    (comieron ? `<br><span class="txt-err">${comieron} ya comió en el casino y no se despacha.</span>` : '');
  const cond = lsGet(LS_PROG.conductores, []);
  $('despConductores').innerHTML = cond.map(c => `<option value="${esc(c)}">`).join('');
  $('despConductor').value = cond[0] || '';
  $('despError').textContent = '';
  abrirModal('modalDespacho');
}

async function confirmarDespacho() {
  const p = Prog.despachando; if (!p) return;
  const s = sesion(); if (!s) { ruta(); return; }
  const conductor = $('despConductor').value.trim();
  if (conductor.length < 3) { $('despError').textContent = 'Escriba el nombre del conductor.'; return; }
  $('despOk').disabled = true;
  try {
    const r = await api('despacharPedido', { token: s.token, id: p.id, version: p.version, conductor,
                                             dispositivo: (lsGet(LS.disp, null) || {}).id || '' });
    if (!r.ok) {
      $('despError').textContent = r.error;
      if (r.cambiado || /ya fue despachado|autorizados/.test(r.error)) { cerrarModal('modalDespacho'); toast(r.error, 'err'); cargarProgramacion(true); }
      return;
    }
    lsSet(LS_PROG.conductores, [conductor, ...lsGet(LS_PROG.conductores, []).filter(c => c !== conductor)].slice(0, 10));
    // Las raciones de campo bloquean de inmediato una segunda ración en el casino.
    const h = hoy();
    const ids = new Set(h.raciones.map(x => x.id));
    (r.raciones || []).forEach(x => { if (!ids.has(x.id)) h.raciones.push(x); });
    lsSet(LS.hoy, h);
    cerrarModal('modalDespacho');
    if (r.excluidos.length) await confirmar(`Despachado a las ${r.hora}: ${r.despachadas} raciones.\n\nExcluidos (no se cobran):\n` +
      r.excluidos.map(e => `· ${e.nombre}: ${textoMotivo(e.motivo)}${e.hora_previa ? ' (' + e.hora_previa + ')' : ''}`).join('\n'), 'Entendido');
    else toast(`Despachado · ${r.despachadas} raciones`, 'ok');
    await cargarProgramacion(true);
  } catch {
    $('despError').textContent = 'Sin señal: el despacho NO se registró. Intente de nuevo cuando haya señal.';
  } finally { $('despOk').disabled = false; Prog.despachando = $('modalDespacho').hidden ? null : Prog.despachando; }
}

document.addEventListener('DOMContentLoaded', () => {
  $('btnProgramacion').onclick = abrirProgramacion;
  $('progVolver').onclick = volverDeProgramacion;
  $('progRecargar').onclick = () => cargarProgramacion();
  $('despOk').onclick = confirmarDespacho;
  $('despCancelar').onclick = () => { cerrarModal('modalDespacho'); Prog.despachando = null; };
});
