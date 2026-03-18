import { Router, Response } from "express";
import { AuthRequest, authRequired, signToken } from "../middleware/auth";
import {
  findUserByEmail,
  findUserByUsername,
  getFullUserById,
  getProfileById,
  updateProfileById,
} from "../services/profileService";

const router = Router();

router.get("/me", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getProfileById(req.user!.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (e) {
    return res.status(500).json({ error: "Failed to load profile" });
  }
});

router.put("/me", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { username, email, password } = req.body;

    const existing = await getFullUserById(userId);

    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    if (username && username !== existing.username) {
      const sameUsername = await findUserByUsername(username, userId);

      if (sameUsername) {
        return res.status(409).json({ error: "Username already taken" });
      }
    }

    if (email && email !== existing.email) {
      const sameEmail = await findUserByEmail(email, userId);

      if (sameEmail) {
        return res.status(409).json({ error: "Email already taken" });
      }
    }

    const updatedUser = await updateProfileById(userId, { username, email, password });

    const token = signToken(updatedUser);

    return res.json({
      user: updatedUser,
      token,
    });
  } catch (e) {
    console.error("UPDATE PROFILE ERROR:", e);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
