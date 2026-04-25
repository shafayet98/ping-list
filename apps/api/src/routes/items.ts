import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { smartsheetService } from "../services/smartsheet.js";

const CreateItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  category: z.string().min(1, "Category is required"),
});

const PatchItemSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.number().int().positive().optional(),
  category: z.string().min(1).optional(),
  purchased: z.boolean().optional(),
});

export async function itemRoutes(fastify: FastifyInstance) {
  // GET /items
  fastify.get("/items", async (_request, reply) => {
    const items = await smartsheetService.getItems();
    return reply.send(items);
  });

  // POST /items
  fastify.post("/items", async (request, reply) => {
    const result = CreateItemSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: result.error.flatten() });
    }
    const item = await smartsheetService.createItem(result.data);
    return reply.status(201).send(item);
  });

  // PATCH /items/:id
  fastify.patch("/items/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = PatchItemSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: result.error.flatten() });
    }
    const item = await smartsheetService.updateItem(id, result.data);
    return reply.send(item);
  });

  // DELETE /items/:id
  fastify.delete("/items/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await smartsheetService.deleteItem(id);
    return reply.status(204).send();
  });
}
