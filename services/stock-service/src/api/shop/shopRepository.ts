import type { Shop } from "@/api/shop/shopModel";
import { prisma } from "@/common/database/prisma";

export type CreateShopInput = {
  name: string;
  address: string;
};

export class ShopRepository {
  async findAllAsync(): Promise<Shop[]> {
    return prisma.shop.findMany();
  }

  async createAsync(input: CreateShopInput): Promise<Shop> {
    const { name, address } = input;

    return prisma.shop.create({
      data: {
        name,
        address,
      },
    });
  }

  async findByAddressAsync(address: string): Promise<Shop | null> {
    return prisma.shop.findUnique({ where: { address } });
  }
}
