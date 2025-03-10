import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const usersPath = path.join(__dirname, "data/users.json");
  const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

  //password123
  for (const user of users) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: user.email,
      },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: user,
      });
    }
  }

  const productsPath = path.join(__dirname, "data/products.json");
  const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

  for (const item of products) {
    const existingProduct = await prisma.backProduct.findFirst({
      where: {
        productCode: item.productCode,
      },
    });

    if (!existingProduct) {
      await prisma.backProduct.create({
        data: item,
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
