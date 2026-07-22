"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createClient,
  deleteClient,
  listClients,
  updateClient,
  type ClientWritePayload,
} from "@/lib/api/clients";

export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (params: { search?: string; page?: number }) =>
    [...clientKeys.lists(), params] as const,
};

export function useClientsQuery(params: { search?: string; page?: number } = {}) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => listClients(params),
  });
}

export function useClientMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: clientKeys.all });

  return {
    create: useMutation({
      mutationFn: (payload: ClientWritePayload) => createClient(payload),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string;
        payload: Partial<ClientWritePayload>;
      }) => updateClient(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteClient(id),
      onSuccess: invalidate,
    }),
  };
}
