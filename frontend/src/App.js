// src/App.js  —  Root component, handles page routing
import { useState } from "react";
import ChatPage   from "./pages/ChatPage";
import AdminPage  from "./pages/AdminPage";
import BookingsPage from "./pages/BookingsPage";
import Header     from "./components/Header";
import BoardingPass from "./components/BoardingPass";

export default function App() {
  const [page,        setPage]        = useState("chat");
  const [boardingPass, setBoardingPass] = useState(null); // { bookings, name }
  const [connected,   setConnected]   = useState(false);

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      height:        "100dvh",
      maxWidth:      780,
      margin:        "0 auto",
      background:    "var(--bg-chat)",
      borderLeft:    "1px solid var(--border)",
      borderRight:   "1px solid var(--border)",
    }}>
      <Header
        page={page}
        onNavigate={setPage}
        connected={connected}
      />

      {page === "chat" && (
        <ChatPage
          onShowBoardingPass={setBoardingPass}
          onConnectionChange={setConnected}
        />
      )}
      {page === "admin"    && <AdminPage    onBack={() => setPage("chat")} />}
      {page === "bookings" && <BookingsPage onBack={() => setPage("chat")} />}

      {boardingPass && (
        <BoardingPass
          bookings={boardingPass.bookings}
          passengerName={boardingPass.name}
          onClose={() => setBoardingPass(null)}
        />
      )}
    </div>
  );
}
