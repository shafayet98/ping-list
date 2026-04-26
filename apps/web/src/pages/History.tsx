import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

export function History() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: api.getItems,
  });

  const purchased = items.filter((i) => i.purchased);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">History</h1>
            <p className="text-sm text-slate-500">
              {purchased.length} items purchased
            </p>
          </div>
          <Link
            to="/"
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-6">
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

        {!isLoading && purchased.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-4xl">✅</p>
            <p className="mt-2 font-medium text-slate-900">No purchases yet</p>
            <p className="text-sm text-slate-500">
              Tick off items to see them here
            </p>
          </div>
        )}

        <ul className="space-y-2">
          {purchased.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">
                ✓
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-400 line-through">
                  {item.name}
                </p>
                <p className="text-xs text-slate-400">
                  {item.quantity} × {item.category}
                </p>
              </div>
              {item.purchasedAt && (
                <p className="text-xs text-slate-400">
                  {new Date(item.purchasedAt).toLocaleDateString()}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
