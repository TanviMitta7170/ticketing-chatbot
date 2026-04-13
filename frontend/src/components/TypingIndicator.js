// src/components/TypingIndicator.js  —  Animated "bot is typing" dots
export default function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
      <div style={{
        width:          30,
        height:         30,
        borderRadius:   "50%",
        background:     "var(--accent-soft)",
        border:         "1.5px solid var(--accent)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       14,
        flexShrink:     0,
      }}>
        🤖
      </div>
      <div style={{
        background:    "var(--bg-surface)",
        border:        "1px solid var(--border)",
        borderRadius:  "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",
        padding:       "10px 14px",
        display:       "flex",
        gap:           5,
        alignItems:    "center",
      }}>
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            style={{
              width:          7,
              height:         7,
              borderRadius:   "50%",
              background:     "var(--accent)",
              animation:      `bounce 1.2s infinite`,
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
