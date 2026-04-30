import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { verifyAuthToken } from "./middleware/auth";

export type SocketUser = {
  id: number;
  email: string;
  username: string;
  role: string;
};

export type SupportRealtimeMessage = {
  id: number;
  chatId: number;
  senderId: number;
  text: string;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
};

type SupportChatSummary = {
  id: number;
  userId: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
};

let io: Server | null = null;

function chatRoom(chatId: number) {
  return `chat:${chatId}`;
}

function userRoom(userId: number) {
  return `user:${userId}`;
}

export function initSocketServer(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        typeof socket.handshake.auth?.token === "string"
          ? socket.handshake.auth.token
          : typeof socket.handshake.headers.authorization === "string" &&
              socket.handshake.headers.authorization.toLowerCase().startsWith("bearer ")
            ? socket.handshake.headers.authorization.slice(7).trim()
            : "";

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const payload = verifyAuthToken(token);

      socket.data.user = {
        id: Number(payload.id),
        email: String(payload.email),
        username: String(payload.username),
        role: String(payload.role),
      } satisfies SocketUser;

      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as SocketUser | undefined;

    if (!user) {
      socket.disconnect();
      return;
    }

    socket.join(userRoom(user.id));

    if (user.role === "ADMIN") {
      socket.join("admins");
    }

    socket.on("support:join-chat", (chatId: unknown) => {
      if (typeof chatId !== "number" || !Number.isInteger(chatId)) {
        return;
      }

      socket.join(chatRoom(chatId));
    });

    socket.on("support:leave-chat", (chatId: unknown) => {
      if (typeof chatId !== "number" || !Number.isInteger(chatId)) {
        return;
      }

      socket.leave(chatRoom(chatId));
    });
  });

  return io;
}

export function emitSupportMessage(chatId: number, userId: number, message: SupportRealtimeMessage) {
  if (!io) return;

  io.to(chatRoom(chatId)).emit("support:message", message);
  io.to("admins").emit("support:chat-updated", {
    chatId,
    userId,
    type: "message",
    lastMessageAt: message.createdAt,
  });
}

export function emitSupportChatUpdate(chat: SupportChatSummary) {
  if (!io) return;

  io.to(userRoom(chat.userId)).emit("support:chat-updated", {
    chatId: chat.id,
    userId: chat.userId,
    type: "status",
    status: chat.status,
    lastMessageAt: chat.lastMessageAt,
  });
  io.to("admins").emit("support:chat-updated", {
    chatId: chat.id,
    userId: chat.userId,
    type: "status",
    status: chat.status,
    lastMessageAt: chat.lastMessageAt,
  });
}
