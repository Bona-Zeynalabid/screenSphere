"use client";
import { useEffect, useState } from "react";
import MovieCard from "@/components/MovieCard";
import { getTrendingTV, searchTV } from "@/services/tmdb";

export default function TVPage() {
  const [shows, setShows] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = query.trim() ? await searchTV(query) : await getTrendingTV();
      setShows(res.results || []);
      setLoading(false);
    })();
  }, [query]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">
        {query ? `Results for "${query}"` : "Popular TV Shows"}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#ff0033] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : shows.length === 0 ? (
        <p className="text-[#aaa] text-center py-20">No TV shows found</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {shows.map((s) => (
            <MovieCard key={s.id} item={s} type="tv" />
          ))}
        </div>
      )}
    </div>
  );
}