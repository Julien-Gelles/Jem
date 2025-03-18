import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { Product } from "../entities/products";

const prisma = new PrismaClient();

type Response = {
  status: number;
  current_length: number;
  total_length: number;
  current_page?: number;
  total_pages?: number;
  data?: Product[];
};

export async function productsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/products",
    {
      schema: {
        description: "Get some products with optional filters",
        tags: ["Products"],
        querystring: {
          type: "object",
          properties: {
            name: { type: "string" },
            category: { type: "string" },
            skip: { type: "string" },
            limit: { type: "string" },
          },
          required: [],
        },
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "number" },
              current_length: { type: "number" },
              total_length: { type: "number" },
              current_page: { type: "number" },
              total_pages: { type: "number" },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    name: { type: "string" },
                    image_url: { type: "string" },
                    brand: { type: "string" },
                    category: { type: "string" },
                    nutritional_score: { type: "string" },
                    code: { type: "string" },
                    capacity: { type: "string" },
                    capacity_unit: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { name, category, skip, limit } = request.query as {
        name?: string;
        category?: string;
        skip?: string;
        limit?: string;
      };

      try {
        const whereClause = {
          AND: [
            name
              ? {
                  OR: [
                    { name: { contains: name, mode: "insensitive" as const } },
                    { brand: { contains: name, mode: "insensitive" as const } },
                  ],
                }
              : {},
            category
              ? {
                  category: {
                    contains: category,
                    mode: "insensitive" as const,
                  },
                }
              : {},
          ],
        };

        const total: number = await prisma.apiProduct.count({
          where: whereClause,
        });

        const products: Product[] = await prisma.apiProduct.findMany({
          where: whereClause,
          skip: skip ? parseInt(skip) : undefined,
          take: limit ? parseInt(limit) : undefined,
        });

        const response: Response = {
          status: 200,
          current_length: products.length,
          total_length: total,
        };

        if (limit) {
          response.current_page =
            Math.floor((skip ? parseInt(skip) : 0) / parseInt(limit)) + 1;
          response.total_pages = Math.ceil(total / parseInt(limit));
        }
        response.data = products;

        return reply.status(200).send(response);
      } catch (error) {
        fastify.log.error(error);
        return reply
          .status(500)
          .send({ status: 500, message: "Internal Server Error" });
      }
    }
  );

  fastify.get(
    "/product/:code",
    {
      schema: {
        description: "Get a single product by code",
        tags: ["Products"],
        params: {
          type: "object",
          properties: {
            code: { type: "string" },
          },
          required: ["code"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "number" },
              name: { type: "string" },
              image_url: { type: "string" },
              brand: { type: "string" },
              category: { type: "string" },
              nutritional_score: { type: "string" },
              code: { type: "string" },
              capacity: { type: "string" },
              capacity_unit: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { code } = request.params as { code: string };

      try {
        const product = await prisma.apiProduct.findUnique({
          where: { code },
        });

        if (!product) {
          return reply
            .status(404)
            .send({ status: 404, message: "Product not found" });
        }

        return reply.status(200).send(product);
      } catch (error) {
        fastify.log.error(error);
        return reply
          .status(500)
          .send({ status: 500, message: "Internal Server Error" });
      }
    }
  );
}
