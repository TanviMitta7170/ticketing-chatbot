// src/config.js  —  Central config, change API_URL for production
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const SEAT_COLORS = {
  available: "#34d399",
  booked:    "#f87171",
  selected:  "#22d3ee",
};
