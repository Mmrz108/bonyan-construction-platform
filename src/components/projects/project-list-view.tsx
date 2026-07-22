"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Plus } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { canManageProjects } from "@/lib/auth/permissions";
import { useProjectsQuery } from "@/hooks/use-projects";
import type { ProjectListParams } from "@/lib/api/types";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectStatusBadge } from "@/components/projects/status-badges";
import { ProjectForm } from "@/components/projects/project-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState, ErrorState, PageLoader } from "@/components/ui/states";

export function ProjectListView() {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const canManage = canManageProjects(user?.roles);
  const [filters, setFilters] = useState<ProjectListParams>({
    page: 1,
    ordering: "-created_at",
  });
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (canManage && searchParams.get("create") === "1") {
      setShowCreate(true);
    }
  }, [canManage, searchParams]);

  const query = useProjectsQuery(filters);
  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.count / 20));
  }, [query.data]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
        {canManage ? (
          <Button
            type="button"
            onClick={() => setShowCreate((open) => !open)}
            className="gap-2 self-start"
          >
            <Plus className="h-4 w-4" />
            {showCreate ? t("actions.closeForm") : t("actions.create")}
          </Button>
        ) : null}
      </div>

      {showCreate && canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("createTitle")}</CardTitle>
            <CardDescription>{t("createHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm
              onCancel={() => setShowCreate(false)}
              onSuccess={(project) => {
                setShowCreate(false);
                router.push(`/projects/${project.id}`);
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <ProjectFilters value={filters} onChange={setFilters} />

      {query.isPending ? <PageLoader label={tCommon("loading")} /> : null}

      {query.isError ? (
        <ErrorState
          title={t("errors.loadList")}
          description={t("errors.loadListHint")}
          onRetry={() => void query.refetch()}
          retryLabel={tCommon("retry")}
        />
      ) : null}

      {query.isSuccess && query.data.results.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={
            canManage ? (
              <Button type="button" onClick={() => setShowCreate(true)}>
                {t("actions.create")}
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {query.isSuccess && query.data.results.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {query.data.results.map((project) => {
              const displayName =
                locale === "ar" && project.name_ar
                  ? project.name_ar
                  : project.name;
              const region =
                project.assigned_region?.trim() ||
                project.locations?.find((row) => row.is_primary)?.region ||
                project.locations?.[0]?.region ||
                "";
              const mapsUrl =
                project.latitude && project.longitude
                  ? `https://www.google.com/maps?q=${project.latitude},${project.longitude}`
                  : null;

              return (
                <article
                  key={project.id}
                  className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--surface-elevated)] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                        {displayName}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-[var(--brand)]">
                        {t("fields.projectNo")}: {project.code || "—"}
                      </p>
                    </div>
                    <ProjectStatusBadge status={project.status} />
                  </div>

                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-[var(--muted)]">{t("fields.region")}</dt>
                      <dd className="text-end font-medium text-[var(--ink)]">
                        {region || t("regionNotAssigned")}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[var(--muted)]">{t("fields.assignUser")}</dt>
                      <dd className="max-w-[60%] truncate text-end font-medium text-[var(--ink)]">
                        {project.client_user_email ||
                          project.members?.find((m) => m.is_active)?.user_email ||
                          t("assignUserNone")}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[var(--muted)]">{t("fields.type")}</dt>
                      <dd className="text-end font-medium text-[var(--ink)]">
                        {t(`type.${project.project_type}`)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[var(--muted)]">
                        {t("fields.supervision")}
                      </dt>
                      <dd className="text-end font-medium text-[var(--ink)]">
                        {t(
                          `supervision.${project.supervision_type ?? "visit_basis"}`,
                        )}
                      </dd>
                    </div>
                    {project.client_name ? (
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--muted)]">{t("fields.client")}</dt>
                        <dd className="text-end font-medium text-[var(--ink)]">
                          {project.client_name}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--line)] pt-4">
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex h-9 items-center rounded-md border border-[var(--line)] bg-[var(--surface-elevated)] px-3 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-muted)]"
                    >
                      {t("actions.viewProject")}
                    </Link>
                    <Link
                      href={`/projects/${project.id}?tab=overview`}
                      className="inline-flex h-9 items-center rounded-md border border-[var(--line)] px-3 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-muted)]"
                    >
                      {t("actions.viewSite")}
                    </Link>
                    {mapsUrl ? (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center rounded-md bg-[var(--brand)] px-3 text-sm font-medium text-[var(--brand-contrast)] hover:bg-[var(--brand-strong)]"
                      >
                        {t("actions.openLocation")}
                      </a>
                    ) : (
                      <span className="inline-flex h-9 items-center rounded-md px-3 text-sm text-[var(--muted)]">
                        {t("actions.openLocation")}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
            <p>
              {t("pagination", {
                count: query.data.count,
                page: filters.page ?? 1,
                pages: totalPages,
              })}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={(filters.page ?? 1) <= 1}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(1, (prev.page ?? 1) - 1),
                  }))
                }
              >
                {t("actions.prev")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={(filters.page ?? 1) >= totalPages}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: (prev.page ?? 1) + 1,
                  }))
                }
              >
                {t("actions.next")}
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
