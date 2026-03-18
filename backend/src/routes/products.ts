import { Router } from "express";
import { authRequired } from "../middleware/auth";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../services/productService";

const router = Router();

router.get("/", authRequired, async (_req, res) => {
  const products = await getProducts();
  res.json({ products });
});

router.get("/:id", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const product = await getProductById(id);

  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ product });
});

router.post("/", authRequired, async (req, res) => {
  try {
    const { name, price, image, desc } = req.body;

    if (!name || price === undefined || !image || !desc) {
      return res.status(400).json({ error: "name, price, image, desc are required" });
    }

    const product = await createProduct({
      name,
      price: Number(price),
      image,
      desc,
    });

    return res.status(201).json({ product });
  } catch (e: any) {
  console.error("CREATE PRODUCT ERROR:", e);
  return res.status(500).json({
    error: "Failed to create product",
    details: e?.message || "Unknown error",
  });
}
});
router.put("/:id", authRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, price, image, desc } = req.body;

    const product = await updateProduct(id, {
      name,
      price: Number(price),
      image,
      desc,
    });

    return res.json({ product });
  } catch (e: any) {
    console.error("UPDATE PRODUCT ERROR:", e);
    return res.status(500).json({
      error: "Failed to update product",
      details: e?.message,
    });
  }
});
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);

    await deleteProduct(id);

    return res.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE PRODUCT ERROR:", e);
    return res.status(500).json({
      error: "Failed to delete product",
      details: e?.message,
    });
  }
});

export default router;
