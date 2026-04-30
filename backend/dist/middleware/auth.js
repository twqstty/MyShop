"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuthToken = verifyAuthToken;
exports.authRequired = authRequired;
exports.signToken = signToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
function verifyAuthToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
function authRequired(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.toLowerCase().startsWith("bearer ")) {
            return res.status(401).json({ error: "Missing Authorization Bearer token" });
        }
        const token = header.slice(7).trim();
        const payload = verifyAuthToken(token);
        if (!payload?.id)
            return res.status(401).json({ error: "Invalid token" });
        req.user = {
            id: Number(payload.id),
            email: String(payload.email),
            username: String(payload.username),
            role: String(payload.role),
        };
        return next();
    }
    catch {
        return res.status(401).json({ error: "Unauthorized" });
    }
}
function signToken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}
