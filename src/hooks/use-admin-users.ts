"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminUser,
  deactivateAdminUser,
  listAdminUsers,
  updateAdminUser,
  type AdminUserListParams,
  type AdminUserWritePayload,
} from "@/lib/api/admin-users";

export const adminUserKeys = {
  all: ["admin-users"] as const,
  lists: () => [...adminUserKeys.all, "list"] as const,
  list: (params: AdminUserListParams) => [...adminUserKeys.lists(), params] as const,
};

export function useAdminUsersQuery(params: AdminUserListParams, enabled = true) {
  return useQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: () => listAdminUsers(params),
    enabled,
  });
}

export function useAdminUserMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: adminUserKeys.all });

  const create = useMutation({
    mutationFn: (payload: AdminUserWritePayload) => createAdminUser(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<AdminUserWritePayload>;
    }) => updateAdminUser(id, payload),
    onSuccess: invalidate,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => deactivateAdminUser(id),
    onSuccess: invalidate,
  });

  return { create, update, deactivate };
}
