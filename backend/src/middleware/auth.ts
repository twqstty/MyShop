import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthRequest = Request & {
  user?: { id: number; email: string; username: string; role: string };
};

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function verifyAuthToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as any;
}

export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({ error: "Missing Authorization Bearer token" });
    }
    const token = header.slice(7).trim();
    const payload = verifyAuthToken(token);

    if (!payload?.id) return res.status(401).json({ error: "Invalid token" });

    req.user = {
      id: Number(payload.id),
      email: String(payload.email),
      username: String(payload.username),
      role: String(payload.role),
    };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function signToken(user: { id: number; email: string; username: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
