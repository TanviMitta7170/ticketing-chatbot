// src/hooks/useSeats.js
// Fetches seats from the API. Re-fetch by calling refresh().
import { useState, useCallback } from "react";
import { API_URL } from "../config";

export default function useSeats() {
  const [seats,   setSeats]   = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSeats = useCallback(async (type = null) => {
    setLoading(true);
    try {
      const url = type ? `${API_URL}/status?type=${type}` : `${API_URL}/status`;
      const res  = await fetch(url);
      const data = await res.json();
      setSeats(data.seats || []);
      return data;
    } catch (err) {
      console.error("useSeats fetch error:", err);
      return { seats: [], summary: { available: 0, booked: 0, total: 0 } };
    } finally {
      setLoading(false);
    }
  }, []);

  return { seats, setSeats, loading, fetchSeats };
}
