"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const profileService_1 = require("../services/profileService");
const router = (0, express_1.Router)();
router.get("/me", auth_1.authRequired, async (req, res) => {
    try {
        const user = await (0, profileService_1.getProfileById)(req.user.id);
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
        const existing = await (0, profileService_1.getFullUserById)(userId);
        if (!existing) {
            return res.status(404).json({ error: "User not found" });
        }
        if (username && username !== existing.username) {
            const sameUsername = await (0, profileService_1.findUserByUsername)(username, userId);
            if (sameUsername) {
                return res.status(409).json({ error: "Username already taken" });
            }
        }
        if (email && email !== existing.email) {
            const sameEmail = await (0, profileService_1.findUserByEmail)(email, userId);
            if (sameEmail) {
                return res.status(409).json({ error: "Email already taken" });
            }
        }
        const updatedUser = await (0, profileService_1.updateProfileById)(userId, { username, email, password });
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
