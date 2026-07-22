import { getTranslations, setRequestLocale } from "next-intl/server";
import { StagesAdminView } from "@/components/admin/stages-admin-view";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "stagesAdmin" });
  return { title: t("title") };
}

export default async function StagesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StagesAdminView />;
}
