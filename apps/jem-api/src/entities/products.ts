import { Decimal } from "@prisma/client/runtime/library";

export type Product = {
  id: number;
  name: string;
  image_url: string;
  brand: string;
  category: string;
  nutritional_score: string;
  code: string;
  capacity: Decimal;
  capacity_unit: string;
};
