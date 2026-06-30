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
  usuarios:       'Usuarios',
  produccion:     'Producción Importada',
  lotes:          'Lotes',
  historialLotes: 'Historial Lotes',
  metas:          'Metas',
};

const METAS_HEADERS = ['Anio','Finca','MetaAnual','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic','FechaActualizacion','Usuario'];

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

    var writeAcciones = ['marcarCosechando','quitarMarca','sincronizarCosecha','marcarTrabajo','quitarTrabajo','marcarSanidad','quitarSanidad'];
    if(writeAcciones.indexOf(accion) >= 0){
      try{
        var marcasParam = params.marcas ? JSON.parse(decodeURIComponent(params.marcas)) : null;
        var data = {
          accion: accion,
          key:    params.key   || '',
          fecha:  params.fecha || '',
          tipo:   params.tipo  || 'continuidad',
          labor:  params.labor || '',
          finca:  params.finca || '',
          lote:   params.lote  || '',
          marcas: marcasParam,
          inicio: parseInt(params.inicio||'0'),
        };
        var result = {ok:false};
        if(accion === 'marcarCosechando')  result = marcarCosecha(data);
        if(accion === 'quitarMarca')        result = quitarCosecha(data);
        if(accion === 'sincronizarCosecha') result = sincronizarCosecha(data);
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

    if(accion === 'validarLogin'){
      var result = validarLogin(params.usuario || '', params.clave || '');
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'listarUsuarios'){
      var result = listarUsuarios();
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'crearUsuario'){
      var d = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
      var result = crearUsuario(d);
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'actualizarUsuario'){
      var d = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
      var result = actualizarUsuario(d);
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
    }
    if(accion === 'eliminarUsuario'){
      var d = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
      var result = eliminarUsuario(d.usuario || '');
      if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      return jsonResponse(result);
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
    if(accion === 'eliminarTrampaRegistro'){
      var d = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
      var result = eliminarTrampaRegistro(d);
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
    if(accion === 'importarProduccion'){
      try {
        var filas = params.data ? JSON.parse(decodeURIComponent(params.data)) : [];
        var result = importarProduccion(filas);
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(result);
      } catch(errImp) {
        var errResult = {ok:false, error: errImp.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(errResult)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(errResult);
      }
    }
    if(accion === 'obtenerProduccion'){
      try {
        var result = obtenerProduccion();
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(result);
      } catch(errObt) {
        var errResult2 = {ok:false, error: errObt.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(errResult2)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(errResult2);
      }
    }
    if(accion === 'listarLotes'){
      try {
        var result = listarLotes();
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(result);
      } catch(errLot) {
        var errResultLot = {ok:false, error: errLot.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(errResultLot)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(errResultLot);
      }
    }
    if(accion === 'crearLote'){
      try {
        var dCrear = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
        var resultCrear = crearLote(dCrear);
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(resultCrear)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(resultCrear);
      } catch(errCrear) {
        var errResultCrear = {ok:false, error: errCrear.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(errResultCrear)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(errResultCrear);
      }
    }
    if(accion === 'actualizarLote'){
      try {
        var dAct = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
        var resultAct = actualizarLote(dAct);
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(resultAct)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(resultAct);
      } catch(errAct) {
        var errResultAct = {ok:false, error: errAct.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(errResultAct)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(errResultAct);
      }
    }
    if(accion === 'eliminarLote'){
      try {
        var dElim = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
        var resultElim = eliminarLote(dElim);
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(resultElim)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(resultElim);
      } catch(errElim) {
        var errResultElim = {ok:false, error: errElim.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(errResultElim)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(errResultElim);
      }
    }
    if(accion === 'listarHistorialLotes'){
      try {
        var resultHist = listarHistorialLotes();
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(resultHist)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(resultHist);
      } catch(errHist) {
        var errResultHist = {ok:false, error: errHist.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(errResultHist)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(errResultHist);
      }
    }
    if(accion === 'cargarPoligonosLotes'){
      try {
        var resultPoly = cargarPoligonosLotes();
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(resultPoly)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(resultPoly);
      } catch(errPoly) {
        var errResultPoly = {ok:false, error: errPoly.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(errResultPoly)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(errResultPoly);
      }
    }
    if(accion === 'importarLotesBulk'){
      try {
        var dBulkLot = params.data ? JSON.parse(decodeURIComponent(params.data)) : [];
        var resultBulkLot = importarLotesBulk(dBulkLot);
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(resultBulkLot)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(resultBulkLot);
      } catch(errBulkLot) {
        var errResultBulkLot = {ok:false, error: errBulkLot.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(errResultBulkLot)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(errResultBulkLot);
      }
    }

    if(accion === 'listarMetas'){
      try {
        var resultMetas = listarMetas(params.anio);
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(resultMetas)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(resultMetas);
      } catch(errMetas) {
        var errResultMetas = {ok:false, error: errMetas.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(errResultMetas)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(errResultMetas);
      }
    }
    if(accion === 'guardarMetas'){
      try {
        var dMetas = params.data ? JSON.parse(decodeURIComponent(params.data)) : {};
        var resultGuardarMetas = guardarMetas(dMetas);
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(resultGuardarMetas)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(resultGuardarMetas);
      } catch(errGuardarMetas) {
        var errResultGuardarMetas = {ok:false, error: errGuardarMetas.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(errResultGuardarMetas)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(errResultGuardarMetas);
      }
    }
    if(accion === 'listarMetasHistorial'){
      try {
        var resultMetasHist = listarMetasHistorial();
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(resultMetasHist)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(resultMetasHist);
      } catch(errMetasHist) {
        var errResultMetasHist = {ok:false, error: errMetasHist.toString()};
        if(callback) return ContentService.createTextOutput(callback+'('+JSON.stringify(errResultMetasHist)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
        return jsonResponse(errResultMetasHist);
      }
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
  var sheet = getOrCreateSheet(SHEETS.sanidad, ['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo','Key']);
  var parts = parsearKey(data.key);
  var finca = data.finca || parts.finca;
  var lote  = data.lote  || parts.lote;
  sheet.appendRow([new Date(), finca, lote, data.labor||'', data.fecha, 'MARCAR', data.tipo||'continuidad', data.key||'']);
  // No se regenera el tablero aquí: repintar 3 labores x 62 lotes x 28 días en
  // cada clic es lento en Apps Script y hacía expirar el timeout del navegador
  // (mostraba "sin conexión" aunque el dato sí se había guardado). El tablero
  // del Sheet se actualiza solo con el trigger horario (actualizarTodo).
  return {ok:true};
}

function quitarSanidad(data) {
  var sheet = getOrCreateSheet(SHEETS.sanidad, ['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo','Key']);
  var parts = parsearKey(data.key);
  var finca = data.finca || parts.finca;
  var lote  = data.lote  || parts.lote;
  sheet.appendRow([new Date(), finca, lote, data.labor||'', data.fecha, 'QUITAR', '', data.key||'']);
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
    // La clave real de la fila es la columna "Key" (p. ej. el id de una trampa
    // individual). Filas viejas sin esa columna usan finca_lote como antes.
    var rawKey = data[i][7] ? String(data[i][7]).trim() : '';
    if(!labor||!fecha) continue;
    if(!marcas[labor]) continue;
    var key = rawKey || (finca+'_'+lote);
    if(!key) continue;
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

  // estado[labor + '|' + key][fecha] = tipo  (key = id de trampa o finca_lote)
  var estado = {};
  var finfo = {}; // labor|key -> {finca,lote}
  for(var i = 1; i < data.length; i++) {
    var finca  = data[i][1] ? String(data[i][1]).trim() : '';
    var lote   = data[i][2] ? String(data[i][2]).trim() : '';
    var labor  = data[i][3] ? String(data[i][3]).trim().toLowerCase().replace(' ','') : '';
    var fecha  = data[i][4] ? formatFecha(data[i][4]) : '';
    var accion = data[i][5] ? String(data[i][5]).trim() : 'MARCAR';
    var tipo   = data[i][6] ? String(data[i][6]).trim() : 'continuidad';
    var rawKey = data[i][7] ? String(data[i][7]).trim() : '';
    if(!labor || !fecha) continue;
    var key = rawKey || (finca+'_'+lote);
    if(!key) continue;
    var ekey = labor + '|' + key;
    finfo[ekey] = {finca:finca, lote:lote, key:key};
    if(!estado[ekey]) estado[ekey] = {};
    if(accion === 'MARCAR') estado[ekey][fecha] = tipo || 'continuidad';
    if(accion === 'QUITAR') delete estado[ekey][fecha];
  }

  var HEADERS = ['Timestamp','Finca','Lote','Labor','Fecha','Accion','Tipo','Key'];
  var nuevasFilas = [HEADERS];
  var ts = new Date();
  Object.keys(estado).sort().forEach(function(ekey) {
    var labor = ekey.split('|')[0];
    var info = finfo[ekey];
    Object.keys(estado[ekey]).sort().forEach(function(fecha) {
      var tipo = estado[ekey][fecha];
      nuevasFilas.push([ts, info.finca, info.lote, labor, fecha, 'MARCAR', tipo, info.key]);
    });
  });

  if(nuevasFilas.length <= 1){
    Logger.log('consolidarHistorialSanidad: sin datos activos, abortando');
    return;
  }

  sheet.clearContents();
  sheet.getRange(1, 1, nuevasFilas.length, 8).setValues(nuevasFilas);
  sheet.getRange(1, 1, 1, 8).setBackground('#1e3a5f').setFontColor('#ffffff').setFontWeight('bold');
  sheet.setFrozenRows(1);
  SpreadsheetApp.flush();
  Logger.log('Historial sanidad consolidado: ' + (nuevasFilas.length - 1) + ' registros.');
}

// =============================================
// TABLERO SANIDAD (un bloque por labor: trampas / censo / control pc)
// =============================================

// Respaldo si "Trampas Config" aún no tiene datos (antes de la primera
// sincronización desde trampas.html). Mismos IDs/lotes que TRAMPAS_INICIALES
// en trampas.html.
var TRAMPAS_RESPALDO = [
  {id:"TR-001",finca:"FINCA 1",lote:"6"},{id:"TR-002",finca:"FINCA 1",lote:"6"},{id:"TR-003",finca:"FINCA 1",lote:"6"},
  {id:"TR-004",finca:"FINCA 1",lote:"7"},{id:"TR-005",finca:"FINCA 1",lote:"7"},{id:"TR-006",finca:"FINCA 1",lote:"7"},
  {id:"TR-007",finca:"FINCA 1",lote:"16"},{id:"TR-008",finca:"FINCA 1",lote:"16"},{id:"TR-009",finca:"FINCA 1",lote:"16"},
  {id:"TR-010",finca:"FINCA 1",lote:"16"},{id:"TR-011",finca:"FINCA 1",lote:"16"},{id:"TR-012",finca:"FINCA 1",lote:"17"},
  {id:"TR-013",finca:"FINCA 1",lote:"17"},{id:"TR-014",finca:"FINCA 1",lote:"17"},{id:"TR-015",finca:"FINCA 1",lote:"17"},
  {id:"TR-016",finca:"FINCA 1",lote:"17"},{id:"TR-017",finca:"FINCA 1",lote:"17"},{id:"TR-018",finca:"FINCA 1",lote:"13"},
  {id:"TR-019",finca:"FINCA 1",lote:"12"},{id:"TR-020",finca:"FINCA 1",lote:"12"},{id:"TR-021",finca:"FINCA 1",lote:"11"},
  {id:"TR-022",finca:"FINCA 1",lote:"11"},{id:"TR-023",finca:"FINCA 1",lote:"11"},{id:"TR-024",finca:"FINCA 1",lote:"11"},
  {id:"TR-025",finca:"FINCA 1",lote:"4A"},{id:"TR-026",finca:"FINCA 1",lote:"4A"},{id:"TR-027",finca:"FINCA 1",lote:"4A"},
  {id:"TR-028",finca:"FINCA 1",lote:"4A"},{id:"TR-029",finca:"FINCA 1",lote:"4A"},{id:"TR-030",finca:"FINCA 1",lote:"2A"},
  {id:"TR-031",finca:"FINCA 1",lote:"1A"},{id:"TR-032",finca:"FINCA 1",lote:"1A"},{id:"TR-033",finca:"FINCA 1",lote:"1A"},
  {id:"TR-034",finca:"FINCA 1",lote:"18"},{id:"TR-035",finca:"FINCA 1",lote:"18"},{id:"TR-036",finca:"FINCA 1",lote:"18"},
  {id:"TR-037",finca:"FINCA 2",lote:"32A"},{id:"TR-038",finca:"FINCA 2",lote:"33A"},{id:"TR-039",finca:"FINCA 2",lote:"33A"},
  {id:"TR-040",finca:"FINCA 2",lote:"33A"},{id:"TR-041",finca:"FINCA 2",lote:"34A"},{id:"TR-042",finca:"FINCA 2",lote:"34A"},
  {id:"TR-043",finca:"FINCA 2",lote:"35A"},{id:"TR-044",finca:"FINCA 2",lote:"35A"},{id:"TR-045",finca:"FINCA 2",lote:"36"},
  {id:"TR-046",finca:"FINCA 2",lote:"39"},{id:"TR-047",finca:"FINCA 2",lote:"39"},{id:"TR-048",finca:"FINCA 2",lote:"40"},
  {id:"TR-049",finca:"FINCA 2",lote:"41"},{id:"TR-050",finca:"FINCA 2",lote:"41"},{id:"TR-051",finca:"FINCA 2",lote:"41"},
  {id:"TR-052",finca:"FINCA 2",lote:"41"},{id:"TR-053",finca:"FINCA 2",lote:"19"},{id:"TR-054",finca:"FINCA 3",lote:"42"},
  {id:"TR-055",finca:"FINCA 3",lote:"42"},{id:"TR-056",finca:"FINCA 3",lote:"42"},{id:"TR-057",finca:"FINCA 3",lote:"42"},
  {id:"TR-058",finca:"FINCA 3",lote:"44A"},{id:"TR-059",finca:"FINCA 3",lote:"44A"},{id:"TR-060",finca:"FINCA 3",lote:"45A"},
  {id:"TR-061",finca:"FINCA 3",lote:"45A"},{id:"TR-062",finca:"FINCA 3",lote:"45A"},{id:"TR-063",finca:"FINCA 3",lote:"58"},
  {id:"TR-064",finca:"FINCA 3",lote:"46"},{id:"TR-065",finca:"FINCA 3",lote:"46"},{id:"TR-066",finca:"FINCA 3",lote:"46"},
  {id:"TR-067",finca:"FINCA 3",lote:"48"},{id:"TR-068",finca:"FINCA 3",lote:"48"},{id:"TR-069",finca:"FINCA 3",lote:"48"},
  {id:"TR-070",finca:"FINCA 3",lote:"48"},{id:"TR-071",finca:"FINCA 3",lote:"50"},{id:"TR-072",finca:"FINCA 3",lote:"50"},
  {id:"TR-073",finca:"FINCA 3",lote:"50"},{id:"TR-074",finca:"FINCA 3",lote:"50"},{id:"TR-075",finca:"FINCA 3",lote:"50"},
  {id:"TR-076",finca:"FINCA 3",lote:"51"},{id:"TR-077",finca:"FINCA 3",lote:"51"},{id:"TR-078",finca:"FINCA 3",lote:"51"},
  {id:"TR-079",finca:"FINCA 3",lote:"52"},{id:"TR-080",finca:"FINCA 3",lote:"52"},{id:"TR-081",finca:"FINCA 3",lote:"54"},
  {id:"TR-082",finca:"FINCA 3",lote:"54"},{id:"TR-083",finca:"FINCA 3",lote:"54"},{id:"TR-084",finca:"FINCA 3",lote:"54"},
  {id:"TR-085",finca:"FINCA 3",lote:"56"},{id:"TR-086",finca:"FINCA 3",lote:"56"},{id:"TR-087",finca:"FINCA 3",lote:"56"},
  {id:"TR-088",finca:"FINCA 3",lote:"56"},{id:"TR-089",finca:"FINCA 3",lote:"56"},{id:"TR-090",finca:"FINCA 3",lote:"56"},
  {id:"TR-091",finca:"FINCA 3",lote:"57"},{id:"TR-092",finca:"FINCA 3",lote:"57"},
];

function filasTrampas() {
  // No se ocultan las trampas inactivas: deben seguir mostrando su historial
  // en el tablero, solo se marcan como "INACTIVA" en vez de calcular su ciclo.
  var cfg = obtenerConfigTrampas();
  var fuente = (cfg.trampas && cfg.trampas.length > 0) ? cfg.trampas : TRAMPAS_RESPALDO;
  return fuente.map(function(t){ return {finca:t.finca, lote:t.lote, ha:null, tipo:'guineensis', label:t.id, key:t.id, activa:t.activa!==false}; })
    .sort(function(a,b){ return a.finca===b.finca ? a.label.localeCompare(b.label) : a.finca.localeCompare(b.finca); });
}

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
    var esTrampas = labor === 'trampas';
    sheet.getRange(filaHdr1, 1).setValue('FINCA');
    sheet.getRange(filaHdr1, 2).setValue(esTrampas ? 'TRAMPA' : 'LOTE');
    sheet.getRange(filaHdr1, 3).setValue(esTrampas ? 'LOTE' : 'HA');
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

    var filas = esTrampas ? filasTrampas() : LOTES.map(function(l){
      return {finca:l.finca, lote:l.lote, ha:l.ha, tipo:l.tipo, label:l.lote, key:l.finca+'_'+l.lote};
    });

    var fincaActual = '';
    filas.forEach(function(row) {
      if(row.finca !== fincaActual) {
        fincaActual = row.finca;
        sheet.getRange(fila, 1).setValue('🌴 ' + row.finca);
        sheet.getRange(fila, 1, 1, totalCols).setBackground(COLOR.fincaHeader.bg).setFontColor(COLOR.fincaHeader.text).setFontWeight('bold').setFontSize(9);
        fila++;
      }
      var marcasLote = (marcas[labor] && marcas[labor][row.key]) || {};
      var ciclo = CICLOS_SANIDAD[labor][row.tipo];
      var cicloLabel = ciclo + ' días';
      var estadoH = calcularEstadoSanidad(marcasLote, labor, row.tipo, hoy);
      var estadoTxt = estadoH==='sin'?'SIN REGISTRO':estadoH==='trabajo'?'TRABAJO':estadoH==='verde'?'EN CICLO':estadoH==='azul'?'TOLERANCIA':'INCUMPLIMIENTO';
      var colorEstado = (estadoH==='verde'||estadoH==='trabajo')?'#d1fae5':estadoH==='azul'?'#dbeafe':estadoH==='rojo'?'#fee2e2':'#f9fafb';
      if(row.activa === false){ estadoTxt = 'INACTIVA'; colorEstado = '#e5e7eb'; }

      sheet.getRange(fila, 1).setValue(row.finca.replace('FINCA ', 'F'));
      sheet.getRange(fila, 2).setValue(row.label);
      sheet.getRange(fila, 3).setValue(esTrampas ? row.lote : row.ha);
      sheet.getRange(fila, 4).setValue(cicloLabel);
      sheet.getRange(fila, 5).setValue(estadoTxt);
      sheet.getRange(fila, 5).setBackground(colorEstado);

      fechas.forEach(function(d, i) {
        var col = FIXED + i + 1;
        var cs = calcularCeldaSanidad(marcasLote, labor, row.tipo, d);
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
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
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
  } finally {
    lock.releaseLock();
  }
}

function eliminarTrampaRegistro(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getOrCreateSheet(SHEETS.trampas, [
      'Timestamp','Fecha','TrampaId','Finca','Lote',
      'Hembras','Machos','TotalCapturas','EstadoCebo','EstadoTrampa',
      'Observaciones','Operario','Hora','CambioCebo','CambioFeromona'
    ]);
    var fecha = data.fecha||'';
    var trampaId = String(data.trampaId||'').trim();
    var lastRow = sheet.getLastRow();
    if(lastRow > 1){
      var rango = sheet.getRange(2, 2, lastRow - 1, 2).getValues();
      for(var i = 0; i < rango.length; i++){
        var fFila = formatFecha(rango[i][0]);
        var idFila = String(rango[i][1] || '').trim();
        if(fFila === fecha && idFila === trampaId){
          sheet.deleteRow(i + 2);
          return {ok:true, eliminado:true};
        }
      }
    }
    return {ok:true, eliminado:false};
  } finally {
    lock.releaseLock();
  }
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
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getOrCreateSheet(SHEETS.trampasCfg, ['TrampaId','Finca','Lote','Activa','Operario','FechaAlta']);
    sheet.clearContents();
    sheet.appendRow(['TrampaId','Finca','Lote','Activa','Operario','FechaAlta']);
    if(trampas.length > 0) {
      var rows = trampas.map(function(t){ return [t.id, t.finca, t.lote, t.activa?'SI':'NO', t.operario||'', t.fechaAlta||'']; });
      sheet.getRange(2, 1, rows.length, 6).setValues(rows);
    }
    return {ok:true, total:trampas.length};
  } finally {
    lock.releaseLock();
  }
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
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
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
  } finally {
    lock.releaseLock();
  }
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

function validarLogin(usuario, clave) {
  if(!usuario || !clave) return {ok:false, error:'Usuario y contraseña requeridos'};
  var sheet = getOrCreateSheet(SHEETS.usuarios, ['Usuario','Contraseña','Nombre','Activo','Rol']);
  var data = sheet.getDataRange().getValues();
  for(var i = 1; i < data.length; i++) {
    var fUsuario = String(data[i][0] || '').trim();
    var fClave   = String(data[i][1] || '');
    var fNombre  = String(data[i][2] || '');
    var fActivo  = data[i][3];
    var fRol     = String(data[i][4] || '').trim().toLowerCase() || 'usuario';
    if(fUsuario.toLowerCase() === usuario.trim().toLowerCase() && fClave === clave) {
      if(fActivo === false || String(fActivo).toLowerCase() === 'no' || String(fActivo).toLowerCase() === 'false') {
        return {ok:false, error:'Usuario inactivo'};
      }
      return {ok:true, nombre: fNombre || fUsuario, rol: fRol};
    }
  }
  return {ok:false, error:'Credenciales inválidas'};
}

function listarUsuarios() {
  var sheet = getOrCreateSheet(SHEETS.usuarios, ['Usuario','Contraseña','Nombre','Activo','Rol']);
  var data = sheet.getDataRange().getValues();
  var usuarios = [];
  for(var i = 1; i < data.length; i++) {
    if(!data[i][0]) continue;
    var fActivo = data[i][3];
    var inactivo = fActivo === false || String(fActivo).toLowerCase() === 'no' || String(fActivo).toLowerCase() === 'false';
    usuarios.push({
      usuario: String(data[i][0] || ''),
      nombre:  String(data[i][2] || ''),
      activo:  !inactivo,
      rol:     String(data[i][4] || '').trim().toLowerCase() || 'usuario',
    });
  }
  return {ok:true, usuarios: usuarios};
}

function crearUsuario(d) {
  var usuario = String(d.usuario || '').trim();
  var clave   = String(d.clave || '');
  if(!usuario || !clave) return {ok:false, error:'Usuario y contraseña requeridos'};
  var sheet = getOrCreateSheet(SHEETS.usuarios, ['Usuario','Contraseña','Nombre','Activo','Rol']);
  var data = sheet.getDataRange().getValues();
  for(var i = 1; i < data.length; i++) {
    if(String(data[i][0] || '').trim().toLowerCase() === usuario.toLowerCase()) {
      return {ok:false, error:'Ese usuario ya existe'};
    }
  }
  sheet.appendRow([usuario, clave, String(d.nombre || ''), 'Sí', String(d.rol || 'usuario').trim().toLowerCase() || 'usuario']);
  return {ok:true};
}

function actualizarUsuario(d) {
  var usuario = String(d.usuario || '').trim();
  if(!usuario) return {ok:false, error:'Usuario requerido'};
  var sheet = getOrCreateSheet(SHEETS.usuarios, ['Usuario','Contraseña','Nombre','Activo','Rol']);
  var data = sheet.getDataRange().getValues();
  for(var i = 1; i < data.length; i++) {
    if(String(data[i][0] || '').trim().toLowerCase() === usuario.toLowerCase()) {
      var fila = i + 1;
      if(d.clave)              sheet.getRange(fila, 2).setValue(String(d.clave));
      if(d.nombre !== undefined) sheet.getRange(fila, 3).setValue(String(d.nombre));
      if(d.activo !== undefined) sheet.getRange(fila, 4).setValue(d.activo ? 'Sí' : 'No');
      if(d.rol)                sheet.getRange(fila, 5).setValue(String(d.rol).trim().toLowerCase());
      return {ok:true};
    }
  }
  return {ok:false, error:'Usuario no encontrado'};
}

function eliminarUsuario(usuario) {
  usuario = String(usuario || '').trim();
  if(!usuario) return {ok:false, error:'Usuario requerido'};
  var sheet = getOrCreateSheet(SHEETS.usuarios, ['Usuario','Contraseña','Nombre','Activo','Rol']);
  var data = sheet.getDataRange().getValues();
  for(var i = 1; i < data.length; i++) {
    if(String(data[i][0] || '').trim().toLowerCase() === usuario.toLowerCase()) {
      sheet.deleteRow(i + 1);
      return {ok:true};
    }
  }
  return {ok:false, error:'Usuario no encontrado'};
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

// =============================================
// PRODUCCIÓN - IMPORTACIÓN DE DATOS (genérico, multiempresa)
// =============================================

function produccionDupKey(fecha, finca, lote) {
  return String(fecha||'').trim() + '|' + String(finca||'').toLowerCase().trim() + '|' + String(lote||'').toLowerCase().trim();
}

function importarProduccion(filas) {
  if(!filas || !Array.isArray(filas)) return {ok:false, error:'Sin filas'};
  var sheet = getOrCreateSheet(SHEETS.produccion, ['Timestamp','Fecha','Finca','Lote','Tipo Palma','Toneladas','Racimos']);
  var existentes = {};
  var lastRow = sheet.getLastRow();
  if(lastRow > 1){
    var data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    data.forEach(function(r){
      existentes[produccionDupKey(r[1], r[2], r[3])] = true;
    });
  }
  var nuevas = [];
  var duplicadas = 0;
  filas.forEach(function(f){
    var key = produccionDupKey(f.fecha, f.finca, f.lote);
    if(existentes[key]) { duplicadas++; return; }
    existentes[key] = true;
    nuevas.push([new Date(), f.fecha||'', f.finca||'', f.lote||'', f.tipo_palma||'', parseFloat(f.toneladas)||0, parseInt(f.racimos,10)||0]);
  });
  if(nuevas.length > 0){
    sheet.getRange(sheet.getLastRow()+1, 1, nuevas.length, 7).setValues(nuevas);
  }
  return {ok:true, insertados:nuevas.length, duplicados:duplicadas};
}

function obtenerProduccion() {
  var sheet = getOrCreateSheet(SHEETS.produccion, ['Timestamp','Fecha','Finca','Lote','Tipo Palma','Toneladas','Racimos']);
  var lastRow = sheet.getLastRow();
  if(lastRow <= 1) return {ok:true, filas:[]};
  var data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  var filas = data.map(function(r){
    return {
      fecha: (r[1] instanceof Date) ? Utilities.formatDate(r[1], 'America/Bogota', 'yyyy-MM-dd') : String(r[1]),
      finca: r[2], lote: r[3], tipo_palma: r[4],
      toneladas: parseFloat(r[5])||0, racimos: parseInt(r[6],10)||0,
    };
  });
  return {ok:true, filas:filas};
}

// =============================================
// LOTES - GESTIÓN DE LOTES (ficha técnica, mapa, historial)
// =============================================

var LOTES_HEADERS = ['finca','lote','tipo','ha','anio_siembra','palmas_sembradas','palmas_productivas','ciclo_objetivo_dias','estado','material_genetico','supervisor','observaciones','poligono','fecha_actualizacion'];
var HISTORIAL_LOTES_HEADERS = ['timestamp','finca','lote','campo','valor_anterior','valor_nuevo','usuario'];

function loteKey(finca, lote) {
  return String(finca||'').trim().toLowerCase() + '|' + String(lote||'').trim().toLowerCase();
}

function loteRowToObj(r) {
  var poligono = [];
  try {
    if(r[12]) poligono = JSON.parse(r[12]);
    if(!Array.isArray(poligono)) poligono = [];
  } catch(eParse) { poligono = []; }
  return {
    finca: String(r[0]||''),
    lote: String(r[1]||''),
    tipo: String(r[2]||''),
    ha: parseFloat(r[3])||0,
    anio_siembra: r[4] ? parseInt(r[4],10)||'' : '',
    palmas_sembradas: parseInt(r[5],10)||0,
    palmas_productivas: parseInt(r[6],10)||0,
    ciclo_objetivo_dias: parseInt(r[7],10)||0,
    estado: String(r[8]||'activo') || 'activo',
    material_genetico: String(r[9]||''),
    supervisor: String(r[10]||''),
    observaciones: String(r[11]||''),
    poligono: poligono,
    fecha_actualizacion: formatFecha(r[13]),
  };
}

function seedLotesSheetIfEmpty_(sheet) {
  if(sheet.getLastRow() > 1) return;
  var hoy = formatFecha(new Date());
  var filas = LOTES.map(function(l){
    return [
      l.finca, l.lote, l.tipo, l.ha,
      '', 0, 0, 0,
      'activo', '', '', '',
      JSON.stringify([]),
      hoy,
    ];
  });
  if(filas.length > 0) {
    sheet.getRange(2, 1, filas.length, LOTES_HEADERS.length).setValues(filas);
  }
}

function listarLotes() {
  var sheet = getOrCreateSheet(SHEETS.lotes, LOTES_HEADERS);
  seedLotesSheetIfEmpty_(sheet);
  var lastRow = sheet.getLastRow();
  if(lastRow <= 1) return {ok:true, lotes:[]};
  var data = sheet.getRange(2, 1, lastRow - 1, LOTES_HEADERS.length).getValues();
  var lotes = data.filter(function(r){ return r[0] || r[1]; }).map(loteRowToObj);
  return {ok:true, lotes:lotes};
}

function findLoteRow_(sheet, finca, lote) {
  var lastRow = sheet.getLastRow();
  if(lastRow <= 1) return -1;
  var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  var key = loteKey(finca, lote);
  for(var i = 0; i < data.length; i++) {
    if(loteKey(data[i][0], data[i][1]) === key) return i + 2;
  }
  return -1;
}

function crearLote(d) {
  var finca = String(d.finca||'').trim();
  var lote = String(d.lote||'').trim();
  if(!finca || !lote) return {ok:false, error:'Finca y lote son requeridos'};
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getOrCreateSheet(SHEETS.lotes, LOTES_HEADERS);
    seedLotesSheetIfEmpty_(sheet);
    if(findLoteRow_(sheet, finca, lote) !== -1) {
      return {ok:false, error:'Ya existe un lote con esa finca y número de lote'};
    }
    var fila = [
      finca, lote,
      String(d.tipo||'').trim(),
      parseFloat(d.ha)||0,
      d.anio_siembra ? parseInt(d.anio_siembra,10)||'' : '',
      parseInt(d.palmas_sembradas,10)||0,
      parseInt(d.palmas_productivas,10)||0,
      parseInt(d.ciclo_objetivo_dias,10)||0,
      String(d.estado||'activo').trim() || 'activo',
      String(d.material_genetico||'').trim(),
      String(d.supervisor||'').trim(),
      String(d.observaciones||'').trim(),
      JSON.stringify(Array.isArray(d.poligono) ? d.poligono : []),
      formatFecha(new Date()),
    ];
    sheet.appendRow(fila);
    return {ok:true};
  } finally {
    lock.releaseLock();
  }
}

function actualizarLote(d) {
  var finca = String(d.finca||'').trim();
  var lote = String(d.lote||'').trim();
  if(!finca || !lote) return {ok:false, error:'Finca y lote son requeridos'};
  var usuario = String(d.usuario||'').trim() || 'sistema';
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getOrCreateSheet(SHEETS.lotes, LOTES_HEADERS);
    seedLotesSheetIfEmpty_(sheet);
    var fila = findLoteRow_(sheet, finca, lote);
    if(fila === -1) return {ok:false, error:'Lote no encontrado'};

    var actual = sheet.getRange(fila, 1, 1, LOTES_HEADERS.length).getValues()[0];
    var actualObj = loteRowToObj(actual);

    var editable = ['tipo','ha','anio_siembra','palmas_sembradas','palmas_productivas','ciclo_objetivo_dias','estado','material_genetico','supervisor','observaciones','poligono'];
    var cambios = [];
    var nuevo = actual.slice();

    editable.forEach(function(campo){
      if(d[campo] === undefined) return;
      var idx = LOTES_HEADERS.indexOf(campo);
      var valorAnterior, valorNuevo, valorParaGuardar;
      if(campo === 'poligono') {
        valorAnterior = JSON.stringify(actualObj.poligono);
        var poligonoNuevo = Array.isArray(d.poligono) ? d.poligono : [];
        valorNuevo = JSON.stringify(poligonoNuevo);
        valorParaGuardar = valorNuevo;
      } else if(campo === 'ha' ) {
        valorAnterior = actualObj[campo];
        valorParaGuardar = parseFloat(d[campo])||0;
        valorNuevo = valorParaGuardar;
      } else if(['palmas_sembradas','palmas_productivas','ciclo_objetivo_dias','anio_siembra'].indexOf(campo) >= 0) {
        valorAnterior = actualObj[campo];
        valorParaGuardar = parseInt(d[campo],10)||0;
        valorNuevo = valorParaGuardar;
      } else {
        valorAnterior = actualObj[campo];
        valorParaGuardar = String(d[campo]).trim();
        valorNuevo = valorParaGuardar;
      }
      if(String(valorAnterior) !== String(valorNuevo)) {
        cambios.push({campo:campo, anterior:valorAnterior, nuevo:valorNuevo});
        nuevo[idx] = valorParaGuardar;
      }
    });

    if(cambios.length > 0) {
      nuevo[LOTES_HEADERS.indexOf('fecha_actualizacion')] = formatFecha(new Date());
      sheet.getRange(fila, 1, 1, LOTES_HEADERS.length).setValues([nuevo]);

      var histSheet = getOrCreateSheet(SHEETS.historialLotes, HISTORIAL_LOTES_HEADERS);
      var histFilas = cambios.map(function(c){
        return [new Date(), finca, lote, c.campo, String(c.anterior), String(c.nuevo), usuario];
      });
      histSheet.getRange(histSheet.getLastRow()+1, 1, histFilas.length, HISTORIAL_LOTES_HEADERS.length).setValues(histFilas);
    }

    return {ok:true, cambios:cambios.length};
  } finally {
    lock.releaseLock();
  }
}

function eliminarLote(d) {
  var finca = String(d.finca||'').trim();
  var lote = String(d.lote||'').trim();
  if(!finca || !lote) return {ok:false, error:'Finca y lote son requeridos'};
  var usuario = String(d.usuario||'').trim() || 'sistema';
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getOrCreateSheet(SHEETS.lotes, LOTES_HEADERS);
    seedLotesSheetIfEmpty_(sheet);
    var fila = findLoteRow_(sheet, finca, lote);
    if(fila === -1) return {ok:false, error:'Lote no encontrado'};

    var idxEstado = LOTES_HEADERS.indexOf('estado');
    var estadoAnterior = String(sheet.getRange(fila, idxEstado+1).getValue()||'activo');
    if(estadoAnterior === 'inactivo') return {ok:true, yaInactivo:true};

    sheet.getRange(fila, idxEstado+1).setValue('inactivo');
    sheet.getRange(fila, LOTES_HEADERS.indexOf('fecha_actualizacion')+1).setValue(formatFecha(new Date()));

    var histSheet = getOrCreateSheet(SHEETS.historialLotes, HISTORIAL_LOTES_HEADERS);
    histSheet.appendRow([new Date(), finca, lote, 'estado', estadoAnterior, 'inactivo', usuario]);

    return {ok:true};
  } finally {
    lock.releaseLock();
  }
}

function listarMetas(anio) {
  var sheet = getOrCreateSheet(SHEETS.metas, METAS_HEADERS);
  var lastRow = sheet.getLastRow();
  if(lastRow <= 1) return {ok:true, metas:[]};
  var data = sheet.getRange(2, 1, lastRow - 1, METAS_HEADERS.length).getValues();
  var metas = data.filter(function(r){ return r[0] && String(r[0]) === String(anio); }).map(function(r){
    return {
      anio: r[0],
      finca: String(r[1]||''),
      metaAnual: parseFloat(r[2])||0,
      meses: r.slice(3, 15).map(function(v){ return parseFloat(v)||0; }),
      fechaActualizacion: String(r[15]||''),
      usuario: String(r[16]||''),
    };
  });
  return {ok:true, metas:metas};
}

function guardarMetas(d) {
  var anio = String(d.anio||'').trim();
  if(!anio) return {ok:false, error:'Año requerido'};
  var usuario = String(d.usuario||'').trim() || 'sistema';
  var fincas = Array.isArray(d.fincas) ? d.fincas : [];
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getOrCreateSheet(SHEETS.metas, METAS_HEADERS);
    var lastRow = sheet.getLastRow();
    var restantes = [];
    if(lastRow > 1) {
      var data = sheet.getRange(2, 1, lastRow - 1, METAS_HEADERS.length).getValues();
      restantes = data.filter(function(r){ return r[0] && String(r[0]) !== anio; });
    }
    var fecha = formatFecha(new Date());
    var nuevas = fincas.map(function(f){
      var meses = Array.isArray(f.meses) ? f.meses : [];
      var fila = [anio, String(f.finca||'').trim(), parseFloat(f.metaAnual)||0];
      for(var i = 0; i < 12; i++) fila.push(parseFloat(meses[i])||0);
      fila.push(fecha, usuario);
      return fila;
    });
    sheet.clearContents();
    sheet.getRange(1, 1, 1, METAS_HEADERS.length).setValues([METAS_HEADERS]);
    var todas = restantes.concat(nuevas);
    if(todas.length) sheet.getRange(2, 1, todas.length, METAS_HEADERS.length).setValues(todas);
    return {ok:true};
  } finally {
    lock.releaseLock();
  }
}

function listarMetasHistorial() {
  var sheet = getOrCreateSheet(SHEETS.metas, METAS_HEADERS);
  var lastRow = sheet.getLastRow();
  if(lastRow <= 1) return {ok:true, historial:[]};
  var data = sheet.getRange(2, 1, lastRow - 1, METAS_HEADERS.length).getValues();
  var porAnio = {};
  data.filter(function(r){ return r[0]; }).forEach(function(r){
    var anio = String(r[0]);
    if(!porAnio[anio]) porAnio[anio] = {anio:anio, metaEmpresa:0, fincas:[], fechaActualizacion:String(r[15]||''), usuario:String(r[16]||'')};
    var metaAnual = parseFloat(r[2])||0;
    porAnio[anio].metaEmpresa += metaAnual;
    porAnio[anio].fincas.push({finca:String(r[1]||''), metaAnual:metaAnual});
    if(String(r[15]||'') > porAnio[anio].fechaActualizacion) porAnio[anio].fechaActualizacion = String(r[15]||'');
  });
  var historial = Object.keys(porAnio).map(function(k){ return porAnio[k]; }).sort(function(a,b){ return b.anio - a.anio; });
  return {ok:true, historial:historial};
}

function listarHistorialLotes() {
  var sheet = getOrCreateSheet(SHEETS.historialLotes, HISTORIAL_LOTES_HEADERS);
  var lastRow = sheet.getLastRow();
  if(lastRow <= 1) return {ok:true, historial:[]};
  var data = sheet.getRange(2, 1, lastRow - 1, HISTORIAL_LOTES_HEADERS.length).getValues();
  var historial = data.filter(function(r){ return r[0]; }).map(function(r){
    return {
      timestamp: (r[0] instanceof Date) ? Utilities.formatDate(r[0], 'America/Bogota', 'yyyy-MM-dd HH:mm:ss') : String(r[0]),
      finca: String(r[1]||''),
      lote: String(r[2]||''),
      campo: String(r[3]||''),
      valor_anterior: String(r[4]||''),
      valor_nuevo: String(r[5]||''),
      usuario: String(r[6]||''),
    };
  });
  historial.reverse();
  return {ok:true, historial:historial};
}


// =============================================
// MIGRACION UNICA: poligonos reales de lotes (GeoJSON proporcionado)
// Ejecutar una sola vez via accion=cargarPoligonosLotes tras desplegar.
// =============================================
var LOTES_POLIGONOS_SEED = [{"finca":"FINCA 1","lote":"18A","poligono":[{"lat":2.80789362,"lng":-72.77738172},{"lat":2.80756023,"lng":-72.77711176},{"lat":2.80596086,"lng":-72.77578379},{"lat":2.80590501,"lng":-72.77572448},{"lat":2.80580682,"lng":-72.77572928},{"lat":2.80547592,"lng":-72.77628279},{"lat":2.80544465,"lng":-72.77642345},{"lat":2.80549818,"lng":-72.77651402},{"lat":2.80642286,"lng":-72.7772599},{"lat":2.8063356,"lng":-72.7779069},{"lat":2.80664071,"lng":-72.77817532},{"lat":2.80672557,"lng":-72.77819085},{"lat":2.80715332,"lng":-72.77853727},{"lat":2.80727252,"lng":-72.77835276},{"lat":2.80730691,"lng":-72.77819959},{"lat":2.80737276,"lng":-72.7780667},{"lat":2.80745751,"lng":-72.77798847},{"lat":2.807685,"lng":-72.77768821},{"lat":2.80772581,"lng":-72.77765457},{"lat":2.80783407,"lng":-72.77752085},{"lat":2.80790779,"lng":-72.77740827},{"lat":2.80789362,"lng":-72.77738172}]},{"finca":"FINCA 1","lote":"6","poligono":[{"lat":2.80890425,"lng":-72.77069362},{"lat":2.8088024,"lng":-72.77094062},{"lat":2.80872247,"lng":-72.77111728},{"lat":2.80865527,"lng":-72.77143924},{"lat":2.8085456,"lng":-72.77172062},{"lat":2.80841702,"lng":-72.77194577},{"lat":2.80835749,"lng":-72.77210209},{"lat":2.80851501,"lng":-72.77246443},{"lat":2.8084996,"lng":-72.77272696},{"lat":2.80844946,"lng":-72.77285202},{"lat":2.80842748,"lng":-72.77286767},{"lat":2.80855183,"lng":-72.77307379},{"lat":2.80836358,"lng":-72.77332713},{"lat":2.80844542,"lng":-72.77345205},{"lat":2.80860891,"lng":-72.77352843},{"lat":2.80871576,"lng":-72.77353613},{"lat":2.80887,"lng":-72.77377971},{"lat":2.8088512,"lng":-72.77382661},{"lat":2.80892683,"lng":-72.77401404},{"lat":2.80901009,"lng":-72.77400769},{"lat":2.80917541,"lng":-72.7743169},{"lat":2.8092791,"lng":-72.77430428},{"lat":2.80942364,"lng":-72.774301},{"lat":2.80956021,"lng":-72.77418834},{"lat":2.80997347,"lng":-72.77422695},{"lat":2.81015755,"lng":-72.77445331},{"lat":2.81014659,"lng":-72.7744877},{"lat":2.81017343,"lng":-72.7746033},{"lat":2.81037931,"lng":-72.77465308},{"lat":2.81050051,"lng":-72.77484982},{"lat":2.81068912,"lng":-72.77490899},{"lat":2.81075205,"lng":-72.77498393},{"lat":2.81100353,"lng":-72.7750649},{"lat":2.81124865,"lng":-72.775074},{"lat":2.81149666,"lng":-72.77486434},{"lat":2.81179683,"lng":-72.7749312},{"lat":2.81192557,"lng":-72.77485137},{"lat":2.81197575,"lng":-72.77476068},{"lat":2.81211227,"lng":-72.77460428},{"lat":2.8122818,"lng":-72.77446658},{"lat":2.81252517,"lng":-72.77431943},{"lat":2.81276072,"lng":-72.77420823},{"lat":2.81285556,"lng":-72.7740128},{"lat":2.80990511,"lng":-72.76892898},{"lat":2.80967956,"lng":-72.76854033},{"lat":2.80965422,"lng":-72.76836535},{"lat":2.80965738,"lng":-72.76698561},{"lat":2.80963368,"lng":-72.76687313},{"lat":2.80960061,"lng":-72.76680676},{"lat":2.80935313,"lng":-72.7667836},{"lat":2.80810247,"lng":-72.76677718},{"lat":2.80802702,"lng":-72.76674914},{"lat":2.80797356,"lng":-72.76671013},{"lat":2.80789017,"lng":-72.76661179},{"lat":2.80779574,"lng":-72.76646657},{"lat":2.80753911,"lng":-72.76599653},{"lat":2.80751868,"lng":-72.7659903},{"lat":2.80692904,"lng":-72.76698631},{"lat":2.80686945,"lng":-72.76709263},{"lat":2.80669059,"lng":-72.76731471},{"lat":2.80660438,"lng":-72.76750075},{"lat":2.80652313,"lng":-72.7678946},{"lat":2.80619059,"lng":-72.76838249},{"lat":2.80616558,"lng":-72.76850284},{"lat":2.80623013,"lng":-72.76861683},{"lat":2.80639206,"lng":-72.76870884},{"lat":2.80650848,"lng":-72.76884153},{"lat":2.80665787,"lng":-72.76895387},{"lat":2.8068324,"lng":-72.76906774},{"lat":2.80691572,"lng":-72.76911452},{"lat":2.8070288,"lng":-72.7690769},{"lat":2.80711366,"lng":-72.76909086},{"lat":2.80723013,"lng":-72.76926574},{"lat":2.80736838,"lng":-72.76925543},{"lat":2.80742501,"lng":-72.76931943},{"lat":2.80750594,"lng":-72.76932637},{"lat":2.80753742,"lng":-72.76937947},{"lat":2.80766786,"lng":-72.76940823},{"lat":2.80787458,"lng":-72.76950878},{"lat":2.80796968,"lng":-72.76954305},{"lat":2.80802713,"lng":-72.76964065},{"lat":2.80820093,"lng":-72.76980218},{"lat":2.80828029,"lng":-72.76981928},{"lat":2.8083165,"lng":-72.76988487},{"lat":2.8084045,"lng":-72.76988946},{"lat":2.80837161,"lng":-72.76998794},{"lat":2.80850372,"lng":-72.77010186},{"lat":2.80859655,"lng":-72.77021582},{"lat":2.80865783,"lng":-72.77022747},{"lat":2.80869325,"lng":-72.77028056},{"lat":2.80870041,"lng":-72.77036727},{"lat":2.80875239,"lng":-72.77047737},{"lat":2.80877916,"lng":-72.77053594},{"lat":2.8089005,"lng":-72.7706889},{"lat":2.80890425,"lng":-72.77069362}]},{"finca":"FINCA 1","lote":"5","poligono":[{"lat":2.80749372,"lng":-72.76591845},{"lat":2.80684938,"lng":-72.76485143},{"lat":2.80680642,"lng":-72.76483689},{"lat":2.80535673,"lng":-72.76481976},{"lat":2.8052655,"lng":-72.76472611},{"lat":2.8047387,"lng":-72.76386},{"lat":2.80248251,"lng":-72.76386252},{"lat":2.80248785,"lng":-72.76488338},{"lat":2.80248491,"lng":-72.76599383},{"lat":2.80245193,"lng":-72.76647096},{"lat":2.80228988,"lng":-72.76674928},{"lat":2.8017012,"lng":-72.7667291},{"lat":2.8016415,"lng":-72.7667375},{"lat":2.80160404,"lng":-72.76696151},{"lat":2.80149323,"lng":-72.76715538},{"lat":2.80148282,"lng":-72.76720852},{"lat":2.8014955,"lng":-72.76730539},{"lat":2.80141916,"lng":-72.7674211},{"lat":2.8013941,"lng":-72.7674878},{"lat":2.80145291,"lng":-72.76762315},{"lat":2.80143623,"lng":-72.76769817},{"lat":2.80148674,"lng":-72.76790646},{"lat":2.80152875,"lng":-72.76799912},{"lat":2.80161996,"lng":-72.7680761},{"lat":2.80179284,"lng":-72.76811966},{"lat":2.80204007,"lng":-72.76814543},{"lat":2.80216678,"lng":-72.76812029},{"lat":2.80244022,"lng":-72.7681752},{"lat":2.80250521,"lng":-72.76821471},{"lat":2.80280266,"lng":-72.76818938},{"lat":2.80284043,"lng":-72.76824975},{"lat":2.80327616,"lng":-72.76823677},{"lat":2.8033808,"lng":-72.76814082},{"lat":2.80352018,"lng":-72.76820421},{"lat":2.80371178,"lng":-72.76813211},{"lat":2.80384356,"lng":-72.76795384},{"lat":2.80397846,"lng":-72.76775681},{"lat":2.80405073,"lng":-72.76775673},{"lat":2.80422636,"lng":-72.76745652},{"lat":2.80416335,"lng":-72.76730659},{"lat":2.80422919,"lng":-72.76717213},{"lat":2.80423216,"lng":-72.76702212},{"lat":2.80419437,"lng":-72.76694716},{"lat":2.80422887,"lng":-72.76689087},{"lat":2.80417207,"lng":-72.76667999},{"lat":2.80410432,"lng":-72.76651444},{"lat":2.80413569,"lng":-72.7664644},{"lat":2.80410405,"lng":-72.76627068},{"lat":2.80399552,"lng":-72.76616924},{"lat":2.80401744,"lng":-72.76609577},{"lat":2.8039655,"lng":-72.7660177},{"lat":2.80390263,"lng":-72.76599902},{"lat":2.80386629,"lng":-72.76581937},{"lat":2.80381275,"lng":-72.76570536},{"lat":2.8037685,"lng":-72.76547884},{"lat":2.80377316,"lng":-72.76542884},{"lat":2.80384218,"lng":-72.76533188},{"lat":2.80393484,"lng":-72.76529584},{"lat":2.80400411,"lng":-72.76542545},{"lat":2.80400106,"lng":-72.76550358},{"lat":2.80404994,"lng":-72.76565822},{"lat":2.80400137,"lng":-72.76578172},{"lat":2.80408008,"lng":-72.76591757},{"lat":2.80411792,"lng":-72.76603003},{"lat":2.80439656,"lng":-72.76650943},{"lat":2.80434641,"lng":-72.76662355},{"lat":2.80436695,"lng":-72.76672353},{"lat":2.80449605,"lng":-72.76696089},{"lat":2.80445064,"lng":-72.76709532},{"lat":2.80443185,"lng":-72.76715159},{"lat":2.80438314,"lng":-72.76715634},{"lat":2.80436276,"lng":-72.76719699},{"lat":2.80435499,"lng":-72.76727043},{"lat":2.80444473,"lng":-72.76743596},{"lat":2.80440245,"lng":-72.76755789},{"lat":2.80435385,"lng":-72.76765014},{"lat":2.80438698,"lng":-72.76777666},{"lat":2.80422084,"lng":-72.76813467},{"lat":2.80431848,"lng":-72.76833457},{"lat":2.8044804,"lng":-72.76840939},{"lat":2.80471944,"lng":-72.76860757},{"lat":2.80491588,"lng":-72.76864642},{"lat":2.80525986,"lng":-72.76855072},{"lat":2.8055033,"lng":-72.76847388},{"lat":2.8056825,"lng":-72.76854869},{"lat":2.80591029,"lng":-72.768525},{"lat":2.80597626,"lng":-72.76850148},{"lat":2.80602638,"lng":-72.76836705},{"lat":2.80609858,"lng":-72.76829665},{"lat":2.80620679,"lng":-72.76812309},{"lat":2.8062916,"lng":-72.76808862},{"lat":2.80638567,"lng":-72.76791507},{"lat":2.8063526,"lng":-72.76784948},{"lat":2.80641373,"lng":-72.76771816},{"lat":2.80652683,"lng":-72.76769459},{"lat":2.80654543,"lng":-72.76747113},{"lat":2.80652169,"lng":-72.76731646},{"lat":2.80663304,"lng":-72.76713977},{"lat":2.80668175,"lng":-72.76713659},{"lat":2.80681664,"lng":-72.76693331},{"lat":2.80690621,"lng":-72.76694414},{"lat":2.80749372,"lng":-72.76591845}]},{"finca":"FINCA 1","lote":"4A","poligono":[{"lat":2.79749467,"lng":-72.76675422},{"lat":2.79737232,"lng":-72.76693717},{"lat":2.79749467,"lng":-72.76675422},{"lat":2.7970076,"lng":-72.76744384},{"lat":2.79628781,"lng":-72.76867748},{"lat":2.79630219,"lng":-72.76888841},{"lat":2.79574698,"lng":-72.7697703},{"lat":2.79578358,"lng":-72.76983237},{"lat":2.79644662,"lng":-72.77054064},{"lat":2.7964913,"lng":-72.7704527},{"lat":2.79663845,"lng":-72.77032011},{"lat":2.7968151,"lng":-72.77022616},{"lat":2.79695633,"lng":-72.77006897},{"lat":2.79719429,"lng":-72.77000542},{"lat":2.7974275,"lng":-72.76990672},{"lat":2.79781378,"lng":-72.76969535},{"lat":2.79804461,"lng":-72.76958493},{"lat":2.798094,"lng":-72.76949347},{"lat":2.79822821,"lng":-72.76937379},{"lat":2.79837422,"lng":-72.76928456},{"lat":2.79841184,"lng":-72.76920014},{"lat":2.79853191,"lng":-72.76908985},{"lat":2.79864492,"lng":-72.7689866},{"lat":2.79869903,"lng":-72.7689045},{"lat":2.79874843,"lng":-72.76882241},{"lat":2.79876724,"lng":-72.76877786},{"lat":2.79847253,"lng":-72.76821973},{"lat":2.79801173,"lng":-72.76772653},{"lat":2.79774546,"lng":-72.76773923},{"lat":2.79760934,"lng":-72.76770175},{"lat":2.79760625,"lng":-72.76750296},{"lat":2.79783842,"lng":-72.76750845},{"lat":2.79791197,"lng":-72.76744697},{"lat":2.79820667,"lng":-72.76761082},{"lat":2.79857175,"lng":-72.76787513},{"lat":2.79879972,"lng":-72.76821822},{"lat":2.79906688,"lng":-72.76841815},{"lat":2.79925268,"lng":-72.76837674},{"lat":2.79936679,"lng":-72.76831066},{"lat":2.80029249,"lng":-72.76822938},{"lat":2.80076193,"lng":-72.76805597},{"lat":2.80107415,"lng":-72.76804542},{"lat":2.80125263,"lng":-72.76786904},{"lat":2.8014091,"lng":-72.76610572},{"lat":2.80137749,"lng":-72.76533349},{"lat":2.80132359,"lng":-72.76441725},{"lat":2.80141612,"lng":-72.76438364},{"lat":2.80150585,"lng":-72.76443362},{"lat":2.80153528,"lng":-72.76540221},{"lat":2.80167868,"lng":-72.766693},{"lat":2.80224451,"lng":-72.76665117},{"lat":2.80241596,"lng":-72.76638029},{"lat":2.80243445,"lng":-72.76614903},{"lat":2.8024381,"lng":-72.76394579},{"lat":2.80242677,"lng":-72.763792},{"lat":2.8018809,"lng":-72.76298783},{"lat":2.80175317,"lng":-72.76285025},{"lat":2.80133249,"lng":-72.76279155},{"lat":2.80067384,"lng":-72.76282654},{"lat":2.80004872,"lng":-72.76285369},{"lat":2.79987275,"lng":-72.76290602},{"lat":2.79907676,"lng":-72.764102},{"lat":2.79749467,"lng":-72.76675422}]},{"finca":"FINCA 1","lote":"3A","poligono":[{"lat":2.7964684,"lng":-72.77052128},{"lat":2.79649439,"lng":-72.77058336},{"lat":2.79712913,"lng":-72.77127174},{"lat":2.79737895,"lng":-72.77126912},{"lat":2.79950238,"lng":-72.77126208},{"lat":2.79956364,"lng":-72.77124795},{"lat":2.7996979,"lng":-72.77117749},{"lat":2.80024145,"lng":-72.77040577},{"lat":2.80564784,"lng":-72.77039039},{"lat":2.80565959,"lng":-72.77035522},{"lat":2.80528167,"lng":-72.7696103},{"lat":2.80516371,"lng":-72.76950496},{"lat":2.80496335,"lng":-72.76947237},{"lat":2.8048207,"lng":-72.7694151},{"lat":2.80470874,"lng":-72.76939765},{"lat":2.80453427,"lng":-72.76933456},{"lat":2.80410395,"lng":-72.76914988},{"lat":2.80383058,"lng":-72.76916542},{"lat":2.80360896,"lng":-72.76908714},{"lat":2.80316587,"lng":-72.76907357},{"lat":2.8022491,"lng":-72.76908397},{"lat":2.80213128,"lng":-72.76909582},{"lat":2.80189784,"lng":-72.76898826},{"lat":2.80170931,"lng":-72.76900253},{"lat":2.80137919,"lng":-72.76884586},{"lat":2.80119293,"lng":-72.76878044},{"lat":2.80067679,"lng":-72.76877164},{"lat":2.80058488,"lng":-72.76876705},{"lat":2.80043412,"lng":-72.76883754},{"lat":2.79938303,"lng":-72.7688598},{"lat":2.79931477,"lng":-72.76893487},{"lat":2.79915932,"lng":-72.76902294},{"lat":2.79901674,"lng":-72.76902193},{"lat":2.7989567,"lng":-72.76907239},{"lat":2.79893319,"lng":-72.76912866},{"lat":2.79884489,"lng":-72.76920025},{"lat":2.79876132,"lng":-72.76928355},{"lat":2.79860945,"lng":-72.76940911},{"lat":2.7984423,"lng":-72.76956516},{"lat":2.79826804,"lng":-72.7696966},{"lat":2.79809614,"lng":-72.76981867},{"lat":2.7980042,"lng":-72.76980237},{"lat":2.79796653,"lng":-72.76983288},{"lat":2.79790524,"lng":-72.76981654},{"lat":2.79776845,"lng":-72.76973232},{"lat":2.79744342,"lng":-72.76991549},{"lat":2.7971678,"lng":-72.77001893},{"lat":2.79696284,"lng":-72.7700965},{"lat":2.79684043,"lng":-72.77021851},{"lat":2.79652018,"lng":-72.77045559},{"lat":2.7964684,"lng":-72.77052128}]},{"finca":"FINCA 1","lote":"1A","poligono":[{"lat":2.80767755,"lng":-72.77361012},{"lat":2.80721399,"lng":-72.77313296},{"lat":2.80710974,"lng":-72.77306028},{"lat":2.80607679,"lng":-72.77302937},{"lat":2.80591168,"lng":-72.77295856},{"lat":2.80572647,"lng":-72.77295144},{"lat":2.80525349,"lng":-72.77280195},{"lat":2.80493791,"lng":-72.77280828},{"lat":2.80462986,"lng":-72.77260649},{"lat":2.80453726,"lng":-72.77251289},{"lat":2.80440127,"lng":-72.77243479},{"lat":2.80427241,"lng":-72.7723751},{"lat":2.80421418,"lng":-72.77234464},{"lat":2.80407608,"lng":-72.7722097},{"lat":2.80406847,"lng":-72.77217617},{"lat":2.80399695,"lng":-72.77214744},{"lat":2.8039831,"lng":-72.7721175},{"lat":2.80389585,"lng":-72.77211086},{"lat":2.80385405,"lng":-72.77211478},{"lat":2.80372537,"lng":-72.77220071},{"lat":2.80356645,"lng":-72.77223059},{"lat":2.80281715,"lng":-72.77219989},{"lat":2.8026587,"lng":-72.77222238},{"lat":2.80229887,"lng":-72.77236555},{"lat":2.80220617,"lng":-72.77239048},{"lat":2.80217555,"lng":-72.77240337},{"lat":2.80209261,"lng":-72.77239187},{"lat":2.80192205,"lng":-72.77244267},{"lat":2.80177121,"lng":-72.77245368},{"lat":2.80107851,"lng":-72.77273515},{"lat":2.80102769,"lng":-72.77275018},{"lat":2.80092828,"lng":-72.77271856},{"lat":2.80073752,"lng":-72.77270397},{"lat":2.80063971,"lng":-72.77266076},{"lat":2.80060585,"lng":-72.77262101},{"lat":2.79946563,"lng":-72.77261868},{"lat":2.79938711,"lng":-72.77266388},{"lat":2.79879042,"lng":-72.77266616},{"lat":2.79898107,"lng":-72.77282179},{"lat":2.79929146,"lng":-72.77307673},{"lat":2.79975691,"lng":-72.77343433},{"lat":2.80133723,"lng":-72.77474953},{"lat":2.80313168,"lng":-72.77616657},{"lat":2.80441655,"lng":-72.7771993},{"lat":2.80472877,"lng":-72.77686792},{"lat":2.80432008,"lng":-72.77623122},{"lat":2.80431275,"lng":-72.77620226},{"lat":2.8046496,"lng":-72.77579037},{"lat":2.80544033,"lng":-72.7757285},{"lat":2.80642018,"lng":-72.77399392},{"lat":2.80740857,"lng":-72.77395399},{"lat":2.80755083,"lng":-72.77384064},{"lat":2.80767755,"lng":-72.77361012}]},{"finca":"FINCA 1","lote":"11","poligono":[{"lat":2.81095876,"lng":-72.7631996},{"lat":2.81063885,"lng":-72.76263419},{"lat":2.81055033,"lng":-72.76263429},{"lat":2.81049941,"lng":-72.76251889},{"lat":2.8103441,"lng":-72.76249597},{"lat":2.81033386,"lng":-72.76242815},{"lat":2.81023371,"lng":-72.7624095},{"lat":2.81016544,"lng":-72.76235184},{"lat":2.81011029,"lng":-72.76235335},{"lat":2.80997163,"lng":-72.76229},{"lat":2.80993746,"lng":-72.7622287},{"lat":2.80986706,"lng":-72.76222156},{"lat":2.80976179,"lng":-72.76216539},{"lat":2.80971674,"lng":-72.7621106},{"lat":2.80962957,"lng":-72.76203132},{"lat":2.80948291,"lng":-72.76195138},{"lat":2.80944003,"lng":-72.7618937},{"lat":2.80925714,"lng":-72.76185999},{"lat":2.80918376,"lng":-72.76177419},{"lat":2.8089551,"lng":-72.76169435},{"lat":2.80881632,"lng":-72.76152925},{"lat":2.80873794,"lng":-72.76151779},{"lat":2.80830926,"lng":-72.76101313},{"lat":2.80794871,"lng":-72.76043767},{"lat":2.80785422,"lng":-72.76030067},{"lat":2.80777,"lng":-72.76025458},{"lat":2.80766822,"lng":-72.7600815},{"lat":2.80748809,"lng":-72.75992583},{"lat":2.80730083,"lng":-72.75987841},{"lat":2.80704086,"lng":-72.75969541},{"lat":2.80693182,"lng":-72.75952523},{"lat":2.80659802,"lng":-72.7595054},{"lat":2.80629769,"lng":-72.75957068},{"lat":2.80625118,"lng":-72.75951012},{"lat":2.80602921,"lng":-72.75956954},{"lat":2.80592779,"lng":-72.75971253},{"lat":2.80546923,"lng":-72.7597347},{"lat":2.80516877,"lng":-72.75968019},{"lat":2.80502776,"lng":-72.75947108},{"lat":2.80508718,"lng":-72.75940029},{"lat":2.80495778,"lng":-72.75918683},{"lat":2.80499402,"lng":-72.7591536},{"lat":2.80491694,"lng":-72.75900936},{"lat":2.80473678,"lng":-72.7590072},{"lat":2.80447304,"lng":-72.75915418},{"lat":2.80436724,"lng":-72.75927698},{"lat":2.80411185,"lng":-72.75930324},{"lat":2.80409292,"lng":-72.75924842},{"lat":2.80356756,"lng":-72.75923169},{"lat":2.80343413,"lng":-72.75930111},{"lat":2.80291268,"lng":-72.76017342},{"lat":2.802952,"lng":-72.76029605},{"lat":2.80355281,"lng":-72.76030115},{"lat":2.80336461,"lng":-72.76071125},{"lat":2.80482744,"lng":-72.76071106},{"lat":2.80509783,"lng":-72.76111631},{"lat":2.80833768,"lng":-72.76111485},{"lat":2.80868072,"lng":-72.76160445},{"lat":2.80923684,"lng":-72.76251741},{"lat":2.80986597,"lng":-72.76254052},{"lat":2.81030284,"lng":-72.76322198},{"lat":2.81090655,"lng":-72.76322708},{"lat":2.81095876,"lng":-72.7631996}]},{"finca":"FINCA 1","lote":"2A","poligono":[{"lat":2.80640283,"lng":-72.77173004},{"lat":2.80636497,"lng":-72.7716204},{"lat":2.80616009,"lng":-72.77139259},{"lat":2.8061452,"lng":-72.77105777},{"lat":2.80608548,"lng":-72.77086155},{"lat":2.80593147,"lng":-72.7706943},{"lat":2.80565105,"lng":-72.77040163},{"lat":2.80037155,"lng":-72.77045079},{"lat":2.80022652,"lng":-72.77053177},{"lat":2.80000489,"lng":-72.77089572},{"lat":2.79991351,"lng":-72.77094056},{"lat":2.79969763,"lng":-72.77125687},{"lat":2.79954677,"lng":-72.77131332},{"lat":2.79741201,"lng":-72.77131424},{"lat":2.79734971,"lng":-72.7714038},{"lat":2.79879363,"lng":-72.7726535},{"lat":2.79938572,"lng":-72.77264274},{"lat":2.79946549,"lng":-72.77260369},{"lat":2.80062066,"lng":-72.77260096},{"lat":2.80074838,"lng":-72.77260948},{"lat":2.80101248,"lng":-72.77259043},{"lat":2.80109664,"lng":-72.77257302},{"lat":2.80120255,"lng":-72.77255269},{"lat":2.80156218,"lng":-72.77230983},{"lat":2.80166232,"lng":-72.77231405},{"lat":2.80187121,"lng":-72.77223443},{"lat":2.80219042,"lng":-72.77218357},{"lat":2.80225707,"lng":-72.77208535},{"lat":2.80236012,"lng":-72.77209245},{"lat":2.80250655,"lng":-72.77196384},{"lat":2.80321914,"lng":-72.77199913},{"lat":2.80342089,"lng":-72.77202633},{"lat":2.80372844,"lng":-72.77192929},{"lat":2.80429727,"lng":-72.77188248},{"lat":2.80448452,"lng":-72.77192124},{"lat":2.80490556,"lng":-72.77208242},{"lat":2.80540625,"lng":-72.77209774},{"lat":2.80553971,"lng":-72.77205429},{"lat":2.80611154,"lng":-72.77209551},{"lat":2.80635374,"lng":-72.77195958},{"lat":2.80640283,"lng":-72.77173004}]},{"finca":"FINCA 1","lote":"11A","poligono":[{"lat":2.80154559,"lng":-72.76142769},{"lat":2.80165137,"lng":-72.76128614},{"lat":2.80221152,"lng":-72.7612653},{"lat":2.80254758,"lng":-72.76071072},{"lat":2.80330221,"lng":-72.76071276},{"lat":2.80353106,"lng":-72.76031561},{"lat":2.80349042,"lng":-72.76031421},{"lat":2.80294765,"lng":-72.76030327},{"lat":2.80290687,"lng":-72.7601691},{"lat":2.80318064,"lng":-72.75971561},{"lat":2.80297891,"lng":-72.75971151},{"lat":2.80273222,"lng":-72.75972333},{"lat":2.80246812,"lng":-72.75974383},{"lat":2.80221278,"lng":-72.75980762},{"lat":2.80200134,"lng":-72.76019753},{"lat":2.80155151,"lng":-72.76024133},{"lat":2.8013803,"lng":-72.76027039},{"lat":2.80118868,"lng":-72.76021865},{"lat":2.80100752,"lng":-72.76024008},{"lat":2.8005749,"lng":-72.76095257},{"lat":2.80094671,"lng":-72.76121387},{"lat":2.80093898,"lng":-72.76142548},{"lat":2.80154559,"lng":-72.76142769}]},{"finca":"FINCA 1","lote":"9","poligono":[{"lat":2.80277217,"lng":-72.76168611},{"lat":2.80201285,"lng":-72.76300357},{"lat":2.80239455,"lng":-72.76367209},{"lat":2.80250352,"lng":-72.76378238},{"lat":2.80263634,"lng":-72.76381037},{"lat":2.80466514,"lng":-72.76381027},{"lat":2.80477837,"lng":-72.76383613},{"lat":2.80535299,"lng":-72.76474798},{"lat":2.80546404,"lng":-72.76477384},{"lat":2.80689858,"lng":-72.7647809},{"lat":2.8077623,"lng":-72.7662867},{"lat":2.80789317,"lng":-72.76651315},{"lat":2.8085681,"lng":-72.7653217},{"lat":2.80864067,"lng":-72.7653375},{"lat":2.80877903,"lng":-72.76512518},{"lat":2.80882256,"lng":-72.7651208},{"lat":2.80888343,"lng":-72.76505218},{"lat":2.80894366,"lng":-72.76505139},{"lat":2.80908277,"lng":-72.76487444},{"lat":2.80939756,"lng":-72.76475718},{"lat":2.80966162,"lng":-72.76470349},{"lat":2.80968183,"lng":-72.76460965},{"lat":2.8096252,"lng":-72.76457796},{"lat":2.80954376,"lng":-72.76442651},{"lat":2.80921268,"lng":-72.7642508},{"lat":2.80905454,"lng":-72.76428995},{"lat":2.80891954,"lng":-72.76425835},{"lat":2.80884996,"lng":-72.76432914},{"lat":2.80868451,"lng":-72.76431778},{"lat":2.8085451,"lng":-72.76423279},{"lat":2.80825311,"lng":-72.76397621},{"lat":2.8080904,"lng":-72.76381908},{"lat":2.80803229,"lng":-72.76376574},{"lat":2.80805837,"lng":-72.76373252},{"lat":2.80793936,"lng":-72.76371677},{"lat":2.80766911,"lng":-72.76343853},{"lat":2.80759362,"lng":-72.76341119},{"lat":2.80752681,"lng":-72.76335931},{"lat":2.80738878,"lng":-72.76321946},{"lat":2.80717254,"lng":-72.76321393},{"lat":2.80692995,"lng":-72.7630006},{"lat":2.80684874,"lng":-72.76305409},{"lat":2.80673106,"lng":-72.76293732},{"lat":2.80651483,"lng":-72.76294189},{"lat":2.80638288,"lng":-72.76303441},{"lat":2.80629147,"lng":-72.76305616},{"lat":2.80626398,"lng":-72.76312691},{"lat":2.80617695,"lng":-72.76316597},{"lat":2.80609123,"lng":-72.76308092},{"lat":2.80566603,"lng":-72.76308139},{"lat":2.80561517,"lng":-72.76302661},{"lat":2.80551647,"lng":-72.7630094},{"lat":2.80543804,"lng":-72.76295175},{"lat":2.80533212,"lng":-72.76297208},{"lat":2.80514481,"lng":-72.76287992},{"lat":2.80498077,"lng":-72.76283392},{"lat":2.80464813,"lng":-72.76256296},{"lat":2.804503,"lng":-72.7625559},{"lat":2.80436639,"lng":-72.76237565},{"lat":2.80428656,"lng":-72.76236419},{"lat":2.80421385,"lng":-72.76223871},{"lat":2.80361885,"lng":-72.76223216},{"lat":2.80369123,"lng":-72.7620762},{"lat":2.80350221,"lng":-72.76175168},{"lat":2.80342965,"lng":-72.76176042},{"lat":2.80332509,"lng":-72.76169271},{"lat":2.80277217,"lng":-72.76168611}]},{"finca":"FINCA 1","lote":"8","poligono":[{"lat":2.80790079,"lng":-72.76651278},{"lat":2.80788231,"lng":-72.76653445},{"lat":2.80801746,"lng":-72.76670099},{"lat":2.80816989,"lng":-72.76674412},{"lat":2.81134371,"lng":-72.76674166},{"lat":2.8114874,"lng":-72.76675449},{"lat":2.81159524,"lng":-72.76683664},{"lat":2.81214161,"lng":-72.7677875},{"lat":2.81219174,"lng":-72.76784374},{"lat":2.8122494,"lng":-72.76781553},{"lat":2.81400374,"lng":-72.76476105},{"lat":2.81402003,"lng":-72.76472531},{"lat":2.81385353,"lng":-72.76475256},{"lat":2.81378719,"lng":-72.76480134},{"lat":2.81375014,"lng":-72.76476567},{"lat":2.81358252,"lng":-72.76475719},{"lat":2.81351947,"lng":-72.76482329},{"lat":2.81350756,"lng":-72.76488284},{"lat":2.81344445,"lng":-72.76489915},{"lat":2.81334963,"lng":-72.76478884},{"lat":2.81317761,"lng":-72.76474574},{"lat":2.81309256,"lng":-72.76460295},{"lat":2.81299574,"lng":-72.76464852},{"lat":2.81288456,"lng":-72.76450576},{"lat":2.81284078,"lng":-72.76428824},{"lat":2.81294621,"lng":-72.76415931},{"lat":2.81295366,"lng":-72.76401209},{"lat":2.81281309,"lng":-72.76386828},{"lat":2.81268031,"lng":-72.76387167},{"lat":2.81260634,"lng":-72.76391397},{"lat":2.81255196,"lng":-72.76394975},{"lat":2.81249984,"lng":-72.76405914},{"lat":2.81252061,"lng":-72.76413164},{"lat":2.81259252,"lng":-72.76420625},{"lat":2.81268521,"lng":-72.76435444},{"lat":2.81260267,"lng":-72.76451366},{"lat":2.81258535,"lng":-72.76459486},{"lat":2.81251903,"lng":-72.76466096},{"lat":2.81248654,"lng":-72.76480713},{"lat":2.8122909,"lng":-72.76504657},{"lat":2.81218975,"lng":-72.76511812},{"lat":2.81198946,"lng":-72.76509995},{"lat":2.81188808,"lng":-72.76495285},{"lat":2.8117421,"lng":-72.76483827},{"lat":2.81159381,"lng":-72.76460354},{"lat":2.81163179,"lng":-72.764505},{"lat":2.81147493,"lng":-72.76439152},{"lat":2.81139329,"lng":-72.76438403},{"lat":2.81126605,"lng":-72.76447185},{"lat":2.81124109,"lng":-72.76454332},{"lat":2.81115625,"lng":-72.76458888},{"lat":2.81111389,"lng":-72.76466686},{"lat":2.81098664,"lng":-72.76475468},{"lat":2.8109041,"lng":-72.76490957},{"lat":2.81081809,"lng":-72.7648891},{"lat":2.81065374,"lng":-72.7648882},{"lat":2.81061899,"lng":-72.7649586},{"lat":2.81054174,"lng":-72.76498141},{"lat":2.81050371,"lng":-72.76504099},{"lat":2.81033937,"lng":-72.76504983},{"lat":2.81026762,"lng":-72.7651246},{"lat":2.81022514,"lng":-72.76510084},{"lat":2.81012588,"lng":-72.76491368},{"lat":2.80993312,"lng":-72.76481431},{"lat":2.80958918,"lng":-72.7648147},{"lat":2.80952832,"lng":-72.76488837},{"lat":2.80928888,"lng":-72.76490163},{"lat":2.80914527,"lng":-72.76496024},{"lat":2.8089974,"lng":-72.76509355},{"lat":2.80875812,"lng":-72.7652486},{"lat":2.80865055,"lng":-72.76541001},{"lat":2.80850699,"lng":-72.76550759},{"lat":2.80841356,"lng":-72.7656614},{"lat":2.80790079,"lng":-72.76651278}]},{"finca":"FINCA 1","lote":"7","poligono":[{"lat":2.80971984,"lng":-72.76678569},{"lat":2.80971634,"lng":-72.76851004},{"lat":2.81287674,"lng":-72.77399023},{"lat":2.8131679,"lng":-72.7735093},{"lat":2.81330491,"lng":-72.77339007},{"lat":2.81352436,"lng":-72.77302829},{"lat":2.81370056,"lng":-72.77291768},{"lat":2.81389171,"lng":-72.77255377},{"lat":2.81394804,"lng":-72.77231123},{"lat":2.81387816,"lng":-72.7721143},{"lat":2.81405647,"lng":-72.77194957},{"lat":2.81411918,"lng":-72.77157064},{"lat":2.81402956,"lng":-72.77124384},{"lat":2.81415134,"lng":-72.77113979},{"lat":2.81431026,"lng":-72.77114394},{"lat":2.81469505,"lng":-72.77069538},{"lat":2.81506728,"lng":-72.77068197},{"lat":2.81518244,"lng":-72.77049783},{"lat":2.81524538,"lng":-72.77032456},{"lat":2.81523212,"lng":-72.77015139},{"lat":2.81519944,"lng":-72.77012761},{"lat":2.81509491,"lng":-72.77008876},{"lat":2.8147899,"lng":-72.76986828},{"lat":2.81464401,"lng":-72.76983163},{"lat":2.81452861,"lng":-72.76980578},{"lat":2.81441101,"lng":-72.76975829},{"lat":2.81438036,"lng":-72.76960678},{"lat":2.81447584,"lng":-72.76933822},{"lat":2.81460639,"lng":-72.76928828},{"lat":2.81474571,"lng":-72.76928596},{"lat":2.81509405,"lng":-72.76932454},{"lat":2.81519184,"lng":-72.76918155},{"lat":2.8152069,"lng":-72.76902133},{"lat":2.81517153,"lng":-72.76854292},{"lat":2.8152322,"lng":-72.76829606},{"lat":2.81497072,"lng":-72.76806687},{"lat":2.81481607,"lng":-72.76797611},{"lat":2.81468992,"lng":-72.76807151},{"lat":2.81421317,"lng":-72.76805689},{"lat":2.81399532,"lng":-72.76790559},{"lat":2.81397994,"lng":-72.76778004},{"lat":2.81413415,"lng":-72.76747678},{"lat":2.81425153,"lng":-72.76732294},{"lat":2.81430564,"lng":-72.76704794},{"lat":2.81405955,"lng":-72.76695729},{"lat":2.814066,"lng":-72.76687934},{"lat":2.8145448,"lng":-72.76678788},{"lat":2.81454249,"lng":-72.76666881},{"lat":2.81441476,"lng":-72.76633556},{"lat":2.81440366,"lng":-72.76614073},{"lat":2.81459186,"lng":-72.76605284},{"lat":2.81475485,"lng":-72.7658156},{"lat":2.81478931,"lng":-72.76548758},{"lat":2.81480208,"lng":-72.7652267},{"lat":2.81480416,"lng":-72.76514551},{"lat":2.81475929,"lng":-72.76493232},{"lat":2.81457833,"lng":-72.76467381},{"lat":2.8145065,"lng":-72.76467931},{"lat":2.81442369,"lng":-72.76460687},{"lat":2.81431045,"lng":-72.76456478},{"lat":2.8142212,"lng":-72.76456272},{"lat":2.81419078,"lng":-72.76461471},{"lat":2.81220825,"lng":-72.76800176},{"lat":2.81148417,"lng":-72.7667913},{"lat":2.80971984,"lng":-72.76678569}]},{"finca":"FINCA 1","lote":"12","poligono":[{"lat":2.80491909,"lng":-72.75450532},{"lat":2.80489508,"lng":-72.75444365},{"lat":2.80479058,"lng":-72.75443799},{"lat":2.80475145,"lng":-72.75448566},{"lat":2.80471694,"lng":-72.75476281},{"lat":2.80442866,"lng":-72.75521631},{"lat":2.80374502,"lng":-72.75638756},{"lat":2.80370595,"lng":-72.75649296},{"lat":2.80378158,"lng":-72.75663287},{"lat":2.80377441,"lng":-72.75671226},{"lat":2.80350168,"lng":-72.75680204},{"lat":2.80335087,"lng":-72.75690324},{"lat":2.80250541,"lng":-72.75807539},{"lat":2.80221787,"lng":-72.75853611},{"lat":2.80221939,"lng":-72.75859528},{"lat":2.80234282,"lng":-72.75866297},{"lat":2.80246477,"lng":-72.75870758},{"lat":2.80262006,"lng":-72.75871751},{"lat":2.80264916,"lng":-72.75878675},{"lat":2.80272467,"lng":-72.75882852},{"lat":2.80284095,"lng":-72.7589857},{"lat":2.80300344,"lng":-72.758948},{"lat":2.80311092,"lng":-72.75902148},{"lat":2.80324595,"lng":-72.75907906},{"lat":2.80333307,"lng":-72.75912659},{"lat":2.80365233,"lng":-72.75911902},{"lat":2.80428939,"lng":-72.75909954},{"lat":2.80431254,"lng":-72.75903168},{"lat":2.80451426,"lng":-72.75903723},{"lat":2.80457514,"lng":-72.75896789},{"lat":2.80479266,"lng":-72.75883198},{"lat":2.80491598,"lng":-72.75879864},{"lat":2.80501622,"lng":-72.75888946},{"lat":2.80519174,"lng":-72.75882143},{"lat":2.80536297,"lng":-72.75881402},{"lat":2.8056401,"lng":-72.75876031},{"lat":2.80576917,"lng":-72.758688},{"lat":2.80589458,"lng":-72.75857745},{"lat":2.80601639,"lng":-72.75849721},{"lat":2.8062123,"lng":-72.75849266},{"lat":2.80651912,"lng":-72.75839923},{"lat":2.80659957,"lng":-72.75831038},{"lat":2.80662994,"lng":-72.75821942},{"lat":2.80660581,"lng":-72.75805492},{"lat":2.80659033,"lng":-72.75784061},{"lat":2.8067208,"lng":-72.75771706},{"lat":2.8067141,"lng":-72.75756769},{"lat":2.80666384,"lng":-72.75740105},{"lat":2.80651777,"lng":-72.75720854},{"lat":2.80615208,"lng":-72.75722411},{"lat":2.80611937,"lng":-72.75716569},{"lat":2.80583851,"lng":-72.75712704},{"lat":2.80580843,"lng":-72.75705268},{"lat":2.80585379,"lng":-72.75697391},{"lat":2.80594458,"lng":-72.75690978},{"lat":2.80594941,"lng":-72.75685153},{"lat":2.8058665,"lng":-72.75685423},{"lat":2.8057902,"lng":-72.75675257},{"lat":2.8054974,"lng":-72.75673774},{"lat":2.80547786,"lng":-72.75678431},{"lat":2.80515959,"lng":-72.7567951},{"lat":2.80512796,"lng":-72.75674865},{"lat":2.80504858,"lng":-72.75674271},{"lat":2.80504672,"lng":-72.75667114},{"lat":2.80503351,"lng":-72.75654126},{"lat":2.80496702,"lng":-72.7564569},{"lat":2.80444892,"lng":-72.7564445},{"lat":2.80424655,"lng":-72.75650534},{"lat":2.80419219,"lng":-72.75656602},{"lat":2.80410951,"lng":-72.75659425},{"lat":2.80407474,"lng":-72.75665275},{"lat":2.803868,"lng":-72.75669844},{"lat":2.80383295,"lng":-72.75650797},{"lat":2.80397442,"lng":-72.75648183},{"lat":2.80411578,"lng":-72.7563691},{"lat":2.80430514,"lng":-72.7563494},{"lat":2.8047294,"lng":-72.75615409},{"lat":2.80493079,"lng":-72.75617659},{"lat":2.80503087,"lng":-72.75613535},{"lat":2.80502742,"lng":-72.75596974},{"lat":2.80516887,"lng":-72.75593602},{"lat":2.80520707,"lng":-72.75602474},{"lat":2.80546492,"lng":-72.75593569},{"lat":2.8055322,"lng":-72.75575701},{"lat":2.8055114,"lng":-72.7556542},{"lat":2.80555377,"lng":-72.75558596},{"lat":2.80557757,"lng":-72.75545063},{"lat":2.80538783,"lng":-72.75513694},{"lat":2.80523082,"lng":-72.75489465},{"lat":2.80506943,"lng":-72.75462638},{"lat":2.80491909,"lng":-72.75450532}]},{"finca":"FINCA 1","lote":"13","poligono":[{"lat":2.80659478,"lng":-72.75218449},{"lat":2.80542122,"lng":-72.75387441},{"lat":2.80553162,"lng":-72.75396666},{"lat":2.80568551,"lng":-72.75402421},{"lat":2.80585952,"lng":-72.75390567},{"lat":2.80614396,"lng":-72.75390824},{"lat":2.80633823,"lng":-72.75373194},{"lat":2.80649757,"lng":-72.75347775},{"lat":2.80663386,"lng":-72.75336358},{"lat":2.80673682,"lng":-72.75329852},{"lat":2.8068224,"lng":-72.75326378},{"lat":2.80688332,"lng":-72.75323918},{"lat":2.80692247,"lng":-72.75320883},{"lat":2.80696318,"lng":-72.75327084},{"lat":2.80667472,"lng":-72.7535627},{"lat":2.80653125,"lng":-72.75374471},{"lat":2.80646886,"lng":-72.75375489},{"lat":2.8062775,"lng":-72.75392829},{"lat":2.80579035,"lng":-72.75433151},{"lat":2.80570334,"lng":-72.75438934},{"lat":2.8056979,"lng":-72.75470686},{"lat":2.80578372,"lng":-72.75488428},{"lat":2.80581289,"lng":-72.75501126},{"lat":2.80578119,"lng":-72.75521046},{"lat":2.80583354,"lng":-72.75530566},{"lat":2.80579021,"lng":-72.75549044},{"lat":2.80583109,"lng":-72.755704},{"lat":2.80582135,"lng":-72.75607348},{"lat":2.80582011,"lng":-72.75625389},{"lat":2.80584785,"lng":-72.75640252},{"lat":2.8060192,"lng":-72.75649469},{"lat":2.8062398,"lng":-72.75651032},{"lat":2.80626888,"lng":-72.75655936},{"lat":2.80645467,"lng":-72.75659234},{"lat":2.80664931,"lng":-72.75674511},{"lat":2.80669154,"lng":-72.75687351},{"lat":2.80676558,"lng":-72.75689652},{"lat":2.80699961,"lng":-72.75723687},{"lat":2.80697512,"lng":-72.75739854},{"lat":2.80701452,"lng":-72.75758468},{"lat":2.80698992,"lng":-72.75764821},{"lat":2.8070597,"lng":-72.75775637},{"lat":2.80701915,"lng":-72.75783147},{"lat":2.80704989,"lng":-72.7580638},{"lat":2.80718511,"lng":-72.75829312},{"lat":2.80756902,"lng":-72.7577024},{"lat":2.80803773,"lng":-72.75768023},{"lat":2.8089966,"lng":-72.75605837},{"lat":2.80894425,"lng":-72.75596895},{"lat":2.80873194,"lng":-72.75558816},{"lat":2.80765885,"lng":-72.75374633},{"lat":2.80802098,"lng":-72.75315852},{"lat":2.80676474,"lng":-72.7523279},{"lat":2.80659478,"lng":-72.75218449}]},{"finca":"FINCA 1","lote":"17","poligono":[{"lat":2.80803478,"lng":-72.75316933},{"lat":2.80769437,"lng":-72.75371743},{"lat":2.80901027,"lng":-72.75596021},{"lat":2.80904659,"lng":-72.75599481},{"lat":2.81050798,"lng":-72.75600327},{"lat":2.81056604,"lng":-72.75601764},{"lat":2.81144427,"lng":-72.75750321},{"lat":2.81151979,"lng":-72.75755797},{"lat":2.81202191,"lng":-72.75755452},{"lat":2.81426986,"lng":-72.76139685},{"lat":2.81732615,"lng":-72.76141796},{"lat":2.81744221,"lng":-72.76138752},{"lat":2.81745515,"lng":-72.76128215},{"lat":2.81733175,"lng":-72.7612361},{"lat":2.81716614,"lng":-72.76108763},{"lat":2.81719794,"lng":-72.76097213},{"lat":2.81713242,"lng":-72.76078314},{"lat":2.81709158,"lng":-72.7606071},{"lat":2.81702345,"lng":-72.7606779},{"lat":2.81693198,"lng":-72.76063182},{"lat":2.81686659,"lng":-72.76056261},{"lat":2.81678676,"lng":-72.76054971},{"lat":2.81670982,"lng":-72.76052382},{"lat":2.81663425,"lng":-72.76043587},{"lat":2.81653699,"lng":-72.76041144},{"lat":2.81647756,"lng":-72.7604678},{"lat":2.81630905,"lng":-72.76032077},{"lat":2.81618122,"lng":-72.76021123},{"lat":2.81594457,"lng":-72.76012201},{"lat":2.81586628,"lng":-72.76018993},{"lat":2.81578945,"lng":-72.76026795},{"lat":2.81568199,"lng":-72.76020024},{"lat":2.81566161,"lng":-72.76014542},{"lat":2.81575,"lng":-72.7600313},{"lat":2.81563226,"lng":-72.75985969},{"lat":2.81562495,"lng":-72.75981784},{"lat":2.81559298,"lng":-72.75977746},{"lat":2.81559724,"lng":-72.75969231},{"lat":2.81555942,"lng":-72.7596173},{"lat":2.81555787,"lng":-72.75952926},{"lat":2.81546463,"lng":-72.75921473},{"lat":2.81539496,"lng":-72.75919893},{"lat":2.81531799,"lng":-72.75915428},{"lat":2.81518157,"lng":-72.75914289},{"lat":2.81510765,"lng":-72.75922524},{"lat":2.81497274,"lng":-72.75927302},{"lat":2.81490608,"lng":-72.75935969},{"lat":2.8148451,"lng":-72.75933378},{"lat":2.814845,"lng":-72.75924429},{"lat":2.81497264,"lng":-72.75918498},{"lat":2.81507119,"lng":-72.75907373},{"lat":2.81515671,"lng":-72.75897983},{"lat":2.81513907,"lng":-72.75878356},{"lat":2.81506072,"lng":-72.75879375},{"lat":2.8149837,"lng":-72.75870436},{"lat":2.81496475,"lng":-72.75863077},{"lat":2.81506038,"lng":-72.75849644},{"lat":2.81504425,"lng":-72.75835502},{"lat":2.81479327,"lng":-72.75842313},{"lat":2.81477156,"lng":-72.75847367},{"lat":2.81456987,"lng":-72.75849843},{"lat":2.81444191,"lng":-72.75827776},{"lat":2.81430241,"lng":-72.75811627},{"lat":2.81403825,"lng":-72.75807904},{"lat":2.81411061,"lng":-72.75790144},{"lat":2.81421508,"lng":-72.75788689},{"lat":2.81431173,"lng":-72.75787231},{"lat":2.8143775,"lng":-72.75779001},{"lat":2.81433093,"lng":-72.75767315},{"lat":2.8141059,"lng":-72.75758825},{"lat":2.81392714,"lng":-72.75736619},{"lat":2.81391661,"lng":-72.75703281},{"lat":2.81379898,"lng":-72.75696367},{"lat":2.81380177,"lng":-72.75686552},{"lat":2.81360719,"lng":-72.75676038},{"lat":2.81325162,"lng":-72.75674635},{"lat":2.81286415,"lng":-72.75675256},{"lat":2.81274096,"lng":-72.75689125},{"lat":2.812635,"lng":-72.75687405},{"lat":2.8127219,"lng":-72.75671952},{"lat":2.8127843,"lng":-72.75671801},{"lat":2.81286112,"lng":-72.75663566},{"lat":2.81269845,"lng":-72.75651605},{"lat":2.8125765,"lng":-72.75647433},{"lat":2.81239354,"lng":-72.7563865},{"lat":2.81222514,"lng":-72.7563304},{"lat":2.81217861,"lng":-72.75624963},{"lat":2.81204774,"lng":-72.75601886},{"lat":2.81187644,"lng":-72.75596853},{"lat":2.81174437,"lng":-72.75596724},{"lat":2.81148884,"lng":-72.75585928},{"lat":2.81154958,"lng":-72.75567736},{"lat":2.81146958,"lng":-72.75551581},{"lat":2.81133875,"lng":-72.75532256},{"lat":2.8110005,"lng":-72.75522191},{"lat":2.81087574,"lng":-72.75525669},{"lat":2.81080883,"lng":-72.75512254},{"lat":2.81084504,"lng":-72.75506333},{"lat":2.81089567,"lng":-72.75492327},{"lat":2.81081285,"lng":-72.75483244},{"lat":2.81085179,"lng":-72.75461735},{"lat":2.81069782,"lng":-72.75449485},{"lat":2.81056132,"lng":-72.7544214},{"lat":2.81042465,"lng":-72.75419496},{"lat":2.81033746,"lng":-72.75409114},{"lat":2.81018066,"lng":-72.75402926},{"lat":2.81005441,"lng":-72.75403373},{"lat":2.80954221,"lng":-72.75410791},{"lat":2.8094319,"lng":-72.75409072},{"lat":2.80912411,"lng":-72.75397272},{"lat":2.80908203,"lng":-72.75397709},{"lat":2.80897586,"lng":-72.75377804},{"lat":2.808591,"lng":-72.75351869},{"lat":2.80824246,"lng":-72.75330476},{"lat":2.80803478,"lng":-72.75316933}]},{"finca":"FINCA 1","lote":"10","poligono":[{"lat":2.80327042,"lng":-72.76082754},{"lat":2.80278374,"lng":-72.76165074},{"lat":2.8028186,"lng":-72.76167668},{"lat":2.80333234,"lng":-72.7616862},{"lat":2.80344271,"lng":-72.76175247},{"lat":2.80350655,"lng":-72.76174518},{"lat":2.80370284,"lng":-72.76207691},{"lat":2.80383351,"lng":-72.76212872},{"lat":2.80394522,"lng":-72.76210118},{"lat":2.80416427,"lng":-72.76202877},{"lat":2.80437221,"lng":-72.76201845},{"lat":2.80461136,"lng":-72.76212497},{"lat":2.8046849,"lng":-72.76222533},{"lat":2.80499478,"lng":-72.76239299},{"lat":2.80508482,"lng":-72.76244629},{"lat":2.8052343,"lng":-72.76245189},{"lat":2.80542159,"lng":-72.76252385},{"lat":2.80562187,"lng":-72.76253517},{"lat":2.8057219,"lng":-72.76243691},{"lat":2.80616311,"lng":-72.76247972},{"lat":2.80634755,"lng":-72.76259497},{"lat":2.80643753,"lng":-72.76259487},{"lat":2.80650148,"lng":-72.76268717},{"lat":2.80672207,"lng":-72.76268981},{"lat":2.80676712,"lng":-72.76274316},{"lat":2.80708929,"lng":-72.76273991},{"lat":2.80714451,"lng":-72.76280624},{"lat":2.80730283,"lng":-72.76292874},{"lat":2.80772226,"lng":-72.76295425},{"lat":2.80774844,"lng":-72.76300762},{"lat":2.80793292,"lng":-72.76315752},{"lat":2.80814335,"lng":-72.76315728},{"lat":2.80820146,"lng":-72.7632135},{"lat":2.80836258,"lng":-72.76324508},{"lat":2.80848905,"lng":-72.763434},{"lat":2.80862411,"lng":-72.76352189},{"lat":2.80877654,"lng":-72.76356646},{"lat":2.80886075,"lng":-72.76359667},{"lat":2.80895077,"lng":-72.76363987},{"lat":2.80906834,"lng":-72.76365417},{"lat":2.80923254,"lng":-72.7638445},{"lat":2.80946944,"lng":-72.76415309},{"lat":2.80956528,"lng":-72.76421072},{"lat":2.8096785,"lng":-72.7642308},{"lat":2.80970031,"lng":-72.76426541},{"lat":2.80990504,"lng":-72.76436477},{"lat":2.81026059,"lng":-72.76436437},{"lat":2.81043025,"lng":-72.76424728},{"lat":2.81093857,"lng":-72.76331291},{"lat":2.8109095,"lng":-72.76327254},{"lat":2.81025356,"lng":-72.7632776},{"lat":2.80987987,"lng":-72.76264154},{"lat":2.80974774,"lng":-72.76258107},{"lat":2.80920353,"lng":-72.76257302},{"lat":2.80836895,"lng":-72.76117687},{"lat":2.80505145,"lng":-72.76117193},{"lat":2.80479559,"lng":-72.76077387},{"lat":2.80330085,"lng":-72.76078709},{"lat":2.80327042,"lng":-72.76082754}]},{"finca":"FINCA 1","lote":"16","poligono":[{"lat":2.81437376,"lng":-72.76152302},{"lat":2.81437382,"lng":-72.76157642},{"lat":2.81476644,"lng":-72.76227164},{"lat":2.81460137,"lng":-72.76259656},{"lat":2.81461307,"lng":-72.76267737},{"lat":2.81493734,"lng":-72.76324565},{"lat":2.81492578,"lng":-72.76329185},{"lat":2.81428845,"lng":-72.76435481},{"lat":2.8143001,"lng":-72.7643981},{"lat":2.81473548,"lng":-72.76440627},{"lat":2.81476021,"lng":-72.76445676},{"lat":2.81485752,"lng":-72.7645317},{"lat":2.81493006,"lng":-72.76450853},{"lat":2.81498089,"lng":-72.76454311},{"lat":2.81513942,"lng":-72.76484746},{"lat":2.81511625,"lng":-72.76489511},{"lat":2.81513377,"lng":-72.76498313},{"lat":2.81510338,"lng":-72.76505966},{"lat":2.8151703,"lng":-72.7652068},{"lat":2.81507761,"lng":-72.76537432},{"lat":2.8150951,"lng":-72.76543492},{"lat":2.81509091,"lng":-72.76557925},{"lat":2.81512439,"lng":-72.76567014},{"lat":2.81508532,"lng":-72.7657741},{"lat":2.81508704,"lng":-72.76601513},{"lat":2.81505962,"lng":-72.76614505},{"lat":2.81496527,"lng":-72.76612495},{"lat":2.81488118,"lng":-72.76619865},{"lat":2.81480879,"lng":-72.76635605},{"lat":2.81481764,"lng":-72.76647439},{"lat":2.81479884,"lng":-72.76653214},{"lat":2.81480919,"lng":-72.76670243},{"lat":2.81489927,"lng":-72.76680048},{"lat":2.81486018,"lng":-72.76688423},{"lat":2.81490094,"lng":-72.7669881},{"lat":2.81478949,"lng":-72.76725379},{"lat":2.8147271,"lng":-72.76726252},{"lat":2.81461122,"lng":-72.76745749},{"lat":2.81448357,"lng":-72.76750381},{"lat":2.81450686,"lng":-72.76757306},{"lat":2.81473911,"lng":-72.76761899},{"lat":2.81485086,"lng":-72.76762175},{"lat":2.8148452,"lng":-72.76774732},{"lat":2.81489459,"lng":-72.7677949},{"lat":2.8149817,"lng":-72.76782511},{"lat":2.81501795,"lng":-72.76779764},{"lat":2.81508745,"lng":-72.76765468},{"lat":2.81519029,"lng":-72.76748138},{"lat":2.81532946,"lng":-72.76735421},{"lat":2.81544105,"lng":-72.76722131},{"lat":2.81539744,"lng":-72.76715496},{"lat":2.8154351,"lng":-72.76708853},{"lat":2.81551196,"lng":-72.76704226},{"lat":2.81559608,"lng":-72.76699598},{"lat":2.81572807,"lng":-72.76693233},{"lat":2.81576283,"lng":-72.76686734},{"lat":2.81582518,"lng":-72.76682831},{"lat":2.81591808,"lng":-72.76684408},{"lat":2.81596303,"lng":-72.76681372},{"lat":2.81608041,"lng":-72.76665627},{"lat":2.8160657,"lng":-72.76648742},{"lat":2.81623972,"lng":-72.76637177},{"lat":2.81649228,"lng":-72.76641334},{"lat":2.81674035,"lng":-72.76633657},{"lat":2.8167692,"lng":-72.76618066},{"lat":2.81664143,"lng":-72.76612452},{"lat":2.81658614,"lng":-72.76600335},{"lat":2.81687786,"lng":-72.76602034},{"lat":2.81703299,"lng":-72.76588594},{"lat":2.81706345,"lng":-72.76587869},{"lat":2.81711555,"lng":-72.76574874},{"lat":2.81708645,"lng":-72.76567949},{"lat":2.81707596,"lng":-72.76538508},{"lat":2.81720042,"lng":-72.76508618},{"lat":2.81718291,"lng":-72.76500249},{"lat":2.8173741,"lng":-72.76466743},{"lat":2.81736675,"lng":-72.76458806},{"lat":2.8172345,"lng":-72.76442368},{"lat":2.81720528,"lng":-72.76424474},{"lat":2.81728357,"lng":-72.76418548},{"lat":2.81758386,"lng":-72.76407834},{"lat":2.81770002,"lng":-72.76414027},{"lat":2.81777838,"lng":-72.76412864},{"lat":2.8178336,"lng":-72.76419641},{"lat":2.81789891,"lng":-72.76420356},{"lat":2.81802236,"lng":-72.76428568},{"lat":2.81827199,"lng":-72.76430561},{"lat":2.81854041,"lng":-72.76425191},{"lat":2.81858966,"lng":-72.76417247},{"lat":2.81846027,"lng":-72.76397345},{"lat":2.8185296,"lng":-72.76368038},{"lat":2.81836967,"lng":-72.76341789},{"lat":2.81832326,"lng":-72.76344103},{"lat":2.81824607,"lng":-72.7631972},{"lat":2.81830257,"lng":-72.76311487},{"lat":2.81842442,"lng":-72.76306567},{"lat":2.8184691,"lng":-72.76279428},{"lat":2.81857623,"lng":-72.76256757},{"lat":2.81857324,"lng":-72.76249108},{"lat":2.81841763,"lng":-72.76220548},{"lat":2.81846682,"lng":-72.76206399},{"lat":2.81852627,"lng":-72.76202351},{"lat":2.81860599,"lng":-72.76193682},{"lat":2.81868566,"lng":-72.76181117},{"lat":2.81867982,"lng":-72.76177653},{"lat":2.81857662,"lng":-72.76163088},{"lat":2.81846772,"lng":-72.76158482},{"lat":2.81838786,"lng":-72.76154883},{"lat":2.81829788,"lng":-72.7615446},{"lat":2.81826311,"lng":-72.76159659},{"lat":2.81820512,"lng":-72.76164284},{"lat":2.81805133,"lng":-72.76168198},{"lat":2.81780465,"lng":-72.76169958},{"lat":2.81768987,"lng":-72.76158569},{"lat":2.81749527,"lng":-72.761469},{"lat":2.8148976,"lng":-72.76147481},{"lat":2.81450137,"lng":-72.76143917},{"lat":2.81437376,"lng":-72.76152302}]},{"finca":"FINCA 1","lote":"15","poligono":[{"lat":2.81264951,"lng":-72.75878564},{"lat":2.81174134,"lng":-72.76032373},{"lat":2.81174872,"lng":-72.76043341},{"lat":2.8116588,"lng":-72.76048403},{"lat":2.81130509,"lng":-72.76082359},{"lat":2.81124268,"lng":-72.76082078},{"lat":2.81117743,"lng":-72.76086415},{"lat":2.81113116,"lng":-72.76101863},{"lat":2.81116769,"lng":-72.76123363},{"lat":2.81126206,"lng":-72.76127394},{"lat":2.81125779,"lng":-72.76134466},{"lat":2.81137118,"lng":-72.76151484},{"lat":2.81143797,"lng":-72.76154508},{"lat":2.81156879,"lng":-72.76173544},{"lat":2.81171249,"lng":-72.76175549},{"lat":2.81177642,"lng":-72.76182902},{"lat":2.81194634,"lng":-72.76193996},{"lat":2.81206542,"lng":-72.76200622},{"lat":2.81215546,"lng":-72.76206818},{"lat":2.81227765,"lng":-72.76232061},{"lat":2.81234888,"lng":-72.76242301},{"lat":2.81254491,"lng":-72.7625267},{"lat":2.81269881,"lng":-72.76258426},{"lat":2.81286136,"lng":-72.76259851},{"lat":2.81296454,"lng":-72.76272685},{"lat":2.8131097,"lng":-72.76275699},{"lat":2.8132245,"lng":-72.76289542},{"lat":2.8132565,"lng":-72.76296033},{"lat":2.8131449,"lng":-72.76308746},{"lat":2.81310427,"lng":-72.76309472},{"lat":2.81303344,"lng":-72.7633416},{"lat":2.8129786,"lng":-72.76360867},{"lat":2.8130469,"lng":-72.76369519},{"lat":2.81319801,"lng":-72.76385233},{"lat":2.81311547,"lng":-72.76401551},{"lat":2.81325949,"lng":-72.76432277},{"lat":2.81322625,"lng":-72.76443827},{"lat":2.81342221,"lng":-72.7644799},{"lat":2.81359919,"lng":-72.76442486},{"lat":2.81370374,"lng":-72.7644767},{"lat":2.8137501,"lng":-72.76440593},{"lat":2.81390545,"lng":-72.76446637},{"lat":2.81395186,"lng":-72.76443746},{"lat":2.81422315,"lng":-72.76436499},{"lat":2.81487495,"lng":-72.76326304},{"lat":2.81486619,"lng":-72.76321254},{"lat":2.81458116,"lng":-72.7626904},{"lat":2.81456077,"lng":-72.76262403},{"lat":2.81458679,"lng":-72.7625374},{"lat":2.81470985,"lng":-72.76228181},{"lat":2.81470979,"lng":-72.76222119},{"lat":2.81270322,"lng":-72.75880001},{"lat":2.81264951,"lng":-72.75878564}]},{"finca":"FINCA 1","lote":"14","poligono":[{"lat":2.8126407,"lng":-72.75869328},{"lat":2.81205472,"lng":-72.75769231},{"lat":2.81192837,"lng":-72.75761163},{"lat":2.81144073,"lng":-72.7575862},{"lat":2.81053633,"lng":-72.75605303},{"lat":2.80904014,"lng":-72.75606049},{"lat":2.80804939,"lng":-72.7577199},{"lat":2.80757052,"lng":-72.75775219},{"lat":2.80716924,"lng":-72.75837469},{"lat":2.80718527,"lng":-72.75843096},{"lat":2.80724485,"lng":-72.75850017},{"lat":2.80729417,"lng":-72.75848279},{"lat":2.80731459,"lng":-72.75857369},{"lat":2.80735524,"lng":-72.75858808},{"lat":2.80741187,"lng":-72.758614},{"lat":2.80743224,"lng":-72.75866449},{"lat":2.80745695,"lng":-72.7586991},{"lat":2.80760069,"lng":-72.75875667},{"lat":2.80770521,"lng":-72.75878686},{"lat":2.80800125,"lng":-72.75878364},{"lat":2.80809547,"lng":-72.75868395},{"lat":2.80815497,"lng":-72.75868821},{"lat":2.80823486,"lng":-72.75875018},{"lat":2.80823788,"lng":-72.75885121},{"lat":2.80855862,"lng":-72.7588725},{"lat":2.80866614,"lng":-72.75898206},{"lat":2.80879097,"lng":-72.75901079},{"lat":2.80892027,"lng":-72.75913332},{"lat":2.80901902,"lng":-72.75919238},{"lat":2.80917441,"lng":-72.75928313},{"lat":2.80920065,"lng":-72.75939568},{"lat":2.80922682,"lng":-72.7594375},{"lat":2.8092646,"lng":-72.75947787},{"lat":2.80937637,"lng":-72.75950228},{"lat":2.80948519,"lng":-72.7594834},{"lat":2.80952713,"lng":-72.75935202},{"lat":2.80964468,"lng":-72.75935477},{"lat":2.80980828,"lng":-72.75901253},{"lat":2.80982991,"lng":-72.75888695},{"lat":2.80986018,"lng":-72.75870795},{"lat":2.80987304,"lng":-72.75852897},{"lat":2.80978729,"lng":-72.75842226},{"lat":2.80985103,"lng":-72.75831972},{"lat":2.80990036,"lng":-72.75830812},{"lat":2.81020164,"lng":-72.75780552},{"lat":2.81022611,"lng":-72.75762365},{"lat":2.81014761,"lng":-72.7575126},{"lat":2.81017362,"lng":-72.75741299},{"lat":2.81020117,"lng":-72.75739131},{"lat":2.81024619,"lng":-72.75741579},{"lat":2.81025943,"lng":-72.75758031},{"lat":2.81031341,"lng":-72.75782272},{"lat":2.81028297,"lng":-72.75786172},{"lat":2.810331,"lng":-72.75797713},{"lat":2.81003702,"lng":-72.75852157},{"lat":2.81002299,"lng":-72.75895168},{"lat":2.81004342,"lng":-72.75904546},{"lat":2.80990586,"lng":-72.75932128},{"lat":2.8096784,"lng":-72.75965637},{"lat":2.809722,"lng":-72.75971406},{"lat":2.80969017,"lng":-72.75980069},{"lat":2.80975265,"lng":-72.75986845},{"lat":2.80977593,"lng":-72.75991894},{"lat":2.80974265,"lng":-72.76000701},{"lat":2.80976882,"lng":-72.76004307},{"lat":2.80980221,"lng":-72.76006035},{"lat":2.80988502,"lng":-72.76013386},{"lat":2.80991848,"lng":-72.76020743},{"lat":2.80999841,"lng":-72.76030981},{"lat":2.81007683,"lng":-72.76035302},{"lat":2.81016101,"lng":-72.76036303},{"lat":2.8102235,"lng":-72.76044234},{"lat":2.81033831,"lng":-72.76058798},{"lat":2.81052269,"lng":-72.76064984},{"lat":2.81075497,"lng":-72.7607304},{"lat":2.81095675,"lng":-72.76077924},{"lat":2.81107717,"lng":-72.76075746},{"lat":2.81123231,"lng":-72.76063172},{"lat":2.81138456,"lng":-72.76051898},{"lat":2.81155857,"lng":-72.76039755},{"lat":2.81167606,"lng":-72.7603469},{"lat":2.81193099,"lng":-72.75992085},{"lat":2.8126407,"lng":-72.75869328}]},{"finca":"FINCA 1","lote":"18","poligono":[{"lat":2.80557477,"lng":-72.77550366},{"lat":2.80544524,"lng":-72.77572753},{"lat":2.80592038,"lng":-72.77569595},{"lat":2.80789448,"lng":-72.77737662},{"lat":2.80800769,"lng":-72.77738443},{"lat":2.80808034,"lng":-72.77746806},{"lat":2.80822399,"lng":-72.77744914},{"lat":2.80840209,"lng":-72.77709101},{"lat":2.80851941,"lng":-72.77688305},{"lat":2.80866857,"lng":-72.77660289},{"lat":2.8087511,"lng":-72.77643249},{"lat":2.80882625,"lng":-72.77615241},{"lat":2.80887399,"lng":-72.77601381},{"lat":2.80894652,"lng":-72.77599208},{"lat":2.80919609,"lng":-72.7759485},{"lat":2.80922943,"lng":-72.77591671},{"lat":2.80928889,"lng":-72.77587912},{"lat":2.80941648,"lng":-72.77577362},{"lat":2.8094744,"lng":-72.77566387},{"lat":2.80946567,"lng":-72.77563934},{"lat":2.80951933,"lng":-72.77560753},{"lat":2.80963101,"lng":-72.77555257},{"lat":2.80969905,"lng":-72.7753995},{"lat":2.80970183,"lng":-72.7752927},{"lat":2.8096161,"lng":-72.77519321},{"lat":2.8094448,"lng":-72.77514577},{"lat":2.8091994,"lng":-72.77502336},{"lat":2.8088554,"lng":-72.7749689},{"lat":2.80871452,"lng":-72.7748637},{"lat":2.8085517,"lng":-72.77461852},{"lat":2.80833516,"lng":-72.77434165},{"lat":2.80821749,"lng":-72.77423498},{"lat":2.80809403,"lng":-72.77413842},{"lat":2.8080199,"lng":-72.7740317},{"lat":2.80787898,"lng":-72.77389619},{"lat":2.80774816,"lng":-72.77371737},{"lat":2.80749587,"lng":-72.77391538},{"lat":2.80743934,"lng":-72.77397028},{"lat":2.80724634,"lng":-72.77398637},{"lat":2.80636993,"lng":-72.77409992},{"lat":2.80557477,"lng":-72.77550366}]},{"finca":"FINCA 2","lote":"19","poligono":[{"lat":2.73439828,"lng":-72.72906886},{"lat":2.73434371,"lng":-72.72905243},{"lat":2.73413793,"lng":-72.72899363},{"lat":2.73382404,"lng":-72.72890335},{"lat":2.73353976,"lng":-72.72882248},{"lat":2.73323312,"lng":-72.72873505},{"lat":2.73317021,"lng":-72.72871723},{"lat":2.7329925,"lng":-72.7286935},{"lat":2.73253687,"lng":-72.72863753},{"lat":2.73219266,"lng":-72.72860323},{"lat":2.73179673,"lng":-72.72856116},{"lat":2.73147,"lng":-72.72849396},{"lat":2.7313031,"lng":-72.72845248},{"lat":2.73079846,"lng":-72.72830499},{"lat":2.73035901,"lng":-72.72817141},{"lat":2.72895183,"lng":-72.72774427},{"lat":2.72801304,"lng":-72.72745947},{"lat":2.72697569,"lng":-72.72715517},{"lat":2.72674584,"lng":-72.7270896},{"lat":2.72663323,"lng":-72.72703656},{"lat":2.72647595,"lng":-72.72695586},{"lat":2.7260931,"lng":-72.72675794},{"lat":2.72600611,"lng":-72.7268725},{"lat":2.72569122,"lng":-72.72724825},{"lat":2.72557117,"lng":-72.72735169},{"lat":2.7254605,"lng":-72.72747506},{"lat":2.72513256,"lng":-72.72780562},{"lat":2.72504522,"lng":-72.72792934},{"lat":2.72453315,"lng":-72.72849024},{"lat":2.72454905,"lng":-72.72857841},{"lat":2.72465998,"lng":-72.72876262},{"lat":2.72473995,"lng":-72.72879073},{"lat":2.72494292,"lng":-72.72880969},{"lat":2.72504474,"lng":-72.728894},{"lat":2.72511319,"lng":-72.72885258},{"lat":2.72523971,"lng":-72.72891774},{"lat":2.72528191,"lng":-72.72897312},{"lat":2.72540609,"lng":-72.729064},{"lat":2.7253647,"lng":-72.72923485},{"lat":2.72537743,"lng":-72.72932849},{"lat":2.72540793,"lng":-72.72935531},{"lat":2.72554432,"lng":-72.72939077},{"lat":2.72565944,"lng":-72.72940155},{"lat":2.72586717,"lng":-72.72935717},{"lat":2.72605304,"lng":-72.72935958},{"lat":2.72625686,"lng":-72.729443},{"lat":2.72642358,"lng":-72.72952184},{"lat":2.72673854,"lng":-72.72955967},{"lat":2.72714335,"lng":-72.7295959},{"lat":2.72768147,"lng":-72.72961692},{"lat":2.72819025,"lng":-72.72973558},{"lat":2.7286033,"lng":-72.72979733},{"lat":2.72884237,"lng":-72.72989575},{"lat":2.72896648,"lng":-72.7299741},{"lat":2.72915719,"lng":-72.72997719},{"lat":2.72925937,"lng":-72.73002114},{"lat":2.72938213,"lng":-72.73003318},{"lat":2.72945107,"lng":-72.73013092},{"lat":2.72949574,"lng":-72.73015494},{"lat":2.72954806,"lng":-72.73018022},{"lat":2.72957697,"lng":-72.73019262},{"lat":2.72963923,"lng":-72.73025584},{"lat":2.72974408,"lng":-72.73030964},{"lat":2.72980476,"lng":-72.7303548},{"lat":2.72989471,"lng":-72.73039278},{"lat":2.72996917,"lng":-72.73045207},{"lat":2.73012485,"lng":-72.73050481},{"lat":2.7301941,"lng":-72.73054602},{"lat":2.73030018,"lng":-72.73053446},{"lat":2.73065704,"lng":-72.73055052},{"lat":2.73073887,"lng":-72.7305953},{"lat":2.73083072,"lng":-72.73063541},{"lat":2.73097754,"lng":-72.73064563},{"lat":2.7310668,"lng":-72.73072275},{"lat":2.73112596,"lng":-72.73075247},{"lat":2.73120036,"lng":-72.73073057},{"lat":2.73125752,"lng":-72.7307529},{"lat":2.73134526,"lng":-72.73074593},{"lat":2.73139592,"lng":-72.73076141},{"lat":2.73145135,"lng":-72.73076506},{"lat":2.73157496,"lng":-72.73075574},{"lat":2.73168198,"lng":-72.73076605},{"lat":2.73176995,"lng":-72.73078938},{"lat":2.73183314,"lng":-72.73079227},{"lat":2.73188201,"lng":-72.73083795},{"lat":2.73206829,"lng":-72.73085411},{"lat":2.7321521,"lng":-72.73077622},{"lat":2.73219193,"lng":-72.73073453},{"lat":2.73227477,"lng":-72.73071434},{"lat":2.73234276,"lng":-72.73069086},{"lat":2.73237465,"lng":-72.73067374},{"lat":2.7324566,"lng":-72.73064785},{"lat":2.73251033,"lng":-72.73065261},{"lat":2.73255066,"lng":-72.73066426},{"lat":2.73264637,"lng":-72.73065977},{"lat":2.7327357,"lng":-72.73064642},{"lat":2.73300107,"lng":-72.73038328},{"lat":2.73353767,"lng":-72.7299155},{"lat":2.73385606,"lng":-72.7296177},{"lat":2.73406992,"lng":-72.72942181},{"lat":2.73443804,"lng":-72.72910047},{"lat":2.73439828,"lng":-72.72906886}]},{"finca":"FINCA 2","lote":"20","poligono":[{"lat":2.73444623,"lng":-72.72917123},{"lat":2.73434442,"lng":-72.72928562},{"lat":2.73410394,"lng":-72.72950579},{"lat":2.7339266,"lng":-72.72967474},{"lat":2.73373803,"lng":-72.7298414},{"lat":2.73316111,"lng":-72.7303246},{"lat":2.73294658,"lng":-72.73051802},{"lat":2.7328593,"lng":-72.73059288},{"lat":2.73269376,"lng":-72.73079563},{"lat":2.73255285,"lng":-72.73103536},{"lat":2.7322804,"lng":-72.73139745},{"lat":2.73211383,"lng":-72.73157671},{"lat":2.73195049,"lng":-72.7317287},{"lat":2.73175449,"lng":-72.7318287},{"lat":2.73127613,"lng":-72.731896},{"lat":2.73100623,"lng":-72.73189958},{"lat":2.72986984,"lng":-72.73209151},{"lat":2.72933971,"lng":-72.7321687},{"lat":2.72914462,"lng":-72.73219847},{"lat":2.72915557,"lng":-72.73228796},{"lat":2.7298064,"lng":-72.73350545},{"lat":2.72797728,"lng":-72.73658825},{"lat":2.72797477,"lng":-72.73807039},{"lat":2.72802934,"lng":-72.73809539},{"lat":2.7280742,"lng":-72.7380649},{"lat":2.72810787,"lng":-72.7380176},{"lat":2.72823706,"lng":-72.73792096},{"lat":2.72829935,"lng":-72.73785676},{"lat":2.7283844,"lng":-72.73777854},{"lat":2.72848645,"lng":-72.73766012},{"lat":2.72855908,"lng":-72.73759975},{"lat":2.72861398,"lng":-72.73752299},{"lat":2.72863932,"lng":-72.73747924},{"lat":2.72876023,"lng":-72.73737162},{"lat":2.72886699,"lng":-72.73732456},{"lat":2.72895137,"lng":-72.73724388},{"lat":2.72900348,"lng":-72.73713222},{"lat":2.72911415,"lng":-72.73699169},{"lat":2.72926178,"lng":-72.7368307},{"lat":2.72934741,"lng":-72.7366467},{"lat":2.72950244,"lng":-72.73642233},{"lat":2.72955582,"lng":-72.73636447},{"lat":2.72962175,"lng":-72.73642407},{"lat":2.72978634,"lng":-72.73629881},{"lat":2.7306599,"lng":-72.73548403},{"lat":2.73071732,"lng":-72.73546074},{"lat":2.73078728,"lng":-72.73539052},{"lat":2.73082795,"lng":-72.73533474},{"lat":2.73114476,"lng":-72.73508754},{"lat":2.73136278,"lng":-72.73479416},{"lat":2.73237215,"lng":-72.7331125},{"lat":2.73263869,"lng":-72.73276784},{"lat":2.73321712,"lng":-72.73183399},{"lat":2.73333149,"lng":-72.73179546},{"lat":2.7335207,"lng":-72.73150847},{"lat":2.73446935,"lng":-72.72989191},{"lat":2.73458344,"lng":-72.72980328},{"lat":2.73477017,"lng":-72.72958561},{"lat":2.73496721,"lng":-72.72944044},{"lat":2.73513522,"lng":-72.72930569},{"lat":2.73498385,"lng":-72.72924189},{"lat":2.73483331,"lng":-72.72919834},{"lat":2.7345119,"lng":-72.72910479},{"lat":2.73444623,"lng":-72.72917123}]},{"finca":"FINCA 2","lote":"21","poligono":[{"lat":2.72908463,"lng":-72.73221717},{"lat":2.72893506,"lng":-72.73221891},{"lat":2.72867969,"lng":-72.73225161},{"lat":2.72814099,"lng":-72.73233637},{"lat":2.72790357,"lng":-72.73238144},{"lat":2.7276382,"lng":-72.73244586},{"lat":2.72739168,"lng":-72.73252109},{"lat":2.72719559,"lng":-72.73258149},{"lat":2.72699207,"lng":-72.73264389},{"lat":2.72678126,"lng":-72.73273332},{"lat":2.72664769,"lng":-72.73279416},{"lat":2.72650017,"lng":-72.73285741},{"lat":2.7264145,"lng":-72.7328843},{"lat":2.72625036,"lng":-72.73294011},{"lat":2.72610612,"lng":-72.73299588},{"lat":2.72601213,"lng":-72.73302632},{"lat":2.72594715,"lng":-72.73305362},{"lat":2.72552102,"lng":-72.7331373},{"lat":2.72517584,"lng":-72.7331914},{"lat":2.72501422,"lng":-72.73323202},{"lat":2.72485999,"lng":-72.73328518},{"lat":2.72469452,"lng":-72.73333607},{"lat":2.72456585,"lng":-72.73341012},{"lat":2.72448066,"lng":-72.73346329},{"lat":2.7242608,"lng":-72.73363701},{"lat":2.72396331,"lng":-72.73388696},{"lat":2.72372754,"lng":-72.73410983},{"lat":2.72355987,"lng":-72.73428014},{"lat":2.7234197,"lng":-72.73443187},{"lat":2.72325707,"lng":-72.73460611},{"lat":2.72322578,"lng":-72.7346475},{"lat":2.72334469,"lng":-72.73510157},{"lat":2.72344297,"lng":-72.735136},{"lat":2.72851401,"lng":-72.735179},{"lat":2.72874764,"lng":-72.73519107},{"lat":2.72876036,"lng":-72.73518899},{"lat":2.72878507,"lng":-72.73516257},{"lat":2.72974102,"lng":-72.73355332},{"lat":2.72975617,"lng":-72.73346212},{"lat":2.72970158,"lng":-72.73334139},{"lat":2.72908463,"lng":-72.73221717}]},{"finca":"FINCA 2","lote":"23","poligono":[{"lat":2.72451623,"lng":-72.73959583},{"lat":2.72448595,"lng":-72.73953792},{"lat":2.72313222,"lng":-72.73704294},{"lat":2.72305352,"lng":-72.73686991},{"lat":2.72307811,"lng":-72.73664679},{"lat":2.72302387,"lng":-72.73619125},{"lat":2.72210704,"lng":-72.73622802},{"lat":2.72184582,"lng":-72.73619494},{"lat":2.72179924,"lng":-72.73626815},{"lat":2.72170876,"lng":-72.7364244},{"lat":2.72146969,"lng":-72.7368264},{"lat":2.72142292,"lng":-72.73692343},{"lat":2.72058184,"lng":-72.73831443},{"lat":2.72058654,"lng":-72.73838579},{"lat":2.72302897,"lng":-72.74266633},{"lat":2.72304306,"lng":-72.74275763},{"lat":2.72309182,"lng":-72.74277099},{"lat":2.72318664,"lng":-72.74259641},{"lat":2.72334456,"lng":-72.74231647},{"lat":2.72337457,"lng":-72.74222129},{"lat":2.72339164,"lng":-72.74196057},{"lat":2.72339557,"lng":-72.74172978},{"lat":2.72346397,"lng":-72.74145268},{"lat":2.72354203,"lng":-72.74124561},{"lat":2.72357319,"lng":-72.74107618},{"lat":2.72357554,"lng":-72.74084449},{"lat":2.72359951,"lng":-72.74060437},{"lat":2.72361876,"lng":-72.74049887},{"lat":2.72366763,"lng":-72.74034583},{"lat":2.72366745,"lng":-72.74019799},{"lat":2.72360665,"lng":-72.74008619},{"lat":2.72351134,"lng":-72.73994005},{"lat":2.72338264,"lng":-72.73982265},{"lat":2.72323804,"lng":-72.73961708},{"lat":2.72303753,"lng":-72.7395189},{"lat":2.72278023,"lng":-72.73925503},{"lat":2.72210022,"lng":-72.73862632},{"lat":2.72181473,"lng":-72.73835151},{"lat":2.7216943,"lng":-72.73818371},{"lat":2.72169023,"lng":-72.73812208},{"lat":2.72174683,"lng":-72.73814721},{"lat":2.72185165,"lng":-72.73824261},{"lat":2.72197364,"lng":-72.73828126},{"lat":2.72207649,"lng":-72.73832767},{"lat":2.72219457,"lng":-72.73845979},{"lat":2.72243197,"lng":-72.73862072},{"lat":2.72260881,"lng":-72.73873447},{"lat":2.72273322,"lng":-72.73892432},{"lat":2.72283553,"lng":-72.73906198},{"lat":2.72292614,"lng":-72.73913676},{"lat":2.72325036,"lng":-72.73946392},{"lat":2.72335493,"lng":-72.73953628},{"lat":2.72365772,"lng":-72.73951202},{"lat":2.72373805,"lng":-72.73956842},{"lat":2.72382773,"lng":-72.73968636},{"lat":2.724027,"lng":-72.73968188},{"lat":2.72410119,"lng":-72.73969107},{"lat":2.72426556,"lng":-72.73969989},{"lat":2.72432695,"lng":-72.73963725},{"lat":2.72442349,"lng":-72.73961867},{"lat":2.72445944,"lng":-72.73962886},{"lat":2.72451623,"lng":-72.73959583}]},{"finca":"FINCA 2","lote":"24","poligono":[{"lat":2.7230748,"lng":-72.74283199},{"lat":2.72058547,"lng":-72.73848609},{"lat":2.72054943,"lng":-72.73850498},{"lat":2.72053907,"lng":-72.73854274},{"lat":2.72052908,"lng":-72.73950665},{"lat":2.72052685,"lng":-72.73990072},{"lat":2.72049051,"lng":-72.74000683},{"lat":2.71689268,"lng":-72.74604261},{"lat":2.71687286,"lng":-72.74611657},{"lat":2.71693148,"lng":-72.74614182},{"lat":2.71707448,"lng":-72.74608638},{"lat":2.71732613,"lng":-72.74608901},{"lat":2.71740384,"lng":-72.74612103},{"lat":2.71752902,"lng":-72.7462156},{"lat":2.71766434,"lng":-72.74623484},{"lat":2.71778463,"lng":-72.74617888},{"lat":2.71790768,"lng":-72.7461037},{"lat":2.71803035,"lng":-72.74600749},{"lat":2.71819846,"lng":-72.745775},{"lat":2.71837247,"lng":-72.74566241},{"lat":2.718548,"lng":-72.7454966},{"lat":2.71872286,"lng":-72.74539699},{"lat":2.71894657,"lng":-72.74535032},{"lat":2.71923671,"lng":-72.74527927},{"lat":2.71931571,"lng":-72.74526209},{"lat":2.71950566,"lng":-72.74515447},{"lat":2.71957195,"lng":-72.74510504},{"lat":2.71957801,"lng":-72.74497535},{"lat":2.71956655,"lng":-72.74477111},{"lat":2.71961055,"lng":-72.74472765},{"lat":2.71968165,"lng":-72.7447205},{"lat":2.71992815,"lng":-72.74478261},{"lat":2.72042961,"lng":-72.74480552},{"lat":2.72065255,"lng":-72.74478547},{"lat":2.72073994,"lng":-72.7447502},{"lat":2.7210558,"lng":-72.7445191},{"lat":2.72158976,"lng":-72.74450757},{"lat":2.72183572,"lng":-72.74426349},{"lat":2.72189168,"lng":-72.74414156},{"lat":2.72199688,"lng":-72.74405927},{"lat":2.72209881,"lng":-72.74397719},{"lat":2.72223686,"lng":-72.74385442},{"lat":2.72233237,"lng":-72.74370936},{"lat":2.7225006,"lng":-72.7435092},{"lat":2.72259105,"lng":-72.7434632},{"lat":2.7226126,"lng":-72.74344225},{"lat":2.72263353,"lng":-72.74336997},{"lat":2.72267997,"lng":-72.74327171},{"lat":2.72271199,"lng":-72.74324532},{"lat":2.7228054,"lng":-72.74315628},{"lat":2.72283969,"lng":-72.74312598},{"lat":2.72287364,"lng":-72.74309444},{"lat":2.72297246,"lng":-72.7430033},{"lat":2.72304211,"lng":-72.74292458},{"lat":2.7230748,"lng":-72.74283199}]},{"finca":"FINCA 2","lote":"25","poligono":[{"lat":2.72024236,"lng":-72.74026734},{"lat":2.71913716,"lng":-72.74025161},{"lat":2.71753795,"lng":-72.74024118},{"lat":2.71747794,"lng":-72.74024635},{"lat":2.71746748,"lng":-72.74039537},{"lat":2.71741122,"lng":-72.74047447},{"lat":2.7173531,"lng":-72.74070128},{"lat":2.71734236,"lng":-72.7409854},{"lat":2.71731704,"lng":-72.7411592},{"lat":2.71739236,"lng":-72.74130013},{"lat":2.71746738,"lng":-72.74129523},{"lat":2.71756409,"lng":-72.74122578},{"lat":2.71775104,"lng":-72.74117574},{"lat":2.71791571,"lng":-72.741166},{"lat":2.71812042,"lng":-72.74104915},{"lat":2.71826585,"lng":-72.74104192},{"lat":2.71844448,"lng":-72.7410225},{"lat":2.71851903,"lng":-72.74102566},{"lat":2.71856193,"lng":-72.7410419},{"lat":2.71859418,"lng":-72.74111447},{"lat":2.71856063,"lng":-72.74119409},{"lat":2.71849891,"lng":-72.74122117},{"lat":2.71839856,"lng":-72.74123549},{"lat":2.71813955,"lng":-72.74121304},{"lat":2.71803234,"lng":-72.74122655},{"lat":2.71787662,"lng":-72.74128407},{"lat":2.71784138,"lng":-72.74139914},{"lat":2.71788009,"lng":-72.74145876},{"lat":2.71802584,"lng":-72.74152142},{"lat":2.71806121,"lng":-72.74156872},{"lat":2.71805282,"lng":-72.74165547},{"lat":2.71799315,"lng":-72.74174406},{"lat":2.71792391,"lng":-72.74180221},{"lat":2.71782101,"lng":-72.74183899},{"lat":2.71759761,"lng":-72.74179117},{"lat":2.71752214,"lng":-72.74176251},{"lat":2.71747195,"lng":-72.7417733},{"lat":2.71743724,"lng":-72.74179712},{"lat":2.71738904,"lng":-72.74188396},{"lat":2.71735732,"lng":-72.74195319},{"lat":2.71732044,"lng":-72.74198616},{"lat":2.71726372,"lng":-72.74210037},{"lat":2.71722342,"lng":-72.74224583},{"lat":2.7172676,"lng":-72.7423502},{"lat":2.71731216,"lng":-72.74240694},{"lat":2.7173684,"lng":-72.74240377},{"lat":2.71750658,"lng":-72.74244337},{"lat":2.71762115,"lng":-72.74248401},{"lat":2.71766795,"lng":-72.7425441},{"lat":2.71761389,"lng":-72.74263383},{"lat":2.71755061,"lng":-72.74266001},{"lat":2.71739918,"lng":-72.74267941},{"lat":2.71734042,"lng":-72.74269778},{"lat":2.71730353,"lng":-72.74286808},{"lat":2.71726921,"lng":-72.74293998},{"lat":2.71720997,"lng":-72.74296639},{"lat":2.71717731,"lng":-72.74298306},{"lat":2.71686235,"lng":-72.74349662},{"lat":2.71689834,"lng":-72.74362842},{"lat":2.71688042,"lng":-72.74369994},{"lat":2.71685138,"lng":-72.7437579},{"lat":2.71677434,"lng":-72.74387375},{"lat":2.71673252,"lng":-72.74397562},{"lat":2.71677541,"lng":-72.74413409},{"lat":2.71673361,"lng":-72.74420002},{"lat":2.71667043,"lng":-72.74421237},{"lat":2.71664735,"lng":-72.74425847},{"lat":2.71667288,"lng":-72.74434858},{"lat":2.71657674,"lng":-72.7444553},{"lat":2.71648892,"lng":-72.74451644},{"lat":2.71625208,"lng":-72.74486611},{"lat":2.71624014,"lng":-72.74494915},{"lat":2.71626572,"lng":-72.74502671},{"lat":2.71618044,"lng":-72.74513964},{"lat":2.71621597,"lng":-72.74526244},{"lat":2.71612954,"lng":-72.74537111},{"lat":2.7161445,"lng":-72.74548573},{"lat":2.71606098,"lng":-72.74565179},{"lat":2.71605898,"lng":-72.74578635},{"lat":2.71617413,"lng":-72.74597452},{"lat":2.71626657,"lng":-72.7460724},{"lat":2.71637742,"lng":-72.74615565},{"lat":2.71644319,"lng":-72.74618253},{"lat":2.71666736,"lng":-72.74618868},{"lat":2.71676346,"lng":-72.74615384},{"lat":2.71682154,"lng":-72.74609724},{"lat":2.71927904,"lng":-72.74189572},{"lat":2.72024236,"lng":-72.74026734}]},{"finca":"FINCA 2","lote":"26","poligono":[{"lat":2.72024265,"lng":-72.74026683},{"lat":2.72043297,"lng":-72.73997095},{"lat":2.72046729,"lng":-72.73987737},{"lat":2.72046005,"lng":-72.73937174},{"lat":2.72048366,"lng":-72.73847577},{"lat":2.72048218,"lng":-72.73839404},{"lat":2.72051929,"lng":-72.73827689},{"lat":2.72134874,"lng":-72.73692571},{"lat":2.72130662,"lng":-72.73691417},{"lat":2.71895022,"lng":-72.73679776},{"lat":2.71870816,"lng":-72.73720016},{"lat":2.71864489,"lng":-72.73729694},{"lat":2.71825459,"lng":-72.73752458},{"lat":2.71803997,"lng":-72.73791393},{"lat":2.71812194,"lng":-72.73803457},{"lat":2.71805529,"lng":-72.73815278},{"lat":2.71793246,"lng":-72.73822443},{"lat":2.71781377,"lng":-72.73839193},{"lat":2.7180001,"lng":-72.73850402},{"lat":2.7180474,"lng":-72.7385347},{"lat":2.71820073,"lng":-72.73869441},{"lat":2.71829702,"lng":-72.73877471},{"lat":2.71825637,"lng":-72.7388449},{"lat":2.71811928,"lng":-72.73876639},{"lat":2.71776517,"lng":-72.73869122},{"lat":2.71771663,"lng":-72.73874071},{"lat":2.71780822,"lng":-72.73888843},{"lat":2.71775117,"lng":-72.73909931},{"lat":2.71767425,"lng":-72.73912446},{"lat":2.71734608,"lng":-72.73962404},{"lat":2.71737726,"lng":-72.73968413},{"lat":2.71744412,"lng":-72.73970444},{"lat":2.7175482,"lng":-72.73971822},{"lat":2.71771338,"lng":-72.73970766},{"lat":2.71790569,"lng":-72.73971264},{"lat":2.71799472,"lng":-72.73975554},{"lat":2.71844894,"lng":-72.73975773},{"lat":2.71848063,"lng":-72.73983878},{"lat":2.71861351,"lng":-72.73984029},{"lat":2.71859281,"lng":-72.73989943},{"lat":2.71750878,"lng":-72.73988617},{"lat":2.7174439,"lng":-72.7399982},{"lat":2.71750605,"lng":-72.74012186},{"lat":2.71747543,"lng":-72.74024183},{"lat":2.71913879,"lng":-72.74025973},{"lat":2.72024265,"lng":-72.74026683}]},{"finca":"FINCA 2","lote":"27","poligono":[{"lat":2.72088021,"lng":-72.73418595},{"lat":2.72083361,"lng":-72.73417904},{"lat":2.72030735,"lng":-72.73416705},{"lat":2.72024002,"lng":-72.73414287},{"lat":2.7201905,"lng":-72.73407856},{"lat":2.71994301,"lng":-72.73366633},{"lat":2.71990692,"lng":-72.73362409},{"lat":2.71982589,"lng":-72.73360015},{"lat":2.71830429,"lng":-72.73357626},{"lat":2.71826464,"lng":-72.73358231},{"lat":2.71819829,"lng":-72.73361262},{"lat":2.71766639,"lng":-72.73389128},{"lat":2.71735882,"lng":-72.73407283},{"lat":2.71729362,"lng":-72.73410739},{"lat":2.71723977,"lng":-72.7341161},{"lat":2.71533141,"lng":-72.73410618},{"lat":2.7152292,"lng":-72.73411415},{"lat":2.71517907,"lng":-72.73417262},{"lat":2.71505368,"lng":-72.73437042},{"lat":2.71482231,"lng":-72.73476996},{"lat":2.71497224,"lng":-72.73501668},{"lat":2.71550726,"lng":-72.73597643},{"lat":2.71566879,"lng":-72.73600962},{"lat":2.71582455,"lng":-72.73614016},{"lat":2.71592589,"lng":-72.73633659},{"lat":2.71613324,"lng":-72.73663867},{"lat":2.71638137,"lng":-72.73665495},{"lat":2.71643204,"lng":-72.73672351},{"lat":2.71651396,"lng":-72.73674436},{"lat":2.71664423,"lng":-72.73700319},{"lat":2.7168236,"lng":-72.73704301},{"lat":2.71693155,"lng":-72.73695025},{"lat":2.7170895,"lng":-72.73694903},{"lat":2.71712437,"lng":-72.73703551},{"lat":2.7170655,"lng":-72.73715278},{"lat":2.71698075,"lng":-72.73728039},{"lat":2.71700213,"lng":-72.73739329},{"lat":2.717114,"lng":-72.73757778},{"lat":2.71718762,"lng":-72.73769723},{"lat":2.71728478,"lng":-72.73769176},{"lat":2.71734498,"lng":-72.73767051},{"lat":2.7175491,"lng":-72.73768945},{"lat":2.7176286,"lng":-72.73779249},{"lat":2.7176931,"lng":-72.73779348},{"lat":2.71771122,"lng":-72.7377778},{"lat":2.71776627,"lng":-72.73767182},{"lat":2.71783293,"lng":-72.73757698},{"lat":2.71788793,"lng":-72.73751322},{"lat":2.7179981,"lng":-72.73736511},{"lat":2.71800366,"lng":-72.73733055},{"lat":2.71798918,"lng":-72.73730249},{"lat":2.71799611,"lng":-72.73726242},{"lat":2.71798149,"lng":-72.737219},{"lat":2.71798234,"lng":-72.73719881},{"lat":2.71800604,"lng":-72.73714228},{"lat":2.71803459,"lng":-72.73711639},{"lat":2.71807652,"lng":-72.73709548},{"lat":2.71813164,"lng":-72.73711266},{"lat":2.71818851,"lng":-72.73712995},{"lat":2.71820999,"lng":-72.73714045},{"lat":2.71825278,"lng":-72.73709621},{"lat":2.71829942,"lng":-72.73703439},{"lat":2.71833805,"lng":-72.73698641},{"lat":2.71836314,"lng":-72.73694776},{"lat":2.71856986,"lng":-72.73662982},{"lat":2.71853445,"lng":-72.73654348},{"lat":2.71867907,"lng":-72.73631715},{"lat":2.71867036,"lng":-72.73602008},{"lat":2.71868305,"lng":-72.73600129},{"lat":2.71872717,"lng":-72.73596724},{"lat":2.71875697,"lng":-72.73597352},{"lat":2.71884803,"lng":-72.73604724},{"lat":2.71891625,"lng":-72.73606833},{"lat":2.71899524,"lng":-72.73606144},{"lat":2.71902028,"lng":-72.73601197},{"lat":2.71903661,"lng":-72.73597908},{"lat":2.71907106,"lng":-72.73594534},{"lat":2.71907772,"lng":-72.73593073},{"lat":2.71908841,"lng":-72.73589821},{"lat":2.71909674,"lng":-72.73587916},{"lat":2.71918183,"lng":-72.73579308},{"lat":2.71924119,"lng":-72.73576237},{"lat":2.71932928,"lng":-72.73570856},{"lat":2.71935651,"lng":-72.735699},{"lat":2.7194169,"lng":-72.73562124},{"lat":2.71943652,"lng":-72.73556238},{"lat":2.71947042,"lng":-72.7355054},{"lat":2.71948583,"lng":-72.73545851},{"lat":2.71946848,"lng":-72.73541981},{"lat":2.71946321,"lng":-72.73539613},{"lat":2.71947062,"lng":-72.73535993},{"lat":2.71945065,"lng":-72.73534759},{"lat":2.71944043,"lng":-72.73532466},{"lat":2.7194269,"lng":-72.73530433},{"lat":2.71946463,"lng":-72.73523607},{"lat":2.71944184,"lng":-72.73519426},{"lat":2.71937661,"lng":-72.7350931},{"lat":2.71943613,"lng":-72.73507146},{"lat":2.71948049,"lng":-72.73514},{"lat":2.71953995,"lng":-72.7351372},{"lat":2.71956551,"lng":-72.73516173},{"lat":2.71957962,"lng":-72.73518419},{"lat":2.71954901,"lng":-72.73521519},{"lat":2.71953198,"lng":-72.73525397},{"lat":2.71953963,"lng":-72.7352907},{"lat":2.71956827,"lng":-72.73535204},{"lat":2.71960154,"lng":-72.73539446},{"lat":2.71958363,"lng":-72.73543632},{"lat":2.71959259,"lng":-72.73548639},{"lat":2.71965923,"lng":-72.73548681},{"lat":2.71971482,"lng":-72.73550786},{"lat":2.71979731,"lng":-72.73550118},{"lat":2.71990632,"lng":-72.73543778},{"lat":2.72001144,"lng":-72.73543417},{"lat":2.72005442,"lng":-72.73538959},{"lat":2.72020252,"lng":-72.73540071},{"lat":2.72038409,"lng":-72.73536808},{"lat":2.72099391,"lng":-72.73436026},{"lat":2.72100342,"lng":-72.73424708},{"lat":2.72088021,"lng":-72.73418595}]},{"finca":"FINCA 2","lote":"28","poligono":[{"lat":2.71477907,"lng":-72.7348454},{"lat":2.71423674,"lng":-72.73574448},{"lat":2.71421007,"lng":-72.73581549},{"lat":2.71514098,"lng":-72.73751331},{"lat":2.71509831,"lng":-72.74003401},{"lat":2.71504602,"lng":-72.74015864},{"lat":2.71485585,"lng":-72.74046674},{"lat":2.71478118,"lng":-72.74060192},{"lat":2.7147221,"lng":-72.74072267},{"lat":2.71468932,"lng":-72.74093846},{"lat":2.71467211,"lng":-72.7413474},{"lat":2.71465235,"lng":-72.74288905},{"lat":2.71477761,"lng":-72.74319086},{"lat":2.71476921,"lng":-72.74332085},{"lat":2.71463856,"lng":-72.743406},{"lat":2.7146345,"lng":-72.74547611},{"lat":2.71471479,"lng":-72.74551849},{"lat":2.71482648,"lng":-72.7454099},{"lat":2.71492203,"lng":-72.74536037},{"lat":2.71500242,"lng":-72.74519971},{"lat":2.71507578,"lng":-72.74505119},{"lat":2.71516667,"lng":-72.74477251},{"lat":2.71508304,"lng":-72.74459701},{"lat":2.71510334,"lng":-72.74453853},{"lat":2.71510739,"lng":-72.7444348},{"lat":2.71507981,"lng":-72.74437317},{"lat":2.71504654,"lng":-72.74436041},{"lat":2.71504487,"lng":-72.74433519},{"lat":2.7150742,"lng":-72.74430795},{"lat":2.71506771,"lng":-72.74427547},{"lat":2.71509872,"lng":-72.74423752},{"lat":2.71512503,"lng":-72.74418428},{"lat":2.71513765,"lng":-72.74413129},{"lat":2.71509697,"lng":-72.74409541},{"lat":2.71509537,"lng":-72.74405136},{"lat":2.71513982,"lng":-72.74400582},{"lat":2.71517018,"lng":-72.74393153},{"lat":2.71521791,"lng":-72.74377733},{"lat":2.71529539,"lng":-72.74376059},{"lat":2.71529677,"lng":-72.74372543},{"lat":2.71529743,"lng":-72.74370244},{"lat":2.71526901,"lng":-72.74363134},{"lat":2.71525059,"lng":-72.74359293},{"lat":2.71524273,"lng":-72.74355968},{"lat":2.71527941,"lng":-72.74351507},{"lat":2.71537093,"lng":-72.74348031},{"lat":2.71538231,"lng":-72.74347784},{"lat":2.71539856,"lng":-72.74344041},{"lat":2.71537888,"lng":-72.74336983},{"lat":2.71536106,"lng":-72.74332727},{"lat":2.7154263,"lng":-72.74328015},{"lat":2.71546777,"lng":-72.74322571},{"lat":2.71549393,"lng":-72.74318677},{"lat":2.71555265,"lng":-72.74314311},{"lat":2.71557823,"lng":-72.74304901},{"lat":2.71559841,"lng":-72.7429689},{"lat":2.71557851,"lng":-72.74290808},{"lat":2.715594,"lng":-72.74286572},{"lat":2.7156307,"lng":-72.74275553},{"lat":2.71557277,"lng":-72.74270887},{"lat":2.71556804,"lng":-72.74267021},{"lat":2.7155718,"lng":-72.74264811},{"lat":2.71556801,"lng":-72.74256415},{"lat":2.71556776,"lng":-72.74252087},{"lat":2.71561511,"lng":-72.74247968},{"lat":2.71561674,"lng":-72.74242849},{"lat":2.71556544,"lng":-72.74234699},{"lat":2.7155528,"lng":-72.7422346},{"lat":2.71556202,"lng":-72.74217966},{"lat":2.71554038,"lng":-72.74214211},{"lat":2.7154352,"lng":-72.7419929},{"lat":2.71548609,"lng":-72.74190971},{"lat":2.7154715,"lng":-72.74174138},{"lat":2.71539186,"lng":-72.74156367},{"lat":2.71541174,"lng":-72.74148877},{"lat":2.71541936,"lng":-72.74136013},{"lat":2.71544374,"lng":-72.74127433},{"lat":2.71548882,"lng":-72.74124173},{"lat":2.71566862,"lng":-72.74124494},{"lat":2.71580282,"lng":-72.74123012},{"lat":2.7158521,"lng":-72.74113253},{"lat":2.71583072,"lng":-72.74101963},{"lat":2.71581782,"lng":-72.74092956},{"lat":2.7157938,"lng":-72.7408493},{"lat":2.71578019,"lng":-72.74079477},{"lat":2.71572195,"lng":-72.74072368},{"lat":2.71581796,"lng":-72.74065464},{"lat":2.71582266,"lng":-72.74058723},{"lat":2.71584264,"lng":-72.74045128},{"lat":2.71581793,"lng":-72.74034726},{"lat":2.71596582,"lng":-72.7401902},{"lat":2.71598006,"lng":-72.74008602},{"lat":2.71595938,"lng":-72.74002654},{"lat":2.71602843,"lng":-72.73988545},{"lat":2.71601803,"lng":-72.73983006},{"lat":2.7159392,"lng":-72.73981637},{"lat":2.71585951,"lng":-72.73971052},{"lat":2.71580298,"lng":-72.73965208},{"lat":2.71593494,"lng":-72.73937896},{"lat":2.71626972,"lng":-72.73936577},{"lat":2.71647322,"lng":-72.7392828},{"lat":2.71655163,"lng":-72.73919109},{"lat":2.71675322,"lng":-72.73880865},{"lat":2.71674751,"lng":-72.73871551},{"lat":2.71699817,"lng":-72.73829827},{"lat":2.71713153,"lng":-72.73821467},{"lat":2.71726412,"lng":-72.7380138},{"lat":2.71724348,"lng":-72.73797142},{"lat":2.71713826,"lng":-72.73794711},{"lat":2.71704349,"lng":-72.73793598},{"lat":2.71691285,"lng":-72.73796182},{"lat":2.71684103,"lng":-72.73794226},{"lat":2.7167623,"lng":-72.73789718},{"lat":2.71656664,"lng":-72.73778872},{"lat":2.71652356,"lng":-72.73771642},{"lat":2.71648733,"lng":-72.73765882},{"lat":2.71648127,"lng":-72.73758345},{"lat":2.71651766,"lng":-72.73744882},{"lat":2.7164248,"lng":-72.73724556},{"lat":2.71636726,"lng":-72.73713891},{"lat":2.71634294,"lng":-72.73700456},{"lat":2.71632349,"lng":-72.73695388},{"lat":2.71618459,"lng":-72.73683479},{"lat":2.7159111,"lng":-72.73682017},{"lat":2.71583912,"lng":-72.73679153},{"lat":2.71578018,"lng":-72.73669666},{"lat":2.71579056,"lng":-72.73661633},{"lat":2.71582228,"lng":-72.73654282},{"lat":2.71580825,"lng":-72.73649525},{"lat":2.71577655,"lng":-72.73639082},{"lat":2.71581135,"lng":-72.73632447},{"lat":2.71571914,"lng":-72.7362465},{"lat":2.71559789,"lng":-72.73607821},{"lat":2.7154745,"lng":-72.7359698},{"lat":2.71534555,"lng":-72.73569465},{"lat":2.71496792,"lng":-72.73501556},{"lat":2.71483095,"lng":-72.73478703},{"lat":2.71477907,"lng":-72.7348454}]},{"finca":"FINCA 2","lote":"29","poligono":[{"lat":2.71463322,"lng":-72.74547987},{"lat":2.71463397,"lng":-72.74341236},{"lat":2.71458916,"lng":-72.74342265},{"lat":2.71440762,"lng":-72.74330071},{"lat":2.71437551,"lng":-72.74320324},{"lat":2.71449749,"lng":-72.74298011},{"lat":2.71460921,"lng":-72.74297759},{"lat":2.71465136,"lng":-72.74289388},{"lat":2.71466952,"lng":-72.74133783},{"lat":2.71462915,"lng":-72.74103611},{"lat":2.71465171,"lng":-72.74085671},{"lat":2.71469495,"lng":-72.74070712},{"lat":2.71474215,"lng":-72.74053823},{"lat":2.71505572,"lng":-72.74001861},{"lat":2.71504814,"lng":-72.73987407},{"lat":2.7150197,"lng":-72.7397796},{"lat":2.71502557,"lng":-72.73968051},{"lat":2.71504494,"lng":-72.73958465},{"lat":2.71504939,"lng":-72.7394443},{"lat":2.71505385,"lng":-72.73930396},{"lat":2.71507404,"lng":-72.73751811},{"lat":2.71507124,"lng":-72.73748236},{"lat":2.71414934,"lng":-72.7358517},{"lat":2.71183691,"lng":-72.7358045},{"lat":2.71173679,"lng":-72.73582445},{"lat":2.71162054,"lng":-72.73590347},{"lat":2.71122436,"lng":-72.73655014},{"lat":2.71119923,"lng":-72.73660135},{"lat":2.71122411,"lng":-72.73665514},{"lat":2.71139178,"lng":-72.73696954},{"lat":2.71238156,"lng":-72.73872175},{"lat":2.71241443,"lng":-72.73871182},{"lat":2.71243561,"lng":-72.73867991},{"lat":2.7124501,"lng":-72.73864866},{"lat":2.71244044,"lng":-72.73848586},{"lat":2.71245045,"lng":-72.73839992},{"lat":2.71250368,"lng":-72.73831268},{"lat":2.71260926,"lng":-72.7382599},{"lat":2.71265926,"lng":-72.73817979},{"lat":2.71272517,"lng":-72.73805038},{"lat":2.7127297,"lng":-72.73797389},{"lat":2.71272288,"lng":-72.73792325},{"lat":2.71271521,"lng":-72.73783348},{"lat":2.71271357,"lng":-72.73780198},{"lat":2.7126954,"lng":-72.73771788},{"lat":2.71269499,"lng":-72.73766553},{"lat":2.71270427,"lng":-72.73762141},{"lat":2.71272426,"lng":-72.73759781},{"lat":2.71279217,"lng":-72.73762412},{"lat":2.71279373,"lng":-72.7376659},{"lat":2.71279155,"lng":-72.73769386},{"lat":2.71280705,"lng":-72.73770454},{"lat":2.71282643,"lng":-72.7377062},{"lat":2.71284123,"lng":-72.73769625},{"lat":2.71288139,"lng":-72.73772599},{"lat":2.71288855,"lng":-72.73777682},{"lat":2.71290426,"lng":-72.73779885},{"lat":2.71294765,"lng":-72.73780977},{"lat":2.71302573,"lng":-72.73781539},{"lat":2.71312924,"lng":-72.73779738},{"lat":2.71316223,"lng":-72.73777942},{"lat":2.71323044,"lng":-72.73774748},{"lat":2.71326598,"lng":-72.737722},{"lat":2.71329259,"lng":-72.73769321},{"lat":2.71332452,"lng":-72.73767554},{"lat":2.71334871,"lng":-72.73778826},{"lat":2.71319047,"lng":-72.73804903},{"lat":2.71308609,"lng":-72.7380935},{"lat":2.71299623,"lng":-72.73815348},{"lat":2.71292525,"lng":-72.73823236},{"lat":2.71295613,"lng":-72.73832104},{"lat":2.7129153,"lng":-72.73835877},{"lat":2.71295969,"lng":-72.73847407},{"lat":2.71291631,"lng":-72.73851932},{"lat":2.71293967,"lng":-72.73862257},{"lat":2.7129047,"lng":-72.73867983},{"lat":2.71293659,"lng":-72.73875741},{"lat":2.71286403,"lng":-72.73884527},{"lat":2.71288074,"lng":-72.73893033},{"lat":2.71291564,"lng":-72.73895122},{"lat":2.71300802,"lng":-72.7389493},{"lat":2.71317612,"lng":-72.73890716},{"lat":2.71342208,"lng":-72.73881795},{"lat":2.71342887,"lng":-72.73888115},{"lat":2.71320328,"lng":-72.7390054},{"lat":2.71307121,"lng":-72.73910861},{"lat":2.71299645,"lng":-72.73912691},{"lat":2.71292073,"lng":-72.7392561},{"lat":2.71290412,"lng":-72.73937061},{"lat":2.71292372,"lng":-72.73943665},{"lat":2.71296584,"lng":-72.73947785},{"lat":2.71340464,"lng":-72.73935527},{"lat":2.71337164,"lng":-72.73946219},{"lat":2.71322816,"lng":-72.73949147},{"lat":2.71307173,"lng":-72.73956185},{"lat":2.71297258,"lng":-72.7396956},{"lat":2.71296594,"lng":-72.73993804},{"lat":2.71278591,"lng":-72.74026453},{"lat":2.71274678,"lng":-72.74034457},{"lat":2.71272641,"lng":-72.74051085},{"lat":2.71272952,"lng":-72.74062407},{"lat":2.71280442,"lng":-72.7407101},{"lat":2.71284487,"lng":-72.74069642},{"lat":2.71290603,"lng":-72.74082491},{"lat":2.71284886,"lng":-72.74095484},{"lat":2.71286626,"lng":-72.74101063},{"lat":2.7129267,"lng":-72.74103266},{"lat":2.71299876,"lng":-72.7410955},{"lat":2.71319645,"lng":-72.74106312},{"lat":2.7133556,"lng":-72.74099429},{"lat":2.71349205,"lng":-72.74091786},{"lat":2.71359221,"lng":-72.74088535},{"lat":2.71377973,"lng":-72.74101879},{"lat":2.71393772,"lng":-72.74106433},{"lat":2.71400439,"lng":-72.74105219},{"lat":2.71407362,"lng":-72.74109183},{"lat":2.71406666,"lng":-72.74113818},{"lat":2.71411038,"lng":-72.74119377},{"lat":2.71409059,"lng":-72.74124355},{"lat":2.71403934,"lng":-72.74129149},{"lat":2.71397249,"lng":-72.74129455},{"lat":2.71388274,"lng":-72.74129348},{"lat":2.71379545,"lng":-72.74130999},{"lat":2.71373293,"lng":-72.74135867},{"lat":2.7134229,"lng":-72.74134469},{"lat":2.71325834,"lng":-72.74123247},{"lat":2.71313794,"lng":-72.74121565},{"lat":2.7130619,"lng":-72.74129702},{"lat":2.71301449,"lng":-72.7413867},{"lat":2.71302927,"lng":-72.74146886},{"lat":2.7129974,"lng":-72.741527},{"lat":2.71300907,"lng":-72.7417269},{"lat":2.7130747,"lng":-72.74191008},{"lat":2.71322116,"lng":-72.74209102},{"lat":2.71344056,"lng":-72.74213039},{"lat":2.7135665,"lng":-72.74223127},{"lat":2.7137581,"lng":-72.74221877},{"lat":2.71388509,"lng":-72.74218364},{"lat":2.71391359,"lng":-72.74219997},{"lat":2.71389631,"lng":-72.74225478},{"lat":2.71380976,"lng":-72.7422825},{"lat":2.71370116,"lng":-72.74239825},{"lat":2.71359791,"lng":-72.7424236},{"lat":2.71336092,"lng":-72.74264557},{"lat":2.71315684,"lng":-72.74278573},{"lat":2.71309952,"lng":-72.74301893},{"lat":2.71312892,"lng":-72.74317416},{"lat":2.71320073,"lng":-72.74331234},{"lat":2.71330836,"lng":-72.74342611},{"lat":2.71336095,"lng":-72.7436162},{"lat":2.71357354,"lng":-72.74394824},{"lat":2.71351751,"lng":-72.74402939},{"lat":2.71380849,"lng":-72.74444767},{"lat":2.71380206,"lng":-72.74462732},{"lat":2.71366699,"lng":-72.74486991},{"lat":2.71363793,"lng":-72.74507615},{"lat":2.71368411,"lng":-72.74520865},{"lat":2.71373787,"lng":-72.74528436},{"lat":2.71388606,"lng":-72.74535306},{"lat":2.7140109,"lng":-72.74537782},{"lat":2.71415568,"lng":-72.74553981},{"lat":2.71433325,"lng":-72.74559836},{"lat":2.71448592,"lng":-72.74572175},{"lat":2.71455881,"lng":-72.74574102},{"lat":2.71463588,"lng":-72.74561261},{"lat":2.71463322,"lng":-72.74547987}]},{"finca":"FINCA 2","lote":"30","poligono":[{"lat":2.71119756,"lng":-72.73660578},{"lat":2.71050329,"lng":-72.73776565},{"lat":2.71038349,"lng":-72.73797564},{"lat":2.71036938,"lng":-72.7380125},{"lat":2.710333,"lng":-72.74091246},{"lat":2.71032908,"lng":-72.74103783},{"lat":2.71032032,"lng":-72.74190815},{"lat":2.7103117,"lng":-72.74216024},{"lat":2.7102969,"lng":-72.74291927},{"lat":2.71029576,"lng":-72.74319901},{"lat":2.71028632,"lng":-72.74346501},{"lat":2.71026915,"lng":-72.74360077},{"lat":2.70982768,"lng":-72.74437248},{"lat":2.70980542,"lng":-72.74440467},{"lat":2.7075692,"lng":-72.74436785},{"lat":2.70752309,"lng":-72.74438817},{"lat":2.70648521,"lng":-72.74607113},{"lat":2.70649084,"lng":-72.74613007},{"lat":2.70655665,"lng":-72.74614439},{"lat":2.706678,"lng":-72.74610964},{"lat":2.70676969,"lng":-72.7460543},{"lat":2.70684834,"lng":-72.74600588},{"lat":2.70693131,"lng":-72.74600306},{"lat":2.70703475,"lng":-72.74603355},{"lat":2.70717875,"lng":-72.74613758},{"lat":2.70730479,"lng":-72.74626638},{"lat":2.70734706,"lng":-72.74629328},{"lat":2.70741456,"lng":-72.74629689},{"lat":2.70751848,"lng":-72.74627192},{"lat":2.70763428,"lng":-72.74624207},{"lat":2.70775019,"lng":-72.74620421},{"lat":2.70779164,"lng":-72.74615605},{"lat":2.70781827,"lng":-72.74615063},{"lat":2.7078562,"lng":-72.7461382},{"lat":2.70790809,"lng":-72.74610321},{"lat":2.70793323,"lng":-72.74608166},{"lat":2.70796805,"lng":-72.74603869},{"lat":2.70801248,"lng":-72.74599943},{"lat":2.70806495,"lng":-72.74599622},{"lat":2.70817634,"lng":-72.74597553},{"lat":2.70825655,"lng":-72.74592441},{"lat":2.70837159,"lng":-72.74568832},{"lat":2.70843799,"lng":-72.74558615},{"lat":2.70856493,"lng":-72.74550427},{"lat":2.70865403,"lng":-72.74546902},{"lat":2.70878237,"lng":-72.74543467},{"lat":2.70883897,"lng":-72.74547427},{"lat":2.70892279,"lng":-72.7455043},{"lat":2.70898482,"lng":-72.74554701},{"lat":2.70905252,"lng":-72.74563611},{"lat":2.70912745,"lng":-72.74576889},{"lat":2.70916524,"lng":-72.74591276},{"lat":2.70927072,"lng":-72.74614572},{"lat":2.70933373,"lng":-72.7461836},{"lat":2.70941102,"lng":-72.74625302},{"lat":2.70951804,"lng":-72.74631791},{"lat":2.70956407,"lng":-72.7463227},{"lat":2.70963622,"lng":-72.74630111},{"lat":2.70973716,"lng":-72.74626725},{"lat":2.70980018,"lng":-72.74624582},{"lat":2.70982877,"lng":-72.74623703},{"lat":2.7098822,"lng":-72.74623528},{"lat":2.70991388,"lng":-72.74623364},{"lat":2.70996147,"lng":-72.74623573},{"lat":2.7100198,"lng":-72.7462224},{"lat":2.71006398,"lng":-72.74619918},{"lat":2.71009208,"lng":-72.74616314},{"lat":2.71014712,"lng":-72.74608682},{"lat":2.710221,"lng":-72.7460123},{"lat":2.71028781,"lng":-72.74596248},{"lat":2.71033528,"lng":-72.74594293},{"lat":2.71041957,"lng":-72.74589414},{"lat":2.71048867,"lng":-72.74585284},{"lat":2.71056144,"lng":-72.74582081},{"lat":2.71062573,"lng":-72.74582528},{"lat":2.71068908,"lng":-72.74582201},{"lat":2.7107623,"lng":-72.74582979},{"lat":2.71080434,"lng":-72.74580713},{"lat":2.71085979,"lng":-72.74578317},{"lat":2.71093556,"lng":-72.74578342},{"lat":2.71098882,"lng":-72.74577259},{"lat":2.71105658,"lng":-72.7457305},{"lat":2.71111129,"lng":-72.74569533},{"lat":2.71118603,"lng":-72.74565366},{"lat":2.71124736,"lng":-72.74561329},{"lat":2.71127772,"lng":-72.74559832},{"lat":2.71134675,"lng":-72.74552282},{"lat":2.71140245,"lng":-72.74548282},{"lat":2.71148629,"lng":-72.74539423},{"lat":2.71155363,"lng":-72.7453591},{"lat":2.71162475,"lng":-72.74529558},{"lat":2.71168285,"lng":-72.74517966},{"lat":2.7118082,"lng":-72.7449351},{"lat":2.71191647,"lng":-72.7448605},{"lat":2.71199953,"lng":-72.74477326},{"lat":2.71219007,"lng":-72.74467208},{"lat":2.71236366,"lng":-72.74464387},{"lat":2.71250561,"lng":-72.74460474},{"lat":2.71253864,"lng":-72.74460389},{"lat":2.71257756,"lng":-72.74458663},{"lat":2.71262412,"lng":-72.74454679},{"lat":2.71266181,"lng":-72.74449108},{"lat":2.71266366,"lng":-72.74445979},{"lat":2.71261032,"lng":-72.74437712},{"lat":2.71256125,"lng":-72.7442933},{"lat":2.71252033,"lng":-72.74427346},{"lat":2.71248759,"lng":-72.74418641},{"lat":2.71244087,"lng":-72.74409854},{"lat":2.71239313,"lng":-72.74402806},{"lat":2.71232308,"lng":-72.74400232},{"lat":2.71222318,"lng":-72.74384086},{"lat":2.7120979,"lng":-72.74365768},{"lat":2.71206682,"lng":-72.74354282},{"lat":2.71207439,"lng":-72.74348604},{"lat":2.71203693,"lng":-72.74336034},{"lat":2.71203546,"lng":-72.74327861},{"lat":2.71198895,"lng":-72.74312796},{"lat":2.71200109,"lng":-72.74304144},{"lat":2.7119005,"lng":-72.74285622},{"lat":2.7118474,"lng":-72.74275751},{"lat":2.71176514,"lng":-72.74266547},{"lat":2.71171003,"lng":-72.74264828},{"lat":2.71156826,"lng":-72.74245925},{"lat":2.711435,"lng":-72.7423398},{"lat":2.71132676,"lng":-72.74205853},{"lat":2.71145627,"lng":-72.74179119},{"lat":2.71152713,"lng":-72.74151901},{"lat":2.7115387,"lng":-72.74137106},{"lat":2.71153061,"lng":-72.74123522},{"lat":2.71148966,"lng":-72.74105},{"lat":2.71153146,"lng":-72.74098407},{"lat":2.71155737,"lng":-72.74096116},{"lat":2.71159649,"lng":-72.74094043},{"lat":2.71163939,"lng":-72.74095062},{"lat":2.71175111,"lng":-72.74094809},{"lat":2.71183934,"lng":-72.7409393},{"lat":2.71191828,"lng":-72.7409216},{"lat":2.71196715,"lng":-72.74089027},{"lat":2.71198887,"lng":-72.74087305},{"lat":2.71202156,"lng":-72.740801},{"lat":2.7120568,"lng":-72.74069177},{"lat":2.71204383,"lng":-72.74062053},{"lat":2.71202773,"lng":-72.74052504},{"lat":2.71198608,"lng":-72.74040502},{"lat":2.71193481,"lng":-72.7402813},{"lat":2.71183318,"lng":-72.74017277},{"lat":2.71174948,"lng":-72.74010507},{"lat":2.71169729,"lng":-72.74008596},{"lat":2.71160605,"lng":-72.74006247},{"lat":2.71158348,"lng":-72.74001719},{"lat":2.71160422,"lng":-72.73991583},{"lat":2.71164675,"lng":-72.7398611},{"lat":2.7118094,"lng":-72.73979248},{"lat":2.71196653,"lng":-72.73977552},{"lat":2.71203344,"lng":-72.73975362},{"lat":2.71207476,"lng":-72.73971348},{"lat":2.7120964,"lng":-72.73966206},{"lat":2.71210238,"lng":-72.73950192},{"lat":2.71213579,"lng":-72.73935839},{"lat":2.71217805,"lng":-72.73927295},{"lat":2.71220156,"lng":-72.73918396},{"lat":2.71221409,"lng":-72.73909677},{"lat":2.71224472,"lng":-72.73905949},{"lat":2.71230382,"lng":-72.73893247},{"lat":2.71234206,"lng":-72.73888516},{"lat":2.71235934,"lng":-72.73883035},{"lat":2.71239534,"lng":-72.73875571},{"lat":2.71238068,"lng":-72.73872484},{"lat":2.71119756,"lng":-72.73660578}]},{"finca":"FINCA 2","lote":"38","poligono":[{"lat":2.71527961,"lng":-72.73401226},{"lat":2.71609937,"lng":-72.7326825},{"lat":2.71611708,"lng":-72.73261446},{"lat":2.71609444,"lng":-72.73241635},{"lat":2.71604788,"lng":-72.73233757},{"lat":2.71608183,"lng":-72.73223524},{"lat":2.71604177,"lng":-72.731727},{"lat":2.71603466,"lng":-72.73167529},{"lat":2.71609332,"lng":-72.7315615},{"lat":2.71613944,"lng":-72.73101993},{"lat":2.71624104,"lng":-72.7299799},{"lat":2.7162065,"lng":-72.72985227},{"lat":2.71607775,"lng":-72.72983427},{"lat":2.71599598,"lng":-72.72976947},{"lat":2.7158426,"lng":-72.72971129},{"lat":2.71566559,"lng":-72.7296908},{"lat":2.71557579,"lng":-72.72973194},{"lat":2.71552158,"lng":-72.72970539},{"lat":2.71537068,"lng":-72.72968818},{"lat":2.71508255,"lng":-72.72967613},{"lat":2.71493018,"lng":-72.72962952},{"lat":2.71448877,"lng":-72.72959745},{"lat":2.71440774,"lng":-72.72954385},{"lat":2.71392208,"lng":-72.72953355},{"lat":2.71389066,"lng":-72.72945984},{"lat":2.71376225,"lng":-72.72940068},{"lat":2.71352952,"lng":-72.72939681},{"lat":2.71347579,"lng":-72.72948647},{"lat":2.71339394,"lng":-72.72944679},{"lat":2.71331468,"lng":-72.72944633},{"lat":2.71326762,"lng":-72.72939961},{"lat":2.71320296,"lng":-72.72944886},{"lat":2.71297586,"lng":-72.72944463},{"lat":2.71242384,"lng":-72.72945294},{"lat":2.71316685,"lng":-72.73074253},{"lat":2.71378289,"lng":-72.73184483},{"lat":2.71484495,"lng":-72.73186169},{"lat":2.71487062,"lng":-72.73191413},{"lat":2.71494062,"lng":-72.73195242},{"lat":2.71529477,"lng":-72.73254959},{"lat":2.71529528,"lng":-72.73267769},{"lat":2.71525607,"lng":-72.73398029},{"lat":2.71527961,"lng":-72.73401226}]},{"finca":"FINCA 2","lote":"37","poligono":[{"lat":2.71368467,"lng":-72.73182635},{"lat":2.7136855,"lng":-72.7318088},{"lat":2.71359507,"lng":-72.73162921},{"lat":2.71312086,"lng":-72.73079398},{"lat":2.71315093,"lng":-72.7307686},{"lat":2.71242254,"lng":-72.72945136},{"lat":2.7116122,"lng":-72.72945266},{"lat":2.71152857,"lng":-72.72928788},{"lat":2.71133558,"lng":-72.72916208},{"lat":2.71125759,"lng":-72.72914691},{"lat":2.71113098,"lng":-72.72929725},{"lat":2.71111076,"lng":-72.72934356},{"lat":2.71114344,"lng":-72.72945404},{"lat":2.71125807,"lng":-72.72974361},{"lat":2.71135967,"lng":-72.72990012},{"lat":2.71146553,"lng":-72.73009291},{"lat":2.71153309,"lng":-72.73015454},{"lat":2.71159096,"lng":-72.7301855},{"lat":2.71162651,"lng":-72.73025501},{"lat":2.71165502,"lng":-72.73034234},{"lat":2.71164222,"lng":-72.73039291},{"lat":2.71156769,"lng":-72.73050644},{"lat":2.71156106,"lng":-72.73054634},{"lat":2.71157266,"lng":-72.73057373},{"lat":2.71167454,"lng":-72.73075442},{"lat":2.7117071,"lng":-72.73083097},{"lat":2.71168658,"lng":-72.73089677},{"lat":2.71179341,"lng":-72.73104425},{"lat":2.7118343,"lng":-72.73106657},{"lat":2.71190499,"lng":-72.73114747},{"lat":2.71191987,"lng":-72.73118439},{"lat":2.71191339,"lng":-72.73125059},{"lat":2.71188781,"lng":-72.73127199},{"lat":2.71183581,"lng":-72.73128591},{"lat":2.71182758,"lng":-72.73134565},{"lat":2.71169185,"lng":-72.73150606},{"lat":2.7116572,"lng":-72.73152226},{"lat":2.7116343,"lng":-72.73152007},{"lat":2.71162885,"lng":-72.73148964},{"lat":2.71132838,"lng":-72.73137875},{"lat":2.71115219,"lng":-72.73103425},{"lat":2.71116617,"lng":-72.73091336},{"lat":2.71100575,"lng":-72.7306194},{"lat":2.71097811,"lng":-72.73055332},{"lat":2.71099791,"lng":-72.73049257},{"lat":2.71090881,"lng":-72.73034104},{"lat":2.71084465,"lng":-72.73025596},{"lat":2.71063074,"lng":-72.72996524},{"lat":2.7105122,"lng":-72.72989299},{"lat":2.71026594,"lng":-72.72988195},{"lat":2.7100462,"lng":-72.72988392},{"lat":2.70996792,"lng":-72.72991666},{"lat":2.70972379,"lng":-72.73062562},{"lat":2.70959026,"lng":-72.73100795},{"lat":2.70947857,"lng":-72.73133834},{"lat":2.70937288,"lng":-72.73164321},{"lat":2.7093055,"lng":-72.73184113},{"lat":2.70924475,"lng":-72.73201717},{"lat":2.70920606,"lng":-72.73213046},{"lat":2.70918896,"lng":-72.7321742},{"lat":2.70916718,"lng":-72.73224311},{"lat":2.710836,"lng":-72.73225224},{"lat":2.71106888,"lng":-72.73230914},{"lat":2.71122648,"lng":-72.73228359},{"lat":2.7115618,"lng":-72.73186389},{"lat":2.7116821,"lng":-72.73183447},{"lat":2.71345502,"lng":-72.73185351},{"lat":2.71367733,"lng":-72.73185847},{"lat":2.71368467,"lng":-72.73182635}]},{"finca":"FINCA 2","lote":"35A","poligono":[{"lat":2.71014762,"lng":-72.73471568},{"lat":2.71012797,"lng":-72.73465855},{"lat":2.71005872,"lng":-72.73474779},{"lat":2.70999982,"lng":-72.73477742},{"lat":2.70991592,"lng":-72.7347971},{"lat":2.7098195,"lng":-72.73481944},{"lat":2.70977022,"lng":-72.7348666},{"lat":2.70960907,"lng":-72.73493052},{"lat":2.70946175,"lng":-72.73495539},{"lat":2.7093821,"lng":-72.73497532},{"lat":2.70927435,"lng":-72.7350305},{"lat":2.70915315,"lng":-72.73508235},{"lat":2.70904211,"lng":-72.73514985},{"lat":2.70894037,"lng":-72.73524397},{"lat":2.70882457,"lng":-72.73534151},{"lat":2.70868842,"lng":-72.73534329},{"lat":2.70835881,"lng":-72.73554068},{"lat":2.70831297,"lng":-72.7356701},{"lat":2.70821726,"lng":-72.73579553},{"lat":2.70806343,"lng":-72.73593028},{"lat":2.70774022,"lng":-72.73598005},{"lat":2.70763252,"lng":-72.73601996},{"lat":2.70753995,"lng":-72.73598443},{"lat":2.70715115,"lng":-72.73594639},{"lat":2.70703605,"lng":-72.73601046},{"lat":2.706894,"lng":-72.73604709},{"lat":2.70653895,"lng":-72.73618787},{"lat":2.706446,"lng":-72.73623077},{"lat":2.7063183,"lng":-72.7363204},{"lat":2.70621856,"lng":-72.73644899},{"lat":2.70611669,"lng":-72.73651299},{"lat":2.70594311,"lng":-72.73665719},{"lat":2.70579032,"lng":-72.73683187},{"lat":2.70561213,"lng":-72.73711871},{"lat":2.70558187,"lng":-72.73723355},{"lat":2.70549437,"lng":-72.73727084},{"lat":2.70536578,"lng":-72.73744735},{"lat":2.70529451,"lng":-72.73746989},{"lat":2.70523456,"lng":-72.73753169},{"lat":2.70513838,"lng":-72.7375498},{"lat":2.70504081,"lng":-72.73759879},{"lat":2.70485914,"lng":-72.73762038},{"lat":2.70479271,"lng":-72.73767628},{"lat":2.70478445,"lng":-72.73781575},{"lat":2.70485091,"lng":-72.73796086},{"lat":2.70493502,"lng":-72.73805272},{"lat":2.70499389,"lng":-72.73806677},{"lat":2.70519192,"lng":-72.73823698},{"lat":2.70534042,"lng":-72.73842252},{"lat":2.70552221,"lng":-72.73867956},{"lat":2.70552836,"lng":-72.73874862},{"lat":2.70612629,"lng":-72.73976286},{"lat":2.70619297,"lng":-72.73966668},{"lat":2.70624978,"lng":-72.7395572},{"lat":2.70630321,"lng":-72.73946873},{"lat":2.70644775,"lng":-72.73928933},{"lat":2.70649672,"lng":-72.73926167},{"lat":2.70664269,"lng":-72.73925241},{"lat":2.70676336,"lng":-72.73925269},{"lat":2.70678606,"lng":-72.73924385},{"lat":2.70696936,"lng":-72.73891405},{"lat":2.70675117,"lng":-72.73859466},{"lat":2.70645626,"lng":-72.73833947},{"lat":2.70635899,"lng":-72.73833292},{"lat":2.70622444,"lng":-72.73807017},{"lat":2.70644009,"lng":-72.73795006},{"lat":2.70650129,"lng":-72.73801132},{"lat":2.70655643,"lng":-72.73800904},{"lat":2.70662848,"lng":-72.73796619},{"lat":2.70671447,"lng":-72.7381345},{"lat":2.70682327,"lng":-72.73829185},{"lat":2.70712722,"lng":-72.73821466},{"lat":2.707323,"lng":-72.73807007},{"lat":2.70793343,"lng":-72.73877248},{"lat":2.70821136,"lng":-72.73835705},{"lat":2.70828681,"lng":-72.73832161},{"lat":2.70840361,"lng":-72.73827926},{"lat":2.71011594,"lng":-72.73827017},{"lat":2.71022544,"lng":-72.73814936},{"lat":2.71028455,"lng":-72.73805867},{"lat":2.71002048,"lng":-72.73790198},{"lat":2.70996344,"lng":-72.73779941},{"lat":2.70998119,"lng":-72.73775168},{"lat":2.71094945,"lng":-72.73612141},{"lat":2.71014762,"lng":-72.73471568}]},{"finca":"FINCA 2","lote":"34A","poligono":[{"lat":2.70608809,"lng":-72.73981744},{"lat":2.70579997,"lng":-72.73929633},{"lat":2.7057375,"lng":-72.73926384},{"lat":2.70546488,"lng":-72.73884117},{"lat":2.70543478,"lng":-72.73880209},{"lat":2.70530187,"lng":-72.73875656},{"lat":2.70522695,"lng":-72.73873987},{"lat":2.70509589,"lng":-72.73856214},{"lat":2.70505673,"lng":-72.73853207},{"lat":2.70491081,"lng":-72.73831741},{"lat":2.70477096,"lng":-72.73815867},{"lat":2.70470073,"lng":-72.73814904},{"lat":2.70457713,"lng":-72.73821262},{"lat":2.70440717,"lng":-72.73819503},{"lat":2.70408359,"lng":-72.73835164},{"lat":2.70395719,"lng":-72.73844093},{"lat":2.70388996,"lng":-72.73852477},{"lat":2.70380115,"lng":-72.73870659},{"lat":2.70388871,"lng":-72.7387906},{"lat":2.70396762,"lng":-72.73888385},{"lat":2.70403286,"lng":-72.73893432},{"lat":2.70405646,"lng":-72.73897515},{"lat":2.70402726,"lng":-72.73902178},{"lat":2.7039945,"lng":-72.73914284},{"lat":2.70382372,"lng":-72.73922529},{"lat":2.70369219,"lng":-72.73929307},{"lat":2.70362486,"lng":-72.73940744},{"lat":2.70361822,"lng":-72.73955548},{"lat":2.7034419,"lng":-72.73956593},{"lat":2.70340975,"lng":-72.73961197},{"lat":2.70308014,"lng":-72.73963294},{"lat":2.70300124,"lng":-72.73964019},{"lat":2.70294816,"lng":-72.73969391},{"lat":2.70275629,"lng":-72.73972932},{"lat":2.70268968,"lng":-72.73987469},{"lat":2.70284275,"lng":-72.7401415},{"lat":2.70293199,"lng":-72.74014673},{"lat":2.70293651,"lng":-72.74024326},{"lat":2.70261821,"lng":-72.74041163},{"lat":2.70239526,"lng":-72.74052536},{"lat":2.70197459,"lng":-72.74058596},{"lat":2.70191031,"lng":-72.74063435},{"lat":2.70179932,"lng":-72.74067238},{"lat":2.70173945,"lng":-72.74084783},{"lat":2.70171837,"lng":-72.74093735},{"lat":2.70164641,"lng":-72.74102177},{"lat":2.70156689,"lng":-72.74103958},{"lat":2.70144372,"lng":-72.74104551},{"lat":2.70129607,"lng":-72.7410975},{"lat":2.70129151,"lng":-72.74115279},{"lat":2.70134965,"lng":-72.74124398},{"lat":2.70146507,"lng":-72.74126092},{"lat":2.70158187,"lng":-72.74125462},{"lat":2.70165867,"lng":-72.74123961},{"lat":2.70187243,"lng":-72.74125935},{"lat":2.70213082,"lng":-72.74131774},{"lat":2.70230055,"lng":-72.74140402},{"lat":2.70240186,"lng":-72.74147187},{"lat":2.7025414,"lng":-72.74151355},{"lat":2.70274524,"lng":-72.74160734},{"lat":2.70283137,"lng":-72.74172986},{"lat":2.70291431,"lng":-72.741856},{"lat":2.7029525,"lng":-72.74190955},{"lat":2.70299992,"lng":-72.74192251},{"lat":2.7047824,"lng":-72.7419099},{"lat":2.70608809,"lng":-72.73981744}]},{"finca":"FINCA 2","lote":"33A","poligono":[{"lat":2.7047566,"lng":-72.74198777},{"lat":2.70471114,"lng":-72.74194535},{"lat":2.70300191,"lng":-72.74194659},{"lat":2.70298079,"lng":-72.74197238},{"lat":2.70288217,"lng":-72.74197018},{"lat":2.70283509,"lng":-72.74194834},{"lat":2.70278008,"lng":-72.74194552},{"lat":2.70268163,"lng":-72.74189323},{"lat":2.7026348,"lng":-72.74192786},{"lat":2.70253487,"lng":-72.74188702},{"lat":2.70235739,"lng":-72.74186628},{"lat":2.70232786,"lng":-72.7418248},{"lat":2.7019896,"lng":-72.74181849},{"lat":2.70108558,"lng":-72.74181284},{"lat":2.70096796,"lng":-72.74176698},{"lat":2.70076266,"lng":-72.74172315},{"lat":2.70069286,"lng":-72.74174053},{"lat":2.7006404,"lng":-72.74183645},{"lat":2.70070951,"lng":-72.74212079},{"lat":2.70065546,"lng":-72.74223014},{"lat":2.70061225,"lng":-72.74233853},{"lat":2.70047283,"lng":-72.7425526},{"lat":2.700474,"lng":-72.74260038},{"lat":2.70041327,"lng":-72.74265367},{"lat":2.70041129,"lng":-72.74274778},{"lat":2.70057605,"lng":-72.74303057},{"lat":2.70059385,"lng":-72.74310119},{"lat":2.70055522,"lng":-72.74326392},{"lat":2.70050072,"lng":-72.74340783},{"lat":2.70046129,"lng":-72.74351326},{"lat":2.70041593,"lng":-72.74363782},{"lat":2.70037282,"lng":-72.7437176},{"lat":2.70034128,"lng":-72.74384496},{"lat":2.70035278,"lng":-72.74394781},{"lat":2.70034056,"lng":-72.74402581},{"lat":2.70027198,"lng":-72.74411045},{"lat":2.70018232,"lng":-72.74420658},{"lat":2.70011859,"lng":-72.74426328},{"lat":2.70003535,"lng":-72.74426476},{"lat":2.69972004,"lng":-72.74441088},{"lat":2.69962472,"lng":-72.74448123},{"lat":2.69949732,"lng":-72.74447894},{"lat":2.69944952,"lng":-72.74453657},{"lat":2.69930813,"lng":-72.74454776},{"lat":2.69924529,"lng":-72.74463672},{"lat":2.69925531,"lng":-72.74475101},{"lat":2.69919759,"lng":-72.74486133},{"lat":2.69922037,"lng":-72.74493582},{"lat":2.69921989,"lng":-72.74501133},{"lat":2.69924004,"lng":-72.74507613},{"lat":2.69924236,"lng":-72.74511125},{"lat":2.69926637,"lng":-72.74514446},{"lat":2.69924473,"lng":-72.74522629},{"lat":2.69922743,"lng":-72.7453024},{"lat":2.69926541,"lng":-72.74539686},{"lat":2.69924464,"lng":-72.74545051},{"lat":2.69919936,"lng":-72.74551982},{"lat":2.69919789,"lng":-72.7455917},{"lat":2.69921087,"lng":-72.74564931},{"lat":2.69912028,"lng":-72.74579508},{"lat":2.69895457,"lng":-72.74612211},{"lat":2.69893558,"lng":-72.74617269},{"lat":2.6988948,"lng":-72.74644939},{"lat":2.69887848,"lng":-72.74652914},{"lat":2.69884374,"lng":-72.74658913},{"lat":2.69871745,"lng":-72.74671651},{"lat":2.69869274,"lng":-72.74678941},{"lat":2.69867871,"lng":-72.74691143},{"lat":2.69865226,"lng":-72.74700689},{"lat":2.6986498,"lng":-72.74704849},{"lat":2.69855247,"lng":-72.7472539},{"lat":2.69850779,"lng":-72.74733994},{"lat":2.69850691,"lng":-72.74743571},{"lat":2.69841214,"lng":-72.74760469},{"lat":2.69841345,"lng":-72.74767712},{"lat":2.69839066,"lng":-72.74773781},{"lat":2.69833007,"lng":-72.74781576},{"lat":2.69827932,"lng":-72.74786248},{"lat":2.69823186,"lng":-72.74788753},{"lat":2.69815627,"lng":-72.74791491},{"lat":2.69805626,"lng":-72.74803071},{"lat":2.69798325,"lng":-72.7480483},{"lat":2.69793719,"lng":-72.74811716},{"lat":2.69786619,"lng":-72.7481953},{"lat":2.6977648,"lng":-72.74826012},{"lat":2.69767731,"lng":-72.74830628},{"lat":2.69759808,"lng":-72.74839507},{"lat":2.69752486,"lng":-72.74840947},{"lat":2.69747571,"lng":-72.74844277},{"lat":2.69730305,"lng":-72.74850262},{"lat":2.69727485,"lng":-72.74852641},{"lat":2.69719423,"lng":-72.74853759},{"lat":2.69716521,"lng":-72.74857525},{"lat":2.69706085,"lng":-72.74856874},{"lat":2.69700547,"lng":-72.74857901},{"lat":2.69697922,"lng":-72.74858344},{"lat":2.69693604,"lng":-72.74865088},{"lat":2.69694787,"lng":-72.74868735},{"lat":2.69698134,"lng":-72.74870959},{"lat":2.69706266,"lng":-72.74875411},{"lat":2.69716404,"lng":-72.74875687},{"lat":2.69724476,"lng":-72.74875087},{"lat":2.69728777,"lng":-72.74873351},{"lat":2.69750892,"lng":-72.74873931},{"lat":2.69756268,"lng":-72.74874962},{"lat":2.6978374,"lng":-72.74875538},{"lat":2.69803024,"lng":-72.74875316},{"lat":2.69843701,"lng":-72.74873009},{"lat":2.69846861,"lng":-72.74868264},{"lat":2.69860932,"lng":-72.74864238},{"lat":2.69877916,"lng":-72.74850205},{"lat":2.69898287,"lng":-72.74849172},{"lat":2.69914356,"lng":-72.74843832},{"lat":2.69930607,"lng":-72.74843512},{"lat":2.69944458,"lng":-72.74839156},{"lat":2.69949395,"lng":-72.74832766},{"lat":2.69947975,"lng":-72.74827037},{"lat":2.6994424,"lng":-72.74825307},{"lat":2.69936773,"lng":-72.74823796},{"lat":2.6993046,"lng":-72.74814958},{"lat":2.6993047,"lng":-72.74808717},{"lat":2.69933747,"lng":-72.74801991},{"lat":2.69941866,"lng":-72.74797219},{"lat":2.69945663,"lng":-72.74790483},{"lat":2.69947616,"lng":-72.74785867},{"lat":2.69951611,"lng":-72.747731},{"lat":2.69954651,"lng":-72.74767673},{"lat":2.69960305,"lng":-72.74762},{"lat":2.69971531,"lng":-72.74758086},{"lat":2.69988415,"lng":-72.74757207},{"lat":2.69997084,"lng":-72.74756641},{"lat":2.70005618,"lng":-72.74753643},{"lat":2.70017437,"lng":-72.74746483},{"lat":2.70059524,"lng":-72.74739606},{"lat":2.70082146,"lng":-72.74727574},{"lat":2.70093457,"lng":-72.74721557},{"lat":2.7010985,"lng":-72.74705342},{"lat":2.70115799,"lng":-72.74697382},{"lat":2.70066107,"lng":-72.74606248},{"lat":2.70072037,"lng":-72.74593873},{"lat":2.70138618,"lng":-72.74479615},{"lat":2.70148495,"lng":-72.74472163},{"lat":2.70162449,"lng":-72.74470118},{"lat":2.70308996,"lng":-72.74472165},{"lat":2.70315395,"lng":-72.74470095},{"lat":2.70317688,"lng":-72.74466492},{"lat":2.70453052,"lng":-72.74237906},{"lat":2.7047566,"lng":-72.74198777}]},{"finca":"FINCA 2","lote":"32A","poligono":[{"lat":2.70615175,"lng":-72.73987162},{"lat":2.70409799,"lng":-72.74335734},{"lat":2.70328673,"lng":-72.74470619},{"lat":2.70324401,"lng":-72.74474394},{"lat":2.70317324,"lng":-72.74475411},{"lat":2.70155758,"lng":-72.74475516},{"lat":2.70147837,"lng":-72.74475589},{"lat":2.70138814,"lng":-72.74485168},{"lat":2.70075155,"lng":-72.74595492},{"lat":2.70074134,"lng":-72.74599055},{"lat":2.70075248,"lng":-72.74615938},{"lat":2.70079827,"lng":-72.74624436},{"lat":2.70121238,"lng":-72.74692969},{"lat":2.70124579,"lng":-72.74696803},{"lat":2.70132739,"lng":-72.74694717},{"lat":2.70147968,"lng":-72.7469376},{"lat":2.70152849,"lng":-72.74693867},{"lat":2.7015538,"lng":-72.74696699},{"lat":2.7016164,"lng":-72.74706429},{"lat":2.70176444,"lng":-72.74708608},{"lat":2.70194035,"lng":-72.74716378},{"lat":2.70201448,"lng":-72.74728919},{"lat":2.70208661,"lng":-72.74731667},{"lat":2.70238279,"lng":-72.74732806},{"lat":2.70248516,"lng":-72.74735136},{"lat":2.70269053,"lng":-72.74740752},{"lat":2.70279691,"lng":-72.74742389},{"lat":2.70302316,"lng":-72.74744132},{"lat":2.70307263,"lng":-72.74734523},{"lat":2.7030138,"lng":-72.74721475},{"lat":2.70301701,"lng":-72.74709984},{"lat":2.70306012,"lng":-72.74696938},{"lat":2.70309625,"lng":-72.74674428},{"lat":2.70318178,"lng":-72.74673796},{"lat":2.70334722,"lng":-72.74671903},{"lat":2.70342334,"lng":-72.74664895},{"lat":2.70348793,"lng":-72.74655075},{"lat":2.70346358,"lng":-72.74643542},{"lat":2.70337587,"lng":-72.74639748},{"lat":2.70324295,"lng":-72.74637359},{"lat":2.70309625,"lng":-72.74634949},{"lat":2.70299954,"lng":-72.74637245},{"lat":2.70294405,"lng":-72.74638291},{"lat":2.70277701,"lng":-72.74635792},{"lat":2.70273611,"lng":-72.74629917},{"lat":2.70273833,"lng":-72.74623131},{"lat":2.70281699,"lng":-72.74612351},{"lat":2.70292713,"lng":-72.7461067},{"lat":2.70307692,"lng":-72.74609878},{"lat":2.70318007,"lng":-72.74608872},{"lat":2.70320398,"lng":-72.74609012},{"lat":2.7033514,"lng":-72.74619299},{"lat":2.70352497,"lng":-72.74617871},{"lat":2.70361693,"lng":-72.74618529},{"lat":2.70367669,"lng":-72.74618879},{"lat":2.70373702,"lng":-72.74617264},{"lat":2.70384537,"lng":-72.74619629},{"lat":2.7039028,"lng":-72.74624915},{"lat":2.70393261,"lng":-72.74627237},{"lat":2.70397408,"lng":-72.74643283},{"lat":2.70404259,"lng":-72.74650125},{"lat":2.70418233,"lng":-72.74647068},{"lat":2.70426481,"lng":-72.74643496},{"lat":2.7043101,"lng":-72.74629806},{"lat":2.70434443,"lng":-72.7461641},{"lat":2.70438363,"lng":-72.74616044},{"lat":2.7045904,"lng":-72.74619283},{"lat":2.70465892,"lng":-72.74621056},{"lat":2.70478867,"lng":-72.74628794},{"lat":2.70487009,"lng":-72.74627005},{"lat":2.70490729,"lng":-72.74621915},{"lat":2.70481826,"lng":-72.74603145},{"lat":2.70478909,"lng":-72.74591643},{"lat":2.704735,"lng":-72.7458578},{"lat":2.70474054,"lng":-72.74559214},{"lat":2.70471292,"lng":-72.74546111},{"lat":2.70481388,"lng":-72.74521477},{"lat":2.70489333,"lng":-72.74513891},{"lat":2.70498987,"lng":-72.74511893},{"lat":2.70513067,"lng":-72.74512121},{"lat":2.70532704,"lng":-72.74491415},{"lat":2.70532069,"lng":-72.7448291},{"lat":2.70540037,"lng":-72.74463816},{"lat":2.70541198,"lng":-72.74454342},{"lat":2.70549572,"lng":-72.74450151},{"lat":2.70562983,"lng":-72.74439397},{"lat":2.7057596,"lng":-72.74429393},{"lat":2.7057563,"lng":-72.74418759},{"lat":2.70585897,"lng":-72.74407433},{"lat":2.70594076,"lng":-72.74401978},{"lat":2.70606087,"lng":-72.74400177},{"lat":2.70612928,"lng":-72.74395032},{"lat":2.70616666,"lng":-72.74389645},{"lat":2.70618876,"lng":-72.74381694},{"lat":2.70618376,"lng":-72.7437749},{"lat":2.70622219,"lng":-72.74370321},{"lat":2.70631822,"lng":-72.74358538},{"lat":2.70637726,"lng":-72.74351012},{"lat":2.70639784,"lng":-72.74346124},{"lat":2.70646029,"lng":-72.74338409},{"lat":2.70646919,"lng":-72.7433047},{"lat":2.70649349,"lng":-72.74323873},{"lat":2.70659817,"lng":-72.74314199},{"lat":2.70668608,"lng":-72.74309556},{"lat":2.70680561,"lng":-72.74305187},{"lat":2.70688517,"lng":-72.7430452},{"lat":2.70706143,"lng":-72.74304092},{"lat":2.7071305,"lng":-72.74301902},{"lat":2.70714707,"lng":-72.7430024},{"lat":2.70714585,"lng":-72.74294716},{"lat":2.70716482,"lng":-72.74285972},{"lat":2.70715225,"lng":-72.7427734},{"lat":2.70716425,"lng":-72.742758},{"lat":2.70718313,"lng":-72.74272273},{"lat":2.70720587,"lng":-72.74262745},{"lat":2.7072487,"lng":-72.7425575},{"lat":2.70728137,"lng":-72.74254242},{"lat":2.70734903,"lng":-72.74249361},{"lat":2.70738669,"lng":-72.7424806},{"lat":2.70743227,"lng":-72.74245525},{"lat":2.70748945,"lng":-72.74241119},{"lat":2.70754989,"lng":-72.74236284},{"lat":2.70759969,"lng":-72.74231686},{"lat":2.70763778,"lng":-72.74224574},{"lat":2.70766579,"lng":-72.74218804},{"lat":2.70770399,"lng":-72.74216076},{"lat":2.70772714,"lng":-72.74211411},{"lat":2.70776403,"lng":-72.74203308},{"lat":2.7078083,"lng":-72.74195397},{"lat":2.70783643,"lng":-72.74188405},{"lat":2.70781214,"lng":-72.74179795},{"lat":2.70779212,"lng":-72.74168048},{"lat":2.70765349,"lng":-72.74142904},{"lat":2.70757734,"lng":-72.74140848},{"lat":2.70752194,"lng":-72.74139211},{"lat":2.70742724,"lng":-72.74131023},{"lat":2.70731483,"lng":-72.74121359},{"lat":2.70725697,"lng":-72.74113745},{"lat":2.70722382,"lng":-72.74106931},{"lat":2.70716825,"lng":-72.74100523},{"lat":2.70710167,"lng":-72.7410055},{"lat":2.70689377,"lng":-72.74096171},{"lat":2.70680567,"lng":-72.74088976},{"lat":2.70660913,"lng":-72.74082636},{"lat":2.70656431,"lng":-72.74077304},{"lat":2.70651975,"lng":-72.7406446},{"lat":2.70653122,"lng":-72.7405421},{"lat":2.70649843,"lng":-72.74046802},{"lat":2.70615175,"lng":-72.73987162}]},{"finca":"FINCA 2","lote":"41","poligono":[{"lat":2.73251622,"lng":-72.73097903},{"lat":2.73246034,"lng":-72.73095548},{"lat":2.73239035,"lng":-72.73098298},{"lat":2.73233737,"lng":-72.73098644},{"lat":2.73226774,"lng":-72.73097729},{"lat":2.73222331,"lng":-72.73098334},{"lat":2.73215333,"lng":-72.73100548},{"lat":2.73208158,"lng":-72.73103736},{"lat":2.73201988,"lng":-72.73106654},{"lat":2.7319586,"lng":-72.73106832},{"lat":2.73182481,"lng":-72.73105929},{"lat":2.73158614,"lng":-72.73113},{"lat":2.7315542,"lng":-72.73114781},{"lat":2.73151195,"lng":-72.73119275},{"lat":2.73147297,"lng":-72.73118271},{"lat":2.7314527,"lng":-72.73116035},{"lat":2.73143333,"lng":-72.73114311},{"lat":2.73141103,"lng":-72.73113495},{"lat":2.7312365,"lng":-72.73114023},{"lat":2.73118924,"lng":-72.73117384},{"lat":2.73113081,"lng":-72.73119338},{"lat":2.73109275,"lng":-72.73120308},{"lat":2.73102981,"lng":-72.73120774},{"lat":2.73098792,"lng":-72.73119604},{"lat":2.73094138,"lng":-72.73118706},{"lat":2.73074813,"lng":-72.73117932},{"lat":2.73071533,"lng":-72.73118127},{"lat":2.73067323,"lng":-72.73118328},{"lat":2.73061235,"lng":-72.73119373},{"lat":2.73056242,"lng":-72.73122659},{"lat":2.7305288,"lng":-72.73125264},{"lat":2.73049011,"lng":-72.73125276},{"lat":2.73039836,"lng":-72.73123248},{"lat":2.73032364,"lng":-72.73120813},{"lat":2.7302701,"lng":-72.73115519},{"lat":2.73014656,"lng":-72.73103375},{"lat":2.72996103,"lng":-72.73102736},{"lat":2.72986323,"lng":-72.73102819},{"lat":2.72976417,"lng":-72.73100986},{"lat":2.72961423,"lng":-72.73095934},{"lat":2.72942152,"lng":-72.73089199},{"lat":2.72934483,"lng":-72.73086036},{"lat":2.72927625,"lng":-72.73081341},{"lat":2.72919544,"lng":-72.73069954},{"lat":2.72911698,"lng":-72.7306523},{"lat":2.72901268,"lng":-72.73061101},{"lat":2.72894096,"lng":-72.7306068},{"lat":2.72861298,"lng":-72.73062099},{"lat":2.72855921,"lng":-72.73063782},{"lat":2.72850392,"lng":-72.73063995},{"lat":2.72844122,"lng":-72.73062017},{"lat":2.72819888,"lng":-72.73059584},{"lat":2.72774676,"lng":-72.730595},{"lat":2.72769526,"lng":-72.73060391},{"lat":2.72762456,"lng":-72.73064331},{"lat":2.72723824,"lng":-72.7306502},{"lat":2.72685439,"lng":-72.73064084},{"lat":2.72681625,"lng":-72.73062668},{"lat":2.72678373,"lng":-72.73059346},{"lat":2.72675264,"lng":-72.7305818},{"lat":2.72658304,"lng":-72.73055457},{"lat":2.72652498,"lng":-72.73053745},{"lat":2.72648396,"lng":-72.73051627},{"lat":2.72643752,"lng":-72.73052577},{"lat":2.72631085,"lng":-72.73059379},{"lat":2.72627659,"lng":-72.73053424},{"lat":2.72622669,"lng":-72.73051104},{"lat":2.72603545,"lng":-72.73049984},{"lat":2.7258833,"lng":-72.73051716},{"lat":2.7258229,"lng":-72.73055478},{"lat":2.7257322,"lng":-72.73056735},{"lat":2.72550661,"lng":-72.73059946},{"lat":2.72543272,"lng":-72.7306017},{"lat":2.72524183,"lng":-72.73058455},{"lat":2.72510816,"lng":-72.73053796},{"lat":2.72482459,"lng":-72.73040476},{"lat":2.72470602,"lng":-72.73031074},{"lat":2.72455725,"lng":-72.73026088},{"lat":2.72450596,"lng":-72.73023074},{"lat":2.72439647,"lng":-72.73005436},{"lat":2.72434497,"lng":-72.73001258},{"lat":2.724258,"lng":-72.72997737},{"lat":2.72417479,"lng":-72.72995967},{"lat":2.72410542,"lng":-72.7298754},{"lat":2.72363673,"lng":-72.7297898},{"lat":2.72348068,"lng":-72.72973116},{"lat":2.72323763,"lng":-72.72967339},{"lat":2.7230473,"lng":-72.7296366},{"lat":2.72295281,"lng":-72.72964239},{"lat":2.72283806,"lng":-72.7296965},{"lat":2.72278269,"lng":-72.7297201},{"lat":2.724786,"lng":-72.73324837},{"lat":2.7253066,"lng":-72.73310562},{"lat":2.72567933,"lng":-72.73303949},{"lat":2.72597247,"lng":-72.73296542},{"lat":2.72618778,"lng":-72.73290438},{"lat":2.72637265,"lng":-72.73283589},{"lat":2.72685821,"lng":-72.73262161},{"lat":2.72736868,"lng":-72.73245232},{"lat":2.72796968,"lng":-72.73229877},{"lat":2.72821435,"lng":-72.7322484},{"lat":2.72890203,"lng":-72.73213988},{"lat":2.72934966,"lng":-72.73209513},{"lat":2.72988553,"lng":-72.73202872},{"lat":2.73018558,"lng":-72.73197473},{"lat":2.73049406,"lng":-72.73193018},{"lat":2.73069874,"lng":-72.73189684},{"lat":2.73098711,"lng":-72.73185767},{"lat":2.73115649,"lng":-72.73185328},{"lat":2.73168206,"lng":-72.73178864},{"lat":2.73188547,"lng":-72.73171081},{"lat":2.73203882,"lng":-72.73158203},{"lat":2.73228282,"lng":-72.73131006},{"lat":2.73251622,"lng":-72.73097903}]},{"finca":"FINCA 2","lote":"31","poligono":[{"lat":2.70634086,"lng":-72.74624154},{"lat":2.70741407,"lng":-72.74445773},{"lat":2.70750078,"lng":-72.74433639},{"lat":2.70753678,"lng":-72.74431794},{"lat":2.70766429,"lng":-72.7443137},{"lat":2.70969953,"lng":-72.7443531},{"lat":2.70978017,"lng":-72.74432709},{"lat":2.70980597,"lng":-72.7443009},{"lat":2.71024722,"lng":-72.74358208},{"lat":2.7102541,"lng":-72.74352143},{"lat":2.7103258,"lng":-72.73865369},{"lat":2.7103335,"lng":-72.73849847},{"lat":2.71027512,"lng":-72.73839035},{"lat":2.7084616,"lng":-72.73834012},{"lat":2.70835472,"lng":-72.73835629},{"lat":2.70823274,"lng":-72.73842877},{"lat":2.70799755,"lng":-72.73878863},{"lat":2.70800519,"lng":-72.73884093},{"lat":2.70815636,"lng":-72.73908497},{"lat":2.70812686,"lng":-72.73919492},{"lat":2.70816955,"lng":-72.73934268},{"lat":2.70802849,"lng":-72.73955086},{"lat":2.70688572,"lng":-72.73953064},{"lat":2.70677274,"lng":-72.73946189},{"lat":2.70669302,"lng":-72.73930143},{"lat":2.7066047,"lng":-72.73931031},{"lat":2.70648951,"lng":-72.73932787},{"lat":2.70643251,"lng":-72.73937881},{"lat":2.70615889,"lng":-72.73982542},{"lat":2.70615253,"lng":-72.73986933},{"lat":2.70650569,"lng":-72.74047216},{"lat":2.70652722,"lng":-72.74046997},{"lat":2.70655617,"lng":-72.74045898},{"lat":2.70672024,"lng":-72.74025117},{"lat":2.70676006,"lng":-72.74023731},{"lat":2.70686262,"lng":-72.74023723},{"lat":2.70696298,"lng":-72.74025883},{"lat":2.70706419,"lng":-72.74032302},{"lat":2.70716117,"lng":-72.74046221},{"lat":2.70721581,"lng":-72.74056001},{"lat":2.70774216,"lng":-72.74105295},{"lat":2.70787798,"lng":-72.7411335},{"lat":2.70792279,"lng":-72.7411576},{"lat":2.70795209,"lng":-72.74116681},{"lat":2.7080049,"lng":-72.74115568},{"lat":2.7081112,"lng":-72.74107976},{"lat":2.70817197,"lng":-72.74104704},{"lat":2.70824361,"lng":-72.74103302},{"lat":2.70829997,"lng":-72.74104366},{"lat":2.70836829,"lng":-72.74109051},{"lat":2.70841399,"lng":-72.74110048},{"lat":2.70847503,"lng":-72.74111523},{"lat":2.70854831,"lng":-72.74108836},{"lat":2.70864729,"lng":-72.74097243},{"lat":2.70879051,"lng":-72.74071312},{"lat":2.70885247,"lng":-72.74049833},{"lat":2.70893154,"lng":-72.74032469},{"lat":2.70895461,"lng":-72.74013908},{"lat":2.70901669,"lng":-72.74007727},{"lat":2.70909683,"lng":-72.74007196},{"lat":2.70916321,"lng":-72.74008024},{"lat":2.70920649,"lng":-72.74009387},{"lat":2.70930025,"lng":-72.74007279},{"lat":2.70933495,"lng":-72.74004034},{"lat":2.70939113,"lng":-72.73997625},{"lat":2.70941964,"lng":-72.73990769},{"lat":2.70942423,"lng":-72.73980981},{"lat":2.70944842,"lng":-72.73971426},{"lat":2.7095082,"lng":-72.73967985},{"lat":2.70958659,"lng":-72.73964607},{"lat":2.70962802,"lng":-72.7396585},{"lat":2.70964958,"lng":-72.73983656},{"lat":2.70956767,"lng":-72.74002883},{"lat":2.70954266,"lng":-72.74032667},{"lat":2.70943738,"lng":-72.74045529},{"lat":2.7094016,"lng":-72.74053485},{"lat":2.70929489,"lng":-72.74062575},{"lat":2.70920229,"lng":-72.7407448},{"lat":2.70911904,"lng":-72.74087209},{"lat":2.70900667,"lng":-72.74095718},{"lat":2.70881104,"lng":-72.74125572},{"lat":2.70874267,"lng":-72.74135176},{"lat":2.70864113,"lng":-72.74144762},{"lat":2.7085747,"lng":-72.74156069},{"lat":2.70857787,"lng":-72.74171306},{"lat":2.70854812,"lng":-72.74173245},{"lat":2.7085629,"lng":-72.74181464},{"lat":2.7085608,"lng":-72.7418561},{"lat":2.70852682,"lng":-72.74188586},{"lat":2.70853089,"lng":-72.74190166},{"lat":2.70854061,"lng":-72.74196636},{"lat":2.70852809,"lng":-72.74200361},{"lat":2.70848747,"lng":-72.74209445},{"lat":2.70848329,"lng":-72.74213427},{"lat":2.7085298,"lng":-72.7422651},{"lat":2.70854709,"lng":-72.74231636},{"lat":2.7085189,"lng":-72.74241876},{"lat":2.70846757,"lng":-72.7425186},{"lat":2.70840311,"lng":-72.74259198},{"lat":2.70830593,"lng":-72.74267966},{"lat":2.70819436,"lng":-72.74282098},{"lat":2.70808153,"lng":-72.7429993},{"lat":2.70797086,"lng":-72.74316957},{"lat":2.70796232,"lng":-72.74321757},{"lat":2.7079037,"lng":-72.74328533},{"lat":2.70782729,"lng":-72.7433225},{"lat":2.70772786,"lng":-72.74344549},{"lat":2.7074695,"lng":-72.74360101},{"lat":2.70744824,"lng":-72.74362912},{"lat":2.70734176,"lng":-72.7436734},{"lat":2.70727078,"lng":-72.74380609},{"lat":2.70719756,"lng":-72.74390946},{"lat":2.70715288,"lng":-72.74393064},{"lat":2.7071087,"lng":-72.74397422},{"lat":2.70704833,"lng":-72.74405658},{"lat":2.7068785,"lng":-72.74432894},{"lat":2.70673569,"lng":-72.74455172},{"lat":2.70661325,"lng":-72.74460973},{"lat":2.7065692,"lng":-72.7446124},{"lat":2.70634985,"lng":-72.74478401},{"lat":2.70632635,"lng":-72.74480434},{"lat":2.70627263,"lng":-72.74482959},{"lat":2.70623016,"lng":-72.74487218},{"lat":2.70612232,"lng":-72.74502382},{"lat":2.70604005,"lng":-72.74517434},{"lat":2.7060276,"lng":-72.74520192},{"lat":2.70597272,"lng":-72.74523691},{"lat":2.70591928,"lng":-72.74528808},{"lat":2.70584614,"lng":-72.74538573},{"lat":2.7058068,"lng":-72.7454866},{"lat":2.70578431,"lng":-72.74568888},{"lat":2.70585929,"lng":-72.74607429},{"lat":2.70589048,"lng":-72.74609262},{"lat":2.70592481,"lng":-72.7461046},{"lat":2.70597645,"lng":-72.74610322},{"lat":2.70600747,"lng":-72.74611145},{"lat":2.70604481,"lng":-72.74615798},{"lat":2.7061196,"lng":-72.74615915},{"lat":2.70621488,"lng":-72.74619161},{"lat":2.70625681,"lng":-72.74624797},{"lat":2.70630629,"lng":-72.74625464},{"lat":2.70634086,"lng":-72.74624154}]},{"finca":"FINCA 2","lote":"22","poligono":[{"lat":2.72559743,"lng":-72.73623559},{"lat":2.72562438,"lng":-72.73631552},{"lat":2.72559132,"lng":-72.73637982},{"lat":2.72563861,"lng":-72.73689796},{"lat":2.7257273,"lng":-72.73714226},{"lat":2.72565466,"lng":-72.73747727},{"lat":2.72568979,"lng":-72.73759726},{"lat":2.72576459,"lng":-72.73769212},{"lat":2.72577886,"lng":-72.73786259},{"lat":2.72613583,"lng":-72.73834999},{"lat":2.72622674,"lng":-72.73850193},{"lat":2.72634981,"lng":-72.73872118},{"lat":2.72633916,"lng":-72.73884617},{"lat":2.72640508,"lng":-72.73890577},{"lat":2.72646774,"lng":-72.73893125},{"lat":2.72671559,"lng":-72.73892961},{"lat":2.72682938,"lng":-72.73883248},{"lat":2.72695692,"lng":-72.73879108},{"lat":2.72701171,"lng":-72.73871634},{"lat":2.72718852,"lng":-72.73863865},{"lat":2.72737851,"lng":-72.73865382},{"lat":2.7274638,"lng":-72.7386059},{"lat":2.72761931,"lng":-72.73852434},{"lat":2.72773041,"lng":-72.73845895},{"lat":2.72782058,"lng":-72.73836286},{"lat":2.72791258,"lng":-72.73825637},{"lat":2.72797242,"lng":-72.73815123},{"lat":2.72792903,"lng":-72.73804731},{"lat":2.72791648,"lng":-72.7366273},{"lat":2.72869463,"lng":-72.73529076},{"lat":2.72867536,"lng":-72.73525267},{"lat":2.72858286,"lng":-72.73523716},{"lat":2.72658973,"lng":-72.73521936},{"lat":2.72606914,"lng":-72.73520421},{"lat":2.72599228,"lng":-72.7352195},{"lat":2.72589619,"lng":-72.73520297},{"lat":2.72579041,"lng":-72.73519233},{"lat":2.72508428,"lng":-72.73521034},{"lat":2.72502537,"lng":-72.73520366},{"lat":2.72483049,"lng":-72.73520483},{"lat":2.72475031,"lng":-72.73520532},{"lat":2.72441411,"lng":-72.73519693},{"lat":2.72337321,"lng":-72.7351824},{"lat":2.72331916,"lng":-72.73520347},{"lat":2.72327752,"lng":-72.73608474},{"lat":2.72323822,"lng":-72.73619957},{"lat":2.72311302,"lng":-72.73637964},{"lat":2.72308948,"lng":-72.73662625},{"lat":2.72308657,"lng":-72.73675775},{"lat":2.72311774,"lng":-72.73691709},{"lat":2.72454775,"lng":-72.73950256},{"lat":2.72464951,"lng":-72.73947137},{"lat":2.72475489,"lng":-72.73936526},{"lat":2.72481975,"lng":-72.73933998},{"lat":2.72497953,"lng":-72.73911104},{"lat":2.72515757,"lng":-72.73906735},{"lat":2.72518043,"lng":-72.73902426},{"lat":2.72535759,"lng":-72.73900919},{"lat":2.72547981,"lng":-72.73891377},{"lat":2.72557822,"lng":-72.73877453},{"lat":2.7257298,"lng":-72.73864286},{"lat":2.72582659,"lng":-72.73848293},{"lat":2.72587364,"lng":-72.73840168},{"lat":2.72582984,"lng":-72.73831834},{"lat":2.72576699,"lng":-72.73828234},{"lat":2.72560867,"lng":-72.73828115},{"lat":2.72549152,"lng":-72.73833891},{"lat":2.7252665,"lng":-72.73817467},{"lat":2.72519913,"lng":-72.73807783},{"lat":2.72514352,"lng":-72.73796067},{"lat":2.7251126,"lng":-72.73759132},{"lat":2.72501519,"lng":-72.73739821},{"lat":2.7250182,"lng":-72.7373063},{"lat":2.72495831,"lng":-72.73719293},{"lat":2.72488456,"lng":-72.7370529},{"lat":2.72481252,"lng":-72.73700749},{"lat":2.72475843,"lng":-72.73697443},{"lat":2.72471135,"lng":-72.73686424},{"lat":2.72461333,"lng":-72.73681851},{"lat":2.72460674,"lng":-72.73680641},{"lat":2.72469364,"lng":-72.73674486},{"lat":2.72477897,"lng":-72.73675107},{"lat":2.72486337,"lng":-72.73676611},{"lat":2.72498937,"lng":-72.73675087},{"lat":2.72503661,"lng":-72.73671446},{"lat":2.72517882,"lng":-72.73669291},{"lat":2.72532738,"lng":-72.73668747},{"lat":2.72539277,"lng":-72.73660527},{"lat":2.72544911,"lng":-72.73650437},{"lat":2.72545066,"lng":-72.73644388},{"lat":2.72546338,"lng":-72.73637313},{"lat":2.7254849,"lng":-72.73632512},{"lat":2.72547743,"lng":-72.73627298},{"lat":2.72551453,"lng":-72.73620892},{"lat":2.72552416,"lng":-72.73621201},{"lat":2.72559743,"lng":-72.73623559}]},{"finca":"FINCA 2","lote":"36","poligono":[{"lat":2.71028357,"lng":-72.7380457},{"lat":2.71157577,"lng":-72.7358816},{"lat":2.71164872,"lng":-72.73581872},{"lat":2.71171183,"lng":-72.73578137},{"lat":2.71180654,"lng":-72.73576458},{"lat":2.71211045,"lng":-72.73575836},{"lat":2.7132689,"lng":-72.73577474},{"lat":2.7140573,"lng":-72.73576995},{"lat":2.71414411,"lng":-72.73575219},{"lat":2.71419831,"lng":-72.73568933},{"lat":2.71427024,"lng":-72.73559014},{"lat":2.71518712,"lng":-72.73400049},{"lat":2.71519286,"lng":-72.73384642},{"lat":2.71522608,"lng":-72.73355103},{"lat":2.71524562,"lng":-72.73337537},{"lat":2.71525381,"lng":-72.73275324},{"lat":2.71523298,"lng":-72.73266299},{"lat":2.71521416,"lng":-72.73259138},{"lat":2.7149017,"lng":-72.73201377},{"lat":2.71477038,"lng":-72.73193542},{"lat":2.71157823,"lng":-72.73189577},{"lat":2.71126097,"lng":-72.732321},{"lat":2.71120378,"lng":-72.73235246},{"lat":2.71107946,"lng":-72.73236438},{"lat":2.71102024,"lng":-72.7323507},{"lat":2.71081493,"lng":-72.73228813},{"lat":2.71052877,"lng":-72.73228256},{"lat":2.70915818,"lng":-72.73227034},{"lat":2.70911196,"lng":-72.73241659},{"lat":2.70910853,"lng":-72.73243475},{"lat":2.70909401,"lng":-72.73269136},{"lat":2.7090771,"lng":-72.7330044},{"lat":2.70903931,"lng":-72.73363219},{"lat":2.7089928,"lng":-72.73439737},{"lat":2.70899283,"lng":-72.73442239},{"lat":2.70901856,"lng":-72.73449203},{"lat":2.70907874,"lng":-72.73447823},{"lat":2.70911279,"lng":-72.73448211},{"lat":2.70919121,"lng":-72.73445897},{"lat":2.70931301,"lng":-72.73441026},{"lat":2.70955959,"lng":-72.73431383},{"lat":2.70973614,"lng":-72.73424004},{"lat":2.71007353,"lng":-72.73417294},{"lat":2.71032711,"lng":-72.73416383},{"lat":2.71037747,"lng":-72.73420008},{"lat":2.71046228,"lng":-72.73415681},{"lat":2.7105737,"lng":-72.73407917},{"lat":2.7106772,"lng":-72.73398584},{"lat":2.71075224,"lng":-72.73402991},{"lat":2.7110956,"lng":-72.73400697},{"lat":2.71117745,"lng":-72.73395585},{"lat":2.71130077,"lng":-72.73393707},{"lat":2.71133917,"lng":-72.73386442},{"lat":2.71146646,"lng":-72.73386231},{"lat":2.7115256,"lng":-72.73380337},{"lat":2.71186898,"lng":-72.73379907},{"lat":2.71187693,"lng":-72.73384812},{"lat":2.71192432,"lng":-72.73387751},{"lat":2.71226366,"lng":-72.73378686},{"lat":2.71237986,"lng":-72.73357674},{"lat":2.71242321,"lng":-72.73352076},{"lat":2.71260864,"lng":-72.73344991},{"lat":2.71270037,"lng":-72.73341252},{"lat":2.71274573,"lng":-72.73338598},{"lat":2.71287894,"lng":-72.73338976},{"lat":2.71294598,"lng":-72.73333179},{"lat":2.7130999,"lng":-72.73332181},{"lat":2.71315809,"lng":-72.73330212},{"lat":2.71318075,"lng":-72.73327363},{"lat":2.7132656,"lng":-72.73325784},{"lat":2.71361165,"lng":-72.73299841},{"lat":2.71369151,"lng":-72.73293454},{"lat":2.71375261,"lng":-72.73286775},{"lat":2.71382368,"lng":-72.73288533},{"lat":2.71383058,"lng":-72.73288042},{"lat":2.71387688,"lng":-72.7328156},{"lat":2.71402202,"lng":-72.73289689},{"lat":2.7140478,"lng":-72.7330097},{"lat":2.71400843,"lng":-72.73309511},{"lat":2.71395912,"lng":-72.73311676},{"lat":2.7139197,"lng":-72.73316096},{"lat":2.71352796,"lng":-72.73315844},{"lat":2.71340271,"lng":-72.73321746},{"lat":2.71331495,"lng":-72.73326956},{"lat":2.71329435,"lng":-72.73338439},{"lat":2.71304614,"lng":-72.73378109},{"lat":2.71296426,"lng":-72.73379884},{"lat":2.71284306,"lng":-72.73394911},{"lat":2.712859,"lng":-72.73409235},{"lat":2.71282747,"lng":-72.73412477},{"lat":2.7124081,"lng":-72.73412719},{"lat":2.71235291,"lng":-72.73418613},{"lat":2.71192072,"lng":-72.73418366},{"lat":2.71188721,"lng":-72.73421902},{"lat":2.71166226,"lng":-72.73424871},{"lat":2.7115025,"lng":-72.73432542},{"lat":2.7113861,"lng":-72.73435891},{"lat":2.71123425,"lng":-72.73446113},{"lat":2.7110172,"lng":-72.73448296},{"lat":2.71090862,"lng":-72.7344556},{"lat":2.71065808,"lng":-72.73453144},{"lat":2.71057712,"lng":-72.73449424},{"lat":2.71050903,"lng":-72.73448842},{"lat":2.7104637,"lng":-72.73454441},{"lat":2.71038969,"lng":-72.73453566},{"lat":2.71033745,"lng":-72.73459263},{"lat":2.71022009,"lng":-72.73464476},{"lat":2.7102044,"lng":-72.73473211},{"lat":2.71099536,"lng":-72.73614227},{"lat":2.71093427,"lng":-72.73621397},{"lat":2.71000353,"lng":-72.7377742},{"lat":2.71006092,"lng":-72.73791936},{"lat":2.71028357,"lng":-72.7380457}]},{"finca":"FINCA 2","lote":"40","poligono":[{"lat":2.7247491,"lng":-72.73325539},{"lat":2.72275287,"lng":-72.72974211},{"lat":2.7223938,"lng":-72.72974596},{"lat":2.72232549,"lng":-72.72977138},{"lat":2.72212162,"lng":-72.72976469},{"lat":2.72198847,"lng":-72.72981552},{"lat":2.72189708,"lng":-72.72991123},{"lat":2.72173864,"lng":-72.73013948},{"lat":2.72145891,"lng":-72.73065121},{"lat":2.72129476,"lng":-72.73094397},{"lat":2.72126261,"lng":-72.73119626},{"lat":2.72132769,"lng":-72.7313874},{"lat":2.7216272,"lng":-72.73198374},{"lat":2.72166783,"lng":-72.73206317},{"lat":2.72172944,"lng":-72.73225661},{"lat":2.72183393,"lng":-72.73247075},{"lat":2.72185495,"lng":-72.73262968},{"lat":2.72183184,"lng":-72.73267348},{"lat":2.7218389,"lng":-72.73277253},{"lat":2.72188531,"lng":-72.7328462},{"lat":2.72185533,"lng":-72.73296833},{"lat":2.72187397,"lng":-72.73305815},{"lat":2.72174434,"lng":-72.73315505},{"lat":2.72169801,"lng":-72.7331505},{"lat":2.72148018,"lng":-72.73309545},{"lat":2.7214292,"lng":-72.73307477},{"lat":2.72139207,"lng":-72.73302183},{"lat":2.72138039,"lng":-72.73293891},{"lat":2.72139185,"lng":-72.7328214},{"lat":2.7213941,"lng":-72.73276611},{"lat":2.72141952,"lng":-72.73270849},{"lat":2.72141943,"lng":-72.73262556},{"lat":2.72142855,"lng":-72.73249884},{"lat":2.72142378,"lng":-72.73237675},{"lat":2.72140974,"lng":-72.73224775},{"lat":2.72134704,"lng":-72.73211881},{"lat":2.72127746,"lng":-72.73204287},{"lat":2.72118934,"lng":-72.73196234},{"lat":2.72117997,"lng":-72.73186789},{"lat":2.72120537,"lng":-72.73179875},{"lat":2.72122155,"lng":-72.73176303},{"lat":2.7212134,"lng":-72.73172733},{"lat":2.72120295,"lng":-72.73170891},{"lat":2.72120063,"lng":-72.73170431},{"lat":2.72001439,"lng":-72.73364421},{"lat":2.720279,"lng":-72.73411042},{"lat":2.72074581,"lng":-72.73412373},{"lat":2.72093234,"lng":-72.73415693},{"lat":2.72104592,"lng":-72.734219},{"lat":2.72348303,"lng":-72.73424855},{"lat":2.72352702,"lng":-72.73422777},{"lat":2.72396205,"lng":-72.73379188},{"lat":2.72431615,"lng":-72.73348509},{"lat":2.72438907,"lng":-72.73344239},{"lat":2.72458354,"lng":-72.73332238},{"lat":2.7247491,"lng":-72.73325539}]},{"finca":"FINCA 2","lote":"39","poligono":[{"lat":2.72120063,"lng":-72.731702},{"lat":2.72120459,"lng":-72.73161618},{"lat":2.7211842,"lng":-72.73151196},{"lat":2.72112498,"lng":-72.73138129},{"lat":2.72107684,"lng":-72.73131972},{"lat":2.72095509,"lng":-72.73120582},{"lat":2.72088431,"lng":-72.73109532},{"lat":2.72087264,"lng":-72.73101931},{"lat":2.72091189,"lng":-72.73089717},{"lat":2.72087939,"lng":-72.73084192},{"lat":2.72083593,"lng":-72.73081662},{"lat":2.72074789,"lng":-72.73080751},{"lat":2.72070843,"lng":-72.73074477},{"lat":2.72054798,"lng":-72.73072134},{"lat":2.7205491,"lng":-72.73068217},{"lat":2.72016336,"lng":-72.73066417},{"lat":2.72007299,"lng":-72.73063893},{"lat":2.71989104,"lng":-72.73055965},{"lat":2.71988929,"lng":-72.73054007},{"lat":2.7197491,"lng":-72.73051489},{"lat":2.71963442,"lng":-72.7305035},{"lat":2.71959035,"lng":-72.73045517},{"lat":2.71952316,"lng":-72.73044603},{"lat":2.71902622,"lng":-72.730427},{"lat":2.71889882,"lng":-72.73043981},{"lat":2.71881776,"lng":-72.73045948},{"lat":2.71839876,"lng":-72.73072948},{"lat":2.71828529,"lng":-72.73076992},{"lat":2.7181544,"lng":-72.73076316},{"lat":2.71807685,"lng":-72.73081853},{"lat":2.71796568,"lng":-72.73084169},{"lat":2.71792052,"lng":-72.73085096},{"lat":2.71784991,"lng":-72.73088905},{"lat":2.71777119,"lng":-72.73093636},{"lat":2.71772853,"lng":-72.73110803},{"lat":2.71772429,"lng":-72.73146051},{"lat":2.71768742,"lng":-72.73163448},{"lat":2.71768863,"lng":-72.73168401},{"lat":2.71771766,"lng":-72.73174272},{"lat":2.71770627,"lng":-72.73191782},{"lat":2.71768556,"lng":-72.73203994},{"lat":2.71768258,"lng":-72.73248226},{"lat":2.71766339,"lng":-72.7329315},{"lat":2.71761479,"lng":-72.73297763},{"lat":2.71757773,"lng":-72.73298228},{"lat":2.71745952,"lng":-72.73292021},{"lat":2.71738537,"lng":-72.73290993},{"lat":2.71728577,"lng":-72.73292156},{"lat":2.71718148,"lng":-72.7328802},{"lat":2.71706101,"lng":-72.73287803},{"lat":2.716995,"lng":-72.73289193},{"lat":2.71686065,"lng":-72.73289784},{"lat":2.71675637,"lng":-72.73287146},{"lat":2.71666368,"lng":-72.73284737},{"lat":2.71654787,"lng":-72.73286478},{"lat":2.71626756,"lng":-72.7328697},{"lat":2.7162108,"lng":-72.73285939},{"lat":2.71609247,"lng":-72.73270287},{"lat":2.71528081,"lng":-72.73401689},{"lat":2.71535267,"lng":-72.73405367},{"lat":2.7171747,"lng":-72.73407009},{"lat":2.7173102,"lng":-72.7340469},{"lat":2.71807072,"lng":-72.73361987},{"lat":2.71826754,"lng":-72.7335298},{"lat":2.7198521,"lng":-72.73353727},{"lat":2.71995638,"lng":-72.73356019},{"lat":2.72001265,"lng":-72.73364191},{"lat":2.72120063,"lng":-72.731702}]},{"finca":"FINCA 3","lote":"55","poligono":[{"lat":2.70419039,"lng":-72.75097678},{"lat":2.70419886,"lng":-72.75096883},{"lat":2.69718678,"lng":-72.7509387},{"lat":2.69705998,"lng":-72.75072553},{"lat":2.69674822,"lng":-72.75072902},{"lat":2.69661277,"lng":-72.7507682},{"lat":2.69646726,"lng":-72.75078472},{"lat":2.69641505,"lng":-72.7508562},{"lat":2.69636537,"lng":-72.75086462},{"lat":2.69633559,"lng":-72.75090671},{"lat":2.69625253,"lng":-72.75091675},{"lat":2.69619354,"lng":-72.75095594},{"lat":2.6960288,"lng":-72.75101367},{"lat":2.69598067,"lng":-72.75105677},{"lat":2.69594138,"lng":-72.75106192},{"lat":2.69588973,"lng":-72.75111376},{"lat":2.69585076,"lng":-72.75117439},{"lat":2.69584334,"lng":-72.75132991},{"lat":2.69586844,"lng":-72.75137193},{"lat":2.69580419,"lng":-72.75151487},{"lat":2.69580013,"lng":-72.75156323},{"lat":2.69579282,"lng":-72.75168655},{"lat":2.69580353,"lng":-72.75175874},{"lat":2.69583711,"lng":-72.7518448},{"lat":2.69583015,"lng":-72.7518915},{"lat":2.69586607,"lng":-72.75197352},{"lat":2.69591596,"lng":-72.7520981},{"lat":2.69598023,"lng":-72.75219251},{"lat":2.6960239,"lng":-72.7522398},{"lat":2.69612902,"lng":-72.75235837},{"lat":2.6961492,"lng":-72.75240756},{"lat":2.69618757,"lng":-72.75249867},{"lat":2.69622198,"lng":-72.75261131},{"lat":2.69620194,"lng":-72.75264592},{"lat":2.69621623,"lng":-72.75266793},{"lat":2.69626074,"lng":-72.75271109},{"lat":2.69627002,"lng":-72.75274175},{"lat":2.69634168,"lng":-72.7527874},{"lat":2.6963627,"lng":-72.75278177},{"lat":2.69642284,"lng":-72.75274862},{"lat":2.69646042,"lng":-72.75273174},{"lat":2.69650913,"lng":-72.75271431},{"lat":2.6965799,"lng":-72.7526788},{"lat":2.69664582,"lng":-72.75262899},{"lat":2.69666943,"lng":-72.75259489},{"lat":2.69665615,"lng":-72.75254581},{"lat":2.69662459,"lng":-72.75250162},{"lat":2.69656592,"lng":-72.75246956},{"lat":2.69651526,"lng":-72.75242365},{"lat":2.69646506,"lng":-72.75239029},{"lat":2.69644693,"lng":-72.75235226},{"lat":2.69643111,"lng":-72.75231555},{"lat":2.69640472,"lng":-72.7522651},{"lat":2.69637938,"lng":-72.75219682},{"lat":2.69638442,"lng":-72.75208142},{"lat":2.69637071,"lng":-72.75200906},{"lat":2.69645492,"lng":-72.75190366},{"lat":2.69658627,"lng":-72.75180223},{"lat":2.69660428,"lng":-72.75173112},{"lat":2.69671804,"lng":-72.75172407},{"lat":2.69680756,"lng":-72.75174154},{"lat":2.69693434,"lng":-72.75196009},{"lat":2.69685449,"lng":-72.7521033},{"lat":2.69689658,"lng":-72.75217733},{"lat":2.69684423,"lng":-72.75224106},{"lat":2.69694535,"lng":-72.75238653},{"lat":2.69704309,"lng":-72.75230579},{"lat":2.69708742,"lng":-72.7523066},{"lat":2.69718401,"lng":-72.75212381},{"lat":2.69732742,"lng":-72.75206691},{"lat":2.69753753,"lng":-72.75202287},{"lat":2.69758499,"lng":-72.75215297},{"lat":2.69767998,"lng":-72.752149},{"lat":2.69784479,"lng":-72.75224185},{"lat":2.69804874,"lng":-72.75225111},{"lat":2.69815305,"lng":-72.75224172},{"lat":2.69823026,"lng":-72.75226444},{"lat":2.69830036,"lng":-72.75225542},{"lat":2.69840833,"lng":-72.75219436},{"lat":2.69845516,"lng":-72.75214284},{"lat":2.69851521,"lng":-72.75211117},{"lat":2.69861122,"lng":-72.7521001},{"lat":2.69889098,"lng":-72.75210516},{"lat":2.69894033,"lng":-72.75224402},{"lat":2.69901908,"lng":-72.75223075},{"lat":2.69907627,"lng":-72.75225736},{"lat":2.6991193,"lng":-72.75224974},{"lat":2.69923049,"lng":-72.75231649},{"lat":2.6994272,"lng":-72.7526757},{"lat":2.69949299,"lng":-72.75266345},{"lat":2.69954827,"lng":-72.75266669},{"lat":2.69960089,"lng":-72.75269452},{"lat":2.69970457,"lng":-72.75267555},{"lat":2.69977475,"lng":-72.75271574},{"lat":2.69985605,"lng":-72.75273542},{"lat":2.69993035,"lng":-72.75273649},{"lat":2.70010281,"lng":-72.75275077},{"lat":2.70014797,"lng":-72.75272748},{"lat":2.70021956,"lng":-72.7527439},{"lat":2.70029785,"lng":-72.75276876},{"lat":2.70040375,"lng":-72.75282864},{"lat":2.70045056,"lng":-72.75280783},{"lat":2.7005064,"lng":-72.75281677},{"lat":2.7005505,"lng":-72.75283664},{"lat":2.70058747,"lng":-72.75280482},{"lat":2.70061403,"lng":-72.75280697},{"lat":2.70072506,"lng":-72.75287132},{"lat":2.70077643,"lng":-72.75282931},{"lat":2.70082517,"lng":-72.7528265},{"lat":2.70088635,"lng":-72.75285334},{"lat":2.70105907,"lng":-72.7529072},{"lat":2.70131003,"lng":-72.75293622},{"lat":2.7013426,"lng":-72.75295999},{"lat":2.70140094,"lng":-72.75296063},{"lat":2.70145592,"lng":-72.75297061},{"lat":2.70149452,"lng":-72.75298043},{"lat":2.70154781,"lng":-72.75296486},{"lat":2.70159427,"lng":-72.75294333},{"lat":2.70211965,"lng":-72.75293595},{"lat":2.70226981,"lng":-72.75295231},{"lat":2.70247379,"lng":-72.75263387},{"lat":2.70251623,"lng":-72.75258547},{"lat":2.70267411,"lng":-72.75251203},{"lat":2.70271363,"lng":-72.75247936},{"lat":2.70281831,"lng":-72.75239286},{"lat":2.70285384,"lng":-72.75235995},{"lat":2.70285216,"lng":-72.75226682},{"lat":2.70288871,"lng":-72.7521966},{"lat":2.70294163,"lng":-72.75216034},{"lat":2.70300234,"lng":-72.7521142},{"lat":2.70305529,"lng":-72.752037},{"lat":2.70313026,"lng":-72.75202668},{"lat":2.70324094,"lng":-72.75196717},{"lat":2.70332105,"lng":-72.75191064},{"lat":2.70340958,"lng":-72.7518538},{"lat":2.70345566,"lng":-72.75181157},{"lat":2.70347758,"lng":-72.75174527},{"lat":2.70352481,"lng":-72.7516566},{"lat":2.7036371,"lng":-72.75144849},{"lat":2.70368922,"lng":-72.75138514},{"lat":2.70379179,"lng":-72.7513343},{"lat":2.7038846,"lng":-72.75128607},{"lat":2.70395937,"lng":-72.75123876},{"lat":2.7040339,"lng":-72.75122922},{"lat":2.70419039,"lng":-72.75097678}]},{"finca":"FINCA 3","lote":"44A","poligono":[{"lat":2.73332892,"lng":-72.73187257},{"lat":2.73327088,"lng":-72.7319132},{"lat":2.73289791,"lng":-72.73254492},{"lat":2.73347481,"lng":-72.73356412},{"lat":2.73351256,"lng":-72.73362272},{"lat":2.73354247,"lng":-72.73365696},{"lat":2.73366935,"lng":-72.73376265},{"lat":2.73374935,"lng":-72.73381589},{"lat":2.73385876,"lng":-72.73390094},{"lat":2.73389061,"lng":-72.73391511},{"lat":2.73392768,"lng":-72.73395696},{"lat":2.73397784,"lng":-72.73400571},{"lat":2.73406715,"lng":-72.73404998},{"lat":2.7341415,"lng":-72.73410287},{"lat":2.73428849,"lng":-72.73411213},{"lat":2.73437608,"lng":-72.73423141},{"lat":2.73482147,"lng":-72.73442274},{"lat":2.73484295,"lng":-72.73435983},{"lat":2.734947,"lng":-72.73435771},{"lat":2.73499745,"lng":-72.73442254},{"lat":2.73502978,"lng":-72.73459349},{"lat":2.73509483,"lng":-72.73468964},{"lat":2.73521691,"lng":-72.73477463},{"lat":2.7353133,"lng":-72.73489967},{"lat":2.73534729,"lng":-72.73494871},{"lat":2.73530763,"lng":-72.73503653},{"lat":2.73530727,"lng":-72.73511075},{"lat":2.73534955,"lng":-72.73521459},{"lat":2.73532322,"lng":-72.73524419},{"lat":2.73529802,"lng":-72.73533813},{"lat":2.73537451,"lng":-72.73546019},{"lat":2.7354216,"lng":-72.73551613},{"lat":2.73547749,"lng":-72.73550923},{"lat":2.73552895,"lng":-72.735476},{"lat":2.73555057,"lng":-72.73536968},{"lat":2.73557442,"lng":-72.73513931},{"lat":2.73561528,"lng":-72.73505982},{"lat":2.73558845,"lng":-72.73500125},{"lat":2.73556921,"lng":-72.73490581},{"lat":2.73560149,"lng":-72.73482405},{"lat":2.73565088,"lng":-72.73473424},{"lat":2.7356969,"lng":-72.73470414},{"lat":2.73574277,"lng":-72.73471745},{"lat":2.7357973,"lng":-72.73474563},{"lat":2.7358831,"lng":-72.73472152},{"lat":2.73595796,"lng":-72.73465676},{"lat":2.73600935,"lng":-72.73457663},{"lat":2.73600721,"lng":-72.73454176},{"lat":2.73607921,"lng":-72.73445337},{"lat":2.73610312,"lng":-72.73430421},{"lat":2.73606463,"lng":-72.73421624},{"lat":2.73609069,"lng":-72.73413625},{"lat":2.73621915,"lng":-72.73410744},{"lat":2.73638238,"lng":-72.73419762},{"lat":2.73635932,"lng":-72.73432643},{"lat":2.73640941,"lng":-72.73439689},{"lat":2.73646651,"lng":-72.73446692},{"lat":2.73656698,"lng":-72.73455532},{"lat":2.7364627,"lng":-72.73472547},{"lat":2.73639865,"lng":-72.73470277},{"lat":2.7363678,"lng":-72.73479635},{"lat":2.73615301,"lng":-72.73513843},{"lat":2.73599242,"lng":-72.735137},{"lat":2.73590081,"lng":-72.73520417},{"lat":2.73589523,"lng":-72.73525072},{"lat":2.73588327,"lng":-72.73530815},{"lat":2.73588713,"lng":-72.73537092},{"lat":2.73587704,"lng":-72.73541283},{"lat":2.73589843,"lng":-72.73547454},{"lat":2.73590429,"lng":-72.73554699},{"lat":2.73596283,"lng":-72.73562883},{"lat":2.7359752,"lng":-72.73568128},{"lat":2.73595545,"lng":-72.73573779},{"lat":2.73588538,"lng":-72.73575465},{"lat":2.73576365,"lng":-72.73576695},{"lat":2.73569881,"lng":-72.7358115},{"lat":2.73563597,"lng":-72.73590002},{"lat":2.73563561,"lng":-72.73593995},{"lat":2.73561671,"lng":-72.73604471},{"lat":2.73564755,"lng":-72.73608833},{"lat":2.73557776,"lng":-72.73625849},{"lat":2.73575163,"lng":-72.73661334},{"lat":2.73578792,"lng":-72.73661954},{"lat":2.73596794,"lng":-72.73699432},{"lat":2.7359985,"lng":-72.73702186},{"lat":2.7360662,"lng":-72.73703525},{"lat":2.73615751,"lng":-72.7370549},{"lat":2.73628459,"lng":-72.73726699},{"lat":2.73633075,"lng":-72.73726208},{"lat":2.73644518,"lng":-72.73723412},{"lat":2.73677732,"lng":-72.73714042},{"lat":2.73711018,"lng":-72.73700117},{"lat":2.73714346,"lng":-72.73695854},{"lat":2.73741183,"lng":-72.73685822},{"lat":2.73762208,"lng":-72.73688884},{"lat":2.73773859,"lng":-72.73684885},{"lat":2.73780759,"lng":-72.73678025},{"lat":2.73779543,"lng":-72.73661123},{"lat":2.73779308,"lng":-72.73653856},{"lat":2.73783158,"lng":-72.73648932},{"lat":2.73787552,"lng":-72.73650555},{"lat":2.73789957,"lng":-72.73648449},{"lat":2.7379156,"lng":-72.73645901},{"lat":2.73712729,"lng":-72.73508129},{"lat":2.73709244,"lng":-72.73500115},{"lat":2.73709305,"lng":-72.73497101},{"lat":2.73710751,"lng":-72.73492568},{"lat":2.73844396,"lng":-72.73274461},{"lat":2.73848941,"lng":-72.73264804},{"lat":2.73845872,"lng":-72.732561},{"lat":2.7376533,"lng":-72.73110557},{"lat":2.73752329,"lng":-72.73085726},{"lat":2.7374483,"lng":-72.73075962},{"lat":2.73730825,"lng":-72.73066872},{"lat":2.73715754,"lng":-72.73065619},{"lat":2.73698879,"lng":-72.73069375},{"lat":2.73647473,"lng":-72.73094273},{"lat":2.7363034,"lng":-72.73104135},{"lat":2.73614995,"lng":-72.73120189},{"lat":2.73583746,"lng":-72.73170673},{"lat":2.73572925,"lng":-72.73180152},{"lat":2.7356355,"lng":-72.73183382},{"lat":2.73528412,"lng":-72.73186639},{"lat":2.73332892,"lng":-72.73187257}]},{"finca":"FINCA 3","lote":"45A","poligono":[{"lat":2.73288982,"lng":-72.73256222},{"lat":2.73265081,"lng":-72.73285118},{"lat":2.73205486,"lng":-72.73382524},{"lat":2.73169419,"lng":-72.7344428},{"lat":2.73112848,"lng":-72.73530919},{"lat":2.73112425,"lng":-72.73542356},{"lat":2.73117684,"lng":-72.73555757},{"lat":2.73128525,"lng":-72.73570639},{"lat":2.7325235,"lng":-72.73688558},{"lat":2.73269309,"lng":-72.73706778},{"lat":2.73284207,"lng":-72.73722394},{"lat":2.73293274,"lng":-72.73733603},{"lat":2.7329786,"lng":-72.73741795},{"lat":2.73302962,"lng":-72.73744635},{"lat":2.73314943,"lng":-72.73733406},{"lat":2.73456215,"lng":-72.7349737},{"lat":2.73449797,"lng":-72.7348915},{"lat":2.7344375,"lng":-72.73481257},{"lat":2.73439801,"lng":-72.73471976},{"lat":2.73440989,"lng":-72.73461543},{"lat":2.73443581,"lng":-72.73454455},{"lat":2.73439416,"lng":-72.73445118},{"lat":2.73433134,"lng":-72.73433389},{"lat":2.73422865,"lng":-72.73426663},{"lat":2.73412381,"lng":-72.7342331},{"lat":2.7341392,"lng":-72.73419716},{"lat":2.73415337,"lng":-72.7341529},{"lat":2.73386434,"lng":-72.73394016},{"lat":2.73384781,"lng":-72.73391176},{"lat":2.73370205,"lng":-72.73380792},{"lat":2.73350877,"lng":-72.73364116},{"lat":2.73288982,"lng":-72.73256222}]},{"finca":"FINCA 3","lote":"45B","poligono":[{"lat":2.73460695,"lng":-72.73499423},{"lat":2.73309983,"lng":-72.7374544},{"lat":2.73305979,"lng":-72.73747632},{"lat":2.73296869,"lng":-72.73749829},{"lat":2.73248566,"lng":-72.73829567},{"lat":2.73230217,"lng":-72.73859274},{"lat":2.73224891,"lng":-72.73873654},{"lat":2.73227097,"lng":-72.73878808},{"lat":2.73279322,"lng":-72.73934529},{"lat":2.73324299,"lng":-72.73972603},{"lat":2.73348786,"lng":-72.73951639},{"lat":2.73356331,"lng":-72.73954912},{"lat":2.73390759,"lng":-72.73972529},{"lat":2.73412457,"lng":-72.73987036},{"lat":2.73416235,"lng":-72.73993281},{"lat":2.73416409,"lng":-72.74008124},{"lat":2.73420511,"lng":-72.74023588},{"lat":2.73426801,"lng":-72.74028581},{"lat":2.73436544,"lng":-72.74029508},{"lat":2.73439052,"lng":-72.74024817},{"lat":2.73441243,"lng":-72.7401669},{"lat":2.73441854,"lng":-72.74001065},{"lat":2.73448441,"lng":-72.73991058},{"lat":2.73454712,"lng":-72.73978239},{"lat":2.73461927,"lng":-72.73967919},{"lat":2.7346726,"lng":-72.73959476},{"lat":2.73474479,"lng":-72.73951968},{"lat":2.73484519,"lng":-72.73938833},{"lat":2.73495196,"lng":-72.73932102},{"lat":2.73498965,"lng":-72.73930692},{"lat":2.73502104,"lng":-72.7392772},{"lat":2.73504453,"lng":-72.73921155},{"lat":2.73510262,"lng":-72.73917086},{"lat":2.73516851,"lng":-72.73908329},{"lat":2.73524692,"lng":-72.73895352},{"lat":2.73529555,"lng":-72.7388816},{"lat":2.73537247,"lng":-72.73882526},{"lat":2.73544785,"lng":-72.73878924},{"lat":2.73549025,"lng":-72.73877357},{"lat":2.73554048,"lng":-72.73872664},{"lat":2.73551053,"lng":-72.73864543},{"lat":2.73544757,"lng":-72.73854238},{"lat":2.73545374,"lng":-72.73843612},{"lat":2.73550392,"lng":-72.73835013},{"lat":2.73556515,"lng":-72.73831413},{"lat":2.7355871,"lng":-72.73827036},{"lat":2.73555091,"lng":-72.7382204},{"lat":2.73546908,"lng":-72.73810799},{"lat":2.73539672,"lng":-72.73803152},{"lat":2.73525362,"lng":-72.73791918},{"lat":2.73513234,"lng":-72.73765214},{"lat":2.73500217,"lng":-72.73716324},{"lat":2.73494782,"lng":-72.73703283},{"lat":2.73496189,"lng":-72.73696798},{"lat":2.73498534,"lng":-72.73686952},{"lat":2.73493681,"lng":-72.73632272},{"lat":2.73490523,"lng":-72.7361876},{"lat":2.73485337,"lng":-72.73617281},{"lat":2.73480311,"lng":-72.73619084},{"lat":2.73461379,"lng":-72.73619495},{"lat":2.73458236,"lng":-72.73618718},{"lat":2.73451002,"lng":-72.73612398},{"lat":2.73444784,"lng":-72.73602327},{"lat":2.73440294,"lng":-72.73591317},{"lat":2.73439815,"lng":-72.73584208},{"lat":2.73444204,"lng":-72.73575297},{"lat":2.73448126,"lng":-72.73570293},{"lat":2.73453073,"lng":-72.7356771},{"lat":2.73465249,"lng":-72.73567384},{"lat":2.7347059,"lng":-72.73567143},{"lat":2.73475618,"lng":-72.73566669},{"lat":2.73478285,"lng":-72.73563307},{"lat":2.73478671,"lng":-72.73557213},{"lat":2.73481415,"lng":-72.73552366},{"lat":2.73482901,"lng":-72.73546896},{"lat":2.73476528,"lng":-72.73538154},{"lat":2.73471333,"lng":-72.73528707},{"lat":2.73468656,"lng":-72.73523163},{"lat":2.734699,"lng":-72.73512068},{"lat":2.73471386,"lng":-72.73506598},{"lat":2.73467218,"lng":-72.73502072},{"lat":2.73463917,"lng":-72.73500669},{"lat":2.73460695,"lng":-72.73499423}]},{"finca":"FINCA 3","lote":"43B","poligono":[{"lat":2.73296079,"lng":-72.73743218},{"lat":2.7328235,"lng":-72.73726291},{"lat":2.7326956,"lng":-72.73713132},{"lat":2.73260244,"lng":-72.73703982},{"lat":2.73246267,"lng":-72.73695247},{"lat":2.73238189,"lng":-72.7368323},{"lat":2.73224252,"lng":-72.73674075},{"lat":2.73215306,"lng":-72.73667717},{"lat":2.73202481,"lng":-72.73646074},{"lat":2.73195551,"lng":-72.73636911},{"lat":2.73145441,"lng":-72.73590585},{"lat":2.7312693,"lng":-72.73573179},{"lat":2.73120888,"lng":-72.73566226},{"lat":2.73114949,"lng":-72.73560234},{"lat":2.73106177,"lng":-72.7354771},{"lat":2.73104613,"lng":-72.73546002},{"lat":2.73085622,"lng":-72.73533748},{"lat":2.73082867,"lng":-72.73533519},{"lat":2.73078948,"lng":-72.73538979},{"lat":2.73071578,"lng":-72.73546395},{"lat":2.73065967,"lng":-72.73548605},{"lat":2.72971791,"lng":-72.73639096},{"lat":2.72946383,"lng":-72.73651171},{"lat":2.7293581,"lng":-72.73675511},{"lat":2.72929444,"lng":-72.7369709},{"lat":2.72937591,"lng":-72.73707366},{"lat":2.72965574,"lng":-72.73708038},{"lat":2.72968222,"lng":-72.73700052},{"lat":2.73027477,"lng":-72.73700977},{"lat":2.73028767,"lng":-72.73695359},{"lat":2.73048907,"lng":-72.73692156},{"lat":2.73081371,"lng":-72.73695238},{"lat":2.73092607,"lng":-72.73697501},{"lat":2.73095771,"lng":-72.73700782},{"lat":2.73096382,"lng":-72.73704965},{"lat":2.73096004,"lng":-72.7370745},{"lat":2.73090839,"lng":-72.73709743},{"lat":2.73137495,"lng":-72.73786176},{"lat":2.73217436,"lng":-72.73868279},{"lat":2.73222892,"lng":-72.73867859},{"lat":2.73296079,"lng":-72.73743218}]},{"finca":"FINCA 3","lote":"42","poligono":[{"lat":2.73720385,"lng":-72.73059929},{"lat":2.73735373,"lng":-72.73063848},{"lat":2.73740701,"lng":-72.73066919},{"lat":2.73745453,"lng":-72.73069781},{"lat":2.73749549,"lng":-72.73074012},{"lat":2.73758129,"lng":-72.73087036},{"lat":2.73853786,"lng":-72.73262602},{"lat":2.73851825,"lng":-72.73267342},{"lat":2.73713549,"lng":-72.73500571},{"lat":2.73759737,"lng":-72.73586004},{"lat":2.73776058,"lng":-72.73615604},{"lat":2.7379502,"lng":-72.73643503},{"lat":2.73798899,"lng":-72.73647047},{"lat":2.73802555,"lng":-72.73652705},{"lat":2.73813086,"lng":-72.73659101},{"lat":2.7382903,"lng":-72.73657956},{"lat":2.7383287,"lng":-72.73652857},{"lat":2.73837662,"lng":-72.73645495},{"lat":2.73841359,"lng":-72.7363407},{"lat":2.73856581,"lng":-72.73624043},{"lat":2.73857641,"lng":-72.73621809},{"lat":2.73859988,"lng":-72.73616486},{"lat":2.73861399,"lng":-72.736108},{"lat":2.73859797,"lng":-72.73596196},{"lat":2.73857894,"lng":-72.73587001},{"lat":2.73857193,"lng":-72.73583613},{"lat":2.73858102,"lng":-72.73575507},{"lat":2.73862211,"lng":-72.73567907},{"lat":2.73860769,"lng":-72.73559349},{"lat":2.73860856,"lng":-72.73552168},{"lat":2.73862738,"lng":-72.73545578},{"lat":2.7386753,"lng":-72.73536501},{"lat":2.73872433,"lng":-72.73531513},{"lat":2.73878681,"lng":-72.73528368},{"lat":2.73881157,"lng":-72.73531997},{"lat":2.73884287,"lng":-72.73535972},{"lat":2.73884036,"lng":-72.73539908},{"lat":2.73877366,"lng":-72.73552774},{"lat":2.73873808,"lng":-72.73561321},{"lat":2.73875325,"lng":-72.73564239},{"lat":2.73877275,"lng":-72.73571331},{"lat":2.7387858,"lng":-72.73579968},{"lat":2.73880866,"lng":-72.73589664},{"lat":2.73883965,"lng":-72.73593702},{"lat":2.73885178,"lng":-72.73600542},{"lat":2.73881633,"lng":-72.73604432},{"lat":2.73883951,"lng":-72.73607792},{"lat":2.73880716,"lng":-72.7362157},{"lat":2.73880937,"lng":-72.73624601},{"lat":2.73883949,"lng":-72.73635234},{"lat":2.73896272,"lng":-72.73643305},{"lat":2.7390506,"lng":-72.73646551},{"lat":2.73914764,"lng":-72.73646381},{"lat":2.73928549,"lng":-72.73623281},{"lat":2.73948186,"lng":-72.73622087},{"lat":2.73983139,"lng":-72.73613521},{"lat":2.74028032,"lng":-72.73601761},{"lat":2.74042817,"lng":-72.73597221},{"lat":2.74050704,"lng":-72.73592682},{"lat":2.74065827,"lng":-72.73578741},{"lat":2.74074845,"lng":-72.73563982},{"lat":2.74078932,"lng":-72.73556032},{"lat":2.740844,"lng":-72.73544219},{"lat":2.74089568,"lng":-72.73530954},{"lat":2.74088868,"lng":-72.73520706},{"lat":2.74093395,"lng":-72.73513045},{"lat":2.74108636,"lng":-72.73489016},{"lat":2.74098369,"lng":-72.73459993},{"lat":2.74096488,"lng":-72.73447717},{"lat":2.74097497,"lng":-72.7344181},{"lat":2.74100331,"lng":-72.73439818},{"lat":2.74099187,"lng":-72.73428651},{"lat":2.74109666,"lng":-72.73406733},{"lat":2.74120888,"lng":-72.73395759},{"lat":2.74127144,"lng":-72.73378438},{"lat":2.74133556,"lng":-72.73373392},{"lat":2.74148943,"lng":-72.73361466},{"lat":2.74149534,"lng":-72.73355619},{"lat":2.74151961,"lng":-72.73348716},{"lat":2.74155318,"lng":-72.73344347},{"lat":2.7416076,"lng":-72.73340131},{"lat":2.74165956,"lng":-72.7333705},{"lat":2.74171735,"lng":-72.73333723},{"lat":2.74176988,"lng":-72.73326998},{"lat":2.74177536,"lng":-72.73323884},{"lat":2.74174055,"lng":-72.73318216},{"lat":2.74177433,"lng":-72.7330905},{"lat":2.74180558,"lng":-72.73301474},{"lat":2.74185135,"lng":-72.73297485},{"lat":2.7418924,"lng":-72.7328754},{"lat":2.74193518,"lng":-72.73278984},{"lat":2.74194567,"lng":-72.73268857},{"lat":2.74199452,"lng":-72.7326415},{"lat":2.74202479,"lng":-72.73261866},{"lat":2.74202154,"lng":-72.7325772},{"lat":2.74205145,"lng":-72.73252568},{"lat":2.74209735,"lng":-72.73250784},{"lat":2.74152359,"lng":-72.73218955},{"lat":2.74046797,"lng":-72.73160795},{"lat":2.74012035,"lng":-72.7314154},{"lat":2.73915413,"lng":-72.73087666},{"lat":2.73812254,"lng":-72.73030515},{"lat":2.73758873,"lng":-72.73002119},{"lat":2.73751306,"lng":-72.72999254},{"lat":2.73717329,"lng":-72.73057175},{"lat":2.73720385,"lng":-72.73059929}]},{"finca":"FINCA 3","lote":"48","poligono":[{"lat":2.72678253,"lng":-72.74346861},{"lat":2.72667129,"lng":-72.74370816},{"lat":2.72481183,"lng":-72.74686398},{"lat":2.72477635,"lng":-72.74690524},{"lat":2.72470135,"lng":-72.74689943},{"lat":2.72457909,"lng":-72.74698788},{"lat":2.72243325,"lng":-72.7481756},{"lat":2.7236572,"lng":-72.75030556},{"lat":2.72377557,"lng":-72.75026618},{"lat":2.72385738,"lng":-72.75018563},{"lat":2.72399251,"lng":-72.75014034},{"lat":2.72406545,"lng":-72.75006667},{"lat":2.72415107,"lng":-72.74986247},{"lat":2.72420515,"lng":-72.74968578},{"lat":2.72429588,"lng":-72.74964742},{"lat":2.72440345,"lng":-72.74965417},{"lat":2.72449912,"lng":-72.74961383},{"lat":2.72461529,"lng":-72.74937624},{"lat":2.72459745,"lng":-72.74930855},{"lat":2.72462302,"lng":-72.74923002},{"lat":2.72459926,"lng":-72.74916038},{"lat":2.72478458,"lng":-72.74898453},{"lat":2.72483089,"lng":-72.74893051},{"lat":2.72499765,"lng":-72.74892836},{"lat":2.72511899,"lng":-72.7489037},{"lat":2.72521365,"lng":-72.74883883},{"lat":2.72522636,"lng":-72.74873676},{"lat":2.72524302,"lng":-72.74863469},{"lat":2.72519851,"lng":-72.74853465},{"lat":2.72515207,"lng":-72.74847681},{"lat":2.725082,"lng":-72.74846315},{"lat":2.72503262,"lng":-72.74842788},{"lat":2.72487471,"lng":-72.74840548},{"lat":2.72458721,"lng":-72.74808002},{"lat":2.72453877,"lng":-72.74799863},{"lat":2.72446855,"lng":-72.74785053},{"lat":2.72446749,"lng":-72.74778773},{"lat":2.72455124,"lng":-72.74767676},{"lat":2.72459661,"lng":-72.7476561},{"lat":2.72485324,"lng":-72.74772451},{"lat":2.72504573,"lng":-72.74779593},{"lat":2.72514936,"lng":-72.74781348},{"lat":2.7252411,"lng":-72.74779179},{"lat":2.725319,"lng":-72.74773773},{"lat":2.72537128,"lng":-72.74772688},{"lat":2.72546306,"lng":-72.74773758},{"lat":2.72550953,"lng":-72.74782388},{"lat":2.72553327,"lng":-72.74787291},{"lat":2.72552646,"lng":-72.74795927},{"lat":2.72580216,"lng":-72.74832204},{"lat":2.7258673,"lng":-72.74833374},{"lat":2.72591857,"lng":-72.74829836},{"lat":2.72594998,"lng":-72.74814328},{"lat":2.72604663,"lng":-72.74809804},{"lat":2.72613925,"lng":-72.74798019},{"lat":2.72615692,"lng":-72.74789382},{"lat":2.72623785,"lng":-72.74790943},{"lat":2.72638362,"lng":-72.74767376},{"lat":2.7263717,"lng":-72.74759528},{"lat":2.72635586,"lng":-72.74754819},{"lat":2.72620181,"lng":-72.74744435},{"lat":2.726184,"lng":-72.74740119},{"lat":2.72617209,"lng":-72.7473384},{"lat":2.72617201,"lng":-72.74726972},{"lat":2.72638314,"lng":-72.74724005},{"lat":2.72664759,"lng":-72.74724368},{"lat":2.7266712,"lng":-72.74717497},{"lat":2.72663555,"lng":-72.74705725},{"lat":2.72648532,"lng":-72.74683958},{"lat":2.72644573,"lng":-72.74673561},{"lat":2.72651673,"lng":-72.74669431},{"lat":2.72659571,"lng":-72.74672955},{"lat":2.72674601,"lng":-72.74700807},{"lat":2.72673819,"lng":-72.74708069},{"lat":2.72677775,"lng":-72.74716307},{"lat":2.72679362,"lng":-72.74722978},{"lat":2.7267801,"lng":-72.7474967},{"lat":2.72686499,"lng":-72.74752801},{"lat":2.72691231,"lng":-72.74748871},{"lat":2.72700105,"lng":-72.74742777},{"lat":2.72710154,"lng":-72.74728047},{"lat":2.72715283,"lng":-72.74726668},{"lat":2.72741332,"lng":-72.74725658},{"lat":2.72747246,"lng":-72.74719371},{"lat":2.72770525,"lng":-72.74711888},{"lat":2.72791447,"lng":-72.74715005},{"lat":2.72808433,"lng":-72.74727743},{"lat":2.72811201,"lng":-72.74732548},{"lat":2.72831136,"lng":-72.74734194},{"lat":2.72844153,"lng":-72.74727115},{"lat":2.72846712,"lng":-72.74721224},{"lat":2.72851039,"lng":-72.7470807},{"lat":2.72871954,"lng":-72.74704711},{"lat":2.72882776,"lng":-72.74675654},{"lat":2.72827116,"lng":-72.74579845},{"lat":2.72797267,"lng":-72.74535721},{"lat":2.72764451,"lng":-72.7448532},{"lat":2.72737175,"lng":-72.74448258},{"lat":2.72678253,"lng":-72.74346861}]},{"finca":"FINCA 3","lote":"43A","poligono":[{"lat":2.73126871,"lng":-72.73769626},{"lat":2.73090739,"lng":-72.7370976},{"lat":2.73078847,"lng":-72.73708547},{"lat":2.73070377,"lng":-72.73722588},{"lat":2.73051433,"lng":-72.73723492},{"lat":2.73010277,"lng":-72.73715492},{"lat":2.72986603,"lng":-72.73722583},{"lat":2.72980493,"lng":-72.7372936},{"lat":2.72962041,"lng":-72.7372997},{"lat":2.72955535,"lng":-72.73735276},{"lat":2.72947841,"lng":-72.73738228},{"lat":2.72938484,"lng":-72.73753055},{"lat":2.72921033,"lng":-72.73765635},{"lat":2.72921337,"lng":-72.737727},{"lat":2.7290922,"lng":-72.73790572},{"lat":2.72900933,"lng":-72.73792544},{"lat":2.72889306,"lng":-72.73807276},{"lat":2.72882499,"lng":-72.73808363},{"lat":2.72874031,"lng":-72.73824367},{"lat":2.72865954,"lng":-72.73837034},{"lat":2.72858256,"lng":-72.7383557},{"lat":2.72836192,"lng":-72.73871215},{"lat":2.72823664,"lng":-72.73874074},{"lat":2.72815865,"lng":-72.73871041},{"lat":2.72801269,"lng":-72.73878024},{"lat":2.72798116,"lng":-72.73881854},{"lat":2.72802147,"lng":-72.74133446},{"lat":2.7281604,"lng":-72.74115277},{"lat":2.72825403,"lng":-72.74105553},{"lat":2.72976629,"lng":-72.73935577},{"lat":2.73010135,"lng":-72.73897467},{"lat":2.7303319,"lng":-72.7386663},{"lat":2.73052899,"lng":-72.73843647},{"lat":2.73081382,"lng":-72.73813196},{"lat":2.73103561,"lng":-72.73792859},{"lat":2.73126871,"lng":-72.73769626}]},{"finca":"FINCA 3","lote":"58","poligono":[{"lat":2.73127222,"lng":-72.73774091},{"lat":2.73076954,"lng":-72.73823798},{"lat":2.73069955,"lng":-72.73830577},{"lat":2.73058621,"lng":-72.73842659},{"lat":2.73049358,"lng":-72.73853169},{"lat":2.73044726,"lng":-72.73858669},{"lat":2.73031819,"lng":-72.73875267},{"lat":2.73044282,"lng":-72.73902336},{"lat":2.73051799,"lng":-72.73918715},{"lat":2.73062963,"lng":-72.7393087},{"lat":2.73083399,"lng":-72.73940169},{"lat":2.73089521,"lng":-72.73944088},{"lat":2.7309476,"lng":-72.73952128},{"lat":2.73095657,"lng":-72.73959683},{"lat":2.73113853,"lng":-72.73995381},{"lat":2.73123931,"lng":-72.74007832},{"lat":2.73125321,"lng":-72.74015092},{"lat":2.73124439,"lng":-72.74020392},{"lat":2.73121582,"lng":-72.74024909},{"lat":2.73094688,"lng":-72.74064483},{"lat":2.73090553,"lng":-72.74072142},{"lat":2.73087009,"lng":-72.74079603},{"lat":2.73089977,"lng":-72.74087058},{"lat":2.73093039,"lng":-72.74089704},{"lat":2.73100946,"lng":-72.74100881},{"lat":2.73102231,"lng":-72.74103628},{"lat":2.7311329,"lng":-72.74109699},{"lat":2.73123465,"lng":-72.74119991},{"lat":2.7313058,"lng":-72.74129404},{"lat":2.73140168,"lng":-72.74144603},{"lat":2.73142445,"lng":-72.74151567},{"lat":2.73146005,"lng":-72.7415853},{"lat":2.73150745,"lng":-72.74161076},{"lat":2.73154111,"lng":-72.74171474},{"lat":2.73158163,"lng":-72.74177259},{"lat":2.73167145,"lng":-72.74179702},{"lat":2.73176223,"lng":-72.741793},{"lat":2.73185899,"lng":-72.74184784},{"lat":2.7319044,"lng":-72.74186447},{"lat":2.73211266,"lng":-72.74191723},{"lat":2.732232,"lng":-72.74186215},{"lat":2.73232463,"lng":-72.74175607},{"lat":2.73234134,"lng":-72.74169619},{"lat":2.7323689,"lng":-72.74163238},{"lat":2.73240732,"lng":-72.74157935},{"lat":2.73242804,"lng":-72.74158031},{"lat":2.73247728,"lng":-72.74148605},{"lat":2.73253931,"lng":-72.74136823},{"lat":2.73270382,"lng":-72.74111881},{"lat":2.73272845,"lng":-72.74108934},{"lat":2.73282219,"lng":-72.7410912},{"lat":2.7328764,"lng":-72.74102932},{"lat":2.73306684,"lng":-72.741035},{"lat":2.733132,"lng":-72.74105946},{"lat":2.7332721,"lng":-72.74105145},{"lat":2.73332141,"lng":-72.74102294},{"lat":2.73335292,"lng":-72.74096305},{"lat":2.73338442,"lng":-72.74089236},{"lat":2.73352558,"lng":-72.74094814},{"lat":2.73358085,"lng":-72.74095298},{"lat":2.73372778,"lng":-72.74087628},{"lat":2.73376622,"lng":-72.74083797},{"lat":2.73379577,"lng":-72.74078397},{"lat":2.73381349,"lng":-72.74075451},{"lat":2.73379269,"lng":-72.7406829},{"lat":2.7337581,"lng":-72.74063191},{"lat":2.73374817,"lng":-72.74057893},{"lat":2.73375893,"lng":-72.74049355},{"lat":2.73376775,"lng":-72.74044055},{"lat":2.73374501,"lng":-72.74040133},{"lat":2.73364628,"lng":-72.7403455},{"lat":2.73359,"lng":-72.7403122},{"lat":2.73350207,"lng":-72.74022202},{"lat":2.73342603,"lng":-72.74016029},{"lat":2.73331842,"lng":-72.74011331},{"lat":2.73321671,"lng":-72.74004375},{"lat":2.73318704,"lng":-72.73998589},{"lat":2.73320855,"lng":-72.73981218},{"lat":2.7332351,"lng":-72.73972776},{"lat":2.7328015,"lng":-72.73935634},{"lat":2.73226309,"lng":-72.7387878},{"lat":2.7321643,"lng":-72.73868193},{"lat":2.73136905,"lng":-72.73785757},{"lat":2.73127222,"lng":-72.73774091}]},{"finca":"FINCA 3","lote":"46","poligono":[{"lat":2.73027535,"lng":-72.73882827},{"lat":2.72998222,"lng":-72.73917477},{"lat":2.72978021,"lng":-72.7393974},{"lat":2.72953354,"lng":-72.73968003},{"lat":2.72904797,"lng":-72.74023949},{"lat":2.72834774,"lng":-72.74101096},{"lat":2.72808747,"lng":-72.74130521},{"lat":2.72785742,"lng":-72.74167389},{"lat":2.72708389,"lng":-72.74298695},{"lat":2.72679463,"lng":-72.74344272},{"lat":2.72764113,"lng":-72.74478977},{"lat":2.72772674,"lng":-72.74481675},{"lat":2.72820992,"lng":-72.74560722},{"lat":2.72831887,"lng":-72.74564191},{"lat":2.72882453,"lng":-72.74652906},{"lat":2.72893247,"lng":-72.74653668},{"lat":2.72906959,"lng":-72.7465491},{"lat":2.72915312,"lng":-72.74645714},{"lat":2.7293048,"lng":-72.74644537},{"lat":2.72947762,"lng":-72.74621407},{"lat":2.72945612,"lng":-72.74611642},{"lat":2.72968028,"lng":-72.7456965},{"lat":2.72966241,"lng":-72.74537355},{"lat":2.7297284,"lng":-72.7452526},{"lat":2.72981,"lng":-72.74518095},{"lat":2.72998179,"lng":-72.74488583},{"lat":2.73018563,"lng":-72.74456263},{"lat":2.73033416,"lng":-72.74434006},{"lat":2.73037585,"lng":-72.74423074},{"lat":2.73034463,"lng":-72.74413601},{"lat":2.73055333,"lng":-72.7438099},{"lat":2.73051724,"lng":-72.74371421},{"lat":2.73057932,"lng":-72.74357876},{"lat":2.73061721,"lng":-72.74354777},{"lat":2.73068416,"lng":-72.74341812},{"lat":2.7307823,"lng":-72.74335129},{"lat":2.73086101,"lng":-72.74329899},{"lat":2.73110399,"lng":-72.74320009},{"lat":2.73125757,"lng":-72.74314867},{"lat":2.7312828,"lng":-72.74309835},{"lat":2.73134788,"lng":-72.7430364},{"lat":2.73142271,"lng":-72.74299957},{"lat":2.73146444,"lng":-72.74292409},{"lat":2.73153927,"lng":-72.7428805},{"lat":2.73161892,"lng":-72.74280692},{"lat":2.73168101,"lng":-72.74267727},{"lat":2.73166831,"lng":-72.74262507},{"lat":2.7314452,"lng":-72.74223852},{"lat":2.73133526,"lng":-72.74217965},{"lat":2.73114142,"lng":-72.74188687},{"lat":2.73107725,"lng":-72.74188694},{"lat":2.73091358,"lng":-72.74161829},{"lat":2.73080656,"lng":-72.74156426},{"lat":2.7306995,"lng":-72.74147832},{"lat":2.7305719,"lng":-72.74128119},{"lat":2.73054159,"lng":-72.74113521},{"lat":2.73044995,"lng":-72.74092354},{"lat":2.73049739,"lng":-72.74073492},{"lat":2.73047106,"lng":-72.7406721},{"lat":2.73037961,"lng":-72.74063158},{"lat":2.73028432,"lng":-72.74063169},{"lat":2.73019847,"lng":-72.74038423},{"lat":2.73023538,"lng":-72.74034938},{"lat":2.73032081,"lng":-72.74022551},{"lat":2.73048214,"lng":-72.74014217},{"lat":2.73055036,"lng":-72.74027748},{"lat":2.7306128,"lng":-72.74047081},{"lat":2.73067088,"lng":-72.74045526},{"lat":2.73072524,"lng":-72.74053861},{"lat":2.73071348,"lng":-72.74060829},{"lat":2.73074808,"lng":-72.74066713},{"lat":2.73078858,"lng":-72.74070339},{"lat":2.73084287,"lng":-72.7407259},{"lat":2.73085771,"lng":-72.74075729},{"lat":2.73097096,"lng":-72.74055796},{"lat":2.73121919,"lng":-72.74017009},{"lat":2.73121619,"lng":-72.74013869},{"lat":2.73082464,"lng":-72.73942084},{"lat":2.73059562,"lng":-72.73933278},{"lat":2.73027535,"lng":-72.73882827},{"lat":2.73043501,"lng":-72.73910334},{"lat":2.73027535,"lng":-72.73882827}]},{"finca":"FINCA 3","lote":"47","poligono":[{"lat":2.72796217,"lng":-72.74142816},{"lat":2.72794158,"lng":-72.74040704},{"lat":2.72791029,"lng":-72.74025815},{"lat":2.72789969,"lng":-72.739472},{"lat":2.72792063,"lng":-72.73906681},{"lat":2.72795346,"lng":-72.7388579},{"lat":2.72789312,"lng":-72.73881446},{"lat":2.72763172,"lng":-72.7389685},{"lat":2.72742861,"lng":-72.73907509},{"lat":2.72736446,"lng":-72.7391003},{"lat":2.72726918,"lng":-72.73910621},{"lat":2.72713603,"lng":-72.73917211},{"lat":2.7270622,"lng":-72.73923795},{"lat":2.72666937,"lng":-72.73924999},{"lat":2.72659456,"lng":-72.73930325},{"lat":2.72650802,"lng":-72.73930722},{"lat":2.72646434,"lng":-72.73937979},{"lat":2.72625538,"lng":-72.73947188},{"lat":2.72620872,"lng":-72.73948064},{"lat":2.72614557,"lng":-72.73953293},{"lat":2.72598318,"lng":-72.73953504},{"lat":2.72597546,"lng":-72.73958533},{"lat":2.72590253,"lng":-72.73958445},{"lat":2.72574989,"lng":-72.73960879},{"lat":2.72565175,"lng":-72.73967562},{"lat":2.72559832,"lng":-72.73972016},{"lat":2.72555846,"lng":-72.73972794},{"lat":2.72525334,"lng":-72.73991491},{"lat":2.72522712,"lng":-72.73994684},{"lat":2.7251659,"lng":-72.73997979},{"lat":2.72509403,"lng":-72.7400611},{"lat":2.7249347,"lng":-72.74018118},{"lat":2.72490374,"lng":-72.74032143},{"lat":2.72489706,"lng":-72.74043941},{"lat":2.72487669,"lng":-72.74048778},{"lat":2.72489619,"lng":-72.7405303},{"lat":2.72494001,"lng":-72.74059021},{"lat":2.724943,"lng":-72.74065403},{"lat":2.72498096,"lng":-72.74068299},{"lat":2.72500642,"lng":-72.74084349},{"lat":2.72495784,"lng":-72.74087835},{"lat":2.7249307,"lng":-72.74095864},{"lat":2.7248862,"lng":-72.74116079},{"lat":2.72485807,"lng":-72.74123045},{"lat":2.72476679,"lng":-72.74133885},{"lat":2.72473281,"lng":-72.7413853},{"lat":2.72471828,"lng":-72.74144044},{"lat":2.72468726,"lng":-72.74152073},{"lat":2.7246669,"lng":-72.74157587},{"lat":2.72458725,"lng":-72.74165719},{"lat":2.72444654,"lng":-72.74190876},{"lat":2.72441737,"lng":-72.74191556},{"lat":2.72438642,"lng":-72.74206354},{"lat":2.72423781,"lng":-72.74221069},{"lat":2.72418249,"lng":-72.74231035},{"lat":2.72427886,"lng":-72.74239631},{"lat":2.72437522,"lng":-72.74248129},{"lat":2.72444819,"lng":-72.74251989},{"lat":2.72451237,"lng":-72.74251692},{"lat":2.72459513,"lng":-72.7426174},{"lat":2.72456117,"lng":-72.74268029},{"lat":2.72447949,"lng":-72.74268231},{"lat":2.72440752,"lng":-72.74267176},{"lat":2.7243035,"lng":-72.74269798},{"lat":2.72420026,"lng":-72.74254434},{"lat":2.72414291,"lng":-72.74256084},{"lat":2.7240866,"lng":-72.74264697},{"lat":2.72402454,"lng":-72.74279885},{"lat":2.72404695,"lng":-72.74283944},{"lat":2.72400911,"lng":-72.74291394},{"lat":2.72401889,"lng":-72.74296518},{"lat":2.72400539,"lng":-72.74307157},{"lat":2.72388015,"lng":-72.74324866},{"lat":2.7237802,"lng":-72.74343153},{"lat":2.72372671,"lng":-72.74342289},{"lat":2.72357526,"lng":-72.74364256},{"lat":2.72343254,"lng":-72.74384192},{"lat":2.72344726,"lng":-72.74396084},{"lat":2.72350663,"lng":-72.74400623},{"lat":2.72355336,"lng":-72.74406419},{"lat":2.723606,"lng":-72.74417631},{"lat":2.72354773,"lng":-72.74424696},{"lat":2.72357313,"lng":-72.7443504},{"lat":2.72353332,"lng":-72.74440363},{"lat":2.72343222,"lng":-72.74442501},{"lat":2.72341671,"lng":-72.74447241},{"lat":2.72344404,"lng":-72.74456521},{"lat":2.72362797,"lng":-72.74469652},{"lat":2.72374098,"lng":-72.74488689},{"lat":2.72371963,"lng":-72.74492656},{"lat":2.72372162,"lng":-72.74496718},{"lat":2.72376643,"lng":-72.74504062},{"lat":2.72377913,"lng":-72.74509476},{"lat":2.72372677,"lng":-72.74522342},{"lat":2.72375114,"lng":-72.74528142},{"lat":2.72373953,"lng":-72.74533751},{"lat":2.72370071,"lng":-72.74540428},{"lat":2.72359084,"lng":-72.7454102},{"lat":2.72353729,"lng":-72.74535127},{"lat":2.72347992,"lng":-72.74534747},{"lat":2.72340512,"lng":-72.74541234},{"lat":2.72327869,"lng":-72.74540378},{"lat":2.7232339,"lng":-72.74534774},{"lat":2.72318817,"lng":-72.74532361},{"lat":2.72302088,"lng":-72.74528705},{"lat":2.72295572,"lng":-72.74528036},{"lat":2.72313589,"lng":-72.74553157},{"lat":2.72408288,"lng":-72.74717055},{"lat":2.72412762,"lng":-72.7471821},{"lat":2.72474177,"lng":-72.74681301},{"lat":2.7247929,"lng":-72.74674333},{"lat":2.72779712,"lng":-72.74165751},{"lat":2.72796217,"lng":-72.74142816}]},{"finca":"FINCA 3","lote":"49","poligono":[{"lat":2.72401875,"lng":-72.74721091},{"lat":2.72401418,"lng":-72.74718255},{"lat":2.72290741,"lng":-72.74526397},{"lat":2.72287563,"lng":-72.74525047},{"lat":2.72276091,"lng":-72.74527058},{"lat":2.72273497,"lng":-72.74526029},{"lat":2.72266887,"lng":-72.74528422},{"lat":2.7224732,"lng":-72.74537275},{"lat":2.72219589,"lng":-72.7455123},{"lat":2.7221765,"lng":-72.74556003},{"lat":2.72205857,"lng":-72.74560528},{"lat":2.7219795,"lng":-72.74562729},{"lat":2.72191336,"lng":-72.74561318},{"lat":2.72176307,"lng":-72.74570102},{"lat":2.72170227,"lng":-72.74582744},{"lat":2.72156743,"lng":-72.74582243},{"lat":2.72151952,"lng":-72.74587921},{"lat":2.7214664,"lng":-72.74591408},{"lat":2.72092838,"lng":-72.74595077},{"lat":2.72064186,"lng":-72.74596398},{"lat":2.7203918,"lng":-72.74611639},{"lat":2.72017933,"lng":-72.74625587},{"lat":2.7200809,"lng":-72.74634752},{"lat":2.72005114,"lng":-72.74640815},{"lat":2.72004475,"lng":-72.7464881},{"lat":2.72004095,"lng":-72.74657448},{"lat":2.72004493,"lng":-72.74665571},{"lat":2.72011642,"lng":-72.74681292},{"lat":2.72019438,"lng":-72.74696627},{"lat":2.72018794,"lng":-72.74700624},{"lat":2.72001184,"lng":-72.74721402},{"lat":2.7199548,"lng":-72.74721408},{"lat":2.71990036,"lng":-72.74723348},{"lat":2.71934932,"lng":-72.74720959},{"lat":2.71927155,"lng":-72.74723546},{"lat":2.71923525,"lng":-72.74723679},{"lat":2.71919632,"lng":-72.74720073},{"lat":2.71915871,"lng":-72.74719948},{"lat":2.71906934,"lng":-72.74727565},{"lat":2.71897084,"lng":-72.74730541},{"lat":2.71892809,"lng":-72.7473364},{"lat":2.71885808,"lng":-72.74734679},{"lat":2.71880755,"lng":-72.74737263},{"lat":2.7185249,"lng":-72.74736907},{"lat":2.71840568,"lng":-72.74741949},{"lat":2.71830714,"lng":-72.7474196},{"lat":2.71824106,"lng":-72.74745577},{"lat":2.71820999,"lng":-72.74749448},{"lat":2.718127,"lng":-72.74748555},{"lat":2.7180972,"lng":-72.74750621},{"lat":2.71803497,"lng":-72.7475037},{"lat":2.71798707,"lng":-72.74757466},{"lat":2.71791063,"lng":-72.74762374},{"lat":2.71787044,"lng":-72.74762507},{"lat":2.71779131,"lng":-72.74758906},{"lat":2.71776408,"lng":-72.74758522},{"lat":2.71773561,"lng":-72.74763425},{"lat":2.71769544,"lng":-72.74764847},{"lat":2.71761636,"lng":-72.7476563},{"lat":2.71748682,"lng":-72.747757},{"lat":2.71741171,"lng":-72.74784089},{"lat":2.71725485,"lng":-72.74785525},{"lat":2.71715238,"lng":-72.7478141},{"lat":2.71699552,"lng":-72.74783232},{"lat":2.71674255,"lng":-72.7476998},{"lat":2.71644188,"lng":-72.74780972},{"lat":2.71641337,"lng":-72.74782522},{"lat":2.7159922,"lng":-72.74800619},{"lat":2.71584575,"lng":-72.74806308},{"lat":2.71580039,"lng":-72.74807602},{"lat":2.71556098,"lng":-72.74848113},{"lat":2.71548983,"lng":-72.7486269},{"lat":2.71528408,"lng":-72.74898168},{"lat":2.71511842,"lng":-72.74925262},{"lat":2.7150861,"lng":-72.7493313},{"lat":2.71503953,"lng":-72.74942676},{"lat":2.71497481,"lng":-72.74952611},{"lat":2.71494635,"lng":-72.74958029},{"lat":2.7149827,"lng":-72.74962667},{"lat":2.7194648,"lng":-72.74963853},{"lat":2.7195374,"lng":-72.74962814},{"lat":2.71960997,"lng":-72.74960227},{"lat":2.71997022,"lng":-72.74943427},{"lat":2.72399285,"lng":-72.74724446},{"lat":2.72401875,"lng":-72.74721091}]},{"finca":"FINCA 3","lote":"50","poligono":[{"lat":2.72242963,"lng":-72.748179},{"lat":2.71968032,"lng":-72.74961122},{"lat":2.7195047,"lng":-72.74966169},{"lat":2.71833072,"lng":-72.74968361},{"lat":2.71640345,"lng":-72.75293092},{"lat":2.71636569,"lng":-72.75572684},{"lat":2.71637607,"lng":-72.75573521},{"lat":2.71638584,"lng":-72.75577646},{"lat":2.71636524,"lng":-72.75590735},{"lat":2.7164016,"lng":-72.75596533},{"lat":2.71643273,"lng":-72.75597819},{"lat":2.71646776,"lng":-72.75600007},{"lat":2.71647686,"lng":-72.75602326},{"lat":2.71646397,"lng":-72.75608774},{"lat":2.71647892,"lng":-72.75612576},{"lat":2.71652825,"lng":-72.75617986},{"lat":2.716586,"lng":-72.75622621},{"lat":2.7166398,"lng":-72.75622809},{"lat":2.71668977,"lng":-72.75627445},{"lat":2.71677215,"lng":-72.75631755},{"lat":2.71681558,"lng":-72.75631557},{"lat":2.71699381,"lng":-72.75627283},{"lat":2.71706494,"lng":-72.75611094},{"lat":2.71705642,"lng":-72.75603037},{"lat":2.71709566,"lng":-72.75575312},{"lat":2.71711117,"lng":-72.75571249},{"lat":2.71708647,"lng":-72.75565063},{"lat":2.71708505,"lng":-72.75553395},{"lat":2.71718993,"lng":-72.75541393},{"lat":2.71740126,"lng":-72.75540983},{"lat":2.71748092,"lng":-72.75533754},{"lat":2.71767255,"lng":-72.7551059},{"lat":2.71773598,"lng":-72.75501043},{"lat":2.71789663,"lng":-72.75490324},{"lat":2.71791799,"lng":-72.75487291},{"lat":2.71812014,"lng":-72.75477406},{"lat":2.71824329,"lng":-72.75475652},{"lat":2.7183158,"lng":-72.75467522},{"lat":2.71842577,"lng":-72.75446107},{"lat":2.71850788,"lng":-72.75426307},{"lat":2.71859005,"lng":-72.75411277},{"lat":2.71862107,"lng":-72.75402313},{"lat":2.71864429,"lng":-72.75391996},{"lat":2.71869735,"lng":-72.75383223},{"lat":2.71872382,"lng":-72.75373615},{"lat":2.71874323,"lng":-72.75370131},{"lat":2.71875744,"lng":-72.75365553},{"lat":2.71873726,"lng":-72.75357497},{"lat":2.71872036,"lng":-72.75353179},{"lat":2.71865147,"lng":-72.75337522},{"lat":2.71865852,"lng":-72.75330494},{"lat":2.71865261,"lng":-72.75323468},{"lat":2.7186584,"lng":-72.75319922},{"lat":2.71864862,"lng":-72.7531425},{"lat":2.71860771,"lng":-72.7530813},{"lat":2.71855112,"lng":-72.7529073},{"lat":2.71857116,"lng":-72.75286022},{"lat":2.7186068,"lng":-72.752846},{"lat":2.71865745,"lng":-72.75292073},{"lat":2.71869382,"lng":-72.75298064},{"lat":2.71878403,"lng":-72.75307079},{"lat":2.71879573,"lng":-72.75309915},{"lat":2.71879774,"lng":-72.75316361},{"lat":2.71881916,"lng":-72.75318615},{"lat":2.7188679,"lng":-72.75329504},{"lat":2.71895038,"lng":-72.75343033},{"lat":2.71899318,"lng":-72.75344898},{"lat":2.71903149,"lng":-72.75350116},{"lat":2.71906008,"lng":-72.75356172},{"lat":2.71903811,"lng":-72.75362557},{"lat":2.71901353,"lng":-72.75367781},{"lat":2.71902719,"lng":-72.75371648},{"lat":2.71913483,"lng":-72.75374472},{"lat":2.71917176,"lng":-72.75372857},{"lat":2.71919764,"lng":-72.75367568},{"lat":2.71921124,"lng":-72.75366212},{"lat":2.71923713,"lng":-72.75363115},{"lat":2.71925265,"lng":-72.7535931},{"lat":2.7192286,"lng":-72.75353253},{"lat":2.71925707,"lng":-72.7534906},{"lat":2.71929074,"lng":-72.75344995},{"lat":2.71927579,"lng":-72.75341128},{"lat":2.71930818,"lng":-72.75339513},{"lat":2.71932435,"lng":-72.75336095},{"lat":2.71932164,"lng":-72.75325716},{"lat":2.71935144,"lng":-72.75323456},{"lat":2.71934421,"lng":-72.75314367},{"lat":2.71940947,"lng":-72.75295149},{"lat":2.71948524,"lng":-72.7528863},{"lat":2.71961803,"lng":-72.75278817},{"lat":2.71975391,"lng":-72.75255723},{"lat":2.71993598,"lng":-72.75247065},{"lat":2.72016937,"lng":-72.75248844},{"lat":2.72033792,"lng":-72.75248568},{"lat":2.72038904,"lng":-72.75240891},{"lat":2.72042339,"lng":-72.75240178},{"lat":2.72047389,"lng":-72.75234177},{"lat":2.7204933,"lng":-72.75230823},{"lat":2.72048403,"lng":-72.75213031},{"lat":2.72044831,"lng":-72.75206653},{"lat":2.72042221,"lng":-72.75191635},{"lat":2.72043837,"lng":-72.75187508},{"lat":2.72051294,"lng":-72.7518924},{"lat":2.72062474,"lng":-72.75216368},{"lat":2.72073373,"lng":-72.75223254},{"lat":2.72084654,"lng":-72.75224596},{"lat":2.72087442,"lng":-72.75225431},{"lat":2.72092445,"lng":-72.75235804},{"lat":2.72102055,"lng":-72.75249461},{"lat":2.72110101,"lng":-72.7525693},{"lat":2.72115811,"lng":-72.75261243},{"lat":2.72136556,"lng":-72.75262058},{"lat":2.72141735,"lng":-72.7525567},{"lat":2.72143288,"lng":-72.75252832},{"lat":2.72148721,"lng":-72.75241867},{"lat":2.72155118,"lng":-72.752231},{"lat":2.72158737,"lng":-72.75212911},{"lat":2.72161318,"lng":-72.75201369},{"lat":2.72168436,"lng":-72.75190015},{"lat":2.72175692,"lng":-72.75185881},{"lat":2.72184311,"lng":-72.75182906},{"lat":2.72190664,"lng":-72.75183157},{"lat":2.7219916,"lng":-72.75186242},{"lat":2.72203367,"lng":-72.75180951},{"lat":2.7221502,"lng":-72.75166498},{"lat":2.72231294,"lng":-72.7516835},{"lat":2.72233619,"lng":-72.75160869},{"lat":2.72252222,"lng":-72.75158851},{"lat":2.72256356,"lng":-72.75145631},{"lat":2.72260759,"lng":-72.75141113},{"lat":2.72266003,"lng":-72.75134661},{"lat":2.72271309,"lng":-72.7512563},{"lat":2.72280639,"lng":-72.75120978},{"lat":2.72292745,"lng":-72.75106331},{"lat":2.723013,"lng":-72.75103872},{"lat":2.72304728,"lng":-72.75097679},{"lat":2.72306344,"lng":-72.75093036},{"lat":2.72309713,"lng":-72.75090841},{"lat":2.72312754,"lng":-72.75086002},{"lat":2.72315341,"lng":-72.75080713},{"lat":2.72317537,"lng":-72.75073233},{"lat":2.72316886,"lng":-72.75070397},{"lat":2.72314483,"lng":-72.75066532},{"lat":2.72316813,"lng":-72.75063306},{"lat":2.72320828,"lng":-72.75059756},{"lat":2.72317124,"lng":-72.75051637},{"lat":2.7231375,"lng":-72.75048546},{"lat":2.72295664,"lng":-72.75049469},{"lat":2.72290145,"lng":-72.75041481},{"lat":2.72290722,"lng":-72.75035743},{"lat":2.72293767,"lng":-72.75033805},{"lat":2.72296881,"lng":-72.75035929},{"lat":2.72301483,"lng":-72.75035667},{"lat":2.72320228,"lng":-72.75044349},{"lat":2.72324052,"lng":-72.75043507},{"lat":2.72328724,"lng":-72.75047692},{"lat":2.72337733,"lng":-72.75046651},{"lat":2.72340973,"lng":-72.75044778},{"lat":2.72347904,"lng":-72.75039742},{"lat":2.72353215,"lng":-72.75035868},{"lat":2.7235937,"lng":-72.75032315},{"lat":2.72365526,"lng":-72.7503089},{"lat":2.72242963,"lng":-72.748179}]},{"finca":"FINCA 3","lote":"51","poligono":[{"lat":2.71488583,"lng":-72.74966352},{"lat":2.71441088,"lng":-72.75045954},{"lat":2.71449583,"lng":-72.75048137},{"lat":2.71458656,"lng":-72.75046064},{"lat":2.71464557,"lng":-72.75047863},{"lat":2.71467287,"lng":-72.75053984},{"lat":2.71471054,"lng":-72.75060878},{"lat":2.71478576,"lng":-72.75062481},{"lat":2.71483768,"lng":-72.75067568},{"lat":2.71510934,"lng":-72.75071858},{"lat":2.71518716,"lng":-72.75074363},{"lat":2.71533969,"lng":-72.75090979},{"lat":2.71534688,"lng":-72.750962},{"lat":2.71529451,"lng":-72.75108905},{"lat":2.7152511,"lng":-72.75110908},{"lat":2.71517599,"lng":-72.75118846},{"lat":2.71510018,"lng":-72.75122658},{"lat":2.71499728,"lng":-72.75138205},{"lat":2.71487683,"lng":-72.75149951},{"lat":2.714779,"lng":-72.75155377},{"lat":2.71473382,"lng":-72.75158444},{"lat":2.71464313,"lng":-72.75163998},{"lat":2.71455368,"lng":-72.75165684},{"lat":2.71446174,"lng":-72.75175235},{"lat":2.71435027,"lng":-72.75178083},{"lat":2.7142141,"lng":-72.75175004},{"lat":2.71407798,"lng":-72.75176824},{"lat":2.71398074,"lng":-72.75176447},{"lat":2.71377326,"lng":-72.75173505},{"lat":2.71369676,"lng":-72.75173255},{"lat":2.71362538,"lng":-72.75166172},{"lat":2.71354632,"lng":-72.75168759},{"lat":2.71347892,"lng":-72.75170442},{"lat":2.71334154,"lng":-72.75175357},{"lat":2.71323524,"lng":-72.75177173},{"lat":2.71313161,"lng":-72.75185178},{"lat":2.71307718,"lng":-72.75187892},{"lat":2.71295923,"lng":-72.7519087},{"lat":2.71285303,"lng":-72.75200938},{"lat":2.71274031,"lng":-72.75207913},{"lat":2.71268855,"lng":-72.75217459},{"lat":2.71263023,"lng":-72.75219142},{"lat":2.71260825,"lng":-72.75224946},{"lat":2.71263832,"lng":-72.75247248},{"lat":2.71268377,"lng":-72.75254076},{"lat":2.71271005,"lng":-72.75285662},{"lat":2.71275167,"lng":-72.75298034},{"lat":2.71273492,"lng":-72.7530719},{"lat":2.71274674,"lng":-72.75321243},{"lat":2.71276507,"lng":-72.75337228},{"lat":2.71274705,"lng":-72.75349607},{"lat":2.71272768,"lng":-72.75356056},{"lat":2.71267734,"lng":-72.75376562},{"lat":2.71262298,"lng":-72.75385206},{"lat":2.71262308,"lng":-72.75394231},{"lat":2.71256522,"lng":-72.7540929},{"lat":2.71266537,"lng":-72.75437515},{"lat":2.71278986,"lng":-72.7544008},{"lat":2.71282612,"lng":-72.75435693},{"lat":2.71278708,"lng":-72.75422675},{"lat":2.71276369,"lng":-72.75418165},{"lat":2.71275317,"lng":-72.75404886},{"lat":2.712792,"lng":-72.75398435},{"lat":2.71286178,"lng":-72.75377283},{"lat":2.7129538,"lng":-72.75374565},{"lat":2.71334833,"lng":-72.75292135},{"lat":2.71355438,"lng":-72.75282701},{"lat":2.71361787,"lng":-72.752796},{"lat":2.71378386,"lng":-72.7528216},{"lat":2.71389021,"lng":-72.75285243},{"lat":2.71420007,"lng":-72.75284822},{"lat":2.71422788,"lng":-72.75278502},{"lat":2.71428818,"lng":-72.75279462},{"lat":2.71431548,"lng":-72.75286744},{"lat":2.71426242,"lng":-72.7529513},{"lat":2.71416003,"lng":-72.75298558},{"lat":2.71409721,"lng":-72.75304109},{"lat":2.71401947,"lng":-72.75308888},{"lat":2.71378911,"lng":-72.75347077},{"lat":2.71374642,"lng":-72.75355462},{"lat":2.71354836,"lng":-72.75384235},{"lat":2.71352259,"lng":-72.7539842},{"lat":2.71359278,"lng":-72.75414787},{"lat":2.71369014,"lng":-72.7542522},{"lat":2.71378341,"lng":-72.7541786},{"lat":2.71388319,"lng":-72.75413079},{"lat":2.71400763,"lng":-72.75411003},{"lat":2.71406592,"lng":-72.75405839},{"lat":2.71412423,"lng":-72.75403383},{"lat":2.71434466,"lng":-72.75405035},{"lat":2.71448604,"lng":-72.75410435},{"lat":2.71483854,"lng":-72.75396343},{"lat":2.71495006,"lng":-72.75397491},{"lat":2.71504341,"lng":-72.75397739},{"lat":2.71510059,"lng":-72.75409723},{"lat":2.71520564,"lng":-72.75412677},{"lat":2.71546785,"lng":-72.75441014},{"lat":2.71562616,"lng":-72.75453245},{"lat":2.71566255,"lng":-72.75461493},{"lat":2.71563683,"lng":-72.75480191},{"lat":2.71564212,"lng":-72.75489344},{"lat":2.71558133,"lng":-72.75503018},{"lat":2.71560217,"lng":-72.75511654},{"lat":2.71558537,"lng":-72.75516684},{"lat":2.71549606,"lng":-72.75530618},{"lat":2.71565963,"lng":-72.7554878},{"lat":2.71572848,"lng":-72.75561279},{"lat":2.71634442,"lng":-72.75569721},{"lat":2.71634155,"lng":-72.75308506},{"lat":2.71634272,"lng":-72.75297418},{"lat":2.71641777,"lng":-72.75284001},{"lat":2.71820138,"lng":-72.74972522},{"lat":2.7181953,"lng":-72.74969514},{"lat":2.71488583,"lng":-72.74966352}]},{"finca":"FINCA 3","lote":"52","poligono":[{"lat":2.71441112,"lng":-72.75042989},{"lat":2.71449392,"lng":-72.75027594},{"lat":2.71454132,"lng":-72.75014868},{"lat":2.71477944,"lng":-72.74974959},{"lat":2.71479495,"lng":-72.74970574},{"lat":2.71478713,"lng":-72.74966878},{"lat":2.71476984,"lng":-72.74966279},{"lat":2.71109202,"lng":-72.74964961},{"lat":2.71097277,"lng":-72.74967896},{"lat":2.70914805,"lng":-72.75275294},{"lat":2.70912925,"lng":-72.75295409},{"lat":2.7093056,"lng":-72.75296851},{"lat":2.70936789,"lng":-72.75301744},{"lat":2.70941382,"lng":-72.75312999},{"lat":2.70941298,"lng":-72.75315406},{"lat":2.70940355,"lng":-72.75322111},{"lat":2.70943045,"lng":-72.75331993},{"lat":2.70949708,"lng":-72.75338432},{"lat":2.70959046,"lng":-72.75341688},{"lat":2.70967531,"lng":-72.75354658},{"lat":2.70960203,"lng":-72.75371771},{"lat":2.70955283,"lng":-72.75377879},{"lat":2.70952452,"lng":-72.75396964},{"lat":2.70956097,"lng":-72.7541097},{"lat":2.70955157,"lng":-72.75420856},{"lat":2.70959312,"lng":-72.75426353},{"lat":2.70971248,"lng":-72.75433302},{"lat":2.70981208,"lng":-72.75451599},{"lat":2.70993243,"lng":-72.75469894},{"lat":2.70999306,"lng":-72.7548132},{"lat":2.70996028,"lng":-72.75487856},{"lat":2.70993354,"lng":-72.75493102},{"lat":2.70997172,"lng":-72.75506249},{"lat":2.71003836,"lng":-72.75513805},{"lat":2.71014383,"lng":-72.75515857},{"lat":2.71020685,"lng":-72.75508544},{"lat":2.71020765,"lng":-72.75502699},{"lat":2.71022749,"lng":-72.75499345},{"lat":2.71030694,"lng":-72.75492803},{"lat":2.71035879,"lng":-72.75492024},{"lat":2.71040799,"lng":-72.75485486},{"lat":2.71045553,"lng":-72.75485567},{"lat":2.71051773,"lng":-72.75482036},{"lat":2.71058778,"lng":-72.75485897},{"lat":2.7107183,"lng":-72.75485968},{"lat":2.71086411,"lng":-72.75461628},{"lat":2.71094359,"lng":-72.75458439},{"lat":2.7110948,"lng":-72.75453179},{"lat":2.71113574,"lng":-72.75443032},{"lat":2.71126314,"lng":-72.75434853},{"lat":2.71138235,"lng":-72.75427791},{"lat":2.7115497,"lng":-72.75397517},{"lat":2.7114839,"lng":-72.75387898},{"lat":2.71140089,"lng":-72.75385156},{"lat":2.71133165,"lng":-72.75376912},{"lat":2.71131778,"lng":-72.75373303},{"lat":2.71135916,"lng":-72.75363156},{"lat":2.71135727,"lng":-72.75348201},{"lat":2.71133645,"lng":-72.75341842},{"lat":2.7113312,"lng":-72.75335998},{"lat":2.71142097,"lng":-72.75324814},{"lat":2.71146755,"lng":-72.7531544},{"lat":2.71144827,"lng":-72.75291977},{"lat":2.71138931,"lng":-72.75275308},{"lat":2.71137104,"lng":-72.7526405},{"lat":2.71138997,"lng":-72.7525614},{"lat":2.71130335,"lng":-72.75239389},{"lat":2.71132569,"lng":-72.75227954},{"lat":2.71137741,"lng":-72.75214454},{"lat":2.7113583,"lng":-72.75206462},{"lat":2.71107948,"lng":-72.75161281},{"lat":2.7110034,"lng":-72.7515957},{"lat":2.71097214,"lng":-72.7514668},{"lat":2.71094262,"lng":-72.75133962},{"lat":2.71094595,"lng":-72.75122272},{"lat":2.71096481,"lng":-72.75108346},{"lat":2.71100791,"lng":-72.75098027},{"lat":2.71114268,"lng":-72.75091995},{"lat":2.71118411,"lng":-72.75086318},{"lat":2.71144514,"lng":-72.75086117},{"lat":2.71155239,"lng":-72.75092294},{"lat":2.7116769,"lng":-72.75096235},{"lat":2.71186546,"lng":-72.75108248},{"lat":2.71200386,"lng":-72.75117688},{"lat":2.71208337,"lng":-72.75116647},{"lat":2.71215951,"lng":-72.75124031},{"lat":2.71230306,"lng":-72.75129517},{"lat":2.71238941,"lng":-72.75122459},{"lat":2.71245673,"lng":-72.75113512},{"lat":2.71272111,"lng":-72.75103169},{"lat":2.71281613,"lng":-72.75097658},{"lat":2.71284196,"lng":-72.75088716},{"lat":2.71290589,"lng":-72.7508613},{"lat":2.71294211,"lng":-72.75078562},{"lat":2.71313566,"lng":-72.75072696},{"lat":2.71324283,"lng":-72.75071309},{"lat":2.71346396,"lng":-72.75058908},{"lat":2.71353131,"lng":-72.7505254},{"lat":2.71358489,"lng":-72.75051674},{"lat":2.71370583,"lng":-72.75044613},{"lat":2.71388027,"lng":-72.75031013},{"lat":2.71392872,"lng":-72.75034618},{"lat":2.71396683,"lng":-72.75042178},{"lat":2.71411215,"lng":-72.75051961},{"lat":2.71424,"lng":-72.75045586},{"lat":2.7143057,"lng":-72.75045923},{"lat":2.71441112,"lng":-72.75042989}]},{"finca":"FINCA 3","lote":"53","poligono":[{"lat":2.71486483,"lng":-72.7495836},{"lat":2.71561965,"lng":-72.7482376},{"lat":2.71574047,"lng":-72.74806642},{"lat":2.71577069,"lng":-72.7480406},{"lat":2.71579143,"lng":-72.74803284},{"lat":2.71574901,"lng":-72.74797616},{"lat":2.715704,"lng":-72.7479169},{"lat":2.71564696,"lng":-72.74792298},{"lat":2.7155164,"lng":-72.74788616},{"lat":2.71544643,"lng":-72.7479189},{"lat":2.71534617,"lng":-72.74792244},{"lat":2.71518721,"lng":-72.74799912},{"lat":2.71496608,"lng":-72.74812829},{"lat":2.71488746,"lng":-72.74815932},{"lat":2.71466182,"lng":-72.74812003},{"lat":2.71458928,"lng":-72.7481777},{"lat":2.71441469,"lng":-72.74818476},{"lat":2.71420725,"lng":-72.74819187},{"lat":2.71412256,"lng":-72.74820055},{"lat":2.71399991,"lng":-72.7482875},{"lat":2.71392387,"lng":-72.74830392},{"lat":2.71387714,"lng":-72.74825068},{"lat":2.71379325,"lng":-72.74821467},{"lat":2.71375779,"lng":-72.7481915},{"lat":2.71372487,"lng":-72.74812191},{"lat":2.71360727,"lng":-72.74808422},{"lat":2.7135744,"lng":-72.74805933},{"lat":2.71349572,"lng":-72.74803535},{"lat":2.71347838,"lng":-72.74798895},{"lat":2.71341438,"lng":-72.74795722},{"lat":2.71331051,"lng":-72.74781895},{"lat":2.71326204,"lng":-72.74776313},{"lat":2.71321005,"lng":-72.74764629},{"lat":2.71318407,"lng":-72.74759904},{"lat":2.71306294,"lng":-72.74748657},{"lat":2.71296345,"lng":-72.74740503},{"lat":2.71260996,"lng":-72.74742862},{"lat":2.71233159,"lng":-72.74739025},{"lat":2.71226246,"lng":-72.74740236},{"lat":2.71218805,"lng":-72.74733281},{"lat":2.71194516,"lng":-72.74732792},{"lat":2.71182075,"lng":-72.74737533},{"lat":2.71175503,"lng":-72.7473522},{"lat":2.71162199,"lng":-72.74741423},{"lat":2.71156327,"lng":-72.74746587},{"lat":2.71149693,"lng":-72.74766277},{"lat":2.71142703,"lng":-72.74776513},{"lat":2.7114184,"lng":-72.74777804},{"lat":2.71134235,"lng":-72.74778585},{"lat":2.71124119,"lng":-72.74775416},{"lat":2.7111624,"lng":-72.74763907},{"lat":2.71111308,"lng":-72.74758927},{"lat":2.71108275,"lng":-72.74751968},{"lat":2.7109236,"lng":-72.74741671},{"lat":2.71083112,"lng":-72.74742111},{"lat":2.71077323,"lng":-72.74744094},{"lat":2.71063152,"lng":-72.74748493},{"lat":2.71059004,"lng":-72.74748928},{"lat":2.71042752,"lng":-72.74747484},{"lat":2.71036355,"lng":-72.74746632},{"lat":2.71033418,"lng":-72.74747752},{"lat":2.71029699,"lng":-72.74746123},{"lat":2.71025892,"lng":-72.74742087},{"lat":2.71007564,"lng":-72.74738841},{"lat":2.71002465,"lng":-72.74739878},{"lat":2.71000047,"lng":-72.747416},{"lat":2.70996592,"lng":-72.7474401},{"lat":2.70994701,"lng":-72.74753381},{"lat":2.70998508,"lng":-72.74756386},{"lat":2.70991173,"lng":-72.74767997},{"lat":2.70984089,"lng":-72.74771357},{"lat":2.70981245,"lng":-72.74778838},{"lat":2.7097382,"lng":-72.7478641},{"lat":2.70965524,"lng":-72.74787365},{"lat":2.70962499,"lng":-72.74788228},{"lat":2.7096017,"lng":-72.74792614},{"lat":2.70960001,"lng":-72.74795795},{"lat":2.70957757,"lng":-72.74798805},{"lat":2.70952933,"lng":-72.74813938},{"lat":2.7095364,"lng":-72.74827948},{"lat":2.7095011,"lng":-72.74840415},{"lat":2.70953496,"lng":-72.74853648},{"lat":2.70958882,"lng":-72.74878225},{"lat":2.70952327,"lng":-72.74890954},{"lat":2.70949309,"lng":-72.74897489},{"lat":2.70945861,"lng":-72.74906432},{"lat":2.70947946,"lng":-72.74915971},{"lat":2.70941302,"lng":-72.74926293},{"lat":2.70935779,"lng":-72.74934206},{"lat":2.70931724,"lng":-72.74940915},{"lat":2.70944281,"lng":-72.74962734},{"lat":2.70932272,"lng":-72.74967217},{"lat":2.70923301,"lng":-72.74983901},{"lat":2.70919244,"lng":-72.74988719},{"lat":2.70913983,"lng":-72.74999297},{"lat":2.70908208,"lng":-72.7501383},{"lat":2.70909336,"lng":-72.75018556},{"lat":2.70905026,"lng":-72.75028703},{"lat":2.70903302,"lng":-72.75033175},{"lat":2.70906078,"lng":-72.75042025},{"lat":2.70893564,"lng":-72.75059315},{"lat":2.70886145,"lng":-72.75072818},{"lat":2.70882783,"lng":-72.75080901},{"lat":2.70886076,"lng":-72.75088891},{"lat":2.70879431,"lng":-72.75098439},{"lat":2.7087512,"lng":-72.75108157},{"lat":2.70867614,"lng":-72.75120027},{"lat":2.70852592,"lng":-72.75136976},{"lat":2.70851042,"lng":-72.75141877},{"lat":2.70851826,"lng":-72.75147033},{"lat":2.70845525,"lng":-72.75155808},{"lat":2.70829277,"lng":-72.75156685},{"lat":2.70809396,"lng":-72.75234666},{"lat":2.70821763,"lng":-72.75241271},{"lat":2.70841904,"lng":-72.75242109},{"lat":2.70929288,"lng":-72.75240811},{"lat":2.70946893,"lng":-72.75215521},{"lat":2.7096518,"lng":-72.7518112},{"lat":2.71092862,"lng":-72.7496197},{"lat":2.71096489,"lng":-72.74959216},{"lat":2.7148346,"lng":-72.74960255},{"lat":2.71486483,"lng":-72.7495836}]},{"finca":"FINCA 3","lote":"57","poligono":[{"lat":2.70807925,"lng":-72.75232863},{"lat":2.70828412,"lng":-72.75156084},{"lat":2.70823301,"lng":-72.75146463},{"lat":2.70819147,"lng":-72.75141052},{"lat":2.70816286,"lng":-72.75133835},{"lat":2.708104,"lng":-72.75125504},{"lat":2.70814703,"lng":-72.75108996},{"lat":2.70811233,"lng":-72.75097482},{"lat":2.70810707,"lng":-72.75091036},{"lat":2.70819066,"lng":-72.75067562},{"lat":2.70819491,"lng":-72.75060857},{"lat":2.70828798,"lng":-72.75036092},{"lat":2.70832591,"lng":-72.75026461},{"lat":2.70831202,"lng":-72.75021306},{"lat":2.70834737,"lng":-72.7501305},{"lat":2.70844662,"lng":-72.74999888},{"lat":2.70849836,"lng":-72.74988107},{"lat":2.70861222,"lng":-72.74967466},{"lat":2.70871666,"lng":-72.74954218},{"lat":2.70876668,"lng":-72.74943898},{"lat":2.70877356,"lng":-72.74940889},{"lat":2.70883913,"lng":-72.74929965},{"lat":2.70886753,"lng":-72.74918788},{"lat":2.70883898,"lng":-72.74916127},{"lat":2.7088838,"lng":-72.74904776},{"lat":2.70888801,"lng":-72.74894461},{"lat":2.70888531,"lng":-72.74884319},{"lat":2.70891113,"lng":-72.74874517},{"lat":2.70890668,"lng":-72.74863516},{"lat":2.70889537,"lng":-72.74856641},{"lat":2.70890649,"lng":-72.74845465},{"lat":2.70889939,"lng":-72.74829221},{"lat":2.70892083,"lng":-72.74814177},{"lat":2.70891041,"lng":-72.7480988},{"lat":2.70886973,"lng":-72.7480447},{"lat":2.70870543,"lng":-72.74797955},{"lat":2.70852898,"lng":-72.74786714},{"lat":2.70837593,"lng":-72.74781058},{"lat":2.70815975,"lng":-72.74772916},{"lat":2.70808018,"lng":-72.74768541},{"lat":2.70795657,"lng":-72.74767867},{"lat":2.70784856,"lng":-72.74770371},{"lat":2.70776302,"lng":-72.74772959},{"lat":2.7076481,"lng":-72.7477641},{"lat":2.70749953,"lng":-72.74786053},{"lat":2.70737855,"lng":-72.74788129},{"lat":2.70725753,"lng":-72.74787455},{"lat":2.70718321,"lng":-72.74788322},{"lat":2.70706037,"lng":-72.7477974},{"lat":2.70685295,"lng":-72.7478131},{"lat":2.70677426,"lng":-72.74778568},{"lat":2.70668595,"lng":-72.74764739},{"lat":2.70661151,"lng":-72.7475598},{"lat":2.7065527,"lng":-72.74752548},{"lat":2.7064628,"lng":-72.74751871},{"lat":2.70636599,"lng":-72.74751365},{"lat":2.70628121,"lng":-72.7474467},{"lat":2.7061948,"lng":-72.7474743},{"lat":2.70611705,"lng":-72.74750877},{"lat":2.70604797,"lng":-72.74757245},{"lat":2.70600316,"lng":-72.74768939},{"lat":2.70595656,"lng":-72.74775821},{"lat":2.70593238,"lng":-72.74778058},{"lat":2.70585807,"lng":-72.74780473},{"lat":2.70579243,"lng":-72.7478495},{"lat":2.70575441,"lng":-72.74786157},{"lat":2.70565241,"lng":-72.74785481},{"lat":2.70558843,"lng":-72.74783769},{"lat":2.70549157,"lng":-72.74778966},{"lat":2.70542582,"lng":-72.74773644},{"lat":2.70534801,"lng":-72.74771933},{"lat":2.70526849,"lng":-72.74771942},{"lat":2.70534477,"lng":-72.74791875},{"lat":2.70709234,"lng":-72.75092436},{"lat":2.70726352,"lng":-72.75095856},{"lat":2.70802558,"lng":-72.75226164},{"lat":2.70807925,"lng":-72.75232863}]},{"finca":"FINCA 3","lote":"56","poligono":[{"lat":2.70699809,"lng":-72.75089008},{"lat":2.70697901,"lng":-72.75083509},{"lat":2.70677635,"lng":-72.75046915},{"lat":2.7053301,"lng":-72.74794111},{"lat":2.7051665,"lng":-72.74772469},{"lat":2.70498404,"lng":-72.74764581},{"lat":2.70484231,"lng":-72.74767089},{"lat":2.704641,"lng":-72.74774589},{"lat":2.7045797,"lng":-72.74780956},{"lat":2.70437748,"lng":-72.74783643},{"lat":2.70416071,"lng":-72.74800857},{"lat":2.7040442,"lng":-72.74816599},{"lat":2.70402266,"lng":-72.74822446},{"lat":2.7040574,"lng":-72.74838344},{"lat":2.70405403,"lng":-72.74846252},{"lat":2.70401867,"lng":-72.74853218},{"lat":2.70395994,"lng":-72.74857608},{"lat":2.70388304,"lng":-72.74859851},{"lat":2.70378974,"lng":-72.74863815},{"lat":2.7037223,"lng":-72.74862619},{"lat":2.70356323,"lng":-72.7485937},{"lat":2.70335583,"lng":-72.74863691},{"lat":2.70325492,"lng":-72.74883729},{"lat":2.70321951,"lng":-72.74885795},{"lat":2.70315209,"lng":-72.74885545},{"lat":2.70288998,"lng":-72.74866578},{"lat":2.70278099,"lng":-72.74858854},{"lat":2.70261326,"lng":-72.74854746},{"lat":2.70231775,"lng":-72.74863717},{"lat":2.70195295,"lng":-72.74860319},{"lat":2.70174907,"lng":-72.74869796},{"lat":2.7015176,"lng":-72.74885293},{"lat":2.70124108,"lng":-72.74892543},{"lat":2.70118154,"lng":-72.74900887},{"lat":2.70102774,"lng":-72.74905889},{"lat":2.70099233,"lng":-72.74908557},{"lat":2.70088,"lng":-72.74912094},{"lat":2.70084635,"lng":-72.74917856},{"lat":2.70075044,"lng":-72.74920445},{"lat":2.70065794,"lng":-72.7491951},{"lat":2.70054477,"lng":-72.74924679},{"lat":2.70041168,"lng":-72.74926756},{"lat":2.70039271,"lng":-72.7493054},{"lat":2.70041093,"lng":-72.74936727},{"lat":2.70044903,"lng":-72.74942826},{"lat":2.70049411,"lng":-72.74955112},{"lat":2.70049344,"lng":-72.7497299},{"lat":2.70043736,"lng":-72.74982193},{"lat":2.70037516,"lng":-72.74985552},{"lat":2.70025438,"lng":-72.75006624},{"lat":2.70014554,"lng":-72.75012395},{"lat":2.7000549,"lng":-72.75023149},{"lat":2.69995297,"lng":-72.75028919},{"lat":2.69983631,"lng":-72.75031768},{"lat":2.69968593,"lng":-72.75032558},{"lat":2.69961418,"lng":-72.75031878},{"lat":2.69951299,"lng":-72.75026388},{"lat":2.69942472,"lng":-72.75017114},{"lat":2.69922553,"lng":-72.74981036},{"lat":2.6990544,"lng":-72.74982601},{"lat":2.69895763,"lng":-72.74985706},{"lat":2.69884019,"lng":-72.74995689},{"lat":2.69855682,"lng":-72.75008785},{"lat":2.69849115,"lng":-72.7500991},{"lat":2.69837959,"lng":-72.75004679},{"lat":2.6982956,"lng":-72.74991537},{"lat":2.69826098,"lng":-72.74987071},{"lat":2.69806047,"lng":-72.74989242},{"lat":2.697968,"lng":-72.74990885},{"lat":2.69785928,"lng":-72.75007142},{"lat":2.69779793,"lng":-72.75009039},{"lat":2.69770892,"lng":-72.75010897},{"lat":2.69765451,"lng":-72.75014556},{"lat":2.69757068,"lng":-72.75016284},{"lat":2.69754482,"lng":-72.75022905},{"lat":2.69736336,"lng":-72.75027824},{"lat":2.69732188,"lng":-72.75028344},{"lat":2.69729435,"lng":-72.75039779},{"lat":2.69709153,"lng":-72.75067994},{"lat":2.69711673,"lng":-72.75079509},{"lat":2.69722401,"lng":-72.75088608},{"lat":2.69731737,"lng":-72.75090145},{"lat":2.70690305,"lng":-72.75092886},{"lat":2.70696441,"lng":-72.75091762},{"lat":2.70699809,"lng":-72.75089008}]},{"finca":"FINCA 3","lote":"54","poligono":[{"lat":2.70924631,"lng":-72.75250529},{"lat":2.70923059,"lng":-72.75248672},{"lat":2.70920392,"lng":-72.75246026},{"lat":2.70814984,"lng":-72.75244643},{"lat":2.70803044,"lng":-72.75236363},{"lat":2.70728716,"lng":-72.75111294},{"lat":2.70720711,"lng":-72.75099726},{"lat":2.70714164,"lng":-72.75097429},{"lat":2.70420763,"lng":-72.75096884},{"lat":2.70403591,"lng":-72.75122878},{"lat":2.70409438,"lng":-72.75120683},{"lat":2.7041523,"lng":-72.75121598},{"lat":2.7041709,"lng":-72.75127585},{"lat":2.70406217,"lng":-72.75140959},{"lat":2.70401128,"lng":-72.75148336},{"lat":2.70384923,"lng":-72.7515849},{"lat":2.7037891,"lng":-72.75167712},{"lat":2.70380306,"lng":-72.75173469},{"lat":2.70385173,"lng":-72.75174846},{"lat":2.70392819,"lng":-72.75176451},{"lat":2.70398379,"lng":-72.75176445},{"lat":2.70408338,"lng":-72.751739},{"lat":2.70422008,"lng":-72.75175958},{"lat":2.70431974,"lng":-72.75180094},{"lat":2.70439165,"lng":-72.7518861},{"lat":2.70443113,"lng":-72.75197129},{"lat":2.70441281,"lng":-72.75216483},{"lat":2.70433879,"lng":-72.75227088},{"lat":2.70426479,"lng":-72.75238614},{"lat":2.70424401,"lng":-72.75245067},{"lat":2.70387581,"lng":-72.75258008},{"lat":2.70375432,"lng":-72.75270576},{"lat":2.703685,"lng":-72.75286364},{"lat":2.70360063,"lng":-72.75304227},{"lat":2.70345605,"lng":-72.75323018},{"lat":2.70327108,"lng":-72.75356212},{"lat":2.7032526,"lng":-72.75361052},{"lat":2.70328975,"lng":-72.75368304},{"lat":2.70358638,"lng":-72.75377717},{"lat":2.70369301,"lng":-72.75383926},{"lat":2.70383907,"lng":-72.75393816},{"lat":2.70416833,"lng":-72.75421425},{"lat":2.70429928,"lng":-72.75426594},{"lat":2.70446723,"lng":-72.75425655},{"lat":2.70457837,"lng":-72.75420805},{"lat":2.70466284,"lng":-72.75412502},{"lat":2.70467549,"lng":-72.75404207},{"lat":2.70476456,"lng":-72.75393485},{"lat":2.70505992,"lng":-72.75392647},{"lat":2.70512941,"lng":-72.75391488},{"lat":2.70533709,"lng":-72.75422796},{"lat":2.7053672,"lng":-72.75422217},{"lat":2.70542043,"lng":-72.75417373},{"lat":2.70544236,"lng":-72.75410344},{"lat":2.70547362,"lng":-72.75409419},{"lat":2.70554313,"lng":-72.75409873},{"lat":2.70559062,"lng":-72.75409752},{"lat":2.7056566,"lng":-72.75405714},{"lat":2.70569479,"lng":-72.7540283},{"lat":2.70576653,"lng":-72.7539568},{"lat":2.70584284,"lng":-72.75383693},{"lat":2.70592383,"lng":-72.753747},{"lat":2.70598635,"lng":-72.75372274},{"lat":2.70604738,"lng":-72.75371727},{"lat":2.70613385,"lng":-72.75374984},{"lat":2.70618927,"lng":-72.75384261},{"lat":2.70617728,"lng":-72.75393889},{"lat":2.7062188,"lng":-72.75397151},{"lat":2.70623095,"lng":-72.75401103},{"lat":2.70626386,"lng":-72.75406773},{"lat":2.70631405,"lng":-72.75412268},{"lat":2.70635383,"lng":-72.75414671},{"lat":2.70639708,"lng":-72.75417588},{"lat":2.70651462,"lng":-72.75415685},{"lat":2.7065751,"lng":-72.75414303},{"lat":2.70663553,"lng":-72.75406732},{"lat":2.70666307,"lng":-72.75396415},{"lat":2.70665436,"lng":-72.75389883},{"lat":2.70653486,"lng":-72.75370471},{"lat":2.70639128,"lng":-72.7536086},{"lat":2.70637563,"lng":-72.75353125},{"lat":2.70641356,"lng":-72.75343666},{"lat":2.70645154,"lng":-72.75338849},{"lat":2.70666418,"lng":-72.75339685},{"lat":2.70670042,"lng":-72.75334524},{"lat":2.7067764,"lng":-72.75326952},{"lat":2.7068488,"lng":-72.75308206},{"lat":2.70685393,"lng":-72.75303048},{"lat":2.70686764,"lng":-72.75291701},{"lat":2.70689525,"lng":-72.75286885},{"lat":2.70702132,"lng":-72.75276213},{"lat":2.70712149,"lng":-72.75267091},{"lat":2.70716296,"lng":-72.75265367},{"lat":2.70721478,"lng":-72.75261751},{"lat":2.70723383,"lng":-72.75264844},{"lat":2.70706995,"lng":-72.75296836},{"lat":2.70704239,"lng":-72.75305778},{"lat":2.70706323,"lng":-72.753142},{"lat":2.70710485,"lng":-72.75326229},{"lat":2.70711877,"lng":-72.75334135},{"lat":2.70708947,"lng":-72.7534239},{"lat":2.70711901,"lng":-72.75356483},{"lat":2.70716225,"lng":-72.75358025},{"lat":2.7072608,"lng":-72.75359734},{"lat":2.70729717,"lng":-72.7536609},{"lat":2.70732148,"lng":-72.75375199},{"lat":2.70731118,"lng":-72.75382076},{"lat":2.70732336,"lng":-72.75389639},{"lat":2.70727684,"lng":-72.75403912},{"lat":2.70724585,"lng":-72.75414746},{"lat":2.70714058,"lng":-72.75431776},{"lat":2.70713898,"lng":-72.75443466},{"lat":2.70715803,"lng":-72.75446558},{"lat":2.70725136,"lng":-72.75444829},{"lat":2.70735243,"lng":-72.75438887},{"lat":2.70741896,"lng":-72.75437075},{"lat":2.70748372,"lng":-72.75430879},{"lat":2.70750274,"lng":-72.75431393},{"lat":2.70763925,"lng":-72.75425619},{"lat":2.70769447,"lng":-72.75416674},{"lat":2.70774709,"lng":-72.75407299},{"lat":2.70776152,"lng":-72.75383059},{"lat":2.70778387,"lng":-72.75372312},{"lat":2.70781149,"lng":-72.75368871},{"lat":2.70797746,"lng":-72.75369884},{"lat":2.70813461,"lng":-72.75354911},{"lat":2.70826229,"lng":-72.7533255},{"lat":2.70836504,"lng":-72.75323513},{"lat":2.70830039,"lng":-72.75299711},{"lat":2.70837295,"lng":-72.75295921},{"lat":2.70853895,"lng":-72.75300029},{"lat":2.70876109,"lng":-72.75299833},{"lat":2.70877756,"lng":-72.75304559},{"lat":2.70888735,"lng":-72.75305836},{"lat":2.70899881,"lng":-72.753023},{"lat":2.70912061,"lng":-72.75295152},{"lat":2.70914373,"lng":-72.7527538},{"lat":2.709154,"lng":-72.75266526},{"lat":2.70924631,"lng":-72.75250529}]}];

function cargarPoligonosLotes() {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = getOrCreateSheet(SHEETS.lotes, LOTES_HEADERS);
    seedLotesSheetIfEmpty_(sheet);
    var histSheet = getOrCreateSheet(SHEETS.historialLotes, HISTORIAL_LOTES_HEADERS);
    var actualizados = [];
    var noEncontrados = [];
    LOTES_POLIGONOS_SEED.forEach(function(item) {
      var fila = findLoteRow_(sheet, item.finca, item.lote);
      if (fila === -1) { noEncontrados.push(item.finca + '/' + item.lote); return; }
      var idxPoligono = LOTES_HEADERS.indexOf('poligono');
      var valorAnterior = String(sheet.getRange(fila, idxPoligono + 1).getValue() || '[]');
      var valorNuevo = JSON.stringify(item.poligono);
      sheet.getRange(fila, idxPoligono + 1).setValue(valorNuevo);
      sheet.getRange(fila, LOTES_HEADERS.indexOf('fecha_actualizacion') + 1).setValue(formatFecha(new Date()));
      histSheet.appendRow([new Date(), item.finca, item.lote, 'poligono', valorAnterior, valorNuevo, 'migracion']);
      actualizados.push(item.finca + '/' + item.lote);
    });
    return {ok: true, actualizados: actualizados.length, noEncontrados: noEncontrados};
  } finally {
    lock.releaseLock();
  }
}

function importarLotesBulk(filas) {
  if (!Array.isArray(filas)) return {ok:false, error:'Formato inválido'};
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = getOrCreateSheet(SHEETS.lotes, LOTES_HEADERS);
    seedLotesSheetIfEmpty_(sheet);
    var lastRow = sheet.getLastRow();
    var existingData = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, LOTES_HEADERS.length).getValues() : [];
    var keyToIdx = {};
    existingData.forEach(function(r, idx){ keyToIdx[loteKey(r[0], r[1])] = idx; });

    var histSheet = getOrCreateSheet(SHEETS.historialLotes, HISTORIAL_LOTES_HEADERS);
    var histRows = [];
    var nuevasFilas = [];
    var nuevasKeys = {};
    var creados = 0, actualizados = 0, errores = [];
    var editable = ['tipo','ha','anio_siembra','palmas_sembradas','palmas_productivas','ciclo_objetivo_dias','estado','material_genetico','supervisor','observaciones'];

    filas.forEach(function(d) {
      var finca = String(d.finca||'').trim();
      var lote = String(d.lote||'').trim();
      if(!finca || !lote) { errores.push({finca:finca, lote:lote, error:'Finca y lote son requeridos'}); return; }
      var key = loteKey(finca, lote);

      if (keyToIdx[key] !== undefined) {
        var idx = keyToIdx[key];
        var actual = existingData[idx];
        var actualObj = loteRowToObj(actual);
        var nuevo = actual.slice();
        var cambios = [];
        editable.forEach(function(campo) {
          if(d[campo] === undefined) return;
          var colIdx = LOTES_HEADERS.indexOf(campo);
          var valorAnterior, valorNuevo, valorParaGuardar;
          if(campo === 'ha') {
            valorAnterior = actualObj[campo]; valorParaGuardar = parseFloat(d[campo])||0; valorNuevo = valorParaGuardar;
          } else if(['palmas_sembradas','palmas_productivas','ciclo_objetivo_dias','anio_siembra'].indexOf(campo) >= 0) {
            valorAnterior = actualObj[campo]; valorParaGuardar = parseInt(d[campo],10)||0; valorNuevo = valorParaGuardar;
          } else {
            valorAnterior = actualObj[campo]; valorParaGuardar = String(d[campo]).trim(); valorNuevo = valorParaGuardar;
          }
          if(String(valorAnterior) !== String(valorNuevo)) {
            cambios.push({campo:campo, anterior:valorAnterior, nuevo:valorNuevo});
            nuevo[colIdx] = valorParaGuardar;
          }
        });
        if (cambios.length > 0) {
          nuevo[LOTES_HEADERS.indexOf('fecha_actualizacion')] = formatFecha(new Date());
          existingData[idx] = nuevo;
          cambios.forEach(function(c) {
            histRows.push([new Date(), finca, lote, c.campo, String(c.anterior), String(c.nuevo), 'importacion']);
          });
        }
        actualizados++;
      } else if (nuevasKeys[key]) {
        errores.push({finca:finca, lote:lote, error:'Duplicado dentro del mismo lote de importación'});
      } else {
        nuevasKeys[key] = true;
        nuevasFilas.push([
          finca, lote, String(d.tipo||'').trim(), parseFloat(d.ha)||0,
          d.anio_siembra ? parseInt(d.anio_siembra,10)||'' : '',
          parseInt(d.palmas_sembradas,10)||0, parseInt(d.palmas_productivas,10)||0,
          parseInt(d.ciclo_objetivo_dias,10)||0, String(d.estado||'activo').trim() || 'activo',
          String(d.material_genetico||'').trim(), String(d.supervisor||'').trim(),
          String(d.observaciones||'').trim(), JSON.stringify([]), formatFecha(new Date()),
        ]);
        creados++;
      }
    });

    if (existingData.length) {
      sheet.getRange(2, 1, existingData.length, LOTES_HEADERS.length).setValues(existingData);
    }
    if (nuevasFilas.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, nuevasFilas.length, LOTES_HEADERS.length).setValues(nuevasFilas);
    }
    if (histRows.length) {
      histSheet.getRange(histSheet.getLastRow() + 1, 1, histRows.length, HISTORIAL_LOTES_HEADERS.length).setValues(histRows);
    }

    return {ok:true, creados:creados, actualizados:actualizados, errores:errores};
  } finally {
    lock.releaseLock();
  }
}
