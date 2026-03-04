import { Router } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  res.json({ products });
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ product });
});

export default router;