# Plataforma de talleres municipales

API REST desarrollada como proyecto progresivo del curso Backend II.

La temática elegida es una plataforma de talleres y actividades municipales. El objetivo es incorporar, en etapas posteriores, gestión de eventos, inscripciones, cupos y permisos según el rol del usuario.

Actualmente incluye registro de usuarios, autenticación mediante JWT almacenado en una cookie HTTP Only, consulta del usuario autenticado y cierre de sesión. También conserva los endpoints iniciales de estado del servidor y eventos.

## Tecnologías

- Node.js con módulos ESM (`import` / `export`).
- Express.
- MongoDB Atlas.
- Mongoose.
- dotenv.
- bcrypt.
- jsonwebtoken.
- cookie-parser.
- Supertest.
- Test runner nativo de Node.js (`node:test`).
- Assertions de Node.js (`node:assert/strict`).

## Funcionalidades implementadas

- Configuración de Express separada del arranque del servidor.
- Conexión a MongoDB antes de iniciar el servidor HTTP.
- Configuración centralizada mediante variables de entorno.
- Registro de usuarios con validación de datos.
- Normalización del email.
- Control de emails duplicados.
- Hash asíncrono de contraseñas con bcrypt y 12 rondas.
- Protección del rol durante el registro público.
- Login con comparación de contraseñas mediante bcrypt.
- Generación de JWT con expiración configurable.
- Cookie de autenticación `currentUser`.
- Ruta protegida para consultar el usuario autenticado.
- Logout mediante eliminación de la cookie.
- Pruebas automatizadas de registro y autenticación.
- Colección de Postman con las rutas disponibles.

La gestión completa de eventos e inscripciones se desarrollará en próximas etapas.

## Requisitos

- Node.js compatible con las dependencias del proyecto. Desarrollo y pruebas realizados con Node.js 24.
- npm.
- Acceso a un cluster de MongoDB Atlas.
- Un usuario de base de datos con permisos sobre las bases utilizadas.
- La dirección IP desde la que se ejecuta el proyecto habilitada en Atlas.

La persistencia utiliza **MongoDB Atlas**.

MongoDB Compass es un cliente gráfico opcional para consultar la base de datos; no es necesario para ejecutar este proyecto. Los documentos también pueden consultarse desde la interfaz de Atlas.

## Instalación

Clonar el repositorio e ingresar al proyecto:

```bash
git clone https://github.com/francodominici90-collab/plataforma-eventos-backend.git
cd plataforma-eventos-backend
```

Instalar las dependencias según el archivo de bloqueo:

```bash
npm ci
```

Si npm informa que el script de instalación de bcrypt requiere aprobación, revisar el aviso y autorizar ese paquete:

```bash
npm approve-scripts bcrypt
```

Este paso depende de la versión y configuración de npm.

## Variables de entorno

Crear un archivo `.env` en la raíz tomando como referencia `.env.example`.

En PowerShell:

```powershell
Copy-Item .env.example .env
```

En Bash:

```bash
cp .env.example .env
```

Ejemplo de configuración:

```env
PORT=3000
NODE_ENV=development
MONGO_URL=mongodb+srv://USUARIO:CONTRASENA@HOST_DEL_CLUSTER/plataforma_eventos?retryWrites=true&w=majority
MONGO_TEST_URL=mongodb+srv://USUARIO:CONTRASENA@HOST_DEL_CLUSTER/plataforma_eventos_test?retryWrites=true&w=majority
JWT_SECRET=
JWT_EXPIRES_IN=1h
```

Las URI son ejemplos. Deben reemplazarse localmente por los datos del cluster y del usuario de base de datos.

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto HTTP. Debe ser un entero entre 1 y 65535. |
| `NODE_ENV` | Entorno: `development`, `test` o `production`. |
| `MONGO_URL` | URI de la base utilizada por la aplicación. |
| `MONGO_TEST_URL` | URI de la base exclusiva para las pruebas automatizadas. |
| `JWT_SECRET` | Clave privada para firmar y verificar los JWT. |
| `JWT_EXPIRES_IN` | Duración del JWT, por ejemplo `30s`, `15m`, `1h` o `1d`. |

`MONGO_TEST_URL` es necesaria para ejecutar los tests. No se utiliza para iniciar normalmente la aplicación.

La configuración exige una clave `JWT_SECRET` de al menos 32 bytes. Para generar una clave aleatoria:

```bash
node --input-type=module -e "import { randomBytes } from 'node:crypto'; console.log(randomBytes(32).toString('hex'));"
```

Copiar el resultado únicamente al archivo `.env`.

La URI debe incluir explícitamente el nombre de la base:

- Aplicación: `plataforma_eventos`.
- Pruebas: `plataforma_eventos_test`.

Ambas bases pueden estar en el mismo cluster de Atlas, pero deben ser diferentes.

El archivo `.env` está excluido de Git. No deben subirse credenciales, claves JWT ni tokens al repositorio.

## Ejecución

Iniciar el servidor:

```bash
npm start
```

Iniciar en modo desarrollo con seguimiento de cambios:

```bash
npm run dev
```

Con `PORT=3000`, la dirección base es:

```text
http://localhost:3000
```

El arranque conecta Mongoose a MongoDB y espera la inicialización del modelo User antes de abrir el puerto HTTP.

Si la conexión falla, el servidor no comienza a escuchar solicitudes.

Después de modificar variables de entorno, detener y volver a iniciar el proceso para asegurar que se cargue la nueva configuración.

## Arquitectura

El proyecto separa las responsabilidades en capas.

| Capa | Responsabilidad |
| --- | --- |
| Routes | Define endpoints y conecta middlewares y controladores. |
| Controllers | Recibe la petición y construye la respuesta HTTP. |
| Services | Implementa validaciones y reglas de negocio. |
| Repositories | Ofrece operaciones de acceso a datos utilizadas por los servicios. |
| DAO | Ejecuta consultas mediante Mongoose. |
| Models | Define los esquemas y modelos de MongoDB. |

El registro y el login recorren estas capas para acceder a los usuarios.

La ruta `/current` utiliza el middleware de autenticación para verificar el JWT y devolver los datos permitidos. No realiza una consulta adicional a MongoDB.

### Organización principal

| Ubicación | Contenido |
| --- | --- |
| `src/app.js` | Configuración de Express, middleware JSON, cookies y routers. |
| `src/server.js` | Conexión a la base e inicio del servidor HTTP. |
| `src/config/` | Variables de entorno y conexión a MongoDB. |
| `src/routes/` | Routers de health, events y sessions. |
| `src/controllers/` | Controladores de cada recurso. |
| `src/services/` | Lógica de registro y login. |
| `src/repositories/` | Acceso a usuarios mediante el DAO. |
| `src/dao/` | Consultas de usuarios con Mongoose. |
| `src/models/` | Modelos `User.js` y `Event.js`. |
| `src/middlewares/` | Middleware de autenticación. |
| `src/utils/` | Helpers reutilizables de bcrypt y JWT. |
| `tests/` | Pruebas automatizadas de registro y autenticación. |

Archivos principales del flujo de usuarios:

- `src/config/config.js`
- `src/config/db.config.js`
- `src/routes/sessions.router.js`
- `src/controllers/sessions.controller.js`
- `src/services/sessions.service.js`
- `src/repositories/users.repository.js`
- `src/dao/users.dao.js`
- `src/models/User.js`
- `src/middlewares/auth.middleware.js`
- `src/utils/hash.js`
- `src/utils/jwt.js`

## Modelos

### User

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `first_name` | String | Nombre del usuario. |
| `last_name` | String | Apellido del usuario. |
| `email` | String | Email normalizado y único. |
| `password` | String | Hash de la contraseña. |
| `role` | String | `user`, `organizer` o `admin`. Por defecto, `user`. |

El registro público asigna siempre el rol `user`, aunque se envíe otro valor en el body.

El campo `password` se excluye de las consultas por defecto. El login lo solicita explícitamente para comparar la contraseña, pero nunca lo devuelve al cliente.

### Event

Modelo base para las próximas etapas, con los campos:

- `title`
- `description`
- `date`
- `location`
- `capacity`

Todavía no se implementó la gestión de eventos. El endpoint inicial devuelve una lista vacía.

## Rutas disponibles

| Método | Ruta | Descripción | Autenticación |
| --- | --- | --- | --- |
| GET | `/api/health` | Comprueba que el servidor responde. | No |
| GET | `/api/events` | Devuelve la lista inicial vacía de eventos. | No |
| GET | `/api/sessions` | Confirma que el recurso sessions está disponible. | No |
| POST | `/api/sessions/register` | Registra un usuario. | No |
| POST | `/api/sessions/login` | Valida credenciales y establece la cookie. | No |
| GET | `/api/sessions/current` | Devuelve los datos del usuario autenticado. | Sí |
| POST | `/api/sessions/logout` | Elimina la cookie de autenticación. | No |

### GET /api/health

Request:

```http
GET http://localhost:3000/api/health
```

Response `200`:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

Este endpoint confirma que el servidor HTTP responde. No ejecuta una comprobación de conexión a MongoDB en cada solicitud.

### GET /api/events

Request:

```http
GET http://localhost:3000/api/events
```

Response `200`:

```json
{
  "status": "success",
  "payload": []
}
```

### GET /api/sessions

Request:

```http
GET http://localhost:3000/api/sessions
```

Response `200`:

```json
{
  "status": "success",
  "message": "Recurso de sesiones disponible."
}
```

Este endpoint no consulta la sesión del usuario. Para eso se utiliza `/api/sessions/current`.

### POST /api/sessions/register

Request:

```http
POST http://localhost:3000/api/sessions/register
Content-Type: application/json
```

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

Response `201`:

```json
{
  "status": "success",
  "payload": {
    "id": "507f1f77bcf86cd799439011",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

El identificador mostrado es ilustrativo. MongoDB genera el identificador real.

#### Validaciones del registro

- El body debe ser un objeto JSON.
- `first_name`, `last_name`, `email` y `password` son obligatorios.
- Los cuatro campos deben ser de tipo texto.
- Se eliminan espacios al inicio y al final del nombre y apellido.
- El email se normaliza con `trim()` y `toLowerCase()`.
- Se valida el formato del email antes de consultar la base.
- La contraseña debe tener al menos 8 caracteres.
- La contraseña no puede superar los 72 bytes en UTF-8.
- La contraseña no se recorta ni se transforma antes de hashearla.
- No se permite registrar un email existente.

El límite máximo se comprueba en bytes porque algunos caracteres, como los emojis, ocupan más de un byte en UTF-8.

La contraseña se hashea con bcrypt antes de guardarse. La respuesta nunca incluye el campo `password`.

Ejemplo de respuesta `400`:

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios: last_name, password"
}
```

El mensaje depende de la validación que falle.

Response `409` por email duplicado:

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

El control de duplicados combina una consulta previa y el manejo del error del índice único de MongoDB.

### POST /api/sessions/login

Request:

```http
POST http://localhost:3000/api/sessions/login
Content-Type: application/json
```

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Response `200`:

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

Además, la respuesta establece la cookie `currentUser`.

El login normaliza el email y compara la contraseña recibida con el hash guardado mediante bcrypt.

Los datos de login inválidos y las credenciales incorrectas devuelven `401` con el mismo mensaje:

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

La respuesta no distingue entre un email inexistente y una contraseña incorrecta.

#### JWT

El token contiene los datos del usuario:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "ana@mail.com",
  "role": "user"
}
```

La biblioteca agrega las marcas temporales `iat` y `exp`.

El JWT:

- Se firma con `JWT_SECRET`.
- Utiliza el algoritmo `HS256`.
- Tiene la expiración configurada mediante `JWT_EXPIRES_IN`.
- No contiene la contraseña ni su hash.
- Se verifica antes de permitir el acceso a `/current`.

#### Cookie de autenticación

| Propiedad | Valor |
| --- | --- |
| Nombre | `currentUser` |
| `httpOnly` | `true` |
| `sameSite` | `lax` |
| `maxAge` | `3600000` milisegundos, equivalente a una hora |
| `secure` | `true` únicamente cuando `NODE_ENV=production` |
| `path` | `/` |

En producción, la cookie requiere HTTPS por tener `secure: true`.

La duración de la cookie y la expiración del JWT son configuraciones independientes. Con `JWT_EXPIRES_IN=1h`, ambas duran una hora.

Si se configura un JWT de menor duración, el servidor lo rechaza al vencer aunque la cookie siga guardada.

### GET /api/sessions/current

Request, después de un login correcto:

```http
GET http://localhost:3000/api/sessions/current
```

No requiere body. El cliente debe enviar la cookie `currentUser`.

Response `200`:

```json
{
  "status": "success",
  "payload": {
    "id": "507f1f77bcf86cd799439011",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

El middleware lee la cookie, verifica la firma y expiración del JWT y asigna los datos permitidos a `req.user`.

Sin cookie o con un token inválido, manipulado o vencido, devuelve `401`:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

Los datos devueltos provienen del token. En esta etapa, `/current` no vuelve a consultar al usuario en la base de datos.

### POST /api/sessions/logout

Request:

```http
POST http://localhost:3000/api/sessions/logout
```

No requiere body.

Response `200`:

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

La respuesta elimina la cookie utilizando el mismo path y las mismas opciones de seguridad con las que fue creada.

Después del logout, una nueva solicitud a `/current` desde ese cliente debe devolver `401`.

El logout elimina la cookie del cliente. No revoca copias del JWT que pudieran haberse conservado: estas siguen siendo válidas hasta su expiración.

## Códigos HTTP

| Código | Uso |
| --- | --- |
| `200` | Consulta, login o logout exitoso. |
| `201` | Usuario registrado. |
| `400` | Datos de registro inválidos. |
| `401` | Credenciales incorrectas o falta de autenticación válida. |
| `409` | Email ya registrado. |
| `500` | Error interno inesperado. |

Los errores internos se registran en el servidor y se responden con un mensaje general, sin devolver detalles internos al cliente.

## Pruebas con Postman

El repositorio incluye:

```text
CODER - 95280.postman_collection.json
```

La colección original del profesor se amplió con las rutas actuales del proyecto.

### Importación y configuración

1. Iniciar el servidor.
2. Abrir Postman y seleccionar **Import**.
3. Seleccionar el archivo de la colección.
4. Revisar sus variables.

| Variable | Valor de ejemplo |
| --- | --- |
| `base_url` | `http://localhost:3000` |
| `user_email` | `prueba-postman@example.com` |
| `user_password` | `Secreta123` |

Los valores de usuario son datos ficticios para pruebas.

### Flujo principal

1. Registrar un usuario: debe devolver `201`.
2. Iniciar sesión con ese usuario: debe devolver `200`.
3. Revisar que exista la cookie `currentUser`.
4. Consultar `/current`: debe devolver `200` con `id`, `email` y `role`.
5. Ejecutar logout: debe devolver `200`.
6. Consultar nuevamente `/current`: debe devolver `401`.

Postman debe conservar y enviar la cookie entre las solicitudes. No es necesario copiar el JWT a un header Authorization.

Para repetir un registro exitoso, cambiar `user_email`. Si se utiliza un email ya registrado, la respuesta esperada es `409`.

### Casos adicionales

- Registro con campos faltantes.
- Email con formato inválido.
- Contraseña demasiado corta.
- Contraseña que supera los 72 bytes en UTF-8.
- Email duplicado con diferencias de mayúsculas o espacios.
- Intento de asignar un rol distinto de `user` desde el registro: el usuario creado conserva el rol `user`.
- Login con email inexistente.
- Login con contraseña incorrecta.
- Consulta de `/current` sin cookie.
- Consulta de `/current` con un token inválido o vencido.

También se verificó desde Atlas que la contraseña se almacena como hash y no como texto plano.

### Prueba manual de vencimiento

1. Cambiar temporalmente `JWT_EXPIRES_IN` a `5s` en `.env`.
2. Reiniciar el servidor.
3. Hacer un nuevo login.
4. Esperar más de cinco segundos.
5. Consultar `/current` y comprobar la respuesta `401`.
6. Restaurar `JWT_EXPIRES_IN=1h` y reiniciar el servidor.

Para continuar utilizando la API después de esta prueba, realizar otro login. Cambiar la configuración no renueva un token ya emitido.

## Pruebas automatizadas

Las pruebas automatizadas se incorporaron como mejora a partir de la devolución docente de la preentrega 2

Para implementarlas se utilizaron:

- **node:test:** organiza y ejecuta las pruebas.
- **Supertest:** envía peticiones HTTP a la aplicación Express y permite comprobar sus respuestas.
- **node:assert/strict:** verifica que los resultados coincidan con lo esperado.

Las pruebas complementan las comprobaciones manuales realizadas con Postman y permiten volver a verificar el registro y la autenticación después de modificar el código.

Se utiliza una base independiente en MongoDB Atlas, llamada `plataforma_eventos_test`, configurada mediante `MONGO_TEST_URL`. Esto permite comprobar la persistencia real sin modificar los usuarios de la base de la aplicación.

Cada ejecución genera usuarios con emails únicos y, al finalizar, elimina únicamente esos usuarios. No se vacían las colecciones ni se elimina la base de datos.

Archivos:

- `tests/register.test.js`
- `tests/auth.test.js`

### Configuración de la base de prueba

Definir `MONGO_TEST_URL` en `.env` con una URI que apunte a:

```text
plataforma_eventos_test
```

Puede utilizarse el mismo cluster de Atlas que aloja la aplicación, manteniendo las bases separadas:

| Uso | Variable | Base |
| --- | --- | --- |
| Aplicación | `MONGO_URL` | `plataforma_eventos` |
| Pruebas | `MONGO_TEST_URL` | `plataforma_eventos_test` |

Los archivos de prueba comprueban que:

- La URI de prueba incluya exactamente el nombre `plataforma_eventos_test`.
- `MONGO_URL` no apunte a esa base de prueba.
- La conexión activa utilice la base esperada.

La configuración del entorno se realiza dentro del proceso de pruebas antes de importar la aplicación. Estos cambios no modifican el archivo `.env` ni la configuración de un servidor que se encuentre ejecutándose en otro proceso.

### Ejecución

```bash
npm test
```

No es necesario iniciar el servidor con `npm start` o `npm run dev`: Supertest utiliza directamente la aplicación Express.

Sí se necesita acceso a MongoDB Atlas.

### Cobertura de registro

Ocho pruebas comprueban:

1. Registro exitoso, normalización del email, protección del rol y contraseña hasheada.
2. Rechazo de emails duplicados con diferencias de mayúsculas y espacios.
3. Rechazo de campos obligatorios faltantes.
4. Rechazo de email inválido.
5. Rechazo de contraseña demasiado corta.
6. Rechazo de contraseña de 73 bytes.
7. Rechazo de contraseña con emojis que supera los 72 bytes.
8. Rechazo de contraseña con tipo incorrecto.

Las pruebas de datos inválidos también comprueban que no se creen usuarios.

La prueba de registro exitoso verifica que:

- La respuesta no incluya la contraseña.
- El rol sea `user`.
- El valor almacenado no sea la contraseña en texto plano.
- El hash tenga 12 rondas de bcrypt.
- La contraseña original coincida con el hash mediante `bcrypt.compare()`.

### Cobertura de autenticación

Ocho pruebas comprueban:

1. Flujo login → current → logout → current rechazado, junto con los atributos de la cookie y el contenido del JWT.
2. Login con email inexistente.
3. Login con contraseña incorrecta.
4. Login sin contraseña.
5. `/current` sin cookie.
6. `/current` con un valor que no es un JWT.
7. `/current` con un JWT cuyo rol fue alterado sin volver a firmarlo.
8. `/current` con un JWT correctamente firmado pero vencido.

Se utiliza `request.agent(app)` para conservar las cookies durante la prueba del flujo completo.

El archivo de autenticación genera una clave JWT aleatoria para su proceso y configura una expiración de una hora. No modifica el archivo `.env`.

La prueba de manipulación cambia el rol del payload, pero conserva la firma original. El servidor debe detectar esa alteración y rechazar el token.

La prueba de vencimiento genera un token ya expirado, por lo que no requiere esperar ni cambiar la configuración del servidor.

Resultado comprobado:

```text
tests 16
pass 16
fail 0
```

Las pruebas automatizadas se ejecutan con `NODE_ENV=test`; no comprueban un despliegue HTTPS de producción.

### Documentación de referencia

- [Supertest](https://github.com/forwardemail/supertest)
- [Test runner de Node.js](https://nodejs.org/api/test.html)
- [Assertions de Node.js](https://nodejs.org/api/assert.html)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia el servidor. |
| `npm run dev` | Inicia el servidor con seguimiento de cambios. |
| `npm test` | Ejecuta las pruebas de registro y autenticación. |

## Alcance actual

Esta entrega implementa la base de autenticación.

Todavía no incluye:

- Autorización de endpoints según el rol.
- Passport.
- Recuperación de contraseñas.
- Refresh tokens o revocación de JWT.
- CRUD completo de eventos.
- Inscripciones y control de cupos.

Los roles están definidos en el modelo y presentes en el JWT, pero la autorización por rol se incorporará en próximas etapas.

## Organización del repositorio

El repositorio incluye:

- Código fuente.
- Pruebas automatizadas.
- Colección de Postman.
- `package.json` y `package-lock.json`.
- `.env.example`.
- `.gitignore`.
- Documentación de instalación y uso.

El archivo `.gitignore` excluye `.env`, `node_modules` y otros archivos locales o generados.

No deben incorporarse credenciales reales ni datos personales de usuarios a los ejemplos, capturas o archivos versionados.

## Base de clase

El proyecto comenzó a partir del repositorio proporcionado por el profesor:

https://github.com/pablobianchi/coder-95280

Sobre esa base se adaptó la temática a talleres municipales y se incorporaron los modelos, la arquitectura del flujo de usuarios, la conexión a MongoDB Atlas, el registro, la autenticación y las pruebas.

## Autor

Franco Dominici