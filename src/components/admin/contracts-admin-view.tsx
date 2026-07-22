"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useClientsQuery } from "@/hooks/use-clients";
import {
  useContractMutations,
  useContractsAdminQuery,
} from "@/hooks/use-contracts-admin";
import { isApiError } from "@/lib/api/client";
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
import { Link } from "@/i18n/navigation";

export function ContractsAdminView() {
  const t = useTranslations("contractsAdmin");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [clientId, setClientId] = useState("");
  const [reference, setReference] = useState("");
  const [title, setTitle] = useState("");
  const [visitsPerMonth, setVisitsPerMonth] = useState("4");

  const clients = useClientsQuery({ page: 1 });
  const query = useContractsAdminQuery({ search, page });
  const { create, remove } = useContractMutations();
  const totalPages = Math.max(1, Math.ceil((query.data?.count ?? 0) / 20));

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!clientId) {
      setFormError(t("validation.clientRequired"));
      return;
    }
    try {
      await create.mutateAsync({
        client: clientId,
        reference_code: reference.trim(),
        title: title.trim(),
        status: "active",
        planned_visits_per_month: Number(visitsPerMonth) || null,
      });
      setClientId("");
      setReference("");
      setTitle("");
      setVisitsPerMonth("4");
      setShowForm(false);
      setPage(1);
    } catch (error) {
      if (isApiError(error)) {
        setFormError(error.message || t("errors.saveFailed"));
        return;
      }
      setFormError(t("errors.saveFailed"));
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
            Bonyan
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{t("description")}</p>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <Link
            href="/clients"
            className="inline-flex h-10 items-center rounded-md border border-[var(--line)] px-3 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-muted)]"
          >
            {t("actions.manageClients")}
          </Link>
          <Button type="button" className="gap-2" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            {showForm ? t("actions.closeForm") : t("actions.add")}
          </Button>
        </div>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("createTitle")}</CardTitle>
            <CardDescription>{t("createHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onCreate} noValidate>
              {formError ? <Alert tone="danger">{formError}</Alert> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>{t("fields.client")}</Label>
                  <Select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                  >
                    <option value="">{t("fields.clientPlaceholder")}</option>
                    {(clients.data?.results ?? []).map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.code} — {client.name}
                      </option>
                    ))}
                  </Select>
                  {(clients.data?.results.length ?? 0) === 0 ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {t("hints.needClient")}{" "}
                      <Link href="/clients" className="text-[var(--brand)] underline">
                        {t("actions.manageClients")}
                      </Link>
                    </p>
                  ) : null}
                </div>
                <div>
                  <Label>{t("fields.reference")}</Label>
                  <Input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>{t("fields.visitsPerMonth")}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={visitsPerMonth}
                    onChange={(e) => setVisitsPerMonth(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("fields.title")}</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={create.isPending}>
                  {t("actions.add")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Input
        className="max-w-sm"
        placeholder={t("searchPlaceholder")}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

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
            {query.data.results.map((contract) => (
              <div
                key={contract.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-[var(--ink)]">{contract.title}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {contract.reference_code}
                    {contract.client_name ? ` · ${contract.client_name}` : ""}
                    {contract.planned_visits_per_month != null
                      ? ` · ${t("fields.visitsShort", {
                          count: contract.planned_visits_per_month,
                        })}`
                      : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm(t("actions.deleteConfirm"))) {
                      void remove.mutateAsync(contract.id);
                    }
                  }}
                >
                  {t("actions.delete")}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {query.isSuccess && query.data.count > 20 ? (
        <div className="flex justify-between gap-3">
          <Button
            type="button"
            size="sm"
            variant="secondary"
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
            size="sm"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("actions.next")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
