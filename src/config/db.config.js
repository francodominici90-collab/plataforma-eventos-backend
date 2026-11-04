import mongoose from "mongoose";
import { env } from "./config.js";
import User from "../models/User.js";

export async function connectDB() {
  await mongoose.connect(env.MONGO_URL);

  await User.init();

  console.log("Conexión con MongoDB establecida");
  console.log(`Base de datos: ${mongoose.connection.name}`);
}