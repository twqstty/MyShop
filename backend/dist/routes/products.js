"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const productService_1 = require("../services/productService");
const router = (0, express_1.Router)();
router.get("/", auth_1.authRequired, async (_req, res) => {
    const products = await (0, productService_1.getProducts)();
    res.json({ products });
});
router.get("/:id", auth_1.authRequired, async (req, res) => {
    const id = Number(req.params.id);
    const product = await (0, productService_1.getProductById)(id);
    if (!product)
        return res.status(404).json({ error: "Product not found" });
    res.json({ product });
});
router.post("/", auth_1.authRequired, async (req, res) => {
    try {
        const { name, price, image, desc } = req.body;
        if (!name || price === undefined || !image || !desc) {
            return res.status(400).json({ error: "name, price, image, desc are required" });
        }
        const product = await (0, productService_1.createProduct)({
            name,
            price: Number(price),
            image,
            desc,
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
router.put("/:id", auth_1.authRequired, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, price, image, desc } = req.body;
        const product = await (0, productService_1.updateProduct)(id, {
            name,
            price: Number(price),
            image,
            desc,
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
router.delete("/:id", auth_1.authRequired, async (req, res) => {
    try {
        const id = Number(req.params.id);
        await (0, productService_1.deleteProduct)(id);
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
