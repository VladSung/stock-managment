import { StatusCodes } from "http-status-codes";
import { HistoryRepository } from "#api/history/historyRepository";
import { HistoryService } from "#api/history/historyService";
import { ActionType, HistoryType } from "@prisma/client";

vi.mock("#api/history/historyRepository");

describe("historyService", () => {
  let historyServiceInstance;
  let historyRepositoryInstance;

  const productHistory = {
      id: 1,
      plu: 'testplu1',
      action: Array.from(Object.values(ActionType))[0],
      timestamp: new Date().toISOString(),
      shelfQuantity: undefined,
      orderQuantity: undefined,
      type: HistoryType.PRODUCT,
    };

    const stockHistory = {
      id: 1,
      plu: 'testplu1',
      action: Array.from(Object.values(ActionType))[0],
      timestamp: new Date().toISOString(),
      shelfQuantity: 100,
      orderQuantity: 50,
      type: HistoryType.STOCK,
    };

  const mockHistories = [
    productHistory,
    stockHistory,
    {...stockHistory, plu: 'testplu1', action: Array.from(Object.values(ActionType))[1]},
    {...stockHistory, plu: 'testplu1', action: Array.from(Object.values(ActionType))[2]},
  ];


  const mockHistory = mockHistories[0];

  beforeEach(() => {
    historyRepositoryInstance = new HistoryRepository();
    historyServiceInstance = new HistoryService(historyRepositoryInstance);
  });

  describe("findAll", () => {
    it("return all histories", async () => {
      // Arrange
      (historyRepositoryInstance.findAllAsync).mockReturnValue(mockHistories);

      // Act
      const result = await historyServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).equals("Histories found");
      expect(result.responseObject).toEqual(mockHistories);
    });

    it("return all histories by plu", async () => {
      const plu = "testplu1";
      // Arrange
      (historyRepositoryInstance.findAllAsync).mockReturnValue(mockHistories.filter(history => history.plu === plu));

      // Act
      const result = await historyServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).equals("Histories found");
      expect(result.responseObject).toEqual(mockHistories.filter(history => history.plu === plu));
    });

    it("return all histories by action", async () => {
      const action = ActionType.CREATE;
      // Arrange
      (historyRepositoryInstance.findAllAsync).mockReturnValue(mockHistories.filter(history => history.action === action));

      // Act
      const result = await historyServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).equals("Histories found");
      expect(result.responseObject).toEqual(mockHistories.filter(history => history.action === action));
    });

    it("returns a not found error for no histories found", async () => {
      // Arrange
      (historyRepositoryInstance.findAllAsync).mockReturnValue(null);

      // Act
      const result = await historyServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("No Histories found");
      expect(result.responseObject).toBeNull();
    });

    it("handles errors for findAllAsync", async () => {
      // Arrange
      (historyRepositoryInstance.findAllAsync).mockRejectedValue(new Error("Database error"));

      // Act
      const result = await historyServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("An error occurred while retrieving histories.");
      expect(result.responseObject).toBeNull();
    });
  });
});
