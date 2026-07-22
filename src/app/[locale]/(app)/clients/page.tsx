import { getTranslations, setRequestLocale } from "next-intl/server";
import { ClientsAdminView } from "@/components/admin/clients-admin-view";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "clientsAdmin" });
  return { title: t("title") };
}

export default async function ClientsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ClientsAdminView />;
}
