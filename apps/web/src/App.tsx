import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ShoppingList } from "./pages/ShoppingList";
import { History } from "./pages/History";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-6 py-3 md:hidden">
          <div className="flex justify-around">
            <Link
              to="/"
              className="flex flex-col items-center gap-0.5 text-xs text-slate-600"
            >
              <span className="text-lg">🛒</span>
              List
            </Link>
            <Link
              to="/history"
              className="flex flex-col items-center gap-0.5 text-xs text-slate-600"
            >
              <span className="text-lg">✅</span>
              History
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<ShoppingList />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
