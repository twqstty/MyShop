"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
const db_1 = __importDefault(require("../db"));
function getProducts() {
    return db_1.default.product.findMany({ orderBy: { id: "asc" } });
}
function getProductById(id) {
    return db_1.default.product.findUnique({ where: { id } });
}
function createProduct(payload) {
    return db_1.default.product.create({ data: payload });
}
function updateProduct(id, payload) {
    return db_1.default.product.update({
        where: { id },
        data: payload,
    });
}
function deleteProduct(id) {
    return db_1.default.product.delete({ where: { id } });
}
