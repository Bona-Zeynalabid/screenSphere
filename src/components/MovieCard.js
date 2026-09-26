"use client";
import Link from "next/link";
import { useState } from "react";

export default function MovieCard({ item, type }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const title = item.title || item.name || "Untitled";
  const year = (item.release_date || item.first_air_date || "").slice(0, 4) || "N/A";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";

  return (
    <Link href={`/${type}/${item.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#212121]">
        {!loaded && !errored && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] to-[#262626] animate-pulse" />
        )}
        <img
          src={
            errored || !item.poster_path
              ? "https://via.placeholder.com/500x750/1c1c1c/666?text=No+Image"
              : `https://image.tmdb.org/t/p/w500${item.poster_path}`
          }
          alt={title}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.03] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Rating badge */}
        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-sm text-[11px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
          {rating}
        </div>
        {/* Type badge */}
        <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide">
          {type}
        </div>
      </div>
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-[#f1f1f1] line-clamp-2 leading-snug">
          {title}
        </h3>
        <p className="text-xs text-[#aaa] mt-0.5">
          {type === "movie" ? "Movie" : "TV Show"} • {year}
        </p>
      </div>
    </Link>
  );
}