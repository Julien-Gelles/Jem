import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "fastify-jwt";
import Fastify, { FastifyRequest, FastifyReply } from "fastify";

dotenv.config({ path: "../../.env" });

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  type: "user" | "customer";
};

type LoginRequest = {
  email: string;
  password: string;
  type: "user" | "customer" | "admin";
};

type JwtUser = {
  id: string;
  email: string;
  type: "user" | "customer" | "admin";
};

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

fastify.get("/users", async (request, reply) => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ error: "Failed to fetch users" });
  }
});

fastify.post(
  "/register",
  {
    schema: {
      body: {
        type: "object",
        required: ["name", "email", "password", "type"],
        properties: {
          name: { type: "string", pattern: "^[a-zA-Z0-9]{3,30}$" },
          email: { type: "string", format: "email" },
          password: {
            type: "string",
            pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$",
          },
          type: { type: "string", enum: ["user", "customer"] },
        },
      },
    },
  },
  async (request, reply) => {
    const { name, email, password, type } = request.body as RegisterRequest;

    const nameRegex = /^[a-zA-Z0-9]{3,30}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

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
          data: { name, email, password: hashedPassword },
        });
      } else {
        return reply.status(400).send({ error: "Invalid type" });
      }

      return reply.status(201).send(newUser);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Failed to register" });
    }
  },
);

fastify.post("/login", async (request, reply) => {
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
      { expiresIn: "1h" },
    );

    return reply.send({ token });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ error: "Login failed" });
  }
});

fastify.get(
  "/user",
  { preValidation: [fastify.authenticate] },
  async (request, reply) => {
    try {
      const user = request.user as JwtUser;
      console.log(user);

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
  },
);

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
