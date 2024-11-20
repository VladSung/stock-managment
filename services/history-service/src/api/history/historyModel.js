import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ActionType, HistoryType } from "@prisma/client";
import { z } from "zod";
import { dateValidation } from "#common/utils/dateValidation";

extendZodWithOpenApi(z);

export const HistorySchema = z.object({
  id: z.number(),
  plu: z.string(),
  shopId: z.number(),
  action: z.enum(Array.from(Object.values(ActionType))),
  timestamp: z.string(),
  shelfQuantity: z.number(),
  orderQuantity: z.number(),
  type: z.enum(Array.from(Object.values(HistoryType))),
});


export const GetHistorySchema = z.object({
  query: z.object({ 
    name: z.string().min(1).optional(), 
    plu: z.string().min(1).optional(),
    shopId: z.number().optional(),
    fromDate: dateValidation.optional(),
    toDate: dateValidation.optional(),
    action: z.enum(Array.from(Object.values(ActionType))).optional()
  })
});