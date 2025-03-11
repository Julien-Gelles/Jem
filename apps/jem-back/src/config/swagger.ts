import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

export const setupSwagger = (fastify: FastifyInstance) => {
  fastify.register(fastifySwagger, {
    swagger: {
      info: {
        title: "Fastify API",
        description: "API documentation for Fastify with Prisma",
        version: "1.0.0",
      },
      host: "localhost:4000",
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
    },
  });

  fastify.register(fastifySwaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
    transformSpecification: (swaggerObject) => swaggerObject,
    transformSpecificationClone: true,
  });
};
