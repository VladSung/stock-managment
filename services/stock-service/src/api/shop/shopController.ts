import type { Request, RequestHandler, Response } from "express";

import { shopService } from "@/api/shop/shopService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

export type CreateShopInput = {
  name: string;
  address: string;
};

class ShopController {
  public getShops: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await shopService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public createShop: RequestHandler = async (req: Request, res: Response) => {
    const input: CreateShopInput = req.body;
    console.log(input);
    const serviceResponse = await shopService.create(input);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const shopController = new ShopController();
