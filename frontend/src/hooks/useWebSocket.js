// src/hooks/useWebSocket.js
// Connects to the Flask-SocketIO server and listens for seat updates.
import { useEffect, useRef } from "react";

export default function useWebSocket({ onSeatsUpdated, onConnectionChange }) {
  const wsRef = useRef(null);

  useEffect(() => {
    let ws;
    try {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      ws = new WebSocket(
        `${protocol}://localhost:5000/socket.io/?EIO=4&transport=websocket`
      );

      ws.onopen = () => {
        onConnectionChange?.(true);
      };

      ws.onclose = () => {
        onConnectionChange?.(false);
      };

      ws.onmessage = (e) => {
        try {
          // Socket.IO frames look like: "42["seats_updated",{...}]"
          const stripped = e.data.replace(/^\d+/, "");
          const parsed   = JSON.parse(stripped);
          if (Array.isArray(parsed) && parsed[0] === "seats_updated") {
            onSeatsUpdated?.(parsed[1].seats || []);
          }
        } catch {
          // non-JSON ping frames — ignore
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.warn("WebSocket unavailable:", err.message);
    }

    return () => ws?.close();
  }, []);

  return wsRef;
}