"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPass = hashPass;
exports.comparePass = comparePass;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function hashPass(password) {
    const saltRounds = 10;
    return await bcrypt_1.default.hash(password, saltRounds);
}
async function comparePass(password, hashedPassword) {
    return await bcrypt_1.default.compare(password, hashedPassword);
}
