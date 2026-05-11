import { Prisma } from "@prisma/client";
import type { Service } from "@prisma/client";
import { prisma } from "./prismaClient";

export type ServiceCreateInput = {
  name: string;
  category: string;
  price: Prisma.Decimal;
};

export type ServiceUpdateInput = {
  name?: string;
  category?: string;
  price?: Prisma.Decimal;
};

export const serviceRepository = {
  async findAll(): Promise<Service[]> {
    return prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: number): Promise<Service | null> {
    return prisma.service.findUnique({
      where: { id },
    });
  },

  async create(data: ServiceCreateInput): Promise<Service> {
    return prisma.service.create({
      data,
    });
  },

  async update(id: number, data: ServiceUpdateInput): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data,
    });
  },

  async delete(id: number): Promise<Service> {
    return prisma.service.delete({
      where: { id },
    });
  },
};
