// src/hooks/useNLP.js
// Calls Claude API to parse user intent and extract entities.
// Move this to the backend /chat/parse endpoint before going to production
// so your API key is never exposed in the browser.

const SYSTEM_PROMPT = `You are the NLP engine for a seat reservation chatbot.
Parse the user's message and return ONLY valid JSON — no markdown, no explanation.

JSON schema:
{
  "intent": one of ["check_availability","book_seat","cancel_booking","my_bookings",
                    "greeting","help","seat_type_query","confirm","deny",
                    "provide_name","provide_email","provide_ticket","unknown"],
  "entities": {
    "seat_id":   "A1" or null,
    "seat_ids":  ["A1","B2"] or null,
    "seat_type": "window"|"aisle"|"middle"|null,
    "count":     number|null,
    "ticket_id": "TKT-XXXXXX"|null,
    "email":     "x@y.com"|null,
    "name":      "Full Name"|null
  },
  "reply_hint": "one short sentence describing what was understood"
}

Examples:
"book me a window seat"        → intent: book_seat,    seat_type: window
"I want seats A1 and B3"       → intent: book_seat,    seat_ids: ["A1","B3"]
"cancel TKT-ABC123"            → intent: cancel_booking, ticket_id: TKT-ABC123
"my name is Tanvi"             → intent: provide_name, name: Tanvi
"yes please"                   → intent: confirm
"show only aisle seats"        → intent: seat_type_query, seat_type: aisle`;


// Simple keyword fallback (no API key needed)
function keywordFallback(text) {
  const lower = text.toLowerCase();
  if (/\b(check|available|show|seats?|view)\b/.test(lower))
    return { intent: "check_availability", entities: {} };
  if (/\b(book|reserve|want|buy|get me)\b/.test(lower))
    return { intent: "book_seat", entities: {} };
  if (/\b(cancel|refund)\b/.test(lower))
    return { intent: "cancel_booking", entities: {} };
  if (/\b(my bookings?|my tickets?)\b/.test(lower))
    return { intent: "my_bookings", entities: {} };
  if (/^\s*(yes|confirm|ok|sure|yep)\b/.test(lower))
    return { intent: "confirm", entities: {} };
  if (/^\s*(no|nope|don'?t)\b/.test(lower))
    return { intent: "deny", entities: {} };
  if (/\b(hi|hello|hey)\b/.test(lower))
    return { intent: "greeting", entities: {} };

  // Entity extraction even without intent
  const entities = {};
  const seatIds = [...text.toUpperCase().matchAll(/\b([A-D][1-5])\b/g)].map(m => m[1]);
  if (seatIds.length === 1) entities.seat_id  = seatIds[0];
  if (seatIds.length  > 1) entities.seat_ids = seatIds;

  const ticketMatch = text.toUpperCase().match(/\bTKT-[A-Z0-9]{6}\b/);
  if (ticketMatch) entities.ticket_id = ticketMatch[0];

  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) entities.email = emailMatch[0];

  return { intent: seatIds.length ? "book_seat" : "unknown", entities };
}


export default async function parseIntent(userText, recentMessages = []) {
  try {
    const history = recentMessages.slice(-6).map(m => ({
      role:    m.from === "user" ? "user" : "assistant",
      content: m.from === "user" ? m.text : (m.nlpHint || m.text || "…"),
    }));

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 300,
        system:     SYSTEM_PROMPT,
        messages:   [...history, { role: "user", content: userText }],
      }),
    });

    const data = await res.json();
    const raw  = data.content?.[0]?.text || "{}";
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    // API unreachable or quota exceeded — fall back gracefully
    return keywordFallback(userText);
  }
}
