import prisma from "../db";
import { hashPass } from "../utils/hashPass";

export interface ProfileUpdatePayload {
  username?: string;
  email?: string;
  password?: string;
}

export function getProfileById(userId: number) {
  return prisma.user.findUnique({
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

export function getFullUserById(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export function findUserByUsername(username: string, userId: number) {
  return prisma.user.findFirst({
    where: {
      username,
      NOT: { id: userId },
    },
    select: { id: true },
  });
}

export function findUserByEmail(email: string, userId: number) {
  return prisma.user.findFirst({
    where: {
      email,
      NOT: { id: userId },
    },
    select: { id: true },
  });
}

export async function updateProfileById(userId: number, payload: ProfileUpdatePayload) {
  const data: Record<string, string> = {};

  if (payload.username) data.username = payload.username;
  if (payload.email) data.email = payload.email;
  if (payload.password && payload.password.trim()) {
    data.password = await hashPass(payload.password);
  }

  return prisma.user.update({
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
