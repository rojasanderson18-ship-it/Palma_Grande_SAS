# Control de Casino — Fase 1: análisis de Asistencia y modelo de hojas

> Estado: **propuesta para aprobación**. Todavía no hay código del módulo.
> Referencia visual: [`boceto-casino.html`](boceto-casino.html) (estático, no es código base).

---

## 1. Cómo guarda Asistencia el personal y los rostros

Repositorio revisado: `Asistencia_Palma_Grande` (rama por defecto, `backend/Code.gs` v4.0 + `www/js/*`).

### 1.1 Maestro de personal (Google Sheets)

- Hoja **`Personal`** dentro del Sheet de Asistencia (el ID está en `PropertiesService` → `SHEET_ID`).
- Columnas (en este orden):
  `Documento | Nombre | Cargo | Fecha registro | FotoId | Estado | JornadaContinua`
- `Estado` = `ACTIVO` / `INACTIVO` (vacío se lee como ACTIVO).
- Clave real: **`Documento`** (cédula).
- No tiene empresa, SAS, centro de costo ni cuadrilla.
- Acceso desde fuera:
  - `listarPersonal`: exige token de sesión **admin** de Asistencia.
  - `sincronizarPersonalKiosco`: exige `deviceToken` de un kiosco autorizado por Asistencia.
  - Ninguno de los dos sirve para que otro sistema lea el maestro sin depender de las credenciales de Asistencia.
- Fotos de enrolamiento: archivos privados en Drive (`FotoId`). Solo salen por `obtenerFoto` con sesión.

### 1.2 Descriptores faciales (solo en el dispositivo)

- **Nunca se suben al backend.** Viven en el `localStorage` de cada tablet:
  - `rostros_enrolados` → `{ "<NOMBRE>": [[128 floats] × 5 poses] }`. Es el formato v2; el v1 es un solo arreglo plano.
  - `rostros_meta` → `{ "<NOMBRE>": { v: 2, fecha, capturas } }`
- ⚠️ **La clave es el NOMBRE, no la cédula.** El reconocimiento devuelve un nombre y luego se busca la persona por nombre.
- Motor: `face-api.js` vendorizado (`lib/face-api/face-api.min.js`) y modelos `tiny_face_detector`, `face_landmark_68` y `face_recognition` (≈ 7 MB en `models/`).
- Comparación:
  - Se promedian las 2 mejores distancias euclidianas.
  - Umbral 0,49 para v2 y 0,54 para v1, con un tope absoluto de 0,55.
- Respaldo entre dispositivos (Configuración → Respaldar rostros):
  - Archivo JSON `{ v:1, salt, iv, data }`.
  - Cifrado AES-256-GCM con clave PBKDF2-SHA256 de 150.000 iteraciones derivada de una contraseña.
  - El contenido descifrado es `{ rostros, meta }`.

### 1.3 Dato clave del hosting

Ambos repos se publican en **el mismo origen**, `https://rojasanderson18-ship-it.github.io`, y `localStorage` se comparte por origen, no por carpeta. Esto tiene dos consecuencias:

- En una tablet que abre Asistencia **en el navegador** (no en el APK de Capacitor), una página de `/Palma_Grande_SAS/casino/` puede **leer** `rostros_enrolados` directamente.
- Asistencia usa claves genéricas (`cola`, `app_config`, `device_token`, `personal_cache`). El casino tiene que usar **siempre el prefijo `casino_`** para no pisarlas.

---

## 2. Cómo reutilizarlos SIN modificar Asistencia

### 2.1 Personal

**Propuesta: un Sheet propio del casino con una copia de solo lectura del maestro de Asistencia.**

- El Apps Script del casino es un proyecto nuevo. Guarda el ID del Sheet de Asistencia en sus propias `PropertiesService` (`ASIST_SHEET_ID`).
- Lee la hoja `Personal` con `SpreadsheetApp.openById(...)`. **Nunca escribe en ella.**
- La función `sincronizarPersonal()` (botón de admin y disparador diario):
  - Si hay un documento nuevo en Asistencia, lo crea en `Personas_Casino` con `tipo_pago` vacío. Queda "pendiente de clasificar" y no puede comer hasta que lo clasifiquen.
  - Si cambian el nombre o el cargo, los actualiza.
  - Si Asistencia lo marca `INACTIVO`, el casino también lo bloquea. La regla es: **elegible = activo en casino Y no inactivo en Asistencia**.
- Para trabajadores que **no estén en Asistencia** (por ejemplo, de una SAS que no marca allí): alta manual con `origen = MANUAL`.
- Requisito: la cuenta de Google dueña del script del casino necesita **permiso de lectura** sobre el Sheet de Asistencia.
- Alternativa si no se puede dar ese permiso: importar un CSV exportado de Asistencia.

### 2.2 Rostros

| Opción | Cómo | Pros | Contras |
|---|---|---|---|
| **A (recomendada)** | En la tablet del casino, el admin **importa el archivo de respaldo cifrado** que Asistencia ya genera, con su contraseña. El casino lo descifra con el mismo algoritmo (Web Crypto) y convierte NOMBRE → **documento** usando `Personas_Casino`. Lo guarda en `casino_rostros`. | Usa una función que ya existe en Asistencia. Funciona en cualquier tablet, también si Asistencia corre en el APK. Los rostros siguen sin salir del dispositivo. | Hay que volver a importar cuando se enrole gente nueva. Los nombres que no coincidan se listan para resolverlos a mano. |
| B (respaldo) | Si la tablet del casino tiene Asistencia abierta en el **mismo navegador**, se lee `rostros_enrolados` en modo de solo lectura (mismo origen). | Sin pasos manuales. | Depende del formato interno de Asistencia. No funciona con el APK. |
| C | Enrolar de nuevo en el casino. | Independiente. | Duplica el trabajo y crea dos bases biométricas. |

- Propongo **A como mecanismo principal y B como importación automática opcional**. Las dos convierten a clave por documento.
- El motor `face-api.js` y sus modelos se **copian dentro de `/casino/lib` y `/casino/models`**, y un Service Worker propio (`/casino/sw.js`) los guarda en caché para trabajar sin señal. Así el casino no se rompe si Asistencia cambia.
- Se usan los mismos umbrales (0,49 / 0,54, tope 0,55).
- Si el rostro no se reconoce, el respaldo es la **búsqueda por cédula**. Queda registrada con `metodo_id = CEDULA` y aparece en Novedades.

---

## 3. Arquitectura

- **Frontend**: `/casino/index.html`, con las pantallas por rol, más `/casino/casino.js`, `/casino/casino.css` y `/casino/sw.js`. HTML/CSS/JS puro, sin build. Mobile-first.
- **Backend**: `/casino/Code.gs`, un proyecto de Apps Script nuevo con su propio Sheet "Casino Palma Grande".
  - No toca el `Code.gs` del hub ni el de Asistencia.
  - La URL `/exec` se configura una vez en el frontend.
- **Hub**: solo se agrega un enlace "Casino" en la sección *Módulos* del menú de `index.html`. Es el único cambio fuera de `/casino/`.
- **Fechas**:
  - Cliente: helper `fechaBogota()` / `horaBogota()` con `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' })`.
  - Servidor: `Utilities.formatDate(d, 'America/Bogota', ...)`.
  - **Nunca** `toISOString().slice(0,10)`.
  - Fechas guardadas como texto `yyyy-MM-dd` y horas como `HH:mm:ss`.
- **Acceso por rol con PIN**:
  - La interfaz es la de Fertiliza: elegir el rol y luego un teclado de 5 dígitos.
  - A diferencia de Fertiliza, que tiene los PIN escritos en el código del cliente, aquí el PIN se envía como SHA-256 y **se valida en Apps Script**, que devuelve un token de sesión (igual que Asistencia).
  - Hay límite de intentos.

### Roles

| Rol | Pantallas |
|---|---|
| `CASINO` (operario/a) | 1 Registro, 4 Programación del día |
| `SUPERVISOR` (campo, propio o de SAS) | 2 Pedido de campo, solo de su SAS/cuadrilla |
| `AUTORIZA` (Superintendencia / supervisor PG) | 3 Autorización |
| `ADMIN` | 5 Cierre por SAS, 6 Tablero, maestros, configuración, anulaciones |

**Propuesta: un PIN por usuario, no un PIN compartido por rol.** Es lo único que permite registrar *quién* hizo cada cosa, como piden `entregado_por`, `autorizado_por`, el Log, etc. Va en la hoja `Usuarios`.

---

## 4. Modelo de hojas (Sheet "Casino Palma Grande")

Convenciones:

- Cada hoja tiene una fila de encabezados.
- `id` es texto único.
- `*_en` es fecha y hora en Bogotá (`yyyy-MM-dd HH:mm:ss`) y `*_por` es el usuario.
- **No se borran filas.** Se cambia `estado` y se deja motivo y usuario.

### 4.1 `Personas_Casino` (vínculo al maestro de Asistencia + columnas propias)

| Columna | Notas |
|---|---|
| documento | Clave. Igual al `Documento` de Asistencia |
| nombre, cargo | Copia de Asistencia, para mostrar y para trabajar sin señal |
| origen | `ASISTENCIA` \| `MANUAL` |
| estado_asistencia | Último `Estado` leído de Asistencia |
| **tipo_pago** | `EMPRESA` \| `SAS` (vacío = pendiente de clasificar, no puede comer) |
| **sas_contratista** | `id` de la hoja `SAS`. Obligatorio si tipo_pago = SAS |
| **centro_costo** | Obligatorio si tipo_pago = EMPRESA |
| cuadrilla | Para armar el checklist del supervisor (ver preguntas) |
| **activo** | `SI` \| `NO` (activo en el casino) |
| actualizado_por, actualizado_en | |

### 4.2 `SAS`

`id | nombre | nit | activo (SI/NO) | creado_por | creado_en`

### 4.3 `Servicios`

`id (DES/ALM/CEN/REF) | nombre | hora_inicio | hora_fin | valor | permite_campo (SI/NO) | activo`

Los cambios de valor quedan en el Log. Cada ración guarda el valor vigente en el momento de entregarla.

### 4.4 `Raciones`

| Columna | Notas |
|---|---|
| id | Lo genera el cliente: `R-<dispositivo>-<epochms>-<aleatorio>`. Para despachos: `P-<pedido_id>-<documento>` |
| fecha, hora | Bogotá, del momento de la entrega (también si fue sin señal) |
| documento, nombre | |
| tipo_pago, sas, centro_costo | Copia del valor que tenía la persona ese día |
| servicio | |
| modo | `CASINO` \| `CAMPO` |
| metodo_id | `ROSTRO` \| `CEDULA` \| `PEDIDO` (se agrega `PEDIDO` para las raciones que genera un despacho) |
| pedido_id | Solo si el modo es CAMPO |
| valor | Valor unitario del servicio en esa fecha |
| entregado_por, dispositivo | |
| estado | `VALIDA` \| `ANULADA` |
| motivo_anulacion, anulado_por, anulado_en | |
| registrado_en, offline | Hora del servidor y `SI`/`NO` |

### 4.5 `Intentos` (bloqueos registrados)

`id | fecha | hora | documento | servicio | motivo | dispositivo | usuario | detalle`

- `motivo` puede ser: `DUPLICADA`, `INACTIVO`, `SAS_INACTIVA`, `SIN_CLASIFICAR`, `FUERA_HORARIO`, `DUPLICADA_SYNC`.
- Alimenta las "Novedades" del cierre.

### 4.6 `Visitantes` (registro aparte)

`id | fecha | hora | nombre | documento | empresa_motivo | servicio | autorizado_por | cargo_a (centro de costo) | valor | entregado_por | dispositivo | estado | motivo_anulacion | anulado_por | anulado_en`

### 4.7 `Pedidos_Campo`

`id | fecha | servicio | sas (o EMPRESA) | cuadrilla | supervisor | punto_entrega | personas (JSON con los documentos) | cantidad | estado (ENVIADO|AUTORIZADO|RECHAZADO|DESPACHADO) | extemporaneo (SI/NO) | justificacion | autorizado_por | hora_autorizacion | motivo_rechazo | despachado_por | hora_despacho | conductor | creado_en | modificado_por | modificado_en`

### 4.8 `Cortes_SAS`

`id | sas | periodo_desde | periodo_hasta | total_raciones | detalle (JSON por servicio y modo) | valor | estado (BORRADOR|ENVIADO|ACEPTADO|DESCONTADO) | creado_por/en | enviado_por/en | aceptado_por/en | descontado_por/en | factura_ref | observaciones`

### 4.9 `Conciliacion_Proveedor` (para el campo editable del tablero)

`periodo_desde | periodo_hasta | raciones_factura | valor_factura | factura_ref | editado_por | editado_en`

### 4.10 `Usuarios`

`usuario | nombre | rol | sas (supervisores de SAS) | pin_hash | activo`

### 4.11 `Config` (clave/valor)

`hora_corte_pedidos = 08:00`, `nombre_casino`, etc. Los hashes de PIN y los ID de los Sheets van en `PropertiesService`, no en la hoja.

### 4.12 `Log`

`id | fecha | hora | usuario | rol | accion | hoja | registro_id | antes (JSON) | despues (JSON) | dispositivo`

Cubre toda creación, cambio, anulación, cambio de estado, sincronización e inicio de sesión.

---

## 5. Reglas de negocio (todas validadas en Apps Script)

1. **Una ración por persona, servicio y día.**
   - Se revisa contra `Raciones` VALIDA de la misma `fecha` y `servicio`.
   - Usa `LockService` para que dos tablets no registren lo mismo al mismo tiempo.
   - Si se repite: se rechaza y se escribe en `Intentos` (`DUPLICADA`).
2. **Elegibilidad**: `activo = SI`, no inactivo en Asistencia y `tipo_pago` definido. Si es SAS, la SAS debe estar `activo = SI`.
3. **Horario**: `hora` debe estar entre `hora_inicio` y `hora_fin` del servicio.
   - En raciones registradas sin señal se valida la hora en que se registró.
   - Se rechaza si esa hora es futura o tiene más de 3 días.
4. **No se borra nada.** `anularRacion(id, motivo)` exige motivo y rol ADMIN, y queda en el Log.
   - Si el periodo ya tiene un corte ENVIADO o posterior, la anulación sale como ajuste en el siguiente corte.
5. **Pedidos de campo**:
   - La hora de corte se configura (08:00 por defecto) y se compara con la hora del **servidor** en Bogotá.
   - Después del corte el pedido queda `extemporaneo = SI` y exige `justificacion` y quien autoriza.
   - Se puede ajustar (personas, punto) mientras el estado sea distinto de `DESPACHADO`. Cada ajuste queda en el Log.
6. **Despacho** (`marcarDespachado(pedido, conductor)`):
   - Solo si el pedido está AUTORIZADO.
   - Genera una fila CAMPO / PEDIDO en `Raciones` por persona, con un id determinista para que no se duplique si se reintenta.
   - Si una persona ya comió ese servicio en el casino, no se le genera la ración: se registra en `Intentos` y aparece en la pantalla.
   - Lo despachado es lo que se cobra. No hay confirmación de recepción.
7. **Visitantes**: registro en `Visitantes` con `autorizado_por` obligatorio. Nunca entran a los cortes de SAS.
8. **Cortes**:
   - Se calculan desde `Raciones` VALIDA con tipo_pago SAS de esa SAS y periodo.
   - Para pasar de estado hay que seguir el orden BORRADOR → ENVIADO → ACEPTADO → DESCONTADO. No se puede retroceder sin ADMIN y motivo.

## 6. Funcionamiento sin señal (pantalla 1)

- Cola local en `casino_cola`. Cada ración lleva su `id` único desde que se crea.
- Copia local de `Personas_Casino`, `SAS`, `Servicios` y de las raciones del día (`casino_hoy`). Así la tablet bloquea repeticiones aunque no tenga señal.
- Sincronización (`registrarRaciones` en lote, de forma idempotente):
  - Si el `id` ya existe, el servidor responde OK y no lo duplica.
  - Si otra tablet registró antes a la misma persona para el mismo servicio, la ración se rechaza como `DUPLICADA_SYNC`. Queda en `Intentos` y se avisa en la tablet.
- El inicio de sesión del operario queda guardado en la tablet durante el turno (por ejemplo, 12 h). Así puede seguir entregando sin señal, y `entregado_por` queda registrado.

---

## 7. Preguntas que necesito que me respondas

1. **Acceso al Sheet de Asistencia**: ¿la misma cuenta de Google va a ser dueña del script del casino? Necesita permiso de lectura sobre el Sheet de Asistencia. Si no se puede, usaré la importación de CSV.
2. **Trabajadores de SAS**: ¿marcan asistencia en Asistencia (están en `Personal`)? Si no, se dan de alta a mano en el casino.
3. **Checklist del supervisor**: ¿cómo se sabe qué trabajadores son "suyos"? Propongo una columna `cuadrilla` en `Personas_Casino` y que cada supervisor tenga asignadas SAS o cuadrillas en `Usuarios`.
4. **Valor por servicio**: ¿es el mismo para EMPRESA y para SAS? ¿Los pedidos de campo son solo de almuerzo, o también de refrigerio?
5. **PIN**: ¿un PIN por usuario, que es lo que recomiendo por la trazabilidad, o uno por rol como en Fertiliza?
6. **Visitantes**: ¿su consumo va a un centro de costo de la empresa o a quien lo autoriza?

Cuando apruebes (o ajustes) este modelo, sigo con la **Fase 2: Pantalla 1, Registro en casino**, con el backend que necesita.

---

## 8. Decisiones aprobadas (9 nov 2026)

- Modelo **aprobado**, con **PIN por usuario**.
- Los trabajadores de SAS **no** están en Asistencia: se crean en el casino (`origen = MANUAL`) y su rostro **se enrola en el casino**.
- La asignación a supervisores se hace con la columna `cuadrilla` y las SAS o cuadrillas asignadas en `Usuarios`.
- Valores: Desayuno $9.000 · Almuerzo $9.000 · Cena $8.600 (iguales para EMPRESA y SAS). El refrigerio queda inactivo hasta que se defina su valor.
- Visitantes: el consumo se carga a **Palma Grande S.A.S**.
- Se agrega la hoja `Dispositivos` (tablets autorizadas).
- Los rostros se guardan en IndexedDB y no en localStorage, porque localStorage comparte cupo con Asistencia en el mismo origen.

## 9. Agregados en la pantalla 2

- Hoja `Puntos_Entrega` (id, nombre, finca, activo), administrada desde la tablet.
- `Pedidos_Campo.motivo_cancelacion` y el estado `ANULADO` (cancelado por el supervisor antes del despacho, con motivo).
- El supervisor se asigna a una SAS (o a la empresa) y, opcionalmente, a cuadrillas (hoja `Usuarios`).

## 10. Agregados en la pantalla 3

- `Pedidos_Campo.rechazado_por` y `Pedidos_Campo.hora_rechazo` (quién rechazó o revocó, y a qué hora). `autorizado_por` queda solo para autorizaciones.
