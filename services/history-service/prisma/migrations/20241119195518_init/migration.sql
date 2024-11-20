-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'INCREASE', 'DECREASE');

-- CreateEnum
CREATE TYPE "HistoryType" AS ENUM ('PRODUCT', 'STOCK');

-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER,
    "plu" TEXT,
    "action" "ActionType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "shelfQuantity" INTEGER,
    "orderQuantity" INTEGER,
    "type" "HistoryType" NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);
