"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const hashPass_1 = require("../utils/hashPass");
const router = (0, express_1.Router)();
router.get("/me", auth_1.authRequired, async (req, res) => {
    try {
        const user = await db_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json({ user });
    }
    catch (e) {
        return res.status(500).json({ error: "Failed to load profile" });
    }
});
router.put("/me", auth_1.authRequired, async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email, password } = req.body;
        const existing = await db_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!existing) {
            return res.status(404).json({ error: "User not found" });
        }
        if (username && username !== existing.username) {
            const sameUsername = await db_1.default.user.findFirst({
                where: {
                    username,
                    NOT: { id: userId },
                },
                select: { id: true },
            });
            if (sameUsername) {
                return res.status(409).json({ error: "Username already taken" });
            }
        }
        if (email && email !== existing.email) {
            const sameEmail = await db_1.default.user.findFirst({
                where: {
                    email,
                    NOT: { id: userId },
                },
                select: { id: true },
            });
            if (sameEmail) {
                return res.status(409).json({ error: "Email already taken" });
            }
        }
        const data = {};
        if (username)
            data.username = username;
        if (email)
            data.email = email;
        if (password && password.trim()) {
            data.password = await (0, hashPass_1.hashPass)(password);
        }
        const updatedUser = await db_1.default.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createAt: true,
            },
        });
        const token = (0, auth_1.signToken)(updatedUser);
        return res.json({
            user: updatedUser,
            token,
        });
    }
    catch (e) {
        console.error("UPDATE PROFILE ERROR:", e);
        return res.status(500).json({ error: "Failed to update profile" });
    }
});
exports.default = router;
