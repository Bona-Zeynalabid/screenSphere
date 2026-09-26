export const addToHistory = (item) => {
  if (typeof window === "undefined") return;
  try {
    const history = JSON.parse(localStorage.getItem("watchHistory")) || [];
    const arr = Array.isArray(history) ? history : [];
    const filtered = arr.filter((h) => h.id !== item.id);
    const newItem = {
      ...item,
      watchedAt: new Date().toISOString(),
      type: item.title ? "movie" : "tv",
    };
    const updated = [newItem, ...filtered].slice(0, 50);
    localStorage.setItem("watchHistory", JSON.stringify(updated));
  } catch (error) {
    console.error("Error adding to history:", error);
  }
};

export const getHistory = () => {
  if (typeof window === "undefined") return [];
  try {
    const history = JSON.parse(localStorage.getItem("watchHistory")) || [];
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error("Error getting history:", error);
    return [];
  }
};

export const clearHistory = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("watchHistory");
};

export const removeFromHistory = (id) => {
  try {
    const history = getHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem("watchHistory", JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Error removing from history:", error);
    return [];
  }
};