import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { Category } from "../entities/categories";

const prisma = new PrismaClient();

type ProductCategory = { category: string };

export async function categoriesRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/category",
    {
      schema: {
        description: "Get all the different product's categories",
        tags: ["Categories"],
        summary: "Get categories",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "number" },
              length: { type: "number" },
              data: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const products: ProductCategory[] = await prisma.apiProduct.findMany({
          select: { category: true },
          distinct: ["category"],
        });

        const categories: Category[] = products.map(
          (product: ProductCategory) => product.category,
        );

        return reply.status(200).send({
          status: 200,
          length: categories.length,
          data: categories,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply
          .status(500)
          .send({ status: 500, message: "Internal Server Error" });
      }
    },
  );
}
