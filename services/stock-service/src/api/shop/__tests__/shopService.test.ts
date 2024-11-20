import { StatusCodes } from "http-status-codes";
import type { Mock } from "vitest";

import { ProductService } from "@/api/product/productService";
import { RabbitMQService } from "@/api/rabbitmq/rabbitmqService";
import type { Stock } from "@/api/stock/stockModel";
import { StockRepository } from "@/api/stock/stockRepository";
import { StockService } from "@/api/stock/stockService";

vi.mock("@/api/stock/stockRepository");
vi.mock("@/api/product/productService");
vi.mock("@/api/rabbitmq/rabbitmqService");

describe("stockService", () => {
  let stockServiceInstance: StockService;
  let stockRepositoryInstance: StockRepository;
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

  beforeEach(() => {
    stockRepositoryInstance = new StockRepository();
    productServiceInstance = new ProductService();

    stockServiceInstance = new StockService(stockRepositoryInstance, undefined, productServiceInstance);

    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("creates a new stock successfully", async () => {
      // Arrange
      const createInput = {
        productId: 3,
        shopId: 3,
        shelfQuantity: 20,
        orderQuantity: 10,
      };

      (stockRepositoryInstance.findByProductIdAndShopId as Mock).mockReturnValue(null);
      (stockRepositoryInstance.createAsync as Mock).mockReturnValue({
        ...createInput,
        id: 3,
      });
      (productServiceInstance.findAll as Mock).mockReturnValue({
        responseObject: [{ plu: "TEST123" }],
      });

      // Act
      const result = await stockServiceInstance.create(createInput);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).equals("Stock created");
      expect(result.responseObject).toEqual(expect.objectContaining(createInput));
    });

    it("fails to create stock when it already exists", async () => {
      // Arrange
      const createInput = {
        productId: 1,
        shopId: 1,
        shelfQuantity: 20,
        orderQuantity: 10,
      };

      (stockRepositoryInstance.findByProductIdAndShopId as Mock).mockReturnValue(mockStocks[1]);

      // Act
      const result = await stockServiceInstance.create(createInput);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain("already exists");
      expect(result.responseObject).toBeNull();
    });
  });

  describe("increase", () => {
    it("increases stock quantity successfully", async () => {
      // Arrange
      const increaseInput = {
        id: 1,
        shelfQuantity: 5,
        orderQuantity: 3,
      };

      const existingStock = mockStocks[0];
      (stockRepositoryInstance.findByIdAsync as Mock).mockReturnValue(existingStock);
      (productServiceInstance.findAll as Mock).mockReturnValue({
        responseObject: [{ plu: "TEST123" }],
      });

      // Act
      const result = await stockServiceInstance.increase(increaseInput);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).equals("Stock updated");
      expect(result.responseObject).toEqual(
        expect.objectContaining({
          shelfQuantity: increaseInput.shelfQuantity,
          orderQuantity: increaseInput.orderQuantity,
        }),
      );
    });

    it("fails to increase non-existent stock", async () => {
      // Arrange
      const increaseInput = {
        id: 999,
        shelfQuantity: 5,
        orderQuantity: 3,
      };

      (stockRepositoryInstance.findByIdAsync as Mock).mockReturnValue(null);

      // Act
      const result = await stockServiceInstance.increase(increaseInput);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("Stock not found");
      expect(result.responseObject).toBeNull();
    });
  });

  describe("decrease", () => {
    it("decreases stock quantity successfully", async () => {
      // Arrange
      const decreaseInput = {
        id: 2,
        shelfQuantity: 3,
        orderQuantity: 2,
      };

      const existingStock = mockStocks[1];
      (stockRepositoryInstance.findByIdAsync as Mock).mockReturnValue(existingStock);
      (productServiceInstance.findAll as Mock).mockReturnValue({
        responseObject: [{ plu: "TEST123" }],
      });

      // Act
      const result = await stockServiceInstance.decrease(decreaseInput);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).equals("Stock updated");
      expect(result.responseObject).toEqual(expect.objectContaining(existingStock));
    });

    it("fails to decrease stock when quantity exceeds available stock", async () => {
      // Arrange
      const decreaseInput = {
        id: 2,
        shelfQuantity: 20,
        orderQuantity: 10,
      };

      const existingStock = mockStocks[1];
      (stockRepositoryInstance.findByIdAsync as Mock).mockReturnValue(existingStock);

      // Act
      const result = await stockServiceInstance.decrease(decreaseInput);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain("exceeds the available stock");
      expect(result.responseObject).toBeNull();
    });
  });
});
