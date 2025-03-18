import { PrismaClient } from "@prisma/client";
import jwt from "fastify-jwt";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import axios from "axios";

const prisma = new PrismaClient();

export async function productsRoutes(fastify: FastifyInstance) {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET as string,
  });

  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: "Unauthorized" });
      }
    },
  );

  fastify.get(
    "/products",
    {
      schema: {
        description:
          "Get all back products with additional details from jem-api",
        tags: ["BackProducts"],
        summary: "Get back products with details",
        response: {
          200: {
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
                price: { type: "number" },
                quantity: { type: "number" },
              },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const backProducts = await prisma.backProduct.findMany();

        const productDetailsPromises = backProducts.map(async (product) => {
          try {
            const response = await axios.get(
              `http://jem_api:3000/product/${product.productCode}`,
            );

            if (response.data && response.status === 200) {
              return {
                ...response.data,
                price: product.price,
                quantity: product.quantity,
              };
            }
          } catch (error) {
            fastify.log.error(
              `Failed to fetch product details for ${product.productCode}: ${error}`,
            );
          }
          return null;
        });

        const products = (await Promise.all(productDetailsPromises)).filter(
          (product) => product !== null,
        );

        return reply.status(200).send(products);
      } catch (error) {
        fastify.log.error(error);
        return reply
          .status(500)
          .send({ status: 500, message: "Internal Server Error" });
      }
    },
  );

  fastify.get(
    "/product/:code",
    {
      schema: {
        description:
          "Get a single back product with additional details from jem-api",
        tags: ["BackProducts"],
        summary: "Get back product with details",
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
              price: { type: "number" },
              quantity: { type: "number" },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (request, reply) => {
      const { code } = request.params as { code: string };

      try {
        const backProduct = await prisma.backProduct.findUnique({
          where: { productCode: code },
        });

        if (!backProduct) {
          return reply
            .status(404)
            .send({ status: 404, message: "Product not found" });
        }

        try {
          const response = await axios.get(
            `http://jem_api:3000/product/${backProduct.productCode}`,
          );

          if (response.data && response.status === 200) {
            const productDetails = {
              ...response.data,
              price: backProduct.price,
              quantity: backProduct.quantity,
            };
            return reply.status(200).send(productDetails);
          } else {
            return reply
              .status(404)
              .send({ status: 404, message: "Product details not found" });
          }
        } catch (error) {
          fastify.log.error(
            `Failed to fetch product details for ${backProduct.productCode}: ${error}`,
          );
          return reply
            .status(500)
            .send({ status: 500, message: "Failed to fetch product details" });
        }
      } catch (error) {
        fastify.log.error(error);
        return reply
          .status(500)
          .send({ status: 500, message: "Internal Server Error" });
      }
    },
  );

  fastify.post(
    "/product",
    {
      schema: {
        description: "Create a new back product",
        tags: ["BackProducts"],
        summary: "Create back product",
        body: {
          type: "object",
          required: ["productCode", "price", "quantity"],
          properties: {
            productCode: { type: "string" },
            price: { type: "number" },
            quantity: { type: "number" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              productCode: { type: "string" },
              price: { type: "number" },
              quantity: { type: "number" },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (request, reply) => {
      const { productCode, price, quantity } = request.body as {
        productCode: string;
        price: number;
        quantity: number;
      };

      try {
        const newProduct = await prisma.backProduct.create({
          data: {
            productCode,
            price,
            quantity,
          },
        });
        return reply.status(201).send(newProduct);
      } catch (error) {
        fastify.log.error(error);
        return reply
          .status(500)
          .send({ status: 500, message: "Internal Server Error" });
      }
    },
  );

  fastify.put(
    "/product/:code",
    {
      schema: {
        description: "Update a back product",
        tags: ["BackProducts"],
        summary: "Update back product",
        body: {
          type: "object",
          properties: {
            price: { type: "number" },
            quantity: { type: "number" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              productCode: { type: "string" },
              price: { type: "number" },
              quantity: { type: "number" },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (request, reply) => {
      const { code } = request.params as { code: string };
      const { price, quantity } = request.body as {
        price?: number;
        quantity?: number;
      };

      try {
        const updatedProduct = await prisma.backProduct.update({
          where: { productCode: code },
          data: {
            ...(price !== undefined && { price }),
            ...(quantity !== undefined && { quantity }),
          },
        });
        return reply.status(200).send(updatedProduct);
      } catch (error) {
        fastify.log.error(error);
        return reply
          .status(500)
          .send({ status: 500, message: "Internal Server Error" });
      }
    },
  );

  fastify.delete(
    "/product/:code",
    {
      schema: {
        description: "Delete a back product",
        tags: ["BackProducts"],
        summary: "Delete back product",
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
              status: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
      preValidation: [fastify.authenticate],
    },
    async (request, reply) => {
      const { code } = request.params as { code: string };

      try {
        const deletedProduct = await prisma.backProduct.delete({
          where: { productCode: code },
        });
        return reply.status(200).send({
          status: "success",
          message: `Product with code ${code} deleted successfully`,
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
