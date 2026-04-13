// src/components/SeatGrid.js  —  Interactive seat map with type filter pills

const FILTERS = ["all", "window", "aisle", "middle"];

export default function SeatGrid({ seats, selectedIds = [], onToggle, filterType, onFilterChange }) {
  const displayed = filterType ? seats.filter((s) => s.type === filterType) : seats;
  const rows      = [...new Set(displayed.map((s) => s.row))].sort();

  const selectedTotal = seats
    .filter((s) => selectedIds.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <div style={{ marginTop: 10 }}>
      {/* Filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const active = f === "all" ? !filterType : filterType === f;
          return (
            <button
              key={f}
              onClick={() => onFilterChange(f === "all" ? null : f)}
              style={{
                padding:      "3px 10px",
                borderRadius: 20,
                fontSize:     10,
                fontFamily:   "var(--font-mono)",
                cursor:       "pointer",
                border:       "1px solid var(--accent)",
                background:   active ? "var(--accent)" : "transparent",
                color:        active ? "#000" : "var(--accent)",
              }}
            >
              {f.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display:    "flex",
        gap:        12,
        marginBottom: 8,
        fontSize:   10,
        color:      "var(--text-secondary)",
        fontFamily: "var(--font-mono)",
      }}>
        <span><span style={{ color: "var(--success)" }}>■</span> Available</span>
        <span><span style={{ color: "var(--danger)"  }}>■</span> Booked</span>
        <span><span style={{ color: "var(--accent)"  }}>■</span> Selected</span>
      </div>

      {/* Seat rows */}
      {rows.map((row) => (
        <div key={row} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize:   11,
            color:      "var(--text-muted)",
            width:      14,
          }}>
            {row}
          </span>

          {displayed
            .filter((s) => s.row === row)
            .map((s) => {
              const selected = selectedIds.includes(s.id);
              const bg = selected
                ? "var(--accent)"
                : s.status === "available"
                ? "var(--success)"
                : "#2a1a1a";
              const color = selected
                ? "#000"
                : s.status === "available"
                ? "#000"
                : "var(--danger)";

              return (
                <button
                  key={s.id}
                  disabled={s.status === "booked"}
                  title={`${s.id} · ${s.type} · ₹${s.price}`}
                  onClick={() => onToggle?.(s)}
                  style={{
                    width:      34,
                    height:     34,
                    borderRadius: "var(--radius-sm)",
                    border:     "none",
                    background: bg,
                    color,
                    fontSize:   11,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    cursor:     s.status === "booked" ? "not-allowed" : "pointer",
                    opacity:    s.status === "booked" ? 0.5 : 1,
                    transform:  selected ? "scale(1.1)" : "scale(1)",
                    transition: "transform .15s, background .15s",
                    boxShadow:  selected ? "0 0 8px #22d3ee88" : "none",
                  }}
                >
                  {s.number}
                </button>
              );
            })}
        </div>
      ))}

      {/* Running total for selected seats */}
      {selectedIds.length > 0 && (
        <div style={{
          marginTop:    8,
          padding:      "6px 10px",
          background:   "rgba(34,211,238,0.08)",
          borderRadius: "var(--radius-sm)",
          border:       "1px solid rgba(34,211,238,0.25)",
          fontSize:     12,
          color:        "var(--accent)",
          fontFamily:   "var(--font-mono)",
        }}>
          Selected: {selectedIds.join(", ")} · ₹{selectedTotal} total
        </div>
      )}
    </div>
  );
}
