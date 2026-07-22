import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContractsAdminView } from "@/components/admin/contracts-admin-view";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contractsAdmin" });
  return { title: t("title") };
}

export default async function ContractsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContractsAdminView />;
}
