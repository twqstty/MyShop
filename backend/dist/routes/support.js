"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const requireAdmin_1 = require("../middleware/requireAdmin");
const socket_1 = require("../socket");
const router = (0, express_1.Router)();
function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}
async function getOrCreateOpenChat(userId) {
    const existingChat = await db_1.default.supportChat.findFirst({
        where: { userId, status: "OPEN" },
        orderBy: { lastMessageAt: "desc" },
    });
    if (existingChat) {
        return existingChat;
    }
    return db_1.default.supportChat.create({
        data: { userId },
    });
}
async function markIncomingAsRead(chatId, userId) {
    await db_1.default.supportMessage.updateMany({
        where: {
            chatId,
            senderId: { not: userId },
            isRead: false,
        },
        data: { isRead: true },
    });
}
router.get("/chat", auth_1.authRequired, async (req, res) => {
    try {
        const chat = await getOrCreateOpenChat(req.user.id);
        return res.json({ chat });
    }
    catch (e) {
        console.error("SUPPORT CHAT LOAD ERROR:", e);
        return res.status(500).json({ error: "Failed to load support chat" });
    }
});
router.get("/chat/messages", auth_1.authRequired, async (req, res) => {
    try {
        const chat = await getOrCreateOpenChat(req.user.id);
        await markIncomingAsRead(chat.id, req.user.id);
        const messages = await db_1.default.supportMessage.findMany({
            where: { chatId: chat.id },
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        return res.json({ chat, messages });
    }
    catch (e) {
        console.error("SUPPORT MESSAGES LOAD ERROR:", e);
        return res.status(500).json({ error: "Failed to load messages" });
    }
});
router.post("/chat/messages", auth_1.authRequired, async (req, res) => {
    try {
        const text = normalizeText(req.body?.text);
        if (!text) {
            return res.status(400).json({ error: "Message text is required" });
        }
        const chat = await getOrCreateOpenChat(req.user.id);
        const now = new Date();
        const message = await db_1.default.$transaction(async (tx) => {
            await tx.supportChat.update({
                where: { id: chat.id },
                data: {
                    status: "OPEN",
                    lastMessageAt: now,
                },
            });
            return tx.supportMessage.create({
                data: {
                    chatId: chat.id,
                    senderId: req.user.id,
                    text,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });
        });
        (0, socket_1.emitSupportMessage)(chat.id, req.user.id, message);
        return res.status(201).json({ message });
    }
    catch (e) {
        console.error("SUPPORT MESSAGE CREATE ERROR:", e);
        return res.status(500).json({ error: "Failed to send message" });
    }
});
router.get("/admin/chats", auth_1.authRequired, requireAdmin_1.requireAdmin, async (_req, res) => {
    try {
        const chats = await db_1.default.supportChat.findMany({
            orderBy: { lastMessageAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
        });
        return res.json({ chats });
    }
    catch (e) {
        console.error("ADMIN SUPPORT CHATS LOAD ERROR:", e);
        return res.status(500).json({ error: "Failed to load support chats" });
    }
});
router.get("/admin/chats/:chatId/messages", auth_1.authRequired, requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const chatId = Number(req.params.chatId);
        if (!Number.isInteger(chatId)) {
            return res.status(400).json({ error: "Invalid chat id" });
        }
        const chat = await db_1.default.supportChat.findUnique({
            where: { id: chatId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        await markIncomingAsRead(chat.id, req.user.id);
        const messages = await db_1.default.supportMessage.findMany({
            where: { chatId: chat.id },
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        return res.json({ chat, messages });
    }
    catch (e) {
        console.error("ADMIN SUPPORT MESSAGES LOAD ERROR:", e);
        return res.status(500).json({ error: "Failed to load chat messages" });
    }
});
router.post("/admin/chats/:chatId/messages", auth_1.authRequired, requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const chatId = Number(req.params.chatId);
        const text = normalizeText(req.body?.text);
        if (!Number.isInteger(chatId)) {
            return res.status(400).json({ error: "Invalid chat id" });
        }
        if (!text) {
            return res.status(400).json({ error: "Message text is required" });
        }
        const chat = await db_1.default.supportChat.findUnique({
            where: { id: chatId },
        });
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        const now = new Date();
        const message = await db_1.default.$transaction(async (tx) => {
            await tx.supportChat.update({
                where: { id: chatId },
                data: {
                    status: "OPEN",
                    lastMessageAt: now,
                },
            });
            return tx.supportMessage.create({
                data: {
                    chatId,
                    senderId: req.user.id,
                    text,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });
        });
        (0, socket_1.emitSupportMessage)(chatId, chat.userId, message);
        return res.status(201).json({ message });
    }
    catch (e) {
        console.error("ADMIN SUPPORT MESSAGE CREATE ERROR:", e);
        return res.status(500).json({ error: "Failed to send admin message" });
    }
});
router.patch("/admin/chats/:chatId", auth_1.authRequired, requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const chatId = Number(req.params.chatId);
        const status = req.body?.status === "CLOSED" ? "CLOSED" : "OPEN";
        if (!Number.isInteger(chatId)) {
            return res.status(400).json({ error: "Invalid chat id" });
        }
        const chat = await db_1.default.supportChat.update({
            where: { id: chatId },
            data: { status },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
        (0, socket_1.emitSupportChatUpdate)(chat);
        return res.json({ chat });
    }
    catch (e) {
        console.error("SUPPORT CHAT UPDATE ERROR:", e);
        return res.status(500).json({ error: "Failed to update chat" });
    }
});
exports.default = router;
