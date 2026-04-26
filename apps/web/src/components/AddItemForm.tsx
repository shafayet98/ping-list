import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

const CATEGORIES = [
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

export function AddItemForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("Other");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: api.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Add Item</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Milk"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        {mutation.isError && (
          <p className="mt-2 text-sm text-red-600">
            Failed to add item. Try again.
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate({ name, quantity, category })}
            disabled={!name.trim() || mutation.isPending}
            className="flex-1 rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {mutation.isPending ? "Adding..." : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
