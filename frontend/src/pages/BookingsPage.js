// src/pages/BookingsPage.js  —  Look up bookings by email address
import { useState } from "react";
import { API_URL } from "../config";

export default function BookingsPage({ onBack }) {
  const [query,    setQuery]    = useState("");
  const [bookings, setBookings] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/bookings?email=${encodeURIComponent(query)}`);
      const data = await res.json();
      setBookings(data.bookings || []);
      setSearched(true);
    } catch {
      setBookings([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 20px" }}>
      {/* Sticky header */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        padding:        "14px 0 10px",
        position:       "sticky",
        top:            0,
        background:     "var(--bg-chat)",
        zIndex:         2,
      }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: 15 }}>🎫 My Bookings</h2>
        <button onClick={onBack} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "var(--radius-sm)", padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          ← Back
        </button>
      </div>

      {/* Search bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Enter your email address…"
          style={{
            flex:         1,
            background:   "var(--bg-card)",
            border:       "1px solid var(--border-soft)",
            borderRadius: "var(--radius-md)",
            padding:      "10px 14px",
            color:        "var(--text-primary)",
            fontFamily:   "var(--font-mono)",
            fontSize:     13,
            outline:      "none",
          }}
        />
        <button
          onClick={search}
          disabled={loading}
          style={{
            background:   "var(--accent)",
            border:       "none",
            borderRadius: "var(--radius-md)",
            padding:      "0 18px",
            color:        "#000",
            fontFamily:   "var(--font-mono)",
            fontWeight:   700,
            cursor:       "pointer",
            fontSize:     13,
          }}
        >
          {loading ? "…" : "SEARCH"}
        </button>
      </div>

      {/* Results */}
      {searched && bookings.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", padding: 30 }}>
          No bookings found for "{query}"
        </div>
      )}

      {bookings.map((b) => (
        <div key={b.ticket_id} style={{
          background:   "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          padding:      16,
          marginBottom: 10,
          border:       "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)", fontWeight: 700 }}>
                {b.ticket_id}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)", marginTop: 4 }}>
                {b.passenger_name}
              </div>
              {b.email && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                  {b.email}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 800, color: "var(--success)" }}>
                Seat {b.seat_id}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--warning)" }}>
                ₹{b.price}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            Booked: {b.booked_at ? new Date(b.booked_at).toLocaleString() : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}
