"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  getTVDetails,
  getMovieRecommendations,
} from "@/services/tmdb";

const CINESRC_ORIGIN = "https://cinesrc.st";
const QUALITY_OPTIONS = ["auto", "1080", "720", "480", "360"];
const SERVER_OPTIONS = [
  { id: "", label: "Auto" },
  { id: "1", label: "Server 1" },
  { id: "2", label: "Server 2" },
];

export default function WatchView({ type, id }) {
  const isMovie = type === "movie";

  const [playerLoading, setPlayerLoading] = useState(true);
  const [tvLoading, setTvLoading] = useState(!isMovie);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [tvDetails, setTvDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState("auto");
  const [server, setServer] = useState("");

  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
  });

  const [seeking, setSeeking] = useState(false);
  const [seekPreview, setSeekPreview] = useState(0);

  const playerContainerRef = useRef(null);
  const iframeRef = useRef(null);

  // Fetch TV details
  useEffect(() => {
    if (isMovie) return;
    let cancelled = false;
    (async () => {
      setTvLoading(true);
      const res = await getTVDetails(id);
      if (cancelled) return;
      setTvDetails(res);
      if (res?.seasons?.length) {
        const first =
          res.seasons.find((s) => s.season_number > 0 && s.episode_count > 0) ||
          res.seasons[0];
        setSeason(first.season_number);
        setEpisode(1);
      }
      setTvLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isMovie]);

  // Fetch movie recommendations (for the sidebar)
  useEffect(() => {
    if (!isMovie) return;
    let cancelled = false;
    (async () => {
      const res = await getMovieRecommendations(id);
      if (cancelled) return;
      setRecommendations((res.results || []).slice(0, 12));
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isMovie]);

  // Fullscreen listener
  useEffect(() => {
    const onChange = () => {
      const el = document.fullscreenElement || document.webkitFullscreenElement;
      setIsFullscreen(el === playerContainerRef.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  // postMessage listener
  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== CINESRC_ORIGIN) return;
      const { type: t, ...d } = event.data || {};
      switch (t) {
        case "cinesrc:ready":
          setPlayerLoading(false);
          break;
        case "cinesrc:play":
          setPlayerState((s) => ({ ...s, isPlaying: true }));
          break;
        case "cinesrc:pause":
          setPlayerState((s) => ({ ...s, isPlaying: false }));
          break;
        case "cinesrc:timeupdate":
          if (!seeking)
            setPlayerState((s) => ({
              ...s,
              currentTime: d.currentTime,
              duration: d.duration || s.duration,
            }));
          break;
        case "cinesrc:loadedmetadata":
          setPlayerState((s) => ({ ...s, duration: d.duration }));
          break;
        case "cinesrc:volumechange":
          setPlayerState((s) => ({ ...s, volume: d.volume, muted: d.muted }));
          break;
        case "cinesrc:ratechange":
          setPlayerState((s) => ({ ...s, playbackRate: d.playbackRate }));
          break;
        case "cinesrc:ended":
          setPlayerState((s) => ({ ...s, isPlaying: false }));
          break;
        case "cinesrc:nextepisode":
          if (!d.internalNavigation) {
            setSeason(d.season);
            setEpisode(d.episode);
            setPlayerLoading(true);
          } else {
            setSeason(d.season);
            setEpisode(d.episode);
          }
          break;
        case "cinesrc:response":
          if (d.command === "getCurrentTime")
            setPlayerState((s) => ({ ...s, currentTime: d.result }));
          break;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [seeking]);

  const send = useCallback((command, args = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "cinesrc:command", command, args },
      CINESRC_ORIGIN
    );
  }, []);

  const togglePlay = useCallback(() => {
    send(playerState.isPlaying ? "pause" : "play");
  }, [playerState.isPlaying, send]);

  const skip = (s) => {
    const target = Math.max(
      0,
      Math.min(playerState.duration || 0, playerState.currentTime + s)
    );
    send("seek", [target]);
  };

  const commitSeek = (v) => {
    send("seek", [v]);
    setSeeking(false);
  };

  const changeVolume = (v) => {
    send("setVolume", [v]);
    if (v > 0 && playerState.muted) send("setMuted", [false]);
  };

  const toggleMute = () => send("setMuted", [!playerState.muted]);

  const cycleRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const i = rates.indexOf(playerState.playbackRate);
    send("setPlaybackRate", [rates[(i + 1) % rates.length]]);
  };

  const toggleFullscreen = useCallback(() => {
    const el = playerContainerRef.current;
    if (!el) return;
    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fs) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }, []);

  const changeEpisode = (s, e) => {
    setSeason(s);
    setEpisode(e);
    setPlayerLoading(true);
  };

  // Derived
  const seasons =
    tvDetails?.seasons?.filter(
      (s) => s.season_number > 0 && s.episode_count > 0
    ) || [];
  const selectedSeason = tvDetails?.seasons?.find(
    (s) => s.season_number === season
  );
  const episodeCount = selectedSeason?.episode_count || 12;
  const episodes = Array.from({ length: episodeCount }, (_, i) => i + 1);
  const hasNext = !isMovie && episode < episodeCount;

  const embedUrl = (() => {
    const base = isMovie
      ? `${CINESRC_ORIGIN}/embed/movie/${id}`
      : `${CINESRC_ORIGIN}/embed/tv/${id}?s=${season}&e=${episode}`;
    const p = new URLSearchParams();
    if (quality && quality !== "auto") p.set("quality", quality);
    if (server) p.set("lastserver", server);
    p.set("autoplay", "true");
    p.set("autonext", "true");
    p.set("color", "%23ff0033");
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}${p.toString()}`;
  })();

  const fmt = (s) => {
    if (!s || isNaN(s) || s < 0) return "0:00";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${m}:${String(sec).padStart(2, "0")}`;
  };

  const displayTime = seeking ? seekPreview : playerState.currentTime;

  if (tvLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-[#ff0033] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 lg:px-8 py-6">
      <div className="max-w-[1600px] mx-auto">
        <div className={`flex flex-col ${isFullscreen ? "" : "lg:flex-row gap-6"}`}>
          {/* ============ PLAYER COLUMN ============ */}
          <div className={isFullscreen ? "w-full h-screen" : "flex-1 min-w-0"}>
            <div
              ref={playerContainerRef}
              className={`bg-[#181818] flex flex-col ${
                isFullscreen ? "h-full" : "rounded-xl overflow-hidden"
              }`}
            >
              {/* Video area */}
              <div
                className={`relative bg-black ${
                  isFullscreen ? "flex-1 min-h-0" : "aspect-video w-full"
                }`}
              >
                {playerLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#121212] z-40">
                    <div className="w-10 h-10 border-4 border-[#ff0033] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                <iframe
                  ref={iframeRef}
                  key={`${id}-${season}-${episode}-${quality}-${server}`}
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  onLoad={() => setPlayerLoading(false)}
                  title="Video player"
                />

                {/* ============ CLICK SHIELD ============
                    Covers the iframe so the user can never interact with
                    the embed directly. Any click here toggles play/pause.
                    Double-click toggles fullscreen (YouTube-style).
                */}
                <button
                  type="button"
                  onClick={togglePlay}
                  onDoubleClick={toggleFullscreen}
                  className="absolute inset-0 z-30 bg-transparent cursor-pointer focus:outline-none"
                  aria-label={playerState.isPlaying ? "Pause" : "Play"}
                  tabIndex={-1}
                />

                {/* ============ PAUSE OVERLAY ============
                    When paused, show a subtle centered play icon so the
                    user has visual feedback. Auto-hides when playing.
                */}
                {!playerState.isPlaying && !playerLoading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* External controls */}
              <div className="bg-[#0f0f0f] border-t border-[#303030] px-3 py-2">
                {/* Seek */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[#aaa] tabular-nums w-12 text-right">
                    {fmt(displayTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={playerState.duration || 0}
                    step={0.1}
                    value={displayTime}
                    onChange={(e) => {
                      setSeeking(true);
                      setSeekPreview(Number(e.target.value));
                    }}
                    onMouseUp={(e) => commitSeek(Number(e.currentTarget.value))}
                    onTouchEnd={(e) => commitSeek(Number(e.currentTarget.value))}
                    disabled={!playerState.duration}
                    className="flex-1 h-1 accent-[#ff0033] cursor-pointer"
                    aria-label="Seek"
                  />
                  <span className="text-xs text-[#aaa] tabular-nums w-12">
                    {fmt(playerState.duration)}
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={togglePlay}
                      className="p-2 rounded-full hover:bg-[#272727] transition"
                      title={playerState.isPlaying ? "Pause" : "Play"}
                    >
                      {playerState.isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={() => skip(-10)}
                      className="p-2 rounded-full hover:bg-[#272727] transition"
                      title="Back 10s"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => skip(10)}
                      className="p-2 rounded-full hover:bg-[#272727] transition"
                      title="Forward 10s"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                        />
                      </svg>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={toggleMute}
                        className="p-2 rounded-full hover:bg-[#272727] transition"
                      >
                        {playerState.muted || playerState.volume === 0 ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={playerState.muted ? 0 : playerState.volume}
                        onChange={(e) => changeVolume(Number(e.target.value))}
                        className="w-20 h-1 accent-[#ff0033] cursor-pointer"
                        aria-label="Volume"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={cycleRate}
                      className="px-2 py-1 rounded-full hover:bg-[#272727] text-xs font-medium tabular-nums transition"
                    >
                      {playerState.playbackRate}×
                    </button>

                    <select
                      value={quality}
                      onChange={(e) => {
                        setQuality(e.target.value);
                        setPlayerLoading(true);
                      }}
                      className="bg-[#212121] text-xs rounded px-2 py-1 outline-none cursor-pointer"
                      title="Quality"
                    >
                      {QUALITY_OPTIONS.map((q) => (
                        <option key={q} value={q}>
                          {q === "auto" ? "Auto" : `${q}p`}
                        </option>
                      ))}
                    </select>

                    <select
                      value={server}
                      onChange={(e) => {
                        setServer(e.target.value);
                        setPlayerLoading(true);
                      }}
                      className="bg-[#212121] text-xs rounded px-2 py-1 outline-none cursor-pointer"
                      title="Server"
                    >
                      {SERVER_OPTIONS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>

                    {hasNext && (
                      <button
                        onClick={() => changeEpisode(season, episode + 1)}
                        className="p-2 rounded-full hover:bg-[#272727] transition"
                        title="Next episode"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                        </svg>
                      </button>
                    )}

                    <button
                      onClick={toggleFullscreen}
                      className="p-2 rounded-full hover:bg-[#272727] transition"
                      title="Fullscreen"
                    >
                      {isFullscreen ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 20H5a2 2 0 01-2-2v-4m4 0l-4 4m0-4l4 4m8-12h4a2 2 0 012 2v4m0 0l-4-4m4 4l-4-4"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 8V4m0 0h4M4 4l5 5m11-5v4m0-4h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Title below player */}
            {!isFullscreen && (
              <div className="mt-4">
                <h1 className="text-lg sm:text-xl font-semibold">
                  {isMovie
                    ? "Now Playing"
                    : tvDetails?.name
                    ? `${tvDetails.name} — S${season}:E${episode}`
                    : "TV Show"}
                </h1>
               
              </div>
            )}
          </div>

          {/* ============ RIGHT SIDEBAR ============ */}
          {!isFullscreen && (
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-[#181818] rounded-xl p-4 sticky top-20">
                {/* ---------- TV: season / episode controls ---------- */}
                {!isMovie && tvDetails && (
                  <>
                    <h3 className="font-semibold mb-3">Episodes</h3>

                    <div className="space-y-3 mb-4">
                      <select
                        value={season}
                        onChange={(e) =>
                          changeEpisode(Number(e.target.value), 1)
                        }
                        className="w-full bg-[#212121] rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
                      >
                        {seasons.map((s) => (
                          <option key={s.season_number} value={s.season_number}>
                            Season {s.season_number} ({s.episode_count} ep)
                          </option>
                        ))}
                      </select>

                      <select
                        value={episode}
                        onChange={(e) =>
                          changeEpisode(season, Number(e.target.value))
                        }
                        className="w-full bg-[#212121] rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
                      >
                        {episodes.map((e) => (
                          <option key={e} value={e}>
                            Episode {e}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 max-h-64 overflow-y-auto">
                      {episodes.map((e) => (
                        <button
                          key={e}
                          onClick={() => changeEpisode(season, e)}
                          className={`aspect-square rounded text-xs font-medium transition ${
                            episode === e
                              ? "bg-[#ff0033] text-white"
                              : "bg-[#212121] hover:bg-[#303030] text-[#ccc]"
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* ---------- MOVIE: suggestions ---------- */}
                {isMovie && (
                  <>
                    <h3 className="font-semibold mb-3">You might also like</h3>

                    {recommendations.length === 0 ? (
                      <p className="text-xs text-[#888]">
                        Loading suggestions...
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                        {recommendations.map((rec) => {
                          const recTitle = rec.title || rec.name;
                          const recYear = (
                            rec.release_date ||
                            rec.first_air_date ||
                            ""
                          ).slice(0, 4);

                          return (
                            <Link
                              key={rec.id}
                              href={`/movie/${rec.id}`}
                              className="flex gap-3 group"
                            >
                              <div className="w-24 aspect-[2/3] bg-[#212121] rounded-lg overflow-hidden shrink-0">
                                {rec.poster_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w185${rec.poster_path}`}
                                    alt={recTitle}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-[#666]">
                                    No image
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1 py-1">
                                <p className="text-sm font-medium text-[#f1f1f1] line-clamp-2 group-hover:text-[#ff0033] transition">
                                  {recTitle}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-[#aaa] mt-1">
                                  {recYear && <span>{recYear}</span>}
                                  {rec.vote_average > 0 && (
                                    <span className="flex items-center gap-0.5">
                                      <svg
                                        className="w-3 h-3 text-yellow-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                      {rec.vote_average.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                                {rec.overview && (
                                  <p className="text-[11px] text-[#888] mt-1 line-clamp-2">
                                    {rec.overview}
                                  </p>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}