# SID-Agro — Frontend

Frontend del sistema de apoyo a la toma de decisiones para el cultivo de soja (TFI, Ingeniería en Sistemas de Información, UTN FRT).

Desarrollado con React, TypeScript y Vite. Se conecta al backend NestJS de SID-Agro mediante la variable `VITE_API_URL`.

| Módulo | Estado |
|---|---|
| Login | Conectado al backend |
| Monitoreo de chinche verde | Conectado al backend (lotes, indicadores, clima, alertas y observaciones) |
| Simulador de escenarios | Estructura visual con datos simulados |
| Dashboard económico | Pendiente |

## Requisitos

- Node.js `20.19` o superior (o `22.12` o superior).
- Una instancia del backend de SID-Agro en ejecución, en la misma computadora o en otra accesible por red.

## Instalación

1. Clonar el repositorio y cambiar a la rama `dev`:

   ```bash
   git clone https://github.com/facundomoya/fe-sidagro.git
   cd fe-sidagro
   git checkout dev
   ```

2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Crear el archivo `.env.local` a partir del ejemplo:

   ```bash
   cp .env.example .env.local
   ```

   En PowerShell: `Copy-Item .env.example .env.local`

4. Editar `.env.local` y configurar la URL del backend, sin barra final:

   ```env
   # Backend en la misma computadora
   VITE_API_URL=http://localhost:3000

   # Backend en otra computadora de la red
   # VITE_API_URL=http://192.168.0.10:3000
   ```

   `.env.local` está ignorado por Git: cada integrante tiene el suyo. No guardar credenciales ni tokens en ese archivo.

5. Iniciar el frontend:

   ```bash
   npm run dev
   ```

   Abrir la dirección que muestra la consola (por defecto `http://localhost:5173`).

   Si se modifica `.env.local`, hay que detener y volver a iniciar `npm run dev`.

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Verificación de tipos y compilación para producción |
| `npm run lint` | Análisis estático con Oxlint |
| `npm run preview` | Sirve la compilación de producción |

## Probar Login y Monitoreo

El frontend no incluye usuarios ni datos: todo se obtiene del backend configurado. Cada base de datos puede tener datos distintos.

### Preparar el backend

En la instancia del backend (por ejemplo, desde Swagger en `<VITE_API_URL>/docs`):

1. **Usuario.** Hace falta un usuario con rol `GERENTE` o `INGENIERO` (ambos pueden usar Monitoreo). El primer usuario `GERENTE` lo crea la migración de roles del backend a partir de las variables `GERENTE_USERNAME`, `GERENTE_EMAIL` y `GERENTE_PASSWORD` de su `.env`. Otros usuarios se crean con `POST /user` (indicando el `roleId`).
2. **Campaña y lote.** Crear una campaña con `POST /agro/campanias` y al menos un lote con `POST /agro/lotes`. Para Monitoreo, el lote necesita una **fecha de siembra pasada** (se puede agregar después con `PATCH /agro/lotes/:id`).
3. **Internet en el backend.** El monitoreo consulta el clima en Open-Meteo, por lo que la computadora del backend necesita acceso a internet.

### Recorrido de prueba

1. Iniciar sesión con el usuario del backend. Al ingresar, el encabezado muestra el nombre y el rol.
2. Abrir **Monitoreo de chinche verde** y elegir un lote con fecha de siembra: se muestran los indicadores, el clima de hoy, el próximo monitoreo y las alertas.
3. Probar **Actualizar datos**, **Registrar observación** y **Ver historial de observaciones**.

   Las observaciones se guardan en la base de datos del backend: conviene usar un lote de prueba.

La sesión se guarda solo en memoria: al recargar la página hay que volver a iniciar sesión.

## Problemas comunes

| Mensaje o síntoma | Causa probable | Qué hacer |
|---|---|---|
| «No está configurada la dirección del servidor (VITE_API_URL)» | Falta `.env.local` o la variable tiene otro nombre | Crear `.env.local` según el paso 3 y reiniciar `npm run dev` |
| «No se pudo conectar con el servidor» | El backend no está iniciado, la URL o el puerto son incorrectos, o un firewall bloquea la conexión | Abrir `<VITE_API_URL>/docs` en el navegador. Si no carga, revisar que el backend esté corriendo y, si está en otra computadora, usar su IP y permitir el puerto en el firewall |
| Error de **CORS** en la consola del navegador | El backend no acepta el origen del frontend | El backend actual permite cualquier origen (`app.enableCors()`). Si se restringió, agregar el origen del frontend (por ejemplo `http://localhost:5173`) |
| «Usuario o contraseña incorrectos, o el usuario está dado de baja» | Credenciales inválidas o usuario inactivo en esa base de datos | Verificar el usuario en el backend configurado |
| «Tu sesión expiró. Iniciá sesión nuevamente.» | El token venció (`JWT_EXPIRES_IN`, 1 hora por defecto) o el backend se reinició con otro `JWT_SECRET` | Volver a iniciar sesión |
| «Tu usuario no tiene permiso…» | El rol no tiene los permisos `MONITOREO_GET` / `MONITOREO_POST` o `AGRO_PARAM_GET` | Usar un usuario `GERENTE` o `INGENIERO` |
| «No hay lotes registrados» | La base de datos del backend no tiene lotes | Crear una campaña y un lote (ver «Preparar el backend») |
| El lote aparece «sin fecha de siembra» | El lote no tiene `fechaSiembra` o es futura | Cargarla con `PATCH /agro/lotes/:id` |
| «El proveedor de datos climáticos no respondió» | Open-Meteo no respondió o el backend no tiene internet | Reintentar en unos minutos |

## Estructura

```
src/
  auth/         Contexto de sesión (usuario, permisos, login y logout)
  components/   Componentes reutilizables y de cada módulo
  config/       Rutas y navegación
  mocks/        Datos simulados (módulos todavía no integrados)
  pages/        Pantallas
  services/     Cliente HTTP (apiClient) y servicios por módulo
  types/        Tipos de los datos y de las respuestas del backend
  utils/        Formato de fechas y números
```

La documentación funcional y los prototipos están en `docs/`.
