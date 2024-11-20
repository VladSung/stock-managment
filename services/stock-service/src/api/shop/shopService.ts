import { StatusCodes } from "http-status-codes";

import type { Shop } from "@/api/shop/shopModel";
import { type CreateShopInput, ShopRepository } from "@/api/shop/shopRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

export class ShopService {
  private shopRepository: ShopRepository;

  constructor(repository: ShopRepository = new ShopRepository()) {
    this.shopRepository = repository;
  }

  // Retrieves all shops from the database
  async findAll(): Promise<ServiceResponse<Shop[] | null>> {
    try {
      const shops = await this.shopRepository.findAllAsync();
      if (!shops || shops.length === 0) {
        return ServiceResponse.failure("No Shops found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<Shop[]>("Shops found", shops);
    } catch (error) {
      const errorMessage = `Error finding all shops: $${(error as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving shops.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async create(input: CreateShopInput): Promise<ServiceResponse<Shop | null>> {
    try {
      const shopIsExists = await this.shopRepository.findByAddressAsync(input.address);
      if (shopIsExists) {
        return ServiceResponse.failure("Shop with this address already exists", null, StatusCodes.BAD_REQUEST);
      }
      const shop = await this.shopRepository.createAsync(input);
      return ServiceResponse.success<Shop>("Shop created", shop);
    } catch (error) {
      const errorMessage = `Error creating shop with address "${input.address}":, ${(error as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while creating shop. ",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const shopService = new ShopService();
