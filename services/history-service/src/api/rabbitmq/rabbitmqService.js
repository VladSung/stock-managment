import { logger } from '#server';
import { connect } from 'amqplib';
import { env } from '#common/utils/envConfig';

export class RabbitMQService {
    #connection;
    #channel;
    #queue;

    constructor(queue) {
        this.#queue = queue;
    }

    async init() {
        this.#connection = await connect(env.RABBITMQ_URL);
        this.#channel = await this.#connection.createChannel();
    }

    /**
     * Consume messages from a RabbitMQ queue and executes the callback function with the message content
     * @param {string} [queue=this.#queue] - The name of the queue to consume from
     * @param {function} callback - The callback to be executed with the message content
     * @param {function} [ackCallback] - The callback to be executed when the message is acknowledged
     */
    async consume(queue = this.#queue, callback) {
        try{
            await this.#channel.consume(queue, async (message) => {
            const content = JSON.parse(message?.content.toString());

            callback(content, () => {
                this.#channel.ack(message, true);
            });
            
        });
        }catch (error){
            logger.error('Error processing message', error);
        }
    }
}
