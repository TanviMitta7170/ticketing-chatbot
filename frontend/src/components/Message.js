// src/components/Message.js  —  Renders one chat message bubble
import SeatGrid    from "./SeatGrid";
import QuickReplies from "./QuickReplies";
import FormattedText from "./FormattedText";

export default function Message({ msg, seats, selectedIds, onSeatToggle, onFilterChange, filterType, onQuickReply }) {
  const isBot  = msg.from === "bot";
  const isUser = msg.from === "user";

  return (
    <div style={{
      display:       "flex",
      alignItems:    "flex-end",
      gap:           8,
      flexDirection: isUser ? "row-reverse" : "row",
      animation:     "fadeUp .25s ease both",
    }}>
      {/* Avatar */}
      <div style={{
        width:          30,
        height:         30,
        borderRadius:   "50%",
        background:     isBot ? "var(--accent-soft)" : "#1c2d40",
        border:         isBot ? "1.5px solid var(--accent)" : "1.5px solid #30404d",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       14,
        flexShrink:     0,
      }}>
        {isBot ? "🤖" : "👤"}
      </div>

      {/* Bubble + quick replies */}
      <div style={{
        display:    "flex",
        flexDirection: "column",
        gap:        6,
        alignItems: isUser ? "flex-end" : "flex-start",
        maxWidth:   "74%",
      }}>
        {/* Text bubble */}
        {msg.text && (
          <div style={{
            padding:       "10px 14px",
            borderRadius:  isBot
              ? "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px"
              : "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)",
            background:    isBot
              ? (msg.isConfirmation
                  ? "linear-gradient(135deg, #064e3b, #065f46)"
                  : "var(--bg-surface)")
              : "var(--accent-dark)",
            border:        isBot
              ? (msg.isConfirmation ? "1px solid var(--success)" : "1px solid var(--border)")
              : "none",
            fontSize:      13.5,
            lineHeight:    1.6,
            color:         "var(--text-primary)",
          }}>
            <FormattedText text={msg.text} />

            {/* Seat grid embedded in bubble */}
            {msg.showSeatGrid && (
              <SeatGrid
                seats={seats}
                selectedIds={selectedIds}
                onToggle={onSeatToggle}
                filterType={filterType}
                onFilterChange={onFilterChange}
              />
            )}
          </div>
        )}

        {/* Quick reply chips */}
        {msg.quickReplies?.length > 0 && (
          <QuickReplies options={msg.quickReplies} onSelect={onQuickReply} />
        )}

        <span style={{
          fontSize:   10,
          color:      "var(--text-muted)",
          fontFamily: "var(--font-mono)",
        }}>
          {msg.ts}
        </span>
      </div>
    </div>
  );
}
