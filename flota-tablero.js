/* =====================================================================
   FLOTA Y COMBUSTIBLE · tablero del dueño
   Lee las hojas del sistema de maquinaria (mismo Apps Script del Taller,
   la Programación, el Preoperativo y el Tanqueo) y las vuelve semáforos:
   verde = estamos bien, ámbar = hay que mirarlo, rojo = alarma.
   No muestra las pantallas de trabajo (esas siguen en cada app).
   Usa la lista de máquinas, los festivos y los horómetros de maestros.js.
   ===================================================================== */
(function(){
  var GS = 'https://script.google.com/macros/s/AKfycbwvDU84orwDkO_iBIBdmaq2CSQWYdp4sH9O14k7u6RpeuGeB3Ay3Nqj3HdFZ_4UobNC/exec';
  var META = 90;                 // disponibilidad objetivo (%)
  /* El sistema actualizado arrancó este día: las cifras de un período
     (disponibilidad, fallas, uso, preoperativos, horas, combustible) cuentan
     desde aquí, y solo se comparan con períodos que también sean del sistema
     nuevo. Lo de antes se registraba distinto (o no se registraba) y daba
     comparaciones engañosas. El estado de hoy (qué máquina está parada y
     desde cuándo) sí sale con su fecha real. */
  var INICIO = (window.SISTEMA && SISTEMA.INICIO) || '2026-10-27';   // la fecha vive en maestros.js
  var DIAS_REPETIDAS = 90;       // ventana para "la misma falla otra vez"
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var LABORES = { alceTijera:'Alce con tijera', alceQuinta:'Alce con quinta rueda', rotospeed:'Rotospeed', rolo:'Rolo cuchilla',
    fertMezcla:'Fertilización con mezcla', fertBorax:'Fertilización en bórax', sanidad:'Sanidad', varias:'Labores varias' };
  var SISTEMAS = { motor:'Motor', hidraulico:'Hidráulico', electrico:'Eléctrico', transmision:'Transmisión',
    frenos:'Frenos', direccion:'Dirección', llantas:'Llantas', estructura:'Estructura', implemento:'Implemento', otro:'Otro' };

  function el(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function p2(n){ return ('0' + n).slice(-2); }
  function iso(d){ return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function hoy(){ return iso(new Date()); }
  function aIso(v){
    var s = String(v == null ? '' : v).trim(); if (!s) return '';
    var m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); if (m) return m[3] + '-' + p2(m[2]) + '-' + p2(m[1]);
    if (s.indexOf('T') > 0){ var d = new Date(s); if (!isNaN(d)) return iso(d); }
    return s.slice(0, 10);
  }
  function esFecha(f){ return /^\d{4}-\d{2}-\d{2}$/.test(f); }
  function sumar(f, n){ var p = f.split('-'); return iso(new Date(+p[0], +p[1] - 1, +p[2] + n)); }
  function dias(a, b){ var p = a.split('-'), q = b.split('-'); return Math.round((new Date(+q[0], +q[1] - 1, +q[2]) - new Date(+p[0], +p[1] - 1, +p[2])) / 86400000); }
  function num(v){ if (v === '' || v == null) return null; var n = +String(v).replace(',', '.'); return isNaN(n) ? null : n; }
  function g2(v){ return String(Math.round(v * 100) / 100).replace('.', ','); }   // consumo por hora: 1,25 gal/h
  function g1(v){ return String(Math.round(v * 10) / 10).replace('.', ','); }
  function peso(v){ return '$' + Math.round(v).toLocaleString('es-CO'); }
  function dcorta(f){ var p = String(f).split('-'); return (+p[2]) + ' ' + MESES[+p[1] - 1].slice(0, 3); }
  function plural(n, uno, varios){ return n + ' ' + (n === 1 ? uno : varios); }
  function codDe(t){ return window.Horometros ? Horometros.codDe(t) : String(t || '').split(/[ ·-]/)[0]; }
  function laboral(f){ return !window.Festivos || Festivos.laboral(f); }

  /* Varias partes de Agrovisión leen las mismas hojas casi al mismo tiempo
     (la tarjeta del Inicio, los horómetros y este tablero). Cada lectura del
     Apps Script tarda: si una hoja ya se pidió hace menos de un minuto, se usa
     esa misma respuesta en vez de volver a pedirla. "Actualizar" la pide de nuevo. */
  var memo = {}, fetchOriginal = window.fetch;
  window.fetch = function(u, o){
    var url = typeof u === 'string' ? u : (u && u.url) || '';
    if (url.indexOf(GS + '?') !== 0 || (o && o.method && o.method.toUpperCase() !== 'GET')) return fetchOriginal.apply(this, arguments);
    var k = url.replace(/([?&])t=\d+&?/, '$1').replace(/[?&]$/, ''), m = memo[k];
    if (!m || Date.now() - m.ts > 60000){
      m = memo[k] = { ts:Date.now(), p: fetchOriginal.call(window, u, o).then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); }) };
      m.p.catch(function(){ if (memo[k] === m) delete memo[k]; });
    }
    return m.p.then(function(t){ return new Response(t, { status:200, headers:{ 'Content-Type':'application/json' } }); });
  };

  function leer(h){
    return fetch(GS + '?hoja=' + encodeURIComponent(h) + '&t=' + Date.now()).then(function(r){ return r.json(); })
      .then(function(d){ if (!d || !d.ok || !Array.isArray(d.datos)) throw new Error('sin datos'); return d.datos; });
  }
  function talvez(h){ return leer(h).catch(function(){ return null; }); }

  /* ---------------- lectura de las hojas ---------------- */
  var FLOTA = [], EQ = {};
  function eq(cod){ return EQ[cod] || null; }
  function esCamion(cod){ var e = eq(cod); return !!e && e.grupo === 'transporte'; }

  /* hoja Taller: paradas (PARADA → ALTA), pendientes y reportes repetidos.
     Igual que en el Taller y la Gerencia: se juntan las filas por ID y vale la última. */
  function taller(filas){
    var ev = {}, orden = [], nov = {}, rep = [], inicio = null;
    filas.forEach(function(r){
      var acc = String(r[2] || '').trim().toUpperCase(), id = String(r[3] || '').trim(), f0 = aIso(r[0]);
      if (esFecha(f0) && (!inicio || f0 < inicio)) inicio = f0;
      if (!id) return;
      if (acc === 'PARADA' || acc === 'ALTA'){
        var e = ev[id];
        if (!e){ e = ev[id] = { id:id, cod:String(r[4] || '').trim(), tipo:'falla', sistema:null, txt:'', inicio:aIso(r[10] || r[0]), fin:null }; orden.push(id); }
        if (r[6]) e.tipo = String(r[6]).trim() === 'mantenimiento' ? 'mantenimiento' : 'falla';
        if (r[8]) e.txt = String(r[8]);
        if (r[10]) e.inicio = aIso(r[10]);
        var s = String(r[7] || '').trim(), k = SISTEMAS[s] ? s : Object.keys(SISTEMAS).filter(function(x){ return SISTEMAS[x] === s; })[0];
        if (s) e.sistema = k || 'otro';      // desde la parada; el alta lo puede corregir
        if (acc === 'ALTA'){
          var d = parseInt(r[13], 10); e.fin = isNaN(d) ? f0 : sumar(e.inicio, d);
        }
      } else if (acc === 'PENDIENTE' || acc === 'RESUELTO'){
        var n = nov[id] = nov[id] || { id:id, cod:String(r[4] || '').trim(), txt:'', urgente:false, desde:'', abierto:true };
        if (r[6]) n.urgente = String(r[6]).trim() === 'urgente';
        if (r[8]) n.txt = String(r[8]);
        if (r[10]) n.desde = aIso(r[10]);
        if (acc === 'RESUELTO') n.abierto = false;
      } else if (acc === 'REPORTE'){
        rep.push({ fecha:f0, cod:String(r[4] || '').trim(), refs:String(r[11] || '') });
      }
    });
    var eventos = orden.map(function(id){ return ev[id]; }).filter(function(e){ return esFecha(e.inicio); });
    var pend = Object.keys(nov).map(function(k){ return nov[k]; }).filter(function(n){ return n.abierto && n.txt; });
    pend.forEach(function(n){ n.reportes = rep.filter(function(x){ return x.refs.indexOf(n.id) >= 0; }).length; });
    return { eventos:eventos, pend:pend, inicio:inicio };
  }

  /* Programación por fecha → máquina (ProgMaquinaria; la hoja anterior ya no se usa) */
  function programacion(nueva){
    var dias = {};
    (nueva || []).forEach(function(r){
      var acc = String(r[2] || '').trim().toUpperCase(), f = aIso(r[4]), cod = String(r[5] || '').trim();
      if (!esFecha(f) || !cod) return;
      if (acc === 'QUITAR'){ if (dias[f]) delete dias[f][cod]; return; }
      if (acc === 'ASIGNAR') (dias[f] = dias[f] || {})[cod] = { labor: LABORES[String(r[6] || '').trim()] || String(r[6] || '').trim(),
        lotes:String(r[7] == null ? '' : r[7]).trim(), op: [String(r[9] || '').trim(), String(r[12] || '').trim()].filter(Boolean).join(' / ') };
    });
    return dias;
  }

  /* días con preoperativo por máquina: { 'cod|fecha': { op, hora } } */
  function preops(nuevo, viejo){
    var o = {};
    (nuevo || []).concat(viejo || []).forEach(function(r){
      var f = aIso(r[0]), c = codDe(r[3]), op = String(r[2] || '').trim();
      if (!c || !esFecha(f)) return;
      var x = o[c + '|' + f] = o[c + '|' + f] || { op:'', hora:hhmm(r[1]) };
      if (op && x.op.indexOf(op) < 0) x.op = x.op ? x.op + ' / ' + op : op;   // doble turno
    });
    return o;
  }
  /* la hora puede venir como texto (06:16 a. m.) o como fecha de 1899 */
  function hhmm(v){
    var s = String(v == null ? '' : v);
    if (s.indexOf('1899-') === 0){ var d = new Date(s); return isNaN(d) ? '' : p2(d.getHours()) + ':' + p2(d.getMinutes()); }
    return s.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* Cierres de jornada por máquina y día: { 'cod|fecha': [{ hora, op, final, estado, novedad, labor }] }.
     La última fila de cada operario vale (un reintento por señal no se cuenta dos veces); dos operarios = doble turno. */
  function cierresDe(filas){
    var o = {}, u = {};
    (filas || []).forEach(function(r){
      var f = aIso(r[0]), c = codDe(r[3]), op = String(r[2] || '').trim();
      if (c && esFecha(f)) u[c + '|' + f + '|' + op.toLowerCase()] = { cod:c, fecha:f, hora:hhmm(r[1]), op:op, final:num(r[4]),
        estado:String(r[7] || '').trim().toLowerCase(), novedad:String(r[8] || '').trim(), labor:String(r[9] || '').trim(),
        horas:num(r[6]), laborId:String(r[10] || '').trim(), lotes:String(r[11] == null ? '' : r[11]).trim(), segun:String(r[12] || '').trim() };
    });
    Object.keys(u).forEach(function(k){ var x = u[k]; (o[x.cod + '|' + x.fecha] = o[x.cod + '|' + x.fecha] || []).push(x); });
    return o;
  }

  /* En qué va la reparación de una parada y cuánto cuesta (hoja Reparaciones:
     el Taller dice el estado, Compras el costo; Reparaciones en maestros.js) */
  function reparacion(e){
    var R = window.Reparaciones ? Reparaciones.de(e.id) : { taller:null, compras:null }, c = R.compras;
    return { t:R.taller, c:c, costo: c ? (c.repuestos || 0) + (c.mano || 0) : 0,
      estado: R.taller && window.Reparaciones ? Reparaciones.txtEstado(R.taller.estado) : '' };
  }
  function millones(v){ return v >= 1e6 ? '$' + g1(v / 1e6) + ' M' : peso(v); }

  /* ---------------- cálculos ---------------- */
  function laborales(desde, hasta){ var l = []; for (var f = desde; f <= hasta; f = sumar(f, 1)) if (laboral(f)) l.push(f); return l; }
  function paradoEl(D, cod, f){
    var t = null;
    D.eventos.forEach(function(e){ if (e.cod === cod && e.inicio <= f && (!e.fin || e.fin > f)) t = t === 'falla' ? t : e.tipo; });
    return t;
  }
  function maquinaria(){ return FLOTA.filter(function(f){ return f.grupo !== 'transporte'; }); }

  /* Disponibilidad de un período: días laborales × máquinas, menos los días parados */
  function disponibilidad(D, desde, hasta){
    var prog = laborales(desde, hasta), tot = 0, perd = 0;
    maquinaria().forEach(function(m){ prog.forEach(function(f){ tot++; if (paradoEl(D, m.cod, f)) perd++; }); });
    return { pct: tot ? (tot - perd) / tot * 100 : null, perdidos:perd, total:tot, dias:prog.length };
  }
  function fallasEntre(D, desde, hasta){
    return D.eventos.filter(function(e){ return e.tipo === 'falla' && e.inicio >= desde && e.inicio <= hasta && eq(e.cod) && !esCamion(e.cod); });
  }
  function duracion(e){ return dias(e.inicio, e.fin || sumar(hoy(), 1)); }

  /* Uso y preoperativos de un período: de los días-máquina disponibles,
     cuántos se trabajaron (programada, preoperativo o cierre) y de esos
     cuántos tuvieron preoperativo. */
  function uso(D, desde, hasta){
    var usos = window.Horometros ? Horometros.usos() : {}, U = { disp:0, usados:0, conPre:0, ociosas:{} };
    laborales(desde, hasta).forEach(function(f){
      maquinaria().forEach(function(m){
        if (paradoEl(D, m.cod, f)) return;
        U.disp++;
        var k = m.cod + '|' + f, trabajo = (D.prog[f] && D.prog[f][m.cod]) || usos[k] || D.pre[k];
        if (trabajo){ U.usados++; if (D.pre[k]) U.conPre++; }
        else U.ociosas[m.cod] = (U.ociosas[m.cod] || 0) + 1;
      });
    });
    U.pct = U.disp ? U.usados / U.disp * 100 : null;
    U.prePct = U.usados ? U.conPre / U.usados * 100 : null;
    return U;
  }

  /* Mantenimiento preventivo por ítem (Mtto y Fichas en maestros.js): lo
     que registra el Taller contra el horómetro de los operarios. Cuándo
     toca se proyecta con el uso real de cada máquina: horas (o km) de los
     cierres de jornada de los últimos 30 días ÷ días laborales. Lo que traía
     el preoperativo anterior no se toma. */
  function usoDiario(cod){
    var hy = hoy(), desde = sumar(hy, -30); if (desde < INICIO) desde = INICIO;
    var l = (window.Horometros ? Horometros.cierres() : []).filter(function(c){ return c.cod === cod && c.fecha >= desde && c.fecha <= hy && c.horas > 0; });
    var dl = laborales(desde, hy).length;
    if (l.length < 3 || !dl) return null;
    return l.reduce(function(a, c){ return a + c.horas; }, 0) / dl;
  }
  function enLaborales(n){ var f = hoy(); while (n > 0){ f = sumar(f, 1); if (laboral(f)) n--; } return f; }
  var SEMANA_MTTO = 6;           // días laborales: "le toca esta semana"
  function mantenimiento(){
    return FLOTA.map(function(m){
      var e = window.Mtto ? Mtto.estado(m.cod) : { nivel:'sindato', items:[] }, ud = usoDiario(m.cod);
      var dl = e.faltan == null ? null : e.faltan <= 0 ? 0 : ud ? Math.ceil(e.faltan / ud) : null;
      return { cod:m.cod, nombre:m.nombre, camion:m.grupo === 'transporte', nivel:e.nivel, faltan:e.faltan, unidad:e.unidad || 'h', que:e.que || '',
        actual:e.actual, proximo:e.proximo, modelo:e.modelo || '', nItems:(e.items || []).length, sinDato:e.sinDato || 0,
        usoDia:ud, diasL:dl, cuando: dl == null ? null : dl === 0 ? hoy() : enLaborales(dl) };
    });
  }
  function urgenteMtto(m){ return m.nivel === 'vencido' || (m.diasL != null && m.diasL <= SEMANA_MTTO) || m.nivel === 'proximo'; }
  function txtMtto(m){
    return m.nivel === 'vencido' ? 'vencido hace ' + g1(-m.faltan) + ' ' + m.unidad :
      'faltan ' + g1(m.faltan) + ' ' + m.unidad + (m.cuando ? ', hacia el ' + dcorta(m.cuando) : '');
  }

  /* Costo del taller de un período: lo que Compras registró en esas fechas,
     de reparaciones y de mantenimientos (Operacion.costoTaller en maestros.js,
     el mismo cálculo de Gerencia). */
  function costoTaller(D, desde, hasta){
    if (!window.Operacion || !Operacion.costoTaller) return { rep:0, prev:0, total:0, porMaq:{}, sinCosto:[], mttos:[] };
    return Operacion.costoTaller(D.eventos.map(function(e){ return { id:e.id, cod:e.cod }; }), desde, hasta, function(c){ return !!eq(c); });
  }

  /* Operación de un período: cumplimiento de la programación, horas por
     labor y horas y combustible por lote. Sale de los cierres de jornada que
     traen la labor y los lotes escogidos de la lista (desde el arranque de la
     captura nueva); los cierres con la labor escrita a mano no se reparten.
     Las horas de un cierre con varios lotes se reparten según las hectáreas;
     el combustible es lo despachado a cada máquina (Operacion en maestros.js). */
  var CUMPLE_OK = 85;
  function operacionDe(D, desde, hasta, CB){
    if (desde < INICIO) desde = INICIO;
    if (!window.Operacion) return { prog:0, cumplidas:0, conDato:0, porMaq:{}, sinProg:[], listaLabor:[], listaLotes:[], pct:null, horas:0, gal:0, costo:0,
      otraLabor:0, otrosLotes:0, noTrabajo:0, sinCierre:0, sinProgramar:0 };
    var usos = window.Horometros ? Horometros.usos() : {}, lista = [];
    Object.keys(D.cierres || {}).forEach(function(k){ D.cierres[k].forEach(function(c){ lista.push(c); }); });
    // lo despachado a cada máquina y camión de la flota (Operacion.combustible, el mismo de Gerencia)
    var comb = {}, todo = Operacion.combustible(D.tanq || [], desde, hasta);
    Object.keys(todo).forEach(function(c){ if (eq(c)) comb[c] = todo[c]; });
    return Operacion.calcular({ desde:desde, hasta:hasta, hoy:hoy(), maquinas:maquinaria().map(function(m){ return m.cod; }), prog:D.prog, cierres:lista,
      trabajo:function(cod, f){ return !!(D.pre[cod + '|' + f] || usos[cod + '|' + f]); }, parado:function(cod, f){ return !!paradoEl(D, cod, f); }, combustible:comb });
  }
  function laborTxt(id){ return window.laborTxt ? window.laborTxt(id) : LABORES[id] || id; }

  /* Combustible de un período (fechas aaaa-mm-dd): lo usan la pestaña
     Combustible (el mes) y el informe semanal (la semana), así no hay dos
     cálculos. El consumo sale de Combustible en maestros.js. */
  function combustibleDe(D, desdeF, hastaF){
    var C = window.Combustible, p = desdeF.split('-'), q = hastaF.split('-');
    var tsIni = new Date(+p[0], +p[1] - 1, +p[2]).getTime(), tsFin = Math.min(Date.now(), new Date(+q[0], +q[1] - 1, +q[2] + 1).getTime() - 1);
    var placas = {}; ((window.Maestros && Maestros.get('VEHICULOS')) || []).forEach(function(v){ placas[v.placa] = v.nombre || 'Vehículo'; });
    function destino(cod){ return eq(cod) ? (esCamion(cod) ? 'camion' : 'maquina') : placas[cod] ? 'vehiculo' : 'otro'; }
    function suma(l, k){ return l.reduce(function(a, t){ return a + (t[k] || 0); }, 0); }
    var TODOS = D.tanq.filter(function(t){ return !t.anulado; }), T = TODOS.filter(function(t){ return !t.dudoso; });
    var M = T.filter(function(t){ return t.ts >= tsIni && t.ts <= tsFin; });
    var movs = D.movs || [], precio = (movs.filter(function(m){ return m.tipo === 'LLEGADA' && m.precio > 0; }).pop() || {}).precio || 0;
    var R = { todos:TODOS, M:M, n:M.length, gal:suma(M, 'gal'), costo:suma(M, 'costo'), placas:placas,
      dudosos: TODOS.filter(function(t){ return t.dudoso && t.ts >= tsIni && t.ts <= tsFin; }) };
    if (!precio && R.gal) precio = R.costo / R.gal;
    R.precio = precio;
    // consumo por máquina en el período y lo normal de cada una (sus tanqueos anteriores)
    var cods = {}; M.forEach(function(t){ var dd = destino(t.cod); if (dd === 'maquina' || dd === 'camion') cods[t.cod] = true; });
    R.cons = Object.keys(cods).map(function(c){
      var a = C ? C.consumo(T, c, tsIni, tsFin) : { tasa:null }, nm = C ? C.normal(T, c, tsIni) : { tasa:null }, l = M.filter(function(t){ return t.cod === c; });
      var v = a.tasa != null && nm.tasa ? (a.km ? (nm.tasa - a.tasa) / nm.tasa * 100 : (a.tasa - nm.tasa) / nm.tasa * 100) : null;   // en km/gal, menos es peor
      return { cod:c, nombre:(eq(c) || {}).nombre || '', km:a.km, tasa:a.tasa, normal:nm.tasa, v:v, gal:suma(l, 'gal'), costo:suma(l, 'costo'), n:l.length,
        gH:a.gal, hH:a.avance, gN:nm.gal, hN:nm.avance };
    }).sort(function(a, b){ return b.gal - a.gal; });
    var gH = 0, hH = 0, gN = 0, hN = 0;
    R.cons.forEach(function(x){ if (x.km) return; if (x.tasa != null){ gH += x.gH; hH += x.hH; } if (x.normal != null){ gN += x.gN; hN += x.hN; } });
    R.tasa = hH >= 20 ? gH / hH : null; R.normal = hN >= 20 ? gN / hN : null;
    R.varTasa = R.tasa != null && R.normal ? (R.tasa - R.normal) / R.normal * 100 : null;
    R.raras = R.cons.filter(function(x){ return x.v != null && x.v > 25; }).sort(function(a, b){ return b.v - a.v; });
    R.comparables = R.cons.filter(function(x){ return x.v != null; }).length;
    // tanqueos que no cuadran con el trabajo de la máquina
    var usosH = window.Horometros ? Horometros.usos() : {};
    R.raros = M.filter(function(t){ var dd = destino(t.cod); return dd === 'maquina' || dd === 'camion'; }).map(function(t){
      var por = [], grave = false;
      if (paradoEl(D, t.cod, t.fecha)){ por.push('estaba en el taller ese día'); grave = true; }
      else if (destino(t.cod) === 'maquina' && !(D.prog[t.fecha] && D.prog[t.fecha][t.cod]) && !usosH[t.cod + '|' + t.fecha] && !D.pre[t.cod + '|' + t.fecha])
        por.push('sin programación, preoperativo ni cierre ese día');
      var tt = C ? C.deTanqueo(T, t) : null, nm = C ? C.normal(T, t.cod, t.ts) : { tasa:null };
      if (tt != null && nm.tasa){ var vv = t.tipo === 'km' ? nm.tasa / tt : tt / nm.tasa;
        if (vv > 1.6) por.push('gastó ' + g2(tt) + (t.tipo === 'km' ? ' km/gal' : ' gal/h') + ' (lo normal ' + g2(nm.tasa) + ')'); }
      return por.length ? { t:t, por:por, grave:grave } : null;
    }).filter(Boolean);
    // el combustible por labor y por lote sale de Operacion (operacionDe), con lo despachado a cada máquina
    // otros consumos: vehículos por placa y lo demás por tipo
    var otros = {};
    M.forEach(function(t){ var dd = destino(t.cod); if (dd !== 'vehiculo' && dd !== 'otro') return;
      var o = otros[t.cod] = otros[t.cod] || { cod:t.cod, nombre: placas[t.cod] || t.nom || t.cod, tipo:dd, n:0, gal:0, costo:0 };
      o.n++; o.gal += t.gal; o.costo += t.costo || t.gal * precio; });
    R.otros = Object.keys(otros).map(function(k){ return otros[k]; }).sort(function(a, b){ return b.gal - a.gal; });
    R.otrosGal = suma(R.otros, 'gal'); R.otrosCosto = suma(R.otros, 'costo');
    // cierres de Leanis en el período, y el tanque
    R.cierresTodos = movs.filter(function(m){ return m.cierre; });
    R.cierres = R.cierresTodos.filter(function(m){ return m.ts >= tsIni && m.ts <= tsFin; });
    R.faltante = R.cierres.reduce(function(a, m){ return a + (m.dif < 0 ? -m.dif : 0); }, 0);
    R.faltanteValor = R.faltante * precio;
    R.saldo = C && (movs.length || TODOS.length) ? C.saldo(movs, TODOS) : null;
    R.autonomia = C && R.saldo != null ? C.autonomia(TODOS, R.saldo) : null;
    R.llegadas = movs.filter(function(m){ return m.tipo === 'LLEGADA'; });
    // diferencia con el proveedor: lo medido con regleta en el carrotanque contra la orden (PR-ALM-01)
    R.llegadasPer = R.llegadas.filter(function(m){ return m.ts >= tsIni && m.ts <= tsFin; });
    R.difProv = R.llegadasPer.reduce(function(a, m){ return a + (m.esperado ? m.difProv : 0); }, 0);
    R.faltaProv = R.llegadasPer.reduce(function(a, m){ return a + (m.esperado && m.difProv < 0 ? -m.difProv : 0); }, 0);
    R.faltaProvValor = R.llegadasPer.reduce(function(a, m){ return a + (m.esperado && m.difProv < 0 ? -m.difProv * (m.precio || precio) : 0); }, 0);
    R.hayTanque = movs.length > 0;
    return R;
  }

  /* ---------------- indicadores ---------------- */
  function indicadores(D){
    var hy = hoy(), mesIni = hy.slice(0, 8) + '01';
    var pm = sumar(mesIni, -1), pmIni = pm.slice(0, 8) + '01';
    // el mismo tramo del mes anterior (del 1 al mismo día) para comparar lo que se acumula
    var pmMismo = sumar(pmIni, Math.min(dias(mesIni, hy), dias(pmIni, pm)));
    var nombreMes = MESES[+hy.slice(5, 7) - 1], nombrePrev = MESES[+pm.slice(5, 7) - 1];
    // el mes cuenta desde que arrancó el sistema nuevo; el mes anterior solo se compara si es todo del sistema nuevo
    var mesNuevo = mesIni >= INICIO, antes = pmIni >= INICIO;
    if (!mesNuevo) mesIni = INICIO;
    var delMes = mesNuevo ? 'de ' + nombreMes : 'desde el ' + dcorta(INICIO), enMes = mesNuevo ? 'en ' + nombreMes : 'desde el ' + dcorta(INICIO);
    var maq = maquinaria(), I = [];

    function ind(o){ I.push(o); return o; }

    /* 1. Hoy */
    var paradas = {};
    FLOTA.forEach(function(f){
      var a = D.eventos.filter(function(e){ return e.cod === f.cod && e.inicio <= hy && (!e.fin || e.fin > hy); })[0];
      if (a) paradas[f.cod] = a;
    });
    var trab = maq.filter(function(f){ return !paradas[f.cod]; });
    var pHoy = maq.length ? trab.length / maq.length * 100 : null;
    ind({ id:'hoy', grupo:'flota', titulo:'Máquinas trabajando hoy', valor: pHoy == null ? '—' : Math.round(pHoy) + '%',
      nivel: pHoy == null ? 'gris' : pHoy >= META ? 'verde' : pHoy >= 75 ? 'ambar' : 'rojo',
      linea: trab.length + ' de ' + maq.length + ' máquinas · meta ' + META + '%',
      detalle: maq.length - trab.length ? 'En taller: ' + maq.filter(function(f){ return paradas[f.cod]; }).map(function(f){ return f.cod; }).join(', ') : 'Ninguna en taller',
      barra: pHoy, meta: META });

    /* 2. Disponibilidad del mes y su tendencia */
    var mesesConDatos = [], tend = [];
    for (var i = 5; i >= 0; i--){
      var d0 = new Date(+hy.slice(0, 4), +hy.slice(5, 7) - 1 - i, 1), ini = iso(d0), fin = iso(new Date(d0.getFullYear(), d0.getMonth() + 1, 0));
      if (fin > hy) fin = hy;
      if (ini < INICIO) ini = INICIO;
      var sin = fin < INICIO;
      var x = sin ? null : disponibilidad(D, ini, fin).pct;
      tend.push({ mes: MESES[d0.getMonth()].slice(0, 3), v:x });
      if (x != null) mesesConDatos.push(x);
    }
    var dm = disponibilidad(D, mesIni, hy), dp = antes ? tend[4].v : null;
    ind({ id:'mes', grupo:'flota', titulo:'Disponibilidad ' + delMes, valor: dm.pct == null ? '—' : Math.round(dm.pct) + '%',
      nivel: dm.pct == null ? 'gris' : dm.pct >= META ? 'verde' : dm.pct >= 75 ? 'ambar' : 'rojo',
      linea: plural(dm.perdidos, 'día-máquina perdido', 'días-máquina perdidos') + ' de ' + dm.total,
      comp: dp == null ? '' : comparar(dm.pct, dp, ' puntos', false, nombrePrev), tend: mesesConDatos.length >= 2 ? tend : null, meta:META });

    /* 3. Paradas largas */
    var largas = Object.keys(paradas).map(function(c){ return { cod:c, d:dias(paradas[c].inicio, hy), e:paradas[c] }; })
      .sort(function(a, b){ return b.d - a.d; });
    var mas30 = largas.filter(function(x){ return x.d > 30; }), mas7 = largas.filter(function(x){ return x.d > 7; });
    ind({ id:'largas', grupo:'flota', titulo:'Paradas largas', valor: String(mas30.length),
      nivel: mas30.length ? 'rojo' : mas7.length ? 'ambar' : 'verde',
      linea: mas30.length ? plural(mas30.length, 'máquina lleva', 'máquinas llevan') + ' más de un mes en taller' : mas7.length ? 'Ninguna pasa de un mes; ' + plural(mas7.length, 'pasa', 'pasan') + ' de una semana' : 'Ninguna lleva más de una semana parada',
      detalle: largas.slice(0, 6).map(function(x){ return x.cod + ' · ' + plural(x.d, 'día', 'días'); }).join(' — '),
      accion: mas30.length ? 'Decidir con el taller: conseguir el repuesto, mandarla a taller externo o darla de baja. ' + mas30.map(function(x){ return x.cod + (x.e.txt ? ' (' + x.e.txt + ')' : ''); }).join('; ') + '.' : '',
      corta: mas30.length ? 'Decidir si se consigue el repuesto, se manda a taller externo o se da de baja: ' + mas30.map(function(x){
        var r = reparacion(x.e); return x.cod + ' (' + x.d + ' días' + (r.estado ? ', ' + r.estado.toLowerCase() : '') + (r.costo ? ', ' + millones(r.costo) : '') + ')'; }).join(', ') + '.' : '' });

    /* 3b. Reparaciones: en qué va cada parada y cuánto cuesta ponerlas a trabajar */
    var lr = Object.keys(paradas).map(function(c){ var e = paradas[c], r = reparacion(e); r.cod = c; r.d = dias(e.inicio, hy); r.e = e; return r; })
      .sort(function(a, b){ return b.d - a.d; });
    var sinEstado = lr.filter(function(x){ return !x.t && x.d >= 2; }), decision = lr.filter(function(x){ return x.t && x.t.estado === 'decision'; });
    var vencidas = lr.filter(function(x){ return x.t && x.t.sale && x.t.sale < hy; }), atrasados = lr.filter(function(x){ return x.c && x.c.llega && x.c.llega < hy; });
    var porCotizar = lr.filter(function(x){ return x.t && x.t.estado === 'repuesto' && !x.costo; });
    var cotizado = lr.reduce(function(a, x){ return a + x.costo; }, 0), conCosto = lr.filter(function(x){ return x.costo; }).length;
    var hayRep = !!window.Reparaciones && lr.some(function(x){ return x.t || x.c; });
    ind({ id:'reparaciones', grupo:'flota', titulo:'Reparaciones en curso', valor: cotizado ? millones(cotizado) : lr.length ? lr.filter(function(x){ return x.t; }).length + ' de ' + lr.length : '0',
      nivel: !lr.length ? 'verde' : (decision.length || vencidas.length || atrasados.length) ? 'rojo' : (sinEstado.length || porCotizar.length) ? 'ambar' : 'verde',
      linea: !lr.length ? 'Ninguna máquina en taller' : cotizado ? 'Cotizado para poner a trabajar ' + plural(conCosto, 'máquina', 'máquinas') + ' de ' + lr.length + ' paradas' :
        hayRep ? 'Paradas con estado de la reparación (sin costos todavía)' : 'Paradas sin decir en qué va la reparación',
      detalle: lr.slice(0, 7).map(function(x){ return x.cod + ': ' + (x.estado || 'sin decir en qué va') + (x.costo ? ' · ' + millones(x.costo) : '') +
        (x.t && x.t.sale ? ' · sale ' + dcorta(x.t.sale) : ''); }).join(' — '),
      accion: [decision.length ? 'Decidir si se reparan o se dan de baja: ' + decision.map(function(x){ return x.cod + ' (' + x.d + ' días' + (x.costo ? ', reparación ' + millones(x.costo) : ', sin cotizar') + ')'; }).join(', ') + '.' : '',
        vencidas.length ? 'Ya pasó la fecha en que debían salir: ' + vencidas.map(function(x){ return x.cod + ' (' + dcorta(x.t.sale) + ')'; }).join(', ') + '.' : '',
        atrasados.length ? 'Repuestos que no han llegado: ' + atrasados.map(function(x){ return x.cod + ' (' + (x.c.proveedor || 'proveedor') + ', ' + dcorta(x.c.llega) + ')'; }).join(', ') + '.' : '',
        porCotizar.length ? 'Compras no ha cotizado el repuesto de ' + porCotizar.map(function(x){ return x.cod; }).join(', ') + '.' : '',
        sinEstado.length ? 'El taller no ha dicho en qué va: ' + sinEstado.map(function(x){ return x.cod; }).join(', ') + '.' : ''].filter(Boolean).join(' ') });

    /* 4. Fallas del mes */
    var fm = fallasEntre(D, mesIni, hy), fp = antes ? fallasEntre(D, pmIni, pmMismo) : null;
    var mttr = fm.length ? fm.reduce(function(a, e){ return a + duracion(e); }, 0) / fm.length : null;
    ind({ id:'fallas', grupo:'flota', titulo:'Fallas nuevas ' + enMes, valor: String(fm.length),
      nivel: !fm.length ? 'verde' : (mttr > 15 ? 'rojo' : ((fp && fm.length > fp.length) || mttr > 5) ? 'ambar' : 'verde'),
      linea: mttr == null ? 'Sin fallas nuevas ' + enMes : 'Cada falla deja la máquina ' + g1(mttr) + ' días parada en promedio',
      comp: fp ? comparar(fm.length, fp.length, '', true, 'el mismo tramo de ' + nombrePrev, true) : '',
      detalle: fm.map(function(e){ return e.cod + ': ' + e.txt; }).slice(0, 4).join(' — ') });

    /* 5. Riesgo de parada: pendientes de máquinas que siguen trabajando */
    var pendTrab = D.pend.filter(function(n){ return eq(n.cod) && !paradas[n.cod]; });
    var urg = pendTrab.filter(function(n){ return n.urgente; }), reRep = pendTrab.filter(function(n){ return n.reportes >= 2; });
    ind({ id:'riesgo', grupo:'flota', titulo:'Riesgo de parada', valor: String(urg.length),
      nivel: urg.length ? 'rojo' : (reRep.length || pendTrab.length > 3) ? 'ambar' : 'verde',
      linea: urg.length ? plural(urg.length, 'máquina trabaja', 'máquinas trabajan') + ' con un daño urgente sin arreglar' :
        pendTrab.length ? 'Ningún daño urgente; ' + plural(pendTrab.length, 'pendiente menor', 'pendientes menores') : 'Ninguna máquina trabaja con daños pendientes',
      detalle: urg.concat(reRep.filter(function(n){ return !n.urgente; })).slice(0, 4).map(function(n){
        return n.cod + ': ' + n.txt + (n.reportes >= 2 ? ' (lo han reportado ' + n.reportes + ' veces)' : ''); }).join(' — '),
      accion: urg.length ? 'Programar el arreglo antes de que la deje parada: ' + urg.map(function(n){ return n.cod + ' (' + n.txt + ')'; }).join('; ') + '.' :
        reRep.length ? 'Los operarios siguen reportando lo mismo: ' + reRep.map(function(n){ return n.cod; }).join(', ') + '.' : '' });

    /* 6. La misma falla otra vez (misma máquina y sistema, 2 o más en 90 días) */
    var g = {}, desdeRep = sumar(hy, -DIAS_REPETIDAS);
    D.eventos.forEach(function(e){
      if (e.tipo !== 'falla' || !e.sistema || !eq(e.cod) || esCamion(e.cod) || e.inicio < desdeRep) return;
      (g[e.cod + '|' + e.sistema] = g[e.cod + '|' + e.sistema] || []).push(e);
    });
    var rep = Object.keys(g).filter(function(k){ return g[k].length >= 2; }).map(function(k){ return { cod:k.split('|')[0], sis:SISTEMAS[k.split('|')[1]] || 'Otro', n:g[k].length }; });
    ind({ id:'repetidas', grupo:'flota', titulo:'Fallas que se repiten', valor: String(rep.length),
      nivel: !rep.length ? 'verde' : rep.some(function(x){ return x.n >= 3; }) ? 'rojo' : 'ambar',
      linea: rep.length ? 'La misma máquina con la misma falla en 3 meses' : 'Ninguna falla repetida en los últimos 3 meses',
      detalle: rep.map(function(x){ return x.cod + ' · ' + x.sis + ' (' + x.n + ' veces)'; }).join(' — '),
      accion: rep.length ? 'La reparación no está quedando bien o hay una causa de fondo: ' + rep.map(function(x){ return x.cod + ' ' + x.sis.toLowerCase(); }).join(', ') + '.' : '' });

    /* 7. Mantenimiento preventivo: vencido, lo que toca esta semana (con el uso real) y lo que falta registrar */
    var mt = mantenimiento(), conDato = mt.filter(function(m){ return m.nivel !== 'sindato' && m.nivel !== 'sinhorometro'; });
    var venc = mt.filter(function(m){ return m.nivel === 'vencido'; }), semana = mt.filter(function(m){ return m.nivel !== 'vencido' && urgenteMtto(m); });
    var sinReg = mt.filter(function(m){ return m.nivel === 'sindato'; });
    ind({ id:'mtto', grupo:'flota', titulo:'Mantenimiento preventivo', valor: conDato.length ? String(venc.length) : '—',
      nivel: !conDato.length ? 'gris' : venc.length ? 'rojo' : semana.length ? 'ambar' : 'verde',
      linea: !conDato.length ? 'Sin registrar todavía en el Taller' :
        venc.length ? plural(venc.length, 'máquina con el mantenimiento vencido', 'máquinas con el mantenimiento vencido') + (semana.length ? ' · ' + semana.length + ' más esta semana' : '') :
        semana.length ? plural(semana.length, 'máquina le toca', 'máquinas les toca') + ' esta semana' : 'Al día: a ninguna le toca esta semana',
      detalle: [venc.concat(semana).map(function(m){ return m.cod + ' ' + (m.que || 'mantenimiento') + ' (' + txtMtto(m) + ')'; }).join(' — '),
        sinReg.length ? plural(sinReg.length, 'máquina', 'máquinas') + ' sin mantenimiento registrado: ' + sinReg.map(function(m){ return m.cod; }).join(', ') : ''].filter(Boolean).join('. '),
      accion: venc.length ? 'Hacer el mantenimiento y registrarlo en el Taller: ' + venc.map(function(m){ return m.cod + ' (' + (m.que || 'mantenimiento') + ')'; }).join(', ') + '. Una máquina sin mantenimiento es la próxima en parar.' :
        semana.length ? 'Programar esta semana: ' + semana.map(function(m){ return m.cod + (m.cuando ? ' hacia el ' + dcorta(m.cuando) : ''); }).join(', ') + ', y tener los filtros y aceites (Compras).' : '' });

    /* 7b. Costo del taller del mes: reparaciones + preventivo (Compras) */
    var CT = costoTaller(D, mesIni, hy), CTp = antes ? costoTaller(D, pmIni, pmMismo) : null;
    var viejosSin = CT.sinCosto.filter(function(m){ return dias(m.fecha, hy) > 3; });
    var topC = Object.keys(CT.porMaq).map(function(c){ var x = CT.porMaq[c]; return { cod:c, v:x.rep + x.prev }; }).sort(function(a, b){ return b.v - a.v; });
    ind({ id:'costotaller', grupo:'flota', titulo:'Costo del taller ' + delMes, valor: CT.total ? millones(CT.total) : CT.mttos.length || lr.length ? '$0' : '—',
      nivel: !CT.total && !CT.mttos.length && !lr.length ? 'gris' : viejosSin.length ? 'ambar' : 'verde',
      linea: CT.total ? 'Reparaciones ' + millones(CT.rep) + ' · preventivo ' + millones(CT.prev) : 'Compras todavía no ha registrado costos ' + enMes,
      comp: CTp && CTp.total ? comparar(CT.total, CTp.total, '', true, 'el mismo tramo de ' + nombrePrev, true).replace(/ftc-c (mejor|peor)/, 'ftc-c igual') : '',
      detalle: [topC.slice(0, 4).map(function(x){ return x.cod + ' ' + millones(x.v); }).join(' — '),
        CT.sinCosto.length ? plural(CT.sinCosto.length, 'mantenimiento', 'mantenimientos') + ' sin costo de Compras' : ''].filter(Boolean).join('. '),
      accion: viejosSin.length ? 'Compras no ha puesto el costo de ' + plural(viejosSin.length, 'mantenimiento', 'mantenimientos') + ' de hace más de 3 días: ' + viejosSin.map(function(m){ return m.cod + ' ' + dcorta(m.fecha); }).join(', ') + '.' : '' });

    /* 8. Uso de las máquinas disponibles */
    var u = uso(D, mesIni, hy);
    var ociosas = Object.keys(u.ociosas).map(function(c){ return { cod:c, n:u.ociosas[c] }; }).sort(function(a, b){ return b.n - a.n; });
    ind({ id:'uso', grupo:'operacion', titulo:'Uso de la maquinaria', valor: u.pct == null ? '—' : Math.round(u.pct) + '%',
      nivel: u.pct == null ? 'gris' : u.pct >= 80 ? 'verde' : u.pct >= 60 ? 'ambar' : 'rojo',
      linea: u.pct == null ? 'Sin programación registrada' : 'De los días en que la máquina estaba buena, los que tienen trabajo registrado (programación, preoperativo o cierre)',
      detalle: ociosas.length ? 'Días buenas sin ningún registro: ' + ociosas.slice(0, 5).map(function(x){ return x.cod + ' (' + x.n + ')'; }).join(', ') : '',
      accion: u.pct != null && u.pct < 80 && ociosas.length ? 'Máquinas buenas sin trabajo registrado: ' + ociosas.slice(0, 3).map(function(x){ return x.cod; }).join(', ') + '. O están quietas (¿se necesitan todas?) o están trabajando sin preoperativo ni programación.' : '' });

    /* 9. Preoperativos */
    var preHoy = trab.filter(function(f){ return D.pre[f.cod + '|' + hy]; }).length;
    var progHoy = trab.filter(function(f){ return D.prog[hy] && D.prog[hy][f.cod]; }).length;
    ind({ id:'preop', grupo:'operacion', titulo:'Preoperativos', valor: u.prePct == null ? '—' : Math.round(u.prePct) + '%',
      nivel: u.prePct == null ? 'gris' : u.prePct >= 90 ? 'verde' : u.prePct >= 70 ? 'ambar' : 'rojo',
      linea: 'De los días trabajados ' + enMes + ', con revisión antes de arrancar',
      detalle: laboral(hy) ? 'Hoy: ' + preHoy + ' preoperativos' + (progHoy ? ' de ' + progHoy + ' máquinas programadas' : '') : 'Hoy no es día laboral',
      accion: u.prePct != null && u.prePct < 90 ? 'Hay máquinas saliendo sin revisión: así no se ven a tiempo los daños.' : '' });

    /* 10–12b. Combustible (combustibleDe: el mismo cálculo del informe semanal) */
    var CB = combustibleDe(D, mesIni, hy), M = CB.M, galM = CB.gal, costoM = CB.costo, dud = CB.dudosos;
    var P = antes ? CB.todos.filter(function(t){ return !t.dudoso && t.fecha >= pmIni && t.fecha <= pmMismo; }) : [];
    var galP = P.reduce(function(a, t){ return a + t.gal; }, 0), tasaM = CB.tasa, varTasa = CB.varTasa;
    ind({ id:'comb', grupo:'combustible', titulo:'Combustible ' + delMes, valor: CB.todos.length ? g1(galM) + ' gal' : '—',
      nivel: !CB.todos.length ? 'gris' : varTasa == null ? 'verde' : varTasa > 50 ? 'rojo' : varTasa > 25 ? 'ambar' : 'verde',   // misma regla que por máquina
      linea: !CB.todos.length ? 'Todavía no hay tanqueos en la app de Tanqueo' : plural(M.length, 'tanqueo', 'tanqueos') + (costoM ? ' · ' + peso(costoM) : '') +
        (tasaM != null ? ' · ' + g2(tasaM) + ' gal por hora de máquina' : ''),
      comp: (galP ? comparar(galM, galP, ' gal', true, 'el mismo tramo de ' + nombrePrev, true, 1).replace(/ftc-c (mejor|peor)/, 'ftc-c igual') : '') +
        (dud.length ? '<div class="ftc-c igual">No se contó ' + (dud.length === 1 ? 'un tanqueo mal digitado' : dud.length + ' tanqueos mal digitados') + ': ' +
          dud.map(function(t){ return t.cod + ' ' + dcorta(t.fecha) + ' (' + g1(t.gal) + ' gal)'; }).join(', ') + '</div>' : '') +
        (varTasa != null ? '<div class="ftc-c ' + (varTasa > 25 ? 'peor' : varTasa < -5 ? 'mejor' : 'igual') + '">' + (Math.abs(varTasa) < 5 ? 'Consumo por hora normal' : 'Consumo por hora ' + (varTasa > 0 ? '▲ ' : '▼ ') + Math.round(Math.abs(varTasa)) + '% vs. lo normal') + '</div>' : '') });

    /* 11. Consumo fuera de lo normal por máquina */
    var raras = CB.raras;
    ind({ id:'consumo', grupo:'combustible', titulo:'Consumo fuera de lo normal', valor: CB.comparables ? String(raras.length) : '—',
      nivel: raras.some(function(x){ return x.v > 50; }) ? 'rojo' : raras.length ? 'ambar' : CB.comparables ? 'verde' : 'gris',
      linea: raras.length ? plural(raras.length, 'máquina gasta', 'máquinas gastan') + ' más de lo normal' :
        CB.comparables ? 'Cada máquina gasta lo de siempre' : 'Se compara cuando cada máquina tenga al menos 3 tanqueos anteriores',
      detalle: raras.map(function(x){ return x.cod + ': ' + g2(x.tasa) + (x.km ? ' km/gal' : ' gal/h') + ' (lo normal ' + g2(x.normal) + ')'; }).join(' — '),
      accion: raras.length ? 'Revisar si es el motor (filtros, inyección), el trabajo que hizo o el combustible que se le está entregando: ' + raras.map(function(x){ return x.cod; }).join(', ') + '.' : '' });

    /* 11b. Tanqueos que no cuadran con el trabajo */
    var raros = CB.raros;
    ind({ id:'tqraros', grupo:'combustible', titulo:'Tanqueos que no cuadran', valor: M.length ? String(raros.length) : '—',
      nivel: !M.length ? 'gris' : raros.some(function(x){ return x.grave; }) ? 'rojo' : raros.length ? 'ambar' : 'verde',
      linea: !M.length ? 'Todavía no hay tanqueos ' + enMes : raros.length ? 'Combustible que no cuadra con el trabajo de la máquina' : 'Todo el combustible coincide con el trabajo registrado',
      detalle: raros.slice(0, 4).map(function(x){ return x.t.cod + ' ' + dcorta(x.t.fecha) + ' (' + g1(x.t.gal) + ' gal): ' + x.por.join('; '); }).join(' — '),
      accion: raros.length ? 'Pedirle a Leanis la explicación de ' + plural(raros.length, 'tanqueo', 'tanqueos') + ' que no cuadran con el trabajo (están en la pestaña Combustible).' : '' });

    /* 12. Tanque del almacén: saldo, autonomía, requisición y cierres de Leanis */
    var saldo = CB.saldo, aut = CB.autonomia, cierresL = CB.cierresTodos, faltante = CB.faltante, precioV = CB.precio;
    var reqAb = D.alertas.filter(function(a){ return a.abierta; });
    var hayTanque = CB.hayTanque || D.alertas.length;
    var limFalt = Math.max(10, galM * 0.02);
    ind({ id:'tanque', grupo:'combustible', titulo:'Tanque del almacén', valor: saldo == null ? '—' : g1(saldo) + ' gal',
      nivel: !hayTanque ? 'gris' : faltante > limFalt ? 'rojo' : (reqAb.length || faltante > 0 || CB.faltaProv > 0 || (aut && aut.dias != null && aut.dias < 5)) ? 'ambar' : 'verde',
      linea: !hayTanque ? 'Sin movimientos del tanque todavía' : (aut && aut.dias != null ? 'Alcanza para ' + Math.round(aut.dias) + ' días' : 'Sin consumo reciente para calcular autonomía') +
        (CB.cierres.length ? ' · ' + (faltante > 0 ? 'faltaron ' + g1(faltante) + ' gal cuando se vació' : 'cuadró cuando se vació') : '') +
        (CB.faltaProv > 0 ? ' · el proveedor entregó ' + g1(CB.faltaProv) + ' gal menos' : ''),
      detalle: [reqAb.length ? 'Requisición de combustible abierta desde el ' + dcorta(reqAb[reqAb.length - 1].fecha) : '',
        cierresL.length ? 'Último cierre ' + dcorta(cierresL[cierresL.length - 1].fecha) + ': ' + (cierresL[cierresL.length - 1].dif ? (cierresL[cierresL.length - 1].dif > 0 ? '+' : '') + g1(cierresL[cierresL.length - 1].dif) + ' gal' : 'cuadró') : 'Se cuadra cuando el tanque se vacía (todavía no ha pasado)',
        CB.llegadasPer.length ? 'Llegadas: ' + CB.llegadasPer.map(function(m){ return dcorta(m.fecha) + ' ' + g1(m.gal) + ' gal' + (m.esperado ? (m.difProv ? ' (' + (m.difProv > 0 ? '+' : '') + g1(m.difProv) + ' vs. orden)' : ' (completo)') : ''); }).join(', ') : ''].filter(Boolean).join(' — '),
      accion: faltante > limFalt ? 'Cuando el tanque se vació faltaban ' + g1(faltante) + ' gal' + (precioV ? ' (' + peso(faltante * precioV) + ')' : '') + ' que no están en ningún despacho. Revisar las explicaciones de Leanis.' :
        CB.faltaProv > 0 ? 'El proveedor entregó ' + g1(CB.faltaProv) + ' gal menos de lo ordenado' + (CB.faltaProvValor ? ' (' + peso(CB.faltaProvValor) + ')' : '') + ' según la regleta: hacer el reclamo con la remisión firmada.' :
        reqAb.length ? 'El tanque está bajo y la requisición sigue abierta: confirmar la compra.' : '' });

    /* 13. Programación de hoy */
    var progD = D.prog[hy] || {}, progTaller = Object.keys(progD).filter(function(c){ return paradas[c]; });
    var sinProg = trab.filter(function(f){ return !progD[f.cod]; });
    // preoperativo hecho por un operario distinto al programado: la programación cruzó a alguien
    function nombres(t){ return String(t || '').split('/').map(function(x){ return x.trim(); }).filter(Boolean); }
    var cruces = Object.keys(progD).map(function(c){
      var pr = D.pre[c + '|' + hy], prog = nombres(progD[c].op), hizo = pr ? nombres(pr.op) : [];
      var otros = hizo.filter(function(n){ return prog.length && prog.map(function(x){ return x.toLowerCase(); }).indexOf(n.toLowerCase()) < 0; });
      return otros.length ? { cod:c, prog:prog, otros:otros } : null;
    }).filter(Boolean);
    ind({ id:'proghoy', grupo:'operacion', titulo:'Programación de hoy', valor: laboral(hy) ? progHoy + ' de ' + trab.length : '—',
      nivel: !laboral(hy) ? 'gris' : !Object.keys(progD).length ? 'ambar' : (cruces.length || progHoy < trab.length * 0.8) ? 'ambar' : 'verde',
      linea: !laboral(hy) ? 'Hoy no es día laboral' : !Object.keys(progD).length ? 'Hoy no hay programación registrada' : 'Máquinas buenas con labor asignada hoy',
      detalle: [sinProg.length && Object.keys(progD).length ? 'Buenas sin programar: ' + sinProg.map(function(f){ return f.cod; }).join(', ') : '',
        cruces.length ? 'Preoperativo de otro operario: ' + cruces.map(function(x){ return x.cod + ' (programado ' + x.prog.join(' / ') + ', lo hizo ' + x.otros.join(' / ') + ')'; }).join('; ') : '',
        progTaller.length ? 'En espera, todavía en el taller: ' + progTaller.join(', ') : ''].filter(Boolean).join(' — '),
      accion: cruces.length ? 'Revisar la programación de hoy: el preoperativo lo hizo otro operario en ' + cruces.map(function(x){ return x.cod; }).join(', ') +
        '. O la programación cruzó a los operarios, o alguien está en la máquina equivocada.' : '' });
    var cruceDe = {}; cruces.forEach(function(x){ cruceDe[x.cod] = x; });

    /* 14. Horas trabajadas (horómetro del cierre de jornada) */
    var cier = window.Horometros ? Horometros.cierres() : [];
    function horas(desde, hasta){
      var o = { t:0, p:{}, dias:0 };
      cier.forEach(function(c){
        if (c.fecha < desde || c.fecha > hasta || c.horas == null || !eq(c.cod) || esCamion(c.cod)) return;
        o.t += c.horas; o.dias++; o.p[c.cod] = (o.p[c.cod] || 0) + c.horas;
      });
      return o;
    }
    var hM = horas(mesIni, hy), hP = antes ? horas(pmIni, pmMismo) : { t:0, p:{}, dias:0 }, hDia = hM.dias ? hM.t / hM.dias : null;
    ind({ id:'horas', grupo:'operacion', titulo:'Horas trabajadas ' + enMes, valor: hM.t ? g1(hM.t) + ' h' : '—',
      nivel: !hM.t ? 'gris' : (hP.t && hM.t < hP.t * 0.8) || hDia < 5 ? 'ambar' : 'verde',
      linea: !hM.t ? 'Sin cierres de jornada con horómetro' : 'Promedio ' + g1(hDia) + ' h por máquina en cada jornada',
      comp: hP.t ? comparar(hM.t, hP.t, ' h', false, 'el mismo tramo de ' + nombrePrev, true, 1) : '',
      detalle: hDia != null && hDia < 5 ? 'Jornadas cortas: menos de 5 horas de motor por máquina al día.' : '' });

    /* 14b. Cumplimiento de la programación (cierres con la labor escogida de la lista) */
    var OP = operacionDe(D, mesIni, hy, CB);
    var noCumple = Object.keys(OP.porMaq).map(function(c){ return OP.porMaq[c]; }).filter(function(x){ return x.prog && x.cumplidas < x.prog; })
      .sort(function(a, b){ return (a.cumplidas / a.prog) - (b.cumplidas / b.prog); });
    ind({ id:'cumple', grupo:'operacion', titulo:'Cumplimiento de la programación', valor: OP.pct == null || !OP.conDato ? '—' : Math.round(OP.pct) + '%',
      nivel: OP.pct == null || !OP.conDato ? 'gris' : OP.pct >= CUMPLE_OK ? 'verde' : OP.pct >= 70 ? 'ambar' : 'rojo',
      linea: !OP.conDato ? 'Se mide con los cierres de jornada que traen la labor (versión nueva del Preoperativo)' :
        OP.cumplidas + ' de ' + plural(OP.prog, 'máquina-día programada', 'máquinas-día programadas') + ' hicieron lo programado',
      detalle: [OP.otraLabor ? plural(OP.otraLabor, 'hizo otra labor', 'hicieron otra labor') : '', OP.otrosLotes ? OP.otrosLotes + ' en otros lotes' : '',
        OP.noTrabajo ? OP.noTrabajo + ' no trabajaron' : '', OP.sinCierre ? OP.sinCierre + ' sin cierre' : '',
        OP.sinProgramar ? plural(OP.sinProgramar, 'trabajó sin programar', 'trabajaron sin programar') : ''].filter(Boolean).join(' · '),
      accion: OP.conDato && OP.pct != null && OP.pct < CUMPLE_OK && noCumple.length ? 'Revisar con los supervisores por qué no se cumple lo programado: ' +
        noCumple.slice(0, 4).map(function(x){ return x.cod + ' (' + x.cumplidas + ' de ' + x.prog + ')'; }).join(', ') + '.' : '' });

    /* 15. Preoperativo viejo todavía en uso: lo que manda no llega al Taller */
    var V = D.viejo;
    if (V && (V.preop.length || V.nov.length || V.tanq.length)){
      ind({ id:'appvieja', grupo:'operacion', titulo:'Preoperativo viejo en uso', valor:String(V.personas.length),
        nivel: V.nov.length ? 'rojo' : 'ambar',
        linea: plural(V.personas.length, 'celular sigue', 'celulares siguen') + ' con la app anterior: lo que mandan no llega al Taller',
        detalle: V.personas.map(function(g){ return (g.op || 'Sin nombre') + ' (' + g.cods.join(', ') + ', ' + dcorta(g.ultima) + ')'; }).join(' — ') +
          (V.nov.length ? '. Daños reportados ahí: ' + V.nov.map(function(x){ return x.cod + ' ' + (x.txt || x.items); }).join('; ') : ''),
        accion: 'Pedirle a ' + V.personas.map(function(g){ return g.op || 'quien la usa'; }).join(', ') + ' abrir el Preoperativo con señal para que se actualice' +
          (V.nov.length ? ', y que el Taller pase ' + (V.nov.length === 1 ? 'el daño que reportó' : 'los ' + V.nov.length + ' daños que reportaron') + ' como pendiente (aparece en el aviso del Taller).' : '.') });
    }

    /* ---- detalle para las pestañas ---- */
    var labM = laborales(mesIni, hy), desde90 = sumar(hy, -90), cierHoy = {};
    cier.forEach(function(c){ if (c.fecha === hy) cierHoy[c.cod] = (cierHoy[c.cod] || 0) + (c.horas || 0); });
    var porMtto = {}; mt.forEach(function(m){ porMtto[m.cod] = m; });
    var X = { mes: mesNuevo ? nombreMes : 'desde el ' + dcorta(INICIO), enMes:enMes, corto: mesNuevo ? nombreMes.slice(0, 3) : 'desde ' + dcorta(INICIO), maquinas: FLOTA.map(function(f){
      var perd = { falla:0, mantenimiento:0 };
      labM.forEach(function(d){ var t = paradoEl(D, f.cod, d); if (t) perd[t]++; });
      var par = paradas[f.cod], pend = D.pend.filter(function(n){ return n.cod === f.cod; });
      var k = f.cod + '|' + hy;
      return { cod:f.cod, nombre:f.nombre, camion:f.grupo === 'transporte',
        // días en taller desde la fecha de parada que registró el Taller (como lo cuenta el Taller)
        enTaller: par ? Math.max(0, dias(par.inicio, hy)) : null, desdeTaller: par ? par.inicio : null,
        tipoParada: par ? par.tipo : null,
        hoy: par ? (function(){ var r = reparacion(par);
            return { c:'rojo', t:'En taller · ' + plural(Math.max(0, dias(par.inicio, hy)), 'día', 'días'),
              d: (r.estado || 'Sin decir en qué va') + (r.costo ? ' · ' + millones(r.costo) : '') + (r.t && r.t.sale ? ' · sale ' + dcorta(r.t.sale) : '') + (par.txt ? ' — ' + par.txt : '') }; })() :
          pend.some(function(n){ return n.urgente; }) ? { c:'ambar', t:'Trabaja con daño urgente', d:pend[0].txt } :
          pend.length ? { c:'ambar', t:'Trabaja con pendiente', d:pend[0].txt } : { c:'verde', t:'Trabaja', d:'' },
        disp: labM.length ? (labM.length - perd.falla - perd.mantenimiento) / labM.length * 100 : null, perdF:perd.falla, perdM:perd.mantenimiento,
        fallas90: D.eventos.filter(function(e){ return e.cod === f.cod && e.tipo === 'falla' && e.inicio >= desde90; }).length,
        mtto: porMtto[f.cod] || null, pend:pend.length,
        prog: progD[f.cod] || null, pre: D.pre[k] || null, cierre: cierHoy[f.cod] != null ? cierHoy[f.cod] : null, horasMes: hM.p[f.cod] || 0,
        cierres: (D.cierres || {})[k] || [], cruce: cruceDe[f.cod] || null };
    }) };
    var sis = {};
    D.eventos.forEach(function(e){
      if (e.tipo !== 'falla' || e.inicio < desde90 || !eq(e.cod) || esCamion(e.cod)) return;
      var k = e.fin ? (SISTEMAS[e.sistema] || 'Otro') : 'Sin alta todavía';
      var x = sis[k] = sis[k] || { k:k, n:0, d:0 }; x.n++; x.d += duracion(e);
    });
    X.sistemas = Object.keys(sis).map(function(k){ return sis[k]; }).sort(function(a, b){ return b.n - a.n || b.d - a.d; });
    X.mtto = mt.slice().sort(function(a, b){
      var o = function(m){ return m.nivel === 'vencido' ? m.faltan - 1e6 : m.faltan != null ? (m.diasL != null ? m.diasL : 500) * 1000 + m.faltan : m.nivel === 'sinhorometro' ? 1e8 : 2e8; };
      return o(a) - o(b); });
    X.costo = topC.map(function(x){ var c = CT.porMaq[x.cod]; return { cod:x.cod, rep:c.rep, prev:c.prev, v:x.v }; });
    X.mttos = (window.Mantenimientos ? Mantenimientos.todos() : []).filter(function(m){ return m.fecha >= INICIO && eq(m.cod); }).slice(0, 8).map(function(m){
      var c = window.Reparaciones ? Reparaciones.de(m.id).compras : null;
      return { cod:m.cod, fecha:m.fecha, h:m.h, por:m.por, que:(m.items || []).map(function(i){ return i.comp; }).join(', '), costo: c ? (c.repuestos || 0) + (c.mano || 0) : 0 }; });
    X.op = { labor:OP.listaLabor, lotes:OP.listaLotes.slice(0, 20), nLotes:OP.listaLotes.length, horas:OP.horas, gal:OP.gal, costo:OP.costo,
      porMaq:Object.keys(OP.porMaq).map(function(c){ return OP.porMaq[c]; }).sort(function(a, b){ return b.prog - a.prog; }), sinProg:OP.sinProg.slice(-8).reverse(),
      conDato:OP.conDato, precio:CB.precio };
    X.comb = CB.cons; X.raros = CB.raros; X.precio = CB.precio; X.labor = OP.listaLabor.filter(function(x){ return x.gal; }); X.otros = CB.otros;
    X.cierres = CB.cierresTodos.slice().reverse().slice(0, 8);
    X.llegadas = CB.llegadas.slice().reverse().slice(0, 6);
    return { I:I, X:X };
  }

  /* diferencia contra otro período */
  function comparar(a, b, unidad, menosEsMejor, contra, absoluto, dec){
    if (a == null || b == null) return '';
    var d = a - b, r = dec ? Math.round(d * 10) / 10 : Math.round(d);
    if (!r) return '<div class="ftc-c igual">= igual que ' + contra + '</div>';
    var mejor = menosEsMejor ? r < 0 : r > 0;
    return '<div class="ftc-c ' + (mejor ? 'mejor' : 'peor') + '">' + (r > 0 ? '▲ ' : '▼ ') + String(Math.abs(r)).replace('.', ',') + unidad + ' vs. ' + contra + '</div>';
  }

  /* ---------------- pintar ---------------- */
  var NIV = { rojo:{ t:'Alarma', o:0 }, ambar:{ t:'Atención', o:1 }, verde:{ t:'Bien', o:2 }, gris:{ t:'Sin datos', o:3 } };
  var GRUPOS = [['flota', 'La flota'], ['operacion', 'La operación'], ['combustible', 'Combustible']];

  function tarjeta(x){
    var h = '<div class="ftc ' + x.nivel + '" data-ind="' + x.id + '"><div class="ftc-h"><span class="ftc-t">' + esc(x.titulo) + '</span><span class="ftc-p">' + NIV[x.nivel].t + '</span></div>' +
      '<div class="ftc-v">' + esc(x.valor) + '</div><div class="ftc-l">' + esc(x.linea) + '</div>';
    if (x.barra != null) h += '<div class="ftc-b"><i style="width:' + Math.max(0, Math.min(100, x.barra)) + '%"></i><u style="left:' + x.meta + '%"></u></div>';
    if (x.tend){
      h += '<div class="ftc-tend">' + x.tend.map(function(m){
        var alto = m.v == null ? 0 : Math.max(4, (m.v - 50) * 2);
        return '<span title="' + m.mes + (m.v == null ? ': sin datos' : ': ' + Math.round(m.v) + '%') + '"><i class="' + (m.v == null ? 'na' : m.v >= META ? 'ok' : m.v >= 75 ? 'al' : 'ma') + '" style="height:' + alto + '%"></i><b>' + m.mes + '</b></span>';
      }).join('') + '</div>';
    }
    if (x.comp) h += x.comp;
    if (x.detalle) h += '<div class="ftc-d">' + esc(x.detalle) + '</div>';
    return h + '</div>';
  }

  /* ---- piezas ---- */
  function tabla(cols, filas, vacio){
    if (!filas.length) return '<div class="ft-vacio">' + esc(vacio || 'Sin datos.') + '</div>';
    return '<div class="ft-tabla"><table><thead><tr>' + cols.map(function(c){ return '<th' + (c.n ? ' class="n"' : '') + '>' + c.t + '</th>'; }).join('') + '</tr></thead><tbody>' +
      filas.map(function(f){ return '<tr>' + f.map(function(v, i){ return '<td' + (cols[i].n ? ' class="n"' : '') + '>' + v + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  /* barras horizontales de una sola serie, con el valor escrito al lado */
  function barras(l, clase, vacio, ancho){
    if (!l.length) return '<div class="ft-vacio">' + esc(vacio) + '</div>';
    var max = Math.max.apply(null, l.map(function(x){ return x.v; })) || 1;
    return '<div class="ft-bars' + (ancho ? ' ancho' : '') + '">' + l.map(function(x){
      return '<div class="ft-bar" title="' + esc(x.t || '') + '"><span class="k">' + esc(x.k) + '</span><span class="tr"><i class="' + clase + '" style="width:' + Math.max(2, x.v / max * 100) + '%"></i></span><span class="v">' + esc(x.lbl) + '</span></div>';
    }).join('') + '</div>';
  }
  function bloque(titulo, ayuda, cuerpo){
    return '<div class="panel ft-blq"><div class="panel-title">' + titulo + '</div>' + (ayuda ? '<div class="panel-sub">' + ayuda + '</div>' : '') + cuerpo + '</div>';
  }
  function pill(c, t){ return '<span class="ft-pill ' + c + '">' + esc(t) + '</span>'; }
  function maq(m){ return '<b class="ft-cod">' + esc(m.cod) + '</b> <span class="ft-nom">' + esc(m.nombre || '') + '</span>'; }
  function peor(l){ return l.some(function(x){ return x.nivel === 'rojo'; }) ? 'rojo' : l.some(function(x){ return x.nivel === 'ambar'; }) ? 'ambar' :
    l.some(function(x){ return x.nivel === 'verde'; }) ? 'verde' : 'gris'; }

  var TABS = [['resumen', 'Resumen'], ['flota', 'Flota'], ['operacion', 'Operación'], ['combustible', 'Combustible']];
  var TAB = (function(){ try { return localStorage.getItem('ft_tab') || 'resumen'; } catch(e){ return 'resumen'; } })();
  var ULT = null;

  function pResumen(I){
    var rojos = I.filter(function(x){ return x.nivel === 'rojo'; }), ambar = I.filter(function(x){ return x.nivel === 'ambar'; });
    var acciones = rojos.concat(ambar).filter(function(x){ return x.accion; });
    var clave = { flota:['hoy', 'mes'], operacion:['proghoy', 'cumple'], combustible:['comb', 'tanque'] };
    var h = '<div class="ft-areas">' + GRUPOS.map(function(gr){
      var l = I.filter(function(x){ return x.grupo === gr[0]; }), n = peor(l);
      var r = l.filter(function(x){ return x.nivel === 'rojo'; }).length, a = l.filter(function(x){ return x.nivel === 'ambar'; }).length;
      return '<button type="button" class="ft-area ' + n + '" data-ft-tab="' + gr[0] + '"><span class="ft-area-h"><b>' + gr[1] + '</b>' + pill(n, NIV[n].t) + '</span>' +
        clave[gr[0]].map(function(id){ var x = l.filter(function(y){ return y.id === id; })[0];
          return x ? '<span class="ft-area-k"><span>' + esc(x.titulo) + '</span><b>' + esc(x.valor) + '</b></span>' : ''; }).join('') +
        '<span class="ft-area-p">' + (r || a ? [r ? plural(r, 'alarma', 'alarmas') : '', a ? plural(a, 'punto', 'puntos') + ' para mirar' : ''].filter(Boolean).join(' · ') : n === 'gris' ? 'Sin datos todavía' : 'Todo en orden') + ' ›</span></button>';
    }).join('') + '</div>';
    h += acciones.length ? '<div class="panel ft-acc"><div class="panel-title">Qué hacer</div><ol>' + acciones.map(function(x){
        return '<li class="' + x.nivel + '"><b>' + esc(x.titulo) + '.</b> ' + esc(x.accion) + '</li>'; }).join('') + '</ol></div>'
      : '<div class="panel ft-acc"><div class="panel-title">Qué hacer</div><div class="ft-vacio">Nada urgente: la flota está trabajando dentro de lo normal.</div></div>';
    return h;
  }
  function pFlota(I, X){
    var maqs = X.maquinas.filter(function(m){ return !m.camion; }), cams = X.maquinas.filter(function(m){ return m.camion; });
    var perd = maqs.filter(function(m){ return m.enTaller != null; }).sort(function(a, b){ return b.enTaller - a.enTaller; })
      .map(function(m){ return { k:m.cod, v:Math.max(m.enTaller, 0.5), lbl: m.enTaller ? plural(m.enTaller, 'día', 'días') : 'desde hoy',
        t:m.cod + ' ' + m.nombre + ': parada desde el ' + dcorta(m.desdeTaller) + (m.tipoParada === 'mantenimiento' ? ' (mantenimiento)' : '') }; });
    function fila(m){
      var mt = m.mtto, txtM = !mt || mt.nivel === 'sindato' ? '<span class="ft-mute">Sin registrar</span>' :
        mt.nivel === 'sinhorometro' ? '<span class="ft-mute">Sin horómetro</span>' :
        mt.nivel === 'vencido' ? pill('rojo', 'Vencido ' + g1(-mt.faltan) + ' ' + (mt.unidad || 'h')) :
        urgenteMtto(mt) ? pill('ambar', 'Faltan ' + g1(mt.faltan) + ' ' + (mt.unidad || 'h')) : pill('verde', 'Al día');
      return [maq(m), pill(m.hoy.c, m.hoy.t) + (m.hoy.d ? '<div class="ft-sub">' + esc(m.hoy.d) + '</div>' : ''),
        m.disp == null ? '—' : '<span class="' + (m.disp >= META ? 'ft-ok' : m.disp >= 75 ? 'ft-al' : 'ft-ma') + '">' + Math.round(m.disp) + '%</span>',
        m.enTaller == null ? '—' : String(m.enTaller), String(m.fallas90), m.camion ? '—' : txtM, m.pend ? String(m.pend) : '—'];
    }
    var cols = [{ t:'Máquina' }, { t:'Hoy' }, { t:'Disp. ' + X.corto, n:1 }, { t:'Días en taller', n:1 }, { t:'Fallas 3 meses', n:1 }, { t:'Mantenimiento' }, { t:'Pendientes', n:1 }];
    return '<div class="ft-grid">' + I.filter(function(x){ return x.grupo === 'flota'; }).map(tarjeta).join('') + '</div>' +
      '<div class="ft-dos">' +
        bloque('Tiempo en taller', 'Días que lleva cada máquina parada, desde la fecha que registró el Taller.', barras(perd, 'rojo', 'Ninguna máquina en el taller.')) +
        bloque('Fallas por sistema', 'Fallas de los últimos 3 meses y días parados que dejaron.', barras(X.sistemas.map(function(x){
          return { k:x.k, v:x.n, lbl:plural(x.n, 'falla', 'fallas') + ' · ' + x.d + ' d', t:x.k + ': ' + x.n + ' fallas, ' + x.d + ' días parados' }; }), 'gris', 'Sin fallas en los últimos 3 meses.')) +
      '</div>' +
      bloque('Estado de cada máquina', '', tabla(cols, maqs.map(fila))) +
      bloque('Mantenimiento: lo que viene', 'Lo más urgente primero. "Hacia el" se calcula con el uso real de cada máquina en los últimos 30 días (cierres de jornada); sin cierres suficientes no se estima.',
        tabla([{ t:'Máquina' }, { t:'Toca' }, { t:'Estado' }, { t:'Uso diario', n:1 }, { t:'Ficha' }], (X.mtto || []).map(function(m){
          var est = m.nivel === 'vencido' ? pill('rojo', txtMtto(m)) : m.nivel === 'sindato' ? '<span class="ft-mute">Sin registro en el Taller</span>' :
            m.nivel === 'sinhorometro' ? '<span class="ft-mute">Sin horómetro de los operarios</span>' : pill(urgenteMtto(m) ? 'ambar' : 'verde', txtMtto(m));
          return [maq(m), esc(m.que || '—'), est, m.usoDia ? g1(m.usoDia) + ' ' + m.unidad : '—',
            '<span class="ft-mute">' + esc(m.modelo || 'plantilla general') + (m.sinDato && m.nivel !== 'sindato' ? ' · ' + m.sinDato + ' sin registro' : '') + '</span>'];
        }), 'Sin máquinas.')) +
      '<div class="ft-dos">' +
        bloque('Costo del taller ' + X.enMes, 'Reparaciones y mantenimiento preventivo, con lo que registró Compras.', barras((X.costo || []).map(function(x){
          return { k:x.cod, v:x.v, lbl:millones(x.v), t:x.cod + ': reparaciones ' + peso(x.rep) + ' · preventivo ' + peso(x.prev) }; }), 'gris', 'Compras todavía no ha registrado costos.')) +
        bloque('Mantenimientos hechos', 'Lo que registró el Taller, el más reciente primero.', tabla([{ t:'Fecha' }, { t:'Máquina' }, { t:'Qué se cambió' }, { t:'Costo', n:1 }],
          (X.mttos || []).map(function(m){ return [dcorta(m.fecha), '<b class="ft-cod">' + esc(m.cod) + '</b>', esc(m.que), m.costo ? millones(m.costo) : '<span class="ft-mute">sin costo</span>']; }),
          'Todavía no hay mantenimientos registrados en el Taller.')) +
      '</div>' +
      (cams.length ? bloque('Camiones', 'No entran en la disponibilidad de la maquinaria.', tabla(cols, cams.map(fila))) : '');
  }
  function pOperacion(I, X){
    var maqs = X.maquinas.filter(function(m){ return !m.camion; });
    var hrs = maqs.filter(function(m){ return m.horasMes; }).sort(function(a, b){ return b.horasMes - a.horasMes; })
      .map(function(m){ return { k:m.cod, v:m.horasMes, lbl:g1(m.horasMes) + ' h', t:m.cod + ' ' + m.nombre }; });
    // ya pasó la jornada: lo que trabajó y no tiene cierre se marca
    var tarde = new Date().getHours() >= 18;
    function cierreTxt(m){
      if (m.cierres.length) return m.cierres.map(function(x){
        var c = x.estado === 'varado' ? 'rojo' : x.estado === 'novedad' ? 'ambar' : 'verde';
        return pill(c, (x.estado === 'varado' ? 'Varada' : x.estado === 'novedad' ? 'Con novedad' : 'Cerrado') + (x.hora ? ' ' + x.hora : '')) +
          '<div class="ft-sub">' + esc(x.op) + (x.final != null ? ' · horómetro ' + g1(x.final) : '') + '</div>' +
          (x.novedad ? '<div class="ft-sub" style="color:#b45309">' + esc(x.novedad) + '</div>' : '');
      }).join('<div style="height:6px"></div>') + (m.cierre != null ? '<div class="ft-sub"><b style="color:#374151">' + g1(m.cierre) + ' h trabajadas</b></div>' : '');
      if (m.pre || m.prog) return m.hoy.c === 'rojo' && !m.pre ? '<span class="ft-mute">—</span>' : tarde ? pill('rojo', 'Falta el cierre') : '<span class="ft-mute">Pendiente</span>';
      return '<span class="ft-mute">—</span>';
    }
    // el operario programado aquí hizo su preoperativo en otra máquina
    var opMaq = {};
    maqs.forEach(function(x){ if (x.pre) String(x.pre.op || '').split('/').forEach(function(n){ n = n.trim(); if (n) opMaq[n.toLowerCase()] = x.cod; }); });
    function dondeHizo(m){
      var l = String(m.prog.op || '').split('/').map(function(n){ return n.trim(); }).filter(function(n){ return n && opMaq[n.toLowerCase()] && opMaq[n.toLowerCase()] !== m.cod; });
      return l.length ? '<div class="ft-sub" style="color:#b45309">' + l.map(function(n){ return esc(n) + ' hizo el preoperativo en la ' + esc(opMaq[n.toLowerCase()]); }).join('<br>') + '</div>' : '';
    }
    var hoyF = maqs.slice().sort(function(a, b){ return (a.hoy.c === 'rojo') - (b.hoy.c === 'rojo'); }).map(function(m){
      return [maq(m), pill(m.hoy.c, m.hoy.c === 'rojo' ? 'En taller' : 'Buena'),
        m.prog ? esc(m.prog.labor || 'Programada') + (m.prog.op ? '<div class="ft-sub">' + esc(m.prog.op) + '</div>' : '') : '<span class="ft-mute">Sin programar</span>',
        m.pre ? pill(m.cruce ? 'ambar' : 'verde', (m.cruce ? 'Otro operario' : 'Hecho') + (m.pre.hora ? ' ' + m.pre.hora : '')) + (m.pre.op ? '<div class="ft-sub">' + esc(m.pre.op) + '</div>' : '') +
          (m.cruce ? '<div class="ft-sub" style="color:#b45309">Programado: ' + esc(m.cruce.prog.join(' / ')) + '</div>' : '') :
          (m.prog && m.hoy.c !== 'rojo' ? pill('rojo', 'Falta') + dondeHizo(m) : '<span class="ft-mute">—</span>'),
        cierreTxt(m)];
    });
    return '<div class="ft-grid">' + I.filter(function(x){ return x.grupo === 'operacion'; }).map(tarjeta).join('') + '</div>' +
      bloque('Hoy, máquina por máquina', 'Programación, preoperativo al arrancar y cierre de jornada al terminar (hora, operario, horómetro, horas y novedad).',
        tabla([{ t:'Máquina' }, { t:'Estado' }, { t:'Labor programada' }, { t:'Preoperativo' }, { t:'Cierre de jornada' }], hoyF)) +
      bloque('Horas trabajadas ' + X.enMes, 'Horas de motor según el horómetro del cierre de jornada.', barras(hrs, 'verde', 'Todavía no hay cierres de jornada con horómetro ' + X.enMes + '.')) +
      operacionHtml(X);
  }
  function operacionHtml(X){
    var O = X.op;
    if (!O) return '';
    var vacio = 'Se llena con los cierres de jornada que traen la labor y los lotes (versión nueva del Preoperativo).';
    var cumple = tabla([{ t:'Máquina' }, { t:'Programada', n:1 }, { t:'Hizo lo programado', n:1 }, { t:'Otra labor o lotes', n:1 }, { t:'No trabajó', n:1 }, { t:'Sin cierre', n:1 }],
      O.porMaq.filter(function(x){ return x.prog; }).map(function(x){
        var pc = x.cumplidas / x.prog * 100;
        return ['<b class="ft-cod">' + esc(x.cod) + '</b>', String(x.prog), '<span class="' + (pc >= CUMPLE_OK ? 'ft-ok' : pc >= 70 ? 'ft-al' : 'ft-ma') + '">' + x.cumplidas + '</span>',
          x.otras ? String(x.otras) : '—', x.noTrabajo ? String(x.noTrabajo) : '—', x.sinCierre ? String(x.sinCierre) : '—'];
      }), O.conDato ? 'Sin máquinas programadas.' : vacio) +
      (O.sinProg.length ? '<div class="ft-sub" style="margin-top:8px;max-width:none">Trabajaron sin programar: ' + O.sinProg.map(function(x){ return esc(x.cod) + ' ' + dcorta(x.fecha) + (x.labor ? ' (' + esc(x.labor) + ')' : ''); }).join(', ') + '</div>' : '');
    var lab = barras(O.labor.filter(function(x){ return x.horas; }).map(function(x){ return { k:x.txt, v:x.horas, lbl:g1(x.horas) + ' h', t:x.txt + ': ' + g1(x.horas) + ' horas de máquina' }; }), 'verde', vacio, true);
    var lotes = tabla([{ t:'Lote' }, { t:'Finca' }, { t:'ha', n:1 }, { t:'Horas', n:1 }, { t:'h/ha', n:1 }, { t:'Combustible', n:1 }, { t:'$/ha', n:1 }],
      O.lotes.map(function(y){
        return ['<b class="ft-cod">' + esc(y.lote) + '</b>', esc(y.finca || '—'), y.ha ? g1(y.ha) : '—', g1(y.horas), y.porHa != null ? g2(y.porHa) : '—',
          y.gal ? g1(y.gal) + ' gal' : '—', y.ha && y.costo ? peso(y.costo / y.ha) : '—'];
      }), vacio);
    return bloque('Cumplimiento de la programación ' + X.enMes, 'Máquinas-día programadas (sin contar los días en taller) y lo que dijo el operario en el cierre de jornada.', cumple) +
      '<div class="ft-dos">' + bloque('Horas por labor ' + X.enMes, 'Horas de motor de los cierres de jornada, según la labor que hizo.', lab) +
        bloque('Lotes con más horas de máquina', 'Si una máquina trabajó varios lotes, sus horas se reparten por hectáreas. Combustible = lo despachado a la máquina, repartido según las horas de cada lote.' +
          (O.nLotes > O.lotes.length ? ' Los ' + O.lotes.length + ' de ' + O.nLotes + ' lotes con más horas.' : ''), lotes) + '</div>';
  }
  function pCombustible(I, X){
    function variacion(x){
      if (x.v == null) return '<span class="ft-mute">' + (x.tasa == null ? 'Pocos datos' : 'Sin historia') + '</span>';
      return x.v > 25 ? pill(x.v > 50 ? 'rojo' : 'ambar', '▲ ' + Math.round(x.v) + '%') : Math.abs(x.v) < 5 ? '<span class="ft-mute">normal</span>' : (x.v > 0 ? '▲ ' : '▼ ') + Math.round(Math.abs(x.v)) + '%';
    }
    var u = function(x){ return x.km ? ' km/gal' : ' gal/h'; };
    var filas = X.comb.map(function(x){ return [maq(x), g1(x.gal), x.costo ? peso(x.costo) : '—',
      x.tasa == null ? '<span class="ft-mute">—</span>' : g2(x.tasa) + u(x), x.normal == null ? '<span class="ft-mute">—</span>' : g2(x.normal) + u(x), variacion(x)]; });
    var raros = X.raros.map(function(r){ var t = r.t; return ['<span class="ft-nw">' + dcorta(t.fecha) + '</span>' + (t.hora ? '<div class="ft-sub">' + esc(t.hora) + '</div>' : ''),
      '<b class="ft-cod">' + esc(t.cod) + '</b>', g1(t.gal), esc(t.recibe || ''),
      r.por.map(function(p){ return '<div>' + (r.grave ? pill('rojo', p) : esc(p)) + '</div>'; }).join(''), t.just ? '<span class="ft-alerta">' + esc(t.just) + '</span>' : '<span class="ft-mute">—</span>']; });
    var labor = (X.labor || []).slice().sort(function(a, b){ return b.gal - a.gal; }).map(function(x){ return { k:x.txt, v:x.gal, lbl:g1(x.gal) + ' gal · ' + peso(x.costo), t:x.txt }; });
    var otros = X.otros.map(function(o){ return ['<b class="ft-cod">' + esc(o.cod) + '</b>' + (o.tipo === 'vehiculo' ? ' <span class="ft-nom">' + esc(o.nombre) + '</span>' : ''),
      o.tipo === 'vehiculo' ? 'Vehículo' : 'Por tipo', String(o.n), g1(o.gal), peso(o.costo)]; });
    var cier = X.cierres.map(function(m){ var dd = m.dif || 0;
      return [dcorta(m.fecha), m.teorico == null ? '—' : g1(m.teorico), m.vacio ? 'vacío' : g1(m.gal),
        dd < 0 ? pill(Math.abs(dd) > 2 ? 'rojo' : 'ambar', 'Faltan ' + g1(-dd)) : dd > 0 ? pill('ambar', 'Sobran ' + g1(dd)) : pill('verde', 'Cuadra'),
        dd && X.precio ? peso(Math.abs(dd) * X.precio) : '—', esc(m.motivo || '')]; });
    var lleg = X.llegadas.map(function(m){ return [dcorta(m.fecha), m.esperado ? g1(m.esperado) : '—', g1(m.gal),
      !m.esperado ? '<span class="ft-mute">—</span>' : m.difProv < 0 ? pill('rojo', 'Faltan ' + g1(-m.difProv)) : m.difProv > 0 ? pill('ambar', 'Sobran ' + g1(m.difProv)) : pill('verde', 'Completo'),
      m.precio ? peso(m.precio) : '—', esc(m.nota || '') + (m.obs ? '<div class="ft-sub">' + esc(m.obs) + '</div>' : '')]; });
    return '<div class="ft-grid">' + I.filter(function(x){ return x.grupo === 'combustible'; }).map(tarjeta).join('') + '</div>' +
      bloque('Consumo por máquina ' + X.enMes, 'Galones y consumo por hora de motor (km por galón en camiones), comparado con lo normal de cada máquina: sus 10 tanqueos anteriores.',
        tabla([{ t:'Máquina' }, { t:'Galones', n:1 }, { t:'Costo', n:1 }, { t:'Consumo', n:1 }, { t:'Lo normal', n:1 }, { t:'Variación', n:1 }], filas, 'Todavía no hay tanqueos de máquinas ' + X.enMes + '.')) +
      bloque('Tanqueos que no cuadran', 'Máquina en el taller ese día, sin trabajo registrado, o que gastó mucho más de lo normal. Al lado, la justificación que escribió Leanis.',
        tabla([{ t:'Fecha' }, { t:'Equipo' }, { t:'Galones', n:1 }, { t:'Recibió' }, { t:'Por qué no cuadra' }, { t:'Justificación' }], raros, 'Todo el combustible coincide con el trabajo registrado.')) +
      '<div class="ft-dos">' +
        bloque('Combustible por labor', 'Lo despachado a cada máquina, repartido entre las labores que el operario confirmó en el cierre según sus horas (si el cierre no trae la labor, la programada). Camiones = transporte.', barras(labor, 'verde', 'Todavía no hay tanqueos de máquinas ' + X.enMes + '.', true)) +
        bloque('Otros consumos', 'Vehículos por placa; guadañas, motobombas y estacionaria por tipo.', tabla([{ t:'Destino' }, { t:'Control' }, { t:'Tanqueos', n:1 }, { t:'Galones', n:1 }, { t:'Costo', n:1 }], otros, 'Sin otros consumos ' + X.enMes + '.')) +
      '</div>' +
      bloque('Llegadas de combustible', 'Lo medido con regleta en el carrotanque antes de descargar contra la orden de compra (procedimiento PR-ALM-01). Al tanque entra lo medido.',
        tabla([{ t:'Fecha' }, { t:'Orden', n:1 }, { t:'Regleta', n:1 }, { t:'Diferencia' }, { t:'Precio/gal', n:1 }, { t:'Proveedor o remisión' }], lleg, 'Sin llegadas registradas.')) +
      bloque('Cierres del almacén', 'El tanque no tiene regleta: se cuadra cuando se vacía. Lo que debería haber según la app contra cero, y la explicación de Leanis cuando no cuadra.',
        tabla([{ t:'Fecha' }, { t:'Debería', n:1 }, { t:'Quedó', n:1 }, { t:'Diferencia' }, { t:'Valor', n:1 }, { t:'Explicación' }], cier, 'Todavía no hay cierres: se hace la próxima vez que el tanque se vacíe.'));
  }

  function pintar(R, act){
    ULT = { R:R, act:act };
    var I = R.I, n = peor(I.filter(function(x){ return x.nivel !== 'gris'; }));
    var rojos = I.filter(function(x){ return x.nivel === 'rojo'; }), ambar = I.filter(function(x){ return x.nivel === 'ambar'; });
    var titulo = { rojo:'Hay alarmas en la flota', ambar:'Estamos bien, con cosas para mirar', verde:'Estamos bien', gris:'Sin datos' }[n];
    var sub = n === 'verde' ? 'Las máquinas están disponibles, trabajando y gastando lo normal.' :
      [rojos.length ? plural(rojos.length, 'alarma', 'alarmas') + ': ' + rojos.map(function(x){ return x.titulo.toLowerCase(); }).join(', ') : '',
       ambar.length ? plural(ambar.length, 'punto', 'puntos') + ' para mirar' : ''].filter(Boolean).join(' · ') + '.';
    var h = '<div class="ft-ver ' + n + '"><div class="ft-luz"><i></i></div><div class="ft-ver-txt"><div class="ft-ver-t">' + titulo + '</div><div class="ft-ver-s">' + esc(sub) + '</div></div>' +
      '<div class="ft-ver-r"><span id="ft-act">' + esc(act) + '</span><span class="ft-ver-b"><button type="button" id="ft-informe" class="ft-inf">Informe para gerencia</button>' +
      '<button type="button" id="ft-recargar">Actualizar</button></span></div></div>';
    h += '<div class="ft-tabs" role="tablist">' + TABS.map(function(t){
      var nv = t[0] === 'resumen' ? '' : peor(I.filter(function(x){ return x.grupo === t[0]; }));
      return '<button type="button" role="tab" data-ft-tab="' + t[0] + '" aria-selected="' + (TAB === t[0]) + '" class="' + (TAB === t[0] ? 'on' : '') + '">' +
        (nv ? '<i class="ft-dot ' + nv + '"></i>' : '') + t[1] + '</button>';
    }).join('') + '</div>';
    h += '<div class="ft-panel">' + (TAB === 'flota' ? pFlota(I, R.X) : TAB === 'operacion' ? pOperacion(I, R.X) : TAB === 'combustible' ? pCombustible(I, R.X) : pResumen(I)) + '</div>';
    h += '<div class="ft-pie">Datos del sistema de maquinaria: Taller, Programación, Preoperativo y app de Tanqueo. Meta de disponibilidad ' + META + '%. ' +
      'Verde = bien · ámbar = mirarlo · rojo = alarma.</div>';
    el('ft-cuerpo').innerHTML = h;
  }

  /* =====================================================================
     INFORME SEMANAL PARA GERENCIA (PDF de una hoja)
     Lo arma el Superintendente desde este tablero: la semana (lunes a
     sábado) comparada con la anterior, lo que pasó, los riesgos de hoy, las
     decisiones que se piden y sus observaciones. Se imprime o se guarda como
     PDF desde el navegador.
     ===================================================================== */
  var DATOS = null;
  function lunesDe(f){ var p = f.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]); return sumar(f, -((d.getDay() + 6) % 7)); }
  function larga(f){ var p = f.split('-'); return (+p[2]) + ' de ' + MESES[+p[1] - 1]; }
  function semanas(){
    var hy = hoy(), lu = lunesDe(hy), pas = sumar(lu, -7);
    return { pasada:{ desde:pas, hasta:sumar(pas, 5) }, actual:{ desde:lu, hasta: hy < sumar(lu, 5) ? hy : sumar(lu, 5) } };
  }
  function txtSemana(w){
    var a = w.desde.split('-'), b = w.hasta.split('-');
    return 'del ' + (+a[2]) + (a[1] !== b[1] ? ' de ' + MESES[+a[1] - 1] : '') + ' al ' + (+b[2]) + ' de ' + MESES[+b[1] - 1] + ' de ' + b[0];
  }

  /* cifras de un período */
  function periodo(D, desde, hasta){
    if (hasta < INICIO) return null;           // antes del sistema nuevo: no se cuenta
    if (desde < INICIO) desde = INICIO;
    var disp = disponibilidad(D, desde, hasta), u = uso(D, desde, hasta), h = 0, hd = 0;
    (window.Horometros ? Horometros.cierres() : []).forEach(function(c){
      if (c.fecha >= desde && c.fecha <= hasta && c.horas != null && eq(c.cod) && !esCamion(c.cod)){ h += c.horas; hd++; }
    });
    var T = D.tanq.filter(function(t){ return !t.anulado && !t.dudoso && t.fecha >= desde && t.fecha <= hasta; });
    return { disp:disp.pct, perdidos:disp.perdidos, total:disp.total, fallas:fallasEntre(D, desde, hasta), uso:u.pct, pre:u.prePct,
      horas:h, jornadas:hd, gal:T.reduce(function(a, t){ return a + t.gal; }, 0), costo:T.reduce(function(a, t){ return a + t.costo; }, 0), tanqueos:T.length };
  }
  function nivelPct(v, ok, al){ return v == null ? 'gris' : v >= ok ? 'verde' : v >= al ? 'ambar' : 'rojo'; }
  function difTxt(a, b, unidad, menosEsMejor, dec){
    if (a == null || b == null) return '';
    var d = dec ? Math.round((a - b) * 10) / 10 : Math.round(a - b);
    if (!d) return '<span class="ig">= semana anterior</span>';
    var mejor = menosEsMejor ? d < 0 : d > 0;
    return '<span class="' + (mejor ? 'me' : 'pe') + '">' + (d > 0 ? '▲ ' : '▼ ') + String(Math.abs(d)).replace('.', ',') + unidad + ' vs. semana anterior</span>';
  }

  /* Todas las cifras de una semana, para el PDF y el resumen de WhatsApp
     (cada dato se calcula una vez y aparece una vez). */
  function datosSemana(w){
    var D = DATOS, I = ULT.R.I, X = ULT.R.X || {};
    var parcial = w.desde < INICIO, desdeEf = parcial ? INICIO : w.desde;
    var hayAnt = sumar(w.desde, -7) >= INICIO, pd = sumar(w.desde, -7), ph = sumar(w.hasta, -7);
    var A = periodo(D, w.desde, w.hasta), P = hayAnt ? periodo(D, pd, ph) : null;
    var CS = combustibleDe(D, desdeEf, w.hasta), CSp = hayAnt ? combustibleDe(D, pd, ph) : null;
    var OP = operacionDe(D, desdeEf, w.hasta, CS), OPp = hayAnt ? operacionDe(D, pd, ph, CSp) : null;
    var CT = costoTaller(D, desdeEf, w.hasta), CTp = hayAnt ? costoTaller(D, pd, ph) : null;
    var nComb = !CS.n ? 'gris' : (CS.faltante > Math.max(10, CS.gal * 0.02) || CS.raros.some(function(x){ return x.grave; }) || (CS.varTasa != null && CS.varTasa > 50)) ? 'rojo' :
      (CS.faltante > 0 || CS.raros.length || (CS.varTasa != null && CS.varTasa > 25)) ? 'ambar' : 'verde';
    var hayOp = OP.conDato > 0;
    var k = [
      { t:'Disponibilidad', v: A.disp == null ? '—' : Math.round(A.disp) + '%', n:nivelPct(A.disp, META, 75), d: P ? difTxt(A.disp, P.disp, ' pts') : '',
        s:'Meta ' + META + '% · ' + plural(A.perdidos, 'día-máquina perdido', 'días-máquina perdidos') },
      { t:'Cumplimiento', v: hayOp && OP.pct != null ? Math.round(OP.pct) + '%' : '—', n: hayOp ? nivelPct(OP.pct, CUMPLE_OK, 70) : 'gris',
        d: OPp && OPp.conDato && OPp.pct != null && OP.pct != null ? difTxt(OP.pct, OPp.pct, ' pts') : '',
        s: hayOp ? OP.cumplidas + ' de ' + OP.prog + ' máquinas-día hicieron lo programado' : 'Se mide con los cierres que traen la labor' },
      { t:'Uso de la maquinaria', v: A.uso == null ? '—' : Math.round(A.uso) + '%', n:nivelPct(A.uso, 80, 60), d: P ? difTxt(A.uso, P.uso, ' pts') : '', s:'Días buenas con trabajo registrado' },
      { t:'Horas trabajadas', v: A.horas ? g1(A.horas) + ' h' : '—', n: !A.horas ? 'gris' : P && P.horas && A.horas < P.horas * 0.8 ? 'ambar' : 'verde',
        d: P && P.horas ? difTxt(A.horas, P.horas, ' h', false, 1) : '', s: A.jornadas ? g1(A.horas / A.jornadas) + ' h por máquina en cada jornada' : 'Sin cierres con horómetro' },
      { t:'Costo del taller', v: CT.total ? millones(CT.total) : '$0', n: CT.sinCosto.length ? 'ambar' : 'verde',
        d: CTp && CTp.total ? difTxt(CT.total / 1e6, CTp.total / 1e6, ' M', true, 1).replace(/class="(me|pe)"/, 'class="ig"') : '',
        s: CT.total ? 'Reparaciones ' + millones(CT.rep) + ' · preventivo ' + millones(CT.prev) : 'Compras no registró costos' },
      { t:'Combustible', v: CS.n ? (CS.costo ? millones(CS.costo) : g1(CS.gal) + ' gal') : '—', n: nComb,
        d: CSp && CSp.n ? difTxt(CS.gal, CSp.gal, ' gal', true, 1).replace(/class="(me|pe)"/, 'class="ig"') : '',
        s: CS.n ? g1(CS.gal) + ' gal en ' + plural(CS.n, 'tanqueo', 'tanqueos') : 'Sin tanqueos' }
    ];
    var enT = FLOTA.map(function(f){
      var e = D.eventos.filter(function(x){ return x.cod === f.cod && x.inicio <= w.hasta && (!x.fin || x.fin > w.hasta); })[0];
      return e ? { f:f, e:e, d:dias(e.inicio, w.hasta), r:reparacion(e) } : null;
    }).filter(Boolean).sort(function(a, b){ return b.d - a.d; });
    var entraron = D.eventos.filter(function(e){ return eq(e.cod) && e.inicio >= desdeEf && e.inicio <= w.hasta; });
    var salieron = D.eventos.filter(function(e){ return eq(e.cod) && e.fin && e.fin >= desdeEf && e.fin <= w.hasta; });
    var proxS = (X.mtto || []).filter(function(m){ return !m.camion && urgenteMtto(m); });
    var acciones = I.filter(function(x){ return x.accion && (x.nivel === 'rojo' || x.nivel === 'ambar'); })
      .sort(function(a, b){ return (a.nivel === 'rojo' ? 0 : 1) - (b.nivel === 'rojo' ? 0 : 1); }).slice(0, 5);
    var todos = k.map(function(x){ return x.n; }).concat(acciones.map(function(x){ return x.nivel; }));
    var nivel = todos.indexOf('rojo') >= 0 ? 'rojo' : todos.indexOf('ambar') >= 0 ? 'ambar' : 'verde';
    // labores: horas de los cierres y pesos del combustible, en una sola línea
    var labores = OP.listaLabor.slice(0, 4);
    var lotes = OP.listaLotes.filter(function(y){ return y.ha; }).sort(function(a, b){ return (b.costo / b.ha || b.porHa) - (a.costo / a.ha || a.porHa); }).slice(0, 3);
    var sups = (window.Maestros && Maestros.get('SUPERVISORES')) || [];
    var supte = sups.filter(function(x){ return x.activo !== false && /superintendente/i.test(x.cargo || ''); })[0];
    return { w:w, parcial:parcial, hayAnt:hayAnt, A:A, k:k, nivel:nivel, enT:enT, entraron:entraron, salieron:salieron, proxS:proxS, CT:CT, CS:CS, OP:OP,
      hayOp:hayOp, labores:labores, lotes:lotes, acciones:acciones,
      enTaller: enT.filter(function(x){ return x.f.grupo !== 'transporte'; }).length,
      veredicto:{ rojo:'La flota necesita decisiones de gerencia', ambar:'La flota está trabajando, con puntos para vigilar', verde:'La flota está bien' }[nivel],
      quien: supte ? supte.nombre : ((el('tb-user-name') || {}).textContent || '') };
  }
  function corto(t, n){ t = String(t || ''); return t.length > n ? t.slice(0, n - 1) + '…' : t; }

  function informe(w, obs){
    var R = datosSemana(w), CS = R.CS, OP = R.OP;
    var h = '<div class="fi">' +
      '<div class="fi-cab"><div><div class="fi-emp">Palma Grande S.A.S. · Maquinaria y combustible</div><h1>Informe semanal para gerencia</h1>' +
        '<div class="fi-per">Semana ' + txtSemana(w) + (R.parcial ? ' · cuenta desde el ' + larga(INICIO) + ', cuando arrancó el sistema actualizado' : '') + '</div></div>' +
        '<div class="fi-meta">Preparó: <b>' + esc(R.quien || 'Superintendente') + '</b><br>Superintendente de Plantación<br>Generado el ' + larga(hoy()) + ' de ' + hoy().slice(0, 4) + '</div></div>' +
      '<div class="fi-ver ' + R.nivel + '"><b>' + R.veredicto + '.</b> ' + R.enTaller + ' de ' + maquinaria().length + ' máquinas en taller al cierre de la semana' +
        (R.acciones.length ? ' · ' + plural(R.acciones.length, 'decisión pendiente', 'decisiones pendientes') : '') + '.' +
        (!R.hayAnt ? ' <span class="g">Sin comparación con la semana anterior: es la primera semana con el sistema actualizado.</span>' : '') + '</div>' +
      '<div class="fi-k">' + R.k.map(function(x){
        return '<div class="fi-kc ' + x.n + '"><div class="t">' + x.t + '</div><div class="v">' + esc(x.v) + '</div><div class="s">' + esc(x.s) + '</div><div class="d">' + x.d + '</div></div>';
      }).join('') + '</div>';

    // 1. taller y mantenimiento
    h += '<h2>Taller y mantenimiento</h2><div class="fi-dos fi-taller"><div>' + (R.enT.length ? '<table><thead><tr><th>En taller al ' + larga(w.hasta) + '</th><th class="n">Días</th><th>Causa</th><th>En qué va</th><th class="n">Costo</th></tr></thead><tbody>' +
        R.enT.slice(0, 5).map(function(x){
          return '<tr><td><b>' + esc(x.f.cod) + '</b></td><td class="n">' + x.d + '</td><td>' + esc(corto(x.e.txt, 34)) + '</td>' +
            '<td>' + esc(x.r.estado || '—') + (x.r.t && x.r.t.sale ? '<br><span class="g">sale ' + dcorta(x.r.t.sale) + '</span>' : '') + '</td><td class="n">' + (x.r.costo ? millones(x.r.costo) : '—') + '</td></tr>'; }).join('') +
        (R.enT.length > 5 ? '<tr><td colspan="5">y ' + (R.enT.length - 5) + ' más: ' + R.enT.slice(5).map(function(x){ return esc(x.f.cod); }).join(', ') + '</td></tr>' : '') + '</tbody></table>' : '<p>Ninguna máquina en taller al cierre de la semana.</p>') + '</div><div><ul>' +
      '<li><b>Entraron:</b> ' + (R.entraron.length ? R.entraron.slice(0, 4).map(function(e){ return esc(e.cod) + ' (' + (e.tipo === 'mantenimiento' ? 'mantenimiento' : esc(corto(e.txt, 40))) + ')'; }).join('; ') : 'ninguna') + '.</li>' +
      '<li><b>Salieron:</b> ' + (R.salieron.length ? R.salieron.map(function(e){ return esc(e.cod) + ' (' + plural(dias(e.inicio, e.fin), 'día', 'días') + ')'; }).join('; ') : 'ninguna') + '.</li>' +
      '<li><b>Mantenimientos hechos:</b> ' + (R.CT.mttos.length ? R.CT.mttos.map(function(m){ return esc(m.cod); }).join(', ') : 'ninguno') +
        (R.CT.sinCosto.length ? ' <span class="g">(' + plural(R.CT.sinCosto.length, 'sin costo', 'sin costo') + ' de Compras)</span>' : '') + '.</li>' +
      (R.proxS.length ? '<li><b>Mantenimiento que toca:</b> ' + R.proxS.slice(0, 6).map(function(m){ return esc(m.cod) + (m.nivel === 'vencido' ? ' (vencido)' : m.cuando ? ' (' + dcorta(m.cuando) + ')' : ''); }).join(', ') + '.</li>' : '') +
      '</ul></div></div>';

    // 2. operación
    h += '<h2>Operación</h2><ul class="fi-ul2">' +
      '<li><b>Programación:</b> ' + (R.hayOp ? OP.cumplidas + ' de ' + OP.prog + ' máquinas-día hicieron lo programado' +
          [OP.otraLabor + OP.otrosLotes ? (OP.otraLabor + OP.otrosLotes) + ' en otra labor o lotes' : '', OP.noTrabajo ? plural(OP.noTrabajo, 'no trabajó', 'no trabajaron') : '',
           OP.sinCierre ? OP.sinCierre + ' sin cierre' : '', OP.sinProgramar ? plural(OP.sinProgramar, 'trabajó sin programar', 'trabajaron sin programar') : ''].filter(Boolean).map(function(t){ return '; ' + t; }).join('')
        : 'todavía no hay cierres con la labor confirmada') + '.</li>' +
      '<li><b>Preoperativos:</b> ' + (R.A.pre == null ? '—' : Math.round(R.A.pre) + '% de los días trabajados tuvieron revisión al arrancar') + '.</li>' +
      (R.labores.length ? '<li><b>Labores:</b> ' + R.labores.map(function(x){ return esc(x.txt) + (x.horas ? ' ' + g1(x.horas) + ' h' : '') + (x.costo ? ' · ' + millones(x.costo) : ''); }).join(' — ') + '.</li>' : '') +
      (R.lotes.length ? '<li><b>Lotes que más gastan por hectárea:</b> ' + R.lotes.map(function(y){ return esc(y.lote) + ' (' + g2(y.porHa) + ' h/ha' + (y.costo ? ', ' + peso(y.costo / y.ha) + '/ha' : '') + ')'; }).join(' · ') + '.</li>' : '') +
      '</ul>';

    // 3. combustible
    if (CS.n || CS.cierres.length){
      h += '<h2>Combustible</h2><div class="fi-cb">' +
        '<div><b>' + (CS.costo ? peso(CS.costo) : g1(CS.gal) + ' gal') + '</b><span>' + g1(CS.gal) + ' gal despachados' + (CS.otrosGal ? ', ' + g1(CS.otrosGal) + ' a vehículos y otros equipos' : '') + '</span></div>' +
        '<div><b>' + (CS.tasa != null ? g2(CS.tasa) + ' gal/h' : '—') + '</b><span>' + (CS.varTasa != null ? 'Consumo por hora ' + (Math.abs(CS.varTasa) < 5 ? 'normal' : (CS.varTasa > 0 ? '▲ ' : '▼ ') + Math.round(Math.abs(CS.varTasa)) + '% vs. lo normal') : 'Consumo por hora de las máquinas') + '</span></div>' +
        (CS.cierres.length
          ? '<div><b>' + (CS.faltante ? peso(CS.faltanteValor) : 'Cuadró') + '</b><span>' + (CS.faltante ? 'Faltante cuando el tanque se vació (' + g1(CS.faltante) + ' gal)' : 'El tanque se vació y cuadró') + '</span></div>'
          : '<div><b>' + (CS.llegadasPer.length ? (CS.faltaProv ? peso(CS.faltaProvValor) : 'Completo') : '—') + '</b><span>' + (CS.llegadasPer.length ? (CS.faltaProv ? 'El proveedor entregó ' + g1(CS.faltaProv) + ' gal menos (regleta)' : 'Llegadas completas según la regleta') : 'Sin llegadas ni cierre esta semana') + '</span></div>') +
        '<div><b>' + CS.raros.length + '</b><span>' + (CS.raros.length === 1 ? 'Tanqueo que no cuadra' : 'Tanqueos que no cuadran') + ' con el trabajo</span></div></div>';
    }

    // 4. decisiones (la única lista de alertas)
    h += '<h2>Decisiones y acciones</h2>' + (R.acciones.length ? '<ol>' + R.acciones.map(function(x){
        var a = x.corta || x.accion;
        return '<li class="' + x.nivel + '"><b>' + esc(x.titulo) + '.</b> ' + esc(corto(a, 240)) + '</li>'; }).join('') + '</ol>' : '<p>No hay decisiones pendientes esta semana.</p>');
    if (obs) h += '<h2>Observaciones del Superintendente</h2><p class="fi-obs">' + esc(corto(obs, 450)) + '</p>';
    h += '<div class="fi-fir"><div>' + esc(R.quien || 'Superintendente') + '<span>Superintendente de Plantación</span></div><div>&nbsp;<span>Gerencia · recibió</span></div></div>' +
      '<div class="fi-pie">Fuente: Taller, Programación, Preoperativo, Compras y Tanqueo. Cumplimiento = máquinas-día programadas (sin las del taller) que hicieron la labor y los lotes programados. ' +
      'Uso = días con trabajo registrado ÷ días que la máquina estaba buena. Costo del taller = lo que Compras registró en la semana. Sin camiones.</div></div>';

    var pr = el('ft-print');
    if (!pr){ pr = document.createElement('div'); pr.id = 'ft-print'; document.body.appendChild(pr); }
    pr.innerHTML = h;
    document.body.classList.add('ft-imprimiendo');
    var quitar = function(){ document.body.classList.remove('ft-imprimiendo'); window.removeEventListener('afterprint', quitar); };
    window.addEventListener('afterprint', quitar);
    setTimeout(function(){ window.print(); }, 150);
  }

  /* Resumen corto para mandar por WhatsApp junto con el PDF */
  function textoWhatsApp(w, obs){
    var R = datosSemana(w), bola = { rojo:'🔴', ambar:'🟡', verde:'🟢', gris:'⚪' };
    var t = ['*Informe semanal · Maquinaria y combustible*', 'Semana ' + txtSemana(w), '',
      bola[R.nivel] + ' ' + R.veredicto + '. ' + R.enTaller + ' de ' + maquinaria().length + ' máquinas en taller.', ''];
    R.k.forEach(function(x){ t.push(bola[x.n] + ' ' + x.t + ': *' + x.v + '*'); });
    if (R.enT.length){ t.push(''); t.push('*En taller:* ' + R.enT.slice(0, 5).map(function(x){ return x.f.cod + ' (' + x.d + ' d' + (x.r.estado ? ', ' + x.r.estado.toLowerCase() : '') + ')'; }).join(', ')); }
    if (R.acciones.length){ t.push(''); t.push('*Decisiones:*'); R.acciones.forEach(function(x, i){ t.push((i + 1) + '. ' + x.titulo + ': ' + corto(x.corta || x.accion, 160)); }); }
    if (obs){ t.push(''); t.push('*Observaciones:* ' + corto(obs, 300)); }
    t.push(''); t.push('Va el PDF con el detalle.' + (R.quien ? ' — ' + R.quien : ''));
    return t.join('\n');
  }

  /* ventana para elegir la semana y escribir las observaciones */
  function abrirInforme(){
    if (!DATOS){ var b = el('ft-informe'); if (b) b.textContent = 'Espere, consultando…'; return; }
    var S = semanas(), m = el('ft-modal');
    if (!m){ m = document.createElement('div'); m.id = 'ft-modal'; document.body.appendChild(m); }
    function clave(w){ return 'ft_obs_' + w.desde; }
    function leerObs(w){ try { return localStorage.getItem(clave(w)) || ''; } catch(e){ return ''; } }
    m.innerHTML = '<div class="ft-mod"><div class="ft-mod-h">Informe semanal para gerencia</div>' +
      (S.pasada.hasta < INICIO
        ? '<label class="ft-op" style="opacity:.55;cursor:default"><input type="radio" name="ft-sem" value="pasada" disabled> <span><b>Semana pasada</b><br>' + txtSemana(S.pasada) +
            '<br><i>Fue antes de arrancar el sistema actualizado (' + larga(INICIO) + ').</i></span></label>'
        : '<label class="ft-op"><input type="radio" name="ft-sem" value="pasada" checked> <span><b>Semana pasada</b><br>' + txtSemana(S.pasada) + '</span></label>') +
      '<label class="ft-op"><input type="radio" name="ft-sem" value="actual"' + (S.pasada.hasta < INICIO ? ' checked' : '') + '> <span><b>Esta semana, hasta hoy</b><br>' + txtSemana(S.actual) +
        (S.actual.desde < INICIO ? '<br><i>Cuenta desde el ' + larga(INICIO) + '.</i>' : '') + '</span></label>' +
      '<label class="ft-obs-l">Observaciones del Superintendente (opcional)<textarea id="ft-obs" rows="4" placeholder="Lo que gerencia debe saber además de las cifras: compras pedidas, decisiones tomadas, labores atrasadas…"></textarea></label>' +
      '<div class="ft-mod-b"><button type="button" id="ft-mod-no">Cancelar</button><button type="button" id="ft-mod-wa">Resumen para WhatsApp</button><button type="button" id="ft-mod-si">Generar PDF</button></div>' +
      '<div class="ft-mod-n" id="ft-mod-n">En la ventana de impresión elija "Guardar como PDF". El resumen de WhatsApp se copia para pegarlo junto con el PDF.</div></div>';
    m.hidden = false;
    var sel = function(){ return S[(m.querySelector('input[name=ft-sem]:checked') || {}).value || (S.pasada.hasta < INICIO ? 'actual' : 'pasada')]; };
    el('ft-obs').value = leerObs(sel());
    m.onchange = function(e){ if (e.target.name === 'ft-sem') el('ft-obs').value = leerObs(sel()); };
    m.onclick = function(e){
      if (e.target === m || e.target.id === 'ft-mod-no') m.hidden = true;
      if (e.target.id === 'ft-mod-wa'){
        var w2 = sel(), obs2 = el('ft-obs').value.trim(), txt = textoWhatsApp(w2, obs2);
        try { localStorage.setItem(clave(w2), obs2); } catch(x){}
        var listo = function(msg){ var n = el('ft-mod-n'); if (n) n.textContent = msg; };
        if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) navigator.share({ text:txt }).catch(function(){});
        else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function(){ listo('Resumen copiado: péguelo en WhatsApp y adjunte el PDF.'); }, function(){ listo(txt); });
        else listo(txt);
        window.__ftWhatsApp = txt;
        return;
      }
      if (e.target.id === 'ft-mod-si'){
        var w = sel(), obs = el('ft-obs').value.trim();
        try { localStorage.setItem(clave(w), obs); } catch(x){}
        m.hidden = true;
        informe(w, obs);
      }
    };
  }

  var cargando = false, listo = false, CACHE = 'ft_ultimo';
  function hora(d){ return d.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' }); }
  /* lo último que se consultó, para mostrarlo al instante mientras llega lo nuevo */
  function guardado(){
    try {
      var c = JSON.parse(localStorage.getItem(CACHE) || 'null');
      if (!c || !c.R || !c.ts) return null;
      var d = new Date(c.ts);
      return { R:c.R, act: (iso(d) === hoy() ? 'Datos de las ' + hora(d) : 'Datos del ' + dcorta(iso(d))) + ' · actualizando…' };
    } catch(e){ return null; }
  }
  function cargar(forzar){
    if (cargando || !el('ft-cuerpo')) return;
    cargando = true;
    if (forzar) memo = {};
    if (!listo){
      var g = guardado();
      if (g){ try { pintar(g.R, g.act); } catch(e){ g = null; } }
      if (!g) el('ft-cuerpo').innerHTML = '<div class="empty-panel-msg">Consultando el sistema de maquinaria…</div>';
    }
    var b = el('ft-recargar'); if (b){ b.disabled = true; b.textContent = 'Consultando…'; }
    var mae = window.Maestros ? Maestros.traer().catch(function(){}) : Promise.resolve();
    var hor = window.Horometros ? Horometros.traer().catch(function(){}) : Promise.resolve();
    var viejo = window.AppVieja ? AppVieja.traer().catch(function(){ return null; }) : Promise.resolve(null);
    var repar = window.Reparaciones ? Reparaciones.traer().catch(function(){}) : Promise.resolve();
    var mttos = window.Mantenimientos ? Mantenimientos.traer().catch(function(){}) : Promise.resolve();
    if (window.Lotes) Lotes.traer().catch(function(){});   // hectáreas de cada lote (Agrovisión → Lotes)
    Promise.all([leer('Taller'), talvez('ProgMaquinaria'), Promise.resolve(null), talvez('PreopDiario'), talvez('Preoperativos'),
      talvez('Combustible'), talvez('CombustibleTanque'), talvez('CombustibleAlertas'), mae, hor, viejo, repar, talvez('CierreJornada'), mttos])
      .then(function(r){
        FLOTA = window.Maestros ? Maestros.flota() : []; EQ = {};
        FLOTA.forEach(function(f){ EQ[f.cod] = f; });
        var tl = taller(r[0]), al = {};
        (r[7] || []).forEach(function(a){ var id = String(a[3] || '').trim(); if (id) al[id] = { fecha:aIso(a[0]), abierta:String(a[2] || '').trim().toUpperCase() === 'ABIERTA' }; });
        var D = { eventos:tl.eventos, pend:tl.pend, inicio:tl.inicio, prog:programacion(r[1]), pre:preops(r[3], r[4]),
          tanq: window.Combustible ? Combustible.tanqueos(r[5]) : [],
          movs: window.Combustible ? Combustible.movimientos(r[6]) : [],
          alertas:Object.keys(al).map(function(k){ return al[k]; }), viejo:r[10], cierres:cierresDe(r[12]) };
        listo = true; DATOS = D;
        var R = indicadores(D);
        try { localStorage.setItem(CACHE, JSON.stringify({ R:R, ts:Date.now() })); } catch(e){}
        pintar(R, 'Actualizado ' + hora(new Date()));
      })
      .catch(function(){
        if (!listo && ULT){ var a0 = el('ft-act'); if (a0) a0.textContent = 'Sin conexión: se muestran los últimos datos guardados'; }
        else if (!listo) el('ft-cuerpo').innerHTML = '<div class="empty-panel-msg">No se pudo leer el sistema de maquinaria. Revise la señal e intente otra vez.<br><button type="button" id="ft-recargar" class="ft-btn">Intentar otra vez</button></div>';
        else { var a = el('ft-act'); if (a) a.textContent = 'Sin conexión: se muestran los datos anteriores'; }
      })
      .then(function(){ cargando = false; var b = el('ft-recargar'); if (b){ b.disabled = false; b.textContent = listo || ULT ? 'Actualizar' : 'Intentar otra vez'; } });
  }
  // se empieza a consultar apenas abre Agrovisión (con sesión), así al entrar ya está listo
  function precargar(){
    var ok = false;
    try { ok = sessionStorage.getItem('av_logged_in') === '1' || localStorage.getItem('av_logged_in') === '1'; } catch(e){}
    if (ok){ ultimaCarga = Date.now(); cargar(); }
  }
  if (document.readyState === 'complete') setTimeout(precargar, 300);
  else window.addEventListener('load', function(){ setTimeout(precargar, 300); });

  document.addEventListener('click', function(e){
    if (e.target && e.target.id === 'ft-recargar') return cargar(true);
    if (e.target && e.target.id === 'ft-informe') return abrirInforme();
    var t = e.target.closest && e.target.closest('[data-ft-tab]');
    if (t && ULT){
      TAB = t.getAttribute('data-ft-tab');
      try { localStorage.setItem('ft_tab', TAB); } catch(x){}
      pintar(ULT.R, ULT.act);
      var c = el('section-flota'); if (c && c.getBoundingClientRect().top < 0) c.scrollIntoView();
    }
  });
  /* al abrir la sección: si ya hay datos se muestran tal cual; si son de hace
     más de 5 minutos, se actualizan por detrás */
  var ultimaCarga = 0;
  window.FlotaTablero = {
    cargar: function(){
      if (listo && ULT && Date.now() - ultimaCarga < 5 * 60000) return pintar(ULT.R, ULT.act);
      ultimaCarga = Date.now(); cargar();
    }
  };
})();
