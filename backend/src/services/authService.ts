import prisma from "../db";
import { comparePass, hashPass } from "../utils/hashPass";

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email?: string;
  username?: string;
  password: string;
}

export function findUserForRegister(email: string, username: string) {
  return prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true },
  });
}

export async function registerUser(payload: RegisterPayload) {
  const hashedPass = await hashPass(payload.password);

  return prisma.user.create({
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

export function findUserForLogin(payload: LoginPayload) {
  return prisma.user.findFirst({
    where: payload.email ? { email: payload.email } : { username: payload.username! },
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

export function verifyPassword(password: string, hash: string) {
  return comparePass(password, hash);
}
