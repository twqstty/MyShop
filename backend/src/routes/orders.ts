import { Router, Response } from "express";
import { AuthRequest, authRequired } from "../middleware/auth";
import { createOrder } from "../services/orderService";

const router = Router();

router.post("/", authRequired, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const { fullName, email, phone, address, comment, cart } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const order = await createOrder({
      userId,
      fullName,
      email,
      phone,
      address,
      comment,
      cart,
    });

    return res.json({ order });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

export default router;
