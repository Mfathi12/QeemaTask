import { Role, type Prisma } from "@prisma/client";
import { prisma } from "./prismaClient";

const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserPublicRow = Prisma.UserGetPayload<{ select: typeof publicSelect }>;

function buildSearchWhere(search: string | undefined): Prisma.UserWhereInput {
  const q = search?.trim();
  if (!q) {
    return {};
  }
  return {
    OR: [
      { name: { contains: q } },
      { email: { contains: q } },
    ],
  };
}

export const adminUserRepository = {
  async findManyPaginated(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ rows: UserPublicRow[]; total: number }> {
    const where = buildSearchWhere(params.search);
    const skip = (params.page - 1) * params.limit;

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: publicSelect,
        orderBy: { id: "desc" },
        skip,
        take: params.limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { rows, total };
  },

  async findById(id: number): Promise<UserPublicRow | null> {
    return prisma.user.findUnique({
      where: { id },
      select: publicSelect,
    });
  },

  async findByEmail(email: string): Promise<{ id: number } | null> {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  },

  async create(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) {
    return prisma.user.create({
      data,
      select: publicSelect,
    });
  },

  async update(
    id: number,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: Role;
    }
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: publicSelect,
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  },

  async countAdmins(): Promise<number> {
    return prisma.user.count({
      where: { role: Role.ADMIN },
    });
  },
};
