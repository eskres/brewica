import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

const redisClient: RedisClientType = createClient({
    password: process.env['REDIS_PASSWORD'] as string,
    socket: {
        host: process.env['REDIS_HOST'] as string,
        port: process.env['REDIS_PORT'] as unknown as number
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

export { redisClient };