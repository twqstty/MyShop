import express, { Request, Response } from "express";
import prisma from "../db";
import { comparePass, hashPass } from "../utils/hashPass";
import { signToken } from "../middleware/auth";

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  username?: string;
  password?: string;
}

const router = express.Router();

/**
 * POST /api/auth/register
 * body: { username, email, password }
 */
router.post(
  "/register",
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: "username, email and password are required" });
      }

      const exists = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
        select: { id: true },
      });
      if (exists) return res.status(409).json({ error: "User already exists" });

      const hashedPass = await hashPass(password);

      const user = await prisma.user.create({
        data: { username, email, password: hashedPass },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createAt: true,
        },
      });

      const token = signToken(user);
      return res.status(201).json({ user, token });
    } catch (e) {
      return res.status(500).json({ error: "Register failed" });
    }
  },
);

/**
 * POST /api/auth/login
 * body: { email or username, password }
 */
router.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!password || (!email && !username)) {
      return res.status(400).json({ error: "email/username and password are required" });
    }

    const user = await prisma.user.findFirst({
      where: email ? { email } : { username: username! },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        password: true,
        createAt: true,
      },
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await comparePass(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createAt: user.createAt,
    };

    const token = signToken(safeUser);

    return res.status(200).json({ user: safeUser, token });
  } catch (e) {
    return res.status(500).json({ error: "Login failed" });
  }
});

/**
 * POST /api/auth/logout
 * If you store token on client side (localStorage), just delete it there.
 * This endpoint exists to match assignment requirements.
 */
router.post("/logout", async (_req: Request, res: Response) => {
  return res.status(200).json({ ok: true });
});

export default router;