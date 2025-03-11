import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "fastify-jwt";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import {
  JwtUser,
  LoginRequest,
  RegisterRequest,
  UpdateRequest,
} from "../entities/users";

const prisma = new PrismaClient();

export async function usersRoutes(fastify: FastifyInstance) {
  const nameRegex = /^[a-zA-Z0-9]{3,30}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

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
    "/users",
    {
      schema: {
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                password: { type: "string" },
              },
            },
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const users = await prisma.user.findMany();
        return users;
      } catch (err) {
        fastify.log.error(err);
        reply.status(500).send({ error: "Failed to fetch users" });
      }
    }
  );

  fastify.get(
    "/customers",
    {
      schema: {
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                password: { type: "string" },
                address: { type: "string" },
                zipcode: { type: "string" },
                city: { type: "string" },
                country: { type: "string" },
              },
            },
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const customers = await prisma.customer.findMany();
        return customers;
      } catch (err) {
        fastify.log.error(err);
        reply.status(500).send({ error: "Failed to fetch customers" });
      }
    }
  );

  fastify.get(
    "/admins",
    {
      schema: {
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                password: { type: "string" },
              },
            },
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const admins = await prisma.admin.findMany();
        return admins;
      } catch (err) {
        fastify.log.error(err);
        reply.status(500).send({ error: "Failed to fetch customers" });
      }
    }
  );

  fastify.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "password", "type"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string" },
            type: { type: "string", enum: ["user", "customer"] },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              password: { type: "string" },
              address: { type: "string", nullable: true },
              zipcode: { type: "string", nullable: true },
              city: { type: "string", nullable: true },
              country: { type: "string", nullable: true },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
        },
      },
    },
    async (request, reply) => {
      const { name, email, password, type } = request.body as RegisterRequest;

      if (!nameRegex.test(name)) {
        return reply.status(400).send({ error: "Invalid name format" });
      }

      if (!passwordRegex.test(password)) {
        return reply.status(400).send({ error: "Invalid password format" });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        let existingUser;
        let newUser;
        if (type === "user") {
          existingUser = await prisma.user.findUnique({ where: { email } });
          if (existingUser) {
            return reply.status(400).send({ error: "Email already in use" });
          }
          newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword },
          });
        } else if (type === "customer") {
          existingUser = await prisma.customer.findUnique({ where: { email } });
          if (existingUser) {
            return reply.status(400).send({ error: "Email already in use" });
          }
          newUser = await prisma.customer.create({
            data: {
              name,
              email,
              password: hashedPassword,
              address: "",
              zipcode: "",
              city: "",
              country: "",
            },
          });
        } else {
          return reply.status(400).send({ error: "Invalid type" });
        }

        return reply.status(201).send(newUser);
      } catch (err) {
        fastify.log.error(err);
        reply.status(500).send({ error: "Failed to register" });
      }
    }
  );

  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password", "type"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
            type: { type: "string", enum: ["user", "customer", "admin"] },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              token: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password, type } = request.body as LoginRequest;

      if (!["user", "customer", "admin"].includes(type)) {
        return reply.status(400).send({ error: "Invalid type" });
      }

      try {
        const user = await (type === "user"
          ? prisma.user.findUnique({ where: { email } })
          : type === "customer"
            ? prisma.customer.findUnique({ where: { email } })
            : prisma.admin.findUnique({ where: { email } }));

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return reply.status(401).send({ error: "Invalid email or password" });
        }

        const token = fastify.jwt.sign(
          { id: user.id, email: user.email, type: type },
          { expiresIn: "1h" }
        );

        return reply.send({ token });
      } catch (err) {
        fastify.log.error(err);
        reply.status(500).send({ error: "Login failed" });
      }
    }
  );

  fastify.get(
    "/user",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const user = request.user as JwtUser;

        if (!user?.type) {
          return reply.status(400).send({ error: "Invalid token data" });
        }

        let userData;
        if (user.type === "user") {
          userData = await prisma.user.findUnique({
            where: { email: user.email },
          });
        } else if (user.type === "customer") {
          userData = await prisma.customer.findUnique({
            where: { email: user.email },
          });
        } else if (user.type === "admin") {
          userData = await prisma.admin.findUnique({
            where: { email: user.email },
          });
        } else {
          return reply.status(400).send({ error: "Invalid user type" });
        }

        if (!userData) {
          return reply.status(404).send({ error: "User not found" });
        }

        return reply.send({ user: userData });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ error: "Failed to fetch user info" });
      }
    }
  );

  fastify.put(
    "/user/update",
    {
      preValidation: [fastify.authenticate],
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            currentPassword: { type: "string" },
            newPassword: { type: "string" },
            address: { type: "string" },
            zipcode: { type: "string" },
            city: { type: "string" },
            country: { type: "string" },
          },
          required: [],
        },
        response: {
          200: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                  address: { type: "string", nullable: true },
                  zipcode: { type: "string", nullable: true },
                  city: { type: "string", nullable: true },
                  country: { type: "string", nullable: true },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
            required: ["error"],
          },
        },
      },
    },

    async (request, reply) => {
      const user = request.user as JwtUser;
      const {
        name,
        currentPassword,
        newPassword,
        address,
        zipcode,
        city,
        country,
      } = request.body as UpdateRequest;

      if (user.type === "admin") {
        return reply
          .status(403)
          .send({ error: "Admin users cannot be modified." });
      }

      if (!name && (!currentPassword || !newPassword)) {
        return reply.status(400).send({
          error: "Provide a name or both current and new passwords to update.",
        });
      }

      try {
        let userData =
          user.type === "user"
            ? await prisma.user.findUnique({ where: { id: user.id } })
            : await prisma.customer.findUnique({ where: { id: user.id } });

        if (!userData) {
          return reply.status(404).send({ error: "User not found" });
        }

        let updatedData: Record<string, any> = {};

        if (name) {
          if (!nameRegex.test(name)) {
            return reply.status(400).send({ error: "Invalid name format" });
          }
          updatedData.name = name;
        }

        if (currentPassword && newPassword) {
          if (!passwordRegex.test(newPassword)) {
            return reply
              .status(400)
              .send({ error: "Invalid new password format" });
          }

          const passwordMatch = await bcrypt.compare(
            currentPassword,
            userData.password
          );
          if (!passwordMatch) {
            return reply
              .status(401)
              .send({ error: "Incorrect current password" });
          }

          updatedData.password = await bcrypt.hash(newPassword, 10);
        }

        if (user.type === "customer") {
          if (address) updatedData.address = address;
          if (zipcode) updatedData.zipcode = zipcode;
          if (city) updatedData.city = city;
          if (country) updatedData.country = country;
        }

        const updatedUser =
          user.type === "user"
            ? await prisma.user.update({
                where: { id: user.id },
                data: updatedData,
              })
            : await prisma.customer.update({
                where: { id: user.id },
                data: updatedData,
              });

        return reply.send({ user: updatedUser });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ error: "Failed to update user" });
      }
    }
  );
}
