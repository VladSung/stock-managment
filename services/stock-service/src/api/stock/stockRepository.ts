import type { Product } from "@/api/product/productModel";
import type { Stock } from "@/api/stock/stockModel";
import { prisma } from "@/common/database/prisma";

export type CreateStockInput = Omit<Stock, "id">;
export type UpdateStockInput = Omit<Stock, "productId" | "shopId">;

type QuantityFilter = {
  min: number;
  max: number;
};

export type FilterStockInput = Partial<
  Pick<Product, "plu"> & Pick<Stock, "shopId"> & { orderQuantity: QuantityFilter; shelfQuantity: QuantityFilter }
>;

export class StockRepository {
  async findAllAsync(filter: FilterStockInput): Promise<Stock[]> {
    const { plu, shopId, shelfQuantity, orderQuantity } = filter || {};

    return prisma.stock.findMany({
      where: {
        product: plu ? { plu } : undefined,
        shelfQuantity: {
          gte: shelfQuantity?.min,
          lte: shelfQuantity?.max,
        },
        orderQuantity: {
          gte: orderQuantity?.min,
          lte: orderQuantity?.max,
        },
        shopId,
      },
    });
  }

  async createAsync(input: CreateStockInput): Promise<Stock> {
    const { productId, shopId, shelfQuantity, orderQuantity } = input;

    return prisma.stock.create({
      data: {
        productId,
        shopId,
        shelfQuantity,
        orderQuantity,
      },
    });
  }

  async updateAsync(input: UpdateStockInput): Promise<Stock> {
    return prisma.stock.update({
      where: {
        id: input.id,
      },
      data: input,
    });
  }

  async findByIdAsync(id: number): Promise<Stock | null> {
    return prisma.stock.findUnique({
      where: {
        id,
      },
    });
  }
  async findByProductIdAndShopId(input: Pick<Stock, "productId" | "shopId">): Promise<Stock | null> {
    return prisma.stock.findUnique({
      where: {
        productId_shopId: {
          productId: input.productId,
          shopId: input.shopId,
        },
      },
    });
  }
}
