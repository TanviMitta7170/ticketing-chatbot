// src/components/QuickReplies.js  —  Row of tappable chip buttons
export default function QuickReplies({ options, onSelect }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((label) => (
        <button
          key={label}
          onClick={() => onSelect(label)}
          style={{
            padding:      "5px 12px",
            borderRadius: 20,
            fontSize:     12,
            fontFamily:   "var(--font-mono)",
            cursor:       "pointer",
            border:       "1.5px solid var(--accent)",
            background:   "transparent",
            color:        "var(--accent)",
            transition:   "all .15s",
            whiteSpace:   "nowrap",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--accent)";
            e.target.style.color      = "#000";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color      = "var(--accent)";
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
