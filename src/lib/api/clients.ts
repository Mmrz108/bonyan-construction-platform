import { apiSend, fetchPaginated } from "@/lib/api/client";

export type ClientStatus = "active" | "inactive";

export type Client = {
  id: string;
  code: string;
  name: string;
  name_ar: string;
  status: ClientStatus;
  tax_id: string;
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  country_code: string;
  postal_code: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type ClientWritePayload = {
  code: string;
  name: string;
  name_ar?: string;
  status?: ClientStatus;
  tax_id?: string;
  address_line1?: string;
  city?: string;
  region?: string;
  country_code?: string;
  notes?: string;
};

const PATH = "/clients/";

export function listClients(params: { search?: string; page?: number } = {}) {
  return fetchPaginated<Client>(PATH, {
    search: params.search,
    ordering: "name",
    page: params.page ?? 1,
  });
}

export function createClient(payload: ClientWritePayload) {
  return apiSend<Client>(PATH, "POST", payload);
}

export function updateClient(id: string, payload: Partial<ClientWritePayload>) {
  return apiSend<Client>(`${PATH}${id}/`, "PATCH", payload);
}

export function deleteClient(id: string) {
  return apiSend<void>(`${PATH}${id}/`, "DELETE");
}
