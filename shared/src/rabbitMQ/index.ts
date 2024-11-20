import amqplib from "amqplib";

const rabbitMQUrl = process.env.RABBITMQ_URI;

if (!rabbitMQUrl) {
    throw new Error("Missing environment variable: RABBITMQ_URI");
}

let connection: amqplib.Connection | null = null;
let channel: amqplib.Channel | null = null;

export async function getRabbitMQChannel() {
    if (channel) return channel;

    let retries = 0;
    while (!connection) {
        try {
            connection = await amqplib.connect(rabbitMQUrl!);
        } catch (err) {
            retries++;
            if (retries > 10) {
                throw err;
            }
            console.error("Failed to connect to RabbitMQ:", err);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    console.log("Connected to RabbitMQ");

    channel = await connection.createChannel();

    connection.on("close", async (err: any) => {
        console.error("RabbitMQ connection closed:", err);
        connection = null;
        channel = null;
    });

    connection.on("error", (err: any) => {
        console.error("RabbitMQ connection error:", err);
    });

    return channel;
}

export async function closeRabbitMQConnection() {
    try {
        if (channel) {
            await channel.close();
            console.log("RabbitMQ channel closed.");
        }
        if (connection) {
            await connection.close();
            console.log("RabbitMQ connection closed.");
        }
    } catch (err) {
        console.error("Error closing RabbitMQ connection/channel:", err);
    } finally {
        connection = null;
        channel = null;
    }
}
