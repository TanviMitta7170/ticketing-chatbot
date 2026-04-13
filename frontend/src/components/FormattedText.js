// src/components/FormattedText.js
// Renders **bold** and `code` markdown inside message bubbles.
export default function FormattedText({ text }) {
  return text.split("\n").map((line, i, arr) => {
    const parts = line
      .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
      .map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return (
            <strong key={j} style={{ color: "var(--accent)" }}>
              {part.slice(2, -2)}
            </strong>
          );
        if (part.startsWith("`") && part.endsWith("`"))
          return (
            <code key={j} style={{
              fontFamily:   "var(--font-mono)",
              fontSize:     11,
              background:   "var(--bg-shell)",
              border:       "1px solid var(--border-soft)",
              padding:      "1px 4px",
              borderRadius: "var(--radius-sm)",
              color:        "var(--success)",
            }}>
              {part.slice(1, -1)}
            </code>
          );
        return part;
      });

    return (
      <span key={i}>
        {parts}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}
