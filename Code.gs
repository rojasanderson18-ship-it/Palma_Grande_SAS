// =============================================
// PALMA GRANDE S.A.S. - CICLOS DE GESTIÓN
// Google Apps Script Backend v2.1
// =============================================

const SHEET_ID = '1s8f_zb5fJbKi0_x1QF1vleevzNzxt8aZyhS60ZcuVNo';

const SHEETS = {
  cosecha:        'Cosecha',
  tablero:        'Tablero Cosecha',
  mantenimiento:  'Mantenimiento',
  sanidad:        'Sanidad',
  tableroSanidad: 'Tablero Sanidad',
  trampas:        'Trampas',
  trampasCfg:     'Trampas Config',
  anilloRojo:     'Anillo Rojo',
};

const LOTES = [
  {finca:'FINCA 1',lote:'1A',ha:25,tipo:'hibrido'},
  {finca:'FINCA 1',lote:'2A',ha:16,tipo:'hibrido'},
  {finca:'FINCA 1',lote:'3A',ha:16,tipo:'hibrido'},
  {finca:'FINCA 1',lote:'4A',ha:29,tipo:'hibrido'},
  {finca:'FINCA 1',lote:'5',ha:23,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'6',ha:30,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'7',ha:32,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'8',ha:13,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'9',ha:15,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'10',ha:14,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'11',ha:10,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'11A',ha:3,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'12',ha:12,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'13',ha:14,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'14',ha:17,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'15',ha:12,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'16',ha:20,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'17',ha:23,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'18',ha:10,tipo:'guineensis'},
  {finca:'FINCA 1',lote:'18A',ha:4,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'19',ha:24,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'20',ha:19,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'21',ha:16,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'22',ha:19,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'23',ha:15,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'24',ha:22,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'25',ha:11,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'26',ha:11,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'27',ha:17,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'28',ha:13,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'29',ha:22,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'30',ha:23,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'31',ha:20,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'32A',ha:22,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'33A',ha:21,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'34A',ha:12,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'35A',ha:18,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'36',ha:24,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'37',ha:9,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'38',ha:10,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'39',ha:14,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'40',ha:15,tipo:'guineensis'},
  {finca:'FINCA 2',lote:'41',ha:18,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'42',ha:29,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'43A',ha:7,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'43B',ha:6,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'44A',ha:22,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'45A',ha:11,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'45B',ha:10,tipo:'hibrido'},
  {finca:'FINCA 3',lote:'46',ha:23,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'47',ha:24,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'48',ha:17,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'49',ha:23,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'50',ha:30,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'51',ha:18,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'52',ha:14,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'53',ha:18,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'54',ha:15,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'55',ha:15,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'56',ha:21,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'57',ha:11,tipo:'guineensis'},
  {finca:'FINCA 3',lote:'58',ha:9,tipo:'guineensis'},
];

const COLOR = {
  entrada:     {bg:'#1e3a5f', text:'#ffffff'},
  nuevo:       {bg:'#14532d', text:'#ffffff'},
  verde:       {bg:'#d1fae5', text:'#065f46'},
  azul:        {bg:'#dbeafe', text:'#1e3a8a'},
  rojo:        {bg:'#fee2e2', text:'#7f1d1d'},
  vacio:       {bg:'#ffffff', text:'#d1d5db'},
  fincaHeader: {bg:'#1e3a5f', text:'#ffffff'},
  tableHeader: {bg:'#1e3a5f', text:'#ffffff'},
  semHeader:   {bg:'#1e40af', text:'#ffffff'},
};

// Ciclos/tolerancias de Sanidad (igual que sanidad.html)
const CICLOS_SANIDAD = {
  trampas:   {guineensis:15, hibrido:15},
  censo:     {guineensis:30, hibrido:30},
  controlpc: {guineensis:30, hibrido:30},
};
const TOLERANCIAS_SANIDAD = {trampas:2, censo:3, controlpc:3};
const LABOR_LABELS = {trampas:'🪤 TRAMPAS', censo:'🔍 CENSO', controlpc:'🦠 CONTROL PC'};

// =============================================
// ENTRY POINTS
// =============================================

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var accion = params.accion || '';
    var callback = params.callback || '';

    var writeAcciones = ['marcarCosechando','quitarMarca','sincronizarCosecha','reemplazarLote','marcarTrabajo','quitarTrabajo','marcarSanidad','quitarSanidad'];
    if(writeAcciones.indexOf(accion) >= 0){
      try{
        var marcasParam = params.marcas ? JSON.parse(decodeURIComponent(params.marcas)) : null;
        var data = {
          accion: accion,
          key:    params.key   || '',
          fecha:  params.fecha || '',
          tipo:   params.tipo  || 'continuidad',
          labor:  params.labor || '',
          marcas: marcasParam,
          inicio: parseInt(params.inicio||'0'),
        };
        var result = {ok:false};
        if(accion === 'marcarCosechando')  result = marcarCosecha(data);
        if(accion === 'quitarMarca')        result = quitarCosecha(data);
        if(accion === 'sincronizarCosecha') result = sincronizarCosecha(data);
        if(accion === 'reemplazarLote')     result = reemplazarLote(data);
        if(accion === 'marcarTrabajo')      result = marcarMantenimiento(data);
        if(accion === 'quitarTrabajo')      result = quitarMantenimiento(data);
        if(accion === 'marcarSanidad')      result = marcarSanidad(data);
        if(accion === 'quitarSanidad')      result = quitarSanidad(data);
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(result);
      }catch(err){
        var result = {ok:false, error: err.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(result);
      }
    }

    if(accion === 'obtenerCosecha'){
      var result = obtenerMarcasCosecha();
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'obtenerMantenimiento'){
      var result = obtenerMarcasMantenimiento();
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'obtenerSanidad'){
      var result = obtenerMarcasSanidad();
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'limpiarCosecha'){
      var result = limpiarHojaCosecha();
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'agregarMarcas'){
      var marcasParam = params.marcas ? JSON.parse(decodeURIComponent(params.marcas)) : [];
      var result = agregarMarcasCosecha(marcasParam);
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'limpiarMantto'){
      var sheet = getOrCreateSheet(SHEETS.mantenimiento, ['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo']);
      sheet.clearContents();
      sheet.appendRow(['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo']);
      var result = {ok:true};
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'agregarMantto'){
      var marcasParam = params.marcas ? JSON.parse(decodeURIComponent(params.marcas)) : [];
      var sheet = getOrCreateSheet(SHEETS.mantenimiento, ['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo']);
      if(marcasParam.length > 0){
        var rows = marcasParam.map(function(m){
          var parts = parsearKey(m.key);
          return [new Date(), parts.finca, parts.lote, m.labor||'', m.fecha, 'MARCAR', m.tipo||'continuidad'];
        });
        sheet.getRange(sheet.getLastRow()+1, 1, rows.length, 7).setValues(rows);
      }
      var result = {ok:true, total:marcasParam.length};
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'limpiarSanidad'){
      var sheet = getOrCreateSheet(SHEETS.sanidad, ['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo']);
      sheet.clearContents();
      sheet.appendRow(['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo']);
      var result = {ok:true};
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'agregarSanidad'){
      var marcasParam = params.marcas ? JSON.parse(decodeURIComponent(params.marcas)) : [];
      var sheet = getOrCreateSheet(SHEETS.sanidad, ['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo']);
      if(marcasParam.length > 0){
        var rows = marcasParam.map(function(m){
          var parts = parsearKey(m.key);
          return [new Date(), parts.finca, parts.lote, m.labor||'', m.fecha, 'MARCAR', m.tipo||'continuidad'];
        });
        sheet.getRange(sheet.getLastRow()+1, 1, rows.length, 7).setValues(rows);
      }
      var result = {ok:true, total:marcasParam.length};
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'registrarAnilloRojo'){
      var d = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
      var result = registrarAnilloRojo(d);
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'erradicarAnilloRojo'){
      var d = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
      var result = erradicarAnilloRojo(d);
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'obtenerAnilloRojo'){
      var result = obtenerAnilloRojo();
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'eliminarAnilloRojo'){
      var d = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
      var result = eliminarAnilloRojo(d.id||'');
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'registrarTrampa'){
      var d = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
      var result = registrarTrampa(d);
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'obtenerTrampasRegistros'){
      var result = obtenerTrampasRegistros();
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'obtenerTrampasHistorico'){
      var result = obtenerTrampasHistorico();
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'sincronizarTrampas'){
      var d = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
      var result = sincronizarConfigTrampas(d.trampas||[]);
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'obtenerConfigTrampas'){
      var result = obtenerConfigTrampas();
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'actualizarTrampaCfg'){
      var d = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
      var result = actualizarTrampaCfg(d);
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }

    return jsonResponse({ok:true, msg:'API Palma Grande activa'});
  } catch(err) {
    return jsonResponse({error: err.toString()});
  }
}

function doPost(e) {
  try {
    var raw = '{}';
    if(e && e.postData && e.postData.contents) raw = e.postData.contents;
    else if(e && e.parameter && e.parameter.payload) raw = e.parameter.payload;
    var data = JSON.parse(raw);
    var accion = data.accion || '';
    if(accion === 'marcarCosechando')   return jsonResponse(marcarCosecha(data));
    if(accion === 'quitarMarca')        return jsonResponse(quitarCosecha(data));
    if(accion === 'sincronizarCosecha') return jsonResponse(sincronizarCosecha(data));
    if(accion === 'reemplazarCosecha')  return jsonResponse(reemplazarCosecha(data));
    if(accion === 'marcarTrabajo')      return jsonResponse(marcarMantenimiento(data));
    if(accion === 'quitarTrabajo')      return jsonResponse(quitarMantenimiento(data));
    return jsonResponse({error: 'Accion no reconocida: ' + accion});
  } catch(err) {
    return jsonResponse({error: err.toString()});
  }
}

// =============================================
// COSECHA
// =============================================

function marcarCosecha(data) {
  var sheet = getOrCreateSheet(SHEETS.cosecha, ['Timestamp','Finca','Lote','Fecha','Tipo','Accion']);
  var parts = parsearKey(data.key);
  sheet.appendRow([new Date(), parts.finca, parts.lote, data.fecha, data.tipo||'continuidad', 'MARCAR']);
  generarTableroCosecha();
  return {ok:true};
}

function quitarCosecha(data) {
  var sheet = getOrCreateSheet(SHEETS.cosecha, ['Timestamp','Finca','Lote','Fecha','Tipo','Accion']);
  var parts = parsearKey(data.key);
  sheet.appendRow([new Date(), parts.finca, parts.lote, data.fecha, '', 'QUITAR']);
  generarTableroCosecha();
  return {ok:true};
}

function sincronizarCosecha(data) {
  if(!data.marcas || !Array.isArray(data.marcas)) return {ok:false, msg:'Sin marcas'};
  var sheet = getOrCreateSheet(SHEETS.cosecha, ['Timestamp','Finca','Lote','Fecha','Tipo','Accion']);
  data.marcas.forEach(function(m){
    var parts = parsearKey(m.key);
    sheet.appendRow([new Date(), parts.finca, parts.lote, m.fecha, m.tipo||'continuidad', 'MARCAR']);
  });
  return {ok:true, total:data.marcas.length};
}

function reemplazarLote(data) {
  if(!data.marcas || !Array.isArray(data.marcas)) return {ok:false, msg:'Sin marcas'};
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.cosecha);
  if(!sheet) sheet = ss.insertSheet(SHEETS.cosecha);
  if(data.inicio === 0){
    sheet.clearContents();
    sheet.appendRow(['Timestamp','Finca','Lote','Fecha','Tipo','Accion']);
  }
  var rows = data.marcas.map(function(m){
    var parts = parsearKey(m.key);
    return [new Date(), parts.finca, parts.lote, m.fecha, m.tipo||'continuidad', 'MARCAR'];
  });
  if(rows.length > 0) sheet.getRange(sheet.getLastRow()+1, 1, rows.length, 6).setValues(rows);
  return {ok:true, total:rows.length};
}

function reemplazarCosecha(data) {
  if(!data.marcas || !Array.isArray(data.marcas)) return {ok:false, msg:'Sin marcas'};
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.cosecha);
  if(!sheet) sheet = ss.insertSheet(SHEETS.cosecha);
  sheet.clearContents();
  sheet.appendRow(['Timestamp','Finca','Lote','Fecha','Tipo','Accion']);
  var rows = data.marcas.map(function(m){
    var parts = parsearKey(m.key);
    return [new Date(), parts.finca, parts.lote, m.fecha, m.tipo||'continuidad', 'MARCAR'];
  });
  if(rows.length > 0) sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  return {ok:true, total:rows.length};
}

function limpiarHojaCosecha() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.cosecha);
  if(!sheet) sheet = ss.insertSheet(SHEETS.cosecha);
  sheet.clearContents();
  sheet.appendRow(['Timestamp','Finca','Lote','Fecha','Tipo','Accion']);
  return {ok:true};
}

function agregarMarcasCosecha(marcas) {
  if(!marcas || !Array.isArray(marcas)) return {ok:false};
  var sheet = getOrCreateSheet(SHEETS.cosecha, ['Timestamp','Finca','Lote','Fecha','Tipo','Accion']);
  var rows = marcas.map(function(m){
    var parts = parsearKey(m.key);
    return [new Date(), parts.finca, parts.lote, m.fecha, m.tipo||'continuidad', 'MARCAR'];
  });
  if(rows.length > 0) sheet.getRange(sheet.getLastRow()+1, 1, rows.length, 6).setValues(rows);
  return {ok:true, total:rows.length};
}

function obtenerMarcasCosecha() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.cosecha);
  if(!sheet) return {marcas:{}};
  var data = sheet.getDataRange().getValues();
  if(data.length <= 1) return {marcas:{}};

  var marcas = {};
  for(var i = 1; i < data.length; i++) {
    var finca  = data[i][1] ? String(data[i][1]).trim() : '';
    var lote   = data[i][2] ? String(data[i][2]).trim() : '';
    var fecha  = data[i][3] ? formatFecha(data[i][3]) : '';
    var tipo   = data[i][4] ? String(data[i][4]).trim() : 'continuidad';
    var accion = data[i][5] ? String(data[i][5]).trim() : 'MARCAR';
    var key = finca + '_' + lote;
    if(!finca || !lote || !fecha) continue;
    if(!marcas[key]) marcas[key] = {};
    if(accion === 'MARCAR') marcas[key][fecha] = tipo || 'continuidad';
    if(accion === 'QUITAR') delete marcas[key][fecha];
  }
  return {marcas:marcas};
}

// =============================================
// CONSOLIDAR HISTORIAL COSECHA
// =============================================

function consolidarHistorial() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.cosecha);
  if(!sheet || sheet.getLastRow() <= 1) return;

  var data = sheet.getDataRange().getValues();

  var estado = {};
  for(var i = 1; i < data.length; i++) {
    var finca  = data[i][1] ? String(data[i][1]).trim() : '';
    var lote   = data[i][2] ? String(data[i][2]).trim() : '';
    var fecha  = data[i][3] ? formatFecha(data[i][3]) : '';
    var tipo   = data[i][4] ? String(data[i][4]).trim() : 'continuidad';
    var accion = data[i][5] ? String(data[i][5]).trim() : 'MARCAR';
    if(!finca || !lote || !fecha) continue;
    var key = finca + '_' + lote;
    if(!estado[key]) estado[key] = {};
    if(accion === 'MARCAR') estado[key][fecha] = tipo || 'continuidad';
    if(accion === 'QUITAR') delete estado[key][fecha];
  }

  var HEADERS = ['Timestamp','Finca','Lote','Fecha','Tipo','Accion'];
  var nuevasFilas = [HEADERS];
  var ts = new Date();
  Object.keys(estado).sort().forEach(function(key) {
    var partes = key.split('_');
    var lote  = partes[partes.length - 1];
    var finca = partes.slice(0, -1).join('_');
    Object.keys(estado[key]).sort().forEach(function(fecha) {
      var tipo = estado[key][fecha];
      nuevasFilas.push([ts, finca, lote, fecha, tipo, 'MARCAR']);
    });
  });

  if(nuevasFilas.length <= 1){
    Logger.log('consolidarHistorial: sin datos activos, abortando');
    return;
  }

  sheet.clearContents();
  sheet.getRange(1, 1, nuevasFilas.length, 6).setValues(nuevasFilas);
  sheet.getRange(1, 1, 1, 6).setBackground('#1e3a5f').setFontColor('#ffffff').setFontWeight('bold');
  sheet.setFrozenRows(1);
  SpreadsheetApp.flush();
  Logger.log('Historial cosecha consolidado: ' + (nuevasFilas.length - 1) + ' registros.');
}

// =============================================
// TABLERO COSECHA
// =============================================

function generarTableroCosecha() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var marcasData = obtenerMarcasCosecha();
  var marcas = marcasData.marcas;

  var hoy = new Date();
  hoy.setHours(0,0,0,0);
  var DIAS = 28;
  var fechas = [];
  for(var i = 0; i < DIAS; i++) {
    var d = new Date(hoy);
    d.setDate(d.getDate() - i);
    fechas.push(d);
  }

  var sheet = ss.getSheetByName(SHEETS.tablero);
  if(!sheet) sheet = ss.insertSheet(SHEETS.tablero);
  sheet.clearContents();
  sheet.clearFormats();

  var FIXED = 5;
  var totalCols = FIXED + DIAS;
  var DIAS_SEM = ['D','L','M','M','J','V','S'];

  sheet.getRange(1, 1).setValue('CICLOS DE COSECHA - PALMA GRANDE S.A.S. | Generado: ' + Utilities.formatDate(hoy, 'America/Bogota', 'dd/MM/yyyy HH:mm'));
  sheet.getRange(1, 1, 1, totalCols).setBackground('#0f1117').setFontColor('#f0c96a').setFontWeight('bold').setFontSize(11);

  sheet.getRange(2, 1).setValue('FINCA');
  sheet.getRange(2, 2).setValue('LOTE');
  sheet.getRange(2, 3).setValue('HA');
  sheet.getRange(2, 4).setValue('FRECUENCIA');
  sheet.getRange(2, 5).setValue('ESTADO HOY');

  fechas.forEach(function(d, i) {
    var col = FIXED + i + 1;
    var sn = getWeekNum(d);
    if(i === 0 || getWeekNum(fechas[i-1]) !== sn) sheet.getRange(2, col).setValue('SEM ' + sn);
    sheet.getRange(2, col).setBackground(COLOR.semHeader.bg).setFontColor(COLOR.semHeader.text).setFontSize(7).setHorizontalAlignment('left');
    var isHoy = i === 0;
    sheet.getRange(3, col).setValue(d.getDate()).setBackground(isHoy ? '#b8860b' : '#1e40af').setFontColor('#ffffff').setFontSize(8).setHorizontalAlignment('center');
    sheet.getRange(4, col).setValue(DIAS_SEM[d.getDay()]).setBackground('#2d3748').setFontColor('#a0aec0').setFontSize(7).setHorizontalAlignment('center');
  });

  sheet.getRange(2, 1, 3, FIXED).setBackground(COLOR.tableHeader.bg).setFontColor(COLOR.tableHeader.text).setFontWeight('bold').setFontSize(8);
  sheet.setFrozenRows(4);
  sheet.setFrozenColumns(FIXED);

  var fila = 5;
  var fincaActual = '';

  LOTES.forEach(function(l) {
    if(l.finca !== fincaActual) {
      fincaActual = l.finca;
      sheet.getRange(fila, 1).setValue('🌴 ' + l.finca);
      sheet.getRange(fila, 1, 1, totalCols).setBackground(COLOR.fincaHeader.bg).setFontColor(COLOR.fincaHeader.text).setFontWeight('bold').setFontSize(9);
      fila++;
    }
    var key = l.finca + '_' + l.lote;
    var marcasLote = marcas[key] || {};
    var freq = l.tipo === 'hibrido' ? 'Entre 21 y 22 dias' : 'Entre 11 y 12 dias';
    var estadoH = calcularEstado(marcasLote, l.tipo, hoy);
    var estadoTxt = estadoH==='sin'?'SIN REGISTRO':estadoH==='cosechando'?'COSECHANDO':estadoH==='verde'?'EN CICLO':estadoH==='azul'?'TOLERANCIA':'INCUMPLIMIENTO';
    var colorEstado = (estadoH==='verde'||estadoH==='cosechando')?'#d1fae5':estadoH==='azul'?'#dbeafe':estadoH==='rojo'?'#fee2e2':'#f9fafb';

    sheet.getRange(fila, 1).setValue(l.finca.replace('FINCA ', 'F'));
    sheet.getRange(fila, 2).setValue(l.lote);
    sheet.getRange(fila, 3).setValue(l.ha);
    sheet.getRange(fila, 4).setValue(freq);
    sheet.getRange(fila, 5).setValue(estadoTxt);
    sheet.getRange(fila, 5).setBackground(colorEstado);

    fechas.forEach(function(d, i) {
      var col = FIXED + i + 1;
      var dISO = formatFecha(d);
      var cs = calcularCelda(marcasLote, l.tipo, d);
      if(cs.tipo === 'vacio') {
        sheet.getRange(fila, col).setValue('·').setFontColor('#e5e7eb').setBackground('#ffffff');
      } else {
        sheet.getRange(fila, col).setValue(cs.num);
        if(cs.tipo === 'cosechando') {
          var esCont = marcasLote[dISO] === 'continuidad' || marcasLote[dISO] === true;
          sheet.getRange(fila, col).setBackground(esCont ? COLOR.entrada.bg : COLOR.nuevo.bg).setFontColor('#ffffff').setFontWeight('bold');
        } else if(cs.tipo === 'verde') {
          sheet.getRange(fila, col).setBackground(COLOR.verde.bg).setFontColor(COLOR.verde.text);
        } else if(cs.tipo === 'azul') {
          sheet.getRange(fila, col).setBackground(COLOR.azul.bg).setFontColor(COLOR.azul.text);
        } else if(cs.tipo === 'rojo') {
          sheet.getRange(fila, col).setBackground(COLOR.rojo.bg).setFontColor(COLOR.rojo.text);
        }
        sheet.getRange(fila, col).setHorizontalAlignment('center').setFontSize(8);
      }
    });

    sheet.getRange(fila, 1, 1, FIXED).setFontSize(8).setVerticalAlignment('middle');
    sheet.setRowHeight(fila, 20);
    fila++;
  });

  sheet.setColumnWidth(1, 45); sheet.setColumnWidth(2, 50); sheet.setColumnWidth(3, 35);
  sheet.setColumnWidth(4, 110); sheet.setColumnWidth(5, 100);
  for(var i = FIXED + 1; i <= totalCols; i++) sheet.setColumnWidth(i, 25);

  SpreadsheetApp.flush();
  Logger.log('Tablero cosecha generado: ' + (fila - 5) + ' filas');
}

// =============================================
// LÓGICA DE CICLOS (COSECHA)
// =============================================

function getCicloMax(tipo)    { return tipo === 'hibrido' ? 22 : 12; }
function getCicloOptimo(tipo) { return tipo === 'hibrido' ? 20 : 10; }

function getCicloStart(marcasLote, tipo, hastaFecha) {
  var hastaISO = formatFecha(hastaFecha);
  var todasMarks = Object.keys(marcasLote).filter(function(iso){ return iso <= hastaISO; }).sort().reverse();
  if(todasMarks.length === 0) return null;
  var cicloActualInicio = todasMarks[0];
  for(var i = 1; i < todasMarks.length; i++) {
    var masNueva = new Date(todasMarks[i-1]);
    var masVieja = new Date(todasMarks[i]);
    var brecha = Math.round((masNueva - masVieja) / 86400000);
    if(brecha > getCicloOptimo(tipo)) break;
    cicloActualInicio = todasMarks[i];
  }
  return new Date(cicloActualInicio);
}

function calcularCelda(marcasLote, tipo, fecha) {
  var dISO = formatFecha(fecha);
  var cicloStart = getCicloStart(marcasLote, tipo, fecha);
  if(!cicloStart) return {tipo:'vacio', num:null};
  var diasCiclo = Math.round((fecha - cicloStart) / 86400000) + 1;
  if(marcasLote[dISO]) return {tipo:'cosechando', num:diasCiclo};
  var optimo = getCicloOptimo(tipo);
  var max = getCicloMax(tipo);
  if(diasCiclo <= optimo) return {tipo:'verde', num:diasCiclo};
  if(diasCiclo <= max)    return {tipo:'azul',  num:diasCiclo};
  return {tipo:'rojo', num:diasCiclo};
}

function calcularEstado(marcasLote, tipo, hoy) {
  var cs = calcularCelda(marcasLote, tipo, hoy);
  if(cs.tipo === 'cosechando') return 'cosechando';
  if(cs.tipo === 'vacio') return 'sin';
  return cs.tipo;
}

// =============================================
// MANTENIMIENTO
// =============================================

function marcarMantenimiento(data) {
  var sheet = getOrCreateSheet(SHEETS.mantenimiento, ['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo']);
  var parts = parsearKey(data.key);
  sheet.appendRow([new Date(), parts.finca, parts.lote, data.labor||'', data.fecha, 'MARCAR', data.tipo||'continuidad']);
  return {ok:true};
}

function quitarMantenimiento(data) {
  var sheet = getOrCreateSheet(SHEETS.mantenimiento, ['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo']);
  var parts = parsearKey(data.key);
  sheet.appendRow([new Date(), parts.finca, parts.lote, data.labor||'', data.fecha, 'QUITAR', '']);
  return {ok:true};
}

function obtenerMarcasMantenimiento() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.mantenimiento);
  if(!sheet) return {marcas:{poda:{},roceria:{},rotospeed:{},rolo:{}}};
  var data = sheet.getDataRange().getValues();
  var marcas = {poda:{},roceria:{},rotospeed:{},rolo:{}};
  for(var i = 1; i < data.length; i++) {
    var finca  = data[i][1] ? String(data[i][1]).trim() : '';
    var lote   = data[i][2] ? String(data[i][2]).trim() : '';
    var labor  = data[i][3] ? String(data[i][3]).trim().toLowerCase() : '';
    var fecha  = data[i][4] ? formatFecha(data[i][4]) : '';
    var accion = data[i][5] ? String(data[i][5]).trim() : 'MARCAR';
    var tipo   = data[i][6] ? String(data[i][6]).trim() : 'continuidad';
    if(!finca||!lote||!labor||!fecha) continue;
    if(!marcas[labor]) continue;
    var key = finca+'_'+lote;
    if(!marcas[labor][key]) marcas[labor][key] = {};
    if(accion === 'MARCAR') marcas[labor][key][fecha] = tipo;
    else if(accion === 'QUITAR') delete marcas[labor][key][fecha];
  }
  return {marcas:marcas};
}

// =============================================
// SANIDAD
// =============================================

function marcarSanidad(data) {
  var sheet = getOrCreateSheet(SHEETS.sanidad, ['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo']);
  var parts = parsearKey(data.key);
  sheet.appendRow([new Date(), parts.finca, parts.lote, data.labor||'', data.fecha, 'MARCAR', data.tipo||'continuidad']);
  generarTableroSanidad();
  return {ok:true};
}

function quitarSanidad(data) {
  var sheet = getOrCreateSheet(SHEETS.sanidad, ['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo']);
  var parts = parsearKey(data.key);
  sheet.appendRow([new Date(), parts.finca, parts.lote, data.labor||'', data.fecha, 'QUITAR', '']);
  generarTableroSanidad();
  return {ok:true};
}

function obtenerMarcasSanidad() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.sanidad);
  if(!sheet) return {marcas:{trampas:{},censo:{},controlpc:{}}};
  var data = sheet.getDataRange().getValues();
  var marcas = {trampas:{},censo:{},controlpc:{}};
  for(var i = 1; i < data.length; i++) {
    var finca  = data[i][1] ? String(data[i][1]).trim() : '';
    var lote   = data[i][2] ? String(data[i][2]).trim() : '';
    var labor  = data[i][3] ? String(data[i][3]).trim().toLowerCase().replace(' ','') : '';
    var fecha  = data[i][4] ? formatFecha(data[i][4]) : '';
    var accion = data[i][5] ? String(data[i][5]).trim() : 'MARCAR';
    var tipo   = data[i][6] ? String(data[i][6]).trim() : 'continuidad';
    if(!finca||!lote||!labor||!fecha) continue;
    if(!marcas[labor]) continue;
    var key = finca+'_'+lote;
    if(!marcas[labor][key]) marcas[labor][key] = {};
    if(accion === 'MARCAR') marcas[labor][key][fecha] = tipo;
    else if(accion === 'QUITAR') delete marcas[labor][key][fecha];
  }
  return {marcas:marcas};
}

// =============================================
// CONSOLIDAR HISTORIAL SANIDAD
// =============================================

function consolidarHistorialSanidad() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.sanidad);
  if(!sheet || sheet.getLastRow() <= 1) return;

  var data = sheet.getDataRange().getValues();

  // estado[labor + '|' + finca_lote][fecha] = tipo
  var estado = {};
  for(var i = 1; i < data.length; i++) {
    var finca  = data[i][1] ? String(data[i][1]).trim() : '';
    var lote   = data[i][2] ? String(data[i][2]).trim() : '';
    var labor  = data[i][3] ? String(data[i][3]).trim().toLowerCase().replace(' ','') : '';
    var fecha  = data[i][4] ? formatFecha(data[i][4]) : '';
    var accion = data[i][5] ? String(data[i][5]).trim() : 'MARCAR';
    var tipo   = data[i][6] ? String(data[i][6]).trim() : 'continuidad';
    if(!finca || !lote || !labor || !fecha) continue;
    var ekey = labor + '|' + finca + '_' + lote;
    if(!estado[ekey]) estado[ekey] = {};
    if(accion === 'MARCAR') estado[ekey][fecha] = tipo || 'continuidad';
    if(accion === 'QUITAR') delete estado[ekey][fecha];
  }

  var HEADERS = ['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo'];
  var nuevasFilas = [HEADERS];
  var ts = new Date();
  Object.keys(estado).sort().forEach(function(ekey) {
    var partes = ekey.split('|');
    var labor = partes[0];
    var key = partes[1];
    var partesKey = key.split('_');
    var lote  = partesKey[partesKey.length - 1];
    var finca = partesKey.slice(0, -1).join('_');
    Object.keys(estado[ekey]).sort().forEach(function(fecha) {
      var tipo = estado[ekey][fecha];
      nuevasFilas.push([ts, finca, lote, labor, fecha, 'MARCAR', tipo]);
    });
  });

  if(nuevasFilas.length <= 1){
    Logger.log('consolidarHistorialSanidad: sin datos activos, abortando');
    return;
  }

  sheet.clearContents();
  sheet.getRange(1, 1, nuevasFilas.length, 7).setValues(nuevasFilas);
  sheet.getRange(1, 1, 1, 7).setBackground('#1e3a5f').setFontColor('#ffffff').setFontWeight('bold');
  sheet.setFrozenRows(1);
  SpreadsheetApp.flush();
  Logger.log('Historial sanidad consolidado: ' + (nuevasFilas.length - 1) + ' registros.');
}

// =============================================
// TABLERO SANIDAD (un bloque por labor: trampas / censo / control pc)
// =============================================

function generarTableroSanidad() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var marcasData = obtenerMarcasSanidad();
  var marcas = marcasData.marcas;

  var hoy = new Date();
  hoy.setHours(0,0,0,0);
  var DIAS = 28;
  var fechas = [];
  for(var i = 0; i < DIAS; i++) {
    var d = new Date(hoy);
    d.setDate(d.getDate() - i);
    fechas.push(d);
  }

  var sheet = ss.getSheetByName(SHEETS.tableroSanidad);
  if(!sheet) sheet = ss.insertSheet(SHEETS.tableroSanidad);
  sheet.clearContents();
  sheet.clearFormats();

  var FIXED = 5;
  var totalCols = FIXED + DIAS;
  var DIAS_SEM = ['D','L','M','M','J','V','S'];
  var labores = ['trampas','censo','controlpc'];
  var fila = 1;

  labores.forEach(function(labor) {
    sheet.getRange(fila, 1).setValue(LABOR_LABELS[labor] + ' | Generado: ' + Utilities.formatDate(hoy, 'America/Bogota', 'dd/MM/yyyy HH:mm'));
    sheet.getRange(fila, 1, 1, totalCols).setBackground('#0f1117').setFontColor('#f0c96a').setFontWeight('bold').setFontSize(11);
    fila++;

    var filaHdr1 = fila, filaHdr2 = fila + 1, filaHdr3 = fila + 2;
    sheet.getRange(filaHdr1, 1).setValue('FINCA');
    sheet.getRange(filaHdr1, 2).setValue('LOTE');
    sheet.getRange(filaHdr1, 3).setValue('HA');
    sheet.getRange(filaHdr1, 4).setValue('CICLO');
    sheet.getRange(filaHdr1, 5).setValue('ESTADO HOY');

    fechas.forEach(function(d, i) {
      var col = FIXED + i + 1;
      var sn = getWeekNum(d);
      if(i === 0 || getWeekNum(fechas[i-1]) !== sn) sheet.getRange(filaHdr1, col).setValue('SEM ' + sn);
      sheet.getRange(filaHdr1, col).setBackground(COLOR.semHeader.bg).setFontColor(COLOR.semHeader.text).setFontSize(7).setHorizontalAlignment('left');
      var isHoy = i === 0;
      sheet.getRange(filaHdr2, col).setValue(d.getDate()).setBackground(isHoy ? '#b8860b' : '#1e40af').setFontColor('#ffffff').setFontSize(8).setHorizontalAlignment('center');
      sheet.getRange(filaHdr3, col).setValue(DIAS_SEM[d.getDay()]).setBackground('#2d3748').setFontColor('#a0aec0').setFontSize(7).setHorizontalAlignment('center');
    });

    sheet.getRange(filaHdr1, 1, 3, FIXED).setBackground(COLOR.tableHeader.bg).setFontColor(COLOR.tableHeader.text).setFontWeight('bold').setFontSize(8);
    fila = filaHdr3 + 1;

    var fincaActual = '';
    LOTES.forEach(function(l) {
      if(l.finca !== fincaActual) {
        fincaActual = l.finca;
        sheet.getRange(fila, 1).setValue('🌴 ' + l.finca);
        sheet.getRange(fila, 1, 1, totalCols).setBackground(COLOR.fincaHeader.bg).setFontColor(COLOR.fincaHeader.text).setFontWeight('bold').setFontSize(9);
        fila++;
      }
      var key = l.finca + '_' + l.lote;
      var marcasLote = (marcas[labor] && marcas[labor][key]) || {};
      var ciclo = CICLOS_SANIDAD[labor][l.tipo];
      var cicloLabel = ciclo + ' días';
      var estadoH = calcularEstadoSanidad(marcasLote, labor, l.tipo, hoy);
      var estadoTxt = estadoH==='sin'?'SIN REGISTRO':estadoH==='trabajo'?'TRABAJO':estadoH==='verde'?'EN CICLO':estadoH==='azul'?'TOLERANCIA':'INCUMPLIMIENTO';
      var colorEstado = (estadoH==='verde'||estadoH==='trabajo')?'#d1fae5':estadoH==='azul'?'#dbeafe':estadoH==='rojo'?'#fee2e2':'#f9fafb';

      sheet.getRange(fila, 1).setValue(l.finca.replace('FINCA ', 'F'));
      sheet.getRange(fila, 2).setValue(l.lote);
      sheet.getRange(fila, 3).setValue(l.ha);
      sheet.getRange(fila, 4).setValue(cicloLabel);
      sheet.getRange(fila, 5).setValue(estadoTxt);
      sheet.getRange(fila, 5).setBackground(colorEstado);

      fechas.forEach(function(d, i) {
        var col = FIXED + i + 1;
        var cs = calcularCeldaSanidad(marcasLote, labor, l.tipo, d);
        if(cs.tipo === 'vacio') {
          sheet.getRange(fila, col).setValue('·').setFontColor('#e5e7eb').setBackground('#ffffff');
        } else {
          sheet.getRange(fila, col).setValue(cs.num);
          if(cs.tipo === 'trabajo') {
            var esNuevo = cs.marca === 'nuevo';
            sheet.getRange(fila, col).setBackground(esNuevo ? COLOR.nuevo.bg : COLOR.entrada.bg).setFontColor('#ffffff').setFontWeight('bold');
          } else if(cs.tipo === 'verde') {
            sheet.getRange(fila, col).setBackground(COLOR.verde.bg).setFontColor(COLOR.verde.text);
          } else if(cs.tipo === 'azul') {
            sheet.getRange(fila, col).setBackground(COLOR.azul.bg).setFontColor(COLOR.azul.text);
          } else if(cs.tipo === 'rojo') {
            sheet.getRange(fila, col).setBackground(COLOR.rojo.bg).setFontColor(COLOR.rojo.text);
          }
          sheet.getRange(fila, col).setHorizontalAlignment('center').setFontSize(8);
        }
      });

      sheet.getRange(fila, 1, 1, FIXED).setFontSize(8).setVerticalAlignment('middle');
      sheet.setRowHeight(fila, 20);
      fila++;
    });

    fila += 2; // espacio entre bloques de labor
  });

  sheet.setColumnWidth(1, 45); sheet.setColumnWidth(2, 50); sheet.setColumnWidth(3, 35);
  sheet.setColumnWidth(4, 90); sheet.setColumnWidth(5, 100);
  for(var c = FIXED + 1; c <= totalCols; c++) sheet.setColumnWidth(c, 25);
  sheet.setFrozenColumns(FIXED);

  SpreadsheetApp.flush();
  Logger.log('Tablero sanidad generado.');
}

// =============================================
// LÓGICA DE CICLOS (SANIDAD)
// =============================================

function getCicloStartSanidad(marcasLote, hastaFecha) {
  var hastaISO = formatFecha(hastaFecha);
  var todasMarks = Object.keys(marcasLote).filter(function(iso){ return iso <= hastaISO; }).sort().reverse();
  if(todasMarks.length === 0) return null;
  var cicloInicio = todasMarks[0];
  for(var i = 0; i < todasMarks.length; i++) {
    cicloInicio = todasMarks[i];
    if(marcasLote[todasMarks[i]] === 'nuevo') break;
  }
  return new Date(cicloInicio);
}

function calcularCeldaSanidad(marcasLote, labor, tipo, fecha) {
  var dISO = formatFecha(fecha);
  var ciclo = CICLOS_SANIDAD[labor][tipo];
  var tol = TOLERANCIAS_SANIDAD[labor];
  var cicloStart = getCicloStartSanidad(marcasLote, fecha);
  if(!cicloStart) return {tipo:'vacio', num:null};
  var diasCiclo = Math.round((fecha - cicloStart) / 86400000) + 1;
  if(marcasLote[dISO]) return {tipo:'trabajo', num:diasCiclo, marca:marcasLote[dISO]};
  var limVerde = ciclo - tol;
  if(diasCiclo <= limVerde) return {tipo:'verde', num:diasCiclo};
  if(diasCiclo <= ciclo)    return {tipo:'azul',  num:diasCiclo};
  return {tipo:'rojo', num:diasCiclo};
}

function calcularEstadoSanidad(marcasLote, labor, tipo, hoy) {
  var cs = calcularCeldaSanidad(marcasLote, labor, tipo, hoy);
  if(cs.tipo === 'trabajo') return 'trabajo';
  if(cs.tipo === 'vacio') return 'sin';
  return cs.tipo;
}

// =============================================
// TRIGGER Y ACTUALIZACIÓN
// =============================================

function crearTriggers() {
  ScriptApp.getProjectTriggers().forEach(function(t){ ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('actualizarTodo').timeBased().everyHours(1).create();
  Logger.log('Trigger creado: actualizacion cada hora.');
  Browser.msgBox('Trigger creado. El tablero se actualizara automaticamente cada hora.');
}

function actualizarTodo() {
  generarTableroCosecha();   // solo lee Cosecha y pinta el tablero
  generarTableroSanidad();   // solo lee Sanidad y pinta el tablero
  Logger.log('Actualizacion completa: ' + new Date());
}

// =============================================
// DATOS HISTÓRICOS (ejecutar una sola vez)
// =============================================

function cargarDatosHistoricos() {
  var sheet = getOrCreateSheet(SHEETS.cosecha, ['Timestamp','Finca','Lote','Fecha','Tipo','Accion']);
  if(sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);

  var ts = new Date();
  var historicos = [
    ['FINCA 1','1A','2026-05-20','continuidad','MARCAR'],
    ['FINCA 1','1A','2026-05-21','continuidad','MARCAR'],
    ['FINCA 1','1A','2026-05-22','continuidad','MARCAR'],
    ['FINCA 1','2A','2026-05-19','continuidad','MARCAR'],
    ['FINCA 1','2A','2026-05-20','continuidad','MARCAR'],
    ['FINCA 1','3A','2026-05-18','continuidad','MARCAR'],
    ['FINCA 1','3A','2026-05-19','continuidad','MARCAR'],
    ['FINCA 1','4A','2026-05-14','continuidad','MARCAR'],
    ['FINCA 1','4A','2026-05-15','continuidad','MARCAR'],
    ['FINCA 1','5','2026-05-13','continuidad','MARCAR'],
    ['FINCA 1','5','2026-05-14','continuidad','MARCAR'],
    ['FINCA 1','6','2026-05-14','continuidad','MARCAR'],
    ['FINCA 1','6','2026-05-15','continuidad','MARCAR'],
    ['FINCA 1','6','2026-05-16','continuidad','MARCAR'],
    ['FINCA 1','6','2026-06-03','nuevo','MARCAR'],
    ['FINCA 1','6','2026-06-04','continuidad','MARCAR'],
    ['FINCA 1','6','2026-06-05','continuidad','MARCAR'],
    ['FINCA 1','7','2026-05-13','continuidad','MARCAR'],
    ['FINCA 1','8','2026-05-12','continuidad','MARCAR'],
    ['FINCA 1','8','2026-05-13','continuidad','MARCAR'],
    ['FINCA 1','9','2026-05-11','continuidad','MARCAR'],
    ['FINCA 1','10','2026-05-10','continuidad','MARCAR'],
    ['FINCA 1','11','2026-05-08','continuidad','MARCAR'],
    ['FINCA 1','11','2026-05-09','continuidad','MARCAR'],
    ['FINCA 1','11A','2026-05-11','continuidad','MARCAR'],
    ['FINCA 1','12','2026-05-20','continuidad','MARCAR'],
    ['FINCA 1','13','2026-05-05','continuidad','MARCAR'],
    ['FINCA 1','14','2026-05-05','continuidad','MARCAR'],
    ['FINCA 1','15','2026-05-06','continuidad','MARCAR'],
    ['FINCA 1','16','2026-05-06','continuidad','MARCAR'],
    ['FINCA 1','16','2026-05-07','continuidad','MARCAR'],
    ['FINCA 1','17','2026-05-07','continuidad','MARCAR'],
    ['FINCA 1','17','2026-05-08','continuidad','MARCAR'],
    ['FINCA 1','18','2026-05-11','continuidad','MARCAR'],
    ['FINCA 1','18','2026-05-12','continuidad','MARCAR'],
    ['FINCA 1','18','2026-05-13','continuidad','MARCAR'],
    ['FINCA 1','18','2026-05-14','continuidad','MARCAR'],
    ['FINCA 1','18','2026-06-03','nuevo','MARCAR'],
    ['FINCA 1','18A','2026-05-12','continuidad','MARCAR'],
    ['FINCA 2','19','2026-06-01','continuidad','MARCAR'],
    ['FINCA 2','20','2026-05-27','continuidad','MARCAR'],
    ['FINCA 2','21','2026-05-28','continuidad','MARCAR'],
    ['FINCA 2','22','2026-05-27','continuidad','MARCAR'],
    ['FINCA 2','23','2026-06-01','continuidad','MARCAR'],
    ['FINCA 2','23','2026-06-02','continuidad','MARCAR'],
    ['FINCA 2','24','2026-06-02','continuidad','MARCAR'],
    ['FINCA 2','24','2026-06-03','continuidad','MARCAR'],
    ['FINCA 2','25','2026-06-03','continuidad','MARCAR'],
    ['FINCA 2','26','2026-06-02','continuidad','MARCAR'],
    ['FINCA 2','26','2026-06-03','continuidad','MARCAR'],
    ['FINCA 2','27','2026-06-03','continuidad','MARCAR'],
    ['FINCA 2','27','2026-06-04','continuidad','MARCAR'],
    ['FINCA 2','28','2026-06-04','continuidad','MARCAR'],
    ['FINCA 2','29','2026-06-05','continuidad','MARCAR'],
    ['FINCA 2','29','2026-06-06','continuidad','MARCAR'],
    ['FINCA 2','30','2026-06-05','continuidad','MARCAR'],
    ['FINCA 2','30','2026-06-06','continuidad','MARCAR'],
    ['FINCA 2','31','2026-05-13','continuidad','MARCAR'],
    ['FINCA 2','32A','2026-05-13','continuidad','MARCAR'],
    ['FINCA 2','33A','2026-05-14','continuidad','MARCAR'],
    ['FINCA 2','34A','2026-05-14','continuidad','MARCAR'],
    ['FINCA 2','35A','2026-05-15','continuidad','MARCAR'],
    ['FINCA 2','35A','2026-05-16','continuidad','MARCAR'],
    ['FINCA 2','36','2026-06-05','continuidad','MARCAR'],
    ['FINCA 2','36','2026-06-06','continuidad','MARCAR'],
    ['FINCA 2','37','2026-06-04','continuidad','MARCAR'],
    ['FINCA 2','37','2026-06-05','continuidad','MARCAR'],
    ['FINCA 2','38','2026-06-04','continuidad','MARCAR'],
    ['FINCA 2','39','2026-06-03','continuidad','MARCAR'],
    ['FINCA 2','39','2026-06-04','continuidad','MARCAR'],
    ['FINCA 2','40','2026-06-01','continuidad','MARCAR'],
    ['FINCA 2','40','2026-06-02','continuidad','MARCAR'],
    ['FINCA 2','41','2026-06-01','continuidad','MARCAR'],
    ['FINCA 3','42','2026-05-27','continuidad','MARCAR'],
    ['FINCA 3','43A','2026-05-25','continuidad','MARCAR'],
    ['FINCA 3','43B','2026-05-26','continuidad','MARCAR'],
    ['FINCA 3','44A','2026-05-27','continuidad','MARCAR'],
    ['FINCA 3','45A','2026-05-26','continuidad','MARCAR'],
    ['FINCA 3','45B','2026-05-26','continuidad','MARCAR'],
    ['FINCA 3','46','2026-05-25','continuidad','MARCAR'],
    ['FINCA 3','47','2026-05-22','continuidad','MARCAR'],
    ['FINCA 3','47','2026-05-25','continuidad','MARCAR'],
    ['FINCA 3','48','2026-05-25','continuidad','MARCAR'],
    ['FINCA 3','49','2026-05-21','continuidad','MARCAR'],
    ['FINCA 3','50','2026-05-22','continuidad','MARCAR'],
    ['FINCA 3','50','2026-05-25','continuidad','MARCAR'],
    ['FINCA 3','51','2026-05-22','continuidad','MARCAR'],
    ['FINCA 3','52','2026-05-21','continuidad','MARCAR'],
    ['FINCA 3','53','2026-05-20','continuidad','MARCAR'],
    ['FINCA 3','54','2026-05-20','continuidad','MARCAR'],
    ['FINCA 3','55','2026-05-18','continuidad','MARCAR'],
    ['FINCA 3','56','2026-05-15','continuidad','MARCAR'],
    ['FINCA 3','57','2026-05-16','continuidad','MARCAR'],
    ['FINCA 3','58','2026-04-29','continuidad','MARCAR'],
  ];

  historicos.forEach(function(h) {
    sheet.appendRow([ts, h[0], h[1], h[2], h[3], h[4]]);
  });

  SpreadsheetApp.flush();
  Logger.log('Datos historicos cargados: ' + historicos.length + ' registros');
  generarTableroCosecha();
  Browser.msgBox(historicos.length + ' registros cargados y tablero generado.');
}

// =============================================
// TRAMPAS RHYNCHOPHORUS
// =============================================

function registrarTrampa(data) {
  var sheet = getOrCreateSheet(SHEETS.trampas, [
    'Timestamp','Fecha','TrampaId','Finca','Lote',
    'Hembras','Machos','TotalCapturas','EstadoCebo','EstadoTrampa',
    'Observaciones','Operario','Hora','CambioCebo','CambioFeromona'
  ]);
  var total = (parseInt(data.hembras)||0) + (parseInt(data.machos)||0);
  var fecha = data.fecha||formatFecha(new Date());
  var fila = [
    new Date(), fecha, data.trampaId||'',
    data.finca||'', data.lote||'',
    parseInt(data.hembras)||0, parseInt(data.machos)||0, total,
    data.estadoCebo||'', data.estadoTrampa||'',
    data.obs||'', data.operario||'', data.hora||'',
    data.cambioCebo ? 'SI' : 'NO', data.cambioFeromona ? 'SI' : 'NO',
  ];

  var lastRow = sheet.getLastRow();
  if(lastRow > 1){
    var rango = sheet.getRange(2, 2, lastRow - 1, 2).getValues();
    for(var i = 0; i < rango.length; i++){
      var fFila = formatFecha(rango[i][0]);
      var idFila = String(rango[i][1] || '').trim();
      if(fFila === fecha && idFila === String(data.trampaId||'').trim()){
        sheet.getRange(i + 2, 1, 1, fila.length).setValues([fila]);
        return {ok:true, trampaId:data.trampaId, total:total, actualizado:true};
      }
    }
  }

  sheet.appendRow(fila);
  return {ok:true, trampaId:data.trampaId, total:total, actualizado:false};
}

function obtenerTrampasRegistros() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.trampas);
  if(!sheet || sheet.getLastRow() <= 1) return {registros:{}};
  var data = sheet.getDataRange().getValues();
  var registros = {};
  for(var i = 1; i < data.length; i++) {
    var fecha = data[i][1] ? formatFecha(data[i][1]) : '';
    var id    = String(data[i][2]||'').trim();
    if(!fecha || !id) continue;
    if(!registros[fecha]) registros[fecha] = {};
    registros[fecha][id] = {
      finca:data[i][3]||'', lote:data[i][4]||'',
      hembras:parseInt(data[i][5])||0, machos:parseInt(data[i][6])||0, total:parseInt(data[i][7])||0,
      estadoCebo:data[i][8]||'', estadoTrampa:data[i][9]||'',
      obs:data[i][10]||'', operario:data[i][11]||'', hora:data[i][12]||'',
    };
  }
  return {registros:registros};
}

function obtenerTrampasHistorico() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.trampas);
  if(!sheet || sheet.getLastRow() <= 1) return {historico:[]};
  var data = sheet.getDataRange().getValues();
  var historico = [];
  for(var i = 1; i < data.length; i++) {
    var fecha = data[i][1] ? formatFecha(data[i][1]) : '';
    if(!fecha) continue;
    historico.push({
      fecha:fecha, trampaId:String(data[i][2]||''), finca:String(data[i][3]||''), lote:String(data[i][4]||''),
      hembras:parseInt(data[i][5])||0, machos:parseInt(data[i][6])||0, total:parseInt(data[i][7])||0,
      estadoCebo:String(data[i][8]||''), estadoTrampa:String(data[i][9]||''),
      operario:String(data[i][11]||''), cambioCebo:String(data[i][13]||'')==='SI', cambioFeromona:String(data[i][14]||'')==='SI',
    });
  }
  return {historico:historico};
}

function sincronizarConfigTrampas(trampas) {
  var sheet = getOrCreateSheet(SHEETS.trampasCfg, ['TrampaId','Finca','Lote','Activa','Operario','FechaAlta']);
  sheet.clearContents();
  sheet.appendRow(['TrampaId','Finca','Lote','Activa','Operario','FechaAlta']);
  if(trampas.length > 0) {
    var rows = trampas.map(function(t){ return [t.id, t.finca, t.lote, t.activa?'SI':'NO', t.operario||'', t.fechaAlta||'']; });
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
  return {ok:true, total:trampas.length};
}

function obtenerConfigTrampas() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.trampasCfg);
  if(!sheet || sheet.getLastRow() <= 1) return {trampas:[]};
  var data = sheet.getDataRange().getValues();
  var trampas = [];
  for(var i = 1; i < data.length; i++){
    if(!data[i][0]) continue;
    trampas.push({
      id:String(data[i][0]||''), finca:String(data[i][1]||''), lote:String(data[i][2]||''),
      activa:String(data[i][3]||'')==='SI', operario:String(data[i][4]||''), fechaAlta:String(data[i][5]||''),
    });
  }
  return {trampas:trampas};
}

function actualizarTrampaCfg(d) {
  var sheet = getOrCreateSheet(SHEETS.trampasCfg, ['TrampaId','Finca','Lote','Activa','Operario','FechaAlta']);
  var data = sheet.getDataRange().getValues();
  for(var i = 1; i < data.length; i++){
    if(String(data[i][0]) === String(d.id)){
      sheet.getRange(i+1, 1, 1, 6).setValues([[d.id, d.finca||'', d.lote||'', d.activa?'SI':'NO', d.operario||'', d.fechaAlta||data[i][5]||'']]);
      return {ok:true, actualizado:true};
    }
  }
  sheet.appendRow([d.id, d.finca||'', d.lote||'', d.activa?'SI':'NO', d.operario||'', d.fechaAlta||'']);
  return {ok:true, actualizado:false};
}

// =============================================
// ANILLO ROJO
// =============================================

function registrarAnilloRojo(data) {
  var sheet = getOrCreateSheet(SHEETS.anilloRojo, [
    'Timestamp','ID','Finca','Lote','Linea','Palma',
    'Lat','Lng','Sintomas','FechaDeteccion','ResponsableDeteccion',
    'FechaErradicacion','ResponsableErradicacion','Metodo','Observaciones','Estado'
  ]);
  sheet.appendRow([new Date(), data.id||'', data.finca||'', data.lote||'', data.linea||'', data.palma||'',
    data.lat||'', data.lng||'', data.sintomas||'', data.fechaDet||'', data.responsableDet||'',
    '','','','','PENDIENTE']);
  return {ok:true, id:data.id};
}

function erradicarAnilloRojo(data) {
  var sheet = getOrCreateSheet(SHEETS.anilloRojo, ['Timestamp','ID','Finca','Lote','Linea','Palma','Lat','Lng','Sintomas','FechaDeteccion','ResponsableDeteccion','FechaErradicacion','ResponsableErradicacion','Metodo','Observaciones','Estado']);
  var rows = sheet.getDataRange().getValues();
  for(var i = 1; i < rows.length; i++){
    if(String(rows[i][1]) === String(data.id)){
      var hDet  = new Date(rows[i][9]+'T00:00:00');
      var hErad = new Date(data.fechaErad+'T00:00:00');
      var horas = Math.floor((hErad-hDet)/3600000);
      var estado = horas <= 48 ? 'ERRADICADA_OK' : 'ERRADICADA_TARDE';
      sheet.getRange(i+1,12).setValue(data.fechaErad);
      sheet.getRange(i+1,13).setValue(data.responsableErad);
      sheet.getRange(i+1,14).setValue(data.metodo);
      sheet.getRange(i+1,15).setValue(data.obs||'');
      sheet.getRange(i+1,16).setValue(estado);
      return {ok:true, horas:horas, estado:estado};
    }
  }
  return {ok:false, msg:'ID no encontrado'};
}

function obtenerAnilloRojo() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.anilloRojo);
  if(!sheet || sheet.getLastRow() <= 1) return {palmas:[]};
  var data = sheet.getDataRange().getValues();
  var palmas = [];
  for(var i = 1; i < data.length; i++){
    palmas.push({
      id:String(data[i][1]||''), finca:String(data[i][2]||''), lote:String(data[i][3]||''),
      linea:String(data[i][4]||''), palma:String(data[i][5]||''),
      lat:String(data[i][6]||''), lng:String(data[i][7]||''),
      sintomas:String(data[i][8]||''), fechaDet:String(data[i][9]||''),
      responsableDet:String(data[i][10]||''), fechaErad:String(data[i][11]||''),
      responsableErad:String(data[i][12]||''),
      metodo:String(data[i][13]||'').split(', ').filter(Boolean),
      obs:String(data[i][14]||''), estado:String(data[i][15]||''),
    });
  }
  return {palmas:palmas};
}

function eliminarAnilloRojo(id) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEETS.anilloRojo);
  if(!sheet) return {ok:false};
  var rows = sheet.getDataRange().getValues();
  for(var i = 1; i < rows.length; i++){
    if(String(rows[i][1]) === String(id)){ sheet.deleteRow(i+1); return {ok:true}; }
  }
  return {ok:false, msg:'No encontrado'};
}

// =============================================
// UTILIDADES
// =============================================

function parsearKey(key) {
  var partes = (key || '').split('_');
  var lote  = partes[partes.length - 1];
  var finca = partes.slice(0, -1).join('_');
  return {finca:finca, lote:lote};
}

function getOrCreateSheet(nombre, headers) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(nombre);
  if(!sheet) {
    sheet = ss.insertSheet(nombre);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#1e3a5f').setFontColor('#ffffff').setFontWeight('bold');
  }
  return sheet;
}

function formatFecha(val) {
  if(!val) return '';
  if(val instanceof Date) {
    var y = val.getFullYear();
    var m = String(val.getMonth() + 1).padStart(2, '0');
    var d = String(val.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  return String(val);
}

function getWeekNum(d) {
  var j1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - j1) / 86400000 + j1.getDay() + 1) / 7);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
