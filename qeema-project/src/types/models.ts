export type Role = "ADMIN" | "MOBILE_USER";

export type RequestStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  id: number;
  userId: number;
  serviceId: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  user: Pick<UserPublic, "id" | "name" | "email" | "role">;
  service: Service;
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSuccess<T> {
  success: boolean;
  message: string;
  data: T;
}
