# Control de Casino — Palma Grande S.A.S.

Módulo independiente: HTML/CSS/JS puro (sin build) + Google Apps Script + Google Sheets.
No modifica otros módulos ni Asistencia. Fechas siempre en `America/Bogota`.

Estado:
- **Pantalla 1 — Registro en casino** + administración mínima para operarla.
- **Pantalla 2 — Pedido de campo (supervisor)**.
- **Pantalla 3 — Autorización de pedidos** (rol `AUTORIZA`: Superintendencia / supervisor Palma Grande).
- **Pantalla 4 — Programación del día y despacho** (tablet del casino, botón **Programación**).
- **Pantalla 5 — Cierre por SAS contratista** (ADMIN).
- Pantalla 6 (tablero) en la fase siguiente.

## Instalación (una sola vez)

1. Cree un Google Sheet nuevo llamado **Casino Palma Grande** (con la misma cuenta dueña del Sheet de Asistencia).
2. En ese Sheet: **Extensiones → Apps Script**. Pegue el contenido de [`backend/Code.gs`](backend/Code.gs) y guarde.
3. Recargue el Sheet. Aparece el menú **Casino**:
   - **1 · Inicializar hojas** — crea todas las hojas y los servicios (Desayuno $9.000, Almuerzo $9.000, Cena $8.600).
     Revise los horarios en la hoja `Servicios` (por defecto 05:30–08:00, 11:30–14:00, 17:30–20:00).
   - **2 · Crear usuario** — el primero debe ser `ADMIN`. Cada persona tiene su propio usuario y PIN de 5 dígitos.
   - **ID del Sheet de Asistencia** (opcional) — para copiar el personal de planta (solo lectura).
4. **Implementar → Nueva implementación → Aplicación web** · Ejecutar como: *yo* · Acceso: *cualquier usuario*. Copie la URL `/exec`.
   Cada cambio en `Code.gs` requiere **Gestionar implementaciones → Nueva versión**.
5. (Opcional) **Activadores → sincronizacionDiaria** diario, para traer el personal nuevo de Asistencia.

## Primera vez en la tablet del casino

1. Abra `…/Palma_Grande_SAS/casino/` (o desde el hub: menú **Módulos → Casino**). Pegue la URL `/exec`.
2. Ingrese con el usuario ADMIN y **autorice la tablet** (nombre, p. ej. "Tablet 01").
3. ⚙ **Administración**:
   - **SAS**: cree las SAS contratistas.
   - **Personas**: "Copiar de Asistencia" trae al personal de planta (queda *sin clasificar*); asigne EMPRESA + centro de costo.
     Los trabajadores de SAS (no están en Asistencia) se crean con **+ Nueva persona**.
   - **Rostros**: "Importar respaldo" acepta el archivo de respaldo cifrado de Asistencia (se asocia por nombre → cédula).
     Los trabajadores de SAS se **enrolan aquí** (5 capturas). Use **Respaldar rostros** después de enrolar y guarde
     el archivo: los rostros viven solo en la tablet y ese archivo sirve para otra tablet o si se borra el navegador.
   - **Puntos**: cree los puntos de entrega (lote / finca) que el supervisor elige en el pedido de campo.
4. Cierre sesión (**Salir**) e ingrese con el usuario del casino (rol `CASINO`).

## Supervisores (pantalla 2)

- Se crean desde el menú **Casino → 2 · Crear usuario** con rol `SUPERVISOR`: se indica el **nombre de la SAS**
  (vacío si es supervisor de la empresa) y, opcionalmente, sus **cuadrillas** separadas por coma.
  Para cambiarlas después: **Casino → Asignar SAS / cuadrillas a supervisor**.
- El supervisor entra desde su celular a la misma dirección con su usuario y PIN (no hace falta autorizar el teléfono).
- Ve solo los trabajadores activos de su SAS (o de EMPRESA) y de sus cuadrillas. La columna `cuadrilla` de cada
  persona se llena en Administración → Personas.
- Corte: hoja `Config`, clave `hora_corte_pedidos` (08:00). Lo decide la hora del servidor: después del corte
  el pedido queda **extemporáneo** y exige justificación. Quitar trabajadores después del corte no lo vuelve extemporáneo;
  agregarlos sí.
- Un trabajador no puede estar en dos pedidos del mismo servicio el mismo día, ni pedirse si ya comió en el casino.
- Se puede ajustar o cancelar (con motivo) hasta el despacho. Si se ajusta un pedido ya autorizado, vuelve a quedar
  pendiente de autorización. Nada se borra.
- Enviar un pedido necesita señal. Si no hay, la selección queda guardada en el teléfono para reintentar.

## Cómo funciona sin señal

- Cada ración se guarda primero en la tablet (`localStorage`, claves `casino_*`) con un id único y se envía cuando hay señal.
  Reenviar el mismo id no duplica.
- La tablet bloquea repeticiones con las raciones del día que ya conoce. Si dos tablets sin señal entregan a la misma
  persona, el servidor acepta la primera y la otra queda como intento `DUPLICADA_SYNC` con un aviso en la tablet.
- El ingreso (usuario + PIN) requiere señal; la sesión dura el turno (12 h).

## Archivos

| Ruta | Contenido |
|---|---|
| `index.html`, `css/`, `js/` | Aplicación (comun, rostros, registro, admin) |
| `sw.js`, `manifest.webmanifest` | Funcionamiento sin señal / instalable |
| `lib/face-api.min.js`, `models/` | Copia de face-api.js (MIT) y modelos, igual que Asistencia |
| `backend/Code.gs` | Apps Script del casino |
| `FASE1_ANALISIS_Y_MODELO.md` | Análisis de Asistencia y modelo de hojas aprobado |
| `boceto-casino.html` | Referencia visual |

## Autorización (pantalla 3)

- Usuario con rol `AUTORIZA` (menú **Casino → 2 · Crear usuario**). Entra desde su celular con usuario y PIN.
- Ve los pedidos del día de todos los supervisores: punto, cantidad, SAS o empresa, supervisor, lista de trabajadores
  y, si es extemporáneo, la justificación.
- **Autorizar los pedidos a tiempo** en un solo paso. Los extemporáneos se autorizan uno por uno, después de leer la justificación.
- **Rechazar** (con motivo) un pedido pendiente, o **revocar** uno autorizado mientras no se haya despachado.
  El supervisor ve quién rechazó y el motivo, y puede corregir y reenviar.
- Si el supervisor ajusta el pedido después de que el autorizador lo abrió, la autorización no se acepta
  ("El supervisor modificó el pedido: revíselo de nuevo"). Así nadie autoriza algo distinto de lo que vio.
- No se autoriza si algún trabajador ya no puede recibir (inactivo o SAS inactiva) ni si el servicio ya cerró.

## Programación del día (pantalla 4)

- En la tablet del casino, botón **Programación** (usuarios `CASINO` o `ADMIN`).
- Totales del servicio: **en casino** (registradas, incluye visitantes) y **a campo** (pedidos autorizados o despachados).
- Despachos agrupados por punto de entrega y, dentro, por SAS o empresa. Los pedidos sin autorizar se ven, pero no se pueden despachar.
- **Marcar despachado** pide el conductor (la tablet recuerda los últimos). Al confirmar, el servidor crea una ración
  `CAMPO` por trabajador (`metodo_id = PEDIDO`, con `pedido_id`), que es **lo que se cobra**. No hay confirmación de recepción en campo.
- Quien ya comió en el casino ese servicio se excluye del despacho y queda en `Intentos`. Después del despacho,
  si un trabajador de campo llega al casino, la ficha muestra "Tiene almuerzo despachado a campo" y no se entrega.
- Se puede despachar antes de que abra el servicio y hasta que cierre. Despachar necesita señal.
- Un pedido despachado ya no se puede ajustar, cancelar ni revocar. Si una ración de campo se cobró por error, un ADMIN la anula
  con motivo (Administración → Hoy).

## Cierre por SAS (pantalla 5)

- Solo `ADMIN`. Se abre desde **Administración → Cierre por SAS** o, en un computador de oficina sin autorizarlo como
  tablet, desde el botón **Abrir cierre por SAS** que aparece después de ingresar.
- Se elige la SAS y la quincena (1–15 o 16–fin de mes; por defecto la última terminada) u **Otro rango** (máximo 2 meses).
- Muestra: raciones y valor del periodo (casino y campo), totales por servicio, tabla por trabajador (Des / Alm / Cen),
  detalle día a día con hora y **novedades** (registros manuales por cédula, intentos bloqueados, anuladas).
- Flujo: **Borrador → Enviado → Aceptado por SAS → Descontado**.
  - *Enviar* se habilita al día siguiente del fin del periodo. Al enviar, las cifras **quedan fijas** y se descarga el PDF para mandarlo a la SAS.
  - *Aceptado*: se escribe quién firmó por la SAS. *Descontado*: se escribe la referencia de la factura.
  - Se puede **devolver** un paso (con motivo): de Aceptado a Enviado, o de Enviado a Borrador si es el último corte enviado de esa SAS. Un corte descontado ya no se devuelve.
- **Ajustes**: si después de enviado un corte se anula una ración de ese periodo, o llega tarde una ración registrada sin señal,
  el cambio aparece como ajuste (− o +) en el siguiente corte de esa SAS, nunca dos veces.
- Exportar: **PDF** (usa "Guardar como PDF" en la ventana de impresión) y **Excel** (hojas Resumen, Trabajadores, Detalle, Ajustes, Novedades).
  El Excel carga la librería SheetJS desde cdnjs, igual que el hub, así que necesita internet.
