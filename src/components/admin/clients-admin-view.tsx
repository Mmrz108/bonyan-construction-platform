"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useClientMutations, useClientsQuery } from "@/hooks/use-clients";
import { isApiError } from "@/lib/api/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState, ErrorState, PageLoader } from "@/components/ui/states";

export function ClientsAdminView() {
  const t = useTranslations("clientsAdmin");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");

  const query = useClientsQuery({ search, page });
  const { create, remove } = useClientMutations();
  const totalPages = Math.max(1, Math.ceil((query.data?.count ?? 0) / 20));

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    try {
      await create.mutateAsync({
        code: code.trim(),
        name: name.trim(),
        city: city.trim(),
        region: region.trim(),
        status: "active",
        country_code: "OM",
      });
      setCode("");
      setName("");
      setCity("");
      setRegion("");
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
        <Button
          type="button"
          className="gap-2 self-start"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="h-4 w-4" />
          {showForm ? t("actions.closeForm") : t("actions.add")}
        </Button>
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
                <div>
                  <Label>{t("fields.code")}</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} required />
                </div>
                <div>
                  <Label>{t("fields.name")}</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label>{t("fields.city")}</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <Label>{t("fields.region")}</Label>
                  <Input value={region} onChange={(e) => setRegion(e.target.value)} />
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
            {query.data.results.map((client) => (
              <div
                key={client.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-[var(--ink)]">{client.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {client.code}
                    {client.city ? ` · ${client.city}` : ""}
                    {client.region ? ` · ${client.region}` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm(t("actions.deleteConfirm"))) {
                      void remove.mutateAsync(client.id);
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
