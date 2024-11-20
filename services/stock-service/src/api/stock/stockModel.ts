import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type Stock = z.infer<typeof StockSchema>;

export const StockSchema = z.object({
  id: z.number(),
  productId: z.number(),
  shopId: z.number(),
  shelfQuantity: z.number().min(0),
  orderQuantity: z.number().min(0),
});

// Input Validation for 'GET users/:id' endpoint
export const GetStockSchema = z.object({
  query: z.object({
    shopId: z.number().optional(),
    plu: z.number().optional(),
    minShelfQuantity: z.number().min(0).optional(),
    maxShelfQuantity: z.number().min(0).optional(),
    minOrderQuantity: z.number().min(0).optional(),
    maxOrderQuantity: z.number().min(0).optional(),
  }),
});

export const CreateStockSchema = z.object({
  body: z.object({
    productId: z.number(),
    shopId: z.number(),
    shelfQuantity: z.number().min(0),
    orderQuantity: z.number().min(0),
  }),
});

export const UpdateStockSchema = z.object({
  params: z.object({ id: z.string().transform((id) => Number(id)) }),
  body: z.object({
    shelfQuantity: z.number().min(0).default(0),
    orderQuantity: z.number().min(0).default(0),
  }),
});
