// src/components/Header.js  —  Top navigation bar
export default function Header({ page, onNavigate, connected }) {
  const navBtn = (target, label, icon) => (
    <button
      onClick={() => onNavigate(target)}
      style={{
        background:  page === target ? "var(--accent)" : "transparent",
        border:      "1px solid var(--border-soft)",
        color:       page === target ? "#000" : "var(--text-secondary)",
        borderRadius: "var(--radius-sm)",
        padding:     "5px 10px",
        cursor:      "pointer",
        fontSize:    13,
        fontFamily:  "var(--font-mono)",
        transition:  "all .15s",
      }}
      title={label}
    >
      {icon}
    </button>
  );

  return (
    <div style={{
      background:    "var(--bg-shell)",
      borderBottom:  "1px solid var(--border)",
      padding:       "12px 16px",
      display:       "flex",
      alignItems:    "center",
      gap:           12,
      flexShrink:    0,
      position:      "sticky",
      top:           0,
      zIndex:        10,
    }}>
      {/* Bot avatar */}
      <div style={{
        width:          40,
        height:         40,
        borderRadius:   "50%",
        background:     "var(--accent-soft)",
        border:         "2px solid var(--accent)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       20,
        flexShrink:     0,
      }}>
        🤖
      </div>

      {/* Title + status */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize:   14,
          fontWeight: 700,
          color:      "var(--text-primary)",
        }}>
          Ticketing Assistant
        </div>
        <div style={{
          fontSize:    11,
          color:       connected ? "var(--success)" : "var(--warning)",
          display:     "flex",
          alignItems:  "center",
          gap:         4,
          fontFamily:  "var(--font-mono)",
        }}>
          <span style={{
            width:      6,
            height:     6,
            borderRadius: "50%",
            background:  "currentColor",
            animation:   "pulse 2s infinite",
            display:     "inline-block",
          }} />
          {connected ? "Live · Real-time sync" : "Connected"}
        </div>
      </div>

      {/* Nav buttons */}
      <div style={{ display: "flex", gap: 6 }}>
        {navBtn("chat",     "Chat",       "Chat")}
        {navBtn("bookings", "My Bookings","Bookings")}
        {navBtn("admin",    "Admin",      "Admin")}
      </div>
    </div>
  );
}
