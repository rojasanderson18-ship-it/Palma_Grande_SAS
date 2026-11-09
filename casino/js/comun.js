/* ═══════════════════════════════════════════════════════════
   Casino Palma Grande — utilidades comunes
   · Fechas SIEMPRE en America/Bogota (nunca toISOString()).
   · Todas las claves de localStorage llevan el prefijo "casino_"
     (el origen github.io es compartido con Asistencia y el hub).
═══════════════════════════════════════════════════════════ */
'use strict';

const TZ = 'America/Bogota';
const LS = {
  url:        'casino_gas_url',
  disp:       'casino_dispositivo',
  sesion:     'casino_sesion',
  catalogo:   'casino_catalogo',
  cola:       'casino_cola',
  hoy:        'casino_hoy',
  avisos:     'casino_avisos',
  vistos:     'casino_intentos_vistos',
  ultUsuario: 'casino_ultimo_usuario'
};

/* ── Fechas Bogotá ── */
const _fmtPartes = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
});
function ahoraBogota(d) {
  const p = {};
  _fmtPartes.formatToParts(d || new Date()).forEach(x => { p[x.type] = x.value; });
  return {
    fecha: `${p.year}-${p.month}-${p.day}`,
    hora:  `${p.hour}:${p.minute}:${p.second}`,
    hhmm:  `${p.hour}:${p.minute}`
  };
}
function fechaBogota() { return ahoraBogota().fecha; }
function horaBogota()  { return ahoraBogota().hora; }

// "Lun 9 nov" a partir de yyyy-MM-dd (se construye al mediodía UTC para no cambiar de día).
function fechaCorta(fecha) {
  const [y, m, d] = fecha.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const dia = new Intl.DateTimeFormat('es-CO', { timeZone: 'UTC', weekday: 'short' }).format(dt).replace('.', '');
  const mes = new Intl.DateTimeFormat('es-CO', { timeZone: 'UTC', month: 'short' }).format(dt).replace('.', '');
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${d} ${mes}`;
}

/* ── localStorage seguro ── */
function lsGet(k, def) {
  try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch { return def; }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); return true; }
  catch (e) { console.error('localStorage lleno', e); toast('Memoria de la tablet llena', 'err'); return false; }
}
function lsDel(k) { try { localStorage.removeItem(k); } catch {} }

/* ── Ids únicos (no se repiten entre tablets ni al reintentar) ── */
function uid(prefijo) {
  const disp = (lsGet(LS.disp, null) || {}).id || 'TAB-SINID';
  const r = new Uint8Array(4); crypto.getRandomValues(r);
  const rnd = Array.from(r, b => b.toString(16).padStart(2, '0')).join('');
  return `${prefijo}-${disp.replace(/[^A-Za-z0-9-]/g, '')}-${Date.now().toString(36)}-${rnd}`;
}

async function sha256Hex(texto) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

/* ── Backend ── */
function gasUrl() { return lsGet(LS.url, '') || ''; }

async function api(accion, datos, timeoutMs) {
  const url = gasUrl();
  if (!url) throw new Error('Falta la URL del backend del casino.');
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs || 20000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      // text/plain evita el preflight CORS que Apps Script no responde.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ accion }, datos || {})),
      redirect: 'follow',
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Sin respuesta del servidor (tiempo agotado).');
    throw e;
  } finally { clearTimeout(t); }
}
function credDispositivo() {
  const d = lsGet(LS.disp, null);
  return d ? { dispositivo: d.id, deviceToken: d.token } : {};
}

/* ── Sesión ── */
function sesion() {
  const s = lsGet(LS.sesion, null);
  if (!s || !s.token || !s.exp || s.exp < Date.now()) return null;
  return s;
}
function cerrarSesion() { lsDel(LS.sesion); }

/* ── Escape HTML ── */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function normNombre(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
}
function pesos(n) { return '$' + Number(n || 0).toLocaleString('es-CO'); }
function docOculto(doc) { const s = String(doc || ''); return s.length > 4 ? '••• ' + s.slice(-4) : s; }

/* ── UI: toast y diálogos ── */
function toast(msg, tipo) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg;
  el.className = 'toast show ' + (tipo || '');
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = 'toast'; }, 3200);
}

function abrirModal(id) { const m = document.getElementById(id); if (m) { m.hidden = false; const f = m.querySelector('input,select,button'); if (f) setTimeout(() => f.focus(), 50); } }
function cerrarModal(id) { const m = document.getElementById(id); if (m) m.hidden = true; }

function pedirTexto(titulo, { placeholder = '', tipo = 'text', minimo = 0 } = {}) {
  return new Promise(resolve => {
    const m = document.getElementById('modalTexto');
    m.querySelector('.mt-titulo').textContent = titulo;
    const inp = m.querySelector('input');
    inp.type = tipo; inp.value = ''; inp.placeholder = placeholder;
    const err = m.querySelector('.mt-error'); err.textContent = '';
    const ok = m.querySelector('.mt-ok'), no = m.querySelector('.mt-no');
    const fin = v => { ok.onclick = no.onclick = inp.onkeydown = null; cerrarModal('modalTexto'); resolve(v); };
    ok.onclick = () => {
      const v = inp.value.trim();
      if (v.length < minimo) { err.textContent = `Escriba al menos ${minimo} caracteres.`; return; }
      fin(v);
    };
    no.onclick = () => fin(null);
    inp.onkeydown = e => { if (e.key === 'Enter') ok.onclick(); };
    abrirModal('modalTexto');
  });
}

function confirmar(texto, etiquetaOk) {
  return new Promise(resolve => {
    const m = document.getElementById('modalConfirmar');
    m.querySelector('.mc-texto').textContent = texto;
    const ok = m.querySelector('.mc-ok'), no = m.querySelector('.mc-no');
    ok.textContent = etiquetaOk || 'Aceptar';
    const fin = v => { ok.onclick = no.onclick = null; cerrarModal('modalConfirmar'); resolve(v); };
    ok.onclick = () => fin(true); no.onclick = () => fin(false);
    abrirModal('modalConfirmar');
  });
}

const MOTIVOS = {
  DUPLICADA: 'Ya recibió este servicio hoy',
  DUPLICADA_SYNC: 'Ya había recibido en otra tablet',
  INACTIVO: 'Persona inactiva',
  SAS_INACTIVA: 'Su SAS contratista está inactiva',
  SIN_CLASIFICAR: 'Sin clasificar (falta tipo de pago, SAS o centro de costo)',
  NO_REGISTRADO: 'No está registrada en el casino',
  FUERA_HORARIO: 'Fuera del horario del servicio',
  SERVICIO_INVALIDO: 'Servicio no válido',
  FECHA_INVALIDA: 'Fecha u hora inválida',
  USUARIO_INVALIDO: 'Usuario que entrega no válido',
  DATOS_INCOMPLETOS: 'Datos incompletos',
  ID_INVALIDO: 'Identificador inválido'
};
function textoMotivo(m) { return MOTIVOS[m] || m; }
