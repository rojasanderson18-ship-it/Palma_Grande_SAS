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
  var DIAS_REPETIDAS = 90;       // ventana para "la misma falla otra vez"
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var LABORES = { alceTijera:'Alce con tijera', alceQuinta:'Alce con quinta rueda', rotospeed:'Rotospeed', rolo:'Rolo cuchilla',
    fertMezcla:'Fertilización con mezcla', fertBorax:'Fertilización en bórax', sanidad:'Sanidad', varias:'Labores varias' };
  var SISTEMAS = { motor:'Motor', hidraulico:'Hidráulico', electrico:'Eléctrico', transmision:'Transmisión',
    frenos:'Frenos', direccion:'Dirección', llantas:'Llantas', estructura:'Estructura', otro:'Otro' };

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
        if (acc === 'ALTA'){
          var s = String(r[7] || '').trim(), k = SISTEMAS[s] ? s : Object.keys(SISTEMAS).filter(function(x){ return SISTEMAS[x] === s; })[0];
          e.sistema = k || (s ? 'otro' : null);
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

  /* Programación por fecha → máquina (ProgMaquinaria; lo que no esté ahí, de la hoja anterior) */
  function programacion(nueva, vieja){
    var dias = {}, nuevas = {};
    (nueva || []).forEach(function(r){
      var acc = String(r[2] || '').trim().toUpperCase(), f = aIso(r[4]), cod = String(r[5] || '').trim();
      if (!esFecha(f) || !cod) return;
      if (acc === 'QUITAR'){ if (dias[f]) delete dias[f][cod]; return; }
      if (acc === 'ASIGNAR') (dias[f] = dias[f] || {})[cod] = { labor: LABORES[String(r[6] || '').trim()] || String(r[6] || '').trim(),
        op: [String(r[9] || '').trim(), String(r[12] || '').trim()].filter(Boolean).join(' / ') };
    });
    Object.keys(dias).forEach(function(f){ nuevas[f] = true; });
    (vieja || []).forEach(function(r){
      var f = aIso(r[0]), cod = codDe(r[2]);
      if (!esFecha(f) || !cod || nuevas[f] || !eq(cod) || !String(r[3] || '').trim()) return;
      (dias[f] = dias[f] || {})[cod] = { labor:String(r[3] || '').trim(), op:'' };
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

  /* Tanqueos: solo la app de Tanqueo del almacén (hoja Combustible, última
     fila por ID, sin anulados). Lo que anotaba el preoperativo anterior en la
     hoja Tanqueos no se toma: el combustible se controla desde la app. */
  function tanqueos(nuevo){
    var u = {}, l = [];
    (nuevo || []).forEach(function(r){ var id = String(r[3] || '').trim(); if (id) u[id] = r; });
    Object.keys(u).forEach(function(k){
      var r = u[k], f = aIso(r[0]), acc = String(r[2] || '').trim().toUpperCase();
      if (acc === 'ANULADO' || !esFecha(f)) return;
      var t = { fecha:f, cod:String(r[4] || '').trim(), gal:num(r[6]) || 0, lec:num(r[7]), km:String(r[8] || '') === 'Km',
        costo:num(r[14]) || 0, saldo:num(r[15]), just:String(r[17] || '').trim(), hora:hhmm(r[1]), recibe:String(r[11] || '').trim(), nuevo:true };
      if (t.gal > 0) l.push(t);
    });
    // galones fuera de toda proporción para esa máquina (125 en vez de 12,5): no se cuentan y se avisan
    var por = {};
    l.forEach(function(t){ (por[t.cod] = por[t.cod] || []).push(t.gal); });
    l.forEach(function(t){
      var v = por[t.cod].slice().sort(function(a, b){ return a - b; }), med = v[Math.floor(v.length / 2)];
      t.dudoso = v.length >= 5 && t.gal > Math.max(med * 4, 30);
    });
    return l.sort(function(a, b){ return a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : (a.lec || 0) - (b.lec || 0); });
  }

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

  /* Consumo por hora (o km por galón) de cada máquina en un período, con el
     horómetro de cada tanqueo: los galones que entran después del primer
     tanqueo ÷ las horas que avanzó el horómetro. */
  function consumo(lista, desde, hasta){
    var por = {};
    lista.forEach(function(t){ if (!t.dudoso && t.fecha >= desde && t.fecha <= hasta) (por[t.cod] = por[t.cod] || []).push(t); });
    var out = {};
    Object.keys(por).forEach(function(c){
      var l = por[c].filter(function(t){ return t.lec > 0; }), gal = 0, avance = 0;
      for (var i = 1; i < l.length; i++){
        var d = l[i].lec - l[i - 1].lec;
        if (d <= 0 || d > (l[i].km ? 3000 : 300)) continue;    // lectura mal digitada: no se cuenta
        gal += l[i].gal; avance += d;
      }
      var x = { gal: por[c].reduce(function(a, t){ return a + t.gal; }, 0), n:por[c].length, km:por[c][0].km, galCons:gal, avance:avance };
      // con pocas horas el resultado depende de cuánto se llenó cada vez: no se calcula
      x.tasa = avance >= (x.km ? 300 : 40) && gal > 0 ? (x.km ? avance / gal : gal / avance) : null;
      out[c] = x;
    });
    return out;
  }

  /* Mantenimiento preventivo: solo lo que registra el Taller (Mtto en
     maestros.js) con el último horómetro que anotan los operarios. Lo que
     traía el preoperativo anterior no se toma. */
  function mantenimiento(){
    return maquinaria().map(function(m){
      var e = window.Mtto ? Mtto.estado(m.cod) : { nivel:'sindato' };
      return { cod:m.cod, nivel:e.nivel, faltan:e.faltan };
    });
  }

  /* ---------------- indicadores ---------------- */
  function indicadores(D){
    var hy = hoy(), mesIni = hy.slice(0, 8) + '01';
    var pm = sumar(mesIni, -1), pmIni = pm.slice(0, 8) + '01';
    // el mismo tramo del mes anterior (del 1 al mismo día) para comparar lo que se acumula
    var pmMismo = sumar(pmIni, Math.min(dias(mesIni, hy), dias(pmIni, pm)));
    var nombreMes = MESES[+hy.slice(5, 7) - 1], nombrePrev = MESES[+pm.slice(5, 7) - 1];
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
      var d0 = new Date(+mesIni.slice(0, 4), +mesIni.slice(5, 7) - 1 - i, 1), ini = iso(d0), fin = iso(new Date(d0.getFullYear(), d0.getMonth() + 1, 0));
      if (fin > hy) fin = hy;
      var sin = !D.inicio || fin < D.inicio.slice(0, 8) + '01';
      var x = sin ? null : disponibilidad(D, ini, fin).pct;
      tend.push({ mes: MESES[d0.getMonth()].slice(0, 3), v:x });
      if (x != null) mesesConDatos.push(x);
    }
    var dm = disponibilidad(D, mesIni, hy), dp = tend[4].v;
    ind({ id:'mes', grupo:'flota', titulo:'Disponibilidad de ' + nombreMes, valor: dm.pct == null ? '—' : Math.round(dm.pct) + '%',
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
      corta: mas30.length ? 'Decidir si se consigue el repuesto, se manda a taller externo o se da de baja: ' + mas30.map(function(x){ return x.cod + ' (' + x.d + ' días)'; }).join(', ') + '.' : '' });

    /* 4. Fallas del mes */
    var fm = fallasEntre(D, mesIni, hy), fp = fallasEntre(D, pmIni, pmMismo);
    var mttr = fm.length ? fm.reduce(function(a, e){ return a + duracion(e); }, 0) / fm.length : null;
    ind({ id:'fallas', grupo:'flota', titulo:'Fallas nuevas en ' + nombreMes, valor: String(fm.length),
      nivel: !fm.length ? 'verde' : (mttr > 15 ? 'rojo' : (fm.length > fp.length || mttr > 5) ? 'ambar' : 'verde'),
      linea: mttr == null ? 'Sin fallas nuevas este mes' : 'Cada falla deja la máquina ' + g1(mttr) + ' días parada en promedio',
      comp: comparar(fm.length, fp.length, '', true, 'el mismo tramo de ' + nombrePrev, true),
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

    /* 7. Mantenimiento preventivo */
    var mt = mantenimiento(), venc = mt.filter(function(m){ return m.nivel === 'vencido'; }), prox = mt.filter(function(m){ return m.nivel === 'proximo'; });
    var conDato = mt.filter(function(m){ return m.nivel !== 'sindato' && m.nivel !== 'sinhorometro'; });
    ind({ id:'mtto', grupo:'flota', titulo:'Mantenimiento preventivo', valor: conDato.length ? String(venc.length) : '—',
      nivel: !conDato.length ? 'gris' : venc.length ? 'rojo' : prox.length ? 'ambar' : 'verde',
      linea: !conDato.length ? 'Sin registrar todavía en el Taller' : venc.length ? plural(venc.length, 'máquina con el mantenimiento vencido', 'máquinas con el mantenimiento vencido') :
        prox.length ? plural(prox.length, 'máquina le toca', 'máquinas les toca') + ' en menos de 25 horas' : 'Al día las ' + conDato.length + ' máquinas registradas',
      detalle: [venc.concat(prox).map(function(m){ return m.cod + (m.faltan <= 0 ? ' · vencido hace ' + g1(-m.faltan) + ' h' : ' · faltan ' + g1(m.faltan) + ' h'); }).join(' — '),
        conDato.length && conDato.length < mt.length ? (mt.length - conDato.length) + ' de ' + mt.length + ' máquinas sin mantenimiento registrado en el Taller' : ''].filter(Boolean).join('. '),
      accion: venc.length ? 'Hacer el mantenimiento y registrarlo en el Taller: ' + venc.map(function(m){ return m.cod; }).join(', ') + '. Una máquina sin mantenimiento es la próxima en parar.' : '' });

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
      linea: 'De los días trabajados en ' + nombreMes + ', con revisión antes de arrancar',
      detalle: laboral(hy) ? 'Hoy: ' + preHoy + ' preoperativos' + (progHoy ? ' de ' + progHoy + ' máquinas programadas' : '') : 'Hoy no es día laboral',
      accion: u.prePct != null && u.prePct < 90 ? 'Hay máquinas saliendo sin revisión: así no se ven a tiempo los daños.' : '' });

    /* 10. Combustible */
    var T = D.tanq.filter(function(t){ return !t.dudoso; }), dud = D.tanq.filter(function(t){ return t.dudoso && t.fecha >= mesIni; }), M = T.filter(function(t){ return t.fecha >= mesIni && t.fecha <= hy; }), P = T.filter(function(t){ return t.fecha >= pmIni && t.fecha <= pmMismo; });
    function suma(l, k){ return l.reduce(function(a, t){ return a + t[k]; }, 0); }
    var galM = suma(M, 'gal'), galP = suma(P, 'gal'), costoM = suma(M, 'costo');
    var cm = consumo(T, mesIni, hy), c3 = consumo(T, sumar(mesIni, -90), sumar(mesIni, -1));
    function flotaTasa(c){ var gal = 0, h = 0; Object.keys(c).forEach(function(k){ if (!c[k].km && c[k].tasa != null){ gal += c[k].galCons; h += c[k].avance; } }); return h >= 20 ? gal / h : null; }
    var tasaM = flotaTasa(cm), tasa3 = flotaTasa(c3), varTasa = tasaM != null && tasa3 ? (tasaM - tasa3) / tasa3 * 100 : null;
    ind({ id:'comb', grupo:'combustible', titulo:'Combustible de ' + nombreMes, valor: T.length ? g1(galM) + ' gal' : '—',
      nivel: !T.length ? 'gris' : varTasa == null ? 'verde' : varTasa > 30 ? 'rojo' : varTasa > 15 ? 'ambar' : 'verde',
      linea: !T.length ? 'Todavía no hay tanqueos en la app de Tanqueo' : plural(M.length, 'tanqueo', 'tanqueos') + (costoM ? ' · ' + peso(costoM) : '') +
        (tasaM != null ? ' · ' + g1(tasaM) + ' gal por hora de trabajo' : ''),
      comp: (galP ? comparar(galM, galP, ' gal', true, 'el mismo tramo de ' + nombrePrev, true, 1).replace(/ftc-c (mejor|peor)/, 'ftc-c igual') : '') +
        (dud.length ? '<div class="ftc-c igual">No se contó ' + (dud.length === 1 ? 'un tanqueo mal digitado' : dud.length + ' tanqueos mal digitados') + ': ' +
          dud.map(function(t){ return t.cod + ' ' + dcorta(t.fecha) + ' (' + g1(t.gal) + ' gal)'; }).join(', ') + '</div>' : '') +
        (varTasa != null ? '<div class="ftc-c ' + (varTasa > 15 ? 'peor' : varTasa < -5 ? 'mejor' : 'igual') + '">' + (Math.abs(varTasa) < 5 ? 'Consumo por hora normal' : 'Consumo por hora ' + (varTasa > 0 ? '▲ ' : '▼ ') + Math.round(Math.abs(varTasa)) + '% vs. los 3 meses anteriores') + '</div>' : '') });

    /* 11. Consumo fuera de lo normal por máquina */
    var comparables = Object.keys(cm).filter(function(c){ return cm[c].tasa != null && c3[c] && c3[c].tasa != null; });
    var raras = comparables.map(function(c){
      var a = cm[c].tasa, b = c3[c].tasa, v = cm[c].km ? (b - a) / b * 100 : (a - b) / b * 100;   // en camiones, menos km/gal es peor
      return { cod:c, v:v, a:a, b:b, km:cm[c].km };
    }).filter(function(x){ return x.v > 25; }).sort(function(a, b){ return b.v - a.v; });
    var alertasApp = M.filter(function(t){ return t.just; });
    ind({ id:'consumo', grupo:'combustible', titulo:'Consumo fuera de lo normal', valor: comparables.length || alertasApp.length ? String(raras.length + alertasApp.length) : '—',
      nivel: raras.some(function(x){ return x.v > 50; }) ? 'rojo' : (raras.length || alertasApp.length) ? 'ambar' : comparables.length ? 'verde' : 'gris',
      linea: raras.length ? plural(raras.length, 'máquina gasta', 'máquinas gastan') + ' más de lo que gastaban' : alertasApp.length ? plural(alertasApp.length, 'tanqueo marcado', 'tanqueos marcados') + ' por el almacén' :
        comparables.length ? 'Cada máquina gasta lo de siempre' : 'Se podrá comparar cuando la app de Tanqueo tenga más de un mes de datos',
      detalle: raras.map(function(x){ return x.cod + ': ' + g1(x.a) + (x.km ? ' km/gal' : ' gal/h') + ' (antes ' + g1(x.b) + ')'; })
        .concat(alertasApp.map(function(t){ return t.cod + ' ' + dcorta(t.fecha) + ': ' + t.just; })).slice(0, 5).join(' — '),
      accion: raras.length ? 'Revisar si es el motor (filtros, inyección), el trabajo que hizo o el combustible que se le está entregando: ' + raras.map(function(x){ return x.cod; }).join(', ') + '.' : '' });

    /* 12. Tanque del almacén */
    var mov = D.tanque, ajustes = mov.filter(function(m){ return m.tipo === 'AJUSTE' && m.fecha >= mesIni; });
    var faltante = ajustes.reduce(function(a, m){ return a + (m.dif < 0 ? -m.dif : 0); }, 0);
    var conSaldo = T.filter(function(t){ return t.saldo != null; }), saldo = conSaldo.length ? conSaldo[conSaldo.length - 1].saldo : null;
    var reqAb = D.alertas.filter(function(a){ return a.abierta; });
    var hayTanque = mov.length || conSaldo.length || D.alertas.length;
    var limFalt = Math.max(10, galM * 0.02);
    ind({ id:'tanque', grupo:'combustible', titulo:'Tanque del almacén', valor: saldo == null ? '—' : g1(saldo) + ' gal',
      nivel: !hayTanque ? 'gris' : faltante > limFalt ? 'rojo' : (reqAb.length || faltante > 0) ? 'ambar' : 'verde',
      linea: !hayTanque ? 'Sin movimientos del tanque todavía' : faltante > 0 ? 'Al medir el tanque faltaron ' + g1(faltante) + ' gal este mes' : 'Lo medido cuadra con lo despachado',
      detalle: (reqAb.length ? 'Requisición de combustible abierta (saldo bajo) desde el ' + dcorta(reqAb[reqAb.length - 1].fecha) : '') ,
      accion: faltante > limFalt ? 'Falta combustible en el tanque que no está en ningún despacho (' + g1(faltante) + ' gal). Revisar fugas o salidas sin registrar.' :
        reqAb.length ? 'El tanque está bajo y la requisición sigue abierta: confirmar la compra.' : '' });

    /* 13. Programación de hoy */
    var progD = D.prog[hy] || {}, progTaller = Object.keys(progD).filter(function(c){ return paradas[c]; });
    var sinProg = trab.filter(function(f){ return !progD[f.cod]; });
    ind({ id:'proghoy', grupo:'operacion', titulo:'Programación de hoy', valor: laboral(hy) ? progHoy + ' de ' + trab.length : '—',
      nivel: !laboral(hy) ? 'gris' : !Object.keys(progD).length ? 'ambar' : (progTaller.length || progHoy < trab.length * 0.8) ? 'ambar' : 'verde',
      linea: !laboral(hy) ? 'Hoy no es día laboral' : !Object.keys(progD).length ? 'Hoy no hay programación registrada' : 'Máquinas buenas con labor asignada hoy',
      detalle: [sinProg.length && Object.keys(progD).length ? 'Buenas sin programar: ' + sinProg.map(function(f){ return f.cod; }).join(', ') : '',
        progTaller.length ? 'Programadas pero están en taller: ' + progTaller.join(', ') : ''].filter(Boolean).join(' — '),
      accion: progTaller.length ? 'Se programaron máquinas que están en el taller (' + progTaller.join(', ') + '): esa labor no se va a hacer.' : '' });

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
    var hM = horas(mesIni, hy), hP = horas(pmIni, pmMismo), hDia = hM.dias ? hM.t / hM.dias : null;
    ind({ id:'horas', grupo:'operacion', titulo:'Horas trabajadas en ' + nombreMes, valor: hM.t ? g1(hM.t) + ' h' : '—',
      nivel: !hM.t ? 'gris' : (hP.t && hM.t < hP.t * 0.8) || hDia < 5 ? 'ambar' : 'verde',
      linea: !hM.t ? 'Sin cierres de jornada con horómetro' : 'Promedio ' + g1(hDia) + ' h por máquina en cada jornada',
      comp: hP.t ? comparar(hM.t, hP.t, ' h', false, 'el mismo tramo de ' + nombrePrev, true, 1) : '',
      detalle: hDia != null && hDia < 5 ? 'Jornadas cortas: menos de 5 horas de motor por máquina al día.' : '' });

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
    var X = { mes:nombreMes, maquinas: FLOTA.map(function(f){
      var perd = { falla:0, mantenimiento:0 };
      labM.forEach(function(d){ var t = paradoEl(D, f.cod, d); if (t) perd[t]++; });
      var par = paradas[f.cod], pend = D.pend.filter(function(n){ return n.cod === f.cod; });
      var k = f.cod + '|' + hy;
      return { cod:f.cod, nombre:f.nombre, camion:f.grupo === 'transporte',
        hoy: par ? { c:'rojo', t:'En taller · ' + plural(Math.max(0, dias(par.inicio, hy)), 'día', 'días'), d:par.txt } :
          pend.some(function(n){ return n.urgente; }) ? { c:'ambar', t:'Trabaja con daño urgente', d:pend[0].txt } :
          pend.length ? { c:'ambar', t:'Trabaja con pendiente', d:pend[0].txt } : { c:'verde', t:'Trabaja', d:'' },
        disp: labM.length ? (labM.length - perd.falla - perd.mantenimiento) / labM.length * 100 : null, perdF:perd.falla, perdM:perd.mantenimiento,
        fallas90: D.eventos.filter(function(e){ return e.cod === f.cod && e.tipo === 'falla' && e.inicio >= desde90; }).length,
        mtto: porMtto[f.cod] || null, pend:pend.length,
        prog: progD[f.cod] || null, pre: D.pre[k] || null, cierre: cierHoy[f.cod] != null ? cierHoy[f.cod] : null, horasMes: hM.p[f.cod] || 0 };
    }) };
    var sis = {};
    D.eventos.forEach(function(e){
      if (e.tipo !== 'falla' || e.inicio < desde90 || !eq(e.cod) || esCamion(e.cod)) return;
      var k = e.fin ? (SISTEMAS[e.sistema] || 'Otro') : 'Sin alta todavía';
      var x = sis[k] = sis[k] || { k:k, n:0, d:0 }; x.n++; x.d += duracion(e);
    });
    X.sistemas = Object.keys(sis).map(function(k){ return sis[k]; }).sort(function(a, b){ return b.n - a.n || b.d - a.d; });
    X.comb = Object.keys(cm).map(function(c){ var x = cm[c], e = eq(c) || {}, a = c3[c];
      return { cod:c, nombre:e.nombre || '', n:x.n, gal:x.gal, costo:M.filter(function(t){ return t.cod === c; }).reduce(function(s, t){ return s + t.costo; }, 0),
        tasa:x.tasa, antes: a && a.tasa != null ? a.tasa : null, km:x.km };
    }).sort(function(a, b){ return b.gal - a.gal; });
    X.tanqueos = T.slice(-10).reverse();
    X.mov = D.tanque.slice(-8).reverse();
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
  function barras(l, clase, vacio){
    if (!l.length) return '<div class="ft-vacio">' + esc(vacio) + '</div>';
    var max = Math.max.apply(null, l.map(function(x){ return x.v; })) || 1;
    return '<div class="ft-bars">' + l.map(function(x){
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
    var clave = { flota:['hoy', 'mes'], operacion:['proghoy', 'preop'], combustible:['comb', 'tanque'] };
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
    var perd = maqs.filter(function(m){ return m.perdF + m.perdM; }).sort(function(a, b){ return (b.perdF + b.perdM) - (a.perdF + a.perdM); })
      .map(function(m){ var t = m.perdF + m.perdM; return { k:m.cod, v:t, lbl:plural(t, 'día', 'días'), t:m.cod + ' ' + m.nombre + ': ' + m.perdF + ' por falla, ' + m.perdM + ' por mantenimiento' }; });
    function fila(m){
      var mt = m.mtto, txtM = !mt || mt.nivel === 'sindato' ? '<span class="ft-mute">Sin registrar</span>' :
        mt.nivel === 'sinhorometro' ? '<span class="ft-mute">Sin horómetro</span>' :
        mt.nivel === 'vencido' ? pill('rojo', 'Vencido ' + g1(-mt.faltan) + ' h') :
        mt.nivel === 'proximo' ? pill('ambar', 'Faltan ' + g1(mt.faltan) + ' h') : pill('verde', 'Al día');
      return [maq(m), pill(m.hoy.c, m.hoy.t) + (m.hoy.d ? '<div class="ft-sub">' + esc(m.hoy.d) + '</div>' : ''),
        m.disp == null ? '—' : '<span class="' + (m.disp >= META ? 'ft-ok' : m.disp >= 75 ? 'ft-al' : 'ft-ma') + '">' + Math.round(m.disp) + '%</span>',
        String(m.perdF + m.perdM), String(m.fallas90), m.camion ? '—' : txtM, m.pend ? String(m.pend) : '—'];
    }
    var cols = [{ t:'Máquina' }, { t:'Hoy' }, { t:'Disp. ' + X.mes, n:1 }, { t:'Días perdidos', n:1 }, { t:'Fallas 3 meses', n:1 }, { t:'Mantenimiento' }, { t:'Pendientes', n:1 }];
    return '<div class="ft-grid">' + I.filter(function(x){ return x.grupo === 'flota'; }).map(tarjeta).join('') + '</div>' +
      '<div class="ft-dos">' +
        bloque('Días perdidos en ' + X.mes, 'Días laborales que cada máquina estuvo en taller. Son las que bajan la disponibilidad.', barras(perd, 'rojo', 'Ninguna máquina ha perdido días este mes.')) +
        bloque('Fallas por sistema', 'Fallas de los últimos 3 meses y días parados que dejaron.', barras(X.sistemas.map(function(x){
          return { k:x.k, v:x.n, lbl:plural(x.n, 'falla', 'fallas') + ' · ' + x.d + ' d', t:x.k + ': ' + x.n + ' fallas, ' + x.d + ' días parados' }; }), 'gris', 'Sin fallas en los últimos 3 meses.')) +
      '</div>' +
      bloque('Estado de cada máquina', '', tabla(cols, maqs.map(fila))) +
      (cams.length ? bloque('Camiones', 'No entran en la disponibilidad de la maquinaria.', tabla(cols, cams.map(fila))) : '');
  }
  function pOperacion(I, X){
    var maqs = X.maquinas.filter(function(m){ return !m.camion; });
    var hrs = maqs.filter(function(m){ return m.horasMes; }).sort(function(a, b){ return b.horasMes - a.horasMes; })
      .map(function(m){ return { k:m.cod, v:m.horasMes, lbl:g1(m.horasMes) + ' h', t:m.cod + ' ' + m.nombre }; });
    var hoyF = maqs.slice().sort(function(a, b){ return (a.hoy.c === 'rojo') - (b.hoy.c === 'rojo'); }).map(function(m){
      return [maq(m), pill(m.hoy.c, m.hoy.c === 'rojo' ? 'En taller' : 'Buena'),
        m.prog ? esc(m.prog.labor || 'Programada') + (m.prog.op ? '<div class="ft-sub">' + esc(m.prog.op) + '</div>' : '') : '<span class="ft-mute">Sin programar</span>',
        m.pre ? pill('verde', 'Hecho' + (m.pre.hora ? ' ' + m.pre.hora : '')) + (m.pre.op ? '<div class="ft-sub">' + esc(m.pre.op) + '</div>' : '') :
          (m.prog && m.hoy.c !== 'rojo' ? pill('rojo', 'Falta') : '<span class="ft-mute">—</span>'),
        m.cierre != null ? g1(m.cierre) + ' h' : '<span class="ft-mute">—</span>'];
    });
    return '<div class="ft-grid">' + I.filter(function(x){ return x.grupo === 'operacion'; }).map(tarjeta).join('') + '</div>' +
      bloque('Hoy, máquina por máquina', 'Programación, preoperativo y horas del cierre de jornada de hoy.',
        tabla([{ t:'Máquina' }, { t:'Estado' }, { t:'Labor programada' }, { t:'Preoperativo' }, { t:'Horas hoy', n:1 }], hoyF)) +
      bloque('Horas trabajadas en ' + X.mes, 'Horas de motor según el horómetro del cierre de jornada.', barras(hrs, 'verde', 'Todavía no hay cierres de jornada con horómetro este mes.'));
  }
  function pCombustible(I, X){
    var filas = X.comb.map(function(x){
      var cons = x.tasa == null ? '<span class="ft-mute">Falta historia</span>' : g1(x.tasa) + (x.km ? ' km/gal' : ' gal/h');
      var antes = x.antes == null || x.tasa == null ? '—' : (function(){ var v = x.km ? (x.antes - x.tasa) / x.antes * 100 : (x.tasa - x.antes) / x.antes * 100;
        return v > 25 ? pill(v > 50 ? 'rojo' : 'ambar', '▲ ' + Math.round(v) + '%') : Math.abs(v) < 5 ? '<span class="ft-mute">igual</span>' : (v > 0 ? '▲ ' : '▼ ') + Math.round(Math.abs(v)) + '%'; })();
      return [maq(x), String(x.n), g1(x.gal), x.costo ? peso(x.costo) : '—', cons, antes];
    });
    var tq = X.tanqueos.map(function(t){ return ['<span class="ft-nw">' + dcorta(t.fecha) + '</span>' + (t.hora ? '<div class="ft-sub">' + esc(t.hora) + '</div>' : ''), '<b class="ft-cod">' + esc(t.cod) + '</b>', g1(t.gal),
      t.lec == null ? '—' : g1(t.lec), esc(t.recibe || ''), t.just ? '<span class="ft-alerta">' + esc(t.just) + '</span>' : ''];
    });
    var mv = X.mov.map(function(m){ return [dcorta(m.fecha), m.tipo === 'LLEGADA' ? 'Llegada' : 'Medición', g1(m.gal),
      m.tipo === 'AJUSTE' ? (m.dif < 0 ? pill('rojo', 'Faltan ' + g1(-m.dif)) : m.dif > 0 ? pill('ambar', 'Sobran ' + g1(m.dif)) : pill('verde', 'Cuadra')) : '', esc(m.nota)]; });
    return '<div class="ft-grid">' + I.filter(function(x){ return x.grupo === 'combustible'; }).map(tarjeta).join('') + '</div>' +
      bloque('Consumo por máquina en ' + X.mes, 'Galones despachados y consumo por hora de motor (km por galón en camiones), comparado con los 3 meses anteriores.',
        tabla([{ t:'Máquina' }, { t:'Tanqueos', n:1 }, { t:'Galones', n:1 }, { t:'Costo', n:1 }, { t:'Consumo', n:1 }, { t:'vs. antes', n:1 }], filas, 'Todavía no hay tanqueos este mes en la app de Tanqueo.')) +
      '<div class="ft-dos">' +
        bloque('Últimos tanqueos', '', tabla([{ t:'Fecha' }, { t:'Máquina' }, { t:'Galones', n:1 }, { t:'Horómetro', n:1 }, { t:'Recibió' }, { t:'Alerta' }], tq, 'Todavía no hay tanqueos.')) +
        bloque('Movimientos del tanque', 'Llegadas de combustible y mediciones del tanque.', tabla([{ t:'Fecha' }, { t:'Tipo' }, { t:'Galones', n:1 }, { t:'Medición' }, { t:'Nota' }], mv, 'Sin movimientos todavía.')) +
      '</div>';
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
    var disp = disponibilidad(D, desde, hasta), u = uso(D, desde, hasta), h = 0, hd = 0;
    (window.Horometros ? Horometros.cierres() : []).forEach(function(c){
      if (c.fecha >= desde && c.fecha <= hasta && c.horas != null && eq(c.cod) && !esCamion(c.cod)){ h += c.horas; hd++; }
    });
    var T = D.tanq.filter(function(t){ return !t.dudoso && t.fecha >= desde && t.fecha <= hasta; });
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

  function informe(w, obs){
    var D = DATOS, I = ULT.R.I;
    var A = periodo(D, w.desde, w.hasta), P = periodo(D, sumar(w.desde, -7), sumar(w.hasta, -7));
    var ind = {}; I.forEach(function(x){ ind[x.id] = x; });
    var k = [
      { t:'Disponibilidad', v: A.disp == null ? '—' : Math.round(A.disp) + '%', n:nivelPct(A.disp, META, 75), d: difTxt(A.disp, P.disp, ' pts'), s:'Meta ' + META + '% · ' + plural(A.perdidos, 'día-máquina perdido', 'días-máquina perdidos') },
      { t:'Fallas nuevas', v:String(A.fallas.length), n: A.fallas.length > P.fallas.length ? 'ambar' : 'verde', d: difTxt(A.fallas.length, P.fallas.length, '', true), s:'Máquinas que entraron al taller por daño' },
      { t:'Horas trabajadas', v: A.horas ? g1(A.horas) + ' h' : '—', n: !A.horas ? 'gris' : P.horas && A.horas < P.horas * 0.8 ? 'ambar' : 'verde', d: P.horas ? difTxt(A.horas, P.horas, ' h', false, 1) : '',
        s: A.jornadas ? g1(A.horas / A.jornadas) + ' h por máquina en cada jornada' : 'Sin cierres de jornada con horómetro' },
      { t:'Uso de la maquinaria', v: A.uso == null ? '—' : Math.round(A.uso) + '%', n:nivelPct(A.uso, 80, 60), d: difTxt(A.uso, P.uso, ' pts'), s:'Días buenas con trabajo registrado' },
      { t:'Preoperativos', v: A.pre == null ? '—' : Math.round(A.pre) + '%', n:nivelPct(A.pre, 90, 70), d: difTxt(A.pre, P.pre, ' pts'), s:'Días trabajados con revisión al arrancar' },
      { t:'Combustible', v: A.tanqueos ? g1(A.gal) + ' gal' : '—', n: A.tanqueos ? 'verde' : 'gris', d: P.tanqueos ? difTxt(A.gal, P.gal, ' gal', true, 1).replace(/class="(me|pe)"/, 'class="ig"') : '',
        s: A.tanqueos ? plural(A.tanqueos, 'tanqueo', 'tanqueos') + (A.costo ? ' · ' + peso(A.costo) : '') : 'Sin tanqueos en la app de Tanqueo' }
    ];
    var riesgos = ['largas', 'riesgo', 'repetidas', 'mtto', 'consumo', 'tanque'].map(function(id){ return ind[id]; })
      .filter(function(x){ return x && (x.nivel === 'rojo' || x.nivel === 'ambar'); });
    var todos = k.map(function(x){ return x.n; }).concat(riesgos.map(function(x){ return x.nivel; }));
    var nivel = todos.indexOf('rojo') >= 0 ? 'rojo' : todos.indexOf('ambar') >= 0 ? 'ambar' : 'verde';
    var veredicto = { rojo:'La flota necesita decisiones de gerencia', ambar:'La flota está trabajando, con puntos para vigilar', verde:'La flota está bien' }[nivel];

    // máquinas en taller al cierre de la semana y movimiento de la semana
    var enT = FLOTA.map(function(f){
      var e = D.eventos.filter(function(x){ return x.cod === f.cod && x.inicio <= w.hasta && (!x.fin || x.fin > w.hasta); })[0];
      return e ? { f:f, e:e, d:dias(e.inicio, w.hasta) } : null;
    }).filter(Boolean).sort(function(a, b){ return b.d - a.d; });
    var entraron = D.eventos.filter(function(e){ return eq(e.cod) && e.inicio >= w.desde && e.inicio <= w.hasta; });
    var salieron = D.eventos.filter(function(e){ return eq(e.cod) && e.fin && e.fin >= w.desde && e.fin <= w.hasta; });
    var acciones = I.filter(function(x){ return x.accion && (x.nivel === 'rojo' || x.nivel === 'ambar'); })
      .sort(function(a, b){ return (a.nivel === 'rojo' ? 0 : 1) - (b.nivel === 'rojo' ? 0 : 1); });

    var sups = (window.Maestros && Maestros.get('SUPERVISORES')) || [];
    var supte = sups.filter(function(x){ return x.activo !== false && /superintendente/i.test(x.cargo || ''); })[0];
    var quien = supte ? supte.nombre : ((el('tb-user-name') || {}).textContent || '');

    var h = '<div class="fi">' +
      '<div class="fi-cab"><div><div class="fi-emp">Palma Grande S.A.S. · Maquinaria y combustible</div><h1>Informe semanal para gerencia</h1>' +
        '<div class="fi-per">Semana ' + txtSemana(w) + '</div></div>' +
        '<div class="fi-meta">Preparó: <b>' + esc(quien || 'Superintendente') + '</b><br>Superintendente de Plantación<br>Generado el ' + larga(hoy()) + ' de ' + hoy().slice(0, 4) + '</div></div>' +
      '<div class="fi-ver ' + nivel + '"><b>' + veredicto + '.</b> ' +
        (enT.filter(function(x){ return !x.f.grupo || x.f.grupo !== 'transporte'; }).length + ' de ' + maquinaria().length + ' máquinas en taller al cierre de la semana') +
        (riesgos.length ? ' · ' + plural(riesgos.length, 'riesgo abierto', 'riesgos abiertos') : '') + '.</div>' +
      '<div class="fi-k">' + k.map(function(x){
        return '<div class="fi-kc ' + x.n + '"><div class="t">' + x.t + '</div><div class="v">' + esc(x.v) + '</div><div class="s">' + esc(x.s) + '</div><div class="d">' + x.d + '</div></div>';
      }).join('') + '</div>';

    h += '<div class="fi-dos"><div><h2>Máquinas en taller al ' + larga(w.hasta) + '</h2>' + (enT.length ? '<table><thead><tr><th>Máquina</th><th class="n">Días</th><th>Causa</th></tr></thead><tbody>' +
        enT.slice(0, 9).map(function(x){ return '<tr><td><b>' + esc(x.f.cod) + '</b> ' + esc(x.f.nombre) + '</td><td class="n">' + x.d + '</td><td>' + esc(x.e.txt.length > 95 ? x.e.txt.slice(0, 92) + '…' : x.e.txt) + '</td></tr>'; }).join('') +
        (enT.length > 9 ? '<tr><td colspan="3">y ' + (enT.length - 9) + ' más</td></tr>' : '') + '</tbody></table>' : '<p>Ninguna máquina en taller.</p>') + '</div>' +
      '<div><h2>Lo que pasó en la semana</h2><ul>' +
        '<li><b>Entraron al taller:</b> ' + (entraron.length ? entraron.map(function(e){ return esc(e.cod) + ' (' + (e.tipo === 'mantenimiento' ? 'mantenimiento' : esc(e.txt)) + ')'; }).join('; ') : 'ninguna') + '.</li>' +
        '<li><b>Salieron reparadas:</b> ' + (salieron.length ? salieron.map(function(e){ return esc(e.cod) + ' (' + plural(dias(e.inicio, e.fin), 'día', 'días') + ' parada)'; }).join('; ') : 'ninguna') + '.</li>' +
        (A.fallas.length ? '<li><b>Fallas nuevas:</b> ' + A.fallas.map(function(e){ return esc(e.cod); }).join(', ') + '.</li>' : '') +
        '</ul>' +
        '<h2>Riesgos abiertos hoy</h2>' + (riesgos.length ? '<ul>' + riesgos.map(function(x){
          return '<li class="' + x.nivel + '"><b>' + esc(x.titulo) + ':</b> ' + esc(x.linea) + (x.detalle ? '. <span class="g">' + esc(x.detalle.length > 160 ? x.detalle.slice(0, 157) + '…' : x.detalle) + '</span>' : '') + '</li>';
        }).join('') + '</ul>' : '<p>Sin riesgos abiertos.</p>') + '</div></div>';

    h += '<h2>Decisiones y acciones</h2>' + (acciones.length ? '<ol>' + acciones.slice(0, 6).map(function(x){
        var a = x.corta || x.accion;
        return '<li><b>' + esc(x.titulo) + '.</b> ' + esc(a.length > 260 ? a.slice(0, 257) + '…' : a) + '</li>'; }).join('') + '</ol>' : '<p>No hay decisiones pendientes esta semana.</p>');
    if (obs) h += '<h2>Observaciones del Superintendente</h2><p class="fi-obs">' + esc(obs) + '</p>';
    h += '<div class="fi-fir"><div>' + esc(quien || 'Superintendente') + '<span>Superintendente de Plantación</span></div><div>&nbsp;<span>Gerencia · recibió</span></div></div>' +
      '<div class="fi-pie">Datos del sistema de maquinaria (Taller, Programación, Preoperativo y app de Tanqueo). Disponibilidad = días laborales sin estar en taller ÷ días laborales (lunes a sábado sin festivos). ' +
      'Uso = días con programación, preoperativo o cierre ÷ días que la máquina estaba buena. Los camiones no entran en la disponibilidad.</div></div>';

    var pr = el('ft-print');
    if (!pr){ pr = document.createElement('div'); pr.id = 'ft-print'; document.body.appendChild(pr); }
    pr.innerHTML = h;
    document.body.classList.add('ft-imprimiendo');
    var quitar = function(){ document.body.classList.remove('ft-imprimiendo'); window.removeEventListener('afterprint', quitar); };
    window.addEventListener('afterprint', quitar);
    setTimeout(function(){ window.print(); }, 150);
  }

  /* ventana para elegir la semana y escribir las observaciones */
  function abrirInforme(){
    if (!DATOS){ var b = el('ft-informe'); if (b) b.textContent = 'Espere, consultando…'; return; }
    var S = semanas(), m = el('ft-modal');
    if (!m){ m = document.createElement('div'); m.id = 'ft-modal'; document.body.appendChild(m); }
    function clave(w){ return 'ft_obs_' + w.desde; }
    function leerObs(w){ try { return localStorage.getItem(clave(w)) || ''; } catch(e){ return ''; } }
    m.innerHTML = '<div class="ft-mod"><div class="ft-mod-h">Informe semanal para gerencia</div>' +
      '<label class="ft-op"><input type="radio" name="ft-sem" value="pasada" checked> <span><b>Semana pasada</b><br>' + txtSemana(S.pasada) + '</span></label>' +
      '<label class="ft-op"><input type="radio" name="ft-sem" value="actual"> <span><b>Esta semana, hasta hoy</b><br>' + txtSemana(S.actual) + '</span></label>' +
      '<label class="ft-obs-l">Observaciones del Superintendente (opcional)<textarea id="ft-obs" rows="4" placeholder="Lo que gerencia debe saber además de las cifras: compras pedidas, decisiones tomadas, labores atrasadas…"></textarea></label>' +
      '<div class="ft-mod-b"><button type="button" id="ft-mod-no">Cancelar</button><button type="button" id="ft-mod-si">Generar PDF</button></div>' +
      '<div class="ft-mod-n">En la ventana de impresión elija "Guardar como PDF" para enviarlo.</div></div>';
    m.hidden = false;
    var sel = function(){ return S[(m.querySelector('input[name=ft-sem]:checked') || {}).value || 'pasada']; };
    el('ft-obs').value = leerObs(sel());
    m.onchange = function(e){ if (e.target.name === 'ft-sem') el('ft-obs').value = leerObs(sel()); };
    m.onclick = function(e){
      if (e.target === m || e.target.id === 'ft-mod-no') m.hidden = true;
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
    Promise.all([leer('Taller'), talvez('ProgMaquinaria'), talvez('Programacion'), talvez('PreopDiario'), talvez('Preoperativos'),
      talvez('Combustible'), talvez('CombustibleTanque'), talvez('CombustibleAlertas'), mae, hor, viejo])
      .then(function(r){
        FLOTA = window.Maestros ? Maestros.flota() : []; EQ = {};
        FLOTA.forEach(function(f){ EQ[f.cod] = f; });
        var tl = taller(r[0]), al = {};
        (r[7] || []).forEach(function(a){ var id = String(a[3] || '').trim(); if (id) al[id] = { fecha:aIso(a[0]), abierta:String(a[2] || '').trim().toUpperCase() === 'ABIERTA' }; });
        var D = { eventos:tl.eventos, pend:tl.pend, inicio:tl.inicio, prog:programacion(r[1], r[2]), pre:preops(r[3], r[4]),
          tanq:tanqueos(r[5]),
          tanque:(r[6] || []).map(function(m){ return { fecha:aIso(m[0]), tipo:String(m[2] || '').trim().toUpperCase(), gal:num(m[4]) || 0, dif:num(m[6]) || 0, nota:String(m[8] || '').trim() }; }),
          alertas:Object.keys(al).map(function(k){ return al[k]; }), viejo:r[10] };
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
