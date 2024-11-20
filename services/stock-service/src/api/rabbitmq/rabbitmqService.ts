import { type ExtractActionFromQueue, Queue } from "@/common/types/queueTypes";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";
import { type Channel, type Connection, connect } from "amqplib";

export class RabbitMQService {
  private connection: Connection | undefined;
  private channel: Channel | undefined;
  private queue: Queue;

  constructor(queue?: Queue) {
    this.queue = queue || Queue.PRODUCT_ACTIONS;
  }

  async init() {
    this.connection = await connect(env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
    // Объявляем очередь
    await this.channel.assertQueue(this.queue, {
      durable: true, // Очередь переживет перезапуск RabbitMQ
    });
  }

  async publish<T extends Queue = typeof this.queue>(message: ExtractActionFromQueue<T>, queue?: T) {
    if (!this.channel) {
      logger.error("RabbitMQ service is not initialized");
      return;
    }

    return this.channel.sendToQueue(queue || this.queue, Buffer.from(JSON.stringify(message)), {
      persistent: true, // Сообщения переживут перезапуск RabbitMQ
    });
  }
}
