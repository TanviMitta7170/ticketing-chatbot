// src/pages/AdminPage.js  —  Occupancy stats, revenue, booking timeline
import { useState, useEffect } from "react";
import { API_URL } from "../config";

function KPICard({ label, value, color }) {
  return (
    <div style={{
      background:   "var(--bg-card)",
      borderRadius: "var(--radius-md)",
      padding:      "12px 14px",
      border:       "1px solid var(--border)",
    }}>
      <div style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "var(--font-mono)" }}>
        {value}
      </div>
    </div>
  );
}

export default function AdminPage({ onBack }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/admin/stats`)
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
      Loading stats…
    </div>
  );

  const maxBookings = Math.max(...(stats.timeline?.map((t) => t.bookings) || [1]), 1);

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
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: 15 }}>📊 Admin Dashboard</h2>
        <button onClick={onBack} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "var(--radius-sm)", padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          ← Back
        </button>
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 14 }}>
        <KPICard label="TOTAL SEATS"    value={stats.total_seats}     color="var(--accent)"   />
        <KPICard label="BOOKED"         value={stats.booked_seats}    color="var(--danger)"   />
        <KPICard label="AVAILABLE"      value={stats.available_seats} color="var(--success)"  />
        <KPICard label="REVENUE"        value={`₹${stats.total_revenue}`} color="var(--warning)" />
        <KPICard label="OCCUPANCY"      value={`${stats.occupancy_pct}%`} color="var(--purple)"  />
      </div>

      {/* Occupancy bar */}
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-md)", padding: 14, marginBottom: 12, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>OCCUPANCY RATE</div>
        <div style={{ background: "var(--border)", borderRadius: 4, height: 12, overflow: "hidden" }}>
          <div style={{
            height:     "100%",
            width:      `${stats.occupancy_pct}%`,
            background: "linear-gradient(90deg, var(--accent), var(--purple))",
            borderRadius: 4,
            transition: "width 1s ease",
          }} />
        </div>
      </div>

      {/* Seat type breakdown */}
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-md)", padding: 14, marginBottom: 12, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 10 }}>BREAKDOWN BY TYPE</div>
        {Object.entries(stats.by_type || {}).map(([type, d]) => (
          <div key={type} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginBottom: 3 }}>
              <span>{type.toUpperCase()}</span>
              <span>{d.booked}/{d.total}</span>
            </div>
            <div style={{ background: "var(--border)", borderRadius: 3, height: 6 }}>
              <div style={{ height: "100%", width: `${(d.booked / d.total) * 100}%`, background: "var(--accent)", borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>

      {/* 7-day booking chart */}
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-md)", padding: 14, marginBottom: 12, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 10 }}>BOOKINGS — LAST 7 DAYS</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 64 }}>
          {stats.timeline?.map((t) => (
            <div key={t.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              {t.bookings > 0 && (
                <div style={{ fontSize: 9, color: "var(--success)", fontFamily: "var(--font-mono)" }}>{t.bookings}</div>
              )}
              <div style={{
                width:      "100%",
                background: t.bookings ? "var(--accent)" : "var(--border)",
                borderRadius: "3px 3px 0 0",
                height:     `${(t.bookings / maxBookings) * 44 + (t.bookings ? 6 : 4)}px`,
                transition: "height .5s ease",
                minHeight:  4,
              }} />
              <div style={{ fontSize: 8, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textAlign: "center" }}>
                {t.date.split(" ")[1]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-md)", padding: 14, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 10 }}>RECENT BOOKINGS</div>
        {stats.recent_bookings?.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>No bookings yet.</div>
        )}
        {stats.recent_bookings?.map((b) => (
          <div key={b.ticket_id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            <span style={{ color: "var(--accent)" }}>{b.ticket_id}</span>
            <span style={{ color: "var(--text-primary)" }}>{b.seat_id} · {b.passenger_name}</span>
            <span style={{ color: "var(--success)" }}>₹{b.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
