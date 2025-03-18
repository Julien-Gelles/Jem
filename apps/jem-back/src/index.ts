import Fastify from "fastify";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors";
import { setupSwagger } from "./config/swagger";
import { usersRoutes } from "./routes/users";
import { productsRoutes } from "./routes/products";

dotenv.config({ path: "../../.env" });

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

setupSwagger(fastify);
fastify.register(usersRoutes);
fastify.register(productsRoutes);

const start = async () => {
  try {
    const port = process.env.BACK_PORT || 3000;
    await fastify.listen({ port: Number(port), host: "0.0.0.0" });
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
