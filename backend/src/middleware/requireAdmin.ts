import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth";

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access only" });
  }

  return next();
}