import { StatusCodes } from "http-status-codes";

import { ServiceResponseSchema } from "#common/models/serviceResponse";

export function createApiResponse(schema, description, statusCode = StatusCodes.OK) {
  return {
    [statusCode]: {
      description,
      content: {
        "application/json": {
          schema: ServiceResponseSchema(schema),
        },
      },
    },
  };
}