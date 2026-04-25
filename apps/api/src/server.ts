import Fastify from "fastify";
import type { ShoppingItem } from "@ping-list/shared-types";

const server = Fastify({
  logger: true,
});

// Temporary in-memory data so we can see types working
const sampleItems: ShoppingItem[] = [
  {
    id: "1",
    name: "Milk",
    quantity: 2,
    category: "Dairy",
    purchased: false,
    createdAt: new Date().toISOString(),
    purchasedAt: null,
  },
];

server.get("/health", async () => {
  return { status: "ok" };
});

server.get("/items", async () => {
  return sampleItems;
});

const start = async () => {
  try {
    const port = Number(process.env.PORT ?? 3000);
    await server.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
