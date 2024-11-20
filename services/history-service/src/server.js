import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pino } from "pino";

import { openAPIRouter } from "#api-docs/openAPIRouter";
import { healthCheckRouter } from "#api/healthCheck/healthCheckRouter";
import { historyRouter } from "#api/history/historyRouter";
import errorHandler from "#common/middleware/errorHandler";
import rateLimiter from "#common/middleware/rateLimiter";
import requestLogger from "#common/middleware/requestLogger";
import { env } from "#common/utils/envConfig";

const logger = pino({ name: "server start" });
const app = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/histories", historyRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
