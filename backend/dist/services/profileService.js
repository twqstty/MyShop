"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileById = getProfileById;
exports.getFullUserById = getFullUserById;
exports.findUserByUsername = findUserByUsername;
exports.findUserByEmail = findUserByEmail;
exports.updateProfileById = updateProfileById;
const db_1 = __importDefault(require("../db"));
const hashPass_1 = require("../utils/hashPass");
function getProfileById(userId) {
    return db_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createAt: true,
        },
    });
}
function getFullUserById(userId) {
    return db_1.default.user.findUnique({
        where: { id: userId },
    });
}
function findUserByUsername(username, userId) {
    return db_1.default.user.findFirst({
        where: {
            username,
            NOT: { id: userId },
        },
        select: { id: true },
    });
}
function findUserByEmail(email, userId) {
    return db_1.default.user.findFirst({
        where: {
            email,
            NOT: { id: userId },
        },
        select: { id: true },
    });
}
async function updateProfileById(userId, payload) {
    const data = {};
    if (payload.username)
        data.username = payload.username;
    if (payload.email)
        data.email = payload.email;
    if (payload.password && payload.password.trim()) {
        data.password = await (0, hashPass_1.hashPass)(payload.password);
    }
    return db_1.default.user.update({
        where: { id: userId },
        data,
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createAt: true,
        },
    });
}
