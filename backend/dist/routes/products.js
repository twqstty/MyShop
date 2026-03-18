"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../generated/prisma");
const auth_1 = require("../middleware/auth");
const requireAdmin_1 = require("../middleware/requireAdmin");
const prisma = new prisma_1.PrismaClient();
const router = (0, express_1.Router)();
router.get("/", async (_req, res) => {
    const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
    res.json({ products });
});
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product)
        return res.status(404).json({ error: "Product not found" });
    res.json({ product });
});
router.post("/", auth_1.authRequired, requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const { name, price, image, desc } = req.body;
        if (!name || price === undefined || !image || !desc) {
            return res.status(400).json({ error: "name, price, image, desc are required" });
        }
        const product = await prisma.product.create({
            data: {
                name,
                price: Number(price),
                image,
                desc,
            },
        });
        return res.status(201).json({ product });
    }
    catch (e) {
        console.error("CREATE PRODUCT ERROR:", e);
        return res.status(500).json({
            error: "Failed to create product",
            details: e?.message || "Unknown error",
        });
    }
});
router.put("/:id", auth_1.authRequired, requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, price, image, desc } = req.body;
        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                price: Number(price),
                image,
                desc,
            },
        });
        return res.json({ product });
    }
    catch (e) {
        console.error("UPDATE PRODUCT ERROR:", e);
        return res.status(500).json({
            error: "Failed to update product",
            details: e?.message,
        });
    }
});
router.delete("/:id", auth_1.authRequired, requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.product.delete({
            where: { id },
        });
        return res.json({ ok: true });
    }
    catch (e) {
        console.error("DELETE PRODUCT ERROR:", e);
        return res.status(500).json({
            error: "Failed to delete product",
            details: e?.message,
        });
    }
});
exports.default = router;
