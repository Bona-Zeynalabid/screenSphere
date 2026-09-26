"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import { getHistory, clearHistory, removeFromHistory } from "@/utils/history";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    const sorted = getHistory().sort(
      (a, b) => new Date(b.watchedAt) - new Date(a.watchedAt)
    );
    setItems(sorted);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleClear = () => {
    if (window.confirm("Clear your watch history?")) {
      clearHistory();
      setItems([]);
    }
  };

  const handleRemove = (id) => setItems(removeFromHistory(id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#ff0033] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Watch History</h1>
          <p className="text-sm text-[#aaa] mt-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-full bg-[#212121] hover:bg-[#303030] text-sm font-medium transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-[#181818]">
          <svg className="w-16 h-16 mx-auto text-[#555] mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No watch history yet</h3>
          <p className="text-[#aaa] mb-6">Start watching to build your history.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/movies" className="px-5 py-2.5 rounded-full bg-[#ff0033] hover:bg-[#e0002d] font-medium text-sm transition">
              Browse Movies
            </Link>
            <Link href="/tv" className="px-5 py-2.5 rounded-full bg-[#212121] hover:bg-[#303030] font-medium text-sm transition">
              Browse TV Shows
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="relative group">
              <MovieCard item={item} type={item.type} />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(item.id);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/80 hover:bg-[#ff0033] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                aria-label="Remove"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}