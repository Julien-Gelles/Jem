import Fastify from "fastify";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors";
import { setupSwagger } from "./config/swagger";
import { usersRoutes } from "./routes/users";
dotenv.config({ path: "../../.env" });

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, {
  origin: "*",
  methods: ["*"],
});

setupSwagger(fastify);

fastify.register(usersRoutes);

const start = async () => {
  try {
    const port = process.env.BACK_PORT;
    await fastify.listen({ port: Number(port), host: "0.0.0.0" });
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
