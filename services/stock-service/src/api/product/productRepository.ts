import type { Product } from "@/api/product/productModel";
import { prisma } from "@/common/database/prisma";

export type CreateProductInput = {
  name: string;
  plu: string;
};

export type FilterProductInput = {
  id?: number;
  name?: string;
  plu?: string;
};

export class ProductRepository {
  async findAllAsync(filter: FilterProductInput): Promise<Product[]> {
    const { name, plu, id } = filter;
    return prisma.product.findMany({ where: { plu, id, name: { contains: name } } });
  }

  async createAsync(input: CreateProductInput): Promise<Product> {
    const { name, plu } = input;

    return prisma.product.create({
      data: {
        name,
        plu,
      },
    });
  }

  async findByPluAsync(plu: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { plu } });
  }
}
