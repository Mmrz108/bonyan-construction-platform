import { getTranslations, setRequestLocale } from "next-intl/server";
import { UsersAdminView } from "@/components/admin/users-admin-view";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "usersAdmin" });
  return { title: t("title") };
}

export default async function UsersPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <UsersAdminView />;
}
