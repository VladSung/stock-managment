import type { Request, RequestHandler, Response } from "express";

import { stockService } from "@/api/stock/stockService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { CreateStockInput, FilterStockInput, UpdateStockInput } from "./stockRepository";

class StockController {
  public getStocks: RequestHandler = async (req: Request, res: Response) => {
    const filter = req.query as FilterStockInput;

    const serviceResponse = await (await stockService).findAll(filter);
    return handleServiceResponse(serviceResponse, res);
  };

  public createStock: RequestHandler = async (req: Request, res: Response) => {
    const input: CreateStockInput = req.body;
    const serviceResponse = await (await stockService).create(input);
    return handleServiceResponse(serviceResponse, res);
  };

  public increaseStock: RequestHandler = async (req: Request, res: Response) => {
    const input: UpdateStockInput = req.body;

    const { id } = req.params as unknown as { id: string };
    const serviceResponse = await (await stockService).increase({ ...input, id: Number(id) });
    return handleServiceResponse(serviceResponse, res);
  };

  public decreaseStock: RequestHandler = async (req: Request, res: Response) => {
    const input: UpdateStockInput = req.body;
    const { id } = req.params as unknown as { id: string };
    const serviceResponse = await (await stockService).decrease({ ...input, id: Number(id) });
    return handleServiceResponse(serviceResponse, res);
  };
}

export const stockController = new StockController();
