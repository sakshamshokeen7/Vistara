// src/utils/useNotificationSocket.ts
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

export const useNotificationSocket = (
  onMessage: (data: any) => void
) => {
  const socketRef = useRef<WebSocket | null>(null);
  const token = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/notifications/?token=${token}`
    );

    ws.onopen = () => console.log("🔔 Notification WS connected");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.onerror = (err) => console.error("WS error", err);

    ws.onclose = () => console.log("🔕 WS closed");

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [token]);
};
