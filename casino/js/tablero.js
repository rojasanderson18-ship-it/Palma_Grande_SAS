/* ═══════════════════════════════════════════════════════════
   Casino — Pantalla 6: Tablero de consumo (ADMIN; AUTORIZA solo lectura)
   · Raciones por día, Empresa vs SAS (barras apiladas, SVG propio).
   · Total por SAS contratista y por centro de costo de la empresa.
   · Cruce contra la factura del proveedor del casino (campo editable).
   Colores validados (daltonismo y contraste): Empresa #199e70 · SAS #9A3412.
═══════════════════════════════════════════════════════════ */
'use strict';

const Tab = { modo: 'QUINCENA', desde: '', hasta: '', datos: null, volverA: 'pAdmin', verTabla: false };
const COLOR = { EMPRESA: '#199e70', SAS: '#9A3412' };

/* ── Periodos en fechas de Bogotá ── */
function fUTC(f) { const [y, m, d] = f.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); }
// dt es el mediodía UTC de una fecha de Bogotá: se arma el texto a mano (nunca toISOString).
function fTxt(dt) { return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`; }
function sumarDiasF(f, n) { const dt = fUTC(f); dt.setUTCDate(dt.getUTCDate() + n); return fTxt(dt); }
function periodoDe(modo, ref) {
  const [y, m, d] = ref.split('-').map(Number);
  const mm = String(m).padStart(2, '0');
  if (modo === 'SEMANA') {
    const dow = (fUTC(ref).getUTCDay() + 6) % 7;            // lunes = 0
    const desde = sumarDiasF(ref, -dow);
    return { desde, hasta: sumarDiasF(desde, 6) };
  }
  if (modo === 'MES') return { desde: `${y}-${mm}-01`, hasta: `${y}-${mm}-${ultimoDia(y, m)}` };
  return d <= 15 ? { desde: `${y}-${mm}-01`, hasta: `${y}-${mm}-15` } : { desde: `${y}-${mm}-16`, hasta: `${y}-${mm}-${ultimoDia(y, m)}` };
}
function moverPeriodo(dir) {
  const ref = dir < 0 ? sumarDiasF(Tab.desde, -1) : sumarDiasF(Tab.hasta, 1);
  Object.assign(Tab, periodoDe(Tab.modo, ref));
  cargarTablero();
}

/* ── Entrada ── */
function abrirTablero(desde) {
  const s = sesion();
  if (!s || !['ADMIN', 'AUTORIZA'].includes(s.usuario.rol)) { toast('Requiere sesión de ADMIN o AUTORIZA', 'err'); return; }
  Tab.volverA = desde || 'pAdmin';
  if (!Tab.desde) Object.assign(Tab, periodoDe(Tab.modo, fechaBogota()));
  mostrar('pTablero');
  pintarModos();
  cargarTablero();
}

function pintarModos() {
  document.querySelectorAll('#tbModos button').forEach(b => b.classList.toggle('on', b.dataset.m === Tab.modo));
  $('tbPeriodo').textContent = rangoTexto(Tab.desde, Tab.hasta);
  $('tbSig').disabled = Tab.hasta >= fechaBogota();
}

async function cargarTablero() {
  const s = sesion(); if (!s) { ruta(); return; }
  pintarModos();
  $('tbNota').textContent = 'Calculando…';
  try {
    const r = await api('tableroCasino', { token: s.token, desde: Tab.desde, hasta: Tab.hasta }, 60000);
    if (!r.ok) { $('tbNota').textContent = r.error; if (/Sesión/.test(r.error || '')) { cerrarSesion(); ruta(); } return; }
    Tab.datos = r;
    $('tbNota').textContent = `Actualizado ${r.servidor.hora.slice(0, 5)}`;
    pintarTablero();
  } catch (e) {
    $('tbNota').textContent = navigator.onLine ? 'No se pudo calcular: ' + e.message : 'El tablero necesita conexión.';
  }
}

/* ── Pantalla ── */
function pintarTablero() {
  const d = Tab.datos, t = d.totales;
  const emp = t.EMPRESA.n + t.VISITANTE.n, empV = t.EMPRESA.valor + t.VISITANTE.valor;
  $('tbCuerpo').innerHTML = `
    <div class="kpis kpis-2">
      <div class="kpi"><div class="kpi-l">Raciones</div><div class="kpi-n">${d.total.toLocaleString('es-CO')}</div>
        <div class="kpi-s">Empresa ${emp} · SAS ${t.SAS.n}</div></div>
      <div class="kpi"><div class="kpi-l">Valor</div><div class="kpi-n">${pesos(d.valor_total)}</div>
        <div class="kpi-s">Casino ${d.por_modo.CASINO} · Campo ${d.por_modo.CAMPO}</div></div>
    </div>
    <div class="tarjeta">
      <div class="graf-cab"><div class="campo-lbl">Raciones por día</div>
        <div class="leyenda"><span><i style="background:${COLOR.EMPRESA}"></i>Empresa</span><span><i style="background:${COLOR.SAS}"></i>SAS contratistas</span></div></div>
      <div class="graf" id="tbGraf"></div>
      <div class="nota">Empresa incluye visitantes (${t.VISITANTE.n}).${d.anuladas ? ` No se cuentan ${d.anuladas} anuladas.` : ''}
        <button class="btn-link" id="tbVerTabla">${Tab.verTabla ? 'Ocultar tabla' : 'Ver como tabla'}</button></div>
      ${Tab.verTabla ? tablaDias(d) : ''}
    </div>
    ${tarjetaConciliacion(d)}
    <div class="tarjeta">
      <div class="campo-lbl">Por SAS contratista (a descontar)</div>
      ${d.por_sas.length ? d.por_sas.map(x => `<div class="fila-dato"><span>${esc(x.nombre)}<small>${x.n} raciones${x.corte ? ' · corte ' + esc(x.corte.toLowerCase()) : ''}</small></span><b>${pesos(x.valor)}</b></div>`).join('') : '<div class="nota">Sin consumo de SAS en el periodo.</div>'}
      ${d.por_sas.length > 1 ? `<div class="fila-dato tt"><span>Total SAS</span><b>${pesos(t.SAS.valor)}</b></div>` : ''}
    </div>
    <div class="tarjeta">
      <div class="campo-lbl">Empresa (por centro de costo)</div>
      ${d.por_cc.map(x => `<div class="fila-dato"><span>${esc(x.centro_costo)}<small>${x.n} raciones</small></span><b>${pesos(x.valor)}</b></div>`).join('')}
      ${t.VISITANTE.n ? `<div class="fila-dato"><span>Visitantes<small>${t.VISITANTE.n} raciones · cargo a ${esc(d.cargo_visitantes)}</small></span><b>${pesos(t.VISITANTE.valor)}</b></div>` : ''}
      ${!d.por_cc.length && !t.VISITANTE.n ? '<div class="nota">Sin consumo de la empresa en el periodo.</div>' : ''}
      ${d.por_cc.length + (t.VISITANTE.n ? 1 : 0) > 1 ? `<div class="fila-dato tt"><span>Total empresa</span><b>${pesos(empV)}</b></div>` : ''}
    </div>
    ${d.por_servicio.length ? `<div class="tarjeta"><div class="campo-lbl">Por servicio</div>
      ${d.por_servicio.map(x => `<div class="fila-dato"><span>${esc(x.nombre)}</span><span>${x.n} · ${pesos(x.valor)}</span></div>`).join('')}</div>` : ''}`;
  dibujarGrafica(d);
  $('tbVerTabla').onclick = () => { Tab.verTabla = !Tab.verTabla; pintarTablero(); };
  const g = $('tbGuardarFactura'); if (g) g.onclick = guardarFactura;
}

function tablaDias(d) {
  return `<div class="tabla-ci tabla-dias" style="--cols:3">
    <div class="tr th"><span>Día</span><span>Emp.</span><span>SAS</span><span>Total</span><span>Valor</span></div>
    ${d.dias.map(x => `<div class="tr"><span>${esc(fechaCorta(x.fecha))}</span><span>${x.EMPRESA + x.VISITANTE}</span><span>${x.SAS}</span><span>${x.EMPRESA + x.VISITANTE + x.SAS}</span><span>${pesos(x.valor)}</span></div>`).join('')}
  </div>`;
}

function tarjetaConciliacion(d) {
  const c = d.conciliacion || {};
  const facR = c.raciones_factura, facV = c.valor_factura;
  const difR = facR != null ? facR - d.total : null, difV = facV != null ? facV - d.valor_total : null;
  const signo = n => (n > 0 ? '+' : n < 0 ? '−' : '') ;
  const difTxt = difR == null && difV == null ? '<span class="nota">Escriba la factura del proveedor</span>'
    : [difR != null ? `${signo(difR)}${Math.abs(difR)} raciones` : '', difV != null ? `${signo(difV)}${pesos(Math.abs(difV))}` : ''].filter(Boolean).join(' · ');
  const lectura = (difR || difV) ? `<div class="nota">${difR > 0 || difV > 0 ? 'El proveedor factura más de lo registrado en la app: revise antes de pagar.' : 'El proveedor factura menos de lo registrado en la app.'}</div>` : '';
  const editable = d.puede_editar ? `
    <div class="ci-filtros conc-campos">
      <label class="campo">Raciones en la factura<input id="tbFacR" type="text" inputmode="numeric" value="${facR != null ? facR : ''}"></label>
      <label class="campo">Valor de la factura<input id="tbFacV" type="text" inputmode="numeric" value="${facV != null ? facV : ''}"></label>
    </div>
    <label class="campo">Referencia de la factura<input id="tbFacRef" type="text" maxlength="60" value="${esc(c.factura_ref || '')}" placeholder="Ej. FV-889"></label>
    <button class="btn btn-sec" id="tbGuardarFactura">Guardar factura del proveedor</button>` : '';
  return `<div class="tarjeta">
    <div class="campo-lbl">Conciliación con el proveedor del casino</div>
    <div class="fila-dato"><span>Factura del proveedor${c.factura_ref ? `<small>${esc(c.factura_ref)}</small>` : ''}</span><b>${facR != null ? facR + ' raciones' : '—'}${facV != null ? ' · ' + pesos(facV) : ''}</b></div>
    <div class="fila-dato"><span>Registradas en la app<small>casino, campo y visitantes</small></span><b>${d.total} raciones · ${pesos(d.valor_total)}</b></div>
    <div class="fila-dato ${difR || difV ? 'dif' : ''}"><span>Diferencia</span><b>${difTxt}</b></div>
    ${lectura}
    ${c.editado_en ? `<div class="nota">Factura registrada por ${esc(c.editado_por)} · ${esc(c.editado_en.slice(0, 16))}</div>` : ''}
    ${editable}
  </div>`;
}

async function guardarFactura() {
  const r = await apiAdmin('guardarConciliacion', { desde: Tab.desde, hasta: Tab.hasta,
    raciones_factura: $('tbFacR').value, valor_factura: $('tbFacV').value, factura_ref: $('tbFacRef').value });
  if (!r || !r.ok) return;
  toast('Factura del proveedor guardada', 'ok');
  cargarTablero();
}

/* ── Gráfica: barras apiladas por día (Empresa abajo, SAS arriba) ── */
function dibujarGrafica(d) {
  const cont = $('tbGraf');
  const W = Math.max(280, cont.clientWidth || 340), H = 190;
  const m = { l: 30, r: 6, t: 10, b: 22 };
  const n = d.dias.length;
  const max = Math.max(1, ...d.dias.map(x => x.EMPRESA + x.VISITANTE + x.SAS));
  const paso = max <= 4 ? 1 : Math.pow(10, Math.floor(Math.log10(max / 2)));
  const tope = Math.ceil(max / (paso * 2)) * paso * 2;
  const y = v => m.t + (H - m.t - m.b) * (1 - v / tope);
  const banda = (W - m.l - m.r) / n;
  const ancho = Math.max(3, Math.min(28, banda * 0.66));
  const GAP = 2, R = 4;
  const ticks = [0, tope / 2, tope];
  const cadaX = n > 16 ? (n > 24 ? 5 : 2) : 1;
  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="Raciones por día, Empresa y SAS">`;
  ticks.forEach(tk => {
    svg += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(tk)}" y2="${y(tk)}" class="g-grid"/>` +
           `<text x="${m.l - 6}" y="${y(tk) + 4}" class="g-eje" text-anchor="end">${tk}</text>`;
  });
  const topRedondo = (x, y0, w, h) => h <= 0 ? '' : (h < R
    ? `<rect x="${x}" y="${y0}" width="${w}" height="${h}"/>`
    : `<path d="M${x},${y0 + h}V${y0 + R}Q${x},${y0} ${x + R},${y0}H${x + w - R}Q${x + w},${y0} ${x + w},${y0 + R}V${y0 + h}Z"/>`);
  d.dias.forEach((x, i) => {
    const cx = m.l + banda * i + banda / 2, x0 = cx - ancho / 2;
    const e = x.EMPRESA + x.VISITANTE, s = x.SAS;
    const base = y(0);
    const hE = base - y(e), hS = base - y(s);
    // Empresa abajo; si hay SAS encima, Empresa queda plana arriba y se separa con un hueco de 2 px.
    if (e) svg += `<g fill="${COLOR.EMPRESA}">${s ? `<rect x="${x0}" y="${base - hE}" width="${ancho}" height="${hE}"/>` : topRedondo(x0, base - hE, ancho, hE)}</g>`;
    if (s) {
      const yS = base - hE - (e ? GAP : 0) - hS;
      svg += `<g fill="${COLOR.SAS}">${topRedondo(x0, yS, ancho, hS)}</g>`;
    }
    if (i % cadaX === 0) svg += `<text x="${cx}" y="${H - 6}" class="g-eje" text-anchor="middle">${Number(x.fecha.slice(8))}</text>`;
    svg += `<rect class="g-hit" data-i="${i}" x="${m.l + banda * i}" y="${m.t}" width="${banda}" height="${H - m.t - m.b}"/>`;
  });
  svg += '</svg><div class="g-tip" id="tbTip" hidden></div>';
  cont.innerHTML = svg;
  const tip = $('tbTip');
  cont.querySelectorAll('.g-hit').forEach(h => {
    const mostrarTip = () => {
      const x = d.dias[Number(h.dataset.i)];
      cont.querySelectorAll('.g-hit').forEach(o => o.classList.toggle('on', o === h));
      tip.innerHTML = `<b>${esc(fechaCorta(x.fecha))}</b>
        <div><i style="background:${COLOR.EMPRESA}"></i>Empresa ${x.EMPRESA + x.VISITANTE}${x.VISITANTE ? ` (visit. ${x.VISITANTE})` : ''}</div>
        <div><i style="background:${COLOR.SAS}"></i>SAS ${x.SAS}</div>
        <div>Total ${x.EMPRESA + x.VISITANTE + x.SAS} · ${pesos(x.valor)}</div>`;
      tip.hidden = false;
      const bx = Number(h.getAttribute('x')) / W * cont.clientWidth;
      const izq = Math.min(Math.max(0, bx - tip.offsetWidth / 2), cont.clientWidth - tip.offsetWidth);
      tip.style.left = izq + 'px';
    };
    h.addEventListener('mouseenter', mostrarTip);
    h.addEventListener('click', mostrarTip);
  });
  cont.onmouseleave = () => { tip.hidden = true; cont.querySelectorAll('.g-hit').forEach(o => o.classList.remove('on')); };
}

document.addEventListener('DOMContentLoaded', () => {
  $('tbVolver').onclick = () => {
    if (Tab.volverA === 'pTablet' || Tab.volverA === 'pAutoriza') { ruta(); return; }
    mostrar(Tab.volverA); if (Tab.volverA === 'pAdmin') pintarTab();
  };
  $('tbModos').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    Tab.modo = b.dataset.m;
    Object.assign(Tab, periodoDe(Tab.modo, Tab.hasta > fechaBogota() ? fechaBogota() : Tab.hasta));
    cargarTablero();
  });
  $('tbAnt').onclick = () => moverPeriodo(-1);
  $('tbSig').onclick = () => moverPeriodo(1);
  $('adminTablero').onclick = () => abrirTablero('pAdmin');
  $('tabletTablero').onclick = () => abrirTablero('pTablet');
  $('autTablero').onclick = () => abrirTablero('pAutoriza');
  window.addEventListener('resize', () => { if (!$('pTablero').hidden && Tab.datos) dibujarGrafica(Tab.datos); });
});
