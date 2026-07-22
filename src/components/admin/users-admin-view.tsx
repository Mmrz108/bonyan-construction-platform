"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import { useAdminUserMutations, useAdminUsersQuery } from "@/hooks/use-admin-users";
import { isApiError } from "@/lib/api/client";
import type { AdminUser } from "@/lib/api/types";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState, ErrorState, PageLoader } from "@/components/ui/states";
import { cn } from "@/lib/utils";

type TabKey = "verified" | "add" | "non_verified" | "suspended";

const ROLE_OPTIONS = [
  "CLIENT",
  "INSPECTOR",
  "SUPERVISOR",
  "PROJECT_MANAGER",
  "ADMIN",
] as const;

function formatSince(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function UsersAdminView() {
  const t = useTranslations("usersAdmin");
  const tCommon = useTranslations("common");
  const [tab, setTab] = useState<TabKey>("verified");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("CLIENT");

  const listParams = useMemo(() => {
    if (tab === "add") return null;
    if (tab === "verified") {
      return { search, page, is_active: true, is_verified: true };
    }
    if (tab === "non_verified") {
      return { search, page, is_active: true, is_verified: false };
    }
    return { search, page, is_active: false };
  }, [tab, search, page]);

  const query = useAdminUsersQuery(
    listParams ?? { page: 1, is_active: true, is_verified: true },
    tab !== "add" && listParams !== null,
  );
  const { create, update, deactivate } = useAdminUserMutations();

  const tabs: { key: TabKey; label: string }[] = [
    { key: "verified", label: t("tabs.verified") },
    { key: "add", label: t("tabs.add") },
    { key: "non_verified", label: t("tabs.nonVerified") },
    { key: "suspended", label: t("tabs.suspended") },
  ];

  function resetCreateForm() {
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setPassword("");
    setRole("CLIENT");
    setFormError(null);
  }

  function openEdit(user: AdminUser) {
    setEditing(user);
    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setPhone(user.phone_number || "");
    setRole(user.roles?.[0] || "CLIENT");
    setPassword("");
    setFormError(null);
    setSuccessMsg(null);
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMsg(null);
    try {
      await create.mutateAsync({
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim(),
        password,
        is_active: true,
        is_verified: true,
        role_codes: [role],
      });
      resetCreateForm();
      setSuccessMsg(t("successCreated"));
      setTab("verified");
      setPage(1);
      setSearch("");
    } catch (error) {
      if (isApiError(error)) {
        setFormError(error.message || t("errors.saveFailed"));
        return;
      }
      setFormError(t("errors.saveFailed"));
    }
  }

  async function onSaveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setFormError(null);
    setSuccessMsg(null);
    try {
      const payload: {
        first_name: string;
        last_name: string;
        phone_number: string;
        role_codes: string[];
        password?: string;
      } = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim(),
        role_codes: [role],
      };
      if (password.trim()) payload.password = password;
      await update.mutateAsync({ id: editing.id, payload });
      setEditing(null);
      setSuccessMsg(t("successUpdated"));
    } catch (error) {
      if (isApiError(error)) {
        setFormError(error.message || t("errors.saveFailed"));
        return;
      }
      setFormError(t("errors.saveFailed"));
    }
  }

  async function setVerified(user: AdminUser, is_verified: boolean) {
    setFormError(null);
    try {
      await update.mutateAsync({ id: user.id, payload: { is_verified } });
    } catch (error) {
      if (isApiError(error)) {
        setFormError(error.message || t("errors.saveFailed"));
      }
    }
  }

  async function setSuspended(user: AdminUser, suspend: boolean) {
    setFormError(null);
    try {
      if (suspend) {
        await deactivate.mutateAsync(user.id);
      } else {
        await update.mutateAsync({
          id: user.id,
          payload: { is_active: true },
        });
      }
    } catch (error) {
      if (isApiError(error)) {
        setFormError(error.message || t("errors.saveFailed"));
      }
    }
  }

  const totalPages = Math.max(1, Math.ceil((query.data?.count ?? 0) / 20));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
          Bonyan
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)] sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          {t("description")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-3">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setTab(item.key);
              setPage(1);
              setFormError(null);
              setEditing(null);
              if (item.key !== "add") setSuccessMsg(null);
            }}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              tab === item.key
                ? "bg-[var(--brand-tint)] text-[var(--brand-strong)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {successMsg ? <Alert tone="success">{successMsg}</Alert> : null}
      {formError && tab !== "add" && !editing ? (
        <Alert tone="danger">{formError}</Alert>
      ) : null}

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("editTitle")}</CardTitle>
            <CardDescription>{editing.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSaveEdit} noValidate>
              {formError ? <Alert tone="danger">{formError}</Alert> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t("fields.firstName")}</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <Label>{t("fields.lastName")}</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div>
                  <Label>{t("fields.phone")}</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label>{t("fields.role")}</Label>
                  <Select value={role} onChange={(e) => setRole(e.target.value)}>
                    {ROLE_OPTIONS.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("fields.newPassword")}</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("fields.newPasswordHint")}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" loading={update.isPending}>
                  {tCommon("save")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {tab === "add" ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("addTitle")}</CardTitle>
            <CardDescription>{t("addHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onCreate} noValidate>
              {formError ? <Alert tone="danger">{formError}</Alert> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>{t("fields.email")}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>{t("fields.firstName")}</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <Label>{t("fields.lastName")}</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div>
                  <Label>{t("fields.phone")}</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label>{t("fields.password")}</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("fields.role")}</Label>
                  <Select value={role} onChange={(e) => setRole(e.target.value)}>
                    {ROLE_OPTIONS.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={create.isPending}>
                  {t("actions.create")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              className="max-w-sm"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {query.isPending ? <PageLoader label={tCommon("loading")} /> : null}

          {query.isError ? (
            <ErrorState
              title={t("errors.load")}
              description={t("errors.loadHint")}
              onRetry={() => void query.refetch()}
              retryLabel={tCommon("retry")}
            />
          ) : null}

          {query.isSuccess && query.data.results.length === 0 ? (
            <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
          ) : null}

          {query.isSuccess && query.data.results.length > 0 ? (
            <Card>
              <CardContent className="divide-y divide-[var(--line)] p-0">
                {query.data.results.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--muted)]">
                        #{index + 1 + (page - 1) * 20}
                      </p>
                      <p className="font-medium text-[var(--ink)]">
                        {user.full_name || user.email}
                      </p>
                      <p className="text-sm text-[var(--muted)]">{user.email}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {t("fields.since")}: {formatSince(user.created_at, "en")}
                        {user.roles?.length
                          ? ` · ${user.roles.join(", ")}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => openEdit(user)}
                        className="gap-1.5"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {t("actions.edit")}
                      </Button>
                      {tab === "verified" ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => void setVerified(user, false)}
                          >
                            {t("actions.unverify")}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => void setSuspended(user, true)}
                          >
                            {t("actions.suspend")}
                          </Button>
                        </>
                      ) : null}
                      {tab === "non_verified" ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void setVerified(user, true)}
                          >
                            {t("actions.verify")}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => void setSuspended(user, true)}
                          >
                            {t("actions.suspend")}
                          </Button>
                        </>
                      ) : null}
                      {tab === "suspended" ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void setSuspended(user, false)}
                        >
                          {t("actions.reactivate")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {query.isSuccess && query.data.count > 20 ? (
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t("actions.prev")}
              </Button>
              <p className="text-sm text-[var(--muted)]">
                {t("pagination", { page, pages: totalPages, count: query.data.count })}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("actions.next")}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
