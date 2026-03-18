import express, { Request, Response } from "express";
import { authRequired, AuthRequest } from "../middleware/auth";
import {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  PostPayload,
  updatePost,
} from "../services/postService";

const router = express.Router();

router.get("/", authRequired, async (_req: Request, res: Response) => {
  try {
    const posts = await getPosts();
    return res.status(200).json({ posts });
  } catch {
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.get("/:id", authRequired, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const post = await getPostById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.status(200).json({ post });
  } catch {
    return res.status(500).json({ error: "Failed to fetch post" });
  }
});

router.post("/", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = (req.body || {}) as PostPayload;
    if (!title) return res.status(400).json({ error: "title is required" });

    const post = await createPost(req.user!.id, { title, content });
    return res.status(201).json({ post });
  } catch {
    return res.status(500).json({ error: "Failed to create post" });
  }
});

router.put("/:id", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const post = await getPostById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });

    const { title, content } = (req.body || {}) as PostPayload;
    const updated = await updatePost(id, { title, content });

    return res.status(200).json({ post: updated });
  } catch {
    return res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/:id", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const post = await getPostById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });

    await deletePost(id);
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
