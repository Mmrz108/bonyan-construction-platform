"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContract,
  deleteContract,
  listContracts,
  updateContract,
  type ContractWritePayload,
} from "@/lib/api/contracts";

export const contractKeys = {
  all: ["contracts"] as const,
  lists: () => [...contractKeys.all, "list"] as const,
  list: (params: { search?: string; page?: number }) =>
    [...contractKeys.lists(), params] as const,
};

export function useContractsAdminQuery(
  params: { search?: string; page?: number } = {},
) {
  return useQuery({
    queryKey: contractKeys.list(params),
    queryFn: () => listContracts(params),
  });
}

export function useContractMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: contractKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["contracts"] });
  };

  return {
    create: useMutation({
      mutationFn: (payload: ContractWritePayload) => createContract(payload),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string;
        payload: Partial<ContractWritePayload>;
      }) => updateContract(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteContract(id),
      onSuccess: invalidate,
    }),
  };
}
