import type {
  ShoppingItem,
  CreateShoppingItemInput,
} from "@ping-list/shared-types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  getItems: () => request<ShoppingItem[]>("/items"),
  createItem: (input: CreateShoppingItemInput) =>
    request<ShoppingItem>("/items", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateItem: (id: string, patch: Partial<ShoppingItem>) =>
    request<ShoppingItem>(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteItem: (id: string) =>
    request<void>(`/items/${id}`, { method: "DELETE" }),
};
