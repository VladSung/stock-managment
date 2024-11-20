import { RabbitMQService } from '#api/rabbitmq/rabbitmqService';
import { StatusCodes } from "http-status-codes";

import { HistoryRepository } from "#api/history/historyRepository";
import { ServiceResponse } from "#common/models/serviceResponse";
import { logger } from "#server";
import { Queue } from '#common/types/queueTypes';

export class HistoryService {
  historyRepository;
  rabbitMQService;

  constructor(repository = new HistoryRepository(), rabbitMQService = new RabbitMQService()) {
    this.historyRepository = repository;
    this.rabbitMQService = rabbitMQService;
  }

  async initialize() {
    await this.rabbitMQService.init();
    
    this.initializeConsumers();
    return this;
  }

  initializeConsumers() {
    this.rabbitMQService.consume(Queue.PRODUCT_ACTIONS, async (message, act) => {
      try {
        const history = await this.historyRepository.createForProductAsync(message);
        logger.info("Product action history created", history);
        act();
      } catch (error) {
        logger.error(`Error creating product action history: ${error.message}`);
      }
    });

    this.rabbitMQService.consume(Queue.STOCK_ACTIONS, async (message, act) => {
      try {
        const history = await this.historyRepository.createForStockAsync(message);
        logger.info("Stock action history created", history);
        act()
      } catch (error) {
        logger.error(`Error creating stock action history: ${error.message}`);
      }
    });

    return this;
  }

  /**
   * Find all histories matching the given filter
   * @param {object} [filter={}] - filter to apply
   * @param {number} [filter.shopId] - shop id to filter by
   * @param {string} [filter.plu] - plu to filter by
   * @param {object} [filter.date] - date range to filter by
   * @param {string} [filter.dateFrom] - from date (inclusive)
   * @param {string} [filter.dateTo] - to date (inclusive)
   * @param {string} [filter.action] - action to filter by
   * @returns {Promise<ServiceResponse<History[]>>} - array of matching histories
   */
  async findAll(filter) {
    try {
      const histories = await this.historyRepository.findAllAsync(filter);
      if (!histories || histories.length === 0) {
        return ServiceResponse.failure("No Histories found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Histories found", histories);
    } catch (error) {
      const errorMessage = `Error finding all histories: $${error.message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving histories.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const historyService = new HistoryService().initialize();
