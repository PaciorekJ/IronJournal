import redis from "redis";

if (!process.env.REDIS_URL) {
    throw new Error("Missing environment variable: REDIS_URL");
}

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.log("Connected to Redis"));

(async () => {
    await redisClient.connect();
})();

export default redisClient;
