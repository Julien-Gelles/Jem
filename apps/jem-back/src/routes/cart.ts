import { PrismaClient } from "@prisma/client";
import jwt from "fastify-jwt";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import axios from "axios";
import { JwtUser } from "../entities/users";
import { CartProduct } from "../entities/cart";

const prisma = new PrismaClient();

export async function cartsRoutes(fastify: FastifyInstance) {
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
    }
  );

  fastify.get(
    "/cart",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.user as JwtUser;

      let cart = await prisma.cart.findUnique({
        where: { userId: user.id },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId: user.id,
            products: [],
            totalPrice: 0,
          },
        });
      }

      const products = await Promise.all(
        cart.products.map(async (product: CartProduct) => {
          const response = await axios.get(
            `http://jem_back:4000/product/${product.code}`,
            {
              headers: {
                Authorization: `${request.headers.authorization}`,
              },
            }
          );
          return {
            ...response.data,
            quantity: product.quantity,
          };
        })
      );

      return reply.send({
        id: cart.id,
        userId: cart.userId,
        totalPrice: cart.totalPrice,
        products,
      });
    }
  );

  fastify.post(
    "/cart/product",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { code, quantity } = request.body as {
        code: string;
        quantity: number;
      };

      let cart = await prisma.cart.findUnique({
        where: { userId: user.id },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId: user.id,
            products: [],
            totalPrice: 0,
          },
        });
      }

      const productIndex = cart.products.findIndex(
        (p: CartProduct) => p.code === code
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ code, quantity });
      }

      const productResponse = await axios.get(
        `http://jem_back:4000/product/${code}`,
        {
          headers: {
            Authorization: `${request.headers.authorization}`,
          },
        }
      );
      const productPrice = productResponse.data.price;
      cart.totalPrice += productPrice * quantity;

      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          products: cart.products,
          totalPrice: cart.totalPrice,
        },
      });

      return reply.send({ message: "Product added to cart" });
    }
  );

  fastify.put(
    "/cart/product",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { code, quantity } = request.body as {
        code: string;
        quantity: number;
      };

      let cart = await prisma.cart.findUnique({
        where: { userId: user.id },
      });

      if (!cart) {
        return reply.status(404).send({ message: "Cart not found" });
      }

      const productIndex = cart.products.findIndex(
        (p: CartProduct) => p.code === code
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity -= quantity;
        if (cart.products[productIndex].quantity <= 0) {
          cart.products.splice(productIndex, 1);
        }
      } else {
        return reply.status(404).send({ message: "Product not found in cart" });
      }

      const productResponse = await axios.get(
        `http://jem_api:3000/product/${code}`,
        {
          headers: {
            Authorization: `Bearer ${request.headers.authorization?.split(" ")[1]}`,
          },
        }
      );
      const productPrice = productResponse.data.price;
      cart.totalPrice -= productPrice * quantity;

      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          products: cart.products,
          totalPrice: cart.totalPrice,
        },
      });

      return reply.send({ message: "Product quantity updated in cart" });
    }
  );

  fastify.delete(
    "/cart/product",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.user as JwtUser;
      const { code, quantity } = request.body as {
        code: string;
        quantity: number;
      };

      let cart = await prisma.cart.findUnique({
        where: { userId: user.id },
      });

      if (!cart) {
        return reply.status(404).send({ message: "Cart not found" });
      }

      const productIndex = cart.products.findIndex(
        (p: CartProduct) => p.code === code
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity -= quantity;
        if (cart.products[productIndex].quantity <= 0) {
          cart.products.splice(productIndex, 1);
        }
      } else {
        return reply.status(404).send({ message: "Product not found in cart" });
      }

      const productResponse = await axios.get(
        `http://jem_back:4000/product/${code}`,
        {
          headers: {
            Authorization: `${request.headers.authorization}`,
          },
        }
      );
      const productPrice = productResponse.data.price;
      cart.totalPrice -= productPrice * quantity;
      if (cart.totalPrice < 0) {
        cart.totalPrice = 0;
      }

      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          products: cart.products,
          totalPrice: cart.totalPrice,
        },
      });

      return reply.send({ message: "Product quantity removed from cart" });
    }
  );

  fastify.delete(
    "/cart",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.user as JwtUser;

      const cart = await prisma.cart.findUnique({
        where: { userId: user.id },
      });

      if (!cart) {
        return reply.status(404).send({ message: "Cart not found" });
      }

      await prisma.cart.delete({
        where: { id: cart.id },
      });

      return reply.send({ message: "Cart deleted successfully" });
    }
  );
}
