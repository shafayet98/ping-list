export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  category: string;
  purchased: boolean;
  createdAt: string;
  purchasedAt: string | null;
};

export type CreateShoppingItemInput = {
  name: string;
  quantity: number;
  category: string;
};
