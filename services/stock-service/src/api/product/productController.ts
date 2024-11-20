import type { Request, RequestHandler, Response } from "express";

import { productService } from "@/api/product/productService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { FilterProductInput } from "./productRepository";

export type CreateProductInput = {
  name: string;
  plu: string;
};

class ProductController {
  public getProducts: RequestHandler = async (req: Request, res: Response) => {
    const filter = req.query as FilterProductInput;

    const serviceResponse = await (await productService).findAll(filter);
    return handleServiceResponse(serviceResponse, res);
  };

  public createProduct: RequestHandler = async (req: Request, res: Response) => {
    const input: CreateProductInput = req.body;
    const serviceResponse = await (await productService).create(input);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const productController = new ProductController();
