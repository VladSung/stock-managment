import { prisma } from "#common/database/prisma";
import { HistoryType } from "@prisma/client";
import { dateValidation } from "#common/utils/dateValidation";

export class HistoryRepository {
  /**
   * Find all histories matching the given filter
   * @param {object} [filter={}] - filter to apply
   * @param {number} [filter.shopId] - shop id to filter by
   * @param {string} [filter.plu] - plu to filter by
   * @param {object} [filter.date] - date range to filter by
   * @param {string} [filter.date.from] - from date (inclusive)
   * @param {string} [filter.date.to] - to date (inclusive)
   * @param {string} [filter.action] - action to filter by
   * @returns {Promise<History[]>} - array of matching histories
   */
  async findAllAsync(filter = {}) {
    const { shopId, plu, fromDate, toDate, action } = filter;
    
    const timestampFilter = fromDate || toDate
      ? {
        gte: fromDate ? dateValidation.parse(fromDate) : undefined,
        lte: toDate ? dateValidation.parse(toDate) : undefined,
      }
      : undefined;

    return prisma.history.findMany({ where: { plu, shopId, action, timestamp: timestampFilter } });
  }

  /**
   * Creates a history record for a product action
   * @param {object} input - object containing required fields
   * @param {string} input.plu - plu of the product
   * @param {string} input.timestamp - timestamp of the action (ISO 8601)
   * @param {string} input.action - action that was performed
   * @returns {Promise<History>} - created history record
   */
  async createForProductAsync(input) {
    const { plu, timestamp, action } = input;

    if (!(plu && timestamp && action)) {
      throw new Error(`Missing required fields. Received:  ${JSON.stringify(input)}`);
    }

    return prisma.history.create({
      data: {

        type: HistoryType.PRODUCT,
        plu, timestamp, action
      },
    })
  }

  /**
   * Creates a history record for a stock action
   * @param {object} input - object containing required fields
   * @param {number} input.shopId - shop id of the stock
   * @param {string} input.plu - plu of the stock
   * @param {string} input.timestamp - timestamp of the action (ISO 8601)
   * @param {string} input.action - action that was performed
   * @param {number} input.shelfQuantity - quantity on the shelf after the action
   * @param {number} input.orderQuantity - quantity ordered after the action
   * @returns {Promise<History>} - created history record
   */
  async createForStockAsync(input) {
    const { shopId, plu, timestamp, action, shelfQuantity, orderQuantity } = input;

    if (!(shopId && plu && timestamp && action && shelfQuantity && orderQuantity)) {
      throw new Error(`Missing required fields. Received: ${JSON.stringify(input)}`);
    }

    return prisma.history.create({
      data: {
        type: HistoryType.STOCK,
        shopId,
        plu,
        timestamp,
        action,
        shelfQuantity,
        orderQuantity
      },
    })
  }
}
