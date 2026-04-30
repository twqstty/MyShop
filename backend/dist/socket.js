"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = initSocketServer;
exports.emitSupportMessage = emitSupportMessage;
exports.emitSupportChatUpdate = emitSupportChatUpdate;
const socket_io_1 = require("socket.io");
const auth_1 = require("./middleware/auth");
let io = null;
function chatRoom(chatId) {
    return `chat:${chatId}`;
}
function userRoom(userId) {
    return `user:${userId}`;
}
function initSocketServer(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });
    io.use((socket, next) => {
        try {
            const token = typeof socket.handshake.auth?.token === "string"
                ? socket.handshake.auth.token
                : typeof socket.handshake.headers.authorization === "string" &&
                    socket.handshake.headers.authorization.toLowerCase().startsWith("bearer ")
                    ? socket.handshake.headers.authorization.slice(7).trim()
                    : "";
            if (!token) {
                return next(new Error("Unauthorized"));
            }
            const payload = (0, auth_1.verifyAuthToken)(token);
            socket.data.user = {
                id: Number(payload.id),
                email: String(payload.email),
                username: String(payload.username),
                role: String(payload.role),
            };
            return next();
        }
        catch {
            return next(new Error("Unauthorized"));
        }
    });
    io.on("connection", (socket) => {
        const user = socket.data.user;
        if (!user) {
            socket.disconnect();
            return;
        }
        socket.join(userRoom(user.id));
        if (user.role === "ADMIN") {
            socket.join("admins");
        }
        socket.on("support:join-chat", (chatId) => {
            if (typeof chatId !== "number" || !Number.isInteger(chatId)) {
                return;
            }
            socket.join(chatRoom(chatId));
        });
        socket.on("support:leave-chat", (chatId) => {
            if (typeof chatId !== "number" || !Number.isInteger(chatId)) {
                return;
            }
            socket.leave(chatRoom(chatId));
        });
    });
    return io;
}
function emitSupportMessage(chatId, userId, message) {
    if (!io)
        return;
    io.to(chatRoom(chatId)).emit("support:message", message);
    io.to("admins").emit("support:chat-updated", {
        chatId,
        userId,
        type: "message",
        lastMessageAt: message.createdAt,
    });
}
function emitSupportChatUpdate(chat) {
    if (!io)
        return;
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
