/* ═══════════════════════════════════════════════════════════
   Casino — Pantalla 3: Autorización de pedidos de campo
   (Superintendencia / supervisor Palma Grande, rol AUTORIZA)
   · Autoriza o rechaza los pedidos del día de todos los supervisores.
   · Cada decisión lleva la "versión" del pedido que se vio: si el
     supervisor lo ajustó entre tanto, el servidor no la acepta.
═══════════════════════════════════════════════════════════ */
'use strict';

const Aut = { datos: null, filtro: 'PEND', abiertos: new Set(), timer: null, ultima: 0, ocupado: false };

function entrarAutoriza() {
  mostrar('pAutoriza');
  $('autQuien').textContent = `Autoriza · ${(App.usuario && App.usuario.nombre) || ''}`;
  pintarAutoriza();
  cargarAutoriza();
  clearInterval(Aut.timer);
  Aut.timer = setInterval(() => {
    if ($('pAutoriza').hidden) { clearInterval(Aut.timer); return; }
    if (!sesion()) { clearInterval(Aut.timer); toast('La sesión terminó. Ingrese de nuevo.', 'err'); ruta(); return; }
    if (Date.now() - Aut.ultima > 45000 && !Aut.ocupado) cargarAutoriza(true);
  }, 15000);
}

async function cargarAutoriza(silencioso) {
  const s = sesion(); if (!s) { ruta(); return; }
  if (!silencioso) $('autNota').textContent = 'Actualizando…';
  try {
    const r = await api('datosAutorizacion', { token: s.token });
    if (!r.ok) {
      if (/Sesión|inactivo/i.test(r.error || '')) { cerrarSesion(); ruta(); return; }
      $('autNota').textContent = r.error; return;
    }
    Aut.datos = r; Aut.ultima = Date.now();
    $('autNota').textContent = `Actualizado ${r.servidor.hora.slice(0, 5)}`;
  } catch {
    $('autNota').textContent = 'Sin señal: no se pudieron actualizar los pedidos.';
  }
  pintarAutoriza();
}

function horaTs(ts) { return ts ? ts.slice(11, 16) : ''; }

function pintarAutoriza() {
  const d = Aut.datos;
  const peds = d ? d.pedidos : [];
  $('autLinea').textContent = d ? `${fechaCorta(d.servidor.fecha)} · corte ${hora12(d.hora_corte)}` : fechaCorta(fechaBogota());
  const cuenta = {
    PEND: peds.filter(p => p.estado === 'ENVIADO'),
    AUT:  peds.filter(p => p.estado === 'AUTORIZADO' || p.estado === 'DESPACHADO'),
    RECH: peds.filter(p => p.estado === 'RECHAZADO'),
    TODOS: peds
  };
  document.querySelectorAll('#autFiltros button').forEach(b => {
    const n = cuenta[b.dataset.f].length;
    b.textContent = `${b.dataset.nombre} (${n})`;
    b.classList.toggle('on', b.dataset.f === Aut.filtro);
  });
  const sumar = l => l.reduce((t, p) => t + p.cantidad, 0);
  $('autResumen').innerHTML = d ? `<span>Pendientes <b>${sumar(cuenta.PEND)}</b> raciones</span><span>Autorizadas <b class="c-emp">${sumar(cuenta.AUT)}</b></span>` : '';

  const aTiempo = cuenta.PEND.filter(p => !p.extemporaneo && !p.trabajadores.some(t => t.motivo));
  $('autMasivo').hidden = Aut.filtro !== 'PEND' || aTiempo.length < 2;
  $('autMasivo').textContent = `Autorizar los ${aTiempo.length} pedidos a tiempo · ${sumar(aTiempo)} raciones`;

  const lista = cuenta[Aut.filtro];
  const servs = {}; ((d && d.servicios) || []).forEach(s => { servs[s.id] = s.nombre; });
  $('autLista').innerHTML = lista.length ? lista.map(p => tarjetaPedido(p, servs)).join('')
    : `<p class="txt centro">${!d ? 'Cargando pedidos…' : Aut.filtro === 'PEND' ? 'No hay pedidos pendientes.' : 'Sin pedidos.'}</p>`;
  $('autLista').querySelectorAll('[data-ver]').forEach(b => {
    b.onclick = () => { const id = b.dataset.ver; Aut.abiertos.has(id) ? Aut.abiertos.delete(id) : Aut.abiertos.add(id); pintarAutoriza(); };
  });
  $('autLista').querySelectorAll('[data-autorizar]').forEach(b => { b.onclick = () => autorizar([b.dataset.autorizar]); });
  $('autLista').querySelectorAll('[data-rechazar]').forEach(b => { b.onclick = () => rechazar(b.dataset.rechazar); });
}

function tarjetaPedido(p, servs) {
  const [cls, txt] = ESTADO_TXT[p.estado] || ['etq-gris', p.estado];
  const malos = p.trabajadores.filter(t => t.motivo);
  let det = '';
  if (p.estado === 'AUTORIZADO') det = `Autorizó ${esc(p.autorizado_por)} · ${horaTs(p.hora_autorizacion)}`;
  if (p.estado === 'RECHAZADO') det = `Rechazó ${esc(p.rechazado_por || '')} · ${horaTs(p.hora_rechazo)} · Motivo: ${esc(p.motivo_rechazo)}`;
  if (p.estado === 'DESPACHADO') det = `Despachado ${horaTs(p.hora_despacho)}${p.conductor ? ' · conductor ' + esc(p.conductor) : ''}`;
  if (p.estado === 'ANULADO') det = `Cancelado por el supervisor · ${esc(p.motivo_cancelacion)}`;
  const abierto = Aut.abiertos.has(p.id);
  return `<div class="tarjeta pedido${p.extemporaneo && p.estado === 'ENVIADO' ? ' pedido-ext' : ''}">
    <div class="ped-cab"><b>${esc(p.punto_entrega)}</b><span class="ped-n">${p.cantidad}</span></div>
    <div class="ficha-dato">${esc(p.sas_nombre)} · Supervisor: <b>${esc(p.supervisor_nombre)}</b></div>
    <div class="nota">${esc(servs[p.servicio] || p.servicio)} · enviado ${horaTs(p.creado_en)}${p.modificado_en && p.modificado_en !== p.creado_en ? ' · ajustado ' + horaTs(p.modificado_en) : ''}${p.cuadrilla ? ' · ' + esc(p.cuadrilla) : ''}</div>
    <div class="ped-estado"><span class="etq ${cls}">${txt}</span>${p.extemporaneo ? '<span class="etq etq-sas">Extemporáneo</span>' : ''}</div>
    ${p.extemporaneo ? `<div class="justif"><b>Justificación:</b> ${esc(p.justificacion || '—')}</div>` : ''}
    ${malos.length && p.estado === 'ENVIADO' ? `<div class="estado estado-err">${malos.length} trabajador(es) ya no pueden recibir: ${esc(malos.map(t => t.nombre).join(', '))}</div>` : ''}
    ${det ? `<div class="ficha-dato">${det}</div>` : ''}
    <button class="btn-link" data-ver="${esc(p.id)}">${abierto ? 'Ocultar lista' : `Ver lista (${p.cantidad})`}</button>
    ${abierto ? `<div class="ped-trab">${p.trabajadores.map(t => `<div${t.motivo ? ' class="malo"' : ''}>${esc(t.nombre)}${t.cuadrilla ? ` <small>${esc(t.cuadrilla)}</small>` : ''}${t.motivo ? ` <small>· ${esc(textoMotivo(t.motivo))}</small>` : ''}</div>`).join('')}</div>` : ''}
    ${p.estado === 'ENVIADO' ? `<div class="fila-btns"><button class="btn btn-sec" data-rechazar="${esc(p.id)}">Rechazar</button><button class="btn btn-prim" data-autorizar="${esc(p.id)}"${malos.length ? ' disabled' : ''}>Autorizar</button></div>` : ''}
    ${p.estado === 'AUTORIZADO' ? `<div class="fila-btns"><button class="btn btn-sec" data-rechazar="${esc(p.id)}">Revocar autorización</button></div>` : ''}
  </div>`;
}

async function autorizar(ids) {
  const s = sesion(); if (!s) { ruta(); return; }
  const peds = ids.map(id => Aut.datos.pedidos.find(p => p.id === id)).filter(Boolean);
  if (peds.length === 1 && peds[0].extemporaneo &&
      !await confirmar(`Pedido extemporáneo de ${peds[0].supervisor_nombre} (${peds[0].cantidad} raciones).\n\nJustificación: ${peds[0].justificacion}\n\n¿Autorizarlo?`, 'Autorizar')) return;
  Aut.ocupado = true;
  try {
    const r = await api('autorizarPedidos', { token: s.token, pedidos: peds.map(p => ({ id: p.id, version: p.version })) });
    if (!r.ok) { toast(r.error, 'err'); return; }
    const fallos = r.resultados.filter(x => !x.ok);
    if (fallos.length) {
      const txt = fallos.map(f => { const p = peds.find(x => x.id === f.id); return `· ${p ? p.punto_entrega + ' (' + p.supervisor_nombre + ')' : f.id}: ${f.error}`; }).join('\n');
      await confirmar(`${r.autorizados ? r.autorizados + ' autorizado(s). ' : ''}No se autorizaron:\n${txt}`, 'Entendido');
    } else toast(r.autorizados === 1 ? 'Pedido autorizado' : `${r.autorizados} pedidos autorizados`, 'ok');
  } catch { toast('Sin señal: no se pudo autorizar', 'err'); }
  finally { Aut.ocupado = false; }
  await cargarAutoriza(true);
}

async function rechazar(id) {
  const s = sesion(); if (!s) { ruta(); return; }
  const p = Aut.datos.pedidos.find(x => x.id === id); if (!p) return;
  const revocar = p.estado === 'AUTORIZADO';
  const motivo = await pedirTexto(revocar ? 'Motivo para revocar la autorización' : 'Motivo del rechazo',
    { placeholder: 'El supervisor verá este motivo', minimo: 5 });
  if (!motivo) return;
  Aut.ocupado = true;
  try {
    const r = await api('rechazarPedido', { token: s.token, id, version: p.version, motivo });
    if (!r.ok) toast(r.error, 'err');
    else toast(revocar ? 'Autorización revocada' : 'Pedido rechazado', 'ok');
  } catch { toast('Sin señal: no se pudo rechazar', 'err'); }
  finally { Aut.ocupado = false; }
  await cargarAutoriza(true);
}

document.addEventListener('DOMContentLoaded', () => {
  $('autFiltros').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    Aut.filtro = b.dataset.f; pintarAutoriza();
  });
  $('autRecargar').onclick = () => cargarAutoriza();
  $('autMasivo').onclick = async () => {
    const ids = Aut.datos.pedidos.filter(p => p.estado === 'ENVIADO' && !p.extemporaneo && !p.trabajadores.some(t => t.motivo)).map(p => p.id);
    if (!ids.length) return;
    if (!await confirmar(`¿Autorizar ${ids.length} pedidos enviados antes del corte? Los extemporáneos se revisan uno por uno.`, 'Autorizar')) return;
    autorizar(ids);
  };
});
