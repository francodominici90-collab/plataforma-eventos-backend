import app from "./app.js";
import { env } from "./config/config.js";
import { connectDB } from "./config/db.config.js";

try {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(
      `Servidor disponible en http://localhost:${env.PORT}`
    );
  });

  server.on("error", (error) => {
    console.error(
      "No se pudo iniciar el servidor HTTP:",
      error.message
    );

    process.exit(1);
  });
} catch (error) {
  console.error(
    "No se pudo conectar con MongoDB:",
    error.message
  );

  process.exit(1);
}