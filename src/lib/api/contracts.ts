import { apiGet, apiSend, fetchPaginated } from "@/lib/api/client";
import type { Contract, ContractStatus } from "@/lib/api/types";

export type ContractWritePayload = {
  client: string;
  reference_code: string;
  title: string;
  title_ar?: string;
  status?: ContractStatus;
  start_date?: string | null;
  end_date?: string | null;
  planned_visits_per_month?: number | null;
  scope_summary?: string;
  notes?: string;
};

export function listContracts(params: {
  search?: string;
  page?: number;
  client?: string;
} = {}) {
  return fetchPaginated<Contract>("/contracts/", {
    search: params.search,
    client: params.client,
    ordering: "-created_at",
    page: params.page ?? 1,
  });
}

export function getContract(id: string) {
  return apiGet<Contract>(`/contracts/${id}/`);
}

export function createContract(payload: ContractWritePayload) {
  return apiSend<Contract>("/contracts/", "POST", payload);
}

export function updateContract(id: string, payload: Partial<ContractWritePayload>) {
  return apiSend<Contract>(`/contracts/${id}/`, "PATCH", payload);
}

export function deleteContract(id: string) {
  return apiSend<void>(`/contracts/${id}/`, "DELETE");
}
