import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Shop = z.infer<typeof ShopSchema>;
export type CreateShopInput = z.infer<typeof CreateShopSchema>;

export const ShopSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
});

export const GetShopSchema = z.object({});

export const CreateShopSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name must be at least 1 character long")
      .max(100, "Name must be at most 100 characters long"),
    address: z
      .string()
      .min(1, "Name must be at least 1 character long")
      .max(100, "Name must be at most 100 characters long"),
  }),
});
