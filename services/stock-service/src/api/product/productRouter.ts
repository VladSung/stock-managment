import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiRequest } from "@/api-docs/openAPIRequestBuilders";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateProductSchema, GetProductSchema, ProductSchema } from "@/api/product/productModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { productController } from "./productController";

export const productRegistry = new OpenAPIRegistry();
export const productRouter: Router = express.Router();

productRegistry.register("Product", ProductSchema);

productRegistry.registerPath({
  method: "get",
  path: "/products",
  tags: ["Product"],
  request: {
    params: GetProductSchema,
  },
  responses: createApiResponse(z.array(ProductSchema), "Success"),
});

productRouter.get("/", validateRequest(GetProductSchema), productController.getProducts);

productRegistry.registerPath({
  method: "post",
  path: "/products",
  tags: ["Product"],
  request: createApiRequest(CreateProductSchema),
  responses: createApiResponse(z.array(ProductSchema), "Success"),
});

productRouter.post("/", validateRequest(CreateProductSchema), productController.createProduct);
