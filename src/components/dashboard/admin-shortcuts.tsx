"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  FolderKanban,
  FolderPlus,
  Layers,
  Users,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { fetchCount } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { isElevated } from "@/lib/auth/roles";
import { useAuth } from "@/components/providers/auth-provider";

type Shortcut = {
  href: string;
  labelKey: "viewProjects" | "createProject" | "addStages" | "userAccess";
  countKey: "projects" | "stages" | "users";
  icon: typeof FolderKanban;
  tone: string;
};

const SHORTCUTS: Shortcut[] = [
  {
    href: "/projects",
    labelKey: "viewProjects",
    countKey: "projects",
    icon: FolderKanban,
    tone: "bg-[color-mix(in_srgb,#2563eb_14%,white)] text-[#1d4ed8]",
  },
  {
    href: "/projects?create=1",
    labelKey: "createProject",
    countKey: "projects",
    icon: FolderPlus,
    tone: "bg-[color-mix(in_srgb,#16a34a_14%,white)] text-[#15803d]",
  },
  {
    href: "/stages",
    labelKey: "addStages",
    countKey: "stages",
    icon: Layers,
    tone: "bg-[color-mix(in_srgb,#0d9488_14%,white)] text-[#0f766e]",
  },
  {
    href: "/users",
    labelKey: "userAccess",
    countKey: "users",
    icon: Users,
    tone: "bg-[color-mix(in_srgb,#7c3aed_14%,white)] text-[#6d28d9]",
  },
];

export function AdminShortcuts() {
  const t = useTranslations("dashboard.adminShortcuts");
  const { user } = useAuth();
  const elevated = isElevated(user?.roles);

  const counts = useQuery({
    queryKey: ["admin-dashboard-shortcuts"],
    enabled: elevated,
    queryFn: async () => {
      const [projects, stages, users, scheduled, completed, cancelled] =
        await Promise.all([
          fetchCount("/projects/"),
          fetchCount("/stage-templates/"),
          fetchCount("/admin/users/", { is_active: "true" }),
          fetchCount("/site-visits/", { status: "scheduled" }),
          fetchCount("/site-visits/", { status: "completed" }),
          fetchCount("/site-visits/", { status: "cancelled" }),
        ]);
      return { projects, stages, users, scheduled, completed, cancelled };
    },
  });

  if (!elevated) return null;

  const data = counts.data;

  return (
    <section className="space-y-4" aria-label={t("section")}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SHORTCUTS.map((item) => {
          const Icon = item.icon;
          const value =
            item.countKey === "projects"
              ? (data?.projects ?? "—")
              : item.countKey === "stages"
                ? (data?.stages ?? "—")
                : (data?.users ?? "—");
          return (
            <Link
              key={item.href + item.labelKey}
              href={item.href}
              className={cn(
                "rounded-lg border border-[var(--line)] bg-[var(--surface-elevated)] p-4 transition-colors hover:border-[var(--brand-soft)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                    {t(item.labelKey)}
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-3xl tabular-nums text-[var(--ink)]">
                    {value}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-md",
                    item.tone,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-[var(--ink)]">
          {t("visitRequests")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <VisitStatusCard
            label={t("pending")}
            value={data?.scheduled ?? "—"}
            tone="warning"
          />
          <VisitStatusCard
            label={t("approved")}
            value={data?.completed ?? "—"}
            tone="success"
          />
          <VisitStatusCard
            label={t("rejected")}
            value={data?.cancelled ?? "—"}
            tone="danger"
          />
        </div>
      </div>
    </section>
  );
}

function VisitStatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "warning" | "success" | "danger";
}) {
  const tones = {
    warning: "border-[color-mix(in_srgb,var(--accent)_35%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_10%,white)]",
    success: "border-[var(--success-soft)] bg-[var(--success-tint)]",
    danger: "border-[var(--danger-soft)] bg-[var(--danger-tint)]",
  };
  return (
    <div className={cn("rounded-lg border p-4", tones[tone])}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl tabular-nums text-[var(--ink)]">
        {value}
      </p>
    </div>
  );
}
