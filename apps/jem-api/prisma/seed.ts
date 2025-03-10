import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const dataPath = path.join(__dirname, "data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  for (const item of data) {
    const existingProduct = await prisma.apiProduct.findFirst({
      where: {
        name: item.name,
        brand: item.brand,
      },
    });

    if (!existingProduct) {
      await prisma.apiProduct.create({
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
