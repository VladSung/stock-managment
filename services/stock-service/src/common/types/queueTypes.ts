import type { Product } from "@/api/product/productModel";
import type { Stock } from "@/api/stock/stockModel";

export enum Queue {
  PRODUCT_ACTIONS = "product_actions",
  STOCK_ACTIONS = "stock_actions",
}

export enum StockActionType {
  CREATE = "CREATE",
  INCREASE = "INCREASE",
  DECREASE = "DECREASE",
}

export enum ProductActionType {
  CREATE = "CREATE",
}

type ProductAction = {
  action: ProductActionType;
  timestamp: string;
} & Product;

type StockAction = {
  action: StockActionType;
  timestamp: string;
} & Omit<Stock, "productId"> &
  Pick<Product, "plu">;

type QueueActions = Record<Queue, ProductAction | StockAction>;

export type ExtractActionFromQueue<T extends Queue> = QueueActions[T];
