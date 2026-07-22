import { apiGet, apiSend, fetchPaginated } from "@/lib/api/client";
import type { StageTemplate } from "@/lib/api/types";

const PATH = "/stage-templates/";

export type StageTemplateWritePayload = {
  name: string;
  name_ar?: string;
  description?: string;
  order: number;
  is_active?: boolean;
};

export function listStageTemplates(params: {
  search?: string;
  is_active?: boolean;
  page?: number;
} = {}) {
  return fetchPaginated<StageTemplate>(PATH, {
    search: params.search,
    is_active:
      params.is_active === undefined ? undefined : params.is_active ? "true" : "false",
    ordering: "order",
    page: params.page ?? 1,
  });
}

export function createStageTemplate(payload: StageTemplateWritePayload) {
  return apiSend<StageTemplate>(PATH, "POST", payload);
}

export function updateStageTemplate(
  id: string,
  payload: Partial<StageTemplateWritePayload>,
) {
  return apiSend<StageTemplate>(`${PATH}${id}/`, "PATCH", payload);
}

export function deleteStageTemplate(id: string) {
  return apiSend<void>(`${PATH}${id}/`, "DELETE");
}

export function getStageTemplate(id: string) {
  return apiGet<StageTemplate>(`${PATH}${id}/`);
}
