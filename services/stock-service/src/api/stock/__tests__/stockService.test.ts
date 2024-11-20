import { StatusCodes } from "http-status-codes";
import type { Mock } from "vitest";

import { ProductService, productService } from "@/api/product/productService";
import { RabbitMQService } from "@/api/rabbitmq/rabbitmqService";
import type { Stock } from "@/api/stock/stockModel";
import { StockRepository } from "@/api/stock/stockRepository";
import { StockService } from "@/api/stock/stockService";

vi.mock("@/api/product/productService");
vi.mock("@/api/stock/stockRepository");

vi.mock("@/api/rabbitmq/rabbitmqService", () => ({
  RabbitMQService: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue({
      publish: vi.fn(),
    }),
    publish: vi.fn(),
  })),
}));

describe("stockService", () => {
  let stockServiceInstance: StockService;
  let stockRepositoryInstance: StockRepository;
  let rabbitMQServiceInstance: RabbitMQService;
  let productServiceInstance: ProductService;

  const mockStocks: Stock[] = [
    {
      id: 1,
      productId: 0,
      shopId: 0,
      shelfQuantity: 0,
      orderQuantity: 0,
    },
    {
      id: 2,
      productId: 1,
      shopId: 1,
      shelfQuantity: 10,
      orderQuantity: 5,
    },
  ];

  beforeEach(async () => {
    stockRepositoryInstance = new StockRepository();

    rabbitMQServiceInstance = new RabbitMQService();
    productServiceInstance = new ProductService();
    stockServiceInstance = new StockService(stockRepositoryInstance, rabbitMQServiceInstance, productServiceInstance);
  });

  describe("findAll", () => {
    it("return all stocks", async () => {
      // Arrange
      (stockRepositoryInstance.findAllAsync as Mock).mockReturnValue(mockStocks);

      // Act
      const result = await stockServiceInstance.findAll({});

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).equals("Stocks found");
      expect(result.responseObject).toEqual(mockStocks);
    });

    it("returns a not found error for no stocks found", async () => {
      // Arrange
      (stockRepositoryInstance.findAllAsync as Mock).mockReturnValue([]);

      // Act
      const result = await stockServiceInstance.findAll({});

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("No Stocks found");
      expect(result.responseObject).toBeNull();
    });

    it("handles errors for findAllAsync", async () => {
      // Arrange
      (stockRepositoryInstance.findAllAsync as Mock).mockRejectedValue(new Error("Database error"));

      // Act
      const result = await stockServiceInstance.findAll({});

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("An error occurred while retrieving stocks.");
      expect(result.responseObject).toBeNull();
    });
  });
});
