"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useStageTemplateMutations, useStageTemplatesQuery } from "@/hooks/use-stage-templates";
import { isApiError } from "@/lib/api/client";
import type { StageTemplate } from "@/lib/api/types";
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

export function StagesAdminView() {
  const t = useTranslations("stagesAdmin");
  const tCommon = useTranslations("common");
  const query = useStageTemplatesQuery({ page: 1 });
  const { create, update, remove } = useStageTemplateMutations();
  const [editing, setEditing] = useState<StageTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [order, setOrder] = useState("1");
  const [formError, setFormError] = useState<string | null>(null);

  function resetForm() {
    setEditing(null);
    setShowForm(false);
    setName("");
    setNameAr("");
    setOrder("1");
    setFormError(null);
  }

  function startEdit(stage: StageTemplate) {
    setEditing(stage);
    setShowForm(true);
    setName(stage.name);
    setNameAr(stage.name_ar || "");
    setOrder(String(stage.order));
    setFormError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    const payload = {
      name: name.trim(),
      name_ar: nameAr.trim(),
      order: Number(order) || 1,
      is_active: true,
    };
    if (!payload.name) {
      setFormError(t("validation.nameRequired"));
      return;
    }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      resetForm();
    } catch (error) {
      if (isApiError(error)) {
        setFormError(error.message || t("errors.saveFailed"));
        return;
      }
      setFormError(t("errors.saveFailed"));
    }
  }

  async function onDelete(stage: StageTemplate) {
    if (!window.confirm(t("actions.deleteConfirm"))) return;
    try {
      await remove.mutateAsync(stage.id);
      if (editing?.id === stage.id) resetForm();
    } catch (error) {
      if (isApiError(error)) {
        setFormError(error.message || t("errors.saveFailed"));
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
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
        <Button
          type="button"
          className="gap-2 self-start"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("actions.add")}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? t("editTitle") : t("createTitle")}</CardTitle>
            <CardDescription>{t("formHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit} noValidate>
              {formError ? <Alert tone="danger">{formError}</Alert> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t("fields.name")}</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label>{t("fields.nameAr")}</Label>
                  <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
                </div>
                <div>
                  <Label>{t("fields.order")}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={resetForm}>
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" loading={create.isPending || update.isPending}>
                  {editing ? tCommon("save") : t("actions.add")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

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
          <CardHeader>
            <CardTitle>{t("listTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-[var(--line)] p-0">
            {query.data.results.map((stage) => (
              <div
                key={stage.id}
                className="flex items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--ink)]">{stage.name}</p>
                  {stage.name_ar ? (
                    <p className="text-sm text-[var(--muted)]" dir="rtl">
                      {stage.name_ar}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(stage)}
                    aria-label={t("actions.edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => void onDelete(stage)}
                    aria-label={t("actions.delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
