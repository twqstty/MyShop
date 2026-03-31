"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const authService_1 = require("../services/authService");
const router = express_1.default.Router();
/**
 * POST /api/auth/register
 * body: { username, email, password }
 */
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "username, email and password are required" });
        }
        const exists = await (0, authService_1.findUserForRegister)(email, username);
        if (exists)
            return res.status(409).json({ error: "User already exists" });
        const user = await (0, authService_1.registerUser)({ username, email, password });
        const token = (0, auth_1.signToken)(user);
        return res.status(201).json({ user, token });
    }
    catch (e) {
        return res.status(500).json({ error: "Register failed" });
    }
});
/**
 * POST /api/auth/login
 * body: { email or username, password }
 */
router.post("/login", async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!password || (!email && !username)) {
            return res.status(400).json({ error: "email/username and password are required" });
        }
        const user = await (0, authService_1.findUserForLogin)({ email, username, password });
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });
        const ok = await (0, authService_1.verifyPassword)(password, user.password);
        if (!ok)
            return res.status(401).json({ error: "Invalid credentials" });
        const safeUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createAt: user.createAt,
        };
        const token = (0, auth_1.signToken)(safeUser);
        return res.status(200).json({ user: safeUser, token });
    }
    catch (e) {
        return res.status(500).json({ error: "Login failed" });
    }
});
/**
 * POST /api/auth/logout
 * If you store token on client side (localStorage), just delete it there.
 * This endpoint exists to match assignment requirements.
 */
router.post("/logout", async (_req, res) => {
    return res.status(200).json({ ok: true });
});
exports.default = router;
