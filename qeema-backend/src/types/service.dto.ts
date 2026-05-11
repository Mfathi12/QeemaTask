/**
 * Input payloads for Service CRUD (HTTP bodies).
 */
export interface CreateServiceDto {
  name: string;
  category: string;
  price: number;
}

export interface UpdateServiceDto {
  name?: string;
  category?: string;
  price?: number;
}

/**
 * Serialized Service returned by the API (Decimal → number for JSON).
 */
export interface ServiceResponse {
  id: number;
  name: string;
  category: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}
