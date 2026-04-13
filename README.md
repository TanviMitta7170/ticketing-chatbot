# 🎫 Online Chatbot Ticketing System — v2
**Team 34 · Vardhaman College of Engineering**
Malkaraj Shrujana · Mavuru Renusri · Mitta Tanvi
Guide: Ms. B. Pravalika

---

## Folder Structure

```
ticketing-final/
│
├── backend/
│   ├── app.py                  ← Flask entry point
│   ├── requirements.txt        ← Python dependencies
│   ├── render.yaml             ← Render.com deployment config
│   │
│   ├── models/
│   │   ├── seat.py             ← Seat database model (SQLAlchemy)
│   │   └── booking.py          ← Booking database model
│   │
│   ├── routes/
│   │   ├── seats.py            ← GET /status, GET /status/<id>
│   │   ├── bookings.py         ← POST /book, POST /cancel, GET /bookings
│   │   ├── admin.py            ← GET /admin/stats, POST /admin/reset
│   │   ├── chat.py             ← POST /chat/parse  (NLP intent parser)
│   │   └── websocket.py        ← Socket.IO connect/disconnect handlers
│   │
│   └── utils/
│       ├── helpers.py          ← generate_ticket_id(), broadcast_seats()
│       └── seeder.py           ← Seeds 20 seats on first run
│
└── frontend/
    ├── package.json
    ├── vercel.json             ← Vercel deployment config
    │
    ├── public/
    │   └── index.html
    │
    └── src/
        ├── index.js            ← React entry point
        ├── index.css           ← Global CSS variables + animations
        ├── App.js              ← Root component, page routing
        ├── config.js           ← API_URL + constants
        │
        ├── hooks/
        │   ├── useSeats.js     ← Fetches seat data from API
        │   ├── useWebSocket.js ← Real-time Socket.IO connection
        │   └── useNLP.js       ← Claude API intent parser (+ fallback)
        │
        ├── components/
        │   ├── Header.js       ← Top nav bar with page buttons
        │   ├── Message.js      ← Single chat bubble (bot or user)
        │   ├── FormattedText.js← Renders **bold** and `code` in messages
        │   ├── QuickReplies.js ← Row of tappable chip buttons
        │   ├── SeatGrid.js     ← Interactive seat map with type filters
        │   ├── TypingIndicator.js ← Animated "bot is typing" dots
        │   └── BoardingPass.js ← Animated ticket overlay with QR code
        │
        └── pages/
            ├── ChatPage.js     ← Chat engine + conversation state machine
            ├── AdminPage.js    ← KPI dashboard, charts, recent bookings
            └── BookingsPage.js ← Email-based booking lookup
```

---

## Local Setup

### Backend

```bash
cd ticketing-final/backend

python -m venv venv
source venv/bin/activate      # Mac / Linux
venv\Scripts\activate         # Windows

pip install -r requirements.txt
python app.py
```
Runs at **http://localhost:5000**. SQLite DB is auto-created on first run.

### Frontend

```bash
cd ticketing-final/frontend
npm install
npm start
```
Runs at **http://localhost:3000**

> Make sure the backend is running before starting the frontend.

---

## API Endpoints

| Method | Endpoint           | Description                          |
|--------|--------------------|--------------------------------------|
| GET    | `/status`          | All seats (optional `?type=window`)  |
| GET    | `/status/<id>`     | Single seat by ID                    |
| POST   | `/book`            | Book one or multiple seats           |
| POST   | `/cancel`          | Cancel by Ticket ID                  |
| GET    | `/bookings`        | All bookings (optional `?email=...`) |
| POST   | `/chat/parse`      | NLP intent parser                    |
| GET    | `/admin/stats`     | Dashboard statistics                 |
| POST   | `/admin/reset`     | Reset all data (dev only)            |

---

## Production Deployment

| Service  | What it hosts    | Free tier |
|----------|-----------------|-----------|
| Supabase | PostgreSQL DB    | ✅ Yes    |
| Render   | Flask backend    | ✅ Yes    |
| Vercel   | React frontend   | ✅ Yes    |

1. Create a Supabase project → copy the connection string
2. Push `backend/` to GitHub → import on Render → set `DATABASE_URL`
3. Push `frontend/` to GitHub → import on Vercel → set `REACT_APP_API_URL`
