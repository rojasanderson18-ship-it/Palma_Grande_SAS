/* ═══════════════════════════════════════════════════════════
   Casino — Pantalla 5: Cierre por SAS contratista (ADMIN)
   · Raciones por trabajador y servicio del periodo, valor, novedades.
   · Flujo: Borrador → Enviado → Aceptado por SAS → Descontado.
   · Exporta PDF (impresión del navegador) y Excel (SheetJS, igual que el hub).
═══════════════════════════════════════════════════════════ */
'use strict';

const Cierre = { datos: null, sas: '', desde: '', hasta: '', volverA: 'pAdmin', verDetalle: false, cargando: false };
const SERV_ORDEN = ['DES', 'ALM', 'CEN', 'REF'];
const ESTADOS_CORTE = [['BORRADOR', 'Borrador'], ['ENVIADO', 'Enviado'], ['ACEPTADO', 'Aceptado por SAS'], ['DESCONTADO', 'Descontado']];

/* ── Quincenas en fechas de Bogotá (texto yyyy-MM-dd, sin pasar por UTC) ── */
function ultimoDia(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
function quincenas(n) {
  let [y, m, d] = fechaBogota().split('-').map(Number);
  let mitad = d <= 15 ? 1 : 2;
  const out = [];
  for (let i = 0; i < n; i++) {
    const mm = String(m).padStart(2, '0');
    out.push(mitad === 1 ? { desde: `${y}-${mm}-01`, hasta: `${y}-${mm}-15` }
                         : { desde: `${y}-${mm}-16`, hasta: `${y}-${mm}-${ultimoDia(y, m)}` });
    if (mitad === 2) mitad = 1; else { mitad = 2; m--; if (!m) { m = 12; y--; } }
  }
  return out;
}
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function rangoTexto(desde, hasta) {
  const [y1, m1, d1] = desde.split('-').map(Number), [y2, m2, d2] = hasta.split('-').map(Number);
  if (y1 === y2 && m1 === m2) return `${d1} – ${d2} ${MESES[m2 - 1]} ${y2}`;
  return `${d1} ${MESES[m1 - 1]}${y1 !== y2 ? ' ' + y1 : ''} – ${d2} ${MESES[m2 - 1]} ${y2}`;
}

/* ── Entrada ── */
async function abrirCierre(desde) {
  const token = tokenAdmin(); if (!token) return;
  Cierre.volverA = desde || 'pAdmin';
  mostrar('pCierre');
  let sasL = (App.catalogo && App.catalogo.sas) || [];
  if (!sasL.length) {
    try { const r = await api('cierreSAS', { token }); if (r.ok) sasL = r.sasLista || []; } catch {}
  }
  $('ciSas').innerHTML = sasL.length ? sasL.map(s => `<option value="${esc(s.id)}">${esc(s.nombre)}${s.activo ? '' : ' (inactiva)'}</option>`).join('')
                                     : '<option value="">— sin SAS —</option>';
  if (!Cierre.sas || !sasL.some(s => s.id === Cierre.sas)) Cierre.sas = (sasL[0] || {}).id || '';
  $('ciSas').value = Cierre.sas;
  const qs = quincenas(8);
  $('ciPeriodo').innerHTML = qs.map((q, i) => `<option value="${q.desde}|${q.hasta}">${rangoTexto(q.desde, q.hasta)}${i === 0 ? ' (en curso)' : ''}</option>`).join('') +
    '<option value="otro">Otro rango…</option>';
  if (!Cierre.desde) { Cierre.desde = qs[1].desde; Cierre.hasta = qs[1].hasta; }   // la última quincena terminada
  ponerPeriodoUI();
  if (!sasL.length) { $('ciCuerpo').innerHTML = '<p class="txt">Cree primero las SAS en Administración → SAS.</p>'; return; }
  cargarCierre();
}

function ponerPeriodoUI() {
  const v = `${Cierre.desde}|${Cierre.hasta}`;
  const hay = [...$('ciPeriodo').options].some(o => o.value === v);
  $('ciPeriodo').value = hay ? v : 'otro';
  $('ciRango').hidden = hay;
  $('ciDesde').value = Cierre.desde; $('ciHasta').value = Cierre.hasta;
}

async function cargarCierre() {
  const token = tokenAdmin(); if (!token || !Cierre.sas) return;
  if (!navigator.onLine) { $('ciNota').textContent = 'El cierre necesita conexión.'; return; }
  Cierre.cargando = true;
  $('ciNota').textContent = 'Calculando…';
  try {
    const r = await api('cierreSAS', { token, sas: Cierre.sas, desde: Cierre.desde, hasta: Cierre.hasta }, 60000);
    if (!r.ok) { $('ciNota').textContent = r.error; if (/Sesión/.test(r.error || '')) { cerrarSesion(); ruta(); } return; }
    Cierre.datos = r;
    $('ciNota').textContent = '';
    pintarCierre();
  } catch (e) {
    $('ciNota').textContent = 'No se pudo calcular: ' + e.message;
  } finally { Cierre.cargando = false; }
}

/* ── Pantalla ── */
function nombreServ(id) { const s = (Cierre.datos.calculo.servicios || []).find(x => x.id === id); return s ? s.nombre : id; }
function serviciosUsados(c) {
  const usados = new Set(Object.keys(c.por_servicio));
  c.ajustes.forEach(a => usados.add(a.servicio));
  return SERV_ORDEN.filter(s => usados.has(s)).concat([...usados].filter(s => !SERV_ORDEN.includes(s)));
}
function abrev(id) { return { DES: 'Des', ALM: 'Alm', CEN: 'Cen', REF: 'Ref' }[id] || id; }

function pintarCierre() {
  const d = Cierre.datos, c = d.calculo, k = d.corte;
  const estado = k ? k.estado : null;
  $('ciTitulo').textContent = d.sas.nombre;
  $('ciSub').textContent = `Cierre · ${rangoTexto(d.desde, d.hasta)}`;
  $('ciInfo').textContent = `NIT ${d.sas.nit || '—'} · ${d.activos} trabajadores activos${d.sas.activo ? '' : ' · SAS inactiva'}`;
  const servs = serviciosUsados(c);
  const congelado = k && k.enviado_en;

  const flujo = ESTADOS_CORTE.map(([id, txt]) => {
    const idx = ESTADOS_CORTE.findIndex(e => e[0] === estado);
    const i = ESTADOS_CORTE.findIndex(e => e[0] === id);
    return `<span class="paso${id === estado ? ' on' : (estado && i < idx ? ' hecho' : '')}">${txt}</span>`;
  }).join('<span class="flecha">→</span>');

  const porServ = servs.map(s => {
    const x = c.por_servicio[s] || { n: 0, valor: 0 };
    return `<div class="fila-dato"><span>${esc(nombreServ(s))}</span><span>${x.n} · ${pesos(x.valor)}</span></div>`;
  }).join('');

  const tabla = c.trabajadores.length ? `
    <div class="tabla-ci" style="--cols:${servs.length}">
      <div class="tr th"><span>Trabajador</span>${servs.map(s => `<span>${abrev(s)}</span>`).join('')}<span>Valor</span></div>
      ${c.trabajadores.map(t => `<div class="tr"><span>${esc(t.nombre)}<small>C.C. ${esc(t.documento)}</small></span>${servs.map(s => `<span>${t.s[s] || 0}</span>`).join('')}<span>${pesos(t.valor)}</span></div>`).join('')}
      <div class="tr tt"><span>Total (${c.trabajadores.length})</span>${servs.map(s => `<span>${(c.por_servicio[s] || {}).n || 0}</span>`).join('')}<span>${pesos(c.valor)}</span></div>
    </div>
    <button class="btn-link" id="ciVerDetalle">${Cierre.verDetalle ? 'Ocultar detalle día a día' : 'Ver detalle día a día con hora →'}</button>
    ${Cierre.verDetalle ? detalleDias(c.detalle) : ''}` : '<p class="txt">No hay raciones de esta SAS en el periodo.</p>';

  const aj = c.ajustes.length ? `<div class="tarjeta">
      <div class="campo-lbl">Ajustes de cortes anteriores (${c.total_ajustes > 0 ? '+' : ''}${c.total_ajustes} · ${pesos(c.valor_ajustes)})</div>
      ${c.ajustes.map(a => `<div class="fila-dato"><span>${esc(fechaCorta(a.fecha))} ${esc(a.hora)} · ${esc(a.nombre)} · ${esc(nombreServ(a.servicio))}<small>${esc(a.motivo)}</small></span><span class="${a.signo < 0 ? 'txt-err' : ''}">${a.signo > 0 ? '+' : '−'}${pesos(Math.abs(a.valor))}</span></div>`).join('')}
    </div>` : '';

  const n = c.novedades;
  const lineas = [];
  if (n.manuales.length) lineas.push(`${n.manuales.length} registro(s) manuales por cédula (sin rostro)`);
  const porMotivo = {};
  n.intentos.forEach(i => { porMotivo[i.motivo] = (porMotivo[i.motivo] || 0) + 1; });
  Object.keys(porMotivo).forEach(m => lineas.push(`${porMotivo[m]} intento(s) bloqueado(s): ${textoMotivo(m).toLowerCase()}`));
  if (n.anuladas.length) lineas.push(`${n.anuladas.length} ración(es) anulada(s) en el periodo (no se cobran)`);
  const nov = lineas.length ? `<div class="alerta alerta-col">
      <div class="campo-lbl txt-aviso">Novedades a revisar (${lineas.length})</div>
      ${lineas.map(l => `<div>• ${esc(l)}</div>`).join('')}
      <button class="btn-link" id="ciVerNov">Ver novedades</button>
      <div id="ciNovDet" hidden>${novedadesDetalle(n)}</div>
    </div>` : '<div class="nota">Sin novedades en el periodo.</div>';

  let acciones = '';
  const terminado = d.hasta < d.servidor.fecha;
  if (d.cruce) {
    acciones = `<div class="alerta"><div>Este periodo se cruza con el corte ${esc(rangoTexto(d.cruce.desde, d.cruce.hasta))} (${esc(d.cruce.estado.toLowerCase())}). Elija otro periodo.</div></div>`;
  } else if (!estado || estado === 'BORRADOR') {
    acciones = `<button class="btn btn-prim btn-xl" id="ciEnviar"${terminado ? '' : ' disabled'}>Enviar corte a la SAS para firma</button>
      ${terminado ? '' : `<div class="nota centro">El periodo termina el ${esc(fechaCorta(d.hasta))}: se puede enviar desde el día siguiente.</div>`}
      <button class="btn btn-sec" id="ciGuardar">${estado ? 'Actualizar borrador' : 'Guardar borrador'}</button>`;
  } else if (estado === 'ENVIADO') {
    acciones = `<button class="btn btn-prim btn-xl" id="ciAceptar">Registrar aceptación de la SAS</button>
      <button class="btn btn-sec" id="ciDevolver">Devolver a borrador</button>`;
  } else if (estado === 'ACEPTADO') {
    acciones = `<button class="btn btn-prim btn-xl" id="ciDescontar">Marcar descontado en factura</button>
      <button class="btn btn-sec" id="ciDevolver">Devolver a enviado</button>`;
  }
  const traza = k ? [
    k.creado_en && `Creado ${esc(k.creado_en.slice(0, 16))} · ${esc(k.creado_por_nombre)}`,
    k.enviado_en && `Enviado ${esc(k.enviado_en.slice(0, 16))} · ${esc(k.enviado_por_nombre)}`,
    k.aceptado_en && `Aceptado ${esc(k.aceptado_en.slice(0, 16))} · firmó por la SAS: ${esc(k.aceptado_firma)} · registró ${esc(k.aceptado_por_nombre)}`,
    k.descontado_en && `Descontado ${esc(k.descontado_en.slice(0, 16))} · factura ${esc(k.factura_ref)} · ${esc(k.descontado_por_nombre)}`
  ].filter(Boolean).map(t => `<div>${t}</div>`).join('') : '';

  $('ciCuerpo').innerHTML = `
    <div class="flujo">${flujo}</div>
    ${congelado ? '<div class="nota">Corte enviado: estas cifras quedaron fijas. Lo que cambie después sale como ajuste en el siguiente corte.</div>' : '<div class="nota">Vista previa: las cifras se recalculan hasta que el corte se envíe.</div>'}
    <div class="kpis kpis-2">
      <div class="kpi"><div class="kpi-l">Raciones registradas</div><div class="kpi-n">${c.total}</div><div class="kpi-s">Casino ${c.por_modo.CASINO || 0} · Campo ${c.por_modo.CAMPO || 0}</div></div>
      <div class="kpi"><div class="kpi-l">Valor a descontar</div><div class="kpi-n">${pesos(c.valor_neto)}</div>${c.ajustes.length ? `<div class="kpi-s">${pesos(c.valor)} ${c.valor_ajustes < 0 ? '−' : '+'} ajustes ${pesos(Math.abs(c.valor_ajustes))}</div>` : ''}</div>
    </div>
    ${porServ ? `<div class="tarjeta">${porServ}</div>` : ''}
    ${tabla}
    ${aj}
    ${nov}
    ${k ? `<div class="tarjeta nota">${traza}</div>` : ''}
    <div class="pila">
      ${acciones}
      <div class="fila-btns"><button class="btn btn-sec" id="ciPdf">Exportar PDF</button><button class="btn btn-sec" id="ciExcel">Exportar Excel</button></div>
    </div>
    ${historialCortes(d)}`;
  conectarCierre();
}

function detalleDias(det) {
  const dias = {};
  det.forEach(r => { (dias[r.fecha] = dias[r.fecha] || []).push(r); });
  return `<div class="tarjeta detalle-dias">${Object.keys(dias).sort().map(f => `
    <div class="campo-lbl">${esc(fechaCorta(f))} · ${dias[f].length}</div>
    ${dias[f].map(r => `<div class="fila-dato"><span>${esc(r.hora)} · ${esc(r.nombre)}</span><span class="nota">${esc(abrev(r.servicio))} · ${r.modo === 'CAMPO' ? 'campo' : (r.metodo === 'ROSTRO' ? 'rostro' : 'cédula')}</span></div>`).join('')}`).join('')}
  </div>`;
}

function novedadesDetalle(n) {
  const fila = (a, b) => `<div class="fila-dato"><span>${a}</span><span class="nota">${b}</span></div>`;
  return [
    n.manuales.length ? '<div class="campo-lbl">Registros manuales por cédula</div>' +
      n.manuales.map(m => fila(`${esc(fechaCorta(m.fecha))} ${esc(m.hora)} · ${esc(m.nombre)}`, `${esc(abrev(m.servicio))} · ${esc(m.entregado_por)}`)).join('') : '',
    n.intentos.length ? '<div class="campo-lbl">Intentos bloqueados</div>' +
      n.intentos.map(i => fila(`${esc(fechaCorta(i.fecha))} ${esc(i.hora)} · ${esc(i.nombre)}`, `${esc(textoMotivo(i.motivo))}`)).join('') : '',
    n.anuladas.length ? '<div class="campo-lbl">Anuladas</div>' +
      n.anuladas.map(a => fila(`${esc(fechaCorta(a.fecha))} ${esc(a.hora)} · ${esc(a.nombre)}`, `${esc(a.motivo)} · ${esc(a.anulado_por)}`)).join('') : ''
  ].join('');
}

function historialCortes(d) {
  if (!d.cortes.length) return '';
  return `<div class="campo-lbl">Cortes de ${esc(d.sas.nombre)}</div><div class="lista">${d.cortes.map(c => {
    const est = (ESTADOS_CORTE.find(e => e[0] === c.estado) || [, c.estado])[1];
    return `<div class="item"><div class="item-txt"><b>${esc(rangoTexto(c.desde, c.hasta))}</b><span>${c.total_raciones} raciones · ${pesos(c.valor)}${c.factura_ref ? ' · factura ' + esc(c.factura_ref) : ''}</span></div>
      <span class="etq ${c.estado === 'DESCONTADO' || c.estado === 'ACEPTADO' ? 'etq-emp' : c.estado === 'ENVIADO' ? 'etq-sas' : 'etq-gris'}">${esc(est)}</span>
      <button class="btn" data-corte="${esc(c.desde)}|${esc(c.hasta)}">Ver</button></div>`;
  }).join('')}</div>`;
}

function conectarCierre() {
  const on = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
  on('ciVerDetalle', () => { Cierre.verDetalle = !Cierre.verDetalle; pintarCierre(); });
  on('ciVerNov', () => { $('ciNovDet').hidden = !$('ciNovDet').hidden; });
  on('ciGuardar', () => cambiarEstado('GUARDAR'));
  on('ciEnviar', async () => {
    const c = Cierre.datos.calculo;
    if (!await confirmar(`Enviar el corte de ${Cierre.datos.sas.nombre} (${rangoTexto(Cierre.desde, Cierre.hasta)}): ${c.total} raciones, ${pesos(c.valor_neto)}.\n\nLas cifras quedan fijas; lo que cambie después saldrá como ajuste en el siguiente corte. Luego exporte el PDF y envíelo a la SAS.`, 'Enviar')) return;
    if (await cambiarEstado('ENVIAR')) exportarPDF();
  });
  on('ciAceptar', async () => {
    const firma = await pedirTexto('¿Quién aceptó el corte por parte de la SAS? (nombre y cargo)', { minimo: 3 });
    if (firma) cambiarEstado('ACEPTAR', { firma });
  });
  on('ciDescontar', async () => {
    const factura_ref = await pedirTexto('Referencia de la factura de la SAS donde se descontó', { placeholder: 'Ej. FE-1234', minimo: 2 });
    if (factura_ref) cambiarEstado('DESCONTAR', { factura_ref });
  });
  on('ciDevolver', async () => {
    const motivo = await pedirTexto('Motivo para devolver el corte', { minimo: 5 });
    if (motivo) cambiarEstado('RETROCEDER', { motivo });
  });
  on('ciPdf', exportarPDF);
  on('ciExcel', exportarExcel);
  document.querySelectorAll('#ciCuerpo [data-corte]').forEach(b => {
    b.onclick = () => { [Cierre.desde, Cierre.hasta] = b.dataset.corte.split('|'); ponerPeriodoUI(); cargarCierre(); window.scrollTo(0, 0); };
  });
}

async function cambiarEstado(accion, extra) {
  const r = await apiAdmin('estadoCorte', Object.assign({ sas: Cierre.sas, desde: Cierre.desde, hasta: Cierre.hasta, paso: accion }, extra || {}));
  if (!r || !r.ok) return false;
  toast({ GUARDAR: 'Borrador guardado', ENVIAR: 'Corte enviado', ACEPTAR: 'Aceptación registrada', DESCONTAR: 'Corte descontado', RETROCEDER: 'Corte devuelto' }[accion], 'ok');
  await cargarCierre();
  return true;
}

/* ── Exportar ── */
function nombreArchivo(ext) {
  const s = Cierre.datos.sas.nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return `Corte_casino_${s}_${Cierre.desde}_${Cierre.hasta}.${ext}`;
}

function exportarPDF() {
  const d = Cierre.datos, c = d.calculo, k = d.corte;
  const servs = serviciosUsados(c);
  const est = k ? (ESTADOS_CORTE.find(e => e[0] === k.estado) || [, k.estado])[1] : 'Vista previa (sin guardar)';
  const valores = {};
  c.detalle.forEach(r => { valores[r.servicio] = r.valor; });
  $('impresion').innerHTML = `
    <h1>Corte de alimentación · Casino Palma Grande S.A.S.</h1>
    <table class="imp-cab"><tr><td><b>SAS contratista:</b> ${esc(d.sas.nombre)}</td><td><b>NIT:</b> ${esc(d.sas.nit || '—')}</td></tr>
      <tr><td><b>Periodo:</b> ${esc(rangoTexto(d.desde, d.hasta))}</td><td><b>Estado:</b> ${esc(est)}${k && k.enviado_en ? ' · enviado ' + esc(k.enviado_en.slice(0, 16)) : ''}</td></tr></table>
    <h2>Resumen</h2>
    <table><tr><th>Servicio</th><th>Raciones</th><th>Valor unitario</th><th>Valor</th></tr>
      ${servs.map(s => { const x = c.por_servicio[s] || { n: 0, valor: 0 }; return `<tr><td>${esc(nombreServ(s))}</td><td>${x.n}</td><td>${valores[s] != null ? pesos(valores[s]) : ''}</td><td>${pesos(x.valor)}</td></tr>`; }).join('')}
      <tr class="tot"><td>Subtotal del periodo</td><td>${c.total}</td><td></td><td>${pesos(c.valor)}</td></tr>
      ${c.ajustes.length ? `<tr><td>Ajustes de cortes anteriores</td><td>${c.total_ajustes}</td><td></td><td>${pesos(c.valor_ajustes)}</td></tr>` : ''}
      <tr class="tot"><td>Valor a descontar</td><td></td><td></td><td>${pesos(c.valor_neto)}</td></tr></table>
    <p class="imp-nota">En casino: ${c.por_modo.CASINO || 0} · Despachadas a campo según pedido autorizado: ${c.por_modo.CAMPO || 0}</p>
    <h2>Raciones por trabajador</h2>
    <table><tr><th>Trabajador</th><th>Cédula</th>${servs.map(s => `<th>${abrev(s)}</th>`).join('')}<th>Valor</th></tr>
      ${c.trabajadores.map(t => `<tr><td>${esc(t.nombre)}</td><td>${esc(t.documento)}</td>${servs.map(s => `<td>${t.s[s] || 0}</td>`).join('')}<td>${pesos(t.valor)}</td></tr>`).join('')}
      <tr class="tot"><td>Total</td><td>${c.trabajadores.length}</td>${servs.map(s => `<td>${(c.por_servicio[s] || {}).n || 0}</td>`).join('')}<td>${pesos(c.valor)}</td></tr></table>
    ${c.ajustes.length ? `<h2>Ajustes</h2><table><tr><th>Fecha</th><th>Trabajador</th><th>Servicio</th><th>Motivo</th><th>Valor</th></tr>
      ${c.ajustes.map(a => `<tr><td>${esc(a.fecha)} ${esc(a.hora)}</td><td>${esc(a.nombre)}</td><td>${esc(nombreServ(a.servicio))}</td><td>${esc(a.motivo)}</td><td>${pesos(a.valor)}</td></tr>`).join('')}</table>` : ''}
    <h2>Detalle día a día</h2>
    <table class="imp-det"><tr><th>Fecha</th><th>Hora</th><th>Trabajador</th><th>Servicio</th><th>Modo</th></tr>
      ${c.detalle.map(r => `<tr><td>${esc(r.fecha)}</td><td>${esc(r.hora)}</td><td>${esc(r.nombre)}</td><td>${esc(abrev(r.servicio))}</td><td>${r.modo === 'CAMPO' ? 'Campo' : (r.metodo === 'ROSTRO' ? 'Casino · rostro' : 'Casino · cédula')}</td></tr>`).join('')}</table>
    <div class="firmas"><div>Elaboró (Palma Grande S.A.S.)<br><br>______________________________</div>
      <div>Aceptó por la SAS contratista${k && k.aceptado_firma ? ': ' + esc(k.aceptado_firma) : ''}<br><br>______________________________</div></div>
    <p class="imp-nota">Generado ${esc(d.servidor.fecha)} ${esc(d.servidor.hora.slice(0, 5))} (hora Colombia) · ${esc(k ? k.id : 'sin código')}</p>`;
  const titulo = document.title;
  document.title = nombreArchivo('pdf').replace(/\.pdf$/, '');
  window.print();
  setTimeout(() => { document.title = titulo; }, 1000);
}

let _xlsxCargando = null;
function cargarXLSX() {
  if (window.XLSX) return Promise.resolve();
  if (_xlsxCargando) return _xlsxCargando;
  _xlsxCargando = new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = ok; s.onerror = () => { _xlsxCargando = null; ko(new Error('No se pudo cargar la librería de Excel')); };
    document.head.appendChild(s);
  });
  return _xlsxCargando;
}

async function exportarExcel() {
  try { await cargarXLSX(); } catch (e) { toast(e.message + ' (¿hay señal?)', 'err'); return; }
  const d = Cierre.datos, c = d.calculo, k = d.corte;
  const servs = serviciosUsados(c);
  const wb = XLSX.utils.book_new();
  const resumen = [
    ['Corte de alimentación · Casino Palma Grande S.A.S.'], [],
    ['SAS contratista', d.sas.nombre], ['NIT', d.sas.nit || ''], ['Periodo', `${d.desde} a ${d.hasta}`],
    ['Estado', k ? k.estado : 'VISTA PREVIA'], ['Código', k ? k.id : ''], [],
    ['Servicio', 'Raciones', 'Valor'],
    ...servs.map(s => { const x = c.por_servicio[s] || { n: 0, valor: 0 }; return [nombreServ(s), x.n, x.valor]; }),
    ['Subtotal del periodo', c.total, c.valor],
    ['Ajustes de cortes anteriores', c.total_ajustes, c.valor_ajustes],
    ['Valor a descontar', '', c.valor_neto], [],
    ['En casino', c.por_modo.CASINO || 0], ['A campo (pedido autorizado)', c.por_modo.CAMPO || 0]
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), 'Resumen');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Trabajador', 'Cédula', ...servs.map(nombreServ), 'Total raciones', 'Valor'],
    ...c.trabajadores.map(t => [t.nombre, t.documento, ...servs.map(s => t.s[s] || 0), t.n, t.valor])
  ]), 'Trabajadores');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Fecha', 'Hora', 'Trabajador', 'Cédula', 'Servicio', 'Modo', 'Método', 'Valor', 'Entregó'],
    ...c.detalle.map(r => [r.fecha, r.hora, r.nombre, r.documento, nombreServ(r.servicio), r.modo, r.metodo, r.valor, r.entregado_por])
  ]), 'Detalle');
  if (c.ajustes.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Fecha', 'Hora', 'Trabajador', 'Cédula', 'Servicio', 'Motivo', 'Valor'],
    ...c.ajustes.map(a => [a.fecha, a.hora, a.nombre, a.documento, nombreServ(a.servicio), a.motivo, a.valor])
  ]), 'Ajustes');
  const n = c.novedades;
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Tipo', 'Fecha', 'Hora', 'Trabajador', 'Servicio', 'Detalle'],
    ...n.manuales.map(m => ['Registro manual por cédula', m.fecha, m.hora, m.nombre, nombreServ(m.servicio), 'Entregó ' + m.entregado_por]),
    ...n.intentos.map(i => ['Intento bloqueado', i.fecha, i.hora, i.nombre, nombreServ(i.servicio), textoMotivo(i.motivo) + (i.detalle ? ' · ' + i.detalle : '')]),
    ...n.anuladas.map(a => ['Anulada', a.fecha, a.hora, a.nombre, nombreServ(a.servicio), a.motivo + ' · ' + a.anulado_por])
  ]), 'Novedades');
  XLSX.writeFile(wb, nombreArchivo('xlsx'));
}

document.addEventListener('DOMContentLoaded', () => {
  $('ciVolver').onclick = () => {
    if (Cierre.volverA === 'pTablet') { ruta(); return; }
    mostrar(Cierre.volverA); if (Cierre.volverA === 'pAdmin') pintarTab();
  };
  $('ciSas').onchange = () => { Cierre.sas = $('ciSas').value; cargarCierre(); };
  $('ciPeriodo').onchange = () => {
    const v = $('ciPeriodo').value;
    if (v === 'otro') { $('ciRango').hidden = false; return; }
    [Cierre.desde, Cierre.hasta] = v.split('|'); $('ciRango').hidden = true; cargarCierre();
  };
  $('ciAplicar').onclick = () => {
    const a = $('ciDesde').value, b = $('ciHasta').value;
    if (!a || !b || a > b) { toast('Revise las fechas del rango', 'err'); return; }
    Cierre.desde = a; Cierre.hasta = b; cargarCierre();
  };
  $('adminCierre').onclick = () => abrirCierre('pAdmin');
  $('tabletCierre').onclick = () => abrirCierre('pTablet');
});
