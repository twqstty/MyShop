import prisma from "../db";

export interface ProductPayload {
  name: string;
  price: number;
  image: string;
  desc: string;
}

export function getProducts() {
  return prisma.product.findMany({ orderBy: { id: "asc" } });
}

export function getProductById(id: number) {
  return prisma.product.findUnique({ where: { id } });
}

export function createProduct(payload: ProductPayload) {
  return prisma.product.create({ data: payload });
}

export function updateProduct(id: number, payload: ProductPayload) {
  return prisma.product.update({
    where: { id },
    data: payload,
  });
}

export function deleteProduct(id: number) {
  return prisma.product.delete({ where: { id } });
}
