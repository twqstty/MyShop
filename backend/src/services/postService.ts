import prisma from "../db";

export interface PostPayload {
  title?: string;
  content?: string | null;
}

export function getPosts() {
  return prisma.post.findMany({
    orderBy: { id: "desc" },
    include: { author: { select: { id: true, username: true, email: true } } },
  });
}

export function getPostById(id: number) {
  return prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, username: true, email: true } } },
  });
}

export function createPost(authorId: number, payload: Required<Pick<PostPayload, "title">> & PostPayload) {
  return prisma.post.create({
    data: {
      title: payload.title,
      content: payload.content ?? null,
      authorId,
    },
  });
}

export function updatePost(id: number, payload: PostPayload) {
  return prisma.post.update({
    where: { id },
    data: {
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.content !== undefined ? { content: payload.content } : {}),
    },
  });
}

export function deletePost(id: number) {
  return prisma.post.delete({ where: { id } });
}
