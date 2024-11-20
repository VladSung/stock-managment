import { StatusCodes } from "http-status-codes";
import type { FilterStockInput } from "./stockRepository";

import { ProductService, productService } from "@/api/product/productService";
import { RabbitMQService } from "@/api/rabbitmq/rabbitmqService";
import type { Stock } from "@/api/stock/stockModel";
import { type CreateStockInput, StockRepository, type UpdateStockInput } from "@/api/stock/stockRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { Queue, StockActionType } from "@/common/types/queueTypes";
import { logger } from "@/server";

export class StockService {
  private stockRepository: StockRepository;
  private productService: ProductService;
  private rabbitMQService: RabbitMQService;

  constructor(
    repository: StockRepository = new StockRepository(),
    rabbitMQService: RabbitMQService = new RabbitMQService(Queue.STOCK_ACTIONS),
    productService: ProductService = new ProductService(),
  ) {
    this.stockRepository = repository;
    this.rabbitMQService = rabbitMQService;
    this.productService = productService;
  }

  async initialize() {
    await this.rabbitMQService.init();
    await this.productService.initialize();
    return this;
  }
  // Retrieves all stocks from the database
  async findAll(filter: FilterStockInput): Promise<ServiceResponse<Stock[] | null>> {
    try {
      const stocks = await this.stockRepository.findAllAsync(filter);
      if (!stocks || stocks.length === 0) {
        return ServiceResponse.failure("No Stocks found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<Stock[]>("Stocks found", stocks);
    } catch (error) {
      const errorMessage = `Error finding all stocks: $${(error as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving stocks.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(input: CreateStockInput): Promise<ServiceResponse<Stock | null>> {
    try {
      const stockIsExists = await this.stockRepository.findByProductIdAndShopId({
        productId: input.productId,
        shopId: input.shopId,
      });
      if (stockIsExists) {
        return ServiceResponse.failure(
          `Stock with shopId "${input.shopId}" and productId "${input.productId}" already exists`,
          null,
          StatusCodes.BAD_REQUEST,
        );
      }
      const stock = await this.stockRepository.createAsync(input);

      const product = await this.productService.findAll({ id: stock.productId });
      this.rabbitMQService.publish({
        action: StockActionType.CREATE,
        plu: product.responseObject?.[0].plu!,
        timestamp: new Date().toISOString(),
        shopId: stock.shopId,
        shelfQuantity: stock.shelfQuantity,
        orderQuantity: stock.orderQuantity,
        id: stock.id,
      });

      return ServiceResponse.success<Stock>("Stock created", stock);
    } catch (error) {
      const errorMessage = `Error creating stock with shopId "${input.shopId}" and productId "${input.productId}":, ${(error as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while creating stock. ",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async increase(input: UpdateStockInput): Promise<ServiceResponse<Stock | null>> {
    try {
      const stock = await this.stockRepository.findByIdAsync(input.id);
      if (!stock) {
        return ServiceResponse.failure("Stock not found", null, StatusCodes.NOT_FOUND);
      }

      stock.orderQuantity += input.orderQuantity;
      stock.shelfQuantity += input.shelfQuantity;

      await this.stockRepository.updateAsync(stock);

      const product = await this.productService.findAll({ id: stock.productId });

      this.rabbitMQService.publish({
        plu: product.responseObject?.[0].plu!,
        shopId: stock.shopId,
        shelfQuantity: stock.shelfQuantity,
        orderQuantity: stock.orderQuantity,
        id: stock.id,
        action: StockActionType.INCREASE,
        timestamp: new Date().toISOString(),
      });

      return ServiceResponse.success<Stock>("Stock updated", stock);
    } catch (error) {
      const errorMessage = `Error increasing stock with id "${input.id}":, ${(error as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while increasing stock. ",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async decrease(input: UpdateStockInput): Promise<ServiceResponse<Stock | null>> {
    try {
      const stock = await this.stockRepository.findByIdAsync(input.id);
      if (!stock) {
        return ServiceResponse.failure("Stock not found", null, StatusCodes.NOT_FOUND);
      }

      const updatedStock = {
        ...stock,
        orderQuantity: stock.orderQuantity - input.orderQuantity,
        shelfQuantity: stock.shelfQuantity - input.shelfQuantity,
      };

      if (updatedStock.orderQuantity < 0 || updatedStock.shelfQuantity < 0) {
        return ServiceResponse.failure(
          `The quantity specified in the reduction application exceeds the available stock.
          orderQuantity: ${stock.orderQuantity}, shelfQuantity: ${stock.shelfQuantity},
          orderQuantity requested: ${input.orderQuantity}, shelfQuantity requested: ${input.shelfQuantity}`,
          null,
          StatusCodes.BAD_REQUEST,
        );
      }
      await this.stockRepository.updateAsync(updatedStock);

      const product = await this.productService.findAll({ id: stock.productId });

      this.rabbitMQService.publish({
        plu: product.responseObject?.[0].plu!,
        shopId: stock.shopId,
        shelfQuantity: stock.shelfQuantity,
        orderQuantity: stock.orderQuantity,
        id: stock.id,
        action: StockActionType.DECREASE,
        timestamp: new Date().toISOString(),
      });

      return ServiceResponse.success<Stock>("Stock updated", stock);
    } catch (error) {
      const errorMessage = `Error decreasing stock with id "${input.id}":, ${(error as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while decreasing stock. ",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const stockService = new StockService().initialize();
