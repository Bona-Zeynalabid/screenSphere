"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchMovies, searchTV } from "@/services/tmdb";
import { useSidebar } from "./LayoutShell";

export default function Header() {
  const { setMobileOpen, collapsed, setCollapsed } = useSidebar();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [listening, setListening] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const containerRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const [m, tv] = await Promise.all([searchMovies(query), searchTV(query)]);
      const combined = [
        ...(m.results || []).map((x) => ({ ...x, mediaType: "movies" })),
        ...(tv.results || []).map((x) => ({ ...x, mediaType: "tv" })),
      ]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 8);
      setResults(combined);
      setShowResults(true);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (!containerRef.current?.contains(e.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleVoice = () => {
    const SR =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      alert("Voice search not supported in this browser.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setQuery(text);
    };
    rec.start();
  };

  const submitSearch = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setShowResults(true);
  };

  const goTo = (item) => {
    setShowResults(false);
    setQuery("");
    setIsMobileSearchOpen(false);
    router.push(`/${item.mediaType}/${item.id}`);
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) setMobileOpen((v) => !v);
    else setCollapsed((v) => !v);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] z-50 flex items-center px-2 sm:px-4 gap-2">
      {/* ────────── LEFT: hamburger + logo ────────── */}
      <div
        className={`flex items-center gap-1 sm:gap-2 shrink-0 ${
          isMobileSearchOpen ? "hidden sm:flex" : "flex"
        }`}
      >
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-full hover:bg-[#272727] flex items-center justify-center transition"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

       <Link href="/" className="flex items-center gap-2 shrink-0 group">
  <span className="w-8 h-8 rounded-lg bg-[#ff0033] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-white"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4h-2l2 4H9L7 4H5c-1.1 0-1.99.9-1.99 2L3 18c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4h-3z" />
    </svg>
  </span>
  <span className="text-lg font-semibold tracking-tight hidden sm:inline">
    Screen<span className="text-[#ff0033]">Sphere</span>
  </span>
</Link>
      </div>

      {/* ────────── CENTER: search + voice ────────── */}
      <div
        ref={containerRef}
        className={`flex-1 justify-center ${
          isMobileSearchOpen ? "flex" : "hidden sm:flex"
        }`}
      >
        <div className="w-full max-w-2xl flex items-center gap-2 relative">
          {/* Search bar */}
          <form onSubmit={submitSearch} className="flex flex-1 min-w-0 items-center">
            <div className="flex-1 flex items-center bg-[#121212] border border-[#303030] rounded-l-full pl-4 focus-within:border-[#3ea6ff] transition">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query && setShowResults(true)}
                placeholder="Search"
                className="w-full bg-transparent py-2 pr-2 text-sm outline-none placeholder-[#888]"
                autoFocus={isMobileSearchOpen}
              />
            </div>
            <button
              type="submit"
              className="h-9 px-4 sm:px-5 bg-[#212121] border border-l-0 border-[#303030] rounded-r-full hover:bg-[#303030] transition flex items-center justify-center"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Voice search — now inline next to the form */}
          <button
            onClick={handleVoice}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition shrink-0 ${
              listening
                ? "bg-[#ff0033] text-white animate-pulse"
                : "bg-[#212121] hover:bg-[#303030]"
            }`}
            aria-label="Voice search"
            title="Search with your voice"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11h-2z" />
            </svg>
          </button>

          {/* Mobile: close search */}
          {isMobileSearchOpen && (
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setQuery("");
              }}
              className="sm:hidden w-10 h-10 rounded-full hover:bg-[#272727] flex items-center justify-center"
              aria-label="Close search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Results dropdown */}
          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#212121] border border-[#303030] rounded-xl overflow-hidden shadow-2xl max-h-[70vh] overflow-y-auto z-50">
              {results.map((item) => (
                <button
                  key={`${item.mediaType}-${item.id}`}
                  onClick={() => goTo(item)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#303030] transition text-left"
                >
                  <div className="w-10 h-14 bg-[#121212] rounded overflow-hidden shrink-0">
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {item.title || item.name}
                    </p>
                    <p className="text-xs text-[#aaa]">
                      {item.mediaType === "movie" ? "Movie" : "TV Show"} • ⭐{" "}
                      {item.vote_average?.toFixed(1) || "N/A"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ────────── RIGHT: mobile search toggle + spacer ────────── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Mobile: open search */}
        {!isMobileSearchOpen && (
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="sm:hidden w-10 h-10 rounded-full hover:bg-[#272727] flex items-center justify-center transition"
            aria-label="Open search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}

        {/* Desktop spacer keeps center centered */}
        <div className="hidden sm:block w-10 lg:w-[168px]" />
      </div>
    </header>
  );
}