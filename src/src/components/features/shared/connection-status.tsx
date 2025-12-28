"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import socketService from "@/lib/services/socket";

type ConnectionState = "connected" | "disconnected" | "reconnecting";

/**
 * Component hiển thị trạng thái kết nối Socket.IO
 * Hiển thị "Đang kết nối lại..." khi server restart
 */
export function ConnectionStatus() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connected");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const socket = socketService;

    // Lắng nghe sự kiện kết nối
    socket.on("connect", "connection-status", () => {
      setConnectionState("connected");
      // Ẩn sau 2 giây khi kết nối lại thành công
      setTimeout(() => setIsVisible(false), 2000);
    });

    socket.on("disconnect", "connection-status", () => {
      setConnectionState("disconnected");
      setIsVisible(true);
    });

    socket.on("reconnecting", "connection-status", () => {
      setConnectionState("reconnecting");
      setIsVisible(true);
    });

    socket.on("reconnect_attempt", "connection-status", () => {
      setConnectionState("reconnecting");
      setIsVisible(true);
    });

    return () => {
      socket.off("connect", "connection-status");
      socket.off("disconnect", "connection-status");
      socket.off("reconnecting", "connection-status");
      socket.off("reconnect_attempt", "connection-status");
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        connectionState === "connected"
          ? "bg-green-500 text-white"
          : connectionState === "reconnecting"
          ? "bg-yellow-500 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      {connectionState === "connected" && (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Đã kết nối</span>
        </>
      )}
      {connectionState === "reconnecting" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Đang kết nối lại...</span>
        </>
      )}
      {connectionState === "disconnected" && (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Mất kết nối</span>
        </>
      )}
    </div>
  );
}
