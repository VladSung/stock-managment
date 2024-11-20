import { historyService } from "#api/history/historyService";
import { handleServiceResponse } from "#common/utils/httpHandlers";

class HistoryController {
  getHistories = async (req, res) => {
    const filter = req.query;
    const serviceResponse = await (await historyService).findAll(filter);
    return handleServiceResponse(serviceResponse, res);
  };

  createHistory = async (req, res) => {
    const input = req.body;
    const serviceResponse = await (await historyService).create(input);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const historyController = new HistoryController();
