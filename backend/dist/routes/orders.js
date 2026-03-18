"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/", auth_1.authRequired, async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, email, phone, address, comment, cart } = req.body;
        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }
        const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
        const order = await db_1.default.order.create({
            data: {
                userId,
                fullName,
                email,
                phone,
                address,
                comment,
                total,
                items: {
                    create: cart.map((item) => ({
                        productId: item.product.id,
                        price: item.product.price,
                        qty: item.qty,
                    })),
                },
            },
            include: {
                items: true,
            },
        });
        return res.json({ order });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to create order" });
    }
});
exports.default = router;
