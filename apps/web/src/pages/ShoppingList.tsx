import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAppStore } from "../store";
import { AddItemForm } from "../components/AddItemForm";
import type { ShoppingItem } from "@ping-list/shared-types";

const CATEGORIES = [
  "All",
  "Dairy",
  "Bakery",
  "Produce",
  "Meat",
  "Frozen",
  "Snacks",
  "Drinks",
  "Junk Food",
  "Other",
];

export function ShoppingList() {
  const {
    selectedCategory,
    setSelectedCategory,
    isAddingItem,
    setIsAddingItem,
  } = useAppStore();
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["items"],
    queryFn: api.getItems,
    refetchInterval: 30000,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, purchased }: { id: string; purchased: boolean }) =>
      api.updateItem(id, { purchased }),
    onMutate: async ({ id, purchased }) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      const previous = queryClient.getQueryData<ShoppingItem[]>(["items"]);
      queryClient.setQueryData<ShoppingItem[]>(["items"], (old) =>
        old?.map((item) => (item.id === id ? { ...item, purchased } : item)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["items"], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  const activeItems = items.filter((i) => !i.purchased);
  const filteredItems =
    selectedCategory === "All"
      ? activeItems
      : activeItems.filter((i) => i.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ping List</h1>
            <p className="text-sm text-slate-500">
              {activeItems.length} items remaining
            </p>
          </div>
          <button
            onClick={() => setIsAddingItem(true)}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 active:scale-95 transition-transform"
          >
            + Add Item
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-6">
        {/* Category filter */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
            Failed to load items. Check your connection.
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filteredItems.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-4xl">🛒</p>
            <p className="mt-2 font-medium text-slate-900">Nothing to buy</p>
            <p className="text-sm text-slate-500">
              Add some items to get started
            </p>
          </div>
        )}

        {/* Items */}
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all"
            >
              <button
                onClick={() =>
                  toggleMutation.mutate({
                    id: item.id,
                    purchased: !item.purchased,
                  })
                }
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  item.purchased
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 hover:border-emerald-400"
                }`}
              >
                {item.purchased && "✓"}
              </button>
              <div className="flex-1">
                <p
                  className={`font-medium ${item.purchased ? "text-slate-400 line-through" : "text-slate-900"}`}
                >
                  {item.name}
                </p>
                <p className="text-xs text-slate-500">
                  {item.quantity} × {item.category}
                </p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(item.id)}
                className="text-slate-300 hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      {isAddingItem && <AddItemForm onClose={() => setIsAddingItem(false)} />}
    </div>
  );
}
