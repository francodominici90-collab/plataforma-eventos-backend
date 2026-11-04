# Plataforma de talleres municipales

API REST desarrollada como proyecto del curso Backend II, orientada a la publicación de talleres municipales y la inscripción de participantes.

La temática contempla actividades como talleres de informática, oficios, arte y cocina.

## Estado actual

Esta primera preentrega prepara la estructura del proyecto.

Incluye:

- Servidor Express con configuración y arranque separados.
- Módulos ESM mediante `import` y `export`.
- Configuración de variables de entorno con dotenv.
- Endpoint de estado del servidor.
- Ruta y controller iniciales para eventos.
- Ruta y controller iniciales para sesiones.
- Modelos base de usuarios y eventos con Mongoose.
- Carpetas preparadas para las siguientes capas del proyecto.

Todavía no se implementan conexión a MongoDB, persistencia, registro, login, JWT, roles ni inscripciones.

`GET /api/events` devuelve una lista vacía como respuesta inicial; no consulta una base de datos.

## Tecnologías

- Node.js.
- Express.
- dotenv.
- Mongoose.
- Git y GitHub.

## Requisitos

- Node.js 24 o una versión compatible con las dependencias.
- npm.
- Git, si se descarga mediante clonación.

Para ejecutar esta etapa no es necesario configurar MongoDB ni generar un secreto JWT.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/francodominici90-collab/plataforma-eventos-backend.git
cd plataforma-eventos-backend
```

Instalar las dependencias registradas en `package-lock.json`:

```bash
npm ci
```

Crear el archivo `.env` a partir de `.env.example`.

En PowerShell:

```powershell
Copy-Item .env.example .env
```

En Linux o macOS:

```bash
cp .env.example .env
```

## Variables de entorno

Configuración inicial:

```env
PORT=3000
NODE_ENV=development
MONGO_URL=
JWT_SECRET=
```

| Variable | Función | Uso en esta etapa |
| --- | --- | --- |
| `PORT` | Puerto del servidor HTTP. | Obligatoria. |
| `NODE_ENV` | Nombre del entorno de ejecución. | Obligatoria. |
| `MONGO_URL` | URI de conexión a MongoDB. | Reservada para una etapa posterior. |
| `JWT_SECRET` | Secreto para la firma y verificación de tokens JWT. | Reservada para una etapa posterior. |

La aplicación verifica que `PORT` y `NODE_ENV` estén presentes y no estén vacíos.

Además, `PORT` debe ser un número entero entre 1 y 65535. Si la configuración es inválida, el inicio falla con un mensaje claro.

`MONGO_URL` y `JWT_SECRET` pueden permanecer vacíos en esta entrega.

Se eligió MongoDB Atlas para la persistencia futura, utilizando una base llamada `plataforma_eventos`. La aplicación todavía no establece esa conexión.

El archivo `.env` contiene configuración local y está excluido de Git. `.env.example` se incluye como plantilla, sin credenciales.

## Ejecución

Iniciar el servidor:

```bash
npm start
```

Ejecutar en desarrollo, con reinicio automático ante cambios en los archivos observados:

```bash
npm run dev
```

Con la configuración inicial, el servidor escucha en:

```text
http://localhost:3000
```

Para detenerlo, utilizar `Ctrl + C` en la terminal.

## Organización del proyecto

| Archivo o carpeta | Responsabilidad |
| --- | --- |
| `src/app.js` | Configura Express, `express.json()` y los routers. |
| `src/server.js` | Inicia el servidor HTTP usando el puerto configurado. |
| `src/config/config.js` | Carga y valida la configuración de entorno. |
| `src/routes/` | Define los endpoints y los conecta con sus controllers. |
| `src/controllers/` | Recibe las peticiones y construye las respuestas HTTP. |
| `src/services/` | Reservada para las reglas de negocio. |
| `src/repositories/` | Reservada para la interfaz de acceso a datos. |
| `src/dao/` | Reservada para las operaciones de persistencia. |
| `src/models/` | Contiene los modelos base `User.js` y `Event.js`. |
| `src/middlewares/` | Reservada para middlewares compartidos. |
| `src/utils/` | Reservada para funciones auxiliares. |

Las carpetas que aún no contienen implementación incluyen un archivo `.gitkeep` para conservarlas en Git.

Actualmente, las peticiones recorren el router y el controller. Las capas de services, repositories y DAO se incorporarán al flujo cuando se agreguen reglas de negocio y persistencia.

`app.js` no inicia el servidor ni contiene la lógica de los controllers.

## Rutas disponibles

### Estado del servidor

```http
GET /api/health
```

Respuesta: `200 OK`.

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

Permite comprobar que el servidor puede responder una petición HTTP. No verifica la disponibilidad de MongoDB ni de otros servicios externos.

### Listado inicial de eventos

```http
GET /api/events
```

Respuesta: `200 OK`.

```json
{
  "status": "success",
  "payload": []
}
```

La lista vacía es intencional y corresponde al alcance de esta primera preentrega.

### Estructura inicial de sesiones

```http
GET /api/sessions
```

Respuesta: `200 OK`.

```json
{
  "status": "success",
  "message": "Recurso de sesiones preparado. Autenticación pendiente."
}
```

Esta ruta permite comprobar que el router y el controller de sesiones están conectados. No crea sesiones ni autentica usuarios.

## Modelos base

### User

Archivo: `src/models/User.js`.

| Campo | Tipo | Características |
| --- | --- | --- |
| `name` | String | Obligatorio; elimina espacios al inicio y al final. |
| `email` | String | Obligatorio; elimina espacios externos y convierte a minúsculas. |
| `password` | String | Obligatorio; excluido de las consultas por defecto mediante `select: false`. |

El campo `password` está destinado a almacenar un hash cuando se implemente el registro.

El modelo no genera ese hash. `select: false` tampoco cifra la contraseña ni constituye por sí solo un mecanismo de autenticación.

### Event

Archivo: `src/models/Event.js`.

Cada evento representa un taller municipal.

| Campo | Tipo | Características |
| --- | --- | --- |
| `title` | String | Título obligatorio. |
| `description` | String | Descripción obligatoria. |
| `date` | Date | Fecha y hora obligatorias. |
| `location` | String | Lugar obligatorio. |
| `capacity` | Number | Cupo obligatorio; entero seguro mayor o igual que 1. |

Los campos de texto eliminan espacios al inicio y al final.

Mongoose genera automáticamente el campo `_id` para los documentos.

En esta etapa los modelos están definidos, pero no se utilizan para consultar ni guardar información.

## Comprobaciones manuales

Con el servidor en ejecución, realizar estas peticiones desde Postman:

| Petición | Resultado esperado |
| --- | --- |
| `GET http://localhost:3000/api/health` | `200`, con el mensaje de servidor activo. |
| `GET http://localhost:3000/api/events` | `200`, con `payload: []`. |
| `GET http://localhost:3000/api/sessions` | `200`, indicando que la autenticación está pendiente. |

Para comprobar que ambos modelos se importan correctamente, ejecutar desde la raíz del proyecto:

```bash
node --input-type=module -e "import User from './src/models/User.js'; import Event from './src/models/Event.js'; console.log('Modelos cargados:', User.modelName, Event.modelName);"
```

Resultado esperado:

```text
Modelos cargados: User Event
```

Esta comprobación no abre una conexión a MongoDB ni guarda documentos.

El proyecto todavía no incluye una suite de tests automatizados.

## Decisiones de esta etapa

- Se eligió la temática de talleres municipales.
- Se conservaron los nombres técnicos `User` y `Event` solicitados.
- Se incorporó validación de configuración para detectar errores al iniciar.
- Se agregaron restricciones básicas a los campos de los modelos.
- Se agregó un GET de sesiones para comprobar su estructura inicial.
- Se prepararon las carpetas de las capas pendientes sin agregar lógica anticipadamente.

## Base del proyecto

El proyecto parte del material de clase proporcionado por el profesor Pablo Bianchi:

https://github.com/pablobianchi/coder-95280

Sobre esa base se incorporaron la temática, los recursos iniciales, los modelos, las carpetas requeridas, la validación de configuración y esta documentación.

## Autor

Franco Dominici