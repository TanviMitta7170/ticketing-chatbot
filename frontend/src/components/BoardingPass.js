// src/components/BoardingPass.js  —  Animated confirmation overlay
import { useState, useEffect } from "react";

// Pure-CSS QR pattern generated from ticket ID hash
function MiniQR({ value }) {
  const hash  = [...value].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const cells = Array.from({ length: 49 }, (_, i) =>
    !!(hash >> (i % 32)) & 1 || i % 7 === 0 || i < 7 || i > 41
  );
  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: "repeat(7, 6px)",
      gap:                 1,
      background:          "#fff",
      padding:             6,
      borderRadius:        4,
    }}>
      {cells.map((on, i) => (
        <div
          key={i}
          style={{ width: 6, height: 6, background: on ? "#0d1117" : "#fff" }}
        />
      ))}
    </div>
  );
}

export default function BoardingPass({ bookings, passengerName, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 40); }, []);

  const totalPrice = bookings.reduce((s, b) => s + b.price, 0);

  return (
    <div style={{
      position:       "fixed",
      inset:          0,
      background:     "rgba(0,0,0,0.85)",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      zIndex:         1000,
      padding:        20,
      opacity:        visible ? 1 : 0,
      transition:     "opacity .3s",
    }}>
      <div style={{
        background:    "linear-gradient(135deg, #0e7490, #164e63)",
        borderRadius:  20,
        padding:       "0 0 20px",
        width:         "100%",
        maxWidth:      420,
        boxShadow:     "0 24px 64px rgba(0,200,255,0.25)",
        animation:     visible ? "slideUp .4s cubic-bezier(.34,1.56,.64,1) both" : "none",
      }}>
        {/* Header strip */}
        <div style={{
          background:   "var(--accent)",
          borderRadius: "20px 20px 0 0",
          padding:      "12px 24px",
          display:      "flex",
          justifyContent: "space-between",
          alignItems:   "center",
        }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#000", opacity: .6, letterSpacing: 2 }}>BOARDING PASS</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#000", fontFamily: "var(--font-mono)" }}>VCE TICKETING</div>
          </div>
          <div style={{ fontSize: 28 }}>✈️</div>
        </div>

        {/* Passenger name */}
        <div style={{ padding: "16px 24px 0" }}>
          <div style={{ fontSize: 10, color: "#67e8f9", letterSpacing: 2, fontFamily: "var(--font-mono)" }}>PASSENGER</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)", marginTop: 2 }}>
            {passengerName.toUpperCase()}
          </div>
        </div>

        {/* Seat cards */}
        <div style={{ padding: "12px 24px", display: "flex", flexWrap: "wrap", gap: 10 }}>
          {bookings.map((b) => (
            <div key={b.ticket_id} style={{
              background:   "rgba(0,0,0,0.3)",
              borderRadius: 12,
              padding:      "10px 16px",
              flex:         "1 1 140px",
            }}>
              <div style={{ fontSize: 9, color: "#67e8f9", letterSpacing: 2, fontFamily: "var(--font-mono)" }}>SEAT / TICKET</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff",   fontFamily: "var(--font-mono)" }}>{b.seat_id}</div>
              <div style={{ fontSize: 10, color: "#a5f3fc",                 fontFamily: "var(--font-mono)" }}>{b.ticket_id}</div>
              <div style={{ fontSize: 12, color: "#67e8f9", marginTop: 4,   fontFamily: "var(--font-mono)" }}>₹{b.price}</div>
            </div>
          ))}
        </div>

        {/* Tear line */}
        <div style={{ borderTop: "2px dashed rgba(255,255,255,0.2)", margin: "12px 0", position: "relative" }}>
          <div style={{ position: "absolute", left:  -12, top: -10, width: 20, height: 20, background: "rgba(0,0,0,0.85)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", right: -12, top: -10, width: 20, height: 20, background: "rgba(0,0,0,0.85)", borderRadius: "50%" }} />
        </div>

        {/* QR + total */}
        <div style={{ padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <MiniQR value={bookings[0]?.ticket_id || "TKT"} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#67e8f9", fontFamily: "var(--font-mono)", letterSpacing: 2 }}>TOTAL PAID</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "var(--font-mono)" }}>₹{totalPrice}</div>
            <div style={{ fontSize: 10, color: "#a5f3fc", fontFamily: "var(--font-mono)" }}>{bookings.length} SEAT(S)</div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            display:      "block",
            margin:       "20px auto 0",
            background:   "rgba(255,255,255,0.15)",
            border:       "1px solid rgba(255,255,255,0.3)",
            color:        "#fff",
            borderRadius: 20,
            padding:      "8px 24px",
            cursor:       "pointer",
            fontSize:     13,
            fontFamily:   "var(--font-mono)",
          }}
        >
          ✕ CLOSE
        </button>
      </div>
    </div>
  );
}
