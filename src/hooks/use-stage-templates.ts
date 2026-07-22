"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStageTemplate,
  deleteStageTemplate,
  listStageTemplates,
  updateStageTemplate,
  type StageTemplateWritePayload,
} from "@/lib/api/stage-templates";

export const stageTemplateKeys = {
  all: ["stage-templates"] as const,
  lists: () => [...stageTemplateKeys.all, "list"] as const,
  list: (params: { search?: string; page?: number }) =>
    [...stageTemplateKeys.lists(), params] as const,
};

export function useStageTemplatesQuery(params: { search?: string; page?: number } = {}) {
  return useQuery({
    queryKey: stageTemplateKeys.list(params),
    queryFn: () => listStageTemplates(params),
  });
}

export function useStageTemplateMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: stageTemplateKeys.all });

  const create = useMutation({
    mutationFn: (payload: StageTemplateWritePayload) => createStageTemplate(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<StageTemplateWritePayload>;
    }) => updateStageTemplate(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteStageTemplate(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
