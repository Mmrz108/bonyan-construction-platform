import { apiSend, fetchPaginated } from "@/lib/api/client";
import type { AdminUser } from "@/lib/api/types";

const PATH = "/admin/users/";

export type AdminUserListParams = {
  search?: string;
  is_active?: boolean;
  is_verified?: boolean;
  page?: number;
};

export type AdminUserWritePayload = {
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  password?: string;
  is_active?: boolean;
  is_verified?: boolean;
  role_codes?: string[];
};

export function listAdminUsers(params: AdminUserListParams = {}) {
  return fetchPaginated<AdminUser>(PATH, {
    search: params.search,
    is_active:
      params.is_active === undefined ? undefined : params.is_active ? "true" : "false",
    is_verified:
      params.is_verified === undefined
        ? undefined
        : params.is_verified
          ? "true"
          : "false",
    ordering: "-created_at",
    page: params.page ?? 1,
  });
}

export function createAdminUser(payload: AdminUserWritePayload) {
  return apiSend<AdminUser>(PATH, "POST", payload);
}

export function updateAdminUser(id: string, payload: Partial<AdminUserWritePayload>) {
  return apiSend<AdminUser>(`${PATH}${id}/`, "PATCH", payload);
}

export function deactivateAdminUser(id: string) {
  return apiSend<void>(`${PATH}${id}/`, "DELETE");
}
