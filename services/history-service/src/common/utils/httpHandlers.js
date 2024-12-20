import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "#common/models/serviceResponse";

export const handleServiceResponse = (serviceResponse, response) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

export const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (err) {
    console.error(err);
    const errorMessage = `Invalid input: ${err.errors.map((e) => e.message).join(", ")}`;
    const statusCode = StatusCodes.BAD_REQUEST;
    const serviceResponse = ServiceResponse.failure(errorMessage, null, statusCode);
    return handleServiceResponse(serviceResponse, res);
  }
};
