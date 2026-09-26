"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMovieDetails, getTVDetails } from "@/services/tmdb";
import { addToHistory } from "@/utils/history";

export default function DetailView({ id, type }) {
  const isMovie = type === "movie";
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = isMovie ? await getMovieDetails(id) : await getTVDetails(id);
      setData(res);
      setLoading(false);
    })();
  }, [id, isMovie]);

  const handleWatch = () => {
    if (data) addToHistory(data);
    router.push(`/watch/${type}/${id}`);
  };

  const formatRuntime = (min) => {
    if (!min) return null;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatDate = (s) => {
    if (!s) return null;
    return new Date(s).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-[#ff0033] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-[#aaa] mb-4">Content not found</p>
        <Link href="/" className="px-5 py-2.5 rounded-full bg-[#ff0033] hover:bg-[#e0002d] font-medium text-sm">
          Back to Home
        </Link>
      </div>
    );
  }

  const title = data.title || data.name;
  const year = (data.release_date || data.first_air_date || "").slice(0, 4);
  const runtime = isMovie
    ? data.runtime
    : data.episode_run_time?.[0] || data.last_episode_to_air?.runtime;

  return (
    <div className="relative">
      {/* Backdrop */}
      {data.backdrop_path && (
        <div className="relative w-full h-[40vh] sm:h-[50vh] overflow-hidden">
          <img
            src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent" />
        </div>
      )}

      <div className="relative -mt-32 sm:-mt-48 px-4 sm:px-6 lg:px-8 pb-12">
        <Link
          href={isMovie ? "/movies" : "/tv"}
          className="inline-flex items-center gap-2 text-sm text-[#aaa] hover:text-white mb-6 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to {isMovie ? "Movies" : "TV Shows"}
        </Link>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 max-w-6xl">
          {/* Poster */}
          <div className="w-40 sm:w-56 shrink-0">
            {data.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
                alt={title}
                className="w-full rounded-xl shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-[#212121] rounded-xl" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-5">
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{title}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#aaa]">
              {data.vote_average > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  {data.vote_average.toFixed(1)}
                </span>
              )}
              {year && <span>{year}</span>}
              {runtime > 0 && <span>{formatRuntime(runtime)}</span>}
              {!isMovie && data.number_of_seasons && (
                <span>
                  {data.number_of_seasons} Season{data.number_of_seasons !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Genres */}
            {data.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.genres.map((g) => (
                  <span key={g.id} className="px-3 py-1 text-xs rounded-full bg-[#212121] border border-[#303030]">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {data.overview && (
              <p className="text-[#d0d0d0] leading-relaxed text-sm sm:text-base">{data.overview}</p>
            )}

            {/* Watch button */}
            <div className="pt-2">
              <button
                onClick={handleWatch}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#ff0033] hover:bg-[#e0002d] text-white font-semibold transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}