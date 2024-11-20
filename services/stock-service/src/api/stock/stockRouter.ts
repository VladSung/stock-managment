import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiRequest } from "@/api-docs/openAPIRequestBuilders";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateStockSchema, GetStockSchema, StockSchema, UpdateStockSchema } from "@/api/stock/stockModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { stockController } from "./stockController";

export const stockRegistry = new OpenAPIRegistry();
export const stockRouter: Router = express.Router();

stockRegistry.register("Stock", StockSchema);

stockRegistry.registerPath({
  method: "get",
  path: "/stocks",
  tags: ["Stock"],
  request: {
    params: GetStockSchema,
  },
  responses: createApiResponse(z.array(StockSchema), "Success"),
});

stockRouter.get("/", validateRequest(GetStockSchema), stockController.getStocks);

stockRegistry.registerPath({
  method: "post",
  path: "/stocks",
  tags: ["Stock"],
  request: createApiRequest(CreateStockSchema),
  responses: createApiResponse(z.array(StockSchema), "Success"),
});

stockRouter.post("/", validateRequest(CreateStockSchema), stockController.createStock);

stockRegistry.registerPath({
  method: "patch",
  path: "/stocks/{id}/increase",
  tags: ["Stock"],
  request: createApiRequest(UpdateStockSchema),
  responses: createApiResponse(z.array(StockSchema), "Success"),
});

stockRouter.patch("/:id/increase", validateRequest(UpdateStockSchema), stockController.increaseStock);

stockRegistry.registerPath({
  method: "patch",
  path: "/stocks/{id}/decrease",
  tags: ["Stock"],
  request: createApiRequest(UpdateStockSchema),
  responses: createApiResponse(z.array(StockSchema), "Success"),
});

stockRouter.patch("/:id/decrease", validateRequest(UpdateStockSchema), stockController.decreaseStock);
