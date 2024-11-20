import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type Product = z.infer<typeof ProductSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  plu: z.string(),
});

export const GetProductSchema = z.object({
  query: z.object({ name: z.string().min(1).optional(), plu: z.string().min(1).optional() }),
});

export const CreateProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name must be at least 1 character long")
      .max(100, "Name must be at most 100 characters long"),
    plu: z
      .string()
      .min(1, "Name must be at least 1 character long")
      .max(100, "Name must be at most 100 characters long"),
  }),
});
