"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Admin access only" });
    }
    return next();
}
