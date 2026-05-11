import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import {
  adminUserRepository,
  type UserPublicRow,
} from "../repositories/adminUser.repository";
import type {
  AdminUserResponse,
  CreateAdminUserBody,
  PaginatedAdminUsersResponse,
  UpdateAdminUserBody,
} from "../types/adminUser.dto";
import { AppError } from "../utils/AppError";

const BCRYPT_ROUNDS = 12;

function toResponse(row: UserPublicRow): AdminUserResponse {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function parseAdminUserListQuery(query: Record<string, unknown>): {
  page: number;
  limit: number;
  search?: string;
} {
  const pageRaw = query["page"];
  const limitRaw = query["limit"];
  const searchRaw = query["search"];

  const page = Math.max(1, Number(pageRaw) || 1);
  const limitUncapped = Number(limitRaw) || 10;
  const limit = Math.min(100, Math.max(1, limitUncapped));

  const search =
    typeof searchRaw === "string" && searchRaw.trim()
      ? searchRaw.trim()
      : undefined;

  return { page, limit, search };
}

function parseCreateBody(body: unknown): CreateAdminUserBody {
  if (typeof body !== "object" || body === null) {
    throw AppError.badRequest("Invalid request body");
  }
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const password = typeof b.password === "string" ? b.password : "";
  const roleRaw = b.role;

  let role: Role | undefined;
  if (roleRaw !== undefined) {
    if (roleRaw !== Role.ADMIN && roleRaw !== Role.MOBILE_USER) {
      throw AppError.badRequest("role must be ADMIN or MOBILE_USER");
    }
    role = roleRaw;
  }

  if (!name || !email || !password) {
    throw AppError.badRequest("name, email, and password are required");
  }

  return {
    name,
    email,
    password,
    role,
  };
}

function parseUpdateBody(body: unknown): UpdateAdminUserBody {
  if (typeof body !== "object" || body === null) {
    throw AppError.badRequest("Invalid request body");
  }
  const b = body as Record<string, unknown>;
  const result: UpdateAdminUserBody = {};

  if (b.name !== undefined) {
    if (typeof b.name !== "string" || !b.name.trim()) {
      throw AppError.badRequest("name must be a non-empty string when provided");
    }
    result.name = b.name.trim();
  }
  if (b.email !== undefined) {
    if (typeof b.email !== "string" || !b.email.trim()) {
      throw AppError.badRequest("email must be a non-empty string when provided");
    }
    result.email = normalizeEmail(b.email);
  }
  if (b.password !== undefined) {
    if (typeof b.password !== "string" || !b.password) {
      throw AppError.badRequest("password must be a non-empty string when provided");
    }
    result.password = b.password;
  }
  if (b.role !== undefined) {
    if (b.role !== Role.ADMIN && b.role !== Role.MOBILE_USER) {
      throw AppError.badRequest("role must be ADMIN or MOBILE_USER");
    }
    result.role = b.role;
  }

  if (
    result.name === undefined &&
    result.email === undefined &&
    result.password === undefined &&
    result.role === undefined
  ) {
    throw AppError.badRequest("At least one field must be provided");
  }

  return result;
}

function parseUserId(param: string | string[] | undefined): number {
  const raw =
    typeof param === "string"
      ? param
      : Array.isArray(param)
        ? param[0]
        : undefined;
  if (raw === undefined) {
    throw AppError.badRequest("User id is required");
  }
  const id = Number.parseInt(raw, 10);
  if (!Number.isInteger(id) || id < 1) {
    throw AppError.badRequest("Invalid user id");
  }
  return id;
}

export const adminUserService = {
  parseUserId,

  async list(query: Record<string, unknown>): Promise<PaginatedAdminUsersResponse> {
    const { page, limit, search } = parseAdminUserListQuery(query);
    const { rows, total } = await adminUserRepository.findManyPaginated({
      page,
      limit,
      search,
    });
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    return {
      items: rows.map(toResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  async getById(id: number): Promise<AdminUserResponse> {
    const row = await adminUserRepository.findById(id);
    if (!row) {
      throw AppError.notFound("User not found");
    }
    return toResponse(row);
  },

  async create(body: unknown): Promise<AdminUserResponse> {
    const dto = parseCreateBody(body);
    const email = normalizeEmail(dto.email);
    const existing = await adminUserRepository.findByEmail(email);
    if (existing) {
      throw AppError.conflict("Email is already in use");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const row = await adminUserRepository.create({
      name: dto.name,
      email,
      password: passwordHash,
      role: dto.role ?? Role.MOBILE_USER,
    });
    return toResponse(row);
  },

  async update(id: number, body: unknown): Promise<AdminUserResponse> {
    const existing = await adminUserRepository.findById(id);
    if (!existing) {
      throw AppError.notFound("User not found");
    }
    const dto = parseUpdateBody(body);

    if (dto.email !== undefined) {
      const existing = await adminUserRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw AppError.conflict("Email is already in use");
      }
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
      role?: Role;
    } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.password !== undefined) {
      data.password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    }

    const row = await adminUserRepository.update(id, data);
    return toResponse(row);
  },

  async delete(actorUserId: number, targetId: number): Promise<void> {
    if (actorUserId === targetId) {
      throw AppError.badRequest("You cannot delete your own account");
    }

    const target = await adminUserRepository.findById(targetId);
    if (!target) {
      throw AppError.notFound("User not found");
    }

    if (target.role === Role.ADMIN) {
      const adminCount = await adminUserRepository.countAdmins();
      if (adminCount <= 1) {
        throw AppError.conflict("Cannot delete the last administrator");
      }
    }

    await adminUserRepository.delete(targetId);
  },
};
