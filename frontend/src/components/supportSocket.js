import { io } from "socket.io-client";
import { getToken } from "./api";

const SOCKET_URL = "http://localhost:3000";
let socket;

export function getSupportSocket() {
  const token = getToken();

  if (!token) {
    return null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
    });
  }

  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}
