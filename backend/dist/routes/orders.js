"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const orderService_1 = require("../services/orderService");
const router = (0, express_1.Router)();
router.post("/", auth_1.authRequired, async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, email, phone, address, comment, cart } = req.body;
        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }
        const order = await (0, orderService_1.createOrder)({
            userId,
            fullName,
            email,
            phone,
            address,
            comment,
            cart,
        });
        return res.json({ order });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to create order" });
    }
});
exports.default = router;
