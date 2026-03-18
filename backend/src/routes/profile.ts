import { Router, Response } from "express";
import prisma from "../db";
import { AuthRequest, authRequired, signToken } from "../middleware/auth";
import { hashPass } from "../utils/hashPass";

const router = Router();

router.get("/me", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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
  } catch (e) {
    return res.status(500).json({ error: "Failed to load profile" });
  }
});

router.put("/me", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { username, email, password } = req.body;

    const existing = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    if (username && username !== existing.username) {
      const sameUsername = await prisma.user.findFirst({
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
      const sameEmail = await prisma.user.findFirst({
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

    const data: any = {};

    if (username) data.username = username;
    if (email) data.email = email;
    if (password && password.trim()) {
      data.password = await hashPass(password);
    }

    const updatedUser = await prisma.user.update({
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