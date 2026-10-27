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
      if (acc === 'ASIGNAR') (dias[f] = dias[f] || {})[cod] = true;
    });
    Object.keys(dias).forEach(function(f){ nuevas[f] = true; });
    (vieja || []).forEach(function(r){
      var f = aIso(r[0]), cod = codDe(r[2]);
      if (!esFecha(f) || !cod || nuevas[f] || !eq(cod) || !String(r[3] || '').trim()) return;
      (dias[f] = dias[f] || {})[cod] = true;
    });
    return dias;
  }

  /* días con preoperativo por máquina: { 'cod|fecha': true } */
  function preops(nuevo, viejo){
    var o = {};
    (nuevo || []).concat(viejo || []).forEach(function(r){ var f = aIso(r[0]), c = codDe(r[3]); if (c && esFecha(f)) o[c + '|' + f] = true; });
    return o;
  }

  /* Tanqueos: la app de Tanqueo (hoja Combustible, última fila por ID, sin
     anulados) y, para la historia, la hoja Tanqueos del preoperativo anterior.
     Si un mismo día y máquina está en las dos, vale la nueva. */
  function tanqueos(nuevo, viejo){
    var u = {}, l = [], hay = {};
    (nuevo || []).forEach(function(r){ var id = String(r[3] || '').trim(); if (id) u[id] = r; });
    Object.keys(u).forEach(function(k){
      var r = u[k], f = aIso(r[0]), acc = String(r[2] || '').trim().toUpperCase();
      if (acc === 'ANULADO' || !esFecha(f)) return;
      var t = { fecha:f, cod:String(r[4] || '').trim(), gal:num(r[6]) || 0, lec:num(r[7]), km:String(r[8] || '') === 'Km',
        costo:num(r[14]) || 0, saldo:num(r[15]), just:String(r[17] || '').trim(), hora:String(r[1] || ''), nuevo:true };
      if (t.gal > 0){ l.push(t); hay[t.fecha + '|' + t.cod] = true; }
    });
    var visto = {};
    (viejo || []).forEach(function(r){
      var f = aIso(r[0]), c = codDe(r[3]), gal = num(r[6]), lec = num(r[7]), k = f + '|' + c + '|' + gal + '|' + lec;
      if (!esFecha(f) || !c || !(gal > 0) || hay[f + '|' + c] || visto[k] || String(r[5] || '').trim().toLowerCase().indexOf('s') !== 0) return;
      visto[k] = true;    // el mismo tanqueo enviado varias veces por falta de señal
      l.push({ fecha:f, cod:c, gal:gal, lec:lec, km:esCamion(c), costo:0, saldo:null, just:'', hora:String(r[1] || '') });
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

  /* Mantenimiento preventivo: lo que registra el Taller (Mtto en maestros.js);
     si una máquina no tiene ese dato, lo que dice su último preoperativo anterior. */
  function mantenimiento(viejo){
    var ult = {};
    (viejo || []).forEach(function(r){
      var c = codDe(r[3]), f = aIso(r[0]), h = num(r[6]), prox = num(r[8]);
      if (c && esFecha(f) && h > 0 && prox > 0) ult[c] = { fecha:f, h:h, prox:prox };
    });
    return maquinaria().map(function(m){
      var e = window.Mtto ? Mtto.estado(m.cod) : { nivel:'sindato' };
      if (e.nivel !== 'sindato' && e.nivel !== 'sinhorometro') return { cod:m.cod, nivel:e.nivel, faltan:e.faltan, fuente:'taller' };
      var u = ult[m.cod], act = window.Horometros && Horometros.ultimo()[m.cod];
      if (!u || dias(u.fecha, hoy()) > 45) return { cod:m.cod, nivel:'sindato' };
      var h = act && act.h > u.h ? act.h : u.h, faltan = Math.round((u.prox - h) * 10) / 10;
      return { cod:m.cod, nivel: faltan <= 0 ? 'vencido' : faltan <= 25 ? 'proximo' : 'ok', faltan:faltan, fuente:'preoperativo' };
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
      accion: mas30.length ? 'Decidir con el taller: conseguir el repuesto, mandarla a taller externo o darla de baja. ' + mas30.map(function(x){ return x.cod + (x.e.txt ? ' (' + x.e.txt + ')' : ''); }).join('; ') + '.' : '' });

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
    var mt = mantenimiento(D.preViejo), venc = mt.filter(function(m){ return m.nivel === 'vencido'; }), vencT = venc.filter(function(m){ return m.fuente === 'taller'; }), prox = mt.filter(function(m){ return m.nivel === 'proximo'; });
    var conDato = mt.filter(function(m){ return m.nivel !== 'sindato'; });
    ind({ id:'mtto', grupo:'flota', titulo:'Mantenimiento preventivo', valor: conDato.length ? String(venc.length) : '—',
      nivel: !conDato.length ? 'gris' : vencT.length ? 'rojo' : (venc.length || prox.length) ? 'ambar' : 'verde',
      linea: !conDato.length ? 'Sin registrar todavía en el Taller' : venc.length ? plural(venc.length, 'máquina con el mantenimiento vencido', 'máquinas con el mantenimiento vencido') :
        prox.length ? plural(prox.length, 'máquina le toca', 'máquinas les toca') + ' en menos de 25 horas' : 'Todas al día (' + conDato.length + ' de ' + mt.length + ' con dato)',
      detalle: venc.concat(prox).map(function(m){ return m.cod + (m.faltan <= 0 ? ' · vencido hace ' + g1(-m.faltan) + ' h' : ' · faltan ' + g1(m.faltan) + ' h') + (m.fuente === 'preoperativo' ? '*' : ''); }).join(' — ') +
        (venc.concat(prox).some(function(m){ return m.fuente === 'preoperativo'; }) ? '   (* según el último preoperativo: confirmar con el taller)' : ''),
      accion: vencT.length ? 'Hacer el mantenimiento y registrarlo en el Taller: ' + vencT.map(function(m){ return m.cod; }).join(', ') + '. Una máquina sin mantenimiento es la próxima en parar.' :
        venc.length ? 'El preoperativo dice que ' + venc.map(function(m){ return m.cod; }).join(', ') + (venc.length === 1 ? ' tiene' : ' tienen') + ' el mantenimiento vencido. Confirmar con el taller y registrarlo allá.' : '' });

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
      linea: !T.length ? 'Sin tanqueos registrados' : plural(M.length, 'tanqueo', 'tanqueos') + (costoM ? ' · ' + peso(costoM) : '') +
        (tasaM != null ? ' · ' + g1(tasaM) + ' gal por hora de trabajo' : ''),
      comp: (galP ? comparar(galM, galP, ' gal', true, 'el mismo tramo de ' + nombrePrev, true, 1).replace(/ftc-c (mejor|peor)/, 'ftc-c igual') : '') +
        (dud.length ? '<div class="ftc-c igual">No se contó ' + (dud.length === 1 ? 'un tanqueo mal digitado' : dud.length + ' tanqueos mal digitados') + ': ' +
          dud.map(function(t){ return t.cod + ' ' + dcorta(t.fecha) + ' (' + g1(t.gal) + ' gal)'; }).join(', ') + '</div>' : '') +
        (varTasa != null ? '<div class="ftc-c ' + (varTasa > 15 ? 'peor' : varTasa < -5 ? 'mejor' : 'igual') + '">' + (Math.abs(varTasa) < 5 ? 'Consumo por hora normal' : 'Consumo por hora ' + (varTasa > 0 ? '▲ ' : '▼ ') + Math.round(Math.abs(varTasa)) + '% vs. los 3 meses anteriores') + '</div>' : '') });

    /* 11. Consumo fuera de lo normal por máquina */
    var raras = Object.keys(cm).filter(function(c){ return cm[c].tasa != null && c3[c] && c3[c].tasa != null; }).map(function(c){
      var a = cm[c].tasa, b = c3[c].tasa, v = cm[c].km ? (b - a) / b * 100 : (a - b) / b * 100;   // en camiones, menos km/gal es peor
      return { cod:c, v:v, a:a, b:b, km:cm[c].km };
    }).filter(function(x){ return x.v > 25; }).sort(function(a, b){ return b.v - a.v; });
    var alertasApp = M.filter(function(t){ return t.just; });
    ind({ id:'consumo', grupo:'combustible', titulo:'Consumo fuera de lo normal', valor: String(raras.length + alertasApp.length),
      nivel: !T.length ? 'gris' : raras.some(function(x){ return x.v > 50; }) ? 'rojo' : (raras.length || alertasApp.length) ? 'ambar' : 'verde',
      linea: raras.length ? plural(raras.length, 'máquina gasta', 'máquinas gastan') + ' más de lo que gastaban' : alertasApp.length ? plural(alertasApp.length, 'tanqueo marcado', 'tanqueos marcados') + ' por el almacén' : 'Cada máquina gasta lo de siempre',
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

    return I;
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

  function pintar(I, act){
    var rojos = I.filter(function(x){ return x.nivel === 'rojo'; }), ambar = I.filter(function(x){ return x.nivel === 'ambar'; });
    var nivel = rojos.length ? 'rojo' : ambar.length ? 'ambar' : 'verde';
    var titulo = { rojo:'Hay alarmas en la flota', ambar:'Estamos bien, con cosas para mirar', verde:'Estamos bien' }[nivel];
    var sub = nivel === 'verde' ? 'Las máquinas están disponibles, trabajando y gastando lo normal.' :
      [rojos.length ? plural(rojos.length, 'alarma', 'alarmas') + ': ' + rojos.map(function(x){ return x.titulo.toLowerCase(); }).join(', ') : '',
       ambar.length ? plural(ambar.length, 'punto', 'puntos') + ' para mirar' : ''].filter(Boolean).join(' · ') + '.';
    var acciones = rojos.concat(ambar).filter(function(x){ return x.accion; });
    var h = '<div class="ft-ver ' + nivel + '"><div class="ft-luz"><i></i></div><div class="ft-ver-txt"><div class="ft-ver-t">' + titulo + '</div><div class="ft-ver-s">' + esc(sub) + '</div></div>' +
      '<div class="ft-ver-r"><span id="ft-act">' + esc(act) + '</span><button type="button" id="ft-recargar">Actualizar</button></div></div>';
    if (acciones.length){
      h += '<div class="panel ft-acc"><div class="panel-title">Qué hacer</div><ol>' + acciones.map(function(x){
        return '<li class="' + x.nivel + '"><b>' + esc(x.titulo) + '.</b> ' + esc(x.accion) + '</li>'; }).join('') + '</ol></div>';
    }
    GRUPOS.forEach(function(gr){
      var l = I.filter(function(x){ return x.grupo === gr[0]; });
      h += '<div class="ft-sec">' + gr[1] + '</div><div class="ft-grid">' + l.map(tarjeta).join('') + '</div>';
    });
    h += '<div class="ft-pie">Datos del sistema de maquinaria: Taller, Programación, Preoperativo y Tanqueo. Meta de disponibilidad ' + META + '%. ' +
      'Verde = bien · ámbar = mirarlo · rojo = alarma.</div>';
    el('ft-cuerpo').innerHTML = h;
  }

  var cargando = false, listo = false;
  function cargar(){
    if (cargando || !el('ft-cuerpo')) return;
    cargando = true;
    if (!listo) el('ft-cuerpo').innerHTML = '<div class="empty-panel-msg">Consultando el sistema de maquinaria…</div>';
    var b = el('ft-recargar'); if (b){ b.disabled = true; b.textContent = 'Consultando…'; }
    var mae = window.Maestros ? Maestros.traer().catch(function(){}) : Promise.resolve();
    var hor = window.Horometros ? Horometros.traer().catch(function(){}) : Promise.resolve();
    Promise.all([leer('Taller'), talvez('ProgMaquinaria'), talvez('Programacion'), talvez('PreopDiario'), talvez('Preoperativos'),
      talvez('Combustible'), talvez('Tanqueos'), talvez('CombustibleTanque'), talvez('CombustibleAlertas'), mae, hor])
      .then(function(r){
        FLOTA = window.Maestros ? Maestros.flota() : []; EQ = {};
        FLOTA.forEach(function(f){ EQ[f.cod] = f; });
        var tl = taller(r[0]), al = {};
        (r[8] || []).forEach(function(a){ var id = String(a[3] || '').trim(); if (id) al[id] = { fecha:aIso(a[0]), abierta:String(a[2] || '').trim().toUpperCase() === 'ABIERTA' }; });
        var D = { eventos:tl.eventos, pend:tl.pend, inicio:tl.inicio, prog:programacion(r[1], r[2]), pre:preops(r[3], r[4]), preViejo:r[4],
          tanq:tanqueos(r[5], r[6]),
          tanque:(r[7] || []).map(function(m){ return { fecha:aIso(m[0]), tipo:String(m[2] || '').trim().toUpperCase(), dif:num(m[6]) || 0 }; }),
          alertas:Object.keys(al).map(function(k){ return al[k]; }) };
        listo = true;
        pintar(indicadores(D), 'Actualizado ' + new Date().toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' }));
      })
      .catch(function(){
        if (!listo) el('ft-cuerpo').innerHTML = '<div class="empty-panel-msg">No se pudo leer el sistema de maquinaria. Revise la señal e intente otra vez.<br><button type="button" id="ft-recargar" class="ft-btn">Intentar otra vez</button></div>';
        else { var a = el('ft-act'); if (a) a.textContent = 'Sin conexión: se muestran los datos anteriores'; }
      })
      .then(function(){ cargando = false; var b = el('ft-recargar'); if (b){ b.disabled = false; b.textContent = listo ? 'Actualizar' : 'Intentar otra vez'; } });
  }

  document.addEventListener('click', function(e){ if (e.target && e.target.id === 'ft-recargar') cargar(); });
  window.FlotaTablero = { cargar: cargar };
})();
