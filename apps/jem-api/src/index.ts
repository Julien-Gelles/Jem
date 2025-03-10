import Fastify from "fastify";
import dotenv from "dotenv";
import { setupSwagger } from "./config/swagger";
import { productsRoutes } from "./routes/products";
import { categoriesRoutes } from "./routes/categories";

dotenv.config();

const fastify = Fastify({ logger: true });

setupSwagger(fastify);

fastify.register(productsRoutes);
fastify.register(categoriesRoutes);

const start = async () => {
  try {
    const port = process.env.API_PORT;
    await fastify.listen({ port: Number(port), host: "0.0.0.0" });
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
