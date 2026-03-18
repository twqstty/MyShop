"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/", async (_req, res) => {
    try {
        const posts = await db_1.default.post.findMany({
            orderBy: { id: "desc" },
            include: { author: { select: { id: true, username: true, email: true } } },
        });
        return res.status(200).json({ posts });
    }
    catch {
        return res.status(500).json({ error: "Failed to fetch posts" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            return res.status(400).json({ error: "Invalid id" });
        const post = await db_1.default.post.findUnique({
            where: { id },
            include: { author: { select: { id: true, username: true, email: true } } },
        });
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        return res.status(200).json({ post });
    }
    catch {
        return res.status(500).json({ error: "Failed to fetch post" });
    }
});
router.post("/", auth_1.authRequired, async (req, res) => {
    try {
        const { title, content } = (req.body || {});
        if (!title)
            return res.status(400).json({ error: "title is required" });
        const post = await db_1.default.post.create({
            data: { title, content: content ?? null, authorId: req.user.id },
        });
        return res.status(201).json({ post });
    }
    catch {
        return res.status(500).json({ error: "Failed to create post" });
    }
});
router.put("/:id", auth_1.authRequired, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            return res.status(400).json({ error: "Invalid id" });
        const post = await db_1.default.post.findUnique({ where: { id } });
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        if (post.authorId !== req.user.id)
            return res.status(403).json({ error: "Forbidden" });
        const { title, content } = (req.body || {});
        const updated = await db_1.default.post.update({
            where: { id },
            data: {
                ...(title !== undefined ? { title } : {}),
                ...(content !== undefined ? { content } : {}),
            },
        });
        return res.status(200).json({ post: updated });
    }
    catch {
        return res.status(500).json({ error: "Failed to update post" });
    }
});
router.delete("/:id", auth_1.authRequired, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            return res.status(400).json({ error: "Invalid id" });
        const post = await db_1.default.post.findUnique({ where: { id } });
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        if (post.authorId !== req.user.id)
            return res.status(403).json({ error: "Forbidden" });
        await db_1.default.post.delete({ where: { id } });
        return res.status(200).json({ ok: true });
    }
    catch {
        return res.status(500).json({ error: "Failed to delete post" });
    }
});
exports.default = router;
