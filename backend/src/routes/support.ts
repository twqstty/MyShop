import { Response, Router } from "express";
import prisma from "../db";
import { AuthRequest, authRequired } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import { emitSupportChatUpdate, emitSupportMessage } from "../socket";

const router = Router();

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function getOrCreateOpenChat(userId: number) {
  const existingChat = await prisma.supportChat.findFirst({
    where: { userId, status: "OPEN" },
    orderBy: { lastMessageAt: "desc" },
  });

  if (existingChat) {
    return existingChat;
  }

  return prisma.supportChat.create({
    data: { userId },
  });
}

async function markIncomingAsRead(chatId: number, userId: number) {
  await prisma.supportMessage.updateMany({
    where: {
      chatId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });
}

router.get("/chat", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const chat = await getOrCreateOpenChat(req.user!.id);

    return res.json({ chat });
  } catch (e) {
    console.error("SUPPORT CHAT LOAD ERROR:", e);
    return res.status(500).json({ error: "Failed to load support chat" });
  }
});

router.get("/chat/messages", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const chat = await getOrCreateOpenChat(req.user!.id);
    await markIncomingAsRead(chat.id, req.user!.id);

    const messages = await prisma.supportMessage.findMany({
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
  } catch (e) {
    console.error("SUPPORT MESSAGES LOAD ERROR:", e);
    return res.status(500).json({ error: "Failed to load messages" });
  }
});

router.post("/chat/messages", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const text = normalizeText(req.body?.text);

    if (!text) {
      return res.status(400).json({ error: "Message text is required" });
    }

    const chat = await getOrCreateOpenChat(req.user!.id);
    const now = new Date();

    const message = await prisma.$transaction(async (tx) => {
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
          senderId: req.user!.id,
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

    emitSupportMessage(chat.id, req.user!.id, message);

    return res.status(201).json({ message });
  } catch (e) {
    console.error("SUPPORT MESSAGE CREATE ERROR:", e);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

router.get("/admin/chats", authRequired, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const chats = await prisma.supportChat.findMany({
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
  } catch (e) {
    console.error("ADMIN SUPPORT CHATS LOAD ERROR:", e);
    return res.status(500).json({ error: "Failed to load support chats" });
  }
});

router.get(
  "/admin/chats/:chatId/messages",
  authRequired,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const chatId = Number(req.params.chatId);

      if (!Number.isInteger(chatId)) {
        return res.status(400).json({ error: "Invalid chat id" });
      }

      const chat = await prisma.supportChat.findUnique({
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

      await markIncomingAsRead(chat.id, req.user!.id);

      const messages = await prisma.supportMessage.findMany({
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
    } catch (e) {
      console.error("ADMIN SUPPORT MESSAGES LOAD ERROR:", e);
      return res.status(500).json({ error: "Failed to load chat messages" });
    }
  },
);

router.post(
  "/admin/chats/:chatId/messages",
  authRequired,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const chatId = Number(req.params.chatId);
      const text = normalizeText(req.body?.text);

      if (!Number.isInteger(chatId)) {
        return res.status(400).json({ error: "Invalid chat id" });
      }

      if (!text) {
        return res.status(400).json({ error: "Message text is required" });
      }

      const chat = await prisma.supportChat.findUnique({
        where: { id: chatId },
      });

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      const now = new Date();

      const message = await prisma.$transaction(async (tx) => {
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
            senderId: req.user!.id,
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

      emitSupportMessage(chatId, chat.userId, message);

      return res.status(201).json({ message });
    } catch (e) {
      console.error("ADMIN SUPPORT MESSAGE CREATE ERROR:", e);
      return res.status(500).json({ error: "Failed to send admin message" });
    }
  },
);

router.patch(
  "/admin/chats/:chatId",
  authRequired,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const chatId = Number(req.params.chatId);
      const status = req.body?.status === "CLOSED" ? "CLOSED" : "OPEN";

      if (!Number.isInteger(chatId)) {
        return res.status(400).json({ error: "Invalid chat id" });
      }

      const chat = await prisma.supportChat.update({
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

      emitSupportChatUpdate(chat);

      return res.json({ chat });
    } catch (e) {
      console.error("SUPPORT CHAT UPDATE ERROR:", e);
      return res.status(500).json({ error: "Failed to update chat" });
    }
  },
);

export default router;
