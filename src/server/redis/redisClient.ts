import { createClient, type RedisClientType } from "redis";
import { getRedisUrl } from "@/server/redis/redisConfig";

type RedisClient = RedisClientType;

let publisherClient: RedisClient | null = null;
let subscriberClient: RedisClient | null = null;
let commandClient: RedisClient | null = null;

const connectClient = async (client: RedisClient): Promise<RedisClient> => {
  if (!client.isOpen) {
    await client.connect();
  }

  return client;
};

export const getRedisPublisher = async (): Promise<RedisClient> => {
  if (!publisherClient) {
    publisherClient = createClient({ url: getRedisUrl() });
    publisherClient.on("error", (error) => {
      console.error("[redis:publisher]", error);
    });
  }

  return connectClient(publisherClient);
};

export const getRedisSubscriber = async (): Promise<RedisClient> => {
  if (!subscriberClient) {
    subscriberClient = createClient({ url: getRedisUrl() });
    subscriberClient.on("error", (error) => {
      console.error("[redis:subscriber]", error);
    });
  }

  return connectClient(subscriberClient);
};

export const getRedisCommandClient = async (): Promise<RedisClient> => {
  if (!commandClient) {
    commandClient = createClient({ url: getRedisUrl() });
    commandClient.on("error", (error) => {
      console.error("[redis:command]", error);
    });
  }

  return connectClient(commandClient);
};

export const createDedicatedSubscriber = async (): Promise<RedisClient> => {
  const baseClient = await getRedisPublisher();
  const duplicate = baseClient.duplicate();

  duplicate.on("error", (error) => {
    console.error("[redis:subscriber:dedicated]", error);
  });

  if (!duplicate.isOpen) {
    await duplicate.connect();
  }

  return duplicate;
};

export const disconnectRedisClients = async (): Promise<void> => {
  const clients = [publisherClient, subscriberClient, commandClient];

  await Promise.all(
    clients.map(async (client) => {
      if (client?.isOpen) {
        await client.quit();
      }
    }),
  );

  publisherClient = null;
  subscriberClient = null;
  commandClient = null;
};
