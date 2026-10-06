import { createClient, RedisClientType } from "redis"
import { envVars } from "../../config/env";

class RedisService {

    private client: RedisClientType | null = null;
    private isConnected: boolean = false

    async connect(): Promise<void> {
        try {
            const redisUrl = envVars.REDIS_URL;
            this.client = createClient({ url: redisUrl })

            // Handle connection events 
            this.client.on("error", (err) => {
                console.error("Redis client Error: ", err)
                this.isConnected = false
            })

            this.client.on("connect", () => {
                console.log("Redis Client Connected")
                this.isConnected = true
            })

            this.client.on("ready", () => {
                console.log("Redis Client Ready")
                this.isConnected = true;
            })

            this.client.on("end", () => {
                console.log("Redis Client Disconnected");
                this.isConnected = false
            })

            this.client.on("reconnecting", () => {
                console.log("Redis Client Reconnecting")
            })

            await this.client.connect();
        } catch (error) {
            console.log(error)
        }
    }
}