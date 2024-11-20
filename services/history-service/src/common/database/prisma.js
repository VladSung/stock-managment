import { PrismaClient } from '@prisma/client';

// Создание единственного экземпляра PrismaClient
export const prisma = new PrismaClient();
