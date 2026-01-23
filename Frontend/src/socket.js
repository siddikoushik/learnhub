import { io } from "socket.io-client";
import config from "./config";

// 🔥 IMPORTANT: connect to SAME port as backend
const socket = io(config.API_BASE_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

export default socket;
