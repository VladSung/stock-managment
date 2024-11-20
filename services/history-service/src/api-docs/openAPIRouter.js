import express from "express";
import swaggerUi from "swagger-ui-express";

import { generateOpenAPIDocument } from "#api-docs/openAPIDocumentGenerator";

export const openAPIRouter = express.Router();
const openAPIDocument = generateOpenAPIDocument();

openAPIRouter.get("/swagger.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(openAPIDocument);
});

openAPIRouter.use("/", swaggerUi.serve, swaggerUi.setup(openAPIDocument));
