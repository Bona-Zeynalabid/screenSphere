"use client";
import { useEffect, useState, useRef } from "react";
import MovieCard from "@/components/MovieCard";
import {
  getTrendingMovies,
  getTrendingTV,
  discoverMovies,
  discoverTV,
} from "@/services/tmdb";

// ─────────────────────────────────────────────────────────────────────────────
// Category definitions
//   movie / tv = TMDB genre IDs. `null` means that media type has no matching
//   genre (e.g. TMDB has no Horror genre for TV, no Reality genre for movies).
//   `language` is used for Anime (Animation + Japanese).
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",         label: "All" },
  { id: "action",      label: "Action",      movie: 28,    tv: 10759 },
  { id: "comedy",      label: "Comedy",      movie: 35,    tv: 35 },
  { id: "horror",      label: "Horror",      movie: 27,    tv: null },
  { id: "anime",       label: "Anime",       movie: 16,    tv: 16, language: "ja" },
  { id: "romance",     label: "Romance",     movie: 10749, tv: null },
  { id: "scifi",       label: "Sci-Fi",      movie: 878,   tv: 10765 },
  { id: "thriller",    label: "Thriller",    movie: 53,    tv: null },
  { id: "documentary", label: "Documentary", movie: 99,    tv: 99 },
  { id: "drama",       label: "Drama",       movie: 18,    tv: 18 },
  { id: "fantasy",     label: "Fantasy",     movie: 14,    tv: 10765 },
  { id: "mystery",     label: "Mystery",     movie: 9648,  tv: 9648 },
  { id: "family",      label: "Family",      movie: 10751, tv: 10751 },
  { id: "animation",   label: "Animation",   movie: 16,    tv: 16 },
  { id: "kids",        label: "Kids",        movie: null,  tv: 10762 },
  { id: "reality",     label: "Reality",     movie: null,  tv: 10764 },
  { id: "crime",       label: "Crime",       movie: 80,    tv: 80 },
  { id: "adventure",   label: "Adventure",   movie: 12,    tv: 10759 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Reusable section grid
// ─────────────────────────────────────────────────────────────────────────────
function SectionGrid({ title, items, type }) {
  if (!items.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        <a
          href={type === "movie" ? "/movies" : "/tv"}
          className="text-sm text-[#3ea6ff] hover:text-[#65b8ff] font-medium"
        >
          View all
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
        {items.map((item) => (
          <MovieCard key={item.id} item={item} type={type} />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Category chips bar
// ─────────────────────────────────────────────────────────────────────────────
function CategoryChips({ active, onChange }) {
  const scrollRef = useRef(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto pb-1 mb-6 no-scrollbar"
    >
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === active;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`
              shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-medium transition
              whitespace-nowrap
              ${
                isActive
                  ? "bg-white text-black"
                  : "bg-[#272727] text-[#f1f1f1] hover:bg-[#3f3f3f]"
              }
            `}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Home page
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(true);

  // For "All"
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);

  // For a selected category
  const [categoryMovies, setCategoryMovies] = useState([]);
  const [categoryTV, setCategoryTV] = useState([]);

  // Fetch trending once for the "All" tab
  useEffect(() => {
    (async () => {
      const [m, t] = await Promise.all([getTrendingMovies(), getTrendingTV()]);
      setTrendingMovies(m.results || []);
      setTrendingTV(t.results || []);
      setLoading(false);
    })();
  }, []);

  // Fetch category content whenever the chip changes
  useEffect(() => {
    if (active === "all") return;

    const cat = CATEGORIES.find((c) => c.id === active);
    if (!cat) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      const opts = cat.language ? { language: cat.language } : {};

      const [moviesRes, tvRes] = await Promise.all([
        cat.movie ? discoverMovies(cat.movie, opts) : Promise.resolve({ results: [] }),
        cat.tv ? discoverTV(cat.tv, opts) : Promise.resolve({ results: [] }),
      ]);

      if (cancelled) return;

      setCategoryMovies(moviesRes.results || []);
      setCategoryTV(tvRes.results || []);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [active]);

  const activeCategory = CATEGORIES.find((c) => c.id === active);
  const showCategoryMovies = active !== "all" && activeCategory?.movie;
  const showCategoryTV = active !== "all" && activeCategory?.tv;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Chips bar */}
      <CategoryChips active={active} onChange={setActive} />

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#ff0033] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : active === "all" ? (
        /* ================== ALL ================== */
        <>
          <SectionGrid
            title="Trending Movies"
            items={trendingMovies.slice(0, 12)}
            type="movies"
          />
          <SectionGrid
            title="Trending TV Shows"
            items={trendingTV.slice(0, 12)}
            type="tv"
          />
        </>
      ) : (
        /* ================== CATEGORY ================== */
        <>
          {showCategoryMovies && (
            <SectionGrid
              title={`${activeCategory.label} Movies`}
              items={categoryMovies.slice(0, 18)}
              type="movie"
            />
          )}
          {showCategoryTV && (
            <SectionGrid
              title={`${activeCategory.label} TV Shows`}
              items={categoryTV.slice(0, 18)}
              type="tv"
            />
          )}

          {/* Empty state (e.g. a category returned nothing) */}
          {!showCategoryMovies && !showCategoryTV && (
            <div className="text-center py-20">
              <p className="text-[#aaa]">
                No results for {activeCategory?.label}.
              </p>
            </div>
          )}

          {showCategoryMovies &&
            !categoryMovies.length &&
            showCategoryTV &&
            !categoryTV.length && (
              <div className="text-center py-20">
                <p className="text-[#aaa]">
                  Nothing found in {activeCategory.label}. Try another category.
                </p>
              </div>
            )}
        </>
      )}
    </div>
  );
}