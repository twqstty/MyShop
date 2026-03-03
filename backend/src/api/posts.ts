import express, { Request, Response } from "express";
import prisma from "../db";
import { authRequired, AuthRequest } from "../middleware/auth";

interface CreatePostBody {
  title?: string;
  content?: string | null;
}

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { id: "desc" },
      include: { author: { select: { id: true, username: true, email: true } } },
    });
    return res.status(200).json({ posts });
  } catch {
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, username: true, email: true } } },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.status(200).json({ post });
  } catch {
    return res.status(500).json({ error: "Failed to fetch post" });
  }
});

router.post("/", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = (req.body || {}) as CreatePostBody;
    if (!title) return res.status(400).json({ error: "title is required" });

    const post = await prisma.post.create({
      data: { title, content: content ?? null, authorId: req.user!.id },
    });
    return res.status(201).json({ post });
  } catch {
    return res.status(500).json({ error: "Failed to create post" });
  }
});

router.put("/:id", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });

    const { title, content } = (req.body || {}) as CreatePostBody;
    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
      },
    });

    return res.status(200).json({ post: updated });
  } catch {
    return res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/:id", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });

    await prisma.post.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
