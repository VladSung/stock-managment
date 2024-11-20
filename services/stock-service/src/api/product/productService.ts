import { StatusCodes } from "http-status-codes";

import type { Product } from "@/api/product/productModel";
import { type CreateProductInput, type FilterProductInput, ProductRepository } from "@/api/product/productRepository";
import { RabbitMQService } from "@/api/rabbitmq/rabbitmqService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { ProductActionType, Queue } from "@/common/types/queueTypes";
import { logger } from "@/server";

export class ProductService {
  private productRepository: ProductRepository;
  private rabbitMQService: RabbitMQService;

  constructor(
    repository: ProductRepository = new ProductRepository(),
    rabbitMQService: RabbitMQService = new RabbitMQService(Queue.PRODUCT_ACTIONS),
  ) {
    this.productRepository = repository;
    this.rabbitMQService = rabbitMQService;
  }

  async initialize() {
    await this.rabbitMQService.init();
    return this;
  }
  // Retrieves all products from the database
  async findAll(filter: FilterProductInput = {}): Promise<ServiceResponse<Product[] | null>> {
    try {
      const products = await this.productRepository.findAllAsync(filter);
      if (!products || products.length === 0) {
        return ServiceResponse.failure("No Products found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<Product[]>("Products found", products);
    } catch (error) {
      const errorMessage = `Error finding all products: $${(error as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving products.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async create(input: CreateProductInput): Promise<ServiceResponse<Product | null>> {
    try {
      const productIsExists = await this.productRepository.findByPluAsync(input.plu);
      if (productIsExists) {
        return ServiceResponse.failure(`Product with plu "${input.plu}" already exists`, null, StatusCodes.BAD_REQUEST);
      }
      const product = await this.productRepository.createAsync(input);

      this.rabbitMQService.publish({
        action: ProductActionType.CREATE,
        ...product,
        timestamp: new Date().toISOString(),
      });

      return ServiceResponse.success<Product>("Product created", product);
    } catch (error) {
      const errorMessage = `Error creating product with plu "${input.plu}":, ${(error as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while creating product.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const productService = new ProductService().initialize();
