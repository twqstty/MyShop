import prisma from "../db";

export interface OrderCartItem {
  product: {
    id: number;
    price: number;
  };
  qty: number;
}

export interface CreateOrderPayload {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  comment?: string;
  cart: OrderCartItem[];
}

export function calculateOrderTotal(cart: OrderCartItem[]) {
  return cart.reduce(
    (sum, item) => sum + Number(item.product.price) * Number(item.qty),
    0
  );
}

export function createOrder(payload: CreateOrderPayload) {
  const total = calculateOrderTotal(payload.cart);

  return prisma.order.create({
    data: {
      userId: payload.userId,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      comment: payload.comment,
      total,
      items: {
        create: payload.cart.map((item) => ({
          productId: item.product.id,
          price: Number(item.product.price),
          qty: Number(item.qty),
        })),
      },
    },
    include: {
      items: true,
    },
  });
}
