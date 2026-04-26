import Fastify from "fastify";
import { itemRoutes } from "./routes/items.js";

const server = Fastify({ logger: true });

server.get("/health", async () => {
  return { status: "ok" };
});

await server.register(itemRoutes, { prefix: "/api" });

const start = async () => {
  try {
    const port = Number(process.env.PORT ?? 3000);
    await server.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
// testing deployment
start();
