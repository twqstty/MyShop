import { Router, Response } from "express";
import prisma from "../db";
import { AuthRequest, authRequired } from "../middleware/auth";

const router = Router();

router.post("/", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const { fullName, email, phone, address, comment, cart } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const total = cart.reduce(
      (sum: number, item: any) => sum + item.product.price * item.qty,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId,
        fullName,
        email,
        phone,
        address,
        comment,
        total,
        items: {
          create: cart.map((item: any) => ({
            productId: item.product.id,
            price: item.product.price,
            qty: item.qty,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return res.json({ order });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

export default router;