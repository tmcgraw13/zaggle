import { io, Socket } from "socket.io-client";
import serverUrl from "./config";

let socket: Socket | null = null;

// Create a proxy that lazily initializes the socket on first access
const socketProxy = new Proxy({} as Socket, {
  get(_, prop) {
    // Only initialize on client side
    if (typeof window !== "undefined" && !socket) {
      console.log("[socket] Connecting to:", serverUrl);
      socket = io(serverUrl, {
        extraHeaders: {
          "ngrok-skip-browser-warning": "true",
        },
        transports: ["polling", "websocket"],
      });

      socket.on("connect", () => {
        console.log("[socket] Connected successfully");
      });

      socket.on("connect_error", (error) => {
        console.error("[socket] Connection error:", error.message);
      });
    }

    if (socket) {
      const value = (socket as any)[prop];
      // Bind methods to the socket instance
      if (typeof value === "function") {
        return value.bind(socket);
      }
      return value;
    }

    // Return no-op for SSR
    if (typeof prop === "string" && ["on", "off", "emit", "connect", "disconnect"].includes(prop)) {
      return () => {};
    }
    return undefined;
  },
});

export default socketProxy;
