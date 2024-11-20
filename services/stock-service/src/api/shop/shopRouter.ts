import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiRequest } from "@/api-docs/openAPIRequestBuilders";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateShopSchema, GetShopSchema, ShopSchema } from "@/api/shop/shopModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { shopController } from "./shopController";

export const shopRegistry = new OpenAPIRegistry();
export const shopRouter: Router = express.Router();

shopRegistry.register("Shop", ShopSchema);

shopRegistry.registerPath({
  method: "get",
  path: "/shops",
  tags: ["Shop"],
  request: {
    params: GetShopSchema,
  },
  responses: createApiResponse(z.array(ShopSchema), "Success"),
});

shopRouter.get("/", validateRequest(GetShopSchema), shopController.getShops);

shopRegistry.registerPath({
  method: "post",
  path: "/shops",
  tags: ["Shop"],
  request: createApiRequest(CreateShopSchema),
  responses: createApiResponse(z.array(ShopSchema), "Success"),
});

shopRouter.post("/", validateRequest(CreateShopSchema), shopController.createShop);
