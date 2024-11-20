import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";

import { createApiResponse } from "#api-docs/openAPIResponseBuilders";
import { GetHistorySchema, HistorySchema } from "#api/history/historyModel";
import { validateRequest } from "#common/utils/httpHandlers";
import { historyController } from "#api/history/historyController";
import { createApiRequest } from "#api-docs/openAPIRequestBuilders";

export const historyRegistry = new OpenAPIRegistry();
export const historyRouter= express.Router();

historyRegistry.register("History", HistorySchema);

historyRegistry.registerPath({
  method: "get",
  path: "/histories",
  tags: ["History"],
  request: createApiRequest(GetHistorySchema),
  responses: createApiResponse(z.array(HistorySchema), "Success"),
});

historyRouter.get("/", validateRequest(GetHistorySchema), historyController.getHistories);