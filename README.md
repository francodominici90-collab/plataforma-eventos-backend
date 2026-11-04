# Plataforma de talleres municipales

API REST orientada a la gestión de talleres municipales e inscripciones, desarrollada como proyecto del curso Backend II.

La temática contempla talleres de oficios, arte, cocina y otras actividades de la comunidad.

Esta etapa incorpora el registro de usuarios con persistencia en MongoDB Atlas, validación de datos y protección de contraseñas mediante bcrypt.

## Estado del proyecto

Funcionalidades implementadas:

- Servidor Express con configuración mediante variables de entorno.
- Endpoint de estado del servidor.
- Estructura inicial para eventos y sesiones.
- Modelos base de usuarios y eventos.
- Registro de usuarios con validaciones.
- Normalización de emails y control de duplicados.
- Hash de contraseñas con bcrypt.
- Asignación obligatoria del rol `user` en el registro público.
- Respuestas de registro sin el campo `password`.

El login, JWT, cookies, autorización y gestión completa de eventos e inscripciones se incorporarán en entregas posteriores.

## Tecnologías

- Node.js.
- Express.
- MongoDB Atlas.
- Mongoose.
- bcrypt.
- dotenv.
- JavaScript con módulos ESM.
- Git y GitHub.

Las pruebas manuales se realizan con Postman y la inspección de documentos desde MongoDB Atlas.

MongoDB Atlas aloja la base de datos. MongoDB Compass es un cliente de administración opcional y no es necesario para ejecutar este proyecto.

## Instalación

Requisito: Node.js 24, versión principal utilizada durante el desarrollo.

Clonar el repositorio:

```bash
git clone https://github.com/francodominici90-collab/plataforma-eventos-backend.git
cd plataforma-eventos-backend
```

Instalar las dependencias respetando el archivo de bloqueo:

```bash
npm ci
```

Si npm solicita aprobar el script de instalación de bcrypt, revisar el aviso y autorizar específicamente ese paquete:

```bash
npm approve-scripts bcrypt
```

## Variables de entorno

Crear un archivo `.env` en la raíz tomando como referencia `.env.example`.

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Configuración de ejemplo:

```dotenv
PORT=3000
NODE_ENV=development
MONGO_URL=mongodb+srv://USUARIO:CONTRASENA@HOST_DEL_CLUSTER/plataforma_eventos?retryWrites=true&w=majority
JWT_SECRET=
```

Los datos de conexión del ejemplo son marcadores y deben reemplazarse localmente.

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto HTTP. Debe ser un entero entre 1 y 65535. |
| `NODE_ENV` | Entorno de ejecución; por ejemplo, `development`. |
| `MONGO_URL` | URI de conexión a MongoDB Atlas. Obligatoria en esta etapa. |
| `JWT_SECRET` | Reservada para la futura implementación de autenticación. Actualmente no se utiliza. |

La URI debe indicar explícitamente la base `plataforma_eventos`, después del host y antes de los parámetros de conexión.

Para conectarse a Atlas se necesita un usuario de base de datos con permisos adecuados y acceso de red habilitado para el equipo que ejecuta la aplicación.

Si la contraseña contiene caracteres reservados de una URI, deben codificarse correctamente en la cadena de conexión.

Nunca publicar credenciales reales ni subir `.env` al repositorio.

## Ejecución

Modo desarrollo, con reinicio ante cambios en los archivos:

```bash
npm run dev
```

Ejecución normal:

```bash
npm start
```

Con la configuración del ejemplo, la API estará disponible en:

```text
http://localhost:3000
```

El servidor HTTP comienza a escuchar después de conectar con MongoDB e inicializar el modelo de usuarios y sus índices.

Si la conexión o esa inicialización fallan, el proceso termina sin iniciar el servidor HTTP.

## Estructura y responsabilidades

| Ubicación | Responsabilidad |
| --- | --- |
| `src/app.js` | Configura Express, el procesamiento JSON y los routers. |
| `src/server.js` | Coordina la conexión y el arranque del servidor HTTP. |
| `src/config/config.js` | Carga y valida variables de entorno. |
| `src/config/db.config.js` | Conecta con MongoDB e inicializa el modelo de usuarios. |
| `src/routes/` | Define endpoints y los conecta con controllers. |
| `src/controllers/` | Recibe solicitudes y construye respuestas HTTP. |
| `src/services/` | Contiene las reglas de negocio. |
| `src/repositories/` | Ofrece una interfaz de acceso a datos para los services. |
| `src/dao/` | Realiza operaciones mediante los modelos de Mongoose. |
| `src/models/` | Define los modelos `User` y `Event`. |
| `src/middlewares/` | Espacio reservado para middlewares específicos. |
| `src/utils/hash.js` | Centraliza la generación de hashes con bcrypt. |

El registro recorre las capas en este orden:

**Ruta → Controller → Service → Repository → DAO → Modelo**

La validación del registro y la asignación del rol se resuelven en el service. El DAO utiliza Mongoose para acceder a MongoDB.

Los endpoints iniciales de estado y listado vacío de eventos todavía no necesitan acceder a la persistencia.

## Rutas disponibles

| Método | Ruta | Función |
| --- | --- | --- |
| GET | `/api/health` | Indica que el servidor HTTP está activo. |
| GET | `/api/events` | Devuelve una lista vacía como estructura inicial del recurso. |
| GET | `/api/sessions` | Informa el estado inicial del recurso de sesiones. |
| POST | `/api/sessions/register` | Registra un usuario. |

### Estado del servidor

```http
GET /api/health
```

Respuesta `200 OK`:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

Este endpoint no realiza una consulta de diagnóstico a MongoDB en cada solicitud.

### Listado inicial de eventos

```http
GET /api/events
```

Respuesta `200 OK`:

```json
{
  "status": "success",
  "payload": []
}
```

El listado es provisional: en esta etapa todavía no consulta eventos en MongoDB.

## Registro de usuarios

```http
POST /api/sessions/register
Content-Type: application/json
```

### Campos esperados

| Campo | Reglas |
| --- | --- |
| `first_name` | Texto obligatorio y no vacío. Se eliminan espacios exteriores. |
| `last_name` | Texto obligatorio y no vacío. Se eliminan espacios exteriores. |
| `email` | Texto obligatorio con validación básica de formato. Se normaliza con `trim` y minúsculas. |
| `password` | Texto obligatorio, mínimo de 8 caracteres y máximo de 72 bytes en UTF-8. |

La contraseña se conserva tal como fue ingresada antes de generar el hash: no se recorta ni se le aplica `trim`. Se rechazan contraseñas compuestas únicamente por espacios.

El registro público asigna siempre `role: "user"`. Un valor de `role` enviado en el body no se utiliza.

### Ejemplo de solicitud

En Postman, seleccionar **POST**, ingresar la URL y configurar **Body → raw → JSON**:

```text
http://localhost:3000/api/sessions/register
```

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

La contraseña del ejemplo es únicamente un dato de prueba.

### Registro exitoso

Respuesta `201 Created`:

```json
{
  "status": "success",
  "payload": {
    "id": "ID_GENERADO_POR_MONGODB",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La respuesta no contiene la contraseña original ni su hash.

### Datos inválidos

Respuesta `400 Bad Request`, por ejemplo:

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios: last_name, email, password"
}
```

También se devuelve `400` ante tipos incorrectos, email inválido o contraseña fuera de los límites establecidos.

### Email duplicado

Respuesta `409 Conflict`:

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

La búsqueda de duplicados utiliza el email normalizado.

Además de la consulta previa, un índice único en MongoDB impide guardar emails repetidos. El error de clave duplicada se transforma en una respuesta `409`, contemplando solicitudes simultáneas.

### Fallas inesperadas

Respuesta `500 Internal Server Error`:

```json
{
  "status": "error",
  "message": "No se pudo registrar el usuario"
}
```

Los detalles internos del error no se incluyen en la respuesta al cliente.

## Modelo de usuario

El modelo `User` contiene:

- `first_name`.
- `last_name`.
- `email`, con índice único.
- `password`, que almacena el hash.
- `role`, con valores permitidos `user`, `organizer` y `admin`.

El campo `password` utiliza `select: false` para excluirse de las consultas habituales.

Como esa opción no elimina el hash del resultado de creación, el service construye explícitamente la respuesta pública seleccionando únicamente los campos permitidos.

## Protección de contraseñas

El helper `src/utils/hash.js` utiliza bcrypt de forma asincrónica con un factor de costo de 12.

Bcrypt genera automáticamente un salt para cada hash. La contraseña original no se almacena en MongoDB.

Se valida el límite de 72 bytes antes de calcular el hash, ya que bcrypt ignora el contenido que excede ese límite. Se utiliza:

```js
Buffer.byteLength(password, "utf8")
```

La comprobación se realiza en bytes porque ciertos caracteres, como los emojis, ocupan más de un byte.

Esta validación evita aceptar contraseñas cuyo contenido sería truncado silenciosamente por bcrypt.

## Modelo de evento

El modelo base `Event` incluye:

- `title`.
- `description`.
- `date`.
- `location`.
- `capacity`.

La capacidad debe ser un entero positivo dentro del rango seguro de JavaScript.

El modelo queda preparado para futuras entregas. Actualmente no hay endpoints de creación o administración de eventos.

## Pruebas manuales

Casos comprobados durante el desarrollo:

| Caso | Resultado esperado |
| --- | --- |
| Registro válido | `201`, con datos públicos del usuario. |
| Email con mayúsculas y espacios exteriores | Se guarda normalizado. |
| Body con `role: "admin"` | El usuario se crea con rol `user`. |
| Email ya registrado | `409`. |
| Email duplicado con diferente capitalización o espacios | `409`. |
| Campos obligatorios faltantes | `400`. |
| Email con formato inválido | `400`. |
| Contraseña menor a 8 caracteres | `400`. |
| Contraseña superior a 72 bytes | `400`. |
| Inspección del documento en Atlas | La contraseña aparece como hash bcrypt. |
| Inspección de la respuesta del registro | No aparece el campo `password`. |

Para comprobar la persistencia, abrir la base `plataforma_eventos` en Atlas, seleccionar la colección `users` y buscar el email utilizado en la prueba.

Los registros exitosos permanecen en la base. Para repetir una prueba de creación, utilizar otro email de prueba o eliminar únicamente el documento correspondiente desde Atlas.

Todavía no existe un endpoint para eliminar usuarios ni una suite de pruebas automatizadas.

## Repositorio

El repositorio incluye el código fuente, `package.json`, `package-lock.json`, `.env.example` y la documentación.

El archivo `.gitignore` excluye `.env`, `node_modules` y otros archivos locales de trabajo.

Las carpetas todavía vacías se conservan mediante archivos `.gitkeep`.

## Base del proyecto

El proyecto parte del material compartido por el docente:

https://github.com/pablobianchi/coder-95280

Sobre esa base se desarrolla la temática de talleres municipales y las funcionalidades de las entregas de Backend II.

## Autor

Franco Dominici