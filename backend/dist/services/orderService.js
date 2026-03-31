"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOrderTotal = calculateOrderTotal;
exports.createOrder = createOrder;
const db_1 = __importDefault(require("../db"));
function calculateOrderTotal(cart) {
    return cart.reduce((sum, item) => sum + Number(item.product.price) * Number(item.qty), 0);
}
function createOrder(payload) {
    const total = calculateOrderTotal(payload.cart);
    return db_1.default.order.create({
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
