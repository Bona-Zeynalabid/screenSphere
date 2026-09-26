const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;

if (!API_KEY) {
  console.error("TMDb API key missing. Set NEXT_PUBLIC_TMDB_KEY in .env.local");
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const getTrendingMovies = async () => {
  try {
    return handleResponse(
      await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`)
    );
  } catch (error) {
    console.error("Error fetching movies:", error);
    return { results: [] };
  }
};

export const getTrendingTV = async () => {
  try {
    return handleResponse(
      await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}`)
    );
  } catch (error) {
    console.error("Error fetching TV shows:", error);
    return { results: [] };
  }
};

export const searchMovies = async (query) => {
  try {
    return handleResponse(
      await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}`
      )
    );
  } catch (error) {
    console.error("Error searching movies:", error);
    return { results: [] };
  }
};

export const searchTV = async (query) => {
  try {
    return handleResponse(
      await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}`
      )
    );
  } catch (error) {
    console.error("Error searching TV shows:", error);
    return { results: [] };
  }
};

export const getMovieDetails = async (id) => {
  try {
    return handleResponse(
      await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
    );
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

export const getTVDetails = async (id) => {
  try {
    return handleResponse(
      await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`)
    );
  } catch (error) {
    console.error("Error fetching TV details:", error);
    return null;
  }
};

// 🎯 Movie recommendations (for the watch page sidebar)
export const getMovieRecommendations = async (id) => {
  try {
    return handleResponse(
      await fetch(
        `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${API_KEY}`
      )
    );
  } catch (error) {
    console.error("Error fetching movie recommendations:", error);
    return { results: [] };
  }
};

// 🎯 TV recommendations (bonus, in case you want it later)
export const getTVRecommendations = async (id) => {
  try {
    return handleResponse(
      await fetch(
        `https://api.themoviedb.org/3/tv/${id}/recommendations?api_key=${API_KEY}`
      )
    );
  } catch (error) {
    console.error("Error fetching TV recommendations:", error);
    return { results: [] };
  }
};

// 🎯 Discover movies by genre (and optional language)
export const discoverMovies = async (genreId, options = {}) => {
  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      sort_by: "popularity.desc",
      include_adult: "false",
      page: "1",
    });
    if (genreId) params.set("with_genres", String(genreId));
    if (options.language) params.set("with_original_language", options.language);

    return handleResponse(
      await fetch(`https://api.themoviedb.org/3/discover/movie?${params}`)
    );
  } catch (error) {
    console.error("Error discovering movies:", error);
    return { results: [] };
  }
};

// 🎯 Discover TV shows by genre (and optional language)
export const discoverTV = async (genreId, options = {}) => {
  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      sort_by: "popularity.desc",
      page: "1",
    });
    if (genreId) params.set("with_genres", String(genreId));
    if (options.language) params.set("with_original_language", options.language);

    return handleResponse(
      await fetch(`https://api.themoviedb.org/3/discover/tv?${params}`)
    );
  } catch (error) {
    console.error("Error discovering TV shows:", error);
    return { results: [] };
  }
};