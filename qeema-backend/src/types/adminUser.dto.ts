import type { Role } from "@prisma/client";

/** User returned by admin APIs (never includes password). */
export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminUserBody {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UpdateAdminUserBody {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedAdminUsersResponse {
  items: AdminUserResponse[];
  pagination: PaginationMeta;
}
