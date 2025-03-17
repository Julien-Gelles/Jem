import Fastify, { FastifyInstance } from "fastify";
import { usersRoutes } from "../routes/users";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "fastify-jwt";
import "dotenv/config";

require("dotenv").config();

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    admin: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const prismaMock = new PrismaClient();

describe("Users Routes", () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    fastify.register(jwt, { secret: process.env.JWT_SECRET || "test_secret" });
    await fastify.register(usersRoutes);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it("should return a list of users", async () => {
    (prismaMock.user.findMany as jest.Mock).mockResolvedValue([
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
      },
    ]);

    const response = await request(fastify.server).get("/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
      },
    ]);
  });

  it("should handle server errors gracefully", async () => {
    (prismaMock.user.findMany as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(fastify.server).get("/users");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to fetch users" });
  });

  it("should register a new user", async () => {
    const newUser = {
      id: "2",
      name: "Jane Doe",
      email: "jane@example.com",
      password: "hashedpassword",
    };
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.user.create as jest.Mock).mockResolvedValue(newUser);
    (jest.spyOn(bcrypt, "hash") as jest.Mock).mockResolvedValue(
      "hashedpassword"
    );

    const response = await request(fastify.server).post("/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
      type: "user",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(newUser);
  });

  it("should handle registration errors gracefully", async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
    jest
      .spyOn(bcrypt, "hash")
      .mockImplementation(jest.fn(() => Promise.resolve("hashedpassword")));

    const response = await request(fastify.server).post("/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
      type: "user",
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to register" });
  });

  it("should login a user", async () => {
    const user = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      password: "hashedpassword",
    };
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(user);
    jest
      .spyOn(bcrypt, "compare")
      .mockImplementation(jest.fn(() => Promise.resolve(true)));
    jest
      .spyOn(fastify.jwt, "sign")
      .mockImplementation(jest.fn(() => "test_token"));

    const response = await request(fastify.server).post("/login").send({
      email: "john@example.com",
      password: "password123",
      type: "user",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: "test_token" });
  });

  it("should handle login errors gracefully", async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await request(fastify.server).post("/login").send({
      email: "john@example.com",
      password: "password123",
      type: "user",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid email or password" });
  });
});
