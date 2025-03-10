import Fastify, { FastifyInstance } from "fastify";
import { categoriesRoutes } from "../routes/categories";
import request from "supertest";
import { PrismaClient } from "@prisma/client";

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    apiProduct: {
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const prismaMock = new PrismaClient();

describe("Categories Routes", () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(categoriesRoutes);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it("should return a list of unique categories", async () => {
    (prismaMock.apiProduct.findMany as jest.Mock).mockResolvedValue([
      { category: "Boissons" },
      { category: "Produits laitiers" },
    ]);

    const response = await request(fastify.server).get("/category");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 200,
      length: 2,
      data: ["Boissons", "Produits laitiers"],
    });
  });

  it("should handle server errors gracefully", async () => {
    (prismaMock.apiProduct.findMany as jest.Mock).mockRejectedValue(
      new Error("Database error"),
    );

    const response = await request(fastify.server).get("/category");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 500,
      message: "Internal Server Error",
    });
  });
});
