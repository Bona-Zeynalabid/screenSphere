"use client";
import { useEffect, useState } from "react";
import MovieCard from "@/components/MovieCard";
import { getTrendingMovies, searchMovies } from "@/services/tmdb";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = query.trim()
        ? await searchMovies(query)
        : await getTrendingMovies();
      setMovies(res.results || []);
      setLoading(false);
    })();
  }, [query]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">
        {query ? `Results for "${query}"` : "Popular Movies"}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#ff0033] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : movies.length === 0 ? (
        <p className="text-[#aaa] text-center py-20">No movies found</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {movies.map((m) => (
            <MovieCard key={m.id} item={m} type="movies" />
          ))}
        </div>
      )}
    </div>
  );
}