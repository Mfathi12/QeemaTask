import type { Prisma, RequestStatus } from "@prisma/client";
import { prisma } from "./prismaClient";

const requestInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  service: true,
} satisfies Prisma.RequestInclude;

export type RequestWithRelations = Prisma.RequestGetPayload<{
  include: typeof requestInclude;
}>;

export const requestRepository = {
  async create(userId: number, serviceId: number): Promise<RequestWithRelations> {
    return prisma.request.create({
      data: {
        userId,
        serviceId,
      },
      include: requestInclude,
    });
  },

  async findById(id: number): Promise<RequestWithRelations | null> {
    return prisma.request.findUnique({
      where: { id },
      include: requestInclude,
    });
  },

  async findManyForUser(userId: number): Promise<RequestWithRelations[]> {
    return prisma.request.findMany({
      where: { userId },
      include: requestInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async findAll(): Promise<RequestWithRelations[]> {
    return prisma.request.findMany({
      include: requestInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async updateStatus(id: number, status: RequestStatus): Promise<RequestWithRelations> {
    return prisma.request.update({
      where: { id },
      data: { status },
      include: requestInclude,
    });
  },
};
