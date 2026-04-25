import { useEffect, useState } from "react";
import type { ShoppingItem } from "@ping-list/shared-types";

export function App() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/items")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ShoppingItem[]>;
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Ping List</h1>

        {loading && <p className="text-slate-600">Loading...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        {!loading && !error && (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">
                    {item.name}
                  </span>
                  <span className="text-sm text-slate-500">
                    {item.quantity} · {item.category}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
