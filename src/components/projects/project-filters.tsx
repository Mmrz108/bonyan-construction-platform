"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  PROJECT_TYPES,
  SUPERVISION_TYPES,
} from "@/lib/validations/projects";
import type {
  ProjectListParams,
  ProjectType,
  SupervisionType,
} from "@/lib/api/types";

type ProjectFiltersProps = {
  value: ProjectListParams;
  onChange: (next: ProjectListParams) => void;
};

export function ProjectFilters({ value, onChange }: ProjectFiltersProps) {
  const t = useTranslations("projects");
  const [search, setSearch] = useState(value.search ?? "");

  useEffect(() => {
    setSearch(value.search ?? "");
  }, [value.search]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if ((value.search ?? "") !== search) {
        onChange({ ...value, search, page: 1 });
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [search, onChange, value]);

  const hasFilters =
    Boolean(value.search) ||
    Boolean(value.project_type) ||
    Boolean(value.supervision_type);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-elevated)] p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[14rem] flex-1">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          {t("searchLabel")}
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-9"
            aria-label={t("searchLabel")}
          />
        </div>
      </div>

      <div className="w-full sm:w-48">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          {t("filterType")}
        </label>
        <Select
          value={value.project_type ?? ""}
          onChange={(event) =>
            onChange({
              ...value,
              project_type: (event.target.value || "") as ProjectType | "",
              page: 1,
            })
          }
        >
          <option value="">{t("filterAllTypes")}</option>
          <option value="commercial">{t("type.commercial")}</option>
          <option value="residential">{t("type.residential")}</option>
          {PROJECT_TYPES.filter(
            (type) => type !== "commercial" && type !== "residential",
          ).map((type) => (
            <option key={type} value={type}>
              {t(`type.${type}`)}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-full sm:w-56">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          {t("filterSupervision")}
        </label>
        <Select
          value={value.supervision_type ?? ""}
          onChange={(event) =>
            onChange({
              ...value,
              supervision_type: (event.target.value ||
                "") as SupervisionType | "",
              page: 1,
            })
          }
        >
          <option value="">{t("filterAllSupervision")}</option>
          {SUPERVISION_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`supervision.${type}`)}
            </option>
          ))}
        </Select>
      </div>

      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("");
            onChange({ page: 1, ordering: value.ordering });
          }}
          className="gap-1.5"
        >
          <X className="h-4 w-4" />
          {t("clearFilters")}
        </Button>
      ) : null}
    </div>
  );
}
