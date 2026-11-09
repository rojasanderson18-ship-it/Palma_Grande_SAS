# Control de Casino — Palma Grande S.A.S.

Módulo independiente: HTML/CSS/JS puro (sin build) + Google Apps Script + Google Sheets.
No modifica otros módulos ni Asistencia. Fechas siempre en `America/Bogota`.

Estado: **Fase 2 — Pantalla 1 (Registro en casino)** + administración mínima necesaria para operarla.
Pantallas 2–6 (pedidos de campo, autorización, programación, cierre por SAS, tablero) en fases siguientes.

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
4. Cierre sesión (⎋) e ingrese con el usuario del casino (rol `CASINO`).

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
