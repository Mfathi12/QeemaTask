import { Prisma } from "@prisma/client";
import type { Service } from "@prisma/client";
import { serviceRepository } from "../repositories/service.repository";
import type {
  CreateServiceDto,
  ServiceResponse,
  UpdateServiceDto,
} from "../types/service.dto";
import { AppError } from "../utils/AppError";

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2003"
  );
}

function toResponse(service: Service): ServiceResponse {
  return {
    id: service.id,
    name: service.name,
    category: service.category,
    price: service.price.toNumber(),
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}

function assertPositivePrice(price: number): void {
  if (!Number.isFinite(price) || price < 0) {
    throw AppError.badRequest("Price must be a non-negative number");
  }
}

function parseCreatePayload(body: unknown): CreateServiceDto {
  if (typeof body !== "object" || body === null) {
    throw AppError.badRequest("Invalid request body");
  }
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const category = typeof b.category === "string" ? b.category.trim() : "";
  const priceRaw = b.price;

  let price: number;
  if (typeof priceRaw === "number") {
    price = priceRaw;
  } else if (typeof priceRaw === "string") {
    price = Number.parseFloat(priceRaw);
  } else {
    throw AppError.badRequest("Price is required");
  }

  if (!name || !category) {
    throw AppError.badRequest("Name and category are required");
  }
  assertPositivePrice(price);

  return { name, category, price };
}

function parseUpdatePayload(body: unknown): UpdateServiceDto {
  if (typeof body !== "object" || body === null) {
    throw AppError.badRequest("Invalid request body");
  }
  const b = body as Record<string, unknown>;
  const result: UpdateServiceDto = {};

  if (b.name !== undefined) {
    if (typeof b.name !== "string" || !b.name.trim()) {
      throw AppError.badRequest("Name must be a non-empty string when provided");
    }
    result.name = b.name.trim();
  }
  if (b.category !== undefined) {
    if (typeof b.category !== "string" || !b.category.trim()) {
      throw AppError.badRequest(
        "Category must be a non-empty string when provided"
      );
    }
    result.category = b.category.trim();
  }
  if (b.price !== undefined) {
    let price: number;
    if (typeof b.price === "number") {
      price = b.price;
    } else if (typeof b.price === "string") {
      price = Number.parseFloat(b.price);
    } else {
      throw AppError.badRequest("Price must be a number");
    }
    assertPositivePrice(price);
    result.price = price;
  }

  if (
    result.name === undefined &&
    result.category === undefined &&
    result.price === undefined
  ) {
    throw AppError.badRequest("At least one field must be provided to update");
  }

  return result;
}

function parseServiceId(param: string | string[] | undefined): number {
  const raw =
    typeof param === "string"
      ? param
      : Array.isArray(param)
        ? param[0]
        : undefined;
  if (raw === undefined) {
    throw AppError.badRequest("Service id is required");
  }
  const id = Number.parseInt(raw, 10);
  if (!Number.isInteger(id) || id < 1) {
    throw AppError.badRequest("Invalid service id");
  }
  return id;
}

export const serviceManagement = {
  parseCreatePayload,
  parseUpdatePayload,
  parseServiceId,

  async list(): Promise<ServiceResponse[]> {
    const rows = await serviceRepository.findAll();
    return rows.map(toResponse);
  },

  async getById(id: number): Promise<ServiceResponse> {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw AppError.notFound("Service not found");
    }
    return toResponse(service);
  },

  async create(rawBody: unknown): Promise<ServiceResponse> {
    const dto = parseCreatePayload(rawBody);
    const created = await serviceRepository.create({
      name: dto.name,
      category: dto.category,
      price: new Prisma.Decimal(dto.price),
    });
    return toResponse(created);
  },

  async update(id: number, rawBody: unknown): Promise<ServiceResponse> {
    await this.getById(id);
    const dto = parseUpdatePayload(rawBody);

    const data: {
      name?: string;
      category?: string;
      price?: Prisma.Decimal;
    } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.price !== undefined) data.price = new Prisma.Decimal(dto.price);

    const updated = await serviceRepository.update(id, data);
    return toResponse(updated);
  },

  async remove(id: number): Promise<void> {
    await this.getById(id);
    try {
      await serviceRepository.delete(id);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw AppError.conflict(
          "Cannot delete this service because it is referenced by requests"
        );
      }
      throw error;
    }
  },
};
