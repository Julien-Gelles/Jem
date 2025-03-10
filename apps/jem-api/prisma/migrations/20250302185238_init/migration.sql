-- CreateTable
CREATE TABLE "ApiProduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "nutritional_score" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "capacity" DECIMAL(65,30) NOT NULL,
    "capacity_unit" TEXT NOT NULL,

    CONSTRAINT "ApiProduct_pkey" PRIMARY KEY ("id")
);
