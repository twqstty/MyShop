"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserForRegister = findUserForRegister;
exports.registerUser = registerUser;
exports.findUserForLogin = findUserForLogin;
exports.verifyPassword = verifyPassword;
const db_1 = __importDefault(require("../db"));
const hashPass_1 = require("../utils/hashPass");
function findUserForRegister(email, username) {
    return db_1.default.user.findFirst({
        where: { OR: [{ email }, { username }] },
        select: { id: true },
    });
}
async function registerUser(payload) {
    const hashedPass = await (0, hashPass_1.hashPass)(payload.password);
    return db_1.default.user.create({
        data: {
            username: payload.username,
            email: payload.email,
            password: hashedPass,
        },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createAt: true,
        },
    });
}
function findUserForLogin(payload) {
    return db_1.default.user.findFirst({
        where: payload.email ? { email: payload.email } : { username: payload.username },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            password: true,
            createAt: true,
        },
    });
}
function verifyPassword(password, hash) {
    return (0, hashPass_1.comparePass)(password, hash);
}
