// src/pages/ChatPage.js  —  Chat interface + conversation state machine
import { useState, useEffect, useRef, useCallback } from "react";
import Message        from "../components/Message";
import TypingIndicator from "../components/TypingIndicator";
import useSeats       from "../hooks/useSeats";
import useWebSocket   from "../hooks/useWebSocket";
import parseIntent    from "../hooks/useNLP";
import { API_URL }    from "../config";

// ── Message helpers ──────────────────────────────────────────
const uid    = () => Date.now() + Math.random();
const tsNow  = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const botMsg = (text, extra = {}) => ({ id: uid(), from: "bot",  text, ts: tsNow(), ...extra });
const usrMsg = (text)             => ({ id: uid(), from: "user", text, ts: tsNow() });
const delay  = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Conversation states ──────────────────────────────────────
const S = {
  MENU:         "MENU",
  GRID_OPEN:    "GRID_OPEN",
  AWAIT_NAME:   "AWAIT_NAME",
  AWAIT_EMAIL:  "AWAIT_EMAIL",
  AWAIT_CONFIRM:"AWAIT_CONFIRM",
  AWAIT_TICKET: "AWAIT_TICKET",
};

export default function ChatPage({ onShowBoardingPass, onConnectionChange }) {
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [isTyping,      setIsTyping]      = useState(false);
  const [convState,     setConvState]     = useState(S.MENU);
  const [pending,       setPending]       = useState({}); // booking in progress
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [filterType,    setFilterType]    = useState(null);

  const { seats, setSeats, fetchSeats } = useSeats();
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // WebSocket — live seat updates
  useWebSocket({
    onSeatsUpdated:    (updated) => setSeats(updated),
    onConnectionChange,
  });

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Welcome message
  useEffect(() => {
    setTimeout(() => {
      push(botMsg(
        "Welcome! 👋 I'm your **AI Ticketing Assistant**.\n\nJust tell me what you need in plain English — I understand natural language!",
        { quickReplies: ["Check availability", "Book a seat", "Cancel booking", "My bookings"] }
      ));
    }, 400);
  }, []); // eslint-disable-line

  // ── Helpers ────────────────────────────────────────────────
  const push = useCallback((msg) => setMessages((p) => [...p, msg]), []);

  const thinkThenPush = async (msg, thinkMs = 800) => {
    setIsTyping(true);
    await delay(thinkMs + Math.random() * 300);
    setIsTyping(false);
    push(msg);
  };

  // ── Main input handler ────────────────────────────────────
  const handle = async (rawText) => {
    const text = rawText.trim();
    if (!text) return;

    push(usrMsg(text));
    setInput("");
    inputRef.current?.focus();

    setIsTyping(true);
    const nlp = await parseIntent(text, messages);
    await delay(600 + Math.random() * 300);
    setIsTyping(false);

    const { intent, entities } = nlp;
    const seatIds = entities.seat_ids || (entities.seat_id ? [entities.seat_id] : []);

    switch (convState) {

      // ── Main menu ────────────────────────────────────────
      case S.MENU: {
        if (intent === "greeting") {
          push(botMsg("Hey! 😊 What can I help you with?", {
            quickReplies: ["🔍 Check availability", "🎫 Book a seat", "❌ Cancel booking"],
          }));

        } else if (intent === "check_availability" || intent === "seat_type_query") {
          const type = entities.seat_type || null;
          const data = await fetchSeats(type);
          if (type) setFilterType(type);
          push(botMsg(
            `Here's the live seat map${type ? ` (${type} seats)` : ""}.\n🟢 **${data.summary.available}** available · 🔴 **${data.summary.booked}** booked\n\nTap to select seats, then say **"book"**.`,
            { showSeatGrid: true, quickReplies: ["🎫 Book selected", "🔄 Clear selection"] }
          ));
          setConvState(S.GRID_OPEN);

        } else if (intent === "book_seat") {
          if (seatIds.length > 0) {
            setPending({ seatIds });
            push(botMsg(`Got it — **${seatIds.join(", ")}**. What's your **full name**?`));
            setConvState(S.AWAIT_NAME);
          } else {
            const type = entities.seat_type || null;
            const data = await fetchSeats(type);
            if (type) setFilterType(type);
            push(botMsg(
              `Let's pick your seat${type ? ` (${type} seats shown)` : ""}. Tap one or more, then say **"book"**:`,
              { showSeatGrid: true }
            ));
            setConvState(S.GRID_OPEN);
          }

        } else if (intent === "cancel_booking") {
          if (entities.ticket_id) {
            await doCancel(entities.ticket_id);
          } else {
            push(botMsg("Please share your **Ticket ID** (e.g. `TKT-ABC123`):"));
            setConvState(S.AWAIT_TICKET);
          }

        } else if (intent === "my_bookings") {
          // Handled by App-level navigation — hint the user
          push(botMsg("You can view all your bookings in the **🎫 My Bookings** tab at the top!"));

        } else if (intent === "help") {
          push(botMsg(
            "Here's what I can do:\n\n• **Check availability** — see the seat map\n• **Book a seat** — pick one or many seats\n• **Cancel booking** — provide your Ticket ID\n• **My bookings** — search by email in the top tab",
            { quickReplies: ["🔍 Check availability", "🎫 Book a seat", "❌ Cancel booking"] }
          ));

        } else {
          push(botMsg(
            `I understood: *${nlp.reply_hint || "something unclear"}* — try one of these:`,
            { quickReplies: ["🔍 Check availability", "🎫 Book a seat", "❌ Cancel booking", "❓ Help"] }
          ));
        }
        break;
      }

      // ── Seat grid is open ────────────────────────────────
      case S.GRID_OPEN: {
        const ids = seatIds.length > 0 ? seatIds : selectedSeats;

        if (intent === "book_seat" || text.toLowerCase().includes("book") || text.toLowerCase().includes("these")) {
          if (ids.length === 0) {
            push(botMsg("Please tap at least one green seat, or type a seat ID like **A3**."));
          } else {
            setPending({ seatIds: ids });
            push(botMsg(`Great — **${ids.join(", ")}** selected! What's your **full name**?`));
            setConvState(S.AWAIT_NAME);
          }

        } else if (intent === "seat_type_query" || intent === "check_availability") {
          const type = entities.seat_type || null;
          setFilterType(type);
          const data = await fetchSeats(type);
          push(botMsg(`Showing **${type || "all"}** seats — ${data.summary.available} available.`, { showSeatGrid: true }));

        } else if (intent === "deny" || text.toLowerCase().includes("clear")) {
          setSelectedSeats([]);
          push(botMsg("Selection cleared. Tap seats to start again."));

        } else if (ids.length > 0) {
          // User typed seat IDs directly
          setPending({ seatIds: ids });
          push(botMsg(`Booking **${ids.join(", ")}** — what's your **full name**?`));
          setConvState(S.AWAIT_NAME);

        } else {
          push(botMsg("Tap a seat to select it, then say **book** to continue."));
        }
        break;
      }

      // ── Collect name ─────────────────────────────────────
      case S.AWAIT_NAME: {
        const name = entities.name || text;
        if (name.length < 2) {
          push(botMsg("Please enter a valid name (at least 2 characters)."));
          break;
        }
        setPending((p) => ({ ...p, name }));
        push(botMsg(`Thanks, **${name}**! 📧 Enter your **email** (or type *skip*):`, { nlpHint: "provide_email" }));
        setConvState(S.AWAIT_EMAIL);
        break;
      }

      // ── Collect email ─────────────────────────────────────
      case S.AWAIT_EMAIL: {
        const email = (entities.email || (text.toLowerCase() === "skip" ? "" : text)).trim();
        setPending((p) => ({ ...p, email }));

        const seatDetails = seats.filter((s) => pending.seatIds?.includes(s.id));
        const total       = seatDetails.reduce((a, s) => a + s.price, 0);

        push(botMsg(
          `Here's your booking summary:\n\n🎫 Seats: **${pending.seatIds?.join(", ")}**\n👤 Name: **${pending.name}**${email ? `\n📧 Email: ${email}` : ""}\n💰 Total: **₹${total}**\n\nConfirm?`,
          { quickReplies: ["✅ Confirm", "🔄 Change seat"] }
        ));
        setConvState(S.AWAIT_CONFIRM);
        break;
      }

      // ── Confirm or change ─────────────────────────────────
      case S.AWAIT_CONFIRM: {
        if (intent === "confirm" || /yes|confirm|ok|sure/i.test(text)) {
          try {
            const res  = await fetch(`${API_URL}/book`, {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                seat_ids:       pending.seatIds,
                passenger_name: pending.name,
                email:          pending.email || "",
              }),
            });
            const data = await res.json();

            if (data.success) {
              push(botMsg(
                `🎉 **All confirmed, ${pending.name}!**\n\nSave your Ticket ID(s) — you'll need them to cancel. Anything else?`,
                { isConfirmation: true, quickReplies: ["🔍 Check seats", "❌ Cancel booking", "📋 My bookings"] }
              ));
              onShowBoardingPass?.({ bookings: data.bookings, name: pending.name });
              setSelectedSeats([]);
              setPending({});
              setConvState(S.MENU);
            } else {
              push(botMsg(`⚠️ ${data.error}`, { quickReplies: ["🔍 Check seats"] }));
              setConvState(S.MENU);
            }
          } catch {
            push(botMsg("⚠️ Could not reach the server. Is the backend running on port 5000?"));
            setConvState(S.MENU);
          }

        } else if (intent === "deny") {
          setPending({});
          setSelectedSeats([]);
          const data = await fetchSeats();
          push(botMsg("No problem! Pick different seats:", { showSeatGrid: true }));
          setConvState(S.GRID_OPEN);

        } else {
          push(botMsg("Please confirm or cancel.", { quickReplies: ["✅ Confirm", "🔄 Change seat"] }));
        }
        break;
      }

      // ── Cancel: collect ticket ID ─────────────────────────
      case S.AWAIT_TICKET: {
        const tid = entities.ticket_id || text.toUpperCase();
        await doCancel(tid);
        break;
      }

      default:
        push(botMsg("Let me start over!", { quickReplies: ["🔍 Check availability", "🎫 Book a seat"] }));
        setConvState(S.MENU);
    }
  };

  // ── Cancel helper ─────────────────────────────────────────
  const doCancel = async (ticketId) => {
    try {
      const res  = await fetch(`${API_URL}/cancel`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: ticketId }),
      });
      const data = await res.json();
      if (data.success) {
        push(botMsg(
          `✅ Booking **${data.ticket_id}** for seat **${data.seat_id}** cancelled. The seat is now free.`,
          { quickReplies: ["🔍 Check seats", "🎫 Book a seat"] }
        ));
      } else {
        push(botMsg(`⚠️ ${data.error}`, { quickReplies: ["❌ Try another ID"] }));
      }
    } catch {
      push(botMsg("⚠️ Server error. Make sure the backend is running."));
    }
    setConvState(S.MENU);
  };

  // ── Seat toggle ───────────────────────────────────────────
  const toggleSeat = (seat) => {
    setSelectedSeats((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
    );
  };

  const handleFilterChange = async (type) => {
    setFilterType(type);
    await fetchSeats(type);
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      {/* Message list */}
      <div style={{
        flex:          1,
        overflowY:     "auto",
        padding:       "16px 12px 8px",
        display:       "flex",
        flexDirection: "column",
        gap:           14,
      }}>
        {messages.map((msg) => (
          <Message
            key={msg.id}
            msg={msg}
            seats={seats}
            selectedIds={selectedSeats}
            onSeatToggle={toggleSeat}
            onFilterChange={handleFilterChange}
            filterType={filterType}
            onQuickReply={handle}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding:       "10px 12px",
        background:    "var(--bg-shell)",
        borderTop:     "1px solid var(--border)",
        display:       "flex",
        gap:           8,
        flexShrink:    0,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && input.trim() && handle(input)}
          placeholder='Try "book me a window seat" or "cancel TKT-ABC123"…'
          style={{
            flex:         1,
            background:   "var(--bg-chat)",
            border:       "1px solid var(--border-soft)",
            borderRadius: "var(--radius-xl)",
            padding:      "10px 16px",
            color:        "var(--text-primary)",
            fontFamily:   "var(--font-body)",
            fontSize:     13.5,
            outline:      "none",
          }}
        />
        <button
          onClick={() => input.trim() && handle(input)}
          disabled={!input.trim()}
          style={{
            width:        42,
            height:       42,
            borderRadius: "50%",
            background:   input.trim() ? "var(--accent)" : "var(--border)",
            border:       "none",
            color:        input.trim() ? "#000" : "var(--text-muted)",
            cursor:       input.trim() ? "pointer" : "not-allowed",
            fontSize:     16,
            transition:   "all .15s",
          }}
        >
          ➤
        </button>
      </div>
    </>
  );
}
